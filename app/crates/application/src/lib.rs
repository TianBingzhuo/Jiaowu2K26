//! SmartCourse use cases and repository ports.

use async_trait::async_trait;
use j2k26_domain::{
    DomainError, GeneratedObject, InteractionCommand, PublishCommand, PublishedVersion, Replay,
    ReviewCommand, ReviewEvent, StudentInteraction, apply_review_command,
    create_student_interaction, publish_object,
};
use std::sync::Arc;
use thiserror::Error;
use uuid::Uuid;

pub mod ai;

#[derive(Debug, Error)]
pub enum RepositoryError {
    #[error("object not found: {0}")]
    NotFound(String),
    #[error("concurrent update conflict for object: {0}")]
    Conflict(String),
    #[error("repository data is invalid: {0}")]
    InvalidData(String),
    #[error("repository unavailable: {0}")]
    Unavailable(String),
}

#[async_trait]
pub trait GeneratedObjectRepository: Send + Sync {
    async fn insert_if_absent(&self, object: &GeneratedObject) -> Result<(), RepositoryError>;

    async fn get(&self, object_id: &str) -> Result<GeneratedObject, RepositoryError>;

    async fn commit_review(
        &self,
        previous_revision: u64,
        object: &GeneratedObject,
        event: &ReviewEvent,
    ) -> Result<(), RepositoryError>;

    async fn commit_publication(
        &self,
        previous_revision: u64,
        object: &GeneratedObject,
        event: &ReviewEvent,
        version: &PublishedVersion,
    ) -> Result<(), RepositoryError>;

    async fn commit_interaction(
        &self,
        object_id: &str,
        interaction: &StudentInteraction,
    ) -> Result<(), RepositoryError>;

    async fn replay(&self, object_id: &str) -> Result<Replay, RepositoryError>;
}

#[derive(Debug, Error)]
pub enum ServiceError {
    #[error(transparent)]
    Domain(#[from] DomainError),
    #[error(transparent)]
    Repository(#[from] RepositoryError),
}

#[derive(Clone)]
pub struct SmartCourseService {
    repository: Arc<dyn GeneratedObjectRepository>,
}

impl SmartCourseService {
    #[must_use]
    pub fn new(repository: Arc<dyn GeneratedObjectRepository>) -> Self {
        Self { repository }
    }

    pub async fn seed_fixture(&self, fixture_json: &str) -> Result<(), ServiceError> {
        let object: GeneratedObject = serde_json::from_str(fixture_json)
            .map_err(|error| RepositoryError::InvalidData(error.to_string()))?;
        object.validate()?;
        self.repository.insert_if_absent(&object).await?;
        Ok(())
    }

    pub async fn get(&self, object_id: &str) -> Result<GeneratedObject, ServiceError> {
        Ok(self.repository.get(object_id).await?)
    }

    pub async fn review(
        &self,
        object_id: &str,
        command: ReviewCommand,
    ) -> Result<(GeneratedObject, ReviewEvent), ServiceError> {
        let mut object = self.repository.get(object_id).await?;
        let previous_revision = object.revision;
        let event = apply_review_command(
            &mut object,
            format!("review-event-{}", Uuid::new_v4()),
            command,
        )?;
        self.repository
            .commit_review(previous_revision, &object, &event)
            .await?;
        Ok((object, event))
    }

    pub async fn publish(
        &self,
        object_id: &str,
        command: PublishCommand,
    ) -> Result<(GeneratedObject, PublishedVersion), ServiceError> {
        let mut object = self.repository.get(object_id).await?;
        let previous_revision = object.revision;
        let next_version = self
            .repository
            .replay(object_id)
            .await?
            .published_versions
            .len() as u64
            + 1;
        let (event, version) = publish_object(
            &mut object,
            format!("review-event-{}", Uuid::new_v4()),
            format!("published-version-{}", Uuid::new_v4()),
            next_version,
            command,
        )?;
        self.repository
            .commit_publication(previous_revision, &object, &event, &version)
            .await?;
        Ok((object, version))
    }

    pub async fn replay(&self, object_id: &str) -> Result<Replay, ServiceError> {
        Ok(self.repository.replay(object_id).await?)
    }

    pub async fn interact(
        &self,
        object_id: &str,
        command: InteractionCommand,
    ) -> Result<StudentInteraction, ServiceError> {
        let replay = self.repository.replay(object_id).await?;
        let published_version =
            replay
                .published_versions
                .last()
                .ok_or_else(|| DomainError::InvalidTransition {
                    from: replay.object.review_state.to_string(),
                    action: "interact".to_owned(),
                })?;
        let interaction = create_student_interaction(
            &replay.object,
            published_version,
            format!("student-interaction-{}", Uuid::new_v4()),
            command,
        )?;
        self.repository
            .commit_interaction(object_id, &interaction)
            .await?;
        Ok(interaction)
    }
}

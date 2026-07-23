//! Platform-independent SmartCourse domain contracts for the Phase 0 slice.
//!
//! This crate deliberately contains no HTTP, SQL, filesystem, UI, or operating-system types.

use serde::{Deserialize, Serialize};
use std::fmt::{Display, Formatter};
use thiserror::Error;

pub const SCHEMA_VERSION: &str = "1.0.0";

#[derive(Clone, Debug, Eq, Hash, PartialEq, Serialize, Deserialize)]
#[serde(transparent)]
pub struct ReviewState(String);

impl ReviewState {
    pub const APPROVED: &'static str = "approved";
    pub const DRAFT: &'static str = "draft";
    pub const PUBLISHED: &'static str = "published";
    pub const REJECTED: &'static str = "rejected";
    pub const REMOVED: &'static str = "removed";
    pub const REVIEW: &'static str = "review";
    pub const WITHDRAWN: &'static str = "withdrawn";

    #[must_use]
    pub fn from_wire(value: impl Into<String>) -> Self {
        Self(value.into())
    }

    #[must_use]
    pub fn draft() -> Self {
        Self::from_wire(Self::DRAFT)
    }

    #[must_use]
    pub fn as_str(&self) -> &str {
        &self.0
    }

    #[must_use]
    pub fn is_known(&self) -> bool {
        matches!(
            self.as_str(),
            Self::APPROVED
                | Self::DRAFT
                | Self::PUBLISHED
                | Self::REJECTED
                | Self::REMOVED
                | Self::REVIEW
                | Self::WITHDRAWN
        )
    }
}

impl Display for ReviewState {
    fn fmt(&self, formatter: &mut Formatter<'_>) -> std::fmt::Result {
        formatter.write_str(self.as_str())
    }
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
pub struct Material {
    pub schema_version: String,
    pub id: String,
    pub course_id: String,
    pub rights_status: String,
    pub sha256: String,
    pub uploaded_by: String,
    pub fixture: bool,
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
pub struct SourceFragment {
    pub schema_version: String,
    pub id: String,
    pub material_id: String,
    pub locator: String,
    pub source_type: String,
    pub text: String,
    pub valid: bool,
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
pub struct EvidenceItem {
    pub id: String,
    pub source_fragment_id: String,
    pub source_ref: String,
    pub source_type: String,
    pub quote: String,
    pub summary: String,
    pub confidence: Option<f64>,
    pub teacher_action: Option<String>,
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
pub struct GeneratedObject {
    pub schema_version: String,
    pub id: String,
    pub course_id: String,
    pub kind: String,
    pub body: String,
    pub source_ids: Vec<String>,
    pub evidence: Vec<EvidenceItem>,
    pub evidence_status: String,
    pub unknowns: Vec<String>,
    pub generation_mode: String,
    pub generator_version: String,
    pub review_state: ReviewState,
    pub revision: u64,
    pub fixture: bool,
}

impl GeneratedObject {
    pub fn validate(&self) -> Result<(), DomainError> {
        require_supported_schema(&self.schema_version)?;
        require_non_empty("id", &self.id)?;
        require_non_empty("course_id", &self.course_id)?;
        require_non_empty("kind", &self.kind)?;
        require_non_empty("body", &self.body)?;

        if self.source_ids.is_empty() {
            return Err(DomainError::InvariantViolation(
                "a generated object needs at least one source id".to_owned(),
            ));
        }
        if self.evidence.is_empty() {
            return Err(DomainError::InvariantViolation(
                "a generated object needs at least one evidence item".to_owned(),
            ));
        }
        for item in &self.evidence {
            if !self.source_ids.contains(&item.source_fragment_id) {
                return Err(DomainError::InvariantViolation(format!(
                    "evidence {} points to a source outside source_ids",
                    item.id
                )));
            }
            if item
                .confidence
                .is_some_and(|confidence| !(0.0..=1.0).contains(&confidence))
            {
                return Err(DomainError::InvariantViolation(format!(
                    "evidence {} has confidence outside 0..=1",
                    item.id
                )));
            }
        }
        if (self.generation_mode == "fixture") != self.fixture {
            return Err(DomainError::InvariantViolation(
                "fixture objects must use generation_mode=fixture and vice versa".to_owned(),
            ));
        }
        Ok(())
    }
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
#[serde(tag = "type", rename_all = "snake_case")]
pub enum ReviewAction {
    StartReview,
    Edit { body: String },
    Approve,
    Remove { reason: String },
    Reject { reason: String },
}

impl ReviewAction {
    #[must_use]
    pub fn name(&self) -> &'static str {
        match self {
            Self::StartReview => "start_review",
            Self::Edit { .. } => "edit",
            Self::Approve => "approve",
            Self::Remove { .. } => "remove",
            Self::Reject { .. } => "reject",
        }
    }
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
pub struct ReviewCommand {
    pub schema_version: String,
    pub actor_id: String,
    pub expected_revision: u64,
    pub occurred_at_unix_ms: u64,
    pub action: ReviewAction,
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
pub struct ReviewEvent {
    pub schema_version: String,
    pub id: String,
    pub object_id: String,
    pub sequence: u64,
    pub actor_id: String,
    pub action: String,
    pub from_state: ReviewState,
    pub to_state: ReviewState,
    pub before_body: Option<String>,
    pub after_body: Option<String>,
    pub reason: Option<String>,
    pub occurred_at_unix_ms: u64,
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
pub struct PublishCommand {
    pub schema_version: String,
    pub actor_id: String,
    pub expected_revision: u64,
    pub occurred_at_unix_ms: u64,
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
pub struct PublishedVersion {
    pub schema_version: String,
    pub id: String,
    pub object_id: String,
    pub version: u64,
    pub published_by: String,
    pub occurred_at_unix_ms: u64,
    pub fixture: bool,
    pub object_snapshot: GeneratedObject,
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
pub struct StudentInteraction {
    pub schema_version: String,
    pub id: String,
    pub published_version_id: String,
    pub actor_id: String,
    pub interaction_type: String,
    pub occurred_at_unix_ms: u64,
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
pub struct Replay {
    pub schema_version: String,
    pub object: GeneratedObject,
    pub review_events: Vec<ReviewEvent>,
    pub published_versions: Vec<PublishedVersion>,
    pub student_interactions: Vec<StudentInteraction>,
}

#[derive(Debug, Error, PartialEq)]
pub enum DomainError {
    #[error("unsupported schema version: {0}")]
    UnsupportedSchema(String),
    #[error("unknown review state blocks automatic action: {0}")]
    UnknownState(String),
    #[error("invalid transition from {from} using {action}")]
    InvalidTransition { from: String, action: String },
    #[error("revision conflict: expected {expected}, actual {actual}")]
    RevisionConflict { expected: u64, actual: u64 },
    #[error("invariant violation: {0}")]
    InvariantViolation(String),
}

pub fn apply_review_command(
    object: &mut GeneratedObject,
    event_id: String,
    command: ReviewCommand,
) -> Result<ReviewEvent, DomainError> {
    object.validate()?;
    validate_command(
        &command.schema_version,
        &command.actor_id,
        command.expected_revision,
        object,
    )?;
    if !object.review_state.is_known() {
        return Err(DomainError::UnknownState(object.review_state.to_string()));
    }

    let from_state = object.review_state.clone();
    let before_body = object.body.clone();
    let (to_state, after_body, reason) = match &command.action {
        ReviewAction::StartReview if from_state.as_str() == ReviewState::DRAFT => {
            (ReviewState::from_wire(ReviewState::REVIEW), None, None)
        }
        ReviewAction::Edit { body } if from_state.as_str() == ReviewState::REVIEW => {
            require_non_empty("body", body)?;
            object.body.clone_from(body);
            (
                ReviewState::from_wire(ReviewState::REVIEW),
                Some(body.clone()),
                None,
            )
        }
        ReviewAction::Approve if from_state.as_str() == ReviewState::REVIEW => {
            (ReviewState::from_wire(ReviewState::APPROVED), None, None)
        }
        ReviewAction::Remove { reason } if from_state.as_str() == ReviewState::REVIEW => {
            require_non_empty("reason", reason)?;
            (
                ReviewState::from_wire(ReviewState::REMOVED),
                None,
                Some(reason.clone()),
            )
        }
        ReviewAction::Reject { reason } if from_state.as_str() == ReviewState::REVIEW => {
            require_non_empty("reason", reason)?;
            (
                ReviewState::from_wire(ReviewState::REJECTED),
                None,
                Some(reason.clone()),
            )
        }
        action => {
            return Err(DomainError::InvalidTransition {
                from: from_state.to_string(),
                action: action.name().to_owned(),
            });
        }
    };

    object.review_state = to_state.clone();
    object.revision += 1;
    object.validate()?;

    Ok(ReviewEvent {
        schema_version: SCHEMA_VERSION.to_owned(),
        id: event_id,
        object_id: object.id.clone(),
        sequence: object.revision,
        actor_id: command.actor_id,
        action: command.action.name().to_owned(),
        from_state,
        to_state,
        before_body: matches!(command.action, ReviewAction::Edit { .. }).then_some(before_body),
        after_body,
        reason,
        occurred_at_unix_ms: command.occurred_at_unix_ms,
    })
}

pub fn publish_object(
    object: &mut GeneratedObject,
    event_id: String,
    version_id: String,
    version: u64,
    command: PublishCommand,
) -> Result<(ReviewEvent, PublishedVersion), DomainError> {
    object.validate()?;
    validate_command(
        &command.schema_version,
        &command.actor_id,
        command.expected_revision,
        object,
    )?;
    if !object.review_state.is_known() {
        return Err(DomainError::UnknownState(object.review_state.to_string()));
    }
    if object.review_state.as_str() != ReviewState::APPROVED {
        return Err(DomainError::InvalidTransition {
            from: object.review_state.to_string(),
            action: "publish".to_owned(),
        });
    }

    let from_state = object.review_state.clone();
    object.review_state = ReviewState::from_wire(ReviewState::PUBLISHED);
    object.revision += 1;
    let event = ReviewEvent {
        schema_version: SCHEMA_VERSION.to_owned(),
        id: event_id,
        object_id: object.id.clone(),
        sequence: object.revision,
        actor_id: command.actor_id.clone(),
        action: "publish".to_owned(),
        from_state,
        to_state: object.review_state.clone(),
        before_body: None,
        after_body: None,
        reason: None,
        occurred_at_unix_ms: command.occurred_at_unix_ms,
    };
    let published = PublishedVersion {
        schema_version: SCHEMA_VERSION.to_owned(),
        id: version_id,
        object_id: object.id.clone(),
        version,
        published_by: command.actor_id,
        occurred_at_unix_ms: command.occurred_at_unix_ms,
        fixture: object.fixture,
        object_snapshot: object.clone(),
    };
    Ok((event, published))
}

fn validate_command(
    schema_version: &str,
    actor_id: &str,
    expected_revision: u64,
    object: &GeneratedObject,
) -> Result<(), DomainError> {
    require_supported_schema(schema_version)?;
    require_non_empty("actor_id", actor_id)?;
    if expected_revision != object.revision {
        return Err(DomainError::RevisionConflict {
            expected: expected_revision,
            actual: object.revision,
        });
    }
    Ok(())
}

fn require_supported_schema(version: &str) -> Result<(), DomainError> {
    if version.split('.').next() == Some("1") {
        Ok(())
    } else {
        Err(DomainError::UnsupportedSchema(version.to_owned()))
    }
}

fn require_non_empty(field: &str, value: &str) -> Result<(), DomainError> {
    if value.trim().is_empty() {
        Err(DomainError::InvariantViolation(format!(
            "{field} must not be empty"
        )))
    } else {
        Ok(())
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn fixture() -> GeneratedObject {
        serde_json::from_str(include_str!(
            "../../../fixtures/v1/generated-object.bst.json"
        ))
        .expect("golden fixture must deserialize")
    }

    #[test]
    fn golden_fixture_is_valid() {
        fixture()
            .validate()
            .expect("fixture must satisfy invariants");
    }

    #[test]
    fn review_flow_is_explicit_and_append_only_friendly() {
        let mut object = fixture();
        let start = ReviewCommand {
            schema_version: SCHEMA_VERSION.to_owned(),
            actor_id: "teacher-fixture".to_owned(),
            expected_revision: 0,
            occurred_at_unix_ms: 1,
            action: ReviewAction::StartReview,
        };
        let first = apply_review_command(&mut object, "evt-1".to_owned(), start)
            .expect("draft can enter review");
        assert_eq!(first.sequence, 1);
        assert_eq!(object.review_state.as_str(), ReviewState::REVIEW);

        let approve = ReviewCommand {
            schema_version: SCHEMA_VERSION.to_owned(),
            actor_id: "teacher-fixture".to_owned(),
            expected_revision: 1,
            occurred_at_unix_ms: 2,
            action: ReviewAction::Approve,
        };
        let second = apply_review_command(&mut object, "evt-2".to_owned(), approve)
            .expect("review can be approved");
        assert_eq!(second.sequence, 2);
        assert_eq!(object.review_state.as_str(), ReviewState::APPROVED);
    }

    #[test]
    fn unknown_future_state_is_preserved_and_blocks_automatic_action() {
        let mut object = fixture();
        object.review_state = ReviewState::from_wire("future_state_from_v2");
        let result = apply_review_command(
            &mut object,
            "evt-unknown".to_owned(),
            ReviewCommand {
                schema_version: SCHEMA_VERSION.to_owned(),
                actor_id: "teacher-fixture".to_owned(),
                expected_revision: 0,
                occurred_at_unix_ms: 1,
                action: ReviewAction::StartReview,
            },
        );
        assert_eq!(
            result,
            Err(DomainError::UnknownState("future_state_from_v2".to_owned()))
        );
    }

    #[test]
    fn stale_revision_is_rejected() {
        let mut object = fixture();
        let result = apply_review_command(
            &mut object,
            "evt-stale".to_owned(),
            ReviewCommand {
                schema_version: SCHEMA_VERSION.to_owned(),
                actor_id: "teacher-fixture".to_owned(),
                expected_revision: 9,
                occurred_at_unix_ms: 1,
                action: ReviewAction::StartReview,
            },
        );
        assert_eq!(
            result,
            Err(DomainError::RevisionConflict {
                expected: 9,
                actual: 0
            })
        );
    }

    #[test]
    fn removed_is_terminal_and_requires_a_reason() {
        let mut object = fixture();
        apply_review_command(
            &mut object,
            "evt-start".to_owned(),
            ReviewCommand {
                schema_version: SCHEMA_VERSION.to_owned(),
                actor_id: "teacher-fixture".to_owned(),
                expected_revision: 0,
                occurred_at_unix_ms: 1,
                action: ReviewAction::StartReview,
            },
        )
        .expect("draft can enter review");
        let removed = apply_review_command(
            &mut object,
            "evt-remove".to_owned(),
            ReviewCommand {
                schema_version: SCHEMA_VERSION.to_owned(),
                actor_id: "teacher-fixture".to_owned(),
                expected_revision: 1,
                occurred_at_unix_ms: 2,
                action: ReviewAction::Remove {
                    reason: "source needs correction".to_owned(),
                },
            },
        )
        .expect("review can be removed with a reason");
        assert_eq!(removed.reason.as_deref(), Some("source needs correction"));
        assert_eq!(object.review_state.as_str(), ReviewState::REMOVED);

        let terminal = apply_review_command(
            &mut object,
            "evt-after-remove".to_owned(),
            ReviewCommand {
                schema_version: SCHEMA_VERSION.to_owned(),
                actor_id: "teacher-fixture".to_owned(),
                expected_revision: 2,
                occurred_at_unix_ms: 3,
                action: ReviewAction::Approve,
            },
        );
        assert!(matches!(
            terminal,
            Err(DomainError::InvalidTransition { .. })
        ));
    }
}

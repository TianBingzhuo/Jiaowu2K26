//! SQLite implementation of the Phase 0 repository port.

use async_trait::async_trait;
use j2k26_application::{GeneratedObjectRepository, RepositoryError};
use j2k26_domain::{GeneratedObject, PublishedVersion, Replay, ReviewEvent, SCHEMA_VERSION};
use sqlx::sqlite::{SqliteConnectOptions, SqlitePoolOptions};
use sqlx::{Row, SqlitePool};
use std::str::FromStr;

#[derive(Clone)]
pub struct SqliteRepository {
    pool: SqlitePool,
}

impl SqliteRepository {
    pub async fn connect(database_url: &str) -> Result<Self, RepositoryError> {
        let options = SqliteConnectOptions::from_str(database_url)
            .map_err(unavailable)?
            .create_if_missing(true)
            .foreign_keys(true);
        let max_connections = if database_url.contains(":memory:") {
            1
        } else {
            5
        };
        let pool = SqlitePoolOptions::new()
            .max_connections(max_connections)
            .connect_with(options)
            .await
            .map_err(unavailable)?;
        sqlx::migrate!("./migrations")
            .run(&pool)
            .await
            .map_err(unavailable)?;
        Ok(Self { pool })
    }

    #[must_use]
    pub fn pool(&self) -> &SqlitePool {
        &self.pool
    }
}

#[async_trait]
impl GeneratedObjectRepository for SqliteRepository {
    async fn insert_if_absent(&self, object: &GeneratedObject) -> Result<(), RepositoryError> {
        let document = encode(object)?;
        sqlx::query(
            "INSERT INTO generated_objects (id, revision, document_json) VALUES (?, ?, ?) \
             ON CONFLICT(id) DO NOTHING",
        )
        .bind(&object.id)
        .bind(to_i64(object.revision)?)
        .bind(document)
        .execute(&self.pool)
        .await
        .map_err(unavailable)?;
        Ok(())
    }

    async fn get(&self, object_id: &str) -> Result<GeneratedObject, RepositoryError> {
        let row = sqlx::query("SELECT document_json FROM generated_objects WHERE id = ?")
            .bind(object_id)
            .fetch_optional(&self.pool)
            .await
            .map_err(unavailable)?
            .ok_or_else(|| RepositoryError::NotFound(object_id.to_owned()))?;
        decode(
            row.try_get::<String, _>("document_json")
                .map_err(unavailable)?,
        )
    }

    async fn commit_review(
        &self,
        previous_revision: u64,
        object: &GeneratedObject,
        event: &ReviewEvent,
    ) -> Result<(), RepositoryError> {
        let mut transaction = self.pool.begin().await.map_err(unavailable)?;
        let updated = sqlx::query(
            "UPDATE generated_objects SET revision = ?, document_json = ? \
             WHERE id = ? AND revision = ?",
        )
        .bind(to_i64(object.revision)?)
        .bind(encode(object)?)
        .bind(&object.id)
        .bind(to_i64(previous_revision)?)
        .execute(&mut *transaction)
        .await
        .map_err(unavailable)?;
        if updated.rows_affected() != 1 {
            return Err(RepositoryError::Conflict(object.id.clone()));
        }

        sqlx::query(
            "INSERT INTO review_events (id, object_id, sequence, document_json) VALUES (?, ?, ?, ?)",
        )
        .bind(&event.id)
        .bind(&event.object_id)
        .bind(to_i64(event.sequence)?)
        .bind(encode(event)?)
        .execute(&mut *transaction)
        .await
        .map_err(unavailable)?;
        transaction.commit().await.map_err(unavailable)?;
        Ok(())
    }

    async fn commit_publication(
        &self,
        previous_revision: u64,
        object: &GeneratedObject,
        event: &ReviewEvent,
        version: &PublishedVersion,
    ) -> Result<(), RepositoryError> {
        let mut transaction = self.pool.begin().await.map_err(unavailable)?;
        let updated = sqlx::query(
            "UPDATE generated_objects SET revision = ?, document_json = ? \
             WHERE id = ? AND revision = ?",
        )
        .bind(to_i64(object.revision)?)
        .bind(encode(object)?)
        .bind(&object.id)
        .bind(to_i64(previous_revision)?)
        .execute(&mut *transaction)
        .await
        .map_err(unavailable)?;
        if updated.rows_affected() != 1 {
            return Err(RepositoryError::Conflict(object.id.clone()));
        }

        sqlx::query(
            "INSERT INTO review_events (id, object_id, sequence, document_json) VALUES (?, ?, ?, ?)",
        )
        .bind(&event.id)
        .bind(&event.object_id)
        .bind(to_i64(event.sequence)?)
        .bind(encode(event)?)
        .execute(&mut *transaction)
        .await
        .map_err(unavailable)?;
        sqlx::query(
            "INSERT INTO published_versions (id, object_id, version, document_json) VALUES (?, ?, ?, ?)",
        )
        .bind(&version.id)
        .bind(&version.object_id)
        .bind(to_i64(version.version)?)
        .bind(encode(version)?)
        .execute(&mut *transaction)
        .await
        .map_err(unavailable)?;
        transaction.commit().await.map_err(unavailable)?;
        Ok(())
    }

    async fn replay(&self, object_id: &str) -> Result<Replay, RepositoryError> {
        let object = self.get(object_id).await?;
        let event_rows = sqlx::query(
            "SELECT document_json FROM review_events WHERE object_id = ? ORDER BY sequence ASC",
        )
        .bind(object_id)
        .fetch_all(&self.pool)
        .await
        .map_err(unavailable)?;
        let version_rows = sqlx::query(
            "SELECT document_json FROM published_versions WHERE object_id = ? ORDER BY version ASC",
        )
        .bind(object_id)
        .fetch_all(&self.pool)
        .await
        .map_err(unavailable)?;

        let review_events = event_rows
            .into_iter()
            .map(|row| {
                row.try_get::<String, _>("document_json")
                    .map_err(unavailable)
                    .and_then(decode)
            })
            .collect::<Result<Vec<ReviewEvent>, RepositoryError>>()?;
        let published_versions = version_rows
            .into_iter()
            .map(|row| {
                row.try_get::<String, _>("document_json")
                    .map_err(unavailable)
                    .and_then(decode)
            })
            .collect::<Result<Vec<PublishedVersion>, RepositoryError>>()?;

        Ok(Replay {
            schema_version: SCHEMA_VERSION.to_owned(),
            object,
            review_events,
            published_versions,
            student_interactions: Vec::new(),
        })
    }
}

fn encode<T: serde::Serialize>(value: &T) -> Result<String, RepositoryError> {
    serde_json::to_string(value).map_err(|error| RepositoryError::InvalidData(error.to_string()))
}

fn decode<T: serde::de::DeserializeOwned>(value: String) -> Result<T, RepositoryError> {
    serde_json::from_str(&value).map_err(|error| RepositoryError::InvalidData(error.to_string()))
}

fn to_i64(value: u64) -> Result<i64, RepositoryError> {
    i64::try_from(value)
        .map_err(|_| RepositoryError::InvalidData(format!("integer {value} exceeds SQLite range")))
}

fn unavailable(error: impl std::fmt::Display) -> RepositoryError {
    RepositoryError::Unavailable(error.to_string())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn fixture_round_trips_through_sqlite() {
        let repository = SqliteRepository::connect("sqlite::memory:")
            .await
            .expect("in-memory SQLite must start");
        let object: GeneratedObject = serde_json::from_str(include_str!(
            "../../../fixtures/v1/generated-object.bst.json"
        ))
        .expect("fixture must deserialize");
        repository
            .insert_if_absent(&object)
            .await
            .expect("fixture insert must succeed");
        let restored = repository.get(&object.id).await.expect("object must exist");
        assert_eq!(restored, object);
        assert!(
            repository
                .replay(&object.id)
                .await
                .unwrap()
                .review_events
                .is_empty()
        );
    }
}

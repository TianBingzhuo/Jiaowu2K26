//! Axum adapter for the versioned Phase 0 HTTP contract.

use axum::extract::{Path, State};
use axum::http::StatusCode;
use axum::response::{IntoResponse, Response};
use axum::routing::{get, post};
use axum::{Json, Router};
use j2k26_application::{RepositoryError, ServiceError, SmartCourseService};
use j2k26_domain::{
    DomainError, GeneratedObject, PublishCommand, PublishedVersion, Replay, ReviewAction,
    ReviewCommand, ReviewEvent, SCHEMA_VERSION,
};
use serde::{Deserialize, Serialize};
use std::time::{SystemTime, UNIX_EPOCH};
use tower_http::trace::TraceLayer;

pub const GOLDEN_OBJECT_ID: &str = "generated-bst-search-001";
pub const GOLDEN_FIXTURE: &str = include_str!("../../../fixtures/v1/generated-object.bst.json");

#[derive(Clone)]
struct AppState {
    service: SmartCourseService,
}

pub fn build_router(service: SmartCourseService) -> Router {
    Router::new()
        .route("/api/v1/health", get(health))
        .route("/api/v1/generated-objects/{object_id}", get(get_object))
        .route(
            "/api/v1/generated-objects/{object_id}/reviews",
            post(review_object),
        )
        .route(
            "/api/v1/generated-objects/{object_id}/publish",
            post(publish_object),
        )
        .route(
            "/api/v1/generated-objects/{object_id}/replay",
            get(replay_object),
        )
        .layer(TraceLayer::new_for_http())
        .with_state(AppState { service })
}

#[derive(Debug, Serialize)]
struct HealthResponse {
    schema_version: &'static str,
    status: &'static str,
    component: &'static str,
    data_mode: &'static str,
}

async fn health() -> Json<HealthResponse> {
    Json(HealthResponse {
        schema_version: SCHEMA_VERSION,
        status: "ok",
        component: "j2k26-api",
        data_mode: "fixture",
    })
}

async fn get_object(
    State(state): State<AppState>,
    Path(object_id): Path<String>,
) -> Result<Json<GeneratedObject>, ApiError> {
    Ok(Json(state.service.get(&object_id).await?))
}

#[derive(Debug, Deserialize, Serialize)]
pub struct ReviewRequest {
    pub schema_version: String,
    pub actor_id: String,
    pub expected_revision: u64,
    pub action: ReviewAction,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ReviewResponse {
    pub schema_version: String,
    pub object: GeneratedObject,
    pub event: ReviewEvent,
}

async fn review_object(
    State(state): State<AppState>,
    Path(object_id): Path<String>,
    Json(request): Json<ReviewRequest>,
) -> Result<Json<ReviewResponse>, ApiError> {
    let command = ReviewCommand {
        schema_version: request.schema_version,
        actor_id: request.actor_id,
        expected_revision: request.expected_revision,
        occurred_at_unix_ms: now_unix_ms()?,
        action: request.action,
    };
    let (object, event) = state.service.review(&object_id, command).await?;
    Ok(Json(ReviewResponse {
        schema_version: SCHEMA_VERSION.to_owned(),
        object,
        event,
    }))
}

#[derive(Debug, Deserialize, Serialize)]
pub struct PublishRequest {
    pub schema_version: String,
    pub actor_id: String,
    pub expected_revision: u64,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct PublishResponse {
    pub schema_version: String,
    pub object: GeneratedObject,
    pub published_version: PublishedVersion,
}

async fn publish_object(
    State(state): State<AppState>,
    Path(object_id): Path<String>,
    Json(request): Json<PublishRequest>,
) -> Result<Json<PublishResponse>, ApiError> {
    let command = PublishCommand {
        schema_version: request.schema_version,
        actor_id: request.actor_id,
        expected_revision: request.expected_revision,
        occurred_at_unix_ms: now_unix_ms()?,
    };
    let (object, published_version) = state.service.publish(&object_id, command).await?;
    Ok(Json(PublishResponse {
        schema_version: SCHEMA_VERSION.to_owned(),
        object,
        published_version,
    }))
}

async fn replay_object(
    State(state): State<AppState>,
    Path(object_id): Path<String>,
) -> Result<Json<Replay>, ApiError> {
    Ok(Json(state.service.replay(&object_id).await?))
}

#[derive(Debug, Serialize)]
pub struct ErrorResponse {
    pub schema_version: String,
    pub code: String,
    pub message: String,
    pub retryable: bool,
}

pub struct ApiError {
    status: StatusCode,
    body: ErrorResponse,
}

impl From<ServiceError> for ApiError {
    fn from(error: ServiceError) -> Self {
        match error {
            ServiceError::Domain(domain) => Self::from_domain(domain),
            ServiceError::Repository(repository) => Self::from_repository(repository),
        }
    }
}

impl ApiError {
    fn from_domain(error: DomainError) -> Self {
        let (status, code) = match error {
            DomainError::RevisionConflict { .. } => (StatusCode::CONFLICT, "revision_conflict"),
            DomainError::UnknownState(_) => (StatusCode::UNPROCESSABLE_ENTITY, "unknown_state"),
            DomainError::InvalidTransition { .. } => {
                (StatusCode::UNPROCESSABLE_ENTITY, "invalid_transition")
            }
            DomainError::UnsupportedSchema(_) => {
                (StatusCode::UNPROCESSABLE_ENTITY, "unsupported_schema")
            }
            DomainError::InvariantViolation(_) => {
                (StatusCode::UNPROCESSABLE_ENTITY, "invariant_violation")
            }
        };
        Self::new(status, code, error.to_string(), false)
    }

    fn from_repository(error: RepositoryError) -> Self {
        match error {
            RepositoryError::NotFound(_) => {
                Self::new(StatusCode::NOT_FOUND, "not_found", error.to_string(), false)
            }
            RepositoryError::Conflict(_) => Self::new(
                StatusCode::CONFLICT,
                "repository_conflict",
                error.to_string(),
                true,
            ),
            RepositoryError::InvalidData(_) | RepositoryError::Unavailable(_) => Self::new(
                StatusCode::INTERNAL_SERVER_ERROR,
                "repository_unavailable",
                "The local fixture repository could not complete the request.".to_owned(),
                true,
            ),
        }
    }

    fn new(
        status: StatusCode,
        code: impl Into<String>,
        message: impl Into<String>,
        retryable: bool,
    ) -> Self {
        Self {
            status,
            body: ErrorResponse {
                schema_version: SCHEMA_VERSION.to_owned(),
                code: code.into(),
                message: message.into(),
                retryable,
            },
        }
    }
}

impl IntoResponse for ApiError {
    fn into_response(self) -> Response {
        (self.status, Json(self.body)).into_response()
    }
}

fn now_unix_ms() -> Result<u64, ApiError> {
    let duration = SystemTime::now().duration_since(UNIX_EPOCH).map_err(|_| {
        ApiError::new(
            StatusCode::INTERNAL_SERVER_ERROR,
            "clock_error",
            "System clock is earlier than the Unix epoch.",
            false,
        )
    })?;
    u64::try_from(duration.as_millis()).map_err(|_| {
        ApiError::new(
            StatusCode::INTERNAL_SERVER_ERROR,
            "clock_error",
            "System clock value exceeds the supported range.",
            false,
        )
    })
}

#[cfg(test)]
mod tests {
    use super::*;
    use axum::body::Body;
    use axum::http::{Request, header};
    use http_body_util::BodyExt;
    use j2k26_adapters_sqlite::SqliteRepository;
    use serde_json::{Value, json};
    use std::sync::Arc;
    use tower::ServiceExt;

    async fn test_app() -> Router {
        let repository = Arc::new(
            SqliteRepository::connect("sqlite::memory:")
                .await
                .expect("SQLite must start"),
        );
        let service = SmartCourseService::new(repository);
        service
            .seed_fixture(GOLDEN_FIXTURE)
            .await
            .expect("fixture must seed");
        build_router(service)
    }

    async fn json_request(app: Router, method: &str, uri: &str, payload: Value) -> Response {
        let request = Request::builder()
            .method(method)
            .uri(uri)
            .header(header::CONTENT_TYPE, "application/json")
            .body(Body::from(payload.to_string()))
            .expect("request must build");
        app.oneshot(request).await.expect("router must respond")
    }

    async fn response_json(response: Response) -> Value {
        let bytes = response
            .into_body()
            .collect()
            .await
            .expect("body must collect")
            .to_bytes();
        serde_json::from_slice(&bytes).expect("response must be JSON")
    }

    #[tokio::test]
    async fn phase0_vertical_slice_reviews_publishes_and_replays() {
        let app = test_app().await;
        let base = format!("/api/v1/generated-objects/{GOLDEN_OBJECT_ID}");

        let start = json_request(
            app.clone(),
            "POST",
            &format!("{base}/reviews"),
            json!({
                "schema_version": "1.0.0",
                "actor_id": "teacher-fixture",
                "expected_revision": 0,
                "action": { "type": "start_review" }
            }),
        )
        .await;
        assert_eq!(start.status(), StatusCode::OK);

        let approve = json_request(
            app.clone(),
            "POST",
            &format!("{base}/reviews"),
            json!({
                "schema_version": "1.0.0",
                "actor_id": "teacher-fixture",
                "expected_revision": 1,
                "action": { "type": "approve" }
            }),
        )
        .await;
        assert_eq!(approve.status(), StatusCode::OK);

        let publish = json_request(
            app.clone(),
            "POST",
            &format!("{base}/publish"),
            json!({
                "schema_version": "1.0.0",
                "actor_id": "teacher-fixture",
                "expected_revision": 2
            }),
        )
        .await;
        assert_eq!(publish.status(), StatusCode::OK);

        let replay = app
            .oneshot(
                Request::builder()
                    .uri(format!("{base}/replay"))
                    .body(Body::empty())
                    .expect("request must build"),
            )
            .await
            .expect("router must respond");
        assert_eq!(replay.status(), StatusCode::OK);
        let body = response_json(replay).await;
        assert_eq!(body["object"]["review_state"], "published");
        assert_eq!(body["review_events"].as_array().map(Vec::len), Some(3));
        assert_eq!(body["published_versions"].as_array().map(Vec::len), Some(1));
        assert_eq!(
            body["student_interactions"].as_array().map(Vec::len),
            Some(0)
        );
    }

    #[tokio::test]
    async fn invalid_transition_is_machine_readable() {
        let app = test_app().await;
        let response = json_request(
            app,
            "POST",
            &format!("/api/v1/generated-objects/{GOLDEN_OBJECT_ID}/publish"),
            json!({
                "schema_version": "1.0.0",
                "actor_id": "teacher-fixture",
                "expected_revision": 0
            }),
        )
        .await;
        assert_eq!(response.status(), StatusCode::UNPROCESSABLE_ENTITY);
        let body = response_json(response).await;
        assert_eq!(body["code"], "invalid_transition");
        assert_eq!(body["retryable"], false);
    }
}

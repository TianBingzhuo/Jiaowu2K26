//! Axum adapter for the versioned Phase 0 HTTP contract.

use axum::extract::{Path, State};
use axum::http::StatusCode;
use axum::response::{IntoResponse, Response};
use axum::routing::{delete, get, post, put};
use axum::{Json, Router};
use j2k26_adapters_ai_openai_compatible::OpenAiCompatibleGateway;
use j2k26_application::ai::{
    AiAdvice, AiAdviceRequest, AiGateway, AiGatewayError, AiGatewayStatus, rules_fallback_advice,
};
use j2k26_application::{RepositoryError, ServiceError, SmartCourseService};
use j2k26_domain::{
    AcademicMirrorFixture, AcademicMirrorSession, AccessLogCorrection, AccessRequestMirror,
    CampusAuditEvent, CampusBoxScore, CampusCalendarEntry, CampusEscalationRoute,
    CampusFootprintReceipt, CampusJourneyMirror, CampusLifeFixture, CampusLifeSession,
    CampusMentorHandoff, CampusMyCourtExport, CampusNotificationSettings, CampusPassBoxScore,
    CampusPassFixture, CampusPassSession, CampusPreferenceProfile, CampusRouteOption,
    CampusSavedItem, CampusSearchQuery, CampusSearchResult, CampusSourceCorrection,
    CampusTeamIntent, CareerCourse, CareerCourseDetail, CareerDashboard, CareerFixture,
    CareerLinkedContent, CareerRecentActivity, CareerSemester, CatalogImportValidationReceipt,
    CatalogImportValidationRequest, CoachAdvisorHandoff, CoachAuditEvent, CoachBoxScore,
    CoachCorrectionCase, CoachCourseProfile, CoachCourseVersion, CoachEvidenceSource,
    CoachExpectationReminder, CoachFairnessAudit, CoachFeedbackAggregate, CoachFeedbackSubmission,
    CoachGovernanceCase, CoachOfficeHours, CoachScoutingFixture, CoachScoutingReport,
    CoachScoutingSession, CoachTeachingStructure, CoachTeamMatch, CoachTeamProfileField,
    CoachVersionComparison, CoachWorkloadRange, CredentialLossCase, CredentialPresentation,
    DomainError, EmergencyAccessMode, ExamAnswerRecord, ExamBoxScore, ExamCheckpoint, ExamEvent,
    GeneratedObject, GuestPassDraft, InteractionCommand, ManualFallbackSelection, MirrorAuditEvent,
    MirrorAuthorityLevel, MirrorConflictRecord, MirrorConsentRecord, MirrorDataSource,
    MirrorNormalizedField, MirrorNormalizedRecord, MirrorRawSnapshot, OfflineCredentialCheck,
    OpportunityApplicationMirror, OpportunityAuditEvent, OpportunityBoxScore,
    OpportunityCapacityPlan, OpportunityDisclosureGrant, OpportunityEligibilityCheck,
    OpportunityEligibilityRule, OpportunityFairnessAudit, OpportunityMarketFixture,
    OpportunityMarketSession, OpportunityMatchResult, OpportunityPathway,
    OpportunityPortfolioExport, OpportunityProfileField, OpportunityRecord, OpportunityReport,
    OpportunitySavedItem, PassAuditEvent, PassCredential, PerformanceAbilityDimension,
    PerformanceAuditEvent, PerformanceBadge, PerformanceCenterFixture, PerformanceCenterSession,
    PerformanceCorrectionCase, PerformanceEvidence, PerformanceHarmSignal, PerformanceLoadSignal,
    PerformanceMetricDefinition, PerformanceObservation, PerformanceRecommendation,
    PerformanceResearchGate, PerformanceShareDraft, PerformanceShareGrant,
    PerformanceSupportAction, PostGameReflection, PreGameBriefing, PublishCommand,
    PublishedVersion, ROSTER_SOLVER_PROTOCOL, Replay, ReviewAction, ReviewCommand, ReviewEvent,
    ReviewPlaybookSection, RosterCourseSpec, RosterFixture, RosterPin, RosterPreferences,
    RosterPrefix, RosterSession, RosterTransaction, RosterUnsatisfiableExplanation, SCHEMA_VERSION,
    SelfAccessRecord, SemesterLock, SemesterPlan, StudentInteraction, WarmupAttempt,
    WarmupQuestion, WorldExamFixture, WorldExamSession, build_exam_box_score,
    campus_recommendations,
};
use serde::{Deserialize, Serialize};
use std::collections::BTreeMap;
use std::sync::{Arc, Mutex, MutexGuard};
use std::time::{SystemTime, UNIX_EPOCH};
use tower_http::trace::TraceLayer;

pub const GOLDEN_OBJECT_ID: &str = "generated-bst-search-001";
pub const GOLDEN_FIXTURE: &str = include_str!("../../../fixtures/v1/generated-object.bst.json");
pub const CAREER_FIXTURE: &str = include_str!("../../../fixtures/v1/career-season.demo.json");
pub const WORLD_EXAM_FIXTURE: &str = include_str!("../../../fixtures/v1/world-exam.demo.json");
pub const ROSTER_FIXTURE: &str = include_str!("../../../fixtures/v1/roster-lab.demo.json");
pub const ACADEMIC_MIRROR_FIXTURE: &str =
    include_str!("../../../fixtures/v1/academic-mirror.demo.json");
pub const PERFORMANCE_CENTER_FIXTURE: &str =
    include_str!("../../../fixtures/v1/performance-center.demo.json");
pub const OPPORTUNITY_MARKET_FIXTURE: &str =
    include_str!("../../../fixtures/v1/opportunity-market.demo.json");
pub const COACH_SCOUTING_FIXTURE: &str =
    include_str!("../../../fixtures/v1/coach-scouting.demo.json");
pub const CAMPUS_LIFE_FIXTURE: &str = include_str!("../../../fixtures/v1/campus-life.demo.json");
pub const CAMPUS_PASS_FIXTURE: &str = include_str!("../../../fixtures/v1/campus-pass.demo.json");

#[derive(Clone)]
struct AppState {
    service: SmartCourseService,
    career_fixture: CareerFixture,
    world_exam_fixture: WorldExamFixture,
    world_exam_session: Arc<Mutex<WorldExamSession>>,
    roster_fixture: RosterFixture,
    roster_session: Arc<Mutex<RosterSession>>,
    academic_mirror_fixture: AcademicMirrorFixture,
    academic_mirror_session: Arc<Mutex<AcademicMirrorSession>>,
    performance_center_fixture: PerformanceCenterFixture,
    performance_center_session: Arc<Mutex<PerformanceCenterSession>>,
    opportunity_market_fixture: OpportunityMarketFixture,
    opportunity_market_session: Arc<Mutex<OpportunityMarketSession>>,
    coach_scouting_fixture: CoachScoutingFixture,
    coach_scouting_session: Arc<Mutex<CoachScoutingSession>>,
    campus_life_fixture: CampusLifeFixture,
    campus_life_session: Arc<Mutex<CampusLifeSession>>,
    campus_pass_fixture: CampusPassFixture,
    campus_pass_session: Arc<Mutex<CampusPassSession>>,
    ai_gateway: Arc<dyn AiGateway>,
    development_profile: DevelopmentProfileResponse,
}

pub fn build_router(service: SmartCourseService) -> Router {
    let ai_gateway: Arc<dyn AiGateway> =
        Arc::new(OpenAiCompatibleGateway::from_env().unwrap_or_else(|_| {
            OpenAiCompatibleGateway::unconfigured(
                "AI 配置未通过安全校验；已禁用模型通路并使用规则回退。",
            )
        }));
    build_router_with_ai(service, ai_gateway)
}

pub fn build_router_with_ai(service: SmartCourseService, ai_gateway: Arc<dyn AiGateway>) -> Router {
    let development_profile = load_development_profile();
    let career_fixture: CareerFixture =
        serde_json::from_str(CAREER_FIXTURE).expect("embedded career fixture must be valid");
    let world_exam_fixture: WorldExamFixture = serde_json::from_str(WORLD_EXAM_FIXTURE)
        .expect("embedded World Exam fixture must be valid");
    world_exam_fixture
        .validate()
        .expect("embedded World Exam fixture must satisfy domain invariants");
    let world_exam_session = Arc::new(Mutex::new(WorldExamSession::from_fixture(
        &world_exam_fixture,
    )));
    let roster_fixture: RosterFixture =
        serde_json::from_str(ROSTER_FIXTURE).expect("embedded Roster Lab fixture must be valid");
    roster_fixture
        .validate()
        .expect("embedded Roster Lab fixture must satisfy domain invariants");
    let roster_session = Arc::new(Mutex::new(RosterSession::from_fixture(&roster_fixture)));
    let academic_mirror_fixture: AcademicMirrorFixture =
        serde_json::from_str(ACADEMIC_MIRROR_FIXTURE)
            .expect("embedded Academic Mirror fixture must be valid");
    academic_mirror_fixture
        .validate()
        .expect("embedded Academic Mirror fixture must satisfy domain invariants");
    let academic_mirror_session = Arc::new(Mutex::new(AcademicMirrorSession::from_fixture(
        &academic_mirror_fixture,
    )));
    let performance_center_fixture: PerformanceCenterFixture =
        serde_json::from_str(PERFORMANCE_CENTER_FIXTURE)
            .expect("embedded Performance Center fixture must be valid");
    performance_center_fixture
        .validate()
        .expect("embedded Performance Center fixture must satisfy domain invariants");
    let performance_center_session = Arc::new(Mutex::new(PerformanceCenterSession::from_fixture(
        &performance_center_fixture,
    )));
    let opportunity_market_fixture: OpportunityMarketFixture =
        serde_json::from_str(OPPORTUNITY_MARKET_FIXTURE)
            .expect("embedded Opportunity Market fixture must be valid");
    opportunity_market_fixture
        .validate()
        .expect("embedded Opportunity Market fixture must satisfy domain invariants");
    let opportunity_market_session = Arc::new(Mutex::new(OpportunityMarketSession::from_fixture(
        &opportunity_market_fixture,
    )));
    let coach_scouting_fixture: CoachScoutingFixture = serde_json::from_str(COACH_SCOUTING_FIXTURE)
        .expect("embedded Coach & Scouting fixture must be valid");
    coach_scouting_fixture
        .validate()
        .expect("embedded Coach & Scouting fixture must satisfy domain invariants");
    let coach_scouting_session = Arc::new(Mutex::new(CoachScoutingSession::from_fixture(
        &coach_scouting_fixture,
    )));
    let campus_life_fixture: CampusLifeFixture = serde_json::from_str(CAMPUS_LIFE_FIXTURE)
        .expect("embedded Campus Life fixture must be valid");
    campus_life_fixture
        .validate()
        .expect("embedded Campus Life fixture must satisfy domain invariants");
    let campus_life_session = Arc::new(Mutex::new(CampusLifeSession::from_fixture(
        &campus_life_fixture,
    )));
    let campus_pass_fixture: CampusPassFixture = serde_json::from_str(CAMPUS_PASS_FIXTURE)
        .expect("embedded Campus Pass fixture must be valid");
    campus_pass_fixture
        .validate()
        .expect("embedded Campus Pass fixture must satisfy domain invariants");
    let campus_pass_session = Arc::new(Mutex::new(CampusPassSession::from_fixture(
        &campus_pass_fixture,
    )));
    Router::new()
        .route("/api/v1/health", get(health))
        .route("/api/v1/ai/status", get(get_ai_status))
        .route("/api/v1/ai/advice", post(post_ai_advice))
        .route(
            "/api/v1/profile/development-context",
            get(get_development_profile),
        )
        .route("/api/v1/career/current-semester", get(get_current_semester))
        .route(
            "/api/v1/career/current-semester/courses",
            get(get_current_courses),
        )
        .route("/api/v1/career/dashboard", get(get_career_dashboard))
        .route("/api/v1/career/course/{course_id}", get(get_career_course))
        .route("/api/v1/demo/semester", get(get_demo_semester))
        .route("/api/v1/demo/dashboard", get(get_demo_dashboard))
        .route("/api/v1/exams", get(get_exam_calendar))
        .route("/api/v1/exams/{exam_id}", get(get_exam_detail))
        .route("/api/v1/exams/{exam_id}/briefing", get(get_exam_briefing))
        .route("/api/v1/exams/{exam_id}/playbook", get(get_exam_playbook))
        .route("/api/v1/exams/{exam_id}/warmup", get(get_exam_warmup))
        .route(
            "/api/v1/exams/{exam_id}/warmup/attempts",
            post(post_warmup_attempt),
        )
        .route(
            "/api/v1/exams/{exam_id}/warmup/skip",
            post(post_warmup_skip),
        )
        .route(
            "/api/v1/exams/{exam_id}/checkpoints",
            post(post_exam_checkpoint),
        )
        .route("/api/v1/exams/{exam_id}/attempts", post(post_exam_answer))
        .route(
            "/api/v1/exams/{exam_id}/attempts/complete",
            post(post_exam_complete),
        )
        .route("/api/v1/exams/{exam_id}/replay", get(get_exam_replay))
        .route("/api/v1/exams/{exam_id}/box-score", get(get_exam_box_score))
        .route(
            "/api/v1/exams/{exam_id}/reflection",
            put(put_exam_reflection),
        )
        .route("/api/v1/demo/world-exam", get(get_demo_world_exam))
        .route(
            "/api/v1/demo/world-exam/reset",
            post(post_demo_world_exam_reset),
        )
        .route(
            "/api/v1/roster/prefix",
            get(get_roster_prefix).put(put_roster_prefix),
        )
        .route("/api/v1/roster/pins", put(put_roster_pins))
        .route("/api/v1/roster/solve", post(post_roster_solve))
        .route("/api/v1/roster/what-if", post(post_roster_what_if))
        .route(
            "/api/v1/roster/plans/{plan_id}/diff",
            get(get_roster_plan_diff),
        )
        .route(
            "/api/v1/roster/plans/{plan_id}/lock",
            post(post_roster_plan_lock),
        )
        .route("/api/v1/roster/catalog", get(get_roster_catalog))
        .route(
            "/api/v1/roster/import-capabilities",
            get(get_roster_import_capabilities),
        )
        .route(
            "/api/v1/roster/imports/validate",
            post(post_roster_import_validate),
        )
        .route("/api/v1/roster/unsat", get(get_roster_unsat))
        .route("/api/v1/demo/roster", get(get_demo_roster))
        .route("/api/v1/demo/roster/reset", post(post_demo_roster_reset))
        .route(
            "/api/v1/mirror/sources",
            get(get_mirror_sources).post(post_mirror_source),
        )
        .route(
            "/api/v1/mirror/sources/{source_id}/sync",
            post(post_mirror_sync),
        )
        .route("/api/v1/mirror/snapshots", get(get_mirror_snapshots))
        .route("/api/v1/mirror/records", get(get_mirror_records))
        .route(
            "/api/v1/mirror/records/{record_id}/provenance",
            get(get_mirror_provenance),
        )
        .route(
            "/api/v1/mirror/records/{record_id}",
            delete(delete_mirror_record),
        )
        .route("/api/v1/mirror/conflicts", get(get_mirror_conflicts))
        .route(
            "/api/v1/mirror/conflicts/{conflict_id}/resolve",
            put(put_mirror_conflict_resolution),
        )
        .route(
            "/api/v1/mirror/consents",
            get(get_mirror_consents).post(post_mirror_consent),
        )
        .route("/api/v1/mirror/corrections", post(post_mirror_correction))
        .route("/api/v1/mirror/exports", post(post_mirror_export))
        .route("/api/v1/mirror/audit", get(get_mirror_audit))
        .route("/api/v1/demo/mirror", get(get_demo_mirror))
        .route("/api/v1/demo/mirror/reset", post(post_demo_mirror_reset))
        .route(
            "/api/v1/performance/dashboard",
            get(get_performance_dashboard),
        )
        .route("/api/v1/performance/metrics", get(get_performance_metrics))
        .route(
            "/api/v1/performance/evidence/{evidence_id}",
            get(get_performance_evidence),
        )
        .route(
            "/api/v1/performance/recommendations",
            get(get_performance_recommendations),
        )
        .route(
            "/api/v1/performance/recommendations/{recommendation_id}",
            put(put_performance_recommendation),
        )
        .route("/api/v1/performance/climate", put(put_performance_climate))
        .route("/api/v1/performance/shares", post(post_performance_share))
        .route(
            "/api/v1/performance/shares/{grant_id}",
            delete(delete_performance_share),
        )
        .route(
            "/api/v1/performance/corrections",
            post(post_performance_correction),
        )
        .route(
            "/api/v1/performance/harm-signals",
            post(post_performance_harm_signal),
        )
        .route("/api/v1/performance/exports", post(post_performance_export))
        .route("/api/v1/performance/replay", get(get_performance_replay))
        .route("/api/v1/demo/performance", get(get_demo_performance))
        .route(
            "/api/v1/demo/performance/reset",
            post(post_demo_performance_reset),
        )
        .route("/api/v1/opportunities", get(get_opportunities))
        .route(
            "/api/v1/opportunities/{opportunity_id}",
            get(get_opportunity_detail),
        )
        .route(
            "/api/v1/opportunities/{opportunity_id}/eligibility",
            post(post_opportunity_eligibility),
        )
        .route(
            "/api/v1/opportunity-profile",
            get(get_opportunity_profile).put(put_opportunity_profile),
        )
        .route("/api/v1/opportunity-match", post(post_opportunity_match))
        .route(
            "/api/v1/opportunities/{opportunity_id}/save",
            post(post_opportunity_save),
        )
        .route(
            "/api/v1/opportunities/{opportunity_id}/interest",
            post(post_opportunity_interest),
        )
        .route(
            "/api/v1/opportunities/{opportunity_id}/provider-ack",
            post(post_opportunity_provider_ack),
        )
        .route(
            "/api/v1/opportunities/{opportunity_id}/disclosures",
            post(post_opportunity_disclosure),
        )
        .route(
            "/api/v1/opportunity-disclosures/{grant_id}",
            delete(delete_opportunity_disclosure),
        )
        .route(
            "/api/v1/opportunities/{opportunity_id}/external-status",
            post(post_opportunity_external_status),
        )
        .route(
            "/api/v1/opportunities/{opportunity_id}/capacity-plans",
            post(post_opportunity_capacity_plan),
        )
        .route(
            "/api/v1/opportunity-pathways/{pathway_id}",
            put(put_opportunity_pathway),
        )
        .route(
            "/api/v1/opportunity-portfolio/exports",
            post(post_opportunity_portfolio_export),
        )
        .route(
            "/api/v1/opportunities/{opportunity_id}/reports",
            post(post_opportunity_report),
        )
        .route(
            "/api/v1/opportunity-fairness/run",
            post(post_opportunity_fairness),
        )
        .route("/api/v1/opportunity-replay", get(get_opportunity_replay))
        .route(
            "/api/v1/demo/opportunity-market",
            get(get_demo_opportunity_market),
        )
        .route(
            "/api/v1/demo/opportunity-market/reset",
            post(post_demo_opportunity_market_reset),
        )
        .route("/api/v1/coach-scouting", get(get_coach_scouting))
        .route(
            "/api/v1/coach-scouting/profile",
            get(get_coach_scouting_profile),
        )
        .route(
            "/api/v1/coach-scouting/sources",
            get(get_coach_scouting_sources),
        )
        .route(
            "/api/v1/coach-scouting/versions",
            get(get_coach_scouting_versions),
        )
        .route(
            "/api/v1/coach-scouting/versions/compare",
            post(post_coach_version_comparison),
        )
        .route(
            "/api/v1/coach-scouting/corrections",
            post(post_coach_correction),
        )
        .route(
            "/api/v1/coach-scouting/corrections/{correction_id}",
            put(put_coach_correction),
        )
        .route("/api/v1/coach-scouting/feedback", post(post_coach_feedback))
        .route(
            "/api/v1/coach-scouting/feedback/aggregates",
            get(get_coach_feedback_aggregates),
        )
        .route(
            "/api/v1/coach-scouting/fairness/run",
            post(post_coach_fairness),
        )
        .route(
            "/api/v1/coach-scouting/team-profile",
            put(put_coach_team_profile),
        )
        .route(
            "/api/v1/coach-scouting/team-match",
            post(post_coach_team_match),
        )
        .route(
            "/api/v1/coach-scouting/advisor-handoffs",
            post(post_coach_advisor_handoff),
        )
        .route(
            "/api/v1/coach-scouting/reminders/{reminder_id}/ack",
            post(post_coach_reminder_ack),
        )
        .route(
            "/api/v1/coach-scouting/reports",
            post(post_coach_governance_report),
        )
        .route(
            "/api/v1/coach-scouting/replay",
            get(get_coach_scouting_replay),
        )
        .route("/api/v1/demo/coach-scouting", get(get_demo_coach_scouting))
        .route(
            "/api/v1/demo/coach-scouting/reset",
            post(post_demo_coach_scouting_reset),
        )
        .route("/api/v1/campus-life", get(get_campus_life))
        .route("/api/v1/campus-life/search", post(post_campus_search))
        .route("/api/v1/campus-life/profile", put(put_campus_profile))
        .route("/api/v1/campus-life/saved", post(post_campus_saved))
        .route("/api/v1/campus-life/calendar", post(post_campus_calendar))
        .route("/api/v1/campus-life/routes", post(post_campus_route))
        .route(
            "/api/v1/campus-life/journeys/{resource_id}",
            put(put_campus_journey),
        )
        .route(
            "/api/v1/campus-life/team-intents/{listing_id}",
            post(post_campus_team_intent),
        )
        .route(
            "/api/v1/campus-life/team-intents/{listing_id}/counterparty",
            post(post_campus_team_counterparty),
        )
        .route(
            "/api/v1/campus-life/mentor-handoffs",
            post(post_campus_mentor_handoff),
        )
        .route(
            "/api/v1/campus-life/notifications",
            put(put_campus_notifications),
        )
        .route(
            "/api/v1/campus-life/corrections",
            post(post_campus_correction),
        )
        .route("/api/v1/campus-life/receipts", post(post_campus_receipt))
        .route(
            "/api/v1/campus-life/mycourt/export",
            post(post_campus_mycourt_export),
        )
        .route(
            "/api/v1/campus-life/escalation-routes",
            get(get_campus_escalation_routes),
        )
        .route("/api/v1/campus-life/replay", get(get_campus_replay))
        .route("/api/v1/demo/campus-life", get(get_demo_campus_life))
        .route(
            "/api/v1/demo/campus-life/reset",
            post(post_demo_campus_life_reset),
        )
        .route("/api/v1/campus-pass", get(get_campus_pass))
        .route(
            "/api/v1/campus-pass/credentials/{credential_id}/select",
            put(put_campus_pass_credential),
        )
        .route(
            "/api/v1/campus-pass/credentials/{credential_id}/present",
            post(post_campus_pass_present),
        )
        .route(
            "/api/v1/campus-pass/access-requests",
            post(post_campus_pass_access_request),
        )
        .route(
            "/api/v1/campus-pass/access-requests/{request_id}/mirror",
            put(put_campus_pass_request_mirror),
        )
        .route(
            "/api/v1/campus-pass/guest-drafts",
            post(post_campus_pass_guest_draft),
        )
        .route(
            "/api/v1/campus-pass/loss-cases",
            post(post_campus_pass_loss_case),
        )
        .route(
            "/api/v1/campus-pass/offline-checks",
            post(post_campus_pass_offline_check),
        )
        .route(
            "/api/v1/campus-pass/access-log-corrections",
            post(post_campus_pass_log_correction),
        )
        .route(
            "/api/v1/campus-pass/manual-fallbacks",
            post(post_campus_pass_manual_fallback),
        )
        .route(
            "/api/v1/campus-pass/emergency-modes",
            get(get_campus_pass_emergency_modes),
        )
        .route(
            "/api/v1/campus-pass/access-records",
            get(get_campus_pass_access_records),
        )
        .route("/api/v1/campus-pass/replay", get(get_campus_pass_replay))
        .route("/api/v1/demo/campus-pass", get(get_demo_campus_pass))
        .route(
            "/api/v1/demo/campus-pass/reset",
            post(post_demo_campus_pass_reset),
        )
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
        .route(
            "/api/v1/generated-objects/{object_id}/interactions",
            post(record_interaction),
        )
        .layer(TraceLayer::new_for_http())
        .with_state(AppState {
            service,
            career_fixture,
            world_exam_fixture,
            world_exam_session,
            roster_fixture,
            roster_session,
            academic_mirror_fixture,
            academic_mirror_session,
            performance_center_fixture,
            performance_center_session,
            opportunity_market_fixture,
            opportunity_market_session,
            coach_scouting_fixture,
            coach_scouting_session,
            campus_life_fixture,
            campus_life_session,
            campus_pass_fixture,
            campus_pass_session,
            ai_gateway,
            development_profile,
        })
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

async fn get_ai_status(State(state): State<AppState>) -> Json<AiGatewayStatus> {
    Json(state.ai_gateway.status().await)
}

async fn post_ai_advice(
    State(state): State<AppState>,
    Json(request): Json<AiAdviceRequest>,
) -> Result<Json<AiAdvice>, ApiError> {
    request.validate().map_err(ai_request_error)?;
    let advice = match state.ai_gateway.advise(&request).await {
        Ok(advice) => advice,
        Err(AiGatewayError::NotConfigured) => {
            rules_fallback_advice(&request, Some("模型凭据未配置"))
        }
        Err(AiGatewayError::ProviderUnavailable(_)) => {
            rules_fallback_advice(&request, Some("模型服务暂时不可用"))
        }
        Err(AiGatewayError::InvalidResponse(_)) => {
            rules_fallback_advice(&request, Some("模型返回的内容暂时读不懂"))
        }
        Err(error @ AiGatewayError::InvalidRequest(_)) => return Err(ai_request_error(error)),
    };
    Ok(Json(advice))
}

fn ai_request_error(error: AiGatewayError) -> ApiError {
    ApiError::new(
        StatusCode::UNPROCESSABLE_ENTITY,
        "invalid_ai_request",
        error.to_string(),
        false,
    )
}

#[derive(Clone, Debug, Deserialize, Serialize)]
struct DevelopmentEvidence {
    label: String,
    detail: String,
    source_id: String,
}

#[derive(Clone, Debug, Deserialize)]
struct PrivateDevelopmentProfileFile {
    profile_version: String,
    display_alias: String,
    contains_direct_identifiers: bool,
    verified_experience: Vec<DevelopmentEvidence>,
    learning_now: Vec<DevelopmentEvidence>,
    goals: Vec<String>,
    source_boundary: String,
}

#[derive(Clone, Debug, Serialize)]
struct DevelopmentProfileResponse {
    configured: bool,
    data_mode: &'static str,
    profile_version: Option<String>,
    display_alias: Option<String>,
    verified_experience: Vec<DevelopmentEvidence>,
    learning_now: Vec<DevelopmentEvidence>,
    goals: Vec<String>,
    source_boundary: String,
    formal_decision: bool,
}

fn unavailable_development_profile(detail: &str) -> DevelopmentProfileResponse {
    DevelopmentProfileResponse {
        configured: false,
        data_mode: "local_private_profile",
        profile_version: None,
        display_alias: None,
        verified_experience: Vec::new(),
        learning_now: Vec::new(),
        goals: Vec::new(),
        source_boundary: detail.to_owned(),
        formal_decision: false,
    }
}

fn load_development_profile() -> DevelopmentProfileResponse {
    let path = std::env::var("J2K26_PRIVATE_PROFILE_PATH")
        .unwrap_or_else(|_| ".data/university2k26/private-profile.json".to_owned());
    let content = match std::fs::read_to_string(path) {
        Ok(content) => content,
        Err(_) => {
            return unavailable_development_profile(
                "还没有连接本地个人档案；当前继续使用南同学的演示经历。",
            );
        }
    };
    let profile: PrivateDevelopmentProfileFile = match serde_json::from_str(&content) {
        Ok(profile) => profile,
        Err(_) => {
            return unavailable_development_profile(
                "本地个人档案格式不对，本次没有读取其中任何内容。",
            );
        }
    };
    let evidence_is_bounded = profile.verified_experience.len() <= 24
        && profile.learning_now.len() <= 16
        && profile.goals.len() <= 12
        && profile
            .verified_experience
            .iter()
            .chain(profile.learning_now.iter())
            .all(|item| {
                !item.label.trim().is_empty()
                    && item.label.chars().count() <= 120
                    && !item.detail.trim().is_empty()
                    && item.detail.chars().count() <= 600
                    && !item.source_id.trim().is_empty()
                    && item.source_id.chars().count() <= 160
            });
    if profile.contains_direct_identifiers
        || profile.display_alias.trim().is_empty()
        || profile.display_alias.chars().count() > 40
        || profile.source_boundary.trim().is_empty()
        || !evidence_is_bounded
    {
        return unavailable_development_profile(
            "本地私有发展档案违反去标识或字段上限；未载入任何字段。",
        );
    }
    DevelopmentProfileResponse {
        configured: true,
        data_mode: "local_private_profile",
        profile_version: Some(profile.profile_version),
        display_alias: Some(profile.display_alias),
        verified_experience: profile.verified_experience,
        learning_now: profile.learning_now,
        goals: profile.goals,
        source_boundary: profile.source_boundary,
        formal_decision: false,
    }
}

async fn get_development_profile(
    State(state): State<AppState>,
) -> Json<DevelopmentProfileResponse> {
    Json(state.development_profile)
}

async fn get_current_semester(State(state): State<AppState>) -> Json<CareerSemester> {
    Json(state.career_fixture.semester)
}

async fn get_current_courses(State(state): State<AppState>) -> Json<Vec<CareerCourse>> {
    Json(state.career_fixture.courses)
}

async fn get_career_dashboard(State(state): State<AppState>) -> Json<CareerDashboard> {
    Json(build_career_dashboard(&state.career_fixture))
}

async fn get_career_course(
    State(state): State<AppState>,
    Path(course_id): Path<String>,
) -> Result<Json<CareerCourseDetail>, ApiError> {
    let course = state
        .career_fixture
        .courses
        .into_iter()
        .find(|candidate| candidate.id == course_id)
        .ok_or_else(|| {
            ApiError::new(
                StatusCode::NOT_FOUND,
                "not_found",
                format!("career course not found: {course_id}"),
                false,
            )
        })?;
    let linked_content =
        course
            .linked_published_id
            .as_ref()
            .map(|published_id| CareerLinkedContent {
                published_id: published_id.clone(),
                student_path: format!("/student/watch/{published_id}"),
                replay_path: format!("/smartcourse/replay/{published_id}"),
            });

    Ok(Json(CareerCourseDetail {
        schema_version: SCHEMA_VERSION.to_owned(),
        data_mode: "fixture".to_owned(),
        course,
        linked_content,
    }))
}

async fn get_demo_semester(State(state): State<AppState>) -> Json<CareerFixture> {
    Json(state.career_fixture)
}

async fn get_demo_dashboard(State(state): State<AppState>) -> Json<CareerDashboard> {
    Json(build_career_dashboard(&state.career_fixture))
}

#[derive(Debug, Serialize)]
struct WorldExamDetailResponse {
    schema_version: String,
    data_mode: String,
    source_boundary: String,
    event: ExamEvent,
    session: WorldExamSession,
}

#[derive(Debug, Serialize)]
struct WorldExamReplayResponse {
    schema_version: String,
    data_mode: String,
    event_id: String,
    student_id: String,
    status: j2k26_domain::ExamStatus,
    answers: Vec<ExamAnswerRecord>,
    timeline: Vec<j2k26_domain::ExamTimelineEvent>,
    source_boundary: String,
}

#[derive(Debug, Serialize)]
struct ExamBoxScoreResponse {
    schema_version: String,
    data_mode: String,
    student_id: String,
    event_id: String,
    box_score: ExamBoxScore,
    privacy: &'static str,
}

#[derive(Debug, Deserialize)]
struct WarmupAttemptRequest {
    answer: String,
}

#[derive(Debug, Serialize)]
struct WarmupAttemptResponse {
    schema_version: String,
    data_mode: String,
    attempt: WarmupAttempt,
    explanation: String,
    formal_grade_impact: bool,
}

#[derive(Debug, Deserialize)]
struct ExamCheckpointRequest {
    item_id: String,
    completed: bool,
}

#[derive(Debug, Serialize)]
struct ExamCheckpointResponse {
    schema_version: String,
    data_mode: String,
    checkpoint: ExamCheckpoint,
}

#[derive(Debug, Deserialize)]
struct ExamAnswerRequest {
    question_id: String,
    response: String,
    source_checked: bool,
    #[serde(default)]
    challenged_claim_ids: Vec<String>,
}

#[derive(Debug, Serialize)]
struct ExamAnswerResponse {
    schema_version: String,
    data_mode: String,
    answer: ExamAnswerRecord,
    formal_grade_impact: bool,
}

#[derive(Debug, Deserialize)]
struct ReflectionRequest {
    worked: String,
    blocked: String,
    next_adjustment: String,
    share_with_mentor: bool,
    share_expires_at: Option<String>,
    #[serde(default)]
    archive: bool,
}

async fn get_exam_calendar(State(state): State<AppState>) -> Json<Vec<ExamEvent>> {
    Json(vec![state.world_exam_fixture.event])
}

async fn get_exam_detail(
    State(state): State<AppState>,
    Path(exam_id): Path<String>,
) -> Result<Json<WorldExamDetailResponse>, ApiError> {
    require_exam_id(&state, &exam_id)?;
    let session = lock_world_exam_session(&state)?.clone();
    Ok(Json(WorldExamDetailResponse {
        schema_version: SCHEMA_VERSION.to_owned(),
        data_mode: "fixture".to_owned(),
        source_boundary: state.world_exam_fixture.source_boundary.clone(),
        event: state.world_exam_fixture.event.clone(),
        session,
    }))
}

async fn get_exam_briefing(
    State(state): State<AppState>,
    Path(exam_id): Path<String>,
) -> Result<Json<PreGameBriefing>, ApiError> {
    require_exam_id(&state, &exam_id)?;
    Ok(Json(state.world_exam_fixture.briefing))
}

async fn get_exam_playbook(
    State(state): State<AppState>,
    Path(exam_id): Path<String>,
) -> Result<Json<Vec<ReviewPlaybookSection>>, ApiError> {
    require_exam_id(&state, &exam_id)?;
    Ok(Json(state.world_exam_fixture.playbook))
}

async fn get_exam_warmup(
    State(state): State<AppState>,
    Path(exam_id): Path<String>,
) -> Result<Json<WarmupQuestion>, ApiError> {
    require_exam_id(&state, &exam_id)?;
    Ok(Json(state.world_exam_fixture.warmup))
}

async fn post_warmup_attempt(
    State(state): State<AppState>,
    Path(exam_id): Path<String>,
    Json(request): Json<WarmupAttemptRequest>,
) -> Result<Json<WarmupAttemptResponse>, ApiError> {
    require_exam_id(&state, &exam_id)?;
    let attempt = lock_world_exam_session(&state)?
        .answer_warmup(&state.world_exam_fixture, request.answer)?;
    Ok(Json(WarmupAttemptResponse {
        schema_version: SCHEMA_VERSION.to_owned(),
        data_mode: "fixture".to_owned(),
        attempt,
        explanation: state.world_exam_fixture.warmup.explanation.clone(),
        formal_grade_impact: false,
    }))
}

async fn post_warmup_skip(
    State(state): State<AppState>,
    Path(exam_id): Path<String>,
) -> Result<Json<WorldExamSession>, ApiError> {
    require_exam_id(&state, &exam_id)?;
    let mut session = lock_world_exam_session(&state)?;
    session.skip_warmup()?;
    Ok(Json(session.clone()))
}

async fn post_exam_checkpoint(
    State(state): State<AppState>,
    Path(exam_id): Path<String>,
    Json(request): Json<ExamCheckpointRequest>,
) -> Result<Json<ExamCheckpointResponse>, ApiError> {
    require_exam_id(&state, &exam_id)?;
    let checkpoint = lock_world_exam_session(&state)?.save_checkpoint(
        &state.world_exam_fixture,
        request.item_id,
        request.completed,
    )?;
    Ok(Json(ExamCheckpointResponse {
        schema_version: SCHEMA_VERSION.to_owned(),
        data_mode: "fixture".to_owned(),
        checkpoint,
    }))
}

async fn post_exam_answer(
    State(state): State<AppState>,
    Path(exam_id): Path<String>,
    Json(request): Json<ExamAnswerRequest>,
) -> Result<Json<ExamAnswerResponse>, ApiError> {
    require_exam_id(&state, &exam_id)?;
    let answer = lock_world_exam_session(&state)?.submit_answer(
        &state.world_exam_fixture,
        request.question_id,
        request.response,
        request.source_checked,
        request.challenged_claim_ids,
    )?;
    Ok(Json(ExamAnswerResponse {
        schema_version: SCHEMA_VERSION.to_owned(),
        data_mode: "fixture".to_owned(),
        answer,
        formal_grade_impact: false,
    }))
}

async fn post_exam_complete(
    State(state): State<AppState>,
    Path(exam_id): Path<String>,
) -> Result<Json<WorldExamSession>, ApiError> {
    require_exam_id(&state, &exam_id)?;
    let mut session = lock_world_exam_session(&state)?;
    session.finish_match(&state.world_exam_fixture)?;
    Ok(Json(session.clone()))
}

async fn get_exam_replay(
    State(state): State<AppState>,
    Path(exam_id): Path<String>,
) -> Result<Json<WorldExamReplayResponse>, ApiError> {
    require_exam_id(&state, &exam_id)?;
    let session = lock_world_exam_session(&state)?.clone();
    if !matches!(
        session.status,
        j2k26_domain::ExamStatus::Review | j2k26_domain::ExamStatus::Archived
    ) {
        return Err(ApiError::new(
            StatusCode::CONFLICT,
            "exam_not_in_review",
            "Replay is available after the Key Match is completed.",
            true,
        ));
    }
    Ok(Json(WorldExamReplayResponse {
        schema_version: SCHEMA_VERSION.to_owned(),
        data_mode: "fixture".to_owned(),
        event_id: session.event_id,
        student_id: session.student_id,
        status: session.status,
        answers: session.answers,
        timeline: session.timeline,
        source_boundary: state.world_exam_fixture.source_boundary,
    }))
}

async fn get_exam_box_score(
    State(state): State<AppState>,
    Path(exam_id): Path<String>,
) -> Result<Json<ExamBoxScoreResponse>, ApiError> {
    require_exam_id(&state, &exam_id)?;
    let session = lock_world_exam_session(&state)?.clone();
    Ok(Json(ExamBoxScoreResponse {
        schema_version: SCHEMA_VERSION.to_owned(),
        data_mode: "fixture".to_owned(),
        student_id: session.student_id.clone(),
        event_id: session.event_id.clone(),
        box_score: build_exam_box_score(&session, &state.world_exam_fixture),
        privacy: "private_student_only",
    }))
}

async fn put_exam_reflection(
    State(state): State<AppState>,
    Path(exam_id): Path<String>,
    Json(request): Json<ReflectionRequest>,
) -> Result<Json<WorldExamSession>, ApiError> {
    require_exam_id(&state, &exam_id)?;
    let mut session = lock_world_exam_session(&state)?;
    session.save_reflection(PostGameReflection {
        worked: request.worked,
        blocked: request.blocked,
        next_adjustment: request.next_adjustment,
        share_with_mentor: request.share_with_mentor,
        share_expires_at: request.share_expires_at,
    })?;
    if request.archive {
        session.archive()?;
    }
    Ok(Json(session.clone()))
}

async fn get_demo_world_exam(State(state): State<AppState>) -> Json<WorldExamFixture> {
    Json(state.world_exam_fixture)
}

async fn post_demo_world_exam_reset(
    State(state): State<AppState>,
) -> Result<Json<WorldExamSession>, ApiError> {
    let reset = WorldExamSession::from_fixture(&state.world_exam_fixture);
    let mut session = lock_world_exam_session(&state)?;
    session.clone_from(&reset);
    Ok(Json(session.clone()))
}

fn require_exam_id(state: &AppState, exam_id: &str) -> Result<(), ApiError> {
    if state.world_exam_fixture.event.id == exam_id {
        Ok(())
    } else {
        Err(ApiError::new(
            StatusCode::NOT_FOUND,
            "exam_not_found",
            format!("exam event not found: {exam_id}"),
            false,
        ))
    }
}

fn lock_world_exam_session(state: &AppState) -> Result<MutexGuard<'_, WorldExamSession>, ApiError> {
    state.world_exam_session.lock().map_err(|_| {
        ApiError::new(
            StatusCode::INTERNAL_SERVER_ERROR,
            "exam_session_unavailable",
            "The local World Exam fixture session could not be read.",
            true,
        )
    })
}

#[derive(Debug, Deserialize)]
struct RosterPinsRequest {
    active_pin_ids: Vec<String>,
}

#[derive(Debug, Deserialize)]
struct RosterSolveRequest {
    goal_order: Option<Vec<String>>,
    preferences: Option<RosterPreferences>,
    solver_protocol: Option<String>,
}

#[derive(Debug, Deserialize)]
struct RosterWhatIfRequest {
    branch_name: String,
}

#[derive(Debug, Serialize)]
struct RosterPlansResponse {
    schema_version: String,
    data_mode: String,
    solver_status: String,
    solver_protocol: String,
    protocol_status: String,
    constraint_model: RosterConstraintModel,
    plans: Vec<SemesterPlan>,
    unsat: Option<RosterUnsatisfiableExplanation>,
    is_simulation: bool,
    is_formal_enrollment: bool,
    source_boundary: String,
}

#[derive(Debug, Serialize)]
struct RosterConstraintModel {
    catalog_channels: Vec<String>,
    hard_constraints: Vec<String>,
    soft_preferences: Vec<String>,
    supports_minimal_unsat_core: bool,
    supports_deterministic_lock: bool,
    mutates_formal_enrollment: bool,
}

#[derive(Debug, Serialize)]
struct RosterPinsResponse {
    schema_version: String,
    data_mode: String,
    pins: Vec<RosterPin>,
}

#[derive(Debug, Serialize)]
struct RosterCatalogResponse {
    schema_version: String,
    data_mode: String,
    semester: String,
    catalog_version: String,
    courses: Vec<RosterCourseSpec>,
    source_boundary: String,
}

#[derive(Debug, Serialize)]
struct RosterImportSourceCapability {
    institution: String,
    allowed_dataset_scopes: Vec<String>,
    accepted_locator_prefixes: Vec<String>,
    validation_only: bool,
    authorization_gate: String,
    rejected_data_classes: Vec<String>,
}

#[derive(Debug, Serialize)]
struct RosterImportCapabilitiesResponse {
    schema_version: String,
    data_mode: String,
    sources: Vec<RosterImportSourceCapability>,
    solver_protocol: String,
    current_backend: String,
    import_state: String,
    source_boundary: String,
}

fn roster_constraint_model() -> RosterConstraintModel {
    RosterConstraintModel {
        catalog_channels: vec![
            "fixture::university2k26".to_owned(),
            "uarizona::public_course_catalog (after validation and human promotion)".to_owned(),
            "hebut::user_authorized_course_catalog (after validation and human promotion)"
                .to_owned(),
        ],
        hard_constraints: vec![
            "prerequisite".to_owned(),
            "corequisite".to_owned(),
            "time_conflict".to_owned(),
            "credit_limit".to_owned(),
            "exclusion".to_owned(),
            "student_pin".to_owned(),
        ],
        soft_preferences: vec![
            "time_of_day".to_owned(),
            "compactness".to_owned(),
            "variety".to_owned(),
            "stability".to_owned(),
        ],
        supports_minimal_unsat_core: true,
        supports_deterministic_lock: true,
        mutates_formal_enrollment: false,
    }
}

async fn get_roster_prefix(State(state): State<AppState>) -> Result<Json<RosterPrefix>, ApiError> {
    Ok(Json(lock_roster_session(&state)?.prefix.clone()))
}

async fn put_roster_prefix(
    State(state): State<AppState>,
    Json(prefix): Json<RosterPrefix>,
) -> Result<Json<RosterPrefix>, ApiError> {
    let mut session = lock_roster_session(&state)?;
    let prefix = session.update_prefix(&state.roster_fixture, prefix)?;
    Ok(Json(prefix))
}

async fn put_roster_pins(
    State(state): State<AppState>,
    Json(request): Json<RosterPinsRequest>,
) -> Result<Json<RosterPinsResponse>, ApiError> {
    let pins =
        lock_roster_session(&state)?.update_pins(&state.roster_fixture, &request.active_pin_ids)?;
    Ok(Json(RosterPinsResponse {
        schema_version: SCHEMA_VERSION.to_owned(),
        data_mode: "fixture".to_owned(),
        pins,
    }))
}

async fn post_roster_solve(
    State(state): State<AppState>,
    Json(request): Json<RosterSolveRequest>,
) -> Result<Json<RosterPlansResponse>, ApiError> {
    if request
        .solver_protocol
        .as_deref()
        .is_some_and(|protocol| protocol != ROSTER_SOLVER_PROTOCOL)
    {
        return Err(DomainError::InvariantViolation(format!(
            "unsupported Roster Lab solver protocol; expected {ROSTER_SOLVER_PROTOCOL}"
        ))
        .into());
    }
    let plans = lock_roster_session(&state)?.solve(
        &state.roster_fixture,
        request.goal_order,
        request.preferences,
    )?;
    Ok(Json(RosterPlansResponse {
        schema_version: SCHEMA_VERSION.to_owned(),
        data_mode: "fixture".to_owned(),
        solver_status: "best_feasible_deterministic_fixture".to_owned(),
        solver_protocol: ROSTER_SOLVER_PROTOCOL.to_owned(),
        protocol_status: "reference_contract_fixture".to_owned(),
        constraint_model: roster_constraint_model(),
        plans,
        unsat: None,
        is_simulation: false,
        is_formal_enrollment: false,
        source_boundary: state.roster_fixture.source_boundary,
    }))
}

async fn post_roster_what_if(
    State(state): State<AppState>,
    Json(request): Json<RosterWhatIfRequest>,
) -> Result<Json<RosterPlansResponse>, ApiError> {
    let plans =
        lock_roster_session(&state)?.what_if(&state.roster_fixture, &request.branch_name)?;
    Ok(Json(RosterPlansResponse {
        schema_version: SCHEMA_VERSION.to_owned(),
        data_mode: "fixture".to_owned(),
        solver_status: "best_feasible_deterministic_fixture".to_owned(),
        solver_protocol: ROSTER_SOLVER_PROTOCOL.to_owned(),
        protocol_status: "reference_contract_fixture".to_owned(),
        constraint_model: roster_constraint_model(),
        plans,
        unsat: None,
        is_simulation: true,
        is_formal_enrollment: false,
        source_boundary: state.roster_fixture.source_boundary,
    }))
}

async fn get_roster_plan_diff(
    State(state): State<AppState>,
    Path(plan_id): Path<String>,
) -> Result<Json<RosterTransaction>, ApiError> {
    let transaction = lock_roster_session(&state)?.transaction(&state.roster_fixture, &plan_id)?;
    Ok(Json(transaction))
}

async fn post_roster_plan_lock(
    State(state): State<AppState>,
    Path(plan_id): Path<String>,
) -> Result<Json<SemesterLock>, ApiError> {
    let lock = lock_roster_session(&state)?.save_lock(&state.roster_fixture, &plan_id)?;
    Ok(Json(lock))
}

async fn get_roster_catalog(State(state): State<AppState>) -> Json<RosterCatalogResponse> {
    Json(RosterCatalogResponse {
        schema_version: SCHEMA_VERSION.to_owned(),
        data_mode: "fixture".to_owned(),
        semester: state.roster_fixture.semester,
        catalog_version: state.roster_fixture.catalog_version,
        courses: state.roster_fixture.catalog,
        source_boundary: state.roster_fixture.source_boundary,
    })
}

async fn get_roster_import_capabilities() -> Json<RosterImportCapabilitiesResponse> {
    Json(RosterImportCapabilitiesResponse {
        schema_version: SCHEMA_VERSION.to_owned(),
        data_mode: "capability".to_owned(),
        sources: vec![
            RosterImportSourceCapability {
                institution: "uarizona".to_owned(),
                allowed_dataset_scopes: vec!["public_course_catalog".to_owned()],
                accepted_locator_prefixes: vec![
                    "https://catalog.arizona.edu/".to_owned(),
                    "https://uaccess.schedule.arizona.edu/".to_owned(),
                    "https://uacourses-api.uaccess.arizona.edu/".to_owned(),
                ],
                validation_only: true,
                authorization_gate:
                    "Public catalog metadata only; verify current terms and promote the receipt manually."
                        .to_owned(),
                rejected_data_classes: vec![
                    "student_enrollment".to_owned(),
                    "grades".to_owned(),
                    "holds".to_owned(),
                    "financial_data".to_owned(),
                ],
            },
            RosterImportSourceCapability {
                institution: "hebut".to_owned(),
                allowed_dataset_scopes: vec![
                    "public_course_catalog".to_owned(),
                    "user_authorized_course_catalog".to_owned(),
                ],
                accepted_locator_prefixes: vec![
                    "https://".to_owned(),
                    "local-authorized://".to_owned(),
                ],
                validation_only: true,
                authorization_gate:
                    "The user must supply or authorize the catalog export; local paths are never returned."
                        .to_owned(),
                rejected_data_classes: vec![
                    "student_identity".to_owned(),
                    "grades".to_owned(),
                    "payments".to_owned(),
                    "formal_enrollment_actions".to_owned(),
                ],
            },
        ],
        solver_protocol: ROSTER_SOLVER_PROTOCOL.to_owned(),
        current_backend: "deterministic_fixture_reference".to_owned(),
        import_state: "no_real_catalog_promoted".to_owned(),
        source_boundary:
            "Validation receipts do not import, persist, enroll, reserve seats or prove transfer equivalency."
                .to_owned(),
    })
}

async fn post_roster_import_validate(
    Json(request): Json<CatalogImportValidationRequest>,
) -> Result<Json<CatalogImportValidationReceipt>, ApiError> {
    Ok(Json(request.validate()?))
}

async fn get_roster_unsat(State(state): State<AppState>) -> Json<RosterUnsatisfiableExplanation> {
    Json(state.roster_fixture.unsat)
}

async fn get_demo_roster(State(state): State<AppState>) -> Json<RosterFixture> {
    Json(state.roster_fixture)
}

async fn post_demo_roster_reset(
    State(state): State<AppState>,
) -> Result<Json<RosterSession>, ApiError> {
    let reset = RosterSession::from_fixture(&state.roster_fixture);
    let mut session = lock_roster_session(&state)?;
    session.clone_from(&reset);
    Ok(Json(session.clone()))
}

fn lock_roster_session(state: &AppState) -> Result<MutexGuard<'_, RosterSession>, ApiError> {
    state.roster_session.lock().map_err(|_| {
        ApiError::new(
            StatusCode::INTERNAL_SERVER_ERROR,
            "roster_session_unavailable",
            "The local Roster Lab fixture session could not be read.",
            true,
        )
    })
}

#[derive(Debug, Serialize)]
struct MirrorSourcesResponse {
    schema_version: String,
    data_mode: String,
    read_only: bool,
    sources: Vec<MirrorDataSource>,
}

#[derive(Debug, Serialize)]
struct MirrorSnapshotsResponse {
    schema_version: String,
    data_mode: String,
    snapshots: Vec<MirrorRawSnapshot>,
}

#[derive(Debug, Serialize)]
struct MirrorRecordsResponse {
    schema_version: String,
    data_mode: String,
    read_only: bool,
    records: Vec<MirrorNormalizedRecord>,
}

#[derive(Debug, Serialize)]
struct MirrorProvenanceResponse {
    schema_version: String,
    data_mode: String,
    record_id: String,
    fields: BTreeMap<String, MirrorNormalizedField>,
}

#[derive(Debug, Serialize)]
struct MirrorConflictsResponse {
    schema_version: String,
    data_mode: String,
    conflicts: Vec<MirrorConflictRecord>,
}

#[derive(Debug, Serialize)]
struct MirrorConsentsResponse {
    schema_version: String,
    data_mode: String,
    consents: Vec<MirrorConsentRecord>,
}

#[derive(Debug, Serialize)]
struct MirrorAuditResponse {
    schema_version: String,
    data_mode: String,
    append_only: bool,
    events: Vec<MirrorAuditEvent>,
}

#[derive(Debug, Deserialize)]
struct MirrorSourceRegistrationRequest {
    name: String,
    system_type: String,
    responsible_party: String,
    field_scope: Vec<String>,
    correction_route: String,
}

#[derive(Debug, Deserialize)]
struct MirrorSyncRequest {
    mode: String,
}

#[derive(Debug, Serialize)]
struct MirrorSyncResponse {
    schema_version: String,
    data_mode: String,
    status: String,
    adapter_kind: String,
    snapshot: MirrorRawSnapshot,
    record_count: usize,
    previous_snapshot_preserved: bool,
    fallback_available: bool,
}

#[derive(Debug, Deserialize)]
struct MirrorConflictResolutionRequest {
    chosen_option_id: String,
    reason: String,
}

#[derive(Debug, Deserialize)]
struct MirrorCorrectionRequest {
    record_id: String,
    reason: String,
}

#[derive(Debug, Deserialize)]
struct MirrorExportRequest {
    archive_type: String,
}

async fn get_mirror_sources(
    State(state): State<AppState>,
) -> Result<Json<MirrorSourcesResponse>, ApiError> {
    let session = lock_academic_mirror_session(&state)?;
    Ok(Json(MirrorSourcesResponse {
        schema_version: SCHEMA_VERSION.to_owned(),
        data_mode: "fixture".to_owned(),
        read_only: true,
        sources: session.sources.clone(),
    }))
}

async fn post_mirror_source(
    State(state): State<AppState>,
    Json(request): Json<MirrorSourceRegistrationRequest>,
) -> Result<(StatusCode, Json<MirrorDataSource>), ApiError> {
    let mut session = lock_academic_mirror_session(&state)?;
    let next_id = format!("ds-local-{:02}", session.sources.len() + 1);
    let demo_fixture = request.system_type == "demo_fixture";
    let source = MirrorDataSource {
        id: next_id,
        name: request.name,
        system_type: request.system_type,
        adapter_kind: if demo_fixture {
            "demo_fixture".to_owned()
        } else {
            "file_import".to_owned()
        },
        responsible_party: request.responsible_party,
        auth_method: if demo_fixture {
            "manual".to_owned()
        } else {
            "file_import".to_owned()
        },
        field_scope: request.field_scope,
        refresh_method: if demo_fixture {
            "on_demand".to_owned()
        } else {
            "manual".to_owned()
        },
        retention_days: 14,
        correction_route: request.correction_route,
        consent_required: true,
        status: "active".to_owned(),
        authorized: true,
        declared_authority: if demo_fixture {
            MirrorAuthorityLevel::DemoFixture
        } else {
            MirrorAuthorityLevel::AuthorizedMirror
        },
        last_synced_at: None,
        created_at: "2026-07-24T18:10:00+08:00".to_owned(),
        updated_at: "2026-07-24T18:10:00+08:00".to_owned(),
    };
    let source = session.register_source(source)?;
    Ok((StatusCode::CREATED, Json(source)))
}

async fn post_mirror_sync(
    State(state): State<AppState>,
    Path(source_id): Path<String>,
    Json(request): Json<MirrorSyncRequest>,
) -> Result<Json<MirrorSyncResponse>, ApiError> {
    if request.mode != "full" {
        return Err(ApiError::new_with_fallback(
            StatusCode::UNPROCESSABLE_ENTITY,
            "SYNC_FAILED",
            "Incremental sync is deferred in P1; retry with mode=full.",
            false,
            true,
        ));
    }
    let mut session = lock_academic_mirror_session(&state)?;
    let adapter_kind = session
        .sources
        .iter()
        .find(|source| source.id == source_id)
        .map(|source| source.adapter_kind.clone())
        .ok_or_else(|| {
            ApiError::new(
                StatusCode::NOT_FOUND,
                "SOURCE_NOT_FOUND",
                format!("Academic Mirror source not found: {source_id}"),
                false,
            )
        })?;
    let snapshot = session.sync_source(&source_id)?;
    Ok(Json(MirrorSyncResponse {
        schema_version: SCHEMA_VERSION.to_owned(),
        data_mode: "fixture".to_owned(),
        status: "completed".to_owned(),
        adapter_kind,
        snapshot,
        record_count: session.records.len(),
        previous_snapshot_preserved: true,
        fallback_available: true,
    }))
}

async fn get_mirror_snapshots(
    State(state): State<AppState>,
) -> Result<Json<MirrorSnapshotsResponse>, ApiError> {
    Ok(Json(MirrorSnapshotsResponse {
        schema_version: SCHEMA_VERSION.to_owned(),
        data_mode: "fixture".to_owned(),
        snapshots: lock_academic_mirror_session(&state)?.snapshots.clone(),
    }))
}

async fn get_mirror_records(
    State(state): State<AppState>,
) -> Result<Json<MirrorRecordsResponse>, ApiError> {
    Ok(Json(MirrorRecordsResponse {
        schema_version: SCHEMA_VERSION.to_owned(),
        data_mode: "fixture".to_owned(),
        read_only: true,
        records: lock_academic_mirror_session(&state)?.records.clone(),
    }))
}

async fn get_mirror_provenance(
    State(state): State<AppState>,
    Path(record_id): Path<String>,
) -> Result<Json<MirrorProvenanceResponse>, ApiError> {
    let session = lock_academic_mirror_session(&state)?;
    let record = session
        .records
        .iter()
        .find(|record| record.id == record_id)
        .ok_or_else(|| {
            ApiError::new(
                StatusCode::NOT_FOUND,
                "RECORD_NOT_FOUND",
                format!("Academic Mirror record not found: {record_id}"),
                false,
            )
        })?;
    Ok(Json(MirrorProvenanceResponse {
        schema_version: SCHEMA_VERSION.to_owned(),
        data_mode: "fixture".to_owned(),
        record_id,
        fields: record.fields.clone(),
    }))
}

async fn delete_mirror_record(
    State(state): State<AppState>,
    Path(record_id): Path<String>,
) -> Result<Json<serde_json::Value>, ApiError> {
    lock_academic_mirror_session(&state)?.delete_non_authoritative_copy(&record_id)?;
    Ok(Json(serde_json::json!({
        "schema_version": SCHEMA_VERSION,
        "data_mode": "fixture",
        "deleted_record_id": record_id,
        "formal_source_affected": false
    })))
}

async fn get_mirror_conflicts(
    State(state): State<AppState>,
) -> Result<Json<MirrorConflictsResponse>, ApiError> {
    Ok(Json(MirrorConflictsResponse {
        schema_version: SCHEMA_VERSION.to_owned(),
        data_mode: "fixture".to_owned(),
        conflicts: lock_academic_mirror_session(&state)?.conflicts.clone(),
    }))
}

async fn put_mirror_conflict_resolution(
    State(state): State<AppState>,
    Path(conflict_id): Path<String>,
    Json(request): Json<MirrorConflictResolutionRequest>,
) -> Result<Json<MirrorConflictRecord>, ApiError> {
    let conflict = lock_academic_mirror_session(&state)?.resolve_conflict(
        &conflict_id,
        &request.chosen_option_id,
        &request.reason,
    )?;
    Ok(Json(conflict))
}

async fn get_mirror_consents(
    State(state): State<AppState>,
) -> Result<Json<MirrorConsentsResponse>, ApiError> {
    Ok(Json(MirrorConsentsResponse {
        schema_version: SCHEMA_VERSION.to_owned(),
        data_mode: "fixture".to_owned(),
        consents: lock_academic_mirror_session(&state)?.consents.clone(),
    }))
}

async fn post_mirror_consent(
    State(state): State<AppState>,
    Json(consent): Json<MirrorConsentRecord>,
) -> Result<Json<MirrorConsentRecord>, ApiError> {
    let consent = lock_academic_mirror_session(&state)?.upsert_consent(consent)?;
    Ok(Json(consent))
}

async fn post_mirror_correction(
    State(state): State<AppState>,
    Json(request): Json<MirrorCorrectionRequest>,
) -> Result<(StatusCode, Json<serde_json::Value>), ApiError> {
    lock_academic_mirror_session(&state)?
        .request_correction(&request.record_id, &request.reason)?;
    Ok((
        StatusCode::ACCEPTED,
        Json(serde_json::json!({
            "schema_version": SCHEMA_VERSION,
            "data_mode": "fixture",
            "status": "queued_for_human_review",
            "record_id": request.record_id,
            "formal_record_changed": false
        })),
    ))
}

async fn post_mirror_export(
    State(state): State<AppState>,
    Json(request): Json<MirrorExportRequest>,
) -> Result<Json<serde_json::Value>, ApiError> {
    if !matches!(
        request.archive_type.as_str(),
        "readable_untrusted" | "trusted_archive_contract_fixture"
    ) {
        return Err(ApiError::new(
            StatusCode::UNPROCESSABLE_ENTITY,
            "INVALID_ARCHIVE_TYPE",
            "archive_type must be readable_untrusted or trusted_archive_contract_fixture",
            false,
        ));
    }
    let mut session = lock_academic_mirror_session(&state)?;
    session.record_export(&request.archive_type)?;
    let response = if request.archive_type == "readable_untrusted" {
        serde_json::json!({
            "schema_version": SCHEMA_VERSION,
            "archive_type": "readable_untrusted",
            "data_mode": "fixture",
            "student_id": state.academic_mirror_fixture.student_id,
            "authoritative": false,
            "records": session.records,
            "consents": session.consents,
            "source_boundary": state.academic_mirror_fixture.source_boundary,
            "audit_receipt": {
                "event_count": session.audit.len(),
                "latest_event_hash": session.audit.last().map(|event| event.event_hash.clone())
            }
        })
    } else {
        serde_json::json!({
            "schema_version": SCHEMA_VERSION,
            "archive_type": "trusted_archive_contract_fixture",
            "data_mode": "fixture",
            "student_id": state.academic_mirror_fixture.student_id,
            "content_hash": "fnv1a-demo-contract-only",
            "issuer": "DEMO_NOT_AN_ISSUER",
            "signature_status": "demo_not_signed",
            "encryption_status": "not_encrypted",
            "import_disposition": "quarantine_and_preview_only",
            "authoritative": false,
            "warning": "Contract fixture only; no real issuer signature, key chain or encryption."
        })
    };
    Ok(Json(response))
}

async fn get_mirror_audit(
    State(state): State<AppState>,
) -> Result<Json<MirrorAuditResponse>, ApiError> {
    Ok(Json(MirrorAuditResponse {
        schema_version: SCHEMA_VERSION.to_owned(),
        data_mode: "fixture".to_owned(),
        append_only: true,
        events: lock_academic_mirror_session(&state)?.audit.clone(),
    }))
}

async fn get_demo_mirror(State(state): State<AppState>) -> Json<AcademicMirrorFixture> {
    Json(state.academic_mirror_fixture)
}

async fn post_demo_mirror_reset(
    State(state): State<AppState>,
) -> Result<Json<AcademicMirrorSession>, ApiError> {
    let reset = AcademicMirrorSession::from_fixture(&state.academic_mirror_fixture);
    let mut session = lock_academic_mirror_session(&state)?;
    session.clone_from(&reset);
    Ok(Json(session.clone()))
}

fn lock_academic_mirror_session(
    state: &AppState,
) -> Result<MutexGuard<'_, AcademicMirrorSession>, ApiError> {
    state.academic_mirror_session.lock().map_err(|_| {
        ApiError::new(
            StatusCode::INTERNAL_SERVER_ERROR,
            "MIRROR_SESSION_UNAVAILABLE",
            "The local Academic Mirror fixture session could not be read.",
            true,
        )
    })
}

#[derive(Debug, Serialize)]
struct PerformanceDashboardResponse {
    schema_version: String,
    data_mode: String,
    student_id: String,
    private_by_default: bool,
    comparison_mode: String,
    source_boundary: String,
    last_updated_at: String,
    forbidden_inputs: Vec<String>,
    metrics: Vec<PerformanceMetricDefinition>,
    observations: Vec<PerformanceObservation>,
    abilities: Vec<PerformanceAbilityDimension>,
    load_signals: Vec<PerformanceLoadSignal>,
    support_actions: Vec<PerformanceSupportAction>,
    badges: Vec<PerformanceBadge>,
    evidence: Vec<PerformanceEvidence>,
    research_gate: PerformanceResearchGate,
    session: PerformanceCenterSession,
}

#[derive(Debug, Serialize)]
struct PerformanceMetricsResponse {
    schema_version: String,
    data_mode: String,
    comparison_mode: String,
    metrics: Vec<PerformanceMetricDefinition>,
    observations: Vec<PerformanceObservation>,
}

#[derive(Debug, Serialize)]
struct PerformanceRecommendationsResponse {
    schema_version: String,
    data_mode: String,
    recommendations: Vec<PerformanceRecommendation>,
}

#[derive(Debug, Serialize)]
struct PerformanceReplayResponse {
    schema_version: String,
    data_mode: String,
    append_only: bool,
    events: Vec<PerformanceAuditEvent>,
}

#[derive(Debug, Deserialize)]
struct PerformanceRecommendationRequest {
    status: String,
}

#[derive(Debug, Deserialize)]
struct PerformanceClimateRequest {
    variant: String,
}

#[derive(Debug, Deserialize)]
struct PerformanceCorrectionRequest {
    target_id: String,
    reason: String,
}

#[derive(Debug, Deserialize)]
struct PerformanceHarmRequest {
    description: String,
}

#[derive(Debug, Deserialize)]
struct PerformanceExportRequest {
    archive_type: String,
}

async fn get_performance_dashboard(
    State(state): State<AppState>,
) -> Result<Json<PerformanceDashboardResponse>, ApiError> {
    let session = lock_performance_center_session(&state)?.clone();
    let fixture = &state.performance_center_fixture;
    Ok(Json(PerformanceDashboardResponse {
        schema_version: SCHEMA_VERSION.to_owned(),
        data_mode: "fixture".to_owned(),
        student_id: fixture.student_id.clone(),
        private_by_default: fixture.private_by_default,
        comparison_mode: fixture.comparison_mode.clone(),
        source_boundary: fixture.source_boundary.clone(),
        last_updated_at: fixture.last_updated_at.clone(),
        forbidden_inputs: fixture.forbidden_inputs.clone(),
        metrics: fixture.metrics.clone(),
        observations: fixture.observations.clone(),
        abilities: fixture.abilities.clone(),
        load_signals: fixture.load_signals.clone(),
        support_actions: fixture.support_actions.clone(),
        badges: fixture.badges.clone(),
        evidence: fixture.evidence.clone(),
        research_gate: fixture.research_gate.clone(),
        session,
    }))
}

async fn get_performance_metrics(
    State(state): State<AppState>,
) -> Json<PerformanceMetricsResponse> {
    Json(PerformanceMetricsResponse {
        schema_version: SCHEMA_VERSION.to_owned(),
        data_mode: "fixture".to_owned(),
        comparison_mode: state.performance_center_fixture.comparison_mode.clone(),
        metrics: state.performance_center_fixture.metrics,
        observations: state.performance_center_fixture.observations,
    })
}

async fn get_performance_evidence(
    State(state): State<AppState>,
    Path(evidence_id): Path<String>,
) -> Result<Json<PerformanceEvidence>, ApiError> {
    let evidence = state
        .performance_center_fixture
        .evidence
        .iter()
        .find(|item| item.id == evidence_id)
        .cloned()
        .ok_or_else(|| {
            ApiError::new(
                StatusCode::NOT_FOUND,
                "PERFORMANCE_EVIDENCE_NOT_FOUND",
                format!("Performance Center evidence not found: {evidence_id}"),
                false,
            )
        })?;
    Ok(Json(evidence))
}

async fn get_performance_recommendations(
    State(state): State<AppState>,
) -> Result<Json<PerformanceRecommendationsResponse>, ApiError> {
    Ok(Json(PerformanceRecommendationsResponse {
        schema_version: SCHEMA_VERSION.to_owned(),
        data_mode: "fixture".to_owned(),
        recommendations: lock_performance_center_session(&state)?
            .recommendations
            .clone(),
    }))
}

async fn put_performance_recommendation(
    State(state): State<AppState>,
    Path(recommendation_id): Path<String>,
    Json(request): Json<PerformanceRecommendationRequest>,
) -> Result<Json<PerformanceRecommendation>, ApiError> {
    let recommendation = lock_performance_center_session(&state)?
        .act_on_recommendation(&recommendation_id, &request.status)?;
    Ok(Json(recommendation))
}

async fn put_performance_climate(
    State(state): State<AppState>,
    Json(request): Json<PerformanceClimateRequest>,
) -> Result<Json<PerformanceCenterSession>, ApiError> {
    let mut session = lock_performance_center_session(&state)?;
    session.set_climate_variant(&state.performance_center_fixture, &request.variant)?;
    Ok(Json(session.clone()))
}

async fn post_performance_share(
    State(state): State<AppState>,
    Json(draft): Json<PerformanceShareDraft>,
) -> Result<(StatusCode, Json<PerformanceShareGrant>), ApiError> {
    let grant = lock_performance_center_session(&state)?
        .create_share_grant(&state.performance_center_fixture, draft)?;
    Ok((StatusCode::CREATED, Json(grant)))
}

async fn delete_performance_share(
    State(state): State<AppState>,
    Path(grant_id): Path<String>,
) -> Result<Json<PerformanceShareGrant>, ApiError> {
    let grant = lock_performance_center_session(&state)?.revoke_share_grant(&grant_id)?;
    Ok(Json(grant))
}

async fn post_performance_correction(
    State(state): State<AppState>,
    Json(request): Json<PerformanceCorrectionRequest>,
) -> Result<(StatusCode, Json<PerformanceCorrectionCase>), ApiError> {
    let correction = lock_performance_center_session(&state)?.request_correction(
        &state.performance_center_fixture,
        &request.target_id,
        &request.reason,
    )?;
    Ok((StatusCode::ACCEPTED, Json(correction)))
}

async fn post_performance_harm_signal(
    State(state): State<AppState>,
    Json(request): Json<PerformanceHarmRequest>,
) -> Result<(StatusCode, Json<PerformanceHarmSignal>), ApiError> {
    let signal = lock_performance_center_session(&state)?.report_harm(&request.description)?;
    Ok((StatusCode::ACCEPTED, Json(signal)))
}

async fn post_performance_export(
    State(state): State<AppState>,
    Json(request): Json<PerformanceExportRequest>,
) -> Result<Json<serde_json::Value>, ApiError> {
    if request.archive_type != "readable_untrusted" {
        return Err(ApiError::new(
            StatusCode::UNPROCESSABLE_ENTITY,
            "INVALID_ARCHIVE_TYPE",
            "Performance Center currently supports archive_type=readable_untrusted only.",
            false,
        ));
    }
    let mut session = lock_performance_center_session(&state)?;
    session.record_export();
    Ok(Json(serde_json::json!({
        "schema_version": SCHEMA_VERSION,
        "archive_type": "readable_untrusted",
        "data_mode": "fixture",
        "student_id": state.performance_center_fixture.student_id,
        "private": true,
        "authoritative": false,
        "comparison_mode": state.performance_center_fixture.comparison_mode,
        "metrics": state.performance_center_fixture.metrics,
        "observations": state.performance_center_fixture.observations,
        "abilities": state.performance_center_fixture.abilities,
        "badges": state.performance_center_fixture.badges,
        "status_label": session.status_label,
        "recommendations": session.recommendations,
        "share_grants": session.share_grants,
        "corrections": session.corrections,
        "harm_signals": session.harm_signals,
        "audit_receipt": {
            "event_count": session.audit.len(),
            "latest_event_hash": session.audit.last().map(|event| event.event_hash.clone())
        },
        "warning": "这是个人演示副本，不是成绩单、医疗记录、学校凭证或可信归档。"
    })))
}

async fn get_performance_replay(
    State(state): State<AppState>,
) -> Result<Json<PerformanceReplayResponse>, ApiError> {
    Ok(Json(PerformanceReplayResponse {
        schema_version: SCHEMA_VERSION.to_owned(),
        data_mode: "fixture".to_owned(),
        append_only: true,
        events: lock_performance_center_session(&state)?.audit.clone(),
    }))
}

async fn get_demo_performance(State(state): State<AppState>) -> Json<PerformanceCenterFixture> {
    Json(state.performance_center_fixture)
}

async fn post_demo_performance_reset(
    State(state): State<AppState>,
) -> Result<Json<PerformanceCenterSession>, ApiError> {
    let reset = PerformanceCenterSession::from_fixture(&state.performance_center_fixture);
    let mut session = lock_performance_center_session(&state)?;
    session.clone_from(&reset);
    Ok(Json(session.clone()))
}

fn lock_performance_center_session(
    state: &AppState,
) -> Result<MutexGuard<'_, PerformanceCenterSession>, ApiError> {
    state.performance_center_session.lock().map_err(|_| {
        ApiError::new(
            StatusCode::INTERNAL_SERVER_ERROR,
            "PERFORMANCE_SESSION_UNAVAILABLE",
            "The local Performance Center fixture session could not be read.",
            true,
        )
    })
}

#[derive(Debug, Serialize)]
struct OpportunityDetailResponse {
    schema_version: String,
    data_mode: String,
    opportunity: OpportunityRecord,
    rules: Vec<OpportunityEligibilityRule>,
    box_score: OpportunityBoxScore,
}

#[derive(Debug, Serialize)]
struct OpportunityProfileResponse {
    schema_version: String,
    data_mode: String,
    private: bool,
    fields: Vec<OpportunityProfileField>,
    selected_field_ids: Vec<String>,
    forbidden_field_ids: Vec<String>,
}

#[derive(Debug, Serialize)]
struct OpportunityReplayResponse {
    schema_version: String,
    data_mode: String,
    append_only: bool,
    reports: Vec<OpportunityReport>,
    notifications: Vec<j2k26_domain::OpportunityNotification>,
    events: Vec<OpportunityAuditEvent>,
}

#[derive(Debug, Deserialize)]
struct OpportunityProfileSelectionRequest {
    field_ids: Vec<String>,
}

#[derive(Debug, Deserialize)]
struct OpportunitySaveRequest {
    #[serde(default)]
    note: String,
}

#[derive(Debug, Deserialize)]
struct OpportunityDisclosureRequest {
    duration_days: u32,
}

#[derive(Debug, Deserialize)]
struct OpportunityExternalStatusRequest {
    student_confirmed: bool,
}

#[derive(Debug, Deserialize)]
struct OpportunityCapacityRequest {
    hours_per_week: f64,
    #[serde(default)]
    note: String,
}

#[derive(Debug, Deserialize)]
struct OpportunityPortfolioRequest {
    artifact_ids: Vec<String>,
}

#[derive(Debug, Deserialize)]
struct OpportunityReportRequest {
    report_type: String,
    reason: String,
}

async fn get_opportunities(State(state): State<AppState>) -> Json<Vec<OpportunityRecord>> {
    Json(state.opportunity_market_fixture.opportunities)
}

async fn get_opportunity_detail(
    State(state): State<AppState>,
    Path(opportunity_id): Path<String>,
) -> Result<Json<OpportunityDetailResponse>, ApiError> {
    let opportunity = state
        .opportunity_market_fixture
        .opportunities
        .iter()
        .find(|item| item.id == opportunity_id)
        .cloned()
        .ok_or_else(|| {
            ApiError::new(
                StatusCode::NOT_FOUND,
                "OPPORTUNITY_NOT_FOUND",
                format!("Opportunity Market item not found: {opportunity_id}"),
                false,
            )
        })?;
    let rule_ids = opportunity
        .eligibility_rule_ids
        .iter()
        .map(String::as_str)
        .collect::<std::collections::HashSet<_>>();
    let rules = state
        .opportunity_market_fixture
        .rules
        .iter()
        .filter(|item| rule_ids.contains(item.id.as_str()))
        .cloned()
        .collect();
    let box_score = lock_opportunity_market_session(&state)?
        .box_score(&state.opportunity_market_fixture, &opportunity_id)?;
    Ok(Json(OpportunityDetailResponse {
        schema_version: SCHEMA_VERSION.to_owned(),
        data_mode: "demo_fixture".to_owned(),
        opportunity,
        rules,
        box_score,
    }))
}

async fn post_opportunity_eligibility(
    State(state): State<AppState>,
    Path(opportunity_id): Path<String>,
) -> Result<Json<OpportunityEligibilityCheck>, ApiError> {
    let check = lock_opportunity_market_session(&state)?
        .check_eligibility(&state.opportunity_market_fixture, &opportunity_id)?;
    Ok(Json(check))
}

async fn get_opportunity_profile(
    State(state): State<AppState>,
) -> Result<Json<OpportunityProfileResponse>, ApiError> {
    let selected_field_ids = lock_opportunity_market_session(&state)?
        .selected_profile_field_ids
        .clone();
    Ok(Json(OpportunityProfileResponse {
        schema_version: SCHEMA_VERSION.to_owned(),
        data_mode: "demo_fixture".to_owned(),
        private: true,
        fields: state.opportunity_market_fixture.profile_fields,
        selected_field_ids,
        forbidden_field_ids: state.opportunity_market_fixture.forbidden_profile_field_ids,
    }))
}

async fn put_opportunity_profile(
    State(state): State<AppState>,
    Json(request): Json<OpportunityProfileSelectionRequest>,
) -> Result<Json<OpportunityProfileResponse>, ApiError> {
    let selected_field_ids = lock_opportunity_market_session(&state)?
        .replace_profile_selection(&state.opportunity_market_fixture, request.field_ids)?;
    Ok(Json(OpportunityProfileResponse {
        schema_version: SCHEMA_VERSION.to_owned(),
        data_mode: "demo_fixture".to_owned(),
        private: true,
        fields: state.opportunity_market_fixture.profile_fields,
        selected_field_ids,
        forbidden_field_ids: state.opportunity_market_fixture.forbidden_profile_field_ids,
    }))
}

async fn post_opportunity_match(
    State(state): State<AppState>,
) -> Result<Json<Vec<OpportunityMatchResult>>, ApiError> {
    let results = lock_opportunity_market_session(&state)?
        .run_selective_match(&state.opportunity_market_fixture)?;
    Ok(Json(results))
}

async fn post_opportunity_save(
    State(state): State<AppState>,
    Path(opportunity_id): Path<String>,
    Json(request): Json<OpportunitySaveRequest>,
) -> Result<(StatusCode, Json<OpportunitySavedItem>), ApiError> {
    let saved = lock_opportunity_market_session(&state)?.save_opportunity(
        &state.opportunity_market_fixture,
        &opportunity_id,
        &request.note,
    )?;
    Ok((StatusCode::CREATED, Json(saved)))
}

async fn post_opportunity_interest(
    State(state): State<AppState>,
    Path(opportunity_id): Path<String>,
) -> Result<Json<OpportunitySavedItem>, ApiError> {
    let saved = lock_opportunity_market_session(&state)?.express_interest(&opportunity_id)?;
    Ok(Json(saved))
}

async fn post_opportunity_provider_ack(
    State(state): State<AppState>,
    Path(opportunity_id): Path<String>,
) -> Result<Json<OpportunitySavedItem>, ApiError> {
    let saved = lock_opportunity_market_session(&state)?.acknowledge_provider(&opportunity_id)?;
    Ok(Json(saved))
}

async fn post_opportunity_disclosure(
    State(state): State<AppState>,
    Path(opportunity_id): Path<String>,
    Json(request): Json<OpportunityDisclosureRequest>,
) -> Result<(StatusCode, Json<OpportunityDisclosureGrant>), ApiError> {
    let grant = lock_opportunity_market_session(&state)?.create_disclosure(
        &state.opportunity_market_fixture,
        &opportunity_id,
        request.duration_days,
    )?;
    Ok((StatusCode::CREATED, Json(grant)))
}

async fn delete_opportunity_disclosure(
    State(state): State<AppState>,
    Path(grant_id): Path<String>,
) -> Result<Json<OpportunityDisclosureGrant>, ApiError> {
    let grant = lock_opportunity_market_session(&state)?.revoke_disclosure(&grant_id)?;
    Ok(Json(grant))
}

async fn post_opportunity_external_status(
    State(state): State<AppState>,
    Path(opportunity_id): Path<String>,
    Json(request): Json<OpportunityExternalStatusRequest>,
) -> Result<Json<OpportunityApplicationMirror>, ApiError> {
    let mirror = lock_opportunity_market_session(&state)?
        .mark_applied_externally(&opportunity_id, request.student_confirmed)?;
    Ok(Json(mirror))
}

async fn post_opportunity_capacity_plan(
    State(state): State<AppState>,
    Path(opportunity_id): Path<String>,
    Json(request): Json<OpportunityCapacityRequest>,
) -> Result<(StatusCode, Json<OpportunityCapacityPlan>), ApiError> {
    let plan = lock_opportunity_market_session(&state)?.plan_capacity(
        &state.opportunity_market_fixture,
        &opportunity_id,
        request.hours_per_week,
        &request.note,
    )?;
    Ok((StatusCode::CREATED, Json(plan)))
}

async fn put_opportunity_pathway(
    State(state): State<AppState>,
    Path(pathway_id): Path<String>,
) -> Result<Json<OpportunityPathway>, ApiError> {
    let pathway = lock_opportunity_market_session(&state)?
        .select_pathway(&state.opportunity_market_fixture, &pathway_id)?;
    Ok(Json(pathway))
}

async fn post_opportunity_portfolio_export(
    State(state): State<AppState>,
    Json(request): Json<OpportunityPortfolioRequest>,
) -> Result<Json<OpportunityPortfolioExport>, ApiError> {
    let export = lock_opportunity_market_session(&state)?
        .export_portfolio(&state.opportunity_market_fixture, request.artifact_ids)?;
    Ok(Json(export))
}

async fn post_opportunity_report(
    State(state): State<AppState>,
    Path(opportunity_id): Path<String>,
    Json(request): Json<OpportunityReportRequest>,
) -> Result<(StatusCode, Json<OpportunityReport>), ApiError> {
    let report = lock_opportunity_market_session(&state)?.report_opportunity(
        &state.opportunity_market_fixture,
        &opportunity_id,
        &request.report_type,
        &request.reason,
    )?;
    Ok((StatusCode::ACCEPTED, Json(report)))
}

async fn post_opportunity_fairness(
    State(state): State<AppState>,
) -> Result<Json<OpportunityFairnessAudit>, ApiError> {
    let audit = lock_opportunity_market_session(&state)?
        .run_fairness_audit(&state.opportunity_market_fixture);
    Ok(Json(audit))
}

async fn get_opportunity_replay(
    State(state): State<AppState>,
) -> Result<Json<OpportunityReplayResponse>, ApiError> {
    let session = lock_opportunity_market_session(&state)?.clone();
    Ok(Json(OpportunityReplayResponse {
        schema_version: SCHEMA_VERSION.to_owned(),
        data_mode: "demo_fixture".to_owned(),
        append_only: true,
        reports: session.reports,
        notifications: state.opportunity_market_fixture.notifications,
        events: session.audit,
    }))
}

async fn get_demo_opportunity_market(
    State(state): State<AppState>,
) -> Json<OpportunityMarketFixture> {
    Json(state.opportunity_market_fixture)
}

async fn post_demo_opportunity_market_reset(
    State(state): State<AppState>,
) -> Result<Json<OpportunityMarketSession>, ApiError> {
    let reset = OpportunityMarketSession::from_fixture(&state.opportunity_market_fixture);
    let mut session = lock_opportunity_market_session(&state)?;
    session.clone_from(&reset);
    Ok(Json(session.clone()))
}

fn lock_opportunity_market_session(
    state: &AppState,
) -> Result<MutexGuard<'_, OpportunityMarketSession>, ApiError> {
    state.opportunity_market_session.lock().map_err(|_| {
        ApiError::new(
            StatusCode::INTERNAL_SERVER_ERROR,
            "OPPORTUNITY_SESSION_UNAVAILABLE",
            "The local Opportunity Market fixture session could not be read.",
            true,
        )
    })
}

#[derive(Debug, Serialize)]
struct CoachScoutingResponse {
    schema_version: String,
    data_mode: String,
    source_boundary: &'static str,
    fixture: CoachScoutingFixture,
    session: CoachScoutingSession,
    box_score: CoachBoxScore,
}

#[derive(Debug, Serialize)]
struct CoachScoutingProfileResponse {
    schema_version: String,
    data_mode: String,
    course: CoachCourseProfile,
    teaching: CoachTeachingStructure,
    office_hours: Vec<CoachOfficeHours>,
    workload: Vec<CoachWorkloadRange>,
    scouting: CoachScoutingReport,
    reminders: Vec<CoachExpectationReminder>,
    authoritative: bool,
}

#[derive(Debug, Serialize)]
struct CoachTeamProfileResponse {
    schema_version: String,
    data_mode: String,
    private: bool,
    fields: Vec<CoachTeamProfileField>,
    selected_field_ids: Vec<String>,
    forbidden_field_ids: Vec<String>,
}

#[derive(Debug, Serialize)]
struct CoachReplayResponse {
    schema_version: String,
    data_mode: String,
    append_only: bool,
    correction_cases: Vec<CoachCorrectionCase>,
    governance_cases: Vec<CoachGovernanceCase>,
    hidden_target_ids: Vec<String>,
    events: Vec<CoachAuditEvent>,
    box_score: CoachBoxScore,
}

#[derive(Debug, Deserialize)]
struct CoachVersionComparisonRequest {
    from_version_id: String,
    to_version_id: String,
}

#[derive(Debug, Deserialize)]
struct CoachCorrectionRequest {
    target_id: String,
    correction_type: String,
    statement: String,
    evidence_ids: Vec<String>,
}

#[derive(Debug, Deserialize)]
struct CoachCorrectionReviewRequest {
    status: String,
}

#[derive(Debug, Deserialize)]
struct CoachFeedbackRequest {
    dimension: String,
    concrete_experience: String,
    suggested_action: String,
    consent_to_aggregate: bool,
}

#[derive(Debug, Deserialize)]
struct CoachTeamProfileRequest {
    field_ids: Vec<String>,
}

#[derive(Debug, Deserialize)]
struct CoachAdvisorHandoffRequest {
    questions: Vec<String>,
    evidence_ids: Vec<String>,
    #[serde(default)]
    scenario_ids: Vec<String>,
    consent_confirmed: bool,
}

#[derive(Debug, Deserialize)]
struct CoachGovernanceReportRequest {
    report_type: String,
    target_id: String,
    evidence: String,
    serious: bool,
}

async fn get_coach_scouting(
    State(state): State<AppState>,
) -> Result<Json<CoachScoutingResponse>, ApiError> {
    let session = lock_coach_scouting_session(&state)?.clone();
    let box_score = session.box_score(&state.coach_scouting_fixture);
    Ok(Json(CoachScoutingResponse {
        schema_version: SCHEMA_VERSION.to_owned(),
        data_mode: "demo_fixture".to_owned(),
        source_boundary: "当前只使用脱敏演示数据；这里展示的是课程观察，不是教师评分或学校决定。",
        fixture: state.coach_scouting_fixture,
        session,
        box_score,
    }))
}

async fn get_coach_scouting_profile(
    State(state): State<AppState>,
) -> Json<CoachScoutingProfileResponse> {
    Json(CoachScoutingProfileResponse {
        schema_version: SCHEMA_VERSION.to_owned(),
        data_mode: "demo_fixture".to_owned(),
        course: state.coach_scouting_fixture.course,
        teaching: state.coach_scouting_fixture.teaching,
        office_hours: state.coach_scouting_fixture.office_hours,
        workload: state.coach_scouting_fixture.workload,
        scouting: state.coach_scouting_fixture.scouting,
        reminders: state.coach_scouting_fixture.reminders,
        authoritative: false,
    })
}

async fn get_coach_scouting_sources(
    State(state): State<AppState>,
) -> Json<Vec<CoachEvidenceSource>> {
    Json(state.coach_scouting_fixture.sources)
}

async fn get_coach_scouting_versions(
    State(state): State<AppState>,
) -> Json<Vec<CoachCourseVersion>> {
    Json(state.coach_scouting_fixture.versions)
}

async fn post_coach_version_comparison(
    State(state): State<AppState>,
    Json(request): Json<CoachVersionComparisonRequest>,
) -> Result<Json<CoachVersionComparison>, ApiError> {
    let comparison = lock_coach_scouting_session(&state)?.compare_versions(
        &state.coach_scouting_fixture,
        &request.from_version_id,
        &request.to_version_id,
    )?;
    Ok(Json(comparison))
}

async fn post_coach_correction(
    State(state): State<AppState>,
    Json(request): Json<CoachCorrectionRequest>,
) -> Result<(StatusCode, Json<CoachCorrectionCase>), ApiError> {
    let correction = lock_coach_scouting_session(&state)?.submit_correction(
        &state.coach_scouting_fixture,
        &request.target_id,
        &request.correction_type,
        &request.statement,
        request.evidence_ids,
    )?;
    Ok((StatusCode::CREATED, Json(correction)))
}

async fn put_coach_correction(
    State(state): State<AppState>,
    Path(correction_id): Path<String>,
    Json(request): Json<CoachCorrectionReviewRequest>,
) -> Result<Json<CoachCorrectionCase>, ApiError> {
    let correction =
        lock_coach_scouting_session(&state)?.review_correction(&correction_id, &request.status)?;
    Ok(Json(correction))
}

async fn post_coach_feedback(
    State(state): State<AppState>,
    Json(request): Json<CoachFeedbackRequest>,
) -> Result<(StatusCode, Json<CoachFeedbackSubmission>), ApiError> {
    let feedback = lock_coach_scouting_session(&state)?.submit_feedback(
        &state.coach_scouting_fixture,
        &request.dimension,
        &request.concrete_experience,
        &request.suggested_action,
        request.consent_to_aggregate,
    )?;
    Ok((StatusCode::CREATED, Json(feedback)))
}

async fn get_coach_feedback_aggregates(
    State(state): State<AppState>,
) -> Result<Json<Vec<CoachFeedbackAggregate>>, ApiError> {
    let aggregates =
        lock_coach_scouting_session(&state)?.feedback_aggregates(&state.coach_scouting_fixture);
    Ok(Json(aggregates))
}

async fn post_coach_fairness(
    State(state): State<AppState>,
) -> Result<Json<CoachFairnessAudit>, ApiError> {
    let audit =
        lock_coach_scouting_session(&state)?.run_fairness_audit(&state.coach_scouting_fixture);
    Ok(Json(audit))
}

async fn put_coach_team_profile(
    State(state): State<AppState>,
    Json(request): Json<CoachTeamProfileRequest>,
) -> Result<Json<CoachTeamProfileResponse>, ApiError> {
    let selected_field_ids = lock_coach_scouting_session(&state)?
        .replace_team_selection(&state.coach_scouting_fixture, request.field_ids)?;
    let forbidden_field_ids = state
        .coach_scouting_fixture
        .team_fields
        .iter()
        .filter(|item| !item.selectable || item.kind == "sensitive")
        .map(|item| item.id.clone())
        .collect();
    Ok(Json(CoachTeamProfileResponse {
        schema_version: SCHEMA_VERSION.to_owned(),
        data_mode: "demo_fixture".to_owned(),
        private: true,
        fields: state.coach_scouting_fixture.team_fields,
        selected_field_ids,
        forbidden_field_ids,
    }))
}

async fn post_coach_team_match(
    State(state): State<AppState>,
) -> Result<Json<Vec<CoachTeamMatch>>, ApiError> {
    let matches =
        lock_coach_scouting_session(&state)?.run_team_matching(&state.coach_scouting_fixture)?;
    Ok(Json(matches))
}

async fn post_coach_advisor_handoff(
    State(state): State<AppState>,
    Json(request): Json<CoachAdvisorHandoffRequest>,
) -> Result<(StatusCode, Json<CoachAdvisorHandoff>), ApiError> {
    let handoff = lock_coach_scouting_session(&state)?.build_advisor_handoff(
        &state.coach_scouting_fixture,
        request.questions,
        request.evidence_ids,
        request.scenario_ids,
        request.consent_confirmed,
    )?;
    Ok((StatusCode::CREATED, Json(handoff)))
}

async fn post_coach_reminder_ack(
    State(state): State<AppState>,
    Path(reminder_id): Path<String>,
) -> Result<Json<Vec<String>>, ApiError> {
    let acknowledged = lock_coach_scouting_session(&state)?
        .acknowledge_reminder(&state.coach_scouting_fixture, &reminder_id)?;
    Ok(Json(acknowledged))
}

async fn post_coach_governance_report(
    State(state): State<AppState>,
    Json(request): Json<CoachGovernanceReportRequest>,
) -> Result<(StatusCode, Json<CoachGovernanceCase>), ApiError> {
    let report = lock_coach_scouting_session(&state)?.report_governance(
        &state.coach_scouting_fixture,
        &request.report_type,
        &request.target_id,
        &request.evidence,
        request.serious,
    )?;
    Ok((StatusCode::ACCEPTED, Json(report)))
}

async fn get_coach_scouting_replay(
    State(state): State<AppState>,
) -> Result<Json<CoachReplayResponse>, ApiError> {
    let session = lock_coach_scouting_session(&state)?.clone();
    let box_score = session.box_score(&state.coach_scouting_fixture);
    Ok(Json(CoachReplayResponse {
        schema_version: SCHEMA_VERSION.to_owned(),
        data_mode: "demo_fixture".to_owned(),
        append_only: true,
        correction_cases: session.correction_cases,
        governance_cases: session.governance_cases,
        hidden_target_ids: session.hidden_target_ids,
        events: session.audit,
        box_score,
    }))
}

async fn get_demo_coach_scouting(State(state): State<AppState>) -> Json<CoachScoutingFixture> {
    Json(state.coach_scouting_fixture)
}

async fn post_demo_coach_scouting_reset(
    State(state): State<AppState>,
) -> Result<Json<CoachScoutingSession>, ApiError> {
    let reset = CoachScoutingSession::from_fixture(&state.coach_scouting_fixture);
    let mut session = lock_coach_scouting_session(&state)?;
    session.clone_from(&reset);
    Ok(Json(session.clone()))
}

fn lock_coach_scouting_session(
    state: &AppState,
) -> Result<MutexGuard<'_, CoachScoutingSession>, ApiError> {
    state.coach_scouting_session.lock().map_err(|_| {
        ApiError::new(
            StatusCode::INTERNAL_SERVER_ERROR,
            "COACH_SCOUTING_SESSION_UNAVAILABLE",
            "The local Coach & Scouting fixture session could not be read.",
            true,
        )
    })
}

#[derive(Debug, Serialize)]
struct CampusLifeResponse {
    schema_version: String,
    data_mode: String,
    source_boundary: &'static str,
    fixture: CampusLifeFixture,
    session: CampusLifeSession,
    recommendations: BTreeMap<String, String>,
    box_score: CampusBoxScore,
}

#[derive(Debug, Serialize)]
struct CampusReplayResponse {
    schema_version: String,
    data_mode: String,
    append_only: bool,
    official_results_claimed: usize,
    location_tracking_events: usize,
    participation_value_scores: usize,
    events: Vec<CampusAuditEvent>,
    box_score: CampusBoxScore,
}

#[derive(Debug, Deserialize)]
struct CampusProfileRequest {
    profiling_enabled: bool,
    interests: Vec<String>,
}

#[derive(Debug, Deserialize)]
struct CampusSavedRequest {
    target_id: String,
    target_type: String,
}

#[derive(Debug, Deserialize)]
struct CampusCalendarRequest {
    event_id: String,
}

#[derive(Debug, Deserialize)]
struct CampusRouteRequest {
    from_location_id: String,
    to_location_id: String,
    accessible_only: bool,
}

#[derive(Debug, Deserialize)]
struct CampusJourneyRequest {
    status: String,
    completed_step_ids: Vec<String>,
    personal_note: String,
}

#[derive(Debug, Deserialize)]
struct CampusMentorHandoffRequest {
    mentor_id: String,
    questions: Vec<String>,
    evidence_ids: Vec<String>,
    consent_confirmed: bool,
}

#[derive(Debug, Deserialize)]
struct CampusNotificationRequest {
    enabled_categories: Vec<String>,
    frequency: String,
    quiet_hours: String,
    marketing_enabled: bool,
}

#[derive(Debug, Deserialize)]
struct CampusCorrectionRequest {
    target_id: String,
    reason: String,
}

#[derive(Debug, Deserialize)]
struct CampusReceiptRequest {
    target_id: String,
    participation: String,
    reflection: String,
}

async fn get_campus_life(
    State(state): State<AppState>,
) -> Result<Json<CampusLifeResponse>, ApiError> {
    let session = lock_campus_life_session(&state)?.clone();
    let recommendations = campus_recommendations(&state.campus_life_fixture, &session);
    let box_score = session.box_score(&state.campus_life_fixture);
    Ok(Json(CampusLifeResponse {
        schema_version: SCHEMA_VERSION.to_owned(),
        data_mode: "demo_fixture".to_owned(),
        source_boundary: "当前只使用脱敏演示数据；报名、缴费等正式操作仍要回到活动原页面完成。",
        fixture: state.campus_life_fixture,
        session,
        recommendations,
        box_score,
    }))
}

async fn post_campus_search(
    State(state): State<AppState>,
    Json(request): Json<CampusSearchQuery>,
) -> Result<Json<CampusSearchResult>, ApiError> {
    let result = lock_campus_life_session(&state)?.search(&state.campus_life_fixture, &request);
    Ok(Json(result))
}

async fn put_campus_profile(
    State(state): State<AppState>,
    Json(request): Json<CampusProfileRequest>,
) -> Result<Json<CampusPreferenceProfile>, ApiError> {
    let profile = lock_campus_life_session(&state)?.update_profile(
        &state.campus_life_fixture,
        request.profiling_enabled,
        request.interests,
    )?;
    Ok(Json(profile))
}

async fn post_campus_saved(
    State(state): State<AppState>,
    Json(request): Json<CampusSavedRequest>,
) -> Result<(StatusCode, Json<CampusSavedItem>), ApiError> {
    let item = lock_campus_life_session(&state)?.save_item(
        &state.campus_life_fixture,
        &request.target_id,
        &request.target_type,
    )?;
    Ok((StatusCode::CREATED, Json(item)))
}

async fn post_campus_calendar(
    State(state): State<AppState>,
    Json(request): Json<CampusCalendarRequest>,
) -> Result<(StatusCode, Json<CampusCalendarEntry>), ApiError> {
    let entry = lock_campus_life_session(&state)?
        .save_event_to_calendar(&state.campus_life_fixture, &request.event_id)?;
    Ok((StatusCode::CREATED, Json(entry)))
}

async fn post_campus_route(
    State(state): State<AppState>,
    Json(request): Json<CampusRouteRequest>,
) -> Result<Json<CampusRouteOption>, ApiError> {
    let route = lock_campus_life_session(&state)?.route(
        &state.campus_life_fixture,
        &request.from_location_id,
        &request.to_location_id,
        request.accessible_only,
    )?;
    Ok(Json(route))
}

async fn put_campus_journey(
    State(state): State<AppState>,
    Path(resource_id): Path<String>,
    Json(request): Json<CampusJourneyRequest>,
) -> Result<Json<CampusJourneyMirror>, ApiError> {
    let mirror = lock_campus_life_session(&state)?.update_journey(
        &state.campus_life_fixture,
        &resource_id,
        &request.status,
        request.completed_step_ids,
        &request.personal_note,
    )?;
    Ok(Json(mirror))
}

async fn post_campus_team_intent(
    State(state): State<AppState>,
    Path(listing_id): Path<String>,
) -> Result<(StatusCode, Json<CampusTeamIntent>), ApiError> {
    let intent = lock_campus_life_session(&state)?
        .set_student_intent(&state.campus_life_fixture, &listing_id)?;
    Ok((StatusCode::CREATED, Json(intent)))
}

async fn post_campus_team_counterparty(
    State(state): State<AppState>,
    Path(listing_id): Path<String>,
) -> Result<Json<CampusTeamIntent>, ApiError> {
    let intent = lock_campus_life_session(&state)?.confirm_team_counterparty(&listing_id)?;
    Ok(Json(intent))
}

async fn post_campus_mentor_handoff(
    State(state): State<AppState>,
    Json(request): Json<CampusMentorHandoffRequest>,
) -> Result<(StatusCode, Json<CampusMentorHandoff>), ApiError> {
    let handoff = lock_campus_life_session(&state)?.build_mentor_handoff(
        &state.campus_life_fixture,
        &request.mentor_id,
        request.questions,
        request.evidence_ids,
        request.consent_confirmed,
    )?;
    Ok((StatusCode::CREATED, Json(handoff)))
}

async fn put_campus_notifications(
    State(state): State<AppState>,
    Json(request): Json<CampusNotificationRequest>,
) -> Result<Json<CampusNotificationSettings>, ApiError> {
    let settings = lock_campus_life_session(&state)?.update_notifications(
        request.enabled_categories,
        &request.frequency,
        &request.quiet_hours,
        request.marketing_enabled,
    )?;
    Ok(Json(settings))
}

async fn post_campus_correction(
    State(state): State<AppState>,
    Json(request): Json<CampusCorrectionRequest>,
) -> Result<(StatusCode, Json<CampusSourceCorrection>), ApiError> {
    let correction = lock_campus_life_session(&state)?.report_source(
        &state.campus_life_fixture,
        &request.target_id,
        &request.reason,
    )?;
    Ok((StatusCode::ACCEPTED, Json(correction)))
}

async fn post_campus_receipt(
    State(state): State<AppState>,
    Json(request): Json<CampusReceiptRequest>,
) -> Result<(StatusCode, Json<CampusFootprintReceipt>), ApiError> {
    let receipt = lock_campus_life_session(&state)?.record_receipt(
        &state.campus_life_fixture,
        &request.target_id,
        &request.participation,
        &request.reflection,
    )?;
    Ok((StatusCode::CREATED, Json(receipt)))
}

async fn post_campus_mycourt_export(
    State(state): State<AppState>,
) -> Result<Json<CampusMyCourtExport>, ApiError> {
    Ok(Json(lock_campus_life_session(&state)?.export_mycourt()))
}

async fn get_campus_escalation_routes(
    State(state): State<AppState>,
) -> Json<Vec<CampusEscalationRoute>> {
    Json(state.campus_life_fixture.escalation_routes)
}

async fn get_campus_replay(
    State(state): State<AppState>,
) -> Result<Json<CampusReplayResponse>, ApiError> {
    let session = lock_campus_life_session(&state)?.clone();
    let box_score = session.box_score(&state.campus_life_fixture);
    Ok(Json(CampusReplayResponse {
        schema_version: SCHEMA_VERSION.to_owned(),
        data_mode: "demo_fixture".to_owned(),
        append_only: true,
        official_results_claimed: 0,
        location_tracking_events: 0,
        participation_value_scores: 0,
        events: session.audit,
        box_score,
    }))
}

async fn get_demo_campus_life(State(state): State<AppState>) -> Json<CampusLifeFixture> {
    Json(state.campus_life_fixture)
}

async fn post_demo_campus_life_reset(
    State(state): State<AppState>,
) -> Result<Json<CampusLifeSession>, ApiError> {
    let reset = CampusLifeSession::from_fixture(&state.campus_life_fixture);
    let mut session = lock_campus_life_session(&state)?;
    session.clone_from(&reset);
    Ok(Json(session.clone()))
}

fn lock_campus_life_session(
    state: &AppState,
) -> Result<MutexGuard<'_, CampusLifeSession>, ApiError> {
    state.campus_life_session.lock().map_err(|_| {
        ApiError::new(
            StatusCode::INTERNAL_SERVER_ERROR,
            "CAMPUS_LIFE_SESSION_UNAVAILABLE",
            "The local Campus Life fixture session could not be read.",
            true,
        )
    })
}

#[derive(Debug, Serialize)]
struct CampusPassResponse {
    schema_version: String,
    data_mode: String,
    source_boundary: &'static str,
    fixture: CampusPassFixture,
    session: CampusPassSession,
    box_score: CampusPassBoxScore,
}

#[derive(Debug, Serialize)]
struct CampusPassReplayResponse {
    schema_version: String,
    data_mode: String,
    append_only: bool,
    official_credentials_issued: usize,
    official_access_actions_executed: usize,
    precise_tracking_events: usize,
    events: Vec<PassAuditEvent>,
    box_score: CampusPassBoxScore,
}

#[derive(Debug, Deserialize)]
struct CampusPassPresentationRequest {
    carrier: String,
    static_capture: bool,
}

#[derive(Debug, Deserialize)]
struct CampusPassAccessRequest {
    credential_id: String,
    zone_id: String,
    purpose: String,
}

#[derive(Debug, Deserialize)]
struct CampusPassMirrorRequest {
    status: String,
}

#[derive(Debug, Deserialize)]
struct CampusPassGuestRequest {
    zone_id: String,
    purpose: String,
    sponsor_label: String,
    duration_hours: u16,
}

#[derive(Debug, Deserialize)]
struct CampusPassLossRequest {
    credential_id: String,
    requested_action: String,
}

#[derive(Debug, Deserialize)]
struct CampusPassOfflineRequest {
    credential_id: String,
    zone_id: String,
    carrier: String,
}

#[derive(Debug, Deserialize)]
struct CampusPassLogCorrectionRequest {
    record_id: String,
    reason: String,
}

#[derive(Debug, Deserialize)]
struct CampusPassManualFallbackRequest {
    fallback_id: String,
    reason: String,
}

async fn get_campus_pass(
    State(state): State<AppState>,
) -> Result<Json<CampusPassResponse>, ApiError> {
    let session = lock_campus_pass_session(&state)?.clone();
    let box_score = session.box_score(&state.campus_pass_fixture);
    Ok(Json(CampusPassResponse {
        schema_version: SCHEMA_VERSION.to_owned(),
        data_mode: "demo_fixture".to_owned(),
        source_boundary: "当前只使用脱敏演示数据；真实凭证、门锁、紧急处置和身份判断仍由学校系统负责。",
        fixture: state.campus_pass_fixture,
        session,
        box_score,
    }))
}

async fn put_campus_pass_credential(
    State(state): State<AppState>,
    Path(credential_id): Path<String>,
) -> Result<Json<PassCredential>, ApiError> {
    let credential = lock_campus_pass_session(&state)?
        .select_credential(&state.campus_pass_fixture, &credential_id)?;
    Ok(Json(credential))
}

async fn post_campus_pass_present(
    State(state): State<AppState>,
    Path(credential_id): Path<String>,
    Json(request): Json<CampusPassPresentationRequest>,
) -> Result<(StatusCode, Json<CredentialPresentation>), ApiError> {
    let result = lock_campus_pass_session(&state)?.present_credential(
        &state.campus_pass_fixture,
        &credential_id,
        &request.carrier,
        request.static_capture,
    )?;
    Ok((StatusCode::CREATED, Json(result)))
}

async fn post_campus_pass_access_request(
    State(state): State<AppState>,
    Json(request): Json<CampusPassAccessRequest>,
) -> Result<(StatusCode, Json<AccessRequestMirror>), ApiError> {
    let result = lock_campus_pass_session(&state)?.request_access(
        &state.campus_pass_fixture,
        &request.credential_id,
        &request.zone_id,
        &request.purpose,
    )?;
    Ok((StatusCode::CREATED, Json(result)))
}

async fn put_campus_pass_request_mirror(
    State(state): State<AppState>,
    Path(request_id): Path<String>,
    Json(request): Json<CampusPassMirrorRequest>,
) -> Result<Json<AccessRequestMirror>, ApiError> {
    let result =
        lock_campus_pass_session(&state)?.update_request_mirror(&request_id, &request.status)?;
    Ok(Json(result))
}

async fn post_campus_pass_guest_draft(
    State(state): State<AppState>,
    Json(request): Json<CampusPassGuestRequest>,
) -> Result<(StatusCode, Json<GuestPassDraft>), ApiError> {
    let result = lock_campus_pass_session(&state)?.create_guest_draft(
        &state.campus_pass_fixture,
        &request.zone_id,
        &request.purpose,
        &request.sponsor_label,
        request.duration_hours,
    )?;
    Ok((StatusCode::CREATED, Json(result)))
}

async fn post_campus_pass_loss_case(
    State(state): State<AppState>,
    Json(request): Json<CampusPassLossRequest>,
) -> Result<(StatusCode, Json<CredentialLossCase>), ApiError> {
    let result = lock_campus_pass_session(&state)?.create_loss_case(
        &state.campus_pass_fixture,
        &request.credential_id,
        &request.requested_action,
    )?;
    Ok((StatusCode::CREATED, Json(result)))
}

async fn post_campus_pass_offline_check(
    State(state): State<AppState>,
    Json(request): Json<CampusPassOfflineRequest>,
) -> Result<(StatusCode, Json<OfflineCredentialCheck>), ApiError> {
    let result = lock_campus_pass_session(&state)?.check_offline(
        &state.campus_pass_fixture,
        &request.credential_id,
        &request.zone_id,
        &request.carrier,
    )?;
    Ok((StatusCode::CREATED, Json(result)))
}

async fn post_campus_pass_log_correction(
    State(state): State<AppState>,
    Json(request): Json<CampusPassLogCorrectionRequest>,
) -> Result<(StatusCode, Json<AccessLogCorrection>), ApiError> {
    let result = lock_campus_pass_session(&state)?.correct_access_log(
        &state.campus_pass_fixture,
        &request.record_id,
        &request.reason,
    )?;
    Ok((StatusCode::CREATED, Json(result)))
}

async fn post_campus_pass_manual_fallback(
    State(state): State<AppState>,
    Json(request): Json<CampusPassManualFallbackRequest>,
) -> Result<(StatusCode, Json<ManualFallbackSelection>), ApiError> {
    let result = lock_campus_pass_session(&state)?.choose_manual_fallback(
        &state.campus_pass_fixture,
        &request.fallback_id,
        &request.reason,
    )?;
    Ok((StatusCode::CREATED, Json(result)))
}

async fn get_campus_pass_emergency_modes(
    State(state): State<AppState>,
) -> Json<Vec<EmergencyAccessMode>> {
    Json(state.campus_pass_fixture.emergency_modes)
}

async fn get_campus_pass_access_records(
    State(state): State<AppState>,
) -> Json<Vec<SelfAccessRecord>> {
    Json(state.campus_pass_fixture.self_access_records)
}

async fn get_campus_pass_replay(
    State(state): State<AppState>,
) -> Result<Json<CampusPassReplayResponse>, ApiError> {
    let session = lock_campus_pass_session(&state)?.clone();
    let box_score = session.box_score(&state.campus_pass_fixture);
    Ok(Json(CampusPassReplayResponse {
        schema_version: SCHEMA_VERSION.to_owned(),
        data_mode: "demo_fixture".to_owned(),
        append_only: true,
        official_credentials_issued: 0,
        official_access_actions_executed: 0,
        precise_tracking_events: 0,
        events: session.audit,
        box_score,
    }))
}

async fn get_demo_campus_pass(State(state): State<AppState>) -> Json<CampusPassFixture> {
    Json(state.campus_pass_fixture)
}

async fn post_demo_campus_pass_reset(
    State(state): State<AppState>,
) -> Result<Json<CampusPassSession>, ApiError> {
    let reset = CampusPassSession::from_fixture(&state.campus_pass_fixture);
    let mut session = lock_campus_pass_session(&state)?;
    session.clone_from(&reset);
    Ok(Json(session.clone()))
}

fn lock_campus_pass_session(
    state: &AppState,
) -> Result<MutexGuard<'_, CampusPassSession>, ApiError> {
    state.campus_pass_session.lock().map_err(|_| {
        ApiError::new(
            StatusCode::INTERNAL_SERVER_ERROR,
            "CAMPUS_PASS_SESSION_UNAVAILABLE",
            "The local Campus Pass fixture session could not be read.",
            true,
        )
    })
}

fn build_career_dashboard(fixture: &CareerFixture) -> CareerDashboard {
    let total_credits = fixture.courses.iter().map(|course| course.credits).sum();
    let completed_credits = fixture
        .courses
        .iter()
        .filter(|course| course.status == "completed")
        .map(|course| course.credits)
        .sum();
    let active_courses = u32::try_from(
        fixture
            .courses
            .iter()
            .filter(|course| matches!(course.status.as_str(), "active" | "attention" | "critical"))
            .count(),
    )
    .unwrap_or(u32::MAX);
    CareerDashboard {
        schema_version: SCHEMA_VERSION.to_owned(),
        data_mode: fixture.data_mode.clone(),
        student_id: fixture.semester.student_id.clone(),
        current_semester: fixture.semester.clone(),
        total_credits,
        completed_credits,
        active_courses,
        upcoming_deadlines: fixture.deadlines.clone(),
        recent_activities: vec![CareerRecentActivity {
            activity_type: "learning_session".to_owned(),
            description: "信号与线性系统理解检查完成，可进入 Replay。".to_owned(),
            occurred_at: "2026-07-24T10:39:00+08:00".to_owned(),
            source_ref: "fixture-interaction:interaction-nan-001".to_owned(),
        }],
    }
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

#[derive(Debug, Deserialize, Serialize)]
pub struct InteractionRequest {
    pub schema_version: String,
    pub actor_id: String,
    pub interaction_type: String,
    pub selected_answer: Option<String>,
    pub correct: Option<bool>,
    pub duration_ms: Option<u64>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct InteractionResponse {
    pub schema_version: String,
    pub interaction: StudentInteraction,
}

async fn record_interaction(
    State(state): State<AppState>,
    Path(object_id): Path<String>,
    Json(request): Json<InteractionRequest>,
) -> Result<Json<InteractionResponse>, ApiError> {
    let command = InteractionCommand {
        schema_version: request.schema_version,
        actor_id: request.actor_id,
        interaction_type: request.interaction_type,
        selected_answer: request.selected_answer,
        correct: request.correct,
        duration_ms: request.duration_ms,
        occurred_at_unix_ms: now_unix_ms()?,
    };
    let interaction = state.service.interact(&object_id, command).await?;
    Ok(Json(InteractionResponse {
        schema_version: SCHEMA_VERSION.to_owned(),
        interaction,
    }))
}

#[derive(Debug, Serialize)]
pub struct ErrorResponse {
    pub schema_version: String,
    pub code: String,
    pub message: String,
    pub retryable: bool,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub fallback_available: Option<bool>,
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

impl From<DomainError> for ApiError {
    fn from(error: DomainError) -> Self {
        Self::from_domain(error)
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
                fallback_available: None,
            },
        }
    }

    fn new_with_fallback(
        status: StatusCode,
        code: impl Into<String>,
        message: impl Into<String>,
        retryable: bool,
        fallback_available: bool,
    ) -> Self {
        let mut error = Self::new(status, code, message, retryable);
        error.body.fallback_available = Some(fallback_available);
        error
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
        build_router_with_ai(
            service,
            Arc::new(OpenAiCompatibleGateway::unconfigured(
                "test fixture uses deterministic rules",
            )),
        )
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

    async fn get_json(app: Router, uri: &str) -> (StatusCode, Value) {
        let response = app
            .oneshot(
                Request::builder()
                    .uri(uri)
                    .body(Body::empty())
                    .expect("request must build"),
            )
            .await
            .expect("router must respond");
        let status = response.status();
        (status, response_json(response).await)
    }

    #[tokio::test]
    async fn ai_status_and_advice_are_secret_free_and_explicitly_fallback() {
        let app = test_app().await;
        let (status, payload) = get_json(app.clone(), "/api/v1/ai/status").await;
        assert_eq!(status, StatusCode::OK);
        assert_eq!(payload["configured"], false);
        assert_eq!(payload["credential_source"], "not_configured");
        let serialized = payload.to_string();
        assert!(!serialized.contains("sk-"));
        assert!(!serialized.contains("api_key"));

        let response = json_request(
            app,
            "POST",
            "/api/v1/ai/advice",
            json!({
                "task": "student_support_case",
                "subject": "考试无障碍安排申请",
                "question": "下一步如何处理？",
                "locale": "zh-CN",
                "facts": [
                    {
                        "label": "申请状态",
                        "value": "材料待补充",
                        "source_id": "case-fixture-001"
                    }
                ]
            }),
        )
        .await;
        assert_eq!(response.status(), StatusCode::OK);
        let advice = response_json(response).await;
        assert_eq!(advice["mode"], "rules_fallback");
        assert_eq!(advice["formal_decision"], false);
        assert_eq!(advice["source_ids"][0], "case-fixture-001");
    }

    #[tokio::test]
    async fn career_fixture_exposes_the_p0_season_dashboard_and_roster() {
        let app = test_app().await;
        let (semester_status, semester) =
            get_json(app.clone(), "/api/v1/career/current-semester").await;
        assert_eq!(semester_status, StatusCode::OK);
        assert_eq!(semester["season_number"], 4);
        assert_eq!(semester["total_seasons"], 8);

        let (courses_status, courses) =
            get_json(app.clone(), "/api/v1/career/current-semester/courses").await;
        assert_eq!(courses_status, StatusCode::OK);
        assert_eq!(courses.as_array().map(Vec::len), Some(6));
        assert_eq!(courses[0]["authority"], "fixture");

        let (dashboard_status, dashboard) = get_json(app.clone(), "/api/v1/career/dashboard").await;
        assert_eq!(dashboard_status, StatusCode::OK);
        assert_eq!(dashboard["data_mode"], "fixture");
        assert_eq!(
            dashboard["upcoming_deadlines"].as_array().map(Vec::len),
            Some(3)
        );

        let (demo_status, demo) = get_json(app, "/api/v1/demo/semester").await;
        assert_eq!(demo_status, StatusCode::OK);
        assert_eq!(demo["semester"]["student_id"], "student-nan-fixture");
        assert_eq!(demo["courses"].as_array().map(Vec::len), Some(6));
    }

    #[tokio::test]
    async fn career_course_detail_distinguishes_published_and_empty_content() {
        let app = test_app().await;
        let (ready_status, ready) =
            get_json(app.clone(), "/api/v1/career/course/signal-linear-systems").await;
        assert_eq!(ready_status, StatusCode::OK);
        assert_eq!(ready["linked_content"]["published_id"], "published-sls-v1");
        assert_eq!(
            ready["linked_content"]["student_path"],
            "/student/watch/published-sls-v1"
        );
        assert_eq!(ready["course"]["last_session"]["completion_pct"], 100);

        let (empty_status, empty) = get_json(app.clone(), "/api/v1/career/course/optics").await;
        assert_eq!(empty_status, StatusCode::OK);
        assert!(empty["linked_content"].is_null());
        assert!(empty["course"]["last_session"].is_null());

        let (missing_status, missing) = get_json(app, "/api/v1/career/course/not-a-course").await;
        assert_eq!(missing_status, StatusCode::NOT_FOUND);
        assert_eq!(missing["code"], "not_found");
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

        let interaction = json_request(
            app.clone(),
            "POST",
            &format!("{base}/interactions"),
            json!({
                "schema_version": "1.0.0",
                "actor_id": "student-nan-fixture",
                "interaction_type": "quiz_answer",
                "selected_answer": "B",
                "correct": true,
                "duration_ms": 18000
            }),
        )
        .await;
        assert_eq!(interaction.status(), StatusCode::OK);
        let interaction_body = response_json(interaction).await;
        assert_eq!(interaction_body["interaction"]["selected_answer"], "B");
        assert_eq!(interaction_body["interaction"]["fixture"], true);

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
            Some(1)
        );
        assert_eq!(
            body["student_interactions"][0]["actor_id"],
            "student-nan-fixture"
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

    #[tokio::test]
    async fn world_exam_fixture_exposes_calendar_briefing_playbook_and_sources() {
        let app = test_app().await;
        let (calendar_status, calendar) = get_json(app.clone(), "/api/v1/exams").await;
        assert_eq!(calendar_status, StatusCode::OK);
        assert_eq!(calendar.as_array().map(Vec::len), Some(1));
        assert_eq!(calendar[0]["is_formal"], false);
        assert_eq!(calendar[0]["status"], "briefing_open");

        let (briefing_status, briefing) = get_json(
            app.clone(),
            "/api/v1/exams/exam-sls-finals-fixture/briefing",
        )
        .await;
        assert_eq!(briefing_status, StatusCode::OK);
        assert_eq!(briefing["readiness"]["coverage_pct"], 67);
        assert_eq!(briefing["sources"][0]["locator"], "slides:12");

        let (playbook_status, playbook) = get_json(
            app.clone(),
            "/api/v1/exams/exam-sls-finals-fixture/playbook",
        )
        .await;
        assert_eq!(playbook_status, StatusCode::OK);
        assert_eq!(playbook.as_array().map(Vec::len), Some(3));
        assert_eq!(
            playbook[0]["items"][0]["object_id"],
            "generated-sls-quiz-001"
        );

        let (demo_status, demo) = get_json(app, "/api/v1/demo/world-exam").await;
        assert_eq!(demo_status, StatusCode::OK);
        assert_eq!(demo["data_mode"], "fixture");
        assert!(
            demo["source_boundary"]
                .as_str()
                .is_some_and(|value| value.contains("不是正式考试或成绩"))
        );
    }

    #[tokio::test]
    async fn world_exam_api_completes_evidence_aware_private_flow() {
        let app = test_app().await;
        let base = "/api/v1/exams/exam-sls-finals-fixture";

        let warmup = json_request(
            app.clone(),
            "POST",
            &format!("{base}/warmup/attempts"),
            json!({ "answer": "decrease" }),
        )
        .await;
        assert_eq!(warmup.status(), StatusCode::OK);
        let warmup_body = response_json(warmup).await;
        assert_eq!(warmup_body["attempt"]["correct"], true);
        assert_eq!(warmup_body["formal_grade_impact"], false);

        let checkpoint = json_request(
            app.clone(),
            "POST",
            &format!("{base}/checkpoints"),
            json!({ "item_id": "item-cutoff-check", "completed": true }),
        )
        .await;
        assert_eq!(checkpoint.status(), StatusCode::OK);

        let first_answer = json_request(
            app.clone(),
            "POST",
            &format!("{base}/attempts"),
            json!({
                "question_id": "match-cutoff",
                "response": "decrease",
                "source_checked": true
            }),
        )
        .await;
        assert_eq!(first_answer.status(), StatusCode::OK);

        let unsupported_unchecked = json_request(
            app.clone(),
            "POST",
            &format!("{base}/attempts"),
            json!({
                "question_id": "match-ai-trace",
                "response": "challenge",
                "source_checked": true,
                "challenged_claim_ids": []
            }),
        )
        .await;
        assert_eq!(unsupported_unchecked.status(), StatusCode::OK);

        let blocked_complete = json_request(
            app.clone(),
            "POST",
            &format!("{base}/attempts/complete"),
            json!({}),
        )
        .await;
        assert_eq!(blocked_complete.status(), StatusCode::UNPROCESSABLE_ENTITY);

        let challenged = json_request(
            app.clone(),
            "POST",
            &format!("{base}/attempts"),
            json!({
                "question_id": "match-ai-trace",
                "response": "challenge",
                "source_checked": true,
                "challenged_claim_ids": ["claim-simulator-wrong"]
            }),
        )
        .await;
        assert_eq!(challenged.status(), StatusCode::OK);

        let complete = json_request(
            app.clone(),
            "POST",
            &format!("{base}/attempts/complete"),
            json!({}),
        )
        .await;
        assert_eq!(complete.status(), StatusCode::OK);
        assert_eq!(response_json(complete).await["status"], "review");

        let (replay_status, replay) = get_json(app.clone(), &format!("{base}/replay")).await;
        assert_eq!(replay_status, StatusCode::OK);
        assert_eq!(replay["answers"].as_array().map(Vec::len), Some(2));

        let (score_status, score) = get_json(app.clone(), &format!("{base}/box-score")).await;
        assert_eq!(score_status, StatusCode::OK);
        assert_eq!(score["privacy"], "private_student_only");
        assert_eq!(score["box_score"]["completion_pct"], 100);
        assert!(score.get("rank").is_none());
        assert!(score.get("grade_prediction").is_none());

        let missing_expiry = json_request(
            app.clone(),
            "PUT",
            &format!("{base}/reflection"),
            json!({
                "worked": "先核对来源",
                "blocked": "仪器负载",
                "next_adjustment": "补充误差表",
                "share_with_mentor": true,
                "share_expires_at": null
            }),
        )
        .await;
        assert_eq!(missing_expiry.status(), StatusCode::UNPROCESSABLE_ENTITY);

        let reflection = json_request(
            app,
            "PUT",
            &format!("{base}/reflection"),
            json!({
                "worked": "先核对来源",
                "blocked": "仪器负载",
                "next_adjustment": "补充误差表",
                "share_with_mentor": true,
                "share_expires_at": "2026-08-07",
                "archive": true
            }),
        )
        .await;
        assert_eq!(reflection.status(), StatusCode::OK);
        assert_eq!(response_json(reflection).await["status"], "archived");
    }

    #[tokio::test]
    async fn roster_fixture_exposes_prefix_catalog_plans_and_unsat_evidence() {
        let app = test_app().await;
        let (demo_status, demo) = get_json(app.clone(), "/api/v1/demo/roster").await;
        assert_eq!(demo_status, StatusCode::OK);
        assert_eq!(demo["catalog"].as_array().map(Vec::len), Some(12));
        assert_eq!(demo["plans"].as_array().map(Vec::len), Some(3));
        assert_eq!(demo["plans"][0]["is_formal_enrollment"], false);

        let (prefix_status, prefix) = get_json(app.clone(), "/api/v1/roster/prefix").await;
        assert_eq!(prefix_status, StatusCode::OK);
        assert_eq!(prefix["student_id"], "student-nan-fixture");
        assert_eq!(prefix["planned"].as_array().map(Vec::len), Some(6));

        let (catalog_status, catalog) = get_json(app.clone(), "/api/v1/roster/catalog").await;
        assert_eq!(catalog_status, StatusCode::OK);
        assert_eq!(catalog["catalog_version"], "catalog-2026-fall-fixture-r3");
        assert_eq!(catalog["courses"].as_array().map(Vec::len), Some(12));

        let (unsat_status, unsat) = get_json(app, "/api/v1/roster/unsat").await;
        assert_eq!(unsat_status, StatusCode::OK);
        assert_eq!(
            unsat["minimal_conflict_set"].as_array().map(Vec::len),
            Some(1)
        );
        assert_eq!(unsat["blocking_chain"].as_array().map(Vec::len), Some(3));
        assert_eq!(unsat["relaxable_items"].as_array().map(Vec::len), Some(2));
    }

    #[tokio::test]
    async fn roster_api_solves_simulates_diffs_and_saves_non_formal_lock() {
        let app = test_app().await;
        let solve = json_request(
            app.clone(),
            "POST",
            "/api/v1/roster/solve",
            json!({
                "goal_order": [
                    "hard_constraints",
                    "graduation_progress",
                    "minimal_change",
                    "personal_preference",
                    "minimal_gaps"
                ],
                "preferences": {
                    "time_of_day": "daytime",
                    "compactness": 2,
                    "variety": 2,
                    "stability": 3
                }
            }),
        )
        .await;
        assert_eq!(solve.status(), StatusCode::OK);
        let solve_body = response_json(solve).await;
        assert_eq!(solve_body["plans"].as_array().map(Vec::len), Some(3));
        assert_eq!(solve_body["is_formal_enrollment"], false);
        assert_eq!(
            solve_body["solver_status"],
            "best_feasible_deterministic_fixture"
        );
        assert_eq!(solve_body["solver_protocol"], "conda_style_v1");
        assert_eq!(solve_body["protocol_status"], "reference_contract_fixture");
        assert_eq!(
            solve_body["constraint_model"]["mutates_formal_enrollment"],
            false
        );

        let (diff_status, diff) =
            get_json(app.clone(), "/api/v1/roster/plans/plan-late-fixture/diff").await;
        assert_eq!(diff_status, StatusCode::OK);
        assert_eq!(diff["is_formal_submission"], false);
        assert!(
            diff["actions"]
                .as_array()
                .is_some_and(|actions| actions.len() >= 3)
        );

        let lock = json_request(
            app.clone(),
            "POST",
            "/api/v1/roster/plans/plan-late-fixture/lock",
            json!({}),
        )
        .await;
        assert_eq!(lock.status(), StatusCode::OK);
        let lock_body = response_json(lock).await;
        assert_eq!(lock_body["is_formal_enrollment"], false);
        assert_eq!(lock_body["catalog_version"], "catalog-2026-fall-fixture-r3");

        let what_if = json_request(
            app.clone(),
            "POST",
            "/api/v1/roster/what-if",
            json!({ "branch_name": "设计方向试投" }),
        )
        .await;
        assert_eq!(what_if.status(), StatusCode::OK);
        let what_if_body = response_json(what_if).await;
        assert_eq!(what_if_body["is_simulation"], true);
        assert!(
            what_if_body["plans"]
                .as_array()
                .is_some_and(|plans| plans.len() >= 2)
        );

        let rejected_pins = json_request(
            app,
            "PUT",
            "/api/v1/roster/pins",
            json!({ "active_pin_ids": ["pin-friday-commitment"] }),
        )
        .await;
        assert_eq!(rejected_pins.status(), StatusCode::UNPROCESSABLE_ENTITY);
    }

    #[tokio::test]
    async fn roster_catalog_import_is_bounded_validation_only() {
        let app = test_app().await;
        let (capability_status, capabilities) =
            get_json(app.clone(), "/api/v1/roster/import-capabilities").await;
        assert_eq!(capability_status, StatusCode::OK);
        assert_eq!(capabilities["import_state"], "no_real_catalog_promoted");
        assert_eq!(capabilities["solver_protocol"], "conda_style_v1");
        assert_eq!(capabilities["sources"].as_array().map(Vec::len), Some(2));

        let validation = json_request(
            app.clone(),
            "POST",
            "/api/v1/roster/imports/validate",
            json!({
                "schema_version": "1.0.0",
                "institution": "uarizona",
                "dataset_scope": "public_course_catalog",
                "source_locator": "https://catalog.arizona.edu/courses",
                "retrieved_at": "2026-07-24T10:00:00Z",
                "terms_version": "public-page-observed-2026-07-24",
                "use_basis": "Public catalog metadata; terms require human review.",
                "checksum_sha256": "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
                "catalog_version": "uarizona-public-candidate-2026-fall",
                "courses": [{
                    "course_code": "ECE 320A",
                    "title": "Signals and Systems",
                    "credits": 3.0,
                    "department": "Electrical and Computer Engineering",
                    "prerequisites": ["MATH 223"],
                    "corequisites": [],
                    "exclusions": [],
                    "offered_terms": ["2026-Fall"]
                }]
            }),
        )
        .await;
        assert_eq!(validation.status(), StatusCode::OK);
        let receipt = response_json(validation).await;
        assert_eq!(receipt["validation_status"], "validated_only");
        assert_eq!(receipt["records_validated"], 1);
        assert_eq!(receipt["imported"], false);
        assert_eq!(receipt["persisted"], false);
        assert_eq!(receipt["contains_enrollment_records"], false);
        assert_eq!(receipt["is_formal_enrollment"], false);

        let restricted = json_request(
            app,
            "POST",
            "/api/v1/roster/imports/validate",
            json!({
                "schema_version": "1.0.0",
                "institution": "uarizona",
                "dataset_scope": "student_enrollment_records",
                "source_locator": "https://catalog.arizona.edu/courses",
                "retrieved_at": "2026-07-24T10:00:00Z",
                "terms_version": "public-page-observed-2026-07-24",
                "use_basis": "Not allowed.",
                "checksum_sha256": "bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
                "catalog_version": "restricted",
                "courses": [{
                    "course_code": "ECE 320A",
                    "title": "Signals and Systems",
                    "credits": 3.0,
                    "department": "ECE",
                    "prerequisites": [],
                    "corequisites": [],
                    "exclusions": [],
                    "offered_terms": ["2026-Fall"]
                }]
            }),
        )
        .await;
        assert_eq!(restricted.status(), StatusCode::UNPROCESSABLE_ENTITY);
    }

    #[tokio::test]
    async fn academic_mirror_fixture_exposes_sources_snapshots_and_six_authority_levels() {
        let app = test_app().await;
        let (status, fixture) = get_json(app.clone(), "/api/v1/demo/mirror").await;
        assert_eq!(status, StatusCode::OK);
        assert_eq!(fixture["data_mode"], "fixture");
        assert_eq!(fixture["read_only"], true);
        assert_eq!(fixture["sources"].as_array().map(Vec::len), Some(6));
        assert_eq!(
            fixture["authority_catalog"].as_array().map(Vec::len),
            Some(6)
        );
        assert!(
            fixture["snapshots"]
                .as_array()
                .is_some_and(|snapshots| snapshots.iter().all(|snapshot| {
                    snapshot["immutable"] == true
                        && snapshot["content_hash"]
                            .as_str()
                            .is_some_and(|hash| hash.starts_with("sha256:"))
                }))
        );

        let (provenance_status, provenance) =
            get_json(app, "/api/v1/mirror/records/nr-course-sls201/provenance").await;
        assert_eq!(provenance_status, StatusCode::OK);
        assert_eq!(
            provenance["fields"]["credits"]["provenance"]["raw_snapshot_id"],
            "snap-catalog-001"
        );
        assert_eq!(
            provenance["fields"]["credits"]["provenance"]["effective_authority"],
            "demo_fixture"
        );
    }

    #[tokio::test]
    async fn academic_mirror_api_completes_sync_review_consent_export_and_audit_flow() {
        let app = test_app().await;
        let registered = json_request(
            app.clone(),
            "POST",
            "/api/v1/mirror/sources",
            json!({
                "name": "本地授权课程导出",
                "system_type": "manual_export",
                "responsible_party": "学生本人",
                "field_scope": ["course.title"],
                "correction_route": "重新导入或删除副本"
            }),
        )
        .await;
        assert_eq!(registered.status(), StatusCode::CREATED);
        assert_eq!(
            response_json(registered).await["auth_method"],
            "file_import"
        );

        let synced = json_request(
            app.clone(),
            "POST",
            "/api/v1/mirror/sources/ds-sis-demo/sync",
            json!({ "mode": "full" }),
        )
        .await;
        assert_eq!(synced.status(), StatusCode::OK);
        let synced = response_json(synced).await;
        assert_eq!(synced["previous_snapshot_preserved"], true);
        assert_eq!(synced["adapter_kind"], "demo_fixture");

        let resolved = json_request(
            app.clone(),
            "PUT",
            "/api/v1/mirror/conflicts/conf-sls-credits/resolve",
            json!({
                "chosen_option_id": "opt-catalog-3",
                "reason": "Use the current catalog as the mirror baseline and retain the difference."
            }),
        )
        .await;
        assert_eq!(resolved.status(), StatusCode::OK);
        assert_eq!(response_json(resolved).await["status"], "resolved");

        let consent = json_request(
            app.clone(),
            "POST",
            "/api/v1/mirror/consents",
            json!({
                "id": "consent-sis-read",
                "student_id": "student-nan-fixture",
                "data_source_id": "ds-sis-demo",
                "allowed_modules": ["F-002", "F-004"],
                "purpose": "只读赛季与规划",
                "granted_at": "2026-07-24T09:40:00+08:00",
                "expires_at": "2026-08-24T09:40:00+08:00",
                "revoked_at": "2026-07-24T18:20:00+08:00",
                "scope": "read_only"
            }),
        )
        .await;
        assert_eq!(consent.status(), StatusCode::OK);
        assert!(
            response_json(consent).await["revoked_at"]
                .as_str()
                .is_some()
        );

        let correction = json_request(
            app.clone(),
            "POST",
            "/api/v1/mirror/corrections",
            json!({
                "record_id": "nr-course-sls201",
                "reason": "Please verify the four-credit export difference."
            }),
        )
        .await;
        assert_eq!(correction.status(), StatusCode::ACCEPTED);
        assert_eq!(
            response_json(correction).await["formal_record_changed"],
            false
        );

        let export = json_request(
            app.clone(),
            "POST",
            "/api/v1/mirror/exports",
            json!({ "archive_type": "trusted_archive_contract_fixture" }),
        )
        .await;
        assert_eq!(export.status(), StatusCode::OK);
        let export = response_json(export).await;
        assert_eq!(export["signature_status"], "demo_not_signed");
        assert_eq!(export["import_disposition"], "quarantine_and_preview_only");

        let (audit_status, audit) = get_json(app, "/api/v1/mirror/audit").await;
        assert_eq!(audit_status, StatusCode::OK);
        assert_eq!(audit["append_only"], true);
        assert!(
            audit["events"]
                .as_array()
                .is_some_and(|events| events.len() >= 11)
        );
    }

    #[tokio::test]
    async fn academic_mirror_rejects_incremental_sync_and_authoritative_delete() {
        let app = test_app().await;
        let incremental = json_request(
            app.clone(),
            "POST",
            "/api/v1/mirror/sources/ds-sis-demo/sync",
            json!({ "mode": "incremental" }),
        )
        .await;
        assert_eq!(incremental.status(), StatusCode::UNPROCESSABLE_ENTITY);
        let incremental = response_json(incremental).await;
        assert_eq!(incremental["code"], "SYNC_FAILED");
        assert_eq!(incremental["fallback_available"], true);

        let protected = json_request(
            app.clone(),
            "DELETE",
            "/api/v1/mirror/records/nr-student-profile",
            json!({}),
        )
        .await;
        assert_eq!(protected.status(), StatusCode::UNPROCESSABLE_ENTITY);

        let removable = json_request(
            app.clone(),
            "DELETE",
            "/api/v1/mirror/records/nr-self-goal",
            json!({}),
        )
        .await;
        assert_eq!(removable.status(), StatusCode::OK);
        assert_eq!(
            response_json(removable).await["formal_source_affected"],
            false
        );
    }

    #[tokio::test]
    async fn performance_center_fixture_exposes_private_metrics_evidence_and_safe_default() {
        let app = test_app().await;
        let (status, dashboard) = get_json(app.clone(), "/api/v1/performance/dashboard").await;
        assert_eq!(status, StatusCode::OK);
        assert_eq!(dashboard["data_mode"], "fixture");
        assert_eq!(dashboard["private_by_default"], true);
        assert_eq!(dashboard["comparison_mode"], "self_only");
        assert_eq!(dashboard["metrics"].as_array().map(Vec::len), Some(6));
        assert_eq!(dashboard["abilities"].as_array().map(Vec::len), Some(4));
        assert_eq!(
            dashboard["research_gate"]["status"],
            "deferred_pending_human_evidence"
        );
        assert_eq!(dashboard["research_gate"]["evidence_count"], 0);
        assert_eq!(dashboard["session"]["climate_variant"], "c_dimensions");
        assert_eq!(dashboard["session"]["climate_enabled"], false);

        let (evidence_status, evidence) =
            get_json(app, "/api/v1/performance/evidence/ev-review-001").await;
        assert_eq!(evidence_status, StatusCode::OK);
        assert_eq!(evidence["authority"], "demo_fixture");
        assert!(
            evidence["locator"]
                .as_str()
                .is_some_and(|item| !item.is_empty())
        );
    }

    #[tokio::test]
    async fn performance_center_api_completes_private_choice_correction_stop_and_replay_flow() {
        let app = test_app().await;
        let adopted = json_request(
            app.clone(),
            "PUT",
            "/api/v1/performance/recommendations/rec-buffer",
            json!({ "status": "adopted" }),
        )
        .await;
        assert_eq!(adopted.status(), StatusCode::OK);
        assert_eq!(response_json(adopted).await["status"], "adopted");

        let preview = json_request(
            app.clone(),
            "PUT",
            "/api/v1/performance/climate",
            json!({ "variant": "a_numbers" }),
        )
        .await;
        assert_eq!(preview.status(), StatusCode::OK);
        assert_eq!(response_json(preview).await["climate_enabled"], true);

        let grant = json_request(
            app.clone(),
            "POST",
            "/api/v1/performance/shares",
            json!({
                "recipient": "学业导师（Fixture）",
                "purpose": "讨论本人下一周任务安排",
                "duration_days": 7,
                "dimension_ids": ["ability-knowledge"]
            }),
        )
        .await;
        assert_eq!(grant.status(), StatusCode::CREATED);
        let grant = response_json(grant).await;
        assert_eq!(grant["expires_at"], "2026-07-31T23:59:00+08:00");
        let grant_id = grant["id"].as_str().expect("grant id must be present");
        let revoked = json_request(
            app.clone(),
            "DELETE",
            &format!("/api/v1/performance/shares/{grant_id}"),
            json!({}),
        )
        .await;
        assert_eq!(revoked.status(), StatusCode::OK);
        assert!(
            response_json(revoked).await["revoked_at"]
                .as_str()
                .is_some()
        );

        let correction = json_request(
            app.clone(),
            "POST",
            "/api/v1/performance/corrections",
            json!({
                "target_id": "metric-revision-quality",
                "reason": "遗漏了一次离线修订，请人工核对。"
            }),
        )
        .await;
        assert_eq!(correction.status(), StatusCode::ACCEPTED);
        assert_eq!(
            response_json(correction).await["status"],
            "queued_for_human_review"
        );

        let harm = json_request(
            app.clone(),
            "POST",
            "/api/v1/performance/harm-signals",
            json!({ "description": "数字让我误以为这是正式成绩。" }),
        )
        .await;
        assert_eq!(harm.status(), StatusCode::ACCEPTED);
        assert_eq!(response_json(harm).await["severity"], "stop");

        let blocked_reenable = json_request(
            app.clone(),
            "PUT",
            "/api/v1/performance/climate",
            json!({ "variant": "a_numbers" }),
        )
        .await;
        assert_eq!(blocked_reenable.status(), StatusCode::UNPROCESSABLE_ENTITY);

        let export = json_request(
            app.clone(),
            "POST",
            "/api/v1/performance/exports",
            json!({ "archive_type": "readable_untrusted" }),
        )
        .await;
        assert_eq!(export.status(), StatusCode::OK);
        let export = response_json(export).await;
        assert_eq!(export["authoritative"], false);
        assert!(export["status_label"]["withdrawn_at"].is_string());

        let (replay_status, replay) = get_json(app.clone(), "/api/v1/performance/replay").await;
        assert_eq!(replay_status, StatusCode::OK);
        assert_eq!(replay["append_only"], true);
        assert!(
            replay["events"]
                .as_array()
                .is_some_and(|events| events.len() >= 8)
        );

        let (dashboard_status, dashboard) = get_json(app, "/api/v1/performance/dashboard").await;
        assert_eq!(dashboard_status, StatusCode::OK);
        assert_eq!(dashboard["session"]["climate_variant"], "c_dimensions");
        assert_eq!(dashboard["session"]["climate_enabled"], false);
    }

    #[tokio::test]
    async fn performance_center_rejects_unknown_or_overbroad_actions() {
        let app = test_app().await;
        let unknown_variant = json_request(
            app.clone(),
            "PUT",
            "/api/v1/performance/climate",
            json!({ "variant": "scoreboard" }),
        )
        .await;
        assert_eq!(unknown_variant.status(), StatusCode::UNPROCESSABLE_ENTITY);

        let overlong_share = json_request(
            app.clone(),
            "POST",
            "/api/v1/performance/shares",
            json!({
                "recipient": "Fixture",
                "purpose": "Fixture",
                "duration_days": 31,
                "dimension_ids": ["ability-knowledge"]
            }),
        )
        .await;
        assert_eq!(overlong_share.status(), StatusCode::UNPROCESSABLE_ENTITY);

        let unknown_target = json_request(
            app.clone(),
            "POST",
            "/api/v1/performance/corrections",
            json!({
                "target_id": "class-rank",
                "reason": "This target must not exist."
            }),
        )
        .await;
        assert_eq!(unknown_target.status(), StatusCode::UNPROCESSABLE_ENTITY);

        let trusted_claim = json_request(
            app.clone(),
            "POST",
            "/api/v1/performance/exports",
            json!({ "archive_type": "trusted" }),
        )
        .await;
        assert_eq!(trusted_claim.status(), StatusCode::UNPROCESSABLE_ENTITY);

        let (missing_status, _) =
            get_json(app, "/api/v1/performance/evidence/evidence-not-declared").await;
        assert_eq!(missing_status, StatusCode::NOT_FOUND);
    }

    #[tokio::test]
    async fn opportunity_market_exposes_transparent_fixture_and_four_state_eligibility() {
        let app = test_app().await;
        let (demo_status, demo) = get_json(app.clone(), "/api/v1/demo/opportunity-market").await;
        assert_eq!(demo_status, StatusCode::OK);
        assert_eq!(demo["data_mode"], "demo_fixture");
        assert_eq!(demo["opportunities"].as_array().map(Vec::len), Some(16));
        assert_eq!(demo["packs"].as_array().map(Vec::len), Some(3));
        assert!(
            demo["opportunities"]
                .as_array()
                .is_some_and(|items| items.iter().all(|item| {
                    item["paid_ranking_factor"].as_f64() == Some(0.0)
                        && item["random_allocation"] == false
                        && item["auction_enabled"] == false
                        && matches!(item["scope"].as_str(), Some("campus") | Some("external"))
                }))
        );

        let selection = json_request(
            app.clone(),
            "PUT",
            "/api/v1/opportunity-profile",
            json!({
                "field_ids": [
                    "field-goal-research",
                    "field-interest-signal",
                    "field-course-sls201",
                    "field-portfolio-signal",
                    "field-availability-hours"
                ]
            }),
        )
        .await;
        assert_eq!(selection.status(), StatusCode::OK);
        assert_eq!(
            response_json(selection).await["selected_field_ids"]
                .as_array()
                .map(Vec::len),
            Some(5)
        );

        let check = json_request(
            app.clone(),
            "POST",
            "/api/v1/opportunities/opp-signal-lab/eligibility",
            json!({}),
        )
        .await;
        assert_eq!(check.status(), StatusCode::OK);
        let check = response_json(check).await;
        assert_eq!(check["has_composite_score"], false);
        let states = check["results"]
            .as_array()
            .expect("eligibility results must be an array")
            .iter()
            .filter_map(|item| item["status"].as_str())
            .collect::<std::collections::HashSet<_>>();
        assert_eq!(
            states,
            ["met", "possibly_met", "not_met", "unknown"]
                .into_iter()
                .collect()
        );

        let matching = json_request(app, "POST", "/api/v1/opportunity-match", json!({})).await;
        assert_eq!(matching.status(), StatusCode::OK);
        let matching = response_json(matching).await;
        assert_eq!(matching.as_array().map(Vec::len), Some(14));
        assert!(
            matching
                .as_array()
                .is_some_and(|items| items.iter().all(|item| {
                    item["paid_influence"] == false
                        && item["ranking_basis"] == "eligibility_then_deadline"
                }))
        );
    }

    #[tokio::test]
    async fn opportunity_market_api_enforces_double_opt_in_external_mirror_and_revoke() {
        let app = test_app().await;
        let blocked_disclosure = json_request(
            app.clone(),
            "POST",
            "/api/v1/opportunities/opp-signal-lab/disclosures",
            json!({ "duration_days": 7 }),
        )
        .await;
        assert_eq!(
            blocked_disclosure.status(),
            StatusCode::UNPROCESSABLE_ENTITY
        );

        let saved = json_request(
            app.clone(),
            "POST",
            "/api/v1/opportunities/opp-signal-lab/save",
            json!({ "note": "Fixture only" }),
        )
        .await;
        assert_eq!(saved.status(), StatusCode::CREATED);
        assert_eq!(response_json(saved).await["intent_status"], "saved");

        let intent = json_request(
            app.clone(),
            "POST",
            "/api/v1/opportunities/opp-signal-lab/interest",
            json!({}),
        )
        .await;
        assert_eq!(intent.status(), StatusCode::OK);
        assert_eq!(
            response_json(intent).await["intent_status"],
            "student_interested"
        );

        let provider = json_request(
            app.clone(),
            "POST",
            "/api/v1/opportunities/opp-signal-lab/provider-ack",
            json!({}),
        )
        .await;
        assert_eq!(provider.status(), StatusCode::OK);
        assert_eq!(
            response_json(provider).await["intent_status"],
            "mutual_interest"
        );

        let disclosure = json_request(
            app.clone(),
            "POST",
            "/api/v1/opportunities/opp-signal-lab/disclosures",
            json!({ "duration_days": 7 }),
        )
        .await;
        assert_eq!(disclosure.status(), StatusCode::CREATED);
        let disclosure = response_json(disclosure).await;
        assert_eq!(disclosure["expires_at"], "2026-07-31T23:59:00+08:00");
        let grant_id = disclosure["id"]
            .as_str()
            .expect("disclosure id must be present");

        let missing_confirmation = json_request(
            app.clone(),
            "POST",
            "/api/v1/opportunities/opp-signal-lab/external-status",
            json!({ "student_confirmed": false }),
        )
        .await;
        assert_eq!(
            missing_confirmation.status(),
            StatusCode::UNPROCESSABLE_ENTITY
        );

        let external = json_request(
            app.clone(),
            "POST",
            "/api/v1/opportunities/opp-signal-lab/external-status",
            json!({ "student_confirmed": true }),
        )
        .await;
        assert_eq!(external.status(), StatusCode::OK);
        let external = response_json(external).await;
        assert_eq!(external["status"], "applied_externally");
        assert_eq!(external["authoritative"], false);

        let revoked = json_request(
            app.clone(),
            "DELETE",
            &format!("/api/v1/opportunity-disclosures/{grant_id}"),
            json!({}),
        )
        .await;
        assert_eq!(revoked.status(), StatusCode::OK);
        assert!(response_json(revoked).await["revoked_at"].is_string());

        let (detail_status, detail) = get_json(app, "/api/v1/opportunities/opp-signal-lab").await;
        assert_eq!(detail_status, StatusCode::OK);
        assert_eq!(detail["box_score"]["disclosed_fields"], json!([]));
        assert_eq!(detail["box_score"]["no_auto_apply"], true);
    }

    #[tokio::test]
    async fn opportunity_market_api_preserves_reversible_paths_untrusted_exports_and_replay() {
        let app = test_app().await;
        let capacity = json_request(
            app.clone(),
            "POST",
            "/api/v1/opportunities/opp-signal-lab/capacity-plans",
            json!({
                "hours_per_week": 4,
                "note": "Do not displace coursework or recovery."
            }),
        )
        .await;
        assert_eq!(capacity.status(), StatusCode::CREATED);
        assert_eq!(
            response_json(capacity).await["hours_per_week"].as_f64(),
            Some(4.0)
        );

        let pathway = json_request(
            app.clone(),
            "PUT",
            "/api/v1/opportunity-pathways/path-major-change",
            json!({}),
        )
        .await;
        assert_eq!(pathway.status(), StatusCode::OK);
        let pathway = response_json(pathway).await;
        assert_eq!(pathway["authoritative"], false);
        assert!(pathway["rollback_point"].is_string());

        let export = json_request(
            app.clone(),
            "POST",
            "/api/v1/opportunity-portfolio/exports",
            json!({
                "artifact_ids": [
                    "artifact-smartcourse",
                    "artifact-world-exam"
                ]
            }),
        )
        .await;
        assert_eq!(export.status(), StatusCode::OK);
        let export = response_json(export).await;
        assert_eq!(export["authoritative"], false);
        assert_eq!(export["artifacts"].as_array().map(Vec::len), Some(2));
        assert!(export["artifacts"].as_array().is_some_and(|items| {
            items
                .iter()
                .all(|item| item["includes_original_material"] == false)
        }));

        let matching =
            json_request(app.clone(), "POST", "/api/v1/opportunity-match", json!({})).await;
        assert_eq!(matching.status(), StatusCode::OK);
        assert_eq!(
            response_json(matching).await.as_array().map(Vec::len),
            Some(14)
        );

        let report = json_request(
            app.clone(),
            "POST",
            "/api/v1/opportunities/opp-signal-lab/reports",
            json!({
                "report_type": "wrong_info",
                "reason": "Fixture source needs a human version check."
            }),
        )
        .await;
        assert_eq!(report.status(), StatusCode::ACCEPTED);
        assert_eq!(
            response_json(report).await["affected_match_recalculated"],
            true
        );

        let fairness = json_request(
            app.clone(),
            "POST",
            "/api/v1/opportunity-fairness/run",
            json!({}),
        )
        .await;
        assert_eq!(fairness.status(), StatusCode::OK);
        let fairness = response_json(fairness).await;
        assert_eq!(fairness["status"], "pass");
        assert_eq!(fairness["checks"].as_array().map(Vec::len), Some(5));

        let (replay_status, replay) = get_json(app.clone(), "/api/v1/opportunity-replay").await;
        assert_eq!(replay_status, StatusCode::OK);
        assert_eq!(replay["append_only"], true);
        assert!(
            replay["events"]
                .as_array()
                .is_some_and(|events| events.len() >= 6)
        );

        let reset = json_request(
            app,
            "POST",
            "/api/v1/demo/opportunity-market/reset",
            json!({}),
        )
        .await;
        assert_eq!(reset.status(), StatusCode::OK);
        assert_eq!(
            response_json(reset).await["match_results"]
                .as_array()
                .map(Vec::len),
            Some(0)
        );
    }

    #[tokio::test]
    async fn coach_scouting_exposes_five_sources_thresholds_and_version_boundaries() {
        let app = test_app().await;
        let (demo_status, demo) = get_json(app.clone(), "/api/v1/demo/coach-scouting").await;
        assert_eq!(demo_status, StatusCode::OK);
        assert_eq!(demo["data_mode"], "demo_fixture");
        assert_eq!(demo["sources"].as_array().map(Vec::len), Some(5));
        assert!(
            demo["office_hours"]
                .as_array()
                .is_some_and(|items| items.iter().any(|item| item["status"] == "expired"))
        );
        assert!(
            demo["workload"]
                .as_array()
                .is_some_and(|items| items.iter().any(|item| {
                    item["sample_size"] == 3
                        && item["minimum_sample"] == 5
                        && item["publishable"] == false
                }))
        );

        let comparison = json_request(
            app,
            "POST",
            "/api/v1/coach-scouting/versions/compare",
            json!({
                "from_version_id": "version-2025sp",
                "to_version_id": "version-2026sp"
            }),
        )
        .await;
        assert_eq!(comparison.status(), StatusCode::OK);
        let comparison = response_json(comparison).await;
        assert_eq!(comparison["feedback_carried_forward"], false);
        assert_eq!(comparison["same_instructor_assignment"], false);
        assert_eq!(comparison["changes"].as_array().map(Vec::len), Some(3));
    }

    #[tokio::test]
    async fn coach_scouting_corrections_feedback_and_fairness_are_governed() {
        let app = test_app().await;
        let correction = json_request(
            app.clone(),
            "POST",
            "/api/v1/coach-scouting/corrections",
            json!({
                "target_id": "feedback-method",
                "correction_type": "context",
                "statement": "反馈窗口会随任务类型变化，不承诺固定返回日。",
                "evidence_ids": ["src-teacher-confirmed"]
            }),
        )
        .await;
        assert_eq!(correction.status(), StatusCode::CREATED);
        let correction = response_json(correction).await;
        let correction_id = correction["id"]
            .as_str()
            .expect("Coach correction id must exist");

        let reviewing = json_request(
            app.clone(),
            "PUT",
            &format!("/api/v1/coach-scouting/corrections/{correction_id}"),
            json!({ "status": "in_review" }),
        )
        .await;
        assert_eq!(reviewing.status(), StatusCode::OK);
        assert_eq!(response_json(reviewing).await["status"], "in_review");

        let accepted = json_request(
            app.clone(),
            "PUT",
            &format!("/api/v1/coach-scouting/corrections/{correction_id}"),
            json!({ "status": "accepted" }),
        )
        .await;
        assert_eq!(accepted.status(), StatusCode::OK);
        let accepted = response_json(accepted).await;
        assert_eq!(accepted["status"], "accepted");
        assert_eq!(accepted["history"].as_array().map(Vec::len), Some(3));

        let feedback = json_request(
            app.clone(),
            "POST",
            "/api/v1/coach-scouting/feedback",
            json!({
                "dimension": "feedback_timeliness",
                "concrete_experience": "两次实验报告的返回时间存在明显差异。",
                "suggested_action": "发布任务时同时说明预计反馈窗口。",
                "consent_to_aggregate": true
            }),
        )
        .await;
        assert_eq!(feedback.status(), StatusCode::CREATED);
        assert_eq!(response_json(feedback).await["safety_status"], "eligible");

        let unsafe_feedback = json_request(
            app.clone(),
            "POST",
            "/api/v1/coach-scouting/feedback",
            json!({
                "dimension": "assignment_clarity",
                "concrete_experience": "这个老师人品最差并且课程体验垃圾。",
                "suggested_action": "先进入人工复核再决定是否聚合。",
                "consent_to_aggregate": true
            }),
        )
        .await;
        assert_eq!(unsafe_feedback.status(), StatusCode::CREATED);
        assert_eq!(
            response_json(unsafe_feedback).await["safety_status"],
            "held_for_review"
        );

        let blocked_sensitive = json_request(
            app.clone(),
            "PUT",
            "/api/v1/coach-scouting/team-profile",
            json!({ "field_ids": ["team-sensitive-gender"] }),
        )
        .await;
        assert_eq!(blocked_sensitive.status(), StatusCode::UNPROCESSABLE_ENTITY);

        let fairness = json_request(
            app,
            "POST",
            "/api/v1/coach-scouting/fairness/run",
            json!({}),
        )
        .await;
        assert_eq!(fairness.status(), StatusCode::OK);
        let fairness = response_json(fairness).await;
        assert_eq!(fairness["status"], "pass");
        assert_eq!(fairness["checks"].as_array().map(Vec::len), Some(5));
    }

    #[tokio::test]
    async fn coach_scouting_team_handoff_and_governance_preserve_truth() {
        let app = test_app().await;
        let matching = json_request(
            app.clone(),
            "POST",
            "/api/v1/coach-scouting/team-match",
            json!({}),
        )
        .await;
        assert_eq!(matching.status(), StatusCode::OK);
        let matching = response_json(matching).await;
        assert_eq!(matching.as_array().map(Vec::len), Some(2));
        assert!(matching.as_array().is_some_and(|items| {
            items
                .iter()
                .all(|item| item["used_sensitive_attributes"] == false)
        }));

        let handoff = json_request(
            app.clone(),
            "POST",
            "/api/v1/coach-scouting/advisor-handoffs",
            json!({
                "questions": [
                    "当前先修缺口是否需要在正式选课前补齐？",
                    "Balanced Plan 的实验周负荷是否可持续？"
                ],
                "evidence_ids": [
                    "src-official-syllabus",
                    "src-teacher-confirmed"
                ],
                "scenario_ids": ["balanced-plan"],
                "consent_confirmed": true
            }),
        )
        .await;
        assert_eq!(handoff.status(), StatusCode::CREATED);
        let handoff = response_json(handoff).await;
        assert!(handoff["advisor_response"].is_null());
        assert_eq!(handoff["status"], "ready_for_student");

        let acknowledged = json_request(
            app.clone(),
            "POST",
            "/api/v1/coach-scouting/reminders/reminder-equipment/ack",
            json!({}),
        )
        .await;
        assert_eq!(acknowledged.status(), StatusCode::OK);
        assert_eq!(
            response_json(acknowledged).await,
            json!(["reminder-equipment"])
        );

        let report = json_request(
            app.clone(),
            "POST",
            "/api/v1/coach-scouting/reports",
            json!({
                "report_type": "privacy",
                "target_id": "aggregate-clarity",
                "evidence": "聚合文本包含可识别个人实验描述。",
                "serious": true
            }),
        )
        .await;
        assert_eq!(report.status(), StatusCode::ACCEPTED);
        let report = response_json(report).await;
        assert_eq!(report["temporary_measure"], "hidden_pending_review");
        assert_eq!(report["status"], "under_review");

        let (aggregate_status, aggregates) =
            get_json(app.clone(), "/api/v1/coach-scouting/feedback/aggregates").await;
        assert_eq!(aggregate_status, StatusCode::OK);
        assert!(
            aggregates
                .as_array()
                .is_some_and(|items| items.iter().all(|item| item["published"] == false))
        );

        let (replay_status, replay) = get_json(app.clone(), "/api/v1/coach-scouting/replay").await;
        assert_eq!(replay_status, StatusCode::OK);
        assert_eq!(replay["append_only"], true);
        assert_eq!(replay["box_score"]["fabricated_advisor_replies"], 0);
        assert_eq!(replay["box_score"]["sensitive_team_fields_used"], 0);

        let reset = json_request(app, "POST", "/api/v1/demo/coach-scouting/reset", json!({})).await;
        assert_eq!(reset.status(), StatusCode::OK);
        let reset = response_json(reset).await;
        assert_eq!(reset["governance_cases"].as_array().map(Vec::len), Some(0));
        assert!(reset["advisor_handoff"].is_null());
    }

    #[tokio::test]
    async fn campus_life_search_profile_calendar_and_route_preserve_student_control() {
        let app = test_app().await;
        let (status, campus) = get_json(app.clone(), "/api/v1/campus-life").await;
        assert_eq!(status, StatusCode::OK);
        assert_eq!(campus["data_mode"], "demo_fixture");
        assert_eq!(campus["box_score"]["official_results_claimed"], 0);
        assert_eq!(campus["box_score"]["location_tracking_events"], 0);

        let profile = json_request(
            app.clone(),
            "PUT",
            "/api/v1/campus-life/profile",
            json!({ "profiling_enabled": false, "interests": [] }),
        )
        .await;
        assert_eq!(profile.status(), StatusCode::OK);
        assert_eq!(response_json(profile).await["profiling_enabled"], false);

        let search = json_request(
            app.clone(),
            "POST",
            "/api/v1/campus-life/search",
            json!({
                "text": "实验",
                "category": null,
                "location_id": null,
                "delivery_mode": null,
                "accessibility_required": true,
                "include_expired": false
            }),
        )
        .await;
        assert_eq!(search.status(), StatusCode::OK);
        let search = response_json(search).await;
        assert_eq!(search["fallback_used"], true);
        assert!(
            search["event_ids"]
                .as_array()
                .is_some_and(|items| !items.is_empty())
        );

        let calendar = json_request(
            app.clone(),
            "POST",
            "/api/v1/campus-life/calendar",
            json!({ "event_id": "event-film-room" }),
        )
        .await;
        assert_eq!(calendar.status(), StatusCode::CREATED);
        let calendar = response_json(calendar).await;
        assert_eq!(calendar["registration_performed"], false);
        assert!(
            calendar["conflict_labels"]
                .as_array()
                .is_some_and(|items| !items.is_empty())
        );

        let route = json_request(
            app,
            "POST",
            "/api/v1/campus-life/routes",
            json!({
                "from_location_id": "loc-dorm",
                "to_location_id": "loc-library",
                "accessible_only": true
            }),
        )
        .await;
        assert_eq!(route.status(), StatusCode::OK);
        assert_eq!(response_json(route).await["accessible"], true);
    }

    #[tokio::test]
    async fn campus_life_team_mentor_notifications_and_receipts_keep_governance_boundaries() {
        let app = test_app().await;
        let intent = json_request(
            app.clone(),
            "POST",
            "/api/v1/campus-life/team-intents/team-signal-story",
            json!({}),
        )
        .await;
        assert_eq!(intent.status(), StatusCode::CREATED);
        let intent = response_json(intent).await;
        assert_eq!(intent["disclosure_status"], "waiting_counterparty");
        assert_eq!(intent["disclosed_fields"], json!([]));

        let mutual = json_request(
            app.clone(),
            "POST",
            "/api/v1/campus-life/team-intents/team-signal-story/counterparty",
            json!({}),
        )
        .await;
        assert_eq!(mutual.status(), StatusCode::OK);
        assert_eq!(
            response_json(mutual).await["disclosure_status"],
            "mutual_intent"
        );

        let handoff = json_request(
            app.clone(),
            "POST",
            "/api/v1/campus-life/mentor-handoffs",
            json!({
                "mentor_id": "mentor-senior-fixture",
                "questions": ["这个校园服务的正式办理入口在哪里？"],
                "evidence_ids": ["src-student-affairs"],
                "consent_confirmed": true
            }),
        )
        .await;
        assert_eq!(handoff.status(), StatusCode::CREATED);
        let handoff = response_json(handoff).await;
        assert!(handoff["mentor_response"].is_null());
        assert_eq!(handoff["status"], "ready_for_student");

        let notifications = json_request(
            app.clone(),
            "PUT",
            "/api/v1/campus-life/notifications",
            json!({
                "enabled_categories": ["deadline", "marketing"],
                "frequency": "daily_digest",
                "quiet_hours": "22:30–08:00",
                "marketing_enabled": false
            }),
        )
        .await;
        assert_eq!(notifications.status(), StatusCode::OK);
        let notifications = response_json(notifications).await;
        assert_eq!(notifications["emergency_enabled"], true);
        assert_eq!(notifications["marketing_enabled"], false);
        assert_eq!(notifications["enabled_categories"], json!(["deadline"]));

        let receipt = json_request(
            app,
            "POST",
            "/api/v1/campus-life/receipts",
            json!({
                "target_id": "event-maker-night",
                "participation": "attended",
                "reflection": "只记录自己的收获。"
            }),
        )
        .await;
        assert_eq!(receipt.status(), StatusCode::CREATED);
        let receipt = response_json(receipt).await;
        assert_eq!(receipt["private"], true);
        assert_eq!(receipt["affects_student_value"], false);
    }

    #[tokio::test]
    async fn campus_life_mycourt_correction_replay_and_reset_remain_private_and_traceable() {
        let app = test_app().await;
        let saved = json_request(
            app.clone(),
            "POST",
            "/api/v1/campus-life/saved",
            json!({
                "target_id": "service-library-access",
                "target_type": "service"
            }),
        )
        .await;
        assert_eq!(saved.status(), StatusCode::CREATED);

        let correction = json_request(
            app.clone(),
            "POST",
            "/api/v1/campus-life/corrections",
            json!({
                "target_id": "service-library-access",
                "reason": "Fixture 开放时间需要人工核对新版本。"
            }),
        )
        .await;
        assert_eq!(correction.status(), StatusCode::ACCEPTED);
        assert_eq!(response_json(correction).await["status"], "submitted");

        let export = json_request(
            app.clone(),
            "POST",
            "/api/v1/campus-life/mycourt/export",
            json!({}),
        )
        .await;
        assert_eq!(export.status(), StatusCode::OK);
        let export = response_json(export).await;
        assert_eq!(export["private"], true);
        assert_eq!(export["trusted"], false);

        let (replay_status, replay) = get_json(app.clone(), "/api/v1/campus-life/replay").await;
        assert_eq!(replay_status, StatusCode::OK);
        assert_eq!(replay["append_only"], true);
        assert_eq!(replay["official_results_claimed"], 0);
        assert_eq!(replay["location_tracking_events"], 0);
        assert_eq!(replay["participation_value_scores"], 0);

        let reset = json_request(app, "POST", "/api/v1/demo/campus-life/reset", json!({})).await;
        assert_eq!(reset.status(), StatusCode::OK);
        let reset = response_json(reset).await;
        assert_eq!(reset["saved_items"].as_array().map(Vec::len), Some(0));
        assert_eq!(
            reset["source_corrections"].as_array().map(Vec::len),
            Some(0)
        );
        assert_eq!(reset["audit"].as_array().map(Vec::len), Some(1));
    }

    #[tokio::test]
    async fn campus_pass_wallet_and_reader_reject_impersonation_without_granting_access() {
        let app = test_app().await;
        let (status, pass) = get_json(app.clone(), "/api/v1/campus-pass").await;
        assert_eq!(status, StatusCode::OK);
        assert_eq!(pass["data_mode"], "demo_fixture");
        assert_eq!(pass["box_score"]["official_credentials_issued"], 0);
        assert_eq!(pass["box_score"]["official_access_actions_executed"], 0);
        assert_eq!(pass["box_score"]["source_passwords_stored"], 0);

        let selected = json_request(
            app.clone(),
            "PUT",
            "/api/v1/campus-pass/credentials/credential-student-active/select",
            json!({}),
        )
        .await;
        assert_eq!(selected.status(), StatusCode::OK);
        assert_eq!(response_json(selected).await["state"], "active");

        let screenshot = json_request(
            app.clone(),
            "POST",
            "/api/v1/campus-pass/credentials/credential-student-active/present",
            json!({ "carrier": "dynamic_qr", "static_capture": true }),
        )
        .await;
        assert_eq!(screenshot.status(), StatusCode::CREATED);
        let screenshot = response_json(screenshot).await;
        assert_eq!(screenshot["accepted_by_demo_reader"], false);
        assert_eq!(screenshot["official_access_granted"], false);

        let nfc = json_request(
            app,
            "POST",
            "/api/v1/campus-pass/credentials/credential-student-active/present",
            json!({ "carrier": "nfc", "static_capture": false }),
        )
        .await;
        assert_eq!(nfc.status(), StatusCode::CREATED);
        let nfc = response_json(nfc).await;
        assert_eq!(nfc["accepted_by_demo_reader"], true);
        assert_eq!(nfc["official_access_granted"], false);
    }

    #[tokio::test]
    async fn campus_pass_requests_guest_and_prerequisites_remain_non_authoritative() {
        let app = test_app().await;
        let request = json_request(
            app.clone(),
            "POST",
            "/api/v1/campus-pass/access-requests",
            json!({
                "credential_id": "credential-student-active",
                "zone_id": "zone-library",
                "purpose": "完成晚间课程复习"
            }),
        )
        .await;
        assert_eq!(request.status(), StatusCode::CREATED);
        let request = response_json(request).await;
        assert_eq!(request["status"], "submitted");
        assert_eq!(request["authoritative"], false);
        let request_id = request["id"].as_str().expect("request id");

        let mirror = json_request(
            app.clone(),
            "PUT",
            &format!("/api/v1/campus-pass/access-requests/{request_id}/mirror"),
            json!({ "status": "reviewing" }),
        )
        .await;
        assert_eq!(mirror.status(), StatusCode::OK);
        let mirror = response_json(mirror).await;
        assert_eq!(mirror["status"], "reviewing");
        assert_eq!(mirror["experience_executed_access"], false);

        let blocked = json_request(
            app.clone(),
            "POST",
            "/api/v1/campus-pass/access-requests",
            json!({
                "credential_id": "credential-student-active",
                "zone_id": "zone-robotics-lab",
                "purpose": "完成课程实验"
            }),
        )
        .await;
        assert_eq!(blocked.status(), StatusCode::CREATED);
        let blocked = response_json(blocked).await;
        assert_eq!(blocked["status"], "draft_blocked_prerequisites");
        assert!(
            blocked["missing_prerequisite_ids"]
                .as_array()
                .is_some_and(|items| !items.is_empty())
        );

        let guest = json_request(
            app,
            "POST",
            "/api/v1/campus-pass/guest-drafts",
            json!({
                "zone_id": "zone-library",
                "purpose": "参加公开讲座",
                "sponsor_label": "NAN Fixture",
                "duration_hours": 2
            }),
        )
        .await;
        assert_eq!(guest.status(), StatusCode::CREATED);
        let guest = response_json(guest).await;
        assert_eq!(guest["auto_expires"], true);
        assert_eq!(guest["authoritative"], false);
    }

    #[tokio::test]
    async fn campus_pass_loss_offline_correction_fallback_and_replay_keep_external_authority() {
        let app = test_app().await;
        let loss = json_request(
            app.clone(),
            "POST",
            "/api/v1/campus-pass/loss-cases",
            json!({
                "credential_id": "credential-student-active",
                "requested_action": "freeze"
            }),
        )
        .await;
        assert_eq!(loss.status(), StatusCode::CREATED);
        assert_eq!(
            response_json(loss).await["experience_executed_action"],
            false
        );

        let offline = json_request(
            app.clone(),
            "POST",
            "/api/v1/campus-pass/offline-checks",
            json!({
                "credential_id": "credential-student-active",
                "zone_id": "zone-robotics-lab",
                "carrier": "nfc"
            }),
        )
        .await;
        assert_eq!(offline.status(), StatusCode::CREATED);
        let offline = response_json(offline).await;
        assert_eq!(offline["valid"], false);
        assert_eq!(offline["cryptographically_verified"], false);
        assert_eq!(offline["official_access_granted"], false);

        let correction = json_request(
            app.clone(),
            "POST",
            "/api/v1/campus-pass/access-log-corrections",
            json!({
                "record_id": "access-record-001",
                "reason": "本人当时没有进入该区域，请核对读卡器记录。"
            }),
        )
        .await;
        assert_eq!(correction.status(), StatusCode::CREATED);
        assert_eq!(response_json(correction).await["status"], "submitted");

        let manual = json_request(
            app.clone(),
            "POST",
            "/api/v1/campus-pass/manual-fallbacks",
            json!({
                "fallback_id": "fallback-access-desk",
                "reason": "手机没电，需要人工核验"
            }),
        )
        .await;
        assert_eq!(manual.status(), StatusCode::CREATED);
        assert_eq!(
            response_json(manual).await["experience_executed_access"],
            false
        );

        let (replay_status, replay) = get_json(app.clone(), "/api/v1/campus-pass/replay").await;
        assert_eq!(replay_status, StatusCode::OK);
        assert_eq!(replay["append_only"], true);
        assert_eq!(replay["official_credentials_issued"], 0);
        assert_eq!(replay["official_access_actions_executed"], 0);
        assert_eq!(replay["precise_tracking_events"], 0);

        let reset = json_request(app, "POST", "/api/v1/demo/campus-pass/reset", json!({})).await;
        assert_eq!(reset.status(), StatusCode::OK);
        let reset = response_json(reset).await;
        assert_eq!(reset["access_requests"].as_array().map(Vec::len), Some(0));
        assert_eq!(reset["audit"].as_array().map(Vec::len), Some(1));
    }
}

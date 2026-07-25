//! Platform-independent SmartCourse domain contracts for the Phase 0 slice.
//!
//! This crate deliberately contains no HTTP, SQL, filesystem, UI, or operating-system types.

mod campus_life;
mod campus_pass;
mod coach_scouting;
mod opportunity_market;
mod roster_import;

pub use campus_life::*;
pub use campus_pass::*;
pub use coach_scouting::*;
pub use opportunity_market::*;
pub use roster_import::*;

use serde::{Deserialize, Serialize};
use std::collections::{BTreeMap, HashSet};
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
    pub object_id: String,
    pub published_version_id: String,
    pub actor_id: String,
    pub interaction_type: String,
    pub selected_answer: Option<String>,
    pub correct: Option<bool>,
    pub duration_ms: Option<u64>,
    pub occurred_at_unix_ms: u64,
    pub fixture: bool,
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
pub struct InteractionCommand {
    pub schema_version: String,
    pub actor_id: String,
    pub interaction_type: String,
    pub selected_answer: Option<String>,
    pub correct: Option<bool>,
    pub duration_ms: Option<u64>,
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

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
pub struct CareerSemester {
    pub id: String,
    pub student_id: String,
    pub name: String,
    pub season_number: u32,
    pub total_seasons: u32,
    pub stage: String,
    pub start_date: String,
    pub end_date: String,
    pub status: String,
    pub courses: Vec<String>,
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
pub struct CareerLearningSession {
    pub completion_pct: u32,
    pub correct_count: u32,
    pub total_questions: u32,
    pub duration_seconds: u64,
    pub completed_at: String,
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
pub struct CareerCourse {
    pub id: String,
    pub semester_id: String,
    pub name: String,
    pub code: String,
    pub credits: u32,
    pub role: String,
    pub schedule: String,
    pub status: String,
    pub progress_pct: u32,
    pub next_action: String,
    pub linked_published_id: Option<String>,
    pub last_session: Option<CareerLearningSession>,
    pub source_ref: String,
    pub authority: String,
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
pub struct CareerDeadline {
    pub id: String,
    pub course_id: String,
    pub title: String,
    pub due_at: String,
    pub source_ref: String,
    pub authority: String,
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
pub struct CareerOpportunity {
    pub title: String,
    pub detail: String,
    pub source_ref: String,
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
pub struct CareerFixture {
    pub schema_version: String,
    pub data_mode: String,
    pub source_boundary: String,
    pub updated_at: String,
    pub semester: CareerSemester,
    pub courses: Vec<CareerCourse>,
    pub deadlines: Vec<CareerDeadline>,
    pub opportunity: CareerOpportunity,
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
pub struct CareerRecentActivity {
    pub activity_type: String,
    pub description: String,
    pub occurred_at: String,
    pub source_ref: String,
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
pub struct CareerDashboard {
    pub schema_version: String,
    pub data_mode: String,
    pub student_id: String,
    pub current_semester: CareerSemester,
    pub total_credits: u32,
    pub completed_credits: u32,
    pub active_courses: u32,
    pub upcoming_deadlines: Vec<CareerDeadline>,
    pub recent_activities: Vec<CareerRecentActivity>,
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
pub struct CareerLinkedContent {
    pub published_id: String,
    pub student_path: String,
    pub replay_path: String,
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
pub struct CareerCourseDetail {
    pub schema_version: String,
    pub data_mode: String,
    pub course: CareerCourse,
    pub linked_content: Option<CareerLinkedContent>,
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
pub struct RosterTimeSlot {
    pub weekday: String,
    pub start: String,
    pub end: String,
    pub room: String,
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
pub struct RosterOffering {
    pub offering_id: String,
    pub capacity: u32,
    pub enrolled: u32,
    pub time_slots: Vec<RosterTimeSlot>,
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
pub struct RosterCourseSpec {
    pub course_id: String,
    pub title: String,
    pub credits: u32,
    pub role: String,
    pub department: String,
    pub prerequisites: Vec<String>,
    pub corequisites: Vec<String>,
    pub substitutes: Vec<String>,
    pub exclusions: Vec<String>,
    pub offerings: Vec<RosterOffering>,
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
pub struct RosterPlannedCourse {
    pub course_id: String,
    pub offering_id: String,
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
pub struct RosterPrefix {
    pub id: String,
    pub student_id: String,
    pub version: u32,
    pub completed: Vec<String>,
    pub in_progress: Vec<String>,
    pub planned: Vec<RosterPlannedCourse>,
    pub dropped: Vec<String>,
    pub total_credits_earned: u32,
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
pub struct RosterPin {
    pub id: String,
    pub pin_type: String,
    pub course_id: Option<String>,
    pub offering_id: Option<String>,
    pub time_slot: Option<RosterTimeSlot>,
    pub lock_reason: String,
    pub active: bool,
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
pub struct RosterPreferences {
    pub time_of_day: String,
    pub compactness: u32,
    pub variety: u32,
    pub stability: u32,
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
pub struct RosterCreditRange {
    pub min: u32,
    pub max: u32,
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
pub struct RosterCourseSelection {
    pub course_id: String,
    pub offering_id: String,
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
pub struct RosterTradeoff {
    pub impact: String,
    pub title: String,
    pub detail: String,
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
pub struct RosterRisk {
    pub severity: String,
    pub description: String,
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
pub struct SemesterPlan {
    pub id: String,
    pub label: String,
    pub strategy: String,
    pub course_selections: Vec<RosterCourseSelection>,
    pub total_credits: u32,
    pub hard_constraints_met: bool,
    pub preference_score: u32,
    pub migration_cost: u32,
    pub tradeoffs: Vec<RosterTradeoff>,
    pub risks: Vec<RosterRisk>,
    pub solver_backend: String,
    pub is_simulation: bool,
    pub input_fingerprint: String,
    pub is_formal_enrollment: bool,
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
pub struct RosterViolation {
    pub violation_type: String,
    pub course_ids: Vec<String>,
    pub description: String,
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
pub struct RosterBlockingStep {
    pub step: u32,
    pub description: String,
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
pub struct RosterRelaxableItem {
    pub item: String,
    pub impact_if_relaxed: String,
    pub alternative_course_ids: Vec<String>,
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
pub struct RosterUnsatisfiableExplanation {
    pub request_id: String,
    pub minimal_conflict_set: Vec<RosterViolation>,
    pub blocking_chain: Vec<RosterBlockingStep>,
    pub relaxable_items: Vec<RosterRelaxableItem>,
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
pub struct RosterFixture {
    pub schema_version: String,
    pub data_mode: String,
    pub student_id: String,
    pub semester: String,
    pub catalog_version: String,
    pub source_boundary: String,
    pub credit_range: RosterCreditRange,
    pub catalog: Vec<RosterCourseSpec>,
    pub prefix: RosterPrefix,
    pub pins: Vec<RosterPin>,
    pub preferences: RosterPreferences,
    pub goal_order: Vec<String>,
    pub plans: Vec<SemesterPlan>,
    pub unsat: RosterUnsatisfiableExplanation,
}

impl RosterFixture {
    pub fn validate(&self) -> Result<(), DomainError> {
        require_supported_schema(&self.schema_version)?;
        if self.data_mode != "fixture" {
            return Err(DomainError::InvariantViolation(
                "public Roster Lab demo must remain data_mode=fixture".to_owned(),
            ));
        }
        if !(8..=20).contains(&self.catalog.len()) {
            return Err(DomainError::InvariantViolation(
                "Roster Lab fixture must contain 8 to 20 courses".to_owned(),
            ));
        }
        if self.credit_range.min > self.credit_range.max {
            return Err(DomainError::InvariantViolation(
                "Roster Lab credit range is inverted".to_owned(),
            ));
        }
        let course_ids = self
            .catalog
            .iter()
            .map(|course| course.course_id.as_str())
            .collect::<HashSet<_>>();
        if course_ids.len() != self.catalog.len() {
            return Err(DomainError::InvariantViolation(
                "Roster Lab course ids must be unique".to_owned(),
            ));
        }
        if self
            .pins
            .iter()
            .filter_map(|pin| pin.course_id.as_deref())
            .any(|course_id| !course_ids.contains(course_id))
        {
            return Err(DomainError::InvariantViolation(
                "Roster Lab pin references an unknown course".to_owned(),
            ));
        }
        if self.plans.len() < 3 {
            return Err(DomainError::InvariantViolation(
                "Roster Lab fixture must expose at least three candidate plans".to_owned(),
            ));
        }
        for plan in &self.plans {
            if plan.is_formal_enrollment {
                return Err(DomainError::InvariantViolation(
                    "Roster Lab fixture plan must not impersonate formal enrollment".to_owned(),
                ));
            }
            if !plan.hard_constraints_met {
                return Err(DomainError::InvariantViolation(
                    "declared feasible Roster Lab plan violates a hard constraint".to_owned(),
                ));
            }
            if !(self.credit_range.min..=self.credit_range.max).contains(&plan.total_credits) {
                return Err(DomainError::InvariantViolation(format!(
                    "Roster Lab plan {} falls outside the credit range",
                    plan.id
                )));
            }
            if plan
                .course_selections
                .iter()
                .any(|selection| !course_ids.contains(selection.course_id.as_str()))
            {
                return Err(DomainError::InvariantViolation(format!(
                    "Roster Lab plan {} references an unknown course",
                    plan.id
                )));
            }
        }
        if self.unsat.minimal_conflict_set.is_empty()
            || self.unsat.blocking_chain.is_empty()
            || self.unsat.relaxable_items.is_empty()
        {
            return Err(DomainError::InvariantViolation(
                "Roster Lab no-solution fixture needs conflicts, a blocking chain and relaxations"
                    .to_owned(),
            ));
        }
        Ok(())
    }

    fn course(&self, course_id: &str) -> Result<&RosterCourseSpec, DomainError> {
        self.catalog
            .iter()
            .find(|course| course.course_id == course_id)
            .ok_or_else(|| {
                DomainError::InvariantViolation(format!("unknown Roster Lab course: {course_id}"))
            })
    }
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
pub struct RosterTransactionAction {
    pub action_type: String,
    pub course_id: String,
    pub title: String,
    pub old_offering: Option<String>,
    pub new_offering: Option<String>,
    pub credit_change: i32,
    pub risk: Option<String>,
    pub formal_step: String,
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
pub struct RosterTransaction {
    pub id: String,
    pub from_prefix_id: String,
    pub to_plan_id: String,
    pub actions: Vec<RosterTransactionAction>,
    pub net_credit_change: i32,
    pub impact_summary: String,
    pub is_formal_submission: bool,
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
pub struct SemesterLock {
    pub schema_version: String,
    pub data_mode: String,
    pub id: String,
    pub student_id: String,
    pub semester: String,
    pub catalog_version: String,
    pub prefix_version: u32,
    pub pin_ids: Vec<String>,
    pub preferences: RosterPreferences,
    pub goal_order: Vec<String>,
    pub solver_backend: String,
    pub selected_plan_id: String,
    pub input_fingerprint: String,
    pub created_at: String,
    pub is_formal_enrollment: bool,
    pub source_boundary: String,
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
pub struct RosterSession {
    pub schema_version: String,
    pub data_mode: String,
    pub prefix: RosterPrefix,
    pub pins: Vec<RosterPin>,
    pub preferences: RosterPreferences,
    pub goal_order: Vec<String>,
    pub last_plans: Vec<SemesterPlan>,
    pub saved_locks: Vec<SemesterLock>,
}

impl RosterSession {
    #[must_use]
    pub fn from_fixture(fixture: &RosterFixture) -> Self {
        Self {
            schema_version: SCHEMA_VERSION.to_owned(),
            data_mode: "fixture".to_owned(),
            prefix: fixture.prefix.clone(),
            pins: fixture.pins.clone(),
            preferences: fixture.preferences.clone(),
            goal_order: fixture.goal_order.clone(),
            last_plans: Vec::new(),
            saved_locks: Vec::new(),
        }
    }

    pub fn update_prefix(
        &mut self,
        fixture: &RosterFixture,
        prefix: RosterPrefix,
    ) -> Result<RosterPrefix, DomainError> {
        if prefix.student_id != fixture.student_id {
            return Err(DomainError::InvariantViolation(
                "Roster Lab prefix belongs to a different fixture student".to_owned(),
            ));
        }
        if prefix.version < self.prefix.version {
            return Err(DomainError::InvariantViolation(
                "Roster Lab prefix version cannot move backwards".to_owned(),
            ));
        }
        self.prefix = prefix.clone();
        self.last_plans.clear();
        Ok(prefix)
    }

    pub fn update_pins(
        &mut self,
        fixture: &RosterFixture,
        active_pin_ids: &[String],
    ) -> Result<Vec<RosterPin>, DomainError> {
        if !active_pin_ids
            .iter()
            .any(|pin_id| pin_id == "pin-sls-section")
        {
            return Err(DomainError::InvariantViolation(
                "the SLS201 anchor pin cannot be removed in this fixture".to_owned(),
            ));
        }
        if active_pin_ids
            .iter()
            .any(|pin_id| !fixture.pins.iter().any(|pin| &pin.id == pin_id))
        {
            return Err(DomainError::InvariantViolation(
                "Roster Lab request references an unknown pin".to_owned(),
            ));
        }
        for pin in &mut self.pins {
            pin.active = active_pin_ids.contains(&pin.id);
        }
        self.last_plans.clear();
        Ok(self.pins.clone())
    }

    pub fn solve(
        &mut self,
        fixture: &RosterFixture,
        goal_order: Option<Vec<String>>,
        preferences: Option<RosterPreferences>,
    ) -> Result<Vec<SemesterPlan>, DomainError> {
        if let Some(goal_order) = goal_order {
            if goal_order.len() != fixture.goal_order.len()
                || goal_order.iter().collect::<HashSet<_>>().len() != fixture.goal_order.len()
            {
                return Err(DomainError::InvariantViolation(
                    "Roster Lab goal order must contain each declared goal exactly once".to_owned(),
                ));
            }
            self.goal_order = goal_order;
        }
        if let Some(preferences) = preferences {
            if preferences.compactness > 3 || preferences.variety > 3 || preferences.stability > 3 {
                return Err(DomainError::InvariantViolation(
                    "Roster Lab preference priorities must be between 0 and 3".to_owned(),
                ));
            }
            self.preferences = preferences;
        }

        let active_course_pins = self
            .pins
            .iter()
            .filter(|pin| pin.active)
            .filter_map(|pin| pin.course_id.as_deref())
            .collect::<Vec<_>>();
        let mut plans = fixture
            .plans
            .iter()
            .filter(|plan| {
                active_course_pins.iter().all(|course_id| {
                    plan.course_selections
                        .iter()
                        .any(|selection| &selection.course_id == course_id)
                })
            })
            .cloned()
            .collect::<Vec<_>>();
        if self.preferences.time_of_day == "late" {
            plans.sort_by_key(|plan| {
                if plan.id.contains("late") {
                    0
                } else if plan.id.contains("explore") {
                    1
                } else {
                    2
                }
            });
        } else {
            plans.sort_by(|left, right| {
                right
                    .preference_score
                    .cmp(&left.preference_score)
                    .then_with(|| left.migration_cost.cmp(&right.migration_cost))
                    .then_with(|| left.id.cmp(&right.id))
            });
        }
        if plans.len() < 2 {
            return Err(DomainError::InvariantViolation(
                "no two feasible plans remain; inspect the unsatisfiable explanation".to_owned(),
            ));
        }
        self.last_plans.clone_from(&plans);
        Ok(plans)
    }

    pub fn what_if(
        &mut self,
        fixture: &RosterFixture,
        branch_name: &str,
    ) -> Result<Vec<SemesterPlan>, DomainError> {
        require_non_empty("branch_name", branch_name)?;
        let base = self.solve(fixture, None, None)?;
        let plans = base
            .into_iter()
            .take(3)
            .map(|mut plan| {
                plan.id = format!("{}-what-if", plan.id);
                plan.label = plan.label.replacen("方案", "模拟方案", 1);
                plan.strategy = format!("{} What-if：{branch_name}。", plan.strategy);
                plan.is_simulation = true;
                plan.input_fingerprint = format!("{}-what-if", plan.input_fingerprint);
                plan
            })
            .collect::<Vec<_>>();
        self.last_plans.clone_from(&plans);
        Ok(plans)
    }

    pub fn transaction(
        &self,
        fixture: &RosterFixture,
        plan_id: &str,
    ) -> Result<RosterTransaction, DomainError> {
        let plan = self
            .last_plans
            .iter()
            .chain(fixture.plans.iter())
            .find(|plan| plan.id == plan_id)
            .ok_or_else(|| {
                DomainError::InvariantViolation(format!("unknown Roster Lab plan: {plan_id}"))
            })?;
        let mut actions = Vec::new();
        for selection in &plan.course_selections {
            let course = fixture.course(&selection.course_id)?;
            if let Some(current) = fixture
                .prefix
                .planned
                .iter()
                .find(|current| current.course_id == selection.course_id)
            {
                if current.offering_id != selection.offering_id {
                    actions.push(RosterTransactionAction {
                        action_type: "swap".to_owned(),
                        course_id: course.course_id.clone(),
                        title: course.title.clone(),
                        old_offering: Some(current.offering_id.clone()),
                        new_offering: Some(selection.offering_id.clone()),
                        credit_change: 0,
                        risk: Some("换班会受实时余量影响；演示方案不会替你占住名额".to_owned()),
                        formal_step: "在学校正式系统确认目标班次后由本人办理".to_owned(),
                    });
                }
            } else {
                actions.push(RosterTransactionAction {
                    action_type: "add".to_owned(),
                    course_id: course.course_id.clone(),
                    title: course.title.clone(),
                    old_offering: None,
                    new_offering: Some(selection.offering_id.clone()),
                    credit_change: i32::try_from(course.credits).unwrap_or(i32::MAX),
                    risk: None,
                    formal_step: "在学校正式系统核对资格、容量和窗口后由本人提交".to_owned(),
                });
            }
        }
        for current in &fixture.prefix.planned {
            if !plan
                .course_selections
                .iter()
                .any(|selection| selection.course_id == current.course_id)
            {
                let course = fixture.course(&current.course_id)?;
                actions.push(RosterTransactionAction {
                    action_type: "drop".to_owned(),
                    course_id: course.course_id.clone(),
                    title: course.title.clone(),
                    old_offering: Some(current.offering_id.clone()),
                    new_offering: None,
                    credit_change: -i32::try_from(course.credits).unwrap_or(i32::MAX),
                    risk: Some(
                        "退课可能影响先修、学费或培养方案；提交前请查看学校正式规则".to_owned(),
                    ),
                    formal_step: "查看正式退课截止和影响后由本人办理".to_owned(),
                });
            }
        }
        let baseline_credits = fixture
            .prefix
            .planned
            .iter()
            .map(|item| fixture.course(&item.course_id).map(|course| course.credits))
            .collect::<Result<Vec<_>, _>>()?
            .into_iter()
            .sum::<u32>();
        Ok(RosterTransaction {
            id: format!("tx-{plan_id}"),
            from_prefix_id: fixture.prefix.id.clone(),
            to_plan_id: plan_id.to_owned(),
            actions,
            net_credit_change: i32::try_from(plan.total_credits).unwrap_or(i32::MAX)
                - i32::try_from(baseline_credits).unwrap_or(i32::MAX),
            impact_summary: "这是规划差异预览；当前没有执行、占座或提交任何正式选课动作".to_owned(),
            is_formal_submission: false,
        })
    }

    pub fn save_lock(
        &mut self,
        fixture: &RosterFixture,
        plan_id: &str,
    ) -> Result<SemesterLock, DomainError> {
        let plan = self
            .last_plans
            .iter()
            .chain(fixture.plans.iter())
            .find(|plan| plan.id == plan_id)
            .ok_or_else(|| {
                DomainError::InvariantViolation(format!("unknown Roster Lab plan: {plan_id}"))
            })?;
        let lock = SemesterLock {
            schema_version: SCHEMA_VERSION.to_owned(),
            data_mode: "fixture".to_owned(),
            id: format!("semester-lock-{}", plan.input_fingerprint),
            student_id: fixture.student_id.clone(),
            semester: fixture.semester.clone(),
            catalog_version: fixture.catalog_version.clone(),
            prefix_version: self.prefix.version,
            pin_ids: self
                .pins
                .iter()
                .filter(|pin| pin.active)
                .map(|pin| pin.id.clone())
                .collect(),
            preferences: self.preferences.clone(),
            goal_order: self.goal_order.clone(),
            solver_backend: plan.solver_backend.clone(),
            selected_plan_id: plan.id.clone(),
            input_fingerprint: plan.input_fingerprint.clone(),
            created_at: "2026-07-24T15:30:00+08:00".to_owned(),
            is_formal_enrollment: false,
            source_boundary: fixture.source_boundary.clone(),
        };
        self.saved_locks.push(lock.clone());
        Ok(lock)
    }
}

#[derive(Clone, Copy, Debug, Eq, Hash, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum MirrorAuthorityLevel {
    Authoritative,
    OfficialReference,
    AuthorizedMirror,
    SelfDeclared,
    ModelInferred,
    DemoFixture,
}

impl MirrorAuthorityLevel {
    #[must_use]
    pub fn high_risk_eligible(self) -> bool {
        matches!(
            self,
            Self::Authoritative | Self::OfficialReference | Self::AuthorizedMirror
        )
    }
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
#[serde(untagged)]
pub enum MirrorValue {
    Text(String),
    Integer(i64),
    Boolean(bool),
    TextList(Vec<String>),
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
pub struct MirrorAuthorityDefinition {
    pub level: MirrorAuthorityLevel,
    pub title: String,
    pub description: String,
    pub high_risk_eligible: bool,
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
pub struct MirrorDataSource {
    pub id: String,
    pub name: String,
    pub system_type: String,
    pub adapter_kind: String,
    pub responsible_party: String,
    pub auth_method: String,
    pub field_scope: Vec<String>,
    pub refresh_method: String,
    pub retention_days: u32,
    pub correction_route: String,
    pub consent_required: bool,
    pub status: String,
    pub authorized: bool,
    pub declared_authority: MirrorAuthorityLevel,
    pub last_synced_at: Option<String>,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
pub struct MirrorRawSnapshot {
    pub id: String,
    pub data_source_id: String,
    pub external_id: String,
    pub source_version: String,
    pub fetched_at: String,
    pub content_hash: String,
    pub raw_reference: String,
    pub format: String,
    pub size_bytes: u64,
    pub immutable: bool,
    pub demo_fixture: bool,
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
pub struct MirrorProvenance {
    pub source_system: String,
    pub data_source_id: String,
    pub external_field: String,
    pub source_version: String,
    pub fetched_at: String,
    pub declared_authority: MirrorAuthorityLevel,
    pub effective_authority: MirrorAuthorityLevel,
    pub conversion_rule: String,
    pub raw_snapshot_id: String,
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
pub struct MirrorNormalizedField {
    pub value: MirrorValue,
    pub provenance: MirrorProvenance,
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
pub struct MirrorNormalizedRecord {
    pub id: String,
    pub snapshot_ids: Vec<String>,
    pub entity_type: String,
    pub entity_id: String,
    pub label: String,
    pub student_id: String,
    pub fields: BTreeMap<String, MirrorNormalizedField>,
    pub effective_at: String,
    pub expires_at: Option<String>,
    pub consent_basis: String,
    pub correction_route: String,
    pub removable: bool,
    pub demo_fixture: bool,
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
pub struct MirrorConflictOption {
    pub id: String,
    pub source_system: String,
    pub data_source_id: String,
    pub value: MirrorValue,
    pub declared_authority: MirrorAuthorityLevel,
    pub fetched_at: String,
    pub raw_snapshot_id: String,
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
pub struct MirrorConflictResolution {
    pub chosen_option_id: String,
    pub chosen_value: MirrorValue,
    pub chosen_source: String,
    pub reason: String,
    pub resolved_by: String,
    pub resolved_at: String,
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
pub struct MirrorConflictRecord {
    pub id: String,
    pub entity_id: String,
    pub entity_label: String,
    pub field_name: String,
    pub options: Vec<MirrorConflictOption>,
    pub status: String,
    pub resolution: Option<MirrorConflictResolution>,
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
pub struct MirrorConsentRecord {
    pub id: String,
    pub student_id: String,
    pub data_source_id: String,
    pub allowed_modules: Vec<String>,
    pub purpose: String,
    pub granted_at: String,
    pub expires_at: Option<String>,
    pub revoked_at: Option<String>,
    pub scope: String,
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
pub struct MirrorAuditEvent {
    pub id: String,
    pub sequence: u64,
    pub action: String,
    pub actor_id: String,
    pub target_entity: String,
    pub timestamp: String,
    pub detail: String,
    pub previous_event_hash: Option<String>,
    pub event_hash: String,
    pub append_only: bool,
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
pub struct AcademicMirrorFixture {
    pub schema_version: String,
    pub data_mode: String,
    pub student_id: String,
    pub reference_time: String,
    pub source_boundary: String,
    pub read_only: bool,
    pub authority_catalog: Vec<MirrorAuthorityDefinition>,
    pub sources: Vec<MirrorDataSource>,
    pub snapshots: Vec<MirrorRawSnapshot>,
    pub records: Vec<MirrorNormalizedRecord>,
    pub conflicts: Vec<MirrorConflictRecord>,
    pub consents: Vec<MirrorConsentRecord>,
    pub audit: Vec<MirrorAuditEvent>,
}

impl AcademicMirrorFixture {
    pub fn validate(&self) -> Result<(), DomainError> {
        require_supported_schema(&self.schema_version)?;
        if self.data_mode != "fixture" || !self.read_only {
            return Err(DomainError::InvariantViolation(
                "Academic Mirror public demo must remain fixture and read-only".to_owned(),
            ));
        }
        if self.sources.len() < 2 {
            return Err(DomainError::InvariantViolation(
                "Academic Mirror requires at least two sources".to_owned(),
            ));
        }
        let adapters = self
            .sources
            .iter()
            .map(|source| source.adapter_kind.as_str())
            .collect::<HashSet<_>>();
        if !adapters.contains("demo_fixture") || !adapters.contains("file_import") {
            return Err(DomainError::InvariantViolation(
                "Academic Mirror requires DemoFixtureAdapter and FileImportAdapter".to_owned(),
            ));
        }
        let source_ids = self
            .sources
            .iter()
            .map(|source| source.id.as_str())
            .collect::<HashSet<_>>();
        if source_ids.len() != self.sources.len() {
            return Err(DomainError::InvariantViolation(
                "Academic Mirror source ids must be unique".to_owned(),
            ));
        }
        let snapshot_ids = self
            .snapshots
            .iter()
            .map(|snapshot| snapshot.id.as_str())
            .collect::<HashSet<_>>();
        if snapshot_ids.len() != self.snapshots.len() {
            return Err(DomainError::InvariantViolation(
                "Academic Mirror snapshot ids must be unique".to_owned(),
            ));
        }
        for snapshot in &self.snapshots {
            if !source_ids.contains(snapshot.data_source_id.as_str()) {
                return Err(DomainError::InvariantViolation(format!(
                    "Academic Mirror snapshot {} references an unknown source",
                    snapshot.id
                )));
            }
            if !snapshot.immutable
                || !snapshot.demo_fixture
                || !snapshot.content_hash.starts_with("sha256:")
                || snapshot.content_hash.len() != 71
            {
                return Err(DomainError::InvariantViolation(format!(
                    "Academic Mirror snapshot {} lacks an immutable SHA-256 fixture receipt",
                    snapshot.id
                )));
            }
        }
        let mut used_authorities = HashSet::new();
        for record in &self.records {
            if !record.demo_fixture {
                return Err(DomainError::InvariantViolation(format!(
                    "Academic Mirror record {} escaped the fixture boundary",
                    record.id
                )));
            }
            for field in record.fields.values() {
                used_authorities.insert(field.provenance.declared_authority);
                if field.provenance.effective_authority != MirrorAuthorityLevel::DemoFixture {
                    return Err(DomainError::InvariantViolation(format!(
                        "Academic Mirror record {} has non-fixture effective authority",
                        record.id
                    )));
                }
                if !source_ids.contains(field.provenance.data_source_id.as_str())
                    || !snapshot_ids.contains(field.provenance.raw_snapshot_id.as_str())
                {
                    return Err(DomainError::InvariantViolation(format!(
                        "Academic Mirror record {} has broken field provenance",
                        record.id
                    )));
                }
            }
        }
        if used_authorities.len() != 6 || self.authority_catalog.len() != 6 {
            return Err(DomainError::InvariantViolation(
                "Academic Mirror fixture must exercise all six authority classes".to_owned(),
            ));
        }
        for conflict in &self.conflicts {
            if conflict.options.len() < 2 {
                return Err(DomainError::InvariantViolation(format!(
                    "Academic Mirror conflict {} lacks competing values",
                    conflict.id
                )));
            }
            if conflict.status == "resolved" && conflict.resolution.is_none() {
                return Err(DomainError::InvariantViolation(format!(
                    "Academic Mirror conflict {} lacks a resolution receipt",
                    conflict.id
                )));
            }
        }
        for (index, event) in self.audit.iter().enumerate() {
            if !event.append_only {
                return Err(DomainError::InvariantViolation(format!(
                    "Academic Mirror audit event {} is not append-only",
                    event.id
                )));
            }
            if index == 0 && event.previous_event_hash.is_some() {
                return Err(DomainError::InvariantViolation(
                    "Academic Mirror audit genesis must not have a predecessor".to_owned(),
                ));
            }
            if index > 0
                && event.previous_event_hash.as_deref()
                    != self
                        .audit
                        .get(index - 1)
                        .map(|previous| previous.event_hash.as_str())
            {
                return Err(DomainError::InvariantViolation(format!(
                    "Academic Mirror audit chain breaks at {}",
                    event.id
                )));
            }
        }
        Ok(())
    }
}

pub trait MirrorDataSourceAdapter {
    fn kind(&self) -> &'static str;
    fn supports_incremental(&self) -> bool;
    fn fetch(
        &self,
        source: &MirrorDataSource,
        previous: &MirrorRawSnapshot,
        next_index: usize,
        fetched_at: String,
    ) -> Result<MirrorRawSnapshot, DomainError>;
}

#[derive(Debug, Default)]
pub struct DemoFixtureAdapter;

impl MirrorDataSourceAdapter for DemoFixtureAdapter {
    fn kind(&self) -> &'static str {
        "demo_fixture"
    }

    fn supports_incremental(&self) -> bool {
        false
    }

    fn fetch(
        &self,
        source: &MirrorDataSource,
        previous: &MirrorRawSnapshot,
        next_index: usize,
        fetched_at: String,
    ) -> Result<MirrorRawSnapshot, DomainError> {
        build_mirror_snapshot(self.kind(), source, previous, next_index, fetched_at)
    }
}

#[derive(Debug, Default)]
pub struct FileImportAdapter;

impl MirrorDataSourceAdapter for FileImportAdapter {
    fn kind(&self) -> &'static str {
        "file_import"
    }

    fn supports_incremental(&self) -> bool {
        false
    }

    fn fetch(
        &self,
        source: &MirrorDataSource,
        previous: &MirrorRawSnapshot,
        next_index: usize,
        fetched_at: String,
    ) -> Result<MirrorRawSnapshot, DomainError> {
        build_mirror_snapshot(self.kind(), source, previous, next_index, fetched_at)
    }
}

fn build_mirror_snapshot(
    adapter_kind: &str,
    source: &MirrorDataSource,
    previous: &MirrorRawSnapshot,
    next_index: usize,
    fetched_at: String,
) -> Result<MirrorRawSnapshot, DomainError> {
    if source.adapter_kind != adapter_kind {
        return Err(DomainError::InvariantViolation(format!(
            "source {} cannot be fetched by {adapter_kind}",
            source.id
        )));
    }
    if !source.authorized || source.status != "active" {
        return Err(DomainError::InvariantViolation(format!(
            "source {} is not authorized and active",
            source.id
        )));
    }
    Ok(MirrorRawSnapshot {
        id: format!(
            "snap-{}-{next_index:03}",
            source.id.trim_start_matches("ds-")
        ),
        data_source_id: source.id.clone(),
        external_id: previous.external_id.clone(),
        source_version: format!("{}-sync-{next_index}", previous.source_version),
        fetched_at,
        content_hash: previous.content_hash.clone(),
        raw_reference: format!("fixture://academic-mirror/{}/sync-{next_index}", source.id),
        format: previous.format.clone(),
        size_bytes: previous.size_bytes,
        immutable: true,
        demo_fixture: true,
    })
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
pub struct AcademicMirrorSession {
    pub schema_version: String,
    pub data_mode: String,
    pub read_only: bool,
    pub sources: Vec<MirrorDataSource>,
    pub snapshots: Vec<MirrorRawSnapshot>,
    pub records: Vec<MirrorNormalizedRecord>,
    pub conflicts: Vec<MirrorConflictRecord>,
    pub consents: Vec<MirrorConsentRecord>,
    pub audit: Vec<MirrorAuditEvent>,
}

impl AcademicMirrorSession {
    #[must_use]
    pub fn from_fixture(fixture: &AcademicMirrorFixture) -> Self {
        Self {
            schema_version: SCHEMA_VERSION.to_owned(),
            data_mode: "fixture".to_owned(),
            read_only: true,
            sources: fixture.sources.clone(),
            snapshots: fixture.snapshots.clone(),
            records: fixture.records.clone(),
            conflicts: fixture.conflicts.clone(),
            consents: fixture.consents.clone(),
            audit: fixture.audit.clone(),
        }
    }

    pub fn register_source(
        &mut self,
        source: MirrorDataSource,
    ) -> Result<MirrorDataSource, DomainError> {
        require_non_empty("source name", &source.name)?;
        require_non_empty("responsible party", &source.responsible_party)?;
        require_non_empty("correction route", &source.correction_route)?;
        if source.field_scope.is_empty() || self.sources.iter().any(|item| item.id == source.id) {
            return Err(DomainError::InvariantViolation(
                "Academic Mirror source needs fields and a unique id".to_owned(),
            ));
        }
        self.sources.push(source.clone());
        self.append_audit(
            "source_register",
            &format!("source:{}", source.id),
            "registered a local authorized source without credentials",
        );
        Ok(source)
    }

    pub fn sync_source(&mut self, source_id: &str) -> Result<MirrorRawSnapshot, DomainError> {
        let source_index = self
            .sources
            .iter()
            .position(|source| source.id == source_id)
            .ok_or_else(|| {
                DomainError::InvariantViolation(format!(
                    "Academic Mirror source not found: {source_id}"
                ))
            })?;
        let source = self.sources[source_index].clone();
        let matching_count = self
            .snapshots
            .iter()
            .filter(|snapshot| snapshot.data_source_id == source_id)
            .count();
        let previous = self
            .snapshots
            .iter()
            .rev()
            .find(|snapshot| snapshot.data_source_id == source_id)
            .cloned()
            .ok_or_else(|| {
                DomainError::InvariantViolation(
                    "new file source has no selected local payload".to_owned(),
                )
            })?;
        let fetched_at = self.next_timestamp();
        let next_index = matching_count + 1;
        let next = match source.adapter_kind.as_str() {
            "demo_fixture" => {
                DemoFixtureAdapter.fetch(&source, &previous, next_index, fetched_at.clone())?
            }
            "file_import" => {
                FileImportAdapter.fetch(&source, &previous, next_index, fetched_at.clone())?
            }
            adapter => {
                return Err(DomainError::InvariantViolation(format!(
                    "unsupported Academic Mirror adapter: {adapter}"
                )));
            }
        };
        self.sources[source_index].last_synced_at = Some(fetched_at.clone());
        self.sources[source_index].updated_at = fetched_at;
        self.snapshots.push(next.clone());
        self.append_audit(
            "sync",
            &format!("source:{source_id}"),
            &format!("appended immutable snapshot {}", next.id),
        );
        self.append_audit(
            "map",
            &format!("snapshot:{}", next.id),
            "mapped stable fields and retained unknown extensions",
        );
        Ok(next)
    }

    pub fn resolve_conflict(
        &mut self,
        conflict_id: &str,
        option_id: &str,
        reason: &str,
    ) -> Result<MirrorConflictRecord, DomainError> {
        require_non_empty("conflict resolution reason", reason)?;
        let index = self
            .conflicts
            .iter()
            .position(|conflict| conflict.id == conflict_id)
            .ok_or_else(|| {
                DomainError::InvariantViolation(format!(
                    "Academic Mirror conflict not found: {conflict_id}"
                ))
            })?;
        if self.conflicts[index].status == "resolved" {
            return Err(DomainError::InvariantViolation(
                "Academic Mirror conflict is already resolved".to_owned(),
            ));
        }
        let option = self.conflicts[index]
            .options
            .iter()
            .find(|option| option.id == option_id)
            .cloned()
            .ok_or_else(|| {
                DomainError::InvariantViolation(
                    "Academic Mirror conflict option not found".to_owned(),
                )
            })?;
        self.conflicts[index].status = "resolved".to_owned();
        self.conflicts[index].resolution = Some(MirrorConflictResolution {
            chosen_option_id: option.id,
            chosen_value: option.value,
            chosen_source: option.source_system,
            reason: reason.trim().to_owned(),
            resolved_by: "student-nan-fixture".to_owned(),
            resolved_at: self.next_timestamp(),
        });
        let resolved = self.conflicts[index].clone();
        self.append_audit(
            "conflict_resolve",
            &format!("conflict:{conflict_id}"),
            reason.trim(),
        );
        Ok(resolved)
    }

    pub fn upsert_consent(
        &mut self,
        consent: MirrorConsentRecord,
    ) -> Result<MirrorConsentRecord, DomainError> {
        if !self
            .sources
            .iter()
            .any(|source| source.id == consent.data_source_id)
        {
            return Err(DomainError::InvariantViolation(
                "Academic Mirror consent references an unknown source".to_owned(),
            ));
        }
        if consent.allowed_modules.is_empty() {
            return Err(DomainError::InvariantViolation(
                "Academic Mirror consent needs at least one purpose-bound module".to_owned(),
            ));
        }
        let action = if consent.revoked_at.is_some() {
            "consent_revoke"
        } else {
            "consent_grant"
        };
        if let Some(index) = self.consents.iter().position(|item| item.id == consent.id) {
            self.consents[index] = consent.clone();
        } else {
            self.consents.push(consent.clone());
        }
        self.append_audit(
            action,
            &format!("consent:{}", consent.id),
            &format!("scope {}", consent.scope),
        );
        Ok(consent)
    }

    pub fn request_correction(&mut self, record_id: &str, reason: &str) -> Result<(), DomainError> {
        require_non_empty("correction reason", reason)?;
        if !self.records.iter().any(|record| record.id == record_id) {
            return Err(DomainError::InvariantViolation(
                "Academic Mirror record not found".to_owned(),
            ));
        }
        self.append_audit(
            "correction_request",
            &format!("record:{record_id}"),
            reason.trim(),
        );
        Ok(())
    }

    pub fn delete_non_authoritative_copy(&mut self, record_id: &str) -> Result<(), DomainError> {
        let record = self
            .records
            .iter()
            .find(|record| record.id == record_id)
            .cloned()
            .ok_or_else(|| {
                DomainError::InvariantViolation("Academic Mirror record not found".to_owned())
            })?;
        if !record.removable {
            return Err(DomainError::InvariantViolation(
                "authoritative or official mirror copy cannot be deleted in the experience layer"
                    .to_owned(),
            ));
        }
        self.records.retain(|item| item.id != record_id);
        self.append_audit(
            "delete",
            &format!("record:{record_id}"),
            "deleted a removable non-authoritative mirror copy",
        );
        Ok(())
    }

    pub fn record_export(&mut self, archive_type: &str) -> Result<(), DomainError> {
        require_non_empty("archive_type", archive_type)?;
        self.append_audit(
            "export",
            "student:student-nan-fixture",
            &format!("exported {archive_type} with non-authoritative fixture boundary"),
        );
        Ok(())
    }

    fn append_audit(&mut self, action: &str, target_entity: &str, detail: &str) {
        let previous = self.audit.last();
        let sequence = previous.map_or(1, |event| event.sequence + 1);
        let previous_event_hash = previous.map(|event| event.event_hash.clone());
        self.audit.push(MirrorAuditEvent {
            id: format!("aud-{sequence:03}"),
            sequence,
            action: action.to_owned(),
            actor_id: "student-nan-fixture".to_owned(),
            target_entity: target_entity.to_owned(),
            timestamp: self.next_timestamp(),
            detail: detail.to_owned(),
            previous_event_hash,
            event_hash: format!("fnv1a-aud-{sequence:03}"),
            append_only: true,
        });
    }

    fn next_timestamp(&self) -> String {
        let minute = (self.audit.len() + 1) % 60;
        format!("2026-07-24T18:{minute:02}:00+08:00")
    }
}

#[derive(Clone, Copy, Debug, Eq, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum ExamStatus {
    Scheduled,
    BriefingOpen,
    Warmup,
    ExamActive,
    Review,
    Archived,
}

impl ExamStatus {
    #[must_use]
    pub fn can_transition_to(self, next: Self) -> bool {
        matches!(
            (self, next),
            (Self::Scheduled, Self::BriefingOpen)
                | (Self::BriefingOpen, Self::Warmup)
                | (Self::Warmup, Self::ExamActive)
                | (Self::ExamActive, Self::Review)
                | (Self::Review, Self::Archived)
        ) || self == next
    }
}

impl Display for ExamStatus {
    fn fmt(&self, formatter: &mut Formatter<'_>) -> std::fmt::Result {
        formatter.write_str(match self {
            Self::Scheduled => "scheduled",
            Self::BriefingOpen => "briefing_open",
            Self::Warmup => "warmup",
            Self::ExamActive => "exam_active",
            Self::Review => "review",
            Self::Archived => "archived",
        })
    }
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
pub struct ExamSourceLink {
    pub source_id: String,
    pub locator: String,
    pub coverage: String,
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
pub struct ExamEvent {
    pub id: String,
    pub course_id: String,
    pub title: String,
    pub event_type: String,
    pub scheduled_at: String,
    pub duration_minutes: u32,
    pub status: ExamStatus,
    pub is_formal: bool,
    pub source_authority: String,
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
pub struct ExamReadiness {
    pub coverage_pct: u32,
    pub weak_areas: Vec<String>,
    pub unknown_areas: Vec<String>,
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
pub struct PreGameBriefing {
    pub scope_summary: String,
    pub sources: Vec<ExamSourceLink>,
    pub competency_targets: Vec<String>,
    pub available_resources: Vec<String>,
    pub readiness: ExamReadiness,
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
pub struct ExamOption {
    pub id: String,
    pub label: String,
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
pub struct WarmupQuestion {
    pub id: String,
    pub object_id: String,
    pub prompt: String,
    pub options: Vec<ExamOption>,
    pub correct_answer: String,
    pub explanation: String,
    pub source_ids: Vec<String>,
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
pub struct ReviewPlaybookItem {
    pub id: String,
    pub object_id: String,
    pub title: String,
    pub estimated_minutes: u32,
    pub source_ids: Vec<String>,
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
pub struct ReviewPlaybookSection {
    pub id: String,
    pub title: String,
    pub knowledge_points: Vec<String>,
    pub items: Vec<ReviewPlaybookItem>,
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
pub struct AiEvidenceClaim {
    pub id: String,
    pub claim: String,
    pub source_id: String,
    pub confidence: String,
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
pub struct MatchQuestion {
    pub id: String,
    pub object_id: String,
    pub prompt: String,
    pub response_type: String,
    pub options: Vec<ExamOption>,
    pub correct_answer: String,
    pub source_ids: Vec<String>,
    #[serde(default)]
    pub ai_trace: Vec<AiEvidenceClaim>,
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
pub struct WorldExamFixture {
    pub schema_version: String,
    pub data_mode: String,
    pub student_id: String,
    pub course_id: String,
    pub source_boundary: String,
    pub event: ExamEvent,
    pub briefing: PreGameBriefing,
    pub warmup: WarmupQuestion,
    pub playbook: Vec<ReviewPlaybookSection>,
    pub match_questions: Vec<MatchQuestion>,
}

impl WorldExamFixture {
    pub fn validate(&self) -> Result<(), DomainError> {
        require_supported_schema(&self.schema_version)?;
        if self.data_mode != "fixture" {
            return Err(DomainError::InvariantViolation(
                "public World Exam demo must remain data_mode=fixture".to_owned(),
            ));
        }
        if self.event.is_formal {
            return Err(DomainError::InvariantViolation(
                "public World Exam demo must not impersonate a formal exam".to_owned(),
            ));
        }
        if self.event.course_id != self.course_id {
            return Err(DomainError::InvariantViolation(
                "exam event course_id must match the fixture course_id".to_owned(),
            ));
        }
        if self.briefing.readiness.coverage_pct > 100 {
            return Err(DomainError::InvariantViolation(
                "readiness coverage_pct must be between 0 and 100".to_owned(),
            ));
        }
        if self.match_questions.is_empty() {
            return Err(DomainError::InvariantViolation(
                "World Exam fixture needs at least one Key Match question".to_owned(),
            ));
        }

        let declared_sources = self
            .briefing
            .sources
            .iter()
            .map(|source| source.source_id.as_str())
            .collect::<HashSet<_>>();
        let mut linked_sources = self.warmup.source_ids.iter().collect::<Vec<_>>();
        linked_sources.extend(
            self.playbook
                .iter()
                .flat_map(|section| section.items.iter())
                .flat_map(|item| item.source_ids.iter()),
        );
        linked_sources.extend(
            self.match_questions
                .iter()
                .flat_map(|question| question.source_ids.iter()),
        );
        linked_sources.extend(
            self.match_questions
                .iter()
                .flat_map(|question| question.ai_trace.iter())
                .map(|claim| &claim.source_id),
        );
        if let Some(unknown) = linked_sources
            .into_iter()
            .find(|source_id| !declared_sources.contains(source_id.as_str()))
        {
            return Err(DomainError::InvariantViolation(format!(
                "World Exam content references undeclared F-001 source: {unknown}"
            )));
        }

        let mut object_ids = Vec::with_capacity(self.match_questions.len() + 1);
        object_ids.push(self.warmup.object_id.as_str());
        object_ids.extend(
            self.playbook
                .iter()
                .flat_map(|section| section.items.iter())
                .map(|item| item.object_id.as_str()),
        );
        object_ids.extend(
            self.match_questions
                .iter()
                .map(|question| question.object_id.as_str()),
        );
        if object_ids
            .iter()
            .any(|object_id| !object_id.starts_with("generated-sls-"))
        {
            return Err(DomainError::InvariantViolation(
                "World Exam content must reuse declared F-001 generated objects".to_owned(),
            ));
        }
        Ok(())
    }
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
pub struct WarmupAttempt {
    pub answer: String,
    pub correct: bool,
    pub source_ids: Vec<String>,
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
pub struct ExamCheckpoint {
    pub item_id: String,
    pub completed: bool,
    pub source_ids: Vec<String>,
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
pub struct ExamAnswerRecord {
    pub question_id: String,
    pub response: String,
    pub correct: bool,
    pub source_checked: bool,
    pub challenged_claim_ids: Vec<String>,
    pub error_category: Option<String>,
    pub source_ids: Vec<String>,
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
pub struct ExamTimelineEvent {
    pub id: String,
    pub event_type: String,
    pub label: String,
    pub source_ids: Vec<String>,
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
pub struct PostGameReflection {
    pub worked: String,
    pub blocked: String,
    pub next_adjustment: String,
    pub share_with_mentor: bool,
    pub share_expires_at: Option<String>,
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
pub struct WorldExamSession {
    pub schema_version: String,
    pub data_mode: String,
    pub event_id: String,
    pub student_id: String,
    pub status: ExamStatus,
    pub warmup_attempts: Vec<WarmupAttempt>,
    pub checkpoints: Vec<ExamCheckpoint>,
    pub answers: Vec<ExamAnswerRecord>,
    pub timeline: Vec<ExamTimelineEvent>,
    pub reflection: Option<PostGameReflection>,
    pub sync_status: String,
    pub pending_sync_count: u32,
}

impl WorldExamSession {
    #[must_use]
    pub fn from_fixture(fixture: &WorldExamFixture) -> Self {
        Self {
            schema_version: SCHEMA_VERSION.to_owned(),
            data_mode: "fixture".to_owned(),
            event_id: fixture.event.id.clone(),
            student_id: fixture.student_id.clone(),
            status: fixture.event.status,
            warmup_attempts: Vec::new(),
            checkpoints: Vec::new(),
            answers: Vec::new(),
            timeline: Vec::new(),
            reflection: None,
            sync_status: "synced".to_owned(),
            pending_sync_count: 0,
        }
    }

    fn transition(&mut self, next: ExamStatus) -> Result<(), DomainError> {
        if !self.status.can_transition_to(next) {
            return Err(DomainError::InvalidTransition {
                from: self.status.to_string(),
                action: format!("transition_to_{next}"),
            });
        }
        self.status = next;
        Ok(())
    }

    pub fn answer_warmup(
        &mut self,
        fixture: &WorldExamFixture,
        answer: String,
    ) -> Result<WarmupAttempt, DomainError> {
        if !matches!(self.status, ExamStatus::BriefingOpen | ExamStatus::Warmup) {
            return Err(DomainError::InvalidTransition {
                from: self.status.to_string(),
                action: "answer_warmup".to_owned(),
            });
        }
        if !fixture
            .warmup
            .options
            .iter()
            .any(|option| option.id == answer)
        {
            return Err(DomainError::InvariantViolation(
                "warm-up answer is not a declared option".to_owned(),
            ));
        }
        self.transition(ExamStatus::Warmup)?;
        let attempt = WarmupAttempt {
            correct: answer == fixture.warmup.correct_answer,
            answer,
            source_ids: fixture.warmup.source_ids.clone(),
        };
        self.warmup_attempts.push(attempt.clone());
        self.push_timeline(
            "warmup_answered",
            if attempt.correct {
                "低风险热身已命中"
            } else {
                "低风险热身待复核；可重试或跳过"
            },
            attempt.source_ids.clone(),
        );
        Ok(attempt)
    }

    pub fn skip_warmup(&mut self) -> Result<(), DomainError> {
        if !matches!(self.status, ExamStatus::BriefingOpen | ExamStatus::Warmup) {
            return Err(DomainError::InvalidTransition {
                from: self.status.to_string(),
                action: "skip_warmup".to_owned(),
            });
        }
        self.transition(ExamStatus::Warmup)?;
        self.push_timeline(
            "warmup_skipped",
            "低风险热身已跳过；复习资源仍保持完整可用",
            Vec::new(),
        );
        Ok(())
    }

    pub fn save_checkpoint(
        &mut self,
        fixture: &WorldExamFixture,
        item_id: String,
        completed: bool,
    ) -> Result<ExamCheckpoint, DomainError> {
        if !matches!(self.status, ExamStatus::BriefingOpen | ExamStatus::Warmup) {
            return Err(DomainError::InvalidTransition {
                from: self.status.to_string(),
                action: "save_checkpoint".to_owned(),
            });
        }
        let item = fixture
            .playbook
            .iter()
            .flat_map(|section| section.items.iter())
            .find(|item| item.id == item_id)
            .ok_or_else(|| {
                DomainError::InvariantViolation(format!("unknown review playbook item: {item_id}"))
            })?;
        let checkpoint = ExamCheckpoint {
            item_id,
            completed,
            source_ids: item.source_ids.clone(),
        };
        if let Some(existing) = self
            .checkpoints
            .iter_mut()
            .find(|candidate| candidate.item_id == checkpoint.item_id)
        {
            existing.clone_from(&checkpoint);
        } else {
            self.checkpoints.push(checkpoint.clone());
        }
        self.push_timeline(
            "checkpoint_saved",
            "私密复习检查点已保存",
            checkpoint.source_ids.clone(),
        );
        Ok(checkpoint)
    }

    pub fn submit_answer(
        &mut self,
        fixture: &WorldExamFixture,
        question_id: String,
        response: String,
        source_checked: bool,
        challenged_claim_ids: Vec<String>,
    ) -> Result<ExamAnswerRecord, DomainError> {
        if matches!(self.status, ExamStatus::Archived | ExamStatus::Review) {
            return Err(DomainError::InvalidTransition {
                from: self.status.to_string(),
                action: "submit_answer".to_owned(),
            });
        }
        if self.status == ExamStatus::BriefingOpen {
            self.transition(ExamStatus::Warmup)?;
        }
        if self.status == ExamStatus::Warmup {
            self.transition(ExamStatus::ExamActive)?;
        }
        let question = fixture
            .match_questions
            .iter()
            .find(|question| question.id == question_id)
            .ok_or_else(|| {
                DomainError::InvariantViolation(format!(
                    "unknown Key Match question: {question_id}"
                ))
            })?;
        if !question.options.iter().any(|option| option.id == response) {
            return Err(DomainError::InvariantViolation(
                "Key Match answer is not a declared option".to_owned(),
            ));
        }
        let declared_claim_ids = question
            .ai_trace
            .iter()
            .map(|claim| claim.id.as_str())
            .collect::<HashSet<_>>();
        if challenged_claim_ids
            .iter()
            .any(|claim_id| !declared_claim_ids.contains(claim_id.as_str()))
        {
            return Err(DomainError::InvariantViolation(
                "challenged AI claim is not declared for this question".to_owned(),
            ));
        }
        let correct = response == question.correct_answer;
        let answer = ExamAnswerRecord {
            question_id,
            response,
            correct,
            source_checked,
            challenged_claim_ids,
            error_category: (!correct).then_some("conceptual".to_owned()),
            source_ids: question.source_ids.clone(),
        };
        if let Some(existing) = self
            .answers
            .iter_mut()
            .find(|candidate| candidate.question_id == answer.question_id)
        {
            existing.clone_from(&answer);
        } else {
            self.answers.push(answer.clone());
        }
        self.push_timeline(
            "answer_submitted",
            if correct {
                "模拟题已提交：命中"
            } else {
                "模拟题已提交：待复盘"
            },
            answer.source_ids.clone(),
        );
        Ok(answer)
    }

    pub fn finish_match(&mut self, fixture: &WorldExamFixture) -> Result<(), DomainError> {
        if self.answers.len() != fixture.match_questions.len() {
            return Err(DomainError::InvariantViolation(
                "answer every Key Match question before finishing".to_owned(),
            ));
        }
        let unsupported_claim_ids = fixture
            .match_questions
            .iter()
            .flat_map(|question| question.ai_trace.iter())
            .filter(|claim| claim.confidence == "unsupported")
            .map(|claim| claim.id.as_str())
            .collect::<HashSet<_>>();
        let challenged_claim_ids = self
            .answers
            .iter()
            .flat_map(|answer| answer.challenged_claim_ids.iter())
            .map(String::as_str)
            .collect::<HashSet<_>>();
        if !unsupported_claim_ids.is_subset(&challenged_claim_ids) {
            return Err(DomainError::InvariantViolation(
                "challenge every unsupported AI claim before finishing".to_owned(),
            ));
        }
        self.transition(ExamStatus::Review)?;
        self.push_timeline(
            "match_finished",
            "模拟 Key Match 完成，进入私密 Replay 与 Box Score",
            fixture
                .match_questions
                .iter()
                .flat_map(|question| question.source_ids.clone())
                .collect(),
        );
        Ok(())
    }

    pub fn save_reflection(&mut self, reflection: PostGameReflection) -> Result<(), DomainError> {
        if self.status != ExamStatus::Review {
            return Err(DomainError::InvalidTransition {
                from: self.status.to_string(),
                action: "save_reflection".to_owned(),
            });
        }
        require_non_empty("worked", &reflection.worked)?;
        require_non_empty("blocked", &reflection.blocked)?;
        require_non_empty("next_adjustment", &reflection.next_adjustment)?;
        if reflection.share_with_mentor && reflection.share_expires_at.is_none() {
            return Err(DomainError::InvariantViolation(
                "mentor sharing requires an expiry date".to_owned(),
            ));
        }
        self.reflection = Some(reflection);
        self.push_timeline("reflection_saved", "私密赛后复盘已保存", Vec::new());
        Ok(())
    }

    pub fn archive(&mut self) -> Result<(), DomainError> {
        if self.reflection.is_none() {
            return Err(DomainError::InvariantViolation(
                "save a reflection before archiving".to_owned(),
            ));
        }
        self.transition(ExamStatus::Archived)?;
        self.push_timeline("archived", "模拟赛事已归档", Vec::new());
        Ok(())
    }

    fn push_timeline(&mut self, event_type: &str, label: &str, source_ids: Vec<String>) {
        self.timeline.push(ExamTimelineEvent {
            id: format!("exam-event-{:03}", self.timeline.len() + 1),
            event_type: event_type.to_owned(),
            label: label.to_owned(),
            source_ids,
        });
    }
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
pub struct ExamBoxScore {
    pub completion_pct: u32,
    pub correct_count: u32,
    pub total_questions: u32,
    pub sources_checked: u32,
    pub challenged_claims: u32,
    pub error_counts: ExamErrorCounts,
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
pub struct ExamErrorCounts {
    pub conceptual: u32,
    pub computational: u32,
    pub careless: u32,
    pub unknown: u32,
}

#[must_use]
pub fn build_exam_box_score(
    session: &WorldExamSession,
    fixture: &WorldExamFixture,
) -> ExamBoxScore {
    let total_questions = u32::try_from(fixture.match_questions.len()).unwrap_or(u32::MAX);
    let answered = u32::try_from(session.answers.len()).unwrap_or(u32::MAX);
    let correct_count = u32::try_from(
        session
            .answers
            .iter()
            .filter(|answer| answer.correct)
            .count(),
    )
    .unwrap_or(u32::MAX);
    let sources_checked = u32::try_from(
        session
            .answers
            .iter()
            .filter(|answer| answer.source_checked)
            .count(),
    )
    .unwrap_or(u32::MAX);
    let challenged_claims = u32::try_from(
        session
            .answers
            .iter()
            .flat_map(|answer| answer.challenged_claim_ids.iter())
            .collect::<HashSet<_>>()
            .len(),
    )
    .unwrap_or(u32::MAX);
    let conceptual = u32::try_from(
        session
            .answers
            .iter()
            .filter(|answer| answer.error_category.as_deref() == Some("conceptual"))
            .count(),
    )
    .unwrap_or(u32::MAX);
    ExamBoxScore {
        completion_pct: answered
            .saturating_mul(100)
            .checked_div(total_questions)
            .unwrap_or(0),
        correct_count,
        total_questions,
        sources_checked,
        challenged_claims,
        error_counts: ExamErrorCounts {
            conceptual,
            computational: 0,
            careless: 0,
            unknown: 0,
        },
    }
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
pub struct PerformanceMetricDefinition {
    pub id: String,
    pub label: String,
    pub unit: String,
    pub definition: String,
    pub purpose: String,
    pub limitation: String,
    pub correction_route: String,
    pub version: String,
    pub source_types: Vec<String>,
    pub can_correct: bool,
    pub comparison_mode: String,
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
pub struct PerformanceTrendPoint {
    pub period: String,
    pub label: String,
    pub value: Option<f64>,
    pub status: String,
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
pub struct PerformanceObservation {
    pub id: String,
    pub metric_id: String,
    pub value: Option<f64>,
    pub display_value: String,
    pub range_label: String,
    pub period_start: String,
    pub period_end: String,
    pub updated_at: String,
    pub expires_at: Option<String>,
    pub source_ids: Vec<String>,
    pub confidence: String,
    pub confidence_reason: String,
    pub data_gaps: Vec<String>,
    pub trend: Vec<PerformanceTrendPoint>,
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
pub struct PerformanceAbilityDimension {
    pub id: String,
    pub label: String,
    pub observed_label: String,
    pub description: String,
    pub source_ids: Vec<String>,
    pub confidence: String,
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
pub struct PerformanceLoadSignal {
    pub id: String,
    pub label: String,
    pub display_value: String,
    pub severity: String,
    pub text_equivalent: String,
    pub source_ids: Vec<String>,
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
pub struct PerformanceSupportAction {
    pub id: String,
    pub title: String,
    pub action: String,
    pub availability: String,
    pub source_id: String,
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
pub struct PerformanceBadge {
    pub id: String,
    pub title: String,
    pub subtitle: String,
    pub criteria: String,
    pub evidence_ids: Vec<String>,
    pub status: String,
    pub earned_at: Option<String>,
    pub progress_label: String,
    pub private: bool,
    pub affects_rights: bool,
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
pub struct PerformanceStatusLabel {
    pub id: String,
    pub words: String,
    pub number_preview: String,
    pub basis_ids: Vec<String>,
    pub starts_at: String,
    pub expires_at: String,
    pub withdrawn_at: Option<String>,
    pub private: bool,
    pub non_medical: bool,
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
pub struct PerformanceRecommendation {
    pub id: String,
    pub title: String,
    pub basis_ids: Vec<String>,
    pub cost: String,
    pub expected_effect: String,
    pub alternative: String,
    pub unknowns: Vec<String>,
    pub generation_mode: String,
    pub status: String,
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
pub struct PerformanceShareGrant {
    pub id: String,
    pub recipient: String,
    pub purpose: String,
    pub dimension_ids: Vec<String>,
    pub granted_at: String,
    pub expires_at: String,
    pub revoked_at: Option<String>,
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
pub struct PerformanceCorrectionCase {
    pub id: String,
    pub target_id: String,
    pub reason: String,
    pub evidence_ids: Vec<String>,
    pub status: String,
    pub created_at: String,
    pub revision: u64,
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
pub struct PerformanceHarmSignal {
    pub id: String,
    pub category: String,
    pub description: String,
    pub severity: String,
    pub status: String,
    pub action_taken: String,
    pub created_at: String,
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
pub struct PerformanceEvidence {
    pub id: String,
    pub evidence_type: String,
    pub source_id: String,
    pub label: String,
    pub locator: String,
    pub updated_at: String,
    pub authority: String,
    pub freshness: String,
    pub detail: String,
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
pub struct PerformanceClimateVariant {
    pub id: String,
    pub label: String,
    pub description: String,
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
pub struct PerformanceResearchGate {
    pub status: String,
    pub default_variant: String,
    pub evidence_count: u32,
    pub required_participants: String,
    pub variants: Vec<PerformanceClimateVariant>,
    pub stop_conditions: Vec<String>,
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
pub struct PerformanceAuditEvent {
    pub id: String,
    pub sequence: u64,
    pub action: String,
    pub target_id: String,
    pub detail: String,
    pub occurred_at: String,
    pub previous_event_hash: Option<String>,
    pub event_hash: String,
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
pub struct PerformanceCenterFixture {
    pub schema_version: String,
    pub data_mode: String,
    pub student_id: String,
    pub private_by_default: bool,
    pub comparison_mode: String,
    pub source_boundary: String,
    pub last_updated_at: String,
    pub forbidden_inputs: Vec<String>,
    pub metrics: Vec<PerformanceMetricDefinition>,
    pub observations: Vec<PerformanceObservation>,
    pub abilities: Vec<PerformanceAbilityDimension>,
    pub load_signals: Vec<PerformanceLoadSignal>,
    pub support_actions: Vec<PerformanceSupportAction>,
    pub badges: Vec<PerformanceBadge>,
    pub status_label: PerformanceStatusLabel,
    pub recommendations: Vec<PerformanceRecommendation>,
    pub share_grants: Vec<PerformanceShareGrant>,
    pub corrections: Vec<PerformanceCorrectionCase>,
    pub harm_signals: Vec<PerformanceHarmSignal>,
    pub evidence: Vec<PerformanceEvidence>,
    pub research_gate: PerformanceResearchGate,
    pub audit: Vec<PerformanceAuditEvent>,
}

impl PerformanceCenterFixture {
    pub fn validate(&self) -> Result<(), DomainError> {
        require_supported_schema(&self.schema_version)?;
        if self.data_mode != "fixture" {
            return Err(DomainError::InvariantViolation(
                "public Performance Center demo must remain data_mode=fixture".to_owned(),
            ));
        }
        if !self.private_by_default || self.comparison_mode != "self_only" {
            return Err(DomainError::InvariantViolation(
                "Performance Center must remain private and self-only by default".to_owned(),
            ));
        }
        if self.metrics.is_empty() || self.observations.is_empty() {
            return Err(DomainError::InvariantViolation(
                "Performance Center fixture needs metrics and observations".to_owned(),
            ));
        }
        let metric_ids = self
            .metrics
            .iter()
            .map(|metric| metric.id.as_str())
            .collect::<HashSet<_>>();
        if metric_ids.len() != self.metrics.len()
            || self
                .metrics
                .iter()
                .any(|metric| metric.comparison_mode != "self_only")
        {
            return Err(DomainError::InvariantViolation(
                "Performance Center metric IDs must be unique and self-only".to_owned(),
            ));
        }
        let evidence_ids = self
            .evidence
            .iter()
            .map(|evidence| evidence.id.as_str())
            .collect::<HashSet<_>>();
        if self.observations.iter().any(|observation| {
            !metric_ids.contains(observation.metric_id.as_str())
                || observation
                    .source_ids
                    .iter()
                    .any(|source_id| !evidence_ids.contains(source_id.as_str()))
        }) {
            return Err(DomainError::InvariantViolation(
                "Performance Center observations need declared metrics and evidence".to_owned(),
            ));
        }
        let required_abilities = [
            "ability-knowledge",
            "ability-applied",
            "ability-collaboration",
            "ability-habit",
        ]
        .into_iter()
        .collect::<HashSet<_>>();
        let ability_ids = self
            .abilities
            .iter()
            .map(|ability| ability.id.as_str())
            .collect::<HashSet<_>>();
        if ability_ids != required_abilities {
            return Err(DomainError::InvariantViolation(
                "Performance Center must keep four independent ability dimensions".to_owned(),
            ));
        }
        if self.load_signals.len() < 3 || self.support_actions.is_empty() {
            return Err(DomainError::InvariantViolation(
                "high load must be paired with multidimensional signals and support actions"
                    .to_owned(),
            ));
        }
        if self
            .badges
            .iter()
            .any(|badge| !badge.private || badge.affects_rights || badge.criteria.trim().is_empty())
        {
            return Err(DomainError::InvariantViolation(
                "Performance Center badges must be private, transparent and rights-neutral"
                    .to_owned(),
            ));
        }
        if !self.status_label.private || !self.status_label.non_medical {
            return Err(DomainError::InvariantViolation(
                "Performance Center status labels must be private and non-medical".to_owned(),
            ));
        }
        if self
            .recommendations
            .iter()
            .any(|recommendation| recommendation.generation_mode != "rule_fixture")
        {
            return Err(DomainError::InvariantViolation(
                "public Performance Center recommendations must remain rule_fixture".to_owned(),
            ));
        }
        let variants = self
            .research_gate
            .variants
            .iter()
            .map(|variant| variant.id.as_str())
            .collect::<HashSet<_>>();
        if self.research_gate.status != "deferred_pending_human_evidence"
            || self.research_gate.default_variant != "c_dimensions"
            || self.research_gate.evidence_count != 0
            || variants
                != ["a_numbers", "b_words", "c_dimensions"]
                    .into_iter()
                    .collect()
        {
            return Err(DomainError::InvariantViolation(
                "Degree Fahrenheit must remain a deferred A/B/C research experiment".to_owned(),
            ));
        }
        for (index, event) in self.audit.iter().enumerate() {
            let expected_previous = index
                .checked_sub(1)
                .and_then(|previous| self.audit.get(previous))
                .map(|previous| previous.event_hash.as_str());
            if event.sequence != u64::try_from(index + 1).unwrap_or(u64::MAX)
                || event.previous_event_hash.as_deref() != expected_previous
            {
                return Err(DomainError::InvariantViolation(
                    "Performance Center audit must remain an append-only chain".to_owned(),
                ));
            }
        }
        Ok(())
    }
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
pub struct PerformanceShareDraft {
    pub recipient: String,
    pub purpose: String,
    pub duration_days: u32,
    pub dimension_ids: Vec<String>,
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
pub struct PerformanceCenterSession {
    pub schema_version: String,
    pub data_mode: String,
    pub student_id: String,
    pub climate_variant: String,
    pub climate_enabled: bool,
    pub recommendations: Vec<PerformanceRecommendation>,
    pub share_grants: Vec<PerformanceShareGrant>,
    pub corrections: Vec<PerformanceCorrectionCase>,
    pub harm_signals: Vec<PerformanceHarmSignal>,
    pub status_label: PerformanceStatusLabel,
    pub audit: Vec<PerformanceAuditEvent>,
}

impl PerformanceCenterSession {
    #[must_use]
    pub fn from_fixture(fixture: &PerformanceCenterFixture) -> Self {
        Self {
            schema_version: SCHEMA_VERSION.to_owned(),
            data_mode: "fixture".to_owned(),
            student_id: fixture.student_id.clone(),
            climate_variant: fixture.research_gate.default_variant.clone(),
            climate_enabled: false,
            recommendations: fixture.recommendations.clone(),
            share_grants: fixture.share_grants.clone(),
            corrections: fixture.corrections.clone(),
            harm_signals: fixture.harm_signals.clone(),
            status_label: fixture.status_label.clone(),
            audit: fixture.audit.clone(),
        }
    }

    pub fn set_climate_variant(
        &mut self,
        fixture: &PerformanceCenterFixture,
        variant: &str,
    ) -> Result<(), DomainError> {
        if variant != "c_dimensions"
            && (self.status_label.withdrawn_at.is_some()
                || self
                    .harm_signals
                    .iter()
                    .any(|signal| signal.severity == "stop" && signal.status == "open"))
        {
            return Err(DomainError::InvariantViolation(
                "Academic Climate is locked after a STOP signal; start a reviewed research session before reenabling it"
                    .to_owned(),
            ));
        }
        if !fixture
            .research_gate
            .variants
            .iter()
            .any(|candidate| candidate.id == variant)
        {
            return Err(DomainError::InvariantViolation(
                "unknown Academic Climate research variant".to_owned(),
            ));
        }
        self.climate_variant = variant.to_owned();
        self.climate_enabled = variant != "c_dimensions";
        self.append_audit(
            "climate_toggle",
            &self.status_label.id.clone(),
            &format!("research variant set to {variant}; human gate remains deferred"),
        );
        Ok(())
    }

    pub fn act_on_recommendation(
        &mut self,
        recommendation_id: &str,
        status: &str,
    ) -> Result<PerformanceRecommendation, DomainError> {
        if !matches!(status, "adopted" | "later" | "dismissed") {
            return Err(DomainError::InvariantViolation(
                "recommendation status must be adopted, later or dismissed".to_owned(),
            ));
        }
        let index = self
            .recommendations
            .iter()
            .position(|item| item.id == recommendation_id)
            .ok_or_else(|| {
                DomainError::InvariantViolation(
                    "Performance Center recommendation not found".to_owned(),
                )
            })?;
        self.recommendations[index].status = status.to_owned();
        let recommendation = self.recommendations[index].clone();
        self.append_audit(
            "recommendation_action",
            recommendation_id,
            &format!("student set recommendation status to {status}"),
        );
        Ok(recommendation)
    }

    pub fn create_share_grant(
        &mut self,
        fixture: &PerformanceCenterFixture,
        draft: PerformanceShareDraft,
    ) -> Result<PerformanceShareGrant, DomainError> {
        require_non_empty("share recipient", &draft.recipient)?;
        require_non_empty("share purpose", &draft.purpose)?;
        if !(1..=30).contains(&draft.duration_days) || draft.dimension_ids.is_empty() {
            return Err(DomainError::InvariantViolation(
                "share needs 1-30 days and at least one dimension".to_owned(),
            ));
        }
        let ability_ids = fixture
            .abilities
            .iter()
            .map(|ability| ability.id.as_str())
            .collect::<HashSet<_>>();
        if draft
            .dimension_ids
            .iter()
            .any(|id| !ability_ids.contains(id.as_str()))
        {
            return Err(DomainError::InvariantViolation(
                "share can only include declared ability dimensions".to_owned(),
            ));
        }
        let sequence = self.share_grants.len() + 1;
        let grant = PerformanceShareGrant {
            id: format!("share-grant-{sequence:03}"),
            recipient: draft.recipient.trim().to_owned(),
            purpose: draft.purpose.trim().to_owned(),
            dimension_ids: draft.dimension_ids,
            granted_at: self.next_timestamp(),
            expires_at: performance_share_expiry(draft.duration_days),
            revoked_at: None,
        };
        self.share_grants.push(grant.clone());
        self.append_audit(
            "share_grant",
            &grant.id,
            &format!(
                "shared {} dimensions for a purpose-bound fixture",
                grant.dimension_ids.len()
            ),
        );
        Ok(grant)
    }

    pub fn revoke_share_grant(
        &mut self,
        grant_id: &str,
    ) -> Result<PerformanceShareGrant, DomainError> {
        let index = self
            .share_grants
            .iter()
            .position(|grant| grant.id == grant_id)
            .ok_or_else(|| {
                DomainError::InvariantViolation(
                    "Performance Center share grant not found".to_owned(),
                )
            })?;
        if self.share_grants[index].revoked_at.is_some() {
            return Err(DomainError::InvariantViolation(
                "Performance Center share grant is already revoked".to_owned(),
            ));
        }
        let revoked_at = self.next_timestamp();
        self.share_grants[index].revoked_at = Some(revoked_at);
        let grant = self.share_grants[index].clone();
        self.append_audit(
            "share_revoke",
            grant_id,
            "student revoked the purpose-bound share grant",
        );
        Ok(grant)
    }

    pub fn request_correction(
        &mut self,
        fixture: &PerformanceCenterFixture,
        target_id: &str,
        reason: &str,
    ) -> Result<PerformanceCorrectionCase, DomainError> {
        require_non_empty("correction reason", reason)?;
        let known_target = fixture.metrics.iter().any(|item| item.id == target_id)
            || fixture.observations.iter().any(|item| item.id == target_id)
            || fixture.badges.iter().any(|item| item.id == target_id);
        if !known_target {
            return Err(DomainError::InvariantViolation(
                "Performance Center correction target not found".to_owned(),
            ));
        }
        let sequence = self.corrections.len() + 1;
        let correction = PerformanceCorrectionCase {
            id: format!("correction-{sequence:03}"),
            target_id: target_id.to_owned(),
            reason: reason.trim().to_owned(),
            evidence_ids: fixture
                .observations
                .iter()
                .find(|observation| observation.id == target_id)
                .map_or_else(Vec::new, |observation| observation.source_ids.clone()),
            status: "queued_for_human_review".to_owned(),
            created_at: self.next_timestamp(),
            revision: 1,
        };
        self.corrections.push(correction.clone());
        self.append_audit(
            "correction_request",
            &correction.id,
            &format!("correction requested for {target_id}; old value preserved"),
        );
        Ok(correction)
    }

    pub fn report_harm(&mut self, description: &str) -> Result<PerformanceHarmSignal, DomainError> {
        require_non_empty("harm description", description)?;
        let sequence = self.harm_signals.len() + 1;
        let created_at = self.next_timestamp();
        let signal = PerformanceHarmSignal {
            id: format!("harm-{sequence:03}"),
            category: "pressure".to_owned(),
            description: description.trim().to_owned(),
            severity: "stop".to_owned(),
            status: "open".to_owned(),
            action_taken: "Academic Climate disabled; returned to the no-metaphor dimensions view"
                .to_owned(),
            created_at: created_at.clone(),
        };
        self.climate_variant = "c_dimensions".to_owned();
        self.climate_enabled = false;
        self.status_label.withdrawn_at = Some(created_at);
        self.harm_signals.push(signal.clone());
        self.append_audit("harm_report", &signal.id, description.trim());
        Ok(signal)
    }

    pub fn record_export(&mut self) {
        self.append_audit(
            "export",
            "student:student-nan-fixture",
            "exported a readable untrusted private fixture copy",
        );
    }

    fn append_audit(&mut self, action: &str, target_id: &str, detail: &str) {
        let previous = self.audit.last();
        let sequence = previous.map_or(1, |event| event.sequence + 1);
        let previous_event_hash = previous.map(|event| event.event_hash.clone());
        self.audit.push(PerformanceAuditEvent {
            id: format!("perf-event-{sequence:03}"),
            sequence,
            action: action.to_owned(),
            target_id: target_id.to_owned(),
            detail: detail.to_owned(),
            occurred_at: self.next_timestamp(),
            previous_event_hash,
            event_hash: format!("fnv1a-perf-event-{sequence:03}"),
        });
    }

    fn next_timestamp(&self) -> String {
        let minute = (self.audit.len() + 1) % 60;
        format!("2026-07-24T19:{minute:02}:00+08:00")
    }
}

fn performance_share_expiry(duration_days: u32) -> String {
    let day_of_month = 24 + duration_days;
    if day_of_month <= 31 {
        format!("2026-07-{day_of_month:02}T23:59:00+08:00")
    } else {
        format!(
            "2026-08-{:02}T23:59:00+08:00",
            day_of_month.saturating_sub(31)
        )
    }
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

pub fn create_student_interaction(
    object: &GeneratedObject,
    published_version: &PublishedVersion,
    interaction_id: String,
    command: InteractionCommand,
) -> Result<StudentInteraction, DomainError> {
    object.validate()?;
    require_supported_schema(&command.schema_version)?;
    require_non_empty("interaction id", &interaction_id)?;
    require_non_empty("actor_id", &command.actor_id)?;
    require_non_empty("interaction_type", &command.interaction_type)?;

    if object.review_state.as_str() != ReviewState::PUBLISHED {
        return Err(DomainError::InvalidTransition {
            from: object.review_state.to_string(),
            action: "interact".to_owned(),
        });
    }
    if published_version.object_id != object.id {
        return Err(DomainError::InvariantViolation(
            "published version does not belong to the requested object".to_owned(),
        ));
    }
    if command
        .selected_answer
        .as_ref()
        .is_some_and(|answer| answer.trim().is_empty())
    {
        return Err(DomainError::InvariantViolation(
            "selected_answer must not be blank when present".to_owned(),
        ));
    }

    Ok(StudentInteraction {
        schema_version: SCHEMA_VERSION.to_owned(),
        id: interaction_id,
        object_id: object.id.clone(),
        published_version_id: published_version.id.clone(),
        actor_id: command.actor_id,
        interaction_type: command.interaction_type,
        selected_answer: command.selected_answer,
        correct: command.correct,
        duration_ms: command.duration_ms,
        occurred_at_unix_ms: command.occurred_at_unix_ms,
        fixture: object.fixture,
    })
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

    #[test]
    fn interaction_requires_a_published_version_and_keeps_fixture_label() {
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
        apply_review_command(
            &mut object,
            "evt-approve".to_owned(),
            ReviewCommand {
                schema_version: SCHEMA_VERSION.to_owned(),
                actor_id: "teacher-fixture".to_owned(),
                expected_revision: 1,
                occurred_at_unix_ms: 2,
                action: ReviewAction::Approve,
            },
        )
        .expect("review can be approved");
        let (_, version) = publish_object(
            &mut object,
            "evt-publish".to_owned(),
            "version-1".to_owned(),
            1,
            PublishCommand {
                schema_version: SCHEMA_VERSION.to_owned(),
                actor_id: "teacher-fixture".to_owned(),
                expected_revision: 2,
                occurred_at_unix_ms: 3,
            },
        )
        .expect("approved object can publish");

        let interaction = create_student_interaction(
            &object,
            &version,
            "interaction-1".to_owned(),
            InteractionCommand {
                schema_version: SCHEMA_VERSION.to_owned(),
                actor_id: "student-nan-fixture".to_owned(),
                interaction_type: "quiz_answer".to_owned(),
                selected_answer: Some("B".to_owned()),
                correct: Some(true),
                duration_ms: Some(18_000),
                occurred_at_unix_ms: 4,
            },
        )
        .expect("published fixture accepts a labelled student interaction");

        assert_eq!(interaction.object_id, object.id);
        assert_eq!(interaction.published_version_id, version.id);
        assert_eq!(interaction.selected_answer.as_deref(), Some("B"));
        assert_eq!(interaction.correct, Some(true));
        assert!(interaction.fixture);
    }

    fn world_exam_fixture() -> WorldExamFixture {
        serde_json::from_str(include_str!("../../../fixtures/v1/world-exam.demo.json"))
            .expect("World Exam fixture must deserialize")
    }

    #[test]
    fn world_exam_fixture_is_source_bounded_and_non_formal() {
        let fixture = world_exam_fixture();
        fixture
            .validate()
            .expect("World Exam fixture must satisfy invariants");
        assert!(!fixture.event.is_formal);
        assert_eq!(fixture.event.status, ExamStatus::BriefingOpen);
        assert!(
            fixture
                .match_questions
                .iter()
                .flat_map(|question| &question.ai_trace)
                .any(|claim| claim.confidence == "unsupported")
        );
    }

    #[test]
    fn world_exam_state_machine_requires_source_challenge_and_private_consent() {
        let fixture = world_exam_fixture();
        let mut session = WorldExamSession::from_fixture(&fixture);
        let warmup = session
            .answer_warmup(&fixture, "decrease".to_owned())
            .expect("warm-up must accept a declared option");
        assert!(warmup.correct);
        session
            .save_checkpoint(&fixture, "item-cutoff-check".to_owned(), true)
            .expect("declared playbook item can be checked");
        session
            .submit_answer(
                &fixture,
                "match-cutoff".to_owned(),
                "decrease".to_owned(),
                true,
                Vec::new(),
            )
            .expect("first Key Match answer must save");
        session
            .submit_answer(
                &fixture,
                "match-ai-trace".to_owned(),
                "challenge".to_owned(),
                true,
                Vec::new(),
            )
            .expect("second Key Match answer must save");
        assert!(session.finish_match(&fixture).is_err());

        session
            .submit_answer(
                &fixture,
                "match-ai-trace".to_owned(),
                "challenge".to_owned(),
                true,
                vec!["claim-simulator-wrong".to_owned()],
            )
            .expect("declared unsupported claim can be challenged");
        session
            .finish_match(&fixture)
            .expect("complete evidence-aware attempt can enter review");
        assert_eq!(session.status, ExamStatus::Review);
        assert_eq!(build_exam_box_score(&session, &fixture).completion_pct, 100);

        let missing_expiry = session.save_reflection(PostGameReflection {
            worked: "先核对来源".to_owned(),
            blocked: "仪器负载".to_owned(),
            next_adjustment: "补充误差表".to_owned(),
            share_with_mentor: true,
            share_expires_at: None,
        });
        assert!(missing_expiry.is_err());
        session
            .save_reflection(PostGameReflection {
                worked: "先核对来源".to_owned(),
                blocked: "仪器负载".to_owned(),
                next_adjustment: "补充误差表".to_owned(),
                share_with_mentor: true,
                share_expires_at: Some("2026-08-07".to_owned()),
            })
            .expect("explicit expiring mentor consent can save");
        session.archive().expect("reflected attempt can archive");
        assert_eq!(session.status, ExamStatus::Archived);
    }

    #[test]
    fn world_exam_box_score_contains_no_rank_or_grade_prediction() {
        let fixture = world_exam_fixture();
        let mut session = WorldExamSession::from_fixture(&fixture);
        session
            .skip_warmup()
            .expect("briefing-open event can skip warm-up");
        session
            .submit_answer(
                &fixture,
                "match-cutoff".to_owned(),
                "increase".to_owned(),
                false,
                Vec::new(),
            )
            .expect("declared answer saves");
        let score = build_exam_box_score(&session, &fixture);
        let json = serde_json::to_string(&score).expect("score must serialize");
        assert_eq!(score.error_counts.conceptual, 1);
        assert!(!json.contains("rank"));
        assert!(!json.contains("grade"));
        assert!(!json.contains("probability"));
    }

    fn roster_fixture() -> RosterFixture {
        serde_json::from_str(include_str!("../../../fixtures/v1/roster-lab.demo.json"))
            .expect("Roster Lab fixture must deserialize")
    }

    #[test]
    fn roster_fixture_is_bounded_explainable_and_non_formal() {
        let fixture = roster_fixture();
        fixture
            .validate()
            .expect("Roster Lab fixture must satisfy invariants");
        assert_eq!(fixture.catalog.len(), 12);
        assert_eq!(fixture.plans.len(), 3);
        assert!(
            fixture
                .plans
                .iter()
                .all(|plan| plan.hard_constraints_met && !plan.is_formal_enrollment)
        );
        assert!(!fixture.unsat.minimal_conflict_set.is_empty());
        assert!(!fixture.unsat.relaxable_items.is_empty());
    }

    #[test]
    fn roster_session_preserves_pins_and_returns_multiple_deterministic_plans() {
        let fixture = roster_fixture();
        let mut session = RosterSession::from_fixture(&fixture);
        let plans = session
            .solve(&fixture, None, None)
            .expect("default fixture must resolve");
        assert_eq!(plans.len(), 3);
        assert!(
            plans.iter().all(|plan| {
                plan.course_selections
                    .iter()
                    .any(|selection| selection.course_id == "SLS201")
            }),
            "every plan must keep the anchor pin"
        );
        let replay = session
            .solve(&fixture, None, None)
            .expect("same input must replay");
        assert_eq!(plans, replay);

        let missing_anchor = session.update_pins(&fixture, &["pin-friday-commitment".to_owned()]);
        assert!(missing_anchor.is_err());
    }

    #[test]
    fn roster_transaction_and_lock_never_claim_formal_enrollment() {
        let fixture = roster_fixture();
        let mut session = RosterSession::from_fixture(&fixture);
        let plans = session
            .solve(&fixture, None, None)
            .expect("default fixture must resolve");
        let changed_plan = plans
            .iter()
            .find(|plan| plan.id == "plan-late-fixture")
            .expect("fixture includes a changed plan");
        let transaction = session
            .transaction(&fixture, &changed_plan.id)
            .expect("changed plan has a diff");
        assert!(!transaction.is_formal_submission);
        assert!(
            transaction
                .actions
                .iter()
                .any(|action| action.action_type == "swap")
        );
        assert!(
            transaction
                .actions
                .iter()
                .all(|action| !action.formal_step.is_empty())
        );

        let lock = session
            .save_lock(&fixture, &changed_plan.id)
            .expect("selected plan can save a replay input");
        assert!(!lock.is_formal_enrollment);
        assert_eq!(lock.catalog_version, fixture.catalog_version);
        assert_eq!(lock.input_fingerprint, changed_plan.input_fingerprint);
    }

    fn academic_mirror_fixture() -> AcademicMirrorFixture {
        serde_json::from_str(include_str!(
            "../../../fixtures/v1/academic-mirror.demo.json"
        ))
        .expect("Academic Mirror fixture must deserialize")
    }

    #[test]
    fn academic_mirror_fixture_is_read_only_provenance_complete_and_six_level() {
        let fixture = academic_mirror_fixture();
        fixture
            .validate()
            .expect("Academic Mirror fixture must satisfy invariants");
        assert!(fixture.read_only);
        assert_eq!(fixture.authority_catalog.len(), 6);
        assert!(
            fixture
                .records
                .iter()
                .flat_map(|record| record.fields.values())
                .all(|field| {
                    field.provenance.effective_authority == MirrorAuthorityLevel::DemoFixture
                })
        );
    }

    #[test]
    fn academic_mirror_sync_appends_without_mutating_the_previous_snapshot() {
        let fixture = academic_mirror_fixture();
        let mut session = AcademicMirrorSession::from_fixture(&fixture);
        let before = session.snapshots[0].clone();
        let next = session
            .sync_source("ds-sis-demo")
            .expect("authorized fixture source can sync");
        assert_eq!(session.snapshots[0], before);
        assert_ne!(next.id, before.id);
        assert_eq!(next.content_hash, before.content_hash);
        assert_eq!(
            session
                .audit
                .iter()
                .rev()
                .take(2)
                .map(|event| event.action.as_str())
                .collect::<Vec<_>>(),
            vec!["map", "sync"]
        );
    }

    #[test]
    fn academic_mirror_conflict_requires_reason_and_keeps_a_receipt() {
        let fixture = academic_mirror_fixture();
        let mut session = AcademicMirrorSession::from_fixture(&fixture);
        assert!(
            session
                .resolve_conflict("conf-sls-credits", "opt-catalog-3", "")
                .is_err()
        );
        let resolved = session
            .resolve_conflict(
                "conf-sls-credits",
                "opt-catalog-3",
                "Use the current catalog as mirror baseline and retain the difference.",
            )
            .expect("human reason resolves the mirror conflict");
        assert_eq!(resolved.status, "resolved");
        assert_eq!(
            resolved
                .resolution
                .as_ref()
                .map(|resolution| resolution.chosen_option_id.as_str()),
            Some("opt-catalog-3")
        );
        assert_eq!(
            session.audit.last().map(|event| event.action.as_str()),
            Some("conflict_resolve")
        );
    }

    #[test]
    fn academic_mirror_deletes_only_non_authoritative_copies() {
        let fixture = academic_mirror_fixture();
        let mut session = AcademicMirrorSession::from_fixture(&fixture);
        assert!(
            session
                .delete_non_authoritative_copy("nr-student-profile")
                .is_err()
        );
        session
            .delete_non_authoritative_copy("nr-self-goal")
            .expect("self-declared copy is removable");
        assert!(
            !session
                .records
                .iter()
                .any(|record| record.id == "nr-self-goal")
        );
        assert_eq!(
            session.audit.last().map(|event| event.action.as_str()),
            Some("delete")
        );
    }

    fn performance_center_fixture() -> PerformanceCenterFixture {
        serde_json::from_str(include_str!(
            "../../../fixtures/v1/performance-center.demo.json"
        ))
        .expect("Performance Center fixture must deserialize")
    }

    #[test]
    fn performance_center_fixture_is_private_self_only_and_research_deferred() {
        let fixture = performance_center_fixture();
        fixture
            .validate()
            .expect("Performance Center fixture must satisfy invariants");
        assert!(fixture.private_by_default);
        assert_eq!(fixture.comparison_mode, "self_only");
        assert_eq!(fixture.research_gate.default_variant, "c_dimensions");
        assert_eq!(fixture.research_gate.evidence_count, 0);
        assert!(
            fixture
                .badges
                .iter()
                .all(|badge| badge.private && !badge.affects_rights)
        );
    }

    #[test]
    fn performance_center_recommendation_and_share_flow_is_purpose_bound() {
        let fixture = performance_center_fixture();
        let mut session = PerformanceCenterSession::from_fixture(&fixture);
        let recommendation = session
            .act_on_recommendation("rec-buffer", "adopted")
            .expect("fixture recommendation can be adopted");
        assert_eq!(recommendation.status, "adopted");

        let grant = session
            .create_share_grant(
                &fixture,
                PerformanceShareDraft {
                    recipient: "学业导师（演示）".to_owned(),
                    purpose: "讨论本人下一周任务安排".to_owned(),
                    duration_days: 7,
                    dimension_ids: vec!["ability-knowledge".to_owned()],
                },
            )
            .expect("declared dimension can be shared with explicit purpose");
        assert_eq!(grant.expires_at, "2026-07-31T23:59:00+08:00");
        assert!(grant.revoked_at.is_none());
        let revoked = session
            .revoke_share_grant(&grant.id)
            .expect("student can revoke an active share");
        assert!(revoked.revoked_at.is_some());
        assert_eq!(
            session.audit.last().map(|event| event.action.as_str()),
            Some("share_revoke")
        );
    }

    #[test]
    fn performance_center_harm_signal_forces_safe_baseline_and_withdrawal() {
        let fixture = performance_center_fixture();
        let mut session = PerformanceCenterSession::from_fixture(&fixture);
        session
            .set_climate_variant(&fixture, "a_numbers")
            .expect("research preview can be selected locally");
        assert!(session.climate_enabled);
        let signal = session
            .report_harm("数字让我误以为这是正式成绩。")
            .expect("student can report a harm signal");
        assert_eq!(signal.severity, "stop");
        assert_eq!(session.climate_variant, "c_dimensions");
        assert!(!session.climate_enabled);
        assert!(session.status_label.withdrawn_at.is_some());
        assert!(
            session.set_climate_variant(&fixture, "a_numbers").is_err(),
            "a STOP signal must lock A/B research language until reviewed reset"
        );
    }

    #[test]
    fn performance_center_correction_and_export_append_without_overwrite() {
        let fixture = performance_center_fixture();
        let mut session = PerformanceCenterSession::from_fixture(&fixture);
        let observation_snapshot = fixture.observations.clone();
        let correction = session
            .request_correction(
                &fixture,
                "metric-revision-quality",
                "遗漏了一次离线修订，请人工核对。",
            )
            .expect("known metric can enter human correction queue");
        assert_eq!(correction.status, "queued_for_human_review");
        assert_eq!(fixture.observations, observation_snapshot);
        session.record_export();
        assert_eq!(
            session.audit.last().map(|event| event.action.as_str()),
            Some("export")
        );
        for events in session.audit.windows(2) {
            assert_eq!(
                events[1].previous_event_hash.as_deref(),
                Some(events[0].event_hash.as_str())
            );
        }
    }
}

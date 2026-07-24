use crate::{DomainError, SCHEMA_VERSION, require_non_empty, require_supported_schema};
use serde::{Deserialize, Serialize};
use std::collections::HashSet;

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
pub struct CoachEvidenceSource {
    pub id: String,
    pub tier: String,
    pub label: String,
    pub owner: String,
    pub version: String,
    pub updated_at: String,
    pub expires_at: Option<String>,
    pub correction_route: String,
    pub verified: bool,
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
pub struct CoachSourcedField {
    pub id: String,
    pub label: String,
    pub value: String,
    pub source_id: String,
    pub effective_term: String,
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
pub struct CoachAssessmentPart {
    pub label: String,
    pub weight: u32,
    pub source_id: String,
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
pub struct CoachCourseProfile {
    pub id: String,
    pub course_id: String,
    pub offering_id: String,
    pub term: String,
    pub title: String,
    pub instructor_id: String,
    pub instructor_assignment_id: String,
    pub instructor_display_name: String,
    pub summary: CoachSourcedField,
    pub objectives: Vec<CoachSourcedField>,
    pub assessments: Vec<CoachAssessmentPart>,
    pub textbooks: Vec<CoachSourcedField>,
    pub prerequisites: Vec<CoachSourcedField>,
    pub updated_at: String,
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
pub struct CoachTeachingActivity {
    pub id: String,
    pub label: String,
    pub share: u32,
    pub frequency: String,
    pub source_id: String,
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
pub struct CoachTeachingStructure {
    pub offering_id: String,
    pub activities: Vec<CoachTeachingActivity>,
    pub homework_frequency: CoachSourcedField,
    pub feedback_method: CoachSourcedField,
    pub group_share: CoachSourcedField,
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
pub struct CoachOfficeHours {
    pub id: String,
    pub instructor_assignment_id: String,
    pub schedule: String,
    pub location: String,
    pub appointment_method: String,
    pub suitable_topics: Vec<String>,
    pub accessibility: Vec<String>,
    pub source_id: String,
    pub updated_at: String,
    pub expires_at: String,
    pub status: String,
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
pub struct CoachWorkloadRange {
    pub id: String,
    pub label: String,
    pub minimum: u32,
    pub maximum: u32,
    pub unit: String,
    pub sample_size: Option<u32>,
    pub minimum_sample: Option<u32>,
    pub time_range: String,
    pub source_id: String,
    pub publishable: bool,
    pub caveat: String,
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
pub struct CoachScoutingReport {
    pub offering_id: String,
    pub prepared_for: Vec<CoachSourcedField>,
    pub challenges: Vec<CoachSourcedField>,
    pub actions: Vec<CoachSourcedField>,
    pub unknowns: Vec<CoachSourcedField>,
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
pub struct CoachCourseVersion {
    pub id: String,
    pub course_id: String,
    pub offering_id: String,
    pub term: String,
    pub instructor_id: String,
    pub instructor_assignment_id: String,
    pub profile_version: String,
    pub assessment_summary: String,
    pub teaching_summary: String,
    pub source_ids: Vec<String>,
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
pub struct CoachFeedbackAggregate {
    pub id: String,
    pub offering_id: String,
    pub dimension: String,
    pub sample_size: u32,
    pub minimum_sample: u32,
    pub time_range: String,
    pub summary: String,
    pub suggested_action: String,
    pub source_id: String,
    pub published: bool,
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
pub struct CoachTeamProfileField {
    pub id: String,
    pub label: String,
    pub kind: String,
    pub value: String,
    pub selectable: bool,
    pub private: bool,
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
pub struct CoachTeamNeed {
    pub id: String,
    pub offering_id: String,
    pub project_title: String,
    pub role_gap: String,
    pub skills: Vec<String>,
    pub hours_per_week: u32,
    pub communication: Vec<String>,
    pub source_ids: Vec<String>,
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
pub struct CoachExpectationReminder {
    pub id: String,
    pub offering_id: String,
    pub reminder_type: String,
    pub title: String,
    pub detail: String,
    pub due_at: String,
    pub source_id: String,
    pub required: bool,
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
pub struct CoachAuditEvent {
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
pub struct CoachScoutingInvariants {
    pub no_teacher_rating: bool,
    pub no_personality_labels: bool,
    pub separate_course_and_teacher: bool,
    pub no_feedback_carry_forward: bool,
    pub minimum_feedback_sample: u32,
    pub no_sensitive_team_matching: bool,
    pub no_fabricated_advisor_reply: bool,
    pub severe_content_hidden_first: bool,
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
pub struct CoachScoutingFixture {
    pub schema_version: String,
    pub data_mode: String,
    pub generated_at: String,
    pub last_updated_at: String,
    pub course: CoachCourseProfile,
    pub sources: Vec<CoachEvidenceSource>,
    pub teaching: CoachTeachingStructure,
    pub office_hours: Vec<CoachOfficeHours>,
    pub workload: Vec<CoachWorkloadRange>,
    pub scouting: CoachScoutingReport,
    pub versions: Vec<CoachCourseVersion>,
    pub feedback_aggregates: Vec<CoachFeedbackAggregate>,
    pub team_fields: Vec<CoachTeamProfileField>,
    pub team_needs: Vec<CoachTeamNeed>,
    pub reminders: Vec<CoachExpectationReminder>,
    pub audit: Vec<CoachAuditEvent>,
    pub invariants: CoachScoutingInvariants,
}

impl CoachScoutingFixture {
    pub fn validate(&self) -> Result<(), DomainError> {
        require_supported_schema(&self.schema_version)?;
        if self.data_mode != "demo_fixture" {
            return Err(DomainError::InvariantViolation(
                "Coach & Scouting must remain an explicit demo_fixture".to_owned(),
            ));
        }
        require_non_empty("Coach course title", &self.course.title)?;
        require_non_empty(
            "Coach instructor assignment",
            &self.course.instructor_assignment_id,
        )?;

        let source_ids = unique_coach_ids(
            self.sources.iter().map(|item| item.id.as_str()),
            self.sources.len(),
            "Coach source IDs must be unique",
        )?;
        let source_tiers = self
            .sources
            .iter()
            .map(|item| item.tier.as_str())
            .collect::<HashSet<_>>();
        if source_tiers
            != [
                "teacher_confirmed",
                "official_syllabus",
                "historical_version",
                "student_aggregate",
                "system_inference",
            ]
            .into_iter()
            .collect()
        {
            return Err(DomainError::InvariantViolation(
                "Coach & Scouting must expose exactly five separated source tiers".to_owned(),
            ));
        }
        if self.sources.iter().any(|source| {
            source.correction_route.trim().is_empty()
                || source.owner.trim().is_empty()
                || source.version.trim().is_empty()
                || (source.tier == "system_inference" && source.verified)
        }) {
            return Err(DomainError::InvariantViolation(
                "Coach sources need owner, version, correction route and honest verification status"
                    .to_owned(),
            ));
        }

        validate_sourced_field(&self.course.summary, &source_ids)?;
        for field in self
            .course
            .objectives
            .iter()
            .chain(self.course.textbooks.iter())
            .chain(self.course.prerequisites.iter())
        {
            validate_sourced_field(field, &source_ids)?;
        }
        if self.course.objectives.is_empty()
            || self.course.assessments.is_empty()
            || self.course.textbooks.is_empty()
            || self.course.prerequisites.is_empty()
            || self
                .course
                .assessments
                .iter()
                .map(|item| item.weight)
                .sum::<u32>()
                != 100
            || self
                .course
                .assessments
                .iter()
                .any(|item| !source_ids.contains(item.source_id.as_str()))
        {
            return Err(DomainError::InvariantViolation(
                "Coach course profile needs sourced objectives, materials, prerequisites and a 100% assessment plan"
                    .to_owned(),
            ));
        }

        if self.teaching.offering_id != self.course.offering_id
            || self.teaching.activities.is_empty()
            || self
                .teaching
                .activities
                .iter()
                .map(|item| item.share)
                .sum::<u32>()
                != 100
            || self
                .teaching
                .activities
                .iter()
                .any(|item| !source_ids.contains(item.source_id.as_str()))
        {
            return Err(DomainError::InvariantViolation(
                "Coach teaching structure needs sourced activities totaling 100%".to_owned(),
            ));
        }
        for field in [
            &self.teaching.homework_frequency,
            &self.teaching.feedback_method,
            &self.teaching.group_share,
        ] {
            validate_sourced_field(field, &source_ids)?;
        }

        let office_statuses = self
            .office_hours
            .iter()
            .map(|item| item.status.as_str())
            .collect::<HashSet<_>>();
        if !office_statuses.contains("active")
            || !office_statuses.contains("expired")
            || self.office_hours.iter().any(|item| {
                item.instructor_assignment_id != self.course.instructor_assignment_id
                    || !source_ids.contains(item.source_id.as_str())
                    || item.suitable_topics.is_empty()
                    || item.accessibility.is_empty()
            })
        {
            return Err(DomainError::InvariantViolation(
                "Coach Office Hours need current and explicitly expired sourced records".to_owned(),
            ));
        }

        if self.workload.is_empty()
            || self.workload.iter().any(|item| {
                item.minimum > item.maximum
                    || item.unit != "hours_per_week"
                    || !source_ids.contains(item.source_id.as_str())
                    || item.caveat.trim().is_empty()
                    || match (item.sample_size, item.minimum_sample) {
                        (Some(sample), Some(minimum)) => item.publishable != (sample >= minimum),
                        (None, None) => false,
                        _ => true,
                    }
            })
        {
            return Err(DomainError::InvariantViolation(
                "Coach workload ranges need ranges, caveats and honest sample thresholds"
                    .to_owned(),
            ));
        }

        if self.scouting.offering_id != self.course.offering_id
            || [
                &self.scouting.prepared_for,
                &self.scouting.challenges,
                &self.scouting.actions,
                &self.scouting.unknowns,
            ]
            .iter()
            .any(|quadrant| quadrant.is_empty())
        {
            return Err(DomainError::InvariantViolation(
                "Scouting Report needs prepared-for, challenge, action and unknown quadrants"
                    .to_owned(),
            ));
        }
        for field in self
            .scouting
            .prepared_for
            .iter()
            .chain(self.scouting.challenges.iter())
            .chain(self.scouting.actions.iter())
            .chain(self.scouting.unknowns.iter())
        {
            validate_sourced_field(field, &source_ids)?;
        }

        let version_ids = unique_coach_ids(
            self.versions.iter().map(|item| item.id.as_str()),
            self.versions.len(),
            "Coach version IDs must be unique",
        )?;
        if self.versions.len() < 2
            || self.versions.iter().any(|version| {
                version.course_id != self.course.course_id
                    || version.source_ids.is_empty()
                    || version
                        .source_ids
                        .iter()
                        .any(|id| !source_ids.contains(id.as_str()))
            })
            || !version_ids.contains("version-2026sp")
        {
            return Err(DomainError::InvariantViolation(
                "Coach Version Film needs at least two sourced versions of the same course"
                    .to_owned(),
            ));
        }

        if self.feedback_aggregates.is_empty()
            || self.feedback_aggregates.iter().any(|item| {
                item.offering_id != self.course.offering_id
                    || item.minimum_sample != self.invariants.minimum_feedback_sample
                    || item.published != (item.sample_size >= item.minimum_sample)
                    || !source_ids.contains(item.source_id.as_str())
            })
        {
            return Err(DomainError::InvariantViolation(
                "Coach feedback aggregates must obey the declared minimum sample".to_owned(),
            ));
        }

        let team_field_ids = unique_coach_ids(
            self.team_fields.iter().map(|item| item.id.as_str()),
            self.team_fields.len(),
            "Coach team field IDs must be unique",
        )?;
        if self.team_fields.is_empty()
            || self.team_fields.iter().any(|field| {
                !field.private
                    || (field.kind == "sensitive" && field.selectable)
                    || (!matches!(
                        field.kind.as_str(),
                        "skill" | "availability" | "communication" | "sensitive"
                    ))
            })
            || self.team_needs.is_empty()
            || self.team_needs.iter().any(|need| {
                need.skills.is_empty()
                    || need.communication.is_empty()
                    || need.hours_per_week == 0
                    || need.source_ids.is_empty()
                    || need
                        .source_ids
                        .iter()
                        .any(|id| !source_ids.contains(id.as_str()))
            })
            || team_field_ids.is_empty()
        {
            return Err(DomainError::InvariantViolation(
                "Coach team matching needs private selective fields, non-sensitive inputs and sourced role gaps"
                    .to_owned(),
            ));
        }

        let reminder_types = self
            .reminders
            .iter()
            .map(|item| item.reminder_type.as_str())
            .collect::<HashSet<_>>();
        if reminder_types
            != ["equipment", "material", "attendance", "safety"]
                .into_iter()
                .collect()
            || self.reminders.iter().any(|item| {
                item.offering_id != self.course.offering_id
                    || !source_ids.contains(item.source_id.as_str())
            })
        {
            return Err(DomainError::InvariantViolation(
                "Coach expectations need equipment, material, attendance and safety reminders"
                    .to_owned(),
            ));
        }

        let invariants = &self.invariants;
        if !invariants.no_teacher_rating
            || !invariants.no_personality_labels
            || !invariants.separate_course_and_teacher
            || !invariants.no_feedback_carry_forward
            || invariants.minimum_feedback_sample < 5
            || !invariants.no_sensitive_team_matching
            || !invariants.no_fabricated_advisor_reply
            || !invariants.severe_content_hidden_first
        {
            return Err(DomainError::InvariantViolation(
                "Coach & Scouting fairness and truth invariants must all remain enabled".to_owned(),
            ));
        }
        validate_coach_audit(&self.audit)?;
        Ok(())
    }

    fn source(&self, source_id: &str) -> Result<&CoachEvidenceSource, DomainError> {
        self.sources
            .iter()
            .find(|item| item.id == source_id)
            .ok_or_else(|| {
                DomainError::InvariantViolation(format!(
                    "Coach evidence source not found: {source_id}"
                ))
            })
    }

    fn version(&self, version_id: &str) -> Result<&CoachCourseVersion, DomainError> {
        self.versions
            .iter()
            .find(|item| item.id == version_id)
            .ok_or_else(|| {
                DomainError::InvariantViolation(format!(
                    "Coach course version not found: {version_id}"
                ))
            })
    }
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
pub struct CoachVersionChange {
    pub id: String,
    pub field: String,
    pub before: String,
    pub after: String,
    pub source_ids: Vec<String>,
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
pub struct CoachVersionComparison {
    pub from_version_id: String,
    pub to_version_id: String,
    pub same_instructor_assignment: bool,
    pub feedback_carried_forward: bool,
    pub changes: Vec<CoachVersionChange>,
    pub warning: String,
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
pub struct CoachCorrectionHistory {
    pub status: String,
    pub occurred_at: String,
    pub note: String,
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
pub struct CoachCorrectionCase {
    pub id: String,
    pub target_id: String,
    pub requested_by: String,
    pub correction_type: String,
    pub statement: String,
    pub evidence_ids: Vec<String>,
    pub status: String,
    pub created_at: String,
    pub review_due_at: String,
    pub history: Vec<CoachCorrectionHistory>,
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
pub struct CoachFeedbackSubmission {
    pub id: String,
    pub offering_id: String,
    pub dimension: String,
    pub concrete_experience: String,
    pub suggested_action: String,
    pub consent_to_aggregate: bool,
    pub safety_status: String,
    pub created_at: String,
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
pub struct CoachFairnessCheck {
    pub id: String,
    pub label: String,
    pub passed: bool,
    pub detail: String,
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
pub struct CoachFairnessAudit {
    pub id: String,
    pub status: String,
    pub sort_mode: String,
    pub checks: Vec<CoachFairnessCheck>,
    pub sensitive_attributes: Vec<String>,
    pub proxy_fields: Vec<String>,
    pub ran_at: String,
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
pub struct CoachTeamMatch {
    pub team_need_id: String,
    pub status: String,
    pub reasons: Vec<String>,
    pub conflicts: Vec<String>,
    pub unknowns: Vec<String>,
    pub used_field_ids: Vec<String>,
    pub used_sensitive_attributes: bool,
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
pub struct CoachAdvisorHandoff {
    pub id: String,
    pub offering_id: String,
    pub questions: Vec<String>,
    pub evidence_ids: Vec<String>,
    pub scenario_ids: Vec<String>,
    pub consent_confirmed: bool,
    pub status: String,
    pub advisor_response: Option<String>,
    pub created_at: String,
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
pub struct CoachGovernanceCase {
    pub id: String,
    pub report_type: String,
    pub target_id: String,
    pub evidence: String,
    pub serious: bool,
    pub temporary_measure: String,
    pub status: String,
    pub created_at: String,
    pub review_due_at: String,
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
pub struct CoachBoxScore {
    pub source_tiers: usize,
    pub sourced_profile_fields: usize,
    pub active_office_hours: usize,
    pub visible_feedback_aggregates: usize,
    pub hidden_feedback_aggregates: usize,
    pub fairness_status: String,
    pub sensitive_team_fields_used: usize,
    pub fabricated_advisor_replies: usize,
    pub governance_cases: usize,
    pub audit_events: usize,
    pub non_authoritative: bool,
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
pub struct CoachScoutingSession {
    pub schema_version: String,
    pub data_mode: String,
    pub selected_version_id: String,
    pub version_comparison: Option<CoachVersionComparison>,
    pub correction_cases: Vec<CoachCorrectionCase>,
    pub feedback_submissions: Vec<CoachFeedbackSubmission>,
    pub fairness_audits: Vec<CoachFairnessAudit>,
    pub selected_team_field_ids: Vec<String>,
    pub team_matches: Vec<CoachTeamMatch>,
    pub advisor_handoff: Option<CoachAdvisorHandoff>,
    pub acknowledged_reminder_ids: Vec<String>,
    pub governance_cases: Vec<CoachGovernanceCase>,
    pub hidden_target_ids: Vec<String>,
    pub read_only_cache_available: bool,
    pub authoritative: bool,
    pub audit: Vec<CoachAuditEvent>,
}

impl CoachScoutingSession {
    #[must_use]
    pub fn from_fixture(fixture: &CoachScoutingFixture) -> Self {
        Self {
            schema_version: SCHEMA_VERSION.to_owned(),
            data_mode: "demo_fixture".to_owned(),
            selected_version_id: "version-2026sp".to_owned(),
            version_comparison: None,
            correction_cases: Vec::new(),
            feedback_submissions: Vec::new(),
            fairness_audits: Vec::new(),
            selected_team_field_ids: fixture
                .team_fields
                .iter()
                .filter(|item| item.selectable && item.kind != "sensitive")
                .map(|item| item.id.clone())
                .collect(),
            team_matches: Vec::new(),
            advisor_handoff: None,
            acknowledged_reminder_ids: Vec::new(),
            governance_cases: Vec::new(),
            hidden_target_ids: Vec::new(),
            read_only_cache_available: true,
            authoritative: false,
            audit: fixture.audit.clone(),
        }
    }

    pub fn compare_versions(
        &mut self,
        fixture: &CoachScoutingFixture,
        from_version_id: &str,
        to_version_id: &str,
    ) -> Result<CoachVersionComparison, DomainError> {
        let from = fixture.version(from_version_id)?;
        let to = fixture.version(to_version_id)?;
        if from.course_id != to.course_id {
            return Err(DomainError::InvariantViolation(
                "Coach version comparison must stay within one course".to_owned(),
            ));
        }
        let mut changes = Vec::new();
        if from.assessment_summary != to.assessment_summary {
            changes.push(CoachVersionChange {
                id: "change-assessment".to_owned(),
                field: "考核构成".to_owned(),
                before: from.assessment_summary.clone(),
                after: to.assessment_summary.clone(),
                source_ids: merged_ids(&from.source_ids, &to.source_ids),
            });
        }
        if from.teaching_summary != to.teaching_summary {
            changes.push(CoachVersionChange {
                id: "change-teaching".to_owned(),
                field: "教学结构".to_owned(),
                before: from.teaching_summary.clone(),
                after: to.teaching_summary.clone(),
                source_ids: merged_ids(&from.source_ids, &to.source_ids),
            });
        }
        let same_assignment = from.instructor_assignment_id == to.instructor_assignment_id;
        if !same_assignment {
            changes.push(CoachVersionChange {
                id: "change-assignment".to_owned(),
                field: "任教关系".to_owned(),
                before: format!("{} · {}", from.term, from.instructor_assignment_id),
                after: format!("{} · {}", to.term, to.instructor_assignment_id),
                source_ids: merged_ids(&from.source_ids, &to.source_ids),
            });
        }
        let comparison = CoachVersionComparison {
            from_version_id: from_version_id.to_owned(),
            to_version_id: to_version_id.to_owned(),
            same_instructor_assignment: same_assignment,
            feedback_carried_forward: false,
            changes,
            warning: if same_assignment {
                "只比较同一任教关系的课程字段；学生反馈仍绑定原始学期。".to_owned()
            } else {
                "任教关系已经变化；历史反馈不会自动沿用到当前教师或开课。".to_owned()
            },
        };
        self.selected_version_id = to_version_id.to_owned();
        self.version_comparison = Some(comparison.clone());
        self.append_audit(
            "compare_versions",
            &format!("{from_version_id}->{to_version_id}"),
            "compared registered versions without carrying student feedback forward",
        );
        Ok(comparison)
    }

    pub fn submit_correction(
        &mut self,
        fixture: &CoachScoutingFixture,
        target_id: &str,
        correction_type: &str,
        statement: &str,
        evidence_ids: Vec<String>,
    ) -> Result<CoachCorrectionCase, DomainError> {
        if !matches!(correction_type, "context" | "update" | "dispute") {
            return Err(DomainError::InvariantViolation(
                "Coach correction type must be context, update or dispute".to_owned(),
            ));
        }
        require_non_empty("Coach correction target", target_id)?;
        if statement.trim().chars().count() < 12 || evidence_ids.is_empty() {
            return Err(DomainError::InvariantViolation(
                "Coach correction needs a concrete statement and registered evidence".to_owned(),
            ));
        }
        for evidence_id in &evidence_ids {
            fixture.source(evidence_id)?;
        }
        let sequence = self.correction_cases.len() + 1;
        let created_at = self.next_timestamp();
        let correction = CoachCorrectionCase {
            id: format!("correction-{sequence:03}"),
            target_id: target_id.to_owned(),
            requested_by: "teacher_fixture".to_owned(),
            correction_type: correction_type.to_owned(),
            statement: statement.trim().to_owned(),
            evidence_ids: deduplicated(evidence_ids),
            status: "submitted".to_owned(),
            created_at: created_at.clone(),
            review_due_at: "2026-07-26T20:00:00+08:00".to_owned(),
            history: vec![CoachCorrectionHistory {
                status: "submitted".to_owned(),
                occurred_at: created_at,
                note: "Fixture 教师提交；公开字段尚未被静默覆盖。".to_owned(),
            }],
        };
        self.correction_cases.push(correction.clone());
        self.append_audit(
            "submit_correction",
            &correction.id,
            "teacher context submitted with evidence; history preserved",
        );
        Ok(correction)
    }

    pub fn review_correction(
        &mut self,
        correction_id: &str,
        status: &str,
    ) -> Result<CoachCorrectionCase, DomainError> {
        if !matches!(status, "in_review" | "accepted" | "rejected") {
            return Err(DomainError::InvariantViolation(
                "Coach correction review status is unsupported".to_owned(),
            ));
        }
        let occurred_at = self.next_timestamp();
        let correction = self
            .correction_cases
            .iter_mut()
            .find(|item| item.id == correction_id)
            .ok_or_else(|| {
                DomainError::InvariantViolation(format!(
                    "Coach correction not found: {correction_id}"
                ))
            })?;
        let valid = matches!(
            (correction.status.as_str(), status),
            ("submitted", "in_review") | ("in_review", "accepted" | "rejected")
        );
        if !valid {
            return Err(DomainError::InvariantViolation(
                "Coach correction status transition is invalid".to_owned(),
            ));
        }
        correction.status = status.to_owned();
        correction.history.push(CoachCorrectionHistory {
            status: status.to_owned(),
            occurred_at,
            note: match status {
                "accepted" => "已接受为新上下文；原版本仍可追溯。",
                "rejected" => "人工复核未接受；理由保留在工单。",
                _ => "已进入人工复核；不生成教师人格结论。",
            }
            .to_owned(),
        });
        let result = correction.clone();
        self.append_audit(
            "review_correction",
            correction_id,
            &format!("correction moved to {status}; prior history retained"),
        );
        Ok(result)
    }

    pub fn submit_feedback(
        &mut self,
        fixture: &CoachScoutingFixture,
        dimension: &str,
        concrete_experience: &str,
        suggested_action: &str,
        consent_to_aggregate: bool,
    ) -> Result<CoachFeedbackSubmission, DomainError> {
        if !matches!(
            dimension,
            "assignment_clarity"
                | "feedback_timeliness"
                | "workload_support"
                | "group_structure"
                | "accessibility"
        ) {
            return Err(DomainError::InvariantViolation(
                "Coach feedback dimension is unsupported".to_owned(),
            ));
        }
        if concrete_experience.trim().chars().count() < 12
            || suggested_action.trim().chars().count() < 8
        {
            return Err(DomainError::InvariantViolation(
                "Coach feedback needs a concrete experience and actionable suggestion".to_owned(),
            ));
        }
        let combined = format!("{concrete_experience} {suggested_action}");
        let held = [
            "人品", "垃圾", "变态", "最差", "废物", "外貌", "性别", "国籍",
        ]
        .iter()
        .any(|needle| combined.contains(needle));
        let sequence = self.feedback_submissions.len() + 1;
        let feedback = CoachFeedbackSubmission {
            id: format!("feedback-{sequence:03}"),
            offering_id: fixture.course.offering_id.clone(),
            dimension: dimension.to_owned(),
            concrete_experience: concrete_experience.trim().to_owned(),
            suggested_action: suggested_action.trim().to_owned(),
            consent_to_aggregate,
            safety_status: if held { "held_for_review" } else { "eligible" }.to_owned(),
            created_at: self.next_timestamp(),
        };
        self.feedback_submissions.push(feedback.clone());
        self.append_audit(
            if held {
                "hold_feedback"
            } else {
                "submit_feedback"
            },
            &feedback.id,
            if held {
                "feedback held before aggregation for human governance review"
            } else {
                "specific actionable feedback stored privately pending threshold"
            },
        );
        Ok(feedback)
    }

    #[must_use]
    pub fn feedback_aggregates(
        &self,
        fixture: &CoachScoutingFixture,
    ) -> Vec<CoachFeedbackAggregate> {
        fixture
            .feedback_aggregates
            .iter()
            .cloned()
            .map(|mut aggregate| {
                aggregate.published = aggregate.sample_size >= aggregate.minimum_sample
                    && !self.hidden_target_ids.contains(&aggregate.id);
                aggregate
            })
            .collect()
    }

    pub fn run_fairness_audit(&mut self, fixture: &CoachScoutingFixture) -> CoachFairnessAudit {
        let sensitive_selected = fixture.team_fields.iter().any(|field| {
            field.kind == "sensitive" && self.selected_team_field_ids.contains(&field.id)
        });
        let aggregates = self.feedback_aggregates(fixture);
        let checks = vec![
            coach_fairness_check(
                "fair-course-not-person",
                "课程特征替代人格评分",
                fixture.invariants.no_teacher_rating && fixture.invariants.no_personality_labels,
                "无星级、热度、人格标签或教师综合分。",
            ),
            coach_fairness_check(
                "fair-version-boundary",
                "任教关系与版本隔离",
                fixture.invariants.no_feedback_carry_forward,
                "旧反馈绑定原开课，不自动归因到新教师或新学期。",
            ),
            coach_fairness_check(
                "fair-sample-threshold",
                "反馈最小样本",
                aggregates
                    .iter()
                    .all(|item| item.published == (item.sample_size >= item.minimum_sample)),
                "不足最小样本的聚合保持隐藏，不输出方向性结论。",
            ),
            coach_fairness_check(
                "fair-team-sensitive",
                "组队不使用敏感身份",
                !sensitive_selected && fixture.invariants.no_sensitive_team_matching,
                "姓名、性别、国籍、健康、门禁和支付历史不参与匹配。",
            ),
            coach_fairness_check(
                "fair-advisor-truth",
                "不伪造导师意见",
                fixture.invariants.no_fabricated_advisor_reply
                    && self
                        .advisor_handoff
                        .as_ref()
                        .is_none_or(|handoff| handoff.advisor_response.is_none()),
                "Handoff 只整理学生问题和证据，advisor_response 始终为空。",
            ),
        ];
        let passed = checks.iter().all(|check| check.passed);
        let sequence = self.fairness_audits.len() + 1;
        let audit = CoachFairnessAudit {
            id: format!("fairness-{sequence:03}"),
            status: if passed { "pass" } else { "degraded" }.to_owned(),
            sort_mode: if passed {
                "explainable_match"
            } else {
                "time_and_topic"
            }
            .to_owned(),
            checks,
            sensitive_attributes: vec![
                "姓名".to_owned(),
                "性别".to_owned(),
                "国籍".to_owned(),
                "健康".to_owned(),
            ],
            proxy_fields: vec![
                "门禁轨迹".to_owned(),
                "支付历史".to_owned(),
                "家庭背景".to_owned(),
            ],
            ran_at: self.next_timestamp(),
        };
        self.fairness_audits.push(audit.clone());
        self.append_audit(
            "fairness_audit",
            &audit.id,
            if passed {
                "five fairness invariants passed"
            } else {
                "audit degraded recommendation to time-and-topic sorting"
            },
        );
        audit
    }

    pub fn replace_team_selection(
        &mut self,
        fixture: &CoachScoutingFixture,
        field_ids: Vec<String>,
    ) -> Result<Vec<String>, DomainError> {
        if field_ids.is_empty() {
            return Err(DomainError::InvariantViolation(
                "Coach team matching needs at least one selected field".to_owned(),
            ));
        }
        let unique = field_ids.iter().collect::<HashSet<_>>();
        if unique.len() != field_ids.len() {
            return Err(DomainError::InvariantViolation(
                "Coach team field selection cannot contain duplicates".to_owned(),
            ));
        }
        for field_id in &field_ids {
            let field = fixture
                .team_fields
                .iter()
                .find(|item| item.id == *field_id)
                .ok_or_else(|| {
                    DomainError::InvariantViolation(format!(
                        "Coach team field not found: {field_id}"
                    ))
                })?;
            if !field.selectable || field.kind == "sensitive" {
                return Err(DomainError::InvariantViolation(
                    "Sensitive Coach team fields cannot enter matching".to_owned(),
                ));
            }
        }
        self.selected_team_field_ids = field_ids;
        self.team_matches.clear();
        self.append_audit(
            "select_team_profile",
            "team-profile",
            "student selected private fields for this match only",
        );
        Ok(self.selected_team_field_ids.clone())
    }

    pub fn run_team_matching(
        &mut self,
        fixture: &CoachScoutingFixture,
    ) -> Result<Vec<CoachTeamMatch>, DomainError> {
        let fields = self
            .selected_team_field_ids
            .iter()
            .map(|field_id| {
                fixture
                    .team_fields
                    .iter()
                    .find(|item| item.id == *field_id)
                    .ok_or_else(|| {
                        DomainError::InvariantViolation(format!(
                            "Coach team field not found: {field_id}"
                        ))
                    })
            })
            .collect::<Result<Vec<_>, _>>()?;
        if fields.is_empty() || fields.iter().any(|field| field.kind == "sensitive") {
            return Err(DomainError::InvariantViolation(
                "Coach team matching cannot use an empty or sensitive profile".to_owned(),
            ));
        }
        let values = fields
            .iter()
            .map(|field| field.value.as_str())
            .collect::<HashSet<_>>();
        let availability = if values.contains("5_hours") {
            Some(5_u32)
        } else {
            None
        };
        let matches = fixture
            .team_needs
            .iter()
            .map(|need| {
                let mut reasons = need
                    .skills
                    .iter()
                    .filter(|skill| values.contains(skill.as_str()))
                    .map(|skill| format!("已披露技能 {skill} 对应角色缺口"))
                    .collect::<Vec<_>>();
                if need
                    .communication
                    .iter()
                    .any(|item| values.contains(item.as_str()))
                {
                    reasons.push("沟通偏好与团队方式一致".to_owned());
                }
                let conflicts = availability
                    .filter(|hours| *hours < need.hours_per_week)
                    .map_or_else(Vec::new, |hours| {
                        vec![format!(
                            "需要每周 {} 小时；当前只披露 {hours} 小时",
                            need.hours_per_week
                        )]
                    });
                let unknowns = if availability.is_none() {
                    vec!["未披露可用时间".to_owned()]
                } else {
                    Vec::new()
                };
                CoachTeamMatch {
                    team_need_id: need.id.clone(),
                    status: if reasons.is_empty() {
                        "insufficient_data"
                    } else if conflicts.is_empty() && unknowns.is_empty() {
                        "ready_to_discuss"
                    } else {
                        "needs_confirmation"
                    }
                    .to_owned(),
                    reasons,
                    conflicts,
                    unknowns,
                    used_field_ids: self.selected_team_field_ids.clone(),
                    used_sensitive_attributes: false,
                }
            })
            .collect::<Vec<_>>();
        self.team_matches.clone_from(&matches);
        self.append_audit(
            "team_match",
            &fixture.course.offering_id,
            &format!(
                "generated {} explainable matches without sensitive attributes",
                matches.len()
            ),
        );
        Ok(matches)
    }

    pub fn build_advisor_handoff(
        &mut self,
        fixture: &CoachScoutingFixture,
        questions: Vec<String>,
        evidence_ids: Vec<String>,
        scenario_ids: Vec<String>,
        consent_confirmed: bool,
    ) -> Result<CoachAdvisorHandoff, DomainError> {
        let questions = questions
            .into_iter()
            .map(|question| question.trim().to_owned())
            .filter(|question| !question.is_empty())
            .collect::<Vec<_>>();
        if !consent_confirmed || questions.is_empty() {
            return Err(DomainError::InvariantViolation(
                "Coach Advisor Handoff needs student confirmation and a real question".to_owned(),
            ));
        }
        for evidence_id in &evidence_ids {
            fixture.source(evidence_id)?;
        }
        let handoff = CoachAdvisorHandoff {
            id: format!("handoff-{:03}", self.audit.len() + 1),
            offering_id: fixture.course.offering_id.clone(),
            questions,
            evidence_ids: deduplicated(evidence_ids),
            scenario_ids: deduplicated(scenario_ids),
            consent_confirmed: true,
            status: "ready_for_student".to_owned(),
            advisor_response: None,
            created_at: self.next_timestamp(),
        };
        self.advisor_handoff = Some(handoff.clone());
        self.append_audit(
            "build_advisor_handoff",
            &handoff.id,
            "student-approved questions and evidence prepared; no advisor reply fabricated",
        );
        Ok(handoff)
    }

    pub fn acknowledge_reminder(
        &mut self,
        fixture: &CoachScoutingFixture,
        reminder_id: &str,
    ) -> Result<Vec<String>, DomainError> {
        if !fixture.reminders.iter().any(|item| item.id == reminder_id) {
            return Err(DomainError::InvariantViolation(format!(
                "Coach expectation reminder not found: {reminder_id}"
            )));
        }
        if !self
            .acknowledged_reminder_ids
            .iter()
            .any(|item| item == reminder_id)
        {
            self.acknowledged_reminder_ids.push(reminder_id.to_owned());
            self.append_audit(
                "acknowledge_expectation",
                reminder_id,
                "student acknowledged reminder without granting institutional approval",
            );
        }
        Ok(self.acknowledged_reminder_ids.clone())
    }

    pub fn report_governance(
        &mut self,
        fixture: &CoachScoutingFixture,
        report_type: &str,
        target_id: &str,
        evidence: &str,
        serious: bool,
    ) -> Result<CoachGovernanceCase, DomainError> {
        if !matches!(
            report_type,
            "harassment" | "misinformation" | "privacy" | "discrimination"
        ) {
            return Err(DomainError::InvariantViolation(
                "Coach governance report type is unsupported".to_owned(),
            ));
        }
        if evidence.trim().chars().count() < 8 {
            return Err(DomainError::InvariantViolation(
                "Coach governance report needs reviewable evidence".to_owned(),
            ));
        }
        if serious && !fixture.invariants.severe_content_hidden_first {
            return Err(DomainError::InvariantViolation(
                "Serious Coach content must be hidden before review".to_owned(),
            ));
        }
        let sequence = self.governance_cases.len() + 1;
        let governance_case = CoachGovernanceCase {
            id: format!("governance-{sequence:03}"),
            report_type: report_type.to_owned(),
            target_id: target_id.to_owned(),
            evidence: evidence.trim().to_owned(),
            serious,
            temporary_measure: if serious {
                "hidden_pending_review"
            } else {
                "none"
            }
            .to_owned(),
            status: if serious { "under_review" } else { "submitted" }.to_owned(),
            created_at: self.next_timestamp(),
            review_due_at: if serious {
                "2026-07-25T20:00:00+08:00"
            } else {
                "2026-07-27T20:00:00+08:00"
            }
            .to_owned(),
        };
        if serious && !self.hidden_target_ids.iter().any(|item| item == target_id) {
            self.hidden_target_ids.push(target_id.to_owned());
        }
        self.governance_cases.push(governance_case.clone());
        self.append_audit(
            "report_governance",
            &governance_case.id,
            if serious {
                "serious content hidden pending time-bound human review"
            } else {
                "report submitted for time-bound human review"
            },
        );
        Ok(governance_case)
    }

    #[must_use]
    pub fn box_score(&self, fixture: &CoachScoutingFixture) -> CoachBoxScore {
        let aggregates = self.feedback_aggregates(fixture);
        CoachBoxScore {
            source_tiers: fixture
                .sources
                .iter()
                .map(|item| item.tier.as_str())
                .collect::<HashSet<_>>()
                .len(),
            sourced_profile_fields: 1
                + fixture.course.objectives.len()
                + fixture.course.textbooks.len()
                + fixture.course.prerequisites.len()
                + fixture.course.assessments.len(),
            active_office_hours: fixture
                .office_hours
                .iter()
                .filter(|item| item.status == "active")
                .count(),
            visible_feedback_aggregates: aggregates.iter().filter(|item| item.published).count(),
            hidden_feedback_aggregates: aggregates.iter().filter(|item| !item.published).count(),
            fairness_status: self
                .fairness_audits
                .last()
                .map_or_else(|| "not_run".to_owned(), |item| item.status.clone()),
            sensitive_team_fields_used: 0,
            fabricated_advisor_replies: self
                .advisor_handoff
                .as_ref()
                .and_then(|handoff| handoff.advisor_response.as_ref())
                .map_or(0, |_| 1),
            governance_cases: self.governance_cases.len(),
            audit_events: self.audit.len(),
            non_authoritative: true,
        }
    }

    fn append_audit(&mut self, action: &str, target_id: &str, detail: &str) {
        let previous = self.audit.last();
        let sequence = previous.map_or(1, |item| item.sequence + 1);
        let previous_event_hash = previous.map(|item| item.event_hash.clone());
        self.audit.push(CoachAuditEvent {
            id: format!("coach-event-{sequence:03}"),
            sequence,
            action: action.to_owned(),
            target_id: target_id.to_owned(),
            detail: detail.to_owned(),
            occurred_at: self.next_timestamp(),
            previous_event_hash,
            event_hash: format!("fnv1a-coach-event-{sequence:03}"),
        });
    }

    fn next_timestamp(&self) -> String {
        let minute = (45 + self.audit.len() + 1) % 60;
        format!("2026-07-24T20:{minute:02}:00+08:00")
    }
}

fn validate_sourced_field(
    field: &CoachSourcedField,
    source_ids: &HashSet<&str>,
) -> Result<(), DomainError> {
    require_non_empty("Coach sourced field value", &field.value)?;
    if !source_ids.contains(field.source_id.as_str()) {
        return Err(DomainError::InvariantViolation(format!(
            "Coach field {} references an unknown source",
            field.id
        )));
    }
    Ok(())
}

fn validate_coach_audit(events: &[CoachAuditEvent]) -> Result<(), DomainError> {
    if events.is_empty() {
        return Err(DomainError::InvariantViolation(
            "Coach & Scouting needs an initial audit event".to_owned(),
        ));
    }
    for (index, event) in events.iter().enumerate() {
        let expected_previous = index
            .checked_sub(1)
            .and_then(|previous| events.get(previous))
            .map(|previous| previous.event_hash.as_str());
        if event.sequence != u64::try_from(index + 1).unwrap_or(u64::MAX)
            || event.previous_event_hash.as_deref() != expected_previous
        {
            return Err(DomainError::InvariantViolation(
                "Coach audit must remain an append-only chain".to_owned(),
            ));
        }
    }
    Ok(())
}

fn unique_coach_ids<'a>(
    ids: impl Iterator<Item = &'a str>,
    expected_len: usize,
    message: &str,
) -> Result<HashSet<&'a str>, DomainError> {
    let ids = ids.collect::<HashSet<_>>();
    if ids.len() == expected_len {
        Ok(ids)
    } else {
        Err(DomainError::InvariantViolation(message.to_owned()))
    }
}

fn coach_fairness_check(id: &str, label: &str, passed: bool, detail: &str) -> CoachFairnessCheck {
    CoachFairnessCheck {
        id: id.to_owned(),
        label: label.to_owned(),
        passed,
        detail: detail.to_owned(),
    }
}

fn merged_ids(left: &[String], right: &[String]) -> Vec<String> {
    deduplicated(left.iter().chain(right.iter()).cloned().collect())
}

fn deduplicated(values: Vec<String>) -> Vec<String> {
    let mut seen = HashSet::new();
    values
        .into_iter()
        .filter(|value| seen.insert(value.clone()))
        .collect()
}

#[cfg(test)]
mod tests {
    use super::*;

    fn fixture() -> CoachScoutingFixture {
        serde_json::from_str(include_str!(
            "../../../fixtures/v1/coach-scouting.demo.json"
        ))
        .expect("Coach & Scouting fixture must deserialize")
    }

    #[test]
    fn fixture_separates_sources_versions_and_people() {
        let fixture = fixture();
        fixture.validate().expect("fixture must satisfy invariants");
        assert_eq!(fixture.sources.len(), 5);
        assert_ne!(
            fixture.course.course_id,
            fixture.course.instructor_assignment_id
        );
        assert!(
            fixture
                .office_hours
                .iter()
                .any(|item| item.status == "expired")
        );
        assert!(
            fixture
                .feedback_aggregates
                .iter()
                .any(|item| !item.published)
        );
    }

    #[test]
    fn correction_and_version_film_preserve_history() {
        let fixture = fixture();
        let mut session = CoachScoutingSession::from_fixture(&fixture);
        let comparison = session
            .compare_versions(&fixture, "version-2025sp", "version-2026sp")
            .expect("comparison should work");
        assert!(!comparison.feedback_carried_forward);
        assert_eq!(comparison.changes.len(), 3);
        let correction = session
            .submit_correction(
                &fixture,
                "feedback-method",
                "context",
                "反馈窗口会随任务类型变化，不承诺固定返回日。",
                vec!["src-teacher-confirmed".to_owned()],
            )
            .expect("correction should be submitted");
        session
            .review_correction(&correction.id, "in_review")
            .expect("review starts");
        let accepted = session
            .review_correction(&correction.id, "accepted")
            .expect("review finishes");
        assert_eq!(accepted.history.len(), 3);
        assert_eq!(accepted.status, "accepted");
    }

    #[test]
    fn feedback_fairness_and_team_matching_are_bounded() {
        let fixture = fixture();
        let mut session = CoachScoutingSession::from_fixture(&fixture);
        let safe = session
            .submit_feedback(
                &fixture,
                "feedback_timeliness",
                "两次实验报告的返回时间存在明显差异。",
                "发布任务时同时说明预计反馈窗口。",
                true,
            )
            .expect("feedback should work");
        assert_eq!(safe.safety_status, "eligible");
        let matches = session
            .run_team_matching(&fixture)
            .expect("team matching should work");
        assert_eq!(matches.len(), 2);
        assert!(matches.iter().all(|item| !item.used_sensitive_attributes));
        let fairness = session.run_fairness_audit(&fixture);
        assert_eq!(fairness.status, "pass");
        assert_eq!(fairness.checks.len(), 5);
    }

    #[test]
    fn advisor_and_governance_keep_truth_and_hide_serious_content() {
        let fixture = fixture();
        let mut session = CoachScoutingSession::from_fixture(&fixture);
        let handoff = session
            .build_advisor_handoff(
                &fixture,
                vec!["当前先修缺口是否需要在正式选课前补齐？".to_owned()],
                vec!["src-official-syllabus".to_owned()],
                vec!["balanced-plan".to_owned()],
                true,
            )
            .expect("handoff should work");
        assert!(handoff.advisor_response.is_none());
        let report = session
            .report_governance(
                &fixture,
                "privacy",
                "aggregate-clarity",
                "聚合文本包含可识别个人实验描述。",
                true,
            )
            .expect("report should work");
        assert_eq!(report.temporary_measure, "hidden_pending_review");
        let box_score = session.box_score(&fixture);
        assert_eq!(box_score.fabricated_advisor_replies, 0);
        assert_eq!(box_score.visible_feedback_aggregates, 0);
        assert_eq!(box_score.hidden_feedback_aggregates, 2);
    }
}

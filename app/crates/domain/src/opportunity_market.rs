use crate::{DomainError, SCHEMA_VERSION, require_non_empty, require_supported_schema};
use serde::{Deserialize, Serialize};
use std::collections::HashSet;

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
pub struct OpportunityCost {
    pub amount: Option<f64>,
    pub currency: Option<String>,
    pub description: String,
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
pub struct OpportunityRightsGate {
    pub participant_status: String,
    pub permission_status: String,
    pub allowed_scope: Vec<String>,
    pub required_actions: Vec<String>,
    pub no_endorsement: bool,
    pub evidence_url: String,
    pub last_reviewed_at: String,
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
pub struct OpportunityRecord {
    pub id: String,
    pub title: String,
    pub summary: String,
    pub provider: String,
    pub scope: String,
    #[serde(default)]
    pub search_aliases: Vec<String>,
    pub category: String,
    pub pack_id: String,
    pub source_url: String,
    pub source_version: String,
    pub fetched_at: String,
    pub verified_at: Option<String>,
    pub deadline: Option<String>,
    pub location: String,
    pub cost: OpportunityCost,
    pub benefits: Vec<String>,
    pub obligations: Vec<String>,
    pub risks: Vec<String>,
    pub eligibility_rule_ids: Vec<String>,
    pub eligibility_summary: String,
    pub status: String,
    pub correction_route: String,
    pub external_application_url: String,
    pub paid_ranking_factor: f64,
    pub random_allocation: bool,
    pub auction_enabled: bool,
    pub created_at: String,
    pub updated_at: String,
    #[serde(default)]
    pub rights_gate: Option<OpportunityRightsGate>,
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
pub struct OpportunityPack {
    pub id: String,
    pub title: String,
    pub description: String,
    pub opportunity_ids: Vec<String>,
    pub transparent: bool,
    pub paid_random: bool,
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
#[serde(untagged)]
pub enum OpportunityProfileValue {
    Text(String),
    Number(f64),
    TextList(Vec<String>),
}

impl OpportunityProfileValue {
    fn is_unknown(&self) -> bool {
        matches!(self, Self::Text(value) if value == "unknown")
    }

    fn matches(&self, operator: &str, expected: &Self) -> bool {
        match (operator, self, expected) {
            ("gte", Self::Number(actual), Self::Number(minimum)) => actual >= minimum,
            ("lte", Self::Number(actual), Self::Number(maximum)) => actual <= maximum,
            ("contains" | "includes", Self::Text(actual), Self::Text(needle)) => {
                actual.to_lowercase().contains(&needle.to_lowercase())
            }
            ("contains" | "includes", Self::TextList(actual), Self::Text(needle)) => actual
                .iter()
                .any(|item| item.to_lowercase().contains(&needle.to_lowercase())),
            ("eq", Self::Text(actual), Self::Text(expected)) => actual == expected,
            ("eq", Self::Number(actual), Self::Number(expected)) => {
                (actual - expected).abs() < f64::EPSILON
            }
            ("eq", Self::TextList(actual), Self::TextList(expected)) => actual == expected,
            _ => false,
        }
    }
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
pub struct OpportunityEligibilityRule {
    pub id: String,
    pub opportunity_id: String,
    pub field_id: String,
    pub operator: String,
    pub expected_value: OpportunityProfileValue,
    pub description: String,
    pub source_ref: String,
    pub required: bool,
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
pub struct OpportunityProfileField {
    pub id: String,
    pub label: String,
    pub kind: String,
    pub value: OpportunityProfileValue,
    pub value_label: String,
    pub authority: String,
    pub source_id: Option<String>,
    pub verified_at: Option<String>,
    pub expires_at: Option<String>,
    pub private: bool,
    pub selectable: bool,
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
pub struct OpportunityEntitlement {
    pub id: String,
    pub title: String,
    pub provider: String,
    pub scope: String,
    pub conditions: Vec<String>,
    pub valid_from: String,
    pub expires_at: String,
    pub status: String,
    pub source_id: String,
    pub purchasable_qualification: bool,
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
pub struct OpportunityCapacityDimension {
    pub id: String,
    pub label: String,
    pub available: f64,
    pub committed: f64,
    pub unit: String,
    pub source_label: String,
    pub can_purchase_eligibility: bool,
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
pub struct OpportunityPathway {
    pub id: String,
    pub title: String,
    pub pathway_type: String,
    pub inherited_credits: String,
    pub estimated_time: String,
    pub estimated_cost: String,
    pub assumptions: Vec<String>,
    pub risks: Vec<String>,
    pub rollback_point: String,
    pub approval_path: Vec<String>,
    pub authoritative: bool,
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
pub struct OpportunityPortfolioArtifact {
    pub id: String,
    pub title: String,
    pub source_module: String,
    pub source_id: String,
    pub review_status: String,
    pub includes_original_material: bool,
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
pub struct OpportunityNotification {
    pub id: String,
    pub opportunity_id: String,
    pub kind: String,
    pub message: String,
    pub created_at: String,
    pub read: bool,
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
pub struct OpportunityAuditEvent {
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
pub struct OpportunityInvariants {
    pub no_paid_ranking: bool,
    pub no_random_qualification: bool,
    pub no_human_auction: bool,
    pub no_auto_apply: bool,
    pub no_fomo_countdown: bool,
    pub no_composite_eligibility_score: bool,
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
pub struct OpportunityMarketFixture {
    pub schema_version: String,
    pub data_mode: String,
    pub generated_at: String,
    pub last_updated_at: String,
    pub student_id: String,
    pub profile_visibility: String,
    pub selected_profile_field_ids: Vec<String>,
    pub forbidden_profile_field_ids: Vec<String>,
    pub opportunities: Vec<OpportunityRecord>,
    pub packs: Vec<OpportunityPack>,
    pub rules: Vec<OpportunityEligibilityRule>,
    pub profile_fields: Vec<OpportunityProfileField>,
    pub entitlements: Vec<OpportunityEntitlement>,
    pub capacity: Vec<OpportunityCapacityDimension>,
    pub pathways: Vec<OpportunityPathway>,
    pub portfolio_artifacts: Vec<OpportunityPortfolioArtifact>,
    pub notifications: Vec<OpportunityNotification>,
    pub audit: Vec<OpportunityAuditEvent>,
    pub invariants: OpportunityInvariants,
}

impl OpportunityMarketFixture {
    pub fn validate(&self) -> Result<(), DomainError> {
        require_supported_schema(&self.schema_version)?;
        if self.data_mode != "demo_fixture" || self.profile_visibility != "private" {
            return Err(DomainError::InvariantViolation(
                "Opportunity Market must remain an explicitly private demo_fixture".to_owned(),
            ));
        }
        if !(5..=20).contains(&self.opportunities.len()) {
            return Err(DomainError::InvariantViolation(
                "Opportunity Market fixture must contain 5 to 20 opportunities".to_owned(),
            ));
        }
        let opportunity_ids = unique_ids(
            self.opportunities.iter().map(|item| item.id.as_str()),
            self.opportunities.len(),
            "Opportunity Market opportunity IDs must be unique",
        )?;
        let rule_ids = unique_ids(
            self.rules.iter().map(|item| item.id.as_str()),
            self.rules.len(),
            "Opportunity Market rule IDs must be unique",
        )?;
        let field_ids = unique_ids(
            self.profile_fields.iter().map(|item| item.id.as_str()),
            self.profile_fields.len(),
            "Opportunity Market Profile field IDs must be unique",
        )?;
        let pack_ids = unique_ids(
            self.packs.iter().map(|item| item.id.as_str()),
            self.packs.len(),
            "Opportunity Market pack IDs must be unique",
        )?;

        if !self
            .opportunities
            .iter()
            .any(|item| item.status == "expired")
        {
            return Err(DomainError::InvariantViolation(
                "Opportunity Market needs an explicit expired example".to_owned(),
            ));
        }
        for opportunity in &self.opportunities {
            require_non_empty("opportunity title", &opportunity.title)?;
            require_non_empty("opportunity source version", &opportunity.source_version)?;
            if !matches!(opportunity.scope.as_str(), "campus" | "external") {
                return Err(DomainError::InvariantViolation(
                    "each Opportunity Market item must declare campus or external scope".to_owned(),
                ));
            }
            require_non_empty(
                "opportunity correction route",
                &opportunity.correction_route,
            )?;
            if !opportunity.source_url.starts_with("https://")
                || !opportunity.external_application_url.starts_with("https://")
                || opportunity.benefits.is_empty()
                || opportunity.obligations.is_empty()
                || opportunity.risks.is_empty()
                || opportunity.eligibility_rule_ids.is_empty()
                || !pack_ids.contains(opportunity.pack_id.as_str())
            {
                return Err(DomainError::InvariantViolation(
                    "each Opportunity Market item needs sources, rules, benefits, obligations, risks and a declared pack"
                        .to_owned(),
                ));
            }
            if opportunity.paid_ranking_factor != 0.0
                || opportunity.random_allocation
                || opportunity.auction_enabled
            {
                return Err(DomainError::InvariantViolation(
                    "paid ranking, random qualification and human auction are forbidden".to_owned(),
                ));
            }
            if let Some(rights_gate) = &opportunity.rights_gate {
                let supported_status = matches!(
                    rights_gate.permission_status.as_str(),
                    "pending_official_confirmation" | "confirmed_for_project" | "not_permitted"
                );
                if !rights_gate.no_endorsement
                    || !rights_gate.evidence_url.starts_with("https://")
                    || rights_gate.required_actions.is_empty()
                    || !supported_status
                    || (rights_gate.permission_status == "pending_official_confirmation"
                        && !rights_gate.allowed_scope.is_empty())
                {
                    return Err(DomainError::InvariantViolation(
                        "Opportunity rights gates require evidence, no-endorsement and no allowed scope while permission is pending"
                            .to_owned(),
                    ));
                }
            }
            for rule_id in &opportunity.eligibility_rule_ids {
                let rule = self
                    .rules
                    .iter()
                    .find(|rule| rule.id == *rule_id)
                    .ok_or_else(|| {
                        DomainError::InvariantViolation(format!(
                            "opportunity {} references an unknown eligibility rule",
                            opportunity.id
                        ))
                    })?;
                if rule.opportunity_id != opportunity.id || !rule_ids.contains(rule.id.as_str()) {
                    return Err(DomainError::InvariantViolation(
                        "eligibility rules must belong to their declared opportunity".to_owned(),
                    ));
                }
            }
        }
        if self.packs.len() < 2
            || self.packs.iter().any(|pack| {
                !pack.transparent
                    || pack.paid_random
                    || pack.opportunity_ids.is_empty()
                    || pack
                        .opportunity_ids
                        .iter()
                        .any(|id| !opportunity_ids.contains(id.as_str()))
            })
        {
            return Err(DomainError::InvariantViolation(
                "Opportunity packs must be transparent, complete and non-random".to_owned(),
            ));
        }
        if self.rules.iter().any(|rule| {
            !opportunity_ids.contains(rule.opportunity_id.as_str())
                || !field_ids.contains(rule.field_id.as_str())
                || !matches!(
                    rule.operator.as_str(),
                    "eq" | "gte" | "lte" | "contains" | "includes"
                )
                || !rule.source_ref.starts_with("https://")
        }) {
            return Err(DomainError::InvariantViolation(
                "Opportunity Market rules must have known opportunities, fields, operators and sources"
                    .to_owned(),
            ));
        }
        if self
            .profile_fields
            .iter()
            .any(|field| !field.private || !field.selectable)
        {
            return Err(DomainError::InvariantViolation(
                "Opportunity Profile fields must remain private and selectively enabled".to_owned(),
            ));
        }
        let required_forbidden = [
            "health",
            "family",
            "financial_account",
            "campus_access_log",
            "payment_history",
        ];
        if required_forbidden.iter().any(|forbidden| {
            !self
                .forbidden_profile_field_ids
                .iter()
                .any(|item| item == forbidden)
        }) || self.selected_profile_field_ids.iter().any(|id| {
            self.forbidden_profile_field_ids.contains(id) || !field_ids.contains(id.as_str())
        }) {
            return Err(DomainError::InvariantViolation(
                "forbidden or unknown Profile fields cannot enter matching".to_owned(),
            ));
        }
        if self
            .entitlements
            .iter()
            .any(|item| item.purchasable_qualification)
            || self
                .capacity
                .iter()
                .any(|item| item.can_purchase_eligibility || item.committed > item.available)
        {
            return Err(DomainError::InvariantViolation(
                "wallet or capacity cannot purchase eligibility".to_owned(),
            ));
        }
        let capacity_ids = self
            .capacity
            .iter()
            .map(|item| item.id.as_str())
            .collect::<HashSet<_>>();
        if capacity_ids
            != ["time", "energy", "lab_slot", "funding"]
                .into_iter()
                .collect()
        {
            return Err(DomainError::InvariantViolation(
                "Opportunity Market needs time, energy, lab_slot and funding capacity".to_owned(),
            ));
        }
        let pathway_types = self
            .pathways
            .iter()
            .map(|item| item.pathway_type.as_str())
            .collect::<HashSet<_>>();
        if pathway_types
            != ["major_change", "exchange", "accelerated_study"]
                .into_iter()
                .collect()
            || self.pathways.iter().any(|item| {
                item.authoritative
                    || item.rollback_point.trim().is_empty()
                    || item.approval_path.is_empty()
            })
        {
            return Err(DomainError::InvariantViolation(
                "A/B/C pathways must be reversible, non-authoritative scenarios".to_owned(),
            ));
        }
        if self.portfolio_artifacts.is_empty()
            || self.portfolio_artifacts.iter().any(|item| {
                item.includes_original_material
                    || !matches!(item.source_module.as_str(), "F-001" | "F-005")
            })
        {
            return Err(DomainError::InvariantViolation(
                "portfolio exports must keep source references without original course material"
                    .to_owned(),
            ));
        }
        let invariants = &self.invariants;
        if !invariants.no_paid_ranking
            || !invariants.no_random_qualification
            || !invariants.no_human_auction
            || !invariants.no_auto_apply
            || !invariants.no_fomo_countdown
            || !invariants.no_composite_eligibility_score
        {
            return Err(DomainError::InvariantViolation(
                "Opportunity Market anti-manipulation invariants must all be enabled".to_owned(),
            ));
        }
        validate_opportunity_audit(&self.audit)?;
        Ok(())
    }

    fn opportunity(&self, opportunity_id: &str) -> Result<&OpportunityRecord, DomainError> {
        self.opportunities
            .iter()
            .find(|item| item.id == opportunity_id)
            .ok_or_else(|| {
                DomainError::InvariantViolation(format!(
                    "Opportunity Market opportunity not found: {opportunity_id}"
                ))
            })
    }

    fn field(&self, field_id: &str) -> Option<&OpportunityProfileField> {
        self.profile_fields.iter().find(|item| item.id == field_id)
    }
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
pub struct OpportunityEligibilityResult {
    pub rule_id: String,
    pub rule_description: String,
    pub status: String,
    pub evidence_field_id: Option<String>,
    pub evidence_label: String,
    pub next_step: String,
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
pub struct OpportunityEligibilityCheck {
    pub opportunity_id: String,
    pub checked_at: String,
    pub used_profile_field_ids: Vec<String>,
    pub results: Vec<OpportunityEligibilityResult>,
    pub summary: String,
    pub has_composite_score: bool,
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
pub struct OpportunityMatchResult {
    pub opportunity_id: String,
    pub fit_band: String,
    pub reasons: Vec<String>,
    pub conflicts: Vec<String>,
    pub unknowns: Vec<String>,
    pub generated_at: String,
    pub ranking_basis: String,
    pub paid_influence: bool,
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
pub struct OpportunitySavedItem {
    pub opportunity_id: String,
    pub note: String,
    pub saved_at: String,
    pub intent_status: String,
    pub updated_at: String,
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
pub struct OpportunityDisclosureGrant {
    pub id: String,
    pub opportunity_id: String,
    pub recipient: String,
    pub purpose: String,
    pub profile_field_ids: Vec<String>,
    pub preview: Vec<String>,
    pub granted_at: String,
    pub expires_at: String,
    pub revoked_at: Option<String>,
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
pub struct OpportunityApplicationMirror {
    pub id: String,
    pub opportunity_id: String,
    pub status: String,
    pub shared_field_ids: Vec<String>,
    pub external_application_url: String,
    pub updated_at: String,
    pub authoritative: bool,
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
pub struct OpportunityCapacityPlan {
    pub opportunity_id: String,
    pub hours_per_week: f64,
    pub note: String,
    pub created_at: String,
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
pub struct OpportunityReport {
    pub id: String,
    pub opportunity_id: String,
    pub report_type: String,
    pub reason: String,
    pub status: String,
    pub created_at: String,
    pub affected_match_recalculated: bool,
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
pub struct OpportunityFairnessCheck {
    pub id: String,
    pub label: String,
    pub status: String,
    pub detail: String,
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
pub struct OpportunityFairnessAudit {
    pub id: String,
    pub run_at: String,
    pub checks: Vec<OpportunityFairnessCheck>,
    pub sensitive_fields_used: Vec<String>,
    pub status: String,
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
pub struct OpportunityPortfolioExport {
    pub schema_version: String,
    pub archive_type: String,
    pub generated_at: String,
    pub student_id: String,
    pub private: bool,
    pub authoritative: bool,
    pub artifacts: Vec<OpportunityPortfolioArtifact>,
    pub warning: String,
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
pub struct OpportunityBoxScore {
    pub opportunity_id: String,
    pub source_url: String,
    pub source_version: String,
    pub source_authority: String,
    pub checked_fields: Vec<String>,
    pub disclosed_fields: Vec<String>,
    pub forbidden_fields: Vec<String>,
    pub correction_route: String,
    pub status: String,
    pub no_composite_score: bool,
    pub no_auto_apply: bool,
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
pub struct OpportunityMarketSession {
    pub schema_version: String,
    pub data_mode: String,
    pub student_id: String,
    pub selected_profile_field_ids: Vec<String>,
    pub eligibility_checks: Vec<OpportunityEligibilityCheck>,
    pub match_results: Vec<OpportunityMatchResult>,
    pub saved_opportunities: Vec<OpportunitySavedItem>,
    pub disclosure_grants: Vec<OpportunityDisclosureGrant>,
    pub application_mirrors: Vec<OpportunityApplicationMirror>,
    pub capacity_plans: Vec<OpportunityCapacityPlan>,
    pub selected_pathway_id: Option<String>,
    pub selected_portfolio_artifact_ids: Vec<String>,
    pub reports: Vec<OpportunityReport>,
    pub fairness_audits: Vec<OpportunityFairnessAudit>,
    pub suppressed_opportunity_ids: Vec<String>,
    pub read_only_cache_available: bool,
    pub authoritative: bool,
    pub audit: Vec<OpportunityAuditEvent>,
}

impl OpportunityMarketSession {
    #[must_use]
    pub fn from_fixture(fixture: &OpportunityMarketFixture) -> Self {
        Self {
            schema_version: SCHEMA_VERSION.to_owned(),
            data_mode: "demo_fixture".to_owned(),
            student_id: fixture.student_id.clone(),
            selected_profile_field_ids: fixture.selected_profile_field_ids.clone(),
            eligibility_checks: Vec::new(),
            match_results: Vec::new(),
            saved_opportunities: Vec::new(),
            disclosure_grants: Vec::new(),
            application_mirrors: Vec::new(),
            capacity_plans: Vec::new(),
            selected_pathway_id: None,
            selected_portfolio_artifact_ids: Vec::new(),
            reports: Vec::new(),
            fairness_audits: Vec::new(),
            suppressed_opportunity_ids: Vec::new(),
            read_only_cache_available: true,
            authoritative: false,
            audit: fixture.audit.clone(),
        }
    }

    pub fn replace_profile_selection(
        &mut self,
        fixture: &OpportunityMarketFixture,
        field_ids: Vec<String>,
    ) -> Result<Vec<String>, DomainError> {
        let declared = fixture
            .profile_fields
            .iter()
            .map(|item| item.id.as_str())
            .collect::<HashSet<_>>();
        let unique = field_ids.iter().map(String::as_str).collect::<HashSet<_>>();
        if unique.len() != field_ids.len()
            || field_ids.iter().any(|id| {
                !declared.contains(id.as_str()) || fixture.forbidden_profile_field_ids.contains(id)
            })
        {
            return Err(DomainError::InvariantViolation(
                "Profile selection contains a duplicate, forbidden or unknown field".to_owned(),
            ));
        }
        self.selected_profile_field_ids = field_ids;
        Ok(self.selected_profile_field_ids.clone())
    }

    pub fn check_eligibility(
        &mut self,
        fixture: &OpportunityMarketFixture,
        opportunity_id: &str,
    ) -> Result<OpportunityEligibilityCheck, DomainError> {
        let opportunity = fixture.opportunity(opportunity_id)?;
        if opportunity.status == "expired"
            || self
                .suppressed_opportunity_ids
                .iter()
                .any(|item| item == opportunity_id)
        {
            return Err(DomainError::InvariantViolation(
                "expired or reported opportunities cannot produce a new eligibility conclusion"
                    .to_owned(),
            ));
        }
        let check = self.build_eligibility_check(fixture, opportunity)?;
        self.eligibility_checks
            .retain(|item| item.opportunity_id != opportunity_id);
        self.eligibility_checks.push(check.clone());
        self.append_audit(
            "eligibility_check",
            opportunity_id,
            &format!(
                "evaluated {} rules with {} explicitly selected fields; no composite score",
                check.results.len(),
                check.used_profile_field_ids.len()
            ),
        );
        Ok(check)
    }

    pub fn run_selective_match(
        &mut self,
        fixture: &OpportunityMarketFixture,
    ) -> Result<Vec<OpportunityMatchResult>, DomainError> {
        if self.selected_profile_field_ids.is_empty() {
            return Err(DomainError::InvariantViolation(
                "select at least one Profile field before matching".to_owned(),
            ));
        }
        if self
            .selected_profile_field_ids
            .iter()
            .any(|id| fixture.forbidden_profile_field_ids.contains(id))
        {
            return Err(DomainError::InvariantViolation(
                "forbidden Profile fields cannot enter matching".to_owned(),
            ));
        }
        let mut results = fixture
            .opportunities
            .iter()
            .filter(|item| {
                item.status == "active"
                    && !self
                        .suppressed_opportunity_ids
                        .iter()
                        .any(|id| id == &item.id)
            })
            .map(|opportunity| self.build_match_result(fixture, opportunity))
            .collect::<Result<Vec<_>, _>>()?;
        results.sort_by(|left, right| {
            fit_rank(&left.fit_band)
                .cmp(&fit_rank(&right.fit_band))
                .then_with(|| {
                    let left_deadline = fixture
                        .opportunity(&left.opportunity_id)
                        .ok()
                        .and_then(|item| item.deadline.as_deref())
                        .unwrap_or("9999");
                    let right_deadline = fixture
                        .opportunity(&right.opportunity_id)
                        .ok()
                        .and_then(|item| item.deadline.as_deref())
                        .unwrap_or("9999");
                    left_deadline.cmp(right_deadline)
                })
        });
        self.match_results.clone_from(&results);
        self.append_audit(
            "match",
            "selective-match",
            &format!(
                "matched {} active opportunities using explicitly selected fields; paid influence 0",
                results.len()
            ),
        );
        Ok(results)
    }

    pub fn save_opportunity(
        &mut self,
        fixture: &OpportunityMarketFixture,
        opportunity_id: &str,
        note: &str,
    ) -> Result<OpportunitySavedItem, DomainError> {
        let opportunity = fixture.opportunity(opportunity_id)?;
        if opportunity.status != "active"
            || self
                .suppressed_opportunity_ids
                .iter()
                .any(|item| item == opportunity_id)
        {
            return Err(DomainError::InvariantViolation(
                "only active, unreported opportunities can be saved".to_owned(),
            ));
        }
        if self
            .saved_opportunities
            .iter()
            .any(|item| item.opportunity_id == opportunity_id)
        {
            return Err(DomainError::InvariantViolation(
                "opportunity is already saved".to_owned(),
            ));
        }
        let now = self.next_timestamp();
        let saved = OpportunitySavedItem {
            opportunity_id: opportunity_id.to_owned(),
            note: note.trim().to_owned(),
            saved_at: now.clone(),
            intent_status: "saved".to_owned(),
            updated_at: now.clone(),
        };
        self.saved_opportunities.push(saved.clone());
        self.application_mirrors.push(OpportunityApplicationMirror {
            id: format!("application-{opportunity_id}"),
            opportunity_id: opportunity_id.to_owned(),
            status: "saved".to_owned(),
            shared_field_ids: Vec::new(),
            external_application_url: opportunity.external_application_url.clone(),
            updated_at: now,
            authoritative: false,
        });
        self.append_audit("save", opportunity_id, "saved privately; no data shared");
        Ok(saved)
    }

    pub fn express_interest(
        &mut self,
        opportunity_id: &str,
    ) -> Result<OpportunitySavedItem, DomainError> {
        let index = self
            .saved_opportunities
            .iter()
            .position(|item| item.opportunity_id == opportunity_id)
            .ok_or_else(|| {
                DomainError::InvariantViolation(
                    "save the opportunity before expressing interest".to_owned(),
                )
            })?;
        if self.saved_opportunities[index].intent_status != "saved" {
            return Err(DomainError::InvariantViolation(
                "student interest can only follow a private save".to_owned(),
            ));
        }
        self.saved_opportunities[index].intent_status = "student_interested".to_owned();
        self.saved_opportunities[index].updated_at = self.next_timestamp();
        let saved = self.saved_opportunities[index].clone();
        self.append_audit(
            "intent",
            opportunity_id,
            "student expressed private interest; no Profile field shared",
        );
        Ok(saved)
    }

    pub fn acknowledge_provider(
        &mut self,
        opportunity_id: &str,
    ) -> Result<OpportunitySavedItem, DomainError> {
        let index = self
            .saved_opportunities
            .iter()
            .position(|item| item.opportunity_id == opportunity_id)
            .ok_or_else(|| {
                DomainError::InvariantViolation("saved opportunity not found".to_owned())
            })?;
        if self.saved_opportunities[index].intent_status != "student_interested" {
            return Err(DomainError::InvariantViolation(
                "provider acknowledgement requires student interest first".to_owned(),
            ));
        }
        self.saved_opportunities[index].intent_status = "mutual_interest".to_owned();
        self.saved_opportunities[index].updated_at = self.next_timestamp();
        let saved = self.saved_opportunities[index].clone();
        self.append_audit(
            "provider_ack",
            opportunity_id,
            "fixture provider acknowledged interest; disclosure remains blocked",
        );
        Ok(saved)
    }

    pub fn create_disclosure(
        &mut self,
        fixture: &OpportunityMarketFixture,
        opportunity_id: &str,
        duration_days: u32,
    ) -> Result<OpportunityDisclosureGrant, DomainError> {
        let opportunity = fixture.opportunity(opportunity_id)?;
        let saved = self
            .saved_opportunities
            .iter()
            .find(|item| item.opportunity_id == opportunity_id)
            .ok_or_else(|| {
                DomainError::InvariantViolation("saved opportunity not found".to_owned())
            })?;
        if saved.intent_status != "mutual_interest"
            || !(1..=30).contains(&duration_days)
            || self.selected_profile_field_ids.is_empty()
        {
            return Err(DomainError::InvariantViolation(
                "disclosure requires mutual interest, 1-30 days and at least one selected field"
                    .to_owned(),
            ));
        }
        let profile_field_ids = self.selected_profile_field_ids.clone();
        let preview = profile_field_ids
            .iter()
            .filter_map(|id| fixture.field(id))
            .map(|field| format!("{} · {}", field.label, field.value_label))
            .collect::<Vec<_>>();
        let sequence = self.disclosure_grants.len() + 1;
        let now = self.next_timestamp();
        let grant = OpportunityDisclosureGrant {
            id: format!("disclosure-{sequence:03}"),
            opportunity_id: opportunity_id.to_owned(),
            recipient: opportunity.provider.clone(),
            purpose: format!("评估 {} 的双向意向", opportunity.title),
            profile_field_ids: profile_field_ids.clone(),
            preview,
            granted_at: now.clone(),
            expires_at: opportunity_expiry(duration_days),
            revoked_at: None,
        };
        self.disclosure_grants.push(grant.clone());
        if let Some(mirror) = self
            .application_mirrors
            .iter_mut()
            .find(|item| item.opportunity_id == opportunity_id)
        {
            mirror.status = "consented".to_owned();
            mirror.shared_field_ids = profile_field_ids;
            mirror.updated_at = now;
        }
        self.append_audit(
            "consent_grant",
            &grant.id,
            &format!(
                "shared {} purpose-bound fields for {} days",
                grant.profile_field_ids.len(),
                duration_days
            ),
        );
        Ok(grant)
    }

    pub fn revoke_disclosure(
        &mut self,
        grant_id: &str,
    ) -> Result<OpportunityDisclosureGrant, DomainError> {
        let index = self
            .disclosure_grants
            .iter()
            .position(|item| item.id == grant_id)
            .ok_or_else(|| {
                DomainError::InvariantViolation("disclosure grant not found".to_owned())
            })?;
        if self.disclosure_grants[index].revoked_at.is_some() {
            return Err(DomainError::InvariantViolation(
                "disclosure grant is already revoked".to_owned(),
            ));
        }
        let now = self.next_timestamp();
        self.disclosure_grants[index].revoked_at = Some(now.clone());
        let grant = self.disclosure_grants[index].clone();
        if let Some(mirror) = self
            .application_mirrors
            .iter_mut()
            .find(|item| item.opportunity_id == grant.opportunity_id)
        {
            mirror.status = "saved".to_owned();
            mirror.shared_field_ids.clear();
            mirror.updated_at = now;
        }
        self.append_audit(
            "consent_revoke",
            grant_id,
            "student revoked minimum disclosure; external systems were not changed",
        );
        Ok(grant)
    }

    pub fn mark_applied_externally(
        &mut self,
        opportunity_id: &str,
        student_confirmed: bool,
    ) -> Result<OpportunityApplicationMirror, DomainError> {
        if !student_confirmed {
            return Err(DomainError::InvariantViolation(
                "external application status requires explicit student confirmation".to_owned(),
            ));
        }
        let index = self
            .application_mirrors
            .iter()
            .position(|item| item.opportunity_id == opportunity_id)
            .ok_or_else(|| {
                DomainError::InvariantViolation("application mirror not found".to_owned())
            })?;
        self.application_mirrors[index].status = "applied_externally".to_owned();
        self.application_mirrors[index].updated_at = self.next_timestamp();
        let mirror = self.application_mirrors[index].clone();
        self.append_audit(
            "external_status_mark",
            opportunity_id,
            "student confirmed an external action; this service submitted nothing",
        );
        Ok(mirror)
    }

    pub fn plan_capacity(
        &mut self,
        fixture: &OpportunityMarketFixture,
        opportunity_id: &str,
        hours_per_week: f64,
        note: &str,
    ) -> Result<OpportunityCapacityPlan, DomainError> {
        fixture.opportunity(opportunity_id)?;
        let time = fixture
            .capacity
            .iter()
            .find(|item| item.id == "time")
            .ok_or_else(|| {
                DomainError::InvariantViolation("time capacity is missing".to_owned())
            })?;
        let remaining = time.available - time.committed;
        if hours_per_week <= 0.0 || hours_per_week > remaining {
            return Err(DomainError::InvariantViolation(format!(
                "capacity plan exceeds the remaining {remaining} hours/week"
            )));
        }
        let plan = OpportunityCapacityPlan {
            opportunity_id: opportunity_id.to_owned(),
            hours_per_week,
            note: if note.trim().is_empty() {
                "student what-if capacity plan".to_owned()
            } else {
                note.trim().to_owned()
            },
            created_at: self.next_timestamp(),
        };
        self.capacity_plans
            .retain(|item| item.opportunity_id != opportunity_id);
        self.capacity_plans.push(plan.clone());
        self.append_audit(
            "capacity_plan",
            opportunity_id,
            &format!("allocated {hours_per_week} hours/week in a non-authoritative what-if"),
        );
        Ok(plan)
    }

    pub fn select_pathway(
        &mut self,
        fixture: &OpportunityMarketFixture,
        pathway_id: &str,
    ) -> Result<OpportunityPathway, DomainError> {
        let pathway = fixture
            .pathways
            .iter()
            .find(|item| item.id == pathway_id)
            .cloned()
            .ok_or_else(|| {
                DomainError::InvariantViolation("pathway scenario not found".to_owned())
            })?;
        self.selected_pathway_id = Some(pathway_id.to_owned());
        self.append_audit(
            "pathway_preview",
            pathway_id,
            "opened a reversible, non-authoritative pathway scenario",
        );
        Ok(pathway)
    }

    pub fn export_portfolio(
        &mut self,
        fixture: &OpportunityMarketFixture,
        artifact_ids: Vec<String>,
    ) -> Result<OpportunityPortfolioExport, DomainError> {
        let unique = artifact_ids
            .iter()
            .map(String::as_str)
            .collect::<HashSet<_>>();
        if artifact_ids.is_empty() || unique.len() != artifact_ids.len() {
            return Err(DomainError::InvariantViolation(
                "portfolio export needs at least one unique artifact".to_owned(),
            ));
        }
        let artifacts = artifact_ids
            .iter()
            .map(|id| {
                fixture
                    .portfolio_artifacts
                    .iter()
                    .find(|item| item.id == *id)
                    .cloned()
                    .ok_or_else(|| {
                        DomainError::InvariantViolation(format!(
                            "portfolio artifact not found: {id}"
                        ))
                    })
            })
            .collect::<Result<Vec<_>, _>>()?;
        if artifacts.iter().any(|item| item.includes_original_material) {
            return Err(DomainError::InvariantViolation(
                "original course material cannot enter the public portfolio export".to_owned(),
            ));
        }
        self.selected_portfolio_artifact_ids = artifact_ids;
        self.append_audit(
            "portfolio_export",
            "portfolio",
            &format!("exported {} selected source references", artifacts.len()),
        );
        Ok(OpportunityPortfolioExport {
            schema_version: SCHEMA_VERSION.to_owned(),
            archive_type: "readable_untrusted_portfolio_fixture".to_owned(),
            generated_at: self.next_timestamp(),
            student_id: fixture.student_id.clone(),
            private: true,
            authoritative: false,
            artifacts,
            warning: "Fixture export; contains source references and review states but no original course material and no institutional credential.".to_owned(),
        })
    }

    pub fn report_opportunity(
        &mut self,
        fixture: &OpportunityMarketFixture,
        opportunity_id: &str,
        report_type: &str,
        reason: &str,
    ) -> Result<OpportunityReport, DomainError> {
        fixture.opportunity(opportunity_id)?;
        require_non_empty("opportunity report reason", reason)?;
        if !matches!(report_type, "expired" | "wrong_info" | "unfair") {
            return Err(DomainError::InvariantViolation(
                "report type must be expired, wrong_info or unfair".to_owned(),
            ));
        }
        if !self
            .suppressed_opportunity_ids
            .iter()
            .any(|item| item == opportunity_id)
        {
            self.suppressed_opportunity_ids
                .push(opportunity_id.to_owned());
        }
        self.match_results
            .retain(|item| item.opportunity_id != opportunity_id);
        let sequence = self.reports.len() + 1;
        let report = OpportunityReport {
            id: format!("report-{sequence:03}"),
            opportunity_id: opportunity_id.to_owned(),
            report_type: report_type.to_owned(),
            reason: reason.trim().to_owned(),
            status: "queued_for_human_review".to_owned(),
            created_at: self.next_timestamp(),
            affected_match_recalculated: true,
        };
        self.reports.push(report.clone());
        self.append_audit(
            "report",
            &report.id,
            &format!("{report_type} reported for {opportunity_id}; affected match removed"),
        );
        Ok(report)
    }

    pub fn run_fairness_audit(
        &mut self,
        fixture: &OpportunityMarketFixture,
    ) -> OpportunityFairnessAudit {
        let sensitive_fields_used = self
            .selected_profile_field_ids
            .iter()
            .filter(|id| fixture.forbidden_profile_field_ids.contains(id))
            .cloned()
            .collect::<Vec<_>>();
        let checks = vec![
            fairness_check(
                "fair-paid",
                "零付费排序",
                fixture
                    .opportunities
                    .iter()
                    .all(|item| item.paid_ranking_factor == 0.0),
                "所有机会 paid_ranking_factor 必须为 0。",
            ),
            fairness_check(
                "fair-random",
                "零随机资格",
                fixture
                    .opportunities
                    .iter()
                    .all(|item| !item.random_allocation),
                "资格与机会不得用概率或抽卡分配。",
            ),
            fairness_check(
                "fair-auction",
                "零人员竞价",
                fixture
                    .opportunities
                    .iter()
                    .all(|item| !item.auction_enabled),
                "学生、导师与岗位均不可成为竞价对象。",
            ),
            fairness_check(
                "fair-sensitive",
                "零禁止字段",
                sensitive_fields_used.is_empty(),
                "健康、家庭、财务、门禁与支付记录不得进入匹配。",
            ),
            fairness_check(
                "fair-apply",
                "零自动投递",
                fixture.invariants.no_auto_apply,
                "平台只保存外部链接和本人镜像状态。",
            ),
        ];
        let status = if checks.iter().all(|item| item.status == "pass") {
            "pass"
        } else {
            "fail"
        };
        let sequence = self.fairness_audits.len() + 1;
        let audit = OpportunityFairnessAudit {
            id: format!("fairness-{sequence:03}"),
            run_at: self.next_timestamp(),
            checks,
            sensitive_fields_used,
            status: status.to_owned(),
        };
        self.fairness_audits.push(audit.clone());
        self.append_audit(
            "fairness_audit",
            &audit.id,
            &format!(
                "{}/5 anti-manipulation checks passed",
                audit
                    .checks
                    .iter()
                    .filter(|item| item.status == "pass")
                    .count()
            ),
        );
        audit
    }

    pub fn box_score(
        &self,
        fixture: &OpportunityMarketFixture,
        opportunity_id: &str,
    ) -> Result<OpportunityBoxScore, DomainError> {
        let opportunity = fixture.opportunity(opportunity_id)?;
        let checked_fields = self
            .eligibility_checks
            .iter()
            .find(|item| item.opportunity_id == opportunity_id)
            .map_or_else(Vec::new, |item| item.used_profile_field_ids.clone());
        let disclosed_fields = self
            .disclosure_grants
            .iter()
            .rev()
            .find(|item| item.opportunity_id == opportunity_id)
            .filter(|item| item.revoked_at.is_none())
            .map_or_else(Vec::new, |item| item.profile_field_ids.clone());
        let status = if self
            .suppressed_opportunity_ids
            .iter()
            .any(|item| item == opportunity_id)
        {
            "under_review"
        } else {
            opportunity.status.as_str()
        };
        Ok(OpportunityBoxScore {
            opportunity_id: opportunity_id.to_owned(),
            source_url: opportunity.source_url.clone(),
            source_version: opportunity.source_version.clone(),
            source_authority: "demo_fixture".to_owned(),
            checked_fields,
            disclosed_fields,
            forbidden_fields: fixture.forbidden_profile_field_ids.clone(),
            correction_route: opportunity.correction_route.clone(),
            status: status.to_owned(),
            no_composite_score: true,
            no_auto_apply: true,
        })
    }

    fn build_eligibility_check(
        &self,
        fixture: &OpportunityMarketFixture,
        opportunity: &OpportunityRecord,
    ) -> Result<OpportunityEligibilityCheck, DomainError> {
        let mut results = Vec::new();
        for rule_id in &opportunity.eligibility_rule_ids {
            let rule = fixture
                .rules
                .iter()
                .find(|item| item.id == *rule_id)
                .ok_or_else(|| {
                    DomainError::InvariantViolation(format!(
                        "eligibility rule not found: {rule_id}"
                    ))
                })?;
            results.push(eligibility_result(
                fixture,
                rule,
                &self.selected_profile_field_ids,
            ));
        }
        let count = |status: &str| results.iter().filter(|item| item.status == status).count();
        Ok(OpportunityEligibilityCheck {
            opportunity_id: opportunity.id.clone(),
            checked_at: self.next_timestamp(),
            used_profile_field_ids: self.selected_profile_field_ids.clone(),
            summary: format!(
                "已满足 {} · 可能满足 {} · 未满足 {} · 未知 {}",
                count("met"),
                count("possibly_met"),
                count("not_met"),
                count("unknown")
            ),
            results,
            has_composite_score: false,
        })
    }

    fn build_match_result(
        &self,
        fixture: &OpportunityMarketFixture,
        opportunity: &OpportunityRecord,
    ) -> Result<OpportunityMatchResult, DomainError> {
        let check = self.build_eligibility_check(fixture, opportunity)?;
        let required_rule_ids = fixture
            .rules
            .iter()
            .filter(|rule| rule.opportunity_id == opportunity.id && rule.required)
            .map(|rule| rule.id.as_str())
            .collect::<HashSet<_>>();
        let required = check
            .results
            .iter()
            .filter(|item| required_rule_ids.contains(item.rule_id.as_str()))
            .collect::<Vec<_>>();
        let reasons = check
            .results
            .iter()
            .filter(|item| matches!(item.status.as_str(), "met" | "possibly_met"))
            .map(|item| format!("{}：{}", item.rule_description, item.evidence_label))
            .collect::<Vec<_>>();
        let conflicts = required
            .iter()
            .filter(|item| item.status == "not_met")
            .map(|item| format!("{}：{}", item.rule_description, item.next_step))
            .collect::<Vec<_>>();
        let unknowns = required
            .iter()
            .filter(|item| item.status == "unknown")
            .map(|item| format!("{}：{}", item.rule_description, item.next_step))
            .collect::<Vec<_>>();
        let possibly_met = required.iter().any(|item| item.status == "possibly_met");
        let fit_band = if required.is_empty() || unknowns.len() == required.len() {
            "insufficient_data"
        } else if !conflicts.is_empty() {
            "gaps_present"
        } else if !unknowns.is_empty() || possibly_met {
            "needs_confirmation"
        } else {
            "ready_to_review"
        };
        Ok(OpportunityMatchResult {
            opportunity_id: opportunity.id.clone(),
            fit_band: fit_band.to_owned(),
            reasons,
            conflicts,
            unknowns,
            generated_at: self.next_timestamp(),
            ranking_basis: "eligibility_then_deadline".to_owned(),
            paid_influence: false,
        })
    }

    fn append_audit(&mut self, action: &str, target_id: &str, detail: &str) {
        let previous = self.audit.last();
        let sequence = previous.map_or(1, |item| item.sequence + 1);
        let previous_event_hash = previous.map(|item| item.event_hash.clone());
        self.audit.push(OpportunityAuditEvent {
            id: format!("opp-event-{sequence:03}"),
            sequence,
            action: action.to_owned(),
            target_id: target_id.to_owned(),
            detail: detail.to_owned(),
            occurred_at: self.next_timestamp(),
            previous_event_hash,
            event_hash: format!("fnv1a-opp-event-{sequence:03}"),
        });
    }

    fn next_timestamp(&self) -> String {
        let minute = (self.audit.len() + 1) % 60;
        format!("2026-07-24T20:{minute:02}:00+08:00")
    }
}

fn eligibility_result(
    fixture: &OpportunityMarketFixture,
    rule: &OpportunityEligibilityRule,
    selected_field_ids: &[String],
) -> OpportunityEligibilityResult {
    let field = fixture.field(&rule.field_id);
    if field.is_none() || !selected_field_ids.contains(&rule.field_id) {
        return OpportunityEligibilityResult {
            rule_id: rule.id.clone(),
            rule_description: rule.description.clone(),
            status: "unknown".to_owned(),
            evidence_field_id: None,
            evidence_label: "本次未授权该字段；系统不会暗中读取。".to_owned(),
            next_step: format!(
                "可保持未知，或逐项选择“{}”后重查。",
                field.map_or(rule.field_id.as_str(), |item| item.label.as_str())
            ),
        };
    }
    let field = field.expect("field existence checked above");
    if field.value.is_unknown() {
        return OpportunityEligibilityResult {
            rule_id: rule.id.clone(),
            rule_description: rule.description.clone(),
            status: "unknown".to_owned(),
            evidence_field_id: Some(field.id.clone()),
            evidence_label: format!("{} · {}", field.value_label, field.authority),
            next_step: "沿官方渠道补齐信息，或保持未知；未知不会被猜成满足。".to_owned(),
        };
    }
    if !field.value.matches(&rule.operator, &rule.expected_value) {
        return OpportunityEligibilityResult {
            rule_id: rule.id.clone(),
            rule_description: rule.description.clone(),
            status: "not_met".to_owned(),
            evidence_field_id: Some(field.id.clone()),
            evidence_label: format!("{} · {}", field.label, field.value_label),
            next_step: if matches!(rule.operator.as_str(), "gte" | "lte") {
                format!(
                    "当前为 {}；请按官方允许范围调整，并在提交前重新核对。",
                    field.value_label
                )
            } else {
                "查看官方规则并补充材料；系统不会替提供方豁免要求。".to_owned()
            },
        };
    }
    let verified = field.authority == "verified_fixture";
    OpportunityEligibilityResult {
        rule_id: rule.id.clone(),
        rule_description: rule.description.clone(),
        status: if verified { "met" } else { "possibly_met" }.to_owned(),
        evidence_field_id: Some(field.id.clone()),
        evidence_label: if verified {
            format!(
                "{} · 来源 {}",
                field.label,
                field.source_id.as_deref().unwrap_or("Fixture")
            )
        } else {
            format!("{} · {}", field.label, field.value_label)
        },
        next_step: if verified {
            "正式申请前再次核对官方规则版本与有效期。".to_owned()
        } else {
            "这是本人声明或 Fixture 信息；正式申请前向提供方确认。".to_owned()
        },
    }
}

fn fit_rank(value: &str) -> u8 {
    match value {
        "ready_to_review" => 0,
        "needs_confirmation" => 1,
        "gaps_present" => 2,
        _ => 3,
    }
}

fn fairness_check(id: &str, label: &str, passed: bool, detail: &str) -> OpportunityFairnessCheck {
    OpportunityFairnessCheck {
        id: id.to_owned(),
        label: label.to_owned(),
        status: if passed { "pass" } else { "fail" }.to_owned(),
        detail: detail.to_owned(),
    }
}

fn opportunity_expiry(duration_days: u32) -> String {
    let day = 24 + duration_days;
    if day <= 31 {
        format!("2026-07-{day:02}T23:59:00+08:00")
    } else {
        format!("2026-08-{:02}T23:59:00+08:00", day.saturating_sub(31))
    }
}

fn unique_ids<'a>(
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

fn validate_opportunity_audit(events: &[OpportunityAuditEvent]) -> Result<(), DomainError> {
    if events.is_empty() {
        return Err(DomainError::InvariantViolation(
            "Opportunity Market needs an initial audit event".to_owned(),
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
                "Opportunity Market audit must remain an append-only chain".to_owned(),
            ));
        }
    }
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;

    fn fixture() -> OpportunityMarketFixture {
        serde_json::from_str(include_str!(
            "../../../fixtures/v1/opportunity-market.demo.json"
        ))
        .expect("Opportunity Market fixture must deserialize")
    }

    #[test]
    fn fixture_enforces_transparency_privacy_and_non_manipulation() {
        let fixture = fixture();
        fixture.validate().expect("fixture must satisfy invariants");
        assert_eq!(fixture.opportunities.len(), 16);
        assert_eq!(fixture.packs.len(), 3);
        assert!(fixture.opportunities.iter().all(|item| {
            item.paid_ranking_factor == 0.0 && matches!(item.scope.as_str(), "campus" | "external")
        }));
        assert!(
            fixture
                .profile_fields
                .iter()
                .all(|item| item.private && item.selectable)
        );
    }

    #[test]
    fn eligibility_and_matching_are_four_state_explainable_and_score_free() {
        let fixture = fixture();
        let mut session = OpportunityMarketSession::from_fixture(&fixture);
        session
            .replace_profile_selection(
                &fixture,
                vec![
                    "field-goal-research".to_owned(),
                    "field-interest-signal".to_owned(),
                    "field-course-sls201".to_owned(),
                    "field-portfolio-signal".to_owned(),
                    "field-availability-hours".to_owned(),
                ],
            )
            .expect("selection is valid");
        let check = session
            .check_eligibility(&fixture, "opp-signal-lab")
            .expect("check should work");
        let states = check
            .results
            .iter()
            .map(|item| item.status.as_str())
            .collect::<HashSet<_>>();
        assert_eq!(
            states,
            ["met", "possibly_met", "not_met", "unknown"]
                .into_iter()
                .collect()
        );
        assert!(!check.has_composite_score);
        let matches = session
            .run_selective_match(&fixture)
            .expect("matching should work");
        assert_eq!(matches.len(), 14);
        assert!(matches.iter().all(|item| !item.paid_influence));
    }

    #[test]
    fn consent_requires_double_opt_in_and_can_be_revoked() {
        let fixture = fixture();
        let mut session = OpportunityMarketSession::from_fixture(&fixture);
        session
            .save_opportunity(&fixture, "opp-signal-lab", "")
            .expect("save works");
        assert!(
            session
                .create_disclosure(&fixture, "opp-signal-lab", 7)
                .is_err()
        );
        session
            .express_interest("opp-signal-lab")
            .expect("student intent works");
        session
            .acknowledge_provider("opp-signal-lab")
            .expect("provider ack works");
        let grant = session
            .create_disclosure(&fixture, "opp-signal-lab", 7)
            .expect("mutual interest enables disclosure");
        assert_eq!(grant.expires_at, "2026-07-31T23:59:00+08:00");
        let revoked = session
            .revoke_disclosure(&grant.id)
            .expect("student can revoke");
        assert!(revoked.revoked_at.is_some());
        let box_score = session
            .box_score(&fixture, "opp-signal-lab")
            .expect("box score works");
        assert!(box_score.disclosed_fields.is_empty());
    }

    #[test]
    fn report_recalculates_match_and_portfolio_stays_untrusted() {
        let fixture = fixture();
        let mut session = OpportunityMarketSession::from_fixture(&fixture);
        session
            .run_selective_match(&fixture)
            .expect("matching should work");
        let report = session
            .report_opportunity(
                &fixture,
                "opp-signal-lab",
                "wrong_info",
                "Fixture source needs review.",
            )
            .expect("report should work");
        assert!(report.affected_match_recalculated);
        assert!(
            session
                .match_results
                .iter()
                .all(|item| item.opportunity_id != "opp-signal-lab")
        );
        let export = session
            .export_portfolio(
                &fixture,
                vec![
                    "artifact-smartcourse".to_owned(),
                    "artifact-world-exam".to_owned(),
                ],
            )
            .expect("selected export should work");
        assert!(!export.authoritative);
        assert!(
            export
                .artifacts
                .iter()
                .all(|item| !item.includes_original_material)
        );
        let fairness = session.run_fairness_audit(&fixture);
        assert_eq!(fairness.status, "pass");
        assert_eq!(
            fairness
                .checks
                .iter()
                .filter(|item| item.status == "pass")
                .count(),
            5
        );
    }
}

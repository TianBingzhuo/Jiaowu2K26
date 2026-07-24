use crate::{DomainError, SCHEMA_VERSION};
use serde::{Deserialize, Serialize};
use std::collections::BTreeSet;

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
pub struct PassEvidenceSource {
    pub id: String,
    pub provider: String,
    pub official_url: String,
    pub version: String,
    pub updated_at: String,
    pub verification_status: String,
    pub correction_route: String,
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
pub struct IdentityLink {
    pub id: String,
    pub subject_label: String,
    pub role: String,
    pub authority_source_id: String,
    pub status: String,
    pub verified_at: String,
    pub expires_at: String,
    pub source_password_stored: bool,
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
pub struct PassCredential {
    pub id: String,
    pub title: String,
    pub issuer: String,
    pub credential_type: String,
    pub supported_carriers: Vec<String>,
    pub scope_zone_ids: Vec<String>,
    pub purpose: String,
    pub valid_from: String,
    pub expires_at: String,
    pub state: String,
    pub source_ids: Vec<String>,
    pub minimum_privilege: bool,
    pub secret_material_stored: bool,
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
pub struct AccessZone {
    pub id: String,
    pub label: String,
    pub sensitivity: String,
    pub allowed_roles: Vec<String>,
    pub time_window: String,
    pub requires_extra_approval: bool,
    pub source_id: String,
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
pub struct AccessPrerequisite {
    pub id: String,
    pub zone_id: String,
    pub label: String,
    pub status: String,
    pub official_action_url: String,
    pub source_id: String,
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
pub struct GuestPassPolicy {
    pub id: String,
    pub allowed_zone_ids: Vec<String>,
    pub maximum_hours: u16,
    pub sponsor_required: bool,
    pub purpose_required: bool,
    pub sensitive_area_extra_approval: bool,
    pub auto_expiry_required: bool,
    pub source_id: String,
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
pub struct PassOfflinePolicy {
    pub valid_until: String,
    pub accepted_carriers: Vec<String>,
    pub unavailable_zone_ids: Vec<String>,
    pub screenshot_is_credential: bool,
    pub cryptographic_verification: String,
    pub source_id: String,
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
pub struct SelfAccessRecord {
    pub id: String,
    pub occurred_at: String,
    pub zone_id: String,
    pub result: String,
    pub purpose: String,
    pub source_id: String,
    pub retained_until: String,
    pub precise_location_retained: bool,
    pub correction_route: String,
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
pub struct EmergencyAccessMode {
    pub id: String,
    pub title: String,
    pub status: String,
    pub authority: String,
    pub official_url: String,
    pub experience_layer_can_execute: bool,
    pub source_id: String,
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
pub struct ManualAccessFallback {
    pub id: String,
    pub label: String,
    pub conditions: Vec<String>,
    pub channel: String,
    pub accessible: bool,
    pub requires_phone: bool,
    pub source_id: String,
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
pub struct CampusPassInvariants {
    pub no_official_credential_issuance: bool,
    pub no_source_password_storage: bool,
    pub no_secret_material_storage: bool,
    pub static_screenshot_never_dynamic_credential: bool,
    pub minimum_privilege_default: bool,
    pub access_state_is_authority_mirror: bool,
    pub no_precise_mobility_profile: bool,
    pub emergency_execution_stays_external: bool,
    pub phone_is_not_required: bool,
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
pub struct CampusPassFixture {
    pub schema_version: String,
    pub data_mode: String,
    pub generated_at: String,
    pub last_updated_at: String,
    pub sources: Vec<PassEvidenceSource>,
    pub identities: Vec<IdentityLink>,
    pub credentials: Vec<PassCredential>,
    pub zones: Vec<AccessZone>,
    pub prerequisites: Vec<AccessPrerequisite>,
    pub guest_policy: GuestPassPolicy,
    pub offline_policy: PassOfflinePolicy,
    pub self_access_records: Vec<SelfAccessRecord>,
    pub emergency_modes: Vec<EmergencyAccessMode>,
    pub manual_fallbacks: Vec<ManualAccessFallback>,
    pub invariants: CampusPassInvariants,
}

impl CampusPassFixture {
    pub fn validate(&self) -> Result<(), DomainError> {
        if self.schema_version != SCHEMA_VERSION {
            return Err(DomainError::UnsupportedSchema(self.schema_version.clone()));
        }
        if self.data_mode != "demo_fixture" {
            return Err(DomainError::InvariantViolation(
                "Campus Pass must remain an explicit demo fixture.".to_owned(),
            ));
        }
        if self.sources.len() < 4
            || self.identities.is_empty()
            || self.credentials.len() < 3
            || self.zones.len() < 4
            || self.manual_fallbacks.len() < 2
        {
            return Err(DomainError::InvariantViolation(
                "Campus Pass fixture needs bounded source, identity, wallet, zone and fallback coverage."
                    .to_owned(),
            ));
        }

        let source_ids = self
            .sources
            .iter()
            .map(|source| source.id.as_str())
            .collect::<BTreeSet<_>>();
        let zone_ids = self
            .zones
            .iter()
            .map(|zone| zone.id.as_str())
            .collect::<BTreeSet<_>>();
        if self.sources.iter().any(|source| {
            !source.official_url.starts_with("https://")
                || source.correction_route.trim().is_empty()
        }) {
            return Err(DomainError::InvariantViolation(
                "Every Campus Pass source needs an HTTPS official URL and correction route."
                    .to_owned(),
            ));
        }
        if self
            .identities
            .iter()
            .any(|identity| !source_ids.contains(identity.authority_source_id.as_str()))
            || self.credentials.iter().any(|credential| {
                credential.source_ids.is_empty()
                    || credential
                        .source_ids
                        .iter()
                        .any(|id| !source_ids.contains(id.as_str()))
                    || credential
                        .scope_zone_ids
                        .iter()
                        .any(|id| !zone_ids.contains(id.as_str()))
            })
            || self
                .zones
                .iter()
                .any(|zone| !source_ids.contains(zone.source_id.as_str()))
            || self.prerequisites.iter().any(|item| {
                !source_ids.contains(item.source_id.as_str())
                    || !zone_ids.contains(item.zone_id.as_str())
            })
        {
            return Err(DomainError::InvariantViolation(
                "Campus Pass records must reference registered sources and zones.".to_owned(),
            ));
        }
        if !self.credentials.iter().any(|credential| {
            credential
                .supported_carriers
                .contains(&"dynamic_qr".to_owned())
        }) || !self.zones.iter().any(|zone| zone.requires_extra_approval)
            || !self
                .prerequisites
                .iter()
                .any(|item| item.status != "fulfilled")
            || !self
                .manual_fallbacks
                .iter()
                .any(|item| !item.requires_phone)
        {
            return Err(DomainError::InvariantViolation(
                "Campus Pass needs dynamic-credential, sensitive-zone, unmet-prerequisite and no-phone QA examples."
                    .to_owned(),
            ));
        }

        let invariants = &self.invariants;
        if !invariants.no_official_credential_issuance
            || !invariants.no_source_password_storage
            || !invariants.no_secret_material_storage
            || !invariants.static_screenshot_never_dynamic_credential
            || !invariants.minimum_privilege_default
            || !invariants.access_state_is_authority_mirror
            || !invariants.no_precise_mobility_profile
            || !invariants.emergency_execution_stays_external
            || !invariants.phone_is_not_required
        {
            return Err(DomainError::InvariantViolation(
                "Campus Pass authority, privacy and accessibility invariants must remain enabled."
                    .to_owned(),
            ));
        }
        if self
            .identities
            .iter()
            .any(|identity| identity.source_password_stored)
            || self
                .credentials
                .iter()
                .any(|credential| credential.secret_material_stored)
            || self
                .self_access_records
                .iter()
                .any(|record| record.precise_location_retained)
            || self
                .emergency_modes
                .iter()
                .any(|mode| mode.experience_layer_can_execute)
            || self.offline_policy.screenshot_is_credential
        {
            return Err(DomainError::InvariantViolation(
                "Campus Pass fixture cannot store secrets, track precise movement, execute emergency access or trust screenshots."
                    .to_owned(),
            ));
        }
        Ok(())
    }
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
pub struct CredentialPresentation {
    pub id: String,
    pub credential_id: String,
    pub carrier: String,
    pub static_capture: bool,
    pub accepted_by_demo_reader: bool,
    pub official_access_granted: bool,
    pub reason: String,
    pub occurred_at: String,
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
pub struct AccessRequestMirror {
    pub id: String,
    pub credential_id: String,
    pub zone_id: String,
    pub purpose: String,
    pub status: String,
    pub missing_prerequisite_ids: Vec<String>,
    pub authoritative: bool,
    pub experience_executed_access: bool,
    pub official_action_url: String,
    pub updated_at: String,
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
pub struct GuestPassDraft {
    pub id: String,
    pub zone_id: String,
    pub purpose: String,
    pub sponsor_label: String,
    pub duration_hours: u16,
    pub extra_approval_required: bool,
    pub auto_expires: bool,
    pub status: String,
    pub authoritative: bool,
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
pub struct CredentialLossCase {
    pub id: String,
    pub credential_id: String,
    pub requested_action: String,
    pub status: String,
    pub official_action_url: String,
    pub experience_executed_action: bool,
    pub created_at: String,
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
pub struct AccessLogCorrection {
    pub id: String,
    pub record_id: String,
    pub reason: String,
    pub status: String,
    pub created_at: String,
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
pub struct OfflineCredentialCheck {
    pub id: String,
    pub credential_id: String,
    pub zone_id: String,
    pub carrier: String,
    pub valid: bool,
    pub cryptographically_verified: bool,
    pub official_access_granted: bool,
    pub reason: String,
    pub checked_at: String,
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
pub struct ManualFallbackSelection {
    pub id: String,
    pub fallback_id: String,
    pub reason: String,
    pub status: String,
    pub official_action_url: String,
    pub experience_executed_access: bool,
    pub created_at: String,
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
pub struct PassAuditEvent {
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
pub struct CampusPassBoxScore {
    pub wallet_credentials: usize,
    pub active_credentials: usize,
    pub pending_requests: usize,
    pub manual_fallbacks: usize,
    pub official_credentials_issued: usize,
    pub official_access_actions_executed: usize,
    pub source_passwords_stored: usize,
    pub secret_material_stored: usize,
    pub precise_tracking_events: usize,
    pub audit_events: usize,
    pub non_authoritative: bool,
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
pub struct CampusPassSession {
    pub schema_version: String,
    pub data_mode: String,
    pub selected_credential_id: Option<String>,
    pub presentations: Vec<CredentialPresentation>,
    pub access_requests: Vec<AccessRequestMirror>,
    pub guest_pass_drafts: Vec<GuestPassDraft>,
    pub loss_cases: Vec<CredentialLossCase>,
    pub log_corrections: Vec<AccessLogCorrection>,
    pub offline_checks: Vec<OfflineCredentialCheck>,
    pub manual_fallback_selections: Vec<ManualFallbackSelection>,
    pub audit: Vec<PassAuditEvent>,
}

impl CampusPassSession {
    #[must_use]
    pub fn from_fixture(fixture: &CampusPassFixture) -> Self {
        Self {
            schema_version: SCHEMA_VERSION.to_owned(),
            data_mode: "demo_fixture".to_owned(),
            selected_credential_id: fixture.credentials.first().map(|item| item.id.clone()),
            presentations: vec![],
            access_requests: vec![],
            guest_pass_drafts: vec![],
            loss_cases: vec![],
            log_corrections: vec![],
            offline_checks: vec![],
            manual_fallback_selections: vec![],
            audit: vec![PassAuditEvent {
                id: "pass-event-001".to_owned(),
                sequence: 1,
                action: "view_wallet".to_owned(),
                target_id: "campus-pass-fixture".to_owned(),
                detail:
                    "loaded sanitized pass fixture without issuing a credential or executing access"
                        .to_owned(),
                occurred_at: fixture.generated_at.clone(),
                previous_event_hash: None,
                event_hash: "fnv1a-pass-event-001".to_owned(),
            }],
        }
    }

    pub fn select_credential(
        &mut self,
        fixture: &CampusPassFixture,
        credential_id: &str,
    ) -> Result<PassCredential, DomainError> {
        let credential = fixture
            .credentials
            .iter()
            .find(|item| item.id == credential_id)
            .cloned()
            .ok_or_else(|| {
                DomainError::InvariantViolation(
                    "Credential selection needs a registered wallet item.".to_owned(),
                )
            })?;
        self.selected_credential_id = Some(credential.id.clone());
        self.append_audit(
            "select_credential",
            credential_id,
            "selected a fixture wallet item without issuing or modifying the source credential",
        );
        Ok(credential)
    }

    pub fn present_credential(
        &mut self,
        fixture: &CampusPassFixture,
        credential_id: &str,
        carrier: &str,
        static_capture: bool,
    ) -> Result<CredentialPresentation, DomainError> {
        let credential = fixture
            .credentials
            .iter()
            .find(|item| item.id == credential_id)
            .ok_or_else(|| {
                DomainError::InvariantViolation(
                    "Credential presentation needs a registered wallet item.".to_owned(),
                )
            })?;
        if !credential
            .supported_carriers
            .iter()
            .any(|item| item == carrier)
        {
            return Err(DomainError::InvariantViolation(
                "Selected carrier is not supported by this credential.".to_owned(),
            ));
        }
        let screenshot_rejected = carrier == "dynamic_qr" && static_capture;
        let active = credential.state == "active";
        let presentation = CredentialPresentation {
            id: format!("pass-presentation-{:03}", self.presentations.len() + 1),
            credential_id: credential_id.to_owned(),
            carrier: carrier.to_owned(),
            static_capture,
            accepted_by_demo_reader: active && !screenshot_rejected,
            official_access_granted: false,
            reason: if screenshot_rejected {
                "静态截图不能冒充动态凭证；请回到正式凭证载体或人工核验。".to_owned()
            } else if !active {
                format!("凭证状态为 {}；Demo Reader 拒绝继续。", credential.state)
            } else {
                "仅完成本地 Fixture Reader 校验；没有向门锁发送指令。".to_owned()
            },
            occurred_at: self.next_time(),
        };
        self.presentations.push(presentation.clone());
        self.append_audit(
            "present_credential",
            credential_id,
            if screenshot_rejected {
                "rejected a static capture of a dynamic credential"
            } else {
                "ran a local fixture reader without granting official access"
            },
        );
        Ok(presentation)
    }

    pub fn request_access(
        &mut self,
        fixture: &CampusPassFixture,
        credential_id: &str,
        zone_id: &str,
        purpose: &str,
    ) -> Result<AccessRequestMirror, DomainError> {
        let credential = fixture
            .credentials
            .iter()
            .find(|item| item.id == credential_id)
            .ok_or_else(|| {
                DomainError::InvariantViolation(
                    "Access request needs a registered credential.".to_owned(),
                )
            })?;
        let zone = fixture
            .zones
            .iter()
            .find(|item| item.id == zone_id)
            .ok_or_else(|| {
                DomainError::InvariantViolation(
                    "Access request needs a registered zone.".to_owned(),
                )
            })?;
        if purpose.trim().len() < 4 {
            return Err(DomainError::InvariantViolation(
                "Access request needs a reviewable purpose.".to_owned(),
            ));
        }
        let mut missing = fixture
            .prerequisites
            .iter()
            .filter(|item| item.zone_id == zone_id && item.status != "fulfilled")
            .map(|item| item.id.clone())
            .collect::<Vec<_>>();
        if !credential.scope_zone_ids.iter().any(|item| item == zone_id) {
            missing.push("minimum-scope-not-granted".to_owned());
        }
        if zone.requires_extra_approval {
            missing.push("sensitive-area-extra-approval".to_owned());
        }
        missing.sort();
        missing.dedup();
        let status = if credential.state != "active" {
            "draft_blocked_credential"
        } else if missing.is_empty() {
            "submitted"
        } else {
            "draft_blocked_prerequisites"
        };
        let request = AccessRequestMirror {
            id: format!("pass-request-{:03}", self.access_requests.len() + 1),
            credential_id: credential_id.to_owned(),
            zone_id: zone_id.to_owned(),
            purpose: purpose.trim().to_owned(),
            status: status.to_owned(),
            missing_prerequisite_ids: missing,
            authoritative: false,
            experience_executed_access: false,
            official_action_url: fixture
                .sources
                .iter()
                .find(|source| source.id == zone.source_id)
                .map_or_else(String::new, |source| source.official_url.clone()),
            updated_at: self.next_time(),
        };
        self.access_requests.push(request.clone());
        self.append_audit(
            "request_access",
            &request.id,
            "created a non-authoritative access request mirror and preserved prerequisite blockers",
        );
        Ok(request)
    }

    pub fn update_request_mirror(
        &mut self,
        request_id: &str,
        status: &str,
    ) -> Result<AccessRequestMirror, DomainError> {
        if !matches!(
            status,
            "submitted"
                | "reviewing"
                | "approved"
                | "externally_executed"
                | "denied"
                | "expired"
                | "fault"
                | "appeal"
        ) {
            return Err(DomainError::InvariantViolation(
                "Unknown authority-mirror status.".to_owned(),
            ));
        }
        let updated_at = self.next_time();
        let request = self
            .access_requests
            .iter_mut()
            .find(|item| item.id == request_id)
            .ok_or_else(|| {
                DomainError::InvariantViolation(
                    "Request mirror update needs an existing request.".to_owned(),
                )
            })?;
        if request.status.starts_with("draft_blocked") {
            return Err(DomainError::InvariantViolation(
                "Blocked request cannot advance until its prerequisites are satisfied.".to_owned(),
            ));
        }
        request.status = status.to_owned();
        request.updated_at = updated_at;
        request.authoritative = false;
        request.experience_executed_access = false;
        let result = request.clone();
        self.append_audit(
            "update_authority_mirror",
            request_id,
            "updated a fixture authority mirror without executing access",
        );
        Ok(result)
    }

    pub fn create_guest_draft(
        &mut self,
        fixture: &CampusPassFixture,
        zone_id: &str,
        purpose: &str,
        sponsor_label: &str,
        duration_hours: u16,
    ) -> Result<GuestPassDraft, DomainError> {
        let zone = fixture
            .zones
            .iter()
            .find(|item| item.id == zone_id)
            .ok_or_else(|| {
                DomainError::InvariantViolation("Guest draft needs a registered zone.".to_owned())
            })?;
        if !fixture
            .guest_policy
            .allowed_zone_ids
            .iter()
            .any(|item| item == zone_id)
            || purpose.trim().len() < 4
            || sponsor_label.trim().len() < 2
            || duration_hours == 0
            || duration_hours > fixture.guest_policy.maximum_hours
        {
            return Err(DomainError::InvariantViolation(
                "Guest draft must satisfy purpose, sponsor, duration and allowed-zone policy."
                    .to_owned(),
            ));
        }
        let draft = GuestPassDraft {
            id: format!("guest-draft-{:03}", self.guest_pass_drafts.len() + 1),
            zone_id: zone_id.to_owned(),
            purpose: purpose.trim().to_owned(),
            sponsor_label: sponsor_label.trim().to_owned(),
            duration_hours,
            extra_approval_required: zone.requires_extra_approval,
            auto_expires: true,
            status: "draft".to_owned(),
            authoritative: false,
        };
        self.guest_pass_drafts.push(draft.clone());
        self.append_audit(
            "create_guest_draft",
            &draft.id,
            "created a purpose-bound auto-expiring guest draft without issuing a pass",
        );
        Ok(draft)
    }

    pub fn create_loss_case(
        &mut self,
        fixture: &CampusPassFixture,
        credential_id: &str,
        requested_action: &str,
    ) -> Result<CredentialLossCase, DomainError> {
        if !fixture
            .credentials
            .iter()
            .any(|item| item.id == credential_id)
            || !matches!(requested_action, "freeze" | "report_lost" | "restore")
        {
            return Err(DomainError::InvariantViolation(
                "Loss case needs a registered credential and supported action.".to_owned(),
            ));
        }
        let official_action_url = fixture
            .sources
            .iter()
            .find(|source| source.id == "src-security-fixture")
            .map_or_else(String::new, |source| source.official_url.clone());
        let case = CredentialLossCase {
            id: format!("loss-case-{:03}", self.loss_cases.len() + 1),
            credential_id: credential_id.to_owned(),
            requested_action: requested_action.to_owned(),
            status: "draft_ready_for_official_channel".to_owned(),
            official_action_url,
            experience_executed_action: false,
            created_at: self.next_time(),
        };
        self.loss_cases.push(case.clone());
        self.append_audit(
            "prepare_loss_action",
            credential_id,
            "prepared the official handoff without freezing, revoking or restoring a credential",
        );
        Ok(case)
    }

    pub fn check_offline(
        &mut self,
        fixture: &CampusPassFixture,
        credential_id: &str,
        zone_id: &str,
        carrier: &str,
    ) -> Result<OfflineCredentialCheck, DomainError> {
        let credential = fixture
            .credentials
            .iter()
            .find(|item| item.id == credential_id)
            .ok_or_else(|| {
                DomainError::InvariantViolation(
                    "Offline check needs a registered credential.".to_owned(),
                )
            })?;
        if !fixture.zones.iter().any(|zone| zone.id == zone_id)
            || !fixture
                .offline_policy
                .accepted_carriers
                .iter()
                .any(|item| item == carrier)
        {
            return Err(DomainError::InvariantViolation(
                "Offline check needs a registered zone and approved offline carrier.".to_owned(),
            ));
        }
        let unavailable = fixture
            .offline_policy
            .unavailable_zone_ids
            .iter()
            .any(|item| item == zone_id);
        let in_scope = credential.scope_zone_ids.iter().any(|item| item == zone_id);
        let valid = credential.state == "active" && in_scope && !unavailable;
        let check = OfflineCredentialCheck {
            id: format!("offline-check-{:03}", self.offline_checks.len() + 1),
            credential_id: credential_id.to_owned(),
            zone_id: zone_id.to_owned(),
            carrier: carrier.to_owned(),
            valid,
            cryptographically_verified: false,
            official_access_granted: false,
            reason: if unavailable {
                "该区域不接受离线凭证，必须走在线或人工核验。".to_owned()
            } else if !in_scope {
                "凭证的最小权限范围不包含该区域。".to_owned()
            } else if credential.state != "active" {
                format!("凭证状态为 {}，离线校验拒绝。", credential.state)
            } else {
                format!(
                    "Fixture 仅模拟期限与范围检查；{}，未执行真实签名或门锁验证。",
                    fixture.offline_policy.cryptographic_verification
                )
            },
            checked_at: self.next_time(),
        };
        self.offline_checks.push(check.clone());
        self.append_audit(
            "check_offline",
            credential_id,
            "checked fixture freshness and scope without claiming cryptographic or access success",
        );
        Ok(check)
    }

    pub fn correct_access_log(
        &mut self,
        fixture: &CampusPassFixture,
        record_id: &str,
        reason: &str,
    ) -> Result<AccessLogCorrection, DomainError> {
        if !fixture
            .self_access_records
            .iter()
            .any(|record| record.id == record_id)
            || reason.trim().len() < 8
        {
            return Err(DomainError::InvariantViolation(
                "Access-log correction needs a registered record and reviewable reason.".to_owned(),
            ));
        }
        let correction = AccessLogCorrection {
            id: format!("pass-correction-{:03}", self.log_corrections.len() + 1),
            record_id: record_id.to_owned(),
            reason: reason.trim().to_owned(),
            status: "submitted".to_owned(),
            created_at: self.next_time(),
        };
        self.log_corrections.push(correction.clone());
        self.append_audit(
            "correct_access_log",
            record_id,
            "submitted an append-only correction without rewriting the source record",
        );
        Ok(correction)
    }

    pub fn choose_manual_fallback(
        &mut self,
        fixture: &CampusPassFixture,
        fallback_id: &str,
        reason: &str,
    ) -> Result<ManualFallbackSelection, DomainError> {
        let fallback = fixture
            .manual_fallbacks
            .iter()
            .find(|item| item.id == fallback_id)
            .ok_or_else(|| {
                DomainError::InvariantViolation(
                    "Manual fallback needs a registered route.".to_owned(),
                )
            })?;
        if reason.trim().len() < 4 {
            return Err(DomainError::InvariantViolation(
                "Manual fallback needs a short reason for the handoff.".to_owned(),
            ));
        }
        let official_action_url = fixture
            .sources
            .iter()
            .find(|source| source.id == fallback.source_id)
            .map_or_else(String::new, |source| source.official_url.clone());
        let selection = ManualFallbackSelection {
            id: format!(
                "manual-fallback-{:03}",
                self.manual_fallback_selections.len() + 1
            ),
            fallback_id: fallback_id.to_owned(),
            reason: reason.trim().to_owned(),
            status: "handoff_ready".to_owned(),
            official_action_url,
            experience_executed_access: false,
            created_at: self.next_time(),
        };
        self.manual_fallback_selections.push(selection.clone());
        self.append_audit(
            "choose_manual_fallback",
            fallback_id,
            "prepared a no-phone accessible handoff without executing access",
        );
        Ok(selection)
    }

    #[must_use]
    pub fn box_score(&self, fixture: &CampusPassFixture) -> CampusPassBoxScore {
        CampusPassBoxScore {
            wallet_credentials: fixture.credentials.len(),
            active_credentials: fixture
                .credentials
                .iter()
                .filter(|item| item.state == "active")
                .count(),
            pending_requests: self
                .access_requests
                .iter()
                .filter(|item| {
                    matches!(
                        item.status.as_str(),
                        "submitted" | "reviewing" | "draft_blocked_prerequisites"
                    )
                })
                .count(),
            manual_fallbacks: fixture.manual_fallbacks.len(),
            official_credentials_issued: 0,
            official_access_actions_executed: 0,
            source_passwords_stored: 0,
            secret_material_stored: 0,
            precise_tracking_events: 0,
            audit_events: self.audit.len(),
            non_authoritative: true,
        }
    }

    fn next_time(&self) -> String {
        format!("2026-07-24T11:{:02}:00+08:00", self.audit.len().min(59))
    }

    fn append_audit(&mut self, action: &str, target_id: &str, detail: &str) {
        let sequence = self.audit.last().map_or(1, |event| event.sequence + 1);
        let previous_event_hash = self.audit.last().map(|event| event.event_hash.clone());
        self.audit.push(PassAuditEvent {
            id: format!("pass-event-{sequence:03}"),
            sequence,
            action: action.to_owned(),
            target_id: target_id.to_owned(),
            detail: detail.to_owned(),
            occurred_at: self.next_time(),
            previous_event_hash,
            event_hash: format!("fnv1a-pass-event-{sequence:03}"),
        });
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn fixture() -> CampusPassFixture {
        serde_json::from_str(include_str!("../../../fixtures/v1/campus-pass.demo.json"))
            .expect("Campus Pass fixture")
    }

    #[test]
    fn fixture_preserves_authority_privacy_and_no_phone_fallbacks() {
        let fixture = fixture();
        fixture.validate().expect("valid Campus Pass fixture");
        assert!(
            fixture
                .manual_fallbacks
                .iter()
                .any(|item| !item.requires_phone)
        );
        assert!(
            fixture
                .self_access_records
                .iter()
                .all(|record| !record.precise_location_retained)
        );
        assert!(
            fixture
                .emergency_modes
                .iter()
                .all(|mode| !mode.experience_layer_can_execute)
        );
    }

    #[test]
    fn dynamic_screenshot_is_rejected_and_reader_never_grants_access() {
        let fixture = fixture();
        let mut session = CampusPassSession::from_fixture(&fixture);
        let rejected = session
            .present_credential(&fixture, "credential-student-active", "dynamic_qr", true)
            .expect("static screenshot result");
        assert!(!rejected.accepted_by_demo_reader);
        assert!(!rejected.official_access_granted);
        let accepted = session
            .present_credential(&fixture, "credential-student-active", "nfc", false)
            .expect("fixture reader result");
        assert!(accepted.accepted_by_demo_reader);
        assert!(!accepted.official_access_granted);
    }

    #[test]
    fn access_and_guest_requests_preserve_prerequisites_and_authority() {
        let fixture = fixture();
        let mut session = CampusPassSession::from_fixture(&fixture);
        let open = session
            .request_access(
                &fixture,
                "credential-student-active",
                "zone-library",
                "完成晚间课程复习",
            )
            .expect("library request");
        assert_eq!(open.status, "submitted");
        assert!(!open.authoritative);
        session
            .update_request_mirror(&open.id, "reviewing")
            .expect("mirror update");
        let blocked = session
            .request_access(
                &fixture,
                "credential-student-active",
                "zone-robotics-lab",
                "完成课程实验",
            )
            .expect("blocked lab request");
        assert_eq!(blocked.status, "draft_blocked_prerequisites");
        assert!(!blocked.missing_prerequisite_ids.is_empty());
        let guest = session
            .create_guest_draft(&fixture, "zone-library", "参加公开讲座", "NAN Fixture", 2)
            .expect("guest draft");
        assert!(guest.auto_expires);
        assert!(!guest.authoritative);
    }

    #[test]
    fn loss_offline_log_and_manual_paths_execute_no_official_action() {
        let fixture = fixture();
        let mut session = CampusPassSession::from_fixture(&fixture);
        let loss = session
            .create_loss_case(&fixture, "credential-student-active", "freeze")
            .expect("loss case");
        assert!(!loss.experience_executed_action);
        let offline = session
            .check_offline(
                &fixture,
                "credential-student-active",
                "zone-robotics-lab",
                "nfc",
            )
            .expect("offline check");
        assert!(!offline.valid);
        assert!(!offline.cryptographically_verified);
        session
            .correct_access_log(
                &fixture,
                "access-record-001",
                "本人当时没有进入该区域，请核对读卡器记录。",
            )
            .expect("log correction");
        let manual = session
            .choose_manual_fallback(&fixture, "fallback-access-desk", "手机没电，需要人工核验")
            .expect("manual fallback");
        assert!(!manual.experience_executed_access);
        let score = session.box_score(&fixture);
        assert_eq!(score.official_credentials_issued, 0);
        assert_eq!(score.official_access_actions_executed, 0);
        assert_eq!(score.precise_tracking_events, 0);
    }
}

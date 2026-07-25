use crate::{DomainError, SCHEMA_VERSION};
use serde::{Deserialize, Serialize};
use std::collections::{BTreeMap, BTreeSet};

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
pub struct CampusEvidenceSource {
    pub id: String,
    pub provider: String,
    pub official_url: String,
    pub version: String,
    pub updated_at: String,
    pub expires_at: Option<String>,
    pub verification_status: String,
    pub correction_route: String,
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
pub struct CampusResource {
    pub id: String,
    pub category: String,
    pub title: String,
    pub summary: String,
    pub intent_tags: Vec<String>,
    pub location_id: Option<String>,
    pub delivery_mode: String,
    pub accessibility: Vec<String>,
    pub official_action_url: String,
    pub service_boundary: String,
    pub source_id: String,
    pub status: String,
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
pub struct CampusEvent {
    pub id: String,
    pub title: String,
    pub host: String,
    pub starts_at: String,
    pub ends_at: String,
    pub deadline_at: String,
    pub location_id: String,
    pub delivery_mode: String,
    pub cost_label: String,
    pub eligibility: String,
    pub accessibility: Vec<String>,
    pub source_id: String,
    pub status: String,
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
pub struct CampusLocation {
    pub id: String,
    pub label: String,
    pub zone: String,
    pub x: u16,
    pub y: u16,
    pub accessibility: Vec<String>,
    pub source_id: String,
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
pub struct CampusRouteOption {
    pub id: String,
    pub from_location_id: String,
    pub to_location_id: String,
    pub label: String,
    pub estimated_minutes: u16,
    pub accessible: bool,
    pub steps: Vec<String>,
    pub source_id: String,
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
pub struct CampusTeamListing {
    pub id: String,
    pub title: String,
    pub role_gap: String,
    pub hours_per_week: u8,
    pub collaboration_mode: String,
    pub minimum_public_fields: Vec<String>,
    pub source_id: String,
    pub report_route: String,
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
pub struct CampusMentorProfile {
    pub id: String,
    pub display_name: String,
    pub qualification: String,
    pub help_topics: Vec<String>,
    pub boundaries: Vec<String>,
    pub verified: bool,
    pub source_id: String,
    pub report_route: String,
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
pub struct CampusEscalationRoute {
    pub id: String,
    pub issue_type: String,
    pub title: String,
    pub channel: String,
    pub official_url: String,
    pub scope: String,
    pub emergency: bool,
    pub available_label: String,
    pub source_id: String,
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
pub struct CampusLifeInvariants {
    pub no_official_result_claims: bool,
    pub no_auto_registration_or_cancellation: bool,
    pub profiling_can_be_disabled: bool,
    pub mycourt_private_by_default: bool,
    pub no_default_location_tracking: bool,
    pub mutual_intent_before_disclosure: bool,
    pub emergency_routes_are_direct: bool,
    pub emergency_and_marketing_separated: bool,
    pub no_participation_value_score: bool,
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
pub struct CampusLifeFixture {
    pub schema_version: String,
    pub data_mode: String,
    pub generated_at: String,
    pub last_updated_at: String,
    pub sources: Vec<CampusEvidenceSource>,
    pub resources: Vec<CampusResource>,
    pub events: Vec<CampusEvent>,
    pub locations: Vec<CampusLocation>,
    pub routes: Vec<CampusRouteOption>,
    pub team_listings: Vec<CampusTeamListing>,
    pub mentors: Vec<CampusMentorProfile>,
    pub escalation_routes: Vec<CampusEscalationRoute>,
    pub interest_catalog: Vec<String>,
    pub invariants: CampusLifeInvariants,
}

impl CampusLifeFixture {
    pub fn validate(&self) -> Result<(), DomainError> {
        if self.schema_version != SCHEMA_VERSION {
            return Err(DomainError::UnsupportedSchema(self.schema_version.clone()));
        }
        if self.data_mode != "demo_fixture" {
            return Err(DomainError::InvariantViolation(
                "Campus Life must remain an explicit demo fixture.".to_owned(),
            ));
        }
        if self.sources.len() < 3
            || self.resources.len() < 5
            || self.events.len() < 4
            || self.locations.len() < 4
        {
            return Err(DomainError::InvariantViolation(
                "Campus Life fixture needs bounded source, service, event and map coverage."
                    .to_owned(),
            ));
        }

        let source_ids: BTreeSet<&str> = self
            .sources
            .iter()
            .map(|source| source.id.as_str())
            .collect();
        if self.sources.iter().any(|source| {
            !source.official_url.starts_with("https://")
                || source.correction_route.trim().is_empty()
        }) {
            return Err(DomainError::InvariantViolation(
                "Every Campus Life source needs an HTTPS official URL and correction route."
                    .to_owned(),
            ));
        }
        if self
            .resources
            .iter()
            .any(|item| !source_ids.contains(item.source_id.as_str()))
            || self
                .events
                .iter()
                .any(|item| !source_ids.contains(item.source_id.as_str()))
            || self
                .locations
                .iter()
                .any(|item| !source_ids.contains(item.source_id.as_str()))
            || self
                .routes
                .iter()
                .any(|item| !source_ids.contains(item.source_id.as_str()))
        {
            return Err(DomainError::InvariantViolation(
                "Campus Life records must reference registered evidence sources.".to_owned(),
            ));
        }

        let location_ids: BTreeSet<&str> = self
            .locations
            .iter()
            .map(|location| location.id.as_str())
            .collect();
        if self.events.iter().any(|event| {
            !location_ids.contains(event.location_id.as_str())
                || !matches!(event.status.as_str(), "active" | "expired" | "unknown")
        }) || self.routes.iter().any(|route| {
            !location_ids.contains(route.from_location_id.as_str())
                || !location_ids.contains(route.to_location_id.as_str())
        }) {
            return Err(DomainError::InvariantViolation(
                "Campus events and routes need registered locations and explicit states."
                    .to_owned(),
            ));
        }
        if !self.events.iter().any(|event| event.status == "expired")
            || !self.routes.iter().any(|route| route.accessible)
            || !self
                .escalation_routes
                .iter()
                .any(|route| route.emergency && route.official_url.starts_with("https://"))
        {
            return Err(DomainError::InvariantViolation(
                "Campus Life needs expired, accessible-route and direct-emergency QA examples."
                    .to_owned(),
            ));
        }

        let invariants = &self.invariants;
        if !invariants.no_official_result_claims
            || !invariants.no_auto_registration_or_cancellation
            || !invariants.profiling_can_be_disabled
            || !invariants.mycourt_private_by_default
            || !invariants.no_default_location_tracking
            || !invariants.mutual_intent_before_disclosure
            || !invariants.emergency_routes_are_direct
            || !invariants.emergency_and_marketing_separated
            || !invariants.no_participation_value_score
        {
            return Err(DomainError::InvariantViolation(
                "Campus Life safety and control invariants must remain enabled.".to_owned(),
            ));
        }
        Ok(())
    }
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
pub struct CampusSearchQuery {
    pub text: String,
    pub category: Option<String>,
    pub location_id: Option<String>,
    pub delivery_mode: Option<String>,
    pub accessibility_required: bool,
    pub include_expired: bool,
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
pub struct CampusSearchResult {
    pub resource_ids: Vec<String>,
    pub event_ids: Vec<String>,
    pub active_filters: Vec<String>,
    pub fallback_used: bool,
    pub explanation: String,
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
pub struct CampusPreferenceProfile {
    pub profiling_enabled: bool,
    pub interests: Vec<String>,
    pub academic_stage: String,
    pub purpose: String,
    pub expires_at: String,
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
pub struct CampusSavedItem {
    pub target_id: String,
    pub target_type: String,
    pub saved_at: String,
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
pub struct CampusCalendarEntry {
    pub event_id: String,
    pub starts_at: String,
    pub ends_at: String,
    pub conflict_labels: Vec<String>,
    pub registration_performed: bool,
    pub saved_at: String,
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
pub struct CampusJourneyMirror {
    pub resource_id: String,
    pub status: String,
    pub completed_step_ids: Vec<String>,
    pub personal_note: String,
    pub authoritative: bool,
    pub last_checked_at: String,
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
pub struct CampusTeamIntent {
    pub listing_id: String,
    pub student_confirmed: bool,
    pub provider_confirmed: bool,
    pub disclosure_status: String,
    pub disclosed_fields: Vec<String>,
    pub updated_at: String,
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
pub struct CampusMentorHandoff {
    pub id: String,
    pub mentor_id: String,
    pub questions: Vec<String>,
    pub evidence_ids: Vec<String>,
    pub consent_confirmed: bool,
    pub mentor_response: Option<String>,
    pub status: String,
    pub created_at: String,
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
pub struct CampusNotificationSettings {
    pub enabled_categories: Vec<String>,
    pub frequency: String,
    pub quiet_hours: String,
    pub emergency_enabled: bool,
    pub marketing_enabled: bool,
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
pub struct CampusSourceCorrection {
    pub id: String,
    pub target_id: String,
    pub reason: String,
    pub status: String,
    pub created_at: String,
    pub review_due_at: String,
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
pub struct CampusFootprintReceipt {
    pub id: String,
    pub target_id: String,
    pub participation: String,
    pub reflection: String,
    pub private: bool,
    pub affects_student_value: bool,
    pub created_at: String,
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
pub struct CampusAuditEvent {
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
pub struct CampusMyCourtExport {
    pub schema_version: String,
    pub data_mode: String,
    pub generated_at: String,
    pub trusted: bool,
    pub private: bool,
    pub saved_items: Vec<CampusSavedItem>,
    pub journey_mirrors: Vec<CampusJourneyMirror>,
    pub receipts: Vec<CampusFootprintReceipt>,
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
pub struct CampusBoxScore {
    pub discoverable_items: usize,
    pub verified_sources: usize,
    pub saved_items: usize,
    pub calendar_entries: usize,
    pub accessible_routes: usize,
    pub mutual_intents: usize,
    pub official_results_claimed: usize,
    pub location_tracking_events: usize,
    pub participation_value_scores: usize,
    pub audit_events: usize,
    pub non_authoritative: bool,
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
pub struct CampusLifeSession {
    pub schema_version: String,
    pub data_mode: String,
    pub profile: CampusPreferenceProfile,
    pub saved_items: Vec<CampusSavedItem>,
    pub calendar_entries: Vec<CampusCalendarEntry>,
    pub journey_mirrors: Vec<CampusJourneyMirror>,
    pub team_intents: Vec<CampusTeamIntent>,
    pub mentor_handoffs: Vec<CampusMentorHandoff>,
    pub notification_settings: CampusNotificationSettings,
    pub source_corrections: Vec<CampusSourceCorrection>,
    pub receipts: Vec<CampusFootprintReceipt>,
    pub audit: Vec<CampusAuditEvent>,
}

impl CampusLifeSession {
    #[must_use]
    pub fn from_fixture(fixture: &CampusLifeFixture) -> Self {
        Self {
            schema_version: SCHEMA_VERSION.to_owned(),
            data_mode: "demo_fixture".to_owned(),
            profile: CampusPreferenceProfile {
                profiling_enabled: true,
                interests: vec!["研究".to_owned(), "创作".to_owned()],
                academic_stage: "本科 · 第 4 / 8 赛季".to_owned(),
                purpose: "只用于本次 Campus Life 推荐，可随时关闭。".to_owned(),
                expires_at: "2026-08-31T23:59:00+08:00".to_owned(),
            },
            saved_items: vec![],
            calendar_entries: vec![],
            journey_mirrors: vec![CampusJourneyMirror {
                resource_id: "service-library-access".to_owned(),
                status: "in_progress".to_owned(),
                completed_step_ids: vec!["read-official-guide".to_owned()],
                personal_note: "下次到馆前核对开放时间。".to_owned(),
                authoritative: false,
                last_checked_at: fixture.last_updated_at.clone(),
            }],
            team_intents: vec![],
            mentor_handoffs: vec![],
            notification_settings: CampusNotificationSettings {
                enabled_categories: vec!["deadline".to_owned(), "service".to_owned()],
                frequency: "daily_digest".to_owned(),
                quiet_hours: "22:30–08:00".to_owned(),
                emergency_enabled: true,
                marketing_enabled: false,
            },
            source_corrections: vec![],
            receipts: vec![],
            audit: vec![CampusAuditEvent {
                id: "campus-event-001".to_owned(),
                sequence: 1,
                action: "view".to_owned(),
                target_id: "campus-life-fixture".to_owned(),
                detail: "loaded sanitized Campus Life fixture without official-result claims"
                    .to_owned(),
                occurred_at: fixture.generated_at.clone(),
                previous_event_hash: None,
                event_hash: "fnv1a-campus-event-001".to_owned(),
            }],
        }
    }

    pub fn search(
        &mut self,
        fixture: &CampusLifeFixture,
        query: &CampusSearchQuery,
    ) -> CampusSearchResult {
        let text = query.text.trim().to_lowercase();
        let resource_ids = fixture
            .resources
            .iter()
            .filter(|resource| {
                (query.include_expired || resource.status != "expired")
                    && query
                        .category
                        .as_ref()
                        .is_none_or(|category| &resource.category == category)
                    && query
                        .location_id
                        .as_ref()
                        .is_none_or(|location| resource.location_id.as_ref() == Some(location))
                    && query
                        .delivery_mode
                        .as_ref()
                        .is_none_or(|mode| &resource.delivery_mode == mode)
                    && (!query.accessibility_required || !resource.accessibility.is_empty())
                    && (text.is_empty()
                        || format!(
                            "{} {} {}",
                            resource.title,
                            resource.summary,
                            resource.intent_tags.join(" ")
                        )
                        .to_lowercase()
                        .contains(&text))
            })
            .map(|resource| resource.id.clone())
            .collect::<Vec<_>>();
        let event_ids = fixture
            .events
            .iter()
            .filter(|event| {
                (query.include_expired || event.status != "expired")
                    && query
                        .location_id
                        .as_ref()
                        .is_none_or(|location| &event.location_id == location)
                    && query
                        .delivery_mode
                        .as_ref()
                        .is_none_or(|mode| &event.delivery_mode == mode)
                    && (!query.accessibility_required || !event.accessibility.is_empty())
                    && (text.is_empty()
                        || format!("{} {} {}", event.title, event.host, event.eligibility)
                            .to_lowercase()
                            .contains(&text))
            })
            .map(|event| event.id.clone())
            .collect::<Vec<_>>();
        let mut active_filters = Vec::new();
        if !text.is_empty() {
            active_filters.push(format!("目标：{}", query.text.trim()));
        }
        if let Some(category) = &query.category {
            active_filters.push(format!("类别：{category}"));
        }
        if let Some(location) = &query.location_id {
            active_filters.push(format!("地点：{location}"));
        }
        if let Some(mode) = &query.delivery_mode {
            active_filters.push(format!("形式：{mode}"));
        }
        if query.accessibility_required {
            active_filters.push("需要无障碍信息".to_owned());
        }
        if query.include_expired {
            active_filters.push("包含过期".to_owned());
        }
        let result = CampusSearchResult {
            resource_ids,
            event_ids,
            active_filters,
            fallback_used: !self.profile.profiling_enabled,
            explanation: if self.profile.profiling_enabled {
                "按显式筛选与本人主动选择的兴趣排序；不读取位置轨迹、门禁或支付。".to_owned()
            } else {
                "画像已关闭；仅按筛选、时间与类别排序。".to_owned()
            },
        };
        self.append_audit(
            "search",
            "campus-catalog",
            &format!(
                "returned {} resources and {} events with explicit filters",
                result.resource_ids.len(),
                result.event_ids.len()
            ),
        );
        result
    }

    pub fn update_profile(
        &mut self,
        fixture: &CampusLifeFixture,
        profiling_enabled: bool,
        interests: Vec<String>,
    ) -> Result<CampusPreferenceProfile, DomainError> {
        let catalog: BTreeSet<&str> = fixture
            .interest_catalog
            .iter()
            .map(String::as_str)
            .collect();
        if interests
            .iter()
            .any(|interest| !catalog.contains(interest.as_str()))
        {
            return Err(DomainError::InvariantViolation(
                "Campus interests must come from the explicit public catalog.".to_owned(),
            ));
        }
        self.profile.profiling_enabled = profiling_enabled;
        self.profile.interests = if profiling_enabled {
            interests
                .into_iter()
                .collect::<BTreeSet<_>>()
                .into_iter()
                .collect()
        } else {
            vec![]
        };
        self.append_audit(
            "update_profile",
            "campus-profile",
            if profiling_enabled {
                "student enabled bounded preference profile"
            } else {
                "student disabled preference profile; ranking fell back to time and category"
            },
        );
        Ok(self.profile.clone())
    }

    pub fn save_item(
        &mut self,
        fixture: &CampusLifeFixture,
        target_id: &str,
        target_type: &str,
    ) -> Result<CampusSavedItem, DomainError> {
        let exists = match target_type {
            "service" => fixture.resources.iter().any(|item| item.id == target_id),
            "event" => fixture.events.iter().any(|item| item.id == target_id),
            "team" => fixture
                .team_listings
                .iter()
                .any(|item| item.id == target_id),
            "mentor" => fixture.mentors.iter().any(|item| item.id == target_id),
            _ => false,
        };
        if !exists {
            return Err(DomainError::InvariantViolation(
                "MyCOURT can save only registered Campus Life items.".to_owned(),
            ));
        }
        if let Some(existing) = self
            .saved_items
            .iter()
            .find(|item| item.target_id == target_id)
        {
            return Ok(existing.clone());
        }
        let item = CampusSavedItem {
            target_id: target_id.to_owned(),
            target_type: target_type.to_owned(),
            saved_at: self.next_time(),
        };
        self.saved_items.push(item.clone());
        self.append_audit(
            "save_mycourt",
            target_id,
            "saved privately without publishing a participation signal",
        );
        Ok(item)
    }

    pub fn save_event_to_calendar(
        &mut self,
        fixture: &CampusLifeFixture,
        event_id: &str,
    ) -> Result<CampusCalendarEntry, DomainError> {
        let event = fixture
            .events
            .iter()
            .find(|item| item.id == event_id)
            .ok_or_else(|| {
                DomainError::InvariantViolation("Campus event does not exist.".to_owned())
            })?;
        if event.status == "expired" {
            return Err(DomainError::InvariantViolation(
                "Expired events cannot be added to the active calendar.".to_owned(),
            ));
        }
        if let Some(existing) = self
            .calendar_entries
            .iter()
            .find(|item| item.event_id == event_id)
        {
            return Ok(existing.clone());
        }
        let mut conflicts = Vec::new();
        if event_id == "event-film-room" {
            conflicts.push("SLS 240 · 周三 14:00–15:40".to_owned());
        }
        let entry = CampusCalendarEntry {
            event_id: event_id.to_owned(),
            starts_at: event.starts_at.clone(),
            ends_at: event.ends_at.clone(),
            conflict_labels: conflicts,
            registration_performed: false,
            saved_at: self.next_time(),
        };
        self.calendar_entries.push(entry.clone());
        self.append_audit(
            "save_calendar",
            event_id,
            "saved a local calendar mirror and conflict note; no registration performed",
        );
        Ok(entry)
    }

    pub fn route(
        &mut self,
        fixture: &CampusLifeFixture,
        from_location_id: &str,
        to_location_id: &str,
        accessible_only: bool,
    ) -> Result<CampusRouteOption, DomainError> {
        let route = fixture
            .routes
            .iter()
            .filter(|route| {
                route.from_location_id == from_location_id
                    && route.to_location_id == to_location_id
                    && (!accessible_only || route.accessible)
            })
            .min_by_key(|route| route.estimated_minutes)
            .cloned()
            .ok_or_else(|| {
                DomainError::InvariantViolation(
                    "No registered route satisfies the requested accessibility boundary."
                        .to_owned(),
                )
            })?;
        self.append_audit(
            "plan_route",
            &route.id,
            "returned a static 2D route without starting location tracking",
        );
        Ok(route)
    }

    pub fn update_journey(
        &mut self,
        fixture: &CampusLifeFixture,
        resource_id: &str,
        status: &str,
        completed_step_ids: Vec<String>,
        personal_note: &str,
    ) -> Result<CampusJourneyMirror, DomainError> {
        if !fixture.resources.iter().any(|item| item.id == resource_id)
            || !matches!(
                status,
                "saved" | "in_progress" | "waiting_external" | "closed"
            )
        {
            return Err(DomainError::InvariantViolation(
                "Journey mirrors need a registered service and a known mirror state.".to_owned(),
            ));
        }
        let mirror = CampusJourneyMirror {
            resource_id: resource_id.to_owned(),
            status: status.to_owned(),
            completed_step_ids: completed_step_ids
                .into_iter()
                .collect::<BTreeSet<_>>()
                .into_iter()
                .collect(),
            personal_note: personal_note.trim().to_owned(),
            authoritative: false,
            last_checked_at: self.next_time(),
        };
        self.journey_mirrors
            .retain(|item| item.resource_id != resource_id);
        self.journey_mirrors.push(mirror.clone());
        self.append_audit(
            "update_journey_mirror",
            resource_id,
            "updated a personal mirror without claiming official approval or completion",
        );
        Ok(mirror)
    }

    pub fn set_student_intent(
        &mut self,
        fixture: &CampusLifeFixture,
        listing_id: &str,
    ) -> Result<CampusTeamIntent, DomainError> {
        if !fixture
            .team_listings
            .iter()
            .any(|item| item.id == listing_id)
        {
            return Err(DomainError::InvariantViolation(
                "Team listing does not exist.".to_owned(),
            ));
        }
        let intent = CampusTeamIntent {
            listing_id: listing_id.to_owned(),
            student_confirmed: true,
            provider_confirmed: false,
            disclosure_status: "waiting_counterparty".to_owned(),
            disclosed_fields: vec![],
            updated_at: self.next_time(),
        };
        self.team_intents
            .retain(|item| item.listing_id != listing_id);
        self.team_intents.push(intent.clone());
        self.append_audit(
            "team_intent",
            listing_id,
            "student expressed interest; no additional profile disclosure",
        );
        Ok(intent)
    }

    pub fn confirm_team_counterparty(
        &mut self,
        listing_id: &str,
    ) -> Result<CampusTeamIntent, DomainError> {
        let updated_at = self.next_time();
        let intent = self
            .team_intents
            .iter_mut()
            .find(|item| item.listing_id == listing_id)
            .ok_or_else(|| {
                DomainError::InvariantViolation(
                    "Student intent is required before provider confirmation.".to_owned(),
                )
            })?;
        intent.provider_confirmed = true;
        intent.disclosure_status = "mutual_intent".to_owned();
        intent.disclosed_fields = vec![
            "preferred_contact_window".to_owned(),
            "collaboration_mode".to_owned(),
        ];
        intent.updated_at = updated_at;
        let result = intent.clone();
        self.append_audit(
            "team_mutual_intent",
            listing_id,
            "both sides confirmed before minimum additional disclosure",
        );
        Ok(result)
    }

    pub fn build_mentor_handoff(
        &mut self,
        fixture: &CampusLifeFixture,
        mentor_id: &str,
        questions: Vec<String>,
        evidence_ids: Vec<String>,
        consent_confirmed: bool,
    ) -> Result<CampusMentorHandoff, DomainError> {
        if !consent_confirmed
            || questions.iter().all(|question| question.trim().is_empty())
            || !fixture.mentors.iter().any(|mentor| mentor.id == mentor_id)
        {
            return Err(DomainError::InvariantViolation(
                "Mentor handoff needs a registered mentor, a real question and student consent."
                    .to_owned(),
            ));
        }
        let source_ids: BTreeSet<&str> = fixture
            .sources
            .iter()
            .map(|source| source.id.as_str())
            .collect();
        if evidence_ids
            .iter()
            .any(|source_id| !source_ids.contains(source_id.as_str()))
        {
            return Err(DomainError::InvariantViolation(
                "Mentor handoff evidence must be registered.".to_owned(),
            ));
        }
        let handoff = CampusMentorHandoff {
            id: format!("mentor-handoff-{:03}", self.mentor_handoffs.len() + 1),
            mentor_id: mentor_id.to_owned(),
            questions: questions
                .into_iter()
                .map(|question| question.trim().to_owned())
                .filter(|question| !question.is_empty())
                .collect(),
            evidence_ids: evidence_ids
                .into_iter()
                .collect::<BTreeSet<_>>()
                .into_iter()
                .collect(),
            consent_confirmed: true,
            mentor_response: None,
            status: "ready_for_student".to_owned(),
            created_at: self.next_time(),
        };
        self.mentor_handoffs.push(handoff.clone());
        self.append_audit(
            "mentor_handoff",
            &handoff.id,
            "prepared student-approved questions without fabricating mentor response",
        );
        Ok(handoff)
    }

    pub fn update_notifications(
        &mut self,
        enabled_categories: Vec<String>,
        frequency: &str,
        quiet_hours: &str,
        marketing_enabled: bool,
    ) -> Result<CampusNotificationSettings, DomainError> {
        if !matches!(frequency, "realtime" | "daily_digest" | "weekly")
            || quiet_hours.trim().is_empty()
        {
            return Err(DomainError::InvariantViolation(
                "Notification governance needs a known frequency and quiet hours.".to_owned(),
            ));
        }
        self.notification_settings = CampusNotificationSettings {
            enabled_categories: enabled_categories
                .into_iter()
                .filter(|category| category != "emergency" && category != "marketing")
                .collect::<BTreeSet<_>>()
                .into_iter()
                .collect(),
            frequency: frequency.to_owned(),
            quiet_hours: quiet_hours.to_owned(),
            emergency_enabled: true,
            marketing_enabled,
        };
        self.append_audit(
            "update_notifications",
            "notification-policy",
            "kept emergency separate and applied student-controlled non-emergency frequency",
        );
        Ok(self.notification_settings.clone())
    }

    pub fn report_source(
        &mut self,
        fixture: &CampusLifeFixture,
        target_id: &str,
        reason: &str,
    ) -> Result<CampusSourceCorrection, DomainError> {
        let target_exists = fixture.resources.iter().any(|item| item.id == target_id)
            || fixture.events.iter().any(|item| item.id == target_id)
            || fixture.sources.iter().any(|item| item.id == target_id);
        if !target_exists || reason.trim().len() < 8 {
            return Err(DomainError::InvariantViolation(
                "Source correction needs a registered target and reviewable reason.".to_owned(),
            ));
        }
        let created_at = self.next_time();
        let correction = CampusSourceCorrection {
            id: format!("campus-correction-{:03}", self.source_corrections.len() + 1),
            target_id: target_id.to_owned(),
            reason: reason.trim().to_owned(),
            status: "submitted".to_owned(),
            created_at: created_at.clone(),
            review_due_at: "2026-07-27T10:00:00+08:00".to_owned(),
        };
        self.source_corrections.push(correction.clone());
        self.append_audit(
            "report_source",
            target_id,
            "submitted an expiry or accuracy report without silently rewriting the source",
        );
        Ok(correction)
    }

    pub fn record_receipt(
        &mut self,
        fixture: &CampusLifeFixture,
        target_id: &str,
        participation: &str,
        reflection: &str,
    ) -> Result<CampusFootprintReceipt, DomainError> {
        if !fixture.events.iter().any(|event| event.id == target_id)
            || !matches!(participation, "attended" | "not_attended" | "unknown")
        {
            return Err(DomainError::InvariantViolation(
                "Campus receipt needs a registered event and explicit participation state."
                    .to_owned(),
            ));
        }
        let receipt = CampusFootprintReceipt {
            id: format!("campus-receipt-{:03}", self.receipts.len() + 1),
            target_id: target_id.to_owned(),
            participation: participation.to_owned(),
            reflection: reflection.trim().to_owned(),
            private: true,
            affects_student_value: false,
            created_at: self.next_time(),
        };
        self.receipts.push(receipt.clone());
        self.append_audit(
            "record_private_receipt",
            target_id,
            "stored an optional private receipt without participation scoring or location tracking",
        );
        Ok(receipt)
    }

    #[must_use]
    pub fn export_mycourt(&self) -> CampusMyCourtExport {
        CampusMyCourtExport {
            schema_version: SCHEMA_VERSION.to_owned(),
            data_mode: "demo_fixture".to_owned(),
            generated_at: self.next_time(),
            trusted: false,
            private: true,
            saved_items: self.saved_items.clone(),
            journey_mirrors: self.journey_mirrors.clone(),
            receipts: self.receipts.clone(),
        }
    }

    #[must_use]
    pub fn box_score(&self, fixture: &CampusLifeFixture) -> CampusBoxScore {
        CampusBoxScore {
            discoverable_items: fixture.resources.len() + fixture.events.len(),
            verified_sources: fixture
                .sources
                .iter()
                .filter(|source| source.verification_status == "verified_fixture")
                .count(),
            saved_items: self.saved_items.len(),
            calendar_entries: self.calendar_entries.len(),
            accessible_routes: fixture
                .routes
                .iter()
                .filter(|route| route.accessible)
                .count(),
            mutual_intents: self
                .team_intents
                .iter()
                .filter(|intent| intent.disclosure_status == "mutual_intent")
                .count(),
            official_results_claimed: 0,
            location_tracking_events: 0,
            participation_value_scores: 0,
            audit_events: self.audit.len(),
            non_authoritative: true,
        }
    }

    fn next_time(&self) -> String {
        format!("2026-07-24T10:{:02}:00+08:00", self.audit.len().min(59))
    }

    fn append_audit(&mut self, action: &str, target_id: &str, detail: &str) {
        let sequence = self.audit.last().map_or(1, |event| event.sequence + 1);
        let previous_event_hash = self.audit.last().map(|event| event.event_hash.clone());
        self.audit.push(CampusAuditEvent {
            id: format!("campus-event-{sequence:03}"),
            sequence,
            action: action.to_owned(),
            target_id: target_id.to_owned(),
            detail: detail.to_owned(),
            occurred_at: self.next_time(),
            previous_event_hash,
            event_hash: format!("fnv1a-campus-event-{sequence:03}"),
        });
    }
}

#[must_use]
pub fn campus_recommendations(
    fixture: &CampusLifeFixture,
    session: &CampusLifeSession,
) -> BTreeMap<String, String> {
    if !session.profile.profiling_enabled {
        return fixture
            .events
            .iter()
            .filter(|event| event.status == "active")
            .take(3)
            .map(|event| (event.id.clone(), "画像关闭：按时间与状态排序。".to_owned()))
            .collect();
    }
    fixture
        .events
        .iter()
        .filter(|event| event.status == "active")
        .take(3)
        .map(|event| {
            (
                event.id.clone(),
                format!(
                    "基于本人选择的兴趣（{}）与当前赛季；未使用位置、门禁、支付或健康数据。",
                    session.profile.interests.join("、")
                ),
            )
        })
        .collect()
}

#[cfg(test)]
mod tests {
    use super::*;

    fn fixture() -> CampusLifeFixture {
        serde_json::from_str(include_str!("../../../fixtures/v1/campus-life.demo.json"))
            .expect("Campus Life fixture")
    }

    #[test]
    fn fixture_preserves_sources_expiry_accessibility_and_direct_help() {
        let fixture = fixture();
        fixture.validate().expect("valid Campus Life fixture");
        assert!(fixture.events.iter().any(|event| event.status == "expired"));
        assert!(fixture.routes.iter().any(|route| route.accessible));
        assert!(
            fixture
                .escalation_routes
                .iter()
                .any(|route| route.emergency)
        );
    }

    #[test]
    fn search_profile_and_calendar_preserve_student_control() {
        let fixture = fixture();
        let mut session = CampusLifeSession::from_fixture(&fixture);
        let result = session.search(
            &fixture,
            &CampusSearchQuery {
                text: "实验".to_owned(),
                category: None,
                location_id: None,
                delivery_mode: None,
                accessibility_required: true,
                include_expired: false,
            },
        );
        assert!(!result.event_ids.is_empty());
        session
            .update_profile(&fixture, false, vec![])
            .expect("disable profile");
        let fallback = session.search(
            &fixture,
            &CampusSearchQuery {
                text: String::new(),
                category: None,
                location_id: None,
                delivery_mode: None,
                accessibility_required: false,
                include_expired: false,
            },
        );
        assert!(fallback.fallback_used);
        let calendar = session
            .save_event_to_calendar(&fixture, "event-film-room")
            .expect("calendar");
        assert!(!calendar.conflict_labels.is_empty());
        assert!(!calendar.registration_performed);
    }

    #[test]
    fn route_journey_and_mycourt_never_claim_official_results_or_tracking() {
        let fixture = fixture();
        let mut session = CampusLifeSession::from_fixture(&fixture);
        let route = session
            .route(&fixture, "loc-dorm", "loc-library", true)
            .expect("accessible route");
        assert!(route.accessible);
        let mirror = session
            .update_journey(
                &fixture,
                "service-library-access",
                "waiting_external",
                vec!["read-official-guide".to_owned()],
                "等待官方系统反馈。",
            )
            .expect("journey");
        assert!(!mirror.authoritative);
        session
            .save_item(&fixture, "service-library-access", "service")
            .expect("save");
        let export = session.export_mycourt();
        assert!(export.private);
        assert!(!export.trusted);
        let score = session.box_score(&fixture);
        assert_eq!(score.official_results_claimed, 0);
        assert_eq!(score.location_tracking_events, 0);
    }

    #[test]
    fn mutual_intent_mentor_notifications_and_receipts_preserve_boundaries() {
        let fixture = fixture();
        let mut session = CampusLifeSession::from_fixture(&fixture);
        let pending = session
            .set_student_intent(&fixture, "team-signal-story")
            .expect("student intent");
        assert!(pending.disclosed_fields.is_empty());
        let mutual = session
            .confirm_team_counterparty("team-signal-story")
            .expect("mutual");
        assert_eq!(mutual.disclosure_status, "mutual_intent");
        let handoff = session
            .build_mentor_handoff(
                &fixture,
                "mentor-senior-fixture",
                vec!["这条路径的正式入口在哪里？".to_owned()],
                vec!["src-student-affairs".to_owned()],
                true,
            )
            .expect("mentor handoff");
        assert!(handoff.mentor_response.is_none());
        let settings = session
            .update_notifications(
                vec!["deadline".to_owned(), "marketing".to_owned()],
                "daily_digest",
                "22:30–08:00",
                false,
            )
            .expect("notifications");
        assert!(settings.emergency_enabled);
        assert!(
            !settings
                .enabled_categories
                .contains(&"marketing".to_owned())
        );
        let receipt = session
            .record_receipt(
                &fixture,
                "event-maker-night",
                "attended",
                "只记录自己的收获。",
            )
            .expect("receipt");
        assert!(receipt.private);
        assert!(!receipt.affects_student_value);
    }
}

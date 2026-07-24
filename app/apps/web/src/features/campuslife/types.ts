export type CampusStage =
  | "concourse"
  | "map"
  | "mycourt"
  | "squad"
  | "support"
  | "replay";

export type CampusTargetType = "service" | "event" | "team" | "mentor";
export type CampusParticipation = "attended" | "not_attended" | "unknown";
export type CampusJourneyStatus =
  | "saved"
  | "in_progress"
  | "waiting_external"
  | "closed";

export interface CampusEvidenceSource {
  id: string;
  provider: string;
  official_url: string;
  version: string;
  updated_at: string;
  expires_at: string | null;
  verification_status: "verified_fixture" | "unverified" | "expired";
  correction_route: string;
}

export interface CampusResource {
  id: string;
  category: string;
  title: string;
  summary: string;
  intent_tags: string[];
  location_id: string | null;
  delivery_mode: "online" | "in_person" | "hybrid";
  accessibility: string[];
  official_action_url: string;
  service_boundary: string;
  source_id: string;
  status: "active" | "expired" | "unknown";
}

export interface CampusEvent {
  id: string;
  title: string;
  host: string;
  starts_at: string;
  ends_at: string;
  deadline_at: string;
  location_id: string;
  delivery_mode: "online" | "in_person" | "hybrid";
  cost_label: string;
  eligibility: string;
  accessibility: string[];
  source_id: string;
  status: "active" | "expired" | "unknown";
}

export interface CampusLocation {
  id: string;
  label: string;
  zone: string;
  x: number;
  y: number;
  accessibility: string[];
  source_id: string;
}

export interface CampusRouteOption {
  id: string;
  from_location_id: string;
  to_location_id: string;
  label: string;
  estimated_minutes: number;
  accessible: boolean;
  steps: string[];
  source_id: string;
}

export interface CampusTeamListing {
  id: string;
  title: string;
  role_gap: string;
  hours_per_week: number;
  collaboration_mode: string;
  minimum_public_fields: string[];
  source_id: string;
  report_route: string;
}

export interface CampusMentor {
  id: string;
  display_name: string;
  qualification: string;
  help_topics: string[];
  boundaries: string[];
  verified: boolean;
  source_id: string;
  report_route: string;
}

export interface CampusEscalationRoute {
  id: string;
  issue_type: string;
  title: string;
  channel: string;
  official_url: string;
  scope: string;
  emergency: boolean;
  available_label: string;
  source_id: string;
}

export interface CampusLifeFixture {
  schema_version: "1.0.0";
  data_mode: "demo_fixture";
  generated_at: string;
  last_updated_at: string;
  sources: CampusEvidenceSource[];
  resources: CampusResource[];
  events: CampusEvent[];
  locations: CampusLocation[];
  routes: CampusRouteOption[];
  team_listings: CampusTeamListing[];
  mentors: CampusMentor[];
  escalation_routes: CampusEscalationRoute[];
  interest_catalog: string[];
  invariants: {
    no_official_result_claims: true;
    no_auto_registration_or_cancellation: true;
    profiling_can_be_disabled: true;
    mycourt_private_by_default: true;
    no_default_location_tracking: true;
    mutual_intent_before_disclosure: true;
    emergency_routes_are_direct: true;
    emergency_and_marketing_separated: true;
    no_participation_value_score: true;
  };
}

export interface CampusSearchQuery {
  text: string;
  category: string | null;
  location_id: string | null;
  delivery_mode: "online" | "in_person" | "hybrid" | null;
  accessibility_required: boolean;
  include_expired: boolean;
}

export interface CampusSearchResult {
  resource_ids: string[];
  event_ids: string[];
  active_filters: string[];
  fallback_used: boolean;
  explanation: string;
}

export interface CampusPreferenceProfile {
  profiling_enabled: boolean;
  interests: string[];
  academic_stage: string;
  purpose: string;
  expires_at: string;
}

export interface CampusSavedItem {
  target_id: string;
  target_type: CampusTargetType;
  saved_at: string;
}

export interface CampusCalendarEntry {
  event_id: string;
  starts_at: string;
  ends_at: string;
  conflict_labels: string[];
  registration_performed: false;
  saved_at: string;
}

export interface CampusJourneyMirror {
  resource_id: string;
  status: CampusJourneyStatus;
  completed_step_ids: string[];
  personal_note: string;
  authoritative: false;
  last_checked_at: string;
}

export interface CampusTeamIntent {
  listing_id: string;
  student_confirmed: boolean;
  provider_confirmed: boolean;
  disclosure_status: "waiting_counterparty" | "mutual_intent";
  disclosed_fields: string[];
  updated_at: string;
}

export interface CampusMentorHandoff {
  id: string;
  mentor_id: string;
  questions: string[];
  evidence_ids: string[];
  consent_confirmed: true;
  mentor_response: null;
  status: "ready_for_student";
  created_at: string;
}

export interface CampusNotificationSettings {
  enabled_categories: string[];
  frequency: "realtime" | "daily_digest" | "weekly";
  quiet_hours: string;
  emergency_enabled: true;
  marketing_enabled: boolean;
}

export interface CampusCorrection {
  id: string;
  target_id: string;
  reason: string;
  status: "submitted" | "in_review" | "resolved" | "rejected";
  created_at: string;
  review_due_at: string;
}

export interface CampusReceipt {
  id: string;
  target_id: string;
  participation: CampusParticipation;
  reflection: string;
  private: true;
  affects_student_value: false;
  created_at: string;
}

export interface CampusAuditEvent {
  id: string;
  sequence: number;
  action: string;
  target_id: string;
  detail: string;
  occurred_at: string;
  previous_event_hash: string | null;
  event_hash: string;
}

export interface CampusLifeState {
  stage: CampusStage;
  fixture: CampusLifeFixture;
  traditional: boolean;
  reduced_motion: boolean;
  offline: boolean;
  profile: CampusPreferenceProfile;
  search_query: CampusSearchQuery;
  search_result: CampusSearchResult;
  saved_items: CampusSavedItem[];
  calendar_entries: CampusCalendarEntry[];
  selected_location_id: string;
  selected_route: CampusRouteOption | null;
  journey_mirrors: CampusJourneyMirror[];
  team_intents: CampusTeamIntent[];
  mentor_handoffs: CampusMentorHandoff[];
  notification_settings: CampusNotificationSettings;
  corrections: CampusCorrection[];
  receipts: CampusReceipt[];
  audit: CampusAuditEvent[];
}

export interface CampusBoxScore {
  discoverable_items: number;
  verified_sources: number;
  saved_items: number;
  calendar_entries: number;
  accessible_routes: number;
  mutual_intents: number;
  official_results_claimed: 0;
  location_tracking_events: 0;
  participation_value_scores: 0;
  audit_events: number;
}

export type CampusPassStage =
  | "wallet"
  | "reader"
  | "requests"
  | "support"
  | "replay";

export type PassCarrier =
  | "physical_card"
  | "nfc"
  | "dynamic_qr"
  | "mobile";

export type PassEvidenceSource = {
  id: string;
  provider: string;
  official_url: string;
  version: string;
  updated_at: string;
  verification_status: string;
  correction_route: string;
};

export type IdentityLink = {
  id: string;
  subject_label: string;
  role: string;
  authority_source_id: string;
  status: string;
  verified_at: string;
  expires_at: string;
  source_password_stored: false;
};

export type PassCredential = {
  id: string;
  title: string;
  issuer: string;
  credential_type: string;
  supported_carriers: PassCarrier[];
  scope_zone_ids: string[];
  purpose: string;
  valid_from: string;
  expires_at: string;
  state: "active" | "pending" | "expired";
  source_ids: string[];
  minimum_privilege: true;
  secret_material_stored: false;
};

export type AccessZone = {
  id: string;
  label: string;
  sensitivity: "standard" | "controlled" | "service";
  allowed_roles: string[];
  time_window: string;
  requires_extra_approval: boolean;
  source_id: string;
};

export type AccessPrerequisite = {
  id: string;
  zone_id: string;
  label: string;
  status: "fulfilled" | "missing" | "unknown";
  official_action_url: string;
  source_id: string;
};

export type GuestPassPolicy = {
  id: string;
  allowed_zone_ids: string[];
  maximum_hours: number;
  sponsor_required: true;
  purpose_required: true;
  sensitive_area_extra_approval: true;
  auto_expiry_required: true;
  source_id: string;
};

export type PassOfflinePolicy = {
  valid_until: string;
  accepted_carriers: PassCarrier[];
  unavailable_zone_ids: string[];
  screenshot_is_credential: false;
  cryptographic_verification: string;
  source_id: string;
};

export type SelfAccessRecord = {
  id: string;
  occurred_at: string;
  zone_id: string;
  result: "source_reported_allowed" | "source_reported_denied";
  purpose: string;
  source_id: string;
  retained_until: string;
  precise_location_retained: false;
  correction_route: string;
};

export type EmergencyAccessMode = {
  id: string;
  title: string;
  status: string;
  authority: string;
  official_url: string;
  experience_layer_can_execute: false;
  source_id: string;
};

export type ManualAccessFallback = {
  id: string;
  label: string;
  conditions: string[];
  channel: string;
  accessible: true;
  requires_phone: false;
  source_id: string;
};

export type CampusPassInvariants = {
  no_official_credential_issuance: true;
  no_source_password_storage: true;
  no_secret_material_storage: true;
  static_screenshot_never_dynamic_credential: true;
  minimum_privilege_default: true;
  access_state_is_authority_mirror: true;
  no_precise_mobility_profile: true;
  emergency_execution_stays_external: true;
  phone_is_not_required: true;
};

export type CampusPassFixture = {
  schema_version: "1.0.0";
  data_mode: "demo_fixture";
  generated_at: string;
  last_updated_at: string;
  sources: PassEvidenceSource[];
  identities: IdentityLink[];
  credentials: PassCredential[];
  zones: AccessZone[];
  prerequisites: AccessPrerequisite[];
  guest_policy: GuestPassPolicy;
  offline_policy: PassOfflinePolicy;
  self_access_records: SelfAccessRecord[];
  emergency_modes: EmergencyAccessMode[];
  manual_fallbacks: ManualAccessFallback[];
  invariants: CampusPassInvariants;
};

export type CredentialPresentation = {
  id: string;
  credential_id: string;
  carrier: PassCarrier;
  static_capture: boolean;
  accepted_by_demo_reader: boolean;
  official_access_granted: false;
  reason: string;
  occurred_at: string;
};

export type AccessRequestStatus =
  | "draft_blocked_credential"
  | "draft_blocked_prerequisites"
  | "submitted"
  | "reviewing"
  | "approved"
  | "externally_executed"
  | "denied"
  | "expired"
  | "fault"
  | "appeal";

export type AccessRequestMirror = {
  id: string;
  credential_id: string;
  zone_id: string;
  purpose: string;
  status: AccessRequestStatus;
  missing_prerequisite_ids: string[];
  authoritative: false;
  experience_executed_access: false;
  official_action_url: string;
  updated_at: string;
};

export type GuestPassDraft = {
  id: string;
  zone_id: string;
  purpose: string;
  sponsor_label: string;
  duration_hours: number;
  extra_approval_required: boolean;
  auto_expires: true;
  status: "draft";
  authoritative: false;
};

export type CredentialLossCase = {
  id: string;
  credential_id: string;
  requested_action: "freeze" | "report_lost" | "restore";
  status: "draft_ready_for_official_channel";
  official_action_url: string;
  experience_executed_action: false;
  created_at: string;
};

export type AccessLogCorrection = {
  id: string;
  record_id: string;
  reason: string;
  status: "submitted";
  created_at: string;
};

export type OfflineCredentialCheck = {
  id: string;
  credential_id: string;
  zone_id: string;
  carrier: PassCarrier;
  valid: boolean;
  cryptographically_verified: false;
  official_access_granted: false;
  reason: string;
  checked_at: string;
};

export type ManualFallbackSelection = {
  id: string;
  fallback_id: string;
  reason: string;
  status: "handoff_ready";
  official_action_url: string;
  experience_executed_access: false;
  created_at: string;
};

export type PassAuditEvent = {
  id: string;
  sequence: number;
  action: string;
  target_id: string;
  detail: string;
  occurred_at: string;
  previous_event_hash: string | null;
  event_hash: string;
};

export type CampusPassState = {
  stage: CampusPassStage;
  fixture: CampusPassFixture;
  selected_credential_id: string;
  selected_carrier: PassCarrier;
  traditional: boolean;
  reduced_motion: boolean;
  presentations: CredentialPresentation[];
  access_requests: AccessRequestMirror[];
  guest_pass_drafts: GuestPassDraft[];
  loss_cases: CredentialLossCase[];
  log_corrections: AccessLogCorrection[];
  offline_checks: OfflineCredentialCheck[];
  manual_fallback_selections: ManualFallbackSelection[];
  audit: PassAuditEvent[];
};

export type CampusPassBoxScore = {
  wallet_credentials: number;
  active_credentials: number;
  pending_requests: number;
  manual_fallbacks: number;
  official_credentials_issued: 0;
  official_access_actions_executed: 0;
  source_passwords_stored: 0;
  secret_material_stored: 0;
  precise_tracking_events: 0;
  audit_events: number;
  non_authoritative: true;
};

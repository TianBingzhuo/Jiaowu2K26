import { CAMPUS_PASS_FIXTURE } from "./fixture";
import type {
  AccessRequestMirror,
  AccessRequestStatus,
  CampusPassBoxScore,
  CampusPassFixture,
  CampusPassStage,
  CampusPassState,
  CredentialPresentation,
  PassAuditEvent,
  PassCarrier,
} from "./types";

const BASE_TIME = new Date("2026-07-24T11:00:00+08:00").getTime();

const eventTime = (sequence: number) =>
  new Date(BASE_TIME + sequence * 60_000).toISOString();

const nextId = (prefix: string, count: number) =>
  `${prefix}-${String(count + 1).padStart(3, "0")}`;

const sourceUrl = (fixture: CampusPassFixture, sourceId: string) =>
  fixture.sources.find((source) => source.id === sourceId)?.official_url ?? "";

const appendAudit = (
  state: CampusPassState,
  action: string,
  targetId: string,
  detail: string,
): CampusPassState => {
  const previous = state.audit.at(-1);
  const sequence = (previous?.sequence ?? 0) + 1;
  const event: PassAuditEvent = {
    id: `pass-event-${String(sequence).padStart(3, "0")}`,
    sequence,
    action,
    target_id: targetId,
    detail,
    occurred_at: eventTime(sequence),
    previous_event_hash: previous?.event_hash ?? null,
    event_hash: `fnv1a-pass-event-${String(sequence).padStart(3, "0")}`,
  };
  return { ...state, audit: [...state.audit, event] };
};

export const createCampusPassState = (
  fixture: CampusPassFixture = CAMPUS_PASS_FIXTURE,
): CampusPassState => {
  const cloned = structuredClone(fixture);
  const selected = cloned.credentials[0];
  if (!selected) throw new Error("Campus Pass Fixture 缺少演示凭证。");

  return {
    stage: "wallet",
    fixture: cloned,
    selected_credential_id: selected.id,
    selected_carrier: selected.supported_carriers[0] ?? "physical_card",
    traditional: false,
    reduced_motion: false,
    presentations: [],
    access_requests: [],
    guest_pass_drafts: [],
    loss_cases: [],
    log_corrections: [],
    offline_checks: [],
    manual_fallback_selections: [],
    audit: [
      {
        id: "pass-event-001",
        sequence: 1,
        action: "view_wallet",
        target_id: "campus-pass-fixture",
        detail:
          "loaded sanitized pass fixture without issuing a credential or executing access",
        occurred_at: cloned.generated_at,
        previous_event_hash: null,
        event_hash: "fnv1a-pass-event-001",
      },
    ],
  };
};

export const setCampusPassStage = (
  state: CampusPassState,
  stage: CampusPassStage,
): CampusPassState => ({ ...state, stage });

export const setCampusPassPreferences = (
  state: CampusPassState,
  values: Partial<
    Pick<CampusPassState, "traditional" | "reduced_motion">
  >,
): CampusPassState => ({ ...state, ...values });

export const selectCredential = (
  state: CampusPassState,
  credentialId: string,
): CampusPassState => {
  const credential = state.fixture.credentials.find(
    (item) => item.id === credentialId,
  );
  if (!credential) throw new Error("只能选择已登记的 Fixture 凭证。");

  return appendAudit(
    {
      ...state,
      selected_credential_id: credential.id,
      selected_carrier:
        credential.supported_carriers[0] ?? "physical_card",
    },
    "select_credential",
    credentialId,
    "selected a fixture wallet item without activating or issuing it",
  );
};

export const setCarrier = (
  state: CampusPassState,
  carrier: PassCarrier,
): CampusPassState => {
  const credential = state.fixture.credentials.find(
    (item) => item.id === state.selected_credential_id,
  );
  if (!credential?.supported_carriers.includes(carrier)) {
    throw new Error("当前凭证不支持这类载体。");
  }
  return { ...state, selected_carrier: carrier };
};

export const presentCredential = (
  state: CampusPassState,
  staticCapture: boolean,
): CampusPassState => {
  const credential = state.fixture.credentials.find(
    (item) => item.id === state.selected_credential_id,
  );
  if (!credential) throw new Error("请先从 Wallet 选择凭证。");

  const screenshotRejected =
    state.selected_carrier === "dynamic_qr" && staticCapture;
  const accepted =
    credential.state === "active" && !screenshotRejected;
  const presentation: CredentialPresentation = {
    id: nextId("pass-presentation", state.presentations.length),
    credential_id: credential.id,
    carrier: state.selected_carrier,
    static_capture: staticCapture,
    accepted_by_demo_reader: accepted,
    official_access_granted: false,
    reason: screenshotRejected
      ? "静态截图不能冒充动态凭证；请回到正式凭证载体或人工核验。"
      : credential.state !== "active"
        ? `凭证状态为 ${credential.state}；Demo Reader 拒绝继续。`
        : "仅完成本地 Fixture Reader 校验；没有向门锁发送指令。",
    occurred_at: eventTime(state.audit.length + 1),
  };

  return appendAudit(
    {
      ...state,
      presentations: [...state.presentations, presentation],
    },
    "present_credential",
    credential.id,
    screenshotRejected
      ? "rejected a static capture of a dynamic credential"
      : "ran a local fixture reader without granting official access",
  );
};

export const requestAccess = (
  state: CampusPassState,
  zoneId: string,
  purpose: string,
): CampusPassState => {
  const credential = state.fixture.credentials.find(
    (item) => item.id === state.selected_credential_id,
  );
  const zone = state.fixture.zones.find((item) => item.id === zoneId);
  if (!credential || !zone) {
    throw new Error("权限申请需要已登记的凭证和区域。");
  }
  if (purpose.trim().length < 4) {
    throw new Error("请写清楚可复核的访问目的。");
  }

  const missing = state.fixture.prerequisites
    .filter((item) => item.zone_id === zoneId && item.status !== "fulfilled")
    .map((item) => item.id);
  if (!credential.scope_zone_ids.includes(zoneId)) {
    missing.push("minimum-scope-not-granted");
  }
  if (zone.requires_extra_approval) {
    missing.push("sensitive-area-extra-approval");
  }
  const uniqueMissing = [...new Set(missing)].sort();
  const status: AccessRequestStatus =
    credential.state !== "active"
      ? "draft_blocked_credential"
      : uniqueMissing.length === 0
        ? "submitted"
        : "draft_blocked_prerequisites";

  const request: AccessRequestMirror = {
    id: nextId("pass-request", state.access_requests.length),
    credential_id: credential.id,
    zone_id: zoneId,
    purpose: purpose.trim(),
    status,
    missing_prerequisite_ids: uniqueMissing,
    authoritative: false,
    experience_executed_access: false,
    official_action_url: sourceUrl(state.fixture, zone.source_id),
    updated_at: eventTime(state.audit.length + 1),
  };

  return appendAudit(
    {
      ...state,
      access_requests: [...state.access_requests, request],
    },
    "request_access",
    request.id,
    "created a non-authoritative access request mirror and preserved prerequisite blockers",
  );
};

export const updateRequestMirror = (
  state: CampusPassState,
  requestId: string,
  status: AccessRequestStatus,
): CampusPassState => {
  const request = state.access_requests.find((item) => item.id === requestId);
  if (!request) throw new Error("找不到这条申请镜像。");
  if (request.status.startsWith("draft_blocked")) {
    throw new Error("前置条件未满足，不能模拟推进权威状态。");
  }

  return appendAudit(
    {
      ...state,
      access_requests: state.access_requests.map((item) =>
        item.id === requestId
          ? {
              ...item,
              status,
              authoritative: false,
              experience_executed_access: false,
              updated_at: eventTime(state.audit.length + 1),
            }
          : item,
      ),
    },
    "update_authority_mirror",
    requestId,
    "updated a fixture authority mirror without executing access",
  );
};

export const createGuestDraft = (
  state: CampusPassState,
  zoneId: string,
  purpose: string,
  sponsorLabel: string,
  durationHours: number,
): CampusPassState => {
  const zone = state.fixture.zones.find((item) => item.id === zoneId);
  const policy = state.fixture.guest_policy;
  if (
    !zone ||
    !policy.allowed_zone_ids.includes(zoneId) ||
    purpose.trim().length < 4 ||
    sponsorLabel.trim().length < 2 ||
    durationHours < 1 ||
    durationHours > policy.maximum_hours
  ) {
    throw new Error("访客草稿必须满足用途、担保人、时限和允许区域规则。");
  }

  const draft = {
    id: nextId("guest-draft", state.guest_pass_drafts.length),
    zone_id: zoneId,
    purpose: purpose.trim(),
    sponsor_label: sponsorLabel.trim(),
    duration_hours: durationHours,
    extra_approval_required: zone.requires_extra_approval,
    auto_expires: true as const,
    status: "draft" as const,
    authoritative: false as const,
  };

  return appendAudit(
    {
      ...state,
      guest_pass_drafts: [...state.guest_pass_drafts, draft],
    },
    "create_guest_draft",
    draft.id,
    "created a purpose-bound auto-expiring guest draft without issuing a pass",
  );
};

export const createLossCase = (
  state: CampusPassState,
  action: "freeze" | "report_lost" | "restore",
): CampusPassState => {
  const credential = state.fixture.credentials.find(
    (item) => item.id === state.selected_credential_id,
  );
  if (!credential) throw new Error("请先选择要处理的凭证。");

  const lossCase = {
    id: nextId("loss-case", state.loss_cases.length),
    credential_id: credential.id,
    requested_action: action,
    status: "draft_ready_for_official_channel" as const,
    official_action_url: sourceUrl(
      state.fixture,
      "src-security-fixture",
    ),
    experience_executed_action: false as const,
    created_at: eventTime(state.audit.length + 1),
  };

  return appendAudit(
    { ...state, loss_cases: [...state.loss_cases, lossCase] },
    "prepare_loss_action",
    credential.id,
    "prepared the official handoff without freezing, revoking or restoring a credential",
  );
};

export const checkOffline = (
  state: CampusPassState,
  zoneId: string,
  carrier: PassCarrier,
): CampusPassState => {
  const credential = state.fixture.credentials.find(
    (item) => item.id === state.selected_credential_id,
  );
  const zone = state.fixture.zones.find((item) => item.id === zoneId);
  if (
    !credential ||
    !zone ||
    !state.fixture.offline_policy.accepted_carriers.includes(carrier)
  ) {
    throw new Error("离线检查需要登记区域和受支持的离线载体。");
  }

  const unavailable =
    state.fixture.offline_policy.unavailable_zone_ids.includes(zoneId);
  const inScope = credential.scope_zone_ids.includes(zoneId);
  const valid =
    credential.state === "active" && inScope && !unavailable;
  const check = {
    id: nextId("offline-check", state.offline_checks.length),
    credential_id: credential.id,
    zone_id: zoneId,
    carrier,
    valid,
    cryptographically_verified: false as const,
    official_access_granted: false as const,
    reason: unavailable
      ? "该区域不接受离线凭证，必须走在线或人工核验。"
      : !inScope
        ? "凭证的最小权限范围不包含该区域。"
        : credential.state !== "active"
          ? `凭证状态为 ${credential.state}，离线校验拒绝。`
          : `Fixture 仅模拟期限与范围检查；${state.fixture.offline_policy.cryptographic_verification}。`,
    checked_at: eventTime(state.audit.length + 1),
  };

  return appendAudit(
    { ...state, offline_checks: [...state.offline_checks, check] },
    "check_offline",
    credential.id,
    "checked fixture freshness and scope without claiming cryptographic or access success",
  );
};

export const correctAccessLog = (
  state: CampusPassState,
  recordId: string,
  reason: string,
): CampusPassState => {
  if (
    !state.fixture.self_access_records.some((item) => item.id === recordId) ||
    reason.trim().length < 8
  ) {
    throw new Error("记录纠错需要已登记记录和可复核说明。");
  }
  const correction = {
    id: nextId("pass-correction", state.log_corrections.length),
    record_id: recordId,
    reason: reason.trim(),
    status: "submitted" as const,
    created_at: eventTime(state.audit.length + 1),
  };
  return appendAudit(
    {
      ...state,
      log_corrections: [...state.log_corrections, correction],
    },
    "correct_access_log",
    recordId,
    "submitted an append-only correction without rewriting the source record",
  );
};

export const chooseManualFallback = (
  state: CampusPassState,
  fallbackId: string,
  reason: string,
): CampusPassState => {
  const fallback = state.fixture.manual_fallbacks.find(
    (item) => item.id === fallbackId,
  );
  if (!fallback || reason.trim().length < 4) {
    throw new Error("人工回退需要已登记渠道和简要原因。");
  }
  const selection = {
    id: nextId(
      "manual-fallback",
      state.manual_fallback_selections.length,
    ),
    fallback_id: fallbackId,
    reason: reason.trim(),
    status: "handoff_ready" as const,
    official_action_url: sourceUrl(state.fixture, fallback.source_id),
    experience_executed_access: false as const,
    created_at: eventTime(state.audit.length + 1),
  };
  return appendAudit(
    {
      ...state,
      manual_fallback_selections: [
        ...state.manual_fallback_selections,
        selection,
      ],
    },
    "choose_manual_fallback",
    fallbackId,
    "prepared a no-phone accessible handoff without executing access",
  );
};

export const campusPassBoxScore = (
  state: CampusPassState,
): CampusPassBoxScore => ({
  wallet_credentials: state.fixture.credentials.length,
  active_credentials: state.fixture.credentials.filter(
    (item) => item.state === "active",
  ).length,
  pending_requests: state.access_requests.filter((item) =>
    [
      "submitted",
      "reviewing",
      "draft_blocked_prerequisites",
    ].includes(item.status),
  ).length,
  manual_fallbacks: state.fixture.manual_fallbacks.length,
  official_credentials_issued: 0,
  official_access_actions_executed: 0,
  source_passwords_stored: 0,
  secret_material_stored: 0,
  precise_tracking_events: 0,
  audit_events: state.audit.length,
  non_authoritative: true,
});

export const selectedCredential = (state: CampusPassState) => {
  const credential = state.fixture.credentials.find(
    (item) => item.id === state.selected_credential_id,
  );
  if (!credential) throw new Error("Campus Pass 选择状态无效。");
  return credential;
};

export const zoneLabel = (state: CampusPassState, zoneId: string) =>
  state.fixture.zones.find((zone) => zone.id === zoneId)?.label ?? zoneId;

export const sourceFor = (state: CampusPassState, sourceId: string) => {
  const source = state.fixture.sources.find((item) => item.id === sourceId);
  if (!source) throw new Error(`未登记来源：${sourceId}`);
  return source;
};

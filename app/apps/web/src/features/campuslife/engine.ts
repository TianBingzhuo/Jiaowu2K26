import { CAMPUS_LIFE_FIXTURE } from "./fixture";
import type {
  CampusAuditEvent,
  CampusBoxScore,
  CampusJourneyStatus,
  CampusLifeFixture,
  CampusLifeState,
  CampusParticipation,
  CampusRouteOption,
  CampusSearchQuery,
  CampusSearchResult,
  CampusStage,
  CampusTargetType,
} from "./types";

const BASE_TIME = new Date("2026-07-24T10:15:00+08:00").getTime();

const eventTime = (sequence: number) =>
  new Date(BASE_TIME + sequence * 60_000).toISOString();

const appendAudit = (
  state: CampusLifeState,
  action: string,
  targetId: string,
  detail: string,
): CampusLifeState => {
  const previous = state.audit.at(-1);
  const sequence = (previous?.sequence ?? 0) + 1;
  const event: CampusAuditEvent = {
    id: `campus-event-${String(sequence).padStart(3, "0")}`,
    sequence,
    action,
    target_id: targetId,
    detail,
    occurred_at: eventTime(sequence),
    previous_event_hash: previous?.event_hash ?? null,
    event_hash: `fnv1a-campus-event-${String(sequence).padStart(3, "0")}`,
  };
  return { ...state, audit: [...state.audit, event] };
};

const assertMutable = (state: CampusLifeState) => {
  if (state.offline) {
    throw new Error("离线模式可浏览已缓存内容，但不能写入新的 Campus Life 回执。");
  }
};

const targetExists = (
  fixture: CampusLifeFixture,
  targetId: string,
  targetType: CampusTargetType,
) => {
  if (targetType === "service") {
    return fixture.resources.some((item) => item.id === targetId);
  }
  if (targetType === "event") {
    return fixture.events.some((item) => item.id === targetId);
  }
  if (targetType === "team") {
    return fixture.team_listings.some((item) => item.id === targetId);
  }
  return fixture.mentors.some((item) => item.id === targetId);
};

const initialQuery: CampusSearchQuery = {
  text: "",
  category: null,
  location_id: null,
  delivery_mode: null,
  accessibility_required: false,
  include_expired: false,
};

const computeSearch = (
  state: Pick<CampusLifeState, "fixture" | "profile">,
  query: CampusSearchQuery,
): CampusSearchResult => {
  const text = query.text.trim().toLocaleLowerCase();
  const resource_ids = state.fixture.resources
    .filter(
      (resource) =>
        (query.include_expired || resource.status !== "expired") &&
        (!query.category || resource.category === query.category) &&
        (!query.location_id || resource.location_id === query.location_id) &&
        (!query.delivery_mode ||
          resource.delivery_mode === query.delivery_mode) &&
        (!query.accessibility_required ||
          resource.accessibility.length > 0) &&
        (!text ||
          `${resource.title} ${resource.summary} ${resource.intent_tags.join(" ")}`
            .toLocaleLowerCase()
            .includes(text)),
    )
    .map((resource) => resource.id);
  const event_ids = state.fixture.events
    .filter(
      (event) =>
        (query.include_expired || event.status !== "expired") &&
        (!query.location_id || event.location_id === query.location_id) &&
        (!query.delivery_mode || event.delivery_mode === query.delivery_mode) &&
        (!query.accessibility_required || event.accessibility.length > 0) &&
        (!text ||
          `${event.title} ${event.host} ${event.eligibility}`
            .toLocaleLowerCase()
            .includes(text)),
    )
    .map((event) => event.id);
  const active_filters = [
    text ? `目标：${query.text.trim()}` : "",
    query.category ? `类别：${query.category}` : "",
    query.location_id ? `地点：${query.location_id}` : "",
    query.delivery_mode ? `形式：${query.delivery_mode}` : "",
    query.accessibility_required ? "需要无障碍信息" : "",
    query.include_expired ? "包含过期记录" : "",
  ].filter(Boolean);
  return {
    resource_ids,
    event_ids,
    active_filters,
    fallback_used: !state.profile.profiling_enabled,
    explanation: state.profile.profiling_enabled
      ? "按显式目标与本人主动选择的兴趣解释推荐；不读取位置、门禁、支付或健康数据。"
      : "画像已关闭；仅按显式筛选、时间与状态排列。",
  };
};

export const createCampusLifeState = (
  fixture: CampusLifeFixture = CAMPUS_LIFE_FIXTURE,
): CampusLifeState => {
  const cloned = structuredClone(fixture);
  const profile = {
    profiling_enabled: true,
    interests: ["研究", "创作"],
    academic_stage: "本科 · 记录覆盖 5 个学期",
    purpose: "只用于本次 Campus Life 推荐，可随时关闭。",
    expires_at: "2026-08-31T23:59:00+08:00",
  };
  const state: CampusLifeState = {
    stage: "concourse",
    fixture: cloned,
    traditional: false,
    reduced_motion: false,
    offline: false,
    profile,
    search_query: structuredClone(initialQuery),
    search_result: {
      resource_ids: [],
      event_ids: [],
      active_filters: [],
      fallback_used: false,
      explanation: "",
    },
    saved_items: [],
    calendar_entries: [],
    selected_location_id: "loc-library",
    selected_route: null,
    journey_mirrors: [
      {
        resource_id: "service-library-access",
        status: "in_progress",
        completed_step_ids: ["read-official-guide"],
        personal_note: "下次到馆前核对开放时间。",
        authoritative: false,
        last_checked_at: cloned.last_updated_at,
      },
    ],
    team_intents: [],
    mentor_handoffs: [],
    notification_settings: {
      enabled_categories: ["deadline", "service"],
      frequency: "daily_digest",
      quiet_hours: "22:30–08:00",
      emergency_enabled: true,
      marketing_enabled: false,
    },
    corrections: [],
    receipts: [],
    audit: [
      {
        id: "campus-event-001",
        sequence: 1,
        action: "view",
        target_id: "campus-life-fixture",
        detail:
          "loaded sanitized Campus Life fixture without official-result claims",
        occurred_at: cloned.generated_at,
        previous_event_hash: null,
        event_hash: "fnv1a-campus-event-001",
      },
    ],
  };
  return {
    ...state,
    search_result: computeSearch(state, state.search_query),
  };
};

export const setCampusStage = (
  state: CampusLifeState,
  stage: CampusStage,
): CampusLifeState => ({ ...state, stage });

export const setCampusPreferences = (
  state: CampusLifeState,
  values: Partial<
    Pick<CampusLifeState, "traditional" | "reduced_motion">
  >,
): CampusLifeState => ({ ...state, ...values });

export const setCampusOffline = (
  state: CampusLifeState,
  offline: boolean,
): CampusLifeState => ({ ...state, offline });

export const updateCampusProfile = (
  state: CampusLifeState,
  profilingEnabled: boolean,
  interests: string[],
): CampusLifeState => {
  assertMutable(state);
  if (
    interests.some(
      (interest) => !state.fixture.interest_catalog.includes(interest),
    )
  ) {
    throw new Error("兴趣必须来自公开可见的选项清单。");
  }
  const profile = {
    ...state.profile,
    profiling_enabled: profilingEnabled,
    interests: profilingEnabled ? [...new Set(interests)] : [],
  };
  const next = {
    ...state,
    profile,
    search_result: computeSearch(
      { fixture: state.fixture, profile },
      state.search_query,
    ),
  };
  return appendAudit(
    next,
    "update_profile",
    "campus-profile",
    profilingEnabled
      ? "student enabled a bounded preference profile"
      : "student disabled profiling; ordering fell back to filters and time",
  );
};

export const searchCampusLife = (
  state: CampusLifeState,
  query: CampusSearchQuery,
): CampusLifeState =>
  appendAudit(
    {
      ...state,
      search_query: structuredClone(query),
      search_result: computeSearch(state, query),
    },
    "search",
    "campus-catalog",
    "returned sourced services and events with visible filters",
  );

export const saveToMyCourt = (
  state: CampusLifeState,
  targetId: string,
  targetType: CampusTargetType,
): CampusLifeState => {
  assertMutable(state);
  if (!targetExists(state.fixture, targetId, targetType)) {
    throw new Error("MyCOURT 只能保存已登记的校园服务、活动、队伍或导师。");
  }
  if (state.saved_items.some((item) => item.target_id === targetId)) {
    return state;
  }
  const item = {
    target_id: targetId,
    target_type: targetType,
    saved_at: eventTime(state.audit.length + 1),
  };
  return appendAudit(
    { ...state, saved_items: [...state.saved_items, item] },
    "save_mycourt",
    targetId,
    "saved privately without publishing participation",
  );
};

export const saveEventToCalendar = (
  state: CampusLifeState,
  eventId: string,
): CampusLifeState => {
  assertMutable(state);
  const event = state.fixture.events.find((item) => item.id === eventId);
  if (!event || event.status === "expired") {
    throw new Error("过期或未知活动不能加入当前赛季日历。");
  }
  if (state.calendar_entries.some((item) => item.event_id === eventId)) {
    return state;
  }
  const entry = {
    event_id: eventId,
    starts_at: event.starts_at,
    ends_at: event.ends_at,
    conflict_labels:
      eventId === "event-film-room"
        ? ["SLS 240 · 周三 14:00–15:40"]
        : [],
    registration_performed: false as const,
    saved_at: eventTime(state.audit.length + 1),
  };
  return appendAudit(
    { ...state, calendar_entries: [...state.calendar_entries, entry] },
    "save_calendar",
    eventId,
    "saved a private calendar mirror; no registration performed",
  );
};

export const planCampusRoute = (
  state: CampusLifeState,
  fromId: string,
  toId: string,
  accessibleOnly: boolean,
): CampusLifeState => {
  const options = state.fixture.routes
    .filter(
      (route) =>
        route.from_location_id === fromId &&
        route.to_location_id === toId &&
        (!accessibleOnly || route.accessible),
    )
    .sort((a, b) => a.estimated_minutes - b.estimated_minutes);
  const selected = options[0];
  if (!selected) {
    throw new Error("当前 Fixture 没有满足该无障碍边界的登记路线。");
  }
  return appendAudit(
    {
      ...state,
      selected_location_id: toId,
      selected_route: structuredClone(selected),
    },
    "plan_route",
    selected.id,
    "returned a static 2D route without starting location tracking",
  );
};

export const updateCampusJourney = (
  state: CampusLifeState,
  resourceId: string,
  status: CampusJourneyStatus,
  note: string,
): CampusLifeState => {
  assertMutable(state);
  if (!state.fixture.resources.some((item) => item.id === resourceId)) {
    throw new Error("只有已登记服务可以创建个人办理镜像。");
  }
  const mirror = {
    resource_id: resourceId,
    status,
    completed_step_ids: ["read-official-guide"],
    personal_note: note.trim(),
    authoritative: false as const,
    last_checked_at: eventTime(state.audit.length + 1),
  };
  return appendAudit(
    {
      ...state,
      journey_mirrors: [
        ...state.journey_mirrors.filter(
          (item) => item.resource_id !== resourceId,
        ),
        mirror,
      ],
    },
    "update_journey_mirror",
    resourceId,
    "updated a personal mirror without claiming official approval",
  );
};

export const expressTeamIntent = (
  state: CampusLifeState,
  listingId: string,
): CampusLifeState => {
  assertMutable(state);
  if (!state.fixture.team_listings.some((item) => item.id === listingId)) {
    throw new Error("组队条目不存在。");
  }
  const intent = {
    listing_id: listingId,
    student_confirmed: true,
    provider_confirmed: false,
    disclosure_status: "waiting_counterparty" as const,
    disclosed_fields: [],
    updated_at: eventTime(state.audit.length + 1),
  };
  return appendAudit(
    {
      ...state,
      team_intents: [
        ...state.team_intents.filter((item) => item.listing_id !== listingId),
        intent,
      ],
    },
    "team_intent",
    listingId,
    "student expressed interest; no additional profile disclosure",
  );
};

export const confirmTeamCounterparty = (
  state: CampusLifeState,
  listingId: string,
): CampusLifeState => {
  assertMutable(state);
  const current = state.team_intents.find(
    (item) => item.listing_id === listingId,
  );
  if (!current?.student_confirmed) {
    throw new Error("必须先由学生明确表达意向。");
  }
  const updated = state.team_intents.map((item) =>
    item.listing_id === listingId
      ? {
          ...item,
          provider_confirmed: true,
          disclosure_status: "mutual_intent" as const,
          disclosed_fields: [
            "preferred_contact_window",
            "collaboration_mode",
          ],
          updated_at: eventTime(state.audit.length + 1),
        }
      : item,
  );
  return appendAudit(
    { ...state, team_intents: updated },
    "team_mutual_intent",
    listingId,
    "both sides confirmed before minimum additional disclosure",
  );
};

export const buildMentorHandoff = (
  state: CampusLifeState,
  mentorId: string,
  question: string,
): CampusLifeState => {
  assertMutable(state);
  const mentor = state.fixture.mentors.find((item) => item.id === mentorId);
  if (!mentor || question.trim().length < 8) {
    throw new Error("导师交接需要已登记导师和一条具体问题。");
  }
  const handoff = {
    id: `campus-handoff-${String(state.mentor_handoffs.length + 1).padStart(3, "0")}`,
    mentor_id: mentorId,
    questions: [question.trim()],
    evidence_ids: [mentor.source_id],
    consent_confirmed: true as const,
    mentor_response: null,
    status: "ready_for_student" as const,
    created_at: eventTime(state.audit.length + 1),
  };
  return appendAudit(
    { ...state, mentor_handoffs: [...state.mentor_handoffs, handoff] },
    "mentor_handoff",
    handoff.id,
    "prepared student-approved question without fabricating mentor response",
  );
};

export const updateCampusNotifications = (
  state: CampusLifeState,
  frequency: "realtime" | "daily_digest" | "weekly",
  marketingEnabled: boolean,
): CampusLifeState => {
  assertMutable(state);
  const settings = {
    ...state.notification_settings,
    frequency,
    emergency_enabled: true as const,
    marketing_enabled: marketingEnabled,
  };
  return appendAudit(
    { ...state, notification_settings: settings },
    "update_notifications",
    "notification-policy",
    "kept emergency separate and preserved student control of marketing",
  );
};

export const reportCampusSource = (
  state: CampusLifeState,
  targetId: string,
  reason: string,
): CampusLifeState => {
  assertMutable(state);
  const registered =
    state.fixture.resources.some((item) => item.id === targetId) ||
    state.fixture.events.some((item) => item.id === targetId) ||
    state.fixture.sources.some((item) => item.id === targetId);
  if (!registered || reason.trim().length < 8) {
    throw new Error("来源报告需要已登记对象和可复核说明。");
  }
  const createdAt = eventTime(state.audit.length + 1);
  const correction = {
    id: `campus-correction-${String(state.corrections.length + 1).padStart(3, "0")}`,
    target_id: targetId,
    reason: reason.trim(),
    status: "submitted" as const,
    created_at: createdAt,
    review_due_at: new Date(
      new Date(createdAt).getTime() + 48 * 60 * 60 * 1000,
    ).toISOString(),
  };
  return appendAudit(
    { ...state, corrections: [...state.corrections, correction] },
    "report_source",
    targetId,
    "submitted a review request without silently rewriting source data",
  );
};

export const recordCampusReceipt = (
  state: CampusLifeState,
  eventId: string,
  participation: CampusParticipation,
  reflection: string,
): CampusLifeState => {
  assertMutable(state);
  if (!state.fixture.events.some((item) => item.id === eventId)) {
    throw new Error("只能为已登记活动创建个人足迹回执。");
  }
  const receipt = {
    id: `campus-receipt-${String(state.receipts.length + 1).padStart(3, "0")}`,
    target_id: eventId,
    participation,
    reflection: reflection.trim(),
    private: true as const,
    affects_student_value: false as const,
    created_at: eventTime(state.audit.length + 1),
  };
  return appendAudit(
    { ...state, receipts: [...state.receipts, receipt] },
    "record_private_receipt",
    eventId,
    "stored an optional private receipt without participation scoring",
  );
};

export const campusRecommendations = (
  state: CampusLifeState,
): Array<{ id: string; explanation: string }> => {
  const activeEvents = state.fixture.events.filter(
    (event) => event.status === "active",
  );
  const hasVisibleFilter = state.search_result.active_filters.length > 0;
  const filteredEvents = hasVisibleFilter
    ? activeEvents.filter((event) =>
        state.search_result.event_ids.includes(event.id),
      )
    : activeEvents;
  const fallbackUsed = hasVisibleFilter && filteredEvents.length === 0;
  const candidates = fallbackUsed ? activeEvents : filteredEvents;

  return candidates.slice(0, 3).map((event) => ({
    id: event.id,
    explanation: fallbackUsed
      ? "当前筛选没有直接命中活动；回退到最近的有效活动，未使用隐形画像。"
      : hasVisibleFilter
        ? `匹配可见筛选（${state.search_result.active_filters.join("、")}）；未使用位置、门禁、支付或健康数据。`
        : state.profile.profiling_enabled
          ? `基于本人选择的兴趣（${state.profile.interests.join("、")}）；未使用位置、门禁、支付或健康数据。`
          : "画像关闭：按时间与有效状态排列。",
  }));
};

export const campusSource = (state: CampusLifeState, sourceId: string) => {
  const source = state.fixture.sources.find((item) => item.id === sourceId);
  if (!source) throw new Error(`未登记来源：${sourceId}`);
  return source;
};

export const campusBoxScore = (state: CampusLifeState): CampusBoxScore => ({
  discoverable_items:
    state.fixture.resources.length + state.fixture.events.length,
  verified_sources: state.fixture.sources.filter(
    (source) => source.verification_status === "verified_fixture",
  ).length,
  saved_items: state.saved_items.length,
  calendar_entries: state.calendar_entries.length,
  accessible_routes: state.fixture.routes.filter((route) => route.accessible)
    .length,
  mutual_intents: state.team_intents.filter(
    (intent) => intent.disclosure_status === "mutual_intent",
  ).length,
  official_results_claimed: 0,
  location_tracking_events: 0,
  participation_value_scores: 0,
  audit_events: state.audit.length,
});

export const routeForLocation = (
  state: CampusLifeState,
  locationId: string,
): CampusRouteOption | null =>
  state.fixture.routes.find(
    (route) =>
      route.to_location_id === locationId ||
      route.from_location_id === locationId,
  ) ?? null;

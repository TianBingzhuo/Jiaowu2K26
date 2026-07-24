import { PERFORMANCE_FIXTURE } from "./fixture";
import type {
  ClimateVariant,
  CorrectionCase,
  PerformanceAuditEvent,
  PerformanceState,
  RecommendationStatus,
  ShareDraft,
  ShareGrant,
} from "./types";

const clone = <T>(value: T): T => structuredClone(value);

export const createPerformanceState = (): PerformanceState =>
  clone(PERFORMANCE_FIXTURE);

function eventTime(sequence: number): string {
  return `2026-07-24T19:${String(sequence % 60).padStart(2, "0")}:00+08:00`;
}

function shareExpiry(durationDays: number): string {
  const dayOfMonth = 24 + durationDays;
  return dayOfMonth <= 31
    ? `2026-07-${String(dayOfMonth).padStart(2, "0")}T23:59:00+08:00`
    : `2026-08-${String(dayOfMonth - 31).padStart(2, "0")}T23:59:00+08:00`;
}

function appendAudit(
  state: PerformanceState,
  action: PerformanceAuditEvent["action"],
  targetId: string,
  detail: string,
): PerformanceState {
  const previous = state.audit.at(-1);
  const sequence = (previous?.sequence ?? 0) + 1;
  return {
    ...state,
    audit: [
      ...state.audit,
      {
        id: `perf-event-${String(sequence).padStart(3, "0")}`,
        sequence,
        action,
        targetId,
        detail,
        occurredAt: eventTime(sequence),
        previousEventHash: previous?.eventHash ?? null,
        eventHash: `fnv1a-perf-event-${String(sequence).padStart(3, "0")}`,
      },
    ],
  };
}

export function buildTrendText(state: PerformanceState, metricId: string) {
  const metric = state.metrics.find((item) => item.id === metricId);
  const observation = state.observations.find(
    (item) => item.metricId === metricId,
  );
  if (!metric || !observation) return "此指标没有可用观察。";
  const points = observation.trend
    .map((point) =>
      point.status === "gap"
        ? `${point.label}：数据缺口`
        : `${point.label}：${point.value} ${metric.unit}`,
    )
    .join("；");
  return `${metric.label}，${observation.periodStart} 至 ${observation.periodEnd}。${points || "没有可绘制时间序列"}。置信说明：${observation.confidenceReason}`;
}

export function selectMetric(
  state: PerformanceState,
  metricId: string,
): PerformanceState {
  if (!state.metrics.some((metric) => metric.id === metricId)) {
    throw new Error("指标不存在，未改变当前选择。");
  }
  return { ...state, selectedMetricId: metricId };
}

export function setClimateVariant(
  state: PerformanceState,
  variant: ClimateVariant,
): PerformanceState {
  if (
    variant !== "c_dimensions" &&
    (state.statusLabel.withdrawnAt !== null ||
      state.harmSignals.some(
        (signal) => signal.severity === "stop" && signal.status === "open",
      ))
  ) {
    throw new Error(
      "STOP 后 Academic Climate 已锁定；只有经过复核的新研究会话才能重新开启。",
    );
  }
  if (!state.researchGate.variants.some((item) => item.id === variant)) {
    throw new Error("未知的 Academic Climate 研究版本。");
  }
  const next = {
    ...state,
    climateVariant: variant,
    climateEnabled: variant !== "c_dimensions",
    message:
      variant === "a_numbers"
        ? "A 版仅用于人因盲测：数字不是计算结果、成绩或医学温度。"
        : variant === "b_words"
          ? "B 版只显示可撤回的短期文字状态。"
          : "C 版安全基线：仅显示原始多维状态，不使用温度隐喻。",
  };
  return appendAudit(
    next,
    "climate_toggle",
    state.statusLabel.id,
    `research variant set to ${variant}; gate remains deferred`,
  );
}

export function disableClimate(state: PerformanceState): PerformanceState {
  const next = {
    ...state,
    climateEnabled: false,
    climateVariant: "c_dimensions" as const,
    message: "已关闭 Academic Climate；原始维度、来源和建议仍完整可用。",
  };
  return appendAudit(
    next,
    "climate_toggle",
    state.statusLabel.id,
    "student disabled climate language and returned to dimensions",
  );
}

export function actOnRecommendation(
  state: PerformanceState,
  recommendationId: string,
  status: Exclude<RecommendationStatus, "open">,
): PerformanceState {
  if (!state.recommendations.some((item) => item.id === recommendationId)) {
    throw new Error("建议不存在。");
  }
  const next = {
    ...state,
    recommendations: state.recommendations.map((item) =>
      item.id === recommendationId ? { ...item, status } : item,
    ),
    message:
      status === "adopted"
        ? "已加入本人 Next Move；不会写入正式课表或成绩。"
        : status === "later"
          ? "已稍后处理；不会用倒计时或连胜催促。"
          : "已拒绝这条建议；拒绝不影响任何权益。",
  };
  return appendAudit(
    next,
    "recommendation_action",
    recommendationId,
    `student set recommendation status to ${status}`,
  );
}

export function previewShare(
  state: PerformanceState,
  draft: ShareDraft,
): string[] {
  return draft.dimensionIds
    .map((id) => {
      const ability = state.abilities.find((item) => item.id === id);
      if (ability) return `${ability.label}：${ability.observedLabel}`;
      const observation = state.observations.find(
        (item) => item.metricId === id,
      );
      const metric = state.metrics.find((item) => item.id === id);
      if (metric && observation)
        return `${metric.label}：${observation.displayValue}`;
      return null;
    })
    .filter((item): item is string => item !== null);
}

export function createShareGrant(
  state: PerformanceState,
  draft: ShareDraft,
): PerformanceState {
  if (!draft.recipient.trim() || !draft.purpose.trim()) {
    throw new Error("分享对象和用途都必须明确。");
  }
  if (draft.dimensionIds.length === 0) {
    throw new Error("至少选择一个要分享的维度。");
  }
  if (draft.durationDays < 1 || draft.durationDays > 30) {
    throw new Error("Fixture 分享期限必须在 1–30 天。");
  }
  const sequence = state.shareGrants.length + 1;
  const grant: ShareGrant = {
    id: `share-grant-${String(sequence).padStart(3, "0")}`,
    recipient: draft.recipient.trim(),
    purpose: draft.purpose.trim(),
    dimensionIds: [...draft.dimensionIds],
    grantedAt: eventTime(state.audit.length + 1),
    expiresAt: shareExpiry(draft.durationDays),
    revokedAt: null,
  };
  const next = {
    ...state,
    shareGrants: [...state.shareGrants, grant],
    message: `已创建 ${draft.durationDays} 天的 Fixture 分享授权，可随时撤回。`,
  };
  return appendAudit(
    next,
    "share_grant",
    grant.id,
    `shared ${grant.dimensionIds.length} dimensions for ${grant.purpose}`,
  );
}

export function revokeShareGrant(
  state: PerformanceState,
  grantId: string,
): PerformanceState {
  const grant = state.shareGrants.find((item) => item.id === grantId);
  if (!grant || grant.revokedAt) {
    throw new Error("分享授权不存在或已经撤回。");
  }
  const revokedAt = eventTime(state.audit.length + 1);
  const next = {
    ...state,
    shareGrants: state.shareGrants.map((item) =>
      item.id === grantId ? { ...item, revokedAt } : item,
    ),
    message: "分享授权已撤回；接收者预览立即失效。",
  };
  return appendAudit(
    next,
    "share_revoke",
    grantId,
    "student revoked purpose-bound share grant",
  );
}

export function requestCorrection(
  state: PerformanceState,
  targetId: string,
  reason: string,
): PerformanceState {
  if (!reason.trim()) throw new Error("纠错原因不能为空。");
  const knownTarget =
    state.metrics.some((item) => item.id === targetId) ||
    state.observations.some((item) => item.id === targetId) ||
    state.badges.some((item) => item.id === targetId);
  if (!knownTarget) throw new Error("纠错对象不存在。");
  const correction: CorrectionCase = {
    id: `correction-${String(state.corrections.length + 1).padStart(3, "0")}`,
    targetId,
    reason: reason.trim(),
    evidenceIds:
      state.observations.find((item) => item.id === targetId)?.sourceIds ?? [],
    status: "queued_for_human_review",
    createdAt: eventTime(state.audit.length + 1),
    revision: 1,
  };
  const next = {
    ...state,
    corrections: [...state.corrections, correction],
    message: "纠错已进入人工队列；旧版本保留，不静默覆盖。",
  };
  return appendAudit(
    next,
    "correction_request",
    correction.id,
    `correction requested for ${targetId}`,
  );
}

export function reportHarm(
  state: PerformanceState,
  description: string,
): PerformanceState {
  if (!description.trim()) throw new Error("请描述误解、压力或伤害信号。");
  const sequence = state.harmSignals.length + 1;
  const createdAt = eventTime(state.audit.length + 1);
  const next = {
    ...state,
    climateEnabled: false,
    climateVariant: "c_dimensions" as const,
    statusLabel: {
      ...state.statusLabel,
      withdrawnAt: createdAt,
    },
    harmSignals: [
      ...state.harmSignals,
      {
        id: `harm-${String(sequence).padStart(3, "0")}`,
        category: "pressure" as const,
        description: description.trim(),
        severity: "stop" as const,
        status: "open" as const,
        actionTaken:
          "立即下线温度与身份文案，回退为无隐喻多维面板；等待人工复核。",
        createdAt,
      },
    ],
    message:
      "STOP 闸门已触发：Academic Climate 已下线，保留原始维度与人工复核入口。",
  };
  return appendAudit(
    next,
    "harm_report",
    `harm-${String(sequence).padStart(3, "0")}`,
    description.trim(),
  );
}

export function toggleOffline(state: PerformanceState): PerformanceState {
  const offline = !state.offline;
  const next = {
    ...state,
    offline,
    message: offline
      ? `已离线：使用 ${state.lastUpdatedAt} 的私密 Fixture 缓存；不生成新推断。`
      : "已恢复本地服务；Fixture 来源与时间保持可见。",
  };
  return appendAudit(
    next,
    "offline_fallback",
    "performance-cache",
    offline ? "entered cached read-only mode" : "returned to local fixture mode",
  );
}

export function recordExport(state: PerformanceState): PerformanceState {
  const next = {
    ...state,
    message:
      "已导出可阅读、不可信的私密 Fixture 副本；它不是成绩、医疗记录或学校凭证。",
  };
  return appendAudit(
    next,
    "export",
    "student:student-nan-fixture",
    "exported a readable untrusted private fixture copy",
  );
}

export function buildPrivateArchive(state: PerformanceState) {
  return {
    schema_version: state.schemaVersion,
    archive_type: "readable_untrusted",
    data_mode: state.dataMode,
    student_id: state.studentId,
    private: true,
    authoritative: false,
    comparison_mode: state.comparisonMode,
    metrics: state.metrics,
    observations: state.observations,
    badges: state.badges,
    status_label: state.statusLabel,
    recommendations: state.recommendations,
    share_grants: state.shareGrants,
    corrections: state.corrections,
    harm_signals: state.harmSignals,
    audit_receipt: {
      event_count: state.audit.length,
      latest_event_hash: state.audit.at(-1)?.eventHash ?? null,
    },
    warning:
      "Fixture personal copy; not a grade, medical record, school credential or trusted archive.",
  };
}

import { OPPORTUNITY_MARKET_FIXTURE } from "./fixture";
import type {
  ApplicationMirror,
  DisclosureGrant,
  EligibilityCheck,
  EligibilityResult,
  EligibilityRule,
  FairnessAudit,
  MatchResult,
  Opportunity,
  OpportunityAuditEvent,
  OpportunityCategory,
  OpportunityMarketState,
  OpportunityReport,
  OpportunityStage,
  ProfileField,
  SavedOpportunity,
} from "./types";

const clone = <T>(value: T): T => structuredClone(value);

export const createOpportunityMarketState = (): OpportunityMarketState =>
  clone(OPPORTUNITY_MARKET_FIXTURE);

function eventTime(sequence: number): string {
  return `2026-07-24T20:${String(sequence % 60).padStart(2, "0")}:00+08:00`;
}

function appendAudit(
  state: OpportunityMarketState,
  action: OpportunityAuditEvent["action"],
  targetId: string,
  detail: string,
): OpportunityMarketState {
  const previous = state.audit.at(-1);
  const sequence = (previous?.sequence ?? 0) + 1;
  return {
    ...state,
    audit: [
      ...state.audit,
      {
        id: `opp-event-${String(sequence).padStart(3, "0")}`,
        sequence,
        action,
        targetId,
        detail,
        occurredAt: eventTime(sequence),
        previousEventHash: previous?.eventHash ?? null,
        eventHash: `fnv1a-opp-event-${String(sequence).padStart(3, "0")}`,
      },
    ],
  };
}

function opportunityOrThrow(
  state: OpportunityMarketState,
  opportunityId: string,
): Opportunity {
  const opportunity = state.opportunities.find(
    (item) => item.id === opportunityId,
  );
  if (!opportunity) throw new Error("机会不存在，当前状态未改变。");
  return opportunity;
}

function ensureWritable(state: OpportunityMarketState): void {
  if (state.offline) {
    throw new Error(
      "离线缓存为只读：可浏览来源与 Replay，但不能生成新匹配、授权或状态。",
    );
  }
}

function profileFieldForRule(
  state: OpportunityMarketState,
  rule: EligibilityRule,
): ProfileField | undefined {
  return state.profileFields.find((field) => field.id === rule.fieldId);
}

function valueMatches(
  value: ProfileField["value"],
  rule: EligibilityRule,
): boolean {
  if (rule.operator === "gte" || rule.operator === "lte") {
    return (
      typeof value === "number" &&
      typeof rule.expectedValue === "number" &&
      (rule.operator === "gte"
        ? value >= rule.expectedValue
        : value <= rule.expectedValue)
    );
  }
  if (rule.operator === "contains" || rule.operator === "includes") {
    if (Array.isArray(value)) {
      return value.some((item) =>
        item.toLowerCase().includes(String(rule.expectedValue).toLowerCase()),
      );
    }
    return String(value)
      .toLowerCase()
      .includes(String(rule.expectedValue).toLowerCase());
  }
  return String(value) === String(rule.expectedValue);
}

function eligibilityResult(
  state: OpportunityMarketState,
  rule: EligibilityRule,
  selectedFieldIds: string[],
): EligibilityResult {
  const field = profileFieldForRule(state, rule);
  if (!field) {
    return {
      ruleId: rule.id,
      ruleDescription: rule.description,
      status: "unknown",
      evidenceFieldId: null,
      evidenceLabel: "规则所需字段不存在；系统不会补猜。",
      nextStep: "沿官方渠道核对规则字段，或保持未知。",
    };
  }

  if (field.value === "unknown") {
    return {
      ruleId: rule.id,
      ruleDescription: rule.description,
      status: "unknown",
      evidenceFieldId: field.id,
      evidenceLabel: `${field.valueLabel} · ${field.authority}`,
      nextStep: "沿官方渠道补齐信息，或保持未知；未知不会被猜成满足。",
    };
  }

  if (!selectedFieldIds.includes(rule.fieldId)) {
    return {
      ruleId: rule.id,
      ruleDescription: rule.description,
      status: "unknown",
      evidenceFieldId: null,
      evidenceLabel: "本次未授权该字段；系统不会暗中读取。",
      nextStep: `如愿意，可在 Profile 中逐项选择“${field.label}”后重查。`,
    };
  }

  const matches = valueMatches(field.value, rule);
  if (!matches) {
    return {
      ruleId: rule.id,
      ruleDescription: rule.description,
      status: "not_met",
      evidenceFieldId: field.id,
      evidenceLabel: `${field.label} · ${field.valueLabel}`,
      nextStep:
        rule.operator === "gte" || rule.operator === "lte"
          ? `当前为 ${field.valueLabel}；请按官方允许范围调整，并在提交前重新核对。`
          : "查看官方规则并补充材料；系统不会代替提供方豁免要求。",
    };
  }

  if (field.authority !== "verified_fixture") {
    return {
      ruleId: rule.id,
      ruleDescription: rule.description,
      status: "possibly_met",
      evidenceFieldId: field.id,
      evidenceLabel: `${field.label} · ${field.valueLabel}`,
      nextStep: "这是一项本人声明或 Fixture 信息，请在正式申请前向提供方确认。",
    };
  }

  return {
    ruleId: rule.id,
    ruleDescription: rule.description,
    status: "met",
    evidenceFieldId: field.id,
    evidenceLabel: `${field.label} · 来源 ${field.sourceId ?? "Fixture"}`,
    nextStep: "正式申请前再次核对官方规则版本与有效期。",
  };
}

export function buildEligibilityCheck(
  state: OpportunityMarketState,
  opportunityId: string,
  selectedFieldIds = state.selectedProfileFieldIds,
): EligibilityCheck {
  const opportunity = opportunityOrThrow(state, opportunityId);
  const rules = opportunity.eligibilityRuleIds.map((ruleId) => {
    const rule = state.rules.find((item) => item.id === ruleId);
    if (!rule) throw new Error(`资格规则 ${ruleId} 缺失。`);
    return rule;
  });
  const results = rules.map((rule) =>
    eligibilityResult(state, rule, selectedFieldIds),
  );
  const usedProfileFieldIds = [
    ...new Set(
      rules
        .map((rule) => rule.fieldId)
        .filter((fieldId) => selectedFieldIds.includes(fieldId)),
    ),
  ];
  const counts = results.reduce(
    (accumulator, result) => {
      accumulator[result.status] += 1;
      return accumulator;
    },
    { met: 0, possibly_met: 0, not_met: 0, unknown: 0 },
  );
  return {
    opportunityId,
    checkedAt: eventTime(state.audit.length + 1),
    usedProfileFieldIds,
    results,
    summary: `已满足 ${counts.met} · 可能满足 ${counts.possibly_met} · 未满足 ${counts.not_met} · 未知 ${counts.unknown}`,
    hasCompositeScore: false,
  };
}

export function runEligibilityCheck(
  state: OpportunityMarketState,
  opportunityId = state.selectedOpportunityId,
): OpportunityMarketState {
  ensureWritable(state);
  const opportunity = opportunityOrThrow(state, opportunityId);
  if (opportunity.status === "expired") {
    throw new Error("该机会已经过期；仍可查看规则，但不能生成新的资格结论。");
  }
  const check = buildEligibilityCheck(state, opportunityId);
  const next = {
    ...state,
    selectedOpportunityId: opportunityId,
    eligibilityChecks: [
      ...state.eligibilityChecks.filter(
        (item) => item.opportunityId !== opportunityId,
      ),
      check,
    ],
    message: `${opportunity.title} 已完成四态解释；没有综合分或录取预测。`,
  };
  return appendAudit(
    next,
    "eligibility_check",
    opportunityId,
    `evaluated ${check.results.length} rules with ${check.usedProfileFieldIds.length} explicitly selected fields`,
  );
}

export function visibleOpportunities(
  state: OpportunityMarketState,
): Opportunity[] {
  const query = state.query.trim().toLowerCase();
  return state.opportunities
    .filter(
      (opportunity) =>
        !state.showActiveOnly || opportunity.status === "active",
    )
    .filter(
      (opportunity) =>
        state.categoryFilter === "all" ||
        opportunity.category === state.categoryFilter,
    )
    .filter((opportunity) => {
      if (!query) return true;
      return [
        opportunity.title,
        opportunity.provider,
        opportunity.summary,
        opportunity.category,
        ...(opportunity.searchAliases ?? []),
        ...opportunity.benefits,
      ].some((value) => value.toLowerCase().includes(query));
    })
    .sort((left, right) => {
      const leftDeadline = left.deadline ?? "9999";
      const rightDeadline = right.deadline ?? "9999";
      return (
        leftDeadline.localeCompare(rightDeadline) ||
        left.title.localeCompare(right.title)
      );
    });
}

export function setMarketStage(
  state: OpportunityMarketState,
  selectedStage: OpportunityStage,
): OpportunityMarketState {
  return { ...state, selectedStage };
}

export function selectOpportunity(
  state: OpportunityMarketState,
  opportunityId: string,
  nextStage: OpportunityStage = "eligibility",
): OpportunityMarketState {
  const opportunity = opportunityOrThrow(state, opportunityId);
  const next = {
    ...state,
    selectedOpportunityId: opportunityId,
    selectedStage: nextStage,
    message: `${opportunity.title} 已打开；内容、资格、收益、义务、成本与风险均未遮蔽。`,
  };
  return appendAudit(
    next,
    "view",
    opportunityId,
    "opened transparent opportunity detail",
  );
}

export function setCategoryFilter(
  state: OpportunityMarketState,
  category: OpportunityCategory | "all",
): OpportunityMarketState {
  return { ...state, categoryFilter: category };
}

export function setMarketQuery(
  state: OpportunityMarketState,
  query: string,
): OpportunityMarketState {
  return { ...state, query };
}

export function toggleActiveOnly(
  state: OpportunityMarketState,
): OpportunityMarketState {
  return {
    ...state,
    showActiveOnly: !state.showActiveOnly,
    message: state.showActiveOnly
      ? "已显示过期/复核样例；它们不会伪装成可申请机会。"
      : "默认发现只显示有效机会；过期项仍保留在 Replay。",
  };
}

export function toggleProfileField(
  state: OpportunityMarketState,
  fieldId: string,
): OpportunityMarketState {
  ensureWritable(state);
  if (state.forbiddenProfileFieldIds.includes(fieldId)) {
    throw new Error("该字段属于禁止匹配输入。");
  }
  if (!state.profileFields.some((field) => field.id === fieldId)) {
    throw new Error("Profile 字段不存在。");
  }
  const selected = state.selectedProfileFieldIds.includes(fieldId);
  return {
    ...state,
    selectedProfileFieldIds: selected
      ? state.selectedProfileFieldIds.filter((id) => id !== fieldId)
      : [...state.selectedProfileFieldIds, fieldId],
    message: selected
      ? "字段已从本次匹配移除；历史证据未被删除。"
      : "字段只用于本次本地 Fixture 匹配，未向提供方分享。",
  };
}

function matchResultFor(
  state: OpportunityMarketState,
  opportunity: Opportunity,
): MatchResult {
  const check = buildEligibilityCheck(
    state,
    opportunity.id,
    state.selectedProfileFieldIds,
  );
  const requiredRuleIds = state.rules
    .filter(
      (rule) => rule.opportunityId === opportunity.id && rule.required,
    )
    .map((rule) => rule.id);
  const requiredResults = check.results.filter((result) =>
    requiredRuleIds.includes(result.ruleId),
  );
  const reasons = check.results
    .filter((result) => result.status === "met" || result.status === "possibly_met")
    .map((result) => `${result.ruleDescription}：${result.evidenceLabel}`);
  const conflicts = requiredResults
    .filter((result) => result.status === "not_met")
    .map((result) => `${result.ruleDescription}：${result.nextStep}`);
  const unknowns = requiredResults
    .filter((result) => result.status === "unknown")
    .map((result) => `${result.ruleDescription}：${result.nextStep}`);
  const possiblyMet = requiredResults.some(
    (result) => result.status === "possibly_met",
  );

  const fitBand =
    requiredResults.length === 0 || unknowns.length === requiredResults.length
      ? "insufficient_data"
      : conflicts.length > 0
        ? "gaps_present"
        : unknowns.length > 0 || possiblyMet
          ? "needs_confirmation"
          : "ready_to_review";

  return {
    opportunityId: opportunity.id,
    fitBand,
    reasons,
    conflicts,
    unknowns,
    generatedAt: eventTime(state.audit.length + 1),
    rankingBasis: "eligibility_then_deadline",
    paidInfluence: false,
  };
}

export function runSelectiveMatch(
  state: OpportunityMarketState,
): OpportunityMarketState {
  ensureWritable(state);
  if (state.selectedProfileFieldIds.length === 0) {
    throw new Error("请至少选择一个用于本次匹配的字段。");
  }
  if (
    state.selectedProfileFieldIds.some((id) =>
      state.forbiddenProfileFieldIds.includes(id),
    )
  ) {
    throw new Error("匹配请求包含禁止字段，已拒绝。");
  }

  const results = state.opportunities
    .filter((opportunity) => opportunity.status === "active")
    .map((opportunity) => matchResultFor(state, opportunity))
    .sort((left, right) => {
      const rank = {
        ready_to_review: 0,
        needs_confirmation: 1,
        gaps_present: 2,
        insufficient_data: 3,
      };
      const rankDifference = rank[left.fitBand] - rank[right.fitBand];
      if (rankDifference !== 0) return rankDifference;
      const leftOpportunity = opportunityOrThrow(state, left.opportunityId);
      const rightOpportunity = opportunityOrThrow(state, right.opportunityId);
      return (leftOpportunity.deadline ?? "9999").localeCompare(
        rightOpportunity.deadline ?? "9999",
      );
    });

  const next = {
    ...state,
    matchResults: results,
    message: `已用 ${state.selectedProfileFieldIds.length} 个本人选择字段生成 ${results.length} 条解释；无付费参数、随机资格或综合分。`,
  };
  return appendAudit(
    next,
    "match",
    "selective-match",
    `matched ${results.length} active opportunities using ${state.selectedProfileFieldIds.join(",")}`,
  );
}

export function saveOpportunity(
  state: OpportunityMarketState,
  opportunityId: string,
  note = "",
): OpportunityMarketState {
  ensureWritable(state);
  const opportunity = opportunityOrThrow(state, opportunityId);
  if (opportunity.status === "expired") {
    throw new Error("过期机会不能保存为待申请；可在 Replay 中查看。");
  }
  const existing = state.savedOpportunities.find(
    (item) => item.opportunityId === opportunityId,
  );
  if (existing) {
    return {
      ...state,
      message: "该机会已经保存在本人清单；没有重复创建记录。",
    };
  }
  const saved: SavedOpportunity = {
    opportunityId,
    note: note.trim(),
    savedAt: eventTime(state.audit.length + 1),
    intentStatus: "saved",
    updatedAt: eventTime(state.audit.length + 1),
  };
  const mirror: ApplicationMirror = {
    id: `application-${opportunityId}`,
    opportunityId,
    status: "saved",
    sharedFieldIds: [],
    externalApplicationUrl: opportunity.externalApplicationUrl,
    updatedAt: saved.savedAt,
    authoritative: false,
  };
  const next = {
    ...state,
    savedOpportunities: [...state.savedOpportunities, saved],
    applicationMirrors: [...state.applicationMirrors, mirror],
    message: "已保存到本人机会清单；尚未表达意向，也没有发送资料。",
  };
  return appendAudit(next, "save", opportunityId, "saved privately");
}

export function expressInterest(
  state: OpportunityMarketState,
  opportunityId: string,
): OpportunityMarketState {
  ensureWritable(state);
  const saved = state.savedOpportunities.find(
    (item) => item.opportunityId === opportunityId,
  );
  if (!saved) throw new Error("请先保存机会，再表达本人意向。");
  if (saved.intentStatus === "withdrawn") {
    throw new Error("该意向已撤回；请建立新的受控会话再重新表达。");
  }
  const next = {
    ...state,
    savedOpportunities: state.savedOpportunities.map((item) =>
      item.opportunityId === opportunityId
        ? {
            ...item,
            intentStatus: "student_interested" as const,
            updatedAt: eventTime(state.audit.length + 1),
          }
        : item,
    ),
    message:
      "已记录本人意向；这不是申请，也没有向提供方发送 Profile 字段。",
  };
  return appendAudit(
    next,
    "intent",
    opportunityId,
    "student expressed private interest; no data shared",
  );
}

export function acknowledgeProviderInterest(
  state: OpportunityMarketState,
  opportunityId: string,
): OpportunityMarketState {
  ensureWritable(state);
  const saved = state.savedOpportunities.find(
    (item) => item.opportunityId === opportunityId,
  );
  if (!saved || saved.intentStatus !== "student_interested") {
    throw new Error("只有本人先表达意向后，才能记录提供方 Fixture 回应。");
  }
  const next = {
    ...state,
    savedOpportunities: state.savedOpportunities.map((item) =>
      item.opportunityId === opportunityId
        ? {
            ...item,
            intentStatus: "mutual_interest" as const,
            updatedAt: eventTime(state.audit.length + 1),
          }
        : item,
    ),
    message:
      "已记录提供方 Fixture 回应；扩大资料共享仍需学生逐项确认。",
  };
  return appendAudit(
    next,
    "provider_ack",
    opportunityId,
    "fixture provider acknowledged interest; disclosure remains blocked",
  );
}

export function previewDisclosure(
  state: OpportunityMarketState,
  opportunityId: string,
): string[] {
  opportunityOrThrow(state, opportunityId);
  return state.selectedProfileFieldIds
    .map((id) => state.profileFields.find((field) => field.id === id))
    .filter((field): field is ProfileField => Boolean(field))
    .map((field) => `${field.label} · ${field.valueLabel}`);
}

function expiryInDays(days: number): string {
  const day = 24 + days;
  return day <= 31
    ? `2026-07-${String(day).padStart(2, "0")}T23:59:00+08:00`
    : `2026-08-${String(day - 31).padStart(2, "0")}T23:59:00+08:00`;
}

export function createDisclosureGrant(
  state: OpportunityMarketState,
  opportunityId: string,
  durationDays: number,
): OpportunityMarketState {
  ensureWritable(state);
  const saved = state.savedOpportunities.find(
    (item) => item.opportunityId === opportunityId,
  );
  if (!saved || saved.intentStatus !== "mutual_interest") {
    throw new Error("只有双向意向成立后，才能建立最小披露授权。");
  }
  if (state.selectedProfileFieldIds.length === 0) {
    throw new Error("至少选择一个要披露的字段。");
  }
  if (durationDays < 1 || durationDays > 30) {
    throw new Error("Fixture 授权期限必须为 1–30 天。");
  }
  const opportunity = opportunityOrThrow(state, opportunityId);
  const sequence = state.disclosureGrants.length + 1;
  const preview = previewDisclosure(state, opportunityId);
  const grant: DisclosureGrant = {
    id: `disclosure-${String(sequence).padStart(3, "0")}`,
    opportunityId,
    recipient: opportunity.provider,
    purpose: `评估 ${opportunity.title} 的双向意向`,
    profileFieldIds: [...state.selectedProfileFieldIds],
    preview,
    grantedAt: eventTime(state.audit.length + 1),
    expiresAt: expiryInDays(durationDays),
    revokedAt: null,
  };
  const next = {
    ...state,
    disclosureGrants: [...state.disclosureGrants, grant],
    applicationMirrors: state.applicationMirrors.map((mirror) =>
      mirror.opportunityId === opportunityId
        ? {
            ...mirror,
            status: "consented" as const,
            sharedFieldIds: [...grant.profileFieldIds],
            updatedAt: grant.grantedAt,
          }
        : mirror,
    ),
    message: `已建立 ${durationDays} 天 Fixture 授权；可随时撤回，仍未正式申请。`,
  };
  return appendAudit(
    next,
    "consent_grant",
    grant.id,
    `shared ${grant.profileFieldIds.length} fields for ${grant.purpose}`,
  );
}

export function revokeDisclosureGrant(
  state: OpportunityMarketState,
  grantId: string,
): OpportunityMarketState {
  ensureWritable(state);
  const grant = state.disclosureGrants.find((item) => item.id === grantId);
  if (!grant || grant.revokedAt) {
    throw new Error("授权不存在或已经撤回。");
  }
  const revokedAt = eventTime(state.audit.length + 1);
  const next = {
    ...state,
    disclosureGrants: state.disclosureGrants.map((item) =>
      item.id === grantId ? { ...item, revokedAt } : item,
    ),
    applicationMirrors: state.applicationMirrors.map((mirror) =>
      mirror.opportunityId === grant.opportunityId
        ? {
            ...mirror,
            status: "saved" as const,
            sharedFieldIds: [],
            updatedAt: revokedAt,
          }
        : mirror,
    ),
    notifications: [
      ...state.notifications,
      {
        id: `notice-consent-${String(state.notifications.length + 1).padStart(3, "0")}`,
        opportunityId: grant.opportunityId,
        kind: "consent" as const,
        message: "最小披露授权已撤回；申请镜像回到 saved。",
        createdAt: revokedAt,
        read: false,
      },
    ],
    message: "授权已撤回；字段预览立即失效，正式外部系统不受本 Demo 控制。",
  };
  return appendAudit(
    next,
    "consent_revoke",
    grantId,
    "student revoked minimum disclosure",
  );
}

export function markAppliedExternally(
  state: OpportunityMarketState,
  opportunityId: string,
  userConfirmed: boolean,
): OpportunityMarketState {
  ensureWritable(state);
  if (!userConfirmed) {
    throw new Error("必须由学生明确确认“我已在外部系统申请”；本平台不能自动投递。");
  }
  const mirror = state.applicationMirrors.find(
    (item) => item.opportunityId === opportunityId,
  );
  if (!mirror) throw new Error("请先保存机会，才能更新申请镜像。");
  const updatedAt = eventTime(state.audit.length + 1);
  const next = {
    ...state,
    applicationMirrors: state.applicationMirrors.map((item) =>
      item.opportunityId === opportunityId
        ? {
            ...item,
            status: "applied_externally" as const,
            updatedAt,
          }
        : item,
    ),
    message:
      "只更新了本人申请镜像；平台没有向外部系统发送任何申请或附件。",
  };
  return appendAudit(
    next,
    "external_status_mark",
    opportunityId,
    "student manually confirmed an external application; no submission performed",
  );
}

export function addCapacityPlan(
  state: OpportunityMarketState,
  opportunityId: string,
  hoursPerWeek: number,
  note: string,
): OpportunityMarketState {
  ensureWritable(state);
  opportunityOrThrow(state, opportunityId);
  const time = state.capacity.find((dimension) => dimension.id === "time");
  if (!time) throw new Error("时间容量缺失。");
  const remaining = time.available - time.committed;
  if (hoursPerWeek <= 0 || hoursPerWeek > remaining) {
    throw new Error(`当前只剩 ${remaining} 小时/周可分配；不能用充值购买容量。`);
  }
  const plan = {
    opportunityId,
    hoursPerWeek,
    note: note.trim() || "本人 What-if 容量计划",
    createdAt: eventTime(state.audit.length + 1),
  };
  const next = {
    ...state,
    capacityPlans: [
      ...state.capacityPlans.filter(
        (item) => item.opportunityId !== opportunityId,
      ),
      plan,
    ],
    message:
      "容量 What-if 已保存；不会改变资格、课表、资金或实验室预约。",
  };
  return appendAudit(
    next,
    "capacity_plan",
    opportunityId,
    `allocated ${hoursPerWeek} hours/week in a non-authoritative what-if`,
  );
}

export function selectPathway(
  state: OpportunityMarketState,
  pathwayId: string,
): OpportunityMarketState {
  ensureWritable(state);
  const pathway = state.pathways.find((item) => item.id === pathwayId);
  if (!pathway) throw new Error("路径方案不存在。");
  const next = {
    ...state,
    selectedPathwayId: pathwayId,
    message: `${pathway.title} 仅作为 Scenario Draft；未提交任何正式审批。`,
  };
  return appendAudit(
    next,
    "pathway_preview",
    pathwayId,
    "opened reversible non-authoritative pathway scenario",
  );
}

export function togglePortfolioArtifact(
  state: OpportunityMarketState,
  artifactId: string,
): OpportunityMarketState {
  ensureWritable(state);
  if (!state.portfolioArtifacts.some((item) => item.id === artifactId)) {
    throw new Error("作品证据不存在。");
  }
  return {
    ...state,
    portfolioArtifacts: state.portfolioArtifacts.map((item) =>
      item.id === artifactId ? { ...item, selected: !item.selected } : item,
    ),
    message:
      "作品选择已更新；原课程材料不会进入导出，来源与审核状态保留。",
  };
}

export function buildPortfolioExport(state: OpportunityMarketState) {
  const artifacts = state.portfolioArtifacts.filter((item) => item.selected);
  if (artifacts.length === 0) throw new Error("请至少选择一个作品证据。");
  return {
    schema_version: "1.0",
    archive_type: "readable_untrusted_portfolio_fixture",
    generated_at: eventTime(state.audit.length + 1),
    student_id: state.studentId,
    private: true,
    authoritative: false,
    artifacts,
    warning:
      "Fixture export; contains source references and review states but no original course material and no institutional credential.",
  };
}

export function recordPortfolioExport(
  state: OpportunityMarketState,
): OpportunityMarketState {
  ensureWritable(state);
  const selected = state.portfolioArtifacts.filter((item) => item.selected);
  if (selected.length === 0) throw new Error("请至少选择一个作品证据。");
  const next = {
    ...state,
    message: `已导出 ${selected.length} 个可阅读、不可信的 Fixture 作品证据。`,
  };
  return appendAudit(
    next,
    "portfolio_export",
    "portfolio",
    `exported ${selected.map((item) => item.id).join(",")}`,
  );
}

export function reportOpportunity(
  state: OpportunityMarketState,
  opportunityId: string,
  type: OpportunityReport["type"],
  reason: string,
): OpportunityMarketState {
  ensureWritable(state);
  opportunityOrThrow(state, opportunityId);
  if (!reason.trim()) throw new Error("报告原因不能为空。");
  const createdAt = eventTime(state.audit.length + 1);
  const report: OpportunityReport = {
    id: `report-${String(state.reports.length + 1).padStart(3, "0")}`,
    opportunityId,
    type,
    reason: reason.trim(),
    status: "queued_for_human_review",
    createdAt,
    affectedMatchRecalculated: true,
  };
  const nextStatus = type === "expired" ? "expired" : "under_review";
  const next = {
    ...state,
    opportunities: state.opportunities.map((opportunity) =>
      opportunity.id === opportunityId
        ? { ...opportunity, status: nextStatus as Opportunity["status"], updatedAt: createdAt }
        : opportunity,
    ),
    reports: [...state.reports, report],
    matchResults: state.matchResults.filter(
      (result) => result.opportunityId !== opportunityId,
    ),
    notifications: [
      ...state.notifications,
      {
        id: `notice-report-${String(state.notifications.length + 1).padStart(3, "0")}`,
        opportunityId,
        kind: type === "expired" ? ("expiry" as const) : ("report" as const),
        message:
          type === "expired"
            ? "机会已标记过期，并从当前匹配结果移除。"
            : "机会已进入人工复核，并从当前匹配结果移除。",
        createdAt,
        read: false,
      },
    ],
    message:
      "报告已进入人工复核；受影响的匹配已移除并说明原因，历史记录保留。",
  };
  return appendAudit(
    next,
    "report",
    report.id,
    `${type} reported for ${opportunityId}; affected match recalculated`,
  );
}

export function runFairnessAudit(
  state: OpportunityMarketState,
): OpportunityMarketState {
  ensureWritable(state);
  const checks = [
    {
      id: "fair-paid",
      label: "零付费排序",
      status: state.opportunities.every(
        (opportunity) => opportunity.paidRankingFactor === 0,
      )
        ? ("pass" as const)
        : ("fail" as const),
      detail: "所有机会 paidRankingFactor 必须为 0。",
    },
    {
      id: "fair-random",
      label: "零随机资格",
      status: state.opportunities.every(
        (opportunity) => !opportunity.randomAllocation,
      )
        ? ("pass" as const)
        : ("fail" as const),
      detail: "资格与机会不得用概率或抽卡分配。",
    },
    {
      id: "fair-auction",
      label: "零人员竞价",
      status: state.opportunities.every(
        (opportunity) => !opportunity.auctionEnabled,
      )
        ? ("pass" as const)
        : ("fail" as const),
      detail: "学生、导师与岗位均不可成为竞价对象。",
    },
    {
      id: "fair-sensitive",
      label: "零禁止字段",
      status: state.selectedProfileFieldIds.some((id) =>
        state.forbiddenProfileFieldIds.includes(id),
      )
        ? ("fail" as const)
        : ("pass" as const),
      detail: "健康、家庭、财务、门禁与支付记录不得进入匹配。",
    },
    {
      id: "fair-apply",
      label: "零自动投递",
      status: state.invariants.noAutoApply ? ("pass" as const) : ("fail" as const),
      detail: "平台只保存外部链接和本人镜像状态。",
    },
  ];
  const audit: FairnessAudit = {
    id: `fairness-${String(state.fairnessAudits.length + 1).padStart(3, "0")}`,
    runAt: eventTime(state.audit.length + 1),
    checks,
    sensitiveFieldsUsed: state.selectedProfileFieldIds.filter((id) =>
      state.forbiddenProfileFieldIds.includes(id),
    ),
    status: checks.every((check) => check.status === "pass") ? "pass" : "fail",
  };
  const next = {
    ...state,
    fairnessAudits: [...state.fairnessAudits, audit],
    message:
      audit.status === "pass"
        ? "反操纵审计通过：零付费、零随机、零竞价、零禁止字段、零自动投递。"
        : "反操纵审计失败：相关结果已禁止进入可演示状态。",
  };
  return appendAudit(
    next,
    "fairness_audit",
    audit.id,
    `${checks.filter((check) => check.status === "pass").length}/${checks.length} checks passed`,
  );
}

export function toggleOpportunityOffline(
  state: OpportunityMarketState,
): OpportunityMarketState {
  const offline = !state.offline;
  const next = {
    ...state,
    offline,
    message: offline
      ? `已离线：使用 ${state.lastUpdatedAt} 的 Fixture 缓存；不刷新规则、不生成新匹配。`
      : "已恢复本地服务；Fixture 来源与核对时间保持可见。",
  };
  return appendAudit(
    next,
    "offline_fallback",
    "opportunity-cache",
    offline ? "entered cached read-only mode" : "returned to local fixture mode",
  );
}

export function setOpportunityPreferences(
  state: OpportunityMarketState,
  preference: "simplified" | "reducedMotion",
): OpportunityMarketState {
  return {
    ...state,
    [preference]: !state[preference],
  };
}

export function opportunityBoxScore(
  state: OpportunityMarketState,
  opportunityId: string,
) {
  const opportunity = opportunityOrThrow(state, opportunityId);
  const check = state.eligibilityChecks.find(
    (item) => item.opportunityId === opportunityId,
  );
  const grant = state.disclosureGrants
    .filter((item) => item.opportunityId === opportunityId)
    .at(-1);
  return {
    opportunity_id: opportunityId,
    source: {
      url: opportunity.sourceUrl,
      version: opportunity.sourceVersion,
      fetched_at: opportunity.fetchedAt,
      verified_at: opportunity.verifiedAt,
      authority: "demo_fixture",
    },
    data_usage: {
      checked_fields: check?.usedProfileFieldIds ?? [],
      disclosed_fields: grant?.revokedAt ? [] : (grant?.profileFieldIds ?? []),
      forbidden_fields: state.forbiddenProfileFieldIds,
    },
    correction_route: opportunity.correctionRoute,
    status: opportunity.status,
    no_composite_score: true,
    no_auto_apply: true,
  };
}

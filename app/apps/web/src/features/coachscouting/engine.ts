import { COACH_SCOUTING_FIXTURE } from "./fixture";
import type {
  AdvisorHandoff,
  CoachAuditEvent,
  CoachScoutingFixture,
  CoachScoutingState,
  CoachStage,
  CorrectionCase,
  EvidenceSource,
  FairnessAudit,
  FeedbackAggregate,
  FeedbackDimension,
  FeedbackSubmission,
  GovernanceCase,
  GovernanceReportType,
  TeamMatch,
  VersionComparison,
} from "./types";

const BASE_TIME = new Date("2026-07-24T08:45:00+08:00").getTime();

const cloneFixture = (
  fixture: CoachScoutingFixture,
): CoachScoutingFixture => structuredClone(fixture);

const eventTime = (sequence: number): string =>
  new Date(BASE_TIME + sequence * 60_000).toISOString();

const appendAudit = (
  state: CoachScoutingState,
  action: string,
  targetId: string,
  detail: string,
): CoachScoutingState => {
  const previous = state.audit.at(-1);
  const sequence = (previous?.sequence ?? 0) + 1;
  const event: CoachAuditEvent = {
    id: `coach-event-${String(sequence).padStart(3, "0")}`,
    sequence,
    action,
    targetId,
    detail,
    occurredAt: eventTime(sequence),
    previousEventHash: previous?.eventHash ?? null,
    eventHash: `fnv1a-coach-event-${String(sequence).padStart(3, "0")}`,
  };
  return { ...state, audit: [...state.audit, event] };
};

const assertMutable = (state: CoachScoutingState) => {
  if (state.offline) {
    throw new Error("离线状态为只读；恢复连接后才能修改 Scouting Session。");
  }
};

export const evidenceSource = (
  state: CoachScoutingState,
  sourceId: string,
): EvidenceSource => {
  const source = state.fixture.sources.find((item) => item.id === sourceId);
  if (!source) throw new Error(`未知来源：${sourceId}`);
  return source;
};

export const createCoachScoutingState = (
  fixture: CoachScoutingFixture = COACH_SCOUTING_FIXTURE,
): CoachScoutingState => ({
  stage: "profile",
  fixture: cloneFixture(fixture),
  traditional: false,
  reducedMotion: false,
  offline: false,
  selectedVersionId: "version-2026sp",
  versionComparison: null,
  correctionCases: [],
  feedbackSubmissions: [],
  fairnessAudit: {
    id: "fairness-not-run",
    status: "not_run",
    sortMode: "explainable_match",
    checks: [],
    sensitiveAttributes: ["姓名", "性别", "国籍", "健康"],
    proxyFields: ["门禁轨迹", "支付历史", "家庭背景"],
    ranAt: null,
  },
  selectedTeamFieldIds: [
    "team-skill-signal",
    "team-skill-ui",
    "team-availability",
    "team-communication",
  ],
  teamMatches: [],
  advisorHandoff: null,
  acknowledgedReminderIds: [],
  governanceCases: [],
  hiddenTargetIds: [],
  audit: structuredClone(fixture.audit),
});

export const setCoachStage = (
  state: CoachScoutingState,
  stage: CoachStage,
): CoachScoutingState => ({ ...state, stage });

export const setCoachPreferences = (
  state: CoachScoutingState,
  preferences: Partial<
    Pick<CoachScoutingState, "traditional" | "reducedMotion">
  >,
): CoachScoutingState => ({ ...state, ...preferences });

export const setCoachOffline = (
  state: CoachScoutingState,
  offline: boolean,
): CoachScoutingState => ({ ...state, offline });

export const compareCourseVersions = (
  state: CoachScoutingState,
  fromVersionId: string,
  toVersionId: string,
): CoachScoutingState => {
  const from = state.fixture.versions.find(
    (version) => version.id === fromVersionId,
  );
  const to = state.fixture.versions.find(
    (version) => version.id === toVersionId,
  );
  if (!from || !to) throw new Error("需要两个已登记课程版本。");

  const changes = [
    from.assessmentSummary === to.assessmentSummary
      ? null
      : {
          id: "change-assessment",
          field: "考核构成",
          before: from.assessmentSummary,
          after: to.assessmentSummary,
          sourceIds: [...from.sourceIds, ...to.sourceIds],
        },
    from.teachingSummary === to.teachingSummary
      ? null
      : {
          id: "change-teaching",
          field: "教学结构",
          before: from.teachingSummary,
          after: to.teachingSummary,
          sourceIds: [...from.sourceIds, ...to.sourceIds],
        },
    from.instructorAssignmentId === to.instructorAssignmentId
      ? null
      : {
          id: "change-assignment",
          field: "任教关系",
          before: `${from.term} · ${from.instructorAssignmentId}`,
          after: `${to.term} · ${to.instructorAssignmentId}`,
          sourceIds: [...from.sourceIds, ...to.sourceIds],
        },
  ].filter((item): item is NonNullable<typeof item> => item !== null);

  const comparison: VersionComparison = {
    fromVersionId,
    toVersionId,
    sameInstructorAssignment:
      from.instructorAssignmentId === to.instructorAssignmentId,
    feedbackCarriedForward: false,
    changes,
    warning:
      from.instructorAssignmentId === to.instructorAssignmentId
        ? "只比较同一任教关系的课程字段；学生反馈仍绑定原始学期。"
        : "任教关系已经变化；历史反馈不会自动沿用到当前教师或开课。",
  };
  return appendAudit(
    {
      ...state,
      selectedVersionId: toVersionId,
      versionComparison: comparison,
    },
    "compare_versions",
    `${fromVersionId}->${toVersionId}`,
    "compared registered versions without carrying student feedback forward",
  );
};

export const submitTeacherCorrection = (
  state: CoachScoutingState,
  input: {
    targetId: string;
    type: CorrectionCase["type"];
    statement: string;
    evidenceIds: string[];
  },
): CoachScoutingState => {
  assertMutable(state);
  if (input.statement.trim().length < 12 || input.evidenceIds.length === 0) {
    throw new Error("教师纠错需要具体说明和至少一条已登记证据。");
  }
  input.evidenceIds.forEach((id) => evidenceSource(state, id));
  const index = state.correctionCases.length + 1;
  const createdAt = eventTime(state.audit.length + 1);
  const correction: CorrectionCase = {
    id: `correction-${String(index).padStart(3, "0")}`,
    targetId: input.targetId,
    requestedBy: "teacher_fixture",
    type: input.type,
    statement: input.statement.trim(),
    evidenceIds: [...new Set(input.evidenceIds)],
    status: "submitted",
    createdAt,
    reviewDueAt: new Date(
      new Date(createdAt).getTime() + 48 * 60 * 60 * 1000,
    ).toISOString(),
    history: [
      {
        status: "submitted",
        occurredAt: createdAt,
        note: "Fixture 教师提交；公开字段尚未被静默覆盖。",
      },
    ],
  };
  return appendAudit(
    { ...state, correctionCases: [...state.correctionCases, correction] },
    "submit_correction",
    correction.id,
    "teacher context submitted with evidence; history preserved",
  );
};

export const reviewTeacherCorrection = (
  state: CoachScoutingState,
  correctionId: string,
  status: "in_review" | "accepted" | "rejected",
): CoachScoutingState => {
  assertMutable(state);
  const current = state.correctionCases.find(
    (item) => item.id === correctionId,
  );
  if (!current) throw new Error("纠错工单不存在。");
  if (
    current.status === "accepted" ||
    current.status === "rejected" ||
    (current.status === "submitted" && status !== "in_review") ||
    (current.status === "in_review" && status === "in_review")
  ) {
    throw new Error("纠错状态迁移无效。");
  }
  const occurredAt = eventTime(state.audit.length + 1);
  const updated = state.correctionCases.map((item) =>
    item.id === correctionId
      ? {
          ...item,
          status,
          history: [
            ...item.history,
            {
              status,
              occurredAt,
              note:
                status === "accepted"
                  ? "已接受为新上下文；原版本仍可追溯。"
                  : status === "rejected"
                    ? "人工复核未接受；理由保留在工单。"
                    : "已进入人工复核；不生成教师人格结论。",
            },
          ],
        }
      : item,
  );
  return appendAudit(
    { ...state, correctionCases: updated },
    "review_correction",
    correctionId,
    `correction moved to ${status}; prior history retained`,
  );
};

const unsafeFeedback = (value: string): boolean =>
  /(人品|垃圾|变态|最差|滚|废物|外貌|性别|国籍)/i.test(value);

export const submitStructuredFeedback = (
  state: CoachScoutingState,
  input: {
    dimension: FeedbackDimension;
    concreteExperience: string;
    suggestedAction: string;
    consentToAggregate: boolean;
  },
): CoachScoutingState => {
  assertMutable(state);
  const concreteExperience = input.concreteExperience.trim();
  const suggestedAction = input.suggestedAction.trim();
  if (concreteExperience.length < 12 || suggestedAction.length < 8) {
    throw new Error("反馈必须描述具体课程体验和可行动建议。");
  }
  const held = unsafeFeedback(`${concreteExperience} ${suggestedAction}`);
  const submission: FeedbackSubmission = {
    id: `feedback-${String(state.feedbackSubmissions.length + 1).padStart(
      3,
      "0",
    )}`,
    offeringId: state.fixture.course.offeringId,
    dimension: input.dimension,
    concreteExperience,
    suggestedAction,
    consentToAggregate: input.consentToAggregate,
    safetyStatus: held ? "held_for_review" : "eligible",
    createdAt: eventTime(state.audit.length + 1),
  };
  return appendAudit(
    {
      ...state,
      feedbackSubmissions: [...state.feedbackSubmissions, submission],
    },
    held ? "hold_feedback" : "submit_feedback",
    submission.id,
    held
      ? "feedback held before aggregation for human governance review"
      : "specific actionable feedback stored privately pending threshold",
  );
};

export const publishableFeedback = (
  state: CoachScoutingState,
): FeedbackAggregate[] =>
  state.fixture.feedbackAggregates.map((aggregate) => ({
    ...aggregate,
    published:
      aggregate.sampleSize >= aggregate.minimumSample &&
      !state.hiddenTargetIds.includes(aggregate.id),
  }));

export const runCoachFairnessAudit = (
  state: CoachScoutingState,
): CoachScoutingState => {
  const selectedFields = state.fixture.teamFields.filter((field) =>
    state.selectedTeamFieldIds.includes(field.id),
  );
  const sensitiveSelected = selectedFields.filter(
    (field) => field.kind === "sensitive",
  );
  const checks = [
    {
      id: "fair-course-not-person",
      label: "课程特征替代人格评分",
      passed:
        state.fixture.invariants.noTeacherRating &&
        state.fixture.invariants.noPersonalityLabels,
      detail: "无星级、热度、人格标签或教师综合分。",
    },
    {
      id: "fair-version-boundary",
      label: "任教关系与版本隔离",
      passed: state.fixture.invariants.noFeedbackCarryForward,
      detail: "旧反馈绑定原开课，不自动归因到新教师或新学期。",
    },
    {
      id: "fair-sample-threshold",
      label: "反馈最小样本",
      passed: state.fixture.feedbackAggregates.every(
        (item) =>
          item.published === (item.sampleSize >= item.minimumSample),
      ),
      detail: "不足 5 份的聚合保持隐藏，不输出方向性结论。",
    },
    {
      id: "fair-team-sensitive",
      label: "组队不使用敏感身份",
      passed:
        sensitiveSelected.length === 0 &&
        state.fixture.invariants.noSensitiveTeamMatching,
      detail: "姓名、性别、国籍、健康、门禁和支付历史不参与匹配。",
    },
    {
      id: "fair-advisor-truth",
      label: "不伪造导师意见",
      passed:
        state.fixture.invariants.noFabricatedAdvisorReply &&
        (state.advisorHandoff === null ||
          state.advisorHandoff.advisorResponse === null),
      detail: "Handoff 只整理学生问题和证据，advisor_response 始终为空。",
    },
  ];
  const passed = checks.every((check) => check.passed);
  const audit: FairnessAudit = {
    id: `fairness-${state.audit.length + 1}`,
    status: passed ? "pass" : "degraded",
    sortMode: passed ? "explainable_match" : "time_and_topic",
    checks,
    sensitiveAttributes: ["姓名", "性别", "国籍", "健康"],
    proxyFields: ["门禁轨迹", "支付历史", "家庭背景"],
    ranAt: eventTime(state.audit.length + 1),
  };
  return appendAudit(
    { ...state, fairnessAudit: audit },
    "fairness_audit",
    audit.id,
    passed
      ? "five fairness invariants passed"
      : "audit degraded recommendation to time-and-topic sorting",
  );
};

export const toggleTeamProfileField = (
  state: CoachScoutingState,
  fieldId: string,
): CoachScoutingState => {
  assertMutable(state);
  const field = state.fixture.teamFields.find((item) => item.id === fieldId);
  if (!field) throw new Error("组队资料字段不存在。");
  if (!field.selectable || field.kind === "sensitive") {
    throw new Error("敏感字段不能进入组队匹配。");
  }
  const selected = state.selectedTeamFieldIds.includes(fieldId)
    ? state.selectedTeamFieldIds.filter((id) => id !== fieldId)
    : [...state.selectedTeamFieldIds, fieldId];
  return appendAudit(
    { ...state, selectedTeamFieldIds: selected, teamMatches: [] },
    "select_team_profile",
    fieldId,
    selected.includes(fieldId)
      ? "student included field for this match only"
      : "student removed field from this match",
  );
};

export const runTeamMatching = (
  state: CoachScoutingState,
): CoachScoutingState => {
  const fields = state.fixture.teamFields.filter((field) =>
    state.selectedTeamFieldIds.includes(field.id),
  );
  if (fields.length === 0) {
    throw new Error("至少选择一项本人资料后才能匹配。");
  }
  if (fields.some((field) => field.kind === "sensitive")) {
    throw new Error("敏感字段不能进入组队匹配。");
  }
  const values = new Set(fields.map((field) => field.value));
  const availability = values.has("5_hours") ? 5 : null;
  const matches: TeamMatch[] = state.fixture.teamNeeds.map((need) => {
    const matchedSkills = need.skills.filter((skill) => values.has(skill));
    const communicationMet = need.communication.some((item) =>
      values.has(item),
    );
    const conflicts =
      availability !== null && availability < need.hoursPerWeek
        ? [`需要每周 ${need.hoursPerWeek} 小时；当前只披露 ${availability} 小时`]
        : [];
    const unknowns =
      availability === null ? ["未披露可用时间"] : [];
    const reasons = [
      ...matchedSkills.map((skill) => `已披露技能 ${skill} 对应角色缺口`),
      ...(communicationMet ? ["沟通偏好与团队方式一致"] : []),
    ];
    return {
      teamNeedId: need.id,
      status:
        reasons.length === 0
          ? "insufficient_data"
          : conflicts.length > 0 || unknowns.length > 0
            ? "needs_confirmation"
            : "ready_to_discuss",
      reasons,
      conflicts,
      unknowns,
      usedFieldIds: fields.map((field) => field.id),
      usedSensitiveAttributes: false,
    };
  });
  return appendAudit(
    { ...state, teamMatches: matches },
    "team_match",
    state.fixture.course.offeringId,
    `generated ${matches.length} explainable matches without sensitive attributes`,
  );
};

export const buildAdvisorHandoff = (
  state: CoachScoutingState,
  input: {
    questions: string[];
    evidenceIds: string[];
    scenarioIds: string[];
    consentConfirmed: boolean;
  },
): CoachScoutingState => {
  assertMutable(state);
  const questions = input.questions
    .map((question) => question.trim())
    .filter(Boolean);
  if (!input.consentConfirmed || questions.length === 0) {
    throw new Error("Handoff 需要学生确认并至少保留一个真实问题。");
  }
  input.evidenceIds.forEach((id) => evidenceSource(state, id));
  const handoff: AdvisorHandoff = {
    id: `handoff-${String(state.audit.length + 1).padStart(3, "0")}`,
    offeringId: state.fixture.course.offeringId,
    questions,
    evidenceIds: [...new Set(input.evidenceIds)],
    scenarioIds: [...new Set(input.scenarioIds)],
    consentConfirmed: true,
    status: "ready_for_student",
    advisorResponse: null,
    createdAt: eventTime(state.audit.length + 1),
  };
  return appendAudit(
    { ...state, advisorHandoff: handoff },
    "build_advisor_handoff",
    handoff.id,
    "student-approved questions and evidence prepared; no advisor reply fabricated",
  );
};

export const acknowledgeExpectation = (
  state: CoachScoutingState,
  reminderId: string,
): CoachScoutingState => {
  assertMutable(state);
  if (!state.fixture.reminders.some((item) => item.id === reminderId)) {
    throw new Error("预期提醒不存在。");
  }
  if (state.acknowledgedReminderIds.includes(reminderId)) return state;
  return appendAudit(
    {
      ...state,
      acknowledgedReminderIds: [
        ...state.acknowledgedReminderIds,
        reminderId,
      ],
    },
    "acknowledge_expectation",
    reminderId,
    "student acknowledged reminder without granting institutional approval",
  );
};

export const reportGovernanceIssue = (
  state: CoachScoutingState,
  input: {
    reportType: GovernanceReportType;
    targetId: string;
    evidence: string;
    serious: boolean;
  },
): CoachScoutingState => {
  assertMutable(state);
  if (input.evidence.trim().length < 8) {
    throw new Error("治理报告需要具体证据或可复核描述。");
  }
  const createdAt = eventTime(state.audit.length + 1);
  const governanceCase: GovernanceCase = {
    id: `governance-${String(state.governanceCases.length + 1).padStart(
      3,
      "0",
    )}`,
    reportType: input.reportType,
    targetId: input.targetId,
    evidence: input.evidence.trim(),
    serious: input.serious,
    temporaryMeasure: input.serious ? "hidden_pending_review" : "none",
    status: input.serious ? "under_review" : "submitted",
    createdAt,
    reviewDueAt: new Date(
      new Date(createdAt).getTime() + (input.serious ? 24 : 72) * 60 * 60 * 1000,
    ).toISOString(),
  };
  const hiddenTargetIds =
    input.serious && !state.hiddenTargetIds.includes(input.targetId)
      ? [...state.hiddenTargetIds, input.targetId]
      : state.hiddenTargetIds;
  return appendAudit(
    {
      ...state,
      governanceCases: [...state.governanceCases, governanceCase],
      hiddenTargetIds,
    },
    "report_governance",
    governanceCase.id,
    input.serious
      ? "serious content hidden pending time-bound human review"
      : "report submitted for time-bound human review",
  );
};

export const coachBoxScore = (state: CoachScoutingState) => ({
  sourceTiers: new Set(state.fixture.sources.map((source) => source.tier))
    .size,
  sourcedProfileFields:
    1 +
    state.fixture.course.objectives.length +
    state.fixture.course.textbooks.length +
    state.fixture.course.prerequisites.length +
    state.fixture.course.assessments.length,
  activeOfficeHours: state.fixture.officeHours.filter(
    (item) => item.status === "active",
  ).length,
  visibleFeedbackAggregates: publishableFeedback(state).filter(
    (item) => item.published,
  ).length,
  hiddenForLowSample: publishableFeedback(state).filter(
    (item) => !item.published,
  ).length,
  fairnessStatus: state.fairnessAudit.status,
  sensitiveTeamFieldsUsed: 0,
  fabricatedAdvisorReplies: state.advisorHandoff?.advisorResponse ? 1 : 0,
  governanceCases: state.governanceCases.length,
  auditEvents: state.audit.length,
  nonAuthoritative: true,
});

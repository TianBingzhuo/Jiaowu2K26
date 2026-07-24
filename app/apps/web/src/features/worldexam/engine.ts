import { SMARTCOURSE_FIXTURE } from "../smartcourse/fixture";
import { WORLD_EXAM_FIXTURE } from "./fixture";
import type {
  ExamAnswer,
  ExamBoxScore,
  ExamStep,
  NarrativeMode,
  PostGameReflection,
  WorldExamFixture,
  WorldExamState,
} from "./types";

const baseState = (): WorldExamState => ({
  schemaVersion: "1.0.0",
  dataMode: "fixture",
  step: "calendar",
  narrativeMode: "immersive",
  eventStatus: WORLD_EXAM_FIXTURE.event.status,
  warmupAnswer: null,
  warmupAttempts: 0,
  completedPlaybookItemIds: [],
  playbookOrder: WORLD_EXAM_FIXTURE.playbook.map((section) => section.id),
  answers: [],
  checkedSourceQuestionIds: [],
  challengedClaimIds: [],
  timeline: [],
  reflection: {
    worked: "",
    blocked: "",
    nextAdjustment: "",
    shareWithMentor: false,
    shareExpiresAt: null,
  },
  syncStatus: "synced",
  pendingSyncCount: 0,
});

const occurredAt = (sequence: number) =>
  `2026-07-24T${String(11 + Math.floor(sequence / 6)).padStart(2, "0")}:${String(
    (sequence % 6) * 5,
  ).padStart(2, "0")}:00+08:00`;

const appendEvent = (
  state: WorldExamState,
  event: Omit<
    WorldExamState["timeline"][number],
    "id" | "occurredAt"
  >,
): WorldExamState["timeline"] => [
  ...state.timeline,
  {
    ...event,
    id: `exam-event-${String(state.timeline.length + 1).padStart(3, "0")}`,
    occurredAt: occurredAt(state.timeline.length),
  },
];

const requireMatchQuestion = (questionId: string) => {
  const question = WORLD_EXAM_FIXTURE.matchQuestions.find(
    (candidate) => candidate.id === questionId,
  );
  if (!question) throw new Error(`Unknown match question: ${questionId}`);
  return question;
};

export const createWorldExamState = () => baseState();

export function setNarrativeMode(
  state: WorldExamState,
  narrativeMode: NarrativeMode,
): WorldExamState {
  return { ...state, narrativeMode };
}

export function setExamStep(
  state: WorldExamState,
  step: ExamStep,
  demoUnlocked = false,
): WorldExamState {
  if (!canOpenExamStep(state, step, demoUnlocked)) {
    throw new Error(`Exam step is still locked: ${step}`);
  }
  return { ...state, step };
}

export function openBriefing(state: WorldExamState): WorldExamState {
  if (state.timeline.some((event) => event.eventType === "briefing_opened")) {
    return { ...state, step: "briefing" };
  }
  return {
    ...state,
    step: "briefing",
    eventStatus: "briefing_open",
    timeline: appendEvent(state, {
      eventType: "briefing_opened",
      label: "南同学打开模拟期末赛前简报",
      sourceIds: WORLD_EXAM_FIXTURE.briefing.sources.map(
        (source) => source.sourceId,
      ),
    }),
  };
}

export function startWarmup(state: WorldExamState): WorldExamState {
  if (!state.timeline.some((event) => event.eventType === "briefing_opened")) {
    throw new Error("Warm-up requires an opened briefing.");
  }
  return { ...state, step: "warmup", eventStatus: "warmup" };
}

export function answerWarmup(
  state: WorldExamState,
  answer: string,
): WorldExamState {
  if (
    !WORLD_EXAM_FIXTURE.warmup.options.some((option) => option.id === answer)
  ) {
    throw new Error("Warm-up answer is not one of the declared options.");
  }
  const correct = answer === WORLD_EXAM_FIXTURE.warmup.correctAnswer;
  return {
    ...state,
    warmupAnswer: answer,
    warmupAttempts: state.warmupAttempts + 1,
    timeline: appendEvent(state, {
      eventType: "warmup_answered",
      label: `低风险热身第 ${state.warmupAttempts + 1} 次作答：${
        correct ? "命中" : "待复核"
      }`,
      sourceIds: WORLD_EXAM_FIXTURE.warmup.sourceIds,
    }),
  };
}

export function retryWarmup(state: WorldExamState): WorldExamState {
  if (!state.warmupAnswer) {
    throw new Error("Warm-up has no answer to retry.");
  }
  return {
    ...state,
    warmupAnswer: null,
    timeline: appendEvent(state, {
      eventType: "warmup_retried",
      label: "南同学选择清空答案并重试低风险热身",
      sourceIds: WORLD_EXAM_FIXTURE.warmup.sourceIds,
    }),
  };
}

export function skipWarmup(state: WorldExamState): WorldExamState {
  return {
    ...state,
    step: "playbook",
    eventStatus: "warmup",
    timeline: appendEvent(state, {
      eventType: "warmup_skipped",
      label: "南同学跳过低风险热身；复习资源仍保持完整可用",
      sourceIds: WORLD_EXAM_FIXTURE.warmup.sourceIds,
    }),
  };
}

export function openPlaybook(state: WorldExamState): WorldExamState {
  if (
    !state.warmupAnswer &&
    !state.timeline.some((event) => event.eventType === "warmup_skipped")
  ) {
    throw new Error("Answer or explicitly skip the warm-up first.");
  }
  return { ...state, step: "playbook" };
}

export function togglePlaybookItem(
  state: WorldExamState,
  itemId: string,
): WorldExamState {
  const item = WORLD_EXAM_FIXTURE.playbook
    .flatMap((section) => section.items)
    .find((candidate) => candidate.id === itemId);
  if (!item) throw new Error(`Unknown playbook item: ${itemId}`);
  const completed = state.completedPlaybookItemIds.includes(itemId);
  const nextIds = completed
    ? state.completedPlaybookItemIds.filter((candidate) => candidate !== itemId)
    : [...state.completedPlaybookItemIds, itemId];
  return {
    ...state,
    completedPlaybookItemIds: nextIds,
    timeline: appendEvent(state, {
      eventType: "checkpoint_saved",
      label: `${completed ? "撤回" : "记录"}复习检查点：${item.title}`,
      sourceIds: item.sourceIds,
    }),
  };
}

export function movePlaybookSection(
  state: WorldExamState,
  sectionId: string,
  direction: -1 | 1,
): WorldExamState {
  const index = state.playbookOrder.indexOf(sectionId);
  if (index < 0) throw new Error(`Unknown playbook section: ${sectionId}`);
  const target = index + direction;
  if (target < 0 || target >= state.playbookOrder.length) return state;
  const order = [...state.playbookOrder];
  [order[index], order[target]] = [order[target], order[index]];
  return {
    ...state,
    playbookOrder: order,
    timeline: appendEvent(state, {
      eventType: "playbook_adjusted",
      label: "南同学调整个人复习顺序",
      sourceIds: [],
    }),
  };
}

export function startKeyMatch(state: WorldExamState): WorldExamState {
  if (state.step !== "playbook") {
    throw new Error("Key Match starts from the review playbook.");
  }
  return {
    ...state,
    step: "match",
    eventStatus: "exam_active",
    timeline: appendEvent(state, {
      eventType: "match_started",
      label: "模拟 Key Match 开始；不计正式成绩",
      sourceIds: [],
    }),
  };
}

export function checkQuestionSources(
  state: WorldExamState,
  questionId: string,
): WorldExamState {
  const question = requireMatchQuestion(questionId);
  if (state.checkedSourceQuestionIds.includes(questionId)) return state;
  return {
    ...state,
    checkedSourceQuestionIds: [...state.checkedSourceQuestionIds, questionId],
    answers: state.answers.map((answer) =>
      answer.questionId === questionId
        ? { ...answer, sourceChecked: true }
        : answer,
    ),
    timeline: appendEvent(state, {
      eventType: "source_checked",
      label: `查看题目来源：${question.prompt}`,
      sourceIds: question.sourceIds,
    }),
  };
}

export function challengeAiClaim(
  state: WorldExamState,
  claimId: string,
): WorldExamState {
  const claim = WORLD_EXAM_FIXTURE.matchQuestions
    .flatMap((question) => question.aiTrace ?? [])
    .find((candidate) => candidate.id === claimId);
  if (!claim) throw new Error(`Unknown AI claim: ${claimId}`);
  if (state.challengedClaimIds.includes(claimId)) return state;
  return {
    ...state,
    challengedClaimIds: [...state.challengedClaimIds, claimId],
    timeline: appendEvent(state, {
      eventType: "ai_claim_challenged",
      label: `挑战 AI 断言：${claim.claim}`,
      sourceIds: [claim.sourceId],
    }),
  };
}

export function submitMatchAnswer(
  state: WorldExamState,
  questionId: string,
  response: string,
): WorldExamState {
  const question = requireMatchQuestion(questionId);
  if (!question.options.some((option) => option.id === response)) {
    throw new Error("Match response is not one of the declared options.");
  }
  const correct = response === question.correctAnswer;
  const answer: ExamAnswer = {
    questionId,
    response,
    correct,
    sourceChecked: state.checkedSourceQuestionIds.includes(questionId),
    errorCategory: correct ? null : "conceptual",
  };
  const existing = state.answers.some(
    (candidate) => candidate.questionId === questionId,
  );
  const inferredChallengeIds =
    question.responseType === "source_challenge" &&
    response === question.correctAnswer
      ? (question.aiTrace ?? [])
          .filter((claim) => claim.confidence === "unsupported")
          .map((claim) => claim.id)
      : [];
  const challengedClaimIds = Array.from(
    new Set([...state.challengedClaimIds, ...inferredChallengeIds]),
  );
  return {
    ...state,
    answers: existing
      ? state.answers.map((candidate) =>
          candidate.questionId === questionId ? answer : candidate,
        )
      : [...state.answers, answer],
    challengedClaimIds,
    timeline: appendEvent(state, {
      eventType: "answer_submitted",
      label: `自动保存模拟题：${correct ? "命中" : "待复盘"}${
        inferredChallengeIds.length ? "；同步记录来源挑战" : ""
      }`,
      sourceIds: question.sourceIds,
    }),
  };
}

export function isKeyMatchReady(state: WorldExamState): boolean {
  const answeredQuestionIds = new Set(
    state.answers.map((answer) => answer.questionId),
  );
  const sourceChallengeRecorded =
    state.challengedClaimIds.includes("claim-simulator-wrong") ||
    state.answers.some(
      (answer) =>
        answer.questionId === "match-ai-trace" &&
        answer.response ===
          requireMatchQuestion("match-ai-trace").correctAnswer,
    );
  return (
    WORLD_EXAM_FIXTURE.matchQuestions.every((question) =>
      answeredQuestionIds.has(question.id),
    ) && sourceChallengeRecorded
  );
}

export function finishKeyMatch(state: WorldExamState): WorldExamState {
  const answeredQuestionIds = new Set(
    state.answers.map((answer) => answer.questionId),
  );
  if (
    !WORLD_EXAM_FIXTURE.matchQuestions.every((question) =>
      answeredQuestionIds.has(question.id),
    )
  ) {
    throw new Error("Answer every Key Match question before finishing.");
  }
  if (!isKeyMatchReady(state)) {
    throw new Error("Challenge the unsupported AI claim before finishing.");
  }
  return {
    ...state,
    challengedClaimIds: Array.from(
      new Set([...state.challengedClaimIds, "claim-simulator-wrong"]),
    ),
    step: "replay",
    eventStatus: "review",
    timeline: appendEvent(state, {
      eventType: "match_finished",
      label: "模拟 Key Match 完成，进入私密 Replay 与 Box Score",
      sourceIds: Array.from(
        new Set(
          WORLD_EXAM_FIXTURE.matchQuestions.flatMap(
            (question) => question.sourceIds,
          ),
        ),
      ),
    }),
  };
}

export function openReflection(state: WorldExamState): WorldExamState {
  if (state.eventStatus !== "review" && state.eventStatus !== "archived") {
    throw new Error("Reflection is available after the Key Match review.");
  }
  return { ...state, step: "reflection" };
}

export function saveReflection(
  state: WorldExamState,
  reflection: PostGameReflection,
): WorldExamState {
  if (
    !reflection.worked.trim() ||
    !reflection.blocked.trim() ||
    !reflection.nextAdjustment.trim()
  ) {
    throw new Error("Complete all three reflection prompts.");
  }
  if (reflection.shareWithMentor && !reflection.shareExpiresAt) {
    throw new Error("Mentor sharing requires an expiry date.");
  }
  const normalized = {
    ...reflection,
    worked: reflection.worked.trim(),
    blocked: reflection.blocked.trim(),
    nextAdjustment: reflection.nextAdjustment.trim(),
  };
  return {
    ...state,
    reflection: normalized,
    timeline: appendEvent(state, {
      eventType: "reflection_saved",
      label: `私密复盘已保存${
        normalized.shareWithMentor ? "；已记录导师分享同意和到期日" : ""
      }`,
      sourceIds: [],
    }),
  };
}

export function archiveExam(state: WorldExamState): WorldExamState {
  if (!state.reflection.worked) {
    throw new Error("Save a reflection before archiving.");
  }
  return {
    ...state,
    eventStatus: "archived",
    timeline: appendEvent(state, {
      eventType: "archived",
      label: "模拟赛事已归档；不再接受新作答",
      sourceIds: [],
    }),
  };
}

export function setSyncState(
  state: WorldExamState,
  syncStatus: WorldExamState["syncStatus"],
  pendingSyncCount: number,
): WorldExamState {
  return {
    ...state,
    syncStatus,
    pendingSyncCount: Math.max(0, pendingSyncCount),
  };
}

export function canOpenExamStep(
  state: WorldExamState,
  step: ExamStep,
  demoUnlocked = false,
): boolean {
  if (demoUnlocked) return true;
  if (step === "calendar") return true;
  if (step === "briefing") {
    return state.timeline.some((event) => event.eventType === "briefing_opened");
  }
  if (step === "warmup") {
    return state.timeline.some((event) => event.eventType === "briefing_opened");
  }
  if (step === "playbook") {
    return Boolean(
      state.warmupAnswer ||
        state.timeline.some((event) => event.eventType === "warmup_skipped"),
    );
  }
  if (step === "match") {
    return state.timeline.some((event) => event.eventType === "match_started");
  }
  if (step === "replay") {
    return state.timeline.some((event) => event.eventType === "match_finished");
  }
  return state.eventStatus === "review" || state.eventStatus === "archived";
}

export function getExamBoxScore(state: WorldExamState): ExamBoxScore {
  const totalQuestions = WORLD_EXAM_FIXTURE.matchQuestions.length;
  const correctCount = state.answers.filter((answer) => answer.correct).length;
  const errorCounts = {
    conceptual: 0,
    computational: 0,
    careless: 0,
    unknown: 0,
  };
  for (const answer of state.answers) {
    if (answer.errorCategory) errorCounts[answer.errorCategory] += 1;
  }
  return {
    completionPct: Math.round((state.answers.length / totalQuestions) * 100),
    correctCount,
    totalQuestions,
    sourcesChecked: state.checkedSourceQuestionIds.length,
    challengedClaims: state.challengedClaimIds.length,
    errorCounts,
  };
}

export function validateWorldExamFixture(
  fixture: WorldExamFixture = WORLD_EXAM_FIXTURE,
): string[] {
  const errors: string[] = [];
  const sourceIds = new Set(
    SMARTCOURSE_FIXTURE.sources.map((source) => source.id),
  );
  const objectIds = new Set(
    SMARTCOURSE_FIXTURE.objects.map((object) => object.id),
  );
  const allLinks = [
    ...fixture.briefing.sources.map((source) => ({
      objectId: null,
      sourceIds: [source.sourceId],
    })),
    { objectId: fixture.warmup.objectId, sourceIds: fixture.warmup.sourceIds },
    ...fixture.playbook.flatMap((section) =>
      section.items.map((item) => ({
        objectId: item.objectId,
        sourceIds: item.sourceIds,
      })),
    ),
    ...fixture.matchQuestions.map((question) => ({
      objectId: question.objectId,
      sourceIds: question.sourceIds,
    })),
  ];
  for (const link of allLinks) {
    if (link.objectId && !objectIds.has(link.objectId)) {
      errors.push(`Unknown F-001 object: ${link.objectId}`);
    }
    for (const sourceId of link.sourceIds) {
      if (!sourceIds.has(sourceId)) {
        errors.push(`Unknown F-001 source: ${sourceId}`);
      }
    }
  }
  if (fixture.event.isFormal) {
    errors.push("The public demo Key Match must not impersonate a formal exam.");
  }
  return errors;
}

export function exportReflectionPayload(state: WorldExamState) {
  return {
    schema_version: state.schemaVersion,
    data_mode: state.dataMode,
    student_id: WORLD_EXAM_FIXTURE.studentId,
    exam_event_id: WORLD_EXAM_FIXTURE.event.id,
    exported_at: "2026-07-24T12:00:00+08:00",
    reflection: state.reflection,
    box_score: getExamBoxScore(state),
    source_boundary: WORLD_EXAM_FIXTURE.sourceBoundary,
  };
}

export const resetWorldExamState = () => baseState();

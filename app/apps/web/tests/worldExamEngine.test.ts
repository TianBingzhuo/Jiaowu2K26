import { describe, expect, it } from "vitest";
import {
  answerWarmup,
  archiveExam,
  challengeAiClaim,
  checkQuestionSources,
  createWorldExamState,
  exportReflectionPayload,
  finishKeyMatch,
  getExamBoxScore,
  isKeyMatchReady,
  movePlaybookSection,
  openBriefing,
  openPlaybook,
  openReflection,
  retryWarmup,
  saveReflection,
  setNarrativeMode,
  skipWarmup,
  startKeyMatch,
  startWarmup,
  submitMatchAnswer,
  togglePlaybookItem,
  validateWorldExamFixture,
} from "../src/features/worldexam/engine";
import { WORLD_EXAM_FIXTURE } from "../src/features/worldexam/fixture";
import { isWorldExamState } from "../src/features/worldexam/storage";

describe("World Exam Finals fixture contract", () => {
  it("reuses only traceable F-001 objects and sources", () => {
    expect(validateWorldExamFixture()).toEqual([]);
    expect(WORLD_EXAM_FIXTURE.event.isFormal).toBe(false);
    expect(WORLD_EXAM_FIXTURE.sourceBoundary).toContain("不是正式考试或成绩");
  });

  it("rejects invented sources and a demo disguised as a formal exam", () => {
    const invalid = structuredClone(WORLD_EXAM_FIXTURE);
    invalid.event.isFormal = true;
    invalid.briefing.sources[0].sourceId = "source-invented";

    expect(validateWorldExamFixture(invalid)).toEqual(
      expect.arrayContaining([
        "Unknown F-001 source: source-invented",
        "The public demo Key Match must not impersonate a formal exam.",
      ]),
    );
  });
});

describe("World Exam Finals state machine", () => {
  it("completes calendar → briefing → warm-up → playbook → match → replay → reflection", () => {
    let state = createWorldExamState();
    state = openBriefing(state);
    state = startWarmup(state);
    state = answerWarmup(state, "decrease");
    state = openPlaybook(state);
    state = togglePlaybookItem(state, "item-cutoff-check");
    state = movePlaybookSection(state, "section-bode", -1);
    state = startKeyMatch(state);
    state = checkQuestionSources(state, "match-cutoff");
    state = submitMatchAnswer(state, "match-cutoff", "decrease");
    state = checkQuestionSources(state, "match-ai-trace");
    state = challengeAiClaim(state, "claim-simulator-wrong");
    state = submitMatchAnswer(state, "match-ai-trace", "challenge");
    state = finishKeyMatch(state);

    expect(state.step).toBe("replay");
    expect(getExamBoxScore(state)).toEqual({
      completionPct: 100,
      correctCount: 2,
      totalQuestions: 2,
      sourcesChecked: 2,
      challengedClaims: 1,
      errorCounts: {
        conceptual: 0,
        computational: 0,
        careless: 0,
        unknown: 0,
      },
    });

    state = openReflection(state);
    state = saveReflection(state, {
      worked: "先看来源再判断。",
      blocked: "仪器负载仍不熟。",
      nextAdjustment: "下轮先补误差表。",
      shareWithMentor: true,
      shareExpiresAt: "2026-08-07",
    });
    state = archiveExam(state);

    expect(state.eventStatus).toBe("archived");
    expect(state.timeline.map((event) => event.eventType)).toEqual(
      expect.arrayContaining([
        "briefing_opened",
        "warmup_answered",
        "checkpoint_saved",
        "playbook_adjusted",
        "match_started",
        "source_checked",
        "ai_claim_challenged",
        "answer_submitted",
        "match_finished",
        "reflection_saved",
        "archived",
      ]),
    );
    expect(
      state.timeline.every((event) =>
        event.sourceIds.every((sourceId) => sourceId.startsWith("source-sls-")),
      ),
    ).toBe(true);
  });

  it("supports a retry or explicit skip without turning an error into identity", () => {
    let state = startWarmup(openBriefing(createWorldExamState()));
    state = answerWarmup(state, "increase");
    expect(getExamBoxScore(state).errorCounts).toEqual({
      conceptual: 0,
      computational: 0,
      careless: 0,
      unknown: 0,
    });

    state = retryWarmup(state);
    expect(state.warmupAnswer).toBeNull();
    state = skipWarmup(state);
    expect(state.step).toBe("playbook");
    expect(state.timeline.at(-1)?.label).toContain("资源仍保持完整可用");
  });

  it("blocks finishing until every answer and the unsupported AI claim are reviewed", () => {
    let state = skipWarmup(
      startWarmup(openBriefing(createWorldExamState())),
    );
    state = startKeyMatch(state);
    state = submitMatchAnswer(state, "match-cutoff", "decrease");
    expect(() => finishKeyMatch(state)).toThrow("Answer every");

    state = submitMatchAnswer(state, "match-ai-trace", "accept");
    expect(() => finishKeyMatch(state)).toThrow(
      "Challenge the unsupported AI claim",
    );
  });

  it("treats selecting the source-challenge answer as the challenge action", () => {
    let state = skipWarmup(
      startWarmup(openBriefing(createWorldExamState())),
    );
    state = startKeyMatch(state);
    state = submitMatchAnswer(state, "match-cutoff", "decrease");
    state = submitMatchAnswer(state, "match-ai-trace", "challenge");

    expect(state.answers).toHaveLength(2);
    expect(state.challengedClaimIds).toContain("claim-simulator-wrong");
    expect(isKeyMatchReady(state)).toBe(true);
    expect(finishKeyMatch(state).step).toBe("replay");
  });

  it("keeps all functions available in immersive, light and traditional narratives", () => {
    const base = createWorldExamState();
    for (const mode of ["immersive", "light", "traditional"] as const) {
      const state = setNarrativeMode(base, mode);
      expect(state.narrativeMode).toBe(mode);
      expect(state.step).toBe("calendar");
      expect(state.eventStatus).toBe(base.eventStatus);
    }
  });

  it("requires explicit mentor consent expiry and never exports rank or grade predictions", () => {
    let state = skipWarmup(
      startWarmup(openBriefing(createWorldExamState())),
    );
    state = startKeyMatch(state);
    state = submitMatchAnswer(state, "match-cutoff", "increase");
    state = submitMatchAnswer(state, "match-ai-trace", "challenge");
    state = challengeAiClaim(state, "claim-simulator-wrong");
    state = finishKeyMatch(state);
    state = openReflection(state);

    expect(() =>
      saveReflection(state, {
        worked: "完成了来源核对。",
        blocked: "第一题概念混淆。",
        nextAdjustment: "重看 Bode 拐点。",
        shareWithMentor: true,
        shareExpiresAt: null,
      }),
    ).toThrow("requires an expiry date");

    state = saveReflection(state, {
      worked: "完成了来源核对。",
      blocked: "第一题概念混淆。",
      nextAdjustment: "重看 Bode 拐点。",
      shareWithMentor: false,
      shareExpiresAt: null,
    });
    const payload = exportReflectionPayload(state);
    expect(payload.data_mode).toBe("fixture");
    expect(JSON.stringify(payload)).not.toMatch(
      /rank|ranking|predicted_grade|pass_probability/i,
    );
  });
});

describe("World Exam Finals local cache guard", () => {
  it("accepts the declared state and rejects incomplete or foreign cache values", () => {
    expect(isWorldExamState(createWorldExamState())).toBe(true);
    expect(
      isWorldExamState({
        schemaVersion: "1.0.0",
        dataMode: "fixture",
        step: "calendar",
        timeline: [],
        answers: [],
      }),
    ).toBe(false);
    expect(
      isWorldExamState({
        ...createWorldExamState(),
        narrativeMode: "ranked-public",
      }),
    ).toBe(false);
  });
});

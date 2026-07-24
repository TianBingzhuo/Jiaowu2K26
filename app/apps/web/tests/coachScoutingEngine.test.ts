import { describe, expect, it } from "vitest";
import {
  acknowledgeExpectation,
  buildAdvisorHandoff,
  coachBoxScore,
  compareCourseVersions,
  createCoachScoutingState,
  publishableFeedback,
  reportGovernanceIssue,
  reviewTeacherCorrection,
  runCoachFairnessAudit,
  runTeamMatching,
  setCoachOffline,
  submitStructuredFeedback,
  submitTeacherCorrection,
  toggleTeamProfileField,
} from "../src/features/coachscouting/engine";

describe("F-007 Coach & Scouting engine", () => {
  it("separates course, instructor and assignment while sourcing profile fields", () => {
    const state = createCoachScoutingState();
    expect(state.fixture.course.courseId).toBe("SLS201");
    expect(state.fixture.course.instructorId).not.toBe(
      state.fixture.course.instructorAssignmentId,
    );
    expect(state.fixture.course.objectives.every((item) => item.sourceId)).toBe(
      true,
    );
  });

  it("exposes all five evidence tiers without mixing their authority", () => {
    const state = createCoachScoutingState();
    expect(new Set(state.fixture.sources.map((item) => item.tier)).size).toBe(5);
  });

  it("keeps expired Office Hours visible but explicitly expired", () => {
    const state = createCoachScoutingState();
    expect(
      state.fixture.officeHours.some((item) => item.status === "expired"),
    ).toBe(true);
  });

  it("publishes workload and feedback only above the declared sample threshold", () => {
    const state = createCoachScoutingState();
    expect(
      state.fixture.workload.find((item) => item.id === "workload-insufficient")
        ?.publishable,
    ).toBe(false);
    expect(publishableFeedback(state).map((item) => item.published)).toEqual([
      true,
      false,
    ]);
  });

  it("uses the four Scouting quadrants and no teacher rating", () => {
    const state = createCoachScoutingState();
    expect(state.fixture.scouting.preparedFor.length).toBeGreaterThan(0);
    expect(state.fixture.scouting.challenges.length).toBeGreaterThan(0);
    expect(state.fixture.scouting.actions.length).toBeGreaterThan(0);
    expect(state.fixture.scouting.unknowns.length).toBeGreaterThan(0);
    expect(state.fixture.invariants.noTeacherRating).toBe(true);
  });

  it("compares versions without carrying feedback to a new instructor assignment", () => {
    const compared = compareCourseVersions(
      createCoachScoutingState(),
      "version-2025sp",
      "version-2026sp",
    );
    expect(compared.versionComparison?.sameInstructorAssignment).toBe(false);
    expect(compared.versionComparison?.feedbackCarriedForward).toBe(false);
    expect(compared.versionComparison?.changes.length).toBe(3);
  });

  it("preserves a transparent teacher correction history", () => {
    let state = submitTeacherCorrection(createCoachScoutingState(), {
      targetId: "course-profile-sls201-2026sp",
      type: "context",
      statement: "补充说明：反馈方式随任务类型变化，不承诺统一返回日。",
      evidenceIds: ["src-teacher-confirmed"],
    });
    state = reviewTeacherCorrection(
      state,
      state.correctionCases[0].id,
      "in_review",
    );
    state = reviewTeacherCorrection(
      state,
      state.correctionCases[0].id,
      "accepted",
    );
    expect(state.correctionCases[0].history.map((item) => item.status)).toEqual([
      "submitted",
      "in_review",
      "accepted",
    ]);
  });

  it("accepts actionable feedback and holds defamatory language before aggregation", () => {
    const safe = submitStructuredFeedback(createCoachScoutingState(), {
      dimension: "feedback_timeliness",
      concreteExperience: "实验报告的返回时间在两次任务之间差异较大。",
      suggestedAction: "在任务发布时同时说明预计反馈窗口。",
      consentToAggregate: true,
    });
    const held = submitStructuredFeedback(safe, {
      dimension: "group_structure",
      concreteExperience: "这位老师人品最差，和课程结构无关。",
      suggestedAction: "直接给老师打最低人格分。",
      consentToAggregate: true,
    });
    expect(held.feedbackSubmissions.map((item) => item.safetyStatus)).toEqual([
      "eligible",
      "held_for_review",
    ]);
  });

  it("runs five fairness checks and keeps deterministic matching", () => {
    let state = runTeamMatching(createCoachScoutingState());
    state = runCoachFairnessAudit(state);
    expect(state.fairnessAudit.status).toBe("pass");
    expect(state.fairnessAudit.checks).toHaveLength(5);
    expect(state.teamMatches).toHaveLength(2);
  });

  it("rejects sensitive team fields and explains capacity conflicts", () => {
    const state = createCoachScoutingState();
    expect(() =>
      toggleTeamProfileField(state, "team-sensitive-gender"),
    ).toThrow(/敏感字段/);
    const matched = runTeamMatching(state);
    expect(
      matched.teamMatches.find(
        (item) => item.teamNeedId === "need-filter-model",
      )?.conflicts,
    ).toHaveLength(1);
    expect(
      matched.teamMatches.every((item) => !item.usedSensitiveAttributes),
    ).toBe(true);
  });

  it("builds a consented Advisor Handoff without fabricating a reply", () => {
    const state = buildAdvisorHandoff(createCoachScoutingState(), {
      questions: ["当前先修缺口是否需要在正式选课前补齐？"],
      evidenceIds: ["src-official-syllabus"],
      scenarioIds: ["F-004:plan-balanced"],
      consentConfirmed: true,
    });
    expect(state.advisorHandoff?.status).toBe("ready_for_student");
    expect(state.advisorHandoff?.advisorResponse).toBeNull();
  });

  it("acknowledges expectations without claiming institutional approval", () => {
    const state = acknowledgeExpectation(
      createCoachScoutingState(),
      "reminder-safety",
    );
    expect(state.acknowledgedReminderIds).toContain("reminder-safety");
    expect(state.audit.at(-1)?.detail).toMatch(/without granting/);
  });

  it("hides severe governance targets before time-bound review", () => {
    const state = reportGovernanceIssue(createCoachScoutingState(), {
      reportType: "privacy",
      targetId: "aggregate-clarity",
      evidence: "聚合文本意外包含可识别的个人实验描述。",
      serious: true,
    });
    expect(state.hiddenTargetIds).toContain("aggregate-clarity");
    expect(state.governanceCases[0].temporaryMeasure).toBe(
      "hidden_pending_review",
    );
    expect(publishableFeedback(state)[0].published).toBe(false);
  });

  it("blocks mutation offline and reports an explicitly non-authoritative Box Score", () => {
    const offline = setCoachOffline(createCoachScoutingState(), true);
    expect(() =>
      acknowledgeExpectation(offline, "reminder-equipment"),
    ).toThrow(/离线/);
    expect(coachBoxScore(offline)).toMatchObject({
      sourceTiers: 5,
      sensitiveTeamFieldsUsed: 0,
      fabricatedAdvisorReplies: 0,
      nonAuthoritative: true,
    });
  });
});

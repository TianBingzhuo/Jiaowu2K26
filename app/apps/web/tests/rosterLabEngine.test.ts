import { describe, expect, it } from "vitest";
import {
  buildSemesterLock,
  buildTransaction,
  createRosterLabState,
  explainUnsatisfiablePin,
  moveGoal,
  openUnsatDrill,
  replaySemesterLock,
  runWhatIf,
  saveLockToState,
  selectPlan,
  setPreference,
  solveRoster,
  solveRosterState,
  togglePin,
  validateRosterFixture,
  validateSelections,
} from "../src/features/rosterlab/engine";
import { ROSTER_FIXTURE } from "../src/features/rosterlab/fixture";
import { isSemesterLock } from "../src/features/rosterlab/storage";

describe("F-004 Roster Lab deterministic resolver", () => {
  it("keeps the fixture between 8 and 20 courses with valid references", () => {
    expect(ROSTER_FIXTURE.catalog).toHaveLength(12);
    expect(validateRosterFixture()).toEqual([]);
    expect(ROSTER_FIXTURE.sourceBoundary).toContain("不连接学校选课系统");
  });

  it("generates three distinct feasible plans with explicit tradeoffs", () => {
    const plans = solveRoster({
      pinIds: ["pin-sls-section", "pin-friday-commitment"],
      goalOrder: ROSTER_FIXTURE.goalOrder,
      preferences: ROSTER_FIXTURE.preferences,
    });
    expect(plans).toHaveLength(3);
    expect(new Set(plans.map((plan) => plan.id)).size).toBe(3);
    for (const plan of plans) {
      expect(plan.hardConstraintsMet).toBe(true);
      expect(plan.tradeoffs.length).toBeGreaterThan(0);
      expect(plan.solverBackend).toBe("deterministic_heuristic_fixture");
      expect(plan.courses.some((course) => course.courseId === "SLS201")).toBe(
        true,
      );
    }
  });

  it("never moves an active course pin", () => {
    const state = togglePin(createRosterLabState(), "pin-circuits-section");
    const solved = solveRosterState(state);
    expect(solved.plans.length).toBeGreaterThanOrEqual(2);
    for (const plan of solved.plans) {
      expect(
        plan.courses.find((course) => course.courseId === "CIR220")
          ?.offeringId,
      ).toBe("cir220-a");
    }
  });

  it("reports a minimal conflict chain instead of a bare no-solution result", () => {
    const explanation = explainUnsatisfiablePin();
    expect(explanation.minimalConflictSet).toHaveLength(1);
    expect(explanation.blockingChain.length).toBeGreaterThanOrEqual(3);
    expect(explanation.relaxableItems[0].alternativeCourseIds).toContain(
      "CIR220",
    );
    const state = openUnsatDrill(createRosterLabState());
    expect(state.step).toBe("unsat");
    expect(state.unsat?.requestId).toBe(explanation.requestId);
  });

  it("applies goal and preference changes before ranking", () => {
    const baseline = solveRosterState(createRosterLabState());
    let changed = setPreference(
      createRosterLabState(),
      "timeOfDay",
      "late",
    );
    changed = moveGoal(changed, "personal_preference", -1);
    changed = moveGoal(changed, "personal_preference", -1);
    const reranked = solveRosterState(changed);
    expect(reranked.goalOrder.indexOf("personal_preference")).toBeLessThan(
      baseline.goalOrder.indexOf("personal_preference"),
    );
    expect(reranked.plans[0].inputFingerprint).not.toBe(
      baseline.plans[0].inputFingerprint,
    );
  });

  it("creates a named What-if branch without formal enrollment", () => {
    const base = solveRosterState(createRosterLabState());
    const simulation = runWhatIf(base, {
      branchName: "设计方向试投",
      addCourseIds: ["HCI205"],
      removeCourseIds: ["ENG210"],
      blockedTimeSlots: [
        { weekday: "Fri", start: "08:00", end: "10:00", room: "个人时间块" },
      ],
      changeMajor: "交互设计方向（模拟）",
    });
    expect(simulation.step).toBe("whatif");
    expect(simulation.simulation?.plans.length).toBeGreaterThanOrEqual(2);
    expect(
      simulation.simulation?.plans.every((plan) => plan.isSimulation),
    ).toBe(true);
  });

  it("produces add/drop/swap and formal next-step explanations", () => {
    const solved = solveRosterState(createRosterLabState());
    const nonBaseline =
      solved.plans.find((plan) => buildTransaction(plan).actions.length >= 3) ??
      solved.plans[0];
    const transaction = buildTransaction(nonBaseline);
    expect(transaction.isFormalSubmission).toBe(false);
    expect(transaction.actions.length).toBeGreaterThan(0);
    expect(
      transaction.actions.every((action) => action.formalStep.length > 10),
    ).toBe(true);
  });

  it("saves and deterministically replays a non-authoritative semester lock", () => {
    let state = solveRosterState(createRosterLabState());
    state = selectPlan(state, state.plans[0].id);
    const lock = buildSemesterLock(state);
    expect(isSemesterLock(lock)).toBe(true);
    expect(lock.isFormalEnrollment).toBe(false);
    const replay = replaySemesterLock(lock);
    expect(replay.matched).toBe(true);
    const saved = saveLockToState(state);
    expect(saved.savedLock?.id).toBe(lock.id);
    expect(saved.timeline.at(-1)?.eventType).toBe("lock_saved");
  });

  it("catches direct time conflicts and credit violations", () => {
    const violations = validateSelections(
      [
        { courseId: "SLS201", offeringId: "sls201-a" },
        { courseId: "CIR220", offeringId: "cir220-b" },
      ],
      ["pin-sls-section"],
    );
    expect(violations.some((violation) => violation.type === "time_conflict")).toBe(
      true,
    );
    expect(violations.some((violation) => violation.type === "credit_limit")).toBe(
      true,
    );
  });
});

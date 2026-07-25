import { describe, expect, it } from "vitest";
import { DEMO_SEASON, HERO_COURSE } from "../src/data/demoSeason";
import {
  canOpenReplay,
  canStartLearning,
  getLearningSummary,
  getSeasonProgressPct,
  getUpcomingDeadlines,
  validateDemoSeason,
} from "../src/features/mycareer/engine";
import { SLS_240_COURSE_PACK } from "../src/features/mycareer/coursePack";

describe("University2K26 demo season", () => {
  it("exposes a complete public-safe SLS 240 course blueprint", () => {
    const pack = SLS_240_COURSE_PACK;
    const nodes = pack.units.flatMap((unit) => unit.knowledge_nodes);
    expect(pack.source_coverage.original_files).toBe(6);
    expect(pack.source_coverage.visually_reviewed_pages).toBe(65);
    expect(pack.units).toHaveLength(5);
    expect(nodes).toHaveLength(38);
    expect(new Set(nodes.map((node) => node.id)).size).toBe(38);
    expect(pack.labs).toHaveLength(5);
    expect(pack.assessments).toHaveLength(5);
    expect(pack.invariants).toEqual({
      original_courseware_copied: false,
      private_identity_included: false,
      manual_answer_save_required: false,
      formal_grade_impact: false,
      teacher_review_required: true,
    });
  });

  it("keeps exactly one hero inside the sanitized roster", () => {
    expect(DEMO_SEASON.courses).toHaveLength(6);
    expect(HERO_COURSE.id).toBe(DEMO_SEASON.heroCourseId);
  });

  it("marks every course with a traceable summary reference", () => {
    for (const course of DEMO_SEASON.courses) {
      expect(course.sourceRef).toMatch(/^course-index:/);
      expect(course.topics.length).toBeGreaterThanOrEqual(4);
      expect(course.evidenceSummary.length).toBeGreaterThan(20);
      expect(course.demoQuestion).toMatch(/[？?]$/);
      expect(course.analysisSteps).toHaveLength(3);
      expect(course.nextMove.length).toBeGreaterThan(12);
      expect(course.credits).toBeGreaterThan(0);
      expect(course.schedule.length).toBeGreaterThan(8);
      expect(course.progressPct).toBeGreaterThanOrEqual(0);
      expect(course.progressPct).toBeLessThanOrEqual(100);
      expect(course.nextAction.length).toBeGreaterThan(8);
    }
  });

  it("labels all progress as non-authoritative fixture data", () => {
    expect(DEMO_SEASON.authority).toBe("fixture");
    expect(DEMO_SEASON.sourceBoundary).toContain("演示数据");
    expect(validateDemoSeason(DEMO_SEASON)).toEqual([]);
  });

  it("exposes an eight-season path and only the next seven days of deadlines", () => {
    expect(getSeasonProgressPct(DEMO_SEASON)).toBe(50);
    expect(
      getUpcomingDeadlines(DEMO_SEASON, DEMO_SEASON.updatedAt).map(
        (deadline) => deadline.id,
      ),
    ).toEqual([
      "deadline-math-ode-diagnostic",
      "deadline-ece-safety-check",
      "deadline-eng-claim-draft",
    ]);
  });

  it("keeps the F-001 jump available only for published content", () => {
    expect(canStartLearning(HERO_COURSE)).toBe(true);
    expect(canOpenReplay(HERO_COURSE)).toBe(true);
    expect(getLearningSummary(HERO_COURSE)).toMatchObject({
      state: "ready",
      completionPct: 100,
      accuracyPct: 100,
      durationLabel: "0:18",
    });

    const emptyCourse = DEMO_SEASON.courses.find(
      (course) => course.id === "optics",
    );
    expect(emptyCourse).toBeDefined();
    expect(canStartLearning(emptyCourse!)).toBe(false);
    expect(canOpenReplay(emptyCourse!)).toBe(false);
    expect(getLearningSummary(emptyCourse!)).toEqual({
      state: "not_started",
      label: "尚未开始学习",
    });
  });
});

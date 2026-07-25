import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const surfaceFiles = [
  "../src/App.tsx",
  "../src/lib/api.ts",
  "../src/lib/smartCourseApi.ts",
  "../src/features/ai/SourceBoundCoach.tsx",
  "../src/features/academicmirror/AcademicMirrorStudio.tsx",
  "../src/features/campuslife/CampusLifeStudio.tsx",
  "../src/features/campuspass/CampusPassStudio.tsx",
  "../src/features/coachscouting/CoachScoutingStudio.tsx",
  "../src/features/institutional/InstitutionalStudio.tsx",
  "../src/features/mycareer/DevelopmentPathCard.tsx",
  "../src/features/opportunitymarket/OpportunityMarketStudio.tsx",
  "../src/features/performancecenter/PerformanceCenterStudio.tsx",
  "../src/features/roles/RoleCommandCenter.tsx",
  "../src/features/rosterlab/RosterLabStudio.tsx",
  "../src/features/smartcourse/SmartCourseStudio.tsx",
  "../src/features/worldexam/WorldExamStudio.tsx",
] as const;

const demoContentFiles = [
  "../../../fixtures/v1/academic-mirror.demo.json",
  "../../../fixtures/v1/campus-life.demo.json",
  "../../../fixtures/v1/campus-pass.demo.json",
  "../../../fixtures/v1/career-season.demo.json",
  "../../../fixtures/v1/coach-scouting.demo.json",
  "../../../fixtures/v1/opportunity-market.demo.json",
  "../../../fixtures/v1/performance-center.demo.json",
  "../../../fixtures/v1/roster-lab.demo.json",
  "../../../fixtures/v1/sls-240-course-pack.demo.json",
  "../../../fixtures/v1/world-exam.demo.json",
] as const;

const machineVoicePatterns = [
  "API 健康响应不符合合同",
  "已安全降级",
  "DEMO FIXTURE",
  "SANITIZED FIXTURE",
  "RULES FALLBACK",
  "DETERMINISTIC FALLBACK",
  "规则回退待命",
  "现场验证降级状态",
  "· Fixture",
  "（Fixture）",
] as const;

const readSurface = (relativePath: string) =>
  readFileSync(new URL(relativePath, import.meta.url), "utf8");

describe("University2K26 user-facing voice", () => {
  it.each(surfaceFiles)(
    "%s does not leak internal machine-language labels into the main UI",
    (relativePath) => {
      const source = readSurface(relativePath);
      for (const pattern of machineVoicePatterns) {
        expect(source, `${relativePath} contains “${pattern}”`).not.toContain(
          pattern,
        );
      }
    },
  );

  it.each(demoContentFiles)(
    "%s does not expose the internal Fixture label as reader-facing copy",
    (relativePath) => {
      expect(readSurface(relativePath)).not.toContain("Fixture");
    },
  );

  it("keeps fallback copy concrete and recoverable", () => {
    const api = readSurface("../src/lib/api.ts");
    expect(api).toContain("后台没接上，先用只读存档继续");
    expect(api).toContain("你的操作不会写回学校系统");
  });

  it("keeps AI uncertainty visible without sounding like a debug console", () => {
    const coach = readSurface("../src/features/ai/SourceBoundCoach.tsx");
    expect(coach).toContain("这里不会拿模板冒充模型回答");
    expect(coach).toContain("先看依据，再决定要不要采用");
    expect(coach).toContain("还需要你确认");
  });
});

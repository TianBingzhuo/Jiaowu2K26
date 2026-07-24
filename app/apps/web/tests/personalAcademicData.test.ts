import { describe, expect, it } from "vitest";
import {
  ACADEMIC_DEMO_PROFILE,
  ACADEMIC_EVIDENCE_MOMENTS,
  ACADEMIC_TERM_SNAPSHOTS,
} from "../src/data/academicDemoProfile";
import {
  UARIZONA_2026_CATALOG_SOURCE,
  UARIZONA_2026_COURSES,
} from "../src/data/uarizona2026Catalog";

describe("deidentified Academic Mirror demo data", () => {
  it("keeps transcript totals internally consistent across institutions", () => {
    const hebutCredits = ACADEMIC_TERM_SNAPSHOTS.filter(
      (term) => term.institution === "HEBUT",
    ).reduce((total, term) => total + term.earnedCredits, 0);
    const uArizonaCredits = ACADEMIC_TERM_SNAPSHOTS.filter(
      (term) => term.institution === "UArizona",
    ).reduce((total, term) => total + term.earnedCredits, 0);

    expect(hebutCredits).toBe(ACADEMIC_DEMO_PROFILE.totals.hebutCredits);
    expect(uArizonaCredits).toBe(
      ACADEMIC_DEMO_PROFILE.totals.uArizonaCredits,
    );
    expect(ACADEMIC_EVIDENCE_MOMENTS).toHaveLength(
      ACADEMIC_DEMO_PROFILE.totals.verifiedExperiences,
    );
  });

  it("uses only the NAN alias and keeps direct-identifier fields out", () => {
    expect(ACADEMIC_DEMO_PROFILE.alias).toBe("NAN");
    expect(ACADEMIC_DEMO_PROFILE.displayName).toBe("南同学");
    expect(ACADEMIC_DEMO_PROFILE).not.toHaveProperty("studentId");
    expect(ACADEMIC_DEMO_PROFILE).not.toHaveProperty("legalName");
    expect(ACADEMIC_DEMO_PROFILE).not.toHaveProperty("email");
    expect(ACADEMIC_DEMO_PROFILE).not.toHaveProperty("phone");
  });

  it("keeps the public catalog separate from completed-course history", () => {
    const completedCourseIds = new Set(
      ACADEMIC_TERM_SNAPSHOTS.flatMap((term) =>
        term.courses.map((course) => course.id),
      ),
    );

    expect(UARIZONA_2026_COURSES).toHaveLength(6);
    expect(
      UARIZONA_2026_COURSES.every(
        (course) => !completedCourseIds.has(course.id),
      ),
    ).toBe(true);
    expect(UARIZONA_2026_CATALOG_SOURCE.boundary).toMatch(
      /课程目录不是南同学的修课记录/,
    );
  });

  it("keeps every scoutable catalog course sourced and sectioned", () => {
    expect(UARIZONA_2026_CATALOG_SOURCE.workbookRows).toBe(57_857);
    expect(UARIZONA_2026_CATALOG_SOURCE.uniqueCourses).toBe(11_347);
    for (const course of UARIZONA_2026_COURSES) {
      expect(course.detailUrl).toMatch(
        /^https:\/\/uacourses-api\.uaccess\.arizona\.edu\//,
      );
      expect(course.sections.length).toBeGreaterThan(0);
      expect(course.sections.every((section) => section.capacity >= 0)).toBe(
        true,
      );
      expect(course.unknowns.length).toBeGreaterThan(0);
    }
  });
});

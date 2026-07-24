import { describe, expect, it } from "vitest";
import {
  SUBJECT_CATALOG,
  SUBJECT_CATALOG_SUMMARY,
  SUBJECT_CATEGORIES,
} from "../src/data/subjectCatalog";

describe("University2K26 subject discovery catalog", () => {
  it("matches the read-only 学科 shortcut inventory", () => {
    expect(SUBJECT_CATALOG_SUMMARY).toEqual({
      shortcutEntries: 43,
      uniqueSources: 40,
      rootReadmes: 10,
    });
  });

  it("keeps every discovery category populated", () => {
    for (const category of SUBJECT_CATEGORIES) {
      expect(
        SUBJECT_CATALOG.some((course) => course.category === category),
      ).toBe(true);
    }
  });

  it("stores provenance references without exposing local target paths", () => {
    const serialized = JSON.stringify(SUBJECT_CATALOG);

    expect(serialized).not.toMatch(/[A-Z]:[\\/]/i);
    for (const course of SUBJECT_CATALOG) {
      expect(course.sourceRef).toMatch(/^subject-shortcut:/);
    }
  });
});

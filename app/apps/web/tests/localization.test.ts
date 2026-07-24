import { describe, expect, it } from "vitest";
import {
  APP_LOCALES,
  EXPERIENCE_BRIEFS,
  EXPERIENCE_KEYS,
  HUD_COPY,
  ROLE_BRIEFS,
  pseudoLocalize,
} from "../src/i18n/catalog";
import { ROLE_IDS } from "../src/features/roles/types";
import { formatIcuMessage } from "../src/i18n/messageFormat";

describe("University2K26 bilingual event mode", () => {
  it("covers every current experience in both supported locales", () => {
    expect(Object.keys(EXPERIENCE_BRIEFS).sort()).toEqual(
      [...EXPERIENCE_KEYS].sort(),
    );

    for (const experience of EXPERIENCE_KEYS) {
      const brief = EXPERIENCE_BRIEFS[experience];
      expect(brief.code).toMatch(/^F-\d{3}$/);
      expect(brief.title.length).toBeGreaterThan(2);

      for (const locale of APP_LOCALES) {
        expect(brief.formalName[locale].trim()).not.toBe("");
        expect(brief.tagline[locale].trim()).not.toBe("");
        expect(brief.plainMeaning[locale].trim()).not.toBe("");
        expect(brief.joke[locale].trim()).not.toBe("");
        expect(brief.nextMove[locale].trim()).not.toBe("");
        expect(brief.boundary[locale].trim()).not.toBe("");
      }
    }
  });

  it("gives every demo role a plain-language explanation", () => {
    expect(Object.keys(ROLE_BRIEFS).sort()).toEqual([...ROLE_IDS].sort());
    for (const role of ROLE_IDS) {
      for (const locale of APP_LOCALES) {
        expect(ROLE_BRIEFS[role].title[locale].trim()).not.toBe("");
        expect(ROLE_BRIEFS[role].summary[locale].trim()).not.toBe("");
      }
    }
  });

  it("keeps HUD controls and the event glossary bilingual", () => {
    for (const locale of APP_LOCALES) {
      const copy = HUD_COPY[locale];
      expect(copy.guideButton.trim()).not.toBe("");
      expect(copy.coverageBody.trim()).not.toBe("");
      expect(copy.glossary).toHaveLength(4);
      expect(new Set(copy.glossary.map(([term]) => term)).size).toBe(4);
    }
  });

  it("provides an expansion stress helper for future inflected locales", () => {
    const source = "Build your degree one season at a time.";
    const pseudo = pseudoLocalize(source);
    expect(pseudo.startsWith("⟦")).toBe(true);
    expect(pseudo.endsWith("⟧")).toBe(true);
    expect(pseudo.length).toBeGreaterThan(source.length * 1.25);
  });

  it("selects Russian plural forms without adding a Russian UI locale", () => {
    const pattern =
      "{count, plural, one {# курс} few {# курса} many {# курсов} other {# курса}}";

    expect(formatIcuMessage(pattern, "ru-RU", { count: 1 })).toBe("1 курс");
    expect(formatIcuMessage(pattern, "ru-RU", { count: 2 })).toBe("2 курса");
    expect(formatIcuMessage(pattern, "ru-RU", { count: 5 })).toBe("5 курсов");
    expect(formatIcuMessage(pattern, "ru-RU", { count: 21 })).toBe("21 курс");
  });
});

import { describe, expect, it } from "vitest";
import { ROLE_FIXTURE } from "../src/features/roles/fixture";
import {
  ACTIVE_ROLE_STORAGE_KEY,
  getRoleProfile,
  isRoleId,
  persistRole,
  readStoredRole,
  validateRoleFixture,
} from "../src/features/roles/engine";
import { ROLE_IDS } from "../src/features/roles/types";

describe("University2K26 role lenses", () => {
  it("exposes the five approved roles with one shared contract", () => {
    expect(ROLE_FIXTURE.profiles.map((profile) => profile.id)).toEqual(
      ROLE_IDS,
    );
    expect(ROLE_FIXTURE.workflow).toEqual([
      "Briefing",
      "Choose",
      "Execute",
      "Replay",
      "Next Move",
    ]);
    expect(validateRoleFixture()).toEqual([]);
  });

  it("keeps every institutional role focused and bounded", () => {
    for (const roleId of ROLE_IDS.filter((id) => id !== "student")) {
      const profile = getRoleProfile(roleId);
      expect(profile.priorities).toHaveLength(3);
      expect(profile.metrics).toHaveLength(4);
      expect(profile.navigation.length).toBeGreaterThanOrEqual(5);
      expect(profile.authority).toBe("demo_fixture");
      expect(profile.requiresProductionSso).toBe(true);
      expect(profile.visibleScope.length).toBeGreaterThan(0);
      expect(profile.prohibitedScope.length).toBeGreaterThan(0);
    }
  });

  it("does not present Demo login as production identity or authorization", () => {
    expect(ROLE_FIXTURE.productionAuthentication).toBe(
      "external_sso_required",
    );
    expect(ROLE_FIXTURE.productionAuthorization).toBe(
      "server_enforced_required",
    );
    expect(getRoleProfile("teacher").metrics).toContainEqual(
      expect.objectContaining({
        label: "公开教师排名",
        value: "0",
      }),
    );
    expect(getRoleProfile("undergraduate_office").metrics).toContainEqual(
      expect.objectContaining({
        label: "AI 正式决定",
        value: "0",
      }),
    );
  });

  it("falls back safely when a stored role is missing or invalid", () => {
    const emptyStorage = {
      getItem: () => null,
    };
    const invalidStorage = {
      getItem: () => "super_admin",
    };

    expect(readStoredRole(emptyStorage)).toBe("student");
    expect(readStoredRole(invalidStorage)).toBe("student");
    expect(readStoredRole(null)).toBe("student");
    expect(isRoleId("advisor")).toBe(true);
    expect(isRoleId("super_admin")).toBe(false);
  });

  it("persists only the approved role id", () => {
    const values = new Map<string, string>();
    const storage = {
      setItem: (key: string, value: string) => {
        values.set(key, value);
      },
    };

    persistRole("program_lead", storage);

    expect(values.get(ACTIVE_ROLE_STORAGE_KEY)).toBe("program_lead");
  });
});

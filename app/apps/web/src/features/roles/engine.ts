import { ROLE_FIXTURE } from "./fixture";
import { ROLE_IDS } from "./types";
import type { RoleFixture, RoleId, RoleProfile } from "./types";

export const ACTIVE_ROLE_STORAGE_KEY = "university2k26.activeRole";

export const isRoleId = (value: unknown): value is RoleId =>
  typeof value === "string" && ROLE_IDS.includes(value as RoleId);

export const getRoleProfile = (
  roleId: RoleId,
  fixture: RoleFixture = ROLE_FIXTURE,
): RoleProfile => {
  const profile = fixture.profiles.find((candidate) => candidate.id === roleId);
  if (!profile) {
    throw new Error(`University2K26 role profile is missing: ${roleId}`);
  }
  return profile;
};

export const readStoredRole = (
  storage: Pick<Storage, "getItem"> | null = null,
): RoleId => {
  if (!storage) return "student";
  const stored = storage.getItem(ACTIVE_ROLE_STORAGE_KEY);
  return isRoleId(stored) ? stored : "student";
};

export const persistRole = (
  roleId: RoleId,
  storage: Pick<Storage, "setItem"> | null = null,
) => {
  storage?.setItem(ACTIVE_ROLE_STORAGE_KEY, roleId);
};

export const validateRoleFixture = (
  fixture: RoleFixture = ROLE_FIXTURE,
): string[] => {
  const issues: string[] = [];
  const roleIds = new Set<RoleId>();

  if (fixture.authority !== "demo_fixture") {
    issues.push("Role fixture must remain explicitly non-authoritative.");
  }
  if (
    fixture.productionAuthentication !== "external_sso_required" ||
    fixture.productionAuthorization !== "server_enforced_required"
  ) {
    issues.push("Production identity and authorization boundaries are missing.");
  }
  if (fixture.profiles.length !== ROLE_IDS.length) {
    issues.push("Role fixture must expose exactly the five approved role lenses.");
  }

  for (const profile of fixture.profiles) {
    if (roleIds.has(profile.id)) {
      issues.push(`Duplicate role id: ${profile.id}`);
    }
    roleIds.add(profile.id);

    if (
      profile.authority !== "demo_fixture" ||
      profile.requiresProductionSso !== true
    ) {
      issues.push(`${profile.id} is missing the Demo/SSO boundary.`);
    }
    if (profile.navigation.length < 5) {
      issues.push(`${profile.id} needs a complete role navigation lens.`);
    }
    if (profile.visibleScope.length === 0 || profile.prohibitedScope.length === 0) {
      issues.push(`${profile.id} must explain visible and prohibited scope.`);
    }
    if (profile.id !== "student") {
      if (profile.priorities.length !== 3) {
        issues.push(`${profile.id} must expose exactly three focused priorities.`);
      }
      if (profile.metrics.length !== 4) {
        issues.push(`${profile.id} must expose four bounded fixture metrics.`);
      }
    }
  }

  for (const roleId of ROLE_IDS) {
    if (!roleIds.has(roleId)) {
      issues.push(`Missing role id: ${roleId}`);
    }
  }

  return issues;
};

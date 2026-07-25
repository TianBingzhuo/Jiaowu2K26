import type { SemesterLock } from "./types";

const STORAGE_KEY = "university2k26.roster.semester-lock.v1";

export function isSemesterLock(value: unknown): value is SemesterLock {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<SemesterLock>;
  return (
    candidate.schemaVersion === "1.0.0" &&
    candidate.dataMode === "fixture" &&
    candidate.studentId === "student-nan-fixture" &&
    typeof candidate.id === "string" &&
    typeof candidate.catalogVersion === "string" &&
    typeof candidate.prefixVersion === "number" &&
    Array.isArray(candidate.pinIds) &&
    Array.isArray(candidate.goalOrder) &&
    typeof candidate.selectedPlanId === "string" &&
    typeof candidate.inputFingerprint === "string" &&
    candidate.isFormalEnrollment === false
  );
}

export function saveSemesterLock(lock: SemesterLock) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(lock));
}

export function loadSemesterLock(): SemesterLock | null {
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    const parsed: unknown = JSON.parse(raw);
    return isSemesterLock(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export function clearSemesterLock() {
  window.localStorage.removeItem(STORAGE_KEY);
}

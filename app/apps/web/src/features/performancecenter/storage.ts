import type { PerformanceState } from "./types";

const STORAGE_KEY = "university2k26.performance-center.fixture.v1";

export function loadPerformanceState(): PerformanceState | null {
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  const parsed = JSON.parse(raw) as Partial<PerformanceState>;
  if (
    parsed.schemaVersion !== "1.0.0" ||
    parsed.dataMode !== "fixture" ||
    parsed.studentId !== "student-nan-fixture"
  ) {
    return null;
  }
  return parsed as PerformanceState;
}

export function savePerformanceState(state: PerformanceState) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function clearPerformanceState() {
  window.localStorage.removeItem(STORAGE_KEY);
}

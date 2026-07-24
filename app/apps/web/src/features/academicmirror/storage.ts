import type { MirrorState } from "./types";

const STORAGE_KEY = "university2k26.academic-mirror.fixture.v2";

export function isStoredMirrorState(value: unknown): value is MirrorState {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<MirrorState>;
  return (
    candidate.schemaVersion?.startsWith("1.") === true &&
    candidate.dataMode === "fixture" &&
    candidate.readOnly === true &&
    Array.isArray(candidate.sources) &&
    Array.isArray(candidate.snapshots) &&
    Array.isArray(candidate.records) &&
    Array.isArray(candidate.conflicts) &&
    Array.isArray(candidate.consents) &&
    Array.isArray(candidate.audit)
  );
}

export function loadMirrorState(): MirrorState | null {
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  const parsed: unknown = JSON.parse(raw);
  return isStoredMirrorState(parsed) ? parsed : null;
}

export function saveMirrorState(state: MirrorState): void {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function clearMirrorState(): void {
  window.localStorage.removeItem(STORAGE_KEY);
}

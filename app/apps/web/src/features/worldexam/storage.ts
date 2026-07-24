import type { WorldExamState } from "./types";

const DATABASE_NAME = "university2k26-world-exam";
const DATABASE_VERSION = 1;
const STORE_NAME = "exam-sessions";
const SESSION_KEY = "exam-sls-finals-fixture";
const EXAM_STEPS = new Set([
  "calendar",
  "briefing",
  "warmup",
  "playbook",
  "match",
  "replay",
  "reflection",
]);
const NARRATIVE_MODES = new Set(["immersive", "light", "traditional"]);
const EXAM_STATUSES = new Set([
  "scheduled",
  "briefing_open",
  "warmup",
  "exam_active",
  "review",
  "archived",
]);
const SYNC_STATUSES = new Set([
  "synced",
  "offline_cached",
  "memory_fallback",
]);

export function isWorldExamState(value: unknown): value is WorldExamState {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<WorldExamState>;
  return (
    candidate.schemaVersion === "1.0.0" &&
    candidate.dataMode === "fixture" &&
    typeof candidate.step === "string" &&
    EXAM_STEPS.has(candidate.step) &&
    typeof candidate.narrativeMode === "string" &&
    NARRATIVE_MODES.has(candidate.narrativeMode) &&
    typeof candidate.eventStatus === "string" &&
    EXAM_STATUSES.has(candidate.eventStatus) &&
    (candidate.warmupAnswer === null ||
      typeof candidate.warmupAnswer === "string") &&
    typeof candidate.warmupAttempts === "number" &&
    Array.isArray(candidate.completedPlaybookItemIds) &&
    Array.isArray(candidate.playbookOrder) &&
    Array.isArray(candidate.timeline) &&
    Array.isArray(candidate.answers) &&
    Array.isArray(candidate.checkedSourceQuestionIds) &&
    Array.isArray(candidate.challengedClaimIds) &&
    Boolean(candidate.reflection) &&
    typeof candidate.reflection?.worked === "string" &&
    typeof candidate.reflection?.blocked === "string" &&
    typeof candidate.reflection?.nextAdjustment === "string" &&
    typeof candidate.reflection?.shareWithMentor === "boolean" &&
    typeof candidate.syncStatus === "string" &&
    SYNC_STATUSES.has(candidate.syncStatus) &&
    typeof candidate.pendingSyncCount === "number"
  );
}

const openDatabase = () =>
  new Promise<IDBDatabase>((resolve, reject) => {
    if (!("indexedDB" in window)) {
      reject(new Error("IndexedDB is unavailable."));
      return;
    }
    const request = window.indexedDB.open(DATABASE_NAME, DATABASE_VERSION);
    request.onerror = () =>
      reject(request.error ?? new Error("IndexedDB could not open."));
    request.onupgradeneeded = () => {
      const database = request.result;
      if (!database.objectStoreNames.contains(STORE_NAME)) {
        database.createObjectStore(STORE_NAME);
      }
    };
    request.onsuccess = () => resolve(request.result);
  });

export async function loadWorldExamState(): Promise<WorldExamState | null> {
  const database = await openDatabase();
  try {
    return await new Promise<WorldExamState | null>((resolve, reject) => {
      const transaction = database.transaction(STORE_NAME, "readonly");
      const request = transaction.objectStore(STORE_NAME).get(SESSION_KEY);
      request.onerror = () =>
        reject(request.error ?? new Error("Cached exam state could not load."));
      request.onsuccess = () =>
        resolve(isWorldExamState(request.result) ? request.result : null);
    });
  } finally {
    database.close();
  }
}

export async function saveWorldExamState(
  state: WorldExamState,
): Promise<void> {
  const database = await openDatabase();
  try {
    await new Promise<void>((resolve, reject) => {
      const transaction = database.transaction(STORE_NAME, "readwrite");
      transaction.onerror = () =>
        reject(
          transaction.error ?? new Error("Cached exam state could not save."),
        );
      transaction.oncomplete = () => resolve();
      transaction.objectStore(STORE_NAME).put(state, SESSION_KEY);
    });
  } finally {
    database.close();
  }
}

export async function clearWorldExamState(): Promise<void> {
  const database = await openDatabase();
  try {
    await new Promise<void>((resolve, reject) => {
      const transaction = database.transaction(STORE_NAME, "readwrite");
      transaction.onerror = () =>
        reject(
          transaction.error ?? new Error("Cached exam state could not clear."),
        );
      transaction.oncomplete = () => resolve();
      transaction.objectStore(STORE_NAME).delete(SESSION_KEY);
    });
  } finally {
    database.close();
  }
}

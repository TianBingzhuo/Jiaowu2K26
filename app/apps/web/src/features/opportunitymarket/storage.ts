import type { OpportunityMarketState } from "./types";

const STORAGE_KEY = "university2k26.opportunity-market.v1";

export function loadOpportunityState(): OpportunityMarketState | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as OpportunityMarketState;
    if (
      parsed.schemaVersion !== "1.0" ||
      parsed.dataMode !== "demo_fixture" ||
      parsed.studentId !== "student-nan-fixture"
    ) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function saveOpportunityState(state: OpportunityMarketState): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // The UI remains usable in memory when storage is unavailable.
  }
}

export function clearOpportunityState(): void {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Reset still succeeds in memory.
  }
}

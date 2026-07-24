import { createCoachScoutingState } from "./engine";
import type { CoachScoutingState } from "./types";

const STORAGE_KEY = "university2k26.f007.coach-scouting.v1";

export const saveCoachState = (state: CoachScoutingState) => {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
};

export const loadCoachState = (): CoachScoutingState => {
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return createCoachScoutingState();
  try {
    const parsed = JSON.parse(raw) as CoachScoutingState;
    if (
      parsed.fixture?.schemaVersion !== "1.0.0" ||
      parsed.fixture?.dataMode !== "demo_fixture" ||
      !Array.isArray(parsed.audit)
    ) {
      return createCoachScoutingState();
    }
    return parsed;
  } catch {
    return createCoachScoutingState();
  }
};

export const clearCoachState = () => {
  window.localStorage.removeItem(STORAGE_KEY);
};

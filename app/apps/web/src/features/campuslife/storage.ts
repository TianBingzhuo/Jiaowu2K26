import { createCampusLifeState } from "./engine";
import type { CampusLifeState } from "./types";

const STORAGE_KEY = "university2k26.f008.campus-life.v1";

export const saveCampusLifeState = (state: CampusLifeState) => {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
};

export const loadCampusLifeState = (): CampusLifeState => {
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return createCampusLifeState();
  try {
    const parsed = JSON.parse(raw) as CampusLifeState;
    if (
      parsed.fixture?.schema_version !== "1.0.0" ||
      parsed.fixture?.data_mode !== "demo_fixture" ||
      !Array.isArray(parsed.audit)
    ) {
      return createCampusLifeState();
    }
    return parsed;
  } catch {
    return createCampusLifeState();
  }
};

export const clearCampusLifeState = () => {
  window.localStorage.removeItem(STORAGE_KEY);
};

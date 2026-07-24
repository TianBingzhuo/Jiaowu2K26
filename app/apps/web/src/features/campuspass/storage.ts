import { createCampusPassState } from "./engine";
import type { CampusPassState } from "./types";

const STORAGE_KEY = "university2k26.f010.campus-pass.v1";

export const saveCampusPassState = (state: CampusPassState) => {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
};

export const loadCampusPassState = (): CampusPassState => {
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return createCampusPassState();

  try {
    const parsed = JSON.parse(raw) as CampusPassState;
    if (
      parsed.fixture?.schema_version !== "1.0.0" ||
      parsed.fixture?.data_mode !== "demo_fixture" ||
      !Array.isArray(parsed.audit) ||
      !parsed.selected_credential_id
    ) {
      return createCampusPassState();
    }
    return parsed;
  } catch {
    return createCampusPassState();
  }
};

export const clearCampusPassState = () => {
  window.localStorage.removeItem(STORAGE_KEY);
};

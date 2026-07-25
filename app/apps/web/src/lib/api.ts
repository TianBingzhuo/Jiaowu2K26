export type BackendStatus =
  | { state: "checking"; label: string; detail: string }
  | { state: "live"; label: string; detail: string; dataMode: string }
  | { state: "fallback"; label: string; detail: string };

type HealthPayload = {
  schema_version?: unknown;
  status?: unknown;
  component?: unknown;
  data_mode?: unknown;
};

export async function checkBackend(
  signal?: AbortSignal,
  fetcher: typeof fetch = fetch,
): Promise<BackendStatus> {
  try {
    const response = await fetcher("/api/v1/health", {
      method: "GET",
      headers: { accept: "application/json" },
      signal,
    });

    if (!response.ok) {
      return {
        state: "fallback",
        label: "本地演示",
        detail: `后台返回 HTTP ${response.status}；先用本地存档继续，未执行远端写入。`,
      };
    }

    const payload = (await response.json()) as HealthPayload;
    if (
      payload.status !== "ok" ||
      typeof payload.schema_version !== "string" ||
      typeof payload.data_mode !== "string"
    ) {
      return {
        state: "fallback",
        label: "本地演示",
        detail: "后台返回的内容暂时读不懂；先用本地存档继续。",
      };
    }

    return {
      state: "live",
      label: "服务在线",
      detail: `${String(payload.component ?? "university2k26-api")} · 接口版本 ${payload.schema_version}`,
      dataMode: payload.data_mode,
    };
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw error;
    }
    return {
      state: "fallback",
      label: "本地演示",
      detail: "后台没接上，先用只读存档继续。你的操作不会写回学校系统。",
    };
  }
}

export type AiTask =
  | "student_support_case"
  | "teaching_improvement"
  | "curriculum_impact"
  | "policy_impact"
  | "career_path"
  | "opportunity_brief"
  | "course_explanation";

export type AiFact = {
  label: string;
  value: string;
  source_id: string;
};

export type AiAdviceRequest = {
  task: AiTask;
  subject: string;
  question: string;
  locale: string;
  facts: AiFact[];
};

export type AiAdvice = {
  mode: "model" | "rules_fallback";
  provider: string;
  model: string;
  title: string;
  summary: string;
  suggestions: Array<{
    title: string;
    rationale: string;
    next_step: string;
    source_ids: string[];
  }>;
  caveats: string[];
  source_ids: string[];
  formal_decision: false;
  generated_at: string;
};

export type AiGatewayStatus = {
  configured: boolean;
  provider: string;
  model: string;
  credential_source: string;
  local_first_supported: boolean;
  detail: string;
};

export async function getAiStatus(
  fetcher: typeof fetch = fetch,
): Promise<AiGatewayStatus> {
  const response = await fetcher("/api/v1/ai/status", {
    method: "GET",
    headers: { accept: "application/json" },
  });
  if (!response.ok) {
    throw new Error(`AI status returned HTTP ${response.status}`);
  }
  return (await response.json()) as AiGatewayStatus;
}

export async function requestAiAdvice(
  request: AiAdviceRequest,
  fetcher: typeof fetch = fetch,
): Promise<AiAdvice> {
  const response = await fetcher("/api/v1/ai/advice", {
    method: "POST",
    headers: {
      accept: "application/json",
      "content-type": "application/json",
    },
    body: JSON.stringify(request),
  });
  if (!response.ok) {
    throw new Error(`AI advice returned HTTP ${response.status}`);
  }
  return (await response.json()) as AiAdvice;
}

export type DevelopmentEvidence = {
  label: string;
  detail: string;
  source_id: string;
};

export type DevelopmentProfile = {
  configured: boolean;
  data_mode: "local_private_profile";
  profile_version: string | null;
  display_alias: string | null;
  verified_experience: DevelopmentEvidence[];
  learning_now: DevelopmentEvidence[];
  goals: string[];
  source_boundary: string;
  formal_decision: false;
};

export async function getDevelopmentProfile(
  fetcher: typeof fetch = fetch,
): Promise<DevelopmentProfile> {
  const response = await fetcher("/api/v1/profile/development-context", {
    method: "GET",
    headers: { accept: "application/json" },
  });
  if (!response.ok) {
    throw new Error(`development context returned HTTP ${response.status}`);
  }
  return (await response.json()) as DevelopmentProfile;
}

export type RosterImportCapability = {
  institution: "uarizona" | "hebut";
  allowed_dataset_scopes: string[];
  accepted_locator_prefixes: string[];
  validation_only: boolean;
  authorization_gate: string;
  rejected_data_classes: string[];
};

export type RosterImportCapabilities = {
  schema_version: string;
  data_mode: "capability";
  sources: RosterImportCapability[];
  solver_protocol: "conda_style_v1";
  current_backend: "deterministic_fixture_reference";
  import_state: "no_real_catalog_promoted";
  source_boundary: string;
};

export async function getRosterImportCapabilities(
  fetcher: typeof fetch = fetch,
): Promise<RosterImportCapabilities> {
  const response = await fetcher("/api/v1/roster/import-capabilities", {
    method: "GET",
    headers: { accept: "application/json" },
  });
  if (!response.ok) {
    throw new Error(`roster import capabilities returned HTTP ${response.status}`);
  }
  return (await response.json()) as RosterImportCapabilities;
}

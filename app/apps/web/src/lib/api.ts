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
        label: "本地 Fixture",
        detail: `API 返回 HTTP ${response.status}，已安全降级。`,
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
        label: "本地 Fixture",
        detail: "API 健康响应不符合合同，已安全降级。",
      };
    }

    return {
      state: "live",
      label: "API 已连接",
      detail: `${String(payload.component ?? "university2k26-api")} · Schema ${payload.schema_version}`,
      dataMode: payload.data_mode,
    };
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw error;
    }
    return {
      state: "fallback",
      label: "本地 Fixture",
      detail: "API 当前不可用；演示继续使用只读 Fixture。",
    };
  }
}

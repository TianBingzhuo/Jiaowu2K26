// University2K26 · F-001 SmartCourse 的自家后端客户端（M2）。
//
// 消费 /api/v1/generated-objects/* 五个端点，类型全部来自 ../contracts/v1 前端适配层。
// 设计：API 优先，失败/结构不符一律降级为友好的 ApiErr（前端可回退本地 fixture），
// 不抛异常（AbortError 除外）。fetcher 可注入，便于在无后端时单测。
// 语气遵循 VOICE-AND-TONE：降级文案陪伴、不制造焦虑。
//
// 安全边界：请求中的 actor_id 目前只是公开 Fixture 的审计标签，不是身份凭证。
// 服务一旦离开回环地址，必须先加入服务端认证、授权、组织范围与速率限制。

import {
  SCHEMA_VERSION,
  isErrorResponse,
  isGeneratedObject,
  isInteractionResponse,
  isPublishResponse,
  isReplay,
  isReviewResponse,
  type GeneratedObject,
  type InteractionRequest,
  type InteractionResponse,
  type PublishRequest,
  type PublishResponse,
  type Replay,
  type ReviewAction,
  type ReviewRequest,
  type ReviewResponse,
} from "../contracts/v1";

/** 后端启动时播种的黄金对象 ID（与 api/src/main.rs 的 GOLDEN_FIXTURE 一致）。 */
export const GOLDEN_OBJECT_ID = "generated-bst-search-001";

const BASE = "/api/v1/generated-objects";

export type ApiResult<T> =
  | { ok: true; data: T }
  | { ok: false; code: string; message: string; retryable: boolean };

type Fetcher = typeof fetch;

const softFail = (message: string, retryable = true): ApiResult<never> => ({
  ok: false,
  code: "client_unavailable",
  message,
  retryable,
});

async function readError(response: Response): Promise<ApiResult<never>> {
  try {
    const body: unknown = await response.json();
    if (isErrorResponse(body)) {
      return {
        ok: false,
        code: body.code,
        message: body.message,
        retryable: body.retryable,
      };
    }
  } catch {
    // 无法解析错误体，落到下方通用 HTTP 文案。
  }
  return {
    ok: false,
    code: `http_${response.status}`,
    message: `后端返回 HTTP ${response.status}，先用本地存档陪你继续～`,
    retryable: response.status >= 500,
  };
}

async function requestJson<T>(
  path: string,
  guard: (v: unknown) => v is T,
  fetcher: Fetcher,
  init?: RequestInit,
  signal?: AbortSignal,
): Promise<ApiResult<T>> {
  const headers = new Headers(init?.headers);
  headers.set("accept", "application/json");
  if (init?.body != null && !headers.has("content-type")) {
    headers.set("content-type", "application/json");
  }

  let response: Response;
  try {
    response = await fetcher(path, { ...init, headers, signal });
  } catch (error) {
    if (
      typeof error === "object" &&
      error !== null &&
      "name" in error &&
      error.name === "AbortError"
    ) {
      throw error;
    }
    return softFail("后端这会儿连不上，我们先用本地存档继续，不影响你～");
  }

  if (!response.ok) return readError(response);

  let body: unknown;
  try {
    body = await response.json();
  } catch {
    return softFail("后端返回的内容读不出来，已安全降级到本地存档。", false);
  }
  if (!guard(body)) {
    return softFail("后端返回的结构和我们的约定不一致，已安全降级。", false);
  }
  return { ok: true, data: body };
}

// ---- 请求构造器（统一填 schema_version，避免各处手抄）----

export const buildReviewRequest = (
  actorId: string,
  expectedRevision: number,
  action: ReviewAction,
): ReviewRequest => ({
  schema_version: SCHEMA_VERSION,
  actor_id: actorId,
  expected_revision: expectedRevision,
  action,
});

export const buildPublishRequest = (
  actorId: string,
  expectedRevision: number,
): PublishRequest => ({
  schema_version: SCHEMA_VERSION,
  actor_id: actorId,
  expected_revision: expectedRevision,
});

export const buildInteractionRequest = (
  actorId: string,
  interactionType: string,
  extra?: Pick<InteractionRequest, "selected_answer" | "correct" | "duration_ms">,
): InteractionRequest => ({
  schema_version: SCHEMA_VERSION,
  actor_id: actorId,
  interaction_type: interactionType,
  ...extra,
});

// ---- 五个端点 ----

export function getGeneratedObject(
  objectId: string = GOLDEN_OBJECT_ID,
  signal?: AbortSignal,
  fetcher: Fetcher = fetch,
): Promise<ApiResult<GeneratedObject>> {
  return requestJson(
    `${BASE}/${encodeURIComponent(objectId)}`,
    isGeneratedObject,
    fetcher,
    undefined,
    signal,
  );
}

export function getReplay(
  objectId: string = GOLDEN_OBJECT_ID,
  signal?: AbortSignal,
  fetcher: Fetcher = fetch,
): Promise<ApiResult<Replay>> {
  return requestJson(
    `${BASE}/${encodeURIComponent(objectId)}/replay`,
    isReplay,
    fetcher,
    undefined,
    signal,
  );
}

export function reviewObject(
  objectId: string,
  request: ReviewRequest,
  signal?: AbortSignal,
  fetcher: Fetcher = fetch,
): Promise<ApiResult<ReviewResponse>> {
  return requestJson(
    `${BASE}/${encodeURIComponent(objectId)}/reviews`,
    isReviewResponse,
    fetcher,
    { method: "POST", body: JSON.stringify(request) },
    signal,
  );
}

export function publishObject(
  objectId: string,
  request: PublishRequest,
  signal?: AbortSignal,
  fetcher: Fetcher = fetch,
): Promise<ApiResult<PublishResponse>> {
  return requestJson(
    `${BASE}/${encodeURIComponent(objectId)}/publish`,
    isPublishResponse,
    fetcher,
    { method: "POST", body: JSON.stringify(request) },
    signal,
  );
}

export function recordInteraction(
  objectId: string,
  request: InteractionRequest,
  signal?: AbortSignal,
  fetcher: Fetcher = fetch,
): Promise<ApiResult<InteractionResponse>> {
  return requestJson(
    `${BASE}/${encodeURIComponent(objectId)}/interactions`,
    isInteractionResponse,
    fetcher,
    { method: "POST", body: JSON.stringify(request) },
    signal,
  );
}

// ---- 供 UI 安全展示的"实时证据"摘要（不做有损的视图模型转换）----

export type LiveObjectSummary = {
  id: string;
  reviewState: string;
  revision: number;
  sourceCount: number;
  evidenceCount: number;
};

export const summarizeObject = (object: GeneratedObject): LiveObjectSummary => ({
  id: object.id,
  reviewState: object.review_state,
  revision: object.revision,
  sourceCount: object.source_ids.length,
  evidenceCount: object.evidence.length,
});

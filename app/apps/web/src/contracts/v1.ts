// University2K26 · /api/v1 线上契约的前端适配层。
//
// 由 app/contracts/v1/*.schema.json 与后端 generated-objects 处理器的精确响应结构推导。
// 前端与后端交互统一 import 本文件，避免各 feature 再手抄字段；但它当前仍是
// 经人工对齐的 TypeScript 投影，不冒充可自动生成的权威事实源。权威合同仍位于
// app/contracts/v1，后续若引入生成器，必须继续通过 Golden Fixture 与旧读者测试。
//
// 命名保持与线上一致的 snake_case；未知未来枚举值必须保留（ARCHITECTURE 规则 #5），
// 故用 Open<T> 在给出已知值自动补全的同时容忍任意字符串。

export const SCHEMA_VERSION = "1.0.0";

/** 已知取值 + 前向兼容：允许任意未来字符串，不崩溃、不误判。 */
export type Open<T extends string> = T | (string & {});

export type ReviewState = Open<
  | "draft"
  | "review"
  | "approved"
  | "removed"
  | "rejected"
  | "published"
  | "withdrawn"
>;

export type GenerationMode = Open<"model" | "rule" | "fixture">;

export interface EvidenceItem {
  id: string;
  source_fragment_id: string;
  source_ref: string;
  source_type: string;
  quote: string;
  summary: string;
  confidence: number | null;
  teacher_action: string | null;
}

/** GeneratedObject v1（generated-object.schema.json）。 */
export interface GeneratedObject {
  schema_version: string;
  id: string;
  course_id: string;
  kind: string;
  body: string;
  source_ids: string[];
  evidence: EvidenceItem[];
  evidence_status: string;
  unknowns: string[];
  generation_mode: GenerationMode;
  generator_version: string;
  review_state: ReviewState;
  revision: number;
  fixture: boolean;
}

// ---- 请求（review-request / publish-request / interaction-request）----

export type ReviewAction =
  | { type: "start_review" }
  | { type: "edit"; body: string }
  | { type: "approve" }
  | { type: "remove"; reason: string }
  | { type: "reject"; reason: string };

export interface ReviewRequest {
  schema_version: string;
  actor_id: string;
  expected_revision: number;
  action: ReviewAction;
}

export interface PublishRequest {
  schema_version: string;
  actor_id: string;
  expected_revision: number;
}

export interface InteractionRequest {
  schema_version: string;
  actor_id: string;
  interaction_type: string;
  selected_answer?: string;
  correct?: boolean;
  duration_ms?: number;
}

// ---- 响应（序列化的领域对象与 handler 包装）----

export interface ReviewEvent {
  schema_version: string;
  id: string;
  object_id: string;
  sequence: number;
  actor_id: string;
  action: string;
  from_state: ReviewState;
  to_state: ReviewState;
  before_body: string | null;
  after_body: string | null;
  reason: string | null;
  occurred_at_unix_ms: number;
}

export interface PublishedVersion {
  schema_version: string;
  id: string;
  object_id: string;
  version: number;
  published_by: string;
  occurred_at_unix_ms: number;
  fixture: boolean;
  object_snapshot: GeneratedObject;
}

export interface StudentInteraction {
  schema_version: string;
  id: string;
  object_id: string;
  published_version_id: string;
  actor_id: string;
  interaction_type: string;
  selected_answer: string | null;
  correct: boolean | null;
  duration_ms: number | null;
  occurred_at_unix_ms: number;
  fixture: boolean;
}

export interface Replay {
  schema_version: string;
  object: GeneratedObject;
  review_events: ReviewEvent[];
  published_versions: PublishedVersion[];
  student_interactions: StudentInteraction[];
}

export interface ReviewResponse {
  schema_version: string;
  object: GeneratedObject;
  event: ReviewEvent;
}

export interface PublishResponse {
  schema_version: string;
  object: GeneratedObject;
  published_version: PublishedVersion;
}

export interface InteractionResponse {
  schema_version: string;
  interaction: StudentInteraction;
}

/** ErrorResponse v1（error-response.schema.json）。 */
export interface ErrorResponse {
  schema_version: string;
  code: string;
  message: string;
  retryable: boolean;
  fallback_available?: boolean;
}

// ---- 运行时守卫（严格验证已声明字段，同时允许 additionalProperties）----

const isObject = (v: unknown): v is Record<string, unknown> =>
  typeof v === "object" && v !== null;

const isV1SchemaVersion = (v: unknown): v is string =>
  typeof v === "string" && /^1\./u.test(v);

const isNonEmptyString = (v: unknown): v is string =>
  typeof v === "string" && v.length > 0;

const isStringArray = (v: unknown): v is string[] =>
  Array.isArray(v) && v.every((item) => typeof item === "string");

const isNonEmptyStringArray = (v: unknown): v is string[] =>
  Array.isArray(v) && v.length > 0 && v.every(isNonEmptyString);

const isNonNegativeSafeInteger = (v: unknown): v is number =>
  typeof v === "number" && Number.isSafeInteger(v) && v >= 0;

const isNullableString = (v: unknown): v is string | null =>
  v === null || typeof v === "string";

const isNullableBoolean = (v: unknown): v is boolean | null =>
  v === null || typeof v === "boolean";

const isNullableNonNegativeSafeInteger = (v: unknown): v is number | null =>
  v === null || isNonNegativeSafeInteger(v);

export function isEvidenceItem(v: unknown): v is EvidenceItem {
  if (!isObject(v)) return false;
  return (
    isNonEmptyString(v.id) &&
    isNonEmptyString(v.source_fragment_id) &&
    isNonEmptyString(v.source_ref) &&
    isNonEmptyString(v.source_type) &&
    typeof v.quote === "string" &&
    typeof v.summary === "string" &&
    (v.confidence === null ||
      (typeof v.confidence === "number" &&
        Number.isFinite(v.confidence) &&
        v.confidence >= 0 &&
        v.confidence <= 1)) &&
    isNullableString(v.teacher_action)
  );
}

export function isGeneratedObject(v: unknown): v is GeneratedObject {
  if (!isObject(v)) return false;
  return (
    isV1SchemaVersion(v.schema_version) &&
    isNonEmptyString(v.id) &&
    isNonEmptyString(v.course_id) &&
    isNonEmptyString(v.kind) &&
    isNonEmptyString(v.body) &&
    isNonEmptyStringArray(v.source_ids) &&
    Array.isArray(v.evidence) &&
    v.evidence.length > 0 &&
    v.evidence.every(isEvidenceItem) &&
    isNonEmptyString(v.evidence_status) &&
    isStringArray(v.unknowns) &&
    typeof v.generation_mode === "string" &&
    isNonEmptyString(v.generator_version) &&
    typeof v.review_state === "string" &&
    isNonNegativeSafeInteger(v.revision) &&
    typeof v.fixture === "boolean"
  );
}

export function isReviewEvent(v: unknown): v is ReviewEvent {
  if (!isObject(v)) return false;
  return (
    isV1SchemaVersion(v.schema_version) &&
    isNonEmptyString(v.id) &&
    isNonEmptyString(v.object_id) &&
    isNonNegativeSafeInteger(v.sequence) &&
    isNonEmptyString(v.actor_id) &&
    isNonEmptyString(v.action) &&
    typeof v.from_state === "string" &&
    typeof v.to_state === "string" &&
    isNullableString(v.before_body) &&
    isNullableString(v.after_body) &&
    isNullableString(v.reason) &&
    isNonNegativeSafeInteger(v.occurred_at_unix_ms)
  );
}

export function isPublishedVersion(v: unknown): v is PublishedVersion {
  if (!isObject(v)) return false;
  return (
    isV1SchemaVersion(v.schema_version) &&
    isNonEmptyString(v.id) &&
    isNonEmptyString(v.object_id) &&
    isNonNegativeSafeInteger(v.version) &&
    isNonEmptyString(v.published_by) &&
    isNonNegativeSafeInteger(v.occurred_at_unix_ms) &&
    typeof v.fixture === "boolean" &&
    isGeneratedObject(v.object_snapshot)
  );
}

export function isStudentInteraction(v: unknown): v is StudentInteraction {
  if (!isObject(v)) return false;
  return (
    isV1SchemaVersion(v.schema_version) &&
    isNonEmptyString(v.id) &&
    isNonEmptyString(v.object_id) &&
    isNonEmptyString(v.published_version_id) &&
    isNonEmptyString(v.actor_id) &&
    isNonEmptyString(v.interaction_type) &&
    isNullableString(v.selected_answer) &&
    isNullableBoolean(v.correct) &&
    isNullableNonNegativeSafeInteger(v.duration_ms) &&
    isNonNegativeSafeInteger(v.occurred_at_unix_ms) &&
    typeof v.fixture === "boolean"
  );
}

export function isReplay(v: unknown): v is Replay {
  if (!isObject(v)) return false;
  return (
    isV1SchemaVersion(v.schema_version) &&
    isGeneratedObject(v.object) &&
    Array.isArray(v.review_events) &&
    v.review_events.every(isReviewEvent) &&
    Array.isArray(v.published_versions) &&
    v.published_versions.every(isPublishedVersion) &&
    Array.isArray(v.student_interactions) &&
    v.student_interactions.every(isStudentInteraction)
  );
}

export function isReviewResponse(v: unknown): v is ReviewResponse {
  if (!isObject(v)) return false;
  return (
    isV1SchemaVersion(v.schema_version) &&
    isGeneratedObject(v.object) &&
    isReviewEvent(v.event)
  );
}

export function isPublishResponse(v: unknown): v is PublishResponse {
  if (!isObject(v)) return false;
  return (
    isV1SchemaVersion(v.schema_version) &&
    isGeneratedObject(v.object) &&
    isPublishedVersion(v.published_version)
  );
}

export function isInteractionResponse(v: unknown): v is InteractionResponse {
  if (!isObject(v)) return false;
  return (
    isV1SchemaVersion(v.schema_version) &&
    isStudentInteraction(v.interaction)
  );
}

export function isErrorResponse(v: unknown): v is ErrorResponse {
  if (!isObject(v)) return false;
  return (
    isV1SchemaVersion(v.schema_version) &&
    isNonEmptyString(v.code) &&
    isNonEmptyString(v.message) &&
    typeof v.retryable === "boolean" &&
    (v.fallback_available === undefined ||
      typeof v.fallback_available === "boolean")
  );
}

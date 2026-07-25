// F-001 SmartCourse 客户端（M2）+ 契约类型（M1）单元测试。
// 用可注入 fetcher，无需真实后端即可验证：live 命中 / 后端错误降级 / 网络异常降级 /
// AbortError 继续抛出 / 结构不符降级 / 摘要提取；并用黄金 fixture 验证 M1 类型对齐真实契约实例。
import { describe, expect, it } from "vitest";
import goldenFixture from "../../../fixtures/v1/generated-object.bst.json";
import {
  isGeneratedObject,
  isReplay,
  type GeneratedObject,
  type PublishedVersion,
  type Replay,
  type ReviewEvent,
  type StudentInteraction,
} from "../src/contracts/v1";
import {
  GOLDEN_OBJECT_ID,
  buildInteractionRequest,
  buildPublishRequest,
  buildReviewRequest,
  getGeneratedObject,
  getReplay,
  publishObject,
  recordInteraction,
  reviewObject,
  summarizeObject,
} from "../src/lib/smartCourseApi";

const sampleObject: GeneratedObject = {
  schema_version: "1.0.0",
  id: GOLDEN_OBJECT_ID,
  course_id: "course-sls-demo",
  kind: "quiz",
  body: "示例题干",
  source_ids: ["source-1"],
  evidence: [
    {
      id: "e1",
      source_fragment_id: "source-1",
      source_ref: "PDF · 第 12 页",
      source_type: "slide",
      quote: "q",
      summary: "s",
      confidence: 0.9,
      teacher_action: null,
    },
  ],
  evidence_status: "supported",
  unknowns: [],
  generation_mode: "fixture",
  generator_version: "smartcourse-fixture-v1",
  review_state: "published",
  revision: 3,
  fixture: true,
};

const sampleEvent: ReviewEvent = {
  schema_version: "1.0.0",
  id: "review-event-1",
  object_id: GOLDEN_OBJECT_ID,
  sequence: 3,
  actor_id: "teacher-fixture",
  action: "approve",
  from_state: "review",
  to_state: "approved",
  before_body: "旧题干",
  after_body: "示例题干",
  reason: null,
  occurred_at_unix_ms: 1_753_337_000_000,
};

const samplePublishedVersion: PublishedVersion = {
  schema_version: "1.0.0",
  id: "published-version-1",
  object_id: GOLDEN_OBJECT_ID,
  version: 1,
  published_by: "teacher-fixture",
  occurred_at_unix_ms: 1_753_337_100_000,
  fixture: true,
  object_snapshot: sampleObject,
};

const sampleInteraction: StudentInteraction = {
  schema_version: "1.0.0",
  id: "interaction-1",
  object_id: GOLDEN_OBJECT_ID,
  published_version_id: samplePublishedVersion.id,
  actor_id: "student-nan-fixture",
  interaction_type: "answer",
  selected_answer: "A",
  correct: true,
  duration_ms: 1_200,
  occurred_at_unix_ms: 1_753_337_200_000,
  fixture: true,
};

const sampleReplay: Replay = {
  schema_version: "1.0.0",
  object: sampleObject,
  review_events: [sampleEvent],
  published_versions: [samplePublishedVersion],
  student_interactions: [sampleInteraction],
};

const jsonResponse = (body: unknown, status = 200): Response =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });

describe("契约类型 M1", () => {
  it("黄金 fixture 满足 isGeneratedObject（类型对齐真实契约实例）", () => {
    expect(isGeneratedObject(goldenFixture)).toBe(true);
  });

  it("拒绝缺字段、越界置信度与不安全整数，不把损坏响应当成可信数据", () => {
    expect(
      isGeneratedObject({
        ...sampleObject,
        evidence: [{ ...sampleObject.evidence[0], confidence: 1.5 }],
      }),
    ).toBe(false);
    expect(
      isGeneratedObject({
        ...sampleObject,
        revision: Number.MAX_SAFE_INTEGER + 1,
      }),
    ).toBe(false);
    expect(isGeneratedObject({ ...sampleObject, fixture: undefined })).toBe(false);
  });

  it("v1 客户端拒绝未知主版本，避免把 v2 结构静默解释成 v1", () => {
    expect(isGeneratedObject({ ...sampleObject, schema_version: "2.0.0" })).toBe(
      false,
    );
  });

  it("Replay 递归验证事件、发布版本和学生交互", () => {
    expect(isReplay(sampleReplay)).toBe(true);
    expect(
      isReplay({
        ...sampleReplay,
        review_events: [{ id: "只有外壳，不是完整事件" }],
      }),
    ).toBe(false);
  });
});

describe("smartCourseApi 客户端 M2", () => {
  it("getGeneratedObject：live 命中返回 ok 且类型正确", async () => {
    const fetcher: typeof fetch = async () => jsonResponse(sampleObject);
    const result = await getGeneratedObject(GOLDEN_OBJECT_ID, undefined, fetcher);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.review_state).toBe("published");
      expect(result.data.source_ids).toHaveLength(1);
    }
  });

  it("getReplay：完整递归契约命中；嵌套事件损坏时拒绝", async () => {
    const successFetcher: typeof fetch = async () => jsonResponse(sampleReplay);
    const success = await getReplay(GOLDEN_OBJECT_ID, undefined, successFetcher);
    expect(success.ok).toBe(true);

    const invalidFetcher: typeof fetch = async () =>
      jsonResponse({
        ...sampleReplay,
        student_interactions: [{ id: "incomplete" }],
      });
    const invalid = await getReplay(GOLDEN_OBJECT_ID, undefined, invalidFetcher);
    expect(invalid.ok).toBe(false);
  });

  it("reviewObject：编码对象 ID，并发送完整 JSON 请求头与请求体", async () => {
    let capturedPath = "";
    let capturedInit: RequestInit | undefined;
    const fetcher: typeof fetch = async (input, init) => {
      capturedPath = String(input);
      capturedInit = init;
      return jsonResponse({
        schema_version: "1.0.0",
        object: { ...sampleObject, review_state: "approved" },
        event: sampleEvent,
      });
    };
    const request = buildReviewRequest("teacher-fixture", 2, {
      type: "approve",
    });
    const result = await reviewObject(
      "object/with space",
      request,
      undefined,
      fetcher,
    );

    expect(result.ok).toBe(true);
    expect(capturedPath).toBe(
      "/api/v1/generated-objects/object%2Fwith%20space/reviews",
    );
    expect(capturedInit?.method).toBe("POST");
    expect(new Headers(capturedInit?.headers).get("accept")).toBe(
      "application/json",
    );
    expect(new Headers(capturedInit?.headers).get("content-type")).toBe(
      "application/json",
    );
    expect(JSON.parse(String(capturedInit?.body))).toEqual(request);
  });

  it("publishObject：递归验证发布快照", async () => {
    const fetcher: typeof fetch = async () =>
      jsonResponse({
        schema_version: "1.0.0",
        object: sampleObject,
        published_version: samplePublishedVersion,
      });
    const result = await publishObject(
      GOLDEN_OBJECT_ID,
      buildPublishRequest("teacher-fixture", 3),
      undefined,
      fetcher,
    );
    expect(result.ok).toBe(true);
  });

  it("recordInteraction：完整学生交互响应命中", async () => {
    const fetcher: typeof fetch = async () =>
      jsonResponse({
        schema_version: "1.0.0",
        interaction: sampleInteraction,
      });
    const request = buildInteractionRequest("student-nan-fixture", "answer", {
      selected_answer: "A",
      correct: true,
      duration_ms: 1_200,
    });
    const result = await recordInteraction(
      GOLDEN_OBJECT_ID,
      request,
      undefined,
      fetcher,
    );
    expect(result.ok).toBe(true);
  });

  it("后端错误体（error-response）降级为带 code 的 ApiErr", async () => {
    const fetcher: typeof fetch = async () =>
      jsonResponse(
        {
          schema_version: "1.0.0",
          code: "not_found",
          message: "对象不存在",
          retryable: false,
        },
        404,
      );
    const result = await getGeneratedObject("missing", undefined, fetcher);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.code).toBe("not_found");
      expect(result.retryable).toBe(false);
    }
  });

  it("错误体不符合 v1 契约时不信任其 message，使用通用 HTTP 文案", async () => {
    const fetcher: typeof fetch = async () =>
      jsonResponse(
        {
          schema_version: "2.0.0",
          code: "not_found",
          message: "<script>不应透传</script>",
          retryable: false,
        },
        404,
      );
    const result = await getGeneratedObject("missing", undefined, fetcher);
    expect(result).toMatchObject({
      ok: false,
      code: "http_404",
      message: "后台返回 HTTP 404。先用本地存档继续，你刚才的操作还在。",
    });
  });

  it("网络异常降级为可重试 ApiErr（不抛）", async () => {
    const fetcher: typeof fetch = async () => {
      throw new TypeError("network down");
    };
    const result = await getGeneratedObject(GOLDEN_OBJECT_ID, undefined, fetcher);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.retryable).toBe(true);
  });

  it("AbortError 继续抛出（供调用方识别取消）", async () => {
    const fetcher: typeof fetch = async () => {
      throw new DOMException("aborted", "AbortError");
    };
    await expect(
      getGeneratedObject(GOLDEN_OBJECT_ID, undefined, fetcher),
    ).rejects.toThrow();
  });

  it("跨 realm 的 AbortError 也继续抛出", async () => {
    const abortFromAnotherRealm = { name: "AbortError", message: "aborted" };
    const fetcher: typeof fetch = async () => {
      throw abortFromAnotherRealm;
    };
    await expect(
      getGeneratedObject(GOLDEN_OBJECT_ID, undefined, fetcher),
    ).rejects.toBe(abortFromAnotherRealm);
  });

  it("recordInteraction：响应结构不符时安全降级", async () => {
    const fetcher: typeof fetch = async () => jsonResponse({ nope: true });
    const request = buildInteractionRequest("student-nan-fixture", "answer", {
      selected_answer: "A",
      correct: true,
      duration_ms: 1200,
    });
    const result = await recordInteraction(
      GOLDEN_OBJECT_ID,
      request,
      undefined,
      fetcher,
    );
    expect(result.ok).toBe(false);
  });

  it("summarizeObject 提取安全展示字段", () => {
    expect(summarizeObject(sampleObject)).toEqual({
      id: GOLDEN_OBJECT_ID,
      reviewState: "published",
      revision: 3,
      sourceCount: 1,
      evidenceCount: 1,
    });
  });
});

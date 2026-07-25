import { describe, expect, it, vi } from "vitest";
import {
  checkBackend,
  getRosterImportCapabilities,
  requestAiAdvice,
} from "../src/lib/api";

describe("backend health handshake", () => {
  it("accepts the versioned API health contract", async () => {
    const fetcher = vi.fn(async () =>
      new Response(
        JSON.stringify({
          schema_version: "1.0.0",
          status: "ok",
          component: "j2k26-api",
          data_mode: "fixture",
        }),
        { status: 200, headers: { "content-type": "application/json" } },
      ),
    ) as unknown as typeof fetch;

    await expect(checkBackend(undefined, fetcher)).resolves.toMatchObject({
      state: "live",
      dataMode: "fixture",
    });
  });

  it("falls back instead of hiding an unavailable API", async () => {
    const fetcher = vi.fn(async () => {
      throw new TypeError("network unavailable");
    }) as unknown as typeof fetch;

    await expect(checkBackend(undefined, fetcher)).resolves.toMatchObject({
      state: "fallback",
      label: "本地演示",
    });
  });
});

describe("bounded planning and AI contracts", () => {
  it("keeps real catalog sources at validation-only", async () => {
    const fetcher = vi.fn(async () =>
      new Response(
        JSON.stringify({
          schema_version: "1.0.0",
          data_mode: "capability",
          sources: [
            {
              institution: "uarizona",
              allowed_dataset_scopes: ["public_course_catalog"],
              accepted_locator_prefixes: ["https://catalog.arizona.edu/"],
              validation_only: true,
              authorization_gate: "human review",
              rejected_data_classes: ["student_enrollment"],
            },
          ],
          solver_protocol: "conda_style_v1",
          current_backend: "deterministic_fixture_reference",
          import_state: "no_real_catalog_promoted",
          source_boundary: "Validation only; no persistence or enrollment.",
        }),
        { status: 200, headers: { "content-type": "application/json" } },
      ),
    ) as unknown as typeof fetch;

    const payload = await getRosterImportCapabilities(fetcher);
    expect(payload.import_state).toBe("no_real_catalog_promoted");
    expect(payload.sources.every((source) => source.validation_only)).toBe(true);
  });

  it("sends only the explicit source-bound AI request envelope", async () => {
    const fetchMock = vi.fn(
      async (_input: RequestInfo | URL, _init?: RequestInit) =>
        new Response(
        JSON.stringify({
          mode: "rules_fallback",
          provider: "university2k26-rules",
          model: "deterministic-v1",
          title: "下一回合",
          summary: "基于来源事实。",
          suggestions: [
            {
              title: "核验",
              rationale: "保留来源。",
              next_step: "查看证据。",
              source_ids: ["fixture:001"],
            },
          ],
          caveats: ["不是正式决定。"],
          source_ids: ["fixture:001"],
          formal_decision: false,
          generated_at: "2026-07-24T21:00:00+08:00",
        }),
        { status: 200, headers: { "content-type": "application/json" } },
        ),
    );
    const fetcher = fetchMock as unknown as typeof fetch;

    const result = await requestAiAdvice(
      {
        task: "course_explanation",
        subject: "信号与线性系统",
        question: "下一步？",
        locale: "zh-CN",
        facts: [
          { label: "进度", value: "68%", source_id: "fixture:001" },
        ],
      },
      fetcher,
    );

    expect(result.mode).toBe("rules_fallback");
    expect(result.formal_decision).toBe(false);
    const body = JSON.parse(
      String((fetchMock.mock.calls[0]?.[1] as RequestInit | undefined)?.body),
    ) as Record<string, unknown>;
    expect(body).toEqual({
      task: "course_explanation",
      subject: "信号与线性系统",
      question: "下一步？",
      locale: "zh-CN",
      facts: [{ label: "进度", value: "68%", source_id: "fixture:001" }],
    });
  });
});

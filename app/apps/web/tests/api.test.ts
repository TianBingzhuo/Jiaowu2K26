import { describe, expect, it, vi } from "vitest";
import { checkBackend } from "../src/lib/api";

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
      label: "本地 Fixture",
    });
  });
});

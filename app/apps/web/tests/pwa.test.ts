import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const webRoot = resolve(import.meta.dirname, "..");

describe("PWA safety boundary", () => {
  it("ships a standalone University2K26 manifest with both icon sizes", async () => {
    const manifest = JSON.parse(
      await readFile(resolve(webRoot, "public/manifest.webmanifest"), "utf8"),
    ) as {
      name: string;
      display: string;
      icons: Array<{ sizes: string }>;
    };

    expect(manifest.name).toContain("University2K26");
    expect(manifest.display).toBe("standalone");
    expect(manifest.icons.map((icon) => icon.sizes)).toEqual(["192x192", "512x512"]);
  });

  it("never converts an unavailable API response into cached HTML", async () => {
    const serviceWorker = await readFile(resolve(webRoot, "public/sw.js"), "utf8");

    expect(serviceWorker).toContain('url.pathname.startsWith("/api/")');
    expect(serviceWorker).toContain("status: 503");
    expect(serviceWorker).toContain('"content-type": "application/json; charset=utf-8"');
    expect(serviceWorker).toContain("cacheAppShell");
  });
});

import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const webRoot = resolve(import.meta.dirname, "..");

describe("motion contract", () => {
  it("keeps shared motion tokens and both reduced-motion paths", async () => {
    const styles = await readFile(resolve(webRoot, "src/styles.css"), "utf8");

    expect(styles).toContain("--motion-ack: 50ms");
    expect(styles).toContain("--motion-focus: 140ms");
    expect(styles).toContain("--motion-panel: 280ms");
    expect(styles).toContain("--motion-result: 650ms");
    expect(styles).toContain(".is-reduced-motion *");
    expect(styles).toContain("@media (prefers-reduced-motion: reduce)");
  });

  it("limits infinite animation to the bounded loading indicator", async () => {
    const styles = await readFile(resolve(webRoot, "src/styles.css"), "utf8");
    const infiniteAnimations =
      styles.match(/animation:[^;{}]*\binfinite\b/g) ?? [];

    expect(infiniteAnimations).toHaveLength(1);
    expect(infiniteAnimations[0]).toContain("loading-rotation");
  });
});

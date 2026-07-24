import { describe, expect, it } from "vitest";
import {
  actOnRecommendation,
  buildPrivateArchive,
  buildTrendText,
  createPerformanceState,
  createShareGrant,
  previewShare,
  recordExport,
  reportHarm,
  requestCorrection,
  revokeShareGrant,
  setClimateVariant,
  toggleOffline,
} from "../src/features/performancecenter/engine";
import { PERFORMANCE_FIXTURE } from "../src/features/performancecenter/fixture";

describe("F-006 Performance Center private evidence-aware feedback", () => {
  it("starts private, self-only and explicitly fixture-bound", () => {
    const state = createPerformanceState();
    expect(state.privateByDefault).toBe(true);
    expect(state.comparisonMode).toBe("self_only");
    expect(state.dataMode).toBe("fixture");
    expect(state.sourceBoundary).toMatch(/不读取 GPA、排名、门禁、支付/);
    expect(JSON.stringify(PERFORMANCE_FIXTURE)).not.toContain(
      "class_rank",
    );
  });

  it("publishes a complete metric catalog with limits and correction routes", () => {
    const state = createPerformanceState();
    expect(state.metrics).toHaveLength(6);
    expect(
      state.metrics.every(
        (metric) =>
          metric.definition &&
          metric.purpose &&
          metric.limitation &&
          metric.correctionRoute &&
          metric.version &&
          metric.comparisonMode === "self_only",
      ),
    ).toBe(true);
  });

  it("renders a textual trend equivalent and preserves data gaps", () => {
    const state = createPerformanceState();
    const text = buildTrendText(state, "metric-revision-quality");
    expect(text).toContain("数据缺口");
    expect(text).toContain("置信说明");
    expect(
      state.observations
        .find((item) => item.metricId === "metric-revision-quality")
        ?.trend.some((point) => point.status === "gap"),
    ).toBe(true);
  });

  it("keeps knowledge, skill, collaboration and habit separate", () => {
    const state = createPerformanceState();
    expect(state.abilities.map((item) => item.id)).toEqual([
      "ability-knowledge",
      "ability-applied",
      "ability-collaboration",
      "ability-habit",
    ]);
    expect(
      state.abilities.find((item) => item.id === "ability-collaboration")
        ?.confidence,
    ).toBe("insufficient");
  });

  it("combines four load signals with real fallback actions", () => {
    const state = createPerformanceState();
    expect(state.loadSignals).toHaveLength(4);
    expect(state.loadSignals.some((item) => item.severity === "high")).toBe(
      true,
    );
    expect(state.supportActions).toHaveLength(3);
    expect(state.supportActions.some((item) => /关闭/.test(item.action))).toBe(
      true,
    );
  });

  it("only awards transparent private badges that never affect rights", () => {
    const state = createPerformanceState();
    expect(
      state.badges.every(
        (badge) =>
          badge.private &&
          badge.affectsRights === false &&
          badge.criteria.length > 0,
      ),
    ).toBe(true);
    expect(
      state.badges.find((badge) => badge.id === "badge-assist-play")?.status,
    ).toBe("in_progress");
  });

  it("defaults Degree Fahrenheit to the no-metaphor C variant", () => {
    const state = createPerformanceState();
    expect(state.climateVariant).toBe("c_dimensions");
    expect(state.climateEnabled).toBe(false);
    expect(state.researchGate.status).toBe(
      "deferred_pending_human_evidence",
    );
    expect(state.researchGate.evidenceCount).toBe(0);
    const preview = setClimateVariant(state, "a_numbers");
    expect(preview.climateEnabled).toBe(true);
    expect(preview.message).toMatch(/不是计算结果、成绩或医学温度/);
    expect(preview.audit.at(-1)?.action).toBe("climate_toggle");
  });

  it("lets the student adopt, defer or reject recommendations", () => {
    const state = createPerformanceState();
    const adopted = actOnRecommendation(state, "rec-buffer", "adopted");
    expect(
      adopted.recommendations.find((item) => item.id === "rec-buffer")?.status,
    ).toBe("adopted");
    expect(adopted.message).toContain("不会写入正式课表或成绩");
    const dismissed = actOnRecommendation(state, "rec-source", "dismissed");
    expect(dismissed.message).toContain("不影响任何权益");
  });

  it("previews, grants and revokes purpose-bound sharing", () => {
    const state = createPerformanceState();
    const draft = {
      recipient: "学业导师（Fixture）",
      purpose: "讨论下周任务安排",
      durationDays: 7,
      dimensionIds: ["ability-knowledge"],
    };
    expect(previewShare(state, draft)).toEqual([
      "知识理解：4 / 5 次证据检查后答对",
    ]);
    const granted = createShareGrant(state, draft);
    expect(granted.shareGrants).toHaveLength(1);
    expect(granted.shareGrants[0].expiresAt).toBe(
      "2026-07-31T23:59:00+08:00",
    );
    expect(granted.shareGrants[0].revokedAt).toBeNull();
    const revoked = revokeShareGrant(granted, granted.shareGrants[0].id);
    expect(revoked.shareGrants[0].revokedAt).not.toBeNull();
    expect(revoked.audit.at(-1)?.action).toBe("share_revoke");
  });

  it("queues corrections as new versions without overwriting observations", () => {
    const state = createPerformanceState();
    const before = structuredClone(state.observations);
    const next = requestCorrection(
      state,
      "metric-revision-quality",
      "遗漏了一次离线修订。",
    );
    expect(next.corrections[0].revision).toBe(1);
    expect(next.corrections[0].status).toBe("queued_for_human_review");
    expect(next.observations).toEqual(before);
  });

  it("triggers a STOP gate and removes climate labels after harm", () => {
    const preview = setClimateVariant(
      createPerformanceState(),
      "a_numbers",
    );
    const stopped = reportHarm(
      preview,
      "数字让我误以为这是正式成绩。",
    );
    expect(stopped.climateVariant).toBe("c_dimensions");
    expect(stopped.climateEnabled).toBe(false);
    expect(stopped.statusLabel.withdrawnAt).not.toBeNull();
    expect(stopped.harmSignals.at(-1)?.severity).toBe("stop");
    expect(stopped.message).toContain("STOP");
    expect(() => setClimateVariant(stopped, "a_numbers")).toThrow(
      /STOP 后 Academic Climate 已锁定/,
    );
  });

  it("keeps honest offline fallback, portable archive and audit chain", () => {
    const offline = toggleOffline(createPerformanceState());
    expect(offline.offline).toBe(true);
    expect(offline.message).toContain("不生成新推断");
    const archive = buildPrivateArchive(offline);
    expect(archive.authoritative).toBe(false);
    expect(archive.warning).toMatch(/not a grade, medical record/);
    for (let index = 1; index < offline.audit.length; index += 1) {
      expect(offline.audit[index].previousEventHash).toBe(
        offline.audit[index - 1].eventHash,
      );
    }
    const exported = recordExport(offline);
    expect(exported.audit.at(-1)?.action).toBe("export");
  });
});

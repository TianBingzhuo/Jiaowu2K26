import { describe, expect, it } from "vitest";
import {
  acknowledgeProviderInterest,
  addCapacityPlan,
  buildEligibilityCheck,
  buildPortfolioExport,
  createDisclosureGrant,
  createOpportunityMarketState,
  expressInterest,
  markAppliedExternally,
  opportunityBoxScore,
  recordPortfolioExport,
  reportOpportunity,
  revokeDisclosureGrant,
  runEligibilityCheck,
  runFairnessAudit,
  runSelectiveMatch,
  saveOpportunity,
  selectPathway,
  toggleOpportunityOffline,
  togglePortfolioArtifact,
  toggleProfileField,
  visibleOpportunities,
} from "../src/features/opportunitymarket/engine";

describe("F-009 Opportunity Market transparent consent-aware fixture", () => {
  it("starts with eight complete opportunities and hard anti-manipulation invariants", () => {
    const state = createOpportunityMarketState();
    expect(state.dataMode).toBe("demo_fixture");
    expect(state.profileVisibility).toBe("private");
    expect(state.opportunities).toHaveLength(8);
    expect(state.packs).toHaveLength(2);
    expect(
      state.opportunities.every(
        (opportunity) =>
          opportunity.sourceUrl &&
          opportunity.sourceVersion &&
          opportunity.cost.description &&
          opportunity.benefits.length > 0 &&
          opportunity.obligations.length > 0 &&
          opportunity.risks.length > 0 &&
          opportunity.correctionRoute,
      ),
    ).toBe(true);
    expect(state.invariants).toEqual({
      noPaidRanking: true,
      noRandomQualification: true,
      noHumanAuction: true,
      noAutoApply: true,
      noFomoCountdown: true,
      noCompositeEligibilityScore: true,
    });
  });

  it("filters expired opportunities by default without deleting their replay evidence", () => {
    const state = createOpportunityMarketState();
    expect(visibleOpportunities(state)).toHaveLength(7);
    expect(
      visibleOpportunities(state).some(
        (opportunity) => opportunity.id === "opp-journal-clinic",
      ),
    ).toBe(false);
    expect(
      state.opportunities.find((item) => item.id === "opp-journal-clinic")
        ?.status,
    ).toBe("expired");
    expect(state.notifications[0].kind).toBe("expiry");
  });

  it("finds the AdventureX event and keeps visual use behind a pending Rights Gate", () => {
    const base = createOpportunityMarketState();
    const state = {
      ...base,
      query: "AdventureX",
    };
    const results = visibleOpportunities(state);
    expect(results).toHaveLength(1);
    expect(results[0]?.id).toBe("opp-adventurex");
    expect(results[0]?.rightsGate?.permissionStatus).toBe(
      "pending_official_confirmation",
    );
    expect(results[0]?.rightsGate?.allowedScope).toEqual([]);
    const rules = base.rules.filter(
      (rule) => rule.opportunityId === "opp-adventurex",
    );
    expect(rules).toHaveLength(3);
    expect(
      rules.every(
        (rule) =>
          rule.sourceRef ===
            "https://adventurex.feishu.cn/docx/FOhLdr0Y3okbATxWvBQcoFx0nEd" &&
          rule.fieldId === "field-adventurex-official-eligibility",
      ),
    ).toBe(true);
    expect(
      buildEligibilityCheck(base, "opp-adventurex").results.every(
        (result) => result.status === "unknown",
      ),
    ).toBe(true);
  });

  it("produces all four eligibility states with evidence and next steps", () => {
    let state = createOpportunityMarketState();
    state = toggleProfileField(state, "field-availability-hours");
    const check = buildEligibilityCheck(state, "opp-signal-lab");
    expect(check.hasCompositeScore).toBe(false);
    expect(new Set(check.results.map((result) => result.status))).toEqual(
      new Set(["met", "possibly_met", "not_met", "unknown"]),
    );
    expect(
      check.results.every(
        (result) =>
          result.ruleDescription && result.evidenceLabel && result.nextStep,
      ),
    ).toBe(true);
  });

  it("records an eligibility check without a percentage or admission prediction", () => {
    const checked = runEligibilityCheck(createOpportunityMarketState());
    expect(checked.eligibilityChecks).toHaveLength(1);
    expect(checked.eligibilityChecks[0].hasCompositeScore).toBe(false);
    expect(checked.message).toContain("没有综合分或录取预测");
    expect(checked.audit.at(-1)?.action).toBe("eligibility_check");
  });

  it("lets the student select fields while rejecting forbidden or unknown inputs", () => {
    const state = createOpportunityMarketState();
    const selected = toggleProfileField(state, "field-availability-hours");
    expect(selected.selectedProfileFieldIds).toContain(
      "field-availability-hours",
    );
    expect(() => toggleProfileField(state, "health")).toThrow(
      /禁止匹配输入/,
    );
    expect(() => toggleProfileField(state, "field-does-not-exist")).toThrow(
      /不存在/,
    );
  });

  it("matches deterministically without paid influence, random allocation or a score", () => {
    const matched = runSelectiveMatch(createOpportunityMarketState());
    expect(matched.matchResults).toHaveLength(7);
    expect(
      matched.matchResults.every(
        (result) =>
          result.paidInfluence === false &&
          result.rankingBasis === "eligibility_then_deadline" &&
          !("matchScore" in result),
      ),
    ).toBe(true);
    expect(matched.message).toContain("无付费参数、随机资格或综合分");
  });

  it("requires save and double opt-in before minimum disclosure, then supports revoke", () => {
    let state = createOpportunityMarketState();
    expect(() => expressInterest(state, "opp-signal-lab")).toThrow(/先保存/);
    state = saveOpportunity(state, "opp-signal-lab");
    expect(state.savedOpportunities[0].intentStatus).toBe("saved");
    state = expressInterest(state, "opp-signal-lab");
    expect(state.savedOpportunities[0].intentStatus).toBe(
      "student_interested",
    );
    state = acknowledgeProviderInterest(state, "opp-signal-lab");
    expect(state.savedOpportunities[0].intentStatus).toBe("mutual_interest");
    state = createDisclosureGrant(state, "opp-signal-lab", 7);
    expect(state.disclosureGrants[0].expiresAt).toBe(
      "2026-07-31T23:59:00+08:00",
    );
    expect(state.applicationMirrors[0].status).toBe("consented");
    state = revokeDisclosureGrant(state, state.disclosureGrants[0].id);
    expect(state.disclosureGrants[0].revokedAt).not.toBeNull();
    expect(state.applicationMirrors[0].sharedFieldIds).toEqual([]);
  });

  it("never submits an application and only mirrors explicit external action", () => {
    const saved = saveOpportunity(
      createOpportunityMarketState(),
      "opp-signal-lab",
    );
    expect(() =>
      markAppliedExternally(saved, "opp-signal-lab", false),
    ).toThrow(/不能自动投递/);
    const marked = markAppliedExternally(saved, "opp-signal-lab", true);
    expect(marked.applicationMirrors[0].status).toBe("applied_externally");
    expect(marked.applicationMirrors[0].authoritative).toBe(false);
    expect(marked.message).toContain("没有向外部系统发送");
  });

  it("keeps Capacity a bounded what-if that cannot be recharged into eligibility", () => {
    const state = createOpportunityMarketState();
    expect(state.capacity.every((item) => !item.canPurchaseEligibility)).toBe(
      true,
    );
    const planned = addCapacityPlan(
      state,
      "opp-signal-lab",
      4,
      "本人试投",
    );
    expect(planned.capacityPlans[0].hoursPerWeek).toBe(4);
    expect(() =>
      addCapacityPlan(state, "opp-signal-lab", 7, "超过剩余容量"),
    ).toThrow(/不能用充值购买容量/);
  });

  it("keeps pathway scenarios reversible and portfolio exports source-aware", () => {
    let state = selectPathway(
      createOpportunityMarketState(),
      "path-exchange",
    );
    expect(state.selectedPathwayId).toBe("path-exchange");
    expect(state.pathways.every((pathway) => !pathway.authoritative)).toBe(
      true,
    );
    state = togglePortfolioArtifact(state, "artifact-smartcourse");
    const archive = buildPortfolioExport(state);
    expect(archive.authoritative).toBe(false);
    expect(
      archive.artifacts.every(
        (artifact) =>
          !artifact.includesOriginalMaterial &&
          artifact.sourceId &&
          artifact.reviewStatus,
      ),
    ).toBe(true);
    const exported = recordPortfolioExport(state);
    expect(exported.audit.at(-1)?.action).toBe("portfolio_export");
  });

  it("reports expiry, recalculates affected matches and preserves a notice", () => {
    const matched = runSelectiveMatch(createOpportunityMarketState());
    expect(
      matched.matchResults.some(
        (result) => result.opportunityId === "opp-signal-lab",
      ),
    ).toBe(true);
    const reported = reportOpportunity(
      matched,
      "opp-signal-lab",
      "expired",
      "官方页显示已结束。",
    );
    expect(
      reported.opportunities.find((item) => item.id === "opp-signal-lab")
        ?.status,
    ).toBe("expired");
    expect(
      reported.matchResults.some(
        (result) => result.opportunityId === "opp-signal-lab",
      ),
    ).toBe(false);
    expect(reported.reports[0].affectedMatchRecalculated).toBe(true);
    expect(reported.notifications.at(-1)?.kind).toBe("expiry");
  });

  it("passes all fairness checks and exposes a transparent Box Score", () => {
    let state = runEligibilityCheck(createOpportunityMarketState());
    state = runFairnessAudit(state);
    expect(state.fairnessAudits.at(-1)?.status).toBe("pass");
    expect(
      state.fairnessAudits.at(-1)?.checks.every((check) => check.status === "pass"),
    ).toBe(true);
    const boxScore = opportunityBoxScore(state, "opp-signal-lab");
    expect(boxScore.source.authority).toBe("demo_fixture");
    expect(boxScore.no_composite_score).toBe(true);
    expect(boxScore.no_auto_apply).toBe(true);
    expect(boxScore.correction_route).toBeTruthy();
  });

  it("makes offline fallback explicitly read-only while preserving browsing and replay", () => {
    const offline = toggleOpportunityOffline(createOpportunityMarketState());
    expect(offline.offline).toBe(true);
    expect(offline.message).toContain("不生成新匹配");
    expect(visibleOpportunities(offline)).toHaveLength(7);
    expect(() => runSelectiveMatch(offline)).toThrow(/离线缓存为只读/);
    expect(() => saveOpportunity(offline, "opp-signal-lab")).toThrow(
      /离线缓存为只读/,
    );
    for (let index = 1; index < offline.audit.length; index += 1) {
      expect(offline.audit[index].previousEventHash).toBe(
        offline.audit[index - 1].eventHash,
      );
    }
  });
});

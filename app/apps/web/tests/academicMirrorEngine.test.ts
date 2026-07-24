import { describe, expect, it } from "vitest";
import {
  buildModuleAccessPreview,
  buildReadableArchive,
  buildTrustedEnvelope,
  createAcademicMirrorState,
  deleteNonAuthoritativeCopy,
  deriveFreshness,
  registerSource,
  requestCorrection,
  resolveConflict,
  syncSource,
  toggleConsent,
  validateMirrorFixture,
} from "../src/features/academicmirror/engine";
import { ACADEMIC_MIRROR_FIXTURE } from "../src/features/academicmirror/fixture";
import { isStoredMirrorState } from "../src/features/academicmirror/storage";

describe("F-003 Academic Mirror evidence-aware read-only layer", () => {
  it("validates two adapters, immutable hashes and all six authority classes", () => {
    expect(validateMirrorFixture(ACADEMIC_MIRROR_FIXTURE)).toEqual([]);
    expect(
      new Set(ACADEMIC_MIRROR_FIXTURE.sources.map((source) => source.adapterKind)),
    ).toEqual(new Set(["demo_fixture", "file_import"]));
    expect(ACADEMIC_MIRROR_FIXTURE.authorityCatalog).toHaveLength(6);
    expect(
      ACADEMIC_MIRROR_FIXTURE.snapshots.every(
        (snapshot) =>
          snapshot.immutable &&
          /^sha256:[a-f0-9]{64}$/.test(snapshot.contentHash),
      ),
    ).toBe(true);
  });

  it("registers an authorized local source without credentials", () => {
    const state = registerSource(createAcademicMirrorState(), {
      name: "本地授权课程导出",
      systemType: "manual_export",
      responsibleParty: "学生本人",
      fieldScope: ["course.title"],
      correctionRoute: "重新导入或删除副本。",
    });
    expect(state.sources.at(-1)?.adapterKind).toBe("file_import");
    expect(state.sources.at(-1)?.authMethod).toBe("file_import");
    expect(state.audit.at(-1)?.action).toBe("source_register");
  });

  it("appends a new snapshot and never mutates the previous snapshot", () => {
    const state = createAcademicMirrorState();
    const before = structuredClone(state.snapshots[0]);
    const next = syncSource(state, "ds-sis-demo");
    expect(next.snapshots).toHaveLength(state.snapshots.length + 1);
    expect(state.snapshots[0]).toEqual(before);
    expect(next.snapshots.at(-1)?.contentHash).toBe(before.contentHash);
    expect(next.message).toContain("内容哈希未变化");
    expect(next.message).toContain(next.snapshots.at(-1)?.id);
    expect(next.audit.slice(-2).map((event) => event.action)).toEqual([
      "sync",
      "map",
    ]);
  });

  it("falls back to the last trusted snapshot when offline", () => {
    const state = { ...createAcademicMirrorState(), offline: true };
    const next = syncSource(state, "ds-sis-demo");
    expect(next.snapshots).toHaveLength(state.snapshots.length);
    expect(next.audit.at(-1)?.action).toBe("offline_fallback");
    expect(next.message).toContain("上次可信镜像");
  });

  it("computes fresh, warning, expired and no-expiry states", () => {
    const state = createAcademicMirrorState();
    expect(deriveFreshness(state.records[0])).toBe("fresh");
    expect(deriveFreshness(state.records[1])).toBe("warning");
    expect(deriveFreshness(state.records[2])).toBe("expired");
    expect(deriveFreshness(state.records[3])).toBe("no_expiry");
  });

  it("keeps conflicts visible until a human selects a source and gives a reason", () => {
    const state = createAcademicMirrorState();
    expect(() =>
      resolveConflict(
        state,
        "conf-credit-semantics",
        "opt-hebut-earned-credits",
        "",
      ),
    ).toThrow(/理由/);
    const next = resolveConflict(
      state,
      "conf-credit-semantics",
      "opt-hebut-earned-credits",
      "保留 HEBUT 已获学分与 UArizona Transfer Credits 两个字段，禁止相加或互相覆盖。",
    );
    expect(next.conflicts[0].status).toBe("resolved");
    expect(next.conflicts[0].resolution?.chosenValue).toContain("128.5");
    expect(next.audit.at(-1)?.action).toBe("conflict_resolve");
  });

  it("revokes consent and immediately blocks dependent modules", () => {
    const state = createAcademicMirrorState();
    expect(
      buildModuleAccessPreview(state).find((item) => item.moduleId === "F-004")
        ?.status,
    ).toBe("allowed");
    const next = toggleConsent(state, "consent-sis-read");
    expect(
      buildModuleAccessPreview(next).find((item) => item.moduleId === "F-004")
        ?.status,
    ).toBe("blocked");
    expect(next.audit.at(-1)?.action).toBe("consent_revoke");
  });

  it("exports a readable untrusted archive and an explicitly unsigned envelope", () => {
    const state = createAcademicMirrorState();
    const readable = buildReadableArchive(state);
    const envelope = buildTrustedEnvelope(state);
    expect(readable.authoritative).toBe(false);
    expect(readable.records.some((record) => record.id === "nr-model-suggestion")).toBe(
      false,
    );
    expect(envelope.signatureStatus).toBe("demo_not_signed");
    expect(envelope.importDisposition).toBe("quarantine_and_preview_only");
  });

  it("only deletes removable copies and records correction requests", () => {
    const state = createAcademicMirrorState();
    expect(() =>
      deleteNonAuthoritativeCopy(state, "nr-student-profile"),
    ).toThrow(/不可在体验层删除/);
    const deleted = deleteNonAuthoritativeCopy(state, "nr-self-goal");
    expect(deleted.records.some((record) => record.id === "nr-self-goal")).toBe(
      false,
    );
    const corrected = requestCorrection(
      state,
      "nr-uarizona-academic-summary",
      "请核对 UArizona Transfer Credits 与 HEBUT 已获学分的字段语义。",
    );
    expect(corrected.audit.at(-1)?.action).toBe("correction_request");
  });

  it("keeps an append-only audit chain and a locally storable fixture state", () => {
    let state = toggleConsent(
      createAcademicMirrorState(),
      "consent-activity-opportunity",
    );
    state = syncSource(state, "ds-catalog-demo");
    for (let index = 1; index < state.audit.length; index += 1) {
      expect(state.audit[index].previousEventHash).toBe(
        state.audit[index - 1].eventHash,
      );
    }
    expect(isStoredMirrorState(state)).toBe(true);
  });
});

import { describe, expect, it } from "vitest";
import {
  approveTeachingObject,
  createSmartCourseEntryState,
  createSmartCourseState,
  editTeachingObject,
  getAcceptanceProgress,
  loadAuthorizedFixture,
  publishApprovedObjects,
  recordStudentInteraction,
  removeTeachingObject,
  selectTeachingObject,
  setSourceValidity,
} from "../src/features/smartcourse/engine";
import { STUDENT_QUESTION } from "../src/features/smartcourse/fixture";
import {
  MAX_MATERIAL_BYTES,
  formatMaterialSize,
  sha256Hex,
  validateMaterialCandidate,
} from "../src/features/smartcourse/intake";
import {
  FIXTURE_GENERATION_ADAPTER,
  validateGeneratedObjects,
} from "../src/features/smartcourse/generation";
import {
  FREQUENCY_RESPONSE_MODEL,
  buildFrequencyResponseModel,
} from "../src/features/smartcourse/frequencyResponse";

describe("SmartCourse fixture workflow", () => {
  it("builds deterministic student and replay entry states for F-002", () => {
    const review = createSmartCourseEntryState("review");
    expect(review.step).toBe("review");
    expect(review.materialLoaded).toBe(true);
    expect(review.objects.every((object) => object.status === "review")).toBe(
      true,
    );

    const publish = createSmartCourseEntryState("publish");
    expect(publish.step).toBe("publish");
    expect(publish.publication).toBeNull();
    expect(
      publish.objects.some((object) => object.status === "approved"),
    ).toBe(true);
    expect(
      publish.objects.some((object) => object.status === "removed"),
    ).toBe(true);

    const student = createSmartCourseEntryState("student");
    expect(student.step).toBe("student");
    expect(student.publication?.id).toBe("published-sls-v1");
    expect(student.interaction).toBeNull();

    const replay = createSmartCourseEntryState("replay");
    expect(replay.step).toBe("replay");
    expect(replay.publication?.immutable).toBe(true);
    expect(replay.interaction).toMatchObject({
      selectedAnswer: "decrease",
      correct: true,
    });
  });

  it("keeps source, human review, publication and interaction auditable", () => {
    let state = loadAuthorizedFixture(createSmartCourseState());
    expect(state.sources).toHaveLength(3);
    expect(state.objects).toHaveLength(5);

    const quizId = "generated-sls-quiz-001";
    state = editTeachingObject(
      state,
      quizId,
      `${state.objects[0].body} 请说明你的判断依据。`,
    );
    state = approveTeachingObject(state, quizId);

    const removedId = "generated-sls-scene-001";
    state = selectTeachingObject(state, removedId);
    state = removeTeachingObject(
      state,
      removedId,
      "示例曲线尚未获得教师确认",
    );

    state = publishApprovedObjects(state);
    expect(state.publication?.objectIds).toEqual([quizId]);
    expect(
      state.publication?.objectSnapshots.every(
        (object) => object.status === "published",
      ),
    ).toBe(true);
    expect(state.objects.find((object) => object.id === removedId)?.status).toBe(
      "removed",
    );

    state = recordStudentInteraction(
      state,
      STUDENT_QUESTION.correctAnswer,
      STUDENT_QUESTION.correctAnswer,
    );
    expect(state.interaction?.correct).toBe(true);

    const progress = getAcceptanceProgress(state);
    expect(progress).toEqual({
      sourceReady: true,
      edited: true,
      approved: true,
      removed: true,
      published: true,
      interacted: true,
      replayReady: true,
    });
    expect(state.events.map((event) => event.action)).toEqual([
      "load_fixture",
      "edit",
      "approve",
      "remove",
      "publish",
      "student_interaction",
    ]);
  });

  it("blocks publication without an approved object", () => {
    const state = loadAuthorizedFixture(createSmartCourseState());
    expect(() => publishApprovedObjects(state)).toThrow(
      "At least one approved object",
    );
  });

  it("requires a removal reason and preserves removed content as non-publishable", () => {
    const state = loadAuthorizedFixture(createSmartCourseState());
    expect(() =>
      removeTeachingObject(state, "generated-sls-card-001", " "),
    ).toThrow("requires a reason");
  });

  it("recomputes the release candidate when a source becomes invalid", () => {
    let state = loadAuthorizedFixture(createSmartCourseState());
    state = approveTeachingObject(state, "generated-sls-quiz-001");
    state = setSourceValidity(state, "source-sls-slide-012", false);

    expect(() => publishApprovedObjects(state)).toThrow("valid sources");
    expect(state.events.at(-1)?.action).toBe("source_invalidated");

    state = setSourceValidity(state, "source-sls-slide-012", true);
    state = publishApprovedObjects(state);
    expect(state.publication?.objectIds).toEqual(["generated-sls-quiz-001"]);
    expect(
      state.events.some((event) => event.action === "source_restored"),
    ).toBe(true);
  });
});

describe("SmartCourse local material intake", () => {
  it("blocks unsupported, oversized and undeclared-rights files", () => {
    expect(
      validateMaterialCandidate({
        name: "notes.txt",
        size: 128,
        rightsDeclared: true,
      }),
    ).toMatchObject({ ok: false, code: "unsupported_format" });
    expect(
      validateMaterialCandidate({
        name: "lecture.pdf",
        size: MAX_MATERIAL_BYTES + 1,
        rightsDeclared: true,
      }),
    ).toMatchObject({ ok: false, code: "file_too_large" });
    expect(
      validateMaterialCandidate({
        name: "lecture.pdf",
        size: 128,
        rightsDeclared: false,
      }),
    ).toMatchObject({ ok: false, code: "rights_required" });
  });

  it("accepts the P0 format set and produces a stable local hash", async () => {
    expect(
      validateMaterialCandidate({
        name: "lecture.PPTX",
        size: 2_621_440,
        rightsDeclared: true,
      }),
    ).toEqual({ ok: true, format: "PPTX", sizeLabel: "2.5 MB" });
    expect(formatMaterialSize(1536)).toBe("1.5 KB");
    expect(await sha256Hex(new TextEncoder().encode("abc").buffer)).toBe(
      "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad",
    );
  });
});

describe("SmartCourse provider-neutral generation contract", () => {
  it("keeps the fixture adapter explicit and source-bounded", () => {
    const state = createSmartCourseState();
    const result = FIXTURE_GENERATION_ADAPTER.generate({
      courseId: state.material.courseId,
      sources: state.sources,
      seedObjects: state.objects,
    });
    expect(result.mode).toBe("fixture");
    expect(result.adapterId).toBe("fixture.smartcourse.v1");
    expect(result.fallbackReason).toContain("not configured");
    expect(result.objects).toHaveLength(5);
  });

  it("rejects adapter output that invents a source", () => {
    const state = createSmartCourseState();
    const invalid = structuredClone(state.objects);
    invalid[0].sourceIds = ["source-invented-by-model"];
    expect(() => validateGeneratedObjects(invalid, state.sources)).toThrow(
      "references invalid source",
    );
  });
});

describe("SmartCourse deterministic RC model court", () => {
  it("calculates a reproducible six-point response without claiming measurement data", () => {
    const model = FREQUENCY_RESPONSE_MODEL;

    expect(model.measured).toBe(false);
    expect(model.points).toHaveLength(6);
    expect(model.nominalCutoffHz).toBeCloseTo(1591.55, 2);
    expect(model.toleranceCutoffHz).toBeLessThan(model.nominalCutoffHz);
    expect(model.sourceIds).toEqual([
      "source-sls-slide-012",
      "source-sls-transcript-004",
      "source-sls-handout-003",
    ]);

    const cutoffPoint = model.points.find(
      (point) => point.frequencyHz === 1592,
    );
    expect(cutoffPoint?.idealMagnitudeDb).toBeCloseTo(-3.01, 2);
    expect(cutoffPoint?.capacitanceToleranceMagnitudeDb).toBeLessThan(
      cutoffPoint?.idealMagnitudeDb ?? 0,
    );
  });

  it("keeps frequency ordering and response monotonic for a custom sweep", () => {
    const model = buildFrequencyResponseModel([10, 100, 1_000, 10_000]);
    expect(model.points.map((point) => point.frequencyHz)).toEqual([
      10,
      100,
      1_000,
      10_000,
    ]);
    expect(
      model.points.every(
        (point, index, points) =>
          index === 0 ||
          point.idealMagnitudeDb < points[index - 1].idealMagnitudeDb,
      ),
    ).toBe(true);
  });
});

import { SMARTCOURSE_FIXTURE } from "./fixture";
import { FIXTURE_GENERATION_ADAPTER } from "./generation";
import type {
  AcceptanceProgress,
  ReviewEvent,
  SmartCourseState,
  SmartCourseStep,
  StudentInteraction,
  TeachingObject,
} from "./types";

const copyState = (): SmartCourseState =>
  structuredClone(SMARTCOURSE_FIXTURE);

const nowLabel = (sequence: number) =>
  `2026-07-24 10:${String(30 + sequence).padStart(2, "0")} CST`;

const appendEvent = (
  state: SmartCourseState,
  event: Omit<ReviewEvent, "id" | "occurredAt">,
): ReviewEvent[] => [
  ...state.events,
  {
    ...event,
    id: `event-${String(state.events.length + 1).padStart(3, "0")}`,
    occurredAt: nowLabel(state.events.length),
  },
];

const replaceObject = (
  state: SmartCourseState,
  object: TeachingObject,
): TeachingObject[] =>
  state.objects.map((candidate) =>
    candidate.id === object.id ? object : candidate,
  );

const requireObject = (state: SmartCourseState, objectId: string) => {
  const object = state.objects.find((candidate) => candidate.id === objectId);
  if (!object) throw new Error(`Unknown teaching object: ${objectId}`);
  return object;
};

export const createSmartCourseState = () => copyState();

export type SmartCourseEntryPoint =
  | "authoring"
  | "review"
  | "publish"
  | "student"
  | "replay";

export function loadAuthorizedFixture(
  state: SmartCourseState,
): SmartCourseState {
  if (state.material.rightsStatus !== "authorized_demo") {
    throw new Error("Material rights must be declared before generation.");
  }
  if (state.materialLoaded) return state;
  const generation = FIXTURE_GENERATION_ADAPTER.generate({
    courseId: state.material.courseId,
    sources: state.sources,
    seedObjects: state.objects,
  });

  return {
    ...state,
    materialLoaded: true,
    step: "review",
    objects: generation.objects,
    events: appendEvent(state, {
      objectId: state.material.id,
      action: "load_fixture",
      label: "已登记授权材料并提取 3 个可定位来源片段",
      actor: "teacher-fixture",
    }),
  };
}

export function selectTeachingObject(
  state: SmartCourseState,
  objectId: string,
): SmartCourseState {
  requireObject(state, objectId);
  return { ...state, selectedObjectId: objectId };
}

export function editTeachingObject(
  state: SmartCourseState,
  objectId: string,
  nextBody: string,
): SmartCourseState {
  const object = requireObject(state, objectId);
  if (object.status !== "review") {
    throw new Error("Only an object in review can be edited.");
  }
  if (!nextBody.trim()) throw new Error("Edited content cannot be empty.");

  const edited: TeachingObject = {
    ...object,
    body: nextBody.trim(),
    revision: object.revision + 1,
  };
  return {
    ...state,
    objects: replaceObject(state, edited),
    events: appendEvent(state, {
      objectId,
      action: "edit",
      label: `教师修改：${object.title}`,
      actor: "teacher-fixture",
      from: object.status,
      to: edited.status,
      before: object.body,
      after: edited.body,
    }),
  };
}

export function approveTeachingObject(
  state: SmartCourseState,
  objectId: string,
): SmartCourseState {
  const object = requireObject(state, objectId);
  if (object.status !== "review") {
    throw new Error("Only an object in review can be approved.");
  }
  if (
    object.sourceIds.length === 0 ||
    !object.sourceIds.every((sourceId) =>
      state.sources.some((source) => source.id === sourceId && source.valid),
    )
  ) {
    throw new Error("Approved content requires valid source fragments.");
  }

  const approved: TeachingObject = {
    ...object,
    status: "approved",
    revision: object.revision + 1,
  };
  return {
    ...state,
    objects: replaceObject(state, approved),
    events: appendEvent(state, {
      objectId,
      action: "approve",
      label: `教师通过：${object.title}`,
      actor: "teacher-fixture",
      from: object.status,
      to: approved.status,
    }),
  };
}

export function removeTeachingObject(
  state: SmartCourseState,
  objectId: string,
  reason: string,
): SmartCourseState {
  const object = requireObject(state, objectId);
  if (object.status !== "review") {
    throw new Error("Only an object in review can be removed.");
  }
  if (!reason.trim()) throw new Error("Removing content requires a reason.");

  const removed: TeachingObject = {
    ...object,
    status: "removed",
    revision: object.revision + 1,
  };
  return {
    ...state,
    objects: replaceObject(state, removed),
    events: appendEvent(state, {
      objectId,
      action: "remove",
      label: `教师移除：${object.title}`,
      actor: "teacher-fixture",
      from: object.status,
      to: removed.status,
      reason: reason.trim(),
    }),
  };
}

export function publishApprovedObjects(
  state: SmartCourseState,
): SmartCourseState {
  if (state.publication) return state;
  const approved = state.objects.filter(
    (object) =>
      object.status === "approved" &&
      object.sourceIds.every((sourceId) =>
        state.sources.some(
          (source) => source.id === sourceId && source.valid,
        ),
      ),
  );
  if (approved.length === 0) {
    throw new Error(
      "At least one approved object with valid sources is required to publish.",
    );
  }

  const publishedObjects = approved.map<TeachingObject>((object) => ({
    ...object,
    status: "published",
    revision: object.revision + 1,
  }));
  const publishedIds = new Set(publishedObjects.map((object) => object.id));
  const objects = state.objects.map(
    (object) =>
      publishedObjects.find((published) => published.id === object.id) ??
      object,
  );
  const publication = {
    id: "published-sls-v1",
    version: 1,
    publishedBy: "teacher-fixture",
    occurredAt: nowLabel(state.events.length),
    objectIds: [...publishedIds],
    objectSnapshots: structuredClone(publishedObjects),
    immutable: true as const,
  };

  return {
    ...state,
    step: "student",
    objects,
    publication,
    events: appendEvent(state, {
      objectId: publication.id,
      action: "publish",
      label: `已形成不可变发布版本 v${publication.version}，包含 ${publication.objectIds.length} 项`,
      actor: publication.publishedBy,
      from: "approved",
      to: "published",
    }),
  };
}

export function setSourceValidity(
  state: SmartCourseState,
  sourceId: string,
  valid: boolean,
): SmartCourseState {
  const source = state.sources.find((candidate) => candidate.id === sourceId);
  if (!source) throw new Error(`Unknown source fragment: ${sourceId}`);
  if (source.valid === valid) return state;

  return {
    ...state,
    sources: state.sources.map((candidate) =>
      candidate.id === sourceId ? { ...candidate, valid } : candidate,
    ),
    events: appendEvent(state, {
      objectId: sourceId,
      action: valid ? "source_restored" : "source_invalidated",
      label: valid
        ? `来源已恢复有效：${source.title}`
        : `来源已标记失效：${source.title}`,
      actor: "teacher-fixture",
      reason: valid
        ? "故障演练结束，恢复演示来源"
        : "发布门禁故障演练，不代表真实材料被撤回",
    }),
  };
}

export function recordStudentInteraction(
  state: SmartCourseState,
  selectedAnswer: string,
  correctAnswer: string,
): SmartCourseState {
  if (!state.publication) {
    throw new Error("Student interaction requires a published version.");
  }
  if (state.interaction) return state;

  const interaction: StudentInteraction = {
    id: "interaction-nan-001",
    actor: "student-nan-fixture",
    selectedAnswer,
    correct: selectedAnswer === correctAnswer,
    durationSeconds: 18,
    occurredAt: nowLabel(state.events.length),
  };
  return {
    ...state,
    step: "replay",
    interaction,
    events: appendEvent(state, {
      objectId: interaction.id,
      action: "student_interaction",
      label: `南同学提交理解检查：${interaction.correct ? "命中" : "待复盘"}`,
      actor: interaction.actor,
    }),
  };
}

export function getAcceptanceProgress(
  state: SmartCourseState,
): AcceptanceProgress {
  const hasAction = (action: ReviewEvent["action"]) =>
    state.events.some((event) => event.action === action);

  return {
    sourceReady: state.materialLoaded && state.sources.every((source) => source.valid),
    edited: hasAction("edit"),
    approved: hasAction("approve"),
    removed: hasAction("remove"),
    published: Boolean(state.publication),
    interacted: Boolean(state.interaction),
    replayReady: Boolean(state.publication && state.interaction),
  };
}

export function resetSmartCourseState(): SmartCourseState {
  return copyState();
}

/**
 * Builds the smallest valid F-001 state needed by another module.
 *
 * MyCareer calls this adapter instead of copying SmartCourse business state.
 * The deterministic fixture path also makes the cross-module jump repeatable
 * in an offline demo.
 */
export function createSmartCourseEntryState(
  entryPoint: SmartCourseEntryPoint,
): SmartCourseState {
  if (entryPoint === "authoring") return createSmartCourseState();

  let state = loadAuthorizedFixture(createSmartCourseState());
  if (entryPoint === "review") return { ...state, step: "review" };

  const quiz = state.objects.find((object) => object.kind === "quiz");
  const removable = state.objects.find((object) => object.kind === "scene");
  if (!quiz || !removable) {
    throw new Error("SmartCourse fixture is missing its P0 teaching objects.");
  }

  state = editTeachingObject(
    state,
    quiz.id,
    `${quiz.body} 请先写出公式，再选择答案。`,
  );
  state = approveTeachingObject(state, quiz.id);
  state = removeTeachingObject(
    state,
    removable.id,
    "跨模块演示只发布完成审核的理解检查；互动场景保留为未发布证据。",
  );
  if (entryPoint === "publish") return { ...state, step: "publish" };

  state = publishApprovedObjects(state);

  if (entryPoint === "replay") {
    state = recordStudentInteraction(state, "decrease", "decrease");
  }

  const step: SmartCourseStep =
    entryPoint === "replay" ? "replay" : "student";
  return { ...state, step };
}

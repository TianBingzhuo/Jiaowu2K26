export type SmartCourseStep =
  | "source"
  | "review"
  | "publish"
  | "student"
  | "replay";

export type ReviewStatus =
  | "draft"
  | "review"
  | "approved"
  | "removed"
  | "published";

export type EvidenceSignal = "S" | "A" | "B";

export type SourceFragment = {
  id: string;
  locator: string;
  sourceType: "slide" | "transcript" | "handout";
  title: string;
  quote: string;
  signal: EvidenceSignal;
  valid: boolean;
};

export type TeachingObject = {
  id: string;
  kind: "quiz" | "explanation" | "review_card" | "hint" | "scene";
  title: string;
  body: string;
  sourceIds: string[];
  evidenceStatus: "supported" | "partial" | "insufficient";
  unknowns: string[];
  generationMode: "fixture" | "model" | "rule";
  generatorVersion: string;
  status: ReviewStatus;
  revision: number;
};

export type ReviewEvent = {
  id: string;
  objectId: string;
  action:
    | "load_fixture"
    | "start_review"
    | "edit"
    | "approve"
    | "remove"
    | "publish"
    | "source_invalidated"
    | "source_restored"
    | "student_interaction";
  label: string;
  actor: string;
  from?: ReviewStatus;
  to?: ReviewStatus;
  before?: string;
  after?: string;
  reason?: string;
  occurredAt: string;
};

export type PublishedVersion = {
  id: string;
  version: number;
  publishedBy: string;
  occurredAt: string;
  objectIds: string[];
  objectSnapshots: TeachingObject[];
  immutable: true;
};

export type StudentInteraction = {
  id: string;
  actor: "student-nan-fixture";
  selectedAnswer: string;
  correct: boolean;
  durationSeconds: number;
  occurredAt: string;
};

export type SmartCourseState = {
  schemaVersion: "1.0.0";
  dataMode: "fixture";
  step: SmartCourseStep;
  materialLoaded: boolean;
  material: {
    id: string;
    courseId: string;
    title: string;
    filename: string;
    format: "PDF";
    sizeLabel: string;
    rightsStatus: "authorized_demo";
    sha256: string;
    uploadedBy: "teacher-fixture";
    parseStatus: "ready";
    retention: string;
  };
  sources: SourceFragment[];
  objects: TeachingObject[];
  selectedObjectId: string;
  events: ReviewEvent[];
  publication: PublishedVersion | null;
  interaction: StudentInteraction | null;
};

export type AcceptanceProgress = {
  sourceReady: boolean;
  edited: boolean;
  approved: boolean;
  removed: boolean;
  published: boolean;
  interacted: boolean;
  replayReady: boolean;
};

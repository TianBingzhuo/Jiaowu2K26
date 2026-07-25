export type ExamStep =
  | "calendar"
  | "briefing"
  | "warmup"
  | "playbook"
  | "match"
  | "replay"
  | "reflection";

export type NarrativeMode = "immersive" | "light" | "traditional";

export type ExamStatus =
  | "scheduled"
  | "briefing_open"
  | "warmup"
  | "exam_active"
  | "review"
  | "archived";

export type ExamSourceLink = {
  sourceId: string;
  coverage: string;
};

export type ExamEvent = {
  id: string;
  courseId: string;
  title: string;
  eventType: "warmup" | "quiz" | "midterm" | "final" | "project";
  scheduledAt: string;
  durationMinutes: number;
  status: ExamStatus;
  isFormal: boolean;
  sourceAuthority: "fixture";
};

export type Briefing = {
  scopeSummary: string;
  sources: ExamSourceLink[];
  competencyTargets: string[];
  availableResources: string[];
  readiness: {
    coveragePct: number;
    weakAreas: string[];
    unknownAreas: string[];
  };
};

export type WarmupQuestion = {
  id: string;
  objectId: string;
  prompt: string;
  options: Array<{ id: string; label: string }>;
  correctAnswer: string;
  explanation: string;
  sourceIds: string[];
};

export type PlaybookItem = {
  id: string;
  objectId: string;
  title: string;
  estimatedMinutes: number;
  sourceIds: string[];
};

export type PlaybookSection = {
  id: string;
  title: string;
  knowledgePoints: string[];
  items: PlaybookItem[];
};

export type MatchQuestion = {
  id: string;
  objectId: string;
  prompt: string;
  responseType: "single_choice" | "source_challenge";
  options: Array<{ id: string; label: string }>;
  correctAnswer: string;
  sourceIds: string[];
  aiTrace?: Array<{
    id: string;
    claim: string;
    sourceId: string;
    confidence: "high" | "medium" | "low" | "unsupported";
  }>;
};

export type ExamAnswer = {
  questionId: string;
  response: string;
  correct: boolean;
  sourceChecked: boolean;
  errorCategory: "conceptual" | "computational" | "careless" | "unknown" | null;
};

export type ExamTimelineEvent = {
  id: string;
  eventType:
    | "briefing_opened"
    | "warmup_answered"
    | "warmup_skipped"
    | "warmup_retried"
    | "playbook_adjusted"
    | "checkpoint_saved"
    | "match_started"
    | "source_checked"
    | "ai_claim_challenged"
    | "answer_submitted"
    | "match_finished"
    | "reflection_saved"
    | "archived";
  label: string;
  occurredAt: string;
  sourceIds: string[];
};

export type PostGameReflection = {
  worked: string;
  blocked: string;
  nextAdjustment: string;
  shareWithMentor: boolean;
  shareExpiresAt: string | null;
};

export type WorldExamFixture = {
  schemaVersion: "1.0.0";
  dataMode: "fixture";
  studentId: "student-nan-fixture";
  courseId: "signal-linear-systems";
  sourceBoundary: string;
  event: ExamEvent;
  briefing: Briefing;
  warmup: WarmupQuestion;
  playbook: PlaybookSection[];
  matchQuestions: MatchQuestion[];
};

export type WorldExamState = {
  schemaVersion: "1.0.0";
  dataMode: "fixture";
  step: ExamStep;
  narrativeMode: NarrativeMode;
  eventStatus: ExamStatus;
  warmupAnswer: string | null;
  warmupAttempts: number;
  completedPlaybookItemIds: string[];
  playbookOrder: string[];
  answers: ExamAnswer[];
  checkedSourceQuestionIds: string[];
  challengedClaimIds: string[];
  timeline: ExamTimelineEvent[];
  reflection: PostGameReflection;
  syncStatus: "synced" | "offline_cached" | "memory_fallback";
  pendingSyncCount: number;
};

export type ExamBoxScore = {
  completionPct: number;
  correctCount: number;
  totalQuestions: number;
  sourcesChecked: number;
  challengedClaims: number;
  errorCounts: {
    conceptual: number;
    computational: number;
    careless: number;
    unknown: number;
  };
};

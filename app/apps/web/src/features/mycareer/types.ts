export type CourseStatus =
  | "active"
  | "completed"
  | "dropped"
  | "attention"
  | "critical";

export type CourseRole = "required" | "elective" | "general";

export type LearningSession = {
  completionPct: number;
  correctCount: number;
  totalQuestions: number;
  durationSeconds: number;
  completedAt: string;
};

export type DemoDeadline = {
  id: string;
  courseId: string;
  title: string;
  dueAt: string;
  sourceRef: string;
  authority: "fixture";
};

export type DemoCourse = {
  id: string;
  code: string;
  title: string;
  credits: number;
  role: CourseRole;
  schedule: string;
  status: CourseStatus;
  progressPct: number;
  nextAction: string;
  linkedPublishedId: string | null;
  lastSession: LearningSession | null;
  topics: readonly string[];
  evidenceSummary: string;
  demoQuestion: string;
  analysisSteps: readonly [string, string, string];
  nextMove: string;
  sourceRef: string;
};

export type DemoSeason = {
  id: string;
  label: string;
  seasonNumber: number;
  totalSeasons: number;
  stage: "undergraduate" | "master" | "doctoral";
  startDate: string;
  endDate: string;
  authority: "fixture";
  sourceBoundary: string;
  updatedAt: string;
  heroCourseId: string;
  courses: readonly DemoCourse[];
  deadlines: readonly DemoDeadline[];
  opportunity: {
    title: string;
    detail: string;
    sourceRef: string;
  };
  progress: {
    courseProgress: number;
    completedGoals: number;
    totalGoals: number;
    milestones: number;
    careerLevel: number;
    careerLevelProgress: number;
  };
};

export type LearningSummary =
  | {
      state: "ready";
      completionPct: number;
      accuracyPct: number;
      durationLabel: string;
      completedAt: string;
    }
  | {
      state: "not_started";
      label: "尚未开始学习";
    };

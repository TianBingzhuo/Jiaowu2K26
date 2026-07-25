export type RosterStep =
  | "editor"
  | "compare"
  | "whatif"
  | "unsat"
  | "transaction";

export type Weekday = "Mon" | "Tue" | "Wed" | "Thu" | "Fri";

export type TimeSlot = {
  weekday: Weekday;
  start: string;
  end: string;
  room: string;
};

export type Offering = {
  id: string;
  instructor: string;
  modality: "in_person" | "hybrid";
  capacity: number;
  enrolled: number;
  timeSlots: TimeSlot[];
};

export type CourseSpec = {
  id: string;
  code: string;
  title: string;
  credits: number;
  role: "required" | "elective" | "general_ed" | "lab";
  department: string;
  attributes: string[];
  offeredSemesters: string[];
  prerequisites: Array<{
    courseId: string;
    relation: "before" | "concurrent";
  }>;
  corequisites: string[];
  substitutes: string[];
  exclusions: string[];
  offerings: Offering[];
  catalogVersion: string;
};

export type SemesterPrefix = {
  id: string;
  studentId: "student-nan-fixture";
  version: number;
  completed: Array<{
    courseId: string;
    semester: string;
    creditsEarned: number;
  }>;
  inProgress: Array<{
    courseId: string;
    semester: string;
    status: "enrolled" | "auditing";
  }>;
  planned: Array<{
    courseId: string;
    offeringId: string;
    targetSemester: string;
    priority: number;
  }>;
  dropped: Array<{
    courseId: string;
    semester: string;
    reason: string;
  }>;
  totalCreditsEarned: number;
};

export type Pin = {
  id: string;
  type:
    | "required_course"
    | "lab_section"
    | "time_block"
    | "qualification"
    | "personal_commitment";
  courseId: string | null;
  offeringId: string | null;
  timeSlot: TimeSlot | null;
  semester: string;
  lockReason: string;
  lockedBy: "student" | "advisor" | "system";
};

export type PreferenceProfile = {
  timeOfDay: "morning" | "daytime" | "late";
  compactness: 0 | 1 | 2 | 3;
  variety: 0 | 1 | 2 | 3;
  stability: 0 | 1 | 2 | 3;
};

export type GoalId =
  | "hard_constraints"
  | "graduation_progress"
  | "minimal_change"
  | "personal_preference"
  | "minimal_gaps";

export type PlanTemplate = {
  id: string;
  label: string;
  strategy: string;
  selections: Array<{ courseId: string; offeringId: string }>;
};

export type PlanCourse = {
  courseId: string;
  offeringId: string;
  code: string;
  title: string;
  role: CourseSpec["role"];
  credits: number;
  timeSlots: TimeSlot[];
  pinned: boolean;
  pinReason: string | null;
};

export type PlanTradeoff = {
  impact: "positive" | "negative" | "neutral";
  title: string;
  detail: string;
};

export type PlanRisk = {
  severity: "low" | "medium" | "high";
  description: string;
};

export type ConstraintViolation = {
  type:
    | "prerequisite"
    | "time_conflict"
    | "credit_limit"
    | "capacity"
    | "exclusion"
    | "pin";
  courseIds: string[];
  description: string;
};

export type SemesterPlan = {
  id: string;
  label: string;
  strategy: string;
  semester: string;
  courses: PlanCourse[];
  totalCredits: number;
  hardConstraintsMet: boolean;
  preferenceScore: number;
  migrationCost: number;
  tradeoffs: PlanTradeoff[];
  risks: PlanRisk[];
  solverBackend: "deterministic_heuristic_fixture";
  violations: ConstraintViolation[];
  isSimulation: boolean;
  inputFingerprint: string;
};

export type TransactionAction = {
  type: "add" | "drop" | "swap";
  courseId: string;
  code: string;
  title: string;
  oldOffering: string | null;
  newOffering: string | null;
  creditChange: number;
  risk: string | null;
  formalStep: string;
};

export type SemesterTransaction = {
  id: string;
  fromPrefixId: string;
  toPlanId: string;
  actions: TransactionAction[];
  netCreditChange: number;
  impactSummary: string;
  isFormalSubmission: false;
};

export type UnsatisfiableExplanation = {
  requestId: string;
  minimalConflictSet: ConstraintViolation[];
  blockingChain: Array<{ step: number; description: string }>;
  relaxableItems: Array<{
    item: string;
    impactIfRelaxed: string;
    alternativeCourseIds: string[];
  }>;
};

export type WhatIfChanges = {
  branchName: string;
  addCourseIds: string[];
  removeCourseIds: string[];
  blockedTimeSlots: TimeSlot[];
  changeMajor: string | null;
};

export type SemesterLock = {
  schemaVersion: "1.0.0";
  dataMode: "fixture";
  id: string;
  studentId: "student-nan-fixture";
  semester: string;
  catalogVersion: string;
  prefixVersion: number;
  pinIds: string[];
  preferences: PreferenceProfile;
  goalOrder: GoalId[];
  solverBackend: "deterministic_heuristic_fixture";
  selectedPlanId: string;
  inputFingerprint: string;
  createdAt: string;
  isFormalEnrollment: false;
  sourceBoundary: string;
};

export type RosterTimelineEvent = {
  id: string;
  eventType:
    | "prefix_reviewed"
    | "pin_changed"
    | "goals_reordered"
    | "solved"
    | "plan_selected"
    | "what_if_created"
    | "unsat_explained"
    | "lock_saved";
  label: string;
  occurredAt: string;
};

export type RosterFixture = {
  schemaVersion: "1.0.0";
  dataMode: "fixture";
  studentId: "student-nan-fixture";
  semester: "2026-Fall";
  catalogVersion: string;
  sourceBoundary: string;
  creditRange: { min: number; max: number };
  catalog: CourseSpec[];
  prefix: SemesterPrefix;
  pins: Pin[];
  preferences: PreferenceProfile;
  goalOrder: GoalId[];
  planTemplates: PlanTemplate[];
};

export type RosterLabState = {
  schemaVersion: "1.0.0";
  dataMode: "fixture";
  step: RosterStep;
  activePinIds: string[];
  preferences: PreferenceProfile;
  goalOrder: GoalId[];
  plans: SemesterPlan[];
  selectedPlanId: string | null;
  simulation: {
    changes: WhatIfChanges;
    plans: SemesterPlan[];
    selectedPlanId: string | null;
  } | null;
  unsat: UnsatisfiableExplanation | null;
  savedLock: SemesterLock | null;
  timeline: RosterTimelineEvent[];
};

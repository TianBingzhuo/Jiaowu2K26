export type CoachStage =
  | "profile"
  | "scouting"
  | "versions"
  | "feedback"
  | "team"
  | "governance";

export type EvidenceTier =
  | "teacher_confirmed"
  | "official_syllabus"
  | "historical_version"
  | "student_aggregate"
  | "system_inference";

export type FeedbackDimension =
  | "assignment_clarity"
  | "feedback_timeliness"
  | "workload_support"
  | "group_structure"
  | "accessibility";

export type GovernanceReportType =
  | "harassment"
  | "misinformation"
  | "privacy"
  | "discrimination";

export interface EvidenceSource {
  id: string;
  tier: EvidenceTier;
  label: string;
  owner: string;
  version: string;
  updatedAt: string;
  expiresAt: string | null;
  correctionRoute: string;
  verified: boolean;
}

export interface SourcedField {
  id: string;
  label: string;
  value: string;
  sourceId: string;
  effectiveTerm: string;
}

export interface AssessmentPart {
  label: string;
  weight: number;
  sourceId: string;
}

export interface CourseProfile {
  id: string;
  courseId: string;
  offeringId: string;
  term: string;
  title: string;
  instructorId: string;
  instructorAssignmentId: string;
  instructorDisplayName: string;
  summary: SourcedField;
  objectives: SourcedField[];
  assessments: AssessmentPart[];
  textbooks: SourcedField[];
  prerequisites: SourcedField[];
  updatedAt: string;
}

export interface TeachingActivity {
  id: string;
  label: string;
  share: number;
  frequency: string;
  sourceId: string;
}

export interface TeachingStructure {
  offeringId: string;
  activities: TeachingActivity[];
  homeworkFrequency: SourcedField;
  feedbackMethod: SourcedField;
  groupShare: SourcedField;
}

export interface OfficeHours {
  id: string;
  instructorAssignmentId: string;
  schedule: string;
  location: string;
  appointmentMethod: string;
  suitableTopics: string[];
  accessibility: string[];
  sourceId: string;
  updatedAt: string;
  expiresAt: string;
  status: "active" | "expired";
}

export interface WorkloadRange {
  id: string;
  label: string;
  minimum: number;
  maximum: number;
  unit: "hours_per_week";
  sampleSize: number | null;
  minimumSample: number | null;
  timeRange: string;
  sourceId: string;
  publishable: boolean;
  caveat: string;
}

export interface ScoutingReport {
  offeringId: string;
  preparedFor: SourcedField[];
  challenges: SourcedField[];
  actions: SourcedField[];
  unknowns: SourcedField[];
}

export interface CourseVersion {
  id: string;
  courseId: string;
  offeringId: string;
  term: string;
  instructorId: string;
  instructorAssignmentId: string;
  profileVersion: string;
  assessmentSummary: string;
  teachingSummary: string;
  sourceIds: string[];
}

export interface VersionChange {
  id: string;
  field: string;
  before: string;
  after: string;
  sourceIds: string[];
}

export interface VersionComparison {
  fromVersionId: string;
  toVersionId: string;
  sameInstructorAssignment: boolean;
  feedbackCarriedForward: false;
  changes: VersionChange[];
  warning: string;
}

export interface CorrectionCase {
  id: string;
  targetId: string;
  requestedBy: "teacher_fixture";
  type: "context" | "update" | "dispute";
  statement: string;
  evidenceIds: string[];
  status: "submitted" | "in_review" | "accepted" | "rejected";
  createdAt: string;
  reviewDueAt: string;
  history: Array<{
    status: CorrectionCase["status"];
    occurredAt: string;
    note: string;
  }>;
}

export interface FeedbackSubmission {
  id: string;
  offeringId: string;
  dimension: FeedbackDimension;
  concreteExperience: string;
  suggestedAction: string;
  consentToAggregate: boolean;
  safetyStatus: "eligible" | "held_for_review";
  createdAt: string;
}

export interface FeedbackAggregate {
  id: string;
  offeringId: string;
  dimension: FeedbackDimension;
  sampleSize: number;
  minimumSample: number;
  timeRange: string;
  summary: string;
  suggestedAction: string;
  sourceId: string;
  published: boolean;
}

export interface FairnessCheck {
  id: string;
  label: string;
  passed: boolean;
  detail: string;
}

export interface FairnessAudit {
  id: string;
  status: "not_run" | "pass" | "degraded";
  sortMode: "explainable_match" | "time_and_topic";
  checks: FairnessCheck[];
  sensitiveAttributes: string[];
  proxyFields: string[];
  ranAt: string | null;
}

export interface TeamProfileField {
  id: string;
  label: string;
  kind: "skill" | "availability" | "communication" | "sensitive";
  value: string;
  selectable: boolean;
  private: true;
}

export interface TeamNeed {
  id: string;
  offeringId: string;
  projectTitle: string;
  roleGap: string;
  skills: string[];
  hoursPerWeek: number;
  communication: string[];
  sourceIds: string[];
}

export interface TeamMatch {
  teamNeedId: string;
  status: "ready_to_discuss" | "needs_confirmation" | "insufficient_data";
  reasons: string[];
  conflicts: string[];
  unknowns: string[];
  usedFieldIds: string[];
  usedSensitiveAttributes: false;
}

export interface AdvisorHandoff {
  id: string;
  offeringId: string;
  questions: string[];
  evidenceIds: string[];
  scenarioIds: string[];
  consentConfirmed: boolean;
  status: "draft" | "ready_for_student" | "shared_externally";
  advisorResponse: null;
  createdAt: string;
}

export interface ExpectationReminder {
  id: string;
  offeringId: string;
  type: "equipment" | "material" | "attendance" | "safety";
  title: string;
  detail: string;
  dueAt: string;
  sourceId: string;
  required: boolean;
}

export interface GovernanceCase {
  id: string;
  reportType: GovernanceReportType;
  targetId: string;
  evidence: string;
  serious: boolean;
  temporaryMeasure: "none" | "hidden_pending_review";
  status: "submitted" | "under_review" | "resolved" | "rejected";
  createdAt: string;
  reviewDueAt: string;
}

export interface CoachAuditEvent {
  id: string;
  sequence: number;
  action: string;
  targetId: string;
  detail: string;
  occurredAt: string;
  previousEventHash: string | null;
  eventHash: string;
}

export interface CoachScoutingFixture {
  schemaVersion: "1.0.0";
  dataMode: "demo_fixture";
  generatedAt: string;
  lastUpdatedAt: string;
  course: CourseProfile;
  sources: EvidenceSource[];
  teaching: TeachingStructure;
  officeHours: OfficeHours[];
  workload: WorkloadRange[];
  scouting: ScoutingReport;
  versions: CourseVersion[];
  feedbackAggregates: FeedbackAggregate[];
  teamFields: TeamProfileField[];
  teamNeeds: TeamNeed[];
  reminders: ExpectationReminder[];
  audit: CoachAuditEvent[];
  invariants: {
    noTeacherRating: true;
    noPersonalityLabels: true;
    separateCourseAndTeacher: true;
    noFeedbackCarryForward: true;
    minimumFeedbackSample: number;
    noSensitiveTeamMatching: true;
    noFabricatedAdvisorReply: true;
    severeContentHiddenFirst: true;
  };
}

export interface CoachScoutingState {
  stage: CoachStage;
  fixture: CoachScoutingFixture;
  traditional: boolean;
  reducedMotion: boolean;
  offline: boolean;
  selectedVersionId: string;
  versionComparison: VersionComparison | null;
  correctionCases: CorrectionCase[];
  feedbackSubmissions: FeedbackSubmission[];
  fairnessAudit: FairnessAudit;
  selectedTeamFieldIds: string[];
  teamMatches: TeamMatch[];
  advisorHandoff: AdvisorHandoff | null;
  acknowledgedReminderIds: string[];
  governanceCases: GovernanceCase[];
  hiddenTargetIds: string[];
  audit: CoachAuditEvent[];
}

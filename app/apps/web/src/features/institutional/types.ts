import type { AiAdvice, AiTask } from "../../lib/api";
import type { RoleId } from "../roles/types";

export type InstitutionalRole = Exclude<RoleId, "student">;

export type AssignedStudent = {
  id: string;
  displayName: string;
  program: string;
  season: string;
  consentScope: string;
  openCaseCount: number;
};

export type AdvisorCaseStatus =
  | "received"
  | "awaiting_student"
  | "accepted_for_review"
  | "referred"
  | "closed";

export type AdvisorCase = {
  id: string;
  studentId: string;
  type: "accessibility" | "course_overload" | "study_path";
  title: string;
  receivedAt: string;
  dueAt: string;
  status: AdvisorCaseStatus;
  request: string;
  nextStep: string;
  purpose: string;
  permittedFields: string[];
  prohibitedFields: string[];
  sourceIds: string[];
};

export type TeachingWorkItem = {
  id: string;
  title: string;
  lane: "content_review" | "teaching_experiment" | "research_direction";
  status: "needs_evidence" | "ready_for_teacher" | "experiment_staged";
  hypothesis: string;
  evidence: string[];
  sourceIds: string[];
};

export type CurriculumChange = {
  id: string;
  title: string;
  currentRule: string;
  proposedRule: string;
  affectedStudents: number;
  capacityDelta: string;
  crossCollegeDependency: string;
  rollbackPoint: string;
  status: "sandbox" | "submitted_for_review" | "needs_revision";
  sourceIds: string[];
};

export type GovernanceCase = {
  id: string;
  title: string;
  version: string;
  affectedGroups: Array<{ label: string; impact: string; unknown: string }>;
  approvalChain: Array<{
    owner: string;
    state: "ready" | "waiting" | "blocked";
    reason: string;
  }>;
  rollbackCondition: string;
  status: "impact_review" | "revision_requested" | "advanced" | "rolled_back";
  sourceIds: string[];
};

export type InstitutionalAuditEvent = {
  id: string;
  action: string;
  targetId: string;
  detail: string;
  occurredAt: string;
};

export type InstitutionalState = {
  assignedStudents: AssignedStudent[];
  advisorCases: AdvisorCase[];
  selectedStudentId: string;
  selectedCaseId: string;
  teachingItems: TeachingWorkItem[];
  selectedTeachingItemId: string;
  curriculumChanges: CurriculumChange[];
  selectedCurriculumChangeId: string;
  governanceCases: GovernanceCase[];
  selectedGovernanceCaseId: string;
  audit: InstitutionalAuditEvent[];
  advice: AiAdvice | null;
  adviceState: "idle" | "loading" | "ready" | "error";
  message: string;
};

export type InstitutionalAdviceContext = {
  task: AiTask;
  subject: string;
  question: string;
  facts: Array<{ label: string; value: string; source_id: string }>;
};

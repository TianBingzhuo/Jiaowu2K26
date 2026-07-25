import coursePackJson from "../../../../../fixtures/v1/sls-240-course-pack.demo.json";

export type CourseKnowledgeNode = {
  id: string;
  title: string;
  kind: "concept" | "procedure" | "evidence" | "boundary";
  prerequisite_ids: string[];
  explanation: string;
  misconception: string;
  check: string;
  source_refs: string[];
};

export type CoursePack = {
  schema_version: "1.0.0";
  data_mode: "public_safe_demo";
  course: {
    id: "signal-linear-systems";
    code: "SLS 240";
    title_zh: string;
    title_en: string;
    goal: string;
    source_boundary: string;
  };
  source_coverage: {
    original_files: 6;
    structured_files: 6;
    visually_reviewed_pages: 65;
    reviewed_pages_total: 65;
    read_depth: string;
    privacy_exclusions: string[];
    audit_ids: string[];
  };
  teaching_loop: Array<{ id: string; label: string; purpose: string }>;
  units: Array<{
    id: string;
    title: string;
    why: string;
    objectives: string[];
    lessons: Array<{
      id: string;
      title: string;
      duration_minutes: number;
      sequence: string[];
    }>;
    knowledge_nodes: CourseKnowledgeNode[];
  }>;
  season_plan: Array<{
    week: number;
    phase: string;
    title: string;
    guiding_question: string;
    sessions: [
      { mode: "briefing" | "workshop" | "replay"; title: string },
      { mode: "briefing" | "workshop" | "replay"; title: string },
      { mode: "briefing" | "workshop" | "replay"; title: string },
    ];
    evidence: string;
    checkpoint: string;
    source_refs: string[];
  }>;
  labs: Array<{
    id: string;
    title: string;
    deliverable: string;
    evidence: string[];
    safety: string;
  }>;
  assessments: Array<{
    id: string;
    title: string;
    mode: string;
    checks: string[];
    feedback: string;
  }>;
  invariants: {
    original_courseware_copied: false;
    private_identity_included: false;
    manual_answer_save_required: false;
    formal_grade_impact: false;
    teacher_review_required: true;
  };
};

export const SLS_240_COURSE_PACK = coursePackJson as CoursePack;

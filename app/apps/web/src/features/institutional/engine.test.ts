import { describe, expect, it } from "vitest";
import {
  buildAdviceContext,
  createInstitutionalState,
  selectAssignedStudent,
  submitCurriculumChange,
  updateAdvisorCase,
  updateGovernanceCase,
} from "./engine";

describe("institutional role engines", () => {
  it("switches assigned students without exposing another student's cases", () => {
    const next = selectAssignedStudent(createInstitutionalState(), "student-lin-fixture");
    expect(next.selectedStudentId).toBe("student-lin-fixture");
    expect(next.selectedCaseId).toBe("case-overload-003");
  });

  it("receives and routes an advisor application instead of sending one", () => {
    const next = updateAdvisorCase(createInstitutionalState(), "accepted_for_review");
    expect(next.advisorCases[0]?.status).toBe("accepted_for_review");
    expect(next.audit.at(-1)?.action).toBe("advisor_case_accepted_for_review");
    expect(next.message).toContain("不是批准");
  });

  it("keeps curriculum submission in human review", () => {
    const next = submitCurriculumChange(createInstitutionalState());
    expect(next.curriculumChanges[0]?.status).toBe("submitted_for_review");
    expect(next.message).toContain("正式版本未改变");
  });

  it("blocks policy advancement while an approval node is blocked", () => {
    const next = updateGovernanceCase(createInstitutionalState(), "advance");
    expect(next.governanceCases[0]?.status).toBe("impact_review");
    expect(next.message).toContain("不能推进");
  });

  it("builds role-specific, source-bound AI context", () => {
    const context = buildAdviceContext(createInstitutionalState(), "advisor");
    expect(context.task).toBe("student_support_case");
    expect(context.facts.every((fact) => fact.source_id.length > 0)).toBe(true);
  });
});

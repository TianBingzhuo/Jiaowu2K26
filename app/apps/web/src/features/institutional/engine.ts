import { INSTITUTIONAL_FIXTURE } from "./fixture";
import type {
  AdvisorCaseStatus,
  GovernanceCase,
  InstitutionalAdviceContext,
  InstitutionalAuditEvent,
  InstitutionalRole,
  InstitutionalState,
} from "./types";

const clone = <T>(value: T): T => structuredClone(value);

export const createInstitutionalState = (): InstitutionalState =>
  clone(INSTITUTIONAL_FIXTURE);

function appendAudit(
  state: InstitutionalState,
  action: string,
  targetId: string,
  detail: string,
): InstitutionalState {
  const sequence = state.audit.length + 1;
  const event: InstitutionalAuditEvent = {
    id: `institutional-event-${String(sequence).padStart(3, "0")}`,
    action,
    targetId,
    detail,
    occurredAt: `2026-07-24T21:${String(sequence).padStart(2, "0")}:00+08:00`,
  };
  return { ...state, audit: [...state.audit, event] };
}

export function selectAssignedStudent(
  state: InstitutionalState,
  studentId: string,
): InstitutionalState {
  const firstCase = state.advisorCases.find((item) => item.studentId === studentId);
  if (!state.assignedStudents.some((item) => item.id === studentId) || !firstCase) {
    return { ...state, message: "未找到授权学生或可见 Case，当前状态未改变。" };
  }
  return {
    ...state,
    selectedStudentId: studentId,
    selectedCaseId: firstCase.id,
    advice: null,
    adviceState: "idle",
    message: "已切换授权学生；只显示当前职责范围内的申请与回执。",
  };
}

export function selectAdvisorCase(
  state: InstitutionalState,
  caseId: string,
): InstitutionalState {
  const selectedCase = state.advisorCases.find((item) => item.id === caseId);
  if (!selectedCase) return state;
  return {
    ...state,
    selectedStudentId: selectedCase.studentId,
    selectedCaseId: caseId,
    advice: null,
    adviceState: "idle",
    message: `已打开 ${selectedCase.title}。`,
  };
}

export function updateAdvisorCase(
  state: InstitutionalState,
  status: AdvisorCaseStatus,
): InstitutionalState {
  const selectedCase = state.advisorCases.find(
    (item) => item.id === state.selectedCaseId,
  );
  if (!selectedCase) return state;
  const allowed: Record<AdvisorCaseStatus, AdvisorCaseStatus[]> = {
    received: ["awaiting_student", "accepted_for_review", "referred"],
    awaiting_student: ["accepted_for_review", "closed"],
    accepted_for_review: ["awaiting_student", "referred", "closed"],
    referred: ["closed"],
    closed: [],
  };
  if (!allowed[selectedCase.status].includes(status)) {
    return {
      ...state,
      message: `不能从 ${selectedCase.status} 直接变更为 ${status}；未写入 Replay。`,
    };
  }
  const next = {
    ...state,
    advisorCases: state.advisorCases.map((item) =>
      item.id === selectedCase.id ? { ...item, status } : item,
    ),
    message:
      status === "awaiting_student"
        ? "已生成最小材料补充请求；不会暗中读取其他数据。"
        : status === "accepted_for_review"
          ? "已受理进入人工复核；这不是批准无障碍、超修或选课决定。"
          : status === "referred"
            ? "已创建最小范围转介；谈话与诊断内容不会回传。"
            : "Case 已由责任人关闭，并保留本人纠错入口。",
  };
  return appendAudit(next, `advisor_case_${status}`, selectedCase.id, next.message);
}

export function stageTeachingExperiment(
  state: InstitutionalState,
): InstitutionalState {
  const selected = state.teachingItems.find(
    (item) => item.id === state.selectedTeachingItemId,
  );
  if (!selected) return state;
  if (selected.status === "needs_evidence") {
    return {
      ...state,
      message: "证据门未通过：先补齐来源、版本与教师修改记录。",
    };
  }
  const next = {
    ...state,
    teachingItems: state.teachingItems.map((item) =>
      item.id === selected.id ? { ...item, status: "experiment_staged" as const } : item,
    ),
    message: "教学实验已进入沙盒：限定一周、可退出、不修改正式评分。",
  };
  return appendAudit(next, "teaching_experiment_staged", selected.id, next.message);
}

export function submitCurriculumChange(
  state: InstitutionalState,
): InstitutionalState {
  const selected = state.curriculumChanges.find(
    (item) => item.id === state.selectedCurriculumChangeId,
  );
  if (!selected) return state;
  const next = {
    ...state,
    curriculumChanges: state.curriculumChanges.map((item) =>
      item.id === selected.id
        ? { ...item, status: "submitted_for_review" as const }
        : item,
    ),
    message: "影响包已提交人工评审；培养方案正式版本未改变。",
  };
  return appendAudit(next, "curriculum_submitted", selected.id, next.message);
}

export function updateGovernanceCase(
  state: InstitutionalState,
  action: "request_revision" | "advance" | "rollback",
): InstitutionalState {
  const selected = state.governanceCases.find(
    (item) => item.id === state.selectedGovernanceCaseId,
  );
  if (!selected) return state;
  const status: GovernanceCase["status"] =
    action === "request_revision"
      ? "revision_requested"
      : action === "advance"
        ? "advanced"
        : "rolled_back";
  if (
    action === "advance" &&
    selected.approvalChain.some((step) => step.state === "blocked")
  ) {
    return {
      ...state,
      message: "不能推进：审批链仍有阻塞未知项；系统不会替责任部门补猜。",
    };
  }
  const next = {
    ...state,
    governanceCases: state.governanceCases.map((item) =>
      item.id === selected.id ? { ...item, status } : item,
    ),
    message:
      action === "request_revision"
        ? "已退回责任部门补充证据，正式规则未改变。"
        : action === "advance"
          ? "影响包已推进下一人工节点，尚未发布。"
          : "沙盒已回滚至已知版本，正式系统未发生写入。",
  };
  return appendAudit(next, `governance_${action}`, selected.id, next.message);
}

export function buildAdviceContext(
  state: InstitutionalState,
  role: InstitutionalRole,
): InstitutionalAdviceContext {
  if (role === "advisor") {
    const selected = state.advisorCases.find((item) => item.id === state.selectedCaseId);
    if (!selected) throw new Error("缺少选中的 Case。");
    return {
      task: "student_support_case",
      subject: selected.title,
      question: "在不越权、不推断敏感信息的前提下，下一步如何处理？",
      facts: [
        { label: "学生请求", value: selected.request, source_id: selected.sourceIds[0] },
        { label: "当前状态", value: selected.status, source_id: selected.sourceIds[0] },
        {
          label: "用途边界",
          value: selected.purpose,
          source_id: selected.sourceIds.at(-1) ?? selected.sourceIds[0],
        },
      ],
    };
  }
  if (role === "teacher") {
    const selected = state.teachingItems.find(
      (item) => item.id === state.selectedTeachingItemId,
    );
    if (!selected) throw new Error("缺少选中的教学工作项。");
    return {
      task: "teaching_improvement",
      subject: selected.title,
      question: "请提出一个可逆、可验证且不伤害学生的下一轮教学实验。",
      facts: [
        { label: "改进假设", value: selected.hypothesis, source_id: selected.sourceIds[0] },
        {
          label: "现有证据",
          value: selected.evidence.join("；"),
          source_id: selected.sourceIds.at(-1) ?? selected.sourceIds[0],
        },
      ],
    };
  }
  if (role === "program_lead") {
    const selected = state.curriculumChanges.find(
      (item) => item.id === state.selectedCurriculumChangeId,
    );
    if (!selected) throw new Error("缺少选中的培养方案变更。");
    return {
      task: "curriculum_impact",
      subject: selected.title,
      question: "请指出进入正式评审前必须补齐的影响证据和回滚条件。",
      facts: [
        {
          label: "规则变更",
          value: `${selected.currentRule} → ${selected.proposedRule}`,
          source_id: selected.sourceIds[0],
        },
        {
          label: "影响与依赖",
          value: `${selected.affectedStudents} 人；${selected.crossCollegeDependency}`,
          source_id: selected.sourceIds.at(-1) ?? selected.sourceIds[0],
        },
      ],
    };
  }
  const selected = state.governanceCases.find(
    (item) => item.id === state.selectedGovernanceCaseId,
  );
  if (!selected) throw new Error("缺少选中的治理 Case。");
  return {
    task: "policy_impact",
    subject: selected.title,
    question: "请找出政策影响包中的未知项、受影响群体与不可省略的人工审批节点。",
    facts: [
      {
        label: "受影响群体",
        value: selected.affectedGroups.map((item) => item.label).join("、"),
        source_id: selected.sourceIds[0],
      },
      {
        label: "审批状态",
        value: selected.approvalChain
          .map((step) => `${step.owner}:${step.state}`)
          .join("；"),
        source_id: selected.sourceIds.at(-1) ?? selected.sourceIds[0],
      },
    ],
  };
}

export function buildClientRulesFallback(
  context: InstitutionalAdviceContext,
): InstitutionalState["advice"] {
  const sourceIds = context.facts.map((fact) => fact.source_id);
  return {
    mode: "rules_fallback",
    provider: "university2k26-web-rules",
    model: "deterministic-v1",
    title: "先关掉未知项，再推进下一回合",
    summary:
      "AI 暂时没接上；这份本地备选只负责核对用途、资料版本、未知项和责任人。",
    suggestions: [
      {
        title: "最小可逆动作",
        rationale: "避免在证据不足时把建议变成正式决定。",
        next_step: "先请求缺失材料或运行沙盒 What-if，并保留拒绝与回滚入口。",
        source_ids: sourceIds,
      },
    ],
    caveats: ["这不是大模型输出。", "不构成任何学校正式决定。"],
    source_ids: sourceIds,
    formal_decision: false,
    generated_at: "2026-07-24T21:00:00+08:00",
  };
}

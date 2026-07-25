import { useEffect, useMemo, useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import {
  ArrowLeft24Regular,
  ArrowRight24Regular,
  BranchFork24Regular,
  CheckmarkCircle24Filled,
  DataBarVertical24Regular,
  DocumentSearch24Regular,
  HatGraduation24Regular,
  Person24Regular,
  PersonFeedback24Regular,
  ShieldCheckmark24Regular,
  Sparkle24Regular,
  Warning24Regular,
} from "@fluentui/react-icons";
import {
  getAiStatus,
  requestAiAdvice,
  type AiGatewayStatus,
} from "../../lib/api";
import {
  buildAdviceContext,
  buildClientRulesFallback,
  createInstitutionalState,
  selectAdvisorCase,
  selectAssignedStudent,
  stageTeachingExperiment,
  submitCurriculumChange,
  updateAdvisorCase,
  updateGovernanceCase,
} from "./engine";
import type {
  AdvisorCaseStatus,
  InstitutionalRole,
  InstitutionalState,
} from "./types";
import "./institutional.css";

type InstitutionalStudioProps = {
  role: InstitutionalRole;
  backendLabel: string;
  onExit: () => void;
};

const ROLE_COPY: Record<
  InstitutionalRole,
  { mode: string; title: string; subtitle: string; accent: string }
> = {
  teacher: {
    mode: "COACH STUDIO",
    title: "课程设计与教学改进",
    subtitle: "审核内容、运行可逆教学实验、积累可解释的教学与科研证据",
    accent: "blue",
  },
  advisor: {
    mode: "PLAYER DEVELOPMENT",
    title: "学生申请与支持 Case Desk",
    subtitle: "接收本人申请、切换管辖学生、最小披露转介；不是代替学生发送申请",
    accent: "teal",
  },
  program_lead: {
    mode: "PROGRAM FRONT OFFICE",
    title: "培养方案与课程依赖实验室",
    subtitle: "先在沙盒检查前后置、容量、跨院依赖与毕业路径，再进入正式审批",
    accent: "gold",
  },
  undergraduate_office: {
    mode: "LEAGUE OFFICE",
    title: "校级课程治理与政策影响台",
    subtitle: "先看哪些人会受影响、还有什么不知道、出了问题怎样退回；AI 只递建议，不替学校拍板",
    accent: "violet",
  },
};

const CASE_STATUS: Record<AdvisorCaseStatus, string> = {
  received: "新申请",
  awaiting_student: "待学生补充",
  accepted_for_review: "已受理复核",
  referred: "已最小转介",
  closed: "已关闭",
};

function SourceChips({ sources }: { sources: string[] }) {
  return (
    <div className="institutional-source-chips" aria-label="来源 ID">
      {sources.map((source) => (
        <code key={source}>{source}</code>
      ))}
    </div>
  );
}

function AdvisorDesk({
  state,
  setState,
}: {
  state: InstitutionalState;
  setState: Dispatch<SetStateAction<InstitutionalState>>;
}) {
  const visibleCases = state.advisorCases.filter(
    (item) => item.studentId === state.selectedStudentId,
  );
  const selected =
    state.advisorCases.find((item) => item.id === state.selectedCaseId) ??
    visibleCases[0];

  return (
    <div className="institutional-workspace institutional-workspace--advisor">
      <section className="institutional-roster" aria-labelledby="assigned-students-heading">
        <header>
          <span>
            <small>01 · ASSIGNED ROSTER</small>
            <h2 id="assigned-students-heading">管辖学生</h2>
          </span>
          <b>{state.assignedStudents.length} 位演示学生</b>
        </header>
        <div className="institutional-student-grid">
          {state.assignedStudents.map((student) => (
            <button
              type="button"
              key={student.id}
              className={student.id === state.selectedStudentId ? "is-active" : ""}
              aria-pressed={student.id === state.selectedStudentId}
              onClick={() => setState((current) => selectAssignedStudent(current, student.id))}
              data-focusable="true"
            >
              <Person24Regular aria-hidden="true" />
              <span>
                <strong>{student.displayName}</strong>
                <small>{student.program} · {student.season}</small>
                <em>{student.consentScope}</em>
              </span>
              <b>{student.openCaseCount}</b>
            </button>
          ))}
        </div>
      </section>

      <section className="institutional-inbox" aria-labelledby="case-inbox-heading">
        <header>
          <span>
            <small>02 · RECEIVED APPLICATIONS</small>
            <h2 id="case-inbox-heading">收到的申请与转介</h2>
          </span>
          <b>{visibleCases.length} 项</b>
        </header>
        <div className="institutional-case-list">
          {visibleCases.map((item) => (
            <button
              type="button"
              key={item.id}
              className={item.id === selected?.id ? "is-active" : ""}
              onClick={() => setState((current) => selectAdvisorCase(current, item.id))}
              data-focusable="true"
            >
              <span>
                <small>{item.type.replaceAll("_", " ").toUpperCase()}</small>
                <strong>{item.title}</strong>
                <em>{item.receivedAt} 收到 · {CASE_STATUS[item.status]}</em>
              </span>
              <ArrowRight24Regular aria-hidden="true" />
            </button>
          ))}
        </div>
      </section>

      {selected && (
        <section className="institutional-detail" aria-labelledby="case-detail-heading">
          <header>
            <span>
              <small>03 · CASE BRIEFING</small>
              <h2 id="case-detail-heading">{selected.title}</h2>
            </span>
            <b>{CASE_STATUS[selected.status]}</b>
          </header>
          <div className="institutional-brief-grid">
            <article>
              <small>学生主动请求</small>
              <p>{selected.request}</p>
            </article>
            <article>
              <small>建议下一步</small>
              <p>{selected.nextStep}</p>
            </article>
            <article className="is-wide">
              <small>用途边界</small>
              <p>{selected.purpose}</p>
            </article>
          </div>
          <div className="institutional-boundary-grid">
            <div>
              <strong><ShieldCheckmark24Regular aria-hidden="true" /> 本次可见</strong>
              <ul>{selected.permittedFields.map((item) => <li key={item}>{item}</li>)}</ul>
            </div>
            <div>
              <strong><Warning24Regular aria-hidden="true" /> 不要越过这些范围</strong>
              <ul>{selected.prohibitedFields.map((item) => <li key={item}>{item}</li>)}</ul>
            </div>
          </div>
          <SourceChips sources={selected.sourceIds} />
          <div className="institutional-actions">
            <button
              type="button"
              onClick={() => setState((current) => updateAdvisorCase(current, "accepted_for_review"))}
              data-focusable="true"
            >
              <CheckmarkCircle24Filled aria-hidden="true" /> 受理人工复核
            </button>
            <button
              type="button"
              onClick={() => setState((current) => updateAdvisorCase(current, "awaiting_student"))}
              data-focusable="true"
            >
              <DocumentSearch24Regular aria-hidden="true" /> 请求补充材料
            </button>
            <button
              type="button"
              onClick={() => setState((current) => updateAdvisorCase(current, "referred"))}
              data-focusable="true"
            >
              <PersonFeedback24Regular aria-hidden="true" /> 最小范围转介
            </button>
          </div>
        </section>
      )}
    </div>
  );
}

function TeacherStudio({
  state,
  setState,
}: {
  state: InstitutionalState;
  setState: Dispatch<SetStateAction<InstitutionalState>>;
}) {
  const selected =
    state.teachingItems.find((item) => item.id === state.selectedTeachingItemId) ??
    state.teachingItems[0];
  return (
    <div className="institutional-workspace institutional-workspace--teacher">
      <section className="institutional-lane-board">
        <header>
          <span><small>01 · COACH QUEUE</small><h2>教学、内容与科研三条赛道</h2></span>
          <b>不生成教师 OVR</b>
        </header>
        <div className="institutional-work-list">
          {state.teachingItems.map((item) => (
            <button
              type="button"
              key={item.id}
              className={item.id === selected?.id ? "is-active" : ""}
              onClick={() =>
                setState((current) => ({
                  ...current,
                  selectedTeachingItemId: item.id,
                  advice: null,
                  adviceState: "idle",
                  message: `已打开 ${item.title}。`,
                }))
              }
              data-focusable="true"
            >
              <span>{item.lane.replaceAll("_", " ")}</span>
              <strong>{item.title}</strong>
              <small>{item.status.replaceAll("_", " ")}</small>
            </button>
          ))}
        </div>
      </section>
      {selected && (
        <section className="institutional-detail">
          <header>
            <span><small>02 · TEACHING FILM ROOM</small><h2>{selected.title}</h2></span>
            <b>{selected.status.replaceAll("_", " ")}</b>
          </header>
          <div className="institutional-hypothesis">
            <Sparkle24Regular aria-hidden="true" />
            <span><small>待验证假设</small><strong>{selected.hypothesis}</strong></span>
          </div>
          <ul className="institutional-evidence-list">
            {selected.evidence.map((item) => (
              <li key={item}><DocumentSearch24Regular aria-hidden="true" />{item}</li>
            ))}
          </ul>
          <SourceChips sources={selected.sourceIds} />
          <div className="institutional-actions">
            <button
              type="button"
              onClick={() => setState(stageTeachingExperiment)}
              data-focusable="true"
            >
              <BranchFork24Regular aria-hidden="true" /> 进入一周教学实验
            </button>
            <button
              type="button"
              onClick={() =>
                setState((current) => ({
                  ...current,
                  message: "已生成补证清单：来源、版本、教师修改、观察窗口与退出条件。",
                }))
              }
              data-focusable="true"
            >
              <DocumentSearch24Regular aria-hidden="true" /> 生成补证清单
            </button>
          </div>
        </section>
      )}
      <section className="institutional-role-specific">
        <header><span><small>03 · FACULTY PORTFOLIO</small><h2>晋升材料只收可核验贡献</h2></span></header>
        <div className="institutional-card-grid">
          <article><strong>课程设计</strong><p>版本化目标—活动—考核对齐记录，由教师选择是否纳入档案。</p></article>
          <article><strong>教学改进</strong><p>假设、实验窗口、学生退出权、结果与复盘，不把满意度变成人格分。</p></article>
          <article><strong>科研发展</strong><p>公开方向、合作边界、资源与证据缺口；不承诺论文、项目或晋升结果。</p></article>
        </div>
      </section>
    </div>
  );
}

function CurriculumLab({
  state,
  setState,
}: {
  state: InstitutionalState;
  setState: Dispatch<SetStateAction<InstitutionalState>>;
}) {
  const selected =
    state.curriculumChanges.find(
      (item) => item.id === state.selectedCurriculumChangeId,
    ) ?? state.curriculumChanges[0];
  return (
    <div className="institutional-workspace institutional-workspace--program">
      <section className="institutional-lane-board">
        <header><span><small>01 · CURRICULUM VERSIONS</small><h2>培养方案沙盒</h2></span><b>WIP 1</b></header>
        <div className="institutional-work-list">
          {state.curriculumChanges.map((item) => (
            <button
              type="button"
              key={item.id}
              className={item.id === selected?.id ? "is-active" : ""}
              onClick={() =>
                setState((current) => ({
                  ...current,
                  selectedCurriculumChangeId: item.id,
                  advice: null,
                  adviceState: "idle",
                  message: `已载入 ${item.title} What-if。`,
                }))
              }
              data-focusable="true"
            >
              <span>{item.status.replaceAll("_", " ")}</span>
              <strong>{item.title}</strong>
              <small>{item.affectedStudents} 条演示路径受影响</small>
            </button>
          ))}
        </div>
      </section>
      {selected && (
        <section className="institutional-detail">
          <header><span><small>02 · PREREQUISITE IMPACT</small><h2>{selected.title}</h2></span><b>{selected.status}</b></header>
          <div className="institutional-change-table" role="table" aria-label="规则变更对照">
            <div role="row"><strong role="rowheader">当前规则</strong><span role="cell">{selected.currentRule}</span></div>
            <div role="row"><strong role="rowheader">候选规则</strong><span role="cell">{selected.proposedRule}</span></div>
            <div role="row"><strong role="rowheader">路径影响</strong><span role="cell">{selected.affectedStudents} 名演示学生</span></div>
            <div role="row"><strong role="rowheader">容量变化</strong><span role="cell">{selected.capacityDelta}</span></div>
            <div role="row"><strong role="rowheader">跨院依赖</strong><span role="cell">{selected.crossCollegeDependency}</span></div>
            <div role="row"><strong role="rowheader">回滚点</strong><span role="cell">{selected.rollbackPoint}</span></div>
          </div>
          <SourceChips sources={selected.sourceIds} />
          <div className="institutional-actions">
            <button type="button" onClick={() => setState(submitCurriculumChange)} data-focusable="true">
              <CheckmarkCircle24Filled aria-hidden="true" /> 提交人工评审
            </button>
            <button
              type="button"
              onClick={() =>
                setState((current) => ({
                  ...current,
                  message: `已对比 ${selected.rollbackPoint}；正式目录与学籍记录未写入。`,
                }))
              }
              data-focusable="true"
            >
              <BranchFork24Regular aria-hidden="true" /> 对比回滚版本
            </button>
          </div>
        </section>
      )}
      <section className="institutional-role-specific">
        <header><span><small>03 · PROGRAM LOADOUT</small><h2>课程序列与资源检查</h2></span></header>
        <div className="institutional-card-grid">
          <article><strong>MATH 201 → SLS 240</strong><p>先修、并修支持与诊断替代三条路径分别建模。</p></article>
          <article><strong>SLS 240 → Capstone</strong><p>知识节点、实验时段和课程版本需要互相对得上。</p></article>
          <article><strong>跨院容量</strong><p>未知容量保持未知，不把历史均值伪装成未来承诺。</p></article>
        </div>
      </section>
    </div>
  );
}

function GovernanceDesk({
  state,
  setState,
}: {
  state: InstitutionalState;
  setState: Dispatch<SetStateAction<InstitutionalState>>;
}) {
  const selected =
    state.governanceCases.find((item) => item.id === state.selectedGovernanceCaseId) ??
    state.governanceCases[0];
  if (!selected) return null;
  return (
    <div className="institutional-workspace institutional-workspace--office">
      <section className="institutional-detail">
        <header>
          <span><small>01 · GOVERNANCE INBOX</small><h2>{selected.title}</h2></span>
          <b>{selected.version}</b>
        </header>
        <div className="institutional-impact-table" role="table" aria-label="受影响群体">
          <div className="is-heading" role="row">
            <strong role="columnheader">群体</strong>
            <strong role="columnheader">候选影响</strong>
            <strong role="columnheader">仍未知</strong>
          </div>
          {selected.affectedGroups.map((group) => (
            <div role="row" key={group.label}>
              <strong role="rowheader">{group.label}</strong>
              <span role="cell">{group.impact}</span>
              <span role="cell">{group.unknown}</span>
            </div>
          ))}
        </div>
      </section>
      <section className="institutional-approval-chain">
        <header><span><small>02 · ACCOUNTABILITY CHAIN</small><h2>审批链与阻塞原因</h2></span><b>{selected.status}</b></header>
        <ol>
          {selected.approvalChain.map((step) => (
            <li key={step.owner} className={`is-${step.state}`}>
              {step.state === "ready" ? <CheckmarkCircle24Filled aria-hidden="true" /> : <Warning24Regular aria-hidden="true" />}
              <span><strong>{step.owner}</strong><small>{step.reason}</small></span>
              <em>{step.state}</em>
            </li>
          ))}
        </ol>
        <div className="institutional-rollback">
          <BranchFork24Regular aria-hidden="true" />
          <span><small>ROLLBACK CONDITION</small><strong>{selected.rollbackCondition}</strong></span>
        </div>
        <SourceChips sources={selected.sourceIds} />
        <div className="institutional-actions">
          <button type="button" onClick={() => setState((current) => updateGovernanceCase(current, "request_revision"))} data-focusable="true">
            <DocumentSearch24Regular aria-hidden="true" /> 退回补证
          </button>
          <button type="button" onClick={() => setState((current) => updateGovernanceCase(current, "advance"))} data-focusable="true">
            <ArrowRight24Regular aria-hidden="true" /> 推进下一节点
          </button>
          <button type="button" onClick={() => setState((current) => updateGovernanceCase(current, "rollback"))} data-focusable="true">
            <BranchFork24Regular aria-hidden="true" /> 回滚沙盒
          </button>
        </div>
      </section>
    </div>
  );
}

function AiTacticsBoard({
  state,
  gateway,
  onRun,
}: {
  state: InstitutionalState;
  gateway: AiGatewayStatus | null;
  onRun: () => void;
}) {
  return (
    <section className="institutional-ai" aria-labelledby="ai-tactics-heading">
      <header>
        <span>
          <small>AI · SOURCE-BOUND TACTICS</small>
          <h2 id="ai-tactics-heading">AI 战术助手</h2>
        </span>
        <b className={gateway?.configured ? "is-model" : "is-rules"}>
          {gateway
            ? gateway.configured
              ? `${gateway.provider} · ${gateway.model}`
              : "本地方案待命"
            : "检查中"}
        </b>
      </header>
      <p>
        AI 只会看到当前演示工作项和列出的来源。密钥留在服务端；批准申请、改成绩和发布政策仍由责任人完成。
      </p>
      <button
        type="button"
        onClick={onRun}
        disabled={state.adviceState === "loading"}
        data-focusable="true"
      >
        <Sparkle24Regular aria-hidden="true" />
        {state.adviceState === "loading" ? "正在生成并校验来源…" : "生成下一回合建议"}
      </button>
      {state.advice && (
        <div className="institutional-ai-result" aria-live="polite">
          <div>
            <small>
              {state.advice.mode === "model" ? "AI 建议" : "本地备选"} ·{" "}
              {state.advice.provider} / {state.advice.model}
            </small>
            <h3>{state.advice.title}</h3>
            <p>{state.advice.summary}</p>
          </div>
          <ol>
            {state.advice.suggestions.map((suggestion) => (
              <li key={`${suggestion.title}-${suggestion.next_step}`}>
                <strong>{suggestion.title}</strong>
                <span>{suggestion.rationale}</span>
                <em>{suggestion.next_step}</em>
                <SourceChips sources={suggestion.source_ids} />
              </li>
            ))}
          </ol>
          <ul className="institutional-caveats">
            {state.advice.caveats.map((item) => <li key={item}>{item}</li>)}
          </ul>
        </div>
      )}
    </section>
  );
}

export function InstitutionalStudio({
  role,
  backendLabel,
  onExit,
}: InstitutionalStudioProps) {
  const [state, setState] = useState(createInstitutionalState);
  const [gateway, setGateway] = useState<AiGatewayStatus | null>(null);
  const copy = ROLE_COPY[role];
  const roleIcon = useMemo(
    () =>
      role === "advisor"
        ? PersonFeedback24Regular
        : role === "teacher"
          ? HatGraduation24Regular
          : role === "program_lead"
            ? BranchFork24Regular
            : DataBarVertical24Regular,
    [role],
  );
  const RoleIcon = roleIcon;

  useEffect(() => {
    let active = true;
    getAiStatus()
      .then((status) => {
        if (active) setGateway(status);
      })
      .catch(() => {
        if (active) {
          setGateway({
            configured: false,
            provider: "university2k26-web-rules",
            model: "deterministic-v1",
            credential_source: "not_available",
            local_first_supported: true,
            detail: "后台暂时没接上；先使用清楚标注的本地方案。",
          });
        }
      });
    return () => {
      active = false;
    };
  }, []);

  const runAi = async () => {
    const context = buildAdviceContext(state, role);
    setState((current) => ({
      ...current,
      adviceState: "loading",
      advice: null,
      message: "AI 正在阅读当前工作项；如果没接上，就改用本地备选。",
    }));
    try {
      const advice = await requestAiAdvice({
        ...context,
        locale: "zh-CN",
      });
      setState((current) => ({
        ...current,
        advice,
        adviceState: "ready",
        message:
          advice.mode === "model"
            ? "AI 建议已经返回，列出的来源也核对过了；还需要责任人审核。"
            : "这次使用的是本地备选，页面没有把它冒充成模型回答。",
      }));
    } catch {
      setState((current) => ({
        ...current,
        advice: buildClientRulesFallback(context),
        adviceState: "ready",
        message: "AI 暂时没接上，已经换成本地备选；不会拿它冒充模型回答。",
      }));
    }
  };

  return (
    <main
      className={`institutional-shell institutional-accent--${copy.accent}`}
      aria-labelledby="institutional-heading"
    >
      <header className="institutional-topbar">
        <button type="button" onClick={onExit} data-focusable="true">
          <ArrowLeft24Regular aria-hidden="true" /> 返回角色首页
        </button>
        <div>
          <span>UNIVERSITY<span>2K26</span></span>
          <b>{copy.mode}</b>
        </div>
        <em>{backendLabel}</em>
      </header>

      <section className="institutional-hero">
        <RoleIcon aria-hidden="true" />
        <div>
          <small>当前角色工作台 · 演示</small>
          <h1 id="institutional-heading">{copy.title}</h1>
          <p>{copy.subtitle}</p>
        </div>
        <aside>
          <ShieldCheckmark24Regular aria-hidden="true" />
          <span><strong>权限不是皮肤</strong><small>角色、组织、用途与时限共同约束</small></span>
        </aside>
      </section>

      {role === "advisor" && <AdvisorDesk state={state} setState={setState} />}
      {role === "teacher" && <TeacherStudio state={state} setState={setState} />}
      {role === "program_lead" && <CurriculumLab state={state} setState={setState} />}
      {role === "undergraduate_office" && <GovernanceDesk state={state} setState={setState} />}

      <AiTacticsBoard state={state} gateway={gateway} onRun={runAi} />

      <footer className="institutional-status" role="status">
        <DocumentSearch24Regular aria-hidden="true" />
        <span>{state.message}</span>
        <em>{state.audit.length} 条操作记录</em>
      </footer>
    </main>
  );
}

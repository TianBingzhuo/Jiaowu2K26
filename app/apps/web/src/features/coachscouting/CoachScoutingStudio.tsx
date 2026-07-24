import { useEffect, useMemo, useState } from "react";
import {
  Accessibility24Regular,
  Alert24Regular,
  ArrowLeft24Regular,
  ArrowSync24Regular,
  Board24Regular,
  BookOpen24Regular,
  CalendarClock24Regular,
  CheckmarkCircle24Filled,
  ChatHelp24Regular,
  CloudOff24Regular,
  DataBarVertical24Regular,
  DocumentSearch24Regular,
  Edit24Regular,
  EyeOff24Regular,
  Flag24Regular,
  History24Regular,
  Info24Regular,
  LockClosed24Regular,
  PeopleTeam24Regular,
  Person24Regular,
  PersonFeedback24Regular,
  QuestionCircle24Regular,
  Send24Regular,
  ShieldCheckmark24Regular,
  ShieldError24Regular,
  Warning24Regular,
} from "@fluentui/react-icons";
import {
  acknowledgeExpectation,
  buildAdvisorHandoff,
  coachBoxScore,
  compareCourseVersions,
  createCoachScoutingState,
  evidenceSource,
  publishableFeedback,
  reportGovernanceIssue,
  reviewTeacherCorrection,
  runCoachFairnessAudit,
  runTeamMatching,
  setCoachOffline,
  setCoachPreferences,
  setCoachStage,
  submitStructuredFeedback,
  submitTeacherCorrection,
  toggleTeamProfileField,
} from "./engine";
import {
  clearCoachState,
  loadCoachState,
  saveCoachState,
} from "./storage";
import type {
  CoachScoutingState,
  CoachStage,
  EvidenceTier,
  FeedbackDimension,
  SourcedField,
} from "./types";
import "./coachscouting.css";

type CoachScoutingStudioProps = {
  backendLabel: string;
  onExit: () => void;
};

const STAGES: Array<{
  id: CoachStage;
  label: string;
  traditional: string;
  icon: typeof BookOpen24Regular;
}> = [
  {
    id: "profile",
    label: "Profile Deck",
    traditional: "课程资料",
    icon: BookOpen24Regular,
  },
  {
    id: "scouting",
    label: "Scouting Report",
    traditional: "准备与预期",
    icon: DocumentSearch24Regular,
  },
  {
    id: "versions",
    label: "Version Film",
    traditional: "版本比较",
    icon: History24Regular,
  },
  {
    id: "feedback",
    label: "Feedback Huddle",
    traditional: "反馈与公平",
    icon: PersonFeedback24Regular,
  },
  {
    id: "team",
    label: "Squad & Advisor",
    traditional: "组队与咨询",
    icon: PeopleTeam24Regular,
  },
  {
    id: "governance",
    label: "Governance Replay",
    traditional: "治理与回放",
    icon: ShieldCheckmark24Regular,
  },
];

const SOURCE_LABEL: Record<EvidenceTier, string> = {
  teacher_confirmed: "教师确认",
  official_syllabus: "官方大纲",
  historical_version: "历史版本",
  student_aggregate: "学生自愿汇总",
  system_inference: "系统推断",
};

const FEEDBACK_LABEL: Record<FeedbackDimension, string> = {
  assignment_clarity: "任务清晰度",
  feedback_timeliness: "反馈时效",
  workload_support: "工作量支持",
  group_structure: "组队结构",
  accessibility: "可访问性",
};

const MATCH_LABEL = {
  ready_to_discuss: "可继续沟通",
  needs_confirmation: "需要确认",
  insufficient_data: "信息不足",
} as const;

function SourceBadge({
  state,
  sourceId,
}: {
  state: CoachScoutingState;
  sourceId: string;
}) {
  const source = evidenceSource(state, sourceId);
  return (
    <span
      className={`coach-source-badge is-${source.tier}`}
      title={`${source.owner} · ${source.version} · ${source.updatedAt}`}
    >
      <DocumentSearch24Regular aria-hidden="true" />
      {SOURCE_LABEL[source.tier]}
    </span>
  );
}

function SourcedList({
  state,
  items,
}: {
  state: CoachScoutingState;
  items: SourcedField[];
}) {
  return (
    <ul className="coach-sourced-list">
      {items.map((item) => (
        <li key={item.id}>
          <span>{item.value}</span>
          <SourceBadge state={state} sourceId={item.sourceId} />
        </li>
      ))}
    </ul>
  );
}

function SectionHeading({
  eyebrow,
  title,
  detail,
}: {
  eyebrow: string;
  title: string;
  detail: string;
}) {
  return (
    <header className="coach-section-heading">
      <span>{eyebrow}</span>
      <h2>{title}</h2>
      <p>{detail}</p>
    </header>
  );
}

export function CoachScoutingStudio({
  backendLabel,
  onExit,
}: CoachScoutingStudioProps) {
  const [state, setState] = useState(loadCoachState);
  const [toast, setToast] = useState("");
  const [feedbackDimension, setFeedbackDimension] =
    useState<FeedbackDimension>("feedback_timeliness");
  const [feedbackExperience, setFeedbackExperience] = useState(
    "实验报告的返回时间在两次任务之间差异较大。",
  );
  const [feedbackAction, setFeedbackAction] = useState(
    "在任务发布时同时说明预计反馈窗口。",
  );
  const [feedbackConsent, setFeedbackConsent] = useState(true);

  useEffect(() => {
    saveCoachState(state);
  }, [state]);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [state.stage]);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(""), 2800);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const apply = (
    operation: (current: CoachScoutingState) => CoachScoutingState,
    successMessage: string,
  ) => {
    try {
      setState(operation(state));
      setToast(successMessage);
    } catch (error) {
      setToast(error instanceof Error ? error.message : "操作未完成。");
    }
  };

  const stageIndex = STAGES.findIndex((item) => item.id === state.stage);
  const feedback = useMemo(() => publishableFeedback(state), [state]);
  const boxScore = useMemo(() => coachBoxScore(state), [state]);
  const activeOfficeHours = state.fixture.officeHours.find(
    (item) => item.status === "active",
  );

  const reset = () => {
    clearCoachState();
    setState(createCoachScoutingState());
    setToast("F-007 Fixture 已重置；权威系统未发生变化。");
  };

  const renderProfile = () => (
    <div className="coach-stage-grid coach-stage-grid--profile">
      <section className="coach-card coach-profile-hero">
        <span className="coach-card__kicker">F007-01 · COURSE PROFILE</span>
        <div className="coach-profile-identity">
          <div>
            <strong>{state.fixture.course.courseId}</strong>
            <span>{state.fixture.course.term}</span>
          </div>
          <div>
            <h2>{state.fixture.course.title}</h2>
            <p>
              课程、教师和本学期任教关系分别登记；页面不会把课程特征写成教师人格。
            </p>
          </div>
        </div>
        <div className="coach-profile-assignment">
          <Person24Regular aria-hidden="true" />
          <div>
            <span>本学期任教关系 · Fixture</span>
            <strong>{state.fixture.course.instructorDisplayName}</strong>
            <small>{state.fixture.course.instructorAssignmentId}</small>
          </div>
          <span className="coach-integrity-chip">
            <ShieldCheckmark24Regular aria-hidden="true" />
            无教师评分
          </span>
        </div>
        <article className="coach-sourced-copy">
          <SourceBadge
            state={state}
            sourceId={state.fixture.course.summary.sourceId}
          />
          <p>{state.fixture.course.summary.value}</p>
        </article>
        <div className="coach-profile-columns">
          <article>
            <h3>学习目标</h3>
            <SourcedList state={state} items={state.fixture.course.objectives} />
          </article>
          <article>
            <h3>材料与先修</h3>
            <SourcedList
              state={state}
              items={[
                ...state.fixture.course.textbooks,
                ...state.fixture.course.prerequisites,
              ]}
            />
          </article>
        </div>
      </section>

      <section className="coach-card coach-assessment-card">
        <span className="coach-card__kicker">F007-01 / 02 · STRUCTURE</span>
        <h2>考核与教学结构</h2>
        <div className="coach-assessment-list">
          {state.fixture.course.assessments.map((assessment) => (
            <article key={assessment.label}>
              <header>
                <strong>{assessment.label}</strong>
                <span>{assessment.weight}%</span>
              </header>
              <div
                className="coach-meter"
                role="progressbar"
                aria-label={`${assessment.label}占比`}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={assessment.weight}
              >
                <span style={{ width: `${assessment.weight}%` }} />
              </div>
              <SourceBadge state={state} sourceId={assessment.sourceId} />
            </article>
          ))}
        </div>
        <div className="coach-activity-grid">
          {state.fixture.teaching.activities.map((activity) => (
            <article key={activity.id}>
              <strong>{activity.share}%</strong>
              <span>{activity.label}</span>
              <small>{activity.frequency}</small>
              <SourceBadge state={state} sourceId={activity.sourceId} />
            </article>
          ))}
        </div>
      </section>

      <section className="coach-card coach-office-card">
        <span className="coach-card__kicker">F007-03 · OFFICE HOURS</span>
        <h2>Office Hours</h2>
        {activeOfficeHours && (
          <article className="coach-office-current">
            <CalendarClock24Regular aria-hidden="true" />
            <div>
              <strong>{activeOfficeHours.schedule}</strong>
              <span>{activeOfficeHours.location}</span>
              <small>{activeOfficeHours.appointmentMethod}</small>
            </div>
            <SourceBadge state={state} sourceId={activeOfficeHours.sourceId} />
          </article>
        )}
        <div className="coach-tag-list">
          {activeOfficeHours?.suitableTopics.map((topic) => (
            <span key={topic}>{topic}</span>
          ))}
        </div>
        <div className="coach-accessibility-note">
          <Accessibility24Regular aria-hidden="true" />
          <span>{activeOfficeHours?.accessibility.join(" · ")}</span>
        </div>
        {state.fixture.officeHours
          .filter((item) => item.status === "expired")
          .map((item) => (
            <article className="coach-expired-row" key={item.id}>
              <Warning24Regular aria-hidden="true" />
              <span>
                已过期 · {item.schedule} · {item.location}
              </span>
              <SourceBadge state={state} sourceId={item.sourceId} />
            </article>
          ))}
      </section>

      <section className="coach-card coach-workload-card">
        <span className="coach-card__kicker">F007-04 · WORKLOAD RANGE</span>
        <h2>工作量区间</h2>
        <div className="coach-workload-list">
          {state.fixture.workload.map((item) => (
            <article
              className={item.publishable ? "" : "is-insufficient"}
              key={item.id}
            >
              <header>
                <strong>{item.label}</strong>
                <span>
                  {item.publishable
                    ? `${item.minimum}–${item.maximum} 小时 / 周`
                    : "样本不足 · 不公开区间"}
                </span>
              </header>
              <small>
                {item.sampleSize === null
                  ? item.timeRange
                  : `N=${item.sampleSize} / 阈值 ${item.minimumSample} · ${item.timeRange}`}
              </small>
              <p>{item.caveat}</p>
              <SourceBadge state={state} sourceId={item.sourceId} />
            </article>
          ))}
        </div>
      </section>

      <section className="coach-card coach-source-legend">
        <span className="coach-card__kicker">F007-06 · SOURCE LADDER</span>
        <h2>五级来源不会混在一起</h2>
        {state.fixture.sources.map((source) => (
          <article key={source.id}>
            <SourceBadge state={state} sourceId={source.id} />
            <div>
              <strong>{source.owner}</strong>
              <span>{source.version}</span>
              <small>
                更新 {source.updatedAt.slice(0, 10)}
                {source.expiresAt
                  ? ` · 到期 ${source.expiresAt.slice(0, 10)}`
                  : " · 历史归档"}
              </small>
            </div>
          </article>
        ))}
      </section>
    </div>
  );

  const renderScouting = () => (
    <>
      <SectionHeading
        eyebrow="F007-05 / 13 · SCOUTING REPORT"
        title={state.traditional ? "准备、挑战与下一步" : "Scouting Report"}
        detail="描述课程特征和可行动准备，不预测个人成败，也不评价教师人格。"
      />
      <div className="coach-quadrant-grid">
        {[
          {
            id: "prepared",
            label: "适合的准备",
            icon: CheckmarkCircle24Filled,
            items: state.fixture.scouting.preparedFor,
          },
          {
            id: "challenges",
            label: "可能挑战",
            icon: Warning24Regular,
            items: state.fixture.scouting.challenges,
          },
          {
            id: "actions",
            label: "建议动作",
            icon: Send24Regular,
            items: state.fixture.scouting.actions,
          },
          {
            id: "unknowns",
            label: "未知",
            icon: QuestionCircle24Regular,
            items: state.fixture.scouting.unknowns,
          },
        ].map((quadrant) => {
          const Icon = quadrant.icon;
          return (
            <section className={`coach-card coach-quadrant is-${quadrant.id}`} key={quadrant.id}>
              <header>
                <Icon aria-hidden="true" />
                <h2>{quadrant.label}</h2>
              </header>
              <SourcedList state={state} items={quadrant.items} />
            </section>
          );
        })}
      </div>
      <section className="coach-card coach-reminder-panel">
        <span className="coach-card__kicker">EXPECTATION BOARD</span>
        <h2>开课前预期提醒</h2>
        <div className="coach-reminder-grid">
          {state.fixture.reminders.map((reminder) => {
            const acknowledged = state.acknowledgedReminderIds.includes(
              reminder.id,
            );
            return (
              <article key={reminder.id}>
                <div>
                  {reminder.type === "safety" ? (
                    <ShieldError24Regular aria-hidden="true" />
                  ) : reminder.type === "attendance" ? (
                    <CalendarClock24Regular aria-hidden="true" />
                  ) : (
                    <Alert24Regular aria-hidden="true" />
                  )}
                  <span>{reminder.type.toUpperCase()}</span>
                </div>
                <h3>{reminder.title}</h3>
                <p>{reminder.detail}</p>
                <small>核对期限 · {reminder.dueAt.slice(0, 10)}</small>
                <SourceBadge state={state} sourceId={reminder.sourceId} />
                <button
                  type="button"
                  disabled={state.offline || acknowledged}
                  onClick={() =>
                    apply(
                      (current) =>
                        acknowledgeExpectation(current, reminder.id),
                      "已记录本人知悉；没有生成机构批准或门禁权限。",
                    )
                  }
                >
                  {acknowledged ? (
                    <CheckmarkCircle24Filled aria-hidden="true" />
                  ) : (
                    <Info24Regular aria-hidden="true" />
                  )}
                  {acknowledged ? "已知悉" : "本人知悉"}
                </button>
              </article>
            );
          })}
        </div>
      </section>
    </>
  );

  const renderVersions = () => {
    const comparison = state.versionComparison;
    const correction = state.correctionCases.at(-1);
    return (
      <>
        <SectionHeading
          eyebrow="F007-07 / 08 · VERSION FILM"
          title={state.traditional ? "课程版本与教师纠错" : "Version Film Room"}
          detail="历史开课可比较，但反馈绑定原学期与原任教关系；教师补充上下文也不会覆盖历史。"
        />
        <div className="coach-version-grid">
          {state.fixture.versions.map((version) => (
            <article
              className={`coach-card coach-version-card ${
                state.selectedVersionId === version.id ? "is-selected" : ""
              }`}
              key={version.id}
            >
              <span>{version.term}</span>
              <h2>{version.profileVersion}</h2>
              <p>{version.assessmentSummary}</p>
              <p>{version.teachingSummary}</p>
              <small>{version.instructorAssignmentId}</small>
              <div>
                {version.sourceIds.map((sourceId) => (
                  <SourceBadge
                    state={state}
                    sourceId={sourceId}
                    key={sourceId}
                  />
                ))}
              </div>
            </article>
          ))}
        </div>
        <div className="coach-action-row">
          <button
            type="button"
            onClick={() =>
              apply(
                (current) =>
                  compareCourseVersions(
                    current,
                    "version-2025sp",
                    "version-2026sp",
                  ),
                "版本差异已生成；旧反馈未沿用到当前任教关系。",
              )
            }
          >
            <History24Regular aria-hidden="true" />
            比较 2025 → 2026
          </button>
        </div>
        {comparison && (
          <section className="coach-card coach-diff-panel">
            <header>
              <div>
                <span className="coach-card__kicker">CHANGE FILM</span>
                <h2>{comparison.changes.length} 项可追溯变化</h2>
              </div>
              <span className="coach-integrity-chip">
                <LockClosed24Regular aria-hidden="true" />
                旧反馈沿用：否
              </span>
            </header>
            <p className="coach-warning-note">{comparison.warning}</p>
            {comparison.changes.map((change) => (
              <article key={change.id}>
                <strong>{change.field}</strong>
                <div>
                  <span>{change.before}</span>
                  <span aria-hidden="true">→</span>
                  <span>{change.after}</span>
                </div>
                <div>
                  {[...new Set(change.sourceIds)].map((sourceId) => (
                    <SourceBadge
                      state={state}
                      sourceId={sourceId}
                      key={sourceId}
                    />
                  ))}
                </div>
              </article>
            ))}
          </section>
        )}
        <section className="coach-card coach-correction-panel">
          <span className="coach-card__kicker">TEACHER CORRECTION RIGHT</span>
          <h2>教师补充上下文，不静默改写</h2>
          {!correction ? (
            <button
              type="button"
              disabled={state.offline}
              onClick={() =>
                apply(
                  (current) =>
                    submitTeacherCorrection(current, {
                      targetId: state.fixture.course.id,
                      type: "context",
                      statement:
                        "补充说明：反馈方式随任务类型变化，不承诺统一返回日。",
                      evidenceIds: ["src-teacher-confirmed"],
                    }),
                  "教师 Fixture 纠错已提交；公开字段尚未变更。",
                )
              }
            >
              <Edit24Regular aria-hidden="true" />
              提交带证据的上下文补充
            </button>
          ) : (
            <article className="coach-correction-case">
              <header>
                <strong>{correction.id}</strong>
                <span>{correction.status}</span>
              </header>
              <p>{correction.statement}</p>
              <small>人工复核期限 · {correction.reviewDueAt}</small>
              <ol>
                {correction.history.map((item, index) => (
                  <li key={`${item.status}-${index}`}>
                    <strong>{item.status}</strong>
                    <span>{item.note}</span>
                  </li>
                ))}
              </ol>
              {correction.status === "submitted" && (
                <button
                  type="button"
                  disabled={state.offline}
                  onClick={() =>
                    apply(
                      (current) =>
                        reviewTeacherCorrection(
                          current,
                          correction.id,
                          "in_review",
                        ),
                      "纠错已进入人工复核。",
                    )
                  }
                >
                  <DocumentSearch24Regular aria-hidden="true" />
                  进入人工复核
                </button>
              )}
              {correction.status === "in_review" && (
                <button
                  type="button"
                  disabled={state.offline}
                  onClick={() =>
                    apply(
                      (current) =>
                        reviewTeacherCorrection(
                          current,
                          correction.id,
                          "accepted",
                        ),
                      "上下文已接受为新版本；历史仍可回放。",
                    )
                  }
                >
                  <CheckmarkCircle24Filled aria-hidden="true" />
                  接受为新上下文
                </button>
              )}
            </article>
          )}
        </section>
      </>
    );
  };

  const renderFeedback = () => (
    <>
      <SectionHeading
        eyebrow="F007-09 / 10 · FEEDBACK HUDDLE"
        title={state.traditional ? "结构化反馈与公平审计" : "Feedback Huddle"}
        detail="反馈必须具体、可行动并经过阈值与治理；不公开匿名情绪排名。"
      />
      <div className="coach-feedback-layout">
        <section className="coach-card coach-aggregate-panel">
          <span className="coach-card__kicker">AGGREGATES</span>
          <h2>达到阈值才公开</h2>
          {feedback.map((aggregate) => (
            <article
              className={aggregate.published ? "" : "is-hidden"}
              key={aggregate.id}
            >
              <header>
                <strong>{FEEDBACK_LABEL[aggregate.dimension]}</strong>
                <span>
                  N={aggregate.sampleSize} / 阈值 {aggregate.minimumSample}
                </span>
              </header>
              {aggregate.published ? (
                <>
                  <p>{aggregate.summary}</p>
                  <small>建议动作 · {aggregate.suggestedAction}</small>
                </>
              ) : (
                <div className="coach-hidden-copy">
                  <EyeOff24Regular aria-hidden="true" />
                  样本不足或治理复核中，不显示方向性结论
                </div>
              )}
              <SourceBadge state={state} sourceId={aggregate.sourceId} />
            </article>
          ))}
        </section>
        <section className="coach-card coach-feedback-form">
          <span className="coach-card__kicker">PRIVATE SUBMISSION</span>
          <h2>提交具体课程体验</h2>
          <label>
            反馈维度
            <select
              value={feedbackDimension}
              disabled={state.offline}
              onChange={(event) =>
                setFeedbackDimension(event.target.value as FeedbackDimension)
              }
            >
              {Object.entries(FEEDBACK_LABEL).map(([id, label]) => (
                <option value={id} key={id}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          <label>
            具体发生了什么
            <textarea
              value={feedbackExperience}
              disabled={state.offline}
              onChange={(event) => setFeedbackExperience(event.target.value)}
              rows={3}
            />
          </label>
          <label>
            可以怎样改进
            <textarea
              value={feedbackAction}
              disabled={state.offline}
              onChange={(event) => setFeedbackAction(event.target.value)}
              rows={2}
            />
          </label>
          <label className="coach-check-row">
            <input
              type="checkbox"
              checked={feedbackConsent}
              disabled={state.offline}
              onChange={(event) => setFeedbackConsent(event.target.checked)}
            />
            达到阈值且通过治理后，可匿名聚合
          </label>
          <button
            type="button"
            disabled={state.offline}
            onClick={() =>
              apply(
                (current) =>
                  submitStructuredFeedback(current, {
                    dimension: feedbackDimension,
                    concreteExperience: feedbackExperience,
                    suggestedAction: feedbackAction,
                    consentToAggregate: feedbackConsent,
                  }),
                "反馈已私密保存；达到阈值前不会公开。",
              )
            }
          >
            <Send24Regular aria-hidden="true" />
            保存结构化反馈
          </button>
          <span className="coach-form-status">
            本 Session 已提交 {state.feedbackSubmissions.length} 条；辱骂和人格判断先进入人工复核。
          </span>
        </section>
        <section className="coach-card coach-fairness-panel">
          <span className="coach-card__kicker">FAIRNESS TEST COURT</span>
          <h2>
            {state.fairnessAudit.status === "not_run"
              ? "尚未运行"
              : state.fairnessAudit.status === "pass"
                ? "5 / 5 通过"
                : "已降级排序"}
          </h2>
          {state.fairnessAudit.checks.length > 0 ? (
            <div className="coach-fairness-checks">
              {state.fairnessAudit.checks.map((check) => (
                <article key={check.id}>
                  {check.passed ? (
                    <CheckmarkCircle24Filled aria-hidden="true" />
                  ) : (
                    <Warning24Regular aria-hidden="true" />
                  )}
                  <div>
                    <strong>{check.label}</strong>
                    <span>{check.detail}</span>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <p>
              检查课程/教师隔离、版本边界、样本阈值、敏感字段和 Advisor 真值。
            </p>
          )}
          <button
            type="button"
            onClick={() =>
              apply(
                runCoachFairnessAudit,
                "公平审计已完成；失败时会降级为时间/主题排序。",
              )
            }
          >
            <ShieldCheckmark24Regular aria-hidden="true" />
            运行公平审计
          </button>
          <small>当前排序 · {state.fairnessAudit.sortMode}</small>
        </section>
      </div>
    </>
  );

  const renderTeam = () => (
    <>
      <SectionHeading
        eyebrow="F007-11 / 12 · SQUAD & ADVISOR"
        title={state.traditional ? "组队需求与导师咨询" : "Squad Finder"}
        detail="学生逐项披露技能、时间和沟通方式；敏感身份禁用，匹配只是沟通起点。"
      />
      <div className="coach-team-layout">
        <section className="coach-card coach-team-profile">
          <span className="coach-card__kicker">SELECTIVE PROFILE</span>
          <h2>本次匹配使用哪些资料</h2>
          {state.fixture.teamFields.map((field) => (
            <label
              className={!field.selectable ? "is-forbidden" : ""}
              key={field.id}
            >
              <input
                type="checkbox"
                checked={state.selectedTeamFieldIds.includes(field.id)}
                disabled={state.offline || !field.selectable}
                onChange={() =>
                  apply(
                    (current) => toggleTeamProfileField(current, field.id),
                    "本次匹配资料已更新；没有写回个人档案。",
                  )
                }
              />
              <span>{field.label}</span>
              {!field.selectable && <LockClosed24Regular aria-hidden="true" />}
            </label>
          ))}
          <button
            type="button"
            disabled={state.selectedTeamFieldIds.length === 0}
            onClick={() =>
              apply(
                runTeamMatching,
                "已生成可解释组队结果；未使用敏感身份。",
              )
            }
          >
            <PeopleTeam24Regular aria-hidden="true" />
            运行组队匹配
          </button>
        </section>
        <section className="coach-card coach-team-needs">
          <span className="coach-card__kicker">OPEN ROLE GAPS</span>
          <h2>项目需求</h2>
          {state.fixture.teamNeeds.map((need) => (
            <article key={need.id}>
              <header>
                <strong>{need.projectTitle}</strong>
                <span>{need.hoursPerWeek}h / 周</span>
              </header>
              <p>{need.roleGap}</p>
              <div className="coach-tag-list">
                {[...need.skills, ...need.communication].map((item) => (
                  <span key={item}>{item}</span>
                ))}
              </div>
              {need.sourceIds.map((sourceId) => (
                <SourceBadge
                  state={state}
                  sourceId={sourceId}
                  key={sourceId}
                />
              ))}
            </article>
          ))}
        </section>
        <section className="coach-card coach-team-results">
          <span className="coach-card__kicker">MATCH REASONS</span>
          <h2>匹配理由、冲突与未知</h2>
          {state.teamMatches.length === 0 ? (
            <p>选择资料后运行匹配；系统不会输出“队友价值分”。</p>
          ) : (
            state.teamMatches.map((match) => {
              const need = state.fixture.teamNeeds.find(
                (item) => item.id === match.teamNeedId,
              );
              return (
                <article key={match.teamNeedId}>
                  <header>
                    <strong>{need?.projectTitle}</strong>
                    <span>{MATCH_LABEL[match.status]}</span>
                  </header>
                  {match.reasons.map((item) => (
                    <p className="is-reason" key={item}>
                      <CheckmarkCircle24Filled aria-hidden="true" />
                      {item}
                    </p>
                  ))}
                  {match.conflicts.map((item) => (
                    <p className="is-conflict" key={item}>
                      <Warning24Regular aria-hidden="true" />
                      {item}
                    </p>
                  ))}
                  {match.unknowns.map((item) => (
                    <p className="is-unknown" key={item}>
                      <QuestionCircle24Regular aria-hidden="true" />
                      {item}
                    </p>
                  ))}
                  <small>敏感属性使用：否</small>
                </article>
              );
            })
          )}
        </section>
        <section className="coach-card coach-handoff-panel">
          <span className="coach-card__kicker">ADVISOR HANDOFF</span>
          <h2>带问题和证据去找真人</h2>
          {state.advisorHandoff ? (
            <article>
              <CheckmarkCircle24Filled aria-hidden="true" />
              <div>
                <strong>{state.advisorHandoff.status}</strong>
                <p>{state.advisorHandoff.questions.join(" · ")}</p>
                <span>
                  evidence {state.advisorHandoff.evidenceIds.length} · scenario{" "}
                  {state.advisorHandoff.scenarioIds.length}
                </span>
                <small>Advisor reply：未生成，等待真人回复</small>
              </div>
            </article>
          ) : (
            <>
              <p>
                将 SLS201 大纲与 F-004 Balanced Plan 一起带给真实导师，询问先修缺口和学期负荷。
              </p>
              <button
                type="button"
                disabled={state.offline}
                onClick={() =>
                  apply(
                    (current) =>
                      buildAdvisorHandoff(current, {
                        questions: [
                          "当前先修缺口是否需要在正式选课前补齐？",
                          "Balanced Plan 的实验周负荷是否可持续？",
                        ],
                        evidenceIds: [
                          "src-official-syllabus",
                          "src-teacher-confirmed",
                        ],
                        scenarioIds: ["F-004:plan-balanced"],
                        consentConfirmed: true,
                      }),
                    "Advisor Handoff 已就绪；没有伪造导师意见。",
                  )
                }
              >
                <ChatHelp24Regular aria-hidden="true" />
                生成本人确认的 Handoff
              </button>
            </>
          )}
        </section>
      </div>
    </>
  );

  const renderGovernance = () => (
    <>
      <SectionHeading
        eyebrow="F007-14 · GOVERNANCE REPLAY"
        title={state.traditional ? "报告、先下线复核与回放" : "Governance Replay"}
        detail="骚扰、失实、隐私与歧视都有可见入口；严重内容先隐藏，再由人在时限内复核。"
      />
      <div className="coach-governance-layout">
        <section className="coach-card coach-report-panel">
          <span className="coach-card__kicker">REPORT DESK</span>
          <h2>报告可复核问题</h2>
          <div className="coach-report-buttons">
            <button
              type="button"
              disabled={state.offline}
              onClick={() =>
                apply(
                  (current) =>
                    reportGovernanceIssue(current, {
                      reportType: "privacy",
                      targetId: "aggregate-clarity",
                      evidence: "聚合文本意外包含可识别的个人实验描述。",
                      serious: true,
                    }),
                  "严重隐私报告已创建；目标已先隐藏等待复核。",
                )
              }
            >
              <EyeOff24Regular aria-hidden="true" />
              演练严重隐私报告
            </button>
            <button
              type="button"
              disabled={state.offline}
              onClick={() =>
                apply(
                  (current) =>
                    reportGovernanceIssue(current, {
                      reportType: "misinformation",
                      targetId: "course-summary",
                      evidence: "课程简介与当前官方大纲版本存在可核对差异。",
                      serious: false,
                    }),
                  "失实信息报告已提交；原来源与复核期限均已保留。",
                )
              }
            >
              <Flag24Regular aria-hidden="true" />
              报告信息差异
            </button>
          </div>
          <p>
            当前先隐藏目标：{state.hiddenTargetIds.length} · 工单：
            {state.governanceCases.length}
          </p>
          {state.governanceCases.map((item) => (
            <article key={item.id}>
              <header>
                <strong>{item.reportType}</strong>
                <span>{item.status}</span>
              </header>
              <p>{item.evidence}</p>
              <small>
                临时措施 {item.temporaryMeasure} · 复核期限{" "}
                {item.reviewDueAt}
              </small>
            </article>
          ))}
        </section>
        <section className="coach-card coach-box-score">
          <span className="coach-card__kicker">PERSONAL BOX SCORE</span>
          <h2>本次 Scouting Session</h2>
          <div>
            <article>
              <strong>{boxScore.sourceTiers}</strong>
              <span>来源层级</span>
            </article>
            <article>
              <strong>{boxScore.sourcedProfileFields}</strong>
              <span>带来源字段</span>
            </article>
            <article>
              <strong>{boxScore.visibleFeedbackAggregates}</strong>
              <span>可见聚合</span>
            </article>
            <article>
              <strong>{boxScore.hiddenForLowSample}</strong>
              <span>阈值/治理隐藏</span>
            </article>
            <article>
              <strong>{boxScore.sensitiveTeamFieldsUsed}</strong>
              <span>敏感字段使用</span>
            </article>
            <article>
              <strong>{boxScore.fabricatedAdvisorReplies}</strong>
              <span>伪造导师回复</span>
            </article>
          </div>
          <p>
            非权威 Fixture · 公平状态 {boxScore.fairnessStatus} · 审计事件{" "}
            {boxScore.auditEvents}
          </p>
        </section>
        <section className="coach-card coach-replay-panel">
          <span className="coach-card__kicker">APPEND-ONLY REPLAY</span>
          <h2>来源、决定和临时措施</h2>
          <ol>
            {[...state.audit].reverse().map((event) => (
              <li key={event.id}>
                <span>{String(event.sequence).padStart(2, "0")}</span>
                <div>
                  <strong>{event.action}</strong>
                  <p>{event.detail}</p>
                  <small>
                    {event.targetId} · {event.eventHash}
                  </small>
                </div>
              </li>
            ))}
          </ol>
        </section>
      </div>
    </>
  );

  const stageContent = {
    profile: renderProfile,
    scouting: renderScouting,
    versions: renderVersions,
    feedback: renderFeedback,
    team: renderTeam,
    governance: renderGovernance,
  }[state.stage]();

  return (
    <div
      className={[
        "coach-shell",
        state.traditional ? "is-traditional" : "",
        state.reducedMotion ? "is-reduced-motion" : "",
        state.offline ? "is-offline" : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <a className="skip-link" href="#coach-main">
        跳到 Coach & Scouting 内容
      </a>
      <div className="coach-shell__background" aria-hidden="true" />
      <header className="coach-topbar">
        <button className="coach-back" type="button" onClick={onExit}>
          <ArrowLeft24Regular aria-hidden="true" />
          返回 MyCareer
        </button>
        <div className="coach-brand">
          <span>UNIVERSITY2K26 · F-007</span>
          <strong>
            {state.traditional ? "课程信息与咨询" : "COACH & SCOUTING"}
          </strong>
          <small>
            课程特征与证据，不是教师评分 · {backendLabel} · Fixture
          </small>
        </div>
        <div className="coach-topbar__actions">
          <span>
            <DocumentSearch24Regular aria-hidden="true" />5 级来源
          </span>
          <button
            type="button"
            aria-pressed={state.offline}
            onClick={() => setState(setCoachOffline(state, !state.offline))}
          >
            <CloudOff24Regular aria-hidden="true" />
            {state.offline ? "恢复在线" : "离线演练"}
          </button>
          <button
            type="button"
            aria-pressed={state.traditional}
            onClick={() =>
              setState(
                setCoachPreferences(state, {
                  traditional: !state.traditional,
                }),
              )
            }
          >
            <BookOpen24Regular aria-hidden="true" />
            {state.traditional ? "游戏叙事" : "传统叙事"}
          </button>
          <button
            type="button"
            aria-pressed={state.reducedMotion}
            onClick={() =>
              setState(
                setCoachPreferences(state, {
                  reducedMotion: !state.reducedMotion,
                }),
              )
            }
          >
            <Accessibility24Regular aria-hidden="true" />
            减少动效
          </button>
          <button type="button" onClick={reset}>
            <ArrowSync24Regular aria-hidden="true" />
            重置
          </button>
        </div>
      </header>

      <nav className="coach-stepbar" aria-label="Coach & Scouting 阶段">
        {STAGES.map((stage, index) => {
          const Icon = stage.icon;
          return (
            <button
              type="button"
              className={state.stage === stage.id ? "is-active" : ""}
              aria-current={state.stage === stage.id ? "step" : undefined}
              onClick={() => setState(setCoachStage(state, stage.id))}
              key={stage.id}
            >
              <span>{String(index + 1).padStart(2, "0")}</span>
              <Icon aria-hidden="true" />
              {state.traditional ? stage.traditional : stage.label}
            </button>
          );
        })}
      </nav>

      <div className="coach-boundary-banner" role="status">
        {state.offline ? (
          <CloudOff24Regular aria-hidden="true" />
        ) : (
          <Info24Regular aria-hidden="true" />
        )}
        {state.offline
          ? "离线只读 · 使用上次 Coach Fixture；纠错、反馈、授权与举报均已锁定"
          : "DEMO FIXTURE · 不评价教师人格，不自动沿用旧反馈，不替代选课、导师或机构决定"}
      </div>

      <main id="coach-main" className="coach-main">
        <h1 className="sr-only">
          {state.traditional
            ? "课程信息与咨询"
            : "Coach & Scouting · 课程证据与协作"}
        </h1>
        {stageContent}
      </main>

      <footer className="coach-footer">
        <div>
          <Board24Regular aria-hidden="true" />
          <span>
            {stageIndex + 1} / {STAGES.length} ·{" "}
            {state.traditional
              ? STAGES[stageIndex].traditional
              : STAGES[stageIndex].label}
          </span>
        </div>
        <div>
          <DataBarVertical24Regular aria-hidden="true" />
          <span>
            source tiers {boxScore.sourceTiers} · fairness{" "}
            {boxScore.fairnessStatus} · sensitive match 0
          </span>
        </div>
        <div>
          <ShieldCheckmark24Regular aria-hidden="true" />
          <span>no rating · no personality label · no fabricated reply</span>
        </div>
      </footer>

      {toast && (
        <div className="coach-toast" role="status" aria-live="polite">
          <Info24Regular aria-hidden="true" />
          {toast}
        </div>
      )}
    </div>
  );
}

import { useEffect, useMemo, useState } from "react";
import {
  ArrowDown24Regular,
  ArrowDownload24Regular,
  ArrowLeft24Regular,
  ArrowRight24Regular,
  ArrowSync24Regular,
  ArrowUp24Regular,
  BranchFork24Regular,
  CalendarLtr24Regular,
  CheckmarkCircle24Filled,
  Dismiss24Regular,
  DocumentSearch24Regular,
  Info24Regular,
  LockClosed24Regular,
  LockOpen24Regular,
  Save24Regular,
  Settings24Regular,
  Warning24Regular,
} from "@fluentui/react-icons";
import {
  GOAL_LABELS,
  buildTransaction,
  clearSimulation,
  createRosterLabState,
  moveGoal,
  openUnsatDrill,
  pinLabel,
  replaySemesterLock,
  resetRosterLabState,
  runWhatIf,
  saveLockToState,
  selectPlan,
  setPreference,
  solveRosterState,
  togglePin,
} from "./engine";
import { ROSTER_FIXTURE } from "./fixture";
import {
  clearSemesterLock,
  loadSemesterLock,
  saveSemesterLock,
} from "./storage";
import type {
  PreferenceProfile,
  RosterLabState,
  RosterStep,
  SemesterLock,
  SemesterPlan,
  WhatIfChanges,
} from "./types";
import {
  getRosterImportCapabilities,
  type RosterImportCapabilities,
} from "../../lib/api";
import { SourceBoundCoach } from "../ai/SourceBoundCoach";
import { UArizonaCatalogBrowser } from "./UArizonaCatalogBrowser";
import "./rosterlab.css";

type RosterLabStudioProps = {
  backendLabel: string;
  onExit: () => void;
};

const STEP_LABELS: Array<{
  id: RosterStep;
  immersive: string;
  traditional: string;
}> = [
  { id: "editor", immersive: "Build Board", traditional: "输入与偏好" },
  { id: "compare", immersive: "Draft Board", traditional: "方案比较" },
  { id: "whatif", immersive: "What-if Branch", traditional: "模拟分支" },
  { id: "unsat", immersive: "Conflict Review", traditional: "无解解释" },
  { id: "transaction", immersive: "Transaction", traditional: "变更预览" },
];

const DAY_LABELS = {
  Mon: "周一",
  Tue: "周二",
  Wed: "周三",
  Thu: "周四",
  Fri: "周五",
} as const;

const ROLE_LABELS = {
  required: "必修",
  elective: "选修",
  general_ed: "通识",
  lab: "实验",
} as const;

const TIME_PREFERENCE_LABELS: Record<
  PreferenceProfile["timeOfDay"],
  string
> = {
  morning: "优先上午",
  daytime: "优先日间",
  late: "优先午后",
};

function PlanCard({
  plan,
  selected,
  onSelect,
  compact = false,
}: {
  plan: SemesterPlan;
  selected: boolean;
  onSelect: () => void;
  compact?: boolean;
}) {
  const transaction = buildTransaction(plan);
  return (
    <article
      className={`roster-plan-card ${selected ? "is-selected" : ""} ${
        compact ? "is-compact" : ""
      }`}
    >
      <header>
        <div>
          <span className="roster-plan-card__eyebrow">
            {plan.isSimulation ? "SIMULATION // FIXTURE" : "PLAN // FIXTURE"}
          </span>
          <h3>{plan.label}</h3>
        </div>
        <span className="roster-score" aria-label={`偏好满足度 ${plan.preferenceScore}`}>
          {plan.preferenceScore}
          <small>FIT</small>
        </span>
      </header>

      <p className="roster-plan-card__strategy">{plan.strategy}</p>

      <div className="roster-plan-metrics">
        <span>
          <b>{plan.totalCredits}</b> 学分
        </span>
        <span>
          <b>{plan.courses.length}</b> 门课程
        </span>
        <span>
          <b>{plan.migrationCost}</b> 项迁移
        </span>
      </div>

      <ul className="roster-course-list">
        {plan.courses.map((course) => (
          <li key={`${plan.id}-${course.courseId}`}>
            <span className={`roster-course-role is-${course.role}`}>
              {ROLE_LABELS[course.role]}
            </span>
            <span>
              <strong>
                {course.code} · {course.title}
              </strong>
              <small>
                {course.timeSlots
                  .map(
                    (timeSlot) =>
                      `${DAY_LABELS[timeSlot.weekday]} ${timeSlot.start}`,
                  )
                  .join(" / ")}
              </small>
            </span>
            {course.pinned && (
              <LockClosed24Regular
                aria-label={`已锁定：${course.pinReason ?? course.code}`}
              />
            )}
          </li>
        ))}
      </ul>

      {!compact && (
        <>
          <div className="roster-tradeoffs">
            {plan.tradeoffs.map((tradeoff) => (
              <div
                key={`${plan.id}-${tradeoff.title}`}
                className={`roster-tradeoff is-${tradeoff.impact}`}
              >
                <strong>{tradeoff.title}</strong>
                <span>{tradeoff.detail}</span>
              </div>
            ))}
          </div>
          <div className="roster-plan-risk">
            <Warning24Regular aria-hidden="true" />
            {plan.risks[0]?.description}
          </div>
        </>
      )}

      <button
        className="roster-select-plan"
        type="button"
        aria-pressed={selected}
        onClick={onSelect}
        data-focusable="true"
      >
        {selected ? (
          <CheckmarkCircle24Filled aria-hidden="true" />
        ) : (
          <ArrowRight24Regular aria-hidden="true" />
        )}
        {selected ? "已选作比较基线" : "选择此方案"}
        <span>{transaction.actions.length} actions</span>
      </button>
    </article>
  );
}

export function RosterLabStudio({
  backendLabel,
  onExit,
}: RosterLabStudioProps) {
  const [state, setState] = useState<RosterLabState>(() =>
    createRosterLabState(),
  );
  const [traditional, setTraditional] = useState(false);
  const [message, setMessage] = useState(
    "这里先排演方案，不会替你提交正式选课。",
  );
  const [importCapabilities, setImportCapabilities] =
    useState<RosterImportCapabilities | null>(null);
  const [importCapabilityState, setImportCapabilityState] = useState<
    "checking" | "live" | "fallback"
  >("checking");
  const [cachedLock, setCachedLock] = useState<SemesterLock | null>(() => {
    try {
      return loadSemesterLock();
    } catch {
      return null;
    }
  });
  const [whatIfDraft, setWhatIfDraft] = useState<WhatIfChanges>({
    branchName: "设计方向试投",
    addCourseIds: ["HCI205"],
    removeCourseIds: ["ENG210"],
    blockedTimeSlots: [
      {
        weekday: "Fri",
        start: "08:00",
        end: "10:00",
        room: "个人时间块",
      },
    ],
    changeMajor: "交互设计方向（模拟）",
  });

  const selectedPlan = useMemo(
    () => state.plans.find((plan) => plan.id === state.selectedPlanId) ?? null,
    [state.plans, state.selectedPlanId],
  );
  const transaction = selectedPlan ? buildTransaction(selectedPlan) : null;

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [state.step]);

  useEffect(() => {
    const controller = new AbortController();
    getRosterImportCapabilities((input, init) =>
      fetch(input, { ...init, signal: controller.signal }),
    )
      .then((capabilities) => {
        setImportCapabilities(capabilities);
        setImportCapabilityState("live");
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") return;
        setImportCapabilityState("fallback");
      });
    return () => controller.abort();
  }, []);

  const commit = (
    action: (current: RosterLabState) => RosterLabState,
    successMessage?: string,
  ) => {
    try {
      setState((current) => action(current));
      if (successMessage) setMessage(successMessage);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "操作未完成。");
    }
  };

  const goToStep = (step: RosterStep) => {
    const canOpen =
      step === "editor" ||
      (step === "compare" && state.plans.length > 0) ||
      step === "whatif" ||
      step === "unsat" ||
      (step === "transaction" && Boolean(selectedPlan));
    if (!canOpen) {
      setMessage("请先完成一次解析并选择方案。");
      return;
    }
    setState((current) => ({ ...current, step }));
  };

  const solve = () =>
    commit(
      solveRosterState,
      "已生成三套可行方案；这是确定性启发式结果，未穷举全部组合。",
    );

  const runSimulation = () =>
    commit(
      (current) => runWhatIf(current, whatIfDraft),
      "这条假设分支已经算完；回到基线就能丢弃，不会改动培养方案。",
    );

  const saveLock = () => {
    try {
      const next = saveLockToState(state);
      if (!next.savedLock) return;
      saveSemesterLock(next.savedLock);
      setCachedLock(next.savedLock);
      setState(next);
      setMessage("semester.lock 已保存到本机；它是可重放规划输入，不是选课凭证。");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "快照保存失败。");
    }
  };

  const downloadLock = () => {
    const lock = state.savedLock ?? cachedLock;
    if (!lock) {
      setMessage("请先保存 semester.lock。");
      return;
    }
    const blob = new Blob([`${JSON.stringify(lock, null, 2)}\n`], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${lock.id}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
    setMessage("已导出可阅读 JSON；文件明确标注非正式选课。");
  };

  const replayLock = () => {
    if (!cachedLock) {
      setMessage("本机没有可重放快照。");
      return;
    }
    try {
      const replay = replaySemesterLock(cachedLock);
      setMessage(
        replay.matched
          ? `重放一致：${cachedLock.inputFingerprint}`
          : "输入版本有效，但所选方案未进入当前前三名；请检查目标顺序。",
      );
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "快照重放失败。");
    }
  };

  const reset = () => {
    setState(resetRosterLabState());
    setMessage("Roster Lab 已重置；本机 semester.lock 保留，可单独清除。");
  };

  const currentStep =
    STEP_LABELS.find((candidate) => candidate.id === state.step) ??
    STEP_LABELS[0];

  return (
    <div className={`roster-shell ${traditional ? "is-traditional" : ""}`}>
      <a className="skip-link" href="#roster-main">
        跳到 Roster Lab 主要内容
      </a>
      <div className="roster-shell__background" aria-hidden="true" />

      <header className="roster-topbar">
        <button
          className="roster-back"
          type="button"
          onClick={onExit}
          data-focusable="true"
        >
          <ArrowLeft24Regular aria-hidden="true" />
          返回 MyCareer
        </button>
        <div className="roster-brand">
          <span>UNIVERSITY2K26 // F-004</span>
          <strong>ROSTER LAB</strong>
        </div>
        <div className="roster-topbar__status">
          <span>
            <DocumentSearch24Regular aria-hidden="true" />
            {backendLabel}
          </span>
          <button
            type="button"
            onClick={() => setTraditional((current) => !current)}
            aria-pressed={traditional}
            data-focusable="true"
          >
            <Settings24Regular aria-hidden="true" />
            {traditional ? "传统规划" : "赛季叙事"}
          </button>
          <button
            type="button"
            onClick={reset}
            data-focusable="true"
          >
            <ArrowSync24Regular aria-hidden="true" />
            重置
          </button>
        </div>
      </header>

      <nav className="roster-stepbar" aria-label="Roster Lab 功能步骤">
        {STEP_LABELS.map((step, index) => {
          const active = step.id === state.step;
          const enabled =
            step.id === "editor" ||
            step.id === "whatif" ||
            step.id === "unsat" ||
            (step.id === "compare" && state.plans.length > 0) ||
            (step.id === "transaction" && Boolean(selectedPlan));
          return (
            <button
              key={step.id}
              type="button"
              className={active ? "is-active" : ""}
              aria-current={active ? "step" : undefined}
              aria-disabled={!enabled}
              onClick={() => goToStep(step.id)}
              data-focusable="true"
            >
              <span>{String(index + 1).padStart(2, "0")}</span>
              {traditional ? step.traditional : step.immersive}
            </button>
          );
        })}
      </nav>

      <div className="roster-boundary-banner" role="status">
        <Info24Regular aria-hidden="true" />
        <span>
          <strong>先排演，再决定 ·</strong> {ROSTER_FIXTURE.sourceBoundary}
        </span>
      </div>

      <main id="roster-main" className="roster-main" tabIndex={-1}>
        <header className="roster-page-heading">
          <div>
            <span className="roster-page-heading__kicker">
              {traditional ? currentStep.traditional : currentStep.immersive}
            </span>
            <h1>
              {state.step === "editor" && "把学期当成一个可解释环境"}
              {state.step === "compare" && "三套阵容，没有黑箱唯一答案"}
              {state.step === "whatif" && "开一条分支，再决定要不要改变"}
              {state.step === "unsat" && "排不出来，也要把卡点说清楚"}
              {state.step === "transaction" && "先看清变化，再去正式系统"}
            </h1>
          </div>
          <div className="roster-heading-metrics">
            <span>
              <b>{ROSTER_FIXTURE.catalog.length}</b> 课程索引
            </span>
            <span>
              <b>{ROSTER_FIXTURE.creditRange.min}–{ROSTER_FIXTURE.creditRange.max}</b>{" "}
              学分
            </span>
            <span>
              <b>v{ROSTER_FIXTURE.prefix.version}</b> Prefix
            </span>
          </div>
        </header>

        <div className="roster-live-message" role="status" aria-live="polite">
          <CheckmarkCircle24Filled aria-hidden="true" />
          {message}
        </div>

        {state.step === "editor" && (
          <div className="roster-editor">
            <section className="roster-panel roster-import-gate">
              <header className="roster-panel__header">
                <div>
                  <span>CATALOG CHANNELS // SOURCE GATE</span>
                  <h2>真实目录先过检录，再进入赛场</h2>
                </div>
                <span className="roster-version">
                  {importCapabilityState === "checking" && "核对中"}
                  {importCapabilityState === "live" && "服务在线"}
                  {importCapabilityState === "fallback" && "本地说明"}
                </span>
              </header>
              <div className="roster-import-grid">
                <article>
                  <strong>UArizona</strong>
                  <b>公开课程目录</b>
                  <p>
                    只收公开 catalog / class search 元数据；拒绝学生选课、成绩、
                    hold 与财务记录。
                  </p>
                </article>
                <article>
                  <strong>HEBUT</strong>
                  <b>公开或本人授权导出</b>
                  <p>
                    本地来源不回传真实路径；拒绝身份、成绩、支付与正式选课动作。
                  </p>
                </article>
                <article>
                  <strong>Solver Contract</strong>
                  <b>
                    {importCapabilities?.solver_protocol ?? "conda_style_v1"}
                  </b>
                  <p>
                    依赖图 + 硬约束 + 软偏好 + 无解核心 + 可重放 lock；
                    当前由确定性的本地求解器演示。
                  </p>
                </article>
              </div>
              <p className="roster-import-boundary">
                {importCapabilities?.source_boundary ??
                  "当前没有真实 UArizona / HEBUT 目录被提升；验证回执不等于导入、占座或正式选课。"}
              </p>
            </section>

            <UArizonaCatalogBrowser />

            <div className="roster-import-gate">
              <SourceBoundCoach
                task="career_path"
                eyebrow="AI ROSTER COACH // SOURCE-BOUND"
                title="让 AI 解释取舍，不让 AI 改写硬约束"
                subject={`${ROSTER_FIXTURE.semester} 课程阵容`}
                question="基于当前 Pin、偏好与学分范围，下一步应先验证什么？"
                consentRequired={false}
                boundary="AI 只会看到下方的演示摘要；它不能解锁固定项、占座、提交选课或掩盖无解原因。"
                facts={[
                  {
                    label: "硬约束",
                    value: `${state.activePinIds.length} 个 Pin 生效；学分范围 ${ROSTER_FIXTURE.creditRange.min}–${ROSTER_FIXTURE.creditRange.max}`,
                    source_id: "roster-fixture:constraints",
                  },
                  {
                    label: "时段偏好",
                    value: TIME_PREFERENCE_LABELS[state.preferences.timeOfDay],
                    source_id: "roster-fixture:preferences",
                  },
                  {
                    label: "求解协议",
                    value: `${importCapabilities?.solver_protocol ?? "conda_style_v1"} / 本地确定性参考实现`,
                    source_id: "roster-capability:solver",
                  },
                ]}
              />
            </div>

            <section className="roster-panel roster-prefix-panel">
              <header className="roster-panel__header">
                <div>
                  <span>SEMESTER PREFIX</span>
                  <h2>当前基线</h2>
                </div>
                <span className="roster-version">
                  {ROSTER_FIXTURE.prefix.id}
                </span>
              </header>
              <div className="roster-prefix-grid">
                <article>
                  <strong>已修</strong>
                  <b>{ROSTER_FIXTURE.prefix.completed.length}</b>
                  <small>
                    {ROSTER_FIXTURE.prefix.completed
                      .map((course) => course.courseId)
                      .join(" · ")}
                  </small>
                </article>
                <article>
                  <strong>在修</strong>
                  <b>{ROSTER_FIXTURE.prefix.inProgress.length}</b>
                  <small>
                    {ROSTER_FIXTURE.prefix.inProgress
                      .map((course) => course.courseId)
                      .join(" · ")}
                  </small>
                </article>
                <article>
                  <strong>拟选</strong>
                  <b>{ROSTER_FIXTURE.prefix.planned.length}</b>
                  <small>
                    {ROSTER_FIXTURE.prefix.planned
                      .map((course) => course.courseId)
                      .join(" · ")}
                  </small>
                </article>
                <article>
                  <strong>退出记录</strong>
                  <b>{ROSTER_FIXTURE.prefix.dropped.length}</b>
                  <small>
                    {ROSTER_FIXTURE.prefix.dropped
                      .map((course) => course.courseId)
                      .join(" · ")}
                  </small>
                </article>
              </div>
              <div className="roster-catalog-strip">
                {ROSTER_FIXTURE.catalog.map((course) => (
                  <span key={course.code} title={`${course.title} · ${course.attributes.join(" / ")}`}>
                    {course.code}
                  </span>
                ))}
              </div>
            </section>

            <section className="roster-panel roster-pin-panel">
              <header className="roster-panel__header">
                <div>
                  <span>PINS</span>
                  <h2>你钉住的课，谁也不能偷偷挪</h2>
                </div>
                <LockClosed24Regular aria-hidden="true" />
              </header>
              <div className="roster-pin-list">
                {ROSTER_FIXTURE.pins.map((pin) => {
                  const active = state.activePinIds.includes(pin.id);
                  const mandatory = pin.id === "pin-sls-section";
                  return (
                    <button
                      key={pin.id}
                      type="button"
                      className={active ? "is-active" : ""}
                      aria-pressed={active}
                      disabled={mandatory}
                      onClick={() =>
                        commit(
                          (current) => togglePin(current, pin.id),
                          "Pin 已改变；旧方案作废，请重新解析。",
                        )
                      }
                      data-focusable="true"
                    >
                      {active ? (
                        <LockClosed24Regular aria-hidden="true" />
                      ) : (
                        <LockOpen24Regular aria-hidden="true" />
                      )}
                      <span>
                        <strong>{pinLabel(pin)}</strong>
                        <small>{pin.lockReason}</small>
                      </span>
                      <b>{mandatory ? "系统锚点" : active ? "ON" : "OFF"}</b>
                    </button>
                  );
                })}
              </div>
            </section>

            <section className="roster-panel roster-preference-panel">
              <header className="roster-panel__header">
                <div>
                  <span>SOFT PREFERENCES</span>
                  <h2>偏好由学生明确设置</h2>
                </div>
                <Settings24Regular aria-hidden="true" />
              </header>
              <div className="roster-preference-grid">
                <label>
                  上课时段
                  <select
                    value={state.preferences.timeOfDay}
                    onChange={(event) =>
                      commit((current) =>
                        setPreference(
                          current,
                          "timeOfDay",
                          event.target.value as PreferenceProfile["timeOfDay"],
                        ),
                      )
                    }
                  >
                    {Object.entries(TIME_PREFERENCE_LABELS).map(
                      ([value, label]) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      ),
                    )}
                  </select>
                </label>
                {(
                  [
                    ["compactness", "课程紧凑"],
                    ["variety", "跨域多样"],
                    ["stability", "少改现状"],
                  ] as const
                ).map(([key, label]) => (
                  <label key={key}>
                    {label}
                    <select
                      value={state.preferences[key]}
                      onChange={(event) =>
                        commit((current) =>
                          setPreference(
                            current,
                            key,
                            Number(event.target.value) as 0 | 1 | 2 | 3,
                          ),
                        )
                      }
                    >
                      <option value={0}>不考虑</option>
                      <option value={1}>低</option>
                      <option value={2}>中</option>
                      <option value={3}>高</option>
                    </select>
                  </label>
                ))}
              </div>
            </section>

            <section className="roster-panel roster-goal-panel">
              <header className="roster-panel__header">
                <div>
                  <span>GOAL ORDER</span>
                  <h2>解析目标顺序</h2>
                </div>
                <span className="roster-version">硬约束永远第一</span>
              </header>
              <ol className="roster-goal-list">
                {state.goalOrder.map((goal, index) => (
                  <li key={goal}>
                    <span>{String(index + 1).padStart(2, "0")}</span>
                    <strong>{GOAL_LABELS[goal]}</strong>
                    <div>
                      <button
                        type="button"
                        aria-label={`上移 ${GOAL_LABELS[goal]}`}
                        disabled={goal === "hard_constraints" || index <= 1}
                        onClick={() =>
                          commit((current) => moveGoal(current, goal, -1))
                        }
                        data-focusable="true"
                      >
                        <ArrowUp24Regular aria-hidden="true" />
                      </button>
                      <button
                        type="button"
                        aria-label={`下移 ${GOAL_LABELS[goal]}`}
                        disabled={
                          goal === "hard_constraints" ||
                          index === state.goalOrder.length - 1
                        }
                        onClick={() =>
                          commit((current) => moveGoal(current, goal, 1))
                        }
                        data-focusable="true"
                      >
                        <ArrowDown24Regular aria-hidden="true" />
                      </button>
                    </div>
                  </li>
                ))}
              </ol>
            </section>

            <button
              className="roster-primary-action"
              type="button"
              onClick={solve}
              data-focusable="true"
            >
              <span>
                <small>本地确定性求解</small>
                解析 2–3 套可行阵容
              </span>
              <ArrowRight24Regular aria-hidden="true" />
            </button>
          </div>
        )}

        {state.step === "compare" && (
          <div className="roster-compare">
            <div className="roster-compare-grid">
              {state.plans.map((plan) => (
                <PlanCard
                  key={plan.id}
                  plan={plan}
                  selected={plan.id === state.selectedPlanId}
                  onSelect={() =>
                    commit(
                      (current) => selectPlan(current, plan.id),
                      "比较基线已切换；transaction 预览同步更新。",
                    )
                  }
                />
              ))}
            </div>
            <section className="roster-command-deck">
              <button
                type="button"
                onClick={() => goToStep("whatif")}
                data-focusable="true"
              >
                <BranchFork24Regular aria-hidden="true" />
                <span>
                  <strong>开 What-if 分支</strong>
                  <small>改方向、课程或时间；不写回 Prefix</small>
                </span>
              </button>
              <button
                type="button"
                onClick={() => commit(openUnsatDrill)}
                data-focusable="true"
              >
                <Warning24Regular aria-hidden="true" />
                <span>
                  <strong>运行双 Pin 冲突</strong>
                  <small>验证最小冲突集与可放宽项</small>
                </span>
              </button>
              <button
                type="button"
                disabled={!selectedPlan}
                onClick={() =>
                  setState((current) => ({ ...current, step: "transaction" }))
                }
                data-focusable="true"
              >
                <DocumentSearch24Regular aria-hidden="true" />
                <span>
                  <strong>查看 transaction</strong>
                  <small>add / drop / swap 与正式办理步骤</small>
                </span>
              </button>
            </section>
          </div>
        )}

        {state.step === "whatif" && (
          <div className="roster-whatif">
            <section className="roster-panel roster-branch-editor">
              <header className="roster-panel__header">
                <div>
                  <span>WHAT-IF // ISOLATED</span>
                  <h2>模拟分支输入</h2>
                </div>
                <BranchFork24Regular aria-hidden="true" />
              </header>
              <label>
                分支名称
                <input
                  value={whatIfDraft.branchName}
                  onChange={(event) =>
                    setWhatIfDraft((current) => ({
                      ...current,
                      branchName: event.target.value,
                    }))
                  }
                />
              </label>
              <label>
                方向模拟
                <input
                  value={whatIfDraft.changeMajor ?? ""}
                  onChange={(event) =>
                    setWhatIfDraft((current) => ({
                      ...current,
                      changeMajor: event.target.value || null,
                    }))
                  }
                />
              </label>
              <div className="roster-branch-toggles">
                <button
                  type="button"
                  className={
                    whatIfDraft.addCourseIds.includes("HCI205")
                      ? "is-active"
                      : ""
                  }
                  aria-pressed={whatIfDraft.addCourseIds.includes("HCI205")}
                  onClick={() =>
                    setWhatIfDraft((current) => ({
                      ...current,
                      addCourseIds: current.addCourseIds.includes("HCI205")
                        ? current.addCourseIds.filter((id) => id !== "HCI205")
                        : [...current.addCourseIds, "HCI205"],
                    }))
                  }
                  data-focusable="true"
                >
                  + HCI205 人因与交互设计
                </button>
                <button
                  type="button"
                  className={
                    whatIfDraft.removeCourseIds.includes("ENG210")
                      ? "is-active"
                      : ""
                  }
                  aria-pressed={whatIfDraft.removeCourseIds.includes("ENG210")}
                  onClick={() =>
                    setWhatIfDraft((current) => ({
                      ...current,
                      removeCourseIds: current.removeCourseIds.includes("ENG210")
                        ? current.removeCourseIds.filter((id) => id !== "ENG210")
                        : [...current.removeCourseIds, "ENG210"],
                    }))
                  }
                  data-focusable="true"
                >
                  − ENG210 学术英语
                </button>
                <button
                  type="button"
                  className={
                    whatIfDraft.blockedTimeSlots.length ? "is-active" : ""
                  }
                  aria-pressed={Boolean(whatIfDraft.blockedTimeSlots.length)}
                  onClick={() =>
                    setWhatIfDraft((current) => ({
                      ...current,
                      blockedTimeSlots: current.blockedTimeSlots.length
                        ? []
                        : [
                            {
                              weekday: "Fri",
                              start: "08:00",
                              end: "10:00",
                              room: "个人时间块",
                            },
                          ],
                    }))
                  }
                  data-focusable="true"
                >
                  锁定周五 08:00–10:00
                </button>
              </div>
              <button
                className="roster-run-branch"
                type="button"
                onClick={runSimulation}
                data-focusable="true"
              >
                <ArrowSync24Regular aria-hidden="true" />
                解析模拟分支
              </button>
              <p>
                模拟结果保存在独立分支；返回基线即可丢弃。不会提交、占座或改变正式培养方案。
              </p>
            </section>

            <section className="roster-branch-results">
              <header>
                <span>SIMULATION RESULTS</span>
                <strong>
                  {state.simulation
                    ? `${state.simulation.plans.length} 套可行方案`
                    : "等待解析"}
                </strong>
              </header>
              {state.simulation?.plans.map((plan) => (
                <PlanCard
                  key={plan.id}
                  plan={plan}
                  compact
                  selected={plan.id === state.simulation?.selectedPlanId}
                  onSelect={() =>
                    commit((current) => selectPlan(current, plan.id, true))
                  }
                />
              ))}
              {state.simulation && state.simulation.plans.length === 0 && (
                <div className="roster-empty">
                  <Warning24Regular aria-hidden="true" />
                  当前模拟分支无可行方案；前往“无解解释”查看阻塞链。
                </div>
              )}
              <button
                className="roster-secondary-action"
                type="button"
                onClick={() => commit(clearSimulation)}
                data-focusable="true"
              >
                <ArrowLeft24Regular aria-hidden="true" />
                丢弃分支并回到基线
              </button>
            </section>
          </div>
        )}

        {state.step === "unsat" && (
          <div className="roster-unsat">
            <section className="roster-panel roster-unsat-summary">
              <header className="roster-panel__header">
                <div>
                  <span>UNSATISFIABLE EXPLANATION</span>
                  <h2>最小冲突集</h2>
                </div>
                <Warning24Regular aria-hidden="true" />
              </header>
              {(state.unsat ?? openUnsatDrill(state).unsat)?.minimalConflictSet.map(
                (conflict) => (
                  <article key={conflict.description}>
                    <span>{conflict.type}</span>
                    <strong>{conflict.courseIds.join(" × ")}</strong>
                    <p>{conflict.description}</p>
                  </article>
                ),
              )}
            </section>
            <section className="roster-panel roster-blocking-chain">
              <header className="roster-panel__header">
                <div>
                  <span>BLOCKING CHAIN</span>
                  <h2>为什么无解</h2>
                </div>
              </header>
              <ol>
                {(state.unsat ?? openUnsatDrill(state).unsat)?.blockingChain.map(
                  (item) => (
                    <li key={item.step}>
                      <span>{item.step}</span>
                      {item.description}
                    </li>
                  ),
                )}
              </ol>
            </section>
            <section className="roster-panel roster-relaxations">
              <header className="roster-panel__header">
                <div>
                  <span>RELAXABLE ITEMS</span>
                  <h2>可以放宽什么</h2>
                </div>
              </header>
              {(state.unsat ?? openUnsatDrill(state).unsat)?.relaxableItems.map(
                (item) => (
                  <article key={item.item}>
                    <strong>{item.item}</strong>
                    <p>{item.impactIfRelaxed}</p>
                    <span>替代：{item.alternativeCourseIds.join(" / ")}</span>
                  </article>
                ),
              )}
              <button
                className="roster-primary-action is-inline"
                type="button"
                onClick={() => {
                  setState((current) => ({
                    ...current,
                    step: current.plans.length ? "compare" : "editor",
                    unsat: null,
                  }));
                  setMessage("冲突测试已退出；任何 Pin 都没有被系统偷偷移动。");
                }}
                data-focusable="true"
              >
                <span>
                  <small>RELAX TEST ONLY</small>
                  保留 Pin，返回可行基线
                </span>
                <ArrowRight24Regular aria-hidden="true" />
              </button>
            </section>
          </div>
        )}

        {state.step === "transaction" && selectedPlan && transaction && (
          <div className="roster-transaction">
            <section className="roster-panel roster-transaction-summary">
              <header className="roster-panel__header">
                <div>
                  <span>DIFF // TRANSACTION PREVIEW</span>
                  <h2>{selectedPlan.label}</h2>
                </div>
                <span className="roster-version">NOT SUBMITTED</span>
              </header>
              <div className="roster-transaction-metrics">
                <span>
                  <b>{transaction.actions.length}</b>
                  actions
                </span>
                <span>
                  <b>
                    {transaction.netCreditChange > 0 ? "+" : ""}
                    {transaction.netCreditChange}
                  </b>
                  net credits
                </span>
                <span>
                  <b>{selectedPlan.migrationCost}</b>
                  migration
                </span>
              </div>
              <p>{transaction.impactSummary}</p>
            </section>
            <section className="roster-transaction-actions">
              {transaction.actions.length === 0 && (
                <div className="roster-empty">
                  <CheckmarkCircle24Filled aria-hidden="true" />
                  方案与 Prefix 一致；本页面仍不会执行正式选课。
                </div>
              )}
              {transaction.actions.map((action) => (
                <article
                  key={`${action.type}-${action.courseId}`}
                  className={`is-${action.type}`}
                >
                  <span>{action.type.toUpperCase()}</span>
                  <div>
                    <strong>
                      {action.code} · {action.title}
                    </strong>
                    <small>
                      {action.oldOffering ?? "—"} → {action.newOffering ?? "—"}
                    </small>
                    <p>{action.formalStep}</p>
                    {action.risk && <em>{action.risk}</em>}
                  </div>
                  <b>
                    {action.creditChange > 0 ? "+" : ""}
                    {action.creditChange}
                  </b>
                </article>
              ))}
            </section>
            <section className="roster-lock-deck">
              <div>
                <span>SEMESTER.LOCK</span>
                <h2>保存可重放输入，而不是录取结果</h2>
                <p>
                  记录目录版本、Prefix、Pins、目标顺序、偏好、求解器与 fingerprint。
                  相同输入应当得到相同候选，方便复查。
                </p>
              </div>
              <div className="roster-lock-actions">
                <button
                  type="button"
                  onClick={saveLock}
                  data-focusable="true"
                >
                  <Save24Regular aria-hidden="true" />
                  保存到本机
                </button>
                <button
                  type="button"
                  onClick={downloadLock}
                  disabled={!state.savedLock && !cachedLock}
                  data-focusable="true"
                >
                  <ArrowDownload24Regular aria-hidden="true" />
                  导出 JSON
                </button>
                <button
                  type="button"
                  onClick={replayLock}
                  disabled={!cachedLock}
                  data-focusable="true"
                >
                  <ArrowSync24Regular aria-hidden="true" />
                  重放检查
                </button>
                <button
                  type="button"
                  onClick={() => {
                    clearSemesterLock();
                    setCachedLock(null);
                    setState((current) => ({ ...current, savedLock: null }));
                    setMessage("本机 semester.lock 已清除；方案本身仍在当前会话中。");
                  }}
                  disabled={!cachedLock}
                  data-focusable="true"
                >
                  <Dismiss24Regular aria-hidden="true" />
                  清除本机快照
                </button>
              </div>
              {(state.savedLock ?? cachedLock) && (
                <dl className="roster-lock-proof">
                  <div>
                    <dt>Lock ID</dt>
                    <dd>{(state.savedLock ?? cachedLock)?.id}</dd>
                  </div>
                  <div>
                    <dt>Catalog</dt>
                    <dd>2026 秋季演示目录 · 第 3 版</dd>
                  </div>
                  <div>
                    <dt>Fingerprint</dt>
                    <dd>{(state.savedLock ?? cachedLock)?.inputFingerprint}</dd>
                  </div>
                  <div>
                    <dt>Authority</dt>
                    <dd>演示方案 · 非正式选课</dd>
                  </div>
                </dl>
              )}
            </section>
          </div>
        )}
      </main>

      <footer className="roster-footer">
        <span>
          <CalendarLtr24Regular aria-hidden="true" />
          2026 秋季 · 演示目录第 3 版
        </span>
        <span>
          <LockClosed24Regular aria-hidden="true" />
          已固定 {state.activePinIds.length} 项
        </span>
        <span>
          <BranchFork24Regular aria-hidden="true" />
          {state.simulation ? "1 个试排分支" : "暂无试排分支"}
        </span>
        <span>
          <DocumentSearch24Regular aria-hidden="true" />
          {state.timeline.length} 条回放记录
        </span>
      </footer>
    </div>
  );
}

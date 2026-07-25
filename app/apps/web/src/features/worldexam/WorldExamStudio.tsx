import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowDown24Regular,
  ArrowLeft24Regular,
  ArrowRight24Regular,
  ArrowUp24Regular,
  BookOpen24Regular,
  CalendarClock24Regular,
  Checkmark24Regular,
  CheckmarkCircle24Filled,
  DataTrending24Regular,
  Dismiss24Regular,
  DocumentSearch24Regular,
  Eye24Regular,
  Flag24Regular,
  History24Regular,
  LockClosed24Regular,
  Play24Filled,
  Replay24Regular,
  Save24Regular,
  ShieldCheckmark24Regular,
  Sparkle24Regular,
  Trophy24Regular,
  Warning24Regular,
} from "@fluentui/react-icons";
import { SMARTCOURSE_FIXTURE } from "../smartcourse/fixture";
import {
  answerWarmup,
  archiveExam,
  canOpenExamStep,
  challengeAiClaim,
  checkQuestionSources,
  createWorldExamState,
  exportReflectionPayload,
  finishKeyMatch,
  getExamBoxScore,
  isKeyMatchReady,
  movePlaybookSection,
  openBriefing,
  openPlaybook,
  openReflection,
  resetWorldExamState,
  retryWarmup,
  saveReflection,
  setExamStep,
  setNarrativeMode,
  setSyncState,
  skipWarmup,
  startKeyMatch,
  startWarmup,
  submitMatchAnswer,
  togglePlaybookItem,
} from "./engine";
import { WORLD_EXAM_FIXTURE } from "./fixture";
import {
  clearWorldExamState,
  loadWorldExamState,
  saveWorldExamState,
} from "./storage";
import type {
  ExamStep,
  MatchQuestion,
  NarrativeMode,
  PostGameReflection,
  WorldExamState,
} from "./types";
import { useI18n } from "../../i18n/I18nProvider";
import "./worldexam.css";

type WorldExamStudioProps = {
  backendLabel: string;
  onExit: () => void;
};

const STEP_META: Array<{
  id: ExamStep;
  immersive: string;
  light: string;
  traditional: string;
  eyebrow: string;
}> = [
  {
    id: "calendar",
    immersive: "赛事日历",
    light: "考核日历",
    traditional: "考试安排",
    eyebrow: "EVENT CALENDAR",
  },
  {
    id: "briefing",
    immersive: "赛前简报",
    light: "准备简报",
    traditional: "考试范围",
    eyebrow: "BRIEFING",
  },
  {
    id: "warmup",
    immersive: "Warm-up",
    light: "起点练习",
    traditional: "低风险练习",
    eyebrow: "LOW-STAKES",
  },
  {
    id: "playbook",
    immersive: "复习 Playbook",
    light: "复习计划",
    traditional: "复习材料",
    eyebrow: "REVIEW PLAN",
  },
  {
    id: "match",
    immersive: "Key Match",
    light: "模拟考核",
    traditional: "模拟练习",
    eyebrow: "OPEN-BOOK",
  },
  {
    id: "replay",
    immersive: "Replay",
    light: "学习回放",
    traditional: "练习记录",
    eyebrow: "EVIDENCE",
  },
  {
    id: "reflection",
    immersive: "赛后复盘",
    light: "学习复盘",
    traditional: "学习总结",
    eyebrow: "PRIVATE NOTE",
  },
];

const MODE_LABEL: Record<NarrativeMode, string> = {
  immersive: "沉浸",
  light: "轻量",
  traditional: "传统",
};

const PUBLIC_DEMO_UNLOCKED = true;

const STATUS_LABEL: Record<WorldExamState["eventStatus"], string> = {
  scheduled: "已安排",
  briefing_open: "简报开放",
  warmup: "低风险准备",
  exam_active: "模拟练习中",
  review: "可复盘",
  archived: "已归档",
};

const SOURCE_LABEL = new Map(
  SMARTCOURSE_FIXTURE.sources.map((source) => [source.id, source]),
);
const OBJECT_LABEL = new Map(
  SMARTCOURSE_FIXTURE.objects.map((object) => [object.id, object]),
);

function eventLabel(mode: NarrativeMode) {
  if (mode === "traditional") return "模拟期末练习";
  if (mode === "light") return "期末准备节点";
  return "World Exam Finals · Key Match";
}

function StepIcon({
  open,
  current,
}: {
  open: boolean;
  current: boolean;
}) {
  if (!open) return <LockClosed24Regular aria-hidden="true" />;
  if (current) return <Play24Filled aria-hidden="true" />;
  return <CheckmarkCircle24Filled aria-hidden="true" />;
}

export function WorldExamStudio({
  backendLabel,
  onExit,
}: WorldExamStudioProps) {
  const { formatDate } = useI18n();
  const formatDateTime = (value: string) =>
    formatDate(value, {
      month: "numeric",
      day: "numeric",
      weekday: "short",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  const [state, setState] = useState(createWorldExamState);
  const [hydrated, setHydrated] = useState(false);
  const [message, setMessage] = useState(
    "这是一场演示练习，不计正式成绩，也不拿一次作答预测你的未来。",
  );
  const [offlineDemo, setOfflineDemo] = useState(false);
  const [selectedQuestionId, setSelectedQuestionId] = useState(
    WORLD_EXAM_FIXTURE.matchQuestions[0].id,
  );
  const [draftResponses, setDraftResponses] = useState<Record<string, string>>(
    {},
  );
  const [sourceDrawerQuestionId, setSourceDrawerQuestionId] = useState<
    string | null
  >(null);
  const finishMatchRef = useRef<HTMLButtonElement | null>(null);
  const [reflectionDraft, setReflectionDraft] =
    useState<PostGameReflection>(state.reflection);

  const selectedQuestion =
    WORLD_EXAM_FIXTURE.matchQuestions.find(
      (question) => question.id === selectedQuestionId,
    ) ?? WORLD_EXAM_FIXTURE.matchQuestions[0];
  const sourceDrawerQuestion =
    sourceDrawerQuestionId === "warmup-sls-cutoff"
      ? WORLD_EXAM_FIXTURE.warmup
      : WORLD_EXAM_FIXTURE.matchQuestions.find(
          (question) => question.id === sourceDrawerQuestionId,
        );
  const boxScore = getExamBoxScore(state);
  const orderedPlaybook = state.playbookOrder
    .map((sectionId) =>
      WORLD_EXAM_FIXTURE.playbook.find((section) => section.id === sectionId),
    )
    .filter((section): section is NonNullable<typeof section> =>
      Boolean(section),
    );
  const currentStepIndex = STEP_META.findIndex(
    (step) => step.id === state.step,
  );
  const warmupCorrect =
    state.warmupAnswer === WORLD_EXAM_FIXTURE.warmup.correctAnswer;
  const archived = state.eventStatus === "archived";
  const matchReady = isKeyMatchReady(state);
  const unansweredCount = Math.max(
    0,
    WORLD_EXAM_FIXTURE.matchQuestions.length -
      new Set(state.answers.map((answer) => answer.questionId)).size,
  );
  const answeredCount =
    WORLD_EXAM_FIXTURE.matchQuestions.length - unansweredCount;
  const outstandingMatchAction =
    unansweredCount > 0
      ? `还需完成 ${unansweredCount} 道题`
      : "还需挑战 1 条无依据断言";
  const currentStepMeta = STEP_META[currentStepIndex] ?? STEP_META[0];

  const copy = useMemo(
    () => ({
      title:
        state.narrativeMode === "traditional"
          ? "考试复习中心"
          : state.narrativeMode === "light"
            ? "期末准备中心"
            : "WORLD EXAM FINALS",
      event: eventLabel(state.narrativeMode),
    }),
    [state.narrativeMode],
  );

  const commit = (updater: (current: WorldExamState) => WorldExamState) => {
    setState((current) => {
      const next = updater(current);
      return offlineDemo
        ? setSyncState(
            next,
            "offline_cached",
            Math.max(1, current.pendingSyncCount + 1),
          )
        : next;
    });
  };

  useEffect(() => {
    let cancelled = false;
    void loadWorldExamState()
      .then((cached) => {
        if (cancelled) return;
        if (cached) {
          setState(cached);
          setReflectionDraft(cached.reflection);
          setMessage("已恢复本机 IndexedDB 中的模拟复习进度。");
        }
      })
      .catch(() => {
        if (!cancelled) {
          setState((current) =>
            setSyncState(current, "memory_fallback", 0),
          );
          setMessage("IndexedDB 不可用，已切换到当前会话内存回退。");
        }
      })
      .finally(() => {
        if (!cancelled) setHydrated(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!hydrated || state.syncStatus === "memory_fallback") return;
    void saveWorldExamState(state).catch(() => {
      setState((current) => setSyncState(current, "memory_fallback", 0));
      setMessage("缓存写入失败；当前会话仍可继续，但刷新后可能无法恢复。");
    });
  }, [hydrated, state]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [state.step]);

  useEffect(() => {
    if (state.step !== "match" || !matchReady) return;
    const frame = window.requestAnimationFrame(() => {
      finishMatchRef.current?.focus({ preventScroll: true });
      finishMatchRef.current?.scrollIntoView({
        block: "center",
        inline: "nearest",
        behavior: "auto",
      });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [matchReady, state.step]);

  const goToStep = (step: ExamStep) => {
    try {
      commit((current) =>
        setExamStep(current, step, PUBLIC_DEMO_UNLOCKED),
      );
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "步骤仍被锁定。");
    }
  };

  const openQuestionSources = (question: MatchQuestion) => {
    commit((current) => checkQuestionSources(current, question.id));
    setSourceDrawerQuestionId(question.id);
    setMessage("来源抽屉已打开；查看来源不会影响正确率或正式权益。");
  };

  const selectQuestionResponse = (questionId: string, response: string) => {
    setDraftResponses((current) => ({
      ...current,
      [questionId]: response,
    }));
    try {
      commit((current) =>
        submitMatchAnswer(current, questionId, response),
      );
      const question = WORLD_EXAM_FIXTURE.matchQuestions.find(
        (candidate) => candidate.id === questionId,
      );
      const includesChallenge =
        question?.responseType === "source_challenge" &&
        response === question.correctAnswer;
      setMessage(
        includesChallenge
          ? "回答已自动保存；“挑战断言”选择同时记录了来源挑战，无需重复操作。"
          : "回答已自动保存在本机，可以随时回来修改。",
      );
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "回答未能自动保存。");
    }
  };

  const saveReflectionDraft = () => {
    try {
      commit((current) => saveReflection(current, reflectionDraft));
      setMessage(
        reflectionDraft.shareWithMentor
          ? "私密复盘已保存；导师分享同意带到期日，可随时撤回。"
          : "私密复盘已保存，默认仅南同学本人可见。",
      );
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "复盘未能保存。");
    }
  };

  const exportReflection = () => {
    const payload = exportReflectionPayload(state);
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "university2k26-world-exam-reflection-fixture.json";
    anchor.click();
    URL.revokeObjectURL(url);
    setMessage("复盘 JSON 已导出；文件标为演示记录，不能代替正式成绩。");
  };

  const resetDemo = () => {
    setState(resetWorldExamState());
    setReflectionDraft(resetWorldExamState().reflection);
    setDraftResponses({});
    setSelectedQuestionId(WORLD_EXAM_FIXTURE.matchQuestions[0].id);
    setSourceDrawerQuestionId(null);
    setOfflineDemo(false);
    void clearWorldExamState().catch(() => undefined);
    setMessage("World Exam Finals Demo 已重置。");
  };

  const toggleOffline = () => {
    if (offlineDemo) {
      setOfflineDemo(false);
      setState((current) => setSyncState(current, "synced", 0));
      setMessage("网络恢复演练完成；本地待同步动作已清零。");
      return;
    }
    setOfflineDemo(true);
    setState((current) => setSyncState(current, "offline_cached", 0));
    setMessage("模拟离线已开启；新动作写入 IndexedDB，恢复后再同步。");
  };

  return (
    <div
      className={[
        "world-exam",
        `mode-${state.narrativeMode}`,
        offlineDemo ? "is-offline" : "",
      ].join(" ")}
    >
      <div className="world-exam__background" aria-hidden="true" />
      {offlineDemo && (
        <div className="exam-offline-banner" role="status">
          离线演练 · {state.pendingSyncCount} 个动作待同步 · IndexedDB 缓存
        </div>
      )}

      <header className="world-exam__topbar">
        <button
          className="exam-back"
          type="button"
          onClick={onExit}
          data-focusable="true"
        >
          <ArrowLeft24Regular aria-hidden="true" />
          返回 MyCareer
        </button>
        <div className="exam-wordmark">
          <span>UNIVERSITY<strong>2K26</strong></span>
          <b>{copy.title}</b>
        </div>
        <div className="exam-mode-switch" aria-label="叙事强度">
          {(Object.keys(MODE_LABEL) as NarrativeMode[]).map((mode) => (
            <button
              type="button"
              key={mode}
              className={state.narrativeMode === mode ? "is-active" : ""}
              aria-pressed={state.narrativeMode === mode}
              onClick={() =>
                setState((current) => setNarrativeMode(current, mode))
              }
              data-focusable="true"
            >
              {MODE_LABEL[mode]}
            </button>
          ))}
        </div>
        <button
          className="exam-sync"
          type="button"
          onClick={toggleOffline}
          aria-pressed={offlineDemo}
          data-focusable="true"
        >
          <ShieldCheckmark24Regular aria-hidden="true" />
          {offlineDemo ? "恢复网络" : backendLabel}
        </button>
      </header>

      <aside className="world-exam__steps" aria-label="World Exam Finals 步骤">
        <div className="exam-step-summary">
          <span>F-005 · 演示赛</span>
          <strong>{copy.event}</strong>
          <small>{STATUS_LABEL[state.eventStatus]} · 不计正式成绩</small>
        </div>
        <ol>
          {STEP_META.map((step, index) => {
            const open = canOpenExamStep(
              state,
              step.id,
              PUBLIC_DEMO_UNLOCKED,
            );
            const current = state.step === step.id;
            return (
              <li key={step.id}>
                <button
                  type="button"
                  disabled={!open}
                  className={current ? "is-current" : ""}
                  aria-current={current ? "step" : undefined}
                  aria-label={`${step[state.narrativeMode]}，步骤 ${index + 1}${
                    current ? "，当前" : open ? "，可打开" : "，未解锁"
                  }`}
                  onClick={() => goToStep(step.id)}
                  data-focusable="true"
                >
                  <StepIcon open={open} current={current} />
                  <span>
                    <small>{step.eyebrow}</small>
                    <strong>{step[state.narrativeMode]}</strong>
                  </span>
                  <b>{String(index + 1).padStart(2, "0")}</b>
                </button>
              </li>
            );
          })}
        </ol>
        <div className="exam-private-note">
          <LockClosed24Regular aria-hidden="true" />
          <span>
            Demo 全流程可试玩
            <small>正式模式保留流程门 · 个人数据默认私密</small>
          </span>
        </div>
      </aside>

      <main className="world-exam__main">
        <div className="exam-view-heading">
          <div>
            <span>
              {String(currentStepIndex + 1).padStart(2, "0")} ·{" "}
              {currentStepMeta.eyebrow}
            </span>
            <h1>{currentStepMeta[state.narrativeMode]}</h1>
          </div>
          <span className={`exam-state state-${state.eventStatus}`}>
            {STATUS_LABEL[state.eventStatus]}
          </span>
        </div>

        {state.step === "calendar" && (
          <section className="exam-calendar" aria-labelledby="calendar-title">
            <article className="exam-featured-event">
              <div className="event-poster-copy">
                <span>UPCOMING · 公开演示</span>
                <h2 id="calendar-title">{WORLD_EXAM_FIXTURE.event.title}</h2>
                <p>
                  这是一场低风险模拟练习：用于验证来源、复习和回放，不是学校正式考试，也不会写入成绩。
                </p>
              </div>
              <dl>
                <div>
                  <dt>安排时间</dt>
                  <dd>{formatDateTime(WORLD_EXAM_FIXTURE.event.scheduledAt)}</dd>
                </div>
                <div>
                  <dt>建议用时</dt>
                  <dd>{WORLD_EXAM_FIXTURE.event.durationMinutes} 分钟</dd>
                </div>
                <div>
                  <dt>正式性</dt>
                  <dd>模拟 · 不计成绩</dd>
                </div>
              </dl>
              <button
                className="exam-primary"
                type="button"
                onClick={() => {
                  commit(openBriefing);
                  setMessage("赛前简报已打开；没有倒计时恐吓或通过概率。");
                }}
                data-focusable="true"
              >
                <DocumentSearch24Regular aria-hidden="true" />
                查看准备简报
                <ArrowRight24Regular aria-hidden="true" />
              </button>
            </article>
            <section
              className="world-finals-stadium"
              aria-labelledby="world-finals-stadium-heading"
            >
              <header>
                <div>
                  <span>ACADEMIC STADIUM // OPT-IN BROADCAST</span>
                  <h2 id="world-finals-stadium-heading">
                    五万人学术体育场，不是五万人的公开排名
                  </h2>
                  <p>
                    这是赛季终局的舞台设计：不同学科分区同步开卷挑战，主持人只解说题目、
                    模型转折与匿名聚合趋势；个人答案、成绩、求助和复盘默认留在私密席。
                  </p>
                </div>
                <span className="world-finals-stadium__fixture">
                  50,000 是舞台设定，不是实到人数
                </span>
              </header>
              <div className="world-finals-stadium__grid">
                <article>
                  <Trophy24Regular aria-hidden="true" />
                  <span>
                    <small>ARENA FORMAT</small>
                    <strong>12 个学科赛区</strong>
                    <p>同一开幕与收官，不同课程使用自己的来源、工具和作答形式。</p>
                  </span>
                </article>
                <article>
                  <DataTrending24Regular aria-hidden="true" />
                  <span>
                    <small>LIVE DESK</small>
                    <strong>双语实时解说</strong>
                    <p>只讲策略、证据核验与常见转折，不公开个人排名或制造羞辱。</p>
                  </span>
                </article>
                <article>
                  <Eye24Regular aria-hidden="true" />
                  <span>
                    <small>PUBLIC FEED</small>
                    <strong>匿名聚合大屏</strong>
                    <p>展示全场进度区间、来源挑战和协作里程碑；小样本自动隐藏。</p>
                  </span>
                </article>
                <article>
                  <ShieldCheckmark24Regular aria-hidden="true" />
                  <span>
                    <small>PLAYER CONTROL</small>
                    <strong>本人决定是否登场</strong>
                    <p>公开作品逐项预览与授权，随时退出直播；正式成绩不进入转播层。</p>
                  </span>
                </article>
              </div>
            </section>
            <div className="exam-calendar-strip" aria-label="其他考核节点">
              <article>
                <CheckmarkCircle24Filled aria-hidden="true" />
                <span>
                  <small>7 月 22 日 · 已结束</small>
                  <strong>RC 时域响应周练</strong>
                  <b>记录可回看</b>
                </span>
              </article>
              <article>
                <CalendarClock24Regular aria-hidden="true" />
                <span>
                  <small>8 月 2 日 · 尚未开放</small>
                  <strong>Bode 图实验说明</strong>
                  <b>等待教师范围</b>
                </span>
              </article>
            </div>
          </section>
        )}

        {state.step === "briefing" && (
          <section className="briefing-view">
            <article className="briefing-scope">
              <span>SCOPE · 教师批准内容的演示映射</span>
              <h2>{WORLD_EXAM_FIXTURE.briefing.scopeSummary}</h2>
              <div className="readiness-meter">
                <div>
                  <span>当前覆盖快照</span>
                  <strong>
                    {WORLD_EXAM_FIXTURE.briefing.readiness.coveragePct}%
                  </strong>
                </div>
                <div
                  role="progressbar"
                  aria-label="复习范围覆盖快照"
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={
                    WORLD_EXAM_FIXTURE.briefing.readiness.coveragePct
                  }
                >
                  <span
                    style={{
                      width: `${WORLD_EXAM_FIXTURE.briefing.readiness.coveragePct}%`,
                    }}
                  />
                </div>
                <small>
                  只描述已覆盖内容，不预测通过、挂科或正式成绩。
                </small>
              </div>
            </article>
            <div className="briefing-grid">
              <section>
                <h3>范围来源</h3>
                {WORLD_EXAM_FIXTURE.briefing.sources.map((link) => {
                  const source = SOURCE_LABEL.get(link.sourceId);
                  return (
                    <article key={link.sourceId} className="briefing-source">
                      <DocumentSearch24Regular aria-hidden="true" />
                      <span>
                        <strong>{source?.title ?? link.sourceId}</strong>
                        <small>{source?.locator} · {link.coverage}</small>
                      </span>
                    </article>
                  );
                })}
              </section>
              <section>
                <h3>能力目标</h3>
                <ul>
                  {WORLD_EXAM_FIXTURE.briefing.competencyTargets.map(
                    (target) => (
                      <li key={target}>{target}</li>
                    ),
                  )}
                </ul>
                <h3>已知薄弱 / 未知</h3>
                <p>
                  薄弱：
                  {WORLD_EXAM_FIXTURE.briefing.readiness.weakAreas.join("、")}
                </p>
                <p>
                  未知：
                  {WORLD_EXAM_FIXTURE.briefing.readiness.unknownAreas.join("、")}
                </p>
              </section>
            </div>
            <button
              className="exam-primary"
              type="button"
              onClick={() => {
                commit(startWarmup);
                setMessage("Warm-up 是可跳过、可重试、不计成绩的起点检查。");
              }}
              data-focusable="true"
            >
              <Play24Filled aria-hidden="true" />
              开始低风险 Warm-up
              <ArrowRight24Regular aria-hidden="true" />
            </button>
          </section>
        )}

        {state.step === "warmup" && (
          <section className="warmup-view">
            <div className="low-stakes-banner">
              <ShieldCheckmark24Regular aria-hidden="true" />
              <span>
                <strong>低风险、不计成绩、可跳过</strong>
                <small>答错只改变本次复习建议，不形成长期能力标签。</small>
              </span>
            </div>
            <article className="warmup-card">
              <span>来自 {WORLD_EXAM_FIXTURE.warmup.objectId}</span>
              <h2>{WORLD_EXAM_FIXTURE.warmup.prompt}</h2>
              <div className="exam-options">
                {WORLD_EXAM_FIXTURE.warmup.options.map((option) => (
                  <button
                    type="button"
                    key={option.id}
                    className={
                      state.warmupAnswer === option.id ? "is-selected" : ""
                    }
                    aria-pressed={state.warmupAnswer === option.id}
                    onClick={() => {
                      if (state.warmupAnswer) return;
                      commit((current) => answerWarmup(current, option.id));
                    }}
                    data-focusable="true"
                  >
                    <span>{option.id.slice(0, 1).toUpperCase()}</span>
                    {option.label}
                  </button>
                ))}
              </div>
              {state.warmupAnswer && (
                <div
                  className={`warmup-result ${
                    warmupCorrect ? "is-correct" : "is-review"
                  }`}
                  role="status"
                >
                  {warmupCorrect ? (
                    <CheckmarkCircle24Filled aria-hidden="true" />
                  ) : (
                    <Warning24Regular aria-hidden="true" />
                  )}
                  <span>
                    <strong>{warmupCorrect ? "理解命中" : "这次需要复核"}</strong>
                    <small>{WORLD_EXAM_FIXTURE.warmup.explanation}</small>
                  </span>
                </div>
              )}
              <div className="warmup-actions">
                <button
                  type="button"
                  onClick={() => {
                    setSourceDrawerQuestionId(WORLD_EXAM_FIXTURE.warmup.id);
                    setMessage("已打开热身题对应的 F-001 来源。");
                  }}
                  data-focusable="true"
                >
                  <Eye24Regular aria-hidden="true" />
                  查看来源
                </button>
                {state.warmupAnswer ? (
                  <>
                    <button
                      type="button"
                      onClick={() => commit(retryWarmup)}
                      data-focusable="true"
                    >
                      <Replay24Regular aria-hidden="true" />
                      清空重试
                    </button>
                    <button
                      className="is-primary"
                      type="button"
                      onClick={() => {
                        commit(openPlaybook);
                        setMessage("已进入教师批准内容组成的复习 Playbook。");
                      }}
                      data-focusable="true"
                    >
                      进入复习计划
                      <ArrowRight24Regular aria-hidden="true" />
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      commit(skipWarmup);
                      setMessage("已跳过 Warm-up；没有资源或功能被锁住。");
                    }}
                    data-focusable="true"
                  >
                    跳过并继续
                  </button>
                )}
              </div>
            </article>
          </section>
        )}

        {state.step === "playbook" && (
          <section className="playbook-view">
            <div className="playbook-summary">
              <div>
                <span>PERSONAL CHECKPOINT</span>
                <strong>
                  {state.completedPlaybookItemIds.length} /{" "}
                  {WORLD_EXAM_FIXTURE.playbook.flatMap(
                    (section) => section.items,
                  ).length}
                </strong>
                <small>可勾选、撤回和调整顺序；不影响正式权益。</small>
              </div>
              <Trophy24Regular aria-hidden="true" />
            </div>
            <div className="playbook-sections">
              {orderedPlaybook.map((section, index) => (
                <article key={section.id}>
                  <header>
                    <div>
                      <span>SECTION {String(index + 1).padStart(2, "0")}</span>
                      <h2>{section.title}</h2>
                      <small>{section.knowledgePoints.join(" · ")}</small>
                    </div>
                    <div>
                      <button
                        type="button"
                        aria-label={`上移 ${section.title}`}
                        disabled={index === 0}
                        onClick={() =>
                          commit((current) =>
                            movePlaybookSection(current, section.id, -1),
                          )
                        }
                        data-focusable="true"
                      >
                        <ArrowUp24Regular aria-hidden="true" />
                      </button>
                      <button
                        type="button"
                        aria-label={`下移 ${section.title}`}
                        disabled={index === orderedPlaybook.length - 1}
                        onClick={() =>
                          commit((current) =>
                            movePlaybookSection(current, section.id, 1),
                          )
                        }
                        data-focusable="true"
                      >
                        <ArrowDown24Regular aria-hidden="true" />
                      </button>
                    </div>
                  </header>
                  <div>
                    {section.items.map((item) => {
                      const complete =
                        state.completedPlaybookItemIds.includes(item.id);
                      const object = OBJECT_LABEL.get(item.objectId);
                      return (
                        <button
                          className={complete ? "is-complete" : ""}
                          type="button"
                          key={item.id}
                          aria-pressed={complete}
                          onClick={() =>
                            commit((current) =>
                              togglePlaybookItem(current, item.id),
                            )
                          }
                          data-focusable="true"
                        >
                          {complete ? (
                            <CheckmarkCircle24Filled aria-hidden="true" />
                          ) : (
                            <BookOpen24Regular aria-hidden="true" />
                          )}
                          <span>
                            <strong>{item.title}</strong>
                            <small>
                              {item.estimatedMinutes} 分钟 · {object?.status ?? "published fixture"} ·{" "}
                              {item.sourceIds.length} 个来源
                            </small>
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </article>
              ))}
            </div>
            <button
              className="exam-primary"
              type="button"
              onClick={() => {
                commit(startKeyMatch);
                setMessage("模拟 Key Match 已开始；它仍然不计正式成绩。");
              }}
              data-focusable="true"
            >
              <Play24Filled aria-hidden="true" />
              进入 Open-book Key Match
              <ArrowRight24Regular aria-hidden="true" />
            </button>
          </section>
        )}

        {state.step === "match" && (
          <section className="match-view">
            <div className="match-safety">
              <Warning24Regular aria-hidden="true" />
              <span>
                <strong>模拟练习 · 不计正式成绩</strong>
                <small>
                  可以先看来源、修改答案并挑战 AI；没有公开排名或倒计时惩罚。
                </small>
              </span>
            </div>
            <div
              className={`match-progress ${matchReady ? "is-ready" : ""}`}
              role="status"
              aria-live="polite"
            >
              <div>
                <span>MATCH PROGRESS</span>
                <strong>
                  {answeredCount} / {WORLD_EXAM_FIXTURE.matchQuestions.length}
                  {" "}回合已完成
                </strong>
              </div>
              <b>
                {matchReady
                  ? "Replay 已解锁"
                  : outstandingMatchAction}
              </b>
            </div>
            <button
              ref={finishMatchRef}
              className="exam-primary match-finish"
              type="button"
              disabled={!matchReady}
              onClick={() => {
                try {
                  commit(finishKeyMatch);
                  setMessage("模拟练习完成；Replay 已连接题目、来源、行动和修正。");
                } catch (error) {
                  setMessage(
                    error instanceof Error
                      ? error.message
                      : "模拟练习尚未完成。",
                  );
                }
              }}
              data-focusable="true"
            >
              <Replay24Regular aria-hidden="true" />
              {matchReady ? "完成并进入 Replay" : outstandingMatchAction}
              <ArrowRight24Regular aria-hidden="true" />
            </button>
            <div className="match-layout">
              <nav aria-label="模拟题目">
                {WORLD_EXAM_FIXTURE.matchQuestions.map((question, index) => {
                  const answer = state.answers.find(
                    (candidate) => candidate.questionId === question.id,
                  );
                  return (
                    <button
                      type="button"
                      key={question.id}
                      className={
                        selectedQuestion.id === question.id ? "is-active" : ""
                      }
                      aria-current={
                        selectedQuestion.id === question.id
                          ? "step"
                          : undefined
                      }
                      onClick={() => setSelectedQuestionId(question.id)}
                      data-focusable="true"
                    >
                      <span>Q{index + 1}</span>
                      <strong>
                        {question.responseType === "source_challenge"
                          ? "AI 来源挑战"
                          : "频率响应"}
                      </strong>
                      <small>
                        {answer
                          ? answer.correct
                            ? "已作答 · 命中"
                            : "已作答 · 待复盘"
                          : "尚未作答"}
                      </small>
                    </button>
                  );
                })}
              </nav>
              <article className="match-question" key={selectedQuestion.id}>
                <div className="match-question__heading">
                  <span>
                    {selectedQuestion.responseType === "source_challenge"
                      ? "SHOW YOUR WORK · AI CLAIM"
                      : "OPEN-BOOK PRACTICE"}
                  </span>
                  <button
                    type="button"
                    onClick={() => openQuestionSources(selectedQuestion)}
                    data-focusable="true"
                  >
                    <DocumentSearch24Regular aria-hidden="true" />
                    查看 {selectedQuestion.sourceIds.length} 个来源
                  </button>
                </div>
                <h2>{selectedQuestion.prompt}</h2>
                {selectedQuestion.aiTrace && (
                  <div className="ai-trace">
                    {selectedQuestion.aiTrace.map((claim) => (
                      <article
                        key={claim.id}
                        className={`confidence-${claim.confidence}`}
                      >
                        <span>
                          <strong>{claim.claim}</strong>
                          <small>
                            {claim.sourceId} · {claim.confidence}
                          </small>
                        </span>
                        {claim.confidence === "unsupported" && (
                          <button
                            type="button"
                            disabled={state.challengedClaimIds.includes(
                              claim.id,
                            )}
                            onClick={() => {
                              commit((current) =>
                                challengeAiClaim(current, claim.id),
                              );
                              setMessage(
                                "Challenge Call 已记录：unsupported 断言不能自动进入结论。",
                              );
                            }}
                            data-focusable="true"
                          >
                            <Flag24Regular aria-hidden="true" />
                            {state.challengedClaimIds.includes(claim.id)
                              ? "已挑战"
                              : "挑战断言"}
                          </button>
                        )}
                      </article>
                    ))}
                  </div>
                )}
                <div className="exam-options">
                  {selectedQuestion.options.map((option) => {
                    const savedResponse =
                      draftResponses[selectedQuestion.id] ??
                      state.answers.find(
                        (answer) =>
                          answer.questionId === selectedQuestion.id,
                      )?.response;
                    return (
                      <button
                        type="button"
                        key={option.id}
                        className={
                          savedResponse === option.id ? "is-selected" : ""
                        }
                        aria-pressed={savedResponse === option.id}
                        onClick={() =>
                          selectQuestionResponse(
                            selectedQuestion.id,
                            option.id,
                          )
                        }
                        data-focusable="true"
                      >
                        <span>{option.id.slice(0, 1).toUpperCase()}</span>
                        {option.label}
                      </button>
                    );
                  })}
                </div>
                <div
                  className="match-autosave"
                  role="status"
                  aria-live="polite"
                >
                  <CheckmarkCircle24Filled aria-hidden="true" />
                  <span>
                    <strong>自动保存已开启</strong>
                    <small>选择即保存；刷新后可恢复，完成前可修改。</small>
                  </span>
                </div>
              </article>
            </div>
          </section>
        )}

        {state.step === "replay" && (
          <section className="exam-replay">
            <div className="exam-box-score">
              <header>
                <div>
                  <span>PRIVATE BOX SCORE · NAN</span>
                  <h2>本次模拟复习摘要</h2>
                </div>
                <b>无排名</b>
              </header>
              <dl>
                <div>
                  <dt>完成度</dt>
                  <dd>{boxScore.completionPct}%</dd>
                </div>
                <div>
                  <dt>理解检查</dt>
                  <dd>
                    {boxScore.correctCount} / {boxScore.totalQuestions}
                  </dd>
                </div>
                <div>
                  <dt>主动看来源</dt>
                  <dd>{boxScore.sourcesChecked}</dd>
                </div>
                <div>
                  <dt>挑战无依据断言</dt>
                  <dd>{boxScore.challengedClaims}</dd>
                </div>
              </dl>
              <p>
                错误类型只是本次学习信号，不是人格或长期能力标签；不公开班级排名、GPA 天梯或伪精确胜率。
              </p>
            </div>
            <article className="exam-timeline">
              <header>
                <History24Regular aria-hidden="true" />
                <span>
                  <small>EVIDENCE TIMELINE</small>
                  <strong>{state.timeline.length} 个可回放事件</strong>
                </span>
              </header>
              <ol>
                {state.timeline.map((event) => (
                  <li key={event.id}>
                    <Checkmark24Regular aria-hidden="true" />
                    <span>
                      <strong>{event.label}</strong>
                      <small>
                        {event.id} · {formatDateTime(event.occurredAt)}
                        {event.sourceIds.length
                          ? ` · ${event.sourceIds.length} 个来源`
                          : ""}
                      </small>
                    </span>
                  </li>
                ))}
              </ol>
            </article>
            <button
              className="exam-primary"
              type="button"
              onClick={() => {
                commit(openReflection);
                setMessage("赛后复盘默认私密；每次分享都要单独确认并设置到期日。");
              }}
              data-focusable="true"
            >
              <Sparkle24Regular aria-hidden="true" />
              进入私密赛后复盘
              <ArrowRight24Regular aria-hidden="true" />
            </button>
          </section>
        )}

        {state.step === "reflection" && (
          <section className="reflection-view">
            <div className="reflection-privacy">
              <LockClosed24Regular aria-hidden="true" />
              <span>
                <strong>默认仅南同学本人可见</strong>
                <small>
                  {archived
                    ? "本次模拟已归档，复盘保持只读；既有分享同意仍按到期日自动失效。"
                    : "导师不会自动看到；分享时要设置到期日，也可以随时关闭。"}
                </small>
              </span>
            </div>
            <div className="reflection-form">
              <label>
                <span>这次什么方法有效？</span>
                <textarea
                  disabled={archived}
                  value={reflectionDraft.worked}
                  onChange={(event) =>
                    setReflectionDraft((current) => ({
                      ...current,
                      worked: event.target.value,
                    }))
                  }
                  placeholder="例如：先核对拓扑和单位，再比较三条波形。"
                />
              </label>
              <label>
                <span>哪里仍然卡住？</span>
                <textarea
                  disabled={archived}
                  value={reflectionDraft.blocked}
                  onChange={(event) =>
                    setReflectionDraft((current) => ({
                      ...current,
                      blocked: event.target.value,
                    }))
                  }
                  placeholder="例如：仪器输入阻抗怎样进入误差模型。"
                />
              </label>
              <label>
                <span>下一次准备怎样调整？</span>
                <textarea
                  disabled={archived}
                  value={reflectionDraft.nextAdjustment}
                  onChange={(event) =>
                    setReflectionDraft((current) => ({
                      ...current,
                      nextAdjustment: event.target.value,
                    }))
                  }
                  placeholder="例如：补一张仪器负载检查卡，再做一次 Bode 对照。"
                />
              </label>
              <button
                className="reflection-share"
                type="button"
                role="switch"
                aria-checked={reflectionDraft.shareWithMentor}
                disabled={archived}
                onClick={() =>
                  setReflectionDraft((current) => ({
                    ...current,
                    shareWithMentor: !current.shareWithMentor,
                    shareExpiresAt: current.shareWithMentor
                      ? null
                      : "2026-08-07",
                  }))
                }
                data-focusable="true"
              >
                <ShieldCheckmark24Regular aria-hidden="true" />
                <span>
                  <strong>自愿分享给导师</strong>
                  <small>默认关闭；只分享这份复盘，不分享完整答题轨迹。</small>
                </span>
                <b>
                  {reflectionDraft.shareWithMentor ? "已开启" : "关闭"}
                </b>
              </button>
              {reflectionDraft.shareWithMentor && (
                <label className="reflection-expiry">
                  <span>分享自动到期</span>
                  <input
                    type="date"
                    disabled={archived}
                    value={reflectionDraft.shareExpiresAt ?? ""}
                    onChange={(event) =>
                      setReflectionDraft((current) => ({
                        ...current,
                        shareExpiresAt: event.target.value || null,
                      }))
                    }
                  />
                </label>
              )}
              <div className="reflection-actions">
                <button
                  type="button"
                  disabled={archived}
                  onClick={saveReflectionDraft}
                  data-focusable="true"
                >
                  <Save24Regular aria-hidden="true" />
                  保存私密复盘
                </button>
                <button
                  type="button"
                  disabled={!state.reflection.worked}
                  onClick={exportReflection}
                  data-focusable="true"
                >
                  <ArrowDown24Regular aria-hidden="true" />
                  导出演示 JSON
                </button>
                <button
                  type="button"
                  disabled={!state.reflection.worked || archived}
                  onClick={() => {
                    try {
                      commit(archiveExam);
                      setMessage("模拟赛事已归档；可继续查看但不再接受新答题。");
                    } catch (error) {
                      setMessage(
                        error instanceof Error
                          ? error.message
                          : "尚不能归档。",
                      );
                    }
                  }}
                  data-focusable="true"
                >
                  <CheckmarkCircle24Filled aria-hidden="true" />
                  {archived ? "本次模拟已归档" : "归档本次模拟"}
                </button>
              </div>
            </div>
          </section>
        )}
      </main>

      <footer className="world-exam__status" role="status">
        <span>{message}</span>
        <div>
          <small>
            {state.syncStatus === "synced"
              ? "本机已缓存"
              : state.syncStatus === "offline_cached"
                ? `${state.pendingSyncCount} 个动作待同步`
                : "仅当前会话"}
          </small>
          <button type="button" onClick={resetDemo} data-focusable="true">
            <Replay24Regular aria-hidden="true" />
            重置 F-005
          </button>
        </div>
      </footer>

      {sourceDrawerQuestion && (
        <>
          <button
            className="exam-source-backdrop"
            type="button"
            aria-label="关闭来源抽屉"
            onClick={() => setSourceDrawerQuestionId(null)}
          />
          <aside
            className="exam-source-drawer"
            role="dialog"
            aria-modal="true"
            aria-labelledby="exam-source-heading"
            onKeyDown={(event) => {
              if (event.key === "Escape") {
                event.preventDefault();
                event.stopPropagation();
                setSourceDrawerQuestionId(null);
              }
            }}
          >
            <header>
              <div>
                <span>F-001 SOURCE TRACE</span>
                <h2 id="exam-source-heading">题目来源</h2>
              </div>
              <button
                type="button"
                aria-label="关闭来源"
                autoFocus
                onClick={() => setSourceDrawerQuestionId(null)}
                data-focusable="true"
              >
                <Dismiss24Regular aria-hidden="true" />
              </button>
            </header>
            <p>{sourceDrawerQuestion.prompt}</p>
            <div>
              {sourceDrawerQuestion.sourceIds.map((sourceId) => {
                const source = SOURCE_LABEL.get(sourceId);
                return (
                  <article key={sourceId}>
                    <span>
                      <strong>{source?.title ?? sourceId}</strong>
                      <small>{source?.locator} · {sourceId}</small>
                    </span>
                    <blockquote>{source?.quote ?? "来源暂不可用"}</blockquote>
                  </article>
                );
              })}
            </div>
            <small>
              这些材料已经过教师审核；打开来源不会替你改答案或正确率。
            </small>
          </aside>
        </>
      )}
    </div>
  );
}

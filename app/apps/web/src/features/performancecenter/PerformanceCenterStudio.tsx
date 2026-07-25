import { useEffect, useMemo, useState } from "react";
import {
  Accessibility24Regular,
  Archive24Regular,
  ArrowDownload24Regular,
  ArrowLeft24Regular,
  ArrowSync24Regular,
  BookOpen24Regular,
  CalendarClock24Regular,
  CheckmarkCircle24Filled,
  CloudOff24Regular,
  DataBarVertical24Regular,
  DataTrending24Regular,
  DocumentSearch24Regular,
  Eye24Regular,
  Flag24Regular,
  History24Regular,
  Info24Regular,
  LockClosed24Regular,
  Person24Regular,
  PersonFeedback24Regular,
  Settings24Regular,
  ShieldCheckmark24Regular,
  ShieldError24Regular,
  Sparkle24Regular,
  TargetArrow24Regular,
  Trophy24Regular,
  Warning24Regular,
} from "@fluentui/react-icons";
import {
  actOnRecommendation,
  buildPrivateArchive,
  buildTrendText,
  createPerformanceState,
  createShareGrant,
  disableClimate,
  previewShare,
  recordExport,
  reportHarm,
  requestCorrection,
  revokeShareGrant,
  selectMetric,
  setClimateVariant,
  toggleOffline,
} from "./engine";
import {
  clearPerformanceState,
  loadPerformanceState,
  savePerformanceState,
} from "./storage";
import type {
  ClimateVariant,
  ConfidenceLevel,
  PerformanceState,
  PerformanceStep,
  ShareDraft,
} from "./types";
import "./performancecenter.css";

type PerformanceCenterStudioProps = {
  backendLabel: string;
  onExit: () => void;
};

const STEP_LABELS: Array<{
  id: PerformanceStep;
  immersive: string;
  traditional: string;
  icon: typeof DataBarVertical24Regular;
}> = [
  {
    id: "baseline",
    immersive: "Self Baseline",
    traditional: "个人基线",
    icon: Person24Regular,
  },
  {
    id: "trends",
    immersive: "Rhythm Film",
    traditional: "趋势与能力",
    icon: DataTrending24Regular,
  },
  {
    id: "load",
    immersive: "Load Lab",
    traditional: "负荷与支持",
    icon: CalendarClock24Regular,
  },
  {
    id: "next",
    immersive: "Next Move",
    traditional: "徽章与建议",
    icon: TargetArrow24Regular,
  },
  {
    id: "privacy",
    immersive: "Privacy Replay",
    traditional: "分享、纠错与回放",
    icon: ShieldCheckmark24Regular,
  },
];

const CONFIDENCE_LABEL: Record<ConfidenceLevel, string> = {
  high: "证据充分",
  medium: "中等证据",
  low: "有限证据",
  insufficient: "数据不足",
};

const CLIMATE_LABEL: Record<ClimateVariant, string> = {
  a_numbers: "A · 数字隐喻",
  b_words: "B · 文字状态",
  c_dimensions: "C · 无隐喻",
};

const RECOMMENDATION_LABEL = {
  open: "待决定",
  adopted: "已加入 Next Move",
  later: "稍后处理",
  dismissed: "已拒绝",
} as const;

type PrivacyPlay = "share" | "correction" | "stop" | "replay";

const PRIVACY_PLAYS: Array<{
  id: PrivacyPlay;
  number: string;
  immersive: string;
  traditional: string;
  description: string;
  icon: typeof ShieldCheckmark24Regular;
}> = [
  {
    id: "share",
    number: "P1",
    immersive: "Share Loadout",
    traditional: "定向分享",
    description: "先预览，再决定对象、用途、维度和到期日",
    icon: Eye24Regular,
  },
  {
    id: "correction",
    number: "P2",
    immersive: "Challenge Call",
    traditional: "人工纠错",
    description: "针对一条记录提出可版本化的修正",
    icon: PersonFeedback24Regular,
  },
  {
    id: "stop",
    number: "P3",
    immersive: "STOP Gate",
    traditional: "伤害停损",
    description: "误解、焦虑或标签化出现时立即下线",
    icon: ShieldError24Regular,
  },
  {
    id: "replay",
    number: "P4",
    immersive: "Replay Ledger",
    traditional: "私密回放",
    description: "回看授权、撤回、纠错和停损回执",
    icon: History24Regular,
  },
];

function downloadJson(filename: string, payload: unknown) {
  const blob = new Blob([`${JSON.stringify(payload, null, 2)}\n`], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

function ConfidenceBadge({ level }: { level: ConfidenceLevel }) {
  const Icon =
    level === "insufficient" ? Warning24Regular : ShieldCheckmark24Regular;
  return (
    <span className={`performance-confidence is-${level}`}>
      <Icon aria-hidden="true" />
      {CONFIDENCE_LABEL[level]}
    </span>
  );
}

function TrendStrip({
  state,
  metricId,
}: {
  state: PerformanceState;
  metricId: string;
}) {
  const metric = state.metrics.find((item) => item.id === metricId);
  const observation = state.observations.find(
    (item) => item.metricId === metricId,
  );
  if (!metric || !observation) return null;
  const observedValues = observation.trend
    .map((point) => point.value)
    .filter((value): value is number => value !== null);
  const max = Math.max(...observedValues, 1);

  return (
    <div className="performance-trend">
      <p className="performance-trend__summary">
        <Accessibility24Regular aria-hidden="true" />
        文本等价：{buildTrendText(state, metricId)}
      </p>
      <ol aria-label={`${metric.label}趋势`}>
        {observation.trend.map((point) => (
          <li
            key={`${metricId}-${point.period}`}
            className={point.status === "gap" ? "is-gap" : undefined}
          >
            <span>{point.label}</span>
            {point.status === "gap" ? (
              <strong>GAP</strong>
            ) : (
              <meter
                min={0}
                max={max}
                value={point.value ?? 0}
                aria-label={`${point.label}：${point.value} ${metric.unit}`}
              />
            )}
            <small>
              {point.status === "gap" ? "数据缺口" : point.value}
            </small>
          </li>
        ))}
      </ol>
    </div>
  );
}

export function PerformanceCenterStudio({
  backendLabel,
  onExit,
}: PerformanceCenterStudioProps) {
  const [state, setState] = useState<PerformanceState>(() => {
    try {
      return loadPerformanceState() ?? createPerformanceState();
    } catch {
      return createPerformanceState();
    }
  });
  const [traditional, setTraditional] = useState(false);
  const [shareDraft, setShareDraft] = useState<ShareDraft>({
    recipient: "学业导师（演示）",
    purpose: "讨论本人下一周任务安排",
    durationDays: 7,
    dimensionIds: ["ability-knowledge"],
  });
  const [correctionReason, setCorrectionReason] = useState(
    "这条观察遗漏了一次离线修订，请人工核对 Replay。",
  );
  const [harmDescription, setHarmDescription] = useState(
    "数字温度让我误以为这是百分制成绩。",
  );
  const [privacyPlay, setPrivacyPlay] = useState<PrivacyPlay>("share");

  useEffect(() => {
    savePerformanceState(state);
  }, [state]);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [state.step]);

  const currentStep =
    STEP_LABELS.find((step) => step.id === state.step) ?? STEP_LABELS[0];
  const selectedMetric =
    state.metrics.find((metric) => metric.id === state.selectedMetricId) ??
    state.metrics[0];
  const selectedObservation = state.observations.find(
    (observation) => observation.metricId === selectedMetric?.id,
  );
  const selectedEvidence = useMemo(() => {
    const ids = new Set(selectedObservation?.sourceIds ?? []);
    return state.evidence.filter((item) => ids.has(item.id));
  }, [selectedObservation, state.evidence]);
  const sharePreview = useMemo(
    () => previewShare(state, shareDraft),
    [shareDraft, state],
  );
  const openRecommendationCount = state.recommendations.filter(
    (item) => item.status === "open",
  ).length;
  const activeShareCount = state.shareGrants.filter(
    (item) => item.revokedAt === null,
  ).length;
  const openStopCount = state.harmSignals.filter(
    (item) => item.severity === "stop" && item.status === "open",
  ).length;

  const commit = (
    action: (current: PerformanceState) => PerformanceState,
    fallback = "操作未完成。",
  ) => {
    try {
      setState((current) => action(current));
    } catch (error) {
      setState((current) => ({
        ...current,
        message: error instanceof Error ? error.message : fallback,
      }));
    }
  };

  const reset = () => {
    clearPerformanceState();
    setState(createPerformanceState());
    setPrivacyPlay("share");
  };

  const exportArchive = () => {
    const recorded = recordExport(state);
    downloadJson(
      "university2k26-performance-private-fixture.json",
      buildPrivateArchive(recorded),
    );
    setState(recorded);
  };

  return (
    <div
      className={[
        "performance-shell",
        traditional ? "is-traditional" : "",
        state.offline ? "is-offline" : "",
        state.simplified ? "is-simplified" : "",
        state.reducedMotion ? "is-reduced-motion" : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <a className="skip-link" href="#performance-main">
        跳到 Performance Center 主要内容
      </a>
      <div className="performance-shell__background" aria-hidden="true" />

      <header className="performance-topbar">
        <button
          className="performance-back"
          type="button"
          onClick={onExit}
          data-focusable="true"
        >
          <ArrowLeft24Regular aria-hidden="true" />
          返回 MyCareer
        </button>
        <div className="performance-brand">
          <span>UNIVERSITY2K26 // F-006</span>
          <strong>PERFORMANCE CENTER</strong>
        </div>
        <div className="performance-topbar__status">
          <span>
            <DataBarVertical24Regular aria-hidden="true" />
            {state.offline ? "本地缓存（只读）" : backendLabel}
          </span>
          <button
            type="button"
            aria-pressed={state.offline}
            onClick={() => commit(toggleOffline)}
            data-focusable="true"
          >
            <CloudOff24Regular aria-hidden="true" />
            {state.offline ? "缓存只读" : "模拟离线"}
          </button>
          <button
            type="button"
            aria-pressed={traditional}
            onClick={() => setTraditional((current) => !current)}
            data-focusable="true"
          >
            <Settings24Regular aria-hidden="true" />
            {traditional ? "传统视图" : "赛季驾驶舱"}
          </button>
          <button
            type="button"
            aria-pressed={state.simplified}
            onClick={() =>
              setState((current) => ({
                ...current,
                simplified: !current.simplified,
                message: current.simplified
                  ? "已恢复完整信息密度。"
                  : "已启用简化视图；来源、限制、权限和下一步仍保留。",
              }))
            }
            data-focusable="true"
          >
            <Accessibility24Regular aria-hidden="true" />
            {state.simplified ? "完整视图" : "简化视图"}
          </button>
          <button
            type="button"
            aria-pressed={state.reducedMotion}
            onClick={() =>
              setState((current) => ({
                ...current,
                reducedMotion: !current.reducedMotion,
                message: current.reducedMotion
                  ? "已恢复有限状态动效。"
                  : "已减少动效；状态、文字和操作结果保持完整。",
              }))
            }
            data-focusable="true"
          >
            <Accessibility24Regular aria-hidden="true" />
            {state.reducedMotion ? "有限动效" : "减少动效"}
          </button>
          <button type="button" onClick={reset} data-focusable="true">
            <ArrowSync24Regular aria-hidden="true" />
            重置
          </button>
        </div>
      </header>

      <nav
        className="performance-stepbar"
        aria-label="Performance Center 功能步骤"
      >
        {STEP_LABELS.map((step, index) => {
          const Icon = step.icon;
          const active = state.step === step.id;
          return (
            <button
              key={step.id}
              type="button"
              className={active ? "is-active" : undefined}
              aria-current={active ? "step" : undefined}
              onClick={() =>
                setState((current) => ({ ...current, step: step.id }))
              }
              data-focusable="true"
            >
              <span>{String(index + 1).padStart(2, "0")}</span>
              <Icon aria-hidden="true" />
              {traditional ? step.traditional : step.immersive}
            </button>
          );
        })}
      </nav>

      <div className="performance-boundary-banner" role="status">
        <LockClosed24Regular aria-hidden="true" />
        <strong>只给本人看 · 演示</strong>
        <span>{state.sourceBoundary}</span>
      </div>

      <main
        id="performance-main"
        className="performance-main"
        tabIndex={-1}
      >
        <header className="performance-page-heading">
          <div>
            <span className="performance-page-heading__kicker">
              {currentStep.id.toUpperCase()} · 看状态，不给人下定义
            </span>
            <h1>
              {traditional ? currentStep.traditional : currentStep.immersive}
            </h1>
          </div>
          <div className="performance-heading-metrics">
            <span>
              <b>{state.metrics.length}</b> METRICS
            </span>
            <span>
              <b>{openRecommendationCount}</b> NEXT
            </span>
            <span>
              <b>{activeShareCount}</b> SHARES
            </span>
            <span>
              <b>{openStopCount}</b> STOP
            </span>
          </div>
        </header>

        <div className="performance-live-message" role="status" aria-live="polite">
          <Info24Regular aria-hidden="true" />
          <span>{state.message}</span>
        </div>

        {state.step === "baseline" ? (
          <div className="performance-baseline-stage">
            <section className="performance-panel performance-status-deck">
              <header className="performance-panel__header">
                <div>
                  <span>THIS WEEK // EXPIRES</span>
                  <h2>短期状态，不是永久身份</h2>
                </div>
                <LockClosed24Regular aria-hidden="true" />
              </header>
              <div className="performance-status-card">
                {state.climateVariant === "a_numbers" ? (
                  <>
                    <span className="performance-status-card__score">
                      98.6°F
                    </span>
                    <strong>稳态（研究文案）</strong>
                    <p>不是计算结果、成绩、能力值或医学温度。</p>
                  </>
                ) : state.climateVariant === "b_words" ? (
                  <>
                    <Sparkle24Regular aria-hidden="true" />
                    <strong>{state.statusLabel.words}</strong>
                    <p>短期可撤回文字状态；不显示数字，不影响任何权益。</p>
                  </>
                ) : (
                  <>
                    <DataBarVertical24Regular aria-hidden="true" />
                    <strong>多维状态面板</strong>
                    <p>只看期限、容量、任务清晰度、近期行为与未知项。</p>
                  </>
                )}
                <dl>
                  <div>
                    <dt>范围</dt>
                    <dd>
                      {state.statusLabel.startsAt.slice(0, 10)} →{" "}
                      {state.statusLabel.expiresAt.slice(0, 10)}
                    </dd>
                  </div>
                  <div>
                    <dt>可见</dt>
                    <dd>仅南同学（演示）</dd>
                  </div>
                  <div>
                    <dt>影响</dt>
                    <dd>不影响成绩、资格、排序或权益</dd>
                  </div>
                </dl>
              </div>
              <div className="performance-climate-controls">
                <span>HF-02 A / B / C 研究预览</span>
                <div role="group" aria-label="Academic Climate 研究版本">
                  {state.researchGate.variants.map((variant) => (
                    <button
                      key={variant.id}
                      type="button"
                      className={
                        state.climateVariant === variant.id
                          ? "is-active"
                          : undefined
                      }
                      aria-pressed={state.climateVariant === variant.id}
                      disabled={
                        openStopCount > 0 && variant.id !== "c_dimensions"
                      }
                      title={
                        openStopCount > 0 && variant.id !== "c_dimensions"
                          ? "STOP 已触发；需经过复核并开始新研究会话后才能重新开启。"
                          : variant.description
                      }
                      onClick={() =>
                        commit((current) =>
                          setClimateVariant(current, variant.id),
                        )
                      }
                      data-focusable="true"
                    >
                      {CLIMATE_LABEL[variant.id]}
                    </button>
                  ))}
                </div>
                {openStopCount > 0 ? (
                  <p role="status">
                    STOP 已锁定 A / B；本次会话只保留 C
                    版。演示重置会开始一段新的受控研究会话。
                  </p>
                ) : null}
                {state.climateVariant !== "c_dimensions" ? (
                  <button
                    type="button"
                    className="is-secondary"
                    onClick={() => commit(disableClimate)}
                    data-focusable="true"
                  >
                    <ShieldError24Regular aria-hidden="true" />
                    关闭隐喻
                  </button>
                ) : null}
              </div>
            </section>

            <section className="performance-panel performance-metric-catalog">
              <header className="performance-panel__header">
                <div>
                  <span>METRIC CATALOG // SELF BASELINE</span>
                  <h2>每个数字先说明来源与限制</h2>
                </div>
                <DocumentSearch24Regular aria-hidden="true" />
              </header>
              <div className="performance-metric-grid">
                {state.metrics.map((metric) => {
                  const observation = state.observations.find(
                    (item) => item.metricId === metric.id,
                  );
                  return (
                    <button
                      key={metric.id}
                      type="button"
                      className={
                        state.selectedMetricId === metric.id
                          ? "is-selected"
                          : undefined
                      }
                      onClick={() =>
                        commit((current) => selectMetric(current, metric.id))
                      }
                      data-focusable="true"
                    >
                      <span>{metric.label}</span>
                      <strong>
                        {observation?.displayValue ?? "数据不足"}
                      </strong>
                      <small>
                        {observation?.rangeLabel ?? "不显示精确值"}
                      </small>
                      {observation ? (
                        <ConfidenceBadge level={observation.confidence} />
                      ) : (
                        <ConfidenceBadge level="insufficient" />
                      )}
                    </button>
                  );
                })}
              </div>
            </section>

            {selectedMetric && selectedObservation ? (
              <section className="performance-panel performance-evidence-deck">
                <header className="performance-panel__header">
                  <div>
                    <span>METRIC DEFINITION // EVIDENCE PACK</span>
                    <h2>{selectedMetric.label}</h2>
                  </div>
                  <ConfidenceBadge level={selectedObservation.confidence} />
                </header>
                <div className="performance-definition-grid">
                  <div>
                    <span>定义</span>
                    <p>{selectedMetric.definition}</p>
                  </div>
                  <div>
                    <span>用途</span>
                    <p>{selectedMetric.purpose}</p>
                  </div>
                  <div>
                    <span>限制</span>
                    <p>{selectedMetric.limitation}</p>
                  </div>
                  <div>
                    <span>纠错</span>
                    <p>{selectedMetric.correctionRoute}</p>
                  </div>
                </div>
                <div className="performance-evidence-list">
                  {selectedEvidence.length ? (
                    selectedEvidence.map((evidence) => (
                      <article key={evidence.id}>
                        <DocumentSearch24Regular aria-hidden="true" />
                        <div>
                          <strong>{evidence.label}</strong>
                          <span>{evidence.locator}</span>
                          <small>
                            {evidence.sourceId} · {evidence.updatedAt}
                          </small>
                          <p>{evidence.detail}</p>
                        </div>
                        <b>{evidence.freshness}</b>
                      </article>
                    ))
                  ) : (
                    <div className="performance-empty">
                      <Warning24Regular aria-hidden="true" />
                      数据不足：因此不显示精确值，也不生成身份判断。
                    </div>
                  )}
                </div>
              </section>
            ) : null}

            <section className="performance-research-gate">
              <Flag24Regular aria-hidden="true" />
              <div>
                <span>HUMAN FACTORS GATE // DEFERRED</span>
                <strong>
                  Degree Fahrenheit 仍需 {state.researchGate.requiredParticipants}{" "}
                  名真实参与者 A/B/C 首读访谈
                </strong>
                <p>
                  当前真实证据 {state.researchGate.evidenceCount}；喜欢这个梗不能替代
                  “私密、可选、非成绩、非医学”的无提示理解。
                </p>
              </div>
              <code>{state.researchGate.status}</code>
            </section>
          </div>
        ) : null}

        {state.step === "trends" ? (
          <div className="performance-trend-stage">
            <section className="performance-panel performance-trend-board">
              <header className="performance-panel__header">
                <div>
                  <span>RHYTHM FILM // RANGE + GAPS</span>
                  <h2>趋势不把单点波动变成警报</h2>
                </div>
                <DataTrending24Regular aria-hidden="true" />
              </header>
              <div className="performance-trend-picker">
                {state.metrics
                  .filter((metric) =>
                    state.observations.some(
                      (observation) =>
                        observation.metricId === metric.id &&
                        observation.trend.length > 0,
                    ),
                  )
                  .map((metric) => (
                    <button
                      key={metric.id}
                      type="button"
                      className={
                        state.selectedMetricId === metric.id
                          ? "is-selected"
                          : undefined
                      }
                      onClick={() =>
                        commit((current) => selectMetric(current, metric.id))
                      }
                      data-focusable="true"
                    >
                      {metric.label}
                    </button>
                  ))}
              </div>
              <TrendStrip state={state} metricId={state.selectedMetricId} />
              {selectedObservation ? (
                <div className="performance-unknowns">
                  <Warning24Regular aria-hidden="true" />
                  <div>
                    <strong>置信与未知</strong>
                    <p>{selectedObservation.confidenceReason}</p>
                    <ul>
                      {selectedObservation.dataGaps.map((gap) => (
                        <li key={gap}>{gap}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              ) : null}
            </section>

            <section className="performance-panel performance-ability-board">
              <header className="performance-panel__header">
                <div>
                  <span>DIMENSIONS // NEVER ONE OVR</span>
                  <h2>能力维度保持来源差异</h2>
                </div>
                <BookOpen24Regular aria-hidden="true" />
              </header>
              <div className="performance-ability-grid">
                {state.abilities.map((ability) => (
                  <article key={ability.id}>
                    <header>
                      <span>{ability.label}</span>
                      <ConfidenceBadge level={ability.confidence} />
                    </header>
                    <strong>{ability.observedLabel}</strong>
                    <p>{ability.description}</p>
                    <small>
                      {ability.sourceIds.length
                        ? `证据：${ability.sourceIds.join(" · ")}`
                        : "无授权证据 · 不显示精确值"}
                    </small>
                  </article>
                ))}
              </div>
              <div className="performance-no-overall">
                <ShieldCheckmark24Regular aria-hidden="true" />
                <strong>NO PERMANENT OVR</strong>
                <span>
                  不合成单一能力分，不公开排名，不把阶段状态写成身份。
                </span>
              </div>
            </section>
          </div>
        ) : null}

        {state.step === "load" ? (
          <div className="performance-load-stage">
            <section className="performance-panel performance-load-board">
              <header className="performance-panel__header">
                <div>
                  <span>LOAD LAB // 4 SIGNALS</span>
                  <h2>负荷、期限、容量与本人感受并列</h2>
                </div>
                <CalendarClock24Regular aria-hidden="true" />
              </header>
              <div className="performance-load-grid">
                {state.loadSignals.map((signal) => {
                  const Icon =
                    signal.severity === "high"
                      ? Warning24Regular
                      : signal.severity === "unknown"
                        ? Info24Regular
                        : CheckmarkCircle24Filled;
                  return (
                    <article
                      key={signal.id}
                      className={`is-${signal.severity}`}
                    >
                      <Icon aria-hidden="true" />
                      <span>{signal.label}</span>
                      <strong>{signal.displayValue}</strong>
                      <p>{signal.textEquivalent}</p>
                      <small>
                        {signal.severity.toUpperCase()} ·{" "}
                        {signal.sourceIds.join(" · ")}
                      </small>
                    </article>
                  );
                })}
              </div>
            </section>

            <section className="performance-panel performance-support-board">
              <header className="performance-panel__header">
                <div>
                  <span>SUPPORT ROUTES // NO SHAME</span>
                  <h2>先把压力降一点，再安排下一步</h2>
                </div>
                <PersonFeedback24Regular aria-hidden="true" />
              </header>
              <div className="performance-support-list">
                {state.supportActions.map((support, index) => (
                  <article key={support.id}>
                    <span>{String(index + 1).padStart(2, "0")}</span>
                    <div>
                      <strong>{support.title}</strong>
                      <p>{support.action}</p>
                      <small>{support.availability}</small>
                    </div>
                    <code>{support.sourceId}</code>
                  </article>
                ))}
              </div>
              <div className="performance-sensitive-boundary">
                <LockClosed24Regular aria-hidden="true" />
                <p>
                  恢复感受是本人可选、可删除的短期自报。系统不从门禁、支付、食堂、聊天、深夜在线、传感器或医疗数据推断健康。
                </p>
              </div>
            </section>
          </div>
        ) : null}

        {state.step === "next" ? (
          <div className="performance-next-stage">
            <section className="performance-panel performance-badge-vault">
              <header className="performance-panel__header">
                <div>
                  <span>PRIVATE BADGES // OBSERVABLE BEHAVIOR</span>
                  <h2>徽章奖励行为，不出售资格</h2>
                </div>
                <Trophy24Regular aria-hidden="true" />
              </header>
              <div className="performance-badge-grid">
                {state.badges.map((badge) => (
                  <article
                    key={badge.id}
                    className={`is-${badge.status}`}
                  >
                    <Trophy24Regular aria-hidden="true" />
                    <span>{badge.title}</span>
                    <h3>{badge.subtitle}</h3>
                    <strong>{badge.progressLabel}</strong>
                    <p>{badge.criteria}</p>
                    <small>
                      {badge.status === "earned"
                        ? `本人私密 · ${badge.earnedAt}`
                        : "数据不足时不猜测、不催促"}
                    </small>
                    <b>不影响成绩 / 资格 / 付费权益</b>
                  </article>
                ))}
              </div>
            </section>

            <section className="performance-panel performance-recommendations">
              <header className="performance-panel__header">
                <div>
                  <span>备选战术 · 由学生决定</span>
                  <h2>每条建议都要把代价和退路讲明白</h2>
                </div>
                <TargetArrow24Regular aria-hidden="true" />
              </header>
              <div className="performance-recommendation-list">
                {state.recommendations.map((recommendation) => (
                  <article
                    key={recommendation.id}
                    className={`is-${recommendation.status}`}
                  >
                    <header>
                      <div>
                        <span>{recommendation.generationMode}</span>
                        <h3>{recommendation.title}</h3>
                      </div>
                      <strong>
                        {RECOMMENDATION_LABEL[recommendation.status]}
                      </strong>
                    </header>
                    <dl>
                      <div>
                        <dt>依据</dt>
                        <dd>
                          {recommendation.basisIds.length
                            ? recommendation.basisIds.join(" · ")
                            : "数据不足；因此不做精确推荐"}
                        </dd>
                      </div>
                      <div>
                        <dt>成本</dt>
                        <dd>{recommendation.cost}</dd>
                      </div>
                      <div>
                        <dt>预期作用</dt>
                        <dd>{recommendation.expectedEffect}</dd>
                      </div>
                      <div>
                        <dt>替代方案</dt>
                        <dd>{recommendation.alternative}</dd>
                      </div>
                      <div>
                        <dt>未知</dt>
                        <dd>{recommendation.unknowns.join(" · ")}</dd>
                      </div>
                    </dl>
                    {recommendation.status === "open" ? (
                      <div className="performance-recommendation-actions">
                        <button
                          type="button"
                          onClick={() =>
                            commit((current) =>
                              actOnRecommendation(
                                current,
                                recommendation.id,
                                "adopted",
                              ),
                            )
                          }
                          data-focusable="true"
                        >
                          <CheckmarkCircle24Filled aria-hidden="true" />
                          加入 Next Move
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            commit((current) =>
                              actOnRecommendation(
                                current,
                                recommendation.id,
                                "later",
                              ),
                            )
                          }
                          data-focusable="true"
                        >
                          稍后
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            commit((current) =>
                              actOnRecommendation(
                                current,
                                recommendation.id,
                                "dismissed",
                              ),
                            )
                          }
                          data-focusable="true"
                        >
                          拒绝
                        </button>
                      </div>
                    ) : null}
                  </article>
                ))}
              </div>
            </section>
          </div>
        ) : null}

        {state.step === "privacy" ? (
          <div className="performance-privacy-stage">
            <section className="performance-privacy-playbook">
              <header>
                <div>
                  <span>PRIVACY PLAYBOOK // ONE PLAY AT A TIME</span>
                  <h2>选择这一回合要处理的隐私行动</h2>
                </div>
                <strong>默认只属于学生本人</strong>
              </header>
              <nav aria-label="Privacy Replay 行动">
                {PRIVACY_PLAYS.map((play) => {
                  const Icon = play.icon;
                  const active = privacyPlay === play.id;
                  return (
                    <button
                      type="button"
                      key={play.id}
                      className={active ? "is-active" : undefined}
                      aria-current={active ? "step" : undefined}
                      onClick={() => setPrivacyPlay(play.id)}
                      data-focusable="true"
                    >
                      <span>{play.number}</span>
                      <Icon aria-hidden="true" />
                      <strong>
                        {traditional ? play.traditional : play.immersive}
                      </strong>
                      <small>{play.description}</small>
                    </button>
                  );
                })}
              </nav>
            </section>

            {privacyPlay === "share" ? (
              <section className="performance-panel performance-share-console">
              <header className="performance-panel__header">
                <div>
                  <span>PURPOSE-BOUND SHARE // PREVIEW FIRST</span>
                  <h2>学生逐项决定给谁、为什么、多久</h2>
                </div>
                <Eye24Regular aria-hidden="true" />
              </header>
              <div className="performance-share-form">
                <label>
                  接收者
                  <input
                    value={shareDraft.recipient}
                    onChange={(event) =>
                      setShareDraft((current) => ({
                        ...current,
                        recipient: event.target.value,
                      }))
                    }
                    data-focusable="true"
                  />
                </label>
                <label>
                  用途
                  <input
                    value={shareDraft.purpose}
                    onChange={(event) =>
                      setShareDraft((current) => ({
                        ...current,
                        purpose: event.target.value,
                      }))
                    }
                    data-focusable="true"
                  />
                </label>
                <label>
                  时长
                  <select
                    value={shareDraft.durationDays}
                    onChange={(event) =>
                      setShareDraft((current) => ({
                        ...current,
                        durationDays: Number(event.target.value),
                      }))
                    }
                    data-focusable="true"
                  >
                    <option value={1}>1 天</option>
                    <option value={7}>7 天</option>
                    <option value={14}>14 天</option>
                    <option value={30}>30 天</option>
                  </select>
                </label>
                <fieldset>
                  <legend>分享维度</legend>
                  {state.abilities.map((ability) => (
                    <label key={ability.id}>
                      <input
                        type="checkbox"
                        checked={shareDraft.dimensionIds.includes(ability.id)}
                        onChange={(event) =>
                          setShareDraft((current) => ({
                            ...current,
                            dimensionIds: event.target.checked
                              ? [...current.dimensionIds, ability.id]
                              : current.dimensionIds.filter(
                                  (id) => id !== ability.id,
                                ),
                          }))
                        }
                        data-focusable="true"
                      />
                      {ability.label}
                    </label>
                  ))}
                </fieldset>
              </div>
              <div className="performance-share-preview">
                <header>
                  <span>接收者将看到</span>
                  <strong>{shareDraft.recipient || "未填写接收者"}</strong>
                </header>
                {sharePreview.length ? (
                  <ul>
                    {sharePreview.map((line) => (
                      <li key={line}>{line}</li>
                    ))}
                  </ul>
                ) : (
                  <p>还没选择分享内容。选好后才能继续。</p>
                )}
                <p>
                  用途：{shareDraft.purpose || "未填写"} ·{" "}
                  {shareDraft.durationDays} 天后到期 · 不包含 GPA、排名、温度文案或原始事件。
                </p>
                <button
                  type="button"
                  onClick={() =>
                    commit((current) =>
                      createShareGrant(current, shareDraft),
                    )
                  }
                  data-focusable="true"
                >
                  <ShieldCheckmark24Regular aria-hidden="true" />
                  确认这次分享
                </button>
              </div>
              <div className="performance-share-grants">
                {state.shareGrants.length ? (
                  state.shareGrants.map((grant) => (
                    <article
                      key={grant.id}
                      className={grant.revokedAt ? "is-revoked" : undefined}
                    >
                      <ShieldCheckmark24Regular aria-hidden="true" />
                      <div>
                        <strong>{grant.recipient}</strong>
                        <span>{grant.purpose}</span>
                        <small>
                          {grant.dimensionIds.join(" · ")} // 到期{" "}
                          {grant.expiresAt}
                        </small>
                      </div>
                      {grant.revokedAt ? (
                        <b>已撤回 · {grant.revokedAt}</b>
                      ) : (
                        <button
                          type="button"
                          onClick={() =>
                            commit((current) =>
                              revokeShareGrant(current, grant.id),
                            )
                          }
                          data-focusable="true"
                        >
                          撤回
                        </button>
                      )}
                    </article>
                  ))
                ) : (
                  <p className="performance-empty">
                    当前没有有效分享；所有指标默认只属于学生本人。
                  </p>
                )}
              </div>
              </section>
            ) : null}

            {privacyPlay === "correction" ? (
              <section className="performance-panel performance-correction-console">
              <header className="performance-panel__header">
                <div>
                  <span>CORRECTION // VERSIONED</span>
                  <h2>错误、误解和伤害都可以申诉</h2>
                </div>
                <PersonFeedback24Regular aria-hidden="true" />
              </header>
              <label>
                当前纠错对象
                <select
                  value={state.selectedMetricId}
                  onChange={(event) =>
                    commit((current) =>
                      selectMetric(current, event.target.value),
                    )
                  }
                  data-focusable="true"
                >
                  {state.metrics.map((metric) => (
                    <option key={metric.id} value={metric.id}>
                      {metric.label}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                纠错原因
                <textarea
                  value={correctionReason}
                  onChange={(event) => setCorrectionReason(event.target.value)}
                  data-focusable="true"
                />
              </label>
              <button
                type="button"
                onClick={() =>
                  commit((current) =>
                    requestCorrection(
                      current,
                      current.selectedMetricId,
                      correctionReason,
                    ),
                  )
                }
                data-focusable="true"
              >
                <PersonFeedback24Regular aria-hidden="true" />
                提交人工纠错
              </button>
              <ol className="performance-correction-list">
                {state.corrections.map((correction) => (
                  <li key={correction.id}>
                    <span>r{correction.revision}</span>
                    <div>
                      <strong>{correction.targetId}</strong>
                      <p>{correction.reason}</p>
                      <small>
                        {correction.status} · {correction.createdAt}
                      </small>
                    </div>
                  </li>
                ))}
              </ol>
              </section>
            ) : null}

            {privacyPlay === "stop" ? (
              <section className="performance-panel performance-harm-console">
              <header className="performance-panel__header">
                <div>
                  <span>ANTI-HARM STOP GATE</span>
                  <h2>误解、焦虑或标签化会让指标下线</h2>
                </div>
                <Flag24Regular aria-hidden="true" />
              </header>
              <label>
                观察到的伤害信号
                <textarea
                  value={harmDescription}
                  onChange={(event) => setHarmDescription(event.target.value)}
                  data-focusable="true"
                />
              </label>
              <button
                type="button"
                className="is-danger"
                onClick={() =>
                  commit((current) =>
                    reportHarm(current, harmDescription),
                  )
                }
                data-focusable="true"
              >
                <ShieldError24Regular aria-hidden="true" />
                触发 STOP 并回退无隐喻面板
              </button>
              <div className="performance-harm-list">
                {state.harmSignals.map((signal) => (
                  <article
                    key={signal.id}
                    className={`is-${signal.severity}`}
                  >
                    <Warning24Regular aria-hidden="true" />
                    <div>
                      <strong>
                        {signal.category} · {signal.status}
                      </strong>
                      <p>{signal.description}</p>
                      <small>{signal.actionTaken}</small>
                    </div>
                  </article>
                ))}
              </div>
              </section>
            ) : null}

            {privacyPlay === "replay" ? (
              <section className="performance-panel performance-replay-ledger">
              <header className="performance-panel__header">
                <div>
                  <span>私密回放 · 旧记录不会被覆盖</span>
                  <h2>授权、纠错、建议与停损回执</h2>
                </div>
                <div className="performance-ledger-actions">
                  <button
                    type="button"
                    onClick={exportArchive}
                    data-focusable="true"
                  >
                    <ArrowDownload24Regular aria-hidden="true" />
                    导出私密副本
                  </button>
                  <Archive24Regular aria-hidden="true" />
                </div>
              </header>
              <ol>
                {[...state.audit].reverse().map((event) => (
                  <li key={event.id}>
                    <span>{String(event.sequence).padStart(3, "0")}</span>
                    <div>
                      <strong>{event.action}</strong>
                      <small>
                        {event.targetId} · {event.occurredAt}
                      </small>
                      <p>{event.detail}</p>
                      <code>
                        {event.previousEventHash ?? "genesis"} →{" "}
                        {event.eventHash}
                      </code>
                    </div>
                  </li>
                ))}
              </ol>
              </section>
            ) : null}
          </div>
        ) : null}
      </main>

      <footer className="performance-footer">
        <span>
          <LockClosed24Regular aria-hidden="true" />
          私密本人基线 · 无跨人排名
        </span>
        <span>
          <DataTrending24Regular aria-hidden="true" />
          {state.offline
            ? `缓存截至 ${state.lastUpdatedAt}`
            : "本地演示 · 随时可重置"}
        </span>
        <span>
          <History24Regular aria-hidden="true" />
          {state.audit.length} 条回放记录
        </span>
      </footer>
    </div>
  );
}

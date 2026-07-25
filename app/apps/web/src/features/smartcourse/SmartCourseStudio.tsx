import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft24Regular,
  ArrowRight24Regular,
  BookOpen24Regular,
  Checkmark24Regular,
  CheckmarkCircle24Filled,
  ClipboardBulletListLtrRegular,
  DataTrending24Regular,
  Delete24Regular,
  Dismiss24Regular,
  DocumentCheckmark24Regular,
  DocumentSearch24Regular,
  Edit24Regular,
  Eye24Regular,
  History24Regular,
  LockClosed24Regular,
  Person24Regular,
  Play24Filled,
  Replay24Regular,
  ShieldCheckmark24Regular,
  Sparkle24Regular,
  Warning24Regular,
} from "@fluentui/react-icons";
import {
  approveTeachingObject,
  createSmartCourseEntryState,
  createSmartCourseState,
  editTeachingObject,
  getAcceptanceProgress,
  loadAuthorizedFixture,
  publishApprovedObjects,
  recordStudentInteraction,
  removeTeachingObject,
  resetSmartCourseState,
  selectTeachingObject,
  setSourceValidity,
} from "./engine";
import type { SmartCourseEntryPoint } from "./engine";
import { STUDENT_QUESTION } from "./fixture";
import {
  sha256Hex,
  validateMaterialCandidate,
} from "./intake";
import {
  getGeneratedObject,
  getReplay,
  summarizeObject,
} from "../../lib/smartCourseApi";
import { FREQUENCY_RESPONSE_MODEL } from "./frequencyResponse";
import type {
  ReviewStatus,
  SmartCourseState,
  SmartCourseStep,
  TeachingObject,
} from "./types";
import "./smartcourse.css";

type SmartCourseStudioProps = {
  backendLabel: string;
  entryPoint?: SmartCourseEntryPoint;
  exitLabel?: string;
  onExit: () => void;
};

type LocalIntakeState = {
  status: "idle" | "hashing" | "partial" | "failed";
  message: string;
  hash?: string;
  format?: string;
  sizeLabel?: string;
};

type ApiEvidenceReceipt =
  | { state: "checking"; message: string }
  | {
      state: "live";
      revision: number;
      sourceCount: number;
      evidenceCount: number;
      reviewEventCount: number;
      publicationCount: number;
      interactionCount: number;
    }
  | { state: "fixture"; message: string };

const STEP_META: Array<{
  id: SmartCourseStep;
  label: string;
  eyebrow: string;
}> = [
  { id: "source", label: "材料与来源", eyebrow: "SOURCE INTAKE" },
  { id: "review", label: "教师审核", eyebrow: "COACH REVIEW" },
  { id: "publish", label: "发布门禁", eyebrow: "RELEASE GATE" },
  { id: "student", label: "南同学互动", eyebrow: "PLAYER SESSION" },
  { id: "replay", label: "Replay", eyebrow: "EVIDENCE PACK" },
];

const STATUS_LABEL: Record<ReviewStatus, string> = {
  draft: "草稿",
  review: "待审核",
  approved: "已通过",
  removed: "已移除",
  published: "已发布",
};

const KIND_LABEL = {
  quiz: "理解检查",
  explanation: "讲解",
  review_card: "复习卡",
  hint: "提示",
  scene: "互动场景",
} as const;

const GENERATION_LABEL: Record<TeachingObject["generationMode"], string> = {
  fixture: "本地演示草稿",
  model: "AI 草稿",
  rule: "规则生成草稿",
};

const EVIDENCE_LABEL: Record<TeachingObject["evidenceStatus"], string> = {
  supported: "依据完整",
  partial: "部分有据",
  insufficient: "依据不足",
};

function actorLabel(actor: string) {
  if (actor === "teacher-fixture") return "林老师（演示）";
  if (actor === "student-nan-fixture") return "南同学（演示）";
  return "本地演示记录";
}

function canOpenStep(state: SmartCourseState, step: SmartCourseStep) {
  if (step === "source") return true;
  if (step === "review") return state.materialLoaded;
  if (step === "publish") {
    return state.objects.some(
      (object) => object.status === "approved" || object.status === "published",
    );
  }
  if (step === "student") return Boolean(state.publication);
  return Boolean(state.interaction);
}

function StepIcon({
  current,
  complete,
}: {
  current: boolean;
  complete: boolean;
}) {
  if (complete) return <CheckmarkCircle24Filled aria-hidden="true" />;
  if (current) return <Play24Filled aria-hidden="true" />;
  return <LockClosed24Regular aria-hidden="true" />;
}

function FrequencyResponseCourt() {
  const model = FREQUENCY_RESPONSE_MODEL;
  const {
    resistanceOhm,
    capacitanceFarad,
    capacitanceTolerancePercent,
    inputResistanceOhm,
  } = model.parameters;

  return (
    <section
      className="frequency-model-court"
      aria-labelledby="frequency-model-heading"
    >
      <header>
        <div>
          <span>MODEL COURT · REPRODUCIBLE</span>
          <h3 id="frequency-model-heading">RC 低通频率响应核验台</h3>
          <p>
            每个数值由固定公式和参数现场计算；这是教学模型，不是采集结果。
          </p>
        </div>
        <strong>非实测</strong>
      </header>

      <dl className="frequency-model-court__parameters">
        <div>
          <dt>R</dt>
          <dd>{resistanceOhm.toLocaleString()} Ω</dd>
        </div>
        <div>
          <dt>C</dt>
          <dd>{(capacitanceFarad * 1e9).toFixed(0)} nF</dd>
        </div>
        <div>
          <dt>公差情景</dt>
          <dd>C +{capacitanceTolerancePercent}%</dd>
        </div>
        <div>
          <dt>输入负载</dt>
          <dd>{(inputResistanceOhm / 1e6).toFixed(0)} MΩ</dd>
        </div>
        <div>
          <dt>理论 fc</dt>
          <dd>{model.nominalCutoffHz.toLocaleString()} Hz</dd>
        </div>
        <div>
          <dt>公差 fc</dt>
          <dd>{model.toleranceCutoffHz.toLocaleString()} Hz</dd>
        </div>
      </dl>

      <div className="frequency-model-court__table">
        <table>
          <caption>
            六个对数频点的可复算幅值；相位只展示理想模型，单位为度。
          </caption>
          <thead>
            <tr>
              <th scope="col">频率</th>
              <th scope="col">理想 / dB</th>
              <th scope="col">C +10% / dB</th>
              <th scope="col">1 MΩ / dB</th>
              <th scope="col">理想相位</th>
            </tr>
          </thead>
          <tbody>
            {model.points.map((point) => (
              <tr key={point.frequencyHz}>
                <th scope="row">{point.frequencyHz.toLocaleString()} Hz</th>
                <td>{point.idealMagnitudeDb.toFixed(2)}</td>
                <td>{point.capacitanceToleranceMagnitudeDb.toFixed(2)}</td>
                <td>{point.inputLoadMagnitudeDb.toFixed(2)}</td>
                <td>{point.idealPhaseDeg.toFixed(1)}°</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <footer>
        <code>|H(jω)| = 1 / √(1 + (ωRC)²)</code>
        <span>
          {model.modelId} · v{model.modelVersion} · {model.sourceIds.length} 条来源
        </span>
      </footer>
    </section>
  );
}

export function SmartCourseStudio({
  backendLabel,
  entryPoint = "authoring",
  exitLabel = "MyCareer",
  onExit,
}: SmartCourseStudioProps) {
  const [state, setState] = useState(() =>
    createSmartCourseEntryState(entryPoint),
  );
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState("");
  const [removeTargetId, setRemoveTargetId] = useState<string | null>(null);
  const [removeReason, setRemoveReason] = useState(
    "示例内容仍有未确认项，暂不向学生发布",
  );
  const [selectedAnswer, setSelectedAnswer] = useState("");
  const [kindFilter, setKindFilter] = useState<"all" | TeachingObject["kind"]>(
    "all",
  );
  const [statusFilter, setStatusFilter] = useState<
    "all" | "review" | "approved" | "removed"
  >("all");
  const [riskFilter, setRiskFilter] = useState<"all" | "needs_attention">(
    "all",
  );
  const [localFile, setLocalFile] = useState<File | null>(null);
  const [fileInputKey, setFileInputKey] = useState(0);
  const [rightsDeclared, setRightsDeclared] = useState(false);
  const [localIntake, setLocalIntake] = useState<LocalIntakeState>({
    status: "idle",
    message: "文件只在当前浏览器内读取；不会上传或写入学校系统。",
  });
  const [manualLocator, setManualLocator] = useState("手工片段 · §1");
  const [manualQuote, setManualQuote] = useState("");
  const [manualSourceSaved, setManualSourceSaved] = useState(false);
  const [apiReceipt, setApiReceipt] = useState<ApiEvidenceReceipt>({
    state: "checking",
    message: "正在确认后台记录；没接上也不耽误本地演示。",
  });
  const [message, setMessage] = useState(
    entryPoint === "authoring"
      ? "当前使用本地演示存档；随时可以重置，也不会写入学校系统。"
      : entryPoint === "review"
        ? "教师审核席已就位；每次修改和决定都能回看。"
        : entryPoint === "publish"
          ? "已经来到发布前的最后一关；只放行教师通过且来源有效的内容。"
      : entryPoint === "student"
          ? "这是教师审核后的学习版本；返回赛季中心的路一直都在。"
          : "这局从材料到作答都能回看；当前记录来自演示赛档。",
  );

  const filteredObjects = useMemo(
    () =>
      state.objects.filter(
        (object) =>
          (kindFilter === "all" || object.kind === kindFilter) &&
          (statusFilter === "all" || object.status === statusFilter) &&
          (riskFilter === "all" || object.evidenceStatus !== "supported"),
      ),
    [kindFilter, riskFilter, state.objects, statusFilter],
  );
  const selectedObject =
    filteredObjects.find((object) => object.id === state.selectedObjectId) ??
    filteredObjects[0] ??
    state.objects[0];
  const selectedSources = state.sources.filter((source) =>
    selectedObject.sourceIds.includes(source.id),
  );
  const acceptance = getAcceptanceProgress(state);
  const acceptanceItems = [
    ["来源", acceptance.sourceReady],
    ["修改", acceptance.edited],
    ["通过", acceptance.approved],
    ["移除", acceptance.removed],
    ["发布", acceptance.published],
    ["互动", acceptance.interacted],
    ["回放", acceptance.replayReady],
  ] as const;
  const completeCount = acceptanceItems.filter(([, complete]) => complete).length;
  const approvedObjects = state.objects.filter(
    (object) => object.status === "approved" || object.status === "published",
  );
  const releaseEligibleObjects = approvedObjects.filter((object) =>
    object.sourceIds.every((sourceId) =>
      state.sources.some((source) => source.id === sourceId && source.valid),
    ),
  );
  const currentStepIndex = STEP_META.findIndex((step) => step.id === state.step);

  const selectedOption = useMemo(
    () =>
      STUDENT_QUESTION.options.find(
        (option) => option.id === selectedAnswer,
      ),
    [selectedAnswer],
  );

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [state.step]);

  useEffect(() => {
    const controller = new AbortController();
    let active = true;

    void Promise.all([
      getGeneratedObject(undefined, controller.signal),
      getReplay(undefined, controller.signal),
    ])
      .then(([objectResult, replayResult]) => {
        if (!active) return;
        if (!objectResult.ok) {
          setApiReceipt({
            state: "fixture",
            message: objectResult.message,
          });
          return;
        }
        if (!replayResult.ok) {
          setApiReceipt({
            state: "fixture",
            message: replayResult.message,
          });
          return;
        }

        const summary = summarizeObject(objectResult.data);
        setApiReceipt({
          state: "live",
          revision: summary.revision,
          sourceCount: summary.sourceCount,
          evidenceCount: summary.evidenceCount,
          reviewEventCount: replayResult.data.review_events.length,
          publicationCount: replayResult.data.published_versions.length,
          interactionCount: replayResult.data.student_interactions.length,
        });
      })
      .catch((error: unknown) => {
        if (
          typeof error === "object" &&
          error !== null &&
          "name" in error &&
          error.name === "AbortError"
        ) {
          return;
        }
        if (active) {
          setApiReceipt({
            state: "fixture",
            message: "后台记录暂时没接上；本地演示仍可完整体验。",
          });
        }
      });

    return () => {
      active = false;
      controller.abort();
    };
  }, []);

  const goToStep = (step: SmartCourseStep) => {
    if (!canOpenStep(state, step)) {
      setMessage("这一步还没解锁。先完成左侧亮起的任务。");
      return;
    }
    setState((current) => ({ ...current, step }));
  };

  const loadFixture = () => {
    setState((current) => loadAuthorizedFixture(current));
    setMessage("材料已就位：3 段可定位原文，5 份待审核草稿。");
  };

  const registerLocalMaterial = async () => {
    if (!localFile) {
      setLocalIntake({
        status: "failed",
        message: "请先选择一个本地材料。",
      });
      return;
    }
    const validation = validateMaterialCandidate({
      name: localFile.name,
      size: localFile.size,
      rightsDeclared,
    });
    if (!validation.ok) {
      setLocalIntake({
        status: "failed",
        message: validation.message,
      });
      return;
    }

    setLocalIntake({
      status: "hashing",
      message: "正在本地计算 SHA-256；文件内容不会离开浏览器。",
      format: validation.format,
      sizeLabel: validation.sizeLabel,
    });
    try {
      const hash = await sha256Hex(await localFile.arrayBuffer());
      setLocalIntake({
        status: "partial",
        message:
          "文件信息和哈希已经记下，但本版还读不了全部内容。你可以手工摘录一段原文，或改用内置演示材料。",
        hash,
        format: validation.format,
        sizeLabel: validation.sizeLabel,
      });
      setMessage(
        "文件已经登记。内容解析还没开放，所以没有把它假装成“处理完成”。",
      );
    } catch {
      setLocalIntake({
        status: "failed",
        message: "浏览器没能读到这个文件。可以重试，或改用内置演示材料。",
      });
    }
  };

  const saveManualSource = () => {
    if (!manualLocator.trim() || !manualQuote.trim()) {
      setMessage("还差两项：原文位置和原文片段。填好后就能保存。");
      return;
    }
    setManualSourceSaved(true);
    setMessage(
      "这段原文只留在当前浏览器里，不会混进学校记录。",
    );
  };

  const clearLocalIntake = () => {
    setLocalFile(null);
    setFileInputKey((current) => current + 1);
    setRightsDeclared(false);
    setLocalIntake({
      status: "idle",
      message: "文件只在当前浏览器内读取；不会上传或写入学校系统。",
    });
    setManualQuote("");
    setManualSourceSaved(false);
    setMessage("本地材料已经清空；内置演示内容还在。");
  };

  const saveEdit = () => {
    try {
      setState((current) =>
        editTeachingObject(current, selectedObject.id, editValue),
      );
      setEditing(false);
      setMessage("修改已保存。改前和改后的版本都能在回放里找到。");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "无法保存修改。");
    }
  };

  const approveSelected = () => {
    try {
      setState((current) =>
        approveTeachingObject(current, selectedObject.id),
      );
      setMessage("对象已通过，可进入发布门禁；来源关联仍保持可回看。");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "无法通过对象。");
    }
  };

  const confirmRemove = () => {
    if (!removeTargetId) return;
    try {
      setState((current) =>
        removeTeachingObject(current, removeTargetId, removeReason),
      );
      setRemoveTargetId(null);
      setMessage("这份草稿已移出发布队列，原因也记下了。");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "无法移除对象。");
    }
  };

  const publish = () => {
    try {
      setState((current) => publishApprovedObjects(current));
      setMessage("v1 已发布。学生端只会看到教师确认过的内容。");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "无法发布。");
    }
  };

  const submitAnswer = () => {
    if (!selectedAnswer) {
      setMessage("请先选择一个答案。");
      return;
    }
    setState((current) =>
      recordStudentInteraction(
        current,
        selectedAnswer,
        STUDENT_QUESTION.correctAnswer,
      ),
    );
    setMessage("南同学的作答已写入本人 Replay；没有生成班级排名。");
  };

  const reset = () => {
    setState(resetSmartCourseState());
    setEditing(false);
    setRemoveTargetId(null);
    setSelectedAnswer("");
    setKindFilter("all");
    setStatusFilter("all");
    setRiskFilter("all");
    clearLocalIntake();
    setMessage("演示已经重置，可以从第一回合重新体验。");
  };

  const toggleFirstSourceValidity = () => {
    const source = state.sources[0];
    setState((current) =>
      setSourceValidity(current, source.id, !source.valid),
    );
    setMessage(
      source.valid
        ? "已把这条来源标为失效；依赖它的草稿不会进入发布队列。"
        : "来源已经恢复；发布候选会重新计算，过去的操作记录仍保留。",
    );
  };

  return (
    <div className="smartcourse-shell">
      <div className="smartcourse-scene" aria-hidden="true" />
      <header className="smartcourse-topbar">
        <button className="smartcourse-back" type="button" onClick={onExit}>
          <ArrowLeft24Regular aria-hidden="true" />
          <span className="smartcourse-back__label">返回 {exitLabel}</span>
        </button>
        <div className="smartcourse-brand" aria-label="大学2K26 智课工坊">
          <span>UNIVERSITY<strong>2K26</strong></span>
          <b>SMARTCOURSE STUDIO</b>
        </div>
        <div
          className={`smartcourse-runtime is-${apiReceipt.state}`}
          title={
            apiReceipt.state === "live"
              ? `F-001 后台记录已核对 · 第 ${apiReceipt.revision} 版`
              : apiReceipt.message
          }
        >
          <DataTrending24Regular aria-hidden="true" />
          <span>{backendLabel}</span>
          <b>
            {apiReceipt.state === "live"
              ? "后台记录"
              : apiReceipt.state === "checking"
                ? "确认中"
                : "本地演示"}
          </b>
        </div>
      </header>

      <aside className="smartcourse-steps" aria-label="智课工坊验收步骤">
        <div className="smartcourse-steps__heading">
          <span>F-001</span>
          <strong>来源到 Replay</strong>
          <small>从材料到学习，一路都能回看</small>
        </div>
        <ol>
          {STEP_META.map((step, index) => {
            const open = canOpenStep(state, step.id);
            const complete = index < currentStepIndex || (
              step.id === "replay" && acceptance.replayReady
            );
            return (
              <li key={step.id}>
                <button
                  type="button"
                  className={state.step === step.id ? "is-current" : ""}
                  disabled={!open}
                  aria-current={state.step === step.id ? "step" : undefined}
                  onClick={() => goToStep(step.id)}
                >
                  <StepIcon
                    current={state.step === step.id}
                    complete={complete}
                  />
                  <span>
                    <small>{step.eyebrow}</small>
                    <strong>{step.label}</strong>
                  </span>
                  <b>{String(index + 1).padStart(2, "0")}</b>
                </button>
              </li>
            );
          })}
        </ol>
        <div className="smartcourse-acceptance">
          <div>
            <span>ACCEPTANCE</span>
            <strong>{completeCount} / {acceptanceItems.length}</strong>
          </div>
          <ul>
            {acceptanceItems.map(([label, complete]) => (
              <li className={complete ? "is-complete" : ""} key={label}>
                <Checkmark24Regular aria-hidden="true" />
                {label}
              </li>
            ))}
          </ul>
        </div>
      </aside>

      <main className="smartcourse-main">
        {state.step === "source" && (
          <section className="studio-view source-view" aria-labelledby="source-heading">
            <div className="studio-heading">
              <div>
                <span>01 · SOURCE INTAKE</span>
                <h1 id="source-heading">这份材料，AI 可以读吗？</h1>
                <p>先确认使用权和出处，再把内容交给 AI。</p>
              </div>
              <ShieldCheckmark24Regular aria-hidden="true" />
            </div>

            <article className="material-card">
              <div className="material-card__icon">
                <DocumentCheckmark24Regular aria-hidden="true" />
              </div>
              <div className="material-card__body">
                <span>AUTHORIZED DEMO MATERIAL</span>
                <h2>{state.material.title}</h2>
                <p>{state.material.filename} · {state.material.sizeLabel}</p>
                <dl>
                  <div>
                    <dt>权利状态</dt>
                    <dd>已声明 · Demo 授权</dd>
                  </div>
                  <div>
                    <dt>SHA-256</dt>
                    <dd>{state.material.sha256}</dd>
                  </div>
                  <div>
                    <dt>登记人</dt>
                    <dd>
                      {state.material.uploadedBy === "teacher-fixture"
                        ? "林老师（演示）"
                        : state.material.uploadedBy}
                    </dd>
                  </div>
                  <div>
                    <dt>保留期</dt>
                    <dd>{state.material.retention}</dd>
                  </div>
                </dl>
              </div>
              <div className="material-card__status">
                <CheckmarkCircle24Filled aria-hidden="true" />
                可以生成草稿
              </div>
            </article>

            <details className="intake-test-court">
              <summary>
                <DocumentSearch24Regular aria-hidden="true" />
                <span>
                  <strong>LOCAL INTAKE TEST COURT</strong>
                  <small>选择本地文件 · 权利确认 · SHA-256 · 失败可重试</small>
                </span>
                <ArrowRight24Regular aria-hidden="true" />
              </summary>
              <div className="intake-test-court__body">
                <div className="intake-controls">
                  <label htmlFor="smartcourse-local-file">
                    选择本地材料
                    <input
                      key={fileInputKey}
                      id="smartcourse-local-file"
                      type="file"
                      accept=".mp3,.wav,.mp4,.pptx,.pdf"
                      onChange={(event) => {
                        setLocalFile(event.target.files?.[0] ?? null);
                        setManualSourceSaved(false);
                        setLocalIntake({
                          status: "idle",
                          message:
                            "等待权利确认；尚未读取文件内容或计算哈希。",
                        });
                      }}
                    />
                  </label>
                  <div className="intake-file-line">
                    <DocumentCheckmark24Regular aria-hidden="true" />
                    <span>
                      <strong>{localFile?.name ?? "尚未选择文件"}</strong>
                      <small>
                        {localFile
                          ? `${localFile.size.toLocaleString()} bytes`
                          : "MP3 / WAV / MP4 / PPTX / PDF · 最大 50 MB"}
                      </small>
                    </span>
                  </div>
                  <label className="rights-check">
                    <input
                      type="checkbox"
                      checked={rightsDeclared}
                      onChange={(event) =>
                        setRightsDeclared(event.target.checked)
                      }
                    />
                    我确认有权将该文件用于当前本地教学演示
                  </label>
                  <div className="intake-actions">
                    <button
                      type="button"
                      onClick={() => void registerLocalMaterial()}
                      disabled={localIntake.status === "hashing"}
                    >
                      <ShieldCheckmark24Regular aria-hidden="true" />
                      {localIntake.status === "hashing"
                        ? "正在计算哈希…"
                        : "登记并检查材料"}
                    </button>
                    <button type="button" onClick={clearLocalIntake}>
                      <Dismiss24Regular aria-hidden="true" />
                      清空
                    </button>
                  </div>
                </div>

                <section
                  className={`intake-result is-${localIntake.status}`}
                  aria-live="polite"
                >
                  {localIntake.status === "failed" ? (
                    <Warning24Regular aria-hidden="true" />
                  ) : (
                    <DataTrending24Regular aria-hidden="true" />
                  )}
                  <div>
                    <span>PARSE STATUS · {localIntake.status.toUpperCase()}</span>
                    <strong>{localIntake.message}</strong>
                    {localIntake.hash && (
                      <dl>
                        <div>
                          <dt>格式</dt>
                          <dd>{localIntake.format}</dd>
                        </div>
                        <div>
                          <dt>大小</dt>
                          <dd>{localIntake.sizeLabel}</dd>
                        </div>
                        <div>
                          <dt>SHA-256</dt>
                          <dd>{localIntake.hash}</dd>
                        </div>
                      </dl>
                    )}
                  </div>
                </section>

                {localIntake.status === "partial" && (
                  <section className="manual-source-form">
                    <div>
                      <span>MANUAL OVERRIDE</span>
                      <strong>自动读取没成功？可以手工记下一段原文</strong>
                    </div>
                    <label htmlFor="manual-source-locator">
                      定位器
                      <input
                        id="manual-source-locator"
                        value={manualLocator}
                        onChange={(event) =>
                          setManualLocator(event.target.value)
                        }
                      />
                    </label>
                    <label htmlFor="manual-source-quote">
                      原文片段
                      <textarea
                        id="manual-source-quote"
                        rows={3}
                        value={manualQuote}
                        onChange={(event) =>
                          setManualQuote(event.target.value)
                        }
                        placeholder="仅粘贴你有权用于本地演示的短片段"
                      />
                    </label>
                    <button type="button" onClick={saveManualSource}>
                      <Checkmark24Regular aria-hidden="true" />
                      保存手工来源
                    </button>
                    {manualSourceSaved && (
                      <article>
                        <span className="signal-badge signal-B">B</span>
                        <div>
                          <small>{manualLocator}</small>
                          <strong>{manualQuote}</strong>
                          <em>只留在本次浏览器会话 · 未写入学校数据</em>
                        </div>
                      </article>
                    )}
                  </section>
                )}
              </div>
            </details>

            <div className="signal-legend" role="note">
              <ShieldCheckmark24Regular aria-hidden="true" />
              <div>
                <strong>S / A / B 是材料信号，不是学生能力或人格评级</strong>
                <span>
                  S＝教师明确强调 · A＝标题级概念 · B＝补充说明；教师仍需看原文，Badge 不替代证据。
                </span>
              </div>
            </div>

            <div className="source-grid">
              {state.sources.map((source) => (
                <article className="source-fragment" key={source.id}>
                  <div>
                    <span className={`signal-badge signal-${source.signal}`}>
                      {source.signal}
                    </span>
                    <small>{source.locator}</small>
                  </div>
                  <h3>{source.title}</h3>
                  <blockquote>{source.quote}</blockquote>
                  <footer>
                    <DocumentSearch24Regular aria-hidden="true" />
                    {source.id}
                  </footer>
                </article>
              ))}
            </div>

            <button
              className="studio-primary"
              type="button"
              onClick={loadFixture}
              disabled={state.materialLoaded}
            >
              <Sparkle24Regular aria-hidden="true" />
              {state.materialLoaded
                ? "演示材料已载入"
                : "载入 5 份待审核草稿"}
              <ArrowRight24Regular aria-hidden="true" />
            </button>
          </section>
        )}

        {state.step === "review" && (
          <section className="studio-view review-view" aria-labelledby="review-heading">
            <div className="studio-heading studio-heading--compact">
              <div>
                <span>02 · COACH REVIEW</span>
                <h1 id="review-heading">AI 交草稿，教师保留最后一票</h1>
                <p>挑一份草稿，修改、通过或退回；每次决定都会留下理由。</p>
              </div>
              <ClipboardBulletListLtrRegular aria-hidden="true" />
            </div>

            <div className="review-workbench">
              <div className="review-queue">
                <div className="workbench-label">
                  <span>审核队列</span>
                  <b>{filteredObjects.length} / {state.objects.length} 项</b>
                </div>
                <div className="review-filters" aria-label="审核队列筛选">
                  <div>
                    <span>类型</span>
                    {[
                      ["all", "全部"],
                      ["quiz", "测验"],
                      ["explanation", "讲解"],
                      ["review_card", "复习卡"],
                      ["hint", "提示"],
                      ["scene", "场景"],
                    ].map(([value, label]) => (
                      <button
                        type="button"
                        aria-pressed={kindFilter === value}
                        className={kindFilter === value ? "is-active" : ""}
                        onClick={() =>
                          setKindFilter(value as typeof kindFilter)
                        }
                        key={value}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                  <div>
                    <span>状态</span>
                    {[
                      ["all", "全部"],
                      ["review", "待审核"],
                      ["approved", "已通过"],
                      ["removed", "已移除"],
                    ].map(([value, label]) => (
                      <button
                        type="button"
                        aria-pressed={statusFilter === value}
                        className={statusFilter === value ? "is-active" : ""}
                        onClick={() =>
                          setStatusFilter(value as typeof statusFilter)
                        }
                        key={value}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                  <button
                    type="button"
                    aria-pressed={riskFilter === "needs_attention"}
                    className={
                      riskFilter === "needs_attention" ? "is-active" : ""
                    }
                    onClick={() =>
                      setRiskFilter((current) =>
                        current === "all" ? "needs_attention" : "all",
                      )
                    }
                  >
                    <Warning24Regular aria-hidden="true" />
                    只看需复核
                  </button>
                </div>
                {filteredObjects.map((object) => (
                  <button
                    type="button"
                    className={
                      object.id === selectedObject.id ? "is-selected" : ""
                    }
                    onClick={() =>
                      setState((current) =>
                        selectTeachingObject(current, object.id),
                      )
                    }
                    key={object.id}
                  >
                    <span>{KIND_LABEL[object.kind]}</span>
                    <strong>{object.title}</strong>
                    <small className={`review-status status-${object.status}`}>
                      {STATUS_LABEL[object.status]} · r{object.revision}
                    </small>
                  </button>
                ))}
                {filteredObjects.length === 0 && (
                  <div className="review-queue__empty">
                    当前筛选没有对象。
                    <button
                      type="button"
                      onClick={() => {
                        setKindFilter("all");
                        setStatusFilter("all");
                        setRiskFilter("all");
                      }}
                    >
                      清空筛选
                    </button>
                  </div>
                )}
              </div>

              <article className="review-editor">
                <div className="workbench-label">
                  <span>草稿与人工决定</span>
                  <b>{GENERATION_LABEL[selectedObject.generationMode]}</b>
                </div>
                <div className="review-editor__title">
                  <div>
                    <span>{KIND_LABEL[selectedObject.kind]}</span>
                    <h2>{selectedObject.title}</h2>
                  </div>
                  <span className={`review-status status-${selectedObject.status}`}>
                    {STATUS_LABEL[selectedObject.status]}
                  </span>
                </div>
                {editing ? (
                  <div className="review-edit-form">
                    <label htmlFor="smartcourse-editor">修改后的正文</label>
                    <textarea
                      id="smartcourse-editor"
                      value={editValue}
                      onChange={(event) => setEditValue(event.target.value)}
                      rows={7}
                    />
                    <div>
                      <button type="button" onClick={() => setEditing(false)}>
                        取消
                      </button>
                      <button type="button" onClick={saveEdit}>
                        <Checkmark24Regular aria-hidden="true" />
                        保存差异
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="review-editor__body">{selectedObject.body}</p>
                )}

                {selectedObject.id === "generated-sls-scene-001" && (
                  <FrequencyResponseCourt />
                )}

                {selectedObject.unknowns.length > 0 && (
                  <div className="unknown-callout">
                    <Warning24Regular aria-hidden="true" />
                    <div>
                      <strong>未知项不会被藏起来</strong>
                      {selectedObject.unknowns.map((unknown) => (
                        <span key={unknown}>{unknown}</span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="review-actions">
                  <button
                    type="button"
                    disabled={selectedObject.status !== "review" || editing}
                    onClick={() => {
                      setEditValue(selectedObject.body);
                      setEditing(true);
                    }}
                  >
                    <Edit24Regular aria-hidden="true" />
                    修改
                  </button>
                  <button
                    className="is-approve"
                    type="button"
                    disabled={selectedObject.status !== "review" || editing}
                    onClick={approveSelected}
                  >
                    <CheckmarkCircle24Filled aria-hidden="true" />
                    通过
                  </button>
                  <button
                    className="is-remove"
                    type="button"
                    disabled={selectedObject.status !== "review" || editing}
                    onClick={() => setRemoveTargetId(selectedObject.id)}
                  >
                    <Delete24Regular aria-hidden="true" />
                    移除
                  </button>
                </div>
              </article>

              <aside className="review-evidence" aria-label="当前草稿依据">
                <div className="workbench-label">
                  <span>这份草稿依据什么</span>
                  <b>{EVIDENCE_LABEL[selectedObject.evidenceStatus]}</b>
                </div>
                {selectedSources.map((source) => (
                  <article key={source.id}>
                    <header>
                      <span className={`signal-badge signal-${source.signal}`}>
                        {source.signal}
                      </span>
                      <small>{source.locator}</small>
                    </header>
                    <strong>{source.title}</strong>
                    <p>{source.quote}</p>
                    <button
                      type="button"
                      onClick={() => setMessage(`已定位来源：${source.locator}`)}
                    >
                      <Eye24Regular aria-hidden="true" />
                      回看来源
                    </button>
                  </article>
                ))}
              </aside>
            </div>

            <button
              className="studio-primary studio-primary--compact"
              type="button"
              onClick={() => goToStep("publish")}
              disabled={approvedObjects.length === 0}
            >
              前往发布门禁
              <ArrowRight24Regular aria-hidden="true" />
            </button>
          </section>
        )}

        {state.step === "publish" && (
          <section className="studio-view publish-view" aria-labelledby="publish-heading">
            <div className="studio-heading">
              <div>
                <span>03 · RELEASE GATE</span>
                <h1 id="publish-heading">发布的不是“AI 结果”，而是教师批准版本</h1>
                <p>退回和待审核的内容不会出现在学生端。</p>
              </div>
              <DocumentCheckmark24Regular aria-hidden="true" />
            </div>

            <div className="publish-layout">
              <article className="release-card">
                <div className="release-card__header">
                  <span>RELEASE CANDIDATE</span>
                  <b>v1 · 已锁定</b>
                </div>
                <h2>信号与线性系统 · 综合演练包</h2>
                <ul>
                  {releaseEligibleObjects.map((object) => (
                    <li key={object.id}>
                      <CheckmarkCircle24Filled aria-hidden="true" />
                      <span>
                        <strong>{object.title}</strong>
                        <small>{object.sourceIds.length} 个来源 · r{object.revision}</small>
                      </span>
                    </li>
                  ))}
                </ul>
              </article>

              <aside className="release-audit">
                <span>发布检查</span>
                <dl>
                  <div>
                    <dt>已通过</dt>
                    <dd>{releaseEligibleObjects.length}</dd>
                  </div>
                  <div>
                    <dt>仍待审核</dt>
                    <dd>{state.objects.filter((object) => object.status === "review").length}</dd>
                  </div>
                  <div>
                    <dt>已移除</dt>
                    <dd>{state.objects.filter((object) => object.status === "removed").length}</dd>
                  </div>
                  <div>
                    <dt>失效来源</dt>
                    <dd>{state.sources.filter((source) => !source.valid).length}</dd>
                  </div>
                </dl>
                <div className="release-boundary">
                  <ShieldCheckmark24Regular aria-hidden="true" />
                  只有教师已经通过、来源仍然有效的内容，才能进入学生端。
                </div>
                <button
                  className="release-drill"
                  type="button"
                  onClick={toggleFirstSourceValidity}
                >
                  <Warning24Regular aria-hidden="true" />
                  {state.sources[0].valid
                    ? "演练：令首个来源失效"
                    : "结束演练：恢复首个来源"}
                </button>
              </aside>
            </div>

            <button
              className="studio-primary"
              type="button"
              onClick={publish}
              disabled={
                Boolean(state.publication) || releaseEligibleObjects.length === 0
              }
            >
              <DocumentCheckmark24Regular aria-hidden="true" />
              {state.publication ? "发布版本 v1 已锁定" : "确认并形成发布版本 v1"}
              <ArrowRight24Regular aria-hidden="true" />
            </button>
          </section>
        )}

        {state.step === "student" && (
          <section className="studio-view student-view" aria-labelledby="student-heading">
            <div className="studio-heading studio-heading--compact">
              <div>
                <span>04 · PLAYER SESSION</span>
                <h1 id="student-heading">南同学 / NAN 的理解检查</h1>
                <p>“我的人生不是一个数值字段。”这里只记录本人的学习回放。</p>
              </div>
              <Person24Regular aria-hidden="true" />
            </div>

            <article className="player-card">
              <header>
                <div className="player-tag">
                  <span>NAN</span>
                  <div>
                    <strong>南同学</strong>
                    <small>大二 · 工程基础赛季 · UNRATED</small>
                  </div>
                </div>
                <span className="fixture-badge">演示学生</span>
              </header>
              <div className="question-block">
                <span>理解检查 · 1 / 1</span>
                <h2>{STUDENT_QUESTION.prompt}</h2>
                <div className="answer-grid">
                  {STUDENT_QUESTION.options.map((option, index) => (
                    <button
                      type="button"
                      className={selectedAnswer === option.id ? "is-selected" : ""}
                      aria-pressed={selectedAnswer === option.id}
                      onClick={() => {
                        setSelectedAnswer(option.id);
                        if (message === "请先选择一个答案。") {
                          setMessage("答案已选好；现在可以提交并查看依据。");
                        }
                      }}
                      key={option.id}
                    >
                      <span>{String.fromCharCode(65 + index)}</span>
                      {option.label}
                    </button>
                  ))}
                </div>
                <button
                  className="studio-primary studio-primary--compact"
                  type="button"
                  onClick={submitAnswer}
                  disabled={Boolean(state.interaction)}
                >
                  {state.interaction ? "作答已进入 Replay" : "提交答案并查看依据"}
                  <ArrowRight24Regular aria-hidden="true" />
                </button>
              </div>
              {state.interaction && (
                <div className={state.interaction.correct ? "answer-result is-correct" : "answer-result"}>
                  <CheckmarkCircle24Filled aria-hidden="true" />
                  <div>
                    <strong>
                      {state.interaction.correct ? "命中" : "进入复盘"}
                    </strong>
                    <span>
                      你的选择：{selectedOption?.label} · {STUDENT_QUESTION.explanation}
                    </span>
                    <small>来自 PPT 第 12 页 · 教师批准版本 v1</small>
                  </div>
                </div>
              )}
            </article>
          </section>
        )}

        {state.step === "replay" && (
          <section className="studio-view replay-view" aria-labelledby="replay-heading">
            <div className="studio-heading studio-heading--compact">
              <div>
                <span>05 · EVIDENCE PACK</span>
                <h1 id="replay-heading">Replay / Box Score</h1>
                <p>从结果反查来源、人工决定、发布版本与本人互动。</p>
              </div>
              <Replay24Regular aria-hidden="true" />
            </div>

            <div className="replay-layout">
              <article className="box-score">
                <header>
                  <span>SESSION BOX SCORE</span>
                  <b>PRIVATE · NAN</b>
                </header>
                <div>
                  <span>
                    <small>回合状态</small>
                    <strong>已完成 ✓</strong>
                  </span>
                  <span>
                    <small>本次答对</small>
                    <strong>{state.interaction?.correct ? "1 / 1" : "0 / 1"}</strong>
                  </span>
                  <span>
                    <small>用时</small>
                    <strong>{state.interaction?.durationSeconds ?? 0}s</strong>
                  </span>
                  <span>
                    <small>来源回指</small>
                    <strong>{state.sources.length}</strong>
                  </span>
                </div>
                <footer>
                  {state.interaction?.correct
                    ? "命中这一题；来源和教师修改仍可回看。"
                    : "这题没命中也不判负：先回看来源，再打一回合。"}
                </footer>
              </article>

              <article className="replay-timeline">
                <div className="workbench-label">
                  <span>追加式事件时间线</span>
                  <b>{state.events.length} 条记录</b>
                </div>
                <ol>
                  {state.events.map((event) => (
                    <li key={event.id}>
                      <History24Regular aria-hidden="true" />
                      <div>
                        <strong>{event.label}</strong>
                        <span>
                          {actorLabel(event.actor)} · {event.occurredAt}
                        </span>
                        {event.reason && <small>原因：{event.reason}</small>}
                        {event.before && event.after && (
                          <small>修改前后都已保留，可以随时比较。</small>
                        )}
                      </div>
                    </li>
                  ))}
                </ol>
              </article>
            </div>

            <article
              className={`api-evidence-receipt is-${apiReceipt.state}`}
              aria-live="polite"
            >
              <header>
                <span>后台回放记录</span>
                <b>
                  {apiReceipt.state === "live"
                    ? "已核对"
                    : apiReceipt.state === "checking"
                      ? "核对中"
                      : "本地记录"}
                </b>
              </header>
              {apiReceipt.state === "live" ? (
                <>
                  <div>
                    <span>
                      <small>草稿版本</small>
                      <strong>第 {apiReceipt.revision} 版</strong>
                    </span>
                    <span>
                      <small>来源 / 证据</small>
                      <strong>
                        {apiReceipt.sourceCount} / {apiReceipt.evidenceCount}
                      </strong>
                    </span>
                    <span>
                      <small>审核 / 发布</small>
                      <strong>
                        {apiReceipt.reviewEventCount} / {apiReceipt.publicationCount}
                      </strong>
                    </span>
                    <span>
                      <small>本人互动</small>
                      <strong>{apiReceipt.interactionCount}</strong>
                    </span>
                  </div>
                  <footer>
                    后台记录已经读取并通过格式检查；当前工作台里的演练仍只保存在本地。
                  </footer>
                </>
              ) : (
                <p>
                  {apiReceipt.message}
                  <small>
                    页面会清楚标出本地状态，不会把演示数据冒充成在线记录。
                  </small>
                </p>
              )}
            </article>

            <div className="replay-actions">
              <button type="button" onClick={() => goToStep("source")}>
                <BookOpen24Regular aria-hidden="true" />
                回看来源
              </button>
              <button type="button" onClick={reset}>
                <Replay24Regular aria-hidden="true" />
                重置 Demo
              </button>
              <button className="is-primary" type="button" onClick={onExit}>
                返回 {exitLabel}
                <ArrowRight24Regular aria-hidden="true" />
              </button>
            </div>
          </section>
        )}
      </main>

      <footer className="smartcourse-footer" role="status" aria-live="polite">
        <div>
          <ShieldCheckmark24Regular aria-hidden="true" />
          <span>{message}</span>
        </div>
        <button type="button" onClick={reset}>
          <Replay24Regular aria-hidden="true" />
          重置
        </button>
      </footer>

      {removeTargetId && (
        <div className="studio-modal-backdrop" role="presentation">
          <section
            className="studio-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="remove-heading"
          >
            <header>
              <Delete24Regular aria-hidden="true" />
              <div>
                <span>HUMAN OVERRIDE</span>
                <h2 id="remove-heading">确认移除此草稿？</h2>
              </div>
              <button
                type="button"
                aria-label="取消移除"
                onClick={() => setRemoveTargetId(null)}
              >
                <Dismiss24Regular aria-hidden="true" />
              </button>
            </header>
            <p>移除后不会发布；操作时间和原因仍可以回看。</p>
            <label htmlFor="remove-reason">移除原因</label>
            <textarea
              id="remove-reason"
              rows={4}
              value={removeReason}
              onChange={(event) => setRemoveReason(event.target.value)}
            />
            <div>
              <button type="button" onClick={() => setRemoveTargetId(null)}>
                返回审核
              </button>
              <button type="button" className="is-danger" onClick={confirmRemove}>
                <Delete24Regular aria-hidden="true" />
                确认移除
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}

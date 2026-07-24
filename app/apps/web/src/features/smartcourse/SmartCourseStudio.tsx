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
  const [message, setMessage] = useState(
    entryPoint === "authoring"
      ? "当前为明确标注的本地 Fixture；所有动作可重置，不写入学校系统。"
      : entryPoint === "review"
        ? "已从 Coach Studio 进入教师审核席；所有来源、修改和决定均保留 Replay。"
        : entryPoint === "publish"
          ? "已从 Coach Studio 进入发布门禁；只有教师已通过且来源有效的对象可发布。"
      : entryPoint === "student"
          ? "已从 MyCareer 赛季中心进入教师审核后的发布版本；返回路径始终可见。"
          : "已从 MyCareer 课程 Box Score 进入完整证据回放；这是可重复的 Fixture 记录。",
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

  const goToStep = (step: SmartCourseStep) => {
    if (!canOpenStep(state, step)) {
      setMessage("这一步仍被前置证据门禁锁定。先完成左侧当前任务。");
      return;
    }
    setState((current) => ({ ...current, step }));
  };

  const loadFixture = () => {
    setState((current) => loadAuthorizedFixture(current));
    setMessage("已登记 1 份授权 Demo 材料，提取 3 个来源片段和 5 个结构化草稿。");
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
          "元数据与哈希已登记；V0.9 未启用通用解析器，因此明确停在 partial。可手工录入来源，或切换授权 Fixture 完成闭环。",
        hash,
        format: validation.format,
        sizeLabel: validation.sizeLabel,
      });
      setMessage(
        "本地材料登记完成；解析适配器未启用，系统没有伪装成功。",
      );
    } catch {
      setLocalIntake({
        status: "failed",
        message: "浏览器无法读取该文件；请重试或改用授权 Fixture。",
      });
    }
  };

  const saveManualSource = () => {
    if (!manualLocator.trim() || !manualQuote.trim()) {
      setMessage("手工来源必须同时填写定位器与原文片段。");
      return;
    }
    setManualSourceSaved(true);
    setMessage(
      "手工来源已留在当前浏览器会话；它不会与 Fixture 或学校权威数据混用。",
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
    setMessage("本地材料测试场已清空；Fixture 主链不受影响。");
  };

  const saveEdit = () => {
    try {
      setState((current) =>
        editTeachingObject(current, selectedObject.id, editValue),
      );
      setEditing(false);
      setMessage("修改已保存；前后文本作为追加式 ReviewEvent 保留。");
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
      setMessage("对象已移除并保留原因；不会进入发布版本。");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "无法移除对象。");
    }
  };

  const publish = () => {
    try {
      setState((current) => publishApprovedObjects(current));
      setMessage("不可变发布版本 v1 已形成；学生端只能看到已通过对象。");
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
    setMessage("Demo 已重置；所有 Fixture 动作均可从头重复验收。");
  };

  const toggleFirstSourceValidity = () => {
    const source = state.sources[0];
    setState((current) =>
      setSourceValidity(current, source.id, !source.valid),
    );
    setMessage(
      source.valid
        ? "已模拟来源失效：依赖它的已通过草稿会立即被发布门禁排除。"
        : "来源已恢复：发布候选会重新计算，但不会覆盖既有审计事件。",
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
        <div className="smartcourse-runtime">
          <DataTrending24Regular aria-hidden="true" />
          <span>{backendLabel}</span>
          <b>FIXTURE</b>
        </div>
      </header>

      <aside className="smartcourse-steps" aria-label="智课工坊验收步骤">
        <div className="smartcourse-steps__heading">
          <span>F-001</span>
          <strong>来源到 Replay</strong>
          <small>一条完整纵向闭环</small>
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
                <h1 id="source-heading">先确认“有权使用”，再让 AI 开口</h1>
                <p>材料、版本、哈希、权利状态和保留期均进入同一来源链。</p>
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
                    <dd>{state.material.uploadedBy}</dd>
                  </div>
                  <div>
                    <dt>保留期</dt>
                    <dd>{state.material.retention}</dd>
                  </div>
                </dl>
              </div>
              <div className="material-card__status">
                <CheckmarkCircle24Filled aria-hidden="true" />
                可进入生成链
              </div>
            </article>

            <details className="intake-test-court">
              <summary>
                <DocumentSearch24Regular aria-hidden="true" />
                <span>
                  <strong>LOCAL INTAKE TEST COURT</strong>
                  <small>真实选择文件 · 权利阻断 · SHA-256 · partial / failed 回退</small>
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
                      <strong>解析器不可用时，教师可手工登记可定位原文</strong>
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
                          <em>LOCAL SESSION ONLY · 未进入 Fixture / 学校数据</em>
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
                ? "Fixture 已载入"
                : "载入 5 项结构化 Demo 草稿"}
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
                <p>完成至少一次修改、通过和移除，发布门禁才有完整证据。</p>
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
                  <b>{selectedObject.generationMode} · {selectedObject.generatorVersion}</b>
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
                  <span>SHOW YOUR WORK</span>
                  <b>{selectedObject.evidenceStatus}</b>
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
                <p>已移除与仍待审核的对象不会进入学生可见范围。</p>
              </div>
              <DocumentCheckmark24Regular aria-hidden="true" />
            </div>

            <div className="publish-layout">
              <article className="release-card">
                <div className="release-card__header">
                  <span>RELEASE CANDIDATE</span>
                  <b>v1 · IMMUTABLE</b>
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
                  仅包含 `approved` 且来源有效的具体修订。
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
                <span className="fixture-badge">FIXTURE PLAYER</span>
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
                      onClick={() => setSelectedAnswer(option.id)}
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
                    <small>闭环完成</small>
                    <strong>100%</strong>
                  </span>
                  <span>
                    <small>理解检查</small>
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
                  不含班级排名、他人成绩或公开 GPA 天梯。
                </footer>
              </article>

              <article className="replay-timeline">
                <div className="workbench-label">
                  <span>追加式事件时间线</span>
                  <b>{state.events.length} events</b>
                </div>
                <ol>
                  {state.events.map((event) => (
                    <li key={event.id}>
                      <History24Regular aria-hidden="true" />
                      <div>
                        <strong>{event.label}</strong>
                        <span>{event.actor} · {event.occurredAt}</span>
                        {event.reason && <small>原因：{event.reason}</small>}
                        {event.before && event.after && (
                          <small>已保留修改前后正文 · ReviewEvent {event.id}</small>
                        )}
                      </div>
                    </li>
                  ))}
                </ol>
              </article>
            </div>

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
            <p>移除对象不会发布，但审计记录与原因会保留。</p>
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

import { useEffect, useMemo, useState } from "react";
import {
  Add24Regular,
  Archive24Regular,
  ArrowDownload24Regular,
  ArrowLeft24Regular,
  ArrowSync24Regular,
  CheckmarkCircle24Filled,
  CloudOff24Regular,
  Database24Regular,
  Delete24Regular,
  DocumentData24Regular,
  DocumentSync24Regular,
  Eye24Regular,
  History24Regular,
  Info24Regular,
  LockClosed24Regular,
  PersonFeedback24Regular,
  Settings24Regular,
  ShieldCheckmark24Regular,
  ShieldError24Regular,
  Warning24Regular,
} from "@fluentui/react-icons";
import {
  AUTHORITY_LABELS,
  FRESHNESS_LABELS,
  buildModuleAccessPreview,
  buildReadableArchive,
  buildTrustedEnvelope,
  createAcademicMirrorState,
  deleteNonAuthoritativeCopy,
  deriveFreshness,
  recordExport,
  registerSource,
  requestCorrection,
  resetAcademicMirrorState,
  resolveConflict,
  selectRecord,
  syncSource,
  toggleConsent,
} from "./engine";
import {
  clearMirrorState,
  loadMirrorState,
  saveMirrorState,
} from "./storage";
import type {
  AuthorityLevel,
  ConflictRecord,
  MirrorState,
  MirrorStep,
  MirrorValue,
  SourceRegistrationDraft,
} from "./types";
import { useI18n } from "../../i18n/I18nProvider";
import "./academicmirror.css";

type AcademicMirrorStudioProps = {
  backendLabel: string;
  onExit: () => void;
};

const STEP_LABELS: Array<{
  id: MirrorStep;
  immersive: string;
  traditional: string;
  icon: typeof Database24Regular;
}> = [
  {
    id: "sources",
    immersive: "Source Dock",
    traditional: "数据源与快照",
    icon: Database24Regular,
  },
  {
    id: "browse",
    immersive: "Truth Lens",
    traditional: "镜像浏览",
    icon: Eye24Regular,
  },
  {
    id: "conflicts",
    immersive: "Review Queue",
    traditional: "冲突校对",
    icon: PersonFeedback24Regular,
  },
  {
    id: "consent",
    immersive: "Access Draft",
    traditional: "同意与用途",
    icon: ShieldCheckmark24Regular,
  },
  {
    id: "audit",
    immersive: "Replay Ledger",
    traditional: "导出与审计",
    icon: History24Regular,
  },
];

const ENTITY_LABELS = {
  student: "学生",
  course: "课程",
  offering: "开课",
  grade: "成绩",
  requirement: "要求 / 建议",
  activity: "活动",
  term: "学期",
} as const;

const ACTION_LABELS = {
  source_register: "登记数据源",
  sync: "同步",
  map: "标准映射",
  query: "查询",
  conflict_resolve: "冲突校对",
  export: "导出",
  delete: "删除副本",
  correction_request: "校对请求",
  consent_grant: "授予同意",
  consent_revoke: "撤回同意",
  offline_fallback: "离线回退",
} as const;

function formatValue(value: MirrorValue): string {
  if (Array.isArray(value)) return value.join(" · ");
  if (typeof value === "boolean") return value ? "是" : "否";
  return String(value);
}

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

function AuthorityBadge({
  level,
  effectiveFixture = true,
}: {
  level: AuthorityLevel;
  effectiveFixture?: boolean;
}) {
  return (
    <span
      className={`mirror-authority is-${level}`}
      title={AUTHORITY_LABELS[level].detail}
    >
      {AUTHORITY_LABELS[level].short}
      {effectiveFixture ? <small>FIXTURE</small> : null}
    </span>
  );
}

function ConflictCard({
  conflict,
  selectedOptionId,
  reason,
  onOptionChange,
  onReasonChange,
  onResolve,
}: {
  conflict: ConflictRecord;
  selectedOptionId: string;
  reason: string;
  onOptionChange: (optionId: string) => void;
  onReasonChange: (reason: string) => void;
  onResolve: () => void;
}) {
  const { formatDate } = useI18n();
  const formatMirrorTime = (value: string): string => {
    const timestamp = Date.parse(value);
    return Number.isNaN(timestamp)
      ? value
      : formatDate(timestamp, {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        });
  };
  const resolved = conflict.status === "resolved";
  return (
    <article
      className={`mirror-conflict-card ${resolved ? "is-resolved" : ""}`}
    >
      <header>
        <div>
          <span>CONFLICT // {conflict.fieldName.toUpperCase()}</span>
          <h2>{conflict.entityLabel}</h2>
        </div>
        <strong>
          {resolved ? (
            <CheckmarkCircle24Filled aria-hidden="true" />
          ) : (
            <Warning24Regular aria-hidden="true" />
          )}
          {resolved ? "已人工处理" : "等待校对"}
        </strong>
      </header>

      <div className="mirror-conflict-options" role="radiogroup">
        {conflict.options.map((option) => (
          <label
            key={option.id}
            className={
              selectedOptionId === option.id ? "is-selected" : undefined
            }
          >
            <input
              type="radio"
              name={`option-${conflict.id}`}
              value={option.id}
              checked={selectedOptionId === option.id}
              onChange={() => onOptionChange(option.id)}
              disabled={resolved}
              data-focusable="true"
            />
            <span>
              <strong>{formatValue(option.value)}</strong>
              <small>{option.sourceSystem}</small>
              <small>{formatMirrorTime(option.fetchedAt)}</small>
            </span>
            <AuthorityBadge level={option.declaredAuthority} />
          </label>
        ))}
      </div>

      {resolved && conflict.resolution ? (
        <div className="mirror-resolution-receipt">
          <CheckmarkCircle24Filled aria-hidden="true" />
          <div>
            <strong>
              已选择 {formatValue(conflict.resolution.chosenValue)} ·{" "}
              {conflict.resolution.chosenSource}
            </strong>
            <span>{conflict.resolution.reason}</span>
            <small>
              {conflict.resolution.resolvedBy} ·{" "}
              {conflict.resolution.resolvedAt}
            </small>
          </div>
        </div>
      ) : (
        <div className="mirror-conflict-decision">
          <label>
            人工判断理由
            <textarea
              value={reason}
              onChange={(event) => onReasonChange(event.target.value)}
              placeholder="说明为何采用该来源，并如何保留另一来源的差异……"
              data-focusable="true"
            />
          </label>
          <button type="button" onClick={onResolve} data-focusable="true">
            <PersonFeedback24Regular aria-hidden="true" />
            确认镜像校对
          </button>
        </div>
      )}
    </article>
  );
}

export function AcademicMirrorStudio({
  backendLabel,
  onExit,
}: AcademicMirrorStudioProps) {
  const { formatDate } = useI18n();
  const formatMirrorTime = (value: string): string => {
    const timestamp = Date.parse(value);
    return Number.isNaN(timestamp)
      ? value
      : formatDate(timestamp, {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        });
  };
  const [state, setState] = useState<MirrorState>(() => {
    try {
      return loadMirrorState() ?? createAcademicMirrorState();
    } catch {
      return createAcademicMirrorState();
    }
  });
  const [traditional, setTraditional] = useState(false);
  const [registrationOpen, setRegistrationOpen] = useState(false);
  const [registrationDraft, setRegistrationDraft] =
    useState<SourceRegistrationDraft>({
      name: "本地授权课程导出",
      systemType: "manual_export",
      responsibleParty: "学生本人",
      fieldScope: ["course.title", "course.credits"],
      correctionRoute: "重新导入已脱敏文件，或删除非权威副本。",
    });
  const [conflictSelections, setConflictSelections] = useState<
    Record<string, string>
  >(() =>
    Object.fromEntries(
      state.conflicts.map((conflict) => [
        conflict.id,
        conflict.options[0]?.id ?? "",
      ]),
    ),
  );
  const [conflictReasons, setConflictReasons] = useState<
    Record<string, string>
  >({});
  const [correctionReason, setCorrectionReason] = useState(
    "请核对当前镜像字段与来源系统的差异。",
  );

  useEffect(() => {
    saveMirrorState(state);
  }, [state]);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [state.step]);

  const selectedRecord = useMemo(
    () =>
      state.records.find((record) => record.id === state.selectedRecordId) ??
      state.records[0] ??
      null,
    [state.records, state.selectedRecordId],
  );
  const accessPreview = useMemo(
    () => buildModuleAccessPreview(state),
    [state],
  );
  const unresolvedCount = state.conflicts.filter(
    (conflict) => conflict.status !== "resolved",
  ).length;
  const activeConsentCount = state.consents.filter(
    (consent) => consent.revokedAt === null,
  ).length;

  const commit = (
    action: (current: MirrorState) => MirrorState,
    fallbackMessage = "操作未完成。",
  ) => {
    try {
      setState((current) => action(current));
    } catch (error) {
      setState((current) => ({
        ...current,
        message: error instanceof Error ? error.message : fallbackMessage,
      }));
    }
  };

  const register = () => {
    commit((current) => registerSource(current, registrationDraft));
    setRegistrationOpen(false);
  };

  const resolve = (conflictId: string) => {
    commit((current) =>
      resolveConflict(
        current,
        conflictId,
        conflictSelections[conflictId] ?? "",
        conflictReasons[conflictId] ?? "",
      ),
    );
  };

  const exportReadable = () => {
    const archive = buildReadableArchive(state);
    downloadJson("university2k26-readable-mirror-fixture.json", archive);
    commit((current) => recordExport(current, "readable_untrusted"));
  };

  const exportTrustedContract = () => {
    const envelope = buildTrustedEnvelope(state);
    downloadJson(
      "university2k26-trusted-archive-contract-unsigned-fixture.json",
      envelope,
    );
    commit((current) =>
      recordExport(current, "trusted_archive_contract_fixture"),
    );
  };

  const reset = () => {
    clearMirrorState();
    setState(resetAcademicMirrorState());
    setConflictReasons({});
    setConflictSelections(
      Object.fromEntries(
        createAcademicMirrorState().conflicts.map((conflict) => [
          conflict.id,
          conflict.options[0]?.id ?? "",
        ]),
      ),
    );
  };

  const currentStep =
    STEP_LABELS.find((step) => step.id === state.step) ?? STEP_LABELS[0];

  return (
    <div
      className={[
        "mirror-shell",
        traditional ? "is-traditional" : "",
        state.offline ? "is-offline" : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <a className="skip-link" href="#mirror-main">
        跳到 Academic Mirror 主要内容
      </a>
      <div className="mirror-shell__background" aria-hidden="true" />

      <header className="mirror-topbar">
        <button
          className="mirror-back"
          type="button"
          onClick={onExit}
          data-focusable="true"
        >
          <ArrowLeft24Regular aria-hidden="true" />
          返回 MyCareer
        </button>
        <div className="mirror-brand">
          <span>UNIVERSITY2K26 // F-003</span>
          <strong>ACADEMIC MIRROR</strong>
        </div>
        <div className="mirror-topbar__status">
          <span>
            <DocumentData24Regular aria-hidden="true" />
            {backendLabel} · Fixture
          </span>
          <button
            type="button"
            aria-pressed={state.offline}
            onClick={() =>
              setState((current) => ({
                ...current,
                offline: !current.offline,
                message: current.offline
                  ? "已恢复在线 Fixture 模式。"
                  : `已切换离线；继续使用 ${formatMirrorTime(current.lastTrustedSnapshotAt)} 的镜像。`,
              }))
            }
            data-focusable="true"
          >
            <CloudOff24Regular aria-hidden="true" />
            {state.offline ? "离线回退中" : "模拟离线"}
          </button>
          <button
            type="button"
            aria-pressed={traditional}
            onClick={() => setTraditional((current) => !current)}
            data-focusable="true"
          >
            <Settings24Regular aria-hidden="true" />
            {traditional ? "传统数据视图" : "赛季驾驶舱"}
          </button>
          <button type="button" onClick={reset} data-focusable="true">
            <ArrowSync24Regular aria-hidden="true" />
            重置
          </button>
        </div>
      </header>

      <nav className="mirror-stepbar" aria-label="Academic Mirror 功能步骤">
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

      <div className="mirror-boundary-banner" role="status">
        <LockClosed24Regular aria-hidden="true" />
        <strong>READ-ONLY // DEMO FIXTURE</strong>
        <span>{state.sourceBoundary}</span>
      </div>

      <main id="mirror-main" className="mirror-main" tabIndex={-1}>
        <header className="mirror-page-heading">
          <div>
            <span className="mirror-page-heading__kicker">
              {currentStep.id.toUpperCase()} // SOURCE BEFORE SCORE
            </span>
            <h1>
              {traditional ? currentStep.traditional : currentStep.immersive}
            </h1>
          </div>
          <div className="mirror-heading-metrics">
            <span>
              <b>{state.sources.length}</b> SOURCES
            </span>
            <span>
              <b>{state.snapshots.length}</b> SNAPSHOTS
            </span>
            <span>
              <b>{unresolvedCount}</b> REVIEW
            </span>
            <span>
              <b>{activeConsentCount}</b> CONSENTS
            </span>
          </div>
        </header>

        <div className="mirror-live-message" role="status" aria-live="polite">
          <Info24Regular aria-hidden="true" />
          <span>{state.message}</span>
        </div>

        {state.step === "sources" ? (
          <div className="mirror-source-stage">
            <section className="mirror-panel mirror-source-registry">
              <header className="mirror-panel__header">
                <div>
                  <span>SOURCE REGISTRY</span>
                  <h2>授权来源与适配器</h2>
                </div>
                <button
                  type="button"
                  onClick={() => setRegistrationOpen((current) => !current)}
                  aria-expanded={registrationOpen}
                  data-focusable="true"
                >
                  <Add24Regular aria-hidden="true" />
                  登记本地来源
                </button>
              </header>

              {registrationOpen ? (
                <div className="mirror-registration-form">
                  <label>
                    来源名称
                    <input
                      value={registrationDraft.name}
                      onChange={(event) =>
                        setRegistrationDraft((current) => ({
                          ...current,
                          name: event.target.value,
                        }))
                      }
                      data-focusable="true"
                    />
                  </label>
                  <label>
                    系统类型
                    <select
                      value={registrationDraft.systemType}
                      onChange={(event) =>
                        setRegistrationDraft((current) => ({
                          ...current,
                          systemType: event.target
                            .value as SourceRegistrationDraft["systemType"],
                        }))
                      }
                      data-focusable="true"
                    >
                      <option value="manual_export">授权导出文件</option>
                      <option value="sis">学校批准 SIS 导出</option>
                      <option value="urp">学校批准 URP 导出</option>
                      <option value="lms">学校批准 LMS 导出</option>
                      <option value="demo_fixture">演示夹具</option>
                    </select>
                  </label>
                  <label>
                    责任方
                    <input
                      value={registrationDraft.responsibleParty}
                      onChange={(event) =>
                        setRegistrationDraft((current) => ({
                          ...current,
                          responsibleParty: event.target.value,
                        }))
                      }
                      data-focusable="true"
                    />
                  </label>
                  <label>
                    字段范围（逗号分隔）
                    <input
                      value={registrationDraft.fieldScope.join(", ")}
                      onChange={(event) =>
                        setRegistrationDraft((current) => ({
                          ...current,
                          fieldScope: event.target.value
                            .split(",")
                            .map((item) => item.trim())
                            .filter(Boolean),
                        }))
                      }
                      data-focusable="true"
                    />
                  </label>
                  <label className="is-wide">
                    纠错渠道
                    <input
                      value={registrationDraft.correctionRoute}
                      onChange={(event) =>
                        setRegistrationDraft((current) => ({
                          ...current,
                          correctionRoute: event.target.value,
                        }))
                      }
                      data-focusable="true"
                    />
                  </label>
                  <button type="button" onClick={register} data-focusable="true">
                    <ShieldCheckmark24Regular aria-hidden="true" />
                    确认登记（不收集密码）
                  </button>
                </div>
              ) : null}

              <div className="mirror-source-grid">
                {state.sources.map((source) => {
                  const snapshotCount = state.snapshots.filter(
                    (snapshot) => snapshot.dataSourceId === source.id,
                  ).length;
                  return (
                    <article key={source.id} className="mirror-source-card">
                      <header>
                        <span>
                          {source.adapterKind === "demo_fixture"
                            ? "DEMO ADAPTER"
                            : "FILE ADAPTER"}
                        </span>
                        <AuthorityBadge level={source.declaredAuthority} />
                      </header>
                      <h3>{source.name}</h3>
                      <p>{source.responsibleParty}</p>
                      <dl>
                        <div>
                          <dt>授权</dt>
                          <dd>{source.authorized ? "已确认" : "待确认"}</dd>
                        </div>
                        <div>
                          <dt>刷新</dt>
                          <dd>{source.refreshMethod}</dd>
                        </div>
                        <div>
                          <dt>快照</dt>
                          <dd>{snapshotCount}</dd>
                        </div>
                        <div>
                          <dt>保留</dt>
                          <dd>{source.retentionDays} 天</dd>
                        </div>
                      </dl>
                      <small>{source.fieldScope.join(" · ")}</small>
                      <div className="mirror-source-card__actions">
                        <button
                          type="button"
                          disabled={!source.authorized}
                          onClick={() =>
                            commit((current) => syncSource(current, source.id))
                          }
                          data-focusable="true"
                        >
                          <DocumentSync24Regular aria-hidden="true" />
                          {state.offline ? "使用缓存" : "检查并生成快照"}
                        </button>
                        <span>
                          {source.lastSyncedAt
                            ? `上次 ${formatMirrorTime(source.lastSyncedAt)}`
                            : "尚未选择文件"}
                        </span>
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>

            <section className="mirror-panel mirror-snapshot-ledger">
              <header className="mirror-panel__header">
                <div>
                  <span>IMMUTABLE RAW RECEIPTS</span>
                  <h2>原始快照收据</h2>
                </div>
                <LockClosed24Regular aria-hidden="true" />
              </header>
              <div className="mirror-snapshot-list">
                {[...state.snapshots].reverse().slice(0, 8).map((snapshot) => (
                  <article key={snapshot.id}>
                    <Database24Regular aria-hidden="true" />
                    <div>
                      <strong>{snapshot.id}</strong>
                      <span>
                        {snapshot.sourceVersion} · {snapshot.format} ·{" "}
                        {snapshot.sizeBytes} bytes
                      </span>
                      <code>{snapshot.contentHash}</code>
                    </div>
                    <small>{formatMirrorTime(snapshot.fetchedAt)}</small>
                  </article>
                ))}
              </div>
            </section>
          </div>
        ) : null}

        {state.step === "browse" ? (
          <div className="mirror-browser">
            <aside className="mirror-record-list" aria-label="镜像记录">
              <header>
                <span>NORMALIZED RECORDS</span>
                <strong>{state.records.length} records</strong>
              </header>
              {state.records.map((record) => {
                const freshness = deriveFreshness(record, state.referenceTime);
                return (
                  <button
                    key={record.id}
                    type="button"
                    className={
                      selectedRecord?.id === record.id ? "is-active" : undefined
                    }
                    onClick={() =>
                      commit((current) => selectRecord(current, record.id))
                    }
                    data-focusable="true"
                  >
                    <span>{ENTITY_LABELS[record.entityType]}</span>
                    <strong>{record.label}</strong>
                    <small className={`is-${freshness}`}>
                      {FRESHNESS_LABELS[freshness].label}
                    </small>
                  </button>
                );
              })}
            </aside>

            {selectedRecord ? (
              <section className="mirror-record-detail">
                <header>
                  <div>
                    <span>
                      {ENTITY_LABELS[selectedRecord.entityType]} //{" "}
                      {selectedRecord.entityId}
                    </span>
                    <h2>{selectedRecord.label}</h2>
                  </div>
                  <span
                    className={`mirror-freshness is-${deriveFreshness(
                      selectedRecord,
                      state.referenceTime,
                    )}`}
                  >
                    {deriveFreshness(selectedRecord, state.referenceTime) ===
                    "expired" ? (
                      <ShieldError24Regular aria-hidden="true" />
                    ) : (
                      <ShieldCheckmark24Regular aria-hidden="true" />
                    )}
                    {
                      FRESHNESS_LABELS[
                        deriveFreshness(selectedRecord, state.referenceTime)
                      ].label
                    }
                  </span>
                </header>

                <div className="mirror-field-table">
                  {Object.entries(selectedRecord.fields).map(
                    ([fieldName, normalizedField]) => (
                      <article key={fieldName}>
                        <div className="mirror-field-value">
                          <span>{fieldName}</span>
                          <strong>{formatValue(normalizedField.value)}</strong>
                          <AuthorityBadge
                            level={normalizedField.provenance.declaredAuthority}
                          />
                        </div>
                        <div className="mirror-provenance-chain">
                          <div>
                            <span>SOURCE</span>
                            <strong>
                              {normalizedField.provenance.sourceSystem}
                            </strong>
                            <small>
                              {normalizedField.provenance.externalField}
                            </small>
                          </div>
                          <div>
                            <span>VERSION</span>
                            <strong>
                              {normalizedField.provenance.sourceVersion}
                            </strong>
                            <small>
                              {formatMirrorTime(
                                normalizedField.provenance.fetchedAt,
                              )}
                            </small>
                          </div>
                          <div>
                            <span>SNAPSHOT</span>
                            <strong>
                              {normalizedField.provenance.rawSnapshotId}
                            </strong>
                            <small>
                              {normalizedField.provenance.conversionRule}
                            </small>
                          </div>
                        </div>
                      </article>
                    ),
                  )}
                </div>

                <div className="mirror-record-actions">
                  <label>
                    校对请求
                    <textarea
                      value={correctionReason}
                      onChange={(event) =>
                        setCorrectionReason(event.target.value)
                      }
                      data-focusable="true"
                    />
                  </label>
                  <div>
                    <button
                      type="button"
                      onClick={() =>
                        commit((current) =>
                          requestCorrection(
                            current,
                            selectedRecord.id,
                            correctionReason,
                          ),
                        )
                      }
                      data-focusable="true"
                    >
                      <PersonFeedback24Regular aria-hidden="true" />
                      提交镜像校对
                    </button>
                    <button
                      type="button"
                      className="is-danger"
                      onClick={() =>
                        commit((current) =>
                          deleteNonAuthoritativeCopy(
                            current,
                            selectedRecord.id,
                          ),
                        )
                      }
                      data-focusable="true"
                    >
                      <Delete24Regular aria-hidden="true" />
                      删除非权威副本
                    </button>
                  </div>
                  <p>
                    <Info24Regular aria-hidden="true" />
                    {selectedRecord.correctionRoute}
                  </p>
                </div>
              </section>
            ) : (
              <section className="mirror-record-empty">
                <DocumentData24Regular aria-hidden="true" />
                <h2>镜像中没有可显示的记录</h2>
                <p>可重置 Fixture 或重新导入本人授权的文件。</p>
              </section>
            )}
          </div>
        ) : null}

        {state.step === "conflicts" ? (
          <div className="mirror-conflict-stage">
            <section className="mirror-review-brief">
              <Warning24Regular aria-hidden="true" />
              <div>
                <strong>冲突不会按“最新”或“看起来最权威”静默覆盖</strong>
                <span>
                  并排查看值、来源、版本与时间；选择后必须写下理由，原差异仍保留在审计链中。
                </span>
              </div>
              <b>{unresolvedCount} 待处理</b>
            </section>
            {state.conflicts.map((conflict) => (
              <ConflictCard
                key={conflict.id}
                conflict={conflict}
                selectedOptionId={conflictSelections[conflict.id] ?? ""}
                reason={conflictReasons[conflict.id] ?? ""}
                onOptionChange={(optionId) =>
                  setConflictSelections((current) => ({
                    ...current,
                    [conflict.id]: optionId,
                  }))
                }
                onReasonChange={(reason) =>
                  setConflictReasons((current) => ({
                    ...current,
                    [conflict.id]: reason,
                  }))
                }
                onResolve={() => resolve(conflict.id)}
              />
            ))}
          </div>
        ) : null}

        {state.step === "consent" ? (
          <div className="mirror-consent-stage">
            <section className="mirror-panel mirror-consent-list">
              <header className="mirror-panel__header">
                <div>
                  <span>PURPOSE-BOUND CONSENT</span>
                  <h2>谁能为哪个目的读取什么</h2>
                </div>
                <ShieldCheckmark24Regular aria-hidden="true" />
              </header>
              {state.consents.map((consent) => {
                const source = state.sources.find(
                  (candidate) => candidate.id === consent.dataSourceId,
                );
                const active = consent.revokedAt === null;
                return (
                  <article
                    key={consent.id}
                    className={active ? "is-active" : "is-revoked"}
                  >
                    <div className="mirror-consent-status">
                      {active ? (
                        <ShieldCheckmark24Regular aria-hidden="true" />
                      ) : (
                        <ShieldError24Regular aria-hidden="true" />
                      )}
                      <span>{active ? "有效同意" : "已撤回"}</span>
                    </div>
                    <div>
                      <h3>{source?.name ?? consent.dataSourceId}</h3>
                      <p>{consent.purpose}</p>
                      <span>
                        {consent.allowedModules.join(" · ")} // {consent.scope}
                      </span>
                      <small>
                        到期：
                        {consent.expiresAt
                          ? formatMirrorTime(consent.expiresAt)
                          : "无自动到期"}{" "}
                        · 来源：
                        {consent.dataSourceId}
                      </small>
                    </div>
                    <button
                      type="button"
                      aria-pressed={active}
                      onClick={() =>
                        commit((current) =>
                          toggleConsent(current, consent.id),
                        )
                      }
                      data-focusable="true"
                    >
                      {active ? "撤回同意" : "按原用途恢复"}
                    </button>
                  </article>
                );
              })}
            </section>

            <section className="mirror-panel mirror-access-preview">
              <header className="mirror-panel__header">
                <div>
                  <span>DOWNSTREAM GATE</span>
                  <h2>下游模块读取预览</h2>
                </div>
                <Eye24Regular aria-hidden="true" />
              </header>
              {accessPreview.map((preview) => (
                <article
                  key={preview.moduleId}
                  className={`is-${preview.status}`}
                >
                  {preview.status === "allowed" ? (
                    <CheckmarkCircle24Filled aria-hidden="true" />
                  ) : (
                    <ShieldError24Regular aria-hidden="true" />
                  )}
                  <div>
                    <span>{preview.moduleId}</span>
                    <strong>{preview.moduleName}</strong>
                    <small>{preview.reason}</small>
                    <code>{preview.sourceIds.join(" + ")}</code>
                  </div>
                </article>
              ))}
              <p>
                <LockClosed24Regular aria-hidden="true" />
                扩大用途必须重新同意；当前只有只读、导出或匹配范围，没有写回权限。
              </p>
            </section>
          </div>
        ) : null}

        {state.step === "audit" ? (
          <div className="mirror-audit-stage">
            <section className="mirror-archive-deck">
              <article>
                <DocumentData24Regular aria-hidden="true" />
                <span>PORTABLE COPY</span>
                <h2>可阅读个人副本</h2>
                <p>
                  JSON 可离线阅读，保留来源、版本、同意和审计收据；明确标记非权威。
                </p>
                <button
                  type="button"
                  onClick={exportReadable}
                  data-focusable="true"
                >
                  <ArrowDownload24Regular aria-hidden="true" />
                  导出 readable_untrusted
                </button>
              </article>
              <article className="is-trusted-contract">
                <Archive24Regular aria-hidden="true" />
                <span>TRUSTED ARCHIVE CONTRACT</span>
                <h2>可信归档合同样例</h2>
                <p>
                  仅展示未来签名、加密、隔离导入所需字段；当前没有发行方签名或密钥。
                </p>
                <button
                  type="button"
                  onClick={exportTrustedContract}
                  data-focusable="true"
                >
                  <ArrowDownload24Regular aria-hidden="true" />
                  导出 UNSIGNED FIXTURE
                </button>
              </article>
            </section>

            <section className="mirror-panel mirror-audit-ledger">
              <header className="mirror-panel__header">
                <div>
                  <span>APPEND-ONLY REPLAY</span>
                  <h2>审计事件链</h2>
                </div>
                <strong>{state.audit.length} events</strong>
              </header>
              <ol>
                {[...state.audit].reverse().map((event) => (
                  <li key={event.id}>
                    <span>{String(event.sequence).padStart(3, "0")}</span>
                    <div>
                      <strong>{ACTION_LABELS[event.action]}</strong>
                      <small>
                        {event.targetEntity} ·{" "}
                        {formatMirrorTime(event.timestamp)}
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
          </div>
        ) : null}
      </main>

      <footer className="mirror-footer">
        <span>
          <LockClosed24Regular aria-hidden="true" />
          Academic Mirror 不是学校权威系统
        </span>
        <span>
          <Database24Regular aria-hidden="true" />
          {state.offline
            ? `离线镜像 ${formatMirrorTime(state.lastTrustedSnapshotAt)}`
            : "本地 Fixture · 可重复验收"}
        </span>
        <span>
          <History24Regular aria-hidden="true" />
          {state.audit.length} 条追加式事件
        </span>
      </footer>
    </div>
  );
}

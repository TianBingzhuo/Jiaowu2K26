import { useEffect, useMemo, useState } from "react";
import {
  Accessibility24Regular,
  ArrowLeft24Regular,
  ArrowRight24Regular,
  CardUi24Regular,
  CheckmarkCircle24Filled,
  Clock24Regular,
  CloudOff24Regular,
  DocumentBulletList24Regular,
  ErrorCircle24Regular,
  History24Regular,
  Info24Regular,
  Key24Regular,
  LockClosed24Regular,
  PersonPasskey24Regular,
  QrCode24Regular,
  Scan24Regular,
  ShieldCheckmark24Regular,
  ShieldError24Regular,
  ShieldKeyhole24Regular,
  Wallet24Regular,
  Warning24Regular,
} from "@fluentui/react-icons";
import {
  campusPassBoxScore,
  checkOffline,
  chooseManualFallback,
  correctAccessLog,
  createCampusPassState,
  createGuestDraft,
  createLossCase,
  presentCredential,
  requestAccess,
  selectedCredential,
  selectCredential,
  setCampusPassPreferences,
  setCampusPassStage,
  setCarrier,
  sourceFor,
  updateRequestMirror,
  zoneLabel,
} from "./engine";
import {
  clearCampusPassState,
  loadCampusPassState,
  saveCampusPassState,
} from "./storage";
import type {
  AccessRequestStatus,
  CampusPassStage,
  CampusPassState,
  PassCarrier,
} from "./types";
import { useI18n } from "../../i18n/I18nProvider";
import "./campuspass.css";

type CampusPassStudioProps = {
  backendLabel: string;
  onExit: () => void;
};

const STAGES: Array<{
  id: CampusPassStage;
  label: string;
  traditional: string;
  eyebrow: string;
  icon: typeof Wallet24Regular;
}> = [
  {
    id: "wallet",
    label: "Pass Wallet",
    traditional: "我的凭证",
    eyebrow: "LOADOUT",
    icon: Wallet24Regular,
  },
  {
    id: "reader",
    label: "Reader Drill",
    traditional: "凭证校验",
    eyebrow: "SIMULATE",
    icon: Scan24Regular,
  },
  {
    id: "requests",
    label: "Access Queue",
    traditional: "权限申请",
    eyebrow: "REQUEST",
    icon: ShieldKeyhole24Regular,
  },
  {
    id: "support",
    label: "Safety Desk",
    traditional: "服务与纠错",
    eyebrow: "RECOVER",
    icon: Accessibility24Regular,
  },
  {
    id: "replay",
    label: "Pass Replay",
    traditional: "记录回放",
    eyebrow: "REVIEW",
    icon: History24Regular,
  },
];

const CARRIER_LABEL: Record<PassCarrier, string> = {
  physical_card: "实体卡",
  nfc: "NFC",
  dynamic_qr: "动态二维码",
  mobile: "移动凭证",
};

const STATE_LABEL: Record<string, string> = {
  active: "有效",
  pending: "待审批",
  expired: "已过期",
  fulfilled: "已满足",
  missing: "缺失",
  unknown: "待核实",
  submitted: "已提交",
  reviewing: "审核中",
  approved: "已批准镜像",
  externally_executed: "外部已执行镜像",
  denied: "已拒绝",
  fault: "故障",
  appeal: "申诉中",
  draft_blocked_prerequisites: "前置条件阻塞",
  draft_blocked_credential: "凭证状态阻塞",
};

const SectionHeading = ({
  eyebrow,
  title,
  detail,
}: {
  eyebrow: string;
  title: string;
  detail: string;
}) => (
  <header className="pass-section-heading">
    <span>{eyebrow}</span>
    <h2>{title}</h2>
    <p>{detail}</p>
  </header>
);

export function CampusPassStudio({
  backendLabel,
  onExit,
}: CampusPassStudioProps) {
  const { formatDate } = useI18n();
  const formatFixtureTime = (value: string) =>
    formatDate(value, {
      month: "numeric",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  const [state, setState] = useState<CampusPassState>(() =>
    loadCampusPassState(),
  );
  const [toast, setToast] = useState("");
  const [staticCapture, setStaticCapture] = useState(false);
  const [requestZone, setRequestZone] = useState("zone-library");
  const [requestPurpose, setRequestPurpose] = useState("完成晚间课程复习");
  const [guestZone, setGuestZone] = useState("zone-library");
  const [guestPurpose, setGuestPurpose] = useState("参加公开讲座");
  const [guestSponsor, setGuestSponsor] = useState("NAN Fixture");
  const [guestHours, setGuestHours] = useState(2);
  const [offlineZone, setOfflineZone] = useState("zone-library");
  const [offlineCarrier, setOfflineCarrier] =
    useState<PassCarrier>("physical_card");
  const [correctionRecord, setCorrectionRecord] =
    useState("access-record-001");
  const [correctionReason, setCorrectionReason] = useState(
    "本人当时没有进入该区域，请核对读卡器记录。",
  );
  const [fallbackReason, setFallbackReason] =
    useState("手机没电，需要人工核验");

  const credential = useMemo(() => selectedCredential(state), [state]);
  const boxScore = useMemo(() => campusPassBoxScore(state), [state]);
  const latestPresentation = state.presentations.at(-1);
  const latestOfflineCheck = state.offline_checks.at(-1);
  const stageIndex = STAGES.findIndex((item) => item.id === state.stage);

  useEffect(() => {
    saveCampusPassState(state);
  }, [state]);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [state.stage]);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(""), 3200);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const apply = (
    action: (current: CampusPassState) => CampusPassState,
    message: string,
  ) => {
    try {
      setState((current) => action(current));
      setToast(message);
    } catch (error) {
      setToast(error instanceof Error ? error.message : "操作未完成。");
    }
  };

  const reset = () => {
    clearCampusPassState();
    setState(createCampusPassState());
    setStaticCapture(false);
    setToast("F-010 Fixture Session 已重置。");
  };

  const renderWallet = () => (
    <div className="pass-wallet-layout">
      <section className="pass-card pass-wallet-hero">
        <div className="pass-wallet-hero__copy">
          <span>F010-01 · IDENTITY LINK</span>
          <h1>
            CAMPUS
            <br />
            <em>LOADOUT</em>
          </h1>
          <p>
            {state.fixture.identities[0]?.subject_label} ·{" "}
            {state.fixture.identities[0]?.status}
          </p>
          <strong>
            密码存储 0 · 正式凭证签发 0 · 精细轨迹 0
          </strong>
        </div>
        <div className="pass-wallet-hero__next">
          <span>NEXT MOVE</span>
          <strong>选择一张凭证，进入 Reader Drill</strong>
          <button
            type="button"
            onClick={() => setState(setCampusPassStage(state, "reader"))}
            data-focusable="true"
          >
            进入本地校验演练
            <ArrowRight24Regular aria-hidden="true" />
          </button>
        </div>
      </section>

      <section className="pass-wallet-section">
        <SectionHeading
          eyebrow="F010-02 / 03 / 04 · PASS WALLET"
          title="每张卡都说明“谁签发、能去哪、何时失效”"
          detail="这里选择的是本地 Fixture Loadout，不会激活校园卡、生成真实二维码或扩大权限。"
        />
        <div className="pass-credential-grid">
          {state.fixture.credentials.map((item, index) => {
            const active = state.selected_credential_id === item.id;
            return (
              <button
                key={item.id}
                type="button"
                className={[
                  "pass-credential",
                  `is-${item.state}`,
                  active ? "is-selected" : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                onClick={() =>
                  apply(
                    (current) => selectCredential(current, item.id),
                    `${item.title} 已装备到演示槽位。`,
                  )
                }
                aria-pressed={active}
                data-focusable="true"
              >
                <span className="pass-credential__index">
                  LOADOUT {String(index + 1).padStart(2, "0")}
                </span>
                <CardUi24Regular aria-hidden="true" />
                <strong>{item.title}</strong>
                <em>{STATE_LABEL[item.state] ?? item.state}</em>
                <small>{item.issuer}</small>
                <div>
                  <span>{item.scope_zone_ids.length} 区域</span>
                  <span>{item.supported_carriers.length} 载体</span>
                  <span>最小权限</span>
                </div>
                <p>{item.purpose}</p>
                <footer>
                  <span>至 {item.expires_at.slice(0, 10)}</span>
                  {active && (
                    <CheckmarkCircle24Filled aria-label="当前已选择" />
                  )}
                </footer>
              </button>
            );
          })}
        </div>
      </section>

      <section className="pass-card pass-scope-board">
        <SectionHeading
          eyebrow="ZONE MAP · EXPLAINABLE SCOPE"
          title={`${credential.title} 的最小范围`}
          detail="区域与时段来自带版本的 Fixture 来源；敏感区域不会被一张普通卡静默解锁。"
        />
        <div className="pass-zone-grid">
          {state.fixture.zones.map((zone) => {
            const inScope = credential.scope_zone_ids.includes(zone.id);
            return (
              <article
                key={zone.id}
                className={inScope ? "is-in-scope" : "is-out-of-scope"}
              >
                {inScope ? (
                  <ShieldCheckmark24Regular aria-hidden="true" />
                ) : (
                  <LockClosed24Regular aria-hidden="true" />
                )}
                <div>
                  <strong>{zone.label}</strong>
                  <span>{zone.time_window}</span>
                  <small>
                    {zone.requires_extra_approval
                      ? "需要额外审批"
                      : "标准区域"}
                  </small>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section className="pass-card pass-source-board">
        <SectionHeading
          eyebrow="SOURCE LOCKER"
          title="来源、版本和纠错始终跟着凭证走"
          detail="点击不跳出 Demo；这里先展示证据身份，正式环境再接学校入口。"
        />
        <div>
          {credential.source_ids.map((sourceId) => {
            const source = sourceFor(state, sourceId);
            return (
              <article key={source.id}>
                <Info24Regular aria-hidden="true" />
                <span>
                  <strong>{source.provider}</strong>
                  <small>
                    {source.version} ·{" "}
                    {formatFixtureTime(source.updated_at)}
                  </small>
                </span>
                <em>{source.verification_status}</em>
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );

  const renderReader = () => (
    <div className="pass-reader-layout">
      <section className="pass-card pass-reader-hero">
        <SectionHeading
          eyebrow="F010-03 · FIXTURE READER"
          title="先证明“不会误放行”，再谈顺滑通行"
          detail="演练只返回本地读卡结果，official_access_granted 永远为 false。"
        />
        <div className="pass-reader-terminal">
          <div className="pass-reader-terminal__device">
            <Scan24Regular aria-hidden="true" />
            <span>LOCAL READER 01</span>
            <strong>{credential.title}</strong>
            <small>{STATE_LABEL[credential.state]}</small>
          </div>
          <div className="pass-reader-terminal__controls">
            <span>选择载体</span>
            <div className="pass-carrier-switch">
              {credential.supported_carriers.map((carrier) => (
                <button
                  key={carrier}
                  type="button"
                  className={
                    state.selected_carrier === carrier ? "is-active" : ""
                  }
                  onClick={() =>
                    apply(
                      (current) => setCarrier(current, carrier),
                      `已选择${CARRIER_LABEL[carrier]}。`,
                    )
                  }
                  aria-pressed={state.selected_carrier === carrier}
                  data-focusable="true"
                >
                  {carrier === "dynamic_qr" ? (
                    <QrCode24Regular aria-hidden="true" />
                  ) : (
                    <Key24Regular aria-hidden="true" />
                  )}
                  {CARRIER_LABEL[carrier]}
                </button>
              ))}
            </div>
            {state.selected_carrier === "dynamic_qr" && (
              <label className="pass-toggle-row">
                <input
                  type="checkbox"
                  checked={staticCapture}
                  onChange={(event) =>
                    setStaticCapture(event.target.checked)
                  }
                />
                模拟上传静态截图（应被拒绝）
              </label>
            )}
            <button
              className="pass-primary-action"
              type="button"
              onClick={() =>
                apply(
                  (current) =>
                    presentCredential(current, staticCapture),
                  "Reader Drill 已完成并自动写入 Replay。",
                )
              }
              data-focusable="true"
            >
              <Scan24Regular aria-hidden="true" />
              运行本地 Reader Drill
              <ArrowRight24Regular aria-hidden="true" />
            </button>
          </div>
        </div>
      </section>

      <section
        className={[
          "pass-card",
          "pass-reader-result",
          latestPresentation
            ? latestPresentation.accepted_by_demo_reader
              ? "is-accepted"
              : "is-rejected"
            : "",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        <SectionHeading
          eyebrow="READER FEEDBACK"
          title={
            latestPresentation
              ? latestPresentation.accepted_by_demo_reader
                ? "Fixture Reader：演练通过"
                : "Fixture Reader：已拒绝"
              : "等待一次校验演练"
          }
          detail={
            latestPresentation?.reason ??
            "选择载体并运行，反馈会在同一回合立即出现并自动保存。"
          }
        />
        <div className="pass-result-score">
          <article>
            <strong>
              {latestPresentation?.accepted_by_demo_reader ? "YES" : "—"}
            </strong>
            <span>本地规则</span>
          </article>
          <article>
            <strong>NO</strong>
            <span>正式放行</span>
          </article>
          <article>
            <strong>0</strong>
            <span>门锁指令</span>
          </article>
        </div>
      </section>

      <section className="pass-card pass-offline-lab">
        <SectionHeading
          eyebrow="F010-10 · OFFLINE FRESHNESS"
          title="断网不是全区域万能通行证"
          detail={`Fixture 新鲜度至 ${formatFixtureTime(state.fixture.offline_policy.valid_until)}；实验室明确禁止离线放行。`}
        />
        <div className="pass-form-grid">
          <label>
            区域
            <select
              value={offlineZone}
              onChange={(event) => setOfflineZone(event.target.value)}
            >
              {state.fixture.zones.map((zone) => (
                <option key={zone.id} value={zone.id}>
                  {zone.label}
                </option>
              ))}
            </select>
          </label>
          <label>
            离线载体
            <select
              value={offlineCarrier}
              onChange={(event) =>
                setOfflineCarrier(event.target.value as PassCarrier)
              }
            >
              {state.fixture.offline_policy.accepted_carriers.map(
                (carrier) => (
                  <option key={carrier} value={carrier}>
                    {CARRIER_LABEL[carrier]}
                  </option>
                ),
              )}
            </select>
          </label>
          <button
            type="button"
            onClick={() =>
              apply(
                (current) =>
                  checkOffline(current, offlineZone, offlineCarrier),
                "离线边界检查已写入 Replay。",
              )
            }
            data-focusable="true"
          >
            <CloudOff24Regular aria-hidden="true" />
            运行离线边界检查
          </button>
        </div>
        {latestOfflineCheck && (
          <div
            className={`pass-inline-result ${
              latestOfflineCheck.valid ? "is-valid" : "is-blocked"
            }`}
          >
            {latestOfflineCheck.valid ? (
              <ShieldCheckmark24Regular aria-hidden="true" />
            ) : (
              <ShieldError24Regular aria-hidden="true" />
            )}
            <span>
              <strong>
                {latestOfflineCheck.valid
                  ? "范围与期限演练通过"
                  : "离线演练已阻塞"}
              </strong>
              <small>{latestOfflineCheck.reason}</small>
            </span>
          </div>
        )}
      </section>
    </div>
  );

  const renderRequests = () => (
    <div className="pass-request-layout">
      <section className="pass-card pass-request-hero">
        <SectionHeading
          eyebrow="F010-05 / 07 / 08 · ACCESS QUEUE"
          title="申请可以顺滑，但缺口不能被藏起来"
          detail="课程、培训与预约只能产生可解释建议；批准和真实执行仍属于学校权威系统。"
        />
        <div className="pass-form-grid">
          <label>
            目标区域
            <select
              value={requestZone}
              onChange={(event) => setRequestZone(event.target.value)}
            >
              {state.fixture.zones.map((zone) => (
                <option key={zone.id} value={zone.id}>
                  {zone.label}
                  {zone.requires_extra_approval ? " · 受控" : ""}
                </option>
              ))}
            </select>
          </label>
          <label className="is-wide">
            可复核用途
            <input
              value={requestPurpose}
              onChange={(event) => setRequestPurpose(event.target.value)}
            />
          </label>
          <button
            className="pass-primary-action"
            type="button"
            onClick={() =>
              apply(
                (current) =>
                  requestAccess(current, requestZone, requestPurpose),
                "申请镜像已生成；结果已自动保存。",
              )
            }
            data-focusable="true"
          >
            <ShieldKeyhole24Regular aria-hidden="true" />
            生成权限申请镜像
          </button>
        </div>
      </section>

      <section className="pass-card pass-prerequisite-panel">
        <SectionHeading
          eyebrow="PREREQUISITE LOADOUT"
          title="Robotics Lab A 前置条件"
          detail="不满足时直接告诉学生去哪办，不用猜一个神秘的“资格不足”。"
        />
        <div className="pass-prerequisite-list">
          {state.fixture.prerequisites.map((item) => (
            <article key={item.id} className={`is-${item.status}`}>
              {item.status === "fulfilled" ? (
                <CheckmarkCircle24Filled aria-hidden="true" />
              ) : (
                <Warning24Regular aria-hidden="true" />
              )}
              <span>
                <strong>{item.label}</strong>
                <small>{STATE_LABEL[item.status]}</small>
              </span>
              <em>正式入口 Fixture</em>
            </article>
          ))}
        </div>
      </section>

      <section className="pass-card pass-queue-panel">
        <SectionHeading
          eyebrow="AUTHORITY MIRROR"
          title={`申请队列 · ${state.access_requests.length}`}
          detail="状态可回放、可申诉；Demo 只模拟镜像变化，不执行审批和门禁。"
        />
        {state.access_requests.length === 0 ? (
          <div className="pass-empty-state">
            <DocumentBulletList24Regular aria-hidden="true" />
            <span>
              <strong>队列为空</strong>
              <small>从上方创建一条普通区域或受控实验室申请。</small>
            </span>
          </div>
        ) : (
          <div className="pass-request-list">
            {state.access_requests
              .slice()
              .reverse()
              .map((item) => (
                <article key={item.id}>
                  <header>
                    <span>{item.id}</span>
                    <em className={`is-${item.status}`}>
                      {STATE_LABEL[item.status] ?? item.status}
                    </em>
                  </header>
                  <strong>{zoneLabel(state, item.zone_id)}</strong>
                  <p>{item.purpose}</p>
                  {item.missing_prerequisite_ids.length > 0 && (
                    <ul>
                      {item.missing_prerequisite_ids.map((id) => (
                        <li key={id}>{id}</li>
                      ))}
                    </ul>
                  )}
                  <footer>
                    <small>authoritative=false · access=false</small>
                    {!item.status.startsWith("draft_blocked") && (
                      <select
                        aria-label={`${item.id} Fixture 状态`}
                        value={item.status}
                        onChange={(event) =>
                          apply(
                            (current) =>
                              updateRequestMirror(
                                current,
                                item.id,
                                event.target.value as AccessRequestStatus,
                              ),
                            "权威状态镜像已更新；没有执行门禁动作。",
                          )
                        }
                        data-focusable="true"
                      >
                        {[
                          "submitted",
                          "reviewing",
                          "approved",
                          "externally_executed",
                          "denied",
                          "fault",
                          "appeal",
                        ].map((status) => (
                          <option key={status} value={status}>
                            {STATE_LABEL[status]}
                          </option>
                        ))}
                      </select>
                    )}
                  </footer>
                </article>
              ))}
          </div>
        )}
      </section>

      <section className="pass-card pass-guest-panel">
        <SectionHeading
          eyebrow="F010-06 · GUEST DRAFT"
          title="访客通行先绑定目的、担保人与自动到期"
          detail="这里只生成草稿，不签发二维码或实体证件。"
        />
        <div className="pass-form-grid">
          <label>
            允许区域
            <select
              value={guestZone}
              onChange={(event) => setGuestZone(event.target.value)}
            >
              {state.fixture.zones
                .filter((zone) =>
                  state.fixture.guest_policy.allowed_zone_ids.includes(
                    zone.id,
                  ),
                )
                .map((zone) => (
                  <option key={zone.id} value={zone.id}>
                    {zone.label}
                  </option>
                ))}
            </select>
          </label>
          <label>
            担保人
            <input
              value={guestSponsor}
              onChange={(event) => setGuestSponsor(event.target.value)}
            />
          </label>
          <label>
            时长（1–{state.fixture.guest_policy.maximum_hours} 小时）
            <input
              type="number"
              min={1}
              max={state.fixture.guest_policy.maximum_hours}
              value={guestHours}
              onChange={(event) => setGuestHours(Number(event.target.value))}
            />
          </label>
          <label className="is-wide">
            用途
            <input
              value={guestPurpose}
              onChange={(event) => setGuestPurpose(event.target.value)}
            />
          </label>
          <button
            type="button"
            onClick={() =>
              apply(
                (current) =>
                  createGuestDraft(
                    current,
                    guestZone,
                    guestPurpose,
                    guestSponsor,
                    guestHours,
                  ),
                "访客草稿已生成；未签发任何凭证。",
              )
            }
            data-focusable="true"
          >
            <PersonPasskey24Regular aria-hidden="true" />
            生成自动到期草稿
          </button>
        </div>
        {state.guest_pass_drafts.at(-1) && (
          <div className="pass-inline-result is-valid">
            <Clock24Regular aria-hidden="true" />
            <span>
              <strong>
                {state.guest_pass_drafts.at(-1)?.duration_hours} 小时草稿已就绪
              </strong>
              <small>auto_expires=true · authoritative=false</small>
            </span>
          </div>
        )}
      </section>
    </div>
  );

  const renderSupport = () => (
    <div className="pass-support-layout">
      <section className="pass-card pass-support-hero">
        <SectionHeading
          eyebrow="F010-09 / 13 / 14 · SAFETY DESK"
          title="丢卡、没电、残障陪同与应急，不该被一个 App 卡死"
          detail="恢复路径始终保留真人入口；应急执行权不会交给游戏化体验层。"
        />
        <div className="pass-emergency-strip">
          <ShieldCheckmark24Regular aria-hidden="true" />
          <span>
            <strong>
              {state.fixture.emergency_modes[0]?.title} ·{" "}
              {state.fixture.emergency_modes[0]?.status}
            </strong>
            <small>
              权威方：{state.fixture.emergency_modes[0]?.authority} ·
              Experience execute=false
            </small>
          </span>
        </div>
      </section>

      <section className="pass-card pass-loss-panel">
        <SectionHeading
          eyebrow="LOST / FREEZE / RESTORE"
          title="先准备正式交接，再由权威系统确认"
          detail={`${credential.title} · 当前状态 ${STATE_LABEL[credential.state]}`}
        />
        <div className="pass-action-row">
          {(
            [
              ["report_lost", "报告遗失"],
              ["freeze", "请求冻结"],
              ["restore", "请求恢复"],
            ] as const
          ).map(([action, label]) => (
            <button
              key={action}
              type="button"
              onClick={() =>
                apply(
                  (current) => createLossCase(current, action),
                  `${label}交接包已准备；凭证状态未被本页改写。`,
                )
              }
              data-focusable="true"
            >
              <ShieldError24Regular aria-hidden="true" />
              {label}
            </button>
          ))}
        </div>
        {state.loss_cases.at(-1) && (
          <div className="pass-inline-result is-blocked">
            <Warning24Regular aria-hidden="true" />
            <span>
              <strong>等待正式渠道确认</strong>
              <small>
                experience_executed_action=false ·{" "}
                {state.loss_cases.at(-1)?.status}
              </small>
            </span>
          </div>
        )}
      </section>

      <section className="pass-card pass-fallback-panel">
        <SectionHeading
          eyebrow="NO-PHONE FALLBACK"
          title="手机不是通行权的唯一容器"
          detail="选择人工路径只生成可解释交接，不会直接开门。"
        />
        <label>
          简要原因
          <input
            value={fallbackReason}
            onChange={(event) => setFallbackReason(event.target.value)}
          />
        </label>
        <div className="pass-fallback-list">
          {state.fixture.manual_fallbacks.map((fallback) => (
            <article key={fallback.id}>
              <Accessibility24Regular aria-hidden="true" />
              <span>
                <strong>{fallback.label}</strong>
                <small>
                  {fallback.channel} · requires_phone=false
                </small>
              </span>
              <ul>
                {fallback.conditions.map((condition) => (
                  <li key={condition}>{condition}</li>
                ))}
              </ul>
              <button
                type="button"
                onClick={() =>
                  apply(
                    (current) =>
                      chooseManualFallback(
                        current,
                        fallback.id,
                        fallbackReason,
                      ),
                    "无手机人工交接已准备；没有执行通行。",
                  )
                }
                data-focusable="true"
              >
                准备人工交接
              </button>
            </article>
          ))}
        </div>
      </section>

      <section className="pass-card pass-record-panel">
        <SectionHeading
          eyebrow="F010-11 / 12 · SELF RECORD"
          title="只看与本人有关的必要记录，并且可以申诉"
          detail="没有精细位置轨迹，也不会把通行次数喂给推荐或排名。"
        />
        <div className="pass-record-list">
          {state.fixture.self_access_records.map((record) => (
            <article key={record.id}>
              {record.result === "source_reported_allowed" ? (
                <ShieldCheckmark24Regular aria-hidden="true" />
              ) : (
                <ShieldError24Regular aria-hidden="true" />
              )}
              <span>
                <strong>{zoneLabel(state, record.zone_id)}</strong>
                <small>
                  {formatFixtureTime(record.occurred_at)} ·{" "}
                  {record.result}
                </small>
              </span>
              <em>保留至 {record.retained_until.slice(0, 10)}</em>
            </article>
          ))}
        </div>
        <div className="pass-correction-form">
          <label>
            记录
            <select
              value={correctionRecord}
              onChange={(event) => setCorrectionRecord(event.target.value)}
            >
              {state.fixture.self_access_records.map((record) => (
                <option key={record.id} value={record.id}>
                  {record.id} · {zoneLabel(state, record.zone_id)}
                </option>
              ))}
            </select>
          </label>
          <label>
            可复核说明
            <textarea
              rows={3}
              value={correctionReason}
              onChange={(event) => setCorrectionReason(event.target.value)}
            />
          </label>
          <button
            type="button"
            onClick={() =>
              apply(
                (current) =>
                  correctAccessLog(
                    current,
                    correctionRecord,
                    correctionReason,
                  ),
                "纠错工单已追加；原来源记录没有被静默覆盖。",
              )
            }
            data-focusable="true"
          >
            <DocumentBulletList24Regular aria-hidden="true" />
            提交追加式纠错
          </button>
        </div>
      </section>
    </div>
  );

  const renderReplay = () => (
    <div className="pass-replay-layout">
      <section className="pass-card pass-scoreboard">
        <SectionHeading
          eyebrow="F010 · PASS BOX SCORE"
          title="能回放过程，但不能伪造权力"
          detail="最重要的成绩不是“开了几扇门”，而是高风险边界始终没有被体验层越过。"
        />
        <div className="pass-score-grid">
          <article>
            <strong>{boxScore.wallet_credentials}</strong>
            <span>Wallet</span>
          </article>
          <article>
            <strong>{state.presentations.length}</strong>
            <span>Reader Drills</span>
          </article>
          <article>
            <strong>{boxScore.pending_requests}</strong>
            <span>Queue</span>
          </article>
          <article className="is-zero">
            <strong>{boxScore.official_credentials_issued}</strong>
            <span>正式签发</span>
          </article>
          <article className="is-zero">
            <strong>{boxScore.official_access_actions_executed}</strong>
            <span>正式门禁动作</span>
          </article>
          <article className="is-zero">
            <strong>{boxScore.precise_tracking_events}</strong>
            <span>精细追踪</span>
          </article>
        </div>
      </section>

      <section className="pass-card pass-invariant-panel">
        <SectionHeading
          eyebrow="SAFETY INVARIANTS · 9 / 9"
          title="这九条不是彩蛋，是模块存在的前提"
          detail="任何一次技术调整破坏其中一条，F-010 都必须停止发布。"
        />
        <div className="pass-invariant-grid">
          {[
            "不签发正式凭证",
            "不保存原系统密码",
            "不保存门禁密钥",
            "静态截图不等于动态凭证",
            "默认最小权限",
            "状态只是权威镜像",
            "不建立精细移动画像",
            "应急执行留在正式系统",
            "手机不是唯一回退",
          ].map((label) => (
            <article key={label}>
              <CheckmarkCircle24Filled aria-hidden="true" />
              <span>{label}</span>
            </article>
          ))}
        </div>
      </section>

      <section className="pass-card pass-ledger-panel">
        <SectionHeading
          eyebrow="APPEND-ONLY REPLAY"
          title={`事件时间线 · ${state.audit.length}`}
          detail="每一步自动保存并串联前序哈希；重置只清理本机 Fixture Session。"
        />
        <ol>
          {state.audit
            .slice()
            .reverse()
            .map((event) => (
              <li key={event.id}>
                <span>{String(event.sequence).padStart(2, "0")}</span>
                <div>
                  <strong>{event.action}</strong>
                  <p>{event.detail}</p>
                  <small>
                    {event.target_id} · {event.event_hash}
                  </small>
                </div>
              </li>
            ))}
        </ol>
      </section>
    </div>
  );

  const stageContent = {
    wallet: renderWallet,
    reader: renderReader,
    requests: renderRequests,
    support: renderSupport,
    replay: renderReplay,
  }[state.stage]();

  return (
    <div
      className={[
        "pass-shell",
        state.traditional ? "is-traditional" : "",
        state.reduced_motion ? "is-reduced-motion" : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <a className="skip-link" href="#pass-main">
        跳到 Campus Pass 内容
      </a>
      <div className="pass-scene" aria-hidden="true" />
      <header className="pass-topbar">
        <button
          className="pass-back"
          type="button"
          onClick={onExit}
          data-focusable="true"
        >
          <ArrowLeft24Regular aria-hidden="true" />
          返回 MyCareer
        </button>
        <div className="pass-brand">
          <strong>
            UNIVERSITY<span>2K26</span>
          </strong>
          <small>CAMPUS PASS // F-010</small>
        </div>
        <div className="pass-topbar__actions">
          <span>
            <ShieldCheckmark24Regular aria-hidden="true" />
            {backendLabel}
          </span>
          <button
            type="button"
            onClick={() =>
              setState(
                setCampusPassPreferences(state, {
                  traditional: !state.traditional,
                }),
              )
            }
            data-focusable="true"
          >
            {state.traditional ? "游戏叙事" : "传统叙事"}
          </button>
          <button
            type="button"
            onClick={() =>
              setState(
                setCampusPassPreferences(state, {
                  reduced_motion: !state.reduced_motion,
                }),
              )
            }
            data-focusable="true"
          >
            {state.reduced_motion ? "恢复动画" : "减少动画"}
          </button>
          <button type="button" onClick={reset} data-focusable="true">
            重置 F-010
          </button>
        </div>
      </header>

      <nav className="pass-stepbar" aria-label="Campus Pass 开放模块">
        {STAGES.map((stage, index) => {
          const Icon = stage.icon;
          const active = state.stage === stage.id;
          return (
            <button
              key={stage.id}
              type="button"
              className={active ? "is-active" : ""}
              aria-current={active ? "step" : undefined}
              onClick={() => setState(setCampusPassStage(state, stage.id))}
              data-focusable="true"
            >
              <span>{String(index + 1).padStart(2, "0")}</span>
              <Icon aria-hidden="true" />
              <strong>
                {state.traditional ? stage.traditional : stage.label}
              </strong>
              <small>{stage.eyebrow}</small>
            </button>
          );
        })}
      </nav>

      <div className="pass-boundary-banner">
        <LockClosed24Regular aria-hidden="true" />
        <span>
          SANITIZED FIXTURE · 全功能开放 · 不签发凭证、不连接门锁、不执行应急动作
        </span>
        <em>
          STAGE {stageIndex + 1} / {STAGES.length}
        </em>
      </div>

      <main id="pass-main" className="pass-main" tabIndex={-1}>
        {stageContent}
      </main>

      <footer className="pass-footer">
        <div>
          <ShieldCheckmark24Regular aria-hidden="true" />
          学校数据主权优先
        </div>
        <div>
          <LockClosed24Regular aria-hidden="true" />
          正式门禁动作 0
        </div>
        <div>
          <Key24Regular aria-hidden="true" />
          密钥存储 0
        </div>
        <div>
          <History24Regular aria-hidden="true" />
          Replay {state.audit.length}
        </div>
      </footer>

      {toast && (
        <div className="pass-toast" role="status" aria-live="polite">
          {toast.includes("不能") ||
          toast.includes("未") ||
          toast.includes("缺") ? (
            <ErrorCircle24Regular aria-hidden="true" />
          ) : (
            <Info24Regular aria-hidden="true" />
          )}
          {toast}
        </div>
      )}
    </div>
  );
}

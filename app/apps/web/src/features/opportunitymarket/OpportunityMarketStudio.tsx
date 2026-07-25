import { useEffect, useMemo, useState } from "react";
import {
  Accessibility24Regular,
  ArrowDownload24Regular,
  ArrowLeft24Regular,
  ArrowRight24Regular,
  ArrowSync24Regular,
  Briefcase24Regular,
  CalendarClock24Regular,
  CheckmarkCircle24Filled,
  CloudOff24Regular,
  CompassNorthwest24Regular,
  DataTrending24Regular,
  DocumentSearch24Regular,
  Eye24Regular,
  Filter24Regular,
  Flag24Regular,
  Gift24Regular,
  History24Regular,
  Info24Regular,
  LockClosed24Regular,
  Money24Regular,
  Open24Regular,
  PeopleTeam24Regular,
  Person24Regular,
  QuestionCircle24Regular,
  Save24Regular,
  Search24Regular,
  ShieldCheckmark24Regular,
  TargetArrow24Regular,
  Warning24Regular,
  WalletCreditCard24Regular,
} from "@fluentui/react-icons";
import {
  acknowledgeProviderInterest,
  addCapacityPlan,
  buildPortfolioExport,
  createDisclosureGrant,
  createOpportunityMarketState,
  expressInterest,
  markAppliedExternally,
  opportunityBoxScore,
  previewDisclosure,
  recordPortfolioExport,
  reportOpportunity,
  revokeDisclosureGrant,
  runEligibilityCheck,
  runFairnessAudit,
  runSelectiveMatch,
  saveOpportunity,
  selectOpportunity,
  selectPathway,
  setCategoryFilter,
  setMarketQuery,
  setMarketStage,
  setOpportunityPreferences,
  setScopeFilter,
  toggleActiveOnly,
  toggleOpportunityOffline,
  togglePortfolioArtifact,
  toggleProfileField,
  visibleOpportunities,
} from "./engine";
import {
  clearOpportunityState,
  loadOpportunityState,
  saveOpportunityState,
} from "./storage";
import type {
  EligibilityStatus,
  MatchResult,
  Opportunity,
  OpportunityCategory,
  OpportunityMarketState,
  OpportunityReport,
  OpportunityScope,
  OpportunityStage,
} from "./types";
import { SourceBoundCoach } from "../ai/SourceBoundCoach";
import "./opportunitymarket.css";

type OpportunityMarketStudioProps = {
  backendLabel: string;
  onExit: () => void;
};

const isLiveOpportunityUrl = (value: string) =>
  /^https:\/\//i.test(value) &&
  !value.includes("example.edu") &&
  !value.includes("example.invalid");

const STAGES: Array<{
  id: OpportunityStage;
  label: string;
  traditional: string;
  icon: typeof Briefcase24Regular;
}> = [
  {
    id: "market",
    label: "Market Board",
    traditional: "机会发现",
    icon: Search24Regular,
  },
  {
    id: "eligibility",
    label: "Eligibility Lens",
    traditional: "资格解释",
    icon: DocumentSearch24Regular,
  },
  {
    id: "match",
    label: "Match Room",
    traditional: "选择性匹配",
    icon: TargetArrow24Regular,
  },
  {
    id: "exchange",
    label: "Consent Exchange",
    traditional: "意向与授权",
    icon: PeopleTeam24Regular,
  },
  {
    id: "pathway",
    label: "Pathway Portal",
    traditional: "路径与作品",
    icon: CompassNorthwest24Regular,
  },
  {
    id: "replay",
    label: "Fairness Replay",
    traditional: "公平与回放",
    icon: History24Regular,
  },
];

const CATEGORY_LABEL: Record<OpportunityCategory, string> = {
  journal: "期刊",
  conference: "会议",
  competition: "竞赛",
  research: "科研",
  internship: "实习",
  scholarship: "资助",
  workshop: "工作坊",
  career_event: "职业活动",
  campus_event: "校内活动",
  campus_project: "校园项目",
};

const SCOPE_META: Record<
  OpportunityScope,
  { label: string; english: string; description: string }
> = {
  campus: {
    label: "校内机会",
    english: "BEAR DOWN LEAGUE",
    description:
      "UArizona Bear Down 活动、院系、实验室与本校组织的独立赛区；优先核验校内身份、时区、费用和审批链。",
  },
  external: {
    label: "校外机会",
    english: "OPEN LEAGUE",
    description: "由会议、赛事、基金会或雇主提供，单独核验差旅、费用、公开权利与外部规则。",
  },
};

const STATUS_LABEL = {
  active: "有效",
  expired: "已过期",
  under_review: "复核中",
  reported: "已报告",
} as const;

const ELIGIBILITY_LABEL: Record<EligibilityStatus, string> = {
  met: "已满足",
  possibly_met: "可能满足",
  not_met: "未满足",
  unknown: "未知",
};

const MATCH_LABEL: Record<MatchResult["fitBand"], string> = {
  ready_to_review: "可继续核对",
  needs_confirmation: "需要确认",
  gaps_present: "存在缺口",
  insufficient_data: "信息不足",
};

const REPORT_LABEL: Record<OpportunityReport["type"], string> = {
  expired: "已经过期",
  wrong_info: "信息错误",
  unfair: "规则不公平",
};

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

function isEventOpportunity(opportunity: Opportunity): boolean {
  return (
    opportunity.category === "campus_event" ||
    opportunity.category === "career_event"
  );
}

function formatOpportunityDate(opportunity: Opportunity): string {
  if (!opportunity.deadline) {
    return isEventOpportunity(opportunity)
      ? "持续开放 / 以官方页为准"
      : "无固定截止";
  }
  return opportunity.deadline.slice(0, 10);
}

function EligibilityBadge({ status }: { status: EligibilityStatus }) {
  const Icon =
    status === "met"
      ? CheckmarkCircle24Filled
      : status === "not_met"
        ? Warning24Regular
        : status === "unknown"
          ? QuestionCircle24Regular
          : Info24Regular;
  return (
    <span className={`opportunity-eligibility-badge is-${status}`}>
      <Icon aria-hidden="true" />
      {ELIGIBILITY_LABEL[status]}
    </span>
  );
}

function OpportunityCard({
  opportunity,
  onOpen,
  onSave,
  saved,
  disabled,
}: {
  opportunity: Opportunity;
  onOpen: () => void;
  onSave: () => void;
  saved: boolean;
  disabled: boolean;
}) {
  return (
    <article
      className={`opportunity-card is-${opportunity.status}`}
      aria-label={`${opportunity.title}，${STATUS_LABEL[opportunity.status]}`}
    >
      <header>
        <div>
          <span className={`is-scope-${opportunity.scope}`}>
            {SCOPE_META[opportunity.scope].label}
          </span>
          <span>{CATEGORY_LABEL[opportunity.category]}</span>
          <strong>{STATUS_LABEL[opportunity.status]}</strong>
        </div>
        <h3>{opportunity.title}</h3>
        <p>{opportunity.provider}</p>
      </header>
      <p className="opportunity-card__summary">{opportunity.summary}</p>
      <dl className="opportunity-card__facts">
        <div>
          <dt>资格</dt>
          <dd>{opportunity.eligibilitySummary}</dd>
        </div>
        <div>
          <dt>收益</dt>
          <dd>{opportunity.benefits.join(" · ")}</dd>
        </div>
        <div>
          <dt>义务</dt>
          <dd>{opportunity.obligations.join(" · ")}</dd>
        </div>
        <div>
          <dt>成本</dt>
          <dd>{opportunity.cost.description}</dd>
        </div>
        <div>
          <dt>风险</dt>
          <dd>{opportunity.risks.join(" · ")}</dd>
        </div>
      </dl>
      <footer>
        <span>
          <CalendarClock24Regular aria-hidden="true" />
          {formatOpportunityDate(opportunity)}
        </span>
        <span title={opportunity.sourceUrl}>
          <ShieldCheckmark24Regular aria-hidden="true" />
          {opportunity.sourceVersion}
        </span>
        <div>
          <button type="button" onClick={onOpen}>
            完整详情
            <ArrowRight24Regular aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={onSave}
            disabled={disabled || saved || opportunity.status !== "active"}
          >
            <Save24Regular aria-hidden="true" />
            {saved ? "已保存" : "保存"}
          </button>
        </div>
      </footer>
    </article>
  );
}

export function OpportunityMarketStudio({
  backendLabel,
  onExit,
}: OpportunityMarketStudioProps) {
  const [state, setState] = useState<OpportunityMarketState>(() => {
    try {
      const currentFixture = createOpportunityMarketState();
      return loadOpportunityState(currentFixture) ?? currentFixture;
    } catch {
      return createOpportunityMarketState();
    }
  });
  const [reportType, setReportType] =
    useState<OpportunityReport["type"]>("wrong_info");
  const [reportReason, setReportReason] = useState(
    "这条机会的时间或规则可能有变，请帮忙重新核对。",
  );
  const [capacityHours, setCapacityHours] = useState(4);
  const [grantDays, setGrantDays] = useState(7);
  const [externalConfirmed, setExternalConfirmed] = useState(false);

  useEffect(() => {
    saveOpportunityState(state);
  }, [state]);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [state.selectedStage]);

  const opportunities = useMemo(() => visibleOpportunities(state), [state]);
  const scopeCounts = useMemo(() => {
    const currentPool = state.opportunities.filter(
      (opportunity) =>
        !state.showActiveOnly || opportunity.status === "active",
    );
    return {
      all: currentPool.length,
      campus: currentPool.filter((item) => item.scope === "campus").length,
      external: currentPool.filter((item) => item.scope === "external").length,
    };
  }, [state.opportunities, state.showActiveOnly]);
  const opportunityGroups = useMemo(
    () =>
      (["campus", "external"] as const)
        .map((scope) => ({
          scope,
          opportunities: opportunities.filter(
            (opportunity) => opportunity.scope === scope,
          ),
        }))
        .filter(
          (group) =>
            group.opportunities.length > 0 &&
            (state.scopeFilter === "all" ||
              state.scopeFilter === group.scope),
        ),
    [opportunities, state.scopeFilter],
  );
  const selectedOpportunity =
    state.opportunities.find(
      (item) => item.id === state.selectedOpportunityId,
    ) ?? state.opportunities[0];
  const selectedRules = state.rules.filter(
    (rule) => rule.opportunityId === selectedOpportunity.id,
  );
  const currentCheck = state.eligibilityChecks.find(
    (check) => check.opportunityId === selectedOpportunity.id,
  );
  const saved = state.savedOpportunities.find(
    (item) => item.opportunityId === selectedOpportunity.id,
  );
  const mirror = state.applicationMirrors.find(
    (item) => item.opportunityId === selectedOpportunity.id,
  );
  const activeGrant = state.disclosureGrants
    .filter(
      (grant) =>
        grant.opportunityId === selectedOpportunity.id &&
        grant.revokedAt === null,
    )
    .at(-1);
  const latestFairness = state.fairnessAudits.at(-1);
  const currentStage =
    STAGES.find((stage) => stage.id === state.selectedStage) ?? STAGES[0];
  const selectedPathway = state.pathways.find(
    (pathway) => pathway.id === state.selectedPathwayId,
  );
  const disclosurePreview = previewDisclosure(
    state,
    selectedOpportunity.id,
  );
  const boxScore = opportunityBoxScore(state, selectedOpportunity.id);

  const commit = (
    action: (current: OpportunityMarketState) => OpportunityMarketState,
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
    clearOpportunityState();
    setState(createOpportunityMarketState());
    setReportType("wrong_info");
    setReportReason("这条机会的时间或规则可能有变，请帮忙重新核对。");
    setCapacityHours(4);
    setGrantDays(7);
    setExternalConfirmed(false);
  };

  const exportPortfolio = () => {
    try {
      const payload = buildPortfolioExport(state);
      downloadJson("university2k26-opportunity-portfolio-fixture.json", payload);
      commit(recordPortfolioExport);
    } catch (error) {
      setState((current) => ({
        ...current,
        message: error instanceof Error ? error.message : "作品导出失败。",
      }));
    }
  };

  const renderMarket = () => (
    <>
      <section className="opportunity-packs" aria-labelledby="pack-heading">
        <div className="opportunity-section-heading">
          <div>
            <span>TRANSPARENT PACKS</span>
            <h2 id="pack-heading">机会包不是抽卡包</h2>
          </div>
          <p>
            {state.packs.length} 个主题集合共 {state.opportunities.length} 项，内容完全可见；无概率、稀有度、付费解锁或假稀缺。
          </p>
        </div>
        <div className="opportunity-pack-grid">
          {state.packs.map((pack, index) => (
            <article key={pack.id}>
              <span>PACK {String(index + 1).padStart(2, "0")}</span>
              <h3>{pack.title}</h3>
              <p>{pack.description}</p>
              <strong>{pack.opportunityIds.length} 项全部公开</strong>
            </article>
          ))}
        </div>
      </section>

      <section className="opportunity-discovery" aria-labelledby="discovery-heading">
        <div className="opportunity-section-heading">
          <div>
            <span>DISCOVERY BOARD</span>
            <h2 id="discovery-heading">透明机会阵容</h2>
          </div>
          <p>
            当前显示 {opportunities.length} / {state.opportunities.length}；排序只按有效状态与时间节点。
          </p>
        </div>
        <div
          className="opportunity-scope-switch"
          role="group"
          aria-label="按机会来源范围切换"
        >
          <button
            type="button"
            aria-pressed={state.scopeFilter === "all"}
            onClick={() =>
              setState((current) => setScopeFilter(current, "all"))
            }
          >
            <span>全部阵容</span>
            <strong>{scopeCounts.all}</strong>
            <small>分区展示，不再混排</small>
          </button>
          {(Object.entries(SCOPE_META) as Array<
            [OpportunityScope, (typeof SCOPE_META)[OpportunityScope]]
          >).map(([scope, meta]) => (
            <button
              key={scope}
              type="button"
              className={`is-${scope}`}
              aria-pressed={state.scopeFilter === scope}
              onClick={() =>
                setState((current) => setScopeFilter(current, scope))
              }
            >
              <span>{meta.label}</span>
              <strong>{scopeCounts[scope]}</strong>
              <small>{meta.english}</small>
            </button>
          ))}
        </div>
        <div className="opportunity-filters">
          <label>
            <Search24Regular aria-hidden="true" />
            <span className="sr-only">搜索机会</span>
            <input
              type="search"
              value={state.query}
              onChange={(event) =>
                setState((current) =>
                  setMarketQuery(current, event.target.value),
                )
              }
              placeholder="搜索标题、提供方或收益"
            />
          </label>
          <label>
            <Filter24Regular aria-hidden="true" />
            <span className="sr-only">按类别筛选</span>
            <select
              value={state.categoryFilter}
              onChange={(event) =>
                setState((current) =>
                  setCategoryFilter(
                    current,
                    event.target.value as OpportunityCategory | "all",
                  ),
                )
              }
            >
              <option value="all">全部类别</option>
              {Object.entries(CATEGORY_LABEL).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          <button
            type="button"
            aria-pressed={state.showActiveOnly}
            onClick={() => commit(toggleActiveOnly)}
          >
            <Eye24Regular aria-hidden="true" />
            {state.showActiveOnly ? "仅有效机会" : "含过期与复核"}
          </button>
        </div>
        {opportunities.length === 0 ? (
          <div className="opportunity-empty" role="status">
            <Search24Regular aria-hidden="true" />
            <h3>没有符合当前筛选的机会</h3>
            <p>清空搜索或切换类别；系统不会随机塞入无关结果。</p>
            <button
              type="button"
              onClick={() =>
                setState((current) => ({
                  ...current,
                  query: "",
                  scopeFilter: "all",
                  categoryFilter: "all",
                  showActiveOnly: true,
                }))
              }
            >
              清空筛选
            </button>
          </div>
        ) : (
          <div className="opportunity-scope-groups">
            {opportunityGroups.map((group) => (
              <section
                key={group.scope}
                className={`opportunity-scope-group is-${group.scope}`}
                aria-labelledby={`opportunity-scope-${group.scope}`}
              >
                <header>
                  <div>
                    <span>{SCOPE_META[group.scope].english}</span>
                    <h3 id={`opportunity-scope-${group.scope}`}>
                      {SCOPE_META[group.scope].label}
                    </h3>
                  </div>
                  <p>{SCOPE_META[group.scope].description}</p>
                  <strong>{group.opportunities.length} 项</strong>
                </header>
                <div className="opportunity-card-grid">
                  {group.opportunities.map((opportunity) => (
                    <OpportunityCard
                      key={opportunity.id}
                      opportunity={opportunity}
                      saved={state.savedOpportunities.some(
                        (item) => item.opportunityId === opportunity.id,
                      )}
                      disabled={state.offline}
                      onOpen={() =>
                        commit((current) =>
                          selectOpportunity(current, opportunity.id),
                        )
                      }
                      onSave={() =>
                        commit((current) =>
                          saveOpportunity(current, opportunity.id),
                        )
                      }
                    />
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </section>
    </>
  );

  const renderEligibility = () => (
    <div className="opportunity-two-column">
      <section className="opportunity-detail-panel">
        <header>
          <span>
            {SCOPE_META[selectedOpportunity.scope].label} ·{" "}
            {CATEGORY_LABEL[selectedOpportunity.category]} ·{" "}
            {STATUS_LABEL[selectedOpportunity.status]}
          </span>
          <h2>{selectedOpportunity.title}</h2>
          <p>{selectedOpportunity.provider}</p>
        </header>
        <p className="opportunity-detail-panel__summary">
          {selectedOpportunity.summary}
        </p>
        {selectedOpportunity.rightsGate && (
          <section
            className="opportunity-rights-gate"
            aria-labelledby="opportunity-rights-heading"
          >
            <ShieldCheckmark24Regular aria-hidden="true" />
            <div>
              <span>RIGHTS GATE · 视觉使用不是参赛资格的自动附赠</span>
              <h3 id="opportunity-rights-heading">
                {selectedOpportunity.rightsGate.permissionStatus ===
                "confirmed_for_project"
                  ? "视觉许可已记录"
                  : selectedOpportunity.rightsGate.permissionStatus ===
                      "not_permitted"
                    ? "当前不允许复用"
                    : "等待官方许可证据"}
              </h3>
              <p>
                当前只确认公开 Playbook 可访问，不能据此推断赛事 Logo、商标或视觉资产可复用。
                在许可证据入库前，产品仅使用自有 University2K26 美术。
              </p>
              <ul>
                {selectedOpportunity.rightsGate.requiredActions.map((action) => (
                  <li key={action}>{action}</li>
                ))}
              </ul>
              <code>{selectedOpportunity.rightsGate.evidenceUrl}</code>
            </div>
          </section>
        )}
        <div className="opportunity-detail-grid">
          <article>
            <Gift24Regular aria-hidden="true" />
            <h3>收益</h3>
            <ul>
              {selectedOpportunity.benefits.map((benefit) => (
                <li key={benefit}>{benefit}</li>
              ))}
            </ul>
          </article>
          <article>
            <Briefcase24Regular aria-hidden="true" />
            <h3>义务</h3>
            <ul>
              {selectedOpportunity.obligations.map((obligation) => (
                <li key={obligation}>{obligation}</li>
              ))}
            </ul>
          </article>
          <article>
            <Money24Regular aria-hidden="true" />
            <h3>成本</h3>
            <p>{selectedOpportunity.cost.description}</p>
          </article>
          <article>
            <Warning24Regular aria-hidden="true" />
            <h3>风险</h3>
            <ul>
              {selectedOpportunity.risks.map((risk) => (
                <li key={risk}>{risk}</li>
              ))}
            </ul>
          </article>
        </div>
        <dl className="opportunity-source-ledger">
          <div>
            <dt>地点</dt>
            <dd>{selectedOpportunity.location}</dd>
          </div>
          <div>
            <dt>{isEventOpportunity(selectedOpportunity) ? "活动日期" : "截止"}</dt>
            <dd>{formatOpportunityDate(selectedOpportunity)}</dd>
          </div>
          <div>
            <dt>来源版本</dt>
            <dd>{selectedOpportunity.sourceVersion}</dd>
          </div>
          <div>
            <dt>核对时间</dt>
            <dd>{selectedOpportunity.verifiedAt ?? "尚未人工核对"}</dd>
          </div>
          <div>
            <dt>官方规则</dt>
            <dd title={selectedOpportunity.sourceUrl}>
              {isLiveOpportunityUrl(selectedOpportunity.sourceUrl) ? (
                <a
                  href={selectedOpportunity.sourceUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  打开官方规则
                  <Open24Regular aria-hidden="true" />
                </a>
              ) : (
                <>
                  {selectedOpportunity.sourceUrl}
                  <small>演示地址，不会打开外部网站</small>
                </>
              )}
            </dd>
          </div>
          <div>
            <dt>纠错渠道</dt>
            <dd>{selectedOpportunity.correctionRoute}</dd>
          </div>
        </dl>
      </section>

      <section className="opportunity-eligibility-panel">
        <header>
          <div>
            <span>FOUR-STATE LENS</span>
            <h2>逐条资格解释</h2>
          </div>
          <button
            type="button"
            disabled={state.offline || selectedOpportunity.status !== "active"}
            onClick={() => commit(runEligibilityCheck)}
          >
            <DataTrending24Regular aria-hidden="true" />
            {currentCheck ? "重新检查" : "检查我的资格"}
          </button>
        </header>
        <p className="opportunity-no-score">
          <ShieldCheckmark24Regular aria-hidden="true" />
          不生成“75% 资格”、录取概率或综合 OVR；每项规则独立解释。
        </p>
        <ol className="opportunity-rule-list">
          {selectedRules.map((rule) => {
            const result = currentCheck?.results.find(
              (item) => item.ruleId === rule.id,
            );
            return (
              <li key={rule.id}>
                <div>
                  {result ? (
                    <EligibilityBadge status={result.status} />
                  ) : (
                    <span className="opportunity-rule-pending">待检查</span>
                  )}
                  <strong>{rule.description}</strong>
                  <small>{rule.required ? "硬性规则" : "偏好 / 需确认"}</small>
                </div>
                <p>
                  {result?.evidenceLabel ??
                    "尚未读取任何 Profile 字段。"}
                </p>
                <p>
                  <b>下一步：</b>
                  {result?.nextStep ?? "运行检查后显示证据和下一步。"}
                </p>
                <span title={rule.sourceRef}>官方原文：{rule.sourceRef}</span>
              </li>
            );
          })}
        </ol>
        {currentCheck && (
          <div className="opportunity-check-summary" role="status">
            <strong>{currentCheck.summary}</strong>
            <span>
              本次使用 {currentCheck.usedProfileFieldIds.length} 个本人选择字段 ·
              无综合分
            </span>
          </div>
        )}
        <div className="opportunity-report-box">
          <Flag24Regular aria-hidden="true" />
          <div>
            <h3>报告过期、错误或不公平</h3>
            <p>报告会进入人工复核，并从当前匹配结果中移除受影响项。</p>
          </div>
          <select
            disabled={state.offline}
            value={reportType}
            onChange={(event) =>
              setReportType(event.target.value as OpportunityReport["type"])
            }
            aria-label="报告类型"
          >
            {Object.entries(REPORT_LABEL).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
          <input
            disabled={state.offline}
            value={reportReason}
            onChange={(event) => setReportReason(event.target.value)}
            aria-label="报告原因"
          />
          <button
            type="button"
            disabled={state.offline}
            onClick={() =>
              commit((current) =>
                reportOpportunity(
                  current,
                  selectedOpportunity.id,
                  reportType,
                  reportReason,
                ),
              )
            }
          >
            提交核对请求
          </button>
        </div>
      </section>
    </div>
  );

  const renderMatch = () => (
    <div className="opportunity-match-layout">
      <section className="opportunity-profile-panel">
        <header>
          <span>PRIVATE PROFILE</span>
          <h2>只选本次要用的资料</h2>
          <p>
            Profile 默认私密。选择用于本次本地匹配，不等于向任何提供方分享。
          </p>
        </header>
        <div className="opportunity-profile-fields">
          {state.profileFields.map((field) => {
            const checked = state.selectedProfileFieldIds.includes(field.id);
            return (
              <label key={field.id}>
                <input
                  type="checkbox"
                  disabled={state.offline}
                  checked={checked}
                  onChange={() =>
                    commit((current) =>
                      toggleProfileField(current, field.id),
                    )
                  }
                />
                <span>
                  <strong>{field.label}</strong>
                  <small>
                    {field.kind} · {field.valueLabel} · {field.authority}
                  </small>
                </span>
                <b>{checked ? "本次使用" : "保持私密"}</b>
              </label>
            );
          })}
        </div>
        <div className="opportunity-forbidden-fields">
          <LockClosed24Regular aria-hidden="true" />
          <div>
            <strong>永不进入匹配</strong>
            <p>{state.forbiddenProfileFieldIds.join(" · ")}</p>
          </div>
        </div>
        <button
          className="opportunity-primary-action"
          type="button"
          disabled={state.offline}
          onClick={() => commit(runSelectiveMatch)}
        >
          <TargetArrow24Regular aria-hidden="true" />
          用 {state.selectedProfileFieldIds.length} 个字段运行选择性匹配
        </button>
      </section>

      <section className="opportunity-results-panel">
        <header>
          <div>
            <span>EXPLAINABLE LINEUP</span>
            <h2>匹配阵容</h2>
          </div>
          <strong>{state.matchResults.length} 项</strong>
        </header>
        {state.matchResults.length === 0 ? (
          <div className="opportunity-empty opportunity-empty--compact">
            <TargetArrow24Regular aria-hidden="true" />
            <h3>尚未运行匹配</h3>
            <p>先选择本次可用资料；没有资料时系统不会猜测。</p>
          </div>
        ) : (
          <div className="opportunity-match-results">
            {state.matchResults.map((result) => {
              const opportunity = state.opportunities.find(
                (item) => item.id === result.opportunityId,
              );
              if (!opportunity) return null;
              return (
                <article key={result.opportunityId}>
                  <header>
                    <span className={`is-${result.fitBand}`}>
                      {MATCH_LABEL[result.fitBand]}
                    </span>
                    <h3>{opportunity.title}</h3>
                    <p>{opportunity.provider}</p>
                  </header>
                  <div>
                    <section>
                      <strong>为什么出现</strong>
                      <ul>
                        {(result.reasons.length
                          ? result.reasons
                          : ["没有足够的正向证据。"]
                        ).map((reason) => (
                          <li key={reason}>{reason}</li>
                        ))}
                      </ul>
                    </section>
                    <section>
                      <strong>冲突</strong>
                      <ul>
                        {(result.conflicts.length
                          ? result.conflicts
                          : ["没有已知硬冲突。"]
                        ).map((conflict) => (
                          <li key={conflict}>{conflict}</li>
                        ))}
                      </ul>
                    </section>
                    <section>
                      <strong>未知</strong>
                      <ul>
                        {(result.unknowns.length
                          ? result.unknowns
                          : ["没有必填未知项。"]
                        ).map((unknown) => (
                          <li key={unknown}>{unknown}</li>
                        ))}
                      </ul>
                    </section>
                  </div>
                  <footer>
                    <span>排序：资格四态 → 时间节点 · 付费影响 0</span>
                    <button
                      type="button"
                      onClick={() =>
                        commit((current) =>
                          selectOpportunity(
                            current,
                            opportunity.id,
                            "eligibility",
                          ),
                        )
                      }
                    >
                      查看详情
                    </button>
                    <button
                      type="button"
                      disabled={
                        state.offline ||
                        state.savedOpportunities.some(
                          (item) =>
                            item.opportunityId === opportunity.id,
                        )
                      }
                      onClick={() =>
                        commit((current) =>
                          saveOpportunity(current, opportunity.id),
                        )
                      }
                    >
                      保存
                    </button>
                  </footer>
                </article>
              );
            })}
          </div>
        )}
      </section>
      <div className="opportunity-match-coach">
        <SourceBoundCoach
          task="opportunity_brief"
          eyebrow="AI SCOUTING REPORT // OPT-IN"
          title="把匹配结果变成可验证的下一步"
          subject="Opportunity Market 匹配阵容"
          question="仅根据当前匹配结果，应该优先核验哪些资格、权利和未知项？"
          disabled={state.matchResults.length === 0 || state.offline}
          consentRequired
          boundary="不会发送原始 Profile 字段，只发送下方已生成的脱敏匹配解释；AI 不替本人报名、不付费、不授予素材权利。"
          facts={state.matchResults.slice(0, 3).map((result) => {
            const opportunity = state.opportunities.find(
              (item) => item.id === result.opportunityId,
            );
            return {
              label: opportunity?.title ?? result.opportunityId,
              value: `${opportunity ? SCOPE_META[opportunity.scope].label : "范围未知"}；匹配带 ${MATCH_LABEL[result.fitBand]}；理由 ${result.reasons.join("、") || "无"}；冲突 ${result.conflicts.join("、") || "无"}；未知 ${result.unknowns.join("、") || "无"}`,
              source_id: `opportunity-match:${result.opportunityId}`,
            };
          })}
        />
      </div>
    </div>
  );

  const renderExchange = () => (
    <>
      <section className="opportunity-exchange-hero">
        <div>
          <span>CONSENT EXCHANGE</span>
          <h2>{selectedOpportunity.title}</h2>
          <p>
            先收藏，再表达意向；双方都愿意继续时，才逐项分享资料并前往官方入口。
          </p>
        </div>
        <div className="opportunity-state-machine">
          {[
            ["discovered", "已发现"],
            ["saved", "已保存"],
            ["student_interested", "本人意向"],
            ["mutual_interest", "双向意向"],
            ["consented", "已授权"],
            ["applied_externally", "外部已申请"],
          ].map(([id, label], index) => {
            const statusIndex =
              mirror?.status === "applied_externally"
                ? 5
                : mirror?.status === "consented"
                  ? 4
                  : saved?.intentStatus === "mutual_interest"
                    ? 3
                    : saved?.intentStatus === "student_interested"
                      ? 2
                      : mirror?.status === "saved"
                        ? 1
                        : 0;
            return (
              <span key={id} className={index <= statusIndex ? "is-done" : ""}>
                <b>{String(index + 1).padStart(2, "0")}</b>
                {label}
              </span>
            );
          })}
        </div>
      </section>

      <div className="opportunity-exchange-grid">
        <section className="opportunity-consent-panel">
          <header>
            <PeopleTeam24Regular aria-hidden="true" />
            <div>
              <span>DOUBLE OPT-IN</span>
              <h2>双向意向与最小披露</h2>
            </div>
          </header>
          <div className="opportunity-action-stack">
            <button
              type="button"
              disabled={state.offline || Boolean(saved)}
              onClick={() =>
                commit((current) =>
                  saveOpportunity(current, selectedOpportunity.id),
                )
              }
            >
              <Save24Regular aria-hidden="true" />
              {saved ? "01 · 已保存" : "01 · 保存到本人清单"}
            </button>
            <button
              type="button"
              disabled={
                state.offline ||
                !saved ||
                saved.intentStatus !== "saved"
              }
              onClick={() =>
                commit((current) =>
                  expressInterest(current, selectedOpportunity.id),
                )
              }
            >
              <Person24Regular aria-hidden="true" />
              02 · 表达本人意向
            </button>
            <button
              type="button"
              disabled={
                state.offline ||
                saved?.intentStatus !== "student_interested"
              }
              onClick={() =>
                commit((current) =>
                  acknowledgeProviderInterest(
                    current,
                    selectedOpportunity.id,
                  ),
                )
              }
            >
              <PeopleTeam24Regular aria-hidden="true" />
              03 · 演示对方回应
            </button>
          </div>
          <div className="opportunity-disclosure-preview">
            <header>
              <Eye24Regular aria-hidden="true" />
              <div>
                <strong>对方将看到什么</strong>
                <span>{disclosurePreview.length} 个本人选择字段</span>
              </div>
            </header>
            <ul>
              {disclosurePreview.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <label>
              授权期限
              <input
                type="number"
                min={1}
                max={30}
                disabled={state.offline}
                value={grantDays}
                onChange={(event) => setGrantDays(Number(event.target.value))}
              />
              天
            </label>
            <button
              type="button"
              disabled={
                state.offline ||
                saved?.intentStatus !== "mutual_interest" ||
                Boolean(activeGrant)
              }
              onClick={() =>
                commit((current) =>
                  createDisclosureGrant(
                    current,
                    selectedOpportunity.id,
                    grantDays,
                  ),
                )
              }
            >
              <LockClosed24Regular aria-hidden="true" />
              04 · 确认最小披露
            </button>
            {activeGrant && (
              <div className="opportunity-active-grant">
                <strong>{activeGrant.recipient}</strong>
                <span>用途：{activeGrant.purpose}</span>
                <span>到期：{activeGrant.expiresAt}</span>
                <button
                  type="button"
                  disabled={state.offline}
                  onClick={() =>
                    commit((current) =>
                      revokeDisclosureGrant(current, activeGrant.id),
                    )
                  }
                >
                  撤回授权
                </button>
              </div>
            )}
          </div>
          <div className="opportunity-external-apply">
            <Open24Regular aria-hidden="true" />
            <div>
              <strong>正式申请留在权威外部系统</strong>
              {isLiveOpportunityUrl(
                selectedOpportunity.externalApplicationUrl,
              ) ? (
                <a
                  href={selectedOpportunity.externalApplicationUrl}
                  target="_blank"
                  rel="noreferrer"
                  title={selectedOpportunity.externalApplicationUrl}
                >
                  打开官方详情 / 申请入口
                  <Open24Regular aria-hidden="true" />
                </a>
              ) : (
                <p title={selectedOpportunity.externalApplicationUrl}>
                  这条演示机会还没有官方入口
                </p>
              )}
            </div>
            <label>
              <input
                type="checkbox"
                disabled={state.offline}
                checked={externalConfirmed}
                onChange={(event) => setExternalConfirmed(event.target.checked)}
              />
              我已亲自在外部系统完成申请
            </label>
            <button
              type="button"
              disabled={
                state.offline ||
                !externalConfirmed ||
                !mirror ||
                mirror.status === "applied_externally"
              }
              onClick={() =>
                commit((current) =>
                  markAppliedExternally(
                    current,
                    selectedOpportunity.id,
                    externalConfirmed,
                  ),
                )
              }
            >
              仅更新申请镜像
            </button>
          </div>
        </section>

        <section className="opportunity-wallet-panel">
          <header>
            <WalletCreditCard24Regular aria-hidden="true" />
            <div>
              <span>ENTITLEMENT WALLET</span>
              <h2>权益不是付费通行证</h2>
            </div>
          </header>
          <div className="opportunity-entitlements">
            {state.entitlements.map((entitlement) => (
              <article key={entitlement.id}>
                <span>{entitlement.status}</span>
                <h3>{entitlement.title}</h3>
                <p>{entitlement.scope}</p>
                <small>
                  {entitlement.provider} · 到期 {entitlement.expiresAt.slice(0, 10)}
                </small>
                <ul>
                  {entitlement.conditions.map((condition) => (
                    <li key={condition}>{condition}</li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
          <header className="opportunity-capacity-heading">
            <CalendarClock24Regular aria-hidden="true" />
            <div>
              <span>CAPACITY</span>
              <h2>真实容量与取舍</h2>
            </div>
          </header>
          <div className="opportunity-capacity-grid">
            {state.capacity.map((dimension) => {
              const remaining = Math.max(
                dimension.available - dimension.committed,
                0,
              );
              return (
                <article key={dimension.id}>
                  <span>{dimension.label}</span>
                  <strong>
                    {remaining} / {dimension.available} {dimension.unit}
                  </strong>
                  <meter
                    min={0}
                    max={dimension.available}
                    value={remaining}
                    aria-label={`${dimension.label}剩余 ${remaining} / ${dimension.available} ${dimension.unit}`}
                  />
                  <small>{dimension.sourceLabel}</small>
                </article>
              );
            })}
          </div>
          <div className="opportunity-capacity-plan">
            <label>
              本人 What-if 投入
              <input
                type="number"
                min={1}
                max={6}
                disabled={state.offline}
                value={capacityHours}
                onChange={(event) =>
                  setCapacityHours(Number(event.target.value))
                }
              />
              小时 / 周
            </label>
            <button
              type="button"
              disabled={state.offline}
              onClick={() =>
                commit((current) =>
                  addCapacityPlan(
                    current,
                    selectedOpportunity.id,
                    capacityHours,
                    "在不挤占课程与恢复时间的前提下试投。",
                  ),
                )
              }
            >
              保存容量 What-if
            </button>
            <p>充值不能购买时间、精力、成绩、先修或录取资格。</p>
          </div>
        </section>
      </div>
    </>
  );

  const renderPathway = () => (
    <>
      <section className="opportunity-pathway-intro">
        <div>
          <span>SCENARIO DRAFT BOARD</span>
          <h2>路径变化先模拟，再交回正式审批</h2>
        </div>
        <p>
          A / B / C 只比较学分继承、时间、成本、风险、回滚点与审批路径；不会承诺结果或写回学校系统。
        </p>
      </section>
      <div className="opportunity-pathway-grid">
        {state.pathways.map((pathway) => (
          <article
            key={pathway.id}
            className={
              state.selectedPathwayId === pathway.id ? "is-selected" : ""
            }
          >
            <span>{pathway.type}</span>
            <h3>{pathway.title}</h3>
            <dl>
              <div>
                <dt>学分继承</dt>
                <dd>{pathway.inheritedCredits}</dd>
              </div>
              <div>
                <dt>时间</dt>
                <dd>{pathway.estimatedTime}</dd>
              </div>
              <div>
                <dt>成本</dt>
                <dd>{pathway.estimatedCost}</dd>
              </div>
              <div>
                <dt>回滚点</dt>
                <dd>{pathway.rollbackPoint}</dd>
              </div>
            </dl>
            <div>
              <strong>假设</strong>
              <ul>
                {pathway.assumptions.map((assumption) => (
                  <li key={assumption}>{assumption}</li>
                ))}
              </ul>
            </div>
            <div>
              <strong>风险</strong>
              <ul>
                {pathway.risks.map((risk) => (
                  <li key={risk}>{risk}</li>
                ))}
              </ul>
            </div>
            <div>
              <strong>正式审批路径</strong>
              <ol>
                {pathway.approvalPath.map((step) => (
                  <li key={step}>{step}</li>
                ))}
              </ol>
            </div>
            <button
              type="button"
              disabled={state.offline}
              onClick={() =>
                commit((current) => selectPathway(current, pathway.id))
              }
            >
              {state.selectedPathwayId === pathway.id
                ? "当前 What-if"
                : "打开 What-if"}
            </button>
          </article>
        ))}
      </div>
      {selectedPathway && (
        <div className="opportunity-pathway-result" role="status">
          <CompassNorthwest24Regular aria-hidden="true" />
          <div>
            <strong>{selectedPathway.title}</strong>
            <span>
              非权威 Scenario Draft · {selectedPathway.rollbackPoint}
            </span>
          </div>
        </div>
      )}
      <section className="opportunity-portfolio-panel">
        <header>
          <div>
            <span>EVIDENCE EXPORT</span>
            <h2>作品由学生逐项选择</h2>
          </div>
          <p>
            只导出来源引用和审核状态；不复制课程原材料，不生成学校凭证。
          </p>
        </header>
        <div>
          {state.portfolioArtifacts.map((artifact) => (
            <label key={artifact.id}>
              <input
                type="checkbox"
                disabled={state.offline}
                checked={artifact.selected}
                onChange={() =>
                  commit((current) =>
                    togglePortfolioArtifact(current, artifact.id),
                  )
                }
              />
              <span>
                <strong>{artifact.title}</strong>
                <small>
                  {artifact.sourceModule} · {artifact.sourceId} ·{" "}
                  {artifact.reviewStatus}
                </small>
              </span>
            </label>
          ))}
        </div>
        <button
          type="button"
          disabled={state.offline}
          onClick={exportPortfolio}
        >
          <ArrowDownload24Regular aria-hidden="true" />
          导出个人作品副本（非证明）
        </button>
      </section>
    </>
  );

  const renderReplay = () => (
    <div className="opportunity-replay-grid">
      <section className="opportunity-fairness-panel">
        <header>
            <div>
              <span>ANTI-MANIPULATION</span>
              <h2>看看排序有没有偷偷带节奏</h2>
          </div>
          <button
            type="button"
            disabled={state.offline}
            onClick={() => commit(runFairnessAudit)}
          >
            <ShieldCheckmark24Regular aria-hidden="true" />
            重新检查
          </button>
        </header>
        {latestFairness ? (
          <div className="opportunity-fairness-checks">
            {latestFairness.checks.map((check) => (
              <article key={check.id} className={`is-${check.status}`}>
                {check.status === "pass" ? (
                  <CheckmarkCircle24Filled aria-hidden="true" />
                ) : (
                  <Warning24Regular aria-hidden="true" />
                )}
                <div>
                  <strong>{check.label}</strong>
                  <p>{check.detail}</p>
                </div>
                <span>{check.status.toUpperCase()}</span>
              </article>
            ))}
          </div>
        ) : (
          <div className="opportunity-empty opportunity-empty--compact">
            <ShieldCheckmark24Regular aria-hidden="true" />
            <h3>还没检查这轮排序</h3>
            <p>检查付费、随机、竞价、敏感代理字段与自动投递。</p>
          </div>
        )}
        <div className="opportunity-box-score">
          <header>
            <DataTrending24Regular aria-hidden="true" />
            <div>
              <strong>Opportunity Box Score</strong>
              <span>{selectedOpportunity.title}</span>
            </div>
          </header>
          <dl>
            <div>
              <dt>来源</dt>
              <dd>
                {boxScore.source.version} · {boxScore.source.authority}
              </dd>
            </div>
            <div>
              <dt>资格检查字段</dt>
              <dd>{boxScore.data_usage.checked_fields.join(" · ") || "无"}</dd>
            </div>
            <div>
              <dt>当前披露字段</dt>
              <dd>
                {boxScore.data_usage.disclosed_fields.join(" · ") || "无"}
              </dd>
            </div>
            <div>
              <dt>纠错</dt>
              <dd>{boxScore.correction_route}</dd>
            </div>
            <div>
              <dt>边界</dt>
              <dd>无综合分 · 不自动申请 · 演示</dd>
            </div>
          </dl>
        </div>
      </section>

      <section className="opportunity-replay-panel">
        <header>
          <div>
            <span>操作回放 · 旧记录不会被覆盖</span>
            <h2>机会与同意回放</h2>
          </div>
          <strong>{state.audit.length} 个事件</strong>
        </header>
        <ol className="opportunity-audit-list">
          {[...state.audit].reverse().map((event) => (
            <li key={event.id}>
              <span>{String(event.sequence).padStart(2, "0")}</span>
              <div>
                <strong>{event.action}</strong>
                <p>{event.detail}</p>
                <small>
                  {event.targetId} · {event.occurredAt}
                </small>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className="opportunity-notification-panel">
        <header>
          <span>IMPACT NOTICE</span>
          <h2>过期、纠错与授权通知</h2>
        </header>
        <div>
          {state.notifications.map((notification) => (
            <article key={notification.id}>
              <Flag24Regular aria-hidden="true" />
              <div>
                <strong>{notification.kind}</strong>
                <p>{notification.message}</p>
                <small>{notification.createdAt}</small>
              </div>
            </article>
          ))}
          {state.reports.map((report) => (
            <article key={report.id}>
              <Warning24Regular aria-hidden="true" />
              <div>
                <strong>{REPORT_LABEL[report.type]}</strong>
                <p>{report.reason}</p>
                <small>
                  {report.status} · 匹配重算{" "}
                  {report.affectedMatchRecalculated ? "已完成" : "待处理"}
                </small>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );

  const stageContent = {
    market: renderMarket,
    eligibility: renderEligibility,
    match: renderMatch,
    exchange: renderExchange,
    pathway: renderPathway,
    replay: renderReplay,
  }[state.selectedStage]();

  return (
    <div
      className={[
        "opportunity-shell",
        state.offline ? "is-offline" : "",
        state.simplified ? "is-simplified" : "",
        state.reducedMotion ? "is-reduced-motion" : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <a className="skip-link" href="#opportunity-main">
        跳到 Opportunity Market 内容
      </a>
      <div className="opportunity-shell__background" aria-hidden="true" />
      <header className="opportunity-topbar">
        <button className="opportunity-back" type="button" onClick={onExit}>
          <ArrowLeft24Regular aria-hidden="true" />
          返回 MyCareer
        </button>
        <div className="opportunity-brand">
          <span>UNIVERSITY2K26 · OPPORTUNITY EXCHANGE</span>
          <strong>{currentStage.label}</strong>
          <small>{currentStage.traditional}</small>
        </div>
        <div className="opportunity-topbar__actions">
          <span title="当前服务状态；机会匹配使用本地演示数据">
            <DataTrending24Regular aria-hidden="true" />
            {state.offline ? "本地缓存（只读）" : backendLabel}
          </span>
          <button
            type="button"
            aria-pressed={state.simplified}
            onClick={() =>
              commit((current) =>
                setOpportunityPreferences(current, "simplified"),
              )
            }
          >
            <Accessibility24Regular aria-hidden="true" />
            简化视图
          </button>
          <button
            type="button"
            aria-pressed={state.reducedMotion}
            onClick={() =>
              commit((current) =>
                setOpportunityPreferences(current, "reducedMotion"),
              )
            }
          >
            <ArrowSync24Regular aria-hidden="true" />
            减少动效
          </button>
          <button
            type="button"
            aria-pressed={state.offline}
            onClick={() => commit(toggleOpportunityOffline)}
          >
            <CloudOff24Regular aria-hidden="true" />
            {state.offline ? "恢复本地服务" : "模拟离线"}
          </button>
          <button type="button" onClick={reset}>
            <ArrowSync24Regular aria-hidden="true" />
            重置
          </button>
        </div>
      </header>

      <nav className="opportunity-stepbar" aria-label="Opportunity Market 步骤">
        {STAGES.map((stage, index) => {
          const Icon = stage.icon;
          return (
            <button
              key={stage.id}
              type="button"
              className={state.selectedStage === stage.id ? "is-active" : ""}
              aria-current={state.selectedStage === stage.id ? "step" : undefined}
              onClick={() =>
                commit((current) => setMarketStage(current, stage.id))
              }
            >
              <span>{String(index + 1).padStart(2, "0")}</span>
              <Icon aria-hidden="true" />
              <b>{state.simplified ? stage.traditional : stage.label}</b>
            </button>
          );
        })}
      </nav>

      <div className="opportunity-boundary-banner">
        {state.offline ? (
          <CloudOff24Regular aria-hidden="true" />
        ) : (
          <ShieldCheckmark24Regular aria-hidden="true" />
        )}
        <strong>{state.offline ? "离线只读" : "来源已标注"}</strong>
        <span>
          官方页面已经核对，演示条目也会明说。你的邮箱、申请和排序决定，不会在这里偷偷发生。
        </span>
      </div>

      <main id="opportunity-main" className="opportunity-main">
        <div className="opportunity-page-heading">
          <div>
            <span>OPEN THE RULES · OWN THE CHOICE</span>
            <h1>{currentStage.label}</h1>
            <p>{currentStage.traditional}</p>
          </div>
          <div>
            <span>
              <b>{state.opportunities.filter((item) => item.status === "active").length}</b>
              有效机会
            </span>
            <span>
              <b>{state.selectedProfileFieldIds.length}</b>
              本次字段
            </span>
            <span>
              <b>{state.savedOpportunities.length}</b>
              本人保存
            </span>
          </div>
        </div>
        <div className="opportunity-live-message" role="status" aria-live="polite">
          <Info24Regular aria-hidden="true" />
          {state.message}
        </div>
        <div key={state.selectedStage} className="opportunity-stage-content">
          {stageContent}
        </div>
      </main>

      <footer className="opportunity-footer">
        <span>
          <LockClosed24Regular aria-hidden="true" />
          个人资料：默认私密 · 演示
        </span>
        <span>
          <ShieldCheckmark24Regular aria-hidden="true" />
          排序：资格四态 → 时间节点 · Paid 0
        </span>
        <span>
          <History24Regular aria-hidden="true" />
          回放：{state.audit.length} 条操作记录
        </span>
      </footer>
    </div>
  );
}

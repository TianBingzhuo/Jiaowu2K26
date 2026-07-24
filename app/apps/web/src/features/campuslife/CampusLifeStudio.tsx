import { useEffect, useMemo, useState } from "react";
import {
  AlertUrgent24Regular,
  ArrowDownload24Regular,
  ArrowLeft24Regular,
  Bookmark24Regular,
  Building24Regular,
  CalendarAdd24Regular,
  Checkmark24Regular,
  City24Regular,
  CloudOff24Regular,
  CompassNorthwest24Regular,
  DocumentSearch24Regular,
  HeartPulse24Regular,
  History24Regular,
  Info24Regular,
  Location24Regular,
  Megaphone24Regular,
  Navigation24Regular,
  PeopleTeam24Regular,
  PersonSupport24Regular,
  Save24Regular,
  Search24Regular,
  ShieldCheckmark24Regular,
  ShieldTask24Regular,
  Sparkle24Regular,
  WeatherSunny24Regular,
} from "@fluentui/react-icons";
import {
  buildMentorHandoff,
  campusBoxScore,
  campusRecommendations,
  campusSource,
  confirmTeamCounterparty,
  createCampusLifeState,
  expressTeamIntent,
  planCampusRoute,
  recordCampusReceipt,
  reportCampusSource,
  saveEventToCalendar,
  saveToMyCourt,
  searchCampusLife,
  setCampusOffline,
  setCampusPreferences,
  setCampusStage,
  updateCampusJourney,
  updateCampusNotifications,
  updateCampusProfile,
} from "./engine";
import {
  clearCampusLifeState,
  loadCampusLifeState,
  saveCampusLifeState,
} from "./storage";
import type {
  CampusJourneyStatus,
  CampusLifeState,
  CampusParticipation,
  CampusStage,
} from "./types";
import { useI18n } from "../../i18n/I18nProvider";
import "./campuslife.css";

type CampusLifeStudioProps = {
  backendLabel: string;
  onExit: () => void;
};

const STAGES: Array<{
  id: CampusStage;
  label: string;
  traditional: string;
  icon: typeof City24Regular;
}> = [
  {
    id: "concourse",
    label: "Campus Concourse",
    traditional: "服务与活动",
    icon: City24Regular,
  },
  {
    id: "map",
    label: "Campus Map",
    traditional: "校园地图",
    icon: CompassNorthwest24Regular,
  },
  {
    id: "mycourt",
    label: "MyCOURT",
    traditional: "个人收藏与办理",
    icon: Bookmark24Regular,
  },
  {
    id: "squad",
    label: "Squad Link",
    traditional: "组队与同伴",
    icon: PeopleTeam24Regular,
  },
  {
    id: "support",
    label: "Support Line",
    traditional: "支持与通知",
    icon: HeartPulse24Regular,
  },
  {
    id: "replay",
    label: "Campus Replay",
    traditional: "纠错与回放",
    icon: History24Regular,
  },
];

const targetLabel = (state: CampusLifeState, targetId: string) =>
  state.fixture.resources.find((item) => item.id === targetId)?.title ??
  state.fixture.events.find((item) => item.id === targetId)?.title ??
  state.fixture.team_listings.find((item) => item.id === targetId)?.title ??
  state.fixture.mentors.find((item) => item.id === targetId)?.display_name ??
  targetId;

function SourceBadge({
  state,
  sourceId,
}: {
  state: CampusLifeState;
  sourceId: string;
}) {
  const source = campusSource(state, sourceId);
  return (
    <span
      className="campus-source-badge"
      title={`${source.provider} · ${source.version} · ${source.correction_route}`}
    >
      <DocumentSearch24Regular aria-hidden="true" />
      {source.version}
    </span>
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
    <header className="campus-section-heading">
      <span>{eyebrow}</span>
      <h2>{title}</h2>
      <p>{detail}</p>
    </header>
  );
}

export function CampusLifeStudio({
  backendLabel,
  onExit,
}: CampusLifeStudioProps) {
  const { formatDate } = useI18n();
  const formatTime = (value: string) =>
    formatDate(value, {
      month: "numeric",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  const [state, setState] = useState(loadCampusLifeState);
  const [toast, setToast] = useState("");
  const [mentorQuestion, setMentorQuestion] = useState(
    "参加这个项目之前，我应当先核对哪一个正式入口和时间承诺？",
  );
  const [correctionReason, setCorrectionReason] = useState(
    "Fixture 开放时间需要人工核对新的来源版本。",
  );
  const [receiptReflection, setReceiptReflection] = useState(
    "我完成了一次体验，并记录下一步要核对的来源。",
  );
  const [receiptParticipation, setReceiptParticipation] =
    useState<CampusParticipation>("attended");

  useEffect(() => {
    saveCampusLifeState(state);
  }, [state]);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [state.stage]);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(""), 2800);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const stageIndex = STAGES.findIndex((item) => item.id === state.stage);
  const recommendations = useMemo(
    () => campusRecommendations(state),
    [state],
  );
  const boxScore = useMemo(() => campusBoxScore(state), [state]);

  const apply = (
    operation: (current: CampusLifeState) => CampusLifeState,
    success: string,
  ) => {
    try {
      setState(operation(state));
      setToast(success);
    } catch (error) {
      setToast(error instanceof Error ? error.message : "操作未完成。");
    }
  };

  const reset = () => {
    clearCampusLifeState();
    setState(createCampusLifeState());
    setToast("F-008 Fixture 已重置；未触碰任何学校正式系统。");
  };

  const exportMyCourt = () => {
    const payload = {
      schema_version: "1.0.0",
      data_mode: "demo_fixture",
      generated_at: new Date().toISOString(),
      trusted: false,
      private: true,
      saved_items: state.saved_items,
      journey_mirrors: state.journey_mirrors,
      receipts: state.receipts,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: "application/json;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "university2k26-mycourt-untrusted.json";
    anchor.click();
    URL.revokeObjectURL(url);
    setToast("已导出本人可读、不可信、私有的 MyCOURT Fixture 归档。");
  };

  const renderConcourse = () => (
    <div className="campus-concourse-layout">
      <section className="campus-card campus-hero-card">
        <span className="campus-card__kicker">F008 · CAMPUS LIFE HUB</span>
        <p className="campus-hero-card__season">第 4 / 8 赛季 · 校园主场</p>
        <h1>下一站，由你叫战术。</h1>
        <p>
          把校园服务、活动、空间与协作放进一个可检索、可解释、可回放的
          Concourse。这里只导航和保存，不替学校批准、报名或取消。
        </p>
        <div className="campus-hero-stats" aria-label="Campus Life Box Score">
          <article>
            <strong>{boxScore.discoverable_items}</strong>
            <span>可发现条目</span>
          </article>
          <article>
            <strong>{boxScore.verified_sources}</strong>
            <span>Fixture 来源</span>
          </article>
          <article>
            <strong>0</strong>
            <span>位置追踪</span>
          </article>
        </div>
      </section>

      <section className="campus-card campus-search-card">
        <SectionHeading
          eyebrow="F008-03 · INTENT SEARCH"
          title="不是找菜单，是说出你要完成什么"
          detail="筛选会一直可见；画像关闭后自动退回时间与状态排序。"
        />
        <form
          className="campus-search-form"
          onSubmit={(event) => {
            event.preventDefault();
            apply(
              (current) =>
                searchCampusLife(current, current.search_query),
              "搜索已刷新；解释与来源仍在同一屏。",
            );
          }}
        >
          <label>
            目标
            <input
              value={state.search_query.text}
              onChange={(event) =>
                setState({
                  ...state,
                  search_query: {
                    ...state.search_query,
                    text: event.target.value,
                  },
                })
              }
              placeholder="例如：实验、写作、心理支持"
            />
          </label>
          <label>
            形式
            <select
              value={state.search_query.delivery_mode ?? ""}
              onChange={(event) =>
                setState({
                  ...state,
                  search_query: {
                    ...state.search_query,
                    delivery_mode:
                      (event.target.value as
                        | "online"
                        | "in_person"
                        | "hybrid") || null,
                  },
                })
              }
            >
              <option value="">全部形式</option>
              <option value="online">线上</option>
              <option value="in_person">线下</option>
              <option value="hybrid">混合</option>
            </select>
          </label>
          <label className="campus-check-row">
            <input
              type="checkbox"
              checked={state.search_query.accessibility_required}
              onChange={(event) =>
                setState({
                  ...state,
                  search_query: {
                    ...state.search_query,
                    accessibility_required: event.target.checked,
                  },
                })
              }
            />
            需要无障碍信息
          </label>
          <button type="submit" data-focusable="true">
            <Search24Regular aria-hidden="true" />
            扫描 Campus
          </button>
        </form>
        <p className="campus-explanation">
          <Info24Regular aria-hidden="true" />
          {state.search_result.explanation}
        </p>
        <div className="campus-filter-row">
          {state.search_result.active_filters.length ? (
            state.search_result.active_filters.map((filter) => (
              <span key={filter}>{filter}</span>
            ))
          ) : (
            <span>默认：有效条目 · 时间顺序</span>
          )}
        </div>
      </section>

      <section className="campus-card campus-profile-card">
        <SectionHeading
          eyebrow="F008-04 · PLAYER CONTROL"
          title="本人选择的偏好，不是隐形画像"
          detail={state.profile.purpose}
        />
        <label className="campus-profile-switch">
          <input
            type="checkbox"
            checked={state.profile.profiling_enabled}
            onChange={(event) =>
              apply(
                (current) =>
                  updateCampusProfile(
                    current,
                    event.target.checked,
                    event.target.checked ? ["研究", "创作"] : [],
                  ),
                event.target.checked
                  ? "偏好已开启；只使用本人显式选择。"
                  : "画像已关闭；已切换到非画像排序。",
              )
            }
          />
          <span>
            <strong>
              {state.profile.profiling_enabled ? "偏好已开启" : "偏好已关闭"}
            </strong>
            <small>{state.profile.academic_stage}</small>
          </span>
        </label>
        <div className="campus-interest-grid">
          {state.fixture.interest_catalog.map((interest) => {
            const active = state.profile.interests.includes(interest);
            return (
              <button
                key={interest}
                className={active ? "is-selected" : ""}
                type="button"
                disabled={!state.profile.profiling_enabled}
                onClick={() =>
                  apply(
                    (current) =>
                      updateCampusProfile(
                        current,
                        true,
                        active
                          ? current.profile.interests.filter(
                              (item) => item !== interest,
                            )
                          : [...current.profile.interests, interest],
                      ),
                    `兴趣阵容已${active ? "移除" : "加入"}：${interest}`,
                  )
                }
                data-focusable="true"
              >
                {active && <Checkmark24Regular aria-hidden="true" />}
                {interest}
              </button>
            );
          })}
        </div>
      </section>

      <section className="campus-card campus-recommendation-card">
        <SectionHeading
          eyebrow="F008-01/02 · NEXT MOVES"
          title="本轮推荐"
          detail="每条推荐都有为什么，也有关闭画像后的退路。"
        />
        {recommendations.map((recommendation, index) => {
          const event = state.fixture.events.find(
            (item) => item.id === recommendation.id,
          );
          if (!event) return null;
          return (
            <article key={event.id}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <div>
                <strong>{event.title}</strong>
                <p>{recommendation.explanation}</p>
                <small>
                  {formatTime(event.starts_at)} · {event.cost_label}
                </small>
              </div>
              <button
                type="button"
                aria-label={`保存 ${event.title} 到 MyCOURT`}
                onClick={() =>
                  apply(
                    (current) => saveToMyCourt(current, event.id, "event"),
                    "已私有保存到 MyCOURT；没有执行报名。",
                  )
                }
                data-focusable="true"
              >
                <Bookmark24Regular aria-hidden="true" />
              </button>
            </article>
          );
        })}
      </section>

      <section className="campus-card campus-resource-card">
        <SectionHeading
          eyebrow="F008-01 · SERVICE ROSTER"
          title="校园服务阵容"
          detail="每张卡都保留正式入口、服务边界、版本与纠错路线。"
        />
        <div className="campus-resource-grid">
          {state.fixture.resources
            .filter((resource) =>
              state.search_result.resource_ids.includes(resource.id),
            )
            .map((resource) => (
              <article
                key={resource.id}
                className={
                  resource.status === "expired" ? "is-expired" : ""
                }
              >
                <div>
                  <Building24Regular aria-hidden="true" />
                  <span>{resource.category}</span>
                </div>
                <h3>{resource.title}</h3>
                <p>{resource.summary}</p>
                <small>{resource.service_boundary}</small>
                <SourceBadge state={state} sourceId={resource.source_id} />
                <button
                  type="button"
                  disabled={resource.status === "expired"}
                  onClick={() =>
                    apply(
                      (current) =>
                        saveToMyCourt(current, resource.id, "service"),
                      "服务已加入 MyCOURT；办理结果仍需正式系统确认。",
                    )
                  }
                  data-focusable="true"
                >
                  <Bookmark24Regular aria-hidden="true" />
                  私有收藏
                </button>
              </article>
            ))}
        </div>
      </section>

      <section className="campus-card campus-event-card">
        <SectionHeading
          eyebrow="F008-02/05 · EVENT BOARD"
          title="活动与日历"
          detail="保存会检查冲突，但不会替你报名、取消或占位。"
        />
        {state.fixture.events
          .filter((event) =>
            state.search_result.event_ids.includes(event.id),
          )
          .map((event) => {
            const calendar = state.calendar_entries.find(
              (entry) => entry.event_id === event.id,
            );
            return (
              <article key={event.id}>
                <div>
                  <span>{formatTime(event.starts_at)}</span>
                  <SourceBadge state={state} sourceId={event.source_id} />
                </div>
                <h3>{event.title}</h3>
                <p>{event.eligibility}</p>
                {calendar?.conflict_labels.length ? (
                  <strong className="campus-conflict">
                    冲突：{calendar.conflict_labels.join("、")}
                  </strong>
                ) : null}
                <button
                  type="button"
                  onClick={() =>
                    apply(
                      (current) => saveEventToCalendar(current, event.id),
                      "已写入个人日历镜像；没有执行活动报名。",
                    )
                  }
                  data-focusable="true"
                >
                  <CalendarAdd24Regular aria-hidden="true" />
                  {calendar ? "已保存 · 未报名" : "加入日历并查冲突"}
                </button>
              </article>
            );
          })}
      </section>
    </div>
  );

  const renderMap = () => (
    <div className="campus-map-layout">
      <section className="campus-map-board">
        <div className="campus-map-board__heading">
          <span>F008-06 · STATIC 2D CAMPUS MAP</span>
          <h1>选择目的地，跑一条不追踪你的路线。</h1>
          <p>
            当前位置只是 Fixture 起点；页面不会读取 GPS、门禁或连续轨迹。
          </p>
        </div>
        <img
          src="/assets/campus-life-background-v1.png"
          alt="原创夜间大学校园俯视背景，展示多个由步行路径连接的校园区域"
        />
        <div className="campus-map-markers" aria-label="校园地点">
          {state.fixture.locations.map((location) => (
            <button
              key={location.id}
              className={
                state.selected_location_id === location.id
                  ? "is-selected"
                  : ""
              }
              type="button"
              style={{ left: `${location.x}%`, top: `${location.y}%` }}
              onClick={() => {
                setState({ ...state, selected_location_id: location.id });
                setToast(`已选择：${location.label}`);
              }}
              data-focusable="true"
            >
              <Location24Regular aria-hidden="true" />
              <span>{location.label}</span>
            </button>
          ))}
        </div>
        <div className="campus-map-scanline" aria-hidden="true" />
      </section>

      <aside className="campus-card campus-route-card">
        <SectionHeading
          eyebrow="ROUTE LOADOUT"
          title="宿舍区 → 中央图书馆"
          detail="优先选择登记的无障碍路线；路线是静态说明，不是实时导航。"
        />
        <button
          className="campus-primary-button"
          type="button"
          onClick={() =>
            apply(
              (current) =>
                planCampusRoute(
                  current,
                  "loc-dorm",
                  "loc-library",
                  true,
                ),
              "无障碍路线已装载；位置追踪仍为 0。",
            )
          }
          data-focusable="true"
        >
          <Navigation24Regular aria-hidden="true" />
          装载无障碍路线
        </button>
        {state.selected_route ? (
          <article className="campus-route-result">
            <header>
              <strong>{state.selected_route.label}</strong>
              <span>{state.selected_route.estimated_minutes} MIN</span>
            </header>
            <ol>
              {state.selected_route.steps.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
            <SourceBadge
              state={state}
              sourceId={state.selected_route.source_id}
            />
            <p>
              <ShieldCheckmark24Regular aria-hidden="true" />
              未启动 GPS、门禁或后台位置采集。
            </p>
          </article>
        ) : (
          <p className="campus-empty-state">
            选择上方战术动作后，这里会显示路线步骤与来源。
          </p>
        )}
      </aside>
    </div>
  );

  const renderMyCourt = () => (
    <div className="campus-mycourt-layout">
      <section className="campus-card campus-mycourt-hero">
        <span className="campus-card__kicker">F008-07 · PRIVATE LOADOUT</span>
        <h1>MyCOURT 只属于本人。</h1>
        <p>
          收藏、办理镜像与足迹回执默认不公开，不参与排名，也不代表学校已经批准。
        </p>
        <button
          type="button"
          onClick={exportMyCourt}
          data-focusable="true"
        >
          <ArrowDownload24Regular aria-hidden="true" />
          导出可读不可信归档
        </button>
      </section>
      <section className="campus-card campus-saved-panel">
        <SectionHeading
          eyebrow="SAVED LOADOUT"
          title={`已保存 ${state.saved_items.length}`}
          detail="保存不会对活动主办方、队伍或导师发送任何参与信号。"
        />
        {state.saved_items.length ? (
          state.saved_items.map((item) => (
            <article key={item.target_id}>
              <Bookmark24Regular aria-hidden="true" />
              <div>
                <strong>{targetLabel(state, item.target_id)}</strong>
                <small>
                  {item.target_type} · {formatTime(item.saved_at)}
                </small>
              </div>
            </article>
          ))
        ) : (
          <p className="campus-empty-state">
            还没有保存项目。回到 Campus Concourse
            可把活动或服务加入本人阵容。
          </p>
        )}
      </section>
      <section className="campus-card campus-journey-panel">
        <SectionHeading
          eyebrow="F008-10 · JOURNEY MIRROR"
          title="个人办理镜像"
          detail="它只记住你走到哪一步，不会冒充学校系统的审批结论。"
        />
        {state.journey_mirrors.map((journey) => (
          <article key={journey.resource_id}>
            <header>
              <strong>{targetLabel(state, journey.resource_id)}</strong>
              <span>NON-AUTHORITATIVE</span>
            </header>
            <p>{journey.personal_note}</p>
            <label>
              当前个人状态
              <select
                value={journey.status}
                onChange={(event) =>
                  apply(
                    (current) =>
                      updateCampusJourney(
                        current,
                        journey.resource_id,
                        event.target.value as CampusJourneyStatus,
                        "等待正式入口反馈；本人镜像不会代替审批。",
                      ),
                    "个人办理镜像已更新；权威结果仍为未知。",
                  )
                }
              >
                <option value="saved">已保存</option>
                <option value="in_progress">进行中</option>
                <option value="waiting_external">等待正式系统</option>
                <option value="closed">本人关闭</option>
              </select>
            </label>
            <small>上次核对：{formatTime(journey.last_checked_at)}</small>
          </article>
        ))}
      </section>
      <section className="campus-card campus-boundary-panel">
        <ShieldTask24Regular aria-hidden="true" />
        <div>
          <strong>可信边界</strong>
          <p>
            导出文件是本人可阅读的 Fixture 归档，明确标记 trusted=false；
            不能用作门禁、报名、学籍或支付凭证。
          </p>
        </div>
      </section>
    </div>
  );

  const renderSquad = () => (
    <div className="campus-squad-layout">
      <section className="campus-card campus-squad-hero">
        <SectionHeading
          eyebrow="F008-08 · SQUAD LINK"
          title="双向意向之前，不公开额外资料"
          detail="先看角色缺口、时间与协作方式；双方确认后才释放最少必要字段。"
        />
        <div className="campus-team-grid">
          {state.fixture.team_listings.map((listing) => {
            const intent = state.team_intents.find(
              (item) => item.listing_id === listing.id,
            );
            return (
              <article key={listing.id}>
                <header>
                  <PeopleTeam24Regular aria-hidden="true" />
                  <span>{listing.hours_per_week} H / WEEK</span>
                </header>
                <h3>{listing.title}</h3>
                <p>{listing.role_gap}</p>
                <small>{listing.collaboration_mode}</small>
                <SourceBadge state={state} sourceId={listing.source_id} />
                {!intent ? (
                  <button
                    type="button"
                    onClick={() =>
                      apply(
                        (current) => expressTeamIntent(current, listing.id),
                        "已表达本人意向；尚未公开额外字段。",
                      )
                    }
                    data-focusable="true"
                  >
                    表达本人意向
                  </button>
                ) : intent.disclosure_status === "waiting_counterparty" ? (
                  <button
                    type="button"
                    onClick={() =>
                      apply(
                        (current) =>
                          confirmTeamCounterparty(current, listing.id),
                        "Fixture 已模拟对方确认；只释放最少协作字段。",
                      )
                    }
                    data-focusable="true"
                  >
                    模拟对方确认（Fixture）
                  </button>
                ) : (
                  <div className="campus-mutual-receipt">
                    <Checkmark24Regular aria-hidden="true" />
                    <span>
                      双向意向 · {intent.disclosed_fields.join(" / ")}
                    </span>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      </section>

      <section className="campus-card campus-mentor-panel">
        <SectionHeading
          eyebrow="F008-09 · MENTOR HANDOFF"
          title="把问题交给真人，而不是伪造真人回答"
          detail="应用只整理本人确认的问题和来源，导师回复始终保持为空。"
        />
        {state.fixture.mentors.map((mentor) => (
          <article key={mentor.id}>
            <div className="campus-mentor-identity">
              <PersonSupport24Regular aria-hidden="true" />
              <span>
                <strong>{mentor.display_name}</strong>
                <small>{mentor.qualification}</small>
              </span>
            </div>
            <ul>
              {mentor.boundaries.map((boundary) => (
                <li key={boundary}>{boundary}</li>
              ))}
            </ul>
            <label>
              交接问题
              <textarea
                value={mentorQuestion}
                onChange={(event) => setMentorQuestion(event.target.value)}
                rows={3}
              />
            </label>
            <button
              type="button"
              onClick={() =>
                apply(
                  (current) =>
                    buildMentorHandoff(
                      current,
                      mentor.id,
                      mentorQuestion,
                    ),
                  "导师交接包已准备；没有伪造真人回复。",
                )
              }
              data-focusable="true"
            >
              <Save24Regular aria-hidden="true" />
              准备本人交接包
            </button>
          </article>
        ))}
        {state.mentor_handoffs.map((handoff) => (
          <div className="campus-handoff-receipt" key={handoff.id}>
            <ShieldCheckmark24Regular aria-hidden="true" />
            <span>
              <strong>{handoff.status}</strong>
              <small>mentor_response = null · 等待本人决定是否外发</small>
            </span>
          </div>
        ))}
      </section>
    </div>
  );

  const renderSupport = () => (
    <div className="campus-support-layout">
      <section className="campus-card campus-support-hero">
        <AlertUrgent24Regular aria-hidden="true" />
        <div>
          <span>F008-11 · DIRECT ESCALATION</span>
          <h1>需要真人时，不要等推荐系统。</h1>
          <p>
            紧急路径直接出现，不经过画像、排序或营销。所有链接都是
            example.edu Fixture，现场必须替换并核实正式渠道。
          </p>
        </div>
      </section>
      <section className="campus-escalation-grid">
        {state.fixture.escalation_routes.map((route) => (
          <article
            key={route.id}
            className={
              route.emergency
                ? "campus-card is-emergency"
                : "campus-card"
            }
          >
            {route.emergency ? (
              <AlertUrgent24Regular aria-hidden="true" />
            ) : (
              <HeartPulse24Regular aria-hidden="true" />
            )}
            <span>{route.emergency ? "DIRECT NOW" : "NON-URGENT"}</span>
            <h2>{route.title}</h2>
            <p>{route.scope}</p>
            <strong>{route.channel}</strong>
            <small>{route.available_label}</small>
            <a
              href={route.official_url}
              target="_blank"
              rel="noreferrer"
              data-focusable="true"
            >
              打开 Fixture 正式入口
            </a>
            <SourceBadge state={state} sourceId={route.source_id} />
          </article>
        ))}
      </section>
      <section className="campus-card campus-notification-panel">
        <SectionHeading
          eyebrow="F008-12 · NOTIFICATION GOVERNANCE"
          title="提醒由你编排，紧急与营销永不混在一起"
          detail="静默时段与摘要频率只影响普通提醒；紧急路径始终独立可见。"
        />
        <div className="campus-notification-settings">
          <label>
            普通提醒频率
            <select
              value={state.notification_settings.frequency}
              onChange={(event) =>
                apply(
                  (current) =>
                    updateCampusNotifications(
                      current,
                      event.target.value as
                        | "realtime"
                        | "daily_digest"
                        | "weekly",
                      current.notification_settings.marketing_enabled,
                    ),
                  "普通提醒频率已更新；紧急路径保持独立。",
                )
              }
            >
              <option value="realtime">实时</option>
              <option value="daily_digest">每日摘要</option>
              <option value="weekly">每周摘要</option>
            </select>
          </label>
          <label>
            静默时段
            <input
              value={state.notification_settings.quiet_hours}
              readOnly
            />
          </label>
          <label className="campus-check-row">
            <input
              type="checkbox"
              checked={state.notification_settings.marketing_enabled}
              onChange={(event) =>
                apply(
                  (current) =>
                    updateCampusNotifications(
                      current,
                      current.notification_settings.frequency,
                      event.target.checked,
                    ),
                  event.target.checked
                    ? "营销提醒已单独开启。"
                    : "营销提醒已关闭；不影响紧急路径。",
                )
              }
            />
            接收营销类校园活动提醒
          </label>
        </div>
        <div className="campus-notification-status">
          <article>
            <AlertUrgent24Regular aria-hidden="true" />
            <strong>紧急通知</strong>
            <span>独立开启 · 不受营销设置影响</span>
          </article>
          <article>
            <Megaphone24Regular aria-hidden="true" />
            <strong>营销通知</strong>
            <span>
              {state.notification_settings.marketing_enabled
                ? "本人主动开启"
                : "默认关闭"}
            </span>
          </article>
        </div>
      </section>
    </div>
  );

  const renderReplay = () => (
    <div className="campus-replay-layout">
      <section className="campus-card campus-replay-score">
        <SectionHeading
          eyebrow="F008 · CAMPUS BOX SCORE"
          title="可回放，但不把生活算成身价"
          detail="只统计系统行为边界，不生成参与度排名、学生价值分或人格结论。"
        />
        <div>
          <article>
            <strong>{boxScore.saved_items}</strong>
            <span>MyCOURT</span>
          </article>
          <article>
            <strong>{boxScore.calendar_entries}</strong>
            <span>日历镜像</span>
          </article>
          <article>
            <strong>{boxScore.mutual_intents}</strong>
            <span>双向意向</span>
          </article>
          <article>
            <strong>0</strong>
            <span>生活价值分</span>
          </article>
        </div>
      </section>
      <section className="campus-card campus-correction-panel">
        <SectionHeading
          eyebrow="F008-13 · SOURCE CHALLENGE"
          title="报告过期或差异"
          detail="报告会创建版本化工单，不会静默改写原来源。"
        />
        <label>
          目标
          <select
            aria-label="纠错目标"
            defaultValue="service-library-access"
            id="campus-correction-target"
          >
            {state.fixture.resources.map((resource) => (
              <option key={resource.id} value={resource.id}>
                {resource.title}
              </option>
            ))}
          </select>
        </label>
        <label>
          可复核说明
          <textarea
            value={correctionReason}
            onChange={(event) => setCorrectionReason(event.target.value)}
            rows={3}
          />
        </label>
        <button
          type="button"
          onClick={() => {
            const select = document.querySelector<HTMLSelectElement>(
              "#campus-correction-target",
            );
            apply(
              (current) =>
                reportCampusSource(
                  current,
                  select?.value ?? "service-library-access",
                  correctionReason,
                ),
              "来源工单已提交；原版本仍可回放。",
            );
          }}
          data-focusable="true"
        >
          <ShieldTask24Regular aria-hidden="true" />
          提交人工复核
        </button>
        {state.corrections.map((correction) => (
          <article key={correction.id}>
            <strong>{correction.id}</strong>
            <span>{correction.status}</span>
            <p>{correction.reason}</p>
            <small>
              预计复核：{formatTime(correction.review_due_at)}
            </small>
          </article>
        ))}
      </section>
      <section className="campus-card campus-receipt-panel">
        <SectionHeading
          eyebrow="F008-14 · PRIVATE FOOTPRINT"
          title="记录自己的收获"
          detail="足迹默认私有，可选择不知道；永远不进入参与度或学生价值评分。"
        />
        <label>
          活动
          <select id="campus-receipt-event">
            {state.fixture.events
              .filter((event) => event.status === "active")
              .map((event) => (
                <option key={event.id} value={event.id}>
                  {event.title}
                </option>
              ))}
          </select>
        </label>
        <label>
          本人状态
          <select
            value={receiptParticipation}
            onChange={(event) =>
              setReceiptParticipation(
                event.target.value as CampusParticipation,
              )
            }
          >
            <option value="attended">参加过</option>
            <option value="not_attended">未参加</option>
            <option value="unknown">不确定 / 不回答</option>
          </select>
        </label>
        <label>
          私有反思
          <textarea
            value={receiptReflection}
            onChange={(event) => setReceiptReflection(event.target.value)}
            rows={3}
          />
        </label>
        <button
          type="button"
          onClick={() => {
            const select = document.querySelector<HTMLSelectElement>(
              "#campus-receipt-event",
            );
            apply(
              (current) =>
                recordCampusReceipt(
                  current,
                  select?.value ?? "event-maker-night",
                  receiptParticipation,
                  receiptReflection,
                ),
              "私有足迹已记录；不会生成参与价值分。",
            );
          }}
          data-focusable="true"
        >
          <Save24Regular aria-hidden="true" />
          自动写入私有回执
        </button>
        {state.receipts.map((receipt) => (
          <article key={receipt.id}>
            <strong>{targetLabel(state, receipt.target_id)}</strong>
            <span>{receipt.participation}</span>
            <small>private=true · affects_student_value=false</small>
          </article>
        ))}
      </section>
      <section className="campus-card campus-ledger-panel">
        <SectionHeading
          eyebrow="APPEND-ONLY LEDGER"
          title={`Campus Replay · ${state.audit.length} 事件`}
          detail="每一步都有前序哈希与明确边界；重置只清理本地 Fixture Session。"
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
    concourse: renderConcourse,
    map: renderMap,
    mycourt: renderMyCourt,
    squad: renderSquad,
    support: renderSupport,
    replay: renderReplay,
  }[state.stage]();

  return (
    <div
      className={[
        "campus-shell",
        state.traditional ? "is-traditional" : "",
        state.reduced_motion ? "is-reduced-motion" : "",
        state.offline ? "is-offline" : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <a className="skip-link" href="#campus-main">
        跳到 Campus Life 内容
      </a>
      <div className="campus-scene" aria-hidden="true" />
      <header className="campus-topbar">
        <button
          className="campus-back"
          type="button"
          onClick={onExit}
          data-focusable="true"
        >
          <ArrowLeft24Regular aria-hidden="true" />
          返回 MyCareer
        </button>
        <div className="campus-brand">
          <strong>
            UNIVERSITY<span>2K26</span>
          </strong>
          <small>CAMPUS LIFE HUB · F-008</small>
        </div>
        <div className="campus-topbar__actions">
          <span>
            <ShieldCheckmark24Regular aria-hidden="true" />
            {backendLabel}
          </span>
          <button
            type="button"
            onClick={() =>
              setState(
                setCampusPreferences(state, {
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
                setCampusPreferences(state, {
                  reduced_motion: !state.reduced_motion,
                }),
              )
            }
            data-focusable="true"
          >
            {state.reduced_motion ? "恢复动画" : "减少动画"}
          </button>
          <button
            type="button"
            onClick={() => {
              setState(setCampusOffline(state, !state.offline));
              setToast(
                state.offline
                  ? "已恢复在线 Fixture 修改能力。"
                  : "已进入离线只读模式。",
              );
            }}
            data-focusable="true"
          >
            <CloudOff24Regular aria-hidden="true" />
            {state.offline ? "恢复在线" : "离线演练"}
          </button>
          <button type="button" onClick={reset} data-focusable="true">
            重置 F-008
          </button>
        </div>
      </header>
      <nav className="campus-stepbar" aria-label="Campus Life 开放模块">
        {STAGES.map((stage, index) => {
          const Icon = stage.icon;
          const active = state.stage === stage.id;
          return (
            <button
              key={stage.id}
              type="button"
              className={active ? "is-active" : ""}
              aria-current={active ? "step" : undefined}
              onClick={() => setState(setCampusStage(state, stage.id))}
              data-focusable="true"
            >
              <span>{String(index + 1).padStart(2, "0")}</span>
              <Icon aria-hidden="true" />
              <strong>
                {state.traditional ? stage.traditional : stage.label}
              </strong>
            </button>
          );
        })}
      </nav>
      <div className="campus-boundary-banner">
        <ShieldCheckmark24Regular aria-hidden="true" />
        <span>
          DEMO FIXTURE · 全功能开放 · 不报名、不审批、不追踪、不评分 ·
          正式动作必须回到学校权威入口
        </span>
        <em>STAGE {stageIndex + 1} / {STAGES.length}</em>
      </div>
      <main id="campus-main" className="campus-main" tabIndex={-1}>
        {(state.stage === "squad" || state.stage === "replay") && (
          <h1 className="sr-only">
            {state.traditional
              ? "校园活动、协作与支持服务"
              : "Campus Life Hub · 校园生活中心"}
          </h1>
        )}
        {stageContent}
      </main>
      <footer className="campus-footer">
        <div>
          <ShieldCheckmark24Regular aria-hidden="true" />
          学校主权优先 · 本页不声称正式结果
        </div>
        <div>
          <Location24Regular aria-hidden="true" />
          位置追踪事件 0
        </div>
        <div>
          <WeatherSunny24Regular aria-hidden="true" />
          生活价值评分 0
        </div>
        <div>
          <Sparkle24Regular aria-hidden="true" />
          全 14 项 Fixture 能力可体验
        </div>
      </footer>
      {toast && (
        <div className="campus-toast" role="status" aria-live="polite">
          <Info24Regular aria-hidden="true" />
          {toast}
        </div>
      )}
    </div>
  );
}

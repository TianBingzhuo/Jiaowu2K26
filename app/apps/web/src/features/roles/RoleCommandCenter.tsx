import {
  ArrowRight24Regular,
  BranchFork24Regular,
  Briefcase24Regular,
  CheckmarkCircle24Filled,
  City24Regular,
  DataBarVertical24Regular,
  Database24Regular,
  DocumentSearch24Regular,
  HatGraduation24Regular,
  Home24Regular,
  Info24Regular,
  Person24Regular,
  PersonFeedback24Regular,
  ShieldCheckmark24Regular,
  ShieldKeyhole24Regular,
  Sparkle24Regular,
  TargetArrow24Regular,
  Trophy24Regular,
  Warning24Regular,
} from "@fluentui/react-icons";
import { ROLE_FIXTURE } from "./fixture";
import type {
  RoleDestination,
  RoleIconKey,
  RoleId,
  RoleProfile,
} from "./types";
import "./rolecommand.css";

const ROLE_ICON_COMPONENTS: Record<
  RoleIconKey,
  typeof Home24Regular
> = {
  home: Home24Regular,
  course: HatGraduation24Regular,
  mirror: Database24Regular,
  roster: BranchFork24Regular,
  exam: Trophy24Regular,
  performance: DataBarVertical24Regular,
  opportunity: Briefcase24Regular,
  scouting: PersonFeedback24Regular,
  campus: City24Regular,
  pass: ShieldKeyhole24Regular,
  evidence: DocumentSearch24Regular,
  people: Person24Regular,
  policy: ShieldCheckmark24Regular,
  action: TargetArrow24Regular,
};

export const getRoleIconComponent = (icon: RoleIconKey) =>
  ROLE_ICON_COMPONENTS[icon];

type RoleCommandCenterProps = {
  profile: RoleProfile;
  traditional: boolean;
  onNavigate: (destination: RoleDestination) => void;
};

export function RoleCommandCenter({
  profile,
  traditional,
  onNavigate,
}: RoleCommandCenterProps) {
  const modeLabel = traditional ? profile.formalRole : profile.gameMode;

  return (
    <main
      className={`role-command-stage role-accent--${profile.accent}`}
      aria-labelledby="page-heading"
    >
      <div className="role-command-layout">
        <section className="role-command-hero">
          <div className="role-command-hero__scan" aria-hidden="true" />
          <div className="role-command-kicker">
            <span>{modeLabel}</span>
            <em>当前视角 · 演示</em>
          </div>
          <div className="role-command-identity">
            <Person24Regular aria-hidden="true" />
            <span>
              <strong>{profile.displayName}</strong>
              <small>{profile.identityLine}</small>
            </span>
          </div>
          <h1 id="page-heading">{profile.headline}</h1>
          <p>{profile.briefing}</p>

          <aside className="role-command-note" aria-label="本角色今日提示">
            <Sparkle24Regular aria-hidden="true" />
            <span>
              <small>SIDELINE NOTE · 今日战术板</small>
              <strong>{profile.coachNote}</strong>
            </span>
            <em>演示赛档</em>
          </aside>

          <button
            id="primary-action"
            className="role-command-primary"
            type="button"
            onClick={() => onNavigate(profile.primaryDestination)}
            data-focusable="true"
            data-default-focus="true"
          >
            <span>
              <small>下一回合</small>
              <strong>{profile.primaryActionLabel}</strong>
            </span>
            <ArrowRight24Regular aria-hidden="true" />
          </button>
        </section>

        <section
          className="role-priority-board"
          aria-labelledby="priority-heading"
        >
          <div className="role-section-heading">
            <span>
              <small>01 · PRIORITY BOARD</small>
              <h2 id="priority-heading">现在先做什么</h2>
            </span>
            <b>{profile.priorities.length} 项</b>
          </div>
          <div className="role-priority-list">
            {profile.priorities.map((priority, index) => {
              const Icon = getRoleIconComponent(priority.icon);
              return (
                <button
                  className="role-priority-row"
                  type="button"
                  key={priority.id}
                  onClick={() => onNavigate(priority.destination)}
                  data-focusable="true"
                >
                  <span className="role-priority-index">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <Icon aria-hidden="true" />
                  <span className="role-priority-copy">
                    <small>{priority.kicker}</small>
                    <strong>{priority.title}</strong>
                    <span>{priority.detail}</span>
                    <em>{priority.sourceLabel}</em>
                  </span>
                  <span className="role-priority-state">
                    {priority.status}
                    <ArrowRight24Regular aria-hidden="true" />
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        <section className="role-scoreboard" aria-labelledby="scoreboard-heading">
          <div className="role-section-heading">
            <span>
              <small>02 · ROLE BOX SCORE</small>
              <h2 id="scoreboard-heading">只看工作进度，不给人打总评</h2>
            </span>
            <b>演示</b>
          </div>
          <div className="role-metric-grid">
            {profile.metrics.map((metric) => (
              <article
                className={`role-metric role-metric--${metric.tone}`}
                key={metric.label}
              >
                <span>{metric.label}</span>
                <strong>{metric.value}</strong>
                <small>{metric.detail}</small>
              </article>
            ))}
          </div>
        </section>

        <section className="role-workflow" aria-labelledby="workflow-heading">
          <div className="role-section-heading">
            <span>
              <small>03 · SHARED GAME LOOP</small>
              <h2 id="workflow-heading">一件事怎样在五个角色之间接力</h2>
            </span>
          </div>
          <ol>
            {ROLE_FIXTURE.workflow.map((step, index) => (
              <li key={step}>
                {index < 2 ? (
                  <CheckmarkCircle24Filled aria-hidden="true" />
                ) : (
                  <TargetArrow24Regular aria-hidden="true" />
                )}
                <span>{step}</span>
              </li>
            ))}
          </ol>
          <p>
            换角色会改变任务和能看到的范围；资料出处、修改记录、申诉入口和最终责任人不会跟着变。
          </p>
        </section>

        <section className="role-scope-board" aria-labelledby="scope-heading">
          <div className="role-section-heading">
            <span>
              <small>04 · PURPOSE-BOUND ACCESS</small>
              <h2 id="scope-heading">当前角色的数据边界</h2>
            </span>
            <Info24Regular aria-hidden="true" />
          </div>
          <div className="role-scope-columns">
            <div>
              <strong>
                <ShieldCheckmark24Regular aria-hidden="true" />
                可以查看
              </strong>
              <ul>
                {profile.visibleScope.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
            <div>
              <strong>
                <Warning24Regular aria-hidden="true" />
                不应查看或决定
              </strong>
              <ul>
                {profile.prohibitedScope.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </div>
          <small>
            当前只是在演示角色分工。正式版会由学校账号确认身份，并按职责、用途和时限开放权限。
          </small>
        </section>
      </div>
    </main>
  );
}

type RoleSwitcherPanelProps = {
  activeRole: RoleId;
  onSelect: (roleId: RoleId) => void;
};

export function RoleSwitcherPanel({
  activeRole,
  onSelect,
}: RoleSwitcherPanelProps) {
  return (
    <div className="role-login">
      <div className="role-login__boundary">
        <ShieldCheckmark24Regular aria-hidden="true" />
        <div>
          <strong>先换个位置看看</strong>
          <p>
            五个角色各有自己的任务和可见范围。这里不用学校账号；正式版会重新登录并核对权限。
          </p>
        </div>
      </div>

      <div className="role-login__grid" aria-label="体验角色选择">
        {ROLE_FIXTURE.profiles.map((profile) => {
          const active = profile.id === activeRole;
          const firstIcon = profile.navigation[0]?.icon ?? "people";
          const Icon = getRoleIconComponent(firstIcon);
          return (
            <button
              className={`role-login-card role-login-card--${profile.accent} ${
                active ? "is-active" : ""
              }`}
              type="button"
              key={profile.id}
              aria-pressed={active}
              onClick={() => onSelect(profile.id)}
              data-focusable="true"
            >
              <span className="role-login-card__icon">
                <Icon aria-hidden="true" />
              </span>
              <span className="role-login-card__copy">
                <small>{profile.gameMode}</small>
                <strong>{profile.formalRole}</strong>
                <span>{profile.displayName}</span>
                <p>{profile.roleSummary}</p>
                <em>{profile.organization}</em>
              </span>
              <span className="role-login-card__action">
                {active ? "正在体验" : "切到这个视角"}
                <ArrowRight24Regular aria-hidden="true" />
              </span>
            </button>
          );
        })}
      </div>

      <div className="role-login__rules">
        <div>
          <CheckmarkCircle24Filled aria-hidden="true" />
          <span>同一设计系统与输入模型</span>
        </div>
        <div>
          <DocumentSearch24Regular aria-hidden="true" />
          <span>建议都能回看依据和修改记录</span>
        </div>
        <div>
          <ShieldCheckmark24Regular aria-hidden="true" />
          <span>正式决定仍由责任人完成</span>
        </div>
      </div>
    </div>
  );
}

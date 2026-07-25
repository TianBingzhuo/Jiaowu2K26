import { useEffect, useState } from "react";
import {
  ArrowRight24Regular,
  BranchFork24Regular,
  CheckmarkCircle24Filled,
  DocumentSearch24Regular,
  LockClosed24Regular,
  Sparkle24Regular,
} from "@fluentui/react-icons";
import {
  getAiStatus,
  getDevelopmentProfile,
  requestAiAdvice,
  type AiAdvice,
  type AiGatewayStatus,
  type DevelopmentProfile,
} from "../../lib/api";
import "./development-path.css";

const CAREER_TRACKS = [
  {
    id: "robotics-systems",
    label: "机器人系统软件",
    onetCode: "17-2199.08",
    sourceUrl: "https://www.onetonline.org/link/details/17-2199.08",
    focus: "传感信号、机器人程序调试、软硬件集成与系统验证",
  },
  {
    id: "scientific-software",
    label: "科学计算与平台软件",
    onetCode: "15-1252.00",
    sourceUrl: "https://www.onetonline.org/link/details/15-1252.00",
    focus: "数学分析、跨平台软件、数据系统与工程可靠性",
  },
  {
    id: "data-ai-science",
    label: "数据与 AI 科学",
    onetCode: "15-2051.00",
    sourceUrl: "https://www.onetonline.org/link/details/15-2051.00",
    focus: "科学数据、建模、机器学习与可解释结果表达",
  },
  {
    id: "physics-research",
    label: "物理与 AI4Science",
    onetCode: "19-2012.00",
    sourceUrl: "https://www.onetonline.org/link/details/19-2012.00",
    focus: "物理现象研究、实验设计、理论建模与研究软件",
  },
] as const;

type CareerTrackId = (typeof CAREER_TRACKS)[number]["id"];

export function DevelopmentPathCard() {
  const [profile, setProfile] = useState<DevelopmentProfile | null>(null);
  const [gateway, setGateway] = useState<AiGatewayStatus | null>(null);
  const [consent, setConsent] = useState(false);
  const [advice, setAdvice] = useState<AiAdvice | null>(null);
  const [selectedTrackId, setSelectedTrackId] = useState<CareerTrackId>(
    CAREER_TRACKS[0].id,
  );
  const [state, setState] = useState<"loading" | "ready" | "running" | "error">(
    "loading",
  );

  useEffect(() => {
    let active = true;
    Promise.all([getDevelopmentProfile(), getAiStatus()])
      .then(([nextProfile, nextGateway]) => {
        if (!active) return;
        setProfile(nextProfile);
        setGateway(nextGateway);
        setState("ready");
      })
      .catch(() => {
        if (active) setState("error");
      });
    return () => {
      active = false;
    };
  }, []);

  const runAdvice = async () => {
    if (!profile?.configured) return;
    if (gateway?.configured && !consent) return;
    setState("running");
    try {
      const evidence = [
        ...profile.verified_experience.slice(0, 4),
        ...profile.learning_now.slice(0, 3),
      ];
      const selectedTrack =
        CAREER_TRACKS.find((track) => track.id === selectedTrackId) ??
        CAREER_TRACKS[0];
      const result = await requestAiAdvice({
        task: "career_path",
        subject: `${profile.display_alias ?? "本人"} · ${selectedTrack.label}探索路线`,
        question: `请严格区分已核验经历与正在学习，对照 ${selectedTrack.label} 的公开职业任务，提出两个两周内可验证、可回滚的跨学科实验；说明证据缺口，不做职业定论。`,
        locale: "zh-CN",
        facts: [
          {
            label: `职业方向 · ${selectedTrack.label}`,
            value: `${selectedTrack.focus}；O*NET-SOC ${selectedTrack.onetCode}`,
            source_id: `onet:${selectedTrack.onetCode}:2026`,
          },
          ...evidence.map((item) => ({
            label: item.label,
            value: item.detail,
            source_id: item.source_id,
          })),
        ],
      });
      setAdvice(result);
      setState("ready");
    } catch {
      setState("error");
    }
  };

  if (state === "loading") {
    return (
      <section className="development-path-card" aria-busy="true">
        <Sparkle24Regular aria-hidden="true" />
        <strong>正在载入本地发展档案…</strong>
      </section>
    );
  }

  if (state === "error" || !profile?.configured) {
    return (
      <section className="development-path-card development-path-card--empty">
        <LockClosed24Regular aria-hidden="true" />
        <div>
          <span>PRIVATE CAREER LOADOUT</span>
          <strong>本地私有发展档案未连接</strong>
          <small>
            {profile?.source_boundary ??
              "个人发展资料暂时没接上；这里不会拿公开演示数据冒充你的真实经历。"}
          </small>
        </div>
      </section>
    );
  }

  return (
    <section className="development-path-card" aria-labelledby="development-path-heading">
      <header>
        <div>
          <span>PRIVATE CAREER LOADOUT · LOCAL ONLY</span>
          <h2 id="development-path-heading">
            {profile.display_alias} 的证据驱动发展路径
          </h2>
          <p>{profile.source_boundary}</p>
        </div>
        <LockClosed24Regular aria-hidden="true" />
      </header>

      <div className="development-path-columns">
        <section>
          <h3><CheckmarkCircle24Filled aria-hidden="true" /> 已核验经历</h3>
          <ul>
            {profile.verified_experience.slice(0, 4).map((item) => (
              <li key={item.source_id}>
                <strong>{item.label}</strong>
                <span>{item.detail}</span>
                <code>{item.source_id}</code>
              </li>
            ))}
          </ul>
        </section>
        <section>
          <h3><BranchFork24Regular aria-hidden="true" /> 正在学习</h3>
          <ul>
            {profile.learning_now.map((item) => (
              <li key={item.source_id}>
                <strong>{item.label}</strong>
                <span>{item.detail}</span>
                <code>{item.source_id}</code>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <div className="development-path-goals">
        <DocumentSearch24Regular aria-hidden="true" />
        <div>
          <span>GOAL CARDS</span>
          {profile.goals.map((goal) => <p key={goal}>{goal}</p>)}
        </div>
      </div>

      <section className="development-path-tracks" aria-labelledby="career-track-heading">
        <header>
          <div>
            <span>CAREER SELECT // PUBLIC TAXONOMY</span>
            <h3 id="career-track-heading">先选一条路线做两周试训</h3>
          </div>
          <small>来源：O*NET 2026 · 不是职位录取预测</small>
        </header>
        <div role="radiogroup" aria-label="职业探索方向">
          {CAREER_TRACKS.map((track) => (
            <button
              type="button"
              role="radio"
              aria-checked={selectedTrackId === track.id}
              className={selectedTrackId === track.id ? "is-selected" : ""}
              key={track.id}
              onClick={() => {
                setSelectedTrackId(track.id);
                setAdvice(null);
              }}
              data-focusable="true"
            >
              <strong>{track.label}</strong>
              <span>{track.focus}</span>
              <small>O*NET-SOC {track.onetCode}</small>
            </button>
          ))}
        </div>
        <a
          href={
            CAREER_TRACKS.find((track) => track.id === selectedTrackId)
              ?.sourceUrl
          }
          target="_blank"
          rel="noreferrer"
          data-focusable="true"
        >
          查看所选方向的公开职业任务与技能来源
          <ArrowRight24Regular aria-hidden="true" />
        </a>
      </section>

      {gateway?.configured && (
        <label className="development-path-consent">
          <input
            type="checkbox"
            checked={consent}
            onChange={(event) => setConsent(event.target.checked)}
          />
          <span>
            我同意本次把上方最多 7 条去标识事实发送给
            {gateway.provider} / {gateway.model}；密钥不离开服务端环境。
          </span>
        </label>
      )}

      <button
        className="development-path-ai"
        type="button"
        onClick={runAdvice}
        disabled={state === "running" || Boolean(gateway?.configured && !consent)}
        data-focusable="true"
      >
        <Sparkle24Regular aria-hidden="true" />
        {state === "running"
          ? "正在生成并核验来源…"
          : gateway?.configured
            ? "用 AI 生成所选方向的两周试训"
            : "用本地方案生成方向试训"}
        <ArrowRight24Regular aria-hidden="true" />
      </button>

      {advice && (
        <div className="development-path-advice" aria-live="polite">
          <span>
            {advice.mode === "model" ? "AI 建议" : "本地备选"} ·{" "}
            {advice.provider}/{advice.model}
          </span>
          <h3>{advice.title}</h3>
          <p>{advice.summary}</p>
          <ol>
            {advice.suggestions.map((suggestion) => (
              <li key={`${suggestion.title}-${suggestion.next_step}`}>
                <strong>{suggestion.title}</strong>
                <span>{suggestion.next_step}</span>
              </li>
            ))}
          </ol>
          <small>{advice.caveats.join(" · ")}</small>
        </div>
      )}
    </section>
  );
}

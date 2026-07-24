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

export function DevelopmentPathCard() {
  const [profile, setProfile] = useState<DevelopmentProfile | null>(null);
  const [gateway, setGateway] = useState<AiGatewayStatus | null>(null);
  const [consent, setConsent] = useState(false);
  const [advice, setAdvice] = useState<AiAdvice | null>(null);
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
      const result = await requestAiAdvice({
        task: "career_path",
        subject: `${profile.display_alias ?? "本人"}的下一阶段发展路径`,
        question:
          "请严格区分已核验经历与正在学习，提出两个两周内可验证、可回滚的下一步，不做职业定论。",
        locale: "zh-CN",
        facts: evidence.map((item) => ({
          label: item.label,
          value: item.detail,
          source_id: item.source_id,
        })),
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
              "API 不可用；不会用公开 Fixture 冒充你的真实经历。"}
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
            ? "用模型生成两周验证路线"
            : "用规则回退生成两周验证路线"}
        <ArrowRight24Regular aria-hidden="true" />
      </button>

      {advice && (
        <div className="development-path-advice" aria-live="polite">
          <span>
            {advice.mode === "model" ? "MODEL OUTPUT" : "RULES FALLBACK"} ·{" "}
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

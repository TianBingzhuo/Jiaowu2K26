import { useEffect, useState } from "react";
import {
  Bot24Regular,
  CheckmarkCircle24Filled,
  Info24Regular,
  Play24Filled,
  ShieldCheckmark24Regular,
  Warning24Regular,
} from "@fluentui/react-icons";
import {
  getAiStatus,
  requestAiAdvice,
  type AiAdvice,
  type AiFact,
  type AiGatewayStatus,
  type AiTask,
} from "../../lib/api";
import "./source-bound-coach.css";

type SourceBoundCoachProps = {
  task: AiTask;
  eyebrow: string;
  title: string;
  subject: string;
  question: string;
  facts: AiFact[];
  disabled?: boolean;
  consentRequired?: boolean;
  boundary: string;
  actionLabel?: string;
};

export function SourceBoundCoach({
  task,
  eyebrow,
  title,
  subject,
  question,
  facts,
  disabled = false,
  consentRequired = true,
  boundary,
  actionLabel = "生成下一回合建议",
}: SourceBoundCoachProps) {
  const [gateway, setGateway] = useState<AiGatewayStatus | null>(null);
  const [status, setStatus] = useState<
    "checking" | "ready" | "running" | "error"
  >("checking");
  const [consented, setConsented] = useState(!consentRequired);
  const [advice, setAdvice] = useState<AiAdvice | null>(null);
  const [message, setMessage] = useState("正在看看 AI 助手是否在线。");

  useEffect(() => {
    let active = true;
    getAiStatus()
      .then((next) => {
        if (!active) return;
        setGateway(next);
        setStatus("ready");
        setMessage(
          next.configured
            ? `${next.provider} / ${next.model} 已就位。本次只会发送下方列出的资料。`
            : "当前没有可用模型；仍可用本地规则整理下一步。",
        );
      })
      .catch(() => {
        if (!active) return;
        setStatus("error");
        setMessage("AI 助手暂时没接上。这里不会拿模板冒充模型回答。");
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    setAdvice(null);
  }, [task, subject, question, facts]);

  const run = async () => {
    if (disabled || facts.length === 0) return;
    if (consentRequired && !consented) {
      setMessage("先确认这次可以发送哪些资料，再让 AI 开始。");
      return;
    }
    setStatus("running");
    setMessage("AI 正在读这几条资料，不会翻你的其他档案。");
    try {
      const next = await requestAiAdvice({
        task,
        subject,
        question,
        locale: "zh-CN",
        facts,
      });
      setAdvice(next);
      setStatus("ready");
      setMessage(
        next.mode === "model"
          ? "建议回来了。先看依据，再决定要不要采用。"
          : "模型这回没上场；下面是本地规则整理出的备选方案。",
      );
    } catch {
      setStatus("error");
      setMessage("这次没有拿到回答，也没有用模板顶替。可以稍后再试。");
    }
  };

  const actionDisabled =
    disabled ||
    facts.length === 0 ||
    status === "checking" ||
    status === "running" ||
    Boolean(consentRequired && !consented);

  return (
    <section className="source-bound-coach" aria-labelledby={`${task}-coach-title`}>
      <header>
        <div>
          <span>{eyebrow}</span>
          <h2 id={`${task}-coach-title`}>{title}</h2>
        </div>
        <b className={gateway?.configured ? "is-model" : "is-rules"}>
          <Bot24Regular aria-hidden="true" />
          {gateway?.configured ? "AI 在线" : "本地方案"}
        </b>
      </header>

      <p className="source-bound-coach__boundary">
        <ShieldCheckmark24Regular aria-hidden="true" />
        {boundary}
      </p>

      <div className="source-bound-coach__facts">
        {facts.map((fact) => (
          <article key={fact.source_id}>
            <span>{fact.label}</span>
            <strong>{fact.value}</strong>
            <small>依据已关联</small>
          </article>
        ))}
      </div>

      {consentRequired && (
        <label className="source-bound-coach__consent">
          <input
            type="checkbox"
            checked={consented}
            onChange={(event) => setConsented(event.target.checked)}
          />
          <span>
            我同意仅在这一次，把上方资料发送给{" "}
            {gateway?.configured
              ? `${gateway.provider} / ${gateway.model}`
              : "本机规则（不会发到外部）"}
            。密钥不会进入浏览器。
          </span>
        </label>
      )}

      <div className="source-bound-coach__command">
        <button type="button" disabled={actionDisabled} onClick={run}>
          <Play24Filled aria-hidden="true" />
          {status === "running" ? "正在解析…" : actionLabel}
        </button>
        <span role="status" aria-live="polite">
          {status === "error" ? (
            <Warning24Regular aria-hidden="true" />
          ) : advice ? (
            <CheckmarkCircle24Filled aria-hidden="true" />
          ) : (
            <Info24Regular aria-hidden="true" />
          )}
          {message}
        </span>
      </div>

      {advice && (
        <div className="source-bound-coach__result">
          <header>
            <div>
              <span>{advice.mode === "model" ? "AI 建议" : "本地备选"}</span>
              <h3>{advice.title}</h3>
            </div>
            <b>还需要你确认</b>
          </header>
          <p>{advice.summary}</p>
          <div>
            {advice.suggestions.map((suggestion) => (
              <article key={`${suggestion.title}-${suggestion.next_step}`}>
                <strong>{suggestion.title}</strong>
                <p>{suggestion.rationale}</p>
                <span>下一步 · {suggestion.next_step}</span>
                <small>{suggestion.source_ids.length} 条依据可回看</small>
              </article>
            ))}
          </div>
          <ul>
            {advice.caveats.map((caveat) => (
              <li key={caveat}>{caveat}</li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}

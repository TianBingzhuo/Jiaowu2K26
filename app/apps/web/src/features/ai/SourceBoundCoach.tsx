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
}: SourceBoundCoachProps) {
  const [gateway, setGateway] = useState<AiGatewayStatus | null>(null);
  const [status, setStatus] = useState<
    "checking" | "ready" | "running" | "error"
  >("checking");
  const [consented, setConsented] = useState(!consentRequired);
  const [advice, setAdvice] = useState<AiAdvice | null>(null);
  const [message, setMessage] = useState("正在核对 AI 通路与回退状态。");

  useEffect(() => {
    let active = true;
    getAiStatus()
      .then((next) => {
        if (!active) return;
        setGateway(next);
        setStatus("ready");
        setMessage(
          next.configured
            ? `已配置 ${next.provider} / ${next.model}（尚未以本次请求证明可用）；只发送下方列出的来源事实。`
            : "未配置模型；运行时将由服务端明确返回规则回退。",
        );
      })
      .catch(() => {
        if (!active) return;
        setStatus("error");
        setMessage("AI API 当前不可用；本组件不会在浏览器里伪造模型结果。");
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
      setMessage("请先确认本次允许发送的脱敏事实范围。");
      return;
    }
    setStatus("running");
    setMessage("正在生成来源约束建议；格式失败或服务中断会明确回退。");
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
          ? "模型建议已返回；它仍不是正式决定。"
          : "模型未被使用；当前结果是服务端规则回退。",
      );
    } catch {
      setStatus("error");
      setMessage("AI 请求未完成；没有生成或缓存假结果，请稍后重试。");
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
          {gateway?.configured ? "MODEL CONFIGURED" : "RULES READY"}
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
            <small>{fact.source_id}</small>
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
            仅本次允许把上方脱敏事实发送到{" "}
            {gateway?.configured
              ? `${gateway.provider} / ${gateway.model}`
              : "本机规则回退（当前不会出站）"}
            ；密钥不进入浏览器，规则回退也会保持来源引用。
          </span>
        </label>
      )}

      <div className="source-bound-coach__command">
        <button type="button" disabled={actionDisabled} onClick={run}>
          <Play24Filled aria-hidden="true" />
          {status === "running" ? "正在解析…" : "生成下一回合建议"}
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
              <span>{advice.mode === "model" ? "MODEL" : "RULES FALLBACK"}</span>
              <h3>{advice.title}</h3>
            </div>
            <b>FORMAL DECISION · NO</b>
          </header>
          <p>{advice.summary}</p>
          <div>
            {advice.suggestions.map((suggestion) => (
              <article key={`${suggestion.title}-${suggestion.next_step}`}>
                <strong>{suggestion.title}</strong>
                <p>{suggestion.rationale}</p>
                <span>NEXT MOVE // {suggestion.next_step}</span>
                <small>{suggestion.source_ids.join(" · ")}</small>
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

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Accessibility24Regular,
  ArrowRight24Regular,
  ArrowSync24Regular,
  BookOpen24Regular,
  Building24Regular,
  CalendarLtr24Regular,
  CheckmarkCircle24Filled,
  DataBarVertical24Regular,
  DataTrending24Regular,
  Dismiss24Regular,
  DocumentSearch24Regular,
  HatGraduation24Regular,
  Home24Regular,
  Info24Regular,
  LockClosed24Regular,
  Person24Regular,
  Play24Filled,
  PlugDisconnected24Regular,
  QuestionCircle24Regular,
  Settings24Regular,
  ShieldCheckmark24Regular,
  TargetArrow24Regular,
  Trophy24Regular,
  Warning24Regular,
} from "@fluentui/react-icons";

const NAV_ITEMS = [
  { id: "schedule", label: "我的赛程", icon: Home24Regular },
  { id: "courses", label: "课程与考试", icon: HatGraduation24Regular },
  { id: "campus", label: "校园生活", icon: Building24Regular },
  { id: "career", label: "生涯数据", icon: DataBarVertical24Regular },
];

const EVIDENCE_ITEMS = [
  {
    title: "赛程来源",
    value: "BST 授权演示 Fixture",
    detail: "Fixture ID · bst-phys240-2026s-demo",
  },
  {
    title: "当前权威级别",
    value: "演示数据 · 非学校正式记录",
    detail: "不会写入成绩、选课或学籍系统",
  },
  {
    title: "更新时间",
    value: "2026-07-23 10:30 CST",
    detail: "本模板使用固定时间，便于重复验收",
  },
  {
    title: "使用范围",
    value: "P0-00-D0 首页模板",
    detail: "只验证视觉、输入、状态与构建链",
  },
];

const DEFAULT_STAGES = ["预习回顾", "难点突破", "综合演练", "模拟测试"];
const TRADITIONAL_STAGES = ["复习课程材料", "练习薄弱知识", "完成综合练习", "参加模拟测试"];
const INPUT_PRESENTATION = {
  gamepad: {
    label: "手柄",
    confirm: "A",
    details: "X",
    back: "B",
  },
  keyboard: {
    label: "键盘",
    confirm: "Enter",
    details: "E",
    back: "Esc",
  },
  mouse: {
    label: "鼠标",
    confirm: "左键",
    details: "左键",
    back: "左键",
  },
  touch: {
    label: "触屏",
    confirm: "轻触",
    details: "轻触",
    back: "轻触",
  },
};

function usePrefersReducedMotion() {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setMatches(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  return matches;
}

function KeyHint({ tone, children }) {
  const wide = String(children).length > 1;
  return (
    <span
      className={[
        "key-hint",
        `key-hint--${tone}`,
        wide ? "key-hint--wide" : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </span>
  );
}

export function App() {
  const [panel, setPanel] = useState(null);
  const [actionState, setActionState] = useState("idle");
  const [offline, setOffline] = useState(false);
  const [simulateError, setSimulateError] = useState(false);
  const [traditional, setTraditional] = useState(false);
  const [reduceMotionOverride, setReduceMotionOverride] = useState(false);
  const [controllerConnected, setControllerConnected] = useState(false);
  const [lastInput, setLastInput] = useState("keyboard");
  const [toast, setToast] = useState("");

  const panelRef = useRef(null);
  const lastFocusRef = useRef(null);
  const actionTimerRef = useRef(null);
  const toastTimerRef = useRef(null);
  const handlersRef = useRef({});
  const previousButtonsRef = useRef([]);
  const lastAxisMoveRef = useRef(0);

  const systemReducedMotion = usePrefersReducedMotion();
  const reducedMotion = systemReducedMotion || reduceMotionOverride;
  const stages = traditional ? TRADITIONAL_STAGES : DEFAULT_STAGES;
  const inputPresentation =
    INPUT_PRESENTATION[lastInput] ?? INPUT_PRESENTATION.keyboard;

  const copy = useMemo(
    () =>
      traditional
        ? {
            eyebrow: "今日学习任务",
            headline: "PHYS 240 · 期末复习",
            action: "继续学习计划",
            progress: "学期学习进度",
            mode: "传统叙事",
          }
        : {
            eyebrow: "今日赛程",
            headline: "PHYS 240 · 期末备战",
            action: "继续今日赛程",
            progress: "赛季进度",
            mode: "MYCAREER",
          },
    [traditional],
  );

  const showToast = (message) => {
    window.clearTimeout(toastTimerRef.current);
    setToast(message);
    toastTimerRef.current = window.setTimeout(() => setToast(""), 2600);
  };

  const getFocusable = () => {
    const scope = panel ? panelRef.current : document;
    if (!scope) return [];

    return Array.from(scope.querySelectorAll('[data-focusable="true"]')).filter(
      (element) =>
        !element.disabled &&
        element.getAttribute("aria-hidden") !== "true" &&
        element.getClientRects().length > 0,
    );
  };

  const moveFocus = (step) => {
    const focusable = getFocusable();
    if (!focusable.length) return;

    const currentIndex = focusable.indexOf(document.activeElement);
    const nextIndex =
      currentIndex < 0
        ? 0
        : (currentIndex + step + focusable.length) % focusable.length;
    focusable[nextIndex].focus();
  };

  const closePanel = () => {
    if (!panel) return;
    setPanel(null);
    window.setTimeout(() => lastFocusRef.current?.focus?.(), 0);
  };

  const openPanel = (nextPanel) => {
    lastFocusRef.current = document.activeElement;
    setPanel(nextPanel);
  };

  const activateFocused = () => {
    if (document.activeElement instanceof HTMLButtonElement) {
      document.activeElement.click();
    }
  };

  const runPrimaryAction = () => {
    if (actionState === "loading") return;

    window.clearTimeout(actionTimerRef.current);
    setActionState("loading");

    actionTimerRef.current = window.setTimeout(() => {
      if (simulateError) {
        setActionState("error");
        showToast("赛程加载失败，已保留当前页面与焦点。");
        return;
      }

      setActionState("ready");
      showToast(
        offline
          ? "已从 10:30 缓存载入演示赛程。"
          : "赛程已准备：综合演练。",
      );
    }, reducedMotion ? 80 : 850);
  };

  const handleNav = (item) => {
    if (item.id === "schedule") return;
    showToast(`${item.label}将在首页模板通过后进入独立切片。`);
  };

  handlersRef.current = {
    moveFocus,
    activateFocused,
    openEvidence: () => openPanel("evidence"),
    openHelp: () => openPanel("settings"),
    closePanel,
  };

  useEffect(() => {
    if (!panel) return;
    const first = panelRef.current?.querySelector('[data-focusable="true"]');
    first?.focus();
  }, [panel]);

  useEffect(() => {
    const onKeyDown = (event) => {
      setLastInput("keyboard");

      if (event.key === "Escape") {
        event.preventDefault();
        handlersRef.current.closePanel();
        return;
      }

      if (event.key === "ArrowDown" || event.key === "ArrowRight") {
        event.preventDefault();
        handlersRef.current.moveFocus(1);
        return;
      }

      if (event.key === "ArrowUp" || event.key === "ArrowLeft") {
        event.preventDefault();
        handlersRef.current.moveFocus(-1);
        return;
      }

      if (event.key.toLowerCase() === "e") {
        event.preventDefault();
        handlersRef.current.openEvidence();
        return;
      }

      if (event.key === "?") {
        event.preventDefault();
        handlersRef.current.openHelp();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    const onPointerDown = (event) => {
      setLastInput(event.pointerType === "touch" ? "touch" : "mouse");
    };

    window.addEventListener("pointerdown", onPointerDown, { passive: true });
    return () => window.removeEventListener("pointerdown", onPointerDown);
  }, []);

  useEffect(() => {
    let frame = 0;

    const updateConnectedState = () => {
      const connected = Array.from(navigator.getGamepads?.() ?? []).some(Boolean);
      setControllerConnected(connected);
    };

    const pollGamepad = () => {
      const gamepad = Array.from(navigator.getGamepads?.() ?? []).find(Boolean);

      if (gamepad) {
        setControllerConnected(true);
        const currentButtons = gamepad.buttons.map((button) => button.pressed);
        const justPressed = (index) =>
          currentButtons[index] && !previousButtonsRef.current[index];

        if (justPressed(12) || justPressed(14)) {
          setLastInput("gamepad");
          handlersRef.current.moveFocus(-1);
        }
        if (justPressed(13) || justPressed(15)) {
          setLastInput("gamepad");
          handlersRef.current.moveFocus(1);
        }
        if (justPressed(0)) {
          setLastInput("gamepad");
          handlersRef.current.activateFocused();
        }
        if (justPressed(1)) {
          setLastInput("gamepad");
          handlersRef.current.closePanel();
        }
        if (justPressed(2)) {
          setLastInput("gamepad");
          handlersRef.current.openEvidence();
        }
        if (justPressed(9)) {
          setLastInput("gamepad");
          handlersRef.current.openHelp();
        }

        const axisX = gamepad.axes[0] ?? 0;
        const axisY = gamepad.axes[1] ?? 0;
        const now = performance.now();
        if (
          now - lastAxisMoveRef.current > 190 &&
          (Math.abs(axisX) > 0.65 || Math.abs(axisY) > 0.65)
        ) {
          setLastInput("gamepad");
          handlersRef.current.moveFocus(
            axisX < -0.65 || axisY < -0.65 ? -1 : 1,
          );
          lastAxisMoveRef.current = now;
        }

        previousButtonsRef.current = currentButtons;
      } else {
        setControllerConnected(false);
        previousButtonsRef.current = [];
      }

      frame = window.requestAnimationFrame(pollGamepad);
    };

    window.addEventListener("gamepadconnected", updateConnectedState);
    window.addEventListener("gamepaddisconnected", updateConnectedState);
    updateConnectedState();
    frame = window.requestAnimationFrame(pollGamepad);

    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("gamepadconnected", updateConnectedState);
      window.removeEventListener("gamepaddisconnected", updateConnectedState);
    };
  }, []);

  useEffect(
    () => () => {
      window.clearTimeout(actionTimerRef.current);
      window.clearTimeout(toastTimerRef.current);
    },
    [],
  );

  return (
    <div
      className={[
        "game-shell",
        offline ? "is-offline" : "",
        traditional ? "is-traditional" : "",
        reducedMotion ? "is-reduced-motion" : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <a className="skip-link" href="#primary-action">
        跳到主要行动
      </a>

      <div className="scene-background" aria-hidden="true" />

      {offline && (
        <div className="offline-banner" role="status">
          <PlugDisconnected24Regular aria-hidden="true" />
          离线模式 · 使用截至 10:30 的演示缓存
        </div>
      )}

      <header className="topbar">
        <div className="wordmark" aria-label="JIAOWU2K26">
          <span>JIAOWU</span>
          <strong>2K26</strong>
        </div>
        <span className="role-divider" aria-hidden="true" />
        <div className="role-name">{copy.mode}</div>

        <div className="status-cluster">
          <div className="status-chip">
            <CalendarLtr24Regular aria-hidden="true" />
            <span>2026 春季赛季</span>
          </div>
          <div className="status-chip status-chip--fixture">
            <DataTrending24Regular aria-hidden="true" />
            <span>演示数据 · 更新于 10:30</span>
          </div>
          <button
            className="top-action"
            type="button"
            onClick={() => openPanel("evidence")}
            data-focusable="true"
          >
            <DocumentSearch24Regular aria-hidden="true" />
            查看依据
          </button>
          <button
            className="icon-action"
            type="button"
            aria-label="打开体验设置"
            onClick={() => openPanel("settings")}
            data-focusable="true"
          >
            <Settings24Regular aria-hidden="true" />
          </button>
        </div>
      </header>

      <aside className="navigation-rail" aria-label="主要导航">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const active = item.id === "schedule";
          return (
            <button
              key={item.id}
              className={`nav-item ${active ? "is-active" : ""}`}
              type="button"
              aria-current={active ? "page" : undefined}
              onClick={() => handleNav(item)}
              data-focusable="true"
            >
              <Icon aria-hidden="true" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </aside>

      <main className="career-stage" aria-labelledby="page-heading">
        <section className="briefing-panel">
          <div className="section-kicker">
            <span aria-hidden="true" />
            {copy.eyebrow}
          </div>
          <div className="identity-line">
            <Person24Regular aria-hidden="true" />
            学生 · MyCareer · 2026 春季赛季
          </div>
          <h1 id="page-heading">{copy.headline}</h1>

          <ol className="stage-track" aria-label="今日任务进度">
            {stages.map((stage, index) => {
              const complete = index < 2;
              const current = index === 2;
              const Icon = complete
                ? CheckmarkCircle24Filled
                : current
                  ? TargetArrow24Regular
                  : LockClosed24Regular;

              return (
                <li
                  key={stage}
                  className={[
                    complete ? "is-complete" : "",
                    current ? "is-current" : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                >
                  <Icon aria-hidden="true" />
                  <span>{stage}</span>
                  {current && <small>当前</small>}
                </li>
              );
            })}
          </ol>

          <button
            id="primary-action"
            className={`primary-action primary-action--${actionState}`}
            type="button"
            onClick={runPrimaryAction}
            disabled={actionState === "loading"}
            data-focusable="true"
          >
            <span>
              {actionState === "loading"
                ? "正在载入今日赛程"
                : actionState === "ready"
                  ? traditional
                    ? "进入综合练习"
                    : "进入综合演练"
                  : copy.action}
            </span>
            {actionState === "loading" ? (
              <ArrowSync24Regular className="loading-icon" aria-hidden="true" />
            ) : actionState === "ready" ? (
              <Play24Filled aria-hidden="true" />
            ) : (
              <ArrowRight24Regular aria-hidden="true" />
            )}
          </button>

          {actionState === "error" && (
            <div className="action-error" role="alert">
              <Warning24Regular aria-hidden="true" />
              <div>
                <strong>无法载入演示赛程</strong>
                <span>模拟错误已开启；你的焦点和当前页面均已保留。</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setActionState("idle");
                  showToast("已恢复，可再次验证主要行动。");
                }}
                data-focusable="true"
              >
                恢复
              </button>
            </div>
          )}
        </section>

        <section className="progress-panel" aria-labelledby="progress-heading">
          <div className="progress-heading-row">
            <div>
              <span className="panel-label">SEASON BOX SCORE</span>
              <h2 id="progress-heading">{copy.progress}</h2>
            </div>
            <span className="fixture-badge">
              <Info24Regular aria-hidden="true" />
              Fixture
            </span>
          </div>

          <div className="stats-grid">
            <div className="stat">
              <BookOpen24Regular aria-hidden="true" />
              <span>课程进度</span>
              <strong>68%</strong>
              <div
                className="meter"
                role="progressbar"
                aria-label="课程进度"
                aria-valuemin="0"
                aria-valuemax="100"
                aria-valuenow="68"
              >
                <span style={{ width: "68%" }} />
              </div>
            </div>
            <div className="stat">
              <TargetArrow24Regular aria-hidden="true" />
              <span>目标达成</span>
              <strong>4 / 6</strong>
              <div
                className="meter"
                role="progressbar"
                aria-label="目标达成"
                aria-valuemin="0"
                aria-valuemax="6"
                aria-valuenow="4"
              >
                <span style={{ width: "66.7%" }} />
              </div>
            </div>
            <div className="stat">
              <Trophy24Regular aria-hidden="true" />
              <span>荣誉里程碑</span>
              <strong>2</strong>
              <div className="milestone-dots" aria-label="两个已完成里程碑">
                <span className="is-earned" />
                <span className="is-earned" />
                <span />
              </div>
            </div>
            <div className="stat">
              <ShieldCheckmark24Regular aria-hidden="true" />
              <span>生涯等级</span>
              <strong>Lv. 12</strong>
              <div
                className="meter"
                role="progressbar"
                aria-label="生涯等级进度"
                aria-valuemin="0"
                aria-valuemax="100"
                aria-valuenow="72"
              >
                <span style={{ width: "72%" }} />
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="controller-bar" aria-label="操作提示">
        <button
          type="button"
          onClick={runPrimaryAction}
          data-focusable="true"
          aria-label="执行主要行动"
        >
          <KeyHint tone="confirm">{inputPresentation.confirm}</KeyHint>
          确认
        </button>
        <button
          type="button"
          onClick={() => openPanel("evidence")}
          data-focusable="true"
        >
          <KeyHint tone="details">{inputPresentation.details}</KeyHint>
          依据
        </button>
        <button
          type="button"
          onClick={closePanel}
          data-focusable="true"
        >
          <KeyHint tone="back">{inputPresentation.back}</KeyHint>
          返回
        </button>
        <button
          type="button"
          onClick={() => openPanel("settings")}
          data-focusable="true"
        >
          <QuestionCircle24Regular aria-hidden="true" />
          控制
        </button>
        <span className="input-status" role="status">
          {controllerConnected
            ? `标准手柄已连接 · 当前输入：${inputPresentation.label}`
            : `当前输入：${inputPresentation.label} · 手柄为可选输入`}
        </span>
      </footer>

      {panel && (
        <>
          <button
            className="drawer-backdrop"
            type="button"
            aria-label="关闭侧栏"
            onClick={closePanel}
          />
          <aside
            className="drawer"
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="drawer-heading"
          >
            <div className="drawer-header">
              <div>
                <span className="panel-label">
                  {panel === "evidence" ? "EVIDENCE" : "CONTROL CENTER"}
                </span>
                <h2 id="drawer-heading">
                  {panel === "evidence" ? "依据与数据状态" : "体验设置"}
                </h2>
              </div>
              <button
                className="icon-action"
                type="button"
                aria-label="关闭"
                onClick={closePanel}
                data-focusable="true"
              >
                <Dismiss24Regular aria-hidden="true" />
              </button>
            </div>

            {panel === "evidence" ? (
              <div className="evidence-list">
                <div className="evidence-callout">
                  <DocumentSearch24Regular aria-hidden="true" />
                  <p>
                    这是一组明确标注的演示数据，不代表学校实时成绩、选课或学籍记录。
                  </p>
                </div>
                {EVIDENCE_ITEMS.map((item) => (
                  <article key={item.title} className="evidence-item">
                    <span>{item.title}</span>
                    <strong>{item.value}</strong>
                    <small>{item.detail}</small>
                  </article>
                ))}
                <button
                  className="drawer-primary"
                  type="button"
                  onClick={() => {
                    closePanel();
                    showToast("依据已查看，焦点已返回原位置。");
                  }}
                  data-focusable="true"
                >
                  <ShieldCheckmark24Regular aria-hidden="true" />
                  我已了解数据边界
                </button>
              </div>
            ) : (
              <div className="settings-list">
                <p className="settings-intro">
                  这些开关用于现场验证降级状态，不会保存，也不会修改正式系统。
                </p>
                <button
                  className="setting-row"
                  type="button"
                  role="switch"
                  aria-checked={offline}
                  onClick={() => {
                    setOffline((value) => !value);
                    setActionState("idle");
                  }}
                  data-focusable="true"
                >
                  <PlugDisconnected24Regular aria-hidden="true" />
                  <span>
                    <strong>离线模式</strong>
                    <small>验证缓存标识与可用操作</small>
                  </span>
                  <b>{offline ? "开启" : "关闭"}</b>
                </button>
                <button
                  className="setting-row"
                  type="button"
                  role="switch"
                  aria-checked={simulateError}
                  onClick={() => {
                    setSimulateError((value) => !value);
                    setActionState("idle");
                  }}
                  data-focusable="true"
                >
                  <Warning24Regular aria-hidden="true" />
                  <span>
                    <strong>模拟加载错误</strong>
                    <small>下一次主要行动进入可恢复错误态</small>
                  </span>
                  <b>{simulateError ? "开启" : "关闭"}</b>
                </button>
                <button
                  className="setting-row"
                  type="button"
                  role="switch"
                  aria-checked={traditional}
                  onClick={() => setTraditional((value) => !value)}
                  data-focusable="true"
                >
                  <Accessibility24Regular aria-hidden="true" />
                  <span>
                    <strong>传统叙事</strong>
                    <small>保留信息，只移除赛事隐喻</small>
                  </span>
                  <b>{traditional ? "开启" : "关闭"}</b>
                </button>
                <button
                  className="setting-row"
                  type="button"
                  role="switch"
                  aria-checked={reducedMotion}
                  onClick={() => setReduceMotionOverride((value) => !value)}
                  data-focusable="true"
                >
                  <ArrowSync24Regular aria-hidden="true" />
                  <span>
                    <strong>减少动效</strong>
                    <small>
                      {systemReducedMotion
                        ? "系统偏好已启用"
                        : "关闭非必要动画与过渡"}
                    </small>
                  </span>
                  <b>{reducedMotion ? "开启" : "关闭"}</b>
                </button>
                <div className="control-guide">
                  <strong>手柄 / 键盘 / 鼠标 / 触屏</strong>
                  <span>方向键或 D-pad：移动焦点</span>
                  <span>Enter / A：确认</span>
                  <span>E / X：依据</span>
                  <span>Esc / B：返回</span>
                  <span>? / Menu：控制中心</span>
                  <span>鼠标或触屏：直接选择可见控件</span>
                </div>
              </div>
            )}
          </aside>
        </>
      )}

      {toast && (
        <div className="toast" role="status">
          <CheckmarkCircle24Filled aria-hidden="true" />
          {toast}
        </div>
      )}
    </div>
  );
}

import { lazy, Suspense, useEffect, useMemo, useRef, useState } from "react";
import type { PointerEvent as ReactPointerEvent, ReactNode } from "react";
import {
  Accessibility24Regular,
  ArrowRight24Regular,
  ArrowSync24Regular,
  BranchFork24Regular,
  Briefcase24Regular,
  BookOpen24Regular,
  CalendarLtr24Regular,
  CheckmarkCircle24Filled,
  City24Regular,
  DataBarVertical24Regular,
  DataTrending24Regular,
  Database24Regular,
  Dismiss24Regular,
  DocumentSearch24Regular,
  HatGraduation24Regular,
  Home24Regular,
  Info24Regular,
  LockClosed24Regular,
  Person24Regular,
  PersonFeedback24Regular,
  Play24Filled,
  PlugDisconnected24Regular,
  QuestionCircle24Regular,
  Settings24Regular,
  ShieldCheckmark24Regular,
  ShieldKeyhole24Regular,
  Sparkle24Regular,
  TargetArrow24Regular,
  Trophy24Regular,
  Warning24Regular,
} from "@fluentui/react-icons";
import { DEMO_SEASON, HERO_COURSE } from "./data/demoSeason";
import {
  SUBJECT_CATALOG,
  SUBJECT_CATALOG_SUMMARY,
  SUBJECT_CATEGORIES,
} from "./data/subjectCatalog";
import { checkBackend } from "./lib/api";
import type { BackendStatus } from "./lib/api";
import {
  directionFromGamepad,
  getFocusableElements,
  isEditableTarget,
  moveSpatialFocus,
  type FocusDirection,
} from "./lib/spatialNavigation";
import type { SmartCourseEntryPoint } from "./features/smartcourse/engine";
import { CourseDetail } from "./features/mycareer/CourseDetail";
import { SeasonSideboard } from "./features/mycareer/SeasonSideboard";
import { DevelopmentPathCard } from "./features/mycareer/DevelopmentPathCard";
import {
  COURSE_ROLE_LABEL,
  COURSE_STATUS_LABEL,
} from "./features/mycareer/engine";
import {
  RoleCommandCenter,
  RoleSwitcherPanel,
  getRoleIconComponent,
} from "./features/roles/RoleCommandCenter";
import {
  getRoleProfile,
  persistRole,
  readStoredRole,
} from "./features/roles/engine";
import type {
  InstitutionalWorkspaceView,
  RoleDestination,
  RoleExperience,
  RoleId,
} from "./features/roles/types";
import type { InstitutionalRole } from "./features/institutional/types";
import { BilingualEventHud } from "./i18n/BilingualEventHud";
import type { ExperienceKey } from "./i18n/catalog";

const SmartCourseStudio = lazy(() =>
  import("./features/smartcourse/SmartCourseStudio").then((module) => ({
    default: module.SmartCourseStudio,
  })),
);
const WorldExamStudio = lazy(() =>
  import("./features/worldexam/WorldExamStudio").then((module) => ({
    default: module.WorldExamStudio,
  })),
);
const RosterLabStudio = lazy(() =>
  import("./features/rosterlab/RosterLabStudio").then((module) => ({
    default: module.RosterLabStudio,
  })),
);
const AcademicMirrorStudio = lazy(() =>
  import("./features/academicmirror/AcademicMirrorStudio").then((module) => ({
    default: module.AcademicMirrorStudio,
  })),
);
const PerformanceCenterStudio = lazy(() =>
  import("./features/performancecenter/PerformanceCenterStudio").then(
    (module) => ({
      default: module.PerformanceCenterStudio,
    }),
  ),
);
const OpportunityMarketStudio = lazy(() =>
  import("./features/opportunitymarket/OpportunityMarketStudio").then(
    (module) => ({
      default: module.OpportunityMarketStudio,
    }),
  ),
);
const CoachScoutingStudio = lazy(() =>
  import("./features/coachscouting/CoachScoutingStudio").then((module) => ({
    default: module.CoachScoutingStudio,
  })),
);
const CampusLifeStudio = lazy(() =>
  import("./features/campuslife/CampusLifeStudio").then((module) => ({
    default: module.CampusLifeStudio,
  })),
);
const CampusPassStudio = lazy(() =>
  import("./features/campuspass/CampusPassStudio").then((module) => ({
    default: module.CampusPassStudio,
  })),
);
const InstitutionalStudio = lazy(() =>
  import("./features/institutional/InstitutionalStudio").then((module) => ({
    default: module.InstitutionalStudio,
  })),
);

type Panel = "evidence" | "settings" | "courses" | "roles" | "workspace" | null;
type Experience = ExperienceKey;
type AppRoute = {
  experience: Experience;
  panel: Panel;
};
type UniversityHistoryState = {
  university2k26: true;
  depth: number;
  route: AppRoute;
  rootGuard?: boolean;
};
type ActionState = "idle" | "loading" | "ready" | "error";
type InputKind = "gamepad" | "keyboard" | "mouse" | "touch";
type ControllerSummary = {
  mapping: "standard" | "raw";
  buttonCount: number;
  axisCount: number;
  lastDirection: FocusDirection | null;
};
type ActionHandlers = {
  moveFocus: (direction: FocusDirection) => boolean;
  activateFocused: () => void;
  openEvidence: () => void;
  openHelp: () => void;
  closePanel: () => void;
};

const EXPERIENCE_IDS: Experience[] = [
  "career",
  "smartcourse",
  "worldexam",
  "rosterlab",
  "academicmirror",
  "performancecenter",
  "opportunitymarket",
  "coachscouting",
  "campuslife",
  "campuspass",
];
const PANEL_IDS: Exclude<Panel, null>[] = [
  "evidence",
  "settings",
  "courses",
  "roles",
  "workspace",
];

const routeToHash = ({ experience, panel }: AppRoute) =>
  `#/${experience}${panel ? `/${panel}` : ""}`;

const readAppRoute = (): AppRoute => {
  const [experienceToken, panelToken] = window.location.hash
    .replace(/^#\/?/, "")
    .split("/");
  const experience = EXPERIENCE_IDS.includes(experienceToken as Experience)
    ? (experienceToken as Experience)
    : "career";
  const panel =
    experience === "career" &&
    PANEL_IDS.includes(panelToken as Exclude<Panel, null>)
      ? (panelToken as Exclude<Panel, null>)
      : null;
  return { experience, panel };
};

const EVIDENCE_ITEMS = [
  {
    title: "课程摘要来源",
    value: "已审核的本地课程索引",
    detail: HERO_COURSE.sourceRef,
  },
  {
    title: "当前权威级别",
    value: "演示数据 · 非学校正式记录",
    detail: "不会写入成绩、选课、消费或学籍系统",
  },
  {
    title: "更新时间",
    value: "2026-07-24 10:30 CST",
    detail: "固定 Demo 时间，便于多人重复验收",
  },
  {
    title: "使用范围",
    value: "University2K26 V0.9",
    detail: DEMO_SEASON.sourceBoundary,
  },
];

const DEFAULT_STAGES = ["预习回顾", "难点突破", "综合演练", "模拟测试"];
const TRADITIONAL_STAGES = ["复习课程材料", "练习薄弱知识", "完成综合练习", "参加模拟测试"];
const DAILY_COACH_NOTES = [
  "先把模型边界看清，再决定这一球用解析、仿真还是实测。",
  "今天不用把整本书赢下来：先拿下一个可解释、可回放的小回合。",
  "遇到三条波形不一致，先问条件差在哪，再问是谁算错了。",
  "复习不是把答案背熟，而是让下一次选择更有依据。",
  "卡住不是判负：打开来源、换条路径，再打一回合。",
];
const INPUT_PRESENTATION: Record<
  InputKind,
  { label: string; confirm: string; details: string; back: string }
> = {
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
const GAMEPAD_DIRECTION_LABEL: Record<FocusDirection, string> = {
  up: "上",
  down: "下",
  left: "左",
  right: "右",
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

function useCountUp(
  target: number,
  reducedMotion: boolean,
  delay = 0,
  duration = 680,
) {
  const [value, setValue] = useState(reducedMotion ? target : 0);

  useEffect(() => {
    if (reducedMotion) {
      setValue(target);
      return;
    }

    let frame = 0;
    let startedAt = 0;
    const timeout = window.setTimeout(() => {
      const tick = (time: number) => {
        if (startedAt === 0) startedAt = time;
        const progress = Math.min((time - startedAt) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        setValue(Math.round(target * eased));

        if (progress < 1) {
          frame = window.requestAnimationFrame(tick);
        }
      };

      frame = window.requestAnimationFrame(tick);
    }, delay);

    return () => {
      window.clearTimeout(timeout);
      window.cancelAnimationFrame(frame);
    };
  }, [delay, duration, reducedMotion, target]);

  return value;
}

function KeyHint({
  tone,
  children,
}: {
  tone: "confirm" | "details" | "back";
  children: ReactNode;
}) {
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

function FeatureLoading({ label }: { label: string }) {
  return (
    <main className="feature-loading" aria-live="polite" aria-busy="true">
      <DataTrending24Regular aria-hidden="true" />
      <strong>正在载入 {label}</strong>
      <span>模块代码按需加载；来源与 Fixture 边界不会改变。</span>
    </main>
  );
}

export function App() {
  const initialRoute = useMemo(readAppRoute, []);
  const [activeRole, setActiveRole] = useState<RoleId>(() => {
    try {
      return readStoredRole(window.localStorage);
    } catch {
      return "student";
    }
  });
  const [experience, setExperience] = useState<Experience>(
    initialRoute.experience,
  );
  const [smartCourseEntry, setSmartCourseEntry] =
    useState<SmartCourseEntryPoint>("authoring");
  const [, setInstitutionalView] =
    useState<InstitutionalWorkspaceView>("case_desk");
  const [panel, setPanel] = useState<Panel>(initialRoute.panel);
  const [selectedCourseId, setSelectedCourseId] = useState(
    DEMO_SEASON.heroCourseId,
  );
  const [catalogExpanded, setCatalogExpanded] = useState(false);
  const [actionState, setActionState] = useState<ActionState>("idle");
  const [offline, setOffline] = useState(false);
  const [simulateError, setSimulateError] = useState(false);
  const [traditional, setTraditional] = useState(false);
  const [reduceMotionOverride, setReduceMotionOverride] = useState(false);
  const [controllerConnected, setControllerConnected] = useState(false);
  const [controllerSummary, setControllerSummary] =
    useState<ControllerSummary | null>(null);
  const [lastInput, setLastInput] = useState<InputKind>("keyboard");
  const [toast, setToast] = useState("");
  const [backend, setBackend] = useState<BackendStatus>({
    state: "checking",
    label: "连接检查中",
    detail: "正在确认 /api/v1 健康合同。",
  });

  const panelRef = useRef<HTMLElement | null>(null);
  const shellRef = useRef<HTMLDivElement | null>(null);
  const lastFocusRef = useRef<HTMLElement | null>(null);
  const actionTimerRef = useRef<number | null>(null);
  const toastTimerRef = useRef<number | null>(null);
  const perspectiveFrameRef = useRef<number | null>(null);
  const handlersRef = useRef<ActionHandlers>({
    moveFocus: () => false,
    activateFocused: () => undefined,
    openEvidence: () => undefined,
    openHelp: () => undefined,
    closePanel: () => undefined,
  });
  const previousButtonsRef = useRef<boolean[]>([]);
  const heldDirectionRef = useRef<FocusDirection | null>(null);
  const directionStartedAtRef = useRef(0);
  const lastDirectionMoveRef = useRef(0);
  const controllerProfileRef = useRef("");
  const routeDepthRef = useRef(0);

  const systemReducedMotion = usePrefersReducedMotion();
  const reducedMotion = systemReducedMotion || reduceMotionOverride;
  const activeProfile = useMemo(
    () => getRoleProfile(activeRole),
    [activeRole],
  );
  const courseProgressDisplay = useCountUp(
    DEMO_SEASON.progress.courseProgress,
    reducedMotion,
    310,
  );
  const completedGoalsDisplay = useCountUp(
    DEMO_SEASON.progress.completedGoals,
    reducedMotion,
    390,
    520,
  );
  const milestonesDisplay = useCountUp(
    DEMO_SEASON.progress.milestones,
    reducedMotion,
    470,
    480,
  );
  const careerLevelDisplay = useCountUp(
    DEMO_SEASON.progress.careerLevel,
    reducedMotion,
    550,
    560,
  );
  const stages = traditional ? TRADITIONAL_STAGES : DEFAULT_STAGES;
  const inputPresentation =
    INPUT_PRESENTATION[lastInput] ?? INPUT_PRESENTATION.keyboard;
  const selectedCourse =
    DEMO_SEASON.courses.find((course) => course.id === selectedCourseId) ??
    HERO_COURSE;
  const dailyCoachNote = useMemo(() => {
    const dayKey = new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Shanghai",
    }).format(new Date());
    const index =
      Array.from(dayKey).reduce(
        (total, character) => total + character.charCodeAt(0),
        0,
      ) % DAILY_COACH_NOTES.length;
    return DAILY_COACH_NOTES[index];
  }, []);

  const copy = useMemo(
    () =>
      traditional
        ? {
            eyebrow: "今日学习任务",
            headline: `${HERO_COURSE.title} · 期末复习`,
            action: "继续学习计划",
            progress: "学期学习进度",
            mode: "传统叙事",
          }
        : {
            eyebrow: "今日赛程",
            headline: `${HERO_COURSE.title} · 期末备战`,
            action: "继续今日赛程",
            progress: "赛季进度",
            mode: "MYCAREER",
          },
    [traditional],
  );

  const showToast = (message: string) => {
    if (toastTimerRef.current !== null) {
      window.clearTimeout(toastTimerRef.current);
    }
    setToast(message);
    toastTimerRef.current = window.setTimeout(() => setToast(""), 2600);
  };

  const applyRoute = (
    route: AppRoute,
    mode: "push" | "replace" = "push",
  ) => {
    const nextDepth =
      mode === "push" ? routeDepthRef.current + 1 : routeDepthRef.current;
    const state = {
      university2k26: true,
      depth: nextDepth,
      route,
    };
    if (mode === "push") {
      window.history.pushState(state, "", routeToHash(route));
    } else {
      window.history.replaceState(state, "", routeToHash(route));
    }
    routeDepthRef.current = nextDepth;
    setExperience(route.experience);
    setPanel(route.panel);
  };

  const navigateToExperience = (nextExperience: Experience) => {
    // A drawer is an intermediate route. Replacing it avoids a surprising
    // "back to the open drawer" hop after launching a full-screen module.
    applyRoute(
      { experience: nextExperience, panel: null },
      panel ? "replace" : "push",
    );
  };

  const returnWithinApp = () => {
    setActionState("ready");
    if (routeDepthRef.current > 0) {
      window.history.back();
      return;
    }
    applyRoute({ experience: "career", panel: null }, "replace");
  };

  const updateScenePerspective = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (reducedMotion || event.pointerType === "touch" || !shellRef.current) {
      return;
    }

    const shell = shellRef.current;
    const rect = shell.getBoundingClientRect();
    const normalizedX = (event.clientX - rect.left) / rect.width - 0.5;
    const normalizedY = (event.clientY - rect.top) / rect.height - 0.5;

    if (perspectiveFrameRef.current !== null) {
      window.cancelAnimationFrame(perspectiveFrameRef.current);
    }

    perspectiveFrameRef.current = window.requestAnimationFrame(() => {
      shell.style.setProperty("--scene-x", `${(-normalizedX * 10).toFixed(2)}px`);
      shell.style.setProperty("--scene-y", `${(-normalizedY * 7).toFixed(2)}px`);
      shell.style.setProperty("--scene-tilt", `${(normalizedX * 0.12).toFixed(3)}deg`);
    });
  };

  const resetScenePerspective = () => {
    if (!shellRef.current) return;
    shellRef.current.style.setProperty("--scene-x", "0px");
    shellRef.current.style.setProperty("--scene-y", "0px");
    shellRef.current.style.setProperty("--scene-tilt", "0deg");
  };

  useEffect(() => {
    if (reducedMotion) {
      resetScenePerspective();
    }
  }, [reducedMotion]);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [experience]);

  const getFocusable = (): HTMLElement[] => {
    const modal = document.querySelector<HTMLElement>('[aria-modal="true"]');
    const scope = panel ? panelRef.current : (modal ?? document);
    if (!scope) return [];

    return getFocusableElements(scope);
  };

  const moveFocus = (direction: FocusDirection) => {
    return moveSpatialFocus(getFocusable(), direction);
  };

  const closePanel = () => {
    if (!panel) return false;
    if (routeDepthRef.current > 0) {
      window.history.back();
    } else {
      applyRoute({ experience: "career", panel: null }, "replace");
    }
    window.setTimeout(() => lastFocusRef.current?.focus?.(), 0);
    return true;
  };

  const openPanel = (nextPanel: Exclude<Panel, null>) => {
    lastFocusRef.current = document.activeElement as HTMLElement | null;
    if (panel === nextPanel) return;
    applyRoute({ experience: "career", panel: nextPanel });
  };

  const activateFocused = () => {
    if (document.activeElement instanceof HTMLButtonElement) {
      document.activeElement.click();
    } else if (
      document.activeElement instanceof HTMLInputElement ||
      document.activeElement instanceof HTMLSelectElement
    ) {
      document.activeElement.focus();
      document.activeElement.click();
    }
  };

  const runPrimaryAction = () => {
    if (actionState === "loading") return;
    if (actionState === "ready") {
      setSmartCourseEntry("student");
      navigateToExperience("smartcourse");
      return;
    }

    if (actionTimerRef.current !== null) {
      window.clearTimeout(actionTimerRef.current);
    }
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
          : `${HERO_COURSE.title}赛程已准备：综合演练。`,
      );
    }, reducedMotion ? 80 : 850);
  };

  const openSmartCourse = (entryPoint: SmartCourseEntryPoint) => {
    setSmartCourseEntry(entryPoint);
    navigateToExperience("smartcourse");
    setActionState("ready");
  };

  const openWorldExam = () => {
    navigateToExperience("worldexam");
    setActionState("ready");
  };

  const openRosterLab = () => {
    navigateToExperience("rosterlab");
    setActionState("ready");
  };

  const openAcademicMirror = () => {
    navigateToExperience("academicmirror");
    setActionState("ready");
  };

  const openPerformanceCenter = () => {
    navigateToExperience("performancecenter");
    setActionState("ready");
  };

  const openOpportunityMarket = () => {
    navigateToExperience("opportunitymarket");
    setActionState("ready");
  };

  const openCoachScouting = () => {
    navigateToExperience("coachscouting");
    setActionState("ready");
  };

  const openCampusLife = () => {
    navigateToExperience("campuslife");
    setActionState("ready");
  };

  const openCampusPass = () => {
    navigateToExperience("campuspass");
    setActionState("ready");
  };

  const navigateToDestination = (destination: RoleDestination) => {
    if (destination.type === "home") {
      if (experience !== "career" || panel) {
        applyRoute({ experience: "career", panel: null }, panel ? "replace" : "push");
      }
      return;
    }

    if (destination.type === "panel") {
      openPanel(destination.panel);
      return;
    }

    if (destination.type === "planned") {
      showToast(`${destination.label}已进入路线图，本轮保持为诚实的 Vision 入口。`);
      return;
    }

    if (destination.type === "workspace") {
      if (activeRole === "student") {
        showToast("学生角色没有机构工作台权限。");
        return;
      }
      setInstitutionalView(destination.view);
      openPanel("workspace");
      setActionState("ready");
      return;
    }

    if (
      destination.experience === "smartcourse" &&
      destination.smartCourseEntry
    ) {
      setSmartCourseEntry(destination.smartCourseEntry);
    }
    navigateToExperience(destination.experience);
    setActionState("ready");
  };

  const runCurrentPrimaryAction = () => {
    if (activeRole === "student") {
      runPrimaryAction();
      return;
    }
    navigateToDestination(activeProfile.primaryDestination);
  };

  const handleNav = (
    item: (typeof activeProfile.navigation)[number],
  ) => {
    navigateToDestination(item.destination);
  };

  const selectDemoRole = (roleId: RoleId) => {
    try {
      persistRole(roleId, window.localStorage);
    } catch {
      // Storage can be unavailable in hardened private browsing. The current
      // session still changes role; the UI does not pretend it persisted.
    }
    const nextProfile = getRoleProfile(roleId);
    setActiveRole(roleId);
    setActionState("idle");
    applyRoute({ experience: "career", panel: null }, "replace");
    showToast(`已进入 ${nextProfile.formalRole} Demo 身份；正式权限仍需学校 SSO。`);
    window.setTimeout(() => lastFocusRef.current?.focus?.(), 0);
  };

  handlersRef.current = {
    moveFocus,
    activateFocused,
    openEvidence: () => {
      if (experience === "career") openPanel("evidence");
    },
    openHelp: () => openPanel("settings"),
    closePanel: () => {
      if (panel) {
        closePanel();
      } else if (
        experience === "smartcourse" ||
        experience === "worldexam" ||
        experience === "rosterlab" ||
        experience === "academicmirror" ||
        experience === "performancecenter" ||
        experience === "opportunitymarket" ||
        experience === "coachscouting" ||
        experience === "campuslife" ||
        experience === "campuspass"
      ) {
        returnWithinApp();
      }
    },
  };

  useEffect(() => {
    const route = readAppRoute();
    const currentState = window.history.state as
      | Partial<UniversityHistoryState>
      | null;
    const rootRoute: AppRoute = { experience: "career", panel: null };
    const rootGuardState: UniversityHistoryState = {
      university2k26: true,
      depth: 0,
      route: rootRoute,
      rootGuard: true,
    };
    const activeRootState: UniversityHistoryState = {
      university2k26: true,
      depth: 0,
      route: rootRoute,
    };

    if (
      currentState?.university2k26 &&
      typeof currentState.depth === "number"
    ) {
      // A reload or Vite hot update keeps the history entry that already
      // belongs to the app. Replacing it here would erase the real route
      // depth and make the browser Back button leave University2K26 early.
      routeDepthRef.current = Math.max(0, currentState.depth);
    } else if (route.experience !== "career" || route.panel !== null) {
      // Direct module links receive a root guard and an active MyCareer entry.
      // Their first Back returns to MyCareer; a later Back reaches the guard
      // and explains that the next one will leave the local demo.
      window.history.replaceState(rootGuardState, "", routeToHash(rootRoute));
      window.history.pushState(activeRootState, "", routeToHash(rootRoute));
      window.history.pushState(
        {
          university2k26: true,
          depth: 1,
          route,
        },
        "",
        routeToHash(route),
      );
      routeDepthRef.current = 1;
    } else {
      // Keep one same-document entry behind the active root. This turns an
      // accidental Back at MyCareer into visible feedback instead of an
      // unexplained jump to about:blank or the previous website.
      window.history.replaceState(rootGuardState, "", routeToHash(rootRoute));
      window.history.pushState(activeRootState, "", routeToHash(rootRoute));
      routeDepthRef.current = 0;
    }

    const onPopState = (event: PopStateEvent) => {
      const nextRoute = readAppRoute();
      const state = event.state as
        | Partial<UniversityHistoryState>
        | null;
      routeDepthRef.current =
        state?.university2k26 && typeof state.depth === "number"
          ? Math.max(0, state.depth)
          : 0;
      setExperience(nextRoute.experience);
      setPanel(nextRoute.panel);
      window.setTimeout(() => {
        if (nextRoute.panel) {
          panelRef.current
            ?.querySelector<HTMLElement>('[data-focusable="true"]')
            ?.focus();
        } else {
          lastFocusRef.current?.focus?.();
        }
      }, 0);
      if (state?.university2k26 && state.rootGuard) {
        showToast("已到当前角色首页；再次返回将离开 University2K26。");
      }
    };

    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  useEffect(() => {
    document.documentElement.dataset.inputMode = lastInput;
    return () => {
      delete document.documentElement.dataset.inputMode;
    };
  }, [lastInput]);

  useEffect(() => {
    document.documentElement.dataset.role = activeRole;
    return () => {
      delete document.documentElement.dataset.role;
    };
  }, [activeRole]);

  useEffect(() => {
    const controller = new AbortController();
    void checkBackend(controller.signal)
      .then(setBackend)
      .catch((error: unknown) => {
        if (!(error instanceof DOMException && error.name === "AbortError")) {
          setBackend({
            state: "fallback",
            label: "本地 Fixture",
            detail: "API 检查异常；演示继续使用只读 Fixture。",
          });
        }
      });
    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (!panel) return;
    const first =
      panelRef.current?.querySelector<HTMLElement>('[data-focusable="true"]');
    first?.focus();
  }, [panel]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      setLastInput("keyboard");

      if (event.key === "Escape") {
        event.preventDefault();
        handlersRef.current.closePanel();
        return;
      }

      const directionByKey: Partial<Record<string, FocusDirection>> = {
        ArrowUp: "up",
        ArrowDown: "down",
        ArrowLeft: "left",
        ArrowRight: "right",
      };
      const direction = directionByKey[event.key];
      if (direction && !isEditableTarget(event.target)) {
        if (handlersRef.current.moveFocus(direction)) {
          event.preventDefault();
        }
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
    const onPointerDown = (event: PointerEvent) => {
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
      const gamepad = Array.from(navigator.getGamepads?.() ?? []).find(
        (item): item is Gamepad => item !== null,
      );

      if (gamepad) {
        setControllerConnected(true);
        const currentButtons = gamepad.buttons.map(
          (button) => button.pressed || button.value >= 0.5,
        );
        const justPressed = (index: number) =>
          currentButtons[index] && !previousButtonsRef.current[index];
        const now = performance.now();
        const direction = directionFromGamepad(gamepad);
        const mapping = gamepad.mapping === "standard" ? "standard" : "raw";
        const profile = `${mapping}:${gamepad.buttons.length}:${gamepad.axes.length}`;
        if (controllerProfileRef.current !== profile) {
          controllerProfileRef.current = profile;
          setControllerSummary({
            mapping,
            buttonCount: gamepad.buttons.length,
            axisCount: gamepad.axes.length,
            lastDirection: null,
          });
        }

        if (direction) {
          const changed = heldDirectionRef.current !== direction;
          const repeatReady =
            !changed &&
            now - directionStartedAtRef.current >= 280 &&
            now - lastDirectionMoveRef.current >= 120;
          if (changed || repeatReady) {
            setLastInput("gamepad");
            handlersRef.current.moveFocus(direction);
            lastDirectionMoveRef.current = now;
          }
          if (changed) {
            heldDirectionRef.current = direction;
            directionStartedAtRef.current = now;
            setControllerSummary((current) =>
              current
                ? { ...current, lastDirection: direction }
                : {
                    mapping,
                    buttonCount: gamepad.buttons.length,
                    axisCount: gamepad.axes.length,
                    lastDirection: direction,
                  },
            );
          }
        } else {
          heldDirectionRef.current = null;
          directionStartedAtRef.current = 0;
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

        previousButtonsRef.current = currentButtons;
      } else {
        setControllerConnected(false);
        setControllerSummary(null);
        controllerProfileRef.current = "";
        previousButtonsRef.current = [];
        heldDirectionRef.current = null;
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
      if (actionTimerRef.current !== null) {
        window.clearTimeout(actionTimerRef.current);
      }
      if (toastTimerRef.current !== null) {
        window.clearTimeout(toastTimerRef.current);
      }
      if (perspectiveFrameRef.current !== null) {
        window.cancelAnimationFrame(perspectiveFrameRef.current);
      }
    },
    [],
  );

  const renderWithBilingualHud = (
    currentExperience: ExperienceKey,
    content: ReactNode,
  ) => (
    <>
      {content}
      <BilingualEventHud
        experience={currentExperience}
        role={activeRole}
      />
    </>
  );

  if (
    experience === "career" &&
    panel === "workspace" &&
    activeRole !== "student"
  ) {
    return renderWithBilingualHud(
      "career",
      <Suspense fallback={<FeatureLoading label="Role Workspace" />}>
        <InstitutionalStudio
          role={activeRole as InstitutionalRole}
          backendLabel={backend.label}
          onExit={returnWithinApp}
        />
      </Suspense>,
    );
  }

  if (experience === "smartcourse") {
    return renderWithBilingualHud(
      "smartcourse",
      <Suspense fallback={<FeatureLoading label="SmartCourse Studio" />}>
        <SmartCourseStudio
          backendLabel={backend.label}
          entryPoint={smartCourseEntry}
          exitLabel={`${activeProfile.formalRole}首页`}
          onExit={returnWithinApp}
        />
      </Suspense>,
    );
  }

  if (experience === "worldexam") {
    return renderWithBilingualHud(
      "worldexam",
      <Suspense fallback={<FeatureLoading label="World Exam Finals" />}>
        <WorldExamStudio
          backendLabel={backend.label}
          onExit={returnWithinApp}
        />
      </Suspense>,
    );
  }

  if (experience === "rosterlab") {
    return renderWithBilingualHud(
      "rosterlab",
      <Suspense fallback={<FeatureLoading label="Roster Lab" />}>
        <RosterLabStudio
          backendLabel={backend.label}
          onExit={returnWithinApp}
        />
      </Suspense>,
    );
  }

  if (experience === "academicmirror") {
    return renderWithBilingualHud(
      "academicmirror",
      <Suspense fallback={<FeatureLoading label="Academic Mirror" />}>
        <AcademicMirrorStudio
          backendLabel={backend.label}
          onExit={returnWithinApp}
        />
      </Suspense>,
    );
  }

  if (experience === "performancecenter") {
    return renderWithBilingualHud(
      "performancecenter",
      <Suspense fallback={<FeatureLoading label="Performance Center" />}>
        <PerformanceCenterStudio
          backendLabel={backend.label}
          onExit={returnWithinApp}
        />
      </Suspense>,
    );
  }

  if (experience === "opportunitymarket") {
    return renderWithBilingualHud(
      "opportunitymarket",
      <Suspense fallback={<FeatureLoading label="Opportunity Market" />}>
        <OpportunityMarketStudio
          backendLabel={backend.label}
          onExit={returnWithinApp}
        />
      </Suspense>,
    );
  }

  if (experience === "coachscouting") {
    return renderWithBilingualHud(
      "coachscouting",
      <Suspense fallback={<FeatureLoading label="Coach & Scouting" />}>
        <CoachScoutingStudio
          backendLabel={backend.label}
          onExit={returnWithinApp}
        />
      </Suspense>,
    );
  }

  if (experience === "campuslife") {
    return renderWithBilingualHud(
      "campuslife",
      <Suspense fallback={<FeatureLoading label="Campus Life Hub" />}>
        <CampusLifeStudio
          backendLabel={backend.label}
          onExit={returnWithinApp}
        />
      </Suspense>,
    );
  }

  if (experience === "campuspass") {
    return renderWithBilingualHud(
      "campuspass",
      <Suspense fallback={<FeatureLoading label="Campus Pass" />}>
        <CampusPassStudio
          backendLabel={backend.label}
          onExit={returnWithinApp}
        />
      </Suspense>,
    );
  }

  return renderWithBilingualHud(
    "career",
    <div
      ref={shellRef}
      className={[
        "game-shell",
        offline ? "is-offline" : "",
        traditional ? "is-traditional" : "",
        reducedMotion ? "is-reduced-motion" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      onPointerMove={updateScenePerspective}
      onPointerLeave={resetScenePerspective}
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
        <div className="wordmark" aria-label="大学2K26 University2K26">
          <span>UNIVERSITY</span>
          <strong>2K26</strong>
        </div>
        <span className="role-divider" aria-hidden="true" />
        <div className="role-name">
          {activeRole === "student"
            ? copy.mode
            : traditional
              ? activeProfile.formalRole
              : activeProfile.gameMode}
        </div>

        <div className="status-cluster">
          <div className="status-chip">
            <CalendarLtr24Regular aria-hidden="true" />
            <span>{activeProfile.periodLabel}</span>
          </div>
          <div
            className={`status-chip status-chip--${backend.state}`}
            title={backend.detail}
          >
            <DataTrending24Regular aria-hidden="true" />
            <span>{backend.label} · Fixture</span>
          </div>
          <button
            className="role-switch-action"
            type="button"
            onClick={() => openPanel("roles")}
            data-focusable="true"
            aria-label={`切换 Demo 角色；当前为${activeProfile.formalRole}`}
          >
            <span className={`role-switch-action__avatar is-${activeProfile.accent}`}>
              <Person24Regular aria-hidden="true" />
            </span>
            <span>
              <small>{activeProfile.shortLabel}</small>
              <strong>切换角色</strong>
            </span>
          </button>
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
        {activeProfile.navigation.map((item) => {
          const Icon = getRoleIconComponent(item.icon);
          const active = item.destination.type === "home";
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

      {activeRole === "student" ? (
        <>
          <main className="career-stage" aria-labelledby="page-heading">
        <section className="briefing-panel">
          <div className="section-kicker">
            <span aria-hidden="true" />
            {copy.eyebrow}
          </div>
          <div className="identity-line">
            <Person24Regular aria-hidden="true" />
            NAN · UNRATED · {HERO_COURSE.code} ·{" "}
            {COURSE_ROLE_LABEL[HERO_COURSE.role]}
          </div>
          <aside className="daily-coach-note" aria-label="今日教练席提示">
            <Sparkle24Regular aria-hidden="true" />
            <span>
              <small>COACH'S NOTE · 今日战术板</small>
              <strong>{dailyCoachNote}</strong>
            </span>
            <em>本地 Fixture</em>
          </aside>
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
            data-default-focus="true"
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
              <strong aria-label={`${DEMO_SEASON.progress.courseProgress}%`}>
                <span aria-hidden="true">{courseProgressDisplay}%</span>
              </strong>
              <div
                className="meter"
                role="progressbar"
                aria-label="课程进度"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={DEMO_SEASON.progress.courseProgress}
              >
                <span
                  style={{ width: `${DEMO_SEASON.progress.courseProgress}%` }}
                />
              </div>
            </div>
            <div className="stat">
              <TargetArrow24Regular aria-hidden="true" />
              <span>目标达成</span>
              <strong
                aria-label={`${DEMO_SEASON.progress.completedGoals} / ${DEMO_SEASON.progress.totalGoals}`}
              >
                <span aria-hidden="true">
                  {completedGoalsDisplay} / {DEMO_SEASON.progress.totalGoals}
                </span>
              </strong>
              <div
                className="meter"
                role="progressbar"
                aria-label="目标达成"
                aria-valuemin={0}
                aria-valuemax={DEMO_SEASON.progress.totalGoals}
                aria-valuenow={DEMO_SEASON.progress.completedGoals}
              >
                <span
                  style={{
                    width: `${
                      (DEMO_SEASON.progress.completedGoals /
                        DEMO_SEASON.progress.totalGoals) *
                      100
                    }%`,
                  }}
                />
              </div>
            </div>
            <div className="stat">
              <Trophy24Regular aria-hidden="true" />
              <span>荣誉里程碑</span>
              <strong aria-label={`${DEMO_SEASON.progress.milestones}`}>
                <span aria-hidden="true">{milestonesDisplay}</span>
              </strong>
              <div className="milestone-dots" aria-label="两个已完成里程碑">
                <span className="is-earned" />
                <span className="is-earned" />
                <span />
              </div>
            </div>
            <div className="stat">
              <ShieldCheckmark24Regular aria-hidden="true" />
              <span>生涯等级</span>
              <strong aria-label={`等级 ${DEMO_SEASON.progress.careerLevel}`}>
                <span aria-hidden="true">Lv. {careerLevelDisplay}</span>
              </strong>
              <div
                className="meter"
                role="progressbar"
                aria-label="生涯等级进度"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={DEMO_SEASON.progress.careerLevelProgress}
              >
                <span
                  style={{
                    width: `${DEMO_SEASON.progress.careerLevelProgress}%`,
                  }}
                />
              </div>
            </div>
          </div>
        </section>
        <DevelopmentPathCard />
          </main>

          <SeasonSideboard
            season={DEMO_SEASON}
            selectedCourseId={selectedCourse.id}
            onSelectCourse={(courseId) => {
              setSelectedCourseId(courseId);
              openPanel("courses");
            }}
          />
        </>
      ) : (
        <RoleCommandCenter
          profile={activeProfile}
          traditional={traditional}
          onNavigate={navigateToDestination}
        />
      )}

      <footer className="controller-bar" aria-label="操作提示">
        <button
          type="button"
          onClick={runCurrentPrimaryAction}
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
            ? `${controllerSummary?.mapping === "standard" ? "标准映射" : "原始映射"}手柄已连接 · 当前输入：${inputPresentation.label}`
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
            className={`drawer ${
              panel === "courses" || panel === "roles" ? "drawer--wide" : ""
            }`}
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="drawer-heading"
          >
            <div className="drawer-header">
              <div>
                <span className="panel-label">
                  {panel === "evidence"
                    ? "EVIDENCE"
                    : panel === "courses"
                      ? "2026 SPRING ROSTER"
                      : panel === "roles"
                        ? "IDENTITY BAY"
                        : "CONTROL CENTER"}
                </span>
                <h2 id="drawer-heading">
                  {panel === "evidence"
                    ? "依据与数据状态"
                    : panel === "courses"
                      ? "Demo 课程阵容"
                      : panel === "roles"
                        ? "选择 Demo 角色"
                        : "体验设置"}
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
                    课程主题可追溯，但人物、进度和建议均为 Fixture；不代表学校实时成绩、选课或学籍记录。
                  </p>
                </div>
                <article className="evidence-item">
                  <span>后端握手</span>
                  <strong>{backend.label}</strong>
                  <small>{backend.detail}</small>
                </article>
                <article className="evidence-item">
                  <span>当前角色 Lens</span>
                  <strong>
                    {activeProfile.formalRole} · {activeProfile.gameMode}
                  </strong>
                  <small>
                    Demo Fixture 权限预览；生产环境必须接学校 SSO，并由服务端重新授权
                  </small>
                </article>
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
            ) : panel === "courses" ? (
              <div className="course-roster">
                <div className="evidence-callout">
                  <HatGraduation24Regular aria-hidden="true" />
                  <p>
                    六门课程来自“已经整理”的课程 README 与索引摘要。点击任一课程切换 Demo
                    分析；不会打开、复制或上传原始课件。
                  </p>
                </div>
                <CourseDetail
                  course={selectedCourse}
                  onOpenWorldExam={openWorldExam}
                  onStartLearning={() => {
                    if (!selectedCourse.linkedPublishedId) {
                      showToast("学习内容准备中；课程详情与进度已保留。");
                      return;
                    }
                    openSmartCourse("student");
                  }}
                  onOpenReplay={() => {
                    if (
                      !selectedCourse.linkedPublishedId ||
                      !selectedCourse.lastSession
                    ) {
                      showToast("尚未开始学习，暂时没有可回放记录。");
                      return;
                    }
                    openSmartCourse("replay");
                  }}
                />
                <section
                  className="course-analysis"
                  key={selectedCourse.id}
                  aria-label={`${selectedCourse.title} Demo 课程分析`}
                  aria-live="polite"
                >
                  <div className="course-analysis__header">
                    <div>
                      <span className="panel-label">COURSE FILM ROOM</span>
                      <h3>{selectedCourse.title}</h3>
                    </div>
                    <span className="fixture-badge">
                      <Info24Regular aria-hidden="true" />
                      Fixture 分析
                    </span>
                  </div>
                  <div className="course-analysis__question">
                    <span>本轮问题</span>
                    <strong>{selectedCourse.demoQuestion}</strong>
                  </div>
                  <div className="course-analysis__body">
                    <article>
                      <span>索引证据摘要</span>
                      <p>{selectedCourse.evidenceSummary}</p>
                    </article>
                    <article>
                      <span>三段分析路径</span>
                      <ol>
                        {selectedCourse.analysisSteps.map((step) => (
                          <li key={step}>{step}</li>
                        ))}
                      </ol>
                    </article>
                  </div>
                  <div className="course-analysis__next">
                    <TargetArrow24Regular aria-hidden="true" />
                    <div>
                      <span>Next Move · 演示建议</span>
                      <strong>{selectedCourse.nextMove}</strong>
                    </div>
                  </div>
                  <small className="course-analysis__source">
                    来源引用：{selectedCourse.sourceRef} ·
                    分析路径与建议均为可替换 Fixture，不是学校正式判断
                  </small>
                </section>
                <div className="course-roster__grid">
                  {DEMO_SEASON.courses.map((course) => (
                    <button
                      className={`course-card ${
                        course.id === DEMO_SEASON.heroCourseId
                          ? "is-starter"
                          : ""
                      } ${course.id === selectedCourse.id ? "is-selected" : ""}`}
                      type="button"
                      key={course.id}
                      aria-pressed={course.id === selectedCourse.id}
                      onClick={() => {
                        setSelectedCourseId(course.id);
                        showToast(`课程分析已切换：${course.title}`);
                      }}
                      data-focusable="true"
                    >
                      <span className="course-card__code">{course.code}</span>
                      <strong>{course.title}</strong>
                      <small>
                        {COURSE_ROLE_LABEL[course.role]} · {course.credits} 学分
                        · {course.schedule}
                      </small>
                      <span className={`course-card__status status-${course.status}`}>
                        {COURSE_STATUS_LABEL[course.status]} · {course.progressPct}%
                      </span>
                      <span className="course-card__topics">
                        {course.topics.join(" · ")}
                      </span>
                      <span className="course-card__next">
                        下一步：{course.nextAction}
                      </span>
                      <span className="course-card__source">
                        来源：{course.sourceRef}
                      </span>
                      <span className="course-card__action">
                        {course.id === selectedCourse.id
                          ? "当前分析"
                          : "切换分析"}
                        <ArrowRight24Regular aria-hidden="true" />
                      </span>
                    </button>
                  ))}
                </div>
                <div className="roster-boundary">
                  <Info24Regular aria-hidden="true" />
                  <span>{DEMO_SEASON.sourceBoundary}</span>
                </div>
                <section className="subject-catalog" aria-labelledby="subject-catalog-heading">
                  <div className="subject-catalog__header">
                    <div>
                      <span className="panel-label">COURSE UNIVERSE</span>
                      <h3 id="subject-catalog-heading">全部学科发现池</h3>
                    </div>
                    <div className="subject-catalog__metrics" aria-label="学科发现池统计">
                      <span>
                        <strong>{SUBJECT_CATALOG_SUMMARY.shortcutEntries}</strong>
                        学科入口
                      </span>
                      <span>
                        <strong>{SUBJECT_CATALOG_SUMMARY.uniqueSources}</strong>
                        唯一目录
                      </span>
                      <span>
                        <strong>{SUBJECT_CATALOG_SUMMARY.rootReadmes}</strong>
                        根 README
                      </span>
                    </div>
                  </div>
                  <p>
                    来自桌面“学科”快捷方式的只读发现快照；它是课程与资料候选池，不是选课记录、成绩单或已完成分析声明。
                  </p>
                  <button
                    className="subject-catalog__toggle"
                    type="button"
                    aria-expanded={catalogExpanded}
                    onClick={() => setCatalogExpanded((value) => !value)}
                    data-focusable="true"
                  >
                    <BookOpen24Regular aria-hidden="true" />
                    {catalogExpanded ? "收起全部学科" : "展开全部学科"}
                    <ArrowRight24Regular aria-hidden="true" />
                  </button>
                  {catalogExpanded && (
                    <div className="subject-catalog__groups">
                      {SUBJECT_CATEGORIES.map((category) => (
                        <section key={category}>
                          <h4>{category}</h4>
                          <ul>
                            {SUBJECT_CATALOG.filter(
                              (course) => course.category === category,
                            ).map((course) => (
                              <li key={course.id}>
                                <span>
                                  <strong>{course.title}</strong>
                                  <small>{course.kind}</small>
                                </span>
                                <b
                                  className={
                                    course.sourceState === "root_readme"
                                      ? "is-readme"
                                      : ""
                                  }
                                >
                                  {course.sourceState === "root_readme"
                                    ? "README 已整理"
                                    : "目录已映射"}
                                </b>
                              </li>
                            ))}
                          </ul>
                        </section>
                      ))}
                    </div>
                  )}
                  <small className="subject-catalog__boundary">
                    三个快捷方式别名复用既有目录，因此 43 个入口对应 40
                    个唯一来源；后续只有经过 README / 索引复核的条目才能晋升为 Demo 课程分析。
                  </small>
                </section>
              </div>
            ) : panel === "roles" ? (
              <RoleSwitcherPanel
                activeRole={activeRole}
                onSelect={selectDemoRole}
              />
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
                <div
                  className={`controller-diagnostic ${
                    controllerConnected ? "is-connected" : ""
                  }`}
                  role="status"
                  aria-live="polite"
                >
                  <strong>手柄输入诊断</strong>
                  {controllerSummary ? (
                    <>
                      <span>
                        {controllerSummary.mapping === "standard"
                          ? "W3C 标准映射"
                          : "原始映射兼容模式"}
                        {" · "}
                        {controllerSummary.buttonCount} 键 /{" "}
                        {controllerSummary.axisCount} 轴
                      </span>
                      <span>
                        最近识别方向：
                        {controllerSummary.lastDirection
                          ? GAMEPAD_DIRECTION_LABEL[
                              controllerSummary.lastDirection
                            ]
                          : "等待 D-pad 或摇杆输入"}
                      </span>
                    </>
                  ) : (
                    <span>
                      尚未检测到手柄。连接后先按任意键，再测试 D-pad 与左摇杆。
                    </span>
                  )}
                  <small>
                    设备名称不会保存或上传；这里只显示当前会话的映射摘要。
                  </small>
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
    </div>,
  );
}

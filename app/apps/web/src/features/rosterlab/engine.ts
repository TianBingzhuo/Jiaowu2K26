import { ROSTER_FIXTURE } from "./fixture";
import type {
  ConstraintViolation,
  CourseSpec,
  GoalId,
  Pin,
  PlanCourse,
  PlanTemplate,
  PreferenceProfile,
  RosterFixture,
  RosterLabState,
  SemesterLock,
  SemesterPlan,
  SemesterTransaction,
  TimeSlot,
  UnsatisfiableExplanation,
  WhatIfChanges,
} from "./types";

const GOAL_LABELS: Record<GoalId, string> = {
  hard_constraints: "硬约束",
  graduation_progress: "毕业进度",
  minimal_change: "少改当前方案",
  personal_preference: "个人偏好",
  minimal_gaps: "少空档",
};

export { GOAL_LABELS };

const toMinutes = (value: string) => {
  const [hours, minutes] = value.split(":").map(Number);
  return hours * 60 + minutes;
};

const overlaps = (left: TimeSlot, right: TimeSlot) =>
  left.weekday === right.weekday &&
  toMinutes(left.start) < toMinutes(right.end) &&
  toMinutes(right.start) < toMinutes(left.end);

const fixtureTime = (sequence: number) =>
  `2026-07-24T${String(14 + Math.floor(sequence / 6)).padStart(2, "0")}:${String(
    (sequence % 6) * 5,
  ).padStart(2, "0")}:00+08:00`;

const appendEvent = (
  state: RosterLabState,
  eventType: RosterLabState["timeline"][number]["eventType"],
  label: string,
) => [
  ...state.timeline,
  {
    id: `roster-event-${String(state.timeline.length + 1).padStart(3, "0")}`,
    eventType,
    label,
    occurredAt: fixtureTime(state.timeline.length),
  },
];

const stableFingerprint = (value: unknown) => {
  const text = JSON.stringify(value);
  let hash = 2166136261;
  for (let index = 0; index < text.length; index += 1) {
    hash ^= text.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return `fnv1a-${(hash >>> 0).toString(16).padStart(8, "0")}`;
};

const getCourse = (fixture: RosterFixture, courseId: string) => {
  const course = fixture.catalog.find((candidate) => candidate.code === courseId);
  if (!course) throw new Error(`Unknown course: ${courseId}`);
  return course;
};

const getOffering = (course: CourseSpec, offeringId: string) => {
  const offering = course.offerings.find((candidate) => candidate.id === offeringId);
  if (!offering) {
    throw new Error(`Unknown offering ${offeringId} for ${course.code}`);
  }
  return offering;
};

const activePins = (fixture: RosterFixture, pinIds: string[]) =>
  pinIds.map((pinId) => {
    const pin = fixture.pins.find((candidate) => candidate.id === pinId);
    if (!pin) throw new Error(`Unknown pin: ${pinId}`);
    return pin;
  });

const completedIds = (fixture: RosterFixture) =>
  new Set(fixture.prefix.completed.map((course) => course.courseId));

const inProgressIds = (fixture: RosterFixture) =>
  new Set(fixture.prefix.inProgress.map((course) => course.courseId));

const uniquePair = (left: string, right: string) =>
  [left, right].sort().join("::");

export function validateSelections(
  selections: PlanTemplate["selections"],
  pinIds: string[],
  blockedTimeSlots: TimeSlot[] = [],
  fixture: RosterFixture = ROSTER_FIXTURE,
): ConstraintViolation[] {
  const violations: ConstraintViolation[] = [];
  const selectedIds = new Set(selections.map((selection) => selection.courseId));
  const completed = completedIds(fixture);
  const inProgress = inProgressIds(fixture);
  const planCourses = selections.map((selection) => {
    const course = getCourse(fixture, selection.courseId);
    return { course, offering: getOffering(course, selection.offeringId) };
  });

  const totalCredits = planCourses.reduce(
    (total, item) => total + item.course.credits,
    0,
  );
  if (
    totalCredits < fixture.creditRange.min ||
    totalCredits > fixture.creditRange.max
  ) {
    violations.push({
      type: "credit_limit",
      courseIds: selections.map((selection) => selection.courseId),
      description: `当前 ${totalCredits} 学分，必须位于 ${fixture.creditRange.min}–${fixture.creditRange.max} 学分。`,
    });
  }

  for (const { course, offering } of planCourses) {
    if (offering.enrolled >= offering.capacity) {
      violations.push({
        type: "capacity",
        courseIds: [course.code],
        description: `${course.code} ${offering.id} 的演示名额已经排满。`,
      });
    }
    for (const prerequisite of course.prerequisites) {
      const satisfied =
        prerequisite.relation === "before"
          ? completed.has(prerequisite.courseId)
          : completed.has(prerequisite.courseId) ||
            inProgress.has(prerequisite.courseId) ||
            selectedIds.has(prerequisite.courseId);
      if (!satisfied) {
        violations.push({
          type: "prerequisite",
          courseIds: [course.code, prerequisite.courseId],
          description: `${course.code} 需要先修或并修 ${prerequisite.courseId}。`,
        });
      }
    }
    for (const corequisite of course.corequisites) {
      if (
        !selectedIds.has(corequisite) &&
        !completed.has(corequisite) &&
        !inProgress.has(corequisite)
      ) {
        violations.push({
          type: "prerequisite",
          courseIds: [course.code, corequisite],
          description: `${course.code} 必须与 ${corequisite} 同时选择。`,
        });
      }
    }
    for (const excluded of course.exclusions) {
      if (selectedIds.has(excluded)) {
        violations.push({
          type: "exclusion",
          courseIds: [course.code, excluded],
          description: `${course.code} 与 ${excluded} 互斥，不能进入同一方案。`,
        });
      }
    }
    for (const timeSlot of offering.timeSlots) {
      for (const blocked of blockedTimeSlots) {
        if (overlaps(timeSlot, blocked)) {
          violations.push({
            type: "time_conflict",
            courseIds: [course.code],
            description: `${course.code} ${timeSlot.weekday} ${timeSlot.start}–${timeSlot.end} 与 What-if 时间块冲突。`,
          });
        }
      }
    }
  }

  const seenPairs = new Set<string>();
  for (let left = 0; left < planCourses.length; left += 1) {
    for (let right = left + 1; right < planCourses.length; right += 1) {
      const leftItem = planCourses[left];
      const rightItem = planCourses[right];
      if (
        leftItem.offering.timeSlots.some((leftSlot) =>
          rightItem.offering.timeSlots.some((rightSlot) =>
            overlaps(leftSlot, rightSlot),
          ),
        )
      ) {
        const pair = uniquePair(leftItem.course.code, rightItem.course.code);
        if (!seenPairs.has(pair)) {
          seenPairs.add(pair);
          violations.push({
            type: "time_conflict",
            courseIds: [leftItem.course.code, rightItem.course.code],
            description: `${leftItem.course.code} 与 ${rightItem.course.code} 的班次时间重叠。`,
          });
        }
      }
    }
  }

  for (const pin of activePins(fixture, pinIds)) {
    if (pin.courseId) {
      const selection = selections.find(
        (candidate) => candidate.courseId === pin.courseId,
      );
      if (!selection || (pin.offeringId && selection.offeringId !== pin.offeringId)) {
        violations.push({
          type: "pin",
          courseIds: [pin.courseId],
          description: `锁定项 ${pin.id} 要求 ${pin.courseId} ${pin.offeringId ?? ""} 保持不动。`,
        });
      }
    }
    if (pin.timeSlot) {
      for (const { course, offering } of planCourses) {
        if (offering.timeSlots.some((timeSlot) => overlaps(timeSlot, pin.timeSlot!))) {
          violations.push({
            type: "pin",
            courseIds: [course.code],
            description: `${course.code} 与锁定时间块“${pin.lockReason}”冲突。`,
          });
        }
      }
    }
  }

  return violations;
}

const buildPlanCourses = (
  template: PlanTemplate,
  pinIds: string[],
  fixture: RosterFixture,
): PlanCourse[] => {
  const pins = activePins(fixture, pinIds);
  return template.selections.map((selection) => {
    const course = getCourse(fixture, selection.courseId);
    const offering = getOffering(course, selection.offeringId);
    const pin = pins.find(
      (candidate) =>
        candidate.courseId === course.code &&
        (!candidate.offeringId || candidate.offeringId === offering.id),
    );
    return {
      courseId: course.code,
      offeringId: offering.id,
      code: course.code,
      title: course.title,
      role: course.role,
      credits: course.credits,
      timeSlots: offering.timeSlots,
      pinned: Boolean(pin),
      pinReason: pin?.lockReason ?? null,
    };
  });
};

export function buildTransaction(
  plan: SemesterPlan,
  fixture: RosterFixture = ROSTER_FIXTURE,
): SemesterTransaction {
  const planned = new Map(
    fixture.prefix.planned.map((item) => [item.courseId, item]),
  );
  const selected = new Map(plan.courses.map((item) => [item.courseId, item]));
  const actions: SemesterTransaction["actions"] = [];

  for (const course of plan.courses) {
    const current = planned.get(course.courseId);
    if (!current) {
      actions.push({
        type: "add",
        courseId: course.courseId,
        code: course.code,
        title: course.title,
        oldOffering: null,
        newOffering: course.offeringId,
        creditChange: course.credits,
        risk: null,
        formalStep: "在学校正式选课系统核对容量、资格和办理窗口后，再由本人提交。",
      });
    } else if (current.offeringId !== course.offeringId) {
      actions.push({
        type: "swap",
        courseId: course.courseId,
        code: course.code,
        title: course.title,
        oldOffering: current.offeringId,
        newOffering: course.offeringId,
        creditChange: 0,
        risk: "换班会受实时名额影响；当前演示不会占座。",
        formalStep: "在学校正式系统确认目标班次仍可选，再执行换班。",
      });
    }
  }

  for (const current of fixture.prefix.planned) {
    if (!selected.has(current.courseId)) {
      const course = getCourse(fixture, current.courseId);
      actions.push({
        type: "drop",
        courseId: course.code,
        code: course.code,
        title: course.title,
        oldOffering: current.offeringId,
        newOffering: null,
        creditChange: -course.credits,
        risk: "退课可能影响先修链、学费或培养方案；必须查看学校正式规则。",
        formalStep: "先查看退课截止、影响和审批要求，再由本人在正式系统办理。",
      });
    }
  }

  const baselineCredits = fixture.prefix.planned.reduce(
    (total, item) => total + getCourse(fixture, item.courseId).credits,
    0,
  );
  return {
    id: `tx-${plan.id}`,
    fromPrefixId: fixture.prefix.id,
    toPlanId: plan.id,
    actions,
    netCreditChange: plan.totalCredits - baselineCredits,
    impactSummary:
      actions.length === 0
        ? "与当前 Prefix 完全一致；仍需前往学校正式系统办理。"
        : `${actions.length} 项规划变化，全部可在提交前回到 Prefix；当前没有执行任何正式选课动作。`,
    isFormalSubmission: false,
  };
}

const preferenceMetrics = (
  courses: PlanCourse[],
  profile: PreferenceProfile,
) => {
  const starts = courses.flatMap((course) =>
    course.timeSlots.map((timeSlot) => toMinutes(timeSlot.start)),
  );
  const averageStart =
    starts.reduce((total, value) => total + value, 0) / Math.max(1, starts.length);
  const target =
    profile.timeOfDay === "morning"
      ? 9 * 60
      : profile.timeOfDay === "daytime"
        ? 12 * 60
        : 15 * 60;
  const timeScore = Math.max(0, 100 - Math.abs(averageStart - target) / 3);
  const departments = new Set(
    courses.map((course) => getCourse(ROSTER_FIXTURE, course.courseId).department),
  ).size;
  const varietyScore = Math.min(100, 35 + departments * 13);
  const dayCounts = new Map<string, number>();
  for (const course of courses) {
    for (const timeSlot of course.timeSlots) {
      dayCounts.set(timeSlot.weekday, (dayCounts.get(timeSlot.weekday) ?? 0) + 1);
    }
  }
  const compactScore = Math.min(
    100,
    Array.from(dayCounts.values()).reduce((total, count) => total + count * count, 0) *
      4,
  );
  return {
    personal:
      (timeScore * 2 +
        varietyScore * profile.variety +
        compactScore * profile.compactness) /
      Math.max(2, 2 + profile.variety + profile.compactness),
    gaps: compactScore,
  };
};

const scorePlan = (
  courses: PlanCourse[],
  goalOrder: GoalId[],
  preferences: PreferenceProfile,
  transaction: SemesterTransaction,
) => {
  const requiredCredits = courses
    .filter((course) => course.role === "required")
    .reduce((total, course) => total + course.credits, 0);
  const unchanged = courses.filter((course) => {
    const current = ROSTER_FIXTURE.prefix.planned.find(
      (item) => item.courseId === course.courseId,
    );
    return current?.offeringId === course.offeringId;
  }).length;
  const preference = preferenceMetrics(courses, preferences);
  const metrics: Record<GoalId, number> = {
    hard_constraints: 100,
    graduation_progress: Math.min(100, 35 + requiredCredits * 8),
    minimal_change: Math.round((unchanged / Math.max(1, courses.length)) * 100),
    personal_preference: Math.round(preference.personal),
    minimal_gaps: Math.round(preference.gaps),
  };
  const weighted = goalOrder.reduce((total, goal, index) => {
    const positionWeight = goalOrder.length - index;
    const preferenceWeight =
      goal === "minimal_change"
        ? Math.max(1, preferences.stability)
        : goal === "personal_preference"
          ? 2
          : 1;
    return total + metrics[goal] * positionWeight * preferenceWeight;
  }, 0);
  const totalWeight = goalOrder.reduce((total, goal, index) => {
    const positionWeight = goalOrder.length - index;
    const preferenceWeight =
      goal === "minimal_change"
        ? Math.max(1, preferences.stability)
        : goal === "personal_preference"
          ? 2
          : 1;
    return total + positionWeight * preferenceWeight;
  }, 0);
  return Math.max(
    0,
    Math.min(100, Math.round(weighted / totalWeight - transaction.actions.length)),
  );
};

const adaptTemplate = (
  template: PlanTemplate,
  changes: WhatIfChanges | null,
  fixture: RosterFixture,
): PlanTemplate => {
  if (!changes) return template;
  const selections = template.selections.filter(
    (selection) => !changes.removeCourseIds.includes(selection.courseId),
  );
  for (const courseId of changes.addCourseIds) {
    if (!selections.some((selection) => selection.courseId === courseId)) {
      const course = getCourse(fixture, courseId);
      selections.push({
        courseId,
        offeringId: course.offerings[0].id,
      });
    }
  }
  return {
    ...template,
    id: `${template.id}-what-if`,
    label: template.label.replace("方案", "模拟方案"),
    strategy: `${template.strategy} What-if：${changes.branchName}。`,
    selections,
  };
};

const makePlan = (
  template: PlanTemplate,
  pinIds: string[],
  goalOrder: GoalId[],
  preferences: PreferenceProfile,
  changes: WhatIfChanges | null,
  fixture: RosterFixture,
): SemesterPlan => {
  const adapted = adaptTemplate(template, changes, fixture);
  const blocked = changes?.blockedTimeSlots ?? [];
  const violations = validateSelections(adapted.selections, pinIds, blocked, fixture);
  const courses = buildPlanCourses(adapted, pinIds, fixture);
  const inputFingerprint = stableFingerprint({
    catalogVersion: fixture.catalogVersion,
    prefixVersion: fixture.prefix.version,
    pinIds: [...pinIds].sort(),
    goalOrder,
    preferences,
    changes,
    selections: adapted.selections,
  });
  const skeleton: SemesterPlan = {
    id: `plan-${adapted.id}-${inputFingerprint.slice(-8)}`,
    label: adapted.label,
    strategy: adapted.strategy,
    semester: fixture.semester,
    courses,
    totalCredits: courses.reduce((total, course) => total + course.credits, 0),
    hardConstraintsMet: violations.length === 0,
    preferenceScore: 0,
    migrationCost: 0,
    tradeoffs: [],
    risks: [],
    solverBackend: "deterministic_heuristic_fixture",
    violations,
    isSimulation: Boolean(changes),
    inputFingerprint,
  };
  const transaction = buildTransaction(skeleton, fixture);
  const migrationCost = transaction.actions.length;
  const departments = new Set(
    courses.map((item) => getCourse(fixture, item.courseId).department),
  ).size;
  const earliest = Math.min(
    ...courses.flatMap((item) =>
      item.timeSlots.map((timeSlot) => toMinutes(timeSlot.start)),
    ),
  );
  const lowSeatCourse = courses
    .map((item) => ({
      course: item,
      offering: getOffering(getCourse(fixture, item.courseId), item.offeringId),
    }))
    .sort(
      (left, right) =>
        left.offering.capacity -
        left.offering.enrolled -
        (right.offering.capacity - right.offering.enrolled),
    )[0];
  const seats =
    lowSeatCourse.offering.capacity - lowSeatCourse.offering.enrolled;
  return {
    ...skeleton,
    preferenceScore: scorePlan(courses, goalOrder, preferences, transaction),
    migrationCost,
    tradeoffs: [
      {
        impact: migrationCost <= 1 ? "positive" : "negative",
        title: migrationCost <= 1 ? "迁移最小" : "需要主动调整",
        detail: `相对 Prefix 有 ${migrationCost} 项 add / drop / swap。`,
      },
      {
        impact: departments >= 4 ? "positive" : "neutral",
        title: departments >= 4 ? "跨域较强" : "方向集中",
        detail: `覆盖 ${departments} 个教学领域；这只是课程结构，不是能力评分。`,
      },
      {
        impact: earliest < 9 * 60 ? "negative" : "positive",
        title: earliest < 9 * 60 ? "包含早课" : "无 8 点课",
        detail:
          earliest < 9 * 60
            ? "最早 08:00；若早课优先级较低，可调整目标顺序后重算。"
            : "最早 09:00；代价可能是更高迁移成本或更晚下课。",
      },
    ],
    risks: [
      {
        severity: seats <= 3 ? "high" : seats <= 8 ? "medium" : "low",
        description: `${lowSeatCourse.course.code} 在演示中还剩 ${seats} 个名额；真实容量请回学校系统核对。`,
      },
    ],
  };
};

export type SolveInput = {
  pinIds: string[];
  goalOrder: GoalId[];
  preferences: PreferenceProfile;
  changes?: WhatIfChanges | null;
  maxVariants?: number;
};

export function solveRoster(
  input: SolveInput,
  fixture: RosterFixture = ROSTER_FIXTURE,
): SemesterPlan[] {
  const changes = input.changes ?? null;
  return fixture.planTemplates
    .map((template) =>
      makePlan(
        template,
        input.pinIds,
        input.goalOrder,
        input.preferences,
        changes,
        fixture,
      ),
    )
    .filter((plan) => plan.hardConstraintsMet)
    .sort(
      (left, right) =>
        right.preferenceScore - left.preferenceScore ||
        left.migrationCost - right.migrationCost ||
        left.id.localeCompare(right.id),
    )
    .slice(0, input.maxVariants ?? 3);
}

export function explainUnsatisfiablePin(
  fixture: RosterFixture = ROSTER_FIXTURE,
): UnsatisfiableExplanation {
  return {
    requestId: "unsat-pin-sls-circuits-b-fixture",
    minimalConflictSet: [
      {
        type: "pin",
        courseIds: ["SLS201", "CIR220"],
        description:
          "SLS201-A 与 CIR220-B 都被锁定在周一、周三 09:00–10:30，同一学生无法同时出席。",
      },
    ],
    blockingChain: [
      { step: 1, description: "SLS201-A 是当前已启用 Pin，求解器不得移动。" },
      { step: 2, description: "测试将 CIR220-B 也设为不可移动 Pin。" },
      { step: 3, description: "两个班次在两天均完全重叠，因此不存在可行方案。" },
    ],
    relaxableItems: [
      {
        item: "放宽 CIR220-B 班次 Pin",
        impactIfRelaxed:
          "切回 CIR220-A；保留课程但改到周二、周四 10:30，不影响 SLS201。",
        alternativeCourseIds: ["CIR220"],
      },
      {
        item: "暂不选择 CIR220",
        impactIfRelaxed:
          "可改用其他 3 学分课程，但会改变专业必修推进顺序，需导师确认。",
        alternativeCourseIds: ["PHY240", "OPT210"],
      },
    ],
  };
}

export function validateRosterFixture(
  fixture: RosterFixture = ROSTER_FIXTURE,
): string[] {
  const errors: string[] = [];
  if (fixture.catalog.length < 8 || fixture.catalog.length > 20) {
    errors.push("Roster fixture must contain 8–20 courses.");
  }
  const ids = new Set(fixture.catalog.map((course) => course.code));
  if (ids.size !== fixture.catalog.length) {
    errors.push("Course codes must be unique.");
  }
  for (const pin of fixture.pins) {
    if (pin.courseId && !ids.has(pin.courseId)) {
      errors.push(`Pin references unknown course: ${pin.courseId}`);
    }
  }
  for (const template of fixture.planTemplates) {
    for (const selection of template.selections) {
      if (!ids.has(selection.courseId)) {
        errors.push(`Template references unknown course: ${selection.courseId}`);
      }
    }
  }
  const defaults = solveRoster({
    pinIds: ["pin-sls-section", "pin-friday-commitment"],
    goalOrder: fixture.goalOrder,
    preferences: fixture.preferences,
  });
  if (defaults.length < 3) {
    errors.push("Default fixture must produce three feasible plans.");
  }
  return errors;
}

export function createRosterLabState(): RosterLabState {
  return {
    schemaVersion: "1.0.0",
    dataMode: "fixture",
    step: "editor",
    activePinIds: ["pin-sls-section", "pin-friday-commitment"],
    preferences: { ...ROSTER_FIXTURE.preferences },
    goalOrder: [...ROSTER_FIXTURE.goalOrder],
    plans: [],
    selectedPlanId: null,
    simulation: null,
    unsat: null,
    savedLock: null,
    timeline: [],
  };
}

export function togglePin(state: RosterLabState, pinId: string): RosterLabState {
  if (!ROSTER_FIXTURE.pins.some((pin) => pin.id === pinId)) {
    throw new Error(`Unknown pin: ${pinId}`);
  }
  if (pinId === "pin-sls-section") {
    throw new Error("The SLS201 anchor pin is required in this fixture.");
  }
  const active = state.activePinIds.includes(pinId);
  return {
    ...state,
    activePinIds: active
      ? state.activePinIds.filter((candidate) => candidate !== pinId)
      : [...state.activePinIds, pinId],
    plans: [],
    selectedPlanId: null,
    savedLock: null,
    timeline: appendEvent(
      state,
      "pin_changed",
      `${active ? "解除" : "启用"}锁定项 ${pinId}；等待重新解析。`,
    ),
  };
}

export function setPreference<K extends keyof PreferenceProfile>(
  state: RosterLabState,
  key: K,
  value: PreferenceProfile[K],
): RosterLabState {
  return {
    ...state,
    preferences: { ...state.preferences, [key]: value },
    plans: [],
    selectedPlanId: null,
    savedLock: null,
  };
}

export function moveGoal(
  state: RosterLabState,
  goal: GoalId,
  direction: -1 | 1,
): RosterLabState {
  if (goal === "hard_constraints") return state;
  const index = state.goalOrder.indexOf(goal);
  const target = index + direction;
  if (index < 1 || target < 1 || target >= state.goalOrder.length) return state;
  const goalOrder = [...state.goalOrder];
  [goalOrder[index], goalOrder[target]] = [goalOrder[target], goalOrder[index]];
  return {
    ...state,
    goalOrder,
    plans: [],
    selectedPlanId: null,
    savedLock: null,
    timeline: appendEvent(
      state,
      "goals_reordered",
      `目标顺序已调整：${goalOrder.map((item) => GOAL_LABELS[item]).join(" → ")}`,
    ),
  };
}

export function solveRosterState(state: RosterLabState): RosterLabState {
  const plans = solveRoster({
    pinIds: state.activePinIds,
    goalOrder: state.goalOrder,
    preferences: state.preferences,
  });
  if (plans.length < 2) {
    return {
      ...state,
      step: "unsat",
      plans,
      unsat: explainUnsatisfiablePin(),
      timeline: appendEvent(
        state,
        "unsat_explained",
        "确定性回退未找到两套可行方案，已返回阻塞链和可放宽项。",
      ),
    };
  }
  return {
    ...state,
    step: "compare",
    plans,
    selectedPlanId: plans[0].id,
    unsat: null,
    savedLock: null,
    timeline: appendEvent(
      state,
      "solved",
      `确定性启发式生成 ${plans.length} 套可行方案；未穷举全部组合。`,
    ),
  };
}

export function selectPlan(
  state: RosterLabState,
  planId: string,
  simulation = false,
): RosterLabState {
  const candidates = simulation ? state.simulation?.plans ?? [] : state.plans;
  if (!candidates.some((plan) => plan.id === planId)) {
    throw new Error(`Unknown plan: ${planId}`);
  }
  return simulation
    ? {
        ...state,
        simulation: state.simulation
          ? { ...state.simulation, selectedPlanId: planId }
          : null,
        timeline: appendEvent(
          state,
          "plan_selected",
          `选择模拟方案 ${planId} 进行比较；未提交正式交易。`,
        ),
      }
    : {
        ...state,
        selectedPlanId: planId,
        savedLock: null,
        timeline: appendEvent(
          state,
          "plan_selected",
          `选择方案 ${planId} 进入 transaction 预览；未提交正式交易。`,
        ),
      };
}

export function runWhatIf(
  state: RosterLabState,
  changes: WhatIfChanges,
): RosterLabState {
  if (!changes.branchName.trim()) {
    throw new Error("What-if branch requires a name.");
  }
  const plans = solveRoster({
    pinIds: state.activePinIds,
    goalOrder: state.goalOrder,
    preferences: state.preferences,
    changes,
  });
  return {
    ...state,
    step: "whatif",
    simulation: {
      changes,
      plans,
      selectedPlanId: plans[0]?.id ?? null,
    },
    unsat: plans.length ? null : explainUnsatisfiablePin(),
    timeline: appendEvent(
      state,
      "what_if_created",
      `创建模拟分支“${changes.branchName}”：${plans.length} 套可行方案；不提交正式选课。`,
    ),
  };
}

export function openUnsatDrill(state: RosterLabState): RosterLabState {
  return {
    ...state,
    step: "unsat",
    unsat: explainUnsatisfiablePin(),
    timeline: appendEvent(
      state,
      "unsat_explained",
      "运行双 Pin 冲突测试，返回最小冲突集、阻塞链和替代项。",
    ),
  };
}

export function clearSimulation(state: RosterLabState): RosterLabState {
  return {
    ...state,
    step: state.plans.length ? "compare" : "editor",
    simulation: null,
    unsat: null,
  };
}

export function buildSemesterLock(
  state: RosterLabState,
  fixture: RosterFixture = ROSTER_FIXTURE,
): SemesterLock {
  const selected = state.plans.find(
    (candidate) => candidate.id === state.selectedPlanId,
  );
  if (!selected) throw new Error("Select a feasible base plan before saving.");
  return {
    schemaVersion: "1.0.0",
    dataMode: "fixture",
    id: `semester-lock-${selected.inputFingerprint.slice(-8)}`,
    studentId: fixture.studentId,
    semester: fixture.semester,
    catalogVersion: fixture.catalogVersion,
    prefixVersion: fixture.prefix.version,
    pinIds: [...state.activePinIds].sort(),
    preferences: { ...state.preferences },
    goalOrder: [...state.goalOrder],
    solverBackend: "deterministic_heuristic_fixture",
    selectedPlanId: selected.id,
    inputFingerprint: selected.inputFingerprint,
    createdAt: "2026-07-24T15:30:00+08:00",
    isFormalEnrollment: false,
    sourceBoundary: fixture.sourceBoundary,
  };
}

export function saveLockToState(state: RosterLabState): RosterLabState {
  const savedLock = buildSemesterLock(state);
  return {
    ...state,
    step: "transaction",
    savedLock,
    timeline: appendEvent(
      state,
      "lock_saved",
      `保存可重放输入 ${savedLock.id}；不是正式选课凭证。`,
    ),
  };
}

export function replaySemesterLock(
  lock: SemesterLock,
  fixture: RosterFixture = ROSTER_FIXTURE,
) {
  if (
    lock.catalogVersion !== fixture.catalogVersion ||
    lock.prefixVersion !== fixture.prefix.version
  ) {
    throw new Error("Lock input version does not match the current fixture.");
  }
  const plans = solveRoster(
    {
      pinIds: lock.pinIds,
      goalOrder: lock.goalOrder,
      preferences: lock.preferences,
    },
    fixture,
  );
  return {
    plans,
    matched: plans.some(
      (plan) =>
        plan.id === lock.selectedPlanId &&
        plan.inputFingerprint === lock.inputFingerprint,
    ),
  };
}

export const resetRosterLabState = createRosterLabState;

export function pinLabel(pin: Pin) {
  if (pin.courseId) {
    return `${pin.courseId}${pin.offeringId ? ` · ${pin.offeringId}` : ""}`;
  }
  if (pin.timeSlot) {
    return `${pin.timeSlot.weekday} ${pin.timeSlot.start}–${pin.timeSlot.end}`;
  }
  return pin.type;
}

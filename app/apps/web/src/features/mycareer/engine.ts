import type {
  CourseRole,
  CourseStatus,
  DemoCourse,
  DemoDeadline,
  DemoSeason,
  LearningSummary,
} from "./types";

export const COURSE_STATUS_LABEL: Record<CourseStatus, string> = {
  active: "进行中",
  completed: "已完成",
  dropped: "已退选",
  attention: "需要关注",
  critical: "关键截止日临近",
};

export const COURSE_ROLE_LABEL: Record<CourseRole, string> = {
  required: "必修",
  elective: "选修",
  general: "通识",
};

export const STAGE_LABEL: Record<DemoSeason["stage"], string> = {
  undergraduate: "本科",
  master: "硕士",
  doctoral: "博士",
};

export function getCourse(
  season: DemoSeason,
  courseId: string,
): DemoCourse | undefined {
  return season.courses.find((course) => course.id === courseId);
}

export function getUpcomingDeadlines(
  season: DemoSeason,
  referenceIso: string,
  days = 7,
): DemoDeadline[] {
  const start = new Date(referenceIso).getTime();
  const end = start + days * 24 * 60 * 60 * 1000;
  return season.deadlines
    .filter((deadline) => {
      const due = new Date(deadline.dueAt).getTime();
      return due >= start && due <= end;
    })
    .sort(
      (left, right) =>
        new Date(left.dueAt).getTime() - new Date(right.dueAt).getTime(),
    );
}

export function getSeasonProgressPct(season: DemoSeason): number {
  return Math.round((season.seasonNumber / season.totalSeasons) * 100);
}

export function getLearningSummary(course: DemoCourse): LearningSummary {
  if (!course.lastSession) {
    return { state: "not_started", label: "尚未开始学习" };
  }
  const accuracyPct =
    course.lastSession.totalQuestions === 0
      ? 0
      : Math.round(
          (course.lastSession.correctCount /
            course.lastSession.totalQuestions) *
            100,
        );
  const minutes = Math.floor(course.lastSession.durationSeconds / 60);
  const seconds = course.lastSession.durationSeconds % 60;
  return {
    state: "ready",
    completionPct: course.lastSession.completionPct,
    accuracyPct,
    durationLabel: `${minutes}:${String(seconds).padStart(2, "0")}`,
    completedAt: course.lastSession.completedAt,
  };
}

export function canStartLearning(course: DemoCourse): boolean {
  return Boolean(course.linkedPublishedId);
}

export function canOpenReplay(course: DemoCourse): boolean {
  return Boolean(course.linkedPublishedId && course.lastSession);
}

export function validateDemoSeason(season: DemoSeason): string[] {
  const errors: string[] = [];
  if (season.authority !== "fixture") {
    errors.push("Demo season must be labelled as fixture.");
  }
  if (
    season.seasonNumber < 1 ||
    season.seasonNumber > season.totalSeasons
  ) {
    errors.push("Season number must fit inside the declared path.");
  }
  if (!getCourse(season, season.heroCourseId)) {
    errors.push("Hero course must exist inside the roster.");
  }
  const ids = new Set<string>();
  for (const course of season.courses) {
    if (ids.has(course.id)) errors.push(`Duplicate course id: ${course.id}`);
    ids.add(course.id);
    if (course.progressPct < 0 || course.progressPct > 100) {
      errors.push(`Course progress is outside 0..100: ${course.id}`);
    }
    if (!course.sourceRef.startsWith("course-index:")) {
      errors.push(`Course source is not traceable: ${course.id}`);
    }
  }
  for (const deadline of season.deadlines) {
    if (!ids.has(deadline.courseId)) {
      errors.push(`Deadline points to an unknown course: ${deadline.id}`);
    }
  }
  return errors;
}

import { useEffect, useMemo, useState } from "react";
import {
  ArrowSortDown24Regular,
  ArrowSortUp24Regular,
  ArrowRight24Regular,
  CalendarClock24Regular,
  HatGraduation24Regular,
  Info24Regular,
  ReOrderDotsVertical24Regular,
  Sparkle24Regular,
  TableResizeColumn24Regular,
} from "@fluentui/react-icons";
import {
  COURSE_ROLE_LABEL,
  COURSE_STATUS_LABEL,
  getSeasonProgressPct,
  getUpcomingDeadlines,
  STAGE_LABEL,
} from "./engine";
import type { DemoSeason } from "./types";
import "./mycareer.css";

type SeasonSideboardProps = {
  season: DemoSeason;
  selectedCourseId: string;
  onSelectCourse: (courseId: string) => void;
};

type RosterLayout = "compact" | "standard" | "expanded";

const ROSTER_LAYOUT_KEY = "university2k26.roster-layout.v1";
const ROSTER_ORDER_KEY = "university2k26.roster-order.v1";
const ROSTER_LAYOUTS: Array<{
  id: RosterLayout;
  label: string;
}> = [
  { id: "compact", label: "紧凑" },
  { id: "standard", label: "标准" },
  { id: "expanded", label: "大卡" },
];

const loadRosterLayout = (): RosterLayout => {
  try {
    const saved = window.localStorage.getItem(ROSTER_LAYOUT_KEY);
    return ROSTER_LAYOUTS.some((layout) => layout.id === saved)
      ? (saved as RosterLayout)
      : "standard";
  } catch {
    return "standard";
  }
};

const loadRosterOrder = (fallback: string[]) => {
  try {
    const saved = JSON.parse(
      window.localStorage.getItem(ROSTER_ORDER_KEY) ?? "[]",
    ) as unknown;
    if (!Array.isArray(saved)) return fallback;
    const known = saved.filter(
      (id): id is string => typeof id === "string" && fallback.includes(id),
    );
    return [...known, ...fallback.filter((id) => !known.includes(id))];
  } catch {
    return fallback;
  }
};

const formatDeadline = (value: string) =>
  new Intl.DateTimeFormat("zh-CN", {
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date(value));

export function SeasonSideboard({
  season,
  selectedCourseId,
  onSelectCourse,
}: SeasonSideboardProps) {
  const deadlines = getUpcomingDeadlines(season, season.updatedAt);
  const seasonProgress = getSeasonProgressPct(season);
  const defaultOrder = useMemo(
    () => season.courses.map((course) => course.id),
    [season.courses],
  );
  const [rosterLayout, setRosterLayout] =
    useState<RosterLayout>(loadRosterLayout);
  const [rosterOrder, setRosterOrder] = useState(() =>
    loadRosterOrder(defaultOrder),
  );
  const [draggedCourseId, setDraggedCourseId] = useState<string | null>(null);
  const orderedCourses = rosterOrder
    .map((courseId) =>
      season.courses.find((course) => course.id === courseId),
    )
    .filter((course): course is DemoSeason["courses"][number] => Boolean(course));

  useEffect(() => {
    try {
      window.localStorage.setItem(ROSTER_LAYOUT_KEY, rosterLayout);
    } catch {
      // The demo remains usable when storage is denied.
    }
  }, [rosterLayout]);

  useEffect(() => {
    try {
      window.localStorage.setItem(
        ROSTER_ORDER_KEY,
        JSON.stringify(rosterOrder),
      );
    } catch {
      // The in-memory order remains usable when storage is denied.
    }
  }, [rosterOrder]);

  const moveCourse = (courseId: string, offset: -1 | 1) => {
    setRosterOrder((current) => {
      const index = current.indexOf(courseId);
      const target = index + offset;
      if (index < 0 || target < 0 || target >= current.length) return current;
      const next = [...current];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  };

  const dropCourseBefore = (targetCourseId: string) => {
    if (!draggedCourseId || draggedCourseId === targetCourseId) return;
    setRosterOrder((current) => {
      const withoutDragged = current.filter((id) => id !== draggedCourseId);
      const targetIndex = withoutDragged.indexOf(targetCourseId);
      withoutDragged.splice(
        targetIndex < 0 ? withoutDragged.length : targetIndex,
        0,
        draggedCourseId,
      );
      return withoutDragged;
    });
    setDraggedCourseId(null);
  };

  return (
    <aside className="season-sideboard" aria-labelledby="season-board-heading">
      <header className="season-sideboard__header">
        <div>
          <span className="panel-label">2026 SPRING ROSTER</span>
          <h2 id="season-board-heading">{season.label}</h2>
          <p>
            {STAGE_LABEL[season.stage]} · 第 {season.seasonNumber} /{" "}
            {season.totalSeasons} 赛季
          </p>
        </div>
        <span className="fixture-badge">
          <Info24Regular aria-hidden="true" />
          Fixture
        </span>
      </header>

      <div className="season-path">
        <div>
          <span>培养路径进度</span>
          <strong>
            {season.seasonNumber} / {season.totalSeasons}
          </strong>
        </div>
        <div
          className="season-path__meter"
          role="progressbar"
          aria-label={`培养路径第 ${season.seasonNumber} 个赛季，共 ${season.totalSeasons} 个赛季`}
          aria-valuemin={0}
          aria-valuemax={season.totalSeasons}
          aria-valuenow={season.seasonNumber}
        >
          <span style={{ width: `${seasonProgress}%` }} />
        </div>
      </div>

      <section className="deadline-board" aria-labelledby="deadline-heading">
        <div className="season-section-heading">
          <CalendarClock24Regular aria-hidden="true" />
          <div>
            <span>7-DAY WINDOW</span>
            <h3 id="deadline-heading">近 7 天截止日</h3>
          </div>
        </div>
        {deadlines.length ? (
          <ol>
            {deadlines.map((deadline) => {
              const course = season.courses.find(
                (candidate) => candidate.id === deadline.courseId,
              );
              return (
                <li key={deadline.id}>
                  <time dateTime={deadline.dueAt}>
                    {formatDeadline(deadline.dueAt)}
                  </time>
                  <span>
                    <strong>{deadline.title}</strong>
                    <small>
                      {course?.code ?? "课程"} · Fixture 日历
                    </small>
                  </span>
                </li>
              );
            })}
          </ol>
        ) : (
          <p className="season-empty">近 7 天没有已知截止日。</p>
        )}
      </section>

      <section className="roster-board" aria-labelledby="roster-heading">
        <div className="season-section-heading">
          <HatGraduation24Regular aria-hidden="true" />
          <div>
            <span>COURSE LINEUP</span>
            <h3 id="roster-heading">课程阵容</h3>
          </div>
        </div>
        <div className="roster-layout-tools">
          <span>
            <TableResizeColumn24Regular aria-hidden="true" />
            卡片预设
          </span>
          <div role="group" aria-label="课程卡片尺寸">
            {ROSTER_LAYOUTS.map((layout) => (
              <button
                type="button"
                key={layout.id}
                aria-pressed={rosterLayout === layout.id}
                className={rosterLayout === layout.id ? "is-active" : ""}
                onClick={() => setRosterLayout(layout.id)}
                data-focusable="true"
              >
                {layout.label}
              </button>
            ))}
          </div>
          <button
            className="roster-layout-reset"
            type="button"
            onClick={() => {
              setRosterLayout("standard");
              setRosterOrder(defaultOrder);
            }}
            data-focusable="true"
          >
            重置
          </button>
        </div>
        <p className="roster-layout-help">
          拖动把手可换位；键盘、触屏与手柄可用每张卡下方的上移 / 下移。
        </p>
        <div
          className={`roster-board__grid layout-${rosterLayout}`}
          aria-label="可排序课程阵容"
        >
          {orderedCourses.map((course, index) => (
            <article
              className={[
                "roster-slot",
                draggedCourseId === course.id ? "is-dragging" : "",
              ]
                .filter(Boolean)
                .join(" ")}
              key={course.id}
              onDragOver={(event) => event.preventDefault()}
              onDrop={() => dropCourseBefore(course.id)}
            >
              <span
                className="roster-drag-handle"
                draggable
                aria-hidden="true"
                title={`拖动 ${course.title} 调整阵容顺序`}
                onDragStart={(event) => {
                  setDraggedCourseId(course.id);
                  event.dataTransfer.effectAllowed = "move";
                  event.dataTransfer.setData("text/plain", course.id);
                }}
                onDragEnd={() => setDraggedCourseId(null)}
              >
                <ReOrderDotsVertical24Regular aria-hidden="true" />
              </span>
              <button
                className={[
                  "roster-tile",
                  `status-${course.status}`,
                  course.id === season.heroCourseId ? "has-coach-art" : "",
                  course.id === selectedCourseId ? "is-selected" : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                type="button"
                aria-pressed={course.id === selectedCourseId}
                aria-label={`查看 ${course.title} 课程详情`}
                onClick={() => onSelectCourse(course.id)}
                data-focusable="true"
              >
                <span className="roster-tile__top">
                  <b>{course.code}</b>
                  <em>{COURSE_STATUS_LABEL[course.status]}</em>
                </span>
                {course.id === season.heroCourseId && (
                  <>
                    <span className="roster-tile__coach-chip">
                      FICTIONAL COACH
                    </span>
                    <img
                      className="roster-tile__coach-art"
                      src="/assets/fictional-course-coach-v1.png"
                      alt=""
                      aria-hidden="true"
                    />
                  </>
                )}
                <strong>{course.title}</strong>
                <small>
                  {COURSE_ROLE_LABEL[course.role]} · {course.credits} 学分
                </small>
                <span className="roster-tile__progress">
                  <i style={{ width: `${course.progressPct}%` }} />
                </span>
                <span className="roster-tile__action">
                  {course.progressPct}% · 查看详情
                  <ArrowRight24Regular aria-hidden="true" />
                </span>
              </button>
              <div className="roster-order-actions">
                <button
                  type="button"
                  disabled={index === 0}
                  aria-label={`上移 ${course.title}`}
                  onClick={() => moveCourse(course.id, -1)}
                  data-focusable="true"
                >
                  <ArrowSortUp24Regular aria-hidden="true" />
                </button>
                <button
                  type="button"
                  disabled={index === orderedCourses.length - 1}
                  aria-label={`下移 ${course.title}`}
                  onClick={() => moveCourse(course.id, 1)}
                  data-focusable="true"
                >
                  <ArrowSortDown24Regular aria-hidden="true" />
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="opportunity-card" aria-label="本周机会">
        <Sparkle24Regular aria-hidden="true" />
        <div>
          <span>OPTIONAL OPPORTUNITY</span>
          <strong>{season.opportunity.title}</strong>
          <p>{season.opportunity.detail}</p>
        </div>
      </section>
    </aside>
  );
}

import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft24Regular,
  ArrowRight24Regular,
  BookOpen24Regular,
  CalendarClock24Regular,
  Database24Regular,
  Open24Regular,
  Search24Regular,
  Warning24Regular,
} from "@fluentui/react-icons";

type CatalogCourse = {
  course_code: string;
  subject: string;
  subject_name: string;
  catalog_number: string;
  title: string;
  short_description: string;
  description: string;
  units: Array<number | string>;
  section_count: number;
  scheduled_section_count: number;
  tba_or_async_section_count: number;
  enrollment_status_counts: Record<string, number>;
  total_capacity_snapshot: number;
  total_enrollment_snapshot: number;
  instructors: string[];
  meeting_examples: Array<{
    section: string;
    session: string;
    component: string;
    days: string;
    start_time: string;
    end_time: string;
    instructors: string;
  }>;
  source_url: string;
};

type CatalogPayload = {
  schema_version: "1.0.0";
  data_mode: "public_course_catalog_snapshot";
  institution: string;
  term: { code: "2262"; label: "Summer 2026" };
  retrieved_at: string;
  source_locator: string;
  source_boundary: string;
  summary: {
    course_count: number;
    section_row_count: number;
    subject_count: number;
    with_long_description: number;
    with_scheduled_time: number;
    courses_without_returned_sections: number;
  };
  courses: CatalogCourse[];
};

type ScheduleFilter = "all" | "scheduled" | "description";

const PAGE_SIZE = 20;

export function UArizonaCatalogBrowser() {
  const [catalog, setCatalog] = useState<CatalogPayload | null>(null);
  const [loadState, setLoadState] = useState<"loading" | "ready" | "error">(
    "loading",
  );
  const [query, setQuery] = useState("");
  const [subject, setSubject] = useState("all");
  const [scheduleFilter, setScheduleFilter] =
    useState<ScheduleFilter>("all");
  const [page, setPage] = useState(0);
  const [selectedCourseCode, setSelectedCourseCode] = useState<string | null>(
    null,
  );

  useEffect(() => {
    let active = true;
    fetch("/data/uarizona-summer-2026.catalog.json")
      .then((response) => {
        if (!response.ok) throw new Error("catalog unavailable");
        return response.json() as Promise<CatalogPayload>;
      })
      .then((payload) => {
        if (!active) return;
        setCatalog(payload);
        setSelectedCourseCode(payload.courses[0]?.course_code ?? null);
        setLoadState("ready");
      })
      .catch(() => {
        if (active) setLoadState("error");
      });
    return () => {
      active = false;
    };
  }, []);

  const subjects = useMemo(() => {
    if (!catalog) return [];
    const labels = new Map<string, string>();
    catalog.courses.forEach((course) => {
      labels.set(course.subject, course.subject_name || course.subject);
    });
    return [...labels.entries()].sort(([left], [right]) =>
      left.localeCompare(right, "en"),
    );
  }, [catalog]);

  const filtered = useMemo(() => {
    if (!catalog) return [];
    const normalized = query.trim().toLocaleLowerCase();
    return catalog.courses.filter((course) => {
      if (subject !== "all" && course.subject !== subject) return false;
      if (scheduleFilter === "scheduled" && course.scheduled_section_count === 0) {
        return false;
      }
      if (scheduleFilter === "description" && !course.description) return false;
      if (!normalized) return true;
      return [
        course.course_code,
        course.title,
        course.short_description,
        course.description,
        course.subject,
        course.subject_name,
        ...course.instructors,
      ]
        .join(" ")
        .toLocaleLowerCase()
        .includes(normalized);
    });
  }, [catalog, query, scheduleFilter, subject]);

  useEffect(() => {
    setPage(0);
  }, [query, scheduleFilter, subject]);

  useEffect(() => {
    if (
      filtered.length > 0 &&
      !filtered.some((course) => course.course_code === selectedCourseCode)
    ) {
      setSelectedCourseCode(filtered[0].course_code);
    }
  }, [filtered, selectedCourseCode]);

  if (loadState === "loading") {
    return (
      <section className="ua-catalog ua-catalog--loading" aria-busy="true">
        <Database24Regular aria-hidden="true" />
        <strong>正在载入 UArizona Summer 2026 全量公开目录…</strong>
      </section>
    );
  }

  if (loadState === "error" || !catalog) {
    return (
      <section className="ua-catalog ua-catalog--error" role="alert">
        <Warning24Regular aria-hidden="true" />
        <div>
          <strong>公开目录快照没有载入</strong>
          <span>排课 Fixture 仍可使用；请检查 public/data 构建产物。</span>
        </div>
      </section>
    );
  }

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount - 1);
  const visibleCourses = filtered.slice(
    safePage * PAGE_SIZE,
    safePage * PAGE_SIZE + PAGE_SIZE,
  );
  const selected =
    catalog.courses.find(
      (course) => course.course_code === selectedCourseCode,
    ) ?? visibleCourses[0];

  return (
    <section className="ua-catalog" aria-labelledby="ua-catalog-heading">
      <header className="ua-catalog__heading">
        <div>
          <span>LIVE CATALOG SNAPSHOT // PUBLIC DATA</span>
          <h2 id="ua-catalog-heading">UArizona · Summer 2026 全量课程池</h2>
          <p>
            官方公共 API 快照已接入课程发现；排课求解仍使用独立、
            可回放的 Fixture，不会占座或写回 UAccess。
          </p>
        </div>
        <div className="ua-catalog__scoreboard" aria-label="目录统计">
          <span>
            <b>{catalog.summary.course_count.toLocaleString()}</b> 课程
          </span>
          <span>
            <b>{catalog.summary.section_row_count.toLocaleString()}</b> section 行
          </span>
          <span>
            <b>{catalog.summary.subject_count}</b> 学科
          </span>
        </div>
      </header>

      <div className="ua-catalog__boundary">
        <Database24Regular aria-hidden="true" />
        <span>
          抓取于 {catalog.retrieved_at.slice(0, 10)} · {catalog.source_boundary}
        </span>
      </div>

      <div className="ua-catalog__filters">
        <label>
          <span>SEARCH</span>
          <span className="ua-catalog__search">
            <Search24Regular aria-hidden="true" />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="课程号、名称、简介或公开教师姓名"
              data-focusable="true"
            />
          </span>
        </label>
        <label>
          <span>SUBJECT</span>
          <select
            value={subject}
            onChange={(event) => setSubject(event.target.value)}
            data-focusable="true"
          >
            <option value="all">全部 {catalog.summary.subject_count} 个学科</option>
            {subjects.map(([code, label]) => (
              <option key={code} value={code}>
                {code} · {label}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span>DATA LANE</span>
          <select
            value={scheduleFilter}
            onChange={(event) =>
              setScheduleFilter(event.target.value as ScheduleFilter)
            }
            data-focusable="true"
          >
            <option value="all">全部课程</option>
            <option value="scheduled">有明确上课时间</option>
            <option value="description">有完整课程简介</option>
          </select>
        </label>
      </div>

      <div className="ua-catalog__workspace">
        <section className="ua-catalog__list" aria-label="课程检索结果">
          <header>
            <strong>{filtered.length.toLocaleString()} 门匹配</strong>
            <span>
              {safePage + 1} / {pageCount}
            </span>
          </header>
          <div>
            {visibleCourses.map((course) => (
              <button
                type="button"
                key={course.course_code}
                className={
                  selected?.course_code === course.course_code
                    ? "is-selected"
                    : ""
                }
                onClick={() => setSelectedCourseCode(course.course_code)}
                data-focusable="true"
              >
                <span>
                  <b>{course.course_code}</b>
                  <small>{course.subject_name || course.subject}</small>
                </span>
                <strong>{course.title}</strong>
                <em>
                  {course.section_count} sections ·{" "}
                  {course.scheduled_section_count
                    ? `${course.scheduled_section_count} 有时段`
                    : "TBA / 异步 / 未返回时段"}
                </em>
              </button>
            ))}
          </div>
          <footer>
            <button
              type="button"
              disabled={safePage === 0}
              onClick={() => setPage((current) => Math.max(0, current - 1))}
              data-focusable="true"
            >
              <ArrowLeft24Regular aria-hidden="true" />
              上一页
            </button>
            <button
              type="button"
              disabled={safePage >= pageCount - 1}
              onClick={() =>
                setPage((current) => Math.min(pageCount - 1, current + 1))
              }
              data-focusable="true"
            >
              下一页
              <ArrowRight24Regular aria-hidden="true" />
            </button>
          </footer>
        </section>

        {selected && (
          <article className="ua-catalog__detail">
            <header>
              <div>
                <span>{selected.subject_name || selected.subject}</span>
                <h3>
                  {selected.course_code} · {selected.title}
                </h3>
              </div>
              <b>{selected.units.length ? selected.units.join(" / ") : "TBA"} units</b>
            </header>
            <p>
              {selected.description ||
                selected.short_description ||
                "公共课程详情接口未返回课程简介；系统不会补猜。"}
            </p>
            <dl>
              <div>
                <dt>Section 快照</dt>
                <dd>{selected.section_count}</dd>
              </div>
              <div>
                <dt>明确时段</dt>
                <dd>{selected.scheduled_section_count}</dd>
              </div>
              <div>
                <dt>TBA / 异步</dt>
                <dd>{selected.tba_or_async_section_count}</dd>
              </div>
              <div>
                <dt>容量 / 已选快照</dt>
                <dd>
                  {selected.total_capacity_snapshot} /{" "}
                  {selected.total_enrollment_snapshot}
                </dd>
              </div>
            </dl>

            {selected.meeting_examples.length > 0 && (
              <section className="ua-catalog__meetings">
                <h4>
                  <CalendarClock24Regular aria-hidden="true" />
                  代表性公开时段
                </h4>
                {selected.meeting_examples.map((meeting) => (
                  <div
                    key={`${selected.course_code}-${meeting.section}-${meeting.days}-${meeting.start_time}`}
                  >
                    <strong>
                      {meeting.days} {meeting.start_time}–{meeting.end_time}
                    </strong>
                    <span>
                      {meeting.component} · {meeting.session}
                    </span>
                    <small>{meeting.instructors || "教师待定"}</small>
                  </div>
                ))}
              </section>
            )}

            <div className="ua-catalog__detail-footer">
              <span>
                <BookOpen24Regular aria-hidden="true" />
                {selected.instructors.length
                  ? selected.instructors.slice(0, 4).join(" · ")
                  : "公开教师信息待定"}
              </span>
              <a
                href={selected.source_url}
                target="_blank"
                rel="noreferrer"
                data-focusable="true"
              >
                打开官方课程详情
                <Open24Regular aria-hidden="true" />
              </a>
            </div>
          </article>
        )}
      </div>
    </section>
  );
}

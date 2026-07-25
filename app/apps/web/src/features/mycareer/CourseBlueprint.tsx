import { useMemo, useState } from "react";
import {
  ArrowRight24Regular,
  Beaker24Regular,
  BookOpen24Regular,
  BranchFork24Regular,
  CheckmarkCircle24Filled,
  DocumentSearch24Regular,
  ShieldCheckmark24Regular,
  Warning24Regular,
} from "@fluentui/react-icons";
import { SLS_240_COURSE_PACK } from "./coursePack";

const KIND_LABEL = {
  concept: "概念",
  procedure: "方法",
  evidence: "证据",
  boundary: "边界",
} as const;

export function CourseBlueprint() {
  const pack = SLS_240_COURSE_PACK;
  const [selectedUnitId, setSelectedUnitId] = useState(pack.units[0]?.id ?? "");
  const [showLabs, setShowLabs] = useState(false);
  const [showSeason, setShowSeason] = useState(true);
  const [openWeek, setOpenWeek] = useState<number | null>(1);
  const selectedUnit =
    pack.units.find((unit) => unit.id === selectedUnitId) ?? pack.units[0];
  const nodeCount = useMemo(
    () => pack.units.reduce((total, unit) => total + unit.knowledge_nodes.length, 0),
    [pack.units],
  );

  if (!selectedUnit) return null;

  return (
    <section className="course-blueprint" aria-labelledby="course-blueprint-heading">
      <header className="course-blueprint__header">
        <div>
          <span>FULL COURSE BLUEPRINT · PUBLIC-SAFE DEMO</span>
          <h4 id="course-blueprint-heading">SLS 240 完整课程战术板</h4>
          <p>{pack.course.goal}</p>
        </div>
        <ShieldCheckmark24Regular aria-hidden="true" />
      </header>

      <dl className="course-blueprint__stats">
        <div><dt>原始来源</dt><dd>{pack.source_coverage.original_files} 份</dd></div>
        <div><dt>视觉核验</dt><dd>{pack.source_coverage.visually_reviewed_pages}/{pack.source_coverage.reviewed_pages_total}</dd></div>
        <div><dt>知识节点</dt><dd>{nodeCount}</dd></div>
        <div><dt>实验 / 考核</dt><dd>{pack.labs.length} / {pack.assessments.length}</dd></div>
      </dl>

      <div className="course-blueprint__boundary">
        <DocumentSearch24Regular aria-hidden="true" />
        <p>{pack.course.source_boundary}</p>
      </div>

      <section className="course-season" aria-labelledby="course-season-heading">
        <header className="course-season__header">
          <div>
            <span>16-WEEK SEASON · 48 PLAYABLE SESSIONS</span>
            <h5 id="course-season-heading">这是一门完整课程，不是一张 Demo 卡</h5>
            <p>
              每周固定为 Briefing、Workshop、Replay 三个回合；所有产物自动保存，
              赛季末进入可选择退出公开直播的 World Exam Finals。
            </p>
          </div>
          <button
            type="button"
            aria-expanded={showSeason}
            onClick={() => setShowSeason((current) => !current)}
            data-focusable="true"
          >
            {showSeason ? "收起赛季" : "展开赛季"}
          </button>
        </header>
        {showSeason && (
          <ol className="course-season__weeks">
            {pack.season_plan.map((week) => (
              <li
                key={week.week}
                data-open={openWeek === week.week ? "" : undefined}
              >
                <button
                  type="button"
                  aria-expanded={openWeek === week.week}
                  onClick={() =>
                    setOpenWeek((current) =>
                      current === week.week ? null : week.week,
                    )
                  }
                  aria-label={`第 ${week.week} 周：${week.title}`}
                  data-focusable="true"
                >
                  <span className="course-season__number">
                    W{String(week.week).padStart(2, "0")}
                  </span>
                  <span className="course-season__summary">
                    <small>{week.phase}</small>
                    <strong>{week.title}</strong>
                    <em>{week.guiding_question}</em>
                  </span>
                  <ArrowRight24Regular aria-hidden="true" />
                </button>
                <div className="course-season__detail">
                  <ol aria-label={`第 ${week.week} 周三个学习回合`}>
                    {week.sessions.map((session, index) => (
                      <li key={`${week.week}-${session.mode}-${index}`}>
                        <small>{session.mode}</small>
                        <strong>{session.title}</strong>
                      </li>
                    ))}
                  </ol>
                  <dl>
                    <div>
                      <dt>本周证据</dt>
                      <dd>{week.evidence}</dd>
                    </div>
                    <div>
                      <dt>过关条件</dt>
                      <dd>{week.checkpoint}</dd>
                    </div>
                  </dl>
                  <div className="course-node__sources">
                    {week.source_refs.map((source) => (
                      <code key={source}>{source}</code>
                    ))}
                  </div>
                </div>
              </li>
            ))}
          </ol>
        )}
      </section>

      <ol className="course-teaching-loop" aria-label="统一教学循环">
        {pack.teaching_loop.map((step, index) => (
          <li key={step.id} title={step.purpose}>
            <span>{String(index + 1).padStart(2, "0")}</span>
            <strong>{step.label}</strong>
          </li>
        ))}
      </ol>

      <nav className="course-unit-tabs" aria-label="课程单元">
        {pack.units.map((unit, index) => (
          <button
            type="button"
            key={unit.id}
            className={unit.id === selectedUnit.id ? "is-active" : ""}
            aria-pressed={unit.id === selectedUnit.id}
            onClick={() => setSelectedUnitId(unit.id)}
            data-focusable="true"
          >
            <span>UNIT {String(index + 1).padStart(2, "0")}</span>
            <strong>{unit.title}</strong>
            <small>{unit.knowledge_nodes.length} 节点 · {unit.lessons.length} 回合</small>
          </button>
        ))}
      </nav>

      <article className="course-unit-briefing">
        <span>WHY THIS UNIT</span>
        <h5>{selectedUnit.title}</h5>
        <p>{selectedUnit.why}</p>
        <ul>
          {selectedUnit.objectives.map((objective) => (
            <li key={objective}><CheckmarkCircle24Filled aria-hidden="true" />{objective}</li>
          ))}
        </ul>
      </article>

      <div className="course-lesson-grid">
        {selectedUnit.lessons.map((lesson) => (
          <article key={lesson.id}>
            <BookOpen24Regular aria-hidden="true" />
            <span>
              <small>{lesson.duration_minutes} MIN · AUTO-SAVE</small>
              <strong>{lesson.title}</strong>
              <em>{lesson.sequence.join(" → ")}</em>
            </span>
          </article>
        ))}
      </div>

      <div className="course-node-list">
        {selectedUnit.knowledge_nodes.map((node, index) => (
          <article key={node.id} className={`course-node course-node--${node.kind}`}>
            <header>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <div>
                <small>{KIND_LABEL[node.kind]} · {node.id}</small>
                <h5>{node.title}</h5>
              </div>
              <b>{node.prerequisite_ids.length === 0 ? "起点" : `${node.prerequisite_ids.length} 前置`}</b>
            </header>
            <p>{node.explanation}</p>
            <dl>
              <div>
                <dt><Warning24Regular aria-hidden="true" /> 常见误区</dt>
                <dd>{node.misconception}</dd>
              </div>
              <div>
                <dt><ArrowRight24Regular aria-hidden="true" /> 理解检查</dt>
                <dd>{node.check}</dd>
              </div>
            </dl>
            <div className="course-node__sources">
              {node.source_refs.map((source) => <code key={source}>{source}</code>)}
            </div>
          </article>
        ))}
      </div>

      <button
        className="course-blueprint__expand"
        type="button"
        aria-expanded={showLabs}
        onClick={() => setShowLabs((current) => !current)}
        data-focusable="true"
      >
        <Beaker24Regular aria-hidden="true" />
        {showLabs ? "收起实验与考核" : "展开 5 个实验与 5 个考核"}
        <BranchFork24Regular aria-hidden="true" />
      </button>

      {showLabs && (
        <div className="course-capstone-grid">
          <section>
            <h5>LAB PLAYLIST</h5>
            {pack.labs.map((lab) => (
              <article key={lab.id}>
                <strong>{lab.title}</strong>
                <p>{lab.deliverable}</p>
                <small>{lab.safety}</small>
              </article>
            ))}
          </section>
          <section>
            <h5>ASSESSMENT PLAYLIST</h5>
            {pack.assessments.map((assessment) => (
              <article key={assessment.id}>
                <strong>{assessment.title}</strong>
                <p>{assessment.checks.join(" · ")}</p>
                <small>{assessment.feedback}</small>
              </article>
            ))}
          </section>
        </div>
      )}
    </section>
  );
}

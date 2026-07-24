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

import {
  ArrowRight24Regular,
  BookOpen24Regular,
  CalendarClock24Regular,
  DataTrending24Regular,
  Info24Regular,
  Play24Filled,
  Replay24Regular,
  Trophy24Regular,
} from "@fluentui/react-icons";
import {
  canOpenReplay,
  canStartLearning,
  COURSE_ROLE_LABEL,
  COURSE_STATUS_LABEL,
  getLearningSummary,
} from "./engine";
import type { DemoCourse } from "./types";
import { useI18n } from "../../i18n/I18nProvider";
import { CourseBlueprint } from "./CourseBlueprint";
import { SourceBoundCoach } from "../ai/SourceBoundCoach";
import "./mycareer.css";

type CourseDetailProps = {
  course: DemoCourse;
  onOpenWorldExam: () => void;
  onStartLearning: () => void;
  onOpenReplay: () => void;
};

export function CourseDetail({
  course,
  onOpenWorldExam,
  onStartLearning,
  onOpenReplay,
}: CourseDetailProps) {
  const { formatDate } = useI18n();
  const formatSessionDate = (value: string) =>
    formatDate(value, {
      month: "numeric",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  const learning = getLearningSummary(course);
  const learningReady = canStartLearning(course);
  const replayReady = canOpenReplay(course);
  const hasFictionalCoach = course.id === "signal-linear-systems";

  return (
    <section
      className="course-detail"
      aria-labelledby="course-detail-heading"
      key={course.id}
    >
      <div
        className={`course-detail__hero${
          hasFictionalCoach ? " course-detail__hero--with-coach" : ""
        }`}
      >
        <div className="course-detail__identity">
          <span className="panel-label">COURSE CARD · 课程卡</span>
          <p>{course.code}</p>
          <h3 id="course-detail-heading">{course.title}</h3>
          {hasFictionalCoach && (
            <div className="course-coach-boundary">
              <span>COURSE COACH // FICTIONAL FIXTURE</span>
              <strong>SLS 课程教练 · 虚构角色</strong>
              <small>仅作 Demo 视觉，不代表真实教师，也不用于推断教学风格。</small>
            </div>
          )}
        </div>
        <span className={`course-status status-${course.status}`}>
          {COURSE_STATUS_LABEL[course.status]}
        </span>
        {hasFictionalCoach && (
          <img
            className="course-coach-portrait"
            src="/assets/fictional-course-coach-v1.png"
            alt="虚构的信号与线性系统课程教练站在蓝橙色实验室中"
          />
        )}
      </div>

      <dl className="course-facts">
        <div>
          <dt>课程角色</dt>
          <dd>
            {COURSE_ROLE_LABEL[course.role]} · {course.credits} 学分
          </dd>
        </div>
        <div>
          <dt>上课时间</dt>
          <dd>{course.schedule}</dd>
        </div>
        <div>
          <dt>索引来源</dt>
          <dd>{course.sourceRef}</dd>
        </div>
      </dl>

      <div className="course-progress">
        <div>
          <span>当前课程进度</span>
          <strong>{course.progressPct}%</strong>
        </div>
        <div
          className="course-progress__meter"
          role="progressbar"
          aria-label={`${course.title} 课程进度`}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={course.progressPct}
        >
          <span style={{ width: `${course.progressPct}%` }} />
        </div>
      </div>

      <div className="course-next-move">
        <ArrowRight24Regular aria-hidden="true" />
        <div>
          <span>NEXT MOVE</span>
          <strong>{course.nextAction}</strong>
        </div>
      </div>

      <div className="course-content-gate">
        <BookOpen24Regular aria-hidden="true" />
        <div>
          <span>智课工坊发布内容</span>
          <strong>
            {learningReady
              ? `已连接 ${course.linkedPublishedId}`
              : "学习内容准备中"}
          </strong>
          <small>
            {learningReady
              ? "进入的是教师审核后的发布版本，可随时返回赛季中心。"
              : "本课程暂时没有已发布内容；课程资料和进度不会因此丢失。"}
          </small>
        </div>
        <button
          type="button"
          disabled={!learningReady}
          onClick={onStartLearning}
          data-focusable="true"
        >
          {learningReady ? (
            <>
              <Play24Filled aria-hidden="true" />
              开始学习
            </>
          ) : (
            <>
              <CalendarClock24Regular aria-hidden="true" />
              准备中
            </>
          )}
        </button>
      </div>

      {course.id === "signal-linear-systems" && (
        <>
          <div className="course-content-gate course-content-gate--exam">
            <Trophy24Regular aria-hidden="true" />
            <div>
              <span>WORLD EXAM FINALS</span>
              <strong>模拟期末已开放赛前简报</strong>
              <small>
                从已审核内容进入热身、复习战术板、开放式 AI 赛场与私密复盘；不计正式成绩。
              </small>
            </div>
            <button
              type="button"
              onClick={onOpenWorldExam}
              data-focusable="true"
            >
              <Trophy24Regular aria-hidden="true" />
              进入模拟期末
            </button>
          </div>
          <SourceBoundCoach
            task="course_explanation"
            eyebrow="AI FILM ROOM // SOURCE-BOUND"
            title="生成一条真正可执行的 AI 学习路径"
            subject={`${course.code} ${course.title}`}
            question="请根据课程进度、下一动作和公开课程索引，给出从诊断、讲解、练习到证据回放的可验证学习路径。"
            consentRequired={false}
            boundary="只发送 Demo 课程状态和公开索引引用；AI 不能读取原始私人课件、改成绩或替代教师审核。"
            actionLabel="生成本课程 AI 学习路径"
            facts={[
              {
                label: "当前进度",
                value: `${course.progressPct}%`,
                source_id: `${course.sourceRef}:progress-fixture`,
              },
              {
                label: "下一动作",
                value: course.nextAction,
                source_id: `${course.sourceRef}:next-action`,
              },
              {
                label: "教学蓝图",
                value: "38 个知识节点；预测—建模—仿真—测量—解释—迁移",
                source_id: "course-pack:sls-240:v1",
              },
            ]}
          />
          <CourseBlueprint />
        </>
      )}

      <section className="box-score-card" aria-labelledby="box-score-heading">
        <div className="box-score-card__heading">
          <DataTrending24Regular aria-hidden="true" />
          <div>
            <span>LAST SESSION</span>
            <h4 id="box-score-heading">最近学习 Box Score</h4>
          </div>
          <span className="fixture-badge">
            <Info24Regular aria-hidden="true" />
            演示
          </span>
        </div>
        {learning.state === "ready" ? (
          <>
            <dl className="box-score-stats">
              <div>
                <dt>完成度</dt>
                <dd>{learning.completionPct}%</dd>
              </div>
              <div>
                <dt>正确率</dt>
                <dd>{learning.accuracyPct}%</dd>
              </div>
              <div>
                <dt>用时</dt>
                <dd>{learning.durationLabel}</dd>
              </div>
            </dl>
            <small className="box-score-card__time">
              最近记录：{formatSessionDate(learning.completedAt)} ·
              仅为本地演示互动，不代表成绩
            </small>
            <button
              className="box-score-replay"
              type="button"
              disabled={!replayReady}
              onClick={onOpenReplay}
              data-focusable="true"
            >
              <Replay24Regular aria-hidden="true" />
              查看完整回放
            </button>
          </>
        ) : (
          <div className="box-score-empty">
            <Replay24Regular aria-hidden="true" />
            <div>
              <strong>{learning.label}</strong>
              <span>完成一次已发布的学习互动后，这里会出现可追溯摘要。</span>
            </div>
          </div>
        )}
      </section>
    </section>
  );
}

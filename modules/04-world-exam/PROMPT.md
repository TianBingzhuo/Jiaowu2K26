# World Exam Finals · AI 协作提示词

> **统一体验硬约束：** 任何界面工作必须先读 [DESIGN-SYSTEM](../../engineering/DESIGN-SYSTEM.md)，复用同一全局 Shell、Token、组件、图标、动效与 `Briefing → Choose → Execute → Replay → Next Move` 循环；本模块不得独立换肤。

> **模块编号：** F-005 · **优先级：** P1 首选
> **阅读本文件后无需查阅其他文档即可开始工作。**

## 项目上下文（30 秒）

jiaowu2K26 是覆盖大学四到八年学习、选课、成长、协作与机会发现的体验层。World Exam Finals 是 P1 首选模块——**把课前准备、阶段检查、期中/期末、复习和证据回放组织成一条有记忆点但不美化焦虑的赛事体验**。

## 本模块使命

大学考试季是信息碎片化最严重的时期：复习资料散落在 PPT、录音、笔记、群聊里，学生不知道哪些是重点、哪些已掌握、哪些还要补。传统系统只提供考试时间表和成绩，不帮学生规划"怎么准备"。

World Exam Finals 把每一次重要考核变成一个有准备节奏的"赛事节点"：赛前有简报和热身，赛中有来源可追溯的答题体验，赛后有回放和可编辑的下一步。它复用智课工坊（F-001）已审核的学习内容，不另造一套内容系统。

**一句话价值：** 学生从赛前简报进入复习，完成一次有来源的练习，查看错误类型和来源，再得到可编辑的下一步——同一流程可切到无赛事隐喻的普通模式。

---

## 角色与分工

### 产品设计
- 定义赛前简报→热身→复习→考试→回放→复盘的完整旅程
- 编写赛事叙事强度调节方案（沉浸/轻量/传统三档）
- 设计压力友好模式的触发与降级逻辑
- **缺省时 AI 补位：** 根据本文件交互流程和数据模型生成验收场景

### 前端
- 实现 5 个核心页面：赛事日历、赛前简报、复习 Playbook、Key Match 答题、Replay/Box Score
- 实现赛事叙事组件（倒计时、赛事语言、动效）和压力友好模式开关
- **缺省时 AI 补位：** 根据下方数据模型和 API 合同生成 React + TypeScript 组件骨架

### 后端
- 实现 10 个 API 端点（见下方 API 合同）
- 实现考试事件状态机：`scheduled → briefing_open → warmup → exam_active → review → archived`
- 复用 F-001 的 SourceFragment、GeneratedObject、ReviewEvent 合同
- **缺省时 AI 补位：** 根据 API 合同生成 Rust/Axum 或 FastAPI 端点框架

### 宣发
- 截取赛事叙事关键页面制作路演 Before/After
- 设计"普通模式 vs 赛事模式"对比演示
- **缺省时 AI 补位：** AI 生成文案和视觉描述

---

## 核心交互流程

```
学生在赛事日历看到即将到来的 Key Match（期中/期末/大作业）
  → 点击某个 Key Match 进入赛前简报
  → 简报显示：考核范围、来源材料列表、能力目标、可用资源、当前准备状态
  → 学生进入 Warm-up（低风险热身题），检查起点水平
  → 热身完成后可查看复习 Playbook（教师批准的知识点/例题/复习卡/练习顺序）
  → 学生按 Playbook 或个人计划复习，系统记录 Checkpoint（已覆盖/薄弱/未知/待问）
  → Key Match 正式开始（线下考试 or 线上 Open-book AI Exam）
  → 答题过程中每题可回指来源（Show your work）
  → 考后查看 Replay（回放题目、行动、来源、教师说明）
  → 查看 Box Score（掌握趋势、错误类别、投入和下一步；不公开排名）
  → 完成赛后复盘（哪里有效、哪里卡住、下一步调整；可导出给导师）
```

---

## 数据模型

### ExamEvent（考试事件）

```json
{
  "id": "string (exam-xxx)",
  "course_id": "string",
  "type": "warmup | quiz | midterm | final | project | presentation",
  "title": "string",
  "description": "string",
  "scheduled_at": "ISO-8601",
  "duration_minutes": "number | null",
  "status": "scheduled | briefing_open | warmup | exam_active | review | archived",
  "scope": "individual | group | class",
  "is_formal": "boolean (是否正式考核)",
  "narrative_mode": "immersive | light | traditional",
  "config": {
    "allow_retry": "boolean",
    "max_attempts": "number | null",
    "show_sources": "boolean",
    "open_book_ai": "boolean",
    "feedback_delay_minutes": "number | null"
  },
  "created_by": "string (teacher-xxx | system)",
  "created_at": "ISO-8601",
  "updated_at": "ISO-8601"
}
```

### PreGameBriefing（赛前简报）

```json
{
  "exam_event_id": "string (exam-xxx)",
  "scope_summary": "string (考核范围描述)",
  "source_materials": [
    {
      "material_id": "string",
      "title": "string",
      "type": "slide | transcript | handout",
      "coverage": "string (覆盖哪些知识点)"
    }
  ],
  "competency_targets": [
    {
      "id": "string (comp-xxx)",
      "name": "string",
      "description": "string",
      "weight": "number (0-1)"
    }
  ],
  "available_resources": [
    { "type": "review_card | practice_set | script", "id": "string", "title": "string" }
  ],
  "readiness_snapshot": {
    "coverage_percent": "number (0-100, 基于 Checkpoint)",
    "weak_areas": ["string"],
    "unknown_areas": ["string"],
    "last_checkpoint_at": "ISO-8601 | null"
  },
  "generated_at": "ISO-8601"
}
```

### ReviewPlaybook（复习 Playbook）

```json
{
  "id": "string (playbook-xxx)",
  "exam_event_id": "string",
  "teacher_id": "string",
  "sections": [
    {
      "id": "string (sec-xxx)",
      "title": "string",
      "knowledge_points": ["string"],
      "suggested_order": "number",
      "items": [
        {
          "type": "review_card | practice_question | example | script",
          "object_id": "string (来自 F-001 GeneratedObject)",
          "source_ids": ["string (src-xxx)"],
          "estimated_minutes": "number",
          "difficulty": "basic | intermediate | advanced"
        }
      ]
    }
  ],
  "student_overrides": {
    "reordered_sections": ["string (sec-xxx)"],
    "skipped_items": ["string (object_id)"],
    "added_notes": [{ "item_id": "string", "note": "string" }]
  },
  "approved_at": "ISO-8601",
  "updated_at": "ISO-8601"
}
```

### Checkpoint（检查点 / 复习进度）

```json
{
  "id": "string (cp-xxx)",
  "exam_event_id": "string",
  "student_id": "string",
  "period": "string (week-3 | unit-2 | 自定义)",
  "covered": ["string (knowledge_point_id)"],
  "weak": ["string (knowledge_point_id)"],
  "unknown": ["string (knowledge_point_id)"],
  "pending_questions": [
    { "question_text": "string", "context": "string", "created_at": "ISO-8601" }
  ],
  "time_spent_minutes": "number",
  "attempt_count": "number",
  "correct_count": "number",
  "created_at": "ISO-8601",
  "updated_at": "ISO-8601"
}
```

### ExamAttempt（答题记录）

```json
{
  "id": "string (att-xxx)",
  "exam_event_id": "string",
  "student_id": "string",
  "attempt_number": "number",
  "started_at": "ISO-8601",
  "submitted_at": "ISO-8601 | null",
  "status": "in_progress | submitted | graded | reviewing",
  "answers": [
    {
      "question_id": "string (来自 F-001 GeneratedObject)",
      "question_type": "single_choice | multi_choice | short_answer | essay | code",
      "student_response": "string | number | object",
      "is_correct": "boolean | null",
      "time_spent_seconds": "number",
      "source_ids": ["string (该题对应的来源)"],
      "error_category": "conceptual | computational | careless | unknown | null",
      "feedback": "string | null",
      "ai_source_trace": [
        {
          "claim": "string (AI 的某个断言)",
          "source_id": "string (src-xxx)",
          "locator": "string (P.12 | 03:45)",
          "match_confidence": "high | medium | low | unsupported"
        }
      ]
    }
  ],
  "total_score": "number | null",
  "max_score": "number",
  "teacher_notes": "string | null"
}
```

### ReplayData（回放数据）

```json
{
  "exam_event_id": "string",
  "student_id": "string",
  "attempt_id": "string",
  "timeline": [
    {
      "timestamp": "ISO-8601",
      "event_type": "question_viewed | answer_submitted | source_checked | hint_used | retry | flag",
      "question_id": "string | null",
      "detail": "object"
    }
  ],
  "source_trace_summary": [
    {
      "source_id": "string",
      "times_referenced": "number",
      "locator": "string",
      "relevance": "high | medium | low"
    }
  ],
  "error_pattern": {
    "conceptual": "number",
    "computational": "number",
    "careless": "number",
    "unknown": "number"
  },
  "teacher_explanations": [
    { "question_id": "string", "explanation": "string", "source_ids": ["string"] }
  ],
  "post_corrections": [
    { "question_id": "string", "correction": "string", "corrected_at": "ISO-8601" }
  ]
}
```

### BoxScore（赛事统计卡）

```json
{
  "exam_event_id": "string",
  "student_id": "string",
  "competency_trends": [
    {
      "competency_id": "string",
      "name": "string",
      "mastery_level": "not_started | developing | proficient | advanced",
      "evidence_count": "number",
      "trend": "improving | stable | declining | insufficient_data"
    }
  ],
  "error_categories": {
    "conceptual": { "count": "number", "examples": ["string (question_id)"] },
    "computational": { "count": "number", "examples": ["string"] },
    "careless": { "count": "number", "examples": ["string"] },
    "unknown": { "count": "number", "examples": ["string"] }
  },
  "time_investment": {
    "total_study_minutes": "number",
    "practice_attempts": "number",
    "review_sessions": "number"
  },
  "next_steps": [
    {
      "action": "string",
      "reason": "string",
      "priority": "high | medium | low",
      "linked_resources": [{ "type": "string", "id": "string" }]
    }
  ],
  "generated_at": "ISO-8601"
}
```

### PostGameReflection（赛后复盘）

```json
{
  "id": "string (ref-xxx)",
  "exam_event_id": "string",
  "student_id": "string",
  "what_worked": "string",
  "what_stuck": "string",
  "next_adjustment": "string",
  "share_consent": {
    "share_with_advisor": "boolean",
    "share_with_teacher": "boolean",
    "expires_at": "ISO-8601 | null"
  },
  "created_at": "ISO-8601",
  "updated_at": "ISO-8601"
}
```

---

## API 合同

| 方法 | 路径 | 描述 | 请求体 | 响应体 |
|------|------|------|--------|--------|
| GET | `/api/v1/exam-events` | 列出考试事件（赛事日历） | `?course_id=&status=&from=&to=` | `{ events: ExamEvent[] }` |
| GET | `/api/v1/exam-events/:id/briefing` | 获取赛前简报 | — | `PreGameBriefing` |
| GET | `/api/v1/exam-events/:id/playbook` | 获取复习 Playbook | — | `ReviewPlaybook` |
| PUT | `/api/v1/exam-events/:id/playbook/overrides` | 学生调整个人复习计划 | `{ reordered_sections, skipped_items, added_notes }` | `ReviewPlaybook` |
| POST | `/api/v1/exam-events/:id/warmup` | 提交热身答题 | `{ answers: [{ question_id, response }] }` | `{ results, readiness_update }` |
| GET | `/api/v1/exam-events/:id/checkpoints` | 获取检查点列表 | `?student_id=` | `{ checkpoints: Checkpoint[] }` |
| POST | `/api/v1/exam-events/:id/attempts` | 开始/提交答题 | `{ attempt_number?, answers? }` | `ExamAttempt` |
| GET | `/api/v1/exam-events/:id/replay` | 获取回放数据 | `?attempt_id=` | `ReplayData` |
| GET | `/api/v1/exam-events/:id/box-score` | 获取赛事统计卡 | `?student_id=` | `BoxScore` |
| POST | `/api/v1/exam-events/:id/reflection` | 提交赛后复盘 | `PostGameReflection (不含 id)` | `PostGameReflection` |

---

## UI 要求

### 赛事日历页 (`/exam-calendar`)
- 统一时间线展示：练习、复习、Office Hours、考试、提交节点
- 正式安排 vs 个人计划用不同视觉区分
- Key Match（重要考核）高亮显示，带倒计时
- 叙事强度切换：沉浸（赛事语言+动效）/ 轻量（简化措辞）/ 传统（普通列表）
- 压力友好模式入口：关闭倒计时动效、音效和赛事语言

### 赛前简报页 (`/exam/:id/briefing`)
- 顶部：考核范围、时间、类型
- 来源材料列表（可点击跳转到智课工坊已发布内容）
- 能力目标和权重（柱状或雷达图 + 文本等价）
- 当前准备状态快照（覆盖率、薄弱区、未知区）
- 可用资源入口（复习卡、练习集、脚本）
- **禁止：** 预测"必过/必挂"、使用恐吓式 FOMO 语言

### 复习 Playbook 页 (`/exam/:id/playbook`)
- 教师批准的知识点/例题/复习卡按顺序排列
- 学生可拖拽调整顺序、跳过项目、添加个人笔记
- 每项显示预估时间和难度
- 复习进度指示（已覆盖/未覆盖/薄弱）
- 来源 Badge（来自 PPT / 口播 / 教师确认）

### Key Match 答题页 (`/exam/:id/attempt`)
- 题目清晰展示，每题可展开"查看来源"抽屉
- Open-book AI Exam 模式：AI 辅助输出必须逐项回指来源
- 答题进度条 + 剩余时间（可关闭倒计时）
- 提交后等待反馈（根据教师配置的 feedback_delay）
- 压力友好模式下显示普通学习界面

### Replay / Box Score 页 (`/exam/:id/replay`)
- 时间线回放：每个操作按时间排列（查看题目→作答→查看来源→重试）
- Box Score 仪表盘：
  - 掌握趋势（各知识点的掌握级别 + 趋势方向）
  - 错误类别分布（概念性/计算/粗心/未知）
  - 投入统计（学习时间、练习次数、复习节数）
  - 下一步建议（可操作、有依据、有优先级）
- **禁止：** 公开班级排名、伪精确胜率、GPA 天梯
- 正式考试内容受权限限制（只有授权角色可查看完整题目）

### 赛后复盘页 (`/exam/:id/reflection`)
- 三个开放文本区：哪里有效 / 哪里卡住 / 下一次如何调整
- 分享控制：选择是否导出给导师，需本人明确同意
- 可导出为 PDF/JSON
- 复盘内容私密，默认只有学生自己可见

---

## 验收标准

- [ ] 赛事日历展示所有考试事件，正式 vs 个人计划视觉区分
- [ ] 赛前简报加载来源材料、能力目标和准备状态快照
- [ ] Warm-up 热身题可完成、可跳过、可重试，不计正式成绩
- [ ] 复习 Playbook 由教师批准，学生可调整顺序和跳过项
- [ ] Checkpoint 记录已覆盖/薄弱/未知/待问，不以一场失误定义长期能力
- [ ] Key Match 答题过程每题可回指来源（Show your work）
- [ ] Open-book AI Exam 中 AI 输出逐项回指来源，教师可挑战证据
- [ ] Replay 时间线完整回放答题过程、来源引用和教师说明
- [ ] Box Score 展示掌握趋势、错误类别和下一步，不公开排名
- [ ] 赛后复盘可编辑、可导出、分享需本人同意
- [ ] 叙事强度三档可切换（沉浸/轻量/传统），传统模式完全可用
- [ ] 压力友好模式：可关闭赛事语言、倒计时动效和音效
- [ ] 复用 F-001 的 SourceFragment / GeneratedObject / ReviewEvent 合同
- [ ] Demo Mode 可用：使用 fixture 数据完整演示全部流程

---

## 依赖

- **F-001 智课工坊：** 复用已审核的 SourceFragment、GeneratedObject、PublishedVersion
  > F-001 关键实体摘要（避免跨模块查找）：
  > - `SourceFragment`：{ id, course_id, page_range, knowledge_ids, excerpt }
  > - `EvidenceItem`：{ id, source_id, evidence_type, generated_by, verified_by }
  > - `GeneratedObject`：{ id, source_ids[], evidence_ids[], status, teacher_version }
- **F-003 Academic Mirror（可选）：** 获取课程和学期上下文数据
- 共享能力引用：X-02 来源与证据、X-03 事件与审计、X-05 同意与隐私、X-08 可访问性、X-09 离线与降级、X-11 个人数据可携带

## 回退策略

| 如果 | 则 |
|------|-----|
| F-001 已审核内容不足 | 使用教师手工准备的 fixture 题目和复习卡 |
| AI 模型不可用 | Open-book AI Exam 降级为"查看来源"模式，不做 AI 辅助 |
| 数据库不可用 | 使用 SQLite 或 JSONL 文件存储答题记录 |
| 网络断开 | PWA 离线模式，答题数据本地缓存，恢复后同步 |
| 来源追溯不完整 | 标记"来源不可用"，不编造引用 |
| 赛事叙事被用户关闭 | 切到传统模式，所有功能仍可用 |
| 求解器/推荐不可用 | 下一步建议显示"数据不足，请手动选择" |

## 技术选型参考

- **前端：** React + TypeScript + Vite，Design Tokens + Radix UI + Framer Motion（减少动效兼容）
- **后端：** Rust + Axum + Tokio（条件主选）或 FastAPI（回退）
- **数据库：** OceanBase MySQL mode（条件主选）+ SQLite（强制回退）
- **AI 适配器：** Provider-neutral，复用 F-001 的模型集成 + fixture 回退
- **图表：** 语义化 SVG/Canvas，提供文本等价，颜色不是唯一编码

# MyCareer 赛季中心 · AI 协作提示词

> **统一体验硬约束：** 任何界面工作必须先读 [DESIGN-SYSTEM](../../engineering/DESIGN-SYSTEM.md)，复用同一全局 Shell、Token、组件、图标、动效与 `Briefing → Choose → Execute → Replay → Next Move` 循环；本模块不得独立换肤。

> **模块编号：** F-002 · **优先级：** P0 轻外壳
> **阅读本文件后无需查阅其他文档即可开始工作。**

## 项目上下文（30 秒）

jiaowu2K26 是覆盖大学四到八年学习、选课、成长、协作与机会发现的体验层。MyCareer 赛季中心是 P0 的**导航外壳**——它不实现完整业务逻辑，而是用"赛季/生涯"语法为其余功能模块提供上下文入口。

## 本模块使命

把课程工具放回学生从入学到毕业的连续上下文，让"现在做什么、为什么、下一步去哪"始终可见。

**P0 范围：** 只需要"当前学期 → 一门课程 → 智课工坊互动 → Box Score"四步可达。

**稳定编号：** 当前赛季首页使用 `F002-03`，课程阵容使用 `F002-04`。课程→学习与 Box Score 跳转分别记为 `P0-JUMP-01`、`P0-JUMP-02`；不得为了 P0 展示重新定义 F002-01～F002-15。完整稳定表见本目录 `SPEC.md`。

---

## 核心隐喻

| 现实 | 赛季语法 | 说明 |
|------|---------|------|
| 学期 | 赛季 (Season) | 本科 4 年 = 8 个赛季，支持非线性路径 |
| 课程 | 阵容 (Roster) | 当前学期的课程列表，每张卡显示状态和下一步 |
| 学习单元 | 比赛 (Game) | 由智课工坊提供的互动学习内容 |
| 学习统计 | Box Score | 单次学习的完成度、正确率、用时 |
| 毕业 | 球衣退役 | 庆祝文案，真实状态始终用清楚文字并列 |

---

## 角色与分工

### 前端（主要工作量）
- 实现赛季首页（当前学期概览）
- 实现课程阵容卡片列表
- 实现从课程卡片跳转到智课工坊学习页
- 实现轻量 Box Score 入口（链接到 F-001 的 Replay 页）
- **缺省时 AI 补位：** 根据下方数据模型生成 React 组件

### 后端（轻量）
- 提供当前学期和课程列表 API
- **缺省时 AI 补位：** 返回 fixture JSON

### 产品设计
- 定义赛季首页的信息层次和导航逻辑
- 确保隐喻不过度（不公开 GPA 天梯，不把挂科娱乐化）

---

## 数据模型

### Semester（赛季 / 学期）

```json
{
  "id": "string (sem-xxx)",
  "student_id": "string",
  "name": "string (2026 秋季学期)",
  "season_number": "number (1-8+)",
  "stage": "undergraduate | master | doctoral | exchange | gap",
  "start_date": "ISO-8601",
  "end_date": "ISO-8601",
  "status": "current | completed | upcoming",
  "courses": ["string (course-xxx)"]
}
```

### CourseCard（课程阵容卡）

```json
{
  "id": "string (course-xxx)",
  "semester_id": "string",
  "name": "string (数据结构与算法)",
  "code": "string (CS201)",
  "credits": "number",
  "role": "required | elective | general",
  "schedule": "string (周一/周三 10:00-11:30)",
  "status": "active | completed | dropped",
  "progress_pct": "number (0-100)",
  "next_action": "string (完成 BST 学习单元)",
  "linked_published_id": "string | null (指向智课工坊 PublishedVersion)",
  "teacher_name": "string",
  "risk_level": "none | attention | critical"
}
```

### DashboardSummary（仪表盘摘要）

```json
{
  "student_id": "string",
  "current_semester": "Semester",
  "total_credits": "number",
  "completed_credits": "number",
  "active_courses": "number",
  "upcoming_deadlines": [{ "title": "string", "date": "ISO-8601", "course_id": "string" }],
  "recent_activities": [{ "type": "string", "description": "string", "timestamp": "ISO-8601" }]
}
```

---

## API 合同

| 方法 | 路径 | 描述 | 响应体 |
|------|------|------|--------|
| GET | `/api/v1/career/current-semester` | 获取当前学期信息 | `Semester` |
| GET | `/api/v1/career/current-semester/courses` | 获取当前学期课程列表 | `CourseCard[]` |
| GET | `/api/v1/career/dashboard` | 获取仪表盘摘要 | `DashboardSummary` |
| GET | `/api/v1/career/course/:id` | 获取单门课程详情 | `CourseCard + linked_content` |

### Demo Mode

| 方法 | 路径 | 描述 |
|------|------|------|
| GET | `/api/v1/demo/semester` | 返回预置的学期 + 课程数据 |
| GET | `/api/v1/demo/dashboard` | 返回预置的仪表盘数据 |

---

## UI 要求

### 赛季首页 (`/career`)
- 顶部：当前赛季名称 + 进度条（第 N 赛季 / 共 M 赛季）
- 课程阵容卡片列表（网格/列表可切换）
  - 每张卡显示：课程名、学分、状态、进度、下一步行动
  - 点击卡片进入课程详情或跳转智课工坊学习页
- 侧栏/底部：近期截止日、最近活动
- 明确入口：从课程卡片"开始学习"跳转到 `/student/watch/:publishedId`

### 课程阵容卡组件
- 状态色彩区分：active（蓝）、completed（绿）、dropped（灰）、attention（橙）、critical（红）
- **禁止：** 不把"硬课"或教师做成羞辱性标签
- 每张卡显示"下一步"可操作入口

### 轻量 Box Score 入口
- 在课程详情页显示最近学习活动的摘要
- 点击"查看完整回放"跳转到 F-001 的 Replay 页

---

## 验收标准

- [ ] 赛季首页显示当前学期和课程阵容
- [ ] 课程卡片显示状态、进度和下一步行动
- [ ] 点击课程卡片可跳转到智课工坊学习页
- [ ] 仪表盘显示截止日和最近活动
- [ ] Demo Mode 可用（fixture 数据完整展示）
- [ ] 不使用单一 OVR 定义学生，不公开 GPA 天梯

---

## 依赖

- **F-001 智课工坊：** 提供 `linked_published_id` 跳转目标（P0 闭环需要）
- 无其他前置依赖

## 回退策略

| 如果 | 则 |
|------|-----|
| 后端不可用 | 使用 fixture JSON 渲染静态赛季页 |
| 智课工坊未完成 | 课程卡片显示"学习内容准备中"，不阻塞赛季页展示 |
| 时间不足 | 只做首页 + 课程卡片列表，跳过仪表盘和 Box Score 入口 |

## P0 边界

P0 只证明：当前学期 → 一门课程 → 智课工坊互动 → Box Score。

**不进入 P0：**
- 完整生涯建档（目标、里程碑）
- 非线性赛季模型（休学/延毕/交换）
- 赛程时间轴（统一日历）
- 决策卡（选课/转段建议）
- 生涯档案（作品、徽章、选择理由、反思与毕业后导出）
- 多角色入口（教师/导师视图）
- 叙事强度切换
- 个人控制与上下文帮助的完整设置页（P0 仍须提供清楚文字、减少动效和退出类游戏措辞的基本路径）

---
status_schema: "1.0"
module_ids: ["F-002"]
module_status: technical_review
owner: null
active_slice: "F-002 P0 MyCareer fixture shell"
updated_at: "2026-07-24"
task_router: "../../PROJECT-MANIFEST.json#current_work"
---

# MyCareer 赛季中心 · 状态

> 即时派单与 owner 以 `PROJECT-MANIFEST.json.current_work` 为唯一事实源；本文件只记录模块进度、阻塞和裁剪。

- **模块编号：** F-002
- **状态：** technical_review（P0 Fixture 轻外壳；等待产品总集成人员验收）
- **优先级：** P0 轻外壳
- **负责人：** [待分配]
- **依赖：** F-001 智课工坊 PublishedVersion / Replay 入口（本地 Fixture 已接通）
- **规格基线：** F002-01～F002-15 沿用八入口版本；P0 使用 F002-03/F002-04 与 `P0-JUMP-01/02`

## 规格补充（2026-07-24）

- P0 只证明“当前赛季 → 课程详情 → 已发布学习内容 → Box Score / Replay”，不复制 F-001 的审核、发布或互动业务状态。
- 南同学 / NAN 保持 `UNRATED`，不使用 OVR、公开 GPA 排行或单一分数定义学生。
- `attention / critical` 描述课程任务和截止日状态，不描述学生人格、能力或价值。
- 课程名称与主题级摘要来自已审核本地索引；人物、日期、进度、状态、学习记录与建议均为明确 Fixture。

## 进度

- [x] 数据模型定义（CareerSemester / CareerCourse / CareerDashboard / LearningSession）
- [x] API 端点实现（4 个 Career 端点 + 2 个 Demo Mode 端点）
- [x] 赛季首页 UI（第 4/8 赛季、进度、机会、单一主行动）
- [x] 六门课程阵容与五种非羞辱性状态
- [x] 近 7 天截止日
- [x] 课程详情（角色、学分、时间、进度、来源、Next Move）
- [x] 课程阵容紧凑 / 标准 / 大卡预设、拖动排序与 44 px 上移 / 下移等价路径
- [x] SLS 大卡与课程详情使用明确标注的虚构教练 Fixture；不抓取真实教师头像
- [x] 不打断主任务的“今日战术板”本地建议
- [x] 模块深链首次浏览器返回落在 `#/career`，不会直接离开系统
- [x] 课程→F-001 已发布学习内容跳转
- [x] Box Score 摘要→F-001 Replay 跳转
- [x] 无内容与未学习空状态
- [x] Fixture / API 回退数据准备
- [x] 桌面、手机与跨模块浏览器验收
- [ ] 产品总集成人员最终验收

## 功能点验收快照

| 功能点 | 结论 | 当前证据 | 进入 accepted 前仍需 |
|---|---|---|---|
| F002-03 当前赛季首页 | pass-fixture | 2026 春季、第 4/8 本科路径、六门阵容、3 个七日截止日、可选机会与一个主行动 | 产品总集成人员确认首页信息密度与措辞 |
| F002-04 课程阵容 | pass-fixture | 每门课程均有课程名、角色、学分、时间、五态状态、进度、来源与 Next Move；三档安全预设、拖放与按钮排序均可用；状态不只靠颜色 | 实体触屏、手柄与真人首次理解测试 |
| P0-JUMP-01 课程→学习 | pass-fixture | `published-sls-v1` 直接进入 F-001 Student；返回 MyCareer 常驻；无发布内容显示“学习内容准备中” | Live PublishedVersion API 联调 |
| P0-JUMP-02 Box Score→Replay | pass-fixture | 最近会话显示 100% 完成、100% 正确、0:18；一键进入 6-event Replay；无记录显示“尚未开始学习” | 多次真实互动聚合与离线重试 |
| Fixture / 回退 | pass | 本地 TypeScript Fixture 与 Rust API Fixture 均显式 `fixture`；后端不可用时首页仍可操作 | 前端改为优先消费 Career API 后再自动回退 |
| F002-01/02/05～15 | deferred-P1/P2 | 稳定 ID 与规格保留 | 建档、非线性路径、时间轴、决策卡、多角色等按后续切片推进 |

## API 与合同

- `GET /api/v1/career/current-semester`
- `GET /api/v1/career/current-semester/courses`
- `GET /api/v1/career/dashboard`
- `GET /api/v1/career/course/{course_id}`
- `GET /api/v1/demo/semester`
- `GET /api/v1/demo/dashboard`
- `career-fixture.schema.json` 与 `career-course-detail.schema.json` 已纳入 OpenAPI 3.1。

## 自动化与可视证据

- Web：严格 TypeScript、全站 14 个测试文件 / 109 项 Vitest、Vite 6.4.3
  生产构建通过。
- Rust：11 项测试通过；Career 六端点、Published/Empty 课程详情与 404 均通过路由测试。
- Live API：实测第 4/8 赛季、`published-sls-v1`、100% 会话摘要与空内容课程。
- 浏览器：桌面首页、课程详情、跨模块 Student / Replay、无内容/未学习空状态以及 390×844 手机详情均实际运行。
- 截图：`reference/audit/2026-07-24-current-ui-audit/04-career-roster-large.png`
  与 `06-career-before-after.png`；历史 QA 图继续保留。
- 已沿用登记过的 Campus Arena 原创背景、虚构教练人物与 Fluent 图标；人物图只作
  Fixture 视觉，不作为课程事实来源。
- 当前结果是技术候选，不替代产品总集成人员验收或真人可用性研究。

## 阻塞与后续

- F-001 Fixture 已解除原 PublishedVersion 阻塞。
- `accepted` 前仍需产品总集成人员逐项走查。
- 不阻塞 P0 技术候选：前端 Live Career API 数据映射、持久化赛季实体、P1 非线性路径与多角色入口。

## 裁剪决策

- P0 只实现 F002-03、F002-04 和两条跨模块跳转。
- F002-01/02/05～15 全部保留稳定规格，未在本轮伪装实现。

## 最后更新

2026-07-24

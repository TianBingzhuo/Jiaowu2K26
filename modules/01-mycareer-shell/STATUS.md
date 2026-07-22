---
status_schema: "1.0"
module_ids: ["F-002"]
module_status: pending
owner: null
active_slice: null
updated_at: "2026-07-22"
task_router: "../../PROJECT-MANIFEST.json#current_work"
---

# MyCareer 赛季中心 · 状态

> 即时派单与 owner 以 `PROJECT-MANIFEST.json.current_work` 为唯一事实源；本文件只记录模块进度、阻塞和裁剪。

- **模块编号：** F-002
- **状态：** pending
- **优先级：** P0 轻外壳
- **负责人：** [待分配]
- **依赖：** F-001 智课工坊（提供 `linked_published_id` 跳转目标）
- **规格基线：** F002-01～F002-15 沿用八入口版本；P0 使用 F002-03/F002-04，跨模块跳转使用 `P0-JUMP-*`

## 规格补充（2026-07-22）

- Scenario Draft Board、Season Highlight Reel 与 Intent Profile 控制已归并到既有 P1/P2 切片；P0 仍只实现当前赛季首页和课程阵容。
- 概念视觉只作方向参考，不属于实现状态。

## 进度

- [ ] 数据模型定义（Semester / CourseCard / DashboardSummary）
- [ ] API 端点实现（4 个主端点 + 2 个 Demo Mode 端点）
- [ ] 赛季首页 UI
- [ ] 课程阵容卡片组件
- [ ] 课程→智课工坊跳转逻辑
- [ ] Box Score 入口（轻量摘要 + Replay 跳转）
- [ ] Fixture 数据准备
- [ ] 端到端验收通过（赛季→课程→学习→回放）

## 阻塞

- F-001 智课工坊需提供至少 1 个 PublishedVersion 用于跳转测试

## 裁剪决策

- P0 只做导航外壳，不含完整赛季实体
- 时间不足时只做首页 + 课程卡片列表，跳过仪表盘和 Box Score 入口
- P1 功能（生涯建档、赛程时间轴、决策卡等）全部延后

## 关键里程碑

| 时间 | 目标 |
|------|------|
| Day 1 | 赛季首页骨架 + fixture 数据渲染 |
| Day 2 | 课程卡片组件 + 跳转逻辑 |
| Day 3 | 与 F-001 联调：课程→学习→Box Score 完整路径 |

## 最后更新

2026-07-22

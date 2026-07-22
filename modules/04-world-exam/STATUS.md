---
status_schema: "1.0"
module_ids: ["F-005"]
module_status: pending
owner: null
active_slice: null
updated_at: "2026-07-22"
task_router: "../../PROJECT-MANIFEST.json#current_work"
---

# World Exam Finals · 状态

> 即时派单与 owner 以 `PROJECT-MANIFEST.json.current_work` 为唯一事实源；本文件只记录模块进度、阻塞和裁剪。

- **状态:** pending
- **优先级:** P1 首选
- **负责人:** [待分配]
- **依赖:**
  - F-001 智课工坊（SourceFragment / GeneratedObject / PublishedVersion 合同）
  - F-003 Academic Mirror（课程与学期上下文，可选）
  - X-02 来源与证据、X-05 同意与隐私、X-08 可访问性、X-09 离线与降级
- **规格补充:** EXP-CASE-02/05/06 已补入 Checkpoint、Replay 和赛后复盘；不新增 P1 范围，公开排名与正式权益解锁仍禁止
- **进度:**
  - [ ] 数据模型实现：ExamEvent、PreGameBriefing、ReviewPlaybook
  - [ ] 数据模型实现：Checkpoint、ExamAttempt、ReplayData、BoxScore、PostGameReflection
  - [ ] API 端点：赛事日历 + 赛前简报 + 复习 Playbook
  - [ ] API 端点：Warm-up + 答题 + Checkpoint
  - [ ] API 端点：Replay + Box Score + 赛后复盘
  - [ ] ExamEvent 状态机实现（scheduled → briefing_open → warmup → exam_active → review → archived）
  - [ ] 前端：赛事日历页 + 叙事强度切换
  - [ ] 前端：赛前简报页 + 复习 Playbook 页
  - [ ] 前端：Key Match 答题页 + 来源抽屉
  - [ ] 前端：Replay / Box Score 页
  - [ ] 前端：赛后复盘页 + 导出功能
  - [ ] 压力友好模式实现
  - [ ] Open-book AI Exam 来源追溯集成
  - [ ] F-001 内容复用集成测试
  - [ ] Demo Mode fixture 数据准备
  - [ ] 离线缓存 + 同步实现
  - [ ] 端到端验收测试
- **阻塞:** 等待 F-001 P0 稳定
- **裁剪决策:** 保留核心10项功能（F005-01 至 F005-10, F005-12, F005-13）；Adaptive Drill / Overtime / 教师配置延后 P2
- **最后更新:** 2026-07-22

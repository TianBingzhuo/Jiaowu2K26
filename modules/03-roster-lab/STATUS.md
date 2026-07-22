---
status_schema: "1.0"
module_ids: ["F-004"]
module_status: pending
owner: null
active_slice: null
updated_at: "2026-07-22"
task_router: "../../PROJECT-MANIFEST.json#current_work"
---

# Roster Lab / Semester Environment Resolver · 状态

> 即时派单与 owner 以 `PROJECT-MANIFEST.json.current_work` 为唯一事实源；本文件只记录模块进度、阻塞和裁剪。

- **状态:** pending
- **优先级:** P1 候选
- **负责人:** [待分配]
- **依赖:**
  - F-003 Academic Mirror（课程目录、已修记录、学期结构；可通过 fixture 替代）
  - X-02 来源与证据、X-09 离线与降级、X-10 可解释推荐
- **规格补充:** EXP-CASE-04 已补入 F004-08/10/11：A/B/C 方案、迁移成本、分支回滚和可逆点；实现仍为 pending
- **进度:**
  - [ ] CourseSpec 数据模型 + fixture 数据（8-20 门课程）
  - [ ] SemesterPrefix 状态管理
  - [ ] Pin 锁定机制实现
  - [ ] CatalogIndex 索引与候选缩减
  - [ ] 硬约束引擎（先修/时间冲突/学分限制/互斥/容量）
  - [ ] 软偏好系统（用户设置 + 优先级）
  - [ ] 求解器：确定性启发式回退实现
  - [ ] 求解器：SAT/MaxSAT 集成（条件）
  - [ ] 多方案生成（2-3 套 + 取舍说明）
  - [ ] 无解解释（最小冲突集 + 阻塞链 + 可放宽项）
  - [ ] What-if 模拟求解
  - [ ] Diff/transaction 预览（add/drop/swap）
  - [ ] API 端点实现（8 个）
  - [ ] 前端：方案编辑器页
  - [ ] 前端：方案对比页
  - [ ] 前端：What-if 模拟页
  - [ ] 前端：无解解释页
  - [ ] Demo fixture 数据准备
  - [ ] 端到端验收测试
- **阻塞:** 等待 F-003 或 fixture 课程数据就绪
- **裁剪决策:** P1 只做个人规划求解；semester.lock / 求解后端接口 / 机构排课延后 P2
- **最后更新:** 2026-07-22

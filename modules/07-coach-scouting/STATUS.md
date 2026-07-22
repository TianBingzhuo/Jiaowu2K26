---
status_schema: "1.0"
module_ids: ["F-007"]
module_status: pending
owner: null
active_slice: null
updated_at: "2026-07-22"
task_router: "../../PROJECT-MANIFEST.json#current_work"
---

# Coach & Scouting · 状态

> 即时派单与 owner 以 `PROJECT-MANIFEST.json.current_work` 为唯一事实源；本文件只记录模块进度、阻塞和裁剪。

- **状态:** pending
- **规格状态:** ready_for_review（实现仍为 pending）
- **优先级:** P2
- **负责人:** [待分配]
- **依赖:**
  - F-003 Academic Mirror（课程数据、学期和开课信息镜像）
  - F-002 MyCareer 赛季中心（赛季/课程上下文）
  - 共享能力：X-02 来源与证据、X-03 事件与审计、X-05 同意与隐私、X-06 搜索与筛选、X-10 可解释推荐
- **进度:**
  - [ ] 课程 Profile 与来源标注
  - [ ] 教学结构与 Office Hours 展示
  - [ ] 工作量区间聚合
  - [ ] Scouting Report 四象限设计
  - [ ] 来源徽章与版本对比
  - [ ] 教师纠错权流程
  - [ ] 学生反馈聚合（含最小样本阈值）
  - [ ] 公平审计实现
  - [ ] 组队需求与匹配
  - [ ] Advisor Handoff 流程
  - [ ] 预期提醒
  - [ ] 报告与治理入口
  - [x] 稳定功能 ID 与 SPEC.md 对账
- **阻塞:** 无
- **裁剪决策:** 保留（仅在 P0 + P1 全部完成后考虑）
- **最后更新:** 2026-07-21

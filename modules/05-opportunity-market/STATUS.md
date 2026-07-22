---
status_schema: "1.0"
module_ids: ["F-009"]
module_status: pending
owner: null
active_slice: null
updated_at: "2026-07-22"
task_router: "../../PROJECT-MANIFEST.json#current_work"
---

# Opportunity Market · 状态

> 即时派单与 owner 以 `PROJECT-MANIFEST.json.current_work` 为唯一事实源；本文件只记录模块进度、阻塞和裁剪。

- **状态:** pending
- **优先级:** P1 候选
- **负责人:** [待分配]
- **依赖:**
  - F-003 Academic Mirror（资格验证数据；可通过 Profile 自报替代）
  - F-001 智课工坊（作品/证据导出，P2）
  - X-02 来源与证据、X-05 同意与隐私、X-06 搜索与筛选、X-10 可解释推荐
- **规格补充:** EXP-CASE-04 已补入远期 Pathway Portal 的多方案、迁移成本与回滚解释；P1 裁剪不变
- **进度:**
  - [ ] Opportunity 数据模型 + fixture 数据（5-10 条机会）
  - [ ] EligibilityRule 结构化规则引擎
  - [ ] StudentProfile 管理（自报 + 已验证证据分区）
  - [ ] 资格检查引擎（四态解释：met/possibly_met/not_met/unknown）
  - [ ] 选择性匹配（逐项授权 + 匹配理由生成）
  - [ ] 反操纵审计检查（零付费排序/零随机/零竞价）
  - [ ] 机会采集与来源追溯
  - [ ] 纠错与过期处理（报告 + 自动标记 + 通知）
  - [ ] API 端点实现（9 个）
  - [ ] 前端：机会发现页 + 筛选器
  - [ ] 前端：机会详情页 + 资格检查页
  - [ ] 前端：匹配管理页 + Profile 管理
  - [ ] 前端：资格四态可视化组件
  - [ ] Demo fixture 数据准备
  - [ ] 端到端验收测试
- **阻塞:** 无（可独立开发，资格数据可用 Profile 自报替代）
- **裁剪决策:** P1 聚焦发现 + 资格检查 + 选择性匹配；双向意向/申请镜像/权益钱包/路径门户延后 P2
- **最后更新:** 2026-07-22

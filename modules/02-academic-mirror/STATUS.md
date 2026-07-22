---
status_schema: "1.0"
module_ids: ["F-003"]
module_status: pending
owner: null
active_slice: null
updated_at: "2026-07-22"
task_router: "../../PROJECT-MANIFEST.json#current_work"
---

# Academic Mirror · 状态

> 即时派单与 owner 以 `PROJECT-MANIFEST.json.current_work` 为唯一事实源；本文件只记录模块进度、阻塞和裁剪。

- **状态:** pending
- **优先级:** P1 候选
- **负责人:** [待分配]
- **依赖:**
  - 无前置模块依赖（数据基础层）
  - X-02 来源与证据、X-03 事件与审计、X-05 同意与隐私、X-09 离线与降级、X-11 个人数据可携带
- **进度:**
  - [ ] 数据源登记与管理（DataSource CRUD）
  - [ ] DemoFixtureAdapter 实现
  - [ ] FileImportAdapter 实现
  - [ ] RawSnapshot 存储与不可变约束
  - [ ] 标准映射引擎（NormalizedRecord 生成 + 字段级来源）
  - [ ] 权威等级标注系统（6 级分类）
  - [ ] 新鲜度检查与过期策略
  - [ ] 冲突检测引擎
  - [ ] 人工校对队列
  - [ ] 同意管理（授予/撤回/过期）
  - [ ] 数据导出功能（JSON）
  - [ ] 审计日志追加式存储
  - [ ] API 端点实现（9 个）
  - [ ] 前端：数据源管理页
  - [ ] 前端：镜像浏览页 + 字段级来源追溯
  - [ ] 前端：冲突处理页
  - [ ] 前端：同意管理页
  - [ ] Demo fixture 数据准备
  - [ ] 端到端验收测试
- **阻塞:** 无（数据基础层，可并行开发）
- **裁剪决策:** P1 全量同步足够；增量同步延后 P2；写回能力属 Vision
- **最后更新:** 2026-07-21

---
status_schema: "1.0"
module_ids: ["F-007"]
module_status: technical_review
owner: null
active_slice: "F-007 Fixture vertical slice"
updated_at: "2026-07-25"
task_router: "../../PROJECT-MANIFEST.json#current_work"
---

# Coach & Scouting · 状态

> 即时派单与 owner 以 `PROJECT-MANIFEST.json.current_work` 为唯一事实源；本文件只记录模块进度、阻塞和裁剪。

- **状态:** technical_review（本地技术候选，等待产品总集成人员接受）
- **规格状态:** implemented_against_current_spec
- **优先级:** P2
- **负责人:** 产品总集成人员；Codex 提供本地实现与中央技术复核
- **依赖:**
  - F-003 Academic Mirror（课程数据、学期和开课信息镜像）
  - F-002 MyCareer 赛季中心（赛季/课程上下文）
  - 共享能力：X-02 来源与证据、X-03 事件与审计、X-05 同意与隐私、X-06 搜索与筛选、X-10 可解释推荐
- **进度:**
  - [x] 课程 Profile 与五级来源标注
  - [x] 教学结构与有效 / 过期 Office Hours 展示
  - [x] 工作量区间与最小样本门禁
  - [x] Scouting Report 四象限设计
  - [x] 来源徽章与跨任教关系版本对比
  - [x] 教师纠错权与透明历史
  - [x] 结构化学生反馈、诽谤停损与最小样本阈值
  - [x] 五项公平审计与失败降级合同
  - [x] 逐项披露、禁敏感字段、解释理由与容量冲突的组队匹配
  - [x] 本人同意且不伪造回复的 Advisor Handoff
  - [x] 设备、材料、出勤和安全预期提醒
  - [x] 严重内容先隐藏、限时人工复核与追加式 Replay
  - [x] 课程球探阵容切换：完整 SLS201 Fixture 与 6 门 UArizona 2026 公开候选课共用同一切换器；Profile、Scouting、Version、Feedback、Squad 和 Governance 六阶段随课程同步更新
  - [x] 候选课不伪造教师评价：只有公开标题、描述、班次、教师、容量和抓取时状态；个人匹配理由标为系统推断，反馈区在未修课时明确锁定
  - [x] 稳定功能 ID 与 SPEC.md 对账
- **自动化证据:**
  - 前端：`coachScoutingEngine.test.ts` 14 项通过；当前全 Web 157/157 通过；TypeScript 与 Vite 生产构建通过。
  - 领域：F-007 4 项 Rust 状态机测试纳入当前 domain 全套 32 项。
  - API：F-007 3 项端到端路由测试纳入当前 API 全套 23 项。
  - 合同：当前 35 个 JSON Schema、10 个 Golden Fixture、OpenAPI 3.1 与 manifest 确定性校验通过。
  - 浏览器：当前 Edge / Chromium 实际走通六阶段、UArizona 课程切换、真实公开班次/候补状态更新、离线演练、提醒、版本比较、教师纠错、反馈、公平审计、组队、Advisor Handoff、严重隐私先隐藏、Replay 与重置。
- **浏览器证据:**
  - `reference/audit/2026-07-24-gameplay-navigation/09-coach-scouting-overview.png`
  - `reference/audit/2026-07-24-gameplay-navigation/10-coach-governance-after.png`
  - `reference/audit/2026-07-25-personal-mirror-course-campus/05-course-scouting-after.png`
- **阻塞 / 未形成证据:**
  - UArizona 课程目录与班次来自 2026 公开 API 快照；没有真实校内大纲、先修核验、学生反馈或 Advisor 数据，SLS201 的教师身份、时间与判断仍为 Fixture。
  - 没有真实参与者公平性验证、教师纠错 SLA、机构治理流程、Firefox/Safari、实体触屏、读屏器或第二台机器证据。
  - 后端 Session 暂存进程内存；没有持久数据库、真实 Academic Mirror 适配器或机构身份接入。
- **裁剪决策:** 保留技术候选；仍不进入 P0 展示主路径，除非产品总集成人员选择为加分支线。
- **最后更新:** 2026-07-25

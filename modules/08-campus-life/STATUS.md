---
status_schema: "1.0"
module_ids: ["F-008"]
module_status: technical_review
owner: null
active_slice: "F-008 Fixture vertical slice"
updated_at: "2026-07-24"
task_router: "../../PROJECT-MANIFEST.json#current_work"
---

# Campus Life Hub · 状态

> 即时派单与 owner 以 `PROJECT-MANIFEST.json.current_work` 为唯一事实源；本文件只记录模块进度、阻塞和裁剪。

- **状态:** technical_review（本地技术候选，等待产品总集成人员接受）
- **规格状态:** implemented_against_current_spec
- **优先级:** Vision
- **负责人:** 产品总集成人员；Codex 提供本地实现与中央技术复核
- **依赖:**
  - F-002 MyCareer 赛季中心（生涯阶段和兴趣上下文）
  - F-003 Academic Mirror（课程与学期基础数据）
  - 共享能力：X-02 来源与证据、X-05 同意与隐私、X-06 搜索与筛选、X-07 通知、X-08 可访问性
- **规格补充:** EXP-CASE-06/08 作为远期 Builder Mode 与自愿 Campus Footprints 验收方向；不默认位置追踪，不进入 P0/P1
- **进度:**
  - [x] 服务目录设计
  - [x] 活动/社团目录
  - [x] 统一搜索与筛选
  - [x] 个性化首页与推荐
  - [x] 日历整合
  - [x] 2D 校园地图（含无障碍路径）
  - [x] MyCOURT 个人空间
  - [x] 社团/项目组队
  - [x] 学长导师机制
  - [x] 服务进度镜像
  - [x] 紧急升级流程
  - [x] 通知治理
  - [x] 来源与纠错
  - [x] 线下回执
  - [x] 稳定功能 ID 与 SPEC.md 对账
- **自动化证据:**
  - 前端：`campusLifeEngine.test.ts` 13 项通过；全 Web 108/108 通过；TypeScript 与 Vite 生产构建通过。
  - 领域：F-008 4 项 Rust 状态机测试纳入 domain 全套 32 项。
  - API：F-008 3 项端到端路由测试纳入 API 全套 23 项。
  - 合同：26 个 JSON Schema、9 个 Golden Fixture、OpenAPI 3.1 与 manifest 确定性校验通过。
  - 浏览器：当前 Edge / Chromium 实际走通六阶段、检索与画像关闭、日历冲突、无障碍静态路线、MyCOURT 私有导出、非权威 Journey Mirror、双向组队、无伪造回复的 Mentor Handoff、通知治理、纠错、私有线下回执、Replay、重置与站内浏览器返回。
- **浏览器证据:**
  - `reference/audit/2026-07-24-gameplay-navigation/11-campus-life-concourse.png`
  - `reference/audit/2026-07-24-gameplay-navigation/12-campus-life-map.png`
  - `reference/audit/2026-07-24-gameplay-navigation/13-campus-life-replay.png`
- **阻塞 / 未形成证据:**
  - 没有真实校园服务、活动、地图、无障碍、社团、导师、通知或紧急渠道数据；所有入口、时间、路线与身份均为 Fixture。
  - 没有真实机构日历、报名、审批、危机服务、身份、定位或第三方地图接入；体验层没有声称完成这些正式动作。
  - 没有真实参与者研究、校园无障碍审查、危机升级 SLA、Firefox/Safari、实体触屏、读屏器或第二台机器证据。
  - 后端 Session 暂存进程内存；没有持久数据库、真实 Campus/SIS 适配器或机构身份接入。
- **裁剪决策:** 保留技术候选；仍不进入 P0 展示主路径，除非产品总集成人员选择为加分支线。
- **最后更新:** 2026-07-24

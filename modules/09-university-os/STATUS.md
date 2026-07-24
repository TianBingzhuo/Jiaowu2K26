---
status_schema: "1.0"
module_ids: ["F-010", "F-011", "F-012", "F-013", "F-014"]
module_status: in_progress
owner: null
active_slice: "F-010"
updated_at: "2026-07-24"
task_router: "../../PROJECT-MANIFEST.json#current_work"
---

# University OS 扩展包 · 状态

> 即时派单与 owner 以 `PROJECT-MANIFEST.json.current_work` 为唯一事实源；本文件只记录模块进度、阻塞和裁剪。

> **更新时间：** 2026-07-24
> **整体实现：** `in_progress`（仅 F-010 技术候选；F-011～F-014 仍为 `pending`）
> **说明：** 正式 Hacking 开始后，产品总集成人员授权按单模块 WIP 顺序推进到 `technical_review`。F-010 只使用脱敏 Fixture，不接入真实校园卡、NFC 密钥、动态二维码、门锁或应急控制；最终接受、合并与完成声明仍需产品总集成人员决定。

| 模块 | 产品范围 | 优先级 | 实现 | 本届排程 |
|---|---|---|---|---|
| F-010 Campus Pass & Entitlements | approved_vision | P2 / Vision | technical_review | 当前候选，等待人类验收 |
| F-011 General Balance & Campus Commerce | approved_vision | P2 / Vision | pending | unscheduled |
| F-012 Dining & Wellbeing | approved_vision | P2 / Vision | pending | unscheduled |
| F-013 Faculty Success Studio | approved_vision | P2 / Vision | pending | unscheduled |
| F-014 Institutional Front Office | approved_vision | P2 / Vision | pending；已有 Role Lens 前端预览 | unscheduled |

## 跨角色 Experience Shell 预览（不改变 F-011～F-014 状态）

P0-00 Web 壳新增五种显式 Fixture Role Lens：学生、教师、辅导员 / 学业导师、专业负责人 / 系主任、本科生院 / 教务处。它验证同一设计系统可随角色切换任务、导航、信息密度和数据边界，并让教师从 Coach Studio 直达 F-001 审核席。

- 角色选择在本浏览器刷新后保持；模块返回会回到当前角色首页。
- 每个角色都显示可见范围、禁止范围和“工作状态，不是人员评分”。
- 学校端和教师端出现的 F-013 / F-014 内容均明确标记 `Vision` 或 `Demo Role Lens`。
- 当前没有真实账号、组织关系、服务端授权、学校 SSO、正式审批或个人数据；因此这只是 F014-01 的前端交互假设与跨角色壳证据，不足以把 F-013 或 F-014 推进到 `technical_review`。
- Web 严格 TypeScript、120 项 Vitest 与 Vite Production Build 通过；Edge / Chromium 已实测五角色切换、刷新保持、教师审核深链、History 返回、方向键空间寻焦和 390px 窄屏。

## F-010 功能覆盖与技术证据

| ID | 当前技术候选 | 可复核证据 |
|---|---|---|
| F010-01 | 身份关联只显示来源、状态、期限，原系统密码存储恒为 0 | Fixture `identities` + Wallet 身份栏 + Domain invariant |
| F010-02 | 三类 Pass Wallet 卡片显示签发方、范围、载体、期限与状态 | Wallet Loadout + `credentials` |
| F010-03 | 实体卡 / NFC / 动态二维码 / 移动凭证演练；静态二维码截图必定被拒绝 | Reader Drill + `present_credential` 测试 |
| F010-04 | 区域、时段、敏感度与最小范围并列解释 | Zone Map + `zones` |
| F010-05 | 课程/用途驱动的非权威权限申请镜像 | Access Queue + `request_access` |
| F010-06 | 访客草稿绑定用途、担保人、时长、区域并自动到期 | Guest Draft + `guest_policy` |
| F010-07 | 培训、导师批准和预约逐项显示 fulfilled / missing / unknown | Prerequisite Loadout |
| F010-08 | submitted → reviewing → approved / external / denied / fault / appeal 状态镜像；阻塞项不能越过前置条件 | Authority Mirror + Domain/API 测试 |
| F010-09 | 遗失、冻结、恢复只准备正式渠道交接，不改写凭证状态 | Safety Desk + `create_loss_case` |
| F010-10 | 离线检查显式显示新鲜度、不可用区域与“未做密码学验证” | Offline Freshness Drill |
| F010-11 | 本人必要通行记录显示来源、用途、保留期与追加式纠错 | Self Record + Correction |
| F010-12 | 精细位置保留与追踪事件恒为 0，不进入推荐或排名 | Box Score + Fixture invariant |
| F010-13 | 应急状态只读显示权威方，体验层执行权恒为 false | Safety Desk Emergency Strip |
| F010-14 | 无手机、设备没电与残障陪同均有人工核验路径 | No-phone Fallback |

### 代码与验收入口

- 合同：`app/contracts/v1/campus-pass-fixture.schema.json`、`campus-pass-session.schema.json`、`openapi.yaml`
- Golden Fixture：`app/fixtures/v1/campus-pass.demo.json`
- 领域与 API：`app/crates/domain/src/campus_pass.rs`、`app/crates/api/src/lib.rs`
- Web：`app/apps/web/src/features/campuspass/`，通过 `#/campuspass` 或 MyCareer 的“校园通行”进入
- 自动化：4 个领域用例、3 个 API 用例、6 个 Web Engine 用例；全量 Web 严格 TypeScript、120 项 Vitest 与 Vite Production Build 通过
- 浏览器人工技术验收：Edge 完成 Wallet → 静态 QR 拒绝 → 普通/受控区域申请 → 访客草稿 → 状态镜像 → 冻结交接 → 无手机回退 → 记录纠错 → Replay；浏览器 Back 回到 MyCareer 而非退出系统
- 当前界面证据：`reference/audit/2026-07-24-current-ui-audit/07-campus-pass-wallet.png`、`08-campus-pass-reader-reject.png`、`09-campus-pass-access-queue.png`、`10-campus-pass-replay.png`

## 当前允许工作

- 对 F-010 做产品总集成人员试玩、物理手柄复核、跨设备布局复核和接受/退回决定
- 官方来源研究、真实学校适配需求、数据合同、威胁/隐私边界和测试计划
- 原创视觉方向、合法资产候选与许可证登记
- F-011～F-014 只允许规格、研究和裁剪；F-010 未获接受前不得启动下一实现切片

## 当前禁止工作

- 真实支付凭证、银行卡数据、校园卡、门禁密钥或真实敏感数据接入
- 把静态截图、Fixture Reader 结果或本地状态镜像称为正式凭证/放行/审批
- 由体验层执行应急解锁、冻结、恢复、门锁动作或身份决定
- 把 F-010 写成“已完成、已部署或已接入学校”；当前只能称“技术候选待人类验收”

## F-010 接受门槛

1. 产品总集成人员按五阶段主路径完整试玩并确认游戏叙事、正式名称与风险边界均能理解。
2. 使用现场物理手柄复核方向键/摇杆、确认/返回与焦点可见性；键鼠和触控仍需独立完成。
3. 复核窄屏、Reduced Motion、传统叙事和浏览器 Back。
4. 确认所有“正式入口”仍为 Fixture，不会对 `example.invalid` 产生真实写入。
5. 人类明确给出 `accept / revise / reject`；在此之前 Manifest 保持 `technical_review`。

## 规格变更记录

- 2026-07-22：归并 EXP-CASE-03/07：Research Quest Tree、统一高风险事务状态机与 Evidence Pack；仅补规格，全部实现状态与本届排程不变。

- 2026-07-22：将 Campus Pass、General Balance、Dining & Wellbeing、Faculty Success、Institutional Front Office 纳入合并式扩展包；全部保持 `pending`。

- 2026-07-24：F-010 完成脱敏 Fixture 的合同、Golden Fixture、Rust 领域/API、Web 五阶段交互、自动化与 Edge 主路径技术验收，推进到 `technical_review`；F-011～F-014 不变。

- 2026-07-24：P0-00 Experience Shell 增加五角色 Demo Lens，用于验证 F014-01 的统一前端交互假设；F-013/F-014 仍保持 `pending`，生产身份与授权没有被伪装实现。

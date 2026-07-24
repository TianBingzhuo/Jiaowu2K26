---
status_schema: "1.0"
module_ids: ["F-003"]
module_status: technical_review
owner: product_integrator
active_slice: "F-003-fixture-vertical-slice"
updated_at: "2026-07-24"
task_router: "../../PROJECT-MANIFEST.json#current_work"
---

# Academic Mirror · 状态

> 即时派单与 owner 以 `PROJECT-MANIFEST.json.current_work` 为唯一事实源；本文件记录 F-003 技术候选的实现证据、限制和待验收项。`technical_review` 不等于产品总集成人员已接受、合并或发布。

- **状态:** `technical_review`
- **优先级:** P1 候选
- **负责人:** `product_integrator`（Codex 实现与集中技术复核；产品总集成人员最终接受）
- **依赖:**
  - X-02 来源与证据、X-03 事件与审计、X-05 同意与隐私、X-09 离线与降级、X-11 个人数据可携带
  - 当前只消费脱敏 Fixture；没有真实 SIS / URP / LMS 账号、密码或生产学生数据

## 已实现的技术候选

- [x] 6 个脱敏来源覆盖权威记录、官方参考、授权镜像、本人声明、模型推断和演示样例；所有公开运行数据的实际权威级别强制为 `demo_fixture`
- [x] 数据源登记与用途、字段范围、保留期、纠错渠道、授权状态管理
- [x] `DemoFixtureAdapter` 与受控 `FileImportAdapter` 合同；不收集教务密码，不绕过登录抓取
- [x] 不可变 RawSnapshot 回执：原始引用、内容 SHA-256、字节数、版本与同步时间
- [x] 标准记录与字段级来源：来源系统、外部 ID、版本、快照、获取时间和转换规则
- [x] 新鲜、预警、过期、无到期日四态检查与高风险读取门禁
- [x] 冲突检测、人工校对原因和追加式处理回执；不静默覆盖
- [x] 按用途授予、撤回和到期的同意；下游读取预览即时响应
- [x] 非权威副本更正与删除门禁；权威记录只显示正式纠错渠道
- [x] 可阅读不可信 JSON 归档，以及明确未签名、未加密、仅可隔离检查的可信归档合同
- [x] 追加式审计哈希链，记录登记、同步、映射、冲突处理、同意、导出与删除
- [x] Rust domain + Axum API：来源、同步、快照、记录、字段来源、冲突、同意、更正、删除、导出、审计、Demo 与 Reset
- [x] 三份 F-003 JSON Schema、OpenAPI 3.1、第五份 Golden Fixture 与合同不变量
- [x] Web Source Dock、Truth Lens、Review Queue、Access Draft、Replay Ledger 五步体验
- [x] 键盘、鼠标、触控与 Gamepad API 复用统一语义焦点路径；传统模式、离线缓存和 Reduced Motion 保留完整信息

## 功能点验收矩阵

| 功能点 | 当前结果 | 证据 / 边界 |
|---|---|---|
| F003-01 数据源登记 | 通过（Fixture） | 6 个预置来源 + 本地来源登记表单；负责人、用途、字段、保留期、纠错渠道与授权可读 |
| F003-02 输入适配器 | 通过（合同切片） | DemoFixtureAdapter 可同步；FileImportAdapter 只登记经授权本地文件语义，尚未实现任意 CSV/JSON 解析器 |
| F003-03 原始快照 | 通过 | 全量同步追加新快照且旧快照保留；回执含引用、SHA-256、大小、版本与时间；公开 Fixture 不保存原始敏感正文 |
| F003-04 标准映射 | 通过（Fixture） | 学生、课程、开课、成绩、要求、活动与学期对象可读；未知生产字段保留策略待真实适配器验证 |
| F003-05 字段级来源 | 通过 | Truth Lens 可逐字段查看来源、外部 ID、版本、快照、获取时间和转换规则；API 提供 provenance 端点 |
| F003-06 权威等级 | 通过（模拟分类） | 六级标签均有测试数据；实际有效等级始终为 `demo_fixture`，不冒充学校权威事实 |
| F003-07 新鲜度 | 通过 | fresh / warning / expired / no-expiry 四态可见；过期或无同意时高风险下游读取被阻断 |
| F003-08 冲突检测 | 通过 | 两个多源冲突进入队列，差异与权威顺序并列显示，不按“最新”静默覆盖 |
| F003-09 增量同步 | 按规格延后 P2 | 接口明确返回 `SYNC_FAILED`、HTTP 422 与 `fallback_available=true`；保留上次镜像，不伪装成功 |
| F003-10 人工校对队列 | 通过 | 解决冲突必须填写人工原因；完成后未解决计数减少并生成审计回执 |
| F003-11 只读门禁 | 通过（P1） | 无 SIS / URP / LMS 写回路径；未来写回仍需独立授权、预览、双重确认和正式回执 |
| F003-12 同意与用途 | 通过 | 5 项用途同意可授予/撤回/到期；撤回后 F-004 等下游预览即时显示缺失来源并拒绝读取 |
| F003-13 导出 / 删除 / 更正 | 部分通过 | 可导出个人 JSON、申请修正、删除可移除副本；真实签名加密归档与正式系统纠错未实现 |
| F003-14 审计 | 通过（技术候选） | 关键动作进入追加式哈希链；当前不是 WORM、数字签名或受硬件保护的生产审计账本 |
| F003-15 演示夹具 | 通过 | Golden Fixture 覆盖来源→同步→映射→冲突→同意→导出→审计；界面和合同均显式标记演示边界 |

## 自动与人工证据

- Web：9 个测试文件、50 项 Vitest 测试、strict TypeScript 与 Vite 6.4.3 生产构建通过；其中 F-003 引擎测试 10 项。
- Rust：domain / API / SQLite adapter 合计 28 项测试；`fmt`、`check`、`test`、`clippy -D warnings` 通过。
- 合同：15 份 JSON Schema、5 份 Golden Fixture、OpenAPI 3.1 与 Manifest 校验通过。
- 实时 API：Reset、Fixture、来源登记、不可变快照、字段来源、全量同步、增量回退、冲突、同意、更正、两类归档、删除门禁与审计共 18 个检查通过。
- 浏览器：390×844 移动窄窗完整操作 Source Dock → 离线缓存 → 全量同步 → Truth Lens → Review Queue → Access Draft → Replay Ledger；Esc 返回通过。
- 截图：`app/apps/web/qa-f003-source-dock-mobile.png`、`app/apps/web/qa-f003-access-draft-mobile.png`。

## 已知限制与待人验收

- 前端 TypeScript 引擎与 Rust API 目前是两套共享语义但独立运行的 Fixture 实现；尚未把 Web 全部改为在线 DTO 单一事实源。
- Rust Demo Session 保存在进程内存，浏览器回退保存在 localStorage；尚未接入 SQLite / OceanBase 的 F-003 持久化。
- FileImportAdapter 当前验证来源登记、授权和失败边界，尚未实现任意 CSV / JSON 文件上传、病毒扫描、列映射和错误行隔离。
- 增量同步按 P1 裁剪明确失败并回退；没有游标、撤回摘要或生产级重试队列。
- 原始敏感内容不进入公开仓；当前只保存虚构引用、哈希与大小回执，未验证真实密钥管理、字段加密和数据保留作业。
- “可信归档”仅冻结了导入隔离合同，明确为未签名、未加密、不可恢复信任；真实发行方签名、加密、撤销和重新导入尚未实现。
- 审计链是确定性的追加式技术切片，不是不可篡改 WORM、可信时间戳或密码学签名账本。
- 本轮浏览器面板固定为 390×844；没有新的桌面宽屏 F-003 人工截图、实体手柄、真实触屏或真实参与者人因证据。
- 产品总集成人员尚未作出接受、合并、公开展示或发布决定。

## 下一决策

保持本模块为 `technical_review`。下一模块按照依赖和演示价值从 Manifest 领取；F-003 的来源、同意、时效与归档合同在接入任何真实学校数据前必须再次过安全、隐私和产品验收。任何模块只能由产品总集成人员标为 `accepted`。

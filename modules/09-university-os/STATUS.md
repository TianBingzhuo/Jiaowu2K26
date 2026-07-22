---
status_schema: "1.0"
module_ids: ["F-010", "F-011", "F-012", "F-013", "F-014"]
module_status: pending
owner: null
active_slice: null
updated_at: "2026-07-22"
task_router: "../../PROJECT-MANIFEST.json#current_work"
---

# University OS 扩展包 · 状态

> 即时派单与 owner 以 `PROJECT-MANIFEST.json.current_work` 为唯一事实源；本文件只记录模块进度、阻塞和裁剪。

> **更新时间：** 2026-07-22  
> **整体实现：** `not_started`  
> **说明：** 用户已批准纳入长期产品范围与统一游戏化方向；没有批准提前构建、真实支付/门禁接入或具体技术栈

| 模块 | 产品范围 | 优先级 | 实现 | 本届排程 |
|---|---|---|---|---|
| F-010 Campus Pass & Entitlements | approved_vision | P2 / Vision | pending | unscheduled |
| F-011 General Balance & Campus Commerce | approved_vision | P2 / Vision | pending | unscheduled |
| F-012 Dining & Wellbeing | approved_vision | P2 / Vision | pending | unscheduled |
| F-013 Faculty Success Studio | approved_vision | P2 / Vision | pending | unscheduled |
| F-014 Institutional Front Office | approved_vision | P2 / Vision | pending | unscheduled |

## 当前允许工作

- 官方来源研究、产品规格、数据合同、威胁/隐私边界和测试计划
- 原创视觉方向、合法资产候选与许可证登记
- 与 F-001～F-009 的依赖和裁剪分析

## 当前禁止工作

- 赛前参赛代码、可运行原型、数据库迁移或接口实现
- 真实支付凭证、银行卡数据、校园卡、门禁密钥或真实敏感数据接入
- 安装 Unreal/新客户端或为这些愿景模块创建独立技术栈
- 把任一功能写成“已完成、已接入、已提升”

## 启动条件

1. AdventureX 正式 Hacking 已开始并建立空白代码基线。
2. F-001 + F-002 P0 在 36 小时停损线前稳定。
3. 团队明确选择一个 Slice、一个 owner、时间预算和回退。
4. 权威数据、权限与第三方条款可用；否则只能用明确标注的 fixture。
5. 视觉实现通过全局 Design System，不创建模块私有换肤。

## 规格变更记录

- 2026-07-22：归并 EXP-CASE-03/07：Research Quest Tree、统一高风险事务状态机与 Evidence Pack；仅补规格，全部实现状态与本届排程不变。

- 2026-07-22：将 Campus Pass、General Balance、Dining & Wellbeing、Faculty Success、Institutional Front Office 纳入合并式扩展包；全部保持 `pending`。

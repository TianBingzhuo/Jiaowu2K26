---
status_schema: "1.0"
module_ids: ["F-009"]
module_status: technical_review
owner: null
active_slice: "transparent Opportunity Exchange fixture"
updated_at: "2026-07-24"
task_router: "../../PROJECT-MANIFEST.json#current_work"
---

# Opportunity Market · 状态

> 即时派单与 owner 以 `PROJECT-MANIFEST.json.current_work` 为唯一事实源；本文件记录 F-009 的可复验技术证据。`technical_review` 不等于产品负责人接受，也不等于已接入真实学校、雇主或机会提供方。

- **状态：** `technical_review`
- **演示边界：** 8 条机会、所有来源 URL、提供方回应、权益与申请结果均为 `demo_fixture`
- **负责人：** 待产品负责人认领并作接受/返工决定
- **公开数据边界：** 不包含真实学生资料、真实招聘数据、真实课程材料或机构凭证
- **核心依赖：**
  - F-003 Academic Mirror：只引用 `F-003:*` Fixture 证据身份，不读取真实 SIS
  - F-001 / F-005：作品导出只保留来源引用和审核状态，不复制原材料
  - F-006：容量只使用本人选择的非健康 What-if 信号

## 16 项功能验收矩阵

| 功能 | Fixture 技术候选 | 可复验证据 | 真实集成状态 |
|---|---|---|---|
| F009-01 官方机会采集 | ✅ | 8 条机会包含来源 URL、版本、抓取/核对时间、截止、成本、纠错渠道 | 未连接真实采集器 |
| F009-02 透明机会卡 | ✅ | Market Board 在打开详情前显示资格、收益、义务、成本与风险 | 等待真人文案/密度评审 |
| F009-03 透明机会包 | ✅ | 2 个包、8 项全部公开；无概率、稀有度、付费解锁或倒计时 | 无真实运营集合 |
| F009-04 资格规则 | ✅ | 20 条结构化规则均保留官方原文 Fixture 链接 | 未接真实规则版本监控 |
| F009-05 四态解释 | ✅ | 同一研究机会可同时显示 met / possibly_met / not_met / unknown；无综合分 | 真实规则准确性未验证 |
| F009-06 本人控制 Profile | ✅ | 11 个私密可选字段；默认仅选择 4 个；敏感代理字段进入禁止清单 | 未接真实身份或凭证 |
| F009-07 选择性匹配 | ✅ | 本人逐项选择字段，结果显示理由、冲突与未知；资格四态→截止时间确定性排序 | 未做真实公平样本评估 |
| F009-08 双向意向 | ✅ | save → student intent → provider Fixture ack；扩大披露前保持阻断 | 提供方回应为 Fixture |
| F009-09 最小披露 | ✅ | 披露前预览、用途、1–30 天期限、即时撤回、Box Score 字段回执 | 未接真实授权网关 |
| F009-10 申请镜像 | ✅ | 仅在本人确认外部操作后更新非权威镜像；平台没有投递能力 | 未接外部申请系统 |
| F009-11 Entitlement Wallet | ✅ | 3 个权益显示提供方、范围、条件、期限；不可购买资格 | 权益均为 Fixture |
| F009-12 Capacity | ✅ | 时间、精力、实验室时段、已获资助 4 维；超容量拒绝；不允许充值买资格 | 未接真实预约/资金系统 |
| F009-13 Pathway Portal | ✅ | 转方向、交换、提前修读 A/B/C 均展示学分、时间、成本、风险、回滚点与正式审批路径 | 只读 Scenario Draft |
| F009-14 作品/证据导出 | ✅ | 学生逐项选择 F-001 / F-005 引用；导出明确 `readable_untrusted` 且无原材料 | 无机构签名 |
| F009-15 公平与反操纵 | ✅ | 5/5 检查：零付费、零随机、零竞价、零禁止字段、零自动投递 | 未做真实群体公平审计 |
| F009-16 纠错与过期 | ✅ | 过期项默认移除；报告后进入人工复核、从当前匹配移除并保留 Replay | 无真实工单系统 |

## 实现证据

- **前端：** `app/apps/web/src/features/opportunitymarket/`
  - 6 个可操作阶段：Market Board、Eligibility Lens、Match Room、Consent Exchange、Pathway Portal、Fairness Replay
  - 键鼠、触控、窄屏、简化视图、减少动效与离线只读状态
  - 原创机会大厅背景：`reference/assets/university2k26-opportunity-exchange-background-v1.png`
- **领域：** `app/crates/domain/src/opportunity_market.rs`
  - Fixture 不变量、四态规则、确定性匹配、双向意向、限时披露、撤回、外部镜像、容量、路径、导出、报告、公平审计与追加回放
- **API：** `app/crates/api/src/lib.rs`
  - 18 个 F-009 路径，包含详情/资格/Profile/匹配/同意/撤回/外部镜像/容量/路径/导出/报告/公平/Replay/Fixture 重置
- **合同：**
  - `app/contracts/v1/opportunity-market-fixture.schema.json`
  - `app/contracts/v1/opportunity-market-session.schema.json`
  - `app/contracts/v1/opportunity-market-export.schema.json`
  - `app/contracts/v1/openapi.yaml`
- **黄金 Fixture：** `app/fixtures/v1/opportunity-market.demo.json`

## 已通过的技术验收

- [x] 8 条透明机会与 2 个透明机会包
- [x] 20 条来源可追溯资格规则
- [x] 四态同屏与无综合分
- [x] 私密、选择性 Profile；5 类禁止字段
- [x] 7 条确定性匹配解释
- [x] 双向意向、7 天最小披露、即时撤回
- [x] 外部申请仅镜像且必须本人确认
- [x] 3 个权益与 4 维容量 What-if
- [x] 3 条可回滚 Pathway
- [x] F-001 / F-005 选择性不可信导出
- [x] 报告后匹配重算与追加回放
- [x] 5/5 反操纵审计
- [x] 离线只读、简化视图、减少动效
- [x] 浏览器逐步实机验收并重置为干净状态
- [x] 13 项 Web 引擎测试、4 项领域测试、3 项 API 流程测试

## 仍需真人完成

1. 产品负责人确认这套“机会交易大厅”语言是否足够尊重学生、提供方和真实机会风险。
2. 至少招募目标学生测试：信息密度、四态理解、披露预览、撤回可发现性、路径误读与付费/资格误读。
3. 接入任何真实来源前，为每个提供方定义授权、刷新、失效、纠错、人工复核与数据主权协议。
4. 真实公平审计必须使用合规、代表性数据并接受学校治理；当前 AI/自动测试不计为参与者证据。

## 裁剪与失败边界

- P2 功能已作为**完整可操作 Fixture 技术候选**纳入本轮，未宣称真实集成。
- 正式申请永远留在权威外部系统；当前服务没有自动申请端点。
- 报告、Provider ack、权益与 Pathway 都是本地 Fixture 状态，不能冒充机构事实。
- 学术成绩、健康、家庭、财务账户、门禁与支付历史不得进入匹配；未来若需求变化必须先经过治理与人因审查。

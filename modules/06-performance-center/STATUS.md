---
status_schema: "1.0"
module_ids: ["F-006"]
module_status: technical_review
owner: product_integrator
active_slice: "F-006-fixture-vertical-slice-technical-candidate"
updated_at: "2026-07-24"
task_router: "../../PROJECT-MANIFEST.json#current_work"
---

# Performance Center · 状态

> 即时派单与 owner 以 `PROJECT-MANIFEST.json.current_work` 为唯一事实源；本文件只记录模块进度、阻塞和裁剪。

- **状态:** `technical_review`
- **规格状态:** Fixture 纵向切片技术候选；等待产品总集成人员接受，不是产品完成声明
- **优先级:** P2
- **负责人:** `product_integrator`（Codex 实现与集中技术复核；产品总集成人员最终接受）
- **依赖:** F-001 学习事件、F-002 赛季上下文、F-003 授权镜像，以及 X-02/X-03/X-05/X-08 共享边界
- **裁剪决策:** 只实现私密、本人可控的 Fixture 闭环；Degree Fahrenheit A/B 只进入研究预览，C 版无隐喻面板为默认
- **阻塞:** 没有技术阻塞；真实参与者研究、持久化后端和真实 SIS/模型输入仍未形成证据

## 功能点验收矩阵

| ID | 技术候选实现 | 验收证据 | 当前限制 |
|---|---|---|---|
| F006-01 | 六项版本化指标目录，逐项展示定义、用途、限制、来源与纠错入口 | `performance-center.demo.json`、Baseline 页面、Fixture/Schema 测试 | 指标含义尚未通过学校或真实学生效度验证 |
| F006-02 | 默认只与本人历史和目标比较，禁止跨人排名 | Fixture 不变量、领域校验、UI 边界说明 | 尚未接入真实历史记录 |
| F006-03 | 趋势区间、时间范围、显式 GAP 与文字等价 | Rhythm Film 页面、浏览器桌面/移动验收 | 当前为静态 Fixture 趋势 |
| F006-04 | 知识、应用、协作、习惯四维独立；证据不足不显示伪精确值 | 四维卡片、领域精确四维校验 | 尚无经过验证的量表 |
| F006-05 | 学分、截止日、时间投入、本人感受四类负荷信号，并关联三条支持动作 | Load Lab 页面、Fixture 引用完整性测试 | 支持入口为 Demo 动作，不是校内正式服务 |
| F006-06 | 三枚本人私密、权利中性的行为徽章 | Badge 卡片、领域私密/非权益校验 | 无真实授予流水 |
| F006-07 | 私密、非医学、可到期状态；默认不使用温度隐喻 | C 版默认、状态领域校验 | A/B 文案仍待真人研究 |
| F006-08 | 三条规则 Fixture 建议，含依据、成本、作用、替代方案、未知项与采用/稍后/拒绝 | Next Move 页面、推荐状态机/API 测试 | 未接入实时模型；不宣称个性化 AI |
| F006-09 | 九条 Evidence Pack，可由指标与建议钻取 | Evidence Drawer、`GET /evidence/{id}`、未知 ID 失败测试 | 来源为脱敏 Fixture |
| F006-10 | 明示置信、过期、冲突与未知，不以单一百分比掩盖缺口 | Trend/Ability 卡片与 Schema 必填约束 | 尚无真实冲突消解 |
| F006-11 | 目的限定、字段限定、接收者预览、七日到期、撤回及审计 | Share Preview→Create→Revoke 浏览器/API 流程 | 后端授权暂存进程内存 |
| F006-12 | 纠错形成新版本请求，不静默覆盖旧数据 | Correction Queue、领域/API 追加式审计测试 | 尚无学校工单适配器 |
| F006-13 | 文本等价、非颜色唯一编码、键盘语义、简化视图、减少动效及 377px 移动布局 | 浏览器键盘/移动验收、Web 测试与生产构建 | 实体手柄、真实触屏和读屏器仍待补证 |
| F006-14 | STOP 信号立即回到 C 版并锁定 A/B，只有受控重置才能开始新会话 | 浏览器复测；领域与 API 422 锁定测试；Replay 审计 | 0 位真实参与者，不能宣称已证实无害 |

## 可复现技术证据

- Rust：20 项 domain、14 项 API、1 项 SQLite，共 35 项测试；`fmt`、`check`、`clippy` 均通过。
- Web：严格 TypeScript、全站 16 个测试文件共 120 项 Vitest、Vite 6.4.3 生产构建通过。
- 合同：18 份 JSON Schema、6 份 Golden Fixture、OpenAPI 与 Manifest 确定性检查通过。
- API：F-006 的 14 条路由通过推荐、研究预览、分享、撤回、纠错、STOP、导出、Replay 与 Reset smoke；STOP 后重启 A/B 返回 422。
- 浏览器：桌面与 377px 移动宽度完成五步路径；验证 C 版默认、证据缺口、负荷支持、分享预览、纠错历史、STOP 锁定、离线诚实状态与可访问性开关。
- 人因：[`HF-02-DEGREE-FAHRENHEIT.md`](HF-02-DEGREE-FAHRENHEIT.md) 已形成可执行访谈包；当前结论仍为 `DEFER / 0 位参与者 / C 版默认`。

## 未完成与接受边界

1. 后端 Session 仍为进程内存，前端在离线 Fixture 引擎中完成交互；尚未证明跨重启持久化或所有写操作在线联调。
2. 没有真实 SIS/URP/LMS、实时模型、正式学校服务、实体手柄、真实触屏、读屏器或第二台机器证据。
3. 指标、状态和建议都没有真人效度或反伤害结论；AI 不能代替参与者，人因门禁保持 `DEFER`。
4. 本状态只表示“技术候选可供评审”。产品总集成人员未接受前，不得改写为 `accepted`、`done` 或正式上线。

- **最后更新:** 2026-07-24

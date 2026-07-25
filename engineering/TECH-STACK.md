# 大学2K26 / University2K26 · 技术选型

> **状态：** GATE-1 本机实验和 GitHub Actions Ubuntu/Windows/合同文档门禁已通过，仍待第二台机器复现与产品总集成人员接受决定；未经批准不称为最终 Primary。
> **原则：** 团队熟悉度 > 技术看起来新；6h 闸门未通过立即回退。
> **P0 产品：** 智课工坊 / SmartCourse Studio
> **更新时间：** 2026-07-24

---

## 0. 当前证据快照

| 层 | 结果 | 当前结论 |
|---|---|---|
| Rust 1.97.1 / Axum 0.8.9 / Tokio 1.53.1 | WSL2 编译、`fmt/check/test/clippy`、实时 API smoke 与 GitHub Actions 双平台门禁通过 | **进入接受评估**，FastAPI / Node 回退保留 |
| 领域合同 | 无框架 domain crate；OpenAPI 3.1、35 份 JSON Schema、10 份 Golden Fixture | **进入本地技术评审**；未知枚举保留并阻止高风险自动动作，F-003 固定来源/快照/字段血缘/同意/审计边界，F-004 固定 Prefix/Pins/Plan/Unsat/Transaction/Lock 与目录验证门，F-005 复用同一证据命名空间与状态机，F-006 固定私密指标/证据/授权/纠错/STOP，F-007 固定课程来源/版本/纠错/公平/治理边界，F-008 固定画像关闭/日历冲突/非权威镜像/最小披露/紧急升级/私有回执边界，F-009 固定透明来源/四态资格/选择性 Profile/双向意向/最小披露/零自动投递/公平 Replay 边界 |
| SQLx 0.9.0 / SQLite | 写入、查询、乐观并发、审核/发布事务与 Replay 通过 | **当前已验证数据路径**，无云账号也能运行 |
| OceanBase | 尚未做账号、TLS、migration、事务和 join 实验 | **未采用 / 未否定**；只是可选后续 adapter，不阻塞启动 |
| React 19 / TypeScript 5.9 / Vite 6.4.3 | 用户已接受 Option 1 首页美术；`app/apps/web` V0.9 与 F-001～F-010 Fixture 纵向切片通过类型检查、161 项测试和生产构建；当前 Edge/Chromium 已复测四个机构工作台、角色切换、浏览器返回、AI 规则回退、SLS 16 周蓝图、机会市场校内/校外双联赛、AdventureX、UArizona Summer 2026 公开目录检索、排课门、移动端与英文角色导览 | **本地技术评审**；五角色/四工作台、来源约束建议组件、完整 SLS 课程、分区机会市场、公开目录浏览器及既有十模块路径已落地，实体手柄、真实触屏、Firefox/Safari 运行时、动效 profile、真实求解器和第二台机器仍待补证 |
| AI Provider / GX10 | provider-neutral OpenAI-compatible adapter、Moonshot/Kimi K2.6 Fast 当前参数合同、Windows DPAPI 服务端 BYOK、loopback 无凭据模式、严格来源校验与规则回退已通过本地测试；GX10 未实机运行 | **adapter 已实现 / 实时模型证据未形成**；Qwen3.6 35B 是首个 GX10 Spike，模型故障不得阻塞产品 |
| Unity / Unreal / Tauri / WinUI 3 | 未接入 | **不进入当前基座** |

Windows 原生 Rust 失败的对照证据是 Code Integrity 3077/3033：Smart App Control 阻止 `rustc.exe` 加载本地生成的未签名 proc-macro DLL。同一工作树在 Ubuntu WSL2 编译和测试通过；项目没有关闭或修改安全策略，验证脚本会在该状态下自动选择 WSL。

实际版本、上游、许可证元数据、用途与剩余 NOTICE 工作见 [Phase 0 依赖登记](DEPENDENCIES.md)。

## 1. 后端

```
团队有 Rust 负责人，且 6h 内能完成一条写入、查询、审核状态迁移、前端调用和失败响应？
├── 是 → Rust + Axum + Tokio（模块化单体）
│   └── 6h 闸门未通过？→ 切回退
└── 否 ↓

团队熟悉 Python Web 框架？
├── 是 → FastAPI
└── 否 → Node + Fastify / Express
```

**待审核建议：** Rust + Axum + Tokio 为条件主选。
- 适合表达审核状态机、不可变数据不变量和类型化错误；
- 可替换适配器覆盖数据库、模型、OCR、SIS 和求解器；
- HTTP 从 `/api/v1/` 起步，并由 OpenAPI/JSON Schema + Golden Fixture 定义；语言切换不得改变合同语义；
- **不应承担**：团队不熟时的全部 Web 交付、Python 更成熟的 OCR/PDF 实验、72h 微服务。

**回退规则：** 正式开赛后第 6 小时，至少一位队员能独立调试完成纵向切片。任一关键项未通过，立即切换团队最熟悉的单 API 后端。

---

## 2. 数据库

```
OceanBase 云账号已确认，且以下条件全部通过？
  · 连接 + TLS
  · SQLx migration
  · 审核状态事务提交和回滚
  · 来源—对象—事件关键 join
  · 唯一约束、索引和时间字段行为
  · 切换 SQLite 后领域测试仍通过
├── 是 → OceanBase MySQL mode + SQLx
└── 否 ↓

需要本地事务和关系查询？
├── 是 → SQLite（强制回退，与主库共享 repository 合同）
└── 否 → JSONL 只读 / 演示 fixture
```

**待审核建议：** OceanBase 条件主选 + SQLite 强制回退。
- P0 数据量不需要分布式能力；
- MySQL 模式降低 SQLx 接入门槛；
- 连接或迁移问题不能拖垮 72 小时。

---

## 3. 前端

```
需要高密度数据展示、跨设备、72h 快速开发和演示？
├── 是 → React + TypeScript + Vite（Web/PWA Primary）
│   ├── UI: CSS Design Tokens + 原生语义组件；CSS/WAAPI 优先
│   ├── 图表: 语义化 HTML/SVG/Canvas + 文本等价
│   └── PWA 缓存只保存允许离线的数据
└── 否 ↓

最终演示以 Windows 为主，且有 C#/XAML 负责人？
├── 是 → WinUI 3（条件式教师审核控制台，Secondary）
└── 否 → 纯 Web

以上均失败？
└── 录屏 / 截图 + 口头讲解
```

**当前 P0-00-D 实现：** React + TypeScript + Vite Web/PWA 为 Primary；是否跨过 GATE-1 仍由最终 QA 和产品总集成人员决定。
- Design Tokens 管理色彩、字号、间距、动效和密度；
- 当前不引入动效框架，先以 CSS/WAAPI 实现因果状态转场并支持 `prefers-reduced-motion`；只有测量证明复杂编排需要时才评估新增依赖；
- 一个 `Experience Shell` 承载 Student / Faculty / Institution 三种 Role Lens；所有模块只能消费中央 Token、组件、图标、动效和资产登记，不得建立私有主题；
- 第一轮只在 Windows 验证，但领域模型、OpenAPI/JSON Schema、状态机和 Design Token 从第一天保持平台无关；
- WinUI 3 只可作为 Windows 特有能力壳，不能承载领域规则；Tauri 2 可在 P0 后评估 Windows/macOS/iOS/Android 壳，但不是 HarmonyOS 的默认答案；
- HarmonyOS 7 使用同一 Web/API 合同，后续单独验证 ArkUI/ArkTS 或 ArkUI Web 适配；任何原生壳都不能复制第二套业务逻辑。
- 输入层使用 `SemanticAction → InputAdapter → UI Focus Graph`：Web/PWA 通过 [W3C Gamepad API](https://www.w3.org/TR/gamepad/) 读取标准布局并保留键盘/触控/读屏等价路径；未来 Windows 原生壳可增加 [Microsoft GameInput](https://learn.microsoft.com/en-us/gaming/gdk/docs/features/common/input/overviews/input-overview) 适配器。组件不得硬编码按钮编号或把手柄逻辑写入领域层。
- RealSense、NFC/智能卡和复古调制解调器只允许作为 `Capability/InputAdapter` 的非 P0 实验；数据最小化、替代路径与安全停损见 [HUMAN-FACTORS · 实验外设池](../product/HUMAN-FACTORS.md#715-实验外设池--peripheral-lab全部非-p0)。

完整兼容策略、版本窗口和平台矩阵见 [ARCHITECTURE · 01 基座兼容性宪章](ARCHITECTURE.md#01-基座兼容性宪章)。

### 游戏化界面不等于游戏引擎

| 表面 | 适合承担 | 本项目结论 |
|---|---|---|
| React / Web/PWA | 高频数据界面、快速模板迭代、跨桌面/平板/手机、可访问性与离线回退 | **P0 Primary 已进入正式壳验证**；首页美术已接受，完整产品尚未完成 |
| WinUI 3 | Windows 原生窗口、通知、系统输入、MSIX、特定教师/演示控制台 | **Windows adapter / Secondary**；官方明确它不是跨平台框架，不能成为未来多端共享 UI 或领域层 |
| Unreal CommonUI / UMG | 高沉浸 3D 场景、复杂分层游戏菜单、手柄输入路由、展会级 Campus Arena | **可选 Companion**；只通过同一 API/语义动作连接，不接管教务表单、数据主权或领域规则 |

因此不是“WinUI 3 或 Unreal 二选一”。默认结构是 `Rust 领域/合同 → React Experience Shell → Windows 可选 WinUI adapter`，只有首页模板和 P0 主路径稳定、且有人承担 Blueprint/资产/性能预算时，才增加 `Unreal Campus Arena Companion`。三者不得各自复制状态机、课程对象和权限规则。

---

## 4. AI / 模型

```text
任务能由规则 / 检索 / Fixture 完成？
├── 是 → 不调用模型
└── 否 ↓

输入允许留在本地主权节点，且 GX10 Spike 通过？
├── 是 → 本地 Provider
│   ├── 默认 Main：Qwen3.6-35B-A3B-NVFP4
│   └── 条件 Fast：Qwen3-8B-NVFP4（只有实测证明路由有收益才常驻）
└── 否 ↓

赞助模型账号、数据条款、结构化输出与延迟通过，且输入已获准/最小化？
├── 是 → Step 3.7 Flash 等赞助 Provider
└── 否 → Fixture / 人工路径
```

**当前实现：** Provider-neutral OpenAI-compatible adapter + 服务端 BYOK 环境变量 + 严格 `source_ids` + 明确标注的规则回退已进入 Rust API；GX10 本地 Main Lane 仍待实机回执，RAG 仍未实现。

- 今晚只选一个本地主模型时使用 NVIDIA 已给出同类 GB10/128GB 单机配方的 `Qwen3.6-35B-A3B-NVFP4`；这表示“最适合当前硬件和交付约束”，不是通用能力排行榜第一；
- Step 3.7 Flash 先作为赛事赞助 API 质量通道；其官方 GGUF 量化与运行开销接近 128GB 总统一内存上限，本地只允许停止其他模型后的独立 Spike；
- DeepSeek V4 Flash、Kimi K2.6、GLM-5.2 与 MiniMax M3 的云端可调用不等于适合单台 128GB 节点本地部署；Moonshot 云端 BYOK 默认使用 `kimi-k2.6` 并关闭深度思考降低交互成本，GX10 仍只采用经过本机 `/v1/models`、内存与延迟实测的公开权重；Qwen 3.8 也不按名称猜选；
- 双模型只在 Fast Lane 能显著降低延迟/成本且不造成资源争用时启用；否则一个 Main 模型 + 确定性路由更简单可靠；
- 要求结构化输出、可回指 `source_ids`、错误可区分；
- 核心状态由本地服务决定，模型不能直接发布或修改权威记录；
- 网络/额度/格式失败时切规则或 fixture，明确显示 `fallback_used`；
- 不把密钥、课程材料或个人数据提交到代码仓库。

Moonshot 当前官方依据：[Kimi K2.6 快速开始](https://platform.kimi.com/docs/guide/kimi-k2-6-quickstart)、[思考模式开关](https://platform.kimi.com/docs/guide/use-kimi-k2-thinking-model)、[模型列表与下线计划](https://platform.kimi.com/docs/models)。本实现对 K2.6 不发送其固定采样字段，默认使用 `thinking={"type":"disabled"}`、有界 `max_completion_tokens` 与严格 JSON Schema；真实账户权限、余额、延迟和结果质量仍必须由本机三任务回执证明。

完整硬件事实、模型表、数据主权、安全边界和 30 分钟实机步骤见 [GX10 本地主权 AI 节点](LOCAL-AI-SOVEREIGN-NODE.md)。

### BYOK 与 CLI / 外部 AI 访问

**待审核建议：** `ProviderProfile + 本机凭据引用 + 同合同 CLI`，不让每个模型 SDK 或 AI 工具直接进入领域层。

- 队友可自选 OpenAI-compatible、本地 GX10 或已批准的赞助模型，但只配置 `base_url/model_id/capabilities/key_ref`；密钥保存在操作系统凭据库或当前进程环境，不进入仓库、浏览器持久存储、参数、日志和 Replay。
- CLI 暂定名 `j2k26`，第一批只读命令为 `doctor`、`health`、`capabilities`、`contract validate`；JSON 输出、稳定 exit code 和 OpenAPI/Schema 使外部 AI 不需要解析 GUI。
- 外部 AI 访问默认只读、allowlist、短时 scope、可撤销和可审计；任何发布、支付、门禁、正式提交或权威写回都要求绑定具体动作的一次性人类批准，不能使用通用 `--yes` 绕过。
- 模型 profile 可共享，credential 不共享；未知自定义 endpoint 需要 SSRF/重定向/IP 校验，未通过时保持 Fixture。
- 这轮只冻结合同，不增加 CLI crate 或凭据库依赖；待 `P0-00-B/C` accepted 后再以独立任务实现，避免让 review 中的基座静默扩张。

完整命令、安全和兼容合同见 [ARCHITECTURE · CLI、外部 AI 与 BYOK](ARCHITECTURE.md#9-cli外部-ai-与-byok-自动化合同)。

**Python worker 边界：** 只承担 PDF/PPT/OCR/ASR 提取。输入输出版本化 JSON/文件合同，失败不改变领域状态，成功产物先进入草稿。

---

## 5. 搜索 / RAG

```
P0 阶段需要语义搜索吗？
├── 否 → 关键词 / 全文检索 + 来源链接（页码/时间戳切片）
└── 是 ↓

有真实数据证明关键词检索不够？
├── 是 → 向量检索（embedding），保存模型、版本、切片和重建方式
└── 否 → 仍用关键词，不为"RAG"标签增加不可验证复杂度
```

**待审核建议：** 先词法搜索，按需升级向量。
- 向量相似度 ≠ 证据支持度；
- 来源覆盖和检索失败有真实数据后，再评估 embedding。

---

## 6. 部署

```
现场有稳定网络 + 云账号已确认？
├── 是 → Zeabur / 赞助云容器部署
└── 否 ↓

本地机器可运行全栈？
├── 是 → localhost + SQLite（零外部依赖，断网可用）
└── 否 → 纯前端 + JSONL fixture / 录屏保底
```

**待审核建议：** Local-first，Zeabur / 经确认赞助云为 Secondary。
- 演示不能依赖唯一公网路径；
- 所有回退路径必须可在最终演示机上独立验证。

---

## 7. 求解器

```
问题类型？
├── 个人课程组合、毕业路径 → SAT / MaxSAT（布尔依赖、互斥、分层偏好自然）
├── 教室/教师/时间/容量排程 → OR-Tools CP-SAT（区间、资源互斥自然）
└── 现场无法集成 → 确定性启发式（best-feasible + 完整违例 + 稳定复现）
```

**待审核建议：** 求解器只作 P1/P2 候选，不进入 P0。
- 借鉴 Conda 的 specs/diff/transaction/lockfile 语义，不直接硬套 libsolv；
- 先固定 `SolverBackend` 输入/输出与解释，再用最小数据集比较。

---

## 8. 身份、门禁与权益（F-010，Vision）

```
只需黑客松演示身份？
├── 是 → 本地 demo identities + 后端 RBAC（显式标记 fixture）
└── 否 → 机构批准后再评估 OIDC / SAML / SCIM 与校园身份适配器

涉及实体通行？
├── 仅解释/申请镜像 → Entitlement + Policy Rule + Audit
└── 真实签发/门锁控制 → 本届拒绝；必须接校方受控系统和专门安全评审
```

**待审核建议：** 核心领域只保存 `IdentityLink`、`Entitlement`、规则版本和审计；认证协议与物理凭证放适配器层。
- 应用权限使用后端 RBAC，复杂场景再增加可解释 ABAC；UI 隐藏按钮不算鉴权；
- 移动凭证必须短期、可撤销、防重放并支持离线新鲜度；不自研密码协议；
- 不保存 SSO 密码、门锁密钥、静态万能码或精细移动轨迹；
- P0 不接真实身份和门禁，全部使用清楚标记的 fixture。

---

## 9. General Balance 与支付（F-011，Vision）

```
只做预算/账单演示？
├── 是 → SQLite/OceanBase 领域账本 + sandbox/fixture 回执
└── 否 → 机构与支付方批准后，通过 PaymentRail adapter 接校园聚合支付或具体通道
```

**待审核建议：** Rust 领域层使用追加式双向分录/守恒校验，OceanBase MySQL mode 为条件主库、SQLite 保持同合同回退；确定性 Policy Engine 决定资金用途和 Module Cap，AI 只解释规则。

- `GeneralCashAccount`、`PolicyBalanceAccount`、`ExternalRailReference`、`BudgetEnvelope`、`Entitlement` 使用不同类型和表；
- 支付宝、微信支付、云闪付/银联、银行卡或 Stripe 经统一 `PaymentRail` 适配器进入；按学校现有通道选择，不把 Stripe 当中国校园总入口；
- 优先使用通道托管/令牌化界面，服务端不接触完整卡号、CVV、支付密码或外部账户完整余额；
- 交易采用 `preview → user confirmation → provider execution → webhook/callback → reconciliation`，幂等键、状态机、退款和争议可审计；
- P0 与本届默认拒绝真实资金，只允许 sandbox/fixture；真实上线需支付、隐私、安全、财务、审计与运维专项评审。

---

## 10. 机构读模型、策略与分析（F-012～F-014，Vision）

**待审核建议：** 不新建“大而全校园数据湖”。继续复用 Academic Mirror 的适配器、血缘、时效和权威等级，在同一关系库建立用途受限的 read model；后台任务只做聚合、索引和可重放 scenario。

- 确定性规则/约束：Rust 领域服务 + 版本化 JSON 输入；复杂排程继续走 SAT/MaxSAT/CP-SAT adapter；
- 推荐说明：Provider-neutral AI adapter 可生成解释和备选，但不得改变规则结果或自动发布政策；
- 分析：优先 SQL 聚合与可导出表，只有真实需要时再引入单独 BI/仓库；
- 敏感域：饮食偏好、无障碍、资助、人事、科研合规按目的隔离和最小保留；
- 机构 What-if 输出假设、数据版本、受影响群体、权衡、未知和人工批准状态。

---

## 11. 游戏引擎

```
P0 核心差异需要高保真 3D 校园/角色/虚拟制作？
├── 是 → 有专职 Blueprint/C++ 人员 + 12-18h 独立预算？
│   ├── 是 → Unreal Engine 5.8
│   └── 否 → Unity（已装 6000.3.17f1）
└── 否 → 不采用游戏引擎
```

**待审核建议：** P0 不用游戏引擎；当前官方发布线仍是 Unreal Engine **5.8**，没有把不存在的“UE6”写入计划。
- Unity 仅 P2 展会外壳候选（Campus Hub），业务仍走同一 API；
- Unreal 5.8 P0 拒绝，当前不安装；若通过后续 Gate，优先使用 CommonUI/UMG 的跨平台分层菜单、输入路由与手柄焦点，不把世界内 Widget 当数据主界面。
- 统一游戏化美术依靠 Web Design System、资产管线和交互语法实现，不以安装 Unity/Unreal 为前提。
- 具备 Revit / 空间渲染能力时，P0 只做原创 Campus Arena 的构图、预渲染和优化 Web 资产；运行时 3D 必须在 UI 主路径稳定后另过性能 Gate。Revit 可按 Epic 官方 [Datasmith 工作流](https://dev.epicgames.com/documentation/en-us/unreal-engine/using-datasmith-with-revit-in-unreal-engine) 导出选定 3D View，或按 Autodesk 官方流程导出 FBX，但这不自动批准 UE 进入 P0。

2026-07-23 本机只读复核：

- Windows 11、i7-13700H（14C/20T）、63.6 GiB RAM、RTX 4070 Laptop 8 GiB、C: 约 1113 GiB 空闲，达到 Epic 对 UE 5.8 的 32 GiB RAM / 8 GiB 显存建议下限；适合受控原型，但 8 GiB 显存不宜把 Nanite/Lumen、高分辨率纹理和完整编辑器场景同时堆满。
- Unity Hub 3.13.0 与 Unity 6000.3.17f1 已安装；只发现 Epic Launcher prerequisites，没有发现 Unreal Engine 安装目录。
- Visual Studio Community 2026 18.7.1、.NET SDK 10.0.301 与 Developer Mode 已就绪；WinUI application development workload 和 `dotnet new winui` 模板尚未安装。
- 结论：现有 Phase 0、Web 模板和 Unity 条件 Spike 空间充足；WinUI/Unreal 都不是“已配置完成”。在用户选定首页方向和客户端边界前，不下载大型可选工作负载。

**官方依据：** [WinUI 3 入门与非跨平台边界](https://learn.microsoft.com/en-us/windows/apps/get-started/winui-get-started-overview) · [WinUI 输入与 Windows.Gaming.Input](https://learn.microsoft.com/en-us/windows/apps/develop/input/) · [Unreal CommonUI 概览](https://dev.epicgames.com/documentation/en-us/unreal-engine/common-ui-plugin-for-advanced-user-interfaces-in-unreal-engine) · [CommonUI 设计边界](https://dev.epicgames.com/documentation/unreal-engine/design-guidelines-for-using-commonui-in-unreal-engine) · [UE 5.8 硬件/软件规格](https://dev.epicgames.com/documentation/unreal-engine/hardware-and-software-specifications-for-unreal-engine)

---

## 12. 技术闸门（前 6 小时）

GATE-1 通过并由团队负责人记录后，才可把对应小节的“待审核建议”改为“本届已选”。仅在文档中写成 Primary，不构成批准。

| 时间 | 必须完成 | 失败动作 |
|---|---|---|
| 0–1h | 保存规则、确定团队角色、主题/赛道、演示机与授权样例 | 不建支线 |
| 1–2h | Web → API 最小请求；一个 source record；一个状态迁移 | 回退更熟悉后端/UI |
| 2–4h | Rust 与 OceanBase/SQLite spike；一个模型结构化输出 | 数据库或模型失败切回退 |
| 4–6h | 冻结 Primary、Secondary、Fallback；登记依赖与版本 | 未通过技术移出 P0 |

---

## 13. 明确不进入 P0

- 微服务、Kubernetes、事件总线和多云编排
- UE/Unity 3D 城市、双 XR、多人在线大厅
- 多模型/多 Agent 展柜或临时训练大模型
- 真实 SIS 写回、自动投递、支付、区块链资格
- 真实 General Balance、支付通道、校园门禁、门锁、校园生产身份与银行卡数据
- Dining / Faculty Success / Front Office 的生产集成、个人画像或自动权威决策
- 全校排课、公开能力排名、付费机会系统
- 同时维护 Web、WinUI、Unity 和 Unreal 四套客户端

---

## 14. 本地成品案例审计对技术选型的影响

2026-07-22 的 Project.L、工创赛、交通锦衣卫、sci-calc 等本地案例审计没有产生新的框架依赖，也不改变“React Web/PWA + 条件 Rust/OceanBase + SQLite 强制回退”的提案。它只增加四项实现合同：

1. **显式状态机：** 内容审核、Case、支付镜像、门禁申请和政策 What-if 使用类型化状态迁移，不以散落布尔字段拼流程。
2. **统一 Result Envelope / Evidence Pack：** AI、规则、求解器和外部适配器共享来源、未知、版本、前后状态、人工决定和 Replay 合同。
3. **幂等与离线队列：** 可重试操作带幂等键、状态和人工接管；高风险动作离线时只能排队，不能伪造完成。
4. **确定性 Rails：** AI 负责草稿、解释和备选，权限、发布、分账、资格与正式状态由 Rust/回退后端中的确定性规则和责任人决定。

因此不新增多 Agent 展柜、事件总线、区块链、UE/Unity 客户端或**必须在线的本地大模型**作为 P0 启动依赖。GX10 可作为同合同的可选本地 Provider 进入 GATE-1 Spike；失败立即回到 Fixture，不改变领域合同或阻塞主闭环。

---

## 15. 版本控制、协作平台与统一环境

### 15.1 平台决策

**决定：GitHub 是唯一可写主仓。** AdventureX 的提交字段要求 GitHub 仓库链接，因此 Gitee、GitCode 或 CNB 不能替代本届主仓。仓库只能在开幕式结束、主办方正式宣布 Hacking 开始后创建。

| 平台 | 本项目定位 | 理由与边界 |
|---|---|---|
| GitHub | **Canonical / 唯一可写** | 满足赛事提交；使用协作者、Issues、Draft PR、Actions 和 `main` 保护；CODEOWNERS 只作责任映射，不制造单人仓的审批死锁 |
| Gitee | 可选单向只读备份 | 中国大陆访问备份；只允许 GitHub → Gitee 或由总集成人员在 Accepted Tag 后推送。禁止双向镜像，避免竞态、覆盖和丢提交 |
| CNB | 暂不采用 | PR、云原生开发和 `.cnb.yml` CI 能力完整，但会引入第二套 CI/任务状态；只有 GitHub 长时间不可用且团队已熟悉时才重新评估 |
| GitCode | 暂不采用 | 有保护分支、PR 和流水线，但对本届没有超过 GitHub 的必要价值，同样会形成第二事实源 |

GitHub Free 的公开仓库可用保护分支；免费私有仓的高级保护能力受限。默认建议在官方允许的前提下使用公开 Organization 仓库并严格排除密钥/个人数据；若团队决定先私有且没有相应方案，则由总集成人员人工执行同等 PR 门禁，并在提交前确认评委可访问。无论可见性如何，都不把 `.env`、课程敏感材料、真实学生数据或未授权资产提交到仓库。

**参考：** [GitHub Protected Branches](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches)、[GitHub Repository Roles](https://docs.github.com/en/organizations/managing-user-access-to-your-organizations-repositories/managing-repository-roles/repository-roles-for-an-organization)、[Gitee 仓库镜像说明](https://gitee.com/help/articles/4336)、[CNB 构建触发规则](https://docs.cnb.cool/zh/build/trigger-rule.html)、[GitCode 保护分支](https://docs.gitcode.com/docs/help/home/org_project/project_manage/branch_management/set_protected_branch/)。

### 15.2 分支与合并协议

- 不使用 GitFlow，不维护长期 `develop`；`main` 始终是唯一集成线和当前可演示版本。
- 全队产品 WIP 上限为 1；分支使用 `feat/p0-xx-short-name`、`fix/p0-xx-short-name`、`design/p0-xx-short-name`、`docs/short-name`，最长存活一个工作时段。
- Commit 使用 `type(scope): summary`，例如 `feat(p0-03): append teacher review event`；一个 commit 只表达一个可回退意图。
- PR 必须关联当前唯一主 Issue，附验收 ID、运行证据、测试命令、失败/回退、依赖与许可证变化；当前由 Codex 集中审查 diff、合同、测试与风险，产品总集成人员作接受/合并决定。队友到位后可自愿 Review，但不是合并硬依赖。
- 只允许 squash merge；合并后删除分支。每个通过切片打 annotated Tag `p0-xx-accepted`，下一切片才从 Backlog 进入 Ready。
- `main` 强制 `Rust (ubuntu-latest)`、`Rust (windows-latest)`、`Contracts and docs` 三项最新 SHA 状态检查；共享合同和 migration 变更不得靠聊天口头同步。
- 每次 Push 由 PR CI 实时验证；总集成人员在隔离 worktree/临时目录 Checkout Ready PR。不要让所有队员持续把未审核分支拉进自己的工作分支，更不能污染最终 Demo 目录。

### 15.3 环境一致性合同

采用“**原生快速路径 + 可复现检查 + 本地回退**”，不把 Docker Desktop、云数据库或某一台电脑变成唯一开发入口：

1. 正式开工 30 分钟内在最终演示机确定并记录 Node、Rust、Python（若使用）与数据库版本；不要凭文档预先声称已选。
2. Rust 使用 `rust-toolchain.toml` + `Cargo.lock`；前端在 `package.json` 固定 `engines` 与 `packageManager` 并提交唯一 lockfile；Python worker 若启用则提交 `.python-version` 与 `uv.lock`/等价锁文件。
3. 根目录维护 UTF-8/LF 的 `.editorconfig`、`.gitattributes`、`.gitignore`、无秘密的 `.env.example`；数据库只通过版本化 migration 演进。
4. 提供 Windows `scripts/doctor.ps1`、`bootstrap.ps1`、`verify.ps1`；若有 macOS/Linux 队友，再提供同语义 `.sh`。`verify` 至少覆盖 format、lint、typecheck、unit/contract tests 与 build。
5. 所有人先用同一 fixture 与 API/Schema 合同开发。模型、OceanBase 或网络不可用时切到明确标注的 fixture + SQLite，仍走真实状态机。
6. 每次 Accepted 前在最终演示机冷启动一次，并由另一台机器复现；“只在作者电脑能跑”视为未完成。

详细切片顺序与验收见 [MODULE-MAP](../product/MODULE-MAP.md#四人单功能-wip-协议)，开仓动作见 [GATE-1](../gates/GATE-1-技术验证-6h.md#阶段-0-1h规则空白基线与协作底座)，非技术/设计同学的图形化操作见 [GITHUB-COLLAB](GITHUB-COLLAB.md)。

---

## 16. 跨平台、双归档与学校主权联邦（架构候选，不进 P0）

| 能力 | 待审核候选 | 不采用的捷径 |
|---|---|---|
| 共享客户端合同 | OpenAPI 3.1 + JSON Schema + Golden Fixture + 生成/校验类型 | 在 React、WinUI、Swift、Kotlin、ArkTS 各手写一套对象 |
| Web/PWA | React + TypeScript + Vite + 响应式同一 Shell | 为手机/平板复制第二产品 |
| Windows/macOS/iOS/Android 壳 | P0 后按必要性评估 Tauri 2；Windows 专属集成才评估 WinUI 3 | 把 WinUI 领域对象当跨端合同 |
| HarmonyOS 7 | 先验证标准 Web/API；原生能力用 ArkUI/ArkTS adapter | 假设 Android 或 Tauri 构建可无验证直接发布 |
| 可读归档 | ZIP + 离线 `index.html` + JSON/CSV/PDF + manifest/hashes | 只有一份无法机器处理的 PDF |
| 可信归档 | 确定性 Manifest + 发行方数字签名 + 可选认证加密；使用成熟审计库 | 自研密码算法、把“有密码”当“学校可信” |
| 密钥 | 生产候选使用机构批准的 KMS/HSM、`key_id`、轮换和撤销 | 私钥放客户端、仓库、数据库普通字段或导出包 |
| 学校节点 | 同一模块化单体的 Sovereign Node 部署模式 + outbox/inbox 幂等同步 | 为每校复制代码、P0 上微服务/Kubernetes |
| 中央主服务 | Schema/信任注册、路由、同意回执、最小读模型和获准加密副本 | 默认集中收集所有原始成绩、门禁、消费、健康、人事数据 |

正式选库前必须做四项 GATE：目标平台维护状态与许可证、跨版本 Fixture 验证、密钥/归档威胁模型、学校数据与监管审批。架构细则见 [ARCHITECTURE · 双归档合同](ARCHITECTURE.md#6-personal-data-archive--双归档合同) 与 [学校主权联邦合同](ARCHITECTURE.md#7-sovereign-federation--学校主权联邦合同)。

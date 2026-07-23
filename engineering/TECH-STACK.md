# jiaowu2K26 · 技术选型

> **状态：** GATE-1 本机实验已产生可复查证据，仍待 GitHub Actions、第二台机器与用户审核；未经批准不称为最终 Primary。
> **原则：** 团队熟悉度 > 技术看起来新；6h 闸门未通过立即回退。
> **P0 产品：** 智课工坊 / SmartCourse Studio
> **更新时间：** 2026-07-23

---

## 0. 当前证据快照

| 层 | 结果 | 当前结论 |
|---|---|---|
| Rust 1.97.1 / Axum 0.8.9 / Tokio 1.53.1 | WSL2 编译、`fmt/check/test/clippy` 与实时 API smoke 通过 | **进入 PR 审核**，FastAPI / Node 回退保留 |
| 领域合同 | 无框架 domain crate；OpenAPI 3.1、4 份 JSON Schema、Golden Fixture | **进入 PR 审核**；未知枚举保留并阻止高风险自动动作 |
| SQLx 0.9.0 / SQLite | 写入、查询、乐观并发、审核/发布事务与 Replay 通过 | **当前已验证数据路径**，无云账号也能运行 |
| OceanBase | 尚未做账号、TLS、migration、事务和 join 实验 | **未采用 / 未否定**；只是可选后续 adapter，不阻塞启动 |
| React / TypeScript / Vite | 本轮尚未建壳 | **待 P0-00-D**，不能声称前端已实现 |
| AI Provider | 仅使用明确标注 Fixture | **未选择模型**，不得把 Fixture 说成实时 AI |
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
│   ├── UI: CSS Design Tokens + Headless 组件（Radix UI）+ Framer Motion
│   ├── 图表: 语义化 HTML/SVG/Canvas + 文本等价
│   └── PWA 缓存只保存允许离线的数据
└── 否 ↓

最终演示以 Windows 为主，且有 C#/XAML 负责人？
├── 是 → WinUI 3（条件式教师审核控制台，Secondary）
└── 否 → 纯 Web

以上均失败？
└── 录屏 / 截图 + 口头讲解
```

**待审核建议：** React + Vite Web/PWA 为 Primary。
- Design Tokens 管理色彩、字号、间距、动效和密度；
- Framer Motion 只处理状态转场，支持 `prefers-reduced-motion`；
- 一个 `Experience Shell` 承载 Student / Faculty / Institution 三种 Role Lens；所有模块只能消费中央 Token、组件、图标、动效和资产登记，不得建立私有主题；
- 第一轮只在 Windows 验证，但领域模型、OpenAPI/JSON Schema、状态机和 Design Token 从第一天保持平台无关；
- WinUI 3 只可作为 Windows 特有能力壳，不能承载领域规则；Tauri 2 可在 P0 后评估 Windows/macOS/iOS/Android 壳，但不是 HarmonyOS 的默认答案；
- HarmonyOS 7 使用同一 Web/API 合同，后续单独验证 ArkUI/ArkTS 或 ArkUI Web 适配；任何原生壳都不能复制第二套业务逻辑。

完整兼容策略、版本窗口和平台矩阵见 [ARCHITECTURE · 01 基座兼容性宪章](ARCHITECTURE.md#01-基座兼容性宪章)。

---

## 4. AI / 模型

```
开幕式确认至少 1 个赞助模型（账号、Credit、结构化输出、数据条款、延迟通过）？
├── 是 → 赞助模型（Provider-neutral adapter）
└── 否 ↓

本地有可用模型（延迟和内存可接受）？
├── 是 → 本地模型
└── 否 → Fixture（预置规则/固定草稿，明确标注 generation_mode: "fixture"）
```

**待审核建议：** Provider-neutral adapter + 一个可替换模型。
- 要求结构化输出、可回指 `source_ids`、错误可区分；
- 核心状态由本地服务决定，模型不能直接发布或修改权威记录；
- 网络/额度/格式失败时切规则或 fixture，明确显示 `fallback_used`；
- 不把密钥、课程材料或个人数据提交到代码仓库。

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

**待审核建议：** P0 不用游戏引擎。
- Unity 仅 P2 展会外壳候选（Campus Hub），业务仍走同一 API；
- Unreal 5.8 P0 拒绝，当前不安装。
- 统一游戏化美术依靠 Web Design System、资产管线和交互语法实现，不以安装 Unity/Unreal 为前提。

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

因此不新增多 Agent 展柜、事件总线、区块链、UE/Unity 客户端或本地大模型作为 P0 依赖。若未来处理高度敏感材料，可在机构批准、设备预算和模型能力核验后评估本地/端侧 Provider，但它仍须遵守相同数据合同。

---

## 15. 版本控制、协作平台与统一环境

### 15.1 平台决策

**决定：GitHub 是唯一可写主仓。** AdventureX 的提交字段要求 GitHub 仓库链接，因此 Gitee、GitCode 或 CNB 不能替代本届主仓。仓库只能在开幕式结束、主办方正式宣布 Hacking 开始后创建。

| 平台 | 本项目定位 | 理由与边界 |
|---|---|---|
| GitHub | **Canonical / 唯一可写** | 满足赛事提交；使用 Organization/协作者、Issues/Project、PR、CODEOWNERS、Actions 和 `main` 保护 |
| Gitee | 可选单向只读备份 | 中国大陆访问备份；只允许 GitHub → Gitee 或由总集成人员在 Accepted Tag 后推送。禁止双向镜像，避免竞态、覆盖和丢提交 |
| CNB | 暂不采用 | PR、云原生开发和 `.cnb.yml` CI 能力完整，但会引入第二套 CI/任务状态；只有 GitHub 长时间不可用且团队已熟悉时才重新评估 |
| GitCode | 暂不采用 | 有保护分支、PR 和流水线，但对本届没有超过 GitHub 的必要价值，同样会形成第二事实源 |

GitHub Free 的公开仓库可用保护分支；免费私有仓的高级保护能力受限。默认建议在官方允许的前提下使用公开 Organization 仓库并严格排除密钥/个人数据；若团队决定先私有且没有相应方案，则由总集成人员人工执行同等 PR 门禁，并在提交前确认评委可访问。无论可见性如何，都不把 `.env`、课程敏感材料、真实学生数据或未授权资产提交到仓库。

**参考：** [GitHub Protected Branches](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches)、[GitHub Repository Roles](https://docs.github.com/en/organizations/managing-user-access-to-your-organizations-repositories/managing-repository-roles/repository-roles-for-an-organization)、[Gitee 仓库镜像说明](https://gitee.com/help/articles/4336)、[CNB 构建触发规则](https://docs.cnb.cool/zh/build/trigger-rule.html)、[GitCode 保护分支](https://docs.gitcode.com/docs/help/home/org_project/project_manage/branch_management/set_protected_branch/)。

### 15.2 分支与合并协议

- 不使用 GitFlow，不维护长期 `develop`；`main` 始终是唯一集成线和当前可演示版本。
- 全队产品 WIP 上限为 1；分支使用 `feat/p0-xx-short-name`、`fix/p0-xx-short-name`、`design/p0-xx-short-name`、`docs/short-name`，最长存活一个工作时段。
- Commit 使用 `type(scope): summary`，例如 `feat(p0-03): append teacher review event`；一个 commit 只表达一个可回退意图。
- PR 必须关联当前唯一主 Issue，附验收 ID、运行证据、测试命令、失败/回退、依赖与许可证变化；至少一名非作者批准。
- 只允许 squash merge；合并后删除分支。每个通过切片打 annotated Tag `p0-xx-accepted`，下一切片才从 Backlog 进入 Ready。
- 共享合同目录由四人共同审查；领域 Schema、OpenAPI/JSON Schema 和 migration 变更不得靠聊天口头同步。
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

# 大学2K26 / University2K26

> 大学2K26 不是给旧教务系统换皮，而是把大学四到八年的学习、选课、成长、校园生活与协作重构成 MyCareer 式大学生涯：学期是赛季、课程是阵容、每一次选择都有依据、每一次进步都能回放；教师进入 Coach Studio，学校进入 Front Office，但所有人仍在同一个原创游戏世界中。

正式展示名为 **大学2K26 / University2K26**。为避免破坏仓库、API 和既有脚本，GitHub 仓库名 `Jiaowu2K26`、Rust crate 与 `j2k26` 技术标识暂作为兼容 ID 保留，后续只通过版本化迁移调整。

## 我们的核心参赛优势

**赛前成熟，赛中弹性。** 赛前成熟的是问题研究、产品边界、接口合同、任务路由、环境脚本、质量门禁和回退方案，不是冒充本届成果的预制产品；进入 Hacking 后，团队可以按现场人数、能力和设备重新组合，并继续沿同一套合同与验收标准交付。

| 稳定内核 | 弹性部分 |
|---|---|
| F-001～F-014 的产品语义、隐私/IP 红线、版本化 API/Schema、统一 Design System、证据与验收规则 | 协作人数、一人多岗方式、任务分包、后端/前端/模型/数据库适配器、云端或本地执行路径、P1 是否裁剪 |

这意味着新队友不必先通读全部资料，也不必被旧分工锁住：通过环境自检和 AI 入场回执确认自己的角色、技术熟悉度与当前目标后，即可认领一个有明确 Done 的工作包。架构允许换实现，但不允许绕过共享合同、真实实验和人类审核。

## 新队友：5 分钟进入同一开发现场

Windows 同学从公开主仓开始：

```powershell
git clone https://github.com/TianBingzhuo/Jiaowu2K26.git jiaowu2k26
Set-Location .\jiaowu2k26
pwsh -NoProfile -ExecutionPolicy Bypass -File .\scripts\bootstrap.ps1 -WebOnly -SkipDocs
pwsh -NoProfile -ExecutionPolicy Bypass -File .\scripts\Start-University2K26.ps1 -FixtureOnly
```

浏览器会打开 `http://127.0.0.1:4173/`。这条路径开放完整脱敏 Demo，不需要 Rust、WSL、数据库服务、学校账号或模型密钥。后端开发者再运行完整 `bootstrap.ps1`、`verify.ps1` 和不带 `-FixtureOnly` 的启动器；仓库不会替同学关闭 Smart App Control。完整栈、macOS / Linux、配置项与故障排查见 [五分钟配置、运行与 AI 接手](docs/GETTING-STARTED.md)。

随后在**已经打开该仓库根目录**的 AI 会话中粘贴：

```text
请执行 University2K26 入场协议：先完整读取 AGENTS.md，再读取
PROJECT-MANIFEST.json 的 status、current_work 与 collaboration_contract。
先只读，不要认领、改文件、建分支、推送或发布。

在你说“已了解项目”之前，必须向我提交三项回执：
1. 你建议我的协作角色和当前唯一任务，并复述输入、交付物、Done 与禁止事项，请我确认；
2. 列出该任务实际涉及的技术栈，请我逐项选择“熟悉 / 可在辅助下完成 / 不熟悉”；不熟悉时给出结对、改派或替换该层技术的方案，不得擅自换栈；
3. 用自己的话复述任务目标、非目标和成功证据，并单列你的建议、风险与待确认问题，请我确认。

请以“理解状态：待本人确认”开头；只有我逐项确认后，才能改为“入场确认完成”。
```

AI 的回执至少应包含：

```text
理解状态：待本人确认
角色与任务：<role> / <task_id> / <为什么现在做>
交付与验收：<outputs> / <Done> / <不要做>
任务相关技术栈：<逐项列出，熟悉度等待本人填写>
目标复述：<目标、非目标、成功证据>
建议与风险：<可以为空，但不能藏在实施之后>
请本人确认或调整以上三项；确认不等于认领任务。
```

本人确认后，再明确回复 `我认领 <task_id>，角色是 <role>`。若有技术不熟悉，由队友与产品总集成人员选择**保留并结对、改派任务、或替换该层实现**；共享合同和已经验收的能力不能由 AI 静默改写。

## 项目状态
- 当前阶段：AdventureX 2026 `hacking` · GATE-1 基座仍待人接受；在 [`F-MODULE-DELIVERY-GATE`](engineering/F-MODULE-DELIVERY-GATE.md) 下按单模块顺序推进技术候选
- 首个 P0：智课工坊 / SmartCourse Studio
- 技术栈状态：Rust / Axum / Tokio + SQLite 的 P0-00 本地证据及 GitHub Actions Ubuntu/Windows/合同文档门禁已通过，仍等待第二台机器复现与产品总集成人员接受决定；OceanBase 仍是未验证的可选适配器
- 实现状态：已通过的 Option 1 首页美术已晋升为 `app/apps/web` 中的 University2K26 V0.9 正式 Web/PWA 外壳；严格 TypeScript、Vite 6.4.3 构建、统一 Motion Tokens 与显式 Fixture 降级已就绪。首页现提供学生、教师、辅导员 / 学业导师、专业负责人 / 系主任、本科生院 / 教务处五种 Demo Role Lens，共用同一游戏世界、输入合同和责任链。F-001～F-009 的学习、生涯、数据镜像、排课、赛事、能力、球探、校园生活与机会纵向切片，以及 F-010 Campus Pass 的 Wallet→Reader→Access Queue→Safety Desk→Replay 脱敏切片均通过本地技术验证；状态均为 `technical_review`，未获人类接受的模块不得称为完成
- 公开主仓：[TianBingzhuo/Jiaowu2K26](https://github.com/TianBingzhuo/Jiaowu2K26)；GitHub Issue / PR 是开仓后的实时工作源
- 当前代码证据：76 项 Rust 工作区测试、35 份 JSON Schema、10 份 Golden Fixture、OpenAPI/Manifest 合同检查通过；F-001～F-010、五角色 Experience Shell、四个机构工作台、来源约束 AI/规则回退、完整 SLS 课程蓝图、AdventureX 机会彩蛋和 `conda_style_v1` 目录验证门通过严格 TypeScript、152 项 Vitest 与 Vite Production Build。当前 Edge / Chromium 已复测学生与四个机构工作台、角色切换、浏览器返回、规则回退、SLS 课程蓝图、AdventureX 检索/授权门、排课验证门、390×844 移动端和英文角色导览；Moonshot/GX10 实时模型、真实 UArizona/HEBUT 目录、生产 SSO/授权、全量双语和 Firefox/Safari 均不在已完成证据中
- Demo 课程：信号与线性系统为首页主赛程，光学、电子电路、高等数学、学术英语、工程训练构成课程阵容；仅使用本地已审核 README/索引中的名称、主题与证据边界，分析路径、身份、进度、等级和建议均明确标记为 Fixture，详见 [Demo 课程来源与脱敏边界](reference/DEMO-COURSE-PROVENANCE.md)
- 全部学科发现池：桌面“学科”中的 43 个快捷方式已只读映射为 40 个唯一来源目录，10 个已有根 README；它们是待复核候选，不是选课记录或已完成分析，详见 [本地学科发现池快照](reference/COURSE-CATALOG-SNAPSHOT.md)
- 稳定 ID：F-001～F-014 各功能表中已经发布的编号与含义不得重新编号或复用
- 路线图：F-010～F-014 已纳入产品范围并合并维护于 University OS 扩展包；F-010 为当前 `technical_review` 候选，F-011～F-014 仍未排期、可裁剪
- 功能覆盖审计：[`F-001～F-014 / 214 个稳定切片对账`](engineering/FUNCTIONAL-COVERAGE-AUDIT-2026-07-24.md) 区分规格、Role Lens 预览、Fixture 技术候选、真实集成和人类接受；不得用入口数量替代完成证据
- 视觉硬约束：学生 / 教师 / 学校三端共用一套游戏化 Design System，任何模块不得独立换肤
- 输入硬约束：产品是 multi-input native，手柄只是突出展示路径；键盘、鼠标、触控、读屏与高风险确认拥有信息等价、可独立完成且不可被削弱的路径
- 动效硬约束：游戏感来自 `输入确认 → 因果变化 → Replay → Next Move`，不是特效数量；详细状态机、性能、声音/触觉和 Reduced Motion 以 [`MOTION-SYSTEM`](engineering/MOTION-SYSTEM.md) 为准
- AI 运行时：Rust API 已实现 provider-neutral OpenAI-compatible adapter、Moonshot/Kimi K3 服务端 BYOK、GX10 loopback 通路、严格 `source_ids`、结构化输出校验和明确规则回退；未提供密钥时完整 Demo 仍可用，实时模型输出仍待本人用已轮换的本机密钥验证
- 本地 AI 候选：ASUS Ascent GX10 作为单校 Sovereign Node 进入条件 Spike；首选本地主模型是 Qwen3.6-35B-A3B-NVFP4，当前仍没有实机模型证据，失败必须回到规则/Fixture
- GX10 交接：另一位 AI 必须按 [V0.9 部署交接](engineering/GX10-V09-DEPLOYMENT-HANDOFF.md) 和仓库中的 `deploy/gx10/` 先做只读 inventory，再验证 ARM64 应用镜像、独立模型服务、来源约束与停服回退；在 GX10 回执通过前只能写“adapter/部署骨架已实现，实机未验证”
- 自动化与模型边界：`/api/v1/ai/status` 与 `/api/v1/ai/advice` 已进入共享合同；未来 `j2k26` CLI 仍只消费同一 `/api/v1`/Schema/权限/Replay 合同。密钥仅留服务端进程环境，高风险动作不能由通用 `--yes` 或 AI 自我确认
- 实验外设：课堂手柄回答、RealSense、NFC/智能卡和 56K 调制解调器均在非 P0 实验池；任何真实校园卡、银行卡、相机识别或电话线路都不进入 Demo
- 本地案例与游戏机制审计：2026-07-22 已将其他项目、NBA 2K 与 maimai 的可迁移经验归并为 `EXP-CASE-01`～`EXP-CASE-11`；94 条 NBA 2K/系列机制与 45 条 maimai 机制均有产品去向，但实现与真实用户验证仍为 0；不新增顶层 F 编号、不扩张 P0
- 一句话派单：根目录 [`AGENTS.md`](AGENTS.md) 已接入 `PROJECT-MANIFEST.json.current_work`；当前只派发 GATE-1 / `P0-00` 内的弹性工作包
- 视觉方向稿：[`jiaowu2k26-career-mode-concept-v1.png`](reference/assets/jiaowu2k26-career-mode-concept-v1.png) 是游戏启动屏式主视觉；[`jiaowu2k26-a4-software-universe-map-v1.png`](reference/assets/jiaowu2k26-a4-software-universe-map-v1.png) 是 A4 软件功能全景第一页；[`jiaowu2k26-a4-explainer-role-map-v1.png`](reference/assets/jiaowu2k26-a4-explainer-role-map-v1.png) 是 A4 岗位速配第二页。三者仅作赛前招募与原创游戏世界方向验证，不是产品截图或本届实现成果

## 一句话获得当前任务

队友或新 AI 在**项目根目录**打开会话后，只需问：

> 我现在能干什么？

AI 必须先按 [`AGENTS.md`](AGENTS.md) 读取 Manifest 的实时阶段与任务队列，只返回一个当前可做任务及输入、输出、Done 和禁止事项，并完成上面的三项入场回执。询问、回执和确认本身都是只读的；需要认领时再回复：

> 我认领 P0-00-x，角色是 frontend / backend / ai_pipeline / product_integrator / design / human_factors_research

当前采用弹性能力池：队友按特长认领工作包，不把岗位固定为人数；尚未登记的成员仍按匿名角色获得通用任务，不秘密猜测身份。无人认领且 `ai_allowed=true` 的部分由 Codex 起草或受控实现，产品总集成人员逐项审核。

## 弹性团队分工
| 能力岗 | 36 小时内主责 | 可合并方式 |
|------|--------------|----------|
| 产品 / 总集成 | P0 范围、用户测试、停损、跨模块验收与 Claim Ledger | 可兼视觉与宣发 |
| 前端 / 交互 | 赛季入口、教师审核、学生互动、Replay 与可访问性 | 可兼设计系统落地 |
| 后端 / 证据链 | API、状态机、来源、发布门禁、审计与数据库适配 | 可兼部署与测试 |
| AI Pipeline / 评测 | 材料解析、来源约束生成、Schema 校验、模型回退与质量评测 | 可与后端合并 |
| 人因研究 / 体验安全 | 文化语义、理解、压力、公平、隐私、社群与可访问性研究；逐切片给出证据与停损建议 | Codex 负责可查证研究与材料草案，产品总集成人员审核；真实用户证据不能由 AI 替代 |
| 视觉 / 宣发 | 统一游戏世界、组件视觉、招募、海报、90 秒 Demo 与路演 | 可与前端或人因兼岗 |

> 这是能力分工，不等于人数表。团队仍按赛事要求组织；一人可以兼岗，任何空缺可由 Codex 补草案或受控实现，但每项交付仍必须有人类责任人理解、实验和批准。

## 弹性协作原则

- 只把 **GitHub** 作为唯一可写主仓；它同时是 AdventureX 提交要求中的仓库入口。Gitee 只可由总集成人员配置为单向备份，GitCode / CNB 不与主仓双写。
- 全队同时只推进 **一个产品切片**，但可在该切片内并行拆成产品验收、前端、后端、AI/Fixture 四张子任务；本切片通过验收并打 `p0-xx-accepted` Tag 后，下一切片才进入 Ready。
- 本机持续实现与逐模块技术验收遵循 [`F 模块逐项交付门禁`](engineering/F-MODULE-DELIVERY-GATE.md)；Codex 可推进到 `technical_review`，最终接受、合并与完成声明仍由产品总集成人员决定。
- `main` 必须始终可演示；短分支必须先完成对应实验，再经 Draft PR、三项必需自动检查、Codex 中心化技术审查和产品总集成人员接受决定后 squash 合并，禁止直接推送、强推和长期 `develop` 分支。队友到位后可自愿增加 Reviewer，但不再以不存在的非作者审批形成死锁。
- “实时验证”由每次 Push 的 PR CI、Codex/总集成人员隔离 Checkout 和每个 Accepted 切片的双机冷启动完成；不把未审核分支持续拉进主线或最终 Demo 目录。
- 开幕式结束且主办方正式宣布 Hacking 开始前，不创建仓库、不提交参赛代码。详细平台与环境协议见 [TECH-STACK](engineering/TECH-STACK.md#15-版本控制协作平台与统一环境)，切片顺序见 [MODULE-MAP](product/MODULE-MAP.md#四人单功能-wip-协议)，开仓检查见 [GATE-1](gates/GATE-1-技术验证-6h.md#阶段-0-1h规则空白基线与协作底座)。

## 本地文档中心与仓库门面

给同学阅读时，不需要在 50 多份活动文档之间来回翻：运行

```powershell
pwsh -NoProfile -ExecutionPolicy Bypass -File .\tools\Docs.ps1 -Action Setup
```

它会安装锁定依赖、生成离线全文搜索、构建本地站点，并在桌面创建 **大学2K26 文档中心** 快捷方式。以后双击即可在安全条件满足时 `git pull --ff-only`，随后重新构建并打开 `http://127.0.0.1:4321/`；有本地改动、无远端或尚未建仓时会跳过拉取，不覆盖任何内容。

- [五分钟配置与 AI 接手](docs/GETTING-STARTED.md)
- [项目结构与角色导航](docs/PROJECT-STRUCTURE.md)
- [贡献协议](CONTRIBUTING.md)
- [安全与负责任披露](SECURITY.md)
- [项目级变更记录](CHANGELOG.md)

文档站只是规范源的只读浏览层，不是第二套事实源，也不是 University2K26 产品原型。正式产品工作区为 `app/`；当前有待 PR 验收的 Phase 0 合同、Rust/SQLite/API 技术切片与 V0.9 体验壳，均需经产品总集成人员接受后才能计入正式版本。

## 文档导航

### 八个权威入口

`AGENTS.md` 是**零号任务路由器**，只负责告诉人“现在读什么、能做什么”，不是第九份产品事实源。需要理解全貌时，新队友和新 AI 再按以下顺序阅读八个权威入口；其余文件按需展开：

1. 本 `README.md`
2. [VISION](product/VISION.md)
3. [MODULE-MAP](product/MODULE-MAP.md)
4. [BOUNDARIES](product/BOUNDARIES.md)
5. [ARCHITECTURE](engineering/ARCHITECTURE.md)
6. [TECH-STACK](engineering/TECH-STACK.md)
7. [RESEARCH](reference/RESEARCH.md)
8. [PROJECT-MANIFEST.json](PROJECT-MANIFEST.json)

### 🧠 brainstorm/ — 头脑风暴
| 文件 | 内容 |
|------|------|
| [00-问题与洞察](brainstorm/00-问题与洞察.md) | 用户画像、痛点故事、核心洞察、市场数据 |
| [01-核心体验](brainstorm/01-核心体验.md) | 体验承诺、设计原则、2K语法转译（26条完整对标） |
| [02-竞品与定位](brainstorm/02-竞品与定位.md) | 竞品矩阵、差异化定位、数据飞轮 |
| [03-游戏机制全量对标](brainstorm/03-2K全功能对标与实现构思.md) | NBA 2K25 + 历代校正 + maimai DX 逐项采用/改造/延后/拒绝矩阵及 F-001～F-014 映射 |

### 📦 product/ — 产品定义
| 文件 | 内容 |
|------|------|
| [VISION](product/VISION.md) | 愿景、MVP范围、成功标准 |
| [MODULE-MAP](product/MODULE-MAP.md) | 模块总览、依赖图、裁剪指南、分工矩阵 |
| [HUMAN-FACTORS](product/HUMAN-FACTORS.md) | 人因研究章程、139 条机制覆盖状态、产品负责人双轮试玩、Scouting Room、Degree Fahrenheit 协议与可认领工作包 |
| [BOUNDARIES](product/BOUNDARIES.md) | 合规红线、IP边界、不做清单 |

### 🔧 modules/ — 功能模块
每个模块包含 PROMPT.md（AI协作）、SPEC.md（规格）、STATUS.md（状态）

| 模块 | 优先级 | 使命 |
|------|--------|------|
| [00-smartcourse](modules/00-smartcourse/) | P0 | 智课工坊：来源→AI草稿→教师审核→发布→学生互动 |
| [01-mycareer-shell](modules/01-mycareer-shell/) | P0轻 | 赛季中心：轻量导航上下文 |
| [04-world-exam](modules/04-world-exam/) | P1首选 | World Exam Finals |
| [03-roster-lab](modules/03-roster-lab/) | P1候选 | Conda式排课求解 |
| [05-opportunity-market](modules/05-opportunity-market/) | P1候选 | 透明机会匹配 |
| [02-academic-mirror](modules/02-academic-mirror/) | P1候选 | 学术数据镜像 |
| [06-performance-center](modules/06-performance-center/) | P2 | 进度与能力中心 |
| [07-coach-scouting](modules/07-coach-scouting/) | P2 | 教练与球探 |
| [08-campus-life](modules/08-campus-life/) | Vision | 校园生活枢纽 |
| [09-university-os](modules/09-university-os/) | P2 / Vision | F-010～F-014：Campus Pass、General Balance、Dining、Faculty Success、Front Office |

### 🚦 gates/ — 质量门禁
| 文件 | 内容 |
|------|------|
| [GATE-0 赛前准备](gates/GATE-0-赛前准备.md) | 赛前检查清单 |
| [GATE-1 技术验证](gates/GATE-1-技术验证-6h.md) | 6小时技术门禁 |
| [GATE-2 P0稳定](gates/GATE-2-P0稳定-36h.md) | 36小时停损线 |
| [GATE-3 冻结提交](gates/GATE-3-冻结提交-60h.md) | 60小时冻结与提交 |
| [QUALITY](gates/QUALITY.md) | 通用质检标准 |

### ⚙️ engineering/ — 工程决策
| 文件 | 内容 |
|------|------|
| [ARCHITECTURE](engineering/ARCHITECTURE.md) | 目标架构、模块边界 |
| [TECH-STACK](engineering/TECH-STACK.md) | 技术选型决策树 |
| [DESIGN-SYSTEM](engineering/DESIGN-SYSTEM.md) | 视觉设计规范（2K风格色板/字体/组件/动效） |
| [GX10 V0.9 部署交接](engineering/GX10-V09-DEPLOYMENT-HANDOFF.md) | 设备 AI 只读盘点、ARM64 构建、产品链路、独立模型 Spike、HTTPS 与回滚 |
| GX10 可复现部署包（`deploy/gx10/README.md`） | Web/API 容器、loopback 网络、安全基线、模型回执与停服验证 |
| [MOTION-SYSTEM](engineering/MOTION-SYSTEM.md) | AAA 游戏感的因果反馈、动效状态机、性能/可访问性与手动验收 |
| [LOCALIZATION-AND-TONE](engineering/LOCALIZATION-AND-TONE.md) | 中英赛事导览、游戏梗转译、内驱友善文案与未来俄语工程闸门 |
| [LOCAL-AI-SOVEREIGN-NODE](engineering/LOCAL-AI-SOVEREIGN-NODE.md) | GX10 设备边界、大小模型路由、候选对比、主权数据、实机 Spike 与设备 AI receipt 交接 |
| [排课求解与目录导入门](engineering/ROSTER-SOLVER-AND-CATALOG-IMPORT.md) | Conda 式约束语义、UArizona/HEBUT 最小目录范围、验证回执与真实求解器升级门 |
| [DEMO-PATH](engineering/DEMO-PATH.md) | Demo脚本与Pitch结构 |
| [GITHUB-COLLAB](engineering/GITHUB-COLLAB.md) | 面向非技术/设计同学的 Clone、短分支、Commit、Push、PR、同步与冲突处理图形化说明 |

### 📚 reference/ — 参考资料
| 文件 | 内容 |
|------|------|
| [RESEARCH](reference/RESEARCH.md) | 赛事规则、SIS/URP研究 |
| [SPONSORS](reference/SPONSORS.md) | 赞助资源速查 |
| [PITCH-COPY](reference/PITCH-COPY.md) | 对外话术与组队文案 |
| [ENVIRONMENT](reference/ENVIRONMENT.md) | 本机环境、路径规则 |
| [招募与海报 Brief](reference/PITCH-COPY.md) | 功能点×共创位置速配、报名回复模板、游戏启动屏式 Prompt、黑色招募话术、概念图登记与 IP 红线；“功能点 × 共创位置速配清单”位于文件第 147 行；历史完整美术白名单当前缺失，见 ENVIRONMENT |

## 合规红线
- 开幕式结束且主办方明确宣布 Hacking 开始前不创建代码仓、不构建原型；不能把 07-22 19:00 的开幕式开始时间误当成开工许可
- 团队2-4人，每人只能一队
- AI不能完成全部代码，队员必须能解释自己负责的实现
- 技术栈是待审核提案，不是既定事实
- 不复制NBA/2K商标或受保护资产

## AI 交接协议
新 AI 或新队友先读 `AGENTS.md → PROJECT-MANIFEST.json.current_work`；取得当前任务后只读该任务的 `required_reads`，需要全貌时才读“八个权威入口”。确认模块后按 `PROMPT.md → SPEC.md → STATUS.md` 展开；任何界面工作还必须读 `engineering/DESIGN-SYSTEM.md`，不得自行发明模块风格。成熟结论按“主题文档 → Manifest/模块 STATUS → README 状态”顺序更新；旧结论进入日期归档并记录哈希，不在多个主文件形成竞争事实源。每台机器统一使用自己的 Git 克隆根目录；维护者工作站使用稳定逻辑入口 `D:\10451\Desktop\黑客松`，但不得和它的物理别名混用。

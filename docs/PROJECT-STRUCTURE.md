# 项目结构与角色导航

这份地图回答三个问题：文件应该放哪里、不同角色从哪里开始、AI 怎样避免把生成副本或旧档案当成事实源。

## 一眼看懂仓库

```text
jiaowu2K26/
├─ README.md                 项目门面、状态与八个权威入口
├─ AGENTS.md                 “我现在能干什么？”任务路由器
├─ PROJECT-MANIFEST.json     阶段、任务、负责人和机器可读状态
├─ CONTRIBUTING.md           贡献、分支、PR 与 Done 约定
├─ SECURITY.md               数据红线与私下漏洞披露
├─ CHANGELOG.md              影响接手方式的项目级变更
│
├─ product/                  愿景、范围、人因与产品边界
├─ modules/                  F-001～F-014 模块包：SPEC / STATUS / PROMPT
├─ engineering/              架构、技术栈、设计系统与协作合同
├─ gates/                    赛前、6h、36h、60h 与通用质量门禁
├─ reference/                赛事、赞助、证据、环境、话术与登记资产
├─ brainstorm/               尚待批准的洞察和机制映射
├─ archive/                  只读历史材料；不参与当前派单与搜索
│
├─ app/                      正式产品工作区；当前仅有阶段边界说明
├─ docs/                     新同学、AI 与本地工具的使用说明
├─ docs-site/                Starlight 浏览器文档中心
└─ tools/                    可审计的本地配置、更新与诊断脚本
```

这是一套仓库，不是三个项目：根目录和业务目录是**规范源**；`docs-site` 是阅读应用；`app` 才是阶段允许后开始的正式产品实现。

## 八个权威入口与专题展开

需要全貌时按 Manifest 的 `canonical_read_order` 阅读：

1. `README.md`
2. `product/VISION.md`
3. `product/MODULE-MAP.md`
4. `product/BOUNDARIES.md`
5. `engineering/ARCHITECTURE.md`
6. `engineering/TECH-STACK.md`
7. `reference/RESEARCH.md`
8. `PROJECT-MANIFEST.json`

`product/HUMAN-FACTORS.md`、各模块三件套、设计系统、质量门禁和赞助清单都是重要专题，但只在对应任务需要时展开，避免每位接手者都被迫通读全部资料。

## 不同角色最快入口

| 角色 | 先看 | 接着看 | 典型产出 |
|---|---|---|---|
| 新队友 / 新 AI | `AGENTS.md`、Manifest 当前状态 | 当前任务 `required_reads` | 一个合法、可验收的当前任务 |
| 产品 / 总集成 | VISION、MODULE-MAP、BOUNDARIES | Gates、模块 STATUS | 范围、验收、停损和合并判断 |
| 前端 / 交互 | DESIGN-SYSTEM、当前 SPEC | 架构中的客户端合同 | 页面状态、可访问性交互和证据回放 |
| 后端 / 数据 | ARCHITECTURE、TECH-STACK | Academic Mirror / 当前 SPEC | API、状态机、来源、审计和回退 |
| AI Pipeline | F-001 SPEC、QUALITY | 模型与 Fixture 合同 | 来源约束生成、Schema 校验和评测 |
| 人因研究 | HUMAN-FACTORS | 当前机制与模块验收 | 盲读、访谈、风险结论和停损建议 |
| 视觉 / 宣发 | DESIGN-SYSTEM、BOUNDARIES | PITCH-COPY、登记资产 | 同一游戏世界内的组件与传播物料 |
| 赛事 / 资源 | RESEARCH、SPONSORS | ENVIRONMENT、对应 Gate | 动态核验、资源适配和证据登记 |

## 本地文档中心是什么

`docs-site/scripts/sync-content.mjs` 会在启动或构建前读取规范源，并生成 `docs-site/src/content/docs/`。生成目录：

- 只用于浏览、导航和全文搜索；
- 不提交 Git，不接受人工编辑；
- 保留与规范源一致的相对路径，便于人和 AI 互相指路；
- 归档页仍可追溯，但默认不出现在搜索和主导航中；
- Manifest 额外生成一份人类可读状态页，原始 JSON 仍是机器事实源。

Windows 首次配置、一键打开与安全拉取见 [`GETTING-STARTED.md`](GETTING-STARTED.md)。

## 新增文件的判断顺序

新增文件前依次问：

1. 能否补入现有主题文档而不降低可读性？可以就不要新建。
2. 是否属于某个稳定 F 模块？属于就写入对应 SPEC / STATUS / PROMPT。
3. 是否是跨模块合同？放 `engineering/` 或 `gates/`。
4. 是否是有来源的外部事实？放 `reference/` 并登记时间与证据。
5. 是否只是未批准的想法？放 `brainstorm/`，成熟后迁移并留下变更记录。
6. 是否已经失效？进入日期化 `archive/`，不与当前事实源并列。

不要新增另一个 `docs-v2/`、`final-final/`、个人真相表或第二份模块清单。新增顶层目录、稳定 F 编号、数据 Schema 或正式产品技术栈都需要总集成人员与对应 Gate 批准。

## 仍刻意保留的“非典型开源”内容

- 队员角色与人因工作包：它们直接决定谁能安全完成什么，不是杂项。
- 赛事规则和赞助来源：它们决定能否开工、提交和使用资源，必须可复核。
- 竞品与游戏机制研究：只保留可迁移判断与 IP 红线，不作为可复用资产库。
- 本机 junction 与外部参考库规则：它们防止重复扫描、错误写盘和来源混淆。

目标不是模仿某个开源模板的文件数量，而是让任何同学在五分钟内知道：项目是什么、真相在哪里、自己能做什么、怎样证明做完了。

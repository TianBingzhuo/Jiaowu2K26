# 为大学2K26 / University2K26 做贡献

感谢你来一起做这件事。本项目把产品研究、功能规格、赛事交付与未来实现放在同一个可追溯体系中；贡献的第一原则不是“多做一点”，而是让每次改变都能被另一位同学或 AI 找到、解释、验证和回退。

## 1. 先判断当前能不能做

1. 从根目录读取 [`AGENTS.md`](AGENTS.md)。
2. 查看 [`PROJECT-MANIFEST.json`](PROJECT-MANIFEST.json) 的 `status` 与 `current_work`。
3. 问“我现在能干什么？”，让 AI 按 README 的入场协议提交角色与任务、技术熟悉度、目标与建议三项回执。
4. 本人确认或调整三项回执；技术不熟悉时，由队友与总集成人员决定结对、改派或替换该层实现，AI 不得静默换栈。
5. 只有明确认领任务后才改变 owner；作者只能提交 `review`，不能自行宣布 `accepted`。

赛事阶段门禁高于本文。当前为 `hacking / GATE-1 / P0-00`，只允许处理当前 Issue 中 `allowed_now=true` 的工作包；不得因为看见十四个模块或长期愿景就提前展开下一切片。

## 2. 找到自己的入口

| 你想贡献什么 | 先读 | 主要落点 |
|---|---|---|
| 产品范围、验收、集成 | `product/VISION.md`、`product/MODULE-MAP.md` | `product/`、对应 `modules/*/SPEC.md` |
| 前端、交互、游戏化体验 | `engineering/DESIGN-SYSTEM.md`、当前模块 SPEC | `app/`；当前 Gate 只做最小体验壳和合同握手 |
| 后端、数据、证据链 | `engineering/ARCHITECTURE.md`、`engineering/TECH-STACK.md` | `app/`；当前 Gate 先做无框架领域层、公开合同与可替换适配器 |
| AI Pipeline 与评测 | F-001 SPEC、质量门禁 | 模块 SPEC、Fixture/评测合同；代码须等阶段允许 |
| 人因、文化与可访问性 | `product/HUMAN-FACTORS.md` | 人因任务卡与对应模块验收，不另建孤立研究树 |
| 视觉、宣发与资产 | `engineering/DESIGN-SYSTEM.md`、`product/BOUNDARIES.md` | `reference/` 中的说明与已登记资产；产品资产须登记许可证 |
| 赛事规则、赞助与外部证据 | `reference/RESEARCH.md` | `reference/`，并注明来源、抓取时间和动态复核条件 |

完整目录地图见 [`docs/PROJECT-STRUCTURE.md`](docs/PROJECT-STRUCTURE.md)。

## 3. 修改哪一份文件

- 产品“是什么、为什么”：`product/`。
- 某功能“必须怎样工作”：`modules/<module>/SPEC.md`。
- 某功能“现在做到哪里”：`modules/<module>/STATUS.md`。
- 给接手 AI 的模块约束：`modules/<module>/PROMPT.md`。
- 跨模块技术与体验合同：`engineering/`。
- 可验收的阶段条件：`gates/`。
- 外部事实、来源与环境：`reference/`。
- 尚未批准的发散思考：`brainstorm/`。
- 当前阶段、任务与负责人：`PROJECT-MANIFEST.json`。

不要直接编辑 `docs-site/src/content/docs/`：它是本地文档门户每次构建生成的只读投影。旧内容只进入 `archive/`，不重新成为当前事实源。

## 4. Git 与 Pull Request

唯一可写主线为公开 GitHub 仓库 [TianBingzhuo/Jiaowu2K26](https://github.com/TianBingzhuo/Jiaowu2K26)：

1. 从最新 `main` 建一个短分支：`docs/*`、`design/*`、`feat/*` 或 `fix/*`。
2. 一次 PR 只服务一个任务或验收 ID；相关规格、状态与证据一起更新。
3. 提交前逐文件查看 diff，不提交秘密、真实学生数据、缓存、构建产物或来源不明资产。
4. Push 后先创建 Draft PR，跑完任务卡指定的实际实验并附证据；三项必需 CI 通过后，由 Codex 生成中心化技术审查报告，产品总集成人员决定接受并 squash 合并。队友 Reviewer 是可选增强，不是当前合并硬依赖。
5. `main` 始终保持可阅读、可验证；Accepted 切片才允许进入下一切片。

不会 Git 的同学按 [`engineering/GITHUB-COLLAB.md`](engineering/GITHUB-COLLAB.md) 的 VS Code 或 GitHub Desktop 图形化路径操作。脚本的自动更新只使用 `git pull --ff-only`；有未提交修改时会安全跳过。

## 5. 本地验证

文档改动至少运行：

```powershell
pwsh -NoProfile -ExecutionPolicy Bypass -File .\tools\Docs.ps1 -Action Doctor
Set-Location .\docs-site
npm run verify
```

产品代码开始后，模块还必须通过当前 Gate 与任务卡写明的 format、lint、typecheck、测试、构建、隐私和资产检查；不能用“本机能跑”替代验收证据。

## 6. Done 的最低标准

- 改动有任务或验收 ID，边界没有暗中扩张。
- 稳定 F 编号的含义没有重排或复用。
- 结论、来源、状态与 Manifest 互相一致。
- 新资产有来源、许可证、用途和禁用范围。
- 不含秘密、真实学生数据和受保护游戏素材。
- 另一位同学能按说明从干净环境复现验证。
- 未实现内容仍明确标为提案、规格或待验证，不冒充产品成果。

安全问题不要公开贴到 Issue；按 [`SECURITY.md`](SECURITY.md) 私下报告。

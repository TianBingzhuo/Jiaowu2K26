# 2026-07-21 主线合并前文档归档

> 本目录保存本轮合并时被主线取代的 Markdown/JSON 与原目录结构。它们用于追溯、核对和恢复细节，不再是当前事实源。

## 当前主线

| 归档主题 | 当前入口 |
|---|---|
| 项目总览、功能组合、SmartCourse、Opportunity Market | `../../../docs/PRODUCT.md` |
| 技术栈、核心架构、WinUI、开源与求解器 | `../../../docs/ENGINEERING.md` |
| AdventureX、SIS/URP/UArizona、NBA 2K、赞助与 D-Robotics | `../../../docs/RESEARCH.md` |
| QUICKSTART、BUILD、COMPLIANCE、TEAMING、Pitch、Submission、Data | `../../../docs/PLAYBOOK.md` |
| 技术与赞助机器目录 | `../../../docs/CATALOG.json` |
| 项目机器状态 | `../../../docs/PROJECT-MANIFEST.json` |
| 新 AI / 新队友接手 | `../../../docs/AI-HANDOFF.md` |

## 原目录去向

| 原路径 | 归档路径 | 当前承接 |
|---|---|---|
| `QUICKSTART.md` | `QUICKSTART.md` | PLAYBOOK |
| `data/` | `data/` | PLAYBOOK 的数据/证据章节 |
| `design/` | `design/` | PRODUCT + RESEARCH |
| `pitch/` | `pitch/` | PLAYBOOK |
| `submission/` | `submission/` | PLAYBOOK |
| `docs/PROJECT.md` | `docs/PROJECT.md` | PRODUCT |
| `docs/features/` | `docs/features/` | PRODUCT |
| `docs/research/` | `docs/research/` | RESEARCH |
| `docs/TECH-STACK.md`、`docs/tech-stacks/` | 原相对路径 | ENGINEERING + RESEARCH + CATALOG |
| `docs/ADVENTUREX-2026-GUIDE.md`、`BUILD.md`、`COMPLIANCE.md` | 原相对路径 | PLAYBOOK |
| `docs/DECISIONS.md` | 原相对路径 | PLAYBOOK 决策日志 |
| `docs/TEAM*.md` | 原相对路径 | PLAYBOOK；私人候选细节只留归档 |
| `docs/advx26_team_forming_v3.md` | 原相对路径 | 原始来源，仅归档 |
| `docs/OVERHAUL.md` | 原相对路径 | 本页和根 README |

## 完整性说明

- 上述移动文件保持原字节内容；`MANIFEST.json` 记录逐文件路径、字节数和 SHA-256；
- 更早的 `archive/original-materials/`、`archive/legacy-prototypes/` 等目录没有移动或重写；
- 根 `README.md`、`docs/AI-HANDOFF.md` 和 `docs/PROJECT-MANIFEST.json` 是本轮保留路径的入口文件，已在原位更新为新架构；它们的旧信息已合并进新主文档，但本目录不声称保存这三份入口更新前的逐字节副本；
- 若主线摘要与某份旧文件冲突，以官方最新规则和当前 8 个主入口为准；旧文件只说明当时的判断。

## 隐私与对外使用

`TEAMING.md`、`TEAMING-DM-PLAYBOOK.md` 和原组队来源包含个人姓名、帖子判断或私聊建议，仅供用户内部参考，不进入公开仓库、路演或数据集。

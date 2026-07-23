# 变更记录

本文件记录影响接手、事实源或协作方式的项目级变化。它不是产品发布记录；具体模块进度仍以 `modules/*/STATUS.md` 和 `PROJECT-MANIFEST.json.current_work` 为准。

## Unreleased

### Added

- AdventureX 正式开工后的公开 GitHub 主仓、单一 P0-00 Issue 与弹性能力池协作模型。
- 本地 Starlight 文档中心、离线全文搜索和只读内容投影。
- Windows 一键配置、健康检查、安全 Git 更新、本地服务器与桌面快捷方式。
- 新同学 / AI 的五分钟接手说明、目录地图、贡献协议与安全披露规则。
- `app/` Phase 0 Rust workspace：无框架领域层、repository port、SQLx/SQLite adapter、Axum `/api/v1`、OpenAPI/JSON Schema 与 Golden Fixture。
- 8 项 Rust 测试、实时 `health → review → approve → publish → replay` smoke path，以及 Windows/Ubuntu GitHub Actions 门禁。
- Smart App Control 感知的 Rust 验证入口：保持 Windows 防护开启，在 enforcement 状态自动选择 Ubuntu WSL2。
- Career Control Room 首页、原创橙青赛季 HUD 与任务 / 角色 / 功能阵容快速入口。
- Junction 感知构建与核心 CSS / Pagefind 构建后守卫，防止“构建成功但页面裸奔”。
- AI 三项入场回执：协作角色与任务、本人自报的任务相关技术熟悉度、任务目标/非目标/成功证据与建议风险。
- X-16 Controller-first 多输入合同：语义动作、确定性焦点、动态键帽、校准/重映射、断连回退、输入等价与高风险二次确认。
- 面向 Figma / Photoshop / Illustrator / Revit / 3D 空间设计能力的交付边界：P0 先做统一 UI 与原创 Campus Arena 预渲染资产，运行时 3D 另过性能和权利 Gate。
- `D:/10451/Pictures/bili` 私人图库完成只读联系表审计：仅作私人情绪板，不作为队员能力证据或可复用产品资产。
- Linux live smoke 将冷编译与服务就绪计时分离，并为进程早退、超时和跨平台可执行文件路径提供明确诊断。

### Changed

- 项目阶段由赛前规格切换为 `hacking / GATE-1 / P0-00`；产品功能仍未完成。
- 人因研究改为 Codex 负责可查证草案、产品总集成人员逐项审核；AI 不替代真实用户证据。
- 保留现有八个权威事实入口，以浏览层组织全部模块、研究、门禁与归档，不复制第二套产品事实。
- `docs/` 从历史兼容占位调整为协作工具说明区；产品事实仍归属 `product/`、`modules/`、`engineering/`、`gates/` 与 `reference/`。
- 文档运行时升级到 Astro 7.1.3、Starlight 0.41.4、Sharp 0.35.3；依赖审计为 0，150 个内容页与 203 条本地链接通过。
- 将“赛前成熟、赛中弹性”明确为协作与架构优势；技术不熟悉时固定比较结对、改派或替换该层实现，禁止 AI 静默换栈。
- 修正 Windows 新人环境说明：仓库本地 Node 由 bootstrap 校验安装，Rust 由 rustup 固定；Smart App Control 保持开启时可自动选择 Ubuntu WSL2。

### Project status

- Phase 0 本机技术证据已就绪，当前分支等待 CI、第二台机器和用户 PR 审核；产品功能仍为 `pending`。
- 本批变化建立协作与技术底座，不构成完整产品能力声明。

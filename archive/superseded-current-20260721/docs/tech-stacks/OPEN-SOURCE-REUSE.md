# 开源项目复用登记

> 状态：赛前技术调研，未安装、未引入依赖、未构建。
> 最后核对：2026-07-21。开赛后必须按实际锁定版本重新检查 LICENSE、NOTICE、传递依赖和已知安全问题。

本文回答三个问题：**能复用什么、以什么方式复用、什么情况下不能用。** 开源不等于无条件可用，也不等于 AdventureX 赞助资源。

## 复用类型

| 类型 | 含义 | 要求 |
|---|---|---|
| 直接依赖 | 正式进入现场代码与依赖锁 | 记录精确版本、来源、许可证、哈希与安全扫描 |
| 组件/示例参考 | 学习 API、交互或工程做法，必要时改写小片段 | 保留归属，核对示例中的第三方资产 |
| 思想借鉴 | 只复用抽象、语义、流程或问题分解 | 说明推导关系，不宣称使用了对方代码 |
| 不复用代码 | 已研究，但问题建模或现场成本不匹配 | 保留拒绝原因，避免其他 AI 重复引入 |

## 当前候选登记

| 开源项目 | 官方上游 | 上游声明的许可证 | jiaowu2K26 候选用途 | 复用方式 | 当前状态 |
|---|---|---|---|---|---|
| React | [facebook/react](https://github.com/facebook/react) | MIT | Web 客户端界面与状态组件 | 直接依赖候选 | P0 默认候选，待团队确认 |
| Vite | [vitejs/vite](https://github.com/vitejs/vite) | MIT | React Web 开发与构建工具 | 直接依赖候选 | P0 默认候选，待团队确认 |
| Rust | [rust-lang/rust](https://github.com/rust-lang/rust) | 主要为 MIT / Apache-2.0，部分内容为 BSD-like | 核心领域模型与 API | 工具链/语言候选 | 条件主选，必须过 6h 闸门 |
| Axum | [tokio-rs/axum](https://github.com/tokio-rs/axum) | MIT | Rust HTTP 路由、提取器和中间件接口 | 直接依赖候选 | 条件主选 |
| Tokio | [tokio-rs/tokio](https://github.com/tokio-rs/tokio) | MIT | Rust 异步运行时和 I/O | 直接依赖候选 | 条件主选 |
| SQLx | [launchbadge/sqlx](https://github.com/launchbadge/sqlx) | MIT OR Apache-2.0 | 通过 MySQL 协议候选访问 OceanBase，并支持 SQLite 回退 | 直接依赖候选 | 必须对 OceanBase 实测，不根据“MySQL 兼容”直接假定通过 |
| OceanBase Database | [oceanbase/oceanbase](https://github.com/oceanbase/oceanbase) | MulanPubL-2.0 | 审核事务、版本化学术镜像和课程关系数据 | 运行时/数据库候选 | 条件主选；账号、部署、版本和现场资源仍待确认 |
| Google OR-Tools | [google/or-tools](https://github.com/google/or-tools) | Apache-2.0 | 全校课程-教师-教室等约束排程候选 | 直接依赖候选 | P1/P2；不进入 SmartCourse P0 |
| Conda | [conda/conda](https://github.com/conda/conda) | BSD licensed（锁版本时核对具体 LICENSE） | `CourseSpec`、学期 prefix、pins、diff、transaction、`semester.lock` 的语义来源 | **思想借鉴** | 已接受设计思路；未选择直接复用代码 |
| libsolv | [openSUSE/libsolv](https://github.com/openSUSE/libsolv) | BSD-3-Clause | 理解 SAT 依赖求解、决策树和无解解释 | 研究参考 | **当前不直接复用**；软件包语义不能覆盖全校时间/资源排程 |
| WinUI 3 Gallery | [microsoft/WinUI-Gallery](https://github.com/microsoft/WinUI-Gallery) | MIT | Windows 客户端控件、自适应布局和可访问性参考 | 组件/示例参考 | Secondary；赛前只使用独立参考库，未复制到本项目 |
| Windows Community Toolkit | [CommunityToolkit/Windows](https://github.com/CommunityToolkit/Windows) | MIT | WinUI 3 控件、Helper 和 Gallery 交互参考 | 组件/示例参考 | Secondary；使用前按具体 package 复核依赖 |
| openSIS Community Edition | [OS4ED/openSIS-Classic](https://github.com/OS4ED/openSIS-Classic) | **待所选提交复核** | 学生、课程、排课、成绩与门户领域模型 | 思想/工作流参考 | 参考限定；不作为 P0 底座，不复制代码 |
| Frappe Education | [frappe/education](https://github.com/frappe/education) | **待所选提交及框架依赖复核** | 申请、培养项目、注册、课程、排课与考试对象 | 思想/工作流参考 | 参考限定；不要把 ERPNext 的 GPL-3.0 自动等同于所有相关仓库许可 |
| Gibbon | [GibbonEdu/core](https://github.com/GibbonEdu/core) | **待所选提交复核** | 角色权限、课表、日历、学生提醒与 lesson planner | 思想/工作流参考 | K–12 倾向；只提炼工作流，不直接当大学模板 |
| OpenEduCat | [openeducat/openeducat_erp](https://github.com/openeducat/openeducat_erp) | LGPL-3.0（仍按所选提交复核） | admission、student、course、exam、attendance、timetable 等模块边界 | 思想/工作流参考 | Odoo 生态依赖较重；不进入本届 P0 |

以上四个教育系统是“研究对象”，不是已经选定的技术栈。其功能证据、大学适配判断和权威系统边界见 [SIS / URP / UArizona 调研](../research/SIS-URP-UARIZONA.md)。若开赛后决定复用任何代码，必须从“参考限定”重新走一遍下方全部硬闸门。

## 直接复用前的硬闸门

1. **赛事规则**：当届 AdventureX 允许使用该赛前开源依赖或示例；
2. **官方上游**：来源是维护者仓库、官方包仓或官方发行页；
3. **版本锁定**：记录 tag / commit、下载 URL、时间和 SHA-256，不只写 `latest`；
4. **许可边界**：保留 LICENSE / NOTICE / copyright，复核传递依赖、字体、图标和媒体资产；
5. **安全与维护**：查看锁定版本的已知漏洞、放弃状态、MSRV / 平台要求与最近发行；
6. **最小化**：只引入能直接减少 P0 风险或支持已选 P1 的组件，不为技术展柜叠库；
7. **可回退**：核心数据合同与领域逻辑不被单个开源库绑死。

## 现场采用记录模板

```yaml
component: 
upstream_repository: 
selected_version_or_commit: 
download_or_registry_url: 
sha256: 
license_spdx: 
license_files_preserved: []
transitive_license_check: pending
reuse_mode: direct_dependency | adapted_snippet | reference_only
project_role: 
local_modifications: []
security_check: 
event_rule_check: 
verified_at: 
verified_by: 
fallback: 
```

## 与学期求解器的特别边界

Conda 和 libsolv 证明了“规格 → 候选缩减 → 依赖/冲突 → 最终状态 → 差异 → 事务”这套思考方式很有价值。但全校排课还有时间区间、教室容量、教师工时和学生群互斥等资源约束；因此：

- 个人选课与毕业路径可优先评估 SAT / MaxSAT；
- 机构级排课优先评估 OR-Tools CP-SAT 等通用约束求解器；
- Conda 目前是语义和管线来源，libsolv 目前是研究参考，二者都不是已选的现场代码依赖。

## 相关资料

- [核心软件与求解架构](CORE-ARCHITECTURE.md)
- [SIS / URP / UArizona 与开源教务调研](../research/SIS-URP-UARIZONA.md)
- [WinUI 3 条件评估](ADVENTUREX-WINUI3-ASSESSMENT.md)
- [WinUI 3 独立本地参考库](D:/10451/Users/10451/Downloads/WinUI3-Reference/GUIDE.md)
- [技术栈机器目录](catalog.json)
- [jiaowu2K26 决策日志](../DECISIONS.md)

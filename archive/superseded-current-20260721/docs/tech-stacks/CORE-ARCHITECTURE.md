# 核心软件与求解架构决策

> 状态：赛前评估结论，尚未实现。开赛后仍需根据团队熟悉度、官方规则与现场资源通过技术闸门。
> 决策日期：2026-07-19。本文只归纳技术方向，不包含功能代码、可运行 Demo 或预先构建的环境。
> 项目层级：jiaowu2K26 是总项目；SmartCourse Studio 是首个 P0 模块，Academic Mirror 与 Semester Resolver 是共享基础/P1-P2 方向。

[返回技术选型摘要](../TECH-STACK.md) · [开源复用登记](OPEN-SOURCE-REUSE.md) · [决策日志](../DECISIONS.md)

## 结论先行

- **产品边界**：jiaowu2K26 是大学生活与学习的体验层，不在 72 小时内替换学校 SIS / URP 等权威系统。
- **客户端候选**：React + Vite Web 作为默认方向；WinUI 3 仅在 Windows 审核台能带来明显路演价值时作为 Secondary。
- **核心后端候选**：Rust + Axum + Tokio 的**模块化单体**，不拆微服务，也不强求所有 AI / OCR 处理都用 Rust。
- **主数据层候选**：OceanBase MySQL 模式 + SQLx，前提是现场连接、迁移、事务与查询小样能在首个 6 小时内通过；否则使用同数据合同的 SQLite / JSONL。
- **排课方向**：借鉴 Conda 的“环境、规格、依赖、冲突、差异、事务、锁文件”语义，设计 **Semester Environment Resolver**；不直接把 Conda / libsolv 的软件包求解代码硬套到全校排课。
- **优先级**：jiaowu2K26 首个 P0 模块“智课工坊”的“来源 → AI 草稿 → 教师审核 → 学生互动”仍是赛内首要目标；学期求解器是 P1/P2，不得反客为主。

## 总体分层

```text
React + Vite / 条件式 WinUI 3
                 ↓
        Rust API 模块化单体
  ┌─ SmartCourse：来源、生成、审核、发布
  ├─ Academic Mirror：外部教务数据镜像与权威标记
  ├─ Semester Resolver：规格、约束、优化、解释、事务
  ├─ Integration：URP / LMS / 手工导入 / 模型供应商适配器
  └─ Audit：审核事件、版本、发布与回滚记录
                 ↓
 OceanBase MySQL 模式 ⇄ SQLite / JSONL 回退
```

单体内部通过模块边界和接口隔离，而不是通过网络拆分。这能保留 Rust 对状态和错误的严谨建模，同时避免黑客松期间的部署、鉴权和跨服务调试成本。

## 不可破坏的数据不变量

1. AI 生成对象必须关联至少一个可定位的 `source_fragment` 才能进入审核。
2. 只有 `approved` 状态可发布；审核事件只追加，不覆盖历史。
3. 外部教务记录必须保存来源系统、外部 ID、获取时间、版本与权威级别；镜像不伪装成校方权威源。
4. 排课结果必须同时输出“结果 + 依据 + 未满足项 + 与当前课表的差异”，不只返回一张无法解释的课表。
5. UI、数据库和模型供应商不得渗透到核心领域对象，便于现场替换和离线回退。

## Rust 核心：选它的条件

Rust 在这里的价值不是“反常规”本身，而是适合表达审核状态机、可替换适配器和可测试的领域约束。但它是**条件主选**，不是为了新颖而锁死的结论。

建议的内部模块：

- `content` — 来源片段、生成对象、版本；
- `review` — 草稿、修改、通过、移除、发布状态机；
- `academic_mirror` — 课程、开课、已修、学期等外部数据镜像；
- `resolver` — 学期规格、硬约束、软偏好、候选解与解释；
- `providers` — 模型、OCR、存储和教务源适配器；
- `audit` — 事件日志、追溯、发布版本。

开赛后的硬闸门：团队至少一人能独立调试 Rust Web 服务，并在 6 小时内跑通“一个写入、一个查询、一个审核状态迁移、一个前端调用”。否则应立即回退到团队更熟悉的 FastAPI / Node 方案。

## OceanBase：为真问题服务，不为技术展柜服务

OceanBase 候选负责的是真正需要关系与事务的数据：

- 来源片段 ↔ AI 对象 ↔ 审核事件 ↔ 发布版本；
- 课程、开课、学期、先修关系与学生计划；
- 从多来源检索后保留的证据链和版本化状态。

不应为了“分布式”标签强行上库。必须现场验证：

1. MySQL 模式和拟使用的 SQLx 功能路径真实兼容；
2. schema migration、连接池、事务提交/回滚与关键查询通过小样；
3. 网络、账号、额度、版本和许可边界已确认；
4. 断网时能使用同一 repository 接口切换到 SQLite / JSONL。

注意：MySQL 模式是兼容层，不等于与原生 MySQL 每个功能完全相同，所以不依赖未经验证的特有 SQL。

## Academic Mirror：把教务系统当权威源，不当要重写的对象

与 URP、LMS 或美国大学校园系统对接时，核心使用一个只读为主的 `Academic Mirror`，而不是试图在黑客松里造完整 SIS。建议每条镜像记录至少包含：

```text
source_system  external_id  source_version
fetched_at     effective_at authority_level
raw_reference  normalized_payload
```

P0 可用经授权的样例数据或手工导入；实时爬取、绕过登录或对校方系统写入均不是 P0 依赖。

## Semester Environment Resolver：借 Conda 的思路，不借错问题

### 概念映射

| Conda 概念 | 学期规划概念 |
|---|---|
| `MatchSpec` | `CourseSpec`：必修/选修、学分、属性、时间偏好 |
| `PackageRecord` | `OfferingRecord`：某学期的具体课程、教师、班次、名额 |
| channel / repository | 课程目录与各学院开课源 |
| prefix / installed state | 当前学期课表 + 已修课程 |
| pins | 不可移动的必修、实验班、时间块或资格要求 |
| dependencies | 先修/并修、理论课-实验课绑定 |
| conflicts | 时间、教师、教室、班级或学生群冲突 |
| provides / replaces | 转学分、等价课、替代修读 |
| transaction | 加课 / 退课 / 换课操作集 |
| lockfile | `semester.lock`：可重现的学期方案快照 |

### 求解管线

```text
CourseSpec + SemesterPrefix + Pins + Catalog Index
                         ↓
                    候选缩减
                         ↓
       依赖 + 硬冲突 + 软偏好 + 目标函数
                         ↓
       候选最终状态 + 不可满足原因
                         ↓
          与当前状态求 diff
                         ↓
             transaction + semester.lock
```

用户不只需要“有解”，还需要一组稳定的优化顺序，例如：满足硬约束 → 提高毕业进度 → 减少与当前课表的改动 → 尽量满足时间/教师偏好 → 减少空档。顺序需由用户可见，不做黑箱综合分。

### 可插拔求解后端

| 问题 | 优先候选 | 原因 |
|---|---|---|
| 个人选课与毕业路径 | SAT / MaxSAT | 依赖、互斥和分层偏好与软件包求解最接近 |
| 全校课程-教师-教室排程 | CP-SAT / 通用约束优化 | 时间区间、容量、资源互斥与多目标更自然 |
| 现场无法集成求解器 | 确定性启发式 | 在限时内返回 best-feasible，并显式列出违例 |

核心领域只依赖统一的 `SolverBackend` 接口。直接复用 Conda / libsolv 代码当前不入选；可复用的是规格化、索引缩减、最终状态、差异、事务和 lockfile 思想。

## 阶段与停损线

| 阶段 | 上限 | 停损线 |
|---|---|---|
| P0 | SmartCourse 可追溯审核闭环 + 2K 学习体验 | 任何新技术影响主闭环，立即回退 |
| P1 | Academic Mirror 的小样导入；个人课程组合解释 | 只使用已授权数据，不依赖真实校方账号 |
| P2 | Semester Resolver 完整求解、事务与 `semester.lock` | 不影响提交和路演素材制作 |

## 开赛后前 6 小时的决策闸门

1. 团队能否用候选栈完成最小端到端请求？
2. OceanBase 账号、网络、版本、SQLx 兼容与迁移能否通过？
3. SQLite / JSONL 回退是否无需改动领域层？
4. 模型输出能否稳定满足数据合同并附带来源？
5. 若第 4 小时仍无法通过主路径，在第 6 小时前完成回退，不边做主功能边换底座。

## 官方技术依据

- [Conda 求解器深入说明](https://docs.conda.io/projects/conda/en/4.13.x/dev-guide/deep-dive-solvers.html)
- [Conda Solver State 技术规格](https://docs.conda.io/projects/conda/en/latest/dev-guide/specs/solver-state.html)
- [OceanBase MySQL 兼容性说明](https://en.oceanbase.com/docs/common-oceanbase-database-10000000000829643)
- [Axum crate 文档](https://docs.rs/axum/latest/axum/)
- [Tokio 官方教程](https://tokio.rs/tokio/tutorial)
- [Google OR-Tools CP-SAT 说明](https://developers.google.com/optimization/cp/cp_solver)
- [Google OR-Tools 排程示例](https://developers.google.com/optimization/scheduling/employee_scheduling)

候选项目的官方仓库、许可证、复用方式和采用状态另见 [OPEN-SOURCE-REUSE.md](OPEN-SOURCE-REUSE.md)。

官方文档只支持各底层能力的边界；“学期环境”是本项目的产品类比和架构推导，不是 Conda 官方用例。

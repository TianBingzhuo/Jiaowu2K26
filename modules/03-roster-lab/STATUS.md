---
status_schema: "1.0"
module_ids: ["F-004"]
module_status: technical_review
owner: product_integrator
active_slice: "F-004-fixture-vertical-slice"
updated_at: "2026-07-24"
task_router: "../../PROJECT-MANIFEST.json#current_work"
---

# Roster Lab / Semester Environment Resolver · 状态

> 即时派单与 owner 以 `PROJECT-MANIFEST.json.current_work` 为唯一事实源；本文件记录 F-004 技术候选的实现证据、限制和待验收项。`technical_review` 不等于产品总集成人员已接受、合并或发布。

- **状态:** `technical_review`
- **优先级:** P1 候选
- **负责人:** `product_integrator`（Codex 实现与集中技术复核；产品总集成人员最终接受）
- **依赖:**
  - F-003 Academic Mirror（当前由两套显式脱敏 Fixture 代替；真实目录、学籍与权威级别尚未接入）
  - X-02 来源与证据、X-05 同意与隐私、X-08 可访问性、X-09 离线与降级、X-10 可解释推荐

## 已实现的技术候选

- [x] 12 门脱敏 CourseSpec：必修/选修/通识/实验、学分、院系、班次、容量、先修/并修、替代与互斥
- [x] SemesterPrefix：已修、在修、拟选、退出与版本基线
- [x] Pins：课程、班次与个人时间块；SLS201 锚点不可移除
- [x] 确定性启发式求解：硬约束筛选、显式软偏好、目标顺序与稳定排序
- [x] Draft Board：同场比较 A/B/C 三套方案、学分、偏好满足度、迁移成本、风险与取舍
- [x] What-if：命名分支、加课、减课、时间块和方向说明；结果与 Prefix 隔离并可丢弃
- [x] Conflict Review：最小冲突集、三步阻塞链、可放宽项与替代课程
- [x] Transaction：add / drop / swap、净学分、风险和正式办理步骤；永不执行正式选课
- [x] `semester.lock`：本机保存、JSON 导出、输入 fingerprint 与确定性重放检查
- [x] Rust domain + Axum API：Prefix、Pins、Solve、What-if、Diff、Lock、Catalog、Unsat、Demo 与 Reset
- [x] 三份 F-004 JSON Schema、OpenAPI 3.1、Golden Fixture 与合同不变量
- [x] 键盘、鼠标、触控与 Gamepad API 复用统一语义焦点路径；传统模式与 Reduced Motion 保留功能

## 功能点验收矩阵

| 功能点 | 当前结果 | 证据 / 边界 |
|---|---|---|
| F004-01 CourseSpec | 通过（Fixture） | 12 门课程覆盖角色、学分、班次、容量、先修/并修、替代和互斥；未连接真实教务目录 |
| F004-02 当前 Prefix | 通过 | 已修/在修/拟选/退出、版本和 transaction 基线均可读；后端 PUT 有身份与版本校验 |
| F004-03 Pins | 通过 | 课程/班次/个人时间块可见；SLS201 锚点移除在 UI 与 API 均被拒绝 |
| F004-04 课程目录索引 | 通过（小型索引） | 12 门版本化候选避免遍历全集；学期/学院查询索引留给 F-003 接入后补全 |
| F004-05 硬约束 | 通过（前端规则 Fixture） | 先修/并修、时间、学分、容量、互斥、Pin 与 What-if 时间块均校验；后端候选仍使用预验证方案 |
| F004-06 软偏好 | 部分通过 | 早晚课、紧凑、多样性、稳定性可调且影响排序；教师和负荷分布尚无授权数据 |
| F004-07 目标顺序 | 通过 | 默认顺序可见，硬约束固定第一，其余目标可调；相同输入排序稳定 |
| F004-08 多方案输出 | 通过 | 默认产生 3 套差异方案，每套含目标、学分、课程、迁移成本、至少 3 项取舍与容量风险 |
| F004-09 无解解释 | 通过 | 双 Pin 冲突测试返回最小冲突集、阻塞链、可放宽项与替代课程 |
| F004-10 What-if | 通过（本地完整 / API 最小） | UI 实际应用加减课程、时间块和方向说明；Rust API 当前只保留命名且明确 `is_simulation=true` |
| F004-11 Diff / transaction | 通过 | 已人工验收 swap、add、drop、净学分、风险、可逆边界和正式办理步骤 |
| F004-12 `semester.lock` | 通过（本地） | 保存目录、Prefix、Pins、偏好、目标、求解器和 fingerprint；重放结果一致 |
| F004-13 人工锁定与重算 | 通过 | 启用 Pin 后所有候选保持锁定班次；不能静默移动或删除系统锚点 |
| F004-14 求解后端接口 | 延后 P2 | 统一 `solver_backend` / result contract 已冻结；尚未引入 SAT、MaxSAT 或 CP-SAT |
| F004-15 确定性回退 | 通过 | 无外部求解库即可稳定返回 best-feasible；无解进入解释页，不伪装全局最优 |
| F004-16 机构排课分域 | 延后 P2 | 当前只验证个人学期规划；不把个人规则直接放大全校 |

## 自动与人工证据

- Web：8 个测试文件、40 项 Vitest 测试、strict TypeScript 与 Vite 6.4.3 生产构建通过；其中 F-004 引擎测试 9 项。
- Rust：domain / API / SQLite adapter 合计 21 项测试；`fmt`、`check`、`test`、`clippy -D warnings` 通过。
- 合同：12 份 JSON Schema、4 份 Golden Fixture、OpenAPI 3.1 与 Manifest 校验通过。
- 实时 API：Reset、Fixture、Catalog、Prefix read/write、Pin 接受/拒绝、Solve、Diff、Lock、What-if 与 Unsat 共 11 个检查通过。
- 浏览器：390×844 移动窄窗完整操作 Build Board → Draft Board → What-if → Conflict Review → Transaction → 本地 Lock → Replay；Esc 返回通过。
- 截图：`app/apps/web/qa-f004-editor-mobile.png`、`app/apps/web/qa-f004-compare-mobile.png`。

## 已知限制与待人验收

- 前端当前运行完整 TypeScript Fixture 引擎，Rust API 同时提供独立 Fixture 候选；两者尚未通过 F-003 的统一 DTO / 在线调用合并成单一事实源。
- Rust Demo Session 保存在进程内存；浏览器 `semester.lock` 在 localStorage。尚未接入 SQLite/OceanBase 的 F-004 持久化。
- Rust What-if API 当前只生成命名模拟候选；前端才实际应用加课、减课、时间块和方向说明。统一语义是 F-003 后的首个集成任务。
- 当前求解器是确定性启发式与预构造候选，不是 SAT/MaxSAT，也没有穷举全部组合；界面和合同已明确这一点。
- 当前课程、容量、学生与培养方案均为脱敏 Fixture；不是学校权威数据、选课占座或正式交易。
- 桌面响应式布局通过 CSS/生产构建检查，但本轮浏览器面板固定为 390×844，新的 1440×1024 F-004 人工截图仍待补。
- Gamepad 使用浏览器 Gamepad API 语义路径，尚无实体手柄证据；无真实参与者人因证据。
- 产品总集成人员尚未作出接受、合并、公开展示或发布决定。

## 下一决策

保持本模块为 `technical_review`，转入上游 F-003 Academic Mirror：先统一权威来源、DTO 与离线镜像，再让 F-004 Web 使用同一 `/api/v1` 数据与求解结果。任何模块只能由产品总集成人员标为 `accepted`。

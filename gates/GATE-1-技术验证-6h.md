# GATE-1：6小时技术门禁

> **阶段**：Hacking 开始后的前 6 小时
> **目标**：证明技术栈可行，或切换到回退方案
> **前置**：[GATE-0-赛前准备.md](GATE-0-赛前准备.md) 全部 ✅
> **引用**：技术回退表同步至 [GATE-2-P0稳定-36h.md](GATE-2-P0稳定-36h.md) 停损判定使用
> **来源**：[ENGINEERING.md](../archive/superseded-8entries-20260721/ENGINEERING.md) 前6小时技术闸门、[PLAYBOOK.md](../archive/superseded-8entries-20260721/PLAYBOOK.md) 72h作战节奏

---

## 阶段 0-1h：规则、空白基线与协作底座

- [ ] 赛事规则已保存（主题 / 赛道 / 赞助权益 / 资源清单快照）
- [ ] 记录官方宣布 Hacking 开始的时间
- [ ] **只在官方宣布 Hacking 开始后**创建全新 GitHub 主仓，并用 `--allow-empty` 建立首个空白 commit、记录时间
- [ ] 赛前研究/规格如进入仓库，使用独立 `docs(pre-event): ...` commit 明确标注来源与“非本届实现”，不得混入历史原型
- [ ] 四名成员已加入；`main` 禁止直接 push / force push / delete，PR 至少一名非作者审核，检查通过后只用 squash merge
- [ ] GitHub Project 仅有一个 Active Feature；列使用 `Backlog → Ready → In Progress → Review → Accepted / Blocked`
- [ ] 任务板、决策日志、环境清单与第三方归属表已建立；每张任务带唯一验收 ID、owner、输入、输出、不做和回退
- [ ] Manifest `current_work` 已同步为 phase=`hacking`、gate=`GATE-1`、active_slice=`P0-00`、task_source.mode=`github_live`，并记录 Project/Issue URL 与同步时间
- [ ] 四位队员分别问一次“我现在能干什么？”，Task Router 返回本人已认领任务或角色匹配的 Ready 任务；不返回 P1/Vision，不自动改变 owner
- [ ] 若账号方案支持，启用 `main` 保护、必需检查、对话已解决与线性历史；不支持时由总集成人员作为唯一合并人执行同一规则
- [ ] 可选国内备份仅允许 GitHub → Gitee 单向同步或由总集成人员在 Accepted Tag 后推送；其他成员不得向备份仓写入
- [ ] 记录四台机器的 OS / 架构 / Git / Node / Rust / Python 版本和最终演示机；版本差异已消除或标为不参与相应组件
- [ ] 已提交 `.editorconfig`、`.gitattributes`、`.gitignore`、`.env.example` 与依赖锁；选择的工具链有版本钉住文件
- [ ] `scripts/doctor`、`scripts/bootstrap`、`scripts/verify` 至少在最终演示机和另一台机器通过；Docker/OceanBase 不得成为唯一启动路径，SQLite 回退可用
- [ ] Web → API 最小请求跑通（一次真实 HTTP 请求返回数据）
- [ ] source record 数据结构定义（含 id / material_id / type / locator / rights_status）
- [ ] 核心状态迁移可实现（draft → approved → published / removed）

**通过标准**：一次真实请求可重现，证据齐全、P0 一致

**未通过动作**：暂停技术选型，不建支线

---

## 阶段 1-2h：数据层验证

- [ ] 数据库写入 / 查询 / 事务跑通
- [ ] AI 模型结构化输出可用（输入材料 → 输出 schema 合格对象）
- [ ] 来源追溯记录可写入和查询（source_fragment → generated_object 关联）
- [ ] Provider 响应信封格式验证（provider / model_version / source_ids / schema_valid）

**通过标准**：完整的数据读写循环

**未通过动作**：换团队熟悉栈

---

## 阶段 2-4h：核心组件验证

- [ ] 🔴 Rust 编译 + 运行（如果采用）：至少一位队员能独立调试
- [ ] 🔴 在最终机器上完成：一条写入、一条查询、一次审核状态迁移、一次前端调用、一个失败响应
- [ ] 🔴 OceanBase 采用测试（如果采用）：
  - [ ] 🔴 连接与 TLS
  - [ ] 🔴 SQLx migration
  - [ ] 🔴 审核状态事务提交和回滚
  - [ ] 🔴 来源—对象—事件的关键 join
  - [ ] 🔴 切换 SQLite 后领域测试仍通过
- [ ] 🟡 SQLite 回退已验证（与主库共享 repository 合同）——仅在 OceanBase 不可用时触发
- [ ] 🔴 AI 模型小样：输入课程材料 → 输出结构化草稿（含 source_ids）
- [ ] 🔴 前端框架搭建 + 一个页面渲染（React + Vite）

**通过标准**：最小端到端路径跑通，写入/查询/事务/结构化输出通过

**未通过动作**：对应组件切回退（见下方技术回退表）

---

## 阶段 4-6h：组合冻结

- [ ] Primary / Secondary / Fallback 组合确定
- [ ] 每个技术项指定责任人
- [ ] 不可行项已切换到回退方案
- [ ] 为实际依赖登记版本、许可证与用途
- [ ] 验证全部回退能在最终演示机工作
- [ ] 最小实体、API 契约和状态机测试已建立

**通过标准**：技术组合冻结，不再"再试半天"

**未通过动作**：移出 P0，不再"再试半天"

---

## 技术回退表

| 技术项 | Primary | Secondary | Fallback |
|--------|---------|-----------|----------|
| 后端语言 | Rust + Axum + Tokio | FastAPI | Node / Fastify |
| 数据库 | OceanBase MySQL mode + SQLx | SQLite | JSONL 文件 |
| AI 模型 | 开幕式确认的赞助模型 | 本地小模型 / 规则引擎 | 预生成 fixture |
| 前端 | React + TypeScript + Vite | 纯 HTML + JS | 录屏演示 |
| 部署 | Zeabur / 确认赞助云 | 本地 localhost | 录屏 + 截图 |
| 文档提取 | Python worker / CLI | 预提取 markdown | 手工输入 |
| 教师控制台 | Web 主路径 | WinUI 3（条件式） | 不引入 |
| 游戏引擎 | 不进入 P0 | Unity（P2 展会壳） | 不引入 |

> **原则**：任何候选都不能因为"文档写了"而强制采用。团队熟悉度高于"技术看起来新"。

---

## 数据不变量（冻结前必须验证）

1. 无可定位来源的 AI 对象不能进入教师审核
2. 只有 `approved` 的具体版本可发布
3. 审核、发布、撤回和数据使用事件只追加
4. 演示 fixture、缓存结果和实时结果不可共用同一状态标签
5. 模型/数据库/供应商 ID 不进入核心领域枚举，保持可替换

---

## 决策记录（开幕后填写）

| 技术项 | 最终决策 | 决策时间 | 原因 | 责任人 |
|--------|---------|---------|------|--------|
| 后端 | | | | |
| 数据库 | | | | |
| AI 模型 | | | | |
| 前端 | | | | |
| 部署 | | | | |

---

## Gate 判定

| 结果 | 条件 | 动作 |
|------|------|------|
| **Go** | 四个阶段全部通过，组合已冻结 | 进入 [GATE-2-P0稳定-36h.md](GATE-2-P0稳定-36h.md) |
| **Conditional** | 部分组件切回退但主路径可走 | 记录回退项，继续 GATE-2 |
| **No-Go** | 主路径不可行 | 全面切 Fallback 栈，重新评估 |

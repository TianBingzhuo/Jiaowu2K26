# GATE-1：6小时技术门禁

> **阶段**：Hacking 开始后的前 6 小时
> **目标**：证明技术栈可行，或切换到回退方案
> **前置**：[GATE-0-赛前准备.md](GATE-0-赛前准备.md) 全部 ✅
> **引用**：技术回退表同步至 [GATE-2-P0稳定-36h.md](GATE-2-P0稳定-36h.md) 停损判定使用
> **来源**：[ENGINEERING.md](../archive/superseded-8entries-20260721/ENGINEERING.md) 前6小时技术闸门、[PLAYBOOK.md](../archive/superseded-8entries-20260721/PLAYBOOK.md) 72h作战节奏
> **当前判定：** 本机后端/SQLite 证据已就绪，等待 GitHub Actions、第二台机器、Web 壳与用户批准；不得提前判定 Go。

---

## 阶段 0-1h：规则、空白基线与协作底座

- [x] 赛事规则、主题、赛道与赞助资料已保存；未确认事实仍保持待核验
- [x] 产品总集成人员现场确认 Hacking 已开始后才授权建仓；精确公告瞬间没有独立截图，Manifest 保留该证据局限
- [x] 全新公开 GitHub 主仓已建立；首个 `d4e0f82` 是公开安全的规格/协作基线，不是伪造的空提交，也不含赛前产品代码
- [x] 赛前研究、概念图和规格都明确标注为研究/候选/非实现；历史原型在 archive，不能计入本届实现
- [x] 团队改为弹性能力池，不假定固定四人；`main` 禁止 force push/delete，要求 PR、CODEOWNERS、对话解决、线性历史和 squash merge
- [x] 当前只有 [P0-00 Issue](https://github.com/TianBingzhuo/Jiaowu2K26/issues/1) 处于 Active；不为形式额外建立第二任务系统
- [x] Manifest 已包含每个工作包的验收 ID、owner、输入、输出、不做和回退，并同步 phase=`hacking`、gate=`GATE-1`、active_slice=`P0-00`
- [ ] 所有实际队员分别用 Task Router 完成一次“询问 → 认领 → PR”走查
- [ ] GitHub Actions 首次通过后，把 `Rust (Ubuntu)`、`Rust (Windows)`、`Contracts and docs` 设为 `main` 必需检查
- [x] 国内平台只允许 Accepted 后由总集成人员做 GitHub → Gitee 单向备份；当前不双写
- [ ] 最终演示机与至少一台队友机器都完成环境记录和同一验证命令；当前仅最终开发机有完整证据
- [x] `.editorconfig`、`.gitattributes`、`.gitignore`、`.env.example`、`.node-version`、`rust-toolchain.toml`、Cargo/npm lockfile 已建立
- [ ] `doctor/bootstrap/verify` 在第二台机器通过；本机已通过，Docker/OceanBase 不参与启动，SQLite + Fixture 可离线运行
- [x] HTTP client → API 真实请求跑通：`health → review → approve → publish → replay`；Web/PWA 客户端仍待 P0-00-D
- [x] `Material` 与 `SourceFragment` 合同分开表达 rights、id、material_id、type 和 locator；Golden Fixture 保留 source_ids/evidence
- [x] 核心状态迁移与停损已测试：draft → review → approved → published，以及 removed 终态、非法迁移、未知未来状态和 stale revision

**通过标准**：一次真实请求可重现，证据齐全、P0 一致

**未通过动作**：暂停技术选型，不建支线

---

## 阶段 1-2h：数据层验证

- [x] SQLite 数据库写入 / 查询 / 审核与发布事务跑通
- [ ] AI 模型结构化输出可用（输入材料 → 输出 schema 合格对象）
- [x] Golden Fixture 的 `source_ids → evidence → generated_object` 可写入、查询并进入 Replay；独立材料解析表仍待产品切片
- [ ] Provider 响应信封格式验证（provider / model_version / source_ids / schema_valid）

**通过标准**：完整的数据读写循环

**未通过动作**：换团队熟悉栈

---

## 阶段 2-4h：核心组件验证

- [ ] 🔴 Rust 编译 + 运行已通过；仍需至少一位人类队员独立完成一次调试走查
- [ ] 🔴 最终机器已完成写入、查询、审核状态迁移、真实 HTTP 调用和失败响应；React 前端调用仍待 P0-00-D
- [ ] 🔴 OceanBase 采用测试（如果采用）：
  - [ ] 🔴 连接与 TLS
  - [ ] 🔴 SQLx migration
  - [ ] 🔴 审核状态事务提交和回滚
  - [ ] 🔴 来源—对象—事件的关键 join
  - [ ] 🔴 切换 SQLite 后领域测试仍通过
- [x] 🟡 SQLite 路径已验证并位于可替换 repository port 后；OceanBase 不可用不阻塞启动
- [ ] 🔴 AI 模型小样：输入课程材料 → 输出结构化草稿（含 source_ids）
- [ ] 🔴 前端框架搭建 + 一个页面渲染（React + Vite）

**通过标准**：最小端到端路径跑通，写入/查询/事务/结构化输出通过

**未通过动作**：对应组件切回退（见下方技术回退表）

---

## 阶段 4-6h：组合冻结

- [ ] Primary / Secondary / Fallback 组合确定
- [ ] 每个技术项指定责任人
- [ ] 不可行项已切换到回退方案
- [ ] 实际直接依赖的版本、许可证元数据与用途已登记；完整传递依赖许可证/NOTICE 报告仍待补
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
| 后端 | PR 候选：Rust 1.97.1 + Axum 0.8.9 + Tokio 1.53.1 | 2026-07-23 | WSL2 compile/test/clippy + live API smoke 通过；待 CI/人审 | product_integrator |
| 数据库 | 已验证本地路径：SQLite + SQLx 0.9.0；OceanBase 未选 | 2026-07-23 | 同 repository 合同、事务与 Replay 通过；无云依赖 | product_integrator |
| AI 模型 | 未选择；当前仅 Fixture | 2026-07-23 | 不把预生成内容伪装成模型能力 | product_integrator |
| 前端 | 未选择为已实现；React/Vite 仍是候选 | 2026-07-23 | P0-00-D 尚未开始 | unclaimed |
| 部署 | localhost / WSL2 实验；公开部署未选择 | 2026-07-23 | 先保证可复现，再评估赞助云 | product_integrator |

---

## Gate 判定

| 结果 | 条件 | 动作 |
|------|------|------|
| **Go** | 四个阶段全部通过，组合已冻结 | 进入 [GATE-2-P0稳定-36h.md](GATE-2-P0稳定-36h.md) |
| **Conditional** | 部分组件切回退但主路径可走 | 记录回退项，继续 GATE-2 |
| **No-Go** | 主路径不可行 | 全面切 Fallback 栈，重新评估 |

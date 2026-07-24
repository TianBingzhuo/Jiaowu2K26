---
status_schema: "1.0"
module_ids: ["F-001"]
module_status: technical_review
owner: null
active_slice: "F-001 fixture vertical slice"
updated_at: "2026-07-24"
task_router: "../../PROJECT-MANIFEST.json#current_work"
---

# 智课工坊 · 状态

> 即时派单与 owner 以 `PROJECT-MANIFEST.json.current_work` 为唯一事实源；本文件只记录模块进度、阻塞和裁剪。

- **模块编号：** F-001
- **状态：** technical_review（P0 Fixture / 本地回退候选；等待产品总集成人员验收）
- **优先级：** P0（首个纵向切片，不可裁剪）
- **负责人：** [待分配]
- **依赖：** 无前置模块依赖；需 AI 模型 API 可用（或 fixture 回退）
- **规格基线：** F001-01～F001-16 沿用八入口版本，禁止重新编号

## 规格补充（2026-07-22）

- EXP-CASE-01/02 已归并为 P0 最小验收合同：草稿显示证据状态与未知，教师可纠正/通过/移除，Replay 使用稳定 Evidence Pack。
- 仅补充既有 F001-04/07/08/13/15 的验收口径；实现仍为 pending，不新增页面或支线。
- “01 基座”新增跨平台兼容验收合同：领域模型不得含客户端类型，活动 HTTP 规格统一 `/api/v1/`，Schema/状态变更须附迁移与旧版读取，X-11 双归档所需来源/发行方/版本字段从首版预留。
- EXP-CASE-10 只登记未来多支架、即时解释和 Buddy 交互所需的扩展点；不把 maimai 玩法加入 P0，实现状态仍为 pending。

## 进度

- [x] 核心数据模型定义（Material / SourceFragment / GeneratedObject / EvidenceItem / ReviewEvent / PublishedVersion / StudentInteraction）
- [x] P0 审核状态机实现（draft → review → approved/removed → published）；`rejected / withdrawn` 留在 P1
- [x] P0 技术 API（读取对象、审核、发布、学生互动、Replay；Fixture + SQLite）
- [ ] 完整 API 面（规格中的上传、解析任务、批量、撤回与质量统计仍未实现）
- [~] Provider-neutral 生成合同与 Fixture adapter 已实现；Live 模型 adapter 未实现
- [ ] 文档提取 worker（ASR / PPT / PDF）
- [~] 材料登记 UI（真实本地文件选择、权利/格式/大小阻断、SHA-256 已实现；文件仅留浏览器会话，通用解析器未实现）
- [x] 教师审核 UI（草稿、来源、未知项、类型/状态/风险筛选、修改/通过/移除）
- [x] 发布门禁 UI（只包含 approved + 有效来源；可演练来源失效）
- [x] 学生学习 UI（NAN 完成理解检查并查看批准解析与来源）
- [x] Replay / Box Score UI（本人互动、人工决定、版本与来源时间线）
- [x] 考试信号 S/A/B Badge
- [x] Fixture 回退数据准备（虚构的信号与线性系统 Demo）
- [x] Demo Mode 7/7 链路浏览器验证
- [ ] 端到端验收通过

> `[~]` 表示部分实现，不能在路演中说成完整能力。

## 功能点验收快照

| 功能点 | 结论 | 当前证据 | 进入技术评审前仍需 |
|---|---|---|---|
| F001-01 材料登记 | pass-local | Fixture 显示完整来源元数据；Test Court 实际执行文件选择、权利/格式/50MB 阻断与浏览器 SHA-256 | 服务端授权范围与持久化 |
| F001-02 来源片段 | pass-fixture | 3 个稳定 ID、页码/时间戳/章节定位，可从对象回看 | 真实解析器输出 |
| F001-03 解析状态 | pass-fallback | ready Fixture；本地路径有 idle/hashing/partial/failed、原因、重复执行重试与手工来源接管 | Live ASR/PPTX/PDF 解析成功证据 |
| F001-04 草稿合同 | pass | 5 类对象；Rust/TypeScript 均保留 source IDs、未知、生成与审核状态 | Live 模型输出兼容测试 |
| F001-05 来源约束生成 | pass-fixture | Provider-neutral adapter 合同、显式 Fixture fallback reason 与越界来源拒绝测试 | Live 模型 adapter 与证据不足评测 |
| F001-06 结构校验 | pass | Rust 不变量、机器可读 409/422、Golden Fixture/Schema 检查 | 新对象类型兼容样例 |
| F001-07 教师审核队列 | pass-fixture | 同屏草稿/来源/未知；类型、状态、风险筛选 | 多课程与真实风险排序 |
| F001-08 Human Override | pass-fixture | edit/approve/remove；前后正文和移除原因进入追加事件 | Live API 与五对象 UI 全量同步 |
| F001-10 发布门禁 | pass-fixture | approved + 有效来源才进入不可变版本；来源失效可复现 | 真实授权范围与撤回 |
| F001-11 学生互动 | pass-fixture | NAN 作答、解析、来源与 StudentInteraction 持久化接口 | UI 改为服务端提交并处理离线重试 |
| F001-13 Replay / Box Score | pass-fixture | 6 事件时间线、本人正确率/用时/来源，不含排名 | 多次互动与纠错/申诉入口 |
| F001-15 离线回退 | pass | FIXTURE 始终显式标注，真实审核状态机仍可操作 | 人工来源输入与缓存恢复 |
| F001-09/12/14/16 | deferred-P1 | 规格保留 | 批量保护、Challenge Call、撤回、质量面板 |

## 自动化与可视证据

- Web：严格 TypeScript、23 项 Vitest（含 F-002 跨模块回归）、Vite 6.4.3 生产构建通过。
- Rust：11 项测试通过（含 F-002 路由回归）；Live API 已实测 `review → approve → publish → interaction → replay`，随后重启恢复干净 Fixture。
- 浏览器：1440×1024 完整流程 7/7；390×844 Replay 可用；键盘语义按钮与 Reduced Motion 继承统一基座。
- 截图：`app/apps/web/qa-f001-source-1440x1024.jpg`、`qa-f001-review-1440x1024.jpg`、`qa-f001-release-gate-1440x1024.jpg`、`qa-f001-replay-1440x1024.jpg`、`qa-f001-replay-mobile-390x844.jpg`。
- 视觉结果已达到技术候选质量，但尚未替代产品总集成人员验收或真人可用性研究。

## 技术评审后续

- 不阻塞 Fixture P0 候选：真实 ASR/PPTX/PDF parser、Live 模型 adapter、五对象 UI/API 全量同步。
- 进入 `accepted` 前仍需产品总集成人员走查；“降低审核时间/提升学习效果”必须等待真人研究，当前不能宣称。

## 裁剪决策

- **保留**（P0 核心，不可裁剪）
- 36 小时停损线：若主闭环在开赛后第 36 小时仍不稳定，暂停所有扩展，先确保来源→审核→发布→互动可完整演示

## 关键里程碑

| 时间 | 目标 |
|------|------|
| Day 1 | 三页骨架 + 三个接口 + JSON Schema 锁定 |
| Day 2 | 材料→脚本→审核→证据 链路打通 |
| Day 3 | 90 秒演示路径完整 + fallback 数据 |
| Day 4 | 打磨 + 证据模式 + Q&A 准备 |
| Day 5 | 路演 + 展台 |

## 最后更新

2026-07-24

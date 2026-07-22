---
status_schema: "1.0"
module_ids: ["F-001"]
module_status: pending
owner: null
active_slice: null
updated_at: "2026-07-22"
task_router: "../../PROJECT-MANIFEST.json#current_work"
---

# 智课工坊 · 状态

> 即时派单与 owner 以 `PROJECT-MANIFEST.json.current_work` 为唯一事实源；本文件只记录模块进度、阻塞和裁剪。

- **模块编号：** F-001
- **状态：** pending
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

- [ ] 数据模型定义（Material / SourceFragment / GeneratedObject / EvidenceItem / ReviewEvent / PublishedVersion / StudentInteraction）
- [ ] 审核状态机实现（draft → review → approved/rejected/removed → published → withdrawn）
- [ ] API 端点实现（7 个主端点 + 6 个 Demo Mode 端点）
- [ ] AI 模型集成（provider-neutral adapter + fixture 回退）
- [ ] 文档提取 worker（ASR / PPT / PDF）
- [ ] 材料上传页 UI
- [ ] 教师审核页 UI（含证据抽屉组件）
- [ ] 学生学习页 UI（含测验弹层）
- [ ] Replay / Box Score 页 UI
- [ ] 考试信号 Badge 组件
- [ ] Fixture 回退数据准备（BST Demo 课程）
- [ ] Demo Mode 完整链路验证
- [ ] 端到端验收通过

## 阻塞

- 无

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

2026-07-22

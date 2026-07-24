---
status_schema: "1.0"
module_ids: ["F-005"]
module_status: technical_review
owner: product_integrator
active_slice: "F-005-fixture-vertical-slice"
updated_at: "2026-07-24"
task_router: "../../PROJECT-MANIFEST.json#current_work"
---

# World Exam Finals · 状态

> 即时派单与 owner 以 `PROJECT-MANIFEST.json.current_work` 为唯一事实源；本文件记录 F-005 技术候选的实现证据、限制和待验收项。`technical_review` 不等于产品总集成人员已接受、合并或发布。

- **状态:** `technical_review`
- **优先级:** P1 首选
- **负责人:** `product_integrator`（Codex 实现与集中技术复核；产品总集成人员最终接受）
- **依赖:**
  - F-001 智课工坊（复用同一 SourceFragment / GeneratedObject / PublishedVersion 命名空间）
  - F-003 Academic Mirror（当前以脱敏 Fixture 课程上下文代替，真实接入仍未开始）
  - X-02 来源与证据、X-05 同意与隐私、X-08 可访问性、X-09 离线与降级

## 已实现的技术候选

- [x] 数据模型：ExamEvent、PreGameBriefing、WarmupQuestion、ReviewPlaybook、Checkpoint、ExamAttempt、Replay、BoxScore、PostGameReflection
- [x] Rust 领域状态机：`scheduled → briefing_open → warmup → exam_active → review → archived`
- [x] `/api/v1`：赛事列表、简报、Warm-up、Playbook、Checkpoint、答题、完成、Replay、Box Score、复盘与 Demo reset
- [x] 前端七步闭环：赛事日历 → 赛前简报 → Warm-up → 复习 Playbook → Key Match → Replay / Box Score → 私密复盘
- [x] 沉浸、轻量、传统三档叙事；三档保持功能等价
- [x] Warm-up 可重试、跳过、查来源，且明确不计正式成绩
- [x] Playbook 勾选、调整个人顺序与 Checkpoint 保存
- [x] Open-book AI Exam：每道题可展开精确来源；无来源支撑的 AI 说法必须先挑战才可完成
- [x] 选择即自动保存；`0/2 → 2/2` 回合进度、Replay 解锁和下一步主行动始终可见
- [x] 公开黑客松 Demo 七步全开；正式领域状态机仍保留流程门
- [x] Replay 稳定事件 ID、个人 Box Score、无公开排名/GPA/伪精确胜率
- [x] 复盘默认私密；分享必须显式同意并设置过期时间；支持 JSON 导出和只读归档
- [x] IndexedDB 离线缓存、待同步提示、恢复模拟与内存降级
- [x] 键盘、鼠标、触控与 Gamepad API 共用语义焦点路径；来源抽屉支持 Esc 关闭和焦点约束
- [x] F-001 已发布对象与来源 ID 复用检查；无第二套内容系统
- [x] Demo Fixture、两份 F-005 JSON Schema、OpenAPI 与合同检查
- [x] 桌面 1440×1024 和移动 390×844 主路径浏览器验收

## 功能点验收矩阵

| 功能点 | 当前结果 | 证据 / 边界 |
|---|---|---|
| F005-01 赛事日历 | 通过（Fixture） | 统一展示复习、Office Hours、Key Match 与截止节点；全部明确为非正式演示安排 |
| F005-02 赛前简报 | 通过 | 范围、目标、来源、资源与准备状态齐备；无“必过/必挂”预测 |
| F005-03 Warm-up | 通过 | 低风险、可跳过/重试/查来源，不写入正式成绩 |
| F005-04 复习 Playbook | 通过 | 教师批准对象、个人勾选与排序、Checkpoint 均可操作 |
| F005-05 Adaptive Drill | 延后 P2 | 未用少量 Fixture 伪装个性化推荐 |
| F005-06 Checkpoint | 通过（最小切片） | 记录覆盖、薄弱、未知与待问；不形成长期能力标签 |
| F005-07 Key Match | 通过 | 准备清单、两题自动保存、回合进度、解锁反馈与 Replay 主行动可用；当前无真实考试倒计时和正式提交 |
| F005-08 Open-book AI Exam | 通过（规则 Fixture） | AI 声明逐项回指来源；unsupported 声明必须挑战 |
| F005-09 Replay | 通过 | 稳定事件 ID、动作、来源与后续状态可回放 |
| F005-10 Box Score | 通过 | 仅个人学习数据；无班级排名、GPA 或通过概率 |
| F005-11 Overtime | 延后 P2 | 不把补交、重试、申诉制度包装成奖励 |
| F005-12 赛后复盘 | 通过 | 私密默认、显式分享同意、过期时间、JSON 导出、只读归档 |
| F005-13 压力友好模式 | 通过（传统模式） | 去除赛事语言、倒计时动效与音效，不减少功能 |
| F005-14 教师配置 | 延后 P2 | 当前由 Fixture/合同控制，未提供教师配置 UI |

## 自动与人工证据

- Web：全站 16 个测试文件、120 项 Vitest、strict TypeScript 与 Vite
  生产构建通过；其中 F-005 引擎测试 9 项。
- Rust：domain / API / SQLite adapter 合计 16 项测试；`fmt`、`check`、`test`、`clippy -D warnings` 通过。
- 合同：9 份 JSON Schema、3 份 Golden Fixture、OpenAPI 3.1 与 Manifest 校验通过。
- 实时 API：`health`、Demo reset、赛事列表和 Fixture 读取通过；完整状态迁移另由 Router 集成测试覆盖。
- 浏览器：桌面完整七步闭环、来源抽屉、错误重试、unsupported challenge、分享到期、离线待同步和归档均已人工操作；移动版日历与来源抽屉通过。
- 截图：`reference/audit/2026-07-24-current-ui-audit/03-world-finals-ready.png`
  与 `05-key-match-before-after.png`；历史桌面与移动 QA 图继续保留。

## 已知限制与待人验收

- Rust Demo Session 当前保存在进程内存，服务重启会重置；浏览器 IndexedDB 只保存本地离线状态。尚未接入 SQLite/OceanBase 的 F-005 持久化。
- 当前课程、学生、事件和答案均为脱敏 Fixture，不是学校权威数据、真实考试或学习效果证据。
- Gamepad 使用浏览器 Gamepad API 语义路径，尚无实体手柄证据；移动布局已模拟，尚无真实触屏设备记录。
- 无真实参与者的人因证据；叙事压力、理解、误导风险和复盘同意仍需产品总集成人员与真实学生审核。
- 产品总集成人员尚未作出接受、合并、公开展示或发布决定。

## 下一决策

在保持本模块为 `technical_review` 的同时，按用户授权进入下一 F 模块技术切片；任何模块都只能由产品总集成人员标为 `accepted`。

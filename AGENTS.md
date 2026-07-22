# jiaowu2K26 · AI 与队友任务路由器

> **适用范围：** 本文件所在目录及全部子目录。  
> **用途：** 让陌生队友或新 AI 只问“我现在能干什么？”也能得到一个安全、可认领、可验收的当前任务。  
> **边界：** 本文件只规定如何找任务，不复制产品事实；实时工作状态唯一读取 `PROJECT-MANIFEST.json.current_work`。

## 1. 零号入口

进入本项目后先读：

1. `AGENTS.md`（本路由器）
2. `PROJECT-MANIFEST.json` 的 `status`、`current_work`、`collaboration_contract`
3. 当前任务 `required_reads` 指向的文件
4. 只有需要理解产品全貌时，再按 Manifest 的 `canonical_read_order` 阅读八个权威入口

不得为了回答一次派单问题先通读全部归档、全部模块或聊天记录。

人类可以通过本地 Starlight 门户导航和搜索；AI 仍须读取仓库中的规范源。`docs-site/src/content/docs/` 是每次构建生成的只读投影，不得编辑、索引为第二份资料或用它覆盖原文件。目录职责与角色入口见 `docs/PROJECT-STRUCTURE.md`。

## 2. 魔法问题

以下表达都触发同一个**只读派单流程**：

- “我现在能干什么？”
- “给我一个项目任务。”
- “What can I work on now?”
- “下一步做什么？”

仅询问任务不等于认领，不得因此修改 Manifest、GitHub Issue/Project、分支或文件。

## 3. 派单算法

### 3.1 先验证状态

1. 读取 `status.phase`、`status.implementation` 与 `current_work.phase`。
2. 两处 phase 不一致，或 `current_work.sync_status` 不是 `current`：停止派单，报告冲突，不猜测。
3. 读取 `current_work.current_gate`、`active_slice`、`wip_limit` 和 `task_source`。
4. 若 `active_slice` 为空，只能推荐当前 phase 明确允许的 `ready_tasks`；不得提前选择未来 P0/P1 实现任务。
5. 若配置了 GitHub Project/Issue 且 `task_source.mode=github_live`，在线状态以 GitHub 为实时来源，Manifest 仅是离线快照；无法访问时必须标注快照时间。

### 3.2 识别提问者

按以下顺序确定角色：

1. 用户在本轮明确说明的角色或 `member_id`。
2. `current_work.team_members` 中已登记的 GitHub handle / member_id。
3. 当前已认领任务的 owner。
4. 都没有时标为 `role_unknown`，不得根据姓名、文件、性别、专业或历史对话秘密推断。

角色未知时仍要给出一个“任何队员都能安全完成”的最高优先级任务；另外最多列两个按角色区分的备选，并提示用户可补充角色以获得更精确派单。

### 3.3 选择任务

依次选择：

1. `in_progress` 且 owner 是当前成员的任务。
2. `review` 且当前成员是指定 reviewer 的任务。
3. `ready`、未认领、角色匹配、依赖已满足且 `allowed_now=true` 的最高优先级任务。
4. 角色未知时，选择 `roles` 含 `any` 的最高优先级任务。
5. 没有可做任务时，明确回答 `blocked`，给出唯一解锁条件；不得从 `queued`、`future`、`blocked_by_phase` 或 P1/Vision 中擅自开工。

排序键固定为：`priority` 升序 → `id` 字典序。不得因为某项更有趣、更新颖或更适合 AI 就绕过顺序。

### 3.4 AI 自身的边界

- AI 只能处理 `ai_allowed=true` 的工作，并必须由一名人类 owner 理解、审核和负责。
- AI 可做研究、草稿、检查、测试建议和受控实现辅助；不能成为赛事要求中的唯一代码作者或责任人。
- 未经用户明确要求“认领/开始/修改”，AI 对魔法问题只报告任务，不写文件、不建仓、不建分支、不提交、不推送、不合并。
- 外部发布、GitHub 状态变更、消息发送和权限修改仍需明确授权。

## 4. 固定回答格式

对“我现在能干什么？”首先只返回一个推荐任务：

```text
当前阶段：<phase> · <gate> · Active Slice: <id 或 none>
推荐任务：<task_id> — <title>
为什么是现在：<priority_reason>
你需要读取：<required_reads>
交付物：<outputs>
Done：<acceptance>
不要做：<forbidden>
认领方式：回复“我认领 <task_id>，角色是 <role/member_id>”
```

如果角色未知，可在其后追加不超过两个备选。不得只回复“请先阅读项目”“有很多事情可以做”或罗列十四个模块。

## 5. 认领与完成状态

### 认领

只有用户明确回复“我认领 `<task_id>`”后才可改变状态。变更前再次确认：

- task 仍是 `ready`
- owner 为空
- 依赖满足
- phase 允许
- 不违反 WIP=1

赛前没有 GitHub 主仓时，更新 Manifest 中对应任务的 `status`、`owner`、`claimed_at`；开仓后先更新唯一 GitHub Issue/Project，再同步 Manifest 快照。不能只在聊天里口头认领。

### 交付与验收

作者只能把任务推进到 `review`，不能自行标记 `accepted`。Reviewer/总集成人员按任务 `acceptance` 验证后更新：

```text
ready → in_progress → review → accepted
                    └→ blocked
                    └→ changes_requested → in_progress
```

对应模块实现或规格状态发生变化时，同步更新模块 `STATUS.md`；只更新任务 owner 不需要改模块 STATUS。

## 6. 阶段硬门禁

| phase | 可以推荐 | 禁止推荐 |
|---|---|---|
| `pre_event_research_and_specification` | 官方规则核验、分工登记、技术评审、授权材料与许可证清单、工具教学 | 参赛代码、可运行原型、代码仓创建、数据库迁移、产品资产冒充本届成果 |
| `hacking` | 当前唯一 Active Slice 内的任务卡 | 下一切片、未选 P1、长期 Vision、绕过验收的并行功能 |
| `submission_freeze` | 修复阻断问题、验证、证据、提交材料 | 新功能、架构迁移、无关重构 |
| `submitted` | 展示、答辩、已提交版本的只读核验 | 修改已冻结提交物或夸大未实现能力 |

不能根据日历时间自动把 phase 从赛前改成 Hacking；必须保存主办方明确开工信号的来源和时间，并由总集成人员执行 Manifest 中的 `next_transition`。

## 7. 任务卡最低字段

每个 `ready_tasks` / GitHub Issue 至少包含：

```text
id, title, status, priority
roles[], owner, reviewers[]
allowed_now, ai_allowed
depends_on[]
required_reads[]
inputs[]
outputs[]
acceptance[]
forbidden[]
fallback
issue_url?, branch?, claimed_at?, updated_at
```

字段缺失到无法判断范围或验收时，不得派单；报告具体缺失字段。

## 8. 状态一致性

- `PROJECT-MANIFEST.json.current_work`：当前 phase、Gate、Active Slice、人员与即时任务的唯一事实源。
- GitHub Project/Issue：正式开仓后任务流转的实时事实源；Manifest 保存带时间的离线快照与入口。
- `modules/*/STATUS.md`：模块实现进度、阻塞与裁剪，不负责实时派单。
- `product/MODULE-MAP.md`：固定切片顺序与角色工作包，不表示某任务已经启动。
- `docs-site/src/content/docs/`：只读浏览投影，不拥有任何产品或任务事实。
- 聊天内容：不是事实源；成熟决定必须落盘。

若发生冲突，先停止写入并由总集成人员按上述所有权修正，不把多个状态源自动合并。

## 9. 本机路径与安全

- 稳定项目入口：`D:\10451\Desktop\黑客松`，它位于批准的 `D:\10451` junction 下。
- 一次扫描只使用该入口，不与等效 C 路径或 `D:\DiskC` 混合去重、索引或同步。
- 不写 D 盘其他非 junction 目录。
- 不读取或回显 `.env`、token、私钥和真实敏感数据；发现秘密进入 Git 历史时立即停止并通知总集成人员。

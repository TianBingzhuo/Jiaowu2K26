# World Exam Finals · 功能规格

> **功能 ID：** F-005 · **优先级：** P1 首选
> **基线日期：** 2026-07-21 · **实现快照：** 2026-07-24 · **状态：** `technical_review`（P1 Fixture 纵向切片，详见 `STATUS.md`）

## 功能概述

将课前准备、阶段检查、期中/期末、复习和证据回放组织成一条有记忆点的赛事体验，同时必须复用 F-001 的来源与审核链，不另造内容系统。

---

## 功能清单

| ID | 功能 | 具体行为与验收口径 | P1 范围 |
|---|---|---|---|
| F005-01 | 赛事日历 | 把练习、复习、Office Hours、考试和提交节点放入统一时间线；明确哪些是正式安排 | P1 |
| F005-02 | 赛前简报 | 汇总范围、来源、能力目标、可用资源和准备状态，不预测“必过/必挂” | P1 |
| F005-03 | Warm-up | 以低风险短题检查起点；可跳过、重试和查看来源，不计正式成绩 | P1 |
| F005-04 | 复习 Playbook | 教师批准知识点、例题、复习卡和练习顺序；学生可调整个人计划 | P1 |
| F005-05 | Adaptive Drill | 依据个人错误类型和明确规则推荐下一题；显示推荐理由并允许关闭适配 | P2 |
| F005-06 | Checkpoint | 以周/单元记录已覆盖、薄弱、未知和待问问题；可按先修与真实证据形成私密 Mastery Gate，不以一场失误定义长期能力或阻断正式权益 | P1 |
| F005-07 | Key Match | 对期中、期末、展示或大作业提供清晰入口、倒计时和准备清单；避免恐吓式 FOMO | P1 |
| F005-08 | Open-book AI Exam | 让 AI 输出逐项回指来源，教师可挑战其证据；实现 `Show your work` 记忆点 | P1 |
| F005-09 | Replay | 用稳定事件 ID 回放题目、学生行动、来源、教师说明、版本和后续修正；正式考试内容受权限与保留期限制 | P1 |
| F005-10 | Box Score | 展示个人掌握趋势、错误类别、投入和下一步；不公开班级排名或伪精确胜率 | P1 |
| F005-11 | Overtime | 对未完成、补交、重试和申诉提供正式规则入口，不把制度例外包装成游戏奖励 | P2 |
| F005-12 | 赛后复盘 | 学生记录哪里有效、哪里卡住、下一次如何调整，并可把自选关键时刻收入 Season Highlight；导出给导师须本人同意 | P1 |
| F005-13 | 压力友好模式 | 可关闭赛事语言、倒计时动效和音效；提供普通学习模式与支持资源 | P1 |
| F005-14 | 教师配置 | 教师决定范围、可见性、反馈时间、重试和来源；系统不擅自改变课程政策 | P2 |

---

## 核心不变量

1. **复用 F-001 内容链：** 所有复习内容、练习题和讲解必须来自 F-001 已审核发布的 GeneratedObject 或教师手工 fixture；不另建内容管道
2. **来源必须可追溯：** 每道题、每个知识点卡片必须能回指 SourceFragment（来源片段）；无法追溯的标记"来源不可用"
3. **不以预测代替事实：** 不预测"必过/必挂"；准备状态只显示已覆盖/薄弱/未知，不做概率断言
4. **学生控制叙事强度：** 沉浸/轻量/传统三档必须都能完整使用所有功能
5. **不公开排名：** Box Score 只展示个人数据；不显示班级排名、GPA 天梯或伪精确胜率
6. **错误分类不标签化：** "概念性错误"是学习信号，不是身份标签；不以一场失误定义长期能力
7. **压力友好模式是一等公民：** 不是"无障碍附加项"，而是与赛事模式同等完整的功能路径
8. **复盘私密性：** 赛后复盘默认仅学生可见；分享给导师/教师需要本人明确同意，且可设定过期时间

---

## 数据模型补充

### ExamEvent 状态机

```
scheduled → briefing_open → warmup → exam_active → review → archived
                                                    ↓
                                              (Overtime: P2)
```

- `scheduled`：教师创建事件，时间未到
- `briefing_open`：赛前简报可用（通常考前 1-2 周）
- `warmup`：热身题开放
- `exam_active`：正式答题阶段（Open-book AI Exam 或线下考试记录）
- `review`：考后复盘阶段，Replay 和 Box Score 可用
- `archived`：归档，数据保留但不再接受新答题

### 关键外键关系

```
ExamEvent.course_id → AcademicMirror.Course
ExamEvent ← PreGameBriefing (1:1)
ExamEvent ← ReviewPlaybook (1:1, 教师批准)
ExamEvent ← Checkpoint (1:N, 每个学生每周/每单元)
ExamEvent ← ExamAttempt (1:N, 每个学生每次尝试)
ExamAttempt ← ReplayData (1:1)
ExamEvent ← BoxScore (1:N, 每个学生)
ExamEvent ← PostGameReflection (1:N, 每个学生)
ReviewPlaybook.sections[].items[].object_id → F001.GeneratedObject
ExamAttempt.answers[].question_id → F001.GeneratedObject
ExamAttempt.answers[].source_ids → F001.SourceFragment
```

---

## API 合同补充

### 错误响应规范

```json
{
  "error": {
    "code": "EXAM_NOT_ACTIVE | BRIEFING_NOT_READY | ATTEMPT_LIMIT_REACHED | SOURCE_UNAVAILABLE | PERMISSION_DENIED",
    "message": "string (人类可读)",
    "retryable": "boolean",
    "fallback_available": "boolean"
  }
}
```

### 离线/降级响应

当网络不可用时，客户端使用本地缓存的 ExamEvent、ReviewPlaybook 和已完成的 Checkpoint。新答题数据暂存 IndexedDB，恢复后批量同步：

```json
{
  "sync_status": "offline_cached",
  "cached_at": "ISO-8601",
  "pending_sync_count": "number"
}
```

---

## 安全与隐私要求

### 数据访问控制

| 角色 | 可查看 | 不可查看 |
|------|--------|----------|
| 学生（本人） | 自己的 Attempt、Replay、BoxScore、Reflection | 其他学生的答题数据 |
| 教师 | 聚合统计、自己课程的 ExamEvent 配置 | 学生的 Reflection 内容（除非学生同意分享） |
| 导师 | 学生明确同意分享的 Reflection | 未经同意的任何学生数据 |
| 管理员 | 聚合指标（参与率、完成率） | 个人答题细节 |

### 敏感行为保护

- 学生的错误分类（conceptual/computational/careless/unknown）仅本人和授权教师可见
- 复盘文本默认私密，分享需逐次同意
- 不将考试焦虑、失败体验或心理状态数据用于推荐或画像
- 压力友好模式下提供学校心理支持资源链接（不追踪点击）

### 公平性要求

- 考试准备资源的可见性不因学生历史成绩而限制
- Adaptive Drill（P2）的推荐逻辑必须可解释，不能基于敏感属性
- 不将"准备不足"做成公开标签或羞辱性展示
- 赛事叙事不得把挂科、Academic Probation 或心理危机当笑料

---

## 验收标准（详细）

### P1 必做验收

- [ ] 用一份授权材料完成完整流程：赛前简报 → Warm-up → Playbook 复习 → Key Match 答题 → Replay → Box Score → 赛后复盘
- [ ] 每题答题时可展开来源抽屉，显示 SourceFragment 定位（页码/时间戳）
- [ ] Open-book AI Exam 模式下 AI 辅助输出逐项回指来源，match_confidence 为 unsupported 时明确标注
- [ ] 叙事强度切换后所有功能仍完整可用（不丢失数据或功能）
- [ ] 压力友好模式下无倒计时动效、无赛事语言、无音效，普通学习模式完整可用
- [ ] Box Score 只含个人数据，错误分类不标签化
- [ ] 赛后复盘可导出为 JSON；分享给导师需本人明确同意
- [ ] Demo Mode 可用：fixture 数据完整演示全部流程，无需真实学校账号
- [ ] 网络断开时本地缓存答题数据，恢复后可同步

### 产品边界验收

- [ ] 不另造内容系统：所有练习内容来自 F-001 PublishedVersion 或教师 fixture
- [ ] 不预测概率当正式成绩
- [ ] 不泄露题库或其他学生数据
- [ ] 不把制度例外（补考、申诉）包装成游戏奖励

---

## 与其他模块的接口

| 依赖模块 | 接口 | 用途 |
|----------|------|------|
| F-001 智课工坊 | `GET /api/v1/published/:id` | 获取已发布的复习内容（GeneratedObject） |
| F-001 智课工坊 | `SourceFragment` 合同 | 题目和知识点的来源追溯 |
| F-003 Academic Mirror | `GET /api/v1/mirror/courses/:id` | 获取课程信息、学期结构 |
| X-02 来源与证据 | 共享合同 | 每条事实带来源、版本、时间、权威等级 |
| X-05 同意与隐私 | 共享合同 | 复盘分享的同意管理 |
| X-09 离线与降级 | 共享合同 | 断网时的缓存和降级策略 |

---

## 裁剪决策记录

| 功能 | P1 决策 | 理由 |
|------|---------|------|
| F005-05 Adaptive Drill | 延后到 P2 | 需要足够答题数据才能有效推荐；P1 先收集数据 |
| F005-11 Overtime | 延后到 P2 | 补交/申诉规则因校而异，P1 不触碰正式制度 |
| F005-14 教师配置 | 延后到 P2 | P1 使用代码/配置文件控制，不需要完整 UI |

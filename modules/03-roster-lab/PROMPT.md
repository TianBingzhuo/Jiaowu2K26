# Roster Lab / Semester Environment Resolver · AI 协作提示词

> **统一体验硬约束：** 任何界面工作必须先读 [DESIGN-SYSTEM](../../engineering/DESIGN-SYSTEM.md)，复用同一全局 Shell、Token、组件、图标、动效与 `Briefing → Choose → Execute → Replay → Next Move` 循环；本模块不得独立换肤。

> **模块编号：** F-004 · **优先级：** P1 候选
> **阅读本文件后无需查阅其他文档即可开始工作。**

## 项目上下文（30 秒）

jiaowu2K26 是覆盖大学四到八年学习、选课、成长、协作与机会发现的体验层。Roster Lab 是 P1 候选模块——**像 Conda 解析环境一样，把课程规格、已修状态、pins、依赖、冲突和偏好解析成多套可解释、可重现、可比较的学期方案**。

## 本模块使命

大学选课是一个复杂的约束满足问题：必修课有先修要求，选修课有时间冲突，毕业有学分要求，个人有时间偏好——但现有系统只提供一个"能选就选"的界面，不帮学生理解"为什么这样排"或"还能怎么排"。

Roster Lab 借鉴 Conda 的语义：课程是"包"、先修是"依赖"、锁定项是"pins"、选课方案是"环境"、加退课是"transaction"、方案快照是"lockfile"。它输出 2-3 套差异明显的方案并解释取舍，无解时告诉学生阻塞在哪里、可以放宽什么。

**一句话价值：** 学生用 8-20 门课程输入，得到两套可行方案、每套取舍说明、一次 What-if 模拟和一个可重放的输入快照——全程不宣称已正式选课。

---

## 角色与分工

### 产品设计
- 定义 CourseSpec/Pins/方案对比/What-if 的交互流程
- 设计"Conda 式"解释语言（add/drop/swap/conflict/unsat）
- 编写多方案输出和取舍说明的展示方案
- **缺省时 AI 补位：** 根据本文件数据模型和 API 合同生成验收场景

### 前端
- 实现 4 个核心页面：方案编辑器、方案对比、What-if 模拟、无解解释
- 实现 diff/transaction 预览组件
- **缺省时 AI 补位：** 根据下方数据模型和 API 合同生成 React + TypeScript 组件骨架

### 后端
- 实现 8 个 API 端点（见下方 API 合同）
- 实现约束求解接口（SAT/MaxSAT 或确定性启发式回退）
- 实现 `semester.lock` 可重现机制
- **缺省时 AI 补位：** 根据 API 合同生成 Rust/Axum 或 FastAPI 端点框架

### 宣发
- 制作 Conda 语义类比展示（技术辨识度）
- 截取方案对比页面制作路演素材
- **缺省时 AI 补位：** AI 生成文案和类比图

---

## 核心交互流程

```
学生导入/编辑当前状态（已修课程、在修课程、拟选课程）→ 形成 SemesterPrefix
  → 设置 Pins（锁定不可移动的必修/时间块/个人承诺）
  → 设置软偏好（早晚课、空档、教师偏好、负荷分布）+ 优先级
  → 系统从课程目录索引缩减候选课程
  → 求解器解析硬约束 + 软偏好，生成 2-3 套方案
  → 每套方案附带：取舍说明、与当前方案的 diff、风险标注
  → 学生选择一套方案或进入 What-if（调整专业/目标/时间后重新求解）
  → 确认方案后生成 diff + transaction 预览（add/drop/swap + 正式办理步骤）
  → 保存 semester.lock（可重放输入快照）
  → 若无解：展示最小冲突集/阻塞链 + 可放宽项 + 替代课程
```

---

## 数据模型

### CourseSpec（课程规格）

```json
{
  "id": "string (cs-xxx)",
  "course_id": "string",
  "title": "string",
  "credits": "number",
  "attributes": ["string (必修|选修|通识|实验|...)"],
  "offered_semesters": ["string (如 2026-Fall)"],
  "prerequisites": [
    { "type": "course", "course_id": "string", "relation": "before | concurrent" }
  ],
  "corequisites": ["string (course_id, 必须同时修)"],
  "substitutes": ["string (可替代此课程的 course_id)"],
  "exclusions": ["string (与本课程互斥的 course_id)"],
  "capacity": "number | null",
  "catalog_version": "string"
}
```

### SemesterPrefix（当前状态 / 已修基线）

```json
{
  "id": "string (prefix-xxx)",
  "student_id": "string",
  "version": "number",
  "completed": [
    { "course_id": "string", "grade": "string | null", "semester": "string", "credits_earned": "number" }
  ],
  "in_progress": [
    { "course_id": "string", "semester": "string", "status": "enrolled | auditing" }
  ],
  "planned": [
    { "course_id": "string", "target_semester": "string | null", "priority": "number | null" }
  ],
  "dropped": [
    { "course_id": "string", "semester": "string", "reason": "string | null" }
  ],
  "total_credits_earned": "number",
  "created_at": "ISO-8601",
  "updated_at": "ISO-8601"
}
```

### Pin（锁定项）

```json
{
  "id": "string (pin-xxx)",
  "student_id": "string",
  "type": "required_course | lab_section | time_block | qualification | personal_commitment",
  "course_id": "string | null",
  "time_slot": "{ weekday: number, start: string, end: string } | null",
  "semester": "string",
  "lock_reason": "string (为什么不可移动)",
  "locked_at": "ISO-8601",
  "locked_by": "string (student | advisor | system)"
}
```

### CatalogIndex（课程目录索引）

```json
{
  "version": "string",
  "semester": "string",
  "courses": [
    {
      "course_id": "string",
      "title": "string",
      "credits": "number",
      "offerings": [
        {
          "offering_id": "string",
          "instructor": "string",
          "time_slots": [{ "weekday": "number", "start": "string", "end": "string", "room": "string" }],
          "capacity": "number",
          "enrolled": "number"
        }
      ],
      "department": "string",
      "attributes": ["string"]
    }
  ],
  "updated_at": "ISO-8601"
}
```

### SemesterPlan（学期方案）

```json
{
  "id": "string (plan-xxx)",
  "student_id": "string",
  "prefix_version": "number",
  "semester": "string",
  "variant": "number (方案编号: 1, 2, 3...)",
  "courses": [
    {
      "course_id": "string",
      "offering_id": "string",
      "role": "required | elective | general_ed | lab",
      "credits": "number",
      "time_slots": [{ "weekday": "number", "start": "string", "end": "string" }],
      "pinned": "boolean",
      "pin_reason": "string | null"
    }
  ],
  "total_credits": "number",
  "hard_constraints_met": "boolean",
  "soft_score": "number (0-100, 偏好满足度)",
  "tradeoffs": [
    {
      "description": "string (取舍说明)",
      "impact": "positive | negative | neutral",
      "detail": "string"
    }
  ],
  "risks": [
    { "description": "string", "severity": "high | medium | low" }
  ],
  "solver_backend": "sat | maxsat | heuristic | fixture",
  "solved_at": "ISO-8601"
}
```

### UnsatisfiableExplanation（无解解释）

```json
{
  "plan_request_id": "string",
  "minimal_conflict_set": [
    {
      "constraint_type": "prerequisite | time_conflict | credit_limit | capacity | exclusion",
      "involved_courses": ["string (course_id)"],
      "description": "string (人类可读的冲突描述)"
    }
  ],
  "blocking_chain": [
    { "step": "number", "description": "string" }
  ],
  "relaxable_items": [
    {
      "item": "string (哪个 pin 或约束可以放宽)",
      "impact_if_relaxed": "string",
      "alternative_courses": ["string (course_id)"]
    }
  ]
}
```

### SemesterTransaction（选课差异/事务）

```json
{
  "id": "string (tx-xxx)",
  "from_plan_id": "string | null",
  "to_plan_id": "string",
  "actions": [
    {
      "type": "add | drop | swap",
      "course_id": "string",
      "old_offering": "string | null",
      "new_offering": "string | null",
      "credit_change": "number",
      "risk": "string | null",
      "formal_step": "string (正式办理步骤说明)"
    }
  ],
  "net_credit_change": "number",
  "impact_summary": "string"
}
```

### SemesterLock（可重现方案快照）

```json
{
  "id": "string (lock-xxx)",
  "student_id": "string",
  "semester": "string",
  "catalog_version": "string",
  "prefix_version": "number",
  "pins": ["string (pin_id)"],
  "goal_order": ["string (目标优先级列表)"],
  "solver_backend": "string",
  "solver_params": "object",
  "result_plan_id": "string",
  "created_at": "ISO-8601"
}
```

---

## API 合同

| 方法 | 路径 | 描述 | 请求体 | 响应体 |
|------|------|------|--------|--------|
| GET | `/api/v1/roster/prefix` | 获取当前学期状态 | `?student_id=` | `SemesterPrefix` |
| PUT | `/api/v1/roster/prefix` | 更新当前状态 | `Partial<SemesterPrefix>` | `SemesterPrefix` |
| PUT | `/api/v1/roster/pins` | 管理锁定项 | `{ add: Pin[], remove: string[] }` | `{ pins: Pin[] }` |
| POST | `/api/v1/roster/solve` | 求解学期方案 | `{ semester, goal_order?, soft_preferences? }` | `{ plans: SemesterPlan[], unsat?: UnsatisfiableExplanation }` |
| POST | `/api/v1/roster/what-if` | What-if 模拟求解 | `{ changes: { add_courses?, remove_courses?, change_major?, time_constraints? } }` | `{ plans: SemesterPlan[], unsat?: UnsatisfiableExplanation, is_simulation: true }` |
| GET | `/api/v1/roster/plans/:id/diff` | 获取方案 diff/transaction | `?compare_to=plan_id\|prefix` | `SemesterTransaction` |
| POST | `/api/v1/roster/plans/:id/lock` | 保存 semester.lock | — | `SemesterLock` |
| GET | `/api/v1/roster/catalog` | 获取课程目录索引 | `?semester=&department=` | `CatalogIndex` |

---

## UI 要求

### 方案编辑器页 (`/roster/editor`)
- 左侧：当前状态（已修/在修/拟选课程列表）
- 右侧：Pins 管理（锁定必修、时间块、个人承诺）
- 底部：软偏好设置（早晚课偏好、空档偏好、负荷分布）+ 优先级拖拽排序
- 目标顺序默认可见可调整："硬约束 → 毕业进度 → 少改当前方案 → 个人偏好 → 少空档"
- "求解"按钮触发方案生成

### 方案对比页 (`/roster/compare`)
- 并排展示 2-3 套方案
- 每套方案显示：课程列表、时间冲突视图、学分、偏好满足度
- 取舍说明列表（每个取舍明确标注影响）
- 风险标注（高/中/低）
- Diff 视图：与当前方案的 add/drop/swap 差异
- 选择按钮 + transaction 预览

### What-if 模拟页 (`/roster/what-if`)
- 调整控件：换专业、加减课程、改时间约束
- 明确标注"模拟模式——不提交正式选课"
- 模拟结果与原方案对比
- What-if 结果在数据类型和界面文案上同时区分

### 无解解释页 (`/roster/unsat`)
- 最小冲突集可视化（哪些课程/约束互相冲突）
- 阻塞链（一步步说明为什么无解）
- 可放宽项列表 + 放宽后的影响
- 替代课程建议

---

## 验收标准

- [ ] 用授权或虚构的 8-20 门课程完成全流程
- [ ] 至少生成 2 套差异明显的方案，每套附带取舍说明
- [ ] 硬约束（先修/时间冲突/学分上下限/互斥）必须满足或明确报错
- [ ] 软偏好按用户设置的优先级生效
- [ ] What-if 模拟结果明确标注"模拟"，不提交正式交易
- [ ] 无解时展示最小冲突集 + 阻塞链 + 可放宽项 + 替代课程
- [ ] Diff/transaction 预览显示 add/drop/swap 和正式办理步骤
- [ ] semester.lock 保存完整输入快照，方案可重放
- [ ] 人工锁定的 Pin 不会被求解器悄悄移动
- [ ] 确定性回退：无求解库时用规则化启发式返回 best-feasible + 完整违例列表
- [ ] 不宣称已正式选课——所有输出明确标注"规划/模拟"
- [ ] Demo Mode 可用：使用 fixture 数据完整演示

---

## 依赖

- **F-003 Academic Mirror：** 课程目录、已修记录、学期结构（或通过 fixture 替代）
- 共享能力引用：X-02 来源与证据、X-09 离线与降级、X-10 可解释推荐
  > F-001 关键实体摘要（避免跨模块查找）：
  > - `SourceFragment`：{ id, course_id, page_range, knowledge_ids, excerpt }
  > - `EvidenceItem`：{ id, source_id, evidence_type, generated_by, verified_by }
  > - `GeneratedObject`：{ id, source_ids[], evidence_ids[], status, teacher_version }

## 回退策略

| 如果 | 则 |
|------|-----|
| SAT/MaxSAT 求解库不可用 | 使用确定性启发式返回 best-feasible + 完整违例列表 |
| F-003 课程数据不可用 | 使用手工 fixture（8-20 门虚构课程） |
| 求解超时 | 返回已找到的可行方案 + "未穷举"标注 |
| 数据库不可用 | SQLite 或 JSONL 存储 |
| 课程目录不完整 | 标注"目录不完整，结果可能遗漏" |
| What-if 改动过大 | 提示"改动过多，建议分步模拟" |

## Conda 映射速查

| Conda | Roster Lab |
|-------|-----------|
| MatchSpec / PackageRecord | CourseSpec / OfferingRecord |
| channel / index | 学院与课程目录（CatalogIndex） |
| prefix / installed | 当前课表与已修状态（SemesterPrefix） |
| pins / dependencies / conflicts | 锁定项 / 先修并修 / 时间资源冲突 |
| transaction / lockfile | 加退换课差异 / semester.lock |

## 技术选型参考

- **前端：** React + TypeScript + Vite
- **后端：** Rust + Axum + Tokio（条件主选）或 FastAPI（回退）
- **求解器：** SAT/MaxSAT（个人规划）→ P2 可扩展 CP-SAT（机构排课）
- **回退求解：** 确定性启发式规则引擎
- **数据库：** OceanBase MySQL mode + SQLite 回退

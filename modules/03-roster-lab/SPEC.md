# Roster Lab / Semester Environment Resolver · 功能规格

> **功能 ID：** F-004 · **优先级：** P1 候选
> **基线日期：** 2026-07-21 · **状态：** 待实现规格

## 功能概述

像 Conda 解析环境一样，把课程规格、已修状态、pins、依赖、冲突和偏好解析成多套可解释、可重现、可比较的学期方案。输出至少 2-3 套差异明显方案并说明取舍，无解时给出可理解的阻塞链。

---

## 功能清单

| ID | 功能 | 具体行为与验收口径 | P1 范围 |
|---|---|---|---|
| F004-01 | 课程规格 CourseSpec | 表达必修/选修、学分、属性、学期、班次、先修/并修和替代规则 | P1 |
| F004-02 | 当前 Prefix | 区分已修、在修、拟选和退出；保存当前方案版本作为 diff 基线 | P1 |
| F004-03 | Pins | 锁定不可移动的必修、实验班、时间块、资格或个人承诺，并显示锁定原因 | P1 |
| F004-04 | 课程目录索引 | 按学期、学院、容量、时间和规则版本缩减候选；不让求解器遍历无关全集 | P1 |
| F004-05 | 硬约束 | 先修/并修、时间冲突、学分上下限、开课、容量和互斥必须满足或明确报错 | P1 |
| F004-06 | 软偏好 | 早晚课、空档、教师/授课方式、负荷分布等由用户显式设置优先级 | P1 |
| F004-07 | 目标顺序 | 默认“硬约束 → 毕业进度 → 少改当前方案 → 个人偏好 → 少空档”，可见且可调整 | P1 |
| F004-08 | 多方案输出 | 在同一 Scenario Draft Board 给出 A/B/C 至少 2–3 套差异明显方案，解释目标、约束、取舍和相对当前方案的迁移成本，而非只给黑箱最优解 | P1 |
| F004-09 | 无解解释 | 列出最小冲突集或可理解的阻塞链，并给出可放宽项和替代课程 | P1 |
| F004-10 | What-if | 调整专业、目标、时间或课程后建立可命名分支并重新求解；标明改变的是模拟，支持回到基线，不提交正式交易 | P1 |
| F004-11 | Diff 与 transaction | 展示 add/drop/swap 前后变化、影响、风险、迁移成本、可逆/不可逆点和正式办理步骤 | P1 |
| F004-12 | `semester.lock` | 保存目录版本、输入、pins、目标顺序、求解器和结果，使方案可重放 | P2 |
| F004-13 | 人工锁定与重算 | 学生可保留满意部分再重算；系统不得悄悄移动 pin | P1 |
| F004-14 | 求解后端接口 | 个人规划可评估 SAT/MaxSAT；机构排程评估 CP-SAT；接口输出统一解释 | P2 |
| F004-15 | 确定性回退 | 无求解库时用规则化启发式返回 best-feasible，并显式列出所有违例 | P1 |
| F004-16 | 机构排课分域 | 教室、教师、容量、学生群与时间区间单独建模，绝不把个人规划逻辑直接放大全校 | P2 |

---

## 核心不变量

1. **方案不是正式选课：** 所有输出明确标注"规划/模拟"；不宣称已完成正式选课交易
2. **多方案而非单一最优：** 至少 2-3 套差异明显方案，每套说明取舍；不做黑箱"唯一最优解"
3. **Pin 不可悄悄移动：** 学生锁定的项在求解过程中必须保持不变；如果 Pin 导致无解，必须明确报告
4. **硬约束必须满足或报错：** 先修/时间冲突/学分限制/互斥不能违反；违反时必须生成 UnsatisfiableExplanation
5. **What-if 是模拟：** What-if 结果在数据类型和界面文案上同时与正式方案区分
6. **无解必须有解释：** 永远不能只返回"无方案"；必须给出最小冲突集 + 可放宽项
7. **确定性回退是底线：** 无求解库时仍能用启发式返回 best-feasible + 完整违例列表
8. **solver.lock 可重放：** 给定相同输入（目录版本 + prefix + pins + 目标顺序 + 求解器参数），结果必须一致

---

## 硬约束清单

| 约束类型 | 说明 | 违反时行为 |
|----------|------|-----------|
| 先修课程 | 必须先修或并修指定课程 | 排除该课程 + 加入冲突集 |
| 时间冲突 | 两门课时间重叠 | 只保留其一 + 加入冲突集 |
| 学分上限 | 学期总学分不超过上限 | 减少候选 + 加入冲突集 |
| 学分下限 | 学期总学分不低于下限 | 增加候选 + 加入冲突集 |
| 开课学期 | 课程仅在某些学期开设 | 排除非开课学期 |
| 容量限制 | 选课人数不超过容量 | 排除满员课程 |
| 互斥课程 | 两门课不能同时修 | 只保留其一 + 加入冲突集 |

---

## 软偏好清单

| 偏好类型 | 说明 | 优先级可调 |
|----------|------|-----------|
| 早晚课 | 偏好上午/下午/晚上 | 是 |
| 连续空档 | 偏好课程紧凑或分散 | 是 |
| 教师偏好 | 偏好特定教师 | 是 |
| 负荷分布 | 均匀 vs 前重后轻 | 是 |
| 最少变动 | 尽量不改当前方案 | 是 |
| 课程多样性 | 跨领域选课 | 是 |

---

## 数据模型补充

### 求解器接口

```rust
trait SolverBackend {
    fn solve(&self, input: SolverInput) -> SolverResult;
    fn explain_unsat(&self, input: SolverInput) -> UnsatisfiableExplanation;
    fn backend_name(&self) -> &str;
}

struct SolverInput {
    catalog: CatalogIndex,
    prefix: SemesterPrefix,
    pins: Vec<Pin>,
    hard_constraints: Vec<HardConstraint>,
    soft_preferences: Vec<SoftPreference>,
    goal_order: Vec<GoalPriority>,
    max_variants: usize,  // 最多生成几套方案
}

enum SolverResult {
    Solutions(Vec<SemesterPlan>),
    Unsatisfiable(UnsatisfiableExplanation),
    BestFeasible(SemesterPlan, Vec<Violation>),  // 启发式回退
}
```

### What-if 输入

```json
{
  "base_prefix_id": "string",
  "changes": {
    "add_courses": [{ "course_id": "string", "semester": "string" }],
    "remove_courses": ["string (course_id)"],
    "change_major": "string | null",
    "time_constraints": [{ "weekday": "number", "blocked": "boolean" }]
  },
  "is_simulation": true
}
```

---

## API 合同补充

### 错误响应规范

```json
{
  "error": {
    "code": "NO_SOLUTION | SOLVER_TIMEOUT | CATALOG_INCOMPLETE | PREFIX_INVALID | PIN_CONFLICT",
    "message": "string",
    "retryable": "boolean",
    "fallback_available": "boolean",
    "unsat_explanation": "UnsatisfiableExplanation | null"
  }
}
```

### 求解超时保护

- 默认超时 10 秒
- 超时后返回已找到的部分方案 + `"status": "partial"`
- 标注"未穷举所有可能方案"

---

## 安全与隐私要求

### 数据保护

- 学生的选课偏好、规划和 What-if 实验仅本人可见
- 导师/教师只能在学生明确同意后查看方案
- 不将"选课失败"或"无解"做成公开标签
- 课程容量数据不对外暴露（防止抢课策略泄露）

### 公平性

- 求解器不因学生身份属性（性别、国籍等）产生差别方案
- 所有学生获得相同的约束求解能力
- 偏好由学生显式设置，系统不默认推断敏感偏好

---

## 验收标准

### P1 必做验收

- [ ] 用 8-20 门课程输入，生成至少 2 套方案
- [ ] 每套方案附带取舍说明（至少 1 个 tradeoff）
- [ ] 完成 1 次 What-if 模拟，结果明确标注"模拟"
- [ ] 完成 1 次无解解释（最小冲突集 + 可放宽项）
- [ ] 保存 1 个可重放输入快照
- [ ] Pin 锁定后求解器不移动
- [ ] 目标顺序可调整且影响方案输出
- [ ] Diff/transaction 显示 add/drop/swap + 正式办理步骤
- [ ] 确定性回退：无求解库时仍返回 best-feasible + 违例列表
- [ ] 全程不宣称已正式选课

### Conda 语义验收

- [ ] CourseSpec 表达先修/并修/替代/互斥
- [ ] Prefix 区分已修/在修/拟选/退出
- [ ] Pin 机制正确阻止求解器移动锁定项
- [ ] Transaction 正确描述 add/drop/swap
- [ ] 方案可重放（相同输入 → 相同输出）

---

## 裁剪决策记录

| 功能 | P1 决策 | 理由 |
|------|---------|------|
| F004-12 semester.lock | 延后 P2 | P1 先验证方案生成核心能力 |
| F004-14 求解后端接口 | 延后 P2 | P1 用单一求解器足够 |
| F004-16 机构排课分域 | 延后 P2 | P1 只做个人规划 |

## University OS 组合边界

- “方向选择模拟”继续由 F004-10 What-if 承担求解事实；F-009 补科研/机会，F-011 补时间外的预算约束，F-002 负责生涯呈现。
- “课程优化建议”由 F004-16 机构排课分域与 F-014 Front Office 组合：前者输出可重放方案/冲突，后者呈现受影响群体、权衡、审批与正式发布状态。
- 不因新增资金或机构数据改变求解器底线：硬约束、未知、多个方案、diff 和无解解释始终可见。

# Opportunity Market · AI 协作提示词

> **统一体验硬约束：** 任何界面工作必须先读 [DESIGN-SYSTEM](../../engineering/DESIGN-SYSTEM.md)，复用同一全局 Shell、Token、组件、图标、动效与 `Briefing → Choose → Execute → Replay → Next Move` 循环；本模块不得独立换肤。

> **模块编号：** F-009 · **优先级：** P1 候选
> **阅读本文件后无需查阅其他文档即可开始工作。**

## 项目上下文（30 秒）

jiaowu2K26 是覆盖大学四到八年学习、选课、成长、协作与机会发现的体验层。Opportunity Market 是 P1 候选模块——**先区分校内与校外赛场，再透明发现期刊/会议/竞赛/科研/实习与权益，解释资格并做经同意的双向匹配**。

## 本模块使命

大学生发现机会的路径极度碎片化：期刊在学院网站、竞赛在公众号、实习在招聘平台、科研在导师口头通知。更严重的是，学生看到一个机会时往往不知道"我够不够格"、"申请需要什么"、"我的数据会被谁看到"。

Opportunity Market 把散落的公开机会聚合到一处，第一层按 **Campus League（校内）/ Open League（校外）** 分区，第二层再按类别筛选。它用结构化资格规则替代"自己去猜"，用四态解释（已满足/可能满足/未满足/未知）替代综合打分，用本人控制资料替代自动投递。**明确禁止：跨区重要性总榜、付费资格、随机资格、人员拍卖、自动投递、付费排名。**

**一句话价值：** 学生用 5-10 条公开机会，系统对一条机会逐项解释四态资格；学生选择本次可用资料，保存后决定是否表达意向；Box Score 显示来源、个人数据使用范围和纠错入口。

---

## 角色与分工

### 产品设计
- 定义机会卡、资格四态解释、选择性匹配和双向意向的交互流程
- 设计反操纵/反付费机制的验证方案
- 编写最小披露和同意管理的用户故事
- **缺省时 AI 补位：** 根据本文件数据模型和 API 合同生成验收场景

### 前端
- 实现 4 个核心页面：机会发现、机会详情、资格检查、匹配管理
- 实现资格四态可视化组件和最小披露预览
- **缺省时 AI 补位：** 根据下方数据模型和 API 合同生成 React + TypeScript 组件骨架

### 后端
- 实现 9 个 API 端点（见下方 API 合同）
- 实现资格规则引擎（四态解释）
- 实现反操纵审计检查
- **缺省时 AI 补位：** 根据 API 合同生成 Rust/Axum 或 FastAPI 端点框架

### 宣发
- 制作"透明 vs 黑箱"对比展示（区别于传统机会平台）
- 设计资格四态解释的路演演示
- **缺省时 AI 补位：** AI 生成文案和对比图

---

## 核心交互流程

```
学生在机会发现页先选择校内 / 校外范围，再浏览公开机会（期刊/会议/竞赛/科研/实习/奖学金）
  → 每张机会卡显示：标题、类别、提供方、截止日期、资格概要
  → 点击机会卡进入详情页：完整内容、资格规则、收益、义务、成本和风险
  → 学生进入资格检查：系统对资格规则逐项输出四态解释
    - 已满足（绿色）：有证据支持
    - 可能满足（黄色）：部分证据或需要确认
    - 未满足（红色）：有证据表明不满足 + 下一步建议
    - 未知（灰色）：缺少信息 + 如何获取
  → 学生管理个人 Profile（目标/兴趣/可用时间/已验证证据）
  → 选择性匹配：学生选择本次用于匹配的资料（逐项授权）
  → 系统基于选中资料给出匹配建议 + 匹配理由
  → 学生保存感兴趣的机会 + 决定是否表达意向
  → 提供方同意后才扩大资料共享（双向意向）
  → Box Score 显示来源、个人数据使用范围和纠错入口
```

---

## 数据模型

### Opportunity（机会）

```json
{
  "id": "string (opp-xxx)",
  "title": "string",
  "provider": "string (提供方名称)",
  "scope": "campus | external",
  "category": "journal | conference | competition | research | internship | scholarship | workshop | campus_project",
  "source_url": "string (官方来源 URL)",
  "source_version": "string",
  "fetched_at": "ISO-8601",
  "verified_at": "ISO-8601 | null",
  "deadline": "ISO-8601 | null",
  "location": "string | null",
  "cost": { "amount": "number | null", "currency": "string | null", "description": "string" },
  "benefits": ["string (收益描述)"],
  "obligations": ["string (义务描述)"],
  "risks": ["string (风险描述)"],
  "eligibility_rules": ["string (eligibility_rule_id)"],
  "status": "active | expired | under_review | reported",
  "correction_route": "string (纠错渠道)",
  "created_at": "ISO-8601",
  "updated_at": "ISO-8601"
}
```

### EligibilityRule（资格规则）

```json
{
  "id": "string (rule-xxx)",
  "opportunity_id": "string",
  "field": "string (如 grade_level, gpa_min, course_completed, language, portfolio, age_range)",
  "operator": "eq | gte | lte | in | contains | has_course | has_experience",
  "value": "any",
  "description": "string (人类可读的规则描述)",
  "source_ref": "string (官方规则原文链接)",
  "weight": "number (0-1, 硬性要求=1, 偏好=0.5)"
}
```

### StudentProfile（学生档案）

```json
{
  "id": "string (prof-xxx)",
  "student_id": "string",
  "goals": ["string (目标描述)"],
  "interests": ["string (兴趣领域)"],
  "available_time_hours_per_week": "number | null",
  "self_declarations": [
    { "field": "string", "value": "any", "declared_at": "ISO-8601" }
  ],
  "verified_evidence": [
    {
      "field": "string",
      "value": "any",
      "source": "string (来源系统)",
      "verified_at": "ISO-8601",
      "source_id": "string | null"
    }
  ],
  "visibility": "private | selective | open",
  "created_at": "ISO-8601",
  "updated_at": "ISO-8601"
}
```

### EligibilityCheck（资格检查结果）

```json
{
  "opportunity_id": "string",
  "student_id": "string",
  "checked_at": "ISO-8601",
  "results": [
    {
      "rule_id": "string",
      "rule_description": "string",
      "status": "met | possibly_met | not_met | unknown",
      "evidence": {
        "source": "string | null",
        "value": "any | null",
        "confidence": "high | medium | low | none"
      },
      "next_step": "string | null (如何满足/确认)"
    }
  ],
  "overall_status": "eligible | likely_eligible | partially_eligible | ineligible | unknown",
  "used_profile_fields": ["string (本次检查使用了哪些 profile 字段)"]
}
```

### MatchRequest（匹配请求）

```json
{
  "id": "string (match-xxx)",
  "student_id": "string",
  "selected_profile_fields": ["string (本次匹配使用的字段)"],
  "excluded_fields": ["string (明确排除的字段)"],
  "filters": {
    "categories": ["string"],
    "deadline_after": "ISO-8601 | null",
    "location": "string | null",
    "max_cost": "number | null"
  },
  "created_at": "ISO-8601"
}
```

### MatchResult（匹配结果）

```json
{
  "match_request_id": "string",
  "results": [
    {
      "opportunity_id": "string",
      "match_score": "number (0-100, 匹配度)",
      "match_reasons": [
        { "rule_id": "string", "reason": "string", "evidence_field": "string" }
      ],
      "conflicts": [
        { "rule_id": "string", "issue": "string" }
      ],
      "unknowns": [
        { "rule_id": "string", "missing_info": "string" }
      ]
    }
  ],
  "generated_at": "ISO-8601"
}
```

### ApplicationMirror（申请镜像，P2）

```json
{
  "id": "string (app-xxx)",
  "opportunity_id": "string",
  "student_id": "string",
  "status": "discovered | saved | consented | applied_externally | outcome_recorded",
  "consent_given_at": "ISO-8601 | null",
  "shared_fields": ["string"],
  "external_application_url": "string | null",
  "outcome": "string | null",
  "created_at": "ISO-8601",
  "updated_at": "ISO-8601"
}
```

### FairnessAudit（公平审计）

```json
{
  "id": "string (fair-xxx)",
  "check_type": "ranking_bias | eligibility_disparity | access_pattern",
  "timestamp": "ISO-8601",
  "findings": [
    { "attribute": "string", "disparity": "number", "description": "string" }
  ],
  "action_taken": "string | null"
}
```

---

## API 合同

| 方法 | 路径 | 描述 | 请求体 | 响应体 |
|------|------|------|--------|--------|
| GET | `/api/v1/opportunities` | 列出机会 | —（当前返回全部；范围/类别由前端本地过滤） | `Opportunity[]` |
| GET | `/api/v1/opportunities/:id` | 获取机会详情 | — | `Opportunity` |
| POST | `/api/v1/opportunities/:id/check` | 资格检查 | `{ profile_fields?: string[] }` | `EligibilityCheck` |
| GET | `/api/v1/profile` | 获取学生档案 | `?student_id=` | `StudentProfile` |
| PUT | `/api/v1/profile` | 更新学生档案 | `Partial<StudentProfile>` | `StudentProfile` |
| POST | `/api/v1/match` | 执行匹配 | `MatchRequest` | `MatchResult` |
| POST | `/api/v1/opportunities/:id/save` | 保存机会 | `{ note?: string }` | `{ saved: true }` |
| POST | `/api/v1/opportunities/:id/report` | 报告错误/过期 | `{ reason: string, type: "expired" \| "wrong_info" \| "unfair" }` | `{ reported: true }` |
| GET | `/api/v1/opportunities/:id/box-score` | 获取机会 Box Score | — | `{ source, data_usage, correction_route }` |

---

## UI 要求

### 机会发现页 (`/opportunities`)
- 网格/列表展示机会卡，每卡显示：标题、类别图标、提供方、截止日期、资格概要
- 筛选器：类别、截止日期、地点、成本
- 排序：按截止日期/匹配度（如已做匹配）
- **禁止：** 付费排名、随机排序、FOMO 倒计时
- 每张卡显示"来源"徽章（官方 URL + 抓取时间）

### 机会详情页 (`/opportunities/:id`)
- 完整内容区：描述、资格规则、收益、义务、地点、成本和风险
- 资格规则列表（结构化 + 链接官方原文）
- "检查我的资格"按钮
- 纠错/报告入口
- **不靠稀有度遮蔽信息：** 所有细节在打开前就可见

### 资格检查页 (`/opportunities/:id/check`)
- 四态可视化：
  - 绿色"已满足" + 证据来源
  - 黄色"可能满足" + 需要确认的项
  - 红色"未满足" + 下一步建议
  - 灰色"未知" + 如何获取信息
- 每项规则独立显示，不汇总成单一分数
- "使用更多资料重新检查"入口

### 匹配管理页 (`/match`)
- Profile 管理：目标/兴趣/自报/已验证证据分区
- 选择性匹配：逐项勾选本次使用的资料
- 最小披露预览：预览对方将看到什么
- 匹配结果列表 + 每项的匹配理由/冲突/未知
- 保存/表达意向入口

---

## 验收标准

- [ ] 使用 5-10 条公开/虚构机会完成全流程
- [ ] 每张机会卡显示完整信息（内容/资格/收益/义务/成本/风险）
- [ ] 资格检查对每条规则输出四态之一 + 证据 + 下一步
- [ ] 学生可选择本次匹配使用的资料（逐项授权）
- [ ] 匹配结果附带理由、冲突和未知项
- [ ] 不自动投递——正式申请链接到权威系统
- [ ] 报告机会错误/过期后状态更新
- [ ] Box Score 显示来源、个人数据使用范围和纠错入口
- [ ] 零付费排序、零随机资格、零给人竞价
- [ ] Demo Mode 可用：fixture 数据完整演示
- [ ] 机会过期或资格改变后受影响匹配重新计算

---

## 依赖

- **F-003 Academic Mirror：** 学生已修课程、成绩等资格验证数据（可通过 Profile 自报替代）
- **F-001 智课工坊：** 作品/证据导出（P2）
- 共享能力引用：X-02 来源与证据、X-05 同意与隐私、X-06 搜索与筛选、X-10 可解释推荐

## 回退策略

| 如果 | 则 |
|------|-----|
| 机会数据来源不可用 | 使用手工准备的 fixture 机会（5-10 条） |
| F-003 数据不可用 | 使用学生 Profile 自报数据做资格检查 |
| 资格规则过于复杂 | 简化为关键字段匹配 + 标注"规则简化" |
| 匹配算法不可用 | 退化为关键词筛选 + 人工浏览 |
| 数据库不可用 | SQLite 或 JSONL 存储 |
| 网络断开 | 使用本地缓存的机会列表 |

## 反操纵红线

| 机制 | 状态 | 说明 |
|------|------|------|
| 付费资格 | 禁止 | 不能付费获得资格或提高资格评分 |
| 随机资格 | 禁止 | 不能随机分配机会或资格 |
| 人员拍卖 | 禁止 | 不能给学生/导师/岗位竞价 |
| 自动投递 | 禁止 | 正式申请必须学生主动操作 |
| 付费排名 | 禁止 | 排序不能受付费影响 |
| FOMO 操纵 | 禁止 | 不用假稀缺或倒计时制造焦虑 |

## 技术选型参考

- **前端：** React + TypeScript + Vite
- **后端：** Rust + Axum + Tokio（条件主选）或 FastAPI（回退）
- **数据库：** OceanBase MySQL mode + SQLite 回退
- **搜索：** 关键词/筛选为主；P2 可加向量搜索

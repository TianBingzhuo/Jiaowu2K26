# Academic Mirror · AI 协作提示词

> **统一体验硬约束：** 任何界面工作必须先读 [DESIGN-SYSTEM](../../engineering/DESIGN-SYSTEM.md)，复用同一全局 Shell、Token、组件、图标、动效与 `Briefing → Choose → Execute → Replay → Next Move` 循环；本模块不得独立换肤。

> **模块编号：** F-003 · **优先级：** P1 候选
> **阅读本文件后无需查阅其他文档即可开始工作。**

## 项目上下文（30 秒）

jiaowu2K26 是覆盖大学四到八年学习、选课、成长、协作与机会发现的体验层。Academic Mirror 是 P1 候选模块——**把授权数据转为可追溯、可纠错、可被体验层安全读取的镜像**，在不冒充 SIS/URP/LMS 的前提下为下游模块提供统一的数据基础。

## 本模块使命

大学的权威数据散落在 SIS（学籍/选课/成绩）、URP（科研）、LMS（课程/作业）和手工导入文件中。体验层需要读取这些数据来做解释、规划和反馈，但不能冒充权威系统、不能绕过授权、不能把过时或推断数据当正式记录。

Academic Mirror 像一面"带标签的镜子"：每个数据字段都标注来源系统、获取时间、权威等级和有效期，冲突时不静默覆盖，而是列出差异等人工确认。P0 用授权样例替代真实数据；P1 可接入小规模真实镜像。

**一句话价值：** 下游模块可以安全地问"这个学生修了哪些课"，并得到带来源、版本和权威等级的回答，而不是一个无法追溯的数字。

---

## 角色与分工

### 产品设计
- 定义数据源登记、同步、冲突检测和人工校对的交互流程
- 设计权威等级标签体系和新鲜度指示器
- 编写同意管理和数据导出/删除的用户故事
- **缺省时 AI 补位：** 根据本文件数据模型和 API 合同生成验收场景

### 前端
- 实现数据源管理页、镜像浏览页、冲突处理页和同意管理页
- 实现字段级来源追溯组件（显示每个字段来自哪个系统、何时获取）
- **缺省时 AI 补位：** 根据下方数据模型和 API 合同生成 React + TypeScript 组件骨架

### 后端
- 实现 9 个 API 端点（见下方 API 合同）
- 实现数据源适配器接口（API / 导出文件 / 手工导入）
- 实现冲突检测和新鲜度检查逻辑
- **缺省时 AI 补位：** 根据 API 合同生成 Rust/Axum 或 FastAPI 端点框架

### 宣发
- 制作"数据来源可视化"展示——让用户看到一条数据从 SIS 到体验层的完整路径
- **缺省时 AI 补位：** AI 生成文案和数据流图

---

## 核心交互流程

```
管理员/教师登记数据源（SIS 系统、导出文件、手工样例）
  → 系统通过适配器获取数据（API 调用 / 文件解析 / 手工录入）
  → 保存不可变原始快照（RawSnapshot）
  → 标准映射到领域对象（NormalizedRecord），每个字段带来源
  → 冲突检测：同一事实多源冲突时进入人工校对队列
  → 用户浏览自己的镜像数据，可查看每个字段的来源和新鲜度
  → 用户管理同意（哪些数据可用于哪些模块）
  → 用户可导出数据、申请修正或删除非权威副本
  → 审计日志记录所有查询、同步、映射和导出操作
```

---

## 数据模型

### DataSource（数据源）

```json
{
  "id": "string (ds-xxx)",
  "name": "string (如 'URP教务系统')",
  "system_type": "sis | urp | lms | manual_export | demo_fixture",
  "responsible_party": "string (负责人/部门)",
  "auth_method": "oauth2 | api_key | file_import | manual",
  "field_scope": ["string (可用字段列表)"],
  "refresh_method": "polling | webhook | manual | on_demand",
  "refresh_interval_hours": "number | null",
  "retention_days": "number",
  "correction_route": "string (纠错渠道说明)",
  "consent_required": "boolean",
  "status": "active | suspended | deprecated",
  "created_at": "ISO-8601",
  "updated_at": "ISO-8601"
}
```

### RawSnapshot（原始快照，不可变）

```json
{
  "id": "string (snap-xxx)",
  "data_source_id": "string",
  "external_id": "string (来源系统中的标识)",
  "source_version": "string (来源系统的版本号/时间戳)",
  "fetched_at": "ISO-8601",
  "content_hash": "string (sha256)",
  "raw_payload": "object | string (JSON 或文件引用)",
  "format": "json | csv | xml | pdf | manual",
  "size_bytes": "number"
}
```

### NormalizedRecord（标准化记录）

```json
{
  "id": "string (nr-xxx)",
  "snapshot_id": "string",
  "entity_type": "student | course | offering | grade | requirement | activity | term",
  "entity_id": "string (领域内的稳定 ID)",
  "payload": {
    "fields": {
      "[field_name]": {
        "value": "any",
        "source_system": "string",
        "external_field": "string",
        "source_version": "string",
        "fetched_at": "ISO-8601",
        "authority_level": "authoritative | official_reference | authorized_mirror | self_declared | model_inferred | demo_fixture",
        "conversion_rule": "string (转换规则描述)"
      }
    }
  },
  "effective_at": "ISO-8601",
  "expires_at": "ISO-8601 | null",
  "consent_basis": "string (同意依据)",
  "correction_route": "string"
}
```

### ConflictRecord（冲突记录）

```json
{
  "id": "string (conf-xxx)",
  "entity_id": "string",
  "field_name": "string",
  "conflicting_values": [
    {
      "source_system": "string",
      "value": "any",
      "authority_level": "string",
      "fetched_at": "ISO-8601"
    }
  ],
  "status": "detected | reviewing | resolved | dismissed",
  "resolution": {
    "chosen_value": "any",
    "chosen_source": "string",
    "reason": "string",
    "resolved_by": "string",
    "resolved_at": "ISO-8601"
  }
}
```

### ConsentRecord（同意记录）

```json
{
  "id": "string (consent-xxx)",
  "student_id": "string",
  "data_source_id": "string",
  "allowed_modules": ["string (模块 ID)"],
  "purpose": "string (用途说明)",
  "granted_at": "ISO-8601",
  "expires_at": "ISO-8601 | null",
  "revoked_at": "ISO-8601 | null",
  "scope": "read_only | export | matching"
}
```

### AuditEvent（审计事件，追加式）

```json
{
  "id": "string (aud-xxx)",
  "action": "query | sync | map | conflict_resolve | export | delete | consent_grant | consent_revoke",
  "actor_id": "string",
  "target_entity": "string (entity_type:entity_id)",
  "timestamp": "ISO-8601",
  "detail": "object",
  "ip_hash": "string (可选，隐私保护)"
}
```

---

## API 合同

| 方法 | 路径 | 描述 | 请求体 | 响应体 |
|------|------|------|--------|--------|
| POST | `/api/v1/mirror/sources` | 登记数据源 | `DataSource (不含 id)` | `DataSource` |
| GET | `/api/v1/mirror/sources` | 列出数据源 | `?status=` | `{ sources: DataSource[] }` |
| POST | `/api/v1/mirror/sources/:id/sync` | 触发同步 | `{ mode: "full" \| "incremental" }` | `{ snapshot_id, status, record_count }` |
| GET | `/api/v1/mirror/records` | 查询标准化记录 | `?entity_type=&entity_id=&student_id=` | `{ records: NormalizedRecord[] }` |
| GET | `/api/v1/mirror/records/:id/provenance` | 获取字段级来源 | — | `{ fields: { [name]: ProvenanceDetail } }` |
| GET | `/api/v1/mirror/conflicts` | 获取冲突列表 | `?status=&entity_id=` | `{ conflicts: ConflictRecord[] }` |
| PUT | `/api/v1/mirror/conflicts/:id/resolve` | 处理冲突 | `{ chosen_value, reason }` | `ConflictRecord` |
| GET | `/api/v1/mirror/consents` | 获取同意列表 | `?student_id=` | `{ consents: ConsentRecord[] }` |
| POST | `/api/v1/mirror/consents` | 授予/更新同意 | `ConsentRecord (不含 id)` | `ConsentRecord` |

---

## UI 要求

### 数据源管理页 (`/admin/mirror/sources`)
- 列出所有已登记数据源，显示类型、状态、最近同步时间和授权状态
- 登记新数据源表单（系统类型、负责人、字段范围、刷新方式）
- 手动触发同步 + 查看同步历史
- 演示夹具标记：`demo_fixture` 数据源显式标注，不与正式源混淆

### 镜像浏览页 (`/mirror/browse`)
- 按学生/课程/学期浏览标准化数据
- 每个字段旁显示来源徽章（权威等级图标 + 获取时间）
- 新鲜度指示器：绿色（新鲜）/ 黄色（接近过期）/ 红色（已过期）
- 点击字段可查看完整来源链路

### 冲突处理页 (`/mirror/conflicts`)
- 列出所有未解决冲突
- 并排显示冲突值和来源
- 权威等级排序辅助决策
- 解决后记录原因和操作者

### 同意管理页 (`/settings/data-consent`)
- 学生查看已授权的数据源和用途
- 逐项授予/撤回同意
- 预览每个模块可看到的数据范围
- 导出个人数据 / 申请修正 / 删除非权威副本

---

## 验收标准

- [ ] 数据源登记后可通过适配器获取数据（或加载 fixture）
- [ ] 原始快照不可变，每次同步生成新快照
- [ ] 标准化记录的每个字段可追溯到来源系统、字段名、版本和获取时间
- [ ] 权威等级 6 级分类正确标注（authoritative → demo_fixture）
- [ ] 冲突检测：同一实体多源数据不一致时生成 ConflictRecord
- [ ] 冲突不静默覆盖，进入人工校对队列
- [ ] 同意管理：学生可授予/撤回同意，撤回后相关模块不再读取
- [ ] 用户可导出自己的镜像数据（JSON 格式）
- [ ] 审计日志追加式记录所有操作
- [ ] Demo Mode：使用 `demo_fixture` 数据源完整演示全流程
- [ ] P0/P1 不依赖真实学校账号或生产学生数据

---

## 依赖

- **无前置模块依赖**（数据基础层）
- 共享能力引用：X-02 来源与证据、X-03 事件与审计、X-05 同意与隐私、X-09 离线与降级、X-11 个人数据可携带

## 回退策略

| 如果 | 则 |
|------|-----|
| 真实 SIS/URP API 不可用 | 使用授权导出文件或手工 fixture |
| 数据库不可用 | SQLite 或 JSONL 文件存储 |
| 增量同步失败 | 保留上次可信快照，标记"同步中断" |
| 映射规则不确定 | 低置信映射进入人工校对队列 |
| 冲突无法自动解决 | 列出差异和权威顺序，等待人工确认 |
| 网络断开 | 使用本地缓存的上次有效快照 |

## 技术选型参考

- **后端：** Rust + Axum + Tokio（条件主选）或 FastAPI（回退）
- **数据库：** OceanBase MySQL mode + SQLite 回退
- **适配器接口：** trait-based，每个数据源实现 `DataSourceAdapter`
- **审计存储：** Append-only，与主库分离或同表带 `append_only` 约束

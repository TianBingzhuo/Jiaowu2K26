# 智课工坊 / SmartCourse Studio · AI 协作提示词

> **统一体验硬约束：** 任何界面工作必须先读 [DESIGN-SYSTEM](../../engineering/DESIGN-SYSTEM.md)，复用同一全局 Shell、Token、组件、图标、动效与 `Briefing → Choose → Execute → Replay → Next Move` 循环；本模块不得独立换肤。

> **稳定编号：** F001-01～F001-16 沿用 `SPEC.md` 的既有含义，禁止为了实现顺序重新编号或复用。

> **模块编号：** F-001 · **优先级：** P0（首个纵向切片）
> **实现前必读：** 本文件可独立解释业务，但动手前还必须读 [`ARCHITECTURE · 01 基座兼容性宪章`](../../engineering/ARCHITECTURE.md#01-基座兼容性宪章)、[`TECH-STACK`](../../engineering/TECH-STACK.md) 与 [`DESIGN-SYSTEM`](../../engineering/DESIGN-SYSTEM.md)。它们分别约束跨平台合同、现场选型与统一体验；本文件不能覆盖这些全局约束。

## 项目上下文（30 秒）

jiaowu2K26 是覆盖大学四到八年学习、选课、成长、协作与机会发现的体验层。智课工坊是首个 P0 模块——**可审核的 AI 教研流水线**：AI 必须亮出可定位来源，教师审核后才能发布，学生的学习过程随后可互动、复盘和改进。

## 本模块使命

让教师在不放弃控制权的前提下，把已有课程材料（PPT / 讲义 / 录播）快速转成可互动、可追溯、可复用的学习单元。

**一句话价值：** 每个 AI 生成结果都能回看它来自哪一页 PPT、哪一句老师口播，以及为什么会被标为考试重点。

---

## 角色与分工

### 产品设计
- 定义教师审核页和学生学习页的交互流程
- 编写验收标准和测试场景
- 准备 Demo 脚本和路演素材
- **缺省时 AI 补位：** 根据本文件中的用户故事和数据模型生成验收场景

### 前端
- 实现 4 个核心页面：材料上传页、教师审核页、学生学习页、Replay / Box Score 页
- 实现证据抽屉组件（展示 AI 生成内容的来源）
- **缺省时 AI 补位：** 根据下方数据模型和 API 合同生成 React + TypeScript 组件骨架

### 后端
- 实现 7 个 API 端点（见下方 API 合同）
- 实现来源追溯状态机：`material → draft → review → approved/rejected → published`
- 集成 AI 模型生成草稿（支持 fixture 回退）
- **缺省时 AI 补位：** 根据 API 合同生成 Rust/Axum 或 FastAPI 端点框架

### 宣发
- 截取关键操作页面制作路演素材
- 设计 Before / After 对比展示
- **缺省时 AI 补位：** AI 生成文案和视觉描述

---

## 核心交互流程

```
教师上传课程材料（PPT/PDF/录播链接）
  → 系统提取内容（ASR / PDF解析 / PPT解析）
  → AI 生成教学草稿（脚本 + 测验 + 知识点 + 复习卡）
  → 草稿附带来源定位（每个片段对应原始材料的哪个位置）
  → 教师在审核页编辑/通过/移除每个生成片段
  → 只有教师明确批准的版本可发布给学生
  → 学生学习互动内容，系统记录学习过程
  → 学生/教师查看 Replay（学习回放）和 Box Score（学习统计）
```

---

## 数据模型

所有 API 响应与持久化记录都须能关联 `schema_version`、稳定 ID、发行方/来源、权威级别和时间；可放在统一 Envelope 中，不能因当前只跑 Windows 而把平台路径或 UI 对象写入领域数据。未来 X-11 双归档依赖这些字段，详见 `SPEC.md` 第 12 节。

### Material（课程材料）

```json
{
  "id": "string (mat-xxx)",
  "course_id": "string",
  "title": "string",
  "type": "audio | video | slide | pdf | link",
  "file_url": "string | null",
  "file_hash": "string (sha256)",
  "file_size_bytes": "number",
  "rights_status": "authorized_demo | teacher_owned | licensed",
  "parse_status": "pending | processing | success | partial | failed",
  "parse_error": "string | null",
  "uploader_id": "string",
  "created_at": "ISO-8601",
  "expires_at": "ISO-8601 | null"
}
```

### SourceFragment（来源片段）

```json
{
  "id": "string (src-xxx)",
  "material_id": "string",
  "type": "slide | transcript | handout",
  "locator": "string (P.12 | 03:45-04:12 | text-span)",
  "text": "string",
  "source_version": "number",
  "rights_status": "authorized_demo | teacher_owned | licensed",
  "trust_level": "teacher_material | model_inferred | demo_fixture"
}
```

### GeneratedObject（生成对象 / 草稿项）

```json
{
  "id": "string (obj-xxx)",
  "material_id": "string",
  "type": "quiz | review_card | script | code_exercise",
  "title": "string",
  "generated_text": "string",
  "source_ids": ["string (src-xxx)"],
  "evidence_ids": ["string (ev-xxx)"],
  "generation_mode": "model | rule | fixture",
  "review_status": "draft | approved | removed",
  "published_version": "string | null",
  "risk_flags": ["string"],
  "teacher_review_hint": "string",
  "created_at": "ISO-8601",
  "updated_at": "ISO-8601"
}
```

### EvidenceItem（证据项）

```json
{
  "id": "string (ev-xxx)",
  "source_asset_id": "string",
  "source_ref": "string (文件路径#行号/定位)",
  "source_type": "transcript | slide | handout",
  "quote": "string (原文引用)",
  "summary": "string (证据摘要)",
  "confidence": "number (0-1)",
  "teacher_action": "accept | edit | reject | null"
}
```

### ExamSignalLink（考试信号链接）

```json
{
  "signal_id": "string (sig-xxx)",
  "priority": "S | A | B",
  "evidence_ids": ["string"],
  "feeds": ["string (生成对象 ID)"]
}
```

### ReviewEvent（审核事件，追加式审计日志）

```json
{
  "id": "string (rev-xxx)",
  "object_id": "string (obj-xxx)",
  "action": "edit | approve | remove | publish | withdraw",
  "actor_id": "string (teacher-xxx)",
  "timestamp": "ISO-8601",
  "reason": "string",
  "changes": { "before": {}, "after": {} }
}
```

### PublishedVersion（已发布版本）

```json
{
  "id": "string (pub-xxx)",
  "material_id": "string",
  "version": "number",
  "objects": ["string (obj-xxx，仅 approved)"],
  "published_by": "string (teacher-xxx)",
  "published_at": "ISO-8601",
  "scope": "class | public | demo"
}
```

### StudentInteraction（学生互动记录）

```json
{
  "id": "string (int-xxx)",
  "published_version_id": "string",
  "student_id": "string",
  "object_id": "string (obj-xxx)",
  "action": "view | answer | retry | challenge",
  "payload": { "answer_index": "number | null", "correct": "boolean | null", "time_spent_ms": "number" },
  "timestamp": "ISO-8601"
}
```

---

## API 合同

| 方法 | 路径 | 描述 | 请求体 | 响应体 |
|------|------|------|--------|--------|
| POST | `/api/v1/materials` | 上传课程材料 | `FormData { file, course_id, title, rights_status }` | `Material` |
| POST | `/api/v1/materials/:id/generate` | 触发 AI 生成草稿 | `{ mode: "model" \| "rule" \| "fixture", options?: {} }` | `{ draft_id: string, status: "processing" \| "ready" }` |
| GET | `/api/v1/drafts/:id` | 获取草稿及证据 | — | `{ objects: GeneratedObject[], evidence: EvidenceItem[], signals: ExamSignalLink[] }` |
| PUT | `/api/v1/drafts/:id/review` | 提交审核动作 | `{ actions: [{ object_id, action: "approve"\|"edit"\|"remove", changes?, reason? }] }` | `{ updated_objects: GeneratedObject[], events: ReviewEvent[] }` |
| POST | `/api/v1/drafts/:id/publish` | 发布已审核版本 | `{ scope: "class"\|"public"\|"demo" }` | `PublishedVersion` |
| GET | `/api/v1/published/:id` | 获取已发布内容 | — | `{ version: PublishedVersion, objects: GeneratedObject[] }` |
| GET | `/api/v1/published/:id/replay` | 获取学习回放数据 | — | `{ interactions: StudentInteraction[], timeline: [] }` |

### Demo Mode 快速接口（后端时间紧时使用）

| 方法 | 路径 | 描述 |
|------|------|------|
| GET | `/api/v1/demo/player-data` | 返回预生成的 PlayerData JSON |
| GET | `/api/v1/demo/script` | 返回预生成的 Script JSON |
| GET | `/api/v1/demo/quizzes` | 返回预生成的 Quiz JSON |
| GET | `/api/v1/demo/evidence-bundle` | 返回预生成的 EvidenceBundle JSON |
| PUT | `/api/v1/demo/script` | 保存教师修改（内存即可） |
| POST | `/api/v1/demo/approve` | 模拟审批，返回 `{ status: "ready" }` |

---

## Script / Quiz / PlayerData 合同

### Script JSON

```json
{
  "lesson_id": "bst-001",
  "title": "二叉搜索树的查找与插入",
  "subject": "computer_science",
  "duration_seconds": 360,
  "scenes": [
    {
      "id": "s1",
      "start": 0,
      "duration": 45,
      "narration": "二叉搜索树有一个核心规则：左子树更小，右子树更大。",
      "visual": { "template": "tree_build", "props": { "nodes": [8, 3, 10], "highlight": [8] } },
      "quiz_trigger": null
    }
  ]
}
```

### Quiz JSON

```json
{
  "quiz_id": "q1",
  "scene_id": "s2",
  "trigger_second": 95,
  "type": "single_choice",
  "question": "在二叉搜索树中，值 5 应该出现在根节点 8 的哪一侧？",
  "options": ["左侧", "右侧", "根节点", "无法判断"],
  "answer_index": 0,
  "explanation": "5 小于 8，因此查找或插入时先进入左子树。"
}
```

### PlayerData JSON

```json
{
  "lesson_id": "bst-001",
  "title": "二叉搜索树的查找与插入",
  "audio_url": "/demo/audio/bst-001.mp3",
  "scenes": [],
  "quizzes": [],
  "code_playground": {
    "enabled": true,
    "language": "python",
    "initial_code": "def insert(root, val):\n    pass",
    "expected_output": "inorder traversal is sorted"
  }
}
```

---

## UI 要求

### 材料上传页 (`/teacher/upload`)
- 拖拽上传区域（PPT / PDF / 音频 / 视频 / 链接）
- 上传进度条和预估剩余时间
- 文件状态：`pending → processing → success / partial / failed`
- 已上传材料列表，点击进入审核页
- 格式限制提示：MP3/WAV/MP4/PPTX/PDF，≤50MB

### 教师审核页 (`/teacher/review/:draftId`) — 核心页面
- **左侧：** AI 生成的教学草稿列表（脚本 / 测验 / 知识点 / 复习卡）
- **右侧：** 证据抽屉——点击"查看证据"后展示来源片段（原始引用、置信度、来源类型）
- 每个生成片段可单独操作：
  - **编辑**：修改文本，保存差异到 ReviewEvent
  - **通过**：标记 `approved`，记录操作者和时间
  - **移除**：标记 `removed`，保留原因，永不发布
- **考试信号 Badge：** S/A/B 级重点标识（老师口头重点、PPT 核心概念）
- **底部：** 批量操作（全部通过需二次确认 + 发布按钮）
- **不可逆保护：** 只有 `approved` 状态的对象可进入发布

### 学生学习页 (`/student/watch/:publishedId`)
- 互动式学习内容展示（脚本场景推进）
- 中途弹出测验题 + 提交 + 解析
- 轻量来源 Badge（"老师重点" / "来自PPT" / "来自口播"）
- 进度指示和代码练习区（可选）
- 学生端**不得**看到草稿、已移除内容或教师内部备注

### Replay / Box Score 页 (`/student/replay/:publishedId`)
- 学习过程时间线回放（每个互动事件按时间排列）
- 统计仪表盘：完成率、正确率、用时分布、薄弱知识点
- 学生只看自己的数据，不展示其他学生信息

---

## 审核状态机

```
         ┌─── edit ───┐
         │            ▼
material → draft → review → approved → published
                      │
                      ├── removed（保留原因，永不发布）
                      │
                      └── rejected（可重新生成）

withdraw: published → withdrawn（材料更新或教师撤回，旧版本标记受影响）
```

**关键不变量：**
1. 无可定位来源的 AI 对象不能进入审核
2. 只有 `approved` 的具体版本可发布
3. 审核、发布、撤回事件只追加，不覆盖历史
4. 模型的自报置信度不能代替证据强弱
5. 学生端不得看到草稿、已移除内容或教师内部备注

---

## 验收标准

- [ ] 材料上传后系统可提取内容（或使用 fixture 跳过）
- [ ] AI 草稿生成并附带至少 1 个可定位来源（EvidenceItem）
- [ ] 教师可逐片段编辑 / 通过 / 移除，每次操作产生 ReviewEvent
- [ ] 只有 `approved` 状态的版本可发布（状态机不可绕过）
- [ ] 学生可查看已发布内容并互动（至少完成 1 道测验）
- [ ] 学习过程可回放（Replay 时间线）
- [ ] 所有审核操作有追加式审计日志（ReviewEvent 只追加）
- [ ] Demo Mode 可用：断网时加载预生成数据完整演示

---

## 依赖

- **无前置模块依赖**（P0 首模块）
- 需要：AI 模型 API 可用（或 fixture 回退）
- 共享能力引用：X-02 来源与证据、X-03 事件与审计、X-08 可访问性、X-09 离线与降级

## 回退策略

| 如果 | 则 |
|------|-----|
| AI 模型不可用 | 使用预生成的 fixture 数据（`demo-pack/golden/`）演示 |
| 数据库不可用 | 使用 SQLite 或 JSONL 文件存储 |
| 网络断开 | PWA 离线模式 + 本地缓存 |
| 上传功能失败 | 使用预置的 Demo 材料（`source/bst_transcript.md` + `source/bst_slide_extract.json`） |
| ASR 不稳 | 使用预转写文本 `source/bst_transcript.md` |
| PPT 解析不稳 | 使用预提取结果 `source/bst_slide_extract.json` |
| 动画不稳 | 降级为图文动画（HTML/CSS 动效） |
| 代码沙箱不稳 | 展示参考答案和测试通过结果 |

## 技术选型参考

- **前端：** React + TypeScript + Vite，Design Tokens + Radix UI + Framer Motion
- **后端：** Rust + Axum + Tokio（条件主选）或 FastAPI（回退）
- **数据库：** OceanBase MySQL mode（条件主选）+ SQLite（强制回退）
- **AI 适配器：** Provider-neutral，现场确认 1 个赞助模型 + fixture 回退
- **文档提取：** Python worker（PDF/PPT/OCR/ASR）

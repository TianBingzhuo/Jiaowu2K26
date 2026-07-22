# jiaowu2K26 · 技术选型摘要

> **状态：赛前评估，未安装依赖、未创建工程、未部署数据库。**
> 本页是人类可读摘要；详细证据、赞助资源和机器数据位于 [tech-stacks/](tech-stacks/README.md)。
> 最后更新：2026-07-21。

## 选型目标

技术栈首先要在 AdventureX 72 小时内支持 jiaowu2K26 的首个 P0 纵向切片——智课工坊：

```text
课程材料
   ↓
可定位来源
   ↓
AI / 规则生成草稿
   ↓
教师查来源、改 / 过 / 删
   ↓
只发布已通过内容
   ↓
学生互动 + 来源回放 / Box Score
```

其他模块只能在不破坏这条闭环的前提下进入 P1/P2。

## 选型原则

1. **团队能现场掌控**：技术新颖不是价值，可调试、可交接、可回退才是。
2. **模块化单体优先**：72 小时内不用微服务增加部署和分布式调试面。
3. **领域合同不绑供应商**：UI、数据库、模型、OCR 和求解器通过适配器替换。
4. **主路径必须有可演示回退**：数据库、网络、模型或硬件失败时，P0 仍能跑通且诚实标注。
5. **开源优先但可审计**：不重造通用轮子，也不省略版本、许可证、哈希、安全和归属记录。
6. **前 6 小时做技术淘汰**：超时未通过的候选立即回退，不一边做 P0 一边换底座。

## 当前决策总表

| 层 | 当前候选 | 状态 | 采用闸门 | 回退 |
|---|---|---|---|---|
| 客户端 | React + Vite Web | 默认候选 | 团队熟悉；能快速完成审核状态和 2K 外壳 | Vue / 纯 Web 轻量方案 |
| Windows 客户端 | WinUI 3 | 条件 Secondary | Windows 审核台能提供明显路演价值，且不影响 Web/P0 | 仅使用 Web |
| 核心 API | Rust + Axum + Tokio 模块化单体 | **条件主选** | 有 Rust 负责人；6h 内通过写入、查询、审核迁移和前端调用 | FastAPI / Node 等团队熟悉的单 API |
| 主数据层 | OceanBase MySQL 模式 + SQLx | **条件主选** | 账号/网络可用；schema migration、事务、查询与 SQLx 小样通过 | SQLite / JSONL + 相同 repository 接口 |
| 对象/文件 | 本地文件或已确认对象存储 | 待资源确认 | 有权使用；网络、配额和删除流程可用 | 本地受控目录 |
| AI / 模型 | 一个现场确认的主模型 + provider 接口 | 待赞助权益确认 | 结构化输出、来源 ID、额度、数据条款与延迟通过 | 规则/预制回退数据，明示非实时 AI |
| 个人选课求解 | SAT / MaxSAT backend | P1/P2 候选 | P0 已稳定；小数据集上能输出解释和无解原因 | 确定性启发式 |
| 机构排课求解 | CP-SAT / 通用约束优化 | P2 候选 | 有真实时间/资源约束与足够时间；不影响 P0 | 不进本届或输出 best-feasible |

以上“主选”均是赛前决策基线，不代表已实现或现场必须不变。

## 目标软件架构

```text
React + Vite Web
  └─ 条件式 WinUI 3 审核/演示台
                 ↓
        Rust API 模块化单体
  ┌─ SmartCourse：来源、生成、审核、发布
  ├─ MyCareer：赛季、课程、阵容与反馈事件
  ├─ Academic Mirror：外部教务数据镜像与权威标记
  ├─ Semester Resolver：规格、约束、优化、解释与事务
  ├─ Providers：模型、OCR、存储、SIS/LMS 与求解器适配器
  └─ Audit：审核、发布、开源归属与运行证据
                 ↓
 OceanBase MySQL 模式 ⇄ SQLite / JSONL 回退
```

详细模块、不变量、Academic Mirror 和 Semester Resolver 见 [CORE-ARCHITECTURE.md](tech-stacks/CORE-ARCHITECTURE.md)。

## 最小领域合同

### SmartCourse

```json
{
  "source_fragment": {
    "id": "src-001",
    "material_id": "lec-01",
    "type": "slide | transcript | handout",
    "locator": "P.12 | 03:45-04:12 | text-span",
    "text": "...",
    "source_version": 1
  },
  "generated_object": {
    "id": "obj-001",
    "type": "quiz | review_card | script",
    "source_ids": ["src-001"],
    "review_status": "draft | approved | removed",
    "published": false
  },
  "review_event": {
    "object_id": "obj-001",
    "action": "edit | approve | remove | publish",
    "timestamp": "ISO-8601",
    "reviewer": "teacher-01",
    "changes": {}
  }
}
```

不变量：无来源对象不能进入审核；未通过对象不能发布；审核事件追加而不覆盖历史。

### Academic Mirror

```text
source_system  external_id  source_version
fetched_at     effective_at authority_level
raw_reference  normalized_payload
```

镜像数据必须可回到原始系统，并明确它是缓存、手工导入、测试样例还是权威记录。

### Semester Resolver

```text
CourseSpec + SemesterPrefix + Pins + Catalog Index
                         ↓
                    候选缩减
                         ↓
       依赖 + 硬冲突 + 软偏好 + 目标函数
                         ↓
       候选最终状态 + 不可满足原因
                         ↓
          diff + transaction + semester.lock
```

Conda 提供思想和语义来源，不是已选的代码依赖；个人选课与机构排课必须分开建模。

## 开赛后前 6 小时闸门

1. 团队有明确的前端、后端、产品/测试负责人；
2. 主栈能完成一次真实写入、查询、状态迁移和 UI 调用；
3. OceanBase + SQLx 完成 migration、事务提交/回滚和关键查询，否则切 SQLite；
4. 主模型按 schema 输出并保留 source IDs，否则使用规则/预制数据跑通真实审核状态机；
5. 每个直接开源依赖已记录上游、版本、许可证与用途；
6. 第 4 小时仍无法跑通的主路径，必须在第 6 小时前回退。

## 开源复用政策

开源候选、官方上游、许可证、复用方式与当前状态统一登记在 [OPEN-SOURCE-REUSE.md](tech-stacks/OPEN-SOURCE-REUSE.md)。

现场选定一个依赖后，至少记录：

- 上游仓库与 package 源；
- 精确版本 / commit 与可用哈希；
- SPDX 许可证、NOTICE 和传递依赖；
- 复用类型（直接依赖 / 改写片段 / 只参考）；
- 本地修改、安全检查、赛事规则核对和回退。

openSIS、Frappe Education、Gibbon 与 OpenEduCat 已加入“领域参考”清单，但没有被选为本届底座，也没有下载或安装。它们帮助校准学生、课程、培养项目、注册、课表和权限等对象边界；权威系统与体验层判断见 [SIS / URP / UArizona 调研](research/SIS-URP-UARIZONA.md)。

## 详细文档

- [CORE-ARCHITECTURE.md](tech-stacks/CORE-ARCHITECTURE.md) — Rust、OceanBase、Academic Mirror 与 Semester Resolver；
- [OPEN-SOURCE-REUSE.md](tech-stacks/OPEN-SOURCE-REUSE.md) — 开源项目复用、许可与归属；
- [ADVENTUREX-WINUI3-ASSESSMENT.md](tech-stacks/ADVENTUREX-WINUI3-ASSESSMENT.md) — WinUI 3 条件评估；
- [COMBINATION-PLAYBOOK.md](tech-stacks/COMBINATION-PLAYBOOK.md) — 赞助技术组合、主备路径；
- [EVALUATION.md](tech-stacks/EVALUATION.md) — 硬门槛与评分方法；
- [SPONSOR-MATRIX.md](tech-stacks/SPONSOR-MATRIX.md) — 赞助资源横向对比；
- [SOURCE-INVENTORY.md](tech-stacks/SOURCE-INVENTORY.md) 与 [WEBSITE-AUDIT.md](tech-stacks/WEBSITE-AUDIT.md) — 原始链接和官方站点证据；
- [SIS-URP-UARIZONA.md](research/SIS-URP-UARIZONA.md) — UArizona、URP、开源教务与授权集成边界；
- [catalog.json](tech-stacks/catalog.json) — AI 可直接读取的技术目录。

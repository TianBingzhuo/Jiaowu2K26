# 2026-07-17 材料重构记录

## 最终范围

本次只做信息架构与合规整理：将原目录中 39 个分散文件重组为 8 个清晰入口，原材料统一归档，不为 AdventureX 提前构建产品。

## 8 个入口

1. `README.md`：总览与合规边界；
2. `QUICKSTART.md`：正式开赛后的开工清单；
3. `docs/`：产品、目标 Demo、现场构建和证据文档；
4. `data/`：正式开赛后再创建的输入、输出与评测入口；
5. `pitch/`：故事线与现场制作清单；
6. `design/`：视觉原则与现场设计待办；
7. `submission/`：报名、规则和提交检查；
8. `archive/`：原始散稿、旧 PPT、旧原型和历史赛道表。

## 原材料去向

- 原始 Markdown、旧 PPT、架构图、用户旅程 HTML、2025 赛道表：`archive/original-materials/`；
- 重构前已有的静态教师审核/证据页面：`archive/legacy-prototypes/`；
- 原 `demo-pack/source`、`golden` 和 `metrics`：`archive/original-materials/demo-pack/`。

这些只是移动和归类，未把历史材料升级为本届成果。

## 纠偏记录

曾因误解需求而生成了一套可运行前端、构建产物、截图、QA、新路演 PPT、输出压缩包和工作草稿。得知官方禁止提前完成大部分项目、复用或扩展旧项目，并收到用户明确的“赛前不构建”要求后，已立即停止服务，并将上述误生成内容全部移入 Windows 回收站；它们不再位于项目目录或工作区，可从回收站恢复但不应继续使用。

保留文档中的“已实现”“已验证”“当前原型”等措辞也已改为产品假设、目标故事板或现场计划。

## 完整备份

重构前完整备份：

[黑客松_backup_before_overhaul_20260717.zip](../黑客松_backup_before_overhaul_20260717.zip)

SHA-256：`5126E4C5E4AEC5AFC8F52F66A41E003141A6F05E2E8EF3ADD6B3887BC2CE769C`

该备份当前位于项目根目录；2026-07-21 已重新核对文件存在且 SHA-256 与上值一致。它用于回滚和核对原始 39 份材料，不作为本届参赛构建成果。

## 2026-07-20 项目层级与交接重构

### 触发原因

项目最初以“智课工坊”为主要想法，后续已演进为完整的 `jiaowu2K26` 愿景。部分当前文档仍把 `SmartCourse Studio` 与 `jiaowu2K26` 并列或等同，使新协作者和其他 AI 容易误判项目边界。

### 纠正后的唯一层级

- `jiaowu2K26`：唯一总项目，定位为大学生活与学习的 NBA 2K 式 MyCareer 体验层；
- `智课工坊 / SmartCourse Studio`：最初想法，现为首个 P0 纵向切片；
- `Academic Mirror`、`Semester Environment Resolver`、`World Exam Finals` 等：总项目下的共享基础或 P1/P2 模块。

### 新增的交接与证据入口

- `docs/AI-HANDOFF.md`：跨 AI / 跨会话的 5 分钟交接主线；
- `docs/PROJECT-MANIFEST.json`：机器可读的项目身份、模块、优先级和文档地图；
- `docs/DECISIONS.md`：产品、架构、开源和交接决策日志；
- `docs/tech-stacks/CORE-ARCHITECTURE.md`：Rust、OceanBase、Academic Mirror 与 Conda 式学期求解架构；
- `docs/tech-stacks/OPEN-SOURCE-REUSE.md`：开源上游、许可证、复用类型、采用闸门与归属模板。

### 历史保留原则

`archive/` 中的旧智课工坊文档保留原名与原文，用于追溯项目演进；不通过批量改写历史材料来制造“项目一开始就是现在定义”的错觉。当前事实以根 README、`docs/PROJECT.md`、`docs/DECISIONS.md` 和主题文档为准。

### 合规状态

本轮仍只修改 Markdown / JSON 规划与索引文档；没有创建功能代码、安装依赖、启动服务、部署数据库、生成新 Demo 或制作本届路演成品。

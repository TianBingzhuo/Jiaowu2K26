# AI 交接 · jiaowu2K26

> **先读本页，不要从 archive 或旧对话猜当前定义。**
> 当前日期：2026-07-21。状态：AdventureX 赛前研究/规格；没有功能代码、可运行原型、本届 Demo、数据库、模型调用或新引擎安装。

## 30 秒理解

jiaowu2K26 把大学四到八年的学习、选课、成长与协作重构成 MyCareer 式生涯：学期是赛季，课程是阵容，选择有依据，进步能回放。智课工坊是最初想法和首个 P0：课程材料 → 可定位来源 → AI/规则草稿 → 教师修改/通过/移除 → 只发布已批准内容 → 学生互动与 Replay。

## 当前只有 8 个主入口

1. [README](../README.md) — 唯一人类入口、状态与导航；
2. [PRODUCT.md](PRODUCT.md) — F-001 至 F-009 的详细产品规格；
3. [ENGINEERING.md](ENGINEERING.md) — 待审核技术栈、架构、Unity/Unreal、DRM；
4. [RESEARCH.md](RESEARCH.md) — 规则、SIS/URP/UArizona、NBA 2K、赞助与证据；
5. [PLAYBOOK.md](PLAYBOOK.md) — 合规、72h、测试、路演、提交和决策；
6. 本页 — 当前状态和下一步；
7. [PROJECT-MANIFEST.json](PROJECT-MANIFEST.json) — 项目、模块与状态机器清单；
8. [CATALOG.json](CATALOG.json) — 技术、赞助候选与本地参考库机器目录。

2026-07-21 之前的当前文档已原样移动到 `archive/superseded-current-20260721/`，并有逐文件哈希清单；`archive/original-materials/` 更早的历史材料未改写。归档能补细节和追溯演进，但不覆盖上述主线。

## 不可再混淆

- **总项目：**jiaowu2K26；
- **首个 P0：**智课工坊，不是另一个并列项目；
- **产品边界：**SIS / URP / LMS 上的体验层，不重建权威系统；
- **2K 边界：**借通用机制和信息架构，不复制品牌、画面、音乐、卡面或文案；
- **Conda 边界：**借 specs/pins/dependencies/diff/transaction/lockfile 语义，不直接把 Conda/libsolv 代码硬套到全校排课；
- **当前状态：**规格完成不等于功能实现。

## 比赛边界

- 开幕式：2026-07-22 19:00–22:30；结束后正式 Hacking；
- 团队 2–4 人；且只能选 1 个主题、1–6 个赛道；
- 提交 07-25 12:00 开放，07-26 01:00 截止；
- 本项目自愿保持赛前纯文档：不要创建代码仓、项目、原型、模型链、数据库或构建；
- 正式开赛后必须新建仓库和空白基线；
- 历史材料、供应商 Demo 和参考图不能称为本届成果；
- AI 可辅助部分编码，但不能完成全部代码，队员需能解释/修改。

## P0 与停损线

P0 只做：

```text
F-002 轻量赛季/课程入口
      ↓
F-001 来源 → 草稿 → 教师审核 → 发布门禁 → 学生互动 → Replay
```

第 36 小时主闭环仍不稳定，就暂停 Academic Mirror 扩展、求解器、World Exam Finals、Opportunity Market、硬件、WinUI、Unity/Unreal 和视觉精修。

P0 稳定后 P1 最多选一个：F-003 小样镜像、F-004 个人 Roster Lab、F-005 回放、F-009 透明资格匹配。

## 待用户审核的技术提案

- Primary 客户端：React + TypeScript + Vite Web/PWA；
- 条件后端：Rust + Axum + Tokio 模块化单体；6h 未通过回退 FastAPI 或 Node/Fastify 中团队最熟悉的一种；
- 条件主库：OceanBase MySQL mode + SQLx；SQLite 强制回退；
- 文档/OCR：仅在生态有明显优势时使用 Python worker；
- AI：一个当场确认的赞助模型，通过 provider adapter；
- Resolver：个人 SAT/MaxSAT 候选，机构 OR-Tools CP-SAT，确定性启发式回退；
- WinUI 3：只作 Windows 教师审核/控制台 Secondary；
- Unity：本机已有 6000.3.17f1，只作 P2/展会外壳；
- Unreal：最新是 UE 5.8，不是 UE6；P0 不合适，当前未安装、也不要擅自安装；
- NBA 2K：当前不需购买；若未来购买只做人工作流观察，不绕过 DRM/反作弊。

用户尚未批准上述组合，不得把“提案”写成“已选技术”。

## 当前本机/外部资料

- 机器：i7-13700H、约 64GB RAM、RTX 4070 Laptop 8188 MiB VRAM；
- Unity/Hub 与 VS Native Game workload 已存在；Epic Launcher/Unreal/Steam 未发现；
- NBA 2K 官方界面研究库：`D:\10451\Users\10451\Downloads\NBA2K-Design-Reference\`，30 张图 + 来源/哈希；只作内部研究；
- WinUI 3 参考库：`D:\10451\Users\10451\Downloads\WinUI3-Reference\`；
- Qoder 独立转移信封：`D:\10451\Users\10451\Downloads\jiaowu2K26-Qoder-Handoff.md`，用于介绍机器环境、junction、赛事红线、八入口、技术提案与接管协议；它不是第九个主入口；
- 飞书组队终稿：`D:\10451\Desktop\jiaowu2K26_飞书组队帖_终稿.txt`，SHA-256 `1EA8FE68007954E84F010DA660AD2D619D8B3631C5601C9B8375ACEB4B50D1E4`；不得擅自发布；
- 两份地瓜 PDF 的旧路径当前缺失，原字节/哈希在 [RESEARCH.md](RESEARCH.md) 与 [CATALOG.json](CATALOG.json)；重新提供后再复核。

## 路径规则

- 项目遍历统一用 `D:\10451\Desktop\黑客松`；
- `D:\10451` 是指向 C 盘的批准 junction，当前可写；
- 不向 D 盘其他非 junction 路径写入；
- C 路径、`D:\10451`、`D:\DiskC` 可能指向同一文件，一次任务只用一个根遍历/哈希/同步；
- 工具若对 reparse point 不兼容，可整项切换到等效 C 路径，但不能混合结果。

## 采用外部内容的记录

任何代码、模型、数据、字体、图标、截图或示例进入现场仓库前，记录官方上游、精确版本/commit、URL、SHA（如适用）、SPDX/NOTICE、传递依赖、复用方式、本地修改、安全检查、赛事规则和回退。NBA 2K 截图不可进入产品资产。

## 下一步

1. 等用户审核 [ENGINEERING.md](ENGINEERING.md) 中五项技术决策；
2. 07-22 开幕式后保存主题、赛道、精确赞助权益和开始时间；
3. 正式开始后创建全新仓库，按 [PLAYBOOK.md](PLAYBOOK.md) 的第一小时和 6h Gate 执行；
4. 将实际采用/拒绝、版本、提交、测试和失败立即同步到本页、Manifest、Catalog 与对应主文档；
5. 不从归档恢复旧原型或误生成构建。

## 交接更新协议

每次形成成熟结论：先改主题主文档 → 更新 `PROJECT-MANIFEST.json`/`CATALOG.json` → 更新本页“当前状态/下一步”。旧内容若需保留，移动到日期归档并生成哈希，不在多个主文件复制形成竞争事实源。

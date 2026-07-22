# 赞助技术栈决策中心

> 状态：赛前研究资料。这里不放功能代码、SDK、系统镜像、模型、构建产物或可运行 Demo。

这个目录把各赞助方的硬件、软件、额度、赛道要求和现场支持，以及非赞助基础栈与开源候选，统一成同一种结构，让人和 AI 都能快速回答四个问题：

1. 哪个技术栈最适合 jiaowu2K26 的当前优先模块？
2. 哪个组合能在 AdventureX 现场 72 小时内可靠落地？
3. 哪些资源适合智课工坊 P0、某一个 P1 或故障回退？
4. 哪些开源项目能直接依赖、只能借鉴，哪些已明确不复用代码？

## 目录结构

```text
tech-stacks/
├─ README.md                 使用说明与决策流程
├─ EVALUATION.md             硬门槛、评分维度和输出格式
├─ SPONSOR-INTAKE.md         官方赞助清单导入模板
├─ SOURCE-INVENTORY.md       RTF 原始链接、关系分类与证据层级
├─ WEBSITE-AUDIT.md          官方站点逐项核验记录
├─ SPONSOR-MATRIX.md         赞助与技术资源横向对比
├─ COMBINATION-PLAYBOOK.md   可组合方案、主备路径与触发条件
├─ CORE-ARCHITECTURE.md      Rust、OceanBase、Academic Mirror 与学期求解架构
├─ OPEN-SOURCE-REUSE.md      开源上游、许可证、复用方式与审计模板
├─ ADVENTUREX-WINUI3-ASSESSMENT.md
│                            WinUI 的赛事定位、条件评分与使用闸门
├─ catalog.json              AI 可直接读取的标准化技术栈目录
├─ vendors/
│  └─ d-robotics.md          地瓜机器人首份技术栈档案
└─ downloads/
   ├─ README.md              下载与合规策略
   └─ manifest.json          可审计下载队列
```

## 非赞助基础技术评估

### 核心软件与求解架构

已将讨论成熟的技术方向归档为带闸门的赛前候选：

- [核心软件与求解架构](CORE-ARCHITECTURE.md)：Rust + Axum + Tokio 模块化单体、OceanBase + SQLx 条件主存储、Academic Mirror，以及 Conda 式 Semester Environment Resolver；
- [开源项目复用登记](OPEN-SOURCE-REUSE.md)：直接依赖、组件参考、思想借鉴和不复用代码的边界。

这两份文档的“主选”是赛前决策基线，不表示已安装或已实现；开赛后仍要用首个 6 小时通过小样或回退。

### WinUI 3

WinUI 3 不是当前赞助权益条目，但可以作为 Windows 主机端教师审核与演示控制台候选：

- 黑客松内的赛事判断：[WinUI 3 条件评估](ADVENTUREX-WINUI3-ASSESSMENT.md)；
- 独立下载参考库：[WinUI 3 总指南](D:/10451/Users/10451/Downloads/WinUI3-Reference/GUIDE.md)；
- 精确源码证据：[机器清单](D:/10451/Users/10451/Downloads/WinUI3-Reference/SOURCE-MANIFEST.json)。

本目录只保存评估评论，不复制 WinUI 源码、SDK、依赖或构建产物。两边的同名评估文件是有意维护的独立镜像，更新时按 Mirror ID 与 SHA-256 同步；不要把它与 C/D junction 路径别名混淆。

## 工作流

### 1. 原样收录

收到官方赞助清单后，先保留原文、来源、发布日期和接收时间，不急着解读或下载。

### 2. 标准化

把每个赞助方整理为相同字段：

- 精确硬件型号、数量、内存和随附配件；
- SDK、系统、模型、API、Credit 和账号要求；
- 可领取时间、归还方式和现场技术支持；
- 赛道要求、评审偏好、许可证与使用限制；
- 与 jiaowu2K26 具体模块及 P0/P1 的对应关系；
- 未知项、风险、替代方案和证据链接。

### 3. 先过硬门槛

任何技术栈若不满足规则允许、资源可获得、许可证可接受、现场可启动等条件，就不能作为 P0 主路径；评分再高也只能作为候选或回退。

### 4. 再做统一评分

按 [EVALUATION.md](EVALUATION.md) 的 100 分量表评分，同时标注证据置信度。缺失信息不猜测，统一记为 `unknown`。

### 5. 输出决策

每轮评估都应给出：

- **Primary**：现场主技术栈；
- **Secondary**：明确触发条件下使用的增强栈；
- **Fallback**：断网、硬件不足或模型失败时的回退；
- **Rejected for P0**：不适合本届 P0 的选项及原因；
- **First 6 Hours**：开赛后最先验证的五件事。

### 6. 最后才下载

只有板型、规则、许可证、用途和版本都明确后，才按 `downloads/manifest.json` 执行下载。所有文件记录来源、版本、哈希、大小、下载时间和用途。

## 合规边界

- 赛前可以整理公开信息、规格、规则和决策问题；
- 赛前不把供应商示例拼成可运行参赛项目；
- SDK、镜像、模型和示例代码是否可提前下载，以 AdventureX 最新规则和主办方解释为准；
- 正式开赛后创建的代码、数据、截图和评测证据进入现场仓库，不混入本目录；
- 对外只陈述有官方来源或现场验证支持的结论。

## 当前状态

- 已建立地瓜机器人 RDK 生态档案；
- 已提取并核验 `Adventure X.rtf` 的 26 个唯一链接，形成 23 个标准化技术栈条目；
- 已记录 AdventureX 官网可确认的赞助、技术支持与免费硬件信息；
- 已补充 WinUI 3 非赞助基础栈评估，目前定位为有条件的 Secondary 候选；
- 已补充 Rust / OceanBase / Conda 式学期求解架构，并明确智课工坊为 jiaowu2K26 的 P0 模块；
- 已建立 React、Vite、Rust、Axum、Tokio、SQLx、OceanBase、OR-Tools、Conda、libsolv 与 WinUI 参考项目的开源复用登记；
- 已研究 UArizona、URP、openSIS、Frappe Education、Gibbon 与 OpenEduCat，并将其限定为权威层/领域模型参考，见 [SIS / URP / UArizona 调研](../research/SIS-URP-UARIZONA.md)；
- 已于 2026-07-21 阅读公开终极指南并纠正赛事基线：且只能选择 1 个主题、1–6 个赛道；软件支持图片卡片已纳入权益快照；
- 地瓜具体赞助板型、数量、配件和领用方式仍为 `unknown`；
- 等待 07-22 晚开幕式公布主题、赛道详细要求、额外文书与现场领取方式后，再进行最终排名。

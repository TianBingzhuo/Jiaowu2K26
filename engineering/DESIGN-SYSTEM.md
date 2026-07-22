# jiaowu2K26 · 视觉设计规范 / Design System

> **状态：** 用户已确认“全模块统一游戏化”方向；具体实现仍待团队审核，开赛后只有通过 GATE-1/GATE-2 的部分才进入实现。
> **核心原则：** 让学生愿意打开，同时让来源、状态与下一步比装饰更清楚。
> **红线：** 不使用 NBA/2K/ESPN 品牌、截图、卡面、字体、音乐。
> **资产来源：** 优先采用许可证清楚的现成资源，缺口再用 AI 原创；不预设无法验证的比例。
>
> 历史完整白名单原路径为 `D:\10451\Desktop\jiaowu2K26_美术资产白名单与缺口表.md`，但 2026-07-22 复核时文件已缺失，当前不得依赖。海报 Brief 已并入 `reference/PITCH-COPY.md`；正式开赛后采用任何资产时，重新登记来源、版本、许可证和哈希。
> **更新时间：** 2026-07-22

---

## 1. 设计哲学

### 从 2K 借什么

| 借 | 不借 |
|---|---|
| 深色基底 + 高对比数据面板 | 球队/球员/联盟 Logo |
| 卡片式信息架构（课程 = 球员卡） | 2K 卡面设计/稀有度视觉 |
| 运动感排版（粗体、窄体、大写数据） | 2K 具体字体（如 2K 定制体） |
| 赛季进度条 + 倒计时节奏感 | 付费加速/稀缺闪烁 |
| Replay 回放 + Box Score 统计面板 | 公开排名天梯视觉 |
| 状态转场动效（短、有力、可跳过） | 强制观看的长动画 |
| 一屏一主任务的焦点设计 | 过多菜单层级和认知过载 |

### 三条设计铁律

1. **来源比装饰更醒目** — 证据链、审核状态、来源 Badge 的视觉优先级 > 背景图/动效
2. **状态不靠颜色 alone** — 每个状态同时有文字标签 + 图标/形状 + 颜色
3. **动效服务理解，不服务炫技** — 3-8 秒、可跳过、`prefers-reduced-motion` 时静态

### “一个游戏世界”硬约束

整个 jiaowu2K26 只能有一套视觉世界。学生 MyCareer、教师 Coach Studio、学校 Front Office 不是三个主题，也不是普通教务页外面套一个游戏首页；它们必须共享：

- 同一全局 Shell、导航位置、页面网格和信息层级
- 同一色板、字体、间距、圆角、边框、光效和响应式规则
- 同一 Fluent 图标粗细、同一原创 Key Art 风格、同一摄影/插画处理方式
- 同一动效时长、缓动、转场语法、音效规范和减少动效行为
- 同一状态词典：`live / cached / fixture / simulation / pending / approved / expired`
- 同一核心循环：`Briefing → Choose → Execute → Replay → Next Move`

模块只能通过**正式模块名、固定图标、内容对象和数据结构**区分，不得新增模块私有色板、字体、卡片形状、插画画风、动效曲线或“临时后台模板”。哪怕某个模块只做一页，也要像从同一款游戏里打开，而不是另一个产品跳转回来。

### 三种 Role Lens

| Lens | 同一世界中的称呼 | 信息密度 | 主任务 | 不允许的差异 |
|---|---|---|---|---|
| Student | MyCareer | 中等、行动优先 | 学习、规划、校园生活与本人权益 | 不能靠更花哨的皮肤掩盖来源/正式状态 |
| Faculty | Coach Studio | 中高、审核优先 | 教学、科研、指导与证据档案 | 不能退回通用 SaaS 管理后台 |
| Institution | Front Office | 高密度、决策优先 | 资源、服务、政策模拟与治理 | 不能另造 BI 风格或把人压成排名榜 |

Role Lens 只改变默认首页、可见任务、权限和信息密度。顶部身份、赛季上下文、状态/来源、通知、证据抽屉、Replay、搜索和帮助保持同构，用户跨角色时仍能凭肌肉记忆操作。

### 统一页面骨架

每个页面必须按同一顺序回答五个问题：

1. **我在哪个赛季 / 角色 / 模块？** — 全局 Shell 与上下文条。
2. **当前最重要的正式状态是什么？** — 明文状态 + 来源 + 更新时间。
3. **我现在可以做什么？** — 一个主行动，次行动降级。
4. **为什么这样建议或限制？** — Evidence Drawer / Rule Drawer。
5. **做完后发生了什么、下一步是什么？** — Replay / Box Score / Next Move。

### 游戏启动屏式主视觉语法

首轮海报实测证明，“裂开的旧系统 + 控制器 + 发光流程线”虽然有概念感，却会被理解成赛博教育中台。默认主视觉改用**原创大学生涯模式启动屏**：

1. **Hero Avatar：** 一名虚构学生占据明确英雄位，姿态体现“进入新赛季”，不使用真实人物、球队或校服标识。
2. **Campus Arena：** 把讲堂、校园大厅、实验室和研究展示融合成冠军赛场式空间；它是大学世界，不是篮球场。
3. **Broadcast HUD：** 只保留项目名、当前赛季、一个状态读数、一个主行动和 3–4 个一级入口，形成可操作感。
4. **Evidence in the World：** 来源、审核、Replay 和课程阵容作为真实信息面板出现，不用抽象节点图代替产品语义。
5. **One Screen, One Match Objective：** 一屏只突出一个当前目标；次行动退入底部导航或 Evidence Drawer。
6. **Contextual Action Rail：** 同一操作槽随角色和当前对象改变动作，但始终显示动词文字、结果和权限，不能只换一个猜不懂的图标。

当前方向样张：[jiaowu2k26-career-mode-concept-v1.png](../reference/assets/jiaowu2k26-career-mode-concept-v1.png)（972×1619，SHA-256 21C86D33ED89BB802D2376E1213EB960366624F9AB456A9A529220AB9D2FA2F4）。它是赛前概念视觉，不是实机截图；成功之处是英雄位、赛季牌、课程选秀板、OVR 98.6°F 和底部菜单，不能把其临时微文案或具体版式直接当组件规范。可复现 Prompt 与使用边界见 reference/PITCH-COPY.md。

A4 软件功能全景第一页：[jiaowu2k26-a4-software-universe-map-v1.png](../reference/assets/jiaowu2k26-a4-software-universe-map-v1.png)（2480×3508，A4 300 DPI 像素规格，SHA-256 7E270F94B77618FACE5E5C873CF2CC7B9E916765874ECD21239213CA76A9A3B2）。它以“P0 六步可信闭环 → 学生 / 教师 / 学校三种 Role Lens → F-001～F-014 全景 → 六项游戏语法 → 范围与权威边界”解释完整软件核心；所有正式文字均为确定性叠加，不能把长期地图误读为本届实现清单。

A4 岗位速配第二页：[jiaowu2k26-a4-explainer-role-map-v1.png](../reference/assets/jiaowu2k26-a4-explainer-role-map-v1.png)（2480×3508，A4 300 DPI 像素规格，SHA-256 F6E1CFE81D4CF143442EDE09905412A8497B686255671C3A0AE8E07E4C41F877）。它把同一世界观压成“Hero → P0 六步可信闭环 → 四类主岗位 → 加入 CTA”的单页层级；底图由 ImageGen 生成，全部正式文字确定性叠加，因此可作为后续招募说明页的信息密度基准，但仍不是产品截图或现场成果。

**明确避免：** 巨型控制器、裂墙传送门、泛化工作流拓扑、廉价全息悬浮窗、满屏微小数据、蓝紫赛博朋克、真实体育品牌以及对任何一代 2K 封面/菜单的逐像素模仿。

### 叙事与可访问模式

| 模式 | 文案与动效 | 信息与视觉完成度 |
|---|---|---|
| 沉浸 | 完整赛季/赛事语言、短转场和原创音效 | 100%，默认体验 |
| 轻量 | 减少隐喻和庆祝，保留统一壳与组件 | 100% |
| 传统 | 正式术语优先，游戏名称作次标签 | 100%，不是简陋后台 |
| 减少动效 | 静态状态替代位移动画，可关闭声音 | 100% |

用户可以降低叙事强度，但不能因为选择传统或无障碍模式而获得次等界面。

所有模式还共享“注意力预算”：非紧急通知默认汇总，进入专注任务后不弹营销/成就打断；声音可单独关闭并有字幕/视觉等价；信息密度可在舒适与紧凑之间调整，但来源、正式状态、风险和下一步不可被隐藏。

---

## 2. 色彩系统

### 主色板（深色主题）

```css
/* 基底 */
--color-bg-primary: #0D1117;      /* 主背景：接近纯黑的深蓝 */
--color-bg-secondary: #161B22;    /* 面板/卡片背景 */
--color-bg-tertiary: #21262D;     /* 悬浮/选中/输入框背景 */
--color-bg-elevated: #2D333B;     /* 弹窗/抽屉/证据面板 */

/* 文字 */
--color-text-primary: #F0F6FC;    /* 主文字：高对比白 */
--color-text-secondary: #8B949E;  /* 次要文字/说明 */
--color-text-muted: #484F58;      /* 禁用/占位 */

/* 强调 */
--color-accent-primary: #F78C1A;  /* 主强调：信号橙（行动按钮、选中态） */
--color-accent-secondary: #58A6FF; /* 次强调：信息蓝（链接、来源标记） */
--color-accent-gold: #D4A843;     /* 成就/里程碑/赛季颁奖 */

/* 状态 */
--color-status-approved: #3FB950; /* 已通过/已掌握 */
--color-status-pending: #D29922;  /* 待审核/待加强 */
--color-status-removed: #F85149;  /* 已移除/需关注 */
--color-status-draft: #8B949E;    /* 草稿/未触碰 */
--color-status-live: #3FB950;     /* 实时数据 */
--color-status-cached: #D29922;   /* 缓存/快照 */
--color-status-fixture: #A371F7;  /* 演示样例/虚构数据 */

/* 边框与分割 */
--color-border: #30363D;
--color-border-focus: #F78C1A;
```

### 对比度要求

- 正文文字与背景：≥ 7:1（WCAG AAA）
- 次要文字与背景：≥ 4.5:1（WCAG AA）
- 状态色块上的文字：≥ 4.5:1
- **颜色不是唯一编码**：每个状态同时有图标 + 文字标签

### 知识热区图色板

```css
--zone-mastered: #238636;   /* 绿：正确率 > 80% */
--zone-developing: #9E6A03; /* 黄：50-80% */
--zone-unexplored: #21262D; /* 灰：未触碰 */
--zone-attention: #DA3633;  /* 红：< 50%（配合"待探索"文字，不制造焦虑） */
```

---

## 3. 字体系统

### 字体选择

| 用途 | 字体 | 来源 | 许可证 |
|---|---|---|---|
| 英文数据标题/数字 | **Barlow Condensed** (Bold/ SemiBold) | Google Fonts | SIL OFL |
| 英文正文 | **Inter** (Regular/ Medium/ SemiBold) | Google Fonts | SIL OFL |
| 中文正文 | **Noto Sans SC** (Regular/ Medium/ Bold) | Google Fonts | SIL OFL |
| 中文标题 | **Noto Sans SC Bold** 或 **ZCOOL QingKe HuangYou** | Google Fonts | SIL OFL |
| 代码/数据 | **JetBrains Mono** | Google Fonts | SIL OFL |

### 字号阶梯

```css
--font-size-display: 48px;   /* 赛季首页大标题 */
--font-size-h1: 32px;        /* 页面标题 */
--font-size-h2: 24px;        /* 区块标题 */
--font-size-h3: 20px;        /* 卡片标题 */
--font-size-body: 16px;      /* 正文 */
--font-size-small: 14px;     /* 说明/标签 */
--font-size-caption: 12px;   /* 时间戳/来源标注 */
--font-size-stat: 64px;      /* Box Score 大数字（Barlow Condensed Bold） */
```

### 排版规则

- 数据数字用 **Barlow Condensed**（窄体、运动感）
- 中文正文用 **Noto Sans SC**，行高 1.6
- 标题可全大写（英文），中文不大写
- 来源标注用 `--font-size-caption` + `--color-accent-secondary`

---

## 4. 间距与布局

```css
/* 间距阶梯（8px 基数） */
--space-xs: 4px;
--space-sm: 8px;
--space-md: 16px;
--space-lg: 24px;
--space-xl: 32px;
--space-2xl: 48px;
--space-3xl: 64px;

/* 圆角 */
--radius-sm: 6px;    /* 按钮、输入框 */
--radius-md: 10px;   /* 卡片 */
--radius-lg: 16px;   /* 面板、弹窗 */
--radius-full: 9999px; /* Badge、标签 */

/* 阴影（深色主题用发光而非投影） */
--shadow-card: 0 0 0 1px var(--color-border);
--shadow-elevated: 0 8px 24px rgba(0,0,0,0.4);
--shadow-focus: 0 0 0 3px rgba(247,140,26,0.3);

/* 布局 */
--max-width-content: 1200px;
--sidebar-width: 320px;  /* 证据抽屉/审核侧栏 */
--card-grid-gap: 16px;
```

---

## 5. 核心组件规范

### 5.1 课程卡（Course Card = 球员卡）

```
┌─────────────────────────────────┐
│ [学期标签]              [状态Badge] │  ← 顶部行
│                                   │
│   课程名（H3, Bold）              │  ← 主体
│   教师名 · 学分 · 时间            │  ← 次要信息
│                                   │
│ ┌─────┐ ┌─────┐ ┌─────┐         │
│ │进度 │ │来源 │ │下一步│         │  ← 数据条
│ └─────┘ └─────┘ └─────┘         │
│                                   │
│ [聚焦] [进入学习 →]              │  ← 行动区
└─────────────────────────────────┘
```

- 背景：`--color-bg-secondary`
- 选中态：左边框 3px `--color-accent-primary`
- 冲突态：边框 `--color-status-removed` + 冲突图标
- 离线态：降低透明度 + "缓存" 标签
- 禁用态：`--color-text-muted` + 不可点击

### 5.2 证据抽屉（Evidence Drawer）

- 从右侧滑入，宽度 `--sidebar-width`
- 背景：`--color-bg-elevated`
- 每条证据：来源类型图标 + 引用文本 + 定位（P.12 / 03:45）+ 置信度条
- 置信度条不用颜色 alone：同时显示文字（"高/中/低/证据不足"）

### 5.3 审核状态 Badge

| 状态 | 颜色 | 图标 | 文字 |
|---|---|---|---|
| draft | `--color-status-draft` | ○ 空心圆 | "草稿" |
| approved | `--color-status-approved` | ✓ 对勾 | "已通过" |
| removed | `--color-status-removed` | ✕ 叉 | "已移除" |
| published | `--color-accent-gold` | ★ 星 | "已发布" |
| fixture | `--color-status-fixture` | ◇ 菱形 | "演示数据" |
| cached | `--color-status-cached` | ◷ 时钟 | "缓存" |
| live | `--color-status-live` | ● 实心圆 | "实时" |

### 5.4 赛季进度条

- 高度 8px，圆角 `--radius-full`
- 背景：`--color-bg-tertiary`
- 填充：渐变 `--color-accent-primary` → `--color-accent-gold`
- 里程碑节点：小圆点 + tooltip 显示里程碑名
- 当前赛季高亮，过去赛季降低透明度

### 5.5 Box Score 面板

- 大数字：`--font-size-stat` + Barlow Condensed Bold
- 标签：`--font-size-caption` + `--color-text-secondary`
- 布局：3-4 列网格（完成率 / 正确率 / 用时 / 来源查看次数）
- 趋势箭头：↑ 绿 / → 灰 / ↓ 黄（同时有文字"上升/持平/下降"）

### 5.6 Replay 时间线

- 垂直时间线，左侧时间戳，右侧事件卡片
- 事件类型图标：答题 / 查看来源 / 教师修改 / 发布
- 可展开/折叠每个事件详情
- 当前播放位置高亮

---

## 6. 动效规范

### 原则

- **短而有力**：转场 200-400ms，庆祝动效 ≤ 3s
- **可跳过**：任何 > 1s 的动效有"跳过"按钮
- **可关闭**：`prefers-reduced-motion: reduce` 时全部静态
- **服务理解**：动效表达状态变化（审核通过→发布），不纯装饰

### 具体参数

```css
--motion-fast: 150ms;    /* hover、focus */
--motion-normal: 250ms;  /* 面板展开、Tab 切换 */
--motion-slow: 400ms;    /* 页面转场、抽屉滑入 */
--motion-celebration: 2000ms; /* 里程碑解锁、赛季颁奖 */

--easing-default: cubic-bezier(0.4, 0, 0.2, 1);  /* 标准 */
--easing-enter: cubic-bezier(0, 0, 0.2, 1);      /* 进入 */
--easing-exit: cubic-bezier(0.4, 0, 1, 1);       /* 退出 */
--easing-spring: cubic-bezier(0.34, 1.56, 0.64, 1); /* 弹性（Badge 解锁） */
```

### 关键动效清单

| 场景 | 动效 | 时长 | 可跳过 |
|---|---|---|---|
| 审核通过 | Badge 从 ○ 变 ✓ + 微弹 | 300ms | 否（太短） |
| 发布成功 | 卡片边框闪光 + "已发布" toast | 500ms | 否 |
| 赛季进度推进 | 进度条填充 + 里程碑点亮 | 800ms | 是 |
| 功能解锁 | 全屏 "NEW UNLOCKED" + 卡片飞入 | 2000ms | **是** |
| Key Match 倒计时 | 数字跳动（最后 10s） | 持续 | 可关闭 |
| 心流模式进入 | 界面元素渐隐，只留当前题 | 600ms | 可退出 |

---

## 7. 状态页面设计

### 空状态

- 统一构图：居中图标（64px）+ 一行说明 + 一个行动按钮
- 不使用羞辱性隐喻（"你还没开始"→"你的赛季从这里开始"）
- 插画风格：线性、单色（`--color-text-muted`）、几何感

### 错误状态

- 红色边框 + 错误图标 + 错误原因 + 可操作下一步
- 不只显示"出错了"，要显示"为什么"和"怎么办"

### 离线/降级状态

- 顶部全局条：`--color-status-cached` 背景 + "离线模式 · 数据截至 HH:MM"
- 不可用功能灰显 + tooltip "需要网络"
- Fixture 数据标注：`--color-status-fixture` Badge "演示数据"

---

## 8. 响应式与适配

| 断点 | 宽度 | 布局变化 |
|---|---|---|
| Desktop | ≥ 1200px | 侧栏 + 主内容 + 证据抽屉 |
| Tablet | 768-1199px | 证据抽屉覆盖层，卡片 2 列 |
| Mobile | < 768px | 单列，底部导航，证据全屏 |
| 投屏/演示 | 1920px | 大字号模式，隐藏次要信息 |

---

## 9. 图标规范

- **主图标集：** [Fluent System Icons](https://github.com/microsoft/fluentui-system-icons)（MIT）
- **补充：** Material Symbols（Apache-2.0），仅在 Fluent 缺语义时使用
- **不混搭：** 同一页面只用一套视觉粗细（Regular 24px）
- **尺寸：** 16px（内联）/ 20px（按钮）/ 24px（导航）/ 32px（卡片）/ 64px（空状态）
- **颜色：** 继承文字色，强调时用 `--color-accent-primary`

---

## 10. 资产获取优先级

| 优先级 | 资产 | 来源 | 时间 |
|---|---|---|---|
| P0-立即 | 字体（Barlow + Inter + Noto Sans SC） | Google Fonts | 10min |
| P0-立即 | 图标（Fluent System Icons） | GitHub/npm | 10min |
| P0-立即 | Design Tokens（本文件 → CSS 变量） | 原创 | 30min |
| P0-Day1 | 赛季中心 Hero 图 1 张 | AI 生成 | 1h |
| P0-Day1 | 空状态/错误图标 5-8 个 | Kenney(CC0) 或 AI | 1h |
| P1 / Vision | 模块 Key Art 统一套系 | 长期按 14 个模块同一母版生成；本届只做实际入选页面 | 3h+ |
| P1 | World Exam Finals 赛事海报 | AI + 排版组件 | 2h |
| P2 | 演播厅/球员通道动效 | UE Motion Design（如采用） | 6h+ |

### 统一资产管线

所有模块的 Key Art、背景、空状态、徽章和声音必须进入同一资产登记表后才能使用。登记至少包含：`asset_id`、用途、尺寸/裁切、视觉母版、生成/上游来源、Prompt/模型/版本（若为 AI）、许可证、作者、SHA-256、允许范围和替代方案。

- **先组件后资产：** 先测量实际槽位，再寻找或生成匹配尺寸的素材。
- **先套系后单图：** 模块 Key Art 作为同一批次生成和评审，禁止临时混入不同画风。
- **一处定义，多处复用：** 背景纹理、光效、徽章底板和声音从中央资产层引用，不在模块目录复制。
- **原创世界：** NBA/2K/ESPN 截图、卡面、标志、字体、音乐和具体布局只可内部研究，绝不进入产品或路演资产。
- **缺失即降级：** 没有合法且统一的素材时，用同一组件体系的纯色/纹理布局，不用风格不一致的“差不多”素材补洞。

---

## 11. 无障碍检查清单

- [ ] 所有文字对比度 ≥ 4.5:1（AA），正文 ≥ 7:1（AAA）
- [ ] 状态不只靠颜色：图标 + 文字 + 颜色三重编码
- [ ] 键盘可达：Tab 顺序合理，焦点可见（`--shadow-focus`）
- [ ] 读屏兼容：aria-label、role、alt text
- [ ] 动效可关闭：`prefers-reduced-motion` 全量支持
- [ ] 触控目标 ≥ 44×44px
- [ ] 不使用闪烁 > 3次/秒的元素（光敏性癫痫）
- [ ] 卡片/排名/徽章不羞辱、不制造焦虑

---

## 12. 跨模块视觉一致性门禁

任一页面在进入 Demo 或合并前必须全部通过：

- [ ] 使用全局 Shell；没有模块私有导航框架
- [ ] 颜色全部来自 Token；没有未经登记的 raw hex / 私有主题
- [ ] 字体、字号、圆角、间距、边框和阴影全部来自本规范
- [ ] 同一语义状态使用同一 Badge、词语和图标，不因模块改名换色
- [ ] 图标只来自统一图标集；不用 emoji、手绘 SVG 或混搭线条粗细替代正式图标
- [ ] Key Art / 插画通过同一视觉母版和资产登记；没有画风混搭
- [ ] 交互遵循 `Briefing → Choose → Execute → Replay → Next Move`
- [ ] 来源、权威状态和下一步的层级高于装饰与奖励
- [ ] 沉浸、轻量、传统、减少动效四种模式信息完整度一致
- [ ] 支付、门禁、健康、安全、人事与审批页面仍保留正式名称、责任方和紧急动作优先级
- [ ] 与至少两个其他模块并排截图检查，看起来属于同一款产品

---

## 13. 与其他文档的关系

- **历史美术资产白名单**（原路径 `D:\10451\Desktop\jiaowu2K26_美术资产白名单与缺口表.md`，当前缺失）：只有重新定位并核验哈希后才能恢复为依据
- **当前招募视觉 Brief**（`reference/PITCH-COPY.md`）：无字底图 Prompt、精确文字层和 IP 红线
- **人因研究章程**（`product/HUMAN-FACTORS.md`）：文化语义、压力、公平、隐私、社群、可访问性和 Degree Fahrenheit 采用闸门
- **本文件**：设计决策和 Token 定义（前端读这个）
- **modules/ 各模块 PROMPT.md**：具体页面的 UI 要求（前端也读这个）
- **gates/QUALITY.md**：UX 质检标准（验收时读这个）

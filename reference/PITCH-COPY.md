# jiaowu2K26 · 对外话术、招募与海报 Brief

> **用途：** 赛前招募、私聊介绍和视觉 Brief。不是最终路演稿，也不构成完成声明。  
> **事实状态：** 当前只有研究、规格、任务包与门禁；所有实现模块均为 `pending`，技术栈待用户与团队审核。  
> **更新时间：** 2026-07-22

## 传播主轴

### 黑色主标题

> **你在大学活了四年。**  
> **系统只记住一个 GPA。**

### 人本落点

> **我们要把它删掉的部分，全部做回来。**

### 项目定义

> **jiaowu2K26：有来源、可审核、可回放的大学生涯体验层。**

### 收刀句

> **不是给教务系统换皮。是重写它记住人的方式。**

### 技术彩蛋

> **AI 从不 Show its work。我们把它送进开卷考场。**

“黑”只针对冷漠、只会记分的系统，不拿挂科、疾病、教师或学生开羞辱性玩笑。

## 30 秒电梯介绍

传统教务系统擅长保存结果，却很少解释一个学生正在经历什么、为什么这样选择、下一步能去哪里。

jiaowu2K26 借鉴体育生涯游戏的赛季、阵容、关键事件、Box Score 与 Replay 语法，把大学四到八年的学习与选择组织成一段有来源、可审核、可回放的生涯。

长期版本让学生、教师和学校处在同一个原创游戏世界：MyCareer 覆盖课程、通行、余额、饮食、科研与机会，Coach Studio 帮教师整理教学/科研/晋升证据，Front Office 帮学校做可解释的服务和政策 What-if；所有模块统一美术，但权威决定仍留在正式系统与责任人手中。

本届 AdventureX 不会同时造十四个模块。72 小时只验证一条纵向闭环：课程材料进入系统后，AI 生成带来源的草稿，教师修改、通过或移除，只有批准版本才能发布；学生完成互动后，可以在 Replay 中回看来源、修改和自己的作答。

## 当前状态的诚实说法

- 产品愿景、P0 闭环、稳定功能 ID、模块任务包和质量门禁已经成形。
- 技术栈仍是提案；正式 Hacking 开始后通过前 6 小时 Gate 才锁定 Primary、Secondary 和 Fallback。
- 当前没有参赛代码；新队友加入的是从零共创，不是来接一个提前做好的半成品。
- F-001 智课工坊与 F-002 轻量赛季入口是唯一 P0；P0 稳定后最多选择一个 P1。
- 所有结果性声称必须由开赛后的代码、运行记录、测试和提交证据支持。

禁止使用“规格已冻结”“技术选型全部完成”“产品已经能生成/审核/回放”等超前表述。可以说“规格已成形，等待团队评审与现场验证”。

# 可直接发布的招募正文

**AdventureX 2026｜jiaowu2K26 招募 2–3 位共创者**

**你在大学活了四年。**
**系统只记住一个 GPA。**

我们想把它删掉的部分，全部做回来。

---

你打开它的那一刻，感觉不是打开了一个学习平台——

是打开了 2K。

深色界面。你的课程卡在中间，像首发阵容。赛季进度条在顶上。下一场 Key Match 倒计时在闪。你**想点进去**。

只不过 MyCareer 里那个球员，是你自己。

---

**jiaowu2K26 不是给教务系统换皮。**

| 你认识的"学习平台" | 我们在做的 |
|---|---|
| 白底、表格、蓝色链接、Word 既视感 | **深色面板 + 卡片阵容 + 运动感排版，像 2K** |
| 打开它需要意志力 | 打开它有多巴胺 |
| 课程是列表里的一行字 | 课程是你首发阵容里的一张卡 |
| 考完试只有一个冷冰冰的分数 | 考完有 **Replay + Box Score + 错误来源定位** |
| AI 生成一坨，教师不知道对不对 | AI 每个输出**必须亮出它来自哪页 PPT、哪句口播** |
| 选课像抢票 | 选课像 **Conda 环境解析**：diff、冲突、What-if、lockfile |
| 系统只记住结果 | 系统记住**你为什么这样选、怎么学的、谁审核的、能不能回放** |

---

**72 小时，我们不造十四个模块。只打穿一条链：**

```
课程材料 → AI 草稿（每个片段标注来源）→ 教师同屏审核 → 只有批准版本能发布 → 学生互动 → Replay 回看一切
```

长期地图有 14 个模块、三种角色 Lens（学生 MyCareer / 教师 Coach Studio / 学校 Front Office）、同一个原创游戏世界。但它们全部模块化、可裁剪，不挤占本届核心闭环。

---

**我们在找这样的人：**

**前端 / 交互**
React + TypeScript。赛季入口、教师审核页、学生互动、Replay。你在意视觉完成度——空状态、失败、键盘、减少动效都得做完整。你愿意把审核页做得不像后台管理系统，而像 2K 的教练战术板。

**后端 / 证据链**
状态机、API、来源链、发布门禁、审计、数据库。Rust / TypeScript / Python 都行，最终以前 6 小时现场 Gate 为准。你关心的是"这条证据链能不能真的不可绕过"。

**AI Pipeline / 评测**
PPT/PDF/录音解析、结构化生成、来源约束、Schema 校验、模型回退。AI 可以起草，但绝不能绕过教师直接发布。你负责让 AI 真正 Show its work。

**视觉 / 人因 / 宣发（强力加分）**
如果你能把一个复杂系统讲成 90 秒让人记住的故事，或者能让深色面板 + 卡片 + 动效看起来像一款真正的游戏而不是 SaaS 后台——来。

---

**当前状态（诚实版）：**

- 产品地图、P0 验收、14 模块任务包、质量门禁和视觉规范**已经成形**
- 技术栈仍是提案——开赛后 6 小时 Gate 才锁定
- 当前没有参赛代码。你加入的是**从零共创**，不是来接半成品
- 每个模块有独立的 AI 协作提示词（PROMPT.md），拿到就能开工

---

**我们不要什么样的人：**

不要"会用 AI 一键交作业"的队友。
不要"规格写了就等于做了"的人。
不要觉得"差不多就行"的人。

我们要能**理解、质疑、修改并为自己那部分负责**的人。

---

**AI 从不 Show its work。**
**这次，我们把它送进开卷考场。**

---

感兴趣？带着三样东西来聊：

1. 你最擅长什么
2. 72 小时你愿意扛哪条链
3. 你最想主动砍掉哪个功能

*不是给教务系统换皮。是重写它记住人的方式。*

<a id="role-match"></a>

## 一眼看懂：功能点 × 共创位置速配清单

> 可直接复制到飞书。使用方式：先勾一个“本届主位置”，再勾一个“可支援位置”。不要求任何人扛完整个大学 OS；一个人只对一条可验收链负责。

### 这项目到底在做什么

一句话：**把大学生活做成一款原创生涯游戏，但让每个 AI 结果都有来源、每个关键决定都有人审核、每段成长都能够 Replay。**

本届真正要完成的是：

**课程材料 → 带来源的 AI 草稿 → 教师修改/通过/移除 → 只有批准版本能发布 → 学生互动 → Replay / Box Score**

长期才会逐步扩展选课、考试、机会、科研、校园通行、General Balance、饮食、教师发展和学校运营；这些是地图，不是 72 小时待办。

### A. 本届 P0：加入后可以直接认领

□ **赛季大厅 / Course Roster**  
把当前学期、课程阵容、下一场关键任务和一个主行动做成真正像游戏入口的首页。  
适合：前端、交互、游戏 UI、视觉、产品。

□ **课程材料与来源切片**  
把授权 PPT、PDF、讲义或转写拆成可定位页码、时间戳和文本跨度的 Source Fragment。  
适合：AI Pipeline、文档解析、数据工程、Python、后端。

□ **可举证的 AI 草稿**  
输出结构化题目、复习卡或讲解草稿，同时携带来源、证据状态、未知项、版本和回退状态。  
适合：LLM 应用、Prompt/Schema、RAG/检索、模型评测、后端。

□ **Coach Review 教师审核台**  
草稿和来源同屏；教师能修改、通过、移除、退回纠正，操作自然得像教练战术板而不是 SaaS 后台。  
适合：前端、交互、人因、教师用户研究、后端状态机。

□ **不可绕过的发布门禁**  
只有具体 approved 版本才能发布；来源失效、状态错误或版本变化都会被拦截并留下审计。  
适合：Rust/Node/Python 后端、状态机、数据库、测试、安全。

□ **学生互动单元**  
学生能完成一次理解检查、查看教师批准的反馈和来源，并知道下一步做什么。  
适合：前端、互动设计、教学设计、内容产品。

□ **Replay / Box Score**  
把来源、AI/规则版本、教师修改、发布时间和学生自己的作答串成一条 Evidence Pack 时间线。  
适合：后端、数据建模、前端、数据可视化、审计。

□ **Fallback / 可访问性 / 质量保障**  
覆盖模型超时、数据库回退、断网、空状态、错误状态、键盘、读屏、减少动效和演示备份。  
适合：全栈、QA、DevOps、无障碍、人因、现场总控。

### B. P0 稳定后：最多只选一个 P1

□ **World Exam Finals**  
把赛前简报、复习 Playbook、关键考试和赛后 Replay 串成压力友好的赛事体验。  
适合：产品叙事、前端、教学设计、AI 评测、视觉动效。

□ **Roster Lab**  
像 Conda 解析环境一样生成 A/B/C 学期方案，解释先修、冲突、取舍、diff、迁移成本和无解原因。  
适合：算法、SAT/MaxSAT/CP-SAT、后端、数据可视化。

□ **Academic Mirror**  
把授权 SIS/URP/LMS/手工数据做成带来源、版本、新鲜度、冲突和纠错队列的只读镜像。  
适合：数据工程、系统集成、后端、隐私与数据治理。

□ **Opportunity Market**  
透明发现科研、竞赛、实习、会议和奖助机会，解释“满足/可能满足/不满足/未知”，由本人控制资料。  
适合：产品、规则引擎、搜索推荐、AI、数据治理、公平性研究。

### C. 长期大学世界：适合领域共创，但本届默认不实现

□ **成长与生涯记忆**  
Performance Center、私密徽章、Degree Fahrenheit、Season Highlight、时间胶囊。  
适合：数据产品、可视化、心理/教育、人因与反伤害研究。

□ **校园生活与权益**  
Campus Life、Campus Pass、General Balance、Dining & Wellbeing、服务与自愿 Campus Footprints。  
适合：校园产品、支付/账务、身份权限、安全、餐饮、地图与服务设计。

□ **教师科研与发展**  
Research Quest Tree、课程改进 Replay、基金/会议/合作者发现、合规与晋升证据整理。  
适合：科研工作流、教师发展、知识管理、产品、AI 与数据工程。

□ **学校 Front Office**  
Case Management、研究生里程碑、排课/空间/餐饮优化、机构读模型与政策 What-if。  
适合：学校信息化、运筹优化、数据治理、公共政策、服务设计。

### 你大概率适合哪个位置

**前端 / 交互**  
如果你最想勾“赛季大厅、教师审核、学生互动、Replay”，你就是 P0 前端主责。首个证明：6 小时内用 fixture 跑通首页 → 课程 → 审核页的可点击骨架。

**后端 / 证据链**  
如果你看到“状态机、门禁、审计、幂等、回退”会兴奋，你就是 P0 后端主责。首个证明：6 小时内完成一个 Source Record、一次状态迁移、一次被拒绝的非法发布和一次查询。

**AI Pipeline / 评测**  
如果你擅长文档解析、结构化生成、来源约束和错误分类，你就是 AI 主责。首个证明：同一份授权材料输出合法 JSON，并让每个对象都能回到 source_id；模型失败时能切 fixture。

**产品 / 总集成**  
如果你擅长砍范围、写验收、找用户、串起 90 秒故事并盯住 Claim Ledger，你就是产品/总集成。首个证明：冻结唯一 Magic Moment、每人一个 owner、P0/P1 停损线和三位测试对象。

**视觉 / 游戏 UI / 人因**  
如果你能让它像一款完整游戏，同时不牺牲来源、可访问性和正式语义，你适合视觉/人因。首个证明：统一赛季大厅与审核台的 Token、组件、Key Art 和减少动效版本，而不是单做一张海报。

**QA / DevOps / 现场总控**  
如果你喜欢主动把系统弄坏、设计恢复路径和冻结证据，你适合质量保障。首个证明：演练模型失败、数据库回退、断网和全服务失败四级路径，并准备录屏与截图。

**算法 / 数据 / 领域专家**  
如果你更擅长求解器、支付、身份、科研、校园运营或教育研究，可以作为 P1 owner 或领域顾问；先帮助 P0 的数据合同和验收，不提前单开大支线。

### 加入时直接按这个格式回复

姓名 / 称呼：

我想认领的主位置：

我可以支援的位置：

上面最想勾的 1–2 个功能点：

我能在开赛后前 6 小时交付的最小证明：

我用过的相关技术 / 作品链接：

如果时间不够，我建议最先砍掉：

我无法承担或需要队友补位的部分：

> 匹配原则：主位置看“你愿意对什么结果负责”，不是看简历上堆了多少技术名词。允许一人兼岗，但每条 P0 责任链只能有一个最终 owner。

## 私聊开场

### 一句话版

> 我们在做一个“大学生涯模式”：不是把教务系统游戏化，而是让 AI 生成内容必须亮出来源、由教师审核，学生还能 Replay 整个学习过程。现在缺一位愿意真正扛住前端 / 后端 / AI Pipeline 中一条链的人，有兴趣聊十分钟吗？

### 对技术同学

> P0 不是十四模块大拼盘，而是一条状态机与证据链：来源片段 → 合同化草稿 → 人工审核 → 不可越过的发布门禁 → Replay。技术栈没有先锁死，现场 6 小时 spike 决定；失败有 SQLite、fixture 和单体回退。

### 对设计、人因或宣发同学

> 我们想做的不是“黑底橙字的教务系统”，而是把赛季节奏、信息层级和 Replay 变成真正更好懂的大学体验。来源必须比装饰醒目，动效可跳过，游戏隐喻可以关闭。

## 队友任务卡交付格式

给新队友的任务说明固定包含七项，避免把整个项目目录直接甩过去：

1. 唯一目标：这条链最终证明什么。
2. 输入：由谁提供、使用什么稳定合同。
3. 输出：页面、接口、事件或测试证据。
4. 前 6 小时检查点：能否真实跑通最小切片。
5. 第 36 小时 Done：正常、空、失败、回退是否齐全。
6. 明确不做：防止顺手扩张成 P1/P2。
7. 回退：依赖失败后仍能诚实演示什么。

任何任务只有一个最终 owner；AI 可以补位，但不能成为责任主体。

## 黑色招募海报文字层

最终发布版的精确文字不要依赖图像模型。带文字生图只用于快速方向验证并须逐字校对；正式发布优先生成无字底图，再在 Figma、Canva 或 Photoshop 中确定性叠加：

```text
你在大学活了四年。
系统只记住一个 GPA。

我们把它删掉的部分，
做成一段可回放的生涯。

jiaowu2K26
学生 MyCareer · 教师 Coach Studio · 学校 Front Office

14 个模块是一张地图。
72 小时，只打穿一条闭环。

来源 → AI 草稿 → 教师审核 → 发布 → 学生互动 → Replay

ADVENTUREX 2026 · TEAM RECRUITING
FRONTEND / BACKEND / AI PIPELINE / PRODUCT & VISUAL

不是给教务系统换皮。
是把大学，重新做成一场值得打完的生涯。
```

底部另留二维码或私聊方式；不要让图像模型编造联系方式、学校 Logo、奖项或赞助关系。

## AI 游戏主视觉 Prompt（带文字快速稿）

这一版用于快速验证“它到底像不像一款大学生涯游戏”，不是最终产品截图。2026-07-22 的首轮生成结果已保存为 [jiaowu2k26-career-mode-concept-v1.png](assets/jiaowu2k26-career-mode-concept-v1.png)；对外使用必须在图注或正文中标明“赛前概念视觉 / 非实机截图”。

与下方叙事概念稿相比，本 Prompt 强制出现**学生英雄位、大学竞技场、赛季记分牌、OVR、课程选秀板和可操作菜单**，避免再次生成“裂墙 + 控制器 + 工作流”的赛博中台海报。图像模型仍可能偶发拼字或擅自增加微小文字；需要正式发布时，应逐字校对，必要时生成无字版本后确定性叠字。

~~~text
Use case: ads-marketing
Asset type: vertical key art and launch-screen poster for an original premium AAA university career-mode video game

Primary request:
Create a bold, unmistakably playable sports-career game image for Jiaowu2K26. A confident Chinese university student avatar in a dark varsity jacket marked only with the number 26 walks out of a campus player tunnel into a spectacular university arena. The arena blends a modern lecture hall, campus concourse, research lab displays, course draft boards and championship presentation lighting. The student is the hero, full body, dynamic three-quarter pose, backpack over one shoulder and tablet in hand.

The surrounding interface must feel like a real console career-mode start screen: season scoreboard, player rating card, bold menu tabs, broadcast graphics, sharp diagonal panels, arena lights, crowd silhouettes, confetti and depth. It must not look like a technology concept poster or a SaaS dashboard.

Project meaning:
Jiaowu2K26 turns the whole university journey into an original career mode. Semesters are seasons, courses are the roster, World Exam Finals are key matches, research and campus opportunities are quests, and every meaningful decision can be explained and replayed. Students enter MyCareer, teachers enter Coach Studio, and institutions enter Front Office, all through one shared game world. The real P0 remains a trustworthy closed loop: source material -> AI draft with evidence -> teacher edit/approve/remove -> approved publication -> student interaction -> Replay.

Style/medium:
Original cinematic game key art plus polished shippable console UI; athletic editorial photography, realistic human anatomy, premium sports-broadcast graphics, energetic rather than cyberpunk; strong silhouette and instantly readable hierarchy.

Composition/framing:
Vertical poster. Large hero avatar in the lower center, dramatic campus arena behind him, oversized title at the top, rating card on the right, compact navigation bar at the bottom. Preserve clear margins and avoid tiny text.

Lighting/mood:
Championship-night lighting, intense cobalt blue and electric orange spotlights, bright rim light, high contrast, ambitious, youthful and triumphant.

Color palette:
Near-black, off-white, cobalt blue and hot orange, with restrained metallic silver.

Text — render each exactly once, with no extra headline:
"JIAOWU 2K26"
"UNIVERSITY MYCAREER"
"2026 SPRING SEASON"
"OVR 98.6°F"
"MYCAREER"
"WORLD EXAM FINALS"
"CAMPUS LIFE"
"START SEASON"

Typography:
Large condensed uppercase sports-game display type for the title, clean bold sans-serif for UI labels. All required text must be legible and correctly spelled.

Constraints:
Original fictional student and original interface. No real athletes. No NBA, 2K Sports, ESPN, university, sponsor or apparel logos. No trademarked uniforms. No watermark. No QR code. No Chinese text. No illegible microtext. Make it look like a playable game screen while keeping the exact layout and visual system original.

Avoid:
Cracked-wall portal, giant controller silhouette, generic sci-fi command center, abstract workflow diagram, orange-blue cyberpunk cavern, fantasy armor, basketball-specific court branding, copied game-cover composition, cluttered dashboards and malformed hands.
~~~

### 当前生成资产登记

| 字段 | 值 |
|---|---|
| 资产 | reference/assets/jiaowu2k26-career-mode-concept-v1.png |
| 用途 | 赛前招募、视觉方向评审、Prompt 校准 |
| 状态 | 概念视觉；非实机、非本届完成声明 |
| 实际尺寸 | 972 × 1619 PNG |
| SHA-256 | 21C86D33ED89BB802D2376E1213EB960366624F9AB456A9A529220AB9D2FA2F4 |
| 生成方式 | OpenAI 内置 ImageGen；提示词见本节 |
| 允许 | 内部评审；明确标注概念图后的招募展示 |
| 禁止 | 冒充产品截图、AdventureX 现场成果或 2K/NBA 官方合作 |

## A4 软件功能全景海报（第一页）

成品：[jiaowu2k26-a4-software-universe-map-v1.png](assets/jiaowu2k26-a4-software-universe-map-v1.png)。这张图回答“软件到底有什么”：先展示不能绕过的 P0 可信闭环，再以学生 MyCareer、教师 Coach Studio、学校 Front Office 三种 Role Lens 收纳 F-001～F-014，最后用统一的游戏语法和权威边界收口。它与下节的岗位速配页组成 A4 双页套系。

### 信息层级

1. **Identity：** jiaowu2K26 不是给旧教务系统换皮，而是位于 SIS / URP / LMS 之上的大学生涯体验层。
2. **Trust Spine：** 授权材料 → AI 草稿 + `source_ids` → 教师修改/通过/移除 → 批准版本发布 → 学生互动 → Replay；AI 可以起草，不能越过教师发布。
3. **Student / MyCareer：** F-002、F-004、F-005、F-006、F-008、F-009、F-012。
4. **Teacher / Coach Studio：** F-001、F-007、F-013。
5. **School / Front Office：** F-003、F-010、F-011、F-014。
6. **Game Grammar：** 学期是赛季、课程是阵容、考试是关键比赛、4 / 6 / 8 赛季对应本科 / 硕士 / 博士、98.6°F 只是私密短期状态、结果通过 Replay + Box Score 回看。
7. **Scope & Authority：** P0 只做 F-001 + F-002 轻外壳；其余是可裁剪地图。产品是体验层，不冒充教务、支付、门禁或学校决策系统。

### 生成与排字方法

正式文字没有交给图像模型生成。OpenAI 内置 ImageGen 只生成无字 A4 结构底图，随后在 2480×3508 画布上以确定性 HTML/CSS 完成中文、英文、编号与范围说明；生成模式为内置默认模式。底图同时参考游戏启动屏主视觉与岗位速配页的画风、材质和视觉系统，但不编辑或复制两张参考图的具体构图。

底图最终 Prompt：

~~~text
Use case: ads-marketing
Asset type: A4 portrait software-universe map and feature infographic background for the original Jiaowu2K26 university career-mode project

Input images:
Image 1 is the campaign's cinematic game-world reference. Image 2 is the A4 recruitment role-matching companion page. Both are style, palette, material, character-world, and visual-system references only; neither is an edit target. Create a new page-one composition that unmistakably belongs to the same set.

Primary request:
Generate one flat, front-facing A4 portrait poster background in exact 210:297 proportion. This page must explain a whole software product, not merely advertise a mood. It needs a premium game-launch-screen atmosphere while reserving most of the page for a dense but calm, manually typeset feature map.

Composition:
- Top 19% — compact cinematic shared-world hero band. A fictional Chinese university student is foreground-left entering a vast “university arena”; a teacher works at a tactics/evidence console in the middle distance; an institutional planner observes campus resource flows in the far distance. They inhabit one continuous architecture and one visual system, not three separate products. Leave a large clean dark title field on the upper-right.
- Next 13% — one wide evidence playbook rail spanning the page with six large icon stations connected in one unmistakable route: source material -> AI draft -> human teacher review -> approved release gate -> student interaction -> replay/evidence pack. Icons only. Source, human control, approval, and replay must feel more important than AI spectacle.
- Main 48% — three aligned vertical role-lens zones under the evidence rail, sharing the same grid, materials and lighting:
  1) a broad student MyCareer zone containing seven clear dark feature-card slots,
  2) a teacher Coach Studio zone containing three larger feature-card slots,
  3) a school Front Office zone containing four medium feature-card slots.
  Give every slot generous blank interior space for later Chinese title and one-line description. Use only subtle pictograms and restrained edge accents. The columns must read as one connected university world.
- Next 15% — a wide “game grammar” strip with six icon bays for semester/season, course/roster, exam/key match, 4-6-8 stage progression, private progress temperature, and replay/box score. Leave clear empty label areas.
- Footer 5% — a stable dark broadcast strip for project scope, status legend, and concept-visual disclaimer.
- Preserve generous A4 margins and print-safe breathing room. Build a disciplined Swiss grid; hierarchy must remain obvious at arm's length.

Style/medium:
Original AAA sports-career game presentation, premium live-broadcast information graphics, cinematic editorial realism, precise console UI chassis, subtle paper grain and restrained metallic texture. Sophisticated and information-rich, yet calm and humane. This is a software universe map inside a game world, not generic concept art, a SaaS dashboard, or a wall of random holograms.

Color palette:
#0D1117 near-black navy, #161B22 obsidian panels, #F0F6FC off-white highlights, #F78C1A signal orange for primary action and P0, #58A6FF evidence blue for sources and P1, tiny #3FB950 approval green, muted metallic silver and graphite for long-term vision. Strong contrast and accessible panel separation.

Lighting/mood:
Championship-night campus lighting, controlled cobalt and hot-orange rim light, subtle volumetric depth, ambitious, trustworthy, collaborative, inclusive.

Text:
NO readable text of any kind. No letters, numbers, labels, fake microcopy, logos, QR codes, signatures, watermark, or pseudo-language. Leave all headline, column-title, feature-card, evidence-rail, legend and footer fields intentionally blank for deterministic typesetting later.

Constraints:
One complete flat A4 artwork, no paper mockup, no frame, no hands holding it. No NBA, 2K Sports, ESPN, real teams, athletes, leagues, universities, sponsors, copied sports interfaces, basketball, basketball court, league trophies, trading cards or paid-currency imagery. Do not copy either reference layout. Do not imply a finished product screenshot. Avoid giant controllers, cracked walls, portals, blue-purple cyberpunk, cheap hologram clutter, tiny unreadable data, cartoon style, esports-team visuals, corporate stock photography, and fourteen identical floating icons without hierarchy.
~~~

### 资产登记

| 字段 | 值 |
|---|---|
| 资产 | reference/assets/jiaowu2k26-a4-software-universe-map-v1.png |
| 用途 | A4 软件功能全景、14 模块解释、双页招募套系第一页 |
| 状态 | 赛前概念视觉；非实机、非本届完成声明 |
| 实际尺寸 | 2480 × 3508 PNG（A4 300 DPI 像素规格） |
| 文件大小 | 8,159,074 bytes |
| SHA-256 | 7E270F94B77618FACE5E5C873CF2CC7B9E916765874ECD21239213CA76A9A3B2 |
| 生成方式 | OpenAI 内置 ImageGen 无字底图 + 确定性 HTML/CSS 文字层 |
| 画风参考 | jiaowu2k26-career-mode-concept-v1.png；jiaowu2k26-a4-explainer-role-map-v1.png |
| 允许 | 内部评审；明确标注概念图后的招募展示与打印 |
| 禁止 | 冒充产品截图、AdventureX 现场成果或 NBA/2K 官方合作 |

## A4 项目说明与岗位速配海报（第二页）

成品：[jiaowu2k26-a4-explainer-role-map-v1.png](assets/jiaowu2k26-a4-explainer-role-map-v1.png)。它是 A4 双页套系的“第二页”：不再重复讲完整 14 模块，而是让读者三秒理解项目、十秒找到自己的位置。

### 信息层级

1. **Hero / 项目钩子：**“你在大学活了四年。系统只记住一个 GPA。我们把它删掉的部分做回来。”
2. **Scope / 防范围误读：**“14 个模块是一张地图；本届只打穿一条真实闭环。”
3. **P0 / 六步可信闭环：**课程材料 → AI 草稿 + 来源 → 教师修改/通过 → 批准版本发布 → 学生互动 → 证据与过程回看。
4. **Position / 四类主位置：**Frontend / Game UI、Backend / Evidence、AI Pipeline / Eval、Product / Visual / QA；算法、数据、支付、身份、科研、校园运营与教育研究放入 P1 / 领域共创。
5. **Proof / 责任而非技能堆砌：**每张岗位卡给出一个 6 小时可验证结果。
6. **CTA / 私聊入口：**最擅长什么、愿意扛哪条链、最想主动砍掉哪个功能。

### 生成与排字方法

正式中文没有交给图像模型生成。先以首张主视觉为**画风参考而非编辑目标**生成一张完全无字的 A4 底图，再按 2480×3508 画布确定性叠加中文和英文；这样同时保留游戏画面完成度与逐字准确性。

底图最终 Prompt：

~~~text
Use case: ads-marketing
Asset type: A4 portrait companion infographic background for an original premium university career-mode game recruitment poster

Input images:
Image 1 is a visual-world and art-direction reference only, not an edit target. Preserve its premium university-arena atmosphere, athletic editorial realism, near-black/cobalt/hot-orange palette, sharp sports-broadcast panel geometry, realistic Chinese student hero, and energetic game-launch-screen feeling. Create a new composition, not a copy.

Primary request:
Generate one flat, front-facing A4 portrait poster background in exact 210:297 proportion. This is page two of the Jiaowu2K26 campaign: a detailed project explainer and role-matching sheet. It must feel unmistakably like a polished playable career-mode game screen, while providing large calm spaces for deterministic text overlay later.

Composition:
- Top 31%: cinematic hero zone. The same kind of fictional Chinese university student avatar, in a dark varsity jacket with only a small number 26 and no logo, stands beside a luminous campus tactics table inside a spectacular “university arena” combining lecture hall, research lab, campus concourse and presentation stage. Dynamic three-quarter pose, ambitious and welcoming, not aggressive.
- Middle 25%: one wide dark evidence-playbook panel, with six large original pictogram stations connected left-to-right and then down in a clear readable route: source document -> AI draft -> human coach review -> approved release gate -> student interaction -> replay timeline. Icons only, no words. Make evidence/source and approval visually more important than decoration.
- Bottom 36%: four generous, equal 2-by-2 role cards with strong diagonal broadcast-game geometry and distinct simple pictograms: interface/game UI; backend evidence shield; AI pipeline nodes; product/visual/quality integration. Keep each card mostly dark and uncluttered with ample empty space for two to three lines of text.
- Footer 8%: one stable dark broadcast strip with room for event and recruitment copy.
- Maintain a disciplined Swiss grid, generous margins, strong hierarchy, print-safe breathing room, and no content near trim edges.

Style/medium:
Original AAA sports-career game presentation, cinematic editorial key art plus refined console UI chassis, photorealistic human anatomy, premium live-broadcast graphics, subtle paper grain and restrained metallic texture. Energetic and human, not cyberpunk, not SaaS, not a generic technology poster.

Color palette:
#0D1117 near-black navy, #161B22 obsidian panels, #F0F6FC off-white highlights, #F78C1A signal orange for action, #58A6FF evidence blue for source/replay, tiny #3FB950 approval green, restrained metallic silver. High contrast, accessible panel separation.

Lighting/mood:
Championship-night arena lighting, cobalt and hot-orange rim lights, controlled volumetric light, youthful, ambitious, trustworthy, collaborative.

Text:
NO readable text of any kind. No letters, numbers, labels, fake microcopy, logos, QR codes, signatures, or watermark. Leave intentional blank headline, panel-title and footer zones for later typesetting.

Constraints:
One complete flat A4 artwork, no paper mockup, no frame, no hands holding it. No NBA, 2K Sports, ESPN, team, player, league, real university or sponsor branding. No basketball, basketball court, trophies copied from sports leagues, trading cards, paid-currency imagery, or copyrighted interface imitation. Do not reuse the exact layout of Image 1. Do not imply a finished product screenshot. Avoid giant controllers, cracked walls, portals, random hologram clutter, tiny unreadable data, purple neon cyberpunk, cartoon style, esports-team aesthetics, or corporate stock-photo styling.
~~~

### 资产登记

| 字段 | 值 |
|---|---|
| 资产 | reference/assets/jiaowu2k26-a4-explainer-role-map-v1.png |
| 用途 | A4 招募说明、项目闭环解释、岗位速配 |
| 状态 | 赛前概念视觉；非实机、非本届完成声明 |
| 实际尺寸 | 2480 × 3508 PNG（A4 300 DPI 像素规格） |
| SHA-256 | F6E1CFE81D4CF143442EDE09905412A8497B686255671C3A0AE8E07E4C41F877 |
| 生成方式 | OpenAI 内置 ImageGen 无字底图 + 确定性 HTML/CSS 文字层 |
| 画风参考 | reference/assets/jiaowu2k26-career-mode-concept-v1.png |
| 允许 | 内部评审；明确标注概念图后的招募展示与打印 |
| 禁止 | 冒充产品截图、AdventureX 现场成果或 NBA/2K 官方合作 |

## AI 叙事概念海报 Prompt（无字备选）

> 本 Prompt 保留“系统只记住 GPA”的裂缝叙事，适合黑色观点海报，但首轮实测容易偏向赛博教育中台，**不再作为默认游戏主视觉**。若使用，必须配合上面的确定性文字层，并确认主角、赛季和可操作游戏语法足够明确。

```text
请直接生成一张单幅、无字、4:5 竖版的高完成度招募海报底图；不要先解释方案，不要输出拼图、情绪板或产品截图。默认分辨率 2048×2560。

【你必须先理解的项目】

项目名是 jiaowu2K26。它不是给旧教务系统换皮，而是把大学四到八年的学习、选择、校园生活和成长重构成一款“大学生涯模式”：本科、硕士、博士可以像 4 / 6 / 8 个赛季；学期是赛季，课程是阵容，选课是 roster building，考试是 World Exam Finals，进步可以 Replay，毕业像一段生涯的球衣退役。学生进入 MyCareer，教师进入 Coach Studio，学校进入 Front Office；三种角色处在同一个原创游戏世界，共用同一套视觉和交互语法。

项目真正解决的问题是：传统系统只记住 GPA 和办事结果，却删掉了一个人为什么这样选择、如何学习、如何被教师审核、如何成长、如何使用校园资源。jiaowu2K26 要把这些被删掉的部分重新做成有来源、可审核、可解释、可回放的生涯。

当前真实技术状态：项目仍处于 AdventureX 2026 研究与规格阶段，没有提前完成的参赛代码。长期愿景有 14 个模块、214 个功能切片，包括学习、排课、考试、机会、Campus Pass、General Balance、饮食建议、教师发展和学校运营；但 72 小时 P0 只打穿一条真实闭环：课程材料 → 带来源的 AI 草稿 → 教师修改/通过/移除 → 只有批准版本才能发布 → 学生互动 → Replay。候选技术是 React + TypeScript + Vite 的统一 Web/PWA Experience Shell；Rust + Axum + Tokio 和 OceanBase MySQL mode 都要现场验证，后端可回退到团队熟悉的 FastAPI / Node，数据库强制保留 SQLite 回退；AI 使用可替换 Provider Adapter，不能绕过教师发布；P0 不使用 Unity 或 Unreal。

【核心梗】

“你在大学活了四年，系统只记住一个 GPA。”

海报要让人第一眼感到：一个冰冷、只会显示单一分数的旧系统，正在被撕开；里面露出的不是更多表格，而是一段有赛季、有阵容、有关键比赛、有证据链、有回放、有人味的完整大学生涯。它应该同时让懂 NBA 2K 生涯模式的人会心一笑，又让从没玩过 2K 的人三秒内理解“大学生活被做成了一款真正的生涯游戏”。

【中心画面】

一位不具具体身份特征的大学生背影站在“大学生涯入口”前，像赛前走出球员通道，但空间实际由大学走廊、图书馆结构、教学楼天井和数字控制室融合而成，不出现篮球场。前方是一块巨大的、冷漠的单一成绩面板，它正在沿中轴裂开；裂缝内部释放出一条发光但克制的生涯时间线，以及课程阵容卡、学期节点、来源引用线、教师审核印记、World Exam Finals 赛程、Replay 轨迹、Campus Pass、General Balance 和科研机会等抽象信息对象。

不要把 14 个模块画成 14 个平铺图标。只让 P0 的“来源 → 审核 → 发布 → 互动 → Replay”成为最亮的视觉主链，其余校园能力作为远处世界细节，暗示这是一个可扩展的大学世界。画面必须是概念 Key Art，而不是已经完成的软件界面，不能误导观众以为产品已经构建完成。

学生、教师和学校三种 Role Lens 可以通过同一空间中的三个纵深层次暗示：前景是学生生涯，中景是带审核灯箱与证据标记的 Coach Studio，远景是观察资源与政策流动的 Front Office。三层必须共享完全一致的材质、灯光、卡片几何、图标语言和运动节奏，绝不能像三个不同产品的拼贴。

【统一美术语言】

Original AAA sports-career game presentation language, cinematic editorial key art, premium live-broadcast information graphics, investigative evidence visualization, Swiss grid discipline, humane academic futurism. 深黑海军蓝背景 #0D1117，黑曜石面板 #161B22，克制的信号橙 #F78C1A 作为主行动与生涯能量，证据蓝 #58A6FF 连接来源与 Replay，验证绿 #3FB950 只用于少量已审核状态，里程碑金 #D4A843 极少量点缀。强明暗层次、锐利轮廓、细微纸张颗粒、轻微 CRT 扫描纹理、极少量受控数字故障、低饱和体积光；高级、黑、冷静、有压迫感，但裂缝内部必须有人性和希望。

这不是霓虹赛博朋克，不是普通 SaaS Dashboard，不是校园宣传册，也不是篮球海报。不要满屏悬浮窗，不要廉价 hologram，不要蓝紫霓虹，不要卡通，不要电竞战队审美，不要企业库存照片。

【构图与文字安全区】

4:5 竖版，视觉焦点位于画面中央略偏下，裂开的旧成绩面板和人物形成清晰纵向轴。顶部 32% 保持深色、低细节，留给两行中文主标题；中部左侧留出项目名和一句定位的干净区域；底部 24% 使用稳定深色面板，留给 P0 闭环、招募岗位、活动信息和二维码。所有留白必须天然融入构图，不能像后期硬盖黑块。

生成图中不要出现任何可读文字、字母、数字、Logo、二维码、假 UI 文案、成绩或联系方式；精确文字会后期确定性叠加。可以使用无文字的几何数据槽、抽象状态标记和不可读微缩纹理，但不能生成乱码标题。

【原创与 IP 红线】

只借“赛季、阵容、训练、关键事件、Replay、Front Office”这些通用机制和体育转播式信息节奏，建立完全原创的大学生涯视觉系统。不得模仿任何一代 NBA 2K 的具体界面、菜单、卡面、字体、灯光构图或宣传图；不得出现 NBA、2K、ESPN、球队、球员、球衣、篮球、篮球场、奖杯复制品、交易卡、品牌字体、真实大学 Logo、赞助商 Logo、受版权保护截图、假奖项、水印或署名。

最终只生成一张完整海报底图。画面应当让观众在三秒内感受到这句话：这不是教务系统被游戏化，而是大学生活终于拥有了自己的生涯模式。
```

使用方法：将整个 Prompt 原样发送给支持生图的在线 AI；若需要 3:4 或 9:16，只替换第一段尺寸和文字安全区比例，不改变中心叙事、美术母版与 IP 红线。

## 对外使用红线

- 不使用 NBA、2K、ESPN、球队、球员、截图、卡面、字体或音乐。
- 可以说“借鉴体育生涯游戏的赛季/阵容/Replay 信息语法”，不能说官方合作或复刻。
- 赛前海报必须标为招募概念视觉，不能冒充产品截图或本届现场成果。
- 不公开真实学生姓名、学号、课程成绩、教师评价或未经授权的课程材料。
- “让人愿意打开”是设计目标，不声称已经提高留存、学习效果或多巴胺。
- 最终路演稿必须根据开赛后的真实实现和 Claim Ledger 另行收口。

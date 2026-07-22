# jiaowu2K26 · 研究与证据

> **状态：**公开资料与用户提供材料的赛前研究，不代表实现、授权集成或官方合作。
> **核验日期：**2026-07-21（Asia/Shanghai）。动态事实必须在开赛/采用前重新打开官方页面。
> **证据规则：**事实、产品推断和待验证假设分开写；主办方/官方文档优先于教程、营销页和二手总结。

## 研究结论总览

1. AdventureX 允许赛前构思和有限上手，但本项目主动保持文档/研究状态，正式开赛后从空白基线实现。
2. jiaowu2K26 应是 SIS / URP / LMS 之上的可解释体验层，而不是 72 小时内重写权威系统。
3. NBA 2K 最值得借鉴的是跨模式循环、信息架构、即时反馈、赛季与长期档案，不是黑金皮肤。
4. MyCAREER 只是入口；MyPLAYER Builder、Learn 2K、MyTEAM、MyNBA/MyGM、The City、The W、Seasons、Presentation/Replay 都能转译成大学场景。
5. 2K 的付费随机、公开竞争、资源稀缺和综合 OVR 不可照搬；教育转译必须透明、非付费、可解释且由本人控制。
6. 本机已建立 30 张官方 2K 界面研究库，足以研究布局和机制；当前没有必要购买游戏或安装 Steam。
7. 赞助资源要等开幕式确认精确权益；同一能力只选一个 Primary，硬件 P0 最多一个。

---

## AdventureX 2026 规则快照

**主事实源：**[AdventureX 2026 终极指南](https://adventurex.feishu.cn/docx/FOhLdr0Y3okbATxWvBQcoFx0nEd)。冲突时以后续官方通知与主办方解释为准。

| 事项 | 2026-07-21 可确认事实 | 对项目的动作 |
|---|---|---|
| 活动 | 2026-07-22 至 07-26 | 开幕式后才开始本届实现 |
| 开幕式 | 07-22 19:00–22:30；结束后正式 Hacking | 保存规则、主题、赛道与开始时间证据 |
| 团队 | 2–4 人；每人只能参加一队 | 没有完整组队即不能完成项目 |
| 主题/赛道 | 且只能 1 个主题；1–6 个赛道 | 开幕式后再映射，不沿用旧赛道 |
| 赛前 | 可构思 Idea/有限上手；不得提前完成大部分、复用旧项目或给旧项目加功能 | 当前只做研究、规格、风险和任务设计 |
| 产物 | 必须是可运行技术产品；文章/视频/方案/PPT 不能单独算完成 | 现场必须做真实可操作 P0 |
| AI | 可辅助部分编码，但不能全部代码均由 AI 生成 | 团队成员需能解释、修改和承担代码 |
| 提交 | 07-25 12:00 开放，07-26 01:00 截止 | 截止前冻结代码、证据与提交材料 |
| Expo | 07-26 09:00–15:00；单次交流约 2–3 分钟 | 产品操作优先，Slide 只辅助 |
| 评审 | 创意、技术复杂性、社会影响力 | Pitch 先展示问题、操作与证据 |

提交字段至少包括名称、一句话、Markdown 描述、实际技术、16:9 首图/视频、主题、1–6 赛道、队友、GitHub 与 `#adventurex2026` Tag、小红书链接、可选体验链接及赛道额外文书。

### 本项目自愿更严格的赛前边界

- 不写功能代码、可运行原型、模型链或数据库；
- 不安装项目依赖、Unreal、Steam 或硬件 SDK；
- 不制作可直接提交的新版 PPT、截图、录屏或 Demo；
- 历史原型/旧 PPT 只放归档，不称为本届成果；
- 当前技术只写候选、闸门与回退，不写“已采用/已验证”。

---

## SIS / URP / UArizona：权威系统与体验层

### 结论

- 选课、成绩、学籍、缴费和正式证明由学校系统负责；
- jiaowu2K26 通过 Academic Mirror 读取授权数据并显示来源、版本、时效、权威等级；
- 不采集教务密码、不绕过登录/验证码、不把镜像或 What-if 冒充正式结果；
- P0 用虚构或明确授权样例，不依赖真实校方账号；
- 开源教育系统用于理解对象与工作流，不直接当作本届底座。

### UArizona 公开服务分工

| 服务 | 官方可确认职责 | 对本项目的推断 |
|---|---|---|
| UAccess Student Center | 注册选课、课表、成绩、学术记录、转入课程评估等 | 权威交易留在 SIS；体验层解释而不改写 |
| Class Search / Shopping Cart | 搜课、购物车、选课时段、drop/swap/edit | Roster Lab 先做 diff/冲突，再跳正式系统办理 |
| Academic Advisement / What-if | 学位进度与另一培养方案模拟 | MyPLAYER Builder / Pathway Portal 可做可解释 What-if |
| Waitlist | 容量、位置、自动处理与正式注册状态 | 展示队列、更新时间、替代方案和权威来源 |
| Instructor Center | 教师名单、学生信息与成绩流程 | 教师与学生权限分离；正式成绩写回不进 P0 |
| Brightspace | 学习活动、作业与沟通 | 智课工坊是 LMS 邻近工作流，不复制完整 LMS |
| Trellis Advise/Progress | 预约、沟通、学生支持和教师反馈 | 支持层可独立，但反馈必须可行动、可治理 |
| Trellis integrations | PeopleSoft/UAccess、Brightspace、Slate、数据仓库等集成 | 能连接不等于可任意使用；用途和治理必须清楚 |

### UArizona 官方来源

- [Current Student Tools](https://www.arizona.edu/students)
- [UAccess](https://uaccess.arizona.edu/)
- [UAccess Student Center](https://advising.arizona.edu/online-tools/uaccess-student-center)
- [How to Register for Classes](https://registrar.arizona.edu/records-enrollment/enrollment/how-register-classes)
- [Academic Advisement Glossary & Guide](https://advising.arizona.edu/for-advisors/glossary-guide)
- [Student Tools](https://advising.arizona.edu/student-tools)
- [Trellis Advise FAQs](https://trellis.arizona.edu/trellis-advise-faqs)
- [Trellis Progress](https://studentsuccess.arizona.edu/trellis-progress)
- [About Trellis](https://trellis.arizona.edu/about) 与 [Privacy Notice](https://trellis.arizona.edu/about/privacy-notice)
- [Waitlist Setup](https://registrar.arizona.edu/faculty-staff-resources/room-course-scheduling/rcs-resource-guides/resource-guide-setting-and)
- [Waitlist Monitoring](https://registrar.arizona.edu/faculty-staff-resources/forms-help-guides/uaccess-training-information/resource-guide-monitoring)
- [Instructor Center](https://registrar.arizona.edu/faculty-staff-resources/grading/instructor-center-information)
- [Enrollment Transactions and Messages](https://registrar.arizona.edu/faculty-staff-resources/forms-help-guides/uaccess-training-information/resource-guide-viewing)

### 中国高校 URP 的可核验证据

- [上海海洋大学：谨防第三方教务查询软件](https://jwc.shou.edu.cn/2016/0920/c11212a227390/page.htm)：不要把账号密码交给第三方，课表/成绩以 URP 为准；
- [天津工业大学：培养方案内课程选课通知](https://jwc.tiangong.edu.cn/2025/0625/c1328a106461/page.htm)：培养方案、预置/必修与选修需要区分；
- [复旦大学软件学院：成绩单服务说明](https://software.fudan.edu.cn/d1/5a/c29403a315738/page.htm)：正式成绩单是权威服务，不可由体验层替代。

没有找到可代表全部高校的统一公开“URP 标准规格”，因此不把单校流程推广成行业事实。

### 开源教育系统参考

| 项目 | 可研究对象 | 当前边界 |
|---|---|---|
| openSIS Community Edition | 学生、课程、排课、成绩、门户 | 许可证按具体提交重验；不作 P0 底座 |
| Frappe Education | 申请、培养项目、注册、课程、排课、考试 | 框架/仓库许可分开核对 |
| Gibbon | 角色、课表、日历、提醒、lesson planner | 偏 K–12，只提炼工作流 |
| OpenEduCat | admission、student、course、exam、attendance、timetable | Odoo 生态较重，不进 P0 |

---

## NBA 2K：机制、模式与设计语言

### 最核心的跨模式循环

```text
建立身份 / 选择构筑
        ↓
选择目标、阵容与资源
        ↓
训练与低风险试错
        ↓
参加关键事件 / 赛季
        ↓
即时反馈、回放、数据和奖励
        ↓
调整属性、阵容、战术和下一目标
        ↓
跨赛季积累生涯、收藏、关系与历史
```

这套循环让“菜单、比赛、管理、故事、经济、社群”互相回流。jiaowu2K26 的对应循环是：建立学习目标 → 配课程/机会 → 练习 → 关键任务 → 证据回放 → 调整路径 → 留下生涯档案。

### 模式全景与可迁移机制

| 2K 模式/系统 | 官方页面可确认的核心机制 | jiaowu2K26 转译 |
|---|---|---|
| Play Now | 最短路径进入一场比赛 | 今日学习/快速查看一门课；首页只保留一个主行动 |
| Learn 2K | 训练、技巧教学、练习场 | 无惩罚的新手引导、理解检查、可重试练习 |
| MyPLAYER Builder | 自定义/模板构筑、属性联动、徽章/能力资格、测试 | 培养目标、课程 What-if、资格解释和“先试后选” |
| MyCAREER | 球员构筑、故事、Key Games、目标、互动、王朝/生涯记录 | 四至八赛季大学生涯、关键课程、导师反馈、长期档案 |
| Attributes/Badges/Takeovers | 多维属性、条件徽章、临场强化 | 可解释能力/行为徽章/短期状态；拒绝单一人格 OVR |
| The City | 集中枢纽、MyCOURT、帮助、模式入口、组队、社群、REP | Campus Hub、个人空间、服务入口、组队与长期贡献 |
| Squad Finder | 队伍人数、玩法、表现等显式筛选 | 项目/竞赛组队偏好与时间；敏感信息默认不用 |
| MyTEAM | 阵容、收藏、卡包、拍卖、挑战、训练、REP、教练 | 知识/机会组合、透明机会包、训练中心、导师发展 |
| Breakout / Showdown / King | 棋盘路线、分层竞争、周末活动与奖励 | 分支学习路线、作品展示；排名私密/自愿且不决定权益 |
| MyNBA | 联盟运营、历史 Eras、扩张/收缩、规则与赛季模拟 | 培养方案版本、课程供给、政策 What-if 和管理视角 |
| MyGM | GM 属性/Perks、目标、对话、设施、管理后果 | 教师/导师/管理员工作台与可解释运营决策 |
| The W | WNBA 生涯、GOAT 旅程、新闻发布会、社区目标、指导 | 包容成长路径、同伴目标、表达训练、学长导师贡献 |
| Seasons | 跨模式周期、进度、内容更新、付费 Pass | 学期节奏、活动日历、免费成长路线；不做付费加速 |
| Presentation/Replay/Box Score | 转播、情境、统计、回放和赛后总结 | World Exam Finals、来源/审核/答题回放、阶段总结 |
| VC/MTP | 可赚取/购买的货币和内容经济 | 只借鉴容量与取舍；时间/精力/资源不可购买成绩资格 |

### NBA 2K26 补充机制

截至 2026-07-21，2K26 官方 Courtside Reports 可确认：

- **MyPLAYER Builder：**Animation Glossary、Build via Badges、Scouting Report、模板、Build Specialization、Cap Breakers、Rebirth；
- **MyTEAM：**Game Changer Cards、Triple Threat Park、All-Star Team-Up、King of the Court、Breakout Gauntlet、Salary Cap、Arena、Coach Development、Victory Cards/Exchange、REP；
- **MyNBA/MyGM：**多条 Storylines、动态横幅、模拟控制、线上季后赛、Scenarios、历史 Eras 与联盟管理；
- **The W：**选秀前访谈、GOAT Challenges、新闻发布会选择等成长叙事；
- **Gameplay / City / Presentation：**继续强化即时控制、城市入口、情境呈现和反馈。

官方来源：

- [2K26 Courtside Report Hub](https://nba.2k.com/2k26/courtside-report/)
- [MyPLAYER Builder](https://nba.2k.com/2k26/courtside-report/myplayer-builder/)
- [MyTEAM](https://nba.2k.com/2k26/courtside-report/myteam/)
- [MyNBA/MyGM](https://nba.2k.com/2k26/courtside-report/mynba/)
- [The City](https://nba.2k.com/2k26/courtside-report/the-city/)
- [The W](https://nba.2k.com/2k26/courtside-report/the-w/)
- [Gameplay](https://nba.2k.com/2k26/courtside-report/gameplay/)
- [Presentation](https://nba.2k.com/2k26/courtside-report/presentation/)

### NBA 2K25 主研究基线

- [MyPLAYER and MyCAREER](https://nba.2k.com/2k25/courtside-report/myplayer-and-mycareer/)
- [The City](https://nba.2k.com/2k25/courtside-report/the-city/)
- [MyNBA and MyGM](https://nba.2k.com/2k25/courtside-report/mynba/)
- [The W](https://nba.2k.com/2k25/courtside-report/the-w/)
- [MyTEAM](https://nba.2k.com/2k25/courtside-report/myteam/)
- [Gameplay and Learn 2K](https://nba.2k.com/2k25/courtside-report/gameplay/)
- [Seasons](https://nba.2k.com/2k25/seasons/)
- [2K Support: VC and MTP](https://support.nba2k.com/hc/en-us/articles/41752375392787-NBA-2K-VC-Virtual-Currency-AND-MTP-MyTEAM-Points-How-They-Work)

### 历代沿革（用于理解连续性，不当完整百科）

| 时期 | 官方可确认的代表变化 | 研究意义 |
|---|---|---|
| 2K20 | MyCAREER 故事、MyTEAM 目标/成长卡、Triple Threat、Neighborhood/Park REP | 生涯、收藏、日常目标和社群循环已连接 |
| 2K23 | MyNBA 引入 Eras | 历史规则集本身成为可操作对象 |
| 2K24 | LeBron Era、Mamba Moments；多模式入口延续 | 历史回放、关键时刻和多角色入口 |
| 2K25 | Builder、MyCAREER、City、MyTEAM、MyNBA/MyGM、The W、Learn 2K 完整结合 | 当前主要设计基线 |
| 2K26 | Builder/Scouting/Coach Development/Storylines 等继续细化 | 强化“解释构筑、长期发展、情境反馈” |

历史来源：[2K24 Modes](https://nba.2k.com/2k24/modes/)、[2K24 MyNBA](https://nba.2k.com/2k24/courtside-report/mynba/)、[2K20](https://nba.2k.com/2k20/)。不同平台、世代和地区可能有差异；若 Pitch 使用具体数量或年份，现场再次核对。

---

## NBA 2K 界面设计拆解

### 1. 信息架构

- **一屏一主任务：**训练中心虽然入口多，但使用最大面积和最强边框突出当前主行动；
- **上下文常驻：**等级、资源、赛季剩余时间、角色/阵容不必反复进入详情；
- **逐层展开：**先给模式、构筑或名单摘要，再通过标签/侧栏进入细项；
- **并排因果：**Builder 左侧约束、中间属性、右侧徽章/资格，使改变变量后的影响立刻可见；
- **高密度管理：**MyNBA 用固定表头、选中行、上方角色摘要和视图切换承载大量信息；
- **模式化地标：**City 通过空间与招牌建立入口记忆，但这一价值可用二维 Hub 实现。

### 2. 视觉层级

- 大标题/模式标识建立当前位置，行动按钮用高亮色形成单一焦点；
- 深色基底承载照片/3D 场景，高对比面板承载数据；
- 颜色常用于类别和状态，但 jiaowu2K26 必须同时使用文字/形状以满足无障碍；
- 面板边框、横条、Tab 和选中行建立强分区，适合审核与复杂列表；
- 角色/场景占一侧，结构化数据占另一侧，让“身份/叙事”和“决策/证据”同时存在。

### 3. 交互与反馈

- 光标/焦点变化立即，底部常驻控制提示降低学习成本；
- Builder 把“不能获得某徽章”的原因放在同屏，减少黑箱；
- Scouting Report 同时展示强项、弱项和关键属性，适合做解释性摘要；
- Squad Finder 把匹配条件外显，适合双方同意的组队；
- Goals & Conversations 把关系状态、可选回答和后果暗示结合，适合可解释决策卡；
- Training Hub 用教程、练习、自由模式和术语表形成完整新手闭环。

### 4. 时间与长期留存

- Seasons 把短期任务装入长期循环；
- Key Games 把注意力聚焦到少数关键节点；
- REP/Badges/GOAT/Eras 提供跨赛季身份与历史；
- jiaowu2K26 应保留个人里程碑和版本历史，删除付费加速、公开天梯和人为 FOMO。

### 5. 不应照搬的可用性问题

- 过多菜单层级、货币与卡片可能造成认知过载；
- 高对比、全大写、动效和背景场景在长时间学习/审核中可能疲劳；
- 控制器提示不能直接移植到键鼠/触屏；
- 颜色类别繁多时对色觉用户不友好；
- 频繁奖励与倒计时会把重要教育行为变成留存操纵；
- 体育竞技的赢家/输家语境不适合成绩、健康和个人困境。

### 6. jiaowu2K26 原创设计约束

1. 先用信息架构线框验证主任务，再定义视觉；
2. 每屏只有一个明确 Primary action；
3. 来源、状态、权限和错误比装饰更醒目；
4. 提供沉浸、轻量和传统三种叙事强度；
5. 长列表支持键盘、筛选、搜索和文本导出；
6. 动效可关闭，颜色有文本/图形冗余；
7. 不复制球队/球员/联盟、卡面、字体、文案或页面布局；
8. 所有分数/徽章/温标先过理解与伤害测试。

### 本地官方参考库

- 指南：`D:\10451\Users\10451\Downloads\NBA2K-Design-Reference\GUIDE.md`；
- 逐图来源与哈希：`D:\10451\Users\10451\Downloads\NBA2K-Design-Reference\SOURCE-MANIFEST.json`；
- 图片：`D:\10451\Users\10451\Downloads\NBA2K-Design-Reference\images\`；
- 数量：30 张，约 17.6 MiB；已抽查 6 张代表图；无零字节文件；
- 一个 The W Pre-Draft Interview 资产只保留 URL，因为直接 CDN 请求返回 403/400，没有绕过。

这些图片只用于内部研究，不是可复用资产。

---

## NBA 2K26 购买与 DRM 研究边界

[Steam 官方商店页](https://store.steampowered.com/app/3472040/NBA_2K26/)显示 NBA 2K26 PC 版于 2025-09-04 发布，并列有 Denuvo Anti-Tamper、24 小时 5 台机器激活限制、2K Sports 账号、内核级 Easy Anti-Cheat 和内购。

**当前结论：无需购买。**官方文字、图片和多代资料已足以做产品机制与信息架构研究。若后续购买，只做正常游玩、人工菜单地图、任务计时、可访问性观察和符合平台条款的截图/笔记；不绕过 DRM/反作弊、不抓取内存、不反编译/提取资产、不修改在线服务。

---

## WinUI 3 开源参考

WinUI 3 Gallery 与 Windows Community Toolkit 均有官方文档/GitHub 内容，不依赖 Microsoft Store 才能研究。独立资料库已放在：

- `D:\10451\Users\10451\Downloads\WinUI3-Reference\GUIDE.md`；
- `D:\10451\Users\10451\Downloads\WinUI3-Reference\SOURCE-MANIFEST.json`。

使用方式是控件、可访问性和工程结构参考，不整包复制 Gallery/Template 工程，不把旧快照当当前模板。WinUI 只作为 Windows 教师控制台 Secondary，详见 [ENGINEERING.md](ENGINEERING.md)。

---

## AdventureX 赞助与技术资源

### 证据层级

1. 当届终极指南/官网/FAQ/主办方答复；
2. 当前赞助方或官方产品文档；
3. 官方仓库、发行页、许可证；
4. 用户提供资料；
5. 教程、活动故事和营销页；
6. 二手转述。

低层证据不能推导“现场一定有某 SKU/Credit”。未知项保持 `unknown`。

### 当前短名单

| 能力 | 候选 | 当前判断 |
|---|---|---|
| 模型 | 阶跃星辰等当届确认模型 | 第一个测试；精确额度/模型/条款未知 |
| 协作审核 | 飞书 Base | Secondary；Token、权限、限流和数据条款需实测 |
| 端侧感知 | D-Robotics RDK | 高潜力；精确板型、配件、数量未知 |
| AIoT | TuyaOpen | 高潜力 Secondary；与 RDK 同职责时二选一 |
| 轻量物理反馈 | Nothing Glyph | 机型、系统、AAR 许可匹配后可用 |
| 部署 | Zeabur / 现场确认云 | 不影响 local-first 回退时才用 |
| XR | PICO 或 Vision Pro | P1 高风险，设备和团队技能满足后只选一条 |
| 机器人 | AgileX / Seeed LeRobot 等 | 只有精确已装配硬件和负责人时进入 P1 |
| 链上 | Injective/XION 等 | 与 P0 问题不匹配，当前拒绝 |
| 多 Agent / 实时音视频 | CAMEL、TEN/Agora 等 | 账号与故障面过多，P0 拒绝 |

完整、可机器检索的供应商/技术候选、关系置信度、来源 URL 和闸门保留在 [CATALOG.json](CATALOG.json)；旧版逐站审计与 RTF 链接清单已完整归档。

### D-Robotics / RDK

**适配角色：**端侧感知和具身互动，不是为了赞助硬件把项目改成复杂机器人。

```text
摄像头/麦克风/按钮
        ↓
RDK 端侧检测/识别
        ↓ 时间戳、帧号、source_id
可追溯事件 → 教师审核 → 学生反馈
```

可迁移：ROS 2/TROS 节点/消息设计、Python/C++ 业务、Web API、source IDs 与事件流。必须重验：RDK OS/TROS/驱动、传感器、标定、网络、模型、延迟、功耗。不能跨板直接复用：HBM、镜像、驱动、设备树、GPIO/CAN/MIPI 配置和量化结论。

官方来源：

- [D-Robotics 资料中心](https://developer.d-robotics.cc/rdk_doc_center/)
- [RDK X5](https://developer.d-robotics.cc/rdkx5)
- [RDK S100](https://developer.d-robotics.cc/rdk_doc/rdk_s/Quick_start/hardware_introduction/rdk_s100/)
- [TogetheROS.Bot](https://developer.d-robotics.cc/tros_doc/tros)
- [RDK Studio](https://developer.d-robotics.cc/rdk_studio_doc/product-intro/overview)
- [支持硬件与 HBM 边界](https://developer.d-robotics.cc/rdk_studio_doc/product-intro/supported-hardware)
- [RDK Model Zoo](https://github.com/D-Robotics/rdk_model_zoo)
- [配件文档](https://developer.d-robotics.cc/accessories_doc/accessories)
- [NodeHub](https://developer.d-robotics.cc/nodehub)

用户原先提供的两份 PDF 在新环境当前缺失：

| 文件 | 原路径 | 字节 | SHA-256 |
|---|---|---:|---|
| 嵌入式竞赛地瓜机器人赛道资料.pdf | `D:\10451\Desktop\地瓜\嵌入式竞赛地瓜机器人赛道资料.pdf` | 3,020,973 | `F945FE12C1077BBFFB50DEC870D80506A8695B2FB89F2C7E11151E4A9D1F823A` |
| 嵌赛资料包.pdf | `D:\10451\Desktop\地瓜\嵌赛资料包.pdf` | 211,974 | `EE5A926C2DEF2B656709A2004FBC5B0B8BB175FA748C8AB8D233A813701361D0` |

重新挂载/提供后按哈希复核；在此之前，硬件细节优先回到官方页面。

### 其他关键纠偏

- Amazon Q Developer 的新 IDE 插件/订阅不应作为新团队前置；AWS 已发布其终止支持迁移说明，需使用当届推荐工具；
- Apple/PICO 是不同 XR 路线，不做双端 P0；
- Seeed LeRobot 教程依赖精确机械臂、校准、Ubuntu/Torch，Isaac Sim 示例还可能锁旧版本；
- Nothing Glyph 适合低侵入状态反馈，但不是项目核心价值；
- 飞书 Base 可做审核队列/运营回退，但权限配置失败时必须切本地数据。

---

## 研究与素材治理

### 外部资源进入项目的条件

- 官方上游与用途明确；
- 精确版本/commit、URL、字节、SHA-256 可记录；
- LICENSE、NOTICE、传递依赖、字体/图标/媒体资产已核对；
- AdventureX 对赛前材料/示例的规则允许；
- 能说明是直接依赖、改写片段、组件参考还是思想借鉴；
- 有替代方案，且不把供应商样例当产品成果。

### 事实写法

| 类型 | 写法 |
|---|---|
| 官方事实 | “官方页面在 2026-07-21 列出……”并给链接 |
| 产品推断 | “因此本项目推断/建议……” |
| 用户确认 | “用户称已向技术人员确认……”；关键决策仍需书面/现场证据 |
| 未知 | `unknown`，列补证据问题；不用 0 分或猜测代替 |
| 历史事实 | 带版本/年份，不推定当前仍有效 |

### 当前本地研究资产

| 资产 | 路径 | 状态 |
|---|---|---|
| NBA 2K 界面研究库 | `D:\10451\Users\10451\Downloads\NBA2K-Design-Reference\` | 30 图 + 指南 + SHA 清单 |
| WinUI 3 参考库 | `D:\10451\Users\10451\Downloads\WinUI3-Reference\` | 独立开发参考，不复制入项目 |
| AdventureX 原始 RTF | `D:\10451\Desktop\研究\Adventure X.rtf` | 原链接清单；是否仍存在需按使用时核对 |
| 黑客松历史材料 | `D:\10451\Desktop\黑客松\archive\` | 只读追溯，不是本届成果 |

## 研究待办

- 开幕式后保存最终主题、赛道、资源和主办方解释；
- 确认精确赞助模型/Credit、D-Robotics/Tuya/Nothing/PICO 等 SKU 与领用条款；
- 若用户重新提供两份地瓜 PDF，按已有 SHA-256 验证；
- 若团队选择某个开源依赖，重新核对当前 tag/commit、许可证与安全状态；
- 若决定购买 NBA 2K，只做正常 UX 观察并更新本地观察日志；
- 产品设计阶段从研究库提炼原创线框，不把截图当素材。

# NBA 2K 功能谱系与 jiaowu2K26 映射

> **状态：**赛前产品研究，未复制游戏素材、商标、代码、界面或音频。
> **最后核对：**2026-07-21。以 NBA 2K25 官方 Courtside Reports 为主，用 2K20、2K23/24 和 2K26 官方页面补充功能沿革。
> **阅读方式：**“2K 事实”来自官方页面；“大学映射”和优先级是 jiaowu2K26 的独立产品判断。

## 核心判断

NBA 2K 最值得借鉴的不是黑金配色，而是一套长期体验语法：

```text
建立身份 → 选择目标 → 训练 → 参加关键事件 → 得到反馈
    → 调整能力/阵容/战术 → 进入下一赛季 → 留下生涯记录
```

jiaowu2K26 可以把这套循环用于学习与大学生活，但必须做三层转换：

1. **从竞争排名转为个人成长与可解释选择；**
2. **从虚拟货币和随机付费转为透明的时间、机会与资格；**
3. **从球星幻想转为学生本人可控制、可纠错、可导出的生涯档案。**

项目只借鉴通用交互结构。`NBA`、`NBA 2K`、球队、球员、徽标、画面、音乐、卡面与具体文案都不是本项目资产；对外应使用自己的名称、视觉和原创内容。

## 2K25 主要模式全景

| 2K 模式 / 系统 | 官方页面可确认的功能 | jiaowu2K26 映射 | 本届优先级 |
|---|---|---|---|
| **Play Now** | 快速进入一场比赛 | 今日学习、即刻训练、快速查看一门课 | P0 外壳可借鉴 |
| **Learn 2K** | 训练小游戏、动作教学与练习场景 | 知识训练场、低风险练习、首次使用引导 | **P0** |
| **MyPLAYER Builder** | 自定义、Pro-Tuned、NBA/社区构筑路径，属性分配与 Build Tester | 培养目标、可解释课程路径、What-if 与“先试后选” | P1 |
| **MyCAREER** | 从球员构筑进入故事、关键比赛、个人目标、教练/经理互动、王朝与生涯记录 | 四至八赛季的大学生涯、关键节点、导师反馈与阶段档案 | **P0 轻外壳 / P1 实体** |
| **Attributes / Badges / Takeovers** | 属性、徽章、能力强化与成长机制；2K25 官方报告列出 72 个 Takeovers、14 种能力与 40 个徽章 | 可解释能力维度、具体行为徽章、临场状态；不可把人压成单一 OVR | P2 |
| **Heart of Dynasty / Key Games** | 生涯前史、关键比赛、个人目标、GOAT/王朝进度 | 入学动机、关键课程/项目、个人里程碑和毕业回顾 | P2 |
| **Endorsements / Media / Offseason** | 代言、媒体、播客、休赛期与 FIBA 等生涯扩展 | 实习、科研、会议、作品发布、交换与寒暑假成长 | P2 / Vision |
| **The City** | 更集中的城市枢纽、模式入口、MyCOURT、帮助、休闲/排位球场、Squad Finder、社群与赛季活动 | 校园枢纽、个人学习空间、服务大厅、组队与社群活动 | Vision；不做 3D 城市 |
| **MyCOURT / HoloHelp** | 私人场地、练习与就地帮助 | 个性化学习空间与上下文帮助 | P1/P2 |
| **Squad Finder / Affiliations** | 找队、社群归属与共同活动 | 课程项目、竞赛、科研与同伴支持匹配 | P1/P2 |
| **Proving Grounds / REP** | 排位、声望与长期进度 | 只借鉴分层任务和长期投入反馈；不做公开学业天梯 | 谨慎借鉴 |
| **MyTEAM** | 阵容、收藏、卡包市场、交换、拍卖行、展览、多人/单人模式、年度 REP | 知识卡组、资料工具箱、机会组合、科研搭档与复习阵容 | P1/P2 |
| **Auction House** | 玩家之间交易 MyTEAM 内容 | 改造成透明的“机会市场”与双向匹配；绝不给人竞价 | P1/P2 |
| **Breakout / Showdown / King of the Court** | 棋盘式挑战、分段排名、周末竞争与奖励 | 学习路线、阶段挑战、作品展示；排名必须私密/自愿且不决定基本权益 | P2 |
| **MyNBA** | 联盟运营、历史 Eras、扩张/收缩、杯赛、新闻与管理配置 | 培养方案、课程供给、政策 What-if 与跨学期运营 | P2 / 管理端 |
| **MyGM** | GM 背景、属性、Perks、目标、对话、设施与排行榜 | 教师/导师/管理员工作台、课程运营目标与可解释政策模拟 | P2；不要做行政排行榜 |
| **The W** | WNBA 生涯、GOAT 旅程、里程碑图、新闻发布会、在线模式、社区目标与 Game Changer 指导 | 包容性成长路径、同伴目标、学长导师与互助贡献 | P1/P2 |
| **Seasons** | 赛季循环、免费 40 级进度，以及另售的 Pro / Hall of Fame Pass | 学期节奏、免费成长路线与活动日历；不照搬付费加速 | P1/P2 |
| **VC / MTP** | VC 可通过活动获得，也可用真实货币购买，并用于能力、外观、动画或卡包；MTP 面向 MyTEAM | 用不可购买的时间/精力/实验室/资助预算替代；成绩与资格不可充值 | 只借鉴资源可视化 |
| **Broadcast / Replay / Box Score** | 比赛呈现、数据、回放与赛后反馈贯穿多模式 | 来源证据、审核记录、答题过程、修正和复盘 | **P0** |

## 各模式的可用设计语法

### 1. Play Now / Learn 2K：降低第一次行动成本

- 首页应有一个明确的“现在开始”，而不是先让学生理解整个系统；
- 训练可以失败、重试、查看依据，不影响正式成绩；
- 新手教学嵌入真实任务，不单独堆一册说明书；
- P0 对应：进入某门课 → 完成一个已审核的理解检查 → 查看来源与复盘。

### 2. MyPLAYER Builder：让路径选择可以预演

- 从“我想成为谁”倒推课程、能力与机会，而不是只列培养方案；
- 提供多个起点：自定义、推荐构筑、来自真实培养方案的构筑、社区模板；
- Build Tester 对应选课/转专业 What-if：先看学分、先修、时间、毕业影响，再决定是否走正式流程；
- 所有预测必须显示来源、假设和不可保证项。

### 3. MyCAREER：把四至八年变成连续故事

- 学期是赛季，课程是阵容，关键课程/项目是 Key Games；
- 4 / 6 / 8 赛季只是一种常见阶段隐喻，必须支持休学、延毕、交换、联合培养等非线性路线；
- 教练/经理对话可以映射教师、导师与辅导员反馈，但不得伪造他们的意见；
- 生涯记录应归学生控制，可导出、可纠错，不因毕业“清空存档”。

### 4. The City / The W：让校园服务与互助可被发现

- City 的价值是把分散入口压缩到可理解的枢纽，不是造一座昂贵 3D 城市；
- MyCOURT 对应个人空间，Squad Finder 对应组队，HoloHelp 对应上下文帮助；
- The W 的社区目标与 Game Changer 指导适合转成同伴互助、学长导师和贡献认可；
- 避免将“声望”做成对学生的公开价值排序。

### 5. MyTEAM：从卡牌消费改造成知识与机会编排

- “阵容”可以表示一组互补的知识卡、资料、工具、机会或协作者；
- 卡面应展示内容、来源、适用人群、截止时间和风险，不靠稀有度遮蔽信息；
- 不做付费随机卡包，不制造 FOMO，不让经济能力决定教育机会；
- 拍卖行只借鉴搜索、筛选、供需与匹配，不能给学生、导师或岗位竞价。

详见 [机会市场与权益系统](../features/OPPORTUNITY-MARKET.md)。

### 6. MyNBA / MyGM：把系统视角留给教师与管理者

- 学生看到个人路线；教师看到课程、内容、审核和班级反馈；管理者看到方案、容量与政策影响；
- Eras 适合比较培养方案版本，不让历史规则悄悄覆盖当前规则；
- 联盟扩张/收缩可映射专业、课程或资源供给模拟；
- 这是 P2 管理端，不应挤占智课工坊 P0。

### 7. Box Score / Replay：把“分数”还原成证据

P0 最应该继承的 2K 语法不是 OVR，而是赛后数据与回放：

```text
学生看到的结果
  ├─ 来源页码 / 时间戳 / 原文
  ├─ AI 或规则如何形成草稿
  ├─ 教师做了哪些修改和决定
  ├─ 学生采取了什么行动
  └─ 后续修正、申诉与版本
```

这正好与智课工坊的 `Show your work` 价值合流。

## 经济系统的转换边界

| 原系统 | 可保留的抽象 | 必须移除的伤害机制 | jiaowu2K26 建议名 |
|---|---|---|---|
| VC | 有限资源、投入取舍、获得与支出记录 | 真实付费购买成绩、能力或基本资格 | Capacity / Campus Credits |
| Card Pack | 主题化内容组合与发现 | 付费随机、概率不透明、FOMO | 透明机会包 |
| Auction House | 搜索、筛选、供需和双向确认 | 给人竞价、价高者得教育机会 | Opportunity Market |
| Paid Pass | 一段时间内的权益集合和进度 | 付费加速学业、跳过先修或审批 | Entitlement Wallet / Access Pass |
| REP / Leaderboard | 长期投入与贡献反馈 | 公开羞辱、伪精确综合排名 | 私人里程碑 / 社群贡献 |

## P0 / P1 / P2 收口

### P0 必须保留

1. `MyCAREER` 的一层课程/赛季上下文；
2. `Learn 2K` 式的一次低风险学习互动；
3. `Box Score / Replay` 式来源、审核与结果回放；
4. 教师像 Coach 审核 Playbook，但有清楚的真实权限与文字操作。

### P0 稳定后最多选一个 P1

- **MyPLAYER What-if：**解释一条选课或转专业路线；
- **MyTEAM / Opportunity Market：**用透明公开样例完成一次机会资格匹配；
- **The W / Squad Finder：**完成一次有同意机制的学习或项目组队；
- **World Exam Finals：**把来源、练习与复盘编排成一次期末叙事。

### P2 / Vision

- 完整校园枢纽、长期生涯、导师网络、培养方案管理与机构排课；
- 多赛季经济、社群活动、作品典礼和完整毕业档案；
- 任何需要真实学校集成、生产权限或长期数据治理的能力。

### 明确拒绝

- 复制 NBA 2K 的受保护素材或造成官方合作误解；
- 公开 GPA/能力天梯、对教师做未经验证的“球探排名”；
- 付费购买成绩、先修豁免、跳级、转学或匹配优先权；
- 付费随机机会包、暗黑模式式稀缺倒计时；
- 对学生、导师、岗位或教育机会进行竞价；
- 为了“像游戏”而美化挂科、焦虑、疾病或学业危机。

## 历代功能沿革：可追溯但不照搬

| 时期 | 官方页面可确认的变化 | 对本项目的意义 |
|---|---|---|
| NBA 2K20 | MyCAREER 故事、MyTEAM 日常目标/可成长卡、Triple Threat、Neighborhood 活动与 Park REP | 长期目标、卡片成长和社区循环早已互相连接 |
| NBA 2K23 | MyNBA 引入 Eras | 培养方案历史版本可以成为可操作对象 |
| NBA 2K24 | 增加 LeBron Era；Mamba Moments；Play Now、MyCAREER、MyTEAM、MyNBA 等入口继续并存 | 历史回放、关键时刻和多角色入口适合教育叙事 |
| NBA 2K25 | Builder、MyCAREER、City、MyTEAM、MyNBA/MyGM、The W 和 Learn 2K 形成完整语法库 | 本项目主要参考基线 |
| NBA 2K26 | Seasons 继续跨 MyCAREER / MyTEAM，并保留付费 Pass | 说明赛季与通行证机制仍在延续；本项目只保留非付费的节奏/权益抽象 |

## 官方来源账本

### NBA 2K25 主来源

- [MyPLAYER and MyCAREER](https://nba.2k.com/2k25/courtside-report/myplayer-and-mycareer/) — Builder、属性、Takeovers、徽章、Cap Breakers、Key Games、生涯故事与反馈；
- [The City](https://nba.2k.com/2k25/courtside-report/the-city/) — 枢纽、MyCOURT、HoloHelp、Squad Finder、Proving Grounds、社群和 REP；
- [MyNBA and MyGM](https://nba.2k.com/it-IT/2k25/courtside-report/mynba/) — MyGM RPG、目标/对话/设施，以及 MyNBA Eras 与联盟运营；
- [The W](https://nba.2k.com/2k25/en-GB/courtside-report/the-w/) — GOAT 旅程、里程碑、线上社区目标与 Game Changer；
- [MyTEAM](https://nba.2k.com/2k25/ja-JP/courtside-report/myteam/) — Auction House、Breakout、Showdown、REP、阵容、收藏、交易与卡包市场；
- [Gameplay and Learn 2K](https://nba.2k.com/2k25/pt-BR/courtside-report/gameplay/) — ProPLAY、控制、攻防/AI 与练习；
- [Seasons](https://nba.2k.com/2k25/seasons/) — 免费等级与另售 Pass；
- [2K Support: VC and MTP](https://support.nba2k.com/hc/en-us/articles/41752375392787-NBA-2K-VC-Virtual-Currency-AND-MTP-MyTEAM-Points-How-They-Work) — VC/MTP 的获得与用途。

### 历史与连续性

- [NBA 2K24 Modes](https://nba.2k.com/ja-JP/2k24/modes/)；
- [NBA 2K24 MyNBA](https://nba.2k.com/nl-NL/2k24/courtside-report/mynba/)；
- [NBA 2K24](https://nba.2k.com/ko-KR/2k24/)；
- [NBA 2K20](https://nba.2k.com/de-DE/2k20/)；
- [NBA 2K26 Seasons](https://nba.2k.com/en-GB/2k26/seasons/)。

## 证据边界

- 本文是面向产品决策的“功能谱系”，不是逐菜单、逐平台、逐地区的游戏百科；不同世代和平台可能存在差异。
- 官方页面中的功能事实与本项目映射已分栏；映射是推断，不代表 2K 官方背书。
- 若现场 Pitch 使用任何具体功能数量或历史年份，应再次打开对应官方页面核对；不要凭本文把动态服务状态写成永恒事实。

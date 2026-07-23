# 研究参考

> 本文件为只读参考资料，不驱动执行决策。需要时查阅即可。
> 核验日期：2026-07-23（Asia/Shanghai）。终极指南仍可能修改；动态事实必须在提交开放和最终提交前重新打开官方页面。

---

## AdventureX 2026 赛事规则快照

**主事实源：**[AdventureX 2026 终极指南](https://adventurex.feishu.cn/docx/FOhLdr0Y3okbATxWvBQcoFx0nEd)；[日程表直达](https://adventurex.feishu.cn/docx/FOhLdr0Y3okbATxWvBQcoFx0nEd#B1EGdcTC8oZ4ebxxO09cFdHpngB)；[提交章节直达](https://adventurex.feishu.cn/docx/FOhLdr0Y3okbATxWvBQcoFx0nEd#doxcnhnCsf5CmPuLAMfs1Yy4lvc)

| 事项 | 事实 |
|---|---|
| 时间基准 | 杭州当地时间 / 北京时间，`Asia/Shanghai`（UTC+08:00） |
| 活动日期 | 2026-07-22 至 07-26，杭州 |
| 开幕式 | 07-22 19:00–22:30；结束后正式 Hacking |
| 团队 | 2–4 人；每人只能参加一队 |
| 主题/赛道 | 且只能选 1 个主题；1–6 个赛道（开幕式公布） |
| 赛前规则 | 可构思 Idea / 有限上手；不得提前完成大部分、复用旧项目或给旧项目加功能 |
| 产物要求 | 必须是可运行技术产品；文章/视频/方案/PPT 不能单独算完成 |
| AI 规则 | 可辅助部分编码，但不能全部代码均由 AI 生成 |
| 提交开放 | 07-25 12:00；United Portal 项目提交通道开放 |
| 提交截止 | 07-26 01:00；晚于此时的提交不会被查看；官方窗口仅 13 小时 |
| Expo | 07-26 09:00–15:00；09:00–12:00 仅评委/嘉宾，12:00–15:00 对外开放，15:30 前清场；单次交流约 2–3 分钟 |
| 闭幕式 | 07-26 17:30–20:30 |

### 评审维度

- **创意**：产品概念与问题定义的新颖性
- **技术复杂性**：实现深度与工程难度
- **社会影响力**：教育/社会价值

### 提交物清单

提交字段至少包括（以 07-25 Portal 实际页面为最终准绳）：
- 项目名称
- 一句话描述
- Markdown 详细描述
- 实际使用的技术
- 图片或视频轮播图至少 1 项；第一张是 16:9 封面
- 主题（1 个）
- 赛道（1–6 个）
- 队友信息（不含自己最多 3 人，即总团队最多 4 人；奖励按填写成员发放）
- GitHub 仓库链接（含 `#adventurex2026` Tag）
- 小红书图文/视频链接；至少带 `#adventurex`，保守同时带 `#夏天属于黑客松`
- 可选体验链接
- 赛道额外文书（如有）

还必须在 Expo 前准备产品介绍 Slide Show；Expo 于 07-26 09:00 开始。提交完成后保存 Portal 成功页、项目页 URL、提交时间与最终仓库 commit/tag 作为证据。

### 两处需要保守处理的官方表述

1. 正文一处把小红书发布写为“推荐”，但提交字段与评审资格说明都要求小红书链接；执行时按**必交**处理。
2. 原文写“GitHub 设置 Tag 为 `#adventurex2026`”，尚未区分 Git tag、GitHub Topic 或页面标签；07-25 Portal 开放后核对字段语义，在不破坏仓库版本标签的前提下同时满足官方展示要求。

### 证据层级

1. 当届终极指南/官网/FAQ/主办方答复
2. 当前赞助方或官方产品文档
3. 官方仓库、发行页、许可证
4. 用户提供资料
5. 教程、活动故事和营销页
6. 二手转述

低层证据不能推导"现场一定有某 SKU/Credit"。未知项保持 `unknown`。

### AdventureX 官方 GitHub 开源资源（2026-07-23）

官方组织 [AdventureX-RGE](https://github.com/AdventureX-RGE) 当前公开 19 个仓库。它们证明主办方确有可复用实现和设计资产，但不是“参赛项目起手模板”，采用前仍须逐仓核对许可证、维护状态和依赖：

| 仓库 | 官方定位 / 许可证 | 对 jiaowu2K26 的用途与边界 |
|---|---|---|
| [united-portal](https://github.com/AdventureX-RGE/united-portal) | 黑客松一体化托管平台；TypeScript；MIT | 可研究提交/活动门户的对象、状态和部署方式；不把主办方 Portal 复制成我们的产品首页 |
| [united-portal-theme-shadcn](https://github.com/AdventureX-RGE/united-portal-theme-shadcn) | United Portal 默认主题；MIT；README 标注 Alpha | 可研究 Token/组件封装；未经依赖和可访问性 Gate 不直接引入 |
| [intelligence-ui](https://github.com/AdventureX-RGE/intelligence-ui) | 基于 React Aria 的 React/Tailwind 组件库；MIT | 与 React Experience Shell 方向相容，可作为可访问组件候选；先做最小 Spike，不整体复制 |
| [Playbook](https://github.com/AdventureX-RGE/Playbook) | 公开 Hackathon Playbook；MDX；仓库元数据未声明许可证 | 只作组织方法和文档结构参考；没有明确许可证时不复制正文、图片或代码 |
| [Orbix](https://github.com/AdventureX-RGE/Orbix) | AdventureX 风格字体；SIL OFL-1.1 | 可在短标签/活动署名中评估；其 README 明确不适合长标题和正文，也不能替代本项目原创品牌字体 |
| [adventurex-faq-skill](https://github.com/AdventureX-RGE/adventurex-faq-skill) | 官方 FAQ 快照 Agent Skill；仓库元数据未声明许可证 | 可核对活动、提交和 AI 规则；不代替终极指南或现场 Portal 动态事实 |
| [landing-2024](https://github.com/AdventureX-RGE/landing-2024) | 2024 落地页；Vue；仓库元数据未声明许可证 | 只作历史视觉证据，不复制素材或布局 |

结论：若要吸收官方代码，首选 MIT 的 `intelligence-ui` 做独立组件 Spike；`united-portal` 只研究工作流；`Playbook/FAQ/landing-2024` 因无明确仓库许可证，仅可阅读和引用链接。任何采用必须登记具体 commit、文件、上游许可证与修改范围。

---

## SIS / URP 研究摘要

### 核心结论

- 选课、成绩、学籍、缴费和正式证明由学校系统负责；
- jiaowu2K26 通过 Academic Mirror 读取授权数据并显示来源、版本、时效、权威等级；
- 不采集教务密码、不绕过登录/验证码、不把镜像或 What-if 冒充正式结果；
- P0 用虚构或明确授权样例，不依赖真实校方账号；
- 开源教育系统用于理解对象与工作流，不直接当作本届底座。

### UArizona SIS 分析

UArizona 公开服务分工（对本项目的推断）：

| 服务 | 职责 | 推断 |
|---|---|---|
| UAccess Student Center | 注册选课、课表、成绩、学术记录 | 权威交易留在 SIS；体验层解释而不改写 |
| Class Search / Shopping Cart | 搜课、购物车、选课时段 | Roster Lab 先做 diff/冲突，再跳正式系统办理 |
| Academic Advisement / What-if | 学位进度与培养方案模拟 | MyPLAYER Builder / Pathway Portal 可做可解释 What-if |
| Waitlist | 容量、位置、自动处理 | 展示队列、更新时间、替代方案和权威来源 |
| Instructor Center | 教师名单、学生信息与成绩流程 | 教师与学生权限分离；正式成绩写回不进 P0 |
| Brightspace | 学习活动、作业与沟通 | 智课工坊是 LMS 邻近工作流，不复制完整 LMS |
| Trellis Advise/Progress | 预约、沟通、学生支持 | 支持层可独立，但反馈必须可行动、可治理 |

**官方来源：**
- [UAccess Student Center](https://advising.arizona.edu/online-tools/uaccess-student-center)
- [How to Register for Classes](https://registrar.arizona.edu/records-enrollment/enrollment/how-register-classes)
- [Academic Advisement Glossary](https://advising.arizona.edu/for-advisors/glossary-guide)
- [Trellis Advise FAQs](https://trellis.arizona.edu/trellis-advise-faqs)
- [Instructor Center](https://registrar.arizona.edu/faculty-staff-resources/grading/instructor-center-information)

### UArizona 全校数字生态与缺口映射

UArizona 的公开架构不是一个“大一统教务应用”，而是**权威系统联合 + 统一体验入口**：

| 层 | 公开系统 / 能力 | 对 jiaowu2K26 的设计启示 |
|---|---|---|
| 统一体验 | [CatCloud](https://catcloud.arizona.edu/) 及其[能力页](https://catcloud.arizona.edu/capabilities)、[U of A App](https://trellis.arizona.edu/partner-initiatives/arizona-mobile-0) | 做 Role-aware Portal 和任务聚合，不复制各权威系统交易逻辑 |
| 权威交易 | UAccess Student / Employee / Financials / Research、D2L | Academic Mirror 保存来源、版本和权限，正式操作仍回原系统 |
| 学业路径 | [SAAR What-if](https://catalog.arizona.edu/pages/Ww9XxDdH1n0NbFTsP8x3)、[GradPath](https://grad.arizona.edu/gsas/gradpath)、[Registrar 排课](https://registrar.arizona.edu/faculty-staff-resources/room-course-scheduling) | F-004 同时覆盖课程方案、方向/专业 What-if 和研究生里程碑解释 |
| 顾问与 Case | [Trellis Advisor Tools](https://advising.arizona.edu/for-advisors/advisor-tools)、[Trellis CRM](https://annualreport.it.arizona.edu/2020/trellis-constituent-relationship-management) | 服务不是只有链接，还要有责任人、状态、时限、转介和纠错 |
| 资金与支持 | [Bursar Payment Options](https://bursar.arizona.edu/payment/options)、[CatCash](https://union.arizona.edu/catcash)、[Scholarship Universe](https://financialaid.arizona.edu/ScholarshipUniverse)、[Basic Needs](https://basicneeds.arizona.edu/) | 资金、餐次、奖助、基本需要与外部支付通道需要分账和分隐私域 |
| 身份与通行 | [CatCard](https://catcard.arizona.edu/about)、[Keyless Access](https://catcard.arizona.edu/keyless-access)、[Loss/Theft](https://catcard.arizona.edu/loss-theft) | 凭证、访问权益、挂失与交易可以同入口，但安全与账务语义不能混合 |
| 数据与治理 | [Enterprise Data Warehouse](https://uair.arizona.edu/content/enterprise-data-warehouse)、[UAccess Analytics](https://uair.arizona.edu/content/uaccess-analytics) | 学校端需要有血缘、时效、权限和用途边界的机构读模型，而非复制生产库 |
| 教师发展 | [Annual Profile](https://facultyaffairs.arizona.edu/annual-profile-faculty-fellows)、[Promotion Guide](https://facultyaffairs.arizona.edu/guide-promotion-process)、[Teaching Hub](https://teaching.arizona.edu/)、[Research Development Services](https://research.arizona.edu/development) | Faculty Success 应覆盖年度档案、教学改进、科研机会和晋升证据，但不替代评审 |
| 生活服务 | [Service Finder](https://it.arizona.edu/service-finder)、Basic Needs、住房、交通、图书馆、健康与社团入口 | Campus Life Hub 需要扩展为服务发现、空间/设备、住宿交通、安全与无障碍入口 |

由此补出的产品缺口与归属：

1. 招生与入学引导、学籍/服务目录 → F-014。
2. 研究生培养和毕业里程碑 → F-014，学生侧由 F-002 承载赛季上下文。
3. Advising / Case Management → F-014，F-008 提供本人服务入口。
4. Financial Aid / Basic Needs → F-011 + F-014。
5. 住宿、交通、图书馆、空间和设备 → F-008 + F-010 + F-014。
6. 无障碍与合理便利、安全与紧急服务 → 共享能力 + F-010 / F-014。
7. 职业、校友、科研机会与方向建议 → F-009。
8. 科研合规、教师档案、教学建议和晋升准备 → F-013 + F-014。
9. 课程、食堂、空间、预算和服务的机构改进建议 → F-004 + F-012 + F-014。

**定位结论：** jiaowu2K26 不做“中国版 CatCloud”或替代 SIS，而是在多个权威系统之上增加可验证的决策与模拟层，把课程、时间、金钱、权限、科研和校园生活放进同一个原创游戏世界。

### General Balance 的研究转译

统一余额应是**用户体验统一、资金属性分离**，而不是把所有账户做加法：

| 层 | 含义 | 关键约束 |
|---|---|---|
| General Cash | 学校允许范围内相对通用的校园资金 | 可用范围、退款和余额规则清楚 |
| Policy Balance | 餐补、奖助、科研或其他专项资金 | 来源、用途、期限、优先级、申诉可见 |
| External Rails | 支付宝、微信支付、云闪付/银联、银行卡、Stripe 等 | 只是付款通道，不读取完整外部余额 |
| Module Cap | 学生给 Academic、Dining、Housing、Mobility、Research、Campus Life、Wellness、Opportunity 分配的预算 | 提醒/软限额优先；硬限额不阻断紧急或强制事项 |
| Entitlements | 餐次、打印页、场馆次数、实验室时长、访问权限 | 非货币单位，不与现金互换 |

UArizona 的 Bursar、CatCash 与 CatCard 分工说明“同一校园入口下仍需区分账务、校园消费和身份权限”；餐次等非货币权益还应继续单独建模。中国高校正式实现必须按校方现有支付宝/微信支付/银联/校园卡体系和监管要求逐校确认，不能用单校案例推定全国一致。

**支付与合规参考：** [南京大学校园卡说明](https://guide.nju.edu.cn/faq/32/53/c44792a537171/pagem.htm) · [北京市高校智慧校园规范示例 PDF](https://www.cup.edu.cn/nic/docs/2023-05/7b3cc1af3d2446adbace550c92048993.pdf) · [Stripe Alipay](https://docs.stripe.com/payments/alipay/accept-a-payment) · [Stripe Cards / UnionPay](https://docs.stripe.com/payments/cards) · [Stripe Financial Connections](https://docs.stripe.com/financial-connections) · [PCI DSS](https://www.pcisecuritystandards.org/standards/pci-dss/) · [中国非银行支付机构监督管理条例](https://xzfg.moj.gov.cn/law/download?LawID=1696&type=pdf)

Stripe Financial Connections 的官方范围是美国银行账户连接，不能被当作中国高校账户聚合方案；Stripe 在本项目最多是特定国际付款场景候选，不是 General Balance 底座。

学生记录、支付、健康、无障碍和人事数据必须按部署地重新做法律与学校政策评估。跨地区设计仅参考 [FERPA 对 Education Record 的说明](https://studentprivacy.ed.gov/faq/what-education-record) 与[中国网信部门个人敏感信息保护说明](https://www.cac.gov.cn/2026-01/09/c_1769688003183197.htm)，不能把一地规则直接套到另一地。

### 中国高校 URP 系统

**关键发现：**
- 上海海洋大学警告：不要把账号密码交给第三方，课表/成绩以 URP 为准
- 天津工业大学：培养方案内课程需区分预置/必修与选修
- 复旦大学软件学院：正式成绩单是权威服务，不可由体验层替代
- **没有找到可代表全部高校的统一公开"URP 标准规格"**，不把单校流程推广成行业事实

**来源：**
- [上海海洋大学：谨防第三方教务查询软件](https://jwc.shou.edu.cn/2016/0920/c11212a227390/page.htm)
- [天津工业大学：培养方案内课程选课通知](https://jwc.tiangong.edu.cn/2025/0625/c1328a106461/page.htm)
- [复旦大学软件学院：成绩单服务说明](https://software.fudan.edu.cn/d1/5a/c29403a315738/page.htm)

### 开源教务系统评估

| 项目 | 可研究对象 | 当前边界 |
|---|---|---|
| openSIS Community Edition | 学生、课程、排课、成绩、门户 | 许可证按具体提交重验；不作 P0 底座 |
| Frappe Education | 申请、培养项目、注册、课程、排课、考试 | 框架/仓库许可分开核对 |
| Gibbon | 角色、课表、日历、提醒、lesson planner | 偏 K–12，只提炼工作流 |
| OpenEduCat | admission、student、course、exam、attendance | Odoo 生态较重，不进 P0 |

---

## NBA 2K 设计研究

> 当前完整系统对标、逐项采用/拒绝判断及 F-001～F-014 映射见 [`brainstorm/03-2K全功能对标与实现构思.md`](../brainstorm/03-2K全功能对标与实现构思.md)；归档只用于追溯旧版研究。

### 核心跨模式循环

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

jiaowu2K26 的对应循环：建立学习目标 → 配课程/机会 → 练习 → 关键任务 → 证据回放 → 调整路径 → 留下生涯档案。

### 核心转译结论

| 2K 概念 | 教育转译 |
|---|---|
| 赛季 (Seasons) | 学期 |
| 阵容 (Roster) | 课程组合 |
| 训练 (Training) | 练习 |
| Replay / Box Score | 复盘 / 阶段总结 |
| MyPLAYER Builder | 培养目标 What-if、资格解释、先试后选 |
| MyCAREER | 四至八赛季大学生涯、关键课程、长期档案 |
| The City | Campus Hub、个人空间、服务入口 |
| MyTEAM | 知识/机会组合、透明机会包、训练中心 |
| MyNBA / MyGM | 培养方案版本、课程供给、管理视角 |
| Attributes / Badges | 可解释能力/行为徽章；拒绝单一人格 OVR |

### 经济系统安全转译

- **VC→积分**（不售卖）：时间/精力/资源不可购买成绩资格
- **卡包→机会发现**（不拍卖）：透明机会包，禁止付费资格、随机资格、人的拍卖
- **借机制不借品牌**：不复制球队/球员/联盟、卡面、字体、文案或页面布局

### 不应照搬的问题

- 过多菜单层级、货币与卡片造成认知过载
- 频繁奖励与倒计时会把教育行为变成留存操纵
- 体育竞技的赢家/输家语境不适合成绩、健康和个人困境
- 控制器提示不能直接移植到键鼠/触屏
- 颜色类别繁多时对色觉用户不友好

### 官方来源

- [2K26 Courtside Report Hub](https://nba.2k.com/2k26/courtside-report/) · [Builder](https://nba.2k.com/2k26/courtside-report/myplayer-builder/) · [MyTEAM](https://nba.2k.com/2k26/courtside-report/myteam/) · [MyNBA](https://nba.2k.com/2k26/courtside-report/mynba/) · [The City](https://nba.2k.com/2k26/courtside-report/the-city/) · [The W](https://nba.2k.com/2k26/courtside-report/the-w/)
- 2K26：[Gameplay](https://nba.2k.com/2k26/courtside-report/gameplay/) · [Presentation](https://nba.2k.com/2k26/courtside-report/presentation/)
- 2K25：[MyPLAYER / MyCAREER](https://nba.2k.com/2k25/courtside-report/myplayer-and-mycareer/) · [The City](https://nba.2k.com/2k25/courtside-report/the-city/) · [MyNBA / MyGM（2K Newsroom）](https://newsroom.2k.com/news/nbar-2k25-showcases-all-new-stephen-curry-mynba-era-and-introduces-mygm-on-playstationr5-xbox-series-xs-and-pc) · [The W](https://nba.2k.com/en-GB/2k25/courtside-report/the-w/) · [MyTEAM](https://nba.2k.com/2k25/courtside-report/myteam/) · [Gameplay / Learn 2K](https://nba.2k.com/2k25/courtside-report/gameplay/) · [Season Pass](https://support.nba2k.com/hc/en-us/articles/41843861488659-NBA-2K-Season-Pass) · [VC/MTP](https://support.nba2k.com/hc/en-us/articles/41752375392787-NBA-2K-VC-Virtual-Currency-AND-MTP-MyTEAM-Points-How-They-Work) · [Crossplay](https://support.nba2k.com/hc/en-us/articles/41839060944403-NBA-2K25-Crossplay-and-Cross-Gen-FAQ) · [Gravity Ball](https://support.nba2k.com/hc/en-us/articles/41872913740179-NBA-2K25-Gravity-Ball-FAQ)
- 历史连续性：[2K24 Modes](https://nba.2k.com/2k24/modes/) · [2K24 MyNBA](https://nba.2k.com/2k24/courtside-report/mynba/) · [2K20](https://nba.2k.com/2k20/)

### 版本校正

- `Mamba Moments` 是 2K24 / 系列研究项，不是 2K25 新功能。
- The W 的 `Game Changer` 按社区贡献与导师身份理解，不写成“Game Changer 卡”。
- “All-Star / 颁奖周”是系列体育语法的教育转译，不声称它是 2K25 某个单独同名模式。

---

## maimai DX 设计研究

maimai 不承担大学生涯的宏观经营，而用于补齐 F-001/F-005 的微观学习节拍：多难度支架、TAP/HOLD/SLIDE/TOUCH 交互、即时解释、自由练习、真正的 BUDDY 协作、路径闸门与进度保留。DX Rating、付费 Ticket、连续签到和公开竞赛只可经过安全改造，不能直接进入教育场景。

### 核心转译结论

| maimai 概念 | 教育转译 |
|---|---|
| 多谱面难度 | 同一目标的不同支架密度，可自由切换且不贴能力标签 |
| TAP / HOLD / SLIDE / TOUCH | 选择、持续观察、排序/因果、图中定位的交互语法 |
| Freedom Mode | 无排名、无断签压力的自由练习 |
| BUDDY Chart | 两人互补才能完成的合作任务，保留个人与团队证据 |
| 宴会場 | 明确 Unranked 的创意/实验关卡 |
| Area / TASK / Stock Distance | 路径、先修闸门与阻塞时保留已有进度 |
| Perfect Challenge | 重试时增加支架而不是降低知识标准 |
| Invitation / CIRCLE | 受保护的新手邀请、导师与学习小组 |
| DX Rating | 拒绝公开综合人格分；最多保留本人私密临时状态 |

完整逐项矩阵见 [`03-2K全功能对标与实现构思.md`](../brainstorm/03-2K全功能对标与实现构思.md#3-maimai-dx交互成长与社区机制逐项转译)。

### 官方来源

- [How to Play / Aime / 多人](https://maimai.sega.com/play/)
- [CiRCLE / CiRCLE FESTA](https://maimai.sega.com/play/newfunction/)
- [KALEIDXSCOPE、DX Rating、Friend Battle、宴会場、BUDDY、Weekly Mission、Partner](https://maimai.sega.com/play/newfunction2/)
- [Recommended、Random、Invitation、段位、TASK Track、Perfect Challenge、Stock Distance、Ticket](https://maimai.sega.com/play/newfunction3/)
- [当前日本版入口](https://maimai.sega.jp/) · [官方赛事](https://maimai.sega.com/kop7th/maimai_itr_en/) · [素材使用条件入口](https://maimai.sega.com/download/)

---

## 人因、可访问性与 AI 治理研究

> 项目内责任、139 条机制覆盖状态、Degree Fahrenheit 评价因素和访谈合同见 [`product/HUMAN-FACTORS.md`](../product/HUMAN-FACTORS.md)。

### 研究转译

- **全生命周期而非上线前验收：** 人因活动从术语和隐喻开始，贯穿规格、原型、失败/退出路径、PR 和真实使用，符合 ISO 9241-210 的人本设计方向。
- **可访问性是等价路径：** WCAG 2.2 的非颜色依赖、键盘可达、可暂停/减少动效、可理解标签、错误识别与纠正直接进入 Design System 和每个切片的 Done。
- **AI 风险是社会技术风险：** NIST AI RMF 用于提醒团队明确角色、来源、限制、监测和人工接管；它不替代教育机构政策或真实用户研究。
- **教育场景保留人的能动性：** UNESCO 指南强调人本、隐私、包容、公平和文化/语言多样性，因此 AI 草稿、建议和模拟不得冒充教师、学校或学生的权威决定。
- **小样本不制造科学外观：** 黑客松认知访谈报告原始人数、原话、反例和样本边界，不用百分比声称全校偏好或学习效果。

### 主要来源

- [ISO 9241-210:2019：交互系统人本设计](https://www.iso.org/standard/77520.html)
- [W3C Web Content Accessibility Guidelines 2.2](https://www.w3.org/TR/WCAG22/)
- [NIST AI Risk Management Framework 1.0](https://www.nist.gov/publications/artificial-intelligence-risk-management-framework-ai-rmf-10)
- [UNESCO Guidance for Generative AI in Education and Research](https://www.unesco.org/en/articles/guidance-generative-ai-education-and-research)

---

## 证据治理研究

### 外部资源进入项目的条件

- 官方上游与用途明确
- 精确版本/commit、URL、字节、SHA-256 可记录
- LICENSE、NOTICE、传递依赖、字体/图标/媒体资产已核对
- AdventureX 对赛前材料/示例的规则允许
- 能说明是直接依赖、改写片段、组件参考还是思想借鉴
- 有替代方案，且不把供应商样例当产品成果

### 事实写法规范

| 类型 | 写法 |
|---|---|
| 官方事实 | "官方页面在 2026-07-21 列出……"并给链接 |
| 产品推断 | "因此本项目推断/建议……" |
| 用户确认 | "用户称已向技术人员确认……"；关键决策仍需书面/现场证据 |
| 未知 | `unknown`，列补证据问题；不用 0 分或猜测代替 |
| 历史事实 | 带版本/年份，不推定当前仍有效 |

---

## 本地黑客松与成品项目审计（2026-07-22）

### 范围与方法

- 审计根：D:/10451/Downloads/已经整理；全程只读，没有向来源目录复制、移动或写入。
- 目标：提取可迁移的产品机制、交互模式、工程韧性、路演方法和美术管线，不把其他作品直接并入当前成果。
- 阅读深度：完整阅读 30 余份 README/快速上手/策略/复盘；5 份关键 PDF 做逐页文本与视觉检查，1 份大型竞赛方法 PDF 做定向提取；抽查 6 张产品海报和 4 张成品界面。
- 未深读：视频、压缩包、大型二进制工程、全部 PSD/3D 源文件和十余万枚图标。它们只做清单或代表性抽样，不能声称逐项审查。
- 归并结果：EXP-CASE-01～08，见 product/MODULE-MAP.md；不新增稳定 F 编号，不改变 214 个功能切片，不扩张 P0。

### 主要来源与决策追踪

| 本地来源 | 读深度 | 提炼出的模式 | jiaowu2K26 决策 |
|---|---|---|---|
| D:/10451/Downloads/已经整理/20260523黑客松/Project.L_收工归档_README_2026-06-18.md；whispering-reed-stem/ANDROID_EXCEPTION_HANDLING.md | 全文 | arrival → recognition → match → notify → collect；成功/人工纠正/硬错误三态；离线队列；一年后 Flashback；单一 Magic Moment 与演示备份 | 采纳 Human Override、Evidence Pack、Season Highlight、离线队列和 Magic Moment；不复制其界面风格 |
| D:/10451/Downloads/已经整理/BoHack/AI原生服务 vs AI自动化服务 自检表V1.0.pdf；新版/project.LETTER_路演宣传与冲奖策略_v2.md | PDF 逐页 + 全文 | 意图历史、人与 AI 的边界、人工接管、可审计 B2B、优雅失败、现场/录屏/预置数据三线 | 采纳可纠正 Intent Profile、分层执行与失败设计；拒绝身份依赖、假装理解情绪和开放式成瘾 |
| D:/10451/Downloads/已经整理/20260315 AI Hackathon Tour/北京大学_1/Research-OS.png；评分维度最终版.pdf | 视觉检查 + PDF 逐页 | 研究目标树、实验状态、知识记忆、结果分析；场景/技术/工具/UX 的项目自检 | 形成 Research Quest Tree 和内部 Readiness Rubric；评分 PDF 五项合计 85，绝不冒充 AdventureX 官方百分制 |
| D:/10451/Downloads/已经整理/资产/ProductMap0.1.0 (1).pdf；动手学创赛v2.260314.1.pdf | PDF 逐页 / 定向提取 | 用户请求不等于需要；新旧体验差减迁移成本；MVP 最小但不能逻辑残缺；Hero Shot、真实挫折和证据叙事 | 采纳 Scenario Draft Board、迁移成本、Claim → Evidence 和一屏一主目标 |
| D:/10451/Downloads/已经整理/工创赛/README.md；交通锦衣卫/README.md | 全文 + 代表文件 | 安全状态机、自动主路 + 人工接管、record/replay、dry-run、故障注入、结构化遥测与证据冻结 | 采纳机构事务状态机、幂等、可观察失败和 Replay；不把机器人技术本身硬塞进 P0 |
| D:/10451/Downloads/已经整理/开源工程/sci-calc/README.md | 全文 | 一个设备、多种 Mode Lens、上下文动作层、历史剪贴板和可扩展用户程序 | 采纳统一 Role Lens 与 Contextual Action Rail；插件市场只留远期 |
| D:/10451/Downloads/已经整理/微软设计指南/deep-research-report.md；FluentUI图标资产库 | 全文 + 抽样 | 为需求与情境设计、控制打断、保持控制与信心、减少动效、高对比和统一语义图标 | 纳入同一游戏世界中的无障碍/降噪模式；图标只作有许可证的语义资产，不接管整体画风 |
| D:/10451/Downloads/已经整理/AdventureX-Playbook/README.md；AI创业与项目验证_2026_How_to_Start/00_README_快速上手.md | 全文 | Builder 身份、14/60 天真实用户验证、护城河来自工作流/数据/关系/交付 | 形成 Builder Mode 候选和赛后验证路线；不把愿景或训练营说法当 2026 官方规则 |

### 海报与界面样本得到的产品启发

- Research-OS：目标 → 拆解/检索 → 实验调度 → 状态 → 知识记忆 → 分析，归并到 F-013。
- Wisel AI：四年成长陪伴、自我认识、能力模型、学习规划和职业匹配，作为 F-002/006/009 共享长期成长图的验证，不新增模块。
- 专注羊：章节、任务关卡和奖励能把专注组织成叙事；只借阶段感，不把学习变成强制连胜。
- YouGreat：正向记忆“光罐”和稍后重开，转译为私密 Season Highlight Reel。
- 双境及同类选择海报：可借多方案和行动建议，不采用占星/运势作为决定依据。
- Project.L 操作端：角色路由、节点状态、纠错弹窗和待处理队列有价值；中英混排、小字低对比和稀疏空状态不作为视觉目标。

### 明确拒绝

1. 公开 GPA/OVR 羞辱榜、默认全校排名、给人的竞价与付费资格。
2. 占星、运势或黑箱人格画像替代选课、方向、科研和职业决策。
3. 高薪/稳定二选一、单一最优人生路径或模型生成的“晋升/录取成功率”。
4. 让生成式 AI 直接改变成绩、支付、门禁、资助、人事或政策状态。
5. 直播模型/OCR 成为唯一演示路径；100% 可用、第一/唯一等无证据声称。
6. 为 Wow 提前加入完整像素世界、3D 校园、Unity/Unreal 或多客户端。
7. 复制其他项目、NBA/2K、海报、角色、字体、图标或联系方式；内部参考图不进入产品资产。
8. 把 2025 赛事时间、Wi-Fi、支持资源或旧评分表推定为 2026 当前事实。

### 本地 `bili` 私人图库审计（2026-07-23）

- 来源：`D:/10451/Pictures/bili`，只读；共 473 个图像文件、1,121,927,217 bytes，没有复制到项目。
- 方法：为全部文件生成 8 页联系表并逐页视觉检查，另以原始尺寸查看最新成组文件和代表性异常项。联系表位于系统临时目录，不是项目交付物。
- 观察：绝大部分为第三方动漫插画、壁纸或角色图，夹杂少量二维码、商品和社交截图；没有识别到 Figma 组件、Revit/BIM、3D 模型、空间渲染交付或 UI/UX 作品集证据。
- 决策：仅可作为私人情绪板，不能证明任何队员的技能，也不是资产白名单。没有逐图作者、来源、许可证和用途核验前，禁止进入公开仓、Demo、海报或提交物；本次没有导入任何图片。
- 证据限制：这是视觉与来源边界审计，不是逐图版权法律意见，也不能证明收藏者就是图片作者。

## D-Robotics / RDK 研究摘要

**适配角色：** 端侧感知和具身互动，不是为了赞助硬件把项目改成复杂机器人。

```text
摄像头/麦克风/按钮 → RDK 端侧检测/识别 → 可追溯事件 → 教师审核 → 学生反馈
```

**可迁移：** ROS 2/TROS 节点/消息设计、Python/C++ 业务、Web API、source IDs 与事件流。
**必须重验：** RDK OS/TROS/驱动、传感器、标定、网络、模型、延迟、功耗。
**不能跨板复用：** HBM、镜像、驱动、设备树、GPIO/CAN/MIPI 配置和量化结论。

**官方来源：** [D-Robotics 资料中心](https://developer.d-robotics.cc/rdk_doc_center/) · [RDK X5](https://developer.d-robotics.cc/rdkx5) · [RDK S100](https://developer.d-robotics.cc/rdk_doc/rdk_s/Quick_start/hardware_introduction/rdk_s100/) · [TROS](https://developer.d-robotics.cc/tros_doc/tros) · [RDK Studio](https://developer.d-robotics.cc/rdk_studio_doc/product-intro/overview) · [支持硬件边界](https://developer.d-robotics.cc/rdk_studio_doc/product-intro/supported-hardware) · [Model Zoo](https://github.com/D-Robotics/rdk_model_zoo) · [配件](https://developer.d-robotics.cc/accessories_doc/accessories) · [NodeHub](https://developer.d-robotics.cc/nodehub)

待补充：两份地瓜 PDF 在新环境当前缺失，重新提供后按 SHA-256 复核。

---

## WinUI 3 参考

使用方式：控件、可访问性、Windows.Gaming.Input 和工程结构参考，不整包复制。WinUI 是 Windows 原生桌面框架且不是跨平台框架，只作为 Windows adapter / Secondary，不承担全平台 Experience Shell。
本地参考库：`D:\10451\Users\10451\Downloads\WinUI3-Reference\`

## NBA 2K 购买边界

**无需购买。** 资料已足够。若购买只做正常 UX 观察，不绕过 DRM。来源：[Steam](https://store.steampowered.com/app/3472040/NBA_2K26/)

---

## 来源索引

| 类别 | 关键来源 |
|------|----------|
| 赛事 | [AdventureX 终极指南](https://adventurex.feishu.cn/docx/FOhLdr0Y3okbATxWvBQcoFx0nEd) · [官网](https://adventure-x.org/zh) · [FAQ](https://faq.adventure-x.org/advx/01-activities) |
| SIS/URP / Campus OS | [CatCloud](https://catcloud.arizona.edu/) · [UAccess](https://uaccess.arizona.edu/) · [Trellis](https://trellis.arizona.edu/about) · [CatCard](https://catcard.arizona.edu/about) · [UArizona EDW](https://uair.arizona.edu/content/enterprise-data-warehouse) · [上海海洋](https://jwc.shou.edu.cn/2016/0920/c11212a227390/page.htm) · [天津工业](https://jwc.tiangong.edu.cn/2025/0625/c1328a106461/page.htm) · [复旦](https://software.fudan.edu.cn/d1/5a/c29403a315738/page.htm) |
| 支付 / 身份边界 | [UArizona Bursar](https://bursar.arizona.edu/payment/options) · [CatCash](https://union.arizona.edu/catcash) · [Keyless Access](https://catcard.arizona.edu/keyless-access) · [PCI DSS](https://www.pcisecuritystandards.org/standards/pci-dss/) · [中国支付条例](https://xzfg.moj.gov.cn/law/download?LawID=1696&type=pdf) |
| NBA 2K | [2K26 Courtside](https://nba.2k.com/2k26/courtside-report/) · [2K25 Baseline](https://nba.2k.com/2k25/courtside-report/gameplay/) |
| 技术/硬件 | [D-Robotics](https://developer.d-robotics.cc/rdk_doc_center/) · [TuyaOpen](https://www.tuyaopen.ai/zh/docs/about-tuyaopen) · [阶跃星辰](https://platform.stepfun.com/) · [飞书](https://open.feishu.cn/) · [Dify](https://docs.dify.ai/zh/home) |
| 本地资产 | NBA 2K 研究库 · WinUI 3 参考库 · `archive/` 历史材料 |

### 补充官方来源快照

以下链接从 2026-07-21 八入口研究文档恢复到当前主线，目的是让其他 AI 不必依赖归档才能定位原始页面；它们不是“当前仍有效”的自动声明，外部引用前要重新打开核对。

- UArizona 学生体验：[Current Students](https://www.arizona.edu/students) · [Student Tools](https://advising.arizona.edu/student-tools) · [Trellis Progress](https://studentsuccess.arizona.edu/trellis-progress) · [Trellis Privacy Notice](https://trellis.arizona.edu/about/privacy-notice)
- UArizona 排课与教务：[Waitlist Setup](https://registrar.arizona.edu/faculty-staff-resources/room-course-scheduling/rcs-resource-guides/resource-guide-setting-and) · [Waitlist Monitoring](https://registrar.arizona.edu/faculty-staff-resources/forms-help-guides/uaccess-training-information/resource-guide-monitoring) · [Enrollment Transactions](https://registrar.arizona.edu/faculty-staff-resources/forms-help-guides/uaccess-training-information/resource-guide-viewing)
- Unreal 研究边界：[硬件/软件规格](https://dev.epicgames.com/documentation/en-us/unreal-engine/hardware-and-software-specifications-for-unreal-engine) · [安装说明](https://dev.epicgames.com/documentation/unreal-engine/install-unreal-engine?lang=en-US) · [UE 5.8 Release Notes](https://dev.epicgames.com/documentation/unreal-engine/unreal-engine-5-8-release-notes?lang=en-US) · [UE 5.8 公告](https://www.unrealengine.com/news/unreal-engine-5-8-is-now-available)
- 完整赞助/工具来源与 23 个稳定候选 ID：根目录 `PROJECT-MANIFEST.json` 的 `resource_candidates`。

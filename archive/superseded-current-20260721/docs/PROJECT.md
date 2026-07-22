# jiaowu2K26 · 项目总览

> **唯一总项目：jiaowu2K26。“智课工坊”是最初想法，现为其首个 P0 模块。**
> **状态：赛前规划。无可运行代码、新原型或本届 Demo。**
> 最后更新：2026-07-21

## 两句话 Pitch

**jiaowu2K26 不是给旧教务系统换皮，而是把大学四到八年的学习、选课、成长与协作重构成 NBA 2K 式 MyCareer：学期是赛季、课程是阵容、每一次进步都有数据与故事。它从首个可验证模块“智课工坊”起步，让 AI 生成内容先亮出来源、由教师像教练一样审核后再发布，最终把冷冰冰的办事大厅升级为可信、可玩、真正让人想打开的大学生活体验层。**

## 项目从哪里来

最初的问题很具体：教师手里有 PPT、录音和讲义，AI 可以很快生成题目和复习卡，但老师很难确认它从哪里来、是否编造、能不能放心发给学生。这个想法形成了 **智课工坊（SmartCourse Studio）**。

随着讨论深入，问题不再只是“怎么生成一段课程内容”，而是：

> **为什么大学四到八年里最重要的课程、选择、进步、风险和关系，最终只被压缩成一个冷冰冰的办事大厅？**

于是智课工坊从项目本体变成了第一个功能模块，总项目演进为 **jiaowu2K26**。

## 要改变的不是颜色，而是体验结构

传统教务系统擅长记录和办事，却很少帮助学生理解：

- 我正处于怎样的学期和生涯阶段？
- 选这门课会如何影响我的课表、先修路径和毕业进度？
- 这段 AI 学习内容值得信吗，证据在哪里？
- 我这个赛季表现如何，下一步要练什么？
- 考试、课程、活动和生活为什么分散在不同系统？

jiaowu2K26 试图提供这一层解释、反馈与叙事，而不是抢走校方系统的权威责任。

## 产品边界

```text
校方 SIS / URP / LMS / 课程目录       ← 权威业务与原始数据
                     ↓
            Academic Mirror             ← 来源、版本、权威等级
                     ↓
               jiaowu2K26               ← 体验、解释、规划、学习与反馈
```

不在黑客松内重建学籍主库、财务系统、成绩权威入库、校级权限或全量教务运维。

## 模块地图

| 模块 | 产品角色 | 阶段 | 当前状态 |
|---|---|---|---|
| **MyCareer 赛季中心** | 大学生涯、学期、阵容、目标与导航外壳 | P0 外壳 / P1 实体 | 待评估 |
| **智课工坊** | 课程材料、来源、AI 草稿、教师审核与学生互动 | **P0** | 产品定义，未实现 |
| **Academic Mirror** | 可追溯地镜像课程、开课、已修、学期等外部数据 | P1 | 架构候选 |
| **Semester Environment Resolver** | 将必修、先修、冲突、偏好和毕业路径解析为可解释方案 | P1/P2 | 已定设计方向，未选定求解库 |
| **World Exam Finals** | 课前热身、期中排名、期末叙事、复习和可信回放 | P1/P2 | 产品候选 |
| **Performance Center** | 学习进度、能力、徽章与反馈；包含华氏度评分实验 | P2 | 待用户测试 |
| **Coach & Scouting** | 课程/教师风格、Office Hours、组队与可解释建议 | P2 | 待数据与伦理评估 |
| **Opportunity Market** | 期刊、会议、竞赛、科研、实习与权益的透明发现和双向匹配 | P1/P2 | 产品定义，未实现 |
| **Campus Life** | 活动、社团、服务、生活与协作的统一入口 | 愿景 | 不进入当前 MVP |

详细优先级、隐喻和停损线见 [features/TODO.md](features/TODO.md)。

## NBA 2K → 大学生活的产品映射

| NBA 2K 产品语法 | jiaowu2K26 | 目的 |
|---|---|---|
| MyCareer | 从入学到毕业的生涯故事 | 将分散办事恢复为连续成长 |
| 4 / 6 / 8 个赛季 | 本科 / 硕士 / 博士的标准阶段隐喻 | 显示阶段与转段，不把学制写死 |
| 赛季 / 赛程 | 学期 / 课表 / 截止日 | 让时间关系可见 |
| 球队阵容 | 当学期课程组合 | 展示课程间的依赖和负荷 |
| 选秀 / 自由市场 | 选课 / 加课 / 退课 / Waitlist | 让选择、限制和备选更容易理解 |
| 工资帽 | 学分上限与时间/精力预算 | 可视化资源权衡 |
| 参选资格 | 先修、并修与学院要求 | 说明“为什么不能选” |
| 申请交易 | 转专业、转学或培养方案变更 | 将影响和未完成项说清楚 |
| VC / 资源预算 | 时间、精力、实验室与资助容量 | 可视化真实约束，绝不允许付费买分 |
| 卡包 | 内容完全透明的机会包 | 聚合期刊、会议、竞赛、科研和实习，不做付费随机 |
| 拍卖行 / 自由市场 | 机会市场与双方同意的匹配 | 帮学生、项目、导师和企业找到彼此，不给人竞价 |
| Pass | 会议、数据库、Workshop、差旅和奖学金等真实权益 | 记录资格与期限，不用于绕过先修或审批 |
| 球员卡 / OVR | 课程卡 / 自我掌握度 / 能力面板 | 使反馈可读，不伪装成客观人格分 |
| 徽章 | 知识、习惯、协作与关键球成就 | 奖励具体行为，不只奖励分数 |
| Coach Profile | 教师/课程教学方式与 Office Hours | 提供中性、可验证的预期管理 |
| 球探报告 | 课程难度、作业结构、先修建议 | 将建议与来源/适用人群一起展示 |
| 战术板 / Playbook | 教师审核后的学习路径和课程内容 | 教师是教练，保留最终决定权 |
| 比赛回放 / Box Score | 学习来源、答题历史、审核证据和复盘 | 每个数字和 AI 结果能回到依据 |
| 季后赛 / Finals | 期末考和综合任务 | 使复习进度更有结构，不美化焦虑 |
| 球衣退役 | 毕业、成果归档与经验传承 | 给长期努力一个完整收尾 |

## P0：用智课工坊证明整个项目的价值观

智课工坊不是因为它覆盖所有大学生活，而是因为它能用一条最小闭环验证 jiaowu2K26 的三个核心价值：

1. **可信**：AI 输出能回到具体来源；
2. **人作决定**：老师可以修改、通过或移除，未通过的不发布；
3. **学习有反馈**：学生看到不只是答案，还有来源、互动和复盘。

P0 演示可被 MyCareer 赛季外壳包裹，但不得为了做完所有 2K 页面而牺牲这条闭环。

## 两个实验性叙事元素

### World Exam Finals

将“AI 是那个从不 `Show your work` 的学生”变成记忆点：AI 参加开卷考试，老师真正核对它翻过的书。它首先是 Pitch 与产品语言，只在能支持复习和证据回放时才成为功能。

### Degree Fahrenheit

用华氏度探索比普通 0–100 分更有性格的状态语言，例如 `98.6°F` 稳态、`100°F` 发热级、`70°F` 室温级。这是待用户测试的视觉/叙事实验，不是学业评价标准，不能伪装成医学或教育测量结论。

### Opportunity Market

VC、卡包、拍卖行和 Pass 可以保留“资源取舍、组合发现、供需匹配与权益集合”的抽象，但必须移除付费加速、随机资格和给人竞价。具体边界见 [features/OPPORTUNITY-MARKET.md](features/OPPORTUNITY-MARKET.md)。

## 核心产品原则

1. **体验层，不冒充权威层**。
2. **2K 是结构与反馈，不是深色皮肤和排行榜**。
3. **人保留决定权，AI 需要 `Show your work`**。
4. **任何评分都要说明来源、用途和不能代表什么**。
5. **游戏化帮助学生理解与行动，不制造公开羞辱或不必要的焦虑**。
6. **先做一条可验证闭环，再增加一个模块**。
7. **已评估结论进文档，没有证据的内容留在假设区**。

## 72 小时的最小成功定义

| 阶段 | 时间 | 目标 |
|---|---|---|
| 合规与空白基线 | 0–6h | 核对规则、建仓库、定团队/数据合同，验证主栈与回退 |
| 智课工坊核心闭环 | 6–36h | 来源 → AI/规则草稿 → 教师审核 → 发布 |
| MyCareer 学生体验 | 36–48h | 学生完成一次互动，看到来源、反馈与复习卡 |
| 可用性、异常与统一语法 | 48–60h | 修阻断问题、完成回退，让 2K 语法服务主流程 |
| 路演与证据 | 60–72h | 现场截图/录屏、真实测试、开源归属、合规表述与提交 |

如果 P0 在 36 小时时仍不稳定，暂停 Semester Resolver、硬件、WinUI 3 和其他增强，先保住主闭环。

## 对外介绍（30 秒）

> 大学教务系统擅长记录，却很少让人感到自己正在经历一段成长。jiaowu2K26 想把大学生涯重构成 NBA 2K 式 MyCareer：学期是赛季，课程是阵容，选择有解释，进步有回放。第一个模块是智课工坊：AI 从课件生成带来源的草稿，老师像教练一样审核，只有通过的内容才发给学生。我们先用一条真实、可追溯的闭环，证明教务体验可以既可信，又让人想打开。

## English Pitch

> jiaowu2K26 turns university life into a MyCareer experience: semesters become seasons, courses become a roster, and every decision comes with evidence, trade-offs, and a story. Its first playable proof is SmartCourse Studio, where AI must show its sources and the teacher reviews the playbook before anything reaches the student.

## 文档导航

| 文件 | 职责 |
|---|---|
| [TEAM-RECRUITMENT.md](TEAM-RECRUITMENT.md) | 两句话推荐、组队私聊与角色招募的当前主稿 |
| [AI-HANDOFF.md](AI-HANDOFF.md) | 新 AI / 新队友快速接手 |
| [PROJECT-MANIFEST.json](PROJECT-MANIFEST.json) | 机器可读身份、模块、状态与文档地图 |
| [DECISIONS.md](DECISIONS.md) | 产品、架构、开源与交接决策 |
| [features/SMARTCOURSE.md](features/SMARTCOURSE.md) | 智课工坊 P0 闭环与测试目标 |
| [features/TODO.md](features/TODO.md) | 模块组合、优先级、待评估想法与待办 |
| [features/OPPORTUNITY-MARKET.md](features/OPPORTUNITY-MARKET.md) | 机会市场、透明机会包、权益与转段解释边界 |
| [TECH-STACK.md](TECH-STACK.md) | 技术选型摘要 |
| [tech-stacks/CORE-ARCHITECTURE.md](tech-stacks/CORE-ARCHITECTURE.md) | Rust、OceanBase、Academic Mirror 与 Semester Resolver 细节 |
| [tech-stacks/OPEN-SOURCE-REUSE.md](tech-stacks/OPEN-SOURCE-REUSE.md) | 开源复用与许可审计 |
| [research/SIS-URP-UARIZONA.md](research/SIS-URP-UARIZONA.md) | UArizona、URP、开源 SIS 与权威层边界 |
| [research/NBA2K-FEATURE-MAP.md](research/NBA2K-FEATURE-MAP.md) | NBA 2K 模式、历代功能与产品映射 |
| [COMPLIANCE.md](COMPLIANCE.md) | 参赛规则、证据和对外说法 |

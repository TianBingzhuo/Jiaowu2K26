# University2K26 多语言与激励文案合同

> **状态：** V0.9 现场合同
>
> **适用范围：** Web、后续本地壳、CLI 帮助、演示脚本与对外 Pitch
>
> **证据：** [2026-07-24 Chrome 双语与语气审计](../reference/audit/2026-07-24-chrome-bilingual-audit/AUDIT.md)

这份文件统一回答四件事：中文怎样写得自然，英语怎样让不了解 2K 的人也能接住梗，
游戏化怎样支持内驱学习而不操纵，以及未来接入俄语等屈折语言时代码要满足什么。

## 1. 当前交付边界

V0.9 已提供：

- `zh-CN` 与 `en-US` 两个正式 Locale；
- 每个 F-001～F-010 现场界面都能打开同一套 **Bilingual Event Guide**；
- 每个模块都有中英等价的正式名称、一句话承诺、白话解释、梗解释、下一步和安全边界；
- 五种角色都有中英等价的责任 Lens；
- Locale 持久化、`html[lang]`、文档标题、`Intl.DateTimeFormat`、
  `Intl.NumberFormat` 与 `Intl.ListFormat` 底座；
- `intl-messageformat` 的 ICU MessageFormat 运行时；俄语 UI 尚未开放，但测试已验证
  `1 курс / 2 курса / 5 курсов / 21 курс` 的语言规则选择；
- 伪本地化扩展测试，用于提前发现英语变长和未来屈折语言的布局风险。

V0.9 **不冒充完整 UI 翻译**：深层 Fixture 字段、模块内部操作标签与长说明仍以中文为主。
现场英语模式负责让国际评委在任意页面立即理解“这是什么、梗在哪里、下一步做什么、
哪些不是正式数据”。把全部深层文案提取成消息 ID 是 P1 本地化任务，完成前不得把
“双语赛事导览”写成“全产品完整双语”。

## 2. 一条文案的最低结构

每个重要状态、建议或错误至少包含：

```text
发生了什么（状态，不评价人格）
→ 为什么会出现（来源、条件或未知）
→ 现在能做什么（一个最小行动）
→ 能否撤回、纠错或找真人
```

推荐句式：

- “当前还缺一项先修确认；可以比较替代路径，或带着证据联系课程负责人。”
- “这次回答与来源不一致；你的草稿已自动保存，可以修改或发起 Challenge Call。”
- “系统暂时不知道该字段；未知不会被当成不符合，也不会降低任何人员评分。”
- “今天不必赢下整本书，先完成一个可解释、可回放的小回合。”

禁止句式：

- “你落后了 / 你不适合 / 你是差生 / 你拖累了队伍。”
- “只剩最后机会 / 大家都完成了 / 再不做就完了。”
- “AI 判断你会挂科 / 教师 OVR 较低 / 晋升概率 37%。”
- “连续学习 30 天，断签清零。”

## 3. 内驱学习的三条产品检验

游戏化采用 Self-Determination Theory 的三个基本方向，但不把理论名当作效果证据：

| 方向 | University2K26 的实现 | 验收问题 | 失败信号 |
|---|---|---|---|
| 自主 Autonomy | 多方案、可选机会、传统叙事、退出/撤回/纠错 | 学生能说出“我还能选什么”吗？ | 假选择、默认强迫、FOMO、付费捷径 |
| 胜任 Competence | 小回合、即时反馈、自动保存、来源、Replay、Next Move | 操作后是否知道发生了什么和下一步？ | 伪精确总分、永久标签、失败羞辱 |
| 连接 Relatedness | 教师审核、同伴双向意向、导师交接、人工支持 | 协作是否尊重边界和退出？ | 人气排名、匿名围攻、强制组队 |

徽章、等级、赛季和赛事语言只能帮助理解进程，不能替代学习本身。验收时先问：

1. 关闭积分、徽章和动画后，任务是否仍有价值？
2. 学生能否解释自己为何做这一步，而不是只说“为了升级”？
3. 未完成是否仍保留尊严、来源、恢复路径和真人支持？

任一答案为“否”，该机制不得以“提高参与度”为由上线。

## 4. 中英语气：转译，不逐字翻译

英语层始终按两层写：

1. **Punchline**：保留体育游戏节奏；
2. **Plain meaning**：不用 NBA/2K 经验也能理解产品。

| 游戏化名称 | 中文表达 | 英语 Punchline | 白话含义 |
|---|---|---|---|
| MYCAREER | 把大学四到八年打成自己掌舵的生涯 | Build your degree one season at a time. | Degree journey command center |
| SmartCourse Studio | AI 打草稿，教师握发布哨，学生有挑战权 | AI drafts. Teachers own the whistle. Students keep the challenge call. | AI-assisted course studio |
| Academic Mirror | 先看来源，再看分数 | Source before score. | Read-only, traceable academic snapshots |
| Roster Lab | 选课像组阵容，无解也要说人话 | Draft a semester that can actually resolve. | Explainable semester and degree-path solver |
| World Exam Finals | 期末是关键一战，不是对人的终审 | Finals are a key match—not a verdict on a person. | Low-stakes review and exam event |
| Performance Center | 看 Box Score，不给人贴永久 OVR | Read the box score, never a permanent human OVR. | Private learning-state center |
| Opportunity Market | 找到下一片赛场，不靠付费抽卡 | Find the next arena—without pay-to-win. | Explainable opportunity discovery |
| Coach & Scouting | 球探看课程，不给教师人格打分 | Scout the course, not the person. | Course evidence and expectation guide |
| Campus Life Hub | 可探索的校园，也有关闭按钮 | An open-world campus—with an off switch. | Campus activities, collaboration and support |
| Campus Pass | 权限像 Loadout，正式开门仍归学校 | Your campus access loadout. Official decisions stay with the school. | Access rights and recovery drill |

固定梗解释：

- **NAN**：南同学 + `Not a Number`；故意不把学生压成总评。
- **OVR**：体育游戏 Overall Rating；本项目只在解释“拒绝人员总评”时使用。
- **Roster**：学期课程阵容，不暗示课程或教师可以被买卖。
- **Replay**：来源、决定、修改和申诉的证据回放，不是监控录像。
- **Fixture**：安全、可重复的演示数据，不等于假按钮，也不冒充实时学校记录。
- **Degree Fahrenheit**：本人可选的短期学业气候皮肤，不是成绩、能力或医学温度。

中文也不照搬英语。中文优先让动作、责任和边界自然清楚，赛事词作为节奏层：
“进入内容审核席”优于“开始审核 Process”；“卡住不是判负，换条路径继续”优于
“Failure is OK”的直译。

## 5. 未来俄语与其他屈折语言的工程合同

“有中英开关”不等于已经支持俄语。新增任何 Locale 前必须同时通过：

### 消息与语法

- 所有用户可见文本使用稳定消息 ID，不在 JSX 中拼接句子；
- 变量使用具名参数，例如 `{count}`、`{courseTitle}`，不依赖词序；
- 复数、选择和性别分支使用当前 `intl-messageformat` ICU MessageFormat 运行时；
  格变化由完整消息变体和译者处理，不把名词词尾硬编码进业务逻辑；
- 不把英文单复数、中文量词或斜杠并列写死在业务数据里；
- 数据枚举保存稳定 ID，显示名由 Locale Catalog 决定；
- 翻译缺失时回退到英语并记录开发警告，绝不显示消息 ID。

### 时间、数字与数据

- 时间使用 ISO-8601 + 原时区保存，显示统一走 `Intl.DateTimeFormat(locale)`；
- 数字、百分比、货币和列表统一走对应 `Intl` formatter；
- 不解析本地化后的字符串来做业务判断；
- Locale 切换不能改变 API、Schema、排序键、权限或证据哈希。

### 布局与字体

- 所有文本容器允许换行，使用 `min-width: 0`、`text-wrap` 与弹性高度；
- 不用固定像素宽度承诺“一行放下”；
- 新 Locale 先跑 `en-XA` 伪本地化，按至少 30–40% 文本扩展审计；
- 窄窗、200% 文字缩放、长姓名、长课程名与复数变化必须单独走查；
- 字体需要相应 Unicode 覆盖与许可证；当前 Inter/Noto 包含 Cyrillic 子集，但俄语
  上线仍要逐字形、粗细与回退检查；
- `dir` 已有底座；未来阿拉伯语/希伯来语必须把物理 `left/right` 样式迁移为
  `inline-start/inline-end`，不能只改 `dir="rtl"`。

### 当前尚未通过的俄语闸门

- 深层模块仍存在大量 JSX 中文字面量；
- 部分游戏术语和 Fixture 业务数据尚未从内容模型中分离；
- 伪本地化目前覆盖 Catalog，不覆盖全部模块截图；
- 还没有俄语语言专家的语法、文化与游戏梗复核。

因此当前结论是：**架构方向已就位，俄罗斯语尚不能直接“加一份 JSON 就上线”。**

## 6. PR 验收清单

- [ ] 中文首读自然，不夹杂不必要的英文流程词。
- [ ] 英语同时有 Punchline 与 Plain meaning。
- [ ] 文案描述状态与行动，不评价人格、能力或道德。
- [ ] 奖励机制关闭后，核心任务仍有明确价值。
- [ ] 下一步、来源、撤回/纠错/真人通道至少有一项可见。
- [ ] `Fixture / live / cached / unknown` 不互相冒充。
- [ ] 新日期、数字和列表没有硬编码 Locale。
- [ ] 新文本通过 Catalog 完整性测试与伪本地化扩展测试。
- [ ] Chrome/Edge Chromium 主路径实测；其他引擎只能按实际证据声明。
- [ ] 真实跨语言用户的首读复述单独记录，AI 审查不冒充用户研究。

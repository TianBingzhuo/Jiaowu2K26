# HF-02 · Degree Fahrenheit A/B/C 认知访谈包

> **状态：** `protocol_ready_no_participant_evidence`
> **当前决定：** `DEFER`
> **证据人数：** `0 / 6–10`
> **默认产品版本：** `C · 无隐喻多维面板`
> **适用版本：** University2K26 V.9 · F-006 Fixture 纵向切片
> **审核要求：** 产品总集成人员必须在真实招募前检查脚本、原型版本与记录位置。

本文件只是一套可复核的研究协议，不是“用户验证已完成”的声明。AI 不模拟参与者，也不依据团队喜欢这个梗就把数字温度放进默认产品。

## 1. 这次只回答什么

`Degree Fahrenheit · Academic Climate` 是本人私密、主动开启、随时关闭的短期状态外观层。本轮只验证：

1. 用户首读时会把它理解成什么，认为由谁计算、会影响什么；
2. A 数字、B 文字、C 无隐喻三版中，哪一版最可理解、可行动且压力最低；
3. 是否出现成绩、医学诊断、永久能力、官方结论或“越高越好”的误解；
4. 用户能否找到原始维度、证据、纠错、关闭与分享边界。

它不验证学习效果，不比较参与者能力，不收集真实成绩，也不支持“学生都喜欢”的统计性结论。

## 2. 研究边界

- **参与者：** 6–10 名便利样本，尽量覆盖不同年级、专业、游戏经验和语言背景；样本不代表全校。
- **单次时长：** 15–20 分钟认知访谈 + think-aloud。
- **设备记录：** 只记录本次使用的输入路径与设备类别，例如键鼠、触屏、手柄、读屏；不记录设备指纹。
- **禁止收集：** 姓名、学号、真实 GPA/排名、门禁、消费、夜间在线、健康或心理信息、聊天内容、人气、付费行为。
- **标识：** 只使用 `P01`、`P02` 等随机编号。
- **原始材料：** Git 仓只保存匿名摘要；录音、可识别截图与联系方式不得进入仓库。

## 3. 招募前审核清单

- [ ] 产品总集成人员确认本文件与 [F-006 规格](SPEC.md)一致。
- [ ] 使用的原型 commit 或本地版本已记录，三版只有表达方式不同。
- [ ] 默认进入 C 版；A/B 只能从标有“研究预览”的入口主动开启。
- [ ] 每版都能看到原始维度、依据、时间范围、非成绩/非医学边界和关闭入口。
- [ ] STOP 操作已验证：报告压力后数字/身份文案立即撤下并回到 C 版。
- [ ] 记录表不要求任何可识别个人信息。
- [ ] 若录音，另行取得明确同意；拒绝录音不影响参与。

## 4. 参与同意说明

研究员逐字或等义说明：

> 我们正在测试一个大学生活软件中的三种“本人状态”表达。今天测试的是界面，不是测试你。它不会读取或改变你的真实成绩、选课、资格、门禁或支付，也不会形成医学判断。你可以跳过任何问题、随时停止、要求删除本次记录；这不会带来任何损失。我们只保存匿名编号和研究笔记。若希望录音，我会单独询问；不同意录音也可以继续。你是否愿意参加？

记录：

- 参与同意：`yes / no`
- 录音同意：`yes / no / not_requested`
- 删除请求截止与方式已说明：`yes / no`

参与同意不是 `yes` 时立即结束，不保留该参与者数据。

## 5. 无诱导任务

先只说目标，不解释梗、设计意图或“正确答案”：

> 请把它当作你第一次打开的大学生活软件。边看边说你觉得这是什么、你准备做什么、哪里让你犹豫。请找到：本周发生了什么、依据在哪里、你能做什么，以及不想使用这种表达时怎么退出。

本地原型路径：

1. 启动 `scripts/Start-University2K26.ps1`；
2. 打开 `http://127.0.0.1:4173/`；
3. 从首页进入“生涯数据 / Performance Center”；
4. 研究员按分配顺序展示 A、B、C，不提前评价任何一版。

## 6. 三个刺激版本

### A · 数字隐喻

- 展示 `60°F / 70°F / 98.6°F / 100°F` 四张离散研究卡；
- 与原始负荷、期限、任务清晰度、支持和未知项并列；
- 明示“不是成绩、能力值、医学温度或连续科学量表”；
- 不设置总分、权重、排行榜或动画庆祝“升温”。

### B · 文字状态

- 只显示“回暖中 / 室温 / 稳态 / 过热”；
- 不显示数字刻度；
- 原始维度、证据、时间范围和退出入口与 A 完全相同。

### C · 无隐喻对照

- 只显示负荷、期限、进度、任务清晰度、支持和未知项；
- 不出现温度、身份或人格化标签；
- 是当前产品安全默认。

研究员不能口头补救首读误解。先记录原话，再允许参与者查看界面自带边界说明。

## 7. 顺序轮换

| 参与者 | 第一版 | 第二版 | 第三版 |
|---|---|---|---|
| P01 / P07 | A | B | C |
| P02 / P08 | B | C | A |
| P03 / P09 | C | A | B |
| P04 / P10 | A | C | B |
| P05 | B | A | C |
| P06 | C | B | A |

参与者少于 10 人时按编号从上到下使用；不得为了让 A “看起来更好”临时改顺序。

## 8. 每版固定问题

展示后按顺序提问，不先解释：

1. 你觉得这是什么？谁算出来的？会影响什么？
2. 98.6°F 和 100°F 哪个更好？为什么？
   B/C 版也保留此题，用来检查前一版是否造成方向锚定；若该参与者尚未看过 A，则先问“你从当前界面能看出越高越好吗？”
3. 它是不是成绩、能力、医学体温或学校正式结论？
4. 你下一步会做什么？从哪里看依据、修改数据或关闭它？
5. 你愿意让谁看到？哪些数据绝不能参与？
6. 这个表达让你觉得鼓励、平静、困惑、被评判还是焦虑？为什么？

完成三版后再问：

- 哪一版最容易准确复述？
- 哪一版最能帮助你决定下一步？
- 哪一版最不愿再次看到？
- 如果保留一版，需要先改掉什么？

不要求在给定选项中强选；“都不应保留”是有效答案。

## 9. 单次匿名记录模板

```yaml
session_id: HF-SESSION-###
card_id: HF-CARD-001
prototype_commit: "<git sha 或明确本地版本>"
participant_id: "P##"
participant_scope: "student"
sampling_note: "只写年级段/专业大类/游戏经验等必要分层，不写可识别信息"
input_path: "controller | keyboard | mouse | touch | assistive_technology"
viewport_and_device: "<类别与尺寸，不写序列号>"
consent:
  participate: true
  recording: false
variant_order: ["A", "B", "C"]

observations:
  A:
    first_read_meaning: ""
    who_calculates_and_effect: ""
    direction_understanding: ""
    next_action: ""
    evidence_or_exit_found: "yes | with_help | no"
    grade_or_medical_misread: ""
    pressure_or_identity_signal: ""
    privacy_boundary: ""
    anonymized_quotes: []
  B: {}
  C: {}

task_outcome: "completed | completed_with_help | failed | stopped"
accessibility_observations: []
counterexamples: []
participant_preference_with_reason: ""
researcher_interpretation: ""
sample_limits: ""
deletion_requested: false
```

空字段表示“未观察到/未询问”时必须写明，不能把空白自动解释成没有问题。

## 10. 汇总模板

```yaml
study_id: HF-02
prototype_commit: ""
participants_completed: 0
participant_scope_and_limits: ""
orders_used: []
raw_counts:
  understood_private_optional_non_grade_non_medical:
    A: 0
    B: 0
    C: 0
  found_evidence_and_exit_without_help:
    A: 0
    B: 0
    C: 0
  grade_misread:
    A: 0
    B: 0
    C: 0
  medical_misread:
    A: 0
    B: 0
    C: 0
  higher_is_better_misread:
    A: 0
    B: 0
    C: 0
stop_signals: []
counterexamples: []
accessibility_findings: []
decision: "KEEP | REVISE | DEFER | STOP"
decision_reason: ""
acceptance_updates: []
unresolved: []
reviewers: ["product_integrator", "performance_center_owner"]
```

只报告原始人数和匿名原话，不把 6–10 人换算成看似精确的百分比。

## 11. 决策闸门

### KEEP 的最低条件

- 没有未处理的 STOP 风险；
- 参与者无需研究员提示，能说清“本人私密、可选、非成绩、非医学”；
- 能找到原始维度、证据、纠错和关闭入口；
- 能据此说出一个合理下一步；
- 反例、可访问性需求和样本局限均有记录。

KEEP 只允许继续受控实现，不代表效果已被证明。

### REVISE

出现可定位、可通过文案/结构/权限/退出路径修复的问题；修改后必须重新从无诱导首读开始测试。

### DEFER

不足 6 名、目标群体覆盖不足、原型版本不一致、记录缺失或关键风险没有证据时，继续使用 C 版，A/B 保持研究预览。

### STOP

满足任一项即先下线相应表达：

- 重复出现“官方分数、真实能力、医学诊断、越高越好”的误解；
- 造成明显羞辱、焦虑、被评判或永久身份感；
- 退出、关闭、纠错或撤回无法完成；
- 只有依赖被禁止数据或强行解释才能成立。

STOP 后保留无隐喻维度、证据和支持动作，不删除学生查看与纠错数据的权利。

## 12. 当前结论

```yaml
decision: DEFER
evidence_count: 0
reason: "协议与可操作原型已经就绪，但尚无真实参与者首读证据。"
product_default: "C · 无隐喻多维面板"
allowed_now:
  - "A/B 仅在本人主动打开的研究预览中出现"
  - "STOP 可立即撤下温度与状态文案"
forbidden_now:
  - "把数字版设为默认"
  - "把温度用于成绩、资格、排序、分享默认值或建议决策"
next_authorized_action: "产品总集成人员审核本协议后，再招募真实参与者。"
```

## 13. 追溯

- [人因研究章程 §6](../../product/HUMAN-FACTORS.md#6-degree-fahrenheit-专项协议)
- [F-006 功能规格](SPEC.md)
- [F 模块交付闸门](../../engineering/F-MODULE-DELIVERY-GATE.md)
- 实现入口：`app/apps/web/src/features/performancecenter/`
- Fixture：`app/fixtures/v1/performance-center.demo.json`
- 合同：`app/contracts/v1/performance-center-fixture.schema.json`

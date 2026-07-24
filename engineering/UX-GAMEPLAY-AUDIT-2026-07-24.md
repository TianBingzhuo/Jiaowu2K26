# University2K26 游戏化交互审计

审计日期：2026-07-24
审计范围：首页、课程阵容、World Exam Finals、Performance Center Privacy Replay、Coach & Scouting、Campus Life Hub、Campus Pass
方法：本机真实浏览器走查、用户截图对照、Microsoft 焦点 / 认知包容设计资料校准。

后续十模块回归、Chrome/Edge 精确标签页测试、Computer Use 接入边界、修复前后截图与
按优先级优化清单统一记录在
[V0.9 双通路产品 QA](../reference/audit/2026-07-24-dual-path-product-qa/AUDIT.md)。
该回归追加验证了根页面返回保护、跨模块/跨阶段滚动复位、Opportunity Market
筛选栏、Academic Mirror 快照反馈与时间格式，以及 World Exam `2/2 → Replay`。

## 总判断

当前版本已经有明确的 University2K26 视觉身份，但不同页面处在三种成熟度：

1. **首页**：已像生涯模式大厅，层级与气氛成立。
2. **World Exam Finals**：赛事壳成立，但原答题回路被“手动保存 + 隐藏前置条件”
   打断。
3. **课程抽屉与 Privacy Replay**：原版信息正确却偏门户 / 管理后台；本轮已完成
   第一轮游戏循环重构。
4. **Campus Life Hub**：六段 Campus Concourse 路径已形成完整游戏菜单节奏，地图、
   MyCOURT、组队和支持服务仍保持真实世界边界。
5. **Campus Pass**：五段 Loadout / Drill / Queue / Safety / Replay 已成为可操作
   的高风险功能样板；游戏反馈成立，但正式权限与执行权始终留在外部系统。

下一阶段不应靠增加更多发光边框来“游戏化”，而应统一交互循环：

> 看见目标 → 做一个动作 → 立即收到反馈 → 明确下一步 → 可回放、可撤回。

## 已修复的阻断项

| 等级 | 问题 | 修复 |
| --- | --- | --- |
| P0 | D-pad 与摇杆没有可见、可靠的四向焦点 | 改为二维空间导航；区分四方向；加入 0.50 死区、长按重复、原始多轴扫描、现场诊断与独立手柄焦点环 |
| P0 | 浏览器返回直接离开整个系统 | 为模块和抽屉建立 History API 路由；直接模块深链也先种入 `#/career` 根条目 |
| P0 | 两题答完仍不能继续 | 删除重复挑战条件；增加 `0/2 → 2/2` 回合进度，把可用的 Replay 主行动移到题目区上方并自动聚焦 |
| P0 | 做题要求手动保存 | 选择即自动保存，状态区明确说明刷新可恢复、完成前可修改 |
| P1 | Demo 步骤被流程门锁住 | 黑客松公开 Demo 全七步可直接试玩；正式模式的流程门仍保留在领域层 |
| P1 | 课程卡固定布局 | 提供紧凑 / 标准 / 大卡三个安全预设、拖动排序、44 px 上移 / 下移与重置 |
| P1 | 首页缺少轻量鼓励 | 增加不弹窗、不打断的“今日战术板”；当前使用人工审核 Fixture |
| P1 | 课程详情缺少人物与赛前氛围 | 为 SLS Demo 加入原创虚构课程教练视觉，并永久显示 Fixture / 非真实教师边界 |
| P1 | Privacy Replay 像管理后台 | 重组为 Share Loadout / Challenge Call / STOP Gate / Replay Ledger 四个可切换回合，一次只显示一个行动面板 |
| P1 | 功能增长后左侧第十个入口被固定底栏覆盖 | 导航轨改为紧凑 74 px 项与独立纵向滚动，Edge 已从 MyCareer 点击进入 Campus Pass |

## 视觉与信息架构判断

### 首页

保留：

- 深色校园 Arena、橙蓝对抗色、左侧阵容导航、中央主行动、右侧赛季信息。
- 一眼可见的“今天打哪一场”和一个主要 CTA。

调整原则：

- “今日战术板”只能是一条上下文建议，不做弹窗、连续通知或焦虑文案。
- AI 个性化必须是 BYOK / 明确开启；默认不得读取 GPA、排名、支付、门禁、健康或
  夜间在线数据。

### 课程阵容

不采用任意像素级宽高编辑器。原因是它会破坏响应式、焦点顺序和队友复现。
采用三档预设 + 排序，既让学生拥有控制权，也保持跨端稳定。

教师照片只作为可选的二级视觉层：

- 必须有教师明确同意和图片权利；
- 不能用照片推断“严厉、好说话、给分高低”等人格标签；
- 公共 Demo 使用 AI 生成的虚构 Fixture 教师或课程主题图，不抓取真实教师头像；
- 没有照片时课程卡必须完整可用。

本轮已经把原创虚构人物
`reference/assets/university2k26-fictional-course-coach-v1.png`
限定到 SLS 课程详情 Hero 与该课程的“大卡”阵容视觉，不进入其他课程卡，也不会
成为课程事实来源。

### World Exam Finals

这是目前最接近游戏逻辑的模块。答题页继续遵守：

- 选择即反馈、即保存；
- 失败是本回合信号，不变成永久能力标签；
- “挑战 AI 断言”既是答案语义也是系统动作，不能要求重复点击；
- 完成态应有清晰的 Stage Clear / Replay 转场，而不是普通表单提交成功。
- 主行动不能藏在固定底栏下；当前完成态把 Replay 解锁条与可执行 CTA 放在题目区
  上方，答案与自动保存状态仍留在同一回合中。

## 本地 Microsoft 设计指南校准

本轮逐页核对了 `C:\Downloads\已经整理\微软设计指南` 中与当前问题最相关的资料：

- `RespectingFocus.pdf`：非紧急提示不能打断主任务。因此“今日战术板”只在首页
  原位出现，不使用弹窗、自动朗读或连续 toast。
- `CreatingForGuidance.pdf`：帮助需要同时照顾信心、动机与情境。因此鼓励文案必须
  指向一个可执行的小回合，而不是空泛夸奖或伪精确胜率。
- `MentalHealthCards.pdf`：操作后要即时反馈、给出清晰下一步，并避免责怪用户。
  这直接对应选择即保存、`2/2` 解锁、Replay CTA 和非人格化错误表述。
- `InclusiveDesignForCognitionGuidebook.pdf`：动机、目标与任务需要对齐。赛事叙事
  负责解释“为什么做”，题目、来源与回放仍负责真实学习任务。
- `External_SecurebyDesign_UserExperience.pdf`：安全默认值应尽量少依赖用户配置。
  因此 Fixture、隐私、本地缓存与不公开排名均为默认，不需要学生先找到开关。

当前主要剩余风险是个别信息密集模块仍有 9–11 px 的辅助文字与嵌套滚动。它们不是
通过继续增加发光解决，而要在后续模块验收中做“一个回合一个主要动作”的结构化减法。

### Performance Center / Privacy Replay

原页是最明显的“后台化”区域。功能没有删除，本轮已经重构为：

- **Share Loadout**：先选要分享的维度卡，再在确认层填写对象、用途、到期时间；
- **Challenge Call**：选择一条 Replay 记录并发起纠错，不先展示大段表单；
- **STOP Gate**：单独的高优先级安全行动，触发后明确回退到了哪个安全版本；
- **Replay Timeline**：把授权、撤回、纠错和停损呈现为事件回放，而不是审计日志表。

四个入口使用同一场景菜单，一次只展开一个行动回合；隐私、撤回、纠错与停损
不因换皮牺牲严肃性。

### Campus Life Hub

F-008 采用 `Concourse → Map → MyCOURT → Squad Link → Support Line → Replay`
六段开放式路径。它借鉴开放世界游戏的地点选择、任务板和私人基地语义，但不制造
自由漫游或正式办事已经完成的假象：

- Concourse 一次展示推荐理由、来源、时效、办理边界与一个明确动作；
- Map 使用原创虚构校园总览图和静态无障碍路径，不启动 GPS、不追踪学生位置；
- MyCOURT 只保存私有收藏、本人可读不可信导出和非权威办理镜像；
- Squad Link 只有双方意向成立后才披露最小协作字段；
- Mentor Handoff 只生成学生可带走的问题与证据包，导师回复保持 `null`；
- Support Line 把紧急渠道置于留存与营销之前，通知偏好不能关闭紧急入口；
- Replay 把来源纠错与私有线下回执分开，参与次数不影响学生价值评分。

场景背景为原创生成资产
`reference/assets/university2k26-campus-life-background-v1.png`，只代表虚构 Campus
Concourse，不得声称为真实校园、真实路线或正式服务入口。

### Campus Pass

F-010 采用 `Pass Wallet → Reader Drill → Access Queue → Safety Desk → Pass Replay`
五段回合。视觉继续使用同一 Campus Concourse 原创资产、全局色彩、Barlow Condensed
显示字体、Motion Tokens 和 44 px 输入合同，没有为“门禁模块”另造一套后台皮肤：

- Wallet 卡片把签发方、范围、期限、状态和来源作为 Loadout 属性，不显示真实密钥；
- Reader Drill 对普通 NFC 演练给即时反馈，对动态二维码静态截图明确拒绝，两者都
  保持 `official_access_granted=false`；
- Access Queue 把普通区域和受控实验室的差异变成可见前置条件，不用黑箱资格分；
- Safety Desk 把遗失/冻结/恢复、无手机人工核验、残障陪同、应急权威方与本人纠错
  放在同一恢复回路，但不直接执行任何高风险动作；
- Replay 同屏显示 Wallet、Reader、Queue 与三个关键零值（正式签发、正式门禁动作、
  精细追踪），并把九条安全 invariant 作为发布停损线。

## 验证边界

- 本轮在当前 Microsoft Edge / Chromium 中实际验证站内 History 返回、课程抽屉、
  World Exam 自动保存与解锁、三档课程卡、Privacy Playbook、F-007 六阶段，以及
  F-008 的检索/画像关闭、日历冲突、无障碍静态路线、MyCOURT、组队/导师、通知、
  纠错、私有回执与重置。
- F-010 额外完成 Wallet、静态 QR 拒绝、普通/受控权限申请、访客草稿、状态镜像、
  冻结交接、无手机回退、本人记录纠错与 Replay；从 MyCareer 的第十个导航入口可
  点击进入，直接深链的浏览器 Back 回到 `#/career`。
- D-pad / 摇杆二维寻焦具有单元测试与浏览器代码路径，但用户仍需用当前实体手柄
  做最后复测；不能把代码路径写成实体硬件通过。
- Firefox 与 Safari 只有构建目标、标准 API 与兼容性审计，尚无对应运行时证据；
  详见 `engineering/BROWSER-COMPATIBILITY.md`。

## 审计截图

- `reference/audit/2026-07-24-gameplay-navigation/01-home-before.png`
- `reference/audit/2026-07-24-gameplay-navigation/02-course-roster-before.png`
- `reference/audit/2026-07-24-gameplay-navigation/04-key-match-blocked-before.png`
- `reference/audit/2026-07-24-gameplay-navigation/05-privacy-replay-before.png`
- `reference/audit/2026-07-24-gameplay-navigation/06-home-after-core-fixes.png`
- `reference/audit/2026-07-24-gameplay-navigation/07-privacy-playbook-after.png`
- `reference/audit/2026-07-24-gameplay-navigation/08-course-coach-after.png`
- `reference/audit/2026-07-24-gameplay-navigation/09-coach-scouting-overview.png`
- `reference/audit/2026-07-24-gameplay-navigation/10-coach-governance-after.png`
- `reference/audit/2026-07-24-gameplay-navigation/11-campus-life-concourse.png`
- `reference/audit/2026-07-24-gameplay-navigation/12-campus-life-map.png`
- `reference/audit/2026-07-24-gameplay-navigation/13-campus-life-replay.png`
- `reference/audit/2026-07-24-current-ui-audit/03-world-finals-ready.png`
- `reference/audit/2026-07-24-current-ui-audit/04-career-roster-large.png`
- `reference/audit/2026-07-24-current-ui-audit/05-key-match-before-after.png`
- `reference/audit/2026-07-24-current-ui-audit/06-career-before-after.png`
- `reference/audit/2026-07-24-current-ui-audit/07-campus-pass-wallet.png`
- `reference/audit/2026-07-24-current-ui-audit/08-campus-pass-reader-reject.png`
- `reference/audit/2026-07-24-current-ui-audit/09-campus-pass-access-queue.png`
- `reference/audit/2026-07-24-current-ui-audit/10-campus-pass-replay.png`

这些图片只用于本地设计回归，不是正式宣传素材。

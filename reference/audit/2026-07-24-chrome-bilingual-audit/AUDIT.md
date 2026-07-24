# University2K26 Chrome 双语、语气与国际化审计

审计时间：2026-07-24（Asia/Shanghai）

浏览器通路：Codex 官方 Chrome 扩展，实际承载于本机 Microsoft Edge Chromium

测试地址：`http://127.0.0.1:4173/`

分支：`agent/phase0-foundation`

## 1. 结论先行

### 视觉与交互

- 学生 MyCareer 首页、角色选择器、教师 Coach Studio 和 World Exam Finals 已形成同一
  款原创大学生涯游戏的视觉世界，不是普通门户换深色皮肤。
- 主目标、来源边界、Fixture 状态和 Next Move 清楚；英文 HUD 不承担正式语义时，
  中文会给出正式名称与风险边界。
- 10 个核心入口均能在 Chrome/Edge Chromium 渲染，无页面级横向溢出，控制台
  `warn/error` 为 0。
- Coach & Scouting 补齐稳定页面级标题；Campus Life 在 Squad/Replay 阶段补齐
  页面级标题。

这不是“全功能所有组合状态都被人工点过”的声明。Chrome 本轮覆盖十入口 smoke、
角色切换、语言切换、双语解说与代表性主路径；120 条原有单元测试覆盖领域与交互引擎，
新增 5 条测试覆盖双语 Catalog、角色说明、伪本地化与 ICU 俄语复数规则，合计
125 条通过。实体手柄、Firefox、Safari 与
真实跨语言参与者仍是独立证据。

### 文案与内驱

当前文案整体友善，原因不是“语气可爱”，而是它普遍做到：

- 描述临时状态，不把结果写成人格；
- 给出一个可执行小回合，而不是制造连续打卡和焦虑；
- 允许传统叙事、减少动效、退出、纠错与 Replay；
- 不公开 OVR、GPA 排行、教师排名或 AI 通过概率；
- 把机会、组队、支持与门禁的正式权力留给相应责任人。

剩余风险：

- `赛季 / Finals / Key Match / 截止日` 对部分学生仍可能增加压力，必须保留传统叙事；
- 等级与里程碑易被误读为外在奖励目标，后续用户研究要验证学生能否说出学习本身的理由；
- Degree Fahrenheit 的温度方向存在文化和科学误读，不能进入默认总分；
- 当前英语是完整“赛事解说层”，不是深层字段的全量翻译。

## 2. Chrome 十入口结果

| 路由 | 首屏状态 | 横向溢出 | 主内容 | 结论 |
|---|---|---:|---:|---|
| `#/career` | MyCareer / 当前角色 Lens | 无 | 1 个 main | 通过 |
| `#/smartcourse` | 来源授权与 AI 草稿入口 | 无 | 1 个 main | 通过 |
| `#/academicmirror` | Truth Lens | 无 | 1 个 main | 通过 |
| `#/rosterlab` | 学期环境求解 | 无 | 1 个 main | 通过 |
| `#/worldexam` | 赛事日历 | 无 | 1 个 main | 通过 |
| `#/performancecenter` | Self Baseline | 无 | 1 个 main | 通过 |
| `#/opportunitymarket` | Market Board | 无 | 1 个 main | 通过 |
| `#/coachscouting` | Coach & Scouting | 无 | 1 个 main | 修复标题后通过 |
| `#/campuslife` | Campus Life 当前阶段 | 无 | 1 个 main | 修复特定阶段标题后通过 |
| `#/campuspass` | Campus Loadout | 无 | 1 个 main | 通过 |

基线测试时所有页面为 `lang=zh-CN`；切换英语赛事导览后验证：

- `html.lang=en-US`；
- `dir=ltr`；
- 文档标题切换为 `University2K26 · Your Degree, Your Career Mode`；
- 当前模块、当前角色、正式含义、梗、下一步与安全边界全部英语可读；
- 解说面板在 1667×905 视口内，无页面级横向溢出；
- Locale 切换后日期由对应 `Intl.DateTimeFormat` 重新格式化。

## 3. 国际化真实状态

审计前：

- 没有 Locale Provider；
- `index.html` 固定 `zh-CN`；
- 六处日期显示硬编码 `zh-CN`；
- 两千余处包含中文的代码字符串尚未进入 Catalog；
- 英文多数是标题装饰，不能让国际访客完整接住产品梗。

本轮完成：

- 两个正式 Locale 与浏览器语言/本地偏好选择；
- 全十模块 + 五角色的中英赛事解说 Catalog；
- `html.lang/dir`、本地持久化和本地化文档标题；
- 六处日期显示改为 Locale-aware formatter；
- 英语现场梗词典与 Plain meaning；
- Catalog 完整性、角色覆盖、25% 以上扩展压力测试，以及
  `intl-messageformat` 的俄语 `one / few / many / other` 复数选择证明；
- 未来俄语所需的工程闸门写入
  [LOCALIZATION-AND-TONE](../../../engineering/LOCALIZATION-AND-TONE.md)。

因此：

- **AdventureX 现场中英理解：** 可用；
- **整套 UI 全量中英翻译：** 未完成，不能虚报；
- **直接新增俄语并上线：** 不可；先提取深层文案并接 ICU 级复数/格变化。

## 4. 截图证据

| 编号 | 文件 | 说明 |
|---:|---|---|
| 01 | `01-baseline-student-home.png` | 学生 MyCareer 基线 |
| 02 | `02-baseline-role-picker.png` | 五角色选择器基线 |
| 03 | `03-baseline-teacher-home.png` | 教师 Coach Studio 基线 |
| 04 | `04-baseline-world-exam.png` | World Exam Finals 基线 |
| 05 | `05-english-guide-teacher.png` | 教师页英语赛事解说 |
| 06 | `06-english-guide-world-exam.png` | World Exam Finals 英语赛事解说 |
| 07 | `07-final-student-english-guide.png` | 最终学生首页英语赛事解说回归 |

这些截图是本地设计与语言回归证据，不是赛事提交图，也不替代真实国际用户首读测试。

## 5. 后续按风险排序

1. P0：让 2–3 位不熟悉 NBA/2K 的英语使用者做 10 秒首读复述。
2. P0：现场按演示脚本走一遍学生和教师角色，验证解说不会挡住主要 CTA。
3. P1：把 F-001/F-002 Demo 主路径的深层按钮、错误与回执提取进 Catalog。
4. P1：加入全页面 `en-XA` 截图回归，覆盖 40% 文本扩展和窄窗。
5. P1：需要俄语时把深层字段接入现有 ICU MessageFormat，并由俄语使用者复核格、
   复数、姓名和梗。
6. P2：完成 Firefox、Safari/iOS 实机证据；在此之前只声明目标兼容。

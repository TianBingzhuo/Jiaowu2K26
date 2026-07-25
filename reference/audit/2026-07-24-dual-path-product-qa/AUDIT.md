# University2K26 V0.9 双通路产品 QA

日期：2026-07-24
范围：MyCareer 与 F-001、F-003～F-010 的本地 Web Demo
测试地址：`http://127.0.0.1:4173/`
测试通路：Chrome/Edge 扩展精确标签页控制；Windows Computer Use 真实窗口接入检查

## 结论

当前版本已经具备可以连续演示的主干：十个入口都能渲染，MyCareer 的键盘方向键、Enter、Esc 与浏览器返回层级有效；Roster Lab 能生成三套可解释方案；World Exam 能自动保存两道题、在 2/2 后解锁 Replay；Opportunity Market 的搜索筛选有效；浏览器控制台没有警告或错误。

本轮修复了五类可复现问题：

1. MyCareer 根页增加同文档返回保护，误按一次浏览器返回不再直接落到 `about:blank`。
2. 所有全屏模块切换、七个模块的内部阶段切换都会回到页面顶部。
3. 补齐标准 `.sr-only` 样式，Opportunity Market 的“搜索机会 / 按类别筛选”继续保留无障碍名称，但不再挤占视觉布局。
4. Academic Mirror 把“生成新快照”改为“检查并生成快照”，明确显示“内容哈希未变化、追加哪一份审计收据”，并统一显示本地化时间。
5. Coach & Scouting 的“返回赛季”统一为“返回 MyCareer”。

Computer Use 能定位到包含 University2K26 的 Edge 窗口，但该窗口同时包含 11 个标签页，工具无法可靠确认当前标签 URL，因此按安全策略停止控制。没有发生误点击或外部写入。下一次需要把本地 Demo 单独放在只有一个标签页的 Edge 窗口，再执行真实窗口回归。

## 逐步审计与健康度

1. **MyCareer 首页与课程阵容 — 绿色**
   - 视觉层级、赛季叙事、教师图片、大卡预设和输入提示完整。
   - 方向键从“我的赛程”移动到“课程与考试”，Enter 打开课程抽屉，Esc 关闭并把焦点还给原按钮。
   - 从机会市场按浏览器返回能回到 MyCareer。

2. **F-001 SmartCourse Studio — 绿色**
   - 来源、审核、发布、学生互动与 Replay 的边界清楚。
   - 视觉更接近“严肃的比赛后台”，适合作为可信内容生产线；后续可增加回合结算，不应削弱审核严肃性。

3. **F-003 Academic Mirror — 黄色转绿色**
   - 数据源、字段级来源、冲突、用途授权和审计链完整。
   - 原问题：点击快照只看到数字增加，用户无法理解为何相同内容还会产生快照；时间格式混用 `+08:00` 与 `Z`。
   - 已修复：显示内容哈希未变化、具体审计收据 ID、本地化时间。
   - 产品层仍建议：学生日常入口叫“Data Passport”，完整 Academic Mirror 留在高级控制台。

4. **F-004 Roster Lab — 绿色**
   - Build Board → Draft Board 的求解链路正常，生成三套方案，约束、迁移数、容量与冲突可解释。
   - 原问题：求解后保留了旧滚动位置，可能直接落到方案中段。
   - 已修复：阶段变化后回到标题与三套阵容总览。

5. **F-005 World Exam Finals — 绿色**
   - 重置后全部七个 Demo 阶段可打开。
   - 两道题均“选择即保存”；完成 2/2 后按钮变为“完成并进入 Replay”并成功解锁。
   - Replay 显示 100%、2/2、来源挑战与证据时间线，不展示排名、GPA 或人格化标签。
   - 这是当前最完整、最像游戏回合的模块。

6. **F-006 Performance Center — 绿色偏黄**
   - 私密基线、趋势、负荷、建议和 Privacy Replay 的边界完整。
   - 信息密度较高，首屏更像分析驾驶舱；后续应提供“本回合只看三件事”的默认简化层。

7. **F-007 Coach & Scouting — 绿色**
   - 课程结构、Office Hours、来源层级、反馈阈值、版本与真人升级链完整。
   - 已统一返回文案。
   - 六段式顶部导航在 1366 宽度附近需要继续做文字压缩或横向滚动验收。

8. **F-008 Campus Life — 绿色偏黄**
   - Campus Concourse、地图、MyCOURT、组队、真人支持和 Replay 都存在。
   - 持久化后可能直接恢复到第六阶段；需要统一“继续上次进度 / 从头演示”的恢复门。

9. **F-009 Opportunity Market — 黄色转绿色**
   - 搜索 `HCI` 能收敛到 1 / 8；资格、收益、义务、成本与风险保持透明。
   - 原问题：缺少 `.sr-only` 导致无障碍标签在页面上换行并挤压输入框。
   - 已修复，筛选栏现在只显示搜索图标、占位文案、类别和有效状态。

10. **F-010 Campus Pass — 绿色**
    - Loadout、Reader Drill、申请队列、安全台与 Replay 的游戏化最强。
    - 凭证始终说明签发人、范围、到期与最小权限；模拟读卡不会宣称正式放行。

11. **浏览器与真实窗口通路 — 黄色**
    - Chrome/Edge 扩展：可精确绑定标签页，适合语义、状态、路由、焦点、日志和截图回归。
    - Computer Use：本轮因 11 标签页导致 URL 无法可信确认而停止；这是安全限制，不是产品崩溃。
    - 建议以后固定“双通路验收窗口”：一个独立 Edge 窗口只放 University2K26，一个扩展标签页用于精确测试。

## 已完成优化清单

- [x] 根页面第一次浏览器返回保持在 University2K26。
- [x] 模块返回 MyCareer 的历史层级正确。
- [x] 全屏模块切换自动回到顶部。
- [x] Academic Mirror、Roster Lab、Performance Center、Opportunity Market、Coach & Scouting、Campus Life、Campus Pass 的阶段切换自动回到顶部。
- [x] Opportunity Market 无障碍隐藏标签不再破坏布局。
- [x] Academic Mirror 快照操作显示“无内容变化 + 审计收据 ID”。
- [x] Academic Mirror 时间统一为本地可读格式。
- [x] Coach & Scouting 返回文案统一。
- [x] World Exam 两题自动保存、2/2 解锁和 Replay 实机回归。
- [x] Chrome/Edge 控制台错误与警告为 0。

## 后续优化清单

### P1：下一轮建议直接做

- [ ] 建立共享 `ModuleShell`：统一返回、品牌、API 状态、叙事/简化/减动效、重置、阶段导航和底部输入提示，减少九套壳层继续漂移。
- [ ] 建立统一“恢复比赛”门：检测本地持久化进度后，先让演示者选择“继续上次回合”或“从头开始 Demo”。
- [ ] 给 Performance Center、Academic Mirror、Coach & Scouting 增加默认简化层，先显示本回合目标、主要行动和下一步，再进入专业控制台。
- [ ] 把可操作控件的可读完成时间控制在 280ms 内；场景光效可以继续到 420–650ms，避免整个界面在 650–850ms 内保持低对比。
- [ ] 在 1366×768、1920×1080、2560×1440、390×844 四个视口做固定视觉回归，重点检查六段导航、底部固定栏和 44px 触控目标。
- [ ] 把手柄操作提示扩展到所有全屏模块，而不只显示在 MyCareer 首页。

### P2：有余力再做

- [ ] 增加可关闭的 UI 音效与手柄震动映射；错误与健康/隐私事件禁止用惩罚性音效。
- [ ] 为评委准备 8–12 分钟 Guided Demo：MyCareer → Roster Lab → World Exam → Replay → Campus Pass。
- [ ] 建立自动截图基线与像素差异门，避免模块独立迭代后顶栏、字体和密度漂移。
- [ ] 在真实 Firefox 与 Safari/WebKit 设备上做运行时烟雾测试；当前只能确认静态目标与 Edge/Chromium 运行。

## 自动化验证

- Web TypeScript、Vitest、生产构建：通过。
- Web：15 个测试文件、115 项测试全部通过。
- Rust workspace：63 项测试全部通过。
- 合同：28 个 Schema、10 份 golden fixture、OpenAPI 与项目清单全部通过。
- Chrome/Edge 控制台：0 个 error，0 个 warning。

## 证据索引

- `01-career-chrome-before.png`：MyCareer 首屏。
- `02-smartcourse-before.png`：SmartCourse 来源入口。
- `03-rosterlab-before.png`：Roster Lab Build Board。
- `04-worldexam-before.png`：World Exam 持久化状态。
- `05-performance-before.png`：Performance Center。
- `06-coach-before.png`：Coach & Scouting。
- `07-campuslife-before.png`：Campus Life。
- `08-opportunity-before.png`：Opportunity Market 修复前筛选栏。
- `09-campuspass-before.png`：Campus Pass。
- `10-academicmirror-reference.png`：Academic Mirror Source Dock。
- `11-rosterlab-solved.png`：滚动复位修复前的求解结果落点。
- `12-worldexam-complete.png`：World Exam 2/2 后 Replay。
- `13-opportunity-filter-after.png`：Opportunity Market 筛选栏修复后。
- `14-source-dock-feedback-after.png`：Source Dock 快照反馈修复后。
- `15-rosterlab-scroll-after.png`：Roster Lab 求解后回到 Draft Board 顶部。
- `16-career-final.jpg`：修复完成后的 MyCareer 稳定态首屏。

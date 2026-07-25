# University2K26 浏览器与输入兼容性基线

更新时间：2026-07-24

## 结论边界

- **已在本机实际验收**：Microsoft Edge / Chromium，本地开发服务器
  `http://127.0.0.1:4173/`。
- **已通过生产构建目标与标准 API 审计**：Chromium 111+、Edge 111+、
  Firefox 121+、Safari 16.4+、iOS / iPadOS Safari 16.4+。
- **尚未声称运行时认证**：本机没有 Firefox，Windows 也不能提供现代 Safari
  运行时。提交前仍需在一台 macOS / iPhone / iPad 和一台 Firefox 设备上执行本页
  的人工冒烟清单。

`vite.config.ts` 与 `package.json#browserslist` 显式声明同一最低版本，避免开发机器
 升级后悄悄改变产物边界。项目不支持 IE 或旧版 Android WebView。

## 核心能力矩阵

| 能力 | Chromium / Edge | Firefox 121+ | Safari 16.4+ | 降级策略 |
| --- | --- | --- | --- | --- |
| React 19 + ESM 动态切片 | 本机通过 | 构建目标覆盖 | 构建目标覆盖 | 无 ESM 时显示不支持页 |
| History API 返回 / 前进 | 本机通过 | 标准 API | 标准 API | 深链首次返回改为站内首页 |
| IndexedDB 自动保存 | 本机通过 | 标准 API | 标准 API | 写入失败退回当前会话内存 |
| Gamepad API | 本机接口通过；实体手柄待复测 | 标准 API | 支持，但首次输入后才可能暴露设备 | 键盘、鼠标和触屏始终可完成同一操作 |
| D-pad / 左摇杆空间导航 | 单元测试 + Chromium 页面逻辑通过 | 同一 W3C 映射 | 同一 W3C 映射 | 非标准手柄扫描全部成对原始轴，并提供会话内诊断 |
| 原生拖放课程卡 | 桌面可用 | 桌面可用 | 桌面可用 | 上移 / 下移按钮覆盖键盘、触屏和手柄 |
| `backdrop-filter` / `color-mix()` / `:has()` | 目标版本支持 | Firefox 121+ 支持 | 目标版本支持 | 生产 CSS 自动生成 `-webkit-backdrop-filter`；关键文本不依赖装饰属性 |
| CSS `mask-image` 场景网格 | 本机通过 | 目标版本支持 | 同时提供 `-webkit-mask-image` | 仅影响装饰网格，不影响文字、地图或动作 |

## 输入合同

### 手柄

- D-pad：W3C Standard Gamepad `buttons[12..15]`，分别对应上、下、左、右。
- 左摇杆：优先读取 `axes[0..1]`，死区 `0.50`。
- 非标准映射：按 `0/1`、`2/3`、`4/5`……顺序扫描设备暴露的全部成对原始轴，
  采用幅度最强的一对；不根据设备名称写死私有映射。
- 连续移动：首次立即响应，持续按住 280 ms 后以 120 ms 周期重复。
- A：激活当前焦点；B：关闭覆盖层或执行站内返回；X：依据；Menu：控制中心。
- 手柄焦点使用独立的橙色高亮，不依赖浏览器是否把程序化焦点判定为
  `:focus-visible`。
- 控制中心显示 `standard / raw`、按钮数、轴数和最近识别方向；设备名称不保存、
  不上传。它用于现场定位驱动映射问题，不能代替实体手柄验收。

### 键盘、鼠标和触屏

- 方向键使用与手柄相同的二维空间导航算法，不再按 DOM 顺序机械前后移动。
- 输入框、文本域和选择框中的方向键保留原生编辑行为。
- 鼠标和触屏可直接选择；所有核心触控按钮应保持至少 44 px 的操作高度。
- 课程重排不能只依赖拖放：每张卡都有上移 / 下移按钮。

## 站内导航合同

路由使用短哈希：

- `#/career`
- `#/career/courses`
- `#/worldexam`
- `#/campuslife`
- `#/campuspass`
- 其余 F 模块使用同名模块路由。

进入模块和打开抽屉会写入 `history.pushState`；浏览器返回触发 `popstate` 并恢复
站内状态。在 `#/career` 根页面再次返回，才允许浏览器离开应用。直接打开模块深链
且没有应用历史时，启动过程先把当前条目设为 `#/career`，再推入请求的模块路由；
因此浏览器第一次返回必定回到 MyCareer，而不是离开整个 Demo。

## 提交前人工冒烟

每个目标浏览器执行：

1. 从首页依次打开课程抽屉、World Finals、Performance Center，再逐次使用浏览器
   返回，确认不会越过 `#/career`。
2. 完成 World Finals 两道题，确认选择即保存、刷新可恢复、选择“挑战断言”后
   “完成并进入 Replay”立即可用。
3. 使用方向键走过首页、课程卡、抽屉关闭按钮和 World Finals 步骤栏。
4. 连接实体手柄，分别测试 D-pad 四向、左摇杆四向、长按重复、A、B。
5. 用触屏切换课程卡尺寸、上移 / 下移课程；检查横竖屏与 200% 缩放。
6. 开启系统“减少动态效果”，确认信息与操作没有丢失。
7. 断网后刷新一次，确认 Fixture / 缓存状态被明确标注。

## 当前 Edge 证据

2026-07-24 在当前 Edge / Chromium 实际完成：

- 新标签直接打开 `#/worldexam`，浏览器返回落在 `#/career`；
- World Finals 从 `0 / 2` 开始，两次选择均即时自动保存，第二题的
  “挑战断言”语义同时完成挑战动作，随后 `Replay 已解锁`，主行动可直接进入 Replay；
- 黑客松 Demo 的七个步骤均显示为可打开；
- 课程阵容的紧凑 / 标准 / 大卡预设可切换，排序仍有按钮式等价路径；
- Campus Pass 从 MyCareer 第十个导航入口可点击进入；Wallet → 静态 QR 拒绝 →
  普通/受控权限申请 → 访客草稿 → 状态镜像 → Safety Desk → Replay 路径通过；
- 生产构建、16 个测试文件与 120 个测试全部通过。

此前还实际完成
`#/career → #/campuslife → 浏览器返回 → #/career`，没有退出应用；并逐页操作
Concourse、Campus Map、MyCOURT、Squad Link、Support Line 与 Campus Replay。
页面状态覆盖检索、画像关闭、日历冲突、静态无障碍路线、私有导出、双向意向、
无伪造回复的 Mentor Handoff、通知治理、来源纠错和私有回执。该证据不能外推为
Firefox / Safari 运行时通过，也不能代替实体手柄、触屏或读屏器复测。

## 依据

- 本地 Microsoft Windows App SDK 离线文档：
  `C:\Downloads\已经整理\微软技术文档\windows-apps.pdf`
  - 明确将 Gamepad D-pad 与左摇杆四向映射为二维焦点方向。
  - 明确说明返回请求不会自动替应用导航，应用必须维护自己的历史。
- 本地 Microsoft Inclusive Design：
  `C:\Downloads\已经整理\微软设计指南\RespectingFocus.pdf`
  与 `InclusiveDesignForCognitionGuidebook.pdf`。
- W3C Gamepad：
  <https://www.w3.org/TR/gamepad/>
- Microsoft Edge Surf：
  <https://www.microsoft.com/zh-cn/edge/features/surf-game>
- Vite 浏览器目标：
  <https://vite.dev/config/build-options.html>

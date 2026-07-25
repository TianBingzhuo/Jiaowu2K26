# P0-00-D0 · Arena Broadcast Control Room

这是用户在 2026-07-23 选中的第一套 Jiaowu2K26 首页方向的**独立可交互模板**。它只验证视觉层级、动效、键盘/手柄输入、Evidence Drawer、降级状态和 React/Vite 构建链，不是已经接入学校系统的产品功能。

## 视觉事实源

- 选中稿：`../../../reference/assets/jiaowu2k26-homepage-option-1-selected.png`
- 干净运行时背景：`public/assets/campus-arena-background-v1.png`
- 采用记录：`../../../PROJECT-MANIFEST.json` → `experience_contract.homepage_template_gate.selection`
- 设计规范：`../../../engineering/DESIGN-SYSTEM.md`

## 当前可验证路径

1. 在 10 秒内识别学生身份、2026 春季赛季、演示数据状态和“继续今日赛程”。
2. 用方向键或标准手柄 D-pad/左摇杆移动焦点。
3. 用 `E` / 手柄 West 打开依据抽屉，`Esc` / East 关闭并恢复原焦点。
4. 执行主要行动，观察加载与成功状态。
5. 在控制中心切换离线、模拟错误、传统叙事和减少动效。
6. 在 1440×1024、1920×1080、Windows 125% 缩放和窄窗下复查。

## 本地命令

使用仓库固定 Node 24.18.0：

```powershell
$repoRoot = (Resolve-Path ..\..\..).Path
$env:PATH = "$repoRoot\.tools\node-v24.18.0-win-x64;$env:PATH"
npm install --prefer-offline --no-audit --no-fund
npm run check
npm run build
npm run test:sites
npm run dev -- --host 127.0.0.1 --port 4173 --strictPort
```

模板通过用户验收前，不把这里的组件当作正式生产 API，也不接入真实 SIS、LMS、成绩、支付或门禁数据。

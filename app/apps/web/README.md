# 大学2K26 / University2K26 Web

这是 V0.9 的正式 Web/PWA Experience Shell。它把已通过的首页视觉从隔离原型晋升为可测试应用，并保持三条边界：

- `/api/v1/health` 是唯一启动握手；API 不可用时明确降级到只读 Fixture。
- 六门 Demo 课程的名称、主题与证据边界来自已审核的本地 README / 索引摘要；分析路径与建议明确标为 Fixture。
- “学科”桌面入口只作为 43 个候选入口 / 40 个唯一来源的发现池，不是选课记录；真实课件、个人身份、成绩和考试内容不进入公开仓库。
- 手柄、键盘、鼠标、触屏和辅助技术共享同一套语义操作；手柄是特色输入，不是唯一输入。
- 开场、任务、Box Score、抽屉与课程切换使用统一 Motion Tokens；系统与产品内减少动效路径保持信息等价。

## 本地运行

```powershell
.\.tools\node-v24.18.0-win-x64\npm.cmd install --prefix app\apps\web
.\.tools\node-v24.18.0-win-x64\npm.cmd run dev --prefix app\apps\web
```

浏览器打开 `http://127.0.0.1:4173/`。若 Rust API 在 `127.0.0.1:3000` 运行，Vite 会代理健康检查；否则首页会显式显示“本地 Fixture”。

## 验证

```powershell
.\.tools\node-v24.18.0-win-x64\npm.cmd run verify --prefix app\apps\web
```

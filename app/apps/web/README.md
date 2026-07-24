# 大学2K26 / University2K26 Web

这是 V0.9 的正式 Web/PWA Experience Shell。它把已通过的首页视觉从隔离原型晋升为可测试应用，并保持三条边界：

- `/api/v1/health` 是唯一启动握手；API 不可用时明确降级到只读 Fixture。
- 六门 Demo 课程的名称、主题与证据边界来自已审核的本地 README / 索引摘要；分析路径与建议明确标为 Fixture。
- “学科”桌面入口只作为 43 个候选入口 / 40 个唯一来源的发现池，不是选课记录；真实课件、个人身份、成绩和考试内容不进入公开仓库。
- 手柄、键盘、鼠标、触屏和辅助技术共享同一套语义操作；手柄是特色输入，不是唯一输入。
- 开场、任务、Box Score、抽屉与课程切换使用统一 Motion Tokens；系统与产品内减少动效路径保持信息等价。
- 首页右上角的“切换角色”提供学生、教师、辅导员 / 学业导师、专业负责人 / 系主任、本科生院 / 教务处五种 **Demo Role Lens**。角色会改变首页任务、导航和数据边界，但共用同一设计系统与 `Briefing → Choose → Execute → Replay → Next Move` 责任链。

## Demo 角色切换

1. 打开首页后选择右上角“切换角色”。
2. 选择任一 Fixture 身份；当前选择会在本浏览器刷新后保留。
3. 教师角色可以直接进入 F-001 内容审核席；其余非学生角色提供与既有模块相连的任务入口，以及明确标注的规划中入口。
4. 从任一模块使用浏览器返回，会先回到当前角色首页，不会误退到系统外。

这里不是学校统一身份认证，也不是生产权限实现。公开 Demo 只在前端模拟角色视角；生产版必须接学校 SSO，并由服务端按角色、组织范围、用途和时限重新授权。不要把 Role Lens 的可见性控制当作数据安全边界。

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

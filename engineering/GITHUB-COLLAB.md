# jiaowu2K26 · GitHub 图形化协作说明

> **给谁：** 第一次参与 GitHub 协作的视觉、人因、产品和开发同学。  
> **当前状态：** 已启用；唯一公开主仓为 [TianBingzhuo/Jiaowu2K26](https://github.com/TianBingzhuo/Jiaowu2K26)，当前只推进 `P0-00`。  
> **一句话流程：** 拉取仓库 → 从最新 `main` 新建自己的短分支 → 只改任务范围 → Commit → Push/Publish Branch → 创建 PR → 自动检查与同伴审核 → 总集成人员合并。

开始前先按根 `README.md` 完成环境自检和 AI 三项入场回执，再问“我现在能干什么？”。AI 必须通过 [`AGENTS.md`](../AGENTS.md) 与 `PROJECT-MANIFEST.json.current_work` 返回唯一可做任务，并请本人确认角色与任务、任务相关技术熟悉度、目标与建议；只有明确回复“我认领 TASK-ID”后才改变 owner。不要从聊天中的旧分工、十四个模块总表或自己感兴趣的功能直接开分支。

## 1. 先选一种图形化路径

| 路径 | 适合谁 | 结论 |
|---|---|---|
| **VS Code + GitHub Pull Requests and Issues** | 改文案、Token、SVG、界面代码、说明文件，需要在编辑器里创建/更新 PR | **团队首选** |
| **GitHub Desktop + VS Code/Figma/图像工具** | 主要处理图片、字体、动效导出或不想在编辑器里管理 Git | 视觉同学最省心的回退 |
| GitHub 网页直接编辑 | 单个很小的 Markdown 文案修正 | 临时可用，不用于批量资产或代码 |

一次任务只选一条路径，不要同时在 GitHub Desktop、VS Code 虚拟仓库和另一个本地副本里改同一文件。

## 2. 第一次准备（只做一次）

1. 创建/登录 GitHub 账号，开启两步验证；把 GitHub 用户名发给总集成人员加入 Organization/仓库。
2. 安装 Git、VS Code，以及 Microsoft 官方的 **GitHub Pull Requests and Issues** 扩展；或安装 GitHub Desktop。
3. 在 VS Code 左侧 GitHub 图标中选择 **Sign In**，按浏览器提示授权；不要把 token 发到群里或写进文件。
4. 等总集成人员发来唯一仓库 URL。不要从 Gitee、GitCode、CNB 或别人压缩包建立第二主线。
5. 克隆到团队约定目录，只保留一个本地工作副本；首次打开时只信任确认过的团队仓库。

官方入门：[GitHub Desktop 起步](https://docs.github.com/en/desktop/overview/getting-started-with-github-desktop) · [VS Code Git 快速入门](https://code.visualstudio.com/docs/sourcecontrol/quickstart) · [VS Code 的 GitHub/PR 工作流](https://code.visualstudio.com/docs/sourcecontrol/github)

## 3. 每张任务卡的固定操作

### A. 开工前

1. 先通过 Task Router 取得并明确认领任务，再在 [当前 P0-00 Issue](https://github.com/TianBingzhuo/Jiaowu2K26/issues/1) 确认它属于当前唯一产品切片，记住工作包 ID（如 `P0-00-B`）。
2. 确认没有未提交修改；切到 `main`，执行 **Pull / Sync**，看到最新的 Accepted 状态。
3. 从这个最新 `main` 新建分支：
   - 设计：`design/p0-03-review-panel`
   - 功能：`feat/p0-03-review-panel`
   - 修复：`fix/p0-03-review-panel`
   - 文档：`docs/github-guide`
4. 状态栏再次确认当前分支**不是 `main`**，再开始修改。

### B. 修改时

- 只改任务卡列出的文件和资产；需要扩大范围先在 Issue/群里说明。
- 每完成一个可解释、可回退的小意图就 Commit，不把几个不相关改动塞进一个提交。
- Commit 格式：`type(scope): summary`，例如 `design(shell): add accessible review states`。
- 提交前在 Source Control 中逐个点击文件看 diff，确认没有 `.env`、token、真实学生数据、临时导出、缓存或不相关改动。
- 图片/字体/音乐/图标必须登记来源、许可证和用途；NBA、2K、SEGA、maimai 截图与品牌资产只能内部研究，不能提交为产品资产。
- 大型二进制资产先问总集成人员是否采用 Git LFS；不要自行把数百 MB 源文件推入仓库。

### C. 发起 PR

1. Commit 后选择 **Publish Branch / Push**，把自己的分支发到 GitHub。
2. 在 VS Code GitHub 视图选择 **Create Pull Request**，或在 GitHub Desktop 选择 **Create Pull Request**。
3. Base 必须是 `main`，Compare 必须是你的 `design/*` / `feat/*` / `fix/*` 分支。
4. 未完成就创建 **Draft PR**；准备验收后再标记 Ready for review。
5. 先运行任务卡指定的实际实验并附上证据，再标记 Ready；填完模板并指定至少一名非作者 Reviewer，不要自己合并。

PR 正文最小模板：

```text
验收 ID：P0-00-x
完成了：
- 

没有做：
- 

如何验证：
1. 
2. 

证据：截图 / 录屏 / 测试命令 / 结果
风险与回退：
资产与许可证变化：无 / 具体说明
Schema、API、migration 变化：无 / 具体说明
```

### D. 收到修改意见

1. 不关闭 PR，也不另开第二个 PR。
2. 继续在**同一个分支**修改、Commit、Push；原 PR 会自动更新。
3. 对每条 Review 回复“已改 + 位置”或说明理由；不要只回“done”。
4. 自动检查全绿、Reviewer 批准、总集成人员本地验收后，由总集成人员 **Squash and merge**。
5. 合并后删除远端分支；切回 `main` 并 Pull，下一张任务卡再建新分支。

## 4. VS Code 插件的最短点击路径

1. `Ctrl+Shift+P` → `Git: Clone` → 选择/粘贴团队仓库 → 打开目录。
2. 左下角分支名 → 切换到 `main` → Source Control 的 `...` → `Pull`。
3. 左下角分支名 → `Create new branch` → 输入规定分支名。
4. 修改并保存 → `Ctrl+Shift+G` 打开 Source Control → 点击文件查看差异。
5. 只暂存要提交的文件 → 输入 Commit 信息 → Commit。
6. 选择 `Publish Branch` / `Push`。
7. 左侧 GitHub 图标 → Pull Requests → `Create Pull Request` → base 选 `main` → 填模板。

VS Code 官方说明确认：GitHub Pull Requests and Issues 扩展可以登录、克隆、创建分支、发布分支、创建 Draft/普通 PR、Review 和 Checkout PR。对需要本地预览、构建或处理设计资产的任务，应使用本地 clone；GitHub Repositories 的虚拟工作区更适合小改动，因为任务、调试和终端能力可能受限。

## 5. GitHub Desktop 的最短点击路径

1. `File → Clone repository`，选团队仓库。
2. `Current branch → main`，点击 `Fetch origin / Pull origin`。
3. `Current branch → New branch`，输入规定分支名。
4. 在 VS Code/Figma/图像工具中改文件并保存。
5. 回到 GitHub Desktop，逐文件检查 Changes；填写 Summary，点击 `Commit to <branch>`。
6. 点击 `Publish branch / Push origin`。
7. 点击 `Create Pull Request`，浏览器中确认 base=`main`、compare=你的分支，填模板并提交。

官方说明：[管理分支](https://docs.github.com/en/desktop/making-changes-in-a-branch/managing-branches-in-github-desktop) · [创建 Pull Request](https://docs.github.com/en/pull-requests/how-tos/create-pull-requests/creating-a-pull-request)

## 6. “实时拉别人提交下来验证”的正确做法

**结论：方向对，但不要让每个人不断把未审核分支拉进自己的工作分支。** 我们采用三层实时验证：

1. **每次 Push：自动验证。** PR 触发 format、lint、typecheck、单元/合同测试、build 和资产/许可证检查；结果直接挂在 PR 上。
2. **每次 Ready for review：隔离验证。** 总集成人员或 Reviewer Checkout 该 PR，或使用独立 worktree/临时目录验证，不污染正在演示的 `main`。
3. **每次 Accepted：主线验证。** PR 通过后 squash 到 `main`，在最终演示机和第二台队员机器冷启动；打 `p0-xx-accepted` Tag 后才开始下一切片。

因此：

- 队员开工前和自己 PR 合并后同步 `main`，是好习惯。
- PR 每次 Push 都让 CI 验证，是“实时”的主力。
- 总集成人员在关键节点拉取 PR 分支验证，是好主意。
- **不建议**每几分钟 `git pull`、把别人未审核分支 merge 到自己的分支、或直接在 Demo 目录试所有人的代码。
- `main` 只接受已审核 PR，保持随时可演示；发现问题就拒绝/回退该 PR，不让下一功能叠在坏基座上。

## 7. 冲突或“我好像点错了”时

- 先停止继续点，不要 Force Push、不要删除 `.git`、不要重置 `main`、不要点“Accept All Incoming/Current”。
- 截图当前分支名、Source Control 列表和提示文字，发给总集成人员。
- 未 Commit 的视觉源文件先另存一份到团队批准的临时位置；不要覆盖仓库中的正确版本。
- 冲突由作者和总集成人员一起逐块判断；“能编译”不代表语义没丢。
- 如果误把秘密提交到历史，单纯删除文件不够，立即通知总集成人员撤销密钥并清理历史。

## 8. 合并前十秒自查

- [ ] 当前不是 `main`
- [ ] 对应当前 Issue / 验收 ID
- [ ] 只包含任务范围内改动
- [ ] 没有秘密、真实个人数据、缓存和临时文件
- [ ] 设计资产有来源/许可证，未复制 2K/maimai 品牌资产
- [ ] 截图和验证步骤足以让别人复现
- [ ] 自动检查通过；Schema/迁移变化已由全队评审
- [ ] 至少一名非作者批准；由总集成人员合并

## 9. 给 AI 助手的一句话命令

设计同学可以在**已克隆、确认当前为自己分支**后对 AI 说：

> 请先只读检查当前 Git 分支、任务范围和未提交改动；不要切换或合并 main，不要强推。完成我指定的设计/文案修改后，逐文件说明差异，运行仓库 verify，替我起草符合模板的 PR 标题和正文，但不要替我提交、推送或合并，等我确认。

这样 AI 可以帮忙检查和起草，最终 Commit、Push、PR 和合并仍由队员看过内容后操作。

## 10. 弹性能力池

- 岗位是能力标签，不是固定座位；任何队员都可认领与自己特长匹配、`allowed_now=true` 的工作包。
- 没有人认领且 `ai_allowed=true` 时，Codex 可以补研究、草稿、测试或受控实现；产品总集成人员仍是人类责任人并逐项审核。
- AI 不能替代真实用户访谈、另一位非作者 Reviewer，也不能替队员宣称自己理解或验证了代码。
- 新人只要克隆仓库、问“我现在能干什么？”并明确认领一个 ID，就能进入当前工作；不要依据旧聊天记录猜分工。

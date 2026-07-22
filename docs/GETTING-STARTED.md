# Jiaowu2K26 文档门户：5 分钟配置、AI 接手与一键更新

这份说明同时面向第一次接手项目的同学和 AI。目标不是要求所有人读完全部资料，而是让每个人快速进入同一事实体系。

## 先记住三个事实

1. 项目稳定逻辑路径是 `D:\10451\Desktop\黑客松`；不要同时用 C 盘等效路径重复扫描或索引。
2. 根目录 Markdown 与 `PROJECT-MANIFEST.json` 是规范事实源；`docs-site/src/content/docs/` 是每次构建生成的只读浏览副本，禁止直接编辑。
3. 文档门户是赛前协作工具，不是 Jiaowu2K26 产品原型，也不能被表述为本届已实现功能。

本机的稳定入口位于 junction 下。启动脚本会继续向人和 AI 展示 `D:\10451\Desktop\黑客松`，但检测到 Astro/Vite 会因 reparse point 混用路径而丢失 CSS 时，会把**同一轮构建**整体切换到等效物理路径 `C:\Desktop\黑客松`。二者是同一批文件，不能分别扫描、同步或当成两份项目。

## Windows 同学：首次配置

### 必需环境

- Git：用于克隆、分支、提交、PR 和安全更新。
- Node.js 24 LTS：文档站的统一运行时。不要使用已经结束支持的 Node.js 25。
- PowerShell 7 推荐；Windows PowerShell 5.1 也可完成启动。

安装后，在 PowerShell 中进入项目根目录并运行：

```powershell
pwsh -NoProfile -ExecutionPolicy Bypass -File .\tools\Docs.ps1 -Action Setup
```

该命令只会：

- 安装 `docs-site/package-lock.json` 锁定的依赖；
- 从规范源生成只读浏览内容；
- 构建离线全文搜索索引；
- 验证核心 Starlight CSS、Career Control Room、Pagefind 与关键接手页面没有缺失；
- 在当前用户桌面创建 `Jiaowu2K26 文档中心` 快捷方式。

以后双击桌面快捷方式即可。它会按以下安全顺序运行：

1. 如果当前目录是 Git 克隆仓且工作区干净，执行 `git pull --ff-only`；
2. 有未提交改动、没有远端或当前尚不是 Git 仓库时，跳过拉取并保留本地内容；
3. 重新生成文档与搜索索引；
4. 在 `http://127.0.0.1:4321/` 打开默认浏览器。

脚本不会自动 stash、merge、rebase、force push，也不会覆盖同学的未提交内容。

## macOS / Linux 同学

文档内容和网站本身跨平台；桌面快捷方式脚本是 Windows 专用。安装 Node.js 24 LTS 后运行：

```bash
cd docs-site
npm ci
npm run build
npm run preview
```

然后打开 `http://127.0.0.1:4321/`。

## 日常编辑文档

请编辑以下规范源，而不是生成目录：

- `product/`：愿景、人因、范围与产品边界；
- `modules/`：F-001～F-014 的规格、状态和 AI 协作提示；
- `engineering/`：架构、技术栈、设计系统和协作协议；
- `gates/`：阶段门禁、质量和交付；
- `reference/`、`brainstorm/`：研究证据与产品洞察；
- `PROJECT-MANIFEST.json`：当前阶段、任务、负责人和机器可读状态。

编辑完成后重新双击快捷方式，或运行：

```powershell
pwsh -NoProfile -ExecutionPolicy Bypass -File .\tools\Docs.ps1 -Action Open
```

## Git 克隆与更新

首次获得仓库地址后，在你自己的开发目录运行：

```powershell
git clone <仓库 HTTPS 地址> jiaowu2k26
Set-Location .\jiaowu2k26
pwsh -NoProfile -ExecutionPolicy Bypass -File .\tools\Docs.ps1 -Action Setup
```

已经克隆的同学可以直接使用桌面快捷方式；也可以只更新和重建而不打开浏览器：

```powershell
pwsh -NoProfile -ExecutionPolicy Bypass -File .\tools\Docs.ps1 -Action Update
```

遇到冲突时停止，不要强推。非技术同学的完整 GitHub 图形化流程见 `engineering/GITHUB-COLLAB.md`。

## AI 最小接手协议

新 AI 进入项目后依次执行：

1. 读取根 `AGENTS.md`；
2. 读取 `PROJECT-MANIFEST.json` 的 `status`、`current_work` 和 `collaboration_contract`；
3. 用户问“我现在能干什么？”时，只按 `AGENTS.md` 返回一个当前合法任务；
4. 只有需要理解全貌时，才按 Manifest 的 `canonical_read_order` 展开；
5. 不把 `archive/`、`docs-site/src/content/docs/` 或聊天记录当作并列事实源；
6. 一次任务只使用 `D:\10451\Desktop\黑客松` 这一条逻辑路径；
7. 不因看到文档门户、概念图或规格，就声称产品已经实现；
8. 外部发布、建仓、推送、阶段切换和任务认领仍需明确授权。

可以直接交给 AI 的启动指令：

```text
你正在接手 jiaowu2K26。请先完整读取根目录 AGENTS.md，再读取
PROJECT-MANIFEST.json 的 status、current_work 与 collaboration_contract。
不要扫描 archive，也不要读取 docs-site/src/content/docs 生成副本。
统一使用当前克隆根路径，不混用 junction 的物理别名。
先只回答：当前阶段、唯一事实源、我现在能做的一个任务，以及禁止事项。
未经我确认不要认领、写文件、建分支、推送或发布。
```

## 自检与故障排查

```powershell
# 查看环境、依赖、Git、构建和服务器状态
pwsh -NoProfile -ExecutionPolicy Bypass -File .\tools\Docs.ps1 -Action Doctor

# 关闭由本项目启动的本地文档服务器
pwsh -NoProfile -ExecutionPolicy Bypass -File .\tools\Docs.ps1 -Action Stop

# 单独验证全部页面、内部链接和构建
Set-Location .\docs-site
npm run verify
```

日志位于 `docs-site/.logs/`，运行状态位于 `docs-site/.runtime/`；二者都不会提交到 Git。

如果页面突然变成白底、蓝色下划线和普通项目符号，那不是设计稿，而是核心 CSS 没有进入构建产物。重新执行 `Setup`；`Doctor` 会显示稳定入口和本轮构建使用的等效物理路径，构建后守卫会在样式仍缺失时直接报错。

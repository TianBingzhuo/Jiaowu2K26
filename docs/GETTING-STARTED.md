# 大学2K26 / University2K26：5 分钟配置、运行与 AI 接手

这份说明同时面向第一次接手项目的同学和 AI。目标是让任何人从一次全新克隆出发，先运行可玩的 V0.9 Demo，再按自己的角色补齐文档、Rust/API 或 AI 环境。

## 先记住三个事实

1. 每台机器只使用自己的 Git 克隆根目录；维护者工作站的稳定逻辑入口是 `D:\10451\Desktop\黑客松`，不要和 C 盘等效路径重复扫描或索引。
2. 根目录 Markdown 与 `PROJECT-MANIFEST.json` 是规范事实源；`docs-site/src/content/docs/` 是每次构建生成的只读浏览副本，禁止直接编辑。
3. 文档门户是协作工具，不是 University2K26 产品原型，也不能被表述为本届已实现功能；`app/` 内 Phase 0 代码与 V0.9 外壳也只能按证据称为技术切片。

维护者工作站的稳定入口位于 junction 下。启动脚本会继续向人和 AI 展示 `D:\10451\Desktop\黑客松`，但检测到 Astro/Vite 会因 reparse point 混用路径而丢失 CSS 时，会把**同一轮构建**整体切换到等效物理路径 `C:\Desktop\黑客松`。二者是同一批文件，不能分别扫描、同步或当成两份项目。其他队友的普通克隆不需要创建 junction。

## 先选择你需要的运行方式

| 目标 | 需要什么 | 启动方式 |
|---|---|---|
| 试玩、路演、UI/UX、产品验收 | Git + PowerShell 7；脚本自动准备 Node | `bootstrap.ps1 -WebOnly -SkipDocs` → `Start-University2K26.ps1 -FixtureOnly` |
| 阅读和搜索全部项目文档 | Git + PowerShell 7；脚本自动准备 Node | `tools/Docs.ps1 -Action Setup` |
| Rust/API/数据库开发 | 上述环境 + rustup；本机策略拦截 Rust DLL 时还需 Ubuntu WSL2 | 完整 `bootstrap.ps1` → `verify.ps1` → `Start-University2K26.ps1` |
| macOS / Linux Web 开发 | Node 24.18.0、npm 11.16.0 | 在 `app/apps/web` 中执行 `npm ci && npm run dev` |

绝大多数新队友先走第一条即可。Fixture 模式会开放完整 Demo 功能和脱敏演示数据，不要求模型密钥、学校账号、数据库服务、Rust 或 WSL。

### 最短可运行路径（Windows）

```powershell
git clone https://github.com/TianBingzhuo/Jiaowu2K26.git jiaowu2k26
Set-Location .\jiaowu2k26
pwsh -NoProfile -ExecutionPolicy Bypass -File .\scripts\bootstrap.ps1 -WebOnly -SkipDocs
pwsh -NoProfile -ExecutionPolicy Bypass -File .\scripts\Start-University2K26.ps1 -FixtureOnly
```

浏览器会打开 `http://127.0.0.1:4173/`。结束后运行：

```powershell
pwsh -NoProfile -ExecutionPolicy Bypass -File .\scripts\Stop-University2K26.ps1
```

## Windows 同学：首次配置

### 必需环境

- Git：用于克隆、分支、提交、PR 和安全更新。
- PowerShell 7：推荐用于统一执行仓库脚本；Windows PowerShell 5.1 只能作为文档启动的兼容路径。
- Node.js 无需预装：Windows 的 `bootstrap.ps1` 会从 Node.js 官方地址下载、校验并使用仓库本地的 24.18.0；不要改用其他版本覆盖锁定运行时。
- 只试玩 Demo 或参与前端/设计时不需要 Rust、WSL、Docker、数据库服务或模型密钥。
- 完整后端开发需要 rustup；`bootstrap.ps1` 会用它安装锁定的 Rust 1.97.1、rustfmt 与 Clippy。
- Ubuntu WSL2 仅在 Windows 安全策略阻止本地 Rust proc-macro DLL，或使用当前一键完整栈启动器时需要；脚本只读检测，不会关闭 Smart App Control。

完整栈开发者安装 Git、PowerShell 7 与 rustup 后，在项目根目录运行：

```powershell
pwsh -NoProfile -ExecutionPolicy Bypass -File .\scripts\bootstrap.ps1
pwsh -NoProfile -ExecutionPolicy Bypass -File .\scripts\verify.ps1
pwsh -NoProfile -ExecutionPolicy Bypass -File .\scripts\Start-University2K26.ps1
```

当前组合启动器在需要自行拉起 API 时使用 Ubuntu WSL2。若另一台 Windows 没有 Smart App Control 冲突、原生 Rust 可以工作但没有 WSL，可先在一个终端手动启动 API：

```powershell
$env:J2K26_BIND = '127.0.0.1:3000'
$env:J2K26_DATABASE_URL = 'sqlite::memory:'
rustup run 1.97.1 cargo run --locked --manifest-path .\app\Cargo.toml --bin j2k26-api
```

API 就绪后，在第二个终端运行不带 `-FixtureOnly` 的 `Start-University2K26.ps1`；启动器会复用已有 API，只启动 Web。

这两个命令会：

- 准备经过 SHA-256 校验的仓库本地 Node 运行时和锁定的 Rust 工具链；
- 安装 `docs-site` 和 `app/apps/web` 锁定的依赖；
- 从规范源生成只读浏览内容；
- 构建离线全文搜索索引；
- 验证核心 Starlight CSS、Career Control Room、Pagefind 与关键接手页面没有缺失；
- 验证 Manifest、公开合同、Web、Rust/SQLite/API 技术基线；
- 在当前用户桌面创建 `大学2K26 文档中心` 快捷方式。

以后双击桌面快捷方式即可。它会按以下安全顺序运行：

1. 如果当前目录是 Git 克隆仓且工作区干净，执行 `git pull --ff-only`；
2. 有未提交改动、没有远端或当前尚不是 Git 仓库时，跳过拉取并保留本地内容；
3. 重新生成文档与搜索索引；
4. 在 `http://127.0.0.1:4321/` 打开默认浏览器。

脚本不会自动 stash、merge、rebase、force push，也不会覆盖同学的未提交内容。

## macOS / Linux 同学

PowerShell 桌面快捷方式和组合启动器是 Windows 专用。安装 Node.js 24.18.0、npm 11.16.0 后，可直接运行 Web/PWA：

```bash
cd app/apps/web
npm ci
npm run dev
```

然后打开 `http://127.0.0.1:4173/`。没有 API 时，界面会明确降级到 Fixture，不需要伪造连接状态。

需要文档门户时另开终端：

```bash
cd docs-site
npm ci
npm run build
npm run preview
```

文档地址为 `http://127.0.0.1:4321/`。需要后端时安装 `rustup`，确认 `rustc 1.97.1` 后，在仓库根目录运行：

```bash
J2K26_BIND=127.0.0.1:3000 \
J2K26_DATABASE_URL='sqlite::memory:' \
cargo run --locked --manifest-path app/Cargo.toml --bin j2k26-api
```

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
git clone https://github.com/TianBingzhuo/Jiaowu2K26.git jiaowu2k26
Set-Location .\jiaowu2k26
pwsh -NoProfile -ExecutionPolicy Bypass -File .\tools\Docs.ps1 -Action Setup
```

已经克隆的同学可以直接使用桌面快捷方式；也可以只更新和重建而不打开浏览器：

```powershell
pwsh -NoProfile -ExecutionPolicy Bypass -File .\tools\Docs.ps1 -Action Update
```

遇到冲突时停止，不要强推。非技术同学的完整 GitHub 图形化流程见 `engineering/GITHUB-COLLAB.md`。

## 参与代码：统一环境与验证

准备写代码的同学先运行：

```powershell
pwsh -NoProfile -ExecutionPolicy Bypass -File .\scripts\bootstrap.ps1
pwsh -NoProfile -ExecutionPolicy Bypass -File .\scripts\verify.ps1 -SkipDocs
```

工具链固定为 Node 24.18.0 / npm 11.16.0 / Rust 1.97.1。当前演示机的 Smart App Control 处于 enforcement，Windows 会阻止 Rust 加载本地未签名的 proc-macro DLL；仓库不会替用户修改安全设置。`doctor.ps1` 会只读识别该状态，并在已有 Ubuntu WSL2 时由 `rust-checks.ps1` 自动切换执行器。其他机器若没有此策略冲突则使用原生 Windows Rust。

只改 Web/PWA 的同学可以使用更轻的检查：

```powershell
pwsh -NoProfile -ExecutionPolicy Bypass -File .\scripts\doctor.ps1 -WebOnly
& .\.tools\node-v24.18.0-win-x64\npm.cmd run verify --prefix .\app\apps\web
```

只想复现实 API 的同学，可在 Linux/WSL 中执行：

```bash
bash scripts/smoke-api.sh
```

成功只证明 Fixture + SQLite 的审核/发布/Replay 底座，不证明 AI、OceanBase、前端或正式学校系统已经完成。

## 模型配置与 BYOK 当前边界

队友未来可以选择自己熟悉的本地或云模型，但当前 `P0-00` **尚未实现 BYOK 运行时**，不要自行把模型 SDK、key 或供应商类型写进领域层。

- 可共享：provider 类型、endpoint、精确 model ID、能力、数据区域、超时和 `key_ref` 的无秘密 profile。
- 只留本机：API key、token、Cookie、登录凭据；优先放操作系统凭据库或受控进程环境。
- 禁止：提交 `.env*`、把 key 写进浏览器存储/URL、命令行参数、日志、Issue、PR、聊天或截图。
- 无论使用哪个模型，都必须通过同一 Result Envelope、Schema、来源、人工审核与 Fixture 回退。

当前只使用 `.env.example` 了解变量名称，不要向它写真实值，也不要假设根 `.env` 会被自动加载。当前真正读取的覆盖项只有：

| 变量 | 默认值 | 读取方 |
|---|---|---|
| `J2K26_BIND` | `127.0.0.1:3000` | Rust API |
| `J2K26_DATABASE_URL` | `sqlite://.data/j2k26-phase0.db?mode=rwc` | Rust API |
| `VITE_API_ORIGIN` | `http://127.0.0.1:3000` | Vite 开发/预览代理 |
| `RUST_LOG` | `info` | Rust 日志过滤 |

临时覆盖请放在当前进程环境中。例如 PowerShell：

```powershell
$env:J2K26_DATABASE_URL = 'sqlite::memory:'
$env:J2K26_BIND = '127.0.0.1:3000'
```

正式 CLI/BYOK 实现必须等待 `P0-00-B/C` 被接受并单独认领；合同见 `engineering/ARCHITECTURE.md#9-cli外部-ai-与-byok-自动化合同`。

## AI 最小接手协议

新 AI 进入项目后依次执行：

1. 读取根 `AGENTS.md`；
2. 读取 `PROJECT-MANIFEST.json` 的 `status`、`current_work` 和 `collaboration_contract`；
3. 用户问“我现在能干什么？”时，只按 `AGENTS.md` 返回一个当前合法任务；
4. 只有需要理解全貌时，才按 Manifest 的 `canonical_read_order` 展开；
5. 不把 `archive/`、`docs-site/src/content/docs/` 或聊天记录当作并列事实源；
6. 一次任务只使用当前 Git 克隆根目录；维护者工作站使用 `D:\10451\Desktop\黑客松` 逻辑入口；
7. 不因看到文档门户、概念图或规格，就声称产品已经实现；
8. 在宣称“已了解项目”前，必须完成角色与任务、任务相关技术熟悉度、目标与建议三项回执，并得到队友本人确认；
9. 三项确认不等于任务认领；外部发布、建仓、推送、阶段切换和任务认领仍需明确授权。

可以直接交给 AI 的启动指令：

```text
你正在接手 jiaowu2K26。请先完整读取根目录 AGENTS.md，再读取
PROJECT-MANIFEST.json 的 status、current_work 与 collaboration_contract。
不要扫描 archive，也不要读取 docs-site/src/content/docs 生成副本。
统一使用当前克隆根路径，不混用 junction 的物理别名。
先只读，不要认领、写文件、建分支、推送或发布。

在你说“已了解项目”前，以“理解状态：待本人确认”开头并提交三项回执：
1. 建议我的协作角色与当前唯一任务，复述输入、交付物、Done 和禁止事项；
2. 列出任务实际涉及的技术栈，让我逐项填写“熟悉 / 可在辅助下完成 / 不熟悉”；
3. 用自己的话复述目标、非目标和成功证据，并列出建议、风险与待确认问题。
技术不熟悉时给出“保留并结对 / 改派任务 / 替换该层实现”三个可审方向，
不得擅自更换共享合同或全局架构。只有我逐项确认后才能写“入场确认完成”；
确认仍不等于认领任务。
```

队友可以这样回执：

```text
角色与任务：确认 / 调整为 ______
技术熟悉度：Rust ______；React/TypeScript ______；本任务其他技术 ______
目标与边界：确认 / 调整为 ______
建议处理：接受 ______；暂不接受 ______
我是否现在认领任务：否 / 是，我认领 <task_id>，角色是 <role>
```

## 自检与故障排查

```powershell
# 查看环境、依赖、Git、构建和服务器状态
pwsh -NoProfile -ExecutionPolicy Bypass -File .\tools\Docs.ps1 -Action Doctor

# 只检查可运行 Web Demo 所需环境
pwsh -NoProfile -ExecutionPolicy Bypass -File .\scripts\doctor.ps1 -WebOnly

# 关闭由本项目启动的本地文档服务器
pwsh -NoProfile -ExecutionPolicy Bypass -File .\tools\Docs.ps1 -Action Stop

# 关闭 University2K26 Web/API
pwsh -NoProfile -ExecutionPolicy Bypass -File .\scripts\Stop-University2K26.ps1

# 单独验证全部页面、内部链接和构建
Set-Location .\docs-site
npm run verify
```

日志位于 `docs-site/.logs/`，运行状态位于 `docs-site/.runtime/`；二者都不会提交到 Git。

如果页面突然变成白底、蓝色下划线和普通项目符号，那不是设计稿，而是核心 CSS 没有进入构建产物。重新执行 `Setup`；`Doctor` 会显示稳定入口和本轮构建使用的等效物理路径，构建后守卫会在样式仍缺失时直接报错。

如果 `4173` 端口被占用，先运行停止脚本，再用 `Get-NetTCPConnection -LocalPort 4173` 查明占用者；启动器使用 `strictPort`，不会偷偷换端口造成队友打开错误页面。完整栈启动提示缺少 Ubuntu 时，可以先用 `-FixtureOnly` 继续 UI/产品工作，或按上面的 macOS/Linux 命令在原生 Rust 可用的环境中手动启动 API。

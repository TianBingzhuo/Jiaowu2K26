# 本机环境

> 环境快照日期：2026-07-23。此文件记录开发机器的硬件、软件、验证执行器和路径约束。

---

## 硬件与系统

| 项目 | 详情 |
|------|------|
| OS | Windows 11 Home 中文版，build 26200 |
| CPU | Intel Core i7-13700H，14 核 / 20 线程 |
| 内存 | 约 64 GB |
| GPU | NVIDIA GeForce RTX 4070 Laptop（8188 MiB，驱动 610.74 快照）+ Intel Iris Xe |
| 存储 | C 卷 3698.0 GiB 总量、1113.1 GiB 可用（30.1%）；NTFS Healthy |

## 已安装软件

| 软件 | 版本 | 备注 |
|------|------|------|
| Unity Editor | 6000.3.17f1 | 不代表 P0 采用；Unity Hub 3.13.0 |
| Visual Studio Community 2026 | 18.7.1 | 完整且可启动；WinUI workload 当前未安装 |
| .NET SDK | 10.0.301 | `dotnet` 可用；WinUI CLI 模板当前未安装 |
| PowerShell 7 | 7.6.4 | 优先使用 |
| Git | 2.53.0.windows.3 | 公开主仓协作 |
| Node.js / npm | 主机 25.8.1 / 11.11.0；仓库 24.18.0 / 11.16.0 | 验证只使用仓库内精确锁定运行时 |
| Rust | 主机 1.97.0；仓库/Ubuntu 1.97.1 | 实际验证由脚本按 `rust-toolchain.toml` 选择执行器 |
| Ubuntu WSL2 | kernel 6.18.33.2 | Smart App Control 保持开启时的 Rust 编译/测试执行器 |

## 未安装 / 不应擅自安装

| 软件 | 状态 | 原因 |
|------|------|------|
| Unreal Engine | ⬜ 未安装 | P0 拒绝 UE 5.8；只在首页模板与性能 Gate 后评估 Companion |
| Epic Games Launcher / prerequisites | 未发现 Launcher/Engine 目录；仅注册 Epic Games Launcher Prerequisites | 不把 prerequisites 误报成已安装引擎 |
| WinUI application development workload / `dotnet new winui` | ⬜ 未安装 | WinUI 仅是 Windows adapter 候选，选定前不安装 |
| Steam | ⬜ 未安装 | 无需购买 NBA 2K |

## 路径规则

- **项目根目录：** `D:\10451\Desktop\黑客松`
- **批准的 Junction 根：** `D:\10451`
- `D:\10451` 和 `D:\DiskC` 是指向 C 卷的 junction
- **不得向 D 盘非 junction 路径写入**
- 一次操作只能选择一个根（C 或 `D:\10451`），禁止混用
- 等价别名不可同时扫描
- 2026-07-23 用 `fsutil file queryfileid` 对 C/D 两条 README 路径抽样，File ID 同为 `0x000000000000000000a3000000013348`，确认是同一底层文件而非副本

## 外部参考库

| 名称 | 路径 | 用途 |
|------|------|------|
| NBA 2K 设计研究库 | `D:\10451\Users\10451\Downloads\NBA2K-Design-Reference\` | 30 张官方界面截图 + 指南 + SHA 清单；仅内部研究，非可复用资产 |
| WinUI 3 参考库 | `D:\10451\Users\10451\Downloads\WinUI3-Reference\` | 控件、可访问性和工程结构参考；不整包复制 |

两份参考库的机器清单与当前哈希登记在根目录 `PROJECT-MANIFEST.json`。同一底层目录不得再通过 C 路径重复扫描。

## 权限与安全

- 非管理员会话
- 本轮没有修改 Smart App Control、注册表或系统级安全策略
- 不默认读取 `.env` / 令牌 / Cookie / 密钥
- 已按 GATE-1 安装仓库内 Node 24.18.0 与 Ubuntu WSL2 内 Rust 1.97.1；没有安装 Docker、硬件 SDK 或游戏引擎

### 2026-07-23 只读容量复核

| 项目 | 结果 |
|---|---|
| 项目工作树 | 约 0.84 GiB |
| `.git` | 约 19.9 MiB |
| 仓库便携工具 `.tools` | 约 100.8 MiB |
| 文档依赖 `docs-site/node_modules` | 约 195.3 MiB |
| Rust 构建目录 `app/target` | 约 95.0 MiB |
| Ubuntu WSL2 VHDX | 约 50.1 GiB；只读计量，没有压缩或终止 |
| oceanbase-desktop VHDX | 约 7.8 GiB；受保护，未启动、终止、导出、压缩或升级 |
| 审计排除 | F: 完全排除；未做缓存清理、卸载或系统变更 |

现有空间足以继续 Phase 0、首页 Web 模板和受控 Unity Spike。UE/WinUI 安装空间也足够，但“空间够”不等于技术已选；大型可选依赖必须等视觉与客户端 Gate 后再安装。

### Smart App Control 与 Rust 对照实验

| 项目 | 结果 |
|---|---|
| 当前 SAC 状态 | `enforce`（注册表只读核验） |
| Windows 原生 Cargo | `rustc.exe` 加载本地生成的 `displaydoc-*.dll` 时被 Code Integrity 3077/3033 拦截 |
| D junction 原生构建 | 构建脚本还会因 D 路径别名触发应用控制，不能作为可靠执行路径 |
| Ubuntu WSL2 | 同一 NTFS 工作树使用 Rust 1.97.1 完成编译、8 项测试、Clippy 与实时 API smoke |
| 项目策略 | 不自动关闭 SAC；`scripts/rust-checks.ps1` 在 enforcement + Ubuntu 可用时自动选 WSL，否则走原生 Windows |

这不是 Rust 源码错误或 `rustc` 崩溃，而是 SAC 对本地未签名动态代码的执行策略。[微软当前 Smart App Control FAQ](https://support.microsoft.com/zh-CN/Windows/Security/Threat-Malware-Protection/smart-app-control-frequently-asked-questions) 已说明较新的 Windows 可以关闭后重新启用 SAC，但这仍是用户单独作出的安全决定，项目脚本不得替用户切换。

## 待补充 PDF（地瓜 / D-Robotics）

| 文件 | 原路径 | SHA-256 | 状态 |
|------|--------|---------|------|
| 嵌入式竞赛地瓜机器人赛道资料.pdf | `D:\10451\Desktop\地瓜\嵌入式竞赛地瓜机器人赛道资料.pdf` | `F945FE12C1077BBFFB50DEC870D80506A8695B2FB89F2C7E11151E4A9D1F823A` | ⬜ 新环境缺失 |
| 嵌赛资料包.pdf | `D:\10451\Desktop\地瓜\嵌赛资料包.pdf` | `EE5A926C2DEF2B656709A2004FBC5B0B8BB175FA748C8AB8D233A813701361D0` | ⬜ 新环境缺失 |

重新提供后按完整 SHA-256 复核；在此之前硬件细节优先回到 D-Robotics 官方页面。

## 已知外部交接文件状态

| 文件 | 预期路径 | 当前状态 | 主线替代 |
|---|---|---|---|
| Qoder 独立交接信封 | `D:\10451\Users\10451\Downloads\jiaowu2K26-Qoder-Handoff.md` | ⬜ 2026-07-22 未找到 | README + PROJECT-MANIFEST |
| 旧飞书组队终稿 | `D:\10451\Desktop\jiaowu2K26_飞书组队帖_终稿.txt` | ⬜ 2026-07-22 未找到 | `reference/PITCH-COPY.md` |
| 美术资产白名单 | `D:\10451\Desktop\jiaowu2K26_美术资产白名单与缺口表.md` | ⬜ 2026-07-22 未找到 | 海报 Prompt 已并入 `reference/PITCH-COPY.md`；完整资产白名单仍待恢复或重建 |

不得因为旧文档记录了哈希或路径，就声称这些外部文件当前仍存在。

## 本地文档中心（非产品工具）

用户已明确批准本地文档阅读与协作工具；项目现处于 `hacking / P0-00 review`，文档站本身仍不是产品完成证据。

| 项目 | 约定 |
|---|---|
| 规范运行时 | 仓库内 Node.js 24.18.0 + npm 11.16.0；系统 Node 25 不参与验证 |
| 文档框架 | Astro 7.1.3 + Starlight 0.41.4 + Sharp 0.35.3，精确版本由 `docs-site/package-lock.json` 锁定；`npm audit` 为 0 |
| 配置入口 | `pwsh -NoProfile -ExecutionPolicy Bypass -File .\tools\Docs.ps1 -Action Setup` |
| 本地地址 | `http://127.0.0.1:4321/`，只绑定回环地址，不对局域网或公网暴露 |
| 桌面入口 | `D:\10451\Desktop\Jiaowu2K26 文档中心.lnk` |
| 内容生成 | 从根规范源投影到被 Git 忽略的 `docs-site/src/content/docs/`，禁止编辑生成副本 |
| Git 更新 | 仅在 Git 工作区干净且有 upstream 时执行 `git pull --ff-only`；否则无损跳过 |
| Junction 兼容 | 人与 AI 继续使用稳定 D 入口；本机 Astro/Vite 构建统一切到已核验等效的 `C:\Desktop\黑客松`，防止 D/C 模块身份混杂导致核心 CSS 丢失 |

依赖、构建、日志和运行 PID 只存在于 `docs-site/` 对应的已忽略目录。团队配置与故障排查见 `docs/GETTING-STARTED.md`，目录地图见 `docs/PROJECT-STRUCTURE.md`。

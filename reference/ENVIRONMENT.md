# 本机环境

> 环境快照日期：2026-07-21。此文件记录开发机器的硬件、软件和路径约束。

---

## 硬件与系统

| 项目 | 详情 |
|------|------|
| OS | Windows 11 Home 中文版，build 26200 |
| CPU | Intel Core i7-13700H，14 核 / 20 线程 |
| 内存 | 约 64 GB |
| GPU | NVIDIA GeForce RTX 4070 Laptop（8188 MiB，驱动 610.74 快照）+ Intel Iris Xe |
| 存储 | C 卷约 3.7 TB 总量，约 1.09 TB 可用 |

## 已安装软件

| 软件 | 版本 | 备注 |
|------|------|------|
| Unity Editor | 6000.3.17f1 | 不代表 P0 采用；Unity Hub 3.13.0 |
| Visual Studio Community 2026 | 18.7.1 | 含原生游戏工作负载 |
| PowerShell 7 | — | 优先使用 |

## 未安装 / 不应擅自安装

| 软件 | 状态 | 原因 |
|------|------|------|
| Unreal Engine | ⬜ 未安装 | P0 拒绝 UE 5.8 |
| Epic Games Launcher | ⬜ 未安装 | 与 UE 关联 |
| Steam | ⬜ 未安装 | 无需购买 NBA 2K |

## 路径规则

- **项目根目录：** `D:\10451\Desktop\黑客松`
- **批准的 Junction 根：** `D:\10451`
- `D:\10451` 和 `D:\DiskC` 是指向 C 卷的 junction
- **不得向 D 盘非 junction 路径写入**
- 一次操作只能选择一个根（C 或 `D:\10451`），禁止混用
- 等价别名不可同时扫描

## 外部参考库

| 名称 | 路径 | 用途 |
|------|------|------|
| NBA 2K 设计研究库 | `D:\10451\Users\10451\Downloads\NBA2K-Design-Reference\` | 30 张官方界面截图 + 指南 + SHA 清单；仅内部研究，非可复用资产 |
| WinUI 3 参考库 | `D:\10451\Users\10451\Downloads\WinUI3-Reference\` | 控件、可访问性和工程结构参考；不整包复制 |

两份参考库的机器清单与当前哈希登记在根目录 `PROJECT-MANIFEST.json`。同一底层目录不得再通过 C 路径重复扫描。

## 权限与安全

- 非管理员会话
- 不修改系统配置 / 注册表 / 环境变量
- 不默认读取 `.env` / 令牌 / Cookie / 密钥
- 不安装项目依赖、硬件 SDK 或游戏引擎（除非经 Gate 批准）

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

用户已明确批准安装本地文档阅读与协作工具；这不改变产品仍为 `not_started` 的状态，也不授权提前实现 `app/`。

| 项目 | 约定 |
|---|---|
| 规范运行时 | Node.js 24 LTS；当前机器的 Node.js 25 可完成本次验证，但不作为团队基线 |
| 文档框架 | Astro 6 + Starlight 0.38，精确版本由 `docs-site/package-lock.json` 锁定 |
| 配置入口 | `pwsh -NoProfile -ExecutionPolicy Bypass -File .\tools\Docs.ps1 -Action Setup` |
| 本地地址 | `http://127.0.0.1:4321/`，只绑定回环地址，不对局域网或公网暴露 |
| 桌面入口 | `D:\10451\Desktop\Jiaowu2K26 文档中心.lnk` |
| 内容生成 | 从根规范源投影到被 Git 忽略的 `docs-site/src/content/docs/`，禁止编辑生成副本 |
| Git 更新 | 仅在 Git 工作区干净且有 upstream 时执行 `git pull --ff-only`；否则无损跳过 |
| Junction 兼容 | 人与 AI 继续使用稳定 D 入口；本机 Astro/Vite 构建统一切到已核验等效的 `C:\Desktop\黑客松`，防止 D/C 模块身份混杂导致核心 CSS 丢失 |

依赖、构建、日志和运行 PID 只存在于 `docs-site/` 对应的已忽略目录。团队配置与故障排查见 `docs/GETTING-STARTED.md`，目录地图见 `docs/PROJECT-STRUCTURE.md`。

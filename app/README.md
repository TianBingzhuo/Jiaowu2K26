# 大学2K26 / University2K26 正式程序工作区

本目录是正式程序的边界。项目处于 `hacking / GATE-1`：后端技术切片仍待 PR 接受，首页美术方向已经用户确认，V0.9 Web/PWA 外壳与 F-001～F-010 Fixture 纵向切片处于 `technical_review`；不要把技术候选等同于完整产品或人类已接受成果。

## 当前真实存在

```text
contracts/v1/         OpenAPI 3.1 + JSON Schema，跨端事实源
fixtures/v1/          十份明确标注、脱敏且非权威的 Golden Fixture
apps/web/              University2K26 V0.9 React/TypeScript Web/PWA 外壳
crates/domain/        不依赖 HTTP、SQL、UI 或操作系统类型的领域状态机
crates/application/   用例与 repository port
crates/adapters-sqlite/ SQLx/SQLite 事务适配器与 migration
crates/api/           Axum `/api/v1` HTTP 适配器
```

当前已经本地验证十条可操作链路：

```text
fixture → draft → review → approved → published → replay
season → roster → course → learning → personal box score
source → immutable snapshot → field provenance → conflict/consent → archive/audit
prefix + pins → three plans → what-if → conflict → transaction → semester.lock
exam calendar → briefing → warm-up → playbook → key match → replay → private reflection
private baseline → rhythm/gap → load/support → recommendation → purpose share/correction → STOP/replay
transparent market → four-state eligibility → selective match → mutual intent → disclosure/revoke → fairness replay
course profile → source ladder → scouting/version → governed feedback → squad/advisor → governance replay
campus concourse → search/profile → calendar/map → MyCOURT → squad/mentor → support/replay
pass wallet → reader drill → prerequisite/guest/offline/loss → correction → replay
```

后端链路验证来源关联、未知状态停损、乐观并发、追加式审核事件、发布门禁、SQLite 事务、Academic Mirror 数据边界、Roster Lab 规划边界、World Exam 状态机、Performance Center 隐私/STOP 不变量、Opportunity Market 反操纵/最小披露边界、Coach & Scouting 的来源分层、版本、阈值、纠错、公平与治理边界，以及 Campus Life 和 Campus Pass 的来源、最小权限、纠错与私有回执边界。`apps/web` 另行验证首页 Experience Shell、API 健康握手、F-001 对象/Replay 只读合同回执、PWA 离线壳、六门脱敏 Demo 课程、多输入路径和十个模块的显式 Fixture 回退。F-001 的 Studio 编辑仍是本地演练；F-003～F-010 的 Rust Session 暂为进程内存。这些证据都不代表真实文件导入、材料上传、实时 AI 生成、OceanBase、真实考试、正式选课、有效能力测量、真实机会申请、真实教师评价、校园报名、地图定位、门禁执行、危机服务或学校系统已经完成。

## 一键检查

在 Windows PowerShell 7 中：

```powershell
pwsh -NoProfile -File .\scripts\doctor.ps1
pwsh -NoProfile -File .\scripts\verify.ps1 -SkipDocs
```

本机 Smart App Control 处于 enforcement，会阻止 `rustc.exe` 加载本地生成、未签名的 proc-macro DLL。脚本不会修改安全设置，而是自动选择已配置的 Ubuntu WSL2；其他未受该策略影响的机器走原生 Rust。实时 API 实验可在 Linux/WSL 中运行：

```bash
bash scripts/smoke-api.sh
```

## 从全新克隆运行 V0.9

只需试玩、路演或参与 UI/UX 的同学使用 Fixture 模式：

```powershell
pwsh -NoProfile -ExecutionPolicy Bypass -File .\scripts\bootstrap.ps1 -WebOnly -SkipDocs
pwsh -NoProfile -ExecutionPolicy Bypass -File .\scripts\Start-University2K26.ps1 -FixtureOnly
```

它只准备锁定的 Node/npm 与 Web 依赖，然后打开 `http://127.0.0.1:4173/`。完整 Rust/API、macOS/Linux、环境变量和停止方式统一见 [`docs/GETTING-STARTED.md`](../docs/GETTING-STARTED.md)，不要在本文件维护第二套配置事实。

## 当前边界

- 根目录 Markdown 与 `PROJECT-MANIFEST.json` 仍是产品、架构、赛事与任务事实源。
- Codex 可按 `engineering/F-MODULE-DELIVERY-GATE.md` 把一个模块推进到 `technical_review`；只有产品总集成人员可接受、合并或发布。
- OceanBase 保持未验证的可选适配器；SQLite + Fixture 是已验证且不依赖云账号的路径。
- React 19 + TypeScript + Vite 6.4.3 Web/PWA 已进入 P0-00-D 验证；Tauri、WinUI 3、Unity、Unreal 均未接入。
- `j2k26` CLI、外部 AI adapter 与 BYOK 凭据库仍只有架构合同；须等 P0-00-B/C accepted 后单独认领实现，当前不存在可用命令。
- `app/prototypes/` 保留为隔离式设计证据；当前正式客户端入口是 `app/apps/web/`，但物理手柄、真实触屏和第二台机器仍需补证。
- 项目公开不等于授予开源许可证；在权利人选择许可证前，所有 crate 都设置为 `publish = false`。

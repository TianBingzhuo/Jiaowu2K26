# jiaowu2K26 正式程序工作区

本目录是正式程序的边界。项目处于 `hacking / GATE-1 / P0-00`：已经有一条**待 PR 审核的技术验证切片**，但仍没有任何被用户验收的产品功能。

## 当前真实存在

```text
contracts/v1/         OpenAPI 3.1 + JSON Schema，跨端事实源
fixtures/v1/          明确标注的 BST 授权演示 Fixture
crates/domain/        不依赖 HTTP、SQL、UI 或操作系统类型的领域状态机
crates/application/   用例与 repository port
crates/adapters-sqlite/ SQLx/SQLite 事务适配器与 migration
crates/api/           Axum `/api/v1` HTTP 适配器
```

已验证的唯一链路是：

```text
fixture → draft → review → approved → published → replay
```

它验证来源关联、未知状态停损、乐观并发、追加式审核事件、发布门禁、SQLite 事务和机器可读失败；不代表材料上传、AI 生成、React 界面、学生互动、OceanBase 或真实学校系统已经完成。

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

## 当前边界

- 根目录 Markdown 与 `PROJECT-MANIFEST.json` 仍是产品、架构、赛事与任务事实源。
- 只推进 P0-00；P0-01 及以后必须等待本 PR 的 CI、真实实验和用户批准。
- OceanBase 保持未验证的可选适配器；SQLite + Fixture 是已验证且不依赖云账号的路径。
- React/PWA 尚未进入本轮验证；Tauri、WinUI 3、Unity、Unreal 均未接入。
- 项目公开不等于授予开源许可证；在权利人选择许可证前，所有 crate 都设置为 `publish = false`。

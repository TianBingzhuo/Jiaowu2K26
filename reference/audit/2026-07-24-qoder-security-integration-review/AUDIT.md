# Qoder 改动、独立安全复核与 F-001 接线审计

> 日期：2026-07-24（Asia/Shanghai）
>
> 分支：`agent/phase0-foundation`
>
> 基线：`464a5267e0c9af47a5bed6e14bd6ea9974585fbf`
>
> 范围：Qoder 留下的未提交改动、F-001 前后端接线、相关第一方代码与本地运行链
>
> 结论边界：这是本地公开 Fixture 技术候选的差异审计，不是生产系统认证或渗透测试

## 1. 结论

Qoder 的核心判断是有价值的：现有 Rust/Axum/SQLx/SQLite 与
React/TypeScript/Vite 分层没有必要推倒重来，最值得先修的是前端长期只消费
`/api/v1/health`、业务演练与后端合同彼此分离的问题。

本轮接受并加固了其中最小、可回滚的一段：

1. 建立 F-001 `/api/v1` 的 TypeScript 前端合同投影；
2. 为五个 generated-object 端点建立可注入、可降级的客户端；
3. 在 SmartCourse Replay 中加入只读 API 回执；
4. 保留原有本地可编辑 Fixture，不把前端演练伪装成后端写入；
5. 将 7 个初始客户端测试扩展为 16 个，补齐嵌套对象、错误体、超时、
   URL 编码和版本不兼容边界。

接受范围内没有发现已确认的 Critical / High 漏洞，但这个结论只适用于
`127.0.0.1` 上的脱敏 Fixture Demo。服务端目前没有真实认证、授权、租户隔离和
限流，**不得据此批准局域网或公网生产部署**。

## 2. 对 Qoder 产出的评价与修正

### 保留的判断

- 合同优先、领域层不绑定 UI/数据库的方向正确；
- 当前不需要微服务化或框架迁移；
- Qoder L2/L3 对本次差异均报告 0 findings；
- SQLx 查询使用绑定参数，workspace 级 `unsafe_code = "forbid"`；
- 无生产身份治理是已知产品边界，而不是可以被前端 Role Lens 补上的能力。

### 必须修正的表述

- 新增 TypeScript 类型是**人工维护的前端合同投影**，不是自动生成的“单一真相”；
  权威合同仍在 `app/contracts/v1/`。
- Qoder L2/L3 审的是差异，不是 136 万行整仓；0 findings 不能外推为“全项目安全”。
- F-001 现在只是读取后端对象与 Replay 作为证据回执；Studio 的修改、审核、发布与
  学生互动仍在本地 Fixture 引擎中，不能宣称全业务已在线接通。
- “Rust 所以基本不会有安全问题”不成立。Rust 主要降低内存安全风险，不自动解决
  身份冒用、越权、业务逻辑、资源耗尽、秘密管理和供应链风险。

Qoder 的 14 份 `docs/release-readiness-v0.99/` 草稿包含大量重复 Wiki、过程日志和
已被现有权威文档覆盖的结论，因此保留在本机工作区供追溯，不纳入本次 Git 主线。
本文件是可长期维护的压缩审计入口。

## 3. 独立安全复核

| 检查面 | 结果 | 证据与限制 |
|---|---|---|
| 前端依赖 | 通过 | Web 与文档站 `npm audit` 均为 0 vulnerabilities |
| Rust 内存边界 | 通过 | workspace `unsafe_code = "forbid"`，本次差异无 `unsafe` |
| SQL 注入 | 未发现 | SQLite adapter 使用 SQLx 静态语句与参数绑定，无动态 SQL 拼接 |
| 秘密与凭据 | 未发现 | 跟踪文件仅有占位 `.env.example`；候选命中均为文档说明 |
| 动态执行 / DOM 注入 | 未发现 | 新增前端代码无 `eval`、动态脚本、`dangerouslySetInnerHTML` 或外部 URL |
| 合同输入 | 加固后通过 | 运行时守卫从只看外壳改为逐层验证 Evidence、Event、Version、Interaction 与 Replay |
| Rust 质量门禁 | 通过 | fmt、clippy `-D warnings`、workspace 全测试；63/63 |
| Web 质量门禁 | 通过 | strict typecheck、18 个测试文件 142/142、Vite production build |
| 实际浏览器主路径 | 通过 | Edge/Chromium 完成 F-001 来源→审核→发布→互动→Replay，验收 7/7 |
| Rust 供应链数据库 | 未形成证据 | 当前环境未安装 `cargo-audit`；本次差异没有改 Cargo 依赖 |
| GitHub 安全告警 | 未形成证据 | 当前令牌/仓库设置无法读取 Dependabot 与 secret-scanning 告警接口 |
| Codex Security 云扫描 | 未形成证据 | 本机工具在中文路径初始化时出现 GBK 解码错误；已转人工差异审查，未伪报成功 |

Qoder 官方将其能力描述为 L1 静态扫描、L2 语义差异审查和 L3 跨文件数据流分析；
官方同时明确认证缺陷、权限提升与业务逻辑问题不是当前重点，不能替代代码审查、
测试或专业审计：

- [Qoder Security](https://qoder.com/en/security)
- [Qoder 安全指南](https://qoder.com/zh/blog/qoder-security-guide)
- [Qoder Changelog](https://qoder.com/changelog)

## 4. 实际发现与处置

### CONTRACT-001：嵌套响应只校验外壳

- 风险：畸形 Evidence / Replay 子对象可能被当作可信响应交给 UI。
- 处置：为全部嵌套对象加入版本、非空字段、安全整数、可空字段和置信度范围守卫。
- 回归：新增 v2 拒绝、畸形嵌套对象、非法置信度与超大整数测试。
- 状态：已修复。

### REL-001：`sqlite::memory:` 长时间运行后悄然丢失 schema

- 复现：API `/health` 仍为 200，但 F-001 对象读取在长时间运行后返回
  `repository_unavailable`。
- 根因：SQLx pool 默认会回收空闲或达到最大生命周期的连接；内存 SQLite 的数据库
  属于连接本身，唯一连接被替换后 schema 与 seeded fixture 一并消失。
- 处置：内存模式固定一条最小连接，并关闭 idle timeout 与 max lifetime；文件数据库
  保持原池策略。
- 状态：已修复，重启 API 后对象与 Replay 均恢复 200。

### UX-001：英文赛事浮层挡住答题主按钮

- 复现：页面视觉正常，但点击“提交答案并查看依据”会打开英文导览。
- 根因：固定定位的可点击 `NOW PLAYING` 按钮覆盖主 CTA。
- 处置：改为 `role="status"` 的非交互提示，保留独立 `EN Guide` 按钮；
  增加 `pointer-events: none` 回归守卫。
- 状态：已修复，浏览器命中测试返回真实提交按钮，F-001 达到 7/7。

## 5. 仍然有效的安全阻断项

以下不是本轮回归，但在离开本机 Fixture 环境前必须完成：

1. SSO/OIDC 或等价受控身份；请求中的 `actor_id` 目前只是审计标签，不是凭证。
2. 服务端 RBAC/ABAC：角色、组织范围、用途、时限、撤权与追加式审计。
3. 请求体上限、速率限制、超时、并发与资源预算。
4. 租户隔离、持久化、备份恢复、数据保留和删除/纠错流程。
5. 明确的 CORS、TLS、反向代理与秘密管理；默认继续只绑定回环地址。
6. Rust 依赖 RustSec/许可证检查与 GitHub 安全告警的可访问证据。

## 6. 最终判定

- **Qoder 方案：** 方向正确，文档过度膨胀且部分结论需要降格。
- **接受的代码差异：** 经加固、测试与浏览器验收后可进入 Draft PR。
- **安全结论：** 本地脱敏 Fixture Demo 可继续；生产或非回环部署不批准。
- **事实状态：** 技术候选仍为 `technical_review`，不改写为 accepted、release 或生产完成。

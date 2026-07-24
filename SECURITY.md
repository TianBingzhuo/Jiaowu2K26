# 安全与负责任披露

大学2K26 / University2K26 未来可能连接学生、教师、学校与支付相关系统，因此安全、隐私和数据主权从规格阶段就属于产品合同，而不是上线前补丁。

## 当前支持状态

当前没有正式产品版本，也没有生产服务。项目已进入 Phase 0 技术基线阶段；可验证范围包括公开文档仓、协作工具、GATE-1 基座和明确标注的 F-001 Fixture 技术候选。F-001 为 `technical_review`，其余产品模块为 `pending`。任何概念图、Fixture 或 Demo 数据都不应被解释为真实校园系统或真实用户数据。

## 私下报告问题

- 公开主仓已启用：优先使用仓库 Security 页的 **Private vulnerability reporting / Security Advisory**；若入口暂不可用，私下联系项目总集成人员。不要在公开 Issue、群聊、海报或 Demo 中披露漏洞细节。
- 报告应包含影响范围、最小复现、受影响版本或提交、可能接触的数据类型以及建议的临时缓解措施。

不要把 token、Cookie、私钥、真实账户、真实学生记录或完整数据库样本附在报告里。若秘密已经进入 Git 历史，立即停止传播，先撤销或轮换，再由总集成人员协调清理历史。

## 数据与开发红线

- 默认只使用原创或明确授权的 Golden Fixtures；不使用真实学生、教师、门禁、成绩、支付或健康数据。
- `.env`、本地凭据、构建日志和缓存不得提交；示例配置只能包含占位符。
- BYOK profile 可以共享无秘密的 provider/model/capability 元数据，真实 key 只进入操作系统凭据库、批准的 secret manager 或当前受控进程环境。浏览器不得写入 `localStorage`、`IndexedDB`、Service Worker cache、URL 或遥测，CLI 不接受 `--api-key` 一类会进入 history/进程列表的参数。
- 外部 AI、CLI 与未来 MCP adapter 默认只读，只能调用 allowlist 应用能力；高风险写入必须绑定具体 actor、资源、动作、过期时间和 nonce 的一次性人类批准，不能用通用 `--yes`、模型自我确认或 Shell/数据库直通代替。
- 自定义模型 endpoint 需要 scheme、重定向、DNS/IP 与数据外发范围校验；不得允许其探测云元数据、link-local、未批准私网或任意本机服务。
- Academic Mirror、Campus Pass 与 General Balance 均须经过最小权限、租户隔离、审计、撤回、数据保留和威胁模型评审后才能接真实系统。
- 可阅读导出不具权威性；可信归档必须有发行方签名、版本与导入隔离，不能因“能解密”就覆盖学校权威数据。
- 支付默认只使用 sandbox/fixture；不得在黑客松 Demo 中收集真实银行卡或开通真实免密代扣。
- NBA、2K、maimai 等资料只作机制研究，不复制商标、界面、音频、角色或其他受保护资产。

产品边界见 [`product/BOUNDARIES.md`](product/BOUNDARIES.md)，跨系统安全合同见 [`engineering/ARCHITECTURE.md`](engineering/ARCHITECTURE.md)，通用质量门禁见 [`gates/QUALITY.md`](gates/QUALITY.md)。

## 修复与披露流程

1. 总集成人员确认收到并限制知情范围。
2. 复现人员在隔离 Fixture 中验证，不触碰真实环境。
3. 按影响与可利用性分级，明确临时缓解、修复 owner 与回退方案。
4. 非作者复核并运行受影响 Gate；涉及数据合同的修复同步更新 SPEC、架构与 Manifest。
5. 在不增加用户风险、且经项目负责人同意后，再发布不含利用细节的修复说明。

没有得到明确授权时，不对外扫描、渗透或测试学校、赞助商及第三方系统。

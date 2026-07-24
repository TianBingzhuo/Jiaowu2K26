# University2K26 V0.9 · ASUS Ascent GX10 部署交接

> 交接对象：在 GX10 本机工作的另一位 AI 与产品总集成人员。
> 当前事实：本机 Windows/WSL 已验证 Web/PWA、Rust API 与 Fixture；**GX10 尚未实机执行本文件**。
> 详细设备、模型、安全与 receipt 合同以 [LOCAL-AI-SOVEREIGN-NODE](LOCAL-AI-SOVEREIGN-NODE.md) 为准。

## 1. 本次能诚实部署什么

| 能力 | V0.9 状态 | GX10 目标 |
|---|---|---|
| University2K26 Web/PWA | 已实现；React 19 + strict TypeScript + Vite 6.4.3 | 在 ARM64 本机重新安装、测试、构建并启动 |
| Rust `/api/v1/health` 与审核纵向切片 | 已实现；SQLite/Fixture | 在 GX10 原生 ARM64 编译、测试并只监听 localhost |
| 六门 Demo 课程 | 已实现；仅索引摘要 + 虚构进度 | 原样复现，不上传私人课件 |
| PWA 离线壳 | 构建与静态安全测试通过 | localhost 可验证；局域网访问若无 HTTPS 不宣称可安装 PWA |
| 本地大模型 | Provider-neutral adapter 已实现；GX10 端点尚未实测 | 独立验证一个 OpenAI-compatible 模型端点并接入 Rust API |
| AI 路由 / BYOK | `/ai/status`、`/ai/advice`、来源约束、规则回退已实现；RAG 未实现 | 只把服务端进程密钥注入 adapter，验证模型与回退两条路径 |
| OceanBase | 未验证可选 adapter | 不作为 GX10 启动依赖 |

成功标准不是“网页和模型都亮了”，而是当前产品链路可重复运行、模型链路独立可控、AI 建议能在来源约束合同内返回，停掉模型后又能明确回退。

## 2. 第一轮只读盘点

GX10 操作 AI 先读取 `AGENTS.md`、`PROJECT-MANIFEST.json.current_work`、本文件、`LOCAL-AI-SOVEREIGN-NODE.md` 与 `SECURITY.md`，然后只运行：

```bash
uname -a
cat /etc/os-release
uname -m
free -h
df -h
nvidia-smi
docker --version
git --version
node --version
npm --version
rustc --version
cargo --version
```

必须返回：

- 真机型号、OS、ARM64 架构、驱动/runtime、可用内存与磁盘的脱敏汇总；
- 当前仓库 commit、分支和 `git status --short`；
- 预计新增下载量、构建目录、监听地址、停止和回滚办法；
- 需要用户批准的**一个**下一步动作。

此阶段不安装、不升级、不下载模型、不读取 `.env`、不开放端口。

## 3. 产品链路部署（批准后）

以下命令假设设备 AI 已确认官方 Node 24、Rust 1.97.1 和构建工具与 ARM64 兼容。版本不符时先停下报告，不能静默换栈。

```bash
git clone https://github.com/TianBingzhuo/Jiaowu2K26.git university2k26
cd university2k26
git switch agent/phase0-foundation
git rev-parse HEAD
git status --short

npm ci --prefix app/apps/web
npm run verify --prefix app/apps/web

cargo fmt --manifest-path app/Cargo.toml --all -- --check
cargo check --manifest-path app/Cargo.toml --workspace --all-targets --locked
cargo test --manifest-path app/Cargo.toml --workspace --all-targets --locked
cargo clippy --manifest-path app/Cargo.toml --workspace --all-targets --locked -- -D warnings
cargo build --release --locked --manifest-path app/Cargo.toml --bin j2k26-api
```

若目标 commit 仍未推送，产品总集成人员应先审核并发布该 commit；设备 AI 不得从聊天附件、临时网盘或未知压缩包拼接“近似版本”。

### 启动当前 Demo

终端 A：

```bash
cd university2k26
J2K26_BIND=127.0.0.1:3000 \
J2K26_DATABASE_URL='sqlite::memory:' \
J2K26_AI_PROVIDER='gx10-local' \
J2K26_AI_BASE_URL='http://127.0.0.1:8000/v1' \
J2K26_AI_MODEL='<实测 /v1/models 返回的模型 ID>' \
J2K26_AI_AUTH_MODE='none' \
./target/release/j2k26-api
```

终端 B：

```bash
cd university2k26
VITE_API_ORIGIN=http://127.0.0.1:3000 \
npm run preview --prefix app/apps/web -- --host 127.0.0.1 --port 4173 --strictPort
```

本机访问 `http://127.0.0.1:4173/`。这条 `vite preview` 路径只用于黑客松受控 Demo，不是公网生产服务器。

### 最小验收

```bash
curl --fail --silent http://127.0.0.1:3000/api/v1/health
curl --fail --silent http://127.0.0.1:3000/api/v1/ai/status
curl --fail --silent http://127.0.0.1:4173/api/v1/health
curl --fail --silent --head http://127.0.0.1:4173/
curl --fail --silent --head http://127.0.0.1:4173/manifest.webmanifest
curl --fail --silent --head http://127.0.0.1:4173/sw.js
```

浏览器再确认：

1. 顶部为“UNIVERSITY2K26”，后端显示“API 已连接 · Fixture”；
2. 首页主赛程为“信号与线性系统”；
3. 课程阵容含六门课，依据抽屉能解释 `course-index:*` 和 Fixture 边界；
4. 加载、离线、错误、传统叙事和减少动效状态可恢复；
5. API 停止后页面明确降级，不能显示假成功。
6. 有模型服务时 `/ai/advice` 返回 `mode=model` 且只引用输入 `source_ids`；
7. 停止模型后同一请求返回 `mode=rules_fallback`，不得显示为模型建议。

## 4. 局域网与 HTTPS 决策

默认只监听 `127.0.0.1`。若评审设备必须从同一局域网访问：

1. 用户确认网络、访问设备和暴露时段；
2. 只把 Web 入口暴露到批准 LAN，Rust API 继续保持 localhost；
3. 使用受审核的 HTTPS 反向代理与短期证书；
4. 关闭目录列表、调试端点和无关端口；
5. 展示结束立即撤销规则并验证端口关闭。

浏览器在普通 LAN HTTP 地址上通常不会授予 Service Worker 安全上下文，因此没有 HTTPS 时只能展示网页，不得宣称远端设备已安装/离线运行 PWA。不要为绕过此限制关闭浏览器安全控制。

## 5. 模型链路（独立 Spike）

产品链路验收后，按 `LOCAL-AI-SOVEREIGN-NODE.md` 的批准点单独启动一个模型。当前优先候选是文档登记的 `Qwen3.6-35B-A3B-NVFP4`，但精确仓库、revision、容器 digest、许可证和 NVIDIA 配方必须由设备 AI在执行日复核。

模型端点要求：

- 默认 `127.0.0.1`，不得无鉴权暴露公网；
- 不挂载真实学生材料、密钥或整个用户目录；
- 先限制 context 与并发，保留至少 16–20GB 系统余量；
- 验证 `/v1/models`、中文结构化输出、取消请求和干净停止；
- 记录冷启动、首 token、吞吐、峰值统一内存、磁盘与回滚；
- 停止模型后 University2K26 Fixture 路径仍应完整可用。

Rust API 已有 OpenAI-compatible adapter，但只有同时通过 `/v1/models`、来源约束建议、非法来源 ID 拒绝、超时回退和停服回退，才能写成“University2K26 已在 GX10 本地模型驱动一条建议链路”。没有实机回执前仍只能写“adapter 已实现，GX10 未验证”。

## 6. 停止与回滚

设备 AI必须记录真实 PID、容器名或 systemd unit，再按对应方式停止；不要使用宽泛的 `killall`、删除整个 Docker 数据目录或清空模型缓存。

回滚验收：

- 4173、3000 和模型端口均不再监听；
- 没有残留容器、后台下载或自动启动项；
- 仓库 `git status --short` 只包含已知本地证据，不能覆盖队友改动；
- `.data/gx10/<UTC timestamp>/` 保存原始本地证据，公开摘要已脱敏；
- 下载的权重是否保留或删除由用户单独批准。

## 7. 设备 AI 启动 Prompt

```text
你是 University2K26 的 ASUS Ascent GX10 设备操作 AI。

先完整读取 AGENTS.md、PROJECT-MANIFEST.json.current_work、
engineering/GX10-V09-DEPLOYMENT-HANDOFF.md、
engineering/LOCAL-AI-SOVEREIGN-NODE.md 和 SECURITY.md。

第一轮只做到 INVENTORY_RECORDED：
1. 只读确认设备、OS/ARM64、驱动、容器、内存、磁盘、Node、Rust 和仓库状态；
2. 不安装、不升级、不下载权重、不开放端口、不读取或回显任何 secret；
3. 返回脱敏 inventory receipt、预计下载量、监听面、回滚和唯一下一步批准请求；
4. 空闲磁盘低于 200GB、未知服务占用资源、工作树有无法解释的改动，
   或下一步需要降低安全控制时立即停止。

用户明确批准后，先部署并验证 University2K26 Web + Rust Fixture 链路；
产品链路通过后，模型服务另作独立 Spike；再把 loopback OpenAI-compatible
端点配置给 Rust adapter。只通过聊天请求不算产品接入，必须通过来源引用、
Schema、停服回退和浏览器 UI 回归。
```

## 8. 最终回执

设备 AI 使用 `LOCAL-AI-SOVEREIGN-NODE.md` 的 receipt schema，并额外附上：

```yaml
university2k26_v09:
  web_verify: "passed | failed"
  rust_verify: "passed | failed"
  web_url_scope: "localhost | approved_https_lan"
  api_health: "passed | failed"
  course_roster: "passed | failed"
  evidence_boundary: "passed | failed"
  fallback_after_api_stop: "passed | failed"
  pwa_secure_context: "localhost | https | not_claimed"
model_integration:
  service_spike: "not_run | passed | failed"
  product_adapter: "implemented_unverified | contract_tested | failed"
  advice_mode_with_model: "not_run | model | rules_fallback"
  advice_mode_after_model_stop: "not_run | rules_fallback | failed"
  source_id_enforcement: "not_run | passed | failed"
```

只有产品总集成人员审核这份回执后，Manifest 才能把 GX10 从 `unverified` 改为 `validated`。

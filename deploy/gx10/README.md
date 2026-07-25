# GX10 可复现部署包

此目录把 University2K26 Web、Rust API 与 loopback AI adapter 的部署面固定下来；它不会猜模型镜像、权重 revision、许可证或设备状态。

## 硬边界

- 目标是真实的 **ASUS Ascent GX10**，不是把设备改名成 DGX Spark；
- `compose.app.yaml` 只启动 Web 与 Rust API；模型服务要先按 NVIDIA 官方配方在独立 Spike 中验证；
- 两个应用服务使用 Linux host network，只监听 `127.0.0.1`，使 API 能安全访问同机 `127.0.0.1:8000/v1`；
- `J2K26_AI_AUTH_MODE=none` 仅允许 loopback；远端 HTTP 会被 Rust adapter 拒绝；
- 真实密钥、学生数据、原始课程材料和设备身份不得写入本目录或 Compose；
- OceanBase、RAG、真实 SIS/URP/LMS 与正式选课写回不属于本包。

## 状态机

```text
INVENTORY_RECORDED
  → MODEL_PLAN_APPROVED
  → MODEL_SERVICE_HEALTHY
  → APP_IMAGES_BUILT
  → APP_CONTRACT_TESTED
  → MODEL_CONTRACT_TESTED
  → FALLBACK_TESTED
  → HANDOFF_COMPLETE
```

第一轮只读盘点与批准点见 `engineering/GX10-V09-DEPLOYMENT-HANDOFF.md`。没有批准不要下载模型或启动 Compose。

## 应用启动（模型 Spike 已批准并启动后）

从仓库根目录执行：

```bash
mkdir -p deploy/gx10/runtime
export J2K26_AI_MODEL='<实测 /v1/models 返回的模型 ID>'
docker compose -f deploy/gx10/compose.app.yaml build
docker compose -f deploy/gx10/compose.app.yaml up
```

如果模型尚未启动，应用仍可启动，但 `/api/v1/ai/advice` 必须明确返回 `rules_fallback`。

## 最小合同检查

```bash
curl --fail --silent http://127.0.0.1:4173/api/v1/health
curl --fail --silent http://127.0.0.1:4173/api/v1/ai/status
curl --fail --silent http://127.0.0.1:4173/api/v1/roster/import-capabilities
```

AI 建议请求必须使用脱敏 Fixture，且输出只引用请求提供的 `source_ids`。随后停止模型进程，重复同一请求并确认 `mode=rules_fallback`。

## 停止

```bash
docker compose -f deploy/gx10/compose.app.yaml down
ss -ltnp | grep -E ':(4173|3000|8000)\b' || true
```

是否删除 `deploy/gx10/runtime`、构建镜像与模型权重由用户单独批准。不要使用宽泛的 `docker system prune` 或删除整个模型缓存。

最终填写 `model-runtime-receipt.example.yaml` 的副本，原始设备证据放在 Git 忽略的 `.data/gx10/<UTC>/`，PR 只提交脱敏摘要。

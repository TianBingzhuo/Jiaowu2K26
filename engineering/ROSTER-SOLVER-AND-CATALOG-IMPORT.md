# Roster Lab：Conda 式求解协议与真实目录导入边界

> 状态：`conda_style_v1` 合同与 Fixture 参考实现已落地；真实 UArizona / HEBUT 目录均未导入、未持久化、未宣称可用。

## 1. “像 Conda”具体指什么

Roster Lab 借鉴的是 Conda 处理环境依赖的语义，不冒充 Conda 本身，也不把预制方案包装成 SAT 求解结果。

| Conda 概念 | Roster Lab 对应 |
|---|---|
| channels | 带来源、授权范围、版本与校验和的课程目录通道 |
| MatchSpec | 课程、学期、班次、学分和培养要求 |
| dependency graph | 先修、共修、互斥、替代与培养路径 |
| hard constraints | 先修、共修、冲突、学分上限、互斥、学生 Pin |
| solver preference | 时段、紧凑度、跨域多样性、少改现状 |
| unsatisfiable core | 最小冲突集、阻塞链、可放宽项 |
| transaction | 加课、退课、换班的只读差异预览 |
| lockfile | 目录版本、输入、Pin、偏好、方案与 fingerprint |

处理顺序固定为：

1. 验证每个 catalog channel 的来源、范围、版本和 checksum；
2. 把硬约束与软偏好分层，硬约束不能被 AI 或排序权重偷偷放宽；
3. 生成零个或多个候选；零个候选时返回最小冲突集，不返回“神秘失败”；
4. 对可行候选按用户明确的目标顺序排序；
5. 保存可重放 `semester.lock`，先展示 transaction diff；
6. 正式选课只能由学生在学校权威系统完成。

当前 Rust / TypeScript 版本是 `deterministic_fixture_reference`：它验证协议、状态机、解释和回放，不是完整组合求解器。未来替换为 SAT / PubGrub / libsolv 类后端时，必须保持 `conda_style_v1` 输入输出和失败语义稳定。

## 2. 目录通道和数据边界

### UArizona

仅接受：

- `institution=uarizona`
- `dataset_scope=public_course_catalog`
- 来源以 `https://catalog.arizona.edu/` 或 `https://uaccess.schedule.arizona.edu/` 开头

明确拒绝：学生选课记录、成绩、hold、支付、身份和需要登录的 SIS 数据。公开页面可访问不自动等于获得再发布许可；每批仍要记录 `terms_version` 与 `use_basis` 并人工审核。

### HEBUT

仅接受公开目录或用户明确授权的课程目录导出。授权本地文件只登记不含真实路径的 `local-authorized://<alias>`，避免把用户名、目录结构或附件位置写入回执。

明确拒绝：学生身份、成绩、支付、正式选课动作。若以后要接入校内 SIS，必须走 Academic Mirror 的独立授权、最小字段、审计和撤销机制，不能复用这个 catalog 入口。

## 3. 两阶段导入

`POST /api/v1/roster/imports/validate` 只做第一阶段：

```text
RAW FILE / PUBLIC PAGE
  → bounded parser
  → strict field allowlist
  → source + scope gate
  → duplicate / bounds / checksum validation
  → validation receipt
  → STOP
```

成功回执也始终包含：

- `validation_status=validated_only`
- `imported=false`
- `persisted=false`
- `contains_enrollment_records=false`
- `is_formal_enrollment=false`

第二阶段 “promote” 尚未实现。将来必须由授权人检查许可、字段映射、学期、课程等价关系、错误抽样和回滚后，才把 receipt 提升为只读 catalog version。

## 4. API

| 接口 | 作用 |
|---|---|
| `GET /api/v1/roster/import-capabilities` | 返回两个学校可接受的范围、定位器、拒绝的数据类型和当前导入状态 |
| `POST /api/v1/roster/imports/validate` | 验证最多 500 条课程元数据，返回非持久化回执 |
| `POST /api/v1/roster/solve` | 接受可选 `solver_protocol=conda_style_v1`，返回约束模型和 Fixture 候选 |
| `GET /api/v1/roster/unsat` | 返回最小冲突集、阻塞链和可放宽项 |
| `GET /api/v1/roster/plans/{id}/diff` | 返回非正式 add/drop/swap 预览 |
| `POST /api/v1/roster/plans/{id}/lock` | 保存可重放、非正式选课 lock |

JSON Schema 位于：

- `app/contracts/v1/roster-catalog-import-request.schema.json`
- `app/contracts/v1/roster-catalog-import-receipt.schema.json`
- `app/contracts/v1/roster-plans-response.schema.json`

## 5. 真实数据到达后的验收

1. 原始下载保持只读，不提交 Git；
2. 记录来源 URL、抓取时间、条款版本、用途依据和 SHA-256；
3. 先检查许可与 robots / 访问条款，不绕过登录、验证码或访问控制；
4. 只映射课程元数据；发现身份、成绩、选课、付款字段立即停止；
5. 对课程编码、学分、先修表达式、共修、互斥、学期和重复项做抽样；
6. 生成 receipt，但不自动 promote；
7. 人工批准后再实现可回滚的 catalog promotion；
8. 用已知可行、无解、边界学分、时间冲突和跨校等价五组用例回归；
9. UI 必须持续显示来源、版本、未知容量和“非正式选课”。

## 6. 后续求解器替换门禁

正式组合求解器至少要通过：

- 同输入与目录版本产生同一候选顺序和 fingerprint；
- 硬约束 100% 验证，软偏好不得覆盖硬约束；
- 无解结果给出可复核的最小或近似最小冲突集；
- 对未知容量、未知先修和缺失课程等价关系采取保守阻塞；
- 超时可取消并返回明确 `partial`，不能悄悄降级为随机模板；
- lockfile 能在同一 catalog version 重放；
- 不写回 SIS、不占座、不自动提交；
- 性能、许可证、ARM64 / Windows 兼容性经过实测后才登记依赖。

# jiaowu2K26 · 现场数据与证据入口（当前为空）

> 赛前不在这里准备可运行数据包。正式开赛并确认规则后，再创建本届项目的输入、输出和评测记录。

建议现场按实际需要建立：

- `source/`：有权使用的输入材料与版本信息；
- `generated/`：现场生成结果与 source IDs；
- `reviews/`：教师审核事件和人工复核；
- `metrics/`：运行、成本、失败和任务测试记录。
- `provenance/`：开源依赖、第三方资产、模型、官方数据源和现场决策的版本/许可/哈希记录。

若现场启用 Academic Mirror，建议将权威源快照与用户产生数据分开，并在每条镜像记录中保留 `source_system`、`external_id`、`source_version`、`fetched_at` 和 `authority_level`。

重构前已有的历史样例已统一归档到 `archive/original-materials/demo-pack/`，不属于本届现场成果。

# 赞助/技术资源速查表

> 开幕后需逐项核实实际权益。"网站出现"≠"权益已确认"。
> 机器来源：根目录 `PROJECT-MANIFEST.json` 的 `resource_candidates`；研究说明见 `RESEARCH.md`。关系快照日期：2026-07-21，现场仍须复核。

---

## 当前主要赞助商资源

| 赞助方 | 权益概述 | 项目使用判断 | 现场核实状态 |
|--------|---------|-------------|-------------|
| 阶跃星辰 | 当届确认模型（精确额度/模型/条款未知） | 第一个测试的 AI 模型 | ⬜ 待核实 |
| 飞书 Base | 多维表格协作审核 | Secondary；Token、权限、限流和数据条款需实测 | ⬜ 待核实 |
| D-Robotics RDK | 端侧感知硬件（精确板型、配件、数量未知） | 高潜力硬件候选，SKU 未知 | ⬜ 待核实 |
| TuyaOpen | AIoT 硬件平台 | 高潜力 Secondary；与 RDK 同职责时二选一 | ⬜ 待核实 |
| Qoder | 一个月 PRO 会员 | 开发工具，不自动改变 AI 编码比例要求 | ⬜ 待核实 |
| 科大讯飞 | 语音能力 | Secondary 候选 | ⬜ 待核实 |
| Dify | 开源 LLM 编排平台 | Optional 编排，按需使用 | ⬜ 待核实 |
| AWS | 云服务 | Fallback / 部署候选 | ⬜ 待核实 |
| 百度秒哒 | 开发平台 | Secondary 候选 | ⬜ 待核实 |
| PICO XR | XR 设备 | P1 only，设备和团队技能满足后只选一条 | ⬜ 待核实 |
| 松灵机器人 AGILE-X | 机器人硬件 | P1 only，只有精确已装配硬件和负责人时进入 | ⬜ 待核实 |
| Nothing Glyph | 轻量物理反馈（Glyph Matrix） | 机型/系统/AAR 许可匹配后可用 | ⬜ 待核实 |
| Apple Vision / visionOS | XR + Core ML | P1 only，不做双端 P0 | ⬜ 待核实 |

## 已拒绝 / 仅作 Fallback 的候选

| 候选 | 状态 | 原因 |
|------|------|------|
| Injective | ❌ 拒绝 | 链上与 P0 问题不匹配 |
| XION | ❌ 拒绝 | 链上与 P0 问题不匹配 |
| CAMEL-AI | ❌ 拒绝 | 多 Agent 账号与故障面过多 |
| TEN Framework + Agora | P1 only | 实时音视频，P0 拒绝 |
| Seeed LeRobot | P1 only | 依赖精确机械臂、校准、Ubuntu/Torch |
| MiniMax | Fallback only | 仅历史信号 |
| ModelScope | Fallback only | 未验证 2026 |
| PPIO Model API | Fallback only | 未验证 2026 |
| CloudStudio | Dev fallback only | 云开发环境参考，未验证 2026；不作为产品运行依赖 |
| ClackyAI | Dev fallback only | 云端 AI 开发环境参考，未验证 2026；不与本地/Qoder 同时迁移 |

## 官方入口索引

- 模型与 AI：[阶跃星辰](https://platform.stepfun.com/) · [科大讯飞](https://www.xfyun.cn/) · [Dify 文档](https://docs.dify.ai/zh/home) / [GitHub](https://github.com/langgenius/dify) · [MiniMax](https://platform.minimaxi.com/) · [ModelScope](https://www.modelscope.cn/docs) · [PPIO](https://ppio.com/docs/model/get-start)
- 协作与开发：[飞书开放平台](https://open.feishu.cn/) · [Qoder](https://qoder.com/) / [文档](https://docs.qoder.com/) · [AWS](https://aws.amazon.com/) · [百度秒哒](https://www.miaoda.cn/) · [CloudStudio](https://cloudstudio.net/t) · [ClackyAI](https://clacky.ai/)
- 硬件与空间计算：[D-Robotics](https://developer.d-robotics.cc/rdk_doc_center/) · [TuyaOpen](https://www.tuyaopen.ai/zh/docs/about-tuyaopen) · [PICO](https://developer.picoxr.com/) · [AGILE-X](https://global.agilex.ai/) · [Nothing Glyph](https://github.com/Nothing-Developer-Programme/GlyphMatrix-Developer-Kit) · [Apple Developer Videos](https://developer.apple.com/cn/videos/)
- P1/拒绝候选：[TEN Framework](https://github.com/TEN-framework/ten-framework) / [Agora](https://docs.agora.io/en/video-calling/get-started/get-started-sdk) · [CAMEL-AI](https://docs.camel-ai.org/get_started/installation) · [Injective](https://docs.injective.network) · [XION](https://docs.burnt.com/xion/developers/computation/xion-quick-start) · [Seeed LeRobot](https://wiki.seeedstudio.com/lerobot_so100m/)

## 核实清单（开幕后填写）

- [ ] 主题已确认
- [ ] 赛道已选择
- [ ] 各赞助商领取方式和条件已记录
- [ ] 额度/限速/账号已确认
- [ ] 网络环境已测试
- [ ] D-Robotics/Tuya 精确 SKU 与领用条款已确认
- [ ] 两份地瓜 PDF（嵌入式竞赛赛道资料 + 嵌赛资料包）已按 SHA-256 复核

## 使用约束

- 最多一个硬件设为 P0 依赖，且必须有纯软件回退
- Qoder 是开发工具，不自动改变赛事对 AI 编码比例的要求
- 所有赞助权益需按现场实际逐项过 Gate
- 同一能力只选一个 Primary
- 高-risk P1 最多一个

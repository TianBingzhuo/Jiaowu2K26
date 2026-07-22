# RTF 网站技术审计

> 核验日期：2026-07-18。范围：Adventure X.rtf 的 26 个链接，以及少量在 RTF 中出现但未附链接的工具。结论用于现场选型，不代表已领取资源或已完成集成。
> 项目层级：`jiaowu2K26` 是总项目；“智课工坊”是首个 P0 模块，因此本页早期以智课工坊为锚点的判断仍有效，但不再代表项目全貌。

## 一、先给结论

这 26 个链接不是一套应该全部组合的架构，而是几条互相竞争的路线：

1. AI 应用与模型：Dify、MiniMax、CAMEL-AI、ModelScope、PPIO；
2. 实时语音与视频：TEN Framework、Agora；
3. 区块链：Injective、XION；
4. XR / 端侧 Apple：Vision、Core ML、SwiftUI、RealityKit、Foundation Models、visionOS；
5. 机器人与 IoT：D-Robotics、TuyaOpen、Seeed LeRobot、Nothing Glyph Matrix；
6. 开发环境与教程：CloudStudio、HackQuest、ModelScope 课程和 B 站视频。

对 `jiaowu2K26` 当前的智课工坊 P0 而言，最稳的做法是只选一个主模型 / 编排层、一个数据与审核界面，再按现场资源选择至多一个有辨识度的交互设备。Dify + CAMEL + TEN、多套区块链、两套 XR 或多台机器人同时进入 P0，都会让 72 小时的故障面失控。

## 二、AI 应用、模型与智能体

### Dify

**它是什么**

Dify 是开源 AI 应用平台，提供 Agent、Chatflow / Workflow、知识库与 RAG、结构化变量、工具调用、日志监控、REST API、MCP Server 和插件市场。可以使用云端 Sandbox，也可以通过 Docker Compose 自托管。

**智课工坊可用位置**

- 快速做“课程材料 → 检索 → 结构化生成”的可视化编排；
- 把教师审核前后的状态作为明确节点；
- 用 API 把已批准结果交给学生端。

**启动门槛与风险**

- 云端路径仍需要账号、模型供应商 Key 和网络；
- 自托管会增加 Docker、存储、升级和插件兼容的工作；
- 主仓库使用带附加条件的 Dify Open Source License，采用前需按实际用途复核，而不是笼统写成 Apache-2.0；
- 若产品只需两三个确定步骤，现场直接写一条小型业务链可能比搭平台更短。

**判断**

当前是 AdventureX 2026“赛事技术 / 设备支持方”，适合作为可选编排层；只有现场资源、账号与模型接入在前 2 小时验证成功时才进入 P0。官方资料：[中文文档](https://docs.dify.ai/zh/home)、[官方仓库](https://github.com/langgenius/dify)。

### MiniMax Agent 与开放平台

**它是什么**

MiniMax 提供通用模型、长上下文与多模态 API，以及语音、视频、音乐和 Agent 产品。RTF 的两个入口分别指向交互式 Agent 页面和开放平台动态文档。

**智课工坊可用位置**

- 长课件理解与结构化生成；
- 语音、视频或多模态内容生产；
- 用 Agent 执行材料整理任务。

**启动门槛与风险**

- API Key、Credit、区域与速率限制必须现场确认；
- 动态页面无法证明某个具体模型或额度会在 AdventureX 提供；
- AdventureX 当前合作方网格没有列 MiniMax，官网故事区的 Sponsor 标签属于历史信号。

**判断**

作为模型候选保留，不作为“免费赞助资源”写入主路径。若当届现场另行提供 MiniMax 权益，再与阶跃星辰等当前赞助模型按同一测试集比较。官方入口：[MiniMax](https://www.minimax.io)、[开放平台](https://platform.minimaxi.com/)。

### CAMEL-AI

**它是什么**

CAMEL 是 Python 多智能体框架，提供角色扮演、Agent、工具、Workforce、Society、模型后端、RAG 和 MCP 集成。RTF 指向的是多智能体社会示例，而不是通用快速开始。

**启动门槛与风险**

- 当前安装范围为 Python 3.10–3.14；完整 extras 会显著增加依赖；
- 示例仍需外部模型 API Key；
- 多 Agent 会放大延迟、Token 成本、调试难度和结果不可重复性；
- “多个 Agent 在讨论”本身不是智课工坊的用户价值。

**判断**

不进入 P0。只有当团队能证明一个角色分工确实改善“来源核对或教师审核”，且单 Agent 基线不足时，才作为 P1 实验。官方资料：[Agents Society](https://docs.camel-ai.org/cookbooks/multi_agent_society/agents_society)、[安装文档](https://docs.camel-ai.org/get_started/installation)。

### ModelScope 与两段 LoRA 视频

**它是什么**

ModelScope 是模型、数据集与 AI 应用生态，覆盖模型发现、推理、训练、评测和 Studio。核心 Python 库使用 Apache-2.0，但每个模型、数据集和应用仍有自己的许可证。Studio 可使用 Gradio、Streamlit、静态站点或 Docker。

RTF 的课程页主题是 AIGC 专业生图；两段 B 站视频由 ModelScope 官方账号发布，分别讲零代码 LoRA 训练与作品创作。它们是学习材料，不是项目官方 API 文档。

**智课工坊可用位置**

- 现场查找合适的 OCR、ASR、VLM 或生成模型；
- 若云端 API 不可用，评估能否用已有硬件运行小模型；
- 用 Studio 快速承载技术实验。

**启动门槛与风险**

- 模型下载、显存、推理框架和许可证差异很大；
- 训练 LoRA 会消耗数据准备、版权核验与 GPU 时间；
- “课程内容生成”不需要为了展示而临时训练图像风格模型。

**判断**

模型检索与回退候选为 P1；LoRA 训练和本地大模型部署不进入 P0。只在精确模型、许可证、算力和启动时间都确认后下载。官方资料：[ModelScope 文档](https://www.modelscope.cn/docs)、[核心仓库](https://github.com/modelscope/modelscope)。

### PPIO

**它是什么**

PPIO 提供模型 API、视觉语言模型、OCR、推理、结构化输出、函数调用、GPU 容器和 Agent Sandbox，并提供兼容常见 SDK 的调用方式。

**启动门槛与风险**

公开上手流程包含注册、实名认证、充值和创建 API Key。即使接口兼容，也不能推断 AdventureX 会提供免费额度。

**判断**

适合做“可替换模型网关”的候选，不作为当前 P0 资源假设。只有现场信用额度、模型、限流和数据条款均通过时启用。官方资料：[模型 API 快速开始](https://ppio.com/docs/model/get-start)。

## 三、开发环境

### CloudStudio

CloudStudio 是浏览器云开发环境，支持项目模板、终端、Git、协作、CPU / GPU 环境和自定义 Dockerfile，可从多个 Git 服务导入仓库。它适合在本机环境损坏或团队需要一致环境时充当回退。

风险在于账号、网络、计算时长、休眠与环境保留策略。它不应成为产品运行依赖，也不应与本地 Codex、Qoder、ClackyAI 等多个 AI 开发环境同时迁移。官方资料：[为什么使用 CloudStudio](https://cloudstudio.net/docs/guide/quick_start/developer/why-use-cloudstudio/)、[模板说明](https://cloudstudio.net/docs/guide/product_use/template/what-is-template/)。

### ClackyAI（RTF 有名称但无链接）

ClackyAI 是云端 AI 开发环境，提供多语言运行环境、数据库、Issue 到 PR 和远程 IDE 接入。公开套餐与试用额度随时可能变化，且依赖账号和网络。

判断：只保留为 CDE 回退，不与 CloudStudio 和 Qoder同时迁移。官方入口：[ClackyAI](https://clacky.ai/)。

## 四、实时语音、视频与课堂连接

### TEN Framework

**它是什么**

TEN 是实时多模态对话框架，覆盖低延迟语音助手、RTC / WebSocket、VAD、轮次检测、说话人处理、转写、口型同步和嵌入式设备接入。

**默认快速开始的实际成本**

官方示例通常要求 Agora、OpenAI、Deepgram、ElevenLabs 等多套账号或 Key，还需要 Docker / Compose、Node.js 18，以及至少约 2 CPU / 4 GB 的环境。仓库构建和服务启动并不是“一键零依赖”。

**判断**

若作品核心就是实时口语助教，且现场已有全部凭证，TEN 有明显价值；否则多个外部服务会使它成为高风险 P1。采用前还要复核仓库根目录附加条款与子包 Apache-2.0 的边界。官方资料：[TEN Framework](https://github.com/TEN-framework/ten-framework)。

### Agora

Agora 提供实时音视频、屏幕共享、白板、录制、实时转写和翻译，覆盖 Web、移动端、桌面、Flutter、React Native、Unity 与 Unreal。它直接适合远程课堂或多人实时辅导。

实际启动需要 App ID、Token 机制、网络和用量计划；公开免费额度不能等同于赛事赞助额度。若现场 Demo 只在一个展位本地运行，RTC 会增加不必要的网络故障点。

判断：远程协作是核心时进入 P1；本地单机 Demo 不采用。官方资料：[Video Calling](https://www.agora.io/en/products/video-call/)、[定价页](https://www.agora.io/en/pricing/)。

## 五、区块链

### Injective

Injective 是面向金融应用的可互操作 L1，支持原生模块、链上订单簿、跨链、CosmWasm 与 EVM 方向的开发能力。AdventureX 2026 明确将其列为“独家区块链技术伙伴”。

对智课工坊，只有以下问题成立时才值得接入：

- 学习凭证或审核记录必须由多个不互信主体共同验证；
- 用户确实需要可公开验证、不可由单一学校修改的证明；
- 链上隐私、撤销、成本和未成年人数据边界能被清楚解释。

如果只是把普通数据库哈希写上链，会削弱产品叙事。官方技术依据应使用 [Injective Docs](https://docs.injective.network)；RTF 的 [HackQuest 学习路径](https://www.hackquest.io/zh-cn/learning-track/Injective)只作为二级教程。

### XION

XION 通过 Meta Accounts、邮箱 / 社交登录、Passkey、免 Gas 交互与 Treasury 合约降低普通用户使用链上应用的门槛，并提供 React Native / Expo 集成。

它适合需要消费者友好链上身份或证明的移动应用，但当前不是 AdventureX 官网列出的合作方；同时使用 XION 与 Injective 会产生两套账户和合约体系。

判断：不进入本届 P0。若核心命题最终转为链上身份，再在两个生态中二选一。官方资料：[XION Quick Start](https://docs.burnt.com/xion/developers/computation/xion-quick-start)、[Mobile App](https://docs.burnt.com/xion/developers/accounts/mobile-app)。

## 六、Apple、XR 与端侧模型

RTF 的五段 Apple 视频形成了一条完整但门槛较高的路线：

| 官方视频 | 能力 | 智课工坊可能用途 | 主要门槛 |
|---|---|---|---|
| [Vision 姿态识别](https://developer.apple.com/cn/videos/play/wwdc2020/10653/) | 人体与手部关键点，可处理相机或图像，支持端侧 | 手势作答、课堂互动 | 遮挡、距离与性能需实测 |
| [Core ML 模型优化](https://developer.apple.com/cn/videos/play/wwdc2024/10159) | 转换、量化、压缩、状态模型与注意力优化 | 离线 OCR / VLM / 小模型 | 模型移植本身可能吃掉大量时间 |
| [SwiftUI + RealityKit](https://developer.apple.com/cn/videos/play/wwdc2025/274) | 空间 UI、Model3D、RealityView 与交互 | 立体课程和空间学习对象 | visionOS、Xcode、Swift 技能 |
| [Foundation Models](https://developer.apple.com/cn/videos/play/wwdc2025/286) | Apple 端侧模型、工具调用与引导式生成 | 隐私优先的离线生成 | 兼容设备、系统版本未知 |
| [visionOS 悬停交互](https://developer.apple.com/cn/videos/play/wwdc2025/303) | Hover 效果与空间反馈 | 增强可发现性 | 只属于交互润色，不是产品核心 |

FAQ 确认硬件实验室会提供 Vision Pro 类设备，但未说明型号、系统、数量、开发者模式或借用时长；Apple 也不在当前合作方网格。判断：仅作为现场设备和团队技能都满足后的 P1。若 PICO 赞助资源更确定，必须在 PICO 与 visionOS 中二选一。

## 七、机器人、IoT 与物理交互

### D-Robotics

D-Robotics 是当前首席赞助商。RDK X5 / MagicBox / S100 系列、RDK OS、TROS / ROS 2、Model Zoo、NodeHub 和 RDK Studio 可覆盖端侧视觉、语音、传感器、事件生成与物理反馈。

对智课工坊最合适的闭环是“一个感知事件 → 一个带来源记录 → 一次教师审核 → 一次学生反馈”，而不是同时做底盘、SLAM、机械臂与课程生成。精确板型仍未知，所有镜像、HBM 模型和配件必须等现场确认。详见 [D-Robotics 档案](vendors/d-robotics.md)。

### TuyaOpen

TuyaOpen 是跨平台 C / C++ AIoT 开发框架，覆盖 Tuya 芯片、ESP32、Linux / Raspberry Pi 等平台，并提供网络、MQTT / HTTP / WebSocket、音频、ASR / KWS / TTS / STT、LLM 接入、远程控制、监控与 OTA 等能力。

每台设备仍需要相应云端与 AI 授权；免费开发授权不等于赛事设备必然已激活。它适合做低功耗语音终端、按钮 / 灯光反馈或教室 IoT 节点，不适合与 D-Robotics 同时承担同一感知职责。

判断：当前首席赞助商，高潜力 Secondary；精确板卡、外设、授权码和网络确认后可升级为 Primary 的设备层。RTF 的[英文页](https://tuyaopen.ai/docs/about-tuyaopen)与[中文页](https://www.tuyaopen.ai/zh/docs/about-tuyaopen)应视为同一个技术栈。

### Seeed LeRobot SO-ARM100/101

主教程覆盖机械臂装配、舵机、校准、主从遥操作、数据采集和模仿学习；Isaac Sim 教程还限定 Isaac Sim 4.2、ROS 2 与特定代码分支。两条路线都依赖精确硬件、Ubuntu / Python / Torch 环境和大量校准时间。

判断：只有现场提供完全匹配、已装配且可用的机械臂及工作站时才进入 P1。不要在未知机械臂上预下载仿真器或训练栈。资料：[SO-ARM100/101](https://wiki.seeedstudio.com/lerobot_so100m/)、[Isaac Sim 4.2](https://wiki.seeedstudio.com/lerobot_so100m_isaacsim/)。

### Nothing Glyph Matrix

官方开发包通过 Android AAR 让应用控制 Glyph Matrix。当前仓库区分不同 Nothing 手机在矩阵尺寸、触摸与玩具类型上的能力，且要求匹配系统版本与 Manifest 权限。

FAQ 明确 Nothing 手机可从硬件实验室租用，但具体机型未知。它很适合把“审核通过、学生作答、进度状态”变成一眼可见的灯阵反馈，集成面比机器人更小。

判断：高辨识度、低业务侵入的 Secondary；现场确认手机型号、系统、Android Studio 与 AAR 许可证后再用。官方资料：[GlyphMatrix Developer Kit](https://github.com/Nothing-Developer-Programme/GlyphMatrix-Developer-Kit)。

## 八、RTF 中无链接但值得纠偏的项目

### Amazon Q Developer

AWS 是 AdventureX 2026 首席赞助商，但“AWS 是赞助方”不能推出“新用户应选择 Amazon Q Developer”。AWS 已在 2026-04-30 公告 Q Developer 的 IDE 插件与订阅进入终止支持流程：新注册将在 2026-05-15 后被阻止，IDE 插件与付费订阅计划于 2027-04-30 结束支持，并建议迁移到 Kiro。Q in AWS Console 不在同一终止范围。

结论：不得把 Amazon Q 作为新团队的现场前置条件。官方公告：[Amazon Q Developer end-of-support](https://aws.amazon.com/blogs/devops/amazon-q-developer-end-of-support-announcement/)。

### Android Studio

若使用 Nothing 或 Android 端，需要正式开赛后再安装或确认现有环境。带模拟器的 Windows 环境明显更吃内存，优先使用现场实体手机降低负担。官方要求：[Install Android Studio](https://developer.android.com/studio/install)。

### 飞书多维表格

飞书是当前首席赞助商。多维表格可承载 source ID、页码 / 时间戳、生成对象、审核状态、审核人和变更记录，也有开放 API。但应用权限、Tenant / User Token、文档授权和限流都要现场验证。

结论：适合做可视化审核台或运营回退；若权限配置耗时，P0 使用本地数据库，飞书作为 Secondary。

### Unity、Unreal、OpenXR 与 PolySpatial

这些是 XR 开发路径而非独立产品选型。PICO 更适合 Unity / Unreal / OpenXR；Vision Pro 更适合 SwiftUI / RealityKit / 原生 visionOS。团队应按现场设备与已有技能只选一条，不建立双端 XR P0。

## 九、统一采用原则

- 官方赛事身份、官方技术文档、二级教程分别记证据，不能互相替代；
- 同一能力只保留一个主供应商，另设一个明确回退；
- 任何需要三套以上新账号 / Key 的链路，默认不得进入 P0；
- 任何模型、数据集、AAR、仓库或示例，均逐项检查许可证；
- 当前只保留 URL 和判断，不下载可执行内容；
- 精确资源未知时不打伪精确分数，只给适配层级与硬门槛状态。

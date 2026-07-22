# 地瓜机器人 D-Robotics / RDK 技术栈档案

> 核验日期：2026-07-18。状态：高潜力候选，但因 AdventureX 现场具体板型、配件、数量和领用方式尚未确认，暂不进入正式横向排名。
> 项目层级：`jiaowu2K26` 是总项目；本档案先评估 RDK 对智课工坊 P0 的价值，也可在后续扩展到 Campus Life 等模块。

## 一、初步判断

地瓜机器人适合成为 jiaowu2K26 的“端侧感知与具身互动层”，P0 可先服务智课工坊；不适合为了使用赞助硬件而把项目强行改造成复杂移动机器人。

最有价值的角色是：

1. 摄像头、麦克风和传感器采集真实课堂事件；
2. 在板端执行视觉、语音或多模态推理；
3. 给事件附加时间戳、帧号和 source ID；
4. 把结构化证据送到教师审核界面；
5. 用语音、灯光、按钮、手势或舵机完成学生互动反馈。

目标链路：

`RDK 感知 → 板端推理 → 可追溯事件 → 教师审核 → 已批准内容 → 学生互动反馈`

## 二、赞助与现场信息

### 已确认

- AdventureX 2026 官网把“地瓜机器人”列在首席赞助商中；
- AdventureX 官网说明现场将免费提供计算资源、AI Credit、硬件设备和 3D 打印机；
- 用户已向技术人员确认，嵌入式竞赛使用的技术栈可以在 AdventureX 中复用；
- 两份 2026 嵌赛资料把 RDK、TROS、NodeHub、RDK Studio、RoboGo 和 Model Zoo 作为主要资源入口。

### 尚未确认

- 现场提供 RDK X5、RDK X5 MagicBox、S100/S100P，还是其他型号；
- 每队数量、内存版本、系统版本和是否预烧录；
- 是否随附相机、IMU、麦克风、扬声器、电源、TF 卡、线材和结构件；
- 领取、预约、归还、损坏责任和故障换机方式；
- 是否有独立赞助赛道、强制能力、评分标准或提交格式；
- 官方示例、Model Zoo 模型和 NodeHub 项目在“现场从零构建”规则下的允许边界。

## 三、生态分层

| 层级 | 主要资源 | 作用 |
|---|---|---|
| 硬件 | RDK X3 / X5 / S100、MagicBox、摄像头、IMU | 端侧计算、感知和物理交互 |
| 系统 | RDK OS、Ubuntu 22.04 | 板端 Linux 环境 |
| 中间件 | TogetheROS.Bot / ROS 2 | 节点、话题、服务、传感器和控制 |
| 加速组件 | `hobot_sensor`、`hobot_dnn`、`hobot_codec`、`hobot_cv`、`hobot_render`、zero-copy | 采集、BPU 推理、编解码、CV 与展示 |
| 算法 | Model Zoo、Boxs、Apps | 检测、分割、手势、人体、深度、语音、SLAM、导航等 |
| 快速集成 | NodeHub | 查找、组合和分享机器人节点与案例 |
| 桌面开发 | RDK Studio | 烧录、Type-C/SSH、终端、文件、远程桌面、诊断和板端 Agent |
| 云端流程 | RoboGo | 数据、训练、量化、部署等云端流程 |

## 四、硬件候选

| 候选 | 已知能力 | 对智课工坊的意义 | 主要风险 |
|---|---|---|---|
| RDK X5 | 8×A55、4/8GB、10 TOPS BPU、双 MIPI、4×USB 3.0、千兆网、Wi-Fi 6、CAN FD、GPIO | 足以承担相机、手势、目标检测、语音和轻量互动 | 仍需外接感知与反馈配件 |
| RDK X5 MagicBox | X5 8GB，集成双目相机/IMU、麦克风、扬声器、舵机、灯光和按钮 | 最适合快速做“可看、可听、可反馈”的桌面具身助教 | 是否在赞助清单中未知 |
| RDK S100 | A78AE + R52 实时 MCU、12GB、80 TOPS | 可承担更重的多模态与实时控制 | 功耗、工具链、模型转换和调试复杂度更高 |
| RDK S100P | 24GB、128 TOPS | 更强板端模型能力 | 可能远超 P0 所需，增加集成面 |

在具体 SKU 未确认前，不选择系统镜像、HBM 模型或配件驱动。

## 五、可复用边界

### 可以迁移

- ROS 2/TROS 的节点、话题、服务和消息设计；
- Python/C++ 业务逻辑和 Web API；
- 传感器 → 推理 → 事件 → 审核的数据流；
- source ID、时间戳、帧号、审核状态等数据合同；
- 官方文档、开源仓库和案例的学习经验；
- RDK Studio 的设备连接与调试流程。

### 必须按现场环境重验

- RDK OS、TROS、驱动和依赖版本；
- 摄像头、麦克风、串口、CAN、GPIO 和 MIPI 接入；
- 相机内外参、传感器标定和设备节点；
- 网络、账号、云端配额、功耗、散热和启动时间；
- 模型性能、端到端延迟和稳定性。

### 不能跨板型直接复用

- `.hbm` 模型产物；
- 系统镜像、驱动、设备树和板级配置；
- GPIO/CAN/MIPI 引脚配置；
- 针对某一板型的量化参数和性能结论。

官方文档明确说明 X3、X5 和 S100 的 HBM 模型不能互换。

## 六、智课工坊适配方案

### Primary 候选：桌面式可追溯具身助教

只做一条现场可验证闭环：

1. 摄像头或麦克风捕获一个教师事件；
2. 板端完成一次手势、目标或语音识别；
3. 保存时间戳、帧图或文本片段作为来源；
4. 教师在审核页通过或移除；
5. 学生通过手势、语音或按钮作答；
6. 设备用灯光或语音给出反馈。

### P1 候选

- 双目深度或空间定位；
- 多人手势/人体检测；
- 板端 OCR、ASR 或小型 VLM；
- 把来源事件与 PPT 页码或课程时间轴对齐；
- NodeHub 案例与智课工坊数据合同组合。

### 不建议作为 P0

- 同时做移动底盘、SLAM、机械臂和课程生成；
- 为追求参数而临时迁移到 S100 大模型工具链；
- 把 RDK Studio、NodeHub 或官方 Demo 本身当成产品价值；
- 在未确认硬件前提前下载多套镜像和 HBM 模型。

## 七、开赛后前 6 小时验证顺序

1. 拍照记录精确 SKU、配件、系统版本和领用条件；
2. 确认供电、Type-C/SSH、网络、摄像头和音频设备；
3. 跑一个与板型匹配的最小官方感知示例；
4. 把一个推理结果转换成智课工坊的 source event；
5. 记录成功、耗时、失败点和回退方案，再决定是否进入 P0。

## 八、证据来源

### 用户提供资料

- `D:\10451\Desktop\地瓜\嵌入式竞赛地瓜机器人赛道资料.pdf`
- `D:\10451\Desktop\地瓜\嵌赛资料包.pdf`

> 新环境可用性核对（2026-07-21）：上述两个原始路径当前不存在，项目内也没有复制 PDF。本文保留此前阅读形成的摘要，但在原件重新挂载或重新提供前，不应把仅来自 PDF 的细节当成可现场复核证据；硬件与 SDK 判断优先回到下方官方来源。

### 官方来源

- [AdventureX 2026 官网](https://adventure-x.org/zh)
- [D-Robotics 资料中心](https://developer.d-robotics.cc/rdk_doc_center/)
- [RDK X5 产品页](https://developer.d-robotics.cc/rdkx5)
- [RDK S100 产品介绍](https://developer.d-robotics.cc/rdk_doc/rdk_s/Quick_start/hardware_introduction/rdk_s100/)
- [TogetheROS.Bot 文档](https://developer.d-robotics.cc/tros_doc/tros)
- [RDK Studio 文档](https://developer.d-robotics.cc/rdk_studio_doc/product-intro/overview)
- [RDK Studio 支持硬件与 HBM 边界](https://developer.d-robotics.cc/rdk_studio_doc/product-intro/supported-hardware)
- [RDK Model Zoo](https://github.com/D-Robotics/rdk_model_zoo)
- [RDK 配件文档](https://developer.d-robotics.cc/accessories_doc/accessories)
- [NodeHub](https://developer.d-robotics.cc/nodehub)

## 九、当前结论

- 核心适配：`pass`；
- 生态成熟度：证据为 `Medium`；
- AdventureX 具体资源可得性：`unknown`；
- 精确板型与配件：`unknown`；
- P0 排名资格：暂缓，等待官方赞助清单。

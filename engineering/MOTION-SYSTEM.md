# 大学2K26 / University2K26 · 游戏动效与反馈系统 / Motion System

> **状态：** `v0.2 implemented baseline`；V0.9 正式体验壳已实现首轮有限动效编排，声音、触觉、物理手柄和逐帧性能仍待后续 Gate。
> **适用范围：** React Experience Shell、未来 WinUI/Tauri 壳，以及通过独立 Gate 后才可能出现的 Unreal Companion。
> **核心决定：** 先用平台无关的状态与语义动作定义“发生了什么”，再由各客户端表现“怎样动”；动画不得拥有业务状态。
> **更新时间：** 2026-07-23

---

## 1. 一眼结论

当前首页已经具备清楚的信息层级、原创 Campus Arena、可见焦点、Evidence Drawer、加载/离线/错误状态和减少动效路径。V0.9 又补齐了分层入场、导航错峰、目标链路、一次性扫光、Box Score 数字增长、课程卡片发牌、课程分析切换与轻量指针视差；它已经形成可验证的游戏化反馈基线，但还不是完整的声音、触觉与 Replay 系统。

缺口不在于粒子不够多，而在于一次操作尚未稳定形成：

```text
意图 → 即时确认 → 承诺动作 → 因果变化 → 可回放结果 → 下一步
```

因此 P0 不迁移 Unreal，也不堆全屏特效。先让一个纵向闭环具有可中断、可解释、可降级的因果反馈；只有 Web 主路径和 Motion Contract 稳定后，才评估 Unreal 的 Campus Arena Companion。

## 2. 当前原型审计

证据范围：历史模板 `app/prototypes/p0-00-d0-homepage/`，以及正式体验壳 `app/apps/web/` 的源码、Vitest、生产构建、Browser QA 和保存截图。

| 面向 | 当前证据 | 结论 |
|---|---|---|
| 画面层级 | 学生英雄位、赛季、Fixture、一个主目标、Evidence 与底部输入提示可见 | **可用基线** |
| 状态覆盖 | default / loading / success / offline / recoverable error / traditional / reduced motion | **范围正确** |
| 输入 | 键盘语义动作与标准 Gamepad API 轮询路径存在 | **代码路径存在；物理双手柄未验证** |
| 动效 | 统一 motion tokens、0—960ms 分层入场、一次性扫光、数字增长、抽屉/toast/结果与课程切换 | **有限编排已实现；声音、触觉与持久 Replay 待补** |
| 可访问性 | 语义控件、焦点恢复、`prefers-reduced-motion` | **基线存在；仍需真人与辅助技术验证** |
| 性能 | Vite 构建、多个视口、动画关键帧截图与 Reduced Motion 快速稳定证据 | **构建/布局/时序通过；尚无逐帧运行时 profile** |

本轮不把静态截图冒充动画验证，也不把 Gamepad API 代码冒充实体手柄通过。运行时帧时间、声音、触觉、输入到显示延迟和中途打断仍是后续 Gate。

## 3. “AAA 级”在本项目中的含义

AAA 不是“到处飞入、发光和震动”，而是以下六项同时成立：

1. **清楚：** 3 秒知道当前目标，10 秒知道下一步及后果。
2. **有因果：** 用户输入后，界面立刻承认意图，并能看出状态为何改变。
3. **可控：** 进入、退出、跳过、反悔、中断和错误恢复都有定义。
4. **有连续世界：** 操作结果留在赛季、Replay、Box Score 或下一步中，而不是 toast 消失后一切复原。
5. **多通道但不依赖单通道：** 视觉、文字、声音、触觉可以互相增强，任何一个关闭后仍能完成任务。
6. **稳定：** 目标设备帧率稳定；不以偶发华丽换持续卡顿。

EA/Maxis 的公开 GDC 工程材料说明 HTML/CSS/JavaScript 也能承担高质量游戏 UI；Unreal 的 CommonUI、UMG 和 Motion Design 更适合复杂输入路由、分层菜单与演播级 2D/3D 图形。引擎选择不是游戏感的充分条件。

## 4. 六层反馈模型

| 层 | 责任 | P0 允许 | 禁止 |
|---|---|---|---|
| World | 环境呼吸、时间/赛季氛围 | 极低频灯光、数据带、轻微景深变化 | 永久在线粒子雨、抢正文对比度 |
| Composition | 镜头与构图关注点 | 玩家发起后的轻微推近/重构 | 鼠标移动即大幅视差、眩晕式摇镜 |
| HUD | 焦点、导航、层级、输入提示 | 确定性焦点图、区域切换、状态词 | 只靠边框变色、焦点瞬移无来源 |
| Action | 输入到提交的因果链 | 预备、确认、提交、解析 | 单击即不可逆、高风险动作一键完成 |
| Result | 结果、Replay、下一步 | Box Score、证据、状态持久化 | 只有“成功”toast、无后续位置 |
| Sensory | 音效与触觉 | 可选短提示、字幕/视觉等价 | 声音/震动成为唯一错误或成功提示 |

## 5. 统一交互状态机

每个可操作对象采用同一状态语法：

```text
idle
  → focused
  → armed
  → committed
  → resolving
  → success | recoverable_error | blocked
  → replay
  → next_move
```

- `focused`：只表示“当前会操作谁”，不能提前改变业务数据。
- `armed`：显示动作、后果和权限；高风险动作必须停在这里等待独立确认。
- `committed`：请求已形成，显示取消或不可取消边界。
- `resolving`：超过 400ms 显示进行中；超过 2s 给出阶段或可取消选项，不能无限 spinner。
- `success`：同时写明新状态、依据/回执和下一步。
- `recoverable_error`：保留用户输入，提供重试、回退或人工接管。
- `blocked`：说明阻断规则、责任方和可申诉/纠正路径。
- `replay`：把前后状态、原因、来源和时间写入 Evidence Pack。

客户端动画只订阅这些状态，不自行猜测“成功”或提前播放结算。

## 6. 时间、缓动与中断 Token

以下是项目 Token，不是对所有用户的生理定律；真人测试或性能证据可调整，但模块不得私改。

| Token | 目标时长 | 用途 |
|---|---:|---|
| `--motion-ack` | 0–50ms | 按下、焦点收到、输入已被系统接收 |
| `--motion-focus` | 100–160ms | 焦点光、文字和输入提示同步迁移 |
| `--motion-micro` | 160–240ms | 图标、Badge、小状态变化 |
| `--motion-panel` | 220–320ms | Drawer、面板和同层内容切换 |
| `--motion-scene` | 320–500ms | 玩家主动触发的场景重构 |
| `--motion-result` | 500–800ms | 状态结算与 Box Score 落位 |
| `--motion-celebration` | 800–1500ms | 稀有里程碑；必须可跳过 |

```css
--ease-standard: cubic-bezier(.2, 0, 0, 1);
--ease-enter: cubic-bezier(0, 0, .2, 1);
--ease-exit: cubic-bezier(.4, 0, 1, 1);
--ease-emphasis: cubic-bezier(.2, .8, .2, 1);
```

### 中断规则

- 每个转场必须声明 `interrupt`：`reverse`、`snap_to_end`、`cancel_and_restore` 或 `not_interruptible_with_reason`。
- 返回操作优先关闭当前层，并把焦点送回触发点。
- 新状态到达时取消过时动画；不能排队播放已经失真的旧结果。
- 大于 1 秒的非必要动效提供跳过；任何循环环境动效可暂停。
- 不使用超过每秒 3 次的闪烁。

## 7. 三条 P0 编排

### 7.1 首页主行动

```text
focused
→ 0–50ms 按压/音调确认
→ armed：显示“继续今日赛程”及会进入的内容
→ committed：CTA 收束为进度轨，背景只轻推近
→ resolving：显示真实阶段，不伪造百分比
→ success：当前阶段、Box Score 与 Next Move 同时落位
→ replay：可展开来源、版本、时间与前后状态
```

若请求失败，镜头和布局回到可操作状态，输入不丢失；错误区域获得焦点，CTA 变为“重试”而不是继续播放成功动效。

### 7.2 Evidence Drawer

- `details` 触发后 50ms 内改变按钮/标题状态。
- Drawer 在 220–320ms 内进入；背景不平移，只降注意力。
- 焦点陷阱只覆盖 Drawer；关闭后回到原始触发点。
- Reduced Motion 使用即时显隐和边界变化，不使用横向滑入。

### 7.3 课堂手柄回答 / Arena Response（非当前 P0 承诺）

- 教师发出题目后，学生可用手柄完成 `选择 → 置信度 → 提交`；D-pad/摇杆不能承担文字输入。
- South 提交、East 返回、D-pad 选择；扳机可在实验中表达“置信度”，但必须有键盘/触控等价路径。
- 多人抢答只显示“已收到/轮到你”，不公开羞辱慢者或把反应速度当学术能力。
- 每次回答结束进入“为什么 → 正式定义/证据 → Replay”，不能退化成只抢按钮。
- 触觉仅作私密确认，默认可关闭；教师端不能根据设备 ID 建立行为画像。

## 8. 声音、触觉与注意力预算

- 每个动作最多一个主声音；导航不逐项轰炸。
- 成功、警告、错误具有不同节奏，但都必须有文字/图形等价。
- 声音按 `UI / ambience / voice` 分轨，提供总静音与字幕。
- 触觉采用短、稀疏、能力检测；错误不使用长时间惩罚性震动。
- 同一时刻只有一个高优先级动画中心；背景、HUD、toast 不争抢。
- 专注学习时暂停非必要通知、成就和环境高潮。

## 9. 可访问性与舒适模式

| 模式 | 运动表现 | 信息完整度 |
|---|---|---:|
| Immersive | 完整短转场、可选环境/声音/触觉 | 100% |
| Light | 减少镜头与庆祝，保留状态转场 | 100% |
| Traditional | 正式术语优先，保留清楚反馈 | 100% |
| Reduced Motion | 无位移/缩放/视差；使用显隐、边界、文字与状态替代 | 100% |

必须同时满足：

- 尊重操作系统 `prefers-reduced-motion`，并允许产品内覆盖为更少动效。
- 自动运动与正文并行超过 5 秒时提供暂停/停止/隐藏。
- 不用动画、音调、触觉或颜色作为唯一状态。
- 支持键盘、触屏、读屏和 controller-first 的等价任务路径。
- 任何动作引发晕动、分心或注意力困难时，用户可以保持任务上下文直接降级，而不是重开流程。

## 10. 性能预算与实现原则

- 目标设备以稳定 60fps 为 P0 目标，即每帧约 16.7ms；低性能模式允许稳定 30fps，但不能在两者之间剧烈抖动。
- 优先动画 `transform` 与 `opacity`；避免大面积持续 blur、阴影和触发布局的属性动画。
- 复杂页面采用事件驱动状态，不用每帧 UI binding 轮询业务数据。
- 首次显示、Drawer、主行动和错误恢复分别做 Performance trace；记录长任务、掉帧和资源峰值。
- 环境循环在页面隐藏、失焦、Reduced Motion 或省电模式时暂停。
- 资产按使用尺寸输出，保留静态/低分辨率回退。

P0 的 React 实现先使用 CSS 与 Web Animations API；只有编排复杂度和复用证据证明必要时才引入 Motion 库，并在 `DEPENDENCIES.md` 登记。不得为了“像游戏”先增加运行时引擎。

## 11. Web、WinUI 与 Unreal 的责任边界

| 表面 | 负责 | 不负责 |
|---|---|---|
| React Web/PWA | P0 数据界面、跨端壳、状态机映射、可访问与离线 | 运行时 3D 校园世界 |
| WinUI/Tauri adapter | Windows 窗口、通知、特定设备能力 | 第二套领域状态与视觉语言 |
| Unreal Companion | 通过 Gate 后的 Campus Arena、演播级 2D/3D、空间转场 | 权威数据、审核规则、教务表单主路径 |

Unreal 若进入后续阶段，优先使用 CommonUI 管理输入与焦点、UMG 承载界面、Motion Design/Sequencer/Niagara 承载空间演播效果；它只能消费同一 `SemanticAction`、API 与状态机。

## 12. P0-00-D0 验收脚本

用户审核时按顺序执行：

1. 首屏停留 3 秒，说出当前角色、赛季和主目标。
2. 只用方向键/手柄移动焦点，确认焦点、背景关注点和输入提示同步。
3. 打开并关闭 Evidence Drawer，确认返回原焦点。
4. 执行主行动，观察 `ack → resolving → result → replay → next move`。
5. 在 resolving 中尝试返回/取消，验证中断规则。
6. 模拟离线和错误，确认没有成功庆祝、数据不丢、可重试。
7. 切 Reduced Motion、静音和传统模式，重复 2–6。
8. 记录 60fps trace、键盘结果；实体 Xbox/PlayStation 布局各做一次后才能宣称手柄通过。

硬失败：

- 输入后超过 100ms 仍没有任何可见确认；
- 动效结束后看不出业务状态是否改变；
- 错误状态播放成功反馈；
- Reduced Motion 丢信息或无法完成任务；
- 不可逆动作被单次通用确认直接执行；
- 主要内容被动画遮挡或频繁掉帧。

## 13. 依据

- 项目内：[Design System](DESIGN-SYSTEM.md)、[Architecture](ARCHITECTURE.md)、[Human Factors](../product/HUMAN-FACTORS.md)、[Quality Gate](../gates/QUALITY.md)；原型审计证据位于 `app/prototypes/p0-00-d0-homepage/design-qa.md`（该实验目录不投影进文档站）。
- [Epic CommonUI 设计指南](https://dev.epicgames.com/documentation/unreal-engine/design-guidelines-for-using-commonui-in-unreal-engine)
- [Epic Motion Design Quick Start](https://dev.epicgames.com/documentation/en-us/unreal-engine/motion-design-quickstart-guide-in-unreal-engine)
- [Epic UMG Best Practices](https://dev.epicgames.com/documentation/en-us/unreal-engine/umg-best-practices-in-unreal-engine)
- [Epic 性能分析与配置](https://dev.epicgames.com/documentation/unreal-engine/introduction-to-performance-profiling-and-configuration-in-unreal-engine)
- [Microsoft Xbox Accessibility Guidelines](https://learn.microsoft.com/en-us/gaming/accessibility/guidelines)
- [W3C WCAG 2.2 · Animation from Interactions](https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions)
- [W3C WCAG 2.2 · Pause, Stop, Hide](https://www.w3.org/WAI/WCAG22/Understanding/pause-stop-hide.html)
- [W3C WCAG 2.2 · Three Flashes](https://www.w3.org/WAI/WCAG22/Understanding/three-flashes-or-below-threshold.html)
- [MDN · Animation performance and frame rate](https://developer.mozilla.org/en-US/docs/Web/Performance/Guides/Animation_performance_and_frame_rate)
- [EA/Maxis GDC 2015 · How to Implement AAA Game UI in HTML and JavaScript](https://media.gdcvault.com/gdc2015/presentations/Chin_YeeCheng_HowToImplement.pdf)
- [DICE LA GDC · Art Direction for AAA UI](https://gdcvault.com/play/1025498/Art-Direction-for-AAA)

外部资料复核日期：2026-07-23。

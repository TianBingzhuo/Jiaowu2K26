# 变更记录

本文件记录影响接手、事实源或协作方式的项目级变化。它不是产品发布记录；具体模块进度仍以 `modules/*/STATUS.md` 和 `PROJECT-MANIFEST.json.current_work` 为准。

## Unreleased

### Added

- AdventureX 正式开工后的公开 GitHub 主仓、单一 P0-00 Issue 与弹性能力池协作模型。
- 本地 Starlight 文档中心、离线全文搜索和只读内容投影。
- Windows 一键配置、健康检查、安全 Git 更新、本地服务器与桌面快捷方式。
- 面向全新 Git 克隆的轻量 `-WebOnly` / `-FixtureOnly` 路径：无需 Rust、WSL、数据库或模型密钥即可运行完整脱敏 V0.9 Demo；完整栈仍保持独立验证门禁。
- 新同学 / AI 的五分钟接手说明、目录地图、贡献协议与安全披露规则。
- `app/` Phase 0 Rust workspace：无框架领域层、repository port、SQLx/SQLite adapter、Axum `/api/v1`、OpenAPI/JSON Schema 与 Golden Fixture。
- 63 项 Rust 测试、实时 `health → review → approve → publish → student interaction → replay`、F-003 Academic Mirror 18 步、F-004 Roster Lab 11 步、F-005 reset/read、F-006 recommendation/share/correction/STOP/replay、F-009 eligibility/match/consent/revoke/fairness/replay 与 F-010 Campus Pass 边界 API 路径，以及 Windows/Ubuntu GitHub Actions 门禁。
- Smart App Control 感知的 Rust 验证入口：保持 Windows 防护开启，在 enforcement 状态自动选择 Ubuntu WSL2。
- Career Control Room 首页、原创橙青赛季 HUD 与任务 / 角色 / 功能阵容快速入口。
- Junction 感知构建与核心 CSS / Pagefind 构建后守卫，防止“构建成功但页面裸奔”。
- AI 三项入场回执：协作角色与任务、本人自报的任务相关技术熟悉度、任务目标/非目标/成功证据与建议风险。
- X-16 Controller-first 多输入合同：语义动作、确定性焦点、动态键帽、校准/重映射、断连回退、输入等价与高风险二次确认。
- 面向 Figma / Photoshop / Illustrator / Revit / 3D 空间设计能力的交付边界：P0 先做统一 UI 与原创 Campus Arena 预渲染资产，运行时 3D 另过性能和权利 Gate。
- `D:/10451/Pictures/bili` 私人图库完成只读联系表审计：仅作私人情绪板，不作为队员能力证据或可复用产品资产。
- Linux live smoke 将冷编译与服务就绪计时分离，并为进程早退、超时和跨平台可执行文件路径提供明确诊断。
- GitHub Actions run 29974052323 已通过 Ubuntu Rust/live smoke、Windows Rust 与合同/文档三组门禁；GATE-1 仍等待第二台机器和产品总集成人员接受决定。
- `main` 保护从“唯一作者必须获得非作者批准”的不可满足组合，调整为三项 GitHub Actions 强制门禁 + Codex 中心化技术审查 + 产品总集成人员明确接受；PR、线性历史、对话解决、禁强推/删除保持不变。
- `engineering/MOTION-SYSTEM.md`：用统一状态机、六层反馈、时间/中断 Token、声音/触觉、性能与 Reduced Motion 验收定义 AAA 游戏感。
- `engineering/LOCAL-AI-SOVEREIGN-NODE.md`：登记 GX10 的设备事实、主权节点拓扑、模型裁决、资源/安全边界与 30 分钟实机 Spike。
- Human Factors 新增 Banter Relay 课堂接梗回路，以及手柄、RealSense、NFC/智能卡和 56K 调制解调器的非 P0 实验池。
- Multi-input native 合同：手柄只作为演示记忆点，键盘、鼠标、触屏和辅助技术共享语义动作、状态、焦点与验收矩阵。
- 产品总集成人员 × Codex 双轮共创：可丢弃原型、盲用 Think-aloud、六个固定问题、自由想法、四态决定与目标用户复核。
- CLI / 外部 AI / BYOK 合同：同一 `/api/v1` 与 Schema、默认只读 allowlist、机器可读输出、动作绑定的人类批准，以及仅留本机的凭据引用。
- GX10 设备 AI 交接状态机、启动 Prompt、脱敏 receipt、批准点和立即停止条件。
- `app/apps/web`：University2K26 V0.9 React 19 + strict TypeScript + Vite 6.4.3 Web/PWA 外壳、真实 `/api/v1/health` 握手、显式 Fixture 回退、离线 App Shell 与 142 项前端测试。
- F-001 五端点 TypeScript 合同投影与客户端；SmartCourse Replay 可只读显示经过嵌套运行时守卫验证的 Rust API 回执，同时明确本地 Studio 演练没有暗中写后端。
- `reference/audit/2026-07-24-qoder-security-integration-review/AUDIT.md`：压缩记录 Qoder 产出评价、独立安全复核、证据限制和本轮修复，不把重复过程稿扩散成第二套项目事实。
- 十入口、五角色的中英双语赛事导览层：Locale Provider、语言持久化、HTML 语言元数据、Locale-aware 日期、现场梗词典与正式含义/安全边界；`intl-messageformat` 与俄语复数测试为未来多变形语言提供工程底座，但深层 UI 仍未全量翻译。
- 五种 Demo Role Lens：首页可在学生、教师、辅导员 / 学业导师、专业负责人 / 系主任、本科生院 / 教务处之间切换；每种角色拥有独立导航、优先任务、非人员评分 Box Score、可见 / 禁止数据范围和角色化模块返回，同时明确生产 SSO 与服务端授权尚未实现。
- `engineering/FUNCTIONAL-COVERAGE-AUDIT-2026-07-24.md`：以 214 个稳定功能切片为全集，区分规格、Fixture 技术候选、Role Lens 预览、真实集成和人类接受，列出当前最短补齐路径。
- F-010 Campus Pass 脱敏 Fixture 技术切片：Pass Wallet、四类载体 Reader Drill、静态二维码截图拒绝、区域/时段/最小权限、带前置条件的申请镜像、访客自动到期草稿、离线新鲜度、遗失/冻结/恢复交接、本人记录纠错、无手机/残障人工回退、应急权威只读与追加式 Replay；正式凭证签发、门锁动作、密钥/密码存储和精细位置追踪恒为 0。
- 首页第十个模块入口在固定底栏下不可点击的问题已通过紧凑可滚动导航轨修复；Edge 已验证 MyCareer → Campus Pass 与直接深链 → 浏览器 Back → MyCareer。
- World Exam 选择即自动保存、`0/2 → 2/2` 进度、公开 Demo 全步骤解锁和可见 Replay CTA；首页增加本地 Coach’s Note，课程阵容增加三档卡片预设、等价排序与虚构教师大卡视觉。
- F-009 Opportunity Market 完整 Fixture 技术切片：8 条透明机会、20 条来源规则、四态资格、本人选择 Profile、确定性匹配、双向意向、限时最小披露与撤回、外部申请镜像、Capacity / Pathway / 作品导出、5 项反操纵审计和追加式 Replay；正式申请、提供方回应、权益与资格仍留在权威外部系统。
- F-001 智课工坊首条可玩 Fixture 纵向闭环：授权来源、结构化草稿、教师筛选与修改/通过/移除、有效来源发布门禁、NAN 理解检查和 Replay / Box Score；另含本地文件权利/格式/大小/SHA-256 Test Court、手工来源回退和来源失效阻断演练。
- F-002 MyCareer P0 轻外壳：第 4/8 本科赛季、六门课程阵容、近 7 天截止日、课程详情、无内容/未学习空状态、最近 Box Score，以及直达 F-001 Student / Replay 的跨模块入口。
- F-005 World Exam Finals P1 Fixture 纵向闭环：赛事日历、赛前简报、低风险 Warm-up、可排序 Playbook、Checkpoint、Key Match、精确来源抽屉、unsupported AI 说法挑战、Replay / 私密 Box Score、复盘同意与到期、JSON 导出及只读归档。
- F-005 三档叙事强度保持功能等价；传统模式移除赛事语言、倒计时动效与音效，IndexedDB 提供离线缓存与待同步状态。
- Rust domain / Axum 新增 F-005 状态机与 14 条 `/api/v1` 路径；两份 World Exam Schema、第三份 Golden Fixture 与 OpenAPI 同步落地。后端 Demo Session 暂为进程内存，尚非持久化实现。
- F-006 Performance Center P2 Fixture 纵向闭环：本人基线、趋势缺口、四维能力、负荷与支持、私密徽章、可解释建议、证据钻取、目的限定分享、版本化纠错、导出与 Replay。
- Degree Fahrenheit 仅作为 A/B 研究预览，C 版无隐喻面板为默认；STOP 会立即回退 C 版并锁定 A/B。`HF-02` 访谈协议已经可执行，但当前为 `DEFER / 0 位参与者`，不得声称人因安全已验证。
- Rust domain / Axum 新增 F-006 会话与 14 条 `/api/v1/performance` / Demo 路径；三份 Performance Center Schema、第六份 Golden Fixture与 OpenAPI 同步落地。后端 Session 暂为进程内存，前端交互仍使用显式 Fixture 引擎。
- F-004 Roster Lab P1 Fixture 纵向闭环：12 门 CourseSpec、Prefix、Pins、软偏好、目标排序、三方案 Draft Board、What-if、最小冲突集、add/drop/swap Transaction 与可重放 `semester.lock`。
- Rust domain / Axum 新增 F-004 会话与 10 条 `/api/v1` 路径；三份 Roster Schema、第四份 Golden Fixture 与 OpenAPI 同步落地。前端完整规则引擎和后端预验证候选仍需在 F-003 后统一 DTO 与在线调用。
- F-003 Academic Mirror P1 Fixture 纵向闭环：6 类来源、不可变快照、标准记录与字段血缘、新鲜度、冲突人工复核、用途同意、纠错/删除门禁、两类归档合同与追加式审计。
- Rust domain / Axum 新增 F-003 会话与 13 组 `/api/v1/mirror` / Demo 路径；三份 Academic Mirror Schema、第五份 Golden Fixture 与 OpenAPI 同步落地。增量同步、真实文件解析、签名加密归档及生产持久化均保持显式未实现。
- Rust API 新增四个 Career 端点与两个 Demo Mode 端点；`career-fixture` / `career-course-detail` Schema、第二份 Golden Fixture 与 OpenAPI 3.1 路径同步落地。
- Rust API 新增 StudentInteraction 追加式持久化、`POST /api/v1/generated-objects/{object_id}/interactions`、SQLite migration 与 OpenAPI/JSON Schema 合同。
- 六门公开安全 Demo 课程阵容与可切换 Film Room 分析：仅复用已审核本地课程 README / 索引中的课程名称、主题摘要、证据边界和来源引用；问题、分析路径与建议明确标记为 Fixture，不复制课件、真实身份、成绩或考试内容。
- F-003 My Record 首屏以“南同学 / NAN”去标识身份承载两校成绩季、逐课结果与已核验经历；直接标识符不进入公开 Fixture，个人已修记录、UArizona 2026 公开目录候选和 AI 路线建议保持三层分离。
- F-007 课程球探增加 SLS201 + 6 门 UArizona 2026 候选课的整页切换，公开班次、容量、教师与候补状态保留抓取时点边界；未修候选课不生成教师评价或学生反馈。
- F-008 Campus Concourse 改为意图优先首页，可见目标筛选真正重算三张行动卡，完整服务目录作为高级入口保留；推荐仍不读取位置、门禁、支付、健康或参与度画像。
- 桌面“学科”43 个快捷方式的只读发现快照：映射到 40 个唯一来源，10 个已有根 README；全部学科池可在课程抽屉中展开，但不冒充选课记录或完成分析。
- 首页动效升级为可审计的有限编排：开场层级、任务进度、Box Score 数字计分、课程卡/分析切换、按压反馈与轻量指针视差；Reduced Motion 与仅加载旋转的循环预算由自动测试守卫。
- F-001 移除“示例曲线占位”：新增可复算 RC 低通 Model Court，固定展示理想参数、C +10% 公差与 1 MΩ 输入负载的六个频点、公式、参数、模型版本和来源；真实仪器通道未接入时明确禁止把模型称为实测。
- F-009 将已有的 AdventureX 2026 终极指南核验回执转成可行动的参赛准备检查：登记 07-25 12:00 提交开放、07-26 01:00 截止、2–4 人、GitHub / 16:9 首图 / 小红书等要求；团队上下限、现场时段和提交包分别计算，视觉素材 Rights Gate 仍保持待官方确认。
- Opportunity Market 资格算子增加 `lte`，TypeScript、Rust 领域层、JSON Schema、Golden Fixture 与测试同步，团队人数上限不再依赖文案提醒。

### Changed

- 项目阶段由赛前规格切换为 `hacking / GATE-1`；在不替代人类接受门禁的前提下，F-001～F-010 Fixture 技术候选已进入本地技术评审，完整产品仍未完成。
- 人因研究改为 Codex 负责可查证草案、产品总集成人员逐项审核；AI 不替代真实用户证据。
- 保留现有八个权威事实入口，以浏览层组织全部模块、研究、门禁与归档，不复制第二套产品事实。
- `docs/` 从历史兼容占位调整为协作工具说明区；产品事实仍归属 `product/`、`modules/`、`engineering/`、`gates/` 与 `reference/`。
- 文档运行时升级到 Astro 7.1.3、Starlight 0.41.4、Sharp 0.35.3；依赖审计为 0，162 个生成内容页、254 条本地链接与 163 个构建页面通过。
- 将“赛前成熟、赛中弹性”明确为协作与架构优势；技术不熟悉时固定比较结对、改派或替换该层实现，禁止 AI 静默换栈。
- 修正跨机器新人环境说明：仓库本地 Node 由 bootstrap 校验安装，Web-only 检查不再误要求 Rust/WSL；完整栈 Rust 由 rustup 固定，Smart App Control 保持开启时自动选择 Ubuntu WSL2。
- `.env.example` 只列当前运行时实际读取的安全配置名，并明确根 `.env` 不会自动加载；BYOK 与 OceanBase 变量继续保持未实现、默认禁用。
- 首页从“尚无 GUI”更新为 Option 1 隔离式 React/Vite 模板待审；静态/状态基线不再被误写为生产首页或完整动效验证。
- AI 候选收敛为 GX10 上先验证 `Qwen3.6-35B-A3B-NVFP4`，Step 3.7 Flash 优先走赞助质量通道，所有实时模型继续保留 Fixture/人工回退。
- 正式展示名由 `jiaowu2K26` 收敛为“大学2K26 / University2K26”；GitHub 仓库、Rust crate、API component 和 `j2k26` 暂作为兼容技术 ID 保留。
- 用户确认 Option 1 首页美术后，将隔离原型视觉晋升到正式 Web/PWA Experience Shell；原型继续只作为设计与回归证据。
- 修复 `sqlite::memory:` 连接被 SQLx 默认 idle/max-lifetime 回收后丢失 schema 与 Fixture 的长时运行故障；内存模式现在保持单连接存活，文件数据库策略不变。
- 英文 `NOW PLAYING` 从覆盖主内容的可点击浮层改为非交互状态提示；独立 `EN Guide` 按钮保留，F-001 答题主 CTA 不再被截获。

### Project status

- Phase 0 本机与既有 CI 技术证据已就绪，V0.9 与 F-001～F-010 Fixture / 本地回退纵向切片等待产品总集成人员接受决定；F-011～F-014 仍为 `pending`。
- 本批变化建立协作与技术底座，不构成完整产品能力声明。

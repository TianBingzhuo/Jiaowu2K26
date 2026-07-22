# SIS / URP / UArizona：权威业务与体验层调研

> **状态：**赛前公开资料研究；未连接任何学校系统，未使用真实账号或学生数据。
> **最后核对：**2026-07-21（Asia/Shanghai）。事实与产品推断分开记录；上线前仍须取得学校授权并复核接口、隐私和数据治理要求。

## 结论先行

1. **教务系统首先是权威记录系统。** 选课、成绩、学籍、缴费和正式证明不能由 jiaowu2K26 自行宣布为真。
2. **大学数字体验天然是多系统协作。** UArizona 公开页面呈现的是 UAccess 学生中心、Brightspace、Trellis 等工具的组合，不是一个应用包办所有事务。
3. **jiaowu2K26 应做“可解释体验层”。** 它通过 `Academic Mirror` 保存来源、版本、同步时间和权威等级，再提供赛季叙事、What-if、学习闭环与机会匹配。
4. **当前不应采集教务密码或绕过登录抓取。** 中国高校对第三方教务查询工具的公开警示说明，这既是安全问题，也是事实一致性问题。
5. **开源 SIS 适合作为领域模型参考，不是赛前现成底座。** 本轮只研究功能边界与数据对象；没有克隆、安装或复用代码。

```text
校方 SIS / URP        LMS              学生支持 / CRM
选课、学籍、成绩      课程与作业        预约、沟通、预警
       \               |               /
        \—— 授权导出 / API / 合规样例 ——/
                         ↓
                  Academic Mirror
          来源 + 版本 + 时间 + 权威等级 + 同意
                         ↓
                    jiaowu2K26
       解释、What-if、学习、反馈、叙事与机会匹配
```

## UArizona 的公开服务分工

下表中的“可确认事实”来自学校公开页面；“对本项目的启发”是本项目推断，不代表 UArizona 的官方产品规划。

| 服务 | 公开页面可确认的职责 | 对 jiaowu2K26 的启发 |
|---|---|---|
| **UAccess Student Center** | 注册选课、课表、成绩、学术记录、转入课程评估、班级身份、教材与分级信息 | 权威交易与记录留在 SIS；体验层展示来源与状态，不自行改写结果 |
| **Class Search / Shopping Cart** | 搜索课程、加入购物车、按 enrollment appointment 选课，并支持 drop / swap / edit | Roster Lab 可在正式提交前解释依赖、冲突和方案 diff，但不能把模拟结果冒充已选成功 |
| **Academic Advisement / What-if** | `ADVIP` 用于查看学位进度；What-if 可把已完成和在修课程映射到另一培养方案 | MyPLAYER Builder / Transfer Portal 可以做“如果转专业会怎样”，并明确这是规划解释而非审批 |
| **Waitlist** | 候补有容量、位置与自动处理流程；权限和课程访问会受正式注册状态影响 | 候补不是简单数字，要显示队列、可能动作、替代方案、更新时间和权威来源 |
| **Instructor Center** | 教师可查看课程、学生照片、名单并提交成绩 | 教师工作台与学生端权限必须分离；正式成绩写入不进入黑客松 P0 |
| **Brightspace** | 学习活动、作业与课程沟通入口 | 智课工坊属于 LMS 邻近工作流，应输出经过教师审核的学习对象，而非复制完整 LMS |
| **Trellis Advise / Progress** | 预约、沟通、学生支持，以及教师向学生和支持人员提供积极或建设性反馈 | 独立的服务/参与层是合理架构；反馈应可行动、可治理，不能变成公开羞辱榜 |
| **Trellis 平台集成** | 官方隐私说明列出 PeopleSoft/UAccess、Brightspace、Slate、数据仓库、原生应用等集成 | 体验层必须有清楚的数据治理、用途限制和集成责任，而不是把“能连”当成“可随便用” |

### UArizona 官方来源

- [Current Student Tools](https://www.arizona.edu/students) — UAccess、Brightspace 等学生入口总览；
- [UAccess](https://uaccess.arizona.edu/) — UAccess 服务入口；
- [UAccess Student Center](https://advising.arizona.edu/online-tools/uaccess-student-center) — 学术记录、课表、成绩与相关学生信息；
- [How to Register for Classes](https://registrar.arizona.edu/records-enrollment/enrollment/how-register-classes) — 课程搜索、购物车、选课时段及 drop/swap/edit；
- [Academic Advisement Glossary & Guide](https://advising.arizona.edu/for-advisors/glossary-guide) — ADVIP 与 What-if；
- [Student Tools](https://advising.arizona.edu/student-tools) — 学生与顾问工具分工；
- [Trellis Advise FAQs](https://trellis.arizona.edu/trellis-advise-faqs) — 预约与沟通；
- [Trellis Progress](https://studentsuccess.arizona.edu/trellis-progress) — 教师反馈与学生支持；
- [About Trellis](https://trellis.arizona.edu/about) 与 [Trellis Privacy Notice](https://trellis.arizona.edu/about/privacy-notice) — CRM 角色、治理和集成范围；
- [Waitlist Setup](https://registrar.arizona.edu/faculty-staff-resources/room-course-scheduling/rcs-resource-guides/resource-guide-setting-and) 与 [Waitlist Monitoring](https://registrar.arizona.edu/faculty-staff-resources/forms-help-guides/uaccess-training-information/resource-guide-monitoring) — 候补容量、位置、处理与权限；
- [Instructor Center Information](https://registrar.arizona.edu/faculty-staff-resources/grading/instructor-center-information) — 教师名单与成绩工作流；
- [Enrollment Transactions and Messages](https://registrar.arizona.edu/faculty-staff-resources/forms-help-guides/uaccess-training-information/resource-guide-viewing) — 交易状态与错误信息。

## 中国高校 URP 公开证据

本轮没有找到一个可作为所有高校“标准 URP”的统一公开规格，因此只记录可核验的校方使用证据，不把单校配置推广成行业事实。

| 来源 | 可确认内容 | 项目结论 |
|---|---|---|
| [上海海洋大学：谨防第三方教务查询软件](https://jwc.shou.edu.cn/2016/0920/c11212a227390/page.htm) | 校方提醒不要把教务账号密码交给第三方应用，课表和成绩以 URP 为准 | 不收集密码、不模拟登录；只走授权接口、导出或样例 |
| [天津工业大学：培养方案内课程选课通知](https://jwc.tiangong.edu.cn/2025/0625/c1328a106461/page.htm) | 选课涉及培养方案、预置/必修课程、选修与最终权威结果 | Roster Lab 必须区分 locked/pinned 与可选项，并把模拟和正式结果分开 |
| [复旦大学软件学院：官方成绩单服务说明](https://software.fudan.edu.cn/d1/5a/c29403a315738/page.htm) | 正式成绩单申请与付费属于学校权威服务 | 生涯档案只能导出本人授权的学习证据，不能冒充官方成绩单 |

## 权威业务与可改造体验

| 业务对象 | 权威系统负责 | jiaowu2K26 可以负责 | 明确不做 |
|---|---|---|---|
| 课程目录 | 课程号、学分、容量、时间、先修与开课状态 | 阵容卡、依赖解释、负荷视图、来源与更新时间 | 私自修改容量或宣称已选成功 |
| 学业进度 | 已修、在修、成绩、培养方案与审核 | What-if、未满足项、路线 diff、非线性学制叙事 | 自行授予学分、学位或正式排名 |
| 选课交易 | 加退换课、候补、权限码与错误码 | 交易前解释、备选方案、可读错误、`semester.lock` 草案 | 绕过登录、验证码、权限或审批 |
| 教学内容 | LMS 中的课程、作业和教师发布 | 有来源的 AI 草稿、教师审核、已批准对象互动 | 未审先发、替代正式成绩入库 |
| 学生支持 | 顾问、教师、支持部门与正式沟通记录 | 经同意的提醒、预约入口、可行动反馈与个人复盘 | 公开敏感预警、未经同意画像 |
| 机会与转段 | 招聘方、导师、学院和正式审批方 | 资格解释、透明匹配、授权档案、申请进度镜像 | 付费绕过先修/审批，或为学生“竞价” |

## Academic Mirror 最小治理合同

每条外部数据至少记录：

```text
source_system       external_id          source_version
fetched_at          effective_at         authority_level
ingestion_method    consent_or_basis     raw_reference
normalized_payload  stale_after          correction_route
```

必须满足：

1. UI 明示“权威记录 / 授权镜像 / 手工导入 / 演示样例”；
2. 镜像过期时不静默展示为当前事实；
3. 默认只读，任何未来写回都需单独授权、幂等、审计和回滚设计；
4. 用户能看见来源、同步时间和纠错入口；
5. 不在日志、截图、AI 提示词或路演数据中暴露学号、成绩等不必要信息；
6. 黑客松使用虚构或明确授权的数据，不接真实生产教务账号。

## 开源教育系统：只作领域参考

| 项目 | 官方上游 | 可研究的领域对象 | 当前复用判断 |
|---|---|---|---|
| openSIS Community Edition | [OS4ED/openSIS-Classic](https://github.com/OS4ED/openSIS-Classic) | 学生、课程、排课、成绩与门户 | 参考；锁定版本与许可证前不复用代码 |
| Frappe Education | [frappe/education](https://github.com/frappe/education) | 申请、项目、注册、课程、排课与考试 | 领域模型参考；其框架和所选提交的许可证需逐项复核 |
| Gibbon | [GibbonEdu/core](https://github.com/GibbonEdu/core) / [官方文档](https://docs.gibbonedu.org/) | 角色权限、课表、日历、学生提醒与 lesson planner | K–12 倾向明显，适合参考工作流，不直接当大学产品模板 |
| OpenEduCat | [openeducat/openeducat_erp](https://github.com/openeducat/openeducat_erp) | admission、student、course、exam、fees、attendance、timetable、library | Odoo 模块边界参考；直接采用需重新核对 LGPL-3.0 与模块依赖 |

Frappe Education 的 [Student Applicant](https://docs.frappe.io/education/student-applicant)、[Program Enrollment](https://docs.frappe.io/education/program-enrollment) 和 [Program](https://docs.frappe.io/education/program) 文档，可用于理解“申请—培养项目—注册”的对象边界。开源项目更精确的许可与版本状态统一登记在 [OPEN-SOURCE-REUSE.md](../tech-stacks/OPEN-SOURCE-REUSE.md)。

## 对 AdventureX 范围的直接影响

### P0

- 只用一套虚构或已获授权的课程样例；
- 展示来源、审核状态和学生回放，不连接真实 URP；
- MyCareer 外壳只负责说明“这条学习闭环属于哪门课、哪个赛季”。

### P1（P0 稳定后最多选一个）

- `Academic Mirror`：导入一份静态、授权的数据快照并展示权威级别；或
- `Roster Lab What-if`：对培养方案与课表做解释性模拟，不提交真实选课；或
- `Opportunity Market`：用公开机会样例做透明资格匹配，不接真实招聘档案。

### 明确不进入本届

- 真实学校统一身份认证、生产写回和正式成绩入库；
- 学费、财务、学籍处分、官方成绩单或毕业审核；
- 大规模全校排课和生产级数据迁移；
- 任何要求学生提供教务密码的抓取方案。

## 事实、推断与待确认

- **事实：**上述学校页面公开描述了各自服务和流程；链接与查看日期已保存。
- **推断：**“系统记录层 + LMS + 服务/CRM + 体验层”适合 jiaowu2K26，是基于这些公开信息形成的产品架构判断。
- **待确认：**具体学校的 API、采购、SSO、数据保留、FERPA/中国个人信息保护要求及写回权限，必须由目标学校和法务/数据治理方确认。
- **不应外推：**UArizona 或某一所使用 URP 的中国高校，不代表所有大学采用相同字段、流程或技术实现。

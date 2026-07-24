import type { RoleId } from "../features/roles/types";

export const APP_LOCALES = ["zh-CN", "en-US"] as const;

export type AppLocale = (typeof APP_LOCALES)[number];

export const EXPERIENCE_KEYS = [
  "career",
  "smartcourse",
  "academicmirror",
  "rosterlab",
  "worldexam",
  "performancecenter",
  "opportunitymarket",
  "coachscouting",
  "campuslife",
  "campuspass",
] as const;

export type ExperienceKey = (typeof EXPERIENCE_KEYS)[number];

export type LocalizedText = Record<AppLocale, string>;

export type ExperienceBrief = {
  code: string;
  title: string;
  formalName: LocalizedText;
  tagline: LocalizedText;
  plainMeaning: LocalizedText;
  joke: LocalizedText;
  nextMove: LocalizedText;
  boundary: LocalizedText;
};

const bilingual = (zhCN: string, enUS: string): LocalizedText => ({
  "zh-CN": zhCN,
  "en-US": enUS,
});

export const EXPERIENCE_BRIEFS: Record<ExperienceKey, ExperienceBrief> = {
  career: {
    code: "F-002",
    title: "MYCAREER",
    formalName: bilingual("大学生涯中心", "Degree journey command center"),
    tagline: bilingual(
      "把四到八年大学生活，打成一段由自己掌舵的生涯。",
      "Build your degree one season at a time.",
    ),
    plainMeaning: bilingual(
      "课程、截止日、机会与支持被放回同一段大学生涯里；学生看到下一步，也能查看来源与撤回路径。",
      "Courses, deadlines, opportunities and support sit in one journey. The student sees the next move, its source and a way back.",
    ),
    joke: bilingual(
      "这是体育生涯模式的大学转译。NAN 既是“南同学”，也是 Not a Number：系统故意不把人压成一张总分卡。",
      "It borrows the sports career-mode setup. NAN is both the demo student's name and “Not a Number”: this student is deliberately unrated.",
    ),
    nextMove: bilingual(
      "从“继续今日赛程”进入一小回合学习，或切换角色查看同一系统的不同责任边界。",
      "Choose “Continue today’s lineup” for one small learning possession, or switch roles to see how responsibility changes.",
    ),
    boundary: bilingual(
      "所有人物、进度与建议都是 Fixture；正式成绩、学籍、支付和门禁仍由学校权威系统决定。",
      "People, progress and recommendations are demo fixtures. Official grades, records, payments and access stay with the school’s systems of record.",
    ),
  },
  smartcourse: {
    code: "F-001",
    title: "SMARTCOURSE STUDIO",
    formalName: bilingual("智课工坊", "AI-assisted course studio"),
    tagline: bilingual(
      "AI 先打草稿，教师握着发布哨，学生保留挑战权。",
      "AI drafts. Teachers own the whistle. Students keep the challenge call.",
    ),
    plainMeaning: bilingual(
      "把教学材料的授权、生成、教师审核、发布、学习与证据回放串成一条可追溯责任链。",
      "A traceable chain connects source permission, AI drafting, teacher review, publishing, learning and evidence replay.",
    ),
    joke: bilingual(
      "AI 是新秀，不是主教练；“Challenge Call”借用赛场挑战判罚，但挑战的是 AI 断言，不是教师人格。",
      "The AI is the rookie, not the head coach. A “Challenge Call” contests an AI claim—never a teacher’s identity.",
    ),
    nextMove: bilingual(
      "先确认材料有权使用，再查看来源并完成当前角色的一次审核、学习或回放。",
      "Confirm the source can be used, then review its evidence and complete one role-appropriate draft, review or replay action.",
    ),
    boundary: bilingual(
      "未经教师审核的 AI 内容不能进入学生端；AI 不写正式成绩，也不替教师发布课程。",
      "Unreviewed AI content never reaches students. AI neither posts official grades nor publishes on a teacher’s behalf.",
    ),
  },
  academicmirror: {
    code: "F-003",
    title: "ACADEMIC MIRROR",
    formalName: bilingual("学业数据镜像", "Academic data mirror"),
    tagline: bilingual(
      "先看来源，再看分数；镜像会承认冲突与未知。",
      "Source before score. The mirror admits conflicts and unknowns.",
    ),
    plainMeaning: bilingual(
      "把 SIS、URP、LMS 和学生授权导入的数据变成带来源、版本、时效与纠错入口的只读镜像。",
      "SIS, URP, LMS and student-authorized imports become read-only snapshots with provenance, versions, freshness and correction paths.",
    ),
    joke: bilingual(
      "它不是“魔镜告诉你是谁”，而是比赛录像室：每个结论都要能退回原始来源。",
      "This is not a magic mirror that defines you. It is a film room where every claim can be traced back to source footage.",
    ),
    nextMove: bilingual(
      "打开一个来源快照，比较权威级别、时间和冲突，再决定接受、纠错或等待责任方确认。",
      "Open a source snapshot, compare authority, time and conflicts, then accept it, correct it or wait for the accountable owner.",
    ),
    boundary: bilingual(
      "镜像不是学校权威数据库；它不静默改写原记录，也不把缺失数据猜成事实。",
      "A mirror is not the school’s system of record. It never silently rewrites a record or guesses missing data into fact.",
    ),
  },
  rosterlab: {
    code: "F-004",
    title: "ROSTER LAB",
    formalName: bilingual("学期排课与路径求解器", "Semester and degree-path resolver"),
    tagline: bilingual(
      "选课像组阵容；冲突像依赖求解，但无解也要说人话。",
      "Draft a semester that can actually resolve.",
    ),
    plainMeaning: bilingual(
      "在必修、先修、时间、容量、偏好与毕业路径之间生成多套可解释方案，而不是黑箱推荐一个答案。",
      "It resolves prerequisites, times, capacity, preferences and degree paths into several explainable options—not one black-box answer.",
    ),
    joke: bilingual(
      "选课像自由市场，求解思路像 Conda：依赖冲突时给出最小冲突集，而不是怪学生“不会选”。",
      "Course registration meets a roster draft, with Conda-style dependency solving: conflicts produce a minimal explanation, not blame.",
    ),
    nextMove: bilingual(
      "比较 A/B/C 方案的满足项、牺牲项和未知项，再由学生决定是否带去正式选课系统。",
      "Compare Plans A, B and C by what each satisfies, trades off and still does not know; the student chooses what to take to official registration.",
    ),
    boundary: bilingual(
      "求解结果是 What-if，不会自动抢课、退课、转专业或修改培养方案。",
      "Every result is a what-if. It cannot enroll, drop, transfer a major or amend a curriculum.",
    ),
  },
  worldexam: {
    code: "F-005",
    title: "WORLD EXAM FINALS",
    formalName: bilingual("复习与模拟考赛事", "Review and low-stakes exam event"),
    tagline: bilingual(
      "期末是关键一战，不是对一个人的终审判决。",
      "Finals are a key match—not a verdict on a person.",
    ),
    plainMeaning: bilingual(
      "把赛前简报、热身、复习战术板、开放式练习、证据回放与私密复盘连成一个低风险学习闭环。",
      "Briefing, warm-up, review playbook, open-book practice, evidence replay and a private debrief form one low-stakes learning loop.",
    ),
    joke: bilingual(
      "“Finals”既是期末也是总决赛；Replay 不是监控，而是回到来源、答案与修订过程复盘。",
      "“Finals” means both exams and a championship round. Replay is evidence-based review, never surveillance.",
    ),
    nextMove: bilingual(
      "任选一个开放步骤试玩；答题会自动保存，完成后进入 Replay 查看依据与修订。",
      "Open any demo stage. Answers auto-save, and completion unlocks Replay for sources and revisions.",
    ),
    boundary: bilingual(
      "公开 Demo 不计正式成绩、不排名、不锁流程；传统叙事与减少动效提供信息等价体验。",
      "The public demo records no official grade, ranking or locked gate. Traditional language and reduced motion keep full information parity.",
    ),
  },
  performancecenter: {
    code: "F-006",
    title: "PERFORMANCE CENTER",
    formalName: bilingual("本人学习状态与改进中心", "Private learning-state and improvement center"),
    tagline: bilingual(
      "看一段时间的 Box Score，不给一个人贴永久 OVR。",
      "Read the box score, never a permanent human OVR.",
    ),
    plainMeaning: bilingual(
      "学生私下查看进度、负荷、来源和改进建议，并逐项决定分享、撤回、纠错或停用。",
      "Students privately inspect progress, workload, sources and next moves, then choose what to share, revoke, correct or stop.",
    ),
    joke: bilingual(
      "Degree Fahrenheit 是可选的“学业气候”皮肤：98.6°F 不是满分，100°F 也不是更优秀；它绝不是医学或成绩结论。",
      "Degree Fahrenheit is an optional “academic climate” skin. 98.6°F is not a perfect score, and 100°F is not “better.” It is neither medical nor academic judgement.",
    ),
    nextMove: bilingual(
      "从 Share Loadout、Challenge Call、STOP Gate 或 Replay 中只选一个当前行动。",
      "Choose one action: Share Loadout, Challenge Call, STOP Gate or Replay.",
    ),
    boundary: bilingual(
      "默认本人私密；不使用 GPA、排名、支付、门禁、健康或夜间在线数据生成能力总分。",
      "Private by default. GPA, rank, payments, access, health and late-night activity never feed a single ability score.",
    ),
  },
  opportunitymarket: {
    code: "F-009",
    title: "OPPORTUNITY MARKET",
    formalName: bilingual("科研、竞赛、会议与实习机会发现", "Research, competition, conference and internship discovery"),
    tagline: bilingual(
      "找到下一片赛场，不靠付费抽卡，也不藏资格规则。",
      "Find the next arena—without pay-to-win or hidden eligibility.",
    ),
    plainMeaning: bilingual(
      "统一发现机会，解释资格、缺口、未知项和申请边界，并支持最小披露的双向匹配。",
      "Discover opportunities with explainable eligibility, gaps, unknowns and application boundaries, plus minimal-disclosure matching.",
    ),
    joke: bilingual(
      "它借用自由市场和选秀板的视觉，但拒绝拍卖、卡包稀缺、花钱买资格和人气天梯。",
      "It borrows the free-agency board, then rejects auctions, loot-box scarcity, paid eligibility and popularity ladders.",
    ),
    nextMove: bilingual(
      "筛选一个机会，查看“符合 / 不符合 / 未知 / 需人工确认”四态，再去正式入口申请。",
      "Filter one opportunity, inspect Eligible / Not eligible / Unknown / Human review, then continue through the official application route.",
    ),
    boundary: bilingual(
      "系统不自动投递、不代替评审、不出售机会，也不因学生画像不完整而静默拒绝。",
      "The system does not auto-apply, replace reviewers, sell access or silently reject an incomplete profile.",
    ),
  },
  coachscouting: {
    code: "F-007",
    title: "COACH & SCOUTING",
    formalName: bilingual("课程结构、教学预期与协作匹配", "Course structure, teaching expectations and collaboration matching"),
    tagline: bilingual(
      "球探看课程结构与证据，不给教师人格打分。",
      "Scout the course, not the person.",
    ),
    plainMeaning: bilingual(
      "分开呈现课程事实、教师声明、学生体验、推断与未知，并支持版本比较、纠错和教师回应。",
      "Course facts, teacher statements, student experience, inference and unknowns stay separate, with version comparison, corrections and teacher response.",
    ),
    joke: bilingual(
      "Coach Profile 只描述教学战术与可预期安排；它不是 Rate My Professor，也没有教师 OVR。",
      "Coach Profile covers teaching tactics and practical expectations. It is not Rate My Professor, and there is no teacher OVR.",
    ),
    nextMove: bilingual(
      "先看五级来源，再比较课程版本或带着具体问题进入人工咨询。",
      "Inspect the five source levels, then compare course versions or take a specific, evidence-backed question to a human.",
    ),
    boundary: bilingual(
      "不做教师人格结论、匿名围攻、给分预测或黑箱排名；少样本必须明确显示。",
      "No personality verdicts, anonymous pile-ons, grade predictions or black-box rankings. Small samples stay visibly small.",
    ),
  },
  campuslife: {
    code: "F-008",
    title: "CAMPUS LIFE HUB",
    formalName: bilingual("校园活动、协作与支持服务", "Campus activities, collaboration and support"),
    tagline: bilingual(
      "把校园做成可探索的 The City，但不拿位置、连签和 FOMO 绑架人。",
      "An open-world campus—with an off switch.",
    ),
    plainMeaning: bilingual(
      "通过 Concourse、Map、MyCOURT、组队、支持热线与 Replay 发现校园资源，同时保留退出和人工通道。",
      "Concourse, Map, MyCOURT, squad links, support lines and Replay help students find campus resources while keeping opt-out and human routes.",
    ),
    joke: bilingual(
      "MyCOURT 是本人的私人收藏与计划空间；Campus Map 是静态可达路线，不是后台 GPS 跟踪。",
      "MyCOURT is a private planning space. Campus Map offers static accessible routes, not background GPS tracking.",
    ),
    nextMove: bilingual(
      "选择一个地点或支持入口，查看来源、时效、办理边界与冲突后再决定是否前往。",
      "Choose one place or support route, inspect source, freshness, boundaries and conflicts, then decide whether to go.",
    ),
    boundary: bilingual(
      "活动热度、参与次数和社交反应不进入学生价值评分；紧急支持永远先于留存和营销。",
      "Popularity, attendance and reactions never become a student-value score. Urgent support always outranks retention and marketing.",
    ),
  },
  campuspass: {
    code: "F-010",
    title: "CAMPUS PASS",
    formalName: bilingual("校园通行权限与恢复演练", "Campus access rights and recovery drill"),
    tagline: bilingual(
      "通行权限像 Loadout；正式开门动作仍握在学校手里。",
      "Your campus access loadout. Official decisions stay with the school.",
    ),
    plainMeaning: bilingual(
      "把权限钱包、读卡演练、申请队列、安全恢复与 Replay 做成可解释、可回退的通行体验。",
      "Pass Wallet, Reader Drill, Access Queue, Safety Desk and Replay form an explainable, recoverable access experience.",
    ),
    joke: bilingual(
      "Loadout 表示“你当前带着哪些授权”，不是收藏真密钥；静态二维码截图会被明确拒绝。",
      "Loadout means the authorizations currently available—not a collection of real keys. Static QR screenshots are explicitly rejected.",
    ),
    nextMove: bilingual(
      "先查看一张权限卡的签发方、范围和期限，再选择安全的演练或人工恢复路径。",
      "Inspect an authorization’s issuer, scope and expiry, then choose a safe drill or human recovery path.",
    ),
    boundary: bilingual(
      "Demo 不签发真实权限、不执行开门、不保存精细轨迹；高风险动作必须由外部权威系统和责任人完成。",
      "The demo issues no real credential, opens no door and stores no precise trail. High-risk actions require the external authority and accountable human.",
    ),
  },
};

export const ROLE_BRIEFS: Record<
  RoleId,
  {
    title: LocalizedText;
    summary: LocalizedText;
  }
> = {
  student: {
    title: bilingual("学生 · MYCAREER", "Student · MYCAREER"),
    summary: bilingual(
      "本人掌舵学习、选课、成长、机会与校园生活；系统给依据和选项，不替本人下结论。",
      "The student steers learning, course choices, growth, opportunities and campus life. The system offers evidence and options, not verdicts.",
    ),
  },
  teacher: {
    title: bilingual("教师 · COACH STUDIO", "Teacher · COACH STUDIO"),
    summary: bilingual(
      "把课堂证据变成教师可审核的改进回合；AI 只能提案，发布与课程调整仍由教师决定。",
      "Turn classroom evidence into teacher-reviewed improvement possessions. AI proposes; the teacher owns publishing and course changes.",
    ),
  },
  advisor: {
    title: bilingual(
      "辅导员 / 学业导师 · PLAYER DEVELOPMENT",
      "Advisor · PLAYER DEVELOPMENT",
    ),
    summary: bilingual(
      "把提醒当作联系学生的起点，不当作风险判决；支持过程最小披露、可纠错、可退出。",
      "A signal starts a conversation—it never becomes a risk verdict. Support stays minimal, correctable and optional.",
    ),
  },
  program_lead: {
    title: bilingual(
      "专业负责人 · PROGRAM FRONT OFFICE",
      "Program Lead · PROGRAM FRONT OFFICE",
    ),
    summary: bilingual(
      "在培养方案进入正式审批前，先模拟先修、容量、跨院依赖与受影响路径。",
      "Model prerequisites, capacity, cross-school dependencies and affected paths before curriculum changes enter approval.",
    ),
  },
  undergraduate_office: {
    title: bilingual(
      "本科生院 / 教务处 · LEAGUE OFFICE",
      "Undergraduate Office · LEAGUE OFFICE",
    ),
    summary: bilingual(
      "学校端看影响、责任、版本与异议，不把更多可见性误当成无限权限。",
      "The institutional view exposes impact, ownership, versions and objections—never unlimited access.",
    ),
  },
};

export const HUD_COPY = {
  "zh-CN": {
    languageLabel: "语言",
    languageButton: "EN",
    languageAction: "切换到英语赛事导览",
    guideButton: "双语解说",
    guideAction: "打开当前场景双语解说",
    close: "关闭解说",
    eventMode: "ADVENTUREX · BILINGUAL EVENT MODE",
    whatIsThis: "这是什么",
    whyItLands: "梗在哪里",
    nextMove: "下一步",
    safetyBoundary: "安全边界",
    formalName: "正式名称",
    currentLens: "当前角色 Lens",
    fixtureTitle: "Fixture 不是“假功能”",
    fixtureBody:
      "Fixture 是可重复验收的安全演示数据；它明确不冒充学校实时记录。",
    glossaryTitle: "现场梗词典",
    glossary: [
      ["Roster", "课程阵容 / 学期选课组合"],
      ["Replay", "来源、决定与修订的证据回放"],
      ["OVR", "体育游戏总评；本项目拒绝把人压成一个 OVR"],
      ["NAN", "南同学 + Not a Number；故意不评分"],
    ] as const,
    coverageTitle: "V0.9 双语边界",
    coverageBody:
      "赛事解说层、角色概念、核心循环与安全边界已中英等价；深层 Fixture 字段仍以中文为主，不伪装成已完成翻译。",
    announce: "已切换到中文赛事导览。",
  },
  "en-US": {
    languageLabel: "LANG",
    languageButton: "中",
    languageAction: "Switch to the Chinese event guide",
    guideButton: "EN Guide",
    guideAction: "Open the bilingual guide for this scene",
    close: "Close guide",
    eventMode: "ADVENTUREX · BILINGUAL EVENT MODE",
    whatIsThis: "What this is",
    whyItLands: "Why the joke lands",
    nextMove: "Your next move",
    safetyBoundary: "Safety boundary",
    formalName: "Plain product name",
    currentLens: "Current role lens",
    fixtureTitle: "Fixture does not mean fake functionality",
    fixtureBody:
      "A fixture is safe, repeatable demo data. It never pretends to be a live school record.",
    glossaryTitle: "The joke, in plain English",
    glossary: [
      ["Roster", "Your semester course lineup"],
      ["Replay", "Evidence behind a source, decision or revision"],
      ["OVR", "A sports-game overall rating; we refuse to reduce a person to one"],
      ["NAN", "The student’s name and “Not a Number”—deliberately unrated"],
    ] as const,
    coverageTitle: "V0.9 bilingual boundary",
    coverageBody:
      "The event guide, role concepts, core loop and safety boundaries are bilingual. Deep fixture fields remain Chinese-first and are not misrepresented as fully translated.",
    announce: "English event guide is on.",
  },
} satisfies Record<AppLocale, Record<string, unknown>>;

export const pickLocalized = (
  value: LocalizedText,
  locale: AppLocale,
): string => value[locale];

export const isAppLocale = (value: unknown): value is AppLocale =>
  typeof value === "string" &&
  (APP_LOCALES as readonly string[]).includes(value);

export const pseudoLocalize = (value: string): string => {
  const expanded = value
    .replaceAll("a", "àá")
    .replaceAll("e", "ëé")
    .replaceAll("i", "ïí")
    .replaceAll("o", "øó")
    .replaceAll("u", "üú")
    .replaceAll("A", "ÀÁ")
    .replaceAll("E", "ËÉ")
    .replaceAll("I", "ÏÍ")
    .replaceAll("O", "ØÓ")
    .replaceAll("U", "ÜÚ");
  return `⟦${expanded} ···⟧`;
};

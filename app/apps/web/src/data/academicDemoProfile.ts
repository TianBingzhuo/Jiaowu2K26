export type AcademicResultKind =
  | "numeric"
  | "letter"
  | "qualitative"
  | "pass"
  | "withdrawal";

export type AcademicCourseResult = {
  id: string;
  title: string;
  credits: number;
  result: string;
  kind: AcademicResultKind;
  tags?: string[];
};

export type AcademicTermSnapshot = {
  id: string;
  institution: "HEBUT" | "UArizona";
  label: string;
  season: string;
  termGpa?: string;
  attemptedCredits: number;
  earnedCredits: number;
  sourceLabel: string;
  courses: AcademicCourseResult[];
};

export type AcademicEvidenceMoment = {
  id: string;
  period: string;
  title: string;
  role: string;
  evidence: string;
  skills: string[];
  status: "verified" | "in_progress";
};

export const ACADEMIC_DEMO_PROFILE = {
  alias: "NAN",
  displayName: "南同学",
  identityLine: "NAN // NOT A NUMBER",
  identityNote:
    "NAN 是去标识 Demo 身份，也提醒我们：学生不是一个可以被单一分数算完的人。",
  major: "应用物理学",
  programWindow: "本科 8 赛季路线 · 成绩记录覆盖 5 个 HEBUT 学期",
  sourceBoundary:
    "由本人授权的成绩单与已核验经历生成去标识演示数据；已移除姓名、学号、证件号、生日、班级和联系方式。去标识不等于绝对匿名。",
  totals: {
    hebutCredits: 128.5,
    hebutGpa: "3.18",
    uArizonaCredits: 16,
    uArizonaGpa: "3.40",
    uArizonaTransferCredits: 78,
    verifiedExperiences: 6,
  },
  focus:
    "从应用物理出发，把物理建模、实验测量、嵌入式与机器人项目推进到操作系统和机器人系统软件。",
  nextMoves: [
    "先用 CSC 352 / 系统编程补齐 C、Unix、调试与构建链证据。",
    "再用 CSC 452 / 操作系统原理衔接 OpenCamp、rCore 与 ArceOS。",
    "用 AME 455 把控制、仿真、传感和执行器经验收束成闭环实验。",
  ],
} as const;

export const ACADEMIC_TERM_SNAPSHOTS: AcademicTermSnapshot[] = [
  {
    id: "hebut-2023-fall",
    institution: "HEBUT",
    label: "2023-2024 秋",
    season: "ROOKIE SEASON · 第一赛季",
    attemptedCredits: 20,
    earnedCredits: 20,
    sourceLabel: "脱敏 HEBUT 成绩单快照 · 2026-03",
    courses: [
      { id: "H23-01", title: "军事技能训练", credits: 1, result: "88", kind: "numeric" },
      { id: "H23-02", title: "中国近现代史纲要", credits: 3, result: "86", kind: "numeric" },
      { id: "H23-03", title: "高等数学 I A", credits: 5.5, result: "75", kind: "numeric", tags: ["数学"] },
      { id: "H23-04", title: "光学", credits: 3, result: "68", kind: "numeric", tags: ["物理"] },
      { id: "H23-05", title: "大学生职业发展与就业指导 A", credits: 0.5, result: "90", kind: "numeric" },
      { id: "H23-06", title: "心理健康教育 A", credits: 0.5, result: "88", kind: "numeric" },
      { id: "H23-07", title: "艺术散步", credits: 1, result: "100", kind: "numeric" },
      { id: "H23-08", title: "体育 I", credits: 1, result: "83", kind: "numeric" },
      { id: "H23-09", title: "应用物理学专业导论课", credits: 1, result: "75", kind: "numeric", tags: ["物理"] },
      { id: "H23-10", title: "大学英语基础模块 A", credits: 2, result: "80", kind: "numeric" },
      { id: "H23-11", title: "国家安全教育", credits: 1, result: "90", kind: "numeric" },
      { id: "H23-12", title: "美式课堂 I", credits: 0.5, result: "96", kind: "numeric" },
    ],
  },
  {
    id: "hebut-2024-spring",
    institution: "HEBUT",
    label: "2023-2024 春",
    season: "FOUNDATION RUN · 第二赛季",
    attemptedCredits: 35.5,
    earnedCredits: 35.5,
    sourceLabel: "脱敏 HEBUT 成绩单快照 · 2026-03",
    courses: [
      { id: "H24S-01", title: "马克思主义基本原理", credits: 3, result: "87", kind: "numeric" },
      { id: "H24S-02", title: "激光加工创新训练", credits: 1, result: "97", kind: "numeric", tags: ["实验"] },
      { id: "H24S-03", title: "体育 II", credits: 1, result: "64", kind: "numeric" },
      { id: "H24S-04", title: "工程训练 III", credits: 2, result: "93", kind: "numeric", tags: ["工程"] },
      { id: "H24S-05", title: "形势与政策 A", credits: 0.5, result: "94", kind: "numeric" },
      { id: "H24S-06", title: "军事理论", credits: 1, result: "90", kind: "numeric" },
      { id: "H24S-07", title: "思想道德与法治", credits: 3, result: "89", kind: "numeric" },
      { id: "H24S-08", title: "力学（双语）", credits: 3, result: "65", kind: "numeric", tags: ["物理"] },
      { id: "H24S-09", title: "美式课堂 II", credits: 0.5, result: "97", kind: "numeric" },
      { id: "H24S-10", title: "R 语言基础编程与统计分析", credits: 2, result: "91", kind: "numeric", tags: ["编程"] },
      { id: "H24S-11", title: "中国传统文化导读", credits: 1, result: "74", kind: "numeric" },
      { id: "H24S-12", title: "高等数学 I B", credits: 5.5, result: "70", kind: "numeric", tags: ["数学"] },
      { id: "H24S-13", title: "普通物理实验 A", credits: 2, result: "中等", kind: "qualitative", tags: ["实验"] },
      { id: "H24S-14", title: "形势与政策 B", credits: 0.5, result: "94", kind: "numeric" },
      { id: "H24S-15", title: "创业基础", credits: 1, result: "95", kind: "numeric" },
      { id: "H24S-16", title: "劳动通论", credits: 1, result: "99", kind: "numeric" },
      { id: "H24S-17", title: "学术英语 B", credits: 3.5, result: "75", kind: "numeric" },
      { id: "H24S-18", title: "计算思维与程序设计", credits: 4, result: "65", kind: "numeric", tags: ["编程"] },
    ],
  },
  {
    id: "hebut-2024-fall",
    institution: "HEBUT",
    label: "2024-2025 秋",
    season: "LAB BUILD · 第三赛季",
    attemptedCredits: 25.5,
    earnedCredits: 25.5,
    sourceLabel: "脱敏 HEBUT 成绩单快照 · 2026-03",
    courses: [
      { id: "H24F-01", title: "物理实验与自主创新训练", credits: 2, result: "90", kind: "numeric", tags: ["实验"] },
      { id: "H24F-02", title: "体育 III", credits: 1, result: "78", kind: "numeric" },
      { id: "H24F-03", title: "形势与政策 C", credits: 0.5, result: "88", kind: "numeric" },
      { id: "H24F-04", title: "普通物理实验 B", credits: 2, result: "良好", kind: "qualitative", tags: ["实验"] },
      { id: "H24F-05", title: "电子电路基础", credits: 4, result: "80", kind: "numeric", tags: ["电路"] },
      { id: "H24F-06", title: "声乐作品赏析与实践", credits: 1, result: "93", kind: "numeric" },
      { id: "H24F-07", title: "合唱指挥", credits: 0.5, result: "93", kind: "numeric" },
      { id: "H24F-08", title: "毛泽东思想和中国特色社会主义理论体系概论", credits: 3, result: "88", kind: "numeric" },
      { id: "H24F-09", title: "线性代数", credits: 2, result: "81", kind: "numeric", tags: ["数学"] },
      { id: "H24F-10", title: "新中国史", credits: 1, result: "92", kind: "numeric" },
      { id: "H24F-11", title: "学术英语写作 A", credits: 3, result: "92", kind: "numeric", tags: ["写作"] },
      { id: "H24F-12", title: "液晶器件原理与测试技术", credits: 4, result: "80", kind: "numeric", tags: ["器件"] },
      { id: "H24F-13", title: "音乐名作", credits: 0.5, result: "93", kind: "numeric" },
      { id: "H24F-14", title: "舞蹈形体训练与赏析", credits: 1, result: "93", kind: "numeric" },
    ],
  },
  {
    id: "hebut-2025-spring",
    institution: "HEBUT",
    label: "2024-2025 春",
    season: "SYSTEM TURN · 第四赛季",
    attemptedCredits: 29.5,
    earnedCredits: 29.5,
    sourceLabel: "脱敏 HEBUT 成绩单快照 · 2026-03",
    courses: [
      { id: "H25S-01", title: "“硬壳科技”创新创业训练营课程", credits: 2, result: "94", kind: "numeric", tags: ["创新"] },
      { id: "H25S-02", title: "体育 IV", credits: 1, result: "82", kind: "numeric" },
      { id: "H25S-03", title: "形势与政策 D", credits: 0.5, result: "95", kind: "numeric" },
      { id: "H25S-04", title: "心理健康教育 B", credits: 0.5, result: "90", kind: "numeric" },
      { id: "H25S-05", title: "热学", credits: 2, result: "83", kind: "numeric", tags: ["物理"] },
      { id: "H25S-06", title: "学术英语写作 B", credits: 3, result: "92", kind: "numeric", tags: ["写作"] },
      { id: "H25S-07", title: "习近平总书记关于科技创新的重要论述", credits: 1, result: "86", kind: "numeric" },
      { id: "H25S-08", title: "习近平新时代中国特色社会主义思想概论", credits: 3, result: "82", kind: "numeric" },
      { id: "H25S-09", title: "概率论与数理统计", credits: 3, result: "88", kind: "numeric", tags: ["数学"] },
      { id: "H25S-10", title: "大学生职业发展与就业指导 B", credits: 0.5, result: "98", kind: "numeric" },
      { id: "H25S-11", title: "数学物理方法", credits: 4, result: "78", kind: "numeric", tags: ["数学", "物理"] },
      { id: "H25S-12", title: "电磁学（双语）", credits: 4, result: "84", kind: "numeric", tags: ["物理"] },
      { id: "H25S-13", title: "学术英语写作 C", credits: 3, result: "97", kind: "numeric", tags: ["写作"] },
      { id: "H25S-14", title: "近代物理实验 A", credits: 2, result: "优秀", kind: "qualitative", tags: ["实验"] },
    ],
  },
  {
    id: "hebut-2025-fall",
    institution: "HEBUT",
    label: "2025-2026 秋",
    season: "COMPUTE THE WORLD · 第五赛季",
    attemptedCredits: 18,
    earnedCredits: 18,
    sourceLabel: "脱敏 HEBUT 成绩单快照 · 2026-03",
    courses: [
      { id: "H25F-01", title: "CUPEC 指导", credits: 2, result: "优秀", kind: "qualitative", tags: ["实验"] },
      { id: "H25F-02", title: "计算物理学", credits: 2, result: "81", kind: "numeric", tags: ["计算", "物理"] },
      { id: "H25F-03", title: "单片机原理及应用", credits: 2, result: "71", kind: "numeric", tags: ["嵌入式"] },
      { id: "H25F-04", title: "原子物理学", credits: 3, result: "76", kind: "numeric", tags: ["物理"] },
      { id: "H25F-05", title: "液晶器件工艺与材料", credits: 2, result: "97", kind: "numeric", tags: ["器件"] },
      { id: "H25F-06", title: "计算物理学上机", credits: 1, result: "优秀", kind: "qualitative", tags: ["计算", "编程"] },
      { id: "H25F-07", title: "液晶物理", credits: 4, result: "73", kind: "numeric", tags: ["物理", "器件"] },
      { id: "H25F-08", title: "近代物理实验 B", credits: 2, result: "优秀", kind: "qualitative", tags: ["实验"] },
    ],
  },
  {
    id: "uarizona-2023-fall",
    institution: "UArizona",
    label: "Fall 2023",
    season: "GLOBAL WILDCAT I",
    termGpa: "P/F",
    attemptedCredits: 0.5,
    earnedCredits: 0.5,
    sourceLabel: "脱敏 UArizona 非官方成绩单快照 · 2026-03",
    courses: [
      { id: "HED 102A", title: "Succeeding: Global Wildcat I", credits: 0.5, result: "P", kind: "pass" },
    ],
  },
  {
    id: "uarizona-2024-spring",
    institution: "UArizona",
    label: "Spring 2024",
    season: "GLOBAL WILDCAT II",
    termGpa: "P/F",
    attemptedCredits: 0.5,
    earnedCredits: 0.5,
    sourceLabel: "脱敏 UArizona 非官方成绩单快照 · 2026-03",
    courses: [
      { id: "HED 102B", title: "Succeeding: Global Wildcat II", credits: 0.5, result: "P", kind: "pass" },
    ],
  },
  {
    id: "uarizona-2024-fall",
    institution: "UArizona",
    label: "Fall 2024",
    season: "ACADEMIC WRITING RUN",
    termGpa: "4.00",
    attemptedCredits: 6,
    earnedCredits: 6,
    sourceLabel: "脱敏 UArizona 非官方成绩单快照 · 2026-03",
    courses: [
      { id: "ENGL 106", title: "Foundations Writing English Additional Language", credits: 3, result: "A", kind: "letter", tags: ["写作"] },
      { id: "ENGL 107", title: "Foundations Writing English Additional Language", credits: 3, result: "A", kind: "letter", tags: ["写作"] },
    ],
  },
  {
    id: "uarizona-2025-spring",
    institution: "UArizona",
    label: "Spring 2025",
    season: "PHYSICS CROSSOVER",
    termGpa: "3.00",
    attemptedCredits: 9,
    earnedCredits: 9,
    sourceLabel: "脱敏 UArizona 非官方成绩单快照 · 2026-03",
    courses: [
      { id: "ENGL 108", title: "Foundations Writing English Additional Language", credits: 3, result: "A", kind: "letter", tags: ["写作"] },
      { id: "PHYS 204", title: "Mathematical Techniques in Physics", credits: 3, result: "C", kind: "letter", tags: ["数学", "物理"] },
      { id: "PHYS 240", title: "Introduction to Electricity and Magnetism", credits: 3, result: "B", kind: "letter", tags: ["物理"] },
    ],
  },
  {
    id: "uarizona-2025-fall",
    institution: "UArizona",
    label: "Fall 2025",
    season: "ROUTE CHANGE",
    termGpa: "—",
    attemptedCredits: 0,
    earnedCredits: 0,
    sourceLabel: "脱敏 UArizona 非官方成绩单快照 · 2026-03",
    courses: [
      { id: "PHYS 321", title: "Theoretical Mechanics", credits: 0, result: "WC", kind: "withdrawal", tags: ["物理"] },
    ],
  },
];

export const ACADEMIC_EVIDENCE_MOMENTS: AcademicEvidenceMoment[] = [
  {
    id: "evidence-youngs-modulus",
    period: "2025",
    title: "杨氏模量光学测量仪",
    role: "实验原理与 C# / WinUI 3 软件",
    evidence: "全国大学生物理实验竞赛三等奖；不公开实验结果原始数据。",
    skills: ["物理实验", "串口", "WinUI 3", "数据可视化"],
    status: "verified",
  },
  {
    id: "evidence-rescue-robot",
    period: "2024",
    title: "Raspberry Pi 5 智能救援机器人",
    role: "除视觉代码外的软件集成与控制链联调",
    evidence: "省级工程实践与创新能力大赛智能救援赛项二等奖。",
    skills: ["Linux", "GPIO/I2C/SPI", "OpenCV 集成", "执行器控制"],
    status: "verified",
  },
  {
    id: "evidence-smart-car",
    period: "2024",
    title: "第十九届智能车视觉组",
    role: "PCB 设计与焊接",
    evidence: "区域赛视觉甲组二等奖；不把主程序与视觉算法归为个人贡献。",
    skills: ["PCB", "焊接", "嵌入式联调"],
    status: "verified",
  },
  {
    id: "evidence-lumi",
    period: "2026",
    title: "Lumi Buddy 8051",
    role: "图形时钟课程项目",
    evidence: "Keil 构建 0 warning / 0 error；温度为模拟显示。",
    skills: ["8051", "LCD12864", "DS1302", "GPIO"],
    status: "verified",
  },
  {
    id: "evidence-bohack",
    period: "2026",
    title: "BoHack / projectLETTER",
    role: "42 小时多端协同原型",
    evidence: "已核验参与经历；不使用旧材料中的 48h、前三或五仓库说法。",
    skills: ["产品协作", "多端原型", "快速交付"],
    status: "verified",
  },
  {
    id: "evidence-opencamp",
    period: "2026-现在",
    title: "OpenCamp 操作系统方向科研 / 训练",
    role: "学习进行中",
    evidence: "可以陈述方向与状态；尚无公开成果时不写“已完成”。",
    skills: ["Rust 学习中", "rCore/ArceOS 学习中", "系统软件"],
    status: "in_progress",
  },
];

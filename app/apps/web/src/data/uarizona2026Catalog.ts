export type UArizonaScheduleSection = {
  term: "Spring 2026" | "Fall 2026";
  section: string;
  component: "Lecture";
  units: number;
  enrollmentStatus: "Open" | "Closed" | "Wait List";
  capacity: number;
  enrolled: number;
  days: string | null;
  time: string | null;
  instructor: string;
  hasScheduledTime: boolean;
};

export type UArizonaCourseSnapshot = {
  id: string;
  subject: string;
  catalogNumber: string;
  title: string;
  titleZh: string;
  shortTitle: string;
  officialDescription: string;
  summaryZh: string;
  offeredTerms: Array<"Spring 2026" | "Fall 2026">;
  detailUrl: string;
  sections: UArizonaScheduleSection[];
  fitTags: string[];
  fitNarrative: string;
  unknowns: string[];
};

export const UARIZONA_2026_CATALOG_SOURCE = {
  id: "uarizona-public-courses-2026",
  label: "UArizona 2026 全年公开课程快照",
  capturedAt: "2026-07-24T21:14:56+08:00",
  sourceSystem: "University of Arizona Courses public API",
  workbookRows: 57_857,
  uniqueCourses: 11_347,
  descriptionCoverage: "9,962 / 11,347",
  terms: [
    "Winter 2025-26",
    "Spring 2026",
    "Summer 2026",
    "Fall 2026",
  ],
  boundary:
    "开课状态、容量和教师来自公开时间窗快照，可能变化；地点需要 UAccess 登录，未写入演示数据。课程目录不是南同学的修课记录。",
} as const;

export const UARIZONA_2026_COURSES: UArizonaCourseSnapshot[] = [
  {
    id: "AME 455",
    subject: "AME",
    catalogNumber: "455",
    title: "Control System Design",
    titleZh: "控制系统设计",
    shortTitle: "Control Systems",
    officialDescription:
      "Mathematical modeling of dynamical systems, hardware and software issues; computer simulations; classical control methods including transient response, steady-state errors, Bode diagrams, root locus and design of closed-loop control systems; introduction to state feedback design and digital control.",
    summaryZh:
      "从动态系统建模、仿真和经典控制一路推进到状态反馈与数字控制，适合把物理建模、实验测量和执行器控制串成闭环。",
    offeredTerms: ["Spring 2026", "Fall 2026"],
    detailUrl:
      "https://uacourses-api.uaccess.arizona.edu/crsdetail?subject_code=AME&catalog_nbr=455",
    sections: [
      {
        term: "Spring 2026",
        section: "001",
        component: "Lecture",
        units: 3,
        enrollmentStatus: "Closed",
        capacity: 80,
        enrolled: 80,
        days: "MoWe",
        time: "17:30-18:45",
        instructor: "Hossein Rastgoftar",
        hasScheduledTime: true,
      },
      {
        term: "Fall 2026",
        section: "001",
        component: "Lecture",
        units: 3,
        enrollmentStatus: "Open",
        capacity: 48,
        enrolled: 43,
        days: "MoWe",
        time: "17:00-18:15",
        instructor: "Ahmed Abdelmawgoud",
        hasScheduledTime: true,
      },
      {
        term: "Fall 2026",
        section: "015",
        component: "Lecture",
        units: 3,
        enrollmentStatus: "Open",
        capacity: 35,
        enrolled: 0,
        days: null,
        time: null,
        instructor: "Staff",
        hasScheduledTime: false,
      },
    ],
    fitTags: ["控制", "动态系统", "仿真", "机器人"],
    fitNarrative:
      "与南同学的物理建模、智能车、救援机器人和“控制链可观测性”方向直接相连。",
    unknowns: ["考核构成", "先修课核验结果", "具体实验平台", "Fall 015 上课时间"],
  },
  {
    id: "AME 551",
    subject: "AME",
    catalogNumber: "551",
    title:
      "Introductory Robotics: Kinematics, Dynamics, and Path Planning",
    titleZh: "机器人学导论：运动学、动力学与路径规划",
    shortTitle: "Introductory Robotics",
    officialDescription:
      "Foundations of autonomous robot control, including classical and probabilistic path planning, heuristic algorithms, kinematic and dynamic models, trajectory planning, and closed-loop robot control.",
    summaryZh:
      "覆盖自主机器人控制、路径规划、运动学与动力学模型、轨迹规划和闭环控制；目录显示为 500 级课程。",
    offeredTerms: ["Fall 2026"],
    detailUrl:
      "https://uacourses-api.uaccess.arizona.edu/crsdetail?subject_code=AME&catalog_nbr=551",
    sections: [
      {
        term: "Fall 2026",
        section: "001",
        component: "Lecture",
        units: 3,
        enrollmentStatus: "Open",
        capacity: 19,
        enrolled: 11,
        days: "TuTh",
        time: "14:00-15:15",
        instructor: "Eniko Enikov",
        hasScheduledTime: true,
      },
      {
        term: "Fall 2026",
        section: "201",
        component: "Lecture",
        units: 3,
        enrollmentStatus: "Open",
        capacity: 10,
        enrolled: 1,
        days: null,
        time: null,
        instructor: "Eniko Enikov",
        hasScheduledTime: false,
      },
    ],
    fitTags: ["机器人", "路径规划", "动力学", "闭环控制"],
    fitNarrative:
      "方向高度匹配，但课程层级较高；应先核对先修资格，而不是仅凭兴趣判定可选。",
    unknowns: ["先修资格", "本科生选课权限", "考核方式", "Section 201 时间"],
  },
  {
    id: "CSC 280",
    subject: "CSC",
    catalogNumber: "280",
    title: "Introduction to Artificial Intelligence",
    titleZh: "人工智能导论",
    shortTitle: "Intro to AI",
    officialDescription:
      "An introduction to intelligent technology, scientific questions about intelligence, mathematical and computational approaches, human interaction factors, and societal benefits and risks of AI deployment.",
    summaryZh:
      "从智能的科学问题、数学与计算方法、人机交互，到 AI 部署的社会收益与风险，提供跨专业基础。",
    offeredTerms: ["Fall 2026"],
    detailUrl:
      "https://uacourses-api.uaccess.arizona.edu/crsdetail?subject_code=CSC&catalog_nbr=280",
    sections: [
      {
        term: "Fall 2026",
        section: "001",
        component: "Lecture",
        units: 3,
        enrollmentStatus: "Open",
        capacity: 75,
        enrolled: 54,
        days: "TuTh",
        time: "15:30-16:45",
        instructor: "Eduardo Blanco",
        hasScheduledTime: true,
      },
    ],
    fitTags: ["AI 基础", "人机交互", "社会影响"],
    fitNarrative:
      "适合给本地模型服务与推荐系统补齐基础概念、风险意识和人机交互视角。",
    unknowns: ["作业形式", "编程语言", "先修要求", "候补规则"],
  },
  {
    id: "CSC 352",
    subject: "CSC",
    catalogNumber: "352",
    title: "Systems Programming and Unix",
    titleZh: "系统编程与 Unix",
    shortTitle: "Systems Programming + Unix",
    officialDescription:
      "Programming in C, including arrays, lists, stacks, queues, trees, and bit manipulation. Unix topics include debuggers, makefiles, shell programming, and other topics that support systems programming.",
    summaryZh:
      "以 C 语言、数据结构、位操作、调试器、Makefile 与 Shell 为核心，补足进入操作系统与机器人底层软件前的系统编程地基。",
    offeredTerms: ["Spring 2026", "Fall 2026"],
    detailUrl:
      "https://uacourses-api.uaccess.arizona.edu/crsdetail?subject_code=CSC&catalog_nbr=352",
    sections: [
      {
        term: "Spring 2026",
        section: "001",
        component: "Lecture",
        units: 3,
        enrollmentStatus: "Open",
        capacity: 160,
        enrolled: 116,
        days: "TuTh",
        time: "14:00-15:15",
        instructor: "Eric Anson",
        hasScheduledTime: true,
      },
      {
        term: "Fall 2026",
        section: "001",
        component: "Lecture",
        units: 3,
        enrollmentStatus: "Open",
        capacity: 140,
        enrolled: 81,
        days: "TuTh",
        time: "15:30-16:45",
        instructor: "Eric Anson",
        hasScheduledTime: true,
      },
    ],
    fitTags: ["C", "Unix", "调试", "系统编程"],
    fitNarrative:
      "与 Rust/OS 学习互补，能把已有嵌入式经验补成更扎实的系统编程证据。",
    unknowns: ["先修课程", "作业强度", "实验环境", "是否允许替代课程"],
  },
  {
    id: "CSC 452",
    subject: "CSC",
    catalogNumber: "452",
    title: "Principles of Operating Systems",
    titleZh: "操作系统原理",
    shortTitle: "Operating Systems",
    officialDescription:
      "Concepts of modern operating systems; concurrent processes; process synchronization and communication; resource allocation; kernels; deadlock; memory management; file systems.",
    summaryZh:
      "现代操作系统核心：并发进程、同步与通信、资源分配、内核、死锁、内存管理和文件系统。",
    offeredTerms: ["Spring 2026", "Fall 2026"],
    detailUrl:
      "https://uacourses-api.uaccess.arizona.edu/crsdetail?subject_code=CSC&catalog_nbr=452",
    sections: [
      {
        term: "Spring 2026",
        section: "001",
        component: "Lecture",
        units: 3,
        enrollmentStatus: "Open",
        capacity: 75,
        enrolled: 41,
        days: "TuTh",
        time: "15:30-16:45",
        instructor: "Jonathan Misurda",
        hasScheduledTime: true,
      },
      {
        term: "Fall 2026",
        section: "001",
        component: "Lecture",
        units: 3,
        enrollmentStatus: "Wait List",
        capacity: 82,
        enrolled: 82,
        days: "TuTh",
        time: "12:30-13:45",
        instructor: "Russell Lewis",
        hasScheduledTime: true,
      },
    ],
    fitTags: ["操作系统", "内核", "并发", "内存"],
    fitNarrative:
      "与 OpenCamp、rCore/ArceOS 和机器人运行时方向最直接；但应先补齐系统编程和先修核验。",
    unknowns: ["先修资格", "项目制比例", "内核实验环境", "候补转正概率"],
  },
  {
    id: "CSC 480",
    subject: "CSC",
    catalogNumber: "480",
    title: "Principles of Machine Learning",
    titleZh: "机器学习原理",
    shortTitle: "Machine Learning",
    officialDescription:
      "Fundamental frameworks, computational methods, and algorithms underlying machine learning practice, including advantages and unique risks of data-adaptive prediction and decision systems.",
    summaryZh:
      "解释机器学习为何不同于传统编程，并覆盖数据驱动预测、决策、核心算法、优势和独特风险。",
    offeredTerms: ["Spring 2026", "Fall 2026"],
    detailUrl:
      "https://uacourses-api.uaccess.arizona.edu/crsdetail?subject_code=CSC&catalog_nbr=480",
    sections: [
      {
        term: "Spring 2026",
        section: "001",
        component: "Lecture",
        units: 3,
        enrollmentStatus: "Open",
        capacity: 40,
        enrolled: 18,
        days: "MoWe",
        time: "09:30-10:45",
        instructor: "Chicheng Zhang",
        hasScheduledTime: true,
      },
      {
        term: "Fall 2026",
        section: "001",
        component: "Lecture",
        units: 3,
        enrollmentStatus: "Open",
        capacity: 40,
        enrolled: 39,
        days: "MoWe",
        time: "17:00-18:15",
        instructor: "Jason Pacheco",
        hasScheduledTime: true,
      },
    ],
    fitTags: ["机器学习", "算法", "模型风险", "数据"],
    fitNarrative:
      "适合支撑推荐与本地模型评估，但不是操作系统与机器人主线的唯一前置，应与系统课程平衡。",
    unknowns: ["数学先修", "编程框架", "考核构成", "Fall 剩余席位时效"],
  },
];

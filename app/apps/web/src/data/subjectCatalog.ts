export type SubjectCatalogEntry = {
  id: string;
  title: string;
  category:
    | "数理基础"
    | "物理与化学"
    | "电子与工程"
    | "计算与数据"
    | "语言与学术发展";
  kind: "课程" | "资料包" | "项目 / 专题";
  sourceGroup: string;
  sourceState: "root_readme" | "directory_mapped";
  sourceRef: string;
};

const entry = (
  id: string,
  title: string,
  category: SubjectCatalogEntry["category"],
  kind: SubjectCatalogEntry["kind"],
  sourceGroup = id,
  sourceState: SubjectCatalogEntry["sourceState"] = "directory_mapped",
): SubjectCatalogEntry => ({
  id,
  title,
  category,
  kind,
  sourceGroup,
  sourceState,
  sourceRef: `subject-shortcut:${sourceGroup}:2026-07-24`,
});

/**
 * Read-only snapshot of D:/10451/Desktop/学科 shortcut labels.
 *
 * This is a discovery catalog, not an enrollment transcript. It intentionally
 * stores neither local target paths nor personal academic records.
 */
export const SUBJECT_CATALOG: readonly SubjectCatalogEntry[] = [
  entry("office-skills", "办公软件实战与晋级", "计算与数据", "资料包"),
  entry("standard-program", "标准程序", "电子与工程", "项目 / 专题"),
  entry("bohr", "波尔", "物理与化学", "项目 / 专题"),
  entry("sensors", "传感器与检测技术", "电子与工程", "课程"),
  entry("university-physics", "大学物理", "物理与化学", "课程", "university-physics"),
  entry("university-physics-ia", "大学物理 IA", "物理与化学", "课程", "university-physics"),
  entry("microcontroller", "单片机原理及应用", "电子与工程", "课程"),
  entry("electromagnetism", "电磁学", "物理与化学", "课程"),
  entry("electrodynamics", "电动力学", "物理与化学", "课程"),
  entry("interview-materials", "复试、夏令营与学术面试", "语言与学术发展", "资料包", "interview-materials", "root_readme"),
  entry("probability", "概率论", "数理基础", "课程", "probability", "root_readme"),
  entry("probability-statistics", "概率论与数理统计", "数理基础", "课程"),
  entry("advanced-mathematics", "高等数学", "数理基础", "课程", "advanced-mathematics", "root_readme"),
  entry("solid-state-physics", "固体物理", "物理与化学", "课程"),
  entry("optoelectronics", "光电子", "电子与工程", "课程"),
  entry("chemistry", "化学", "物理与化学", "课程", "chemistry", "root_readme"),
  entry("integrated-circuits", "集成电路", "电子与工程", "课程"),
  entry("computational-physics", "计算物理学", "数理基础", "课程"),
  entry("modern-physics-lab-b", "近代物理实验 B", "物理与化学", "课程"),
  entry("postgraduate-study", "考研课程", "语言与学术发展", "资料包", "postgraduate-study", "root_readme"),
  entry("classroom-recordings", "课堂实录", "语言与学术发展", "资料包"),
  entry("theoretical-mechanics", "理论力学", "物理与化学", "课程"),
  entry("quantum-mechanics", "量子力学", "物理与化学", "课程"),
  entry("academic-formatting", "论文格式模板", "语言与学术发展", "资料包"),
  entry("maxwell-equations", "麦克斯韦方程", "物理与化学", "项目 / 专题"),
  entry("final-review", "期末复习", "语言与学术发展", "资料包"),
  entry("thermal-statistical-physics", "热力学与统计物理", "物理与化学", "课程"),
  entry("ai-foundations", "人工智能基础", "计算与数据", "课程"),
  entry("mathematical-analysis-tsinghua", "数学分析 · 清华刘思齐", "数理基础", "课程", "mathematical-analysis-tsinghua", "root_readme"),
  entry("mathematical-physics", "数学物理方法", "数理基础", "课程"),
  entry("statistical-data-modeling", "统计数据建模", "计算与数据", "课程"),
  entry("library-courses", "图书馆相关课程", "语言与学术发展", "资料包"),
  entry("microelectronics", "微电子", "电子与工程", "课程"),
  entry("micro-program", "微专业", "语言与学术发展", "项目 / 专题"),
  entry("physics-lab", "物理实验", "物理与化学", "课程", "university-physics"),
  entry("relativity-quantum", "相对论与量子论", "物理与化学", "课程", "uarizona"),
  entry("liquid-crystal", "液晶", "物理与化学", "项目 / 专题"),
  entry("cet", "英语四六级", "语言与学术发展", "资料包", "cet", "root_readme"),
  entry("uarizona", "原亚利桑那大学课程", "语言与学术发展", "资料包", "uarizona"),
  entry("atomic-physics", "原子物理学", "物理与化学", "课程", "atomic-physics", "root_readme"),
  entry("fortran", "Fortran", "计算与数据", "课程", "fortran", "root_readme"),
  entry("gre", "GRE 词汇与阅读", "语言与学术发展", "资料包", "gre", "root_readme"),
  entry("techwiz", "TechWiz", "电子与工程", "项目 / 专题"),
];

export const SUBJECT_CATALOG_SUMMARY = {
  shortcutEntries: SUBJECT_CATALOG.length,
  uniqueSources: new Set(SUBJECT_CATALOG.map((item) => item.sourceGroup)).size,
  rootReadmes: SUBJECT_CATALOG.filter(
    (item) => item.sourceState === "root_readme",
  ).length,
} as const;

export const SUBJECT_CATEGORIES = [
  "数理基础",
  "物理与化学",
  "电子与工程",
  "计算与数据",
  "语言与学术发展",
] as const satisfies readonly SubjectCatalogEntry["category"][];

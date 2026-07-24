import type { SmartCourseState } from "./types";

export const SMARTCOURSE_FIXTURE: SmartCourseState = {
  schemaVersion: "1.0.0",
  dataMode: "fixture",
  step: "source",
  materialLoaded: false,
  material: {
    id: "material-sls-demo-001",
    courseId: "course-sls-demo",
    title: "信号与线性系统 · RC / RLC 频率响应",
    filename: "SLS240_authorized_demo_extract.pdf",
    format: "PDF",
    sizeLabel: "2.4 MB",
    rightsStatus: "authorized_demo",
    sha256: "d7f8b9c1…6e42",
    uploadedBy: "teacher-fixture",
    parseStatus: "ready",
    retention: "仅用于本地演示；赛后 7 日复核",
  },
  sources: [
    {
      id: "source-sls-slide-012",
      locator: "PDF · 第 12 页",
      sourceType: "slide",
      title: "一阶 RC 低通网络",
      quote:
        "截止频率由时间常数 RC 决定；测量前应确认拓扑、输出节点和单位。",
      signal: "S",
      valid: true,
    },
    {
      id: "source-sls-transcript-004",
      locator: "讲解转写 · 00:08:14—00:08:42",
      sourceType: "transcript",
      title: "解析、仿真与实测的差异",
      quote:
        "把元件公差、仪器输入阻抗和采样边界写进误差表，再比较三条波形。",
      signal: "A",
      valid: true,
    },
    {
      id: "source-sls-handout-003",
      locator: "实验讲义 · §3.2",
      sourceType: "handout",
      title: "Bode 图核验步骤",
      quote:
        "先核对幅频与相频的拐点，再解释非理想元件和测量链带来的偏差。",
      signal: "B",
      valid: true,
    },
  ],
  objects: [
    {
      id: "generated-sls-quiz-001",
      kind: "quiz",
      title: "理解检查 · 截止频率",
      body:
        "若电阻 R 保持不变而电容 C 增大，一阶 RC 低通的截止频率会怎样变化？",
      sourceIds: ["source-sls-slide-012"],
      evidenceStatus: "supported",
      unknowns: [],
      generationMode: "fixture",
      generatorVersion: "smartcourse-fixture-v1",
      status: "review",
      revision: 1,
    },
    {
      id: "generated-sls-explanation-001",
      kind: "explanation",
      title: "赛后解析 · 三条波形",
      body:
        "解析解、仿真与实测不一致时，应先核对拓扑、参数、单位和初始条件，再检查元件公差、仪器负载与采样边界。",
      sourceIds: [
        "source-sls-slide-012",
        "source-sls-transcript-004",
      ],
      evidenceStatus: "supported",
      unknowns: ["当前 Fixture 未包含实测仪器型号"],
      generationMode: "fixture",
      generatorVersion: "smartcourse-fixture-v1",
      status: "review",
      revision: 1,
    },
    {
      id: "generated-sls-card-001",
      kind: "review_card",
      title: "复习卡 · Bode 拐点",
      body:
        "先标出理论拐点，再用幅频、相频和误差表说明非理想因素。",
      sourceIds: ["source-sls-handout-003"],
      evidenceStatus: "supported",
      unknowns: [],
      generationMode: "fixture",
      generatorVersion: "smartcourse-fixture-v1",
      status: "review",
      revision: 1,
    },
    {
      id: "generated-sls-hint-001",
      kind: "hint",
      title: "提示 · 不要先怪仿真器",
      body:
        "先写清输出节点、参数单位和初始条件，再判断模型或仪器是否有问题。",
      sourceIds: ["source-sls-slide-012", "source-sls-handout-003"],
      evidenceStatus: "supported",
      unknowns: [],
      generationMode: "fixture",
      generatorVersion: "smartcourse-fixture-v1",
      status: "review",
      revision: 1,
    },
    {
      id: "generated-sls-scene-001",
      kind: "scene",
      title: "场景 · Film Room 对照",
      body:
        "同屏查看解析曲线、仿真曲线与测量曲线，并逐项点亮误差来源。",
      sourceIds: [
        "source-sls-transcript-004",
        "source-sls-handout-003",
      ],
      evidenceStatus: "partial",
      unknowns: ["三条示例曲线为演示占位，不是实验实测数据"],
      generationMode: "fixture",
      generatorVersion: "smartcourse-fixture-v1",
      status: "review",
      revision: 1,
    },
  ],
  selectedObjectId: "generated-sls-quiz-001",
  events: [],
  publication: null,
  interaction: null,
};

export const STUDENT_QUESTION = {
  prompt:
    "若 R 保持不变而 C 增大，一阶 RC 低通的截止频率会怎样变化？",
  options: [
    { id: "increase", label: "升高" },
    { id: "decrease", label: "降低" },
    { id: "same", label: "保持不变" },
  ],
  correctAnswer: "decrease",
  explanation:
    "截止频率 fc = 1 / (2πRC)。R 不变、C 增大时，分母增大，因此截止频率降低。",
  sourceIds: ["source-sls-slide-012"],
} as const;

import type { WorldExamFixture } from "./types";

export const WORLD_EXAM_FIXTURE: WorldExamFixture = {
  schemaVersion: "1.0.0",
  dataMode: "fixture",
  studentId: "student-nan-fixture",
  courseId: "signal-linear-systems",
  sourceBoundary:
    "本模块只复用 F-001 已审核 Fixture 的对象与来源 ID；时间、准备状态、答题和建议均为本地演示，不是正式考试或成绩。",
  event: {
    id: "exam-sls-finals-fixture",
    courseId: "signal-linear-systems",
    title: "信号与线性系统 · 模拟期末",
    eventType: "final",
    scheduledAt: "2026-07-31T14:00:00+08:00",
    durationMinutes: 45,
    status: "briefing_open",
    isFormal: false,
    sourceAuthority: "fixture",
  },
  briefing: {
    scopeSummary:
      "从一阶 RC 低通出发，解释截止频率、Bode 拐点，以及解析、仿真和测量波形不一致时的核验顺序。",
    sources: [
      {
        sourceId: "source-sls-slide-012",
        coverage: "截止频率、拓扑、输出节点与单位",
      },
      {
        sourceId: "source-sls-transcript-004",
        coverage: "解析、仿真、实测差异与误差表",
      },
      {
        sourceId: "source-sls-handout-003",
        coverage: "Bode 图、非理想因素与复核顺序",
      },
    ],
    competencyTargets: [
      "从 RC 参数判断截止频率变化",
      "用明确边界解释三条波形差异",
      "识别没有来源支撑的 AI 断言",
    ],
    availableResources: [
      "教师批准理解检查",
      "Bode 拐点复习卡",
      "三条波形赛后解析",
    ],
    readiness: {
      coveragePct: 67,
      weakAreas: ["仪器负载与元件公差"],
      unknownAreas: ["当前 Fixture 未包含真实仪器型号"],
    },
  },
  warmup: {
    id: "warmup-sls-cutoff",
    objectId: "generated-sls-quiz-001",
    prompt:
      "若电阻 R 保持不变而电容 C 增大，一阶 RC 低通的截止频率会怎样变化？",
    options: [
      { id: "increase", label: "升高" },
      { id: "decrease", label: "降低" },
      { id: "same", label: "保持不变" },
    ],
    correctAnswer: "decrease",
    explanation:
      "fc = 1 / (2πRC)。R 不变、C 增大时分母增大，因此截止频率降低。",
    sourceIds: ["source-sls-slide-012"],
  },
  playbook: [
    {
      id: "section-foundation",
      title: "第一节 · 模型边界",
      knowledgePoints: ["拓扑", "输出节点", "参数与单位", "初始条件"],
      items: [
        {
          id: "item-cutoff-check",
          objectId: "generated-sls-quiz-001",
          title: "理解检查 · 截止频率",
          estimatedMinutes: 4,
          sourceIds: ["source-sls-slide-012"],
        },
        {
          id: "item-model-hint",
          objectId: "generated-sls-hint-001",
          title: "提示 · 先确认模型再判断工具",
          estimatedMinutes: 3,
          sourceIds: [
            "source-sls-slide-012",
            "source-sls-handout-003",
          ],
        },
      ],
    },
    {
      id: "section-evidence",
      title: "第二节 · 三条波形",
      knowledgePoints: ["解析解", "仿真", "实测", "误差表"],
      items: [
        {
          id: "item-waveform-explanation",
          objectId: "generated-sls-explanation-001",
          title: "赛后解析 · 三条波形",
          estimatedMinutes: 6,
          sourceIds: [
            "source-sls-slide-012",
            "source-sls-transcript-004",
          ],
        },
      ],
    },
    {
      id: "section-bode",
      title: "第三节 · 频域复核",
      knowledgePoints: ["幅频", "相频", "拐点", "非理想因素"],
      items: [
        {
          id: "item-bode-card",
          objectId: "generated-sls-card-001",
          title: "复习卡 · Bode 拐点",
          estimatedMinutes: 5,
          sourceIds: ["source-sls-handout-003"],
        },
      ],
    },
  ],
  matchQuestions: [
    {
      id: "match-cutoff",
      objectId: "generated-sls-quiz-001",
      prompt:
        "R 不变、C 增大时，截止频率与 Bode 拐点应如何变化？",
      responseType: "single_choice",
      options: [
        { id: "increase", label: "两者一起升高" },
        { id: "decrease", label: "两者一起降低" },
        { id: "unchanged", label: "两者都不变" },
      ],
      correctAnswer: "decrease",
      sourceIds: ["source-sls-slide-012", "source-sls-handout-003"],
    },
    {
      id: "match-ai-trace",
      objectId: "generated-sls-explanation-001",
      prompt:
        "AI 给出解释：“三条波形不同，说明仿真器算错了。”你应该怎样处理？",
      responseType: "source_challenge",
      options: [
        { id: "accept", label: "直接接受，因为 AI 已经给出结论" },
        {
          id: "challenge",
          label: "挑战断言：先核对拓扑、公差、仪器负载和采样边界",
        },
        { id: "ignore", label: "忽略全部来源，只看最终曲线" },
      ],
      correctAnswer: "challenge",
      sourceIds: [
        "source-sls-slide-012",
        "source-sls-transcript-004",
        "source-sls-handout-003",
      ],
      aiTrace: [
        {
          id: "claim-simulator-wrong",
          claim: "波形不一致足以证明仿真器计算错误。",
          sourceId: "source-sls-transcript-004",
          confidence: "unsupported",
        },
        {
          id: "claim-check-boundaries",
          claim: "应先核对模型边界、元件公差、仪器负载与采样条件。",
          sourceId: "source-sls-transcript-004",
          confidence: "high",
        },
      ],
    },
  ],
};

export type PerformanceStep =
  | "baseline"
  | "trends"
  | "load"
  | "next"
  | "privacy";

export type ConfidenceLevel = "high" | "medium" | "low" | "insufficient";
export type FreshnessState = "fresh" | "warning" | "expired" | "no_expiry";
export type ClimateVariant = "a_numbers" | "b_words" | "c_dimensions";
export type RecommendationStatus =
  | "open"
  | "adopted"
  | "later"
  | "dismissed";

export type MetricDefinition = {
  id: string;
  label: string;
  unit: string;
  definition: string;
  purpose: string;
  limitation: string;
  correctionRoute: string;
  version: string;
  sourceTypes: string[];
  canCorrect: boolean;
  comparisonMode: "self_only";
};

export type TrendPoint = {
  period: string;
  label: string;
  value: number | null;
  status: "observed" | "gap";
};

export type Observation = {
  id: string;
  metricId: string;
  value: number | null;
  displayValue: string;
  rangeLabel: string;
  periodStart: string;
  periodEnd: string;
  updatedAt: string;
  expiresAt: string | null;
  sourceIds: string[];
  confidence: ConfidenceLevel;
  confidenceReason: string;
  dataGaps: string[];
  trend: TrendPoint[];
};

export type AbilityDimension = {
  id: string;
  label: string;
  observedLabel: string;
  description: string;
  sourceIds: string[];
  confidence: ConfidenceLevel;
};

export type LoadSignal = {
  id: string;
  label: string;
  displayValue: string;
  severity: "steady" | "watch" | "high" | "unknown";
  textEquivalent: string;
  sourceIds: string[];
};

export type SupportAction = {
  id: string;
  title: string;
  action: string;
  availability: string;
  sourceId: string;
};

export type PerformanceBadge = {
  id: string;
  title: string;
  subtitle: string;
  criteria: string;
  evidenceIds: string[];
  status: "earned" | "in_progress";
  earnedAt: string | null;
  progressLabel: string;
  private: true;
  affectsRights: false;
};

export type StatusLabel = {
  id: string;
  words: string;
  numberPreview: string;
  basisIds: string[];
  startsAt: string;
  expiresAt: string;
  withdrawnAt: string | null;
  private: true;
  nonMedical: true;
};

export type Recommendation = {
  id: string;
  title: string;
  basisIds: string[];
  cost: string;
  expectedEffect: string;
  alternative: string;
  unknowns: string[];
  generationMode: "rule_fixture";
  status: RecommendationStatus;
};

export type ShareGrant = {
  id: string;
  recipient: string;
  purpose: string;
  dimensionIds: string[];
  grantedAt: string;
  expiresAt: string;
  revokedAt: string | null;
};

export type CorrectionCase = {
  id: string;
  targetId: string;
  reason: string;
  evidenceIds: string[];
  status: "queued_for_human_review" | "resolved" | "withdrawn";
  createdAt: string;
  revision: number;
};

export type HarmSignal = {
  id: string;
  category:
    | "score_misread"
    | "medical_misread"
    | "identity_label"
    | "pressure"
    | "privacy";
  description: string;
  severity: "watch" | "stop";
  status: "open" | "mitigated";
  actionTaken: string;
  createdAt: string;
};

export type PerformanceEvidence = {
  id: string;
  type:
    | "learning_event"
    | "review_object"
    | "academic_mirror"
    | "self_report"
    | "support_directory";
  sourceId: string;
  label: string;
  locator: string;
  updatedAt: string;
  authority: "demo_fixture" | "self_declared";
  freshness: FreshnessState;
  detail: string;
};

export type PerformanceAuditEvent = {
  id: string;
  sequence: number;
  action:
    | "recommendation_action"
    | "share_grant"
    | "share_revoke"
    | "correction_request"
    | "harm_report"
    | "climate_toggle"
    | "offline_fallback"
    | "export";
  targetId: string;
  detail: string;
  occurredAt: string;
  previousEventHash: string | null;
  eventHash: string;
};

export type ClimateResearchGate = {
  status: "deferred_pending_human_evidence";
  defaultVariant: "c_dimensions";
  evidenceCount: 0;
  requiredParticipants: "6-10";
  variants: Array<{
    id: ClimateVariant;
    label: string;
    description: string;
  }>;
  stopConditions: string[];
};

export type PerformanceState = {
  schemaVersion: "1.0.0";
  dataMode: "fixture";
  studentId: "student-nan-fixture";
  privateByDefault: true;
  comparisonMode: "self_only";
  step: PerformanceStep;
  offline: boolean;
  simplified: boolean;
  reducedMotion: boolean;
  selectedMetricId: string;
  climateEnabled: boolean;
  climateVariant: ClimateVariant;
  sourceBoundary: string;
  lastUpdatedAt: string;
  metrics: MetricDefinition[];
  observations: Observation[];
  abilities: AbilityDimension[];
  loadSignals: LoadSignal[];
  supportActions: SupportAction[];
  badges: PerformanceBadge[];
  statusLabel: StatusLabel;
  recommendations: Recommendation[];
  shareGrants: ShareGrant[];
  corrections: CorrectionCase[];
  harmSignals: HarmSignal[];
  evidence: PerformanceEvidence[];
  researchGate: ClimateResearchGate;
  audit: PerformanceAuditEvent[];
  message: string;
};

export type ShareDraft = {
  recipient: string;
  purpose: string;
  durationDays: number;
  dimensionIds: string[];
};

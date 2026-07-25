export type OpportunityCategory =
  | "journal"
  | "conference"
  | "competition"
  | "research"
  | "internship"
  | "scholarship"
  | "workshop"
  | "campus_project";

export type OpportunityScope = "campus" | "external";

export type OpportunityStatus =
  | "active"
  | "expired"
  | "under_review"
  | "reported";

export type EligibilityStatus =
  | "met"
  | "possibly_met"
  | "not_met"
  | "unknown";

export type ProfileFieldKind =
  | "goal"
  | "interest"
  | "availability"
  | "self_declared"
  | "verified_evidence";

export type EvidenceAuthority =
  | "demo_fixture"
  | "self_declared"
  | "verified_fixture";

export type IntentStatus =
  | "saved"
  | "student_interested"
  | "mutual_interest"
  | "withdrawn";

export type ApplicationMirrorStatus =
  | "discovered"
  | "saved"
  | "consented"
  | "applied_externally"
  | "outcome_recorded";

export type OpportunityStage =
  | "market"
  | "eligibility"
  | "match"
  | "exchange"
  | "pathway"
  | "replay";

export interface OpportunityCost {
  amount: number | null;
  currency: "CNY" | "USD" | null;
  description: string;
}

export interface OpportunityRightsGate {
  participantStatus: "demo_participant_fixture" | "confirmed_participant";
  permissionStatus:
    | "pending_official_confirmation"
    | "confirmed_for_project"
    | "not_permitted";
  allowedScope: string[];
  requiredActions: string[];
  noEndorsement: true;
  evidenceUrl: string;
  lastReviewedAt: string;
}

export interface EligibilityRule {
  id: string;
  opportunityId: string;
  fieldId: string;
  operator: "eq" | "gte" | "lte" | "contains" | "includes";
  expectedValue: string | number;
  description: string;
  sourceRef: string;
  required: boolean;
}

export interface Opportunity {
  id: string;
  title: string;
  summary: string;
  provider: string;
  scope: OpportunityScope;
  searchAliases?: string[];
  category: OpportunityCategory;
  packId: string;
  sourceUrl: string;
  sourceVersion: string;
  fetchedAt: string;
  verifiedAt: string | null;
  deadline: string | null;
  location: string;
  cost: OpportunityCost;
  benefits: string[];
  obligations: string[];
  risks: string[];
  eligibilityRuleIds: string[];
  eligibilitySummary: string;
  status: OpportunityStatus;
  correctionRoute: string;
  externalApplicationUrl: string;
  paidRankingFactor: number;
  randomAllocation: boolean;
  auctionEnabled: boolean;
  createdAt: string;
  updatedAt: string;
  rightsGate?: OpportunityRightsGate;
}

export interface OpportunityPack {
  id: string;
  title: string;
  description: string;
  opportunityIds: string[];
  transparent: true;
  paidRandom: false;
}

export interface ProfileField {
  id: string;
  label: string;
  kind: ProfileFieldKind;
  value: string | number | string[];
  valueLabel: string;
  authority: EvidenceAuthority;
  sourceId: string | null;
  verifiedAt: string | null;
  expiresAt: string | null;
  private: true;
  selectable: true;
}

export interface EligibilityResult {
  ruleId: string;
  ruleDescription: string;
  status: EligibilityStatus;
  evidenceFieldId: string | null;
  evidenceLabel: string;
  nextStep: string;
}

export interface EligibilityCheck {
  opportunityId: string;
  checkedAt: string;
  usedProfileFieldIds: string[];
  results: EligibilityResult[];
  summary: string;
  hasCompositeScore: false;
}

export interface MatchResult {
  opportunityId: string;
  fitBand:
    | "ready_to_review"
    | "needs_confirmation"
    | "gaps_present"
    | "insufficient_data";
  reasons: string[];
  conflicts: string[];
  unknowns: string[];
  generatedAt: string;
  rankingBasis: "eligibility_then_deadline";
  paidInfluence: false;
}

export interface SavedOpportunity {
  opportunityId: string;
  note: string;
  savedAt: string;
  intentStatus: IntentStatus;
  updatedAt: string;
}

export interface DisclosureGrant {
  id: string;
  opportunityId: string;
  recipient: string;
  purpose: string;
  profileFieldIds: string[];
  preview: string[];
  grantedAt: string;
  expiresAt: string;
  revokedAt: string | null;
}

export interface ApplicationMirror {
  id: string;
  opportunityId: string;
  status: ApplicationMirrorStatus;
  sharedFieldIds: string[];
  externalApplicationUrl: string;
  updatedAt: string;
  authoritative: false;
}

export interface Entitlement {
  id: string;
  title: string;
  provider: string;
  scope: string;
  conditions: string[];
  validFrom: string;
  expiresAt: string;
  status: "available" | "active" | "expired";
  sourceId: string;
  purchasableQualification: false;
}

export interface CapacityDimension {
  id: "time" | "energy" | "lab_slot" | "funding";
  label: string;
  available: number;
  committed: number;
  unit: string;
  sourceLabel: string;
  canPurchaseEligibility: false;
}

export interface CapacityPlan {
  opportunityId: string;
  hoursPerWeek: number;
  note: string;
  createdAt: string;
}

export interface PathwayScenario {
  id: string;
  title: string;
  type: "major_change" | "exchange" | "accelerated_study";
  inheritedCredits: string;
  estimatedTime: string;
  estimatedCost: string;
  assumptions: string[];
  risks: string[];
  rollbackPoint: string;
  approvalPath: string[];
  authoritative: false;
}

export interface PortfolioArtifact {
  id: string;
  title: string;
  sourceModule: "F-001" | "F-005";
  sourceId: string;
  reviewStatus: "teacher_approved_fixture" | "private_reflection";
  includesOriginalMaterial: false;
  selected: boolean;
}

export interface OpportunityReport {
  id: string;
  opportunityId: string;
  type: "expired" | "wrong_info" | "unfair";
  reason: string;
  status: "queued_for_human_review";
  createdAt: string;
  affectedMatchRecalculated: boolean;
}

export interface FairnessCheck {
  id: string;
  label: string;
  status: "pass" | "fail";
  detail: string;
}

export interface FairnessAudit {
  id: string;
  runAt: string;
  checks: FairnessCheck[];
  sensitiveFieldsUsed: string[];
  status: "pass" | "fail";
}

export interface OpportunityNotification {
  id: string;
  opportunityId: string;
  kind: "expiry" | "rule_change" | "consent" | "report";
  message: string;
  createdAt: string;
  read: boolean;
}

export interface OpportunityAuditEvent {
  id: string;
  sequence: number;
  action:
    | "view"
    | "eligibility_check"
    | "match"
    | "save"
    | "intent"
    | "provider_ack"
    | "consent_grant"
    | "consent_revoke"
    | "external_status_mark"
    | "capacity_plan"
    | "pathway_preview"
    | "portfolio_export"
    | "report"
    | "fairness_audit"
    | "offline_fallback";
  targetId: string;
  detail: string;
  occurredAt: string;
  previousEventHash: string | null;
  eventHash: string;
}

export interface OpportunityMarketFixture {
  schemaVersion: "1.0";
  dataMode: "demo_fixture";
  generatedAt: string;
  lastUpdatedAt: string;
  studentId: "student-nan-fixture";
  profileVisibility: "private";
  selectedStage: OpportunityStage;
  selectedOpportunityId: string;
  scopeFilter: OpportunityScope | "all";
  categoryFilter: OpportunityCategory | "all";
  query: string;
  showActiveOnly: boolean;
  selectedProfileFieldIds: string[];
  forbiddenProfileFieldIds: string[];
  opportunities: Opportunity[];
  packs: OpportunityPack[];
  rules: EligibilityRule[];
  profileFields: ProfileField[];
  eligibilityChecks: EligibilityCheck[];
  matchResults: MatchResult[];
  savedOpportunities: SavedOpportunity[];
  disclosureGrants: DisclosureGrant[];
  applicationMirrors: ApplicationMirror[];
  entitlements: Entitlement[];
  capacity: CapacityDimension[];
  capacityPlans: CapacityPlan[];
  pathways: PathwayScenario[];
  selectedPathwayId: string | null;
  portfolioArtifacts: PortfolioArtifact[];
  reports: OpportunityReport[];
  fairnessAudits: FairnessAudit[];
  notifications: OpportunityNotification[];
  audit: OpportunityAuditEvent[];
  offline: boolean;
  simplified: boolean;
  reducedMotion: boolean;
  message: string;
  invariants: {
    noPaidRanking: true;
    noRandomQualification: true;
    noHumanAuction: true;
    noAutoApply: true;
    noFomoCountdown: true;
    noCompositeEligibilityScore: true;
  };
}

export type OpportunityMarketState = OpportunityMarketFixture;

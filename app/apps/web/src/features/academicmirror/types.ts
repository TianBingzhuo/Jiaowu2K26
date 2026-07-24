export type MirrorStep =
  | "sources"
  | "browse"
  | "conflicts"
  | "consent"
  | "audit";

export type AuthorityLevel =
  | "authoritative"
  | "official_reference"
  | "authorized_mirror"
  | "self_declared"
  | "model_inferred"
  | "demo_fixture";

export type FreshnessState = "fresh" | "warning" | "expired" | "no_expiry";

export type MirrorValue = string | number | boolean | string[];

export type DataSourceSystem =
  | "sis"
  | "urp"
  | "lms"
  | "manual_export"
  | "demo_fixture";

export type AdapterKind = "demo_fixture" | "file_import";

export interface MirrorDataSource {
  id: string;
  name: string;
  systemType: DataSourceSystem;
  adapterKind: AdapterKind;
  responsibleParty: string;
  authMethod: "file_import" | "manual";
  fieldScope: string[];
  refreshMethod: "manual" | "on_demand";
  retentionDays: number;
  correctionRoute: string;
  consentRequired: boolean;
  status: "active" | "suspended" | "deprecated";
  authorized: boolean;
  declaredAuthority: AuthorityLevel;
  lastSyncedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface RawSnapshot {
  id: string;
  dataSourceId: string;
  externalId: string;
  sourceVersion: string;
  fetchedAt: string;
  contentHash: string;
  rawReference: string;
  format: "json" | "csv" | "manual";
  sizeBytes: number;
  immutable: true;
  demoFixture: true;
}

export interface ProvenanceDetail {
  sourceSystem: string;
  dataSourceId: string;
  externalField: string;
  sourceVersion: string;
  fetchedAt: string;
  declaredAuthority: AuthorityLevel;
  effectiveAuthority: "demo_fixture";
  conversionRule: string;
  rawSnapshotId: string;
}

export interface NormalizedField {
  value: MirrorValue;
  provenance: ProvenanceDetail;
}

export interface NormalizedRecord {
  id: string;
  snapshotIds: string[];
  entityType:
    | "student"
    | "course"
    | "offering"
    | "grade"
    | "requirement"
    | "activity"
    | "term";
  entityId: string;
  label: string;
  studentId: string;
  fields: Record<string, NormalizedField>;
  effectiveAt: string;
  expiresAt: string | null;
  consentBasis: string;
  correctionRoute: string;
  removable: boolean;
  demoFixture: true;
}

export interface ConflictOption {
  id: string;
  sourceSystem: string;
  dataSourceId: string;
  value: MirrorValue;
  declaredAuthority: AuthorityLevel;
  fetchedAt: string;
  rawSnapshotId: string;
}

export interface ConflictResolution {
  chosenOptionId: string;
  chosenValue: MirrorValue;
  chosenSource: string;
  reason: string;
  resolvedBy: string;
  resolvedAt: string;
}

export interface ConflictRecord {
  id: string;
  entityId: string;
  entityLabel: string;
  fieldName: string;
  options: ConflictOption[];
  status: "detected" | "reviewing" | "resolved" | "dismissed";
  resolution: ConflictResolution | null;
}

export interface ConsentRecord {
  id: string;
  studentId: string;
  dataSourceId: string;
  allowedModules: string[];
  purpose: string;
  grantedAt: string;
  expiresAt: string | null;
  revokedAt: string | null;
  scope: "read_only" | "export" | "matching";
}

export interface AuditEvent {
  id: string;
  sequence: number;
  action:
    | "source_register"
    | "sync"
    | "map"
    | "query"
    | "conflict_resolve"
    | "export"
    | "delete"
    | "correction_request"
    | "consent_grant"
    | "consent_revoke"
    | "offline_fallback";
  actorId: string;
  targetEntity: string;
  timestamp: string;
  detail: string;
  previousEventHash: string | null;
  eventHash: string;
  appendOnly: true;
}

export interface AuthorityDefinition {
  level: AuthorityLevel;
  title: string;
  description: string;
  highRiskEligible: boolean;
}

export interface MirrorFixture {
  schemaVersion: string;
  dataMode: "fixture";
  studentId: string;
  referenceTime: string;
  sourceBoundary: string;
  readOnly: true;
  authorityCatalog: AuthorityDefinition[];
  sources: MirrorDataSource[];
  snapshots: RawSnapshot[];
  records: NormalizedRecord[];
  conflicts: ConflictRecord[];
  consents: ConsentRecord[];
  audit: AuditEvent[];
}

export interface MirrorState extends MirrorFixture {
  step: MirrorStep;
  selectedRecordId: string;
  selectedConflictId: string | null;
  offline: boolean;
  lastTrustedSnapshotAt: string;
  message: string;
}

export interface SourceRegistrationDraft {
  name: string;
  systemType: DataSourceSystem;
  responsibleParty: string;
  fieldScope: string[];
  correctionRoute: string;
}

export interface ReadableMirrorArchive {
  schemaVersion: string;
  archiveType: "readable_untrusted";
  dataMode: "fixture";
  studentId: string;
  exportedAt: string;
  authoritative: false;
  sourceBoundary: string;
  records: NormalizedRecord[];
  consents: ConsentRecord[];
  auditReceipt: {
    eventCount: number;
    latestEventHash: string;
  };
}

export interface TrustedArchiveEnvelope {
  schemaVersion: string;
  archiveType: "trusted_archive_contract_fixture";
  dataMode: "fixture";
  studentId: string;
  exportedAt: string;
  contentHash: string;
  issuer: "DEMO_NOT_AN_ISSUER";
  signatureStatus: "demo_not_signed";
  encryptionStatus: "not_encrypted";
  importDisposition: "quarantine_and_preview_only";
  authoritative: false;
  warning: string;
}

export interface ModuleAccessPreview {
  moduleId: string;
  moduleName: string;
  status: "allowed" | "blocked";
  sourceIds: string[];
  reason: string;
}

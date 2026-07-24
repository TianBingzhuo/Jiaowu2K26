import { ACADEMIC_MIRROR_FIXTURE } from "./fixture";
import type {
  AuditEvent,
  AuthorityLevel,
  ConflictRecord,
  ConsentRecord,
  FreshnessState,
  MirrorFixture,
  MirrorState,
  ModuleAccessPreview,
  NormalizedRecord,
  ReadableMirrorArchive,
  SourceRegistrationDraft,
  TrustedArchiveEnvelope,
} from "./types";

export const AUTHORITY_LABELS: Record<
  AuthorityLevel,
  { short: string; detail: string; highRiskEligible: boolean }
> = {
  authoritative: {
    short: "权威记录",
    detail: "学校正式记录分类；当前画面仍是 Fixture。",
    highRiskEligible: true,
  },
  official_reference: {
    short: "官方参考",
    detail: "课程目录、培养方案等正式参考。",
    highRiskEligible: true,
  },
  authorized_mirror: {
    short: "授权镜像",
    detail: "授权导出的只读副本，需检查新鲜度。",
    highRiskEligible: true,
  },
  self_declared: {
    short: "本人声明",
    detail: "可撤回的个人目标或偏好，不代替正式事实。",
    highRiskEligible: false,
  },
  model_inferred: {
    short: "模型推断",
    detail: "可拒绝的建议线索，不能作出正式决定。",
    highRiskEligible: false,
  },
  demo_fixture: {
    short: "演示夹具",
    detail: "虚构或脱敏演示数据，不支持正式决定。",
    highRiskEligible: false,
  },
};

export const FRESHNESS_LABELS: Record<
  FreshnessState,
  { label: string; detail: string }
> = {
  fresh: { label: "新鲜", detail: "仍处于有效窗口。" },
  warning: { label: "即将过期", detail: "剩余有效期不足总窗口的 20%。" },
  expired: { label: "已过期", detail: "仅可回看；高风险路径必须拒绝。" },
  no_expiry: { label: "无自动期限", detail: "仍需按用途和来源人工复核。" },
};

const MODULE_REQUIREMENTS = [
  {
    moduleId: "F-002",
    moduleName: "MyCareer 赛季中心",
    sourceIds: ["ds-sis-demo", "ds-catalog-demo"],
  },
  {
    moduleId: "F-004",
    moduleName: "Roster Lab",
    sourceIds: ["ds-sis-demo", "ds-catalog-demo", "ds-self-profile"],
  },
  {
    moduleId: "F-006",
    moduleName: "Performance Center",
    sourceIds: ["ds-sis-demo", "ds-self-profile", "ds-model-insight"],
  },
  {
    moduleId: "F-009",
    moduleName: "Opportunity Market",
    sourceIds: ["ds-file-import", "ds-self-profile"],
  },
] as const;

function cloneFixture(): MirrorFixture {
  return structuredClone(ACADEMIC_MIRROR_FIXTURE);
}

export function hashText(value: string): string {
  let hash = 0x811c9dc5;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193);
  }
  return `fnv1a-${(hash >>> 0).toString(16).padStart(8, "0")}`;
}

function eventTime(sequence: number) {
  const reference = new Date(ACADEMIC_MIRROR_FIXTURE.referenceTime);
  reference.setMinutes(reference.getMinutes() + sequence);
  return reference.toISOString();
}

function appendAudit(
  state: MirrorState,
  action: AuditEvent["action"],
  targetEntity: string,
  detail: string,
): MirrorState {
  const previous = state.audit.at(-1) ?? null;
  const sequence = (previous?.sequence ?? 0) + 1;
  const timestamp = eventTime(sequence);
  const eventHash = hashText(
    `${previous?.eventHash ?? "genesis"}|${sequence}|${action}|${targetEntity}|${timestamp}|${detail}`,
  );
  const event: AuditEvent = {
    id: `aud-${String(sequence).padStart(3, "0")}`,
    sequence,
    action,
    actorId: "student-nan-fixture",
    targetEntity,
    timestamp,
    detail,
    previousEventHash: previous?.eventHash ?? null,
    eventHash,
    appendOnly: true,
  };
  return { ...state, audit: [...state.audit, event] };
}

export function createAcademicMirrorState(): MirrorState {
  const fixture = cloneFixture();
  const errors = validateMirrorFixture(fixture);
  if (errors.length > 0) {
    throw new Error(`Academic Mirror Fixture 无效：${errors.join("；")}`);
  }
  return {
    ...fixture,
    step: "sources",
    selectedRecordId: fixture.records[0]?.id ?? "",
    selectedConflictId: fixture.conflicts[0]?.id ?? null,
    offline: false,
    lastTrustedSnapshotAt: fixture.snapshots
      .map((snapshot) => snapshot.fetchedAt)
      .sort()
      .at(-1) ?? fixture.referenceTime,
    message: "六级权威语义已加载；当前所有有效权威仍被 Fixture 边界降为演示。",
  };
}

export function validateMirrorFixture(fixture: MirrorFixture): string[] {
  const errors: string[] = [];
  if (!fixture.schemaVersion.startsWith("1.")) {
    errors.push("schemaVersion 必须是 1.x");
  }
  if (fixture.dataMode !== "fixture" || fixture.readOnly !== true) {
    errors.push("公开演示必须保持 fixture + readOnly");
  }
  if (fixture.sources.length < 2) errors.push("至少需要两个数据源");
  const adapters = new Set(fixture.sources.map((source) => source.adapterKind));
  if (!adapters.has("demo_fixture") || !adapters.has("file_import")) {
    errors.push("DemoFixtureAdapter 与 FileImportAdapter 必须同时存在");
  }
  const sourceIds = new Set(fixture.sources.map((source) => source.id));
  const snapshotIds = new Set(fixture.snapshots.map((snapshot) => snapshot.id));
  if (sourceIds.size !== fixture.sources.length) errors.push("数据源 ID 必须唯一");
  if (snapshotIds.size !== fixture.snapshots.length) errors.push("快照 ID 必须唯一");
  for (const snapshot of fixture.snapshots) {
    if (!sourceIds.has(snapshot.dataSourceId)) {
      errors.push(`快照 ${snapshot.id} 引用了未知数据源`);
    }
    if (!snapshot.immutable || !/^sha256:[a-f0-9]{64}$/.test(snapshot.contentHash)) {
      errors.push(`快照 ${snapshot.id} 缺少不可变 SHA-256 收据`);
    }
  }
  const usedAuthority = new Set<AuthorityLevel>();
  for (const record of fixture.records) {
    for (const field of Object.values(record.fields)) {
      usedAuthority.add(field.provenance.declaredAuthority);
      if (!sourceIds.has(field.provenance.dataSourceId)) {
        errors.push(`记录 ${record.id} 的字段来源不存在`);
      }
      if (!snapshotIds.has(field.provenance.rawSnapshotId)) {
        errors.push(`记录 ${record.id} 的字段快照不存在`);
      }
      if (field.provenance.effectiveAuthority !== "demo_fixture") {
        errors.push(`记录 ${record.id} 未被 Fixture 边界降级`);
      }
    }
  }
  if (usedAuthority.size !== 6) errors.push("六级权威分类未完整覆盖");
  for (const conflict of fixture.conflicts) {
    if (conflict.options.length < 2) errors.push(`冲突 ${conflict.id} 缺少对照值`);
    if (conflict.status === "resolved" && !conflict.resolution) {
      errors.push(`冲突 ${conflict.id} 缺少解决收据`);
    }
  }
  for (let index = 0; index < fixture.audit.length; index += 1) {
    const event = fixture.audit[index];
    if (!event.appendOnly) errors.push(`审计事件 ${event.id} 非追加式`);
    if (index === 0 && event.previousEventHash !== null) {
      errors.push("首个审计事件必须指向 genesis");
    }
    if (
      index > 0 &&
      event.previousEventHash !== fixture.audit[index - 1]?.eventHash
    ) {
      errors.push(`审计事件 ${event.id} 的链式引用断裂`);
    }
  }
  return errors;
}

export function deriveFreshness(
  record: NormalizedRecord,
  referenceTime = ACADEMIC_MIRROR_FIXTURE.referenceTime,
): FreshnessState {
  if (!record.expiresAt) return "no_expiry";
  const now = new Date(referenceTime).getTime();
  const effective = new Date(record.effectiveAt).getTime();
  const expiry = new Date(record.expiresAt).getTime();
  if (now >= expiry) return "expired";
  const total = Math.max(expiry - effective, 1);
  const remaining = expiry - now;
  return remaining / total <= 0.2 ? "warning" : "fresh";
}

export function registerSource(
  state: MirrorState,
  draft: SourceRegistrationDraft,
): MirrorState {
  if (
    !draft.name.trim() ||
    !draft.responsibleParty.trim() ||
    !draft.correctionRoute.trim() ||
    draft.fieldScope.length === 0
  ) {
    throw new Error("登记数据源需要名称、责任方、字段范围和纠错渠道。");
  }
  const id = `ds-local-${String(state.sources.length + 1).padStart(2, "0")}`;
  const timestamp = eventTime(state.audit.length + 1);
  let next: MirrorState = {
    ...state,
    sources: [
      ...state.sources,
      {
        id,
        name: draft.name.trim(),
        systemType: draft.systemType,
        adapterKind:
          draft.systemType === "demo_fixture" ? "demo_fixture" : "file_import",
        responsibleParty: draft.responsibleParty.trim(),
        authMethod:
          draft.systemType === "demo_fixture" ? "manual" : "file_import",
        fieldScope: draft.fieldScope,
        refreshMethod:
          draft.systemType === "demo_fixture" ? "on_demand" : "manual",
        retentionDays: 14,
        correctionRoute: draft.correctionRoute.trim(),
        consentRequired: true,
        status: "active",
        authorized: true,
        declaredAuthority:
          draft.systemType === "demo_fixture"
            ? "demo_fixture"
            : "authorized_mirror",
        lastSyncedAt: null,
        createdAt: timestamp,
        updatedAt: timestamp,
      },
    ],
    message: `已登记 ${draft.name.trim()}；只允许本地授权导入，不收集账号密码。`,
  };
  next = appendAudit(
    next,
    "source_register",
    `source:${id}`,
    `登记 ${draft.systemType} 数据源；权限范围 ${draft.fieldScope.join(", ")}。`,
  );
  return next;
}

export function syncSource(state: MirrorState, sourceId: string): MirrorState {
  if (state.offline) {
    return appendAudit(
      {
        ...state,
        message: `网络不可用；保留 ${state.lastTrustedSnapshotAt} 的上次可信镜像。`,
      },
      "offline_fallback",
      `source:${sourceId}`,
      "同步未执行；继续使用上次有效快照。",
    );
  }
  const source = state.sources.find((candidate) => candidate.id === sourceId);
  if (!source) throw new Error("数据源不存在。");
  if (!source.authorized || source.status !== "active") {
    throw new Error("数据源未获授权或已停用，不能同步。");
  }
  const previous = state.snapshots
    .filter((snapshot) => snapshot.dataSourceId === sourceId)
    .at(-1);
  if (!previous) {
    throw new Error("该新登记源尚未选择本地文件；不会自动抓取或收集密码。");
  }
  const nextIndex =
    state.snapshots.filter((snapshot) => snapshot.dataSourceId === sourceId)
      .length + 1;
  const fetchedAt = eventTime(state.audit.length + 1);
  const nextSnapshot = {
    ...previous,
    id: `${previous.id.replace(/-\d+$/, "")}-${String(nextIndex).padStart(3, "0")}`,
    sourceVersion: `${previous.sourceVersion}-sync-${nextIndex}`,
    fetchedAt,
    rawReference: `fixture://academic-mirror/${sourceId}/sync-${nextIndex}`,
  } as const;
  let next: MirrorState = {
    ...state,
    snapshots: [...state.snapshots, nextSnapshot],
    sources: state.sources.map((candidate) =>
      candidate.id === sourceId
        ? { ...candidate, lastSyncedAt: fetchedAt, updatedAt: fetchedAt }
        : candidate,
    ),
    lastTrustedSnapshotAt: fetchedAt,
    message: `同步检查完成：${source.name} 内容哈希未变化；已通过 ${source.adapterKind === "demo_fixture" ? "DemoFixtureAdapter" : "FileImportAdapter"} 追加审计收据 ${nextSnapshot.id}，旧快照未修改。`,
  };
  next = appendAudit(
    next,
    "sync",
    `source:${sourceId}`,
    `追加不可变快照 ${nextSnapshot.id}；内容 SHA-256 与未变化的输入一致。`,
  );
  next = appendAudit(
    next,
    "map",
    `snapshot:${nextSnapshot.id}`,
    "执行稳定字段映射；未知字段继续保留。",
  );
  return next;
}

export function selectRecord(
  state: MirrorState,
  recordId: string,
): MirrorState {
  if (!state.records.some((record) => record.id === recordId)) {
    throw new Error("镜像记录不存在。");
  }
  return appendAudit(
    { ...state, selectedRecordId: recordId },
    "query",
    `record:${recordId}`,
    "查看标准记录及字段级来源；未暴露原始敏感载荷。",
  );
}

export function resolveConflict(
  state: MirrorState,
  conflictId: string,
  optionId: string,
  reason: string,
): MirrorState {
  if (!reason.trim()) throw new Error("处理冲突必须填写人工判断理由。");
  const conflict = state.conflicts.find((candidate) => candidate.id === conflictId);
  if (!conflict) throw new Error("冲突记录不存在。");
  if (conflict.status === "resolved") throw new Error("该冲突已经处理。");
  const option = conflict.options.find((candidate) => candidate.id === optionId);
  if (!option) throw new Error("请选择冲突来源之一。");
  const resolvedAt = eventTime(state.audit.length + 1);
  const resolution: NonNullable<ConflictRecord["resolution"]> = {
    chosenOptionId: option.id,
    chosenValue: option.value,
    chosenSource: option.sourceSystem,
    reason: reason.trim(),
    resolvedBy: "student-nan-fixture",
    resolvedAt,
  };
  const nextConflicts = state.conflicts.map((candidate) =>
    candidate.id === conflictId
      ? { ...candidate, status: "resolved" as const, resolution }
      : candidate,
  );
  const nextRecords = state.records.map((record) => {
    if (record.entityId !== conflict.entityId || !record.fields[conflict.fieldName]) {
      return record;
    }
    const currentField = record.fields[conflict.fieldName];
    return {
      ...record,
      fields: {
        ...record.fields,
        [conflict.fieldName]: {
          value: option.value,
          provenance: {
            ...currentField.provenance,
            sourceSystem: option.sourceSystem,
            dataSourceId: option.dataSourceId,
            rawSnapshotId: option.rawSnapshotId,
            fetchedAt: option.fetchedAt,
            declaredAuthority: option.declaredAuthority,
            conversionRule: `${currentField.provenance.conversionRule}；人工校对：${reason.trim()}`,
          },
        },
      },
    };
  });
  return appendAudit(
    {
      ...state,
      conflicts: nextConflicts,
      records: nextRecords,
      message: `冲突已人工处理并留痕；${option.sourceSystem} 的值只更新镜像，不写回来源系统。`,
    },
    "conflict_resolve",
    `conflict:${conflictId}`,
    `选择 ${option.id}；理由：${reason.trim()}`,
  );
}

export function toggleConsent(
  state: MirrorState,
  consentId: string,
): MirrorState {
  const consent = state.consents.find((candidate) => candidate.id === consentId);
  if (!consent) throw new Error("同意记录不存在。");
  const revoking = consent.revokedAt === null;
  const timestamp = eventTime(state.audit.length + 1);
  const nextConsent: ConsentRecord = {
    ...consent,
    revokedAt: revoking ? timestamp : null,
    grantedAt: revoking ? consent.grantedAt : timestamp,
  };
  return appendAudit(
    {
      ...state,
      consents: state.consents.map((candidate) =>
        candidate.id === consentId ? nextConsent : candidate,
      ),
      message: revoking
        ? `已撤回 ${consent.dataSourceId} 的用途同意；相关模块立即变为不可读。`
        : `已重新授予 ${consent.dataSourceId} 的既定用途；扩大用途仍需另行确认。`,
    },
    revoking ? "consent_revoke" : "consent_grant",
    `consent:${consentId}`,
    `${revoking ? "撤回" : "授予"} ${consent.allowedModules.join(", ")} 的 ${consent.scope} 范围。`,
  );
}

export function buildModuleAccessPreview(
  state: MirrorState,
): ModuleAccessPreview[] {
  const activeConsents = state.consents.filter(
    (consent) =>
      consent.revokedAt === null &&
      (!consent.expiresAt ||
        new Date(consent.expiresAt).getTime() >
          new Date(state.referenceTime).getTime()),
  );
  return MODULE_REQUIREMENTS.map((module) => {
    const missing = module.sourceIds.filter(
      (sourceId) =>
        !activeConsents.some(
          (consent) =>
            consent.dataSourceId === sourceId &&
            consent.allowedModules.includes(module.moduleId),
        ),
    );
    return {
      moduleId: module.moduleId,
      moduleName: module.moduleName,
      status: missing.length === 0 ? "allowed" : "blocked",
      sourceIds: [...module.sourceIds],
      reason:
        missing.length === 0
          ? "用途、来源和有效期均满足只读访问。"
          : `缺少有效同意：${missing.join(", ")}。`,
    };
  });
}

function activeExportSourceIds(state: MirrorState): Set<string> {
  return new Set(
    state.consents
      .filter(
        (consent) =>
          consent.revokedAt === null &&
          (!consent.expiresAt ||
            new Date(consent.expiresAt).getTime() >
              new Date(state.referenceTime).getTime()),
      )
      .map((consent) => consent.dataSourceId),
  );
}

export function buildReadableArchive(
  state: MirrorState,
): ReadableMirrorArchive {
  const allowedSources = activeExportSourceIds(state);
  const records = state.records.filter((record) =>
    Object.values(record.fields).some((field) =>
      allowedSources.has(field.provenance.dataSourceId),
    ),
  );
  return {
    schemaVersion: state.schemaVersion,
    archiveType: "readable_untrusted",
    dataMode: "fixture",
    studentId: state.studentId,
    exportedAt: eventTime(state.audit.length + 1),
    authoritative: false,
    sourceBoundary: `${state.sourceBoundary} 此可读 JSON 是个人副本，不能作为学校证明。`,
    records,
    consents: state.consents,
    auditReceipt: {
      eventCount: state.audit.length,
      latestEventHash: state.audit.at(-1)?.eventHash ?? "genesis",
    },
  };
}

export function buildTrustedEnvelope(
  state: MirrorState,
): TrustedArchiveEnvelope {
  const readable = buildReadableArchive(state);
  return {
    schemaVersion: state.schemaVersion,
    archiveType: "trusted_archive_contract_fixture",
    dataMode: "fixture",
    studentId: state.studentId,
    exportedAt: readable.exportedAt,
    contentHash: hashText(JSON.stringify(readable)),
    issuer: "DEMO_NOT_AN_ISSUER",
    signatureStatus: "demo_not_signed",
    encryptionStatus: "not_encrypted",
    importDisposition: "quarantine_and_preview_only",
    authoritative: false,
    warning:
      "这是可信归档的数据合同样例，不含真实签名、密钥链或加密；只能进入隔离预览，不能覆盖学校记录。",
  };
}

export function recordExport(
  state: MirrorState,
  archiveType: "readable_untrusted" | "trusted_archive_contract_fixture",
): MirrorState {
  return appendAudit(
    {
      ...state,
      message:
        archiveType === "readable_untrusted"
          ? "已生成可阅读、非权威 JSON 副本。"
          : "已生成未签名的可信归档合同样例；它不是可验证证明。",
    },
    "export",
    `student:${state.studentId}`,
    `导出类型 ${archiveType}；Fixture 边界和非权威标记已保留。`,
  );
}

export function requestCorrection(
  state: MirrorState,
  recordId: string,
  reason: string,
): MirrorState {
  const record = state.records.find((candidate) => candidate.id === recordId);
  if (!record) throw new Error("镜像记录不存在。");
  if (!reason.trim()) throw new Error("校对请求必须说明差异。");
  return appendAudit(
    {
      ...state,
      message: `校对请求已进入人工队列；正式记录仍应通过：${record.correctionRoute}`,
    },
    "correction_request",
    `record:${recordId}`,
    reason.trim(),
  );
}

export function deleteNonAuthoritativeCopy(
  state: MirrorState,
  recordId: string,
): MirrorState {
  const record = state.records.find((candidate) => candidate.id === recordId);
  if (!record) throw new Error("镜像记录不存在。");
  if (!record.removable) {
    throw new Error("权威/官方镜像不可在体验层删除；请走正式纠错渠道。");
  }
  const nextRecords = state.records.filter(
    (candidate) => candidate.id !== recordId,
  );
  const nextSelected = nextRecords[0]?.id ?? "";
  return appendAudit(
    {
      ...state,
      records: nextRecords,
      selectedRecordId:
        state.selectedRecordId === recordId ? nextSelected : state.selectedRecordId,
      message: "已删除非权威副本；原始学校记录和其他来源均未改动。",
    },
    "delete",
    `record:${recordId}`,
    `删除可撤回镜像副本 ${record.label}。`,
  );
}

export function resetAcademicMirrorState(): MirrorState {
  return createAcademicMirrorState();
}

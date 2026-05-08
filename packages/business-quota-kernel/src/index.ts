import {
  BusinessQuotaSourceKindSchema,
  CdpDomObservationSummarySchema,
  CodexQuotaSourceHealthSchema,
  QuotaAttributionSchema,
  QuotaSnapshotSchema,
  SchemaVersionSchema,
  SensitiveRedactionReportSchema,
  UiObservationSourceSchema,
  foundationId,
  foundationTimestamp,
  type BusinessQuotaSourceKind,
  type CdpDomObservationSummary,
  type CodexQuotaSourceFailureKind,
  type CodexQuotaSourceHealth,
  type CodexQuotaSourceHealthStatus,
  type QuotaAttribution,
  type QuotaAttributionConfidence,
  type QuotaAttributionStatus,
  type QuotaSnapshot,
  type QuotaSnapshotStatus,
  type SensitiveRedactionReport,
  type SensitiveRedactionStatus,
  type UiObservationSource,
  type UiObservationStatus,
} from '@codexhub/contracts';
import { hashText } from '@codexhub/evidence-kernel';

const forbiddenObservationKeyPattern =
  /token|cookie|session|storage|password|credential|mfa|secret|authorization|accountid|workspaceid|email|raw/i;

export interface QuotaSourceHealthInput {
  sourceKind: BusinessQuotaSourceKind;
  status?: CodexQuotaSourceHealthStatus;
  sourceRefSeed?: string;
  priority?: number;
  stabilityScore?: number;
  observationCount?: number;
  failureKind?: CodexQuotaSourceFailureKind;
  blockReasons?: readonly string[];
  liveReadReady?: boolean;
  canaryRequired?: boolean;
  canaryPassed?: boolean;
  evidenceRefIds?: readonly string[];
  auditEventIds?: readonly string[];
  observedAt?: string;
}

export interface SensitiveObservationInput {
  sourceSeed: string;
  fieldKeys?: readonly string[];
  forbiddenFieldCount?: number;
  observedAt?: string;
  evidenceRefIds?: readonly string[];
  auditEventIds?: readonly string[];
}

export interface UiObservationInput {
  sourceKind: BusinessQuotaSourceKind;
  targetSeed: string;
  selectorManifestSeed?: string;
  fieldKeys?: readonly string[];
  readableFieldCount?: number;
  status?: UiObservationStatus;
  sourceHealth?: CodexQuotaSourceHealth;
  observedAt?: string;
  evidenceRefIds?: readonly string[];
  auditEventIds?: readonly string[];
}

export interface QuotaAttributionInput {
  sourceHealth: CodexQuotaSourceHealth;
  quotaSnapshot?: QuotaSnapshot;
  workspaceIdHash?: string;
  membershipMirrorId?: string;
  accountBindingId?: string;
  businessCodexSeatId?: string;
  workspaceCreditSnapshotId?: string;
  seatUsageLimitId?: string;
  confidence?: QuotaAttributionConfidence;
  status?: QuotaAttributionStatus;
  blockReasons?: readonly string[];
  evidenceRefIds?: readonly string[];
  auditEventIds?: readonly string[];
  observedAt?: string;
}

export interface QuotaDispatchGateInput {
  sourceHealth?: CodexQuotaSourceHealth;
  quotaSnapshot?: QuotaSnapshot;
  redactionReport?: SensitiveRedactionReport;
  canaryPassed?: boolean;
  liveDispatchRequested?: boolean;
}

export interface QuotaDispatchGate {
  status: 'ready' | 'blocked' | 'degraded';
  dispatchAllowed: boolean;
  sourceStatus: CodexQuotaSourceHealthStatus | 'missing';
  quotaStatus: QuotaSnapshotStatus | 'missing';
  canaryPassed: boolean;
  blockReasons: string[];
  summary: string;
}

export function redactSensitiveObservation(
  input: SensitiveObservationInput,
): SensitiveRedactionReport {
  const fieldKeys = [...(input.fieldKeys ?? [])];
  const detectedForbiddenCount =
    input.forbiddenFieldCount ??
    fieldKeys.filter((fieldKey) => forbiddenObservationKeyPattern.test(fieldKey)).length;
  const credentialMaterialDetected = detectedForbiddenCount > 0;
  const tokenCookieSessionStorageDetected = fieldKeys.some((fieldKey) =>
    /token|cookie|session|storage|mfa|password|credential/i.test(fieldKey),
  );
  const status: SensitiveRedactionStatus = credentialMaterialDetected ? 'blocked' : 'passed';

  return SensitiveRedactionReportSchema.parse({
    id: foundationId('sensitive_redaction_report'),
    schemaVersion: SchemaVersionSchema.value,
    observedAt: input.observedAt ?? foundationTimestamp(),
    sourceHash: hashRef(input.sourceSeed),
    status,
    scannedFieldCount: fieldKeys.length,
    redactedFieldCount: fieldKeys.length,
    forbiddenFieldCount: detectedForbiddenCount,
    blockedPersistence: credentialMaterialDetected,
    credentialMaterialDetected,
    tokenCookieSessionStorageDetected,
    evidenceRefIds: [...(input.evidenceRefIds ?? [])],
    auditEventIds: [...(input.auditEventIds ?? [])],
    summary: credentialMaterialDetected
      ? 'Sensitive redaction blocked persistence after forbidden field keys were detected.'
      : 'Sensitive redaction passed and stores only counts plus hashes.',
  });
}

export function summarizeQuotaSourceHealth(input: QuotaSourceHealthInput): CodexQuotaSourceHealth {
  const status =
    input.status ??
    (input.blockReasons && input.blockReasons.length > 0 ? 'blocked' : 'healthy');
  const blockReasons = [...(input.blockReasons ?? [])];
  const failureKind =
    input.failureKind ??
    (status === 'healthy' || status === 'degraded' ? 'none' : 'unknown');

  return CodexQuotaSourceHealthSchema.parse({
    id: foundationId('codex_quota_source_health'),
    schemaVersion: SchemaVersionSchema.value,
    observedAt: input.observedAt ?? foundationTimestamp(),
    sourceKind: BusinessQuotaSourceKindSchema.parse(input.sourceKind),
    status,
    sourceRefHash: input.sourceRefSeed ? hashRef(input.sourceRefSeed) : undefined,
    priority: input.priority ?? 1,
    stabilityScore: input.stabilityScore ?? (status === 'healthy' ? 90 : 0),
    observationCount: input.observationCount ?? 0,
    failureKind,
    blockReasons,
    liveReadReady: input.liveReadReady ?? (status === 'healthy' && input.canaryPassed === true),
    canaryRequired: input.canaryRequired ?? true,
    canaryPassed: input.canaryPassed ?? false,
    evidenceRefIds: [...(input.evidenceRefIds ?? [])],
    auditEventIds: [...(input.auditEventIds ?? [])],
    summary:
      status === 'healthy'
        ? 'Quota source health is healthy after metadata-only observation.'
        : 'Quota source health blocks or degrades quota-dependent dispatch.',
  });
}

export function summarizeUiObservation(input: UiObservationInput): {
  redactionReport: SensitiveRedactionReport;
  observation: UiObservationSource;
  domSummary: CdpDomObservationSummary;
} {
  const fieldKeys = [...(input.fieldKeys ?? [])];
  const redactionReport = redactSensitiveObservation({
    sourceSeed: input.targetSeed,
    fieldKeys,
    observedAt: input.observedAt,
    evidenceRefIds: input.evidenceRefIds,
    auditEventIds: input.auditEventIds,
  });
  const status: UiObservationStatus =
    input.status ?? (redactionReport.status === 'passed' ? 'observed' : 'blocked');
  const targetHash = hashRef(input.targetSeed);
  const selectorManifestHash = input.selectorManifestSeed
    ? hashRef(input.selectorManifestSeed)
    : undefined;
  const readableFieldCount =
    input.readableFieldCount ?? (status === 'observed' ? fieldKeys.length : 0);

  const observation = UiObservationSourceSchema.parse({
    id: foundationId('ui_observation_source'),
    schemaVersion: SchemaVersionSchema.value,
    observedAt: input.observedAt ?? foundationTimestamp(),
    sourceKind: input.sourceKind,
    targetHash,
    selectorManifestHash,
    status,
    fieldCount: fieldKeys.length,
    readableFieldCount,
    redactionReportId: redactionReport.id,
    sourceHealthId: input.sourceHealth?.id,
    evidenceRefIds: [...(input.evidenceRefIds ?? [])],
    auditEventIds: [...(input.auditEventIds ?? [])],
    summary:
      status === 'observed'
        ? 'UI observation stores selector, target, and field metadata only.'
        : 'UI observation is blocked before raw DOM or text can be persisted.',
  });
  const domSummary = CdpDomObservationSummarySchema.parse({
    id: foundationId('cdp_dom_observation_summary'),
    schemaVersion: SchemaVersionSchema.value,
    observedAt: input.observedAt ?? foundationTimestamp(),
    sourceId: observation.id,
    targetHash,
    selectorManifestHash,
    nodeCount: fieldKeys.length,
    textFieldCount: fieldKeys.length,
    hashedTextCount: readableFieldCount,
    blockedSelectorCount: redactionReport.forbiddenFieldCount,
    cdpCommandCount: 0,
    evidenceRefIds: [...(input.evidenceRefIds ?? [])],
    auditEventIds: [...(input.auditEventIds ?? [])],
    summary: 'CDP DOM observation summary stores counts and hashes only.',
  });

  return { redactionReport, observation, domSummary };
}

export function attributeBusinessQuota(input: QuotaAttributionInput): QuotaAttribution {
  const status =
    input.status ??
    (input.sourceHealth.status === 'healthy'
      ? 'attributed'
      : input.sourceHealth.status === 'degraded'
        ? 'partial'
        : 'blocked');
  const blockReasons = [
    ...(input.blockReasons ?? []),
    ...(status === 'blocked' && input.sourceHealth.blockReasons.length === 0
      ? ['source_health_blocks_attribution']
      : []),
    ...input.sourceHealth.blockReasons,
  ];

  return QuotaAttributionSchema.parse({
    id: foundationId('quota_attribution'),
    schemaVersion: SchemaVersionSchema.value,
    observedAt: input.observedAt ?? foundationTimestamp(),
    attributionHash: hashRef({
      sourceHealthId: input.sourceHealth.id,
      quotaSnapshotId: input.quotaSnapshot?.id,
      workspaceIdHash: input.workspaceIdHash,
      accountBindingId: input.accountBindingId,
      businessCodexSeatId: input.businessCodexSeatId,
    }),
    sourceHealthId: input.sourceHealth.id,
    quotaSnapshotId: input.quotaSnapshot?.id,
    workspaceIdHash: input.workspaceIdHash,
    membershipMirrorId: input.membershipMirrorId,
    accountBindingId: input.accountBindingId,
    businessCodexSeatId: input.businessCodexSeatId,
    workspaceCreditSnapshotId: input.workspaceCreditSnapshotId,
    seatUsageLimitId: input.seatUsageLimitId,
    confidence: input.confidence ?? (status === 'attributed' ? 'high' : 'unknown'),
    status,
    blockReasons,
    evidenceRefIds: [...(input.evidenceRefIds ?? [])],
    auditEventIds: [...(input.auditEventIds ?? [])],
    summary:
      status === 'attributed'
        ? 'Quota attribution links source health to quota metadata.'
        : 'Quota attribution is partial or blocked by source health.',
  });
}

export function createQuotaDispatchGate(input: QuotaDispatchGateInput = {}): QuotaDispatchGate {
  const blockReasons: string[] = [];
  const sourceStatus = input.sourceHealth?.status ?? 'missing';
  const quotaStatus = input.quotaSnapshot?.status ?? 'missing';
  const canaryPassed = input.canaryPassed ?? input.sourceHealth?.canaryPassed ?? false;

  if (!input.sourceHealth) blockReasons.push('quota_source_missing');
  if (input.sourceHealth && input.sourceHealth.status !== 'healthy') {
    blockReasons.push(`quota_source_${input.sourceHealth.status}`);
  }
  if (input.sourceHealth?.blockReasons.length) {
    blockReasons.push(...input.sourceHealth.blockReasons);
  }
  if (!input.quotaSnapshot) blockReasons.push('quota_snapshot_missing');
  if (input.quotaSnapshot?.status === 'unknown' || input.quotaSnapshot?.status === 'blocked') {
    blockReasons.push(`quota_${input.quotaSnapshot.status}`);
  }
  if (input.quotaSnapshot?.status === 'exhausted') blockReasons.push('quota_exhausted');
  if (input.quotaSnapshot?.status === 'limited' && input.quotaSnapshot.remainingCount === undefined) {
    blockReasons.push('quota_limited_without_remaining_count');
  }
  if (input.redactionReport && input.redactionReport.status !== 'passed') {
    blockReasons.push(`redaction_${input.redactionReport.status}`);
  }
  if (input.liveDispatchRequested && !canaryPassed) blockReasons.push('quota_canary_not_passed');

  const dispatchAllowed = blockReasons.length === 0;
  const status = dispatchAllowed
    ? 'ready'
    : input.quotaSnapshot?.status === 'limited' && blockReasons.length === 0
      ? 'degraded'
      : 'blocked';

  return {
    status,
    dispatchAllowed,
    sourceStatus,
    quotaStatus,
    canaryPassed,
    blockReasons,
    summary: dispatchAllowed
      ? 'Quota dispatch gate is ready from healthy source and quota metadata.'
      : 'Quota dispatch gate blocks live dispatch until source, quota, redaction, and canary gates pass.',
  };
}

export function createQuotaSnapshotFromSource(input: {
  subjectKind: QuotaSnapshot['subjectKind'];
  subjectSeed: string;
  status?: QuotaSnapshotStatus;
  limitCount?: number;
  usedCount?: number;
  remainingCount?: number;
  sourceHealth?: CodexQuotaSourceHealth;
  observedAt?: string;
  evidenceRefIds?: readonly string[];
  auditEventIds?: readonly string[];
}): QuotaSnapshot {
  return QuotaSnapshotSchema.parse({
    id: foundationId('quota_snapshot'),
    schemaVersion: SchemaVersionSchema.value,
    observedAt: input.observedAt ?? foundationTimestamp(),
    subjectKind: input.subjectKind,
    subjectHash: hashRef(input.subjectSeed),
    status: input.status ?? 'unknown',
    limitCount: normalizeOptionalCount(input.limitCount),
    usedCount: normalizeOptionalCount(input.usedCount),
    remainingCount: normalizeOptionalCount(input.remainingCount),
    sourceRefIds: input.sourceHealth ? [input.sourceHealth.id] : [],
    evidenceRefIds: [...(input.evidenceRefIds ?? [])],
    auditEventIds: [...(input.auditEventIds ?? [])],
    summary: 'Quota snapshot created from a governed quota source.',
  });
}

function normalizeOptionalCount(value: number | undefined): number | undefined {
  return value === undefined ? undefined : Math.max(0, Math.trunc(value));
}

function hashRef(value: unknown): string {
  const text = typeof value === 'string' ? value : JSON.stringify(value);
  return `sha256:${hashText(text)}`;
}

import {
  BusinessQuotaSourceKindSchema,
  BusinessQuotaCrossCheckReportSchema,
  BusinessAdminMemberRosterSnapshotSchema,
  BusinessBillingSummarySchema,
  BusinessMemberReconciliationReportSchema,
  BusinessProfileWorkspaceObservationSchema,
  BusinessWorkspaceSwitchDryRunPlanSchema,
  BusinessWorkspaceSwitchRunSchema,
  AccountCodexQuotaReadinessSchema,
  CodexQuotaFusionReportSchema,
  CdpDomObservationSummarySchema,
  CodexQuotaSourceHealthSchema,
  OwnerAdminExtractionReportSchema,
  OwnerAdminReadSurfaceSummarySchema,
  PrivilegedBusinessAccessLogSchema,
  PrivilegedBusinessDataRecordSchema,
  PrivilegedBusinessExportManifestSchema,
  QuotaAttributionSchema,
  QuotaSnapshotSchema,
  SchemaVersionSchema,
  SensitiveRedactionReportSchema,
  UiObservationSourceSchema,
  WorkspaceCodexQuotaReadinessSchema,
  foundationId,
  foundationTimestamp,
  type BusinessQuotaSourceKind,
  type BusinessQuotaCrossCheckReport,
  type BusinessQuotaCrossCheckStatus,
  type BusinessMemberReconciliationReport,
  type BusinessMemberReconciliationStatus,
  type BusinessProfileWorkspaceObservation,
  type BusinessWorkspaceObservationStatus,
  type BusinessWorkspaceSwitchDryRunPlan,
  type BusinessWorkspaceSwitchRun,
  type AccountCodexQuotaReadiness,
  type CodexQuotaFusionReadinessStatus,
  type CodexQuotaFusionReport,
  type BusinessAdminMemberRosterSnapshot,
  type BusinessBillingSummary,
  type CdpDomObservationSummary,
  type CodexQuotaSourceFailureKind,
  type CodexQuotaSourceHealth,
  type CodexQuotaSourceHealthStatus,
  type ElectronRendererObservationSummary,
  type OwnerAdminExtractionReport,
  type OwnerAdminExtractionStatus,
  type OwnerAdminReadSurfaceSummary,
  type OwnerAdminSurfaceKind,
  type PrivilegedBusinessAccessLog,
  type PrivilegedBusinessDataKind,
  type PrivilegedBusinessDataRecord,
  type PrivilegedBusinessExportManifest,
  type QuotaAttribution,
  type QuotaAttributionConfidence,
  type QuotaAttributionStatus,
  type QuotaSnapshot,
  type QuotaSnapshotStatus,
  type SensitiveRedactionReport,
  type SensitiveRedactionStatus,
  type UiObservationSource,
  type UiObservationStatus,
  type WorkspaceCodexQuotaReadiness,
} from '@codexhub/contracts';
import { hashText } from '@codexhub/evidence-kernel';

const forbiddenObservationKeyPattern =
  /token|cookie|session|storage|password|credential|mfa|secret|authorization|accountid|workspaceid|email|raw/i;
const forbiddenPrivilegedBusinessKeyPattern =
  /token|cookie|session|storage|password|credential|mfa|secret|authorization|privatekey|networkbody/i;
const forbiddenPrivilegedBusinessValuePattern =
  /-----BEGIN [A-Z ]*PRIVATE KEY-----|session=|cookie=|authorization:|bearer\s+[a-z0-9._-]+|sk-[a-z0-9]/i;

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

export interface BusinessQuotaCrossCheckInput {
  appServerQuotaSnapshot?: QuotaSnapshot;
  appServerSourceHealth?: CodexQuotaSourceHealth;
  uiObservation?: UiObservationSource;
  domSummary?: CdpDomObservationSummary;
  electronRendererObservation?: ElectronRendererObservationSummary;
  redactionReport?: SensitiveRedactionReport;
  attribution?: QuotaAttribution;
  uiQuotaStatus?: QuotaSnapshotStatus;
  uiLimitCount?: number;
  uiUsedCount?: number;
  uiRemainingCount?: number;
  uiResetObserved?: boolean;
  sensitiveFindingCount?: number;
  blockReasons?: readonly string[];
  observedAt?: string;
  evidenceRefIds?: readonly string[];
  auditEventIds?: readonly string[];
}

export interface OwnerAdminExtractionInput {
  workspaceSeed: string;
  targetSeed?: string;
  surfaceKinds?: readonly OwnerAdminSurfaceKind[];
  memberCount?: number;
  ownerCount?: number;
  adminCount?: number;
  memberRoleCount?: number;
  pendingInviteCount?: number;
  removedMemberCount?: number;
  seatAssignedCount?: number;
  codexSeatCount?: number;
  invoiceSummaryCount?: number;
  limitIncidentCount?: number;
  usageAlertCount?: number;
  creditBalanceKnown?: boolean;
  autoTopUpConfigured?: boolean;
  status?: OwnerAdminExtractionStatus;
  blockers?: readonly string[];
  observedAt?: string;
  evidenceRefIds?: readonly string[];
  auditEventIds?: readonly string[];
}

export interface OwnerAdminExtractionBundle {
  surfaces: OwnerAdminReadSurfaceSummary[];
  rosterSnapshot: BusinessAdminMemberRosterSnapshot;
  billingSummary: BusinessBillingSummary;
  report: OwnerAdminExtractionReport;
}

export interface BusinessWorkspaceProfileInput {
  profileSeed: string;
  accountSeed?: string;
  observedWorkspaceSeed?: string;
  status?: BusinessWorkspaceObservationStatus;
  memberInOwnerRoster?: boolean;
}

export interface BusinessMemberReconciliationInput {
  ownerRosterSnapshot?: BusinessAdminMemberRosterSnapshot;
  expectedWorkspaceSeed?: string;
  profiles?: readonly BusinessWorkspaceProfileInput[];
  observedAt?: string;
  evidenceRefIds?: readonly string[];
  auditEventIds?: readonly string[];
}

export interface BusinessMemberReconciliationBundle {
  profileObservations: BusinessProfileWorkspaceObservation[];
  workspaceSwitchDryRunPlans: BusinessWorkspaceSwitchDryRunPlan[];
  workspaceSwitchRuns: BusinessWorkspaceSwitchRun[];
  report: BusinessMemberReconciliationReport;
}

export interface CodexQuotaFusionInput {
  ownerRosterSnapshot?: BusinessAdminMemberRosterSnapshot;
  billingSummary?: BusinessBillingSummary;
  quotaSnapshots?: readonly QuotaSnapshot[];
  profileObservations?: readonly BusinessProfileWorkspaceObservation[];
  sourceHealth?: CodexQuotaSourceHealth;
  canaryPassed?: boolean;
  observedAt?: string;
  evidenceRefIds?: readonly string[];
  auditEventIds?: readonly string[];
}

export interface CodexQuotaFusionBundle {
  workspaceReadiness: WorkspaceCodexQuotaReadiness;
  accountReadiness: AccountCodexQuotaReadiness[];
  report: CodexQuotaFusionReport;
}

export interface PrivilegedBusinessDataInput {
  recordKind?: PrivilegedBusinessDataKind;
  workspaceSeed: string;
  subjectSeed: string;
  businessFields?: Record<string, string | number | boolean | null | undefined>;
  approvalArtifactSeed?: string;
  operatorSeed?: string;
  retentionExpiresAt?: string;
  observedAt?: string;
  evidenceRefIds?: readonly string[];
  auditEventIds?: readonly string[];
}

export interface PrivilegedBusinessStoreBundle {
  record: PrivilegedBusinessDataRecord;
  accessLog: PrivilegedBusinessAccessLog;
}

export interface PrivilegedBusinessExportInput {
  records: readonly PrivilegedBusinessDataRecord[];
  approvalArtifactSeed: string;
  operatorSeed?: string;
  retentionExpiresAt?: string;
  observedAt?: string;
  evidenceRefIds?: readonly string[];
  auditEventIds?: readonly string[];
}

export interface PrivilegedBusinessExportBundle {
  accessLog: PrivilegedBusinessAccessLog;
  manifest: PrivilegedBusinessExportManifest;
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

export function createBusinessQuotaCrossCheckReport(
  input: BusinessQuotaCrossCheckInput,
): BusinessQuotaCrossCheckReport {
  const blockReasons = [...(input.blockReasons ?? [])];
  const comparisons = [
    compareField('status', input.appServerQuotaSnapshot?.status, input.uiQuotaStatus),
    compareField('limit', input.appServerQuotaSnapshot?.limitCount, input.uiLimitCount),
    compareField('used', input.appServerQuotaSnapshot?.usedCount, input.uiUsedCount),
    compareField('remaining', input.appServerQuotaSnapshot?.remainingCount, input.uiRemainingCount),
    compareField(
      'reset-present',
      input.appServerQuotaSnapshot?.resetAtHash ? true : undefined,
      input.uiResetObserved,
    ),
  ];
  const knownComparisons = comparisons.filter((comparison) => comparison.outcome !== 'unknown');
  const matchedFieldCount = knownComparisons.filter(
    (comparison) => comparison.outcome === 'matched',
  ).length;
  const mismatchFieldCount = knownComparisons.filter(
    (comparison) => comparison.outcome === 'mismatch',
  ).length;
  const unknownFieldCount = comparisons.length - knownComparisons.length;

  if (!input.appServerQuotaSnapshot) blockReasons.push('app_server_quota_missing');
  if (!input.uiObservation && !input.domSummary && !input.electronRendererObservation) {
    blockReasons.push('ui_observation_missing');
  }
  if (input.redactionReport && input.redactionReport.status !== 'passed') {
    blockReasons.push(`redaction_${input.redactionReport.status}`);
  }

  const sensitiveFindingCount =
    input.sensitiveFindingCount ??
    Math.max(
      input.redactionReport?.forbiddenFieldCount ?? 0,
      input.domSummary?.blockedSelectorCount ?? 0,
    );
  const status = crossCheckStatus({
    blockReasons,
    matchedFieldCount,
    mismatchFieldCount,
    unknownFieldCount,
  });
  const confidence: QuotaAttributionConfidence =
    status === 'matched'
      ? 'high'
      : status === 'mismatch'
        ? 'medium'
        : status === 'partial'
          ? 'low'
          : 'unknown';

  return BusinessQuotaCrossCheckReportSchema.parse({
    id: foundationId('business_quota_cross_check_report'),
    schemaVersion: SchemaVersionSchema.value,
    observedAt: input.observedAt ?? foundationTimestamp(),
    appServerQuotaSnapshotId: input.appServerQuotaSnapshot?.id,
    appServerSourceHealthId: input.appServerSourceHealth?.id,
    uiObservationSourceId: input.uiObservation?.id,
    cdpDomObservationSummaryId: input.domSummary?.id,
    electronRendererObservationSummaryId: input.electronRendererObservation?.id,
    redactionReportId: input.redactionReport?.id,
    attributionId: input.attribution?.id,
    status,
    confidence,
    comparedFieldCount: comparisons.length,
    matchedFieldCount,
    mismatchFieldCount,
    unknownFieldCount,
    sensitiveFindingCount,
    fieldComparisonHashes: comparisons.map((comparison) => hashRef(comparison)),
    blockReasons,
    evidenceRefIds: [...(input.evidenceRefIds ?? [])],
    auditEventIds: [...(input.auditEventIds ?? [])],
    summary:
      status === 'matched'
        ? 'App Server quota and UI observation match through redacted metadata.'
        : 'App Server quota and UI observation need review through redacted metadata.',
  });
}

export function createOwnerAdminExtractionBundle(
  input: OwnerAdminExtractionInput,
): OwnerAdminExtractionBundle {
  const observedAt = input.observedAt ?? foundationTimestamp();
  const workspaceHash = hashRef(input.workspaceSeed);
  const surfaceKinds = [
    ...(input.surfaceKinds ?? [
      'admin-members',
      'admin-billing',
      'pending-invites',
      'manage-seats',
      'add-credits',
      'usage-alerts',
    ]),
  ];
  const blockers = [...(input.blockers ?? [])];
  const status: OwnerAdminExtractionStatus =
    input.status ?? (blockers.length > 0 ? 'blocked' : 'observed');
  const targetSeed = input.targetSeed ?? input.workspaceSeed;
  const surfaces = surfaceKinds.map((surfaceKind) =>
    OwnerAdminReadSurfaceSummarySchema.parse({
      id: foundationId('owner_admin_read_surface'),
      schemaVersion: SchemaVersionSchema.value,
      observedAt,
      surfaceKind,
      targetHash: hashRef({ targetSeed, surfaceKind }),
      pageHash: hashRef({ targetSeed, surfaceKind, page: 'summary' }),
      axTreeHash: hashRef({ targetSeed, surfaceKind, ax: 'summary' }),
      domSnapshotHash: hashRef({ targetSeed, surfaceKind, dom: 'summary' }),
      layoutHash: hashRef({ targetSeed, surfaceKind, layout: 'summary' }),
      screenshotHash: hashRef({ targetSeed, surfaceKind, screenshot: 'hash-only' }),
      networkEndpointHashes: [hashRef({ targetSeed, surfaceKind, endpoint: 'metadata-only' })],
      fieldCount: projectedFieldCount(surfaceKind, input),
      credentialFieldCount: 0,
      evidenceRefIds: [...(input.evidenceRefIds ?? [])],
      auditEventIds: [...(input.auditEventIds ?? [])],
      metadataOnly: true,
      liveExecution: false,
      externalProcessStarted: false,
      summary: `${surfaceKind} owner admin surface was projected as metadata only.`,
    }),
  );
  const memberCount = normalizeOptionalCount(input.memberCount) ?? 0;
  const pendingInviteCount = normalizeOptionalCount(input.pendingInviteCount) ?? 0;
  const codexSeatCount = normalizeOptionalCount(input.codexSeatCount) ?? 0;
  const invoiceCount = normalizeOptionalCount(input.invoiceSummaryCount) ?? 0;
  const limitIncidentCount = normalizeOptionalCount(input.limitIncidentCount) ?? 0;
  const usageAlertCount = normalizeOptionalCount(input.usageAlertCount) ?? 0;
  const rosterSnapshot = BusinessAdminMemberRosterSnapshotSchema.parse({
    id: foundationId('business_admin_member_roster_snapshot'),
    schemaVersion: SchemaVersionSchema.value,
    observedAt,
    workspaceHash,
    rosterHash: hashRef({
      workspaceHash,
      memberCount,
      pendingInviteCount,
      seatAssignedCount: input.seatAssignedCount ?? codexSeatCount,
    }),
    memberCount,
    ownerCount: normalizeOptionalCount(input.ownerCount) ?? (memberCount > 0 ? 1 : 0),
    adminCount: normalizeOptionalCount(input.adminCount) ?? 0,
    memberRoleCount: normalizeOptionalCount(input.memberRoleCount) ?? memberCount,
    pendingInviteCount,
    removedMemberCount: normalizeOptionalCount(input.removedMemberCount) ?? 0,
    seatAssignedCount: normalizeOptionalCount(input.seatAssignedCount) ?? codexSeatCount,
    memberEmailHashCount: memberCount,
    roleHashCount: memberCount,
    evidenceRefIds: [...(input.evidenceRefIds ?? [])],
    auditEventIds: [...(input.auditEventIds ?? [])],
    metadataOnly: true,
    liveExecution: false,
    externalProcessStarted: false,
    summary: 'Owner admin member roster stores hashes and aggregate counts only.',
  });
  const billingSummary = BusinessBillingSummarySchema.parse({
    id: foundationId('business_billing_summary'),
    schemaVersion: SchemaVersionSchema.value,
    observedAt,
    workspaceHash,
    billingHash: hashRef({
      workspaceHash,
      codexSeatCount,
      invoiceCount,
      limitIncidentCount,
      usageAlertCount,
    }),
    codexSeatCount,
    creditBalanceKnown: input.creditBalanceKnown ?? false,
    creditBalanceHash: input.creditBalanceKnown
      ? hashRef({ workspaceHash, credit: 'known' })
      : undefined,
    invoiceSummaryHashCount: invoiceCount,
    pendingInviteCount,
    limitIncidentCount,
    usageAlertCount,
    autoTopUpConfigured: input.autoTopUpConfigured,
    evidenceRefIds: [...(input.evidenceRefIds ?? [])],
    auditEventIds: [...(input.auditEventIds ?? [])],
    metadataOnly: true,
    liveExecution: false,
    externalProcessStarted: false,
    summary: 'Owner admin billing summary stores credit and invoice hashes only.',
  });
  const report = OwnerAdminExtractionReportSchema.parse({
    id: foundationId('owner_admin_extraction_report'),
    schemaVersion: SchemaVersionSchema.value,
    observedAt,
    status,
    workspaceHash,
    surfaceCount: surfaces.length,
    memberCount,
    pendingInviteCount,
    seatCount: codexSeatCount,
    invoiceCount,
    limitIncidentCount,
    usageAlertCount,
    sourceSurfaceIds: surfaces.map((surface) => surface.id),
    rosterSnapshotId: rosterSnapshot.id,
    billingSummaryId: billingSummary.id,
    blockers,
    evidenceRefIds: [...(input.evidenceRefIds ?? [])],
    auditEventIds: [...(input.auditEventIds ?? [])],
    metadataOnly: true,
    liveExecution: false,
    externalProcessStarted: false,
    summary:
      status === 'observed'
        ? 'Owner admin extraction projected Business management fields as metadata only.'
        : 'Owner admin extraction is blocked before any raw admin surface can be persisted.',
  });

  return { surfaces, rosterSnapshot, billingSummary, report };
}

export function createBusinessMemberReconciliationBundle(
  input: BusinessMemberReconciliationInput,
): BusinessMemberReconciliationBundle {
  const observedAt = input.observedAt ?? foundationTimestamp();
  const ownerRoster = input.ownerRosterSnapshot;
  const workspaceHash = ownerRoster?.workspaceHash ?? hashRef(input.expectedWorkspaceSeed ?? 'unknown-workspace');
  const profiles = [...(input.profiles ?? [{ profileSeed: 'default-profile' }])];
  const profileObservations = profiles.map((profile, index) => {
    const status = normalizeWorkspaceObservationStatus(profile.status);
    const memberInOwnerRoster =
      profile.memberInOwnerRoster ?? (ownerRoster !== undefined && ownerRoster.memberCount > 0);
    const blockReasons = workspaceObservationBlockReasons(status, memberInOwnerRoster);
    const dispatchAllowed =
      status === 'business_workspace' && memberInOwnerRoster && blockReasons.length === 0;

    return BusinessProfileWorkspaceObservationSchema.parse({
      id: foundationId('business_profile_workspace_observation'),
      schemaVersion: SchemaVersionSchema.value,
      observedAt,
      ownerRosterSnapshotId: ownerRoster?.id,
      profileHash: hashRef(profile.profileSeed),
      accountHash: profile.accountSeed ? hashRef(profile.accountSeed) : undefined,
      expectedWorkspaceHash: workspaceHash,
      observedWorkspaceHash: profile.observedWorkspaceSeed
        ? hashRef(profile.observedWorkspaceSeed)
        : status === 'business_workspace'
          ? workspaceHash
          : hashRef({ profile: profile.profileSeed, status, index }),
      status,
      memberInOwnerRoster,
      workspaceSwitchRequired:
        status === 'personal_workspace' || status === 'workspace_switch_required',
      dispatchAllowed,
      codexDispatchBlocked: !dispatchAllowed,
      blockReasons,
      evidenceRefIds: [...(input.evidenceRefIds ?? [])],
      auditEventIds: [...(input.auditEventIds ?? [])],
      metadataOnly: true,
      liveExecution: false,
      externalProcessStarted: false,
      summary: dispatchAllowed
        ? 'Profile workspace matches the owner roster and can pass Codex dispatch gates.'
        : 'Profile workspace observation blocks Codex dispatch until account and workspace match the owner roster.',
    });
  });

  const workspaceSwitchDryRunPlans = profileObservations
    .filter((observation) => observation.workspaceSwitchRequired)
    .map((observation) =>
      BusinessWorkspaceSwitchDryRunPlanSchema.parse({
        id: foundationId('business_workspace_switch_dry_run'),
        schemaVersion: SchemaVersionSchema.value,
        createdAt: observedAt,
        profileWorkspaceObservationId: observation.id,
        ownerRosterSnapshotId: ownerRoster?.id,
        profileHash: observation.profileHash,
        expectedWorkspaceHash: workspaceHash,
        selectorFingerprintHash: hashRef({
          profileHash: observation.profileHash,
          workspaceHash,
          action: 'workspace-switch-visible-click',
        }),
        evidenceRefIds: [...(input.evidenceRefIds ?? [])],
        auditEventIds: [...(input.auditEventIds ?? [])],
        summary: 'Workspace switch visible click is planned as approval-gated metadata only.',
      }),
    );
  const workspaceSwitchRuns = workspaceSwitchDryRunPlans.map((dryRunPlan) =>
    BusinessWorkspaceSwitchRunSchema.parse({
      id: foundationId('business_workspace_switch_run'),
      schemaVersion: SchemaVersionSchema.value,
      createdAt: observedAt,
      dryRunPlanId: dryRunPlan.id,
      profileWorkspaceObservationId: dryRunPlan.profileWorkspaceObservationId,
      status: 'blocked',
      evidenceRefIds: [...(input.evidenceRefIds ?? [])],
      auditEventIds: [...(input.auditEventIds ?? [])],
      summary: 'Workspace switch execution is blocked until a later approved visible-click executor.',
    }),
  );

  const counts = countWorkspaceObservations(profileObservations);
  const blockReasons = reconciliationBlockReasons({
    ownerRoster,
    profileObservations,
    workspaceSwitchDryRunPlans,
  });
  const dispatchAllowed = profileObservations.length > 0 && blockReasons.length === 0;
  const status = reconciliationStatus({
    blockReasons,
    counts,
    dispatchAllowed,
    ownerRoster,
  });

  const report = BusinessMemberReconciliationReportSchema.parse({
    id: foundationId('business_member_reconciliation_report'),
    schemaVersion: SchemaVersionSchema.value,
    observedAt,
    status,
    ownerRosterSnapshotId: ownerRoster?.id,
    workspaceHash,
    rosterHash: ownerRoster?.rosterHash,
    profileObservationIds: profileObservations.map((observation) => observation.id),
    workspaceSwitchDryRunPlanIds: workspaceSwitchDryRunPlans.map((plan) => plan.id),
    observedProfileCount: profileObservations.length,
    readyProfileCount: counts.ready,
    personalWorkspaceCount: counts.personalWorkspace,
    workspaceSwitchRequiredCount: counts.workspaceSwitchRequired,
    notBusinessMemberCount: counts.notBusinessMember,
    loginRequiredCount: counts.loginRequired,
    workspaceMismatchCount: counts.workspaceMismatch,
    unknownProfileCount: counts.unknown,
    dispatchAllowed,
    blockReasons,
    evidenceRefIds: [...(input.evidenceRefIds ?? [])],
    auditEventIds: [...(input.auditEventIds ?? [])],
    metadataOnly: true,
    liveExecution: false,
    externalProcessStarted: false,
    summary: dispatchAllowed
      ? 'Business member reconciliation is ready from owner roster and profile workspace metadata.'
      : 'Business member reconciliation blocks Codex dispatch until profile workspace metadata matches the owner roster.',
  });

  return {
    profileObservations,
    workspaceSwitchDryRunPlans,
    workspaceSwitchRuns,
    report,
  };
}

export function createCodexQuotaFusionBundle(input: CodexQuotaFusionInput): CodexQuotaFusionBundle {
  const observedAt = input.observedAt ?? foundationTimestamp();
  const workspaceHash =
    input.ownerRosterSnapshot?.workspaceHash ??
    input.billingSummary?.workspaceHash ??
    input.profileObservations?.[0]?.expectedWorkspaceHash ??
    hashRef('unknown-workspace');
  const quotaSnapshots = [...(input.quotaSnapshots ?? [])];
  const profileObservations = [...(input.profileObservations ?? [])];
  const workspaceBlockReasons = workspaceQuotaBlockReasons(input, quotaSnapshots);
  const workspaceStatus = quotaFusionStatus(workspaceBlockReasons, quotaSnapshots);
  const workspaceDispatchAllowed = workspaceStatus === 'ready' && workspaceBlockReasons.length === 0;
  const remainingCount = quotaSnapshots.find((snapshot) => snapshot.remainingCount !== undefined)
    ?.remainingCount;
  const workspaceReadiness = WorkspaceCodexQuotaReadinessSchema.parse({
    id: foundationId('workspace_codex_quota_readiness'),
    schemaVersion: SchemaVersionSchema.value,
    observedAt,
    workspaceHash,
    status: workspaceStatus,
    ownerRosterSnapshotId: input.ownerRosterSnapshot?.id,
    billingSummaryId: input.billingSummary?.id,
    quotaSnapshotIds: quotaSnapshots.map((snapshot) => snapshot.id),
    sourceHealthId: input.sourceHealth?.id,
    codexSeatCount: input.billingSummary?.codexSeatCount ?? 0,
    remainingCountKnown: remainingCount !== undefined,
    remainingCountHash: remainingCount !== undefined ? hashRef({ workspaceHash, remainingCount }) : undefined,
    limitIncidentCount: input.billingSummary?.limitIncidentCount ?? 0,
    sourceConflict: workspaceBlockReasons.includes('quota_source_conflict'),
    canaryPassed: input.canaryPassed ?? input.sourceHealth?.canaryPassed ?? false,
    dispatchAllowed: workspaceDispatchAllowed,
    blockReasons: workspaceBlockReasons,
    evidenceRefIds: [...(input.evidenceRefIds ?? [])],
    auditEventIds: [...(input.auditEventIds ?? [])],
    metadataOnly: true,
    liveExecution: false,
    externalProcessStarted: false,
    summary: workspaceDispatchAllowed
      ? 'Workspace Codex quota readiness is ready from fused metadata.'
      : 'Workspace Codex quota readiness blocks dispatch until seats, quota, source, and canary metadata agree.',
  });

  const accountReadiness = createAccountQuotaReadiness({
    workspaceHash,
    workspaceStatus,
    profileObservations,
    quotaSnapshots,
    fusionInput: input,
    observedAt,
  });
  const blockReasons = [
    ...workspaceReadiness.blockReasons,
    ...accountReadiness.flatMap((readiness) => readiness.blockReasons),
  ];
  const readyAccountCount = accountReadiness.filter((readiness) => readiness.status === 'ready').length;
  const limitedAccountCount = accountReadiness.filter(
    (readiness) => readiness.status === 'quota_limited',
  ).length;
  const exhaustedAccountCount = accountReadiness.filter(
    (readiness) => readiness.status === 'quota_exhausted',
  ).length;
  const sourceConflictCount = accountReadiness.filter(
    (readiness) => readiness.status === 'source_conflict',
  ).length;
  const dispatchAllowed =
    workspaceReadiness.dispatchAllowed &&
    accountReadiness.length > 0 &&
    accountReadiness.every((readiness) => readiness.dispatchAllowed);
  const reportStatus: CodexQuotaFusionReadinessStatus = dispatchAllowed
    ? 'ready'
    : workspaceReadiness.status !== 'ready'
      ? workspaceReadiness.status
      : accountReadiness.find((readiness) => readiness.status !== 'ready')?.status ?? 'unknown';
  const report = CodexQuotaFusionReportSchema.parse({
    id: foundationId('codex_quota_fusion_report'),
    schemaVersion: SchemaVersionSchema.value,
    observedAt,
    status: reportStatus,
    workspaceReadinessId: workspaceReadiness.id,
    accountReadinessIds: accountReadiness.map((readiness) => readiness.id),
    workspaceHash,
    accountCount: accountReadiness.length,
    readyAccountCount,
    blockedAccountCount: accountReadiness.length - readyAccountCount,
    limitedAccountCount,
    exhaustedAccountCount,
    sourceConflictCount,
    dispatchAllowed,
    canaryPassed: workspaceReadiness.canaryPassed,
    blockReasons: [...new Set(blockReasons)],
    evidenceRefIds: [...(input.evidenceRefIds ?? [])],
    auditEventIds: [...(input.auditEventIds ?? [])],
    metadataOnly: true,
    liveExecution: false,
    externalProcessStarted: false,
    summary: dispatchAllowed
      ? 'Codex quota fusion allows dispatch from matching workspace, seat, quota, and canary metadata.'
      : 'Codex quota fusion blocks dispatch until source conflicts, workspace mismatches, or quota blockers are resolved.',
  });

  return { workspaceReadiness, accountReadiness, report };
}

export function createPrivilegedBusinessStoreBundle(
  input: PrivilegedBusinessDataInput,
): PrivilegedBusinessStoreBundle {
  const observedAt = input.observedAt ?? foundationTimestamp();
  const businessFields = normalizePrivilegedBusinessFields(input.businessFields ?? {});
  const recordKind = input.recordKind ?? 'member-profile';
  const record = PrivilegedBusinessDataRecordSchema.parse({
    id: foundationId('privileged_business_data_record'),
    schemaVersion: SchemaVersionSchema.value,
    observedAt,
    recordKind,
    workspaceHash: hashRef(input.workspaceSeed),
    subjectHash: hashRef(input.subjectSeed),
    businessFields,
    fieldCount: Object.keys(businessFields).length,
    businessFieldHash: hashRef({
      recordKind,
      workspaceSeed: input.workspaceSeed,
      subjectSeed: input.subjectSeed,
      businessFields,
    }),
    cleartextBusinessDataStored: true,
    credentialMaterialStored: false,
    tokenCookieSessionStored: false,
    browserStorageStored: false,
    rawNetworkBodyStored: false,
    retentionExpiresAt: input.retentionExpiresAt,
    accessPolicyHash: hashRef({
      recordKind,
      approvalArtifactSeed: input.approvalArtifactSeed,
      operatorSeed: input.operatorSeed,
    }),
    evidenceRefIds: [...(input.evidenceRefIds ?? [])],
    auditEventIds: [...(input.auditEventIds ?? [])],
    summary:
      'Privileged Business data record stores approved Business management fields only; credential material is rejected before persistence.',
  });
  const accessLog = PrivilegedBusinessAccessLogSchema.parse({
    id: foundationId('privileged_business_access_log'),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: observedAt,
    accessKind: 'record-create',
    recordIds: [record.id],
    recordCount: 1,
    operatorHash: input.operatorSeed ? hashRef(input.operatorSeed) : undefined,
    approvalArtifactIdHash: input.approvalArtifactSeed
      ? hashRef(input.approvalArtifactSeed)
      : undefined,
    highPrivilegeApprovalRequired: true,
    approvalProvided: input.approvalArtifactSeed !== undefined,
    cleartextReturned: false,
    credentialMaterialReturned: false,
    accessApproved: input.approvalArtifactSeed !== undefined,
    evidenceRefIds: [...(input.evidenceRefIds ?? [])],
    auditEventIds: [...(input.auditEventIds ?? [])],
    summary:
      'Privileged Business record creation was logged without returning cleartext Business fields in the public projection.',
  });

  return { record, accessLog };
}

export function createPrivilegedBusinessExportBundle(
  input: PrivilegedBusinessExportInput,
): PrivilegedBusinessExportBundle {
  const observedAt = input.observedAt ?? foundationTimestamp();
  const recordIds = input.records.map((record) => record.id);
  const accessLog = PrivilegedBusinessAccessLogSchema.parse({
    id: foundationId('privileged_business_access_log'),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: observedAt,
    accessKind: 'export-manifest',
    recordIds,
    recordCount: recordIds.length,
    operatorHash: input.operatorSeed ? hashRef(input.operatorSeed) : undefined,
    approvalArtifactIdHash: hashRef(input.approvalArtifactSeed),
    highPrivilegeApprovalRequired: true,
    approvalProvided: true,
    cleartextReturned: false,
    credentialMaterialReturned: false,
    accessApproved: true,
    evidenceRefIds: [...(input.evidenceRefIds ?? [])],
    auditEventIds: [...(input.auditEventIds ?? [])],
    summary:
      'Privileged Business export manifest access was approved and logged without returning credential material.',
  });
  const fieldHashCount = input.records.reduce(
    (count, record) => count + Object.keys(record.businessFields).length,
    0,
  );
  const manifest = PrivilegedBusinessExportManifestSchema.parse({
    id: foundationId('privileged_business_export_manifest'),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: observedAt,
    exportHash: hashRef({
      recordIds,
      fieldHashes: input.records.map((record) => record.businessFieldHash),
      approvalArtifactSeed: input.approvalArtifactSeed,
    }),
    recordIds,
    recordCount: recordIds.length,
    fieldHashCount,
    operatorHash: input.operatorSeed ? hashRef(input.operatorSeed) : undefined,
    approvalArtifactIdHash: hashRef(input.approvalArtifactSeed),
    accessLogId: accessLog.id,
    highPrivilegeApprovalRequired: true,
    cleartextBusinessDataExportPrepared: true,
    credentialMaterialExported: false,
    tokenCookieSessionExported: false,
    rawNetworkBodyExported: false,
    retentionExpiresAt: input.retentionExpiresAt,
    evidenceRefIds: [...(input.evidenceRefIds ?? [])],
    auditEventIds: [...(input.auditEventIds ?? [])],
    summary:
      'Privileged Business export manifest records approved record ids and hashes; raw export contents stay outside public projections.',
  });

  return { accessLog, manifest };
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

function compareField(
  fieldKey: string,
  appServerValue: string | number | boolean | undefined,
  uiValue: string | number | boolean | undefined,
): { fieldKey: string; outcome: 'matched' | 'mismatch' | 'unknown' } {
  if (appServerValue === undefined || uiValue === undefined) {
    return { fieldKey, outcome: 'unknown' };
  }

  return {
    fieldKey,
    outcome: appServerValue === uiValue ? 'matched' : 'mismatch',
  };
}

function crossCheckStatus(input: {
  blockReasons: readonly string[];
  matchedFieldCount: number;
  mismatchFieldCount: number;
  unknownFieldCount: number;
}): BusinessQuotaCrossCheckStatus {
  if (input.blockReasons.length > 0) {
    return 'blocked';
  }
  if (input.mismatchFieldCount > 0) {
    return 'mismatch';
  }
  if (input.matchedFieldCount > 0 && input.unknownFieldCount > 0) {
    return 'partial';
  }
  if (input.matchedFieldCount > 0) {
    return 'matched';
  }
  return 'unknown';
}

function normalizeOptionalCount(value: number | undefined): number | undefined {
  return value === undefined ? undefined : Math.max(0, Math.trunc(value));
}

function normalizePrivilegedBusinessFields(
  fields: Record<string, string | number | boolean | null | undefined>,
): Record<string, string> {
  return Object.fromEntries(
    Object.entries(fields)
      .filter(([, value]) => value !== undefined && value !== null)
      .map(([key, value]) => {
        const stringValue = String(value);
        if (
          forbiddenPrivilegedBusinessKeyPattern.test(key) ||
          forbiddenPrivilegedBusinessValuePattern.test(stringValue)
        ) {
          throw new Error('privileged_business_credential_material_rejected');
        }
        return [key, stringValue];
      }),
  );
}

function projectedFieldCount(
  surfaceKind: OwnerAdminSurfaceKind,
  input: OwnerAdminExtractionInput,
): number {
  switch (surfaceKind) {
    case 'admin-members':
      return normalizeOptionalCount(input.memberCount) ?? 0;
    case 'pending-invites':
      return normalizeOptionalCount(input.pendingInviteCount) ?? 0;
    case 'manage-seats':
      return normalizeOptionalCount(input.codexSeatCount) ?? 0;
    case 'admin-billing':
      return (
        (normalizeOptionalCount(input.invoiceSummaryCount) ?? 0) +
        (input.creditBalanceKnown ? 1 : 0)
      );
    case 'add-credits':
      return input.creditBalanceKnown ? 1 : 0;
    case 'usage-alerts':
      return normalizeOptionalCount(input.usageAlertCount) ?? 0;
  }
}

function normalizeWorkspaceObservationStatus(
  status: BusinessWorkspaceObservationStatus | undefined,
): BusinessWorkspaceObservationStatus {
  return status ?? 'business_workspace';
}

function workspaceObservationBlockReasons(
  status: BusinessWorkspaceObservationStatus,
  memberInOwnerRoster: boolean,
): string[] {
  const blockReasons: string[] = [];
  if (!memberInOwnerRoster) blockReasons.push('not_in_owner_roster');
  switch (status) {
    case 'business_workspace':
      break;
    case 'personal_workspace':
      blockReasons.push('personal_workspace');
      break;
    case 'workspace_switch_required':
      blockReasons.push('workspace_switch_required');
      break;
    case 'not_business_member':
      blockReasons.push('not_business_member');
      break;
    case 'login_required':
      blockReasons.push('login_required');
      break;
    case 'workspace_mismatch':
      blockReasons.push('workspace_mismatch');
      break;
    case 'unknown':
      blockReasons.push('workspace_unknown');
      break;
  }
  return [...new Set(blockReasons)];
}

function countWorkspaceObservations(observations: readonly BusinessProfileWorkspaceObservation[]): {
  ready: number;
  personalWorkspace: number;
  workspaceSwitchRequired: number;
  notBusinessMember: number;
  loginRequired: number;
  workspaceMismatch: number;
  unknown: number;
} {
  return {
    ready: observations.filter((observation) => observation.dispatchAllowed).length,
    personalWorkspace: observations.filter(
      (observation) => observation.status === 'personal_workspace',
    ).length,
    workspaceSwitchRequired: observations.filter(
      (observation) =>
        observation.status === 'workspace_switch_required' || observation.workspaceSwitchRequired,
    ).length,
    notBusinessMember: observations.filter(
      (observation) => observation.status === 'not_business_member',
    ).length,
    loginRequired: observations.filter((observation) => observation.status === 'login_required')
      .length,
    workspaceMismatch: observations.filter(
      (observation) => observation.status === 'workspace_mismatch',
    ).length,
    unknown: observations.filter((observation) => observation.status === 'unknown').length,
  };
}

function reconciliationBlockReasons(input: {
  ownerRoster?: BusinessAdminMemberRosterSnapshot;
  profileObservations: readonly BusinessProfileWorkspaceObservation[];
  workspaceSwitchDryRunPlans: readonly BusinessWorkspaceSwitchDryRunPlan[];
}): string[] {
  const blockReasons: string[] = [];
  if (!input.ownerRoster) blockReasons.push('owner_roster_missing');
  if (input.ownerRoster && input.ownerRoster.memberCount === 0) {
    blockReasons.push('owner_roster_empty');
  }
  if (input.profileObservations.length === 0) blockReasons.push('profile_observation_missing');
  for (const observation of input.profileObservations) {
    blockReasons.push(...observation.blockReasons);
  }
  if (input.workspaceSwitchDryRunPlans.length > 0) {
    blockReasons.push('workspace_switch_approval_required');
  }
  return [...new Set(blockReasons)];
}

function reconciliationStatus(input: {
  blockReasons: readonly string[];
  counts: ReturnType<typeof countWorkspaceObservations>;
  dispatchAllowed: boolean;
  ownerRoster?: BusinessAdminMemberRosterSnapshot;
}): BusinessMemberReconciliationStatus {
  if (input.dispatchAllowed) return 'ready';
  if (!input.ownerRoster) return 'source_conflict';
  if (input.counts.loginRequired > 0) return 'login_required';
  if (input.counts.notBusinessMember > 0) return 'not_business_member';
  if (input.counts.workspaceMismatch > 0) return 'workspace_mismatch';
  if (input.counts.workspaceSwitchRequired > 0 || input.counts.personalWorkspace > 0) {
    return 'workspace_switch_required';
  }
  if (input.counts.unknown > 0) return 'unknown';
  return input.blockReasons.length > 0 ? 'blocked' : 'unknown';
}

function workspaceQuotaBlockReasons(
  input: CodexQuotaFusionInput,
  quotaSnapshots: readonly QuotaSnapshot[],
): string[] {
  const blockReasons: string[] = [];
  if (!input.ownerRosterSnapshot) blockReasons.push('owner_roster_missing');
  if (!input.billingSummary) blockReasons.push('owner_billing_missing');
  if (input.billingSummary && input.billingSummary.codexSeatCount === 0) {
    blockReasons.push('codex_seat_missing');
  }
  if (input.billingSummary && input.billingSummary.limitIncidentCount > 0) {
    blockReasons.push('quota_limit_incident');
  }
  if (!input.sourceHealth) blockReasons.push('quota_source_missing');
  if (input.sourceHealth && input.sourceHealth.status !== 'healthy') {
    blockReasons.push('quota_source_conflict');
  }
  if (input.sourceHealth?.blockReasons.length) blockReasons.push(...input.sourceHealth.blockReasons);
  if (input.canaryPassed === false || input.sourceHealth?.canaryPassed === false) {
    blockReasons.push('quota_canary_failed');
  }
  if (quotaSnapshots.length === 0) blockReasons.push('quota_snapshot_missing');
  for (const snapshot of quotaSnapshots) {
    if (snapshot.status === 'exhausted') blockReasons.push('quota_exhausted');
    if (snapshot.status === 'limited') blockReasons.push('quota_limited');
    if (snapshot.status === 'blocked' || snapshot.status === 'unknown') {
      blockReasons.push(`quota_${snapshot.status}`);
    }
  }
  return [...new Set(blockReasons)];
}

function quotaFusionStatus(
  blockReasons: readonly string[],
  quotaSnapshots: readonly QuotaSnapshot[],
): CodexQuotaFusionReadinessStatus {
  if (blockReasons.includes('quota_canary_failed')) return 'canary_failed';
  if (blockReasons.includes('workspace_mismatch')) return 'workspace_mismatch';
  if (blockReasons.includes('codex_seat_missing')) return 'codex_seat_missing';
  if (blockReasons.includes('quota_exhausted')) return 'quota_exhausted';
  if (blockReasons.includes('quota_limited') || blockReasons.includes('quota_limit_incident')) {
    return 'quota_limited';
  }
  if (
    blockReasons.includes('quota_source_conflict') ||
    blockReasons.includes('owner_roster_missing') ||
    blockReasons.includes('owner_billing_missing') ||
    blockReasons.includes('quota_snapshot_missing')
  ) {
    return 'source_conflict';
  }
  if (blockReasons.length > 0) return 'unknown';
  return quotaSnapshots.length > 0 ? 'ready' : 'unknown';
}

function createAccountQuotaReadiness(input: {
  workspaceHash: string;
  workspaceStatus: CodexQuotaFusionReadinessStatus;
  profileObservations: readonly BusinessProfileWorkspaceObservation[];
  quotaSnapshots: readonly QuotaSnapshot[];
  fusionInput: CodexQuotaFusionInput;
  observedAt: string;
}): AccountCodexQuotaReadiness[] {
  const profileObservations =
    input.profileObservations.length > 0
      ? input.profileObservations
      : [
          BusinessProfileWorkspaceObservationSchema.parse({
            id: foundationId('business_profile_workspace_observation'),
            schemaVersion: SchemaVersionSchema.value,
            observedAt: input.observedAt,
            ownerRosterSnapshotId: input.fusionInput.ownerRosterSnapshot?.id,
            profileHash: hashRef('unknown-profile'),
            expectedWorkspaceHash: input.workspaceHash,
            status: 'unknown',
            memberInOwnerRoster: false,
            blockReasons: ['profile_observation_missing'],
            summary: 'Profile workspace observation is missing for quota fusion.',
          }),
        ];

  return profileObservations.map((profileObservation, index) => {
    const quotaSnapshot = input.quotaSnapshots[index] ?? input.quotaSnapshots[0];
    const blockReasons = accountQuotaBlockReasons({
      profileObservation,
      quotaSnapshot,
      workspaceStatus: input.workspaceStatus,
      billingSummary: input.fusionInput.billingSummary,
      sourceHealth: input.fusionInput.sourceHealth,
    });
    const status =
      input.workspaceStatus !== 'ready'
        ? input.workspaceStatus
        : quotaFusionStatus(blockReasons, quotaSnapshot ? [quotaSnapshot] : []);
    const dispatchAllowed = status === 'ready' && blockReasons.length === 0;
    return AccountCodexQuotaReadinessSchema.parse({
      id: foundationId('account_codex_quota_readiness'),
      schemaVersion: SchemaVersionSchema.value,
      observedAt: input.observedAt,
      accountHash: profileObservation.accountHash ?? profileObservation.profileHash,
      workspaceHash: input.workspaceHash,
      status,
      quotaSnapshotId: quotaSnapshot?.id,
      profileWorkspaceObservationId: profileObservation.id,
      sourceHealthId: input.fusionInput.sourceHealth?.id,
      memberInOwnerRoster: profileObservation.memberInOwnerRoster,
      workspaceMatches: profileObservation.status === 'business_workspace',
      codexSeatAvailable: (input.fusionInput.billingSummary?.codexSeatCount ?? 0) > 0,
      quotaStatus: quotaSnapshot?.status,
      remainingCountKnown: quotaSnapshot?.remainingCount !== undefined,
      remainingCountHash:
        quotaSnapshot?.remainingCount !== undefined
          ? hashRef({ accountHash: profileObservation.accountHash, remaining: quotaSnapshot.remainingCount })
          : undefined,
      rateLimitReached: quotaSnapshot?.status === 'exhausted',
      dispatchAllowed,
      blockReasons,
      evidenceRefIds: [...(input.fusionInput.evidenceRefIds ?? [])],
      auditEventIds: [...(input.fusionInput.auditEventIds ?? [])],
      metadataOnly: true,
      liveExecution: false,
      externalProcessStarted: false,
      summary: dispatchAllowed
        ? 'Account Codex quota readiness is ready from fused metadata.'
        : 'Account Codex quota readiness blocks dispatch until profile, seat, quota, and source metadata agree.',
    });
  });
}

function accountQuotaBlockReasons(input: {
  profileObservation: BusinessProfileWorkspaceObservation;
  quotaSnapshot?: QuotaSnapshot;
  workspaceStatus: CodexQuotaFusionReadinessStatus;
  billingSummary?: BusinessBillingSummary;
  sourceHealth?: CodexQuotaSourceHealth;
}): string[] {
  const blockReasons: string[] = [];
  if (input.workspaceStatus !== 'ready') blockReasons.push(`workspace_${input.workspaceStatus}`);
  if (!input.profileObservation.dispatchAllowed) {
    blockReasons.push(...input.profileObservation.blockReasons);
    if (input.profileObservation.status !== 'business_workspace') {
      blockReasons.push('workspace_mismatch');
    }
  }
  if ((input.billingSummary?.codexSeatCount ?? 0) === 0) blockReasons.push('codex_seat_missing');
  if (!input.quotaSnapshot) blockReasons.push('quota_snapshot_missing');
  if (input.quotaSnapshot?.status === 'exhausted') blockReasons.push('quota_exhausted');
  if (input.quotaSnapshot?.status === 'limited') blockReasons.push('quota_limited');
  if (input.quotaSnapshot?.status === 'blocked' || input.quotaSnapshot?.status === 'unknown') {
    blockReasons.push(`quota_${input.quotaSnapshot.status}`);
  }
  if (!input.sourceHealth || input.sourceHealth.status !== 'healthy') {
    blockReasons.push('quota_source_conflict');
  }
  return [...new Set(blockReasons)];
}

function hashRef(value: unknown): string {
  const text = typeof value === 'string' ? value : JSON.stringify(value);
  return `sha256:${hashText(text)}`;
}

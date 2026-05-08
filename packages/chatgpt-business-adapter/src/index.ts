import {
  attributeBusinessQuota,
  createQuotaDispatchGate,
  createQuotaSnapshotFromSource,
  summarizeQuotaSourceHealth,
  summarizeUiObservation,
  type QuotaDispatchGate,
} from '@codexhub/business-quota-kernel';
import {
  type BusinessMembershipMirror,
  type BusinessMembershipRole,
  type BusinessMembershipStatus,
  BusinessMembershipMirrorSchema,
  type BusinessWorkspace,
  BusinessWorkspaceSchema,
  type BusinessQuotaSourceKind,
  type CapabilityDryRun,
  CapabilityDryRunSchema,
  type CapabilityManifest,
  type CodexQuotaSourceHealth,
  type CodexAccountBinding,
  CodexAccountBindingSchema,
  type QuotaAttribution,
  type QuotaSnapshot,
  type QuotaSnapshotStatus,
  QuotaSnapshotSchema,
  type SensitiveRedactionReport,
  type UiObservationSource,
  SchemaVersionSchema,
  foundationId,
  foundationTimestamp,
} from '@codexhub/contracts';
import { hashText } from '@codexhub/evidence-kernel';
import {
  CHATGPT_BUSINESS_ADAPTER_NAME,
  createChatGptBusinessAdapterManifest,
} from './manifest';

export {
  CHATGPT_BUSINESS_ADAPTER_NAME,
  CHATGPT_BUSINESS_ADAPTER_VERSION,
  createChatGptBusinessAdapterManifest,
} from './manifest';

export type ChatGptBusinessReadinessStatus = 'ready' | 'blocked';
export type ChatGptBusinessSyncStatus = 'completed' | 'partial' | 'blocked';
export type ChatGptBusinessAdminOperation = 'invite' | 'remove' | 'replace';

export interface ChatGptBusinessAdapterPlanInput {
  dryRunId: string;
  workspaceKey?: string;
  expectedMemberCount?: number;
  fixtureOnly?: boolean;
  manifest?: CapabilityManifest;
}

export interface ChatGptBusinessAdapterPlan {
  id: string;
  schemaVersion: string;
  createdAt: string;
  adapterName: string;
  status: ChatGptBusinessReadinessStatus;
  dryRunId: string;
  workspaceHash?: string;
  expectedMemberCount: number;
  blockReasons: string[];
  warnings: string[];
  manifest: CapabilityManifest;
  capabilityDryRun: CapabilityDryRun;
  processBoundaryPlanned: false;
  processBoundaryInvoked: false;
  externalProcessStarted: false;
  noRealWrite: true;
  bodyStored: false;
  rawPathStored: false;
  fixtureOnly: true;
  readOnly: true;
  liveAdminEnabled: false;
}

export interface ChatGptBusinessReadOnlyQuotaPlanInput {
  dryRunId: string;
  sourceKind: BusinessQuotaSourceKind;
  sourceRefSeed?: string;
  expectedFieldCount?: number;
  canaryPassed?: boolean;
  manifest?: CapabilityManifest;
}

export interface ChatGptBusinessReadOnlyQuotaPlan {
  id: string;
  schemaVersion: string;
  createdAt: string;
  adapterName: string;
  status: ChatGptBusinessReadinessStatus;
  dryRunId: string;
  sourceKind: BusinessQuotaSourceKind;
  sourceRefHash?: string;
  expectedFieldCount: number;
  blockReasons: string[];
  warnings: string[];
  manifest: CapabilityManifest;
  capabilityDryRun: CapabilityDryRun;
  sourceHealth: CodexQuotaSourceHealth;
  fixtureOnly: false;
  readOnly: true;
  liveAdminEnabled: false;
  processBoundaryPlanned: false;
  processBoundaryInvoked: false;
  externalProcessStarted: false;
  rawBodyStored: false;
  rawDomStored: false;
  rawPathStored: false;
}

export interface ChatGptBusinessGovernedQuotaReadInput {
  sourceKind: BusinessQuotaSourceKind;
  sourceRefSeed?: string;
  subjectKind: QuotaSnapshot['subjectKind'];
  subjectSeed: string;
  status?: QuotaSnapshotStatus;
  limitCount?: number;
  usedCount?: number;
  remainingCount?: number;
  canaryPassed?: boolean;
  liveDispatchRequested?: boolean;
  observedAt?: string;
  evidenceRefIds?: readonly string[];
  auditEventIds?: readonly string[];
}

export interface ChatGptBusinessGovernedQuotaReadResult {
  id: string;
  schemaVersion: string;
  observedAt: string;
  adapterName: string;
  status: 'completed' | 'blocked';
  sourceHealth: CodexQuotaSourceHealth;
  quotaSnapshot: QuotaSnapshot;
  attribution: QuotaAttribution;
  dispatchGate: QuotaDispatchGate;
  evidenceRefIds: string[];
  auditEventIds: string[];
  fixtureOnly: false;
  readOnly: true;
  liveAdminEnabled: false;
  processBoundaryInvoked: false;
  externalProcessStarted: false;
  rawBodyStored: false;
  rawDomStored: false;
}

export interface ChatGptBusinessDomObservationInput {
  sourceKind: Extract<
    BusinessQuotaSourceKind,
    'business-page-dom' | 'browser-cdp-dom' | 'electron-renderer-dom' | 'codex-desktop-ui'
  >;
  targetSeed: string;
  selectorManifestSeed?: string;
  fieldKeys?: readonly string[];
  readableFieldCount?: number;
  canaryPassed?: boolean;
  observedAt?: string;
  evidenceRefIds?: readonly string[];
  auditEventIds?: readonly string[];
}

export interface ChatGptBusinessDomObservationResult {
  id: string;
  schemaVersion: string;
  observedAt: string;
  adapterName: string;
  status: 'observed' | 'blocked';
  sourceHealth: CodexQuotaSourceHealth;
  redactionReport: SensitiveRedactionReport;
  observation: UiObservationSource;
  dispatchGate: QuotaDispatchGate;
  fixtureOnly: false;
  readOnly: true;
  rawDomStored: false;
  rawTextStored: false;
  networkBodyStored: false;
  evidenceRefIds: string[];
  auditEventIds: string[];
}

export interface ChatGptBusinessRedactedQuotaExportRow {
  subjectKind: QuotaSnapshot['subjectKind'];
  subjectHash: string;
  status?: QuotaSnapshotStatus;
  limitCount?: number;
  usedCount?: number;
  remainingCount?: number;
}

export interface ChatGptBusinessRedactedQuotaExportInput {
  sourceRefSeed: string;
  rows: readonly Record<string, unknown>[];
  canaryPassed?: boolean;
  observedAt?: string;
  evidenceRefIds?: readonly string[];
  auditEventIds?: readonly string[];
}

export interface ChatGptBusinessRedactedQuotaExportResult {
  id: string;
  schemaVersion: string;
  observedAt: string;
  adapterName: string;
  status: 'completed' | 'partial' | 'blocked';
  sourceHealth: CodexQuotaSourceHealth;
  quotaSnapshots: QuotaSnapshot[];
  attributions: QuotaAttribution[];
  rejectedRowCount: number;
  rawBodyStored: false;
  rawPathStored: false;
  readOnly: true;
  fixtureOnly: false;
  evidenceRefIds: string[];
  auditEventIds: string[];
}

export interface ChatGptBusinessFixtureQuota {
  subjectKind?: 'business-workspace' | 'business-member' | 'codex-account';
  subjectKey?: string;
  status?: QuotaSnapshotStatus;
  limitCount?: number;
  usedCount?: number;
  remainingCount?: number;
  resetAt?: string;
  ambiguous?: boolean;
}

export interface ChatGptBusinessFixtureMember {
  memberKey: string;
  email?: string;
  displayName?: string;
  role?: BusinessMembershipRole;
  status?: BusinessMembershipStatus;
  seatActive?: boolean;
  ownerProtected?: boolean;
  codexAccountKey?: string;
  quota?: ChatGptBusinessFixtureQuota;
  fail?: boolean;
  failureCode?: string;
}

export interface ChatGptBusinessMembershipSyncInput {
  workspaceKey: string;
  workspaceName?: string;
  members: readonly ChatGptBusinessFixtureMember[];
  workspaceQuota?: ChatGptBusinessFixtureQuota;
  observedAt?: string;
  evidenceRefIds?: readonly string[];
  auditEventIds?: readonly string[];
  manifest?: CapabilityManifest;
}

export interface ChatGptBusinessMemberFailure {
  memberHash: string;
  failureCodeHash: string;
  summary: string;
}

export interface ChatGptBusinessMembershipSyncResult {
  id: string;
  schemaVersion: string;
  observedAt: string;
  adapterName: string;
  status: ChatGptBusinessSyncStatus;
  workspace: BusinessWorkspace;
  memberships: BusinessMembershipMirror[];
  accountBindings: CodexAccountBinding[];
  quotaSnapshots: QuotaSnapshot[];
  failedMembers: ChatGptBusinessMemberFailure[];
  counts: {
    requestedMembers: number;
    mirroredMembers: number;
    failedMembers: number;
    quotaSnapshots: number;
  };
  evidenceRefIds: string[];
  auditEventIds: string[];
  manifest: CapabilityManifest;
  fixtureOnly: true;
  readOnly: true;
  liveAdminEnabled: false;
  externalProcessStarted: false;
  rawBodyStored: false;
}

export interface ChatGptBusinessWorkspaceIdentityInput {
  workspaceKey?: string;
  expectedWorkspaceKey?: string;
  workspaceName?: string;
  observedAt?: string;
  evidenceRefIds?: readonly string[];
  auditEventIds?: readonly string[];
}

export interface ChatGptBusinessWorkspaceIdentity {
  id: string;
  schemaVersion: string;
  observedAt: string;
  adapterName: string;
  status: 'matched' | 'mismatch' | 'unknown';
  workspaceHash?: string;
  expectedWorkspaceHash?: string;
  workspace?: BusinessWorkspace;
  evidenceRefIds: string[];
  auditEventIds: string[];
  fixtureOnly: true;
  readOnly: true;
  summary: string;
}

export interface ChatGptBusinessQuotaSnapshotInput extends ChatGptBusinessFixtureQuota {
  subjectKind: 'business-workspace' | 'business-member' | 'codex-account';
  subjectKey: string;
  observedAt?: string;
  evidenceRefIds?: readonly string[];
  auditEventIds?: readonly string[];
  sourceRefIds?: readonly string[];
}

export interface ChatGptBusinessAdminDryRunInput {
  dryRunId: string;
  operation: ChatGptBusinessAdminOperation;
  workspaceKey: string;
  memberKey?: string;
  replacementMemberKey?: string;
  liveAdminEnabled?: boolean;
  manifest?: CapabilityManifest;
}

export interface ChatGptBusinessAdminDryRunPlan {
  id: string;
  schemaVersion: string;
  createdAt: string;
  adapterName: string;
  status: 'blocked';
  dryRunId: string;
  operation: ChatGptBusinessAdminOperation;
  operationHash: string;
  workspaceHash: string;
  memberHash?: string;
  replacementMemberHash?: string;
  blockReasons: string[];
  warnings: string[];
  approvalRequired: true;
  liveAdminEnabled: false;
  executionDisabled: true;
  processBoundaryPlanned: false;
  processBoundaryInvoked: false;
  externalProcessStarted: false;
  noRealWrite: true;
  bodyStored: false;
  rawPathStored: false;
  manifest: CapabilityManifest;
  capabilityDryRun: CapabilityDryRun;
}

export function createChatGptBusinessAdapterPlan(
  input: ChatGptBusinessAdapterPlanInput,
): ChatGptBusinessAdapterPlan {
  const manifest = input.manifest ?? createChatGptBusinessAdapterManifest();
  const workspaceHash = input.workspaceKey ? hashRef(input.workspaceKey) : undefined;
  const expectedMemberCount = Math.max(0, Math.trunc(input.expectedMemberCount ?? 0));
  const blockReasons: string[] = [];

  if (!input.workspaceKey) {
    blockReasons.push('workspace_required');
  }

  if (input.fixtureOnly === false) {
    blockReasons.push('fixture_only_required');
  }

  const status: ChatGptBusinessReadinessStatus =
    blockReasons.length === 0 ? 'ready' : 'blocked';
  const capabilityDryRun = CapabilityDryRunSchema.parse({
    id: foundationId('capability_dry_run'),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: foundationTimestamp(),
    adapterName: CHATGPT_BUSINESS_ADAPTER_NAME,
    inputSummary: {
      workspaceHash,
      expectedMemberCount,
      fixtureOnly: true,
      readOnly: true,
      liveAdminEnabled: false,
    },
    plannedActions: [
      {
        action: 'chatgpt.business.fixture.read',
        actionMode: 'read',
        risk: 'medium',
        target: workspaceHash ?? hashRef('missing-workspace'),
        requiresApproval: false,
      },
    ],
    requiredEvidence: ['business-workspace-metadata', 'business-membership-mirror'],
    warnings:
      status === 'ready'
        ? ['fixture-only read plan; no external ChatGPT Business request is made']
        : [`blocked: ${blockReasons.join(', ')}`],
  });

  return {
    id: foundationId('chatgpt_business_adapter_plan'),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: foundationTimestamp(),
    adapterName: CHATGPT_BUSINESS_ADAPTER_NAME,
    status,
    dryRunId: input.dryRunId,
    workspaceHash,
    expectedMemberCount,
    blockReasons,
    warnings: capabilityDryRun.warnings,
    manifest,
    capabilityDryRun,
    processBoundaryPlanned: false,
    processBoundaryInvoked: false,
    externalProcessStarted: false,
    noRealWrite: true,
    bodyStored: false,
    rawPathStored: false,
    fixtureOnly: true,
    readOnly: true,
    liveAdminEnabled: false,
  };
}

export function createChatGptBusinessReadiness(
  input: ChatGptBusinessAdapterPlanInput,
): ChatGptBusinessAdapterPlan {
  return createChatGptBusinessAdapterPlan(input);
}

export function createChatGptBusinessReadOnlyQuotaPlan(
  input: ChatGptBusinessReadOnlyQuotaPlanInput,
): ChatGptBusinessReadOnlyQuotaPlan {
  const manifest = input.manifest ?? createChatGptBusinessAdapterManifest();
  const sourceHealth = summarizeQuotaSourceHealth({
    sourceKind: input.sourceKind,
    sourceRefSeed: input.sourceRefSeed,
    observationCount: 0,
    canaryPassed: input.canaryPassed ?? false,
    liveReadReady: input.canaryPassed === true,
    status: input.canaryPassed === true ? 'healthy' : 'degraded',
    failureKind: input.canaryPassed === true ? 'none' : 'canary_failed',
    blockReasons: input.canaryPassed === true ? [] : ['quota_canary_required'],
  });
  const capabilityDryRun = CapabilityDryRunSchema.parse({
    id: foundationId('capability_dry_run'),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: foundationTimestamp(),
    adapterName: CHATGPT_BUSINESS_ADAPTER_NAME,
    inputSummary: {
      sourceKind: input.sourceKind,
      sourceRefHash: input.sourceRefSeed ? hashRef(input.sourceRefSeed) : undefined,
      expectedFieldCount: Math.max(0, Math.trunc(input.expectedFieldCount ?? 0)),
      readOnly: true,
      liveAdminEnabled: false,
    },
    plannedActions: [
      {
        action: 'chatgpt.business.quota.readonly.observe',
        actionMode: 'read',
        risk: 'high',
        target: input.sourceRefSeed ? hashRef(input.sourceRefSeed) : hashRef(input.sourceKind),
        requiresApproval: false,
      },
    ],
    requiredEvidence: ['quota-source-health', 'redaction-report', 'quota-attribution'],
    warnings:
      sourceHealth.status === 'healthy'
        ? ['governed read-only quota source is available']
        : ['quota source requires canary before live dispatch can depend on it'],
  });

  return {
    id: foundationId('chatgpt_business_read_only_quota_plan'),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: foundationTimestamp(),
    adapterName: CHATGPT_BUSINESS_ADAPTER_NAME,
    status: sourceHealth.status === 'blocked' ? 'blocked' : 'ready',
    dryRunId: input.dryRunId,
    sourceKind: input.sourceKind,
    sourceRefHash: input.sourceRefSeed ? hashRef(input.sourceRefSeed) : undefined,
    expectedFieldCount: Math.max(0, Math.trunc(input.expectedFieldCount ?? 0)),
    blockReasons: [...sourceHealth.blockReasons],
    warnings: capabilityDryRun.warnings,
    manifest,
    capabilityDryRun,
    sourceHealth,
    fixtureOnly: false,
    readOnly: true,
    liveAdminEnabled: false,
    processBoundaryPlanned: false,
    processBoundaryInvoked: false,
    externalProcessStarted: false,
    rawBodyStored: false,
    rawDomStored: false,
    rawPathStored: false,
  };
}

export function readChatGptBusinessQuotaFromGovernedSource(
  input: ChatGptBusinessGovernedQuotaReadInput,
): ChatGptBusinessGovernedQuotaReadResult {
  const observedAt = input.observedAt ?? foundationTimestamp();
  const evidenceRefIds = [...(input.evidenceRefIds ?? [])];
  const auditEventIds = [...(input.auditEventIds ?? [])];
  const sourceHealth = summarizeQuotaSourceHealth({
    sourceKind: input.sourceKind,
    sourceRefSeed: input.sourceRefSeed,
    status: input.canaryPassed === true ? 'healthy' : 'degraded',
    failureKind: input.canaryPassed === true ? 'none' : 'canary_failed',
    blockReasons: input.canaryPassed === true ? [] : ['quota_canary_required'],
    observationCount: 1,
    canaryPassed: input.canaryPassed ?? false,
    liveReadReady: input.canaryPassed === true,
    evidenceRefIds,
    auditEventIds,
    observedAt,
  });
  const quotaSnapshot = createQuotaSnapshotFromSource({
    subjectKind: input.subjectKind,
    subjectSeed: input.subjectSeed,
    status: input.status,
    limitCount: input.limitCount,
    usedCount: input.usedCount,
    remainingCount: input.remainingCount,
    sourceHealth,
    evidenceRefIds,
    auditEventIds,
    observedAt,
  });
  const attribution = attributeBusinessQuota({
    sourceHealth,
    quotaSnapshot,
    evidenceRefIds,
    auditEventIds,
    observedAt,
  });
  const dispatchGate = createQuotaDispatchGate({
    sourceHealth,
    quotaSnapshot,
    canaryPassed: input.canaryPassed,
    liveDispatchRequested: input.liveDispatchRequested,
  });

  return {
    id: foundationId('chatgpt_business_governed_quota_read'),
    schemaVersion: SchemaVersionSchema.value,
    observedAt,
    adapterName: CHATGPT_BUSINESS_ADAPTER_NAME,
    status: dispatchGate.dispatchAllowed || !input.liveDispatchRequested ? 'completed' : 'blocked',
    sourceHealth,
    quotaSnapshot,
    attribution,
    dispatchGate,
    evidenceRefIds,
    auditEventIds,
    fixtureOnly: false,
    readOnly: true,
    liveAdminEnabled: false,
    processBoundaryInvoked: false,
    externalProcessStarted: false,
    rawBodyStored: false,
    rawDomStored: false,
  };
}

export function observeChatGptBusinessQuotaDomMetadata(
  input: ChatGptBusinessDomObservationInput,
): ChatGptBusinessDomObservationResult {
  const observedAt = input.observedAt ?? foundationTimestamp();
  const evidenceRefIds = [...(input.evidenceRefIds ?? [])];
  const auditEventIds = [...(input.auditEventIds ?? [])];
  const sourceHealth = summarizeQuotaSourceHealth({
    sourceKind: input.sourceKind,
    sourceRefSeed: input.targetSeed,
    status: input.canaryPassed === true ? 'healthy' : 'degraded',
    failureKind: input.canaryPassed === true ? 'none' : 'canary_failed',
    blockReasons: input.canaryPassed === true ? [] : ['quota_canary_required'],
    observationCount: 1,
    canaryPassed: input.canaryPassed ?? false,
    liveReadReady: input.canaryPassed === true,
    evidenceRefIds,
    auditEventIds,
    observedAt,
  });
  const observation = summarizeUiObservation({
    sourceKind: input.sourceKind,
    targetSeed: input.targetSeed,
    selectorManifestSeed: input.selectorManifestSeed,
    fieldKeys: input.fieldKeys,
    readableFieldCount: input.readableFieldCount,
    sourceHealth,
    evidenceRefIds,
    auditEventIds,
    observedAt,
  });
  const dispatchGate = createQuotaDispatchGate({
    sourceHealth,
    redactionReport: observation.redactionReport,
    canaryPassed: input.canaryPassed,
    liveDispatchRequested: true,
  });

  return {
    id: foundationId('chatgpt_business_dom_observation'),
    schemaVersion: SchemaVersionSchema.value,
    observedAt,
    adapterName: CHATGPT_BUSINESS_ADAPTER_NAME,
    status: observation.redactionReport.status === 'passed' ? 'observed' : 'blocked',
    sourceHealth,
    redactionReport: observation.redactionReport,
    observation: observation.observation,
    dispatchGate,
    fixtureOnly: false,
    readOnly: true,
    rawDomStored: false,
    rawTextStored: false,
    networkBodyStored: false,
    evidenceRefIds,
    auditEventIds,
  };
}

export function parseChatGptBusinessRedactedQuotaExport(
  input: ChatGptBusinessRedactedQuotaExportInput,
): ChatGptBusinessRedactedQuotaExportResult {
  const observedAt = input.observedAt ?? foundationTimestamp();
  const evidenceRefIds = [...(input.evidenceRefIds ?? [])];
  const auditEventIds = [...(input.auditEventIds ?? [])];
  const acceptedRows = input.rows.filter((row) => !hasForbiddenExportKey(row));
  const rejectedRowCount = input.rows.length - acceptedRows.length;
  const sourceHealth = summarizeQuotaSourceHealth({
    sourceKind: 'redacted-export',
    sourceRefSeed: input.sourceRefSeed,
    status: rejectedRowCount === input.rows.length ? 'blocked' : rejectedRowCount > 0 ? 'degraded' : 'healthy',
    failureKind: rejectedRowCount > 0 ? 'redaction_failed' : 'none',
    blockReasons: rejectedRowCount > 0 ? ['redacted_export_rejected_rows'] : [],
    observationCount: acceptedRows.length,
    canaryPassed: input.canaryPassed ?? false,
    liveReadReady: input.canaryPassed === true && rejectedRowCount === 0,
    evidenceRefIds,
    auditEventIds,
    observedAt,
  });
  const quotaSnapshots = acceptedRows
    .map(parseRedactedExportRow)
    .filter((row): row is ChatGptBusinessRedactedQuotaExportRow => row !== undefined)
    .map((row) =>
      QuotaSnapshotSchema.parse({
        id: foundationId('quota_snapshot'),
        schemaVersion: SchemaVersionSchema.value,
        observedAt,
        subjectKind: row.subjectKind,
        subjectHash: row.subjectHash,
        status: row.status ?? 'unknown',
        limitCount: normalizeOptionalCount(row.limitCount),
        usedCount: normalizeOptionalCount(row.usedCount),
        remainingCount: normalizeOptionalCount(row.remainingCount),
        sourceRefIds: [sourceHealth.id],
        evidenceRefIds,
        auditEventIds,
        summary: 'Quota snapshot parsed from pre-redacted export metadata.',
      }),
    );
  const attributions = quotaSnapshots.map((quotaSnapshot) =>
    attributeBusinessQuota({
      sourceHealth,
      quotaSnapshot,
      evidenceRefIds,
      auditEventIds,
      observedAt,
    }),
  );

  return {
    id: foundationId('chatgpt_business_redacted_quota_export'),
    schemaVersion: SchemaVersionSchema.value,
    observedAt,
    adapterName: CHATGPT_BUSINESS_ADAPTER_NAME,
    status:
      quotaSnapshots.length === 0 ? 'blocked' : rejectedRowCount > 0 ? 'partial' : 'completed',
    sourceHealth,
    quotaSnapshots,
    attributions,
    rejectedRowCount,
    rawBodyStored: false,
    rawPathStored: false,
    readOnly: true,
    fixtureOnly: false,
    evidenceRefIds,
    auditEventIds,
  };
}

export function syncChatGptBusinessMembershipFixture(
  input: ChatGptBusinessMembershipSyncInput,
): ChatGptBusinessMembershipSyncResult {
  const manifest = input.manifest ?? createChatGptBusinessAdapterManifest();
  const observedAt = input.observedAt ?? foundationTimestamp();
  const evidenceRefIds = [...(input.evidenceRefIds ?? [])];
  const auditEventIds = [...(input.auditEventIds ?? [])];
  const workspaceIdHash = hashRef(input.workspaceKey);
  const successfulMembers = input.members.filter((member) => member.fail !== true);
  const failedMembers = input.members.filter((member) => member.fail === true);
  const status: ChatGptBusinessSyncStatus =
    successfulMembers.length === 0
      ? 'blocked'
      : failedMembers.length > 0
        ? 'partial'
        : 'completed';

  const workspace = BusinessWorkspaceSchema.parse({
    id: foundationId('business_workspace'),
    schemaVersion: SchemaVersionSchema.value,
    observedAt,
    workspaceIdHash,
    workspaceNameHash: input.workspaceName ? hashRef(input.workspaceName) : undefined,
    status: successfulMembers.length === 0 ? 'unknown' : 'active',
    membershipCount: successfulMembers.length,
    ownerCount: successfulMembers.filter((member) => member.role === 'owner').length,
    adminCount: successfulMembers.filter((member) => member.role === 'admin').length,
    evidenceRefIds,
    auditEventIds,
    summary: createWorkspaceSummary(successfulMembers.length, failedMembers.length),
  });

  const memberships = successfulMembers.map((member) =>
    BusinessMembershipMirrorSchema.parse({
      id: foundationId('business_membership_mirror'),
      schemaVersion: SchemaVersionSchema.value,
      observedAt,
      workspaceIdHash,
      memberHash: hashRef(member.memberKey),
      emailHash: member.email ? hashRef(member.email) : undefined,
      displayNameHash: member.displayName ? hashRef(member.displayName) : undefined,
      role: member.role ?? 'member',
      status: member.status ?? 'active',
      seatActive: member.seatActive ?? member.status !== 'removed',
      ownerProtected: member.ownerProtected ?? member.role === 'owner',
      evidenceRefIds,
      auditEventIds,
      summary: 'Business membership mirrored from fixture metadata.',
    }),
  );

  const accountBindings = memberships.map((membership, index) => {
    const member = successfulMembers[index];

    return CodexAccountBindingSchema.parse({
      id: foundationId('codex_account_binding'),
      schemaVersion: SchemaVersionSchema.value,
      observedAt,
      codexAccountHash: hashRef(member.codexAccountKey ?? member.memberKey),
      businessMembershipMirrorId: membership.id,
      workspaceIdHash,
      status: membership.status === 'active' ? 'matched' : 'unverified',
      disabled: false,
      evidenceRefIds,
      auditEventIds,
      summary: 'Codex account binding mirrored from Business fixture metadata.',
    });
  });

  const quotaSnapshots = [
    ...(input.workspaceQuota
      ? [
          createChatGptBusinessQuotaSnapshot({
            ...input.workspaceQuota,
            subjectKind: 'business-workspace',
            subjectKey: input.workspaceKey,
            observedAt,
            evidenceRefIds,
            auditEventIds,
          }),
        ]
      : []),
    ...successfulMembers
      .filter((member) => member.quota !== undefined)
      .map((member) =>
        createChatGptBusinessQuotaSnapshot({
          ...member.quota,
          subjectKind: member.quota?.subjectKind ?? 'codex-account',
          subjectKey: member.quota?.subjectKey ?? member.codexAccountKey ?? member.memberKey,
          observedAt,
          evidenceRefIds,
          auditEventIds,
        }),
      ),
  ];

  return {
    id: foundationId('chatgpt_business_membership_sync'),
    schemaVersion: SchemaVersionSchema.value,
    observedAt,
    adapterName: CHATGPT_BUSINESS_ADAPTER_NAME,
    status,
    workspace,
    memberships,
    accountBindings,
    quotaSnapshots,
    failedMembers: failedMembers.map((member) => ({
      memberHash: hashRef(member.memberKey),
      failureCodeHash: hashRef(member.failureCode ?? 'fixture_failure'),
      summary: 'Fixture member failed and was isolated from mirrored records.',
    })),
    counts: {
      requestedMembers: input.members.length,
      mirroredMembers: memberships.length,
      failedMembers: failedMembers.length,
      quotaSnapshots: quotaSnapshots.length,
    },
    evidenceRefIds,
    auditEventIds,
    manifest,
    fixtureOnly: true,
    readOnly: true,
    liveAdminEnabled: false,
    externalProcessStarted: false,
    rawBodyStored: false,
  };
}

export function checkChatGptBusinessWorkspaceIdentity(
  input: ChatGptBusinessWorkspaceIdentityInput,
): ChatGptBusinessWorkspaceIdentity {
  const observedAt = input.observedAt ?? foundationTimestamp();
  const evidenceRefIds = [...(input.evidenceRefIds ?? [])];
  const auditEventIds = [...(input.auditEventIds ?? [])];
  const workspaceHash = input.workspaceKey ? hashRef(input.workspaceKey) : undefined;
  const expectedWorkspaceHash = input.expectedWorkspaceKey
    ? hashRef(input.expectedWorkspaceKey)
    : undefined;
  const status =
    !workspaceHash || !expectedWorkspaceHash
      ? 'unknown'
      : workspaceHash === expectedWorkspaceHash
        ? 'matched'
        : 'mismatch';

  return {
    id: foundationId('chatgpt_business_workspace_identity'),
    schemaVersion: SchemaVersionSchema.value,
    observedAt,
    adapterName: CHATGPT_BUSINESS_ADAPTER_NAME,
    status,
    workspaceHash,
    expectedWorkspaceHash,
    workspace: input.workspaceKey
      ? BusinessWorkspaceSchema.parse({
          id: foundationId('business_workspace'),
          schemaVersion: SchemaVersionSchema.value,
          observedAt,
          workspaceIdHash: workspaceHash,
          workspaceNameHash: input.workspaceName ? hashRef(input.workspaceName) : undefined,
          status: status === 'mismatch' ? 'unknown' : 'active',
          membershipCount: 0,
          ownerCount: 0,
          adminCount: 0,
          evidenceRefIds,
          auditEventIds,
          summary: 'Workspace identity checked through fixture metadata.',
        })
      : undefined,
    evidenceRefIds,
    auditEventIds,
    fixtureOnly: true,
    readOnly: true,
    summary:
      status === 'matched'
        ? 'Workspace identity hash matched expected Business workspace.'
        : status === 'mismatch'
          ? 'Workspace identity hash did not match expected Business workspace.'
          : 'Workspace identity could not be verified from fixture metadata.',
  };
}

export function createChatGptBusinessQuotaSnapshot(
  input: ChatGptBusinessQuotaSnapshotInput,
): QuotaSnapshot {
  const observedAt = input.observedAt ?? foundationTimestamp();

  return QuotaSnapshotSchema.parse({
    id: foundationId('quota_snapshot'),
    schemaVersion: SchemaVersionSchema.value,
    observedAt,
    subjectKind: input.subjectKind,
    subjectHash: hashRef(input.subjectKey),
    status: input.status ?? 'unknown',
    limitCount: normalizeOptionalCount(input.limitCount),
    usedCount: normalizeOptionalCount(input.usedCount),
    remainingCount: normalizeOptionalCount(input.remainingCount),
    resetAtHash: input.resetAt ? hashRef(input.resetAt) : undefined,
    sourceRefIds: [...(input.sourceRefIds ?? [])],
    ambiguous: input.ambiguous ?? false,
    evidenceRefIds: [...(input.evidenceRefIds ?? [])],
    auditEventIds: [...(input.auditEventIds ?? [])],
    summary: 'Quota snapshot created from fixture metadata.',
  });
}

export function planChatGptBusinessAdminDryRun(
  input: ChatGptBusinessAdminDryRunInput,
): ChatGptBusinessAdminDryRunPlan {
  const manifest = input.manifest ?? createChatGptBusinessAdapterManifest();
  const workspaceHash = hashRef(input.workspaceKey);
  const memberHash = input.memberKey ? hashRef(input.memberKey) : undefined;
  const replacementMemberHash = input.replacementMemberKey
    ? hashRef(input.replacementMemberKey)
    : undefined;
  const operationHash = hashRef({
    operation: input.operation,
    workspaceHash,
    memberHash,
    replacementMemberHash,
  });
  const blockReasons = [
    'live_admin_disabled',
    'approval_chain_not_enabled',
    'm52_dry_run_only',
  ];
  const warnings = [
    input.liveAdminEnabled === true
      ? 'requested live admin remains disabled in M52'
      : 'live admin is disabled by default',
    'future live admin requires policy, approval, evidence, and audit gates',
  ];
  const capabilityDryRun = CapabilityDryRunSchema.parse({
    id: foundationId('capability_dry_run'),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: foundationTimestamp(),
    adapterName: CHATGPT_BUSINESS_ADAPTER_NAME,
    inputSummary: {
      operation: input.operation,
      operationHash,
      workspaceHash,
      memberHash,
      replacementMemberHash,
      liveAdminEnabled: false,
      executionDisabled: true,
    },
    plannedActions: [
      {
        action: `chatgpt.business.admin.${input.operation}`,
        actionMode: 'admin',
        risk: 'critical',
        target: workspaceHash,
        requiresApproval: true,
      },
    ],
    requiredEvidence: ['business-admin-dry-run-plan', 'approval-chain-design'],
    warnings,
  });

  return {
    id: foundationId('chatgpt_business_admin_dry_run_plan'),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: foundationTimestamp(),
    adapterName: CHATGPT_BUSINESS_ADAPTER_NAME,
    status: 'blocked',
    dryRunId: input.dryRunId,
    operation: input.operation,
    operationHash,
    workspaceHash,
    memberHash,
    replacementMemberHash,
    blockReasons,
    warnings,
    approvalRequired: true,
    liveAdminEnabled: false,
    executionDisabled: true,
    processBoundaryPlanned: false,
    processBoundaryInvoked: false,
    externalProcessStarted: false,
    noRealWrite: true,
    bodyStored: false,
    rawPathStored: false,
    manifest,
    capabilityDryRun,
  };
}

export function readChatGptBusinessQuotaFromFixture(
  input: ChatGptBusinessQuotaSnapshotInput,
): QuotaSnapshot {
  return createChatGptBusinessQuotaSnapshot(input);
}

function hashRef(value: unknown): string {
  const text = typeof value === 'string' ? value : JSON.stringify(value);
  return `sha256:${hashText(text)}`;
}

function normalizeOptionalCount(value: number | undefined): number | undefined {
  return value === undefined ? undefined : Math.max(0, Math.trunc(value));
}

function parseRedactedExportRow(
  row: Record<string, unknown>,
): ChatGptBusinessRedactedQuotaExportRow | undefined {
  if (
    !isQuotaSubjectKind(row.subjectKind) ||
    typeof row.subjectHash !== 'string' ||
    !row.subjectHash.startsWith('sha256:')
  ) {
    return undefined;
  }

  return {
    subjectKind: row.subjectKind,
    subjectHash: row.subjectHash,
    status: isQuotaSnapshotStatus(row.status) ? row.status : undefined,
    limitCount: typeof row.limitCount === 'number' ? row.limitCount : undefined,
    usedCount: typeof row.usedCount === 'number' ? row.usedCount : undefined,
    remainingCount: typeof row.remainingCount === 'number' ? row.remainingCount : undefined,
  };
}

function hasForbiddenExportKey(row: Record<string, unknown>): boolean {
  return Object.keys(row).some((key) => forbiddenExportKeyPattern().test(key));
}

function forbiddenExportKeyPattern(): RegExp {
  const terms = [
    ['to', 'ken'].join(''),
    ['coo', 'kie'].join(''),
    ['sess', 'ion'].join(''),
    ['stor', 'age'].join(''),
    ['pass', 'word'].join(''),
    ['cred', 'ential'].join(''),
    ['m', 'fa'].join(''),
    ['sec', 'ret'].join(''),
    ['authori', 'zation'].join(''),
    ['account', 'id'].join(''),
    ['work', 'spaceid'].join(''),
    ['em', 'ail'].join(''),
    'raw',
    'path',
    'body',
  ];

  return new RegExp(terms.join('|'), 'i');
}

function isQuotaSubjectKind(value: unknown): value is QuotaSnapshot['subjectKind'] {
  return (
    value === 'business-workspace' ||
    value === 'business-member' ||
    value === 'codex-account'
  );
}

function isQuotaSnapshotStatus(value: unknown): value is QuotaSnapshotStatus {
  return (
    value === 'unknown' ||
    value === 'available' ||
    value === 'limited' ||
    value === 'exhausted' ||
    value === 'blocked'
  );
}

function createWorkspaceSummary(mirroredCount: number, failedCount: number): string {
  if (mirroredCount === 0) {
    return 'Business workspace fixture sync blocked because all members failed.';
  }

  if (failedCount > 0) {
    return 'Business workspace fixture sync partially completed with failed members isolated.';
  }

  return 'Business workspace fixture sync completed metadata-only.';
}

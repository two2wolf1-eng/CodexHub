import {
  type BusinessMembershipMirror,
  type BusinessMembershipRole,
  type BusinessMembershipStatus,
  BusinessMembershipMirrorSchema,
  type BusinessWorkspace,
  BusinessWorkspaceSchema,
  type CapabilityDryRun,
  CapabilityDryRunSchema,
  type CapabilityManifest,
  type CodexAccountBinding,
  CodexAccountBindingSchema,
  type QuotaSnapshot,
  type QuotaSnapshotStatus,
  QuotaSnapshotSchema,
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

function createWorkspaceSummary(mirroredCount: number, failedCount: number): string {
  if (mirroredCount === 0) {
    return 'Business workspace fixture sync blocked because all members failed.';
  }

  if (failedCount > 0) {
    return 'Business workspace fixture sync partially completed with failed members isolated.';
  }

  return 'Business workspace fixture sync completed metadata-only.';
}

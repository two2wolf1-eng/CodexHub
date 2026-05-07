import {
  AccountPoolSchema,
  ClientPoolSchema,
  CodexAccountSchedulingProjectionSchema,
  CodexClientSchedulingProjectionSchema,
  CodexSchedulerPreflightCheckSchema,
  LeaseSchema,
  type AccountPool,
  type CodexAccountBinding,
  type CodexAccountSchedulingProjection,
  type CodexAccountSchedulingStatus,
  type CodexClientInstance,
  type CodexClientSchedulingProjection,
  type CodexClientSchedulingStatus,
  type CodexDesktopHealthSnapshot,
  type CodexSchedulerPreflightCheck,
  type ClientPool,
  type Lease,
  type LeaseTargetKind,
  type PoolEntryStatus,
  type QuotaSnapshot,
  SchemaVersionSchema,
} from '@codexhub/contracts';
import { hashText } from '@codexhub/evidence-kernel';

const schemaVersion = SchemaVersionSchema.value;

const now = (): string => new Date().toISOString();

export interface CodexAccountSchedulingScoreInput {
  id?: string;
  observedAt?: string;
  accountBinding: CodexAccountBinding;
  quotaSnapshot?: QuotaSnapshot;
  expectedWorkspaceIdHash?: string;
  activeLeaseCount?: number;
  evidenceRefIds?: readonly string[];
  auditEventIds?: readonly string[];
}

export interface CodexClientSchedulingScoreInput {
  id?: string;
  observedAt?: string;
  clientInstance: CodexClientInstance;
  desktopHealth?: CodexDesktopHealthSnapshot;
  activeLeaseCount?: number;
  evidenceRefIds?: readonly string[];
  auditEventIds?: readonly string[];
}

export interface AccountPoolScoringInput {
  id?: string;
  observedAt?: string;
  poolKey?: string;
  projections: readonly CodexAccountSchedulingProjection[];
  evidenceRefIds?: readonly string[];
  auditEventIds?: readonly string[];
}

export interface ClientPoolScoringInput {
  id?: string;
  observedAt?: string;
  poolKey?: string;
  projections: readonly CodexClientSchedulingProjection[];
  evidenceRefIds?: readonly string[];
  auditEventIds?: readonly string[];
}

export interface SchedulerLeaseRequest {
  targetKind: LeaseTargetKind;
  targetKey: string;
  holderKey: string;
  status?: 'requested' | 'active';
  expiresAt?: string;
  evidenceRefIds?: readonly string[];
  auditEventIds?: readonly string[];
}

export interface SchedulerLeaseBundleInput {
  createdAt?: string;
  requests: readonly SchedulerLeaseRequest[];
  existingLeases?: readonly Lease[];
  evidenceRefIds?: readonly string[];
  auditEventIds?: readonly string[];
}

export interface CodexSchedulerLeaseBundle {
  id: string;
  schemaVersion: string;
  createdAt: string;
  status: 'ready' | 'blocked';
  requestedCount: number;
  readyCount: number;
  blockedCount: number;
  leases: Lease[];
  checks: CodexSchedulerPreflightCheck[];
  evidenceRefIds: string[];
  auditEventIds: string[];
  metadataOnly: true;
  rawPathStored: false;
  leaseSecretStored: false;
  summary: string;
}

export function hashSchedulerMetadata(value: string | number): string {
  return `sha256:${hashText(String(value))}`;
}

export function scoreCodexAccount(
  input: CodexAccountSchedulingScoreInput,
): CodexAccountSchedulingProjection {
  const status = inferAccountSchedulingStatus(input);
  const blockReasons = accountBlockReasons(status);
  const activeLeaseCount = input.activeLeaseCount ?? 0;

  return CodexAccountSchedulingProjectionSchema.parse({
    id:
      input.id ??
      `codex_account_schedule_${hashSchedulerMetadata(
        input.accountBinding.codexAccountHash,
      )}`,
    schemaVersion,
    observedAt: input.observedAt ?? now(),
    accountBindingId: input.accountBinding.id,
    accountHash: input.accountBinding.codexAccountHash,
    schedulingStatus: status,
    score: scoreAccountStatus(status, input.quotaSnapshot, activeLeaseCount),
    quotaSnapshotId: input.quotaSnapshot?.id,
    quotaStatus: input.quotaSnapshot?.status,
    activeLeaseCount,
    blockReasons,
    evidenceRefIds: [...(input.evidenceRefIds ?? [])],
    auditEventIds: [...(input.auditEventIds ?? [])],
    summary:
      status === 'account_ready'
        ? 'Account is schedulable with metadata-only quota readiness.'
        : `Account scheduling is blocked or pending: ${status}.`,
  });
}

export function scoreCodexClient(
  input: CodexClientSchedulingScoreInput,
): CodexClientSchedulingProjection {
  const status = inferClientSchedulingStatus(input);
  const blockReasons = clientBlockReasons(status);
  const activeLeaseCount = input.activeLeaseCount ?? 0;

  return CodexClientSchedulingProjectionSchema.parse({
    id:
      input.id ??
      `codex_client_schedule_${hashSchedulerMetadata(
        input.clientInstance.clientInstanceHash,
      )}`,
    schemaVersion,
    observedAt: input.observedAt ?? now(),
    clientInstanceId: input.clientInstance.id,
    clientHash: input.clientInstance.clientInstanceHash,
    schedulingStatus: status,
    score: scoreClientStatus(status, activeLeaseCount),
    activeLeaseCount,
    diagnosticHints: [...(input.desktopHealth?.diagnosticHints ?? [])],
    blockReasons,
    evidenceRefIds: [...(input.evidenceRefIds ?? [])],
    auditEventIds: [...(input.auditEventIds ?? [])],
    summary:
      status === 'client_ready'
        ? 'Client is schedulable with metadata-only desktop health.'
        : `Client scheduling is blocked or pending: ${status}.`,
  });
}

export function createAccountPoolScoringProjection(
  input: AccountPoolScoringInput,
): AccountPool {
  const entries = input.projections.map((projection) => ({
    entryId: `account_pool_entry_${hashSchedulerMetadata(projection.id)}`,
    targetIdHash: projection.accountHash,
    status: poolEntryStatusForAccount(projection.schedulingStatus),
    score: projection.score,
    blockReasons: projection.blockReasons,
    evidenceRefIds: projection.evidenceRefIds,
  }));
  const readyCount = entries.filter((entry) => entry.status === 'ready').length;
  const blockedCount = entries.filter((entry) => entry.status === 'blocked').length;
  const poolStatus =
    input.projections.length === 0
      ? 'unknown'
      : readyCount > 0
        ? 'ready'
        : blockedCount > 0
          ? 'blocked'
          : 'degraded';

  return AccountPoolSchema.parse({
    id: input.id ?? `account_pool_${hashSchedulerMetadata(input.poolKey ?? 'default')}`,
    schemaVersion,
    observedAt: input.observedAt ?? now(),
    poolHash: hashSchedulerMetadata(input.poolKey ?? 'default'),
    status: poolStatus,
    accountCount: input.projections.length,
    readyCount,
    blockedCount,
    entries,
    evidenceRefIds: [...(input.evidenceRefIds ?? [])],
    auditEventIds: [...(input.auditEventIds ?? [])],
    summary: `Account pool has ${readyCount} ready and ${blockedCount} blocked accounts.`,
  });
}

export function createClientPoolScoringProjection(
  input: ClientPoolScoringInput,
): ClientPool {
  const entries = input.projections.map((projection) => ({
    entryId: `client_pool_entry_${hashSchedulerMetadata(projection.id)}`,
    targetIdHash: projection.clientHash,
    status: poolEntryStatusForClient(projection.schedulingStatus),
    score: projection.score,
    blockReasons: projection.blockReasons,
    evidenceRefIds: projection.evidenceRefIds,
  }));
  const readyCount = entries.filter((entry) => entry.status === 'ready').length;
  const blockedCount = entries.filter((entry) => entry.status === 'blocked').length;
  const poolStatus =
    input.projections.length === 0
      ? 'unknown'
      : readyCount > 0
        ? 'ready'
        : blockedCount > 0
          ? 'blocked'
          : 'degraded';

  return ClientPoolSchema.parse({
    id: input.id ?? `client_pool_${hashSchedulerMetadata(input.poolKey ?? 'default')}`,
    schemaVersion,
    observedAt: input.observedAt ?? now(),
    poolHash: hashSchedulerMetadata(input.poolKey ?? 'default'),
    status: poolStatus,
    clientCount: input.projections.length,
    readyCount,
    blockedCount,
    entries,
    evidenceRefIds: [...(input.evidenceRefIds ?? [])],
    auditEventIds: [...(input.auditEventIds ?? [])],
    summary: `Client pool has ${readyCount} ready and ${blockedCount} blocked clients.`,
  });
}

export function createSchedulerLease(
  input: SchedulerLeaseRequest & { createdAt?: string },
): Lease {
  return LeaseSchema.parse({
    id: `scheduler_lease_${hashSchedulerMetadata(
      `${input.targetKind}:${input.targetKey}:${input.holderKey}`,
    )}`,
    schemaVersion,
    createdAt: input.createdAt ?? now(),
    targetKind: input.targetKind,
    targetIdHash: hashSchedulerMetadata(input.targetKey),
    holderHash: hashSchedulerMetadata(input.holderKey),
    status: input.status ?? 'active',
    expiresAt: input.expiresAt,
    leaseSecretStored: false,
    evidenceRefIds: [...(input.evidenceRefIds ?? [])],
    auditEventIds: [...(input.auditEventIds ?? [])],
    summary: `Scheduler ${input.targetKind} lease stores target and holder hashes only.`,
  });
}

export function createSchedulerLeaseBundle(
  input: SchedulerLeaseBundleInput,
): CodexSchedulerLeaseBundle {
  const createdAt = input.createdAt ?? now();
  const leases = input.requests.map((request) =>
    createLeaseForRequest(request, input.existingLeases ?? [], createdAt),
  );
  const checks = leases.map((lease) => createLeasePreflightCheck(lease));
  const blockedCount = leases.filter((lease) => lease.status === 'blocked').length;
  const readyCount = leases.length - blockedCount;
  const status = blockedCount > 0 ? 'blocked' : 'ready';

  return {
    id: `scheduler_lease_bundle_${hashSchedulerMetadata(
      JSON.stringify(leases.map((lease) => `${lease.targetKind}:${lease.targetIdHash}`)),
    )}`,
    schemaVersion,
    createdAt,
    status,
    requestedCount: input.requests.length,
    readyCount,
    blockedCount,
    leases,
    checks,
    evidenceRefIds: [...(input.evidenceRefIds ?? [])],
    auditEventIds: [...(input.auditEventIds ?? [])],
    metadataOnly: true,
    rawPathStored: false,
    leaseSecretStored: false,
    summary:
      status === 'ready'
        ? `Scheduler lease bundle has ${readyCount} ready leases.`
        : `Scheduler lease bundle has ${blockedCount} lease conflicts.`,
  };
}

function inferAccountSchedulingStatus(
  input: CodexAccountSchedulingScoreInput,
): CodexAccountSchedulingStatus {
  const { accountBinding, quotaSnapshot, expectedWorkspaceIdHash } = input;

  if (
    accountBinding.disabled ||
    accountBinding.status === 'disabled' ||
    accountBinding.status === 'blocked'
  ) {
    return 'removed';
  }

  if (accountBinding.status === 'unverified') {
    return 'pending';
  }

  if (accountBinding.status === 'mismatch') {
    return 'wrong_account';
  }

  if (
    expectedWorkspaceIdHash &&
    accountBinding.workspaceIdHash &&
    accountBinding.workspaceIdHash !== expectedWorkspaceIdHash
  ) {
    return 'workspace_mismatch';
  }

  if (!quotaSnapshot || quotaSnapshot.status === 'unknown' || quotaSnapshot.ambiguous) {
    return 'pending';
  }

  if (
    quotaSnapshot.status === 'blocked' ||
    quotaSnapshot.status === 'exhausted' ||
    quotaSnapshot.remainingCount === 0
  ) {
    return 'quota_depleted';
  }

  if (accountBinding.status === 'matched') {
    return 'account_ready';
  }

  return 'unknown';
}

function inferClientSchedulingStatus(
  input: CodexClientSchedulingScoreInput,
): CodexClientSchedulingStatus {
  const { clientInstance, desktopHealth } = input;

  if (clientInstance.status === 'offline' || clientInstance.status === 'blocked') {
    return 'removed';
  }

  if (desktopHealth?.loggedIn === false) {
    return 'codex_logged_out';
  }

  if (
    desktopHealth?.appServerResponsive === false ||
    desktopHealth?.diagnosticHints.includes('app_server_unresponsive')
  ) {
    return 'app_server_unresponsive';
  }

  if (
    desktopHealth?.desktopUiResponsive === false ||
    desktopHealth?.diagnosticHints.includes('desktop_ui_frozen')
  ) {
    return 'desktop_ui_frozen';
  }

  if (clientInstance.status === 'unknown' || clientInstance.status === 'degraded') {
    return 'pending';
  }

  if (clientInstance.status === 'available') {
    return 'client_ready';
  }

  return 'unknown';
}

function scoreAccountStatus(
  status: CodexAccountSchedulingStatus,
  quotaSnapshot: QuotaSnapshot | undefined,
  activeLeaseCount: number,
): number {
  if (status === 'account_ready') {
    const quotaPenalty = quotaSnapshot?.status === 'limited' ? 20 : 0;
    const leasePenalty = Math.min(activeLeaseCount * 10, 30);

    return Math.max(50, 100 - quotaPenalty - leasePenalty);
  }

  if (status === 'pending') {
    return 25;
  }

  if (status === 'unknown') {
    return 10;
  }

  return 0;
}

function scoreClientStatus(
  status: CodexClientSchedulingStatus,
  activeLeaseCount: number,
): number {
  if (status === 'client_ready') {
    return Math.max(50, 100 - Math.min(activeLeaseCount * 10, 30));
  }

  if (status === 'pending') {
    return 25;
  }

  if (status === 'unknown') {
    return 10;
  }

  return 0;
}

function accountBlockReasons(status: CodexAccountSchedulingStatus): string[] {
  if (status === 'account_ready') {
    return [];
  }

  return [`account:${status}`];
}

function clientBlockReasons(status: CodexClientSchedulingStatus): string[] {
  if (status === 'client_ready') {
    return [];
  }

  return [`client:${status}`];
}

function poolEntryStatusForAccount(
  status: CodexAccountSchedulingStatus,
): PoolEntryStatus {
  if (status === 'account_ready') {
    return 'ready';
  }

  if (status === 'pending' || status === 'unknown') {
    return 'unknown';
  }

  return 'blocked';
}

function poolEntryStatusForClient(status: CodexClientSchedulingStatus): PoolEntryStatus {
  if (status === 'client_ready') {
    return 'ready';
  }

  if (status === 'pending' || status === 'unknown') {
    return 'unknown';
  }

  return 'blocked';
}

function createLeaseForRequest(
  request: SchedulerLeaseRequest,
  existingLeases: readonly Lease[],
  createdAt: string,
): Lease {
  const targetIdHash = hashSchedulerMetadata(request.targetKey);
  const holderHash = hashSchedulerMetadata(request.holderKey);
  const conflict = existingLeases.find(
    (lease) =>
      lease.targetKind === request.targetKind &&
      lease.targetIdHash === targetIdHash &&
      isBlockingLeaseStatus(lease.status) &&
      lease.holderHash !== holderHash,
  );

  if (!conflict) {
    return createSchedulerLease({ ...request, createdAt });
  }

  return LeaseSchema.parse({
    id: `scheduler_lease_blocked_${hashSchedulerMetadata(
      `${request.targetKind}:${request.targetKey}:${request.holderKey}`,
    )}`,
    schemaVersion,
    createdAt,
    targetKind: request.targetKind,
    targetIdHash,
    holderHash,
    status: 'blocked',
    expiresAt: request.expiresAt,
    leaseSecretStored: false,
    evidenceRefIds: [...(request.evidenceRefIds ?? [])],
    auditEventIds: [...(request.auditEventIds ?? [])],
    summary: `Scheduler ${request.targetKind} lease is blocked by an existing lease.`,
  });
}

function createLeasePreflightCheck(lease: Lease): CodexSchedulerPreflightCheck {
  return CodexSchedulerPreflightCheckSchema.parse({
    checkKind: lease.targetKind,
    status: lease.status === 'blocked' ? 'blocked' : 'ready',
    targetIdHash: lease.targetIdHash,
    blockReasons:
      lease.status === 'blocked' ? [`lease_conflict:${lease.targetKind}`] : [],
    evidenceRefIds: lease.evidenceRefIds,
    auditEventIds: lease.auditEventIds,
    summary:
      lease.status === 'blocked'
        ? `Scheduler ${lease.targetKind} lease check is blocked.`
        : `Scheduler ${lease.targetKind} lease check is ready.`,
  });
}

function isBlockingLeaseStatus(status: Lease['status']): boolean {
  return status === 'requested' || status === 'active';
}

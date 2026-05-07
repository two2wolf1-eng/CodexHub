import {
  AccountPoolSchema,
  ClientPoolSchema,
  CodexAccountSchedulingProjectionSchema,
  CodexClientSchedulingProjectionSchema,
  type AccountPool,
  type CodexAccountBinding,
  type CodexAccountSchedulingProjection,
  type CodexAccountSchedulingStatus,
  type CodexClientInstance,
  type CodexClientSchedulingProjection,
  type CodexClientSchedulingStatus,
  type CodexDesktopHealthSnapshot,
  type ClientPool,
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

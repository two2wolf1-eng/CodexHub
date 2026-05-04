import {
  ApprovalDecisionResultSchema,
  ApprovalInboxItemSchema,
  ApprovalInboxProjectionSchema,
  ApprovalUxStatusSchema,
  SchemaVersionSchema,
  foundationTimestamp,
  type ApprovalDecisionResult,
  type ActionMode,
  type ApprovalInboxItem,
  type ApprovalInboxProjection,
  type ApprovalUxDecision,
  type ApprovalUxStatus,
  type ApprovalUxType,
  type BrowserObservationApprovalArtifactRecord,
  type CodexExecManualApprovalRecord,
  type ElectronCdpObservationApprovalArtifactRecord,
  type WorktreeApprovalArtifactRecord,
  type WorktreeCleanupApprovalArtifactRecord,
} from '@codexhub/contracts';
import { hashText } from '@codexhub/evidence-kernel';

export type ApprovalInboxSourceRecord =
  | CodexExecManualApprovalRecord
  | BrowserObservationApprovalArtifactRecord
  | ElectronCdpObservationApprovalArtifactRecord
  | WorktreeApprovalArtifactRecord
  | WorktreeCleanupApprovalArtifactRecord;

export interface ApprovalInboxProjectionInput {
  codex?: readonly CodexExecManualApprovalRecord[];
  browser?: readonly BrowserObservationApprovalArtifactRecord[];
  electronCdp?: readonly ElectronCdpObservationApprovalArtifactRecord[];
  worktree?: readonly WorktreeApprovalArtifactRecord[];
  worktreeCleanup?: readonly WorktreeCleanupApprovalArtifactRecord[];
  m9Pilot?: readonly WorktreeApprovalArtifactRecord[];
}

export function createApprovalInboxProjection(
  input: ApprovalInboxProjectionInput,
): ApprovalInboxProjection {
  const items = [
    ...(input.codex ?? []).map(projectCodexApproval),
    ...(input.browser ?? []).map((record) => projectGenericApproval('browser', record)),
    ...(input.electronCdp ?? []).map((record) => projectGenericApproval('electron_cdp', record)),
    ...(input.worktree ?? []).map((record) => projectGenericApproval('worktree', record)),
    ...(input.worktreeCleanup ?? []).map((record) =>
      projectGenericApproval('worktree_cleanup', record),
    ),
    ...(input.m9Pilot ?? []).map((record) => projectGenericApproval('m9_pilot', record)),
  ].sort((left, right) => right.createdAt.localeCompare(left.createdAt));
  const typeBreakdown = items.reduce<Partial<Record<ApprovalUxType, number>>>(
    (accumulator, item) => ({
      ...accumulator,
      [item.approvalType]: (accumulator[item.approvalType] ?? 0) + 1,
    }),
    {},
  );
  const now = foundationTimestamp();

  return ApprovalInboxProjectionSchema.parse({
    id: stableId('approval_inbox_projection', JSON.stringify(items.map((item) => item.id))),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: now,
    items,
    itemCount: items.length,
    requestedCount: items.filter((item) => isRequestedLike(item.status)).length,
    approvedCount: items.filter((item) => item.status === 'approved').length,
    terminalCount: items.filter((item) => isTerminal(item.status)).length,
    typeBreakdown,
    rawPathStored: false,
    bodyStored: false,
    tokenStored: false,
    summary: `Approval inbox contains ${items.length} metadata-only item(s).`,
  });
}

export function projectCodexApproval(record: CodexExecManualApprovalRecord): ApprovalInboxItem {
  const status = normalizeApprovalStatus(record.approvalState?.status ?? record.status);
  const requestId = record.request.id;

  return ApprovalInboxItemSchema.parse({
    id: stableId('approval_inbox_item', `codex:${requestId}:${record.status}`),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: record.createdAt,
    approvalType: 'codex',
    approvalRequestId: requestId,
    approvalRecordId: record.id,
    approvalArtifactIdHash: record.approvalArtifact?.id
      ? stableHash(record.approvalArtifact.id)
      : undefined,
    status,
    dryRunIdHash: stableHash(record.request.dryRunPlanId),
    targetHash: record.request.dryRunPlanHash,
    riskLevel: record.request.riskLevel,
    actionMode: codexActionModeFromScope(record.request.scope),
    policyDecisionId: record.request.policyDecisionId,
    evidenceRefIds: record.evidenceRefs.map((ref) => ref.id),
    auditEventIds: record.auditEventIds,
    canApprove: canApprove(status),
    canDeny: canDeny(status),
    canRevoke: canRevoke(status),
    processBoundaryInvoked: false,
    externalProcessStarted: false,
    noRealWrite: true,
    rawPathStored: false,
    bodyStored: false,
    tokenStored: false,
    summary: `Codex approval ${status}; decision is Supervisor-gated.`,
  });
}

export function projectGenericApproval(
  approvalType: Exclude<ApprovalUxType, 'codex'>,
  record:
    | BrowserObservationApprovalArtifactRecord
    | ElectronCdpObservationApprovalArtifactRecord
    | WorktreeApprovalArtifactRecord
    | WorktreeCleanupApprovalArtifactRecord,
): ApprovalInboxItem {
  const status = normalizeApprovalStatus(record.status);
  const boundaryRecord = record as {
    gitProcessBoundaryInvoked?: boolean;
    cdpHttpBoundaryInvoked?: boolean;
    cdpWebSocketBoundaryInvoked?: boolean;
    processBoundaryInvoked?: boolean;
    externalProcessStarted?: boolean;
    noRealWrite?: boolean;
  };
  const boundaryInvoked =
    boundaryRecord.gitProcessBoundaryInvoked === true ||
    boundaryRecord.cdpHttpBoundaryInvoked === true ||
    boundaryRecord.cdpWebSocketBoundaryInvoked === true ||
    boundaryRecord.processBoundaryInvoked === true;

  return ApprovalInboxItemSchema.parse({
    id: stableId(
      'approval_inbox_item',
      `${approvalType}:${record.approvalRequestId}:${record.status}`,
    ),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: record.createdAt,
    approvalType,
    approvalRequestId: record.approvalRequestId,
    approvalRecordId: record.id,
    approvalArtifactIdHash: record.approvalArtifactId
      ? stableHash(record.approvalArtifactId)
      : undefined,
    status,
    dryRunIdHash: stableHash(record.dryRunId),
    targetHash: record.dryRunPlanHash,
    actionMode: approvalType === 'browser' || approvalType === 'electron_cdp' ? 'read' : 'write',
    policyDecisionId: record.policyDecisionId,
    evidenceRefIds: record.evidenceRefs.map((ref) => ref.id),
    auditEventIds: record.auditEventIds,
    canApprove: canApprove(status),
    canDeny: canDeny(status),
    canRevoke: canRevoke(status),
    processBoundaryInvoked: boundaryInvoked,
    externalProcessStarted: boundaryRecord.externalProcessStarted === true,
    noRealWrite:
      typeof boundaryRecord.noRealWrite === 'boolean' ? boundaryRecord.noRealWrite : !boundaryInvoked,
    rawPathStored: false,
    bodyStored: false,
    tokenStored: false,
    summary: `${approvalType} approval ${status}; decision is Supervisor-gated.`,
  });
}

export function createApprovalDecisionResult(input: {
  approvalType: ApprovalUxType;
  approvalRequestId: string;
  decision: ApprovalUxDecision;
  status: ApprovalUxStatus;
  evidenceRefIds?: readonly string[];
  auditEventIds?: readonly string[];
  summary?: string;
}): ApprovalDecisionResult {
  const now = foundationTimestamp();

  return ApprovalDecisionResultSchema.parse({
    id: stableId(
      'approval_decision_result',
      `${input.approvalType}:${input.approvalRequestId}:${input.decision}:${input.status}`,
    ),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: now,
    approvalRequestId: input.approvalRequestId,
    approvalType: input.approvalType,
    decision: input.decision,
    status: input.status,
    approved: input.status === 'approved',
    evidenceRefIds: [...(input.evidenceRefIds ?? [])],
    auditEventIds: [...(input.auditEventIds ?? [])],
    processBoundaryInvoked: false,
    externalProcessStarted: false,
    rawPathStored: false,
    bodyStored: false,
    tokenStored: false,
    summary: input.summary ?? `${input.approvalType} approval decision ${input.status}.`,
  });
}

export function normalizeApprovalStatus(value: string | undefined): ApprovalUxStatus {
  if (value === 'pending') {
    return 'pending';
  }

  if (value === 'requested') {
    return 'requested';
  }

  if (value === 'approved') {
    return 'approved';
  }

  if (value === 'denied') {
    return 'denied';
  }

  if (value === 'expired') {
    return 'expired';
  }

  if (value === 'used') {
    return 'used';
  }

  if (value === 'revoked') {
    return 'revoked';
  }

  return ApprovalUxStatusSchema.parse('requested');
}

export function canApprove(status: ApprovalUxStatus): boolean {
  return status === 'pending' || status === 'requested';
}

export function canDeny(status: ApprovalUxStatus): boolean {
  return status === 'pending' || status === 'requested';
}

export function canRevoke(status: ApprovalUxStatus): boolean {
  return status === 'approved';
}

export function isTerminal(status: ApprovalUxStatus): boolean {
  return ['denied', 'expired', 'used', 'revoked'].includes(status);
}

function isRequestedLike(status: ApprovalUxStatus): boolean {
  return status === 'pending' || status === 'requested';
}

function codexActionModeFromScope(
  scope: CodexExecManualApprovalRecord['request']['scope'],
): ActionMode {
  if (scope === 'workspace_write_plan') {
    return 'write';
  }

  if (scope === 'danger_full_access_plan') {
    return 'admin';
  }

  return 'dry-run';
}

function stableHash(value: string): string {
  return `sha256:${hashText(value)}`;
}

function stableId(prefix: string, value: string): string {
  return `${prefix}_${hashText(value).slice(0, 16)}`;
}

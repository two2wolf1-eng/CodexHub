import { describe, expect, it } from 'vitest';
import type {
  CodexExecManualApprovalRecord,
  WorktreeApprovalArtifactRecord,
} from '@codexhub/contracts';
import {
  ApprovalDecisionResultSchema,
  ApprovalInboxProjectionSchema,
  SchemaVersionSchema,
} from '@codexhub/contracts';
import {
  createApprovalDecisionResult,
  createApprovalInboxProjection,
  projectCodexApproval,
  projectGenericApproval,
} from './index';

const createdAt = '2026-05-04T00:00:00.000Z';

describe('approval-ux-kernel', () => {
  it('projects heterogeneous approval records into a metadata-only inbox', () => {
    const codex = projectCodexApproval(createCodexApprovalRecord('pending'));
    const worktree = projectGenericApproval('worktree', createWorktreeApprovalRecord('approved'));
    const inbox = createApprovalInboxProjection({
      codex: [createCodexApprovalRecord('pending')],
      worktree: [createWorktreeApprovalRecord('approved')],
    });
    const serialized = JSON.stringify({ codex, worktree, inbox });

    expect(codex.canApprove).toBe(true);
    expect(codex.canDeny).toBe(true);
    expect(worktree.canRevoke).toBe(true);
    expect(inbox.itemCount).toBe(2);
    expect(inbox.requestedCount).toBe(1);
    expect(inbox.approvedCount).toBe(1);
    expect(ApprovalInboxProjectionSchema.parse(inbox).typeBreakdown.worktree).toBe(1);
    expect(serialized).not.toContain('raw prompt');
    expect(serialized).not.toContain('diff --git');
    expect(serialized).not.toContain('C:/');
    expect(serialized).not.toContain('local-control-secret');
  });

  it('creates decision results without becoming execution authority', () => {
    const result = createApprovalDecisionResult({
      approvalType: 'worktree',
      approvalRequestId: 'worktree_approval_request_1',
      decision: 'approved',
      status: 'approved',
      evidenceRefIds: ['evidence_1'],
      auditEventIds: ['audit_1'],
    });
    const serialized = JSON.stringify(result);

    expect(ApprovalDecisionResultSchema.parse(result).approved).toBe(true);
    expect(result.processBoundaryInvoked).toBe(false);
    expect(result.externalProcessStarted).toBe(false);
    expect(serialized).not.toContain('ExecutionAuthority');
    expect(serialized).not.toContain('approvalArtifact');
  });
});

function createCodexApprovalRecord(status: 'pending' | 'approved'): CodexExecManualApprovalRecord {
  return {
    id: `codex_approval_record_${status}`,
    schemaVersion: SchemaVersionSchema.value,
    createdAt,
    request: {
      id: 'codex_approval_request_1',
      schemaVersion: SchemaVersionSchema.value,
      createdAt,
      dryRunPlanId: 'codex_dry_run_1',
      dryRunPlanHash: 'sha256:codex-plan',
      policyDecisionId: 'policy_codex_1',
      policyDecisionHash: 'sha256:policy',
      scope: 'read_only_plan',
      status,
      riskLevel: 'medium',
      requestedBy: 'local-operator',
      reason: 'Review Codex dry-run evidence',
      expiresAt: createdAt,
      singleUse: true,
      liveExecution: false,
      externalProcessStarted: false,
      executionDisabled: true,
      bodyStored: false,
      rawPathStored: false,
      summary: 'Codex approval request.',
    },
    status,
    approvalArtifact:
      status === 'approved'
        ? {
            id: 'codex_approval_artifact_1',
            schemaVersion: SchemaVersionSchema.value,
            createdAt,
            dryRunPlanId: 'codex_dry_run_1',
            dryRunPlanHash: 'sha256:codex-plan',
            policyDecisionId: 'policy_codex_1',
            policyDecisionHash: 'sha256:policy',
            scope: 'read_only_plan',
            status: 'approved',
            expiresAt: createdAt,
            singleUse: true,
            revoked: false,
            liveExecution: false,
            externalProcessStarted: false,
            executionDisabled: true,
            bodyStored: false,
            rawPathStored: false,
            summary: 'Codex approval artifact.',
          }
        : undefined,
    evidenceRefs: [{ id: 'evidence_codex_1' } as never],
    auditEventIds: ['audit_codex_1'],
    liveExecution: false,
    externalProcessStarted: false,
    executionDisabled: true,
    bodyStored: false,
    rawPathStored: false,
    summary: 'Codex approval record.',
  } as unknown as CodexExecManualApprovalRecord;
}

function createWorktreeApprovalRecord(
  status: 'requested' | 'approved',
): WorktreeApprovalArtifactRecord {
  return {
    id: `worktree_approval_record_${status}`,
    schemaVersion: SchemaVersionSchema.value,
    createdAt,
    dryRunId: 'worktree_dry_run_1',
    dryRunRecordId: 'worktree_dry_run_record_1',
    approvalRequestId: 'worktree_approval_request_1',
    approvalArtifactId: status === 'approved' ? 'worktree_approval_artifact_1' : undefined,
    status,
    requestedBy: 'local-operator',
    dryRunPlanHash: 'sha256:worktree-plan',
    policyDecisionId: 'policy_worktree_1',
    policyDecisionHash: 'sha256:policy',
    approved: status === 'approved',
    requestedAt: createdAt,
    expiresAt: status === 'approved' ? createdAt : undefined,
    timeline: [],
    evidenceRefs: [{ id: 'evidence_worktree_1' } as never],
    auditEventIds: ['audit_worktree_1'],
    rawPathStored: false,
    bodyStored: false,
    gitProcessBoundaryInvoked: false,
    processBoundaryInvoked: false,
    externalProcessStarted: false,
    summary: 'Worktree approval record.',
  } as unknown as WorktreeApprovalArtifactRecord;
}

import { describe, expect, it } from 'vitest';
import type {
  CodexExecManualApprovalRecord,
  LocalReviewPackageApprovalArtifactRecord,
  ProductionWorkflowRecoveryApprovalArtifact,
  WorktreeApprovalArtifactRecord,
} from '@codexhub/contracts';
import {
  ApprovalDecisionHistoryProjectionSchema,
  ApprovalDecisionResultSchema,
  ApprovalInboxProjectionSchema,
  SchemaVersionSchema,
} from '@codexhub/contracts';
import {
  createApprovalDecisionHistoryProjection,
  createApprovalDecisionResult,
  createApprovalInboxProjection,
  projectCodexApproval,
  projectGenericApproval,
  projectProductionWorkflowRecoveryApproval,
  projectReviewPackageApproval,
} from './index';
import {
  adversarialPublicOutputFixture,
  findAdversarialPublicOutputLeaks,
  findAdversarialPublicOutputRoundTripLeaks,
} from '../../../test-fixtures/adversarial-public-output-fixture';

const createdAt = '2026-05-04T00:00:00.000Z';

describe('approval-ux-kernel', () => {
  it('projects heterogeneous approval records into a metadata-only inbox', () => {
    const codex = projectCodexApproval(createCodexApprovalRecord('pending'));
    const worktree = projectGenericApproval('worktree', createWorktreeApprovalRecord('approved'));
    const reviewPackage = projectReviewPackageApproval(createReviewPackageApprovalRecord('requested'));
    const recovery = projectProductionWorkflowRecoveryApproval(
      createProductionWorkflowRecoveryApprovalRecord('approved'),
    );
    const inbox = createApprovalInboxProjection({
      codex: [createCodexApprovalRecord('pending')],
      worktree: [createWorktreeApprovalRecord('approved')],
      reviewPackage: [createReviewPackageApprovalRecord('requested')],
      productionWorkflowRecovery: [createProductionWorkflowRecoveryApprovalRecord('approved')],
    });
    const serialized = JSON.stringify({ codex, worktree, reviewPackage, recovery, inbox });

    expect(codex.canApprove).toBe(true);
    expect(codex.canDeny).toBe(true);
    expect(worktree.canRevoke).toBe(true);
    expect(inbox.itemCount).toBe(4);
    expect(inbox.requestedCount).toBe(2);
    expect(inbox.approvedCount).toBe(2);
    expect(ApprovalInboxProjectionSchema.parse(inbox).typeBreakdown.worktree).toBe(1);
    expect(ApprovalInboxProjectionSchema.parse(inbox).typeBreakdown.review_package).toBe(1);
    expect(
      ApprovalInboxProjectionSchema.parse(inbox).typeBreakdown.production_workflow_recovery,
    ).toBe(1);
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

  it('projects approval decision history from inbox and decision metadata only', () => {
    const inbox = createApprovalInboxProjection({
      codex: [createCodexApprovalRecord('pending')],
      worktree: [createWorktreeApprovalRecord('approved')],
    });
    const decision = createApprovalDecisionResult({
      approvalType: 'worktree',
      approvalRequestId: 'worktree_approval_request_1',
      decision: 'approved',
      status: 'approved',
      evidenceRefIds: ['evidence_decision_1'],
      auditEventIds: ['audit_decision_1'],
    });
    const projection = createApprovalDecisionHistoryProjection({
      inbox,
      decisions: [decision],
      reasonSummaries: {
        [decision.id]: 'Reviewed metadata-only evidence; do not store local-control-secret.',
      },
    });
    const filtered = createApprovalDecisionHistoryProjection({
      inbox,
      decisions: [decision],
      approvalType: 'worktree',
      status: 'approved',
    });
    const serialized = JSON.stringify(projection);

    expect(ApprovalDecisionHistoryProjectionSchema.parse(projection).itemCount).toBe(3);
    expect(projection.approvedCount).toBe(2);
    expect(projection.decisionBreakdown.approved).toBe(1);
    expect(filtered.items.every((item) => item.approvalType === 'worktree')).toBe(true);
    expect(filtered.items.every((item) => item.status === 'approved')).toBe(true);
    expect(serialized).not.toContain('C:/');
    expect(serialized).not.toContain('diff --git');
    expect(serialized).not.toContain('local-control-secret');
    expect(serialized).not.toContain('ExecutionAuthority');
    expect(serialized).not.toContain('approvalArtifact');
  });

  it('hashes raw decision reasons and redacts local-control and credential markers', () => {
    const decision = createApprovalDecisionResult({
      approvalType: 'worktree',
      approvalRequestId: 'worktree_approval_request_1',
      decision: 'denied',
      status: 'denied',
      evidenceRefIds: ['evidence_decision_1'],
      auditEventIds: ['audit_decision_1'],
    });
    const projection = createApprovalDecisionHistoryProjection({
      decisions: [decision],
      reasonSummaries: {
        [decision.id]: `Reject ${adversarialPublicOutputFixture} token=private cookie=private session=private C:/private local-control-secret`,
      },
    });
    const item = projection.items[0];
    const serialized = JSON.stringify(projection);

    expect(item?.reasonHash).toMatch(/^sha256:/);
    expect(item?.reasonSummary).toContain('[redacted]');
    expect(item?.reasonSummary).not.toContain('private');
    expect(item?.reasonSummary).not.toContain('local-control-secret');
    expect(item?.reasonSummary).not.toContain('raw prompt fixture');
    expect(item?.reasonSummary).not.toContain('stdout fixture');
    expect(item?.reasonSummary).not.toContain('stderr fixture');
    expect(item?.reasonSummary).not.toContain('diff --git');
    expect(item?.reasonSummary).not.toContain('https://api.github.com');
    expect(item?.reasonSummary).not.toContain('raw file content fixture');
    expect(item?.reasonSummary).not.toContain('# Raw PR markdown');
    expect(item?.reasonSummary).not.toContain('raw reason text');
    expect(findAdversarialPublicOutputLeaks(serialized)).toEqual([]);
    expect(serialized).not.toContain('token=private');
    expect(serialized).not.toContain('cookie=private');
    expect(serialized).not.toContain('session=private');
    expect(serialized).not.toContain('C:/private');
    expect(serialized).not.toContain('ENV_VALUE_SECRET');
    expect(serialized).not.toContain('request body fixture');
    expect(serialized).not.toContain('response body fixture');
  });

  it('keeps approval inbox and history projections metadata-only after JSON round-trip', () => {
    const inbox = createApprovalInboxProjection({
      codex: [createCodexApprovalRecord('pending')],
      worktree: [createWorktreeApprovalRecord('approved')],
    });
    const decision = createApprovalDecisionResult({
      approvalType: 'worktree',
      approvalRequestId: 'worktree_approval_request_1',
      decision: 'denied',
      status: 'denied',
      evidenceRefIds: ['evidence_decision_roundtrip'],
      auditEventIds: ['audit_decision_roundtrip'],
    });
    const history = createApprovalDecisionHistoryProjection({
      inbox,
      decisions: [decision],
      reasonSummaries: {
        [decision.id]: adversarialPublicOutputFixture,
      },
    });

    expect(findAdversarialPublicOutputRoundTripLeaks({ inbox, history })).toEqual([]);
    expect(history.items.every((item) => item.rawPathStored === false)).toBe(true);
    expect(history.items.every((item) => item.bodyStored === false)).toBe(true);
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

function createReviewPackageApprovalRecord(
  status: 'requested' | 'approved',
): LocalReviewPackageApprovalArtifactRecord {
  return {
    id: `review_package_approval_record_${status}`,
    schemaVersion: SchemaVersionSchema.value,
    createdAt,
    dryRunId: 'review_package_dry_run_1',
    dryRunRecordId: 'review_package_dry_run_record_1',
    approvalRequestId: 'review_package_approval_request_1',
    approvalArtifactId: 'review_package_approval_artifact_1',
    status,
    approved: status === 'approved',
    policyDecisionId: 'policy_review_package_1',
    reasonHash: 'sha256:reason',
    evidenceRefs: [{ id: 'evidence_review_package_1' } as never],
    auditEventIds: ['audit_review_package_1'],
    artifactWriteBoundaryInvoked: false,
    processBoundaryInvoked: false,
    externalProcessStarted: false,
    rawPathStored: false,
    bodyStored: false,
    summary: 'Review package approval record.',
  } as unknown as LocalReviewPackageApprovalArtifactRecord;
}

function createProductionWorkflowRecoveryApprovalRecord(
  status: 'requested' | 'approved',
): ProductionWorkflowRecoveryApprovalArtifact {
  return {
    id: `production_workflow_recovery_approval_record_${status}`,
    schemaVersion: SchemaVersionSchema.value,
    createdAt,
    dryRunId: 'production_workflow_recovery_dry_run_1',
    templateId: 'local-patch-review',
    templateHash: 'sha256:template',
    approvalArtifactId: 'production_workflow_recovery_approval_artifact_1',
    status,
    approvedBy: status === 'approved' ? 'operator' : undefined,
    reasonHash: 'sha256:reason',
    childApprovalsIncluded: false,
    bodyStored: false,
    rawPathStored: false,
    summary: 'Production workflow recovery approval record.',
  } as unknown as ProductionWorkflowRecoveryApprovalArtifact;
}

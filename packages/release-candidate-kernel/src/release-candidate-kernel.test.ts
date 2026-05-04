import { describe, expect, it } from 'vitest';
import { createLocalReviewDecisionHandoff, createLocalReviewPackageProjection } from '@codexhub/review-package-kernel';
import { createLocalRcReadinessProjection } from './index';

describe('release-candidate-kernel', () => {
  it('projects ready local RC metadata from an approved review package', () => {
    const reviewPackage = createLocalReviewDecisionHandoff({
      reviewPackage: createLocalReviewPackageProjection({
        sourceLifecycleRunId: 'm12_lifecycle_ready',
        sourcePatchRunId: 'm12_patch_ready',
        changedFilePathHashes: ['sha256:file-a'],
        diffHash: 'sha256:diff',
        verificationStatus: 'passed',
        readinessStatus: 'ready_for_review_draft_only',
        readyForReviewDraftOnly: true,
        evidenceRefIds: ['evidence_patch'],
        auditEventIds: ['audit_patch'],
      }),
      status: 'approved_for_local_rc',
    });
    const projection = createLocalRcReadinessProjection({
      reviewPackage,
      operatorReadinessStatus: 'pass',
      evidenceRefIds: ['evidence_operator'],
      auditEventIds: ['audit_operator'],
    });
    const serialized = JSON.stringify(projection);

    expect(projection.summary.status).toBe('ready_for_local_acceptance');
    expect(projection.summary.localAcceptanceReady).toBe(true);
    expect(projection.evidenceBundle.evidenceCount).toBe(2);
    expect(projection.auditChain.auditEventCount).toBe(2);
    expect(projection.plan.processBoundaryInvoked).toBe(false);
    expect(projection.plan.externalProcessStarted).toBe(false);
    expect(serialized).not.toContain('diff --git');
    expect(serialized).not.toContain('pull request body');
    expect(serialized).not.toContain('C:\\');
    expect(serialized).not.toContain('secret-token');
  });

  it('blocks local RC readiness for review, verification, and operator blockers', () => {
    const baseReviewPackage = createLocalReviewPackageProjection({
      sourceLifecycleRunId: 'm12_lifecycle_blocked',
      sourcePatchRunId: 'm12_patch_blocked',
      changedFilePathHashes: ['sha256:file-a'],
      diffHash: 'sha256:diff',
      verificationStatus: 'passed',
      readinessStatus: 'ready_for_review_draft_only',
      readyForReviewDraftOnly: true,
    });
    const reviewBlocked = createLocalRcReadinessProjection({
      reviewPackage: createLocalReviewDecisionHandoff({
        reviewPackage: baseReviewPackage,
        status: 'changes_requested',
      }),
      operatorReadinessStatus: 'pass',
    });
    const verificationBlocked = createLocalRcReadinessProjection({
      reviewPackage: createLocalReviewDecisionHandoff({
        reviewPackage: createLocalReviewPackageProjection({
          sourceLifecycleRunId: 'm12_lifecycle_failed',
          sourcePatchRunId: 'm12_patch_failed',
          changedFilePathHashes: ['sha256:file-a'],
          diffHash: 'sha256:diff',
          verificationStatus: 'failed',
          readinessStatus: 'blocked_verification_failed',
          readyForReviewDraftOnly: false,
        }),
        status: 'approved_for_local_rc',
      }),
      operatorReadinessStatus: 'pass',
    });
    const operatorBlocked = createLocalRcReadinessProjection({
      reviewPackage: createLocalReviewDecisionHandoff({
        reviewPackage: baseReviewPackage,
        status: 'approved_for_local_rc',
      }),
      operatorReadinessStatus: 'fail',
    });

    expect(reviewBlocked.summary.status).toBe('blocked_review');
    expect(verificationBlocked.summary.status).toBe('blocked_verification');
    expect(operatorBlocked.summary.status).toBe('blocked_operator_readiness');
  });
});

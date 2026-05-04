import { describe, expect, it } from 'vitest';
import { LocalReviewPackageRunSchema } from '@codexhub/contracts';
import { createLocalReviewPackageProjection } from './index';

describe('review-package-kernel', () => {
  it('projects M12 patch readiness into a metadata-only local review package', () => {
    const result = createLocalReviewPackageProjection({
      sourceLifecycleRunId: 'm12_lifecycle_1',
      sourcePatchRunId: 'm12_patch_run_1',
      sourceVerificationGateId: 'm12_verification_gate_1',
      changedFiles: ['packages/contracts/src/index.ts', 'packages/orchestrator-kernel/src/x.ts'],
      diffHash: 'sha256:diff',
      verificationStatus: 'passed',
      readinessStatus: 'ready_for_review_draft_only',
      readyForReviewDraftOnly: true,
      evidenceRefIds: ['evidence_patch', 'evidence_verification'],
      auditEventIds: ['audit_patch', 'audit_verification'],
    });
    const serialized = JSON.stringify(result);

    expect(result.packageSummary.status).toBe('ready_for_review');
    expect(result.packageSummary.readyForReviewDraftOnly).toBe(true);
    expect(result.plan.changedFileCount).toBe(2);
    expect(result.plan.changedFilePathHashes.every((hash) => hash.startsWith('sha256:'))).toBe(
      true,
    );
    expect(result.decision.status).toBe('pending');
    expect(result.exported).toBe(false);
    expect(result.processBoundaryInvoked).toBe(false);
    expect(LocalReviewPackageRunSchema.parse(result).id).toBe(result.id);
    expect(serialized).not.toContain('packages/contracts/src/index.ts');
    expect(serialized).not.toContain('diff --git');
    expect(serialized).not.toContain('pull request body');
    expect(serialized).not.toContain('secret-token');
  });

  it('blocks local review readiness when verification or patch output is not ready', () => {
    const failed = createLocalReviewPackageProjection({
      sourceLifecycleRunId: 'm12_lifecycle_failed',
      sourcePatchRunId: 'm12_patch_run_failed',
      changedFilePathHashes: ['sha256:file'],
      verificationStatus: 'failed',
      readinessStatus: 'blocked_verification_failed',
      readyForReviewDraftOnly: false,
    });
    const empty = createLocalReviewPackageProjection({
      sourceLifecycleRunId: 'm12_lifecycle_empty',
      sourcePatchRunId: 'm12_patch_run_empty',
      verificationStatus: 'passed',
      readinessStatus: 'not_ready_no_patch',
      readyForReviewDraftOnly: false,
    });

    expect(failed.packageSummary.status).toBe('blocked_verification');
    expect(failed.decision.blockerCount).toBeGreaterThan(0);
    expect(empty.packageSummary.status).toBe('blocked_patch');
    expect(empty.packageSummary.readyForReviewDraftOnly).toBe(false);
  });
});

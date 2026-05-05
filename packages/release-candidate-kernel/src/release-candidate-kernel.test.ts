import { describe, expect, it } from 'vitest';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { createLocalReviewDecisionHandoff, createLocalReviewPackageProjection } from '@codexhub/review-package-kernel';
import {
  createLocalRcBundleApprovalRecord,
  createLocalRcBundleExportDryRunRecord,
  createLocalRcReadinessProjection,
  executeLocalRcBundleExport,
  runLocalRcAcceptanceRehearsal,
} from './index';
import {
  adversarialPublicOutputFixture,
  findAdversarialPublicOutputLeaks,
  findAdversarialPublicOutputRoundTripLeaks,
} from '../../../test-fixtures/adversarial-public-output-fixture';

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

  it('keeps adversarial source metadata out of local RC readiness projections', () => {
    const reviewPackage = createLocalReviewDecisionHandoff({
      reviewPackage: createLocalReviewPackageProjection({
        sourceLifecycleRunId: adversarialPublicOutputFixture,
        sourcePatchRunId: adversarialPublicOutputFixture,
        changedFilePathHashes: [adversarialPublicOutputFixture],
        diffHash: adversarialPublicOutputFixture,
        verificationStatus: 'passed',
        readinessStatus: 'ready_for_review_draft_only',
        readyForReviewDraftOnly: true,
        evidenceRefIds: ['evidence_adversarial_fixture'],
        auditEventIds: ['audit_adversarial_fixture'],
      }),
      status: 'approved_for_local_rc',
      reason: adversarialPublicOutputFixture,
    });
    const projection = createLocalRcReadinessProjection({
      reviewPackage,
      operatorReadinessStatus: 'pass',
      evidenceRefIds: ['evidence_operator'],
      auditEventIds: ['audit_operator'],
    });

    expect(projection.summary.status).toBe('ready_for_local_acceptance');
    expect(findAdversarialPublicOutputLeaks(JSON.stringify(projection))).toEqual([]);
  });

  it('keeps local RC public summaries metadata-only after JSON round-trip', () => {
    const reviewPackage = createLocalReviewDecisionHandoff({
      reviewPackage: createLocalReviewPackageProjection({
        sourceLifecycleRunId: adversarialPublicOutputFixture,
        sourcePatchRunId: adversarialPublicOutputFixture,
        changedFilePathHashes: [adversarialPublicOutputFixture],
        diffHash: adversarialPublicOutputFixture,
        verificationStatus: 'passed',
        readinessStatus: 'ready_for_review_draft_only',
        readyForReviewDraftOnly: true,
        evidenceRefIds: ['evidence_rc_roundtrip'],
        auditEventIds: ['audit_rc_roundtrip'],
      }),
      status: 'approved_for_local_rc',
      reason: adversarialPublicOutputFixture,
    });
    const projection = createLocalRcReadinessProjection({
      reviewPackage,
      operatorReadinessStatus: 'pass',
      evidenceRefIds: ['evidence_operator_roundtrip'],
      auditEventIds: ['audit_operator_roundtrip'],
    });

    expect(findAdversarialPublicOutputRoundTripLeaks(projection)).toEqual([]);
    expect(projection.plan.rawPathStored).toBe(false);
    expect(projection.plan.bodyStored).toBe(false);
  });

  it('exports a governed local RC bundle only after approval and hash-bound target validation', async () => {
    const workspaceRoot = await mkdtemp(join(tmpdir(), 'codexhub-workspace-'));
    const reviewPackage = createLocalReviewDecisionHandoff({
      reviewPackage: createLocalReviewPackageProjection({
        sourceLifecycleRunId: 'm12_lifecycle_rc_export',
        sourcePatchRunId: 'm12_patch_rc_export',
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
    const dryRun = createLocalRcBundleExportDryRunRecord({
      ...projection,
      workspaceRoot,
      bundleId: 'rc-bundle-export',
    });
    const approval = createLocalRcBundleApprovalRecord({
      dryRunRecord: dryRun,
      status: 'approved',
      reason: 'operator approved local RC bundle export',
    });
    const completed = await executeLocalRcBundleExport({
      dryRunRecord: dryRun,
      approvalRecord: approval,
      enabled: true,
      authority: {
        id: 'authority_rc_export',
        schemaVersion: dryRun.schemaVersion,
        createdAt: dryRun.createdAt,
        policyDecisionId: dryRun.policyDecision.id,
        approvalArtifactId: approval.approvalArtifactId,
        allowed: true,
        constraints: [],
      },
      runtime: {
        workspaceRoot,
        bundleId: 'rc-bundle-export',
      },
    });
    const artifactRoot = resolve(workspaceRoot, '..', 'CodexHub-artifacts');
    const jsonBody = await readFile(
      join(
        artifactRoot,
        'release-candidates',
        'rc-bundle-export',
        'release-candidate-summary.json',
      ),
      'utf8',
    );
    const serialized = JSON.stringify(completed);

    expect(dryRun.status).toBe('planned');
    expect(completed.status).toBe('completed');
    expect(completed.artifactWriteBoundaryInvoked).toBe(true);
    expect(completed.noRealWrite).toBe(false);
    expect(jsonBody).toContain('"status"');
    expect(serialized).not.toContain(workspaceRoot);
    expect(serialized).not.toContain('diff --git');
    expect(serialized).not.toContain('pull request body');
    await rm(workspaceRoot, { recursive: true, force: true });
    await rm(artifactRoot, { recursive: true, force: true });
  });

  it('blocks local RC bundle export before file writes when approval or target binding is invalid', async () => {
    const workspaceRoot = await mkdtemp(join(tmpdir(), 'codexhub-workspace-'));
    const reviewPackage = createLocalReviewDecisionHandoff({
      reviewPackage: createLocalReviewPackageProjection({
        sourceLifecycleRunId: 'm12_lifecycle_rc_blocked',
        sourcePatchRunId: 'm12_patch_rc_blocked',
        changedFilePathHashes: ['sha256:file-a'],
        verificationStatus: 'passed',
        readinessStatus: 'ready_for_review_draft_only',
        readyForReviewDraftOnly: true,
      }),
      status: 'approved_for_local_rc',
    });
    const projection = createLocalRcReadinessProjection({
      reviewPackage,
      operatorReadinessStatus: 'pass',
    });
    const dryRun = createLocalRcBundleExportDryRunRecord({
      ...projection,
      workspaceRoot,
      bundleId: 'rc-bundle-blocked',
    });
    const missingApproval = await executeLocalRcBundleExport({
      dryRunRecord: dryRun,
      enabled: true,
      authority: {
        id: 'authority_denied',
        schemaVersion: dryRun.schemaVersion,
        createdAt: dryRun.createdAt,
        policyDecisionId: dryRun.policyDecision.id,
        allowed: false,
        constraints: [],
      },
      runtime: {
        workspaceRoot,
        bundleId: 'rc-bundle-blocked',
      },
    });
    const approval = createLocalRcBundleApprovalRecord({
      dryRunRecord: dryRun,
      status: 'approved',
    });
    const mismatch = await executeLocalRcBundleExport({
      dryRunRecord: dryRun,
      approvalRecord: approval,
      enabled: true,
      authority: {
        id: 'authority_mismatch',
        schemaVersion: dryRun.schemaVersion,
        createdAt: dryRun.createdAt,
        policyDecisionId: dryRun.policyDecision.id,
        approvalArtifactId: approval.approvalArtifactId,
        allowed: true,
        constraints: [],
      },
      runtime: {
        workspaceRoot,
        bundleId: 'different-rc-bundle',
      },
    });

    expect(missingApproval.status).toBe('blocked');
    expect(missingApproval.artifactWriteBoundaryInvoked).toBe(false);
    expect(mismatch.status).toBe('blocked');
    expect(mismatch.blockReasons).toContain('artifact_target_hash_mismatch');
    expect(mismatch.artifactWriteBoundaryInvoked).toBe(false);
    await rm(workspaceRoot, { recursive: true, force: true });
    await rm(resolve(workspaceRoot, '..', 'CodexHub-artifacts'), { recursive: true, force: true });
  });

  it('runs fixture-only local RC acceptance rehearsal scenarios without export boundary writes', () => {
    const passed = runLocalRcAcceptanceRehearsal({ scenario: 'all-pass' });
    const reviewBlocked = runLocalRcAcceptanceRehearsal({ scenario: 'review-blocked' });
    const verificationBlocked = runLocalRcAcceptanceRehearsal({
      scenario: 'verification-blocked',
    });
    const readinessBlocked = runLocalRcAcceptanceRehearsal({ scenario: 'readiness-blocked' });
    const exportBlocked = runLocalRcAcceptanceRehearsal({ scenario: 'export-blocked' });
    const superseded = runLocalRcAcceptanceRehearsal({ scenario: 'superseded-package' });
    const serialized = JSON.stringify([
      passed,
      reviewBlocked,
      verificationBlocked,
      readinessBlocked,
      exportBlocked,
      superseded,
    ]);

    expect(passed.status).toBe('passed');
    expect(passed.exportSummaryStatus).toBe('fixture_completed');
    expect(passed.operatorAcceptanceStatus).toBe('accepted');
    expect(reviewBlocked.status).toBe('blocked');
    expect(reviewBlocked.rcReadinessStatus).toBe('blocked_review');
    expect(verificationBlocked.rcReadinessStatus).toBe('blocked_verification');
    expect(readinessBlocked.rcReadinessStatus).toBe('blocked_operator_readiness');
    expect(exportBlocked.exportSummaryStatus).toBe('blocked');
    expect(superseded.reviewDecisionStatus).toBe('superseded');
    expect(
      [
        passed,
        reviewBlocked,
        verificationBlocked,
        readinessBlocked,
        exportBlocked,
        superseded,
      ].every((run) => !run.artifactWriteBoundaryInvoked && run.noRealWrite),
    ).toBe(true);
    expect(serialized).not.toContain('C:\\');
    expect(serialized).not.toContain('diff --git');
    expect(serialized).not.toContain('pull request body');
    expect(serialized).not.toContain('secret-token');
  });
});

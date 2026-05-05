import { describe, expect, it } from 'vitest';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { LocalReviewPackageRunSchema } from '@codexhub/contracts';
import {
  createLocalReviewPackageApprovalRecord,
  createLocalReviewDecisionHandoff,
  createLocalReviewPackageExportDryRunRecord,
  createLocalReviewPackageProjection,
  executeLocalReviewPackageExport,
} from './index';
import {
  adversarialPublicOutputFixture,
  findAdversarialPublicOutputLeaks,
} from '../../../test-fixtures/adversarial-public-output-fixture';

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

  it('normalizes adversarial raw diff and path-hash inputs before public projection output', () => {
    const result = createLocalReviewPackageProjection({
      sourceLifecycleRunId: 'm12_lifecycle_adversarial',
      sourcePatchRunId: 'm12_patch_adversarial',
      changedFilePathHashes: [adversarialPublicOutputFixture],
      diffHash: adversarialPublicOutputFixture,
      verificationStatus: 'passed',
      readinessStatus: 'ready_for_review_draft_only',
      readyForReviewDraftOnly: true,
    });
    const serialized = JSON.stringify(result);

    expect(result.plan.changedFilePathHashes[0]).toMatch(/^sha256:/);
    expect(result.plan.changedFilePathHashes[0]).not.toBe(adversarialPublicOutputFixture);
    expect(result.plan.diffHash).toMatch(/^sha256:/);
    expect(result.plan.diffHash).not.toBe(adversarialPublicOutputFixture);
    expect(findAdversarialPublicOutputLeaks(serialized)).toEqual([]);
  });

  it('projects local review decisions and M12 retry handoff without storing raw reasons', () => {
    const reviewPackage = createLocalReviewPackageProjection({
      sourceLifecycleRunId: 'm12_lifecycle_decision',
      sourcePatchRunId: 'm12_patch_decision',
      changedFilePathHashes: ['sha256:file'],
      diffHash: 'sha256:diff',
      verificationStatus: 'passed',
      readinessStatus: 'ready_for_review_draft_only',
      readyForReviewDraftOnly: true,
    });
    const approved = createLocalReviewDecisionHandoff({
      reviewPackage,
      status: 'approved_for_local_rc',
      reason: 'safe to promote to local RC package',
    });
    const changesRequested = createLocalReviewDecisionHandoff({
      reviewPackage,
      status: 'changes_requested',
      reason: 'please revise the changed API surface before RC',
      findingCount: 2,
      blockerCount: 1,
    });
    const serialized = JSON.stringify({ approved, changesRequested });

    expect(approved.decision.status).toBe('approved_for_local_rc');
    expect(approved.decision.nextAction).toBe('local_rc_readiness');
    expect(approved.decision.blockerCount).toBe(0);
    expect(changesRequested.decision.status).toBe('changes_requested');
    expect(changesRequested.decision.nextAction).toBe('m12_retry_handoff');
    expect(changesRequested.decision.retryHandoffRequired).toBe(true);
    expect(changesRequested.decision.reasonHash).toMatch(/^sha256:/);
    expect(changesRequested.processBoundaryInvoked).toBe(false);
    expect(changesRequested.externalProcessStarted).toBe(false);
    expect(serialized).not.toContain('please revise');
    expect(serialized).not.toContain('safe to promote');
    expect(serialized).not.toContain('diff --git');
    expect(serialized).not.toContain('C:\\');
    expect(serialized).not.toContain('secret-token');
  });

  it('exports a governed local review package only after approval and hash-bound target validation', async () => {
    const workspaceRoot = await mkdtemp(join(tmpdir(), 'codexhub-workspace-'));
    const reviewPackage = createLocalReviewPackageProjection({
      sourceLifecycleRunId: 'm12_lifecycle_export',
      sourcePatchRunId: 'm12_patch_export',
      changedFilePathHashes: ['sha256:file'],
      diffHash: 'sha256:diff',
      verificationStatus: 'passed',
      readinessStatus: 'ready_for_review_draft_only',
      readyForReviewDraftOnly: true,
      evidenceRefIds: ['evidence_export'],
      auditEventIds: ['audit_export'],
    });
    const dryRun = createLocalReviewPackageExportDryRunRecord({
      reviewPackage,
      workspaceRoot,
      packageId: 'review-package-export',
    });
    const approval = createLocalReviewPackageApprovalRecord({
      dryRunRecord: dryRun,
      status: 'approved',
      reason: 'operator approved local artifact export',
    });
    const completed = await executeLocalReviewPackageExport({
      dryRunRecord: dryRun,
      approvalRecord: approval,
      reviewPackage,
      enabled: true,
      authority: {
        id: 'authority_review_export',
        schemaVersion: dryRun.schemaVersion,
        createdAt: dryRun.createdAt,
        policyDecisionId: dryRun.policyDecision.id,
        approvalArtifactId: approval.approvalArtifactId,
        allowed: true,
        constraints: [],
      },
      runtime: {
        workspaceRoot,
        packageId: 'review-package-export',
      },
    });
    const artifactRoot = resolve(workspaceRoot, '..', 'CodexHub-artifacts');
    const jsonBody = await readFile(
      join(artifactRoot, 'review-packages', 'review-package-export', 'review-package-summary.json'),
      'utf8',
    );
    const serialized = JSON.stringify(completed);

    expect(dryRun.status).toBe('planned');
    expect(completed.status).toBe('completed');
    expect(completed.artifactWriteBoundaryInvoked).toBe(true);
    expect(completed.noRealWrite).toBe(false);
    expect(jsonBody).toContain('"packageHash"');
    expect(serialized).not.toContain(workspaceRoot);
    expect(serialized).not.toContain('diff --git');
    expect(serialized).not.toContain('pull request body');
    await rm(workspaceRoot, { recursive: true, force: true });
    await rm(artifactRoot, { recursive: true, force: true });
  });

  it('blocks export before the artifact write boundary when approval or target binding is invalid', async () => {
    const workspaceRoot = await mkdtemp(join(tmpdir(), 'codexhub-workspace-'));
    const reviewPackage = createLocalReviewPackageProjection({
      sourceLifecycleRunId: 'm12_lifecycle_blocked',
      sourcePatchRunId: 'm12_patch_blocked',
      changedFilePathHashes: ['sha256:file'],
      verificationStatus: 'passed',
      readinessStatus: 'ready_for_review_draft_only',
      readyForReviewDraftOnly: true,
    });
    const dryRun = createLocalReviewPackageExportDryRunRecord({
      reviewPackage,
      workspaceRoot,
      packageId: 'review-package-blocked',
    });
    const missingApproval = await executeLocalReviewPackageExport({
      dryRunRecord: dryRun,
      reviewPackage,
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
        packageId: 'review-package-blocked',
      },
    });
    const approval = createLocalReviewPackageApprovalRecord({
      dryRunRecord: dryRun,
      status: 'approved',
    });
    const mismatch = await executeLocalReviewPackageExport({
      dryRunRecord: dryRun,
      approvalRecord: approval,
      reviewPackage,
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
        packageId: 'different-package-id',
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
});

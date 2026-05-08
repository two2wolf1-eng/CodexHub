import { describe, expect, it } from 'vitest';
import { CodexTaskRunSchema, SchemaVersionSchema } from '@codexhub/contracts';
import {
  adversarialPublicOutputFixture,
  findAdversarialPublicOutputRoundTripLeaks,
} from '../../../test-fixtures/adversarial-public-output-fixture';
import {
  applyTaskClosureWriteback,
  createTaskClosureDiffSummary,
  createTaskClosureGithubProjection,
  createTaskClosureProjectionBundle,
  createTaskClosureReviewProjection,
  createTaskClosureRun,
  createTaskClosureVerificationProjection,
} from './index';

const createdAt = '2026-05-08T00:00:00.000Z';
const schemaVersion = SchemaVersionSchema.value;

describe('task-closure-kernel', () => {
  it('creates a complete metadata-only closure bundle for review and dry-run GitHub closure', () => {
    const taskRun = createCompletedTaskRun();
    const bundle = createTaskClosureProjectionBundle({
      taskRun,
      createdAt,
      diff: {
        pathHashes: ['sha256:path-a', 'sha256:path-b'],
        fileCount: 2,
        diffHash: 'sha256:diff',
        diffSummaryHash: 'sha256:diff-summary',
      },
      verification: {
        targetCount: 3,
        passedCount: 3,
        outputSummaryHash: 'sha256:verification-output',
        processBoundaryInvoked: true,
        externalProcessStarted: true,
      },
      review: {
        status: 'ready_for_review',
        reviewPackageIdHash: 'sha256:review-package',
        packageHash: 'sha256:package',
        readyForReviewDraftOnly: true,
      },
      github: {
        branchPublishPlanIdHash: 'sha256:branch-plan',
        draftPrPlanIdHash: 'sha256:draft-pr-plan',
        ciStatus: 'pending',
      },
    });

    expect(bundle.diffSummary.status).toBe('changed');
    expect(bundle.verification.status).toBe('passed');
    expect(bundle.review.status).toBe('ready_for_review');
    expect(bundle.githubClosure.status).toBe('ci_pending');
    expect(bundle.closureRun.status).toBe('ci_pending');
    expect(bundle.githubClosure.remoteWriteAllowed).toBe(false);
    expect(bundle.closureRun.liveRemoteWriteAllowed).toBe(false);
    expect(bundle.taskRun.closureRunId).toBe(bundle.closureRun.id);
    expect(bundle.taskRun.ciStatus).toBe('pending');
    expect(findAdversarialPublicOutputRoundTripLeaks(Object.values(bundle))).toEqual([]);
    expect(JSON.stringify(bundle)).not.toContain(adversarialPublicOutputFixture);
  });

  it('blocks closure when the diff is empty or verification fails', () => {
    const taskRun = createCompletedTaskRun();
    const emptyBundle = createTaskClosureProjectionBundle({
      taskRun,
      createdAt,
      diff: { pathHashes: [], fileCount: 0 },
      verification: { targetCount: 3, passedCount: 3 },
    });
    const failedBundle = createTaskClosureProjectionBundle({
      taskRun,
      createdAt,
      diff: { pathHashes: ['sha256:path'], fileCount: 1, diffHash: 'sha256:diff' },
      verification: { targetCount: 3, passedCount: 2, failedCount: 1 },
      review: {
        status: 'ready_for_review',
        reviewPackageIdHash: 'sha256:review-package',
        packageHash: 'sha256:package',
        readyForReviewDraftOnly: true,
      },
    });

    expect(emptyBundle.diffSummary.status).toBe('empty');
    expect(emptyBundle.review.status).toBe('blocked_patch');
    expect(emptyBundle.closureRun.status).toBe('blocked');
    expect(failedBundle.verification.status).toBe('failed');
    expect(failedBundle.githubClosure.status).toBe('blocked');
    expect(failedBundle.closureRun.status).toBe('blocked');
  });

  it('links explicit child projections and writes task-run CI metadata back safely', () => {
    const taskRun = createCompletedTaskRun();
    const diffSummary = createTaskClosureDiffSummary({
      taskRun,
      observedAt: createdAt,
      pathHashes: ['sha256:path'],
      fileCount: 1,
      diffHash: 'sha256:diff',
    });
    const verification = createTaskClosureVerificationProjection({
      taskRun,
      createdAt,
      targetCount: 1,
      passedCount: 1,
      verificationRunId: 'verification_run_m59_1',
      outputSummaryHash: 'sha256:output',
    });
    const review = createTaskClosureReviewProjection({
      taskRun,
      createdAt,
      status: 'ready_for_review',
      reviewPackageIdHash: 'sha256:review',
      packageHash: 'sha256:package',
      readyForReviewDraftOnly: true,
    });
    const githubClosure = createTaskClosureGithubProjection({
      taskRun,
      createdAt,
      branchPublishPlanIdHash: 'sha256:branch-plan',
      draftPrPlanIdHash: 'sha256:draft-pr-plan',
      ciStatus: 'passed',
    });
    const closureRun = createTaskClosureRun({
      taskRun,
      diffSummary,
      verification,
      review,
      githubClosure,
      createdAt,
    });
    const writeback = applyTaskClosureWriteback({
      taskRun,
      closureRun,
      diffSummary,
      verification,
      review,
      githubClosure,
    });

    expect(githubClosure.status).toBe('ci_passed');
    expect(closureRun.status).toBe('completed');
    expect(writeback.ciStatus).toBe('passed');
    expect(writeback.diffSummaryId).toBe(diffSummary.id);
    expect(writeback.outputSummaryHash).toBe('sha256:output');
    expect(githubClosure.rawPullRequestBodyStored).toBe(false);
  });
});

function createCompletedTaskRun() {
  return CodexTaskRunSchema.parse({
    id: 'codex_task_run_m59_kernel_1',
    schemaVersion,
    createdAt,
    intentId: 'codex_task_intent_m59_kernel_1',
    status: 'completed',
    dispatchMode: 'live_app_server',
    preflightStatus: 'ready',
    approvalStatus: 'approved',
    dispatchAllowed: true,
    eventStreamStatus: 'completed',
    summary: 'Task completed before closure projection.',
  });
}

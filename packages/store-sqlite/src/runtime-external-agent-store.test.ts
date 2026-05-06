import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  createRuntimeCheckpoint,
  createRuntimeJobPlan,
  createRuntimeJobRun,
  createRuntimeLease,
  createRuntimeLock,
  enqueueRuntimeJob,
} from '@codexhub/runtime-operations-kernel';
import {
  createExternalAgentApprovalArtifact,
  createExternalAgentReadiness,
  planExternalAgentPatch,
  runExternalAgentPatchWithRunner,
} from '@codexhub/external-agent-adapter';
import {
  adversarialPublicOutputFixture,
  findAdversarialPublicOutputRoundTripLeaks,
} from '../../../test-fixtures/adversarial-public-output-fixture';
import { createSqliteStore } from './index';

describe('runtime and external agent SQLite stores', () => {
  it('round-trips scheduler and external agent records as metadata-only JSON', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'codexhub-runtime-store-'));
    const store = await createSqliteStore({ dbPath: join(dir, 'codexhub.sqlite') });

    const plan = createRuntimeJobPlan({
      jobKind: 'external-agent',
      targetKind: 'external-agent-patch',
      targetRecordId: adversarialPublicOutputFixture,
      sourceRecord: adversarialPublicOutputFixture,
      lockKeys: [adversarialPublicOutputFixture],
      schedulerEnabled: true,
      childWorkflowCoordinationEnabled: true,
      concurrencyPolicy: { scopeSeed: adversarialPublicOutputFixture },
      now: () => '2026-05-07T00:00:00.000Z',
    });
    const queue = enqueueRuntimeJob({
      plan,
      enqueueOrder: 1,
      now: () => '2026-05-07T00:00:00.000Z',
    });
    const lease = createRuntimeLease({
      queueEntry: queue,
      workerId: adversarialPublicOutputFixture,
      leaseSecret: adversarialPublicOutputFixture,
      now: () => '2026-05-07T00:00:00.000Z',
    });
    const lock = createRuntimeLock(adversarialPublicOutputFixture, {
      jobId: plan.id,
      leaseId: lease.id,
      now: () => '2026-05-07T00:00:00.000Z',
    });
    const checkpoint = createRuntimeCheckpoint({
      jobRunId: 'runtime_job_run_1',
      stepId: adversarialPublicOutputFixture,
      now: () => '2026-05-07T00:00:00.000Z',
    });
    const runtimeRun = createRuntimeJobRun({
      plan,
      queueEntry: queue,
      lease,
      checkpoint,
      status: 'running',
      now: () => '2026-05-07T00:00:00.000Z',
    });

    await store.runtimeJobPlans.saveJobPlan(plan);
    await store.runtimeQueueEntries.saveQueueEntry(queue);
    await store.runtimeLeases.saveLease(lease);
    await store.runtimeLocks.saveLock(lock);
    await store.runtimeCheckpoints.saveCheckpoint(checkpoint);
    await store.runtimeJobRuns.saveRun(runtimeRun);

    const agentPlan = planExternalAgentPatch({
      provider: 'codex-cli',
      worktreeRecordId: adversarialPublicOutputFixture,
      worktreePath: adversarialPublicOutputFixture,
      prompt: adversarialPublicOutputFixture,
      instructions: adversarialPublicOutputFixture,
      enabled: true,
      now: () => '2026-05-07T00:00:00.000Z',
    });
    const readiness = createExternalAgentReadiness({
      provider: 'codex-cli',
      externalAgentsEnabled: true,
      providerEnabled: true,
      cliConfigured: true,
      worktreeResolved: true,
      cliExecutable: adversarialPublicOutputFixture,
      worktreeRecordId: adversarialPublicOutputFixture,
      now: () => '2026-05-07T00:00:00.000Z',
    });
    const approval = createExternalAgentApprovalArtifact({
      plan: agentPlan,
      status: 'approved',
      now: () => '2026-05-07T00:00:00.000Z',
    });
    const agentRun = await runExternalAgentPatchWithRunner({
      plan: agentPlan,
      readiness,
      approval,
      runner: {
        async run() {
          return {
            status: 'completed',
            patchHash: 'sha256:patch',
            changedFileCount: 1,
          };
        },
      },
      now: () => '2026-05-07T00:00:00.000Z',
    });

    await store.externalAgentDryRuns.saveDryRun(agentPlan);
    await store.externalAgentApprovals.saveApproval(approval);
    await store.externalAgentRuns.saveRun(agentRun);
    if (agentRun.patchSummary) {
      await store.externalAgentPatchSummaries.savePatchSummary(agentRun.patchSummary);
    }

    const records = [
      ...(await store.runtimeJobPlans.listJobPlans()),
      ...(await store.runtimeQueueEntries.listQueueEntries()),
      ...(await store.runtimeLeases.listLeases()),
      ...(await store.runtimeLocks.listLocks()),
      ...(await store.runtimeCheckpoints.listCheckpoints()),
      ...(await store.runtimeJobRuns.listRuns()),
      ...(await store.externalAgentDryRuns.listDryRuns()),
      ...(await store.externalAgentApprovals.listApprovals()),
      ...(await store.externalAgentRuns.listRuns()),
      ...(await store.externalAgentPatchSummaries.listPatchSummaries()),
    ];

    expect(await store.runtimeJobPlans.getJobPlan(plan.id)).toEqual(plan);
    expect(await store.externalAgentApprovals.getApprovalByArtifactId(approval.approvalArtifactId))
      .toEqual(approval);
    expect(JSON.stringify(records)).not.toContain(adversarialPublicOutputFixture);
    expect(findAdversarialPublicOutputRoundTripLeaks(records)).toEqual([]);

    await store.close();
  });
});

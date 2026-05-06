import { describe, expect, it } from 'vitest';
import { findAdversarialPublicOutputRoundTripLeaks } from '../../../test-fixtures/adversarial-public-output-fixture';
import {
  createMultiAgentCoordinationPlan,
  createMultiAgentSlotSummary,
  createRuntimeCheckpoint,
  createRuntimeJobPlan,
  createRuntimeJobRun,
  createRuntimeLease,
  createRuntimeLock,
  enqueueRuntimeJob,
  rehearseRuntimeScheduler,
} from './index';

describe('runtime-operations-kernel', () => {
  it('creates durable runtime metadata without invoking boundaries', () => {
    const plan = createRuntimeJobPlan({
      jobKind: 'workflow',
      targetKind: 'production-recovery',
      targetRecordId: 'recovery_run_1',
      sourceRecord: 'source_run_1',
      templateId: 'local-patch-review',
      templateHash: 'sha256:template',
      lockKeys: ['workflow:local-patch-review'],
      schedulerEnabled: true,
      childWorkflowCoordinationEnabled: true,
      concurrencyPolicy: {
        scopeSeed: 'local-patch-review',
        maxConcurrent: 1,
      },
      now: () => '2026-05-07T00:00:00.000Z',
    });
    const queueEntry = enqueueRuntimeJob({
      plan,
      enqueueOrder: 1,
      now: () => '2026-05-07T00:00:00.000Z',
    });
    const lease = createRuntimeLease({
      queueEntry,
      workerId: 'worker-1',
      leaseSecret: 'lease-secret-transient',
      now: () => '2026-05-07T00:00:00.000Z',
    });
    const lock = createRuntimeLock('workflow:local-patch-review', {
      jobId: plan.id,
      leaseId: lease.id,
      now: () => '2026-05-07T00:00:00.000Z',
    });
    const checkpoint = createRuntimeCheckpoint({
      jobRunId: 'runtime_job_run_1',
      stepId: 'worktree',
      nextStepId: 'codex-patch',
      completedStepCount: 1,
      now: () => '2026-05-07T00:00:00.000Z',
    });
    const run = createRuntimeJobRun({
      plan,
      queueEntry,
      lease,
      checkpoint,
      status: 'running',
      now: () => '2026-05-07T00:00:00.000Z',
    });
    const coordination = createMultiAgentCoordinationPlan({
      workflowTemplateId: 'local-patch-review',
      workflowTemplateHash: 'sha256:template',
      slotCount: 2,
      childRunIds: ['child-run-1'],
      now: () => '2026-05-07T00:00:00.000Z',
    });
    const slot = createMultiAgentSlotSummary({
      coordinationPlan: coordination,
      slotId: 'slot-1',
      childRunId: 'child-run-1',
      now: () => '2026-05-07T00:00:00.000Z',
    });

    expect(plan.status).toBe('planned');
    expect(run.processBoundaryInvoked).toBe(false);
    expect(lock.rawKeyStored).toBe(false);
    expect(slot.directAdapterInvoked).toBe(false);
    expect(
      findAdversarialPublicOutputRoundTripLeaks([
        plan,
        queueEntry,
        lease,
        lock,
        checkpoint,
        run,
        coordination,
        slot,
      ]),
    ).toEqual([]);
  });

  it('rehearses blocked scheduler states without child execution', () => {
    const blocked = rehearseRuntimeScheduler({
      scenario: 'lock-held',
      now: () => '2026-05-07T00:00:00.000Z',
    });
    const resumed = rehearseRuntimeScheduler({
      scenario: 'resume-from-checkpoint',
      now: () => '2026-05-07T00:00:00.000Z',
    });

    expect(blocked.status).toBe('blocked');
    expect(blocked.externalProcessStarted).toBe(false);
    expect(resumed.status).toBe('passed');
    expect(resumed.checkpointCreated).toBe(true);
  });
});

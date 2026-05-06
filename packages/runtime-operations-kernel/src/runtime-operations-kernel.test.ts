import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
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

const sourceDir = dirname(fileURLToPath(import.meta.url));

describe('runtime-operations-kernel', () => {
  it('keeps runtime source free of direct process, network, and adapter execution bypasses', () => {
    const source = readFileSync(join(sourceDir, 'index.ts'), 'utf8');
    const forbiddenTerms = [
      'node:child_process',
      'child_process',
      'spawn(',
      'execFile(',
      'exec(',
      'execa',
      'shell: true',
      'fetch(',
      'http://',
      'https://',
      'executeGithub',
      'executeCodex',
      'runExternalAgentPatchWithRunner(',
      'new Worker(',
    ];

    expect(forbiddenTerms.filter((term) => source.includes(term))).toEqual([]);
  });

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

  it('preserves queue, lease, retry, lock, and checkpoint metadata deterministically', () => {
    const now = () => '2026-05-07T01:00:00.000Z';
    const plan = createRuntimeJobPlan({
      jobKind: 'external-agent',
      targetKind: 'external-agent-patch',
      targetRecordId: 'external_agent_patch_run_raw_id',
      sourceRecord: 'source run raw id',
      templateId: 'agent-template',
      templateHash: 'sha256:agent-template',
      lockKeys: ['worktree:C:/repo-root-must-not-leak'],
      retryPolicy: {
        maxAttempts: 5,
        attemptCount: 2,
        backoffStrategy: 'exponential',
        backoffSeconds: 45,
        retryableStatuses: ['failed', 'timed_out'],
      },
      schedulerEnabled: true,
      childWorkflowCoordinationEnabled: true,
      concurrencyPolicy: {
        scope: 'worktree',
        scopeSeed: 'C:/repo-root-must-not-leak',
        maxConcurrent: 1,
        currentRunningCount: 1,
      },
      timeoutSeconds: 120,
      now,
    });
    const queueEntries = [
      enqueueRuntimeJob({ plan, priority: 20, enqueueOrder: 2, now }),
      enqueueRuntimeJob({ plan, priority: 10, enqueueOrder: 1, now }),
    ].sort((left, right) => left.priority - right.priority || left.enqueueOrder - right.enqueueOrder);
    const lease = createRuntimeLease({
      queueEntry: queueEntries[0],
      workerId: 'worker raw id',
      leaseSecret: 'raw lease secret',
      leaseSeconds: 45,
      now,
    });
    const lock = createRuntimeLock('worktree:C:/repo-root-must-not-leak', {
      jobId: plan.id,
      leaseId: lease.id,
      now,
    });
    const checkpoint = createRuntimeCheckpoint({
      jobRunId: 'runtime_job_run_raw_id',
      stepId: 'external-agent',
      nextStepId: 'review',
      completedStepCount: 3,
      now,
    });
    const run = createRuntimeJobRun({
      plan,
      queueEntry: queueEntries[0],
      lease,
      checkpoint,
      status: 'running',
      attemptNumber: 2,
      now,
    });
    const serialized = JSON.stringify([plan, queueEntries, lease, lock, checkpoint, run]);

    expect(queueEntries.map((entry) => entry.enqueueOrder)).toEqual([1, 2]);
    expect(plan.retryPolicy).toMatchObject({
      maxAttempts: 5,
      attemptCount: 2,
      backoffStrategy: 'exponential',
      backoffSeconds: 45,
    });
    expect(plan.concurrencyPolicy.currentRunningCount).toBe(1);
    expect(lease.expiresAt).toBe('2026-05-07T01:00:45.000Z');
    expect(lease.rawTokenStored).toBe(false);
    expect(lock.status).toBe('held');
    expect(lock.rawKeyStored).toBe(false);
    expect(checkpoint.resumable).toBe(true);
    expect(checkpoint.rawStateStored).toBe(false);
    expect(run.processBoundaryInvoked).toBe(false);
    expect(run.externalProcessStarted).toBe(false);
    expect(run.networkBoundaryInvoked).toBe(false);
    expect(serialized).not.toContain('C:/repo-root-must-not-leak');
    expect(serialized).not.toContain('raw lease secret');
    expect(serialized).not.toContain('worker raw id');
  });
});

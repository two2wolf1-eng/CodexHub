import { describe, expect, it } from 'vitest';
import {
  CodexAppServerApprovalBridgeRecordSchema,
  CodexAppServerEventSummarySchema,
  CodexClientSchedulingProjectionSchema,
  CodexTaskRunSchema,
  QuotaSnapshotSchema,
  SchemaVersionSchema,
} from '@codexhub/contracts';
import { diagnoseCodexTask } from './index';

const schemaVersion = SchemaVersionSchema.value;
const observedAt = '2026-05-08T00:00:00.000Z';

describe('diagnosis-kernel', () => {
  it('recognizes completed tasks from terminal event metadata', () => {
    const result = diagnoseCodexTask({
      taskRun: taskRunFixture({ status: 'running' }),
      eventSummaries: [
        CodexAppServerEventSummarySchema.parse({
          id: 'codex_app_server_event_completed',
          schemaVersion,
          observedAt,
          appServerSessionId: 'codex_app_server_session_diagnosis',
          method: 'turn/completed',
          eventHash: 'sha256:event-completed',
          status: 'completed',
          sequenceNumber: 1,
          terminal: true,
          summary: 'Terminal completion event.',
        }),
      ],
      observedAt,
    });

    expect(result.diagnosis.diagnosisKind).toBe('completed');
    expect(result.diagnosis.status).toBe('healthy');
    expect(result.diagnosis.recommendedRecoveryKind).toBe('none');
  });

  it('diagnoses quota depletion', () => {
    const result = diagnoseCodexTask({
      taskRun: taskRunFixture({ status: 'blocked' }),
      quotaSnapshot: QuotaSnapshotSchema.parse({
        id: 'quota_snapshot_depleted',
        schemaVersion,
        observedAt,
        subjectKind: 'codex-account',
        subjectHash: 'sha256:account',
        status: 'exhausted',
        remainingCount: 0,
        summary: 'Quota depleted.',
      }),
      observedAt,
    });

    expect(result.diagnosis.diagnosisKind).toBe('failed_quota');
    expect(result.diagnosis.recommendedRecoveryKind).toBe('wait_for_quota');
  });

  it('diagnoses auth failures from client projection metadata', () => {
    const result = diagnoseCodexTask({
      taskRun: taskRunFixture({ status: 'blocked' }),
      clientProjection: clientProjectionFixture('codex_logged_out'),
      observedAt,
    });

    expect(result.diagnosis.diagnosisKind).toBe('failed_auth');
    expect(result.diagnosis.recommendedRecoveryKind).toBe('login_recover');
  });

  it('diagnoses waiting approval from bridge metadata', () => {
    const result = diagnoseCodexTask({
      taskRun: taskRunFixture({ approvalStatus: 'waiting', status: 'needs_human' }),
      approvalBridgeRecords: [
        CodexAppServerApprovalBridgeRecordSchema.parse({
          id: 'codex_app_server_approval_waiting',
          schemaVersion,
          createdAt: observedAt,
          appServerSessionId: 'codex_app_server_session_diagnosis',
          threadIdHash: 'sha256:thread',
          turnIdHash: 'sha256:turn',
          requestIdHash: 'sha256:request',
          approvalKind: 'command-execution',
          status: 'pending',
          proposalHash: 'sha256:proposal',
          availableDecisionCount: 1,
          availableDecisionHashes: ['sha256:deny'],
          summary: 'Approval bridge pending.',
        }),
      ],
      observedAt,
    });

    expect(result.diagnosis.diagnosisKind).toBe('waiting_approval');
    expect(result.diagnosis.recommendedRecoveryKind).toBe('manual_review');
  });

  it('diagnoses model stalled, tool stuck, and desktop frozen states', () => {
    expect(
      diagnoseCodexTask({
        taskRun: taskRunFixture({ status: 'running', eventStreamStatus: 'stalled' }),
        observedAt,
      }).diagnosis.diagnosisKind,
    ).toBe('model_stalled');
    expect(
      diagnoseCodexTask({
        taskRun: taskRunFixture({ status: 'failed' }),
        observedAt,
      }).diagnosis.diagnosisKind,
    ).toBe('tool_stuck');
    expect(
      diagnoseCodexTask({
        taskRun: taskRunFixture({ status: 'blocked' }),
        clientProjection: clientProjectionFixture('desktop_ui_frozen'),
        observedAt,
      }).diagnosis.diagnosisKind,
    ).toBe('desktop_ui_frozen');
  });

  it('keeps public diagnosis output metadata-only', () => {
    const privateText = 'private prompt body';
    const result = diagnoseCodexTask({
      taskRun: taskRunFixture({ status: 'failed' }),
      observedAt,
      evidenceRefIds: ['evidence_metadata'],
      auditEventIds: ['audit_metadata'],
    });
    const serialized = JSON.stringify(result);

    expect(result.metadataOnly).toBe(true);
    expect(result.rawPromptStored).toBe(false);
    expect(result.rawDiffStored).toBe(false);
    expect(result.rawPathStored).toBe(false);
    expect(result.rawBodyStored).toBe(false);
    expect(serialized).not.toContain(privateText);
  });
});

function taskRunFixture(overrides: Partial<ReturnType<typeof CodexTaskRunSchema.parse>> = {}) {
  return CodexTaskRunSchema.parse({
    id: 'codex_task_run_diagnosis',
    schemaVersion,
    createdAt: observedAt,
    intentId: 'codex_task_intent_diagnosis',
    status: 'running',
    dispatchMode: 'live_app_server',
    preflightStatus: 'ready',
    approvalStatus: 'approved',
    eventStreamStatus: 'listening',
    dispatchAllowed: true,
    liveExecution: false,
    evidenceRefIds: ['evidence_task_run'],
    auditEventIds: ['audit_task_run'],
    summary: 'Task run fixture.',
    ...overrides,
  });
}

function clientProjectionFixture(
  schedulingStatus: 'codex_logged_out' | 'desktop_ui_frozen' | 'app_server_unresponsive',
) {
  return CodexClientSchedulingProjectionSchema.parse({
    id: `codex_client_projection_${schedulingStatus}`,
    schemaVersion,
    observedAt,
    clientInstanceId: `codex_client_${schedulingStatus}`,
    clientHash: `sha256:${schedulingStatus}`,
    schedulingStatus,
    score: 0,
    activeLeaseCount: 0,
    blockReasons: [schedulingStatus],
    summary: `Client projection ${schedulingStatus}.`,
  });
}

import { describe, expect, it } from 'vitest';
import {
  CodexTaskDiagnosisSchema,
  CodexTaskRunSchema,
  SchemaVersionSchema,
  type CodexRecoveryKind,
} from '@codexhub/contracts';
import { isHighRiskRecoveryKind, planCodexTaskRecovery } from './index';

const schemaVersion = SchemaVersionSchema.value;
const createdAt = '2026-05-08T00:00:00.000Z';

describe('recovery-kernel', () => {
  it('plans low-risk wait recovery as dry-run metadata only', () => {
    const result = planCodexTaskRecovery({
      taskRun: taskRunFixture(),
      diagnosis: diagnosisFixture('failed_quota', 'wait_for_quota'),
      createdAt,
    });

    expect(result.recoveryRun.recoveryKind).toBe('wait_for_quota');
    expect(result.highRisk).toBe(false);
    expect(result.approvalRequired).toBe(false);
    expect(result.recoveryRun.approvalStatus).toBe('not_required');
    expect(result.dryRunOnly).toBe(true);
    expect(result.liveActionAllowed).toBe(false);
    expect(result.executionDisabled).toBe(true);
  });

  it('requires approval metadata for high-risk recovery plans', () => {
    for (const recoveryKind of highRiskKindsUnderTest) {
      const result = planCodexTaskRecovery({
        taskRun: taskRunFixture({ id: `codex_task_run_${recoveryKind}` }),
        diagnosis: diagnosisFixture('failed_auth', recoveryKind),
        requestedRecoveryKind: recoveryKind,
        createdAt,
      });

      expect(isHighRiskRecoveryKind(recoveryKind)).toBe(true);
      expect(result.highRisk).toBe(true);
      expect(result.approvalRequired).toBe(true);
      expect(result.recoveryRun.status).toBe('needs_human');
      expect(result.recoveryRun.approvalStatus).toBe('waiting');
      expect(result.recoveryRun.dryRunId).toMatch(/^codex_recovery_dry_run_/);
      expect(result.recoveryRun.executionDisabled).toBe(true);
      expect(result.recoveryRun.liveActionAllowed).toBe(false);
    }
  });

  it('keeps recovery output metadata-only and hash-based', () => {
    const privateText = 'private recovery command body';
    const result = planCodexTaskRecovery({
      taskRun: taskRunFixture(),
      diagnosis: diagnosisFixture('tool_stuck', 'interrupt_turn'),
      createdAt,
      evidenceRefIds: ['evidence_recovery'],
      auditEventIds: ['audit_recovery'],
    });
    const serialized = JSON.stringify(result);

    expect(result.planHash).toMatch(/^sha256:/);
    expect(result.recoveryRun.recoveryPlanHash).toBe(result.planHash);
    expect(result.metadataOnly).toBe(true);
    expect(result.rawPromptStored).toBe(false);
    expect(result.rawDiffStored).toBe(false);
    expect(result.rawPathStored).toBe(false);
    expect(result.rawBodyStored).toBe(false);
    expect(serialized).not.toContain(privateText);
  });
});

const highRiskKindsUnderTest: CodexRecoveryKind[] = [
  'login_recover',
  'switch_account',
  'reconnect_app_server',
  'restart_desktop',
  'interrupt_turn',
  'clean_background_terminals',
  'resume',
  'fork',
  'transfer',
];

function taskRunFixture(overrides: Partial<ReturnType<typeof CodexTaskRunSchema.parse>> = {}) {
  return CodexTaskRunSchema.parse({
    id: 'codex_task_run_recovery',
    schemaVersion,
    createdAt,
    intentId: 'codex_task_intent_recovery',
    status: 'failed',
    dispatchMode: 'live_app_server',
    preflightStatus: 'ready',
    approvalStatus: 'approved',
    eventStreamStatus: 'failed',
    dispatchAllowed: true,
    liveExecution: false,
    evidenceRefIds: ['evidence_task_run'],
    auditEventIds: ['audit_task_run'],
    summary: 'Task run recovery fixture.',
    ...overrides,
  });
}

function diagnosisFixture(
  diagnosisKind: ReturnType<typeof CodexTaskDiagnosisSchema.parse>['diagnosisKind'],
  recommendedRecoveryKind: CodexRecoveryKind,
) {
  return CodexTaskDiagnosisSchema.parse({
    id: `codex_task_diagnosis_${diagnosisKind}`,
    schemaVersion,
    observedAt: createdAt,
    taskRunId: 'codex_task_run_recovery',
    diagnosisKind,
    status: diagnosisKind === 'completed' ? 'healthy' : 'actionable',
    confidence: 0.8,
    recommendedRecoveryKind,
    evidenceRefIds: ['evidence_diagnosis'],
    auditEventIds: ['audit_diagnosis'],
    summary: 'Diagnosis recovery fixture.',
  });
}

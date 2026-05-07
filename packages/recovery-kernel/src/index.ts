import { createHash } from 'node:crypto';
import {
  CodexRecoveryRunSchema,
  SchemaVersionSchema,
  foundationId,
  foundationTimestamp,
  type CodexRecoveryKind,
  type CodexRecoveryRun,
  type CodexTaskDiagnosis,
  type CodexTaskRun,
  type RiskLevel,
} from '@codexhub/contracts';

export interface CodexRecoveryPlanInput {
  taskRun: CodexTaskRun;
  diagnosis: CodexTaskDiagnosis;
  requestedRecoveryKind?: CodexRecoveryKind;
  dryRunId?: string;
  createdAt?: string;
  evidenceRefIds?: readonly string[];
  auditEventIds?: readonly string[];
}

export interface CodexRecoveryPlanResult {
  recoveryRun: CodexRecoveryRun;
  actionKinds: CodexRecoveryKind[];
  planHash: string;
  actionCount: number;
  highRisk: boolean;
  approvalRequired: boolean;
  dryRunOnly: true;
  liveActionAllowed: false;
  executionDisabled: true;
  metadataOnly: true;
  rawPromptStored: false;
  rawDiffStored: false;
  rawPathStored: false;
  rawBodyStored: false;
  summary: string;
}

const highRiskRecoveryKinds = new Set<CodexRecoveryKind>([
  'login_recover',
  'switch_account',
  'switch_client',
  'reconnect_app_server',
  'restart_client',
  'restart_desktop',
  'interrupt_turn',
  'clean_background_terminals',
  'resume_thread',
  'resume',
  'fork',
  'transfer',
]);

export function isHighRiskRecoveryKind(kind: CodexRecoveryKind): boolean {
  return highRiskRecoveryKinds.has(kind);
}

export function planCodexTaskRecovery(input: CodexRecoveryPlanInput): CodexRecoveryPlanResult {
  const createdAt = input.createdAt ?? foundationTimestamp();
  const recoveryKind = input.requestedRecoveryKind ?? input.diagnosis.recommendedRecoveryKind ?? 'manual_review';
  const highRisk = isHighRiskRecoveryKind(recoveryKind);
  const approvalRequired = highRisk || recoveryKind === 'manual_review';
  const dryRunId = input.dryRunId ?? foundationId('codex_recovery_dry_run');
  const actionKinds = recoveryKind === 'none' ? [] : [recoveryKind];
  const planHash = hashRecoveryMetadata({
    taskRunId: input.taskRun.id,
    diagnosisKind: input.diagnosis.diagnosisKind,
    recoveryKind,
    actionCount: actionKinds.length,
    highRisk,
  });
  const recoveryRun = CodexRecoveryRunSchema.parse({
    id: foundationId('codex_recovery_run'),
    schemaVersion: SchemaVersionSchema.value,
    createdAt,
    taskRunId: input.taskRun.id,
    diagnosisId: input.diagnosis.id,
    recoveryKind,
    status: approvalRequired ? 'needs_human' : 'planned',
    recoveryPlanHash: planHash,
    recoveryPlanSummaryHash: hashRecoveryMetadata({
      recoveryKind,
      riskLevel: riskLevelForRecovery(recoveryKind),
      approvalRequired,
    }),
    actionCount: actionKinds.length,
    riskLevel: riskLevelForRecovery(recoveryKind),
    highRisk,
    dryRunId,
    approvalRequired,
    approvalStatus: approvalRequired ? 'waiting' : 'not_required',
    liveActionRequested: false,
    liveActionAllowed: false,
    executionDisabled: true,
    evidenceRefIds: dedupeStrings([
      ...(input.evidenceRefIds ?? []),
      ...input.taskRun.evidenceRefIds,
      ...input.diagnosis.evidenceRefIds,
    ]),
    auditEventIds: dedupeStrings([
      ...(input.auditEventIds ?? []),
      ...input.taskRun.auditEventIds,
      ...input.diagnosis.auditEventIds,
    ]),
    summary: summaryForRecovery(recoveryKind, approvalRequired),
  });

  return {
    recoveryRun,
    actionKinds,
    planHash,
    actionCount: actionKinds.length,
    highRisk,
    approvalRequired,
    dryRunOnly: true,
    liveActionAllowed: false,
    executionDisabled: true,
    metadataOnly: true,
    rawPromptStored: false,
    rawDiffStored: false,
    rawPathStored: false,
    rawBodyStored: false,
    summary: recoveryRun.summary,
  };
}

function riskLevelForRecovery(kind: CodexRecoveryKind): RiskLevel {
  if (kind === 'none' || kind === 'wait' || kind === 'wait_for_quota') {
    return 'low';
  }

  if (kind === 'manual_review' || kind === 'human_checkpoint') {
    return 'medium';
  }

  return 'high';
}

function summaryForRecovery(kind: CodexRecoveryKind, approvalRequired: boolean): string {
  if (kind === 'none') {
    return 'No recovery action is required for the task.';
  }

  if (approvalRequired) {
    return 'Recovery dry-run is planned and awaits approval before any live action.';
  }

  return 'Low-risk recovery dry-run is planned without live action.';
}

function hashRecoveryMetadata(metadata: Record<string, unknown>): string {
  return `sha256:${createHash('sha256')
    .update(JSON.stringify(metadata))
    .digest('hex')}`;
}

function dedupeStrings(values: readonly string[]): string[] {
  return [...new Set(values.filter((value) => value.length > 0))];
}

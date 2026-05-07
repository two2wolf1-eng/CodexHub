import {
  CodexTaskDiagnosisSchema,
  SchemaVersionSchema,
  foundationId,
  foundationTimestamp,
  type CodexAppServerApprovalBridgeRecord,
  type CodexAppServerEventSummary,
  type CodexAppServerProtocolDriftReport,
  type CodexClientSchedulingProjection,
  type CodexRecoveryKind,
  type CodexTaskDiagnosis,
  type CodexTaskDiagnosisKind,
  type CodexTaskRun,
  type QuotaSnapshot,
} from '@codexhub/contracts';

export interface CodexTaskDiagnosisInput {
  taskRun: CodexTaskRun;
  quotaSnapshot?: QuotaSnapshot;
  clientProjection?: CodexClientSchedulingProjection;
  eventSummaries?: readonly CodexAppServerEventSummary[];
  approvalBridgeRecords?: readonly CodexAppServerApprovalBridgeRecord[];
  protocolDriftReport?: CodexAppServerProtocolDriftReport;
  observedAt?: string;
  evidenceRefIds?: readonly string[];
  auditEventIds?: readonly string[];
}

export interface CodexTaskDiagnosisResult {
  diagnosis: CodexTaskDiagnosis;
  signalCount: number;
  blockedSignalCount: number;
  metadataOnly: true;
  rawPromptStored: false;
  rawDiffStored: false;
  rawPathStored: false;
  rawBodyStored: false;
  liveExecution: false;
  externalProcessStarted: false;
  summary: string;
}

interface DiagnosisDecision {
  diagnosisKind: CodexTaskDiagnosisKind;
  status: CodexTaskDiagnosis['status'];
  confidence: number;
  recommendedRecoveryKind: CodexRecoveryKind;
  summary: string;
}

export function diagnoseCodexTask(input: CodexTaskDiagnosisInput): CodexTaskDiagnosisResult {
  const decision = decideDiagnosis(input);
  const evidenceRefIds = dedupeStrings([
    ...(input.evidenceRefIds ?? []),
    ...input.taskRun.evidenceRefIds,
    ...(input.quotaSnapshot?.evidenceRefIds ?? []),
    ...(input.clientProjection?.evidenceRefIds ?? []),
    ...(input.protocolDriftReport?.evidenceRefIds ?? []),
    ...flatMapRefs(input.eventSummaries, 'evidenceRefIds'),
    ...flatMapRefs(input.approvalBridgeRecords, 'evidenceRefIds'),
  ]);
  const auditEventIds = dedupeStrings([
    ...(input.auditEventIds ?? []),
    ...input.taskRun.auditEventIds,
    ...(input.quotaSnapshot?.auditEventIds ?? []),
    ...(input.clientProjection?.auditEventIds ?? []),
    ...(input.protocolDriftReport?.auditEventIds ?? []),
    ...flatMapRefs(input.eventSummaries, 'auditEventIds'),
    ...flatMapRefs(input.approvalBridgeRecords, 'auditEventIds'),
  ]);
  const diagnosis = CodexTaskDiagnosisSchema.parse({
    id: foundationId('codex_task_diagnosis'),
    schemaVersion: SchemaVersionSchema.value,
    observedAt: input.observedAt ?? foundationTimestamp(),
    taskRunId: input.taskRun.id,
    diagnosisKind: decision.diagnosisKind,
    status: decision.status,
    confidence: decision.confidence,
    recommendedRecoveryKind: decision.recommendedRecoveryKind,
    evidenceRefIds,
    auditEventIds,
    summary: decision.summary,
  });

  return {
    diagnosis,
    signalCount: countSignals(input),
    blockedSignalCount: countBlockedSignals(input, decision),
    metadataOnly: true,
    rawPromptStored: false,
    rawDiffStored: false,
    rawPathStored: false,
    rawBodyStored: false,
    liveExecution: false,
    externalProcessStarted: false,
    summary: diagnosis.summary,
  };
}

function decideDiagnosis(input: CodexTaskDiagnosisInput): DiagnosisDecision {
  const pendingApproval = input.approvalBridgeRecords?.some((record) => record.status === 'pending');
  const failedEvent = input.eventSummaries?.some((event) => event.status === 'failed');
  const terminalCompletedEvent = input.eventSummaries?.some(
    (event) => event.terminal && event.status === 'completed',
  );

  if (input.taskRun.status === 'completed' || terminalCompletedEvent) {
    return {
      diagnosisKind: 'completed',
      status: 'healthy',
      confidence: 0.95,
      recommendedRecoveryKind: 'none',
      summary: 'Task completed according to task run or terminal event metadata.',
    };
  }

  if (
    input.quotaSnapshot?.status === 'exhausted' ||
    input.quotaSnapshot?.remainingCount === 0 ||
    input.taskRun.preflightStatus === 'canary_blocked'
  ) {
    return {
      diagnosisKind: 'failed_quota',
      status: 'blocked',
      confidence: 0.9,
      recommendedRecoveryKind: 'wait_for_quota',
      summary: 'Task is blocked because quota or canary metadata indicates capacity is not ready.',
    };
  }

  if (
    input.clientProjection?.schedulingStatus === 'codex_logged_out' ||
    input.clientProjection?.schedulingStatus === 'removed'
  ) {
    return {
      diagnosisKind: 'failed_auth',
      status: 'actionable',
      confidence: 0.85,
      recommendedRecoveryKind: 'login_recover',
      summary: 'Task is blocked because account or login metadata is not healthy.',
    };
  }

  if (input.taskRun.approvalStatus === 'waiting' || pendingApproval) {
    return {
      diagnosisKind: 'waiting_approval',
      status: 'actionable',
      confidence: 0.85,
      recommendedRecoveryKind: 'manual_review',
      summary: 'Task is waiting for command, file, or dispatch approval metadata.',
    };
  }

  if (input.clientProjection?.schedulingStatus === 'desktop_ui_frozen') {
    return {
      diagnosisKind: 'desktop_ui_frozen',
      status: 'actionable',
      confidence: 0.8,
      recommendedRecoveryKind: 'restart_desktop',
      summary: 'Task is blocked because desktop health metadata indicates a frozen UI.',
    };
  }

  if (input.clientProjection?.schedulingStatus === 'app_server_unresponsive') {
    return {
      diagnosisKind: 'app_server_unresponsive',
      status: 'actionable',
      confidence: 0.8,
      recommendedRecoveryKind: 'reconnect_app_server',
      summary: 'Task is blocked because App Server metadata is unresponsive.',
    };
  }

  if (input.taskRun.eventStreamStatus === 'stalled') {
    return {
      diagnosisKind: 'model_stalled',
      status: 'actionable',
      confidence: 0.75,
      recommendedRecoveryKind: 'wait',
      summary: 'Task event stream is stalled according to metadata.',
    };
  }

  if (input.taskRun.status === 'failed' || failedEvent) {
    return {
      diagnosisKind: 'tool_stuck',
      status: 'blocked',
      confidence: 0.7,
      recommendedRecoveryKind: 'interrupt_turn',
      summary: 'Task failed or reported failed event metadata before completion.',
    };
  }

  if (
    input.protocolDriftReport?.status === 'incompatible' ||
    input.protocolDriftReport?.status === 'unknown' ||
    input.protocolDriftReport?.liveDispatchBlocked
  ) {
    return {
      diagnosisKind: 'needs_manual_review',
      status: 'blocked',
      confidence: 0.7,
      recommendedRecoveryKind: 'manual_review',
      summary: 'Task needs manual review because protocol drift metadata blocks dispatch.',
    };
  }

  return {
    diagnosisKind: 'unknown',
    status: 'unknown',
    confidence: 0.3,
    recommendedRecoveryKind: 'manual_review',
    summary: 'Task diagnosis is unknown from available metadata.',
  };
}

function countSignals(input: CodexTaskDiagnosisInput): number {
  return [
    input.taskRun,
    input.quotaSnapshot,
    input.clientProjection,
    input.protocolDriftReport,
    ...(input.eventSummaries ?? []),
    ...(input.approvalBridgeRecords ?? []),
  ].filter(Boolean).length;
}

function countBlockedSignals(
  input: CodexTaskDiagnosisInput,
  decision: DiagnosisDecision,
): number {
  return [
    decision.status === 'blocked',
    input.taskRun.status === 'failed' || input.taskRun.status === 'blocked',
    input.quotaSnapshot?.status === 'exhausted',
    input.clientProjection?.blockReasons.length ? true : false,
    input.protocolDriftReport?.liveDispatchBlocked,
  ].filter(Boolean).length;
}

function flatMapRefs<T extends { evidenceRefIds: string[]; auditEventIds: string[] }>(
  records: readonly T[] | undefined,
  key: 'evidenceRefIds' | 'auditEventIds',
): string[] {
  return records?.flatMap((record) => record[key]) ?? [];
}

function dedupeStrings(values: readonly string[]): string[] {
  return [...new Set(values.filter((value) => value.length > 0))];
}

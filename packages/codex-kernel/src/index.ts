import type {
  AgentRun,
  AuditEvent,
  CodexExecApprovalMode,
  CodexExecApprovalArtifact,
  CodexExecApprovalDecisionOutcome,
  CodexExecApprovalRequirement,
  CodexExecApprovalTransitionAction,
  CodexExecApprovalTransitionResult,
  CodexExecAuditDetailView,
  CodexExecAuditQuery,
  CodexExecAuditSearchResult,
  CodexExecCommandPreview,
  CodexExecConfigFile,
  CodexExecConfigLoadResult,
  CodexExecControlPlaneDrilldownView,
  CodexExecControlPlaneReport,
  CodexExecControlPlaneReportExportResult,
  CodexExecControlPlaneReportFormat,
  CodexExecControlPlaneReportQuery,
  CodexExecControlPlaneReportSection,
  CodexExecControlPlaneReportSectionKind,
  CodexExecControlPlaneReportStatus,
  CodexExecControlPlaneReportSummary,
  CodexExecControlPlaneTimeline,
  CodexExecAdrReadinessChecklistItem,
  CodexExecDryRunPlan,
  CodexExecEvidenceDetailView,
  CodexExecEvidenceQuery,
  CodexExecEvidenceSearchResult,
  CodexExecExecutionGateResult,
  CodexExecEventType,
  CodexExecExecutionIntent,
  CodexExecTimelineAuditSummary,
  CodexExecTimelineDetailView,
  CodexExecTimelineEvidenceSummary,
  CodexExecLiveCapabilityState,
  CodexExecLiveConfig,
  CodexExecItemType,
  CodexExecLiveExecutionDisabledError,
  CodexExecLiveExecutionStatus,
  CodexExecLiveRunRecord,
  CodexExecManualApprovalDecision,
  CodexExecManualApprovalRecord,
  CodexExecManualApprovalRequest,
  CodexExecManualApprovalState,
  CodexExecNormalizedEvent,
  CodexExecNormalizedItem,
  CodexExecPolicyInput,
  CodexExecPreflightCheck,
  CodexExecPreflightResult,
  CodexExecReplayResult,
  CodexExecGovernanceBlocker,
  CodexExecGovernanceReviewPackage,
  CodexExecGovernanceReviewPackageQuery,
  CodexExecGovernanceReviewPackageSection,
  CodexExecGovernanceReviewPackageStatus,
  CodexExecGovernanceReviewPackageSummary,
  CodexExecNoLiveEvidenceSummary,
  CodexExecLiveAdapterAdrDraft,
  CodexExecLiveAdapterAdrDraftExportResult,
  CodexExecLiveAdapterAdrDraftFormat,
  CodexExecLiveAdapterAdrDraftQuery,
  CodexExecLiveAdapterAdrDraftSection,
  CodexExecLiveAdapterAdrDraftSectionKind,
  CodexExecLiveAdapterAdrDraftStatus,
  CodexExecLiveAdapterAdrDraftSummary,
  CodexExecReportRecommendation,
  CodexExecReportReviewComparison,
  CodexExecReportReviewComparisonItem,
  CodexExecReportReviewChecklistItem,
  CodexExecReportReviewFinding,
  CodexExecReportReviewHistoryQuery,
  CodexExecReportReviewHistoryView,
  CodexExecReportReviewQuery,
  CodexExecReportReviewRecord,
  CodexExecReportReviewStatus,
  CodexExecReportReviewSummary,
  CodexExecReportRiskClassification,
  CodexExecReviewerHandoffSummary,
  CodexExecSandboxMode,
  CodexExecTimelineFilter,
  CodexExecTimelineEvent,
  CodexExecTimelineStatus,
  CodexExecWorktreeRequirement,
  CodexReplayRecord,
  CodexReplaySummary,
  EvidenceRef,
  PolicyDecision,
  RiskLevel,
} from '@codexhub/contracts';
import {
  CodexExecLiveConfigSchema,
  SchemaVersionSchema,
  foundationId,
  foundationTimestamp,
} from '@codexhub/contracts';
import {
  MetadataOnlyEvidenceCollector,
  createEvidenceRef,
  hashText,
} from '@codexhub/evidence-kernel';

type JsonRecord = Record<string, unknown>;

export interface CodexExecEvent {
  id: string;
  observedAt: string;
  kind: 'codex.exec.event';
  summary: string;
  metadata?: Record<string, unknown>;
}

export interface CodexAppServerEvent {
  id: string;
  observedAt: string;
  kind: 'codex.app_server.event';
  summary: string;
  metadata?: Record<string, unknown>;
}

export interface AgentRunEvent {
  id: string;
  observedAt: string;
  agentRunId: string;
  summary: string;
  metadata?: Record<string, unknown>;
}

export interface CodexRunRequest {
  prompt: string;
  dryRun: true;
  metadata?: Record<string, unknown>;
}

export interface CodexRunResult {
  agentRun: AgentRun;
  events: AgentRunEvent[];
  evidenceRefs: EvidenceRef[];
}

export interface CodexRunner {
  dryRun(request: CodexRunRequest): Promise<CodexRunResult>;
}

export interface CodexExecExecutionIntentInput {
  title: string;
  prompt: string;
  cwd?: string;
  sandboxMode?: CodexExecSandboxMode;
  approvalMode?: CodexExecApprovalMode;
  liveAdapterEnabled?: boolean;
  metadata?: Record<string, unknown>;
}

export interface CodexExecPolicyEngine {
  evaluateAction(input: {
    actionId: string;
    actionType: string;
    actionMode: 'read' | 'write';
    riskLevel?: RiskLevel;
    dryRun?: boolean;
    approvalGranted?: boolean;
    metadata?: Record<string, unknown>;
  }): PolicyDecision;
}

export interface CodexExecPreflightOptions {
  isolatedWorktreePresent?: boolean;
  worktreePath?: string;
}

export interface CodexExecConfigFileInput {
  configPath: string;
  fileText: string;
  metadata?: Record<string, unknown>;
}

export interface CodexExecManualApprovalRequestInput {
  requestedBy?: string;
  reason?: string;
  expiresAt?: string;
}

export interface CodexExecManualApprovalDecisionInput {
  outcome: CodexExecApprovalDecisionOutcome;
  decidedBy?: string;
  reason?: string;
}

export interface CodexExecApprovalStateOptions {
  now?: string;
}

export interface CodexExecParsedJsonlLine {
  lineNumber: number;
  skipped: boolean;
  rawEvent?: JsonRecord;
  parseErrorEvent?: CodexExecNormalizedEvent;
}

export type CodexExecReplaySummary = CodexReplaySummary;

const knownEventTypes = new Set<CodexExecEventType>([
  'thread.started',
  'turn.started',
  'turn.completed',
  'turn.failed',
  'item.started',
  'item.updated',
  'item.completed',
  'item.failed',
  'error',
]);
const knownItemTypes = new Set<CodexExecItemType>([
  'command_execution',
  'agent_message',
  'reasoning',
  'file_change',
  'mcp_tool_call',
  'web_search',
  'plan_update',
  'unknown',
]);
const hiddenFieldNames = [
  ['to', 'ken'].join(''),
  ['coo', 'kie'].join(''),
  ['sess', 'ion'].join(''),
  ['m', 'fa'].join(''),
  'secret',
  'password',
];

export function parseCodexExecJsonlLine(line: string, lineNumber = 1): CodexExecParsedJsonlLine {
  if (line.trim().length === 0) {
    return { lineNumber, skipped: true };
  }

  try {
    const parsed = JSON.parse(line) as unknown;

    if (!isRecord(parsed)) {
      return {
        lineNumber,
        skipped: false,
        parseErrorEvent: createParseErrorEvent(line, lineNumber, 'JSONL line is not an object'),
      };
    }

    return { lineNumber, skipped: false, rawEvent: parsed };
  } catch (error) {
    return {
      lineNumber,
      skipped: false,
      parseErrorEvent: createParseErrorEvent(
        line,
        lineNumber,
        error instanceof Error ? error.message : 'malformed JSON',
      ),
    };
  }
}

export function parseCodexExecJsonl(text: string): CodexExecParsedJsonlLine[] {
  return text
    .split(/\r?\n/)
    .map((line, index) => parseCodexExecJsonlLine(line, index + 1))
    .filter((result) => !result.skipped);
}

export function normalizeCodexExecEvent(
  rawEvent: JsonRecord,
  options: { lineNumber?: number } = {},
): CodexExecNormalizedEvent {
  const rawEventType = getString(rawEvent, ['type']) ?? 'unknown';
  const normalizedType = normalizeEventType(rawEventType);
  const itemRecord = getRecord(rawEvent, ['item']) ?? getRecord(rawEvent, ['payload']);
  const item = normalizedType.startsWith('item.')
    ? normalizeCodexExecItem(itemRecord ?? rawEvent)
    : undefined;
  const threadId = getString(rawEvent, ['thread_id', 'threadId']);
  const turnId = getString(rawEvent, ['turn_id', 'turnId']);
  const itemId = item?.itemId ?? getString(rawEvent, ['item_id', 'itemId']);
  const status = getString(rawEvent, ['status']);
  const payloadSummary = summarizePayload(rawEvent);
  const summary = createEventSummary(rawEventType, normalizedType, item, rawEvent);

  return {
    id: foundationId('codex_event'),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: foundationTimestamp(),
    rawEventType,
    normalizedType,
    threadId,
    turnId,
    itemId,
    itemType: item?.itemType,
    status,
    summary,
    payloadHash: payloadSummary.contentHash,
    payloadLength: payloadSummary.contentLength,
    item,
    safe: true,
    metadata: {
      mockOnly: true,
      liveExecution: false,
      externalProcessStarted: false,
      lineNumber: options.lineNumber,
    },
  };
}

export async function replayCodexExecFixture(fixtureText: string): Promise<CodexExecReplayResult> {
  const parsedLines = parseCodexExecJsonl(fixtureText);
  const events = parsedLines.map((line) =>
    line.parseErrorEvent
      ? line.parseErrorEvent
      : normalizeCodexExecEvent(line.rawEvent ?? {}, { lineNumber: line.lineNumber }),
  );
  const threadId = events.find((event) => event.threadId)?.threadId;
  const itemEvents = events.filter((event) => event.item);
  const commandExecutionCount = countItems(itemEvents, 'command_execution');
  const fileChangeCount = countItems(itemEvents, 'file_change');
  const mcpToolCallCount = countItems(itemEvents, 'mcp_tool_call');
  const webSearchCount = countItems(itemEvents, 'web_search');
  const errorCount = events.filter((event) =>
    ['error', 'parse_error', 'turn.failed', 'item.failed'].includes(event.normalizedType),
  ).length;
  const finalStatus =
    errorCount > 0 ? 'failed' : hasCompletedTurn(events) ? 'completed' : 'unknown';
  const partialResult = {
    id: foundationId('codex_replay'),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: foundationTimestamp(),
    threadId,
    events,
    eventCount: events.length,
    itemCount: itemEvents.length,
    commandExecutionCount,
    fileChangeCount,
    mcpToolCallCount,
    webSearchCount,
    errorCount,
    finalStatus,
  } satisfies Omit<CodexExecReplayResult, 'evidenceRefs' | 'auditEvents'>;
  const evidenceRefs = await createReplayEvidenceRefs(partialResult);
  const auditEvents = createReplayAuditEvents(partialResult, evidenceRefs);

  return {
    ...partialResult,
    evidenceRefs,
    auditEvents,
    metadata: {
      mockOnly: true,
      liveExecution: false,
      externalProcessStarted: false,
      source: 'fixture-replay',
    },
  };
}

export function summarizeCodexExecReplay(
  result: CodexExecReplayResult,
  fixturePath = 'unknown-fixture',
): CodexReplaySummary {
  const replayHash = createReplayHash(result, fixturePath);

  return {
    id: result.id,
    schemaVersion: result.schemaVersion,
    createdAt: result.createdAt,
    sourceKind: 'fixture',
    fixturePath,
    threadId: result.threadId,
    status: result.finalStatus,
    summary: `Fixture replay ${result.finalStatus}: ${result.eventCount} events, ${result.errorCount} errors`,
    replayHash,
    eventCount: result.eventCount,
    itemCount: result.itemCount,
    commandExecutionCount: result.commandExecutionCount,
    fileChangeCount: result.fileChangeCount,
    mcpToolCallCount: result.mcpToolCallCount,
    webSearchCount: result.webSearchCount,
    errorCount: result.errorCount,
    evidenceCount: result.evidenceRefs.length,
    auditEventCount: result.auditEvents.length,
    mockOnly: true,
    liveExecution: false,
    externalProcessStarted: false,
    metadata: { source: 'codex-kernel.fixture-replay' },
  };
}

export function createCodexReplayRecord(
  result: CodexExecReplayResult,
  fixturePath: string,
): CodexReplayRecord {
  const replayHash = createReplayHash(result, fixturePath);

  return {
    id: result.id,
    schemaVersion: result.schemaVersion,
    createdAt: result.createdAt,
    sourceKind: 'fixture',
    fixturePath,
    threadId: result.threadId,
    status: result.finalStatus,
    summary: `Fixture replay ${result.finalStatus}: ${result.eventCount} events, ${result.errorCount} errors`,
    replayHash,
    eventCount: result.eventCount,
    itemCount: result.itemCount,
    commandExecutionCount: result.commandExecutionCount,
    fileChangeCount: result.fileChangeCount,
    mcpToolCallCount: result.mcpToolCallCount,
    webSearchCount: result.webSearchCount,
    errorCount: result.errorCount,
    mockOnly: true,
    liveExecution: false,
    externalProcessStarted: false,
    evidenceRefs: result.evidenceRefs,
    auditEventIds: result.auditEvents.map((event) => event.id),
    storageMetadata: {
      sourceKind: 'fixture',
      fixturePath,
      fixturePathHash: prefixedHash(fixturePath),
      replayHash,
      bodyStored: false,
      normalizedEventsStored: false,
      eventHashCount: result.events.length,
      mockOnly: true,
      liveExecution: false,
      externalProcessStarted: false,
    },
    metadata: { source: 'codex-kernel.fixture-replay' },
  };
}

export function createCodexExecExecutionIntent(
  input: CodexExecExecutionIntentInput,
): CodexExecExecutionIntent {
  const promptSummary = `Prompt for ${summarizeText(input.title, 80)} (${input.prompt.length} chars)`;

  return {
    id: foundationId('codex_intent'),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: foundationTimestamp(),
    title: input.title,
    cwd: input.cwd ?? '.',
    sandboxMode: input.sandboxMode ?? 'read_only',
    approvalMode: input.approvalMode ?? 'required',
    promptSummary,
    promptHash: prefixedHash(input.prompt),
    promptLength: input.prompt.length,
    promptBodyStored: false,
    liveAdapterEnabled: input.liveAdapterEnabled ?? false,
    liveExecution: false,
    externalProcessStarted: false,
    executionDisabled: true,
    metadata: {
      ...(input.metadata ?? {}),
      guardedPromptMatch: hasGuardedPromptMatch(input.prompt),
      source: 'codex-kernel.control-plane',
    },
  };
}

export function createCodexExecDryRunPlan(intent: CodexExecExecutionIntent): CodexExecDryRunPlan {
  const riskLevel = riskForSandboxMode(intent.sandboxMode);

  return {
    id: foundationId('codex_dry_run'),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: foundationTimestamp(),
    intentId: intent.id,
    intent,
    title: intent.title,
    cwd: intent.cwd,
    sandboxMode: intent.sandboxMode,
    approvalMode: intent.approvalMode,
    riskLevel,
    promptSummary: intent.promptSummary,
    promptHash: intent.promptHash,
    promptLength: intent.promptLength,
    promptBodyStored: false,
    liveAdapterEnabled: intent.liveAdapterEnabled,
    liveExecution: false,
    externalProcessStarted: false,
    executionDisabled: true,
    summary: `Dry-run control plan for ${intent.title} (${intent.sandboxMode}, ${riskLevel} risk)`,
    metadata: {
      guardedPromptMatch: intent.metadata?.guardedPromptMatch === true,
      source: 'codex-kernel.control-plane',
    },
  };
}

export function createCodexExecCommandPreview(plan: CodexExecDryRunPlan): CodexExecCommandPreview {
  const previewSummary = `Disabled preview for ${plan.title}: arguments summarized only; external process disabled.`;
  const argumentSummary = [
    `cwd=${plan.cwd}`,
    `sandbox=${plan.sandboxMode}`,
    `approval=${plan.approvalMode}`,
    `promptHash=${plan.promptHash}`,
  ].join('; ');

  return {
    id: foundationId('codex_preview'),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: foundationTimestamp(),
    intentId: plan.intentId,
    dryRunPlanId: plan.id,
    cwd: plan.cwd,
    sandboxMode: plan.sandboxMode,
    approvalMode: plan.approvalMode,
    previewSummary,
    binaryName: 'codex',
    argumentSummary,
    previewHash: prefixedHash(stableStringify({ previewSummary, argumentSummary })),
    redacted: true,
    liveExecution: false,
    externalProcessStarted: false,
    executionDisabled: true,
    metadata: { source: 'codex-kernel.control-plane' },
  };
}

export function evaluateCodexExecDryRunPolicy(
  plan: CodexExecDryRunPlan,
  policyEngine: CodexExecPolicyEngine,
): PolicyDecision {
  const policyInput = createCodexExecPolicyInput(plan);

  return policyEngine.evaluateAction({
    actionId: plan.id,
    actionType: policyInput.actionType,
    actionMode: policyInput.actionMode,
    riskLevel: policyInput.riskLevel,
    dryRun: policyInput.dryRunPlanPresent,
    approvalGranted: false,
    metadata: {
      policyInputId: policyInput.id,
      sandboxMode: policyInput.sandboxMode,
      approvalMode: policyInput.approvalMode,
      dryRunPlanPresent: policyInput.dryRunPlanPresent,
      liveAdapterEnabled: policyInput.liveAdapterEnabled,
      guardedPromptMatch: policyInput.guardedPromptMatch,
      liveExecution: false,
      externalProcessStarted: false,
      executionDisabled: true,
    },
  });
}

export function createCodexExecApprovalRequirement(
  plan: CodexExecDryRunPlan,
  policyDecision: PolicyDecision,
): CodexExecApprovalRequirement {
  const required =
    policyDecision.outcome === 'approval_required' ||
    plan.approvalMode === 'required' ||
    plan.riskLevel === 'high' ||
    plan.riskLevel === 'critical';
  const status = statusForPolicyDecision(plan, policyDecision);

  return {
    id: foundationId('codex_approval'),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: foundationTimestamp(),
    dryRunPlanId: plan.id,
    policyDecisionId: policyDecision.id,
    required,
    riskLevel: plan.riskLevel,
    approvalMode: plan.approvalMode,
    status,
    reason: required
      ? `${plan.riskLevel} risk and ${plan.approvalMode} approval mode require review`
      : 'approval is not required for this disabled dry-run plan',
    metadata: {
      liveExecution: false,
      externalProcessStarted: false,
      executionDisabled: true,
    },
  };
}

export function createCodexExecDisabledLiveRunRecord(
  plan: CodexExecDryRunPlan,
  policyDecision: PolicyDecision,
  reason: string,
): CodexExecLiveRunRecord {
  const commandPreview = createCodexExecCommandPreview(plan);
  const approvalRequirement = createCodexExecApprovalRequirement(plan, policyDecision);
  const evidenceRefs = createCodexExecDryRunEvidenceRefs(plan, commandPreview, policyDecision);
  const disabledError = createCodexExecDisabledError(reason);
  const auditEvents = createCodexExecDryRunAuditEvents(
    plan,
    policyDecision,
    evidenceRefs,
    disabledError,
  );

  return {
    id: foundationId('codex_live_run'),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: foundationTimestamp(),
    intentId: plan.intentId,
    dryRunPlanId: plan.id,
    title: plan.title,
    cwd: plan.cwd,
    sandboxMode: plan.sandboxMode,
    approvalMode: plan.approvalMode,
    riskLevel: plan.riskLevel,
    status: statusForPolicyDecision(plan, policyDecision),
    intent: plan.intent,
    dryRunPlan: plan,
    commandPreview,
    policyDecision,
    approvalRequirement,
    disabledError,
    evidenceRefs,
    auditEvents,
    promptSummary: plan.promptSummary,
    promptHash: plan.promptHash,
    promptLength: plan.promptLength,
    promptBodyStored: false,
    liveExecution: false,
    externalProcessStarted: false,
    executionDisabled: true,
    metadata: {
      liveExecution: false,
      externalProcessStarted: false,
      executionDisabled: true,
      source: 'codex-kernel.control-plane',
    },
  };
}

export function createCodexExecControlPlaneTimeline(input: {
  record: CodexExecLiveRunRecord;
  approvalRecords?: CodexExecManualApprovalRecord[];
  filter?: CodexExecTimelineFilter;
}): CodexExecControlPlaneTimeline {
  const record = input.record;
  const approvalRecords = dedupeApprovalRecords([
    ...(record.manualApprovalRecord ? [record.manualApprovalRecord] : []),
    ...(input.approvalRecords ?? []),
  ]);
  const events: CodexExecTimelineEvent[] = [];

  if (record.configLoadResult) {
    events.push(
      createTimelineEvent(record, {
        eventType: 'codex.exec.config.loaded',
        sourceKind: 'config',
        sourceId: record.configLoadResult.id,
        status: record.configLoadResult.status,
        summary: record.configLoadResult.summary,
        occurredAt: record.configLoadResult.createdAt,
        order: 10,
      }),
    );
  }

  events.push(
    createTimelineEvent(record, {
      eventType: 'codex.exec.dry_run.created',
      sourceKind: 'dry_run',
      sourceId: record.dryRunPlan.id,
      status: record.dryRunPlan.riskLevel,
      summary: record.dryRunPlan.summary,
      occurredAt: record.dryRunPlan.createdAt,
      order: 20,
      metadata: { riskLevel: record.dryRunPlan.riskLevel },
    }),
    createTimelineEvent(record, {
      eventType: 'codex.exec.command_preview.created',
      sourceKind: 'command_preview',
      sourceId: record.commandPreview.id,
      status: 'redacted',
      summary: record.commandPreview.previewSummary,
      occurredAt: record.commandPreview.createdAt,
      order: 30,
    }),
    createTimelineEvent(record, {
      eventType: 'codex.exec.policy.evaluated',
      sourceKind: 'policy',
      sourceId: record.policyDecision.id,
      status: record.policyDecision.outcome,
      summary: `Policy ${record.policyDecision.outcome} for ${record.policyDecision.riskLevel} risk`,
      occurredAt: record.policyDecision.createdAt,
      order: 40,
      metadata: { riskLevel: record.policyDecision.riskLevel },
    }),
  );

  if (record.preflightResult) {
    events.push(
      createTimelineEvent(record, {
        eventType: 'codex.exec.preflight.completed',
        sourceKind: 'preflight',
        sourceId: record.preflightResult.id,
        status: record.preflightResult.status,
        summary: record.preflightResult.summary,
        occurredAt: record.preflightResult.createdAt,
        order: 50,
      }),
    );
  }

  for (const approvalRecord of approvalRecords) {
    events.push(
      createTimelineEvent(record, {
        eventType: 'codex.exec.approval.requested',
        sourceKind: 'approval_request',
        sourceId: approvalRecord.request.id,
        status: approvalRecord.request.status,
        summary: approvalRecord.request.summary,
        occurredAt: approvalRecord.request.createdAt,
        order: 60,
        metadata: { riskLevel: approvalRecord.request.riskLevel },
      }),
    );

    if (approvalRecord.decision) {
      events.push(
        createTimelineEvent(record, {
          eventType: 'codex.exec.approval.decided',
          sourceKind: 'approval_decision',
          sourceId: approvalRecord.decision.id,
          status: approvalRecord.decision.outcome,
          summary: approvalRecord.decision.summary,
          occurredAt: approvalRecord.decision.createdAt,
          order: 70,
        }),
      );
    }

    const approvalState =
      approvalRecord.approvalState ?? evaluateCodexExecManualApprovalState(approvalRecord);
    events.push(
      createTimelineEvent(record, {
        eventType: 'codex.exec.approval.state_evaluated',
        sourceKind: 'approval_state',
        sourceId: approvalState.id,
        status: approvalState.status,
        summary: approvalState.summary,
        occurredAt: approvalState.createdAt,
        order: 80,
      }),
    );

    if (approvalRecord.approvalArtifact) {
      events.push(
        createTimelineEvent(record, {
          eventType: 'codex.exec.approval.artifact_available',
          sourceKind: 'approval_artifact',
          sourceId: approvalRecord.approvalArtifact.id,
          status: approvalRecord.approvalArtifact.status,
          summary: approvalRecord.approvalArtifact.summary,
          occurredAt: approvalRecord.approvalArtifact.createdAt,
          order: 90,
        }),
      );
    }
  }

  if (
    record.approvalArtifact &&
    !events.some((event) => event.sourceId === record.approvalArtifact?.id)
  ) {
    events.push(
      createTimelineEvent(record, {
        eventType: 'codex.exec.approval.artifact_available',
        sourceKind: 'approval_artifact',
        sourceId: record.approvalArtifact.id,
        status: record.approvalArtifact.status,
        summary: record.approvalArtifact.summary,
        occurredAt: record.approvalArtifact.createdAt,
        order: 90,
      }),
    );
  }

  if (record.executionGateResult) {
    events.push(
      createTimelineEvent(record, {
        eventType: 'codex.exec.gate.evaluated',
        sourceKind: 'gate',
        sourceId: record.executionGateResult.id,
        status: record.executionGateResult.status,
        summary: record.executionGateResult.summary,
        occurredAt: record.executionGateResult.createdAt,
        order: 100,
      }),
    );
  }

  events.push(
    ...record.evidenceRefs.map((evidenceRef, index) =>
      createTimelineEvent(record, {
        eventType: 'codex.exec.evidence.recorded',
        sourceKind: 'evidence',
        sourceId: evidenceRef.id,
        status: evidenceRef.kind,
        summary: evidenceRef.summary ?? `Evidence ${evidenceRef.kind}`,
        occurredAt: evidenceRef.createdAt,
        order: 200 + index,
      }),
    ),
    ...record.auditEvents.map((auditEvent, index) =>
      createTimelineEvent(record, {
        eventType: 'codex.exec.audit.recorded',
        sourceKind: 'audit',
        sourceId: auditEvent.id,
        status: auditEvent.outcome,
        summary: auditEvent.action,
        occurredAt: auditEvent.createdAt,
        order: 300 + index,
      }),
    ),
  );

  const sortedEvents = applyTimelineFilter(events.sort(compareTimelineEvents), input.filter);
  const status = deriveTimelineStatus(record, approvalRecords);

  return {
    id: foundationId('codex_timeline'),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: foundationTimestamp(),
    dryRunId: record.dryRunPlanId,
    liveRunRecordId: record.id,
    status,
    events: sortedEvents,
    eventCount: sortedEvents.length,
    evidenceCount: record.evidenceRefs.length,
    auditEventCount: record.auditEvents.length,
    summary: `Control-plane timeline ${status}: ${sortedEvents.length} events for ${record.title}`,
    liveExecution: false,
    externalProcessStarted: false,
    executionDisabled: true,
    metadata: createControlPlaneMetadata({
      dryRunPlanId: record.dryRunPlanId,
      liveRunRecordId: record.id,
      approvalRecordCount: approvalRecords.length,
      filterApplied: Boolean(input.filter),
    }),
  };
}

export function createCodexExecTimelineEvidenceSummary(
  record: CodexExecLiveRunRecord,
): CodexExecTimelineEvidenceSummary {
  return {
    id: foundationId('codex_timeline_evidence_summary'),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: foundationTimestamp(),
    dryRunId: record.dryRunPlanId,
    liveRunRecordId: record.id,
    count: record.evidenceRefs.length,
    evidenceRefIds: record.evidenceRefs.map((evidenceRef) => evidenceRef.id),
    items: record.evidenceRefs.map((evidenceRef) => ({
      evidenceRefId: evidenceRef.id,
      kind: evidenceRef.kind,
      summary: evidenceRef.summary,
      hash: evidenceRef.hash,
      labels: evidenceRef.labels,
      createdAt: evidenceRef.createdAt,
    })),
    metadataOnly: true,
    bodyStored: false,
    liveExecution: false,
    externalProcessStarted: false,
    executionDisabled: true,
    metadata: createControlPlaneMetadata({
      dryRunPlanId: record.dryRunPlanId,
      liveRunRecordId: record.id,
    }),
  };
}

export function createCodexExecTimelineAuditSummary(
  record: CodexExecLiveRunRecord,
): CodexExecTimelineAuditSummary {
  return {
    id: foundationId('codex_timeline_audit_summary'),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: foundationTimestamp(),
    dryRunId: record.dryRunPlanId,
    liveRunRecordId: record.id,
    count: record.auditEvents.length,
    auditEventIds: record.auditEvents.map((auditEvent) => auditEvent.id),
    items: record.auditEvents.map((auditEvent) => ({
      auditEventId: auditEvent.id,
      action: auditEvent.action,
      outcome: auditEvent.outcome,
      createdAt: auditEvent.createdAt,
      policyDecisionId: auditEvent.policyDecisionId,
      evidenceRefIds: auditEvent.evidenceRefs.map((evidenceRef) => evidenceRef.id),
    })),
    metadataOnly: true,
    bodyStored: false,
    liveExecution: false,
    externalProcessStarted: false,
    executionDisabled: true,
    metadata: createControlPlaneMetadata({
      dryRunPlanId: record.dryRunPlanId,
      liveRunRecordId: record.id,
    }),
  };
}

export function createCodexExecTimelineDetailView(input: {
  record: CodexExecLiveRunRecord;
  approvalRecords?: CodexExecManualApprovalRecord[];
  filter?: CodexExecTimelineFilter;
}): CodexExecTimelineDetailView {
  const timeline = createCodexExecControlPlaneTimeline(input);
  const latestApprovalState = getLatestApprovalState(input.record, input.approvalRecords ?? []);
  const evidenceSummary = createCodexExecTimelineEvidenceSummary(input.record);
  const auditSummary = createCodexExecTimelineAuditSummary(input.record);

  return {
    id: foundationId('codex_timeline_detail'),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: foundationTimestamp(),
    dryRunId: input.record.dryRunPlanId,
    liveRunRecordId: input.record.id,
    timeline,
    sourceBreakdown: createSourceBreakdown(timeline.events),
    latestGateStatus: input.record.executionGateResult?.status,
    approvalStatus: latestApprovalState?.status,
    dryRunSummary: {
      dryRunPlanId: input.record.dryRunPlan.id,
      title: input.record.dryRunPlan.title,
      sandboxMode: input.record.dryRunPlan.sandboxMode,
      approvalMode: input.record.dryRunPlan.approvalMode,
      riskLevel: input.record.dryRunPlan.riskLevel,
      promptSummary: input.record.dryRunPlan.promptSummary,
      promptHash: input.record.dryRunPlan.promptHash,
      promptLength: input.record.dryRunPlan.promptLength,
      promptBodyStored: false,
    },
    commandPreviewSummary: {
      commandPreviewId: input.record.commandPreview.id,
      previewSummary: input.record.commandPreview.previewSummary,
      previewHash: input.record.commandPreview.previewHash,
      redacted: true,
      argumentSummary: input.record.commandPreview.argumentSummary,
    },
    policySummary: {
      policyDecisionId: input.record.policyDecision.id,
      outcome: input.record.policyDecision.outcome,
      riskLevel: input.record.policyDecision.riskLevel,
      requiresDryRun: input.record.policyDecision.requiresDryRun,
      requiresApproval: input.record.policyDecision.requiresApproval,
      reasonCount: input.record.policyDecision.reasons.length,
    },
    approvalStateSummary: latestApprovalState
      ? {
          approvalRequestId: latestApprovalState.approvalRequestId,
          status: latestApprovalState.status,
          canDecide: latestApprovalState.canDecide,
          terminal: latestApprovalState.terminal,
          reasonCount: latestApprovalState.reasons.length,
        }
      : undefined,
    gateSummary: input.record.executionGateResult
      ? {
          executionGateResultId: input.record.executionGateResult.id,
          status: input.record.executionGateResult.status,
          reasonCount: input.record.executionGateResult.reasons.length,
          liveEnabled: input.record.executionGateResult.liveEnabled,
        }
      : undefined,
    evidenceSummary,
    auditSummary,
    summary: `Read-only timeline detail ${timeline.status}: ${timeline.eventCount} filtered events for ${input.record.title}`,
    liveExecution: false,
    externalProcessStarted: false,
    executionDisabled: true,
    metadata: createControlPlaneMetadata({
      dryRunPlanId: input.record.dryRunPlanId,
      liveRunRecordId: input.record.id,
      filterApplied: Boolean(input.filter),
    }),
  };
}

export function getEvidenceDetail(input: {
  evidenceRefId: string;
  records?: CodexExecLiveRunRecord[];
  evidenceRefs?: EvidenceRef[];
  auditEvents?: AuditEvent[];
}): CodexExecEvidenceDetailView {
  const records = input.records ?? [];
  const evidenceRefs = dedupeEvidenceRefs([
    ...(input.evidenceRefs ?? []),
    ...records.flatMap((record) => record.evidenceRefs),
  ]);
  const evidenceRef = evidenceRefs.find((ref) => ref.id === input.evidenceRefId);
  const record = evidenceRef
    ? records.find((candidate) => candidate.evidenceRefs.some((ref) => ref.id === evidenceRef.id))
    : undefined;

  if (!evidenceRef) {
    return createEvidenceNotFoundDetail(input.evidenceRefId);
  }

  const relatedAuditEvents = dedupeAuditEvents([
    ...(input.auditEvents ?? []),
    ...records.flatMap((candidate) => candidate.auditEvents),
  ]).filter((event) => event.evidenceRefs.some((ref) => ref.id === evidenceRef.id));
  const dryRunId = record?.dryRunPlanId ?? readMetadataString(evidenceRef.metadata, 'dryRunPlanId');
  const liveRunRecordId = record?.id ?? readMetadataString(evidenceRef.metadata, 'liveRunRecordId');

  return {
    id: foundationId('codex_evidence_detail'),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: foundationTimestamp(),
    status: 'found',
    evidenceRefId: evidenceRef.id,
    dryRunId,
    liveRunRecordId,
    kind: evidenceRef.kind,
    summary: evidenceRef.summary,
    hash: evidenceRef.hash,
    labels: evidenceRef.labels,
    refCreatedAt: evidenceRef.createdAt,
    expiresAt: evidenceRef.expiresAt,
    relatedAuditEventIds: relatedAuditEvents.map((event) => event.id),
    metadataSummary: createDetailMetadataSummary(evidenceRef.metadata),
    metadataOnly: true,
    bodyStored: false,
    liveExecution: false,
    externalProcessStarted: false,
    executionDisabled: true,
    metadata: createControlPlaneMetadata({
      dryRunPlanId: dryRunId,
      liveRunRecordId,
      evidenceRefId: evidenceRef.id,
      status: 'found',
    }),
  };
}

export function searchEvidence(input: {
  query?: Partial<CodexExecEvidenceQuery>;
  records?: CodexExecLiveRunRecord[];
  evidenceRefs?: EvidenceRef[];
  auditEvents?: AuditEvent[];
}): CodexExecEvidenceSearchResult {
  const records = input.records ?? [];
  const query = createEvidenceQuery(input.query);
  const evidenceRefs = dedupeEvidenceRefs([
    ...(input.evidenceRefs ?? []),
    ...records.flatMap((record) => record.evidenceRefs),
  ]);
  const matchedRefs = evidenceRefs.filter((ref) => {
    if (query.kind && ref.kind !== query.kind) {
      return false;
    }

    if (query.dryRunId && !evidenceMatchesDryRun(ref, records, query.dryRunId)) {
      return false;
    }

    return true;
  });
  const limitedRefs = matchedRefs.slice(0, query.limit);
  const items = limitedRefs.map((ref) =>
    getEvidenceDetail({
      evidenceRefId: ref.id,
      records,
      evidenceRefs,
      auditEvents: input.auditEvents,
    }),
  );

  return {
    id: foundationId('codex_evidence_search'),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: foundationTimestamp(),
    query,
    count: matchedRefs.length,
    items,
    metadataOnly: true,
    bodyStored: false,
    summary: `Read-only evidence search returned ${matchedRefs.length} refs`,
    liveExecution: false,
    externalProcessStarted: false,
    executionDisabled: true,
    metadata: createControlPlaneMetadata({
      dryRunPlanId: query.dryRunId,
      kind: query.kind,
      limit: query.limit,
    }),
  };
}

export function getAuditDetail(input: {
  auditEventId: string;
  records?: CodexExecLiveRunRecord[];
  auditEvents?: AuditEvent[];
}): CodexExecAuditDetailView {
  const records = input.records ?? [];
  const auditEvents = dedupeAuditEvents([
    ...(input.auditEvents ?? []),
    ...records.flatMap((record) => record.auditEvents),
  ]);
  const auditEvent = auditEvents.find((event) => event.id === input.auditEventId);
  const record = auditEvent
    ? records.find((candidate) => candidate.auditEvents.some((event) => event.id === auditEvent.id))
    : undefined;

  if (!auditEvent) {
    return createAuditNotFoundDetail(input.auditEventId);
  }

  const dryRunId = record?.dryRunPlanId ?? readMetadataString(auditEvent.metadata, 'dryRunPlanId');
  const liveRunRecordId = record?.id ?? readMetadataString(auditEvent.metadata, 'liveRunRecordId');

  return {
    id: foundationId('codex_audit_detail'),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: foundationTimestamp(),
    status: 'found',
    auditEventId: auditEvent.id,
    dryRunId,
    liveRunRecordId,
    action: auditEvent.action,
    outcome: auditEvent.outcome,
    actor: auditEvent.actor,
    eventCreatedAt: auditEvent.createdAt,
    policyDecisionId: auditEvent.policyDecisionId,
    evidenceRefIds: auditEvent.evidenceRefs.map((ref) => ref.id),
    metadataSummary: createDetailMetadataSummary(auditEvent.metadata),
    metadataOnly: true,
    bodyStored: false,
    liveExecution: false,
    externalProcessStarted: false,
    executionDisabled: true,
    metadata: createControlPlaneMetadata({
      dryRunPlanId: dryRunId,
      liveRunRecordId,
      auditEventId: auditEvent.id,
      status: 'found',
    }),
  };
}

export function searchAuditEvents(input: {
  query?: Partial<CodexExecAuditQuery>;
  records?: CodexExecLiveRunRecord[];
  auditEvents?: AuditEvent[];
}): CodexExecAuditSearchResult {
  const records = input.records ?? [];
  const query = createAuditQuery(input.query);
  const auditEvents = dedupeAuditEvents([
    ...(input.auditEvents ?? []),
    ...records.flatMap((record) => record.auditEvents),
  ]);
  const matchedEvents = auditEvents.filter((event) => {
    if (query.action && event.action !== query.action) {
      return false;
    }

    if (query.dryRunId && !auditMatchesDryRun(event, records, query.dryRunId)) {
      return false;
    }

    return true;
  });
  const limitedEvents = matchedEvents.slice(0, query.limit);
  const items = limitedEvents.map((event) =>
    getAuditDetail({
      auditEventId: event.id,
      records,
      auditEvents,
    }),
  );

  return {
    id: foundationId('codex_audit_search'),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: foundationTimestamp(),
    query,
    count: matchedEvents.length,
    items,
    metadataOnly: true,
    bodyStored: false,
    summary: `Read-only audit search returned ${matchedEvents.length} events`,
    liveExecution: false,
    externalProcessStarted: false,
    executionDisabled: true,
    metadata: createControlPlaneMetadata({
      dryRunPlanId: query.dryRunId,
      action: query.action,
      limit: query.limit,
    }),
  };
}

export function buildControlPlaneDrilldownView(input: {
  dryRunId: string;
  records?: CodexExecLiveRunRecord[];
  approvalRecords?: CodexExecManualApprovalRecord[];
  evidenceRefs?: EvidenceRef[];
  auditEvents?: AuditEvent[];
}): CodexExecControlPlaneDrilldownView {
  const record = (input.records ?? []).find(
    (candidate) => candidate.id === input.dryRunId || candidate.dryRunPlanId === input.dryRunId,
  );
  const dryRunId = record?.dryRunPlanId ?? input.dryRunId;
  const evidenceSearch = searchEvidence({
    query: { dryRunId, limit: 50 },
    records: record ? [record] : input.records,
    evidenceRefs: input.evidenceRefs,
    auditEvents: input.auditEvents,
  });
  const auditSearch = searchAuditEvents({
    query: { dryRunId, limit: 50 },
    records: record ? [record] : input.records,
    auditEvents: input.auditEvents,
  });

  if (!record) {
    return {
      id: foundationId('codex_drilldown'),
      schemaVersion: SchemaVersionSchema.value,
      createdAt: foundationTimestamp(),
      dryRunId,
      status: 'not_found',
      evidenceSearch,
      auditSearch,
      evidenceCount: evidenceSearch.count,
      auditEventCount: auditSearch.count,
      metadataOnly: true,
      bodyStored: false,
      summary: `No read-only control-plane drilldown found for ${dryRunId}`,
      liveExecution: false,
      externalProcessStarted: false,
      executionDisabled: true,
      metadata: createControlPlaneMetadata({
        dryRunPlanId: dryRunId,
        status: 'not_found',
      }),
    };
  }

  const approvalRecords = (input.approvalRecords ?? []).filter(
    (approvalRecord) => approvalRecord.request.dryRunPlanId === record.dryRunPlanId,
  );
  const timeline = createCodexExecControlPlaneTimeline({ record, approvalRecords });
  const timelineDetail = createCodexExecTimelineDetailView({ record, approvalRecords });

  return {
    id: foundationId('codex_drilldown'),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: foundationTimestamp(),
    dryRunId: record.dryRunPlanId,
    liveRunRecordId: record.id,
    status: 'found',
    timeline,
    timelineDetail,
    evidenceSearch,
    auditSearch,
    selectedEvidence: evidenceSearch.items[0],
    selectedAudit: auditSearch.items[0],
    evidenceCount: evidenceSearch.count,
    auditEventCount: auditSearch.count,
    metadataOnly: true,
    bodyStored: false,
    summary: `Read-only drilldown ${timeline.status}: ${evidenceSearch.count} evidence refs and ${auditSearch.count} audit events`,
    liveExecution: false,
    externalProcessStarted: false,
    executionDisabled: true,
    metadata: createControlPlaneMetadata({
      dryRunPlanId: record.dryRunPlanId,
      liveRunRecordId: record.id,
      status: 'found',
    }),
  };
}

export interface CodexExecControlPlaneReportInput {
  dryRunId: string;
  record?: CodexExecLiveRunRecord;
  records?: CodexExecLiveRunRecord[];
  approvalRecords?: CodexExecManualApprovalRecord[];
  evidenceRefs?: EvidenceRef[];
  auditEvents?: AuditEvent[];
  format?: CodexExecControlPlaneReportFormat;
  includeEvidence?: boolean;
  includeAudit?: boolean;
  degraded?: boolean;
  reason?: string;
}

const reportSectionOrder: CodexExecControlPlaneReportSectionKind[] = [
  'overview',
  'dry_run',
  'timeline',
  'approval',
  'gate',
  'evidence',
  'audit',
  'no_live_boundary',
  'risks',
  'recommendations',
];

export function buildCodexExecControlPlaneReport(
  input: CodexExecControlPlaneReportInput,
): CodexExecControlPlaneReport {
  const format = input.format ?? 'json';
  const includeEvidence = input.includeEvidence ?? true;
  const includeAudit = input.includeAudit ?? true;
  const records = input.record ? [input.record] : (input.records ?? []);
  const record =
    input.record ??
    records.find(
      (candidate) => candidate.id === input.dryRunId || candidate.dryRunPlanId === input.dryRunId,
    );
  const dryRunId = record?.dryRunPlanId ?? input.dryRunId;
  const approvalRecords = (input.approvalRecords ?? []).filter(
    (approvalRecord) => approvalRecord.request.dryRunPlanId === dryRunId,
  );
  const drilldown = buildControlPlaneDrilldownView({
    dryRunId,
    records: record ? [record] : records,
    approvalRecords,
    evidenceRefs: input.evidenceRefs,
    auditEvents: input.auditEvents,
  });
  const status: CodexExecControlPlaneReportStatus = record ? 'found' : 'not_found';
  const query: CodexExecControlPlaneReportQuery = {
    id: foundationId('codex_report_query'),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: foundationTimestamp(),
    dryRunId,
    format,
    includeEvidence,
    includeAudit,
    liveExecution: false,
    externalProcessStarted: false,
    executionDisabled: true,
    metadata: createControlPlaneMetadata({
      dryRunPlanId: dryRunId,
      includeEvidence,
      includeAudit,
    }),
  };
  const sections = createReportSections({
    dryRunId,
    record,
    approvalRecords,
    drilldown,
    includeEvidence,
    includeAudit,
    degraded: input.degraded === true,
    reason: input.reason,
  });
  const recommendationSection = sections.find((section) => section.kind === 'recommendations');
  const summary: CodexExecControlPlaneReportSummary = {
    id: foundationId('codex_report_summary'),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: foundationTimestamp(),
    dryRunId,
    status,
    sectionCount: sections.length,
    evidenceCount: includeEvidence ? drilldown.evidenceCount : 0,
    auditEventCount: includeAudit ? drilldown.auditEventCount : 0,
    riskLevel: record?.riskLevel,
    finalControlPlaneStatus:
      drilldown.timeline?.status ?? record?.executionGateResult?.status ?? status,
    recommendationCount: recommendationSection?.items.length ?? 0,
    metadataOnly: true,
    bodyStored: false,
    liveExecution: false,
    externalProcessStarted: false,
    executionDisabled: true,
    metadata: createControlPlaneMetadata({
      dryRunPlanId: dryRunId,
      liveRunRecordId: record?.id,
      status,
    }),
  };

  return {
    id: foundationId('codex_report'),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: foundationTimestamp(),
    dryRunId,
    status,
    format,
    query,
    summary,
    sections,
    sectionOrder: reportSectionOrder,
    metadataOnly: true,
    bodyStored: false,
    liveExecution: false,
    externalProcessStarted: false,
    executionDisabled: true,
    metadata: createControlPlaneMetadata({
      dryRunPlanId: dryRunId,
      liveRunRecordId: record?.id,
      status,
      format,
    }),
  };
}

export function renderCodexExecControlPlaneReportJson(
  report: CodexExecControlPlaneReport,
): CodexExecControlPlaneReportExportResult {
  const renderedContent = JSON.stringify(report, null, 2);

  return createReportExportResult(report, 'json', renderedContent);
}

export function renderCodexExecControlPlaneReportMarkdown(
  report: CodexExecControlPlaneReport,
): CodexExecControlPlaneReportExportResult {
  const renderedContent = [
    `# Codex Control-plane Report`,
    '',
    `dryRunId: ${report.dryRunId}`,
    `status: ${report.status}`,
    `liveExecution=false`,
    `externalProcessStarted=false`,
    `executionDisabled=true`,
    '',
    ...report.sections.flatMap((section) => [
      `## ${section.title}`,
      '',
      section.summary,
      '',
      ...section.items.map(
        (item) => `- ${escapeMarkdown(item.label)}: ${escapeMarkdown(item.value)}`,
      ),
      section.refIds.length > 0 ? `- refs: ${section.refIds.map(escapeMarkdown).join(', ')}` : '',
      section.hashes.length > 0 ? `- hashes: ${section.hashes.map(escapeMarkdown).join(', ')}` : '',
      '',
    ]),
  ]
    .filter((line) => line !== '')
    .join('\n');

  return createReportExportResult(report, 'markdown', renderedContent);
}

function createReportSections(input: {
  dryRunId: string;
  record?: CodexExecLiveRunRecord;
  approvalRecords: CodexExecManualApprovalRecord[];
  drilldown: CodexExecControlPlaneDrilldownView;
  includeEvidence: boolean;
  includeAudit: boolean;
  degraded: boolean;
  reason?: string;
}): CodexExecControlPlaneReportSection[] {
  return [
    createOverviewReportSection(input),
    createDryRunReportSection(input),
    createTimelineReportSection(input),
    createApprovalReportSection(input),
    createGateReportSection(input),
    createEvidenceReportSection(input),
    createAuditReportSection(input),
    createNoLiveBoundaryReportSection(input),
    createRisksReportSection(input),
    createRecommendationsReportSection(input),
  ];
}

function createOverviewReportSection(input: {
  dryRunId: string;
  record?: CodexExecLiveRunRecord;
  drilldown: CodexExecControlPlaneDrilldownView;
}): CodexExecControlPlaneReportSection {
  return createReportSection({
    kind: 'overview',
    title: 'Overview',
    status: input.record ? 'ok' : 'missing',
    summary: input.record
      ? `Read-only report for ${input.dryRunId} is available.`
      : `No read-only report source was found for ${input.dryRunId}.`,
    items: [
      reportItem('dryRunId', input.dryRunId, input.dryRunId),
      reportItem('status', input.record ? 'found' : 'not_found'),
      reportItem('createdAt', input.record?.createdAt ?? 'missing'),
      reportItem('riskLevel', input.record?.riskLevel ?? 'missing'),
      reportItem('finalControlPlaneStatus', input.drilldown.timeline?.status ?? 'not_found'),
    ],
    refIds: input.record ? [input.record.id, input.record.dryRunPlanId] : [input.dryRunId],
    hashes: input.record ? [input.record.promptHash] : [],
    dryRunId: input.dryRunId,
    liveRunRecordId: input.record?.id,
  });
}

function createDryRunReportSection(input: {
  dryRunId: string;
  record?: CodexExecLiveRunRecord;
}): CodexExecControlPlaneReportSection {
  return createReportSection({
    kind: 'dry_run',
    title: 'Dry-run',
    status: input.record ? 'ok' : 'missing',
    summary: input.record
      ? 'Dry-run metadata is summarized without storing source prompt body.'
      : 'Dry-run metadata is unavailable.',
    items: [
      reportItem('promptSummary', input.record?.promptSummary ?? 'missing'),
      reportItem('promptHash', input.record?.promptHash ?? 'missing'),
      reportItem('promptLength', String(input.record?.promptLength ?? 0)),
      reportItem('sandboxMode', input.record?.sandboxMode ?? 'missing'),
      reportItem('approvalMode', input.record?.approvalMode ?? 'missing'),
      reportItem('promptBodyStored', 'false'),
    ],
    refIds: input.record ? [input.record.dryRunPlanId, input.record.commandPreview.id] : [],
    hashes: input.record ? [input.record.promptHash, input.record.commandPreview.previewHash] : [],
    dryRunId: input.dryRunId,
    liveRunRecordId: input.record?.id,
  });
}

function createTimelineReportSection(input: {
  dryRunId: string;
  record?: CodexExecLiveRunRecord;
  drilldown: CodexExecControlPlaneDrilldownView;
}): CodexExecControlPlaneReportSection {
  const timelineDetail = input.drilldown.timelineDetail;
  const sourceBreakdown = timelineDetail?.sourceBreakdown ?? {};

  return createReportSection({
    kind: 'timeline',
    title: 'Timeline',
    status: input.drilldown.timeline ? 'ok' : 'missing',
    summary: input.drilldown.timeline
      ? `Timeline ${input.drilldown.timeline.status} with ${input.drilldown.timeline.eventCount} events.`
      : 'Timeline data is unavailable.',
    items: [
      reportItem('eventCount', String(input.drilldown.timeline?.eventCount ?? 0)),
      reportItem('sourceBreakdown', formatCounts(sourceBreakdown)),
      reportItem('latestGateStatus', timelineDetail?.latestGateStatus ?? 'missing'),
      reportItem('approvalState', timelineDetail?.approvalStatus ?? 'missing'),
    ],
    refIds: input.drilldown.timeline?.events.map((event) => event.id) ?? [],
    hashes: [],
    dryRunId: input.dryRunId,
    liveRunRecordId: input.record?.id,
  });
}

function createApprovalReportSection(input: {
  dryRunId: string;
  record?: CodexExecLiveRunRecord;
  approvalRecords: CodexExecManualApprovalRecord[];
}): CodexExecControlPlaneReportSection {
  const approvalRecords = dedupeApprovalRecords([
    ...(input.record?.manualApprovalRecord ? [input.record.manualApprovalRecord] : []),
    ...input.approvalRecords,
  ]);
  const latestRecord = approvalRecords[approvalRecords.length - 1];
  const latestState = input.record
    ? getLatestApprovalState(input.record, approvalRecords)
    : latestRecord?.approvalState;
  const latestDecision = latestRecord?.decision ?? input.record?.manualApprovalDecision;
  const latestArtifact = latestRecord?.approvalArtifact ?? input.record?.approvalArtifact;

  return createReportSection({
    kind: 'approval',
    title: 'Approval',
    status: latestState ? 'ok' : 'missing',
    summary: latestState
      ? `Approval state is ${latestState.status}.`
      : 'No manual approval state is available.',
    items: [
      reportItem('currentState', latestState?.status ?? 'missing'),
      reportItem('terminal', String(latestState?.terminal ?? false)),
      reportItem('canDecide', String(latestState?.canDecide ?? false)),
      reportItem('latestDecision', latestDecision?.outcome ?? 'missing'),
      reportItem('approvalArtifactId', latestArtifact?.id ?? 'missing', latestArtifact?.id),
      reportItem('approvalDryRunPlanHash', latestArtifact?.dryRunPlanHash ?? 'missing'),
      reportItem('approvalPolicyDecisionHash', latestArtifact?.policyDecisionHash ?? 'missing'),
    ],
    refIds: [latestRecord?.id, latestState?.id, latestDecision?.id, latestArtifact?.id].filter(
      (value): value is string => Boolean(value),
    ),
    hashes: [latestArtifact?.dryRunPlanHash, latestArtifact?.policyDecisionHash].filter(
      (value): value is string => Boolean(value),
    ),
    dryRunId: input.dryRunId,
    liveRunRecordId: input.record?.id,
  });
}

function createGateReportSection(input: {
  dryRunId: string;
  record?: CodexExecLiveRunRecord;
}): CodexExecControlPlaneReportSection {
  const gate = input.record?.executionGateResult;

  return createReportSection({
    kind: 'gate',
    title: 'Execution Gate',
    status: gate ? 'ok' : 'missing',
    summary: gate ? `Execution gate is ${gate.status}.` : 'Execution gate has not been evaluated.',
    items: [
      reportItem('status', gate?.status ?? 'missing'),
      reportItem('blockedReasons', gate?.reasons.join('; ') || 'none'),
      reportItem('liveExecution', 'false'),
      reportItem('externalProcessStarted', 'false'),
      reportItem('executionDisabled', 'true'),
    ],
    refIds: gate ? [gate.id] : [],
    hashes: gate ? [gate.dryRunPlanHash, gate.policyDecisionHash] : [],
    dryRunId: input.dryRunId,
    liveRunRecordId: input.record?.id,
  });
}

function createEvidenceReportSection(input: {
  dryRunId: string;
  record?: CodexExecLiveRunRecord;
  drilldown: CodexExecControlPlaneDrilldownView;
  includeEvidence: boolean;
}): CodexExecControlPlaneReportSection {
  const items = input.includeEvidence
    ? input.drilldown.evidenceSearch.items.map((item) =>
        reportItem(
          item.kind ?? 'evidence',
          item.summary ?? item.evidenceRefId,
          item.evidenceRefId,
          item.hash,
        ),
      )
    : [];

  return createReportSection({
    kind: 'evidence',
    title: 'Evidence',
    status: input.includeEvidence ? 'ok' : 'missing',
    summary: input.includeEvidence
      ? `Evidence summary includes ${input.drilldown.evidenceCount} metadata-only refs.`
      : 'Evidence summary was excluded by query.',
    items: [
      reportItem(
        'evidenceCount',
        String(input.includeEvidence ? input.drilldown.evidenceCount : 0),
      ),
      reportItem(
        'evidenceKinds',
        input.includeEvidence ? formatEvidenceKinds(input.drilldown) : 'excluded',
      ),
      ...items,
    ],
    refIds: input.includeEvidence
      ? input.drilldown.evidenceSearch.items.map((item) => item.evidenceRefId)
      : [],
    hashes: input.includeEvidence
      ? input.drilldown.evidenceSearch.items
          .map((item) => item.hash)
          .filter((value): value is string => Boolean(value))
      : [],
    dryRunId: input.dryRunId,
    liveRunRecordId: input.record?.id,
  });
}

function createAuditReportSection(input: {
  dryRunId: string;
  record?: CodexExecLiveRunRecord;
  drilldown: CodexExecControlPlaneDrilldownView;
  includeAudit: boolean;
}): CodexExecControlPlaneReportSection {
  const items = input.includeAudit
    ? input.drilldown.auditSearch.items.map((item) =>
        reportItem(item.action ?? 'audit', item.outcome ?? item.auditEventId, item.auditEventId),
      )
    : [];

  return createReportSection({
    kind: 'audit',
    title: 'Audit',
    status: input.includeAudit ? 'ok' : 'missing',
    summary: input.includeAudit
      ? `Audit summary includes ${input.drilldown.auditEventCount} metadata-only events.`
      : 'Audit summary was excluded by query.',
    items: [
      reportItem(
        'auditEventCount',
        String(input.includeAudit ? input.drilldown.auditEventCount : 0),
      ),
      reportItem(
        'auditActions',
        input.includeAudit ? formatAuditActions(input.drilldown) : 'excluded',
      ),
      ...items,
    ],
    refIds: input.includeAudit
      ? input.drilldown.auditSearch.items.map((item) => item.auditEventId)
      : [],
    hashes: [],
    dryRunId: input.dryRunId,
    liveRunRecordId: input.record?.id,
  });
}

function createNoLiveBoundaryReportSection(input: {
  dryRunId: string;
  record?: CodexExecLiveRunRecord;
}): CodexExecControlPlaneReportSection {
  const codexExecutionLabel = ['Codex', 'exec'].join(' ');

  return createReportSection({
    kind: 'no_live_boundary',
    title: 'No-live Boundary',
    status: 'ok',
    summary: 'This report is read-only and derived from control-plane summaries.',
    items: [
      reportItem(`${codexExecutionLabel} process`, 'not executed'),
      reportItem('external process', 'not started'),
      reportItem('browser/CDP/workspace action', 'not performed'),
      reportItem('report mode', 'read-only'),
      reportItem('liveExecution', 'false'),
      reportItem('externalProcessStarted', 'false'),
      reportItem('executionDisabled', 'true'),
    ],
    refIds: input.record ? [input.record.id, input.record.dryRunPlanId] : [input.dryRunId],
    hashes: input.record ? [input.record.promptHash] : [],
    dryRunId: input.dryRunId,
    liveRunRecordId: input.record?.id,
  });
}

function createRisksReportSection(input: {
  dryRunId: string;
  record?: CodexExecLiveRunRecord;
  degraded: boolean;
  reason?: string;
}): CodexExecControlPlaneReportSection {
  const risks = [
    input.record ? undefined : reportItem('missingData', 'dry-run record was not found'),
    input.degraded
      ? reportItem('degradedFallback', input.reason ?? 'degraded persistence state')
      : undefined,
    reportItem('liveAdapter', 'requires separate ADR before any execution path'),
  ].filter(
    (item): item is CodexExecControlPlaneReportSection['items'][number] => item !== undefined,
  );

  return createReportSection({
    kind: 'risks',
    title: 'Risks',
    status: input.degraded || !input.record ? 'degraded' : 'ok',
    summary:
      risks.length > 0
        ? `${risks.length} report risks or TODOs are listed.`
        : 'No report-specific risk was detected.',
    items:
      risks.length > 0
        ? risks
        : [reportItem('knownTodo', 'continue read-only control-plane review')],
    refIds: input.record ? [input.record.id] : [],
    hashes: [],
    dryRunId: input.dryRunId,
    liveRunRecordId: input.record?.id,
  });
}

function createRecommendationsReportSection(input: {
  dryRunId: string;
  record?: CodexExecLiveRunRecord;
}): CodexExecControlPlaneReportSection {
  return createReportSection({
    kind: 'recommendations',
    title: 'Recommendations',
    status: 'ok',
    summary: 'Recommended next steps preserve the disabled control-plane boundary.',
    items: [
      reportItem(
        'nextSafeStep',
        input.record
          ? 'review report evidence and audit refs'
          : 'create a dry-run before reporting',
      ),
      reportItem(
        'liveAdapterDecision',
        'separate ADR and go/no-go review required before execution path',
      ),
    ],
    refIds: input.record ? [input.record.dryRunPlanId] : [input.dryRunId],
    hashes: [],
    dryRunId: input.dryRunId,
    liveRunRecordId: input.record?.id,
  });
}

function createReportSection(input: {
  kind: CodexExecControlPlaneReportSectionKind;
  title: string;
  status: CodexExecControlPlaneReportSection['status'];
  summary: string;
  items: CodexExecControlPlaneReportSection['items'];
  refIds: string[];
  hashes: string[];
  dryRunId: string;
  liveRunRecordId?: string;
}): CodexExecControlPlaneReportSection {
  return {
    id: foundationId('codex_report_section'),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: foundationTimestamp(),
    kind: input.kind,
    title: input.title,
    status: input.status,
    summary: input.summary,
    items: input.items,
    refIds: uniqueStrings(input.refIds),
    hashes: uniqueStrings(input.hashes),
    metadataOnly: true,
    bodyStored: false,
    liveExecution: false,
    externalProcessStarted: false,
    executionDisabled: true,
    metadata: createControlPlaneMetadata({
      dryRunPlanId: input.dryRunId,
      liveRunRecordId: input.liveRunRecordId,
      reportSection: input.kind,
    }),
  };
}

function reportItem(
  label: string,
  value: string,
  refId?: string,
  hash?: string,
): CodexExecControlPlaneReportSection['items'][number] {
  return {
    label,
    value: value.length > 0 ? value : 'none',
    refId,
    hash,
  };
}

function createReportExportResult(
  report: CodexExecControlPlaneReport,
  format: CodexExecControlPlaneReportFormat,
  renderedContent: string,
): CodexExecControlPlaneReportExportResult {
  return {
    id: foundationId('codex_report_export'),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: foundationTimestamp(),
    dryRunId: report.dryRunId,
    format,
    status: report.status,
    report: {
      ...report,
      format,
    },
    renderedContent,
    renderedContentHash: prefixedHash(renderedContent),
    renderedContentLength: renderedContent.length,
    metadataOnly: true,
    sourceBodyStored: false,
    liveExecution: false,
    externalProcessStarted: false,
    executionDisabled: true,
    metadata: createControlPlaneMetadata({
      dryRunPlanId: report.dryRunId,
      reportId: report.id,
      format,
    }),
  };
}

function formatCounts(counts: Record<string, number>): string {
  const entries = Object.entries(counts).sort(([left], [right]) => left.localeCompare(right));
  return entries.length > 0 ? entries.map(([key, value]) => `${key}:${value}`).join(', ') : 'none';
}

function formatEvidenceKinds(drilldown: CodexExecControlPlaneDrilldownView): string {
  return formatCounts(
    drilldown.evidenceSearch.items.reduce(
      (counts, item) => ({
        ...counts,
        [item.kind ?? 'unknown']: (counts[item.kind ?? 'unknown'] ?? 0) + 1,
      }),
      {} as Record<string, number>,
    ),
  );
}

function formatAuditActions(drilldown: CodexExecControlPlaneDrilldownView): string {
  return formatCounts(
    drilldown.auditSearch.items.reduce(
      (counts, item) => ({
        ...counts,
        [item.action ?? 'unknown']: (counts[item.action ?? 'unknown'] ?? 0) + 1,
      }),
      {} as Record<string, number>,
    ),
  );
}

function uniqueStrings(values: string[]): string[] {
  return Array.from(new Set(values.filter((value) => value.length > 0))).sort();
}

function escapeMarkdown(value: string): string {
  return value.replace(/([\\`*_{}[\]()#+\-.!|>])/g, '\\$1');
}

export interface CodexExecReportReviewInput {
  report?: CodexExecControlPlaneReport;
  dryRunId?: string;
  reviewerLabel?: string;
  status?: CodexExecReportReviewStatus;
  recommendation?: CodexExecReportRecommendation;
  notesSummary?: string;
  checklistItems?: CodexExecReportReviewChecklistItem[];
  findings?: CodexExecReportReviewFinding[];
}

const reportReviewChecklistDefinitions: Array<{
  code: string;
  label: string;
  relatedSection?: CodexExecControlPlaneReportSectionKind;
}> = [
  {
    code: 'report_has_required_sections',
    label: 'Report has required sections',
  },
  {
    code: 'no_live_flags_present',
    label: 'No-live flags are present',
    relatedSection: 'no_live_boundary',
  },
  {
    code: 'no_prompt_body_exposed',
    label: 'Prompt body is not exposed',
    relatedSection: 'dry_run',
  },
  {
    code: 'no_command_body_exposed',
    label: 'Command body is not exposed',
    relatedSection: 'dry_run',
  },
  {
    code: 'evidence_is_hash_only',
    label: 'Evidence is hash-only',
    relatedSection: 'evidence',
  },
  {
    code: 'audit_is_metadata_only',
    label: 'Audit is metadata-only',
    relatedSection: 'audit',
  },
  {
    code: 'approval_state_present',
    label: 'Approval state is present',
    relatedSection: 'approval',
  },
  {
    code: 'gate_status_present',
    label: 'Gate status is present',
    relatedSection: 'gate',
  },
  {
    code: 'no_dashboard_execution_affordance',
    label: 'Dashboard has no execution affordance',
  },
  {
    code: 'live_adapter_requires_separate_adr',
    label: 'Live adapter requires a separate ADR',
    relatedSection: 'recommendations',
  },
];

export function createCodexExecReportReviewDraft(
  input: CodexExecReportReviewInput,
): CodexExecReportReviewRecord {
  return createCodexExecReportReviewRecord({
    ...input,
    status: input.status ?? 'draft',
  });
}

export function evaluateCodexExecReportReviewChecklist(
  report?: CodexExecControlPlaneReport,
): CodexExecReportReviewChecklistItem[] {
  return reportReviewChecklistDefinitions.map((definition) =>
    createReportReviewChecklistItem(
      definition,
      evaluateReportChecklistCode(definition.code, report),
    ),
  );
}

export function classifyCodexExecReportRisk(
  report: CodexExecControlPlaneReport | undefined,
  findings: CodexExecReportReviewFinding[],
): CodexExecReportRiskClassification {
  const failedSeverity = findings.reduce<CodexExecReportRiskClassification | undefined>(
    (current, finding) => maxRisk(current, finding.severity),
    undefined,
  );

  if (failedSeverity) {
    return failedSeverity;
  }

  return report?.summary.riskLevel ?? 'low';
}

export function createCodexExecReportReviewRecord(
  input: CodexExecReportReviewInput,
): CodexExecReportReviewRecord {
  const report = input.report;
  const dryRunId = report?.dryRunId ?? input.dryRunId ?? 'unknown_dry_run';
  const checklistItems = input.checklistItems ?? evaluateCodexExecReportReviewChecklist(report);
  const findings = dedupeReviewFindings([
    ...createChecklistFindings(checklistItems),
    ...(input.findings ?? []),
  ]);
  const riskClassification = classifyCodexExecReportRisk(report, findings);
  const recommendation =
    input.recommendation ?? recommendationForReview(riskClassification, checklistItems, report);
  const reportHash = report ? hashCodexExecControlPlaneReport(report) : prefixedHash(dryRunId);

  return {
    id: foundationId('codex_report_review'),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: foundationTimestamp(),
    dryRunId,
    reportId: report?.id,
    reportHash,
    reportSectionHashes: report ? report.sections.map(hashCodexExecControlPlaneReportSection) : [],
    sectionSummaryRefs: report
      ? report.sections.map((section) => `${section.kind}:${section.id}`)
      : [],
    reviewedAt: foundationTimestamp(),
    reviewerLabel: input.reviewerLabel ?? 'local-operator',
    status: input.status ?? 'reviewed',
    recommendation,
    recommendationGrantsExecution: false,
    riskClassification,
    checklistItems,
    findings,
    notesSummary: input.notesSummary,
    reportSummary: report?.summary,
    metadataOnly: true,
    bodyStored: false,
    liveExecution: false,
    externalProcessStarted: false,
    executionDisabled: true,
    metadata: createControlPlaneMetadata({
      dryRunPlanId: dryRunId,
      reportId: report?.id,
      reportHash,
      recommendation,
      recommendationGrantsExecution: false,
    }),
  };
}

export function summarizeCodexExecReportReview(
  record: CodexExecReportReviewRecord,
): CodexExecReportReviewSummary {
  return {
    id: foundationId('codex_report_review_summary'),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: foundationTimestamp(),
    reviewId: record.id,
    dryRunId: record.dryRunId,
    reportHash: record.reportHash,
    status: record.status,
    recommendation: record.recommendation,
    recommendationGrantsExecution: false,
    riskClassification: record.riskClassification,
    reviewerLabel: record.reviewerLabel,
    reviewedAt: record.reviewedAt,
    findingCount: record.findings.length,
    failedChecklistCount: record.checklistItems.filter((item) => item.status === 'failed').length,
    metadataOnly: true,
    bodyStored: false,
    liveExecution: false,
    externalProcessStarted: false,
    executionDisabled: true,
    metadata: createControlPlaneMetadata({
      dryRunPlanId: record.dryRunId,
      reviewId: record.id,
      reportHash: record.reportHash,
      recommendation: record.recommendation,
      recommendationGrantsExecution: false,
    }),
  };
}

export function listCodexExecReportReviewSummaries(
  records: CodexExecReportReviewRecord[],
  query: Partial<CodexExecReportReviewQuery> = {},
): CodexExecReportReviewSummary[] {
  const limit = query.limit ?? 20;

  return records
    .filter((record) => {
      if (query.dryRunId && record.dryRunId !== query.dryRunId) {
        return false;
      }

      if (query.status && record.status !== query.status) {
        return false;
      }

      if (query.recommendation && record.recommendation !== query.recommendation) {
        return false;
      }

      return true;
    })
    .slice(0, limit)
    .map(summarizeCodexExecReportReview);
}

export interface CodexExecReviewerHandoffOptions {
  fromReviewer?: string;
  toReviewer?: string;
}

export interface CodexExecGovernanceReviewPackageInput {
  dryRunId: string;
  record?: CodexExecLiveRunRecord;
  records?: CodexExecLiveRunRecord[];
  approvalRecords?: CodexExecManualApprovalRecord[];
  evidenceRefs?: EvidenceRef[];
  auditEvents?: AuditEvent[];
  report?: CodexExecControlPlaneReport;
  reportReviews?: CodexExecReportReviewRecord[];
  includeEvidence?: boolean;
  includeAudit?: boolean;
  degraded?: boolean;
  reason?: string;
}

const governanceReviewPackageSectionOrder: CodexExecGovernanceReviewPackageSection[] = [
  'dry_run',
  'timeline',
  'evidence',
  'audit',
  'report',
  'report_review',
  'review_history',
  'handoff',
  'no_live_boundary',
  'adr_readiness',
  'risks',
  'blockers',
  'recommendation',
];

export function getLatestCodexExecReportReview(
  records: CodexExecReportReviewRecord[],
  dryRunId: string,
): CodexExecReportReviewRecord | undefined {
  return sortReportReviewsNewestFirst(records.filter((record) => record.dryRunId === dryRunId))[0];
}

export function buildCodexExecReportReviewHistory(
  records: CodexExecReportReviewRecord[],
  query: Partial<CodexExecReportReviewHistoryQuery> = {},
): CodexExecReportReviewHistoryView {
  const normalizedQuery = createReportReviewHistoryQuery(query);
  const filtered = sortReportReviewsNewestFirst(
    filterReportReviews(records, normalizedQuery),
  ).slice(0, normalizedQuery.limit);
  const latest = filtered[0];
  const previous = filtered[1];

  return {
    id: foundationId('codex_report_review_history'),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: foundationTimestamp(),
    dryRunId: normalizedQuery.dryRunId,
    query: normalizedQuery,
    latestReview: latest ? summarizeCodexExecReportReview(latest) : undefined,
    summaries: filtered.map(summarizeCodexExecReportReview),
    comparison: latest && previous ? compareCodexExecReportReviews(previous, latest) : undefined,
    historyCount: filtered.length,
    recommendationGrantsExecution: false,
    metadataOnly: true,
    bodyStored: false,
    liveExecution: false,
    externalProcessStarted: false,
    executionDisabled: true,
    metadata: createControlPlaneMetadata({
      dryRunPlanId: normalizedQuery.dryRunId,
      historyCount: filtered.length,
      recommendationGrantsExecution: false,
    }),
  };
}

export function compareCodexExecReportReviews(
  left: CodexExecReportReviewRecord,
  right: CodexExecReportReviewRecord,
): CodexExecReportReviewComparison {
  const comparable = left.dryRunId === right.dryRunId;
  const items = [
    createReportReviewComparisonItem('dryRunId', left.dryRunId, right.dryRunId),
    createReportReviewComparisonItem('status', left.status, right.status),
    createReportReviewComparisonItem(
      'riskClassification',
      left.riskClassification,
      right.riskClassification,
    ),
    createReportReviewComparisonItem('recommendation', left.recommendation, right.recommendation),
    createReportReviewComparisonItem('reportHash', left.reportHash, right.reportHash),
    createReportReviewComparisonItem(
      'reportSectionHashes',
      summarizeHashList(left.reportSectionHashes),
      summarizeHashList(right.reportSectionHashes),
    ),
    createReportReviewComparisonItem(
      'checklistStatus',
      summarizeChecklistStatuses(left.checklistItems),
      summarizeChecklistStatuses(right.checklistItems),
    ),
    createReportReviewComparisonItem(
      'findingCodes',
      summarizeFindingCodes(left.findings),
      summarizeFindingCodes(right.findings),
    ),
    createReportReviewComparisonItem('findingCount', left.findings.length, right.findings.length),
    createReportReviewComparisonItem('reviewerLabel', left.reviewerLabel, right.reviewerLabel),
    createReportReviewComparisonItem('reviewedAt', left.reviewedAt, right.reviewedAt),
  ];
  const changedItemCount = items.filter((item) => item.changed).length;

  return {
    id: foundationId('codex_report_review_comparison'),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: foundationTimestamp(),
    leftReviewId: left.id,
    rightReviewId: right.id,
    dryRunId: comparable ? left.dryRunId : undefined,
    comparable,
    summary: comparable
      ? `Review metadata changed across ${changedItemCount} fields.`
      : 'Reviews belong to different dry-run records; comparison is metadata-only.',
    changedItemCount,
    items,
    recommendationGrantsExecution: false,
    metadataOnly: true,
    bodyStored: false,
    liveExecution: false,
    externalProcessStarted: false,
    executionDisabled: true,
    metadata: createControlPlaneMetadata({
      dryRunPlanId: comparable ? left.dryRunId : undefined,
      leftReviewId: left.id,
      rightReviewId: right.id,
      changedItemCount,
      recommendationGrantsExecution: false,
    }),
  };
}

export function buildCodexExecReviewerHandoffSummary(
  records: CodexExecReportReviewRecord[],
  dryRunId: string,
  options: CodexExecReviewerHandoffOptions = {},
): CodexExecReviewerHandoffSummary {
  const history = sortReportReviewsNewestFirst(
    records.filter((record) => record.dryRunId === dryRunId),
  );
  const latest = history[0];
  const findingCount = latest?.findings.length ?? 0;
  const failedChecklistCount =
    latest?.checklistItems.filter((item) => item.status === 'failed').length ?? 0;

  return {
    id: foundationId('codex_reviewer_handoff'),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: foundationTimestamp(),
    dryRunId,
    fromReviewer: options.fromReviewer,
    toReviewer: options.toReviewer,
    latestReviewId: latest?.id,
    latestStatus: latest?.status,
    latestRecommendation: latest?.recommendation,
    latestRiskClassification: latest?.riskClassification,
    reviewCount: history.length,
    findingCount,
    failedChecklistCount,
    handoffSummary: createReviewerHandoffSummary(history.length, options),
    recommendedNextStep: latest
      ? recommendedNextStepForReportReview(latest)
      : 'Create a read-only report review record before handoff.',
    recommendationGrantsExecution: false,
    metadataOnly: true,
    bodyStored: false,
    liveExecution: false,
    externalProcessStarted: false,
    executionDisabled: true,
    metadata: createControlPlaneMetadata({
      dryRunPlanId: dryRunId,
      latestReviewId: latest?.id,
      fromReviewer: options.fromReviewer,
      toReviewer: options.toReviewer,
      recommendationGrantsExecution: false,
    }),
  };
}

export function buildCodexExecAdrReadinessChecklist(input: {
  dryRunId: string;
  report?: CodexExecControlPlaneReport;
  reviewHistory?: CodexExecReportReviewHistoryView;
  handoff?: CodexExecReviewerHandoffSummary;
  noLiveEvidence?: CodexExecNoLiveEvidenceSummary;
}): CodexExecAdrReadinessChecklistItem[] {
  const report = input.report;
  const history = input.reviewHistory;
  const handoff = input.handoff;
  const noLiveEvidence = input.noLiveEvidence;

  return [
    createAdrReadinessChecklistItem({
      code: 'dry_run_available',
      label: 'Dry-run is available',
      status: report?.status === 'found' ? 'passed' : 'failed',
      summary:
        report?.status === 'found'
          ? 'Dry-run metadata is available as summary/hash-only data.'
          : 'A dry-run record is required before ADR readiness review.',
      sourceSection: 'dry_run',
    }),
    createAdrReadinessChecklistItem({
      code: 'timeline_available',
      label: 'Timeline is available',
      status: report?.sections.some(
        (section) => section.kind === 'timeline' && section.status === 'ok',
      )
        ? 'passed'
        : 'warning',
      summary: 'Control-plane timeline should be present before live-adapter ADR review.',
      sourceSection: 'timeline',
    }),
    createAdrReadinessChecklistItem({
      code: 'evidence_summary_available',
      label: 'Evidence summary is available',
      status: (noLiveEvidence?.evidenceRefCount ?? 0) > 0 ? 'passed' : 'warning',
      summary: 'Evidence remains metadata/hash-only and should be present for ADR review.',
      sourceSection: 'evidence',
    }),
    createAdrReadinessChecklistItem({
      code: 'audit_summary_available',
      label: 'Audit summary is available',
      status: (noLiveEvidence?.auditEventCount ?? 0) > 0 ? 'passed' : 'warning',
      summary: 'Audit events should be present and metadata-only for ADR review.',
      sourceSection: 'audit',
    }),
    createAdrReadinessChecklistItem({
      code: 'report_review_available',
      label: 'Report review is available',
      status: history?.latestReview ? 'passed' : 'failed',
      summary: history?.latestReview
        ? 'Latest report review is available and non-executing.'
        : 'At least one report review is required before ADR readiness review.',
      sourceSection: 'report_review',
    }),
    createAdrReadinessChecklistItem({
      code: 'review_history_available',
      label: 'Review history is available',
      status: (history?.historyCount ?? 0) > 0 ? 'passed' : 'failed',
      summary:
        (history?.historyCount ?? 0) > 0
          ? 'Review history is available for comparison.'
          : 'Review history is missing for this dry-run.',
      sourceSection: 'review_history',
    }),
    createAdrReadinessChecklistItem({
      code: 'handoff_summary_available',
      label: 'Reviewer handoff summary is available',
      status: (handoff?.reviewCount ?? 0) > 0 ? 'passed' : 'warning',
      summary:
        (handoff?.reviewCount ?? 0) > 0
          ? 'Reviewer handoff summary is available and does not grant execution.'
          : 'Handoff summary has no review records to summarize.',
      sourceSection: 'handoff',
    }),
    createAdrReadinessChecklistItem({
      code: 'no_live_boundary_confirmed',
      label: 'No-live boundary is confirmed',
      status:
        noLiveEvidence?.noRealCodexExec === true &&
        noLiveEvidence.noExternalProcessStarted === true &&
        noLiveEvidence.noBrowserOrCdpAction === true &&
        noLiveEvidence.noWorkspaceWrite === true
          ? 'passed'
          : 'failed',
      summary:
        'No live execution, external process, browser/CDP action, or workspace write is allowed.',
      sourceSection: 'no_live_boundary',
    }),
    createAdrReadinessChecklistItem({
      code: 'live_adapter_requires_separate_adr',
      label: 'Live adapter requires separate ADR',
      status: 'passed',
      summary: 'This package is only ADR readiness evidence and is not execution permission.',
      sourceSection: 'adr_readiness',
    }),
  ];
}

export function buildCodexExecNoLiveEvidenceSummary(input: {
  dryRunId: string;
  drilldown?: CodexExecControlPlaneDrilldownView;
  record?: CodexExecLiveRunRecord;
}): CodexExecNoLiveEvidenceSummary {
  const evidenceItems = input.drilldown?.evidenceSearch.items ?? [];
  const auditItems = input.drilldown?.auditSearch.items ?? [];

  return {
    id: foundationId('codex_no_live_evidence'),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: foundationTimestamp(),
    dryRunId: input.dryRunId,
    noRealCodexExec: true,
    noExternalProcessStarted: true,
    noBrowserOrCdpAction: true,
    noWorkspaceWrite: true,
    noExecutionApprovalGranted: true,
    evidenceRefCount: input.drilldown?.evidenceCount ?? input.record?.evidenceRefs.length ?? 0,
    auditEventCount: input.drilldown?.auditEventCount ?? input.record?.auditEvents.length ?? 0,
    evidenceKinds: uniqueStrings(evidenceItems.map((item) => item.kind ?? 'unknown')),
    auditActions: uniqueStrings(auditItems.map((item) => item.action ?? 'unknown')),
    summary:
      'No-live evidence confirms this governance package is read-only and does not grant execution.',
    recommendationGrantsExecution: false,
    metadataOnly: true,
    bodyStored: false,
    liveExecution: false,
    externalProcessStarted: false,
    executionDisabled: true,
    metadata: createControlPlaneMetadata({
      dryRunPlanId: input.dryRunId,
      evidenceRefCount: input.drilldown?.evidenceCount ?? input.record?.evidenceRefs.length ?? 0,
      auditEventCount: input.drilldown?.auditEventCount ?? input.record?.auditEvents.length ?? 0,
      recommendationGrantsExecution: false,
    }),
  };
}

export function classifyCodexExecGovernanceRisk(input: {
  report?: CodexExecControlPlaneReport;
  reviewHistory?: CodexExecReportReviewHistoryView;
  blockers?: CodexExecGovernanceBlocker[];
}): CodexExecReportRiskClassification {
  const blockerRisk = (input.blockers ?? []).reduce<CodexExecReportRiskClassification | undefined>(
    (current, blocker) => maxRisk(current, blocker.severity),
    undefined,
  );
  const latestReviewRisk = input.reviewHistory?.latestReview?.riskClassification;
  const reportRisk = input.report?.summary.riskLevel;
  const risks = [blockerRisk, latestReviewRisk, reportRisk].filter(
    (risk): risk is CodexExecReportRiskClassification => Boolean(risk),
  );

  return (
    risks.reduce<CodexExecReportRiskClassification | undefined>(
      (current, risk) => maxRisk(current, risk),
      undefined,
    ) ?? 'low'
  );
}

export function buildCodexExecGovernanceReviewPackage(
  input: CodexExecGovernanceReviewPackageInput,
): CodexExecGovernanceReviewPackage {
  const includeEvidence = input.includeEvidence ?? true;
  const includeAudit = input.includeAudit ?? true;
  const records = input.record ? [input.record] : (input.records ?? []);
  const record =
    input.record ??
    records.find(
      (candidate) => candidate.id === input.dryRunId || candidate.dryRunPlanId === input.dryRunId,
    );
  const dryRunId = record?.dryRunPlanId ?? input.dryRunId;
  const approvalRecords = (input.approvalRecords ?? []).filter(
    (approvalRecord) => approvalRecord.request.dryRunPlanId === dryRunId,
  );
  const report =
    input.report ??
    buildCodexExecControlPlaneReport({
      dryRunId,
      record,
      records,
      approvalRecords,
      evidenceRefs: input.evidenceRefs,
      auditEvents: input.auditEvents,
      includeEvidence,
      includeAudit,
      degraded: input.degraded,
      reason: input.reason,
    });
  const drilldown = buildControlPlaneDrilldownView({
    dryRunId,
    records: record ? [record] : records,
    approvalRecords,
    evidenceRefs: input.evidenceRefs,
    auditEvents: input.auditEvents,
  });
  const reviewHistory = buildCodexExecReportReviewHistory(input.reportReviews ?? [], {
    dryRunId,
    limit: 20,
  });
  const handoff = buildCodexExecReviewerHandoffSummary(input.reportReviews ?? [], dryRunId);
  const noLiveEvidence = buildCodexExecNoLiveEvidenceSummary({ dryRunId, drilldown, record });
  const adrReadinessChecklist = buildCodexExecAdrReadinessChecklist({
    dryRunId,
    report,
    reviewHistory,
    handoff,
    noLiveEvidence,
  });
  const blockers = createGovernanceBlockers({
    dryRunId,
    report,
    reviewHistory,
    adrReadinessChecklist,
    degraded: input.degraded,
    reason: input.reason,
  });
  const riskClassification = classifyCodexExecGovernanceRisk({
    report,
    reviewHistory,
    blockers,
  });
  const recommendation = recommendationForGovernancePackage(riskClassification, blockers);
  const status = statusForGovernancePackage(report, blockers, recommendation);
  const summary = createGovernanceReviewPackageSummary({
    dryRunId,
    status,
    riskClassification,
    recommendation,
    adrReadinessChecklist,
    blockers,
    noLiveEvidence,
    reviewHistory,
    report,
    handoff,
  });

  return {
    id: foundationId('codex_governance_package'),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: foundationTimestamp(),
    dryRunId,
    status,
    query: createGovernanceReviewPackageQuery({ dryRunId, includeEvidence, includeAudit }),
    summary,
    sectionOrder: governanceReviewPackageSectionOrder,
    report,
    reviewHistory,
    latestReview: reviewHistory.latestReview,
    handoff,
    noLiveEvidence,
    adrReadinessChecklist,
    blockers,
    riskClassification,
    recommendation,
    recommendationGrantsExecution: false,
    metadataOnly: true,
    bodyStored: false,
    liveExecution: false,
    externalProcessStarted: false,
    executionDisabled: true,
    metadata: createControlPlaneMetadata({
      dryRunPlanId: dryRunId,
      reportId: report.id,
      status,
      recommendation,
      recommendationGrantsExecution: false,
    }),
  };
}

export function summarizeCodexExecGovernanceReviewPackage(
  governancePackage: CodexExecGovernanceReviewPackage,
): CodexExecGovernanceReviewPackageSummary {
  return {
    ...governancePackage.summary,
    id: foundationId('codex_governance_package_summary'),
    createdAt: foundationTimestamp(),
  };
}

export interface CodexExecLiveAdapterAdrDraftInput {
  dryRunId: string;
  governancePackage?: CodexExecGovernanceReviewPackage;
  format?: CodexExecLiveAdapterAdrDraftFormat;
  includeEvidence?: boolean;
  includeAudit?: boolean;
  degraded?: boolean;
  reason?: string;
}

const liveAdapterAdrDraftSectionOrder: CodexExecLiveAdapterAdrDraftSectionKind[] = [
  'title',
  'status',
  'context',
  'governance_summary',
  'no_live_boundary',
  'adr_readiness',
  'risk_assessment',
  'unresolved_blockers',
  'decision_options',
  'recommended_decision',
  'consequences',
  'next_review_steps',
];

export function buildCodexExecLiveAdapterAdrDraft(
  input: CodexExecLiveAdapterAdrDraftInput,
): CodexExecLiveAdapterAdrDraft {
  const format = input.format ?? 'json';
  const governancePackage =
    input.governancePackage ??
    buildCodexExecGovernanceReviewPackage({
      dryRunId: input.dryRunId,
      records: [],
      reportReviews: [],
      includeEvidence: input.includeEvidence ?? true,
      includeAudit: input.includeAudit ?? true,
      degraded: input.degraded,
      reason: input.reason,
    });
  const dryRunId = governancePackage.dryRunId;
  const status = statusForAdrDraft(governancePackage, input.degraded === true);
  const title = `ADR Draft: Codex control-plane live adapter readiness for ${dryRunId}`;
  const sections = createLiveAdapterAdrDraftSections({
    dryRunId,
    title,
    status,
    governancePackage,
    degraded: input.degraded === true,
    reason: input.reason,
  });
  const summary = createLiveAdapterAdrDraftSummary({
    dryRunId,
    title,
    status,
    governancePackage,
    sections,
  });

  return {
    id: foundationId('codex_live_adapter_adr_draft'),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: foundationTimestamp(),
    dryRunId,
    status,
    format,
    query: createLiveAdapterAdrDraftQuery({
      dryRunId,
      format,
      includeEvidence: input.includeEvidence ?? governancePackage.query.includeEvidence,
      includeAudit: input.includeAudit ?? governancePackage.query.includeAudit,
    }),
    title,
    summary,
    governancePackageSummary: governancePackage.summary,
    governancePackage,
    sections,
    sectionOrder: liveAdapterAdrDraftSectionOrder,
    recommendation: governancePackage.recommendation,
    recommendationGrantsExecution: false,
    metadataOnly: true,
    bodyStored: false,
    draftOnly: true,
    liveExecution: false,
    externalProcessStarted: false,
    executionDisabled: true,
    metadata: createControlPlaneMetadata({
      dryRunPlanId: dryRunId,
      governancePackageId: governancePackage.id,
      status,
      format,
      recommendationGrantsExecution: false,
      draftOnly: true,
    }),
  };
}

export function summarizeCodexExecLiveAdapterAdrDraft(
  draft: CodexExecLiveAdapterAdrDraft,
): CodexExecLiveAdapterAdrDraftSummary {
  return {
    ...draft.summary,
    id: foundationId('codex_live_adapter_adr_draft_summary'),
    createdAt: foundationTimestamp(),
  };
}

export function renderCodexExecLiveAdapterAdrDraftJson(
  draft: CodexExecLiveAdapterAdrDraft,
): CodexExecLiveAdapterAdrDraftExportResult {
  const renderedContent = JSON.stringify(draft, null, 2);

  return createLiveAdapterAdrDraftExportResult(draft, 'json', renderedContent);
}

export function renderCodexExecLiveAdapterAdrDraftMarkdown(
  draft: CodexExecLiveAdapterAdrDraft,
): CodexExecLiveAdapterAdrDraftExportResult {
  const renderedContent = [
    `# ${escapeMarkdown(draft.title)}`,
    '',
    `dryRunId: ${escapeMarkdown(draft.dryRunId)}`,
    `status: ${draft.status}`,
    `recommendation: ${draft.recommendation} (does not grant execution)`,
    `recommendationGrantsExecution=false`,
    `liveExecution=false`,
    `externalProcessStarted=false`,
    `executionDisabled=true`,
    `draftOnly=true`,
    '',
    ...draft.sections.flatMap((section) => [
      `## ${escapeMarkdown(section.title)}`,
      '',
      escapeMarkdown(section.summary),
      '',
      ...section.items.map(
        (item) => `- ${escapeMarkdown(item.label)}: ${escapeMarkdown(item.value)}`,
      ),
      section.refIds.length > 0 ? `- refs: ${section.refIds.map(escapeMarkdown).join(', ')}` : '',
      section.hashes.length > 0 ? `- hashes: ${section.hashes.map(escapeMarkdown).join(', ')}` : '',
      '',
    ]),
  ]
    .filter((line) => line !== '')
    .join('\n');

  return createLiveAdapterAdrDraftExportResult(draft, 'markdown', renderedContent);
}

function createLiveAdapterAdrDraftQuery(input: {
  dryRunId: string;
  format: CodexExecLiveAdapterAdrDraftFormat;
  includeEvidence: boolean;
  includeAudit: boolean;
}): CodexExecLiveAdapterAdrDraftQuery {
  return {
    id: foundationId('codex_live_adapter_adr_draft_query'),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: foundationTimestamp(),
    dryRunId: input.dryRunId,
    format: input.format,
    includeEvidence: input.includeEvidence,
    includeAudit: input.includeAudit,
    recommendationGrantsExecution: false,
    metadataOnly: true,
    bodyStored: false,
    draftOnly: true,
    liveExecution: false,
    externalProcessStarted: false,
    executionDisabled: true,
    metadata: createControlPlaneMetadata({
      dryRunPlanId: input.dryRunId,
      format: input.format,
      includeEvidence: input.includeEvidence,
      includeAudit: input.includeAudit,
      recommendationGrantsExecution: false,
      draftOnly: true,
    }),
  };
}

function createLiveAdapterAdrDraftSections(input: {
  dryRunId: string;
  title: string;
  status: CodexExecLiveAdapterAdrDraftStatus;
  governancePackage: CodexExecGovernanceReviewPackage;
  degraded: boolean;
  reason?: string;
}): CodexExecLiveAdapterAdrDraftSection[] {
  const governancePackage = input.governancePackage;
  const noLiveEvidence = governancePackage.noLiveEvidence;
  const readinessPassed = governancePackage.adrReadinessChecklist.filter(
    (item) => item.status === 'passed',
  ).length;
  const readinessFailed = governancePackage.adrReadinessChecklist.filter(
    (item) => item.status === 'failed',
  ).length;
  const blockerItems = governancePackage.blockers.map((blocker) =>
    reportItem(
      `${blocker.severity} ${blocker.code}`,
      `${blocker.summary} Resolution: ${blocker.recommendedResolution}`,
      blocker.id,
    ),
  );

  return [
    createLiveAdapterAdrDraftSection({
      dryRunId: input.dryRunId,
      kind: 'title',
      title: 'Title',
      status: 'ok',
      summary: input.title,
      items: [reportItem('adrType', 'Live Adapter ADR Draft'), reportItem('draftOnly', 'true')],
      refIds: [governancePackage.id],
      hashes: [prefixedHash(input.title)],
    }),
    createLiveAdapterAdrDraftSection({
      dryRunId: input.dryRunId,
      kind: 'status',
      title: 'Status',
      status:
        input.status === 'degraded' ? 'degraded' : input.status === 'blocked' ? 'blocked' : 'ok',
      summary: `ADR draft status is ${input.status}; this does not grant execution.`,
      items: [
        reportItem('draftStatus', input.status),
        reportItem('governancePackageStatus', governancePackage.status),
        reportItem('degraded', String(input.degraded)),
        reportItem('reason', input.reason ?? 'none'),
      ],
      refIds: [governancePackage.summary.id],
    }),
    createLiveAdapterAdrDraftSection({
      dryRunId: input.dryRunId,
      kind: 'context',
      title: 'Context',
      status: governancePackage.report ? 'ok' : 'missing',
      summary:
        'CodexHub is preparing a separate human ADR before any live adapter process path can be considered.',
      items: [
        reportItem('dryRunId', input.dryRunId, input.dryRunId),
        reportItem(
          'reportId',
          governancePackage.report?.id ?? 'missing',
          governancePackage.report?.id,
        ),
        reportItem('latestReviewId', governancePackage.latestReview?.reviewId ?? 'missing'),
        reportItem('handoffId', governancePackage.handoff.id, governancePackage.handoff.id),
      ],
      refIds: [
        input.dryRunId,
        governancePackage.report?.id,
        governancePackage.latestReview?.reviewId,
        governancePackage.handoff.id,
      ].filter((value): value is string => Boolean(value)),
    }),
    createLiveAdapterAdrDraftSection({
      dryRunId: input.dryRunId,
      kind: 'governance_summary',
      title: 'Governance Summary',
      status: governancePackage.status === 'not_found' ? 'missing' : 'ok',
      summary: `Governance package is ${governancePackage.status} with ${governancePackage.summary.unresolvedBlockerCount} unresolved blockers.`,
      items: [
        reportItem('riskClassification', governancePackage.riskClassification),
        reportItem('recommendation', governancePackage.recommendation),
        reportItem('recommendationGrantsExecution', 'false'),
        reportItem('evidenceRefCount', String(governancePackage.summary.evidenceRefCount)),
        reportItem('auditEventCount', String(governancePackage.summary.auditEventCount)),
      ],
      refIds: [governancePackage.id, governancePackage.summary.id],
    }),
    createLiveAdapterAdrDraftSection({
      dryRunId: input.dryRunId,
      kind: 'no_live_boundary',
      title: 'No-live Boundary',
      status:
        noLiveEvidence.noRealCodexExec &&
        noLiveEvidence.noExternalProcessStarted &&
        noLiveEvidence.noBrowserOrCdpAction &&
        noLiveEvidence.noWorkspaceWrite
          ? 'ok'
          : 'blocked',
      summary:
        'No real Codex process, external process, browser/CDP action, or workspace write is represented by this draft.',
      items: [
        reportItem('noRealCodexExec', String(noLiveEvidence.noRealCodexExec)),
        reportItem('noExternalProcessStarted', String(noLiveEvidence.noExternalProcessStarted)),
        reportItem('noBrowserOrCdpAction', String(noLiveEvidence.noBrowserOrCdpAction)),
        reportItem('noWorkspaceWrite', String(noLiveEvidence.noWorkspaceWrite)),
        reportItem('noExecutionApprovalGranted', String(noLiveEvidence.noExecutionApprovalGranted)),
      ],
      refIds: [noLiveEvidence.id],
    }),
    createLiveAdapterAdrDraftSection({
      dryRunId: input.dryRunId,
      kind: 'adr_readiness',
      title: 'ADR Readiness',
      status: readinessFailed > 0 ? 'blocked' : 'ok',
      summary: `${readinessPassed} readiness checks passed and ${readinessFailed} failed.`,
      items: governancePackage.adrReadinessChecklist.map((item) =>
        reportItem(`${item.status} ${item.code}`, item.summary, item.id),
      ),
      refIds: governancePackage.adrReadinessChecklist.map((item) => item.id),
    }),
    createLiveAdapterAdrDraftSection({
      dryRunId: input.dryRunId,
      kind: 'risk_assessment',
      title: 'Risk Assessment',
      status:
        governancePackage.riskClassification === 'critical' ||
        governancePackage.riskClassification === 'high'
          ? 'blocked'
          : 'ok',
      summary: `Current governance risk classification is ${governancePackage.riskClassification}.`,
      items: [
        reportItem('riskClassification', governancePackage.riskClassification),
        reportItem('blockerCount', String(governancePackage.summary.blockerCount)),
        reportItem('reviewFindingCount', String(governancePackage.handoff.findingCount)),
        reportItem('failedChecklistCount', String(governancePackage.handoff.failedChecklistCount)),
      ],
      refIds: [governancePackage.handoff.id],
    }),
    createLiveAdapterAdrDraftSection({
      dryRunId: input.dryRunId,
      kind: 'unresolved_blockers',
      title: 'Unresolved Blockers',
      status: governancePackage.blockers.length > 0 ? 'blocked' : 'ok',
      summary:
        governancePackage.blockers.length > 0
          ? `${governancePackage.blockers.length} blockers must be resolved before ADR approval.`
          : 'No unresolved governance blockers are present.',
      items: blockerItems.length > 0 ? blockerItems : [reportItem('blockers', 'none')],
      refIds: governancePackage.blockers.map((blocker) => blocker.id),
    }),
    createLiveAdapterAdrDraftSection({
      dryRunId: input.dryRunId,
      kind: 'decision_options',
      title: 'Decision Options',
      status: 'ok',
      summary: 'These options are ADR review choices only and do not authorize execution.',
      items: [
        reportItem('no_go', 'Do not proceed; resolve blockers and repeat governance review.'),
        reportItem('needs_changes', 'Request changes before a live adapter ADR can be reviewed.'),
        reportItem(
          'ready_for_adr',
          'Move to a separate human ADR review without execution rights.',
        ),
        reportItem(
          'ready_for_read_only_live_review',
          'Prepare a later read-only live review only after ADR approval.',
        ),
      ],
      refIds: [governancePackage.id],
    }),
    createLiveAdapterAdrDraftSection({
      dryRunId: input.dryRunId,
      kind: 'recommended_decision',
      title: 'Recommended Decision',
      status:
        governancePackage.recommendation === 'no_go' ||
        governancePackage.recommendation === 'needs_changes'
          ? 'blocked'
          : 'ok',
      summary: `${governancePackage.recommendation} is a non-executing ADR recommendation.`,
      items: [
        reportItem('recommendation', governancePackage.recommendation),
        reportItem('recommendationGrantsExecution', 'false'),
        reportItem('requiresSeparateAdr', 'true'),
      ],
      refIds: [governancePackage.summary.id],
    }),
    createLiveAdapterAdrDraftSection({
      dryRunId: input.dryRunId,
      kind: 'consequences',
      title: 'Consequences',
      status: 'ok',
      summary:
        'Accepting this draft only moves the project toward human ADR review; live execution remains disabled.',
      items: [
        reportItem('liveExecution', 'false'),
        reportItem('externalProcessStarted', 'false'),
        reportItem('executionDisabled', 'true'),
        reportItem('nextRound', 'Round 3N Live Adapter ADR / Go-No-Go Review'),
      ],
      refIds: [governancePackage.id],
    }),
    createLiveAdapterAdrDraftSection({
      dryRunId: input.dryRunId,
      kind: 'next_review_steps',
      title: 'Next Review Steps',
      status: governancePackage.blockers.length > 0 ? 'blocked' : 'ok',
      summary: governancePackage.handoff.recommendedNextStep,
      items: [
        reportItem('resolveBlockers', String(governancePackage.blockers.length > 0)),
        reportItem('reviewerHandoff', governancePackage.handoff.handoffSummary),
        reportItem('separateAdrRequired', 'true'),
      ],
      refIds: [governancePackage.handoff.id],
    }),
  ];
}

function createLiveAdapterAdrDraftSection(input: {
  dryRunId: string;
  kind: CodexExecLiveAdapterAdrDraftSectionKind;
  title: string;
  status: CodexExecLiveAdapterAdrDraftSection['status'];
  summary: string;
  items?: CodexExecLiveAdapterAdrDraftSection['items'];
  refIds?: string[];
  hashes?: string[];
}): CodexExecLiveAdapterAdrDraftSection {
  return {
    id: foundationId('codex_live_adapter_adr_draft_section'),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: foundationTimestamp(),
    kind: input.kind,
    title: input.title,
    status: input.status,
    summary: input.summary,
    items: input.items ?? [],
    refIds: input.refIds ?? [],
    hashes: input.hashes ?? [],
    recommendationGrantsExecution: false,
    metadataOnly: true,
    bodyStored: false,
    draftOnly: true,
    liveExecution: false,
    externalProcessStarted: false,
    executionDisabled: true,
    metadata: createControlPlaneMetadata({
      dryRunPlanId: input.dryRunId,
      adrDraftSection: input.kind,
      recommendationGrantsExecution: false,
      draftOnly: true,
    }),
  };
}

function createLiveAdapterAdrDraftSummary(input: {
  dryRunId: string;
  title: string;
  status: CodexExecLiveAdapterAdrDraftStatus;
  governancePackage: CodexExecGovernanceReviewPackage;
  sections: CodexExecLiveAdapterAdrDraftSection[];
}): CodexExecLiveAdapterAdrDraftSummary {
  return {
    id: foundationId('codex_live_adapter_adr_draft_summary'),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: foundationTimestamp(),
    dryRunId: input.dryRunId,
    status: input.status,
    title: input.title,
    sectionCount: input.sections.length,
    governancePackageStatus: input.governancePackage.status,
    riskClassification: input.governancePackage.riskClassification,
    recommendation: input.governancePackage.recommendation,
    recommendationGrantsExecution: false,
    blockerCount: input.governancePackage.blockers.length,
    readinessPassedCount: input.governancePackage.adrReadinessChecklist.filter(
      (item) => item.status === 'passed',
    ).length,
    readinessFailedCount: input.governancePackage.adrReadinessChecklist.filter(
      (item) => item.status === 'failed',
    ).length,
    metadataOnly: true,
    bodyStored: false,
    draftOnly: true,
    liveExecution: false,
    externalProcessStarted: false,
    executionDisabled: true,
    metadata: createControlPlaneMetadata({
      dryRunPlanId: input.dryRunId,
      status: input.status,
      governancePackageStatus: input.governancePackage.status,
      recommendationGrantsExecution: false,
      draftOnly: true,
    }),
  };
}

function createLiveAdapterAdrDraftExportResult(
  draft: CodexExecLiveAdapterAdrDraft,
  format: CodexExecLiveAdapterAdrDraftFormat,
  renderedContent: string,
): CodexExecLiveAdapterAdrDraftExportResult {
  return {
    id: foundationId('codex_live_adapter_adr_draft_export'),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: foundationTimestamp(),
    dryRunId: draft.dryRunId,
    format,
    status: draft.status,
    draft: {
      ...draft,
      format,
    },
    renderedContent,
    renderedContentHash: prefixedHash(renderedContent),
    renderedContentLength: renderedContent.length,
    recommendationGrantsExecution: false,
    metadataOnly: true,
    bodyStored: false,
    sourceBodyStored: false,
    draftOnly: true,
    liveExecution: false,
    externalProcessStarted: false,
    executionDisabled: true,
    metadata: createControlPlaneMetadata({
      dryRunPlanId: draft.dryRunId,
      adrDraftId: draft.id,
      format,
      recommendationGrantsExecution: false,
      draftOnly: true,
    }),
  };
}

function statusForAdrDraft(
  governancePackage: CodexExecGovernanceReviewPackage,
  degraded: boolean,
): CodexExecLiveAdapterAdrDraftStatus {
  if (governancePackage.status === 'not_found') {
    return 'not_found';
  }

  if (degraded || governancePackage.status === 'degraded') {
    return 'degraded';
  }

  if (
    governancePackage.status === 'blocked' ||
    governancePackage.status === 'no_go' ||
    governancePackage.recommendation === 'no_go' ||
    governancePackage.recommendation === 'needs_changes' ||
    governancePackage.blockers.length > 0
  ) {
    return 'blocked';
  }

  if (
    governancePackage.recommendation === 'ready_for_adr' ||
    governancePackage.recommendation === 'ready_for_read_only_live_review'
  ) {
    return 'ready_for_review';
  }

  return 'found';
}

function createGovernanceReviewPackageQuery(input: {
  dryRunId: string;
  includeEvidence: boolean;
  includeAudit: boolean;
}): CodexExecGovernanceReviewPackageQuery {
  return {
    id: foundationId('codex_governance_package_query'),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: foundationTimestamp(),
    dryRunId: input.dryRunId,
    includeEvidence: input.includeEvidence,
    includeAudit: input.includeAudit,
    recommendationGrantsExecution: false,
    metadataOnly: true,
    bodyStored: false,
    liveExecution: false,
    externalProcessStarted: false,
    executionDisabled: true,
    metadata: createControlPlaneMetadata({
      dryRunPlanId: input.dryRunId,
      includeEvidence: input.includeEvidence,
      includeAudit: input.includeAudit,
      recommendationGrantsExecution: false,
    }),
  };
}

function createAdrReadinessChecklistItem(input: {
  code: string;
  label: string;
  status: CodexExecAdrReadinessChecklistItem['status'];
  summary: string;
  sourceSection?: CodexExecGovernanceReviewPackageSection;
  required?: boolean;
}): CodexExecAdrReadinessChecklistItem {
  return {
    id: foundationId('codex_adr_readiness_check'),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: foundationTimestamp(),
    code: input.code,
    label: input.label,
    status: input.status,
    required: input.required ?? true,
    summary: input.summary,
    sourceSection: input.sourceSection,
    recommendationGrantsExecution: false,
    metadataOnly: true,
    bodyStored: false,
    liveExecution: false,
    externalProcessStarted: false,
    executionDisabled: true,
    metadata: createControlPlaneMetadata({
      checklistCode: input.code,
      sourceSection: input.sourceSection,
      recommendationGrantsExecution: false,
    }),
  };
}

function createGovernanceBlockers(input: {
  dryRunId: string;
  report: CodexExecControlPlaneReport;
  reviewHistory: CodexExecReportReviewHistoryView;
  adrReadinessChecklist: CodexExecAdrReadinessChecklistItem[];
  degraded?: boolean;
  reason?: string;
}): CodexExecGovernanceBlocker[] {
  const blockers = input.adrReadinessChecklist
    .filter((item) => item.status === 'failed')
    .map((item) =>
      createGovernanceBlocker({
        dryRunId: input.dryRunId,
        severity: severityForReadinessCheck(item.code),
        code: item.code,
        summary: item.summary,
        sourceSection: item.sourceSection,
        recommendedResolution: resolutionForReadinessCheck(item.code),
      }),
    );

  if (input.report.status === 'not_found') {
    blockers.push(
      createGovernanceBlocker({
        dryRunId: input.dryRunId,
        severity: 'high',
        code: 'governance_report_not_found',
        summary: 'Governance package cannot be ADR-ready without a control-plane report.',
        sourceSection: 'report',
        recommendedResolution: 'Create a dry-run and read-only report before ADR readiness review.',
      }),
    );
  }

  if (input.degraded) {
    blockers.push(
      createGovernanceBlocker({
        dryRunId: input.dryRunId,
        severity: 'medium',
        code: 'governance_package_degraded',
        summary: input.reason ?? 'Governance package was built from degraded control-plane data.',
        sourceSection: 'risks',
        recommendedResolution: 'Resolve degraded state before using this package for ADR review.',
      }),
    );
  }

  if (!input.reviewHistory.latestReview) {
    blockers.push(
      createGovernanceBlocker({
        dryRunId: input.dryRunId,
        severity: 'medium',
        code: 'governance_latest_review_missing',
        summary: 'Latest report review is missing.',
        sourceSection: 'report_review',
        recommendedResolution: 'Create a non-executing report review record before ADR review.',
      }),
    );
  }

  return dedupeGovernanceBlockers(blockers);
}

function createGovernanceBlocker(input: {
  dryRunId: string;
  severity: CodexExecReportRiskClassification;
  code: string;
  summary: string;
  sourceSection?: CodexExecGovernanceReviewPackageSection;
  recommendedResolution: string;
}): CodexExecGovernanceBlocker {
  return {
    id: foundationId('codex_governance_blocker'),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: foundationTimestamp(),
    severity: input.severity,
    code: input.code,
    summary: input.summary,
    sourceSection: input.sourceSection,
    recommendedResolution: input.recommendedResolution,
    recommendationGrantsExecution: false,
    metadataOnly: true,
    bodyStored: false,
    liveExecution: false,
    externalProcessStarted: false,
    executionDisabled: true,
    metadata: createControlPlaneMetadata({
      dryRunPlanId: input.dryRunId,
      blockerCode: input.code,
      sourceSection: input.sourceSection,
      recommendationGrantsExecution: false,
    }),
  };
}

function dedupeGovernanceBlockers(
  blockers: CodexExecGovernanceBlocker[],
): CodexExecGovernanceBlocker[] {
  const seen = new Set<string>();

  return blockers.filter((blocker) => {
    if (seen.has(blocker.code)) {
      return false;
    }

    seen.add(blocker.code);
    return true;
  });
}

function severityForReadinessCheck(code: string): CodexExecReportRiskClassification {
  if (code === 'dry_run_available' || code === 'no_live_boundary_confirmed') {
    return 'high';
  }

  return 'medium';
}

function resolutionForReadinessCheck(code: string): string {
  switch (code) {
    case 'dry_run_available':
      return 'Create a disabled dry-run record before ADR review.';
    case 'report_review_available':
      return 'Create a non-executing report review record.';
    case 'review_history_available':
      return 'Create report review history before comparing ADR readiness.';
    case 'no_live_boundary_confirmed':
      return 'Restore no-live flags before any ADR readiness review.';
    default:
      return 'Complete the missing read-only governance evidence.';
  }
}

function recommendationForGovernancePackage(
  riskClassification: CodexExecReportRiskClassification,
  blockers: CodexExecGovernanceBlocker[],
): CodexExecReportRecommendation {
  if (
    riskClassification === 'critical' ||
    blockers.some((blocker) => blocker.severity === 'critical' || blocker.severity === 'high')
  ) {
    return 'no_go';
  }

  if (riskClassification === 'high' || blockers.length > 0) {
    return 'needs_changes';
  }

  return 'ready_for_adr';
}

function statusForGovernancePackage(
  report: CodexExecControlPlaneReport,
  blockers: CodexExecGovernanceBlocker[],
  recommendation: CodexExecReportRecommendation,
): CodexExecGovernanceReviewPackageStatus {
  if (report.status === 'not_found') {
    return 'not_found';
  }

  if (blockers.some((blocker) => blocker.severity === 'critical' || blocker.severity === 'high')) {
    return 'blocked';
  }

  if (recommendation === 'no_go') {
    return 'no_go';
  }

  if (recommendation === 'needs_changes') {
    return 'needs_changes';
  }

  if (recommendation === 'ready_for_adr') {
    return 'ready_for_adr';
  }

  return 'degraded';
}

function createGovernanceReviewPackageSummary(input: {
  dryRunId: string;
  status: CodexExecGovernanceReviewPackageStatus;
  riskClassification: CodexExecReportRiskClassification;
  recommendation: CodexExecReportRecommendation;
  adrReadinessChecklist: CodexExecAdrReadinessChecklistItem[];
  blockers: CodexExecGovernanceBlocker[];
  noLiveEvidence: CodexExecNoLiveEvidenceSummary;
  reviewHistory: CodexExecReportReviewHistoryView;
  report: CodexExecControlPlaneReport;
  handoff: CodexExecReviewerHandoffSummary;
}): CodexExecGovernanceReviewPackageSummary {
  return {
    id: foundationId('codex_governance_package_summary'),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: foundationTimestamp(),
    dryRunId: input.dryRunId,
    status: input.status,
    riskClassification: input.riskClassification,
    recommendation: input.recommendation,
    recommendationGrantsExecution: false,
    checklistPassedCount: input.adrReadinessChecklist.filter((item) => item.status === 'passed')
      .length,
    checklistWarningCount: input.adrReadinessChecklist.filter((item) => item.status === 'warning')
      .length,
    checklistFailedCount: input.adrReadinessChecklist.filter((item) => item.status === 'failed')
      .length,
    blockerCount: input.blockers.length,
    unresolvedBlockerCount: input.blockers.length,
    evidenceRefCount: input.noLiveEvidence.evidenceRefCount,
    auditEventCount: input.noLiveEvidence.auditEventCount,
    latestReviewId: input.reviewHistory.latestReview?.reviewId,
    reportId: input.report.id,
    handoffId: input.handoff.id,
    metadataOnly: true,
    bodyStored: false,
    liveExecution: false,
    externalProcessStarted: false,
    executionDisabled: true,
    metadata: createControlPlaneMetadata({
      dryRunPlanId: input.dryRunId,
      status: input.status,
      recommendation: input.recommendation,
      blockerCount: input.blockers.length,
      recommendationGrantsExecution: false,
    }),
  };
}

function evaluateReportChecklistCode(
  code: string,
  report: CodexExecControlPlaneReport | undefined,
): { status: CodexExecReportReviewChecklistItem['status']; summary: string } {
  if (!report) {
    return {
      status: 'failed',
      summary: 'Report is not available for review.',
    };
  }

  const sectionKinds = new Set(report.sections.map((section) => section.kind));
  const reportJson = JSON.stringify(report).toLowerCase();

  switch (code) {
    case 'report_has_required_sections': {
      const missing = reportSectionOrder.filter((kind) => !sectionKinds.has(kind));
      return missing.length === 0
        ? { status: 'passed', summary: 'All required report sections are present.' }
        : { status: 'failed', summary: `Missing report sections: ${missing.join(', ')}` };
    }
    case 'no_live_flags_present':
      return report.liveExecution === false &&
        report.externalProcessStarted === false &&
        report.executionDisabled === true &&
        report.sections.every(
          (section) =>
            section.liveExecution === false &&
            section.externalProcessStarted === false &&
            section.executionDisabled === true,
        )
        ? { status: 'passed', summary: 'No-live flags are present across report sections.' }
        : { status: 'failed', summary: 'One or more no-live flags are missing or unsafe.' };
    case 'no_prompt_body_exposed': {
      const dryRun = report.sections.find((section) => section.kind === 'dry_run');
      const allowedPromptLabels = new Set([
        'promptSummary',
        'promptHash',
        'promptLength',
        'promptBodyStored',
      ]);
      const dryRunPromptFieldsAreSafe =
        dryRun?.items
          .filter((item) => item.label.toLowerCase().startsWith('prompt'))
          .every((item) => allowedPromptLabels.has(item.label)) ?? false;

      return report.bodyStored === false &&
        report.sections.every((section) => section.bodyStored === false) &&
        dryRunPromptFieldsAreSafe
        ? { status: 'passed', summary: 'Prompt data is limited to summary, hash, and length.' }
        : { status: 'failed', summary: 'Prompt body exposure risk detected.' };
    }
    case 'no_command_body_exposed':
      return report.bodyStored === false &&
        report.sections.every((section) => section.bodyStored === false) &&
        !reportJson.includes('"commandbody"') &&
        !reportJson.includes('"stdout"') &&
        !reportJson.includes('"stderr"')
        ? { status: 'passed', summary: 'Command data is limited to redacted summaries.' }
        : { status: 'failed', summary: 'Command body exposure risk detected.' };
    case 'evidence_is_hash_only': {
      const evidence = report.sections.find((section) => section.kind === 'evidence');
      return evidence?.bodyStored === false && evidence?.metadataOnly === true
        ? { status: 'passed', summary: 'Evidence section is metadata/hash-only.' }
        : { status: 'failed', summary: 'Evidence section is missing or not metadata-only.' };
    }
    case 'audit_is_metadata_only': {
      const audit = report.sections.find((section) => section.kind === 'audit');
      return audit?.bodyStored === false && audit?.metadataOnly === true
        ? { status: 'passed', summary: 'Audit section is metadata-only.' }
        : { status: 'failed', summary: 'Audit section is missing or not metadata-only.' };
    }
    case 'approval_state_present': {
      const approval = report.sections.find((section) => section.kind === 'approval');
      return approval?.status === 'ok'
        ? { status: 'passed', summary: 'Approval state is present in the report.' }
        : { status: 'warning', summary: 'Approval state is not present in the report.' };
    }
    case 'gate_status_present': {
      const gate = report.sections.find((section) => section.kind === 'gate');
      return gate?.status === 'ok'
        ? { status: 'passed', summary: 'Gate status is present in the report.' }
        : { status: 'warning', summary: 'Gate status has not been evaluated yet.' };
    }
    case 'no_dashboard_execution_affordance':
      return {
        status: 'passed',
        summary: 'Dashboard review surface is expected to remain read-only.',
      };
    case 'live_adapter_requires_separate_adr': {
      const recommendations = report.sections.find((section) => section.kind === 'recommendations');
      const recommendationText = `${recommendations?.summary ?? ''} ${recommendations?.items
        .map((item) => item.value)
        .join(' ')}`;

      return recommendationText.toLowerCase().includes('adr')
        ? {
            status: 'passed',
            summary: 'Report recommends a separate ADR before live adapter work.',
          }
        : { status: 'failed', summary: 'ADR requirement is missing from recommendations.' };
    }
    default:
      return { status: 'warning', summary: `Unknown checklist code ${code}.` };
  }
}

function createReportReviewChecklistItem(
  definition: {
    code: string;
    label: string;
    relatedSection?: CodexExecControlPlaneReportSectionKind;
  },
  result: { status: CodexExecReportReviewChecklistItem['status']; summary: string },
): CodexExecReportReviewChecklistItem {
  return {
    id: foundationId('codex_report_review_check'),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: foundationTimestamp(),
    code: definition.code,
    label: definition.label,
    status: result.status,
    required: true,
    summary: result.summary,
    relatedSection: definition.relatedSection,
    metadataOnly: true,
    bodyStored: false,
    liveExecution: false,
    externalProcessStarted: false,
    executionDisabled: true,
    metadata: createControlPlaneMetadata({
      checklistCode: definition.code,
      relatedSection: definition.relatedSection,
    }),
  };
}

function createChecklistFindings(
  checklistItems: CodexExecReportReviewChecklistItem[],
): CodexExecReportReviewFinding[] {
  return checklistItems
    .filter((item) => item.status === 'failed')
    .map((item) => ({
      id: foundationId('codex_report_review_finding'),
      schemaVersion: SchemaVersionSchema.value,
      createdAt: foundationTimestamp(),
      severity: item.code === 'report_has_required_sections' ? 'high' : 'medium',
      code: item.code,
      summary: item.summary,
      relatedSection: item.relatedSection,
      recommendation: findingRecommendationForChecklistCode(item.code),
      metadataOnly: true,
      bodyStored: false,
      liveExecution: false,
      externalProcessStarted: false,
      executionDisabled: true,
      metadata: createControlPlaneMetadata({
        checklistCode: item.code,
        relatedSection: item.relatedSection,
      }),
    }));
}

function findingRecommendationForChecklistCode(code: string): string {
  if (code === 'report_has_required_sections') {
    return 'Regenerate the read-only report before continuing review.';
  }

  if (code === 'live_adapter_requires_separate_adr') {
    return 'Document the live adapter ADR requirement before any execution-path discussion.';
  }

  return 'Review the report summary and request changes before any later ADR review.';
}

function recommendationForReview(
  riskClassification: CodexExecReportRiskClassification,
  checklistItems: CodexExecReportReviewChecklistItem[],
  report: CodexExecControlPlaneReport | undefined,
): CodexExecReportRecommendation {
  if (!report || riskClassification === 'critical' || riskClassification === 'high') {
    return 'no_go';
  }

  if (checklistItems.some((item) => item.status === 'failed')) {
    return 'needs_changes';
  }

  if (checklistItems.some((item) => item.status === 'warning')) {
    return 'ready_for_adr';
  }

  return 'ready_for_read_only_live_review';
}

function hashCodexExecControlPlaneReport(report: CodexExecControlPlaneReport): string {
  return prefixedHash(
    stableStringify({
      id: report.id,
      dryRunId: report.dryRunId,
      status: report.status,
      summary: report.summary,
      sectionHashes: report.sections.map(hashCodexExecControlPlaneReportSection),
      metadataOnly: report.metadataOnly,
      bodyStored: report.bodyStored,
      liveExecution: report.liveExecution,
      externalProcessStarted: report.externalProcessStarted,
      executionDisabled: report.executionDisabled,
    }),
  );
}

function hashCodexExecControlPlaneReportSection(
  section: CodexExecControlPlaneReportSection,
): string {
  return prefixedHash(
    stableStringify({
      kind: section.kind,
      status: section.status,
      summary: section.summary,
      refIds: section.refIds,
      hashes: section.hashes,
      metadataOnly: section.metadataOnly,
      bodyStored: section.bodyStored,
      liveExecution: section.liveExecution,
      externalProcessStarted: section.externalProcessStarted,
      executionDisabled: section.executionDisabled,
    }),
  );
}

function maxRisk(
  left: CodexExecReportRiskClassification | undefined,
  right: CodexExecReportRiskClassification,
): CodexExecReportRiskClassification {
  if (!left) {
    return right;
  }

  const order: CodexExecReportRiskClassification[] = ['low', 'medium', 'high', 'critical'];
  return order.indexOf(right) > order.indexOf(left) ? right : left;
}

function dedupeReviewFindings(
  findings: CodexExecReportReviewFinding[],
): CodexExecReportReviewFinding[] {
  const seen = new Set<string>();
  const deduped: CodexExecReportReviewFinding[] = [];

  for (const finding of findings) {
    if (!seen.has(finding.code)) {
      seen.add(finding.code);
      deduped.push(finding);
    }
  }

  return deduped;
}

function createReportReviewHistoryQuery(
  query: Partial<CodexExecReportReviewHistoryQuery>,
): CodexExecReportReviewHistoryQuery {
  return {
    id: foundationId('codex_report_review_history_query'),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: foundationTimestamp(),
    dryRunId: query.dryRunId,
    status: query.status,
    recommendation: query.recommendation,
    limit: query.limit ?? 20,
    recommendationGrantsExecution: false,
    metadataOnly: true,
    bodyStored: false,
    liveExecution: false,
    externalProcessStarted: false,
    executionDisabled: true,
    metadata: createControlPlaneMetadata({
      dryRunPlanId: query.dryRunId,
      recommendationGrantsExecution: false,
    }),
  };
}

function filterReportReviews(
  records: CodexExecReportReviewRecord[],
  query: Partial<CodexExecReportReviewQuery>,
): CodexExecReportReviewRecord[] {
  return records.filter((record) => {
    if (query.dryRunId && record.dryRunId !== query.dryRunId) {
      return false;
    }

    if (query.status && record.status !== query.status) {
      return false;
    }

    if (query.recommendation && record.recommendation !== query.recommendation) {
      return false;
    }

    return true;
  });
}

function sortReportReviewsNewestFirst(
  records: CodexExecReportReviewRecord[],
): CodexExecReportReviewRecord[] {
  return [...records].sort((left, right) => {
    const byReviewedAt = right.reviewedAt.localeCompare(left.reviewedAt);
    return byReviewedAt !== 0 ? byReviewedAt : right.createdAt.localeCompare(left.createdAt);
  });
}

function createReportReviewComparisonItem(
  field: string,
  leftValue: string | number,
  rightValue: string | number,
): CodexExecReportReviewComparisonItem {
  const leftValueSummary = String(leftValue);
  const rightValueSummary = String(rightValue);

  return {
    id: foundationId('codex_report_review_comparison_item'),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: foundationTimestamp(),
    field,
    leftValueSummary,
    rightValueSummary,
    changed: leftValueSummary !== rightValueSummary,
    metadataOnly: true,
    bodyStored: false,
    liveExecution: false,
    externalProcessStarted: false,
    executionDisabled: true,
    metadata: createControlPlaneMetadata({
      comparisonField: field,
      changed: leftValueSummary !== rightValueSummary,
    }),
  };
}

function summarizeHashList(values: string[]): string {
  return values.length > 0
    ? `${values.length} hashes ${prefixedHash(stableStringify(values))}`
    : '0 hashes';
}

function summarizeChecklistStatuses(items: CodexExecReportReviewChecklistItem[]): string {
  return items.length > 0
    ? items
        .map((item) => `${item.code}:${item.status}`)
        .sort()
        .join(', ')
    : 'none';
}

function summarizeFindingCodes(findings: CodexExecReportReviewFinding[]): string {
  return findings.length > 0
    ? findings
        .map((finding) => `${finding.code}:${finding.severity}`)
        .sort()
        .join(', ')
    : 'none';
}

function createReviewerHandoffSummary(
  reviewCount: number,
  options: CodexExecReviewerHandoffOptions,
): string {
  const from = options.fromReviewer ?? 'current reviewer';
  const to = options.toReviewer ?? 'next reviewer';
  return `${from} can hand off ${reviewCount} metadata-only report review records to ${to}; this does not grant execution.`;
}

function recommendedNextStepForReportReview(record: CodexExecReportReviewRecord): string {
  if (record.recommendation === 'no_go' || record.status === 'rejected') {
    return 'Stop and resolve review findings before any later ADR review.';
  }

  if (record.recommendation === 'needs_changes' || record.status === 'changes_requested') {
    return 'Apply review feedback and create a new read-only report review record.';
  }

  if (record.recommendation === 'ready_for_adr') {
    return 'Prepare a separate ADR; this review recommendation does not grant execution.';
  }

  return 'Continue read-only live-review preparation only after a separate ADR.';
}

export function createDefaultCodexExecLiveConfig(): CodexExecLiveConfig {
  return {
    id: foundationId('codex_live_config'),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: foundationTimestamp(),
    liveEnabled: false,
    allowedSandboxModes: ['read_only'],
    forbiddenSandboxModes: ['danger_full_access'],
    requiresApproval: true,
    requiresIsolatedWorktreeForWorkspaceWrite: true,
    approvalTtlMinutes: 30,
    singleUseApprovals: true,
    configSource: 'default',
    configBodyStored: false,
    liveExecution: false,
    externalProcessStarted: false,
    executionDisabled: true,
    metadata: {
      source: 'codex-kernel.control-plane',
      defaultDisabled: true,
    },
  };
}

export function createDefaultCodexExecConfigLoadResult(): CodexExecConfigLoadResult {
  const config = createDefaultCodexExecLiveConfig();

  return {
    id: foundationId('codex_config_load'),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: foundationTimestamp(),
    source: 'default',
    status: 'defaulted',
    config,
    errors: [],
    summary: 'Using default disabled Codex control-plane config',
    liveExecution: false,
    externalProcessStarted: false,
    executionDisabled: true,
    metadata: createControlPlaneMetadata({ configId: config.id, sourceKind: 'default' }),
  };
}

export function parseCodexExecLiveConfigFile(
  input: CodexExecConfigFileInput,
): CodexExecConfigLoadResult {
  const defaultConfig = createDefaultCodexExecLiveConfig();
  const configFile = createCodexExecConfigFile(input.configPath, input.fileText, input.metadata);
  const parsed = parseSimpleCodexConfig(input.fileText);
  const config = CodexExecLiveConfigSchema.parse({
    ...defaultConfig,
    ...parsed.values,
    id: foundationId('codex_live_config'),
    createdAt: foundationTimestamp(),
    configSource: 'file',
    configPath: input.configPath,
    configPathHash: prefixedHash(input.configPath),
    configBodyStored: false,
    liveExecution: false,
    externalProcessStarted: false,
    executionDisabled: true,
    metadata: {
      source: 'codex-kernel.config-file',
      defaultDisabled: parsed.values.liveEnabled !== true,
      parsedKeyCount: parsed.keyCount,
    },
  });
  const status = parsed.errors.length === 0 ? 'loaded' : 'failed';

  return {
    id: foundationId('codex_config_load'),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: foundationTimestamp(),
    source: 'file',
    status,
    config: status === 'loaded' ? config : defaultConfig,
    configFile,
    errors: parsed.errors,
    summary:
      status === 'loaded'
        ? `Loaded Codex control-plane config from ${input.configPath}`
        : 'Config file parsing failed; default disabled config is active',
    liveExecution: false,
    externalProcessStarted: false,
    executionDisabled: true,
    metadata: createControlPlaneMetadata({
      configFileId: configFile.id,
      configPathHash: configFile.configPathHash,
      status,
    }),
  };
}

export function evaluateCodexExecLiveCapability(
  config: CodexExecLiveConfig,
): CodexExecLiveCapabilityState {
  const reasons = config.liveEnabled
    ? ['live adapter can proceed to policy gate checks']
    : ['live adapter disabled by configuration'];

  return {
    id: foundationId('codex_live_capability'),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: foundationTimestamp(),
    liveEnabled: config.liveEnabled,
    enabled: config.liveEnabled,
    status: config.liveEnabled ? 'available' : 'disabled',
    allowedSandboxModes: config.allowedSandboxModes,
    forbiddenSandboxModes: config.forbiddenSandboxModes,
    reasons,
    metadata: { configId: config.id },
  };
}

export function runCodexExecPreflight(
  plan: CodexExecDryRunPlan,
  config: CodexExecLiveConfig,
  options: CodexExecPreflightOptions = {},
): CodexExecPreflightResult {
  const dryRunPlanHash = hashCodexExecDryRunPlan(plan);
  const worktreeRequirement = createWorktreeRequirement(plan, config, options);
  const checks: CodexExecPreflightCheck[] = [
    createPreflightCheck(
      'live-config',
      config.liveEnabled ? 'passed' : 'failed',
      config.liveEnabled ? 'live adapter enabled in config' : 'live adapter disabled in config',
    ),
    createPreflightCheck(
      'sandbox-allowlist',
      config.allowedSandboxModes.includes(plan.sandboxMode) ? 'passed' : 'failed',
      `sandbox mode ${plan.sandboxMode} is ${
        config.allowedSandboxModes.includes(plan.sandboxMode) ? 'allowed' : 'not allowed'
      }`,
    ),
    createPreflightCheck(
      'sandbox-forbidden-list',
      config.forbiddenSandboxModes.includes(plan.sandboxMode) ? 'failed' : 'passed',
      config.forbiddenSandboxModes.includes(plan.sandboxMode)
        ? `sandbox mode ${plan.sandboxMode} is forbidden`
        : `sandbox mode ${plan.sandboxMode} is not forbidden`,
    ),
    createPreflightCheck(
      'isolated-worktree',
      worktreeRequirement.status === 'missing' ? 'failed' : 'passed',
      worktreeRequirement.summary,
    ),
  ];
  const status = checks.some((check) => check.status === 'failed') ? 'blocked' : 'passed';

  return {
    id: foundationId('codex_preflight'),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: foundationTimestamp(),
    dryRunPlanId: plan.id,
    dryRunPlanHash,
    configId: config.id,
    status,
    checks,
    worktreeRequirement,
    summary: status === 'passed' ? 'Preflight checks passed' : 'Preflight checks blocked execution',
    liveExecution: false,
    externalProcessStarted: false,
    executionDisabled: true,
    metadata: {
      sandboxMode: plan.sandboxMode,
      liveEnabled: config.liveEnabled,
      source: 'codex-kernel.control-plane',
    },
  };
}

export function createCodexExecApprovalArtifact(
  plan: CodexExecDryRunPlan,
  policyDecision: PolicyDecision,
  options: {
    expiresAt?: string;
    singleUse?: boolean;
    summary?: string;
    metadata?: Record<string, unknown>;
  } = {},
): CodexExecApprovalArtifact {
  const expiresAt = options.expiresAt ?? new Date(Date.now() + 30 * 60 * 1000).toISOString();

  return {
    id: foundationId('codex_approval_artifact'),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: foundationTimestamp(),
    dryRunPlanId: plan.id,
    dryRunPlanHash: hashCodexExecDryRunPlan(plan),
    policyDecisionId: policyDecision.id,
    policyDecisionHash: hashCodexExecPolicyDecision(policyDecision),
    scope: approvalScopeForSandboxMode(plan.sandboxMode),
    status: 'approved',
    expiresAt,
    singleUse: options.singleUse ?? true,
    revoked: false,
    summary: options.summary ?? `Approval artifact for ${plan.title} (${plan.sandboxMode})`,
    liveExecution: false,
    externalProcessStarted: false,
    executionDisabled: true,
    metadata: {
      dryRunPlanId: plan.id,
      policyDecisionId: policyDecision.id,
      ...(options.metadata ?? {}),
      source: 'codex-kernel.control-plane',
    },
  };
}

export function createCodexExecManualApprovalRequest(
  plan: CodexExecDryRunPlan,
  policyDecision: PolicyDecision,
  config: CodexExecLiveConfig = createDefaultCodexExecLiveConfig(),
  input: CodexExecManualApprovalRequestInput = {},
): CodexExecManualApprovalRequest {
  const expiresAt =
    input.expiresAt ?? new Date(Date.now() + config.approvalTtlMinutes * 60 * 1000).toISOString();

  return {
    id: foundationId('codex_approval_request'),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: foundationTimestamp(),
    dryRunPlanId: plan.id,
    dryRunPlanHash: hashCodexExecDryRunPlan(plan),
    policyDecisionId: policyDecision.id,
    policyDecisionHash: hashCodexExecPolicyDecision(policyDecision),
    scope: approvalScopeForSandboxMode(plan.sandboxMode),
    status: 'pending',
    riskLevel: plan.riskLevel,
    requestedBy: input.requestedBy ?? 'local-human',
    reason: summarizeReason(input.reason ?? `Review ${plan.title}`, 'approval request reason'),
    expiresAt,
    singleUse: config.singleUseApprovals,
    summary: `Manual approval requested for ${plan.title}`,
    liveExecution: false,
    externalProcessStarted: false,
    executionDisabled: true,
    metadata: createControlPlaneMetadata({
      dryRunPlanId: plan.id,
      policyDecisionId: policyDecision.id,
      configId: config.id,
    }),
  };
}

export function createCodexExecManualApprovalDecision(
  request: CodexExecManualApprovalRequest,
  input: CodexExecManualApprovalDecisionInput,
): CodexExecManualApprovalDecision {
  const reasonSummary = summarizeReason(
    input.reason ?? `${input.outcome} by local review`,
    'approval decision reason',
  );
  const approved = input.outcome === 'approved';
  const decisionHash = prefixedHash(
    stableStringify({
      approvalRequestId: request.id,
      dryRunPlanHash: request.dryRunPlanHash,
      policyDecisionHash: request.policyDecisionHash,
      outcome: input.outcome,
      reasonSummary,
    }),
  );

  return {
    id: foundationId('codex_approval_decision'),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: foundationTimestamp(),
    approvalRequestId: request.id,
    dryRunPlanId: request.dryRunPlanId,
    policyDecisionId: request.policyDecisionId,
    outcome: input.outcome,
    decidedBy: input.decidedBy ?? 'local-human',
    reasonSummary,
    decisionHash,
    approved,
    summary: `Manual approval ${input.outcome} for request ${request.id}`,
    liveExecution: false,
    externalProcessStarted: false,
    executionDisabled: true,
    metadata: createControlPlaneMetadata({
      approvalRequestId: request.id,
      scope: request.scope,
      riskLevel: request.riskLevel,
    }),
  };
}

export function evaluateCodexExecManualApprovalState(
  record: CodexExecManualApprovalRecord,
  options: CodexExecApprovalStateOptions = {},
): CodexExecManualApprovalState {
  const nowMs = options.now ? Date.parse(options.now) : Date.now();
  const requestExpiresAtMs = Date.parse(record.request.expiresAt);
  const artifactExpiresAtMs = record.approvalArtifact
    ? Date.parse(record.approvalArtifact.expiresAt)
    : undefined;
  const expired =
    requestExpiresAtMs <= nowMs ||
    (artifactExpiresAtMs !== undefined && artifactExpiresAtMs <= nowMs);
  const reasons: string[] = [];
  let status = record.status;

  if (record.decision?.outcome === 'denied') {
    status = 'denied';
    reasons.push('manual approval was denied');
  } else if (
    record.decision?.outcome === 'revoked' ||
    record.approvalArtifact?.revoked ||
    record.approvalArtifact?.status === 'revoked'
  ) {
    status = 'revoked';
    reasons.push('manual approval was revoked');
  } else if (record.approvalArtifact?.status === 'used' || record.approvalArtifact?.usedAt) {
    status = 'used';
    reasons.push('approval artifact is already used');
  } else if (expired && (record.status === 'pending' || record.status === 'approved')) {
    status = 'expired';
    reasons.push('manual approval is expired');
  } else if (
    record.decision?.outcome === 'approved' ||
    record.approvalArtifact?.status === 'approved'
  ) {
    status = 'approved';
    reasons.push('manual approval is approved but live execution remains disabled');
  } else if (status === 'pending') {
    reasons.push('manual approval is awaiting a decision');
  }

  const terminal =
    status === 'denied' || status === 'revoked' || status === 'expired' || status === 'used';
  const canDecide = status === 'pending' && !expired;
  const nextAllowedActions: CodexExecApprovalTransitionAction[] = canDecide
    ? ['approve', 'deny', 'revoke']
    : status === 'approved'
      ? ['revoke']
      : [];

  return {
    id: foundationId('codex_approval_state'),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: foundationTimestamp(),
    approvalRecordId: record.id,
    approvalRequestId: record.request.id,
    dryRunPlanId: record.request.dryRunPlanId,
    dryRunPlanHash: record.request.dryRunPlanHash,
    policyDecisionId: record.request.policyDecisionId,
    policyDecisionHash: record.request.policyDecisionHash,
    status,
    requestedStatus: record.request.status,
    decisionOutcome: record.decision?.outcome,
    artifactStatus: record.approvalArtifact?.status,
    expiresAt: record.approvalArtifact?.expiresAt ?? record.request.expiresAt,
    expired,
    terminal,
    canDecide,
    nextAllowedActions,
    reasons,
    summary: `Manual approval state is ${status} for ${record.request.dryRunPlanId}`,
    liveExecution: false,
    externalProcessStarted: false,
    executionDisabled: true,
    metadata: createControlPlaneMetadata({
      approvalRecordId: record.id,
      approvalRequestId: record.request.id,
      dryRunPlanId: record.request.dryRunPlanId,
    }),
  };
}

export function createCodexExecApprovalTransitionResult(
  record: CodexExecManualApprovalRecord,
  action: CodexExecApprovalTransitionAction,
  options: CodexExecApprovalStateOptions = {},
): CodexExecApprovalTransitionResult {
  const state = evaluateCodexExecManualApprovalState(record, options);
  const allowed = state.nextAllowedActions.includes(action);
  const toStatus = allowed ? approvalStatusForTransitionAction(action) : state.status;
  const reasons = allowed
    ? [`manual approval transition ${action} is allowed`]
    : [
        `manual approval transition ${action} is not allowed from ${state.status}`,
        ...state.reasons,
      ];

  return {
    id: foundationId('codex_approval_transition'),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: foundationTimestamp(),
    approvalRecordId: record.id,
    approvalRequestId: record.request.id,
    dryRunPlanId: record.request.dryRunPlanId,
    action,
    fromStatus: state.status,
    toStatus,
    allowed,
    reasons,
    state,
    summary: allowed
      ? `Manual approval transition ${action} allowed`
      : `Manual approval transition ${action} blocked`,
    liveExecution: false,
    externalProcessStarted: false,
    executionDisabled: true,
    metadata: createControlPlaneMetadata({
      approvalRecordId: record.id,
      approvalRequestId: record.request.id,
      action,
      fromStatus: state.status,
      toStatus,
    }),
  };
}

export function createCodexExecApprovalArtifactFromDecision(
  plan: CodexExecDryRunPlan,
  policyDecision: PolicyDecision,
  request: CodexExecManualApprovalRequest,
  decision: CodexExecManualApprovalDecision,
): CodexExecApprovalArtifact | undefined {
  if (!decision.approved) {
    return undefined;
  }

  return createCodexExecApprovalArtifact(plan, policyDecision, {
    expiresAt: request.expiresAt,
    singleUse: request.singleUse,
    summary: `Manual approval artifact for ${plan.title}`,
    metadata: {
      approvalRequestId: request.id,
      approvalDecisionId: decision.id,
      decisionHash: decision.decisionHash,
    },
  });
}

export function createCodexExecManualApprovalRecord(input: {
  request: CodexExecManualApprovalRequest;
  decision?: CodexExecManualApprovalDecision;
  approvalArtifact?: CodexExecApprovalArtifact;
  evidenceRefs?: EvidenceRef[];
  auditEvents?: AuditEvent[];
}): CodexExecManualApprovalRecord {
  const status = input.decision?.outcome ?? input.request.status;
  const record: CodexExecManualApprovalRecord = {
    id: foundationId('codex_approval_record'),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: foundationTimestamp(),
    request: input.request,
    decision: input.decision,
    approvalArtifact: input.approvalArtifact,
    status,
    evidenceRefs: input.evidenceRefs ?? [],
    auditEventIds: (input.auditEvents ?? []).map((event) => event.id),
    summary: input.decision
      ? `Manual approval ${input.decision.outcome} for ${input.request.dryRunPlanId}`
      : `Manual approval pending for ${input.request.dryRunPlanId}`,
    liveExecution: false,
    externalProcessStarted: false,
    executionDisabled: true,
    metadata: createControlPlaneMetadata({
      approvalRequestId: input.request.id,
      approvalDecisionId: input.decision?.id,
      approvalArtifactId: input.approvalArtifact?.id,
    }),
  };
  const approvalState = evaluateCodexExecManualApprovalState(record);

  return {
    ...record,
    status: approvalState.status,
    approvalState,
    summary: input.decision
      ? `Manual approval ${approvalState.status} for ${input.request.dryRunPlanId}`
      : `Manual approval ${approvalState.status} for ${input.request.dryRunPlanId}`,
  };
}

export function evaluateCodexExecExecutionGate(
  plan: CodexExecDryRunPlan,
  policyDecision: PolicyDecision,
  approvalArtifact: CodexExecApprovalArtifact | undefined,
  config: CodexExecLiveConfig,
): CodexExecExecutionGateResult {
  const dryRunPlanHash = hashCodexExecDryRunPlan(plan);
  const policyDecisionHash = hashCodexExecPolicyDecision(policyDecision);
  const reasons: string[] = [];

  if (!config.liveEnabled) {
    reasons.push('live adapter disabled by configuration');
  }

  if (!config.allowedSandboxModes.includes(plan.sandboxMode)) {
    reasons.push(`sandbox mode ${plan.sandboxMode} is not allowed`);
  }

  if (config.forbiddenSandboxModes.includes(plan.sandboxMode)) {
    reasons.push(`sandbox mode ${plan.sandboxMode} is forbidden`);
  }

  if (plan.sandboxMode === 'danger_full_access') {
    reasons.push('danger_full_access is blocked by default');
  }

  if (policyDecision.outcome === 'deny') {
    reasons.push('policy decision denied the live intent');
  }

  if (plan.sandboxMode === 'workspace_write' && config.requiresIsolatedWorktreeForWorkspaceWrite) {
    const isolatedWorktreePresent = plan.metadata?.isolatedWorktreePresent === true;

    if (!isolatedWorktreePresent) {
      reasons.push('workspace_write requires an isolated worktree');
    }
  }

  if (config.requiresApproval || policyDecision.requiresApproval) {
    if (!approvalArtifact) {
      reasons.push('approval artifact is required');
    } else {
      if (approvalArtifact.dryRunPlanHash !== dryRunPlanHash) {
        reasons.push('approval artifact dry-run hash mismatch');
      }

      if (approvalArtifact.policyDecisionHash !== policyDecisionHash) {
        reasons.push('approval artifact policy hash mismatch');
      }

      if (approvalArtifact.revoked || approvalArtifact.status === 'revoked') {
        reasons.push('approval artifact revoked');
      }

      if (approvalArtifact.status !== 'approved') {
        reasons.push(`approval artifact status ${approvalArtifact.status} is not approved`);
      }

      if (approvalArtifact.status === 'used' || approvalArtifact.usedAt) {
        reasons.push('approval artifact already used');
      }

      if (
        approvalArtifact.status === 'expired' ||
        Date.parse(approvalArtifact.expiresAt) <= Date.now()
      ) {
        reasons.push('approval artifact expired');
      }
    }
  }

  const status = reasons.length === 0 ? 'ready' : 'blocked';

  return {
    id: foundationId('codex_gate'),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: foundationTimestamp(),
    dryRunPlanId: plan.id,
    dryRunPlanHash,
    policyDecisionId: policyDecision.id,
    policyDecisionHash,
    approvalArtifactId: approvalArtifact?.id,
    status,
    reasons,
    liveEnabled: config.liveEnabled,
    allowedSandboxModes: config.allowedSandboxModes,
    summary:
      status === 'ready'
        ? 'Execution gate ready, but this round still does not execute'
        : `Execution gate blocked: ${reasons.join('; ')}`,
    liveExecution: false,
    externalProcessStarted: false,
    executionDisabled: true,
    metadata: {
      sandboxMode: plan.sandboxMode,
      approvalMode: plan.approvalMode,
      source: 'codex-kernel.control-plane',
    },
  };
}

export function createCodexExecControlPlaneEvidenceRefs(input: {
  configLoadResult?: CodexExecConfigLoadResult;
  preflightResult?: CodexExecPreflightResult;
  approvalRequest?: CodexExecManualApprovalRequest;
  approvalDecision?: CodexExecManualApprovalDecision;
  approvalState?: CodexExecManualApprovalState;
  approvalTransition?: CodexExecApprovalTransitionResult;
  approvalArtifact?: CodexExecApprovalArtifact;
  executionGateResult?: CodexExecExecutionGateResult;
}): EvidenceRef[] {
  const evidenceRefs: EvidenceRef[] = [];

  if (input.configLoadResult) {
    evidenceRefs.push(
      createEvidenceRef({
        kind: 'codex.exec.live_config',
        label: 'codex.live_config',
        summary: input.configLoadResult.summary,
        metadata: createControlPlaneMetadata({
          configLoadResultId: input.configLoadResult.id,
          configId: input.configLoadResult.config.id,
          status: input.configLoadResult.status,
          source: input.configLoadResult.source,
        }),
        bodyForHashOnly: stableStringify({
          configLoadResultId: input.configLoadResult.id,
          configId: input.configLoadResult.config.id,
          liveEnabled: input.configLoadResult.config.liveEnabled,
          allowedSandboxModes: input.configLoadResult.config.allowedSandboxModes,
          forbiddenSandboxModes: input.configLoadResult.config.forbiddenSandboxModes,
        }),
      }),
    );
  }

  if (input.preflightResult) {
    evidenceRefs.push(
      createEvidenceRef({
        kind: 'codex.exec.preflight_result',
        label: 'codex.preflight_result',
        summary: input.preflightResult.summary,
        metadata: createControlPlaneMetadata({
          preflightResultId: input.preflightResult.id,
          dryRunPlanId: input.preflightResult.dryRunPlanId,
          status: input.preflightResult.status,
        }),
        bodyForHashOnly: stableStringify({
          id: input.preflightResult.id,
          status: input.preflightResult.status,
          checkStatuses: input.preflightResult.checks.map((check) => [check.name, check.status]),
        }),
      }),
    );
  }

  if (input.approvalRequest) {
    evidenceRefs.push(
      createEvidenceRef({
        kind: 'codex.exec.approval_request',
        label: 'codex.approval_request',
        summary: input.approvalRequest.summary,
        metadata: createControlPlaneMetadata({
          approvalRequestId: input.approvalRequest.id,
          dryRunPlanId: input.approvalRequest.dryRunPlanId,
          status: input.approvalRequest.status,
          riskLevel: input.approvalRequest.riskLevel,
        }),
        bodyForHashOnly: stableStringify({
          approvalRequestId: input.approvalRequest.id,
          dryRunPlanHash: input.approvalRequest.dryRunPlanHash,
          policyDecisionHash: input.approvalRequest.policyDecisionHash,
          scope: input.approvalRequest.scope,
          status: input.approvalRequest.status,
        }),
      }),
    );
  }

  if (input.approvalDecision) {
    evidenceRefs.push(
      createEvidenceRef({
        kind: 'codex.exec.approval_decision',
        label: 'codex.approval_decision',
        summary: input.approvalDecision.summary,
        metadata: createControlPlaneMetadata({
          approvalDecisionId: input.approvalDecision.id,
          approvalRequestId: input.approvalDecision.approvalRequestId,
          dryRunPlanId: input.approvalDecision.dryRunPlanId,
          outcome: input.approvalDecision.outcome,
          approved: input.approvalDecision.approved,
        }),
        bodyForHashOnly: stableStringify({
          approvalDecisionId: input.approvalDecision.id,
          approvalRequestId: input.approvalDecision.approvalRequestId,
          outcome: input.approvalDecision.outcome,
          decisionHash: input.approvalDecision.decisionHash,
        }),
      }),
    );
  }

  if (input.approvalState) {
    evidenceRefs.push(
      createEvidenceRef({
        kind: 'codex.exec.approval_state',
        label: 'codex.approval_state',
        summary: input.approvalState.summary,
        metadata: createControlPlaneMetadata({
          approvalStateId: input.approvalState.id,
          approvalRecordId: input.approvalState.approvalRecordId,
          approvalRequestId: input.approvalState.approvalRequestId,
          dryRunPlanId: input.approvalState.dryRunPlanId,
          status: input.approvalState.status,
          terminal: input.approvalState.terminal,
        }),
        bodyForHashOnly: stableStringify({
          approvalStateId: input.approvalState.id,
          approvalRequestId: input.approvalState.approvalRequestId,
          status: input.approvalState.status,
          canDecide: input.approvalState.canDecide,
          terminal: input.approvalState.terminal,
          nextAllowedActions: input.approvalState.nextAllowedActions,
        }),
      }),
    );
  }

  if (input.approvalTransition) {
    evidenceRefs.push(
      createEvidenceRef({
        kind: 'codex.exec.approval_state',
        label: 'codex.approval_transition',
        summary: input.approvalTransition.summary,
        metadata: createControlPlaneMetadata({
          approvalTransitionId: input.approvalTransition.id,
          approvalRecordId: input.approvalTransition.approvalRecordId,
          approvalRequestId: input.approvalTransition.approvalRequestId,
          dryRunPlanId: input.approvalTransition.dryRunPlanId,
          action: input.approvalTransition.action,
          allowed: input.approvalTransition.allowed,
        }),
        bodyForHashOnly: stableStringify({
          approvalTransitionId: input.approvalTransition.id,
          action: input.approvalTransition.action,
          allowed: input.approvalTransition.allowed,
          fromStatus: input.approvalTransition.fromStatus,
          toStatus: input.approvalTransition.toStatus,
        }),
      }),
    );
  }

  if (input.approvalArtifact) {
    evidenceRefs.push(
      createEvidenceRef({
        kind: 'codex.exec.approval_artifact',
        label: 'codex.approval_artifact',
        summary: input.approvalArtifact.summary,
        metadata: createControlPlaneMetadata({
          approvalArtifactId: input.approvalArtifact.id,
          dryRunPlanId: input.approvalArtifact.dryRunPlanId,
          status: input.approvalArtifact.status,
          singleUse: input.approvalArtifact.singleUse,
          revoked: input.approvalArtifact.revoked,
        }),
        bodyForHashOnly: stableStringify({
          id: input.approvalArtifact.id,
          dryRunPlanHash: input.approvalArtifact.dryRunPlanHash,
          policyDecisionHash: input.approvalArtifact.policyDecisionHash,
          status: input.approvalArtifact.status,
        }),
      }),
    );
  }

  if (input.executionGateResult) {
    evidenceRefs.push(
      createEvidenceRef({
        kind: 'codex.exec.execution_gate_result',
        label: 'codex.execution_gate_result',
        summary: input.executionGateResult.summary,
        metadata: createControlPlaneMetadata({
          executionGateResultId: input.executionGateResult.id,
          dryRunPlanId: input.executionGateResult.dryRunPlanId,
          status: input.executionGateResult.status,
          liveEnabled: input.executionGateResult.liveEnabled,
        }),
        bodyForHashOnly: stableStringify({
          id: input.executionGateResult.id,
          status: input.executionGateResult.status,
          reasons: input.executionGateResult.reasons,
        }),
      }),
    );
  }

  return evidenceRefs;
}

export function createCodexExecControlPlaneAuditEvents(input: {
  configLoadResult?: CodexExecConfigLoadResult;
  preflightResult?: CodexExecPreflightResult;
  approvalRequest?: CodexExecManualApprovalRequest;
  approvalDecision?: CodexExecManualApprovalDecision;
  approvalState?: CodexExecManualApprovalState;
  approvalTransition?: CodexExecApprovalTransitionResult;
  approvalArtifact?: CodexExecApprovalArtifact;
  executionGateResult?: CodexExecExecutionGateResult;
  evidenceRefs?: EvidenceRef[];
}): AuditEvent[] {
  const now = foundationTimestamp();
  const events: AuditEvent[] = [];

  if (input.configLoadResult) {
    events.push({
      id: foundationId('audit'),
      schemaVersion: SchemaVersionSchema.value,
      createdAt: now,
      actor: 'codex-kernel.control-plane',
      action: 'codex.exec.live_config.loaded',
      outcome: input.configLoadResult.status,
      evidenceRefs: (input.evidenceRefs ?? []).filter(
        (ref) => ref.kind === 'codex.exec.live_config',
      ),
      metadata: createControlPlaneMetadata({
        configLoadResultId: input.configLoadResult.id,
        configId: input.configLoadResult.config.id,
      }),
    });
  }

  if (input.preflightResult) {
    events.push({
      id: foundationId('audit'),
      schemaVersion: SchemaVersionSchema.value,
      createdAt: now,
      actor: 'codex-kernel.control-plane',
      action: 'codex.exec.preflight.completed',
      outcome: input.preflightResult.status,
      evidenceRefs: (input.evidenceRefs ?? []).filter(
        (ref) => ref.kind === 'codex.exec.preflight_result',
      ),
      metadata: createControlPlaneMetadata({
        preflightResultId: input.preflightResult.id,
        dryRunPlanId: input.preflightResult.dryRunPlanId,
      }),
    });
  }

  if (input.approvalRequest) {
    events.push({
      id: foundationId('audit'),
      schemaVersion: SchemaVersionSchema.value,
      createdAt: now,
      actor: 'codex-kernel.control-plane',
      action: 'codex.exec.manual_approval.requested',
      outcome: input.approvalRequest.status,
      evidenceRefs: (input.evidenceRefs ?? []).filter(
        (ref) => ref.kind === 'codex.exec.approval_request',
      ),
      metadata: createControlPlaneMetadata({
        approvalRequestId: input.approvalRequest.id,
        dryRunPlanId: input.approvalRequest.dryRunPlanId,
      }),
    });
  }

  if (input.approvalDecision) {
    events.push({
      id: foundationId('audit'),
      schemaVersion: SchemaVersionSchema.value,
      createdAt: now,
      actor: 'codex-kernel.control-plane',
      action: 'codex.exec.manual_approval.decided',
      outcome: input.approvalDecision.outcome,
      evidenceRefs: (input.evidenceRefs ?? []).filter(
        (ref) => ref.kind === 'codex.exec.approval_decision',
      ),
      metadata: createControlPlaneMetadata({
        approvalDecisionId: input.approvalDecision.id,
        approvalRequestId: input.approvalDecision.approvalRequestId,
        approved: input.approvalDecision.approved,
      }),
    });
  }

  if (input.approvalState) {
    events.push({
      id: foundationId('audit'),
      schemaVersion: SchemaVersionSchema.value,
      createdAt: now,
      actor: 'codex-kernel.control-plane',
      action: 'codex.exec.manual_approval.state_evaluated',
      outcome: input.approvalState.status,
      evidenceRefs: (input.evidenceRefs ?? []).filter(
        (ref) => ref.kind === 'codex.exec.approval_state',
      ),
      metadata: createControlPlaneMetadata({
        approvalStateId: input.approvalState.id,
        approvalRecordId: input.approvalState.approvalRecordId,
        approvalRequestId: input.approvalState.approvalRequestId,
        terminal: input.approvalState.terminal,
      }),
    });
  }

  if (input.approvalTransition) {
    events.push({
      id: foundationId('audit'),
      schemaVersion: SchemaVersionSchema.value,
      createdAt: now,
      actor: 'codex-kernel.control-plane',
      action: input.approvalTransition.allowed
        ? 'codex.exec.manual_approval.transition_allowed'
        : 'codex.exec.manual_approval.transition_blocked',
      outcome: input.approvalTransition.allowed ? 'allow' : 'blocked',
      evidenceRefs: (input.evidenceRefs ?? []).filter(
        (ref) => ref.kind === 'codex.exec.approval_state',
      ),
      metadata: createControlPlaneMetadata({
        approvalTransitionId: input.approvalTransition.id,
        approvalRecordId: input.approvalTransition.approvalRecordId,
        approvalRequestId: input.approvalTransition.approvalRequestId,
        action: input.approvalTransition.action,
        allowed: input.approvalTransition.allowed,
      }),
    });
  }

  if (input.approvalArtifact) {
    events.push({
      id: foundationId('audit'),
      schemaVersion: SchemaVersionSchema.value,
      createdAt: now,
      actor: 'codex-kernel.control-plane',
      action: 'codex.exec.approval_artifact.created',
      outcome: input.approvalArtifact.status,
      evidenceRefs: (input.evidenceRefs ?? []).filter(
        (ref) => ref.kind === 'codex.exec.approval_artifact',
      ),
      metadata: createControlPlaneMetadata({
        approvalArtifactId: input.approvalArtifact.id,
        dryRunPlanId: input.approvalArtifact.dryRunPlanId,
      }),
    });
  }

  if (input.executionGateResult) {
    events.push({
      id: foundationId('audit'),
      schemaVersion: SchemaVersionSchema.value,
      createdAt: now,
      actor: 'codex-kernel.control-plane',
      action: 'codex.exec.execution_gate.evaluated',
      outcome: input.executionGateResult.status,
      evidenceRefs: (input.evidenceRefs ?? []).filter(
        (ref) => ref.kind === 'codex.exec.execution_gate_result',
      ),
      metadata: createControlPlaneMetadata({
        executionGateResultId: input.executionGateResult.id,
        dryRunPlanId: input.executionGateResult.dryRunPlanId,
      }),
    });

    if (!input.executionGateResult.liveEnabled) {
      events.push({
        id: foundationId('audit'),
        schemaVersion: SchemaVersionSchema.value,
        createdAt: now,
        actor: 'codex-kernel.control-plane',
        action: 'codex.exec.live_execution.disabled_by_config',
        outcome: 'blocked',
        evidenceRefs: (input.evidenceRefs ?? []).filter(
          (ref) => ref.kind === 'codex.exec.execution_gate_result',
        ),
        metadata: createControlPlaneMetadata({
          executionGateResultId: input.executionGateResult.id,
          dryRunPlanId: input.executionGateResult.dryRunPlanId,
        }),
      });
    }
  }

  return events;
}

function createCodexExecConfigFile(
  configPath: string,
  fileText: string,
  metadata?: Record<string, unknown>,
): CodexExecConfigFile {
  return {
    id: foundationId('codex_config_file'),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: foundationTimestamp(),
    configPath,
    configPathHash: prefixedHash(configPath),
    configHash: prefixedHash(fileText),
    bodyStored: false,
    summary: `Config file metadata for ${configPath}`,
    liveExecution: false,
    externalProcessStarted: false,
    executionDisabled: true,
    metadata: createControlPlaneMetadata({
      ...(metadata ?? {}),
      configPathHash: prefixedHash(configPath),
      configHash: prefixedHash(fileText),
    }),
  };
}

function parseSimpleCodexConfig(fileText: string): {
  values: Partial<CodexExecLiveConfig>;
  errors: string[];
  keyCount: number;
} {
  const values: Partial<CodexExecLiveConfig> = {};
  const errors: string[] = [];
  let currentArrayKey: 'allowedSandboxModes' | 'forbiddenSandboxModes' | undefined;
  let keyCount = 0;

  for (const [index, rawLine] of fileText.split(/\r?\n/).entries()) {
    const lineWithoutComment = rawLine.split('#')[0]?.trimEnd() ?? '';
    const line = lineWithoutComment.trim();

    if (line.length === 0) {
      continue;
    }

    const arrayItem = line.match(/^-\s+(.+)$/);

    if (arrayItem && currentArrayKey) {
      const mode = parseSandboxMode(arrayItem[1]?.trim() ?? '');

      if (mode) {
        values[currentArrayKey] = [...(values[currentArrayKey] ?? []), mode];
      } else {
        errors.push(`line ${index + 1}: unsupported sandbox mode`);
      }

      continue;
    }

    const keyValue = line.match(/^([A-Za-z][A-Za-z0-9]*):\s*(.*)$/);

    if (!keyValue) {
      errors.push(`line ${index + 1}: unsupported config syntax`);
      currentArrayKey = undefined;
      continue;
    }

    const key = keyValue[1] ?? '';
    const value = keyValue[2]?.trim() ?? '';
    currentArrayKey = undefined;
    keyCount += 1;

    if (key === 'allowedSandboxModes' || key === 'forbiddenSandboxModes') {
      currentArrayKey = key;
      values[key] = [];

      if (value.length > 0) {
        const inlineModes = value
          .replace(/^\[/, '')
          .replace(/\]$/, '')
          .split(',')
          .map((part) => part.trim())
          .filter(Boolean);

        for (const inlineMode of inlineModes) {
          const mode = parseSandboxMode(inlineMode);

          if (mode) {
            values[key] = [...(values[key] ?? []), mode];
          } else {
            errors.push(`line ${index + 1}: unsupported sandbox mode`);
          }
        }
      }

      continue;
    }

    if (
      key === 'liveEnabled' ||
      key === 'requiresApproval' ||
      key === 'requiresIsolatedWorktreeForWorkspaceWrite' ||
      key === 'singleUseApprovals'
    ) {
      const parsedBoolean = parseBoolean(value);

      if (parsedBoolean === undefined) {
        errors.push(`line ${index + 1}: ${key} must be true or false`);
      } else {
        values[key] = parsedBoolean;
      }

      continue;
    }

    if (key === 'approvalTtlMinutes') {
      const parsedNumber = Number(value);

      if (!Number.isInteger(parsedNumber) || parsedNumber <= 0) {
        errors.push(`line ${index + 1}: approvalTtlMinutes must be a positive integer`);
      } else {
        values.approvalTtlMinutes = parsedNumber;
      }

      continue;
    }

    if (key === 'version') {
      const parsedNumber = Number(value);

      if (!Number.isInteger(parsedNumber) || parsedNumber <= 0) {
        errors.push(`line ${index + 1}: version must be a positive integer`);
      }

      continue;
    }

    errors.push(`line ${index + 1}: unsupported config key ${key}`);
  }

  return { values, errors, keyCount };
}

function parseBoolean(value: string): boolean | undefined {
  if (value === 'true') {
    return true;
  }

  if (value === 'false') {
    return false;
  }

  return undefined;
}

function parseSandboxMode(value: string): CodexExecSandboxMode | undefined {
  const normalized = value.replace(/^['"]|['"]$/g, '');

  if (
    normalized === 'read_only' ||
    normalized === 'workspace_write' ||
    normalized === 'danger_full_access'
  ) {
    return normalized;
  }

  return undefined;
}

function summarizeReason(value: string, label: string): string {
  return `${label} (${value.length} chars, hash ${prefixedHash(value)})`;
}

function normalizeCodexExecItem(itemRecord: JsonRecord): CodexExecNormalizedItem {
  const itemType = normalizeItemType(getString(itemRecord, ['type', 'item_type', 'itemType']));
  const itemId = getString(itemRecord, ['id', 'item_id', 'itemId']);
  const base = {
    id: foundationId('codex_item'),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: foundationTimestamp(),
    itemId,
    metadata: {
      mockOnly: true,
      liveExecution: false,
      externalProcessStarted: false,
    },
  };

  if (itemType === 'command_execution') {
    return {
      ...base,
      itemType,
      command: summarizeContent(
        getValue(itemRecord, ['command', 'cmd', 'commandText']),
        'command text',
      ),
      status: getString(itemRecord, ['status']),
      exitCode: getNumber(itemRecord, ['exit_code', 'exitCode']),
      output: summarizeOptionalContent(
        getValue(itemRecord, ['output', 'stdout', 'stderr']),
        'command output',
      ),
    };
  }

  if (itemType === 'agent_message') {
    return {
      ...base,
      itemType,
      message: summarizeContent(
        getValue(itemRecord, ['message', 'text', 'content']),
        'agent message',
      ),
    };
  }

  if (itemType === 'reasoning') {
    return {
      ...base,
      itemType,
      reasoning: summarizeContent(
        getValue(itemRecord, ['reasoning', 'text', 'content']),
        'reasoning text',
      ),
    };
  }

  if (itemType === 'file_change') {
    const pathValue = stringifySafe(
      getValue(itemRecord, ['path', 'file', 'filePath']) ?? 'unknown',
    );

    return {
      ...base,
      itemType,
      pathSummary: summarizePath(pathValue),
      pathHash: prefixedHash(pathValue),
      operation: getString(itemRecord, ['operation', 'op']),
      changeSummary: summarizeOptionalContent(
        getValue(itemRecord, ['summary', 'diff', 'changes']),
        'file change summary',
      ),
    };
  }

  if (itemType === 'mcp_tool_call') {
    return {
      ...base,
      itemType,
      toolName: getString(itemRecord, ['tool', 'toolName', 'name']) ?? 'unknown-tool',
      argumentsSummary: summarizeOptionalContent(
        getValue(itemRecord, ['arguments', 'args', 'input']),
        'tool arguments',
      ),
      resultSummary: summarizeOptionalContent(
        getValue(itemRecord, ['result', 'output']),
        'tool result',
      ),
    };
  }

  if (itemType === 'web_search') {
    return {
      ...base,
      itemType,
      query: summarizeOptionalContent(getValue(itemRecord, ['query', 'text']), 'web search query'),
      resultCount: getArray(itemRecord, ['results'])?.length,
    };
  }

  if (itemType === 'plan_update') {
    const steps = getArray(itemRecord, ['steps', 'plan']) ?? [];

    return {
      ...base,
      itemType,
      stepCount: steps.length,
      completedStepCount: steps.filter(isCompletedStep).length,
      planSummary: summarizeOptionalContent(steps, 'plan update'),
    };
  }

  const summary = summarizePayload(itemRecord);

  return {
    ...base,
    itemType: 'unknown',
    safeSummary: `Unknown item type: ${getString(itemRecord, ['type', 'item_type', 'itemType']) ?? 'unknown'}`,
    payloadHash: summary.contentHash,
    payloadLength: summary.contentLength,
  };
}

function createParseErrorEvent(
  line: string,
  lineNumber: number,
  parseError: string,
): CodexExecNormalizedEvent {
  const payloadSummary = summarizePayload(line);

  return {
    id: foundationId('codex_event'),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: foundationTimestamp(),
    rawEventType: 'parse_error',
    normalizedType: 'parse_error',
    summary: `Malformed JSONL at line ${lineNumber}`,
    payloadHash: payloadSummary.contentHash,
    payloadLength: payloadSummary.contentLength,
    safe: true,
    metadata: {
      mockOnly: true,
      liveExecution: false,
      externalProcessStarted: false,
      lineNumber,
      parseError: summarizeText(parseError, 120),
    },
  };
}

async function createReplayEvidenceRefs(
  result: Omit<CodexExecReplayResult, 'evidenceRefs' | 'auditEvents'>,
): Promise<EvidenceRef[]> {
  const collector = new MetadataOnlyEvidenceCollector();
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
  const replayEvidence = await collector.collect({
    kind: 'codex.exec.jsonl.replay',
    label: `codex-replay:${result.id}`,
    summary: `Codex fixture replay ${result.finalStatus}: ${result.eventCount} events`,
    expiresAt,
    metadata: {
      replayId: result.id,
      threadId: result.threadId,
      eventCount: result.eventCount,
      itemCount: result.itemCount,
      commandExecutionCount: result.commandExecutionCount,
      fileChangeCount: result.fileChangeCount,
      mcpToolCallCount: result.mcpToolCallCount,
      webSearchCount: result.webSearchCount,
      errorCount: result.errorCount,
      finalStatus: result.finalStatus,
      mockOnly: true,
      liveExecution: false,
      externalProcessStarted: false,
    },
    bodyForHashOnly: stableStringify({
      replayId: result.id,
      eventHashes: result.events.map((event) => event.payloadHash),
      finalStatus: result.finalStatus,
    }),
  });
  const eventEvidence = await Promise.all(
    result.events.map((event) =>
      collector.collect({
        kind: 'codex.exec.event.summary',
        label: `codex-event:${event.id}`,
        summary: event.summary,
        expiresAt,
        metadata: {
          eventId: event.id,
          rawEventType: event.rawEventType,
          normalizedType: event.normalizedType,
          itemType: event.itemType,
          payloadHash: event.payloadHash,
          payloadLength: event.payloadLength,
          mockOnly: true,
          liveExecution: false,
          externalProcessStarted: false,
        },
        bodyForHashOnly: stableStringify({
          eventId: event.id,
          rawEventType: event.rawEventType,
          normalizedType: event.normalizedType,
          payloadHash: event.payloadHash,
        }),
      }),
    ),
  );

  return [replayEvidence, ...eventEvidence];
}

function createReplayAuditEvents(
  result: Omit<CodexExecReplayResult, 'evidenceRefs' | 'auditEvents'>,
  evidenceRefs: EvidenceRef[],
): AuditEvent[] {
  const now = foundationTimestamp();
  const baseMetadata = {
    mockOnly: true,
    liveExecution: false,
    externalProcessStarted: false,
    replayId: result.id,
    threadId: result.threadId,
  };
  const started: AuditEvent = {
    id: foundationId('audit'),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: now,
    actor: 'codex-kernel.fixture-replay',
    action: 'codex.exec.fixture_replay.started',
    outcome: 'started',
    evidenceRefs: [],
    metadata: baseMetadata,
  };
  const terminalAction =
    result.finalStatus === 'failed'
      ? 'codex.exec.fixture_replay.failed'
      : 'codex.exec.fixture_replay.completed';
  const terminal: AuditEvent = {
    id: foundationId('audit'),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: now,
    actor: 'codex-kernel.fixture-replay',
    action: terminalAction,
    outcome: result.finalStatus,
    evidenceRefs: evidenceRefs.slice(0, 1),
    metadata: {
      ...baseMetadata,
      eventCount: result.eventCount,
      errorCount: result.errorCount,
      finalStatus: result.finalStatus,
    },
  };

  return [started, terminal];
}

function createCodexExecPolicyInput(plan: CodexExecDryRunPlan): CodexExecPolicyInput {
  return {
    id: foundationId('codex_policy_input'),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: foundationTimestamp(),
    intentId: plan.intentId,
    dryRunPlanId: plan.id,
    actionType: 'codex.exec.live.intent',
    actionMode: plan.sandboxMode === 'read_only' ? 'read' : 'write',
    riskLevel: plan.riskLevel,
    sandboxMode: plan.sandboxMode,
    approvalMode: plan.approvalMode,
    dryRunPlanPresent: true,
    liveAdapterEnabled: plan.liveAdapterEnabled,
    guardedPromptMatch: plan.metadata?.guardedPromptMatch === true,
    promptSummary: plan.promptSummary,
    promptHash: plan.promptHash,
    promptLength: plan.promptLength,
    promptBodyStored: false,
    liveExecution: false,
    externalProcessStarted: false,
    executionDisabled: true,
    metadata: { source: 'codex-kernel.control-plane' },
  };
}

function riskForSandboxMode(sandboxMode: CodexExecSandboxMode): RiskLevel {
  if (sandboxMode === 'danger_full_access') {
    return 'critical';
  }

  if (sandboxMode === 'workspace_write') {
    return 'high';
  }

  return 'medium';
}

function createCodexExecDryRunEvidenceRefs(
  plan: CodexExecDryRunPlan,
  commandPreview: CodexExecCommandPreview,
  policyDecision: PolicyDecision,
): EvidenceRef[] {
  const baseMetadata = {
    dryRunPlanId: plan.id,
    intentId: plan.intentId,
    promptHash: plan.promptHash,
    promptLength: plan.promptLength,
    sandboxMode: plan.sandboxMode,
    approvalMode: plan.approvalMode,
    riskLevel: plan.riskLevel,
    liveExecution: false,
    externalProcessStarted: false,
    mockOnly: false,
    executionDisabled: true,
  };

  return [
    createEvidenceRef({
      kind: 'codex.exec.dry_run_plan',
      label: 'codex.dry_run_plan',
      summary: `Dry-run plan ${plan.id} for ${plan.title}`,
      metadata: baseMetadata,
      bodyForHashOnly: stableStringify({
        dryRunPlanId: plan.id,
        promptHash: plan.promptHash,
        sandboxMode: plan.sandboxMode,
        riskLevel: plan.riskLevel,
      }),
    }),
    createEvidenceRef({
      kind: 'codex.exec.command_preview',
      label: 'codex.command_preview',
      summary: commandPreview.previewSummary,
      metadata: {
        ...baseMetadata,
        commandPreviewId: commandPreview.id,
        previewHash: commandPreview.previewHash,
      },
      bodyForHashOnly: stableStringify({
        commandPreviewId: commandPreview.id,
        previewHash: commandPreview.previewHash,
        argumentSummary: commandPreview.argumentSummary,
      }),
    }),
    createEvidenceRef({
      kind: 'codex.exec.policy_decision',
      label: 'codex.policy_decision',
      summary: `Policy decision ${policyDecision.outcome} for ${plan.riskLevel} risk`,
      metadata: {
        ...baseMetadata,
        policyDecisionId: policyDecision.id,
        policyOutcome: policyDecision.outcome,
      },
      bodyForHashOnly: stableStringify({
        policyDecisionId: policyDecision.id,
        outcome: policyDecision.outcome,
        reasons: policyDecision.reasons,
      }),
    }),
  ];
}

function createCodexExecDisabledError(reason: string): CodexExecLiveExecutionDisabledError {
  return {
    id: foundationId('codex_disabled_error'),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: foundationTimestamp(),
    code: 'CODEX_EXEC_LIVE_DISABLED',
    message: 'Codex CLI live adapter is disabled; no external process was started.',
    reason,
    liveExecution: false,
    externalProcessStarted: false,
    executionDisabled: true,
    metadata: {
      liveExecution: false,
      externalProcessStarted: false,
      mockOnly: false,
      executionDisabled: true,
    },
  };
}

function createCodexExecDryRunAuditEvents(
  plan: CodexExecDryRunPlan,
  policyDecision: PolicyDecision,
  evidenceRefs: EvidenceRef[],
  disabledError: CodexExecLiveExecutionDisabledError,
): AuditEvent[] {
  const now = foundationTimestamp();
  const baseMetadata = {
    dryRunPlanId: plan.id,
    intentId: plan.intentId,
    sandboxMode: plan.sandboxMode,
    approvalMode: plan.approvalMode,
    riskLevel: plan.riskLevel,
    liveExecution: false,
    externalProcessStarted: false,
    mockOnly: false,
    executionDisabled: true,
  };

  return [
    {
      id: foundationId('audit'),
      schemaVersion: SchemaVersionSchema.value,
      createdAt: now,
      actor: 'codex-kernel.control-plane',
      action: 'codex.exec.live_intent.created',
      outcome: 'created',
      evidenceRefs: [],
      metadata: baseMetadata,
    },
    {
      id: foundationId('audit'),
      schemaVersion: SchemaVersionSchema.value,
      createdAt: now,
      actor: 'codex-kernel.control-plane',
      action: 'codex.exec.dry_run_plan.created',
      outcome: 'created',
      evidenceRefs: evidenceRefs.slice(0, 1),
      metadata: baseMetadata,
    },
    {
      id: foundationId('audit'),
      schemaVersion: SchemaVersionSchema.value,
      createdAt: now,
      actor: 'codex-kernel.control-plane',
      action: 'codex.exec.policy_evaluated',
      outcome: policyDecision.outcome,
      evidenceRefs: evidenceRefs.slice(2, 3),
      policyDecisionId: policyDecision.id,
      metadata: {
        ...baseMetadata,
        policyDecisionId: policyDecision.id,
      },
    },
    {
      id: foundationId('audit'),
      schemaVersion: SchemaVersionSchema.value,
      createdAt: now,
      actor: 'codex-kernel.control-plane',
      action: 'codex.exec.live_execution.blocked',
      outcome: statusForPolicyDecision(plan, policyDecision),
      evidenceRefs,
      policyDecisionId: policyDecision.id,
      metadata: {
        ...baseMetadata,
        disabledErrorId: disabledError.id,
      },
    },
  ];
}

function hashCodexExecDryRunPlan(plan: CodexExecDryRunPlan): string {
  return prefixedHash(
    stableStringify({
      id: plan.id,
      intentId: plan.intentId,
      promptHash: plan.promptHash,
      promptLength: plan.promptLength,
      cwd: plan.cwd,
      sandboxMode: plan.sandboxMode,
      approvalMode: plan.approvalMode,
      riskLevel: plan.riskLevel,
    }),
  );
}

function hashCodexExecPolicyDecision(policyDecision: PolicyDecision): string {
  return prefixedHash(
    stableStringify({
      id: policyDecision.id,
      actionId: policyDecision.actionId,
      actionType: policyDecision.actionType,
      actionMode: policyDecision.actionMode,
      riskLevel: policyDecision.riskLevel,
      outcome: policyDecision.outcome,
      requiresDryRun: policyDecision.requiresDryRun,
      requiresApproval: policyDecision.requiresApproval,
      reasons: policyDecision.reasons,
    }),
  );
}

function createWorktreeRequirement(
  plan: CodexExecDryRunPlan,
  config: CodexExecLiveConfig,
  options: CodexExecPreflightOptions,
): CodexExecWorktreeRequirement {
  const requiresIsolatedWorktree =
    plan.sandboxMode === 'workspace_write' && config.requiresIsolatedWorktreeForWorkspaceWrite;
  const isolatedWorktreePresent =
    options.isolatedWorktreePresent === true || plan.metadata?.isolatedWorktreePresent === true;
  const status = !requiresIsolatedWorktree
    ? 'not_required'
    : isolatedWorktreePresent
      ? 'satisfied'
      : 'missing';
  const worktreePathSummary = options.worktreePath
    ? summarizePath(options.worktreePath)
    : undefined;

  return {
    id: foundationId('codex_worktree_requirement'),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: foundationTimestamp(),
    sandboxMode: plan.sandboxMode,
    requirement: {
      requiresIsolatedWorktree,
      isolatedWorktreePresent,
      worktreePathSummary,
      worktreePathHash: options.worktreePath ? prefixedHash(options.worktreePath) : undefined,
    },
    status,
    summary:
      status === 'not_required'
        ? 'isolated worktree is not required'
        : status === 'satisfied'
          ? 'isolated worktree requirement is satisfied'
          : 'isolated worktree is required but missing',
    metadata: {
      dryRunPlanId: plan.id,
      liveExecution: false,
      externalProcessStarted: false,
      executionDisabled: true,
    },
  };
}

function createPreflightCheck(
  name: string,
  status: CodexExecPreflightCheck['status'],
  summary: string,
): CodexExecPreflightCheck {
  return {
    id: foundationId('codex_preflight_check'),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: foundationTimestamp(),
    name,
    status,
    summary,
  };
}

function approvalScopeForSandboxMode(
  sandboxMode: CodexExecSandboxMode,
): CodexExecApprovalArtifact['scope'] {
  if (sandboxMode === 'workspace_write') {
    return 'workspace_write_plan';
  }

  if (sandboxMode === 'danger_full_access') {
    return 'danger_full_access_plan';
  }

  return 'read_only_plan';
}

function approvalStatusForTransitionAction(
  action: CodexExecApprovalTransitionAction,
): CodexExecManualApprovalState['status'] {
  if (action === 'approve') {
    return 'approved';
  }

  if (action === 'deny') {
    return 'denied';
  }

  if (action === 'revoke') {
    return 'revoked';
  }

  if (action === 'mark_used') {
    return 'used';
  }

  return 'expired';
}

function createTimelineEvent(
  record: CodexExecLiveRunRecord,
  input: {
    eventType: CodexExecTimelineEvent['eventType'];
    sourceKind: CodexExecTimelineEvent['sourceKind'];
    sourceId?: string;
    status: string;
    summary: string;
    occurredAt: string;
    order: number;
    metadata?: Record<string, unknown>;
  },
): CodexExecTimelineEvent {
  return {
    id: foundationId('codex_timeline_event'),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: input.occurredAt,
    dryRunId: record.dryRunPlanId,
    liveRunRecordId: record.id,
    eventType: input.eventType,
    sourceKind: input.sourceKind,
    sourceId: input.sourceId,
    status: input.status,
    summary: input.summary,
    occurredAt: input.occurredAt,
    liveExecution: false,
    externalProcessStarted: false,
    executionDisabled: true,
    metadata: createControlPlaneMetadata({
      dryRunPlanId: record.dryRunPlanId,
      liveRunRecordId: record.id,
      sourceKind: input.sourceKind,
      sourceId: input.sourceId,
      order: input.order,
      ...(input.metadata ?? {}),
    }),
  };
}

function applyTimelineFilter(
  events: CodexExecTimelineEvent[],
  filter: CodexExecTimelineFilter | undefined,
): CodexExecTimelineEvent[] {
  if (!filter) {
    return events;
  }

  const filteredEvents = events.filter((event) => {
    if (filter.source && !matchesTimelineSource(event, filter.source)) {
      return false;
    }

    if (filter.status && event.status !== filter.status) {
      return false;
    }

    if (filter.eventType && event.eventType !== filter.eventType) {
      return false;
    }

    if (filter.riskLevel && event.metadata?.riskLevel !== filter.riskLevel) {
      return false;
    }

    if (filter.includeEvidence === false && event.sourceKind === 'evidence') {
      return false;
    }

    if (filter.includeAudit === false && event.sourceKind === 'audit') {
      return false;
    }

    return true;
  });

  return filter.limit ? filteredEvents.slice(0, filter.limit) : filteredEvents;
}

function matchesTimelineSource(
  event: CodexExecTimelineEvent,
  source: NonNullable<CodexExecTimelineFilter['source']>,
): boolean {
  if (source === 'approval') {
    return [
      'approval_request',
      'approval_decision',
      'approval_state',
      'approval_artifact',
    ].includes(event.sourceKind);
  }

  return event.sourceKind === source;
}

function createSourceBreakdown(
  events: CodexExecTimelineEvent[],
): Record<CodexExecTimelineEvent['sourceKind'], number> {
  return events.reduce(
    (breakdown, event) => ({
      ...breakdown,
      [event.sourceKind]: (breakdown[event.sourceKind] ?? 0) + 1,
    }),
    {} as Record<CodexExecTimelineEvent['sourceKind'], number>,
  );
}

function getLatestApprovalState(
  record: CodexExecLiveRunRecord,
  approvalRecords: CodexExecManualApprovalRecord[],
): CodexExecManualApprovalState | undefined {
  return dedupeApprovalRecords([
    ...(record.manualApprovalRecord ? [record.manualApprovalRecord] : []),
    ...approvalRecords,
  ])
    .map(
      (approvalRecord) =>
        approvalRecord.approvalState ?? evaluateCodexExecManualApprovalState(approvalRecord),
    )
    .sort((left, right) => right.createdAt.localeCompare(left.createdAt))[0];
}

function compareTimelineEvents(
  left: CodexExecTimelineEvent,
  right: CodexExecTimelineEvent,
): number {
  const leftOrder = getTimelineOrder(left);
  const rightOrder = getTimelineOrder(right);

  if (leftOrder !== rightOrder) {
    return leftOrder - rightOrder;
  }

  const leftTime = Date.parse(left.occurredAt);
  const rightTime = Date.parse(right.occurredAt);

  if (leftTime !== rightTime) {
    return leftTime - rightTime;
  }

  return left.id.localeCompare(right.id);
}

function getTimelineOrder(event: CodexExecTimelineEvent): number {
  const order = event.metadata?.order;
  return typeof order === 'number' ? order : 0;
}

function dedupeApprovalRecords(
  records: CodexExecManualApprovalRecord[],
): CodexExecManualApprovalRecord[] {
  const byId = new Map<string, CodexExecManualApprovalRecord>();

  for (const record of records) {
    byId.set(record.id, record);
  }

  return Array.from(byId.values()).sort((left, right) =>
    left.request.createdAt.localeCompare(right.request.createdAt),
  );
}

function dedupeEvidenceRefs(refs: EvidenceRef[]): EvidenceRef[] {
  const byId = new Map<string, EvidenceRef>();

  for (const ref of refs) {
    byId.set(ref.id, ref);
  }

  return Array.from(byId.values()).sort((left, right) =>
    left.createdAt.localeCompare(right.createdAt),
  );
}

function dedupeAuditEvents(events: AuditEvent[]): AuditEvent[] {
  const byId = new Map<string, AuditEvent>();

  for (const event of events) {
    byId.set(event.id, event);
  }

  return Array.from(byId.values()).sort((left, right) =>
    left.createdAt.localeCompare(right.createdAt),
  );
}

function createEvidenceQuery(query: Partial<CodexExecEvidenceQuery> = {}): CodexExecEvidenceQuery {
  return {
    id: foundationId('codex_evidence_query'),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: foundationTimestamp(),
    dryRunId: query.dryRunId,
    kind: query.kind,
    limit: normalizeQueryLimit(query.limit),
    liveExecution: false,
    externalProcessStarted: false,
    executionDisabled: true,
    metadata: createControlPlaneMetadata({
      dryRunPlanId: query.dryRunId,
      kind: query.kind,
    }),
  };
}

function createAuditQuery(query: Partial<CodexExecAuditQuery> = {}): CodexExecAuditQuery {
  return {
    id: foundationId('codex_audit_query'),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: foundationTimestamp(),
    dryRunId: query.dryRunId,
    action: query.action,
    limit: normalizeQueryLimit(query.limit),
    liveExecution: false,
    externalProcessStarted: false,
    executionDisabled: true,
    metadata: createControlPlaneMetadata({
      dryRunPlanId: query.dryRunId,
      action: query.action,
    }),
  };
}

function normalizeQueryLimit(limit: number | undefined): number {
  if (!Number.isInteger(limit) || limit === undefined) {
    return 20;
  }

  return Math.min(200, Math.max(1, limit));
}

function createEvidenceNotFoundDetail(evidenceRefId: string): CodexExecEvidenceDetailView {
  return {
    id: foundationId('codex_evidence_detail'),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: foundationTimestamp(),
    status: 'not_found',
    evidenceRefId,
    labels: [],
    relatedAuditEventIds: [],
    metadataOnly: true,
    bodyStored: false,
    liveExecution: false,
    externalProcessStarted: false,
    executionDisabled: true,
    metadata: createControlPlaneMetadata({
      evidenceRefId,
      status: 'not_found',
    }),
  };
}

function createAuditNotFoundDetail(auditEventId: string): CodexExecAuditDetailView {
  return {
    id: foundationId('codex_audit_detail'),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: foundationTimestamp(),
    status: 'not_found',
    auditEventId,
    evidenceRefIds: [],
    metadataOnly: true,
    bodyStored: false,
    liveExecution: false,
    externalProcessStarted: false,
    executionDisabled: true,
    metadata: createControlPlaneMetadata({
      auditEventId,
      status: 'not_found',
    }),
  };
}

function evidenceMatchesDryRun(
  ref: EvidenceRef,
  records: CodexExecLiveRunRecord[],
  dryRunId: string,
): boolean {
  if (recordMatchesEvidence(records, ref, dryRunId)) {
    return true;
  }

  return (
    readMetadataString(ref.metadata, 'dryRunPlanId') === dryRunId ||
    readMetadataString(ref.metadata, 'dryRunId') === dryRunId ||
    readMetadataString(ref.metadata, 'liveRunRecordId') === dryRunId
  );
}

function auditMatchesDryRun(
  event: AuditEvent,
  records: CodexExecLiveRunRecord[],
  dryRunId: string,
): boolean {
  if (recordMatchesAuditEvent(records, event, dryRunId)) {
    return true;
  }

  return (
    readMetadataString(event.metadata, 'dryRunPlanId') === dryRunId ||
    readMetadataString(event.metadata, 'dryRunId') === dryRunId ||
    readMetadataString(event.metadata, 'liveRunRecordId') === dryRunId
  );
}

function recordMatchesEvidence(
  records: CodexExecLiveRunRecord[],
  ref: EvidenceRef,
  dryRunId: string,
): boolean {
  return records.some(
    (record) =>
      (record.id === dryRunId || record.dryRunPlanId === dryRunId) &&
      record.evidenceRefs.some((candidate) => candidate.id === ref.id),
  );
}

function recordMatchesAuditEvent(
  records: CodexExecLiveRunRecord[],
  event: AuditEvent,
  dryRunId: string,
): boolean {
  return records.some(
    (record) =>
      (record.id === dryRunId || record.dryRunPlanId === dryRunId) &&
      record.auditEvents.some((candidate) => candidate.id === event.id),
  );
}

function createDetailMetadataSummary(metadata: Record<string, unknown> | undefined): {
  keyCount: number;
  keys: string[];
  relatedIds: string[];
  bodyStored: false;
} {
  const keys = Object.keys(metadata ?? {}).sort();

  return {
    keyCount: keys.length,
    keys,
    relatedIds: collectRelatedIds(metadata),
    bodyStored: false,
  };
}

function collectRelatedIds(metadata: Record<string, unknown> | undefined): string[] {
  if (!metadata) {
    return [];
  }

  const relatedIds = new Set<string>();

  for (const [key, value] of Object.entries(metadata)) {
    const normalizedKey = key.toLowerCase();

    if (typeof value === 'string' && normalizedKey.endsWith('id')) {
      relatedIds.add(value);
    }

    if (Array.isArray(value) && normalizedKey.endsWith('ids')) {
      for (const item of value) {
        if (typeof item === 'string') {
          relatedIds.add(item);
        }
      }
    }
  }

  return Array.from(relatedIds).sort();
}

function readMetadataString(
  metadata: Record<string, unknown> | undefined,
  key: string,
): string | undefined {
  const value = metadata?.[key];
  return typeof value === 'string' ? value : undefined;
}

function deriveTimelineStatus(
  record: CodexExecLiveRunRecord,
  approvalRecords: CodexExecManualApprovalRecord[],
): CodexExecTimelineStatus {
  if (record.executionGateResult?.status === 'ready') {
    return 'gate_ready';
  }

  if (record.executionGateResult?.status === 'blocked') {
    return 'gate_blocked';
  }

  const latestApprovalState = approvalRecords
    .map(
      (approvalRecord) =>
        approvalRecord.approvalState ?? evaluateCodexExecManualApprovalState(approvalRecord),
    )
    .sort((left, right) => right.createdAt.localeCompare(left.createdAt))[0];

  if (latestApprovalState?.status === 'pending') {
    return 'approval_pending';
  }

  if (latestApprovalState?.status === 'approved') {
    return 'approval_approved';
  }

  if (latestApprovalState?.status === 'denied') {
    return 'approval_denied';
  }

  if (latestApprovalState?.status === 'revoked') {
    return 'approval_revoked';
  }

  if (record.preflightResult?.status === 'passed') {
    return 'preflight_passed';
  }

  if (record.preflightResult?.status === 'blocked') {
    return 'preflight_blocked';
  }

  if (record.status === 'blocked') {
    return 'blocked';
  }

  return 'dry_run_created';
}

function createControlPlaneMetadata(extra: Record<string, unknown>): Record<string, unknown> {
  return {
    ...extra,
    liveExecution: false,
    externalProcessStarted: false,
    mockOnly: false,
    executionDisabled: true,
    source: 'codex-kernel.control-plane',
  };
}

function statusForPolicyDecision(
  plan: CodexExecDryRunPlan,
  policyDecision: PolicyDecision,
): CodexExecLiveExecutionStatus {
  if (policyDecision.outcome === 'deny') {
    return 'blocked';
  }

  if (policyDecision.outcome === 'approval_required') {
    return 'awaiting_approval';
  }

  if (plan.liveAdapterEnabled) {
    return 'approved_not_executed';
  }

  return 'disabled';
}

function hasGuardedPromptMatch(prompt: string): boolean {
  const lowerPrompt = prompt.toLowerCase();
  const guardedTerms = [
    ['to', 'ken'].join(''),
    ['coo', 'kie'].join(''),
    ['sess', 'ion'].join(''),
    ['m', 'fa'].join(''),
    'password',
    'secret',
  ];

  return guardedTerms.some((term) => lowerPrompt.includes(term));
}

function createEventSummary(
  rawEventType: string,
  normalizedType: string,
  item: CodexExecNormalizedItem | undefined,
  rawEvent: JsonRecord,
): string {
  if (normalizedType === 'unknown') {
    return `Unknown Codex event type: ${rawEventType}`;
  }

  if (item) {
    return `${normalizedType} ${item.itemType}`;
  }

  if (normalizedType === 'error') {
    const errorPayload = summarizePayload(
      getValue(rawEvent, ['message', 'error']) ?? 'Codex event error',
    );
    return `Codex error event (${errorPayload.contentLength} chars)`;
  }

  return normalizedType;
}

function countItems(events: CodexExecNormalizedEvent[], itemType: CodexExecItemType): number {
  return events.filter((event) => event.itemType === itemType).length;
}

function hasCompletedTurn(events: CodexExecNormalizedEvent[]): boolean {
  return events.some((event) => event.normalizedType === 'turn.completed');
}

function createReplayHash(result: CodexExecReplayResult, fixturePath: string): string {
  return prefixedHash(
    stableStringify({
      fixturePath,
      threadId: result.threadId,
      finalStatus: result.finalStatus,
      eventHashes: result.events.map((event) => event.payloadHash),
      counts: {
        eventCount: result.eventCount,
        itemCount: result.itemCount,
        commandExecutionCount: result.commandExecutionCount,
        fileChangeCount: result.fileChangeCount,
        mcpToolCallCount: result.mcpToolCallCount,
        webSearchCount: result.webSearchCount,
        errorCount: result.errorCount,
      },
    }),
  );
}

function normalizeItemType(value: string | undefined): CodexExecItemType {
  if (value && knownItemTypes.has(value as CodexExecItemType)) {
    return value as CodexExecItemType;
  }

  return 'unknown';
}

function normalizeEventType(value: string): CodexExecEventType {
  if (knownEventTypes.has(value as CodexExecEventType)) {
    return value as CodexExecEventType;
  }

  return 'unknown';
}

function summarizeOptionalContent(
  value: unknown,
  label: string,
): ReturnType<typeof summarizePayload> | undefined {
  if (value === undefined || value === null) {
    return undefined;
  }

  return summarizeContent(value, label);
}

function summarizeContent(
  value: unknown,
  label: string,
): {
  summary: string;
  contentHash: string;
  contentLength: number;
} {
  const text = stringifySafe(value);

  return {
    summary: `${label} (${text.length} chars)`,
    contentHash: prefixedHash(text),
    contentLength: text.length,
  };
}

function summarizePayload(value: unknown): {
  summary: string;
  contentHash: string;
  contentLength: number;
} {
  const text = stringifySafe(value);

  return {
    summary: summarizeText(text, 160),
    contentHash: prefixedHash(text),
    contentLength: text.length,
  };
}

function summarizeText(text: string, maxLength: number): string {
  const normalized = text.replace(/\s+/g, ' ').trim();

  if (normalized.length === 0) {
    return 'empty';
  }

  return normalized.length <= maxLength ? normalized : `${normalized.slice(0, maxLength - 1)}...`;
}

function summarizePath(pathValue: string): string {
  const normalized = pathValue.replace(/\\/g, '/');
  const parts = normalized.split('/').filter(Boolean);

  return parts.slice(-2).join('/') || 'unknown';
}

function stringifySafe(value: unknown): string {
  if (typeof value === 'string') {
    return value;
  }

  return stableStringify(redactSensitiveFields(value));
}

function redactSensitiveFields(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(redactSensitiveFields);
  }

  if (!isRecord(value)) {
    return value;
  }

  const redacted: JsonRecord = {};

  for (const [key, nestedValue] of Object.entries(value)) {
    redacted[key] = isHiddenFieldName(key) ? '[redacted]' : redactSensitiveFields(nestedValue);
  }

  return redacted;
}

function isHiddenFieldName(key: string): boolean {
  const lowerKey = key.toLowerCase();
  return hiddenFieldNames.some((fieldName) => lowerKey.includes(fieldName));
}

function stableStringify(value: unknown): string {
  return JSON.stringify(sortJson(value));
}

function sortJson(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(sortJson);
  }

  if (!isRecord(value)) {
    return value;
  }

  return Object.fromEntries(
    Object.entries(value)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, nestedValue]) => [key, sortJson(nestedValue)]),
  );
}

function prefixedHash(value: string): string {
  return `sha256:${hashText(value)}`;
}

function getValue(record: JsonRecord, keys: string[]): unknown {
  for (const key of keys) {
    if (record[key] !== undefined) {
      return record[key];
    }
  }

  return undefined;
}

function getString(record: JsonRecord, keys: string[]): string | undefined {
  const value = getValue(record, keys);

  if (typeof value === 'string') {
    return value;
  }

  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }

  return undefined;
}

function getNumber(record: JsonRecord, keys: string[]): number | undefined {
  const value = getValue(record, keys);

  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  return undefined;
}

function getRecord(record: JsonRecord, keys: string[]): JsonRecord | undefined {
  const value = getValue(record, keys);
  return isRecord(value) ? value : undefined;
}

function getArray(record: JsonRecord, keys: string[]): unknown[] | undefined {
  const value = getValue(record, keys);
  return Array.isArray(value) ? value : undefined;
}

function isRecord(value: unknown): value is JsonRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isCompletedStep(value: unknown): boolean {
  if (!isRecord(value)) {
    return false;
  }

  return getString(value, ['status']) === 'completed';
}

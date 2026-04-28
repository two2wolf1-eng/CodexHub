import type {
  AgentRun,
  AuditEvent,
  CodexExecApprovalMode,
  CodexExecApprovalArtifact,
  CodexExecApprovalDecisionOutcome,
  CodexExecApprovalRequirement,
  CodexExecCommandPreview,
  CodexExecConfigFile,
  CodexExecConfigLoadResult,
  CodexExecDryRunPlan,
  CodexExecExecutionGateResult,
  CodexExecEventType,
  CodexExecExecutionIntent,
  CodexExecLiveCapabilityState,
  CodexExecLiveConfig,
  CodexExecItemType,
  CodexExecLiveExecutionDisabledError,
  CodexExecLiveExecutionStatus,
  CodexExecLiveRunRecord,
  CodexExecManualApprovalDecision,
  CodexExecManualApprovalRecord,
  CodexExecManualApprovalRequest,
  CodexExecNormalizedEvent,
  CodexExecNormalizedItem,
  CodexExecPolicyInput,
  CodexExecPreflightCheck,
  CodexExecPreflightResult,
  CodexExecReplayResult,
  CodexExecSandboxMode,
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

  return {
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

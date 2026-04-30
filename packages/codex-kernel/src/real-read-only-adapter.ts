import type {
  CodexExecRealReadOnlyAdapterAuditSummary,
  CodexExecRealReadOnlyAdapterConfig,
  CodexExecRealReadOnlyAdapterError,
  CodexExecRealReadOnlyAdapterEvidenceSummary,
  CodexExecRealReadOnlyAdapterPreflight,
  CodexExecRealReadOnlyAdapterPreflightCheck,
  CodexExecRealReadOnlyAdapterRequest,
  CodexExecRealReadOnlyAdapterResult,
} from '@codexhub/contracts';
import { SchemaVersionSchema, foundationId, foundationTimestamp } from '@codexhub/contracts';
import { hashText } from '@codexhub/evidence-kernel';

type JsonMetadata = Record<string, unknown>;

export interface CodexExecRealReadOnlyAdapterAttemptInput {
  dryRunId: string;
  config?: CodexExecRealReadOnlyAdapterConfig;
  approvalArtifactId?: string;
  policyDecisionId?: string;
  requestedSandboxMode?: 'read_only';
  triggerKind?: 'cli';
  metadata?: JsonMetadata;
}

export interface CodexExecRealReadOnlyAdapter {
  attempt(input: CodexExecRealReadOnlyAdapterAttemptInput): Promise<CodexExecRealReadOnlyAdapterResult>;
}

const realReadOnlyAdapterNoApprovalFlags = {
  liveExecution: false,
  externalProcessStarted: false,
  executionDisabled: true,
  processAdapterStarted: false,
  processAdapterApproved: false,
  implementationApproved: false,
  recommendationGrantsExecution: false,
  workspaceWriteAllowed: false,
  dangerFullAccessAllowed: false,
  dashboardTriggerAllowed: false,
} as const;

const realReadOnlyAdapterMetadataOnlyFlags = {
  ...realReadOnlyAdapterNoApprovalFlags,
  metadataOnly: true,
  bodyStored: false,
  promptBodyStored: false,
  commandBodyStored: false,
  stdoutBodyStored: false,
  stderrBodyStored: false,
  agentMessageBodyStored: false,
  reasoningBodyStored: false,
} as const;

const realReadOnlyAdapterNoRunnableBoundaryFlags = {
  noRunnableCommand: true,
  commandPreviewStored: false,
  argvStored: false,
  executablePathStored: false,
  shellSnippetStored: false,
  envPlanStored: false,
} as const;

export function createDefaultRealReadOnlyAdapterConfig(
  metadata: JsonMetadata = {},
): CodexExecRealReadOnlyAdapterConfig {
  return {
    id: foundationId('codex_real_read_only_adapter_config'),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: foundationTimestamp(),
    ...realReadOnlyAdapterMetadataOnlyFlags,
    ...realReadOnlyAdapterNoRunnableBoundaryFlags,
    status: 'disabled',
    defaultEnabled: false,
    configuredEnabled: false,
    explicitEnableRequired: true,
    cliOnly: true,
    dashboardTriggerForbidden: true,
    allowedSandboxMode: 'read_only',
    forbiddenSandboxModes: ['workspace_write', 'danger_full_access'],
    existingDryRunRequired: true,
    approvalArtifactRequired: true,
    dryRunPlanHashRequired: true,
    policyDecisionHashRequired: true,
    isolatedWorktreeRequired: true,
    cleanWorktreeRequired: true,
    metadataEvidenceOnly: true,
    summary: 'Real read-only adapter is disabled by default and requires explicit gated enablement.',
    metadata: createRealReadOnlyAdapterMetadata({
      ...metadata,
      source: 'codex-kernel.real-read-only-adapter.config',
    }),
  };
}

export function createRealReadOnlyAdapterRequest(
  input: CodexExecRealReadOnlyAdapterAttemptInput,
): CodexExecRealReadOnlyAdapterRequest {
  const config = input.config ?? createDefaultRealReadOnlyAdapterConfig();

  return {
    id: foundationId('codex_real_read_only_adapter_request'),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: foundationTimestamp(),
    ...realReadOnlyAdapterMetadataOnlyFlags,
    ...realReadOnlyAdapterNoRunnableBoundaryFlags,
    dryRunId: input.dryRunId,
    configId: config.id,
    approvalArtifactId: input.approvalArtifactId,
    policyDecisionId: input.policyDecisionId,
    requestedSandboxMode: input.requestedSandboxMode ?? 'read_only',
    triggerKind: input.triggerKind ?? 'cli',
    existingDryRunRequired: true,
    summary: `Read-only adapter request for existing dry-run ${input.dryRunId}; no process boundary started.`,
    metadata: createRealReadOnlyAdapterMetadata({
      ...(input.metadata ?? {}),
      configStatus: config.status,
      configuredEnabled: config.configuredEnabled,
      source: 'codex-kernel.real-read-only-adapter.request',
    }),
  };
}

export function createDisabledRealReadOnlyAdapterPreflight(
  request: CodexExecRealReadOnlyAdapterRequest,
  config: CodexExecRealReadOnlyAdapterConfig = createDefaultRealReadOnlyAdapterConfig(),
): CodexExecRealReadOnlyAdapterPreflight {
  const checks = [
    createRealReadOnlyAdapterPreflightCheck({
      code: 'config_explicit_enable',
      label: 'Explicit config enablement',
      status: config.configuredEnabled ? 'passed' : 'blocked',
      required: true,
      summary: config.configuredEnabled
        ? 'Explicit read-only adapter config enablement is present.'
        : 'Read-only adapter config is disabled; no process boundary may be planned.',
    }),
    createRealReadOnlyAdapterPreflightCheck({
      code: 'dry_run_id_present',
      label: 'Existing dry-run id',
      status: request.dryRunId.length > 0 ? 'passed' : 'blocked',
      required: true,
      summary: request.dryRunId.length > 0
        ? 'Existing dry-run id is present.'
        : 'Existing dry-run id is required before any adapter attempt.',
    }),
    createRealReadOnlyAdapterPreflightCheck({
      code: 'sandbox_read_only',
      label: 'Read-only sandbox',
      status: request.requestedSandboxMode === 'read_only' ? 'passed' : 'blocked',
      required: true,
      summary: 'Only read_only sandbox mode is allowed.',
    }),
    createRealReadOnlyAdapterPreflightCheck({
      code: 'dashboard_trigger_forbidden',
      label: 'Dashboard trigger forbidden',
      status: request.triggerKind === 'cli' ? 'passed' : 'blocked',
      required: true,
      summary: 'Read-only adapter attempts are CLI-only; Dashboard trigger remains forbidden.',
    }),
  ];
  const blockedChecks = checks.filter((check) => check.status === 'blocked');
  const failedChecks = checks.filter((check) => check.status === 'failed');
  const requiresReviewChecks = checks.filter((check) => check.status === 'requires_review');
  const status: CodexExecRealReadOnlyAdapterPreflight['status'] =
    blockedChecks.length > 0
      ? 'blocked'
      : failedChecks.length > 0
        ? 'failed'
        : requiresReviewChecks.length > 0
          ? 'requires_review'
          : 'passed';

  return {
    id: foundationId('codex_real_read_only_adapter_preflight'),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: foundationTimestamp(),
    ...realReadOnlyAdapterMetadataOnlyFlags,
    requestId: request.id,
    dryRunId: request.dryRunId,
    configId: request.configId,
    status,
    requestedSandboxMode: request.requestedSandboxMode,
    checks,
    hardGateCount: checks.filter((check) => check.required).length,
    passedGateCount: checks.filter((check) => check.status === 'passed').length,
    failedGateCount: failedChecks.length,
    requiresReviewCount: requiresReviewChecks.length,
    blockerCount: blockedChecks.length,
    summary:
      status === 'passed'
        ? 'Read-only adapter preflight passed; later phases still control boundary planning.'
        : 'Read-only adapter preflight blocked before process boundary planning.',
    metadata: createRealReadOnlyAdapterMetadata({
      source: 'codex-kernel.real-read-only-adapter.preflight',
    }),
  };
}

export function createDisabledRealReadOnlyAdapterResult(
  input: CodexExecRealReadOnlyAdapterAttemptInput,
): CodexExecRealReadOnlyAdapterResult {
  const config = input.config ?? createDefaultRealReadOnlyAdapterConfig(input.metadata);
  const request = createRealReadOnlyAdapterRequest({ ...input, config });
  const preflight = createDisabledRealReadOnlyAdapterPreflight(request, config);
  const error = createRealReadOnlyAdapterError({
    code: config.configuredEnabled ? 'boundary_deferred' : 'config_disabled',
    relatedCheckCode: config.configuredEnabled ? undefined : 'config_explicit_enable',
    messageSummary: config.configuredEnabled
      ? 'Adapter boundary is not available in the disabled-default implementation.'
      : 'Adapter config is disabled by default.',
    remediationSummary: config.configuredEnabled
      ? 'Complete the later process-boundary phase before any attempt can proceed.'
      : 'Use an explicitly reviewed config only after all hard gates are implemented.',
  });
  const resultId = foundationId('codex_real_read_only_adapter_result');

  return {
    id: resultId,
    schemaVersion: SchemaVersionSchema.value,
    createdAt: foundationTimestamp(),
    ...realReadOnlyAdapterMetadataOnlyFlags,
    requestId: request.id,
    dryRunId: request.dryRunId,
    preflightId: preflight.id,
    status: preflight.status === 'passed' ? 'not_started' : 'blocked',
    error,
    evidenceSummary: createRealReadOnlyAdapterEvidenceSummary(request, resultId),
    auditSummary: createRealReadOnlyAdapterAuditSummary(request, resultId),
    postRunVerificationRequired: true,
    workspaceMutationAllowed: false,
    unexpectedWorkspaceDiffCritical: true,
    autoRevertAllowed: false,
    summary:
      'Read-only adapter attempt stopped in disabled-default implementation; no process boundary started.',
    metadata: createRealReadOnlyAdapterMetadata({
      configId: config.id,
      requestId: request.id,
      preflightId: preflight.id,
      errorCode: error.code,
      source: 'codex-kernel.real-read-only-adapter.result',
    }),
  };
}

export function createDisabledRealReadOnlyAdapter(): CodexExecRealReadOnlyAdapter {
  return {
    attempt: async (input) => createDisabledRealReadOnlyAdapterResult(input),
  };
}

function createRealReadOnlyAdapterPreflightCheck(input: {
  code: string;
  label: string;
  status: CodexExecRealReadOnlyAdapterPreflightCheck['status'];
  required: boolean;
  summary: string;
}): CodexExecRealReadOnlyAdapterPreflightCheck {
  return {
    id: foundationId('codex_real_read_only_adapter_check'),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: foundationTimestamp(),
    ...realReadOnlyAdapterMetadataOnlyFlags,
    ...input,
    metadata: createRealReadOnlyAdapterMetadata({
      checkCode: input.code,
      source: 'codex-kernel.real-read-only-adapter.check',
    }),
  };
}

function createRealReadOnlyAdapterError(input: {
  code: CodexExecRealReadOnlyAdapterError['code'];
  relatedCheckCode?: string;
  messageSummary: string;
  remediationSummary: string;
}): CodexExecRealReadOnlyAdapterError {
  return {
    id: foundationId('codex_real_read_only_adapter_error'),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: foundationTimestamp(),
    ...realReadOnlyAdapterMetadataOnlyFlags,
    code: input.code,
    severity: 'high',
    relatedCheckCode: input.relatedCheckCode,
    messageSummary: input.messageSummary,
    remediationSummary: input.remediationSummary,
    absolutePathLeaked: false,
    metadata: createRealReadOnlyAdapterMetadata({
      code: input.code,
      source: 'codex-kernel.real-read-only-adapter.error',
    }),
  };
}

function createRealReadOnlyAdapterEvidenceSummary(
  request: CodexExecRealReadOnlyAdapterRequest,
  resultId: string,
): CodexExecRealReadOnlyAdapterEvidenceSummary {
  return {
    id: foundationId('codex_real_read_only_adapter_evidence_summary'),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: foundationTimestamp(),
    ...realReadOnlyAdapterMetadataOnlyFlags,
    dryRunId: request.dryRunId,
    requestId: request.id,
    resultId,
    evidenceRefIds: [],
    eventHashCount: 0,
    outputHashCount: 0,
    metadataHash: prefixedAdapterHash({
      requestId: request.id,
      dryRunId: request.dryRunId,
      resultId,
      evidenceRefIds: [],
    }),
    redacted: true,
    summary: 'No process output exists; disabled-default attempt records metadata only.',
    metadata: createRealReadOnlyAdapterMetadata({
      requestId: request.id,
      resultId,
      bodyStored: false,
      source: 'codex-kernel.real-read-only-adapter.evidence',
    }),
  };
}

function createRealReadOnlyAdapterAuditSummary(
  request: CodexExecRealReadOnlyAdapterRequest,
  resultId: string,
): CodexExecRealReadOnlyAdapterAuditSummary {
  return {
    id: foundationId('codex_real_read_only_adapter_audit_summary'),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: foundationTimestamp(),
    ...realReadOnlyAdapterMetadataOnlyFlags,
    dryRunId: request.dryRunId,
    requestId: request.id,
    resultId,
    auditEventIds: [],
    beforeStartRequired: true,
    afterFinishRequired: true,
    abortRequired: true,
    failureRequired: true,
    eventCount: 0,
    summary: 'Disabled-default attempt requires audit coverage before any future boundary start.',
    metadata: createRealReadOnlyAdapterMetadata({
      requestId: request.id,
      resultId,
      source: 'codex-kernel.real-read-only-adapter.audit',
    }),
  };
}

function createRealReadOnlyAdapterMetadata(extra: JsonMetadata): JsonMetadata {
  return {
    ...extra,
    ...realReadOnlyAdapterNoApprovalFlags,
    metadataOnly: true,
    bodyStored: false,
  };
}

function prefixedAdapterHash(value: unknown): string {
  return `sha256:${hashText(JSON.stringify(sortJson(value)))}`;
}

function sortJson(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(sortJson);
  }

  if (typeof value !== 'object' || value === null) {
    return value;
  }

  return Object.fromEntries(
    Object.entries(value)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, nestedValue]) => [key, sortJson(nestedValue)]),
  );
}

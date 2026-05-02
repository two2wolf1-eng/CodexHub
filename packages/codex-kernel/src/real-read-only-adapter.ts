import { resolve } from 'node:path';
import type {
  AuditEvent,
  CodexExecApprovalArtifact,
  CodexExecDryRunPlan,
  CodexExecRealReadOnlyAdapterAuditSummary,
  CodexExecRealReadOnlyAdapterAttemptQuery,
  CodexExecRealReadOnlyAdapterAttemptRecord,
  CodexExecRealReadOnlyAdapterAttemptStatus,
  CodexExecRealReadOnlyAdapterAttemptSummary,
  CodexExecRealReadOnlyAdapterAttemptTimelineQuery,
  CodexExecRealReadOnlyAdapterAttemptTimelineSummary,
  CodexExecRealReadOnlyAdapterBoundaryDeferredDiagnostics,
  CodexExecRealReadOnlyAdapterBoundaryDeferredReasonCode,
  CodexExecRealReadOnlyAdapterBoundaryDiagnostics,
  CodexExecRealReadOnlyAdapterBoundaryFailureCode,
  CodexExecRealReadOnlyAdapterBoundaryDiagnosticsMissingField,
  CodexExecRealReadOnlyAdapterBoundaryPlan,
  CodexExecRealReadOnlyAdapterConfig,
  CodexExecRealReadOnlyAdapterError,
  CodexExecRealReadOnlyAdapterEvidenceSummary,
  CodexExecRealReadOnlyAdapterNonzeroExitKind,
  CodexExecRealReadOnlyAdapterPreflight,
  CodexExecRealReadOnlyAdapterPreflightCheck,
  CodexExecRealReadOnlyAdapterRequest,
  CodexExecRealReadOnlyAdapterResult,
  CodexExecLiveConfig,
  EvidenceRef,
  PolicyDecision,
} from '@codexhub/contracts';
import { SchemaVersionSchema, foundationId, foundationTimestamp } from '@codexhub/contracts';
import { createEvidenceRef, hashText } from '@codexhub/evidence-kernel';
import type {
  CodexExecRealReadOnlyAdapterPostRunVerificationResult,
  CodexExecRealReadOnlyAdapterProcessBoundaryResult,
} from './real-read-only-adapter-process';

type JsonMetadata = Record<string, unknown>;
const boundaryDeferredReasonCodeSet =
  new Set<CodexExecRealReadOnlyAdapterBoundaryDeferredReasonCode>([
    'runtime_worktree_missing',
    'approval_input_missing',
    'executable_resolution_not_run',
    'executable_resolution_blocked',
    'cwd_self_check_not_run',
    'cwd_self_check_failed',
    'boundary_result_missing_after_ready',
    'unknown',
  ]);

function isBoundaryDeferredReasonCode(
  value: unknown,
): value is CodexExecRealReadOnlyAdapterBoundaryDeferredReasonCode {
  return (
    typeof value === 'string' &&
    boundaryDeferredReasonCodeSet.has(
      value as CodexExecRealReadOnlyAdapterBoundaryDeferredReasonCode,
    )
  );
}

const nonzeroExitKindSet = new Set<CodexExecRealReadOnlyAdapterNonzeroExitKind>([
  'codex_cli_usage_error_suspected',
  'codex_cli_input_missing_suspected',
  'codex_cli_auth_or_config_error_suspected',
  'codex_cli_runtime_error_suspected',
  'unknown',
]);

function normalizeNonzeroExitKind(
  value: unknown,
): CodexExecRealReadOnlyAdapterNonzeroExitKind | undefined {
  return typeof value === 'string' &&
    nonzeroExitKindSet.has(value as CodexExecRealReadOnlyAdapterNonzeroExitKind)
    ? (value as CodexExecRealReadOnlyAdapterNonzeroExitKind)
    : undefined;
}

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

export type CodexExecRealReadOnlyAdapterInjectedWorktreeStatus =
  | 'clean'
  | 'dirty'
  | 'missing'
  | 'unknown';

export interface CodexExecRealReadOnlyAdapterInjectedWorktreeState {
  isolated: boolean;
  status: CodexExecRealReadOnlyAdapterInjectedWorktreeStatus;
  pathHash?: string;
}

export interface CodexExecRealReadOnlyAdapterGuardInput {
  dryRunId?: string;
  request?: CodexExecRealReadOnlyAdapterRequest;
  config?: CodexExecRealReadOnlyAdapterConfig;
  dryRunPlan?: CodexExecDryRunPlan;
  policyDecision?: PolicyDecision;
  approvalArtifact?: CodexExecApprovalArtifact;
  expectedDryRunPlanHash?: string;
  expectedPolicyDecisionHash?: string;
  requestedSandboxMode?: 'read_only' | 'workspace_write' | 'danger_full_access';
  triggerKind?: 'cli' | 'dashboard';
  worktree?: CodexExecRealReadOnlyAdapterInjectedWorktreeState;
  evidenceStoreReady?: boolean;
  auditStoreReady?: boolean;
  now?: string;
  metadata?: JsonMetadata;
}

export function hashRealReadOnlyAdapterRuntimeWorktreePath(worktreePath: string): string {
  const normalizedAbsolutePath = resolve(worktreePath).replace(/\\/g, '/');
  return `sha256:${hashText(normalizedAbsolutePath)}`;
}

export interface CodexExecRealReadOnlyAdapterAttemptTelemetryInput {
  request: CodexExecRealReadOnlyAdapterRequest;
  preflight: CodexExecRealReadOnlyAdapterPreflight;
  resultId?: string;
  resultStatus?: CodexExecRealReadOnlyAdapterResult['status'];
  boundaryResult?: CodexExecRealReadOnlyAdapterProcessBoundaryResult;
  metadata?: JsonMetadata;
}

export interface CodexExecRealReadOnlyAdapterBlockedResultInput {
  request: CodexExecRealReadOnlyAdapterRequest;
  preflight: CodexExecRealReadOnlyAdapterPreflight;
  config: CodexExecRealReadOnlyAdapterConfig;
  metadata?: JsonMetadata;
}

export interface CodexExecRealReadOnlyAdapterAttemptRecordInput {
  request: CodexExecRealReadOnlyAdapterRequest;
  preflight: CodexExecRealReadOnlyAdapterPreflight;
  result: CodexExecRealReadOnlyAdapterResult;
  boundaryResult?: CodexExecRealReadOnlyAdapterProcessBoundaryResult;
  postRunVerificationResult?: CodexExecRealReadOnlyAdapterPostRunVerificationResult;
  evidenceRefs?: EvidenceRef[];
  auditEvents?: AuditEvent[];
  metadata?: JsonMetadata;
}

export interface CodexExecRealReadOnlyAdapterAttemptTimelineInput {
  dryRunId: string;
  records: CodexExecRealReadOnlyAdapterAttemptRecord[];
  query?: Partial<CodexExecRealReadOnlyAdapterAttemptTimelineQuery>;
  metadata?: JsonMetadata;
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

export function createRealReadOnlyAdapterConfigFromLiveConfig(input: {
  liveConfig: CodexExecLiveConfig;
  metadata?: JsonMetadata;
}): CodexExecRealReadOnlyAdapterConfig {
  const allowedSandboxModes = new Set(input.liveConfig.allowedSandboxModes);
  const forbiddenSandboxModes = new Set(input.liveConfig.forbiddenSandboxModes);
  const readOnlyOnly =
    allowedSandboxModes.size === 1 &&
    allowedSandboxModes.has('read_only') &&
    !forbiddenSandboxModes.has('read_only');
  const forbiddenModesCovered =
    forbiddenSandboxModes.has('workspace_write') && forbiddenSandboxModes.has('danger_full_access');
  const configuredEnabled =
    input.liveConfig.liveEnabled === true && readOnlyOnly && forbiddenModesCovered;
  const baseConfig = createDefaultRealReadOnlyAdapterConfig({
    ...(input.metadata ?? {}),
    liveConfigId: input.liveConfig.id,
    liveConfigSource: input.liveConfig.configSource,
    liveConfigEnabled: input.liveConfig.liveEnabled,
    source: 'codex-kernel.real-read-only-adapter.config-authority',
  });

  return {
    ...baseConfig,
    status: configuredEnabled ? 'enabled' : 'disabled',
    configuredEnabled,
    summary: configuredEnabled
      ? 'Real read-only adapter config is explicitly enabled for CLI-only read_only attempts; execution remains gated.'
      : 'Real read-only adapter config is disabled or not restricted to the approved read_only-only policy.',
    metadata: createRealReadOnlyAdapterMetadata({
      ...(input.metadata ?? {}),
      liveConfigId: input.liveConfig.id,
      liveConfigSource: input.liveConfig.configSource,
      liveConfigEnabled: input.liveConfig.liveEnabled,
      readOnlyOnly,
      forbiddenModesCovered,
      source: 'codex-kernel.real-read-only-adapter.config-authority',
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

export function createRealReadOnlyAdapterGuardPreflight(
  input: CodexExecRealReadOnlyAdapterGuardInput,
): CodexExecRealReadOnlyAdapterPreflight {
  const config = input.config ?? createDefaultRealReadOnlyAdapterConfig(input.metadata);
  const dryRunId = input.request?.dryRunId ?? input.dryRunPlan?.id ?? input.dryRunId ?? 'missing_dry_run';
  const request =
    input.request ??
    createRealReadOnlyAdapterRequest({
      dryRunId,
      config,
      approvalArtifactId: input.approvalArtifact?.id,
      policyDecisionId: input.policyDecision?.id,
      requestedSandboxMode: 'read_only',
      triggerKind: 'cli',
      metadata: input.metadata,
    });
  const requestedSandboxMode = input.requestedSandboxMode ?? request.requestedSandboxMode;
  const triggerKind = input.triggerKind ?? request.triggerKind;
  const expectedDryRunPlanHash = input.expectedDryRunPlanHash;
  const expectedPolicyDecisionHash = input.expectedPolicyDecisionHash;
  const approvalArtifact = input.approvalArtifact;
  const nowMs = Date.parse(input.now ?? foundationTimestamp());
  const checks = [
    createRealReadOnlyAdapterPreflightCheck({
      code: 'config_explicit_enable',
      label: 'Explicit config enablement',
      status: config.configuredEnabled && config.status === 'enabled' ? 'passed' : 'failed',
      required: true,
      summary: config.configuredEnabled
        ? 'Explicit read-only adapter config enablement is present.'
        : 'Explicit read-only adapter config enablement is required.',
    }),
    createRealReadOnlyAdapterPreflightCheck({
      code: 'dry_run_exists',
      label: 'Existing dry-run',
      status: input.dryRunPlan && dryRunId !== 'missing_dry_run' ? 'passed' : 'failed',
      required: true,
      summary: input.dryRunPlan
        ? 'Existing dry-run metadata is present.'
        : 'Existing dry-run metadata is required.',
    }),
    createRealReadOnlyAdapterPreflightCheck({
      code: 'policy_decision_exists',
      label: 'Policy decision',
      status: input.policyDecision && input.policyDecision.outcome !== 'deny' ? 'passed' : 'failed',
      required: true,
      summary: input.policyDecision
        ? `Policy decision outcome is ${input.policyDecision.outcome}.`
        : 'Policy decision metadata is required.',
    }),
    createRealReadOnlyAdapterPreflightCheck({
      code: 'approval_artifact_exists',
      label: 'Approval artifact',
      status: approvalArtifact ? 'passed' : 'failed',
      required: true,
      summary: approvalArtifact
        ? 'Approval artifact metadata is present.'
        : 'Approval artifact metadata is required.',
    }),
    createRealReadOnlyAdapterPreflightCheck({
      code: 'approval_artifact_valid',
      label: 'Approval artifact valid',
      status: isApprovalArtifactValid(approvalArtifact, nowMs) ? 'passed' : 'failed',
      required: true,
      summary: isApprovalArtifactValid(approvalArtifact, nowMs)
        ? 'Approval artifact is approved, unexpired, unrevoked, and unused.'
        : 'Approval artifact must be approved, unexpired, unrevoked, and unused.',
    }),
    createRealReadOnlyAdapterPreflightCheck({
      code: 'dry_run_hash_match',
      label: 'Dry-run hash match',
      status:
        approvalArtifact && expectedDryRunPlanHash && approvalArtifact.dryRunPlanHash === expectedDryRunPlanHash
          ? 'passed'
          : 'failed',
      required: true,
      summary: 'Approval artifact dryRunPlanHash must match the current dry-run record.',
    }),
    createRealReadOnlyAdapterPreflightCheck({
      code: 'policy_hash_match',
      label: 'Policy hash match',
      status:
        approvalArtifact &&
        expectedPolicyDecisionHash &&
        approvalArtifact.policyDecisionHash === expectedPolicyDecisionHash
          ? 'passed'
          : 'failed',
      required: true,
      summary: 'Approval artifact policyDecisionHash must match the current policy record.',
    }),
    createRealReadOnlyAdapterPreflightCheck({
      code: 'sandbox_read_only',
      label: 'Read-only sandbox',
      status:
        requestedSandboxMode === 'read_only' && input.dryRunPlan?.sandboxMode !== 'workspace_write'
          ? 'passed'
          : 'blocked',
      required: true,
      summary: 'Only read_only sandbox mode is allowed.',
    }),
    createRealReadOnlyAdapterPreflightCheck({
      code: 'danger_full_access_forbidden',
      label: 'danger_full_access forbidden',
      status:
        requestedSandboxMode === 'danger_full_access' ||
        input.dryRunPlan?.sandboxMode === 'danger_full_access'
          ? 'blocked'
          : 'passed',
      required: true,
      summary: 'danger_full_access remains forbidden for the read-only adapter.',
    }),
    createRealReadOnlyAdapterPreflightCheck({
      code: 'dashboard_trigger_forbidden',
      label: 'Dashboard trigger forbidden',
      status: triggerKind === 'cli' ? 'passed' : 'blocked',
      required: true,
      summary: 'Read-only adapter attempts must remain CLI-only.',
    }),
    createRealReadOnlyAdapterPreflightCheck({
      code: 'isolated_worktree_clean',
      label: 'Isolated clean worktree',
      status: input.worktree?.isolated && input.worktree.status === 'clean' ? 'passed' : 'failed',
      required: true,
      summary: 'An injected isolated clean worktree state is required before boundary planning.',
    }),
    createRealReadOnlyAdapterPreflightCheck({
      code: 'evidence_store_ready',
      label: 'Evidence store ready',
      status: input.evidenceStoreReady === true ? 'passed' : 'failed',
      required: true,
      summary: 'Evidence store readiness is required before boundary planning.',
    }),
    createRealReadOnlyAdapterPreflightCheck({
      code: 'audit_store_ready',
      label: 'Audit store ready',
      status: input.auditStoreReady === true ? 'passed' : 'failed',
      required: true,
      summary: 'Audit store readiness is required before boundary planning.',
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
  const boundaryPlan =
    status === 'passed'
      ? createRealReadOnlyAdapterDeferredBoundaryPlan({
          request,
          dryRunPlanHash: expectedDryRunPlanHash ?? approvalArtifact?.dryRunPlanHash ?? 'missing_hash',
          policyDecisionHash:
            expectedPolicyDecisionHash ?? approvalArtifact?.policyDecisionHash ?? 'missing_hash',
          approvalArtifact,
        })
      : undefined;

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
    boundaryPlan,
    checks,
    hardGateCount: checks.filter((check) => check.required).length,
    passedGateCount: checks.filter((check) => check.status === 'passed').length,
    failedGateCount: failedChecks.length,
    requiresReviewCount: requiresReviewChecks.length,
    blockerCount: blockedChecks.length,
    summary:
      status === 'passed'
        ? 'Read-only adapter hard gates passed; boundary plan remains deferred metadata.'
        : 'Read-only adapter hard gates failed before boundary planning.',
    metadata: createRealReadOnlyAdapterMetadata({
      source: 'codex-kernel.real-read-only-adapter.guard-preflight',
    }),
  };
}

export function createRealReadOnlyAdapterDeferredBoundaryPlan(input: {
  request: CodexExecRealReadOnlyAdapterRequest;
  dryRunPlanHash: string;
  policyDecisionHash: string;
  approvalArtifact?: CodexExecApprovalArtifact;
}): CodexExecRealReadOnlyAdapterBoundaryPlan {
  return {
    id: foundationId('codex_real_read_only_adapter_boundary_plan'),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: foundationTimestamp(),
    ...realReadOnlyAdapterMetadataOnlyFlags,
    ...realReadOnlyAdapterNoRunnableBoundaryFlags,
    requestId: input.request.id,
    dryRunId: input.request.dryRunId,
    processBoundaryDeferred: true,
    adapterModuleRef: 'packages/codex-kernel/src/real-read-only-adapter-process.ts',
    dryRunPlanHash: input.dryRunPlanHash,
    policyDecisionHash: input.policyDecisionHash,
    approvalArtifactHash: input.approvalArtifact
      ? prefixedAdapterHash({
          id: input.approvalArtifact.id,
          dryRunPlanHash: input.approvalArtifact.dryRunPlanHash,
          policyDecisionHash: input.approvalArtifact.policyDecisionHash,
          status: input.approvalArtifact.status,
        })
      : undefined,
    evidencePlanSummary: 'Evidence must remain metadata/hash-only; no raw bodies may be stored.',
    auditPlanSummary: 'Audit must include before, after, abort, and failure events.',
    summary: 'Boundary plan is metadata-only and deferred until the approved process-boundary phase.',
    metadata: createRealReadOnlyAdapterMetadata({
      requestId: input.request.id,
      source: 'codex-kernel.real-read-only-adapter.boundary-plan',
    }),
  };
}

export function createDisabledRealReadOnlyAdapterResult(
  input: CodexExecRealReadOnlyAdapterAttemptInput,
): CodexExecRealReadOnlyAdapterResult {
  const config = input.config ?? createDefaultRealReadOnlyAdapterConfig(input.metadata);
  const request = createRealReadOnlyAdapterRequest({ ...input, config });
  const preflight = createDisabledRealReadOnlyAdapterPreflight(request, config);
  return createRealReadOnlyAdapterBlockedResult({ request, preflight, config, metadata: input.metadata });
}

export function createRealReadOnlyAdapterBlockedResult(
  input: CodexExecRealReadOnlyAdapterBlockedResultInput,
): CodexExecRealReadOnlyAdapterResult {
  const { request, preflight, config } = input;
  const firstBlockingCheck = preflight.checks.find(
    (check) => check.status === 'blocked' || check.status === 'failed',
  );
  const errorCode = realReadOnlyAdapterErrorCodeForCheck(config, firstBlockingCheck?.code);
  const error = createRealReadOnlyAdapterError({
    code: errorCode,
    relatedCheckCode: firstBlockingCheck?.code,
    messageSummary:
      errorCode === 'boundary_deferred'
        ? 'Adapter boundary was not invoked because no guarded boundary result is available.'
        : firstBlockingCheck?.summary ?? 'Read-only adapter hard gate failed before boundary planning.',
    remediationSummary:
      errorCode === 'config_disabled'
        ? 'Use an explicitly reviewed config only after all hard gates are implemented.'
        : 'Resolve the failed hard gate before retrying the CLI-only read-only attempt.',
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
    summary: 'Read-only adapter attempt stopped before process boundary start; no raw process data stored.',
    metadata: createRealReadOnlyAdapterMetadata({
      ...(input.metadata ?? {}),
      configId: config.id,
      requestId: request.id,
      preflightId: preflight.id,
      errorCode: error.code,
      source: 'codex-kernel.real-read-only-adapter.result',
    }),
  };
}

export function createRealReadOnlyAdapterResultFromBoundary(input: {
  request: CodexExecRealReadOnlyAdapterRequest;
  preflight: CodexExecRealReadOnlyAdapterPreflight;
  boundaryResult: CodexExecRealReadOnlyAdapterProcessBoundaryResult;
  metadata?: JsonMetadata;
}): CodexExecRealReadOnlyAdapterResult {
  const resultId = foundationId('codex_real_read_only_adapter_result');
  const boundaryDiagnostics = createRealReadOnlyAdapterBoundaryDiagnostics(input.boundaryResult);
  const error =
    input.boundaryResult.status === 'completed'
      ? undefined
      : createRealReadOnlyAdapterError({
          code:
            input.boundaryResult.status === 'aborted' ? 'boundary_aborted' : 'boundary_failed',
          messageSummary: `Read-only adapter boundary ${input.boundaryResult.status}; metadata-only diagnostics classify ${boundaryDiagnostics.failureCode}.`,
          remediationSummary:
            'Review boundary diagnostics, evidence refs, and audit refs before any retry; raw output and paths remain unavailable by design.',
        });

  return {
    id: resultId,
    schemaVersion: SchemaVersionSchema.value,
    createdAt: foundationTimestamp(),
    ...realReadOnlyAdapterMetadataOnlyFlags,
    requestId: input.request.id,
    dryRunId: input.request.dryRunId,
    preflightId: input.preflight.id,
    status: input.boundaryResult.status,
    boundaryPlanId: input.preflight.boundaryPlan?.id,
    error,
    evidenceSummary: createRealReadOnlyAdapterEvidenceSummary(input.request, resultId),
    auditSummary: createRealReadOnlyAdapterAuditSummary(input.request, resultId),
    postRunVerificationRequired: true,
    workspaceMutationAllowed: false,
    unexpectedWorkspaceDiffCritical: true,
    autoRevertAllowed: false,
    summary: `Read-only adapter boundary produced ${input.boundaryResult.status} metadata only.`,
    metadata: createRealReadOnlyAdapterTelemetryMetadata(
      {
        ...(input.metadata ?? {}),
        requestId: input.request.id,
        preflightId: input.preflight.id,
        boundaryStatus: input.boundaryResult.status,
        boundaryFailureCode: boundaryDiagnostics.failureCode,
        boundaryStartFailureKind: boundaryDiagnostics.startFailureKind,
        boundaryNonzeroExitKind: boundaryDiagnostics.nonzeroExitKind,
        boundaryPlatform: boundaryDiagnostics.platform,
        boundaryResolvedExecutableKind: boundaryDiagnostics.resolvedExecutableKind,
        boundaryExitCode: boundaryDiagnostics.exitCode,
        boundarySignal: boundaryDiagnostics.signal,
        boundaryTimedOut: boundaryDiagnostics.timedOut,
        boundaryCancelled: boundaryDiagnostics.cancelled,
        boundaryDurationMs: boundaryDiagnostics.durationMs,
        boundaryPlanId: input.preflight.boundaryPlan?.id,
        outputBodyStored: false,
        source: 'codex-kernel.real-read-only-adapter.boundary-result',
      },
      input.boundaryResult.externalProcessStarted === true,
    ),
  };
}

export function createRealReadOnlyAdapterBoundaryDiagnostics(
  boundaryResult: CodexExecRealReadOnlyAdapterProcessBoundaryResult,
): CodexExecRealReadOnlyAdapterBoundaryDiagnostics {
  const failureCode = classifyRealReadOnlyAdapterBoundaryFailure(boundaryResult);

  return {
    id: foundationId('codex_real_read_only_adapter_boundary_diagnostics'),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: foundationTimestamp(),
    ...realReadOnlyAdapterMetadataOnlyFlags,
    status: boundaryResult.status,
    failureCode,
    startFailureKind: boundaryResult.startFailureKind,
    enoentKind: boundaryResult.enoentKind,
    platform: boundaryResult.platform,
    resolvedExecutableKind: boundaryResult.resolvedExecutableKind,
    spawnTargetKind: boundaryResult.spawnTargetKind,
    cwdHash: boundaryResult.cwdHash,
    cwdExists: boundaryResult.cwdExists,
    cwdIsDirectory: boundaryResult.cwdIsDirectory,
    executableHash: boundaryResult.executableHash,
    executableExists: boundaryResult.executableExists,
    executableAccessible: boundaryResult.executableAccessible,
    executableResolutionSource: boundaryResult.executableResolutionSource,
    dependencyResolutionStatus: boundaryResult.dependencyResolutionStatus,
    envAllowlistKeyCount: boundaryResult.envAllowlistKeyCount,
    envAllowlistKeyHash: boundaryResult.envAllowlistKeyHash,
    exitCode: boundaryResult.exitCode,
    nonzeroExitKind: boundaryResult.nonzeroExitKind,
    signal: boundaryResult.signal,
    timedOut: boundaryResult.timedOut,
    cancelled: boundaryResult.cancelled,
    durationMs: boundaryResult.durationMs,
    stdoutHash: boundaryResult.stdoutSummary.contentHash,
    stderrHash: boundaryResult.stderrSummary.contentHash,
    stdoutByteLength: boundaryResult.stdoutSummary.byteLength,
    stderrByteLength: boundaryResult.stderrSummary.byteLength,
    stdoutLineCount: boundaryResult.stdoutSummary.lineCount,
    stderrLineCount: boundaryResult.stderrSummary.lineCount,
    stdoutTruncated: boundaryResult.stdoutSummary.truncated,
    stderrTruncated: boundaryResult.stderrSummary.truncated,
    externalProcessStarted: boundaryResult.externalProcessStarted,
    summary:
      failureCode === 'none'
        ? 'Boundary completed; diagnostics contain output hashes and counts only.'
        : `Boundary ended as ${boundaryResult.status}; diagnostics classify ${failureCode} using hashes and counts only.`,
    metadata: createRealReadOnlyAdapterTelemetryMetadata(
      {
        boundaryStatus: boundaryResult.status,
        boundaryFailureCode: failureCode,
        boundaryStartFailureKind: boundaryResult.startFailureKind,
        boundaryEnoentKind: boundaryResult.enoentKind,
        boundaryPlatform: boundaryResult.platform,
        boundaryResolvedExecutableKind: boundaryResult.resolvedExecutableKind,
        boundarySpawnTargetKind: boundaryResult.spawnTargetKind,
        cwdHash: boundaryResult.cwdHash,
        cwdExists: boundaryResult.cwdExists,
        cwdIsDirectory: boundaryResult.cwdIsDirectory,
        executableHash: boundaryResult.executableHash,
        executableExists: boundaryResult.executableExists,
        executableAccessible: boundaryResult.executableAccessible,
        executableResolutionSource: boundaryResult.executableResolutionSource,
        dependencyResolutionStatus: boundaryResult.dependencyResolutionStatus,
        envAllowlistKeyCount: boundaryResult.envAllowlistKeyCount,
        envAllowlistKeyHash: boundaryResult.envAllowlistKeyHash,
        nonzeroExitKind: boundaryResult.nonzeroExitKind,
        outputBodyStored: false,
        source: 'codex-kernel.real-read-only-adapter.boundary-diagnostics',
      },
      boundaryResult.externalProcessStarted,
    ),
  };
}

type BoundaryDiagnosticDataField = Exclude<
  CodexExecRealReadOnlyAdapterBoundaryDiagnosticsMissingField,
  'boundaryDiagnostics' | 'postRunVerificationSkipReason'
>;

const requiredBoundaryDiagnosticFields = [
  'status',
  'failureCode',
  'startFailureKind',
  'platform',
  'resolvedExecutableKind',
  'cwdHash',
  'cwdExists',
  'cwdIsDirectory',
  'executableExists',
  'executableAccessible',
  'envAllowlistKeyCount',
  'envAllowlistKeyHash',
  'timedOut',
  'cancelled',
  'durationMs',
  'stdoutHash',
  'stderrHash',
  'stdoutByteLength',
  'stderrByteLength',
  'stdoutLineCount',
  'stderrLineCount',
  'stdoutTruncated',
  'stderrTruncated',
  'externalProcessStarted',
] as const satisfies ReadonlyArray<BoundaryDiagnosticDataField>;

const requiredProcessStartDiagnosticFields = [
  'enoentKind',
  'spawnTargetKind',
  'executableHash',
  'executableResolutionSource',
  'dependencyResolutionStatus',
] as const satisfies ReadonlyArray<BoundaryDiagnosticDataField>;

function uniqueBoundaryDiagnosticMissingFields(
  fields: CodexExecRealReadOnlyAdapterBoundaryDiagnosticsMissingField[],
): CodexExecRealReadOnlyAdapterBoundaryDiagnosticsMissingField[] {
  return Array.from(new Set(fields));
}

function hasBoundaryDiagnosticField(
  diagnostics: CodexExecRealReadOnlyAdapterBoundaryDiagnostics,
  field: BoundaryDiagnosticDataField,
): boolean {
  return diagnostics[field] !== undefined && diagnostics[field] !== null;
}

function inferNonzeroExitKindForReadback(
  record: Pick<CodexExecRealReadOnlyAdapterAttemptRecord, 'boundaryDiagnostics' | 'metadata'>,
): CodexExecRealReadOnlyAdapterNonzeroExitKind | undefined {
  const diagnostics = record.boundaryDiagnostics;

  if (!diagnostics || diagnostics.failureCode !== 'process_exit_nonzero') {
    return undefined;
  }

  return (
    normalizeNonzeroExitKind(diagnostics.nonzeroExitKind) ??
    normalizeNonzeroExitKind(record.metadata?.boundaryNonzeroExitKind) ??
    normalizeNonzeroExitKind(diagnostics.metadata?.nonzeroExitKind) ??
    normalizeNonzeroExitKind(diagnostics.metadata?.boundaryNonzeroExitKind) ??
    (diagnostics.exitCode === 2 ? 'codex_cli_usage_error_suspected' : undefined)
  );
}

function alignBoundaryDiagnosticsForReadback(
  record: CodexExecRealReadOnlyAdapterAttemptRecord,
): CodexExecRealReadOnlyAdapterBoundaryDiagnostics | undefined {
  if (!record.boundaryDiagnostics) {
    return undefined;
  }

  const nonzeroExitKind = inferNonzeroExitKindForReadback(record);

  if (
    record.boundaryDiagnostics.failureCode !== 'process_exit_nonzero' ||
    nonzeroExitKind === undefined ||
    record.boundaryDiagnostics.nonzeroExitKind === nonzeroExitKind
  ) {
    return record.boundaryDiagnostics;
  }

  return {
    ...record.boundaryDiagnostics,
    nonzeroExitKind,
    metadata: {
      ...(record.boundaryDiagnostics.metadata ?? {}),
      nonzeroExitKind,
      boundaryNonzeroExitKind: nonzeroExitKind,
      nonzeroExitKindInferredFromReadback: true,
      source: 'codex-kernel.real-read-only-adapter.boundary-diagnostics-readback-alignment',
    },
  };
}

export function getRealReadOnlyAdapterBoundaryDiagnosticsMissingFields(
  record: Pick<
    CodexExecRealReadOnlyAdapterAttemptRecord,
    | 'processBoundaryInvoked'
    | 'boundaryDiagnostics'
    | 'postRunVerificationStatus'
    | 'postRunVerificationSkipReason'
  >,
): CodexExecRealReadOnlyAdapterBoundaryDiagnosticsMissingField[] {
  if (!record.processBoundaryInvoked) {
    return [];
  }

  const missingFields: CodexExecRealReadOnlyAdapterBoundaryDiagnosticsMissingField[] = [];

  if (!record.boundaryDiagnostics) {
    missingFields.push('boundaryDiagnostics');
    missingFields.push(...requiredBoundaryDiagnosticFields);
    missingFields.push('exitCode', 'signal');
  } else {
    for (const field of requiredBoundaryDiagnosticFields) {
      if (!hasBoundaryDiagnosticField(record.boundaryDiagnostics, field)) {
        missingFields.push(field);
      }
    }

    if (record.boundaryDiagnostics.failureCode === 'process_exit_nonzero') {
      if (
        record.boundaryDiagnostics.exitCode === undefined ||
        record.boundaryDiagnostics.exitCode === null
      ) {
        missingFields.push('exitCode');
      }
      if (
        record.boundaryDiagnostics.nonzeroExitKind === undefined ||
        record.boundaryDiagnostics.nonzeroExitKind === null
      ) {
        missingFields.push('nonzeroExitKind');
      }
    }

    if (
      record.boundaryDiagnostics.failureCode === 'process_signaled' &&
      record.boundaryDiagnostics.signal === undefined
    ) {
      missingFields.push('signal');
    }

    if (record.boundaryDiagnostics.failureCode === 'process_start_failed') {
      for (const field of requiredProcessStartDiagnosticFields) {
        if (!hasBoundaryDiagnosticField(record.boundaryDiagnostics, field)) {
          missingFields.push(field);
        }
      }
    }
  }

  if (
    record.postRunVerificationStatus === 'skipped' &&
    record.postRunVerificationSkipReason === undefined
  ) {
    missingFields.push('postRunVerificationSkipReason');
  }

  return uniqueBoundaryDiagnosticMissingFields(missingFields);
}

export function alignRealReadOnlyAdapterAttemptRecordDiagnostics(
  record: CodexExecRealReadOnlyAdapterAttemptRecord,
): CodexExecRealReadOnlyAdapterAttemptRecord {
  const boundaryDiagnostics = alignBoundaryDiagnosticsForReadback(record);
  const boundaryDeferredDiagnostics =
    record.boundaryDeferredDiagnostics ??
    inferRealReadOnlyAdapterBoundaryDeferredDiagnostics(record);
  const boundaryDeferredReasonCodes =
    Array.isArray(record.boundaryDeferredReasonCodes) &&
    record.boundaryDeferredReasonCodes.length > 0
      ? record.boundaryDeferredReasonCodes
      : (boundaryDeferredDiagnostics?.reasonCodes ?? []);
  const boundaryDeferredReasonCode =
    record.boundaryDeferredReasonCode ?? boundaryDeferredDiagnostics?.reasonCode;
  const boundaryDiagnosticsMissingFields =
    getRealReadOnlyAdapterBoundaryDiagnosticsMissingFields({
      ...record,
      boundaryDiagnostics,
    });

  return {
    ...record,
    boundaryDiagnostics,
    boundaryDeferredReasonCode,
    boundaryDeferredReasonCodes,
    boundaryDeferredDiagnostics,
    boundaryDiagnosticsComplete:
      record.processBoundaryInvoked && boundaryDiagnosticsMissingFields.length === 0,
    boundaryDiagnosticsMissingFields,
  };
}

export function createRealReadOnlyAdapterBoundaryDeferredDiagnostics(input: {
  request: CodexExecRealReadOnlyAdapterRequest;
  preflight: CodexExecRealReadOnlyAdapterPreflight;
  result: CodexExecRealReadOnlyAdapterResult;
  metadata?: JsonMetadata;
}): CodexExecRealReadOnlyAdapterBoundaryDeferredDiagnostics | undefined {
  if (input.preflight.status !== 'passed' || input.result.error?.code !== 'boundary_deferred') {
    return undefined;
  }

  const metadata = {
    ...(input.request.metadata ?? {}),
    ...(input.metadata ?? {}),
  };
  const runtimeWorktreeProvided =
    metadataBoolean(metadata, 'runtimeWorktreeProvided') ??
    metadataBoolean(metadata, 'isolatedWorktreeProvided') ??
    false;
  const approvalInputProvided =
    input.request.approvalArtifactId !== undefined ||
    metadataString(metadata, 'approvalArtifactId') !== undefined ||
    metadataBoolean(metadata, 'approvalInputProvided') === true;
  const executableResolutionStatus = normalizeDeferredExecutableResolutionStatus(
    metadataString(metadata, 'executableResolutionStatus'),
  );
  const cwdSelfCheckStatus = normalizeDeferredCwdSelfCheckStatus(
    metadataString(metadata, 'cwdSelfCheckStatus'),
  );
  const executableResolutionReasonCode = metadataString(
    metadata,
    'executableResolutionReasonCode',
  );
  const cwdSelfCheckReasonCode = metadataString(metadata, 'cwdSelfCheckReasonCode');
  const sourcePreparationReady = metadataBoolean(metadata, 'sourcePreparationReady');
  const prerequisiteReady = metadataBoolean(metadata, 'prerequisiteReady');
  const worktreePathHashMatched = metadataBoolean(metadata, 'worktreePathHashMatched');
  const processBoundaryReady =
    runtimeWorktreeProvided &&
    approvalInputProvided &&
    executableResolutionStatus === 'resolved' &&
    cwdSelfCheckStatus === 'passed';
  const reasonCodes = classifyBoundaryDeferredReasonCodes({
    runtimeWorktreeProvided,
    approvalInputProvided,
    executableResolutionStatus,
    cwdSelfCheckStatus,
    processBoundaryReady,
  });

  return {
    id: foundationId('codex_real_read_only_adapter_boundary_deferred_diagnostics'),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: foundationTimestamp(),
    ...realReadOnlyAdapterMetadataOnlyFlags,
    reasonCode: reasonCodes[0] ?? 'unknown',
    reasonCodes,
    preflightStatus: input.preflight.status,
    runtimeWorktreeProvided,
    approvalInputProvided,
    executableResolutionStatus,
    executableResolutionReasonCode,
    cwdSelfCheckStatus,
    cwdSelfCheckReasonCode,
    sourcePreparationReady,
    prerequisiteReady,
    worktreePathHashMatched,
    processBoundaryReady,
    summary:
      reasonCodes[0] === 'boundary_result_missing_after_ready'
        ? 'Boundary was deferred even though runtime inputs and pre-boundary checks were ready.'
        : 'Boundary was deferred before process invocation; diagnostic metadata names the blocking source.',
    metadata: createRealReadOnlyAdapterMetadata({
      reasonCode: reasonCodes[0] ?? 'unknown',
      reasonCodes,
      preflightStatus: input.preflight.status,
      runtimeWorktreeProvided,
      approvalInputProvided,
      executableResolutionStatus,
      executableResolutionReasonCode,
      cwdSelfCheckStatus,
      cwdSelfCheckReasonCode,
      sourcePreparationReady,
      prerequisiteReady,
      worktreePathHashMatched,
      processBoundaryReady,
      worktreePathStored: false,
      executablePathStored: false,
      argvStored: false,
      envPlanStored: false,
      source: 'codex-kernel.real-read-only-adapter.boundary-deferred-diagnostics',
    }),
  };
}

export function createDisabledRealReadOnlyAdapter(): CodexExecRealReadOnlyAdapter {
  return {
    attempt: async (input) => createDisabledRealReadOnlyAdapterResult(input),
  };
}

export function createRealReadOnlyAdapterAttemptEvidenceRefs(
  input: CodexExecRealReadOnlyAdapterAttemptTelemetryInput,
): EvidenceRef[] {
  const resultId = input.resultId ?? 'pending_result';
  const boundaryResult = input.boundaryResult;
  const refs: EvidenceRef[] = [
    createEvidenceRef({
      kind: 'hash',
      label: 'codex.real_read_only_adapter.attempt.preflight',
      summary: `Read-only adapter attempt preflight ${input.preflight.status}; metadata only.`,
      metadata: createRealReadOnlyAdapterMetadata({
        ...(input.metadata ?? {}),
        requestId: input.request.id,
        dryRunId: input.request.dryRunId,
        preflightId: input.preflight.id,
        preflightStatus: input.preflight.status,
        resultId,
        source: 'codex-kernel.real-read-only-adapter.attempt-evidence.preflight',
      }),
      bodyForHashOnly: stableStringify({
        requestId: input.request.id,
        dryRunId: input.request.dryRunId,
        preflightId: input.preflight.id,
        preflightStatus: input.preflight.status,
        checkStatuses: input.preflight.checks.map((check) => `${check.code}:${check.status}`),
        resultId,
      }),
    }),
  ];

  if (boundaryResult) {
    const boundaryDiagnostics = createRealReadOnlyAdapterBoundaryDiagnostics(boundaryResult);
    refs.push(
      createEvidenceRef({
        kind: 'hash',
        label: 'codex.real_read_only_adapter.attempt.boundary_summary',
        summary: `Read-only adapter boundary ${boundaryResult.status}; output hashes only.`,
        metadata: createRealReadOnlyAdapterTelemetryMetadata({
          ...(input.metadata ?? {}),
          requestId: input.request.id,
          dryRunId: input.request.dryRunId,
          resultId,
          boundaryStatus: boundaryResult.status,
          exitCode: boundaryResult.exitCode,
          signal: boundaryResult.signal,
          timedOut: boundaryResult.timedOut,
          cancelled: boundaryResult.cancelled,
          boundaryFailureCode: boundaryDiagnostics.failureCode,
          startFailureKind: boundaryDiagnostics.startFailureKind,
          enoentKind: boundaryDiagnostics.enoentKind,
          platform: boundaryDiagnostics.platform,
          resolvedExecutableKind: boundaryDiagnostics.resolvedExecutableKind,
          spawnTargetKind: boundaryDiagnostics.spawnTargetKind,
          cwdHash: boundaryDiagnostics.cwdHash,
          cwdExists: boundaryDiagnostics.cwdExists,
          cwdIsDirectory: boundaryDiagnostics.cwdIsDirectory,
          executableHash: boundaryDiagnostics.executableHash,
          executableExists: boundaryDiagnostics.executableExists,
          executableAccessible: boundaryDiagnostics.executableAccessible,
          executableResolutionSource: boundaryDiagnostics.executableResolutionSource,
          dependencyResolutionStatus: boundaryDiagnostics.dependencyResolutionStatus,
          envAllowlistKeyCount: boundaryDiagnostics.envAllowlistKeyCount,
          envAllowlistKeyHash: boundaryDiagnostics.envAllowlistKeyHash,
          nonzeroExitKind: boundaryDiagnostics.nonzeroExitKind,
          durationMs: boundaryDiagnostics.durationMs,
          stdoutHash: boundaryResult.stdoutSummary.contentHash,
          stderrHash: boundaryResult.stderrSummary.contentHash,
          stdoutByteLength: boundaryDiagnostics.stdoutByteLength,
          stderrByteLength: boundaryDiagnostics.stderrByteLength,
          stdoutLineCount: boundaryDiagnostics.stdoutLineCount,
          stderrLineCount: boundaryDiagnostics.stderrLineCount,
          stdoutTruncated: boundaryDiagnostics.stdoutTruncated,
          stderrTruncated: boundaryDiagnostics.stderrTruncated,
          outputBodyStored: false,
          source: 'codex-kernel.real-read-only-adapter.attempt-evidence.boundary-summary',
        }, boundaryResult.externalProcessStarted),
        bodyForHashOnly: stableStringify({
          requestId: input.request.id,
          dryRunId: input.request.dryRunId,
          resultId,
          boundaryStatus: boundaryResult.status,
          exitCode: boundaryResult.exitCode,
          signal: boundaryResult.signal,
          timedOut: boundaryResult.timedOut,
          cancelled: boundaryResult.cancelled,
          boundaryFailureCode: boundaryDiagnostics.failureCode,
          startFailureKind: boundaryDiagnostics.startFailureKind,
          enoentKind: boundaryDiagnostics.enoentKind,
          platform: boundaryDiagnostics.platform,
          resolvedExecutableKind: boundaryDiagnostics.resolvedExecutableKind,
          spawnTargetKind: boundaryDiagnostics.spawnTargetKind,
          cwdHash: boundaryDiagnostics.cwdHash,
          cwdExists: boundaryDiagnostics.cwdExists,
          cwdIsDirectory: boundaryDiagnostics.cwdIsDirectory,
          executableHash: boundaryDiagnostics.executableHash,
          executableExists: boundaryDiagnostics.executableExists,
          executableAccessible: boundaryDiagnostics.executableAccessible,
          executableResolutionSource: boundaryDiagnostics.executableResolutionSource,
          dependencyResolutionStatus: boundaryDiagnostics.dependencyResolutionStatus,
          envAllowlistKeyCount: boundaryDiagnostics.envAllowlistKeyCount,
          envAllowlistKeyHash: boundaryDiagnostics.envAllowlistKeyHash,
          stdoutSummary: boundaryResult.stdoutSummary,
          stderrSummary: boundaryResult.stderrSummary,
          durationMs: boundaryResult.durationMs,
        }),
      }),
    );
  }

  return refs;
}

export function createRealReadOnlyAdapterAttemptAuditEvents(
  input: CodexExecRealReadOnlyAdapterAttemptTelemetryInput,
  evidenceRefs: EvidenceRef[],
): AuditEvent[] {
  const resultStatus = input.resultStatus ?? resultStatusFromTelemetry(input);
  const boundaryStarted = input.boundaryResult?.externalProcessStarted === true;
  const events: AuditEvent[] = [
    createRealReadOnlyAdapterAuditEvent({
      action: 'codex.exec.real_read_only_adapter.before_boundary',
      outcome: input.preflight.status,
      request: input.request,
      preflight: input.preflight,
      resultId: input.resultId,
      evidenceRefs: evidenceRefs.slice(0, 1),
      externalProcessStarted: false,
      metadata: input.metadata,
    }),
  ];

  if (!input.boundaryResult || input.preflight.status !== 'passed') {
    events.push(
      createRealReadOnlyAdapterAuditEvent({
        action: 'codex.exec.real_read_only_adapter.abort',
        outcome:
          input.preflight.status === 'passed' ? resultStatus : `preflight_${input.preflight.status}`,
        request: input.request,
        preflight: input.preflight,
        resultId: input.resultId,
        evidenceRefs,
        externalProcessStarted: false,
        metadata: {
          ...(input.metadata ?? {}),
          abortBeforeBoundary: true,
        },
      }),
    );
    return events;
  }

  const terminalAction =
    input.boundaryResult.status === 'completed'
      ? 'codex.exec.real_read_only_adapter.after_finish'
      : input.boundaryResult.status === 'failed'
        ? 'codex.exec.real_read_only_adapter.failure'
        : 'codex.exec.real_read_only_adapter.abort';

  events.push(
    createRealReadOnlyAdapterAuditEvent({
      action: terminalAction,
      outcome: input.boundaryResult.status,
      request: input.request,
      preflight: input.preflight,
      resultId: input.resultId,
      evidenceRefs,
      externalProcessStarted: boundaryStarted,
      metadata: {
        ...(input.metadata ?? {}),
        boundaryStatus: input.boundaryResult.status,
        exitCode: input.boundaryResult.exitCode,
        signal: input.boundaryResult.signal,
        timedOut: input.boundaryResult.timedOut,
        cancelled: input.boundaryResult.cancelled,
        boundaryFailureCode: createRealReadOnlyAdapterBoundaryDiagnostics(input.boundaryResult)
          .failureCode,
        outputBodyStored: false,
      },
    }),
  );

  return events;
}

export function createRealReadOnlyAdapterEvidenceSummaryFromRefs(
  input: CodexExecRealReadOnlyAdapterAttemptTelemetryInput,
  evidenceRefs: EvidenceRef[],
): CodexExecRealReadOnlyAdapterEvidenceSummary {
  const boundaryResult = input.boundaryResult;
  const boundaryDiagnostics = boundaryResult
    ? createRealReadOnlyAdapterBoundaryDiagnostics(boundaryResult)
    : undefined;
  const outputHashCount = boundaryResult ? 2 : 0;
  const eventHashCount = input.preflight.checks.length + outputHashCount;
  const resultId = input.resultId ?? 'pending_result';

  return {
    id: foundationId('codex_real_read_only_adapter_evidence_summary'),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: foundationTimestamp(),
    ...realReadOnlyAdapterMetadataOnlyFlags,
    dryRunId: input.request.dryRunId,
    requestId: input.request.id,
    resultId,
    evidenceRefIds: evidenceRefs.map((ref) => ref.id),
    eventHashCount,
    outputHashCount,
    metadataHash: prefixedAdapterHash({
      requestId: input.request.id,
      dryRunId: input.request.dryRunId,
      resultId,
      evidenceRefIds: evidenceRefs.map((ref) => ref.id),
      preflightStatus: input.preflight.status,
      boundaryStatus: boundaryResult?.status,
      boundaryFailureCode: boundaryDiagnostics?.failureCode,
      outputHashes: boundaryResult
        ? [
            boundaryResult.stdoutSummary.contentHash,
            boundaryResult.stderrSummary.contentHash,
          ]
        : [],
    }),
    redacted: true,
    summary: boundaryResult
      ? 'Read-only adapter attempt evidence stores metadata, hashes, counts, and refs only.'
      : 'Read-only adapter attempt aborted before boundary; evidence stores metadata only.',
    metadata: createRealReadOnlyAdapterTelemetryMetadata(
      {
        ...(input.metadata ?? {}),
        requestId: input.request.id,
        resultId,
        evidenceRefCount: evidenceRefs.length,
        outputHashCount,
        boundaryFailureCode: boundaryDiagnostics?.failureCode,
        source: 'codex-kernel.real-read-only-adapter.evidence-summary',
      },
      boundaryResult?.externalProcessStarted === true,
    ),
  };
}

export function createRealReadOnlyAdapterAuditSummaryFromEvents(
  input: CodexExecRealReadOnlyAdapterAttemptTelemetryInput,
  auditEvents: AuditEvent[],
): CodexExecRealReadOnlyAdapterAuditSummary {
  return {
    id: foundationId('codex_real_read_only_adapter_audit_summary'),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: foundationTimestamp(),
    ...realReadOnlyAdapterMetadataOnlyFlags,
    dryRunId: input.request.dryRunId,
    requestId: input.request.id,
    resultId: input.resultId,
    auditEventIds: auditEvents.map((event) => event.id),
    beforeStartRequired: true,
    afterFinishRequired: true,
    abortRequired: true,
    failureRequired: true,
    eventCount: auditEvents.length,
    summary: 'Read-only adapter attempt audit summary records before, after, failure, or abort metadata only.',
    metadata: createRealReadOnlyAdapterTelemetryMetadata(
      {
        ...(input.metadata ?? {}),
        requestId: input.request.id,
        resultId: input.resultId,
        auditEventCount: auditEvents.length,
        actionKinds: auditEvents.map((event) => event.action),
        source: 'codex-kernel.real-read-only-adapter.audit-summary',
      },
      input.boundaryResult?.externalProcessStarted === true,
    ),
  };
}

export function createRealReadOnlyAdapterAttemptRecord(
  input: CodexExecRealReadOnlyAdapterAttemptRecordInput,
): CodexExecRealReadOnlyAdapterAttemptRecord {
  const evidenceRefIds =
    input.evidenceRefs?.map((ref) => ref.id) ?? input.result.evidenceSummary?.evidenceRefIds ?? [];
  const auditEventIds =
    input.auditEvents?.map((event) => event.id) ?? input.result.auditSummary?.auditEventIds ?? [];
  const status = attemptStatusFromResult(input.result.status);
  const outputHashCount =
    input.result.evidenceSummary?.outputHashCount ?? (input.boundaryResult ? 2 : 0);
  const failedCheckCodes = input.preflight.checks
    .filter((check) => check.status === 'failed')
    .map((check) => check.code);
  const blockedCheckCodes = input.preflight.checks
    .filter((check) => check.status === 'blocked')
    .map((check) => check.code);
  const postRunVerificationStatus =
    input.postRunVerificationResult === undefined
      ? 'not_required'
      : input.postRunVerificationResult.skippedBeforeStart
        ? 'skipped'
        : input.postRunVerificationResult.status;
  const postRunVerificationSkipReason = input.postRunVerificationResult?.skippedBeforeStart
    ? (input.postRunVerificationResult.skipReason ?? 'attempt_not_completed')
    : undefined;
  const workspaceMutationDetected = input.postRunVerificationResult?.workspaceMutationDetected;
  const boundaryDiagnostics = input.boundaryResult
    ? createRealReadOnlyAdapterBoundaryDiagnostics(input.boundaryResult)
    : undefined;
  const boundaryDeferredDiagnostics =
    input.boundaryResult === undefined
      ? createRealReadOnlyAdapterBoundaryDeferredDiagnostics({
          request: input.request,
          preflight: input.preflight,
          result: input.result,
          metadata: input.metadata,
        })
      : undefined;
  const boundaryDeferredReasonCode = boundaryDeferredDiagnostics?.reasonCode;
  const boundaryDeferredReasonCodes = boundaryDeferredDiagnostics?.reasonCodes ?? [];
  const boundaryDiagnosticsMissingFields = getRealReadOnlyAdapterBoundaryDiagnosticsMissingFields({
    processBoundaryInvoked: input.boundaryResult !== undefined,
    boundaryDiagnostics,
    postRunVerificationStatus,
    postRunVerificationSkipReason,
  });
  const boundaryDiagnosticsComplete =
    input.boundaryResult !== undefined && boundaryDiagnosticsMissingFields.length === 0;
  const metadataHash = prefixedAdapterHash({
    requestId: input.request.id,
    preflightId: input.preflight.id,
    resultId: input.result.id,
    status,
    preflightStatus: input.preflight.status,
    resultStatus: input.result.status,
    resultErrorCode: input.result.error?.code,
    failedCheckCodes,
    blockedCheckCodes,
    postRunVerificationStatus,
    workspaceMutationDetected,
    evidenceRefIds,
    auditEventIds,
    outputHashCount,
    processBoundaryInvoked: input.boundaryResult !== undefined,
    boundaryFailureCode: boundaryDiagnostics?.failureCode,
    boundaryStartFailureKind: boundaryDiagnostics?.startFailureKind,
    boundaryPlatform: boundaryDiagnostics?.platform,
    boundaryResolvedExecutableKind: boundaryDiagnostics?.resolvedExecutableKind,
    boundaryCwdHash: boundaryDiagnostics?.cwdHash,
    boundaryCwdExists: boundaryDiagnostics?.cwdExists,
    boundaryCwdIsDirectory: boundaryDiagnostics?.cwdIsDirectory,
    boundaryExecutableExists: boundaryDiagnostics?.executableExists,
    boundaryExecutableAccessible: boundaryDiagnostics?.executableAccessible,
    boundaryEnvAllowlistKeyCount: boundaryDiagnostics?.envAllowlistKeyCount,
    boundaryEnvAllowlistKeyHash: boundaryDiagnostics?.envAllowlistKeyHash,
    boundaryNonzeroExitKind: boundaryDiagnostics?.nonzeroExitKind,
    boundaryExitCode: boundaryDiagnostics?.exitCode,
    boundarySignal: boundaryDiagnostics?.signal,
    boundaryTimedOut: boundaryDiagnostics?.timedOut,
    boundaryCancelled: boundaryDiagnostics?.cancelled,
    boundaryDurationMs: boundaryDiagnostics?.durationMs,
    boundaryStdoutHash: boundaryDiagnostics?.stdoutHash,
    boundaryStderrHash: boundaryDiagnostics?.stderrHash,
    boundaryStdoutByteLength: boundaryDiagnostics?.stdoutByteLength,
    boundaryStderrByteLength: boundaryDiagnostics?.stderrByteLength,
    boundaryStdoutLineCount: boundaryDiagnostics?.stdoutLineCount,
    boundaryStderrLineCount: boundaryDiagnostics?.stderrLineCount,
    boundaryStdoutTruncated: boundaryDiagnostics?.stdoutTruncated,
    boundaryStderrTruncated: boundaryDiagnostics?.stderrTruncated,
    boundaryDeferredReasonCode,
    boundaryDeferredReasonCodes,
    boundaryDiagnosticsComplete,
    boundaryDiagnosticsMissingFields,
    postRunVerificationSkipReason,
  });

  return {
    id: foundationId('codex_real_read_only_adapter_attempt'),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: foundationTimestamp(),
    ...realReadOnlyAdapterMetadataOnlyFlags,
    dryRunId: input.request.dryRunId,
    requestId: input.request.id,
    preflightId: input.preflight.id,
    resultId: input.result.id,
    status,
    authoritative: true,
    supervisorBacked: true,
    persisted: true,
    degraded: false,
    notPersisted: false,
    processBoundaryInvoked: input.boundaryResult !== undefined,
    processBoundaryModuleRef:
      input.boundaryResult === undefined
        ? undefined
        : 'packages/codex-kernel/src/real-read-only-adapter-process.ts',
    preflightStatus: input.preflight.status,
    resultStatus: input.result.status,
    resultErrorCode: input.result.error?.code,
    failedCheckCodes,
    blockedCheckCodes,
    boundaryDeferredReasonCode,
    boundaryDeferredReasonCodes,
    boundaryDeferredDiagnostics,
    boundaryDiagnostics,
    boundaryDiagnosticsComplete,
    boundaryDiagnosticsMissingFields,
    postRunVerificationStatus,
    postRunVerificationSkipReason,
    workspaceMutationDetected,
    evidenceSummary: input.result.evidenceSummary,
    auditSummary: input.result.auditSummary,
    evidenceRefIds,
    auditEventIds,
    outputHashCount,
    metadataHash,
    summary:
      status === 'blocked'
        ? 'Authoritative read-only adapter attempt record captured a blocked guard outcome.'
        : `Authoritative read-only adapter attempt record captured ${status} metadata only.`,
    metadata: createRealReadOnlyAdapterTelemetryMetadata(
      {
        ...(input.metadata ?? {}),
        requestId: input.request.id,
        preflightId: input.preflight.id,
        resultId: input.result.id,
        resultStatus: input.result.status,
        resultErrorCode: input.result.error?.code,
        attemptStatus: status,
        failedCheckCodes,
        blockedCheckCodes,
        boundaryDeferredReasonCode,
        boundaryDeferredReasonCodes,
        boundaryDeferredProcessBoundaryReady: boundaryDeferredDiagnostics?.processBoundaryReady,
        boundaryDeferredExecutableResolutionStatus:
          boundaryDeferredDiagnostics?.executableResolutionStatus,
        boundaryDeferredExecutableResolutionReasonCode:
          boundaryDeferredDiagnostics?.executableResolutionReasonCode,
        boundaryDeferredCwdSelfCheckStatus: boundaryDeferredDiagnostics?.cwdSelfCheckStatus,
        boundaryDeferredCwdSelfCheckReasonCode:
          boundaryDeferredDiagnostics?.cwdSelfCheckReasonCode,
        boundaryFailureCode: boundaryDiagnostics?.failureCode,
        boundaryStartFailureKind: boundaryDiagnostics?.startFailureKind,
        boundaryEnoentKind: boundaryDiagnostics?.enoentKind,
        boundaryPlatform: boundaryDiagnostics?.platform,
        boundaryResolvedExecutableKind: boundaryDiagnostics?.resolvedExecutableKind,
        boundarySpawnTargetKind: boundaryDiagnostics?.spawnTargetKind,
        boundaryCwdHash: boundaryDiagnostics?.cwdHash,
        boundaryCwdExists: boundaryDiagnostics?.cwdExists,
        boundaryCwdIsDirectory: boundaryDiagnostics?.cwdIsDirectory,
        boundaryExecutableHash: boundaryDiagnostics?.executableHash,
        boundaryExecutableExists: boundaryDiagnostics?.executableExists,
        boundaryExecutableAccessible: boundaryDiagnostics?.executableAccessible,
        boundaryExecutableResolutionSource: boundaryDiagnostics?.executableResolutionSource,
        boundaryDependencyResolutionStatus: boundaryDiagnostics?.dependencyResolutionStatus,
        boundaryEnvAllowlistKeyCount: boundaryDiagnostics?.envAllowlistKeyCount,
        boundaryEnvAllowlistKeyHash: boundaryDiagnostics?.envAllowlistKeyHash,
        boundaryNonzeroExitKind: boundaryDiagnostics?.nonzeroExitKind,
        boundaryExitCode: boundaryDiagnostics?.exitCode,
        boundarySignal: boundaryDiagnostics?.signal,
        boundaryTimedOut: boundaryDiagnostics?.timedOut,
        boundaryCancelled: boundaryDiagnostics?.cancelled,
        boundaryDurationMs: boundaryDiagnostics?.durationMs,
        boundaryStdoutHash: boundaryDiagnostics?.stdoutHash,
        boundaryStderrHash: boundaryDiagnostics?.stderrHash,
        boundaryStdoutByteLength: boundaryDiagnostics?.stdoutByteLength,
        boundaryStderrByteLength: boundaryDiagnostics?.stderrByteLength,
        boundaryStdoutLineCount: boundaryDiagnostics?.stdoutLineCount,
        boundaryStderrLineCount: boundaryDiagnostics?.stderrLineCount,
        boundaryStdoutTruncated: boundaryDiagnostics?.stdoutTruncated,
        boundaryStderrTruncated: boundaryDiagnostics?.stderrTruncated,
        boundaryDiagnosticsComplete,
        boundaryDiagnosticsMissingFields,
        postRunVerificationStatus,
        postRunVerificationSkipReason,
        workspaceMutationDetected,
        evidenceRefCount: evidenceRefIds.length,
        auditEventCount: auditEventIds.length,
        processBoundaryInvoked: input.boundaryResult !== undefined,
        outputBodyStored: false,
        source: 'codex-kernel.real-read-only-adapter.attempt-record',
      },
      input.boundaryResult?.externalProcessStarted === true,
    ),
  };
}

export function summarizeRealReadOnlyAdapterAttempt(
  record: CodexExecRealReadOnlyAdapterAttemptRecord,
): CodexExecRealReadOnlyAdapterAttemptSummary {
  const alignedRecord = alignRealReadOnlyAdapterAttemptRecordDiagnostics(record);

  return {
    id: foundationId('codex_real_read_only_adapter_attempt_summary'),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: foundationTimestamp(),
    ...realReadOnlyAdapterMetadataOnlyFlags,
    attemptId: alignedRecord.id,
    dryRunId: alignedRecord.dryRunId,
    status: alignedRecord.status,
    authoritative: alignedRecord.authoritative,
    supervisorBacked: alignedRecord.supervisorBacked,
    persisted: alignedRecord.persisted,
    degraded: alignedRecord.degraded,
    notPersisted: alignedRecord.notPersisted,
    processBoundaryInvoked: alignedRecord.processBoundaryInvoked,
    preflightStatus: alignedRecord.preflightStatus,
    resultStatus: alignedRecord.resultStatus,
    resultErrorCode: alignedRecord.resultErrorCode,
    failedCheckCodes: alignedRecord.failedCheckCodes,
    blockedCheckCodes: alignedRecord.blockedCheckCodes,
    boundaryDeferredReasonCode: alignedRecord.boundaryDeferredReasonCode,
    boundaryDeferredReasonCodes: alignedRecord.boundaryDeferredReasonCodes,
    boundaryDeferredDiagnostics: alignedRecord.boundaryDeferredDiagnostics,
    boundaryDiagnostics: alignedRecord.boundaryDiagnostics,
    boundaryDiagnosticsComplete: alignedRecord.boundaryDiagnosticsComplete,
    boundaryDiagnosticsMissingFields: alignedRecord.boundaryDiagnosticsMissingFields,
    postRunVerificationStatus: alignedRecord.postRunVerificationStatus,
    postRunVerificationSkipReason: alignedRecord.postRunVerificationSkipReason,
    workspaceMutationDetected: alignedRecord.workspaceMutationDetected,
    evidenceRefCount: alignedRecord.evidenceRefIds.length,
    auditEventCount: alignedRecord.auditEventIds.length,
    outputHashCount: alignedRecord.outputHashCount,
    metadataHash: alignedRecord.metadataHash,
    summary: alignedRecord.summary,
    metadata: createRealReadOnlyAdapterMetadata({
      attemptId: alignedRecord.id,
      dryRunId: alignedRecord.dryRunId,
      status: alignedRecord.status,
      preflightStatus: alignedRecord.preflightStatus,
      resultStatus: alignedRecord.resultStatus,
      resultErrorCode: alignedRecord.resultErrorCode,
      boundaryDeferredReasonCode: alignedRecord.boundaryDeferredReasonCode,
      boundaryDeferredReasonCodes: alignedRecord.boundaryDeferredReasonCodes,
      boundaryDeferredProcessBoundaryReady:
        alignedRecord.boundaryDeferredDiagnostics?.processBoundaryReady,
      boundaryDeferredExecutableResolutionStatus:
        alignedRecord.boundaryDeferredDiagnostics?.executableResolutionStatus,
      boundaryDeferredExecutableResolutionReasonCode:
        alignedRecord.boundaryDeferredDiagnostics?.executableResolutionReasonCode,
      boundaryDeferredCwdSelfCheckStatus:
        alignedRecord.boundaryDeferredDiagnostics?.cwdSelfCheckStatus,
      boundaryDeferredCwdSelfCheckReasonCode:
        alignedRecord.boundaryDeferredDiagnostics?.cwdSelfCheckReasonCode,
      boundaryFailureCode: alignedRecord.boundaryDiagnostics?.failureCode,
      boundaryStartFailureKind: alignedRecord.boundaryDiagnostics?.startFailureKind,
      boundaryEnoentKind: alignedRecord.boundaryDiagnostics?.enoentKind,
      boundaryPlatform: alignedRecord.boundaryDiagnostics?.platform,
      boundaryResolvedExecutableKind: alignedRecord.boundaryDiagnostics?.resolvedExecutableKind,
      boundarySpawnTargetKind: alignedRecord.boundaryDiagnostics?.spawnTargetKind,
      boundaryCwdHash: alignedRecord.boundaryDiagnostics?.cwdHash,
      boundaryCwdExists: alignedRecord.boundaryDiagnostics?.cwdExists,
      boundaryCwdIsDirectory: alignedRecord.boundaryDiagnostics?.cwdIsDirectory,
      boundaryExecutableHash: alignedRecord.boundaryDiagnostics?.executableHash,
      boundaryExecutableExists: alignedRecord.boundaryDiagnostics?.executableExists,
      boundaryExecutableAccessible: alignedRecord.boundaryDiagnostics?.executableAccessible,
      boundaryExecutableResolutionSource:
        alignedRecord.boundaryDiagnostics?.executableResolutionSource,
      boundaryDependencyResolutionStatus:
        alignedRecord.boundaryDiagnostics?.dependencyResolutionStatus,
      boundaryEnvAllowlistKeyCount: alignedRecord.boundaryDiagnostics?.envAllowlistKeyCount,
      boundaryEnvAllowlistKeyHash: alignedRecord.boundaryDiagnostics?.envAllowlistKeyHash,
      boundaryNonzeroExitKind: alignedRecord.boundaryDiagnostics?.nonzeroExitKind,
      boundaryDiagnosticsComplete: alignedRecord.boundaryDiagnosticsComplete,
      boundaryDiagnosticsMissingFields: alignedRecord.boundaryDiagnosticsMissingFields,
      postRunVerificationStatus: alignedRecord.postRunVerificationStatus,
      postRunVerificationSkipReason: alignedRecord.postRunVerificationSkipReason,
      workspaceMutationDetected: alignedRecord.workspaceMutationDetected,
      source: 'codex-kernel.real-read-only-adapter.attempt-summary',
    }),
  };
}

export function listRealReadOnlyAdapterAttemptSummaries(
  records: CodexExecRealReadOnlyAdapterAttemptRecord[],
  query: Partial<CodexExecRealReadOnlyAdapterAttemptQuery> = {},
): CodexExecRealReadOnlyAdapterAttemptSummary[] {
  const limit = query.limit ?? 50;
  return records
    .filter((record) => (query.dryRunId === undefined ? true : record.dryRunId === query.dryRunId))
    .filter((record) => (query.status === undefined ? true : record.status === query.status))
    .sort((left, right) => right.createdAt.localeCompare(left.createdAt))
    .slice(0, limit)
    .map((record) => summarizeRealReadOnlyAdapterAttempt(record));
}

export function getLatestRealReadOnlyAdapterAttempt(
  records: CodexExecRealReadOnlyAdapterAttemptRecord[],
  dryRunId: string,
): CodexExecRealReadOnlyAdapterAttemptSummary | undefined {
  return listRealReadOnlyAdapterAttemptSummaries(records, { dryRunId, limit: 1 })[0];
}

export function createRealReadOnlyAdapterAttemptTimeline(
  input: CodexExecRealReadOnlyAdapterAttemptTimelineInput,
): CodexExecRealReadOnlyAdapterAttemptTimelineSummary {
  const query = input.query ?? {};
  const limit = query.limit ?? 50;
  const includeEvidence = query.includeEvidence === true;
  const includeAudit = query.includeAudit === true;
  const records = input.records
    .filter((record) => record.dryRunId === input.dryRunId)
    .filter((record) => (query.status === undefined ? true : record.status === query.status))
    .sort((left, right) => right.createdAt.localeCompare(left.createdAt))
    .slice(0, limit)
    .map((record) => alignRealReadOnlyAdapterAttemptRecordDiagnostics(record));
  const entries = records.map((record) => ({
    id: foundationId('codex_real_read_only_adapter_attempt_timeline_entry'),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: foundationTimestamp(),
    ...realReadOnlyAdapterMetadataOnlyFlags,
    attemptId: record.id,
    dryRunId: record.dryRunId,
    status: record.status,
    occurredAt: record.createdAt,
    processBoundaryInvoked: record.processBoundaryInvoked,
    preflightStatus: record.preflightStatus,
    resultStatus: record.resultStatus,
    resultErrorCode: record.resultErrorCode,
    failedCheckCodes: record.failedCheckCodes,
    blockedCheckCodes: record.blockedCheckCodes,
    boundaryDeferredReasonCode: record.boundaryDeferredReasonCode,
    boundaryDeferredReasonCodes: record.boundaryDeferredReasonCodes,
    boundaryDeferredDiagnostics: record.boundaryDeferredDiagnostics,
    boundaryDiagnostics: record.boundaryDiagnostics,
    boundaryDiagnosticsComplete: record.boundaryDiagnosticsComplete,
    boundaryDiagnosticsMissingFields: record.boundaryDiagnosticsMissingFields,
    postRunVerificationStatus: record.postRunVerificationStatus,
    postRunVerificationSkipReason: record.postRunVerificationSkipReason,
    workspaceMutationDetected: record.workspaceMutationDetected,
    evidenceRefIds: includeEvidence ? record.evidenceRefIds : [],
    auditEventIds: includeAudit ? record.auditEventIds : [],
    evidenceRefCount: record.evidenceRefIds.length,
    auditEventCount: record.auditEventIds.length,
    outputHashCount: record.outputHashCount,
    metadataHash: record.metadataHash,
    summary: `Read-only adapter attempt ${record.status} timeline entry stores refs and counts only.`,
    metadata: createRealReadOnlyAdapterMetadata({
      ...(input.metadata ?? {}),
      attemptId: record.id,
      dryRunId: record.dryRunId,
      status: record.status,
      preflightStatus: record.preflightStatus,
      resultStatus: record.resultStatus,
      resultErrorCode: record.resultErrorCode,
      boundaryDeferredReasonCode: record.boundaryDeferredReasonCode,
      boundaryDeferredReasonCodes: record.boundaryDeferredReasonCodes,
      boundaryDeferredProcessBoundaryReady: record.boundaryDeferredDiagnostics?.processBoundaryReady,
      boundaryDeferredExecutableResolutionStatus:
        record.boundaryDeferredDiagnostics?.executableResolutionStatus,
      boundaryDeferredExecutableResolutionReasonCode:
        record.boundaryDeferredDiagnostics?.executableResolutionReasonCode,
      boundaryDeferredCwdSelfCheckStatus: record.boundaryDeferredDiagnostics?.cwdSelfCheckStatus,
      boundaryDeferredCwdSelfCheckReasonCode:
        record.boundaryDeferredDiagnostics?.cwdSelfCheckReasonCode,
      boundaryFailureCode: record.boundaryDiagnostics?.failureCode,
      boundaryStartFailureKind: record.boundaryDiagnostics?.startFailureKind,
      boundaryEnoentKind: record.boundaryDiagnostics?.enoentKind,
      boundaryPlatform: record.boundaryDiagnostics?.platform,
      boundaryResolvedExecutableKind: record.boundaryDiagnostics?.resolvedExecutableKind,
      boundarySpawnTargetKind: record.boundaryDiagnostics?.spawnTargetKind,
      boundaryCwdHash: record.boundaryDiagnostics?.cwdHash,
      boundaryCwdExists: record.boundaryDiagnostics?.cwdExists,
      boundaryCwdIsDirectory: record.boundaryDiagnostics?.cwdIsDirectory,
      boundaryExecutableHash: record.boundaryDiagnostics?.executableHash,
      boundaryExecutableExists: record.boundaryDiagnostics?.executableExists,
      boundaryExecutableAccessible: record.boundaryDiagnostics?.executableAccessible,
      boundaryExecutableResolutionSource: record.boundaryDiagnostics?.executableResolutionSource,
      boundaryDependencyResolutionStatus: record.boundaryDiagnostics?.dependencyResolutionStatus,
      boundaryEnvAllowlistKeyCount: record.boundaryDiagnostics?.envAllowlistKeyCount,
      boundaryEnvAllowlistKeyHash: record.boundaryDiagnostics?.envAllowlistKeyHash,
      boundaryNonzeroExitKind: record.boundaryDiagnostics?.nonzeroExitKind,
      boundaryDiagnosticsComplete: record.boundaryDiagnosticsComplete,
      boundaryDiagnosticsMissingFields: record.boundaryDiagnosticsMissingFields,
      postRunVerificationStatus: record.postRunVerificationStatus,
      postRunVerificationSkipReason: record.postRunVerificationSkipReason,
      workspaceMutationDetected: record.workspaceMutationDetected,
      includeEvidence,
      includeAudit,
      source: 'codex-kernel.real-read-only-adapter.attempt-timeline-entry',
    }),
  }));
  const evidenceRefCount = records.reduce((total, record) => total + record.evidenceRefIds.length, 0);
  const auditEventCount = records.reduce((total, record) => total + record.auditEventIds.length, 0);
  const outputHashCount = records.reduce((total, record) => total + record.outputHashCount, 0);
  const processBoundaryInvokedCount = records.filter(
    (record) => record.processBoundaryInvoked,
  ).length;
  const status = entries[0]?.status ?? 'empty';
  const verificationSummary =
    records.some((record) => record.status !== 'blocked')
      ? 'Post-run verification status is represented by attempt metadata, audit refs, and evidence refs only.'
      : 'No completed post-run verification metadata is available for the filtered attempts.';
  const workspaceMutationSummary =
    'Workspace mutation remains forbidden; any unexpected diff is critical and requires manual review.';

  return {
    id: foundationId('codex_real_read_only_adapter_attempt_timeline'),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: foundationTimestamp(),
    ...realReadOnlyAdapterMetadataOnlyFlags,
    dryRunId: input.dryRunId,
    status,
    entries,
    eventCount: entries.length,
    evidenceRefCount,
    auditEventCount,
    outputHashCount,
    processBoundaryInvokedCount,
    includeEvidence,
    includeAudit,
    verificationSummary,
    workspaceMutationSummary,
    recommendation:
      'Read-only adapter timeline is informational only and does not grant broader use, workspace write, or Dashboard trigger permission.',
    summary:
      entries.length === 0
        ? 'No read-only adapter attempt records were found for the requested timeline.'
        : 'Read-only adapter attempt timeline aggregates status, counts, hashes, and refs only.',
    metadata: createRealReadOnlyAdapterMetadata({
      ...(input.metadata ?? {}),
      dryRunId: input.dryRunId,
      status,
      eventCount: entries.length,
      includeEvidence,
      includeAudit,
      source: 'codex-kernel.real-read-only-adapter.attempt-timeline',
    }),
  };
}

function isApprovalArtifactValid(
  artifact: CodexExecApprovalArtifact | undefined,
  nowMs: number,
): boolean {
  if (!artifact) {
    return false;
  }

  return (
    artifact.status === 'approved' &&
    artifact.revoked === false &&
    artifact.usedAt === undefined &&
    Date.parse(artifact.expiresAt) > nowMs
  );
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

function createRealReadOnlyAdapterAuditEvent(input: {
  action: string;
  outcome: string;
  request: CodexExecRealReadOnlyAdapterRequest;
  preflight: CodexExecRealReadOnlyAdapterPreflight;
  resultId?: string;
  evidenceRefs: EvidenceRef[];
  externalProcessStarted: boolean;
  metadata?: JsonMetadata;
}): AuditEvent {
  return {
    id: foundationId('audit'),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: foundationTimestamp(),
    actor: 'codex-kernel.real-read-only-adapter',
    action: input.action,
    outcome: input.outcome,
    evidenceRefs: input.evidenceRefs,
    metadata: createRealReadOnlyAdapterTelemetryMetadata(
      {
        ...(input.metadata ?? {}),
        requestId: input.request.id,
        dryRunId: input.request.dryRunId,
        preflightId: input.preflight.id,
        preflightStatus: input.preflight.status,
        resultId: input.resultId,
      },
      input.externalProcessStarted,
    ),
  };
}

function resultStatusFromTelemetry(
  input: CodexExecRealReadOnlyAdapterAttemptTelemetryInput,
): CodexExecRealReadOnlyAdapterResult['status'] {
  if (!input.boundaryResult) {
    return input.preflight.status === 'passed' ? 'not_started' : 'blocked';
  }

  return input.boundaryResult.status === 'completed'
    ? 'completed'
    : input.boundaryResult.status === 'failed'
      ? 'failed'
      : 'aborted';
}

function classifyRealReadOnlyAdapterBoundaryFailure(
  boundaryResult: CodexExecRealReadOnlyAdapterProcessBoundaryResult,
): CodexExecRealReadOnlyAdapterBoundaryFailureCode {
  if (boundaryResult.status === 'completed') {
    return 'none';
  }

  if (boundaryResult.timedOut) {
    return 'process_timed_out';
  }

  if (boundaryResult.cancelled) {
    return 'process_cancelled';
  }

  if (boundaryResult.startFailureKind && boundaryResult.startFailureKind !== 'none') {
    return 'process_start_failed';
  }

  if (boundaryResult.signal) {
    return 'process_signaled';
  }

  if (boundaryResult.exitCode !== undefined && boundaryResult.exitCode !== 0) {
    return 'process_exit_nonzero';
  }

  if (
    boundaryResult.status === 'failed' &&
    boundaryResult.exitCode === undefined &&
    (boundaryResult.stderrSummary.byteLength > 0 || boundaryResult.stdoutSummary.byteLength > 0)
  ) {
    return 'process_start_failed';
  }

  return boundaryResult.status === 'aborted'
    ? 'boundary_aborted_unknown'
    : 'boundary_failed_unknown';
}

function attemptStatusFromResult(
  status: CodexExecRealReadOnlyAdapterResult['status'],
): CodexExecRealReadOnlyAdapterAttemptStatus {
  if (status === 'completed' || status === 'failed' || status === 'aborted') {
    return status;
  }

  return 'blocked';
}

function realReadOnlyAdapterErrorCodeForCheck(
  config: CodexExecRealReadOnlyAdapterConfig,
  checkCode: string | undefined,
): CodexExecRealReadOnlyAdapterError['code'] {
  if (!config.configuredEnabled || checkCode === 'config_explicit_enable') {
    return 'config_disabled';
  }

  switch (checkCode) {
    case 'dry_run_exists':
      return 'missing_dry_run';
    case 'approval_artifact_exists':
      return 'missing_approval';
    case 'approval_artifact_valid':
      return 'approval_invalid';
    case 'dry_run_hash_match':
      return 'dry_run_hash_mismatch';
    case 'policy_hash_match':
      return 'policy_hash_mismatch';
    case 'sandbox_read_only':
      return 'sandbox_not_read_only';
    case 'danger_full_access_forbidden':
      return 'danger_full_access_forbidden';
    case 'dashboard_trigger_forbidden':
      return 'dashboard_trigger_forbidden';
    case 'isolated_worktree_clean':
      return 'worktree_not_isolated';
    case 'evidence_store_ready':
    case 'audit_store_ready':
      return 'store_degraded';
    default:
      return checkCode === undefined ? 'boundary_deferred' : 'preflight_failed';
  }
}

function metadataString(metadata: JsonMetadata, key: string): string | undefined {
  const value = metadata[key];
  return typeof value === 'string' && value.length > 0 ? value : undefined;
}

function metadataBoolean(metadata: JsonMetadata, key: string): boolean | undefined {
  const value = metadata[key];
  return typeof value === 'boolean' ? value : undefined;
}

function metadataBoundaryDeferredReasonCode(
  metadata: JsonMetadata,
  key: string,
): CodexExecRealReadOnlyAdapterBoundaryDeferredReasonCode | undefined {
  const value = metadataString(metadata, key);
  return isBoundaryDeferredReasonCode(value) ? value : undefined;
}

function metadataBoundaryDeferredReasonCodes(
  metadata: JsonMetadata,
  key: string,
): CodexExecRealReadOnlyAdapterBoundaryDeferredReasonCode[] {
  const value = metadata[key];

  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter(isBoundaryDeferredReasonCode);
}

function inferRealReadOnlyAdapterBoundaryDeferredDiagnostics(
  record: CodexExecRealReadOnlyAdapterAttemptRecord,
): CodexExecRealReadOnlyAdapterBoundaryDeferredDiagnostics | undefined {
  if (
    record.preflightStatus !== 'passed' ||
    record.resultErrorCode !== 'boundary_deferred' ||
    record.processBoundaryInvoked
  ) {
    return undefined;
  }

  const metadata = record.metadata ?? {};
  const explicitReasonCode =
    record.boundaryDeferredReasonCode ??
    metadataBoundaryDeferredReasonCode(metadata, 'boundaryDeferredReasonCode');
  const explicitReasonCodes =
    Array.isArray(record.boundaryDeferredReasonCodes) &&
    record.boundaryDeferredReasonCodes.length > 0
      ? record.boundaryDeferredReasonCodes
      : metadataBoundaryDeferredReasonCodes(metadata, 'boundaryDeferredReasonCodes');
  const runtimeWorktreeProvided =
    metadataBoolean(metadata, 'runtimeWorktreeProvided') ??
    metadataBoolean(metadata, 'isolatedWorktreeProvided') ??
    true;
  const approvalInputProvided =
    metadataString(metadata, 'approvalArtifactId') !== undefined ||
    metadataBoolean(metadata, 'approvalInputProvided') !== false;
  const executableResolutionStatus = normalizeDeferredExecutableResolutionStatus(
    metadataString(metadata, 'executableResolutionStatus') ??
      metadataString(metadata, 'boundaryDeferredExecutableResolutionStatus'),
  );
  const cwdSelfCheckStatus = normalizeDeferredCwdSelfCheckStatus(
    metadataString(metadata, 'cwdSelfCheckStatus') ??
      metadataString(metadata, 'boundaryDeferredCwdSelfCheckStatus'),
  );
  const processBoundaryReady =
    metadataBoolean(metadata, 'boundaryDeferredProcessBoundaryReady') ??
    (runtimeWorktreeProvided &&
      approvalInputProvided &&
      executableResolutionStatus === 'resolved' &&
      cwdSelfCheckStatus === 'passed');
  const inferredReasonCodes =
    explicitReasonCodes.length > 0
      ? explicitReasonCodes
      : explicitReasonCode !== undefined
        ? [explicitReasonCode]
        : classifyBoundaryDeferredReasonCodes({
            runtimeWorktreeProvided,
            approvalInputProvided,
            executableResolutionStatus,
            cwdSelfCheckStatus,
            processBoundaryReady,
          });
  const reasonCode = inferredReasonCodes[0] ?? 'unknown';

  return {
    id: `${record.id}_boundary_deferred_diagnostics`,
    schemaVersion: SchemaVersionSchema.value,
    createdAt: record.createdAt,
    ...realReadOnlyAdapterMetadataOnlyFlags,
    reasonCode,
    reasonCodes: inferredReasonCodes,
    preflightStatus: record.preflightStatus,
    runtimeWorktreeProvided,
    approvalInputProvided,
    executableResolutionStatus,
    executableResolutionReasonCode:
      metadataString(metadata, 'executableResolutionReasonCode') ??
      metadataString(metadata, 'boundaryDeferredExecutableResolutionReasonCode'),
    cwdSelfCheckStatus,
    cwdSelfCheckReasonCode:
      metadataString(metadata, 'cwdSelfCheckReasonCode') ??
      metadataString(metadata, 'boundaryDeferredCwdSelfCheckReasonCode'),
    sourcePreparationReady: metadataBoolean(metadata, 'sourcePreparationReady'),
    prerequisiteReady: metadataBoolean(metadata, 'prerequisiteReady'),
    worktreePathHashMatched: metadataBoolean(metadata, 'worktreePathHashMatched'),
    processBoundaryReady,
    summary:
      reasonCode === 'boundary_result_missing_after_ready'
        ? 'Boundary was deferred even though runtime inputs and pre-boundary checks were ready.'
        : 'Boundary was deferred before process invocation; diagnostic metadata names the blocking source.',
    metadata: createRealReadOnlyAdapterMetadata({
      reasonCode,
      reasonCodes: inferredReasonCodes,
      preflightStatus: record.preflightStatus,
      runtimeWorktreeProvided,
      approvalInputProvided,
      executableResolutionStatus,
      executableResolutionReasonCode:
        metadataString(metadata, 'executableResolutionReasonCode') ??
        metadataString(metadata, 'boundaryDeferredExecutableResolutionReasonCode'),
      cwdSelfCheckStatus,
      cwdSelfCheckReasonCode:
        metadataString(metadata, 'cwdSelfCheckReasonCode') ??
        metadataString(metadata, 'boundaryDeferredCwdSelfCheckReasonCode'),
      sourcePreparationReady: metadataBoolean(metadata, 'sourcePreparationReady'),
      prerequisiteReady: metadataBoolean(metadata, 'prerequisiteReady'),
      worktreePathHashMatched: metadataBoolean(metadata, 'worktreePathHashMatched'),
      processBoundaryReady,
      reconstructedFromAttemptMetadata: true,
      worktreePathStored: false,
      executablePathStored: false,
      argvStored: false,
      envPlanStored: false,
      source: 'codex-kernel.real-read-only-adapter.boundary-deferred-readback-alignment',
    }),
  };
}

function normalizeDeferredExecutableResolutionStatus(
  status: string | undefined,
): CodexExecRealReadOnlyAdapterBoundaryDeferredDiagnostics['executableResolutionStatus'] {
  if (status === 'resolved' || status === 'blocked') {
    return status;
  }

  return status === undefined ? 'not_run' : 'unknown';
}

function normalizeDeferredCwdSelfCheckStatus(
  status: string | undefined,
): CodexExecRealReadOnlyAdapterBoundaryDeferredDiagnostics['cwdSelfCheckStatus'] {
  if (status === 'passed' || status === 'failed' || status === 'blocked') {
    return status;
  }

  return status === undefined ? 'not_run' : 'unknown';
}

function classifyBoundaryDeferredReasonCodes(input: {
  runtimeWorktreeProvided: boolean;
  approvalInputProvided: boolean;
  executableResolutionStatus: CodexExecRealReadOnlyAdapterBoundaryDeferredDiagnostics['executableResolutionStatus'];
  cwdSelfCheckStatus: CodexExecRealReadOnlyAdapterBoundaryDeferredDiagnostics['cwdSelfCheckStatus'];
  processBoundaryReady: boolean;
}): CodexExecRealReadOnlyAdapterBoundaryDeferredReasonCode[] {
  const reasonCodes: CodexExecRealReadOnlyAdapterBoundaryDeferredReasonCode[] = [];

  if (!input.runtimeWorktreeProvided) {
    reasonCodes.push('runtime_worktree_missing');
  }

  if (!input.approvalInputProvided) {
    reasonCodes.push('approval_input_missing');
  }

  if (input.executableResolutionStatus === 'not_run') {
    reasonCodes.push('executable_resolution_not_run');
  } else if (input.executableResolutionStatus === 'blocked') {
    reasonCodes.push('executable_resolution_blocked');
  }

  if (input.cwdSelfCheckStatus === 'not_run') {
    reasonCodes.push('cwd_self_check_not_run');
  } else if (
    input.cwdSelfCheckStatus === 'failed' ||
    input.cwdSelfCheckStatus === 'blocked' ||
    input.cwdSelfCheckStatus === 'unknown'
  ) {
    reasonCodes.push('cwd_self_check_failed');
  }

  if (reasonCodes.length === 0) {
    reasonCodes.push(
      input.processBoundaryReady ? 'boundary_result_missing_after_ready' : 'unknown',
    );
  }

  return [...new Set(reasonCodes)];
}

function createRealReadOnlyAdapterMetadata(extra: JsonMetadata): JsonMetadata {
  return {
    ...extra,
    ...realReadOnlyAdapterNoApprovalFlags,
    metadataOnly: true,
    bodyStored: false,
  };
}

function createRealReadOnlyAdapterTelemetryMetadata(
  extra: JsonMetadata,
  externalProcessStarted: boolean,
): JsonMetadata {
  return {
    ...realReadOnlyAdapterNoApprovalFlags,
    metadataOnly: true,
    bodyStored: false,
    promptBodyStored: false,
    commandBodyStored: false,
    stdoutBodyStored: false,
    stderrBodyStored: false,
    agentMessageBodyStored: false,
    reasoningBodyStored: false,
    ...extra,
    externalProcessStarted,
    implementationApproved: false,
    processAdapterApproved: false,
    recommendationGrantsExecution: false,
    workspaceWriteAllowed: false,
    dangerFullAccessAllowed: false,
    dashboardTriggerAllowed: false,
  };
}

function prefixedAdapterHash(value: unknown): string {
  return `sha256:${hashText(JSON.stringify(sortJson(value)))}`;
}

function stableStringify(value: unknown): string {
  return JSON.stringify(sortJson(value));
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

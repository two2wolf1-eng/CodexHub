import {
  createRealReadOnlyAdapterProcessPlan,
  nodeRealReadOnlyAdapterProcessRunner,
  runRealReadOnlyAdapterProcessBoundary,
  type CodexExecRealReadOnlyAdapterProcessBoundaryResult,
  type CodexExecRealReadOnlyAdapterProcessRunner,
  type CodexExecRealReadOnlyAdapterProcessRunnerResult,
} from '@codexhub/codex-kernel';
import {
  type CapabilityAuditEvent,
  type CapabilityExecutionResult,
  type EvidenceRef,
  type ExecutionAuthority,
  ExecutionAuthoritySchema,
  SchemaVersionSchema,
  foundationId,
  foundationTimestamp,
} from '@codexhub/contracts';
import { createCodexExecAdapterAuditEvent } from './audit';
import {
  createCodexExecAdapterBoundaryEvidence,
  createCodexExecAdapterEventEvidence,
  createCodexExecAdapterPlanEvidence,
} from './evidence';
import { normalizeCodexExecAdapterEvents, type CodexExecAdapterEventSummary } from './event-normalizer';
import { parseCodexExecAdapterJsonl } from './jsonl-parser';
import { type CodexExecAdapterPlan } from './plan';

export interface CodexExecAdapterExecuteInput {
  plan: CodexExecAdapterPlan;
  authority?: ExecutionAuthority;
  approvalArtifactId?: string;
  executablePath: string;
  timeoutMs: number;
  runner?: CodexExecRealReadOnlyAdapterProcessRunner;
  now?: () => string;
  signal?: AbortSignal;
  actor?: string;
}

export interface CodexExecAdapterExecuteResult {
  capabilityResult: CapabilityExecutionResult;
  evidenceRefs: EvidenceRef[];
  auditEvents: CapabilityAuditEvent[];
  eventSummary?: CodexExecAdapterEventSummary;
  boundaryResult?: CodexExecRealReadOnlyAdapterProcessBoundaryResult;
}

export async function executeCodexExecAdapter(
  input: CodexExecAdapterExecuteInput,
): Promise<CodexExecAdapterExecuteResult> {
  const authorityBlockReason = validateAuthority(
    input.authority,
    input.approvalArtifactId,
    input.now,
  );
  const planBlockReasons = input.plan.status === 'blocked' ? input.plan.blockReasons : [];

  if (authorityBlockReason || planBlockReasons.length > 0) {
    const blockReasons = [
      ...planBlockReasons,
      ...(authorityBlockReason ? [authorityBlockReason] : []),
    ];

    return createBlockedExecuteResult(input, blockReasons);
  }

  if (input.plan.governedInput.status !== 'verified') {
    return createBlockedExecuteResult(input, ['governed_input_not_verified']);
  }

  const boundaryPlan = createRealReadOnlyAdapterProcessPlan({
    dryRunId: input.plan.dryRunId,
    approvalArtifactId: input.approvalArtifactId ?? input.authority?.approvalArtifactId ?? '',
    executablePath: input.executablePath,
    worktreePath: input.plan.cwd,
    governedInput: input.plan.governedInput,
    timeoutMs: input.timeoutMs,
    metadata: {
      cwdHash: input.plan.cwdHash,
      adapterName: input.plan.adapterName,
      authorityId: input.authority?.id,
      policyDecisionId: input.authority?.policyDecisionId,
    },
  });

  const stdoutCapture = createInMemoryStdoutCaptureRunner(input.runner);
  const boundaryResult = await runRealReadOnlyAdapterProcessBoundary(boundaryPlan, {
    runner: stdoutCapture.runner,
    signal: input.signal,
    now: input.now,
  });
  const parsed = parseCodexExecAdapterJsonl(stdoutCapture.readStdout());
  const eventSummary = normalizeCodexExecAdapterEvents(parsed.lines);
  const evidenceRefs = [
    createCodexExecAdapterPlanEvidence(input.plan),
    createCodexExecAdapterBoundaryEvidence({
      status: boundaryResult.status,
      dryRunId: input.plan.dryRunId,
      processBoundaryInvoked: true,
      externalProcessStarted: boundaryResult.externalProcessStarted,
      noRealWrite: true,
      stdoutHash: boundaryResult.stdoutSummary.contentHash,
      stderrHash: boundaryResult.stderrSummary.contentHash,
      stdoutLineCount: boundaryResult.stdoutSummary.lineCount,
      stderrLineCount: boundaryResult.stderrSummary.lineCount,
      exitCode: boundaryResult.exitCode,
    }),
    createCodexExecAdapterEventEvidence(eventSummary),
  ];
  const auditEvents = [
    createCodexExecAdapterAuditEvent({
      actor: input.actor,
      action: 'codex-cli.execute',
      target: 'governed-input-file',
      reason: 'approved capability execution',
      outcome: boundaryResult.status,
      policyDecisionId: input.authority?.policyDecisionId ?? 'missing-policy-decision',
      evidenceRefs,
      metadata: {
        liveExecution: true,
        processBoundaryInvoked: true,
        externalProcessStarted: boundaryResult.externalProcessStarted,
        noRealWrite: true,
        status: boundaryResult.status,
      },
    }),
  ];
  const capabilityResult = createCapabilityExecutionResult({
    status: boundaryResult.status,
    processBoundaryInvoked: true,
    externalProcessStarted: boundaryResult.externalProcessStarted,
    noRealWrite: true,
    evidenceRefs,
    auditEvents,
    summary: `Codex CLI adapter execution ${boundaryResult.status}`,
  });

  return {
    capabilityResult,
    evidenceRefs,
    auditEvents,
    eventSummary,
    boundaryResult,
  };
}

function validateAuthority(
  authority: ExecutionAuthority | undefined,
  approvalArtifactId: string | undefined,
  now: (() => string) | undefined,
): string | undefined {
  const parsedAuthority = authority
    ? ExecutionAuthoritySchema.safeParse(authority)
    : undefined;

  if (!authority) {
    return 'execution_authority_missing';
  }

  if (parsedAuthority?.success === false) {
    return 'execution_authority_invalid';
  }

  if (!authority.allowed) {
    return 'execution_authority_not_allowed';
  }

  if (authority.policyDecisionId.trim().length === 0) {
    return 'policy_decision_missing';
  }

  if (!authority.approvalArtifactId || authority.approvalArtifactId.trim().length === 0) {
    return 'persisted_approval_missing';
  }

  if (approvalArtifactId !== undefined && approvalArtifactId !== authority.approvalArtifactId) {
    return 'approval_artifact_mismatch';
  }

  if (
    authority.expiresAt &&
    Date.parse(authority.expiresAt) <= Date.parse((now ?? foundationTimestamp)())
  ) {
    return 'execution_authority_expired';
  }

  return undefined;
}

function createBlockedExecuteResult(
  input: CodexExecAdapterExecuteInput,
  blockReasons: readonly string[],
): CodexExecAdapterExecuteResult {
  const planEvidence = createCodexExecAdapterPlanEvidence(input.plan);
  const boundaryEvidence = createCodexExecAdapterBoundaryEvidence({
    status: 'blocked',
    dryRunId: input.plan.dryRunId,
    processBoundaryInvoked: false,
    externalProcessStarted: false,
    noRealWrite: true,
    blockReasons,
  });
  const evidenceRefs = [planEvidence, boundaryEvidence];
  const auditEvents = [
    createCodexExecAdapterAuditEvent({
      actor: input.actor,
      action: 'codex-cli.execute',
      target: 'governed-input-file',
      reason: 'capability execution blocked by governance gate',
      outcome: 'blocked',
      policyDecisionId: input.authority?.policyDecisionId ?? 'blocked-before-policy',
      evidenceRefs,
      metadata: {
        liveExecution: false,
        blockReasons,
        processBoundaryInvoked: false,
        externalProcessStarted: false,
        noRealWrite: true,
      },
    }),
  ];

  return {
    capabilityResult: createCapabilityExecutionResult({
      status: 'blocked',
      processBoundaryInvoked: false,
      externalProcessStarted: false,
      noRealWrite: true,
      evidenceRefs,
      auditEvents,
      summary: `Codex CLI adapter execution blocked: ${blockReasons.join(', ')}`,
    }),
    evidenceRefs,
    auditEvents,
  };
}

function createInMemoryStdoutCaptureRunner(
  runner: CodexExecRealReadOnlyAdapterProcessRunner | undefined,
): {
  runner: CodexExecRealReadOnlyAdapterProcessRunner;
  readStdout: () => string;
} {
  const delegate = runner ?? nodeRealReadOnlyAdapterProcessRunner;
  let stdout = '';

  return {
    runner: {
      async start(
        plan,
        options,
      ): Promise<CodexExecRealReadOnlyAdapterProcessRunnerResult> {
        const result = await delegate.start(plan, options);
        stdout = result.stdout ?? '';
        return result;
      },
    },
    readStdout: () => stdout,
  };
}

function createCapabilityExecutionResult(input: {
  status: CapabilityExecutionResult['status'];
  processBoundaryInvoked: boolean;
  externalProcessStarted: boolean;
  noRealWrite: boolean;
  evidenceRefs: readonly EvidenceRef[];
  auditEvents: readonly CapabilityAuditEvent[];
  summary: string;
}): CapabilityExecutionResult {
  return {
    id: foundationId('capability_execution_result'),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: foundationTimestamp(),
    status: input.status,
    processBoundaryInvoked: input.processBoundaryInvoked,
    externalProcessStarted: input.externalProcessStarted,
    noRealWrite: input.noRealWrite,
    evidenceRefs: input.evidenceRefs.map((ref) => ref.id),
    auditEventIds: input.auditEvents.map((event) => event.id),
    summary: input.summary,
  };
}

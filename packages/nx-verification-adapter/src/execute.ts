import {
  type CapabilityAuditEvent,
  type CapabilityExecutionResult,
  type EvidenceRef,
  type ExecutionAuthority,
  type VerificationCommandResult,
  type VerificationRun,
  type AffectedProject,
  ExecutionAuthoritySchema,
  SchemaVersionSchema,
  VerificationRunSchema,
  foundationId,
  foundationTimestamp,
} from '@codexhub/contracts';
import { createNxVerificationAuditEvent } from './audit';
import {
  createNxVerificationCommandEvidence,
  createNxVerificationPlanEvidence,
  createNxVerificationRunEvidence,
} from './evidence';
import { type NxVerificationAdapterPlan } from './plan';
import {
  createNxAffectedProjectsProcessPlan,
  createNxVerificationProcessPlan,
  runNxVerificationProcessBoundary,
  type NxVerificationProcessBoundaryResult,
  type NxVerificationProcessRunner,
} from './process-boundary';

export type NxVerificationAdapterRunStatus = 'passed' | 'failed' | 'blocked' | 'aborted';

export interface NxVerificationAdapterExecuteInput {
  plan: NxVerificationAdapterPlan;
  authority?: ExecutionAuthority;
  executablePath: string;
  timeoutMs: number;
  runner?: NxVerificationProcessRunner;
  now?: () => string;
  signal?: AbortSignal;
  actor?: string;
}

export interface NxVerificationAdapterExecuteResult {
  status: NxVerificationAdapterRunStatus;
  capabilityResult: CapabilityExecutionResult;
  verificationRun: VerificationRun;
  affectedProjects: AffectedProject[];
  commandResults: VerificationCommandResult[];
  evidenceRefs: EvidenceRef[];
  auditEvents: CapabilityAuditEvent[];
  boundaryResults: NxVerificationProcessBoundaryResult[];
}

export async function executeNxVerificationAdapter(
  input: NxVerificationAdapterExecuteInput,
): Promise<NxVerificationAdapterExecuteResult> {
  const authorityBlockReason = validateAuthority(input.authority, input.now);
  const planBlockReasons = input.plan.status === 'blocked' ? input.plan.blockReasons : [];

  if (authorityBlockReason || planBlockReasons.length > 0) {
    const blockReasons = [
      ...planBlockReasons,
      ...(authorityBlockReason ? [authorityBlockReason] : []),
    ];

    return createBlockedExecuteResult(input, blockReasons);
  }

  const affectedBoundaryResult = await runNxVerificationProcessBoundary(
    createNxAffectedProjectsProcessPlan({
      dryRunId: input.plan.dryRunId,
      executablePath: input.executablePath,
      cwd: input.plan.cwd,
      cwdHash: input.plan.cwdHash,
      baseRef: input.plan.baseRef,
      headRef: input.plan.headRef,
      timeoutMs: input.timeoutMs,
    }),
    {
      runner: input.runner,
      signal: input.signal,
      now: input.now,
    },
  );
  const boundaryResults = [affectedBoundaryResult];

  if (affectedBoundaryResult.status === 'completed') {
    boundaryResults.push(
      await runNxVerificationProcessBoundary(
        createNxVerificationProcessPlan({
          dryRunId: input.plan.dryRunId,
          executablePath: input.executablePath,
          cwd: input.plan.cwd,
          cwdHash: input.plan.cwdHash,
          targets: input.plan.targets,
          baseRef: input.plan.baseRef,
          headRef: input.plan.headRef,
          timeoutMs: input.timeoutMs,
        }),
        {
          runner: input.runner,
          signal: input.signal,
          now: input.now,
        },
      ),
    );
  }

  const finalStatus = classifyRunStatus(boundaryResults);
  const affectedProjects = affectedBoundaryResult.affectedProjects;
  const commandResults = boundaryResults.map((result) => result.commandResult);
  const commandEvidenceRefs = boundaryResults.map((result) =>
    createNxVerificationCommandEvidence(result),
  );
  const partialRunResult = {
    status: finalStatus,
    affectedProjects,
    commandResults,
  };
  const evidenceRefs = [
    createNxVerificationPlanEvidence(input.plan),
    ...commandEvidenceRefs,
    createNxVerificationRunEvidence(partialRunResult),
  ];
  const auditEvents = [
    createNxVerificationAuditEvent({
      actor: input.actor,
      action: 'nx-affected.verify',
      target: 'affected-projects',
      reason: 'execution authority accepted by workflow gate',
      outcome: finalStatus,
      policyDecisionId: input.authority?.policyDecisionId ?? 'missing-policy-decision',
      evidenceRefs,
      metadata: {
        liveExecution: true,
        processBoundaryInvoked: true,
        externalProcessStarted: boundaryResults.some((result) => result.externalProcessStarted),
        noRealWrite: true,
        commandResultCount: commandResults.length,
      },
    }),
  ];
  const verificationRun = createVerificationRun({
    plan: input.plan,
    status: finalStatus,
    affectedProjects,
    commandResults,
    evidenceRefs,
    auditEvents,
    processBoundaryInvoked: true,
    externalProcessStarted: boundaryResults.some((result) => result.externalProcessStarted),
  });
  const capabilityResult = createCapabilityExecutionResult({
    status: finalStatus === 'passed' ? 'completed' : finalStatus,
    processBoundaryInvoked: true,
    externalProcessStarted: boundaryResults.some((result) => result.externalProcessStarted),
    noRealWrite: true,
    evidenceRefs,
    auditEvents,
    summary: `Nx verification adapter execution ${finalStatus}`,
  });

  return {
    status: finalStatus,
    capabilityResult,
    verificationRun,
    affectedProjects,
    commandResults,
    evidenceRefs,
    auditEvents,
    boundaryResults,
  };
}

function validateAuthority(
  authority: ExecutionAuthority | undefined,
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

  if (
    authority.expiresAt &&
    Date.parse(authority.expiresAt) <= Date.parse((now ?? foundationTimestamp)())
  ) {
    return 'execution_authority_expired';
  }

  return undefined;
}

function createBlockedExecuteResult(
  input: NxVerificationAdapterExecuteInput,
  blockReasons: readonly string[],
): NxVerificationAdapterExecuteResult {
  const planEvidence = createNxVerificationPlanEvidence(input.plan);
  const evidenceRefs = [planEvidence];
  const auditEvents = [
    createNxVerificationAuditEvent({
      actor: input.actor,
      action: 'nx-affected.verify',
      target: 'affected-projects',
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
  const verificationRun = createVerificationRun({
    plan: input.plan,
    status: 'blocked',
    affectedProjects: [],
    commandResults: [],
    evidenceRefs,
    auditEvents,
    processBoundaryInvoked: false,
    externalProcessStarted: false,
  });
  const capabilityResult = createCapabilityExecutionResult({
    status: 'blocked',
    processBoundaryInvoked: false,
    externalProcessStarted: false,
    noRealWrite: true,
    evidenceRefs,
    auditEvents,
    summary: `Nx verification adapter execution blocked: ${blockReasons.join(', ')}`,
  });

  return {
    status: 'blocked',
    capabilityResult,
    verificationRun,
    affectedProjects: [],
    commandResults: [],
    evidenceRefs,
    auditEvents,
    boundaryResults: [],
  };
}

function classifyRunStatus(
  boundaryResults: readonly NxVerificationProcessBoundaryResult[],
): NxVerificationAdapterRunStatus {
  if (boundaryResults.some((result) => result.status === 'aborted')) {
    return 'aborted';
  }

  if (
    boundaryResults.length < 2 ||
    boundaryResults.some((result) => result.status === 'failed')
  ) {
    return 'failed';
  }

  return 'passed';
}

function createVerificationRun(input: {
  plan: NxVerificationAdapterPlan;
  status: NxVerificationAdapterRunStatus;
  affectedProjects: AffectedProject[];
  commandResults: VerificationCommandResult[];
  evidenceRefs: EvidenceRef[];
  auditEvents: CapabilityAuditEvent[];
  processBoundaryInvoked: boolean;
  externalProcessStarted: boolean;
}): VerificationRun {
  return VerificationRunSchema.parse({
    id: foundationId('verification_run'),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: foundationTimestamp(),
    targetId: input.plan.adapterName,
    status: input.status,
    checks: input.plan.targets,
    evidenceRefs: input.evidenceRefs,
    planId: input.plan.verificationPlan.id,
    affectedProjects: input.affectedProjects,
    commandResults: input.commandResults,
    processBoundaryInvoked: input.processBoundaryInvoked,
    externalProcessStarted: input.externalProcessStarted,
    noRealWrite: true,
    auditEventIds: input.auditEvents.map((event) => event.id),
    summary: `Nx verification run ${input.status}`,
  });
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

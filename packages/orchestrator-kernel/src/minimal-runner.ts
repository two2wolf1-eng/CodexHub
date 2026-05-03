import {
  createCodexExecAdapterPlan,
  executeCodexExecAdapter,
  type CodexExecAdapterExecuteInput,
  type CodexExecAdapterExecuteResult,
} from '@codexhub/codex-exec-adapter';
import {
  createNxVerificationAdapterPlan,
  executeNxVerificationAdapter,
  type NxVerificationAdapterExecuteInput,
  type NxVerificationAdapterExecuteResult,
} from '@codexhub/nx-verification-adapter';
import {
  type AuditEvent,
  type CapabilityExecutionResult,
  type DevelopmentRequest,
  type EvidenceRef,
  type ExecutionAuthority,
  type OrchestrationAdapterRunSummary,
  type OrchestrationPlan,
  type OrchestrationRun,
  type OrchestrationRunStatus,
  type OrchestrationTimelineEvent,
  type PolicyDecision,
  SchemaVersionSchema,
  OrchestrationRunSchema,
  foundationId,
  foundationTimestamp,
} from '@codexhub/contracts';
import { MetadataOnlyEvidenceCollector, hashText } from '@codexhub/evidence-kernel';
import { DefaultPolicyEngine, type PolicyEngine } from '@codexhub/security-kernel';
import type { CodexHubStore } from '@codexhub/store-core';

export interface MinimalOrchestratorGovernedInput {
  relativePath: string;
  expectedContentHash?: string;
  contentHash?: string;
}

export interface MinimalOrchestratorRunInput {
  title: string;
  description: string;
  constraints?: string[];
  metadata?: Record<string, unknown>;
  dryRunId: string;
  worktreePath?: string;
  governedInput?: MinimalOrchestratorGovernedInput;
  approvalArtifactId?: string;
  allowedCwdRoots?: readonly string[];
  verificationTargets?: readonly string[];
  baseRef?: string;
  headRef?: string;
  codexExecutablePath?: string;
  nxExecutablePath?: string;
  timeoutMs?: number;
  store?: CodexHubStore;
  policyEngine?: PolicyEngine;
  codexRunner?: CodexExecAdapterExecuteInput['runner'];
  nxRunner?: NxVerificationAdapterExecuteInput['runner'];
  now?: () => string;
  signal?: AbortSignal;
  actor?: string;
  approvalArtifact?: unknown;
  executionAuthority?: unknown;
}

export interface MinimalOrchestratorRunResult {
  run: OrchestrationRun;
  request: DevelopmentRequest;
  orchestrationPlan: OrchestrationPlan;
  policyDecisions: PolicyDecision[];
  evidenceRefs: EvidenceRef[];
  auditEvents: AuditEvent[];
  codexResult?: CodexExecAdapterExecuteResult;
  nxResult?: NxVerificationAdapterExecuteResult;
}

export async function runMinimalGovernedOrchestration(
  input: MinimalOrchestratorRunInput,
): Promise<MinimalOrchestratorRunResult> {
  const now = input.now ?? foundationTimestamp;
  const policyEngine = input.policyEngine ?? new DefaultPolicyEngine();
  const actor = input.actor ?? 'orchestrator-kernel.minimal';
  const runId = foundationId('orchestration_run');
  const request = createMinimalDevelopmentRequest(input, now);
  const orchestrationPlan = createMinimalOrchestrationPlan(request, now);
  const timeline: OrchestrationTimelineEvent[] = [
    createTimelineEvent({
      runId,
      phase: 'request',
      status: 'running',
      summary: `Accepted minimal orchestration request for ${input.title}.`,
      now,
    }),
    createTimelineEvent({
      runId,
      phase: 'plan',
      status: 'running',
      summary: 'Prepared governed Codex and Nx adapter plans.',
      now,
    }),
  ];
  const evidenceRefs: EvidenceRef[] = [];
  const auditEvents: AuditEvent[] = [];
  const policyDecisions: PolicyDecision[] = [];

  const preExecutionBlockReasons = [
    ...collectUntrustedAuthorityBlockReasons(input),
    ...collectExecutableConfigurationBlockReasons(input),
  ];

  if (preExecutionBlockReasons.length > 0) {
    const blockedArtifacts = await createBlockedArtifacts({
      actor,
      runId,
      requestId: request.id,
      policyDecisionId: 'blocked-before-policy',
      reasons: preExecutionBlockReasons,
      now,
    });
    evidenceRefs.push(...blockedArtifacts.evidenceRefs);
    auditEvents.push(...blockedArtifacts.auditEvents);
    timeline.push(
      createTimelineEvent({
        runId,
        phase: 'summary',
        status: 'blocked',
        summary: `Blocked orchestration before adapter execution: ${preExecutionBlockReasons.join(', ')}.`,
        evidenceRefs: blockedArtifacts.evidenceRefs,
        auditEvents: blockedArtifacts.auditEvents,
        now,
      }),
    );

    const run = createOrchestrationRun({
      runId,
      request,
      orchestrationPlan,
      status: 'blocked',
      timeline,
      evidenceRefs,
      auditEvents,
      policyDecisions,
    });
    await persistEvidenceAndAudit(input.store, evidenceRefs, auditEvents);

    return { run, request, orchestrationPlan, policyDecisions, evidenceRefs, auditEvents };
  }

  const codexPlan = createCodexExecAdapterPlan({
    dryRunId: input.dryRunId,
    cwd: input.worktreePath ?? process.cwd(),
    allowedCwdRoots: input.allowedCwdRoots ?? (input.worktreePath ? [input.worktreePath] : []),
    governedInput:
      input.governedInput && readExpectedGovernedInputHash(input.governedInput)
        ? {
            sourceKind: 'governed_file',
            relativePath: input.governedInput.relativePath,
            expectedContentHash: readExpectedGovernedInputHash(input.governedInput),
          }
        : undefined,
    sandboxMode: 'read-only',
    approvalMode: 'required',
    metadata: {
      source: 'orchestrator-kernel.minimal.codex-plan',
      runId,
      bodyStored: false,
    },
  });
  const codexAuthorityResolution = await resolveCodexAuthority({
    store: input.store,
    approvalArtifactId: input.approvalArtifactId,
    dryRunId: input.dryRunId,
    policyEngine,
    actionId: codexPlan.id,
    now,
  });
  policyDecisions.push(codexAuthorityResolution.policyDecision);

  const codexResult = await executeCodexExecAdapter({
    plan: codexPlan,
    authority: codexAuthorityResolution.authority,
    approvalArtifactId: input.approvalArtifactId,
    executablePath: input.codexExecutablePath ?? 'codex',
    timeoutMs: input.timeoutMs ?? 60_000,
    runner: input.codexRunner,
    now,
    signal: input.signal,
    actor,
  });
  evidenceRefs.push(...codexResult.evidenceRefs);
  auditEvents.push(...codexResult.auditEvents);
  const codexStatus = capabilityStatusToOrchestrationStatus(
    codexResult.capabilityResult.status,
  );
  timeline.push(
    createTimelineEvent({
      runId,
      phase: 'codex',
      status: codexStatus,
      summary: codexResult.capabilityResult.summary,
      evidenceRefs: codexResult.evidenceRefs,
      auditEvents: codexResult.auditEvents,
      now,
    }),
  );

  let nxResult: NxVerificationAdapterExecuteResult | undefined;
  let verificationStatus: OrchestrationRunStatus | undefined;

  if (codexResult.capabilityResult.status === 'completed') {
    const nxPlan = createNxVerificationAdapterPlan({
      dryRunId: input.dryRunId,
      cwd: input.worktreePath ?? process.cwd(),
      allowedCwdRoots: input.allowedCwdRoots ?? (input.worktreePath ? [input.worktreePath] : []),
      targets: input.verificationTargets ?? ['lint', 'test', 'build'],
      baseRef: input.baseRef,
      headRef: input.headRef,
      metadata: {
        source: 'orchestrator-kernel.minimal.nx-plan',
        runId,
        bodyStored: false,
      },
    });
    const nxPolicyDecision = policyEngine.evaluateAction({
      actionId: nxPlan.id,
      actionType: 'nx.affected.verify',
      actionMode: 'read',
      riskLevel: 'low',
      dryRun: true,
      metadata: {
        noRealWrite: true,
        adapterName: nxPlan.adapterName,
      },
    });
    policyDecisions.push(nxPolicyDecision);
    const nxAuthority = createExecutionAuthority({
      policyDecision: nxPolicyDecision,
      allowed: nxPolicyDecision.outcome === 'allow',
      constraints: ['nx-affected.allowlisted-targets', 'output-hash-only', 'no-real-write'],
      now,
    });

    if (!input.nxExecutablePath && !input.nxRunner) {
      const blockedArtifacts = await createBlockedArtifacts({
        actor,
        runId,
        requestId: request.id,
        policyDecisionId: nxPolicyDecision.id,
        reasons: ['nx_executable_path_required'],
        now,
      });
      evidenceRefs.push(...blockedArtifacts.evidenceRefs);
      auditEvents.push(...blockedArtifacts.auditEvents);
      verificationStatus = 'blocked';
      timeline.push(
        createTimelineEvent({
          runId,
          phase: 'verification',
          status: verificationStatus,
          summary: 'Blocked Nx verification because no executable path was configured.',
          evidenceRefs: blockedArtifacts.evidenceRefs,
          auditEvents: blockedArtifacts.auditEvents,
          now,
        }),
      );
    } else {
      nxResult = await executeNxVerificationAdapter({
        plan: nxPlan,
        authority: nxAuthority,
        executablePath: input.nxExecutablePath ?? 'pnpm',
        timeoutMs: input.timeoutMs ?? 60_000,
        runner: input.nxRunner,
        now,
        signal: input.signal,
        actor,
      });
      evidenceRefs.push(...nxResult.evidenceRefs);
      auditEvents.push(...nxResult.auditEvents);
      verificationStatus = nxStatusToOrchestrationStatus(nxResult.status);
      timeline.push(
        createTimelineEvent({
          runId,
          phase: 'verification',
          status: verificationStatus,
          summary: nxResult.capabilityResult.summary,
          evidenceRefs: nxResult.evidenceRefs,
          auditEvents: nxResult.auditEvents,
          now,
        }),
      );
    }
  } else {
    verificationStatus =
      codexStatus === 'aborted' ? 'aborted' : codexStatus === 'blocked' ? 'blocked' : 'failed';
    timeline.push(
      createTimelineEvent({
        runId,
        phase: 'verification',
        status: verificationStatus,
        summary: 'Skipped Nx verification because Codex adapter did not complete.',
        now,
      }),
    );
  }

  const finalStatus = classifyFinalStatus(codexStatus, verificationStatus);
  timeline.push(
    createTimelineEvent({
      runId,
      phase: 'summary',
      status: finalStatus,
      summary: `Minimal orchestration ${finalStatus}.`,
      now,
    }),
  );
  const run = createOrchestrationRun({
    runId,
    request,
    orchestrationPlan,
    status: finalStatus,
    codexResult,
    nxResult,
    timeline,
    evidenceRefs,
    auditEvents,
    policyDecisions,
  });
  await persistEvidenceAndAudit(input.store, evidenceRefs, auditEvents);

  return {
    run,
    request,
    orchestrationPlan,
    policyDecisions,
    evidenceRefs,
    auditEvents,
    codexResult,
    nxResult,
  };
}

function createMinimalDevelopmentRequest(
  input: Pick<MinimalOrchestratorRunInput, 'title' | 'description' | 'constraints' | 'metadata'>,
  now: () => string,
): DevelopmentRequest {
  return {
    id: foundationId('development_request'),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: now(),
    title: input.title,
    description: input.description,
    constraints: input.constraints ?? [
      'governed-input-required',
      'persisted-approval-required-for-codex',
      'nx-affected-after-codex',
      'metadata-only-evidence',
    ],
    metadata: {
      source: 'orchestrator-kernel.minimal',
      bodyStored: false,
      rawPathStored: false,
      ...(input.metadata ?? {}),
    },
  };
}

function createMinimalOrchestrationPlan(
  request: DevelopmentRequest,
  now: () => string,
): OrchestrationPlan {
  return {
    id: foundationId('orchestration_plan'),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: now(),
    requestId: request.id,
    taskGraphId: foundationId('task_graph'),
    skillResolutionId: foundationId('skill_resolution'),
    workflowNames: ['codex.exec.adapter', 'nx.affected.verify'],
    summary: `Minimal governed Codex/Nx orchestration for ${request.title}.`,
    metadata: {
      source: 'orchestrator-kernel.minimal',
      noNewProcessBoundary: true,
      bodyStored: false,
      rawPathStored: false,
    },
  };
}

function collectUntrustedAuthorityBlockReasons(
  input: MinimalOrchestratorRunInput,
): string[] {
  const reasons: string[] = [];

  if (input.approvalArtifact !== undefined) {
    reasons.push('untrusted_approval_artifact_body');
  }

  if (input.executionAuthority !== undefined) {
    reasons.push('untrusted_execution_authority_body');
  }

  return reasons;
}

function collectExecutableConfigurationBlockReasons(
  input: MinimalOrchestratorRunInput,
): string[] {
  const reasons: string[] = [];

  if (!input.codexExecutablePath && !input.codexRunner) {
    reasons.push('codex_executable_path_required');
  }

  return reasons;
}

async function resolveCodexAuthority(input: {
  store?: CodexHubStore;
  approvalArtifactId?: string;
  dryRunId: string;
  policyEngine: PolicyEngine;
  actionId: string;
  now: () => string;
}): Promise<{ authority?: ExecutionAuthority; policyDecision: PolicyDecision; reasonCodes: string[] }> {
  const reasonCodes: string[] = [];

  if (!input.approvalArtifactId) {
    reasonCodes.push('approval_artifact_id_required');
  }

  if (!input.store) {
    reasonCodes.push('approval_store_required');
  }

  const approvalRecord =
    input.store && input.approvalArtifactId
      ? await input.store.codexExecApprovals.getCodexExecApprovalRecordByArtifactId(
          input.approvalArtifactId,
        )
      : undefined;
  const artifact = approvalRecord?.approvalArtifact;

  if (input.approvalArtifactId && !approvalRecord) {
    reasonCodes.push('approval_artifact_not_found');
  }

  if (artifact) {
    if (artifact.id !== input.approvalArtifactId) {
      reasonCodes.push('approval_artifact_id_mismatch');
    }

    if (artifact.dryRunPlanId !== input.dryRunId) {
      reasonCodes.push('approval_dry_run_mismatch');
    }

    if (artifact.status !== 'approved') {
      reasonCodes.push('approval_not_approved');
    }

    if (artifact.revoked === true) {
      reasonCodes.push('approval_revoked');
    }

    if (artifact.usedAt) {
      reasonCodes.push('approval_already_used');
    }

    if (Date.parse(artifact.expiresAt) <= Date.parse(input.now())) {
      reasonCodes.push('approval_expired');
    }
  }

  const policyDecision = input.policyEngine.evaluateAction({
    actionId: input.actionId,
    actionType: 'orchestrator.codex_cli.execute',
    actionMode: 'dry-run',
    riskLevel: 'high',
    dryRun: true,
    approvalGranted: reasonCodes.length === 0,
    metadata: {
      dryRunId: input.dryRunId,
      approvalArtifactPresent: Boolean(artifact),
      noRealWrite: true,
    },
  });

  if (reasonCodes.length > 0 || policyDecision.outcome !== 'allow' || !artifact) {
    return { policyDecision, reasonCodes };
  }

  return {
    policyDecision,
    reasonCodes,
    authority: createExecutionAuthority({
      policyDecision,
      approvalArtifactId: artifact.id,
      allowed: true,
      constraints: ['codex-cli.read-only', 'governed-input-file', 'no-real-write'],
      now: input.now,
    }),
  };
}

function createExecutionAuthority(input: {
  policyDecision: PolicyDecision;
  approvalArtifactId?: string;
  allowed: boolean;
  constraints: string[];
  now: () => string;
}): ExecutionAuthority {
  return {
    id: foundationId('execution_authority'),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: input.now(),
    policyDecisionId: input.policyDecision.id,
    approvalArtifactId: input.approvalArtifactId,
    allowed: input.allowed,
    constraints: input.constraints,
  };
}

function createTimelineEvent(input: {
  runId: string;
  phase: OrchestrationTimelineEvent['phase'];
  status: OrchestrationRunStatus;
  summary: string;
  evidenceRefs?: readonly EvidenceRef[];
  auditEvents?: readonly AuditEvent[];
  now: () => string;
}): OrchestrationTimelineEvent {
  return {
    id: foundationId('orchestration_timeline_event'),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: input.now(),
    runId: input.runId,
    phase: input.phase,
    status: input.status,
    summary: input.summary,
    evidenceRefIds: (input.evidenceRefs ?? []).map((ref) => ref.id),
    auditEventIds: (input.auditEvents ?? []).map((event) => event.id),
  };
}

async function createBlockedArtifacts(input: {
  actor: string;
  runId: string;
  requestId: string;
  policyDecisionId: string;
  reasons: readonly string[];
  now: () => string;
}): Promise<{ evidenceRefs: EvidenceRef[]; auditEvents: AuditEvent[] }> {
  const collector = new MetadataOnlyEvidenceCollector();
  const evidence = await collector.collect({
    kind: 'hash',
    label: `orchestration-blocked:${input.runId}`,
    summary: 'Minimal orchestration blocked before adapter execution.',
    metadata: {
      runId: input.runId,
      requestId: input.requestId,
      reasonCount: input.reasons.length,
      bodyStored: false,
      rawPathStored: false,
      processBoundaryInvoked: false,
      externalProcessStarted: false,
    },
    bodyForHashOnly: JSON.stringify({
      runId: input.runId,
      requestId: input.requestId,
      reasons: input.reasons,
    }),
  });
  const audit: AuditEvent = {
    id: foundationId('audit'),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: input.now(),
    actor: input.actor,
    action: 'orchestrator.minimal.blocked',
    target: 'minimal-orchestration',
    reason: 'untrusted authority input rejected before adapter execution',
    outcome: 'blocked',
    policyDecisionId: input.policyDecisionId,
    evidenceRefs: [evidence],
    metadata: {
      runId: input.runId,
      requestId: input.requestId,
      reasonCodes: input.reasons,
      bodyStored: false,
      rawPathStored: false,
      processBoundaryInvoked: false,
      externalProcessStarted: false,
    },
  };

  return { evidenceRefs: [evidence], auditEvents: [audit] };
}

function createOrchestrationRun(input: {
  runId: string;
  request: DevelopmentRequest;
  orchestrationPlan: OrchestrationPlan;
  status: OrchestrationRunStatus;
  codexResult?: CodexExecAdapterExecuteResult;
  nxResult?: NxVerificationAdapterExecuteResult;
  timeline: OrchestrationTimelineEvent[];
  evidenceRefs: EvidenceRef[];
  auditEvents: AuditEvent[];
  policyDecisions: PolicyDecision[];
}): OrchestrationRun {
  const codexRun = input.codexResult
    ? createAdapterSummary('codex-cli', input.codexResult.capabilityResult)
    : undefined;
  const verificationRun = input.nxResult
    ? createAdapterSummary('nx-affected', input.nxResult.capabilityResult)
    : undefined;
  const processBoundaryInvoked = Boolean(
    codexRun?.processBoundaryInvoked || verificationRun?.processBoundaryInvoked,
  );
  const externalProcessStarted = Boolean(
    codexRun?.externalProcessStarted || verificationRun?.externalProcessStarted,
  );

  return OrchestrationRunSchema.parse({
    id: input.runId,
    schemaVersion: SchemaVersionSchema.value,
    createdAt: input.timeline[0]?.createdAt ?? foundationTimestamp(),
    requestId: input.request.id,
    orchestrationPlanId: input.orchestrationPlan.id,
    status: input.status,
    codexRun,
    verificationRun,
    timeline: input.timeline,
    evidenceRefIds: input.evidenceRefs.map((ref) => ref.id),
    auditEventIds: input.auditEvents.map((event) => event.id),
    policyDecisionIds: input.policyDecisions.map((decision) => decision.id),
    summary: {
      requestTitle: input.request.title,
      status: input.status,
      codexStatus: codexRun?.status,
      verificationStatus: verificationRun?.status,
      affectedProjectCount: input.nxResult?.affectedProjects.length ?? 0,
      commandResultCount: input.nxResult?.commandResults.length ?? 0,
      evidenceCount: input.evidenceRefs.length,
      auditEventCount: input.auditEvents.length,
      policyDecisionCount: input.policyDecisions.length,
      processBoundaryInvoked,
      externalProcessStarted,
      noRealWrite: true,
      bodyStored: false,
      rawPathStored: false,
    },
  });
}

function createAdapterSummary(
  adapterName: string,
  result: CapabilityExecutionResult,
): OrchestrationAdapterRunSummary {
  return {
    adapterName,
    status: capabilityStatusToOrchestrationStatus(result.status),
    capabilityResultId: result.id,
    processBoundaryInvoked: result.processBoundaryInvoked,
    externalProcessStarted: result.externalProcessStarted,
    noRealWrite: true,
    evidenceRefIds: result.evidenceRefs,
    auditEventIds: result.auditEventIds,
    summary: result.summary,
  };
}

function capabilityStatusToOrchestrationStatus(
  status: CapabilityExecutionResult['status'],
): OrchestrationRunStatus {
  return status === 'completed' ? 'passed' : status;
}

function nxStatusToOrchestrationStatus(
  status: NxVerificationAdapterExecuteResult['status'],
): OrchestrationRunStatus {
  return status;
}

function classifyFinalStatus(
  codexStatus: OrchestrationRunStatus,
  verificationStatus: OrchestrationRunStatus | undefined,
): OrchestrationRunStatus {
  if (codexStatus === 'blocked' || verificationStatus === 'blocked') {
    return 'blocked';
  }

  if (codexStatus === 'aborted' || verificationStatus === 'aborted') {
    return 'aborted';
  }

  if (codexStatus !== 'passed' || verificationStatus !== 'passed') {
    return 'failed';
  }

  return 'passed';
}

function readExpectedGovernedInputHash(
  input: MinimalOrchestratorGovernedInput,
): string {
  return input.expectedContentHash ?? input.contentHash ?? '';
}

async function persistEvidenceAndAudit(
  store: CodexHubStore | undefined,
  evidenceRefs: readonly EvidenceRef[],
  auditEvents: readonly AuditEvent[],
): Promise<void> {
  if (!store) {
    return;
  }

  for (const evidenceRef of evidenceRefs) {
    await store.evidenceRefs.create(evidenceRef);
  }

  for (const auditEvent of auditEvents) {
    await store.auditEvents.append(auditEvent);
  }
}

export function createMinimalOrchestratorPathHash(value: string): string {
  return `sha256:${hashText(value)}`;
}

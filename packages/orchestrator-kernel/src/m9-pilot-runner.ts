import {
  type AuditEvent,
  type EvidenceRef,
  type ExecutionAuthority,
  type M9PilotEvidenceSummary,
  M9PilotEvidenceSummarySchema,
  type M9PilotReadiness,
  M9PilotReadinessSchema,
  type M9PilotRun,
  M9PilotRunSchema,
  type M9PilotRunStatus,
  type M9PilotStep,
  M9PilotStepSchema,
  type M9PilotStepStatus,
  type PolicyDecision,
  SchemaVersionSchema,
  foundationId,
  foundationTimestamp,
} from '@codexhub/contracts';
import { hashText } from '@codexhub/evidence-kernel';
import { DefaultPolicyEngine, type PolicyEngine } from '@codexhub/security-kernel';
import type { CodexHubStore } from '@codexhub/store-core';
import {
  type WorktreeManagerExecuteResult,
  type WorktreeManagerFixtureRunner,
  createWorktreeManagerPlan,
  executeWorktreeManager,
} from '@codexhub/worktree-manager';
import {
  type MinimalOrchestratorGovernedInput,
  type MinimalOrchestratorRunInput,
  type MinimalOrchestratorRunResult,
  runMinimalGovernedOrchestration,
} from './minimal-runner';

export interface M9LocalPilotInput
  extends Pick<
    MinimalOrchestratorRunInput,
    | 'title'
    | 'description'
    | 'constraints'
    | 'metadata'
    | 'codexExecutablePath'
    | 'nxExecutablePath'
    | 'codexRunner'
    | 'nxRunner'
    | 'verificationTargets'
    | 'headRef'
    | 'timeoutMs'
    | 'signal'
    | 'actor'
    | 'now'
  > {
  repoRoot: string;
  worktreeRoot: string;
  worktreePath: string;
  worktreeSlug: string;
  branchName: string;
  baseRef: string;
  allowedWorktreeRoots?: readonly string[];
  codexDryRunId: string;
  worktreeApprovalArtifactId?: string;
  codexApprovalArtifactId?: string;
  governedInput?: MinimalOrchestratorGovernedInput;
  store?: CodexHubStore;
  policyEngine?: PolicyEngine;
  pilotEnabled?: boolean;
  worktreeApprovalResolved?: boolean;
  realGitBoundaryEnabled?: boolean;
  worktreeRunner?: WorktreeManagerFixtureRunner;
  approvalArtifact?: unknown;
  executionAuthority?: unknown;
}

export interface M9LocalPilotResult {
  run: M9PilotRun;
  worktree?: WorktreeManagerExecuteResult;
  minimalRun?: MinimalOrchestratorRunResult;
  policyDecisions: PolicyDecision[];
  evidenceRefs: EvidenceRef[];
  auditEvents: AuditEvent[];
}

export async function runM9LocalPilot(input: M9LocalPilotInput): Promise<M9LocalPilotResult> {
  const now = input.now ?? foundationTimestamp;
  const runId = foundationId('m9_pilot_run');
  const actor = input.actor ?? 'orchestrator-kernel.m9-pilot';
  const policyEngine = input.policyEngine ?? new DefaultPolicyEngine();
  const readiness = createReadiness(input, now);
  const policyDecisions: PolicyDecision[] = [];
  const evidenceRefs: EvidenceRef[] = [];
  const auditEvents: AuditEvent[] = [];
  const steps: M9PilotStep[] = [
    createStep({
      phase: 'readiness',
      status: readiness.status === 'ready' ? 'completed' : 'blocked',
      order: 0,
      summary: readiness.summary,
      now,
    }),
  ];

  if (readiness.status !== 'ready') {
    const evidenceSummary = createEvidenceSummary({ runId, evidenceRefs, auditEvents, now });
    const run = createM9Run({
      runId,
      input,
      readiness,
      steps: [
        ...steps,
        createStep({
          phase: 'summary',
          status: 'blocked',
          order: 1,
          summary: `M9 pilot blocked: ${readiness.blockers.join(', ')}.`,
          now,
        }),
      ],
      evidenceSummary,
      status: 'blocked',
      summary: `M9 pilot blocked: ${readiness.blockers.join(', ')}.`,
      now,
    });

    return { run, policyDecisions, evidenceRefs, auditEvents };
  }

  const worktreePlan = createWorktreeManagerPlan({
    repoRoot: input.repoRoot,
    worktreeSlug: input.worktreeSlug,
    branchName: input.branchName,
    baseRef: input.baseRef,
    runnerMode: 'controlled-git-worktree',
    worktreeRoot: input.worktreeRoot,
    allowedWorktreeRoots: input.allowedWorktreeRoots,
    now,
  });
  const worktreePolicyDecision = policyEngine.evaluateAction({
    actionId: worktreePlan.id,
    actionType: 'git.worktree.create',
    actionMode: 'write',
    riskLevel: 'high',
    dryRun: true,
    approvalGranted: Boolean(input.worktreeApprovalArtifactId && input.worktreeApprovalResolved),
    metadata: {
      m9: true,
      worktreePathHash: worktreePlan.worktreePathHash,
      realWrite: true,
      bodyStored: false,
      rawPathStored: false,
    },
  });
  policyDecisions.push(worktreePolicyDecision);
  const worktreeAuthority = createExecutionAuthority({
    policyDecision: worktreePolicyDecision,
    approvalArtifactId: input.worktreeApprovalArtifactId,
    allowed:
      worktreePolicyDecision.outcome === 'allow' &&
      Boolean(input.worktreeApprovalArtifactId) &&
      input.worktreeApprovalResolved === true,
    constraints: [
      'm9_controlled_git_worktree',
      'fixed_git_argv_only',
      'sibling_worktree_root',
      'no_push',
      'no_pull_request_open',
    ],
    now,
  });
  const worktree = await executeWorktreeManager({
    plan: worktreePlan,
    authority: worktreeAuthority,
    runner: input.worktreeRunner,
    realGitBoundaryEnabled: input.realGitBoundaryEnabled,
    runtime: {
      repoRoot: input.repoRoot,
      worktreeRoot: input.worktreeRoot,
      worktreePath: input.worktreePath,
      worktreeSlug: input.worktreeSlug,
      branchName: input.branchName,
      baseRef: input.baseRef,
    },
    actor,
    now,
  });
  evidenceRefs.push(...worktree.evidenceRefs);
  auditEvents.push(...worktree.auditEvents);
  steps.push(
    createStep({
      phase: 'worktree',
      status: capabilityStepStatus(worktree.status),
      order: 1,
      evidenceRefs: worktree.evidenceRefs,
      auditEvents: worktree.auditEvents,
      boundaryInvoked: worktree.worktreeRun.processBoundaryInvoked,
      externalProcessStarted: worktree.worktreeRun.externalProcessStarted,
      summary: worktree.worktreeRun.summary,
      now,
    }),
  );

  let minimalRun: MinimalOrchestratorRunResult | undefined;
  if (worktree.status === 'completed') {
    minimalRun = await runMinimalGovernedOrchestration({
      title: input.title,
      description: input.description,
      constraints: input.constraints,
      metadata: {
        ...(input.metadata ?? {}),
        m9Pilot: true,
        codexDryRunOnly: true,
        prDraftReady: false,
        bodyStored: false,
        rawPathStored: false,
      },
      dryRunId: input.codexDryRunId,
      worktreePath: input.worktreePath,
      governedInput: input.governedInput,
      approvalArtifactId: input.codexApprovalArtifactId,
      allowedCwdRoots: [input.worktreePath],
      verificationTargets: input.verificationTargets,
      baseRef: input.baseRef,
      headRef: input.headRef,
      codexExecutablePath: input.codexExecutablePath,
      nxExecutablePath: input.nxExecutablePath,
      store: input.store,
      policyEngine,
      codexRunner: input.codexRunner,
      nxRunner: input.nxRunner,
      now,
      signal: input.signal,
      actor,
    });
    policyDecisions.push(...minimalRun.policyDecisions);
    evidenceRefs.push(...minimalRun.evidenceRefs);
    auditEvents.push(...minimalRun.auditEvents);
  }

  steps.push(...createMinimalSteps(minimalRun, worktree.status, now));
  const evidenceSummary = createEvidenceSummary({ runId, evidenceRefs, auditEvents, now });
  const status = classifyPilotStatus(worktree, minimalRun);
  steps.push(
    createStep({
      phase: 'summary',
      status: status === 'passed' ? 'passed' : status,
      order: steps.length,
      evidenceRefs,
      auditEvents,
      summary: `M9 local pilot ${status}.`,
      now,
    }),
  );
  const run = createM9Run({
    runId,
    input,
    readiness,
    steps,
    evidenceSummary,
    status,
    worktree,
    minimalRun,
    summary: `M9 local pilot ${status}; PR draft remains ${
      worktree.patchSummary.changedFileCount === 0 ? 'blocked_no_patch' : 'not_ready'
    }.`,
    now,
  });

  return { run, worktree, minimalRun, policyDecisions, evidenceRefs, auditEvents };
}

function createReadiness(input: M9LocalPilotInput, now: () => string): M9PilotReadiness {
  const blockers = [
    ...(input.pilotEnabled === true ? [] : ['m9_local_pilot_disabled']),
    ...(input.approvalArtifact !== undefined ? ['untrusted_approval_artifact_body'] : []),
    ...(input.executionAuthority !== undefined ? ['untrusted_execution_authority_body'] : []),
    ...(input.worktreeApprovalArtifactId ? [] : ['worktree_approval_artifact_id_required']),
    ...(input.worktreeApprovalResolved === true ? [] : ['worktree_approval_not_store_resolved']),
    ...(input.codexApprovalArtifactId ? [] : ['codex_approval_artifact_id_required']),
    ...(input.governedInput?.relativePath ? [] : ['governed_input_relative_path_required']),
    ...(input.governedInput?.expectedContentHash || input.governedInput?.contentHash
      ? []
      : ['governed_input_hash_required']),
  ];

  return M9PilotReadinessSchema.parse({
    id: foundationId('m9_pilot_readiness'),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: now(),
    status: blockers.length === 0 ? 'ready' : 'blocked',
    checkCount: 8,
    passedCheckCount: Math.max(0, 8 - blockers.length),
    blockerCount: blockers.length,
    blockers,
    worktreeManagerEnabled: input.realGitBoundaryEnabled === true,
    codexDryRunOnly: true,
    nxVerificationPlanned: true,
    rawPathStored: false,
    bodyStored: false,
    summary:
      blockers.length === 0
        ? 'M9 pilot readiness checks passed.'
        : `M9 pilot readiness blocked by ${blockers.length} gate(s).`,
  });
}

function createMinimalSteps(
  minimalRun: MinimalOrchestratorRunResult | undefined,
  worktreeStatus: WorktreeManagerExecuteResult['status'],
  now: () => string,
): M9PilotStep[] {
  if (!minimalRun) {
    const status = worktreeStatus === 'aborted' ? 'aborted' : 'skipped';

    return [
      createStep({
        phase: 'codex',
        status,
        order: 2,
        summary: 'Codex dry-run skipped because controlled worktree did not complete.',
        now,
      }),
      createStep({
        phase: 'verification',
        status,
        order: 3,
        summary: 'Nx verification skipped because Codex dry-run did not run.',
        now,
      }),
    ];
  }

  const codex = minimalRun.run.codexRun;
  const verification = minimalRun.run.verificationRun;

  return [
    createStep({
      phase: 'codex',
      status: orchestrationStepStatus(codex?.status),
      order: 2,
      evidenceRefs: minimalRun.evidenceRefs.filter((ref) => codex?.evidenceRefIds.includes(ref.id)),
      auditEvents: minimalRun.auditEvents.filter((event) => codex?.auditEventIds.includes(event.id)),
      boundaryInvoked: codex?.processBoundaryInvoked ?? false,
      externalProcessStarted: codex?.externalProcessStarted ?? false,
      summary: codex?.summary ?? 'Codex dry-run did not produce a summary.',
      now,
    }),
    createStep({
      phase: 'verification',
      status: orchestrationStepStatus(verification?.status),
      order: 3,
      evidenceRefs: minimalRun.evidenceRefs.filter((ref) =>
        verification?.evidenceRefIds.includes(ref.id),
      ),
      auditEvents: minimalRun.auditEvents.filter((event) =>
        verification?.auditEventIds.includes(event.id),
      ),
      boundaryInvoked: verification?.processBoundaryInvoked ?? false,
      externalProcessStarted: verification?.externalProcessStarted ?? false,
      summary: verification?.summary ?? 'Nx verification did not produce a summary.',
      now,
    }),
  ];
}

function createM9Run(input: {
  runId: string;
  input: M9LocalPilotInput;
  readiness: M9PilotReadiness;
  steps: readonly M9PilotStep[];
  evidenceSummary: M9PilotEvidenceSummary;
  status: M9PilotRunStatus;
  worktree?: WorktreeManagerExecuteResult;
  minimalRun?: MinimalOrchestratorRunResult;
  summary: string;
  now: () => string;
}): M9PilotRun {
  const codex = input.minimalRun?.run.codexRun;
  const verification = input.minimalRun?.run.verificationRun;
  const changedFileCount = input.worktree?.patchSummary.changedFileCount ?? 0;

  return M9PilotRunSchema.parse({
    id: input.runId,
    schemaVersion: SchemaVersionSchema.value,
    createdAt: input.now(),
    status: input.status,
    requestTitleHash: stableHash(input.input.title),
    requestDescriptionHash: stableHash(input.input.description),
    readiness: input.readiness,
    steps: [...input.steps],
    evidenceSummary: input.evidenceSummary,
    worktreeRunId: input.worktree?.worktreeRun.id,
    codexStatus: codex?.status,
    verificationStatus: verification?.status,
    prDraftStatus: changedFileCount === 0 ? 'blocked_no_patch' : 'not_ready',
    changedFileCount,
    cleanupRequired: input.worktree?.worktreeRun.cleanupRequired ?? false,
    gitProcessBoundaryInvoked: input.worktree?.worktreeRun.gitProcessBoundaryInvoked ?? false,
    codexProcessBoundaryInvoked: codex?.processBoundaryInvoked ?? false,
    nxProcessBoundaryInvoked: verification?.processBoundaryInvoked ?? false,
    processBoundaryInvoked:
      (input.worktree?.worktreeRun.processBoundaryInvoked ?? false) ||
      (codex?.processBoundaryInvoked ?? false) ||
      (verification?.processBoundaryInvoked ?? false),
    externalProcessStarted:
      (input.worktree?.worktreeRun.externalProcessStarted ?? false) ||
      (codex?.externalProcessStarted ?? false) ||
      (verification?.externalProcessStarted ?? false),
    codexNoRealWrite: true,
    pushAllowed: false,
    pullRequestOpened: false,
    rawPathStored: false,
    bodyStored: false,
    summary: input.summary,
  });
}

function createEvidenceSummary(input: {
  runId: string;
  evidenceRefs: readonly EvidenceRef[];
  auditEvents: readonly AuditEvent[];
  now: () => string;
}): M9PilotEvidenceSummary {
  const evidenceRefIds = input.evidenceRefs.map((ref) => ref.id);
  const auditEventIds = input.auditEvents.map((event) => event.id);

  return M9PilotEvidenceSummarySchema.parse({
    id: foundationId('m9_pilot_evidence_summary'),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: input.now(),
    runId: input.runId,
    evidenceRefIds,
    auditEventIds,
    evidenceCount: evidenceRefIds.length,
    auditEventCount: auditEventIds.length,
    bundleHash: stableHash(JSON.stringify([evidenceRefIds, auditEventIds])),
    rawPathStored: false,
    bodyStored: false,
    summary: `M9 pilot evidence bundle references ${evidenceRefIds.length} evidence refs and ${auditEventIds.length} audit events.`,
  });
}

function createExecutionAuthority(input: {
  policyDecision: PolicyDecision;
  approvalArtifactId?: string;
  allowed: boolean;
  constraints: readonly string[];
  now: () => string;
}): ExecutionAuthority {
  return {
    id: foundationId('execution_authority'),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: input.now(),
    policyDecisionId: input.policyDecision.id,
    approvalArtifactId: input.approvalArtifactId,
    allowed: input.allowed,
    constraints: [...input.constraints],
  };
}

function createStep(input: {
  phase: M9PilotStep['phase'];
  status: M9PilotStepStatus;
  order: number;
  evidenceRefs?: readonly EvidenceRef[];
  auditEvents?: readonly AuditEvent[];
  boundaryInvoked?: boolean;
  externalProcessStarted?: boolean;
  summary: string;
  now: () => string;
}): M9PilotStep {
  return M9PilotStepSchema.parse({
    id: stableId('m9_pilot_step', `${input.order}:${input.phase}:${input.status}`),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: input.now(),
    phase: input.phase,
    status: input.status,
    order: input.order,
    evidenceRefIds: (input.evidenceRefs ?? []).map((ref) => ref.id),
    auditEventIds: (input.auditEvents ?? []).map((event) => event.id),
    boundaryInvoked: input.boundaryInvoked ?? false,
    externalProcessStarted: input.externalProcessStarted ?? false,
    rawPathStored: false,
    bodyStored: false,
    summary: input.summary,
  });
}

function classifyPilotStatus(
  worktree: WorktreeManagerExecuteResult,
  minimalRun: MinimalOrchestratorRunResult | undefined,
): M9PilotRunStatus {
  if (worktree.status === 'aborted') {
    return 'aborted';
  }

  if (worktree.status === 'blocked') {
    return 'blocked';
  }

  if (worktree.status === 'failed') {
    return 'failed';
  }

  if (!minimalRun || minimalRun.run.status === 'blocked') {
    return 'blocked';
  }

  if (minimalRun.run.status === 'aborted') {
    return 'aborted';
  }

  if (minimalRun.run.status === 'failed') {
    return 'failed';
  }

  return minimalRun.run.status === 'passed' ? 'passed' : 'blocked';
}

function capabilityStepStatus(status: WorktreeManagerExecuteResult['status']): M9PilotStepStatus {
  return status === 'completed' ? 'completed' : status;
}

function orchestrationStepStatus(status: string | undefined): M9PilotStepStatus {
  if (status === 'passed') {
    return 'passed';
  }

  if (status === 'failed' || status === 'blocked' || status === 'aborted') {
    return status;
  }

  return 'skipped';
}

function stableHash(value: string): string {
  return `sha256:${hashText(value)}`;
}

function stableId(prefix: string, value: string): string {
  return `${prefix}_${hashText(value).slice(0, 16)}`;
}

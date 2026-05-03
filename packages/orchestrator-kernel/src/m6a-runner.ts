import {
  type AuditEvent,
  type EvidenceRef,
  type ExecutionAuthority,
  type PatchRun,
  type PatchSummary,
  type PolicyDecision,
  type PullRequestSummaryDraft,
  type ReleaseAuditDraft,
  SchemaVersionSchema,
  foundationId,
  foundationTimestamp,
} from '@codexhub/contracts';
import { DefaultPolicyEngine, type PolicyEngine } from '@codexhub/security-kernel';
import {
  type WorktreeManagerExecuteResult,
  type WorktreeManagerFixtureRunner,
  type WorktreeManagerPlanInput,
  createPullRequestSummaryDraft,
  createReleaseAuditDraft,
  createWorktreeManagerPlan,
  executeWorktreeManager,
} from '@codexhub/worktree-manager';
import {
  type MinimalOrchestratorRunInput,
  type MinimalOrchestratorRunResult,
  runMinimalGovernedOrchestration,
} from './minimal-runner';

export type M6aControlledWorktreePrDraftStatus =
  | 'ready'
  | 'blocked'
  | 'failed'
  | 'aborted';

export interface M6aControlledWorktreePrDraftInput
  extends Omit<MinimalOrchestratorRunInput, 'executionAuthority'> {
  repoRoot: string;
  worktreeSlug: string;
  branchName: string;
  worktreeRoot?: string;
  allowedWorktreeRoots?: readonly string[];
  worktreeRunner?: WorktreeManagerFixtureRunner;
  policyEngine?: PolicyEngine;
  executionAuthority?: unknown;
}

export interface M6aControlledWorktreePrDraftResult {
  id: string;
  schemaVersion: string;
  createdAt: string;
  status: M6aControlledWorktreePrDraftStatus;
  worktree: WorktreeManagerExecuteResult;
  minimalRun?: MinimalOrchestratorRunResult;
  patchRun: PatchRun;
  patchSummary: PatchSummary;
  pullRequestDraft: PullRequestSummaryDraft;
  releaseAuditDraft: ReleaseAuditDraft;
  evidenceRefs: EvidenceRef[];
  auditEvents: AuditEvent[];
  policyDecisions: PolicyDecision[];
  summary: {
    status: M6aControlledWorktreePrDraftStatus;
    worktreeStatus: WorktreeManagerExecuteResult['status'];
    codexStatus?: string;
    verificationStatus?: string;
    prDraftStatus: PullRequestSummaryDraft['status'];
    changedFileCount: number;
    evidenceCount: number;
    auditEventCount: number;
    noRealWrite: true;
    processBoundaryInvoked: boolean;
    externalProcessStarted: boolean;
    bodyStored: false;
    rawPathStored: false;
    noRealGitBoundary: true;
    pushAllowed: false;
    pullRequestOpened: false;
    blockReasons: string[];
  };
}

export async function runM6aControlledWorktreePrDraft(
  input: M6aControlledWorktreePrDraftInput,
): Promise<M6aControlledWorktreePrDraftResult> {
  const policyEngine = input.policyEngine ?? new DefaultPolicyEngine();
  const plan = createWorktreeManagerPlan(createWorktreePlanInput(input));
  const policyDecision = policyEngine.evaluateAction({
    actionId: plan.id,
    actionType: 'git.worktree.plan',
    actionMode: 'dry-run',
    riskLevel: 'medium',
    dryRun: true,
    approvalGranted: false,
    metadata: {
      m6a: true,
      noRealWrite: true,
      dryRunOnly: true,
      processBoundaryPlanned: false,
      realGitBoundaryEnabled: false,
    },
  });
  const untrustedAuthorityProvided = input.executionAuthority !== undefined;
  const untrustedApprovalProvided = input.approvalArtifact !== undefined;
  const runnerMissing = !input.worktreeRunner;
  const worktreeAuthority = createExecutionAuthority(policyDecision, {
    allowed:
      policyDecision.outcome === 'allow' &&
      !untrustedAuthorityProvided &&
      !untrustedApprovalProvided &&
      !runnerMissing,
    constraints: [
      'm6a_fixture_only',
      'no_real_git_boundary',
      ...(untrustedAuthorityProvided ? ['untrusted_execution_authority_body'] : []),
      ...(untrustedApprovalProvided ? ['untrusted_approval_artifact_body'] : []),
      ...(runnerMissing ? ['fixture_runner_required'] : []),
    ],
  });
  const worktree = await executeWorktreeManager({
    plan,
    authority: worktreeAuthority,
    runner: input.worktreeRunner,
    actor: input.actor ?? 'orchestrator-kernel.m6a',
    now: input.now,
  });

  const preMinimalBlockReasons = [
    ...worktree.blockReasons,
    ...(untrustedAuthorityProvided ? ['untrusted_execution_authority_body'] : []),
    ...(untrustedApprovalProvided ? ['untrusted_approval_artifact_body'] : []),
    ...(!input.codexRunner ? ['m6a_injected_codex_runner_required'] : []),
    ...(!input.nxRunner ? ['m6a_injected_nx_runner_required'] : []),
  ];

  let minimalRun: MinimalOrchestratorRunResult | undefined;
  if (worktree.status === 'completed' && preMinimalBlockReasons.length === 0) {
    minimalRun = await runMinimalGovernedOrchestration({
      ...input,
      worktreePath: input.repoRoot,
      allowedCwdRoots: input.allowedCwdRoots ?? [input.repoRoot],
      executionAuthority: undefined,
      approvalArtifact: undefined,
    });
  }

  const verificationStatus = classifyVerificationStatus(minimalRun);
  const finalStatus = classifyFinalStatus({
    worktreeStatus: worktree.status,
    minimalRun,
    preMinimalBlockReasons,
  });
  const prDraftStatus = finalStatus === 'ready' ? 'ready' : 'blocked';
  const pullRequestDraft =
    prDraftStatus === worktree.pullRequestDraft.status
      ? worktree.pullRequestDraft
      : createPullRequestSummaryDraft({
          status: prDraftStatus,
          verificationStatus,
          changedFiles: worktree.patchSummary.changedFiles,
          now: input.now,
        });
  const releaseAuditDraft =
    prDraftStatus === worktree.releaseAuditDraft.status &&
    worktree.releaseAuditDraft.verificationStatus === verificationStatus
      ? worktree.releaseAuditDraft
      : createReleaseAuditDraft({
          status: prDraftStatus,
          verificationStatus,
          changedFiles: worktree.patchSummary.changedFiles,
          now: input.now,
        });
  const evidenceRefs = [
    ...worktree.evidenceRefs,
    ...(minimalRun?.evidenceRefs ?? []),
  ];
  const auditEvents = [...worktree.auditEvents, ...(minimalRun?.auditEvents ?? [])];

  return {
    id: foundationId('m6a_run'),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: (input.now ?? foundationTimestamp)(),
    status: finalStatus,
    worktree,
    minimalRun,
    patchRun:
      finalStatus === 'ready'
        ? { ...worktree.patchRun, status: 'verified' }
        : worktree.patchRun.status === 'generated'
          ? { ...worktree.patchRun, status: 'blocked' }
          : worktree.patchRun,
    patchSummary: worktree.patchSummary,
    pullRequestDraft,
    releaseAuditDraft,
    evidenceRefs,
    auditEvents,
    policyDecisions: [policyDecision, ...(minimalRun?.policyDecisions ?? [])],
    summary: {
      status: finalStatus,
      worktreeStatus: worktree.status,
      codexStatus: minimalRun?.run.summary.codexStatus,
      verificationStatus: minimalRun?.run.summary.verificationStatus,
      prDraftStatus: pullRequestDraft.status,
      changedFileCount: worktree.patchSummary.changedFileCount,
      evidenceCount: evidenceRefs.length,
      auditEventCount: auditEvents.length,
      noRealWrite: true,
      processBoundaryInvoked: minimalRun?.run.summary.processBoundaryInvoked ?? false,
      externalProcessStarted: minimalRun?.run.summary.externalProcessStarted ?? false,
      bodyStored: false,
      rawPathStored: false,
      noRealGitBoundary: true,
      pushAllowed: false,
      pullRequestOpened: false,
      blockReasons: preMinimalBlockReasons,
    },
  };
}

function createWorktreePlanInput(
  input: M6aControlledWorktreePrDraftInput,
): WorktreeManagerPlanInput {
  return {
    repoRoot: input.repoRoot,
    worktreeSlug: input.worktreeSlug,
    branchName: input.branchName,
    worktreeRoot: input.worktreeRoot,
    allowedWorktreeRoots: input.allowedWorktreeRoots,
    now: input.now,
  };
}

function createExecutionAuthority(
  policyDecision: PolicyDecision,
  input: { allowed: boolean; constraints: readonly string[] },
): ExecutionAuthority {
  return {
    id: foundationId('execution_authority'),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: foundationTimestamp(),
    policyDecisionId: policyDecision.id,
    allowed: input.allowed,
    constraints: [...input.constraints],
  };
}

function classifyVerificationStatus(
  minimalRun: MinimalOrchestratorRunResult | undefined,
): 'passed' | 'failed' | 'blocked' | 'aborted' {
  if (!minimalRun) {
    return 'blocked';
  }
  if (minimalRun.run.status === 'passed') {
    return 'passed';
  }
  if (minimalRun.run.status === 'aborted') {
    return 'aborted';
  }
  if (minimalRun.run.status === 'failed') {
    return 'failed';
  }
  return 'blocked';
}

function classifyFinalStatus(input: {
  worktreeStatus: WorktreeManagerExecuteResult['status'];
  minimalRun: MinimalOrchestratorRunResult | undefined;
  preMinimalBlockReasons: readonly string[];
}): M6aControlledWorktreePrDraftStatus {
  if (input.worktreeStatus === 'aborted') {
    return 'aborted';
  }
  if (input.worktreeStatus === 'failed') {
    return 'failed';
  }
  if (input.worktreeStatus === 'blocked' || input.preMinimalBlockReasons.length > 0) {
    return 'blocked';
  }
  if (!input.minimalRun) {
    return 'blocked';
  }
  if (input.minimalRun.run.status === 'passed') {
    return 'ready';
  }
  if (input.minimalRun.run.status === 'aborted') {
    return 'aborted';
  }
  if (input.minimalRun.run.status === 'failed') {
    return 'failed';
  }
  return 'blocked';
}

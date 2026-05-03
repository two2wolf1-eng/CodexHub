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

export type M6bGovernedWorktreePrDraftStatus =
  | 'ready'
  | 'blocked'
  | 'failed'
  | 'aborted';

export interface M6bGovernedWorktreePrDraftInput
  extends Omit<MinimalOrchestratorRunInput, 'executionAuthority'> {
  repoRoot: string;
  worktreeRoot: string;
  worktreePath: string;
  worktreeSlug: string;
  branchName: string;
  baseRef: string;
  allowedWorktreeRoots?: readonly string[];
  approvalArtifactId?: string;
  realGitBoundaryEnabled?: boolean;
  worktreeRunner?: WorktreeManagerFixtureRunner;
  policyEngine?: PolicyEngine;
  executionAuthority?: unknown;
}

export interface M6bGovernedWorktreePrDraftResult {
  id: string;
  schemaVersion: string;
  createdAt: string;
  status: M6bGovernedWorktreePrDraftStatus;
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
    status: M6bGovernedWorktreePrDraftStatus;
    worktreeStatus: WorktreeManagerExecuteResult['status'];
    codexStatus?: string;
    verificationStatus?: string;
    prDraftStatus: PullRequestSummaryDraft['status'];
    changedFileCount: number;
    evidenceCount: number;
    auditEventCount: number;
    noRealWrite: boolean;
    gitProcessBoundaryInvoked: boolean;
    processBoundaryInvoked: boolean;
    externalProcessStarted: boolean;
    bodyStored: false;
    rawPathStored: false;
    cleanupRequired: boolean;
    cleanupDeferred: boolean;
    pushAllowed: false;
    pullRequestOpened: false;
    blockReasons: string[];
  };
}

export async function runM6bGovernedWorktreePrDraft(
  input: M6bGovernedWorktreePrDraftInput,
): Promise<M6bGovernedWorktreePrDraftResult> {
  const policyEngine = input.policyEngine ?? new DefaultPolicyEngine();
  const plan = createWorktreeManagerPlan({
    repoRoot: input.repoRoot,
    worktreeSlug: input.worktreeSlug,
    branchName: input.branchName,
    baseRef: input.baseRef,
    runnerMode: 'controlled-git-worktree',
    worktreeRoot: input.worktreeRoot,
    allowedWorktreeRoots: input.allowedWorktreeRoots,
    now: input.now,
  });
  const policyDecision = policyEngine.evaluateAction({
    actionId: plan.id,
    actionType: 'git.worktree.create',
    actionMode: 'write',
    riskLevel: 'high',
    dryRun: true,
    approvalGranted: Boolean(input.approvalArtifactId),
    metadata: {
      m6b: true,
      realWrite: true,
      noRealWrite: false,
      worktreePathHash: plan.worktreePathHash,
    },
  });
  const untrustedAuthorityProvided = input.executionAuthority !== undefined;
  const untrustedApprovalProvided = input.approvalArtifact !== undefined;
  const worktreeAuthority = createExecutionAuthority(policyDecision, {
    allowed:
      policyDecision.outcome === 'allow' &&
      !untrustedAuthorityProvided &&
      !untrustedApprovalProvided &&
      Boolean(input.approvalArtifactId),
    approvalArtifactId: input.approvalArtifactId,
    constraints: [
      'm6b_controlled_git_worktree',
      'fixed_git_argv_only',
      'no_push',
      'no_pull_request_open',
      'cleanup_delete_deferred',
      ...(untrustedAuthorityProvided ? ['untrusted_execution_authority_body'] : []),
      ...(untrustedApprovalProvided ? ['untrusted_approval_artifact_body'] : []),
      ...(!input.approvalArtifactId ? ['approval_artifact_missing'] : []),
    ],
  });
  const worktree = await executeWorktreeManager({
    plan,
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
    actor: input.actor ?? 'orchestrator-kernel.m6b',
    now: input.now,
  });
  const preMinimalBlockReasons = [
    ...worktree.blockReasons,
    ...(untrustedAuthorityProvided ? ['untrusted_execution_authority_body'] : []),
    ...(untrustedApprovalProvided ? ['untrusted_approval_artifact_body'] : []),
    ...(!input.codexRunner ? ['m6b_injected_codex_runner_required'] : []),
    ...(!input.nxRunner ? ['m6b_injected_nx_runner_required'] : []),
  ];

  let minimalRun: MinimalOrchestratorRunResult | undefined;
  if (worktree.status === 'completed' && preMinimalBlockReasons.length === 0) {
    minimalRun = await runMinimalGovernedOrchestration({
      ...input,
      worktreePath: input.worktreePath,
      allowedCwdRoots: input.allowedCwdRoots ?? [input.worktreePath],
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
          noRealGitBoundary: false,
          now: input.now,
        });
  const evidenceRefs = [...worktree.evidenceRefs, ...(minimalRun?.evidenceRefs ?? [])];
  const auditEvents = [...worktree.auditEvents, ...(minimalRun?.auditEvents ?? [])];

  return {
    id: foundationId('m6b_run'),
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
      noRealWrite: worktree.worktreeRun.noRealWrite,
      gitProcessBoundaryInvoked: worktree.worktreeRun.gitProcessBoundaryInvoked,
      processBoundaryInvoked:
        worktree.worktreeRun.processBoundaryInvoked ||
        (minimalRun?.run.summary.processBoundaryInvoked ?? false),
      externalProcessStarted:
        worktree.worktreeRun.externalProcessStarted ||
        (minimalRun?.run.summary.externalProcessStarted ?? false),
      bodyStored: false,
      rawPathStored: false,
      cleanupRequired: worktree.worktreeRun.cleanupRequired,
      cleanupDeferred: worktree.worktreeRun.cleanupDeferred,
      pushAllowed: false,
      pullRequestOpened: false,
      blockReasons: preMinimalBlockReasons,
    },
  };
}

function createExecutionAuthority(
  policyDecision: PolicyDecision,
  input: {
    allowed: boolean;
    approvalArtifactId?: string;
    constraints: readonly string[];
  },
): ExecutionAuthority {
  return {
    id: foundationId('execution_authority'),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: foundationTimestamp(),
    policyDecisionId: policyDecision.id,
    approvalArtifactId: input.approvalArtifactId,
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
}): M6bGovernedWorktreePrDraftStatus {
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

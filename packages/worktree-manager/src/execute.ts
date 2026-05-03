import {
  type CapabilityAuditEvent,
  type CapabilityExecutionResult,
  CapabilityExecutionResultSchema,
  type EvidenceRef,
  type ExecutionAuthority,
  ExecutionAuthoritySchema,
  type PatchRun,
  type PatchSummary,
  type PullRequestSummaryDraft,
  type ReleaseAuditDraft,
  RepoRelativePathSchema,
  SchemaVersionSchema,
  type WorktreeRun,
  WorktreeRunSchema,
  foundationId,
  foundationTimestamp,
} from '@codexhub/contracts';
import { hashText } from '@codexhub/evidence-kernel';
import { createWorktreeManagerAuditEvent } from './audit';
import {
  createPatchSummaryEvidence,
  createPullRequestSummaryDraftEvidence,
  createReleaseAuditDraftEvidence,
  createWorktreePlanEvidence,
  createWorktreeRunEvidence,
} from './evidence';
import { type WorktreeManagerPlanResult } from './plan';
import {
  createPatchRunAndSummary,
  createPullRequestSummaryDraft,
  createReleaseAuditDraft,
} from './summary';
import { createControlledGitWorktreeRunner } from './git-process-boundary';

export type WorktreeManagerExecuteStatus =
  | 'completed'
  | 'failed'
  | 'blocked'
  | 'aborted';

export interface WorktreeManagerFixtureRunnerResult {
  status: 'completed' | 'failed' | 'aborted';
  changedFiles?: readonly string[];
  diffText?: string;
  diffHash?: string;
  diffLineCount?: number;
  commandSummaryHash?: string;
  gitProcessBoundaryInvoked?: boolean;
  processBoundaryInvoked?: boolean;
  externalProcessStarted?: boolean;
  noRealWrite?: boolean;
  cleanupRequired?: boolean;
  cleanupDeferred?: boolean;
  summary?: string;
}

export interface WorktreeManagerFixtureRunner {
  run(input: {
    planId: string;
    worktreePathHash: string;
    branchNameHash: string;
    runnerMode: WorktreeManagerPlanResult['runnerMode'];
  }): Promise<WorktreeManagerFixtureRunnerResult>;
}

export interface WorktreeManagerExecuteInput {
  plan: WorktreeManagerPlanResult;
  authority?: ExecutionAuthority;
  runner?: WorktreeManagerFixtureRunner;
  realGitBoundaryEnabled?: boolean;
  approvalRequired?: boolean;
  runtime?: {
    repoRoot: string;
    worktreeRoot: string;
    worktreePath: string;
    worktreeSlug: string;
    branchName: string;
    baseRef?: string;
  };
  actor?: string;
  now?: () => string;
}

export interface WorktreeManagerExecuteResult {
  status: WorktreeManagerExecuteStatus;
  capabilityResult: CapabilityExecutionResult;
  worktreeRun: WorktreeRun;
  patchRun: PatchRun;
  patchSummary: PatchSummary;
  pullRequestDraft: PullRequestSummaryDraft;
  releaseAuditDraft: ReleaseAuditDraft;
  evidenceRefs: EvidenceRef[];
  auditEvents: CapabilityAuditEvent[];
  blockReasons: string[];
}

export async function executeWorktreeManager(
  input: WorktreeManagerExecuteInput,
): Promise<WorktreeManagerExecuteResult> {
  const authorityBlockReason = validateAuthority(input.authority, input.now, input.plan.runnerMode);
  const planBlockReasons =
    input.plan.status === 'blocked' ? input.plan.blockReasons : [];
  const runtimeBlockReasons = validateRuntimeBinding(input);
  const runner =
    input.runner ??
    (input.plan.runnerMode === 'controlled-git-worktree' &&
    input.realGitBoundaryEnabled === true &&
    input.runtime?.baseRef
      ? createControlledGitWorktreeRunner({
          repoRoot: input.runtime.repoRoot,
          worktreePath: input.runtime.worktreePath,
          baseRef: input.runtime.baseRef,
        })
      : undefined);
  const runnerBlockReason = runner
    ? undefined
    : input.plan.runnerMode === 'controlled-git-worktree'
      ? 'controlled_git_runner_required'
      : 'fixture_runner_required';
  const disabledBlockReason =
    input.plan.runnerMode === 'controlled-git-worktree' &&
    input.realGitBoundaryEnabled !== true
      ? 'controlled_git_boundary_disabled'
      : undefined;
  const blockReasons = [
    ...planBlockReasons,
    ...runtimeBlockReasons,
    ...(authorityBlockReason ? [authorityBlockReason] : []),
    ...(disabledBlockReason ? [disabledBlockReason] : []),
    ...(runnerBlockReason ? [runnerBlockReason] : []),
  ];

  if (blockReasons.length > 0) {
    return createBlockedExecuteResult(input, blockReasons);
  }

  if (!runner) {
    return createBlockedExecuteResult(input, ['fixture_runner_required']);
  }

  const runnerResult = await runner.run({
    planId: input.plan.id,
    worktreePathHash: input.plan.worktreePathHash,
    branchNameHash: input.plan.branchNameHash,
    runnerMode: input.plan.runnerMode,
  });
  const changedFiles = [...(runnerResult.changedFiles ?? [])];
  const invalidChangedFiles = validateChangedFiles(changedFiles);
  const validChangedFiles = changedFiles.filter((file) =>
    RepoRelativePathSchema.safeParse(file).success,
  );
  const invalidChangedFileHashes = invalidChangedFiles.map(
    (file) => `sha256:${hashText(file)}`,
  );
  const status: WorktreeManagerExecuteStatus =
    invalidChangedFiles.length > 0 ? 'failed' : runnerResult.status;
  const diffHash =
    runnerResult.diffHash ??
    `sha256:${hashText(runnerResult.diffText ?? JSON.stringify(validChangedFiles))}`;
  const noRealWrite =
    input.plan.runnerMode === 'controlled-git-worktree'
      ? (runnerResult.noRealWrite ?? false)
      : true;
  const gitProcessBoundaryInvoked = Boolean(runnerResult.gitProcessBoundaryInvoked);
  const processBoundaryInvoked = Boolean(runnerResult.processBoundaryInvoked);
  const externalProcessStarted = Boolean(runnerResult.externalProcessStarted);
  const diffLineCount =
    runnerResult.diffLineCount ?? countLines(runnerResult.diffText ?? '');
  const createdAt = (input.now ?? foundationTimestamp)();
  const worktreeRun = WorktreeRunSchema.parse({
    id: foundationId('worktree_run'),
    schemaVersion: SchemaVersionSchema.value,
    createdAt,
    planId: input.plan.id,
    status,
    runnerMode: input.plan.runnerMode,
    worktreePathHash: input.plan.worktreePathHash,
    branchNameHash: input.plan.branchNameHash,
    baseRefHash: input.plan.baseRefHash,
    commandSummaryHash: runnerResult.commandSummaryHash ?? input.plan.worktreePlan.commandSummaryHash,
    changedFiles: validChangedFiles,
    changedFileCount: validChangedFiles.length,
    diffHash,
    evidenceRefs: [],
    auditEventIds: [],
    rawPathStored: false,
    bodyStored: false,
    noRealWrite,
    gitProcessBoundaryInvoked,
    cleanupRequired: runnerResult.cleanupRequired ?? false,
    cleanupDeferred: runnerResult.cleanupDeferred ?? false,
    processBoundaryInvoked,
    externalProcessStarted,
    summary:
      invalidChangedFiles.length > 0
        ? 'Fixture runner returned invalid changed file paths.'
        : runnerResult.summary ?? `Fixture worktree execution ${status}.`,
  });
  const patchStatus =
    status === 'completed'
      ? 'generated'
      : status === 'aborted'
        ? 'aborted'
        : status === 'failed'
          ? 'rejected'
          : 'blocked';
  const { patchRun, patchSummary } = createPatchRunAndSummary({
    taskId: input.plan.id,
    worktreePathHash: input.plan.worktreePathHash,
    changedFiles: validChangedFiles,
    diffHash,
    diffLineCount,
    status: patchStatus,
    now: input.now,
  });
  const prStatus = status === 'completed' ? 'ready' : 'blocked';
  const verificationStatus = status === 'completed' ? 'passed' : status;
  const pullRequestDraft = createPullRequestSummaryDraft({
    status: prStatus,
    verificationStatus,
    changedFiles: validChangedFiles,
    now: input.now,
  });
  const releaseAuditDraft = createReleaseAuditDraft({
    status: prStatus,
    verificationStatus,
    changedFiles: validChangedFiles,
    noRealGitBoundary: input.plan.runnerMode !== 'controlled-git-worktree',
    now: input.now,
  });
  const evidenceRefs = [
    createWorktreePlanEvidence(input.plan.worktreePlan),
    createWorktreeRunEvidence(worktreeRun),
    createPatchSummaryEvidence(patchSummary),
    createPullRequestSummaryDraftEvidence(pullRequestDraft),
    createReleaseAuditDraftEvidence(releaseAuditDraft),
  ];
  const auditEvents = [
    createWorktreeManagerAuditEvent({
      actor: input.actor,
      action: 'worktree-manager.execute',
      target: input.plan.worktreePathHash,
      reason: 'execution authority accepted by workflow gate for fixture-only worktree summary',
      outcome: status,
      policyDecisionId: input.authority?.policyDecisionId ?? 'missing-policy-decision',
      evidenceRefs,
      metadata: {
        liveExecution: processBoundaryInvoked,
        runnerMode: input.plan.runnerMode,
        gitProcessBoundaryInvoked,
        processBoundaryInvoked,
        externalProcessStarted,
        noRealWrite,
        cleanupRequired: runnerResult.cleanupRequired ?? false,
        cleanupDeferred: runnerResult.cleanupDeferred ?? false,
        changedFileCount: validChangedFiles.length,
        invalidChangedFileHashes,
        commandSummaryHash:
          runnerResult.commandSummaryHash ?? input.plan.worktreePlan.commandSummaryHash,
        bodyStored: false,
        rawPathStored: false,
      },
    }),
  ];

  return {
    status,
    capabilityResult: createCapabilityExecutionResult({
      status,
      evidenceRefs,
      auditEvents,
      summary:
        input.plan.runnerMode === 'controlled-git-worktree'
          ? `Worktree manager controlled git execution ${status}.`
          : `Worktree manager fixture execution ${status}.`,
      processBoundaryInvoked,
      externalProcessStarted,
      noRealWrite,
    }),
    worktreeRun: {
      ...worktreeRun,
      evidenceRefs: [evidenceRefs[1]],
      auditEventIds: auditEvents.map((event) => event.id),
    },
    patchRun: {
      ...patchRun,
      evidenceRefs: [evidenceRefs[2]],
      auditEventIds: auditEvents.map((event) => event.id),
    },
    patchSummary: {
      ...patchSummary,
      evidenceRefs: [evidenceRefs[2]],
      auditEventIds: auditEvents.map((event) => event.id),
    },
    pullRequestDraft: {
      ...pullRequestDraft,
      evidenceRefs: [evidenceRefs[3]],
      auditEventIds: auditEvents.map((event) => event.id),
    },
    releaseAuditDraft: {
      ...releaseAuditDraft,
      evidenceRefs: [evidenceRefs[4]],
      auditEventIds: auditEvents.map((event) => event.id),
    },
    evidenceRefs,
    auditEvents,
    blockReasons:
      invalidChangedFiles.length > 0 ? ['invalid_changed_file_paths'] : [],
  };
}

function validateAuthority(
  authority: ExecutionAuthority | undefined,
  now: (() => string) | undefined,
  runnerMode: WorktreeManagerPlanResult['runnerMode'],
): string | undefined {
  if (!authority) {
    return 'execution_authority_missing';
  }

  const parsedAuthority = ExecutionAuthoritySchema.safeParse(authority);
  if (!parsedAuthority.success) {
    return 'execution_authority_invalid';
  }

  if (!authority.allowed) {
    return 'execution_authority_not_allowed';
  }

  if (authority.policyDecisionId.trim().length === 0) {
    return 'policy_decision_missing';
  }

  if (runnerMode === 'controlled-git-worktree' && !authority.approvalArtifactId) {
    return 'approval_artifact_missing';
  }

  if (
    authority.expiresAt &&
    Date.parse(authority.expiresAt) <= Date.parse((now ?? foundationTimestamp)())
  ) {
    return 'execution_authority_expired';
  }

  return undefined;
}

function validateRuntimeBinding(input: WorktreeManagerExecuteInput): string[] {
  if (input.plan.runnerMode !== 'controlled-git-worktree') {
    return [];
  }

  const runtime = input.runtime;
  if (!runtime) {
    return ['runtime_worktree_input_missing'];
  }

  const expected = {
    repoRootHash: stableRuntimeHash(`repo:${runtime.repoRoot}`),
    worktreeRootHash: stableRuntimeHash(`root:${runtime.worktreeRoot}`),
    worktreePathHash: stableRuntimeHash(`path:${runtime.worktreePath}`),
    branchNameHash: stableRuntimeHash(`branch:${runtime.branchName}`),
    worktreeSlugHash: stableRuntimeHash(`slug:${runtime.worktreeSlug}`),
    baseRefHash: runtime.baseRef
      ? stableRuntimeHash(`baseRef:${runtime.baseRef}`)
      : undefined,
  };
  const mismatches = [
    expected.repoRootHash !== input.plan.repoRootHash ? 'repo_root_hash_mismatch' : undefined,
    expected.worktreeRootHash !== input.plan.worktreeRootHash
      ? 'worktree_root_hash_mismatch'
      : undefined,
    expected.worktreePathHash !== input.plan.worktreePathHash
      ? 'worktree_path_hash_mismatch'
      : undefined,
    expected.branchNameHash !== input.plan.branchNameHash
      ? 'branch_name_hash_mismatch'
      : undefined,
    expected.worktreeSlugHash !== input.plan.worktreeSlugHash
      ? 'worktree_slug_hash_mismatch'
      : undefined,
    expected.baseRefHash !== input.plan.baseRefHash ? 'base_ref_hash_mismatch' : undefined,
  ].filter((reason): reason is string => Boolean(reason));

  return runtime.baseRef ? mismatches : ['base_ref_required', ...mismatches];
}

function createBlockedExecuteResult(
  input: WorktreeManagerExecuteInput,
  blockReasons: readonly string[],
): WorktreeManagerExecuteResult {
  const createdAt = (input.now ?? foundationTimestamp)();
  const emptyDiffHash = `sha256:${hashText(JSON.stringify(blockReasons))}`;
  const worktreeRun = WorktreeRunSchema.parse({
    id: foundationId('worktree_run'),
    schemaVersion: SchemaVersionSchema.value,
    createdAt,
    planId: input.plan.id,
    status: 'blocked',
    runnerMode: input.plan.runnerMode,
    worktreePathHash: input.plan.worktreePathHash,
    branchNameHash: input.plan.branchNameHash,
    baseRefHash: input.plan.baseRefHash,
    commandSummaryHash: input.plan.worktreePlan.commandSummaryHash,
    changedFiles: [],
    changedFileCount: 0,
    diffHash: emptyDiffHash,
    evidenceRefs: [],
    auditEventIds: [],
    rawPathStored: false,
    bodyStored: false,
    noRealWrite: true,
    gitProcessBoundaryInvoked: false,
    cleanupRequired: false,
    cleanupDeferred: false,
    processBoundaryInvoked: false,
    externalProcessStarted: false,
    summary: `Worktree manager execution blocked: ${blockReasons.join(', ')}.`,
  });
  const { patchRun, patchSummary } = createPatchRunAndSummary({
    taskId: input.plan.id,
    worktreePathHash: input.plan.worktreePathHash,
    changedFiles: [],
    diffHash: emptyDiffHash,
    diffLineCount: 0,
    status: 'blocked',
    now: input.now,
  });
  const pullRequestDraft = createPullRequestSummaryDraft({
    status: 'blocked',
    verificationStatus: 'blocked',
    changedFiles: [],
    now: input.now,
  });
  const releaseAuditDraft = createReleaseAuditDraft({
    status: 'blocked',
    verificationStatus: 'blocked',
    changedFiles: [],
    now: input.now,
  });
  const evidenceRefs = [
    createWorktreePlanEvidence(input.plan.worktreePlan),
    createWorktreeRunEvidence(worktreeRun),
    createPatchSummaryEvidence(patchSummary),
    createPullRequestSummaryDraftEvidence(pullRequestDraft),
    createReleaseAuditDraftEvidence(releaseAuditDraft),
  ];
  const auditEvents = [
    createWorktreeManagerAuditEvent({
      actor: input.actor,
      action: 'worktree-manager.execute',
      target: input.plan.worktreePathHash,
      reason: 'capability execution blocked by governance gate',
      outcome: 'blocked',
      policyDecisionId: input.authority?.policyDecisionId ?? 'missing-policy-decision',
      evidenceRefs,
      metadata: {
        blockReasons: [...blockReasons],
        liveExecution: false,
        runnerMode: input.plan.runnerMode,
        gitProcessBoundaryInvoked: false,
        processBoundaryInvoked: false,
        externalProcessStarted: false,
        noRealWrite: true,
        bodyStored: false,
        rawPathStored: false,
      },
    }),
  ];

  return {
    status: 'blocked',
    capabilityResult: createCapabilityExecutionResult({
      status: 'blocked',
      evidenceRefs,
      auditEvents,
      summary: 'Worktree manager execution blocked before any git boundary.',
    }),
    worktreeRun: {
      ...worktreeRun,
      evidenceRefs: [evidenceRefs[1]],
      auditEventIds: auditEvents.map((event) => event.id),
    },
    patchRun: {
      ...patchRun,
      evidenceRefs: [evidenceRefs[2]],
      auditEventIds: auditEvents.map((event) => event.id),
    },
    patchSummary: {
      ...patchSummary,
      evidenceRefs: [evidenceRefs[2]],
      auditEventIds: auditEvents.map((event) => event.id),
    },
    pullRequestDraft: {
      ...pullRequestDraft,
      evidenceRefs: [evidenceRefs[3]],
      auditEventIds: auditEvents.map((event) => event.id),
    },
    releaseAuditDraft: {
      ...releaseAuditDraft,
      evidenceRefs: [evidenceRefs[4]],
      auditEventIds: auditEvents.map((event) => event.id),
    },
    evidenceRefs,
    auditEvents,
    blockReasons: [...blockReasons],
  };
}

function createCapabilityExecutionResult(input: {
  status: WorktreeManagerExecuteStatus;
  evidenceRefs: readonly EvidenceRef[];
  auditEvents: readonly CapabilityAuditEvent[];
  summary: string;
  processBoundaryInvoked?: boolean;
  externalProcessStarted?: boolean;
  noRealWrite?: boolean;
}): CapabilityExecutionResult {
  return CapabilityExecutionResultSchema.parse({
    id: foundationId('capability_result'),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: foundationTimestamp(),
    status: input.status,
    processBoundaryInvoked: input.processBoundaryInvoked ?? false,
    externalProcessStarted: input.externalProcessStarted ?? false,
    noRealWrite: input.noRealWrite ?? true,
    evidenceRefs: input.evidenceRefs.map((ref) => ref.id),
    auditEventIds: input.auditEvents.map((event) => event.id),
    summary: input.summary,
  });
}

function stableRuntimeHash(value: string): string {
  return `sha256:${hashText(value)}`;
}

function validateChangedFiles(changedFiles: readonly string[]): string[] {
  return changedFiles.filter((file) => !RepoRelativePathSchema.safeParse(file).success);
}

function countLines(text: string): number {
  return text.length === 0 ? 0 : text.split(/\r?\n/).length;
}

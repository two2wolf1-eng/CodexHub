import {
  type CapabilityAuditEvent,
  type CapabilityDryRun,
  CapabilityDryRunSchema,
  type EvidenceRef,
  type ExecutionAuthority,
  ExecutionAuthoritySchema,
  SchemaVersionSchema,
  type WorktreeCleanupPlan,
  WorktreeCleanupPlanSchema,
  type WorktreeCleanupRun,
  WorktreeCleanupRunSchema,
  type WorktreeControlPlaneRun,
  foundationId,
  foundationTimestamp,
} from '@codexhub/contracts';
import { hashText } from '@codexhub/evidence-kernel';
import { createWorktreeManagerAuditEvent } from './audit';
import { createWorktreeCleanupPlanEvidence, createWorktreeCleanupRunEvidence } from './evidence';
import {
  type ControlledGitCommandKind,
  type ControlledGitCommandOutput,
  type ControlledGitCommandRunner,
  type ControlledGitRuntimeInput,
  runControlledGitCommand,
} from './git-process-boundary';
import { WORKTREE_MANAGER_ADAPTER_NAME } from './manifest';
import { stableHash } from './plan';

export interface WorktreeCleanupPlanInput {
  sourceRun: WorktreeControlPlaneRun;
  repoRoot: string;
  worktreeRoot: string;
  worktreePath: string;
  now?: () => string;
}

export interface WorktreeCleanupPlanResult {
  id: string;
  status: 'planned' | 'blocked';
  repoRootHash: string;
  worktreeRootHash: string;
  worktreePathHash: string;
  sourceRunHash: string;
  blockReasons: string[];
  capabilityDryRun: CapabilityDryRun;
  cleanupPlan: WorktreeCleanupPlan;
}

export interface WorktreeCleanupRunnerResult {
  status: 'completed' | 'failed' | 'blocked' | 'aborted';
  commandSummaryHash?: string;
  dirtyFileCount?: number;
  dirtyStatusHash?: string;
  cleanupAttempted?: boolean;
  cleanupCompleted?: boolean;
  cleanupRequired?: boolean;
  cleanupDeferred?: boolean;
  gitProcessBoundaryInvoked?: boolean;
  processBoundaryInvoked?: boolean;
  externalProcessStarted?: boolean;
  noRealWrite?: boolean;
  summary?: string;
}

export interface WorktreeCleanupRunner {
  run(): Promise<WorktreeCleanupRunnerResult>;
}

export interface WorktreeCleanupExecuteInput {
  plan: WorktreeCleanupPlanResult;
  authority?: ExecutionAuthority;
  runner?: WorktreeCleanupRunner;
  runtime?: ControlledGitRuntimeInput;
  cleanupEnabled?: boolean;
  actor?: string;
  now?: () => string;
}

export interface WorktreeCleanupExecuteResult {
  status: 'completed' | 'failed' | 'blocked' | 'aborted';
  cleanupRun: WorktreeCleanupRun;
  evidenceRefs: EvidenceRef[];
  auditEvents: CapabilityAuditEvent[];
  blockReasons: string[];
}

export function createWorktreeCleanupPlan(
  input: WorktreeCleanupPlanInput,
): WorktreeCleanupPlanResult {
  const now = input.now ?? foundationTimestamp;
  const createdAt = now();
  const repoRootHash = stableHash(`repo:${input.repoRoot}`);
  const worktreeRootHash = stableHash(`root:${input.worktreeRoot}`);
  const worktreePathHash = stableHash(`path:${input.worktreePath}`);
  const sourceRunHash = stableHash(JSON.stringify(input.sourceRun));
  const blockReasons = [
    input.sourceRun.cleanupRequired !== true ? 'source_run_cleanup_not_required' : undefined,
    input.sourceRun.worktreeRootHash !== worktreeRootHash ? 'worktree_root_hash_mismatch' : undefined,
    input.sourceRun.worktreePathHash !== worktreePathHash ? 'worktree_path_hash_mismatch' : undefined,
    input.sourceRun.repoRootHash !== repoRootHash ? 'repo_root_hash_mismatch' : undefined,
  ].filter((reason): reason is string => Boolean(reason));
  const status = blockReasons.length === 0 ? 'planned' : 'blocked';
  const id = foundationId('worktree_cleanup_plan');
  const commandSummaryHash = stableHash(
    JSON.stringify({
      allowedCommands: [
        'rev-parse',
        'worktree-list-porcelain',
        'status-porcelain',
        'worktree-remove',
      ],
      force: false,
    }),
  );
  const cleanupPlan = WorktreeCleanupPlanSchema.parse({
    id,
    schemaVersion: SchemaVersionSchema.value,
    createdAt,
    adapterName: WORKTREE_MANAGER_ADAPTER_NAME,
    sourceRunId: input.sourceRun.id,
    status,
    repoRootHash,
    worktreeRootHash,
    worktreePathHash,
    sourceRunHash,
    commandSummaryHash,
    blockReasons,
    plannedActions: [
      {
        action: 'git.worktree.cleanup.plan',
        actionMode: 'dry-run',
        risk: 'medium',
        target: worktreePathHash,
        requiresApproval: false,
      },
      {
        action: 'git.worktree.cleanup.remove',
        actionMode: 'write',
        risk: 'high',
        target: worktreePathHash,
        requiresApproval: true,
      },
    ],
    dirtyCheckPlanned: true,
    cleanupDeletePlanned: true,
    cleanupRequired: input.sourceRun.cleanupRequired,
    cleanupDeferred: input.sourceRun.cleanupDeferred,
    rawPathStored: false,
    bodyStored: false,
    noRealWrite: true,
    gitProcessBoundaryPlanned: true,
    gitProcessBoundaryInvoked: false,
    processBoundaryPlanned: true,
    processBoundaryInvoked: false,
    externalProcessStarted: false,
    summary:
      status === 'planned'
        ? 'Worktree cleanup dry-run planned without invoking git.'
        : 'Worktree cleanup dry-run blocked by source run or hash constraints.',
  });
  const capabilityDryRun = CapabilityDryRunSchema.parse({
    id: foundationId('capability_dry_run'),
    schemaVersion: SchemaVersionSchema.value,
    createdAt,
    adapterName: WORKTREE_MANAGER_ADAPTER_NAME,
    inputSummary: {
      sourceRunId: input.sourceRun.id,
      repoRootHash,
      worktreeRootHash,
      worktreePathHash,
      sourceRunHash,
      rawPathStored: false,
      bodyStored: false,
    },
    plannedActions: cleanupPlan.plannedActions,
    requiredEvidence: ['worktree.cleanup_plan', 'worktree.cleanup_summary'],
    warnings: [
      'm6c_cleanup_requires_persisted_approval',
      'non_force_cleanup_only',
      'filesystem_delete_fallback_forbidden',
      ...blockReasons,
    ],
  });

  return {
    id,
    status,
    repoRootHash,
    worktreeRootHash,
    worktreePathHash,
    sourceRunHash,
    blockReasons,
    capabilityDryRun,
    cleanupPlan,
  };
}

export function createControlledGitCleanupRunner(
  input: ControlledGitRuntimeInput,
  commandRunner: ControlledGitCommandRunner = runControlledGitCommand,
): WorktreeCleanupRunner {
  return {
    async run(): Promise<WorktreeCleanupRunnerResult> {
      const results: ControlledGitCommandOutput[] = [];
      const initialKinds: ControlledGitCommandKind[] = [
        'repo-root-preflight',
        'worktree-list-porcelain',
        'worktree-status-porcelain',
      ];

      for (const kind of initialKinds) {
        const result = await commandRunner(kind, input);
        results.push(result);
        if (result.exitCode !== 0) {
          return createCleanupRunnerResult('failed', results, {
            cleanupAttempted: false,
            cleanupCompleted: false,
            summary: 'Controlled git cleanup failed before removal.',
          });
        }
      }

      const statusOutput = results.find((result) => result.kind === 'worktree-status-porcelain');
      const dirtyFileCount = countLines(statusOutput?.stdout ?? '');
      const dirtyStatusHash = `sha256:${hashText(statusOutput?.stdout ?? '')}`;
      if (dirtyFileCount > 0) {
        return createCleanupRunnerResult('blocked', results, {
          dirtyFileCount,
          dirtyStatusHash,
          cleanupAttempted: false,
          cleanupCompleted: false,
          summary: 'Worktree cleanup blocked because status metadata is dirty.',
        });
      }

      const removeResult = await commandRunner('worktree-remove', input);
      results.push(removeResult);
      if (removeResult.exitCode !== 0) {
        return createCleanupRunnerResult('failed', results, {
          dirtyFileCount,
          dirtyStatusHash,
          cleanupAttempted: true,
          cleanupCompleted: false,
          summary: 'Controlled git cleanup remove failed.',
        });
      }

      return createCleanupRunnerResult('completed', results, {
        dirtyFileCount,
        dirtyStatusHash,
        cleanupAttempted: true,
        cleanupCompleted: true,
        cleanupRequired: false,
        cleanupDeferred: false,
        summary: 'Controlled git worktree cleanup completed.',
      });
    },
  };
}

export async function executeWorktreeCleanup(
  input: WorktreeCleanupExecuteInput,
): Promise<WorktreeCleanupExecuteResult> {
  const authorityBlockReason = validateCleanupAuthority(input.authority, input.now);
  const planBlockReasons =
    input.plan.status === 'blocked' ? input.plan.blockReasons : [];
  const disabledReason = input.cleanupEnabled === true ? undefined : 'worktree_cleanup_disabled';
  const runtimeReasons = validateCleanupRuntime(input.plan, input.runtime);
  const runner = input.runner ?? (input.cleanupEnabled === true && input.runtime
    ? createControlledGitCleanupRunner(input.runtime)
    : undefined);
  const runnerReason = runner ? undefined : 'worktree_cleanup_runner_required';
  const blockReasons = [
    ...planBlockReasons,
    ...runtimeReasons,
    ...(authorityBlockReason ? [authorityBlockReason] : []),
    ...(disabledReason ? [disabledReason] : []),
    ...(runnerReason ? [runnerReason] : []),
  ];

  if (blockReasons.length > 0 || !runner) {
    return createBlockedCleanupResult(input, blockReasons);
  }

  const runnerResult = await runner.run();
  return createCleanupResult(input, runnerResult, []);
}

function createCleanupResult(
  input: WorktreeCleanupExecuteInput,
  runnerResult: WorktreeCleanupRunnerResult,
  blockReasons: string[],
): WorktreeCleanupExecuteResult {
  const createdAt = (input.now ?? foundationTimestamp)();
  const status = runnerResult.status;
  const cleanupRun = WorktreeCleanupRunSchema.parse({
    id: foundationId('worktree_cleanup_run'),
    schemaVersion: SchemaVersionSchema.value,
    createdAt,
    planId: input.plan.id,
    dryRunId: input.plan.id,
    sourceRunId: input.plan.cleanupPlan.sourceRunId,
    status,
    repoRootHash: input.plan.repoRootHash,
    worktreeRootHash: input.plan.worktreeRootHash,
    worktreePathHash: input.plan.worktreePathHash,
    sourceRunHash: input.plan.sourceRunHash,
    commandSummaryHash:
      runnerResult.commandSummaryHash ?? input.plan.cleanupPlan.commandSummaryHash,
    dirtyFileCount: runnerResult.dirtyFileCount ?? 0,
    dirtyStatusHash: runnerResult.dirtyStatusHash,
    cleanupAttempted: runnerResult.cleanupAttempted ?? false,
    cleanupCompleted: runnerResult.cleanupCompleted ?? false,
    cleanupRequired:
      runnerResult.cleanupRequired ?? runnerResult.cleanupCompleted !== true,
    cleanupDeferred:
      runnerResult.cleanupDeferred ?? runnerResult.cleanupCompleted !== true,
    evidenceRefs: [],
    auditEventIds: [],
    rawPathStored: false,
    bodyStored: false,
    noRealWrite: runnerResult.noRealWrite ?? runnerResult.cleanupAttempted !== true,
    gitProcessBoundaryInvoked: Boolean(runnerResult.gitProcessBoundaryInvoked),
    processBoundaryInvoked: Boolean(runnerResult.processBoundaryInvoked),
    externalProcessStarted: Boolean(runnerResult.externalProcessStarted),
    summary: runnerResult.summary ?? `Worktree cleanup ${status}.`,
  });
  const evidenceRefs = [
    createWorktreeCleanupPlanEvidence(input.plan.cleanupPlan),
    createWorktreeCleanupRunEvidence(cleanupRun),
  ];
  const auditEvents = [
    createWorktreeManagerAuditEvent({
      actor: input.actor,
      action: 'worktree-manager.cleanup',
      target: input.plan.worktreePathHash,
      reason: 'execution authority accepted by workflow gate for controlled git cleanup boundary',
      outcome: status,
      policyDecisionId: input.authority?.policyDecisionId ?? 'missing-policy-decision',
      evidenceRefs,
      metadata: {
        blockReasons,
        gitProcessBoundaryInvoked: cleanupRun.gitProcessBoundaryInvoked,
        processBoundaryInvoked: cleanupRun.processBoundaryInvoked,
        externalProcessStarted: cleanupRun.externalProcessStarted,
        dirtyFileCount: cleanupRun.dirtyFileCount,
        dirtyStatusHash: cleanupRun.dirtyStatusHash,
        cleanupAttempted: cleanupRun.cleanupAttempted,
        cleanupCompleted: cleanupRun.cleanupCompleted,
        cleanupRequired: cleanupRun.cleanupRequired,
        cleanupDeferred: cleanupRun.cleanupDeferred,
        bodyStored: false,
        rawPathStored: false,
      },
    }),
  ];

  return {
    status,
    cleanupRun: {
      ...cleanupRun,
      evidenceRefs: [evidenceRefs[1]],
      auditEventIds: auditEvents.map((event) => event.id),
    },
    evidenceRefs,
    auditEvents,
    blockReasons,
  };
}

function createBlockedCleanupResult(
  input: WorktreeCleanupExecuteInput,
  blockReasons: string[],
): WorktreeCleanupExecuteResult {
  const runnerResult: WorktreeCleanupRunnerResult = {
    status: 'blocked',
    cleanupAttempted: false,
    cleanupCompleted: false,
    cleanupRequired: true,
    cleanupDeferred: true,
    gitProcessBoundaryInvoked: false,
    processBoundaryInvoked: false,
    externalProcessStarted: false,
    noRealWrite: true,
    summary: `Worktree cleanup blocked: ${blockReasons.join(', ')}.`,
  };
  return createCleanupResult(input, runnerResult, blockReasons);
}

function createCleanupRunnerResult(
  status: 'completed' | 'failed' | 'blocked',
  results: readonly ControlledGitCommandOutput[],
  overrides: Partial<WorktreeCleanupRunnerResult>,
): WorktreeCleanupRunnerResult {
  const commandSummaryHash = stableHash(
    JSON.stringify(
      results.map((result) => ({
        kind: result.kind,
        exitCode: result.exitCode,
        stdoutHash: result.stdoutHash,
        stderrHash: result.stderrHash,
        stdoutLineCount: result.stdoutLineCount,
        stderrLineCount: result.stderrLineCount,
      })),
    ),
  );
  const boundaryInvoked = results.some((result) => result.externalProcessStarted);

  return {
    status,
    commandSummaryHash,
    dirtyFileCount: overrides.dirtyFileCount ?? 0,
    dirtyStatusHash: overrides.dirtyStatusHash,
    cleanupAttempted: overrides.cleanupAttempted ?? false,
    cleanupCompleted: overrides.cleanupCompleted ?? false,
    cleanupRequired: overrides.cleanupRequired ?? true,
    cleanupDeferred: overrides.cleanupDeferred ?? true,
    gitProcessBoundaryInvoked: boundaryInvoked,
    processBoundaryInvoked: boundaryInvoked,
    externalProcessStarted: boundaryInvoked,
    noRealWrite: overrides.cleanupAttempted !== true,
    summary: overrides.summary ?? `Controlled git cleanup ${status}.`,
  };
}

function validateCleanupAuthority(
  authority: ExecutionAuthority | undefined,
  now: (() => string) | undefined,
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
  if (!authority.policyDecisionId.trim()) {
    return 'policy_decision_missing';
  }
  if (!authority.approvalArtifactId) {
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

function validateCleanupRuntime(
  plan: WorktreeCleanupPlanResult,
  runtime: ControlledGitRuntimeInput | undefined,
): string[] {
  if (!runtime) {
    return ['runtime_worktree_cleanup_input_missing'];
  }
  const expected = {
    repoRootHash: stableHash(`repo:${runtime.repoRoot}`),
    worktreeRootHash: runtime.worktreeRoot
      ? stableHash(`root:${runtime.worktreeRoot}`)
      : undefined,
    worktreePathHash: stableHash(`path:${runtime.worktreePath}`),
  };
  return [
    expected.repoRootHash !== plan.repoRootHash ? 'repo_root_hash_mismatch' : undefined,
    expected.worktreeRootHash !== plan.worktreeRootHash ? 'worktree_root_hash_mismatch' : undefined,
    expected.worktreePathHash !== plan.worktreePathHash ? 'worktree_path_hash_mismatch' : undefined,
  ].filter((reason): reason is string => Boolean(reason));
}

function countLines(text: string): number {
  return text.length === 0 ? 0 : text.split(/\r?\n/).filter((line) => line.length > 0).length;
}

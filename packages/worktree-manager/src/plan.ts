import { dirname, isAbsolute, relative, resolve } from 'node:path';
import {
  type CapabilityDryRun,
  CapabilityDryRunSchema,
  SchemaVersionSchema,
  type WorktreePlan,
  type WorktreeRunnerMode,
  WorktreePlanSchema,
  foundationId,
  foundationTimestamp,
} from '@codexhub/contracts';
import { hashText } from '@codexhub/evidence-kernel';
import { WORKTREE_MANAGER_ADAPTER_NAME } from './manifest';

export interface WorktreeManagerPlanInput {
  repoRoot: string;
  worktreeSlug: string;
  branchName: string;
  baseRef?: string;
  runnerMode?: WorktreeRunnerMode;
  worktreeRoot?: string;
  allowedWorktreeRoots?: readonly string[];
  now?: () => string;
}

export interface WorktreeManagerPlanResult {
  id: string;
  adapterName: string;
  status: 'planned' | 'blocked';
  repoRootHash: string;
  worktreeRootHash: string;
  worktreePathHash: string;
  branchNameHash: string;
  worktreeSlugHash: string;
  baseRefHash?: string;
  runnerMode: WorktreeRunnerMode;
  blockReasons: string[];
  capabilityDryRun: CapabilityDryRun;
  worktreePlan: WorktreePlan;
}

export function createWorktreeManagerPlan(
  input: WorktreeManagerPlanInput,
): WorktreeManagerPlanResult {
  const now = input.now ?? foundationTimestamp;
  const createdAt = now();
  const repoRoot = resolve(input.repoRoot);
  const defaultWorktreeRoot = resolve(dirname(repoRoot), 'CodexHub-worktrees');
  const requestedRoot = input.worktreeRoot
    ? resolve(input.worktreeRoot)
    : defaultWorktreeRoot;
  const allowedRoots = new Set(
    [defaultWorktreeRoot, ...(input.allowedWorktreeRoots ?? [])].map((root) =>
      resolve(root).toLowerCase(),
    ),
  );
  const worktreePath = resolve(requestedRoot, input.worktreeSlug);
  const runnerMode = input.runnerMode ?? 'fixture';
  const baseRefHash = input.baseRef ? stableHash(`baseRef:${input.baseRef}`) : undefined;
  const gitProcessBoundaryPlanned = runnerMode === 'controlled-git-worktree';
  const blockReasons = [
    ...validateSlug(input.worktreeSlug),
    ...validateBranchName(input.branchName),
    ...validateRunnerMode({ runnerMode, baseRef: input.baseRef }),
    ...(input.baseRef ? validateBaseRef(input.baseRef) : []),
    ...validateWorktreeRoot({
      repoRoot,
      requestedRoot,
      defaultWorktreeRoot,
      allowedRoots,
      explicitRootProvided: Boolean(input.worktreeRoot),
    }),
    ...validateWorktreePath({ requestedRoot, worktreePath, repoRoot }),
  ];
  const status = blockReasons.length > 0 ? 'blocked' : 'planned';
  const id = foundationId('worktree_plan');
  const worktreePathHash = stableHash(`path:${worktreePath}`);
  const worktreePlan = WorktreePlanSchema.parse({
    id,
    schemaVersion: SchemaVersionSchema.value,
    createdAt,
    adapterName: WORKTREE_MANAGER_ADAPTER_NAME,
    status,
    runnerMode,
    repoRootHash: stableHash(`repo:${repoRoot}`),
    worktreeRootHash: stableHash(`root:${requestedRoot}`),
    worktreePathHash,
    branchNameHash: stableHash(`branch:${input.branchName}`),
    worktreeSlugHash: stableHash(`slug:${input.worktreeSlug}`),
    baseRefHash,
    commandSummaryHash: stableHash(
      JSON.stringify({
        runnerMode,
        allowedCommands:
          runnerMode === 'controlled-git-worktree'
            ? ['rev-parse', 'worktree-add-detach', 'diff-name-only', 'diff-numstat']
            : ['fixture-runner'],
      }),
    ),
    defaultRootKind:
      requestedRoot.toLowerCase() === defaultWorktreeRoot.toLowerCase()
        ? 'sibling'
        : 'allowlisted-absolute',
    blockReasons,
    plannedActions: [
      {
        action: 'git.worktree.plan',
        actionMode: 'dry-run',
        risk: 'medium',
        target: worktreePathHash,
        requiresApproval: false,
      },
      {
        action: 'git.worktree.create.real',
        actionMode: runnerMode === 'controlled-git-worktree' ? 'write' : 'dry-run',
        risk: 'high',
        target: worktreePathHash,
        requiresApproval: true,
      },
    ],
    rawPathStored: false,
    bodyStored: false,
    noRealWrite: true,
    gitProcessBoundaryPlanned,
    gitProcessBoundaryInvoked: false,
    cleanupRequired: false,
    cleanupDeferred: false,
    processBoundaryPlanned: gitProcessBoundaryPlanned,
    processBoundaryInvoked: false,
    externalProcessStarted: false,
    summary:
      status === 'planned'
        ? runnerMode === 'controlled-git-worktree'
          ? 'Controlled git worktree dry-run plan created without invoking git.'
          : 'Worktree dry-run plan created without invoking git.'
        : 'Worktree dry-run plan blocked by path or slug constraints.',
  });
  const capabilityDryRun = CapabilityDryRunSchema.parse({
    id: foundationId('capability_dry_run'),
    schemaVersion: SchemaVersionSchema.value,
    createdAt,
    adapterName: WORKTREE_MANAGER_ADAPTER_NAME,
    inputSummary: {
      repoRootHash: worktreePlan.repoRootHash,
      worktreeRootHash: worktreePlan.worktreeRootHash,
      worktreePathHash,
      branchNameHash: worktreePlan.branchNameHash,
      worktreeSlugHash: worktreePlan.worktreeSlugHash,
      baseRefHash,
      runnerMode,
      gitProcessBoundaryPlanned,
      rawPathStored: false,
      bodyStored: false,
    },
    plannedActions: worktreePlan.plannedActions,
    requiredEvidence: ['worktree.plan', 'patch.diff_summary', 'pr.draft_summary'],
    warnings: [
      runnerMode === 'controlled-git-worktree'
        ? 'm6b_controlled_git_boundary_requires_persisted_approval'
        : 'm6a_fixture_only',
      runnerMode === 'controlled-git-worktree'
        ? 'worktree_cleanup_deferred'
        : 'real_git_boundary_disabled',
      'git_push_and_pull_request_forbidden',
      ...blockReasons,
    ],
  });

  return {
    id,
    adapterName: WORKTREE_MANAGER_ADAPTER_NAME,
    status,
    repoRootHash: worktreePlan.repoRootHash,
    worktreeRootHash: worktreePlan.worktreeRootHash,
    worktreePathHash,
    branchNameHash: worktreePlan.branchNameHash,
    worktreeSlugHash: worktreePlan.worktreeSlugHash,
    baseRefHash,
    runnerMode,
    blockReasons,
    capabilityDryRun,
    worktreePlan,
  };
}

export function stableHash(value: string): string {
  return `sha256:${hashText(value)}`;
}

function validateSlug(slug: string): string[] {
  const reasons: string[] = [];
  if (slug.trim().length === 0) {
    reasons.push('worktree_slug_required');
  }
  if (!/^[A-Za-z0-9][A-Za-z0-9._-]{0,79}$/.test(slug)) {
    reasons.push('worktree_slug_unsafe');
  }
  if (slug.includes('..') || slug.includes('/') || slug.includes('\\')) {
    reasons.push('worktree_slug_traversal_forbidden');
  }
  return reasons;
}

function validateBranchName(branchName: string): string[] {
  const reasons: string[] = [];
  if (branchName.trim().length === 0) {
    reasons.push('branch_name_required');
  }
  if (!/^[A-Za-z0-9][A-Za-z0-9._/-]{0,127}$/.test(branchName)) {
    reasons.push('branch_name_unsafe');
  }
  if (
    branchName.includes('..') ||
    branchName.startsWith('/') ||
    branchName.startsWith('\\') ||
    branchName.endsWith('.lock') ||
    branchName.includes('\\')
  ) {
    reasons.push('branch_name_traversal_forbidden');
  }
  return reasons;
}

function validateRunnerMode(input: {
  runnerMode: WorktreeRunnerMode;
  baseRef: string | undefined;
}): string[] {
  if (input.runnerMode === 'controlled-git-worktree' && !input.baseRef?.trim()) {
    return ['base_ref_required'];
  }
  return [];
}

function validateBaseRef(baseRef: string): string[] {
  const reasons: string[] = [];
  if (!/^[A-Za-z0-9][A-Za-z0-9._/-]{0,127}$/.test(baseRef)) {
    reasons.push('base_ref_unsafe');
  }
  if (
    baseRef.includes('..') ||
    baseRef.startsWith('/') ||
    baseRef.startsWith('\\') ||
    baseRef.endsWith('.lock') ||
    baseRef.includes('\\')
  ) {
    reasons.push('base_ref_traversal_forbidden');
  }
  return reasons;
}

function validateWorktreeRoot(input: {
  repoRoot: string;
  requestedRoot: string;
  defaultWorktreeRoot: string;
  allowedRoots: ReadonlySet<string>;
  explicitRootProvided: boolean;
}): string[] {
  const reasons: string[] = [];
  if (!isAbsolute(input.requestedRoot)) {
    reasons.push('worktree_root_absolute_required');
  }
  if (isSameOrInside(input.requestedRoot, input.repoRoot)) {
    reasons.push('worktree_root_inside_repo_forbidden');
  }
  if (
    input.explicitRootProvided &&
    !input.allowedRoots.has(input.requestedRoot.toLowerCase())
  ) {
    reasons.push('worktree_root_not_allowlisted');
  }
  if (
    !input.explicitRootProvided &&
    input.requestedRoot.toLowerCase() !== input.defaultWorktreeRoot.toLowerCase()
  ) {
    reasons.push('worktree_root_default_mismatch');
  }
  return reasons;
}

function validateWorktreePath(input: {
  requestedRoot: string;
  worktreePath: string;
  repoRoot: string;
}): string[] {
  const reasons: string[] = [];
  if (!isSameOrInside(input.worktreePath, input.requestedRoot)) {
    reasons.push('worktree_path_outside_root_forbidden');
  }
  if (isSameOrInside(input.worktreePath, input.repoRoot)) {
    reasons.push('worktree_path_inside_repo_forbidden');
  }
  return reasons;
}

function isSameOrInside(child: string, parent: string): boolean {
  const childResolved = resolve(child);
  const parentResolved = resolve(parent);
  const relativePath = relative(parentResolved, childResolved);
  return (
    relativePath === '' ||
    (!relativePath.startsWith('..') && !isAbsolute(relativePath))
  );
}

import { dirname, isAbsolute, relative, resolve } from 'node:path';
import {
  type CapabilityDryRun,
  CapabilityDryRunSchema,
  SchemaVersionSchema,
  type WorktreePlan,
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
  const blockReasons = [
    ...validateSlug(input.worktreeSlug),
    ...validateBranchName(input.branchName),
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
    repoRootHash: stableHash(`repo:${repoRoot}`),
    worktreeRootHash: stableHash(`root:${requestedRoot}`),
    worktreePathHash,
    branchNameHash: stableHash(`branch:${input.branchName}`),
    worktreeSlugHash: stableHash(`slug:${input.worktreeSlug}`),
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
        actionMode: 'dry-run',
        risk: 'high',
        target: worktreePathHash,
        requiresApproval: true,
      },
    ],
    rawPathStored: false,
    bodyStored: false,
    noRealWrite: true,
    processBoundaryPlanned: false,
    processBoundaryInvoked: false,
    externalProcessStarted: false,
    summary:
      status === 'planned'
        ? 'Worktree dry-run plan created without invoking git.'
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
      rawPathStored: false,
      bodyStored: false,
    },
    plannedActions: worktreePlan.plannedActions,
    requiredEvidence: ['worktree.plan', 'patch.diff_summary', 'pr.draft_summary'],
    warnings: [
      'm6a_fixture_only',
      'real_git_boundary_disabled',
      'real_git_write_requires_future_approval',
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

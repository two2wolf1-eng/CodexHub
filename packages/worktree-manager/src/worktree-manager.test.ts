import { dirname, resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  CapabilityManifestSchema,
  WorktreeControlPlaneRunSchema,
  type ExecutionAuthority,
} from '@codexhub/contracts';
import {
  buildControlledGitCommand,
  createControlledGitCleanupRunner,
  createControlledGitWorktreeRunner,
  createWorktreeCleanupPlan,
  createWorktreeManagerManifest,
  createWorktreeManagerPlan,
  executeWorktreeCleanup,
  executeWorktreeManager,
  type ControlledGitCommandKind,
  type ControlledGitCommandOutput,
} from './index';

const repoRoot = process.cwd();
const siblingRoot = resolve(dirname(repoRoot), 'CodexHub-worktrees');
const authority: ExecutionAuthority = {
  id: 'execution_authority_1',
  schemaVersion: '2026-04-28.foundation',
  createdAt: '2026-04-28T00:00:00.000Z',
  policyDecisionId: 'policy_worktree_1',
  allowed: true,
  constraints: ['m6a_fixture_only', 'no_real_git_boundary'],
};

describe('worktree-manager manifest and plan', () => {
  it('declares a builtin git capability with an approval-gated process boundary', () => {
    const manifest = CapabilityManifestSchema.parse(createWorktreeManagerManifest());

    expect(manifest.kind).toBe('git');
    expect(manifest.provider).toBe('builtin');
    expect(manifest.defaultActionMode).toBe('dry-run');
    expect(manifest.processBoundary.mayStartExternalProcess).toBe(true);
    expect(manifest.processBoundary.requiresProcessAudit).toBe(true);
  });

  it('plans a sibling worktree using hashes only', () => {
    const plan = createWorktreeManagerPlan({
      repoRoot,
      worktreeSlug: 'feature-m6a',
      branchName: 'codex/feature-m6a',
    });

    expect(plan.status).toBe('planned');
    expect(plan.worktreePlan.defaultRootKind).toBe('sibling');
    expect(plan.worktreeRootHash).toMatch(/^sha256:/);
    expect(plan.worktreePathHash).toMatch(/^sha256:/);
    expect(plan.worktreePlan.processBoundaryInvoked).toBe(false);
    expect(JSON.stringify(plan)).not.toContain(siblingRoot);
    expect(JSON.stringify(plan)).not.toContain(repoRoot);
  });

  it('plans controlled git worktree mode with a base ref and boundary truth', () => {
    const plan = createWorktreeManagerPlan({
      repoRoot,
      worktreeSlug: 'feature-m6b',
      branchName: 'codex/feature-m6b',
      baseRef: 'HEAD',
      runnerMode: 'controlled-git-worktree',
    });
    const missingBaseRef = createWorktreeManagerPlan({
      repoRoot,
      worktreeSlug: 'feature-m6b',
      branchName: 'codex/feature-m6b',
      runnerMode: 'controlled-git-worktree',
    });

    expect(plan.status).toBe('planned');
    expect(plan.runnerMode).toBe('controlled-git-worktree');
    expect(plan.baseRefHash).toMatch(/^sha256:/);
    expect(plan.worktreePlan.gitProcessBoundaryPlanned).toBe(true);
    expect(plan.worktreePlan.processBoundaryPlanned).toBe(true);
    expect(plan.capabilityDryRun.plannedActions).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          action: 'git.worktree.create.real',
          actionMode: 'write',
          requiresApproval: true,
        }),
      ]),
    );
    expect(missingBaseRef.blockReasons).toContain('base_ref_required');
  });

  it('blocks unsafe roots, traversal, and unsafe slugs', () => {
    expect(
      createWorktreeManagerPlan({
        repoRoot,
        worktreeSlug: '../escape',
        branchName: 'codex/feature',
      }).blockReasons,
    ).toEqual(expect.arrayContaining(['worktree_slug_unsafe']));
    expect(
      createWorktreeManagerPlan({
        repoRoot,
        worktreeSlug: 'feature',
        branchName: 'codex/feature',
        worktreeRoot: resolve(repoRoot, '.worktrees'),
      }).blockReasons,
    ).toEqual(
      expect.arrayContaining([
        'worktree_root_inside_repo_forbidden',
        'worktree_root_not_allowlisted',
      ]),
    );
    expect(
      createWorktreeManagerPlan({
        repoRoot,
        worktreeSlug: 'feature',
        branchName: '../bad',
      }).blockReasons,
    ).toEqual(expect.arrayContaining(['branch_name_traversal_forbidden']));
  });

  it('allows explicit absolute roots only when allowlisted', () => {
    const blocked = createWorktreeManagerPlan({
      repoRoot,
      worktreeSlug: 'feature',
      branchName: 'codex/feature',
      worktreeRoot: resolve(dirname(repoRoot), 'OtherWorktrees'),
    });
    const allowed = createWorktreeManagerPlan({
      repoRoot,
      worktreeSlug: 'feature',
      branchName: 'codex/feature',
      worktreeRoot: resolve(dirname(repoRoot), 'OtherWorktrees'),
      allowedWorktreeRoots: [resolve(dirname(repoRoot), 'OtherWorktrees')],
    });

    expect(blocked.blockReasons).toContain('worktree_root_not_allowlisted');
    expect(allowed.status).toBe('planned');
  });
});

describe('worktree-manager execute', () => {
  it('blocks without authority or without an injected runner', async () => {
    const plan = createWorktreeManagerPlan({
      repoRoot,
      worktreeSlug: 'feature-m6a',
      branchName: 'codex/feature-m6a',
    });

    const missingAuthority = await executeWorktreeManager({
      plan,
      runner: {
        async run() {
          return { status: 'completed' };
        },
      },
    });
    const missingRunner = await executeWorktreeManager({
      plan,
      authority,
    });

    expect(missingAuthority.status).toBe('blocked');
    expect(missingAuthority.capabilityResult.processBoundaryInvoked).toBe(false);
    expect(missingRunner.blockReasons).toContain('fixture_runner_required');
    expect(missingRunner.worktreeRun.externalProcessStarted).toBe(false);
  });

  it('returns patch, PR, and release metadata from an injected fixture runner', async () => {
    const rawDiff = 'diff --git a/packages/contracts/src/index.ts b/packages/contracts/src/index.ts';
    const plan = createWorktreeManagerPlan({
      repoRoot,
      worktreeSlug: 'feature-m6a',
      branchName: 'codex/feature-m6a',
    });
    const result = await executeWorktreeManager({
      plan,
      authority,
      runner: {
        async run() {
          return {
            status: 'completed',
            changedFiles: ['packages/contracts/src/index.ts'],
            diffText: rawDiff,
            summary: 'Fixture changed one contract file.',
          };
        },
      },
    });

    expect(result.status).toBe('completed');
    expect(result.worktreeRun.changedFileCount).toBe(1);
    expect(result.patchRun.status).toBe('generated');
    expect(result.pullRequestDraft.status).toBe('ready');
    expect(result.releaseAuditDraft.status).toBe('ready');
    expect(result.evidenceRefs.map((ref) => ref.kind)).toEqual(
      expect.arrayContaining([
        'worktree.plan',
        'worktree.run_summary',
        'patch.diff_summary',
        'pr.draft_summary',
        'release.audit_draft',
      ]),
    );
    expect(result.auditEvents[0]?.policyDecisionId).toBe(authority.policyDecisionId);
    const serialized = JSON.stringify(result);
    expect(serialized).not.toContain(rawDiff);
    expect(serialized).not.toContain(siblingRoot);
    expect(serialized).not.toContain(repoRoot);
    expect(serialized).not.toContain('private-token');
    expect(result.capabilityResult.externalProcessStarted).toBe(false);
  });

  it('blocks controlled git execution without approval, enablement, or matching runtime', async () => {
    const plan = createWorktreeManagerPlan({
      repoRoot,
      worktreeSlug: 'feature-m6b',
      branchName: 'codex/feature-m6b',
      baseRef: 'HEAD',
      runnerMode: 'controlled-git-worktree',
    });
    const runtime = {
      repoRoot,
      worktreeRoot: siblingRoot,
      worktreePath: resolve(siblingRoot, 'feature-m6b'),
      worktreeSlug: 'feature-m6b',
      branchName: 'codex/feature-m6b',
      baseRef: 'HEAD',
    };
    const noApproval = await executeWorktreeManager({
      plan,
      authority,
      realGitBoundaryEnabled: true,
      runtime,
      runner: {
        async run() {
          return { status: 'completed' };
        },
      },
    });
    const disabled = await executeWorktreeManager({
      plan,
      authority: { ...authority, approvalArtifactId: 'approval_artifact_1' },
      runtime,
      runner: {
        async run() {
          return { status: 'completed' };
        },
      },
    });
    const mismatch = await executeWorktreeManager({
      plan,
      authority: { ...authority, approvalArtifactId: 'approval_artifact_1' },
      realGitBoundaryEnabled: true,
      runtime: { ...runtime, baseRef: 'main' },
      runner: {
        async run() {
          return { status: 'completed' };
        },
      },
    });

    expect(noApproval.blockReasons).toContain('approval_artifact_missing');
    expect(disabled.blockReasons).toContain('controlled_git_boundary_disabled');
    expect(mismatch.blockReasons).toContain('base_ref_hash_mismatch');
    expect(noApproval.worktreeRun.gitProcessBoundaryInvoked).toBe(false);
  });

  it('returns metadata-only results from an injected controlled git runner', async () => {
    const plan = createWorktreeManagerPlan({
      repoRoot,
      worktreeSlug: 'feature-m6b',
      branchName: 'codex/feature-m6b',
      baseRef: 'HEAD',
      runnerMode: 'controlled-git-worktree',
    });
    const result = await executeWorktreeManager({
      plan,
      authority: { ...authority, approvalArtifactId: 'approval_artifact_1' },
      realGitBoundaryEnabled: true,
      runtime: {
        repoRoot,
        worktreeRoot: siblingRoot,
        worktreePath: resolve(siblingRoot, 'feature-m6b'),
        worktreeSlug: 'feature-m6b',
        branchName: 'codex/feature-m6b',
        baseRef: 'HEAD',
      },
      runner: {
        async run() {
          return {
            status: 'completed',
            changedFiles: ['packages/worktree-manager/src/execute.ts'],
            diffHash: 'sha256:diff',
            diffLineCount: 4,
            commandSummaryHash: 'sha256:command',
            gitProcessBoundaryInvoked: true,
            processBoundaryInvoked: true,
            externalProcessStarted: true,
            noRealWrite: false,
            cleanupRequired: true,
            cleanupDeferred: true,
          };
        },
      },
    });

    expect(result.status).toBe('completed');
    expect(result.worktreeRun.runnerMode).toBe('controlled-git-worktree');
    expect(result.worktreeRun.noRealWrite).toBe(false);
    expect(result.worktreeRun.gitProcessBoundaryInvoked).toBe(true);
    expect(result.worktreeRun.cleanupRequired).toBe(true);
    expect(result.capabilityResult.processBoundaryInvoked).toBe(true);
    expect(JSON.stringify(result)).not.toContain(resolve(siblingRoot, 'feature-m6b'));
    expect(JSON.stringify(result)).not.toContain('diff --git');
  });

  it('builds only fixed git argv shapes for the controlled boundary', () => {
    const runtime = {
      repoRoot,
      worktreePath: resolve(siblingRoot, 'feature-m6b'),
      baseRef: 'HEAD',
    };

    expect(buildControlledGitCommand('repo-root-preflight', runtime)).toMatchObject({
      command: 'git',
      shell: false,
      args: ['-C', repoRoot, 'rev-parse', '--show-toplevel'],
    });
    expect(buildControlledGitCommand('worktree-add-detach', runtime).args).toEqual([
      '-C',
      repoRoot,
      'worktree',
      'add',
      '--detach',
      resolve(siblingRoot, 'feature-m6b'),
      'HEAD',
    ]);
    expect(buildControlledGitCommand('diff-name-only', runtime).args).toEqual([
      '-C',
      resolve(siblingRoot, 'feature-m6b'),
      'diff',
      '--name-only',
      '--no-ext-diff',
    ]);
    expect(buildControlledGitCommand('worktree-remove', runtime).args).toEqual([
      '-C',
      repoRoot,
      'worktree',
      'remove',
      resolve(siblingRoot, 'feature-m6b'),
    ]);
    expect(buildControlledGitCommand('worktree-remove', runtime).args).not.toContain('--force');
  });

  it('runs each fixed controlled git command once while deriving diff metadata', async () => {
    const observedKinds: ControlledGitCommandKind[] = [];
    const runner = createControlledGitWorktreeRunner(
      {
        repoRoot,
        worktreePath: resolve(siblingRoot, 'feature-m6b'),
        baseRef: 'HEAD',
      },
      async (kind) => {
        observedKinds.push(kind);
        return createGitCommandOutput(kind, {
          stdout:
            kind === 'diff-name-only'
              ? 'packages/worktree-manager/src/execute.ts\n'
              : kind === 'diff-numstat'
                ? '1\t1\tpackages/worktree-manager/src/execute.ts\n'
                : '',
        });
      },
    );

    const result = await runner.run();

    expect(observedKinds).toEqual([
      'repo-root-preflight',
      'worktree-add-detach',
      'diff-name-only',
      'diff-numstat',
    ]);
    expect(result.status).toBe('completed');
    expect(result.changedFiles).toEqual(['packages/worktree-manager/src/execute.ts']);
    expect(result.diffLineCount).toBe(1);
    expect(result.cleanupRequired).toBe(true);
    expect(result.noRealWrite).toBe(false);
  });

  it('does not mark cleanup required when preflight fails before creation boundary', async () => {
    const runner = createControlledGitWorktreeRunner(
      {
        repoRoot,
        worktreePath: resolve(siblingRoot, 'feature-m6b'),
        baseRef: 'HEAD',
      },
      async (kind) => createGitCommandOutput(kind, { exitCode: 1 }),
    );

    const result = await runner.run();

    expect(result.status).toBe('failed');
    expect(result.gitProcessBoundaryInvoked).toBe(true);
    expect(result.cleanupRequired).toBe(false);
    expect(result.cleanupDeferred).toBe(false);
    expect(result.noRealWrite).toBe(true);
  });

  it('marks cleanup required once the worktree creation boundary is reached', async () => {
    const observedKinds: ControlledGitCommandKind[] = [];
    const runner = createControlledGitWorktreeRunner(
      {
        repoRoot,
        worktreePath: resolve(siblingRoot, 'feature-m6b'),
        baseRef: 'HEAD',
      },
      async (kind) => {
        observedKinds.push(kind);
        return createGitCommandOutput(kind, {
          exitCode: kind === 'diff-name-only' ? 1 : 0,
        });
      },
    );

    const result = await runner.run();

    expect(observedKinds).toEqual([
      'repo-root-preflight',
      'worktree-add-detach',
      'diff-name-only',
    ]);
    expect(result.status).toBe('failed');
    expect(result.cleanupRequired).toBe(true);
    expect(result.cleanupDeferred).toBe(true);
    expect(result.noRealWrite).toBe(false);
  });

  it('does not persist invalid changed file paths from fixtures', async () => {
    const plan = createWorktreeManagerPlan({
      repoRoot,
      worktreeSlug: 'feature-m6a',
      branchName: 'codex/feature-m6a',
    });
    const result = await executeWorktreeManager({
      plan,
      authority,
      runner: {
        async run() {
          return {
            status: 'completed',
            changedFiles: ['../outside.ts', 'packages/contracts/src/index.ts'],
          };
        },
      },
    });

    expect(result.status).toBe('failed');
    expect(result.blockReasons).toContain('invalid_changed_file_paths');
    expect(result.worktreeRun.changedFiles).toEqual(['packages/contracts/src/index.ts']);
    expect(JSON.stringify(result)).not.toContain('../outside.ts');
  });

  it('plans cleanup only when source run cleanup hashes match', () => {
    const sourceRun = createSourceWorktreeControlRun();
    const plan = createWorktreeCleanupPlan({
      sourceRun,
      repoRoot,
      worktreeRoot: siblingRoot,
      worktreePath: resolve(siblingRoot, 'feature-m6b'),
    });
    const mismatch = createWorktreeCleanupPlan({
      sourceRun,
      repoRoot,
      worktreeRoot: siblingRoot,
      worktreePath: resolve(siblingRoot, 'other-feature'),
    });

    expect(plan.status).toBe('planned');
    expect(plan.cleanupPlan.cleanupDeletePlanned).toBe(true);
    expect(plan.cleanupPlan.gitProcessBoundaryInvoked).toBe(false);
    expect(mismatch.status).toBe('blocked');
    expect(mismatch.blockReasons).toContain('worktree_path_hash_mismatch');
    expect(JSON.stringify(plan)).not.toContain(resolve(siblingRoot, 'feature-m6b'));
    expect(JSON.stringify(plan)).not.toContain(repoRoot);
  });

  it('blocks dirty cleanup after fixed git prechecks without invoking remove', async () => {
    const observedKinds: ControlledGitCommandKind[] = [];
    const runner = createControlledGitCleanupRunner(
      {
        repoRoot,
        worktreeRoot: siblingRoot,
        worktreePath: resolve(siblingRoot, 'feature-m6b'),
      },
      async (kind) => {
        observedKinds.push(kind);
        return createGitCommandOutput(kind, {
          stdout: kind === 'worktree-status-porcelain' ? ' M package.json\n' : '',
        });
      },
    );

    const result = await runner.run();

    expect(observedKinds).toEqual([
      'repo-root-preflight',
      'worktree-list-porcelain',
      'worktree-status-porcelain',
    ]);
    expect(result.status).toBe('blocked');
    expect(result.dirtyFileCount).toBe(1);
    expect(result.cleanupAttempted).toBe(false);
    expect(result.gitProcessBoundaryInvoked).toBe(true);
    expect(result.noRealWrite).toBe(true);
  });

  it('executes non-force cleanup with authority and metadata-only evidence', async () => {
    const sourceRun = createSourceWorktreeControlRun();
    const plan = createWorktreeCleanupPlan({
      sourceRun,
      repoRoot,
      worktreeRoot: siblingRoot,
      worktreePath: resolve(siblingRoot, 'feature-m6b'),
    });
    const result = await executeWorktreeCleanup({
      plan,
      authority: { ...authority, approvalArtifactId: 'cleanup_approval_1' },
      cleanupEnabled: true,
      runtime: {
        repoRoot,
        worktreeRoot: siblingRoot,
        worktreePath: resolve(siblingRoot, 'feature-m6b'),
      },
      runner: createControlledGitCleanupRunner(
        {
          repoRoot,
          worktreeRoot: siblingRoot,
          worktreePath: resolve(siblingRoot, 'feature-m6b'),
        },
        async (kind) => createGitCommandOutput(kind),
      ),
    });

    expect(result.status).toBe('completed');
    expect(result.cleanupRun.cleanupCompleted).toBe(true);
    expect(result.cleanupRun.cleanupRequired).toBe(false);
    expect(result.cleanupRun.gitProcessBoundaryInvoked).toBe(true);
    expect(result.evidenceRefs.map((ref) => ref.kind)).toEqual(
      expect.arrayContaining(['worktree.cleanup_plan', 'worktree.cleanup_summary']),
    );
    expect(JSON.stringify(result)).not.toContain(resolve(siblingRoot, 'feature-m6b'));
    expect(JSON.stringify(result)).not.toContain('worktree remove');
  });

  it('blocks cleanup without persisted approval, enablement, or hash-bound runtime', async () => {
    const sourceRun = createSourceWorktreeControlRun();
    const plan = createWorktreeCleanupPlan({
      sourceRun,
      repoRoot,
      worktreeRoot: siblingRoot,
      worktreePath: resolve(siblingRoot, 'feature-m6b'),
    });
    const noApproval = await executeWorktreeCleanup({
      plan,
      authority,
      cleanupEnabled: true,
      runtime: {
        repoRoot,
        worktreeRoot: siblingRoot,
        worktreePath: resolve(siblingRoot, 'feature-m6b'),
      },
      runner: { async run() { return { status: 'completed' }; } },
    });
    const disabled = await executeWorktreeCleanup({
      plan,
      authority: { ...authority, approvalArtifactId: 'cleanup_approval_1' },
      runtime: {
        repoRoot,
        worktreeRoot: siblingRoot,
        worktreePath: resolve(siblingRoot, 'feature-m6b'),
      },
      runner: { async run() { return { status: 'completed' }; } },
    });
    const mismatch = await executeWorktreeCleanup({
      plan,
      authority: { ...authority, approvalArtifactId: 'cleanup_approval_1' },
      cleanupEnabled: true,
      runtime: {
        repoRoot,
        worktreeRoot: siblingRoot,
        worktreePath: resolve(siblingRoot, 'other-feature'),
      },
      runner: { async run() { return { status: 'completed' }; } },
    });

    expect(noApproval.blockReasons).toContain('approval_artifact_missing');
    expect(disabled.blockReasons).toContain('worktree_cleanup_disabled');
    expect(mismatch.blockReasons).toContain('worktree_path_hash_mismatch');
    expect(noApproval.cleanupRun.gitProcessBoundaryInvoked).toBe(false);
  });
});

function createGitCommandOutput(
  kind: ControlledGitCommandKind,
  overrides: Partial<ControlledGitCommandOutput> = {},
): ControlledGitCommandOutput {
  const stdout = overrides.stdout ?? '';
  const stderr = overrides.stderr ?? '';

  return {
    kind,
    exitCode: overrides.exitCode ?? 0,
    stdoutHash: overrides.stdoutHash ?? `sha256:${kind}:stdout`,
    stderrHash: overrides.stderrHash ?? `sha256:${kind}:stderr`,
    stdoutLineCount: overrides.stdoutLineCount ?? (stdout.length === 0 ? 0 : 1),
    stderrLineCount: overrides.stderrLineCount ?? (stderr.length === 0 ? 0 : 1),
    externalProcessStarted: overrides.externalProcessStarted ?? true,
    stdout,
    stderr,
  };
}

function createSourceWorktreeControlRun() {
  const plan = createWorktreeManagerPlan({
    repoRoot,
    worktreeSlug: 'feature-m6b',
    branchName: 'codex/feature-m6b',
    baseRef: 'HEAD',
    runnerMode: 'controlled-git-worktree',
  });

  return WorktreeControlPlaneRunSchema.parse({
    id: 'source_worktree_run_1',
    schemaVersion: '2026-04-28.foundation',
    createdAt: '2026-04-28T00:00:00.000Z',
    dryRunId: plan.id,
    dryRunRecordId: plan.id,
    approvalArtifactId: 'worktree_approval_1',
    status: 'completed',
    planId: plan.id,
    runnerMode: 'controlled-git-worktree',
    repoRootHash: plan.repoRootHash,
    worktreeRootHash: plan.worktreeRootHash,
    worktreePathHash: plan.worktreePathHash,
    branchNameHash: plan.branchNameHash,
    worktreeSlugHash: plan.worktreeSlugHash,
    baseRefHash: plan.baseRefHash,
    changedFileCount: 1,
    diffHash: 'sha256:diff',
    evidenceRefIds: ['worktree_evidence_1'],
    auditEventIds: ['worktree_audit_1'],
    rawPathStored: false,
    bodyStored: false,
    noRealWrite: false,
    cleanupRequired: true,
    cleanupDeferred: true,
    gitProcessBoundaryInvoked: true,
    processBoundaryInvoked: true,
    externalProcessStarted: true,
    summary: 'Source worktree creation requires cleanup.',
  });
}

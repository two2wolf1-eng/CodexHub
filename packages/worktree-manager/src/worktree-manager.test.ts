import { dirname, resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { CapabilityManifestSchema, type ExecutionAuthority } from '@codexhub/contracts';
import {
  createWorktreeManagerManifest,
  createWorktreeManagerPlan,
  executeWorktreeManager,
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
  it('declares a builtin git capability without a process boundary', () => {
    const manifest = CapabilityManifestSchema.parse(createWorktreeManagerManifest());

    expect(manifest.kind).toBe('git');
    expect(manifest.provider).toBe('builtin');
    expect(manifest.defaultActionMode).toBe('dry-run');
    expect(manifest.processBoundary.mayStartExternalProcess).toBe(false);
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
});

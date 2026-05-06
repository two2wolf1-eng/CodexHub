import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { findAdversarialPublicOutputRoundTripLeaks } from '../../../test-fixtures/adversarial-public-output-fixture';
import {
  EXTERNAL_AGENT_CLAUDE_FIXED_ARGV_SHAPE,
  EXTERNAL_AGENT_CODEX_FIXED_ARGV_SHAPE,
  buildExternalAgentBoundaryRequest,
  createExternalAgentApprovalArtifact,
  createExternalAgentManifest,
  createExternalAgentReadiness,
  planExternalAgentPatch,
  rehearseExternalAgent,
  runExternalAgentPatchWithRunner,
  summarizeExternalAgentPatch,
} from './index';

const sourceDir = dirname(fileURLToPath(import.meta.url));

describe('external-agent-adapter', () => {
  it('keeps external agent source on fixed argv shapes without generic process passthrough', () => {
    const source = readFileSync(join(sourceDir, 'index.ts'), 'utf8');
    const forbiddenTerms = [
      'node:child_process',
      'child_process',
      'spawn(',
      'execFile(',
      'execa',
      'shell: true',
      'process.env',
      '--danger',
      '--allow',
      '--permission',
      '--workspace',
      '--add-dir',
      'repo-root',
      'rawCommandStored: true',
      'repoRootMutationAllowed: true',
    ];

    expect(EXTERNAL_AGENT_CODEX_FIXED_ARGV_SHAPE).toEqual([
      'codex',
      'exec',
      '--cwd',
      '<controlled-sibling-worktree>',
      '--instructions-file',
      '<transient-hash-bound-instructions>',
      '--json',
    ]);
    expect(EXTERNAL_AGENT_CLAUDE_FIXED_ARGV_SHAPE).toEqual([
      'claude',
      '--cwd',
      '<controlled-sibling-worktree>',
      '--print',
      '<transient-hash-bound-instructions>',
    ]);
    expect(forbiddenTerms.filter((term) => source.includes(term))).toEqual([]);
  });

  it('plans Codex and Claude agents with fixed argv hashes and no raw input persistence', async () => {
    const manifest = createExternalAgentManifest({
      provider: 'codex-cli',
      now: () => '2026-05-07T00:00:00.000Z',
    });
    const readiness = createExternalAgentReadiness({
      provider: 'codex-cli',
      externalAgentsEnabled: true,
      providerEnabled: true,
      cliConfigured: true,
      cliExecutable: 'codex',
      worktreeRecordId: 'worktree_run_1',
      worktreeResolved: true,
      now: () => '2026-05-07T00:00:00.000Z',
    });
    const plan = planExternalAgentPatch({
      provider: 'codex-cli',
      worktreeRecordId: 'worktree_run_1',
      worktreePath: 'C:/controlled-worktrees/codexhub-agent-1',
      prompt: 'transient instructions',
      instructions: 'transient agent instructions',
      changedFileCount: 1,
      enabled: true,
      now: () => '2026-05-07T00:00:00.000Z',
    });
    const approval = createExternalAgentApprovalArtifact({
      plan,
      status: 'approved',
      decidedBy: 'operator-1',
      reason: 'approved transiently',
      now: () => '2026-05-07T00:00:00.000Z',
    });
    const request = buildExternalAgentBoundaryRequest(plan);
    const run = await runExternalAgentPatchWithRunner({
      plan,
      readiness,
      approval,
      runner: {
        async run(boundaryRequest) {
          expect(boundaryRequest).toEqual(request);
          return {
            status: 'completed',
            patchHash: 'sha256:patch',
            changedFileCount: 1,
            addedLineCount: 4,
            deletedLineCount: 1,
          };
        },
      },
      now: () => '2026-05-07T00:00:00.000Z',
    });
    const summary = summarizeExternalAgentPatch({
      provider: 'codex-cli',
      patch: 'transient patch',
      changedFileCount: 1,
      worktreePath: 'C:/controlled-worktrees/codexhub-agent-1',
      now: () => '2026-05-07T00:00:00.000Z',
    });
    const claudeManifest = createExternalAgentManifest({
      provider: 'claude-code-cli',
      now: () => '2026-05-07T00:00:00.000Z',
    });

    expect(manifest.repoRootMutationAllowed).toBe(false);
    expect(claudeManifest.fixedArgvShapeHash).not.toEqual(manifest.fixedArgvShapeHash);
    expect(run.boundaryReached).toBe(true);
    expect(run.approvalConsumed).toBe(true);
    expect(run.patchSummary?.rawPatchStored).toBe(false);
    expect(
      findAdversarialPublicOutputRoundTripLeaks([
        manifest,
        readiness,
        plan,
        approval,
        request,
        run,
        summary,
        claudeManifest,
      ]),
    ).toEqual([]);
  });

  it('blocks rehearsals and runs before approval without touching process boundary', async () => {
    const readiness = createExternalAgentReadiness({
      provider: 'claude-code-cli',
      worktreeResolved: false,
      now: () => '2026-05-07T00:00:00.000Z',
    });
    const plan = planExternalAgentPatch({
      provider: 'claude-code-cli',
      worktreeRecordId: 'missing-worktree',
      worktreePath: 'C:/controlled-worktrees/missing',
      prompt: 'transient',
      instructions: 'transient',
      enabled: false,
      now: () => '2026-05-07T00:00:00.000Z',
    });
    const approval = createExternalAgentApprovalArtifact({
      plan,
      status: 'requested',
      now: () => '2026-05-07T00:00:00.000Z',
    });
    const run = await runExternalAgentPatchWithRunner({
      plan,
      readiness,
      approval,
      runner: {
        async run() {
          throw new Error('runner must not be called before approval');
        },
      },
      now: () => '2026-05-07T00:00:00.000Z',
    });
    const rehearsal = rehearseExternalAgent({
      provider: 'claude-code-cli',
      scenario: 'approval-blocked',
      now: () => '2026-05-07T00:00:00.000Z',
    });

    expect(run.boundaryReached).toBe(false);
    expect(run.externalProcessStarted).toBe(false);
    expect(rehearsal.status).toBe('blocked');
  });

  it('blocks repo-root and command-passthrough rehearsals while preserving metadata-only patch summaries', async () => {
    const plan = planExternalAgentPatch({
      provider: 'codex-cli',
      worktreeRecordId: 'worktree_run_2',
      worktreePath: 'C:/repo-root-must-not-be-targeted',
      prompt: 'raw prompt must never persist',
      instructions: 'raw instructions must never persist',
      expectedPatch: 'raw expected patch must never persist',
      changedFileCount: 2,
      enabled: true,
      now: () => '2026-05-07T00:00:00.000Z',
    });
    const approval = createExternalAgentApprovalArtifact({
      plan,
      status: 'approved',
      decidedBy: 'operator-2',
      reason: 'raw approval reason must hash only',
      now: () => '2026-05-07T00:00:00.000Z',
    });
    const summary = summarizeExternalAgentPatch({
      provider: 'codex-cli',
      patch: 'raw generated patch must never persist',
      changedFileCount: 2,
      addedLineCount: 6,
      deletedLineCount: 3,
      worktreePath: 'C:/repo-root-must-not-be-targeted',
      now: () => '2026-05-07T00:00:00.000Z',
    });
    const repoRootRehearsal = rehearseExternalAgent({
      provider: 'codex-cli',
      scenario: 'repo-root-blocked',
      now: () => '2026-05-07T00:00:00.000Z',
    });
    const passthroughRehearsal = rehearseExternalAgent({
      provider: 'claude-code-cli',
      scenario: 'command-passthrough-blocked',
      now: () => '2026-05-07T00:00:00.000Z',
    });
    const serialized = JSON.stringify([
      plan,
      approval,
      summary,
      repoRootRehearsal,
      passthroughRehearsal,
    ]);

    expect(plan.controlledSiblingWorktreeOnly).toBe(true);
    expect(plan.repoRootMutationAllowed).toBe(false);
    expect(plan.arbitraryCommandAllowed).toBe(false);
    expect(approval.rawCommandStored).toBe(false);
    expect(summary.rawPatchStored).toBe(false);
    expect(repoRootRehearsal.status).toBe('blocked');
    expect(repoRootRehearsal.repoRootMutationAllowed).toBe(false);
    expect(passthroughRehearsal.status).toBe('blocked');
    expect(passthroughRehearsal.controlledSiblingWorktreeOnly).toBe(true);
    expect(passthroughRehearsal.rawCommandStored).toBe(false);
    expect(serialized).not.toContain('raw prompt');
    expect(serialized).not.toContain('raw instructions');
    expect(serialized).not.toContain('raw expected patch');
    expect(serialized).not.toContain('raw generated patch');
    expect(serialized).not.toContain('C:/repo-root-must-not-be-targeted');
  });
});

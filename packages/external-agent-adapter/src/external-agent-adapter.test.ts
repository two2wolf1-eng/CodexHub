import { describe, expect, it } from 'vitest';
import { findAdversarialPublicOutputRoundTripLeaks } from '../../../test-fixtures/adversarial-public-output-fixture';
import {
  buildExternalAgentBoundaryRequest,
  createExternalAgentApprovalArtifact,
  createExternalAgentManifest,
  createExternalAgentReadiness,
  planExternalAgentPatch,
  rehearseExternalAgent,
  runExternalAgentPatchWithRunner,
  summarizeExternalAgentPatch,
} from './index';

describe('external-agent-adapter', () => {
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
});

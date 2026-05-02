import { describe, expect, it } from 'vitest';
import {
  runGovernedDevelopmentOrchestration,
  runMockDevelopmentOrchestration,
} from './index';

describe('orchestrator-kernel mock development orchestration', () => {
  it('runs the full foundation-only mock loop', async () => {
    const result = await runMockDevelopmentOrchestration({
      title: 'Add Electron CDP read-only observation skeleton',
      description: 'Create interfaces and tests only',
    });

    expect(result.request.title).toBe('Add Electron CDP read-only observation skeleton');
    expect(result.taskGraph.tasks.length).toBeGreaterThan(0);
    expect(result.skillResolution.selectedSkills.length).toBeGreaterThan(0);
    expect(result.summary.selectedSkillIds).toEqual(
      expect.arrayContaining([
        'codexhub-architecture-planner',
        'codexhub-contract-designer',
        'codexhub-workflow-policy-reviewer',
        'codexhub-electron-cdp-observer',
      ]),
    );
    expect(result.summary.selectedSkillIds).not.toContain('codexhub-browser-profile-observer');
    expect(result.summary.selectedSkillIds).not.toContain('codexhub-release-auditor');
    expect(result.skillResolution.selectedSkills.every((selection) => selection.reason.length > 0)).toBe(
      true,
    );
    expect(result.agentRuns).toHaveLength(result.taskGraph.tasks.length);
    expect(result.verificationRun.status).toBe('passed');
    expect(result.evidenceRefs.length).toBe(result.agentRuns.length + 1);
    expect(result.auditEvents.length).toBeGreaterThanOrEqual(result.agentRuns.length + 3);
    expect(result.summary.mockOnly).toBe(true);
  });
});

describe('orchestrator-kernel governed development orchestration', () => {
  it('prepares a metadata-only control-plane handoff without storing raw paths', async () => {
    const worktreePath = 'C:\\Users\\Thomas\\CodexHub\\.worktrees\\feature-private';
    const governedInputRelativePath = '.codexhub/governed-input.md';
    const result = await runGovernedDevelopmentOrchestration({
      title: 'Implement governed Codex runner handoff',
      description: 'Prepare Supervisor-owned control-plane handoff only.',
      handoff: {
        dryRunId: 'codex_live_run_1',
        approvalArtifactId: 'codex_approval_artifact_1',
        worktreePath,
        governedInput: {
          relativePath: governedInputRelativePath,
          contentHash: 'sha256:governed-input-content',
        },
      },
    });

    expect(result.summary.mockOnly).toBe(false);
    expect(result.summary.runnerMode).toBe('governed_control_plane_handoff');
    expect(result.summary.handoffStatus).toBe('ready_for_control_plane');
    expect(result.summary.controlPlaneReady).toBe(true);
    expect(result.summary.liveExecution).toBe(false);
    expect(result.summary.externalProcessStarted).toBe(false);
    expect(result.summary.executionDisabled).toBe(true);
    expect(result.handoff.worktreePathHash).toMatch(/^sha256:/);
    expect(result.handoff.governedInputRelativePathHash).toMatch(/^sha256:/);
    expect(result.handoff.rawPathStored).toBe(false);
    expect(result.agentRuns.every((agentRun) => agentRun.status === 'planned')).toBe(true);
    expect(result.patchRuns).toHaveLength(1);
    expect(result.patchRuns[0]?.status).toBe('planned');
    expect(result.verificationRun.status).toBe('planned');
    expect(result.auditEvents.length).toBeGreaterThanOrEqual(result.agentRuns.length + 4);
    expect(result.summary.selectedSkillIds).toEqual(
      expect.arrayContaining([
        'codexhub-codex-exec-adapter',
        'codexhub-workflow-policy-reviewer',
        'codexhub-architecture-planner',
      ]),
    );
    expect(JSON.stringify(result)).not.toContain(worktreePath);
    expect(JSON.stringify(result)).not.toContain(governedInputRelativePath);
  });

  it('blocks handoff before control-plane readiness when governed inputs are missing', async () => {
    const result = await runGovernedDevelopmentOrchestration({
      title: 'Implement governed Codex runner handoff',
      description: 'Prepare Supervisor-owned control-plane handoff only.',
    });

    expect(result.summary.handoffStatus).toBe('blocked');
    expect(result.summary.controlPlaneReady).toBe(false);
    expect(result.summary.blockedReasonCodes).toEqual(
      expect.arrayContaining([
        'dry_run_id_required',
        'approval_artifact_id_required',
        'worktree_path_required',
        'governed_input_relative_path_required',
        'governed_input_content_hash_required',
      ]),
    );
    expect(result.agentRuns.every((agentRun) => agentRun.status === 'failed')).toBe(true);
    expect(result.verificationRun.status).toBe('failed');
    expect(result.summary.liveExecution).toBe(false);
    expect(result.summary.externalProcessStarted).toBe(false);
    expect(result.summary.executionDisabled).toBe(true);
  });
});

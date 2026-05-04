import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import type { AuditEvent, CodexExecManualApprovalRecord, EvidenceRef } from '@codexhub/contracts';
import { hashText } from '@codexhub/evidence-kernel';
import type { CodexHubStore } from '@codexhub/store-core';
import {
  type M9LocalPilotInput,
  runMinimalGovernedOrchestration,
  runM6aControlledWorktreePrDraft,
  runM6bGovernedWorktreePrDraft,
  runGoldenPathRehearsal,
  runGovernedDevelopmentOrchestration,
  runM11ProductionPilotNarrowPath,
  runM9LocalPilot,
  runM10PilotAcceptanceRehearsal,
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

describe('orchestrator-kernel golden path rehearsal', () => {
  it('passes the fixture-only golden path without raw bodies or live boundaries', () => {
    const run = runGoldenPathRehearsal({ scenario: 'all-pass' });
    const serialized = JSON.stringify(run);

    expect(run.status).toBe('passed');
    expect(run.prDraftStatus).toBe('ready');
    expect(run.releaseAuditStatus).toBe('ready');
    expect(run.steps.map((step) => step.phase)).toEqual([
      'development-request.fixture',
      'worktree.fixture',
      'codex.fixture',
      'verification.fixture',
      'pr-draft.fixture',
      'release-audit.fixture',
      'telemetry-projection.fixture',
    ]);
    expect(run.evidenceBundle.evidenceCount).toBe(7);
    expect(run.telemetryProjectionHash).toMatch(/^sha256:/);
    expect(run.processBoundaryInvoked).toBe(false);
    expect(run.externalProcessStarted).toBe(false);
    expect(run.noRealWrite).toBe(true);
    expect(run.telemetryAuthoritative).toBe(false);
    expect(serialized).not.toContain(process.cwd());
    expect(serialized).not.toContain('diff --git');
    expect(serialized).not.toContain('raw prompt');
  });

  it('blocks PR readiness when Codex or Nx fixture verification fails', () => {
    const codexFailed = runGoldenPathRehearsal({ scenario: 'codex-failed' });
    const nxFailed = runGoldenPathRehearsal({ scenario: 'nx-failed' });

    expect(codexFailed.status).toBe('failed');
    expect(codexFailed.prDraftStatus).toBe('blocked');
    expect(codexFailed.steps.find((step) => step.phase === 'verification.fixture')?.status).toBe(
      'blocked',
    );
    expect(nxFailed.status).toBe('failed');
    expect(nxFailed.prDraftStatus).toBe('blocked');
    expect(nxFailed.steps.find((step) => step.phase === 'verification.fixture')?.status).toBe(
      'failed',
    );
  });
});

describe('orchestrator-kernel M10 pilot acceptance rehearsal', () => {
  it('passes the fixture operator flow without live execution or PR actions', () => {
    const run = runM10PilotAcceptanceRehearsal({ scenario: 'all-pass' });
    const serialized = JSON.stringify(run);

    expect(run.status).toBe('passed');
    expect(run.goldenPathStatus).toBe('passed');
    expect(run.prActionStatus).toBe('not_ready_no_live_pr');
    expect(run.steps.map((step) => step.code)).toEqual([
      'doctor_preflight',
      'pilot_checklist',
      'approval_history',
      'governance_projection',
      'fixture_pilot',
      'operator_review',
    ]);
    expect(run.evidenceSummary.evidenceCount).toBeGreaterThan(0);
    expect(run.evidenceAuditAuthoritative).toBe(true);
    expect(run.telemetryAuthoritative).toBe(false);
    expect(run.processBoundaryInvoked).toBe(false);
    expect(run.externalProcessStarted).toBe(false);
    expect(run.networkBoundaryInvoked).toBe(false);
    expect(run.localControlKeyRead).toBe(false);
    expect(run.supervisorPostAllowed).toBe(false);
    expect(run.adapterExecuteAllowed).toBe(false);
    expect(run.pushAllowed).toBe(false);
    expect(run.pullRequestOpened).toBe(false);
    expect(serialized).not.toContain(process.cwd());
    expect(serialized).not.toContain('raw prompt');
    expect(serialized).not.toContain('stdout');
    expect(serialized).not.toContain('stderr');
    expect(serialized).not.toContain('diff --git');
  });

  it('blocks or fails acceptance scenarios before marking operator flow passed', () => {
    const readinessBlocked = runM10PilotAcceptanceRehearsal({ scenario: 'readiness-blocked' });
    const approvalBlocked = runM10PilotAcceptanceRehearsal({ scenario: 'approval-blocked' });
    const codexFailed = runM10PilotAcceptanceRehearsal({ scenario: 'codex-failed' });
    const nxFailed = runM10PilotAcceptanceRehearsal({ scenario: 'nx-failed' });

    expect(readinessBlocked.status).toBe('blocked');
    expect(readinessBlocked.steps.find((step) => step.code === 'fixture_pilot')?.status).toBe(
      'skipped',
    );
    expect(approvalBlocked.status).toBe('blocked');
    expect(approvalBlocked.steps.find((step) => step.code === 'approval_history')?.status).toBe(
      'blocked',
    );
    expect(codexFailed.status).toBe('failed');
    expect(codexFailed.prActionStatus).toBe('blocked');
    expect(nxFailed.status).toBe('failed');
    expect(nxFailed.prActionStatus).toBe('blocked');
  });

  it('does not invoke the golden path fixture while readiness or approval is blocked', () => {
    const invokedScenarios: string[] = [];
    const goldenPathRunner = (input: { scenario: 'all-pass' | 'codex-failed' | 'nx-failed' }) => {
      invokedScenarios.push(input.scenario);
      return runGoldenPathRehearsal(input);
    };

    const readinessBlocked = runM10PilotAcceptanceRehearsal({
      scenario: 'readiness-blocked',
      goldenPathRunner,
    });
    const approvalBlocked = runM10PilotAcceptanceRehearsal({
      scenario: 'approval-blocked',
      goldenPathRunner,
    });
    const codexFailed = runM10PilotAcceptanceRehearsal({
      scenario: 'codex-failed',
      goldenPathRunner,
    });
    const nxFailed = runM10PilotAcceptanceRehearsal({
      scenario: 'nx-failed',
      goldenPathRunner,
    });

    expect(invokedScenarios).toEqual(['codex-failed', 'nx-failed']);
    expect(readinessBlocked.goldenPathRunId).toBe('golden_path_not_invoked');
    expect(approvalBlocked.goldenPathRunId).toBe('golden_path_not_invoked');
    expect(codexFailed.status).toBe('failed');
    expect(nxFailed.status).toBe('failed');
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

describe('orchestrator-kernel minimal governed orchestration', () => {
  it('blocks before adapter boundaries when authority and executable config are missing', async () => {
    let codexStarts = 0;
    let nxStarts = 0;
    const result = await runMinimalGovernedOrchestration({
      title: 'Run minimal governed orchestration',
      description: 'Should block before process boundaries.',
      dryRunId: 'codex_dry_run_1',
      worktreePath: process.cwd(),
      governedInput: createGovernedInputFixture(),
      codexRunner: {
        async start() {
          codexStarts += 1;
          return { exitCode: 0, stdout: '', stderr: '' };
        },
      },
      nxRunner: {
        async start() {
          nxStarts += 1;
          return { exitCode: 0, stdout: '', stderr: '' };
        },
      },
    });

    expect(result.run.status).toBe('blocked');
    expect(result.run.summary.processBoundaryInvoked).toBe(false);
    expect(result.run.summary.externalProcessStarted).toBe(false);
    expect(result.auditEvents[0]?.metadata?.liveExecution).toBe(false);
    expect(codexStarts).toBe(0);
    expect(nxStarts).toBe(0);
  });

  it('runs Codex then Nx with persisted approval and injected runners', async () => {
    let codexStarts = 0;
    let nxStarts = 0;
    const approvalStore = createApprovalStore();
    const result = await runMinimalGovernedOrchestration({
      title: 'Run minimal governed orchestration',
      description: 'Use governed Codex input and verify affected projects.',
      dryRunId: 'codex_dry_run_1',
      approvalArtifactId: 'approval_artifact_1',
      worktreePath: process.cwd(),
      allowedCwdRoots: [process.cwd()],
      governedInput: createGovernedInputFixture(),
      codexExecutablePath: 'codex-test',
      nxExecutablePath: 'pnpm-test',
      store: approvalStore,
      codexRunner: {
        async start() {
          codexStarts += 1;
          return { exitCode: 0, stdout: '{"type":"turn.completed"}\n', stderr: '' };
        },
      },
      nxRunner: {
        async start(plan: { step?: string }) {
          nxStarts += 1;
          return plan.step === 'affected-projects'
            ? { exitCode: 0, stdout: 'contracts\norchestrator-kernel\n', stderr: '' }
            : { exitCode: 0, stdout: 'Successfully ran target lint,test,build', stderr: '' };
        },
      },
    });

    expect(result.run.status).toBe('passed');
    expect(result.run.summary.codexStatus).toBe('passed');
    expect(result.run.summary.verificationStatus).toBe('passed');
    expect(result.run.summary.affectedProjectCount).toBe(2);
    expect(result.run.summary.commandResultCount).toBe(2);
    expect(result.run.summary.processBoundaryInvoked).toBe(true);
    expect(result.run.summary.externalProcessStarted).toBe(true);
    expect(result.run.summary.bodyStored).toBe(false);
    expect(result.run.summary.rawPathStored).toBe(false);
    expect(result.run.evidenceRefIds.length).toBeGreaterThan(0);
    expect(result.run.auditEventIds.length).toBeGreaterThan(0);
    expect(codexStarts).toBe(1);
    expect(nxStarts).toBe(2);
    expect(approvalStore.getSavedApprovalRecord()?.approvalArtifact?.status).toBe('used');
    expect(approvalStore.getSavedApprovalRecord()?.approvalArtifact?.usedAt).toBeDefined();
    expect(result.auditEvents.some((event) => event.action === 'orchestrator.approval.mark_used')).toBe(
      true,
    );
    expect(JSON.stringify(result.run)).not.toContain(process.cwd());
    expect(JSON.stringify(result.run)).not.toContain('Successfully ran target');
  });

  it('blocks reused single-use Codex approval artifacts', async () => {
    const approvalStore = createApprovalStore();
    const runInput = {
      title: 'Run minimal governed orchestration',
      description: 'Single-use approvals should be consumed.',
      dryRunId: 'codex_dry_run_1',
      approvalArtifactId: 'approval_artifact_1',
      worktreePath: process.cwd(),
      allowedCwdRoots: [process.cwd()],
      governedInput: createGovernedInputFixture(),
      codexExecutablePath: 'codex-test',
      nxExecutablePath: 'pnpm-test',
      store: approvalStore,
      codexRunner: {
        async start() {
          return { exitCode: 0, stdout: '{"type":"turn.completed"}\n', stderr: '' };
        },
      },
      nxRunner: {
        async start(plan: { step?: string }) {
          return plan.step === 'affected-projects'
            ? { exitCode: 0, stdout: 'contracts\n', stderr: '' }
            : { exitCode: 0, stdout: 'Successfully ran target lint,test,build', stderr: '' };
        },
      },
    };

    const firstResult = await runMinimalGovernedOrchestration(runInput);
    const secondResult = await runMinimalGovernedOrchestration(runInput);

    expect(firstResult.run.status).toBe('passed');
    expect(secondResult.run.status).toBe('blocked');
    expect(secondResult.policyDecisions[0]?.metadata?.approvalAuthorityReasonCodes).toContain(
      'approval_already_used',
    );
    expect(secondResult.run.summary.processBoundaryInvoked).toBe(false);
  });

  it('summarizes request metadata without preserving caller-provided raw values', async () => {
    const result = await runMinimalGovernedOrchestration({
      title: 'Run minimal governed orchestration',
      description: 'Metadata should be summarized only.',
      dryRunId: 'codex_dry_run_1',
      worktreePath: process.cwd(),
      governedInput: createGovernedInputFixture(),
      codexRunner: {
        async start() {
          return { exitCode: 0, stdout: '', stderr: '' };
        },
      },
      metadata: {
        bodyStored: true,
        rawPathStored: true,
        token: 'private-token',
        path: 'C:\\private\\workspace',
        nested: {
          authorization: 'Bearer secret',
        },
      },
    });

    expect(result.request.metadata?.bodyStored).toBe(false);
    expect(result.request.metadata?.rawPathStored).toBe(false);
    expect(result.request.metadata?.userMetadataProvided).toBe(true);
    expect(result.request.metadata?.userMetadataHash).toMatch(/^sha256:/);
    expect(JSON.stringify(result.request.metadata)).not.toContain('private-token');
    expect(JSON.stringify(result.request.metadata)).not.toContain('C:\\private\\workspace');
    expect(JSON.stringify(result.request.metadata)).not.toContain('Bearer secret');
  });

  it('does not run Nx when Codex fails', async () => {
    let nxStarts = 0;
    const result = await runMinimalGovernedOrchestration({
      title: 'Run minimal governed orchestration',
      description: 'Codex failure should stop verification.',
      dryRunId: 'codex_dry_run_1',
      approvalArtifactId: 'approval_artifact_1',
      worktreePath: process.cwd(),
      allowedCwdRoots: [process.cwd()],
      governedInput: createGovernedInputFixture(),
      codexExecutablePath: 'codex-test',
      nxExecutablePath: 'pnpm-test',
      store: createApprovalStore(),
      codexRunner: {
        async start() {
          return { exitCode: 1, stdout: '', stderr: 'failed without body persistence' };
        },
      },
      nxRunner: {
        async start() {
          nxStarts += 1;
          return { exitCode: 0, stdout: '', stderr: '' };
        },
      },
    });

    expect(result.run.status).toBe('failed');
    expect(result.run.summary.codexStatus).toBe('failed');
    expect(result.run.summary.verificationStatus).toBeUndefined();
    expect(nxStarts).toBe(0);
  });

  it('marks orchestration failed when Nx verification fails', async () => {
    const result = await runMinimalGovernedOrchestration({
      title: 'Run minimal governed orchestration',
      description: 'Failed verification should fail the run.',
      dryRunId: 'codex_dry_run_1',
      approvalArtifactId: 'approval_artifact_1',
      worktreePath: process.cwd(),
      allowedCwdRoots: [process.cwd()],
      governedInput: createGovernedInputFixture(),
      codexExecutablePath: 'codex-test',
      nxExecutablePath: 'pnpm-test',
      store: createApprovalStore(),
      codexRunner: {
        async start() {
          return { exitCode: 0, stdout: '{"type":"turn.completed"}\n', stderr: '' };
        },
      },
      nxRunner: {
        async start(plan: { step?: string }) {
          return plan.step === 'affected-projects'
            ? { exitCode: 0, stdout: 'contracts\n', stderr: '' }
            : { exitCode: 1, stdout: '', stderr: 'verification failed' };
        },
      },
    });

    expect(result.run.status).toBe('failed');
    expect(result.run.summary.codexStatus).toBe('passed');
    expect(result.run.summary.verificationStatus).toBe('failed');
  });

  it('rejects request-body authority artifacts before adapter execution', async () => {
    let codexStarts = 0;
    const result = await runMinimalGovernedOrchestration({
      title: 'Run minimal governed orchestration',
      description: 'Untrusted authority object should block.',
      dryRunId: 'codex_dry_run_1',
      approvalArtifactId: 'approval_artifact_1',
      worktreePath: process.cwd(),
      governedInput: createGovernedInputFixture(),
      codexExecutablePath: 'codex-test',
      store: createApprovalStore(),
      approvalArtifact: { id: 'untrusted' },
      codexRunner: {
        async start() {
          codexStarts += 1;
          return { exitCode: 0, stdout: '', stderr: '' };
        },
      },
    });

    expect(result.run.status).toBe('blocked');
    expect(result.run.timeline.at(-1)?.summary).toContain('untrusted_approval_artifact_body');
    expect(result.run.summary.processBoundaryInvoked).toBe(false);
    expect(result.auditEvents[0]?.metadata?.liveExecution).toBe(false);
    expect(codexStarts).toBe(0);
  });
});

describe('orchestrator-kernel M6a controlled worktree PR draft foundation', () => {
  it('produces a ready PR draft after fixture worktree, Codex, and Nx pass', async () => {
    const result = await runM6aControlledWorktreePrDraft({
      title: 'Prepare controlled patch draft',
      description: 'Use fixture worktree metadata and injected adapter runners.',
      dryRunId: 'codex_dry_run_1',
      approvalArtifactId: 'approval_artifact_1',
      repoRoot: process.cwd(),
      worktreeSlug: 'feature-m6a',
      branchName: 'codex/feature-m6a',
      governedInput: createGovernedInputFixture(),
      codexExecutablePath: 'codex-test',
      nxExecutablePath: 'pnpm-test',
      store: createApprovalStore(),
      worktreeRunner: {
        async run() {
          return {
            status: 'completed',
            changedFiles: ['packages/orchestrator-kernel/src/m6a-runner.ts'],
            diffText: 'diff --git a/packages/orchestrator-kernel/src/m6a-runner.ts',
          };
        },
      },
      codexRunner: {
        async start() {
          return { exitCode: 0, stdout: '{"type":"turn.completed"}\n', stderr: '' };
        },
      },
      nxRunner: {
        async start(plan: { step?: string }) {
          return plan.step === 'affected-projects'
            ? { exitCode: 0, stdout: 'orchestrator-kernel\n', stderr: '' }
            : { exitCode: 0, stdout: 'Successfully ran target lint,test,build', stderr: '' };
        },
      },
    });

    expect(result.status).toBe('ready');
    expect(result.patchRun.status).toBe('verified');
    expect(result.pullRequestDraft.status).toBe('ready');
    expect(result.releaseAuditDraft.status).toBe('ready');
    expect(result.summary.noRealGitBoundary).toBe(true);
    expect(result.worktree.capabilityResult.processBoundaryInvoked).toBe(false);
    expect(result.minimalRun?.run.status).toBe('passed');
    expect(result.evidenceRefs.map((ref) => ref.kind)).toEqual(
      expect.arrayContaining(['worktree.plan', 'patch.diff_summary', 'pr.draft_summary']),
    );
    const serialized = JSON.stringify(result);
    expect(serialized).not.toContain('diff --git');
    expect(serialized).not.toContain(process.cwd());
  });

  it('blocks PR draft readiness when Codex fails and does not run Nx', async () => {
    let nxStarts = 0;
    const result = await runM6aControlledWorktreePrDraft({
      title: 'Prepare controlled patch draft',
      description: 'Codex failure should block PR readiness.',
      dryRunId: 'codex_dry_run_1',
      approvalArtifactId: 'approval_artifact_1',
      repoRoot: process.cwd(),
      worktreeSlug: 'feature-m6a',
      branchName: 'codex/feature-m6a',
      governedInput: createGovernedInputFixture(),
      codexExecutablePath: 'codex-test',
      nxExecutablePath: 'pnpm-test',
      store: createApprovalStore(),
      worktreeRunner: {
        async run() {
          return {
            status: 'completed',
            changedFiles: ['packages/orchestrator-kernel/src/m6a-runner.ts'],
          };
        },
      },
      codexRunner: {
        async start() {
          return { exitCode: 1, stdout: '', stderr: 'codex failed' };
        },
      },
      nxRunner: {
        async start() {
          nxStarts += 1;
          return { exitCode: 0, stdout: '', stderr: '' };
        },
      },
    });

    expect(result.status).toBe('failed');
    expect(result.pullRequestDraft.status).toBe('blocked');
    expect(result.releaseAuditDraft.status).toBe('blocked');
    expect(nxStarts).toBe(0);
  });

  it('blocks PR draft readiness when Nx verification fails', async () => {
    const result = await runM6aControlledWorktreePrDraft({
      title: 'Prepare controlled patch draft',
      description: 'Verification failure should block PR readiness.',
      dryRunId: 'codex_dry_run_1',
      approvalArtifactId: 'approval_artifact_1',
      repoRoot: process.cwd(),
      worktreeSlug: 'feature-m6a',
      branchName: 'codex/feature-m6a',
      governedInput: createGovernedInputFixture(),
      codexExecutablePath: 'codex-test',
      nxExecutablePath: 'pnpm-test',
      store: createApprovalStore(),
      worktreeRunner: {
        async run() {
          return {
            status: 'completed',
            changedFiles: ['packages/orchestrator-kernel/src/m6a-runner.ts'],
          };
        },
      },
      codexRunner: {
        async start() {
          return { exitCode: 0, stdout: '{"type":"turn.completed"}\n', stderr: '' };
        },
      },
      nxRunner: {
        async start(plan: { step?: string }) {
          return plan.step === 'affected-projects'
            ? { exitCode: 0, stdout: 'orchestrator-kernel\n', stderr: '' }
            : { exitCode: 1, stdout: '', stderr: 'verification failed' };
        },
      },
    });

    expect(result.status).toBe('failed');
    expect(result.summary.verificationStatus).toBe('failed');
    expect(result.pullRequestDraft.status).toBe('blocked');
  });

  it('rejects request-body authority and approval objects before adapter execution', async () => {
    let codexStarts = 0;
    const result = await runM6aControlledWorktreePrDraft({
      title: 'Prepare controlled patch draft',
      description: 'Untrusted request-body authority should block M6a.',
      dryRunId: 'codex_dry_run_1',
      approvalArtifactId: 'approval_artifact_1',
      repoRoot: process.cwd(),
      worktreeSlug: 'feature-m6a',
      branchName: 'codex/feature-m6a',
      governedInput: createGovernedInputFixture(),
      codexExecutablePath: 'codex-test',
      nxExecutablePath: 'pnpm-test',
      store: createApprovalStore(),
      approvalArtifact: { id: 'untrusted' },
      executionAuthority: { allowed: true },
      worktreeRunner: {
        async run() {
          return { status: 'completed' };
        },
      },
      codexRunner: {
        async start() {
          codexStarts += 1;
          return { exitCode: 0, stdout: '', stderr: '' };
        },
      },
      nxRunner: {
        async start() {
          return { exitCode: 0, stdout: '', stderr: '' };
        },
      },
    });

    expect(result.status).toBe('blocked');
    expect(result.summary.blockReasons).toEqual(
      expect.arrayContaining([
        'untrusted_execution_authority_body',
        'untrusted_approval_artifact_body',
      ]),
    );
    expect(result.summary.processBoundaryInvoked).toBe(false);
    expect(result.pullRequestDraft.status).toBe('blocked');
    expect(codexStarts).toBe(0);
  });

  it('runs M6b controlled git metadata into the governed Codex/Nx loop', async () => {
    const worktreeRoot = mkdtempSync(join(tmpdir(), 'codexhub-m6b-worktrees-'));
    const worktreePath = resolve(worktreeRoot, 'feature-m6b');
    mkdirSync(worktreePath, { recursive: true });
    writeFileSync(
      resolve(worktreePath, 'package.json'),
      readFileSync(resolve(process.cwd(), 'package.json'), 'utf8'),
    );
    const result = await runM6bGovernedWorktreePrDraft({
      title: 'Prepare M6b controlled patch draft',
      description: 'Use injected controlled git, Codex, and Nx runners.',
      dryRunId: 'codex_dry_run_1',
      approvalArtifactId: 'approval_artifact_1',
      repoRoot: process.cwd(),
      worktreeRoot,
      worktreePath,
      worktreeSlug: 'feature-m6b',
      branchName: 'codex/feature-m6b',
      baseRef: 'HEAD',
      allowedWorktreeRoots: [worktreeRoot],
      realGitBoundaryEnabled: true,
      governedInput: createGovernedInputFixture(),
      codexExecutablePath: 'codex-test',
      nxExecutablePath: 'pnpm-test',
      store: createApprovalStore(),
      worktreeRunner: {
        async run() {
          return {
            status: 'completed',
            changedFiles: ['packages/orchestrator-kernel/src/m6b-runner.ts'],
            diffHash: 'sha256:diff',
            diffLineCount: 6,
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
      codexRunner: {
        async start() {
          return { exitCode: 0, stdout: '{"type":"turn.completed"}\n', stderr: '' };
        },
      },
      nxRunner: {
        async start(plan: { step?: string }) {
          return plan.step === 'affected-projects'
            ? { exitCode: 0, stdout: 'orchestrator-kernel\n', stderr: '' }
            : { exitCode: 0, stdout: 'Successfully ran target lint,test,build', stderr: '' };
        },
      },
    });

    expect(result.status).toBe('ready');
    expect(result.summary.noRealWrite).toBe(false);
    expect(result.summary.gitProcessBoundaryInvoked).toBe(true);
    expect(result.summary.cleanupRequired).toBe(true);
    expect(result.pullRequestDraft.status).toBe('ready');
    expect(result.patchRun.status).toBe('verified');
    const serialized = JSON.stringify(result);
    expect(serialized).not.toContain(worktreePath);
    expect(serialized).not.toContain('diff --git');
  });

  it('does not import child_process in the M6a runner or worktree manager', () => {
    const repoRootForSourceScan = resolve(process.cwd(), '../..');
    const m6aRunner = readFileSync(
      resolve(repoRootForSourceScan, 'packages/orchestrator-kernel/src/m6a-runner.ts'),
      'utf8',
    );
    const worktreeSources = [
      'packages/worktree-manager/src/execute.ts',
      'packages/worktree-manager/src/plan.ts',
      'packages/worktree-manager/src/index.ts',
    ]
      .map((file) => readFileSync(resolve(repoRootForSourceScan, file), 'utf8'))
      .join('\n');

    expect(m6aRunner).not.toContain('child_process');
    expect(worktreeSources).not.toContain('child_process');
  });
});

describe('orchestrator-kernel M9 local pilot', () => {
  it('runs controlled worktree, Codex dry-run, and Nx verification with metadata-only output', async () => {
    const worktreeRoot = mkdtempSync(join(tmpdir(), 'codexhub-m9-worktrees-'));
    const worktreePath = resolve(worktreeRoot, 'pilot-m9');
    mkdirSync(worktreePath, { recursive: true });
    writeFileSync(
      resolve(worktreePath, 'package.json'),
      readFileSync(resolve(process.cwd(), 'package.json'), 'utf8'),
    );

    const result = await runM9LocalPilot({
      title: 'M9 local pilot',
      description: 'Run controlled worktree plus read-only Codex and Nx.',
      repoRoot: process.cwd(),
      worktreeRoot,
      worktreePath,
      worktreeSlug: 'pilot-m9',
      branchName: 'codex/pilot-m9',
      baseRef: 'HEAD',
      allowedWorktreeRoots: [worktreeRoot],
      codexDryRunId: 'codex_dry_run_1',
      worktreeApprovalArtifactId: 'worktree_approval_1',
      codexApprovalArtifactId: 'approval_artifact_1',
      worktreeApprovalResolved: true,
      pilotEnabled: true,
      realGitBoundaryEnabled: true,
      governedInput: createGovernedInputFixture(),
      codexExecutablePath: 'codex-test',
      nxExecutablePath: 'pnpm-test',
      store: createApprovalStore(),
      worktreeRunner: {
        async run() {
          return {
            status: 'completed',
            changedFiles: [],
            diffHash: 'sha256:no-diff',
            diffLineCount: 0,
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
      codexRunner: {
        async start() {
          return { exitCode: 0, stdout: '{"type":"turn.completed"}\n', stderr: '' };
        },
      },
      nxRunner: {
        async start(plan: { step?: string }) {
          return plan.step === 'affected-projects'
            ? { exitCode: 0, stdout: 'orchestrator-kernel\n', stderr: '' }
            : { exitCode: 0, stdout: 'Successfully ran target lint,test,build', stderr: '' };
        },
      },
    });

    const serialized = JSON.stringify(result.run);
    expect(result.run.status).toBe('passed');
    expect(result.run.prDraftStatus).toBe('blocked_no_patch');
    expect(result.run.changedFileCount).toBe(0);
    expect(result.run.gitProcessBoundaryInvoked).toBe(true);
    expect(result.run.codexProcessBoundaryInvoked).toBe(true);
    expect(result.run.nxProcessBoundaryInvoked).toBe(true);
    expect(result.run.codexNoRealWrite).toBe(true);
    expect(result.run.pushAllowed).toBe(false);
    expect(result.run.pullRequestOpened).toBe(false);
    expect(serialized).not.toContain(worktreePath);
    expect(serialized).not.toContain('diff --git');
    expect(serialized).not.toContain('raw prompt');
    expect(serialized).not.toContain('stdout');
  });

  it('blocks before boundaries when approval authority is not store-resolved', async () => {
    const result = await runM9LocalPilot({
      title: 'M9 blocked pilot',
      description: 'Missing store-resolved approval must block.',
      repoRoot: process.cwd(),
      worktreeRoot: resolve(process.cwd(), '..', 'CodexHub-worktrees'),
      worktreePath: resolve(process.cwd(), '..', 'CodexHub-worktrees', 'pilot-m9'),
      worktreeSlug: 'pilot-m9',
      branchName: 'codex/pilot-m9',
      baseRef: 'HEAD',
      codexDryRunId: 'codex_dry_run_1',
      worktreeApprovalArtifactId: 'worktree_approval_1',
      codexApprovalArtifactId: 'approval_artifact_1',
      worktreeApprovalResolved: false,
      pilotEnabled: true,
      realGitBoundaryEnabled: true,
      governedInput: createGovernedInputFixture(),
      store: createApprovalStore(),
    });

    expect(result.run.status).toBe('blocked');
    expect(result.run.readiness.blockers).toContain('worktree_approval_not_store_resolved');
    expect(result.run.processBoundaryInvoked).toBe(false);
    expect(result.run.externalProcessStarted).toBe(false);
  });

  it('fails the pilot and keeps PR draft blocked when Codex dry-run fails', async () => {
    const result = await runM9PilotFixture({
      codexExitCode: 1,
      codexStdout: '{"type":"error","message":"fixture failure"}\n',
    });

    expect(result.run.status).toBe('failed');
    expect(result.run.codexStatus).toBe('failed');
    expect(result.run.verificationStatus).toBeUndefined();
    expect(result.run.prDraftStatus).toBe('blocked_no_patch');
    expect(result.run.codexNoRealWrite).toBe(true);
    expect(result.run.pushAllowed).toBe(false);
    expect(result.run.pullRequestOpened).toBe(false);
  });

  it('fails the pilot and keeps PR draft blocked when Nx verification fails', async () => {
    const result = await runM9PilotFixture({
      nxCommandExitCode: 1,
      nxCommandStdout: 'Failed tasks: lint',
    });

    expect(result.run.status).toBe('failed');
    expect(result.run.codexStatus).toBe('passed');
    expect(result.run.verificationStatus).toBe('failed');
    expect(result.run.prDraftStatus).toBe('blocked_no_patch');
    expect(result.run.nxProcessBoundaryInvoked).toBe(true);
    expect(result.run.pushAllowed).toBe(false);
    expect(result.run.pullRequestOpened).toBe(false);
  });
});

describe('orchestrator-kernel M11 production pilot narrow path', () => {
  it('runs the narrow path with Codex read-only and no patch-ready PR state', async () => {
    const result = await runM11PilotFixture();
    const serialized = JSON.stringify(result.run);

    expect(result.run.status).toBe('passed');
    expect(result.run.prDraftStatus).toBe('not_ready_no_patch');
    expect(result.run.changedFileCount).toBe(0);
    expect(result.run.codexNoRealWrite).toBe(true);
    expect(result.run.codexReadOnlyDryRunOnly).toBe(true);
    expect(result.run.patchGenerationAllowed).toBe(false);
    expect(result.run.pushAllowed).toBe(false);
    expect(result.run.pullRequestOpened).toBe(false);
    expect(result.run.failureSummary.classification).toBe('none');
    expect(result.run.gitProcessBoundaryInvoked).toBe(true);
    expect(result.run.codexProcessBoundaryInvoked).toBe(true);
    expect(result.run.nxProcessBoundaryInvoked).toBe(true);
    expect(result.run.steps.some((step) => step.phase === 'projection')).toBe(true);
    expect(serialized).not.toContain('diff --git');
    expect(serialized).not.toContain('raw prompt');
    expect(serialized).not.toContain('stdout');
    expect(serialized).not.toContain('stderr');
  });

  it('blocks before boundaries when M11 readiness or approval authority is missing', async () => {
    const result = await runM11ProductionPilotNarrowPath({
      title: 'M11 blocked pilot',
      description: 'Missing persisted approval must block the narrow path.',
      repoRoot: process.cwd(),
      worktreeRoot: resolve(process.cwd(), '..', 'CodexHub-worktrees'),
      worktreePath: resolve(process.cwd(), '..', 'CodexHub-worktrees', 'pilot-m11'),
      worktreeSlug: 'pilot-m11',
      branchName: 'codex/pilot-m11',
      baseRef: 'HEAD',
      codexDryRunId: 'codex_dry_run_1',
      worktreeApprovalArtifactId: 'worktree_approval_1',
      codexApprovalArtifactId: 'approval_artifact_1',
      worktreeApprovalResolved: false,
      m11PilotEnabled: true,
      realGitBoundaryEnabled: true,
      governedInput: createGovernedInputFixture(),
      store: createApprovalStore(),
    });

    expect(result.run.status).toBe('blocked');
    expect(result.run.readiness.blockers).toContain('worktree_approval_not_store_resolved');
    expect(result.run.failureSummary.classification).toBe('approval_blocked');
    expect(result.run.processBoundaryInvoked).toBe(false);
    expect(result.run.externalProcessStarted).toBe(false);
    expect(result.run.prDraftStatus).toBe('blocked');
  });

  it('classifies Codex and Nx failures without marking the PR draft ready', async () => {
    const codexFailed = await runM11PilotFixture({
      codexExitCode: 1,
      codexStdout: '{"type":"error","message":"fixture failure"}\n',
    });
    const nxFailed = await runM11PilotFixture({
      nxCommandExitCode: 1,
      nxCommandStdout: 'Failed tasks: lint',
    });

    expect(codexFailed.run.status).toBe('failed');
    expect(codexFailed.run.failureSummary.classification).toBe('codex_failed');
    expect(codexFailed.run.prDraftStatus).toBe('blocked');
    expect(nxFailed.run.status).toBe('failed');
    expect(nxFailed.run.failureSummary.classification).toBe('nx_failed');
    expect(nxFailed.run.prDraftStatus).toBe('blocked');
  });
});

function createGovernedInputFixture() {
  const relativePath = 'package.json';
  const text = readFileSync(resolve(process.cwd(), relativePath), 'utf8');

  return {
    relativePath,
    expectedContentHash: `sha256:${hashText(text)}`,
  };
}

async function runM9PilotFixture(overrides: {
  codexExitCode?: number;
  codexStdout?: string;
  nxCommandExitCode?: number;
  nxCommandStdout?: string;
} = {}) {
  const worktreeRoot = mkdtempSync(join(tmpdir(), 'codexhub-m9-hardening-worktrees-'));
  const worktreePath = resolve(worktreeRoot, 'pilot-m9-hardening');
  mkdirSync(worktreePath, { recursive: true });
  writeFileSync(
    resolve(worktreePath, 'package.json'),
    readFileSync(resolve(process.cwd(), 'package.json'), 'utf8'),
  );

  const input: M9LocalPilotInput = {
    title: 'M9 hardened pilot fixture',
    description: 'Exercise M9 failure paths without raw output.',
    repoRoot: process.cwd(),
    worktreeRoot,
    worktreePath,
    worktreeSlug: 'pilot-m9-hardening',
    branchName: 'codex/pilot-m9-hardening',
    baseRef: 'HEAD',
    allowedWorktreeRoots: [worktreeRoot],
    codexDryRunId: 'codex_dry_run_1',
    worktreeApprovalArtifactId: 'worktree_approval_1',
    codexApprovalArtifactId: 'approval_artifact_1',
    worktreeApprovalResolved: true,
    pilotEnabled: true,
    realGitBoundaryEnabled: true,
    governedInput: createGovernedInputFixture(),
    codexExecutablePath: 'codex-test',
    nxExecutablePath: 'pnpm-test',
    store: createApprovalStore(),
    worktreeRunner: {
      async run() {
        return {
          status: 'completed',
          changedFiles: [],
          diffHash: 'sha256:no-diff',
          diffLineCount: 0,
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
    codexRunner: {
      async start() {
        return {
          exitCode: overrides.codexExitCode ?? 0,
          stdout: overrides.codexStdout ?? '{"type":"turn.completed"}\n',
          stderr: '',
        };
      },
    },
    nxRunner: {
      async start(plan: { step?: string }) {
        return plan.step === 'affected-projects'
          ? { exitCode: 0, stdout: 'orchestrator-kernel\n', stderr: '' }
          : {
              exitCode: overrides.nxCommandExitCode ?? 0,
              stdout: overrides.nxCommandStdout ?? 'Successfully ran target lint,test,build',
              stderr: '',
            };
      },
    },
  };

  return runM9LocalPilot(input);
}

async function runM11PilotFixture(overrides: {
  codexExitCode?: number;
  codexStdout?: string;
  nxCommandExitCode?: number;
  nxCommandStdout?: string;
} = {}) {
  const worktreeRoot = mkdtempSync(join(tmpdir(), 'codexhub-m11-worktrees-'));
  const worktreePath = resolve(worktreeRoot, 'pilot-m11');
  mkdirSync(worktreePath, { recursive: true });
  writeFileSync(
    resolve(worktreePath, 'package.json'),
    readFileSync(resolve(process.cwd(), 'package.json'), 'utf8'),
  );

  return runM11ProductionPilotNarrowPath({
    title: 'M11 production pilot narrow path fixture',
    description: 'Exercise M11 narrow path without patch generation.',
    repoRoot: process.cwd(),
    worktreeRoot,
    worktreePath,
    worktreeSlug: 'pilot-m11',
    branchName: 'codex/pilot-m11',
    baseRef: 'HEAD',
    allowedWorktreeRoots: [worktreeRoot],
    codexDryRunId: 'codex_dry_run_1',
    worktreeApprovalArtifactId: 'worktree_approval_1',
    codexApprovalArtifactId: 'approval_artifact_1',
    worktreeApprovalResolved: true,
    m11PilotEnabled: true,
    realGitBoundaryEnabled: true,
    governedInput: createGovernedInputFixture(),
    codexExecutablePath: 'codex-test',
    nxExecutablePath: 'pnpm-test',
    store: createApprovalStore(),
    worktreeRunner: {
      async run() {
        return {
          status: 'completed',
          changedFiles: [],
          diffHash: 'sha256:no-diff',
          diffLineCount: 0,
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
    codexRunner: {
      async start() {
        return {
          exitCode: overrides.codexExitCode ?? 0,
          stdout: overrides.codexStdout ?? '{"type":"turn.completed"}\n',
          stderr: '',
        };
      },
    },
    nxRunner: {
      async start(plan: { step?: string }) {
        return plan.step === 'affected-projects'
          ? { exitCode: 0, stdout: 'orchestrator-kernel\n', stderr: '' }
          : {
              exitCode: overrides.nxCommandExitCode ?? 0,
              stdout: overrides.nxCommandStdout ?? 'Successfully ran target lint,test,build',
              stderr: '',
            };
      },
    },
  });
}

function createApprovalStore(): CodexHubStore & {
  getSavedApprovalRecord(): CodexExecManualApprovalRecord | undefined;
} {
  const expiresAt = new Date(Date.now() + 60_000).toISOString();
  let currentRecord: CodexExecManualApprovalRecord | undefined =
    createApprovalRecordFixture(expiresAt);

  return {
    codexExecApprovals: {
      async getCodexExecApprovalRecordByArtifactId() {
        return currentRecord;
      },
      async saveCodexExecApprovalRecord(record: CodexExecManualApprovalRecord) {
        currentRecord = record;
        return record;
      },
    },
    evidenceRefs: {
      async create(ref: EvidenceRef) {
        return ref;
      },
    },
    auditEvents: {
      async append(event: AuditEvent) {
        return event;
      },
    },
    async close() {},
    getSavedApprovalRecord() {
      return currentRecord;
    },
  } as unknown as CodexHubStore & {
    getSavedApprovalRecord(): CodexExecManualApprovalRecord | undefined;
  };
}

function createApprovalRecordFixture(expiresAt: string): CodexExecManualApprovalRecord {
  const schemaVersion = '2026-04-28.foundation';
  const createdAt = '2026-04-28T00:00:00.000Z';
  const safetyFlags = {
    liveExecution: false,
    externalProcessStarted: false,
    executionDisabled: true,
  } as const;

  return {
    id: 'approval_record_1',
    schemaVersion,
    createdAt,
    request: {
      id: 'approval_request_1',
      schemaVersion,
      createdAt,
      dryRunPlanId: 'codex_dry_run_1',
      dryRunPlanHash: 'sha256:dry-run',
      policyDecisionId: 'policy_approved_1',
      policyDecisionHash: 'sha256:policy',
      scope: 'read_only_plan',
      status: 'approved',
      riskLevel: 'high',
      requestedBy: 'test',
      reason: 'Approve test Codex run.',
      expiresAt,
      singleUse: true,
      summary: 'Approved test request.',
      ...safetyFlags,
    },
    decision: {
      id: 'approval_decision_1',
      schemaVersion,
      createdAt,
      approvalRequestId: 'approval_request_1',
      dryRunPlanId: 'codex_dry_run_1',
      policyDecisionId: 'policy_approved_1',
      outcome: 'approved',
      decidedBy: 'test',
      reasonSummary: 'Approved fixture.',
      decisionHash: 'sha256:decision',
      approved: true,
      approvalArtifactId: 'approval_artifact_1',
      summary: 'Approved test decision.',
      ...safetyFlags,
    },
    approvalArtifact: {
      id: 'approval_artifact_1',
      schemaVersion,
      createdAt,
      dryRunPlanId: 'codex_dry_run_1',
      dryRunPlanHash: 'sha256:dry-run',
      policyDecisionId: 'policy_approved_1',
      policyDecisionHash: 'sha256:policy',
      scope: 'read_only_plan',
      status: 'approved',
      expiresAt,
      singleUse: true,
      revoked: false,
      summary: 'Approved test artifact.',
      ...safetyFlags,
    },
    status: 'approved',
    evidenceRefs: [],
    auditEventIds: [],
    summary: 'Approved test record.',
    ...safetyFlags,
  };
}

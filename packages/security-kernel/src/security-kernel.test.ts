import { describe, expect, it } from 'vitest';
import { evaluateAction } from './index';

describe('security-kernel policy evaluation', () => {
  it('allows read-only low-risk actions by default', () => {
    const decision = evaluateAction({
      actionId: 'read-health',
      actionType: 'supervisor.health.read',
      actionMode: 'read',
    });

    expect(decision.outcome).toBe('allow');
    expect(decision.requiresDryRun).toBe(false);
  });

  it('denies write actions that have not completed dry-run', () => {
    const decision = evaluateAction({
      actionId: 'write-patch',
      actionType: 'workspace.patch.write',
      actionMode: 'write',
    });

    expect(decision.outcome).toBe('deny');
    expect(decision.requiresDryRun).toBe(true);
  });

  it('requires approval for real medium write actions after dry-run', () => {
    const realWriteDecision = evaluateAction({
      actionId: 'write-patch',
      actionType: 'workspace.patch.write',
      actionMode: 'write',
      dryRun: true,
    });
    const mockWriteDecision = evaluateAction({
      actionId: 'write-patch-dry-run',
      actionType: 'workspace.patch.dry_run',
      actionMode: 'write',
      dryRun: true,
      metadata: {
        noRealWrite: true,
      },
    });

    expect(realWriteDecision.riskLevel).toBe('medium');
    expect(realWriteDecision.outcome).toBe('approval_required');
    expect(realWriteDecision.requiresApproval).toBe(true);
    expect(mockWriteDecision.outcome).toBe('allow');
    expect(mockWriteDecision.requiresApproval).toBe(false);
  });

  it('allows dry-run action mode without approval when no real write is represented', () => {
    const decision = evaluateAction({
      actionId: 'patch-dry-run',
      actionType: 'workspace.patch.plan',
      actionMode: 'dry-run',
      riskLevel: 'medium',
      dryRun: true,
      metadata: {
        noRealWrite: true,
      },
    });

    expect(decision.outcome).toBe('allow');
    expect(decision.requiresDryRun).toBe(false);
    expect(decision.requiresApproval).toBe(false);
  });

  it('denies dry-run action mode when metadata represents a real write', () => {
    const decision = evaluateAction({
      actionId: 'patch-dry-run-real-write',
      actionType: 'workspace.patch.plan',
      actionMode: 'dry-run',
      riskLevel: 'medium',
      dryRun: true,
      metadata: {
        realWrite: true,
      },
    });

    expect(decision.outcome).toBe('deny');
    expect(decision.reasons.join(' ')).toContain('must not represent a real write');
  });

  it('requires approval for admin action mode by default', () => {
    const decision = evaluateAction({
      actionId: 'policy-admin',
      actionType: 'policy.backend.configure',
      actionMode: 'admin',
      riskLevel: 'medium',
      dryRun: true,
    });

    expect(decision.outcome).toBe('approval_required');
    expect(decision.requiresApproval).toBe(true);
  });

  it('allows mock no-real-write write actions after dry-run', () => {
    const decision = evaluateAction({
      actionId: 'mock-write',
      actionType: 'development.mock.write',
      actionMode: 'write',
      riskLevel: 'medium',
      dryRun: true,
      metadata: {
        mockOnly: true,
        noRealWrite: true,
        dryRunOnly: true,
      },
    });

    expect(decision.outcome).toBe('allow');
    expect(decision.requiresApproval).toBe(false);
  });

  it('requires approval for high-risk browser input placeholders', () => {
    const decision = evaluateAction({
      actionId: 'browser-input',
      actionType: 'browser.input.placeholder',
      actionMode: 'read',
    });

    expect(decision.riskLevel).toBe('high');
    expect(decision.outcome).toBe('approval_required');
  });

  it('blocks codex live intents when the dry-run plan is missing', () => {
    const decision = evaluateAction({
      actionId: 'codex-dry-run',
      actionType: 'codex.exec.live.intent',
      actionMode: 'read',
      riskLevel: 'medium',
      dryRun: false,
      metadata: {
        sandboxMode: 'read_only',
        approvalMode: 'required',
        dryRunPlanPresent: false,
        liveAdapterEnabled: true,
      },
    });

    expect(decision.outcome).toBe('deny');
    expect(decision.requiresDryRun).toBe(true);
  });

  it('keeps codex live intents blocked unless explicitly enabled', () => {
    const decision = evaluateAction({
      actionId: 'codex-disabled',
      actionType: 'codex.exec.live.intent',
      actionMode: 'read',
      riskLevel: 'medium',
      dryRun: true,
      metadata: {
        sandboxMode: 'read_only',
        approvalMode: 'required',
        dryRunPlanPresent: true,
        liveAdapterEnabled: false,
      },
    });

    expect(decision.outcome).toBe('deny');
    expect(decision.reasons.join(' ')).toContain('disabled');
  });

  it('requires approval for workspace write and full access codex modes', () => {
    const workspaceDecision = evaluateAction({
      actionId: 'codex-workspace-write',
      actionType: 'codex.exec.live.intent',
      actionMode: 'write',
      riskLevel: 'high',
      dryRun: true,
      metadata: {
        sandboxMode: 'workspace_write',
        approvalMode: 'on_request',
        dryRunPlanPresent: true,
        liveAdapterEnabled: true,
      },
    });
    const fullAccessDecision = evaluateAction({
      actionId: 'codex-full-access',
      actionType: 'codex.exec.live.intent',
      actionMode: 'write',
      riskLevel: 'critical',
      dryRun: true,
      metadata: {
        sandboxMode: 'danger_full_access',
        approvalMode: 'required',
        dryRunPlanPresent: true,
        liveAdapterEnabled: true,
      },
    });

    expect(workspaceDecision.riskLevel).toBe('high');
    expect(workspaceDecision.outcome).toBe('approval_required');
    expect(fullAccessDecision.riskLevel).toBe('critical');
    expect(fullAccessDecision.outcome).toBe('approval_required');
  });

  it('blocks prompts with guarded keywords when the adapter is enabled', () => {
    const decision = evaluateAction({
      actionId: 'codex-guarded-prompt',
      actionType: 'codex.exec.live.intent',
      actionMode: 'read',
      riskLevel: 'medium',
      dryRun: true,
      metadata: {
        sandboxMode: 'read_only',
        approvalMode: 'on_request',
        dryRunPlanPresent: true,
        liveAdapterEnabled: true,
        guardedPromptMatch: true,
        syntheticKeyword: ['to', 'ken'].join(''),
      },
    });

    expect(decision.outcome).toBe('deny');
  });

  it('blocks execution gate when config or approval state is invalid', () => {
    const decision = evaluateAction({
      actionId: 'codex-gate',
      actionType: 'codex.exec.execution.gate',
      actionMode: 'read',
      riskLevel: 'medium',
      dryRun: true,
      metadata: {
        sandboxMode: 'read_only',
        liveEnabled: false,
        dryRunPlanHashMatches: true,
        policyDecisionHashMatches: true,
        approvalExpired: false,
        approvalRevoked: false,
        approvalUsed: false,
      },
    });

    expect(decision.outcome).toBe('deny');
    expect(decision.reasons.join(' ')).toContain('disabled');
  });

  it('blocks execution gate for hash mismatch and invalid approval artifact state', () => {
    const decision = evaluateAction({
      actionId: 'codex-gate-invalid-approval',
      actionType: 'codex.exec.execution.gate',
      actionMode: 'read',
      riskLevel: 'medium',
      dryRun: true,
      metadata: {
        sandboxMode: 'read_only',
        liveEnabled: true,
        dryRunPlanHashMatches: false,
        policyDecisionHashMatches: false,
        approvalExpired: true,
        approvalRevoked: true,
        approvalUsed: true,
      },
    });

    expect(decision.outcome).toBe('deny');
    expect(decision.reasons.join(' ')).toContain('hash mismatch');
    expect(decision.reasons.join(' ')).toContain('expired');
    expect(decision.reasons.join(' ')).toContain('revoked');
    expect(decision.reasons.join(' ')).toContain('already used');
  });

  it('blocks execution gate for workspace write without isolated worktree and full access', () => {
    const workspaceDecision = evaluateAction({
      actionId: 'codex-gate-workspace',
      actionType: 'codex.exec.execution.gate',
      actionMode: 'write',
      riskLevel: 'high',
      dryRun: true,
      metadata: {
        sandboxMode: 'workspace_write',
        liveEnabled: true,
        isolatedWorktreePresent: false,
      },
    });
    const fullAccessDecision = evaluateAction({
      actionId: 'codex-gate-full-access',
      actionType: 'codex.exec.execution.gate',
      actionMode: 'write',
      riskLevel: 'critical',
      dryRun: true,
      metadata: {
        sandboxMode: 'danger_full_access',
        liveEnabled: true,
      },
    });

    expect(workspaceDecision.outcome).toBe('deny');
    expect(workspaceDecision.reasons.join(' ')).toContain('isolated worktree');
    expect(fullAccessDecision.outcome).toBe('deny');
    expect(fullAccessDecision.reasons.join(' ')).toContain('danger_full_access');
  });

  it('allows manual approval records only when hashes are present and no live path starts', () => {
    const allowed = evaluateAction({
      actionId: 'manual-approval',
      actionType: 'codex.exec.manual.approval',
      actionMode: 'read',
      riskLevel: 'medium',
      dryRun: true,
      metadata: {
        dryRunPlanHashPresent: true,
        policyDecisionHashPresent: true,
        liveExecution: false,
        externalProcessStarted: false,
      },
    });
    const denied = evaluateAction({
      actionId: 'manual-approval-invalid',
      actionType: 'codex.exec.manual.approval',
      actionMode: 'read',
      riskLevel: 'medium',
      dryRun: true,
      metadata: {
        dryRunPlanHashPresent: false,
        policyDecisionHashPresent: false,
        liveExecution: false,
        externalProcessStarted: false,
      },
    });

    expect(allowed.outcome).toBe('allow');
    expect(allowed.requiresApproval).toBe(true);
    expect(denied.outcome).toBe('deny');
    expect(denied.reasons.join(' ')).toContain('dry-run plan hash');
  });

  it('blocks manual approval transitions that the state machine rejects', () => {
    const decision = evaluateAction({
      actionId: 'manual-approval-transition',
      actionType: 'codex.exec.manual.approval',
      actionMode: 'write',
      riskLevel: 'medium',
      dryRun: true,
      metadata: {
        dryRunPlanHashPresent: true,
        policyDecisionHashPresent: true,
        transitionAllowed: false,
        transitionAction: 'approve',
        approvalExpired: true,
        approvalTerminal: true,
        liveExecution: false,
        externalProcessStarted: false,
      },
    });

    expect(decision.outcome).toBe('deny');
    expect(decision.reasons.join(' ')).toContain('state machine');
    expect(decision.reasons.join(' ')).toContain('expired');
    expect(decision.reasons.join(' ')).toContain('terminal');
  });
});

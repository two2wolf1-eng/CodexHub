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
});

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
});


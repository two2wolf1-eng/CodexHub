import { describe, expect, it } from 'vitest';
import { runMockDevelopmentOrchestration } from './index';

describe('orchestrator-kernel mock development orchestration', () => {
  it('runs the full foundation-only mock loop', async () => {
    const result = await runMockDevelopmentOrchestration({
      title: 'Add Electron CDP read-only observation skeleton',
      description: 'Create interfaces and tests only',
    });

    expect(result.request.title).toBe('Add Electron CDP read-only observation skeleton');
    expect(result.taskGraph.tasks.length).toBeGreaterThan(0);
    expect(result.skillResolution.selectedSkills.length).toBeGreaterThan(0);
    expect(result.agentRuns).toHaveLength(result.taskGraph.tasks.length);
    expect(result.verificationRun.status).toBe('passed');
    expect(result.evidenceRefs.length).toBe(result.agentRuns.length + 1);
    expect(result.auditEvents.length).toBeGreaterThanOrEqual(result.agentRuns.length + 3);
    expect(result.summary.mockOnly).toBe(true);
  });
});

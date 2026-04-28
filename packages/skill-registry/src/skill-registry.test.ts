import { describe, expect, it } from 'vitest';
import { MockSkillRegistry } from './index';

describe('skill-registry keyword resolution', () => {
  it('selects mock skills from request and task keywords', async () => {
    const registry = new MockSkillRegistry();
    const result = await registry.resolve({
      requestText: 'Add Electron CDP read-only observation skeleton',
      taskKeywords: ['interfaces', 'workflow', 'policy', 'tests'],
      requestedCapabilities: ['architecture.planning', 'workflow.policy', 'electron.observe'],
    });
    const selections = new Map(result.selectedSkills.map((selection) => [selection.skillId, selection]));

    expect(result.selectedSkills.map((selection) => selection.skillId)).toEqual(
      expect.arrayContaining([
        'codexhub-electron-cdp-observer',
        'codexhub-contract-designer',
        'codexhub-workflow-policy-reviewer',
        'codexhub-architecture-planner',
      ]),
    );
    expect(selections.get('codexhub-contract-designer')).toMatchObject({
      required: true,
      matchedKeywords: expect.arrayContaining(['interfaces']),
    });
    expect(selections.get('codexhub-playwright-qa')).toMatchObject({
      required: false,
      score: 8,
    });
    expect(selections.has('codexhub-browser-profile-observer')).toBe(false);
    expect(selections.has('codexhub-release-auditor')).toBe(false);
  });
});

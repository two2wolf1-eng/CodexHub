import { describe, expect, it } from 'vitest';
import { MockSkillRegistry } from './index';

describe('skill-registry keyword resolution', () => {
  it('selects mock skills from request and task keywords', async () => {
    const registry = new MockSkillRegistry();
    const result = await registry.resolve({
      requestText: 'Add Electron CDP read-only observation skeleton',
      taskKeywords: ['contract', 'workflow', 'playwright', 'release'],
    });

    expect(result.selectedSkills.map((skill) => skill.id)).toEqual(
      expect.arrayContaining([
        'codexhub-electron-cdp-observer',
        'codexhub-contract-designer',
        'codexhub-workflow-policy-reviewer',
        'codexhub-playwright-qa',
        'codexhub-release-auditor',
      ]),
    );
  });
});

import {
  type SkillCapability,
  type SkillDescriptor,
  type SkillResolutionResult,
  type SkillSelection,
  type SkillTrigger,
  SchemaVersionSchema,
  foundationId,
  foundationTimestamp,
} from '@codexhub/contracts';

export type {
  SkillCapability,
  SkillDescriptor,
  SkillResolutionResult,
  SkillSelection,
  SkillTrigger,
};

export interface SkillResolutionInput {
  requestText: string;
  taskKeywords?: string[];
  requestedCapabilities?: string[];
  metadata?: Record<string, unknown>;
}

export interface SkillRegistry {
  list(): Promise<SkillDescriptor[]>;
  resolve(input: SkillResolutionInput): Promise<SkillResolutionResult>;
}

export class MockSkillRegistry implements SkillRegistry {
  constructor(private readonly descriptors: SkillDescriptor[] = createMockSkillDescriptors()) {}

  async list(): Promise<SkillDescriptor[]> {
    return this.descriptors;
  }

  async resolve(input: SkillResolutionInput): Promise<SkillResolutionResult> {
    const requestedCapabilities = input.requestedCapabilities ?? [];
    const inputKeywords = toKeywordSet([input.requestText, ...(input.taskKeywords ?? [])].join(' '));
    const selectedSkills = this.descriptors
      .map((descriptor) => scoreDescriptor(descriptor, requestedCapabilities, inputKeywords))
      .filter((selection) => selection.required || selection.matchedKeywords.length > 0)
      .sort((left, right) => right.score - left.score || left.skillId.localeCompare(right.skillId));
    const matchedCapabilityIds = new Set(
      selectedSkills.flatMap((selection) =>
        selection.skill.capabilities.map((capability) => capability.id),
      ),
    );

    return {
      id: foundationId('skill_resolution'),
      schemaVersion: SchemaVersionSchema.value,
      createdAt: foundationTimestamp(),
      inputSummary: summarizeInput(input),
      selectedSkills,
      unmatchedCapabilities: requestedCapabilities.filter((id) => !matchedCapabilityIds.has(id)),
      reasons:
        selectedSkills.length > 0
          ? selectedSkills.map(
              (selection) =>
                `${selection.required ? 'required' : 'optional'} ${selection.skillId}: ${selection.reason}`,
            )
          : ['mock registry found no matching skill'],
      metadata: { mock: true, taskKeywords: input.taskKeywords ?? [] },
    };
  }
}

export function createMockSkillDescriptors(): SkillDescriptor[] {
  return [
    descriptor('codexhub-architecture-planner', 'Architecture Planner', 'architecture.planning', [
      'architecture',
      'architect',
      'plan',
      'planner',
      'system',
      'skeleton',
    ]),
    descriptor('codexhub-contract-designer', 'Contract Designer', 'contracts.design', [
      'contract',
      'contracts',
      'schema',
      'schemas',
      'dto',
      'interface',
      'interfaces',
    ]),
    descriptor('codexhub-workflow-policy-reviewer', 'Workflow Policy Reviewer', 'workflow.policy', [
      'policy',
      'workflow',
      'workflows',
      'approval',
      'dry',
      'run',
    ]),
    descriptor('codexhub-electron-cdp-observer', 'Electron CDP Observer', 'electron.observe', [
      'electron',
      'cdp',
      'desktop',
      'observation',
      'observer',
      'read',
      'only',
    ]),
    descriptor('codexhub-browser-profile-observer', 'Browser Profile Observer', 'browser.observe', [
      'browser',
      'profile',
      'workspace',
    ]),
    descriptor('codexhub-playwright-qa', 'Playwright QA', 'qa.browser', [
      'qa',
      'playwright',
      'test',
      'tests',
    ]),
    descriptor('codexhub-release-auditor', 'Release Auditor', 'release.audit', [
      'release',
      'audit',
      'auditor',
      'evidence',
    ]),
  ];
}

function scoreDescriptor(
  descriptor: SkillDescriptor,
  requestedCapabilities: string[],
  inputKeywords: Set<string>,
): SkillSelection {
  const capabilityIds = descriptor.capabilities.map((capability) => capability.id);
  const requiredByCapability = capabilityIds.some((id) => requestedCapabilities.includes(id));
  const triggerKeywords = descriptor.triggers.flatMap((trigger) => trigger.keywords);
  const matchedKeywords = unique(triggerKeywords.filter((keyword) => inputKeywords.has(keyword)));
  const requiredByKeyword = isRequiredKeywordMatch(descriptor.id, matchedKeywords);
  const required = requiredByCapability || requiredByKeyword;
  const score = (requiredByCapability ? 75 : 0) + (requiredByKeyword ? 45 : 0) + matchedKeywords.length * 8;

  return {
    skillId: descriptor.id,
    skill: descriptor,
    score,
    matchedKeywords,
    reason: buildReason(requiredByCapability, requiredByKeyword, matchedKeywords),
    required,
  };
}

function isRequiredKeywordMatch(skillId: string, matchedKeywords: string[]): boolean {
  if (skillId === 'codexhub-contract-designer') {
    return matchedKeywords.some((keyword) =>
      ['contract', 'contracts', 'schema', 'schemas', 'dto', 'interface', 'interfaces'].includes(
        keyword,
      ),
    );
  }

  return false;
}

function buildReason(
  requiredByCapability: boolean,
  requiredByKeyword: boolean,
  matchedKeywords: string[],
): string {
  const parts: string[] = [];

  if (requiredByCapability) {
    parts.push('requested capability matched');
  }

  if (requiredByKeyword) {
    parts.push('required keyword matched');
  }

  if (matchedKeywords.length > 0) {
    parts.push(`keywords: ${matchedKeywords.join(', ')}`);
  }

  return parts.length > 0 ? parts.join('; ') : 'no strong match';
}

function descriptor(
  id: string,
  displayName: string,
  capabilityId: string,
  keywords: string[],
): SkillDescriptor {
  return {
    id,
    displayName,
    description: `Mock descriptor for ${displayName}.`,
    capabilities: [
      {
        id: capabilityId,
        description: `Mock capability ${capabilityId}.`,
        riskLevel: id.includes('electron') || id.includes('browser') ? 'high' : 'low',
        readOnlyDefault: true,
      },
    ],
    triggers: [
      {
        id: `${id}.trigger`,
        keywords,
        capabilityIds: [capabilityId],
      },
    ],
    metadata: { mock: true },
  };
}

function summarizeInput(input: SkillResolutionInput): string {
  const capabilityText =
    input.requestedCapabilities && input.requestedCapabilities.length > 0
      ? ` capabilities=${input.requestedCapabilities.join(',')}`
      : '';
  return `mock skill resolution for "${input.requestText.slice(0, 80)}"${capabilityText}`;
}

function toKeywordSet(text: string): Set<string> {
  return new Set(
    text
      .toLowerCase()
      .split(/[^a-z0-9]+/)
      .filter((keyword) => keyword.length > 0),
  );
}

function unique(values: string[]): string[] {
  return Array.from(new Set(values));
}

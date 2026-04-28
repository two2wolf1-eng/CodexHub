export interface SkillCapability {
  id: string;
  description: string;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  readOnlyDefault: boolean;
}

export interface SkillTrigger {
  id: string;
  keywords: string[];
  capabilityIds: string[];
}

export interface SkillDescriptor {
  id: string;
  displayName: string;
  description: string;
  capabilities: SkillCapability[];
  triggers: SkillTrigger[];
  metadata?: Record<string, unknown>;
}

export interface SkillResolutionInput {
  requestText: string;
  requestedCapabilities?: string[];
  metadata?: Record<string, unknown>;
}

export interface SkillResolutionResult {
  selectedSkills: SkillDescriptor[];
  unmatchedCapabilities: string[];
  reasons: string[];
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
    const normalizedText = input.requestText.toLowerCase();
    const requestedCapabilities = input.requestedCapabilities ?? [];
    const selectedSkills = this.descriptors.filter((descriptor) => {
      const capabilityMatch = descriptor.capabilities.some((capability) =>
        requestedCapabilities.includes(capability.id),
      );
      const keywordMatch = descriptor.triggers.some((trigger) =>
        trigger.keywords.some((keyword) => normalizedText.includes(keyword.toLowerCase())),
      );

      return capabilityMatch || keywordMatch;
    });
    const matchedCapabilityIds = new Set(
      selectedSkills.flatMap((skill) => skill.capabilities.map((capability) => capability.id)),
    );

    return {
      selectedSkills,
      unmatchedCapabilities: requestedCapabilities.filter((id) => !matchedCapabilityIds.has(id)),
      reasons:
        selectedSkills.length > 0
          ? selectedSkills.map((skill) => `mock registry selected ${skill.id}`)
          : ['mock registry found no matching skill'],
      metadata: { mock: true },
    };
  }
}

export function createMockSkillDescriptors(): SkillDescriptor[] {
  return [
    descriptor('codexhub-architecture-planner', 'Architecture Planner', 'architecture.planning', [
      'architecture',
      'plan',
      'system',
    ]),
    descriptor('codexhub-contract-designer', 'Contract Designer', 'contracts.design', [
      'contract',
      'schema',
      'dto',
    ]),
    descriptor('codexhub-workflow-policy-reviewer', 'Workflow Policy Reviewer', 'workflow.policy', [
      'policy',
      'workflow',
      'approval',
    ]),
    descriptor('codexhub-electron-cdp-observer', 'Electron CDP Observer', 'electron.observe', [
      'electron',
      'cdp',
      'desktop',
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
    ]),
    descriptor('codexhub-release-auditor', 'Release Auditor', 'release.audit', [
      'release',
      'audit',
      'evidence',
    ]),
  ];
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


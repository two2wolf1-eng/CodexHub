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
    const inputKeywords = toKeywordSet(
      [input.requestText, ...(input.taskKeywords ?? [])].join(' '),
    );
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
    descriptor({
      id: 'gsd-spec-driver',
      displayName: 'GSD Spec Driver',
      description:
        'Use when starting any CodexHub development round to turn the user request into Goal, Scope, Non-scope, Acceptance criteria, Hard boundaries, Affected apps/packages, and Risk level before editing.',
      capabilityId: 'workflow.gsd_spec',
      capabilityDescription: 'Drive bounded GSD specs before implementation.',
      keywords: ['gsd', 'spec', 'goal', 'scope', 'acceptance', 'boundaries', 'risk'],
    }),
    descriptor({
      id: 'gstack-delivery-workflow',
      displayName: 'GStack Delivery Workflow',
      description:
        'Use when planning or executing any CodexHub development round to structure delivery as Plan, Build, Review, QA, Ship, and Retro.',
      capabilityId: 'workflow.gstack_delivery',
      capabilityDescription:
        'Structure CodexHub rounds as plan, build, review, QA, ship, and retro.',
      keywords: ['gstack', 'plan', 'build', 'review', 'qa', 'ship', 'retro'],
    }),
    descriptor({
      id: 'superpowers-engineering-discipline',
      displayName: 'Superpowers Engineering Discipline',
      description:
        'Use when working on any CodexHub development round to enforce small steps, tests where practical, YAGNI, DRY, evidence-over-claims, clean git state, no scope creep, and no unreviewed live automation.',
      capabilityId: 'workflow.superpowers',
      capabilityDescription:
        'Enforce small steps, practical tests, YAGNI, DRY, evidence, clean git state, and scope control.',
      keywords: ['superpowers', 'small', 'steps', 'tests', 'yagni', 'dry', 'evidence', 'scope'],
    }),
    descriptor({
      id: 'codexhub-architecture-planner',
      displayName: 'CodexHub Architecture Planner',
      description:
        'Use when planning CodexHub architecture, package boundaries, app/package ownership, or cross-plane changes.',
      capabilityId: 'architecture.planning',
      capabilityDescription: 'Plan CodexHub architecture and package boundaries.',
      keywords: ['architecture', 'architect', 'plan', 'planner', 'system', 'skeleton'],
    }),
    descriptor({
      id: 'codexhub-contract-designer',
      displayName: 'CodexHub Contract Designer',
      description:
        'Use when modifying contracts, Zod schemas, DTOs, inferred TypeScript types, or public exports.',
      capabilityId: 'contracts.design',
      capabilityDescription: 'Design shared contracts, schemas, DTOs, and public exports.',
      keywords: ['contract', 'contracts', 'schema', 'schemas', 'dto', 'interface', 'interfaces'],
    }),
    descriptor({
      id: 'codexhub-workflow-policy-reviewer',
      displayName: 'CodexHub Workflow Policy Reviewer',
      description:
        'Use when modifying workflow, security, approval, evidence, audit, policy, or risk behavior.',
      capabilityId: 'workflow.policy',
      capabilityDescription: 'Review workflow, policy, approval, evidence, and audit behavior.',
      keywords: ['policy', 'workflow', 'workflows', 'approval', 'dry', 'run', 'evidence', 'audit'],
    }),
    descriptor({
      id: 'codexhub-codex-exec-adapter',
      displayName: 'CodexHub Codex Adapter',
      description:
        'Use when modifying codex-kernel or the Codex run-control plane, parser, replay, dry-run, preflight, approval, or gate logic.',
      capabilityId: 'codex.adapter.control_plane',
      capabilityDescription:
        'Review Codex run-control parser, replay, dry-run, preflight, and gate logic.',
      keywords: [
        'codex',
        'kernel',
        'adapter',
        'parser',
        'replay',
        'preflight',
        'gate',
        'dry',
        'run',
      ],
    }),
    descriptor({
      id: 'codexhub-electron-cdp-observer',
      displayName: 'CodexHub Electron CDP Observer',
      description:
        'Use when working on Electron or CDP observation interfaces, target models, endpoint models, or read-only observer placeholders.',
      capabilityId: 'electron.observe',
      capabilityDescription: 'Design read-only Electron/CDP observer interfaces and models.',
      keywords: ['electron', 'cdp', 'desktop', 'observation', 'observer', 'read', 'only'],
    }),
    descriptor({
      id: 'codexhub-browser-profile-observer',
      displayName: 'CodexHub Browser Profile Observer',
      description:
        'Use when working on Browser Profile, Chrome Profile, workspace observation, browser profile health, or profile observation models.',
      capabilityId: 'browser.observe',
      capabilityDescription:
        'Design read-only browser profile observer interfaces and health models.',
      keywords: ['browser', 'profile', 'chrome', 'workspace', 'health'],
    }),
    descriptor({
      id: 'codexhub-production-real-automation-governor',
      displayName: 'CodexHub Production Real Automation Governor',
      description:
        'Use when implementing explicitly approved production real-client automation, including Browser/Chrome CDP, Electron/CDP, Codex Web, Codex Desktop, Codex CLI, cross-profile, cross-workspace, delegated admin, or break-glass write surfaces.',
      capabilityId: 'production.real_automation_governance',
      capabilityDescription:
        'Govern approved real client write automation with registered surfaces, operation manifests, authority, evidence, and audit.',
      keywords: [
        'production',
        'real',
        'automation',
        'browser',
        'chrome',
        'electron',
        'cdp',
        'codex',
        'cli',
        'write',
        'break',
        'glass',
      ],
    }),
    descriptor({
      id: 'codexhub-playwright-qa',
      displayName: 'CodexHub Playwright QA',
      description:
        'Use when modifying Dashboard UI, browser smoke checks, QA notes, frontend state handling, or visual verification plans.',
      capabilityId: 'qa.browser',
      capabilityDescription:
        'Review Dashboard smoke checks, degraded states, and browser QA plans.',
      keywords: ['qa', 'playwright', 'test', 'tests', 'dashboard', 'smoke', 'frontend'],
    }),
    descriptor({
      id: 'codexhub-release-auditor',
      displayName: 'CodexHub Release Auditor',
      description:
        'Use when finishing a CodexHub round, reviewing diffs, running verification, preparing commits, or writing release summaries.',
      capabilityId: 'release.audit',
      capabilityDescription:
        'Audit closeout, verification evidence, commits, and release summaries.',
      keywords: ['release', 'audit', 'auditor', 'evidence', 'verify', 'commit', 'summary'],
    }),
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
  const score =
    (requiredByCapability ? 75 : 0) + (requiredByKeyword ? 45 : 0) + matchedKeywords.length * 8;

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

function descriptor(input: {
  id: string;
  displayName: string;
  description: string;
  capabilityId: string;
  capabilityDescription: string;
  keywords: string[];
}): SkillDescriptor {
  return {
    id: input.id,
    displayName: input.displayName,
    description: input.description,
    capabilities: [
      {
        id: input.capabilityId,
        description: input.capabilityDescription,
        riskLevel:
          input.id.includes('electron') ||
          input.id.includes('browser') ||
          input.id.includes('codex-exec')
            ? 'high'
            : 'low',
        readOnlyDefault: true,
      },
    ],
    triggers: [
      {
        id: `${input.id}.trigger`,
        keywords: input.keywords,
        capabilityIds: [input.capabilityId],
      },
    ],
    metadata: { mock: true, skillPath: `.agents/skills/${input.id}/SKILL.md` },
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

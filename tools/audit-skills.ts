import { existsSync, readFileSync } from 'node:fs';
import { dirname, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createMockSkillDescriptors } from '../packages/skill-registry/src/index';

interface Violation {
  path: string;
  reason: string;
}

interface SkillFrontmatter {
  name?: string;
  description?: string;
  keys: string[];
}

const workspaceRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const requiredSkills = [
  'codexhub-architecture-planner',
  'codexhub-contract-designer',
  'codexhub-workflow-policy-reviewer',
  'codexhub-codex-exec-adapter',
  'codexhub-electron-cdp-observer',
  'codexhub-browser-profile-observer',
  'codexhub-playwright-qa',
  'codexhub-release-auditor',
];
const triggerPhrases = ['use when', 'trigger', 'when modifying', 'when working on'];
const violations: Violation[] = [];

auditSkillFiles();
auditGovernanceDocs();
auditRegistryAlignment();

if (violations.length > 0) {
  console.error(`Skills audit failed: ${violations.length} violation(s).`);

  for (const violation of violations) {
    console.error(`- ${violation.path}: ${violation.reason}`);
  }

  process.exit(1);
}

console.log(
  `Skills audit passed: ${requiredSkills.length} project skills, AGENTS workflow protocol, docs, and registry descriptors verified.`,
);

function auditSkillFiles(): void {
  for (const skillName of requiredSkills) {
    const skillPath = join(workspaceRoot, '.agents', 'skills', skillName, 'SKILL.md');

    if (!existsSync(skillPath)) {
      addViolation(skillPath, 'required SKILL.md is missing');
      continue;
    }

    const text = readFileSync(skillPath, 'utf8');
    const frontmatter = parseFrontmatter(text);

    if (!frontmatter) {
      addViolation(skillPath, 'frontmatter block is missing');
      continue;
    }

    const unexpectedKeys = frontmatter.keys.filter((key) => !['name', 'description'].includes(key));

    if (unexpectedKeys.length > 0) {
      addViolation(
        skillPath,
        `frontmatter contains unsupported keys: ${unexpectedKeys.join(', ')}`,
      );
    }

    if (frontmatter.name !== skillName) {
      addViolation(skillPath, `frontmatter name must equal directory name ${skillName}`);
    }

    if (!frontmatter.description || frontmatter.description.trim().length === 0) {
      addViolation(skillPath, 'frontmatter description must be non-empty');
    } else if (!hasTriggerPhrase(frontmatter.description)) {
      addViolation(
        skillPath,
        `description must include a trigger phrase: ${triggerPhrases.join(', ')}`,
      );
    }
  }
}

function auditGovernanceDocs(): void {
  const agentsPath = join(workspaceRoot, 'AGENTS.md');
  const workflowPath = join(workspaceRoot, 'docs', 'development', 'skills-workflow.md');
  const templatePath = join(workspaceRoot, 'docs', 'development', 'round-template.md');

  if (!existsSync(agentsPath)) {
    addViolation(agentsPath, 'AGENTS.md is missing');
  } else {
    const text = readFileSync(agentsPath, 'utf8');

    if (!text.includes('Development Workflow Protocol')) {
      addViolation(agentsPath, 'Development Workflow Protocol section is missing');
    }
  }

  if (!existsSync(workflowPath)) {
    addViolation(workflowPath, 'skills workflow documentation is missing');
  }

  if (!existsSync(templatePath)) {
    addViolation(templatePath, 'round template documentation is missing');
  }
}

function auditRegistryAlignment(): void {
  const descriptors = createMockSkillDescriptors();
  const descriptorIds = new Set(descriptors.map((descriptor) => descriptor.id));
  const registryPath = join(workspaceRoot, 'packages', 'skill-registry', 'src', 'index.ts');

  for (const skillName of requiredSkills) {
    if (!descriptorIds.has(skillName)) {
      addViolation(registryPath, `skill registry is missing descriptor ${skillName}`);
    }
  }

  for (const descriptor of descriptors) {
    if (!requiredSkills.includes(descriptor.id)) {
      addViolation(registryPath, `skill registry has unexpected descriptor ${descriptor.id}`);
    }

    if (!descriptor.description || !hasTriggerPhrase(descriptor.description)) {
      addViolation(
        registryPath,
        `descriptor ${descriptor.id} description must align with skill trigger semantics`,
      );
    }
  }
}

function parseFrontmatter(text: string): SkillFrontmatter | undefined {
  const match = /^---\r?\n([\s\S]*?)\r?\n---/.exec(text);

  if (!match?.[1]) {
    return undefined;
  }

  const result: SkillFrontmatter = { keys: [] };

  for (const line of match[1].split(/\r?\n/)) {
    const separatorIndex = line.indexOf(':');

    if (separatorIndex < 0) {
      continue;
    }

    const key = line.slice(0, separatorIndex).trim();
    const value = line.slice(separatorIndex + 1).trim();
    result.keys.push(key);

    if (key === 'name') {
      result.name = value;
    }

    if (key === 'description') {
      result.description = value;
    }
  }

  return result;
}

function hasTriggerPhrase(value: string): boolean {
  const normalized = value.toLowerCase();
  return triggerPhrases.some((phrase) => normalized.includes(phrase));
}

function addViolation(path: string, reason: string): void {
  violations.push({
    path: toWorkspacePath(path),
    reason,
  });
}

function toWorkspacePath(path: string): string {
  return relative(workspaceRoot, path).split(sep).join('/');
}

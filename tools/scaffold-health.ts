import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const workspaceRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');

const expectedProjects = [
  'browser-profile-kernel',
  'electron-cdp-kernel',
  'orchestrator-kernel',
  'evidence-kernel',
  'observer-kernel',
  'security-kernel',
  'workflow-kernel',
  'skill-registry',
  'codex-kernel',
  'store-sqlite',
  'store-core',
  'contracts',
  'orchestrator',
  'supervisor',
  'dashboard',
  'cli',
].sort();

const requiredGovernanceFiles = [
  'AGENTS.md',
  '.codexhub/orchestration.yaml',
  '.codexhub/policies.yaml',
  '.codexhub/risk-matrix.yaml',
  '.codex/config.toml.example',
  '.codex/agents/architect.toml',
  '.codex/agents/implementer.toml',
  '.codex/agents/reviewer.toml',
  '.codex/agents/security.toml',
  '.codex/agents/qa.toml',
];

const projects = readNxProjects();
const missingProjects = expectedProjects.filter((project) => !projects.includes(project));
const extraProjects = projects.filter((project) => !expectedProjects.includes(project));
const missingGovernanceFiles = requiredGovernanceFiles.filter(
  (file) => !existsSync(resolve(workspaceRoot, file)),
);

if (missingProjects.length > 0 || extraProjects.length > 0 || missingGovernanceFiles.length > 0) {
  console.error('Scaffold health failed.');

  for (const project of missingProjects) {
    console.error(`- Missing Nx project: ${project}`);
  }

  for (const project of extraProjects) {
    console.error(`- Unexpected Nx project: ${project}`);
  }

  for (const file of missingGovernanceFiles) {
    console.error(`- Missing governance file: ${file}`);
  }

  process.exit(1);
}

console.log(
  `Scaffold health passed: ${projects.length} Nx projects and ${requiredGovernanceFiles.length} governance files verified.`,
);

function readNxProjects(): string[] {
  const projects: string[] = [];

  for (const root of ['apps', 'packages']) {
    const absoluteRoot = resolve(workspaceRoot, root);

    if (!existsSync(absoluteRoot)) {
      continue;
    }

    for (const entry of readdirSync(absoluteRoot)) {
      const projectRoot = resolve(absoluteRoot, entry);
      const projectJsonPath = resolve(projectRoot, 'project.json');

      if (!statSync(projectRoot).isDirectory() || !existsSync(projectJsonPath)) {
        continue;
      }

      const parsed = JSON.parse(readFileSync(projectJsonPath, 'utf8')) as { name?: unknown };

      if (typeof parsed.name === 'string' && parsed.name.length > 0) {
        projects.push(parsed.name);
      }
    }
  }

  return projects.sort();
}

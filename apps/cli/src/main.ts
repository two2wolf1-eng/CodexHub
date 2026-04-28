#!/usr/bin/env node
import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, extname, parse, relative, resolve, sep } from 'node:path';
import { Command } from 'commander';
import {
  type CodexExecReplaySummary,
  replayCodexExecFixture,
  summarizeCodexExecReplay,
} from '@codexhub/codex-kernel';
import {
  type MockDevelopmentOrchestrationResult,
  runMockDevelopmentOrchestration,
} from '@codexhub/orchestrator-kernel';
import { WorkflowRunner, createMockWorkflowDefinition } from '@codexhub/workflow-kernel';

const supervisorUrl = process.env.CODEXHUB_SUPERVISOR_URL ?? 'http://127.0.0.1:3333';

export function buildProgram(): Command {
  const program = new Command();

  program.name('codexhub').description('Local CodexHub control CLI').version('0.1.0');

  program.command('health').description('Read local supervisor health').action(async () => {
    const health = await getSupervisorHealth();
    console.log(JSON.stringify(health, null, 2));
  });

  program
    .command('workflow')
    .description('Workflow commands')
    .command('dry-run')
    .argument('<workflowName>')
    .description('Create a dry-run plan for a workflow')
    .action(async (workflowName: string) => {
      const plan = await dryRunWorkflow(workflowName);
      console.log(JSON.stringify(plan, null, 2));
    });

  program
    .command('development')
    .description('Development orchestration commands')
    .command('mock-run')
    .argument('<title>')
    .option('-d, --description <description>', 'Mock request description', 'Create interfaces and tests only')
    .description('Run a foundation-only mock development orchestration')
    .action(async (title: string, options: { description: string }) => {
      const result = await mockRunDevelopment(title, options.description);
      console.log(JSON.stringify(result, null, 2));
    });

  program
    .command('codex')
    .description('Codex fixture tools')
    .command('replay-fixture')
    .argument('<fixturePath>')
    .description('Replay a local Codex JSONL fixture without live execution')
    .action(async (fixturePath: string) => {
      const summary = await replayCodexFixture(fixturePath);
      console.log(JSON.stringify(summary, null, 2));
    });

  return program;
}

export async function runCli(argv = process.argv): Promise<void> {
  await buildProgram().parseAsync(argv);
}

export async function getSupervisorHealth(): Promise<Record<string, unknown>> {
  try {
    const response = await fetch(`${supervisorUrl}/health`);

    if (!response.ok) {
      throw new Error(`supervisor returned ${response.status}`);
    }

    return (await response.json()) as Record<string, unknown>;
  } catch (error) {
    return {
      service: 'codexhub-cli',
      status: 'degraded',
      supervisorUrl,
      reason: error instanceof Error ? error.message : 'unknown supervisor error',
      metadata: { mock: true },
    };
  }
}

export async function dryRunWorkflow(workflowName: string): Promise<Record<string, unknown>> {
  try {
    const response = await fetch(`${supervisorUrl}/api/workflows/dry-run`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ workflowName, input: { requestedBy: 'cli' } }),
    });

    if (!response.ok) {
      throw new Error(`supervisor returned ${response.status}`);
    }

    return (await response.json()) as Record<string, unknown>;
  } catch {
    const runner = new WorkflowRunner();
    return runner.dryRun(createMockWorkflowDefinition(workflowName), { requestedBy: 'cli-fallback' });
  }
}

export async function mockRunDevelopment(
  title: string,
  description = 'Create interfaces and tests only',
): Promise<Record<string, unknown> | MockDevelopmentOrchestrationResult> {
  try {
    const response = await fetch(`${supervisorUrl}/api/development/mock-run`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ title, description }),
    });

    if (!response.ok) {
      throw new Error(`supervisor returned ${response.status}`);
    }

    return (await response.json()) as Record<string, unknown>;
  } catch {
    return runMockDevelopmentOrchestration({
      title,
      description,
      constraints: ['foundation-only', 'mock-only', 'cli-fallback'],
      metadata: { requestedBy: 'cli-fallback' },
    });
  }
}

export async function replayCodexFixture(fixturePath: string): Promise<CodexExecReplaySummary> {
  try {
    const response = await fetch(`${supervisorUrl}/api/codex/replay-fixture`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ fixturePath }),
    });

    if (!response.ok) {
      throw new Error(`supervisor returned ${response.status}`);
    }

    return (await response.json()) as CodexExecReplaySummary;
  } catch {
    const text = await readAllowedFixture(fixturePath);
    const result = await replayCodexExecFixture(text);
    return summarizeCodexExecReplay(result);
  }
}

async function readAllowedFixture(fixturePath: string): Promise<string> {
  const workspaceRoot = findWorkspaceRoot(process.cwd());
  const fixturesRoot = resolve(workspaceRoot, 'packages', 'codex-kernel', 'fixtures');
  const requestedPath = resolve(workspaceRoot, fixturePath);

  if (!isPathInside(requestedPath, fixturesRoot) || extname(requestedPath) !== '.jsonl') {
    throw new Error('Fixture path must point to packages/codex-kernel/fixtures/*.jsonl');
  }

  return readFile(requestedPath, 'utf8');
}

function findWorkspaceRoot(startDirectory: string): string {
  let current = resolve(startDirectory);
  const root = parse(current).root;

  while (true) {
    if (existsSync(resolve(current, 'pnpm-workspace.yaml'))) {
      return current;
    }

    const parent = dirname(current);

    if (parent === current || current === root) {
      return resolve(startDirectory);
    }

    current = parent;
  }
}

function isPathInside(path: string, root: string): boolean {
  const relativePath = relative(root, path);
  return relativePath.length > 0 && !relativePath.startsWith('..') && !relativePath.includes(`..${sep}`);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])) {
  await runCli();
}

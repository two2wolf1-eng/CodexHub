#!/usr/bin/env node
import { Command } from 'commander';
import { WorkflowRunner, createMockWorkflowDefinition } from '@codexhub/workflow-kernel';

const supervisorUrl = process.env.CODEXHUB_SUPERVISOR_URL ?? 'http://127.0.0.1:3333';
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

await program.parseAsync(process.argv);

async function getSupervisorHealth(): Promise<Record<string, unknown>> {
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

async function dryRunWorkflow(workflowName: string): Promise<Record<string, unknown>> {
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


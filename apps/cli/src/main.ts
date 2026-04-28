#!/usr/bin/env node
import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, extname, isAbsolute, parse, relative, resolve, sep } from 'node:path';
import { Command } from 'commander';
import {
  createCodexExecApprovalArtifactFromDecision,
  createCodexExecApprovalArtifact,
  createCodexExecApprovalTransitionResult,
  createCodexExecControlPlaneAuditEvents,
  createCodexExecControlPlaneEvidenceRefs,
  createCodexExecDisabledLiveRunRecord,
  createCodexExecDryRunPlan,
  createCodexExecExecutionIntent,
  createCodexExecManualApprovalDecision,
  createCodexExecManualApprovalRecord,
  createCodexExecManualApprovalRequest,
  createDefaultCodexExecLiveConfig,
  createDefaultCodexExecConfigLoadResult,
  evaluateCodexExecDryRunPolicy,
  evaluateCodexExecExecutionGate,
  evaluateCodexExecManualApprovalState,
  type CodexExecReplaySummary,
  parseCodexExecLiveConfigFile,
  replayCodexExecFixture,
  runCodexExecPreflight,
  summarizeCodexExecReplay,
} from '@codexhub/codex-kernel';
import type {
  CodexExecApprovalDecisionOutcome,
  CodexExecConfigLoadResult,
  CodexExecLiveRunRecord,
} from '@codexhub/contracts';
import {
  type MockDevelopmentOrchestrationResult,
  runMockDevelopmentOrchestration,
} from '@codexhub/orchestrator-kernel';
import { DefaultPolicyEngine } from '@codexhub/security-kernel';
import { WorkflowRunner, createMockWorkflowDefinition } from '@codexhub/workflow-kernel';

const supervisorUrl = process.env.CODEXHUB_SUPERVISOR_URL ?? 'http://127.0.0.1:3333';

export function buildProgram(): Command {
  const program = new Command();

  program.name('codexhub').description('Local CodexHub control CLI').version('0.1.0');

  program
    .command('health')
    .description('Read local supervisor health')
    .action(async () => {
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
    .option(
      '-d, --description <description>',
      'Mock request description',
      'Create interfaces and tests only',
    )
    .description('Run a foundation-only mock development orchestration')
    .action(async (title: string, options: { description: string }) => {
      const result = await mockRunDevelopment(title, options.description);
      console.log(JSON.stringify(result, null, 2));
    });

  const codexCommand = program.command('codex').description('Codex control-plane tools');

  codexCommand
    .command('replay-fixture')
    .argument('<fixturePath>')
    .description('Replay a local Codex JSONL fixture without live execution')
    .action(async (fixturePath: string) => {
      const summary = await replayCodexFixture(fixturePath);
      console.log(JSON.stringify(summary, null, 2));
    });

  const execCommand = codexCommand
    .command('exec')
    .description('Disabled live adapter control-plane commands');

  execCommand
    .command('config')
    .description('Read disabled live adapter configuration state')
    .action(async () => {
      const result = await getCodexExecConfig();
      console.log(JSON.stringify(result, null, 2));
    });

  execCommand
    .command('dry-run')
    .argument('<prompt>')
    .description('Create a disabled dry-run plan for future live adapter use')
    .action(async (prompt: string) => {
      const result = await dryRunCodexExec(prompt);
      console.log(JSON.stringify(result, null, 2));
    });

  execCommand
    .command('approval-request')
    .argument('<dryRunId>')
    .option('-r, --reason <reason>', 'Approval request reason', 'Review disabled control-plane run')
    .description('Create a manual approval request for a dry-run record')
    .action(async (dryRunId: string, options: { reason: string }) => {
      const result = await requestCodexExecApproval(dryRunId, options.reason);
      console.log(JSON.stringify(result, null, 2));
    });

  execCommand
    .command('manual-approval')
    .argument('<dryRunId>')
    .option('--request-id <approvalRequestId>', 'Approval request id')
    .option('--outcome <outcome>', 'approved, denied, or revoked', 'approved')
    .option('-r, --reason <reason>', 'Decision reason', 'Manual approval decision')
    .description('Record a manual approval decision without executing anything')
    .action(
      async (
        dryRunId: string,
        options: { approvalRequestId?: string; outcome: string; reason: string },
      ) => {
        const result = await decideCodexExecApproval(
          dryRunId,
          options.outcome,
          options.reason,
          options.approvalRequestId,
        );
        console.log(JSON.stringify(result, null, 2));
      },
    );

  execCommand
    .command('approvals')
    .description('List manual approval records')
    .action(async () => {
      const result = await listCodexExecApprovals();
      console.log(JSON.stringify(result, null, 2));
    });

  execCommand
    .command('preflight')
    .argument('<dryRunId>')
    .description('Run preflight checks for a disabled dry-run record')
    .action(async (dryRunId: string) => {
      const result = await preflightCodexExec(dryRunId);
      console.log(JSON.stringify(result, null, 2));
    });

  execCommand
    .command('evaluate-gate')
    .argument('<dryRunId>')
    .description('Evaluate the disabled execution gate for a dry-run record')
    .action(async (dryRunId: string) => {
      const result = await evaluateCodexExecGate(dryRunId);
      console.log(JSON.stringify(result, null, 2));
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
    return runner.dryRun(createMockWorkflowDefinition(workflowName), {
      requestedBy: 'cli-fallback',
    });
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
    return summarizeCodexExecReplay(
      result,
      toWorkspacePath(resolve(findWorkspaceRoot(process.cwd()), fixturePath)),
    );
  }
}

export async function getCodexExecConfig(): Promise<Record<string, unknown>> {
  try {
    const response = await fetch(`${supervisorUrl}/api/codex/exec/config`);

    if (!response.ok) {
      throw new Error(`supervisor returned ${response.status}`);
    }

    return (await response.json()) as Record<string, unknown>;
  } catch {
    const configLoadResult = await readLocalCodexExecConfig();

    return {
      configLoadResult,
      liveConfig: configLoadResult.config,
      liveExecution: false,
      externalProcessStarted: false,
      executionDisabled: true,
      degraded: true,
      reason: 'supervisor unavailable; local control-plane fallback used',
    };
  }
}

export async function dryRunCodexExec(
  prompt: string,
): Promise<Record<string, unknown> | CodexExecLiveRunRecord> {
  try {
    const response = await fetch(`${supervisorUrl}/api/codex/exec/dry-run`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        title: prompt,
        prompt,
        cwd: '.',
        sandboxMode: 'read_only',
        approvalMode: 'required',
      }),
    });

    if (!response.ok) {
      throw new Error(`supervisor returned ${response.status}`);
    }

    return (await response.json()) as Record<string, unknown>;
  } catch {
    const intent = createCodexExecExecutionIntent({
      title: prompt,
      prompt,
      cwd: '.',
      sandboxMode: 'read_only',
      approvalMode: 'required',
      metadata: { requestedBy: 'cli-fallback' },
    });
    const dryRunPlan = createCodexExecDryRunPlan(intent);
    const policyDecision = evaluateCodexExecDryRunPolicy(dryRunPlan, new DefaultPolicyEngine());

    return createCodexExecDisabledLiveRunRecord(
      dryRunPlan,
      policyDecision,
      'live adapter disabled in CLI fallback',
    );
  }
}

export async function requestCodexExecApproval(
  dryRunId: string,
  reason: string,
): Promise<Record<string, unknown>> {
  try {
    const response = await fetch(`${supervisorUrl}/api/codex/exec/approval-request`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ dryRunId, reason }),
    });

    if (!response.ok) {
      throw new Error(`supervisor returned ${response.status}`);
    }

    return (await response.json()) as Record<string, unknown>;
  } catch {
    const { dryRunPlan, policyDecision } = createLocalCodexExecControlPlaneRecord(dryRunId);
    const liveConfig = createDefaultCodexExecLiveConfig();
    const approvalRequest = createCodexExecManualApprovalRequest(
      dryRunPlan,
      policyDecision,
      liveConfig,
      {
        requestedBy: 'cli-fallback',
        reason,
      },
    );
    let approvalRecord = createCodexExecManualApprovalRecord({
      request: approvalRequest,
    });
    const approvalState =
      approvalRecord.approvalState ?? evaluateCodexExecManualApprovalState(approvalRecord);
    const evidenceRefs = createCodexExecControlPlaneEvidenceRefs({
      approvalRequest,
      approvalState,
    });
    const auditEvents = createCodexExecControlPlaneAuditEvents({
      approvalRequest,
      approvalState,
      evidenceRefs,
    });
    approvalRecord = {
      ...approvalRecord,
      approvalState,
      evidenceRefs,
      auditEventIds: auditEvents.map((event) => event.id),
    };

    return {
      approvalRequest,
      approvalState,
      approvalRecord,
      evidenceRefs,
      auditEvents,
      liveConfig,
      liveExecution: false,
      externalProcessStarted: false,
      executionDisabled: true,
      degraded: true,
      reason: 'supervisor unavailable; local control-plane fallback used',
    };
  }
}

export async function decideCodexExecApproval(
  dryRunId: string,
  outcome: string,
  reason: string,
  approvalRequestId?: string,
): Promise<Record<string, unknown>> {
  const approvalOutcome = parseApprovalOutcome(outcome);

  try {
    const response = await fetch(`${supervisorUrl}/api/codex/exec/manual-approval`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ dryRunId, approvalRequestId, outcome: approvalOutcome, reason }),
    });

    if (!response.ok) {
      throw new Error(`supervisor returned ${response.status}`);
    }

    return (await response.json()) as Record<string, unknown>;
  } catch {
    const { dryRunPlan, policyDecision } = createLocalCodexExecControlPlaneRecord(dryRunId);
    const liveConfig = createDefaultCodexExecLiveConfig();
    const approvalRequest = createCodexExecManualApprovalRequest(
      dryRunPlan,
      policyDecision,
      liveConfig,
      {
        requestedBy: 'cli-fallback',
        reason: approvalRequestId ?? `Review ${dryRunId}`,
      },
    );
    const pendingRecord = createCodexExecManualApprovalRecord({ request: approvalRequest });
    const approvalTransition = createCodexExecApprovalTransitionResult(
      pendingRecord,
      approvalActionForOutcome(approvalOutcome),
    );
    const approvalDecision = createCodexExecManualApprovalDecision(approvalRequest, {
      outcome: approvalOutcome,
      decidedBy: 'cli-fallback',
      reason,
    });
    const approvalArtifact = createCodexExecApprovalArtifactFromDecision(
      dryRunPlan,
      policyDecision,
      approvalRequest,
      approvalDecision,
    );
    const evidenceRefs = createCodexExecControlPlaneEvidenceRefs({
      approvalDecision,
      approvalTransition,
      approvalArtifact,
    });
    const auditEvents = createCodexExecControlPlaneAuditEvents({
      approvalDecision,
      approvalTransition,
      approvalArtifact,
      evidenceRefs,
    });
    let approvalRecord = createCodexExecManualApprovalRecord({
      request: approvalRequest,
      decision: approvalDecision,
      approvalArtifact,
      evidenceRefs,
      auditEvents,
    });
    const approvalState =
      approvalRecord.approvalState ?? evaluateCodexExecManualApprovalState(approvalRecord);
    approvalRecord = {
      ...approvalRecord,
      approvalState,
    };

    return {
      approvalRequest,
      approvalDecision,
      approvalState,
      approvalTransition,
      approvalArtifact,
      approvalRecord,
      evidenceRefs,
      auditEvents,
      liveConfig,
      liveExecution: false,
      externalProcessStarted: false,
      executionDisabled: true,
      degraded: true,
      reason: 'supervisor unavailable; local control-plane fallback used',
    };
  }
}

export async function listCodexExecApprovals(): Promise<Record<string, unknown>> {
  try {
    const response = await fetch(`${supervisorUrl}/api/codex/exec/approvals`);

    if (!response.ok) {
      throw new Error(`supervisor returned ${response.status}`);
    }

    return (await response.json()) as Record<string, unknown>;
  } catch {
    return {
      approvals: [],
      liveExecution: false,
      externalProcessStarted: false,
      executionDisabled: true,
      degraded: true,
      reason: 'supervisor unavailable; local control-plane fallback used',
    };
  }
}

export async function preflightCodexExec(dryRunId: string): Promise<Record<string, unknown>> {
  try {
    const response = await fetch(`${supervisorUrl}/api/codex/exec/preflight`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ dryRunId }),
    });

    if (!response.ok) {
      throw new Error(`supervisor returned ${response.status}`);
    }

    return (await response.json()) as Record<string, unknown>;
  } catch {
    const { dryRunPlan } = createLocalCodexExecControlPlaneRecord(dryRunId);
    const liveConfig = createDefaultCodexExecLiveConfig();
    const preflightResult = runCodexExecPreflight(dryRunPlan, liveConfig);

    return {
      preflightResult,
      liveConfig,
      liveExecution: false,
      externalProcessStarted: false,
      executionDisabled: true,
      degraded: true,
      reason: 'supervisor unavailable; local control-plane fallback used',
    };
  }
}

export async function evaluateCodexExecGate(dryRunId: string): Promise<Record<string, unknown>> {
  try {
    const response = await fetch(`${supervisorUrl}/api/codex/exec/evaluate-gate`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ dryRunId }),
    });

    if (!response.ok) {
      throw new Error(`supervisor returned ${response.status}`);
    }

    return (await response.json()) as Record<string, unknown>;
  } catch {
    const { dryRunPlan, policyDecision } = createLocalCodexExecControlPlaneRecord(dryRunId);
    const liveConfig = createDefaultCodexExecLiveConfig();
    const approvalArtifact = createCodexExecApprovalArtifact(dryRunPlan, policyDecision);
    const executionGateResult = evaluateCodexExecExecutionGate(
      dryRunPlan,
      policyDecision,
      approvalArtifact,
      liveConfig,
    );

    return {
      executionGateResult,
      approvalArtifact,
      liveConfig,
      liveExecution: false,
      externalProcessStarted: false,
      executionDisabled: true,
      degraded: true,
      reason: 'supervisor unavailable; local control-plane fallback used',
    };
  }
}

function createLocalCodexExecControlPlaneRecord(dryRunId: string): CodexExecLiveRunRecord {
  const intent = createCodexExecExecutionIntent({
    title: `Local preflight for ${dryRunId}`,
    prompt: `Local control-plane fallback for ${dryRunId}`,
    cwd: '.',
    sandboxMode: 'read_only',
    approvalMode: 'required',
    metadata: { requestedBy: 'cli-fallback', dryRunId },
  });
  const dryRunPlan = createCodexExecDryRunPlan(intent);
  const policyDecision = evaluateCodexExecDryRunPolicy(dryRunPlan, new DefaultPolicyEngine());

  return createCodexExecDisabledLiveRunRecord(
    dryRunPlan,
    policyDecision,
    'live adapter disabled in CLI fallback',
  );
}

async function readLocalCodexExecConfig(): Promise<CodexExecConfigLoadResult> {
  const workspaceRoot = findWorkspaceRoot(process.cwd());
  const configPath = resolve(workspaceRoot, '.codexhub', 'codex-exec.yaml');

  if (!existsSync(configPath)) {
    return createDefaultCodexExecConfigLoadResult();
  }

  const fileText = await readFile(configPath, 'utf8');

  return parseCodexExecLiveConfigFile({
    configPath: toWorkspacePath(configPath),
    fileText,
    metadata: { requestedBy: 'cli-fallback' },
  });
}

function parseApprovalOutcome(outcome: string): CodexExecApprovalDecisionOutcome {
  if (outcome === 'approved' || outcome === 'denied' || outcome === 'revoked') {
    return outcome;
  }

  throw new Error('approval outcome must be approved, denied, or revoked');
}

function approvalActionForOutcome(
  outcome: CodexExecApprovalDecisionOutcome,
): 'approve' | 'deny' | 'revoke' {
  if (outcome === 'approved') {
    return 'approve';
  }

  if (outcome === 'denied') {
    return 'deny';
  }

  return 'revoke';
}

async function readAllowedFixture(fixturePath: string): Promise<string> {
  if (isAbsolute(fixturePath) || fixturePath.split(/[\\/]+/).includes('..')) {
    throw new Error('Fixture path must be repository-relative and stay within fixtures.');
  }

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
  return (
    relativePath.length > 0 && !relativePath.startsWith('..') && !relativePath.includes(`..${sep}`)
  );
}

function toWorkspacePath(path: string): string {
  return relative(findWorkspaceRoot(process.cwd()), path).split(sep).join('/');
}

if (process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])) {
  await runCli();
}

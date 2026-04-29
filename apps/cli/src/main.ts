#!/usr/bin/env node
import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, extname, isAbsolute, parse, relative, resolve, sep } from 'node:path';
import { Command } from 'commander';
import {
  createCodexExecApprovalArtifactFromDecision,
  createCodexExecApprovalTransitionResult,
  buildControlPlaneDrilldownView,
  createCodexExecControlPlaneAuditEvents,
  createCodexExecControlPlaneEvidenceRefs,
  createCodexExecControlPlaneTimeline,
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
  getAuditDetail,
  getEvidenceDetail,
  parseCodexExecLiveConfigFile,
  replayCodexExecFixture,
  runCodexExecPreflight,
  searchAuditEvents,
  searchEvidence,
  summarizeCodexExecReplay,
} from '@codexhub/codex-kernel';
import type {
  CodexExecApprovalDecisionOutcome,
  CodexExecAuditQuery,
  CodexExecConfigLoadResult,
  CodexExecEvidenceQuery,
  CodexExecLiveRunRecord,
  CodexExecTimelineFilter,
  CodexReplaySummary,
} from '@codexhub/contracts';
import {
  type MockDevelopmentOrchestrationResult,
  runMockDevelopmentOrchestration,
} from '@codexhub/orchestrator-kernel';
import { DefaultPolicyEngine } from '@codexhub/security-kernel';
import { WorkflowRunner, createMockWorkflowDefinition } from '@codexhub/workflow-kernel';

const supervisorUrl = process.env.CODEXHUB_SUPERVISOR_URL ?? 'http://127.0.0.1:3333';

export interface CodexExecTimelineCliOptions {
  source?: string;
  status?: string;
  includeEvidence?: boolean;
  includeAudit?: boolean;
  json?: boolean;
}

export interface CodexExecEvidenceListCliOptions {
  dryRun?: string;
  kind?: string;
  json?: boolean;
}

export interface CodexExecAuditListCliOptions {
  dryRun?: string;
  action?: string;
  json?: boolean;
}

export interface CodexExecJsonCliOptions {
  json?: boolean;
}

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

  execCommand
    .command('timeline')
    .argument('<dryRunId>')
    .option('--source <source>', 'Filter timeline by source')
    .option('--status <status>', 'Filter timeline by event status')
    .option('--include-evidence', 'Include evidence events in timeline output')
    .option('--include-audit', 'Include audit events in timeline output')
    .option('--json', 'Print full JSON output')
    .description('Read a disabled control-plane timeline for a dry-run record')
    .action(async (dryRunId: string, options: CodexExecTimelineCliOptions) => {
      const result = await getCodexExecTimeline(dryRunId, options);
      console.log(formatCodexExecTimelineOutput(result, options));
    });

  const evidenceCommand = execCommand
    .command('evidence')
    .description('Read evidence refs for disabled control-plane records');

  evidenceCommand
    .command('list')
    .option('--dry-run <dryRunId>', 'Filter by dry-run id')
    .option('--kind <kind>', 'Filter by evidence kind')
    .option('--json', 'Print full JSON output')
    .description('List evidence refs without exposing bodies')
    .action(async (options: CodexExecEvidenceListCliOptions) => {
      const result = await listCodexExecEvidence(options);
      console.log(formatCodexExecEvidenceListOutput(result, options));
    });

  evidenceCommand
    .argument('<evidenceId>')
    .option('--json', 'Print full JSON output')
    .description('Read one evidence ref without exposing bodies')
    .action(async (evidenceId: string, options: CodexExecJsonCliOptions) => {
      const result = await getCodexExecEvidence(evidenceId);
      console.log(formatCodexExecDetailOutput('Codex control evidence detail', result, options));
    });

  const auditCommand = execCommand
    .command('audit')
    .description('Read audit events for disabled control-plane records');

  auditCommand
    .command('list')
    .option('--dry-run <dryRunId>', 'Filter by dry-run id')
    .option('--action <action>', 'Filter by audit action')
    .option('--json', 'Print full JSON output')
    .description('List audit events without exposing bodies')
    .action(async (options: CodexExecAuditListCliOptions) => {
      const result = await listCodexExecAudit(options);
      console.log(formatCodexExecAuditListOutput(result, options));
    });

  auditCommand
    .argument('<auditEventId>')
    .option('--json', 'Print full JSON output')
    .description('Read one audit event without exposing bodies')
    .action(async (auditEventId: string, options: CodexExecJsonCliOptions) => {
      const result = await getCodexExecAudit(auditEventId);
      console.log(formatCodexExecDetailOutput('Codex control audit detail', result, options));
    });

  execCommand
    .command('drilldown')
    .argument('<dryRunId>')
    .option('--json', 'Print full JSON output')
    .description('Read timeline, evidence, and audit summaries for a dry-run record')
    .action(async (dryRunId: string, options: CodexExecJsonCliOptions) => {
      const result = await getCodexExecDrilldown(dryRunId);
      console.log(formatCodexExecDrilldownOutput(result, options));
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

export async function replayCodexFixture(fixturePath: string): Promise<CodexReplaySummary> {
  try {
    const response = await fetch(`${supervisorUrl}/api/codex/replay-fixture`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ fixturePath }),
    });

    if (!response.ok) {
      throw new Error(`supervisor returned ${response.status}`);
    }

    return (await response.json()) as CodexReplaySummary;
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
    const executionGateResult = evaluateCodexExecExecutionGate(
      dryRunPlan,
      policyDecision,
      undefined,
      liveConfig,
    );

    return {
      executionGateResult,
      liveConfig,
      liveExecution: false,
      externalProcessStarted: false,
      executionDisabled: true,
      degraded: true,
      reason: 'supervisor unavailable; local control-plane fallback used',
    };
  }
}

export async function getCodexExecTimeline(
  dryRunId: string,
  options: CodexExecTimelineCliOptions = {},
): Promise<Record<string, unknown>> {
  const query = createTimelineQueryString(options);
  try {
    const response = await fetch(
      `${supervisorUrl}/api/codex/exec/timeline/${encodeURIComponent(dryRunId)}${query}`,
    );

    if (!response.ok) {
      throw new Error(`supervisor returned ${response.status}`);
    }

    return (await response.json()) as Record<string, unknown>;
  } catch {
    const record = createLocalCodexExecControlPlaneRecord(dryRunId);
    const timeline = createCodexExecControlPlaneTimeline({
      record,
      filter: createTimelineFilterFromCliOptions(options),
    });

    return {
      timeline,
      query: {
        dryRunId,
        filter: createTimelineFilterFromCliOptions(options),
      },
      liveExecution: false,
      externalProcessStarted: false,
      executionDisabled: true,
      degraded: true,
      reason: 'supervisor unavailable; local control-plane fallback used',
    };
  }
}

export async function getCodexExecEvidence(evidenceId: string): Promise<Record<string, unknown>> {
  try {
    const response = await fetch(
      `${supervisorUrl}/api/codex/exec/evidence/${encodeURIComponent(evidenceId)}`,
    );

    if (!response.ok) {
      throw new Error(`supervisor returned ${response.status}`);
    }

    return (await response.json()) as Record<string, unknown>;
  } catch {
    const record = createLocalCodexExecControlPlaneRecord('codex_dry_run_fixture');
    const detail = getEvidenceDetail({
      evidenceRefId: evidenceId,
      records: [record],
    });

    return {
      detail,
      liveExecution: false,
      externalProcessStarted: false,
      executionDisabled: true,
      degraded: true,
      reason: 'supervisor unavailable; local control-plane fallback used',
    };
  }
}

export async function listCodexExecEvidence(
  options: CodexExecEvidenceListCliOptions = {},
): Promise<Record<string, unknown>> {
  const query = createEvidenceQueryString(options);

  try {
    const response = await fetch(`${supervisorUrl}/api/codex/exec/evidence${query}`);

    if (!response.ok) {
      throw new Error(`supervisor returned ${response.status}`);
    }

    return (await response.json()) as Record<string, unknown>;
  } catch {
    const record = createLocalCodexExecControlPlaneRecord(
      options.dryRun ?? 'codex_dry_run_fixture',
    );
    const result = searchEvidence({
      query: createEvidenceQueryFromCliOptions(options, record.dryRunPlanId),
      records: [record],
    });

    return {
      result,
      liveExecution: false,
      externalProcessStarted: false,
      executionDisabled: true,
      degraded: true,
      reason: 'supervisor unavailable; local control-plane fallback used',
    };
  }
}

export async function getCodexExecAudit(auditEventId: string): Promise<Record<string, unknown>> {
  try {
    const response = await fetch(
      `${supervisorUrl}/api/codex/exec/audit/${encodeURIComponent(auditEventId)}`,
    );

    if (!response.ok) {
      throw new Error(`supervisor returned ${response.status}`);
    }

    return (await response.json()) as Record<string, unknown>;
  } catch {
    const record = createLocalCodexExecControlPlaneRecord('codex_dry_run_fixture');
    const detail = getAuditDetail({
      auditEventId,
      records: [record],
    });

    return {
      detail,
      liveExecution: false,
      externalProcessStarted: false,
      executionDisabled: true,
      degraded: true,
      reason: 'supervisor unavailable; local control-plane fallback used',
    };
  }
}

export async function listCodexExecAudit(
  options: CodexExecAuditListCliOptions = {},
): Promise<Record<string, unknown>> {
  const query = createAuditQueryString(options);

  try {
    const response = await fetch(`${supervisorUrl}/api/codex/exec/audit${query}`);

    if (!response.ok) {
      throw new Error(`supervisor returned ${response.status}`);
    }

    return (await response.json()) as Record<string, unknown>;
  } catch {
    const record = createLocalCodexExecControlPlaneRecord(
      options.dryRun ?? 'codex_dry_run_fixture',
    );
    const result = searchAuditEvents({
      query: createAuditQueryFromCliOptions(options, record.dryRunPlanId),
      records: [record],
    });

    return {
      result,
      liveExecution: false,
      externalProcessStarted: false,
      executionDisabled: true,
      degraded: true,
      reason: 'supervisor unavailable; local control-plane fallback used',
    };
  }
}

export async function getCodexExecDrilldown(dryRunId: string): Promise<Record<string, unknown>> {
  try {
    const response = await fetch(
      `${supervisorUrl}/api/codex/exec/drilldown/${encodeURIComponent(dryRunId)}`,
    );

    if (!response.ok) {
      throw new Error(`supervisor returned ${response.status}`);
    }

    return (await response.json()) as Record<string, unknown>;
  } catch {
    const record = createLocalCodexExecControlPlaneRecord(dryRunId);
    const drilldown = buildControlPlaneDrilldownView({
      dryRunId: record.dryRunPlanId,
      records: [record],
    });

    return {
      drilldown,
      liveExecution: false,
      externalProcessStarted: false,
      executionDisabled: true,
      degraded: true,
      reason: 'supervisor unavailable; local control-plane fallback used',
    };
  }
}

export function formatCodexExecTimelineOutput(
  result: Record<string, unknown>,
  options: CodexExecTimelineCliOptions = {},
): string {
  if (options.json) {
    return JSON.stringify(result, null, 2);
  }

  const timeline = result.timeline as
    | {
        dryRunId?: string;
        status?: string;
        eventCount?: number;
        evidenceCount?: number;
        auditEventCount?: number;
        liveExecution?: boolean;
        externalProcessStarted?: boolean;
        executionDisabled?: boolean;
        events?: Array<{ sourceKind: string; status: string; summary: string }>;
      }
    | undefined;

  if (!timeline) {
    return JSON.stringify(result, null, 2);
  }

  const eventLines = (timeline.events ?? [])
    .slice(0, 8)
    .map((event) => `- ${event.sourceKind}:${event.status} ${event.summary}`);

  return [
    'Codex control timeline',
    `dryRunId: ${timeline.dryRunId ?? 'unknown'}`,
    `status: ${timeline.status ?? 'unknown'}`,
    `events: ${timeline.eventCount ?? 0}`,
    `evidence: ${timeline.evidenceCount ?? 0}`,
    `audit: ${timeline.auditEventCount ?? 0}`,
    `liveExecution=${String(timeline.liveExecution ?? false)}`,
    `externalProcessStarted=${String(timeline.externalProcessStarted ?? false)}`,
    `executionDisabled=${String(timeline.executionDisabled ?? true)}`,
    eventLines.length > 0 ? 'filtered events:' : 'filtered events: none',
    ...eventLines,
  ].join('\n');
}

export function formatCodexExecEvidenceListOutput(
  result: Record<string, unknown>,
  options: CodexExecEvidenceListCliOptions = {},
): string {
  if (options.json) {
    return JSON.stringify(result, null, 2);
  }

  const searchResult = result.result as
    | {
        count?: number;
        items?: Array<{ evidenceRefId?: string; kind?: string; summary?: string; hash?: string }>;
      }
    | undefined;
  const lines = (searchResult?.items ?? [])
    .slice(0, 8)
    .map(
      (item) => `- ${item.evidenceRefId ?? 'unknown'} ${item.kind ?? 'unknown'} ${item.hash ?? ''}`,
    );

  return [
    'Codex control evidence search',
    `count: ${searchResult?.count ?? 0}`,
    noLiveFlagsText(result),
    lines.length > 0 ? 'items:' : 'items: none',
    ...lines,
  ].join('\n');
}

export function formatCodexExecAuditListOutput(
  result: Record<string, unknown>,
  options: CodexExecAuditListCliOptions = {},
): string {
  if (options.json) {
    return JSON.stringify(result, null, 2);
  }

  const searchResult = result.result as
    | {
        count?: number;
        items?: Array<{ auditEventId?: string; action?: string; outcome?: string }>;
      }
    | undefined;
  const lines = (searchResult?.items ?? [])
    .slice(0, 8)
    .map(
      (item) =>
        `- ${item.auditEventId ?? 'unknown'} ${item.action ?? 'unknown'} ${item.outcome ?? ''}`,
    );

  return [
    'Codex control audit search',
    `count: ${searchResult?.count ?? 0}`,
    noLiveFlagsText(result),
    lines.length > 0 ? 'items:' : 'items: none',
    ...lines,
  ].join('\n');
}

export function formatCodexExecDetailOutput(
  title: string,
  result: Record<string, unknown>,
  options: CodexExecJsonCliOptions = {},
): string {
  if (options.json) {
    return JSON.stringify(result, null, 2);
  }

  const detail = result.detail as
    | {
        status?: string;
        evidenceRefId?: string;
        auditEventId?: string;
        kind?: string;
        action?: string;
        summary?: string;
        hash?: string;
      }
    | undefined;

  return [
    title,
    `status: ${detail?.status ?? 'unknown'}`,
    `id: ${detail?.evidenceRefId ?? detail?.auditEventId ?? 'unknown'}`,
    `kind/action: ${detail?.kind ?? detail?.action ?? 'unknown'}`,
    detail?.summary ? `summary: ${detail.summary}` : undefined,
    detail?.hash ? `hash: ${detail.hash}` : undefined,
    noLiveFlagsText(result),
  ]
    .filter((line): line is string => Boolean(line))
    .join('\n');
}

export function formatCodexExecDrilldownOutput(
  result: Record<string, unknown>,
  options: CodexExecJsonCliOptions = {},
): string {
  if (options.json) {
    return JSON.stringify(result, null, 2);
  }

  const drilldown = result.drilldown as
    | {
        dryRunId?: string;
        status?: string;
        evidenceCount?: number;
        auditEventCount?: number;
        timeline?: { status?: string; eventCount?: number };
      }
    | undefined;

  return [
    'Codex control drilldown',
    `dryRunId: ${drilldown?.dryRunId ?? 'unknown'}`,
    `status: ${drilldown?.status ?? 'unknown'}`,
    `timeline: ${drilldown?.timeline?.status ?? 'none'} (${drilldown?.timeline?.eventCount ?? 0} events)`,
    `evidence: ${drilldown?.evidenceCount ?? 0}`,
    `audit: ${drilldown?.auditEventCount ?? 0}`,
    noLiveFlagsText(result),
  ].join('\n');
}

function createTimelineQueryString(options: CodexExecTimelineCliOptions): string {
  const params = new URLSearchParams();

  if (options.source) {
    params.set('source', options.source);
  }

  if (options.status) {
    params.set('status', options.status);
  }

  params.set('includeEvidence', String(options.includeEvidence === true));
  params.set('includeAudit', String(options.includeAudit === true));

  const queryString = params.toString();
  return queryString ? `?${queryString}` : '';
}

function createTimelineFilterFromCliOptions(
  options: CodexExecTimelineCliOptions,
): CodexExecTimelineFilter {
  const filter: CodexExecTimelineFilter = {
    includeEvidence: options.includeEvidence === true,
    includeAudit: options.includeAudit === true,
  };

  if (options.source && isTimelineFilterSource(options.source)) {
    filter.source = options.source;
  }

  if (options.status) {
    filter.status = options.status;
  }

  return filter;
}

function createEvidenceQueryString(options: CodexExecEvidenceListCliOptions): string {
  const params = new URLSearchParams();

  if (options.dryRun) {
    params.set('dryRunId', options.dryRun);
  }

  if (options.kind) {
    params.set('kind', options.kind);
  }

  const queryString = params.toString();
  return queryString ? `?${queryString}` : '';
}

function createAuditQueryString(options: CodexExecAuditListCliOptions): string {
  const params = new URLSearchParams();

  if (options.dryRun) {
    params.set('dryRunId', options.dryRun);
  }

  if (options.action) {
    params.set('action', options.action);
  }

  const queryString = params.toString();
  return queryString ? `?${queryString}` : '';
}

function createEvidenceQueryFromCliOptions(
  options: CodexExecEvidenceListCliOptions,
  fallbackDryRunId: string,
): Partial<CodexExecEvidenceQuery> {
  return {
    dryRunId: options.dryRun ?? fallbackDryRunId,
    kind: options.kind as CodexExecEvidenceQuery['kind'],
    limit: 20,
  };
}

function createAuditQueryFromCliOptions(
  options: CodexExecAuditListCliOptions,
  fallbackDryRunId: string,
): Partial<CodexExecAuditQuery> {
  return {
    dryRunId: options.dryRun ?? fallbackDryRunId,
    action: options.action,
    limit: 20,
  };
}

function noLiveFlagsText(result: Record<string, unknown>): string {
  return [
    `liveExecution=${String(result.liveExecution ?? false)}`,
    `externalProcessStarted=${String(result.externalProcessStarted ?? false)}`,
    `executionDisabled=${String(result.executionDisabled ?? true)}`,
  ].join('\n');
}

function isTimelineFilterSource(
  value: string,
): value is NonNullable<CodexExecTimelineFilter['source']> {
  return [
    'config',
    'dry_run',
    'command_preview',
    'policy',
    'preflight',
    'approval',
    'approval_request',
    'approval_decision',
    'approval_state',
    'approval_artifact',
    'gate',
    'evidence',
    'audit',
  ].includes(value);
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

  const record = createCodexExecDisabledLiveRunRecord(
    dryRunPlan,
    policyDecision,
    'live adapter disabled in CLI fallback',
  );
  const reboundEvidenceRefs = record.evidenceRefs.map((ref) => ({
    ...ref,
    metadata: {
      ...(ref.metadata ?? {}),
      dryRunPlanId: dryRunId,
      liveRunRecordId: record.id,
    },
  }));
  const reboundAuditEvents = record.auditEvents.map((event) => ({
    ...event,
    evidenceRefs: event.evidenceRefs.map(
      (ref) => reboundEvidenceRefs.find((candidate) => candidate.id === ref.id) ?? ref,
    ),
    metadata: {
      ...(event.metadata ?? {}),
      dryRunPlanId: dryRunId,
      liveRunRecordId: record.id,
    },
  }));

  return {
    ...record,
    dryRunPlanId: dryRunId,
    dryRunPlan: {
      ...record.dryRunPlan,
      id: dryRunId,
    },
    commandPreview: {
      ...record.commandPreview,
      dryRunPlanId: dryRunId,
    },
    policyDecision: {
      ...record.policyDecision,
      actionId: dryRunId,
    },
    approvalRequirement: {
      ...record.approvalRequirement,
      dryRunPlanId: dryRunId,
      policyDecisionId: record.policyDecision.id,
    },
    evidenceRefs: reboundEvidenceRefs,
    auditEvents: reboundAuditEvents,
  };
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

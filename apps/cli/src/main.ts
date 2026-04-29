#!/usr/bin/env node
import { existsSync } from 'node:fs';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, extname, isAbsolute, parse, relative, resolve, sep } from 'node:path';
import { Command } from 'commander';
import {
  createCodexExecApprovalArtifactFromDecision,
  createCodexExecApprovalTransitionResult,
  buildControlPlaneDrilldownView,
  buildCodexExecControlPlaneReport,
  buildCodexExecGovernanceReviewPackage,
  buildCodexExecReportReviewHistory,
  buildCodexExecReviewerHandoffSummary,
  compareCodexExecReportReviews,
  createCodexExecReportReviewDraft,
  createCodexExecReportReviewRecord,
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
  getLatestCodexExecReportReview,
  parseCodexExecLiveConfigFile,
  replayCodexExecFixture,
  runCodexExecPreflight,
  searchAuditEvents,
  searchEvidence,
  renderCodexExecControlPlaneReportJson,
  renderCodexExecControlPlaneReportMarkdown,
  summarizeCodexExecReportReview,
  listCodexExecReportReviewSummaries,
  summarizeCodexExecReplay,
} from '@codexhub/codex-kernel';
import type {
  CodexExecApprovalDecisionOutcome,
  CodexExecAuditQuery,
  CodexExecConfigLoadResult,
  CodexExecControlPlaneReportFormat,
  CodexExecEvidenceQuery,
  CodexExecLiveRunRecord,
  CodexExecReportRecommendation,
  CodexExecReportReviewQuery,
  CodexExecReportReviewRecord,
  CodexExecReportReviewStatus,
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

export interface CodexExecReportCliOptions {
  format?: string;
  includeEvidence?: boolean;
  includeAudit?: boolean;
  out?: string;
}

export interface CodexExecReportReviewCreateCliOptions extends CodexExecJsonCliOptions {
  reviewer?: string;
  status?: string;
  recommendation?: string;
  notesSummary?: string;
}

export interface CodexExecReportReviewListCliOptions extends CodexExecJsonCliOptions {
  dryRun?: string;
  status?: string;
  recommendation?: string;
}

export interface CodexExecReportReviewHandoffCliOptions extends CodexExecJsonCliOptions {
  from?: string;
  to?: string;
}

export interface CodexExecGovernancePackageCliOptions extends CodexExecJsonCliOptions {
  includeEvidence?: boolean;
  includeAudit?: boolean;
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

  execCommand
    .command('report')
    .argument('<dryRunId>')
    .option('--format <format>', 'json or markdown', 'json')
    .option('--include-evidence', 'Include evidence summaries')
    .option('--include-audit', 'Include audit summaries')
    .option('--out <relativePath>', 'Write safe report text under reports/ or tmp/')
    .description('Read a disabled control-plane report for a dry-run record')
    .action(async (dryRunId: string, options: CodexExecReportCliOptions) => {
      const result = await getCodexExecReport(dryRunId, options);
      const output = formatCodexExecReportOutput(result);

      if (options.out) {
        const written = await writeCodexExecReportOutput(options.out, output);
        console.log([output, '', `written: ${written.workspacePath}`].join('\n'));
        return;
      }

      console.log(output);
    });

  execCommand
    .command('governance-package')
    .argument('<dryRunId>')
    .option('--include-evidence', 'Include evidence summaries')
    .option('--include-audit', 'Include audit summaries')
    .option('--json', 'Print full JSON output')
    .description('Read ADR readiness governance package without granting execution')
    .action(async (dryRunId: string, options: CodexExecGovernancePackageCliOptions) => {
      const result = await getCodexExecGovernancePackage(dryRunId, options);
      console.log(formatCodexExecGovernancePackageOutput(result, options));
    });

  const reportReviewCommand = execCommand
    .command('report-review')
    .description('Read and create non-executing report review records');

  reportReviewCommand
    .command('create')
    .argument('<dryRunId>')
    .option('--reviewer <label>', 'Reviewer label', 'local-operator')
    .option('--status <status>', 'reviewed, changes_requested, rejected, or archived', 'reviewed')
    .option(
      '--recommendation <recommendation>',
      'no_go, needs_changes, ready_for_adr, or ready_for_read_only_live_review',
      'ready_for_adr',
    )
    .option(
      '--notes-summary <summary>',
      'Review notes summary',
      'No-live boundary intact; live adapter still requires ADR.',
    )
    .option('--json', 'Print full JSON output')
    .description('Create a read-only report review record; recommendation never grants execution')
    .action(async (dryRunId: string, options: CodexExecReportReviewCreateCliOptions) => {
      const result = await createCodexExecReportReview(dryRunId, options);
      console.log(formatCodexExecReportReviewOutput(result, options));
    });

  reportReviewCommand
    .command('get')
    .argument('<reviewId>')
    .option('--json', 'Print full JSON output')
    .description('Read one report review record')
    .action(async (reviewId: string, options: CodexExecJsonCliOptions) => {
      const result = await getCodexExecReportReview(reviewId);
      console.log(formatCodexExecReportReviewOutput(result, options));
    });

  reportReviewCommand
    .command('list')
    .option('--dry-run <dryRunId>', 'Filter by dry-run id')
    .option('--status <status>', 'Filter by review status')
    .option('--recommendation <recommendation>', 'Filter by recommendation')
    .option('--json', 'Print full JSON output')
    .description('List report review records')
    .action(async (options: CodexExecReportReviewListCliOptions) => {
      const result = await listCodexExecReportReviews(options);
      console.log(formatCodexExecReportReviewListOutput(result, options));
    });

  reportReviewCommand
    .command('latest')
    .argument('<dryRunId>')
    .option('--json', 'Print full JSON output')
    .description('Read the latest report review record for a dry-run id')
    .action(async (dryRunId: string, options: CodexExecJsonCliOptions) => {
      const result = await getLatestCodexExecReportReviewCommand(dryRunId);
      console.log(formatCodexExecReportReviewOutput(result, options));
    });

  reportReviewCommand
    .command('history')
    .option('--dry-run <dryRunId>', 'Filter by dry-run id')
    .option('--status <status>', 'Filter by review status')
    .option('--recommendation <recommendation>', 'Filter by recommendation')
    .option('--json', 'Print full JSON output')
    .description('Read metadata-only report review history')
    .action(async (options: CodexExecReportReviewListCliOptions) => {
      const result = await getCodexExecReportReviewHistory(options);
      console.log(formatCodexExecReportReviewHistoryOutput(result, options));
    });

  reportReviewCommand
    .command('compare')
    .argument('<leftReviewId>')
    .argument('<rightReviewId>')
    .option('--json', 'Print full JSON output')
    .description('Compare two report reviews without exposing bodies')
    .action(
      async (leftReviewId: string, rightReviewId: string, options: CodexExecJsonCliOptions) => {
        const result = await compareCodexExecReportReviewCommand(leftReviewId, rightReviewId);
        console.log(formatCodexExecReportReviewComparisonOutput(result, options));
      },
    );

  reportReviewCommand
    .command('handoff')
    .argument('<dryRunId>')
    .option('--from <label>', 'Current reviewer label')
    .option('--to <label>', 'Next reviewer label')
    .option('--json', 'Print full JSON output')
    .description('Read a non-executing reviewer handoff summary')
    .action(async (dryRunId: string, options: CodexExecReportReviewHandoffCliOptions) => {
      const result = await getCodexExecReportReviewHandoff(dryRunId, options);
      console.log(formatCodexExecReportReviewHandoffOutput(result, options));
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

export async function getCodexExecReport(
  dryRunId: string,
  options: CodexExecReportCliOptions = {},
): Promise<Record<string, unknown>> {
  const reportFormat = normalizeReportFormat(options.format);
  const query = createReportQueryString({
    ...options,
    format: reportFormat,
  });

  try {
    const response = await fetch(
      `${supervisorUrl}/api/codex/exec/report/${encodeURIComponent(dryRunId)}${query}`,
    );

    if (!response.ok) {
      throw new Error(`supervisor returned ${response.status}`);
    }

    return (await response.json()) as Record<string, unknown>;
  } catch {
    const record = createLocalCodexExecControlPlaneRecord(dryRunId);
    const report = buildCodexExecControlPlaneReport({
      dryRunId: record.dryRunPlanId,
      record,
      format: reportFormat,
      includeEvidence: options.includeEvidence ?? true,
      includeAudit: options.includeAudit ?? true,
      degraded: true,
      reason: 'supervisor unavailable; local control-plane fallback used',
    });
    const exportResult =
      reportFormat === 'markdown'
        ? renderCodexExecControlPlaneReportMarkdown(report)
        : renderCodexExecControlPlaneReportJson(report);

    return {
      report,
      exportResult,
      renderedContent: exportResult.renderedContent,
      liveExecution: false,
      externalProcessStarted: false,
      executionDisabled: true,
      degraded: true,
      reason: 'supervisor unavailable; local control-plane fallback used',
    };
  }
}

export async function getCodexExecGovernancePackage(
  dryRunId: string,
  options: CodexExecGovernancePackageCliOptions = {},
): Promise<Record<string, unknown>> {
  const query = createGovernancePackageQueryString(options);

  try {
    const response = await fetch(
      `${supervisorUrl}/api/codex/exec/governance-package/${encodeURIComponent(dryRunId)}${query}`,
    );

    if (!response.ok) {
      throw new Error(`supervisor returned ${response.status}`);
    }

    return (await response.json()) as Record<string, unknown>;
  } catch {
    const record = createLocalCodexExecControlPlaneRecord(dryRunId);
    const reviews = createLocalReportReviewRecords(record.dryRunPlanId);
    const governancePackage = buildCodexExecGovernanceReviewPackage({
      dryRunId: record.dryRunPlanId,
      record,
      reportReviews: reviews,
      includeEvidence: options.includeEvidence ?? true,
      includeAudit: options.includeAudit ?? true,
      degraded: true,
      reason: 'supervisor unavailable; local control-plane fallback used',
    });

    return {
      governancePackage,
      recommendationGrantsExecution: false,
      liveExecution: false,
      externalProcessStarted: false,
      executionDisabled: true,
      degraded: true,
      reason: 'supervisor unavailable; local control-plane fallback used',
    };
  }
}

export async function createCodexExecReportReview(
  dryRunId: string,
  options: CodexExecReportReviewCreateCliOptions = {},
): Promise<Record<string, unknown>> {
  const status = normalizeReportReviewStatus(options.status);
  const recommendation = normalizeReportReviewRecommendation(options.recommendation);

  try {
    const response = await fetch(`${supervisorUrl}/api/codex/exec/report-review`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        dryRunId,
        reviewerLabel: options.reviewer ?? 'local-operator',
        status,
        recommendation,
        notesSummary:
          options.notesSummary ?? 'No-live boundary intact; live adapter still requires ADR.',
      }),
    });

    if (!response.ok) {
      throw new Error(`supervisor returned ${response.status}`);
    }

    return (await response.json()) as Record<string, unknown>;
  } catch {
    const record = createLocalCodexExecControlPlaneRecord(dryRunId);
    const report = buildCodexExecControlPlaneReport({
      dryRunId: record.dryRunPlanId,
      record,
      degraded: true,
      reason: 'supervisor unavailable; local control-plane fallback used',
    });
    const reviewRecord = createCodexExecReportReviewRecord({
      report,
      reviewerLabel: options.reviewer,
      status,
      recommendation,
      notesSummary:
        options.notesSummary ?? 'No-live boundary intact; live adapter still requires ADR.',
    });

    return createReportReviewResponse(reviewRecord, true);
  }
}

export async function getCodexExecReportReview(reviewId: string): Promise<Record<string, unknown>> {
  try {
    const response = await fetch(
      `${supervisorUrl}/api/codex/exec/report-review/${encodeURIComponent(reviewId)}`,
    );

    if (!response.ok) {
      throw new Error(`supervisor returned ${response.status}`);
    }

    return (await response.json()) as Record<string, unknown>;
  } catch {
    const reviewRecord = {
      ...createCodexExecReportReviewDraft({
        dryRunId: 'codex_dry_run_fixture',
        reviewerLabel: 'cli-fallback',
        notesSummary: `Supervisor unavailable while reading review ${reviewId}.`,
      }),
      id: reviewId,
    };

    return createReportReviewResponse(reviewRecord, true);
  }
}

export async function listCodexExecReportReviews(
  options: CodexExecReportReviewListCliOptions = {},
): Promise<Record<string, unknown>> {
  const query = createReportReviewQueryString(options);

  try {
    const response = await fetch(`${supervisorUrl}/api/codex/exec/report-reviews${query}`);

    if (!response.ok) {
      throw new Error(`supervisor returned ${response.status}`);
    }

    return (await response.json()) as Record<string, unknown>;
  } catch {
    const record = createLocalCodexExecControlPlaneRecord(
      options.dryRun ?? 'codex_dry_run_fixture',
    );
    const report = buildCodexExecControlPlaneReport({
      dryRunId: record.dryRunPlanId,
      record,
      degraded: true,
      reason: 'supervisor unavailable; local control-plane fallback used',
    });
    const reviewRecord = createCodexExecReportReviewRecord({
      report,
      reviewerLabel: 'cli-fallback',
      status: normalizeReportReviewStatus(options.status ?? 'reviewed'),
      recommendation: normalizeReportReviewRecommendation(
        options.recommendation ?? 'ready_for_adr',
      ),
      notesSummary: 'Supervisor unavailable; local read-only review list fallback used.',
    });
    const queryObject = createReportReviewQueryFromCliOptions(options, record.dryRunPlanId);
    const reviews = [reviewRecord].filter((candidate) => {
      if (queryObject.dryRunId && candidate.dryRunId !== queryObject.dryRunId) {
        return false;
      }

      if (queryObject.status && candidate.status !== queryObject.status) {
        return false;
      }

      if (queryObject.recommendation && candidate.recommendation !== queryObject.recommendation) {
        return false;
      }

      return true;
    });

    return {
      reviews,
      summaries: listCodexExecReportReviewSummaries(reviews, queryObject),
      recommendationGrantsExecution: false,
      liveExecution: false,
      externalProcessStarted: false,
      executionDisabled: true,
      degraded: true,
      reason: 'supervisor unavailable; local control-plane fallback used',
    };
  }
}

export async function getLatestCodexExecReportReviewCommand(
  dryRunId: string,
): Promise<Record<string, unknown>> {
  try {
    const response = await fetch(
      `${supervisorUrl}/api/codex/exec/report-reviews/latest/${encodeURIComponent(dryRunId)}`,
    );

    if (!response.ok) {
      throw new Error(`supervisor returned ${response.status}`);
    }

    return (await response.json()) as Record<string, unknown>;
  } catch {
    const reviews = createLocalReportReviewRecords(dryRunId);
    const reviewRecord = getLatestCodexExecReportReview(reviews, reviews[0]?.dryRunId ?? dryRunId);

    return reviewRecord
      ? createReportReviewResponse(reviewRecord, true)
      : createReportReviewResponse(
          createCodexExecReportReviewDraft({
            dryRunId,
            reviewerLabel: 'cli-fallback',
          }),
          true,
        );
  }
}

export async function getCodexExecReportReviewHistory(
  options: CodexExecReportReviewListCliOptions = {},
): Promise<Record<string, unknown>> {
  const query = createReportReviewQueryString(options);

  try {
    const response = await fetch(`${supervisorUrl}/api/codex/exec/report-reviews/history${query}`);

    if (!response.ok) {
      throw new Error(`supervisor returned ${response.status}`);
    }

    return (await response.json()) as Record<string, unknown>;
  } catch {
    const reviews = createLocalReportReviewRecords(options.dryRun ?? 'codex_dry_run_fixture');
    const queryObject = createReportReviewQueryFromCliOptions(options, reviews[0]?.dryRunId ?? '');
    const history = buildCodexExecReportReviewHistory(reviews, queryObject);

    return {
      history,
      recommendationGrantsExecution: false,
      liveExecution: false,
      externalProcessStarted: false,
      executionDisabled: true,
      degraded: true,
      reason: 'supervisor unavailable; local control-plane fallback used',
    };
  }
}

export async function compareCodexExecReportReviewCommand(
  leftReviewId: string,
  rightReviewId: string,
): Promise<Record<string, unknown>> {
  const query = new URLSearchParams({
    leftReviewId,
    rightReviewId,
  }).toString();

  try {
    const response = await fetch(`${supervisorUrl}/api/codex/exec/report-reviews/compare?${query}`);

    if (!response.ok) {
      throw new Error(`supervisor returned ${response.status}`);
    }

    return (await response.json()) as Record<string, unknown>;
  } catch {
    const reviews = createLocalReportReviewRecords('codex_dry_run_fixture');
    const left = { ...(reviews[1] ?? reviews[0]), id: leftReviewId };
    const right = { ...(reviews[0] ?? reviews[1]), id: rightReviewId };

    return {
      comparison: compareCodexExecReportReviews(left, right),
      recommendationGrantsExecution: false,
      liveExecution: false,
      externalProcessStarted: false,
      executionDisabled: true,
      degraded: true,
      reason: 'supervisor unavailable; local control-plane fallback used',
    };
  }
}

export async function getCodexExecReportReviewHandoff(
  dryRunId: string,
  options: CodexExecReportReviewHandoffCliOptions = {},
): Promise<Record<string, unknown>> {
  const params = new URLSearchParams();

  if (options.from) {
    params.set('fromReviewer', options.from);
  }

  if (options.to) {
    params.set('toReviewer', options.to);
  }

  const query = params.toString();

  try {
    const response = await fetch(
      `${supervisorUrl}/api/codex/exec/report-reviews/handoff/${encodeURIComponent(dryRunId)}${
        query ? `?${query}` : ''
      }`,
    );

    if (!response.ok) {
      throw new Error(`supervisor returned ${response.status}`);
    }

    return (await response.json()) as Record<string, unknown>;
  } catch {
    const reviews = createLocalReportReviewRecords(dryRunId);
    const handoff = buildCodexExecReviewerHandoffSummary(
      reviews,
      reviews[0]?.dryRunId ?? dryRunId,
      {
        fromReviewer: options.from,
        toReviewer: options.to,
      },
    );

    return {
      handoff,
      recommendationGrantsExecution: false,
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

export function formatCodexExecReportOutput(result: Record<string, unknown>): string {
  const exportResult = result.exportResult as
    | {
        renderedContent?: string;
        format?: string;
      }
    | undefined;

  if (exportResult?.renderedContent) {
    return exportResult.renderedContent;
  }

  const report = result.report as
    | {
        dryRunId?: string;
        status?: string;
        summary?: { sectionCount?: number; evidenceCount?: number; auditEventCount?: number };
      }
    | undefined;

  return [
    'Codex control report',
    `dryRunId: ${report?.dryRunId ?? 'unknown'}`,
    `status: ${report?.status ?? 'unknown'}`,
    `sections: ${report?.summary?.sectionCount ?? 0}`,
    `evidence: ${report?.summary?.evidenceCount ?? 0}`,
    `audit: ${report?.summary?.auditEventCount ?? 0}`,
    noLiveFlagsText(result),
  ].join('\n');
}

export function formatCodexExecGovernancePackageOutput(
  result: Record<string, unknown>,
  options: CodexExecGovernancePackageCliOptions = {},
): string {
  if (options.json) {
    return JSON.stringify(result, null, 2);
  }

  const governancePackage = result.governancePackage as
    | {
        dryRunId?: string;
        status?: string;
        recommendation?: string;
        recommendationGrantsExecution?: boolean;
        riskClassification?: string;
        summary?: {
          blockerCount?: number;
          unresolvedBlockerCount?: number;
          checklistPassedCount?: number;
          checklistWarningCount?: number;
          checklistFailedCount?: number;
          evidenceRefCount?: number;
          auditEventCount?: number;
        };
        noLiveEvidence?: {
          noRealCodexExec?: boolean;
          noExternalProcessStarted?: boolean;
          noBrowserOrCdpAction?: boolean;
          noWorkspaceWrite?: boolean;
        };
        blockers?: Array<{ code?: string; severity?: string; summary?: string }>;
      }
    | undefined;
  const blockerLines = (governancePackage?.blockers ?? [])
    .slice(0, 5)
    .map(
      (blocker) =>
        `- ${blocker.severity ?? 'unknown'} ${blocker.code ?? 'unknown'}: ${
          blocker.summary ?? 'no summary'
        }`,
    );

  return [
    'Codex governance review package',
    `dryRunId: ${governancePackage?.dryRunId ?? 'unknown'}`,
    `status: ${governancePackage?.status ?? 'unknown'}`,
    `risk: ${governancePackage?.riskClassification ?? 'unknown'}`,
    `recommendation: ${governancePackage?.recommendation ?? 'unknown'} (does not grant execution)`,
    `recommendationGrantsExecution=${String(
      governancePackage?.recommendationGrantsExecution ?? false,
    )}`,
    `checklist: ${governancePackage?.summary?.checklistPassedCount ?? 0} passed, ${
      governancePackage?.summary?.checklistWarningCount ?? 0
    } warnings, ${governancePackage?.summary?.checklistFailedCount ?? 0} failed`,
    `blockers: ${governancePackage?.summary?.unresolvedBlockerCount ?? 0}`,
    `evidence: ${governancePackage?.summary?.evidenceRefCount ?? 0}`,
    `audit: ${governancePackage?.summary?.auditEventCount ?? 0}`,
    `noLive: codex=${String(
      governancePackage?.noLiveEvidence?.noRealCodexExec ?? true,
    )}, process=${String(
      governancePackage?.noLiveEvidence?.noExternalProcessStarted ?? true,
    )}, browserCdp=${String(
      governancePackage?.noLiveEvidence?.noBrowserOrCdpAction ?? true,
    )}, workspaceWrite=${String(governancePackage?.noLiveEvidence?.noWorkspaceWrite ?? true)}`,
    noLiveFlagsText(result),
    blockerLines.length > 0 ? 'unresolved blockers:' : 'unresolved blockers: none',
    ...blockerLines,
  ].join('\n');
}

export function formatCodexExecReportReviewOutput(
  result: Record<string, unknown>,
  options: CodexExecJsonCliOptions = {},
): string {
  if (options.json) {
    return JSON.stringify(result, null, 2);
  }

  const review = result.reviewRecord as
    | {
        id?: string;
        dryRunId?: string;
        status?: string;
        recommendation?: string;
        riskClassification?: string;
        recommendationGrantsExecution?: boolean;
        checklistItems?: Array<{ status?: string }>;
        findings?: unknown[];
      }
    | undefined;

  return [
    'Codex report review',
    `reviewId: ${review?.id ?? 'unknown'}`,
    `dryRunId: ${review?.dryRunId ?? 'unknown'}`,
    `status: ${review?.status ?? 'unknown'}`,
    `risk: ${review?.riskClassification ?? 'unknown'}`,
    `recommendation: ${review?.recommendation ?? 'unknown'} (does not grant execution)`,
    `recommendationGrantsExecution=${String(review?.recommendationGrantsExecution ?? false)}`,
    `checklistFailures: ${
      review?.checklistItems?.filter((item) => item.status === 'failed').length ?? 0
    }`,
    `findings: ${review?.findings?.length ?? 0}`,
    noLiveFlagsText(result),
  ].join('\n');
}

export function formatCodexExecReportReviewListOutput(
  result: Record<string, unknown>,
  options: CodexExecReportReviewListCliOptions = {},
): string {
  if (options.json) {
    return JSON.stringify(result, null, 2);
  }

  const summaries = result.summaries as
    | Array<{
        reviewId?: string;
        dryRunId?: string;
        status?: string;
        recommendation?: string;
        riskClassification?: string;
        recommendationGrantsExecution?: boolean;
      }>
    | undefined;
  const lines = (summaries ?? [])
    .slice(0, 8)
    .map(
      (summary) =>
        `- ${summary.reviewId ?? 'unknown'} ${summary.status ?? 'unknown'} ${summary.recommendation ?? 'unknown'} ${summary.riskClassification ?? 'unknown'} risk grantsExecution=${String(summary.recommendationGrantsExecution ?? false)}`,
    );

  return [
    'Codex report review list',
    `count: ${summaries?.length ?? 0}`,
    noLiveFlagsText(result),
    lines.length > 0 ? 'items:' : 'items: none',
    ...lines,
  ].join('\n');
}

export function formatCodexExecReportReviewHistoryOutput(
  result: Record<string, unknown>,
  options: CodexExecReportReviewListCliOptions = {},
): string {
  if (options.json) {
    return JSON.stringify(result, null, 2);
  }

  const history = result.history as
    | {
        dryRunId?: string;
        historyCount?: number;
        latestReview?: { reviewId?: string; status?: string; recommendation?: string };
        comparison?: { changedItemCount?: number };
        summaries?: Array<{ reviewId?: string; status?: string; recommendation?: string }>;
      }
    | undefined;
  const lines = (history?.summaries ?? [])
    .slice(0, 8)
    .map(
      (summary) =>
        `- ${summary.reviewId ?? 'unknown'} ${summary.status ?? 'unknown'} ${summary.recommendation ?? 'unknown'}`,
    );

  return [
    'Codex report review history',
    `dryRunId: ${history?.dryRunId ?? options.dryRun ?? 'all'}`,
    `count: ${history?.historyCount ?? 0}`,
    `latest: ${history?.latestReview?.reviewId ?? 'none'} ${history?.latestReview?.status ?? ''} ${history?.latestReview?.recommendation ?? ''}`.trim(),
    `latestComparisonChanges: ${history?.comparison?.changedItemCount ?? 0}`,
    'recommendation grants execution: false',
    noLiveFlagsText(result),
    lines.length > 0 ? 'items:' : 'items: none',
    ...lines,
  ].join('\n');
}

export function formatCodexExecReportReviewComparisonOutput(
  result: Record<string, unknown>,
  options: CodexExecJsonCliOptions = {},
): string {
  if (options.json) {
    return JSON.stringify(result, null, 2);
  }

  const comparison = result.comparison as
    | {
        leftReviewId?: string;
        rightReviewId?: string;
        comparable?: boolean;
        changedItemCount?: number;
        summary?: string;
        recommendationGrantsExecution?: boolean;
        items?: Array<{
          field?: string;
          leftValueSummary?: string;
          rightValueSummary?: string;
          changed?: boolean;
        }>;
      }
    | undefined;
  const lines = (comparison?.items ?? [])
    .filter((item) => item.changed)
    .slice(0, 8)
    .map(
      (item) =>
        `- ${item.field ?? 'unknown'}: ${item.leftValueSummary ?? 'unknown'} -> ${item.rightValueSummary ?? 'unknown'}`,
    );

  return [
    'Codex report review comparison',
    `leftReviewId: ${comparison?.leftReviewId ?? 'unknown'}`,
    `rightReviewId: ${comparison?.rightReviewId ?? 'unknown'}`,
    `comparable: ${String(comparison?.comparable ?? false)}`,
    `changedItems: ${comparison?.changedItemCount ?? 0}`,
    `summary: ${comparison?.summary ?? 'metadata-only comparison unavailable'}`,
    `recommendationGrantsExecution=${String(comparison?.recommendationGrantsExecution ?? false)}`,
    noLiveFlagsText(result),
    lines.length > 0 ? 'changes:' : 'changes: none',
    ...lines,
  ].join('\n');
}

export function formatCodexExecReportReviewHandoffOutput(
  result: Record<string, unknown>,
  options: CodexExecReportReviewHandoffCliOptions = {},
): string {
  if (options.json) {
    return JSON.stringify(result, null, 2);
  }

  const handoff = result.handoff as
    | {
        dryRunId?: string;
        fromReviewer?: string;
        toReviewer?: string;
        latestReviewId?: string;
        latestStatus?: string;
        latestRecommendation?: string;
        latestRiskClassification?: string;
        reviewCount?: number;
        findingCount?: number;
        failedChecklistCount?: number;
        handoffSummary?: string;
        recommendedNextStep?: string;
        recommendationGrantsExecution?: boolean;
      }
    | undefined;

  return [
    'Codex report review handoff',
    `dryRunId: ${handoff?.dryRunId ?? 'unknown'}`,
    `from: ${handoff?.fromReviewer ?? options.from ?? 'current reviewer'}`,
    `to: ${handoff?.toReviewer ?? options.to ?? 'next reviewer'}`,
    `latestReviewId: ${handoff?.latestReviewId ?? 'none'}`,
    `latest: ${handoff?.latestStatus ?? 'none'} ${handoff?.latestRecommendation ?? ''} ${handoff?.latestRiskClassification ?? ''}`.trim(),
    `reviews: ${handoff?.reviewCount ?? 0}`,
    `findings: ${handoff?.findingCount ?? 0}`,
    `failedChecklistItems: ${handoff?.failedChecklistCount ?? 0}`,
    `summary: ${handoff?.handoffSummary ?? 'metadata-only handoff unavailable'}`,
    `nextStep: ${handoff?.recommendedNextStep ?? 'continue read-only review'}`,
    `recommendationGrantsExecution=${String(handoff?.recommendationGrantsExecution ?? false)}`,
    noLiveFlagsText(result),
  ].join('\n');
}

export async function writeCodexExecReportOutput(
  outputPath: string,
  content: string,
): Promise<{ path: string; workspacePath: string }> {
  const resolved = resolveCodexExecReportOutputPath(outputPath);

  await mkdir(dirname(resolved.path), { recursive: true });
  await writeFile(resolved.path, content, 'utf8');

  return resolved;
}

export function resolveCodexExecReportOutputPath(outputPath: string): {
  path: string;
  workspacePath: string;
} {
  if (isAbsolute(outputPath)) {
    throw new Error('Report output path must be repository-relative.');
  }

  if (outputPath.split(/[\\/]+/).includes('..')) {
    throw new Error('Report output path cannot contain traversal segments.');
  }

  const workspaceRoot = findWorkspaceRoot(process.cwd());
  const targetPath = resolve(workspaceRoot, outputPath);
  const reportsRoot = resolve(workspaceRoot, 'reports');
  const tmpRoot = resolve(workspaceRoot, 'tmp');

  if (!isPathInside(targetPath, reportsRoot) && !isPathInside(targetPath, tmpRoot)) {
    throw new Error('Report output path must stay under reports/ or tmp/.');
  }

  return {
    path: targetPath,
    workspacePath: toWorkspacePath(targetPath),
  };
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

function createReportQueryString(options: CodexExecReportCliOptions): string {
  const params = new URLSearchParams();

  params.set('format', normalizeReportFormat(options.format));
  params.set('includeEvidence', String(options.includeEvidence ?? true));
  params.set('includeAudit', String(options.includeAudit ?? true));

  const queryString = params.toString();
  return queryString ? `?${queryString}` : '';
}

function createGovernancePackageQueryString(options: CodexExecGovernancePackageCliOptions): string {
  const params = new URLSearchParams();

  params.set('includeEvidence', String(options.includeEvidence ?? true));
  params.set('includeAudit', String(options.includeAudit ?? true));

  const queryString = params.toString();
  return queryString ? `?${queryString}` : '';
}

function createReportReviewQueryString(options: CodexExecReportReviewListCliOptions): string {
  const params = new URLSearchParams();

  if (options.dryRun) {
    params.set('dryRunId', options.dryRun);
  }

  if (options.status) {
    params.set('status', normalizeReportReviewStatus(options.status));
  }

  if (options.recommendation) {
    params.set('recommendation', normalizeReportReviewRecommendation(options.recommendation));
  }

  const queryString = params.toString();
  return queryString ? `?${queryString}` : '';
}

function createReportReviewQueryFromCliOptions(
  options: CodexExecReportReviewListCliOptions,
  fallbackDryRunId: string,
): Partial<CodexExecReportReviewQuery> {
  return {
    dryRunId: options.dryRun ?? fallbackDryRunId,
    status: options.status ? normalizeReportReviewStatus(options.status) : undefined,
    recommendation: options.recommendation
      ? normalizeReportReviewRecommendation(options.recommendation)
      : undefined,
    limit: 20,
  };
}

function normalizeReportFormat(format: string | undefined): CodexExecControlPlaneReportFormat {
  const normalized = format ?? 'json';

  if (normalized !== 'json' && normalized !== 'markdown') {
    throw new Error('report format must be json or markdown');
  }

  return normalized;
}

function normalizeReportReviewStatus(status: string | undefined): CodexExecReportReviewStatus {
  const normalized = status ?? 'reviewed';

  if (
    normalized === 'draft' ||
    normalized === 'reviewed' ||
    normalized === 'changes_requested' ||
    normalized === 'rejected' ||
    normalized === 'archived'
  ) {
    return normalized;
  }

  throw new Error('report review status is unsupported');
}

function normalizeReportReviewRecommendation(
  recommendation: string | undefined,
): CodexExecReportRecommendation {
  const normalized = recommendation ?? 'ready_for_adr';

  if (
    normalized === 'no_go' ||
    normalized === 'needs_changes' ||
    normalized === 'ready_for_adr' ||
    normalized === 'ready_for_read_only_live_review'
  ) {
    return normalized;
  }

  throw new Error('report review recommendation is unsupported');
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

function createReportReviewResponse(
  reviewRecord: ReturnType<typeof createCodexExecReportReviewRecord>,
  degraded: boolean,
): Record<string, unknown> {
  return {
    reviewRecord,
    summary: summarizeCodexExecReportReview(reviewRecord),
    recommendationGrantsExecution: false,
    liveExecution: false,
    externalProcessStarted: false,
    executionDisabled: true,
    degraded,
    reason: degraded ? 'supervisor unavailable; local control-plane fallback used' : undefined,
  };
}

function createLocalReportReviewRecords(dryRunId: string): CodexExecReportReviewRecord[] {
  const record = createLocalCodexExecControlPlaneRecord(dryRunId);
  const report = buildCodexExecControlPlaneReport({
    dryRunId: record.dryRunPlanId,
    record,
    degraded: true,
    reason: 'supervisor unavailable; local control-plane fallback used',
  });
  const olderReview = createCodexExecReportReviewRecord({
    report,
    reviewerLabel: 'cli-fallback-initial',
    status: 'changes_requested',
    recommendation: 'needs_changes',
    notesSummary: 'Initial local fallback review requested metadata-only changes.',
  });
  const latestReview = createCodexExecReportReviewRecord({
    report,
    reviewerLabel: 'cli-fallback-latest',
    status: 'reviewed',
    recommendation: 'ready_for_adr',
    notesSummary: 'Latest local fallback review keeps no-live boundary intact.',
  });

  return [
    {
      ...latestReview,
      id: 'codex_report_review_cli_latest',
      reviewedAt: '2026-04-28T02:00:00.000Z',
      createdAt: '2026-04-28T02:00:00.000Z',
    },
    {
      ...olderReview,
      id: 'codex_report_review_cli_older',
      reviewedAt: '2026-04-28T01:00:00.000Z',
      createdAt: '2026-04-28T01:00:00.000Z',
    },
  ];
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

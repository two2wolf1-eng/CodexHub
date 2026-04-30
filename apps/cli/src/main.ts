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
  buildCodexExecLiveAdapterAdrDraft,
  buildCodexExecReportReviewHistory,
  buildCodexExecReviewerHandoffSummary,
  compareCodexExecReportReviews,
  createCodexExecLiveAdapterAdrDecisionAuditEvents,
  createCodexExecLiveAdapterAdrDecisionEvidenceRefs,
  createCodexExecLiveAdapterAdrDecisionRecord,
  createDefaultReadOnlyAdapterOperatorChecklist,
  createReadOnlyAdapterPreflightSimulationAuditEvents,
  createReadOnlyAdapterPreflightSimulationEvidenceRefs,
  createReadOnlyAdapterSimulatorReviewAuditEvents,
  createReadOnlyAdapterSimulatorReviewDecisionRecord,
  createReadOnlyAdapterSimulatorReviewEvidenceRefs,
  createReadOnlyAdapterImplementationPlanReviewAuditEvents,
  createReadOnlyAdapterImplementationPlanReviewDecisionRecord,
  createReadOnlyAdapterImplementationPlanReviewEvidenceRefs,
  createReadOnlyAdapterSkeletonPreview,
  createReadOnlyAdapterSkeletonReviewDecisionRecord,
  createReadOnlyAdapterSkeletonReviewEvidenceRefs,
  createReadOnlyAdapterSkeletonReviewAuditEvents,
  createReadOnlyAdapterFinalReadinessDecisionRecord,
  createReadOnlyAdapterFinalReadinessEvidenceRefs,
  createReadOnlyAdapterFinalReadinessAuditEvents,
  buildRealReadOnlyAdapterReadinessPackage,
  createDefaultRealReadOnlyAdapterConfig,
  createRealReadOnlyAdapterGuardPreflight,
  createRealReadOnlyAdapterRequest,
  REAL_READ_ONLY_ADAPTER_READINESS_RECOMMENDATION,
  REAL_READ_ONLY_ADAPTER_READINESS_REVIEW_RECOMMENDATION,
  summarizeRealReadOnlyAdapterReadinessPackage,
  runReadOnlyAdapterFixtureBoundary,
  summarizeReadOnlyAdapterFixtureBoundary,
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
  getLatestCodexExecLiveAdapterAdrDecision,
  getLatestReadOnlyAdapterSimulatorReview,
  getLatestReadOnlyAdapterImplementationPlanReview,
  getLatestReadOnlyAdapterSkeletonReview,
  listCodexExecLiveAdapterAdrDecisionSummaries,
  listReadOnlyAdapterSimulatorReviewSummaries,
  listReadOnlyAdapterImplementationPlanReviewSummaries,
  listReadOnlyAdapterSkeletonReviewSummaries,
  listReadOnlyAdapterFinalReadinessSummaries,
  parseCodexExecLiveConfigFile,
  replayCodexExecFixture,
  runCodexExecPreflight,
  searchAuditEvents,
  searchEvidence,
  renderCodexExecControlPlaneReportJson,
  renderCodexExecControlPlaneReportMarkdown,
  renderCodexExecLiveAdapterAdrDraftJson,
  renderCodexExecLiveAdapterAdrDraftMarkdown,
  summarizeCodexExecReportReview,
  summarizeCodexExecLiveAdapterAdrDecision,
  summarizeReadOnlyAdapterSimulatorReview,
  summarizeReadOnlyAdapterImplementationPlanReview,
  summarizeReadOnlyAdapterSkeletonReview,
  summarizeReadOnlyAdapterFinalReadiness,
  summarizeReadOnlyAdapterPreflightSimulation,
  listCodexExecReportReviewSummaries,
  summarizeCodexExecReplay,
  simulateReadOnlyAdapterPreflight,
} from '@codexhub/codex-kernel';
import type {
  CodexExecApprovalDecisionOutcome,
  CodexExecAuditQuery,
  CodexExecConfigLoadResult,
  CodexExecControlPlaneReportFormat,
  CodexExecEvidenceQuery,
  CodexExecLiveAdapterAdrDecisionOutcome,
  CodexExecLiveAdapterAdrDecisionQuery,
  CodexExecLiveAdapterAdrDecisionRecord,
  CodexExecLiveAdapterAdrDecisionStatus,
  CodexExecLiveRunRecord,
  CodexExecReadOnlyAdapterOperatorChecklistItem,
  CodexExecReadOnlyAdapterPreflightSimulationResult,
  CodexExecReadOnlyAdapterSimulatorReviewDecisionRecord,
  CodexExecReadOnlyAdapterSimulatorReviewOutcome,
  CodexExecReadOnlyAdapterSimulatorReviewQuery,
  CodexExecReadOnlyAdapterSimulatorReviewStatus,
  CodexExecReadOnlyAdapterImplementationPlanReviewDecisionRecord,
  CodexExecReadOnlyAdapterImplementationPlanReviewOutcome,
  CodexExecReadOnlyAdapterImplementationPlanReviewQuery,
  CodexExecReadOnlyAdapterImplementationPlanReviewStatus,
  CodexExecReadOnlyAdapterSkeletonReviewDecisionRecord,
  CodexExecReadOnlyAdapterSkeletonReviewOutcome,
  CodexExecReadOnlyAdapterSkeletonReviewQuery,
  CodexExecReadOnlyAdapterSkeletonReviewStatus,
  CodexExecReadOnlyAdapterFinalReadinessDecisionRecord,
  CodexExecReadOnlyAdapterFinalReadinessOutcome,
  CodexExecReadOnlyAdapterFinalReadinessQuery,
  CodexExecReadOnlyAdapterFinalReadinessStatus,
  CodexExecRealReadOnlyAdapterReadinessPackage,
  CodexExecRealReadOnlyAdapterReadinessReviewDecisionRecord,
  CodexExecRealReadOnlyAdapterReadinessReviewOutcome,
  CodexExecRealReadOnlyAdapterReadinessReviewStatus,
  CodexExecRealReadOnlyAdapterReadinessStatus,
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

export interface CodexExecAdrDraftCliOptions {
  format?: string;
  includeEvidence?: boolean;
  includeAudit?: boolean;
  out?: string;
}

export interface CodexExecAdrDecisionCreateCliOptions extends CodexExecJsonCliOptions {
  reviewer?: string;
  rationaleSummary?: string;
  decision?: string;
  status?: string;
}

export interface CodexExecAdrDecisionListCliOptions extends CodexExecJsonCliOptions {
  dryRun?: string;
  status?: string;
  decision?: string;
}

export interface CodexExecReadOnlyAdapterPreflightCliOptions extends CodexExecJsonCliOptions {
  isolatedWorktree?: boolean;
  evidenceReady?: boolean;
  auditReady?: boolean;
  checklistComplete?: boolean;
}

export interface CodexExecReadOnlyAdapterSimulatorReviewCreateCliOptions extends CodexExecJsonCliOptions {
  reviewer?: string;
  outcome?: string;
  status?: string;
  rationaleSummary?: string;
}

export interface CodexExecReadOnlyAdapterSimulatorReviewListCliOptions extends CodexExecJsonCliOptions {
  dryRun?: string;
  status?: string;
  outcome?: string;
}

export interface CodexExecReadOnlyAdapterImplementationPlanReviewCreateCliOptions extends CodexExecJsonCliOptions {
  reviewer?: string;
  outcome?: string;
  status?: string;
  rationaleSummary?: string;
}

export interface CodexExecReadOnlyAdapterImplementationPlanReviewListCliOptions extends CodexExecJsonCliOptions {
  status?: string;
  outcome?: string;
}

export interface CodexExecReadOnlyAdapterSkeletonReviewCreateCliOptions extends CodexExecJsonCliOptions {
  reviewer?: string;
  outcome?: string;
  status?: string;
  rationaleSummary?: string;
}

export interface CodexExecReadOnlyAdapterSkeletonReviewListCliOptions extends CodexExecJsonCliOptions {
  status?: string;
  outcome?: string;
}

export interface CodexExecReadOnlyAdapterFixtureBoundaryCliOptions extends CodexExecJsonCliOptions {
  dryRun?: string;
}

export interface CodexExecReadOnlyAdapterFinalReadinessCreateCliOptions extends CodexExecJsonCliOptions {
  reviewer?: string;
  outcome?: string;
  status?: string;
  rationaleSummary?: string;
}

export interface CodexExecReadOnlyAdapterFinalReadinessListCliOptions extends CodexExecJsonCliOptions {
  status?: string;
  outcome?: string;
}

export interface CodexExecRealReadOnlyAdapterReadinessListCliOptions extends CodexExecJsonCliOptions {
  dryRun?: string;
  status?: string;
}

export interface CodexExecRealReadOnlyAdapterReadinessReviewCreateCliOptions extends CodexExecJsonCliOptions {
  outcome?: string;
  reviewer?: string;
  rationaleSummary?: string;
  status?: string;
}

export interface CodexExecRealReadOnlyAdapterReadinessReviewListCliOptions extends CodexExecJsonCliOptions {
  packageId?: string;
  dryRun?: string;
  status?: string;
  outcome?: string;
}

export interface CodexExecRealReadOnlyAdapterAttemptCliOptions extends CodexExecJsonCliOptions {
  approval?: string;
  worktree?: string;
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

  execCommand
    .command('adr-draft')
    .argument('<dryRunId>')
    .option('--format <format>', 'json or markdown', 'json')
    .option('--include-evidence', 'Include evidence summaries')
    .option('--include-audit', 'Include audit summaries')
    .option('--out <relativePath>', 'Write safe ADR draft text under reports/ or tmp/')
    .description('Read a non-executing live adapter ADR draft')
    .action(async (dryRunId: string, options: CodexExecAdrDraftCliOptions) => {
      const result = await getCodexExecAdrDraft(dryRunId, options);
      const output = formatCodexExecAdrDraftOutput(result);

      if (options.out) {
        const written = await writeCodexExecReportOutput(options.out, output);
        console.log([output, '', `written: ${written.workspacePath}`].join('\n'));
        return;
      }

      console.log(output);
    });

  const adrDecisionCommand = execCommand
    .command('adr-decision')
    .description('Record and read non-executing live adapter ADR decisions');

  adrDecisionCommand
    .command('create')
    .argument('<dryRunId>')
    .option('--reviewer <label>', 'Reviewer label', 'local-operator')
    .option(
      '--rationale-summary <summary>',
      'ADR decision rationale summary',
      'Conditional read-only design only; implementation remains unapproved.',
    )
    .option(
      '--decision <decision>',
      'no_go or conditional_read_only_go',
      'conditional_read_only_go',
    )
    .option('--status <status>', 'draft, recorded, or superseded', 'recorded')
    .option('--json', 'Print full JSON output')
    .description('Create a governance ADR decision record; it never grants execution')
    .action(async (dryRunId: string, options: CodexExecAdrDecisionCreateCliOptions) => {
      const result = await createCodexExecAdrDecision(dryRunId, options);
      console.log(formatCodexExecAdrDecisionOutput(result, options));
    });

  adrDecisionCommand
    .command('get')
    .argument('<decisionId>')
    .option('--json', 'Print full JSON output')
    .description('Read one live adapter ADR decision record')
    .action(async (decisionId: string, options: CodexExecJsonCliOptions) => {
      const result = await getCodexExecAdrDecision(decisionId);
      console.log(formatCodexExecAdrDecisionOutput(result, options));
    });

  adrDecisionCommand
    .command('list')
    .option('--dry-run <dryRunId>', 'Filter by dry-run id')
    .option('--status <status>', 'Filter by decision status')
    .option('--decision <decision>', 'Filter by decision outcome')
    .option('--json', 'Print full JSON output')
    .description('List live adapter ADR decisions')
    .action(async (options: CodexExecAdrDecisionListCliOptions) => {
      const result = await listCodexExecAdrDecisions(options);
      console.log(formatCodexExecAdrDecisionListOutput(result, options));
    });

  adrDecisionCommand
    .command('latest')
    .argument('<dryRunId>')
    .option('--json', 'Print full JSON output')
    .description('Read the latest live adapter ADR decision for a dry-run id')
    .action(async (dryRunId: string, options: CodexExecJsonCliOptions) => {
      const result = await getLatestCodexExecAdrDecisionCommand(dryRunId);
      console.log(formatCodexExecAdrDecisionOutput(result, options));
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

  const readOnlyAdapterCommand = execCommand
    .command('read-only-adapter')
    .description('Read-only adapter design and simulator commands');

  readOnlyAdapterCommand
    .command('preflight-simulate')
    .argument('<dryRunId>')
    .option('--isolated-worktree', 'Mark the simulated isolated worktree check ready')
    .option('--evidence-ready', 'Mark the simulated evidence store check ready')
    .option('--audit-ready', 'Mark the simulated audit store check ready')
    .option('--checklist-complete', 'Mark all simulated operator checklist items complete')
    .option('--json', 'Print full JSON output')
    .description('Simulate future read-only adapter preflight gates without executing anything')
    .action(async (dryRunId: string, options: CodexExecReadOnlyAdapterPreflightCliOptions) => {
      const result = await simulateReadOnlyAdapterPreflightCommand(dryRunId, options);
      console.log(formatReadOnlyAdapterPreflightSimulationOutput(result, options));
    });

  const simulatorReviewCommand = readOnlyAdapterCommand
    .command('simulator-review')
    .description('Record and read simulator go/no-go reviews without execution approval');

  simulatorReviewCommand
    .command('create')
    .argument('<dryRunId>')
    .option('--reviewer <label>', 'Reviewer label', 'local-operator')
    .option(
      '--outcome <outcome>',
      'no_go or go_to_implementation_planning',
      'go_to_implementation_planning',
    )
    .option('--status <status>', 'draft, recorded, or superseded', 'recorded')
    .option(
      '--rationale-summary <summary>',
      'Review rationale summary',
      'Simulator review allows implementation planning only; implementation remains unapproved.',
    )
    .option('--json', 'Print full JSON output')
    .description('Create a simulator review record; it never grants execution')
    .action(
      async (
        dryRunId: string,
        options: CodexExecReadOnlyAdapterSimulatorReviewCreateCliOptions,
      ) => {
        const result = await createReadOnlyAdapterSimulatorReviewCommand(dryRunId, options);
        console.log(formatReadOnlyAdapterSimulatorReviewOutput(result, options));
      },
    );

  simulatorReviewCommand
    .command('get')
    .argument('<reviewId>')
    .option('--json', 'Print full JSON output')
    .description('Read one simulator review record')
    .action(async (reviewId: string, options: CodexExecJsonCliOptions) => {
      const result = await getReadOnlyAdapterSimulatorReviewCommand(reviewId);
      console.log(formatReadOnlyAdapterSimulatorReviewOutput(result, options));
    });

  simulatorReviewCommand
    .command('list')
    .option('--dry-run <dryRunId>', 'Filter by dry-run id')
    .option('--status <status>', 'Filter by review status')
    .option('--outcome <outcome>', 'Filter by review outcome')
    .option('--json', 'Print full JSON output')
    .description('List simulator review records')
    .action(async (options: CodexExecReadOnlyAdapterSimulatorReviewListCliOptions) => {
      const result = await listReadOnlyAdapterSimulatorReviewsCommand(options);
      console.log(formatReadOnlyAdapterSimulatorReviewListOutput(result, options));
    });

  simulatorReviewCommand
    .command('latest')
    .argument('<dryRunId>')
    .option('--json', 'Print full JSON output')
    .description('Read the latest simulator review for a dry-run id')
    .action(async (dryRunId: string, options: CodexExecJsonCliOptions) => {
      const result = await getLatestReadOnlyAdapterSimulatorReviewCommand(dryRunId);
      console.log(formatReadOnlyAdapterSimulatorReviewOutput(result, options));
    });

  const implementationPlanReviewCommand = readOnlyAdapterCommand
    .command('implementation-plan-review')
    .description('Record and read implementation plan go/no-go reviews without execution approval');

  implementationPlanReviewCommand
    .command('create')
    .requiredOption('--outcome <outcome>', 'no_go or conditional_go_to_disabled_skeleton')
    .option('--reviewer <label>', 'Reviewer label', 'local-operator')
    .option('--status <status>', 'draft, recorded, or superseded', 'recorded')
    .option(
      '--rationale-summary <summary>',
      'Review rationale summary',
      'Implementation plan review records governance only; process adapter and execution remain unapproved.',
    )
    .option('--json', 'Print full JSON output')
    .description('Create an implementation plan review; it never grants execution')
    .action(async (options: CodexExecReadOnlyAdapterImplementationPlanReviewCreateCliOptions) => {
      const result = await createReadOnlyAdapterImplementationPlanReviewCommand(options);
      console.log(formatReadOnlyAdapterImplementationPlanReviewOutput(result, options));
    });

  implementationPlanReviewCommand
    .command('get')
    .argument('<reviewId>')
    .option('--json', 'Print full JSON output')
    .description('Read one implementation plan review record')
    .action(async (reviewId: string, options: CodexExecJsonCliOptions) => {
      const result = await getReadOnlyAdapterImplementationPlanReviewCommand(reviewId);
      console.log(formatReadOnlyAdapterImplementationPlanReviewOutput(result, options));
    });

  implementationPlanReviewCommand
    .command('list')
    .option('--status <status>', 'Filter by review status')
    .option('--outcome <outcome>', 'Filter by review outcome')
    .option('--json', 'Print full JSON output')
    .description('List implementation plan review records')
    .action(async (options: CodexExecReadOnlyAdapterImplementationPlanReviewListCliOptions) => {
      const result = await listReadOnlyAdapterImplementationPlanReviewsCommand(options);
      console.log(formatReadOnlyAdapterImplementationPlanReviewListOutput(result, options));
    });

  implementationPlanReviewCommand
    .command('latest')
    .option('--json', 'Print full JSON output')
    .description('Read the latest implementation plan review')
    .action(async (options: CodexExecJsonCliOptions) => {
      const result = await getLatestReadOnlyAdapterImplementationPlanReviewCommand();
      console.log(formatReadOnlyAdapterImplementationPlanReviewOutput(result, options));
    });

  readOnlyAdapterCommand
    .command('skeleton-preview')
    .option('--json', 'Print full JSON output')
    .description('Read disabled read-only adapter skeleton preview')
    .action(async (options: CodexExecJsonCliOptions) => {
      const result = await getReadOnlyAdapterSkeletonPreviewCommand();
      console.log(formatReadOnlyAdapterGenericOutput(result, options));
    });

  const skeletonReviewCommand = readOnlyAdapterCommand
    .command('skeleton-review')
    .description('Record and read disabled skeleton reviews without execution approval');

  skeletonReviewCommand
    .command('create')
    .option(
      '--outcome <outcome>',
      'no_go or skeleton_accepted_for_fixture_boundary_only',
      'skeleton_accepted_for_fixture_boundary_only',
    )
    .option('--reviewer <label>', 'Reviewer label', 'local-operator')
    .option('--status <status>', 'draft, recorded, or superseded', 'recorded')
    .option(
      '--rationale-summary <summary>',
      'Review rationale summary',
      'Skeleton review allows fixture-backed replay boundary only; execution remains disabled.',
    )
    .option('--json', 'Print full JSON output')
    .description('Create a disabled skeleton review record')
    .action(async (options: CodexExecReadOnlyAdapterSkeletonReviewCreateCliOptions) => {
      const result = await createReadOnlyAdapterSkeletonReviewCommand(options);
      console.log(formatReadOnlyAdapterSkeletonReviewOutput(result, options));
    });

  skeletonReviewCommand
    .command('get')
    .argument('<reviewId>')
    .option('--json', 'Print full JSON output')
    .description('Read one disabled skeleton review')
    .action(async (reviewId: string, options: CodexExecJsonCliOptions) => {
      const result = await getReadOnlyAdapterSkeletonReviewCommand(reviewId);
      console.log(formatReadOnlyAdapterSkeletonReviewOutput(result, options));
    });

  skeletonReviewCommand
    .command('list')
    .option('--status <status>', 'Filter by review status')
    .option('--outcome <outcome>', 'Filter by review outcome')
    .option('--json', 'Print full JSON output')
    .description('List disabled skeleton reviews')
    .action(async (options: CodexExecReadOnlyAdapterSkeletonReviewListCliOptions) => {
      const result = await listReadOnlyAdapterSkeletonReviewsCommand(options);
      console.log(formatReadOnlyAdapterSkeletonReviewListOutput(result, options));
    });

  skeletonReviewCommand
    .command('latest')
    .option('--json', 'Print full JSON output')
    .description('Read the latest disabled skeleton review')
    .action(async (options: CodexExecJsonCliOptions) => {
      const result = await getLatestReadOnlyAdapterSkeletonReviewCommand();
      console.log(formatReadOnlyAdapterSkeletonReviewOutput(result, options));
    });

  readOnlyAdapterCommand
    .command('fixture-boundary')
    .argument('<fixturePath>')
    .option('--dry-run <dryRunId>', 'Associate a dry-run id with the replay boundary')
    .option('--json', 'Print full JSON output')
    .description('Replay a synthetic fixture through the read-only boundary simulator')
    .action(
      async (fixturePath: string, options: CodexExecReadOnlyAdapterFixtureBoundaryCliOptions) => {
        const result = await runReadOnlyAdapterFixtureBoundaryCommand(fixturePath, options);
        console.log(formatReadOnlyAdapterGenericOutput(result, options));
      },
    );

  const finalReadinessCommand = readOnlyAdapterCommand
    .command('final-readiness')
    .description('Record and read final readiness reviews without execution approval');

  finalReadinessCommand
    .command('create')
    .option(
      '--outcome <outcome>',
      'no_go, ready_for_separate_read_only_adapter_adr, or ready_for_separate_disabled_skeleton_followup',
      'ready_for_separate_read_only_adapter_adr',
    )
    .option('--reviewer <label>', 'Reviewer label', 'local-operator')
    .option('--status <status>', 'draft, recorded, or superseded', 'recorded')
    .option(
      '--rationale-summary <summary>',
      'Review rationale summary',
      'Separate ADR remains required before any real read-only adapter can be considered.',
    )
    .option('--json', 'Print full JSON output')
    .description('Create a final readiness review record')
    .action(async (options: CodexExecReadOnlyAdapterFinalReadinessCreateCliOptions) => {
      const result = await createReadOnlyAdapterFinalReadinessCommand(options);
      console.log(formatReadOnlyAdapterFinalReadinessOutput(result, options));
    });

  finalReadinessCommand
    .command('list')
    .option('--status <status>', 'Filter by review status')
    .option('--outcome <outcome>', 'Filter by review outcome')
    .option('--json', 'Print full JSON output')
    .description('List final readiness reviews')
    .action(async (options: CodexExecReadOnlyAdapterFinalReadinessListCliOptions) => {
      const result = await listReadOnlyAdapterFinalReadinessCommand(options);
      console.log(formatReadOnlyAdapterFinalReadinessListOutput(result, options));
    });

  finalReadinessCommand
    .command('latest')
    .option('--json', 'Print full JSON output')
    .description('Read the latest final readiness review')
    .action(async (options: CodexExecJsonCliOptions) => {
      const result = await getLatestReadOnlyAdapterFinalReadinessCommand();
      console.log(formatReadOnlyAdapterFinalReadinessOutput(result, options));
    });

  const realReadOnlyAdapterCommand = execCommand
    .command('real-read-only-adapter')
    .description('Real read-only adapter readiness commands without execution approval');

  realReadOnlyAdapterCommand
    .command('attempt')
    .argument('<dryRunId>')
    .requiredOption('--approval <approvalArtifactId>', 'Existing approval artifact id')
    .requiredOption('--worktree <path>', 'Existing isolated worktree path')
    .option('--json', 'Print full JSON output')
    .description('Attempt the gated CLI-only read-only adapter path')
    .action(
      async (dryRunId: string, options: CodexExecRealReadOnlyAdapterAttemptCliOptions) => {
        const result = await attemptRealReadOnlyAdapterCommand(dryRunId, options);
        console.log(formatRealReadOnlyAdapterAttemptOutput(result, options));
      },
    );

  const readinessCommand = realReadOnlyAdapterCommand
    .command('readiness')
    .description('Create and read metadata-only readiness packages');

  readinessCommand
    .command('create')
    .argument('<dryRunId>')
    .option('--json', 'Print full JSON output')
    .description('Create a metadata-only readiness package for a dry-run id')
    .action(async (dryRunId: string, options: CodexExecJsonCliOptions) => {
      const result = await createRealReadOnlyAdapterReadinessCommand(dryRunId);
      console.log(formatRealReadOnlyAdapterReadinessOutput(result, options));
    });

  readinessCommand
    .command('get')
    .argument('<packageId>')
    .option('--json', 'Print full JSON output')
    .description('Read one readiness package')
    .action(async (packageId: string, options: CodexExecJsonCliOptions) => {
      const result = await getRealReadOnlyAdapterReadinessCommand(packageId);
      console.log(formatRealReadOnlyAdapterReadinessOutput(result, options));
    });

  readinessCommand
    .command('list')
    .option('--dry-run <dryRunId>', 'Filter by dry-run id')
    .option('--status <status>', 'Filter by readiness status')
    .option('--json', 'Print full JSON output')
    .description('List readiness package summaries')
    .action(async (options: CodexExecRealReadOnlyAdapterReadinessListCliOptions) => {
      const result = await listRealReadOnlyAdapterReadinessCommand(options);
      console.log(formatRealReadOnlyAdapterReadinessListOutput(result, options));
    });

  readinessCommand
    .command('latest')
    .argument('<dryRunId>')
    .option('--json', 'Print full JSON output')
    .description('Read the latest readiness package for a dry-run id')
    .action(async (dryRunId: string, options: CodexExecJsonCliOptions) => {
      const result = await getLatestRealReadOnlyAdapterReadinessCommand(dryRunId);
      console.log(formatRealReadOnlyAdapterReadinessOutput(result, options));
    });

  const readinessReviewCommand = realReadOnlyAdapterCommand
    .command('readiness-review')
    .description('Record and read readiness package reviews without execution approval');

  readinessReviewCommand
    .command('create')
    .argument('<packageId>')
    .requiredOption(
      '--outcome <outcome>',
      'no_go_to_separate_adr_draft or conditional_go_to_separate_adr_draft',
    )
    .option('--reviewer <label>', 'Reviewer label', 'local-operator')
    .option('--rationale-summary <summary>', 'Review rationale summary', 'Readiness reviewed.')
    .option('--status <status>', 'draft, recorded, or superseded', 'recorded')
    .option('--json', 'Print full JSON output')
    .description('Create a readiness package review record from a persisted package')
    .action(
      async (
        packageId: string,
        options: CodexExecRealReadOnlyAdapterReadinessReviewCreateCliOptions,
      ) => {
        const result = await createRealReadOnlyAdapterReadinessReviewCommand(packageId, options);
        console.log(formatRealReadOnlyAdapterReadinessReviewOutput(result, options));
      },
    );

  readinessReviewCommand
    .command('get')
    .argument('<reviewId>')
    .option('--json', 'Print full JSON output')
    .description('Read one readiness package review')
    .action(async (reviewId: string, options: CodexExecJsonCliOptions) => {
      const result = await getRealReadOnlyAdapterReadinessReviewCommand(reviewId);
      console.log(formatRealReadOnlyAdapterReadinessReviewOutput(result, options));
    });

  readinessReviewCommand
    .command('list')
    .option('--package <packageId>', 'Filter by readiness package id')
    .option('--dry-run <dryRunId>', 'Filter by dry-run id')
    .option('--status <status>', 'Filter by review status')
    .option('--outcome <outcome>', 'Filter by review outcome')
    .option('--json', 'Print full JSON output')
    .description('List readiness package review summaries')
    .action(async (options: CodexExecRealReadOnlyAdapterReadinessReviewListCliOptions) => {
      const result = await listRealReadOnlyAdapterReadinessReviewCommand(options);
      console.log(formatRealReadOnlyAdapterReadinessReviewListOutput(result, options));
    });

  readinessReviewCommand
    .command('latest')
    .argument('<dryRunId>')
    .option('--json', 'Print full JSON output')
    .description('Read the latest readiness package review for a dry-run id')
    .action(async (dryRunId: string, options: CodexExecJsonCliOptions) => {
      const result = await getLatestRealReadOnlyAdapterReadinessReviewCommand(dryRunId);
      console.log(formatRealReadOnlyAdapterReadinessReviewOutput(result, options));
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

export async function getCodexExecAdrDraft(
  dryRunId: string,
  options: CodexExecAdrDraftCliOptions = {},
): Promise<Record<string, unknown>> {
  const format = normalizeReportFormat(options.format);
  const query = createReportQueryString({
    ...options,
    format,
  });

  try {
    const response = await fetch(
      `${supervisorUrl}/api/codex/exec/adr-draft/${encodeURIComponent(dryRunId)}${query}`,
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
    const adrDraft = buildCodexExecLiveAdapterAdrDraft({
      dryRunId: record.dryRunPlanId,
      governancePackage,
      format,
      includeEvidence: options.includeEvidence ?? true,
      includeAudit: options.includeAudit ?? true,
      degraded: true,
      reason: 'supervisor unavailable; local control-plane fallback used',
    });
    const exportResult =
      format === 'markdown'
        ? renderCodexExecLiveAdapterAdrDraftMarkdown(adrDraft)
        : renderCodexExecLiveAdapterAdrDraftJson(adrDraft);

    return {
      adrDraft,
      exportResult,
      renderedContent: exportResult.renderedContent,
      recommendationGrantsExecution: false,
      liveExecution: false,
      externalProcessStarted: false,
      executionDisabled: true,
      degraded: true,
      reason: 'supervisor unavailable; local control-plane fallback used',
    };
  }
}

export async function createCodexExecAdrDecision(
  dryRunId: string,
  options: CodexExecAdrDecisionCreateCliOptions = {},
): Promise<Record<string, unknown>> {
  const decision = normalizeAdrDecisionOutcome(options.decision);
  const status = normalizeAdrDecisionStatus(options.status);

  try {
    const response = await fetch(`${supervisorUrl}/api/codex/exec/live-adapter-adr-decision`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        dryRunId,
        reviewerLabel: options.reviewer ?? 'local-operator',
        rationaleSummary:
          options.rationaleSummary ??
          'Conditional read-only design only; implementation remains unapproved.',
        decision,
        status,
      }),
    });

    if (!response.ok) {
      throw new Error(`supervisor returned ${response.status}`);
    }

    return (await response.json()) as Record<string, unknown>;
  } catch {
    const decisionRecord = createLocalLiveAdapterAdrDecisionRecord(dryRunId, {
      reviewer: options.reviewer,
      rationaleSummary: options.rationaleSummary,
      decision,
      status,
    });

    return createAdrDecisionResponse(decisionRecord, true);
  }
}

export async function getCodexExecAdrDecision(
  decisionId: string,
): Promise<Record<string, unknown>> {
  try {
    const response = await fetch(
      `${supervisorUrl}/api/codex/exec/live-adapter-adr-decision/${encodeURIComponent(decisionId)}`,
    );

    if (!response.ok) {
      throw new Error(`supervisor returned ${response.status}`);
    }

    return (await response.json()) as Record<string, unknown>;
  } catch {
    const decisionRecord = {
      ...createLocalLiveAdapterAdrDecisionRecord('codex_dry_run_fixture', {
        reviewer: 'cli-fallback',
        rationaleSummary: `Supervisor unavailable while reading ADR decision ${decisionId}.`,
      }),
      id: decisionId,
    };

    return createAdrDecisionResponse(decisionRecord, true);
  }
}

export async function listCodexExecAdrDecisions(
  options: CodexExecAdrDecisionListCliOptions = {},
): Promise<Record<string, unknown>> {
  const query = createAdrDecisionQueryString(options);

  try {
    const response = await fetch(
      `${supervisorUrl}/api/codex/exec/live-adapter-adr-decisions${query}`,
    );

    if (!response.ok) {
      throw new Error(`supervisor returned ${response.status}`);
    }

    return (await response.json()) as Record<string, unknown>;
  } catch {
    const dryRunId = options.dryRun ?? 'codex_dry_run_fixture';
    const records = createLocalLiveAdapterAdrDecisionRecords(dryRunId).filter((record) => {
      const queryObject = createAdrDecisionQueryFromCliOptions(options, dryRunId);

      if (queryObject.dryRunId && record.dryRunId !== queryObject.dryRunId) {
        return false;
      }

      if (queryObject.status && record.status !== queryObject.status) {
        return false;
      }

      if (queryObject.decision && record.decision !== queryObject.decision) {
        return false;
      }

      return true;
    });
    const queryObject = createAdrDecisionQueryFromCliOptions(options, dryRunId);

    return {
      records,
      decisions: listCodexExecLiveAdapterAdrDecisionSummaries(records, queryObject),
      implementationApproved: false,
      processAdapterApproved: false,
      recommendationGrantsExecution: false,
      liveExecution: false,
      externalProcessStarted: false,
      executionDisabled: true,
      degraded: true,
      reason: 'supervisor unavailable; local ADR decision fallback used and was not persisted',
    };
  }
}

export async function getLatestCodexExecAdrDecisionCommand(
  dryRunId: string,
): Promise<Record<string, unknown>> {
  try {
    const response = await fetch(
      `${supervisorUrl}/api/codex/exec/live-adapter-adr-decision/latest/${encodeURIComponent(
        dryRunId,
      )}`,
    );

    if (!response.ok) {
      throw new Error(`supervisor returned ${response.status}`);
    }

    return (await response.json()) as Record<string, unknown>;
  } catch {
    const records = createLocalLiveAdapterAdrDecisionRecords(dryRunId);
    const decisionRecord = getLatestCodexExecLiveAdapterAdrDecision(records, dryRunId);

    return createAdrDecisionResponse(
      decisionRecord ?? createLocalLiveAdapterAdrDecisionRecord(dryRunId),
      true,
    );
  }
}

export async function simulateReadOnlyAdapterPreflightCommand(
  dryRunId: string,
  options: CodexExecReadOnlyAdapterPreflightCliOptions = {},
): Promise<Record<string, unknown>> {
  try {
    const response = await fetch(
      `${supervisorUrl}/api/codex/exec/read-only-adapter/preflight-simulate`,
      {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          dryRunId,
          isolatedWorktreePresent: options.isolatedWorktree === true,
          evidenceStoreReady: options.evidenceReady === true,
          auditStoreReady: options.auditReady === true,
          checklistComplete: options.checklistComplete === true,
        }),
      },
    );

    if (!response.ok) {
      throw new Error(`supervisor returned ${response.status}`);
    }

    return (await response.json()) as Record<string, unknown>;
  } catch {
    const record = createLocalCodexExecControlPlaneRecord(dryRunId);
    const configLoadResult = await readLocalCodexExecConfig();
    const adrDecision = createLocalLiveAdapterAdrDecisionRecord(record.dryRunPlanId);
    const simulationResult = simulateReadOnlyAdapterPreflight({
      dryRunId: record.dryRunPlanId,
      record,
      config: configLoadResult.config,
      adrDecision,
      isolatedWorktreePresent: options.isolatedWorktree === true,
      evidenceStoreReady: options.evidenceReady === true,
      auditStoreReady: options.auditReady === true,
      operatorChecklist: createReadOnlyAdapterChecklistFromOptions(options),
      metadata: { requestedBy: 'cli-fallback' },
    });
    const summary = summarizeReadOnlyAdapterPreflightSimulation(simulationResult);
    const evidenceRefs = createReadOnlyAdapterPreflightSimulationEvidenceRefs(simulationResult);
    const auditEvents = createReadOnlyAdapterPreflightSimulationAuditEvents(
      simulationResult,
      evidenceRefs,
    );

    return {
      simulationResult,
      summary,
      blockers: simulationResult.blockers,
      evidenceRefs,
      auditEvents,
      configLoadResult,
      liveExecution: false,
      externalProcessStarted: false,
      executionDisabled: true,
      processAdapterStarted: false,
      implementationApproved: false,
      dashboardTriggerAllowed: false,
      degraded: true,
      reason:
        'supervisor unavailable; local read-only adapter preflight simulation was not persisted',
    };
  }
}

export async function createReadOnlyAdapterSimulatorReviewCommand(
  dryRunId: string,
  options: CodexExecReadOnlyAdapterSimulatorReviewCreateCliOptions = {},
): Promise<Record<string, unknown>> {
  const outcome = normalizeReadOnlyAdapterSimulatorReviewOutcome(options.outcome);
  const status = normalizeReadOnlyAdapterSimulatorReviewStatus(options.status);

  try {
    const response = await fetch(
      `${supervisorUrl}/api/codex/exec/read-only-adapter/simulator-review`,
      {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          dryRunId,
          reviewerLabel: options.reviewer ?? 'local-operator',
          outcome,
          status,
          rationaleSummary:
            options.rationaleSummary ??
            'Simulator review allows implementation planning only; implementation remains unapproved.',
        }),
      },
    );

    if (!response.ok) {
      throw new Error(`supervisor returned ${response.status}`);
    }

    return (await response.json()) as Record<string, unknown>;
  } catch {
    const reviewRecord = await createLocalReadOnlyAdapterSimulatorReviewRecord(dryRunId, {
      reviewer: options.reviewer,
      outcome,
      status,
      rationaleSummary: options.rationaleSummary,
    });

    return createReadOnlyAdapterSimulatorReviewResponse(reviewRecord, true);
  }
}

export async function getReadOnlyAdapterSimulatorReviewCommand(
  reviewId: string,
): Promise<Record<string, unknown>> {
  try {
    const response = await fetch(
      `${supervisorUrl}/api/codex/exec/read-only-adapter/simulator-review/${encodeURIComponent(
        reviewId,
      )}`,
    );

    if (!response.ok) {
      throw new Error(`supervisor returned ${response.status}`);
    }

    return (await response.json()) as Record<string, unknown>;
  } catch {
    const reviewRecord = {
      ...(await createLocalReadOnlyAdapterSimulatorReviewRecord('codex_dry_run_fixture', {
        reviewer: 'cli-fallback',
        rationaleSummary: `Supervisor unavailable while reading simulator review ${reviewId}.`,
      })),
      id: reviewId,
    };

    return createReadOnlyAdapterSimulatorReviewResponse(reviewRecord, true);
  }
}

export async function listReadOnlyAdapterSimulatorReviewsCommand(
  options: CodexExecReadOnlyAdapterSimulatorReviewListCliOptions = {},
): Promise<Record<string, unknown>> {
  const query = createReadOnlyAdapterSimulatorReviewQueryString(options);

  try {
    const response = await fetch(
      `${supervisorUrl}/api/codex/exec/read-only-adapter/simulator-reviews${query}`,
    );

    if (!response.ok) {
      throw new Error(`supervisor returned ${response.status}`);
    }

    return (await response.json()) as Record<string, unknown>;
  } catch {
    const dryRunId = options.dryRun ?? 'codex_dry_run_fixture';
    const queryObject = createReadOnlyAdapterSimulatorReviewQueryFromCliOptions(options, dryRunId);
    const records = (await createLocalReadOnlyAdapterSimulatorReviewRecords(dryRunId)).filter(
      (record) => {
        if (queryObject.dryRunId && record.dryRunId !== queryObject.dryRunId) {
          return false;
        }

        if (queryObject.status && record.status !== queryObject.status) {
          return false;
        }

        if (queryObject.outcome && record.outcome !== queryObject.outcome) {
          return false;
        }

        return true;
      },
    );

    return {
      records,
      reviews: listReadOnlyAdapterSimulatorReviewSummaries(records, queryObject),
      liveExecution: false,
      externalProcessStarted: false,
      executionDisabled: true,
      processAdapterStarted: false,
      implementationApproved: false,
      processAdapterApproved: false,
      dashboardTriggerAllowed: false,
      recommendationGrantsExecution: false,
      degraded: true,
      reason: 'supervisor unavailable; local simulator review fallback used and was not persisted',
    };
  }
}

export async function getLatestReadOnlyAdapterSimulatorReviewCommand(
  dryRunId: string,
): Promise<Record<string, unknown>> {
  try {
    const response = await fetch(
      `${supervisorUrl}/api/codex/exec/read-only-adapter/simulator-review/latest/${encodeURIComponent(
        dryRunId,
      )}`,
    );

    if (!response.ok) {
      throw new Error(`supervisor returned ${response.status}`);
    }

    return (await response.json()) as Record<string, unknown>;
  } catch {
    const records = await createLocalReadOnlyAdapterSimulatorReviewRecords(dryRunId);
    const reviewRecord = getLatestReadOnlyAdapterSimulatorReview(records, dryRunId);

    return createReadOnlyAdapterSimulatorReviewResponse(
      reviewRecord ?? (await createLocalReadOnlyAdapterSimulatorReviewRecord(dryRunId)),
      true,
    );
  }
}

export async function createReadOnlyAdapterImplementationPlanReviewCommand(
  options: CodexExecReadOnlyAdapterImplementationPlanReviewCreateCliOptions = {},
): Promise<Record<string, unknown>> {
  if (!options.outcome) {
    throw new Error('implementation plan review outcome is required');
  }

  const outcome = normalizeReadOnlyAdapterImplementationPlanReviewOutcome(options.outcome);
  const status = normalizeReadOnlyAdapterImplementationPlanReviewStatus(options.status);

  try {
    const response = await fetch(
      `${supervisorUrl}/api/codex/exec/read-only-adapter/implementation-plan-review`,
      {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          reviewerLabel: options.reviewer ?? 'local-operator',
          outcome,
          status,
          rationaleSummary:
            options.rationaleSummary ??
            'Implementation plan review records governance only; process adapter and execution remain unapproved.',
        }),
      },
    );

    if (!response.ok) {
      throw new Error(`supervisor returned ${response.status}`);
    }

    return (await response.json()) as Record<string, unknown>;
  } catch {
    const reviewRecord = createLocalReadOnlyAdapterImplementationPlanReviewRecord({
      reviewer: options.reviewer,
      outcome,
      status,
      rationaleSummary: options.rationaleSummary,
    });

    return createReadOnlyAdapterImplementationPlanReviewResponse(reviewRecord, true);
  }
}

export async function getReadOnlyAdapterImplementationPlanReviewCommand(
  reviewId: string,
): Promise<Record<string, unknown>> {
  try {
    const response = await fetch(
      `${supervisorUrl}/api/codex/exec/read-only-adapter/implementation-plan-review/${encodeURIComponent(
        reviewId,
      )}`,
    );

    if (!response.ok) {
      throw new Error(`supervisor returned ${response.status}`);
    }

    return (await response.json()) as Record<string, unknown>;
  } catch {
    const reviewRecord = {
      ...createLocalReadOnlyAdapterImplementationPlanReviewRecord({
        reviewer: 'cli-fallback',
        outcome: 'no_go',
        rationaleSummary: `Supervisor unavailable while reading implementation plan review ${reviewId}.`,
      }),
      id: reviewId,
    };

    return createReadOnlyAdapterImplementationPlanReviewResponse(reviewRecord, true);
  }
}

export async function listReadOnlyAdapterImplementationPlanReviewsCommand(
  options: CodexExecReadOnlyAdapterImplementationPlanReviewListCliOptions = {},
): Promise<Record<string, unknown>> {
  const query = createReadOnlyAdapterImplementationPlanReviewQueryString(options);

  try {
    const response = await fetch(
      `${supervisorUrl}/api/codex/exec/read-only-adapter/implementation-plan-reviews${query}`,
    );

    if (!response.ok) {
      throw new Error(`supervisor returned ${response.status}`);
    }

    return (await response.json()) as Record<string, unknown>;
  } catch {
    const queryObject = createReadOnlyAdapterImplementationPlanReviewQueryFromCliOptions(options);
    const records = createLocalReadOnlyAdapterImplementationPlanReviewRecords().filter((record) => {
      if (queryObject.status && record.status !== queryObject.status) {
        return false;
      }

      if (queryObject.outcome && record.outcome !== queryObject.outcome) {
        return false;
      }

      return true;
    });

    return {
      records,
      reviews: listReadOnlyAdapterImplementationPlanReviewSummaries(records, queryObject),
      liveExecution: false,
      externalProcessStarted: false,
      executionDisabled: true,
      processAdapterStarted: false,
      implementationApproved: false,
      processAdapterApproved: false,
      dashboardTriggerAllowed: false,
      recommendationGrantsExecution: false,
      workspaceWriteAllowed: false,
      dangerFullAccessAllowed: false,
      degraded: true,
      reason:
        'supervisor unavailable; local implementation plan review fallback used and was not persisted',
    };
  }
}

export async function getLatestReadOnlyAdapterImplementationPlanReviewCommand(): Promise<
  Record<string, unknown>
> {
  try {
    const response = await fetch(
      `${supervisorUrl}/api/codex/exec/read-only-adapter/implementation-plan-review/latest`,
    );

    if (!response.ok) {
      throw new Error(`supervisor returned ${response.status}`);
    }

    return (await response.json()) as Record<string, unknown>;
  } catch {
    const records = createLocalReadOnlyAdapterImplementationPlanReviewRecords();
    const reviewRecord = getLatestReadOnlyAdapterImplementationPlanReview(records);

    return createReadOnlyAdapterImplementationPlanReviewResponse(
      reviewRecord ??
        createLocalReadOnlyAdapterImplementationPlanReviewRecord({ outcome: 'no_go' }),
      true,
    );
  }
}

export async function getReadOnlyAdapterSkeletonPreviewCommand(): Promise<Record<string, unknown>> {
  try {
    const response = await fetch(
      `${supervisorUrl}/api/codex/exec/read-only-adapter/skeleton-preview`,
    );

    if (!response.ok) {
      throw new Error(`supervisor returned ${response.status}`);
    }

    return (await response.json()) as Record<string, unknown>;
  } catch {
    const preview = createReadOnlyAdapterSkeletonPreview({
      metadata: { cliFallback: true, persisted: false },
    });

    return {
      preview,
      liveExecution: false,
      externalProcessStarted: false,
      executionDisabled: true,
      processAdapterStarted: false,
      implementationApproved: false,
      processAdapterApproved: false,
      dashboardTriggerAllowed: false,
      recommendationGrantsExecution: false,
      workspaceWriteAllowed: false,
      dangerFullAccessAllowed: false,
      degraded: true,
      reason: 'supervisor unavailable; local skeleton preview fallback used and was not persisted',
    };
  }
}

export async function createReadOnlyAdapterSkeletonReviewCommand(
  options: CodexExecReadOnlyAdapterSkeletonReviewCreateCliOptions = {},
): Promise<Record<string, unknown>> {
  const outcome = normalizeReadOnlyAdapterSkeletonReviewOutcome(options.outcome);
  const status = normalizeReadOnlyAdapterSkeletonReviewStatus(options.status);

  try {
    const response = await fetch(
      `${supervisorUrl}/api/codex/exec/read-only-adapter/skeleton-review`,
      {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          reviewerLabel: options.reviewer ?? 'local-operator',
          outcome,
          status,
          rationaleSummary:
            options.rationaleSummary ??
            'Skeleton review allows fixture-backed replay boundary only; execution remains disabled.',
        }),
      },
    );

    if (!response.ok) {
      throw new Error(`supervisor returned ${response.status}`);
    }

    return (await response.json()) as Record<string, unknown>;
  } catch {
    return createReadOnlyAdapterSkeletonReviewResponse(
      createLocalReadOnlyAdapterSkeletonReviewRecord({ ...options, outcome, status }),
      true,
    );
  }
}

export async function getReadOnlyAdapterSkeletonReviewCommand(
  reviewId: string,
): Promise<Record<string, unknown>> {
  try {
    const response = await fetch(
      `${supervisorUrl}/api/codex/exec/read-only-adapter/skeleton-review/${encodeURIComponent(
        reviewId,
      )}`,
    );

    if (!response.ok) {
      throw new Error(`supervisor returned ${response.status}`);
    }

    return (await response.json()) as Record<string, unknown>;
  } catch {
    const reviewRecord = {
      ...createLocalReadOnlyAdapterSkeletonReviewRecord({ outcome: 'no_go' }),
      id: reviewId,
    };
    return createReadOnlyAdapterSkeletonReviewResponse(reviewRecord, true);
  }
}

export async function listReadOnlyAdapterSkeletonReviewsCommand(
  options: CodexExecReadOnlyAdapterSkeletonReviewListCliOptions = {},
): Promise<Record<string, unknown>> {
  const query = createReadOnlyAdapterSkeletonReviewQueryString(options);

  try {
    const response = await fetch(
      `${supervisorUrl}/api/codex/exec/read-only-adapter/skeleton-reviews${query}`,
    );

    if (!response.ok) {
      throw new Error(`supervisor returned ${response.status}`);
    }

    return (await response.json()) as Record<string, unknown>;
  } catch {
    const queryObject = createReadOnlyAdapterSkeletonReviewQueryFromCliOptions(options);
    const records = createLocalReadOnlyAdapterSkeletonReviewRecords().filter((record) => {
      if (queryObject.status && record.status !== queryObject.status) {
        return false;
      }

      if (queryObject.outcome && record.outcome !== queryObject.outcome) {
        return false;
      }

      return true;
    });

    return {
      records,
      reviews: listReadOnlyAdapterSkeletonReviewSummaries(records, queryObject),
      liveExecution: false,
      externalProcessStarted: false,
      executionDisabled: true,
      processAdapterStarted: false,
      implementationApproved: false,
      processAdapterApproved: false,
      dashboardTriggerAllowed: false,
      recommendationGrantsExecution: false,
      workspaceWriteAllowed: false,
      dangerFullAccessAllowed: false,
      degraded: true,
      reason: 'supervisor unavailable; local skeleton review fallback used and was not persisted',
    };
  }
}

export async function getLatestReadOnlyAdapterSkeletonReviewCommand(): Promise<
  Record<string, unknown>
> {
  try {
    const response = await fetch(
      `${supervisorUrl}/api/codex/exec/read-only-adapter/skeleton-review/latest`,
    );

    if (!response.ok) {
      throw new Error(`supervisor returned ${response.status}`);
    }

    return (await response.json()) as Record<string, unknown>;
  } catch {
    const records = createLocalReadOnlyAdapterSkeletonReviewRecords();
    const reviewRecord = getLatestReadOnlyAdapterSkeletonReview(records);
    return createReadOnlyAdapterSkeletonReviewResponse(
      reviewRecord ?? createLocalReadOnlyAdapterSkeletonReviewRecord({ outcome: 'no_go' }),
      true,
    );
  }
}

export async function runReadOnlyAdapterFixtureBoundaryCommand(
  fixturePath: string,
  options: CodexExecReadOnlyAdapterFixtureBoundaryCliOptions = {},
): Promise<Record<string, unknown>> {
  try {
    const response = await fetch(
      `${supervisorUrl}/api/codex/exec/read-only-adapter/fixture-boundary`,
      {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ fixturePath, dryRunId: options.dryRun }),
      },
    );

    if (!response.ok) {
      throw new Error(`supervisor returned ${response.status}`);
    }

    return (await response.json()) as Record<string, unknown>;
  } catch {
    const fixtureText = await readAllowedFixture(fixturePath);
    const result = await runReadOnlyAdapterFixtureBoundary({
      fixturePath: toWorkspacePath(resolve(findWorkspaceRoot(process.cwd()), fixturePath)),
      fixtureText,
      dryRunId: options.dryRun,
      metadata: { cliFallback: true, persisted: false },
    });

    return {
      result,
      summary: summarizeReadOnlyAdapterFixtureBoundary(result),
      evidenceRefs: result.evidenceRefs,
      liveExecution: false,
      externalProcessStarted: false,
      executionDisabled: true,
      processAdapterStarted: false,
      implementationApproved: false,
      processAdapterApproved: false,
      dashboardTriggerAllowed: false,
      recommendationGrantsExecution: false,
      workspaceWriteAllowed: false,
      dangerFullAccessAllowed: false,
      degraded: true,
      reason: 'supervisor unavailable; local fixture boundary fallback used and was not persisted',
    };
  }
}

export async function createReadOnlyAdapterFinalReadinessCommand(
  options: CodexExecReadOnlyAdapterFinalReadinessCreateCliOptions = {},
): Promise<Record<string, unknown>> {
  const outcome = normalizeReadOnlyAdapterFinalReadinessOutcome(options.outcome);
  const status = normalizeReadOnlyAdapterFinalReadinessStatus(options.status);

  try {
    const response = await fetch(
      `${supervisorUrl}/api/codex/exec/read-only-adapter/final-readiness`,
      {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          reviewerLabel: options.reviewer ?? 'local-operator',
          outcome,
          status,
          rationaleSummary:
            options.rationaleSummary ??
            'Separate ADR remains required before any real read-only adapter can be considered.',
        }),
      },
    );

    if (!response.ok) {
      throw new Error(`supervisor returned ${response.status}`);
    }

    return (await response.json()) as Record<string, unknown>;
  } catch {
    return createReadOnlyAdapterFinalReadinessResponse(
      await createLocalReadOnlyAdapterFinalReadinessRecord({ ...options, outcome, status }),
      true,
    );
  }
}

export async function listReadOnlyAdapterFinalReadinessCommand(
  options: CodexExecReadOnlyAdapterFinalReadinessListCliOptions = {},
): Promise<Record<string, unknown>> {
  const query = createReadOnlyAdapterFinalReadinessQueryString(options);

  try {
    const response = await fetch(
      `${supervisorUrl}/api/codex/exec/read-only-adapter/final-readiness${query}`,
    );

    if (!response.ok) {
      throw new Error(`supervisor returned ${response.status}`);
    }

    return (await response.json()) as Record<string, unknown>;
  } catch {
    const queryObject = createReadOnlyAdapterFinalReadinessQueryFromCliOptions(options);
    const records = [await createLocalReadOnlyAdapterFinalReadinessRecord({})].filter((record) => {
      if (queryObject.status && record.status !== queryObject.status) {
        return false;
      }

      if (queryObject.outcome && record.outcome !== queryObject.outcome) {
        return false;
      }

      return true;
    });

    return {
      records,
      reviews: listReadOnlyAdapterFinalReadinessSummaries(records, queryObject),
      liveExecution: false,
      externalProcessStarted: false,
      executionDisabled: true,
      processAdapterStarted: false,
      implementationApproved: false,
      processAdapterApproved: false,
      dashboardTriggerAllowed: false,
      recommendationGrantsExecution: false,
      workspaceWriteAllowed: false,
      dangerFullAccessAllowed: false,
      degraded: true,
      reason: 'supervisor unavailable; local final readiness fallback used and was not persisted',
    };
  }
}

export async function getLatestReadOnlyAdapterFinalReadinessCommand(): Promise<
  Record<string, unknown>
> {
  try {
    const response = await fetch(
      `${supervisorUrl}/api/codex/exec/read-only-adapter/final-readiness/latest`,
    );

    if (!response.ok) {
      throw new Error(`supervisor returned ${response.status}`);
    }

    return (await response.json()) as Record<string, unknown>;
  } catch {
    return createReadOnlyAdapterFinalReadinessResponse(
      await createLocalReadOnlyAdapterFinalReadinessRecord({}),
      true,
    );
  }
}

export async function createRealReadOnlyAdapterReadinessCommand(
  dryRunId: string,
): Promise<Record<string, unknown>> {
  try {
    const response = await fetch(
      `${supervisorUrl}/api/codex/exec/real-read-only-adapter/readiness-package`,
      {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ dryRunId }),
      },
    );

    if (!response.ok) {
      throw new Error(`supervisor returned ${response.status}`);
    }

    return (await response.json()) as Record<string, unknown>;
  } catch {
    return createRealReadOnlyAdapterReadinessFallback(dryRunId);
  }
}

export async function getRealReadOnlyAdapterReadinessCommand(
  packageId: string,
): Promise<Record<string, unknown>> {
  try {
    const response = await fetch(
      `${supervisorUrl}/api/codex/exec/real-read-only-adapter/readiness-package/${encodeURIComponent(
        packageId,
      )}`,
    );

    if (!response.ok) {
      throw new Error(`supervisor returned ${response.status}`);
    }

    return (await response.json()) as Record<string, unknown>;
  } catch {
    const fallback = createRealReadOnlyAdapterReadinessFallback('local-fallback');
    const packageRecord = fallback.package as CodexExecRealReadOnlyAdapterReadinessPackage;

    return {
      ...fallback,
      package: {
        ...packageRecord,
        id: packageId,
      },
    };
  }
}

export async function listRealReadOnlyAdapterReadinessCommand(
  options: CodexExecRealReadOnlyAdapterReadinessListCliOptions = {},
): Promise<Record<string, unknown>> {
  const query = createRealReadOnlyAdapterReadinessQueryString(options);

  try {
    const response = await fetch(
      `${supervisorUrl}/api/codex/exec/real-read-only-adapter/readiness-packages${query}`,
    );

    if (!response.ok) {
      throw new Error(`supervisor returned ${response.status}`);
    }

    return (await response.json()) as Record<string, unknown>;
  } catch {
    const fallback = createRealReadOnlyAdapterReadinessFallback(options.dryRun ?? 'local-fallback');
    const packageRecord = fallback.package as CodexExecRealReadOnlyAdapterReadinessPackage;

    return {
      packages: [packageRecord].filter((candidate) => {
        if (
          options.status &&
          candidate.status !== normalizeRealReadOnlyAdapterReadinessStatus(options.status)
        ) {
          return false;
        }

        return true;
      }),
      summaries: [summarizeRealReadOnlyAdapterReadinessPackage(packageRecord)],
      recommendation: REAL_READ_ONLY_ADAPTER_READINESS_RECOMMENDATION,
      liveExecution: false,
      externalProcessStarted: false,
      executionDisabled: true,
      processAdapterStarted: false,
      implementationApproved: false,
      processAdapterApproved: false,
      recommendationGrantsExecution: false,
      workspaceWriteAllowed: false,
      dangerFullAccessAllowed: false,
      dashboardTriggerAllowed: false,
      degraded: true,
      notPersisted: true,
      reason: 'supervisor unavailable; local readiness fallback used and was not persisted',
    };
  }
}

export async function getLatestRealReadOnlyAdapterReadinessCommand(
  dryRunId: string,
): Promise<Record<string, unknown>> {
  try {
    const response = await fetch(
      `${supervisorUrl}/api/codex/exec/real-read-only-adapter/readiness-package/latest/${encodeURIComponent(
        dryRunId,
      )}`,
    );

    if (!response.ok) {
      throw new Error(`supervisor returned ${response.status}`);
    }

    return (await response.json()) as Record<string, unknown>;
  } catch {
    return createRealReadOnlyAdapterReadinessFallback(dryRunId);
  }
}

export async function createRealReadOnlyAdapterReadinessReviewCommand(
  packageId: string,
  options: CodexExecRealReadOnlyAdapterReadinessReviewCreateCliOptions = {},
): Promise<Record<string, unknown>> {
  const outcome = normalizeRealReadOnlyAdapterReadinessReviewOutcome(options.outcome);
  const status = normalizeRealReadOnlyAdapterReadinessReviewStatus(options.status);

  try {
    const response = await fetch(
      `${supervisorUrl}/api/codex/exec/real-read-only-adapter/readiness-review`,
      {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          packageId,
          outcome,
          reviewerLabel: options.reviewer ?? 'local-operator',
          rationaleSummary: options.rationaleSummary ?? 'Readiness reviewed.',
          status,
        }),
      },
    );

    const payload = (await response.json().catch(() => ({}))) as Record<string, unknown>;

    if (!response.ok) {
      return {
        ...createReadinessReviewUnavailableResponse(
          `supervisor returned ${response.status}; readiness review was not created`,
        ),
        ...payload,
        notPersisted: true,
      };
    }

    return payload;
  } catch {
    return createReadinessReviewUnavailableResponse(
      'supervisor unavailable; readiness review create fallback is display-only and was not persisted',
    );
  }
}

export async function getRealReadOnlyAdapterReadinessReviewCommand(
  reviewId: string,
): Promise<Record<string, unknown>> {
  try {
    const response = await fetch(
      `${supervisorUrl}/api/codex/exec/real-read-only-adapter/readiness-review/${encodeURIComponent(
        reviewId,
      )}`,
    );

    if (!response.ok) {
      throw new Error(`supervisor returned ${response.status}`);
    }

    return (await response.json()) as Record<string, unknown>;
  } catch {
    return createReadinessReviewUnavailableResponse(
      'supervisor unavailable; readiness review read fallback is display-only',
    );
  }
}

export async function listRealReadOnlyAdapterReadinessReviewCommand(
  options: CodexExecRealReadOnlyAdapterReadinessReviewListCliOptions = {},
): Promise<Record<string, unknown>> {
  const query = createRealReadOnlyAdapterReadinessReviewQueryString(options);

  try {
    const response = await fetch(
      `${supervisorUrl}/api/codex/exec/real-read-only-adapter/readiness-reviews${query}`,
    );

    if (!response.ok) {
      throw new Error(`supervisor returned ${response.status}`);
    }

    return (await response.json()) as Record<string, unknown>;
  } catch {
    return {
      reviews: [],
      summaries: [],
      recommendation: REAL_READ_ONLY_ADAPTER_READINESS_REVIEW_RECOMMENDATION,
      liveExecution: false,
      externalProcessStarted: false,
      executionDisabled: true,
      processAdapterStarted: false,
      implementationApproved: false,
      processAdapterApproved: false,
      recommendationGrantsExecution: false,
      workspaceWriteAllowed: false,
      dangerFullAccessAllowed: false,
      dashboardTriggerAllowed: false,
      degraded: true,
      notPersisted: true,
      reason: 'supervisor unavailable; no local reviewable package was generated',
    };
  }
}

export async function getLatestRealReadOnlyAdapterReadinessReviewCommand(
  dryRunId: string,
): Promise<Record<string, unknown>> {
  try {
    const response = await fetch(
      `${supervisorUrl}/api/codex/exec/real-read-only-adapter/readiness-review/latest/${encodeURIComponent(
        dryRunId,
      )}`,
    );

    if (!response.ok) {
      throw new Error(`supervisor returned ${response.status}`);
    }

    return (await response.json()) as Record<string, unknown>;
  } catch {
    return createReadinessReviewUnavailableResponse(
      'supervisor unavailable; latest readiness review fallback is display-only',
    );
  }
}

export async function attemptRealReadOnlyAdapterCommand(
  dryRunId: string,
  options: CodexExecRealReadOnlyAdapterAttemptCliOptions = {},
): Promise<Record<string, unknown>> {
  try {
    const response = await fetch(
      `${supervisorUrl}/api/codex/exec/real-read-only-adapter/attempt`,
      {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          dryRunId,
          approvalArtifactId: options.approval,
          isolatedWorktreeProvided: options.worktree !== undefined,
        }),
      },
    );

    if (!response.ok) {
      throw new Error(`supervisor returned ${response.status}`);
    }

    return (await response.json()) as Record<string, unknown>;
  } catch {
    return createRealReadOnlyAdapterAttemptRefusal(dryRunId, options);
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

export function formatCodexExecAdrDraftOutput(result: Record<string, unknown>): string {
  const exportResult = result.exportResult as
    | {
        renderedContent?: string;
        format?: string;
      }
    | undefined;

  if (exportResult?.renderedContent) {
    return exportResult.renderedContent;
  }

  const adrDraft = result.adrDraft as
    | {
        dryRunId?: string;
        status?: string;
        title?: string;
        recommendation?: string;
        recommendationGrantsExecution?: boolean;
        draftOnly?: boolean;
        summary?: {
          sectionCount?: number;
          blockerCount?: number;
          readinessPassedCount?: number;
          readinessFailedCount?: number;
          riskClassification?: string;
        };
      }
    | undefined;

  return [
    'Codex live adapter ADR draft',
    `dryRunId: ${adrDraft?.dryRunId ?? 'unknown'}`,
    `title: ${adrDraft?.title ?? 'unknown'}`,
    `status: ${adrDraft?.status ?? 'unknown'}`,
    `risk: ${adrDraft?.summary?.riskClassification ?? 'unknown'}`,
    `recommendation: ${adrDraft?.recommendation ?? 'unknown'} (does not grant execution)`,
    `recommendationGrantsExecution=${String(adrDraft?.recommendationGrantsExecution ?? false)}`,
    `draftOnly=${String(adrDraft?.draftOnly ?? true)}`,
    `sections: ${adrDraft?.summary?.sectionCount ?? 0}`,
    `readiness: ${adrDraft?.summary?.readinessPassedCount ?? 0} passed, ${
      adrDraft?.summary?.readinessFailedCount ?? 0
    } failed`,
    `blockers: ${adrDraft?.summary?.blockerCount ?? 0}`,
    noLiveFlagsText(result),
  ].join('\n');
}

export function formatCodexExecAdrDecisionOutput(
  result: Record<string, unknown>,
  options: CodexExecJsonCliOptions = {},
): string {
  if (options.json) {
    return JSON.stringify(result, null, 2);
  }

  const decision = result.decisionRecord as
    | {
        id?: string;
        dryRunId?: string;
        decision?: string;
        status?: string;
        reviewerLabel?: string;
        allowedSandboxModes?: string[];
        forbiddenSandboxModes?: string[];
        futureTriggerPolicy?: string;
        dashboardTriggerAllowed?: boolean;
        implementationApproved?: boolean;
        processAdapterApproved?: boolean;
        recommendationGrantsExecution?: boolean;
        gatePolicy?: {
          dryRunPlanHashMatchRequired?: boolean;
          policyDecisionHashMatchRequired?: boolean;
          isolatedWorktreeRequired?: boolean;
          postRunVerificationCommand?: string;
        };
        evidenceRefs?: unknown[];
        auditEventIds?: string[];
      }
    | undefined;

  return [
    'Codex live adapter ADR decision',
    `decisionId: ${decision?.id ?? 'unknown'}`,
    `dryRunId: ${decision?.dryRunId ?? 'unknown'}`,
    `decision: ${decision?.decision ?? 'unknown'}`,
    `status: ${decision?.status ?? 'unknown'}`,
    `reviewer: ${decision?.reviewerLabel ?? 'unknown'}`,
    `allowedSandboxModes: ${(decision?.allowedSandboxModes ?? []).join(', ') || 'none'}`,
    `forbiddenSandboxModes: ${(decision?.forbiddenSandboxModes ?? []).join(', ') || 'none'}`,
    `futureTriggerPolicy: ${decision?.futureTriggerPolicy ?? 'cli_only'}`,
    `dashboardTriggerAllowed=${String(decision?.dashboardTriggerAllowed ?? false)}`,
    `implementationApproved=${String(decision?.implementationApproved ?? false)}`,
    `processAdapterApproved=${String(decision?.processAdapterApproved ?? false)}`,
    `recommendationGrantsExecution=${String(decision?.recommendationGrantsExecution ?? false)}`,
    `dryRunPlanHashMatchRequired=${String(
      decision?.gatePolicy?.dryRunPlanHashMatchRequired ?? true,
    )}`,
    `policyDecisionHashMatchRequired=${String(
      decision?.gatePolicy?.policyDecisionHashMatchRequired ?? true,
    )}`,
    `isolatedWorktreeRequired=${String(decision?.gatePolicy?.isolatedWorktreeRequired ?? true)}`,
    `postRunVerificationCommand=${decision?.gatePolicy?.postRunVerificationCommand ?? 'pnpm verify:foundation'}`,
    `evidence: ${decision?.evidenceRefs?.length ?? 0}`,
    `audit: ${decision?.auditEventIds?.length ?? 0}`,
    'This ADR decision is governance guidance only and does not approve implementation.',
    noLiveFlagsText(result),
  ].join('\n');
}

export function formatCodexExecAdrDecisionListOutput(
  result: Record<string, unknown>,
  options: CodexExecAdrDecisionListCliOptions = {},
): string {
  if (options.json) {
    return JSON.stringify(result, null, 2);
  }

  const decisions = result.decisions as
    | Array<{
        decisionId?: string;
        dryRunId?: string;
        decision?: string;
        status?: string;
        implementationApproved?: boolean;
        processAdapterApproved?: boolean;
        recommendationGrantsExecution?: boolean;
      }>
    | undefined;
  const lines = (decisions ?? [])
    .slice(0, 8)
    .map(
      (decision) =>
        `- ${decision.decisionId ?? 'unknown'} ${decision.status ?? 'unknown'} ${
          decision.decision ?? 'unknown'
        } implementationApproved=${String(
          decision.implementationApproved ?? false,
        )} processAdapterApproved=${String(
          decision.processAdapterApproved ?? false,
        )} recommendationGrantsExecution=${String(
          decision.recommendationGrantsExecution ?? false,
        )}`,
    );

  return [
    'Codex live adapter ADR decision list',
    `count: ${decisions?.length ?? 0}`,
    noLiveFlagsText(result),
    lines.length > 0 ? 'items:' : 'items: none',
    ...lines,
  ].join('\n');
}

export function formatReadOnlyAdapterPreflightSimulationOutput(
  result: Record<string, unknown>,
  options: CodexExecReadOnlyAdapterPreflightCliOptions = {},
): string {
  if (options.json) {
    return JSON.stringify(result, null, 2);
  }

  const simulation = result.simulationResult as
    | {
        dryRunId?: string;
        status?: string;
        passedCheckCount?: number;
        failedCheckCount?: number;
        warningCheckCount?: number;
        blockerCount?: number;
        liveExecution?: boolean;
        externalProcessStarted?: boolean;
        executionDisabled?: boolean;
        processAdapterStarted?: boolean;
        implementationApproved?: boolean;
        dashboardTriggerAllowed?: boolean;
        summary?: string;
      }
    | undefined;
  const blockers = (result.blockers as Array<{ code?: string; severity?: string }> | undefined)
    ?.slice(0, 5)
    .map((blocker) => `- ${blocker.severity ?? 'unknown'} ${blocker.code ?? 'unknown'}`);

  return [
    'Read-only adapter preflight simulation',
    `dryRunId: ${simulation?.dryRunId ?? 'unknown'}`,
    `status: ${simulation?.status ?? 'unknown'}`,
    `checks: ${simulation?.passedCheckCount ?? 0} passed, ${simulation?.failedCheckCount ?? 0} failed, ${simulation?.warningCheckCount ?? 0} require review`,
    `blockers: ${simulation?.blockerCount ?? 0}`,
    `liveExecution=${String(simulation?.liveExecution ?? result.liveExecution ?? false)}`,
    `externalProcessStarted=${String(
      simulation?.externalProcessStarted ?? result.externalProcessStarted ?? false,
    )}`,
    `executionDisabled=${String(simulation?.executionDisabled ?? result.executionDisabled ?? true)}`,
    `processAdapterStarted=${String(
      simulation?.processAdapterStarted ?? result.processAdapterStarted ?? false,
    )}`,
    `implementationApproved=${String(
      simulation?.implementationApproved ?? result.implementationApproved ?? false,
    )}`,
    `dashboardTriggerAllowed=${String(
      simulation?.dashboardTriggerAllowed ?? result.dashboardTriggerAllowed ?? false,
    )}`,
    'simulation only; it does not grant execution permission',
    blockers && blockers.length > 0 ? 'blockers:' : 'blockers: none',
    ...(blockers ?? []),
    simulation?.summary ?? '',
  ]
    .filter((line) => line.length > 0)
    .join('\n');
}

export function formatReadOnlyAdapterSimulatorReviewOutput(
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
        simulationStatus?: string;
        outcome?: string;
        status?: string;
        reviewerLabel?: string;
        hardGateCount?: number;
        requiresReviewCount?: number;
        unresolvedBlockerCount?: number;
        implementationApproved?: boolean;
        processAdapterApproved?: boolean;
        recommendationGrantsExecution?: boolean;
      }
    | undefined;

  return [
    'Read-only adapter simulator review',
    `reviewId: ${review?.id ?? 'unknown'}`,
    `dryRunId: ${review?.dryRunId ?? 'unknown'}`,
    `simulationStatus: ${review?.simulationStatus ?? 'unknown'}`,
    `outcome: ${review?.outcome ?? 'unknown'} (planning guidance only)`,
    `status: ${review?.status ?? 'unknown'}`,
    `reviewer: ${review?.reviewerLabel ?? 'unknown'}`,
    `hardGates: ${review?.hardGateCount ?? 0}`,
    `requiresReview: ${review?.requiresReviewCount ?? 0}`,
    `unresolvedBlockers: ${review?.unresolvedBlockerCount ?? 0}`,
    `implementationApproved=${String(review?.implementationApproved ?? false)}`,
    `processAdapterApproved=${String(review?.processAdapterApproved ?? false)}`,
    `recommendationGrantsExecution=${String(review?.recommendationGrantsExecution ?? false)}`,
    'Outcome may allow Round 3R planning only; it does not approve implementation or execution.',
    noLiveFlagsText(result),
  ].join('\n');
}

export function formatReadOnlyAdapterSimulatorReviewListOutput(
  result: Record<string, unknown>,
  options: CodexExecReadOnlyAdapterSimulatorReviewListCliOptions = {},
): string {
  if (options.json) {
    return JSON.stringify(result, null, 2);
  }

  const reviews = result.reviews as
    | Array<{
        reviewId?: string;
        dryRunId?: string;
        status?: string;
        outcome?: string;
        hardGateCount?: number;
        requiresReviewCount?: number;
        implementationApproved?: boolean;
        processAdapterApproved?: boolean;
        recommendationGrantsExecution?: boolean;
      }>
    | undefined;
  const lines = (reviews ?? [])
    .slice(0, 8)
    .map(
      (review) =>
        `- ${review.reviewId ?? 'unknown'} ${review.status ?? 'unknown'} ${
          review.outcome ?? 'unknown'
        } hardGates=${review.hardGateCount ?? 0} requiresReview=${
          review.requiresReviewCount ?? 0
        } implementationApproved=${String(
          review.implementationApproved ?? false,
        )} processAdapterApproved=${String(
          review.processAdapterApproved ?? false,
        )} recommendationGrantsExecution=${String(review.recommendationGrantsExecution ?? false)}`,
    );

  return [
    'Read-only adapter simulator review list',
    `count: ${reviews?.length ?? 0}`,
    noLiveFlagsText(result),
    'Reviews are planning guidance only and never grant execution.',
    lines.length > 0 ? 'items:' : 'items: none',
    ...lines,
  ].join('\n');
}

export function formatReadOnlyAdapterImplementationPlanReviewOutput(
  result: Record<string, unknown>,
  options: CodexExecJsonCliOptions = {},
): string {
  if (options.json) {
    return JSON.stringify(result, null, 2);
  }

  const review = result.reviewRecord as
    | {
        id?: string;
        outcome?: string;
        status?: string;
        reviewerLabel?: string;
        disabledSkeletonApproved?: boolean;
        hardGateCount?: number;
        requiresReviewCount?: number;
        unresolvedFindingCount?: number;
        implementationApproved?: boolean;
        processAdapterApproved?: boolean;
        recommendationGrantsExecution?: boolean;
        workspaceWriteAllowed?: boolean;
        dangerFullAccessAllowed?: boolean;
      }
    | undefined;

  return [
    'Read-only adapter implementation plan review',
    `reviewId: ${review?.id ?? 'unknown'}`,
    `outcome: ${review?.outcome ?? 'unknown'} (governance guidance only)`,
    `status: ${review?.status ?? 'unknown'}`,
    `reviewer: ${review?.reviewerLabel ?? 'unknown'}`,
    `disabledSkeletonApproved=${String(review?.disabledSkeletonApproved ?? false)}`,
    `hardGates: ${review?.hardGateCount ?? 0}`,
    `requiresReview: ${review?.requiresReviewCount ?? 0}`,
    `unresolvedFindings: ${review?.unresolvedFindingCount ?? 0}`,
    `implementationApproved=${String(review?.implementationApproved ?? false)}`,
    `processAdapterApproved=${String(review?.processAdapterApproved ?? false)}`,
    `recommendationGrantsExecution=${String(review?.recommendationGrantsExecution ?? false)}`,
    `workspaceWriteAllowed=${String(review?.workspaceWriteAllowed ?? false)}`,
    `dangerFullAccessAllowed=${String(review?.dangerFullAccessAllowed ?? false)}`,
    'Conditional skeleton approval only allows Round 3T disabled defaults; it does not approve process adapter work or execution.',
    noLiveFlagsText(result),
  ].join('\n');
}

export function formatReadOnlyAdapterImplementationPlanReviewListOutput(
  result: Record<string, unknown>,
  options: CodexExecReadOnlyAdapterImplementationPlanReviewListCliOptions = {},
): string {
  if (options.json) {
    return JSON.stringify(result, null, 2);
  }

  const reviews = result.reviews as
    | Array<{
        reviewId?: string;
        status?: string;
        outcome?: string;
        disabledSkeletonApproved?: boolean;
        hardGateCount?: number;
        requiresReviewCount?: number;
        implementationApproved?: boolean;
        processAdapterApproved?: boolean;
        recommendationGrantsExecution?: boolean;
      }>
    | undefined;
  const lines = (reviews ?? [])
    .slice(0, 8)
    .map(
      (review) =>
        `- ${review.reviewId ?? 'unknown'} ${review.status ?? 'unknown'} ${
          review.outcome ?? 'unknown'
        } disabledSkeletonApproved=${String(
          review.disabledSkeletonApproved ?? false,
        )} hardGates=${review.hardGateCount ?? 0} requiresReview=${
          review.requiresReviewCount ?? 0
        } implementationApproved=${String(
          review.implementationApproved ?? false,
        )} processAdapterApproved=${String(
          review.processAdapterApproved ?? false,
        )} recommendationGrantsExecution=${String(review.recommendationGrantsExecution ?? false)}`,
    );

  return [
    'Read-only adapter implementation plan review list',
    `count: ${reviews?.length ?? 0}`,
    noLiveFlagsText(result),
    'Reviews are governance records only and never grant execution.',
    lines.length > 0 ? 'items:' : 'items: none',
    ...lines,
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

function createAdrDecisionQueryString(options: CodexExecAdrDecisionListCliOptions): string {
  const params = new URLSearchParams();

  if (options.dryRun) {
    params.set('dryRunId', options.dryRun);
  }

  if (options.status) {
    params.set('status', normalizeAdrDecisionStatus(options.status));
  }

  if (options.decision) {
    params.set('decision', normalizeAdrDecisionOutcome(options.decision));
  }

  const queryString = params.toString();
  return queryString ? `?${queryString}` : '';
}

function createReadOnlyAdapterSimulatorReviewQueryString(
  options: CodexExecReadOnlyAdapterSimulatorReviewListCliOptions,
): string {
  const params = new URLSearchParams();

  if (options.dryRun) {
    params.set('dryRunId', options.dryRun);
  }

  if (options.status) {
    params.set('status', normalizeReadOnlyAdapterSimulatorReviewStatus(options.status));
  }

  if (options.outcome) {
    params.set('outcome', normalizeReadOnlyAdapterSimulatorReviewOutcome(options.outcome));
  }

  const queryString = params.toString();
  return queryString ? `?${queryString}` : '';
}

function createReadOnlyAdapterImplementationPlanReviewQueryString(
  options: CodexExecReadOnlyAdapterImplementationPlanReviewListCliOptions,
): string {
  const params = new URLSearchParams();

  if (options.status) {
    params.set('status', normalizeReadOnlyAdapterImplementationPlanReviewStatus(options.status));
  }

  if (options.outcome) {
    params.set('outcome', normalizeReadOnlyAdapterImplementationPlanReviewOutcome(options.outcome));
  }

  const queryString = params.toString();
  return queryString ? `?${queryString}` : '';
}

function createReadOnlyAdapterSkeletonReviewQueryString(
  options: CodexExecReadOnlyAdapterSkeletonReviewListCliOptions,
): string {
  const params = new URLSearchParams();

  if (options.status) {
    params.set('status', normalizeReadOnlyAdapterSkeletonReviewStatus(options.status));
  }

  if (options.outcome) {
    params.set('outcome', normalizeReadOnlyAdapterSkeletonReviewOutcome(options.outcome));
  }

  const queryString = params.toString();
  return queryString ? `?${queryString}` : '';
}

function createReadOnlyAdapterFinalReadinessQueryString(
  options: CodexExecReadOnlyAdapterFinalReadinessListCliOptions,
): string {
  const params = new URLSearchParams();

  if (options.status) {
    params.set('status', normalizeReadOnlyAdapterFinalReadinessStatus(options.status));
  }

  if (options.outcome) {
    params.set('outcome', normalizeReadOnlyAdapterFinalReadinessOutcome(options.outcome));
  }

  const queryString = params.toString();
  return queryString ? `?${queryString}` : '';
}

function createRealReadOnlyAdapterReadinessQueryString(
  options: CodexExecRealReadOnlyAdapterReadinessListCliOptions,
): string {
  const params = new URLSearchParams();

  if (options.dryRun) {
    params.set('dryRunId', options.dryRun);
  }

  if (options.status) {
    params.set('status', normalizeRealReadOnlyAdapterReadinessStatus(options.status));
  }

  const queryString = params.toString();
  return queryString ? `?${queryString}` : '';
}

function createRealReadOnlyAdapterReadinessReviewQueryString(
  options: CodexExecRealReadOnlyAdapterReadinessReviewListCliOptions,
): string {
  const params = new URLSearchParams();

  if (options.packageId) {
    params.set('packageId', options.packageId);
  }

  if (options.dryRun) {
    params.set('dryRunId', options.dryRun);
  }

  if (options.status) {
    params.set('status', normalizeRealReadOnlyAdapterReadinessReviewStatus(options.status));
  }

  if (options.outcome) {
    params.set('outcome', normalizeRealReadOnlyAdapterReadinessReviewOutcome(options.outcome));
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

function createAdrDecisionQueryFromCliOptions(
  options: CodexExecAdrDecisionListCliOptions,
  fallbackDryRunId: string,
): Partial<CodexExecLiveAdapterAdrDecisionQuery> {
  return {
    dryRunId: options.dryRun ?? fallbackDryRunId,
    status: options.status ? normalizeAdrDecisionStatus(options.status) : undefined,
    decision: options.decision ? normalizeAdrDecisionOutcome(options.decision) : undefined,
    limit: 20,
  };
}

function createReadOnlyAdapterSimulatorReviewQueryFromCliOptions(
  options: CodexExecReadOnlyAdapterSimulatorReviewListCliOptions,
  fallbackDryRunId: string,
): Partial<CodexExecReadOnlyAdapterSimulatorReviewQuery> {
  return {
    dryRunId: options.dryRun ?? fallbackDryRunId,
    status: options.status
      ? normalizeReadOnlyAdapterSimulatorReviewStatus(options.status)
      : undefined,
    outcome: options.outcome
      ? normalizeReadOnlyAdapterSimulatorReviewOutcome(options.outcome)
      : undefined,
    limit: 20,
  };
}

function createReadOnlyAdapterImplementationPlanReviewQueryFromCliOptions(
  options: CodexExecReadOnlyAdapterImplementationPlanReviewListCliOptions,
): Partial<CodexExecReadOnlyAdapterImplementationPlanReviewQuery> {
  return {
    status: options.status
      ? normalizeReadOnlyAdapterImplementationPlanReviewStatus(options.status)
      : undefined,
    outcome: options.outcome
      ? normalizeReadOnlyAdapterImplementationPlanReviewOutcome(options.outcome)
      : undefined,
    limit: 20,
  };
}

function createReadOnlyAdapterSkeletonReviewQueryFromCliOptions(
  options: CodexExecReadOnlyAdapterSkeletonReviewListCliOptions,
): Partial<CodexExecReadOnlyAdapterSkeletonReviewQuery> {
  return {
    status: options.status
      ? normalizeReadOnlyAdapterSkeletonReviewStatus(options.status)
      : undefined,
    outcome: options.outcome
      ? normalizeReadOnlyAdapterSkeletonReviewOutcome(options.outcome)
      : undefined,
    limit: 20,
  };
}

function createReadOnlyAdapterFinalReadinessQueryFromCliOptions(
  options: CodexExecReadOnlyAdapterFinalReadinessListCliOptions,
): Partial<CodexExecReadOnlyAdapterFinalReadinessQuery> {
  return {
    status: options.status
      ? normalizeReadOnlyAdapterFinalReadinessStatus(options.status)
      : undefined,
    outcome: options.outcome
      ? normalizeReadOnlyAdapterFinalReadinessOutcome(options.outcome)
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

function normalizeAdrDecisionStatus(
  status: string | undefined,
): CodexExecLiveAdapterAdrDecisionStatus {
  const normalized = status ?? 'recorded';

  if (normalized === 'draft' || normalized === 'recorded' || normalized === 'superseded') {
    return normalized;
  }

  throw new Error('ADR decision status is unsupported');
}

function normalizeAdrDecisionOutcome(
  decision: string | undefined,
): CodexExecLiveAdapterAdrDecisionOutcome {
  const normalized = decision ?? 'conditional_read_only_go';

  if (normalized === 'no_go' || normalized === 'conditional_read_only_go') {
    return normalized;
  }

  throw new Error('ADR decision outcome is unsupported');
}

function normalizeReadOnlyAdapterSimulatorReviewStatus(
  status: string | undefined,
): CodexExecReadOnlyAdapterSimulatorReviewStatus {
  const normalized = status ?? 'recorded';

  if (normalized === 'draft' || normalized === 'recorded' || normalized === 'superseded') {
    return normalized;
  }

  throw new Error('simulator review status is unsupported');
}

function normalizeReadOnlyAdapterSimulatorReviewOutcome(
  outcome: string | undefined,
): CodexExecReadOnlyAdapterSimulatorReviewOutcome {
  const normalized = outcome ?? 'go_to_implementation_planning';

  if (normalized === 'no_go' || normalized === 'go_to_implementation_planning') {
    return normalized;
  }

  throw new Error('simulator review outcome is unsupported');
}

function normalizeReadOnlyAdapterImplementationPlanReviewStatus(
  status: string | undefined,
): CodexExecReadOnlyAdapterImplementationPlanReviewStatus {
  const normalized = status ?? 'recorded';

  if (normalized === 'draft' || normalized === 'recorded' || normalized === 'superseded') {
    return normalized;
  }

  throw new Error('implementation plan review status is unsupported');
}

function normalizeReadOnlyAdapterImplementationPlanReviewOutcome(
  outcome: string | undefined,
): CodexExecReadOnlyAdapterImplementationPlanReviewOutcome {
  if (outcome === 'no_go' || outcome === 'conditional_go_to_disabled_skeleton') {
    return outcome;
  }

  throw new Error('implementation plan review outcome is required and must be supported');
}

function normalizeReadOnlyAdapterSkeletonReviewOutcome(
  outcome: string | undefined,
): CodexExecReadOnlyAdapterSkeletonReviewOutcome {
  const normalized = outcome ?? 'skeleton_accepted_for_fixture_boundary_only';

  if (normalized === 'no_go' || normalized === 'skeleton_accepted_for_fixture_boundary_only') {
    return normalized;
  }

  throw new Error('skeleton review outcome is unsupported');
}

function normalizeReadOnlyAdapterSkeletonReviewStatus(
  status: string | undefined,
): CodexExecReadOnlyAdapterSkeletonReviewStatus {
  const normalized = status ?? 'recorded';

  if (normalized === 'draft' || normalized === 'recorded' || normalized === 'superseded') {
    return normalized;
  }

  throw new Error('skeleton review status is unsupported');
}

function normalizeReadOnlyAdapterFinalReadinessOutcome(
  outcome: string | undefined,
): CodexExecReadOnlyAdapterFinalReadinessOutcome {
  const normalized = outcome ?? 'ready_for_separate_read_only_adapter_adr';

  if (
    normalized === 'no_go' ||
    normalized === 'ready_for_separate_read_only_adapter_adr' ||
    normalized === 'ready_for_separate_disabled_skeleton_followup'
  ) {
    return normalized;
  }

  throw new Error('final readiness outcome is unsupported');
}

function normalizeReadOnlyAdapterFinalReadinessStatus(
  status: string | undefined,
): CodexExecReadOnlyAdapterFinalReadinessStatus {
  const normalized = status ?? 'recorded';

  if (normalized === 'draft' || normalized === 'recorded' || normalized === 'superseded') {
    return normalized;
  }

  throw new Error('final readiness status is unsupported');
}

function normalizeRealReadOnlyAdapterReadinessStatus(
  status: string | undefined,
): CodexExecRealReadOnlyAdapterReadinessStatus {
  const normalized = status ?? 'requires_review';

  if (
    normalized === 'not_ready' ||
    normalized === 'ready_for_separate_adr' ||
    normalized === 'blocked' ||
    normalized === 'requires_review'
  ) {
    return normalized;
  }

  throw new Error('real read-only adapter readiness status is unsupported');
}

function normalizeRealReadOnlyAdapterReadinessReviewOutcome(
  outcome: string | undefined,
): CodexExecRealReadOnlyAdapterReadinessReviewOutcome {
  const normalized = outcome ?? 'no_go_to_separate_adr_draft';

  if (
    normalized === 'no_go_to_separate_adr_draft' ||
    normalized === 'conditional_go_to_separate_adr_draft'
  ) {
    return normalized;
  }

  throw new Error('real read-only adapter readiness review outcome is unsupported');
}

function normalizeRealReadOnlyAdapterReadinessReviewStatus(
  status: string | undefined,
): CodexExecRealReadOnlyAdapterReadinessReviewStatus {
  const normalized = status ?? 'recorded';

  if (normalized === 'draft' || normalized === 'recorded' || normalized === 'superseded') {
    return normalized;
  }

  throw new Error('real read-only adapter readiness review status is unsupported');
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

function createAdrDecisionResponse(
  decisionRecord: CodexExecLiveAdapterAdrDecisionRecord,
  degraded: boolean,
): Record<string, unknown> {
  const evidenceRefs = decisionRecord.evidenceRefs;
  const auditEvents = createCodexExecLiveAdapterAdrDecisionAuditEvents(
    decisionRecord,
    evidenceRefs,
  );
  const responseRecord = {
    ...decisionRecord,
    auditEventIds: auditEvents.map((event) => event.id),
  };

  return {
    decisionRecord: responseRecord,
    summary: summarizeCodexExecLiveAdapterAdrDecision(responseRecord),
    evidenceRefs,
    auditEvents,
    implementationApproved: false,
    processAdapterApproved: false,
    recommendationGrantsExecution: false,
    liveExecution: false,
    externalProcessStarted: false,
    executionDisabled: true,
    degraded,
    reason: degraded
      ? 'supervisor unavailable; local ADR decision fallback used and was not persisted'
      : undefined,
  };
}

function createReadOnlyAdapterSimulatorReviewResponse(
  reviewRecord: CodexExecReadOnlyAdapterSimulatorReviewDecisionRecord,
  degraded: boolean,
): Record<string, unknown> {
  const evidenceRefs = reviewRecord.evidenceRefs;
  const auditEvents = createReadOnlyAdapterSimulatorReviewAuditEvents(reviewRecord, evidenceRefs);
  const responseRecord = {
    ...reviewRecord,
    auditEventIds: auditEvents.map((event) => event.id),
  };

  return {
    reviewRecord: responseRecord,
    summary: summarizeReadOnlyAdapterSimulatorReview(responseRecord),
    evidenceRefs,
    auditEvents,
    liveExecution: false,
    externalProcessStarted: false,
    executionDisabled: true,
    processAdapterStarted: false,
    implementationApproved: false,
    processAdapterApproved: false,
    dashboardTriggerAllowed: false,
    recommendationGrantsExecution: false,
    degraded,
    reason: degraded
      ? 'supervisor unavailable; local simulator review fallback used and was not persisted'
      : undefined,
  };
}

function createReadOnlyAdapterImplementationPlanReviewResponse(
  reviewRecord: CodexExecReadOnlyAdapterImplementationPlanReviewDecisionRecord,
  degraded: boolean,
): Record<string, unknown> {
  const evidenceRefs = reviewRecord.evidenceRefs;
  const auditEvents = createReadOnlyAdapterImplementationPlanReviewAuditEvents(
    reviewRecord,
    evidenceRefs,
  );
  const responseRecord = {
    ...reviewRecord,
    auditEventIds: auditEvents.map((event) => event.id),
  };

  return {
    reviewRecord: responseRecord,
    summary: summarizeReadOnlyAdapterImplementationPlanReview(responseRecord),
    evidenceRefs,
    auditEvents,
    liveExecution: false,
    externalProcessStarted: false,
    executionDisabled: true,
    processAdapterStarted: false,
    implementationApproved: false,
    processAdapterApproved: false,
    dashboardTriggerAllowed: false,
    recommendationGrantsExecution: false,
    workspaceWriteAllowed: false,
    dangerFullAccessAllowed: false,
    degraded,
    reason: degraded
      ? 'supervisor unavailable; local implementation plan review fallback used and was not persisted'
      : undefined,
  };
}

function createReadOnlyAdapterSkeletonReviewResponse(
  reviewRecord: CodexExecReadOnlyAdapterSkeletonReviewDecisionRecord,
  degraded: boolean,
): Record<string, unknown> {
  const evidenceRefs = reviewRecord.evidenceRefs;
  const auditEvents = createReadOnlyAdapterSkeletonReviewAuditEvents(reviewRecord, evidenceRefs);
  const responseRecord = {
    ...reviewRecord,
    auditEventIds: auditEvents.map((event) => event.id),
  };

  return {
    reviewRecord: responseRecord,
    summary: summarizeReadOnlyAdapterSkeletonReview(responseRecord),
    evidenceRefs,
    auditEvents,
    liveExecution: false,
    externalProcessStarted: false,
    executionDisabled: true,
    processAdapterStarted: false,
    implementationApproved: false,
    processAdapterApproved: false,
    dashboardTriggerAllowed: false,
    recommendationGrantsExecution: false,
    workspaceWriteAllowed: false,
    dangerFullAccessAllowed: false,
    degraded,
    reason: degraded
      ? 'supervisor unavailable; local skeleton review fallback used and was not persisted'
      : undefined,
  };
}

function createReadOnlyAdapterFinalReadinessResponse(
  decisionRecord: CodexExecReadOnlyAdapterFinalReadinessDecisionRecord,
  degraded: boolean,
): Record<string, unknown> {
  const evidenceRefs = decisionRecord.evidenceRefs;
  const auditEvents = createReadOnlyAdapterFinalReadinessAuditEvents(decisionRecord, evidenceRefs);
  const responseRecord = {
    ...decisionRecord,
    auditEventIds: auditEvents.map((event) => event.id),
  };

  return {
    decisionRecord: responseRecord,
    summary: summarizeReadOnlyAdapterFinalReadiness(responseRecord),
    evidenceRefs,
    auditEvents,
    liveExecution: false,
    externalProcessStarted: false,
    executionDisabled: true,
    processAdapterStarted: false,
    implementationApproved: false,
    processAdapterApproved: false,
    dashboardTriggerAllowed: false,
    recommendationGrantsExecution: false,
    workspaceWriteAllowed: false,
    dangerFullAccessAllowed: false,
    degraded,
    reason: degraded
      ? 'supervisor unavailable; local final readiness fallback used and was not persisted'
      : undefined,
  };
}

function createRealReadOnlyAdapterReadinessFallback(dryRunId: string): Record<string, unknown> {
  const packageRecord = buildRealReadOnlyAdapterReadinessPackage({
    dryRunId,
    documentedArtifactRefs: ['docs/reviews/round-3tw-additional-rules-audit.md'],
    symlinkEscapeVerified: false,
    evidenceStoreReady: true,
    auditStoreReady: true,
    operatorChecklistComplete: false,
    metadata: { cliFallback: true, persisted: false },
  });

  return {
    package: packageRecord,
    summary: summarizeRealReadOnlyAdapterReadinessPackage(packageRecord),
    recommendation: REAL_READ_ONLY_ADAPTER_READINESS_RECOMMENDATION,
    liveExecution: false,
    externalProcessStarted: false,
    executionDisabled: true,
    processAdapterStarted: false,
    implementationApproved: false,
    processAdapterApproved: false,
    recommendationGrantsExecution: false,
    workspaceWriteAllowed: false,
    dangerFullAccessAllowed: false,
    dashboardTriggerAllowed: false,
    degraded: true,
    notPersisted: true,
    reason: 'supervisor unavailable; local readiness fallback used and was not persisted',
  };
}

function createRealReadOnlyAdapterAttemptRefusal(
  dryRunId: string,
  options: CodexExecRealReadOnlyAdapterAttemptCliOptions,
): Record<string, unknown> {
  const config = createDefaultRealReadOnlyAdapterConfig({
    cliAttempt: true,
    supervisorFallbackRefused: true,
  });
  const request = createRealReadOnlyAdapterRequest({
    dryRunId,
    config,
    approvalArtifactId: options.approval,
    metadata: {
      approvalArtifactIdProvided: options.approval !== undefined,
      worktreePathProvided: options.worktree !== undefined,
      worktreePathStored: false,
    },
  });
  const preflight = createRealReadOnlyAdapterGuardPreflight({
    dryRunId,
    request,
    config,
    requestedSandboxMode: 'read_only',
    triggerKind: 'cli',
    worktree: {
      isolated: options.worktree !== undefined,
      status: options.worktree !== undefined ? 'unknown' : 'missing',
      pathHash: options.worktree !== undefined ? 'provided_not_stored' : undefined,
    },
    evidenceStoreReady: false,
    auditStoreReady: false,
    metadata: {
      cliAttempt: true,
      supervisorFallbackRefused: true,
      worktreePathStored: false,
    },
  });
  const attempt = {
    id: `codex_real_read_only_adapter_attempt_${request.id}`,
    dryRunId,
    requestId: request.id,
    preflightId: preflight.id,
    status: 'blocked',
    processBoundaryInvoked: false,
    summary:
      'CLI-only adapter attempt stopped before process boundary planning; authoritative supervisor attempt endpoint is unavailable and local fallback is refused.',
    errorCode: config.configuredEnabled ? 'preflight_failed' : 'config_disabled',
    liveExecution: false,
    externalProcessStarted: false,
    executionDisabled: true,
    processAdapterStarted: false,
    implementationApproved: false,
    processAdapterApproved: false,
    recommendationGrantsExecution: false,
    workspaceWriteAllowed: false,
    dangerFullAccessAllowed: false,
    dashboardTriggerAllowed: false,
    metadataOnly: true,
    bodyStored: false,
    promptBodyStored: false,
    commandBodyStored: false,
    stdoutBodyStored: false,
    stderrBodyStored: false,
    argvStored: false,
    executablePathStored: false,
    shellSnippetStored: false,
    envPlanStored: false,
  };

  return {
    attempt,
    request,
    preflight,
    status: 'blocked',
    recommendation:
      'CLI attempt is blocked before any process boundary. This does not grant implementation, process launch, Codex run, or workspace mutation permission.',
    liveExecution: false,
    externalProcessStarted: false,
    executionDisabled: true,
    processAdapterStarted: false,
    implementationApproved: false,
    processAdapterApproved: false,
    recommendationGrantsExecution: false,
    workspaceWriteAllowed: false,
    dangerFullAccessAllowed: false,
    dashboardTriggerAllowed: false,
    degraded: false,
    notPersisted: true,
    fallbackRefused: true,
    reason:
      'supervisor attempt endpoint unavailable or rejected; CLI local fallback cannot create an actual adapter attempt',
  };
}

function createReadinessReviewUnavailableResponse(reason: string): Record<string, unknown> {
  return {
    error: 'readiness review is unavailable',
    reviews: [],
    summaries: [],
    recommendation: REAL_READ_ONLY_ADAPTER_READINESS_REVIEW_RECOMMENDATION,
    liveExecution: false,
    externalProcessStarted: false,
    executionDisabled: true,
    processAdapterStarted: false,
    implementationApproved: false,
    processAdapterApproved: false,
    recommendationGrantsExecution: false,
    workspaceWriteAllowed: false,
    dangerFullAccessAllowed: false,
    dashboardTriggerAllowed: false,
    degraded: true,
    notPersisted: true,
    reason,
  };
}

function createLocalLiveAdapterAdrDecisionRecord(
  dryRunId: string,
  options: {
    reviewer?: string;
    rationaleSummary?: string;
    decision?: CodexExecLiveAdapterAdrDecisionOutcome;
    status?: CodexExecLiveAdapterAdrDecisionStatus;
  } = {},
): CodexExecLiveAdapterAdrDecisionRecord {
  const draftRecord = createCodexExecLiveAdapterAdrDecisionRecord({
    dryRunId,
    reviewerLabel: options.reviewer ?? 'cli-fallback',
    rationaleSummary:
      options.rationaleSummary ??
      'Conditional read-only design may continue; implementation remains unapproved.',
    decision: options.decision,
    status: options.status,
    metadata: { cliFallback: true, persisted: false },
  });
  const evidenceRefs = createCodexExecLiveAdapterAdrDecisionEvidenceRefs(draftRecord);
  const auditEvents = createCodexExecLiveAdapterAdrDecisionAuditEvents(draftRecord, evidenceRefs);

  return {
    ...draftRecord,
    evidenceRefs,
    auditEventIds: auditEvents.map((event) => event.id),
  };
}

function createLocalLiveAdapterAdrDecisionRecords(
  dryRunId: string,
): CodexExecLiveAdapterAdrDecisionRecord[] {
  const older = createLocalLiveAdapterAdrDecisionRecord(dryRunId, {
    reviewer: 'cli-fallback-initial',
    decision: 'no_go',
    status: 'superseded',
    rationaleSummary: 'Initial local fallback decision kept implementation blocked.',
  });
  const latest = createLocalLiveAdapterAdrDecisionRecord(dryRunId, {
    reviewer: 'cli-fallback-latest',
    decision: 'conditional_read_only_go',
    status: 'recorded',
    rationaleSummary:
      'Latest local fallback decision allows future read-only design only; implementation remains unapproved.',
  });

  return [
    {
      ...latest,
      id: 'codex_live_adapter_adr_decision_cli_latest',
      createdAt: '2026-04-28T04:00:00.000Z',
      recordedAt: '2026-04-28T04:00:00.000Z',
    },
    {
      ...older,
      id: 'codex_live_adapter_adr_decision_cli_older',
      createdAt: '2026-04-28T03:00:00.000Z',
      recordedAt: '2026-04-28T03:00:00.000Z',
    },
  ];
}

async function createLocalReadOnlyAdapterSimulatorReviewRecord(
  dryRunId: string,
  options: {
    reviewer?: string;
    outcome?: CodexExecReadOnlyAdapterSimulatorReviewOutcome;
    status?: CodexExecReadOnlyAdapterSimulatorReviewStatus;
    rationaleSummary?: string;
  } = {},
): Promise<CodexExecReadOnlyAdapterSimulatorReviewDecisionRecord> {
  const simulationResult = await createLocalReadOnlyAdapterSimulationResult(dryRunId);
  const draftRecord = createReadOnlyAdapterSimulatorReviewDecisionRecord({
    simulationResult,
    reviewerLabel: options.reviewer ?? 'cli-fallback',
    outcome: options.outcome,
    status: options.status,
    rationaleSummary:
      options.rationaleSummary ??
      'Simulator review permits Round 3R implementation planning only; implementation remains unapproved.',
    metadata: { cliFallback: true, persisted: false },
  });
  const evidenceRefs = createReadOnlyAdapterSimulatorReviewEvidenceRefs(draftRecord);
  const auditEvents = createReadOnlyAdapterSimulatorReviewAuditEvents(draftRecord, evidenceRefs);

  return {
    ...draftRecord,
    evidenceRefs,
    auditEventIds: auditEvents.map((event) => event.id),
  };
}

async function createLocalReadOnlyAdapterSimulatorReviewRecords(
  dryRunId: string,
): Promise<CodexExecReadOnlyAdapterSimulatorReviewDecisionRecord[]> {
  const older = await createLocalReadOnlyAdapterSimulatorReviewRecord(dryRunId, {
    reviewer: 'cli-fallback-initial',
    outcome: 'no_go',
    status: 'superseded',
    rationaleSummary: 'Initial local fallback simulator review kept implementation blocked.',
  });
  const latest = await createLocalReadOnlyAdapterSimulatorReviewRecord(dryRunId, {
    reviewer: 'cli-fallback-latest',
    outcome: 'go_to_implementation_planning',
    status: 'recorded',
    rationaleSummary:
      'Latest local fallback simulator review allows Round 3R planning only; implementation remains unapproved.',
  });

  return [
    {
      ...latest,
      id: 'codex_read_only_adapter_simulator_review_cli_latest',
      createdAt: '2026-04-28T05:00:00.000Z',
      reviewedAt: '2026-04-28T05:00:00.000Z',
    },
    {
      ...older,
      id: 'codex_read_only_adapter_simulator_review_cli_older',
      createdAt: '2026-04-28T04:00:00.000Z',
      reviewedAt: '2026-04-28T04:00:00.000Z',
    },
  ];
}

function createLocalReadOnlyAdapterImplementationPlanReviewRecord(options: {
  reviewer?: string;
  outcome: CodexExecReadOnlyAdapterImplementationPlanReviewOutcome;
  status?: CodexExecReadOnlyAdapterImplementationPlanReviewStatus;
  rationaleSummary?: string;
}): CodexExecReadOnlyAdapterImplementationPlanReviewDecisionRecord {
  const draftRecord = createReadOnlyAdapterImplementationPlanReviewDecisionRecord({
    reviewerLabel: options.reviewer ?? 'cli-fallback',
    outcome: options.outcome,
    status: options.status,
    rationaleSummary:
      options.rationaleSummary ??
      'Implementation plan review fallback records governance only; process adapter and execution remain unapproved.',
    metadata: { cliFallback: true, persisted: false },
  });
  const evidenceRefs = createReadOnlyAdapterImplementationPlanReviewEvidenceRefs(draftRecord);
  const auditEvents = createReadOnlyAdapterImplementationPlanReviewAuditEvents(
    draftRecord,
    evidenceRefs,
  );

  return {
    ...draftRecord,
    evidenceRefs,
    auditEventIds: auditEvents.map((event) => event.id),
  };
}

function createLocalReadOnlyAdapterImplementationPlanReviewRecords(): CodexExecReadOnlyAdapterImplementationPlanReviewDecisionRecord[] {
  const older = createLocalReadOnlyAdapterImplementationPlanReviewRecord({
    reviewer: 'cli-fallback-initial',
    outcome: 'no_go',
    status: 'superseded',
    rationaleSummary:
      'Initial local fallback implementation plan review kept skeleton work blocked.',
  });
  const latest = createLocalReadOnlyAdapterImplementationPlanReviewRecord({
    reviewer: 'cli-fallback-latest',
    outcome: 'conditional_go_to_disabled_skeleton',
    status: 'recorded',
    rationaleSummary:
      'Latest local fallback implementation plan review allows disabled skeleton only; process adapter remains unapproved.',
  });

  return [
    {
      ...latest,
      id: 'codex_read_only_adapter_implementation_plan_review_cli_latest',
      createdAt: '2026-04-28T06:00:00.000Z',
      reviewedAt: '2026-04-28T06:00:00.000Z',
    },
    {
      ...older,
      id: 'codex_read_only_adapter_implementation_plan_review_cli_older',
      createdAt: '2026-04-28T05:00:00.000Z',
      reviewedAt: '2026-04-28T05:00:00.000Z',
    },
  ];
}

function createLocalReadOnlyAdapterSkeletonReviewRecord(options: {
  reviewer?: string;
  outcome: CodexExecReadOnlyAdapterSkeletonReviewOutcome;
  status?: CodexExecReadOnlyAdapterSkeletonReviewStatus;
  rationaleSummary?: string;
}): CodexExecReadOnlyAdapterSkeletonReviewDecisionRecord {
  const preview = createReadOnlyAdapterSkeletonPreview({
    metadata: { cliFallback: true, persisted: false },
  });
  const draftRecord = createReadOnlyAdapterSkeletonReviewDecisionRecord({
    preview,
    reviewerLabel: options.reviewer ?? 'cli-fallback',
    outcome: options.outcome,
    status: options.status,
    rationaleSummary:
      options.rationaleSummary ??
      'Skeleton review fallback records disabled behavior only; execution remains unapproved.',
    metadata: { cliFallback: true, persisted: false },
  });
  const evidenceRefs = createReadOnlyAdapterSkeletonReviewEvidenceRefs(draftRecord);
  const auditEvents = createReadOnlyAdapterSkeletonReviewAuditEvents(draftRecord, evidenceRefs);

  return {
    ...draftRecord,
    evidenceRefs,
    auditEventIds: auditEvents.map((event) => event.id),
  };
}

function createLocalReadOnlyAdapterSkeletonReviewRecords(): CodexExecReadOnlyAdapterSkeletonReviewDecisionRecord[] {
  const latest = createLocalReadOnlyAdapterSkeletonReviewRecord({
    reviewer: 'cli-fallback-latest',
    outcome: 'skeleton_accepted_for_fixture_boundary_only',
    status: 'recorded',
    rationaleSummary:
      'Latest local fallback skeleton review allows fixture-backed replay boundary only; execution remains disabled.',
  });
  const older = createLocalReadOnlyAdapterSkeletonReviewRecord({
    reviewer: 'cli-fallback-initial',
    outcome: 'no_go',
    status: 'superseded',
    rationaleSummary: 'Initial local fallback skeleton review kept follow-up blocked.',
  });

  return [
    {
      ...latest,
      id: 'codex_read_only_adapter_skeleton_review_cli_latest',
      createdAt: '2026-04-29T06:00:00.000Z',
      reviewedAt: '2026-04-29T06:00:00.000Z',
    },
    {
      ...older,
      id: 'codex_read_only_adapter_skeleton_review_cli_older',
      createdAt: '2026-04-29T05:00:00.000Z',
      reviewedAt: '2026-04-29T05:00:00.000Z',
    },
  ];
}

async function createLocalReadOnlyAdapterFinalReadinessRecord(options: {
  reviewer?: string;
  outcome?: CodexExecReadOnlyAdapterFinalReadinessOutcome;
  status?: CodexExecReadOnlyAdapterFinalReadinessStatus;
  rationaleSummary?: string;
}): Promise<CodexExecReadOnlyAdapterFinalReadinessDecisionRecord> {
  const skeletonPreview = createReadOnlyAdapterSkeletonPreview({
    metadata: { cliFallback: true, persisted: false },
  });
  const skeletonReview = createLocalReadOnlyAdapterSkeletonReviewRecord({
    outcome: 'skeleton_accepted_for_fixture_boundary_only',
  });
  const fixtureText = await readAllowedFixture(
    'packages/codex-kernel/fixtures/codex-exec-basic.jsonl',
  );
  const fixtureBoundary = await runReadOnlyAdapterFixtureBoundary({
    fixturePath: 'packages/codex-kernel/fixtures/codex-exec-basic.jsonl',
    fixtureText,
    metadata: { cliFallback: true, persisted: false },
  });
  const draftRecord = createReadOnlyAdapterFinalReadinessDecisionRecord({
    skeletonPreview,
    skeletonReview,
    fixtureBoundary,
    outcome: options.outcome ?? 'ready_for_separate_read_only_adapter_adr',
    status: options.status,
    reviewerLabel: options.reviewer ?? 'cli-fallback',
    rationaleSummary:
      options.rationaleSummary ??
      'Final readiness fallback requires a separate ADR before any real read-only adapter can be considered.',
    metadata: { cliFallback: true, persisted: false },
  });
  const evidenceRefs = createReadOnlyAdapterFinalReadinessEvidenceRefs(draftRecord);
  const auditEvents = createReadOnlyAdapterFinalReadinessAuditEvents(draftRecord, evidenceRefs);

  return {
    ...draftRecord,
    evidenceRefs,
    auditEventIds: auditEvents.map((event) => event.id),
  };
}

async function createLocalReadOnlyAdapterSimulationResult(
  dryRunId: string,
): Promise<CodexExecReadOnlyAdapterPreflightSimulationResult> {
  const record = createLocalCodexExecControlPlaneRecord(dryRunId);
  const configLoadResult = await readLocalCodexExecConfig();
  const adrDecision = createLocalLiveAdapterAdrDecisionRecord(record.dryRunPlanId);

  return simulateReadOnlyAdapterPreflight({
    dryRunId: record.dryRunPlanId,
    record,
    config: configLoadResult.config,
    adrDecision,
    isolatedWorktreePresent: true,
    evidenceStoreReady: true,
    auditStoreReady: true,
    operatorChecklist: createDefaultReadOnlyAdapterOperatorChecklist().map((item) => ({
      ...item,
      checked: true,
    })),
    metadata: { requestedBy: 'cli-fallback', simulatorReviewFallback: true },
  });
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

export function formatReadOnlyAdapterGenericOutput(
  result: Record<string, unknown>,
  options: CodexExecJsonCliOptions = {},
): string {
  if (options.json) {
    return JSON.stringify(result, null, 2);
  }

  const summary =
    (result.summary as { summary?: string; status?: string } | undefined) ??
    (result.preview as { summary?: string; status?: string } | undefined) ??
    (result.result as { summary?: string; status?: string } | undefined);

  return [
    'Read-only adapter control-plane preview',
    `status: ${summary?.status ?? 'disabled'}`,
    `summary: ${summary?.summary ?? 'No live adapter execution is available.'}`,
    noLiveFlagsText(result),
  ].join('\n');
}

export function formatReadOnlyAdapterSkeletonReviewOutput(
  result: Record<string, unknown>,
  options: CodexExecJsonCliOptions = {},
): string {
  if (options.json) {
    return JSON.stringify(result, null, 2);
  }

  const review = result.reviewRecord as
    | {
        id?: string;
        outcome?: string;
        status?: string;
        fixtureBoundaryAllowed?: boolean;
        processAdapterApproved?: boolean;
        recommendationGrantsExecution?: boolean;
      }
    | undefined;

  return [
    'Read-only adapter skeleton review',
    `reviewId: ${review?.id ?? 'unknown'}`,
    `outcome: ${review?.outcome ?? 'unknown'} (non-executing)`,
    `status: ${review?.status ?? 'unknown'}`,
    `fixtureBoundaryAllowed=${String(review?.fixtureBoundaryAllowed ?? false)}`,
    `processAdapterApproved=${String(review?.processAdapterApproved ?? false)}`,
    `recommendationGrantsExecution=${String(review?.recommendationGrantsExecution ?? false)}`,
    noLiveFlagsText(result),
  ].join('\n');
}

export function formatReadOnlyAdapterSkeletonReviewListOutput(
  result: Record<string, unknown>,
  options: CodexExecReadOnlyAdapterSkeletonReviewListCliOptions = {},
): string {
  if (options.json) {
    return JSON.stringify(result, null, 2);
  }

  const reviews = result.reviews as
    | Array<{ reviewId?: string; outcome?: string; status?: string }>
    | undefined;
  const lines = (reviews ?? []).map(
    (review) =>
      `- ${review.reviewId ?? 'unknown'} ${review.status ?? 'unknown'} ${review.outcome ?? 'unknown'}`,
  );

  return [
    'Read-only adapter skeleton review list',
    `count: ${reviews?.length ?? 0}`,
    noLiveFlagsText(result),
    lines.length > 0 ? 'items:' : 'items: none',
    ...lines,
  ].join('\n');
}

export function formatReadOnlyAdapterFinalReadinessOutput(
  result: Record<string, unknown>,
  options: CodexExecJsonCliOptions = {},
): string {
  if (options.json) {
    return JSON.stringify(result, null, 2);
  }

  const decision = result.decisionRecord as
    | {
        id?: string;
        outcome?: string;
        status?: string;
        realAdapterRequiresSeparateAdr?: boolean;
        currentRoundApprovesProcessStart?: boolean;
        currentRoundApprovesCodexExecution?: boolean;
      }
    | undefined;

  return [
    'Read-only adapter final readiness review',
    `decisionId: ${decision?.id ?? 'unknown'}`,
    `outcome: ${decision?.outcome ?? 'unknown'} (separate ADR guidance only)`,
    `status: ${decision?.status ?? 'unknown'}`,
    `realAdapterRequiresSeparateAdr=${String(decision?.realAdapterRequiresSeparateAdr ?? true)}`,
    `currentRoundApprovesProcessStart=${String(decision?.currentRoundApprovesProcessStart ?? false)}`,
    `currentRoundApprovesCodexExecution=${String(decision?.currentRoundApprovesCodexExecution ?? false)}`,
    noLiveFlagsText(result),
  ].join('\n');
}

export function formatReadOnlyAdapterFinalReadinessListOutput(
  result: Record<string, unknown>,
  options: CodexExecReadOnlyAdapterFinalReadinessListCliOptions = {},
): string {
  if (options.json) {
    return JSON.stringify(result, null, 2);
  }

  const reviews = result.reviews as
    | Array<{ decisionId?: string; outcome?: string; status?: string }>
    | undefined;
  const lines = (reviews ?? []).map(
    (review) =>
      `- ${review.decisionId ?? 'unknown'} ${review.status ?? 'unknown'} ${review.outcome ?? 'unknown'}`,
  );

  return [
    'Read-only adapter final readiness list',
    `count: ${reviews?.length ?? 0}`,
    noLiveFlagsText(result),
    lines.length > 0 ? 'items:' : 'items: none',
    ...lines,
  ].join('\n');
}

export function formatRealReadOnlyAdapterAttemptOutput(
  result: Record<string, unknown>,
  options: CodexExecJsonCliOptions = {},
): string {
  if (options.json) {
    return JSON.stringify(result, null, 2);
  }

  const attempt = result.attempt as
    | {
        id?: string;
        dryRunId?: string;
        status?: string;
        processBoundaryInvoked?: boolean;
        implementationApproved?: boolean;
        processAdapterApproved?: boolean;
        recommendationGrantsExecution?: boolean;
        workspaceWriteAllowed?: boolean;
        dangerFullAccessAllowed?: boolean;
        dashboardTriggerAllowed?: boolean;
      }
    | undefined;
  const preflight = result.preflight as
    | {
        status?: string;
        blockerCount?: number;
        failedGateCount?: number;
        checks?: Array<{ code?: string; status?: string }>;
      }
    | undefined;
  const checkLines = (preflight?.checks ?? [])
    .filter((check) => check.status !== 'passed')
    .slice(0, 8)
    .map((check) => `- ${check.status ?? 'unknown'} ${check.code ?? 'unknown'}`);

  return [
    'Real read-only adapter CLI attempt',
    `attemptId: ${attempt?.id ?? 'unknown'}`,
    `dryRunId: ${attempt?.dryRunId ?? 'unknown'}`,
    `status: ${attempt?.status ?? result.status ?? 'blocked'}`,
    `preflightStatus: ${preflight?.status ?? 'unknown'}`,
    `failedGates=${String(preflight?.failedGateCount ?? 0)}`,
    `blockers=${String(preflight?.blockerCount ?? 0)}`,
    `processBoundaryInvoked=${String(attempt?.processBoundaryInvoked ?? false)}`,
    `implementationApproved=${String(attempt?.implementationApproved ?? false)}`,
    `processAdapterApproved=${String(attempt?.processAdapterApproved ?? false)}`,
    `recommendationGrantsExecution=${String(attempt?.recommendationGrantsExecution ?? false)}`,
    `workspaceWriteAllowed=${String(attempt?.workspaceWriteAllowed ?? false)}`,
    `dangerFullAccessAllowed=${String(attempt?.dangerFullAccessAllowed ?? false)}`,
    `dashboardTriggerAllowed=${String(attempt?.dashboardTriggerAllowed ?? false)}`,
    'CLI-only attempt status. Does not grant implementation, process launch, Codex run, or workspace mutation permission.',
    `degraded=${String(result.degraded ?? false)}`,
    `notPersisted=${String(result.notPersisted ?? true)}`,
    noLiveFlagsText(result),
    checkLines.length > 0 ? 'non-passing checks:' : 'non-passing checks: none',
    ...checkLines,
  ].join('\n');
}

export function formatRealReadOnlyAdapterReadinessOutput(
  result: Record<string, unknown>,
  options: CodexExecJsonCliOptions = {},
): string {
  if (options.json) {
    return JSON.stringify(result, null, 2);
  }

  const packageRecord = result.package as
    | {
        id?: string;
        dryRunId?: string;
        status?: string;
        hardGateCount?: number;
        passedGateCount?: number;
        requiresReviewCount?: number;
        blockerCount?: number;
        findingCount?: number;
        documentedOnly3twEvidence?: boolean;
        symlinkEscapeVerificationPending?: boolean;
        implementationApproved?: boolean;
        processAdapterApproved?: boolean;
        recommendationGrantsExecution?: boolean;
        blockers?: Array<{ code?: string; severity?: string }>;
        findings?: Array<{ code?: string; status?: string }>;
      }
    | undefined;
  const blockerLines = (packageRecord?.blockers ?? [])
    .slice(0, 5)
    .map((blocker) => `- ${blocker.severity ?? 'unknown'} ${blocker.code ?? 'unknown'}`);
  const findingLines = (packageRecord?.findings ?? [])
    .slice(0, 5)
    .map((finding) => `- ${finding.status ?? 'unknown'} ${finding.code ?? 'unknown'}`);

  return [
    'Real read-only adapter readiness package',
    `packageId: ${packageRecord?.id ?? 'unknown'}`,
    `dryRunId: ${packageRecord?.dryRunId ?? 'unknown'}`,
    `status: ${packageRecord?.status ?? 'unknown'}`,
    `gates: ${packageRecord?.passedGateCount ?? 0}/${packageRecord?.hardGateCount ?? 0} hard gates passed, requiresReview=${packageRecord?.requiresReviewCount ?? 0}`,
    `blockers: ${packageRecord?.blockerCount ?? 0}`,
    `findings: ${packageRecord?.findingCount ?? 0}`,
    `documentedOnly3twEvidence=${String(packageRecord?.documentedOnly3twEvidence ?? false)}`,
    `symlinkEscapeVerificationPending=${String(
      packageRecord?.symlinkEscapeVerificationPending ?? true,
    )}`,
    `implementationApproved=${String(packageRecord?.implementationApproved ?? false)}`,
    `processAdapterApproved=${String(packageRecord?.processAdapterApproved ?? false)}`,
    `recommendationGrantsExecution=${String(
      packageRecord?.recommendationGrantsExecution ?? false,
    )}`,
    REAL_READ_ONLY_ADAPTER_READINESS_RECOMMENDATION,
    `degraded=${String(result.degraded ?? false)}`,
    `notPersisted=${String(result.notPersisted ?? false)}`,
    noLiveFlagsText(result),
    blockerLines.length > 0 ? 'blockers:' : 'blockers: none',
    ...blockerLines,
    findingLines.length > 0 ? 'findings:' : 'findings: none',
    ...findingLines,
  ].join('\n');
}

export function formatRealReadOnlyAdapterReadinessListOutput(
  result: Record<string, unknown>,
  options: CodexExecRealReadOnlyAdapterReadinessListCliOptions = {},
): string {
  if (options.json) {
    return JSON.stringify(result, null, 2);
  }

  const summaries = result.summaries as
    | Array<{
        packageId?: string;
        dryRunId?: string;
        status?: string;
        blockerCount?: number;
        findingCount?: number;
        implementationApproved?: boolean;
        processAdapterApproved?: boolean;
        recommendationGrantsExecution?: boolean;
      }>
    | undefined;
  const lines = (summaries ?? []).map(
    (summary) =>
      `- ${summary.packageId ?? 'unknown'} ${summary.dryRunId ?? 'unknown'} ${
        summary.status ?? 'unknown'
      } blockers=${summary.blockerCount ?? 0} findings=${
        summary.findingCount ?? 0
      } implementationApproved=${String(
        summary.implementationApproved ?? false,
      )} processAdapterApproved=${String(
        summary.processAdapterApproved ?? false,
      )} recommendationGrantsExecution=${String(summary.recommendationGrantsExecution ?? false)}`,
  );

  return [
    'Real read-only adapter readiness package list',
    `count: ${summaries?.length ?? 0}`,
    REAL_READ_ONLY_ADAPTER_READINESS_RECOMMENDATION,
    noLiveFlagsText(result),
    lines.length > 0 ? 'items:' : 'items: none',
    ...lines,
  ].join('\n');
}

export function formatRealReadOnlyAdapterReadinessReviewOutput(
  result: Record<string, unknown>,
  options: CodexExecJsonCliOptions = {},
): string {
  if (options.json) {
    return JSON.stringify(result, null, 2);
  }

  const review = result.reviewRecord as
    | CodexExecRealReadOnlyAdapterReadinessReviewDecisionRecord
    | undefined;
  const summary = result.summary as
    | {
        reviewId?: string;
        packageId?: string;
        dryRunId?: string;
        packageStatus?: string;
        outcome?: string;
        separateAdrDraftAllowed?: boolean;
        unresolvedFindingCount?: number;
      }
    | undefined;

  return [
    'Real read-only adapter readiness review',
    `reviewId: ${review?.id ?? summary?.reviewId ?? 'unknown'}`,
    `packageId: ${review?.packageId ?? summary?.packageId ?? 'unknown'}`,
    `dryRunId: ${review?.dryRunId ?? summary?.dryRunId ?? 'unknown'}`,
    `packageStatus: ${review?.packageStatus ?? summary?.packageStatus ?? 'unknown'}`,
    `outcome: ${review?.outcome ?? summary?.outcome ?? 'unknown'}`,
    `separateAdrDraftAllowed=${String(
      review?.separateAdrDraftAllowed ?? summary?.separateAdrDraftAllowed ?? false,
    )}`,
    `unresolvedFindingCount=${String(
      review?.unresolvedFindingCount ?? summary?.unresolvedFindingCount ?? 0,
    )}`,
    REAL_READ_ONLY_ADAPTER_READINESS_REVIEW_RECOMMENDATION,
    `implementationApproved=${String(review?.implementationApproved ?? false)}`,
    `processAdapterApproved=${String(review?.processAdapterApproved ?? false)}`,
    `recommendationGrantsExecution=${String(review?.recommendationGrantsExecution ?? false)}`,
    `degraded=${String(result.degraded ?? false)}`,
    `notPersisted=${String(result.notPersisted ?? false)}`,
    noLiveFlagsText(result),
  ].join('\n');
}

export function formatRealReadOnlyAdapterReadinessReviewListOutput(
  result: Record<string, unknown>,
  options: CodexExecRealReadOnlyAdapterReadinessReviewListCliOptions = {},
): string {
  if (options.json) {
    return JSON.stringify(result, null, 2);
  }

  const summaries = result.summaries as
    | Array<{
        reviewId?: string;
        packageId?: string;
        dryRunId?: string;
        packageStatus?: string;
        outcome?: string;
        separateAdrDraftAllowed?: boolean;
      }>
    | undefined;
  const lines = (summaries ?? []).map(
    (summary) =>
      `- ${summary.reviewId ?? 'unknown'} package=${summary.packageId ?? 'unknown'} dryRun=${summary.dryRunId ?? 'unknown'} packageStatus=${summary.packageStatus ?? 'unknown'} outcome=${summary.outcome ?? 'unknown'} separateAdrDraftAllowed=${String(summary.separateAdrDraftAllowed ?? false)}`,
  );

  return [
    'Real read-only adapter readiness review list',
    `count: ${summaries?.length ?? 0}`,
    REAL_READ_ONLY_ADAPTER_READINESS_REVIEW_RECOMMENDATION,
    `implementationApproved=${String(result.implementationApproved ?? false)}`,
    `processAdapterApproved=${String(result.processAdapterApproved ?? false)}`,
    `recommendationGrantsExecution=${String(result.recommendationGrantsExecution ?? false)}`,
    `degraded=${String(result.degraded ?? false)}`,
    `notPersisted=${String(result.notPersisted ?? false)}`,
    noLiveFlagsText(result),
    lines.length > 0 ? 'items:' : 'items: none',
    ...lines,
  ].join('\n');
}

function noLiveFlagsText(result: Record<string, unknown>): string {
  return [
    `liveExecution=${String(result.liveExecution ?? false)}`,
    `externalProcessStarted=${String(result.externalProcessStarted ?? false)}`,
    `executionDisabled=${String(result.executionDisabled ?? true)}`,
  ].join('\n');
}

function createReadOnlyAdapterChecklistFromOptions(
  options: CodexExecReadOnlyAdapterPreflightCliOptions,
): CodexExecReadOnlyAdapterOperatorChecklistItem[] {
  const checklist = createDefaultReadOnlyAdapterOperatorChecklist();

  return options.checklistComplete === true
    ? checklist.map((item) => ({ ...item, checked: true }))
    : checklist;
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

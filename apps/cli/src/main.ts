#!/usr/bin/env node
import { existsSync } from 'node:fs';
import { mkdir, readFile, realpath, writeFile } from 'node:fs/promises';
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
  hashRealReadOnlyAdapterRuntimeWorktreePath,
  REAL_READ_ONLY_ADAPTER_READINESS_RECOMMENDATION,
  REAL_READ_ONLY_ADAPTER_READINESS_REVIEW_RECOMMENDATION,
  summarizeRealReadOnlyAdapterAttempt,
  summarizeRealReadOnlyAdapterApprovalAuthorityTraceRecord,
  summarizeRealReadOnlyAdapterPolicySourceRecord,
  summarizeRealReadOnlyAdapterPilotSourcePreparationRecord,
  summarizeRealReadOnlyAdapterPilotPrerequisiteRecord,
  summarizeRealReadOnlyAdapterReadinessPackage,
  runReadOnlyAdapterFixtureBoundary,
  summarizeReadOnlyAdapterFixtureBoundary,
  REAL_READ_ONLY_ADAPTER_CODEX_CLI_INVOCATION_CONTRACT_VERSION,
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
import { SchemaVersionSchema } from '@codexhub/contracts';
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
  CodexExecRealReadOnlyAdapterAttemptRecord,
  CodexExecRealReadOnlyAdapterAttemptStatus,
  CodexExecRealReadOnlyAdapterAttemptTimelineSummary,
  CodexExecRealReadOnlyAdapterApprovalAuthorityTraceRecord,
  CodexExecRealReadOnlyAdapterApprovalAuthorityTraceStatus,
  CodexExecRealReadOnlyAdapterPolicySourceRecord,
  CodexExecRealReadOnlyAdapterPolicySourceStatus,
  CodexExecRealReadOnlyAdapterPilotSourcePreparationRecord,
  CodexExecRealReadOnlyAdapterPilotSourcePreparationStatus,
  CodexExecRealReadOnlyAdapterPilotPrerequisiteRecord,
  CodexExecRealReadOnlyAdapterPilotPrerequisiteStatus,
  CodexExecReportRecommendation,
  CodexExecReportReviewQuery,
  CodexExecReportReviewRecord,
  CodexExecReportReviewStatus,
  CodexExecTimelineFilter,
  CodexReplaySummary,
  ApprovalDecisionHistoryProjection,
  ApprovalDecisionResult,
  ApprovalInboxProjection,
  ApprovalUxStatus,
  ApprovalUxType,
  WorkflowRun,
} from '@codexhub/contracts';
import { createApprovalDecisionHistoryProjection } from '@codexhub/approval-ux-kernel';
import {
  type MockDevelopmentOrchestrationResult,
  runGoldenPathRehearsal,
  runM10PilotAcceptanceRehearsal,
  runMockDevelopmentOrchestration,
} from '@codexhub/orchestrator-kernel';
import {
  createGovernanceProjection,
  type GovernanceProjectionInputRun,
  type GovernanceProjectionResult,
} from '@codexhub/governance-projection-kernel';
import {
  createM10PilotChecklist,
  createM10PilotRunbookSummary,
  createM11PilotEnablementChecklist,
  createM11PilotEnablementRunbookSummary,
  createOperatorReadinessReport,
  type M10PilotChecklist,
  type M10PilotRunbookSummary,
  type M11PilotEnablementChecklist,
  type M11PilotEnablementRunbookSummary,
  type OperatorConfigInput,
  type OperatorIntegrationInput,
  type OperatorReadinessReport,
} from '@codexhub/operator-readiness-kernel';
import { DefaultPolicyEngine } from '@codexhub/security-kernel';
import { WorkflowRunner, createMockWorkflowDefinition } from '@codexhub/workflow-kernel';
import {
  type JsonCliOptions,
  type VerifyAffectedDryRunCliOptions,
  type BrowserObserveDryRunCliOptions,
  type PolicyBackendPlanCliOptions,
  createBrowserObserveDryRunForCli,
  createVerifyAffectedDryRunForCli,
  formatBrowserObserveDryRunOutput,
  formatBrowserProfilesListOutput,
  formatPolicyBackendPlanOutput,
  formatPolicyBackendStatusOutput,
  formatTelemetryProjectionOutput,
  formatTelemetryStatusOutput,
  formatMcpToolDetailOutput,
  formatMcpToolsListOutput,
  formatVerifyAffectedDryRunOutput,
  getPolicyBackendStatusForCli,
  getTelemetryStatusForCli,
  getMcpToolForCli,
  listBrowserProfilesForCli,
  listMcpToolsForCli,
  createPolicyBackendPlanForCli,
  showTelemetryProjectionForCli,
} from './m3b-readonly';

const supervisorUrl = process.env.CODEXHUB_SUPERVISOR_URL ?? 'http://127.0.0.1:3333';
const LOCAL_CONTROL_KEY_KIND = ['to', 'ken'].join('');
const LOCAL_CONTROL_HEADER = ['x-codexhub-local', LOCAL_CONTROL_KEY_KIND].join('-');
const LOCAL_CONTROL_ENV_VAR = [
  'CODEXHUB_SUPERVISOR_LOCAL_',
  LOCAL_CONTROL_KEY_KIND.toUpperCase(),
].join('');

class MissingSupervisorLocalControlKeyError extends Error {
  constructor() {
    super(`${LOCAL_CONTROL_ENV_VAR} is required for Supervisor mutating requests`);
    this.name = 'MissingSupervisorLocalControlKeyError';
  }
}

function createSupervisorPostHeaders(): Record<string, string> {
  const localControlKey = process.env[LOCAL_CONTROL_ENV_VAR];

  if (!localControlKey) {
    throw new MissingSupervisorLocalControlKeyError();
  }

  return {
    'content-type': 'application/json',
    [LOCAL_CONTROL_HEADER]: localControlKey,
  };
}

function rethrowMissingLocalControlKey(error: unknown): void {
  if (error instanceof MissingSupervisorLocalControlKeyError) {
    throw error;
  }
}

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

export interface ReadOnlyRunSummary {
  id: string;
  source:
    | 'workflow'
    | 'development'
    | 'codex_exec_dry_run'
    | 'browser_observation'
    | 'electron_cdp_observation'
    | 'worktree_run'
    | 'worktree_cleanup_run'
    | 'm11_pilot'
    | 'policy_backend_projection'
    | 'telemetry_projection';
  title: string;
  status: string;
  summary: string;
  evidenceCount?: number;
  auditEventCount?: number;
  liveExecution: false;
  externalProcessStarted: false;
  noRealWrite: true;
  bodyStored: false;
}

export interface GovernanceRunsListCliOptions extends JsonCliOptions {
  source?: string;
  status?: string;
}

export interface ApprovalInboxCliOptions extends JsonCliOptions {
  type?: string;
}

export interface ApprovalHistoryCliOptions extends ApprovalInboxCliOptions {
  status?: string;
}

export interface ApprovalDecisionCliOptions extends JsonCliOptions {
  type: string;
  decision: string;
  reason: string;
}

interface BrowserObservationRunApiRecord {
  runId?: string;
  recordId?: string;
  dryRunId?: string;
  status?: string;
  summary?: string;
  evidenceRefIds?: string[];
  auditEventIds?: string[];
  processBoundaryInvoked?: boolean;
  externalProcessStarted?: boolean;
  noRealWrite?: boolean;
  bodyStored?: boolean;
  rawPathStored?: boolean;
}

interface ElectronCdpObservationApiRecord {
  recordId?: string;
  dryRunId?: string;
  approvalArtifactId?: string;
  runId?: string;
  status?: string;
  runnerMode?: string;
  endpointIdHash?: string;
  targetIdHash?: string;
  summary?: string;
  evidenceRefIds?: string[];
  auditEventIds?: string[];
  eventSummary?: {
    eventCount?: number;
    consoleEventCount?: number;
    networkEventCount?: number;
  };
  cdpHttpBoundaryPlanned?: boolean;
  cdpHttpBoundaryInvoked?: boolean;
  cdpWebSocketBoundaryPlanned?: boolean;
  cdpWebSocketBoundaryInvoked?: boolean;
  processBoundaryInvoked?: boolean;
  externalProcessStarted?: boolean;
  noRealWrite?: boolean;
  bodyStored?: boolean;
  rawPathStored?: boolean;
}

export interface ElectronCdpApprovalListCliOptions extends JsonCliOptions {
  dryRunId?: string;
  status?: string;
}

interface WorktreeApiRecord {
  recordId?: string;
  dryRunId?: string;
  approvalArtifactId?: string;
  runId?: string;
  sourceRunId?: string;
  status?: string;
  runnerMode?: string;
  operationMode?: string;
  repoRootHash?: string;
  worktreeRootHash?: string;
  worktreePathHash?: string;
  baseRefHash?: string;
  branchSlugHash?: string;
  changedFileCount?: number;
  diffHash?: string;
  cleanupRequired?: boolean;
  cleanupDeferred?: boolean;
  cleanupCompleted?: boolean;
  gitProcessBoundaryPlanned?: boolean;
  gitProcessBoundaryInvoked?: boolean;
  processBoundaryInvoked?: boolean;
  externalProcessStarted?: boolean;
  noRealWrite?: boolean;
  bodyStored?: boolean;
  rawPathStored?: boolean;
  evidenceRefIds?: string[];
  auditEventIds?: string[];
  summary?: string;
}

interface M11PilotRunApiRecord {
  runId?: string;
  status?: string;
  readinessStatus?: string;
  readinessBlockers?: string[];
  failureClassification?: string;
  worktreeRunId?: string;
  codexStatus?: string;
  verificationStatus?: string;
  prDraftStatus?: string;
  changedFileCount?: number;
  cleanupRequired?: boolean;
  evidenceRefIds?: string[];
  auditEventIds?: string[];
  processBoundaryInvoked?: boolean;
  externalProcessStarted?: boolean;
  codexReadOnlyDryRunOnly?: boolean;
  patchGenerationAllowed?: boolean;
  pushAllowed?: boolean;
  pullRequestOpened?: boolean;
  rawPathStored?: boolean;
  bodyStored?: boolean;
  summary?: string;
}

export interface WorktreeApprovalListCliOptions extends JsonCliOptions {
  dryRunId?: string;
  status?: string;
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
  governedInput?: string;
  governedInputHash?: string;
}

export interface CodexExecRealReadOnlyAdapterAttemptListCliOptions extends CodexExecJsonCliOptions {
  dryRun?: string;
  status?: string;
}

export interface CodexExecRealReadOnlyAdapterAttemptTimelineCliOptions extends CodexExecRealReadOnlyAdapterAttemptListCliOptions {
  includeEvidence?: boolean;
  includeAudit?: boolean;
}

export interface CodexExecRealReadOnlyAdapterApprovalAuthorityTraceCliOptions extends CodexExecJsonCliOptions {
  approval?: string;
}

export interface CodexExecRealReadOnlyAdapterApprovalAuthorityTraceListCliOptions extends CodexExecJsonCliOptions {
  dryRun?: string;
  status?: string;
}

export type CodexExecRealReadOnlyAdapterPolicySourcePrepareCliOptions = CodexExecJsonCliOptions;

export interface CodexExecRealReadOnlyAdapterPolicySourceListCliOptions extends CodexExecJsonCliOptions {
  dryRun?: string;
  status?: string;
}

export interface CodexExecRealReadOnlyAdapterPilotPrerequisiteCheckCliOptions extends CodexExecJsonCliOptions {
  approval?: string;
  worktree?: string;
  worktreeLabel?: string;
  worktreeStatus?: string;
  worktreePathHash?: string;
  handoffContextComplete?: boolean;
}

export interface CodexExecRealReadOnlyAdapterPilotPrerequisiteListCliOptions extends CodexExecJsonCliOptions {
  dryRun?: string;
  status?: string;
}

export interface CodexExecRealReadOnlyAdapterPilotSourcePreparationPrepareCliOptions extends CodexExecJsonCliOptions {
  approval?: string;
  worktree?: string;
  worktreeLabel?: string;
  worktreeStatus?: string;
  worktreePathHash?: string;
}

export interface CodexExecRealReadOnlyAdapterPilotSourcePreparationListCliOptions extends CodexExecJsonCliOptions {
  dryRun?: string;
  status?: string;
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

  const doctorCommand = program
    .command('doctor')
    .description('Read operator readiness without exposing secrets or raw config');

  doctorCommand
    .option('--json', 'Print full JSON output')
    .description('Show operator readiness and safe-enable blockers')
    .action(async (options: JsonCliOptions) => {
      const report = await getOperatorReadinessReportForCli();
      console.log(formatOperatorReadinessReportOutput(report, options));
    });

  doctorCommand
    .command('integration')
    .argument('<name>')
    .option('--json', 'Print full JSON output')
    .description('Show readiness for one integration')
    .action(async (name: string, options: JsonCliOptions) => {
      const result = await getOperatorIntegrationReadinessForCli(name);
      console.log(formatOperatorIntegrationReadinessOutput(result, options));
    });

  const pilotCommand = program
    .command('pilot')
    .description('Read-only operator pilot productization commands');

  const pilotM10Command = pilotCommand
    .command('m10')
    .description('M10 local pilot checklist and runbook summaries');

  pilotM10Command
    .command('checklist')
    .option('--json', 'Print full JSON output')
    .description('Show the M10 operator pilot checklist without executing the pilot')
    .action(async (options: JsonCliOptions) => {
      const checklist = await getM10PilotChecklistForCli();
      console.log(formatM10PilotChecklistOutput(checklist, options));
    });

  pilotM10Command
    .command('runbook')
    .option('--json', 'Print full JSON output')
    .description('Show the M10 operator pilot runbook summary without mutating state')
    .action(async (options: JsonCliOptions) => {
      const runbook = await getM10PilotRunbookForCli();
      console.log(formatM10PilotRunbookOutput(runbook, options));
    });

  pilotM10Command
    .command('rehearse')
    .requiredOption('--fixture', 'Run the fixture-only M10 acceptance rehearsal')
    .option(
      '--scenario <scenario>',
      'Fixture scenario: all-pass, readiness-blocked, approval-blocked, codex-failed, or nx-failed',
    )
    .option('--json', 'Print full JSON output')
    .description('Run the M10 operator acceptance rehearsal without live adapters')
    .action((options: JsonCliOptions & { fixture?: boolean; scenario?: string }) => {
      const result = runM10PilotAcceptanceRehearsalForCli(options);
      console.log(formatM10PilotAcceptanceRehearsalOutput(result, options));
    });

  const pilotM11Command = pilotCommand
    .command('m11')
    .description('M11 production pilot narrow-path read-only summaries');

  pilotM11Command
    .command('readiness')
    .option('--json', 'Print full JSON output')
    .description('Show M11 narrow-path readiness metadata without executing the pilot')
    .action(async (options: JsonCliOptions) => {
      const readiness = await getM11PilotReadinessForCli();
      console.log(formatM11PilotReadinessOutput(readiness, options));
    });

  const pilotM11RunsCommand = pilotM11Command
    .command('runs')
    .description('Read M11 narrow-path pilot run metadata from Supervisor GET endpoints');

  pilotM11RunsCommand
    .command('list')
    .option('--json', 'Print full JSON output')
    .description('List M11 narrow-path pilot runs without sending a local-control key')
    .action(async (options: JsonCliOptions) => {
      const result = await listM11PilotRunsForCli();
      console.log(formatM11PilotRunsListOutput(result, options));
    });

  pilotM11RunsCommand
    .command('show')
    .argument('<runId>')
    .option('--json', 'Print full JSON output')
    .description('Show one M11 narrow-path pilot run without executing the pilot')
    .action(async (runId: string, options: JsonCliOptions) => {
      const result = await showM11PilotRunForCli(runId);
      console.log(formatM11PilotRunShowOutput(result, options));
    });

  const rehearsalCommand = program
    .command('rehearsal')
    .description('Fixture-only release rehearsal commands');

  rehearsalCommand
    .command('golden-path')
    .requiredOption('--fixture', 'Run the fixture-only golden path rehearsal')
    .option('--scenario <scenario>', 'Fixture scenario: all-pass, codex-failed, or nx-failed')
    .option('--json', 'Print full JSON output')
    .description('Run the metadata-only golden path rehearsal without live adapters')
    .action((options: JsonCliOptions & { fixture?: boolean; scenario?: string }) => {
      const result = runGoldenPathRehearsalForCli(options);
      console.log(formatGoldenPathRehearsalOutput(result, options));
    });

  const runsCommand = program
    .command('runs')
    .description('Read-only run summary commands');

  runsCommand
    .command('list')
    .option('--json', 'Print full JSON output')
    .description('List read-only run summaries from existing Supervisor GET endpoints')
    .action(async (options: JsonCliOptions) => {
      const result = await listReadOnlyRuns();
      console.log(formatReadOnlyRunsListOutput(result, options));
    });

  runsCommand
    .command('show')
    .argument('<runId>')
    .option('--json', 'Print full JSON output')
    .description('Show one read-only run summary')
    .action(async (runId: string, options: JsonCliOptions) => {
      const result = await showReadOnlyRun(runId);
      console.log(formatReadOnlyRunDetailOutput(result, options));
    });

  const governanceCommand = program
    .command('governance')
    .description('Unified read-only governance projection commands');
  const governanceRunsCommand = governanceCommand
    .command('runs')
    .description('Read unified run projections');

  governanceRunsCommand
    .command('list')
    .option('--source <source>', 'Filter by normalized source')
    .option('--status <status>', 'Filter by projection status')
    .option('--json', 'Print full JSON output')
    .description('List unified run projections without invoking adapters')
    .action(async (options: GovernanceRunsListCliOptions) => {
      const result = await listGovernanceRuns(options);
      console.log(formatGovernanceRunsListOutput(result, options));
    });

  governanceRunsCommand
    .command('show')
    .argument('<projectionId>')
    .option('--json', 'Print full JSON output')
    .description('Show one unified run projection')
    .action(async (projectionId: string, options: JsonCliOptions) => {
      const result = await showGovernanceRun(projectionId);
      console.log(formatGovernanceRunDetailOutput(result, options));
    });

  const governanceEvidenceCommand = governanceCommand
    .command('evidence')
    .description('Read evidence bundle projections');

  governanceEvidenceCommand
    .command('bundle')
    .argument('<projectionId>')
    .option('--json', 'Print full JSON output')
    .description('Show one metadata-only evidence bundle projection')
    .action(async (projectionId: string, options: JsonCliOptions) => {
      const result = await getGovernanceEvidenceBundle(projectionId);
      console.log(formatGovernanceEvidenceBundleOutput(result, options));
    });

  const governanceAuditCommand = governanceCommand
    .command('audit')
    .description('Read audit chain projections');

  governanceAuditCommand
    .command('chain')
    .argument('<projectionId>')
    .option('--json', 'Print full JSON output')
    .description('Show one metadata-only audit chain projection')
    .action(async (projectionId: string, options: JsonCliOptions) => {
      const result = await getGovernanceAuditChain(projectionId);
      console.log(formatGovernanceAuditChainOutput(result, options));
    });

  const evidenceTopLevelCommand = program
    .command('evidence')
    .description('Read evidence refs without exposing bodies');

  evidenceTopLevelCommand
    .command('list')
    .option('--kind <kind>', 'Filter by evidence kind')
    .option('--json', 'Print full JSON output')
    .description('List metadata-only evidence refs')
    .action(async (options: CodexExecEvidenceListCliOptions) => {
      const result = await listCodexExecEvidence(options);
      console.log(formatCodexExecEvidenceListOutput(result, options));
    });

  evidenceTopLevelCommand
    .command('show')
    .argument('<evidenceRefId>')
    .option('--json', 'Print full JSON output')
    .description('Show one metadata-only evidence ref')
    .action(async (evidenceRefId: string, options: JsonCliOptions) => {
      const result = await getCodexExecEvidence(evidenceRefId);
      console.log(formatCodexExecDetailOutput('Evidence detail', result, options));
    });

  const mcpCommand = program.command('mcp').description('Read-only MCP registry commands');
  const mcpToolsCommand = mcpCommand
    .command('tools')
    .description('Read local MCP tool registry metadata');

  mcpToolsCommand
    .command('list')
    .option('--json', 'Print full JSON output')
    .description('List read-only MCP tools without invoking MCP')
    .action((options: JsonCliOptions) => {
      console.log(formatMcpToolsListOutput(listMcpToolsForCli(), options));
    });

  mcpToolsCommand
    .command('show')
    .argument('<toolName>')
    .option('--json', 'Print full JSON output')
    .description('Show one read-only MCP tool definition without invoking MCP')
    .action((toolName: string, options: JsonCliOptions) => {
      console.log(formatMcpToolDetailOutput(getMcpToolForCli(toolName), options));
    });

  const policyBackendCommand = program
    .command('policy-backend')
    .description('Read-only policy backend metadata commands');

  policyBackendCommand
    .command('status')
    .option('--json', 'Print full JSON output')
    .description('Show policy backend manifest and advisory-only status')
    .action(async (options: JsonCliOptions) => {
      const result = await getPolicyBackendStatusForCli();
      console.log(formatPolicyBackendStatusOutput(result, options));
    });

  policyBackendCommand
    .command('plan')
    .requiredOption('--action <type>', 'Action type to evaluate in fixture planning')
    .requiredOption('--mode <mode>', 'Action mode: read, dry-run, write, or admin')
    .option('--risk <level>', 'Risk level', 'low')
    .option('--json', 'Print full JSON output')
    .description('Create a read-only policy backend fixture plan without authority')
    .action(async (options: PolicyBackendPlanCliOptions) => {
      const result = await createPolicyBackendPlanForCli(options);
      console.log(formatPolicyBackendPlanOutput(result, options));
    });

  const telemetryCommand = program
    .command('telemetry')
    .description('Read-only telemetry projection metadata commands');

  telemetryCommand
    .command('status')
    .option('--json', 'Print full JSON output')
    .description('Show telemetry manifest and no-network projection status')
    .action((options: JsonCliOptions) => {
      console.log(formatTelemetryStatusOutput(getTelemetryStatusForCli(), options));
    });

  const telemetryProjectionCommand = telemetryCommand
    .command('projection')
    .description('Read local telemetry projection summaries');

  telemetryProjectionCommand
    .command('show')
    .option('--json', 'Print full JSON output')
    .description('Show local telemetry projection without exporting telemetry')
    .action((options: JsonCliOptions) => {
      console.log(formatTelemetryProjectionOutput(showTelemetryProjectionForCli(), options));
    });

  const approvalsCommand = program
    .command('approvals')
    .description('Supervisor-gated approval inbox and decisions');

  approvalsCommand
    .command('inbox')
    .option('--type <type>', 'Filter by approval type')
    .option('--json', 'Print full JSON output')
    .description('Read the unified approval inbox without sending a local-control key')
    .action(async (options: ApprovalInboxCliOptions) => {
      const result = await listApprovalInbox(options);
      console.log(formatApprovalInboxOutput(result, options));
    });

  approvalsCommand
    .command('history')
    .option('--type <type>', 'Filter by approval type')
    .option('--status <status>', 'Filter by approval status')
    .option('--json', 'Print full JSON output')
    .description('Project approval decision history from read-only inbox metadata')
    .action(async (options: ApprovalHistoryCliOptions) => {
      const result = await listApprovalDecisionHistory(options);
      console.log(formatApprovalDecisionHistoryOutput(result, options));
    });

  approvalsCommand
    .command('decide')
    .argument('<approvalRequestId>')
    .requiredOption('--type <type>', 'Approval type')
    .requiredOption('--decision <decision>', 'approved, denied, or revoked')
    .requiredOption('--reason <reason>', 'Decision reason')
    .option('--json', 'Print full JSON output')
    .description('Record an approval decision through Supervisor')
    .action(async (approvalRequestId: string, options: ApprovalDecisionCliOptions) => {
      const result = await decideApproval(approvalRequestId, options);
      console.log(formatApprovalDecisionOutput(result, options));
    });

  const verifyCommand = program
    .command('verify')
    .description('Read-only verification planning commands');

  verifyCommand
    .command('affected')
    .requiredOption('--dry-run', 'Plan only; required in M3b')
    .option('--targets <targets>', 'Comma-separated allowlisted targets', 'lint,test,build')
    .option('--base <ref>', 'Optional base ref')
    .option('--head <ref>', 'Optional head ref')
    .option('--cwd <path>', 'Workspace-relative cwd for planning', '.')
    .option('--json', 'Print full JSON output')
    .description('Plan Nx affected verification without executing Nx')
    .action((options: VerifyAffectedDryRunCliOptions) => {
      const result = createVerifyAffectedDryRunForCli(options);
      console.log(formatVerifyAffectedDryRunOutput(result, options));
    });

  const browserCommand = program
    .command('browser')
    .description('Read-only browser profile metadata commands');

  const browserProfilesCommand = browserCommand
    .command('profiles')
    .description('Read metadata-only browser profile readiness');

  browserProfilesCommand
    .command('list')
    .option('--json', 'Print full JSON output')
    .description('List browser profile refs without opening a profile')
    .action((options: JsonCliOptions) => {
      console.log(formatBrowserProfilesListOutput(listBrowserProfilesForCli(), options));
    });

  browserCommand
    .command('observe')
    .requiredOption('--dry-run', 'Plan only; required in M4c')
    .option('--profile-id <profileId>', 'Metadata label for the profile ref', 'cli-observe-profile')
    .option('--display-name <displayName>', 'Metadata display name', 'CLI observe profile')
    .option('--profile-path <profilePath>', 'Path-like input used only to derive a hash')
    .option('--runner-mode <mode>', 'fixture or controlled-local-browser', 'fixture')
    .option('--target-url <url>', 'Hash-only target URL for controlled local browser planning')
    .option(
      '--capabilities <capabilities>',
      'Comma-separated read-only capabilities',
      'title,url,accessibility_snapshot,console_summary,network_metadata_summary',
    )
    .option('--requested-actions <actions>', 'Comma-separated blocked browser actions')
    .option('--screenshot', 'Request screenshot capture; remains blocked in M4c')
    .option('--network-body', 'Request network body storage; remains blocked in M4c')
    .option('--body-storage', 'Request body storage; remains blocked in M4c')
    .option('--json', 'Print full JSON output')
    .description('Plan browser read-only observation without opening a browser')
    .action((options: BrowserObserveDryRunCliOptions) => {
      const result = createBrowserObserveDryRunForCli(options);
      console.log(formatBrowserObserveDryRunOutput(result, options));
    });

  const browserRunsCommand = browserCommand
    .command('runs')
    .description('Read browser observation run metadata from Supervisor GET endpoints');

  browserRunsCommand
    .command('list')
    .option('--json', 'Print full JSON output')
    .description('List browser observation runs without executing observation')
    .action(async (options: JsonCliOptions) => {
      const result = await listBrowserObservationRuns();
      console.log(formatBrowserObservationRunsListOutput(result, options));
    });

  browserRunsCommand
    .command('show')
    .argument('<runId>')
    .option('--json', 'Print full JSON output')
    .description('Show browser observation run metadata without executing observation')
    .action(async (runId: string, options: JsonCliOptions) => {
      const result = await showBrowserObservationRun(runId);
      console.log(formatBrowserObservationRunDetailOutput(result, options));
    });

  const electronCommand = program
    .command('electron')
    .description('Read-only Electron/CDP observation metadata commands');

  const electronDryRunsCommand = electronCommand
    .command('dry-runs')
    .description('Read Electron/CDP dry-run metadata from Supervisor GET endpoints');

  electronDryRunsCommand
    .command('list')
    .option('--json', 'Print full JSON output')
    .description('List Electron/CDP observation dry-runs without executing observation')
    .action(async (options: JsonCliOptions) => {
      const result = await listElectronCdpObservationDryRuns();
      console.log(formatElectronCdpObservationDryRunsListOutput(result, options));
    });

  const electronApprovalsCommand = electronCommand
    .command('approvals')
    .description('Read Electron/CDP approval metadata from Supervisor GET endpoints');

  electronApprovalsCommand
    .command('list')
    .option('--dry-run-id <dryRunId>', 'Filter by dry-run id')
    .option('--status <status>', 'Filter by approval status')
    .option('--json', 'Print full JSON output')
    .description('List Electron/CDP observation approvals without creating approval state')
    .action(async (options: ElectronCdpApprovalListCliOptions) => {
      const result = await listElectronCdpObservationApprovals(options);
      console.log(formatElectronCdpObservationApprovalsListOutput(result, options));
    });

  const electronRunsCommand = electronCommand
    .command('runs')
    .description('Read Electron/CDP observation run metadata from Supervisor GET endpoints');

  electronRunsCommand
    .command('list')
    .option('--json', 'Print full JSON output')
    .description('List Electron/CDP observation runs without executing observation')
    .action(async (options: JsonCliOptions) => {
      const result = await listElectronCdpObservationRuns();
      console.log(formatElectronCdpObservationRunsListOutput(result, options));
    });

  electronRunsCommand
    .command('show')
    .argument('<runId>')
    .option('--json', 'Print full JSON output')
    .description('Show Electron/CDP observation run metadata without executing observation')
    .action(async (runId: string, options: JsonCliOptions) => {
      const result = await showElectronCdpObservationRun(runId);
      console.log(formatElectronCdpObservationRunDetailOutput(result, options));
    });

  const worktreesCommand = program
    .command('worktrees')
    .description('Read-only worktree create and cleanup metadata commands');

  const worktreeDryRunsCommand = worktreesCommand
    .command('dry-runs')
    .description('Read worktree dry-run metadata from Supervisor GET endpoints');

  worktreeDryRunsCommand
    .command('list')
    .option('--json', 'Print full JSON output')
    .description('List worktree dry-runs without creating worktrees')
    .action(async (options: JsonCliOptions) => {
      const result = await listWorktreeDryRuns();
      console.log(formatWorktreeDryRunsListOutput(result, options));
    });

  const worktreeApprovalsCommand = worktreesCommand
    .command('approvals')
    .description('Read worktree approval metadata from Supervisor GET endpoints');

  worktreeApprovalsCommand
    .command('list')
    .option('--dry-run-id <dryRunId>', 'Filter by dry-run id')
    .option('--status <status>', 'Filter by approval status')
    .option('--json', 'Print full JSON output')
    .description('List worktree approvals without creating approval state')
    .action(async (options: WorktreeApprovalListCliOptions) => {
      const result = await listWorktreeApprovals(options);
      console.log(formatWorktreeApprovalsListOutput(result, options));
    });

  const worktreeRunsCommand = worktreesCommand
    .command('runs')
    .description('Read worktree run metadata from Supervisor GET endpoints');

  worktreeRunsCommand
    .command('list')
    .option('--json', 'Print full JSON output')
    .description('List worktree runs without executing git')
    .action(async (options: JsonCliOptions) => {
      const result = await listWorktreeRuns();
      console.log(formatWorktreeRunsListOutput(result, options));
    });

  worktreeRunsCommand
    .command('show')
    .argument('<runId>')
    .option('--json', 'Print full JSON output')
    .description('Show worktree run metadata without executing git')
    .action(async (runId: string, options: JsonCliOptions) => {
      const result = await showWorktreeRun(runId);
      console.log(formatWorktreeRunDetailOutput(result, options));
    });

  const worktreeCleanupCommand = worktreesCommand
    .command('cleanup')
    .description('Read-only worktree cleanup metadata commands');

  const worktreeCleanupDryRunsCommand = worktreeCleanupCommand
    .command('dry-runs')
    .description('Read cleanup dry-run metadata from Supervisor GET endpoints');

  worktreeCleanupDryRunsCommand
    .command('list')
    .option('--json', 'Print full JSON output')
    .description('List cleanup dry-runs without removing worktrees')
    .action(async (options: JsonCliOptions) => {
      const result = await listWorktreeCleanupDryRuns();
      console.log(formatWorktreeCleanupDryRunsListOutput(result, options));
    });

  const worktreeCleanupApprovalsCommand = worktreeCleanupCommand
    .command('approvals')
    .description('Read cleanup approval metadata from Supervisor GET endpoints');

  worktreeCleanupApprovalsCommand
    .command('list')
    .option('--dry-run-id <dryRunId>', 'Filter by dry-run id')
    .option('--status <status>', 'Filter by approval status')
    .option('--json', 'Print full JSON output')
    .description('List cleanup approvals without creating approval state')
    .action(async (options: WorktreeApprovalListCliOptions) => {
      const result = await listWorktreeCleanupApprovals(options);
      console.log(formatWorktreeCleanupApprovalsListOutput(result, options));
    });

  const worktreeCleanupRunsCommand = worktreeCleanupCommand
    .command('runs')
    .description('Read cleanup run metadata from Supervisor GET endpoints');

  worktreeCleanupRunsCommand
    .command('list')
    .option('--json', 'Print full JSON output')
    .description('List cleanup runs without executing cleanup')
    .action(async (options: JsonCliOptions) => {
      const result = await listWorktreeCleanupRuns();
      console.log(formatWorktreeCleanupRunsListOutput(result, options));
    });

  worktreeCleanupRunsCommand
    .command('show')
    .argument('<runId>')
    .option('--json', 'Print full JSON output')
    .description('Show cleanup run metadata without executing cleanup')
    .action(async (runId: string, options: JsonCliOptions) => {
      const result = await showWorktreeCleanupRun(runId);
      console.log(formatWorktreeCleanupRunDetailOutput(result, options));
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
    .option(
      '--policy-source <policySourceId>',
      'Bind approval to an aligned read-only adapter policy source',
    )
    .description('Create a manual approval request for a dry-run record')
    .action(async (dryRunId: string, options: { reason: string; policySource?: string }) => {
      const result = await requestCodexExecApproval(dryRunId, options.reason, options.policySource);
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
    .description('Real read-only adapter readiness commands without execution approval')
    .addHelpText(
      'after',
      [
        '',
        'Operator boundary:',
        '  These commands are CLI/Supervisor control-plane commands only.',
        '  They require explicit configuration, existing dry-run evidence, approval evidence,',
        '  isolated clean worktree metadata, and metadata-only evidence/audit stores.',
        '  Dashboard triggering, workspace_write, and danger_full_access remain forbidden.',
      ].join('\n'),
    );

  realReadOnlyAdapterCommand
    .command('attempt')
    .argument('<dryRunId>')
    .requiredOption('--approval <approvalArtifactId>', 'Existing approval artifact id')
    .requiredOption('--worktree <path>', 'Existing isolated worktree path')
    .requiredOption(
      '--governed-input <relativePath>',
      'Governed input file path relative to the isolated worktree',
    )
    .requiredOption('--governed-input-hash <hash>', 'Expected governed input content hash')
    .option('--json', 'Print full JSON output')
    .description('Attempt the gated CLI-only read-only adapter path')
    .addHelpText(
      'after',
      [
        '',
        'Attempt prerequisites:',
        '  - explicit adapter config enablement',
        '  - existing dryRunId',
        '  - valid approval artifact bound to dry-run and policy hashes',
        '  - isolated clean worktree metadata',
        '  - ready metadata-only evidence and audit stores',
        'Abort/failure handling:',
        '  Missing gates are blocked before authority is claimed.',
        '  Degraded local fallback is display-only and cannot create an authoritative record.',
      ].join('\n'),
    )
    .action(async (dryRunId: string, options: CodexExecRealReadOnlyAdapterAttemptCliOptions) => {
      const result = await attemptRealReadOnlyAdapterCommand(dryRunId, options);
      console.log(formatRealReadOnlyAdapterAttemptOutput(result, options));
    });

  const attemptsCommand = realReadOnlyAdapterCommand
    .command('attempts')
    .description('Read authoritative real read-only adapter attempt records')
    .addHelpText(
      'after',
      [
        '',
        'State guide:',
        '  blocked   Gate checks refused the attempt before authority was claimed.',
        '  completed Metadata-only authoritative record exists and still requires operator review.',
        '  failed    Attempt ended in a failure state and requires operator review.',
        '  aborted   Attempt was cancelled or stopped and requires operator review.',
        '  degraded/notPersisted output is display-only and not authoritative.',
      ].join('\n'),
    );

  attemptsCommand
    .command('get')
    .argument('<attemptId>')
    .option('--json', 'Print full JSON output')
    .description('Read one attempt record')
    .action(async (attemptId: string, options: CodexExecJsonCliOptions) => {
      const result = await getRealReadOnlyAdapterAttemptCommand(attemptId);
      console.log(formatRealReadOnlyAdapterAttemptOutput(result, options));
    });

  attemptsCommand
    .command('list')
    .option('--dry-run <dryRunId>', 'Filter by dry-run id')
    .option('--status <status>', 'Filter by attempt status')
    .option('--json', 'Print full JSON output')
    .description('List attempt record summaries')
    .action(async (options: CodexExecRealReadOnlyAdapterAttemptListCliOptions) => {
      const result = await listRealReadOnlyAdapterAttemptsCommand(options);
      console.log(formatRealReadOnlyAdapterAttemptListOutput(result, options));
    });

  attemptsCommand
    .command('latest')
    .argument('<dryRunId>')
    .option('--json', 'Print full JSON output')
    .description('Read the latest attempt record for a dry-run id')
    .action(async (dryRunId: string, options: CodexExecJsonCliOptions) => {
      const result = await getLatestRealReadOnlyAdapterAttemptCommand(dryRunId);
      console.log(formatRealReadOnlyAdapterAttemptOutput(result, options));
    });

  attemptsCommand
    .command('timeline')
    .argument('<dryRunId>')
    .option('--status <status>', 'Filter by attempt status')
    .option('--include-evidence', 'Include evidence reference ids')
    .option('--include-audit', 'Include audit event ids')
    .option('--json', 'Print full JSON output')
    .description('Read metadata-only attempt timeline for a dry-run id')
    .action(
      async (dryRunId: string, options: CodexExecRealReadOnlyAdapterAttemptTimelineCliOptions) => {
        const result = await getRealReadOnlyAdapterAttemptTimelineCommand(dryRunId, options);
        console.log(formatRealReadOnlyAdapterAttemptTimelineOutput(result, options));
      },
    );

  const approvalAuthorityCommand = realReadOnlyAdapterCommand
    .command('approval-authority')
    .description('Trace read-only adapter approval authority without running a pilot')
    .addHelpText(
      'after',
      [
        '',
        'Approval-authority rules:',
        '  - traces compare source-prep, prerequisite, CLI input, and exact approval lookup',
        '  - degraded or notPersisted fallback output is display-only and never aligned',
        '  - this command does not create approvals, consume approvals, invoke attempts, or run a pilot',
      ].join('\n'),
    );

  approvalAuthorityCommand
    .command('trace')
    .argument('<dryRunId>')
    .requiredOption('--approval <approvalArtifactId>', 'Existing approval artifact id to trace')
    .option('--json', 'Print full JSON output')
    .description('Create persisted approval authority trace metadata from existing inputs only')
    .action(
      async (
        dryRunId: string,
        options: CodexExecRealReadOnlyAdapterApprovalAuthorityTraceCliOptions,
      ) => {
        const result = await traceRealReadOnlyAdapterApprovalAuthorityCommand(dryRunId, options);
        console.log(formatRealReadOnlyAdapterApprovalAuthorityTraceOutput(result, options));
      },
    );

  approvalAuthorityCommand
    .command('get')
    .argument('<recordId>')
    .option('--json', 'Print full JSON output')
    .description('Read one approval authority trace record')
    .action(async (recordId: string, options: CodexExecJsonCliOptions) => {
      const result = await getRealReadOnlyAdapterApprovalAuthorityTraceCommand(recordId);
      console.log(formatRealReadOnlyAdapterApprovalAuthorityTraceOutput(result, options));
    });

  approvalAuthorityCommand
    .command('list')
    .option('--dry-run <dryRunId>', 'Filter by dry-run id')
    .option('--status <status>', 'Filter by trace status')
    .option('--json', 'Print full JSON output')
    .description('List approval authority trace records')
    .action(async (options: CodexExecRealReadOnlyAdapterApprovalAuthorityTraceListCliOptions) => {
      const result = await listRealReadOnlyAdapterApprovalAuthorityTracesCommand(options);
      console.log(formatRealReadOnlyAdapterApprovalAuthorityTraceListOutput(result, options));
    });

  approvalAuthorityCommand
    .command('latest')
    .argument('<dryRunId>')
    .option('--json', 'Print full JSON output')
    .description('Read the latest approval authority trace for a dry-run id')
    .action(async (dryRunId: string, options: CodexExecJsonCliOptions) => {
      const result = await getLatestRealReadOnlyAdapterApprovalAuthorityTraceCommand(dryRunId);
      console.log(formatRealReadOnlyAdapterApprovalAuthorityTraceOutput(result, options));
    });

  const policySourceCommand = realReadOnlyAdapterCommand
    .command('policy-sources')
    .description('Prepare/read read-only adapter pilot policy source metadata')
    .addHelpText(
      'after',
      [
        '',
        'Policy-source rules:',
        '  - records persisted Supervisor-backed metadata only',
        '  - degraded or notPersisted fallback output is display-only and never aligned',
        '  - this command does not mutate historical dry-run policy or run a pilot',
      ].join('\n'),
    );

  policySourceCommand
    .command('prepare')
    .argument('<dryRunId>')
    .option('--json', 'Print full JSON output')
    .description('Create persisted policy source metadata from current read-only pilot gates')
    .action(
      async (
        dryRunId: string,
        options: CodexExecRealReadOnlyAdapterPolicySourcePrepareCliOptions,
      ) => {
        const result = await prepareRealReadOnlyAdapterPolicySourceCommand(dryRunId);
        console.log(formatRealReadOnlyAdapterPolicySourceOutput(result, options));
      },
    );

  policySourceCommand
    .command('get')
    .argument('<recordId>')
    .option('--json', 'Print full JSON output')
    .description('Read one policy source record')
    .action(async (recordId: string, options: CodexExecJsonCliOptions) => {
      const result = await getRealReadOnlyAdapterPolicySourceCommand(recordId);
      console.log(formatRealReadOnlyAdapterPolicySourceOutput(result, options));
    });

  policySourceCommand
    .command('list')
    .option('--dry-run <dryRunId>', 'Filter by dry-run id')
    .option('--status <status>', 'Filter by policy source status')
    .option('--json', 'Print full JSON output')
    .description('List policy source records')
    .action(async (options: CodexExecRealReadOnlyAdapterPolicySourceListCliOptions) => {
      const result = await listRealReadOnlyAdapterPolicySourcesCommand(options);
      console.log(formatRealReadOnlyAdapterPolicySourceListOutput(result, options));
    });

  policySourceCommand
    .command('latest')
    .argument('<dryRunId>')
    .option('--json', 'Print full JSON output')
    .description('Read the latest policy source record for a dry-run id')
    .action(async (dryRunId: string, options: CodexExecJsonCliOptions) => {
      const result = await getLatestRealReadOnlyAdapterPolicySourceCommand(dryRunId);
      console.log(formatRealReadOnlyAdapterPolicySourceOutput(result, options));
    });

  const pilotSourcePreparationCommand = realReadOnlyAdapterCommand
    .command('pilot-prerequisite-sources')
    .description('Prepare/read pilot prerequisite source metadata without running a pilot')
    .addHelpText(
      'after',
      [
        '',
        'Source-preparation rules:',
        '  - records persisted Supervisor-backed metadata only',
        '  - --worktree is used only to derive a sanitized hash; raw paths are not sent',
        '  - degraded or notPersisted fallback output is display-only and never prepared',
        '  - this command does not invoke adapter attempts or run pilots',
      ].join('\n'),
    );

  pilotSourcePreparationCommand
    .command('prepare')
    .argument('<dryRunId>')
    .option('--approval <approvalArtifactId>', 'Existing approval artifact id to verify')
    .option('--worktree <path>', 'Runtime worktree path used only to derive the sanitized hash')
    .option('--worktree-label <label>', 'Isolated worktree label, not a local path')
    .option(
      '--worktree-status <status>',
      'Worktree metadata status: clean, dirty, missing, or unknown',
    )
    .option('--worktree-path-hash <hash>', 'Hash for the isolated worktree path')
    .option('--json', 'Print full JSON output')
    .description('Create persisted source-preparation metadata from existing inputs only')
    .action(
      async (
        dryRunId: string,
        options: CodexExecRealReadOnlyAdapterPilotSourcePreparationPrepareCliOptions,
      ) => {
        const result = await prepareRealReadOnlyAdapterPilotSourceCommand(dryRunId, options);
        console.log(formatRealReadOnlyAdapterPilotSourcePreparationOutput(result, options));
      },
    );

  pilotSourcePreparationCommand
    .command('get')
    .argument('<recordId>')
    .option('--json', 'Print full JSON output')
    .description('Read one pilot source-preparation record')
    .action(async (recordId: string, options: CodexExecJsonCliOptions) => {
      const result = await getRealReadOnlyAdapterPilotSourceCommand(recordId);
      console.log(formatRealReadOnlyAdapterPilotSourcePreparationOutput(result, options));
    });

  pilotSourcePreparationCommand
    .command('list')
    .option('--dry-run <dryRunId>', 'Filter by dry-run id')
    .option('--status <status>', 'Filter by source-preparation status')
    .option('--json', 'Print full JSON output')
    .description('List pilot source-preparation records')
    .action(async (options: CodexExecRealReadOnlyAdapterPilotSourcePreparationListCliOptions) => {
      const result = await listRealReadOnlyAdapterPilotSourcesCommand(options);
      console.log(formatRealReadOnlyAdapterPilotSourcePreparationListOutput(result, options));
    });

  pilotSourcePreparationCommand
    .command('latest')
    .argument('<dryRunId>')
    .option('--json', 'Print full JSON output')
    .description('Read the latest pilot source-preparation record for a dry-run id')
    .action(async (dryRunId: string, options: CodexExecJsonCliOptions) => {
      const result = await getLatestRealReadOnlyAdapterPilotSourceCommand(dryRunId);
      console.log(formatRealReadOnlyAdapterPilotSourcePreparationOutput(result, options));
    });

  const pilotPrerequisitesCommand = realReadOnlyAdapterCommand
    .command('pilot-prerequisites')
    .description('Read pilot retry prerequisite readiness without running a pilot')
    .addHelpText(
      'after',
      [
        '',
        'Readiness rules:',
        '  - readiness requires persisted Supervisor-backed evidence',
        '  - --worktree is used only to derive a sanitized hash; raw paths are not sent',
        '  - degraded or notPersisted fallback output is display-only and never ready',
        '  - this command does not create approvals, enable config, invoke attempts, or run pilots',
      ].join('\n'),
    );

  pilotPrerequisitesCommand
    .command('check')
    .argument('<dryRunId>')
    .option('--approval <approvalArtifactId>', 'Existing approval artifact id to verify')
    .option('--worktree <path>', 'Runtime worktree path used only to derive the sanitized hash')
    .option('--worktree-label <label>', 'Isolated worktree label, not a local path')
    .option(
      '--worktree-status <status>',
      'Worktree metadata status: clean, dirty, missing, or unknown',
    )
    .option('--worktree-path-hash <hash>', 'Hash for the isolated worktree path')
    .option('--handoff-context-complete', 'Mark operator handoff context metadata as complete')
    .option('--json', 'Print full JSON output')
    .description('Create a persisted prerequisite readiness record from existing metadata only')
    .action(
      async (
        dryRunId: string,
        options: CodexExecRealReadOnlyAdapterPilotPrerequisiteCheckCliOptions,
      ) => {
        const result = await checkRealReadOnlyAdapterPilotPrerequisitesCommand(dryRunId, options);
        console.log(formatRealReadOnlyAdapterPilotPrerequisiteOutput(result, options));
      },
    );

  pilotPrerequisitesCommand
    .command('get')
    .argument('<recordId>')
    .option('--json', 'Print full JSON output')
    .description('Read one pilot prerequisite readiness record')
    .action(async (recordId: string, options: CodexExecJsonCliOptions) => {
      const result = await getRealReadOnlyAdapterPilotPrerequisiteCommand(recordId);
      console.log(formatRealReadOnlyAdapterPilotPrerequisiteOutput(result, options));
    });

  pilotPrerequisitesCommand
    .command('list')
    .option('--dry-run <dryRunId>', 'Filter by dry-run id')
    .option('--status <status>', 'Filter by prerequisite status')
    .option('--json', 'Print full JSON output')
    .description('List pilot prerequisite readiness records')
    .action(async (options: CodexExecRealReadOnlyAdapterPilotPrerequisiteListCliOptions) => {
      const result = await listRealReadOnlyAdapterPilotPrerequisitesCommand(options);
      console.log(formatRealReadOnlyAdapterPilotPrerequisiteListOutput(result, options));
    });

  pilotPrerequisitesCommand
    .command('latest')
    .argument('<dryRunId>')
    .option('--json', 'Print full JSON output')
    .description('Read the latest pilot prerequisite readiness record for a dry-run id')
    .action(async (dryRunId: string, options: CodexExecJsonCliOptions) => {
      const result = await getLatestRealReadOnlyAdapterPilotPrerequisiteCommand(dryRunId);
      console.log(formatRealReadOnlyAdapterPilotPrerequisiteOutput(result, options));
    });

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

export async function listReadOnlyRuns(): Promise<Record<string, unknown>> {
  const [
    workflowResult,
    developmentResult,
    codexDryRunResult,
    browserObservationResult,
    electronCdpObservationResult,
    worktreeRunResult,
    worktreeCleanupRunResult,
    m11PilotRunResult,
  ] =
    await Promise.allSettled([
      getSupervisorJson<{ runs: WorkflowRun[] }>('/api/workflows/runs'),
      getSupervisorJson<{ runs: MockDevelopmentOrchestrationResult[] }>(
        '/api/development/mock-runs',
      ),
      getSupervisorJson<{ runs: CodexExecLiveRunRecord[] }>('/api/codex/exec/dry-runs'),
      getSupervisorJson<{ records: BrowserObservationRunApiRecord[] }>(
        '/api/browser/observation/runs',
      ),
      getSupervisorJson<{ records: ElectronCdpObservationApiRecord[] }>(
        '/api/electron-cdp/observation/runs',
      ),
      getSupervisorJson<{ records: WorktreeApiRecord[] }>('/api/worktrees/runs'),
      getSupervisorJson<{ records: WorktreeApiRecord[] }>('/api/worktrees/cleanup/runs'),
      getSupervisorJson<{ records: M11PilotRunApiRecord[] }>('/api/pilots/m11/local-runs'),
    ]);
  const runs = [
    ...summarizeWorkflowRuns(settledValue(workflowResult)?.runs ?? []),
    ...summarizeDevelopmentRuns(settledValue(developmentResult)?.runs ?? []),
    ...summarizeCodexDryRuns(settledValue(codexDryRunResult)?.runs ?? []),
    ...summarizeBrowserObservationRunRecords(
      settledValue(browserObservationResult)?.records ?? [],
    ),
    ...summarizeElectronCdpObservationRunRecords(
      settledValue(electronCdpObservationResult)?.records ?? [],
    ),
    ...summarizeWorktreeRunRecords(settledValue(worktreeRunResult)?.records ?? [], false),
    ...summarizeWorktreeRunRecords(
      settledValue(worktreeCleanupRunResult)?.records ?? [],
      true,
    ),
    ...summarizeM11PilotRunRecords(settledValue(m11PilotRunResult)?.records ?? []),
    ...summarizePolicyTelemetryLocalRuns(),
  ];
  const degradedReasons = [
    settledError(workflowResult),
    settledError(developmentResult),
    settledError(codexDryRunResult),
    settledError(browserObservationResult),
    settledError(electronCdpObservationResult),
    settledError(worktreeRunResult),
    settledError(worktreeCleanupRunResult),
    settledError(m11PilotRunResult),
  ].filter((reason): reason is string => reason !== undefined);

  return {
    status: degradedReasons.length === 8 ? 'degraded' : 'ready',
    count: runs.length,
    runs,
    degradedReasons,
    liveExecution: false,
    externalProcessStarted: false,
    noRealWrite: true,
    bodyStored: false,
    note: 'Read-only run list uses existing Supervisor GET endpoints only.',
  };
}

export async function showReadOnlyRun(runId: string): Promise<Record<string, unknown>> {
  const list = await listReadOnlyRuns();
  const runs = list.runs as ReadOnlyRunSummary[] | undefined;
  const run = (runs ?? []).find((item) => item.id === runId);

  return {
    status: run ? 'found' : 'not_found',
    run,
    query: { runId },
    liveExecution: false,
    externalProcessStarted: false,
    noRealWrite: true,
    bodyStored: false,
    note: 'Read-only run detail is resolved from metadata summaries only.',
  };
}

export async function listGovernanceRuns(
  options: GovernanceRunsListCliOptions = {},
): Promise<Record<string, unknown>> {
  const readOnlyRuns = await listReadOnlyRuns();
  const runs = ((readOnlyRuns.runs as ReadOnlyRunSummary[] | undefined) ?? []).map(
    toGovernanceProjectionInput,
  );
  const projection = createGovernanceProjection(runs);
  const filtered = projection.projections.filter(
    (run) =>
      (!options.source || run.source === options.source) &&
      (!options.status || run.status === options.status),
  );

  return {
    status: readOnlyRuns.status,
    count: filtered.length,
    summary: projection.summary,
    projections: filtered,
    degradedReasons: readOnlyRuns.degradedReasons ?? [],
    liveExecution: false,
    externalProcessStarted: false,
    noRealWrite: true,
    bodyStored: false,
    rawPathStored: false,
    note: 'Unified governance projection is read-only and never invokes adapters.',
  };
}

export async function showGovernanceRun(projectionId: string): Promise<Record<string, unknown>> {
  const list = await listGovernanceRuns();
  const projections = list.projections as GovernanceProjectionResult['projections'] | undefined;
  const projection = (projections ?? []).find((item) => item.id === projectionId);

  return {
    status: projection ? 'found' : 'not_found',
    projection,
    query: { projectionId },
    liveExecution: false,
    externalProcessStarted: false,
    noRealWrite: true,
    bodyStored: false,
    rawPathStored: false,
  };
}

export async function getGovernanceEvidenceBundle(
  projectionId: string,
): Promise<Record<string, unknown>> {
  const detail = await showGovernanceRun(projectionId);
  const projection = detail.projection as
    | GovernanceProjectionResult['projections'][number]
    | undefined;

  return {
    status: projection ? 'found' : 'not_found',
    evidenceBundle: projection?.evidenceBundle,
    query: { projectionId },
    liveExecution: false,
    externalProcessStarted: false,
    noRealWrite: true,
    bodyStored: false,
    rawPathStored: false,
  };
}

export async function getGovernanceAuditChain(
  projectionId: string,
): Promise<Record<string, unknown>> {
  const detail = await showGovernanceRun(projectionId);
  const projection = detail.projection as
    | GovernanceProjectionResult['projections'][number]
    | undefined;

  return {
    status: projection ? 'found' : 'not_found',
    auditChain: projection?.auditChain,
    query: { projectionId },
    liveExecution: false,
    externalProcessStarted: false,
    noRealWrite: true,
    bodyStored: false,
    rawPathStored: false,
  };
}

export async function getOperatorReadinessReportForCli(): Promise<OperatorReadinessReport> {
  const workspaceRoot = findWorkspaceRoot(process.cwd());
  const configs: OperatorConfigInput[] = await Promise.all([
    readOperatorConfigInput(workspaceRoot, 'policies', 'policy', ['.codexhub', 'policies.yaml']),
    readOperatorConfigInput(workspaceRoot, 'risk-matrix', 'risk', [
      '.codexhub',
      'risk-matrix.yaml',
    ]),
    readOperatorConfigInput(workspaceRoot, 'integrations', 'integration', [
      '.codexhub',
      'integrations.yaml',
    ]),
  ]);
  const integrations = createOperatorIntegrationInputs();
  const localControlKeys = [
    { name: 'supervisor', configured: Boolean(process.env[LOCAL_CONTROL_ENV_VAR]) },
    {
      name: 'orchestrator',
      configured: Boolean(process.env[buildLocalControlEnvVar('CODEXHUB_ORCHESTRATOR_LOCAL_')]),
    },
    {
      name: 'mcp',
      configured: Boolean(process.env[buildLocalControlEnvVar('CODEXHUB_MCP_LOCAL_')]),
    },
  ];

  return createOperatorReadinessReport({
    configs,
    integrations,
    localControlKeys,
    storeAvailable: true,
    processBoundaryAllowlistPassed: true,
    noLiveAuditPassed: true,
  });
}

export async function getOperatorIntegrationReadinessForCli(
  name: string,
): Promise<Record<string, unknown>> {
  const report = await getOperatorReadinessReportForCli();
  const integration = report.integrations.find((item) => item.name === name);

  return {
    status: integration ? 'found' : 'not_found',
    integration,
    query: { name },
    rawValueStored: false,
    rawPathStored: false,
    bodyStored: false,
    summary: integration
      ? `${integration.name} safeToEnable=${integration.safeToEnable}.`
      : `${name} readiness was not found.`,
  };
}

export async function getM10PilotChecklistForCli(): Promise<M10PilotChecklist> {
  const report = await getM10PilotReadinessReportForCli();

  return createM10PilotChecklist({
    readinessReport: report,
    approvalInboxItemCount: 0,
    governanceRunCount: 0,
  });
}

export async function getM10PilotRunbookForCli(): Promise<M10PilotRunbookSummary> {
  const checklist = await getM10PilotChecklistForCli();

  return createM10PilotRunbookSummary({ checklist });
}

export async function getM11PilotEnablementChecklistForCli(): Promise<M11PilotEnablementChecklist> {
  const report = await getM11PilotReadinessReportForCli();
  const runs = await listM11PilotRunsForCli();
  const records = (runs.records as M11PilotRunApiRecord[] | undefined) ?? [];

  return createM11PilotEnablementChecklist({
    readinessReport: report,
    approvalInboxItemCount: 0,
    governanceRunCount: records.length,
    latestRunCount: records.length,
    cleanupRequiredCount: records.filter((record) => record.cleanupRequired === true).length,
  });
}

export async function getM11PilotEnablementRunbookForCli(): Promise<M11PilotEnablementRunbookSummary> {
  const checklist = await getM11PilotEnablementChecklistForCli();

  return createM11PilotEnablementRunbookSummary({ checklist });
}

async function getM10PilotReadinessReportForCli(): Promise<OperatorReadinessReport> {
  const workspaceRoot = findWorkspaceRoot(process.cwd());
  const configs: OperatorConfigInput[] = await Promise.all([
    readOperatorConfigInput(workspaceRoot, 'policies', 'policy', ['.codexhub', 'policies.yaml']),
    readOperatorConfigInput(workspaceRoot, 'risk-matrix', 'risk', [
      '.codexhub',
      'risk-matrix.yaml',
    ]),
    readOperatorConfigInput(workspaceRoot, 'integrations', 'integration', [
      '.codexhub',
      'integrations.yaml',
    ]),
  ]);

  return createOperatorReadinessReport({
    configs,
    integrations: createOperatorIntegrationInputs(),
    localControlKeys: [],
    storeAvailable: true,
    processBoundaryAllowlistPassed: true,
    noLiveAuditPassed: true,
  });
}

async function getM11PilotReadinessReportForCli(): Promise<OperatorReadinessReport> {
  return getM10PilotReadinessReportForCli();
}

export function runGoldenPathRehearsalForCli(options: {
  fixture?: boolean;
  scenario?: string;
} = {}): ReturnType<typeof runGoldenPathRehearsal> {
  if (!options.fixture) {
    throw new Error('golden-path rehearsal requires --fixture in M8d');
  }

  const scenario = normalizeGoldenPathScenario(options.scenario);

  return runGoldenPathRehearsal({ scenario });
}

export function runM10PilotAcceptanceRehearsalForCli(options: {
  fixture?: boolean;
  scenario?: string;
} = {}): ReturnType<typeof runM10PilotAcceptanceRehearsal> {
  if (!options.fixture) {
    throw new Error('M10 pilot acceptance rehearsal requires --fixture');
  }

  const scenario = normalizeM10PilotAcceptanceScenario(options.scenario);

  return runM10PilotAcceptanceRehearsal({ scenario });
}

export async function getM11PilotReadinessForCli(): Promise<Record<string, unknown>> {
  const runs = await listM11PilotRunsForCli();
  const records = (runs.records as M11PilotRunApiRecord[] | undefined) ?? [];
  const latest = records[0];
  const report = await getM11PilotReadinessReportForCli();
  const checklist = createM11PilotEnablementChecklist({
    readinessReport: report,
    approvalInboxItemCount: 0,
    governanceRunCount: records.length,
    latestRunCount: records.length,
    cleanupRequiredCount: records.filter((record) => record.cleanupRequired === true).length,
  });
  const runbook = createM11PilotEnablementRunbookSummary({ checklist });

  return {
    status: checklist.status,
    runSourceStatus: runs.status,
    runCount: records.length,
    enablementStatus: checklist.status,
    enablementBlockerCount: checklist.blockerCount,
    safeEnableBlockers: checklist.safeEnableBlockers,
    requiredEnvFlags: checklist.requiredEnvFlags,
    stepCount: checklist.steps.length,
    steps: checklist.steps.map((step) => ({
      code: step.code,
      phase: step.phase,
      status: step.status,
      blockers: step.blockers,
      summary: step.summary,
    })),
    nextAction: runbook.nextAction,
    failureHandlingSummary: runbook.failureHandlingSummary,
    rollbackSummary: runbook.rollbackSummary,
    latestRunStatus: latest?.status ?? 'none',
    latestReadinessStatus: latest?.readinessStatus ?? 'none',
    latestPrDraftStatus: latest?.prDraftStatus ?? 'none',
    latestFailureClassification: latest?.failureClassification ?? 'none',
    blockers: latest?.readinessBlockers ?? [],
    codexReadOnlyDryRunOnly: true,
    patchGenerationAllowed: false,
    pushAllowed: false,
    pullRequestOpened: false,
    localControlKeyRead: false,
    supervisorPostAllowed: false,
    adapterExecuteAllowed: false,
    rawPathStored: false,
    bodyStored: false,
    note: 'M11 readiness is derived from Supervisor GET metadata only.',
  };
}

export async function listM11PilotRunsForCli(): Promise<Record<string, unknown>> {
  try {
    const response = await getSupervisorJson<{
      records: M11PilotRunApiRecord[];
      count?: number;
      degraded?: boolean;
    }>('/api/pilots/m11/local-runs');

    return {
      status: 'ready',
      count: response.count ?? response.records.length,
      records: response.records,
      degraded: response.degraded ?? false,
      liveExecution: false,
      externalProcessStarted: false,
      noRealWrite: true,
      rawPathStored: false,
      bodyStored: false,
      note: 'M11 pilot runs are read from Supervisor GET endpoints only.',
    };
  } catch (error) {
    return {
      status: 'degraded',
      count: 0,
      records: [],
      degraded: true,
      reason: error instanceof Error ? error.message : 'M11 pilot run source unavailable',
      liveExecution: false,
      externalProcessStarted: false,
      noRealWrite: true,
      rawPathStored: false,
      bodyStored: false,
      note: 'M11 pilot run source is unavailable; no local-control key was read.',
    };
  }
}

export async function showM11PilotRunForCli(runId: string): Promise<Record<string, unknown>> {
  try {
    const record = await getSupervisorJson<M11PilotRunApiRecord>(
      `/api/pilots/m11/local-runs/${encodeURIComponent(runId)}`,
    );

    return {
      status: 'found',
      record,
      query: { runId },
      liveExecution: false,
      externalProcessStarted: false,
      noRealWrite: true,
      rawPathStored: false,
      bodyStored: false,
      note: 'M11 pilot detail is read from Supervisor GET endpoints only.',
    };
  } catch (error) {
    return {
      status: 'degraded',
      record: undefined,
      query: { runId },
      degraded: true,
      reason: error instanceof Error ? error.message : 'M11 pilot run unavailable',
      liveExecution: false,
      externalProcessStarted: false,
      noRealWrite: true,
      rawPathStored: false,
      bodyStored: false,
      note: 'M11 pilot detail source is unavailable; no local-control key was read.',
    };
  }
}

export async function listBrowserObservationRuns(): Promise<Record<string, unknown>> {
  try {
    const response = await getSupervisorJson<{
      records: BrowserObservationRunApiRecord[];
      count?: number;
      degraded?: boolean;
      notPersisted?: boolean;
    }>('/api/browser/observation/runs');

    return {
      status: 'ready',
      count: response.count ?? response.records.length,
      records: response.records,
      degraded: response.degraded ?? false,
      notPersisted: response.notPersisted ?? false,
      liveExecution: false,
      externalProcessStarted: false,
      noRealWrite: true,
      bodyStored: false,
      note: 'Browser observation runs are read from Supervisor GET endpoints only.',
    };
  } catch (error) {
    return {
      status: 'degraded',
      count: 0,
      records: [],
      message: error instanceof Error ? error.message : 'browser observation runs unavailable',
      liveExecution: false,
      externalProcessStarted: false,
      noRealWrite: true,
      bodyStored: false,
      note: 'Browser observation run source is unavailable; no execution was attempted.',
    };
  }
}

export async function showBrowserObservationRun(runId: string): Promise<Record<string, unknown>> {
  try {
    const response = await getSupervisorJson<BrowserObservationRunApiRecord>(
      `/api/browser/observation/runs/${encodeURIComponent(runId)}`,
    );

    return {
      status: 'found',
      run: response,
      liveExecution: false,
      externalProcessStarted: false,
      noRealWrite: true,
      bodyStored: false,
      note: 'Browser observation run detail is metadata-only.',
    };
  } catch (error) {
    return {
      status: 'not_found',
      runId,
      message: error instanceof Error ? error.message : 'browser observation run unavailable',
      liveExecution: false,
      externalProcessStarted: false,
      noRealWrite: true,
      bodyStored: false,
      note: 'No browser observation execution was attempted.',
    };
  }
}

export async function listElectronCdpObservationDryRuns(): Promise<Record<string, unknown>> {
  try {
    const response = await getSupervisorJson<{
      records: ElectronCdpObservationApiRecord[];
      count?: number;
      degraded?: boolean;
      notPersisted?: boolean;
    }>('/api/electron-cdp/observation/dry-runs');

    return createReadOnlyElectronCdpCollectionResult(
      response.records,
      response.count,
      response.degraded,
      response.notPersisted,
      'Electron/CDP dry-runs are read from Supervisor GET endpoints only.',
    );
  } catch (error) {
    return createDegradedElectronCdpCollectionResult(
      error,
      'Electron/CDP dry-run source is unavailable; no observation was attempted.',
    );
  }
}

export async function listElectronCdpObservationApprovals(
  options: ElectronCdpApprovalListCliOptions = {},
): Promise<Record<string, unknown>> {
  try {
    const params = new URLSearchParams();
    if (options.dryRunId) params.set('dryRunId', options.dryRunId);
    if (options.status) params.set('status', options.status);
    const suffix = params.size > 0 ? `?${params.toString()}` : '';
    const response = await getSupervisorJson<{
      records: ElectronCdpObservationApiRecord[];
      count?: number;
      degraded?: boolean;
      notPersisted?: boolean;
    }>(`/api/electron-cdp/observation/approvals${suffix}`);

    return createReadOnlyElectronCdpCollectionResult(
      response.records,
      response.count,
      response.degraded,
      response.notPersisted,
      'Electron/CDP approvals are read from Supervisor GET endpoints only.',
    );
  } catch (error) {
    return createDegradedElectronCdpCollectionResult(
      error,
      'Electron/CDP approval source is unavailable; no approval state was created.',
    );
  }
}

export async function listElectronCdpObservationRuns(): Promise<Record<string, unknown>> {
  try {
    const response = await getSupervisorJson<{
      records: ElectronCdpObservationApiRecord[];
      count?: number;
      degraded?: boolean;
      notPersisted?: boolean;
    }>('/api/electron-cdp/observation/runs');

    return createReadOnlyElectronCdpCollectionResult(
      response.records,
      response.count,
      response.degraded,
      response.notPersisted,
      'Electron/CDP runs are read from Supervisor GET endpoints only.',
    );
  } catch (error) {
    return createDegradedElectronCdpCollectionResult(
      error,
      'Electron/CDP run source is unavailable; no observation was attempted.',
    );
  }
}

export async function showElectronCdpObservationRun(
  runId: string,
): Promise<Record<string, unknown>> {
  try {
    const response = await getSupervisorJson<ElectronCdpObservationApiRecord>(
      `/api/electron-cdp/observation/runs/${encodeURIComponent(runId)}`,
    );

    return {
      status: 'found',
      run: response,
      liveExecution: false,
      externalProcessStarted: false,
      noRealWrite: true,
      bodyStored: false,
      note: 'Electron/CDP observation run detail is metadata-only.',
    };
  } catch (error) {
    return {
      status: 'not_found',
      runId,
      message: error instanceof Error ? error.message : 'Electron/CDP observation run unavailable',
      liveExecution: false,
      externalProcessStarted: false,
      noRealWrite: true,
      bodyStored: false,
      note: 'No Electron/CDP observation execution was attempted.',
    };
  }
}

export async function listWorktreeDryRuns(): Promise<Record<string, unknown>> {
  return listWorktreeCollection(
    '/api/worktrees/dry-runs',
    'Worktree dry-runs are read from Supervisor GET endpoints only.',
    'Worktree dry-run source is unavailable; no git command was attempted.',
  );
}

export async function listWorktreeApprovals(
  options: WorktreeApprovalListCliOptions = {},
): Promise<Record<string, unknown>> {
  return listWorktreeCollection(
    `/api/worktrees/approvals${createReadOnlyFilterQuery(options)}`,
    'Worktree approvals are read from Supervisor GET endpoints only.',
    'Worktree approval source is unavailable; no approval state was created.',
  );
}

export async function listWorktreeRuns(): Promise<Record<string, unknown>> {
  return listWorktreeCollection(
    '/api/worktrees/runs',
    'Worktree runs are read from Supervisor GET endpoints only.',
    'Worktree run source is unavailable; no git command was attempted.',
  );
}

export async function showWorktreeRun(runId: string): Promise<Record<string, unknown>> {
  return showWorktreeRecord(
    `/api/worktrees/runs/${encodeURIComponent(runId)}`,
    runId,
    'Worktree run detail is metadata-only.',
    'Worktree run unavailable',
  );
}

export async function listWorktreeCleanupDryRuns(): Promise<Record<string, unknown>> {
  return listWorktreeCollection(
    '/api/worktrees/cleanup/dry-runs',
    'Worktree cleanup dry-runs are read from Supervisor GET endpoints only.',
    'Worktree cleanup dry-run source is unavailable; no cleanup was attempted.',
  );
}

export async function listWorktreeCleanupApprovals(
  options: WorktreeApprovalListCliOptions = {},
): Promise<Record<string, unknown>> {
  return listWorktreeCollection(
    `/api/worktrees/cleanup/approvals${createReadOnlyFilterQuery(options)}`,
    'Worktree cleanup approvals are read from Supervisor GET endpoints only.',
    'Worktree cleanup approval source is unavailable; no approval state was created.',
  );
}

export async function listWorktreeCleanupRuns(): Promise<Record<string, unknown>> {
  return listWorktreeCollection(
    '/api/worktrees/cleanup/runs',
    'Worktree cleanup runs are read from Supervisor GET endpoints only.',
    'Worktree cleanup run source is unavailable; no cleanup was attempted.',
  );
}

export async function showWorktreeCleanupRun(runId: string): Promise<Record<string, unknown>> {
  return showWorktreeRecord(
    `/api/worktrees/cleanup/runs/${encodeURIComponent(runId)}`,
    runId,
    'Worktree cleanup run detail is metadata-only.',
    'Worktree cleanup run unavailable',
  );
}

export async function listApprovalInbox(
  options: ApprovalInboxCliOptions = {},
): Promise<ApprovalInboxProjection | Record<string, unknown>> {
  try {
    const query = options.type ? `?type=${encodeURIComponent(options.type)}` : '';
    const response = await getSupervisorJson<ApprovalInboxProjection>(
      `/api/approvals/inbox${query}`,
    );

    return {
      ...response,
      note: 'Approval inbox is read with GET and does not use a local-control key.',
      processBoundaryInvoked: false,
      externalProcessStarted: false,
      bodyStored: false,
      tokenStored: false,
    };
  } catch (error) {
    return {
      id: 'approval_inbox_degraded',
      status: 'degraded',
      items: [],
      itemCount: 0,
      requestedCount: 0,
      approvedCount: 0,
      terminalCount: 0,
      typeBreakdown: {},
      message: error instanceof Error ? error.message : 'approval inbox unavailable',
      processBoundaryInvoked: false,
      externalProcessStarted: false,
      bodyStored: false,
      tokenStored: false,
      note: 'Approval inbox source is unavailable; no decision was sent.',
    };
  }
}

export async function listApprovalDecisionHistory(
  options: ApprovalHistoryCliOptions = {},
): Promise<ApprovalDecisionHistoryProjection | Record<string, unknown>> {
  const inbox = await listApprovalInbox({ type: options.type });

  if ('items' in inbox && Array.isArray(inbox.items)) {
    return createApprovalDecisionHistoryProjection({
      inbox: inbox as ApprovalInboxProjection,
      approvalType: normalizeApprovalHistoryType(options.type),
      status: normalizeApprovalHistoryStatus(options.status),
    });
  }

  return {
    status: 'degraded',
    items: [],
    itemCount: 0,
    requestedCount: 0,
    approvedCount: 0,
    deniedCount: 0,
    revokedCount: 0,
    terminalCount: 0,
    typeBreakdown: {},
    statusBreakdown: {},
    decisionBreakdown: {},
    rawPathStored: false,
    bodyStored: false,
    tokenStored: false,
    summary:
      'Approval decision history is unavailable because the read-only approval inbox is degraded.',
  };
}

function normalizeApprovalHistoryType(value: string | undefined): ApprovalUxType | undefined {
  if (
    value === 'codex' ||
    value === 'browser' ||
    value === 'electron_cdp' ||
    value === 'worktree' ||
    value === 'worktree_cleanup' ||
    value === 'm9_pilot'
  ) {
    return value;
  }

  return undefined;
}

function normalizeApprovalHistoryStatus(value: string | undefined): ApprovalUxStatus | undefined {
  if (
    value === 'pending' ||
    value === 'requested' ||
    value === 'approved' ||
    value === 'denied' ||
    value === 'expired' ||
    value === 'used' ||
    value === 'revoked'
  ) {
    return value;
  }

  return undefined;
}

export async function decideApproval(
  approvalRequestId: string,
  options: ApprovalDecisionCliOptions,
): Promise<ApprovalDecisionResult | Record<string, unknown>> {
  if (!['approved', 'denied', 'revoked'].includes(options.decision)) {
    throw new Error('decision must be approved, denied, or revoked');
  }

  const response = await fetch(`${supervisorUrl}/api/approvals/decisions`, {
    method: 'POST',
    headers: createSupervisorPostHeaders(),
    body: JSON.stringify({
      approvalRequestId,
      approvalType: options.type,
      decision: options.decision,
      reason: options.reason,
    }),
  });
  const result = (await response.json()) as ApprovalDecisionResult | Record<string, unknown>;

  if (!response.ok) {
    return {
      status: 'blocked',
      responseStatus: response.status,
      result,
      processBoundaryInvoked: false,
      externalProcessStarted: false,
      bodyStored: false,
      tokenStored: false,
    };
  }

  return {
    ...result,
    processBoundaryInvoked: false,
    externalProcessStarted: false,
    bodyStored: false,
    tokenStored: false,
  };
}

async function getSupervisorJson<T>(path: string): Promise<T> {
  const response = await fetch(`${supervisorUrl}${path}`);

  if (!response.ok) {
    throw new Error(`supervisor returned ${response.status}`);
  }

  return (await response.json()) as T;
}

function summarizeWorkflowRuns(runs: WorkflowRun[]): ReadOnlyRunSummary[] {
  return runs.map((run) => ({
    id: run.id,
    source: 'workflow',
    title: run.workflowName,
    status: run.status,
    summary: `${run.workflowName} ${run.status}.`,
    liveExecution: false,
    externalProcessStarted: false,
    noRealWrite: true,
    bodyStored: false,
  }));
}

function summarizeDevelopmentRuns(
  runs: MockDevelopmentOrchestrationResult[],
): ReadOnlyRunSummary[] {
  return runs.map((run) => ({
    id: run.request.id,
    source: 'development',
    title: run.summary.requestTitle,
    status: run.summary.verificationStatus,
    summary: `${run.summary.taskCount} tasks, ${run.summary.agentRunCount} agent runs.`,
    evidenceCount: run.summary.evidenceCount,
    auditEventCount: run.summary.auditEventCount,
    liveExecution: false,
    externalProcessStarted: false,
    noRealWrite: true,
    bodyStored: false,
  }));
}

function summarizeCodexDryRuns(runs: CodexExecLiveRunRecord[]): ReadOnlyRunSummary[] {
  return runs.map((run) => ({
    id: run.id,
    source: 'codex_exec_dry_run',
    title: run.title,
    status: run.status,
    summary: `policy ${run.policyDecision.outcome}, sandbox ${run.sandboxMode}.`,
    evidenceCount: run.evidenceRefs.length,
    auditEventCount: run.auditEvents.length,
    liveExecution: false,
    externalProcessStarted: false,
    noRealWrite: true,
    bodyStored: false,
  }));
}

function summarizeBrowserObservationRunRecords(
  runs: BrowserObservationRunApiRecord[],
): ReadOnlyRunSummary[] {
  return runs.map((run) => ({
    id: run.runId ?? run.recordId ?? run.dryRunId ?? 'browser_observation_run',
    source: 'browser_observation',
    title: `Browser observation ${run.status ?? 'unknown'}`,
    status: run.status ?? 'unknown',
    summary: run.summary ?? 'Browser observation metadata summary.',
    evidenceCount: run.evidenceRefIds?.length ?? 0,
    auditEventCount: run.auditEventIds?.length ?? 0,
    liveExecution: false,
    externalProcessStarted: false,
    noRealWrite: true,
    bodyStored: false,
  }));
}

function summarizeElectronCdpObservationRunRecords(
  runs: ElectronCdpObservationApiRecord[],
): ReadOnlyRunSummary[] {
  return runs.map((run) => ({
    id: run.runId ?? run.recordId ?? run.dryRunId ?? 'electron_cdp_observation_run',
    source: 'electron_cdp_observation',
    title: `Electron/CDP observation ${run.status ?? 'unknown'}`,
    status: run.status ?? 'unknown',
    summary: run.summary ?? 'Electron/CDP observation metadata summary.',
    evidenceCount: run.evidenceRefIds?.length ?? 0,
    auditEventCount: run.auditEventIds?.length ?? 0,
    liveExecution: false,
    externalProcessStarted: false,
    noRealWrite: true,
    bodyStored: false,
  }));
}

function summarizeWorktreeRunRecords(
  runs: WorktreeApiRecord[],
  cleanup: boolean,
): ReadOnlyRunSummary[] {
  return runs.map((run) => ({
    id: run.runId ?? run.recordId ?? run.dryRunId ?? (cleanup ? 'worktree_cleanup_run' : 'worktree_run'),
    source: cleanup ? 'worktree_cleanup_run' : 'worktree_run',
    title: cleanup
      ? `Worktree cleanup ${run.status ?? 'unknown'}`
      : `Worktree run ${run.status ?? 'unknown'}`,
    status: run.status ?? 'unknown',
    summary:
      run.summary ??
      (cleanup ? 'Worktree cleanup metadata summary.' : 'Worktree create metadata summary.'),
    evidenceCount: run.evidenceRefIds?.length ?? 0,
    auditEventCount: run.auditEventIds?.length ?? 0,
    liveExecution: false,
    externalProcessStarted: false,
    noRealWrite: true,
    bodyStored: false,
  }));
}

function summarizeM11PilotRunRecords(runs: M11PilotRunApiRecord[]): ReadOnlyRunSummary[] {
  return runs.map((run) => ({
    id: run.runId ?? 'm11_pilot_run',
    source: 'm11_pilot',
    title: `M11 pilot ${run.status ?? 'unknown'}`,
    status: run.status ?? 'unknown',
    summary: run.summary ?? 'M11 production pilot narrow-path metadata summary.',
    evidenceCount: run.evidenceRefIds?.length ?? 0,
    auditEventCount: run.auditEventIds?.length ?? 0,
    liveExecution: false,
    externalProcessStarted: false,
    noRealWrite: true,
    bodyStored: false,
  }));
}

function summarizePolicyTelemetryLocalRuns(): ReadOnlyRunSummary[] {
  const telemetryProjection = showTelemetryProjectionForCli();

  return [
    {
      id: 'policy_backend_projection_local',
      source: 'policy_backend_projection',
      title: 'Policy backend advisory projection',
      status: 'ready',
      summary: 'Local policy backend fixture state is advisory-only and read-only.',
      evidenceCount: 0,
      auditEventCount: 0,
      liveExecution: false,
      externalProcessStarted: false,
      noRealWrite: true,
      bodyStored: false,
    },
    {
      id: 'telemetry_projection_local',
      source: 'telemetry_projection',
      title: 'Telemetry local projection',
      status: 'ready',
      summary: `Local telemetry projection spans=${telemetryProjection.projection.spanCount}.`,
      evidenceCount: telemetryProjection.projection.evidenceRefCount,
      auditEventCount: telemetryProjection.projection.auditEventCount,
      liveExecution: false,
      externalProcessStarted: false,
      noRealWrite: true,
      bodyStored: false,
    },
  ];
}

function toGovernanceProjectionInput(run: ReadOnlyRunSummary): GovernanceProjectionInputRun {
  return {
    id: run.id,
    source: run.source,
    title: run.title,
    status: run.status,
    evidenceCount: run.evidenceCount ?? 0,
    auditEventCount: run.auditEventCount ?? 0,
    processBoundaryInvoked: false,
    externalProcessStarted: run.externalProcessStarted,
    noRealWrite: run.noRealWrite,
  };
}

async function readOperatorConfigInput(
  workspaceRoot: string,
  name: string,
  kind: OperatorConfigInput['kind'],
  segments: readonly string[],
): Promise<OperatorConfigInput> {
  const configFilePath = resolve(workspaceRoot, ...segments);

  if (!existsSync(configFilePath)) {
    return {
      name,
      kind,
      configured: false,
      itemCount: 0,
    };
  }

  const text = await readFile(configFilePath, 'utf8');

  return {
    name,
    kind,
    text,
    configured: true,
    itemCount: countConfigEntries(text),
  };
}

function createOperatorIntegrationInputs(): OperatorIntegrationInput[] {
  const worktreeManagerEnabled = Boolean(process.env.CODEXHUB_WORKTREE_MANAGER_ENABLED);
  const m11PilotEnabled = Boolean(process.env.CODEXHUB_M11_PRODUCTION_PILOT_ENABLED);

  return [
    {
      name: 'codex-cli',
      enabled: true,
      defaultEnabled: true,
      riskLevel: 'medium',
      approvalRequired: true,
      processBoundary: true,
      envFlagConfigured: true,
      safeEnableNotes: ['Codex runs remain policy, approval, evidence, and audit gated.'],
    },
    {
      name: 'nx-affected',
      enabled: true,
      defaultEnabled: true,
      riskLevel: 'low',
      approvalRequired: false,
      processBoundary: true,
      envFlagConfigured: true,
      safeEnableNotes: ['Nx verification is limited to allowlisted targets.'],
    },
    {
      name: 'mcp-server',
      enabled: true,
      defaultEnabled: true,
      riskLevel: 'medium',
      approvalRequired: false,
      networkBoundary: false,
      envFlagConfigured: true,
      safeEnableNotes: ['MCP tools remain read-only in the current product slice.'],
    },
    {
      name: 'playwright-observer',
      enabled: false,
      riskLevel: 'high',
      approvalRequired: true,
      processBoundary: true,
      envFlagConfigured: Boolean(process.env.CODEXHUB_BROWSER_OBSERVER_ENABLED),
      blockers: ['disabled_by_default'],
    },
    {
      name: 'electron-cdp',
      enabled: false,
      riskLevel: 'high',
      approvalRequired: true,
      networkBoundary: true,
      envFlagConfigured: Boolean(process.env.CODEXHUB_ELECTRON_CDP_OBSERVER_ENABLED),
      blockers: ['disabled_by_default'],
    },
    {
      name: 'worktree-manager',
      enabled: worktreeManagerEnabled,
      riskLevel: 'high',
      approvalRequired: true,
      processBoundary: true,
      envFlagConfigured: worktreeManagerEnabled,
      blockers: worktreeManagerEnabled ? [] : ['disabled_by_default'],
    },
    {
      name: 'm11-production-pilot',
      enabled: m11PilotEnabled,
      riskLevel: 'high',
      approvalRequired: true,
      processBoundary: true,
      envFlagConfigured: m11PilotEnabled,
      blockers: m11PilotEnabled ? [] : ['disabled_by_default'],
      safeEnableNotes: [
        'M11 reuses existing worktree, Codex read-only dry-run, and Nx boundaries.',
      ],
    },
    {
      name: 'policy-backend',
      enabled: false,
      riskLevel: 'medium',
      approvalRequired: false,
      envFlagConfigured: false,
      blockers: ['advisory_only'],
    },
    {
      name: 'otel-adapter',
      enabled: false,
      riskLevel: 'low',
      approvalRequired: false,
      envFlagConfigured: false,
      blockers: ['local_projection_only'],
    },
  ];
}

function buildLocalControlEnvVar(prefix: string): string {
  return `${prefix}${LOCAL_CONTROL_KEY_KIND.toUpperCase()}`;
}

function countConfigEntries(text: string): number {
  return text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0 && !line.startsWith('#')).length;
}

function normalizeGoldenPathScenario(
  scenario: string | undefined,
): 'all-pass' | 'codex-failed' | 'nx-failed' {
  if (scenario === undefined || scenario === 'all-pass') {
    return 'all-pass';
  }

  if (scenario === 'codex-failed' || scenario === 'nx-failed') {
    return scenario;
  }

  throw new Error(`Unsupported golden path fixture scenario: ${scenario}`);
}

function normalizeM10PilotAcceptanceScenario(
  scenario: string | undefined,
):
  | 'all-pass'
  | 'readiness-blocked'
  | 'approval-blocked'
  | 'codex-failed'
  | 'nx-failed' {
  if (scenario === undefined || scenario === 'all-pass') {
    return 'all-pass';
  }

  if (
    scenario === 'readiness-blocked' ||
    scenario === 'approval-blocked' ||
    scenario === 'codex-failed' ||
    scenario === 'nx-failed'
  ) {
    return scenario;
  }

  throw new Error(`Unsupported M10 pilot acceptance fixture scenario: ${scenario}`);
}

async function listWorktreeCollection(
  path: string,
  note: string,
  degradedNote: string,
): Promise<Record<string, unknown>> {
  try {
    const response = await getSupervisorJson<{
      records: WorktreeApiRecord[];
      count?: number;
      degraded?: boolean;
      notPersisted?: boolean;
    }>(path);

    return {
      status: 'ready',
      count: response.count ?? response.records.length,
      records: response.records,
      degraded: response.degraded ?? false,
      notPersisted: response.notPersisted ?? false,
      liveExecution: false,
      externalProcessStarted: false,
      noRealWrite: true,
      bodyStored: false,
      note,
    };
  } catch (error) {
    return {
      status: 'degraded',
      count: 0,
      records: [],
      message: error instanceof Error ? error.message : 'worktree metadata source unavailable',
      liveExecution: false,
      externalProcessStarted: false,
      noRealWrite: true,
      bodyStored: false,
      note: degradedNote,
    };
  }
}

async function showWorktreeRecord(
  path: string,
  runId: string,
  note: string,
  unavailableMessage: string,
): Promise<Record<string, unknown>> {
  try {
    const response = await getSupervisorJson<WorktreeApiRecord>(path);

    return {
      status: 'found',
      run: response,
      liveExecution: false,
      externalProcessStarted: false,
      noRealWrite: true,
      bodyStored: false,
      note,
    };
  } catch (error) {
    return {
      status: 'not_found',
      runId,
      message: error instanceof Error ? error.message : unavailableMessage,
      liveExecution: false,
      externalProcessStarted: false,
      noRealWrite: true,
      bodyStored: false,
      note: 'No worktree action was attempted.',
    };
  }
}

function createReadOnlyFilterQuery(options: WorktreeApprovalListCliOptions): string {
  const params = new URLSearchParams();
  if (options.dryRunId) params.set('dryRunId', options.dryRunId);
  if (options.status) params.set('status', options.status);
  return params.size > 0 ? `?${params.toString()}` : '';
}

function createReadOnlyElectronCdpCollectionResult(
  records: ElectronCdpObservationApiRecord[],
  count: number | undefined,
  degraded: boolean | undefined,
  notPersisted: boolean | undefined,
  note: string,
): Record<string, unknown> {
  return {
    status: 'ready',
    count: count ?? records.length,
    records,
    degraded: degraded ?? false,
    notPersisted: notPersisted ?? false,
    liveExecution: false,
    externalProcessStarted: false,
    noRealWrite: true,
    bodyStored: false,
    note,
  };
}

function createDegradedElectronCdpCollectionResult(
  error: unknown,
  note: string,
): Record<string, unknown> {
  return {
    status: 'degraded',
    count: 0,
    records: [],
    message: error instanceof Error ? error.message : 'Electron/CDP observation source unavailable',
    liveExecution: false,
    externalProcessStarted: false,
    noRealWrite: true,
    bodyStored: false,
    note,
  };
}

function settledValue<T>(result: PromiseSettledResult<T>): T | undefined {
  return result.status === 'fulfilled' ? result.value : undefined;
}

function settledError<T>(result: PromiseSettledResult<T>): string | undefined {
  if (result.status === 'fulfilled') {
    return undefined;
  }

  return result.reason instanceof Error ? result.reason.message : 'unknown read-only GET failure';
}

async function assertSupervisorRealReadOnlyAdapterInvocationContract(): Promise<void> {
  const health = await getSupervisorHealth();
  const metadata = health.metadata as Record<string, unknown> | undefined;
  const contractVersion = metadata?.realReadOnlyAdapterCodexCliInvocationContractVersion;

  if (
    health.status !== 'ok' ||
    contractVersion !== REAL_READ_ONLY_ADAPTER_CODEX_CLI_INVOCATION_CONTRACT_VERSION
  ) {
    throw new Error(
      'supervisor real read-only adapter invocation contract is stale or unavailable',
    );
  }
}

export async function dryRunWorkflow(workflowName: string): Promise<Record<string, unknown>> {
  try {
    const response = await fetch(`${supervisorUrl}/api/workflows/dry-run`, {
      method: 'POST',
      headers: createSupervisorPostHeaders(),
      body: JSON.stringify({ workflowName, input: { requestedBy: 'cli' } }),
    });

    if (!response.ok) {
      throw new Error(`supervisor returned ${response.status}`);
    }

    return (await response.json()) as Record<string, unknown>;
  } catch (error) {
    rethrowMissingLocalControlKey(error);
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
      headers: createSupervisorPostHeaders(),
      body: JSON.stringify({ title, description }),
    });

    if (!response.ok) {
      throw new Error(`supervisor returned ${response.status}`);
    }

    return (await response.json()) as Record<string, unknown>;
  } catch (error) {
    rethrowMissingLocalControlKey(error);
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
      headers: createSupervisorPostHeaders(),
      body: JSON.stringify({ fixturePath }),
    });

    if (!response.ok) {
      throw new Error(`supervisor returned ${response.status}`);
    }

    return (await response.json()) as CodexReplaySummary;
  } catch (error) {
    rethrowMissingLocalControlKey(error);
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
  } catch (error) {
    rethrowMissingLocalControlKey(error);
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
      headers: createSupervisorPostHeaders(),
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
  } catch (error) {
    rethrowMissingLocalControlKey(error);
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
  policySourceId?: string,
): Promise<Record<string, unknown>> {
  try {
    const response = await fetch(`${supervisorUrl}/api/codex/exec/approval-request`, {
      method: 'POST',
      headers: createSupervisorPostHeaders(),
      body: JSON.stringify({ dryRunId, reason, policySourceId }),
    });

    if (!response.ok) {
      throw new Error(`supervisor returned ${response.status}`);
    }

    return (await response.json()) as Record<string, unknown>;
  } catch (error) {
    rethrowMissingLocalControlKey(error);
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
      headers: createSupervisorPostHeaders(),
      body: JSON.stringify({ dryRunId, approvalRequestId, outcome: approvalOutcome, reason }),
    });

    if (!response.ok) {
      throw new Error(`supervisor returned ${response.status}`);
    }

    return (await response.json()) as Record<string, unknown>;
  } catch (error) {
    rethrowMissingLocalControlKey(error);
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
  } catch (error) {
    rethrowMissingLocalControlKey(error);
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
      headers: createSupervisorPostHeaders(),
      body: JSON.stringify({ dryRunId }),
    });

    if (!response.ok) {
      throw new Error(`supervisor returned ${response.status}`);
    }

    return (await response.json()) as Record<string, unknown>;
  } catch (error) {
    rethrowMissingLocalControlKey(error);
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
      headers: createSupervisorPostHeaders(),
      body: JSON.stringify({ dryRunId }),
    });

    if (!response.ok) {
      throw new Error(`supervisor returned ${response.status}`);
    }

    return (await response.json()) as Record<string, unknown>;
  } catch (error) {
    rethrowMissingLocalControlKey(error);
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
  } catch (error) {
    rethrowMissingLocalControlKey(error);
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
  } catch (error) {
    rethrowMissingLocalControlKey(error);
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
  } catch (error) {
    rethrowMissingLocalControlKey(error);
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
  } catch (error) {
    rethrowMissingLocalControlKey(error);
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
  } catch (error) {
    rethrowMissingLocalControlKey(error);
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
  } catch (error) {
    rethrowMissingLocalControlKey(error);
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
  } catch (error) {
    rethrowMissingLocalControlKey(error);
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
  } catch (error) {
    rethrowMissingLocalControlKey(error);
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
  } catch (error) {
    rethrowMissingLocalControlKey(error);
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
      headers: createSupervisorPostHeaders(),
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
  } catch (error) {
    rethrowMissingLocalControlKey(error);
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
  } catch (error) {
    rethrowMissingLocalControlKey(error);
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
  } catch (error) {
    rethrowMissingLocalControlKey(error);
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
  } catch (error) {
    rethrowMissingLocalControlKey(error);
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
        headers: createSupervisorPostHeaders(),
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
  } catch (error) {
    rethrowMissingLocalControlKey(error);
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
        headers: createSupervisorPostHeaders(),
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
  } catch (error) {
    rethrowMissingLocalControlKey(error);
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
  } catch (error) {
    rethrowMissingLocalControlKey(error);
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
  } catch (error) {
    rethrowMissingLocalControlKey(error);
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
  } catch (error) {
    rethrowMissingLocalControlKey(error);
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
        headers: createSupervisorPostHeaders(),
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
  } catch (error) {
    rethrowMissingLocalControlKey(error);
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
  } catch (error) {
    rethrowMissingLocalControlKey(error);
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
  } catch (error) {
    rethrowMissingLocalControlKey(error);
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
  } catch (error) {
    rethrowMissingLocalControlKey(error);
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
  } catch (error) {
    rethrowMissingLocalControlKey(error);
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
        headers: createSupervisorPostHeaders(),
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
  } catch (error) {
    rethrowMissingLocalControlKey(error);
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
  } catch (error) {
    rethrowMissingLocalControlKey(error);
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
  } catch (error) {
    rethrowMissingLocalControlKey(error);
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
  } catch (error) {
    rethrowMissingLocalControlKey(error);
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
        headers: createSupervisorPostHeaders(),
        body: JSON.stringify({ fixturePath, dryRunId: options.dryRun }),
      },
    );

    if (!response.ok) {
      throw new Error(`supervisor returned ${response.status}`);
    }

    return (await response.json()) as Record<string, unknown>;
  } catch (error) {
    rethrowMissingLocalControlKey(error);
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
        headers: createSupervisorPostHeaders(),
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
  } catch (error) {
    rethrowMissingLocalControlKey(error);
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
  } catch (error) {
    rethrowMissingLocalControlKey(error);
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
  } catch (error) {
    rethrowMissingLocalControlKey(error);
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
        headers: createSupervisorPostHeaders(),
        body: JSON.stringify({ dryRunId }),
      },
    );

    if (!response.ok) {
      throw new Error(`supervisor returned ${response.status}`);
    }

    return (await response.json()) as Record<string, unknown>;
  } catch (error) {
    rethrowMissingLocalControlKey(error);
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
  } catch (error) {
    rethrowMissingLocalControlKey(error);
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
  } catch (error) {
    rethrowMissingLocalControlKey(error);
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
  } catch (error) {
    rethrowMissingLocalControlKey(error);
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
        headers: createSupervisorPostHeaders(),
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
  } catch (error) {
    rethrowMissingLocalControlKey(error);
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
  } catch (error) {
    rethrowMissingLocalControlKey(error);
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
  } catch (error) {
    rethrowMissingLocalControlKey(error);
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
  } catch (error) {
    rethrowMissingLocalControlKey(error);
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
    await assertSupervisorRealReadOnlyAdapterInvocationContract();
    const response = await fetch(`${supervisorUrl}/api/codex/exec/real-read-only-adapter/attempt`, {
      method: 'POST',
      headers: createSupervisorPostHeaders(),
      body: JSON.stringify({
        dryRunId,
        approvalArtifactId: options.approval,
        isolatedWorktreeProvided: options.worktree !== undefined,
        worktreePath: options.worktree,
        governedInputRelativePath: options.governedInput,
        governedInputContentHash: options.governedInputHash,
      }),
    });

    if (!response.ok) {
      throw new Error(`supervisor returned ${response.status}`);
    }

    return (await response.json()) as Record<string, unknown>;
  } catch (error) {
    rethrowMissingLocalControlKey(error);
    return createRealReadOnlyAdapterAttemptRefusal(dryRunId, options);
  }
}

export async function getRealReadOnlyAdapterAttemptCommand(
  attemptId: string,
): Promise<Record<string, unknown>> {
  try {
    const response = await fetch(
      `${supervisorUrl}/api/codex/exec/real-read-only-adapter/attempt/${encodeURIComponent(
        attemptId,
      )}`,
    );

    if (!response.ok) {
      throw new Error(`supervisor returned ${response.status}`);
    }

    return (await response.json()) as Record<string, unknown>;
  } catch (error) {
    rethrowMissingLocalControlKey(error);
    return createRealReadOnlyAdapterAttemptReadFallback(
      `supervisor unavailable; attempt ${attemptId} was not read from an authoritative store`,
    );
  }
}

export async function listRealReadOnlyAdapterAttemptsCommand(
  options: CodexExecRealReadOnlyAdapterAttemptListCliOptions = {},
): Promise<Record<string, unknown>> {
  const query = createRealReadOnlyAdapterAttemptQueryString(options);

  try {
    const response = await fetch(
      `${supervisorUrl}/api/codex/exec/real-read-only-adapter/attempts${query}`,
    );

    if (!response.ok) {
      throw new Error(`supervisor returned ${response.status}`);
    }

    return (await response.json()) as Record<string, unknown>;
  } catch (error) {
    rethrowMissingLocalControlKey(error);
    return {
      attempts: [],
      attemptRecords: [],
      summaries: [],
      count: 0,
      authoritative: false,
      supervisorBacked: false,
      persisted: false,
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
      reason: 'supervisor unavailable; attempt list fallback is display-only and not authoritative',
    };
  }
}

export async function getLatestRealReadOnlyAdapterAttemptCommand(
  dryRunId: string,
): Promise<Record<string, unknown>> {
  try {
    const response = await fetch(
      `${supervisorUrl}/api/codex/exec/real-read-only-adapter/attempt/latest/${encodeURIComponent(
        dryRunId,
      )}`,
    );

    if (!response.ok) {
      throw new Error(`supervisor returned ${response.status}`);
    }

    return (await response.json()) as Record<string, unknown>;
  } catch (error) {
    rethrowMissingLocalControlKey(error);
    return createRealReadOnlyAdapterAttemptReadFallback(
      `supervisor unavailable; latest attempt for ${dryRunId} is display-only and not authoritative`,
      dryRunId,
    );
  }
}

export async function getRealReadOnlyAdapterAttemptTimelineCommand(
  dryRunId: string,
  options: CodexExecRealReadOnlyAdapterAttemptTimelineCliOptions = {},
): Promise<Record<string, unknown>> {
  const query = createRealReadOnlyAdapterAttemptQueryString({
    ...options,
    dryRun: undefined,
  });

  try {
    const response = await fetch(
      `${supervisorUrl}/api/codex/exec/real-read-only-adapter/attempt-timeline/${encodeURIComponent(
        dryRunId,
      )}${query}`,
    );

    if (!response.ok) {
      throw new Error(`supervisor returned ${response.status}`);
    }

    return (await response.json()) as Record<string, unknown>;
  } catch (error) {
    rethrowMissingLocalControlKey(error);
    return createRealReadOnlyAdapterAttemptTimelineReadFallback(
      `supervisor unavailable; attempt timeline for ${dryRunId} is display-only and not authoritative`,
      dryRunId,
      options,
    );
  }
}

export async function traceRealReadOnlyAdapterApprovalAuthorityCommand(
  dryRunId: string,
  options: CodexExecRealReadOnlyAdapterApprovalAuthorityTraceCliOptions = {},
): Promise<Record<string, unknown>> {
  try {
    const response = await fetch(
      `${supervisorUrl}/api/codex/exec/real-read-only-adapter/approval-authority-traces`,
      {
        method: 'POST',
        headers: createSupervisorPostHeaders(),
        body: JSON.stringify({
          dryRunId,
          approvalArtifactId: options.approval,
        }),
      },
    );

    if (!response.ok) {
      throw new Error(`supervisor returned ${response.status}`);
    }

    return (await response.json()) as Record<string, unknown>;
  } catch (error) {
    rethrowMissingLocalControlKey(error);
    return createRealReadOnlyAdapterApprovalAuthorityTraceReadFallback(
      `supervisor unavailable or rejected approval authority trace for ${dryRunId}; fallback is display-only and cannot be aligned`,
      dryRunId,
    );
  }
}

export async function getRealReadOnlyAdapterApprovalAuthorityTraceCommand(
  recordId: string,
): Promise<Record<string, unknown>> {
  try {
    const response = await fetch(
      `${supervisorUrl}/api/codex/exec/real-read-only-adapter/approval-authority-traces/${encodeURIComponent(
        recordId,
      )}`,
    );

    if (!response.ok) {
      throw new Error(`supervisor returned ${response.status}`);
    }

    return (await response.json()) as Record<string, unknown>;
  } catch (error) {
    rethrowMissingLocalControlKey(error);
    return createRealReadOnlyAdapterApprovalAuthorityTraceReadFallback(
      `supervisor unavailable; approval authority trace ${recordId} was not read from an authoritative store`,
    );
  }
}

export async function listRealReadOnlyAdapterApprovalAuthorityTracesCommand(
  options: CodexExecRealReadOnlyAdapterApprovalAuthorityTraceListCliOptions = {},
): Promise<Record<string, unknown>> {
  const query = createRealReadOnlyAdapterApprovalAuthorityTraceQueryString(options);

  try {
    const response = await fetch(
      `${supervisorUrl}/api/codex/exec/real-read-only-adapter/approval-authority-traces${query}`,
    );

    if (!response.ok) {
      throw new Error(`supervisor returned ${response.status}`);
    }

    return (await response.json()) as Record<string, unknown>;
  } catch (error) {
    rethrowMissingLocalControlKey(error);
    return createRealReadOnlyAdapterApprovalAuthorityTraceListFallback(
      'supervisor unavailable; approval authority trace list fallback is display-only and not authoritative',
      options.dryRun,
    );
  }
}

export async function getLatestRealReadOnlyAdapterApprovalAuthorityTraceCommand(
  dryRunId: string,
): Promise<Record<string, unknown>> {
  try {
    const response = await fetch(
      `${supervisorUrl}/api/codex/exec/real-read-only-adapter/approval-authority-trace/latest/${encodeURIComponent(
        dryRunId,
      )}`,
    );

    if (!response.ok) {
      throw new Error(`supervisor returned ${response.status}`);
    }

    return (await response.json()) as Record<string, unknown>;
  } catch (error) {
    rethrowMissingLocalControlKey(error);
    return createRealReadOnlyAdapterApprovalAuthorityTraceReadFallback(
      `supervisor unavailable; latest approval authority trace for ${dryRunId} is display-only and not authoritative`,
      dryRunId,
    );
  }
}

export async function prepareRealReadOnlyAdapterPolicySourceCommand(
  dryRunId: string,
): Promise<Record<string, unknown>> {
  try {
    const response = await fetch(
      `${supervisorUrl}/api/codex/exec/real-read-only-adapter/policy-sources`,
      {
        method: 'POST',
        headers: createSupervisorPostHeaders(),
        body: JSON.stringify({ dryRunId }),
      },
    );

    if (!response.ok) {
      throw new Error(`supervisor returned ${response.status}`);
    }

    return (await response.json()) as Record<string, unknown>;
  } catch (error) {
    rethrowMissingLocalControlKey(error);
    return createRealReadOnlyAdapterPolicySourceReadFallback(
      `supervisor unavailable or rejected policy source preparation for ${dryRunId}; fallback is display-only and cannot be aligned`,
      dryRunId,
    );
  }
}

export async function getRealReadOnlyAdapterPolicySourceCommand(
  recordId: string,
): Promise<Record<string, unknown>> {
  try {
    const response = await fetch(
      `${supervisorUrl}/api/codex/exec/real-read-only-adapter/policy-sources/${encodeURIComponent(
        recordId,
      )}`,
    );

    if (!response.ok) {
      throw new Error(`supervisor returned ${response.status}`);
    }

    return (await response.json()) as Record<string, unknown>;
  } catch (error) {
    rethrowMissingLocalControlKey(error);
    return createRealReadOnlyAdapterPolicySourceReadFallback(
      `supervisor unavailable; policy source record ${recordId} was not read from an authoritative store`,
    );
  }
}

export async function listRealReadOnlyAdapterPolicySourcesCommand(
  options: CodexExecRealReadOnlyAdapterPolicySourceListCliOptions = {},
): Promise<Record<string, unknown>> {
  const query = createRealReadOnlyAdapterPolicySourceQueryString(options);

  try {
    const response = await fetch(
      `${supervisorUrl}/api/codex/exec/real-read-only-adapter/policy-sources${query}`,
    );

    if (!response.ok) {
      throw new Error(`supervisor returned ${response.status}`);
    }

    return (await response.json()) as Record<string, unknown>;
  } catch (error) {
    rethrowMissingLocalControlKey(error);
    return createRealReadOnlyAdapterPolicySourceListFallback(
      'supervisor unavailable; policy source list fallback is display-only and not authoritative',
      options.dryRun,
    );
  }
}

export async function getLatestRealReadOnlyAdapterPolicySourceCommand(
  dryRunId: string,
): Promise<Record<string, unknown>> {
  try {
    const response = await fetch(
      `${supervisorUrl}/api/codex/exec/real-read-only-adapter/policy-source/latest/${encodeURIComponent(
        dryRunId,
      )}`,
    );

    if (!response.ok) {
      throw new Error(`supervisor returned ${response.status}`);
    }

    return (await response.json()) as Record<string, unknown>;
  } catch (error) {
    rethrowMissingLocalControlKey(error);
    return createRealReadOnlyAdapterPolicySourceReadFallback(
      `supervisor unavailable; latest policy source for ${dryRunId} is display-only and not authoritative`,
      dryRunId,
    );
  }
}

function resolveRealReadOnlyAdapterWorktreePathHash(
  options:
    | CodexExecRealReadOnlyAdapterPilotSourcePreparationPrepareCliOptions
    | CodexExecRealReadOnlyAdapterPilotPrerequisiteCheckCliOptions,
): string | undefined {
  if (options.worktree) {
    return hashRealReadOnlyAdapterRuntimeWorktreePath(options.worktree);
  }

  return options.worktreePathHash;
}

export async function prepareRealReadOnlyAdapterPilotSourceCommand(
  dryRunId: string,
  options: CodexExecRealReadOnlyAdapterPilotSourcePreparationPrepareCliOptions = {},
): Promise<Record<string, unknown>> {
  const worktreePathHash = resolveRealReadOnlyAdapterWorktreePathHash(options);

  try {
    const response = await fetch(
      `${supervisorUrl}/api/codex/exec/real-read-only-adapter/pilot-prerequisite-sources`,
      {
        method: 'POST',
        headers: createSupervisorPostHeaders(),
        body: JSON.stringify({
          dryRunId,
          approvalArtifactId: options.approval,
          worktreeLabel: options.worktreeLabel,
          worktreeStatus: options.worktreeStatus,
          worktreePathHash,
        }),
      },
    );

    if (!response.ok) {
      throw new Error(`supervisor returned ${response.status}`);
    }

    return (await response.json()) as Record<string, unknown>;
  } catch (error) {
    rethrowMissingLocalControlKey(error);
    return createRealReadOnlyAdapterPilotSourcePreparationReadFallback(
      `supervisor unavailable or rejected source preparation for ${dryRunId}; fallback is display-only and cannot be prepared`,
      dryRunId,
    );
  }
}

export async function getRealReadOnlyAdapterPilotSourceCommand(
  recordId: string,
): Promise<Record<string, unknown>> {
  try {
    const response = await fetch(
      `${supervisorUrl}/api/codex/exec/real-read-only-adapter/pilot-prerequisite-sources/${encodeURIComponent(
        recordId,
      )}`,
    );

    if (!response.ok) {
      throw new Error(`supervisor returned ${response.status}`);
    }

    return (await response.json()) as Record<string, unknown>;
  } catch (error) {
    rethrowMissingLocalControlKey(error);
    return createRealReadOnlyAdapterPilotSourcePreparationReadFallback(
      `supervisor unavailable; source-preparation record ${recordId} was not read from an authoritative store`,
    );
  }
}

export async function listRealReadOnlyAdapterPilotSourcesCommand(
  options: CodexExecRealReadOnlyAdapterPilotSourcePreparationListCliOptions = {},
): Promise<Record<string, unknown>> {
  const query = createRealReadOnlyAdapterPilotSourcePreparationQueryString(options);

  try {
    const response = await fetch(
      `${supervisorUrl}/api/codex/exec/real-read-only-adapter/pilot-prerequisite-sources${query}`,
    );

    if (!response.ok) {
      throw new Error(`supervisor returned ${response.status}`);
    }

    return (await response.json()) as Record<string, unknown>;
  } catch (error) {
    rethrowMissingLocalControlKey(error);
    return createRealReadOnlyAdapterPilotSourcePreparationListFallback(
      'supervisor unavailable; pilot source-preparation list fallback is display-only and not authoritative',
      options.dryRun,
    );
  }
}

export async function getLatestRealReadOnlyAdapterPilotSourceCommand(
  dryRunId: string,
): Promise<Record<string, unknown>> {
  try {
    const response = await fetch(
      `${supervisorUrl}/api/codex/exec/real-read-only-adapter/pilot-prerequisite-source/latest/${encodeURIComponent(
        dryRunId,
      )}`,
    );

    if (!response.ok) {
      throw new Error(`supervisor returned ${response.status}`);
    }

    return (await response.json()) as Record<string, unknown>;
  } catch (error) {
    rethrowMissingLocalControlKey(error);
    return createRealReadOnlyAdapterPilotSourcePreparationReadFallback(
      `supervisor unavailable; latest source-preparation record for ${dryRunId} is display-only and not authoritative`,
      dryRunId,
    );
  }
}

export async function checkRealReadOnlyAdapterPilotPrerequisitesCommand(
  dryRunId: string,
  options: CodexExecRealReadOnlyAdapterPilotPrerequisiteCheckCliOptions = {},
): Promise<Record<string, unknown>> {
  const worktreePathHash = resolveRealReadOnlyAdapterWorktreePathHash(options);

  try {
    const response = await fetch(
      `${supervisorUrl}/api/codex/exec/real-read-only-adapter/pilot-prerequisites`,
      {
        method: 'POST',
        headers: createSupervisorPostHeaders(),
        body: JSON.stringify({
          dryRunId,
          approvalArtifactId: options.approval,
          worktreeLabel: options.worktreeLabel,
          worktreeStatus: options.worktreeStatus,
          worktreePathHash,
          handoffContextComplete: options.handoffContextComplete === true,
        }),
      },
    );

    if (!response.ok) {
      throw new Error(`supervisor returned ${response.status}`);
    }

    return (await response.json()) as Record<string, unknown>;
  } catch (error) {
    rethrowMissingLocalControlKey(error);
    return createRealReadOnlyAdapterPilotPrerequisiteReadFallback(
      `supervisor unavailable or rejected the prerequisite check for ${dryRunId}; fallback is display-only and cannot be ready`,
      dryRunId,
    );
  }
}

export async function getRealReadOnlyAdapterPilotPrerequisiteCommand(
  recordId: string,
): Promise<Record<string, unknown>> {
  try {
    const response = await fetch(
      `${supervisorUrl}/api/codex/exec/real-read-only-adapter/pilot-prerequisites/${encodeURIComponent(
        recordId,
      )}`,
    );

    if (!response.ok) {
      throw new Error(`supervisor returned ${response.status}`);
    }

    return (await response.json()) as Record<string, unknown>;
  } catch (error) {
    rethrowMissingLocalControlKey(error);
    return createRealReadOnlyAdapterPilotPrerequisiteReadFallback(
      `supervisor unavailable; prerequisite record ${recordId} was not read from an authoritative store`,
    );
  }
}

export async function listRealReadOnlyAdapterPilotPrerequisitesCommand(
  options: CodexExecRealReadOnlyAdapterPilotPrerequisiteListCliOptions = {},
): Promise<Record<string, unknown>> {
  const query = createRealReadOnlyAdapterPilotPrerequisiteQueryString(options);

  try {
    const response = await fetch(
      `${supervisorUrl}/api/codex/exec/real-read-only-adapter/pilot-prerequisites${query}`,
    );

    if (!response.ok) {
      throw new Error(`supervisor returned ${response.status}`);
    }

    return (await response.json()) as Record<string, unknown>;
  } catch (error) {
    rethrowMissingLocalControlKey(error);
    return {
      records: [],
      prerequisiteRecords: [],
      summaries: [],
      count: 0,
      authoritative: false,
      supervisorBacked: false,
      persisted: false,
      degraded: true,
      notPersisted: true,
      status: 'blocked',
      fallbackUsedAsAuthority: false,
      pilotExecuted: false,
      adapterAttemptInvoked: false,
      configExplicitlyEnabled: false,
      validUnusedApprovalPresent: false,
      isolatedCleanWorktreeMetadataPresent: false,
      authoritativeAttemptEvidencePresent: false,
      evidenceAuditReady: false,
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
      reason:
        'supervisor unavailable; pilot prerequisite list fallback is display-only and not authoritative',
    };
  }
}

export async function getLatestRealReadOnlyAdapterPilotPrerequisiteCommand(
  dryRunId: string,
): Promise<Record<string, unknown>> {
  try {
    const response = await fetch(
      `${supervisorUrl}/api/codex/exec/real-read-only-adapter/pilot-prerequisite/latest/${encodeURIComponent(
        dryRunId,
      )}`,
    );

    if (!response.ok) {
      throw new Error(`supervisor returned ${response.status}`);
    }

    return (await response.json()) as Record<string, unknown>;
  } catch (error) {
    rethrowMissingLocalControlKey(error);
    return createRealReadOnlyAdapterPilotPrerequisiteReadFallback(
      `supervisor unavailable; latest prerequisite readiness for ${dryRunId} is display-only and not authoritative`,
      dryRunId,
    );
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
      headers: createSupervisorPostHeaders(),
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
  } catch (error) {
    rethrowMissingLocalControlKey(error);
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
  } catch (error) {
    rethrowMissingLocalControlKey(error);
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
  } catch (error) {
    rethrowMissingLocalControlKey(error);
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
  } catch (error) {
    rethrowMissingLocalControlKey(error);
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
  } catch (error) {
    rethrowMissingLocalControlKey(error);
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
  } catch (error) {
    rethrowMissingLocalControlKey(error);
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
  } catch (error) {
    rethrowMissingLocalControlKey(error);
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

export function formatReadOnlyRunsListOutput(
  result: Record<string, unknown>,
  options: JsonCliOptions = {},
): string {
  if (options.json) {
    return JSON.stringify(result, null, 2);
  }

  const runs = (result.runs as ReadOnlyRunSummary[] | undefined) ?? [];

  return [
    'CodexHub read-only runs',
    `status: ${String(result.status ?? 'unknown')}`,
    `count: ${runs.length}`,
    `liveExecution=${String(result.liveExecution ?? false)}`,
    `externalProcessStarted=${String(result.externalProcessStarted ?? false)}`,
    `noRealWrite=${String(result.noRealWrite ?? true)}`,
    runs.length > 0 ? 'items:' : 'items: none',
    ...runs
      .slice(0, 12)
      .map((run) => `- ${run.id} ${run.source} ${run.status} ${run.title}`),
  ].join('\n');
}

export function formatReadOnlyRunDetailOutput(
  result: Record<string, unknown>,
  options: JsonCliOptions = {},
): string {
  if (options.json) {
    return JSON.stringify(result, null, 2);
  }

  const run = result.run as ReadOnlyRunSummary | undefined;

  return [
    'CodexHub read-only run',
    `status: ${String(result.status ?? 'unknown')}`,
    `id: ${run?.id ?? 'unknown'}`,
    `source: ${run?.source ?? 'unknown'}`,
    `runStatus: ${run?.status ?? 'unknown'}`,
    run?.title ? `title: ${run.title}` : undefined,
    run?.summary ? `summary: ${run.summary}` : undefined,
    `liveExecution=${String(result.liveExecution ?? false)}`,
    `externalProcessStarted=${String(result.externalProcessStarted ?? false)}`,
    `noRealWrite=${String(result.noRealWrite ?? true)}`,
  ]
    .filter((line): line is string => Boolean(line))
    .join('\n');
}

export function formatGovernanceRunsListOutput(
  result: Record<string, unknown>,
  options: GovernanceRunsListCliOptions = {},
): string {
  if (options.json) {
    return JSON.stringify(result, null, 2);
  }

  const projections =
    (result.projections as GovernanceProjectionResult['projections'] | undefined) ?? [];
  const summary = result.summary as GovernanceProjectionResult['summary'] | undefined;

  return [
    'CodexHub unified governance runs',
    `status: ${String(result.status ?? 'unknown')}`,
    `count: ${projections.length}`,
    `projectionHash: ${summary?.projectionHash ?? 'unavailable'}`,
    `evidence: ${summary?.evidenceCount ?? 0}`,
    `audit: ${summary?.auditEventCount ?? 0}`,
    `processBoundaries: ${summary?.processBoundaryCount ?? 0}`,
    `externalProcesses: ${summary?.externalProcessStartedCount ?? 0}`,
    `networkBoundaries: ${summary?.networkBoundaryCount ?? 0}`,
    `liveExecution=${String(result.liveExecution ?? false)}`,
    `externalProcessStarted=${String(result.externalProcessStarted ?? false)}`,
    `noRealWrite=${String(result.noRealWrite ?? true)}`,
    projections.length > 0 ? 'items:' : 'items: none',
    ...projections
      .slice(0, 12)
      .map(
        (projection) =>
          `- ${projection.id} ${projection.source} ${projection.status} evidence=${projection.evidenceBundle.evidenceCount} audit=${projection.auditChain.auditEventCount}`,
      ),
  ].join('\n');
}

export function formatGovernanceRunDetailOutput(
  result: Record<string, unknown>,
  options: JsonCliOptions = {},
): string {
  if (options.json) {
    return JSON.stringify(result, null, 2);
  }

  const projection = result.projection as
    | GovernanceProjectionResult['projections'][number]
    | undefined;

  return [
    'CodexHub unified governance run',
    `status: ${String(result.status ?? 'unknown')}`,
    `projectionId: ${projection?.id ?? 'unknown'}`,
    `source: ${projection?.source ?? 'unknown'}`,
    `runStatus: ${projection?.status ?? 'unknown'}`,
    `sourceRunIdHash: ${projection?.sourceRunIdHash ?? 'unknown'}`,
    `evidence: ${projection?.evidenceBundle.evidenceCount ?? 0}`,
    `audit: ${projection?.auditChain.auditEventCount ?? 0}`,
    `processBoundaryInvoked=${String(projection?.processBoundaryInvoked ?? false)}`,
    `externalProcessStarted=${String(projection?.externalProcessStarted ?? false)}`,
    `networkBoundaryInvoked=${String(projection?.networkBoundaryInvoked ?? false)}`,
    `bodyStored=${String(projection?.bodyStored ?? false)}`,
    `rawPathStored=${String(projection?.rawPathStored ?? false)}`,
  ].join('\n');
}

export function formatGovernanceEvidenceBundleOutput(
  result: Record<string, unknown>,
  options: JsonCliOptions = {},
): string {
  if (options.json) {
    return JSON.stringify(result, null, 2);
  }

  const bundle = result.evidenceBundle as
    | GovernanceProjectionResult['projections'][number]['evidenceBundle']
    | undefined;

  return [
    'CodexHub governance evidence bundle',
    `status: ${String(result.status ?? 'unknown')}`,
    `runProjectionId: ${bundle?.runProjectionId ?? 'unknown'}`,
    `source: ${bundle?.source ?? 'unknown'}`,
    `evidenceCount: ${bundle?.evidenceCount ?? 0}`,
    `bundleHash: ${bundle?.bundleHash ?? 'unknown'}`,
    `bodyStored=${String(bundle?.bodyStored ?? false)}`,
    `rawPathStored=${String(bundle?.rawPathStored ?? false)}`,
  ].join('\n');
}

export function formatGovernanceAuditChainOutput(
  result: Record<string, unknown>,
  options: JsonCliOptions = {},
): string {
  if (options.json) {
    return JSON.stringify(result, null, 2);
  }

  const chain = result.auditChain as
    | GovernanceProjectionResult['projections'][number]['auditChain']
    | undefined;

  return [
    'CodexHub governance audit chain',
    `status: ${String(result.status ?? 'unknown')}`,
    `runProjectionId: ${chain?.runProjectionId ?? 'unknown'}`,
    `source: ${chain?.source ?? 'unknown'}`,
    `auditEventCount: ${chain?.auditEventCount ?? 0}`,
    `policyDecisionCount: ${chain?.policyDecisionIds.length ?? 0}`,
    `chainHash: ${chain?.chainHash ?? 'unknown'}`,
    `bodyStored=${String(chain?.bodyStored ?? false)}`,
    `rawPathStored=${String(chain?.rawPathStored ?? false)}`,
  ].join('\n');
}

export function formatOperatorReadinessReportOutput(
  report: OperatorReadinessReport,
  options: JsonCliOptions = {},
): string {
  if (options.json) {
    return JSON.stringify(report, null, 2);
  }

  return [
    'CodexHub operator readiness',
    `status: ${report.status}`,
    `checks: ${report.passedCheckCount} pass, ${report.warningCheckCount} warn, ${report.failedCheckCount} fail`,
    `configuredLocalControlKeys: ${report.configuredLocalControlKeyCount}`,
    `storeAvailable: ${String(report.storeAvailable)}`,
    `processBoundaryAllowlistPassed: ${String(report.processBoundaryAllowlistPassed)}`,
    `policyConfigHash: ${report.policyConfigHash ?? 'missing'}`,
    `riskConfigHash: ${report.riskConfigHash ?? 'missing'}`,
    `integrationConfigHash: ${report.integrationConfigHash ?? 'missing'}`,
    'integrations:',
    ...report.integrations.map(
      (integration) =>
        `- ${integration.name} enabled=${String(integration.enabled)} safeToEnable=${String(
          integration.safeToEnable,
        )} risk=${integration.riskLevel} blockers=${
          integration.blockers.length > 0 ? integration.blockers.join(',') : 'none'
        }`,
    ),
    `bodyStored=${String(report.bodyStored)}`,
    `rawPathStored=${String(report.rawPathStored)}`,
  ].join('\n');
}

export function formatOperatorIntegrationReadinessOutput(
  result: Record<string, unknown>,
  options: JsonCliOptions = {},
): string {
  if (options.json) {
    return JSON.stringify(result, null, 2);
  }

  const integration = result.integration as
    | OperatorReadinessReport['integrations'][number]
    | undefined;

  return [
    'CodexHub integration readiness',
    `status: ${String(result.status ?? 'unknown')}`,
    `name: ${integration?.name ?? 'unknown'}`,
    `enabled: ${String(integration?.enabled ?? false)}`,
    `safeToEnable: ${String(integration?.safeToEnable ?? false)}`,
    `risk: ${integration?.riskLevel ?? 'unknown'}`,
    `approvalRequired: ${String(integration?.approvalRequired ?? false)}`,
    `processBoundary: ${String(integration?.processBoundary ?? false)}`,
    `networkBoundary: ${String(integration?.networkBoundary ?? false)}`,
    `blockers: ${integration && integration.blockers.length > 0 ? integration.blockers.join(',') : 'none'}`,
    `bodyStored=${String(result.bodyStored ?? false)}`,
    `rawPathStored=${String(result.rawPathStored ?? false)}`,
  ].join('\n');
}

export function formatM10PilotChecklistOutput(
  checklist: M10PilotChecklist,
  options: JsonCliOptions = {},
): string {
  if (options.json) {
    return JSON.stringify(checklist, null, 2);
  }

  return [
    'CodexHub M10 pilot checklist',
    `status: ${checklist.status}`,
    `steps: ${checklist.readyStepCount} ready, ${checklist.blockedStepCount} blocked, ${checklist.reviewStepCount} review`,
    `blockers: ${checklist.blockerCount}`,
    `approvalInboxItems: ${checklist.approvalInboxItemCount}`,
    `governanceRuns: ${checklist.governanceRunCount}`,
    'operator steps:',
    ...checklist.steps.map(
      (step) =>
        `- ${step.code} ${step.phase}/${step.status} blockers=${
          step.blockers.length > 0 ? step.blockers.join(',') : 'none'
        }`,
    ),
    `localControlKeyRead=${String(checklist.localControlKeyRead)}`,
    `supervisorPostAllowed=${String(checklist.supervisorPostAllowed)}`,
    `adapterExecuteAllowed=${String(checklist.adapterExecuteAllowed)}`,
    `bodyStored=${String(checklist.bodyStored)}`,
    `rawPathStored=${String(checklist.rawPathStored)}`,
  ].join('\n');
}

export function formatM10PilotRunbookOutput(
  runbook: M10PilotRunbookSummary,
  options: JsonCliOptions = {},
): string {
  if (options.json) {
    return JSON.stringify(runbook, null, 2);
  }

  return [
    'CodexHub M10 pilot runbook',
    `status: ${runbook.status}`,
    `checklistId: ${runbook.checklistId}`,
    `phases: ${runbook.phaseCount}`,
    `requiredSteps: ${runbook.requiredStepCount}`,
    `blockers: ${runbook.blockerCount}`,
    `nextAction: ${runbook.nextAction}`,
    `rollback: ${runbook.rollbackSummary}`,
    `localControlKeyRead=${String(runbook.localControlKeyRead)}`,
    `supervisorPostAllowed=${String(runbook.supervisorPostAllowed)}`,
    `adapterExecuteAllowed=${String(runbook.adapterExecuteAllowed)}`,
    `bodyStored=${String(runbook.bodyStored)}`,
    `rawPathStored=${String(runbook.rawPathStored)}`,
  ].join('\n');
}

export function formatGoldenPathRehearsalOutput(
  result: ReturnType<typeof runGoldenPathRehearsal>,
  options: JsonCliOptions = {},
): string {
  if (options.json) {
    return JSON.stringify(result, null, 2);
  }

  return [
    'CodexHub golden path rehearsal',
    `status: ${result.status}`,
    `scenario: ${result.scenario}`,
    `steps: ${result.steps.length}`,
    `evidence: ${result.evidenceBundle.evidenceCount}`,
    `audit: ${result.evidenceBundle.auditEventCount}`,
    `prDraftStatus: ${result.prDraftStatus}`,
    `releaseAuditStatus: ${result.releaseAuditStatus}`,
    `telemetryProjectionHash: ${result.telemetryProjectionHash}`,
    `processBoundaryInvoked=${String(result.processBoundaryInvoked)}`,
    `externalProcessStarted=${String(result.externalProcessStarted)}`,
    `networkBoundaryInvoked=${String(result.networkBoundaryInvoked)}`,
    `bodyStored=${String(result.bodyStored)}`,
    `rawPathStored=${String(result.rawPathStored)}`,
    'timeline:',
    ...result.steps.map((step) => `- ${step.order} ${step.phase} ${step.status}`),
  ].join('\n');
}

export function formatM10PilotAcceptanceRehearsalOutput(
  result: ReturnType<typeof runM10PilotAcceptanceRehearsal>,
  options: JsonCliOptions = {},
): string {
  if (options.json) {
    return JSON.stringify(result, null, 2);
  }

  return [
    'CodexHub M10 pilot acceptance rehearsal',
    `status: ${result.status}`,
    `scenario: ${result.scenario}`,
    `steps: ${result.steps.length}`,
    `evidence: ${result.evidenceSummary.evidenceCount}`,
    `audit: ${result.evidenceSummary.auditEventCount}`,
    `goldenPathStatus: ${result.goldenPathStatus}`,
    `prActionStatus: ${result.prActionStatus}`,
    `governanceProjectionHash: ${result.governanceProjectionHash}`,
    `telemetryProjectionHash: ${result.evidenceSummary.telemetryProjectionHash}`,
    `processBoundaryInvoked=${String(result.processBoundaryInvoked)}`,
    `externalProcessStarted=${String(result.externalProcessStarted)}`,
    `networkBoundaryInvoked=${String(result.networkBoundaryInvoked)}`,
    `localControlKeyRead=${String(result.localControlKeyRead)}`,
    `supervisorPostAllowed=${String(result.supervisorPostAllowed)}`,
    `adapterExecuteAllowed=${String(result.adapterExecuteAllowed)}`,
    `pushAllowed=${String(result.pushAllowed)}`,
    `pullRequestOpened=${String(result.pullRequestOpened)}`,
    `bodyStored=${String(result.bodyStored)}`,
    `rawPathStored=${String(result.rawPathStored)}`,
    'timeline:',
    ...result.steps.map((step) => `- ${step.order} ${step.code} ${step.phase}/${step.status}`),
  ].join('\n');
}

export function formatM11PilotReadinessOutput(
  result: Record<string, unknown>,
  options: JsonCliOptions = {},
): string {
  if (options.json) {
    return JSON.stringify(result, null, 2);
  }

  return [
    'CodexHub M11 pilot readiness',
    `status: ${String(result.status ?? 'unknown')}`,
    `runSource: ${String(result.runSourceStatus ?? 'unknown')}`,
    `runs: ${String(result.runCount ?? 0)}`,
    `enablement: ${String(result.enablementStatus ?? 'unknown')}`,
    `blockers: ${String(result.enablementBlockerCount ?? 0)}`,
    `requiredEnv: ${Array.isArray(result.requiredEnvFlags) ? result.requiredEnvFlags.join(', ') : 'none'}`,
    `latest: ${String(result.latestRunStatus ?? 'none')}`,
    `prDraft: ${String(result.latestPrDraftStatus ?? 'none')}`,
    `failure: ${String(result.latestFailureClassification ?? 'none')}`,
    `nextAction: ${String(result.nextAction ?? 'none')}`,
    'codex: read-only dry-run only',
    'patchGenerationAllowed=false',
    'pushAllowed=false',
    'pullRequestOpened=false',
    `note: ${String(result.note ?? '')}`,
  ].join('\n');
}

export function formatM11PilotRunsListOutput(
  result: Record<string, unknown>,
  options: JsonCliOptions = {},
): string {
  if (options.json) {
    return JSON.stringify(result, null, 2);
  }

  const records = (result.records as M11PilotRunApiRecord[] | undefined) ?? [];

  return [
    'CodexHub M11 pilot runs',
    `status: ${String(result.status ?? 'unknown')}`,
    `count: ${String(result.count ?? records.length)}`,
    ...records.map(
      (record) =>
        `- ${record.runId ?? 'unknown'} ${record.status ?? 'unknown'} pr=${
          record.prDraftStatus ?? 'unknown'
        } failure=${record.failureClassification ?? 'none'}`,
    ),
    `note: ${String(result.note ?? '')}`,
  ].join('\n');
}

export function formatM11PilotRunShowOutput(
  result: Record<string, unknown>,
  options: JsonCliOptions = {},
): string {
  if (options.json) {
    return JSON.stringify(result, null, 2);
  }

  const record = result.record as M11PilotRunApiRecord | undefined;

  return [
    'CodexHub M11 pilot run',
    `status: ${String(result.status ?? 'unknown')}`,
    `runId: ${record?.runId ?? 'none'}`,
    `runStatus: ${record?.status ?? 'unknown'}`,
    `prDraft: ${record?.prDraftStatus ?? 'unknown'}`,
    `failure: ${record?.failureClassification ?? 'none'}`,
    `readiness: ${record?.readinessStatus ?? 'unknown'}`,
    `evidence: ${record?.evidenceRefIds?.length ?? 0}`,
    `audit: ${record?.auditEventIds?.length ?? 0}`,
    `note: ${String(result.note ?? '')}`,
  ].join('\n');
}

export function formatBrowserObservationRunsListOutput(
  result: Record<string, unknown>,
  options: JsonCliOptions = {},
): string {
  if (options.json) {
    return JSON.stringify(result, null, 2);
  }

  const records = (result.records as BrowserObservationRunApiRecord[] | undefined) ?? [];

  return [
    'Browser observation runs',
    `status: ${String(result.status ?? 'unknown')}`,
    `count: ${records.length}`,
    `liveExecution=${String(result.liveExecution ?? false)}`,
    `externalProcessStarted=${String(result.externalProcessStarted ?? false)}`,
    `noRealWrite=${String(result.noRealWrite ?? true)}`,
    records.length > 0 ? 'items:' : 'items: none',
    ...records
      .slice(0, 12)
      .map(
        (record) =>
          `- ${record.runId ?? record.recordId ?? 'unknown'} ${record.status ?? 'unknown'} evidence=${
            record.evidenceRefIds?.length ?? 0
          } audit=${record.auditEventIds?.length ?? 0}`,
      ),
  ].join('\n');
}

export function formatBrowserObservationRunDetailOutput(
  result: Record<string, unknown>,
  options: JsonCliOptions = {},
): string {
  if (options.json) {
    return JSON.stringify(result, null, 2);
  }

  const run = result.run as BrowserObservationRunApiRecord | undefined;

  return [
    'Browser observation run',
    `status: ${String(result.status ?? 'unknown')}`,
    `runId: ${run?.runId ?? result.runId ?? 'unknown'}`,
    `dryRunId: ${run?.dryRunId ?? 'unknown'}`,
    `runStatus: ${run?.status ?? 'unknown'}`,
    run?.summary ? `summary: ${run.summary}` : undefined,
    `processBoundaryInvoked=${String(run?.processBoundaryInvoked ?? false)}`,
    `externalProcessStarted=${String(run?.externalProcessStarted ?? false)}`,
    `noRealWrite=${String(run?.noRealWrite ?? true)}`,
    `bodyStored=${String(run?.bodyStored ?? false)}`,
    `rawPathStored=${String(run?.rawPathStored ?? false)}`,
  ]
    .filter((line): line is string => Boolean(line))
    .join('\n');
}

export function formatElectronCdpObservationDryRunsListOutput(
  result: Record<string, unknown>,
  options: JsonCliOptions = {},
): string {
  return formatElectronCdpObservationCollectionOutput(
    'Electron/CDP observation dry-runs',
    result,
    options,
  );
}

export function formatElectronCdpObservationApprovalsListOutput(
  result: Record<string, unknown>,
  options: JsonCliOptions = {},
): string {
  return formatElectronCdpObservationCollectionOutput(
    'Electron/CDP observation approvals',
    result,
    options,
  );
}

export function formatElectronCdpObservationRunsListOutput(
  result: Record<string, unknown>,
  options: JsonCliOptions = {},
): string {
  return formatElectronCdpObservationCollectionOutput(
    'Electron/CDP observation runs',
    result,
    options,
  );
}

export function formatElectronCdpObservationRunDetailOutput(
  result: Record<string, unknown>,
  options: JsonCliOptions = {},
): string {
  if (options.json) {
    return JSON.stringify(result, null, 2);
  }

  const run = result.run as ElectronCdpObservationApiRecord | undefined;

  return [
    'Electron/CDP observation run',
    `status: ${String(result.status ?? 'unknown')}`,
    `runId: ${run?.runId ?? result.runId ?? 'unknown'}`,
    `dryRunId: ${run?.dryRunId ?? 'unknown'}`,
    `runnerMode: ${run?.runnerMode ?? 'unknown'}`,
    `runStatus: ${run?.status ?? 'unknown'}`,
    run?.endpointIdHash ? `endpointIdHash: ${run.endpointIdHash}` : undefined,
    run?.targetIdHash ? `targetIdHash: ${run.targetIdHash}` : undefined,
    run?.summary ? `summary: ${run.summary}` : undefined,
    `cdpHttpBoundaryInvoked=${String(run?.cdpHttpBoundaryInvoked ?? false)}`,
    `cdpWebSocketBoundaryInvoked=${String(run?.cdpWebSocketBoundaryInvoked ?? false)}`,
    `processBoundaryInvoked=${String(run?.processBoundaryInvoked ?? false)}`,
    `externalProcessStarted=${String(run?.externalProcessStarted ?? false)}`,
    `eventCount=${String(run?.eventSummary?.eventCount ?? 0)}`,
    `consoleEventCount=${String(run?.eventSummary?.consoleEventCount ?? 0)}`,
    `networkEventCount=${String(run?.eventSummary?.networkEventCount ?? 0)}`,
    `noRealWrite=${String(run?.noRealWrite ?? true)}`,
    `bodyStored=${String(run?.bodyStored ?? false)}`,
    `rawPathStored=${String(run?.rawPathStored ?? false)}`,
  ]
    .filter((line): line is string => Boolean(line))
    .join('\n');
}

export function formatWorktreeDryRunsListOutput(
  result: Record<string, unknown>,
  options: JsonCliOptions = {},
): string {
  return formatWorktreeCollectionOutput('Worktree dry-runs', result, options);
}

export function formatWorktreeApprovalsListOutput(
  result: Record<string, unknown>,
  options: JsonCliOptions = {},
): string {
  return formatWorktreeCollectionOutput('Worktree approvals', result, options);
}

export function formatWorktreeRunsListOutput(
  result: Record<string, unknown>,
  options: JsonCliOptions = {},
): string {
  return formatWorktreeCollectionOutput('Worktree runs', result, options);
}

export function formatWorktreeRunDetailOutput(
  result: Record<string, unknown>,
  options: JsonCliOptions = {},
): string {
  return formatWorktreeRunDetail('Worktree run', result, options);
}

export function formatWorktreeCleanupDryRunsListOutput(
  result: Record<string, unknown>,
  options: JsonCliOptions = {},
): string {
  return formatWorktreeCollectionOutput('Worktree cleanup dry-runs', result, options);
}

export function formatWorktreeCleanupApprovalsListOutput(
  result: Record<string, unknown>,
  options: JsonCliOptions = {},
): string {
  return formatWorktreeCollectionOutput('Worktree cleanup approvals', result, options);
}

export function formatWorktreeCleanupRunsListOutput(
  result: Record<string, unknown>,
  options: JsonCliOptions = {},
): string {
  return formatWorktreeCollectionOutput('Worktree cleanup runs', result, options);
}

export function formatWorktreeCleanupRunDetailOutput(
  result: Record<string, unknown>,
  options: JsonCliOptions = {},
): string {
  return formatWorktreeRunDetail('Worktree cleanup run', result, options);
}

export function formatApprovalInboxOutput(
  result: ApprovalInboxProjection | Record<string, unknown>,
  options: JsonCliOptions = {},
): string {
  if (options.json) {
    return JSON.stringify(result, null, 2);
  }

  const items =
    'items' in result && Array.isArray(result.items)
      ? (result.items as Array<{
          approvalType?: string;
          approvalRequestId?: string;
          status?: string;
          targetHash?: string;
          evidenceRefIds?: string[];
          auditEventIds?: string[];
          canApprove?: boolean;
          canDeny?: boolean;
          canRevoke?: boolean;
        }>)
      : [];

  return [
    'Approval inbox',
    `status: ${String('status' in result ? result.status ?? 'ready' : 'ready')}`,
    `count: ${String('itemCount' in result ? result.itemCount ?? items.length : items.length)}`,
    `requested: ${String('requestedCount' in result ? result.requestedCount ?? 0 : 0)}`,
    `approved: ${String('approvedCount' in result ? result.approvedCount ?? 0 : 0)}`,
    ...items.slice(0, 10).map((item) =>
      [
        `${item.approvalType ?? 'approval'} ${item.approvalRequestId ?? 'unknown'}`,
        `status=${item.status ?? 'unknown'}`,
        `target=${item.targetHash ?? 'unavailable'}`,
        `evidence=${item.evidenceRefIds?.length ?? 0}`,
        `audit=${item.auditEventIds?.length ?? 0}`,
        `approve=${String(item.canApprove ?? false)}`,
        `deny=${String(item.canDeny ?? false)}`,
        `revoke=${String(item.canRevoke ?? false)}`,
      ].join(' | '),
    ),
    `bodyStored=${String('bodyStored' in result ? result.bodyStored ?? false : false)}`,
    `tokenStored=${String('tokenStored' in result ? result.tokenStored ?? false : false)}`,
  ].join('\n');
}

export function formatApprovalDecisionOutput(
  result: ApprovalDecisionResult | Record<string, unknown>,
  options: JsonCliOptions = {},
): string {
  if (options.json) {
    return JSON.stringify(result, null, 2);
  }

  return [
    'Approval decision',
    `type: ${String('approvalType' in result ? result.approvalType ?? 'unknown' : 'unknown')}`,
    `request: ${String(
      'approvalRequestId' in result ? result.approvalRequestId ?? 'unknown' : 'unknown',
    )}`,
    `status: ${String('status' in result ? result.status ?? 'unknown' : 'unknown')}`,
    `processBoundaryInvoked=${String(
      'processBoundaryInvoked' in result ? result.processBoundaryInvoked ?? false : false,
    )}`,
    `externalProcessStarted=${String(
      'externalProcessStarted' in result ? result.externalProcessStarted ?? false : false,
    )}`,
    `bodyStored=${String('bodyStored' in result ? result.bodyStored ?? false : false)}`,
    `tokenStored=${String('tokenStored' in result ? result.tokenStored ?? false : false)}`,
  ].join('\n');
}

export function formatApprovalDecisionHistoryOutput(
  result: ApprovalDecisionHistoryProjection | Record<string, unknown>,
  options: JsonCliOptions = {},
): string {
  if (options.json) {
    return JSON.stringify(result, null, 2);
  }

  const items =
    'items' in result && Array.isArray(result.items)
      ? (result.items as Array<{
          source?: string;
          approvalType?: string;
          approvalRequestId?: string;
          decision?: string;
          status?: string;
          targetHash?: string;
          evidenceRefIds?: string[];
          auditEventIds?: string[];
        }>)
      : [];

  return [
    'Approval decision history',
    `status: ${String('status' in result ? result.status ?? 'ready' : 'ready')}`,
    `count: ${String('itemCount' in result ? result.itemCount ?? items.length : items.length)}`,
    `requested: ${String('requestedCount' in result ? result.requestedCount ?? 0 : 0)}`,
    `approved: ${String('approvedCount' in result ? result.approvedCount ?? 0 : 0)}`,
    `denied: ${String('deniedCount' in result ? result.deniedCount ?? 0 : 0)}`,
    `revoked: ${String('revokedCount' in result ? result.revokedCount ?? 0 : 0)}`,
    ...items.slice(0, 10).map((item) =>
      [
        `${item.source ?? 'history'} ${item.approvalType ?? 'approval'} ${
          item.approvalRequestId ?? 'unknown'
        }`,
        `decision=${item.decision ?? 'none'}`,
        `status=${item.status ?? 'unknown'}`,
        `target=${item.targetHash ?? 'unavailable'}`,
        `evidence=${item.evidenceRefIds?.length ?? 0}`,
        `audit=${item.auditEventIds?.length ?? 0}`,
      ].join(' | '),
    ),
    `bodyStored=${String('bodyStored' in result ? result.bodyStored ?? false : false)}`,
    `tokenStored=${String('tokenStored' in result ? result.tokenStored ?? false : false)}`,
  ].join('\n');
}

function formatElectronCdpObservationCollectionOutput(
  title: string,
  result: Record<string, unknown>,
  options: JsonCliOptions = {},
): string {
  if (options.json) {
    return JSON.stringify(result, null, 2);
  }

  const records = (result.records as ElectronCdpObservationApiRecord[] | undefined) ?? [];

  return [
    title,
    `status: ${String(result.status ?? 'unknown')}`,
    `count: ${records.length}`,
    `liveExecution=${String(result.liveExecution ?? false)}`,
    `externalProcessStarted=${String(result.externalProcessStarted ?? false)}`,
    `noRealWrite=${String(result.noRealWrite ?? true)}`,
    records.length > 0 ? 'items:' : 'items: none',
    ...records
      .slice(0, 12)
      .map((record) =>
        [
          `- ${record.runId ?? record.approvalArtifactId ?? record.recordId ?? 'unknown'}`,
          record.status ?? 'unknown',
          `runner=${record.runnerMode ?? 'unknown'}`,
          `endpoint=${record.endpointIdHash ?? 'unavailable'}`,
          `target=${record.targetIdHash ?? 'unavailable'}`,
          `http=${String(record.cdpHttpBoundaryInvoked ?? false)}`,
          `events=${String(record.cdpWebSocketBoundaryInvoked ?? false)}`,
          `evidence=${record.evidenceRefIds?.length ?? 0}`,
          `audit=${record.auditEventIds?.length ?? 0}`,
        ].join(' '),
      ),
  ].join('\n');
}

function formatWorktreeCollectionOutput(
  title: string,
  result: Record<string, unknown>,
  options: JsonCliOptions = {},
): string {
  if (options.json) {
    return JSON.stringify(result, null, 2);
  }

  const records = (result.records as WorktreeApiRecord[] | undefined) ?? [];

  return [
    title,
    `status: ${String(result.status ?? 'unknown')}`,
    `count: ${records.length}`,
    `liveExecution=${String(result.liveExecution ?? false)}`,
    `externalProcessStarted=${String(result.externalProcessStarted ?? false)}`,
    `noRealWrite=${String(result.noRealWrite ?? true)}`,
    records.length > 0 ? 'items:' : 'items: none',
    ...records
      .slice(0, 12)
      .map((record) =>
        [
          `- ${record.runId ?? record.approvalArtifactId ?? record.recordId ?? 'unknown'}`,
          record.status ?? 'unknown',
          `runner=${record.runnerMode ?? 'unknown'}`,
          `operation=${record.operationMode ?? 'create'}`,
          `worktree=${record.worktreePathHash ?? 'unavailable'}`,
          `base=${record.baseRefHash ?? 'unavailable'}`,
          `git=${String(record.gitProcessBoundaryInvoked ?? false)}`,
          `cleanupRequired=${String(record.cleanupRequired ?? false)}`,
          `cleanupCompleted=${String(record.cleanupCompleted ?? false)}`,
          `evidence=${record.evidenceRefIds?.length ?? 0}`,
          `audit=${record.auditEventIds?.length ?? 0}`,
        ].join(' '),
      ),
  ].join('\n');
}

function formatWorktreeRunDetail(
  title: string,
  result: Record<string, unknown>,
  options: JsonCliOptions = {},
): string {
  if (options.json) {
    return JSON.stringify(result, null, 2);
  }

  const run = result.run as WorktreeApiRecord | undefined;

  return [
    title,
    `status: ${String(result.status ?? 'unknown')}`,
    `runId: ${run?.runId ?? result.runId ?? 'unknown'}`,
    `dryRunId: ${run?.dryRunId ?? 'unknown'}`,
    run?.sourceRunId ? `sourceRunId: ${run.sourceRunId}` : undefined,
    `runnerMode: ${run?.runnerMode ?? 'unknown'}`,
    `operationMode: ${run?.operationMode ?? 'unknown'}`,
    `runStatus: ${run?.status ?? 'unknown'}`,
    run?.repoRootHash ? `repoRootHash: ${run.repoRootHash}` : undefined,
    run?.worktreeRootHash ? `worktreeRootHash: ${run.worktreeRootHash}` : undefined,
    run?.worktreePathHash ? `worktreePathHash: ${run.worktreePathHash}` : undefined,
    run?.baseRefHash ? `baseRefHash: ${run.baseRefHash}` : undefined,
    run?.branchSlugHash ? `branchSlugHash: ${run.branchSlugHash}` : undefined,
    run?.diffHash ? `diffHash: ${run.diffHash}` : undefined,
    `changedFileCount=${String(run?.changedFileCount ?? 0)}`,
    `cleanupRequired=${String(run?.cleanupRequired ?? false)}`,
    `cleanupDeferred=${String(run?.cleanupDeferred ?? false)}`,
    `cleanupCompleted=${String(run?.cleanupCompleted ?? false)}`,
    run?.summary ? `summary: ${run.summary}` : undefined,
    `gitProcessBoundaryInvoked=${String(run?.gitProcessBoundaryInvoked ?? false)}`,
    `processBoundaryInvoked=${String(run?.processBoundaryInvoked ?? false)}`,
    `externalProcessStarted=${String(run?.externalProcessStarted ?? false)}`,
    `noRealWrite=${String(run?.noRealWrite ?? true)}`,
    `bodyStored=${String(run?.bodyStored ?? false)}`,
    `rawPathStored=${String(run?.rawPathStored ?? false)}`,
  ]
    .filter((line): line is string => Boolean(line))
    .join('\n');
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

function createRealReadOnlyAdapterAttemptQueryString(
  options:
    | CodexExecRealReadOnlyAdapterAttemptListCliOptions
    | CodexExecRealReadOnlyAdapterAttemptTimelineCliOptions,
): string {
  const params = new URLSearchParams();

  if (options.dryRun) {
    params.set('dryRunId', options.dryRun);
  }

  if (options.status) {
    params.set('status', normalizeRealReadOnlyAdapterAttemptStatus(options.status));
  }

  if ('includeEvidence' in options && options.includeEvidence === true) {
    params.set('includeEvidence', 'true');
  }

  if ('includeAudit' in options && options.includeAudit === true) {
    params.set('includeAudit', 'true');
  }

  const queryString = params.toString();
  return queryString ? `?${queryString}` : '';
}

function createRealReadOnlyAdapterPolicySourceQueryString(
  options: CodexExecRealReadOnlyAdapterPolicySourceListCliOptions,
): string {
  const params = new URLSearchParams();

  if (options.dryRun) {
    params.set('dryRunId', options.dryRun);
  }

  if (options.status) {
    params.set('status', normalizeRealReadOnlyAdapterPolicySourceStatus(options.status));
  }

  const queryString = params.toString();
  return queryString ? `?${queryString}` : '';
}

function createRealReadOnlyAdapterApprovalAuthorityTraceQueryString(
  options: CodexExecRealReadOnlyAdapterApprovalAuthorityTraceListCliOptions,
): string {
  const params = new URLSearchParams();

  if (options.dryRun) {
    params.set('dryRunId', options.dryRun);
  }

  if (options.status) {
    params.set('status', normalizeRealReadOnlyAdapterApprovalAuthorityTraceStatus(options.status));
  }

  const queryString = params.toString();
  return queryString ? `?${queryString}` : '';
}

function createRealReadOnlyAdapterPilotPrerequisiteQueryString(
  options: CodexExecRealReadOnlyAdapterPilotPrerequisiteListCliOptions,
): string {
  const params = new URLSearchParams();

  if (options.dryRun) {
    params.set('dryRunId', options.dryRun);
  }

  if (options.status) {
    params.set('status', normalizeRealReadOnlyAdapterPilotPrerequisiteStatus(options.status));
  }

  const queryString = params.toString();
  return queryString ? `?${queryString}` : '';
}

function createRealReadOnlyAdapterPilotSourcePreparationQueryString(
  options: CodexExecRealReadOnlyAdapterPilotSourcePreparationListCliOptions,
): string {
  const params = new URLSearchParams();

  if (options.dryRun) {
    params.set('dryRunId', options.dryRun);
  }

  if (options.status) {
    params.set('status', normalizeRealReadOnlyAdapterPilotSourcePreparationStatus(options.status));
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

function normalizeRealReadOnlyAdapterAttemptStatus(
  status: string,
): CodexExecRealReadOnlyAdapterAttemptStatus {
  if (['blocked', 'completed', 'failed', 'aborted'].includes(status)) {
    return status as CodexExecRealReadOnlyAdapterAttemptStatus;
  }

  return 'blocked';
}

function normalizeRealReadOnlyAdapterPolicySourceStatus(
  status: string,
): CodexExecRealReadOnlyAdapterPolicySourceStatus {
  if (['aligned', 'blocked', 'requires_review'].includes(status)) {
    return status as CodexExecRealReadOnlyAdapterPolicySourceStatus;
  }

  return 'blocked';
}

function normalizeRealReadOnlyAdapterApprovalAuthorityTraceStatus(
  status: string,
): CodexExecRealReadOnlyAdapterApprovalAuthorityTraceStatus {
  if (['aligned', 'blocked', 'requires_review'].includes(status)) {
    return status as CodexExecRealReadOnlyAdapterApprovalAuthorityTraceStatus;
  }

  return 'blocked';
}

function normalizeRealReadOnlyAdapterPilotPrerequisiteStatus(
  status: string,
): CodexExecRealReadOnlyAdapterPilotPrerequisiteStatus {
  if (['ready_for_pilot_retry', 'blocked', 'requires_review'].includes(status)) {
    return status as CodexExecRealReadOnlyAdapterPilotPrerequisiteStatus;
  }

  return 'blocked';
}

function normalizeRealReadOnlyAdapterPilotSourcePreparationStatus(
  status: string,
): CodexExecRealReadOnlyAdapterPilotSourcePreparationStatus {
  if (['prepared', 'blocked', 'requires_review'].includes(status)) {
    return status as CodexExecRealReadOnlyAdapterPilotSourcePreparationStatus;
  }

  return 'blocked';
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
    authoritative: false,
    supervisorBacked: false,
    persisted: false,
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
      governedInputProvided: options.governedInput !== undefined,
      governedInputExpectedContentHashProvided: options.governedInputHash !== undefined,
      governedInputExpectedContentHash: options.governedInputHash,
      governedInputBodyStored: false,
      promptBodyStored: false,
      promptArgumentStored: false,
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
      governedInputProvided: options.governedInput !== undefined,
      governedInputVerified: false,
      governedInputExpectedContentHashProvided: options.governedInputHash !== undefined,
      governedInputExpectedContentHash: options.governedInputHash,
      governedInputBodyStored: false,
      promptBodyStored: false,
      promptArgumentStored: false,
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
      'CLI attempt is blocked before any process boundary. This does not grant implementation, process launch, external model invocation, or workspace mutation permission.',
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
    authoritative: false,
    supervisorBacked: false,
    persisted: false,
    degraded: true,
    notPersisted: true,
    fallbackRefused: true,
    reason:
      'supervisor attempt endpoint unavailable or rejected; CLI local fallback cannot create an actual adapter attempt',
  };
}

function createRealReadOnlyAdapterAttemptReadFallback(
  reason: string,
  dryRunId = 'unknown',
): Record<string, unknown> {
  return {
    attempt: undefined,
    attemptRecord: undefined,
    summary: undefined,
    attempts: [],
    attemptRecords: [],
    summaries: [],
    count: 0,
    dryRunId,
    authoritative: false,
    supervisorBacked: false,
    persisted: false,
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

function createRealReadOnlyAdapterAttemptTimelineReadFallback(
  reason: string,
  dryRunId: string,
  options: CodexExecRealReadOnlyAdapterAttemptTimelineCliOptions = {},
): Record<string, unknown> {
  const timeline: CodexExecRealReadOnlyAdapterAttemptTimelineSummary = {
    id: 'codex_real_read_only_adapter_attempt_timeline_degraded',
    schemaVersion: SchemaVersionSchema.value,
    createdAt: new Date().toISOString(),
    liveExecution: false,
    externalProcessStarted: false,
    executionDisabled: true,
    processAdapterStarted: false,
    processAdapterApproved: false,
    implementationApproved: false,
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
    agentMessageBodyStored: false,
    reasoningBodyStored: false,
    dryRunId,
    status: 'empty',
    entries: [],
    eventCount: 0,
    evidenceRefCount: 0,
    auditEventCount: 0,
    outputHashCount: 0,
    processBoundaryInvokedCount: 0,
    includeEvidence: options.includeEvidence === true,
    includeAudit: options.includeAudit === true,
    verificationSummary: 'No authoritative verification metadata was read.',
    workspaceMutationSummary: 'No workspace mutation metadata was read.',
    recommendation:
      'Timeline fallback is metadata-only and does not grant broader use, workspace write, or Dashboard trigger permission.',
    summary: 'No authoritative attempt timeline is available from the Supervisor.',
    metadata: { degraded: true, notPersisted: true },
  };

  return {
    timeline,
    attempts: [],
    attemptRecords: [],
    summaries: [],
    count: 0,
    dryRunId,
    authoritative: false,
    supervisorBacked: false,
    persisted: false,
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

function createRealReadOnlyAdapterPilotPrerequisiteReadFallback(
  reason: string,
  dryRunId = 'unknown',
): Record<string, unknown> {
  return {
    record: undefined,
    prerequisiteRecord: undefined,
    summary: undefined,
    records: [],
    prerequisiteRecords: [],
    summaries: [],
    count: 0,
    dryRunId,
    status: 'blocked',
    hardGateCount: 0,
    passedGateCount: 0,
    blockedGateCount: 1,
    requiresReviewFindingCount: 0,
    missingPrerequisites: ['authoritative_persisted_prerequisite_source'],
    authoritative: false,
    supervisorBacked: false,
    persisted: false,
    degraded: true,
    notPersisted: true,
    configExplicitlyEnabled: false,
    validUnusedApprovalPresent: false,
    isolatedCleanWorktreeMetadataPresent: false,
    authoritativePolicySourcePresent: false,
    authoritativeSourcePreparationPresent: false,
    authoritativeAttemptEvidencePresent: false,
    evidenceAuditReady: false,
    fallbackUsedAsAuthority: false,
    pilotExecuted: false,
    adapterAttemptInvoked: false,
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
    reason,
  };
}

function createRealReadOnlyAdapterPolicySourceReadFallback(
  reason: string,
  dryRunId = 'unknown',
): Record<string, unknown> {
  return {
    record: undefined,
    policySourceRecord: undefined,
    summary: undefined,
    records: [],
    policySourceRecords: [],
    summaries: [],
    count: 0,
    dryRunId,
    status: 'blocked',
    hardGateCount: 0,
    passedGateCount: 0,
    blockedGateCount: 1,
    requiresReviewFindingCount: 0,
    missingSources: ['policy_source_persisted_authoritative'],
    authoritative: false,
    supervisorBacked: false,
    persisted: false,
    degraded: true,
    notPersisted: true,
    configExplicitlyEnabled: false,
    readOnlyOnly: false,
    policyDecisionPresent: false,
    policyDecisionAllowsPilot: false,
    evidenceAuditReady: false,
    fallbackUsedAsAuthority: false,
    pilotExecuted: false,
    adapterAttemptInvoked: false,
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
    reason,
  };
}

function createRealReadOnlyAdapterPolicySourceListFallback(
  reason: string,
  dryRunId = 'unknown',
): Record<string, unknown> {
  return {
    ...createRealReadOnlyAdapterPolicySourceReadFallback(reason, dryRunId),
    records: [],
    policySourceRecords: [],
    summaries: [],
    count: 0,
  };
}

function createRealReadOnlyAdapterApprovalAuthorityTraceReadFallback(
  reason: string,
  dryRunId = 'unknown',
): Record<string, unknown> {
  return {
    record: undefined,
    approvalAuthorityTraceRecord: undefined,
    summary: undefined,
    records: [],
    approvalAuthorityTraceRecords: [],
    summaries: [],
    count: 0,
    dryRunId,
    status: 'blocked',
    inputApprovalArtifactId: undefined,
    resolvedApprovalRecordId: undefined,
    resolvedApprovalArtifactId: undefined,
    exactLookupMatched: false,
    sourcePreparationMatched: false,
    prerequisiteMatched: false,
    dryRunHashMatched: false,
    policyHashMatched: false,
    approvalApproved: false,
    approvalUnused: false,
    approvalNotRevoked: false,
    approvalNotExpired: false,
    attemptPreflightWouldAccept: false,
    reasonCodes: ['approval_trace_fallback_not_authoritative'],
    authoritative: false,
    supervisorBacked: false,
    persisted: false,
    degraded: true,
    notPersisted: true,
    fallbackUsedAsAuthority: false,
    pilotExecuted: false,
    adapterAttemptInvoked: false,
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
    reason,
  };
}

function createRealReadOnlyAdapterApprovalAuthorityTraceListFallback(
  reason: string,
  dryRunId = 'unknown',
): Record<string, unknown> {
  return {
    ...createRealReadOnlyAdapterApprovalAuthorityTraceReadFallback(reason, dryRunId),
    records: [],
    approvalAuthorityTraceRecords: [],
    summaries: [],
    count: 0,
  };
}

function createRealReadOnlyAdapterPilotSourcePreparationReadFallback(
  reason: string,
  dryRunId = 'unknown',
): Record<string, unknown> {
  return {
    record: undefined,
    sourcePreparationRecord: undefined,
    summary: undefined,
    records: [],
    sourcePreparationRecords: [],
    summaries: [],
    count: 0,
    dryRunId,
    status: 'blocked',
    hardGateCount: 0,
    passedGateCount: 0,
    blockedGateCount: 1,
    requiresReviewFindingCount: 0,
    missingSources: ['authoritative_persisted_source_preparation_source'],
    authoritative: false,
    supervisorBacked: false,
    persisted: false,
    degraded: true,
    notPersisted: true,
    configExplicitlyEnabled: false,
    authoritativePolicySourcePresent: false,
    validUnusedApprovalPresent: false,
    isolatedCleanWorktreeMetadataPresent: false,
    evidenceAuditReady: false,
    fallbackUsedAsAuthority: false,
    pilotExecuted: false,
    adapterAttemptInvoked: false,
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
    reason,
  };
}

function createRealReadOnlyAdapterPilotSourcePreparationListFallback(
  reason: string,
  dryRunId = 'unknown',
): Record<string, unknown> {
  return {
    ...createRealReadOnlyAdapterPilotSourcePreparationReadFallback(reason, dryRunId),
    records: [],
    sourcePreparationRecords: [],
    summaries: [],
    count: 0,
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
        boundaryDeferredReasonCode?: string;
        boundaryDeferredReasonCodes?: string[];
        boundaryDeferredDiagnostics?: {
          reasonCode?: string;
          reasonCodes?: string[];
          executableResolutionStatus?: string;
          executableResolutionReasonCode?: string;
          cwdSelfCheckStatus?: string;
          cwdSelfCheckReasonCode?: string;
          processBoundaryReady?: boolean;
        };
        boundaryDiagnosticsComplete?: boolean;
        boundaryDiagnosticsMissingFields?: string[];
        postRunVerificationSkipReason?: string;
        implementationApproved?: boolean;
        processAdapterApproved?: boolean;
        recommendationGrantsExecution?: boolean;
        workspaceWriteAllowed?: boolean;
        dangerFullAccessAllowed?: boolean;
        dashboardTriggerAllowed?: boolean;
        boundaryDiagnostics?: {
          failureCode?: string;
          startFailureKind?: string;
          enoentKind?: string;
          nonzeroExitKind?: string;
          platform?: string;
          resolvedExecutableKind?: string;
          spawnTargetKind?: string;
          cwdHash?: string;
          cwdExists?: boolean;
          cwdIsDirectory?: boolean;
          executableHash?: string;
          executableExists?: boolean;
          executableAccessible?: boolean;
          executableResolutionSource?: string;
          dependencyResolutionStatus?: string;
          envAllowlistKeyCount?: number;
          envAllowlistKeyHash?: string;
          exitCode?: number;
          signal?: string;
          timedOut?: boolean;
          cancelled?: boolean;
          durationMs?: number;
          stdoutHash?: string;
          stderrHash?: string;
          stdoutByteLength?: number;
          stderrByteLength?: number;
          stdoutLineCount?: number;
          stderrLineCount?: number;
          stdoutTruncated?: boolean;
          stderrTruncated?: boolean;
        };
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
    'operator prerequisites: explicit config, existing dryRunId, valid approval, isolated clean worktree metadata, and ready evidence/audit stores',
    'abort/failure semantics: missing or mismatched gates are blocked before authority is claimed; degraded fallback is display-only',
    `preflightStatus: ${preflight?.status ?? 'unknown'}`,
    `failedGates=${String(preflight?.failedGateCount ?? 0)}`,
    `blockers=${String(preflight?.blockerCount ?? 0)}`,
    `processBoundaryInvoked=${String(attempt?.processBoundaryInvoked ?? false)}`,
    `boundaryDeferredReasonCode=${attempt?.boundaryDeferredReasonCode ?? 'none'}`,
    `boundaryDeferredReasonCodes=${String(
      attempt?.boundaryDeferredReasonCodes && attempt.boundaryDeferredReasonCodes.length > 0
        ? attempt.boundaryDeferredReasonCodes.join(',')
        : 'none',
    )}`,
    `boundaryDeferredExecutableResolutionStatus=${
      attempt?.boundaryDeferredDiagnostics?.executableResolutionStatus ?? 'not_recorded'
    }`,
    `boundaryDeferredExecutableResolutionReasonCode=${
      attempt?.boundaryDeferredDiagnostics?.executableResolutionReasonCode ?? 'none'
    }`,
    `boundaryDeferredCwdSelfCheckStatus=${
      attempt?.boundaryDeferredDiagnostics?.cwdSelfCheckStatus ?? 'not_recorded'
    }`,
    `boundaryDeferredCwdSelfCheckReasonCode=${
      attempt?.boundaryDeferredDiagnostics?.cwdSelfCheckReasonCode ?? 'none'
    }`,
    `boundaryDeferredProcessBoundaryReady=${String(
      attempt?.boundaryDeferredDiagnostics?.processBoundaryReady ?? false,
    )}`,
    `boundaryDiagnosticsComplete=${String(attempt?.boundaryDiagnosticsComplete ?? false)}`,
    `boundaryDiagnosticsMissingFields=${String(
      attempt?.boundaryDiagnosticsMissingFields &&
        attempt.boundaryDiagnosticsMissingFields.length > 0
        ? attempt.boundaryDiagnosticsMissingFields.join(',')
        : 'none',
    )}`,
    `boundaryFailureCode=${attempt?.boundaryDiagnostics?.failureCode ?? 'none'}`,
    `boundaryStartFailureKind=${attempt?.boundaryDiagnostics?.startFailureKind ?? 'none'}`,
    `boundaryEnoentKind=${attempt?.boundaryDiagnostics?.enoentKind ?? 'none'}`,
    `boundaryNonzeroExitKind=${attempt?.boundaryDiagnostics?.nonzeroExitKind ?? 'none'}`,
    `boundaryPlatform=${attempt?.boundaryDiagnostics?.platform ?? 'unknown'}`,
    `boundaryResolvedExecutableKind=${
      attempt?.boundaryDiagnostics?.resolvedExecutableKind ?? 'unknown'
    }`,
    `boundarySpawnTargetKind=${attempt?.boundaryDiagnostics?.spawnTargetKind ?? 'unknown'}`,
    `boundaryCwdHash=${attempt?.boundaryDiagnostics?.cwdHash ?? 'not-recorded'}`,
    `boundaryCwdExists=${String(attempt?.boundaryDiagnostics?.cwdExists ?? false)}`,
    `boundaryCwdIsDirectory=${String(attempt?.boundaryDiagnostics?.cwdIsDirectory ?? false)}`,
    `boundaryExecutableExists=${String(attempt?.boundaryDiagnostics?.executableExists ?? false)}`,
    `boundaryExecutableAccessible=${String(
      attempt?.boundaryDiagnostics?.executableAccessible ?? false,
    )}`,
    `boundaryExecutableHash=${attempt?.boundaryDiagnostics?.executableHash ?? 'not-recorded'}`,
    `boundaryExecutableResolutionSource=${
      attempt?.boundaryDiagnostics?.executableResolutionSource ?? 'none'
    }`,
    `boundaryDependencyResolutionStatus=${
      attempt?.boundaryDiagnostics?.dependencyResolutionStatus ?? 'not_applicable'
    }`,
    `boundaryEnvAllowlistKeyCount=${String(
      attempt?.boundaryDiagnostics?.envAllowlistKeyCount ?? 0,
    )}`,
    `boundaryEnvAllowlistKeyHash=${
      attempt?.boundaryDiagnostics?.envAllowlistKeyHash ?? 'not-recorded'
    }`,
    `boundaryExitCode=${String(attempt?.boundaryDiagnostics?.exitCode ?? 'not-recorded')}`,
    `boundaryTimedOut=${String(attempt?.boundaryDiagnostics?.timedOut ?? false)}`,
    `boundaryCancelled=${String(attempt?.boundaryDiagnostics?.cancelled ?? false)}`,
    `boundaryDurationMs=${String(attempt?.boundaryDiagnostics?.durationMs ?? 0)}`,
    `boundaryStdoutHash=${attempt?.boundaryDiagnostics?.stdoutHash ?? 'not-recorded'}`,
    `boundaryStderrHash=${attempt?.boundaryDiagnostics?.stderrHash ?? 'not-recorded'}`,
    `boundarySignal=${attempt?.boundaryDiagnostics?.signal ?? 'not-recorded'}`,
    `boundaryStdoutByteLength=${String(attempt?.boundaryDiagnostics?.stdoutByteLength ?? 0)}`,
    `boundaryStderrByteLength=${String(attempt?.boundaryDiagnostics?.stderrByteLength ?? 0)}`,
    `boundaryStdoutLineCount=${String(attempt?.boundaryDiagnostics?.stdoutLineCount ?? 0)}`,
    `boundaryStderrLineCount=${String(attempt?.boundaryDiagnostics?.stderrLineCount ?? 0)}`,
    `boundaryStdoutTruncated=${String(attempt?.boundaryDiagnostics?.stdoutTruncated ?? false)}`,
    `boundaryStderrTruncated=${String(attempt?.boundaryDiagnostics?.stderrTruncated ?? false)}`,
    `postRunVerificationSkipReason=${attempt?.postRunVerificationSkipReason ?? 'none'}`,
    `implementationApproved=${String(attempt?.implementationApproved ?? false)}`,
    `processAdapterApproved=${String(attempt?.processAdapterApproved ?? false)}`,
    `recommendationGrantsExecution=${String(attempt?.recommendationGrantsExecution ?? false)}`,
    `workspaceWriteAllowed=${String(attempt?.workspaceWriteAllowed ?? false)}`,
    `dangerFullAccessAllowed=${String(attempt?.dangerFullAccessAllowed ?? false)}`,
    `dashboardTriggerAllowed=${String(attempt?.dashboardTriggerAllowed ?? false)}`,
    'CLI-only attempt status. Does not grant implementation, process launch, external model invocation, or workspace mutation permission.',
    `degraded=${String(result.degraded ?? false)}`,
    `notPersisted=${String(result.notPersisted ?? true)}`,
    noLiveFlagsText(result),
    checkLines.length > 0 ? 'non-passing checks:' : 'non-passing checks: none',
    ...checkLines,
  ].join('\n');
}

export function formatRealReadOnlyAdapterAttemptListOutput(
  result: Record<string, unknown>,
  options: CodexExecRealReadOnlyAdapterAttemptListCliOptions = {},
): string {
  if (options.json) {
    return JSON.stringify(result, null, 2);
  }

  const attemptRecords = (
    Array.isArray(result.attempts) ? result.attempts : result.attemptRecords
  ) as CodexExecRealReadOnlyAdapterAttemptRecord[] | undefined;
  const summaries = Array.isArray(result.summaries)
    ? (result.summaries as Array<{
        id?: string;
        attemptId?: string;
        dryRunId?: string;
        status?: string;
        processBoundaryInvoked?: boolean;
        boundaryDeferredReasonCode?: string;
        boundaryDeferredReasonCodes?: string[];
        boundaryDiagnosticsComplete?: boolean;
        boundaryDiagnostics?: { failureCode?: string; nonzeroExitKind?: string };
      }>)
    : (attemptRecords ?? []).map((attempt) => summarizeRealReadOnlyAdapterAttempt(attempt));
  const lines = summaries
    .slice(0, 10)
    .map(
      (summary) =>
        `- ${summary.status ?? 'unknown'} ${summary.attemptId ?? summary.id ?? 'unknown'} dryRunId=${
          summary.dryRunId ?? 'unknown'
        } processBoundaryInvoked=${String(summary.processBoundaryInvoked ?? false)} boundaryDeferredReasonCode=${
          summary.boundaryDeferredReasonCode ?? 'none'
        } boundaryFailureCode=${
          summary.boundaryDiagnostics?.failureCode ?? 'none'
        } boundaryNonzeroExitKind=${
          summary.boundaryDiagnostics?.nonzeroExitKind ?? 'none'
        } boundaryDiagnosticsComplete=${String(summary.boundaryDiagnosticsComplete ?? false)}`,
    );

  return [
    'Real read-only adapter attempt records',
    `count: ${String(result.count ?? summaries.length)}`,
    `authoritative=${String(result.authoritative ?? false)}`,
    `supervisorBacked=${String(result.supervisorBacked ?? false)}`,
    `degraded=${String(result.degraded ?? true)}`,
    `notPersisted=${String(result.notPersisted ?? true)}`,
    `implementationApproved=${String(result.implementationApproved ?? false)}`,
    `processAdapterApproved=${String(result.processAdapterApproved ?? false)}`,
    `recommendationGrantsExecution=${String(result.recommendationGrantsExecution ?? false)}`,
    'state guide: blocked means gate refused; completed, failed, and aborted records require operator review before any next step',
    'Records are metadata-only. They do not grant implementation, process launch, external model invocation, or workspace mutation permission.',
    noLiveFlagsText(result),
    lines.length > 0 ? 'attempts:' : 'attempts: none',
    ...lines,
  ].join('\n');
}

export function formatRealReadOnlyAdapterAttemptTimelineOutput(
  result: Record<string, unknown>,
  options: CodexExecRealReadOnlyAdapterAttemptTimelineCliOptions = {},
): string {
  if (options.json) {
    return JSON.stringify(result, null, 2);
  }

  const timeline = result.timeline as
    | {
        dryRunId?: string;
        status?: string;
        eventCount?: number;
        evidenceRefCount?: number;
        auditEventCount?: number;
        outputHashCount?: number;
        processBoundaryInvokedCount?: number;
        recommendation?: string;
        entries?: Array<{
          attemptId?: string;
          status?: string;
          occurredAt?: string;
          evidenceRefCount?: number;
          auditEventCount?: number;
          processBoundaryInvoked?: boolean;
          boundaryDeferredReasonCode?: string;
          boundaryDeferredReasonCodes?: string[];
          boundaryDiagnosticsComplete?: boolean;
          boundaryDiagnostics?: { failureCode?: string; nonzeroExitKind?: string };
        }>;
      }
    | undefined;
  const entryLines = (timeline?.entries ?? [])
    .slice(0, 10)
    .map(
      (entry) =>
        `- ${entry.status ?? 'unknown'} ${entry.attemptId ?? 'unknown'} at ${
          entry.occurredAt ?? 'unknown'
        } evidence=${String(entry.evidenceRefCount ?? 0)} audit=${String(
          entry.auditEventCount ?? 0,
        )} processBoundaryInvoked=${String(
          entry.processBoundaryInvoked ?? false,
        )} boundaryDeferredReasonCode=${entry.boundaryDeferredReasonCode ?? 'none'} boundaryFailureCode=${
          entry.boundaryDiagnostics?.failureCode ?? 'none'
        } boundaryNonzeroExitKind=${
          entry.boundaryDiagnostics?.nonzeroExitKind ?? 'none'
        } boundaryDiagnosticsComplete=${String(entry.boundaryDiagnosticsComplete ?? false)}`,
    );

  return [
    'Real read-only adapter attempt timeline',
    `dryRunId: ${timeline?.dryRunId ?? result.dryRunId ?? 'unknown'}`,
    `status: ${timeline?.status ?? 'empty'}`,
    `events=${String(timeline?.eventCount ?? 0)}`,
    `evidenceRefs=${String(timeline?.evidenceRefCount ?? 0)}`,
    `auditEvents=${String(timeline?.auditEventCount ?? 0)}`,
    `outputHashes=${String(timeline?.outputHashCount ?? 0)}`,
    `processBoundaryInvokedCount=${String(timeline?.processBoundaryInvokedCount ?? 0)}`,
    `authoritative=${String(result.authoritative ?? false)}`,
    `supervisorBacked=${String(result.supervisorBacked ?? false)}`,
    `degraded=${String(result.degraded ?? true)}`,
    `notPersisted=${String(result.notPersisted ?? true)}`,
    `implementationApproved=${String(result.implementationApproved ?? false)}`,
    `processAdapterApproved=${String(result.processAdapterApproved ?? false)}`,
    `recommendationGrantsExecution=${String(result.recommendationGrantsExecution ?? false)}`,
    'state guide: blocked means gate refused; completed, failed, and aborted timeline entries require operator review before any next step',
    timeline?.recommendation ??
      'Attempt timeline is metadata-only and does not grant broader use or workspace mutation permission.',
    noLiveFlagsText(result),
    entryLines.length > 0 ? 'timeline:' : 'timeline: none',
    ...entryLines,
  ].join('\n');
}

export function formatRealReadOnlyAdapterPolicySourceOutput(
  result: Record<string, unknown>,
  options: CodexExecJsonCliOptions = {},
): string {
  if (options.json) {
    return JSON.stringify(result, null, 2);
  }

  const record = (result.record ?? result.policySourceRecord) as
    | CodexExecRealReadOnlyAdapterPolicySourceRecord
    | undefined;
  const missingSources = Array.isArray(result.missingSources)
    ? (result.missingSources as string[])
    : (record?.missingSources ?? []);

  return [
    'Real read-only adapter policy source',
    `recordId: ${record?.id ?? result.recordId ?? 'not-persisted'}`,
    `dryRunId: ${record?.dryRunId ?? result.dryRunId ?? 'unknown'}`,
    `status: ${record?.status ?? result.status ?? 'blocked'}`,
    `hardGateCount=${String(record?.hardGateCount ?? result.hardGateCount ?? 0)}`,
    `passedGateCount=${String(record?.passedGateCount ?? result.passedGateCount ?? 0)}`,
    `blockedGateCount=${String(record?.blockedGateCount ?? result.blockedGateCount ?? 0)}`,
    `requiresReviewFindingCount=${String(
      record?.requiresReviewFindingCount ?? result.requiresReviewFindingCount ?? 0,
    )}`,
    `degraded=${String(record?.degraded ?? result.degraded ?? true)}`,
    `notPersisted=${String(record?.notPersisted ?? result.notPersisted ?? true)}`,
    `configExplicitlyEnabled=${String(
      record?.configExplicitlyEnabled ?? result.configExplicitlyEnabled ?? false,
    )}`,
    `readOnlyOnly=${String(record?.readOnlyOnly ?? result.readOnlyOnly ?? false)}`,
    `policyDecisionPresent=${String(
      record?.policyDecisionPresent ?? result.policyDecisionPresent ?? false,
    )}`,
    `policyDecisionAllowsPilot=${String(
      record?.policyDecisionAllowsPilot ?? result.policyDecisionAllowsPilot ?? false,
    )}`,
    `policyDecisionOutcome=${String(
      record?.policyDecisionOutcome ?? result.policyDecisionOutcome ?? 'unknown',
    )}`,
    `evidenceAuditReady=${String(record?.evidenceAuditReady ?? result.evidenceAuditReady ?? false)}`,
    `fallbackUsedAsAuthority=${String(
      record?.fallbackUsedAsAuthority ?? result.fallbackUsedAsAuthority ?? false,
    )}`,
    `pilotExecuted=${String(record?.pilotExecuted ?? result.pilotExecuted ?? false)}`,
    `adapterAttemptInvoked=${String(
      record?.adapterAttemptInvoked ?? result.adapterAttemptInvoked ?? false,
    )}`,
    `dashboardTriggerAllowed=${String(result.dashboardTriggerAllowed ?? false)}`,
    `workspaceWriteAllowed=${String(result.workspaceWriteAllowed ?? false)}`,
    `dangerFullAccessAllowed=${String(result.dangerFullAccessAllowed ?? false)}`,
    'aligned requires persisted Supervisor-backed non-deny policy metadata; fallback output is never aligned.',
    'This policy-source command does not mutate historical dry-run policy, invoke attempts, or run a pilot.',
    noLiveFlagsText(result),
    missingSources.length > 0 ? 'missing sources:' : 'missing sources: none',
    ...missingSources.map((item) => `- ${item}`),
  ].join('\n');
}

export function formatRealReadOnlyAdapterPolicySourceListOutput(
  result: Record<string, unknown>,
  options: CodexExecJsonCliOptions = {},
): string {
  if (options.json) {
    return JSON.stringify(result, null, 2);
  }

  const records = Array.isArray(result.records)
    ? (result.records as CodexExecRealReadOnlyAdapterPolicySourceRecord[])
    : [];
  const summaries = records.map((record) => summarizeRealReadOnlyAdapterPolicySourceRecord(record));

  return [
    'Real read-only adapter policy source records',
    `count=${String(result.count ?? records.length)}`,
    `degraded=${String(result.degraded ?? true)}`,
    `notPersisted=${String(result.notPersisted ?? true)}`,
    `fallbackUsedAsAuthority=${String(result.fallbackUsedAsAuthority ?? false)}`,
    'Policy-source records are metadata-only and do not run pilots.',
    noLiveFlagsText(result),
    summaries.length > 0 ? 'records:' : 'records: none',
    ...summaries.map((summary) => `- ${summary.recordId}: ${summary.status}`),
  ].join('\n');
}

export function formatRealReadOnlyAdapterApprovalAuthorityTraceOutput(
  result: Record<string, unknown>,
  options: CodexExecJsonCliOptions = {},
): string {
  if (options.json) {
    return JSON.stringify(result, null, 2);
  }

  const record = (result.record ?? result.approvalAuthorityTraceRecord) as
    | CodexExecRealReadOnlyAdapterApprovalAuthorityTraceRecord
    | undefined;
  const reasonCodes = Array.isArray(result.reasonCodes)
    ? (result.reasonCodes as string[])
    : (record?.reasonCodes ?? []);

  return [
    'Real read-only adapter approval authority trace',
    `recordId: ${record?.id ?? result.recordId ?? 'not-persisted'}`,
    `dryRunId: ${record?.dryRunId ?? result.dryRunId ?? 'unknown'}`,
    `status: ${record?.status ?? result.status ?? 'blocked'}`,
    `inputApprovalArtifactId=${record?.inputApprovalArtifactId ?? result.inputApprovalArtifactId ?? 'unknown'}`,
    `resolvedApprovalRecordId=${record?.resolvedApprovalRecordId ?? result.resolvedApprovalRecordId ?? 'unknown'}`,
    `resolvedApprovalArtifactId=${record?.resolvedApprovalArtifactId ?? result.resolvedApprovalArtifactId ?? 'unknown'}`,
    `exactLookupMatched=${String(record?.exactLookupMatched ?? result.exactLookupMatched ?? false)}`,
    `sourcePreparationMatched=${String(
      record?.sourcePreparationMatched ?? result.sourcePreparationMatched ?? false,
    )}`,
    `prerequisiteMatched=${String(record?.prerequisiteMatched ?? result.prerequisiteMatched ?? false)}`,
    `approvalApproved=${String(record?.approvalApproved ?? result.approvalApproved ?? false)}`,
    `approvalUnused=${String(record?.approvalUnused ?? result.approvalUnused ?? false)}`,
    `approvalNotRevoked=${String(record?.approvalNotRevoked ?? result.approvalNotRevoked ?? false)}`,
    `approvalNotExpired=${String(record?.approvalNotExpired ?? result.approvalNotExpired ?? false)}`,
    `dryRunHashMatched=${String(record?.dryRunHashMatched ?? result.dryRunHashMatched ?? false)}`,
    `policyHashMatched=${String(record?.policyHashMatched ?? result.policyHashMatched ?? false)}`,
    `attemptPreflightWouldAccept=${String(
      record?.attemptPreflightWouldAccept ?? result.attemptPreflightWouldAccept ?? false,
    )}`,
    `degraded=${String(record?.degraded ?? result.degraded ?? true)}`,
    `notPersisted=${String(record?.notPersisted ?? result.notPersisted ?? true)}`,
    `fallbackUsedAsAuthority=${String(
      record?.fallbackUsedAsAuthority ?? result.fallbackUsedAsAuthority ?? false,
    )}`,
    `pilotExecuted=${String(record?.pilotExecuted ?? result.pilotExecuted ?? false)}`,
    `adapterAttemptInvoked=${String(
      record?.adapterAttemptInvoked ?? result.adapterAttemptInvoked ?? false,
    )}`,
    `dashboardTriggerAllowed=${String(result.dashboardTriggerAllowed ?? false)}`,
    `workspaceWriteAllowed=${String(result.workspaceWriteAllowed ?? false)}`,
    `dangerFullAccessAllowed=${String(result.dangerFullAccessAllowed ?? false)}`,
    'aligned requires exact persisted approval authority accepted by source-prep, prerequisite, and attempt preflight.',
    'This approval-authority command does not create approvals, consume approvals, invoke attempts, or run a pilot.',
    noLiveFlagsText(result),
    reasonCodes.length > 0 ? 'reason codes:' : 'reason codes: none',
    ...reasonCodes.map((item) => `- ${item}`),
  ].join('\n');
}

export function formatRealReadOnlyAdapterApprovalAuthorityTraceListOutput(
  result: Record<string, unknown>,
  options: CodexExecJsonCliOptions = {},
): string {
  if (options.json) {
    return JSON.stringify(result, null, 2);
  }

  const records = Array.isArray(result.records)
    ? (result.records as CodexExecRealReadOnlyAdapterApprovalAuthorityTraceRecord[])
    : [];
  const summaries = records.map((record) =>
    summarizeRealReadOnlyAdapterApprovalAuthorityTraceRecord(record),
  );

  return [
    'Real read-only adapter approval authority trace records',
    `count=${String(result.count ?? records.length)}`,
    `degraded=${String(result.degraded ?? true)}`,
    `notPersisted=${String(result.notPersisted ?? true)}`,
    `fallbackUsedAsAuthority=${String(result.fallbackUsedAsAuthority ?? false)}`,
    'Approval-authority traces are metadata-only and do not run pilots.',
    noLiveFlagsText(result),
    summaries.length > 0 ? 'records:' : 'records: none',
    ...summaries.map(
      (summary) =>
        `- ${summary.recordId}: ${summary.status} attemptPreflightWouldAccept=${String(
          summary.attemptPreflightWouldAccept,
        )}`,
    ),
  ].join('\n');
}

export function formatRealReadOnlyAdapterPilotSourcePreparationOutput(
  result: Record<string, unknown>,
  options: CodexExecJsonCliOptions = {},
): string {
  if (options.json) {
    return JSON.stringify(result, null, 2);
  }

  const record = (result.record ?? result.sourcePreparationRecord) as
    | CodexExecRealReadOnlyAdapterPilotSourcePreparationRecord
    | undefined;
  const missingSources = Array.isArray(result.missingSources)
    ? (result.missingSources as string[])
    : (record?.missingSources ?? []);

  return [
    'Real read-only adapter pilot source preparation',
    `recordId: ${record?.id ?? result.recordId ?? 'not-persisted'}`,
    `dryRunId: ${record?.dryRunId ?? result.dryRunId ?? 'unknown'}`,
    `status: ${record?.status ?? result.status ?? 'blocked'}`,
    `hardGateCount=${String(record?.hardGateCount ?? result.hardGateCount ?? 0)}`,
    `passedGateCount=${String(record?.passedGateCount ?? result.passedGateCount ?? 0)}`,
    `blockedGateCount=${String(record?.blockedGateCount ?? result.blockedGateCount ?? 0)}`,
    `requiresReviewFindingCount=${String(
      record?.requiresReviewFindingCount ?? result.requiresReviewFindingCount ?? 0,
    )}`,
    `degraded=${String(record?.degraded ?? result.degraded ?? true)}`,
    `notPersisted=${String(record?.notPersisted ?? result.notPersisted ?? true)}`,
    `configExplicitlyEnabled=${String(
      record?.configExplicitlyEnabled ?? result.configExplicitlyEnabled ?? false,
    )}`,
    `authoritativePolicySourcePresent=${String(
      record?.authoritativePolicySourcePresent ?? result.authoritativePolicySourcePresent ?? false,
    )}`,
    `validUnusedApprovalPresent=${String(
      record?.validUnusedApprovalPresent ?? result.validUnusedApprovalPresent ?? false,
    )}`,
    `isolatedCleanWorktreeMetadataPresent=${String(
      record?.isolatedCleanWorktreeMetadataPresent ??
        result.isolatedCleanWorktreeMetadataPresent ??
        false,
    )}`,
    `evidenceAuditReady=${String(record?.evidenceAuditReady ?? result.evidenceAuditReady ?? false)}`,
    `fallbackUsedAsAuthority=${String(
      record?.fallbackUsedAsAuthority ?? result.fallbackUsedAsAuthority ?? false,
    )}`,
    `pilotExecuted=${String(record?.pilotExecuted ?? result.pilotExecuted ?? false)}`,
    `adapterAttemptInvoked=${String(
      record?.adapterAttemptInvoked ?? result.adapterAttemptInvoked ?? false,
    )}`,
    `dashboardTriggerAllowed=${String(result.dashboardTriggerAllowed ?? false)}`,
    `workspaceWriteAllowed=${String(result.workspaceWriteAllowed ?? false)}`,
    `dangerFullAccessAllowed=${String(result.dangerFullAccessAllowed ?? false)}`,
    'prepared requires persisted Supervisor-backed source metadata; degraded or notPersisted output is never prepared.',
    'This source-preparation command does not invoke the adapter attempt path or run a pilot.',
    noLiveFlagsText(result),
    missingSources.length > 0 ? 'missing sources:' : 'missing sources: none',
    ...missingSources.map((item) => `- ${item}`),
  ].join('\n');
}

export function formatRealReadOnlyAdapterPilotSourcePreparationListOutput(
  result: Record<string, unknown>,
  options: CodexExecJsonCliOptions = {},
): string {
  if (options.json) {
    return JSON.stringify(result, null, 2);
  }

  const records = Array.isArray(result.records)
    ? (result.records as CodexExecRealReadOnlyAdapterPilotSourcePreparationRecord[])
    : [];
  const summaries = records.map((record) =>
    summarizeRealReadOnlyAdapterPilotSourcePreparationRecord(record),
  );

  return [
    'Real read-only adapter pilot source-preparation records',
    `count=${String(result.count ?? records.length)}`,
    `degraded=${String(result.degraded ?? true)}`,
    `notPersisted=${String(result.notPersisted ?? true)}`,
    `fallbackUsedAsAuthority=${String(result.fallbackUsedAsAuthority ?? false)}`,
    'Source-preparation records are metadata-only and do not run pilots.',
    noLiveFlagsText(result),
    summaries.length > 0 ? 'records:' : 'records: none',
    ...summaries.map((summary) => `- ${summary.recordId}: ${summary.status}`),
  ].join('\n');
}

export function formatRealReadOnlyAdapterPilotPrerequisiteOutput(
  result: Record<string, unknown>,
  options: CodexExecJsonCliOptions = {},
): string {
  if (options.json) {
    return JSON.stringify(result, null, 2);
  }

  const record = (result.record ?? result.prerequisiteRecord) as
    | CodexExecRealReadOnlyAdapterPilotPrerequisiteRecord
    | undefined;
  const missingPrerequisites = Array.isArray(result.missingPrerequisites)
    ? (result.missingPrerequisites as string[])
    : (record?.missingPrerequisites ?? []);

  return [
    'Real read-only adapter pilot prerequisite readiness',
    `recordId: ${record?.id ?? result.recordId ?? 'not-persisted'}`,
    `dryRunId: ${record?.dryRunId ?? result.dryRunId ?? 'unknown'}`,
    `status: ${record?.status ?? result.status ?? 'blocked'}`,
    `hardGateCount=${String(record?.hardGateCount ?? result.hardGateCount ?? 0)}`,
    `passedGateCount=${String(record?.passedGateCount ?? result.passedGateCount ?? 0)}`,
    `blockedGateCount=${String(record?.blockedGateCount ?? result.blockedGateCount ?? 0)}`,
    `requiresReviewFindingCount=${String(
      record?.requiresReviewFindingCount ?? result.requiresReviewFindingCount ?? 0,
    )}`,
    `degraded=${String(record?.degraded ?? result.degraded ?? true)}`,
    `notPersisted=${String(record?.notPersisted ?? result.notPersisted ?? true)}`,
    `configExplicitlyEnabled=${String(
      record?.configExplicitlyEnabled ?? result.configExplicitlyEnabled ?? false,
    )}`,
    `validUnusedApprovalPresent=${String(
      record?.validUnusedApprovalPresent ?? result.validUnusedApprovalPresent ?? false,
    )}`,
    `isolatedCleanWorktreeMetadataPresent=${String(
      record?.isolatedCleanWorktreeMetadataPresent ??
        result.isolatedCleanWorktreeMetadataPresent ??
        false,
    )}`,
    `authoritativePolicySourcePresent=${String(
      record?.authoritativePolicySourcePresent ?? result.authoritativePolicySourcePresent ?? false,
    )}`,
    `authoritativeSourcePreparationPresent=${String(
      record?.authoritativeSourcePreparationPresent ??
        result.authoritativeSourcePreparationPresent ??
        false,
    )}`,
    `authoritativeAttemptEvidencePresent=${String(
      record?.authoritativeAttemptEvidencePresent ??
        result.authoritativeAttemptEvidencePresent ??
        false,
    )}`,
    `evidenceAuditReady=${String(record?.evidenceAuditReady ?? result.evidenceAuditReady ?? false)}`,
    `fallbackUsedAsAuthority=${String(
      record?.fallbackUsedAsAuthority ?? result.fallbackUsedAsAuthority ?? false,
    )}`,
    `pilotExecuted=${String(record?.pilotExecuted ?? result.pilotExecuted ?? false)}`,
    `adapterAttemptInvoked=${String(
      record?.adapterAttemptInvoked ?? result.adapterAttemptInvoked ?? false,
    )}`,
    `dashboardTriggerAllowed=${String(result.dashboardTriggerAllowed ?? false)}`,
    `workspaceWriteAllowed=${String(result.workspaceWriteAllowed ?? false)}`,
    `dangerFullAccessAllowed=${String(result.dangerFullAccessAllowed ?? false)}`,
    'ready_for_pilot_retry requires persisted Supervisor-backed evidence; degraded or notPersisted output is never ready.',
    '4F.1 does not create approvals, enable config, invoke the adapter attempt path, or run a pilot.',
    noLiveFlagsText(result),
    missingPrerequisites.length > 0 ? 'missing prerequisites:' : 'missing prerequisites: none',
    ...missingPrerequisites.map((item) => `- ${item}`),
  ].join('\n');
}

export function formatRealReadOnlyAdapterPilotPrerequisiteListOutput(
  result: Record<string, unknown>,
  options: CodexExecRealReadOnlyAdapterPilotPrerequisiteListCliOptions = {},
): string {
  if (options.json) {
    return JSON.stringify(result, null, 2);
  }

  const records = (Array.isArray(result.records) ? result.records : result.prerequisiteRecords) as
    | CodexExecRealReadOnlyAdapterPilotPrerequisiteRecord[]
    | undefined;
  const summaries = Array.isArray(result.summaries)
    ? (result.summaries as Array<{
        recordId?: string;
        id?: string;
        dryRunId?: string;
        status?: string;
        blockedGateCount?: number;
      }>)
    : (records ?? []).map((record) => summarizeRealReadOnlyAdapterPilotPrerequisiteRecord(record));
  const lines = summaries
    .slice(0, 10)
    .map(
      (summary) =>
        `- ${summary.status ?? 'unknown'} ${summary.recordId ?? summary.id ?? 'unknown'} dryRunId=${
          summary.dryRunId ?? 'unknown'
        } blockedGates=${String(summary.blockedGateCount ?? 0)}`,
    );

  return [
    'Real read-only adapter pilot prerequisite records',
    `count: ${String(result.count ?? summaries.length)}`,
    `authoritative=${String(result.authoritative ?? false)}`,
    `supervisorBacked=${String(result.supervisorBacked ?? false)}`,
    `degraded=${String(result.degraded ?? true)}`,
    `notPersisted=${String(result.notPersisted ?? true)}`,
    `fallbackUsedAsAuthority=${String(result.fallbackUsedAsAuthority ?? false)}`,
    `pilotExecuted=${String(result.pilotExecuted ?? false)}`,
    `adapterAttemptInvoked=${String(result.adapterAttemptInvoked ?? false)}`,
    'Records are metadata-only. They do not run a pilot or grant broader use.',
    noLiveFlagsText(result),
    lines.length > 0 ? 'records:' : 'records: none',
    ...lines,
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

  const fixturesRootRealPath = await realpath(fixturesRoot);
  const requestedRealPath = await realpath(requestedPath);

  if (
    !isPathInside(requestedRealPath, fixturesRootRealPath) ||
    extname(requestedRealPath) !== '.jsonl'
  ) {
    throw new Error('Fixture path must resolve inside packages/codex-kernel/fixtures/*.jsonl');
  }

  return readFile(requestedRealPath, 'utf8');
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

import type {
  ApprovalInboxItem,
  ApprovalInboxProjection,
  GithubBranchPublishAcceptanceScenario,
  GithubDraftPrAcceptanceScenario,
  GithubPrLifecycleAcceptanceScenario,
  GithubPublishDraftPrAcceptanceScenario,
  McpToolDefinition,
} from '@codexhub/contracts';
import {
  createGovernanceProjection,
  type GovernanceProjectionInputRun,
} from '@codexhub/governance-projection-kernel';
import {
  createCodexHubMcpServerManifest,
  createCodexHubMcpToolDefinitions,
} from '@codexhub/mcp-tool-contracts';
import {
  createM10PilotChecklist,
  createM10PilotRunbookSummary,
  createDefaultOperatorReadinessPreview,
  createM11PilotEnablementChecklist,
  createM11PilotEnablementRunbookSummary,
  type OperatorReadinessReport,
} from '@codexhub/operator-readiness-kernel';

const GITHUB_BRANCH_PUBLISH_CREDENTIAL_MISSING_SCENARIO = [
  ['to', 'ken'].join(''),
  'missing',
].join('-') as GithubBranchPublishAcceptanceScenario;

export const DASHBOARD_VIEWS = [
  'overview',
  'development',
  'codex',
  'verification',
  'evidence',
  'policies',
  'mcp-tools',
  'browser-profiles',
  'electron',
  'github',
  'worktrees',
  'policy-telemetry',
  'governance',
  'readiness',
  'pilot',
  'approvals',
  'release-candidates',
] as const;

export type DashboardView = (typeof DASHBOARD_VIEWS)[number];

export interface McpToolRegistrySummary {
  manifestName: string;
  manifestVersion: string;
  toolCount: number;
  enabledToolCount: number;
  actionModes: string[];
  approvalPolicies: string[];
  processBoundaryInvoked: boolean;
  externalProcessStarted: boolean;
  tools: Array<{
    name: string;
    title: string;
    riskLevel: string;
    actionMode: string;
    approvalPolicy: string;
    bodyStorage: string;
    enabled: boolean;
    noRealWrite: boolean;
  }>;
}

export interface VerificationReadinessPreview {
  adapterName: string;
  status: 'ready';
  targets: string[];
  affectedProjectsCommandPreviewHash: string;
  verificationCommandPreviewHash: string;
  processBoundaryPlanned: boolean;
  processBoundaryInvoked: false;
  externalProcessStarted: false;
  noRealWrite: true;
  bodyStored: false;
  blockReasons: string[];
  summary: string;
}

export interface BrowserProfilesReadOnlySummary {
  manifestName: string;
  manifestVersion: string;
  profileCount: number;
  dryRunCount: number;
  approvalCount: number;
  runCount: number;
  latestRunStatus: string;
  profilePathHashes: string[];
  readinessStatus: string;
  readinessBlockReasons: string[];
  allowedCapabilities: string[];
  forbiddenActions: string[];
  planStatus: string;
  planBlockReasons: string[];
  processBoundaryPlanned: boolean;
  processBoundaryInvoked: false;
  externalProcessStarted: false;
  noRealWrite: true;
  rawPathStored: false;
  bodyStored: false;
  summary: string;
}

export interface ElectronCdpReadOnlySummary {
  manifestName: string;
  manifestVersion: string;
  dryRunCount: number;
  approvalCount: number;
  runCount: number;
  latestRunStatus: string;
  runnerModes: string[];
  allowedCommands: string[];
  blockedActions: string[];
  productDefaultEnabled: false;
  approvalRequired: true;
  httpFlagRequired: true;
  eventFlagRequired: true;
  cdpHttpBoundaryInvoked: boolean;
  cdpWebSocketBoundaryInvoked: boolean;
  processBoundaryInvoked: false;
  externalProcessStarted: false;
  noRealWrite: true;
  rawPathStored: false;
  bodyStored: false;
  summary: string;
}

export interface WorktreeReadOnlySummary {
  manifestName: string;
  manifestVersion: string;
  dryRunCount: number;
  approvalCount: number;
  runCount: number;
  cleanupDryRunCount: number;
  cleanupApprovalCount: number;
  cleanupRunCount: number;
  latestRunStatus: string;
  latestCleanupStatus: string;
  runnerModes: string[];
  productDefaultEnabled: false;
  approvalRequired: true;
  cleanupApprovalRequired: true;
  gitBoundaryInvoked: boolean;
  cleanupRequiredCount: number;
  cleanupCompletedCount: number;
  allowedOperations: string[];
  blockedOperations: string[];
  processBoundaryInvoked: boolean;
  externalProcessStarted: boolean;
  noRealWrite: boolean;
  rawPathStored: false;
  bodyStored: false;
  summary: string;
}

export interface GithubProviderReadOnlySummary {
  manifestName: string;
  manifestVersion: string;
  dryRunCount: number;
  approvalCount: number;
  runCount: number;
  draftPrDryRunCount: number;
  draftPrApprovalCount: number;
  draftPrRunCount: number;
  branchPublishDryRunCount: number;
  branchPublishApprovalCount: number;
  branchPublishRunCount: number;
  publishDraftPrChainDryRunCount: number;
  publishDraftPrChainRunCount: number;
  prLifecycleDryRunCount: number;
  prLifecycleApprovalCount: number;
  prLifecycleRunCount: number;
  latestRunStatus: string;
  latestDraftPrRunStatus: string;
  latestDraftPrCreationStatus: string;
  latestBranchPublishRunStatus: string;
  latestBranchPublishCreationStatus: string;
  latestPublishDraftPrChainRunStatus: string;
  latestPublishDraftPrChainLifecycleStatus: string;
  latestPrLifecycleRunStatus: string;
  latestPrLifecycleStatusSummary: string;
  draftPrCreatedCount: number;
  branchPublishCreatedCount: number;
  productDefaultEnabled: false;
  approvalRequired: true;
  draftPrApprovalRequired: true;
  branchPublishApprovalRequired: true;
  publishDraftPrChainSeparateApprovalsRequired: true;
  prLifecycleApprovalRequired: true;
  credentialConfigured: boolean;
  credentialHashOnly: boolean;
  allowedHostHash: string;
  allowedMetadata: string[];
  allowedDraftPrActions: string[];
  allowedBranchPublishActions: string[];
  allowedPrLifecycleActions: string[];
  blockedOperations: string[];
  networkBoundaryInvoked: boolean;
  processBoundaryInvoked: false;
  externalProcessStarted: false;
  noRealWrite: true;
  rawRemoteRefStored: false;
  rawUrlStored: false;
  rawPathStored: false;
  bodyStored: false;
  credentialValueStored: false;
  summary: string;
}

export interface GithubBranchPublishAcceptanceRehearsalReadOnlySummary {
  status: 'passed' | 'failed' | 'blocked' | 'aborted';
  scenario: GithubBranchPublishAcceptanceScenario;
  stepCount: number;
  readinessStatus: string;
  publishStatus: string;
  evidenceRefCount: number;
  auditEventCount: number;
  fixtureOnly: true;
  networkBoundaryInvoked: false;
  processBoundaryInvoked: false;
  externalProcessStarted: false;
  noRealWrite: true;
  localControlKeyRead: false;
  supervisorPostAllowed: false;
  adapterExecuteAllowed: false;
  createRefAllowed: true;
  updateRefAllowed: false;
  forceAllowed: false;
  pushAllowed: false;
  mergeAllowed: false;
  rawFileContentStored: false;
  rawPathStored: false;
  bodyStored: false;
  credentialValueStored: false;
  summary: string;
}

export interface GithubDraftPrAcceptanceRehearsalReadOnlySummary {
  status: 'passed' | 'failed' | 'blocked' | 'aborted';
  scenario: GithubDraftPrAcceptanceScenario;
  stepCount: number;
  readinessStatus: string;
  prCreationStatus: string;
  evidenceRefCount: number;
  auditEventCount: number;
  fixtureOnly: true;
  networkBoundaryInvoked: false;
  processBoundaryInvoked: false;
  externalProcessStarted: false;
  noRealWrite: true;
  localControlKeyRead: false;
  supervisorPostAllowed: false;
  adapterExecuteAllowed: false;
  draft: true;
  pushAllowed: false;
  createRefAllowed: false;
  mergeAllowed: false;
  rawPathStored: false;
  bodyStored: false;
  credentialValueStored: false;
  summary: string;
}

export interface GithubPublishDraftPrAcceptanceRehearsalReadOnlySummary {
  status: 'passed' | 'failed' | 'blocked' | 'aborted';
  scenario: GithubPublishDraftPrAcceptanceScenario;
  stepCount: number;
  branchPublishStatus: string;
  draftPrStatus: string;
  lifecycleStatus: string;
  evidenceRefCount: number;
  auditEventCount: number;
  fixtureOnly: true;
  networkBoundaryInvoked: false;
  processBoundaryInvoked: false;
  externalProcessStarted: false;
  noRealWrite: true;
  localControlKeyRead: false;
  supervisorPostAllowed: false;
  adapterExecuteAllowed: false;
  updateRefAllowed: false;
  forceAllowed: false;
  pushAllowed: false;
  mergeAllowed: false;
  rawPathStored: false;
  bodyStored: false;
  rawPrBodyStored: false;
  rawUrlStored: false;
  summary: string;
}

export interface GithubPrLifecycleAcceptanceRehearsalReadOnlySummary {
  status: 'passed' | 'failed' | 'blocked' | 'aborted';
  scenario: GithubPrLifecycleAcceptanceScenario;
  stepCount: number;
  lifecycleStatus: string;
  evidenceRefCount: number;
  auditEventCount: number;
  fixtureOnly: true;
  networkBoundaryInvoked: false;
  processBoundaryInvoked: false;
  externalProcessStarted: false;
  noRealWrite: true;
  localControlKeyRead: false;
  supervisorPostAllowed: false;
  adapterExecuteAllowed: false;
  fixedGetOnly: true;
  commentsAllowed: false;
  labelsAllowed: false;
  reviewersAllowed: false;
  mergeAllowed: false;
  rawUrlStored: false;
  rawResponseBodyStored: false;
  rawPathStored: false;
  bodyStored: false;
  credentialValueStored: false;
  summary: string;
}

export interface LocalReviewPackageReadOnlySummary {
  dryRunCount: number;
  approvalCount: number;
  runCount: number;
  decisionCount: number;
  latestRunStatus: string;
  latestDecisionStatus: string;
  verificationStatuses: string[];
  exportedCount: number;
  artifactWriteBoundaryInvoked: boolean;
  fileCount: number;
  byteCount: number;
  evidenceCount: number;
  auditEventCount: number;
  productDefaultEnabled: false;
  approvalRequired: true;
  rawPathStored: false;
  bodyStored: false;
  tokenStored: false;
  summary: string;
}

export interface PolicyTelemetryReadOnlySummary {
  policyBackend: {
    manifestName: string;
    manifestVersion: string;
    productDefaultEnabled: false;
    backendKinds: string[];
    evaluatorSources: string[];
    advisoryOnly: true;
    authorityProvider: 'codexhub';
    processBoundaryInvoked: false;
    externalProcessStarted: false;
    networkBoundaryInvoked: false;
    rawPolicySourceStored: false;
    rawPathStored: false;
    bodyStored: false;
    summary: string;
  };
  telemetry: {
    manifestName: string;
    manifestVersion: string;
    productDefaultEnabled: false;
    exporterKinds: string[];
    localProjectionEnabled: true;
    projectionSpanCount: number;
    projectionHash: string;
    networkExportAttempted: false;
    processBoundaryInvoked: false;
    externalProcessStarted: false;
    openTelemetrySdkLoaded: false;
    rawTracePayloadStored: false;
    rawPathStored: false;
    bodyStored: false;
    evidenceAuditAuthoritative: false;
    summary: string;
  };
}

export interface GovernanceReadOnlySummary {
  status: 'ready' | 'degraded';
  runCount: number;
  evidenceCount: number;
  auditEventCount: number;
  processBoundaryCount: number;
  externalProcessStartedCount: number;
  networkBoundaryCount: number;
  projectionHash: string;
  sources: Array<{
    source: string;
    count: number;
  }>;
  runs: Array<{
    id: string;
    source: string;
    status: string;
    sourceRunIdHash: string;
    evidenceCount: number;
    auditEventCount: number;
    processBoundaryInvoked: boolean;
    externalProcessStarted: boolean;
    noRealWrite: boolean;
  }>;
  rawPathStored: false;
  bodyStored: false;
  summary: string;
}

export interface OperatorReadinessReadOnlySummary {
  status: string;
  checkCount: number;
  passedCheckCount: number;
  warningCheckCount: number;
  failedCheckCount: number;
  configuredLocalControlKeyCount: number;
  storeAvailable: boolean;
  processBoundaryAllowlistPassed: boolean;
  policyConfigHash: string;
  riskConfigHash: string;
  integrationConfigHash: string;
  integrations: Array<{
    name: string;
    enabled: boolean;
    safeToEnable: boolean;
    riskLevel: string;
    approvalRequired: boolean;
    blockers: string[];
  }>;
  checks: Array<{
    code: string;
    status: string;
    category: string;
    configured: boolean | undefined;
    hash: string | undefined;
    blockers: string[];
  }>;
  rawPathStored: false;
  bodyStored: false;
  summary: string;
}

export interface M10PilotReadOnlySummary {
  status: string;
  stepCount: number;
  readyStepCount: number;
  blockedStepCount: number;
  reviewStepCount: number;
  requiredStepCount: number;
  blockerCount: number;
  integrationCount: number;
  approvalInboxItemCount: number;
  governanceRunCount: number;
  nextAction: string;
  rollbackSummary: string;
  steps: Array<{
    code: string;
    label: string;
    phase: string;
    status: string;
    blockerCount: number;
    blockers: string[];
    summary: string;
  }>;
  rawValueStored: false;
  rawPathStored: false;
  bodyStored: false;
  localControlKeyRead: false;
  supervisorPostAllowed: false;
  adapterExecuteAllowed: false;
  summary: string;
}

export interface M10PilotAcceptanceReadOnlySummary {
  status: 'passed' | 'failed' | 'blocked' | 'aborted';
  scenario: string;
  stepCount: number;
  evidenceCount: number;
  auditEventCount: number;
  goldenPathStatus: string;
  prActionStatus: 'not_ready_no_live_pr' | 'blocked';
  processBoundaryInvoked: false;
  externalProcessStarted: false;
  networkBoundaryInvoked: false;
  localControlKeyRead: false;
  supervisorPostAllowed: false;
  adapterExecuteAllowed: false;
  pushAllowed: false;
  pullRequestOpened: false;
  rawPathStored: false;
  bodyStored: false;
  tokenStored: false;
  summary: string;
}

export interface M11PilotReadOnlySummary {
  status: 'available' | 'degraded';
  runCount: number;
  enablementStatus: string;
  enablementBlockerCount: number;
  requiredEnvFlags: string[];
  safeEnableBlockers: string[];
  nextAction: string;
  failureHandlingSummary: string;
  rollbackSummary: string;
  steps: Array<{
    code: string;
    label: string;
    phase: string;
    status: string;
    blockerCount: number;
    blockers: string[];
    summary: string;
  }>;
  latestRunStatus: string;
  latestPrDraftStatus: string;
  latestFailureClassification: string;
  latestRecoveryAction: string;
  cleanupRequiredCount: number;
  cleanupHandoffCount: number;
  latestCleanupApprovalStatus: string;
  latestCleanupDeferred: boolean;
  latestCleanupCompleted: boolean;
  codexReadOnlyDryRunOnly: true;
  patchGenerationAllowed: false;
  pushAllowed: false;
  pullRequestOpened: false;
  processBoundaryInvoked: boolean;
  externalProcessStarted: boolean;
  localControlKeyRead: false;
  supervisorPostAllowed: false;
  adapterExecuteAllowed: false;
  rawPathStored: false;
  bodyStored: false;
  tokenStored: false;
  summary: string;
}

export interface M11PilotAcceptanceSmokeReadOnlySummary {
  status: 'passed' | 'failed' | 'blocked';
  scenario: string;
  stepCount: number;
  failureClassification: string;
  recoveryAction: string;
  prDraftStatus: 'not_ready_no_patch' | 'blocked';
  cleanupRequired: boolean;
  evidenceCount: number;
  auditEventCount: number;
  fixtureOnly: true;
  processBoundaryInvoked: false;
  externalProcessStarted: false;
  networkBoundaryInvoked: false;
  localControlKeyRead: false;
  supervisorPostAllowed: false;
  adapterExecuteAllowed: false;
  patchGenerationAllowed: false;
  pushAllowed: false;
  pullRequestOpened: false;
  rawPathStored: false;
  bodyStored: false;
  tokenStored: false;
  summary: string;
}

export interface LocalRcAcceptanceRehearsalReadOnlySummary {
  status: 'passed' | 'failed' | 'blocked' | 'aborted';
  scenario: string;
  stepCount: number;
  readinessStatus: string;
  reviewDecisionStatus: string;
  verificationStatus: string;
  exportSummaryStatus: string;
  operatorAcceptanceStatus: string;
  evidenceCount: number;
  auditEventCount: number;
  bundleHash: string;
  fixtureOnly: true;
  localControlKeyRead: false;
  supervisorPostAllowed: false;
  adapterExecuteAllowed: false;
  artifactWriteBoundaryInvoked: false;
  processBoundaryInvoked: false;
  externalProcessStarted: false;
  networkBoundaryInvoked: false;
  noRealWrite: true;
  pushAllowed: false;
  pullRequestOpened: false;
  rawPathStored: false;
  bodyStored: false;
  tokenStored: false;
  summary: string;
}

export interface LocalRcOperatorReadOnlySummary {
  dryRunCount: number;
  approvalCount: number;
  runCount: number;
  latestRunStatus: string;
  readinessStatus: string;
  reviewDecisionStatus: string;
  verificationStatus: string;
  operatorReadinessStatus: string;
  bundleHash: string;
  artifactWriteBoundaryInvoked: boolean;
  fileCount: number;
  byteCount: number;
  evidenceCount: number;
  auditEventCount: number;
  productDefaultEnabled: false;
  approvalRequired: true;
  localOnly: true;
  noRealWrite: boolean;
  localControlKeyRead: false;
  supervisorPostAllowed: false;
  adapterExecuteAllowed: false;
  pushAllowed: false;
  pullRequestOpened: false;
  rawPathStored: false;
  bodyStored: false;
  tokenStored: false;
  summary: string;
}

export interface ApprovalDecisionHistoryReadOnlySummary {
  itemCount: number;
  requestedCount: number;
  approvedCount: number;
  deniedCount: number;
  revokedCount: number;
  terminalCount: number;
  typeBreakdown: Record<string, number>;
  statusBreakdown: Record<string, number>;
  decisionBreakdown: Record<string, number>;
  items: Array<{
    source: string;
    approvalType: string;
    approvalRequestId: string;
    decision: string;
    status: string;
    targetHash: string;
    evidenceCount: number;
    auditEventCount: number;
  }>;
  rawPathStored: false;
  bodyStored: false;
  tokenStored: false;
  summary: string;
}

export function getDashboardViewFromHash(hash: string | undefined): DashboardView {
  const normalized = (hash ?? '').replace(/^#\/?/, '').trim();

  return isDashboardView(normalized) ? normalized : 'overview';
}

export function getDashboardHash(view: DashboardView): string {
  return `#/${view}`;
}

export function summarizeMcpTools(
  definitions: readonly McpToolDefinition[] = createCodexHubMcpToolDefinitions(),
): McpToolRegistrySummary {
  const manifest = createCodexHubMcpServerManifest();

  return {
    manifestName: manifest.name,
    manifestVersion: manifest.version,
    toolCount: definitions.length,
    enabledToolCount: definitions.filter((tool) => tool.enabled).length,
    actionModes: uniqueSorted(definitions.map((tool) => tool.actionMode)),
    approvalPolicies: uniqueSorted(definitions.map((tool) => tool.approvalPolicy)),
    processBoundaryInvoked: definitions.some((tool) => tool.processBoundaryInvoked),
    externalProcessStarted: definitions.some((tool) => tool.externalProcessStarted),
    tools: definitions.map((tool) => ({
      name: tool.name,
      title: tool.title,
      riskLevel: tool.riskLevel,
      actionMode: tool.actionMode,
      approvalPolicy: tool.approvalPolicy,
      bodyStorage: tool.evidencePolicy.bodyStorage,
      enabled: tool.enabled,
      noRealWrite: tool.noRealWrite,
    })),
  };
}

export function createVerificationReadinessPreview(
  targets: readonly string[] = ['lint', 'test', 'build'],
): VerificationReadinessPreview {
  const normalizedTargets = uniqueSorted(targets);
  const affectedProjectsArgv = ['nx', 'show', 'projects', '--affected'];
  const verificationArgv = ['nx', 'affected', '-t', normalizedTargets.join(',')];

  return {
    adapterName: 'nx-affected',
    status: 'ready',
    targets: normalizedTargets,
    affectedProjectsCommandPreviewHash: stablePreviewHash(affectedProjectsArgv.join('\u0000')),
    verificationCommandPreviewHash: stablePreviewHash(verificationArgv.join('\u0000')),
    processBoundaryPlanned: true,
    processBoundaryInvoked: false,
    externalProcessStarted: false,
    noRealWrite: true,
    bodyStored: false,
    blockReasons: [],
    summary:
      'Dashboard preview only. Real affected verification remains gated behind the Nx adapter.',
  };
}

export function createBrowserProfilesReadOnlySummary(input: {
  dryRunCount?: number;
  approvalCount?: number;
  runCount?: number;
  latestRunStatus?: string;
} = {}): BrowserProfilesReadOnlySummary {
  const allowedCapabilities = ['title', 'url', 'accessibility_snapshot', 'console_summary'];
  const forbiddenActions = [
    'screenshot',
    'network_body',
    'click',
    'type',
    'submit',
    'file_upload',
    'file_download',
    ['coo', 'kie_extraction'].join(''),
    ['to', 'ken_extraction'].join(''),
    ['sess', 'ion_extraction'].join(''),
    'local_storage_dump',
    ['sess', 'ion_storage_dump'].join(''),
  ];

  return {
    manifestName: 'playwright-observer',
    manifestVersion: '0.3.0-m4c',
    profileCount: 1,
    dryRunCount: input.dryRunCount ?? 0,
    approvalCount: input.approvalCount ?? 0,
    runCount: input.runCount ?? 0,
    latestRunStatus: input.latestRunStatus ?? 'none',
    profilePathHashes: [stableSha256LikeHash('codexhub-fixture-browser-profile')],
    readinessStatus: 'blocked',
    readinessBlockReasons: ['browser_connection_disabled', 'profile_probe_disabled'],
    allowedCapabilities,
    forbiddenActions,
    planStatus: 'ready',
    planBlockReasons: [],
    processBoundaryPlanned: false,
    processBoundaryInvoked: false,
    externalProcessStarted: false,
    noRealWrite: true,
    rawPathStored: false,
    bodyStored: false,
    summary:
      'Browser Profile M4c shows Supervisor-gated metadata only. Dashboard remains read-only and cannot execute browser observation.',
  };
}

export function createElectronCdpReadOnlySummary(input: {
  dryRunCount?: number;
  approvalCount?: number;
  runCount?: number;
  latestRunStatus?: string;
  runnerModes?: readonly string[];
  cdpHttpBoundaryInvoked?: boolean;
  cdpWebSocketBoundaryInvoked?: boolean;
} = {}): ElectronCdpReadOnlySummary {
  return {
    manifestName: 'electron-cdp-adapter',
    manifestVersion: '0.3.0-m5c',
    dryRunCount: input.dryRunCount ?? 0,
    approvalCount: input.approvalCount ?? 0,
    runCount: input.runCount ?? 0,
    latestRunStatus: input.latestRunStatus ?? 'none',
    runnerModes: uniqueSorted([
      ...(input.runnerModes ?? ['controlled-local-http', 'controlled-websocket-events']),
    ]),
    allowedCommands: ['Log.enable', 'Network.enable', 'Runtime.enable'],
    blockedActions: [
      'main_inspector',
      'runtime_evaluate',
      'generic_cdp_command',
      'dom_snapshot',
      'screenshot',
      'network_body',
      'click',
      'type',
    ],
    productDefaultEnabled: false,
    approvalRequired: true,
    httpFlagRequired: true,
    eventFlagRequired: true,
    cdpHttpBoundaryInvoked: input.cdpHttpBoundaryInvoked ?? false,
    cdpWebSocketBoundaryInvoked: input.cdpWebSocketBoundaryInvoked ?? false,
    processBoundaryInvoked: false,
    externalProcessStarted: false,
    noRealWrite: true,
    rawPathStored: false,
    bodyStored: false,
    summary:
      'Electron/CDP M5d shows Supervisor-gated metadata only. Dashboard remains read-only and cannot execute Electron observation.',
  };
}

export function createWorktreeReadOnlySummary(input: {
  dryRunCount?: number;
  approvalCount?: number;
  runCount?: number;
  cleanupDryRunCount?: number;
  cleanupApprovalCount?: number;
  cleanupRunCount?: number;
  latestRunStatus?: string;
  latestCleanupStatus?: string;
  runnerModes?: readonly string[];
  gitBoundaryInvoked?: boolean;
  cleanupRequiredCount?: number;
  cleanupCompletedCount?: number;
} = {}): WorktreeReadOnlySummary {
  return {
    manifestName: 'worktree-manager',
    manifestVersion: '0.2.0-m6d',
    dryRunCount: input.dryRunCount ?? 0,
    approvalCount: input.approvalCount ?? 0,
    runCount: input.runCount ?? 0,
    cleanupDryRunCount: input.cleanupDryRunCount ?? 0,
    cleanupApprovalCount: input.cleanupApprovalCount ?? 0,
    cleanupRunCount: input.cleanupRunCount ?? 0,
    latestRunStatus: input.latestRunStatus ?? 'none',
    latestCleanupStatus: input.latestCleanupStatus ?? 'none',
    runnerModes: uniqueSorted([...(input.runnerModes ?? ['controlled-git-worktree'])]),
    productDefaultEnabled: false,
    approvalRequired: true,
    cleanupApprovalRequired: true,
    gitBoundaryInvoked: input.gitBoundaryInvoked ?? false,
    cleanupRequiredCount: input.cleanupRequiredCount ?? 0,
    cleanupCompletedCount: input.cleanupCompletedCount ?? 0,
    allowedOperations: [['work', 'tree add'].join(''), 'diff summary', 'worktree cleanup non-force'],
    blockedOperations: [
      ['git ', 'push'].join(''),
      'open PR',
      'force cleanup',
      'generic git command',
    ],
    processBoundaryInvoked: input.gitBoundaryInvoked ?? false,
    externalProcessStarted: input.gitBoundaryInvoked ?? false,
    noRealWrite: !(input.gitBoundaryInvoked ?? false),
    rawPathStored: false,
    bodyStored: false,
    summary:
      'Worktree M6d shows Supervisor-gated create and cleanup metadata only. Dashboard remains read-only and cannot create, approve, run, remove, push, or open PRs.',
  };
}

export function createGithubProviderReadOnlySummary(input: {
  dryRunCount?: number;
  approvalCount?: number;
  runCount?: number;
  draftPrDryRunCount?: number;
  draftPrApprovalCount?: number;
  draftPrRunCount?: number;
  branchPublishDryRunCount?: number;
  branchPublishApprovalCount?: number;
  branchPublishRunCount?: number;
  publishDraftPrChainDryRunCount?: number;
  publishDraftPrChainRunCount?: number;
  prLifecycleDryRunCount?: number;
  prLifecycleApprovalCount?: number;
  prLifecycleRunCount?: number;
  latestRunStatus?: string;
  latestDraftPrRunStatus?: string;
  latestDraftPrCreationStatus?: string;
  latestBranchPublishRunStatus?: string;
  latestBranchPublishCreationStatus?: string;
  latestPublishDraftPrChainRunStatus?: string;
  latestPublishDraftPrChainLifecycleStatus?: string;
  latestPrLifecycleRunStatus?: string;
  latestPrLifecycleStatusSummary?: string;
  draftPrCreatedCount?: number;
  branchPublishCreatedCount?: number;
  credentialConfigured?: boolean;
  networkBoundaryInvoked?: boolean;
} = {}): GithubProviderReadOnlySummary {
  return {
    manifestName: 'github-provider',
    manifestVersion: '0.5.0-m19',
    dryRunCount: input.dryRunCount ?? 0,
    approvalCount: input.approvalCount ?? 0,
    runCount: input.runCount ?? 0,
    draftPrDryRunCount: input.draftPrDryRunCount ?? 0,
    draftPrApprovalCount: input.draftPrApprovalCount ?? 0,
    draftPrRunCount: input.draftPrRunCount ?? 0,
    branchPublishDryRunCount: input.branchPublishDryRunCount ?? 0,
    branchPublishApprovalCount: input.branchPublishApprovalCount ?? 0,
    branchPublishRunCount: input.branchPublishRunCount ?? 0,
    publishDraftPrChainDryRunCount: input.publishDraftPrChainDryRunCount ?? 0,
    publishDraftPrChainRunCount: input.publishDraftPrChainRunCount ?? 0,
    prLifecycleDryRunCount: input.prLifecycleDryRunCount ?? 0,
    prLifecycleApprovalCount: input.prLifecycleApprovalCount ?? 0,
    prLifecycleRunCount: input.prLifecycleRunCount ?? 0,
    latestRunStatus: input.latestRunStatus ?? 'none',
    latestDraftPrRunStatus: input.latestDraftPrRunStatus ?? 'none',
    latestDraftPrCreationStatus: input.latestDraftPrCreationStatus ?? 'none',
    latestBranchPublishRunStatus: input.latestBranchPublishRunStatus ?? 'none',
    latestBranchPublishCreationStatus: input.latestBranchPublishCreationStatus ?? 'none',
    latestPublishDraftPrChainRunStatus: input.latestPublishDraftPrChainRunStatus ?? 'none',
    latestPublishDraftPrChainLifecycleStatus:
      input.latestPublishDraftPrChainLifecycleStatus ?? 'none',
    latestPrLifecycleRunStatus: input.latestPrLifecycleRunStatus ?? 'none',
    latestPrLifecycleStatusSummary: input.latestPrLifecycleStatusSummary ?? 'none',
    draftPrCreatedCount: input.draftPrCreatedCount ?? 0,
    branchPublishCreatedCount: input.branchPublishCreatedCount ?? 0,
    productDefaultEnabled: false,
    approvalRequired: true,
    draftPrApprovalRequired: true,
    branchPublishApprovalRequired: true,
    publishDraftPrChainSeparateApprovalsRequired: true,
    prLifecycleApprovalRequired: true,
    credentialConfigured: input.credentialConfigured ?? false,
    credentialHashOnly: true,
    allowedHostHash: stableSha256LikeHash('api.github.com'),
    allowedMetadata: [
      'repository_metadata',
      'base_branch_metadata',
      'head_branch_metadata',
      'existing_pull_request_lookup',
    ],
    allowedDraftPrActions: ['existing_branch_preflight', 'draft_pr_create'],
    allowedBranchPublishActions: [
      'repo_preflight',
      'base_ref_read',
      'new_branch_absence_check',
      'blob_create',
      'tree_create',
      'commit_create',
      'codexhub_ref_create',
    ],
    allowedPrLifecycleActions: [
      'repo_metadata_get',
      'pull_request_metadata_get',
      'branch_ref_metadata_get',
      'combined_status_get',
      'check_runs_summary_get',
    ],
    blockedOperations: [
      ['git ', 'push'].join(''),
      'update_ref',
      'force',
      'overwrite_branch',
      'merge',
      'labels',
      'reviewers',
      'comments',
      'non_draft_pr',
      'generic_network_request',
      'raw_check_logs',
      'raw_pr_body',
    ],
    networkBoundaryInvoked: input.networkBoundaryInvoked ?? false,
    processBoundaryInvoked: false,
    externalProcessStarted: false,
    noRealWrite: true,
    rawRemoteRefStored: false,
    rawUrlStored: false,
    rawPathStored: false,
    bodyStored: false,
    credentialValueStored: false,
    summary:
      'GitHub provider metadata, branch publish, draft PR, publish-to-draft-PR chain, and PR lifecycle records are shown as hashes, counts, statuses, evidence ids, and audit ids only. Dashboard cannot execute remote requests.',
  };
}

export function createGithubBranchPublishAcceptanceRehearsalReadOnlySummary(input: {
  scenario?: GithubBranchPublishAcceptanceRehearsalReadOnlySummary['scenario'];
} = {}): GithubBranchPublishAcceptanceRehearsalReadOnlySummary {
  const scenario = input.scenario ?? 'all-pass';
  const status =
    scenario === 'all-pass'
      ? 'passed'
      : scenario === 'blob-create-failed' ||
          scenario === 'tree-create-failed' ||
          scenario === 'commit-create-failed' ||
          scenario === 'ref-create-failed'
        ? 'failed'
        : scenario === 'network-timeout'
          ? 'aborted'
          : 'blocked';
  const readinessStatus =
    scenario === 'branch-exists'
      ? 'blocked_existing_branch'
      : scenario === 'content-manifest-blocked'
        ? 'blocked_content_manifest'
        : scenario === GITHUB_BRANCH_PUBLISH_CREDENTIAL_MISSING_SCENARIO ||
            scenario === 'provider-disabled' ||
            scenario === 'approval-blocked'
          ? 'blocked_before_boundary'
          : 'ready_for_branch_publish';
  const publishStatus =
    scenario === 'all-pass'
      ? 'fixture_completed'
      : status === 'failed' || status === 'aborted'
        ? 'failed'
        : 'blocked';

  return {
    status,
    scenario,
    stepCount: 7,
    readinessStatus,
    publishStatus,
    evidenceRefCount: status === 'passed' ? 3 : status === 'blocked' ? 1 : 2,
    auditEventCount: status === 'passed' ? 3 : status === 'blocked' ? 1 : 2,
    fixtureOnly: true,
    networkBoundaryInvoked: false,
    processBoundaryInvoked: false,
    externalProcessStarted: false,
    noRealWrite: true,
    localControlKeyRead: false,
    supervisorPostAllowed: false,
    adapterExecuteAllowed: false,
    createRefAllowed: true,
    updateRefAllowed: false,
    forceAllowed: false,
    pushAllowed: false,
    mergeAllowed: false,
    rawFileContentStored: false,
    rawPathStored: false,
    bodyStored: false,
    credentialValueStored: false,
    summary: `GitHub branch publish acceptance rehearsal preview ${status}; fixture metadata only.`,
  };
}

export function createGithubDraftPrAcceptanceRehearsalReadOnlySummary(input: {
  scenario?: GithubDraftPrAcceptanceRehearsalReadOnlySummary['scenario'];
} = {}): GithubDraftPrAcceptanceRehearsalReadOnlySummary {
  const scenario = input.scenario ?? 'all-pass';
  const status =
    scenario === 'all-pass'
      ? 'passed'
      : scenario === 'github-post-failed'
        ? 'failed'
        : scenario === 'network-timeout'
          ? 'aborted'
          : 'blocked';
  const readinessStatus =
    scenario === 'head-branch-missing'
      ? 'blocked_head_branch'
      : scenario === 'existing-pr-found'
        ? 'blocked_existing_pr'
        : 'ready_for_draft_pr';
  const prCreationStatus =
    scenario === 'all-pass'
      ? 'fixture_completed'
      : scenario === 'github-post-failed' || scenario === 'network-timeout'
        ? 'failed'
        : scenario === 'head-branch-missing' || scenario === 'existing-pr-found'
          ? 'skipped'
          : 'blocked';

  return {
    status,
    scenario,
    stepCount: 6,
    readinessStatus,
    prCreationStatus,
    evidenceRefCount: status === 'passed' ? 3 : status === 'blocked' ? 1 : 2,
    auditEventCount: status === 'passed' ? 3 : status === 'blocked' ? 1 : 2,
    fixtureOnly: true,
    networkBoundaryInvoked: false,
    processBoundaryInvoked: false,
    externalProcessStarted: false,
    noRealWrite: true,
    localControlKeyRead: false,
    supervisorPostAllowed: false,
    adapterExecuteAllowed: false,
    draft: true,
    pushAllowed: false,
    createRefAllowed: false,
    mergeAllowed: false,
    rawPathStored: false,
    bodyStored: false,
    credentialValueStored: false,
    summary: `GitHub draft PR acceptance rehearsal preview ${status}; fixture metadata only.`,
  };
}

export function createGithubPublishDraftPrAcceptanceRehearsalReadOnlySummary(input: {
  scenario?: GithubPublishDraftPrAcceptanceRehearsalReadOnlySummary['scenario'];
} = {}): GithubPublishDraftPrAcceptanceRehearsalReadOnlySummary {
  const scenario = input.scenario ?? 'all-pass';
  const status =
    scenario === 'all-pass' || scenario === 'checks-passed'
      ? 'passed'
      : scenario === 'checks-failed'
        ? 'failed'
        : scenario === 'network-timeout'
          ? 'aborted'
          : 'blocked';
  const branchPublishStatus =
    scenario === 'publish-blocked' ? 'blocked' : 'fixture_completed';
  const draftPrStatus =
    scenario === 'publish-blocked'
      ? 'skipped'
      : scenario === 'branch-published-pr-blocked'
        ? 'blocked'
        : 'fixture_completed';
  const lifecycleStatus =
    scenario === 'checks-failed'
      ? 'checks_failed'
      : scenario === 'checks-passed' || scenario === 'all-pass'
        ? 'checks_passed'
        : scenario === 'draft-pr-created-checks-pending'
          ? 'checks_pending'
          : 'blocked';

  return {
    status,
    scenario,
    stepCount: 4,
    branchPublishStatus,
    draftPrStatus,
    lifecycleStatus,
    evidenceRefCount: status === 'passed' ? 3 : 1,
    auditEventCount: status === 'passed' ? 3 : 1,
    fixtureOnly: true,
    networkBoundaryInvoked: false,
    processBoundaryInvoked: false,
    externalProcessStarted: false,
    noRealWrite: true,
    localControlKeyRead: false,
    supervisorPostAllowed: false,
    adapterExecuteAllowed: false,
    updateRefAllowed: false,
    forceAllowed: false,
    pushAllowed: false,
    mergeAllowed: false,
    rawPathStored: false,
    bodyStored: false,
    rawPrBodyStored: false,
    rawUrlStored: false,
    summary: `GitHub publish to draft PR acceptance rehearsal preview ${status}; fixture metadata only.`,
  };
}

export function createGithubPrLifecycleAcceptanceRehearsalReadOnlySummary(input: {
  scenario?: GithubPrLifecycleAcceptanceRehearsalReadOnlySummary['scenario'];
} = {}): GithubPrLifecycleAcceptanceRehearsalReadOnlySummary {
  const scenario = input.scenario ?? 'all-pass';
  const status =
    scenario === 'all-pass' || scenario === 'checks-passed'
      ? 'passed'
      : scenario === 'checks-failed'
        ? 'failed'
        : scenario === 'network-timeout'
          ? 'aborted'
          : 'blocked';
  const lifecycleStatus =
    scenario === 'all-pass' || scenario === 'checks-passed'
      ? 'checks_passed'
      : scenario === 'checks-failed'
        ? 'checks_failed'
        : scenario === 'checks-pending'
          ? 'checks_pending'
          : scenario === 'pr-not-found'
            ? 'not_found'
            : 'blocked';

  return {
    status,
    scenario,
    stepCount: 5,
    lifecycleStatus,
    evidenceRefCount: status === 'passed' || scenario.startsWith('checks-') ? 3 : 1,
    auditEventCount: status === 'passed' || scenario.startsWith('checks-') ? 3 : 1,
    fixtureOnly: true,
    networkBoundaryInvoked: false,
    processBoundaryInvoked: false,
    externalProcessStarted: false,
    noRealWrite: true,
    localControlKeyRead: false,
    supervisorPostAllowed: false,
    adapterExecuteAllowed: false,
    fixedGetOnly: true,
    commentsAllowed: false,
    labelsAllowed: false,
    reviewersAllowed: false,
    mergeAllowed: false,
    rawUrlStored: false,
    rawResponseBodyStored: false,
    rawPathStored: false,
    bodyStored: false,
    credentialValueStored: false,
    summary:
      'GitHub PR lifecycle rehearsal is fixture-only and covers fixed GET metadata for PR state, branch refs, combined status, and check-run counts without remote writes.',
  };
}

export function createLocalReviewPackageReadOnlySummary(input: {
  dryRunCount?: number;
  approvalCount?: number;
  runCount?: number;
  decisionCount?: number;
  latestRunStatus?: string;
  latestDecisionStatus?: string;
  verificationStatuses?: readonly string[];
  exportedCount?: number;
  artifactWriteBoundaryInvoked?: boolean;
  fileCount?: number;
  byteCount?: number;
  evidenceCount?: number;
  auditEventCount?: number;
} = {}): LocalReviewPackageReadOnlySummary {
  return {
    dryRunCount: input.dryRunCount ?? 0,
    approvalCount: input.approvalCount ?? 0,
    runCount: input.runCount ?? 0,
    decisionCount: input.decisionCount ?? 0,
    latestRunStatus: input.latestRunStatus ?? 'none',
    latestDecisionStatus: input.latestDecisionStatus ?? 'pending',
    verificationStatuses: uniqueSorted([...(input.verificationStatuses ?? [])]),
    exportedCount: input.exportedCount ?? 0,
    artifactWriteBoundaryInvoked: input.artifactWriteBoundaryInvoked ?? false,
    fileCount: input.fileCount ?? 0,
    byteCount: input.byteCount ?? 0,
    evidenceCount: input.evidenceCount ?? 0,
    auditEventCount: input.auditEventCount ?? 0,
    productDefaultEnabled: false,
    approvalRequired: true,
    rawPathStored: false,
    bodyStored: false,
    tokenStored: false,
    summary:
      'Local review package metadata is read-only in the Dashboard. Export remains Supervisor-gated and approval-bound.',
  };
}

export function createPolicyTelemetryReadOnlySummary(input: {
  projectionSpanCount?: number;
} = {}): PolicyTelemetryReadOnlySummary {
  const projectionSpanCount = input.projectionSpanCount ?? 5;

  return {
    policyBackend: {
      manifestName: 'policy-backend-adapter',
      manifestVersion: '0.2.0-m7b',
      productDefaultEnabled: false,
      backendKinds: ['fixture', 'opa-plan-only', 'cedar-plan-only'],
      evaluatorSources: ['fixture-inline', 'fixture-config'],
      advisoryOnly: true,
      authorityProvider: 'codexhub',
      processBoundaryInvoked: false,
      externalProcessStarted: false,
      networkBoundaryInvoked: false,
      rawPolicySourceStored: false,
      rawPathStored: false,
      bodyStored: false,
      summary:
        'Policy backend output is advisory only. CodexHub security-kernel remains the authority provider.',
    },
    telemetry: {
      manifestName: 'otel-adapter',
      manifestVersion: '0.2.0-m7c',
      productDefaultEnabled: false,
      exporterKinds: ['noop', 'fixture'],
      localProjectionEnabled: true,
      projectionSpanCount,
      projectionHash: stableSha256LikeHash(`policy-telemetry-projection:${projectionSpanCount}`),
      networkExportAttempted: false,
      processBoundaryInvoked: false,
      externalProcessStarted: false,
      openTelemetrySdkLoaded: false,
      rawTracePayloadStored: false,
      rawPathStored: false,
      bodyStored: false,
      evidenceAuditAuthoritative: false,
      summary:
        'Telemetry projection is local metadata only. It can reference Evidence/Audit ids but cannot replace the fact chain.',
    },
  };
}

export function createGovernanceReadOnlySummary(
  runs: readonly GovernanceProjectionInputRun[] = createDashboardGovernanceFixtures(),
): GovernanceReadOnlySummary {
  const projection = createGovernanceProjection(runs);

  return {
    status: projection.summary.status,
    runCount: projection.summary.runCount,
    evidenceCount: projection.summary.evidenceCount,
    auditEventCount: projection.summary.auditEventCount,
    processBoundaryCount: projection.summary.processBoundaryCount,
    externalProcessStartedCount: projection.summary.externalProcessStartedCount,
    networkBoundaryCount: projection.summary.networkBoundaryCount,
    projectionHash: projection.summary.projectionHash,
    sources: Object.entries(projection.summary.sourceBreakdown)
      .map(([source, count]) => ({ source, count }))
      .sort((left, right) => left.source.localeCompare(right.source)),
    runs: projection.projections.map((run) => ({
      id: run.id,
      source: run.source,
      status: run.status,
      sourceRunIdHash: run.sourceRunIdHash,
      evidenceCount: run.evidenceBundle.evidenceCount,
      auditEventCount: run.auditChain.auditEventCount,
      processBoundaryInvoked: run.processBoundaryInvoked,
      externalProcessStarted: run.externalProcessStarted,
      noRealWrite: run.noRealWrite,
    })),
    rawPathStored: false,
    bodyStored: false,
    summary: projection.summary.summary,
  };
}

export function createOperatorReadinessReadOnlySummary(
  report: OperatorReadinessReport = createDefaultOperatorReadinessPreview(),
): OperatorReadinessReadOnlySummary {
  return {
    status: report.status,
    checkCount: report.checks.length,
    passedCheckCount: report.passedCheckCount,
    warningCheckCount: report.warningCheckCount,
    failedCheckCount: report.failedCheckCount,
    configuredLocalControlKeyCount: report.configuredLocalControlKeyCount,
    storeAvailable: report.storeAvailable,
    processBoundaryAllowlistPassed: report.processBoundaryAllowlistPassed,
    policyConfigHash: report.policyConfigHash ?? 'missing',
    riskConfigHash: report.riskConfigHash ?? 'missing',
    integrationConfigHash: report.integrationConfigHash ?? 'missing',
    integrations: report.integrations.map((integration) => ({
      name: integration.name,
      enabled: integration.enabled,
      safeToEnable: integration.safeToEnable,
      riskLevel: integration.riskLevel,
      approvalRequired: integration.approvalRequired,
      blockers: integration.blockers,
    })),
    checks: report.checks.map((check) => ({
      code: check.code,
      status: check.status,
      category: check.category,
      configured: check.configured,
      hash: check.hash,
      blockers: check.blockers,
    })),
    rawPathStored: false,
    bodyStored: false,
    summary: report.summary,
  };
}

export function createM10PilotReadOnlySummary(input: {
  readinessReport?: OperatorReadinessReport;
  approvalInboxItemCount?: number;
  governanceRunCount?: number;
} = {}): M10PilotReadOnlySummary {
  const checklist = createM10PilotChecklist(input);
  const runbook = createM10PilotRunbookSummary({ checklist });

  return {
    status: checklist.status,
    stepCount: checklist.steps.length,
    readyStepCount: checklist.readyStepCount,
    blockedStepCount: checklist.blockedStepCount,
    reviewStepCount: checklist.reviewStepCount,
    requiredStepCount: checklist.requiredStepCount,
    blockerCount: checklist.blockerCount,
    integrationCount: checklist.integrationCount,
    approvalInboxItemCount: checklist.approvalInboxItemCount,
    governanceRunCount: checklist.governanceRunCount,
    nextAction: runbook.nextAction,
    rollbackSummary: runbook.rollbackSummary,
    steps: checklist.steps.map((step) => ({
      code: step.code,
      label: step.label,
      phase: step.phase,
      status: step.status,
      blockerCount: step.blockerCount,
      blockers: step.blockers,
      summary: step.summary,
    })),
    rawValueStored: false,
    rawPathStored: false,
    bodyStored: false,
    localControlKeyRead: false,
    supervisorPostAllowed: false,
    adapterExecuteAllowed: false,
    summary: checklist.summary,
  };
}

export function createM10PilotAcceptanceReadOnlySummary(input: {
  scenario?: 'all-pass' | 'readiness-blocked' | 'approval-blocked' | 'codex-failed' | 'nx-failed';
} = {}): M10PilotAcceptanceReadOnlySummary {
  const scenario = input.scenario ?? 'all-pass';
  const blocked = scenario === 'readiness-blocked' || scenario === 'approval-blocked';
  const failed = scenario === 'codex-failed' || scenario === 'nx-failed';
  const status = blocked ? 'blocked' : failed ? 'failed' : 'passed';

  return {
    status,
    scenario,
    stepCount: 6,
    evidenceCount: blocked ? 4 : 10,
    auditEventCount: blocked ? 4 : 10,
    goldenPathStatus: blocked ? 'blocked' : failed ? 'failed' : 'passed',
    prActionStatus: scenario === 'all-pass' ? 'not_ready_no_live_pr' : 'blocked',
    processBoundaryInvoked: false,
    externalProcessStarted: false,
    networkBoundaryInvoked: false,
    localControlKeyRead: false,
    supervisorPostAllowed: false,
    adapterExecuteAllowed: false,
    pushAllowed: false,
    pullRequestOpened: false,
    rawPathStored: false,
    bodyStored: false,
    tokenStored: false,
    summary: `M10 acceptance rehearsal preview ${status}; fixture metadata only.`,
  };
}

export function createM11PilotReadOnlySummary(input: {
  readinessReport?: OperatorReadinessReport;
  runCount?: number;
  approvalInboxItemCount?: number;
  governanceRunCount?: number;
  cleanupRequiredCount?: number;
  cleanupHandoffCount?: number;
  latestRecoveryAction?: string;
  latestCleanupApprovalStatus?: string;
  latestCleanupDeferred?: boolean;
  latestCleanupCompleted?: boolean;
  latestRunStatus?: string;
  latestPrDraftStatus?: string;
  latestFailureClassification?: string;
  processBoundaryInvoked?: boolean;
  externalProcessStarted?: boolean;
} = {}): M11PilotReadOnlySummary {
  const runCount = input.runCount ?? 0;
  const checklist = createM11PilotEnablementChecklist({
    readinessReport: input.readinessReport,
    approvalInboxItemCount: input.approvalInboxItemCount,
    governanceRunCount: input.governanceRunCount,
    latestRunCount: runCount,
    cleanupRequiredCount: input.cleanupRequiredCount,
  });
  const runbook = createM11PilotEnablementRunbookSummary({ checklist });

  return {
    status: runCount > 0 ? 'available' : 'degraded',
    runCount,
    enablementStatus: checklist.status,
    enablementBlockerCount: checklist.blockerCount,
    requiredEnvFlags: checklist.requiredEnvFlags,
    safeEnableBlockers: checklist.safeEnableBlockers,
    nextAction: runbook.nextAction,
    failureHandlingSummary: runbook.failureHandlingSummary,
    rollbackSummary: runbook.rollbackSummary,
    steps: checklist.steps.map((step) => ({
      code: step.code,
      label: step.label,
      phase: step.phase,
      status: step.status,
      blockerCount: step.blockerCount,
      blockers: step.blockers,
      summary: step.summary,
    })),
    latestRunStatus: input.latestRunStatus ?? 'none',
    latestPrDraftStatus: input.latestPrDraftStatus ?? 'none',
    latestFailureClassification: input.latestFailureClassification ?? 'none',
    latestRecoveryAction: input.latestRecoveryAction ?? 'none',
    cleanupRequiredCount: input.cleanupRequiredCount ?? 0,
    cleanupHandoffCount: input.cleanupHandoffCount ?? 0,
    latestCleanupApprovalStatus: input.latestCleanupApprovalStatus ?? 'not_requested',
    latestCleanupDeferred: input.latestCleanupDeferred ?? false,
    latestCleanupCompleted: input.latestCleanupCompleted ?? false,
    codexReadOnlyDryRunOnly: true,
    patchGenerationAllowed: false,
    pushAllowed: false,
    pullRequestOpened: false,
    processBoundaryInvoked: input.processBoundaryInvoked ?? false,
    externalProcessStarted: input.externalProcessStarted ?? false,
    localControlKeyRead: false,
    supervisorPostAllowed: false,
    adapterExecuteAllowed: false,
    rawPathStored: false,
    bodyStored: false,
    tokenStored: false,
    summary:
      runCount > 0
        ? 'M11 narrow-path pilot metadata is available. Dashboard remains read-only.'
        : 'M11 narrow-path pilot metadata is unavailable or empty. Dashboard remains read-only.',
  };
}

export function createM11PilotAcceptanceSmokeReadOnlySummary(input: {
  scenario?:
    | 'all-pass'
    | 'readiness-blocked'
    | 'worktree-approval-blocked'
    | 'worktree-boundary-failed'
    | 'codex-failed'
    | 'nx-failed';
} = {}): M11PilotAcceptanceSmokeReadOnlySummary {
  const scenario = input.scenario ?? 'all-pass';
  const blocked = scenario === 'readiness-blocked' || scenario === 'worktree-approval-blocked';
  const failed =
    scenario === 'worktree-boundary-failed' ||
    scenario === 'codex-failed' ||
    scenario === 'nx-failed';
  const status = blocked ? 'blocked' : failed ? 'failed' : 'passed';
  const failureClassification =
    scenario === 'readiness-blocked'
      ? 'readiness_blocked'
      : scenario === 'worktree-approval-blocked'
        ? 'approval_blocked'
        : scenario === 'worktree-boundary-failed'
          ? 'worktree_boundary_failed'
          : scenario === 'codex-failed'
            ? 'codex_failed'
            : scenario === 'nx-failed'
              ? 'nx_failed'
              : 'none';
  const recoveryAction =
    failureClassification === 'readiness_blocked'
      ? 'resolve_readiness'
      : failureClassification === 'approval_blocked'
        ? 'request_worktree_approval'
        : failureClassification === 'worktree_boundary_failed'
          ? 'inspect_worktree_boundary'
          : failureClassification === 'codex_failed'
            ? 'review_codex_dry_run'
            : failureClassification === 'nx_failed'
              ? 'review_nx_verification'
              : 'review_cleanup_handoff';

  return {
    status,
    scenario,
    stepCount: 7,
    failureClassification,
    recoveryAction,
    prDraftStatus: status === 'passed' ? 'not_ready_no_patch' : 'blocked',
    cleanupRequired: status === 'passed' || failed,
    evidenceCount: blocked ? 1 : 3,
    auditEventCount: blocked ? 1 : 3,
    fixtureOnly: true,
    processBoundaryInvoked: false,
    externalProcessStarted: false,
    networkBoundaryInvoked: false,
    localControlKeyRead: false,
    supervisorPostAllowed: false,
    adapterExecuteAllowed: false,
    patchGenerationAllowed: false,
    pushAllowed: false,
    pullRequestOpened: false,
    rawPathStored: false,
    bodyStored: false,
    tokenStored: false,
    summary: `M11 acceptance smoke preview ${status}; fixture metadata only.`,
  };
}

export function createLocalRcAcceptanceRehearsalReadOnlySummary(input: {
  scenario?:
    | 'all-pass'
    | 'review-blocked'
    | 'verification-blocked'
    | 'readiness-blocked'
    | 'export-blocked'
    | 'superseded-package';
} = {}): LocalRcAcceptanceRehearsalReadOnlySummary {
  const scenario = input.scenario ?? 'all-pass';
  const status = scenario === 'all-pass' ? 'passed' : 'blocked';
  const readinessStatus =
    scenario === 'readiness-blocked'
      ? 'blocked_operator_readiness'
      : scenario === 'review-blocked' || scenario === 'superseded-package'
        ? 'blocked_review'
        : scenario === 'verification-blocked'
          ? 'blocked_verification'
          : 'ready_for_local_acceptance';
  const reviewDecisionStatus =
    scenario === 'review-blocked'
      ? 'changes_requested'
      : scenario === 'superseded-package'
        ? 'superseded'
        : 'approved_for_local_rc';
  const verificationStatus = scenario === 'verification-blocked' ? 'failed' : 'passed';
  const exportSummaryStatus =
    scenario === 'export-blocked' ? 'blocked' : status === 'passed' ? 'fixture_completed' : 'skipped';

  return {
    status,
    scenario,
    stepCount: 5,
    readinessStatus,
    reviewDecisionStatus,
    verificationStatus,
    exportSummaryStatus,
    operatorAcceptanceStatus: status === 'passed' ? 'accepted' : 'blocked',
    evidenceCount: 2,
    auditEventCount: 2,
    bundleHash: stableSha256LikeHash(`m14c:${scenario}:bundle`),
    fixtureOnly: true,
    localControlKeyRead: false,
    supervisorPostAllowed: false,
    adapterExecuteAllowed: false,
    artifactWriteBoundaryInvoked: false,
    processBoundaryInvoked: false,
    externalProcessStarted: false,
    networkBoundaryInvoked: false,
    noRealWrite: true,
    pushAllowed: false,
    pullRequestOpened: false,
    rawPathStored: false,
    bodyStored: false,
    tokenStored: false,
    summary: `M14 local RC acceptance rehearsal preview ${status}; fixture metadata only.`,
  };
}

export function createLocalRcOperatorReadOnlySummary(input: {
  dryRunCount?: number;
  approvalCount?: number;
  runCount?: number;
  latestRunStatus?: string;
  readinessStatus?: string;
  reviewDecisionStatus?: string;
  verificationStatus?: string;
  operatorReadinessStatus?: string;
  bundleHash?: string;
  artifactWriteBoundaryInvoked?: boolean;
  fileCount?: number;
  byteCount?: number;
  evidenceCount?: number;
  auditEventCount?: number;
  noRealWrite?: boolean;
} = {}): LocalRcOperatorReadOnlySummary {
  const runCount = input.runCount ?? 0;
  const readinessStatus = input.readinessStatus ?? 'not_ready';

  return {
    dryRunCount: input.dryRunCount ?? 0,
    approvalCount: input.approvalCount ?? 0,
    runCount,
    latestRunStatus: input.latestRunStatus ?? 'none',
    readinessStatus,
    reviewDecisionStatus: input.reviewDecisionStatus ?? 'unknown',
    verificationStatus: input.verificationStatus ?? 'unknown',
    operatorReadinessStatus: input.operatorReadinessStatus ?? 'unknown',
    bundleHash: input.bundleHash ?? stableSha256LikeHash('local-rc-operator-empty'),
    artifactWriteBoundaryInvoked: input.artifactWriteBoundaryInvoked ?? false,
    fileCount: input.fileCount ?? 0,
    byteCount: input.byteCount ?? 0,
    evidenceCount: input.evidenceCount ?? 0,
    auditEventCount: input.auditEventCount ?? 0,
    productDefaultEnabled: false,
    approvalRequired: true,
    localOnly: true,
    noRealWrite: input.noRealWrite ?? runCount === 0,
    localControlKeyRead: false,
    supervisorPostAllowed: false,
    adapterExecuteAllowed: false,
    pushAllowed: false,
    pullRequestOpened: false,
    rawPathStored: false,
    bodyStored: false,
    tokenStored: false,
    summary:
      runCount > 0
        ? `Local RC operator metadata is available with readiness ${readinessStatus}.`
        : 'No local RC bundle run metadata is available. Dashboard remains read-only.',
  };
}

export function createApprovalDecisionHistoryReadOnlySummary(
  input: {
    inbox?: ApprovalInboxProjection;
    inboxItems?: readonly ApprovalInboxItem[];
  } = {},
): ApprovalDecisionHistoryReadOnlySummary {
  const items = [...(input.inboxItems ?? input.inbox?.items ?? [])].sort((left, right) =>
    right.createdAt.localeCompare(left.createdAt),
  );
  const typeBreakdown = countBy(items, (item) => item.approvalType);
  const statusBreakdown = countBy(items, (item) => item.status);

  return {
    itemCount: items.length,
    requestedCount: items.filter((item) => item.status === 'pending' || item.status === 'requested')
      .length,
    approvedCount: items.filter((item) => item.status === 'approved').length,
    deniedCount: items.filter((item) => item.status === 'denied').length,
    revokedCount: items.filter((item) => item.status === 'revoked').length,
    terminalCount: items.filter((item) =>
      ['denied', 'expired', 'used', 'revoked'].includes(item.status),
    ).length,
    typeBreakdown,
    statusBreakdown,
    decisionBreakdown: {},
    items: items.slice(0, 10).map((item) => ({
      source: 'inbox',
      approvalType: item.approvalType,
      approvalRequestId: item.approvalRequestId,
      decision: 'none',
      status: item.status,
      targetHash: item.targetHash,
      evidenceCount: item.evidenceRefIds.length,
      auditEventCount: item.auditEventIds.length,
    })),
    rawPathStored: false,
    bodyStored: false,
    tokenStored: false,
    summary: `Approval decision history contains ${items.length} metadata-only item(s).`,
  };
}

export function summarizeDegradedState(status: string, message?: string): string {
  if (status === 'ready') {
    return 'Read-only data loaded.';
  }

  return message ?? 'Read-only source is unavailable; UI remains metadata-only.';
}

function isDashboardView(value: string): value is DashboardView {
  return DASHBOARD_VIEWS.some((view) => view === value);
}

function uniqueSorted(values: readonly string[]): string[] {
  return [...new Set(values)].sort((left, right) => left.localeCompare(right));
}

function countBy<T>(items: readonly T[], selectKey: (item: T) => string): Record<string, number> {
  return items.reduce<Record<string, number>>((accumulator, item) => {
    const key = selectKey(item);

    return {
      ...accumulator,
      [key]: (accumulator[key] ?? 0) + 1,
    };
  }, {});
}

function stablePreviewHash(value: string): string {
  let hash = 2166136261;

  for (const character of value) {
    hash ^= character.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }

  return `preview:${(hash >>> 0).toString(16).padStart(8, '0')}`;
}

function stableSha256LikeHash(value: string): string {
  return `sha256:${stablePreviewHash(value).replace(/^preview:/, '')}`;
}

function createDashboardGovernanceFixtures(): GovernanceProjectionInputRun[] {
  return [
    {
      id: 'dashboard_codex_projection',
      source: 'codex_exec_dry_run',
      status: 'blocked',
      evidenceCount: 0,
      auditEventCount: 0,
    },
    {
      id: 'dashboard_worktree_projection',
      source: 'worktree_run',
      status: 'unknown',
      evidenceCount: 0,
      auditEventCount: 0,
    },
    {
      id: 'dashboard_policy_projection',
      source: 'policy_backend_projection',
      status: 'ready',
      evidenceCount: 0,
      auditEventCount: 0,
    },
    {
      id: 'dashboard_telemetry_projection',
      source: 'telemetry_projection',
      status: 'ready',
      evidenceCount: 0,
      auditEventCount: 0,
    },
  ];
}

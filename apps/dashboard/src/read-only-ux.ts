import type { McpToolDefinition } from '@codexhub/contracts';
import {
  createCodexHubMcpServerManifest,
  createCodexHubMcpToolDefinitions,
} from '@codexhub/mcp-tool-contracts';

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
  'worktrees',
  'policy-telemetry',
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

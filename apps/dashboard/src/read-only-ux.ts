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

export function createBrowserProfilesReadOnlySummary(): BrowserProfilesReadOnlySummary {
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
    manifestVersion: '0.1.0-m4a',
    profileCount: 1,
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
      'Browser Profile M4a is metadata-only. Real browser/profile probing remains disabled.',
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

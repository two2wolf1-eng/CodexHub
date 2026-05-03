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

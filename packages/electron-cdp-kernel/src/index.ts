import {
  ElectronCdpCommandAllowlistDecisionSchema,
  ElectronCdpConsoleSummarySchema,
  ElectronCdpEventMetadataSummarySchema,
  ElectronCdpNetworkMetadataSummarySchema,
  CodexDesktopHealthSnapshotSchema,
  ElectronDebugEndpointSummarySchema,
  ElectronProcessSummarySchema,
  ElectronTargetSummarySchema,
  SchemaVersionSchema,
  type ElectronCdpAllowedCommand,
  type ElectronCdpCommandAllowlistDecision,
  type ElectronCdpConsoleSummary,
  type ElectronCdpEventMetadataSummary,
  type ElectronCdpNetworkMetadataSummary,
  type CodexDesktopDiagnosticHint,
  type CodexDesktopHealthSnapshot,
  type ElectronDebugEndpointSummary,
  type ElectronProcessKind,
  type ElectronProcessSummary,
  type ElectronTargetSummary,
  type ElectronTargetType,
  type Metadata,
  type OsProcessMetadataSummary,
} from '@codexhub/contracts';
import { hashText, redactMetadata } from '@codexhub/evidence-kernel';

export const ELECTRON_CDP_READ_ONLY_CAPABILITIES = [
  'process_summary',
  'debug_endpoint_summary',
  'target_summary',
  'console_summary',
  'network_metadata_summary',
] as const;

export const ELECTRON_CDP_FORBIDDEN_ACTIONS = [
  'main_inspector',
  'runtime_evaluate',
  'dom_mutation',
  'click',
  'type',
  'screenshot',
  'dom_snapshot',
  'network_body',
  'generic_cdp_command',
  ['coo', 'kie_extraction'].join(''),
  ['to', 'ken_extraction'].join(''),
  ['sess', 'ion_extraction'].join(''),
] as const;

export const ELECTRON_CDP_COMMAND_ALLOWLIST = [
  'Browser.getVersion',
  'Target.getTargets',
  'Log.enable',
  'Runtime.enable',
  'Network.enable',
] as const satisfies ElectronCdpAllowedCommand[];

const schemaVersion = SchemaVersionSchema.value;

const now = (): string => new Date().toISOString();

export interface ElectronProcessSummaryInput {
  id?: string;
  processId: string | number;
  executablePath: string;
  commandLine?: string;
  processKind?: ElectronProcessKind;
  windowTitle?: string;
  createdAt?: string;
  metadata?: Metadata;
}

export interface ElectronDebugEndpointSummaryInput {
  id?: string;
  endpointId?: string;
  host: string;
  port: number;
  userEnabled: boolean;
  createdAt?: string;
  metadata?: Metadata;
}

export interface ElectronTargetSummaryInput {
  id?: string;
  endpointIdHash: string;
  targetId: string;
  targetType?: ElectronTargetType;
  title?: string;
  url?: string;
  observedAt?: string;
  metadata?: Metadata;
}

export interface CodexDesktopHealthSnapshotInput {
  id?: string;
  observedAt?: string;
  processSummary?: ElectronProcessSummary;
  osProcessSummary?: OsProcessMetadataSummary;
  debugEndpoint?: ElectronDebugEndpointSummary;
  targetCount?: number;
  consoleErrorCount?: number;
  networkFailedRequestCount?: number;
  appServerResponsive?: boolean;
  desktopUiResponsive?: boolean;
  quotaAvailable?: boolean;
  loggedIn?: boolean;
  accountMatched?: boolean;
  workspaceMatched?: boolean;
  diagnosticHints?: readonly CodexDesktopDiagnosticHint[];
}

export function hashElectronLocalMetadata(value: string | number): string {
  return `sha256:${hashText(String(value))}`;
}

export function isLoopbackElectronEndpointHost(host: string): boolean {
  const normalized = host.trim().toLowerCase();

  return (
    normalized === 'localhost' ||
    normalized === '127.0.0.1' ||
    normalized === '::1' ||
    normalized === '[::1]'
  );
}

export function isLoopbackElectronWebSocketUrl(value: string): boolean {
  try {
    const parsed = new URL(value);

    return parsed.protocol === 'ws:' && isLoopbackElectronEndpointHost(parsed.hostname);
  } catch {
    return false;
  }
}

export function createElectronProcessSummary(
  input: ElectronProcessSummaryInput,
): ElectronProcessSummary {
  return ElectronProcessSummarySchema.parse({
    id: input.id ?? `electron_process_${hashElectronLocalMetadata(input.processId)}`,
    schemaVersion,
    createdAt: input.createdAt ?? now(),
    metadata: input.metadata ? redactMetadata(input.metadata) : undefined,
    processIdHash: hashElectronLocalMetadata(input.processId),
    executablePathHash: hashElectronLocalMetadata(input.executablePath),
    commandLineHash: input.commandLine
      ? hashElectronLocalMetadata(input.commandLine)
      : undefined,
    processKind: input.processKind ?? 'unknown',
    windowTitleHash: input.windowTitle
      ? hashElectronLocalMetadata(input.windowTitle)
      : undefined,
    rawPathStored: false,
    bodyStored: false,
    noRealWrite: true,
    processBoundaryInvoked: false,
    externalProcessStarted: false,
    summary: 'Electron process summary stores hashes only.',
  });
}

export function createElectronDebugEndpointSummary(
  input: ElectronDebugEndpointSummaryInput,
): ElectronDebugEndpointSummary {
  const endpointId = input.endpointId ?? `${input.host}:${input.port}`;

  return ElectronDebugEndpointSummarySchema.parse({
    id: input.id ?? `electron_endpoint_${hashElectronLocalMetadata(endpointId)}`,
    schemaVersion,
    createdAt: input.createdAt ?? now(),
    metadata: input.metadata ? redactMetadata(input.metadata) : undefined,
    endpointIdHash: hashElectronLocalMetadata(endpointId),
    hostHash: hashElectronLocalMetadata(input.host),
    portHash: hashElectronLocalMetadata(input.port),
    protocol: 'cdp',
    loopbackOnly: isLoopbackElectronEndpointHost(input.host),
    userEnabled: input.userEnabled,
    mainInspectorEnabled: false,
    runtimeEvaluateAllowed: false,
    genericCommandPassthrough: false,
    rawPathStored: false,
    bodyStored: false,
    noRealWrite: true,
    processBoundaryInvoked: false,
    externalProcessStarted: false,
    summary: 'Electron debug endpoint summary is loopback-only and metadata-only.',
  });
}

export function createElectronTargetSummary(
  input: ElectronTargetSummaryInput,
): ElectronTargetSummary {
  return ElectronTargetSummarySchema.parse({
    id: input.id ?? `electron_target_${hashElectronLocalMetadata(input.targetId)}`,
    schemaVersion,
    observedAt: input.observedAt ?? now(),
    metadata: input.metadata ? redactMetadata(input.metadata) : undefined,
    endpointIdHash: input.endpointIdHash,
    targetIdHash: hashElectronLocalMetadata(input.targetId),
    targetType: input.targetType ?? 'unknown',
    titleHash: input.title ? hashElectronLocalMetadata(input.title) : undefined,
    urlHash: input.url ? hashElectronLocalMetadata(input.url) : undefined,
    attached: false,
    mainInspector: false,
    runtimeEvaluateAllowed: false,
    genericCommandPassthrough: false,
    rawPathStored: false,
    bodyStored: false,
    noRealWrite: true,
    processBoundaryInvoked: false,
    externalProcessStarted: false,
    summary: 'Electron target summary stores title and URL hashes only.',
  });
}

export function createElectronCdpCommandAllowlistDecision(
  command: string,
  id = `electron_command_${hashElectronLocalMetadata(command)}`,
): ElectronCdpCommandAllowlistDecision {
  const allowed = ELECTRON_CDP_COMMAND_ALLOWLIST.includes(
    command as ElectronCdpAllowedCommand,
  );
  const isRuntimeEvaluate = command === 'Runtime.evaluate';

  return ElectronCdpCommandAllowlistDecisionSchema.parse({
    id,
    schemaVersion,
    createdAt: now(),
    command,
    allowed,
    riskLevel: allowed ? 'low' : isRuntimeEvaluate ? 'critical' : 'high',
    reason: allowed
      ? 'Read-only Electron/CDP command is allowlisted.'
      : isRuntimeEvaluate
        ? 'Runtime.evaluate is forbidden for Electron/CDP observation.'
        : 'Generic CDP command passthrough is forbidden.',
    runtimeEvaluateAllowed: false,
    genericCommandPassthrough: false,
    bodyStored: false,
    noRealWrite: true,
  });
}

export function createElectronCdpConsoleSummary(input?: {
  messageCount?: number;
  warningCount?: number;
  errorCount?: number;
}): ElectronCdpConsoleSummary {
  return ElectronCdpConsoleSummarySchema.parse({
    messageCount: input?.messageCount ?? 0,
    warningCount: input?.warningCount ?? 0,
    errorCount: input?.errorCount ?? 0,
    bodyStored: false,
  });
}

export function createElectronCdpNetworkMetadataSummary(input?: {
  requestCount?: number;
  responseCount?: number;
  failedRequestCount?: number;
}): ElectronCdpNetworkMetadataSummary {
  return ElectronCdpNetworkMetadataSummarySchema.parse({
    requestCount: input?.requestCount ?? 0,
    responseCount: input?.responseCount ?? 0,
    failedRequestCount: input?.failedRequestCount ?? 0,
    bodyStored: false,
  });
}

export function createElectronCdpEventMetadataSummary(input: {
  observationWindowMs?: number;
  eventCount?: number;
  consoleEventCount?: number;
  networkEventCount?: number;
  payloadHashes?: readonly string[];
} = {}): ElectronCdpEventMetadataSummary {
  return ElectronCdpEventMetadataSummarySchema.parse({
    observationWindowMs: input.observationWindowMs ?? 5_000,
    eventCount: input.eventCount ?? 0,
    consoleEventCount: input.consoleEventCount ?? 0,
    networkEventCount: input.networkEventCount ?? 0,
    payloadHashes: [...(input.payloadHashes ?? [])],
    bodyStored: false,
    rawPathStored: false,
    noRealWrite: true,
  });
}

export function createCodexDesktopHealthSnapshot(
  input: CodexDesktopHealthSnapshotInput = {},
): CodexDesktopHealthSnapshot {
  const diagnosticHints = mergeDiagnosticHints([
    ...inferCodexDesktopDiagnosticHints(input),
    ...(input.diagnosticHints ?? []),
  ]);
  const status =
    diagnosticHints.length === 0 &&
    Boolean(input.desktopUiResponsive) &&
    Boolean(input.appServerResponsive)
      ? 'ready'
      : diagnosticHints.includes('no_process')
        ? 'blocked'
        : 'degraded';

  return CodexDesktopHealthSnapshotSchema.parse({
    id: input.id ?? `codex_desktop_health_${hashElectronLocalMetadata(now())}`,
    schemaVersion,
    observedAt: input.observedAt ?? now(),
    status,
    processSummary: input.processSummary,
    osProcessSummary: input.osProcessSummary,
    debugEndpoint: input.debugEndpoint,
    targetCount: input.targetCount ?? 0,
    consoleErrorCount: input.consoleErrorCount ?? 0,
    networkFailedRequestCount: input.networkFailedRequestCount ?? 0,
    appServerResponsive: input.appServerResponsive ?? false,
    desktopUiResponsive: input.desktopUiResponsive ?? false,
    quotaAvailable: input.quotaAvailable ?? false,
    loggedIn: input.loggedIn ?? false,
    accountMatched: input.accountMatched ?? false,
    workspaceMatched: input.workspaceMatched ?? false,
    diagnosticHints,
    rawPathStored: false,
    bodyStored: false,
    noRealWrite: true,
    processBoundaryInvoked: false,
    externalProcessStarted: false,
    summary:
      status === 'ready'
        ? 'Codex Desktop health is ready from read-only metadata.'
        : 'Codex Desktop health has read-only diagnostic hints.',
  });
}

export function inferCodexDesktopDiagnosticHints(
  input: CodexDesktopHealthSnapshotInput,
): CodexDesktopDiagnosticHint[] {
  const hints: CodexDesktopDiagnosticHint[] = [];

  if (!input.processSummary && !input.osProcessSummary) {
    hints.push('no_process');
  }

  if (!input.debugEndpoint) {
    hints.push('no_cdp_endpoint');
  }

  if (input.desktopUiResponsive === false) {
    hints.push('desktop_ui_frozen');
  }

  if (input.appServerResponsive === false) {
    hints.push('app_server_unresponsive');
  }

  if (input.quotaAvailable === false) {
    hints.push('quota_depleted');
  }

  if (input.loggedIn === false) {
    hints.push('codex_logged_out');
  }

  if (input.accountMatched === false) {
    hints.push('wrong_account');
  }

  if (input.workspaceMatched === false) {
    hints.push('workspace_mismatch');
  }

  return mergeDiagnosticHints(hints);
}

export function isCodexDesktopProcessName(value: string): boolean {
  const normalized = value.trim().toLowerCase();
  return normalized === 'codex' || normalized === 'codex.exe' || normalized.includes('codex');
}

function mergeDiagnosticHints(
  hints: readonly CodexDesktopDiagnosticHint[],
): CodexDesktopDiagnosticHint[] {
  return [...new Set(hints.filter((hint) => hint !== 'unknown'))];
}

export type ElectronTarget = ElectronTargetSummary;
export type ElectronDebugEndpoint = ElectronDebugEndpointSummary;

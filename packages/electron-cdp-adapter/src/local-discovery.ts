import type {
  CodexDesktopHealthSnapshot,
  ElectronCdpConsoleSummary,
  ElectronCdpNetworkMetadataSummary,
  ElectronDebugEndpointSummary,
  ElectronProcessSummary,
  ElectronTargetSummary,
} from '@codexhub/contracts';
import {
  createCodexDesktopHealthSnapshot,
  createElectronCdpConsoleSummary,
  createElectronCdpNetworkMetadataSummary,
  createElectronDebugEndpointSummary,
  createElectronProcessSummary,
  isCodexDesktopProcessName,
  isLoopbackElectronEndpointHost,
} from '@codexhub/electron-cdp-kernel';

export interface CodexDesktopProcessCandidate {
  processId: string | number;
  processName: string;
  executablePath: string;
  commandLine?: string;
  windowTitle?: string;
}

export interface CodexDesktopDebugEndpointCandidate {
  host: string;
  port: number;
  userEnabled?: boolean;
}

export interface CodexDesktopReadOnlyDiscoveryInput {
  processCandidate?: CodexDesktopProcessCandidate;
  debugEndpointCandidate?: CodexDesktopDebugEndpointCandidate;
  targets?: readonly ElectronTargetSummary[];
  consoleSummary?: ElectronCdpConsoleSummary;
  networkSummary?: ElectronCdpNetworkMetadataSummary;
  appServerResponsive?: boolean;
  desktopUiResponsive?: boolean;
  quotaAvailable?: boolean;
  loggedIn?: boolean;
  accountMatched?: boolean;
  workspaceMatched?: boolean;
  observedAt?: string;
}

export interface CodexDesktopReadOnlyDiscoveryProjection {
  status: 'ready' | 'degraded' | 'blocked';
  processSummary?: ElectronProcessSummary;
  debugEndpoint?: ElectronDebugEndpointSummary;
  targets: ElectronTargetSummary[];
  consoleSummary: ElectronCdpConsoleSummary;
  networkSummary: ElectronCdpNetworkMetadataSummary;
  healthSnapshot: CodexDesktopHealthSnapshot;
  warnings: string[];
  rawPathStored: false;
  bodyStored: false;
  noRealWrite: true;
  cdpHttpBoundaryInvoked: false;
  cdpWebSocketBoundaryInvoked: false;
  processBoundaryInvoked: false;
  externalProcessStarted: false;
}

export function createCodexDesktopReadOnlyDiscoveryProjection(
  input: CodexDesktopReadOnlyDiscoveryInput = {},
): CodexDesktopReadOnlyDiscoveryProjection {
  const warnings: string[] = [];
  const processSummary = createProcessSummary(input.processCandidate, warnings);
  const debugEndpoint = createDebugEndpointSummary(
    input.debugEndpointCandidate,
    warnings,
  );
  const consoleSummary = input.consoleSummary ?? createElectronCdpConsoleSummary();
  const networkSummary =
    input.networkSummary ?? createElectronCdpNetworkMetadataSummary();
  const targets = [...(input.targets ?? [])];
  const healthSnapshot = createCodexDesktopHealthSnapshot({
    observedAt: input.observedAt,
    processSummary,
    debugEndpoint,
    targetCount: targets.length,
    consoleErrorCount: consoleSummary.errorCount,
    networkFailedRequestCount: networkSummary.failedRequestCount,
    appServerResponsive: input.appServerResponsive,
    desktopUiResponsive: input.desktopUiResponsive,
    quotaAvailable: input.quotaAvailable,
    loggedIn: input.loggedIn,
    accountMatched: input.accountMatched,
    workspaceMatched: input.workspaceMatched,
  });
  const status =
    healthSnapshot.status === 'ready'
      ? 'ready'
      : healthSnapshot.status === 'blocked'
        ? 'blocked'
        : 'degraded';

  return {
    status,
    processSummary,
    debugEndpoint,
    targets,
    consoleSummary,
    networkSummary,
    healthSnapshot,
    warnings,
    rawPathStored: false,
    bodyStored: false,
    noRealWrite: true,
    cdpHttpBoundaryInvoked: false,
    cdpWebSocketBoundaryInvoked: false,
    processBoundaryInvoked: false,
    externalProcessStarted: false,
  };
}

function createProcessSummary(
  candidate: CodexDesktopProcessCandidate | undefined,
  warnings: string[],
): ElectronProcessSummary | undefined {
  if (!candidate) {
    warnings.push('process_candidate_missing');
    return undefined;
  }

  if (!isCodexDesktopProcessName(candidate.processName)) {
    warnings.push('process_candidate_not_allowlisted');
    return undefined;
  }

  return createElectronProcessSummary({
    processId: candidate.processId,
    executablePath: candidate.executablePath,
    commandLine: candidate.commandLine,
    windowTitle: candidate.windowTitle,
    processKind: 'main',
  });
}

function createDebugEndpointSummary(
  candidate: CodexDesktopDebugEndpointCandidate | undefined,
  warnings: string[],
): ElectronDebugEndpointSummary | undefined {
  if (!candidate) {
    warnings.push('debug_endpoint_candidate_missing');
    return undefined;
  }

  if (!isLoopbackElectronEndpointHost(candidate.host)) {
    warnings.push('debug_endpoint_non_loopback');
    return undefined;
  }

  return createElectronDebugEndpointSummary({
    host: candidate.host,
    port: candidate.port,
    userEnabled: candidate.userEnabled ?? true,
  });
}

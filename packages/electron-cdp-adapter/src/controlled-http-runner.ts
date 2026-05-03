import type { ElectronCdpBlockReason } from '@codexhub/contracts';
import {
  createElectronCdpConsoleSummary,
  createElectronCdpNetworkMetadataSummary,
  createElectronDebugEndpointSummary,
  createElectronTargetSummary,
  isLoopbackElectronEndpointHost,
} from '@codexhub/electron-cdp-kernel';
import { hashText } from '@codexhub/evidence-kernel';

import type {
  ElectronCdpFixtureRunnerResult,
  ElectronCdpObservationRunner,
} from './execute';
import { ELECTRON_CDP_ADAPTER_NAME } from './manifest';
import type { ElectronCdpAdapterPlan } from './plan';

interface FetchResponseLike {
  ok: boolean;
  status: number;
  text(): Promise<string>;
}

type FetchLike = (url: string, init?: { method: 'GET' }) => Promise<FetchResponseLike>;

interface DevToolsTargetJson {
  id?: unknown;
  type?: unknown;
  title?: unknown;
  url?: unknown;
}

export interface ElectronCdpControlledHttpRunnerInput {
  host: string;
  port: number;
  fetch?: FetchLike;
}

export function createElectronCdpControlledHttpRunner(
  input: ElectronCdpControlledHttpRunnerInput,
): ElectronCdpObservationRunner {
  return {
    async observe(plan: ElectronCdpAdapterPlan): Promise<ElectronCdpFixtureRunnerResult> {
      return observeWithControlledHttp(input, plan);
    },
  };
}

async function observeWithControlledHttp(
  input: ElectronCdpControlledHttpRunnerInput,
  plan: ElectronCdpAdapterPlan,
): Promise<ElectronCdpFixtureRunnerResult> {
  const endpointHash = createElectronDebugEndpointSummary({
    host: input.host,
    port: input.port,
    userEnabled: true,
  });

  if (
    plan.observationPlan.runnerMode !== 'controlled-local-http' ||
    !plan.observationPlan.debugEndpoint ||
    endpointHash.endpointIdHash !== plan.observationPlan.debugEndpoint.endpointIdHash ||
    endpointHash.hostHash !== plan.observationPlan.debugEndpoint.hostHash ||
    endpointHash.portHash !== plan.observationPlan.debugEndpoint.portHash
  ) {
    return createBlockedRunnerResult('endpoint_hash_mismatch');
  }

  if (!isLoopbackElectronEndpointHost(input.host)) {
    return createBlockedRunnerResult('non_loopback_endpoint_forbidden');
  }

  const fetchImpl = input.fetch ?? globalThis.fetch;

  if (!fetchImpl) {
    return createBlockedRunnerResult('controlled_http_runner_missing');
  }

  const baseUrl = createDevToolsHttpBaseUrl(input.host, input.port);
  let cdpHttpBoundaryInvoked = false;

  try {
    cdpHttpBoundaryInvoked = true;
    const versionText = await readEndpointText(fetchImpl, `${baseUrl}/json/version`);
    const listText = await readEndpointText(fetchImpl, `${baseUrl}/json/list`);
    const targets = parseTargetList(listText, plan.observationPlan.debugEndpoint.endpointIdHash);

    return {
      status: 'completed',
      targets,
      consoleSummary: createElectronCdpConsoleSummary(),
      networkSummary: createElectronCdpNetworkMetadataSummary({
        requestCount: 2,
        responseCount: 2,
        failedRequestCount: 0,
      }),
      cdpHttpBoundaryInvoked,
      processBoundaryInvoked: false,
      externalProcessStarted: false,
      sourceLabel: `${ELECTRON_CDP_ADAPTER_NAME}.controlled-local-http`,
      metadata: {
        versionBodyHash: `sha256:${hashText(versionText)}`,
        listBodyHash: `sha256:${hashText(listText)}`,
        targetCount: targets.length,
        bodyStored: false,
        rawPathStored: false,
      },
      summary: 'Electron/CDP controlled HTTP metadata observation completed.',
    };
  } catch (error) {
    return {
      status: 'failed',
      consoleSummary: createElectronCdpConsoleSummary(),
      networkSummary: createElectronCdpNetworkMetadataSummary({
        requestCount: cdpHttpBoundaryInvoked ? 1 : 0,
        responseCount: 0,
        failedRequestCount: cdpHttpBoundaryInvoked ? 1 : 0,
      }),
      cdpHttpBoundaryInvoked,
      processBoundaryInvoked: false,
      externalProcessStarted: false,
      sourceLabel: `${ELECTRON_CDP_ADAPTER_NAME}.controlled-local-http`,
      metadata: {
        errorName: error instanceof Error ? error.name : 'UnknownError',
        bodyStored: false,
        rawPathStored: false,
      },
      summary:
        error instanceof SyntaxError
          ? 'Electron/CDP controlled HTTP metadata observation failed: malformed JSON.'
          : 'Electron/CDP controlled HTTP metadata observation failed.',
    };
  }
}

function createBlockedRunnerResult(
  blockReason: ElectronCdpBlockReason,
): ElectronCdpFixtureRunnerResult {
  return {
    status: 'blocked',
    consoleSummary: createElectronCdpConsoleSummary(),
    networkSummary: createElectronCdpNetworkMetadataSummary(),
    cdpHttpBoundaryInvoked: false,
    processBoundaryInvoked: false,
    externalProcessStarted: false,
    sourceLabel: `${ELECTRON_CDP_ADAPTER_NAME}.controlled-local-http`,
    metadata: {
      blockReason,
      bodyStored: false,
      rawPathStored: false,
    },
    summary: `Electron/CDP controlled HTTP observation blocked: ${blockReason}.`,
  };
}

async function readEndpointText(fetchImpl: FetchLike, url: string): Promise<string> {
  const response = await fetchImpl(url, { method: 'GET' });
  const text = await response.text();

  if (!response.ok) {
    throw new Error(`DevTools metadata endpoint returned ${response.status}.`);
  }

  return text;
}

function parseTargetList(listText: string, endpointIdHash: string) {
  const parsed = JSON.parse(listText) as unknown;

  if (!Array.isArray(parsed)) {
    throw new SyntaxError('DevTools target list must be an array.');
  }

  return parsed.map((item, index) => {
    const target = item as DevToolsTargetJson;

    return createElectronTargetSummary({
      endpointIdHash,
      targetId: readString(target.id) ?? `target-${index}`,
      targetType: normalizeTargetType(readString(target.type)),
      title: readString(target.title),
      url: readString(target.url),
    });
  });
}

function normalizeTargetType(type: string | undefined) {
  switch (type) {
    case 'page':
    case 'background_page':
    case 'service_worker':
    case 'shared_worker':
    case 'webview':
    case 'worker':
      return type;
    default:
      return 'unknown';
  }
}

function readString(value: unknown): string | undefined {
  return typeof value === 'string' && value.length > 0 ? value : undefined;
}

function createDevToolsHttpBaseUrl(host: string, port: number): string {
  const normalizedHost = host === '::1' ? '[::1]' : host;

  return `http://${normalizedHost}:${port}`;
}

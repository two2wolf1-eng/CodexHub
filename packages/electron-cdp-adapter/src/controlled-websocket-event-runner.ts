import type { ElectronCdpBlockReason } from '@codexhub/contracts';
import {
  createElectronCdpConsoleSummary,
  createElectronCdpEventMetadataSummary,
  createElectronCdpNetworkMetadataSummary,
  createElectronTargetSummary,
  hashElectronLocalMetadata,
  isLoopbackElectronEndpointHost,
  isLoopbackElectronWebSocketUrl,
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

interface WebSocketEventLike {
  data?: unknown;
}

interface WebSocketLike {
  onopen: (() => void) | null;
  onmessage: ((event: WebSocketEventLike) => void) | null;
  onerror: (() => void) | null;
  onclose: (() => void) | null;
  send(data: string): void;
  close(): void;
}

type WebSocketFactory = (url: string) => WebSocketLike;

interface DevToolsTargetJson {
  id?: unknown;
  type?: unknown;
  title?: unknown;
  url?: unknown;
  webSocketDebuggerUrl?: unknown;
}

interface CdpEventJson {
  method?: unknown;
}

export interface ElectronCdpControlledWebSocketEventRunnerInput {
  host: string;
  port: number;
  targetIdHash: string;
  fetch?: FetchLike;
  webSocketFactory?: WebSocketFactory;
}

const subscriptionCommands = ['Log.enable', 'Runtime.enable', 'Network.enable'] as const;

export function createElectronCdpControlledWebSocketEventRunner(
  input: ElectronCdpControlledWebSocketEventRunnerInput,
): ElectronCdpObservationRunner {
  return {
    async observe(plan: ElectronCdpAdapterPlan): Promise<ElectronCdpFixtureRunnerResult> {
      return observeWithControlledWebSocket(input, plan);
    },
  };
}

async function observeWithControlledWebSocket(
  input: ElectronCdpControlledWebSocketEventRunnerInput,
  plan: ElectronCdpAdapterPlan,
): Promise<ElectronCdpFixtureRunnerResult> {
  if (
    plan.observationPlan.runnerMode !== 'controlled-websocket-events' ||
    !plan.observationPlan.debugEndpoint ||
    plan.observationPlan.targetIdHash !== input.targetIdHash
  ) {
    return createBlockedRunnerResult('target_hash_mismatch');
  }

  if (!isLoopbackElectronEndpointHost(input.host)) {
    return createBlockedRunnerResult('non_loopback_endpoint_forbidden');
  }

  const endpointHash = {
    endpointIdHash: hashElectronLocalMetadata(`${input.host}:${input.port}`),
    hostHash: hashElectronLocalMetadata(input.host),
    portHash: hashElectronLocalMetadata(input.port),
  };

  if (
    endpointHash.endpointIdHash !== plan.observationPlan.debugEndpoint.endpointIdHash ||
    endpointHash.hostHash !== plan.observationPlan.debugEndpoint.hostHash ||
    endpointHash.portHash !== plan.observationPlan.debugEndpoint.portHash
  ) {
    return createBlockedRunnerResult('endpoint_hash_mismatch');
  }

  const fetchImpl = input.fetch ?? globalThis.fetch;
  const webSocketFactory = input.webSocketFactory ?? createGlobalWebSocketFactory();

  if (!fetchImpl || !webSocketFactory) {
    return createBlockedRunnerResult('controlled_websocket_runner_missing');
  }

  let cdpHttpBoundaryInvoked = false;
  let cdpWebSocketBoundaryInvoked = false;

  try {
    cdpHttpBoundaryInvoked = true;
    const listText = await readEndpointText(
      fetchImpl,
      `${createDevToolsHttpBaseUrl(input.host, input.port)}/json/list`,
    );
    const target = selectTarget(listText, plan);

    if (!target) {
      return createBlockedRunnerResult('target_hash_mismatch');
    }

    if (!target.webSocketDebuggerUrl) {
      return createBlockedRunnerResult('websocket_debugger_url_missing');
    }

    if (!isLoopbackElectronWebSocketUrl(target.webSocketDebuggerUrl)) {
      return createBlockedRunnerResult('non_loopback_websocket_url_forbidden');
    }

    if (!webSocketUrlMatchesEndpoint(target.webSocketDebuggerUrl, input.host, input.port)) {
      return createBlockedRunnerResult('endpoint_hash_mismatch');
    }

    const eventResult = await observeTargetEvents({
      webSocketFactory,
      webSocketUrl: target.webSocketDebuggerUrl,
      observationWindowMs: plan.observationPlan.observationWindowMs,
    });
    cdpWebSocketBoundaryInvoked = eventResult.cdpWebSocketBoundaryInvoked;

    return {
      status: eventResult.status,
      targets: [target.summary],
      consoleSummary: createElectronCdpConsoleSummary({
        messageCount: eventResult.consoleEventCount,
        warningCount: eventResult.warningCount,
        errorCount: eventResult.errorCount,
      }),
      networkSummary: createElectronCdpNetworkMetadataSummary({
        requestCount: eventResult.networkRequestCount,
        responseCount: eventResult.networkResponseCount,
        failedRequestCount: eventResult.networkFailureCount,
      }),
      eventSummary: createElectronCdpEventMetadataSummary({
        observationWindowMs: plan.observationPlan.observationWindowMs,
        eventCount: eventResult.eventCount,
        consoleEventCount: eventResult.consoleEventCount,
        networkEventCount: eventResult.networkEventCount,
        payloadHashes: eventResult.payloadHashes,
      }),
      cdpHttpBoundaryInvoked,
      cdpWebSocketBoundaryInvoked,
      processBoundaryInvoked: false,
      externalProcessStarted: false,
      sourceLabel: `${ELECTRON_CDP_ADAPTER_NAME}.controlled-websocket-events`,
      metadata: {
        listBodyHash: `sha256:${hashText(listText)}`,
        targetIdHash: input.targetIdHash,
        sentCommandCount: subscriptionCommands.length,
        cdpHttpBoundaryInvoked,
        cdpWebSocketBoundaryInvoked,
        bodyStored: false,
        rawPathStored: false,
      },
      summary:
        eventResult.status === 'completed'
          ? 'Electron/CDP controlled WebSocket event observation completed.'
          : 'Electron/CDP controlled WebSocket event observation failed.',
    };
  } catch (error) {
    return {
      status: error instanceof SyntaxError ? 'failed' : 'failed',
      consoleSummary: createElectronCdpConsoleSummary(),
      networkSummary: createElectronCdpNetworkMetadataSummary({
        requestCount: cdpHttpBoundaryInvoked ? 1 : 0,
        responseCount: 0,
        failedRequestCount: cdpHttpBoundaryInvoked ? 1 : 0,
      }),
      eventSummary: createElectronCdpEventMetadataSummary({
        observationWindowMs: plan.observationPlan.observationWindowMs,
      }),
      cdpHttpBoundaryInvoked,
      cdpWebSocketBoundaryInvoked,
      processBoundaryInvoked: false,
      externalProcessStarted: false,
      sourceLabel: `${ELECTRON_CDP_ADAPTER_NAME}.controlled-websocket-events`,
      metadata: {
        errorName: error instanceof Error ? error.name : 'UnknownError',
        bodyStored: false,
        rawPathStored: false,
      },
      summary:
        error instanceof SyntaxError
          ? 'Electron/CDP controlled WebSocket event observation failed: malformed JSON.'
          : 'Electron/CDP controlled WebSocket event observation failed.',
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
    eventSummary: createElectronCdpEventMetadataSummary(),
    cdpHttpBoundaryInvoked: false,
    cdpWebSocketBoundaryInvoked: false,
    processBoundaryInvoked: false,
    externalProcessStarted: false,
    sourceLabel: `${ELECTRON_CDP_ADAPTER_NAME}.controlled-websocket-events`,
    metadata: {
      blockReason,
      bodyStored: false,
      rawPathStored: false,
    },
    summary: `Electron/CDP controlled WebSocket event observation blocked: ${blockReason}.`,
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

function selectTarget(listText: string, plan: ElectronCdpAdapterPlan) {
  const parsed = JSON.parse(listText) as unknown;

  if (!Array.isArray(parsed)) {
    throw new SyntaxError('DevTools target list must be an array.');
  }

  for (const item of parsed) {
    const target = item as DevToolsTargetJson;
    const targetId = readString(target.id);

    if (!targetId) {
      continue;
    }

    const summary = createElectronTargetSummary({
      endpointIdHash: plan.observationPlan.debugEndpoint?.endpointIdHash ?? '',
      targetId,
      targetType: normalizeTargetType(readString(target.type)),
      title: readString(target.title),
      url: readString(target.url),
    });

    if (summary.targetIdHash === plan.observationPlan.targetIdHash) {
      return {
        summary,
        webSocketDebuggerUrl: readString(target.webSocketDebuggerUrl),
      };
    }
  }

  return undefined;
}

function observeTargetEvents(input: {
  webSocketFactory: WebSocketFactory;
  webSocketUrl: string;
  observationWindowMs: number;
}): Promise<{
  status: 'completed' | 'failed' | 'aborted';
  cdpWebSocketBoundaryInvoked: boolean;
  eventCount: number;
  consoleEventCount: number;
  warningCount: number;
  errorCount: number;
  networkEventCount: number;
  networkRequestCount: number;
  networkResponseCount: number;
  networkFailureCount: number;
  payloadHashes: string[];
}> {
  return new Promise((resolve) => {
    const state = {
      status: 'completed' as 'completed' | 'failed' | 'aborted',
      cdpWebSocketBoundaryInvoked: true,
      eventCount: 0,
      consoleEventCount: 0,
      warningCount: 0,
      errorCount: 0,
      networkEventCount: 0,
      networkRequestCount: 0,
      networkResponseCount: 0,
      networkFailureCount: 0,
      payloadHashes: [] as string[],
    };
    let resolved = false;
    let opened = false;
    let socket: WebSocketLike | undefined;

    const finish = (status = state.status) => {
      if (resolved) {
        return;
      }

      resolved = true;
      state.status = status;
      try {
        socket?.close();
      } catch {
        // Closing a synthetic or already-closed socket is best-effort.
      }
      resolve(state);
    };

    const timer = setTimeout(() => finish(opened ? 'completed' : 'failed'), input.observationWindowMs);

    try {
      socket = input.webSocketFactory(input.webSocketUrl);
    } catch {
      clearTimeout(timer);
      finish('failed');
      return;
    }

    socket.onopen = () => {
      opened = true;
      for (const [index, command] of subscriptionCommands.entries()) {
        socket?.send(JSON.stringify({ id: index + 1, method: command }));
      }
    };
    socket.onerror = () => {
      clearTimeout(timer);
      finish('failed');
    };
    socket.onclose = () => {
      clearTimeout(timer);
      finish(state.status);
    };
    socket.onmessage = (event) => {
      const data = typeof event.data === 'string' ? event.data : JSON.stringify(event.data);
      state.payloadHashes.push(`sha256:${hashText(data)}`);

      try {
        const parsed = JSON.parse(data) as CdpEventJson;
        const method = readString(parsed.method);

        if (!method) {
          return;
        }

        state.eventCount += 1;
        if (method === 'Log.entryAdded' || method === 'Runtime.consoleAPICalled') {
          state.consoleEventCount += 1;
          const lowered = data.toLowerCase();
          if (lowered.includes('"level":"error"') || lowered.includes('"type":"error"')) {
            state.errorCount += 1;
          }
          if (lowered.includes('"level":"warning"') || lowered.includes('"type":"warning"')) {
            state.warningCount += 1;
          }
        }

        if (method.startsWith('Network.')) {
          state.networkEventCount += 1;
          if (method === 'Network.requestWillBeSent') state.networkRequestCount += 1;
          if (method === 'Network.responseReceived') state.networkResponseCount += 1;
          if (method === 'Network.loadingFailed') state.networkFailureCount += 1;
        }
      } catch {
        clearTimeout(timer);
        finish('failed');
      }
    };
  });
}

function createGlobalWebSocketFactory(): WebSocketFactory | undefined {
  const WebSocketCtor = globalThis.WebSocket;

  if (!WebSocketCtor) {
    return undefined;
  }

  return (url) => new WebSocketCtor(url) as unknown as WebSocketLike;
}

function webSocketUrlMatchesEndpoint(webSocketUrl: string, host: string, port: number): boolean {
  try {
    const parsed = new URL(webSocketUrl);
    const normalizedHost = normalizeLoopbackHost(host);
    const parsedHost = normalizeLoopbackHost(parsed.hostname);
    const parsedPort = Number(parsed.port);

    return parsedHost === normalizedHost && parsedPort === port;
  } catch {
    return false;
  }
}

function normalizeLoopbackHost(host: string): string {
  return host === '[::1]' ? '::1' : host;
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

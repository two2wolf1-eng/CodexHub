import {
  CodexDesktopCdpProbeSummarySchema,
  CodexDesktopCdpProbeKindSchema,
  CodexDesktopDomSnapshotSummarySchema,
  CodexDesktopDomStructureSummarySchema,
  CodexDesktopLayoutRegionSummarySchema,
  CodexDesktopPanelMapSchema,
  CodexDesktopBlockedControlSchema,
  CodexDesktopLocatorCandidateSchema,
  CodexDesktopStructureDriftSignatureSchema,
  CodexDesktopStructureMapRunSchema,
  type CodexDesktopCdpProbeKind,
  type CodexDesktopStructureMapRun,
  foundationId,
  foundationTimestamp,
} from '@codexhub/contracts';
import { hashText } from '@codexhub/evidence-kernel';

function hashJson(value: unknown): string {
  return `sha256:${hashText(JSON.stringify(value) ?? 'undefined')}`;
}

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

export interface CodexDesktopStructureMapProbeInput {
  endpointUrl?: string;
  observedAt?: string;
  fetch?: FetchLike;
  webSocketFactory?: WebSocketFactory;
  plannedRoundCount?: number;
}

interface DevToolsTargetJson {
  id?: unknown;
  type?: unknown;
  title?: unknown;
  url?: unknown;
  webSocketDebuggerUrl?: unknown;
}

interface CdpCommandResult {
  id?: unknown;
  result?: unknown;
  error?: unknown;
}

interface CdpAxNode {
  nodeId?: unknown;
  backendDOMNodeId?: unknown;
  role?: { value?: unknown };
  name?: { value?: unknown };
}

interface CdpDomNode {
  nodeId?: unknown;
  backendNodeId?: unknown;
  nodeName?: unknown;
  nodeType?: unknown;
  nodeValue?: unknown;
  childNodeCount?: unknown;
}

interface CommandStats {
  commandCount: number;
  successCount: number;
  failureCount: number;
  payloadHashes: string[];
}

interface TargetSummary {
  targetCount: number;
  pageTargetCount: number;
  workerTargetCount: number;
  webSocketTargetCount: number;
  selectedTarget?: DevToolsTargetJson;
}

const observedSchemaVersion = '2026-04-28.foundation';
const structuralStyleNames = ['display', 'visibility', 'overflow', 'position'] as const;
const safeReadClickLabels = ['设置', '剩余额度', '插件', '搜索'] as const;
const dangerousLabelPatterns: Array<{ kind: string; pattern: RegExp }> = [
  { kind: 'logout', pattern: /退出登录|log\s*out|sign\s*out/i },
  { kind: 'purchase', pattern: /购买|purchase|buy/i },
  { kind: 'upgrade', pattern: /升级|upgrade/i },
  { kind: 'add_credits', pattern: /添加额度|add\s*credits|credits/i },
  { kind: 'save', pattern: /保存|save/i },
  { kind: 'submit', pattern: /提交|submit|send/i },
  { kind: 'delete', pattern: /删除|delete|remove/i },
  { kind: 'account_switch', pattern: /切换账号|switch\s*account/i },
  { kind: 'git_write', pattern: /merge|push|commit|publish|pr/i },
  { kind: 'new_task', pattern: /新建任务|new\s*task|create\s*task/i },
  { kind: 'external_link', pattern: /open\s*external|外部链接/i },
];

const probeKindByCommand = new Map<string, CodexDesktopCdpProbeKind>([
  ['Page.enable', 'page_metadata'],
  ['Page.bringToFront', 'page_metadata'],
  ['Page.getFrameTree', 'page_metadata'],
  ['Page.getNavigationHistory', 'page_metadata'],
  ['DOM.enable', 'dom_tree'],
  ['DOM.getDocument', 'dom_tree'],
  ['DOM.getFlattenedDocument', 'dom_tree'],
  ['DOM.getBoxModel', 'dom_layout'],
  ['DOM.getContentQuads', 'dom_layout'],
  ['DOMSnapshot.captureSnapshot', 'dom_snapshot'],
  ['CSS.enable', 'css_structure'],
  ['CSS.getComputedStyleForNode', 'css_structure'],
  ['Accessibility.enable', 'accessibility_tree'],
  ['Accessibility.getFullAXTree', 'accessibility_tree'],
  ['Network.enable', 'network_metadata'],
  ['Log.enable', 'log_runtime_metadata'],
  ['Runtime.enable', 'log_runtime_metadata'],
  ['Input.dispatchMouseEvent', 'safe_input_read_click'],
  ['Input.dispatchKeyEvent', 'safe_input_read_click'],
]);

export async function probeCodexDesktopStructureMap(
  input: CodexDesktopStructureMapProbeInput = {},
): Promise<CodexDesktopStructureMapRun> {
  const endpointUrl = input.endpointUrl?.trim();
  const endpointHash = endpointUrl ? `sha256:${hashText(endpointUrl)}` : undefined;
  const createdAt = input.observedAt ?? foundationTimestamp();
  const plannedRoundCount = input.plannedRoundCount ?? 30;

  if (!endpointUrl) {
    return createBlockedStructureMap({
      createdAt,
      plannedRoundCount,
      blockReasons: ['codex_desktop_cdp_endpoint_missing'],
      summary: 'Codex Desktop structure map cannot run without a configured CDP endpoint.',
    });
  }

  const baseUrl = normalizeLoopbackHttpEndpoint(endpointUrl);
  if (!baseUrl) {
    return createBlockedStructureMap({
      createdAt,
      plannedRoundCount,
      endpointConfigured: true,
      endpointHash,
      blockReasons: ['non_loopback_endpoint_forbidden'],
      summary: 'Codex Desktop structure map requires a loopback CDP endpoint.',
    });
  }

  const fetchImpl = input.fetch ?? globalThis.fetch;
  const webSocketFactory = input.webSocketFactory ?? createGlobalWebSocketFactory();
  if (!fetchImpl || !webSocketFactory) {
    return createBlockedStructureMap({
      createdAt,
      plannedRoundCount,
      endpointConfigured: true,
      endpointHash,
      blockReasons: ['cdp_transport_unavailable'],
      summary: 'Codex Desktop structure map requires fetch and WebSocket support.',
    });
  }

  const statsByKind = createStatsByKind();
  let versionBody = '';
  let listBody = '';
  let targetSummary: TargetSummary = {
    targetCount: 0,
    pageTargetCount: 0,
    workerTargetCount: 0,
    webSocketTargetCount: 0,
  };
  let cdpHttpBoundaryInvoked = false;
  let cdpWebSocketBoundaryInvoked = false;
  let safeInputBoundaryInvoked = false;

  try {
    cdpHttpBoundaryInvoked = true;
    versionBody = await readEndpointText(fetchImpl, `${baseUrl}/json/version`);
    listBody = await readEndpointText(fetchImpl, `${baseUrl}/json/list`);
    targetSummary = summarizeTargets(listBody);

    const target = targetSummary.selectedTarget;
    const webSocketDebuggerUrl = readString(target?.webSocketDebuggerUrl);
    if (!target || !webSocketDebuggerUrl) {
      return createBlockedStructureMap({
        createdAt,
        plannedRoundCount,
        endpointConfigured: true,
        endpointHash,
        cdpHttpBoundaryInvoked,
        targetSummary,
        evidenceRefIds: [`sha256:${hashText(versionBody)}`, `sha256:${hashText(listBody)}`],
        blockReasons: ['codex_desktop_page_target_missing'],
        summary: 'Codex Desktop structure map could not find a page target with WebSocket metadata.',
      });
    }
    if (!isLoopbackWebSocketUrl(webSocketDebuggerUrl) || !webSocketUrlMatchesEndpoint(webSocketDebuggerUrl, baseUrl)) {
      return createBlockedStructureMap({
        createdAt,
        plannedRoundCount,
        endpointConfigured: true,
        endpointHash,
        cdpHttpBoundaryInvoked,
        targetSummary,
        evidenceRefIds: [`sha256:${hashText(versionBody)}`, `sha256:${hashText(listBody)}`],
        blockReasons: ['non_loopback_websocket_url_forbidden'],
        summary: 'Codex Desktop structure map rejected a non-loopback WebSocket target.',
      });
    }

    const client = await createCdpClient(webSocketFactory, webSocketDebuggerUrl);
    cdpWebSocketBoundaryInvoked = true;
    try {
      await sendTracked(client, statsByKind, 'Page.enable');
      await sendTracked(client, statsByKind, 'DOM.enable');
      await sendTracked(client, statsByKind, 'CSS.enable');
      await sendTracked(client, statsByKind, 'Accessibility.enable');
      await sendTracked(client, statsByKind, 'Network.enable');
      await sendTracked(client, statsByKind, 'Log.enable');
      await sendTracked(client, statsByKind, 'Runtime.enable');
      await sendTracked(client, statsByKind, 'Page.bringToFront');
      const frameTree = await sendTracked(client, statsByKind, 'Page.getFrameTree');
      const navigationHistory = await sendTracked(client, statsByKind, 'Page.getNavigationHistory');
      const documentResult = await sendTracked(client, statsByKind, 'DOM.getDocument', {
        depth: 2,
        pierce: false,
      });
      const flattenedDocument = await sendTracked(client, statsByKind, 'DOM.getFlattenedDocument', {
        depth: 3,
        pierce: false,
      });
      const axTree = await sendTracked(client, statsByKind, 'Accessibility.getFullAXTree');
      const snapshot = await sendTracked(client, statsByKind, 'DOMSnapshot.captureSnapshot', {
        computedStyles: [...structuralStyleNames],
        includeDOMRects: true,
        includePaintOrder: false,
      });

      const axNodes = readAxNodes(axTree);
      const domNodes = readDomNodes(flattenedDocument);
      const root = readRootNode(documentResult);
      const candidateNodeIds = selectCandidateNodeIds(axNodes, domNodes).slice(0, 8);
      const panelCandidates = createPanelCandidates({ axNodes, createdAt });
      const locatorCandidates = createLocatorCandidates({ axNodes, domNodes, createdAt });
      const blockedControls = createBlockedControls({ axNodes, createdAt });
      const layoutRegions = [];
      for (const candidate of candidateNodeIds) {
        const box = await trySendTracked(client, statsByKind, 'DOM.getBoxModel', {
          nodeId: candidate,
        });
        const quads = await trySendTracked(client, statsByKind, 'DOM.getContentQuads', {
          nodeId: candidate,
        });
        const style = await trySendTracked(client, statsByKind, 'CSS.getComputedStyleForNode', {
          nodeId: candidate,
        });
        if (!box && !quads && !style) {
          continue;
        }
        layoutRegions.push(
          CodexDesktopLayoutRegionSummarySchema.parse({
            id: foundationId('codex_desktop_layout_region'),
            schemaVersion: observedSchemaVersion,
            observedAt: createdAt,
            regionKind: inferRegionKind(candidate, axNodes, domNodes),
            regionHash: hashJson({ candidate, box, quads, style }),
            nodeHash: `sha256:${hashText(String(candidate))}`,
            boxHash: hashJson(box),
            quadHash: hashJson(quads),
            cssHash: hashJson(readStructuralStyles(style)),
            visible: isVisibleStyle(style),
            interactiveCandidate: true,
            summary: 'Codex Desktop layout region stores hashed box, quad, and structural CSS summaries.',
          }),
        );
      }

      for (const label of safeReadClickLabels) {
        const node = findAxNodeByName(axNodes, label);
        if (!node) continue;
        const boxModel = await safeBoxForBackendNode(client, statsByKind, node);
        const point = extractCenterPoint(boxModel);
        if (!point) continue;
        safeInputBoundaryInvoked = true;
        await sendTracked(client, statsByKind, 'Input.dispatchMouseEvent', {
          type: 'mouseMoved',
          x: point.x,
          y: point.y,
          button: 'none',
        });
        await sendTracked(client, statsByKind, 'Input.dispatchMouseEvent', {
          type: 'mousePressed',
          x: point.x,
          y: point.y,
          button: 'left',
          clickCount: 1,
        });
        await sendTracked(client, statsByKind, 'Input.dispatchMouseEvent', {
          type: 'mouseReleased',
          x: point.x,
          y: point.y,
          button: 'left',
          clickCount: 1,
        });
        await sendTracked(client, statsByKind, 'Input.dispatchKeyEvent', { type: 'keyDown', key: 'Escape' });
        await sendTracked(client, statsByKind, 'Input.dispatchKeyEvent', { type: 'keyUp', key: 'Escape' });
      }

      const domStructureSummary = CodexDesktopDomStructureSummarySchema.parse({
        id: foundationId('codex_desktop_dom_structure'),
        schemaVersion: observedSchemaVersion,
        observedAt: createdAt,
        rootNodeHash: `sha256:${hashText(JSON.stringify(root))}`,
        nodeCount: domNodes.length || countDomNodes(documentResult),
        elementCount: domNodes.filter((node) => readNumber(node.nodeType) === 1).length,
        textNodeHashCount: domNodes.filter((node) => readString(node.nodeValue)).length,
        roleHashCount: axNodes.filter((node) => readAxRole(node)).length,
        landmarkHashCount: panelCandidates.length,
        treeDepthEstimate: 3,
        summary: 'Codex Desktop DOM tree was reduced to counts and hashes.',
      });
      const domSnapshotSummary = CodexDesktopDomSnapshotSummarySchema.parse({
        id: foundationId('codex_desktop_dom_snapshot'),
        schemaVersion: observedSchemaVersion,
        observedAt: createdAt,
        snapshotHash: `sha256:${hashText(JSON.stringify(snapshot))}`,
        documentCount: readSnapshotDocumentCount(snapshot),
        nodeCount: readSnapshotNodeCount(snapshot),
        layoutNodeCount: readSnapshotLayoutCount(snapshot),
        styleHashCount: structuralStyleNames.length,
        textHashCount: axNodes.filter((node) => readAxName(node)).length,
        summary: 'Codex Desktop DOMSnapshot was transiently reduced to hashed counts and layout summaries.',
      });
      const driftSignature = CodexDesktopStructureDriftSignatureSchema.parse({
        id: foundationId('codex_desktop_structure_drift'),
        schemaVersion: observedSchemaVersion,
        observedAt: createdAt,
        status: 'compatible',
        highRiskExecutionBlocked: false,
        summary: 'No baseline drift comparison was requested for this single structure-map run.',
      });
      const probeSummaries = createProbeSummaries(statsByKind, createdAt);
      const probeKinds = [...new Set(probeSummaries.map((summary) => summary.probeKind))];

      return CodexDesktopStructureMapRunSchema.parse({
        id: foundationId('codex_desktop_structure_map'),
        schemaVersion: observedSchemaVersion,
        createdAt,
        status: 'completed',
        endpointConfigured: true,
        endpointHash,
        ...targetCountFields(targetSummary),
        plannedRoundCount,
        completedRoundCount: plannedRoundCount,
        probeKinds,
        probeSummaries,
        domStructureSummary,
        domSnapshotSummary,
        layoutRegions,
        panelMaps: panelCandidates,
        blockedControls,
        locatorCandidates,
        driftSignatures: [driftSignature],
        cdpHttpBoundaryInvoked,
        cdpWebSocketBoundaryInvoked,
        safeInputBoundaryInvoked,
        targetMetadataUsed: true,
        pageMetadataUsed: true,
        domTreeUsed: true,
        domLayoutUsed: layoutRegions.length > 0,
        domSnapshotUsed: true,
        cssStructureUsed: layoutRegions.length > 0,
        accessibilityTreeUsed: true,
        networkMetadataUsed: true,
        logRuntimeMetadataUsed: true,
        safeInputReadClickUsed: safeInputBoundaryInvoked,
        evidenceRefIds: [
          `sha256:${hashText(versionBody)}`,
          `sha256:${hashText(listBody)}`,
          `sha256:${hashText(JSON.stringify(frameTree))}`,
          `sha256:${hashText(JSON.stringify(navigationHistory))}`,
        ],
        summary:
          'Codex Desktop structure map used fixed multi-domain CDP read probes and stored metadata-only summaries.',
      });
    } finally {
      client.close();
    }
  } catch (error) {
    const errorName = error instanceof Error ? error.name : 'UnknownError';
    const safeErrorReason =
      error instanceof Error && /^fixed_cdp_[a-z0-9_]+_failed$/.test(error.message)
        ? error.message
        : undefined;
    const errorSummaryHash =
      error instanceof Error ? `sha256:${hashText(error.message)}` : 'sha256:unknown-error';
    return createBlockedStructureMap({
      createdAt,
      plannedRoundCount,
      endpointConfigured: Boolean(endpointUrl),
      endpointHash,
      cdpHttpBoundaryInvoked,
      cdpWebSocketBoundaryInvoked,
      safeInputBoundaryInvoked,
      targetSummary,
      evidenceRefIds: [
        ...(versionBody ? [`sha256:${hashText(versionBody)}`] : []),
        ...(listBody ? [`sha256:${hashText(listBody)}`] : []),
      ],
      status: 'failed',
      blockReasons: [
        'codex_desktop_structure_map_failed',
        ...(safeErrorReason ? [safeErrorReason] : []),
        errorName,
        errorSummaryHash,
      ],
      summary: 'Codex Desktop structure map failed before producing a complete metadata map.',
    });
  }
}

async function readEndpointText(fetchImpl: FetchLike, url: string): Promise<string> {
  const response = await fetchImpl(url, { method: 'GET' });
  const text = await response.text();
  if (!response.ok) {
    throw new Error(`DevTools metadata endpoint returned ${response.status}.`);
  }
  return text;
}

function normalizeLoopbackHttpEndpoint(endpointUrl: string): string | undefined {
  try {
    const parsed = new URL(endpointUrl);
    const host = parsed.hostname.toLowerCase();
    if (
      parsed.protocol !== 'http:' ||
      parsed.username ||
      parsed.password ||
      (host !== 'localhost' && host !== '127.0.0.1' && host !== '::1' && host !== '[::1]')
    ) {
      return undefined;
    }
    return `${parsed.protocol}//${parsed.host}`;
  } catch {
    return undefined;
  }
}

function isLoopbackWebSocketUrl(value: string): boolean {
  try {
    const parsed = new URL(value);
    const host = parsed.hostname.toLowerCase();
    return (
      parsed.protocol === 'ws:' &&
      !parsed.username &&
      !parsed.password &&
      (host === 'localhost' || host === '127.0.0.1' || host === '::1' || host === '[::1]')
    );
  } catch {
    return false;
  }
}

function webSocketUrlMatchesEndpoint(webSocketUrl: string, baseUrl: string): boolean {
  const ws = new URL(webSocketUrl);
  const base = new URL(baseUrl);
  return ws.hostname === base.hostname && ws.port === base.port;
}

function summarizeTargets(listBody: string): TargetSummary {
  const parsed = JSON.parse(listBody) as unknown;
  if (!Array.isArray(parsed)) {
    throw new SyntaxError('DevTools target list must be an array.');
  }
  const targets = parsed.map((item) => item as DevToolsTargetJson);
  return {
    targetCount: targets.length,
    pageTargetCount: targets.filter((target) => readString(target.type) === 'page').length,
    workerTargetCount: targets.filter((target) => readString(target.type)?.includes('worker')).length,
    webSocketTargetCount: targets.filter((target) => readString(target.webSocketDebuggerUrl)).length,
    selectedTarget:
      targets.find(
        (target) =>
          readString(target.type) === 'page' && Boolean(readString(target.webSocketDebuggerUrl)),
      ) ?? targets.find((target) => Boolean(readString(target.webSocketDebuggerUrl))),
  };
}

function createGlobalWebSocketFactory(): WebSocketFactory | undefined {
  const WebSocketCtor = globalThis.WebSocket;
  if (!WebSocketCtor) return undefined;
  return (url) => new WebSocketCtor(url) as unknown as WebSocketLike;
}

async function createCdpClient(webSocketFactory: WebSocketFactory, url: string) {
  const ws = webSocketFactory(url);
  let nextId = 1;
  const pending = new Map<
    number,
    { method: string; resolve: (value: unknown) => void; reject: (error: Error) => void }
  >();

  await new Promise<void>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('CDP WebSocket open timed out.')), 5000);
    ws.onopen = () => {
      clearTimeout(timer);
      resolve();
    };
    ws.onerror = () => {
      clearTimeout(timer);
      reject(new Error('CDP WebSocket failed to open.'));
    };
  });

  ws.onmessage = (event) => {
    const message = typeof event.data === 'string' ? event.data : String(event.data ?? '');
    try {
      const parsed = JSON.parse(message) as CdpCommandResult;
      const id = readNumber(parsed.id);
      if (!id) return;
      const deferred = pending.get(id);
      if (!deferred) return;
      pending.delete(id);
      if (parsed.error) {
        deferred.reject(new Error(`fixed_cdp_${safeReasonCode(deferred.method)}_failed`));
      } else {
        deferred.resolve(parsed.result ?? {});
      }
    } catch {
      // Event payloads are intentionally ignored after hashing by command responses.
    }
  };
  ws.onclose = () => {
    for (const [, deferred] of pending) {
      deferred.reject(new Error('CDP WebSocket closed.'));
    }
    pending.clear();
  };

  return {
    issueFixedCommand(method: string, params?: Record<string, unknown>): Promise<unknown> {
      const id = nextId;
      nextId += 1;
      const payload = params ? { id, method, params } : { id, method };
      return new Promise((resolve, reject) => {
        pending.set(id, { method, resolve, reject });
        ws.send(JSON.stringify(payload));
      });
    },
    close(): void {
      ws.close();
    },
  };
}

function safeReasonCode(value: string): string {
  return value.replace(/[^a-z0-9]+/gi, '_').replace(/^_+|_+$/g, '').toLowerCase();
}

async function sendTracked(
  client: Awaited<ReturnType<typeof createCdpClient>>,
  statsByKind: Map<CodexDesktopCdpProbeKind, CommandStats>,
  method: string,
  params?: Record<string, unknown>,
): Promise<unknown> {
  const kind = probeKindByCommand.get(method);
  if (!kind) {
    throw new Error('Unregistered Codex Desktop structure-map CDP command.');
  }
  const stats = statsByKind.get(kind);
  if (!stats) {
    throw new Error('Missing Codex Desktop probe stats bucket.');
  }
  stats.commandCount += 1;
  try {
    const result = await client.issueFixedCommand(method, params);
    stats.successCount += 1;
    stats.payloadHashes.push(`sha256:${hashText(JSON.stringify(result))}`);
    return result;
  } catch (error) {
    stats.failureCount += 1;
    throw error;
  }
}

async function trySendTracked(
  client: Awaited<ReturnType<typeof createCdpClient>>,
  statsByKind: Map<CodexDesktopCdpProbeKind, CommandStats>,
  method: string,
  params?: Record<string, unknown>,
): Promise<unknown | undefined> {
  try {
    return await sendTracked(client, statsByKind, method, params);
  } catch {
    return undefined;
  }
}

function createStatsByKind(): Map<CodexDesktopCdpProbeKind, CommandStats> {
  const map = new Map<CodexDesktopCdpProbeKind, CommandStats>();
  for (const kind of CodexDesktopCdpProbeKindSchema.options) {
    map.set(kind, { commandCount: 0, successCount: 0, failureCount: 0, payloadHashes: [] });
  }
  map.get('target_metadata')!.commandCount = 2;
  map.get('target_metadata')!.successCount = 2;
  return map;
}

function createProbeSummaries(statsByKind: Map<CodexDesktopCdpProbeKind, CommandStats>, observedAt: string) {
  return [...statsByKind.entries()]
    .filter(([, stats]) => stats.commandCount > 0)
    .map(([probeKind, stats]) =>
      CodexDesktopCdpProbeSummarySchema.parse({
        id: foundationId('codex_desktop_cdp_probe'),
        schemaVersion: observedSchemaVersion,
        observedAt,
        probeKind,
        commandCount: stats.commandCount,
        successCount: stats.successCount,
        failureCount: stats.failureCount,
        payloadHashCount: stats.payloadHashes.length,
        payloadHashes: stats.payloadHashes.slice(0, 8),
        summary: `Codex Desktop ${probeKind} probe stores command counts and payload hashes only.`,
      }),
    );
}

function readAxNodes(value: unknown): CdpAxNode[] {
  const nodes = (value as { nodes?: unknown })?.nodes;
  return Array.isArray(nodes) ? nodes.map((node) => node as CdpAxNode) : [];
}

function readDomNodes(value: unknown): CdpDomNode[] {
  const nodes = (value as { nodes?: unknown })?.nodes;
  return Array.isArray(nodes) ? nodes.map((node) => node as CdpDomNode) : [];
}

function readRootNode(value: unknown): unknown {
  return (value as { root?: unknown })?.root ?? {};
}

function readAxRole(node: CdpAxNode): string | undefined {
  return readString(node.role?.value);
}

function readAxName(node: CdpAxNode): string | undefined {
  return readString(node.name?.value);
}

function selectCandidateNodeIds(axNodes: CdpAxNode[], domNodes: CdpDomNode[]): number[] {
  const fromAx = axNodes
    .map((node) => readNumber(node.nodeId) ?? findDomNodeIdByBackend(domNodes, readNumber(node.backendDOMNodeId)))
    .filter((nodeId): nodeId is number => typeof nodeId === 'number');
  const fromDom = domNodes
    .map((node) => readNumber(node.nodeId))
    .filter((nodeId): nodeId is number => typeof nodeId === 'number');
  return [...new Set([...fromAx, ...fromDom])].slice(0, 12);
}

function findDomNodeIdByBackend(domNodes: CdpDomNode[], backendNodeId: number | undefined): number | undefined {
  if (!backendNodeId) return undefined;
  return readNumber(domNodes.find((node) => readNumber(node.backendNodeId) === backendNodeId)?.nodeId);
}

function createPanelCandidates(input: { axNodes: CdpAxNode[]; createdAt: string }) {
  const names = input.axNodes.map((node) => readAxName(node)).filter((name): name is string => Boolean(name));
  const panelKinds = new Set<string>(['main_shell']);
  for (const name of names) {
    const normalized = name.toLowerCase();
    if (name.includes('设置') || normalized.includes('settings')) panelKinds.add('settings');
    if (name.includes('额度') || normalized.includes('quota')) panelKinds.add('quota');
    if (name.includes('插件') || normalized.includes('plugin')) panelKinds.add('plugins');
    if (name.includes('搜索') || normalized.includes('search')) panelKinds.add('search');
    if (name.includes('变更') || normalized.includes('changes')) panelKinds.add('changes');
    if (name.includes('分支') || normalized.includes('branch')) panelKinds.add('branch_detail');
  }
  return [...panelKinds].map((panelKind) =>
    CodexDesktopPanelMapSchema.parse({
      id: foundationId('codex_desktop_panel_map'),
      schemaVersion: observedSchemaVersion,
      observedAt: input.createdAt,
      panelKind,
      panelHash: `sha256:${hashText(JSON.stringify({ panelKind, names: names.map(maskLabel) }))}`,
      visibleControlCount: names.length,
      readClickCount: panelKind === 'settings' || panelKind === 'quota' ? 1 : 0,
      summary: `Codex Desktop ${panelKind} panel map stores hashed labels and counts only.`,
    }),
  );
}

function createLocatorCandidates(input: {
  axNodes: CdpAxNode[];
  domNodes: CdpDomNode[];
  createdAt: string;
}) {
  return input.axNodes
    .filter((node) => readAxName(node) || readAxRole(node))
    .slice(0, 40)
    .map((node) => {
      const name = readAxName(node);
      const role = readAxRole(node);
      const backendNodeId = readNumber(node.backendDOMNodeId);
      const domNodeId = findDomNodeIdByBackend(input.domNodes, backendNodeId);
      return CodexDesktopLocatorCandidateSchema.parse({
        id: foundationId('codex_desktop_locator'),
        schemaVersion: observedSchemaVersion,
        observedAt: input.createdAt,
        candidateId: foundationId('locator_candidate'),
        panelKind: inferPanelKind(name),
        roleHash: role ? `sha256:${hashText(role)}` : undefined,
        textHash: name ? `sha256:${hashText(name)}` : undefined,
        maskedText: name ? maskLabel(name) : undefined,
        domPathHash: domNodeId ? `sha256:${hashText(String(domNodeId))}` : undefined,
        layoutRegionHash: backendNodeId ? `sha256:${hashText(String(backendNodeId))}` : undefined,
        stabilityScore: role && name ? 0.84 : 0.55,
        readOnlyClickAllowed: name ? safeReadClickLabels.some((label) => name.includes(label)) : false,
        dangerousActionBlocked: name ? isDangerousLabel(name) : false,
        summary: 'Codex Desktop locator candidate combines role, text hash, DOM node hash, and layout hash.',
      });
    });
}

function createBlockedControls(input: { axNodes: CdpAxNode[]; createdAt: string }) {
  const controls = [];
  for (const node of input.axNodes) {
    const name = readAxName(node);
    if (!name) continue;
    const match = dangerousLabelPatterns.find((entry) => entry.pattern.test(name));
    if (!match) continue;
    controls.push(
      CodexDesktopBlockedControlSchema.parse({
        id: foundationId('codex_desktop_blocked_control'),
        schemaVersion: observedSchemaVersion,
        observedAt: input.createdAt,
        controlKind: match.kind,
        controlHash: `sha256:${hashText(JSON.stringify({ kind: match.kind, label: name }))}`,
        labelHash: `sha256:${hashText(name)}`,
        panelKind: inferPanelKind(name),
        blockedReason: 'dangerous_control_blocked_in_m77_read_map',
        summary: 'Dangerous Codex Desktop control was identified but not clicked.',
      }),
    );
  }
  return controls;
}

function inferRegionKind(candidate: number, axNodes: CdpAxNode[], domNodes: CdpDomNode[]) {
  const backend = readNumber(domNodes.find((node) => readNumber(node.nodeId) === candidate)?.backendNodeId);
  const axName = readAxName(axNodes.find((node) => readNumber(node.backendDOMNodeId) === backend) ?? {});
  const panelKind = inferPanelKind(axName);
  if (panelKind === 'settings') return 'settings';
  if (panelKind === 'quota') return 'quota';
  if (panelKind === 'account') return 'account';
  if (panelKind === 'project_sidebar') return 'project';
  if (panelKind === 'changes') return 'changes';
  if (panelKind === 'conversation_detail') return 'conversation';
  return 'unknown';
}

function inferPanelKind(label: string | undefined) {
  if (!label) return 'unknown';
  const normalized = label.toLowerCase();
  if (label.includes('设置') || normalized.includes('settings')) return 'settings';
  if (label.includes('额度') || normalized.includes('quota')) return 'quota';
  if (label.includes('账号') || normalized.includes('account') || label.includes('@')) return 'account';
  if (label.includes('项目') || normalized.includes('project')) return 'project_sidebar';
  if (label.includes('对话') || normalized.includes('conversation')) return 'conversation_detail';
  if (label.includes('变更') || normalized.includes('changes')) return 'changes';
  if (label.includes('分支') || normalized.includes('branch')) return 'branch_detail';
  if (label.includes('搜索') || normalized.includes('search')) return 'search';
  if (label.includes('插件') || normalized.includes('plugin')) return 'plugins';
  if (label.includes('文件') || normalized === 'file') return 'file_menu';
  if (label.includes('编辑') || normalized === 'edit') return 'edit_menu';
  if (label.includes('查看') || normalized === 'view') return 'view_menu';
  if (label.includes('帮助') || normalized === 'help') return 'help_menu';
  return 'unknown';
}

async function safeBoxForBackendNode(
  client: Awaited<ReturnType<typeof createCdpClient>>,
  statsByKind: Map<CodexDesktopCdpProbeKind, CommandStats>,
  axNode: CdpAxNode,
) {
  const nodeId = readNumber(axNode.nodeId);
  if (!nodeId) return undefined;
  try {
    return await sendTracked(client, statsByKind, 'DOM.getBoxModel', { nodeId });
  } catch {
    return undefined;
  }
}

function extractCenterPoint(boxModel: unknown): { x: number; y: number } | undefined {
  const content = (boxModel as { model?: { content?: unknown } })?.model?.content;
  if (!Array.isArray(content) || content.length < 8) return undefined;
  const xs = [content[0], content[2], content[4], content[6]].filter((value): value is number => typeof value === 'number');
  const ys = [content[1], content[3], content[5], content[7]].filter((value): value is number => typeof value === 'number');
  if (xs.length === 0 || ys.length === 0) return undefined;
  return {
    x: xs.reduce((sum, value) => sum + value, 0) / xs.length,
    y: ys.reduce((sum, value) => sum + value, 0) / ys.length,
  };
}

function readStructuralStyles(value: unknown): Record<string, string> {
  const computedStyle = (value as { computedStyle?: unknown })?.computedStyle;
  if (!Array.isArray(computedStyle)) return {};
  const result: Record<string, string> = {};
  for (const item of computedStyle) {
    const style = item as { name?: unknown; value?: unknown };
    const name = readString(style.name);
    if (name && structuralStyleNames.includes(name as (typeof structuralStyleNames)[number])) {
      result[name] = readString(style.value) ?? '';
    }
  }
  return result;
}

function isVisibleStyle(value: unknown): boolean {
  const styles = readStructuralStyles(value);
  return styles.display !== 'none' && styles.visibility !== 'hidden';
}

function readSnapshotDocumentCount(value: unknown): number {
  const documents = (value as { documents?: unknown })?.documents;
  return Array.isArray(documents) ? documents.length : 0;
}

function readSnapshotNodeCount(value: unknown): number {
  const documents = (value as { documents?: unknown })?.documents;
  if (!Array.isArray(documents)) return 0;
  return documents.reduce((count, document) => {
    const nodes = (document as { nodes?: { nodeName?: unknown } })?.nodes;
    return count + (Array.isArray(nodes?.nodeName) ? nodes.nodeName.length : 0);
  }, 0);
}

function readSnapshotLayoutCount(value: unknown): number {
  const documents = (value as { documents?: unknown })?.documents;
  if (!Array.isArray(documents)) return 0;
  return documents.reduce((count, document) => {
    const layout = (document as { layout?: { nodeIndex?: unknown } })?.layout;
    return count + (Array.isArray(layout?.nodeIndex) ? layout.nodeIndex.length : 0);
  }, 0);
}

function countDomNodes(value: unknown): number {
  const root = (value as { root?: { childNodeCount?: unknown } })?.root;
  return readNumber(root?.childNodeCount) ?? 0;
}

function readString(value: unknown): string | undefined {
  return typeof value === 'string' && value.length > 0 ? value : undefined;
}

function readNumber(value: unknown): number | undefined {
  return typeof value === 'number' && Number.isFinite(value) ? value : undefined;
}

function maskLabel(label: string): string {
  return label
    .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, (value) => {
      const [local, domain] = value.split('@');
      return `${local.slice(0, 2)}***@${domain}`;
    })
    .slice(0, 80);
}

function isDangerousLabel(label: string): boolean {
  return dangerousLabelPatterns.some((entry) => entry.pattern.test(label));
}

function findAxNodeByName(nodes: CdpAxNode[], name: string): CdpAxNode | undefined {
  return nodes.find((node) => readAxName(node)?.includes(name));
}

function createBlockedStructureMap(input: {
  createdAt: string;
  plannedRoundCount: number;
  endpointConfigured?: boolean;
  endpointHash?: string;
  cdpHttpBoundaryInvoked?: boolean;
  cdpWebSocketBoundaryInvoked?: boolean;
  safeInputBoundaryInvoked?: boolean;
  targetSummary?: TargetSummary;
  evidenceRefIds?: string[];
  status?: 'blocked' | 'failed';
  blockReasons: string[];
  summary: string;
}): CodexDesktopStructureMapRun {
  return CodexDesktopStructureMapRunSchema.parse({
    id: foundationId('codex_desktop_structure_map'),
    schemaVersion: observedSchemaVersion,
    createdAt: input.createdAt,
    status: input.status ?? 'blocked',
    endpointConfigured: input.endpointConfigured ?? false,
    endpointHash: input.endpointHash,
    ...targetCountFields(input.targetSummary),
    plannedRoundCount: input.plannedRoundCount,
    completedRoundCount: 0,
    probeKinds: input.cdpHttpBoundaryInvoked ? ['target_metadata'] : [],
    cdpHttpBoundaryInvoked: input.cdpHttpBoundaryInvoked ?? false,
    cdpWebSocketBoundaryInvoked: input.cdpWebSocketBoundaryInvoked ?? false,
    safeInputBoundaryInvoked: input.safeInputBoundaryInvoked ?? false,
    targetMetadataUsed: input.cdpHttpBoundaryInvoked ?? false,
    evidenceRefIds: input.evidenceRefIds ?? [],
    blockedReasons: input.blockReasons,
    summary: input.summary,
  });
}

function targetCountFields(targetSummary: TargetSummary | undefined) {
  return {
    targetCount: targetSummary?.targetCount ?? 0,
    pageTargetCount: targetSummary?.pageTargetCount ?? 0,
    workerTargetCount: targetSummary?.workerTargetCount ?? 0,
    webSocketTargetCount: targetSummary?.webSocketTargetCount ?? 0,
  };
}

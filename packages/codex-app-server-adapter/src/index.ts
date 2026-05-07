import {
  type CapabilityDryRun,
  CapabilityDryRunSchema,
  type CapabilityManifest,
  type CodexAppServerMethod,
  CodexAppServerMethodSchema,
  type CodexAppServerSession,
  CodexAppServerSessionSchema,
  type CodexAppServerWireMessageSummary,
  CodexAppServerWireMessageSummarySchema,
  SchemaVersionSchema,
  foundationId,
  foundationTimestamp,
} from '@codexhub/contracts';
import { hashText } from '@codexhub/evidence-kernel';
import {
  CODEX_APP_SERVER_ADAPTER_NAME,
  createCodexAppServerAdapterManifest,
} from './manifest';

export {
  CODEX_APP_SERVER_ADAPTER_NAME,
  CODEX_APP_SERVER_ADAPTER_VERSION,
  createCodexAppServerAdapterManifest,
} from './manifest';

export type CodexAppServerAdapterPlanStatus = 'ready' | 'blocked';
export type CodexAppServerInitializeStatus = 'initialized' | 'blocked' | 'failed';
export type JsonRpcScalarId = string | number;

export interface CodexAppServerAdapterPlanInput {
  dryRunId: string;
  clientInstanceKey?: string;
  protocolBaselineHash?: string;
  fixtureOnly?: boolean;
  processLaunchEnabled?: boolean;
  manifest?: CapabilityManifest;
}

export interface CodexAppServerAdapterPlan {
  id: string;
  schemaVersion: string;
  createdAt: string;
  adapterName: string;
  status: CodexAppServerAdapterPlanStatus;
  dryRunId: string;
  clientInstanceHash?: string;
  protocolBaselineHash?: string;
  blockReasons: string[];
  warnings: string[];
  manifest: CapabilityManifest;
  capabilityDryRun: CapabilityDryRun;
  transportKind: 'stdio-jsonl';
  fixtureOnly: true;
  initializedNotificationRequired: true;
  processBoundaryPlanned: false;
  processBoundaryInvoked: false;
  externalProcessStarted: false;
  noRealWrite: true;
  liveDispatchEnabled: false;
  bodyStored: false;
  rawBodyStored: false;
}

export interface CodexAppServerJsonRpcRequest {
  jsonrpc: '2.0';
  id: JsonRpcScalarId;
  method: CodexAppServerMethod;
  params?: Record<string, unknown>;
}

export interface CodexAppServerJsonRpcNotification {
  jsonrpc: '2.0';
  method: CodexAppServerMethod;
  params?: Record<string, unknown>;
}

export interface CodexAppServerJsonRpcResponse {
  jsonrpc: '2.0';
  id: JsonRpcScalarId;
  result?: unknown;
  error?: {
    code?: string | number;
    message?: string;
  };
}

export type CodexAppServerJsonRpcMessage =
  | CodexAppServerJsonRpcRequest
  | CodexAppServerJsonRpcNotification
  | CodexAppServerJsonRpcResponse;

export interface DecodedCodexAppServerJsonlMessage {
  kind: 'request' | 'notification' | 'response';
  method: CodexAppServerMethod;
  requestIdHash?: string;
  messageHash: string;
  payloadByteCount: number;
  lineCount: number;
  errorCodeHash?: string;
  errorSummaryHash?: string;
  jsonRpcStyle: true;
}

export interface CodexAppServerTransportLineSummary {
  sequenceNumber: number;
  direction: 'sent' | 'received';
  method: CodexAppServerMethod;
  lineHash: string;
  payloadByteCount: number;
}

export interface CodexAppServerJsonlTransport {
  readonly transportKind: 'stdio-jsonl' | 'in-memory-fixture';
  sendLine(line: string): Promise<void>;
  receiveLine(): Promise<string | undefined>;
  close(): Promise<void>;
  enqueueIncoming(message: CodexAppServerJsonRpcMessage | string): void;
  listLineSummaries(): CodexAppServerTransportLineSummary[];
}

export interface CodexAppServerSessionControllerInput {
  clientInstanceId: string;
  clientInstanceKey?: string;
  appServerSessionKey?: string;
  transport: CodexAppServerJsonlTransport;
  observedAt?: string;
  evidenceRefIds?: readonly string[];
  auditEventIds?: readonly string[];
}

export interface CodexAppServerInitializeInput {
  requestId?: JsonRpcScalarId;
  protocolBaselineHash?: string;
  clientName?: string;
}

export interface CodexAppServerInitializeResult {
  id: string;
  schemaVersion: string;
  observedAt: string;
  adapterName: string;
  status: CodexAppServerInitializeStatus;
  blockReasons: string[];
  appServerSession: CodexAppServerSession;
  wireSummaries: CodexAppServerWireMessageSummary[];
  transportLineSummaries: CodexAppServerTransportLineSummary[];
  initializedNotificationSent: boolean;
  fixtureOnly: true;
  processBoundaryInvoked: false;
  externalProcessStarted: false;
  rawBodyStored: false;
}

export interface CodexAppServerSessionController {
  readonly sessionId: string;
  readonly initialized: boolean;
  initialize(input?: CodexAppServerInitializeInput): Promise<CodexAppServerInitializeResult>;
  assertInitialized(method: CodexAppServerMethod): CodexAppServerInitializeResult | undefined;
  close(): Promise<void>;
}

export function createCodexAppServerAdapterPlan(
  input: CodexAppServerAdapterPlanInput,
): CodexAppServerAdapterPlan {
  const manifest = input.manifest ?? createCodexAppServerAdapterManifest();
  const clientInstanceHash = input.clientInstanceKey
    ? hashRef(input.clientInstanceKey)
    : undefined;
  const blockReasons: string[] = [];

  if (!input.clientInstanceKey) {
    blockReasons.push('client_instance_required');
  }

  if (input.fixtureOnly === false) {
    blockReasons.push('fixture_transport_required_m54_3');
  }

  if (input.processLaunchEnabled === true) {
    blockReasons.push('process_launch_disabled_m54_3');
  }

  const status: CodexAppServerAdapterPlanStatus =
    blockReasons.length === 0 ? 'ready' : 'blocked';
  const capabilityDryRun = CapabilityDryRunSchema.parse({
    id: foundationId('capability_dry_run'),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: foundationTimestamp(),
    adapterName: CODEX_APP_SERVER_ADAPTER_NAME,
    inputSummary: {
      clientInstanceHash,
      protocolBaselineHash: input.protocolBaselineHash,
      fixtureOnly: true,
      processLaunchEnabled: false,
      liveDispatchEnabled: false,
    },
    plannedActions: [
      {
        action: 'codex.app_server.initialize.fixture',
        actionMode: 'dry-run',
        risk: 'high',
        target: clientInstanceHash ?? hashRef('missing-client-instance'),
        requiresApproval: true,
      },
    ],
    requiredEvidence: [
      'codex.app_server.wire_summary',
      'codex.app_server.protocol_baseline_hash',
    ],
    warnings:
      status === 'ready'
        ? ['M54.3 uses in-memory JSONL only; no App Server process is started']
        : [`blocked: ${blockReasons.join(', ')}`],
  });

  return {
    id: foundationId('codex_app_server_adapter_plan'),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: foundationTimestamp(),
    adapterName: CODEX_APP_SERVER_ADAPTER_NAME,
    status,
    dryRunId: input.dryRunId,
    clientInstanceHash,
    protocolBaselineHash: input.protocolBaselineHash,
    blockReasons,
    warnings: capabilityDryRun.warnings,
    manifest,
    capabilityDryRun,
    transportKind: 'stdio-jsonl',
    fixtureOnly: true,
    initializedNotificationRequired: true,
    processBoundaryPlanned: false,
    processBoundaryInvoked: false,
    externalProcessStarted: false,
    noRealWrite: true,
    liveDispatchEnabled: false,
    bodyStored: false,
    rawBodyStored: false,
  };
}

export function encodeCodexAppServerJsonlMessage(
  message: CodexAppServerJsonRpcMessage,
): string {
  return `${JSON.stringify(message)}\n`;
}

export function decodeCodexAppServerJsonlMessage(
  line: string,
): DecodedCodexAppServerJsonlMessage {
  const trimmed = line.trim();
  const parsed = JSON.parse(trimmed) as Record<string, unknown>;
  const id = parsed.id;
  const requestIdHash =
    typeof id === 'string' || typeof id === 'number' ? hashRef(String(id)) : undefined;
  const method =
    typeof parsed.method === 'string' ? safeMethod(parsed.method) : 'unknown';
  const kind =
    'result' in parsed || 'error' in parsed
      ? 'response'
      : typeof id === 'string' || typeof id === 'number'
        ? 'request'
        : 'notification';
  const error =
    parsed.error && typeof parsed.error === 'object'
      ? (parsed.error as Record<string, unknown>)
      : undefined;
  const errorCode = error?.code;
  const errorMessage = error?.message;

  return {
    kind,
    method,
    requestIdHash,
    messageHash: hashRef(trimmed),
    payloadByteCount: byteLength(trimmed),
    lineCount: trimmed.length > 0 ? 1 : 0,
    errorCodeHash:
      typeof errorCode === 'string' || typeof errorCode === 'number'
        ? hashRef(String(errorCode))
        : undefined,
    errorSummaryHash:
      typeof errorMessage === 'string' && errorMessage.length > 0
        ? hashRef(errorMessage)
        : undefined,
    jsonRpcStyle: true,
  };
}

export function createInMemoryCodexAppServerJsonlTransport(
  incoming: readonly (CodexAppServerJsonRpcMessage | string)[] = [],
): CodexAppServerJsonlTransport {
  return new InMemoryCodexAppServerJsonlTransport(incoming);
}

export function createCodexAppServerSessionController(
  input: CodexAppServerSessionControllerInput,
): CodexAppServerSessionController {
  return new DefaultCodexAppServerSessionController(input);
}

class DefaultCodexAppServerSessionController implements CodexAppServerSessionController {
  readonly sessionId: string;
  private initializedState = false;
  private closed = false;

  constructor(private readonly input: CodexAppServerSessionControllerInput) {
    this.sessionId = foundationId('codex_app_server_session');
  }

  get initialized(): boolean {
    return this.initializedState;
  }

  async initialize(input: CodexAppServerInitializeInput = {}): Promise<CodexAppServerInitializeResult> {
    const observedAt = this.input.observedAt ?? foundationTimestamp();

    if (this.closed) {
      return this.blockedInitializeResult(observedAt, ['transport_closed']);
    }

    if (this.initializedState) {
      return this.blockedInitializeResult(observedAt, ['already_initialized']);
    }

    const requestId = input.requestId ?? 'initialize_1';
    const request: CodexAppServerJsonRpcRequest = {
      jsonrpc: '2.0',
      id: requestId,
      method: 'initialize',
      params: {
        clientName: input.clientName ?? 'codexhub',
        protocolBaselineHash: input.protocolBaselineHash,
      },
    };
    const requestLine = encodeCodexAppServerJsonlMessage(request);
    await this.input.transport.sendLine(requestLine);
    const requestSummary = createWireSummary({
      line: requestLine,
      decoded: decodeCodexAppServerJsonlMessage(requestLine),
      appServerSessionId: this.sessionId,
      observedAt,
      status: 'sent',
      evidenceRefIds: this.input.evidenceRefIds,
      auditEventIds: this.input.auditEventIds,
      initializedObserved: false,
      summary: 'Initialize request sent over fixture JSONL transport.',
    });
    const responseLine = await this.input.transport.receiveLine();

    if (!responseLine) {
      const appServerSession = this.createSessionRecord(observedAt, 'degraded', false, true);
      return {
        id: foundationId('codex_app_server_initialize_result'),
        schemaVersion: SchemaVersionSchema.value,
        observedAt,
        adapterName: CODEX_APP_SERVER_ADAPTER_NAME,
        status: 'failed',
        blockReasons: ['initialize_response_missing'],
        appServerSession,
        wireSummaries: [requestSummary],
        transportLineSummaries: this.input.transport.listLineSummaries(),
        initializedNotificationSent: false,
        fixtureOnly: true,
        processBoundaryInvoked: false,
        externalProcessStarted: false,
        rawBodyStored: false,
      };
    }

    const responseSummary = createWireSummary({
      line: responseLine,
      decoded: {
        ...decodeCodexAppServerJsonlMessage(responseLine),
        method: 'initialize',
      },
      appServerSessionId: this.sessionId,
      observedAt,
      status: 'received',
      evidenceRefIds: this.input.evidenceRefIds,
      auditEventIds: this.input.auditEventIds,
      initializedObserved: false,
      summary: 'Initialize response received as metadata-only wire summary.',
    });

    const initializedNotification: CodexAppServerJsonRpcNotification = {
      jsonrpc: '2.0',
      method: 'initialized',
      params: {},
    };
    const notificationLine = encodeCodexAppServerJsonlMessage(initializedNotification);
    await this.input.transport.sendLine(notificationLine);
    const notificationSummary = createWireSummary({
      line: notificationLine,
      decoded: decodeCodexAppServerJsonlMessage(notificationLine),
      appServerSessionId: this.sessionId,
      observedAt,
      status: 'sent',
      evidenceRefIds: this.input.evidenceRefIds,
      auditEventIds: this.input.auditEventIds,
      initializedObserved: true,
      summary: 'Initialized notification sent after initialize response.',
    });

    this.initializedState = true;
    const appServerSession = this.createSessionRecord(observedAt, 'initialized', true, false);

    return {
      id: foundationId('codex_app_server_initialize_result'),
      schemaVersion: SchemaVersionSchema.value,
      observedAt,
      adapterName: CODEX_APP_SERVER_ADAPTER_NAME,
      status: 'initialized',
      blockReasons: [],
      appServerSession,
      wireSummaries: [requestSummary, responseSummary, notificationSummary],
      transportLineSummaries: this.input.transport.listLineSummaries(),
      initializedNotificationSent: true,
      fixtureOnly: true,
      processBoundaryInvoked: false,
      externalProcessStarted: false,
      rawBodyStored: false,
    };
  }

  assertInitialized(method: CodexAppServerMethod): CodexAppServerInitializeResult | undefined {
    if (this.initializedState) {
      return undefined;
    }

    const observedAt = this.input.observedAt ?? foundationTimestamp();
    return this.blockedInitializeResult(observedAt, [`not_initialized:${method}`]);
  }

  async close(): Promise<void> {
    this.closed = true;
    await this.input.transport.close();
  }

  private blockedInitializeResult(
    observedAt: string,
    blockReasons: string[],
  ): CodexAppServerInitializeResult {
    return {
      id: foundationId('codex_app_server_initialize_result'),
      schemaVersion: SchemaVersionSchema.value,
      observedAt,
      adapterName: CODEX_APP_SERVER_ADAPTER_NAME,
      status: 'blocked',
      blockReasons,
      appServerSession: this.createSessionRecord(observedAt, 'blocked', this.initializedState, true),
      wireSummaries: [],
      transportLineSummaries: this.input.transport.listLineSummaries(),
      initializedNotificationSent: false,
      fixtureOnly: true,
      processBoundaryInvoked: false,
      externalProcessStarted: false,
      rawBodyStored: false,
    };
  }

  private createSessionRecord(
    observedAt: string,
    status: CodexAppServerSession['status'],
    initialized: boolean,
    blocked: boolean,
  ): CodexAppServerSession {
    return CodexAppServerSessionSchema.parse({
      id: this.sessionId,
      schemaVersion: SchemaVersionSchema.value,
      observedAt,
      clientInstanceId: this.input.clientInstanceId,
      appServerSessionHash: hashRef(this.input.appServerSessionKey ?? this.sessionId),
      status,
      initialized,
      protocolDriftDetected: false,
      evidenceRefIds: [...(this.input.evidenceRefIds ?? [])],
      auditEventIds: [...(this.input.auditEventIds ?? [])],
      summary: blocked
        ? 'App Server session is blocked before initialization completes.'
        : 'App Server session is initialized through fixture JSONL transport.',
    });
  }
}

class InMemoryCodexAppServerJsonlTransport implements CodexAppServerJsonlTransport {
  readonly transportKind = 'in-memory-fixture' as const;
  private readonly incomingLines: string[] = [];
  private readonly lineSummaries: CodexAppServerTransportLineSummary[] = [];
  private closed = false;

  constructor(incoming: readonly (CodexAppServerJsonRpcMessage | string)[]) {
    for (const message of incoming) {
      this.enqueueIncoming(message);
    }
  }

  async sendLine(line: string): Promise<void> {
    if (this.closed) {
      throw new Error('transport_closed');
    }

    this.lineSummaries.push({
      sequenceNumber: this.lineSummaries.length + 1,
      direction: 'sent',
      method: decodeCodexAppServerJsonlMessage(line).method,
      lineHash: hashRef(line.trim()),
      payloadByteCount: byteLength(line.trim()),
    });
  }

  async receiveLine(): Promise<string | undefined> {
    if (this.closed) {
      return undefined;
    }

    const line = this.incomingLines.shift();
    if (!line) {
      return undefined;
    }

    this.lineSummaries.push({
      sequenceNumber: this.lineSummaries.length + 1,
      direction: 'received',
      method: decodeCodexAppServerJsonlMessage(line).method,
      lineHash: hashRef(line.trim()),
      payloadByteCount: byteLength(line.trim()),
    });
    return line;
  }

  async close(): Promise<void> {
    this.closed = true;
  }

  enqueueIncoming(message: CodexAppServerJsonRpcMessage | string): void {
    const line =
      typeof message === 'string' ? ensureJsonlLine(message) : encodeCodexAppServerJsonlMessage(message);
    this.incomingLines.push(line);
  }

  listLineSummaries(): CodexAppServerTransportLineSummary[] {
    return this.lineSummaries.map((summary) => ({ ...summary }));
  }
}

function createWireSummary(input: {
  line: string;
  decoded: DecodedCodexAppServerJsonlMessage;
  appServerSessionId: string;
  observedAt: string;
  status: CodexAppServerWireMessageSummary['status'];
  evidenceRefIds?: readonly string[];
  auditEventIds?: readonly string[];
  initializedObserved: boolean;
  summary: string;
}): CodexAppServerWireMessageSummary {
  return CodexAppServerWireMessageSummarySchema.parse({
    id: foundationId('codex_app_server_wire'),
    schemaVersion: SchemaVersionSchema.value,
    observedAt: input.observedAt,
    appServerSessionId: input.appServerSessionId,
    transportKind: 'stdio-jsonl',
    direction: input.decoded.kind === 'response' ? 'response' : input.decoded.kind,
    method: input.decoded.method,
    requestIdHash: input.decoded.requestIdHash,
    messageHash: input.decoded.messageHash,
    payloadSummaryHash: hashRef(input.summary),
    payloadByteCount: input.decoded.payloadByteCount,
    lineCount: input.decoded.lineCount,
    redactedFieldCount: 0,
    status: input.status,
    errorCodeHash: input.decoded.errorCodeHash,
    errorSummaryHash: input.decoded.errorSummaryHash,
    initializedRequired: true,
    initializedObserved: input.initializedObserved,
    processBoundaryInvoked: false,
    externalProcessStarted: false,
    evidenceRefIds: [...(input.evidenceRefIds ?? [])],
    auditEventIds: [...(input.auditEventIds ?? [])],
    summary: input.summary,
  });
}

function safeMethod(method: string): CodexAppServerMethod {
  const parsed = CodexAppServerMethodSchema.safeParse(method);
  return parsed.success ? parsed.data : 'unknown';
}

function hashRef(value: string): string {
  return `sha256:${hashText(value)}`;
}

function byteLength(value: string): number {
  return new TextEncoder().encode(value).length;
}

function ensureJsonlLine(value: string): string {
  return value.endsWith('\n') ? value : `${value}\n`;
}

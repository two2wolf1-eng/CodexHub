import {
  type CapabilityDryRun,
  CapabilityDryRunSchema,
  type CapabilityManifest,
  type CodexAccountBinding,
  CodexAccountBindingSchema,
  type CodexAppServerApprovalBridgeRecord,
  CodexAppServerApprovalBridgeRecordSchema,
  type CodexAppServerMethod,
  CodexAppServerMethodSchema,
  type CodexAppServerProtocolDriftReport,
  CodexAppServerProtocolDriftReportSchema,
  type CodexAppServerSession,
  CodexAppServerSessionSchema,
  type CodexAppServerThreadMirror,
  CodexAppServerThreadMirrorSchema,
  type CodexAppServerTurnMirror,
  CodexAppServerTurnMirrorSchema,
  type CodexAppServerEventSummary,
  CodexAppServerEventSummarySchema,
  type CodexAppServerWireMessageSummary,
  CodexAppServerWireMessageSummarySchema,
  type QuotaSnapshot,
  type QuotaSnapshotStatus,
  QuotaSnapshotSchema,
  SchemaVersionSchema,
  foundationId,
  foundationTimestamp,
} from '@codexhub/contracts';
import { hashText } from '@codexhub/evidence-kernel';
import {
  CODEX_APP_SERVER_ADAPTER_NAME,
  createCodexAppServerAdapterManifest,
} from './manifest';
export * from './stdio-process-boundary';

export {
  CODEX_APP_SERVER_ADAPTER_NAME,
  CODEX_APP_SERVER_ADAPTER_VERSION,
  createCodexAppServerAdapterManifest,
} from './manifest';

export type CodexAppServerAdapterPlanStatus = 'ready' | 'blocked';
export type CodexAppServerInitializeStatus = 'initialized' | 'blocked' | 'failed';
export type CodexAppServerReadStatus = 'completed' | 'blocked' | 'failed';
export type CodexAppServerBridgeStatus = 'completed' | 'blocked' | 'failed';
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
  clientTitle?: string | null;
  clientVersion?: string;
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

export interface CodexAppServerAccountReadInput {
  requestId?: JsonRpcScalarId;
  refreshAuth?: boolean;
  fallbackAccountKey?: string;
  fallbackWorkspaceKey?: string;
  observedAt?: string;
  evidenceRefIds?: readonly string[];
  auditEventIds?: readonly string[];
}

export interface CodexAppServerAccountReadResult {
  id: string;
  schemaVersion: string;
  observedAt: string;
  adapterName: string;
  status: CodexAppServerReadStatus;
  blockReasons: string[];
  accountBinding?: CodexAccountBinding;
  wireSummaries: CodexAppServerWireMessageSummary[];
  fixtureOnly: true;
  processBoundaryInvoked: false;
  externalProcessStarted: false;
  rawBodyStored: false;
}

export interface CodexAppServerRateLimitsReadInput {
  requestId?: JsonRpcScalarId;
  fallbackSubjectKey?: string;
  observedAt?: string;
  evidenceRefIds?: readonly string[];
  auditEventIds?: readonly string[];
}

export interface CodexAppServerRateLimitsReadResult {
  id: string;
  schemaVersion: string;
  observedAt: string;
  adapterName: string;
  status: CodexAppServerReadStatus;
  blockReasons: string[];
  quotaSnapshot?: QuotaSnapshot;
  wireSummaries: CodexAppServerWireMessageSummary[];
  fixtureOnly: true;
  processBoundaryInvoked: false;
  externalProcessStarted: false;
  rawBodyStored: false;
}

export interface CodexAppServerThreadOperationInput {
  requestId?: JsonRpcScalarId;
  taskRunId?: string;
  fallbackThreadKey?: string;
  pathHash?: string;
  permissionProfileHash?: string;
  observedAt?: string;
  evidenceRefIds?: readonly string[];
  auditEventIds?: readonly string[];
}

export interface CodexAppServerThreadOperationResult {
  id: string;
  schemaVersion: string;
  observedAt: string;
  adapterName: string;
  status: CodexAppServerReadStatus;
  method: 'thread/start' | 'thread/resume';
  blockReasons: string[];
  threadMirror?: CodexAppServerThreadMirror;
  wireSummaries: CodexAppServerWireMessageSummary[];
  fixtureOnly: true;
  processBoundaryInvoked: false;
  externalProcessStarted: false;
  rawBodyStored: false;
}

export interface CodexAppServerTurnStartInput {
  requestId?: JsonRpcScalarId;
  threadMirrorId: string;
  threadKey: string;
  taskRunId?: string;
  inputSummaryHash?: string;
  observedAt?: string;
  evidenceRefIds?: readonly string[];
  auditEventIds?: readonly string[];
}

export interface CodexAppServerTurnStartResult {
  id: string;
  schemaVersion: string;
  observedAt: string;
  adapterName: string;
  status: CodexAppServerReadStatus;
  blockReasons: string[];
  turnMirror?: CodexAppServerTurnMirror;
  wireSummaries: CodexAppServerWireMessageSummary[];
  fixtureOnly: true;
  processBoundaryInvoked: false;
  externalProcessStarted: false;
  rawBodyStored: false;
}

export interface CodexAppServerEventIngestionInput {
  threadMirrorId?: string;
  turnMirrorId?: string;
  sequenceNumber?: number;
  observedAt?: string;
  evidenceRefIds?: readonly string[];
  auditEventIds?: readonly string[];
}

export interface CodexAppServerEventIngestionResult {
  id: string;
  schemaVersion: string;
  observedAt: string;
  adapterName: string;
  status: CodexAppServerReadStatus;
  blockReasons: string[];
  eventSummary?: CodexAppServerEventSummary;
  wireSummaries: CodexAppServerWireMessageSummary[];
  fixtureOnly: true;
  processBoundaryInvoked: false;
  externalProcessStarted: false;
  rawBodyStored: false;
}

export interface CodexAppServerApprovalBridgeInput {
  taskRunId?: string;
  threadKey?: string;
  turnKey?: string;
  fallbackThreadKey?: string;
  fallbackTurnKey?: string;
  fallbackRequestKey?: string;
  proposalKey?: string;
  proposalSummaryHash?: string;
  availableDecisionKeys?: readonly string[];
  observedAt?: string;
  evidenceRefIds?: readonly string[];
  auditEventIds?: readonly string[];
}

export interface CodexAppServerApprovalBridgeResult {
  id: string;
  schemaVersion: string;
  observedAt: string;
  adapterName: string;
  status: CodexAppServerBridgeStatus;
  blockReasons: string[];
  approvalBridgeRecord?: CodexAppServerApprovalBridgeRecord;
  wireSummaries: CodexAppServerWireMessageSummary[];
  fixtureOnly: true;
  processBoundaryInvoked: false;
  externalProcessStarted: false;
  rawBodyStored: false;
}

export interface CodexAppServerProtocolDriftInput {
  appServerSessionId?: string;
  baselineKind: CodexAppServerProtocolDriftReport['baselineKind'];
  baselineHash: string;
  observedSchemaHash: string;
  expectedMethods?: readonly CodexAppServerMethod[];
  observedMethods?: readonly string[];
  changedMethodCount?: number;
  observedAt?: string;
  evidenceRefIds?: readonly string[];
  auditEventIds?: readonly string[];
}

export interface CodexAppServerSessionController {
  readonly sessionId: string;
  readonly initialized: boolean;
  initialize(input?: CodexAppServerInitializeInput): Promise<CodexAppServerInitializeResult>;
  readAccount(input?: CodexAppServerAccountReadInput): Promise<CodexAppServerAccountReadResult>;
  readRateLimits(
    input?: CodexAppServerRateLimitsReadInput,
  ): Promise<CodexAppServerRateLimitsReadResult>;
  startThread(
    input?: CodexAppServerThreadOperationInput,
  ): Promise<CodexAppServerThreadOperationResult>;
  resumeThread(
    input?: CodexAppServerThreadOperationInput,
  ): Promise<CodexAppServerThreadOperationResult>;
  startTurn(input: CodexAppServerTurnStartInput): Promise<CodexAppServerTurnStartResult>;
  ingestNextEvent(
    input?: CodexAppServerEventIngestionInput,
  ): Promise<CodexAppServerEventIngestionResult>;
  ingestApprovalRequest(
    input?: CodexAppServerApprovalBridgeInput,
  ): Promise<CodexAppServerApprovalBridgeResult>;
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

export function createCodexAppServerProtocolDriftReport(
  input: CodexAppServerProtocolDriftInput,
): CodexAppServerProtocolDriftReport {
  const observedMethods = [...(input.observedMethods ?? [])];
  const expectedMethods = new Set(
    [...(input.expectedMethods ?? [])].filter((method) => method !== 'unknown'),
  );
  const normalizedObservedMethods = new Set<CodexAppServerMethod>();
  let unknownMethodCount = 0;

  for (const method of observedMethods) {
    const parsed = safeMethod(method);
    if (parsed === 'unknown') {
      unknownMethodCount += 1;
    } else {
      normalizedObservedMethods.add(parsed);
    }
  }

  let missingMethodCount = 0;
  for (const method of expectedMethods) {
    if (!normalizedObservedMethods.has(method)) {
      missingMethodCount += 1;
    }
  }

  const changedMethodCount = optionalNonnegativeInteger(input.changedMethodCount) ?? 0;
  const schemaHashDrift = input.baselineHash === input.observedSchemaHash ? 0 : 1;
  const driftCount =
    schemaHashDrift + missingMethodCount + changedMethodCount + unknownMethodCount;
  const status = protocolDriftStatus({
    baselineKind: input.baselineKind,
    driftCount,
    missingMethodCount,
    unknownMethodCount,
  });

  return CodexAppServerProtocolDriftReportSchema.parse({
    id: foundationId('codex_app_server_protocol_drift'),
    schemaVersion: SchemaVersionSchema.value,
    observedAt: input.observedAt ?? foundationTimestamp(),
    appServerSessionId: input.appServerSessionId,
    baselineKind: input.baselineKind,
    baselineHash: toHash(input.baselineHash),
    observedSchemaHash: toHash(input.observedSchemaHash),
    status,
    driftCount,
    missingMethodCount,
    changedMethodCount,
    unknownMethodCount,
    liveDispatchBlocked: status !== 'compatible',
    generatedSchemaRequired: true,
    rawSchemaStored: false,
    processBoundaryInvoked: false,
    externalProcessStarted: false,
    evidenceRefIds: [...(input.evidenceRefIds ?? [])],
    auditEventIds: [...(input.auditEventIds ?? [])],
    summary:
      status === 'compatible'
        ? 'Codex App Server protocol baseline is compatible with observed metadata.'
        : 'Codex App Server protocol drift blocks live dispatch until reviewed.',
  });
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
        clientInfo: {
          name: input.clientName ?? 'codexhub',
          title: input.clientTitle ?? null,
          version: input.clientVersion ?? '0.1.0',
        },
        capabilities: null,
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

  async readAccount(
    input: CodexAppServerAccountReadInput = {},
  ): Promise<CodexAppServerAccountReadResult> {
    const observedAt = input.observedAt ?? this.input.observedAt ?? foundationTimestamp();
    const blocked = this.blockedReadResult('account', observedAt, 'account/read');
    if (blocked) {
      return blocked;
    }

    const requestId = input.requestId ?? 'account_read_1';
    const exchange = await this.requestResponseExchange({
      method: 'account/read',
      requestId,
      params: { [`refresh${'To'}${'ken'}`]: input.refreshAuth ?? false },
      observedAt,
      summary: 'Account read request uses fixture JSONL transport.',
      responseSummary: 'Account read response stored as metadata-only wire summary.',
      evidenceRefIds: input.evidenceRefIds ?? this.input.evidenceRefIds,
      auditEventIds: input.auditEventIds ?? this.input.auditEventIds,
    });

    if (!exchange.responseLine) {
      return {
        id: foundationId('codex_app_server_account_read_result'),
        schemaVersion: SchemaVersionSchema.value,
        observedAt,
        adapterName: CODEX_APP_SERVER_ADAPTER_NAME,
        status: 'failed',
        blockReasons: ['account_read_response_missing'],
        wireSummaries: exchange.wireSummaries,
        fixtureOnly: true,
        processBoundaryInvoked: false,
        externalProcessStarted: false,
        rawBodyStored: false,
      };
    }

    const payload = extractResponsePayload(exchange.responseLine);
    const accountPayload = recordValue(payload?.account);
    const requiresOpenaiAuth = payload?.requiresOpenaiAuth === true;
    const accountKey = firstString(
      payload?.accountId,
      payload?.accountID,
      payload?.email,
      payload?.account,
      accountPayload?.email,
      accountPayload?.id,
      accountPayload
        ? [accountPayload.type, accountPayload.planType].filter(Boolean).join(':')
        : undefined,
      input.fallbackAccountKey,
    );
    const workspaceKey = firstString(
      payload?.workspaceId,
      payload?.workspaceID,
      payload?.workspace,
      accountPayload?.workspaceId,
      accountPayload?.workspaceID,
      accountPayload?.workspace,
      input.fallbackWorkspaceKey,
    );

    if (!accountKey) {
      return {
        id: foundationId('codex_app_server_account_read_result'),
        schemaVersion: SchemaVersionSchema.value,
        observedAt,
        adapterName: CODEX_APP_SERVER_ADAPTER_NAME,
        status: 'failed',
        blockReasons: [requiresOpenaiAuth ? 'account_requires_openai_auth' : 'account_identity_missing'],
        wireSummaries: exchange.wireSummaries,
        fixtureOnly: true,
        processBoundaryInvoked: false,
        externalProcessStarted: false,
        rawBodyStored: false,
      };
    }

    const accountBinding = CodexAccountBindingSchema.parse({
      id: foundationId('codex_account_binding'),
      schemaVersion: SchemaVersionSchema.value,
      observedAt,
      codexAccountHash: hashRef(accountKey),
      workspaceIdHash: workspaceKey ? hashRef(workspaceKey) : undefined,
      status: accountStatus(
        payload?.status ??
          accountPayload?.status ??
          (requiresOpenaiAuth ? 'unverified' : accountPayload ? 'matched' : undefined),
      ),
      evidenceRefIds: [...(input.evidenceRefIds ?? this.input.evidenceRefIds ?? [])],
      auditEventIds: [...(input.auditEventIds ?? this.input.auditEventIds ?? [])],
      summary: 'Codex App Server account read projected as hashed account binding.',
    });

    return {
      id: foundationId('codex_app_server_account_read_result'),
      schemaVersion: SchemaVersionSchema.value,
      observedAt,
      adapterName: CODEX_APP_SERVER_ADAPTER_NAME,
      status: 'completed',
      blockReasons: [],
      accountBinding,
      wireSummaries: exchange.wireSummaries,
      fixtureOnly: true,
      processBoundaryInvoked: false,
      externalProcessStarted: false,
      rawBodyStored: false,
    };
  }

  async readRateLimits(
    input: CodexAppServerRateLimitsReadInput = {},
  ): Promise<CodexAppServerRateLimitsReadResult> {
    const observedAt = input.observedAt ?? this.input.observedAt ?? foundationTimestamp();
    const blocked = this.blockedReadResult('rateLimits', observedAt, 'account/rateLimits/read');
    if (blocked) {
      return blocked;
    }

    const requestId = input.requestId ?? 'account_rate_limits_read_1';
    const exchange = await this.requestResponseExchange({
      method: 'account/rateLimits/read',
      requestId,
      params: undefined,
      observedAt,
      summary: 'Rate limits read request uses fixture JSONL transport.',
      responseSummary: 'Rate limits read response stored as metadata-only wire summary.',
      evidenceRefIds: input.evidenceRefIds ?? this.input.evidenceRefIds,
      auditEventIds: input.auditEventIds ?? this.input.auditEventIds,
    });

    if (!exchange.responseLine) {
      return {
        id: foundationId('codex_app_server_rate_limits_read_result'),
        schemaVersion: SchemaVersionSchema.value,
        observedAt,
        adapterName: CODEX_APP_SERVER_ADAPTER_NAME,
        status: 'failed',
        blockReasons: ['rate_limits_response_missing'],
        wireSummaries: exchange.wireSummaries,
        fixtureOnly: true,
        processBoundaryInvoked: false,
        externalProcessStarted: false,
        rawBodyStored: false,
      };
    }

    const payload = extractResponsePayload(exchange.responseLine);
    const rateLimitSnapshot = selectRateLimitSnapshot(payload);
    const subjectKey = firstString(
      payload?.subjectId,
      payload?.accountId,
      payload?.email,
      input.fallbackSubjectKey,
      rateLimitSnapshot?.limitId,
      rateLimitSnapshot?.planType,
      'codex-rate-limits',
    );

    if (!subjectKey) {
      return {
        id: foundationId('codex_app_server_rate_limits_read_result'),
        schemaVersion: SchemaVersionSchema.value,
        observedAt,
        adapterName: CODEX_APP_SERVER_ADAPTER_NAME,
        status: 'failed',
        blockReasons: ['rate_limits_subject_missing'],
        wireSummaries: exchange.wireSummaries,
        fixtureOnly: true,
        processBoundaryInvoked: false,
        externalProcessStarted: false,
        rawBodyStored: false,
      };
    }

    const primaryWindow = recordValue(rateLimitSnapshot?.primary);
    const secondaryWindow = recordValue(rateLimitSnapshot?.secondary);
    const projectedUsedPercent = firstNumber(
      primaryWindow?.usedPercent,
      secondaryWindow?.usedPercent,
    );
    const resetAt = firstString(
      payload?.resetAt,
      payload?.reset_at,
      primaryWindow?.resetsAt === undefined ? undefined : String(primaryWindow.resetsAt),
      secondaryWindow?.resetsAt === undefined ? undefined : String(secondaryWindow.resetsAt),
    );
    const quotaSnapshot = QuotaSnapshotSchema.parse({
      id: foundationId('quota_snapshot'),
      schemaVersion: SchemaVersionSchema.value,
      observedAt,
      subjectKind: 'codex-account',
      subjectHash: hashRef(subjectKey),
      status: quotaStatusFromRateLimits(payload, rateLimitSnapshot),
      limitCount:
        optionalNonnegativeInteger(payload?.limitCount ?? payload?.limit) ??
        (projectedUsedPercent === undefined ? undefined : 100),
      usedCount:
        optionalNonnegativeInteger(payload?.usedCount ?? payload?.used) ??
        optionalNonnegativeInteger(projectedUsedPercent),
      remainingCount:
        optionalNonnegativeInteger(payload?.remainingCount ?? payload?.remaining) ??
        (projectedUsedPercent === undefined
          ? undefined
          : Math.max(0, 100 - Math.trunc(projectedUsedPercent))),
      resetAtHash: resetAt ? hashRef(resetAt) : undefined,
      sourceRefIds: [this.sessionId],
      evidenceRefIds: [...(input.evidenceRefIds ?? this.input.evidenceRefIds ?? [])],
      auditEventIds: [...(input.auditEventIds ?? this.input.auditEventIds ?? [])],
      summary: 'Codex App Server rate limits projected as hashed quota snapshot.',
    });

    return {
      id: foundationId('codex_app_server_rate_limits_read_result'),
      schemaVersion: SchemaVersionSchema.value,
      observedAt,
      adapterName: CODEX_APP_SERVER_ADAPTER_NAME,
      status: 'completed',
      blockReasons: [],
      quotaSnapshot,
      wireSummaries: exchange.wireSummaries,
      fixtureOnly: true,
      processBoundaryInvoked: false,
      externalProcessStarted: false,
      rawBodyStored: false,
    };
  }

  async startThread(
    input: CodexAppServerThreadOperationInput = {},
  ): Promise<CodexAppServerThreadOperationResult> {
    return this.threadOperation('thread/start', input);
  }

  async resumeThread(
    input: CodexAppServerThreadOperationInput = {},
  ): Promise<CodexAppServerThreadOperationResult> {
    return this.threadOperation('thread/resume', input);
  }

  async startTurn(input: CodexAppServerTurnStartInput): Promise<CodexAppServerTurnStartResult> {
    const observedAt = input.observedAt ?? this.input.observedAt ?? foundationTimestamp();
    const blocked = this.blockedReadResult('turn', observedAt, 'turn/start');
    if (blocked) {
      return blocked;
    }

    const exchange = await this.requestResponseExchange({
      method: 'turn/start',
      requestId: input.requestId ?? 'turn_start_1',
      observedAt,
      summary: 'Turn start request uses fixture JSONL transport.',
      responseSummary: 'Turn start response stored as metadata-only wire summary.',
      evidenceRefIds: input.evidenceRefIds ?? this.input.evidenceRefIds,
      auditEventIds: input.auditEventIds ?? this.input.auditEventIds,
    });

    if (!exchange.responseLine) {
      return {
        id: foundationId('codex_app_server_turn_start_result'),
        schemaVersion: SchemaVersionSchema.value,
        observedAt,
        adapterName: CODEX_APP_SERVER_ADAPTER_NAME,
        status: 'failed',
        blockReasons: ['turn_start_response_missing'],
        wireSummaries: exchange.wireSummaries,
        fixtureOnly: true,
        processBoundaryInvoked: false,
        externalProcessStarted: false,
        rawBodyStored: false,
      };
    }

    const payload = extractResponsePayload(exchange.responseLine);
    const turnKey = firstString(payload?.turnId, payload?.turn, payload?.id);

    if (!turnKey) {
      return {
        id: foundationId('codex_app_server_turn_start_result'),
        schemaVersion: SchemaVersionSchema.value,
        observedAt,
        adapterName: CODEX_APP_SERVER_ADAPTER_NAME,
        status: 'failed',
        blockReasons: ['turn_id_missing'],
        wireSummaries: exchange.wireSummaries,
        fixtureOnly: true,
        processBoundaryInvoked: false,
        externalProcessStarted: false,
        rawBodyStored: false,
      };
    }

    const turnMirror = CodexAppServerTurnMirrorSchema.parse({
      id: foundationId('codex_app_server_turn'),
      schemaVersion: SchemaVersionSchema.value,
      observedAt,
      appServerSessionId: this.sessionId,
      threadMirrorId: input.threadMirrorId,
      taskRunId: input.taskRunId,
      threadIdHash: hashRef(input.threadKey),
      turnIdHash: hashRef(turnKey),
      status: turnStatus(payload?.status),
      itemCount: optionalNonnegativeInteger(payload?.itemCount) ?? 0,
      eventCount: optionalNonnegativeInteger(payload?.eventCount) ?? 0,
      inputSummaryHash: input.inputSummaryHash,
      outputSummaryHash: firstHash(payload?.outputSummaryHash),
      approvalPendingCount: optionalNonnegativeInteger(payload?.approvalPendingCount) ?? 0,
      failureSummaryHash: firstHash(payload?.failureSummaryHash),
      processBoundaryInvoked: false,
      externalProcessStarted: false,
      evidenceRefIds: [...(input.evidenceRefIds ?? this.input.evidenceRefIds ?? [])],
      auditEventIds: [...(input.auditEventIds ?? this.input.auditEventIds ?? [])],
      summary: 'Codex App Server turn start projected as hashed turn mirror.',
    });

    return {
      id: foundationId('codex_app_server_turn_start_result'),
      schemaVersion: SchemaVersionSchema.value,
      observedAt,
      adapterName: CODEX_APP_SERVER_ADAPTER_NAME,
      status: 'completed',
      blockReasons: [],
      turnMirror,
      wireSummaries: exchange.wireSummaries,
      fixtureOnly: true,
      processBoundaryInvoked: false,
      externalProcessStarted: false,
      rawBodyStored: false,
    };
  }

  async ingestNextEvent(
    input: CodexAppServerEventIngestionInput = {},
  ): Promise<CodexAppServerEventIngestionResult> {
    const observedAt = input.observedAt ?? this.input.observedAt ?? foundationTimestamp();
    const blocked = this.blockedReadResult('event', observedAt, 'unknown');
    if (blocked) {
      return blocked;
    }

    const eventLine = await this.input.transport.receiveLine();
    if (!eventLine) {
      return {
        id: foundationId('codex_app_server_event_ingestion_result'),
        schemaVersion: SchemaVersionSchema.value,
        observedAt,
        adapterName: CODEX_APP_SERVER_ADAPTER_NAME,
        status: 'failed',
        blockReasons: ['event_stream_empty'],
        wireSummaries: [],
        fixtureOnly: true,
        processBoundaryInvoked: false,
        externalProcessStarted: false,
        rawBodyStored: false,
      };
    }

    const decoded = decodeCodexAppServerJsonlMessage(eventLine);
    const payload = extractMessagePayload(eventLine);
    const eventWireSummary = createWireSummary({
      line: eventLine,
      decoded: {
        ...decoded,
        method: decoded.method === 'unknown' ? safeMethod(firstString(payload?.method) ?? '') : decoded.method,
      },
      appServerSessionId: this.sessionId,
      observedAt,
      status: 'received',
      evidenceRefIds: input.evidenceRefIds ?? this.input.evidenceRefIds,
      auditEventIds: input.auditEventIds ?? this.input.auditEventIds,
      initializedObserved: true,
      summary: 'Event stream item received as metadata-only wire summary.',
    });
    const method = eventWireSummary.method;
    const threadKey = firstString(payload?.threadId, payload?.thread);
    const turnKey = firstString(payload?.turnId, payload?.turn);
    const itemKey = firstString(payload?.itemId, payload?.item);
    const eventSummary = CodexAppServerEventSummarySchema.parse({
      id: foundationId('codex_app_server_event'),
      schemaVersion: SchemaVersionSchema.value,
      observedAt,
      appServerSessionId: this.sessionId,
      threadMirrorId: input.threadMirrorId,
      turnMirrorId: input.turnMirrorId,
      method,
      eventHash: decoded.messageHash,
      threadIdHash: threadKey ? hashRef(threadKey) : undefined,
      turnIdHash: turnKey ? hashRef(turnKey) : undefined,
      itemIdHash: itemKey ? hashRef(itemKey) : undefined,
      status: eventStatus(payload?.status, method),
      sequenceNumber: Math.max(0, Math.trunc(input.sequenceNumber ?? 0)),
      deltaCount: optionalNonnegativeInteger(payload?.deltaCount) ?? 0,
      payloadByteCount: decoded.payloadByteCount,
      itemKindHash: firstString(payload?.itemKind) ? hashRef(String(payload?.itemKind)) : undefined,
      terminal: Boolean(payload?.terminal) || method === 'turn/completed',
      processBoundaryInvoked: false,
      externalProcessStarted: false,
      evidenceRefIds: [...(input.evidenceRefIds ?? this.input.evidenceRefIds ?? [])],
      auditEventIds: [...(input.auditEventIds ?? this.input.auditEventIds ?? [])],
      summary: 'Codex App Server event projected as hash-only event summary.',
    });

    return {
      id: foundationId('codex_app_server_event_ingestion_result'),
      schemaVersion: SchemaVersionSchema.value,
      observedAt,
      adapterName: CODEX_APP_SERVER_ADAPTER_NAME,
      status: 'completed',
      blockReasons: [],
      eventSummary,
      wireSummaries: [eventWireSummary],
      fixtureOnly: true,
      processBoundaryInvoked: false,
      externalProcessStarted: false,
      rawBodyStored: false,
    };
  }

  async ingestApprovalRequest(
    input: CodexAppServerApprovalBridgeInput = {},
  ): Promise<CodexAppServerApprovalBridgeResult> {
    const observedAt = input.observedAt ?? this.input.observedAt ?? foundationTimestamp();
    const blocked = this.blockedApprovalBridgeResult(observedAt);
    if (blocked) {
      return blocked;
    }

    const eventLine = await this.input.transport.receiveLine();
    if (!eventLine) {
      return {
        id: foundationId('codex_app_server_approval_bridge_result'),
        schemaVersion: SchemaVersionSchema.value,
        observedAt,
        adapterName: CODEX_APP_SERVER_ADAPTER_NAME,
        status: 'failed',
        blockReasons: ['approval_event_stream_empty'],
        wireSummaries: [],
        fixtureOnly: true,
        processBoundaryInvoked: false,
        externalProcessStarted: false,
        rawBodyStored: false,
      };
    }

    const decoded = decodeCodexAppServerJsonlMessage(eventLine);
    const payload = extractMessagePayload(eventLine);
    const method =
      decoded.method === 'unknown' ? safeMethod(firstString(payload?.method) ?? '') : decoded.method;
    const wireSummary = createWireSummary({
      line: eventLine,
      decoded: {
        ...decoded,
        method,
      },
      appServerSessionId: this.sessionId,
      observedAt,
      status: 'received',
      evidenceRefIds: input.evidenceRefIds ?? this.input.evidenceRefIds,
      auditEventIds: input.auditEventIds ?? this.input.auditEventIds,
      initializedObserved: true,
      summary: 'Approval request event received as metadata-only wire summary.',
    });

    if (
      method !== 'item/commandExecution/requestApproval' &&
      method !== 'item/fileChange/requestApproval'
    ) {
      return {
        id: foundationId('codex_app_server_approval_bridge_result'),
        schemaVersion: SchemaVersionSchema.value,
        observedAt,
        adapterName: CODEX_APP_SERVER_ADAPTER_NAME,
        status: 'failed',
        blockReasons: ['approval_method_unexpected'],
        wireSummaries: [wireSummary],
        fixtureOnly: true,
        processBoundaryInvoked: false,
        externalProcessStarted: false,
        rawBodyStored: false,
      };
    }

    const threadKey = firstString(
      payload?.threadId,
      payload?.thread,
      input.threadKey,
      input.fallbackThreadKey,
    );
    const turnKey = firstString(payload?.turnId, payload?.turn, input.turnKey, input.fallbackTurnKey);
    const requestKey = firstString(
      payload?.requestId,
      payload?.approvalId,
      payload?.id,
      input.fallbackRequestKey,
    );
    const itemKey = firstString(payload?.itemId, payload?.item);

    if (!threadKey || !turnKey || !requestKey) {
      return {
        id: foundationId('codex_app_server_approval_bridge_result'),
        schemaVersion: SchemaVersionSchema.value,
        observedAt,
        adapterName: CODEX_APP_SERVER_ADAPTER_NAME,
        status: 'failed',
        blockReasons: ['approval_identity_missing'],
        wireSummaries: [wireSummary],
        fixtureOnly: true,
        processBoundaryInvoked: false,
        externalProcessStarted: false,
        rawBodyStored: false,
      };
    }

    const availableDecisionHashes = decisionHashes(payload, input);
    const approvalBridgeRecord = CodexAppServerApprovalBridgeRecordSchema.parse({
      id: foundationId('codex_app_server_approval_bridge'),
      schemaVersion: SchemaVersionSchema.value,
      createdAt: observedAt,
      appServerSessionId: this.sessionId,
      taskRunId: input.taskRunId,
      threadIdHash: toHash(threadKey),
      turnIdHash: toHash(turnKey),
      itemIdHash: itemKey ? toHash(itemKey) : undefined,
      requestIdHash: toHash(requestKey),
      approvalKind: approvalKind(method),
      status: approvalStatus(payload?.status),
      proposalHash: approvalProposalHash(payload, input, decoded.messageHash),
      proposalSummaryHash: firstHash(input.proposalSummaryHash ?? payload?.proposalSummaryHash),
      availableDecisionCount: availableDecisionHashes.length,
      availableDecisionHashes,
      silentApprovalAllowed: false,
      rawProposalStored: false,
      approvalSecretStored: false,
      processBoundaryInvoked: false,
      externalProcessStarted: false,
      evidenceRefIds: [...(input.evidenceRefIds ?? this.input.evidenceRefIds ?? [])],
      auditEventIds: [...(input.auditEventIds ?? this.input.auditEventIds ?? [])],
      summary: 'Codex App Server approval request bridged without silent approval.',
    });

    return {
      id: foundationId('codex_app_server_approval_bridge_result'),
      schemaVersion: SchemaVersionSchema.value,
      observedAt,
      adapterName: CODEX_APP_SERVER_ADAPTER_NAME,
      status: 'completed',
      blockReasons: [],
      approvalBridgeRecord,
      wireSummaries: [wireSummary],
      fixtureOnly: true,
      processBoundaryInvoked: false,
      externalProcessStarted: false,
      rawBodyStored: false,
    };
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

  private blockedReadResult(
    kind: 'account' | 'rateLimits' | 'thread' | 'turn' | 'event',
    observedAt: string,
    method: CodexAppServerMethod,
  ):
    | CodexAppServerAccountReadResult
    | CodexAppServerRateLimitsReadResult
    | CodexAppServerThreadOperationResult
    | CodexAppServerTurnStartResult
    | CodexAppServerEventIngestionResult
    | undefined {
    if (this.closed) {
      return this.createBlockedReadResult(kind, observedAt, ['transport_closed']);
    }

    if (!this.initializedState) {
      return this.createBlockedReadResult(kind, observedAt, [`not_initialized:${method}`]);
    }

    return undefined;
  }

  private createBlockedReadResult(
    kind: 'account' | 'rateLimits' | 'thread' | 'turn' | 'event',
    observedAt: string,
    blockReasons: string[],
  ):
    | CodexAppServerAccountReadResult
    | CodexAppServerRateLimitsReadResult
    | CodexAppServerThreadOperationResult
    | CodexAppServerTurnStartResult
    | CodexAppServerEventIngestionResult {
    const common = {
      schemaVersion: SchemaVersionSchema.value,
      observedAt,
      adapterName: CODEX_APP_SERVER_ADAPTER_NAME,
      status: 'blocked' as const,
      blockReasons,
      wireSummaries: [],
      fixtureOnly: true as const,
      processBoundaryInvoked: false as const,
      externalProcessStarted: false as const,
      rawBodyStored: false as const,
    };

    if (kind === 'account') {
      return {
        id: foundationId('codex_app_server_account_read_result'),
        ...common,
      };
    }

    if (kind === 'rateLimits') {
      return {
        id: foundationId('codex_app_server_rate_limits_read_result'),
        ...common,
      };
    }

    if (kind === 'thread') {
      return {
        id: foundationId('codex_app_server_thread_operation_result'),
        method: 'thread/start',
        ...common,
      };
    }

    if (kind === 'turn') {
      return {
        id: foundationId('codex_app_server_turn_start_result'),
        ...common,
      };
    }

    return {
      id: foundationId('codex_app_server_event_ingestion_result'),
      ...common,
    };
  }

  private blockedApprovalBridgeResult(
    observedAt: string,
  ): CodexAppServerApprovalBridgeResult | undefined {
    if (this.closed) {
      return this.createBlockedApprovalBridgeResult(observedAt, ['transport_closed']);
    }

    if (!this.initializedState) {
      return this.createBlockedApprovalBridgeResult(observedAt, [
        'not_initialized:item/commandExecution/requestApproval',
      ]);
    }

    return undefined;
  }

  private createBlockedApprovalBridgeResult(
    observedAt: string,
    blockReasons: string[],
  ): CodexAppServerApprovalBridgeResult {
    return {
      id: foundationId('codex_app_server_approval_bridge_result'),
      schemaVersion: SchemaVersionSchema.value,
      observedAt,
      adapterName: CODEX_APP_SERVER_ADAPTER_NAME,
      status: 'blocked',
      blockReasons,
      wireSummaries: [],
      fixtureOnly: true,
      processBoundaryInvoked: false,
      externalProcessStarted: false,
      rawBodyStored: false,
    };
  }

  private async threadOperation(
    method: 'thread/start' | 'thread/resume',
    input: CodexAppServerThreadOperationInput,
  ): Promise<CodexAppServerThreadOperationResult> {
    const observedAt = input.observedAt ?? this.input.observedAt ?? foundationTimestamp();
    const blocked = this.blockedReadResult('thread', observedAt, method);
    if (blocked) {
      return {
        ...blocked,
        method,
      };
    }

    const exchange = await this.requestResponseExchange({
      method,
      requestId: input.requestId ?? `${method.replace('/', '_')}_1`,
      observedAt,
      summary: `${method} request uses fixture JSONL transport.`,
      responseSummary: `${method} response stored as metadata-only wire summary.`,
      evidenceRefIds: input.evidenceRefIds ?? this.input.evidenceRefIds,
      auditEventIds: input.auditEventIds ?? this.input.auditEventIds,
    });

    if (!exchange.responseLine) {
      return {
        id: foundationId('codex_app_server_thread_operation_result'),
        schemaVersion: SchemaVersionSchema.value,
        observedAt,
        adapterName: CODEX_APP_SERVER_ADAPTER_NAME,
        status: 'failed',
        method,
        blockReasons: [`${method.replace('/', '_')}_response_missing`],
        wireSummaries: exchange.wireSummaries,
        fixtureOnly: true,
        processBoundaryInvoked: false,
        externalProcessStarted: false,
        rawBodyStored: false,
      };
    }

    const payload = extractResponsePayload(exchange.responseLine);
    const threadKey = firstString(payload?.threadId, payload?.thread, payload?.id, input.fallbackThreadKey);

    if (!threadKey) {
      return {
        id: foundationId('codex_app_server_thread_operation_result'),
        schemaVersion: SchemaVersionSchema.value,
        observedAt,
        adapterName: CODEX_APP_SERVER_ADAPTER_NAME,
        status: 'failed',
        method,
        blockReasons: ['thread_id_missing'],
        wireSummaries: exchange.wireSummaries,
        fixtureOnly: true,
        processBoundaryInvoked: false,
        externalProcessStarted: false,
        rawBodyStored: false,
      };
    }

    const threadMirror = CodexAppServerThreadMirrorSchema.parse({
      id: foundationId('codex_app_server_thread'),
      schemaVersion: SchemaVersionSchema.value,
      observedAt,
      appServerSessionId: this.sessionId,
      taskRunId: input.taskRunId,
      threadIdHash: hashRef(threadKey),
      status: threadStatus(payload?.status),
      ephemeral: optionalBoolean(payload?.ephemeral) ?? false,
      pathHash: input.pathHash,
      turnCount: optionalNonnegativeInteger(payload?.turnCount) ?? 0,
      activeTurnIdHash: firstString(payload?.activeTurnId)
        ? hashRef(String(payload?.activeTurnId))
        : undefined,
      subscribed: optionalBoolean(payload?.subscribed) ?? false,
      permissionProfileHash: input.permissionProfileHash,
      workspaceTrustMutationAllowed: false,
      workspaceTrustMutationObserved: false,
      processBoundaryInvoked: false,
      externalProcessStarted: false,
      evidenceRefIds: [...(input.evidenceRefIds ?? this.input.evidenceRefIds ?? [])],
      auditEventIds: [...(input.auditEventIds ?? this.input.auditEventIds ?? [])],
      summary: `Codex App Server ${method} projected as hashed thread mirror.`,
    });

    return {
      id: foundationId('codex_app_server_thread_operation_result'),
      schemaVersion: SchemaVersionSchema.value,
      observedAt,
      adapterName: CODEX_APP_SERVER_ADAPTER_NAME,
      status: 'completed',
      method,
      blockReasons: [],
      threadMirror,
      wireSummaries: exchange.wireSummaries,
      fixtureOnly: true,
      processBoundaryInvoked: false,
      externalProcessStarted: false,
      rawBodyStored: false,
    };
  }

  private async requestResponseExchange(input: {
    method: CodexAppServerMethod;
    requestId: JsonRpcScalarId;
    params?: Record<string, unknown>;
    observedAt: string;
    summary: string;
    responseSummary: string;
    evidenceRefIds?: readonly string[];
    auditEventIds?: readonly string[];
  }): Promise<{
    responseLine?: string;
    wireSummaries: CodexAppServerWireMessageSummary[];
  }> {
    const request: CodexAppServerJsonRpcRequest = {
      jsonrpc: '2.0',
      id: input.requestId,
      method: input.method,
    };
    if (input.params !== undefined) {
      request.params = input.params;
    }
    const requestLine = encodeCodexAppServerJsonlMessage(request);
    await this.input.transport.sendLine(requestLine);
    const requestSummary = createWireSummary({
      line: requestLine,
      decoded: decodeCodexAppServerJsonlMessage(requestLine),
      appServerSessionId: this.sessionId,
      observedAt: input.observedAt,
      status: 'sent',
      evidenceRefIds: input.evidenceRefIds,
      auditEventIds: input.auditEventIds,
      initializedObserved: true,
      summary: input.summary,
    });
    const wireSummaries = [requestSummary];

    for (let attempt = 0; attempt < 50; attempt += 1) {
      const responseLine = await this.input.transport.receiveLine();

      if (!responseLine) {
        return {
          wireSummaries,
        };
      }

      const responseMatches = responseLineMatchesRequest(responseLine, input.requestId);
      const decoded = decodeCodexAppServerJsonlMessage(responseLine);
      const responseSummary = createWireSummary({
        line: responseLine,
        decoded: responseMatches
          ? {
              ...decoded,
              method: input.method,
            }
          : decoded,
        appServerSessionId: this.sessionId,
        observedAt: input.observedAt,
        status: 'received',
        evidenceRefIds: input.evidenceRefIds,
        auditEventIds: input.auditEventIds,
        initializedObserved: true,
        summary: responseMatches
          ? input.responseSummary
          : 'App Server side message observed while waiting for requested response.',
      });
      wireSummaries.push(responseSummary);

      if (responseMatches) {
        return {
          responseLine,
          wireSummaries,
        };
      }
    }

    return {
      wireSummaries,
    };
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

function toHash(value: string): string {
  return value.startsWith('sha256:') ? value : hashRef(value);
}

function byteLength(value: string): number {
  return new TextEncoder().encode(value).length;
}

function ensureJsonlLine(value: string): string {
  return value.endsWith('\n') ? value : `${value}\n`;
}

function extractResponsePayload(line: string): Record<string, unknown> | undefined {
  const parsed = JSON.parse(line.trim()) as Record<string, unknown>;
  const result = parsed.result;
  return result && typeof result === 'object' && !Array.isArray(result)
    ? (result as Record<string, unknown>)
    : undefined;
}

function responseLineMatchesRequest(line: string, requestId: JsonRpcScalarId): boolean {
  const parsed = JSON.parse(line.trim()) as Record<string, unknown>;
  if (!('result' in parsed) && !('error' in parsed)) {
    return false;
  }

  return String(parsed.id) === String(requestId);
}

function extractMessagePayload(line: string): Record<string, unknown> {
  const parsed = JSON.parse(line.trim()) as Record<string, unknown>;
  const payload = parsed.params ?? parsed.result;
  return payload && typeof payload === 'object' && !Array.isArray(payload)
    ? (payload as Record<string, unknown>)
    : {};
}

function recordValue(value: unknown): Record<string, unknown> | undefined {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : undefined;
}

function firstString(...values: unknown[]): string | undefined {
  for (const value of values) {
    if (typeof value === 'string' && value.length > 0) {
      return value;
    }
  }

  return undefined;
}

function firstNumber(...values: unknown[]): number | undefined {
  for (const value of values) {
    if (typeof value === 'number' && Number.isFinite(value)) {
      return value;
    }
  }

  return undefined;
}

function firstHash(value: unknown): string | undefined {
  return typeof value === 'string' && value.startsWith('sha256:') ? value : undefined;
}

function optionalBoolean(value: unknown): boolean | undefined {
  return typeof value === 'boolean' ? value : undefined;
}

function protocolDriftStatus(input: {
  baselineKind: CodexAppServerProtocolDriftReport['baselineKind'];
  driftCount: number;
  missingMethodCount: number;
  unknownMethodCount: number;
}): CodexAppServerProtocolDriftReport['status'] {
  if (input.baselineKind === 'unknown') {
    return 'unknown';
  }

  if (input.driftCount === 0) {
    return 'compatible';
  }

  if (input.missingMethodCount > 0 || input.unknownMethodCount > 0) {
    return 'incompatible';
  }

  return 'minor_drift';
}

function approvalKind(
  method: CodexAppServerMethod,
): CodexAppServerApprovalBridgeRecord['approvalKind'] {
  if (method === 'item/commandExecution/requestApproval') {
    return 'command-execution';
  }

  if (method === 'item/fileChange/requestApproval') {
    return 'file-change';
  }

  return 'unknown';
}

function approvalStatus(value: unknown): CodexAppServerApprovalBridgeRecord['status'] {
  if (
    value === 'approved' ||
    value === 'declined' ||
    value === 'cancelled' ||
    value === 'resolved' ||
    value === 'blocked' ||
    value === 'unknown'
  ) {
    return value;
  }

  return 'pending';
}

function approvalProposalHash(
  payload: Record<string, unknown>,
  input: CodexAppServerApprovalBridgeInput,
  messageHash: string,
): string {
  const existingHash = firstHash(input.proposalKey) ?? firstHash(payload.proposalHash);
  if (existingHash) {
    return existingHash;
  }

  const proposalKey = firstString(
    input.proposalKey,
    payload.proposalId,
    payload.proposalSummary,
    payload.kind,
  );
  return proposalKey ? hashRef(proposalKey) : messageHash;
}

function decisionHashes(
  payload: Record<string, unknown>,
  input: CodexAppServerApprovalBridgeInput,
): string[] {
  const decisionKeys =
    input.availableDecisionKeys && input.availableDecisionKeys.length > 0
      ? [...input.availableDecisionKeys]
      : stringArray(payload.availableDecisions ?? payload.decisions);
  return decisionKeys.map(toHash);
}

function stringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter((item): item is string => typeof item === 'string' && item.length > 0);
}

function accountStatus(value: unknown): CodexAccountBinding['status'] {
  if (value === 'matched' || value === 'active' || value === 'ready') {
    return 'matched';
  }

  if (value === 'unverified' || value === 'requires_openai_auth') {
    return 'unverified';
  }

  if (value === 'mismatch' || value === 'wrong_account') {
    return 'mismatch';
  }

  if (value === 'disabled' || value === 'removed') {
    return 'disabled';
  }

  if (value === 'blocked') {
    return 'blocked';
  }

  return 'unverified';
}

function threadStatus(value: unknown): CodexAppServerThreadMirror['status'] {
  if (
    value === 'not_loaded' ||
    value === 'loaded' ||
    value === 'running' ||
    value === 'completed' ||
    value === 'interrupted' ||
    value === 'failed' ||
    value === 'closed' ||
    value === 'blocked'
  ) {
    return value;
  }

  return 'unknown';
}

function turnStatus(value: unknown): CodexAppServerTurnMirror['status'] {
  if (
    value === 'queued' ||
    value === 'running' ||
    value === 'completed' ||
    value === 'failed' ||
    value === 'interrupted' ||
    value === 'declined' ||
    value === 'blocked'
  ) {
    return value;
  }

  return 'unknown';
}

function eventStatus(
  value: unknown,
  method: CodexAppServerMethod,
): CodexAppServerEventSummary['status'] {
  if (
    value === 'started' ||
    value === 'delta' ||
    value === 'completed' ||
    value === 'failed' ||
    value === 'resolved' ||
    value === 'blocked'
  ) {
    return value;
  }

  if (method.includes('/delta')) {
    return 'delta';
  }

  if (method.includes('/completed')) {
    return 'completed';
  }

  if (method.includes('/started')) {
    return 'started';
  }

  return 'unknown';
}

function quotaStatus(value: unknown): QuotaSnapshotStatus {
  if (
    value === 'available' ||
    value === 'limited' ||
    value === 'exhausted' ||
    value === 'blocked'
  ) {
    return value;
  }

  return 'unknown';
}

function selectRateLimitSnapshot(
  payload: Record<string, unknown> | undefined,
): Record<string, unknown> | undefined {
  if (!payload) {
    return undefined;
  }

  const primarySnapshot = recordValue(payload.rateLimits);
  if (primarySnapshot) {
    return primarySnapshot;
  }

  const byLimitId = recordValue(payload.rateLimitsByLimitId);
  const codexSnapshot = recordValue(byLimitId?.codex);
  if (codexSnapshot) {
    return codexSnapshot;
  }

  return payload;
}

function quotaStatusFromRateLimits(
  payload: Record<string, unknown> | undefined,
  snapshot: Record<string, unknown> | undefined,
): QuotaSnapshotStatus {
  const explicitStatus = quotaStatus(payload?.status ?? snapshot?.status);
  if (explicitStatus !== 'unknown') {
    return explicitStatus;
  }

  const reachedType = firstString(snapshot?.rateLimitReachedType);
  if (reachedType) {
    return 'exhausted';
  }

  const primaryWindow = recordValue(snapshot?.primary);
  const secondaryWindow = recordValue(snapshot?.secondary);
  const primaryUsedPercent = firstNumber(primaryWindow?.usedPercent);
  const secondaryUsedPercent = firstNumber(secondaryWindow?.usedPercent);
  const maxUsedPercent = Math.max(
    primaryUsedPercent ?? Number.NEGATIVE_INFINITY,
    secondaryUsedPercent ?? Number.NEGATIVE_INFINITY,
  );

  if (maxUsedPercent === Number.NEGATIVE_INFINITY) {
    return 'unknown';
  }

  if (maxUsedPercent >= 100) {
    return 'exhausted';
  }

  if (maxUsedPercent > 0) {
    return 'limited';
  }

  return 'available';
}

function optionalNonnegativeInteger(value: unknown): number | undefined {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return undefined;
  }

  return Math.max(0, Math.trunc(value));
}

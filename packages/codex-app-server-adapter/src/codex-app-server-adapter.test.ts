import { describe, expect, it } from 'vitest';
import {
  validateCapabilityManifest,
  validateCapabilityPlanEnvelope,
} from '@codexhub/capability-adapter-kernel';
import {
  CodexAccountBindingSchema,
  CodexAppServerApprovalBridgeRecordSchema,
  CodexAppServerEventSummarySchema,
  CodexAppServerProtocolDriftReportSchema,
  CodexAppServerSessionSchema,
  CodexAppServerThreadMirrorSchema,
  CodexAppServerTurnMirrorSchema,
  CodexAppServerWireMessageSummarySchema,
  QuotaSnapshotSchema,
} from '@codexhub/contracts';
import {
  createCodexAppServerAdapterManifest,
  createCodexAppServerAdapterPlan,
  createCodexAppServerProtocolDriftReport,
  createCodexAppServerSessionController,
  createGovernedCodexAppServerStdioTransport,
  createInMemoryCodexAppServerJsonlTransport,
  decodeCodexAppServerJsonlMessage,
  encodeCodexAppServerJsonlMessage,
  type CodexAppServerProcessHandle,
  type CodexAppServerProcessSpawner,
} from './index';

describe('codex-app-server-adapter', () => {
  it('creates a fixture-first App Server capability manifest', () => {
    const manifest = createCodexAppServerAdapterManifest();

    expect(manifest.name).toBe('codex-app-server-adapter');
    expect(manifest.kind).toBe('codex');
    expect(manifest.defaultActionMode).toBe('dry-run');
    expect(manifest.requiresApprovalByDefault).toBe(true);
    expect(manifest.processBoundary.mayStartExternalProcess).toBe(false);
    expect(manifest.metadata?.fixtureOnly).toBe(true);
    expect(manifest.metadata?.governedProcessBoundaryAvailable).toBe(true);
    expect(manifest.metadata?.realProcessLaunchEnabled).toBe(false);
    expect(validateCapabilityManifest(manifest).ok).toBe(true);
  });

  it('plans initialize without process launch or live dispatch', () => {
    const plan = createCodexAppServerAdapterPlan({
      dryRunId: 'codex_app_server_dry_run_1',
      clientInstanceKey: 'private-client-instance',
      protocolBaselineHash: 'sha256:baseline',
    });

    expect(plan.status).toBe('ready');
    expect(plan.clientInstanceHash).toMatch(/^sha256:/);
    expect(plan.processBoundaryPlanned).toBe(false);
    expect(plan.externalProcessStarted).toBe(false);
    expect(plan.liveDispatchEnabled).toBe(false);
    expect(plan.noRealWrite).toBe(true);
    expect(validateCapabilityPlanEnvelope(plan).ok).toBe(true);
    expect(JSON.stringify(plan)).not.toContain('private-client-instance');
  });

  it('blocks M54.3 plans that request process launch', () => {
    const plan = createCodexAppServerAdapterPlan({
      dryRunId: 'codex_app_server_process_blocked',
      clientInstanceKey: 'private-client-instance',
      processLaunchEnabled: true,
    });

    expect(plan.status).toBe('blocked');
    expect(plan.blockReasons).toContain('process_launch_disabled_m54_3');
    expect(plan.processBoundaryInvoked).toBe(false);
    expect(plan.externalProcessStarted).toBe(false);
  });

  it('encodes and decodes JSONL requests, notifications, and responses by metadata', () => {
    const requestLine = encodeCodexAppServerJsonlMessage({
      jsonrpc: '2.0',
      id: 'request-private-id',
      method: 'initialize',
      params: { clientName: 'codexhub' },
    });
    const notificationLine = encodeCodexAppServerJsonlMessage({
      jsonrpc: '2.0',
      method: 'initialized',
    });
    const responseLine = encodeCodexAppServerJsonlMessage({
      jsonrpc: '2.0',
      id: 'request-private-id',
      result: { ok: true },
    });

    const request = decodeCodexAppServerJsonlMessage(requestLine);
    const notification = decodeCodexAppServerJsonlMessage(notificationLine);
    const response = decodeCodexAppServerJsonlMessage(responseLine);

    expect(request.kind).toBe('request');
    expect(request.method).toBe('initialize');
    expect(request.requestIdHash).toMatch(/^sha256:/);
    expect(notification.kind).toBe('notification');
    expect(notification.method).toBe('initialized');
    expect(response.kind).toBe('response');
    expect(response.requestIdHash).toBe(request.requestIdHash);
    expect(JSON.stringify([request, notification, response])).not.toContain(
      'request-private-id',
    );
  });

  it('initializes a fixture JSONL session and sends initialized notification', async () => {
    const transport = createInMemoryCodexAppServerJsonlTransport([
      {
        jsonrpc: '2.0',
        id: 'initialize-private-id',
        result: {
          capabilities: {
            accountRead: true,
          },
        },
      },
    ]);
    const controller = createCodexAppServerSessionController({
      clientInstanceId: 'codex_client_1',
      clientInstanceKey: 'private-client-instance',
      appServerSessionKey: 'private-app-server-session',
      transport,
      observedAt: '2026-05-07T00:00:00.000Z',
      evidenceRefIds: ['evidence_app_server_initialize'],
      auditEventIds: ['audit_app_server_initialize'],
    });
    const result = await controller.initialize({
      requestId: 'initialize-private-id',
      protocolBaselineHash: 'sha256:baseline',
    });
    const serialized = JSON.stringify(result);

    expect(result.status).toBe('initialized');
    expect(result.initializedNotificationSent).toBe(true);
    expect(result.blockReasons).toEqual([]);
    expect(result.wireSummaries).toHaveLength(3);
    expect(result.wireSummaries.map((summary) => summary.method)).toEqual([
      'initialize',
      'initialize',
      'initialized',
    ]);
    expect(result.transportLineSummaries.map((summary) => summary.direction)).toEqual([
      'sent',
      'received',
      'sent',
    ]);
    expect(CodexAppServerSessionSchema.safeParse(result.appServerSession).success).toBe(true);
    for (const summary of result.wireSummaries) {
      expect(CodexAppServerWireMessageSummarySchema.safeParse(summary).success).toBe(true);
      expect(summary.rawBodyStored).toBe(false);
      expect(summary.externalProcessStarted).toBe(false);
    }
    expect(controller.assertInitialized('thread/start')).toBeUndefined();
    expect(serialized).not.toContain('private-client-instance');
    expect(serialized).not.toContain('private-app-server-session');
    expect(serialized).not.toContain('initialize-private-id');
  });

  it('reads account and rate limits through initialized fixture transport by hash only', async () => {
    const transport = createInMemoryCodexAppServerJsonlTransport([
      { jsonrpc: '2.0', id: 'initialize-private-id', result: { ok: true } },
      {
        jsonrpc: '2.0',
        id: 'account-private-request',
        result: {
          accountId: 'private-account-id',
          email: 'private@example.test',
          workspaceId: 'private-workspace-id',
          status: 'matched',
        },
      },
      {
        jsonrpc: '2.0',
        id: 'rate-private-request',
        result: {
          subjectId: 'private-account-id',
          status: 'limited',
          limitCount: 100,
          usedCount: 75,
          remainingCount: 25,
          resetAt: '2026-05-08T00:00:00.000Z',
        },
      },
    ]);
    const controller = createCodexAppServerSessionController({
      clientInstanceId: 'codex_client_1',
      transport,
      observedAt: '2026-05-07T00:00:00.000Z',
    });

    await controller.initialize({ requestId: 'initialize-private-id' });
    const account = await controller.readAccount({
      requestId: 'account-private-request',
    });
    const rateLimits = await controller.readRateLimits({
      requestId: 'rate-private-request',
    });
    const serialized = JSON.stringify([account, rateLimits]);

    expect(account.status).toBe('completed');
    expect(account.accountBinding?.codexAccountHash).toMatch(/^sha256:/);
    expect(account.accountBinding?.workspaceIdHash).toMatch(/^sha256:/);
    expect(account.wireSummaries.map((summary) => summary.method)).toEqual([
      'account/read',
      'account/read',
    ]);
    expect(CodexAccountBindingSchema.safeParse(account.accountBinding).success).toBe(true);
    expect(rateLimits.status).toBe('completed');
    expect(rateLimits.quotaSnapshot?.status).toBe('limited');
    expect(rateLimits.quotaSnapshot?.remainingCount).toBe(25);
    expect(rateLimits.quotaSnapshot?.resetAtHash).toMatch(/^sha256:/);
    expect(rateLimits.wireSummaries.map((summary) => summary.method)).toEqual([
      'account/rateLimits/read',
      'account/rateLimits/read',
    ]);
    expect(QuotaSnapshotSchema.safeParse(rateLimits.quotaSnapshot).success).toBe(true);
    expect(serialized).not.toContain('private-account-id');
    expect(serialized).not.toContain('private@example.test');
    expect(serialized).not.toContain('private-workspace-id');
    expect(serialized).not.toContain('2026-05-08T00:00:00.000Z');
    expect(serialized).not.toContain('account-private-request');
    expect(serialized).not.toContain('rate-private-request');
  });

  it('starts/resumes threads, starts turns, and ingests events by metadata only', async () => {
    const transport = createInMemoryCodexAppServerJsonlTransport([
      { jsonrpc: '2.0', id: 'initialize-private-id', result: { ok: true } },
      {
        jsonrpc: '2.0',
        id: 'thread-start-private-request',
        result: {
          threadId: 'private-thread-id',
          status: 'loaded',
          ephemeral: true,
          turnCount: 0,
          activeTurnId: 'private-active-turn-id',
          subscribed: true,
        },
      },
      {
        jsonrpc: '2.0',
        id: 'thread-resume-private-request',
        result: {
          threadId: 'private-thread-id',
          status: 'running',
          turnCount: 1,
        },
      },
      {
        jsonrpc: '2.0',
        id: 'turn-start-private-request',
        result: {
          turnId: 'private-turn-id',
          status: 'running',
          itemCount: 1,
          eventCount: 1,
          approvalPendingCount: 0,
        },
      },
      {
        jsonrpc: '2.0',
        method: 'item/agentMessage/delta',
        params: {
          threadId: 'private-thread-id',
          turnId: 'private-turn-id',
          itemId: 'private-item-id',
          itemKind: 'agent-message',
          status: 'delta',
          deltaCount: 1,
          delta: 'private model output body',
        },
      },
    ]);
    const controller = createCodexAppServerSessionController({
      clientInstanceId: 'codex_client_1',
      transport,
      observedAt: '2026-05-07T00:00:00.000Z',
    });

    await controller.initialize({ requestId: 'initialize-private-id' });
    const startedThread = await controller.startThread({
      requestId: 'thread-start-private-request',
      taskRunId: 'codex_task_run_1',
      pathHash: 'sha256:path',
      permissionProfileHash: 'sha256:permission-profile',
    });
    const resumedThread = await controller.resumeThread({
      requestId: 'thread-resume-private-request',
      taskRunId: 'codex_task_run_1',
    });
    const startedTurn = await controller.startTurn({
      requestId: 'turn-start-private-request',
      threadMirrorId: startedThread.threadMirror?.id ?? 'codex_app_server_thread_1',
      threadKey: 'private-thread-id',
      taskRunId: 'codex_task_run_1',
      inputSummaryHash: 'sha256:input-summary',
    });
    const event = await controller.ingestNextEvent({
      threadMirrorId: startedThread.threadMirror?.id,
      turnMirrorId: startedTurn.turnMirror?.id,
      sequenceNumber: 7,
    });
    const serialized = JSON.stringify([startedThread, resumedThread, startedTurn, event]);

    expect(startedThread.status).toBe('completed');
    expect(startedThread.method).toBe('thread/start');
    expect(startedThread.threadMirror?.threadIdHash).toMatch(/^sha256:/);
    expect(startedThread.threadMirror?.workspaceTrustMutationObserved).toBe(false);
    expect(CodexAppServerThreadMirrorSchema.safeParse(startedThread.threadMirror).success).toBe(
      true,
    );
    expect(resumedThread.method).toBe('thread/resume');
    expect(resumedThread.threadMirror?.status).toBe('running');
    expect(startedTurn.status).toBe('completed');
    expect(startedTurn.turnMirror?.turnIdHash).toMatch(/^sha256:/);
    expect(startedTurn.turnMirror?.inputSummaryHash).toBe('sha256:input-summary');
    expect(CodexAppServerTurnMirrorSchema.safeParse(startedTurn.turnMirror).success).toBe(true);
    expect(event.status).toBe('completed');
    expect(event.eventSummary?.method).toBe('item/agentMessage/delta');
    expect(event.eventSummary?.status).toBe('delta');
    expect(event.eventSummary?.sequenceNumber).toBe(7);
    expect(CodexAppServerEventSummarySchema.safeParse(event.eventSummary).success).toBe(true);
    expect(serialized).not.toContain('private-thread-id');
    expect(serialized).not.toContain('private-turn-id');
    expect(serialized).not.toContain('private-active-turn-id');
    expect(serialized).not.toContain('private-item-id');
    expect(serialized).not.toContain('private model output body');
    expect(serialized).not.toContain('thread-start-private-request');
    expect(serialized).not.toContain('turn-start-private-request');
  });

  it('bridges approval requests without silent approval or raw proposal storage', async () => {
    const transport = createInMemoryCodexAppServerJsonlTransport([
      { jsonrpc: '2.0', id: 'initialize-private-id', result: { ok: true } },
      {
        jsonrpc: '2.0',
        method: 'item/commandExecution/requestApproval',
        params: {
          threadId: 'private-thread-id',
          turnId: 'private-turn-id',
          itemId: 'private-item-id',
          requestId: 'private-approval-request',
          proposalId: 'private-proposal-id',
          proposalSummary: 'private approval proposal body',
          availableDecisions: ['private-approve-once', 'private-decline'],
          status: 'pending',
        },
      },
    ]);
    const controller = createCodexAppServerSessionController({
      clientInstanceId: 'codex_client_1',
      transport,
      observedAt: '2026-05-07T00:00:00.000Z',
    });

    await controller.initialize({ requestId: 'initialize-private-id' });
    const bridged = await controller.ingestApprovalRequest({
      taskRunId: 'codex_task_run_1',
      proposalSummaryHash: 'sha256:approval-summary',
    });
    const serialized = JSON.stringify(bridged);

    expect(bridged.status).toBe('completed');
    expect(bridged.approvalBridgeRecord?.approvalKind).toBe('command-execution');
    expect(bridged.approvalBridgeRecord?.status).toBe('pending');
    expect(bridged.approvalBridgeRecord?.silentApprovalAllowed).toBe(false);
    expect(bridged.approvalBridgeRecord?.rawProposalStored).toBe(false);
    expect(bridged.approvalBridgeRecord?.approvalSecretStored).toBe(false);
    expect(bridged.approvalBridgeRecord?.availableDecisionCount).toBe(2);
    expect(bridged.approvalBridgeRecord?.availableDecisionHashes).toHaveLength(2);
    expect(
      CodexAppServerApprovalBridgeRecordSchema.safeParse(bridged.approvalBridgeRecord).success,
    ).toBe(true);
    expect(serialized).not.toContain('private-thread-id');
    expect(serialized).not.toContain('private-turn-id');
    expect(serialized).not.toContain('private-item-id');
    expect(serialized).not.toContain('private-approval-request');
    expect(serialized).not.toContain('private-proposal-id');
    expect(serialized).not.toContain('private approval proposal body');
    expect(serialized).not.toContain('private-approve-once');
    expect(serialized).not.toContain('private-decline');
  });

  it('detects compatible and blocking protocol drift by hash and counts only', () => {
    const compatible = createCodexAppServerProtocolDriftReport({
      appServerSessionId: 'codex_app_server_session_1',
      baselineKind: 'generate-ts',
      baselineHash: 'sha256:baseline',
      observedSchemaHash: 'sha256:baseline',
      expectedMethods: ['initialize', 'thread/start'],
      observedMethods: ['initialize', 'thread/start'],
      observedAt: '2026-05-07T00:00:00.000Z',
    });
    const incompatible = createCodexAppServerProtocolDriftReport({
      appServerSessionId: 'codex_app_server_session_1',
      baselineKind: 'generate-json-schema',
      baselineHash: 'sha256:baseline',
      observedSchemaHash: 'sha256:observed',
      expectedMethods: ['initialize', 'turn/start'],
      observedMethods: ['initialize', 'private/newMethod'],
      observedAt: '2026-05-07T00:00:00.000Z',
    });
    const unknown = createCodexAppServerProtocolDriftReport({
      baselineKind: 'unknown',
      baselineHash: 'sha256:baseline',
      observedSchemaHash: 'sha256:baseline',
      observedAt: '2026-05-07T00:00:00.000Z',
    });
    const serialized = JSON.stringify([compatible, incompatible, unknown]);

    expect(compatible.status).toBe('compatible');
    expect(compatible.liveDispatchBlocked).toBe(false);
    expect(incompatible.status).toBe('incompatible');
    expect(incompatible.liveDispatchBlocked).toBe(true);
    expect(incompatible.missingMethodCount).toBe(1);
    expect(incompatible.unknownMethodCount).toBe(1);
    expect(unknown.status).toBe('unknown');
    expect(unknown.liveDispatchBlocked).toBe(true);
    expect(compatible.rawSchemaStored).toBe(false);
    expect(CodexAppServerProtocolDriftReportSchema.safeParse(compatible).success).toBe(true);
    expect(CodexAppServerProtocolDriftReportSchema.safeParse(incompatible).success).toBe(true);
    expect(CodexAppServerProtocolDriftReportSchema.safeParse(unknown).success).toBe(true);
    expect(serialized).not.toContain('private/newMethod');
  });

  it('blocks account and rate-limit reads before initialize', async () => {
    const controller = createCodexAppServerSessionController({
      clientInstanceId: 'codex_client_1',
      transport: createInMemoryCodexAppServerJsonlTransport(),
      observedAt: '2026-05-07T00:00:00.000Z',
    });

    const account = await controller.readAccount();
    const rateLimits = await controller.readRateLimits();
    const approval = await controller.ingestApprovalRequest();

    expect(account.status).toBe('blocked');
    expect(account.blockReasons).toContain('not_initialized:account/read');
    expect(rateLimits.status).toBe('blocked');
    expect(rateLimits.blockReasons).toContain('not_initialized:account/rateLimits/read');
    expect(approval.status).toBe('blocked');
    expect(approval.blockReasons).toContain(
      'not_initialized:item/commandExecution/requestApproval',
    );
    expect(account.wireSummaries).toHaveLength(0);
    expect(rateLimits.wireSummaries).toHaveLength(0);
    expect(approval.wireSummaries).toHaveLength(0);
  });

  it('blocks operations before initialize and duplicate initialize attempts', async () => {
    const transport = createInMemoryCodexAppServerJsonlTransport([
      { jsonrpc: '2.0', id: 'initialize-private-id', result: { ok: true } },
    ]);
    const controller = createCodexAppServerSessionController({
      clientInstanceId: 'codex_client_1',
      transport,
      observedAt: '2026-05-07T00:00:00.000Z',
    });
    const notInitialized = controller.assertInitialized('turn/start');

    expect(notInitialized?.status).toBe('blocked');
    expect(notInitialized?.blockReasons).toContain('not_initialized:turn/start');

    const initialized = await controller.initialize({
      requestId: 'initialize-private-id',
    });
    const duplicate = await controller.initialize({
      requestId: 'initialize-private-id',
    });

    expect(initialized.status).toBe('initialized');
    expect(duplicate.status).toBe('blocked');
    expect(duplicate.blockReasons).toContain('already_initialized');
    expect(duplicate.wireSummaries).toHaveLength(0);
  });

  it('fails initialize when no response is available without storing raw data', async () => {
    const transport = createInMemoryCodexAppServerJsonlTransport();
    const controller = createCodexAppServerSessionController({
      clientInstanceId: 'codex_client_1',
      transport,
      observedAt: '2026-05-07T00:00:00.000Z',
    });
    const result = await controller.initialize({ requestId: 'missing-response-id' });

    expect(result.status).toBe('failed');
    expect(result.blockReasons).toContain('initialize_response_missing');
    expect(result.initializedNotificationSent).toBe(false);
    expect(result.appServerSession.status).toBe('degraded');
    expect(result.rawBodyStored).toBe(false);
    expect(JSON.stringify(result)).not.toContain('missing-response-id');
  });

  it('blocks governed stdio process boundary before dispatch gates are ready', () => {
    const spawner = new FakeCodexAppServerProcessSpawner([
      { jsonrpc: '2.0', id: 'initialize-private-id', result: { ok: true } },
    ]);
    const result = createGovernedCodexAppServerStdioTransport({
      command: 'C:\\private\\codex-app-server.exe',
      args: ['--private-arg'],
      grant: {
        dryRunId: 'dry_run_m57',
        approvalArtifactId: '',
        dispatchAllowed: false,
        preflightStatus: 'waiting_approval',
        approvalStatus: 'waiting',
        canaryGateStatus: 'blocked',
        protocolDriftStatus: 'compatible',
      },
      spawner,
      observedAt: '2026-05-08T00:00:00.000Z',
    });
    const serialized = JSON.stringify(result);

    expect(result.status).toBe('blocked');
    expect(result.blockReasons).toEqual(
      expect.arrayContaining([
        'approval_artifact_id_required',
        'dispatch_preflight_not_ready',
        'approval_not_approved',
        'canary_gate_not_passed',
      ]),
    );
    expect(result.processBoundaryInvoked).toBe(false);
    expect(result.externalProcessStarted).toBe(false);
    expect(result.liveDispatchEnabled).toBe(false);
    expect(result.rawCommandStored).toBe(false);
    expect(result.rawArgsStored).toBe(false);
    expect(spawner.starts).toHaveLength(0);
    expect(serialized).not.toContain('C:\\private\\codex-app-server.exe');
    expect(serialized).not.toContain('--private-arg');
  });

  it('starts governed stdio process transport only after preflight, approval, drift, and canary gates', async () => {
    const spawner = new FakeCodexAppServerProcessSpawner([
      { jsonrpc: '2.0', id: 'initialize-private-id', result: { ok: true } },
    ]);
    const result = createGovernedCodexAppServerStdioTransport({
      command: 'C:\\private\\codex-app-server.exe',
      args: ['--private-arg'],
      grant: {
        dryRunId: 'dry_run_m57',
        approvalArtifactId: 'approval_m57',
        dispatchAllowed: true,
        preflightStatus: 'ready',
        approvalStatus: 'approved',
        canaryGateStatus: 'passed',
        protocolDriftStatus: 'compatible',
        liveDispatchBlocked: false,
      },
      spawner,
      observedAt: '2026-05-08T00:00:00.000Z',
      evidenceRefIds: ['evidence_stdio_boundary'],
      auditEventIds: ['audit_stdio_boundary'],
    });
    const serialized = JSON.stringify(result);

    expect(result.status).toBe('ready');
    expect(result.processBoundaryInvoked).toBe(true);
    expect(result.externalProcessStarted).toBe(true);
    expect(result.liveDispatchEnabled).toBe(true);
    expect(result.transportKind).toBe('stdio-jsonl');
    expect(result.fixtureOnly).toBe(false);
    expect(result.rawCommandStored).toBe(false);
    expect(result.rawArgsStored).toBe(false);
    expect(result.transport).toBeDefined();
    expect(serialized).not.toContain('"transport":');
    expect(serialized).not.toContain('C:\\private\\codex-app-server.exe');
    expect(serialized).not.toContain('--private-arg');
    expect(spawner.starts).toEqual([
      {
        command: 'C:\\private\\codex-app-server.exe',
        args: ['--private-arg'],
      },
    ]);

    const controller = createCodexAppServerSessionController({
      clientInstanceId: 'codex_client_1',
      transport: result.transport ?? createInMemoryCodexAppServerJsonlTransport(),
      observedAt: '2026-05-08T00:00:00.000Z',
    });
    const initialized = await controller.initialize({ requestId: 'initialize-private-id' });

    expect(initialized.status).toBe('initialized');
    expect(result.transport?.listLineSummaries().map((summary) => summary.direction)).toEqual([
      'sent',
      'received',
      'sent',
    ]);
    expect(JSON.stringify(initialized)).not.toContain('initialize-private-id');
  });
});

class FakeCodexAppServerProcessSpawner implements CodexAppServerProcessSpawner {
  readonly starts: { command: string; args: string[] }[] = [];

  constructor(
    private readonly incoming: readonly ({ jsonrpc: '2.0'; id: string; result: unknown } | string)[],
  ) {}

  start(input: { command: string; args: readonly string[] }): CodexAppServerProcessHandle {
    this.starts.push({ command: input.command, args: [...input.args] });
    return new FakeCodexAppServerProcessHandle(this.incoming);
  }
}

class FakeCodexAppServerProcessHandle implements CodexAppServerProcessHandle {
  readonly pid = 1234;
  readonly sentLines: string[] = [];
  private readonly incomingLines: string[];
  private closed = false;

  constructor(incoming: readonly ({ jsonrpc: '2.0'; id: string; result: unknown } | string)[]) {
    this.incomingLines = incoming.map((message) =>
      typeof message === 'string' ? message : `${JSON.stringify(message)}\n`,
    );
  }

  async writeStdin(line: string): Promise<void> {
    if (!this.closed) {
      this.sentLines.push(line);
    }
  }

  async readStdoutLine(): Promise<string | undefined> {
    return this.closed ? undefined : this.incomingLines.shift();
  }

  async close(): Promise<void> {
    this.closed = true;
  }
}

import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { dirname, extname, isAbsolute, parse, relative, resolve, sep } from 'node:path';
import Fastify from 'fastify';
import {
  createCodexExecApprovalArtifactFromDecision,
  createCodexExecApprovalArtifact,
  createCodexExecApprovalTransitionResult,
  createCodexExecDisabledLiveRunRecord,
  createCodexExecDryRunPlan,
  createCodexExecExecutionIntent,
  createCodexExecControlPlaneAuditEvents,
  createCodexExecControlPlaneEvidenceRefs,
  createCodexExecManualApprovalDecision,
  createCodexExecManualApprovalRecord,
  createCodexExecManualApprovalRequest,
  createDefaultCodexExecConfigLoadResult,
  evaluateCodexExecDryRunPolicy,
  evaluateCodexExecExecutionGate,
  evaluateCodexExecLiveCapability,
  evaluateCodexExecManualApprovalState,
  type CodexExecReplaySummary,
  parseCodexExecLiveConfigFile,
  createCodexReplayRecord,
  replayCodexExecFixture,
  runCodexExecPreflight,
  summarizeCodexExecReplay,
} from '@codexhub/codex-kernel';
import type {
  CodexExecApprovalArtifact,
  CodexExecApprovalDecisionOutcome,
  CodexExecApprovalMode,
  CodexExecConfigLoadResult,
  CodexExecLiveRunRecord,
  CodexExecManualApprovalRecord,
  CodexExecSandboxMode,
  CodexReplayRecord,
} from '@codexhub/contracts';
import { SchemaVersionSchema, foundationId, foundationTimestamp } from '@codexhub/contracts';
import { MockObservationSource, aggregateSourceHealth } from '@codexhub/observer-kernel';
import {
  type MockDevelopmentOrchestrationResult,
  runMockDevelopmentOrchestration,
} from '@codexhub/orchestrator-kernel';
import type { CodexHubStore } from '@codexhub/store-core';
import { createSqliteStore } from '@codexhub/store-sqlite';
import { DefaultPolicyEngine } from '@codexhub/security-kernel';
import { WorkflowRunner, createMockWorkflowDefinition } from '@codexhub/workflow-kernel';

interface SupervisorServerOptions {
  store?: CodexHubStore;
  disableStore?: boolean;
}

interface PersistenceState {
  status: 'ok' | 'degraded' | 'disabled';
  reason?: string;
}

export function buildSupervisorServer(options: SupervisorServerOptions = {}) {
  const server = Fastify({ logger: true });
  const workflowRunner = new WorkflowRunner();
  const observationSource = new MockObservationSource('codexhub.mock.supervisor');
  const mockDevelopmentRuns: MockDevelopmentOrchestrationResult[] = [];
  const codexReplayRecords: CodexReplayRecord[] = [];
  const codexExecLiveRunRecords: CodexExecLiveRunRecord[] = [];
  const codexExecApprovalRecords: CodexExecManualApprovalRecord[] = [];
  const policyEngine = new DefaultPolicyEngine();
  let configLoadPromise: Promise<CodexExecConfigLoadResult> | undefined;
  let ownedStore: CodexHubStore | undefined;
  let storePromise: Promise<CodexHubStore | undefined> | undefined;
  let persistenceState: PersistenceState = options.disableStore
    ? { status: 'disabled', reason: 'store disabled by test configuration' }
    : { status: 'ok' };

  async function getStore(): Promise<CodexHubStore | undefined> {
    if (options.store) {
      return options.store;
    }

    if (options.disableStore) {
      return undefined;
    }

    storePromise ??= createSqliteStore()
      .then((store) => {
        ownedStore = store;
        persistenceState = { status: 'ok' };
        return store;
      })
      .catch(() => {
        persistenceState = {
          status: 'degraded',
          reason: 'store initialization failed',
        };
        return undefined;
      });

    return storePromise;
  }

  async function getLiveConfigLoadResult(): Promise<CodexExecConfigLoadResult> {
    configLoadPromise ??= loadCodexExecConfig();
    return configLoadPromise;
  }

  async function loadCodexExecConfig(): Promise<CodexExecConfigLoadResult> {
    const workspaceRoot = findWorkspaceRoot(process.cwd());
    const configPath = resolve(workspaceRoot, '.codexhub', 'codex-exec.yaml');

    if (!existsSync(configPath)) {
      return createDefaultCodexExecConfigLoadResult();
    }

    const fileText = await readFile(configPath, 'utf8');

    return parseCodexExecLiveConfigFile({
      configPath: toWorkspacePath(configPath, workspaceRoot),
      fileText,
      metadata: { requestedBy: 'supervisor' },
    });
  }

  server.addHook('onRequest', async (_request, reply) => {
    reply.header('Access-Control-Allow-Origin', '*');
    reply.header('Access-Control-Allow-Headers', 'content-type');
    reply.header('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  });

  server.options('*', async () => ({ ok: true }));

  server.addHook('onClose', async () => {
    if (ownedStore) {
      await ownedStore.close();
      ownedStore = undefined;
    }
  });

  server.get('/health', async () => ({
    id: foundationId('health'),
    schemaVersion: SchemaVersionSchema.value,
    observedAt: foundationTimestamp(),
    service: 'codexhub-supervisor',
    status: 'ok',
    metadata: { mock: true },
  }));

  server.post('/api/workflows/dry-run', async (request) => {
    const body = request.body as
      | { workflowName?: string; input?: Record<string, unknown> }
      | undefined;
    const workflowName = body?.workflowName ?? 'development.bootstrap';
    const definition = createMockWorkflowDefinition(workflowName);

    return workflowRunner.dryRun(definition, body?.input ?? {});
  });

  server.get('/api/workflows/runs', async () => ({
    runs: [
      {
        id: foundationId('workflow_run'),
        schemaVersion: SchemaVersionSchema.value,
        createdAt: foundationTimestamp(),
        workflowName: 'development.bootstrap',
        status: 'created',
        dryRun: true,
        steps: [],
        evidenceRefs: [],
        metadata: { mock: true },
      },
    ],
  }));

  server.get('/api/observations', async () => {
    const observations = await observationSource.collect();
    const sourceHealth = await aggregateSourceHealth([observationSource]);

    return {
      observations,
      sourceHealth,
    };
  });

  server.post('/api/development/mock-run', async (request) => {
    const body = request.body as
      | {
          title?: string;
          description?: string;
          constraints?: string[];
          metadata?: Record<string, unknown>;
        }
      | undefined;
    const store = await getStore();
    const result = await runMockDevelopmentOrchestration({
      title: body?.title ?? 'Untitled mock development request',
      description: body?.description ?? 'No description provided.',
      constraints: body?.constraints,
      metadata: body?.metadata,
      store,
    });

    if (!store) {
      mockDevelopmentRuns.unshift(result);
    }

    return {
      ...result,
      metadata: {
        ...(result.metadata ?? {}),
        persistence: persistenceState.status,
        persistenceReason: persistenceState.reason,
      },
    };
  });

  server.get('/api/development/mock-runs', async () => {
    const store = await getStore();

    if (store) {
      return {
        runs: await store.developmentRuns.listMockDevelopmentRuns(10),
        persistence: persistenceState,
      };
    }

    return {
      runs: mockDevelopmentRuns.slice(0, 10),
      persistence: persistenceState,
    };
  });

  server.post('/api/codex/replay-fixture', async (request, reply) => {
    const body = request.body as { fixturePath?: string } | undefined;
    const fixturePath = body?.fixturePath;

    if (!fixturePath) {
      return reply.code(400).send({ error: 'fixturePath is required' });
    }

    const guard = resolveAllowedFixture(fixturePath);

    if (!guard.allowed) {
      return reply.code(400).send({ error: guard.reason });
    }

    if (!existsSync(guard.path)) {
      return reply.code(404).send({ error: 'fixture file was not found' });
    }

    const store = await getStore();
    const fixtureText = await readFile(guard.path, 'utf8');
    const result = await replayCodexExecFixture(fixtureText);
    const record = createCodexReplayRecord(result, guard.fixturePath);

    if (store) {
      for (const evidenceRef of result.evidenceRefs) {
        await store.evidenceRefs.create(evidenceRef);
      }

      for (const auditEvent of result.auditEvents) {
        await store.auditEvents.append(auditEvent);
      }

      await store.codexReplays.saveCodexReplay(record);
    } else {
      codexReplayRecords.unshift(record);
    }

    return {
      ...summarizeCodexExecReplay(result, guard.fixturePath),
      degraded: persistenceState.status !== 'ok',
      reason: persistenceState.reason,
    };
  });

  server.get('/api/codex/replay-fixtures', async () => {
    const store = await getStore();
    const records = store
      ? await store.codexReplays.listCodexReplays(10)
      : codexReplayRecords.slice(0, 10);

    return {
      runs: records.map(recordToSummary),
      degraded: persistenceState.status !== 'ok',
      reason: persistenceState.reason,
      metadata: { mockOnly: true, liveExecution: false, externalProcessStarted: false },
    };
  });

  server.post('/api/codex/exec/dry-run', async (request, reply) => {
    const body = request.body as
      | {
          title?: string;
          prompt?: string;
          cwd?: string;
          sandboxMode?: CodexExecSandboxMode;
          approvalMode?: CodexExecApprovalMode;
          metadata?: Record<string, unknown>;
        }
      | undefined;

    if (!body?.title || !body.prompt) {
      return reply.code(400).send({ error: 'title and prompt are required' });
    }

    const cwdGuard = resolveAllowedCwd(body.cwd ?? '.');

    if (!cwdGuard.allowed) {
      return reply.code(400).send({ error: cwdGuard.reason });
    }

    const store = await getStore();
    const configLoadResult = await getLiveConfigLoadResult();
    const liveConfig = configLoadResult.config;
    const intent = createCodexExecExecutionIntent({
      title: body.title,
      prompt: body.prompt,
      cwd: cwdGuard.cwd,
      sandboxMode: body.sandboxMode ?? 'read_only',
      approvalMode: body.approvalMode ?? 'required',
      liveAdapterEnabled: liveConfig.liveEnabled,
      metadata: body.metadata,
    });
    const dryRunPlan = createCodexExecDryRunPlan(intent);
    const policyDecision = evaluateCodexExecDryRunPolicy(dryRunPlan, policyEngine);
    const liveRunRecord = {
      ...createCodexExecDisabledLiveRunRecord(
        dryRunPlan,
        policyDecision,
        'live adapter disabled in Round 3B control-plane skeleton',
      ),
      configLoadResult,
    };

    if (store) {
      for (const evidenceRef of liveRunRecord.evidenceRefs) {
        await store.evidenceRefs.create(evidenceRef);
      }

      for (const auditEvent of liveRunRecord.auditEvents) {
        await store.auditEvents.append(auditEvent);
      }

      await store.codexExecLiveRuns.saveCodexExecLiveRunRecord(liveRunRecord);
    } else {
      codexExecLiveRunRecords.unshift(liveRunRecord);
    }

    return {
      intent,
      dryRunPlan,
      commandPreview: liveRunRecord.commandPreview,
      policyDecision,
      approvalRequirement: liveRunRecord.approvalRequirement,
      evidenceRefs: liveRunRecord.evidenceRefs,
      auditEvents: liveRunRecord.auditEvents,
      liveRunRecord,
      configLoadResult,
      liveExecution: false,
      externalProcessStarted: false,
      executionDisabled: true,
      degraded: persistenceState.status !== 'ok',
      reason: persistenceState.reason,
    };
  });

  server.get('/api/codex/exec/dry-runs', async () => {
    const store = await getStore();
    const configLoadResult = await getLiveConfigLoadResult();
    const liveConfig = configLoadResult.config;
    const records = store
      ? await store.codexExecLiveRuns.listCodexExecLiveRunRecords(10)
      : codexExecLiveRunRecords.slice(0, 10);

    return {
      runs: records,
      liveConfig,
      degraded: persistenceState.status !== 'ok',
      reason: persistenceState.reason,
      metadata: { liveExecution: false, externalProcessStarted: false, executionDisabled: true },
    };
  });

  server.get('/api/codex/exec/config', async () => {
    const configLoadResult = await getLiveConfigLoadResult();
    const evidenceRefs = createCodexExecControlPlaneEvidenceRefs({ configLoadResult });
    const auditEvents = createCodexExecControlPlaneAuditEvents({ configLoadResult, evidenceRefs });

    return {
      configLoadResult,
      liveConfig: configLoadResult.config,
      capability: evaluateCodexExecLiveCapability(configLoadResult.config),
      evidenceRefs,
      auditEvents,
      liveExecution: false,
      externalProcessStarted: false,
      executionDisabled: true,
      degraded: persistenceState.status !== 'ok',
      reason: persistenceState.reason,
    };
  });

  server.post('/api/codex/exec/preflight', async (request, reply) => {
    const body = request.body as
      | {
          dryRunId?: string;
          isolatedWorktreePresent?: boolean;
          worktreePath?: string;
        }
      | undefined;
    const store = await getStore();
    const configLoadResult = await getLiveConfigLoadResult();
    const liveConfig = configLoadResult.config;
    const record = await resolveCodexExecLiveRunRecord(body?.dryRunId, store);

    if (!record) {
      return reply.code(404).send({ error: 'dry-run record was not found' });
    }

    const preflightResult = runCodexExecPreflight(record.dryRunPlan, liveConfig, {
      isolatedWorktreePresent: body?.isolatedWorktreePresent,
      worktreePath: body?.worktreePath,
    });
    const evidenceRefs = createCodexExecControlPlaneEvidenceRefs({ preflightResult });
    const auditEvents = createCodexExecControlPlaneAuditEvents({ preflightResult, evidenceRefs });
    const updatedRecord = {
      ...record,
      preflightResult,
      evidenceRefs: [...record.evidenceRefs, ...evidenceRefs],
      auditEvents: [...record.auditEvents, ...auditEvents],
    };

    await persistCodexExecLiveRunRecord(updatedRecord, store, evidenceRefs, auditEvents);

    return {
      preflightResult,
      evidenceRefs,
      auditEvents,
      liveConfig,
      configLoadResult,
      liveExecution: false,
      externalProcessStarted: false,
      executionDisabled: true,
      degraded: persistenceState.status !== 'ok',
      reason: persistenceState.reason,
    };
  });

  server.post('/api/codex/exec/approval-artifact', async (request, reply) => {
    const body = request.body as { dryRunId?: string } | undefined;
    const store = await getStore();
    const configLoadResult = await getLiveConfigLoadResult();
    const liveConfig = configLoadResult.config;
    const record = await resolveCodexExecLiveRunRecord(body?.dryRunId, store);

    if (!record) {
      return reply.code(404).send({ error: 'dry-run record was not found' });
    }

    const approvalArtifact = createCodexExecApprovalArtifact(
      record.dryRunPlan,
      record.policyDecision,
      {
        singleUse: liveConfig.singleUseApprovals,
        expiresAt: new Date(Date.now() + liveConfig.approvalTtlMinutes * 60 * 1000).toISOString(),
      },
    );
    const evidenceRefs = createCodexExecControlPlaneEvidenceRefs({ approvalArtifact });
    const auditEvents = createCodexExecControlPlaneAuditEvents({ approvalArtifact, evidenceRefs });
    const updatedRecord = {
      ...record,
      approvalArtifact,
      evidenceRefs: [...record.evidenceRefs, ...evidenceRefs],
      auditEvents: [...record.auditEvents, ...auditEvents],
    };

    await persistCodexExecLiveRunRecord(updatedRecord, store, evidenceRefs, auditEvents);

    return {
      approvalArtifact,
      evidenceRefs,
      auditEvents,
      liveConfig,
      configLoadResult,
      liveExecution: false,
      externalProcessStarted: false,
      executionDisabled: true,
      degraded: persistenceState.status !== 'ok',
      reason: persistenceState.reason,
    };
  });

  server.post('/api/codex/exec/approval-request', async (request, reply) => {
    const body = request.body as
      | {
          dryRunId?: string;
          requestedBy?: string;
          reason?: string;
        }
      | undefined;
    const store = await getStore();
    const configLoadResult = await getLiveConfigLoadResult();
    const liveConfig = configLoadResult.config;
    const record = await resolveCodexExecLiveRunRecord(body?.dryRunId, store);

    if (!record) {
      return reply.code(404).send({ error: 'dry-run record was not found' });
    }

    const approvalRequest = createCodexExecManualApprovalRequest(
      record.dryRunPlan,
      record.policyDecision,
      liveConfig,
      {
        requestedBy: body?.requestedBy,
        reason: body?.reason,
      },
    );
    let approvalRecord = createCodexExecManualApprovalRecord({
      request: approvalRequest,
    });
    const approvalState =
      approvalRecord.approvalState ?? evaluateCodexExecManualApprovalState(approvalRecord);
    const evidenceRefs = createCodexExecControlPlaneEvidenceRefs({
      approvalRequest,
      approvalState,
    });
    const auditEvents = createCodexExecControlPlaneAuditEvents({
      approvalRequest,
      approvalState,
      evidenceRefs,
    });
    approvalRecord = {
      ...approvalRecord,
      approvalState,
      evidenceRefs,
      auditEventIds: auditEvents.map((event) => event.id),
    };
    const updatedRunRecord = {
      ...record,
      manualApprovalRequest: approvalRequest,
      manualApprovalState: approvalState,
      manualApprovalRecord: approvalRecord,
      evidenceRefs: [...record.evidenceRefs, ...evidenceRefs],
      auditEvents: [...record.auditEvents, ...auditEvents],
    };

    await persistCodexExecApprovalRecord(approvalRecord, store);
    await persistCodexExecLiveRunRecord(updatedRunRecord, store, evidenceRefs, auditEvents);

    return {
      approvalRequest,
      approvalState,
      approvalRecord,
      evidenceRefs,
      auditEvents,
      liveConfig,
      configLoadResult,
      liveExecution: false,
      externalProcessStarted: false,
      executionDisabled: true,
      degraded: persistenceState.status !== 'ok',
      reason: persistenceState.reason,
    };
  });

  server.post('/api/codex/exec/manual-approval', async (request, reply) => {
    const body = request.body as
      | {
          dryRunId?: string;
          approvalRequestId?: string;
          outcome?: CodexExecApprovalDecisionOutcome;
          decidedBy?: string;
          reason?: string;
        }
      | undefined;
    const outcome: CodexExecApprovalDecisionOutcome = body?.outcome ?? 'approved';

    if (!['approved', 'denied', 'revoked'].includes(outcome)) {
      return reply.code(400).send({ error: 'outcome must be approved, denied, or revoked' });
    }

    const store = await getStore();
    const record = await resolveCodexExecLiveRunRecord(body?.dryRunId, store);

    if (!record) {
      return reply.code(404).send({ error: 'dry-run record was not found' });
    }

    const existingApprovalRecord = await resolveCodexExecApprovalRecord(
      body?.approvalRequestId ?? record.manualApprovalRequest?.id,
      store,
    );
    const approvalRequest =
      existingApprovalRecord?.request ??
      record.manualApprovalRequest ??
      createCodexExecManualApprovalRequest(record.dryRunPlan, record.policyDecision);
    const baseApprovalRecord =
      existingApprovalRecord ??
      record.manualApprovalRecord ??
      createCodexExecManualApprovalRecord({ request: approvalRequest });
    const transitionAction = approvalActionForOutcome(outcome);
    const approvalTransition = createCodexExecApprovalTransitionResult(
      baseApprovalRecord,
      transitionAction,
    );
    const transitionPolicyDecision = policyEngine.evaluateAction({
      actionId: approvalRequest.id,
      actionType: 'codex.exec.manual.approval',
      actionMode: 'write',
      riskLevel: approvalRequest.riskLevel,
      dryRun: true,
      approvalGranted: true,
      metadata: {
        dryRunPlanHashPresent: Boolean(approvalRequest.dryRunPlanHash),
        policyDecisionHashPresent: Boolean(approvalRequest.policyDecisionHash),
        transitionAllowed: approvalTransition.allowed,
        transitionAction,
        approvalExpired: approvalTransition.state.expired,
        approvalTerminal: approvalTransition.state.terminal,
        liveExecution: false,
        externalProcessStarted: false,
      },
    });

    if (transitionPolicyDecision.outcome === 'deny') {
      const evidenceRefs = createCodexExecControlPlaneEvidenceRefs({
        approvalState: approvalTransition.state,
        approvalTransition,
      });
      const auditEvents = createCodexExecControlPlaneAuditEvents({
        approvalState: approvalTransition.state,
        approvalTransition,
        evidenceRefs,
      });

      return reply.code(409).send({
        error: 'manual approval transition is blocked',
        approvalRequest,
        approvalState: approvalTransition.state,
        approvalTransition,
        policyDecision: transitionPolicyDecision,
        evidenceRefs,
        auditEvents,
        liveExecution: false,
        externalProcessStarted: false,
        executionDisabled: true,
        degraded: persistenceState.status !== 'ok',
        reason: persistenceState.reason,
      });
    }

    const approvalDecision = createCodexExecManualApprovalDecision(approvalRequest, {
      outcome,
      decidedBy: body?.decidedBy,
      reason: body?.reason,
    });
    const approvalArtifact = createCodexExecApprovalArtifactFromDecision(
      record.dryRunPlan,
      record.policyDecision,
      approvalRequest,
      approvalDecision,
    );
    let approvalRecord = {
      ...createCodexExecManualApprovalRecord({
        request: approvalRequest,
        decision: approvalDecision,
        approvalArtifact,
      }),
      id: existingApprovalRecord?.id ?? foundationId('codex_approval_record'),
      createdAt: existingApprovalRecord?.createdAt ?? foundationTimestamp(),
    };
    const approvalState = evaluateCodexExecManualApprovalState(approvalRecord);
    const evidenceRefs = createCodexExecControlPlaneEvidenceRefs({
      approvalDecision,
      approvalState,
      approvalTransition,
      approvalArtifact,
    });
    const auditEvents = createCodexExecControlPlaneAuditEvents({
      approvalDecision,
      approvalState,
      approvalTransition,
      approvalArtifact,
      evidenceRefs,
    });
    approvalRecord = {
      ...approvalRecord,
      status: approvalState.status,
      approvalState,
      evidenceRefs: [...(existingApprovalRecord?.evidenceRefs ?? []), ...evidenceRefs],
      auditEventIds: auditEvents.map((event) => event.id),
    };
    const updatedRunRecord = {
      ...record,
      manualApprovalRequest: approvalRequest,
      manualApprovalDecision: approvalDecision,
      manualApprovalState: approvalState,
      manualApprovalRecord: approvalRecord,
      approvalArtifact: approvalArtifact ?? record.approvalArtifact,
      evidenceRefs: [...record.evidenceRefs, ...evidenceRefs],
      auditEvents: [...record.auditEvents, ...auditEvents],
    };

    await persistCodexExecApprovalRecord(approvalRecord, store);
    await persistCodexExecLiveRunRecord(updatedRunRecord, store, evidenceRefs, auditEvents);

    return {
      approvalRequest,
      approvalDecision,
      approvalState,
      approvalTransition,
      transitionPolicyDecision,
      approvalArtifact,
      approvalRecord,
      evidenceRefs,
      auditEvents,
      liveExecution: false,
      externalProcessStarted: false,
      executionDisabled: true,
      degraded: persistenceState.status !== 'ok',
      reason: persistenceState.reason,
    };
  });

  server.get('/api/codex/exec/approvals', async () => {
    const store = await getStore();
    const records = store
      ? await store.codexExecApprovals.listCodexExecApprovalRecords(10)
      : codexExecApprovalRecords.slice(0, 10);
    const approvals = records.map((record) => ({
      ...record,
      approvalState: evaluateCodexExecManualApprovalState(record),
    }));

    return {
      approvals,
      degraded: persistenceState.status !== 'ok',
      reason: persistenceState.reason,
      metadata: { liveExecution: false, externalProcessStarted: false, executionDisabled: true },
    };
  });

  server.post('/api/codex/exec/evaluate-gate', async (request, reply) => {
    const body = request.body as
      | { dryRunId?: string; approvalArtifact?: CodexExecApprovalArtifact }
      | undefined;
    const store = await getStore();
    const configLoadResult = await getLiveConfigLoadResult();
    const liveConfig = configLoadResult.config;
    const record = await resolveCodexExecLiveRunRecord(body?.dryRunId, store);

    if (!record) {
      return reply.code(404).send({ error: 'dry-run record was not found' });
    }

    const approvalArtifact = body?.approvalArtifact ?? record.approvalArtifact;
    const executionGateResult = evaluateCodexExecExecutionGate(
      record.dryRunPlan,
      record.policyDecision,
      approvalArtifact,
      liveConfig,
    );
    const evidenceRefs = createCodexExecControlPlaneEvidenceRefs({ executionGateResult });
    const auditEvents = createCodexExecControlPlaneAuditEvents({
      executionGateResult,
      evidenceRefs,
    });
    const updatedRecord = {
      ...record,
      approvalArtifact,
      executionGateResult,
      evidenceRefs: [...record.evidenceRefs, ...evidenceRefs],
      auditEvents: [...record.auditEvents, ...auditEvents],
    };

    await persistCodexExecLiveRunRecord(updatedRecord, store, evidenceRefs, auditEvents);

    return {
      executionGateResult,
      evidenceRefs,
      auditEvents,
      liveConfig,
      configLoadResult,
      liveExecution: false,
      externalProcessStarted: false,
      executionDisabled: true,
      degraded: persistenceState.status !== 'ok',
      reason: persistenceState.reason,
    };
  });

  async function resolveCodexExecLiveRunRecord(
    dryRunId: string | undefined,
    store: CodexHubStore | undefined,
  ): Promise<CodexExecLiveRunRecord | undefined> {
    if (!dryRunId) {
      return createDefaultCodexExecLiveRunRecord();
    }

    if (store) {
      return store.codexExecLiveRuns.getCodexExecLiveRunRecord(dryRunId);
    }

    return codexExecLiveRunRecords.find(
      (record) => record.id === dryRunId || record.dryRunPlanId === dryRunId,
    );
  }

  async function persistCodexExecLiveRunRecord(
    record: CodexExecLiveRunRecord,
    store: CodexHubStore | undefined,
    evidenceRefs: CodexExecLiveRunRecord['evidenceRefs'],
    auditEvents: CodexExecLiveRunRecord['auditEvents'],
  ): Promise<void> {
    if (store) {
      for (const evidenceRef of evidenceRefs) {
        await store.evidenceRefs.create(evidenceRef);
      }

      for (const auditEvent of auditEvents) {
        await store.auditEvents.append(auditEvent);
      }

      await store.codexExecLiveRuns.saveCodexExecLiveRunRecord(record);
      return;
    }

    const existingIndex = codexExecLiveRunRecords.findIndex(
      (candidate) => candidate.id === record.id,
    );

    if (existingIndex >= 0) {
      codexExecLiveRunRecords.splice(existingIndex, 1, record);
    } else {
      codexExecLiveRunRecords.unshift(record);
    }
  }

  async function resolveCodexExecApprovalRecord(
    approvalRequestId: string | undefined,
    store: CodexHubStore | undefined,
  ): Promise<CodexExecManualApprovalRecord | undefined> {
    if (!approvalRequestId) {
      return undefined;
    }

    if (store) {
      const byId = await store.codexExecApprovals.getCodexExecApprovalRecord(approvalRequestId);

      if (byId) {
        return byId;
      }

      const records = await store.codexExecApprovals.listCodexExecApprovalRecords(50);
      return records.find((record) => record.request.id === approvalRequestId);
    }

    return codexExecApprovalRecords.find(
      (record) => record.id === approvalRequestId || record.request.id === approvalRequestId,
    );
  }

  async function persistCodexExecApprovalRecord(
    record: CodexExecManualApprovalRecord,
    store: CodexHubStore | undefined,
  ): Promise<void> {
    if (store) {
      await store.codexExecApprovals.saveCodexExecApprovalRecord(record);
      return;
    }

    const existingIndex = codexExecApprovalRecords.findIndex(
      (candidate) => candidate.id === record.id || candidate.request.id === record.request.id,
    );

    if (existingIndex >= 0) {
      codexExecApprovalRecords.splice(existingIndex, 1, record);
    } else {
      codexExecApprovalRecords.unshift(record);
    }
  }

  function approvalActionForOutcome(
    outcome: CodexExecApprovalDecisionOutcome,
  ): 'approve' | 'deny' | 'revoke' {
    if (outcome === 'approved') {
      return 'approve';
    }

    if (outcome === 'denied') {
      return 'deny';
    }

    return 'revoke';
  }

  function createDefaultCodexExecLiveRunRecord(): CodexExecLiveRunRecord {
    const intent = createCodexExecExecutionIntent({
      title: 'Default Codex dry-run control-plane record',
      prompt: 'Default control-plane preflight request',
      cwd: '.',
      sandboxMode: 'read_only',
      approvalMode: 'required',
      metadata: { requestedBy: 'supervisor-default' },
    });
    const dryRunPlan = createCodexExecDryRunPlan(intent);
    const policyDecision = evaluateCodexExecDryRunPolicy(dryRunPlan, policyEngine);

    return createCodexExecDisabledLiveRunRecord(
      dryRunPlan,
      policyDecision,
      'live adapter disabled in supervisor default control-plane record',
    );
  }

  return server;
}

function resolveAllowedFixture(
  fixturePath: string,
): { allowed: true; path: string; fixturePath: string } | { allowed: false; reason: string } {
  if (isAbsolute(fixturePath)) {
    return { allowed: false, reason: 'fixturePath must be a repository-relative fixture path' };
  }

  if (fixturePath.split(/[\\/]+/).includes('..')) {
    return { allowed: false, reason: 'fixturePath cannot contain traversal segments' };
  }

  const workspaceRoot = findWorkspaceRoot(process.cwd());
  const fixturesRoot = resolve(workspaceRoot, 'packages', 'codex-kernel', 'fixtures');
  const requestedPath = resolve(workspaceRoot, fixturePath);

  if (!isPathInside(requestedPath, fixturesRoot) || extname(requestedPath) !== '.jsonl') {
    return {
      allowed: false,
      reason: 'fixturePath must point to packages/codex-kernel/fixtures/*.jsonl',
    };
  }

  return {
    allowed: true,
    path: requestedPath,
    fixturePath: toWorkspacePath(requestedPath, workspaceRoot),
  };
}

function resolveAllowedCwd(
  requestedCwd: string,
): { allowed: true; path: string; cwd: string } | { allowed: false; reason: string } {
  if (requestedCwd.split(/[\\/]+/).includes('..')) {
    return { allowed: false, reason: 'cwd cannot contain traversal segments' };
  }

  const workspaceRoot = findWorkspaceRoot(process.cwd());
  const requestedPath = isAbsolute(requestedCwd)
    ? resolve(requestedCwd)
    : resolve(workspaceRoot, requestedCwd);

  if (requestedPath !== workspaceRoot && !isPathInside(requestedPath, workspaceRoot)) {
    return { allowed: false, reason: 'cwd must stay within the repository root' };
  }

  return {
    allowed: true,
    path: requestedPath,
    cwd: requestedPath === workspaceRoot ? '.' : toWorkspacePath(requestedPath, workspaceRoot),
  };
}

function findWorkspaceRoot(startDirectory: string): string {
  let current = resolve(startDirectory);
  const root = parse(current).root;

  while (true) {
    if (existsSync(resolve(current, 'pnpm-workspace.yaml'))) {
      return current;
    }

    const parent = dirname(current);

    if (parent === current || current === root) {
      return resolve(startDirectory);
    }

    current = parent;
  }
}

function isPathInside(path: string, root: string): boolean {
  const relativePath = relative(root, path);
  return (
    relativePath.length > 0 && !relativePath.startsWith('..') && !relativePath.includes(`..${sep}`)
  );
}

function toWorkspacePath(path: string, workspaceRoot: string): string {
  return relative(workspaceRoot, path).split(sep).join('/');
}

function recordToSummary(record: CodexReplayRecord): CodexExecReplaySummary {
  return {
    id: record.id,
    schemaVersion: record.schemaVersion,
    createdAt: record.createdAt,
    sourceKind: record.sourceKind,
    fixturePath: record.fixturePath,
    threadId: record.threadId,
    status: record.status,
    summary: record.summary,
    replayHash: record.replayHash,
    eventCount: record.eventCount,
    itemCount: record.itemCount,
    commandExecutionCount: record.commandExecutionCount,
    fileChangeCount: record.fileChangeCount,
    mcpToolCallCount: record.mcpToolCallCount,
    webSearchCount: record.webSearchCount,
    errorCount: record.errorCount,
    evidenceCount: record.evidenceRefs.length,
    auditEventCount: record.auditEventIds.length,
    mockOnly: record.mockOnly,
    liveExecution: record.liveExecution,
    externalProcessStarted: record.externalProcessStarted,
    metadata: record.metadata,
  };
}

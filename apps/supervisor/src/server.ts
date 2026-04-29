import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { dirname, extname, isAbsolute, parse, relative, resolve, sep } from 'node:path';
import Fastify from 'fastify';
import {
  createCodexExecApprovalArtifactFromDecision,
  createCodexExecApprovalTransitionResult,
  buildControlPlaneDrilldownView,
  createCodexExecControlPlaneTimeline,
  buildCodexExecControlPlaneReport,
  buildCodexExecGovernanceReviewPackage,
  buildCodexExecReportReviewHistory,
  buildCodexExecReviewerHandoffSummary,
  compareCodexExecReportReviews,
  createCodexExecTimelineDetailView,
  createCodexExecReportReviewRecord,
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
  parseCodexExecLiveConfigFile,
  createCodexReplayRecord,
  getAuditDetail,
  getEvidenceDetail,
  replayCodexExecFixture,
  runCodexExecPreflight,
  searchAuditEvents,
  searchEvidence,
  renderCodexExecControlPlaneReportJson,
  renderCodexExecControlPlaneReportMarkdown,
  getLatestCodexExecReportReview,
  summarizeCodexExecReportReview,
  listCodexExecReportReviewSummaries,
  summarizeCodexExecReplay,
} from '@codexhub/codex-kernel';
import type {
  CodexExecApprovalArtifact,
  CodexExecApprovalDecisionOutcome,
  CodexExecApprovalMode,
  CodexExecConfigLoadResult,
  CodexExecEvidenceQuery,
  CodexExecAuditQuery,
  CodexExecControlPlaneReportFormat,
  CodexExecLiveRunRecord,
  CodexExecManualApprovalRecord,
  CodexExecReportRecommendation,
  CodexExecReportReviewQuery,
  CodexExecReportReviewRecord,
  CodexExecReportReviewStatus,
  CodexExecSandboxMode,
  CodexExecTimelineFilter,
  CodexReplaySummary,
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
  const codexReportReviewRecords: CodexExecReportReviewRecord[] = [];
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

  server.post('/api/codex/exec/approval-artifact', async (_request, reply) => {
    return reply.code(410).send({
      error:
        'approval-artifact creation is deprecated; use manual approval request and decision endpoints',
      strategy: 'deprecated-gone',
      liveExecution: false,
      externalProcessStarted: false,
      executionDisabled: true,
      degraded: persistenceState.status !== 'ok',
      reason: persistenceState.reason,
    });
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

  server.get('/api/codex/exec/timeline/:dryRunId', async (request, reply) => {
    const params = request.params as { dryRunId?: string };
    const filterResult = parseTimelineFilter(request.query);

    if (!params.dryRunId) {
      return reply.code(400).send({ error: 'dryRunId is required' });
    }

    if (!filterResult.allowed) {
      return reply.code(400).send({ error: filterResult.reason });
    }

    const store = await getStore();
    const record = await resolveCodexExecLiveRunRecord(params.dryRunId, store);

    if (!record) {
      return reply.code(404).send({ error: 'dry-run record was not found' });
    }

    const approvalRecords = await resolveCodexExecApprovalRecordsForDryRun(
      record.dryRunPlanId,
      store,
    );
    const timeline = createCodexExecControlPlaneTimeline({
      record,
      approvalRecords,
      filter: filterResult.filter,
    });

    return {
      timeline,
      query: {
        dryRunId: params.dryRunId,
        filter: filterResult.filter,
      },
      liveExecution: false,
      externalProcessStarted: false,
      executionDisabled: true,
      degraded: persistenceState.status !== 'ok',
      reason: persistenceState.reason,
    };
  });

  server.get('/api/codex/exec/timeline/:dryRunId/detail', async (request, reply) => {
    const params = request.params as { dryRunId?: string };
    const filterResult = parseTimelineFilter(request.query);

    if (!params.dryRunId) {
      return reply.code(400).send({ error: 'dryRunId is required' });
    }

    if (!filterResult.allowed) {
      return reply.code(400).send({ error: filterResult.reason });
    }

    const store = await getStore();
    const record = await resolveCodexExecLiveRunRecord(params.dryRunId, store);

    if (!record) {
      return reply.code(404).send({ error: 'dry-run record was not found' });
    }

    const approvalRecords = await resolveCodexExecApprovalRecordsForDryRun(
      record.dryRunPlanId,
      store,
    );
    const detail = createCodexExecTimelineDetailView({
      record,
      approvalRecords,
      filter: filterResult.filter,
    });

    return {
      detail,
      query: {
        dryRunId: params.dryRunId,
        filter: filterResult.filter,
      },
      liveExecution: false,
      externalProcessStarted: false,
      executionDisabled: true,
      degraded: persistenceState.status !== 'ok',
      reason: persistenceState.reason,
    };
  });

  server.get('/api/codex/exec/evidence/:evidenceId', async (request, reply) => {
    const params = request.params as { evidenceId?: string };

    if (!params.evidenceId) {
      return reply.code(400).send({ error: 'evidenceId is required' });
    }

    const store = await getStore();
    const records = await resolveCodexExecLiveRunRecords(store);
    const evidenceRef = store
      ? await store.evidenceRefs.getEvidenceRef(params.evidenceId)
      : undefined;
    const auditEvents = store ? await store.auditEvents.listAuditEvents({ limit: 100 }) : [];
    const detail = getEvidenceDetail({
      evidenceRefId: params.evidenceId,
      records,
      evidenceRefs: evidenceRef ? [evidenceRef] : undefined,
      auditEvents,
    });

    if (detail.status === 'not_found') {
      return reply.code(404).send({
        detail,
        error: 'evidence ref was not found',
        liveExecution: false,
        externalProcessStarted: false,
        executionDisabled: true,
        degraded: persistenceState.status !== 'ok',
        reason: persistenceState.reason,
      });
    }

    return {
      detail,
      liveExecution: false,
      externalProcessStarted: false,
      executionDisabled: true,
      degraded: persistenceState.status !== 'ok',
      reason: persistenceState.reason,
    };
  });

  server.get('/api/codex/exec/evidence', async (request, reply) => {
    const queryResult = parseEvidenceQuery(request.query);

    if (!queryResult.allowed) {
      return reply.code(400).send({ error: queryResult.reason });
    }

    const store = await getStore();
    const records = await resolveCodexExecLiveRunRecords(store);
    const evidenceRefs = store
      ? await store.evidenceRefs.listEvidenceRefs(queryResult.query)
      : undefined;
    const auditEvents = store
      ? await store.auditEvents.listAuditEvents({
          dryRunId: queryResult.query.dryRunId,
          limit: queryResult.query.limit,
        })
      : undefined;
    const result = searchEvidence({
      query: queryResult.query,
      records,
      evidenceRefs,
      auditEvents,
    });

    return {
      result,
      liveExecution: false,
      externalProcessStarted: false,
      executionDisabled: true,
      degraded: persistenceState.status !== 'ok',
      reason: persistenceState.reason,
    };
  });

  server.get('/api/codex/exec/audit/:auditEventId', async (request, reply) => {
    const params = request.params as { auditEventId?: string };

    if (!params.auditEventId) {
      return reply.code(400).send({ error: 'auditEventId is required' });
    }

    const store = await getStore();
    const records = await resolveCodexExecLiveRunRecords(store);
    const auditEvent = store
      ? await store.auditEvents.getAuditEvent(params.auditEventId)
      : undefined;
    const detail = getAuditDetail({
      auditEventId: params.auditEventId,
      records,
      auditEvents: auditEvent ? [auditEvent] : undefined,
    });

    if (detail.status === 'not_found') {
      return reply.code(404).send({
        detail,
        error: 'audit event was not found',
        liveExecution: false,
        externalProcessStarted: false,
        executionDisabled: true,
        degraded: persistenceState.status !== 'ok',
        reason: persistenceState.reason,
      });
    }

    return {
      detail,
      liveExecution: false,
      externalProcessStarted: false,
      executionDisabled: true,
      degraded: persistenceState.status !== 'ok',
      reason: persistenceState.reason,
    };
  });

  server.get('/api/codex/exec/audit', async (request, reply) => {
    const queryResult = parseAuditQuery(request.query);

    if (!queryResult.allowed) {
      return reply.code(400).send({ error: queryResult.reason });
    }

    const store = await getStore();
    const records = await resolveCodexExecLiveRunRecords(store);
    const auditEvents = store
      ? await store.auditEvents.listAuditEvents(queryResult.query)
      : undefined;
    const result = searchAuditEvents({
      query: queryResult.query,
      records,
      auditEvents,
    });

    return {
      result,
      liveExecution: false,
      externalProcessStarted: false,
      executionDisabled: true,
      degraded: persistenceState.status !== 'ok',
      reason: persistenceState.reason,
    };
  });

  server.get('/api/codex/exec/drilldown/:dryRunId', async (request, reply) => {
    const params = request.params as { dryRunId?: string };

    if (!params.dryRunId) {
      return reply.code(400).send({ error: 'dryRunId is required' });
    }

    const store = await getStore();
    const record = await resolveCodexExecLiveRunRecord(params.dryRunId, store);
    const records = record ? [record] : await resolveCodexExecLiveRunRecords(store);
    const evidenceRefs = store
      ? await store.evidenceRefs.listEvidenceRefs({ dryRunId: params.dryRunId, limit: 100 })
      : undefined;
    const auditEvents = store
      ? await store.auditEvents.listAuditEvents({ dryRunId: params.dryRunId, limit: 100 })
      : undefined;
    const approvalRecords = await resolveCodexExecApprovalRecordsForDryRun(
      record?.dryRunPlanId ?? params.dryRunId,
      store,
    );
    const drilldown = buildControlPlaneDrilldownView({
      dryRunId: params.dryRunId,
      records,
      approvalRecords,
      evidenceRefs,
      auditEvents,
    });

    if (drilldown.status === 'not_found') {
      return reply.code(404).send({
        drilldown,
        error: 'dry-run record was not found',
        liveExecution: false,
        externalProcessStarted: false,
        executionDisabled: true,
        degraded: persistenceState.status !== 'ok',
        reason: persistenceState.reason,
      });
    }

    return {
      drilldown,
      liveExecution: false,
      externalProcessStarted: false,
      executionDisabled: true,
      degraded: persistenceState.status !== 'ok',
      reason: persistenceState.reason,
    };
  });

  server.get('/api/codex/exec/report/:dryRunId', async (request, reply) => {
    const params = request.params as { dryRunId?: string };
    const queryResult = parseReportQuery(request.query);

    if (!params.dryRunId) {
      return reply.code(400).send({ error: 'dryRunId is required' });
    }

    if (!queryResult.allowed) {
      return reply.code(400).send({ error: queryResult.reason });
    }

    const store = await getStore();
    const record = await resolveCodexExecLiveRunRecord(params.dryRunId, store);
    const records = record ? [record] : await resolveCodexExecLiveRunRecords(store);
    const evidenceRefs =
      store && queryResult.includeEvidence
        ? await store.evidenceRefs.listEvidenceRefs({ dryRunId: params.dryRunId, limit: 100 })
        : undefined;
    const auditEvents =
      store && queryResult.includeAudit
        ? await store.auditEvents.listAuditEvents({ dryRunId: params.dryRunId, limit: 100 })
        : undefined;
    const approvalRecords = await resolveCodexExecApprovalRecordsForDryRun(
      record?.dryRunPlanId ?? params.dryRunId,
      store,
    );
    const report = buildCodexExecControlPlaneReport({
      dryRunId: params.dryRunId,
      record,
      records,
      approvalRecords,
      evidenceRefs,
      auditEvents,
      format: queryResult.format,
      includeEvidence: queryResult.includeEvidence,
      includeAudit: queryResult.includeAudit,
      degraded: persistenceState.status !== 'ok',
      reason: persistenceState.reason,
    });
    const exportResult =
      queryResult.format === 'markdown'
        ? renderCodexExecControlPlaneReportMarkdown(report)
        : renderCodexExecControlPlaneReportJson(report);
    const responseBody = {
      report,
      exportResult,
      renderedContent: exportResult.renderedContent,
      liveExecution: false,
      externalProcessStarted: false,
      executionDisabled: true,
      degraded: persistenceState.status !== 'ok',
      reason: persistenceState.reason,
    };

    if (report.status === 'not_found') {
      return reply.code(404).send({
        ...responseBody,
        error: 'dry-run record was not found',
      });
    }

    return responseBody;
  });

  server.post('/api/codex/exec/report-review', async (request, reply) => {
    const body = request.body as
      | {
          dryRunId?: string;
          reviewerLabel?: string;
          status?: CodexExecReportReviewStatus;
          recommendation?: CodexExecReportRecommendation;
          notesSummary?: string;
        }
      | undefined;

    if (!body?.dryRunId) {
      return reply.code(400).send({ error: 'dryRunId is required' });
    }

    if (body.status && !reportReviewStatuses.has(body.status)) {
      return reply.code(400).send({ error: 'unsupported report review status' });
    }

    if (body.recommendation && !reportReviewRecommendations.has(body.recommendation)) {
      return reply.code(400).send({ error: 'unsupported report review recommendation' });
    }

    const store = await getStore();
    const record = await resolveCodexExecLiveRunRecord(body.dryRunId, store);

    if (!record) {
      const safeReview = createCodexExecReportReviewRecord({
        dryRunId: body.dryRunId,
        reviewerLabel: body.reviewerLabel,
        status: 'rejected',
        recommendation: 'no_go',
        notesSummary: 'Dry-run record was not found; review cannot grant execution.',
      });

      return reply.code(404).send({
        error: 'dry-run record was not found',
        reviewRecord: safeReview,
        summary: summarizeCodexExecReportReview(safeReview),
        liveExecution: false,
        externalProcessStarted: false,
        executionDisabled: true,
        degraded: persistenceState.status !== 'ok',
        reason: persistenceState.reason,
      });
    }

    const evidenceRefs = store
      ? await store.evidenceRefs.listEvidenceRefs({ dryRunId: record.dryRunPlanId, limit: 100 })
      : undefined;
    const auditEvents = store
      ? await store.auditEvents.listAuditEvents({ dryRunId: record.dryRunPlanId, limit: 100 })
      : undefined;
    const approvalRecords = await resolveCodexExecApprovalRecordsForDryRun(
      record.dryRunPlanId,
      store,
    );
    const report = buildCodexExecControlPlaneReport({
      dryRunId: record.dryRunPlanId,
      record,
      approvalRecords,
      evidenceRefs,
      auditEvents,
      format: 'json',
      includeEvidence: true,
      includeAudit: true,
      degraded: persistenceState.status !== 'ok',
      reason: persistenceState.reason,
    });
    const reviewRecord = createCodexExecReportReviewRecord({
      report,
      reviewerLabel: body.reviewerLabel,
      status: body.status ?? 'reviewed',
      recommendation: body.recommendation,
      notesSummary: body.notesSummary,
    });

    await persistCodexReportReviewRecord(reviewRecord, store);

    return {
      reviewRecord,
      summary: summarizeCodexExecReportReview(reviewRecord),
      reportSummary: report.summary,
      recommendationGrantsExecution: false,
      liveExecution: false,
      externalProcessStarted: false,
      executionDisabled: true,
      degraded: persistenceState.status !== 'ok',
      reason: persistenceState.reason,
    };
  });

  server.get('/api/codex/exec/report-review/:reviewId', async (request, reply) => {
    const params = request.params as { reviewId?: string };

    if (!params.reviewId) {
      return reply.code(400).send({ error: 'reviewId is required' });
    }

    const store = await getStore();
    const reviewRecord = await resolveCodexReportReviewRecord(params.reviewId, store);

    if (!reviewRecord) {
      return reply.code(404).send({
        error: 'report review was not found',
        liveExecution: false,
        externalProcessStarted: false,
        executionDisabled: true,
        degraded: persistenceState.status !== 'ok',
        reason: persistenceState.reason,
      });
    }

    return {
      reviewRecord,
      summary: summarizeCodexExecReportReview(reviewRecord),
      recommendationGrantsExecution: false,
      liveExecution: false,
      externalProcessStarted: false,
      executionDisabled: true,
      degraded: persistenceState.status !== 'ok',
      reason: persistenceState.reason,
    };
  });

  server.get('/api/codex/exec/report-reviews', async (request, reply) => {
    const queryResult = parseReportReviewQuery(request.query);

    if (!queryResult.allowed) {
      return reply.code(400).send({ error: queryResult.reason });
    }

    const store = await getStore();
    const reviews = store
      ? await store.codexReportReviews.listReportReviews(queryResult.query)
      : filterInMemoryReportReviews(codexReportReviewRecords, queryResult.query);

    return {
      reviews,
      summaries: listCodexExecReportReviewSummaries(reviews, queryResult.query),
      recommendationGrantsExecution: false,
      liveExecution: false,
      externalProcessStarted: false,
      executionDisabled: true,
      degraded: persistenceState.status !== 'ok',
      reason: persistenceState.reason,
    };
  });

  server.get('/api/codex/exec/report-reviews/latest/:dryRunId', async (request, reply) => {
    const params = request.params as { dryRunId?: string };

    if (!params.dryRunId) {
      return reply.code(400).send({ error: 'dryRunId is required' });
    }

    const store = await getStore();
    const reviews = await listCodexReportReviewsForQuery(store, {
      dryRunId: params.dryRunId,
      limit: 200,
    });
    const reviewRecord = getLatestCodexExecReportReview(reviews, params.dryRunId);

    if (!reviewRecord) {
      return reply.code(404).send({
        error: 'latest report review was not found',
        liveExecution: false,
        externalProcessStarted: false,
        executionDisabled: true,
        degraded: persistenceState.status !== 'ok',
        reason: persistenceState.reason,
      });
    }

    return {
      reviewRecord,
      summary: summarizeCodexExecReportReview(reviewRecord),
      recommendationGrantsExecution: false,
      liveExecution: false,
      externalProcessStarted: false,
      executionDisabled: true,
      degraded: persistenceState.status !== 'ok',
      reason: persistenceState.reason,
    };
  });

  server.get('/api/codex/exec/report-reviews/history', async (request, reply) => {
    const queryResult = parseReportReviewQuery(request.query);

    if (!queryResult.allowed) {
      return reply.code(400).send({ error: queryResult.reason });
    }

    const store = await getStore();
    const reviews = await listCodexReportReviewsForQuery(store, queryResult.query);
    const history = buildCodexExecReportReviewHistory(reviews, queryResult.query);

    return {
      history,
      recommendationGrantsExecution: false,
      liveExecution: false,
      externalProcessStarted: false,
      executionDisabled: true,
      degraded: persistenceState.status !== 'ok',
      reason: persistenceState.reason,
    };
  });

  server.get('/api/codex/exec/report-reviews/compare', async (request, reply) => {
    const leftReviewId = readQueryValue(request.query, 'leftReviewId');
    const rightReviewId = readQueryValue(request.query, 'rightReviewId');

    if (!leftReviewId || !rightReviewId) {
      return reply.code(400).send({ error: 'leftReviewId and rightReviewId are required' });
    }

    const store = await getStore();
    const left = await resolveCodexReportReviewRecord(leftReviewId, store);
    const right = await resolveCodexReportReviewRecord(rightReviewId, store);

    if (!left || !right) {
      return reply.code(404).send({
        error: 'one or more report reviews were not found',
        liveExecution: false,
        externalProcessStarted: false,
        executionDisabled: true,
        degraded: persistenceState.status !== 'ok',
        reason: persistenceState.reason,
      });
    }

    return {
      comparison: compareCodexExecReportReviews(left, right),
      recommendationGrantsExecution: false,
      liveExecution: false,
      externalProcessStarted: false,
      executionDisabled: true,
      degraded: persistenceState.status !== 'ok',
      reason: persistenceState.reason,
    };
  });

  server.get('/api/codex/exec/report-reviews/handoff/:dryRunId', async (request, reply) => {
    const params = request.params as { dryRunId?: string };
    const fromReviewer = readQueryValue(request.query, 'fromReviewer');
    const toReviewer = readQueryValue(request.query, 'toReviewer');

    if (!params.dryRunId) {
      return reply.code(400).send({ error: 'dryRunId is required' });
    }

    const store = await getStore();
    const reviews = await listCodexReportReviewsForQuery(store, {
      dryRunId: params.dryRunId,
      limit: 200,
    });

    if (reviews.length === 0) {
      return reply.code(404).send({
        error: 'report review history was not found',
        liveExecution: false,
        externalProcessStarted: false,
        executionDisabled: true,
        degraded: persistenceState.status !== 'ok',
        reason: persistenceState.reason,
      });
    }

    return {
      handoff: buildCodexExecReviewerHandoffSummary(reviews, params.dryRunId, {
        fromReviewer,
        toReviewer,
      }),
      recommendationGrantsExecution: false,
      liveExecution: false,
      externalProcessStarted: false,
      executionDisabled: true,
      degraded: persistenceState.status !== 'ok',
      reason: persistenceState.reason,
    };
  });

  server.get('/api/codex/exec/governance-package/:dryRunId', async (request, reply) => {
    const params = request.params as { dryRunId?: string };
    const queryResult = parseReportQuery(request.query);

    if (!params.dryRunId) {
      return reply.code(400).send({
        error: 'dryRunId is required',
        liveExecution: false,
        externalProcessStarted: false,
        executionDisabled: true,
      });
    }

    if (!queryResult.allowed) {
      return reply.code(400).send({
        error: queryResult.reason,
        liveExecution: false,
        externalProcessStarted: false,
        executionDisabled: true,
      });
    }

    const store = await getStore();
    const record = await resolveCodexExecLiveRunRecord(params.dryRunId, store);
    const dryRunId = record?.dryRunPlanId ?? params.dryRunId;
    const approvalRecords = await resolveCodexExecApprovalRecordsForDryRun(dryRunId, store);
    const reportReviews = await listCodexReportReviewsForQuery(store, { dryRunId, limit: 200 });
    const evidenceRefs =
      store && queryResult.includeEvidence
        ? await store.evidenceRefs.listEvidenceRefs({ dryRunId, limit: 100 })
        : undefined;
    const auditEvents =
      store && queryResult.includeAudit
        ? await store.auditEvents.listAuditEvents({ dryRunId, limit: 100 })
        : undefined;
    const governancePackage = buildCodexExecGovernanceReviewPackage({
      dryRunId,
      record,
      records: record ? [record] : [],
      approvalRecords,
      evidenceRefs,
      auditEvents,
      reportReviews,
      includeEvidence: queryResult.includeEvidence,
      includeAudit: queryResult.includeAudit,
      degraded: persistenceState.status !== 'ok',
      reason: persistenceState.reason,
    });

    return reply.code(governancePackage.status === 'not_found' ? 404 : 200).send({
      governancePackage,
      recommendationGrantsExecution: false,
      liveExecution: false,
      externalProcessStarted: false,
      executionDisabled: true,
      degraded: persistenceState.status !== 'ok',
      reason: persistenceState.reason,
    });
  });

  async function resolveCodexExecLiveRunRecord(
    dryRunId: string | undefined,
    store: CodexHubStore | undefined,
  ): Promise<CodexExecLiveRunRecord | undefined> {
    if (!dryRunId) {
      return createDefaultCodexExecLiveRunRecord();
    }

    if (store) {
      const byId = await store.codexExecLiveRuns.getCodexExecLiveRunRecord(dryRunId);

      if (byId) {
        return byId;
      }

      const records = await store.codexExecLiveRuns.listCodexExecLiveRunRecords(50);
      return records.find((record) => record.dryRunPlanId === dryRunId);
    }

    return codexExecLiveRunRecords.find(
      (record) => record.id === dryRunId || record.dryRunPlanId === dryRunId,
    );
  }

  async function resolveCodexExecLiveRunRecords(
    store: CodexHubStore | undefined,
  ): Promise<CodexExecLiveRunRecord[]> {
    return store
      ? await store.codexExecLiveRuns.listCodexExecLiveRunRecords(100)
      : codexExecLiveRunRecords.slice(0, 100);
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

  async function resolveCodexExecApprovalRecordsForDryRun(
    dryRunId: string,
    store: CodexHubStore | undefined,
  ): Promise<CodexExecManualApprovalRecord[]> {
    const records = store
      ? await store.codexExecApprovals.listCodexExecApprovalRecords(50)
      : codexExecApprovalRecords;

    return records.filter((record) => record.request.dryRunPlanId === dryRunId);
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

  async function resolveCodexReportReviewRecord(
    reviewId: string,
    store: CodexHubStore | undefined,
  ): Promise<CodexExecReportReviewRecord | undefined> {
    return store
      ? await store.codexReportReviews.getReportReview(reviewId)
      : codexReportReviewRecords.find((record) => record.id === reviewId);
  }

  async function listCodexReportReviewsForQuery(
    store: CodexHubStore | undefined,
    query: Partial<CodexExecReportReviewQuery>,
  ): Promise<CodexExecReportReviewRecord[]> {
    return store
      ? await store.codexReportReviews.listReportReviews(query)
      : filterInMemoryReportReviews(codexReportReviewRecords, query);
  }

  async function persistCodexReportReviewRecord(
    record: CodexExecReportReviewRecord,
    store: CodexHubStore | undefined,
  ): Promise<void> {
    if (store) {
      await store.codexReportReviews.saveReportReview(record);
      return;
    }

    const existingIndex = codexReportReviewRecords.findIndex(
      (candidate) => candidate.id === record.id,
    );

    if (existingIndex >= 0) {
      codexReportReviewRecords.splice(existingIndex, 1, record);
    } else {
      codexReportReviewRecords.unshift(record);
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

const timelineSources = new Set([
  'config',
  'dry_run',
  'command_preview',
  'policy',
  'preflight',
  'approval',
  'approval_request',
  'approval_decision',
  'approval_state',
  'approval_artifact',
  'gate',
  'evidence',
  'audit',
]);
const evidenceKinds = new Set([
  'log',
  'hash',
  'snapshot',
  'dry-run',
  'audit',
  'codex.exec.jsonl.replay',
  'codex.exec.event.summary',
  'codex.exec.dry_run_plan',
  'codex.exec.command_preview',
  'codex.exec.policy_decision',
  'codex.exec.preflight_result',
  'codex.exec.approval_artifact',
  'codex.exec.execution_gate_result',
  'codex.exec.live_config',
  'codex.exec.approval_request',
  'codex.exec.approval_decision',
  'codex.exec.approval_state',
]);
const reportReviewStatuses = new Set([
  'draft',
  'reviewed',
  'changes_requested',
  'rejected',
  'archived',
]);
const reportReviewRecommendations = new Set([
  'no_go',
  'needs_changes',
  'ready_for_adr',
  'ready_for_read_only_live_review',
]);

function parseTimelineFilter(
  query: unknown,
): { allowed: true; filter: CodexExecTimelineFilter } | { allowed: false; reason: string } {
  const source = readQueryValue(query, 'source');
  const status = readQueryValue(query, 'status');
  const limitValue = readQueryValue(query, 'limit');
  const includeEvidenceValue = readQueryValue(query, 'includeEvidence');
  const includeAuditValue = readQueryValue(query, 'includeAudit');
  const filter: CodexExecTimelineFilter = {
    includeEvidence: true,
    includeAudit: true,
  };

  if (source) {
    if (!timelineSources.has(source)) {
      return { allowed: false, reason: 'unsupported timeline source filter' };
    }

    filter.source = source as CodexExecTimelineFilter['source'];
  }

  if (status) {
    filter.status = status;
  }

  if (limitValue) {
    const limit = Number.parseInt(limitValue, 10);

    if (!Number.isInteger(limit) || limit <= 0 || limit > 200) {
      return { allowed: false, reason: 'limit must be an integer from 1 to 200' };
    }

    filter.limit = limit;
  }

  if (includeEvidenceValue !== undefined) {
    const parsed = parseBooleanQueryValue(includeEvidenceValue);

    if (parsed === undefined) {
      return { allowed: false, reason: 'includeEvidence must be true or false' };
    }

    filter.includeEvidence = parsed;
  }

  if (includeAuditValue !== undefined) {
    const parsed = parseBooleanQueryValue(includeAuditValue);

    if (parsed === undefined) {
      return { allowed: false, reason: 'includeAudit must be true or false' };
    }

    filter.includeAudit = parsed;
  }

  return { allowed: true, filter };
}

function parseEvidenceQuery(
  query: unknown,
): { allowed: true; query: Partial<CodexExecEvidenceQuery> } | { allowed: false; reason: string } {
  const dryRunId = readQueryValue(query, 'dryRunId');
  const kind = readQueryValue(query, 'kind');
  const limitResult = parseLimitQueryValue(readQueryValue(query, 'limit'));

  if (!limitResult.allowed) {
    return limitResult;
  }

  if (kind && !evidenceKinds.has(kind)) {
    return { allowed: false, reason: 'unsupported evidence kind filter' };
  }

  return {
    allowed: true,
    query: {
      dryRunId,
      kind: kind as CodexExecEvidenceQuery['kind'],
      limit: limitResult.limit,
    },
  };
}

function parseAuditQuery(
  query: unknown,
): { allowed: true; query: Partial<CodexExecAuditQuery> } | { allowed: false; reason: string } {
  const dryRunId = readQueryValue(query, 'dryRunId');
  const action = readQueryValue(query, 'action');
  const limitResult = parseLimitQueryValue(readQueryValue(query, 'limit'));

  if (!limitResult.allowed) {
    return limitResult;
  }

  return {
    allowed: true,
    query: {
      dryRunId,
      action,
      limit: limitResult.limit,
    },
  };
}

function parseReportQuery(query: unknown):
  | {
      allowed: true;
      format: CodexExecControlPlaneReportFormat;
      includeEvidence: boolean;
      includeAudit: boolean;
    }
  | { allowed: false; reason: string } {
  const formatValue = readQueryValue(query, 'format');
  const includeEvidenceValue = readQueryValue(query, 'includeEvidence');
  const includeAuditValue = readQueryValue(query, 'includeAudit');
  const format = formatValue ?? 'json';

  if (format !== 'json' && format !== 'markdown') {
    return { allowed: false, reason: 'format must be json or markdown' };
  }

  const includeEvidence =
    includeEvidenceValue === undefined ? true : parseBooleanQueryValue(includeEvidenceValue);
  const includeAudit =
    includeAuditValue === undefined ? true : parseBooleanQueryValue(includeAuditValue);

  if (includeEvidence === undefined) {
    return { allowed: false, reason: 'includeEvidence must be true or false' };
  }

  if (includeAudit === undefined) {
    return { allowed: false, reason: 'includeAudit must be true or false' };
  }

  return {
    allowed: true,
    format,
    includeEvidence,
    includeAudit,
  };
}

function parseReportReviewQuery(
  query: unknown,
):
  | { allowed: true; query: Partial<CodexExecReportReviewQuery> }
  | { allowed: false; reason: string } {
  const dryRunId = readQueryValue(query, 'dryRunId');
  const status = readQueryValue(query, 'status');
  const recommendation = readQueryValue(query, 'recommendation');
  const limitResult = parseLimitQueryValue(readQueryValue(query, 'limit'));

  if (!limitResult.allowed) {
    return limitResult;
  }

  if (status && !reportReviewStatuses.has(status)) {
    return { allowed: false, reason: 'unsupported report review status' };
  }

  if (recommendation && !reportReviewRecommendations.has(recommendation)) {
    return { allowed: false, reason: 'unsupported report review recommendation' };
  }

  return {
    allowed: true,
    query: {
      dryRunId,
      status: status as CodexExecReportReviewStatus | undefined,
      recommendation: recommendation as CodexExecReportRecommendation | undefined,
      limit: limitResult.limit,
    },
  };
}

function filterInMemoryReportReviews(
  records: CodexExecReportReviewRecord[],
  query: Partial<CodexExecReportReviewQuery>,
): CodexExecReportReviewRecord[] {
  return records
    .filter((record) => {
      if (query.dryRunId && record.dryRunId !== query.dryRunId) {
        return false;
      }

      if (query.status && record.status !== query.status) {
        return false;
      }

      if (query.recommendation && record.recommendation !== query.recommendation) {
        return false;
      }

      return true;
    })
    .slice(0, query.limit ?? 20);
}

function parseLimitQueryValue(
  value: string | undefined,
): { allowed: true; limit: number | undefined } | { allowed: false; reason: string } {
  if (!value) {
    return { allowed: true, limit: undefined };
  }

  const limit = Number.parseInt(value, 10);

  if (!Number.isInteger(limit) || limit <= 0 || limit > 200) {
    return { allowed: false, reason: 'limit must be an integer from 1 to 200' };
  }

  return { allowed: true, limit };
}

function readQueryValue(query: unknown, key: string): string | undefined {
  if (!query || typeof query !== 'object' || Array.isArray(query)) {
    return undefined;
  }

  const value = (query as Record<string, unknown>)[key];

  if (Array.isArray(value)) {
    const first = value[0];
    return typeof first === 'string' ? first : undefined;
  }

  return typeof value === 'string' ? value : undefined;
}

function parseBooleanQueryValue(value: string): boolean | undefined {
  if (value === 'true') {
    return true;
  }

  if (value === 'false') {
    return false;
  }

  return undefined;
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

function recordToSummary(record: CodexReplayRecord): CodexReplaySummary {
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

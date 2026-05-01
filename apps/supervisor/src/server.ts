import { createHash } from 'node:crypto';
import { existsSync, realpathSync } from 'node:fs';
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
  buildCodexExecLiveAdapterAdrDraft,
  buildCodexExecReportReviewHistory,
  buildCodexExecReviewerHandoffSummary,
  compareCodexExecReportReviews,
  createCodexExecLiveAdapterAdrDecisionAuditEvents,
  createCodexExecLiveAdapterAdrDecisionEvidenceRefs,
  createCodexExecLiveAdapterAdrDecisionRecord,
  createDefaultReadOnlyAdapterOperatorChecklist,
  createReadOnlyAdapterPreflightSimulationAuditEvents,
  createReadOnlyAdapterPreflightSimulationEvidenceRefs,
  createReadOnlyAdapterSimulatorReviewAuditEvents,
  createReadOnlyAdapterSimulatorReviewDecisionRecord,
  createReadOnlyAdapterSimulatorReviewEvidenceRefs,
  createReadOnlyAdapterImplementationPlanReviewAuditEvents,
  createReadOnlyAdapterImplementationPlanReviewDecisionRecord,
  createReadOnlyAdapterImplementationPlanReviewEvidenceRefs,
  createReadOnlyAdapterSkeletonAuditEvents,
  createReadOnlyAdapterSkeletonEvidenceRefs,
  createReadOnlyAdapterSkeletonPreview,
  createReadOnlyAdapterSkeletonReviewAuditEvents,
  createReadOnlyAdapterSkeletonReviewDecisionRecord,
  createReadOnlyAdapterSkeletonReviewEvidenceRefs,
  createReadOnlyAdapterFinalReadinessAuditEvents,
  createReadOnlyAdapterFinalReadinessDecisionRecord,
  createReadOnlyAdapterFinalReadinessEvidenceRefs,
  buildRealReadOnlyAdapterReadinessPackage,
  createRealReadOnlyAdapterReadinessAuditEvents,
  createRealReadOnlyAdapterReadinessEvidenceRefs,
  createRealReadOnlyAdapterReadinessReviewAuditEvents,
  createRealReadOnlyAdapterReadinessReviewDecisionRecord,
  createRealReadOnlyAdapterReadinessReviewEvidenceRefs,
  createDefaultRealReadOnlyAdapterConfig,
  createRealReadOnlyAdapterConfigFromLiveConfig,
  createRealReadOnlyAdapterRequest,
  createRealReadOnlyAdapterGuardPreflight,
  createRealReadOnlyAdapterBlockedResult,
  createRealReadOnlyAdapterResultFromBoundary,
  createRealReadOnlyAdapterAttemptAuditEvents,
  createRealReadOnlyAdapterAttemptEvidenceRefs,
  createRealReadOnlyAdapterAttemptRecord,
  createRealReadOnlyAdapterAttemptTimeline,
  createRealReadOnlyAdapterAuditSummaryFromEvents,
  createRealReadOnlyAdapterEvidenceSummaryFromRefs,
  createRealReadOnlyAdapterProcessPlan,
  createRealReadOnlyAdapterPostRunVerificationPlan,
  runRealReadOnlyAdapterPostRunVerification,
  runRealReadOnlyAdapterProcessBoundary,
  buildRealReadOnlyAdapterPilotPrerequisiteRecord,
  createRealReadOnlyAdapterPilotPrerequisiteAuditEvents,
  createRealReadOnlyAdapterPilotPrerequisiteEvidenceRefs,
  buildRealReadOnlyAdapterPilotSourcePreparationRecord,
  createRealReadOnlyAdapterPilotSourcePreparationAuditEvents,
  createRealReadOnlyAdapterPilotSourcePreparationEvidenceRefs,
  buildRealReadOnlyAdapterPolicySourceRecord,
  createPolicyDecisionFromRealReadOnlyAdapterPolicySource,
  createRealReadOnlyAdapterPolicySourceAuditEvents,
  createRealReadOnlyAdapterPolicySourceEvidenceRefs,
  hashRealReadOnlyAdapterRuntimeWorktreePath,
  listRealReadOnlyAdapterPilotSourcePreparationSummaries,
  listRealReadOnlyAdapterPolicySourceSummaries,
  summarizeRealReadOnlyAdapterPilotSourcePreparationRecord,
  summarizeRealReadOnlyAdapterPolicySourceRecord,
  listRealReadOnlyAdapterPilotPrerequisiteSummaries,
  summarizeRealReadOnlyAdapterPilotPrerequisiteRecord,
  summarizeRealReadOnlyAdapterAttempt,
  getLatestReadOnlyAdapterSkeletonReview,
  getLatestReadOnlyAdapterFinalReadiness,
  listReadOnlyAdapterSkeletonReviewSummaries,
  listReadOnlyAdapterFinalReadinessSummaries,
  listRealReadOnlyAdapterReadinessReviewSummaries,
  REAL_READ_ONLY_ADAPTER_READINESS_RECOMMENDATION,
  REAL_READ_ONLY_ADAPTER_READINESS_REVIEW_RECOMMENDATION,
  runReadOnlyAdapterFixtureBoundary,
  summarizeReadOnlyAdapterFixtureBoundary,
  summarizeRealReadOnlyAdapterReadinessReview,
  summarizeRealReadOnlyAdapterReadinessPackage,
  validateRealReadOnlyAdapterReadinessReviewDecision,
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
  createCodexExecManualApprovalRequestForPolicySource,
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
  renderCodexExecLiveAdapterAdrDraftJson,
  renderCodexExecLiveAdapterAdrDraftMarkdown,
  getLatestCodexExecReportReview,
  getLatestCodexExecLiveAdapterAdrDecision,
  getLatestReadOnlyAdapterSimulatorReview,
  getLatestReadOnlyAdapterImplementationPlanReview,
  listCodexExecLiveAdapterAdrDecisionSummaries,
  listReadOnlyAdapterSimulatorReviewSummaries,
  listReadOnlyAdapterImplementationPlanReviewSummaries,
  simulateReadOnlyAdapterPreflight,
  summarizeReadOnlyAdapterPreflightSimulation,
  summarizeCodexExecLiveAdapterAdrDecision,
  summarizeReadOnlyAdapterSimulatorReview,
  summarizeReadOnlyAdapterImplementationPlanReview,
  summarizeReadOnlyAdapterSkeletonReview,
  summarizeReadOnlyAdapterFinalReadiness,
  summarizeCodexExecReportReview,
  listCodexExecReportReviewSummaries,
  summarizeCodexExecReplay,
} from '@codexhub/codex-kernel';
import type {
  CodexExecRealReadOnlyAdapterPostRunWorktreeState,
  CodexExecRealReadOnlyAdapterProcessRunner,
} from '@codexhub/codex-kernel';
import type {
  CodexExecApprovalArtifact,
  CodexExecApprovalDecisionOutcome,
  CodexExecApprovalMode,
  CodexExecConfigLoadResult,
  CodexExecEvidenceQuery,
  CodexExecAuditQuery,
  CodexExecControlPlaneReportFormat,
  CodexExecLiveAdapterAdrDecisionOutcome,
  CodexExecLiveAdapterAdrDecisionQuery,
  CodexExecLiveAdapterAdrDecisionRecord,
  CodexExecLiveAdapterAdrDecisionStatus,
  CodexExecLiveRunRecord,
  CodexExecManualApprovalRecord,
  CodexExecReadOnlyAdapterOperatorChecklistItem,
  CodexExecReadOnlyAdapterPreflightSimulationResult,
  CodexExecReadOnlyAdapterSimulatorReviewDecisionRecord,
  CodexExecReadOnlyAdapterSimulatorReviewOutcome,
  CodexExecReadOnlyAdapterSimulatorReviewQuery,
  CodexExecReadOnlyAdapterSimulatorReviewStatus,
  CodexExecReadOnlyAdapterImplementationPlanReviewDecisionRecord,
  CodexExecReadOnlyAdapterImplementationPlanReviewOutcome,
  CodexExecReadOnlyAdapterImplementationPlanReviewQuery,
  CodexExecReadOnlyAdapterImplementationPlanReviewStatus,
  CodexExecReadOnlyAdapterSkeletonReviewDecisionRecord,
  CodexExecReadOnlyAdapterSkeletonReviewOutcome,
  CodexExecReadOnlyAdapterSkeletonReviewQuery,
  CodexExecReadOnlyAdapterSkeletonReviewStatus,
  CodexExecReadOnlyAdapterFinalReadinessDecisionRecord,
  CodexExecReadOnlyAdapterFinalReadinessOutcome,
  CodexExecReadOnlyAdapterFinalReadinessQuery,
  CodexExecReadOnlyAdapterFinalReadinessStatus,
  CodexExecRealReadOnlyAdapterReadinessPackage,
  CodexExecRealReadOnlyAdapterReadinessQuery,
  CodexExecRealReadOnlyAdapterReadinessReviewDecisionRecord,
  CodexExecRealReadOnlyAdapterReadinessReviewOutcome,
  CodexExecRealReadOnlyAdapterReadinessReviewQuery,
  CodexExecRealReadOnlyAdapterReadinessReviewStatus,
  CodexExecRealReadOnlyAdapterReadinessStatus,
  CodexExecRealReadOnlyAdapterAttemptQuery,
  CodexExecRealReadOnlyAdapterAttemptRecord,
  CodexExecRealReadOnlyAdapterAttemptStatus,
  CodexExecRealReadOnlyAdapterAttemptTimelineQuery,
  CodexExecRealReadOnlyAdapterPolicySourceQuery,
  CodexExecRealReadOnlyAdapterPolicySourceRecord,
  CodexExecRealReadOnlyAdapterPolicySourceStatus,
  CodexExecRealReadOnlyAdapterPilotSourcePreparationQuery,
  CodexExecRealReadOnlyAdapterPilotSourcePreparationRecord,
  CodexExecRealReadOnlyAdapterPilotSourcePreparationStatus,
  CodexExecRealReadOnlyAdapterPilotPrerequisiteQuery,
  CodexExecRealReadOnlyAdapterPilotPrerequisiteRecord,
  CodexExecRealReadOnlyAdapterPilotPrerequisiteStatus,
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
  configLoadResult?: CodexExecConfigLoadResult;
  realReadOnlyAdapterProcessRunner?: CodexExecRealReadOnlyAdapterProcessRunner;
  realReadOnlyAdapterPostRunVerificationRunner?: CodexExecRealReadOnlyAdapterProcessRunner;
  realReadOnlyAdapterPostRunWorktreeState?: CodexExecRealReadOnlyAdapterPostRunWorktreeState;
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
  const codexLiveAdapterAdrDecisionRecords: CodexExecLiveAdapterAdrDecisionRecord[] = [];
  const readOnlyAdapterPreflightSimulations: CodexExecReadOnlyAdapterPreflightSimulationResult[] =
    [];
  const readOnlyAdapterSimulatorReviewRecords: CodexExecReadOnlyAdapterSimulatorReviewDecisionRecord[] =
    [];
  const readOnlyAdapterImplementationPlanReviewRecords: CodexExecReadOnlyAdapterImplementationPlanReviewDecisionRecord[] =
    [];
  const readOnlyAdapterSkeletonReviewRecords: CodexExecReadOnlyAdapterSkeletonReviewDecisionRecord[] =
    [];
  const readOnlyAdapterFixtureBoundaryResults: Awaited<
    ReturnType<typeof runReadOnlyAdapterFixtureBoundary>
  >[] = [];
  const readOnlyAdapterFinalReadinessRecords: CodexExecReadOnlyAdapterFinalReadinessDecisionRecord[] =
    [];
  const realReadOnlyAdapterReadinessPackages: CodexExecRealReadOnlyAdapterReadinessPackage[] = [];
  const realReadOnlyAdapterReadinessReviewRecords: CodexExecRealReadOnlyAdapterReadinessReviewDecisionRecord[] =
    [];
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
    if (options.configLoadResult) {
      return options.configLoadResult;
    }

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
          policySourceId?: string;
        }
      | undefined;
    const store = await getStore();
    const configLoadResult = await getLiveConfigLoadResult();
    const liveConfig = configLoadResult.config;
    const record = await resolveCodexExecLiveRunRecord(body?.dryRunId, store);

    if (!record) {
      return reply.code(404).send({ error: 'dry-run record was not found' });
    }

    const requestedPolicySource = body?.policySourceId
      ? await store?.codexExecRealReadOnlyAdapterPolicySources.getPolicySource(body.policySourceId)
      : undefined;

    if (body?.policySourceId && !requestedPolicySource) {
      return reply.code(404).send({ error: 'policy source record was not found' });
    }

    if (
      requestedPolicySource &&
      (![record.id, record.dryRunPlanId].includes(requestedPolicySource.dryRunId) ||
        requestedPolicySource.status !== 'aligned' ||
        requestedPolicySource.degraded ||
        requestedPolicySource.notPersisted ||
        requestedPolicySource.fallbackUsedAsAuthority)
    ) {
      return reply.code(409).send({
        error: 'policy source is not aligned for approval binding',
        policySourceRecord: requestedPolicySource,
        liveExecution: false,
        externalProcessStarted: false,
        executionDisabled: true,
      });
    }

    const approvalRequest = requestedPolicySource
      ? createCodexExecManualApprovalRequestForPolicySource(
          record.dryRunPlan,
          requestedPolicySource,
          liveConfig,
          {
            requestedBy: body?.requestedBy,
            reason: body?.reason,
          },
        )
      : createCodexExecManualApprovalRequest(record.dryRunPlan, record.policyDecision, liveConfig, {
          requestedBy: body?.requestedBy,
          reason: body?.reason,
        });
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

  server.post('/api/codex/exec/read-only-adapter/preflight-simulate', async (request, reply) => {
    const body = request.body as
      | {
          dryRunId?: string;
          requestedSandboxMode?: CodexExecSandboxMode;
          isolatedWorktreePresent?: boolean;
          evidenceStoreReady?: boolean;
          auditStoreReady?: boolean;
          checklistComplete?: boolean;
          operatorChecklist?: CodexExecReadOnlyAdapterOperatorChecklistItem[];
          dashboardTriggerAttempted?: boolean;
          processAdapterAttempted?: boolean;
          workspaceWriteRequested?: boolean;
          dangerFullAccessRequested?: boolean;
        }
      | undefined;

    if (!body?.dryRunId) {
      return reply.code(400).send({
        error: 'dryRunId is required',
        liveExecution: false,
        externalProcessStarted: false,
        executionDisabled: true,
      });
    }

    if (body.requestedSandboxMode && !codexExecSandboxModes.has(body.requestedSandboxMode)) {
      return reply.code(400).send({
        error: 'unsupported sandbox mode',
        liveExecution: false,
        externalProcessStarted: false,
        executionDisabled: true,
      });
    }

    const store = await getStore();
    const record = await resolveCodexExecLiveRunRecord(body.dryRunId, store);

    if (!record) {
      return reply.code(404).send({
        error: 'dry-run record was not found',
        liveExecution: false,
        externalProcessStarted: false,
        executionDisabled: true,
      });
    }

    const configLoadResult = await getLiveConfigLoadResult();
    const adrDecisions = await listCodexExecLiveAdapterAdrDecisionRecords(store, {
      dryRunId: record.dryRunPlanId,
      limit: 50,
    });
    const adrDecision = getLatestCodexExecLiveAdapterAdrDecision(adrDecisions, record.dryRunPlanId);
    const operatorChecklist = createReadOnlyAdapterOperatorChecklistFromBody(body);
    const simulationResult = simulateReadOnlyAdapterPreflight({
      dryRunId: record.dryRunPlanId,
      record,
      config: configLoadResult.config,
      adrDecision,
      requestedSandboxMode: body.requestedSandboxMode,
      isolatedWorktreePresent: body.isolatedWorktreePresent === true,
      evidenceStoreReady: body.evidenceStoreReady ?? store !== undefined,
      auditStoreReady: body.auditStoreReady ?? store !== undefined,
      operatorChecklist,
      dashboardTriggerAttempted: body.dashboardTriggerAttempted === true,
      processAdapterAttempted: body.processAdapterAttempted === true,
      workspaceWriteRequested: body.workspaceWriteRequested === true,
      dangerFullAccessRequested: body.dangerFullAccessRequested === true,
      metadata: {
        requestedBy: 'supervisor-api',
        liveRunRecordId: record.id,
        configLoadResultId: configLoadResult.id,
      },
    });
    const summary = summarizeReadOnlyAdapterPreflightSimulation(simulationResult);
    const evidenceRefs = createReadOnlyAdapterPreflightSimulationEvidenceRefs(simulationResult);
    const auditEvents = createReadOnlyAdapterPreflightSimulationAuditEvents(
      simulationResult,
      evidenceRefs,
    );

    readOnlyAdapterPreflightSimulations.unshift(simulationResult);

    if (store) {
      for (const evidenceRef of evidenceRefs) {
        await store.evidenceRefs.create(evidenceRef);
      }

      for (const auditEvent of auditEvents) {
        await store.auditEvents.append(auditEvent);
      }
    }

    return {
      simulationResult,
      summary,
      blockers: simulationResult.blockers,
      evidenceRefs,
      auditEvents,
      configLoadResult,
      liveExecution: false,
      externalProcessStarted: false,
      executionDisabled: true,
      processAdapterStarted: false,
      implementationApproved: false,
      dashboardTriggerAllowed: false,
      degraded: persistenceState.status !== 'ok',
      reason: persistenceState.reason,
    };
  });

  server.get('/api/codex/exec/read-only-adapter/preflight-simulations', (request) => {
    const limitResult = parseLimitQueryValue(readQueryValue(request.query, 'limit'));
    const limit = limitResult.allowed ? (limitResult.limit ?? 10) : 10;

    return {
      simulations: readOnlyAdapterPreflightSimulations.slice(0, limit),
      count: Math.min(readOnlyAdapterPreflightSimulations.length, limit),
      liveExecution: false,
      externalProcessStarted: false,
      executionDisabled: true,
      processAdapterStarted: false,
      implementationApproved: false,
      dashboardTriggerAllowed: false,
      degraded: persistenceState.status !== 'ok',
      reason: persistenceState.reason,
    };
  });

  server.post('/api/codex/exec/read-only-adapter/simulator-review', async (request, reply) => {
    const body = request.body as
      | {
          dryRunId?: string;
          reviewerLabel?: string;
          outcome?: CodexExecReadOnlyAdapterSimulatorReviewOutcome;
          status?: CodexExecReadOnlyAdapterSimulatorReviewStatus;
          rationaleSummary?: string;
        }
      | undefined;

    if (!body?.dryRunId) {
      return reply.code(400).send({
        error: 'dryRunId is required',
        liveExecution: false,
        externalProcessStarted: false,
        executionDisabled: true,
      });
    }

    if (body.outcome && !readOnlyAdapterSimulatorReviewOutcomes.has(body.outcome)) {
      return reply.code(400).send({
        error: 'unsupported simulator review outcome',
        liveExecution: false,
        externalProcessStarted: false,
        executionDisabled: true,
      });
    }

    if (body.status && !readOnlyAdapterSimulatorReviewStatuses.has(body.status)) {
      return reply.code(400).send({
        error: 'unsupported simulator review status',
        liveExecution: false,
        externalProcessStarted: false,
        executionDisabled: true,
      });
    }

    const store = await getStore();
    const record = await resolveCodexExecLiveRunRecord(body.dryRunId, store);

    if (!record) {
      return reply.code(404).send({
        error: 'dry-run record was not found',
        liveExecution: false,
        externalProcessStarted: false,
        executionDisabled: true,
      });
    }

    const simulationResult = readOnlyAdapterPreflightSimulations.find(
      (candidate) => candidate.dryRunId === record.dryRunPlanId,
    );

    if (!simulationResult) {
      return reply.code(404).send({
        error: 'read-only adapter preflight simulation was not found',
        liveExecution: false,
        externalProcessStarted: false,
        executionDisabled: true,
      });
    }

    let reviewRecord = createReadOnlyAdapterSimulatorReviewDecisionRecord({
      simulationResult,
      reviewerLabel: body.reviewerLabel ?? 'local-operator',
      outcome: body.outcome,
      status: body.status,
      rationaleSummary:
        body.rationaleSummary ??
        'Simulator review allows Round 3R implementation planning only; implementation remains unapproved.',
      metadata: {
        requestedBy: 'supervisor-api',
        liveRunRecordId: record.id,
      },
    });
    const evidenceRefs = createReadOnlyAdapterSimulatorReviewEvidenceRefs(reviewRecord);
    const auditEvents = createReadOnlyAdapterSimulatorReviewAuditEvents(reviewRecord, evidenceRefs);
    reviewRecord = {
      ...reviewRecord,
      evidenceRefs,
      auditEventIds: auditEvents.map((event) => event.id),
    };

    if (store) {
      for (const evidenceRef of evidenceRefs) {
        await store.evidenceRefs.create(evidenceRef);
      }

      for (const auditEvent of auditEvents) {
        await store.auditEvents.append(auditEvent);
      }
    }

    await persistReadOnlyAdapterSimulatorReviewRecord(reviewRecord, store);

    return createReadOnlyAdapterSimulatorReviewResponse(reviewRecord, evidenceRefs, auditEvents);
  });

  server.get(
    '/api/codex/exec/read-only-adapter/simulator-review/:reviewId',
    async (request, reply) => {
      const params = request.params as { reviewId?: string };

      if (!params.reviewId) {
        return reply.code(400).send({
          error: 'reviewId is required',
          liveExecution: false,
          externalProcessStarted: false,
          executionDisabled: true,
        });
      }

      const store = await getStore();
      const reviewRecord = await resolveReadOnlyAdapterSimulatorReviewRecord(
        params.reviewId,
        store,
      );

      if (!reviewRecord) {
        return reply.code(404).send({
          error: 'read-only adapter simulator review was not found',
          liveExecution: false,
          externalProcessStarted: false,
          executionDisabled: true,
        });
      }

      return createReadOnlyAdapterSimulatorReviewResponse(reviewRecord);
    },
  );

  server.get('/api/codex/exec/read-only-adapter/simulator-reviews', async (request, reply) => {
    const queryResult = parseReadOnlyAdapterSimulatorReviewQuery(request.query);

    if (!queryResult.allowed) {
      return reply.code(400).send({
        error: queryResult.reason,
        liveExecution: false,
        externalProcessStarted: false,
        executionDisabled: true,
      });
    }

    const store = await getStore();
    const records = await listReadOnlyAdapterSimulatorReviewRecords(store, queryResult.query);

    return {
      records,
      reviews: listReadOnlyAdapterSimulatorReviewSummaries(records, queryResult.query),
      liveExecution: false,
      externalProcessStarted: false,
      executionDisabled: true,
      processAdapterStarted: false,
      implementationApproved: false,
      processAdapterApproved: false,
      dashboardTriggerAllowed: false,
      recommendationGrantsExecution: false,
      degraded: persistenceState.status !== 'ok',
      reason: persistenceState.reason,
    };
  });

  server.get(
    '/api/codex/exec/read-only-adapter/simulator-review/latest/:dryRunId',
    async (request, reply) => {
      const params = request.params as { dryRunId?: string };

      if (!params.dryRunId) {
        return reply.code(400).send({
          error: 'dryRunId is required',
          liveExecution: false,
          externalProcessStarted: false,
          executionDisabled: true,
        });
      }

      const store = await getStore();
      const records = await listReadOnlyAdapterSimulatorReviewRecords(store, {
        dryRunId: params.dryRunId,
        limit: 50,
      });
      const reviewRecord = getLatestReadOnlyAdapterSimulatorReview(records, params.dryRunId);

      if (!reviewRecord) {
        return reply.code(404).send({
          error: 'read-only adapter simulator review was not found',
          liveExecution: false,
          externalProcessStarted: false,
          executionDisabled: true,
        });
      }

      return createReadOnlyAdapterSimulatorReviewResponse(reviewRecord);
    },
  );

  server.post(
    '/api/codex/exec/read-only-adapter/implementation-plan-review',
    async (request, reply) => {
      const body = request.body as
        | {
            reviewerLabel?: string;
            outcome?: CodexExecReadOnlyAdapterImplementationPlanReviewOutcome;
            status?: CodexExecReadOnlyAdapterImplementationPlanReviewStatus;
            rationaleSummary?: string;
          }
        | undefined;

      if (!body?.outcome) {
        return reply.code(400).send({
          error: 'outcome is required',
          liveExecution: false,
          externalProcessStarted: false,
          executionDisabled: true,
        });
      }

      if (!readOnlyAdapterImplementationPlanReviewOutcomes.has(body.outcome)) {
        return reply.code(400).send({
          error: 'unsupported implementation plan review outcome',
          liveExecution: false,
          externalProcessStarted: false,
          executionDisabled: true,
        });
      }

      if (body.status && !readOnlyAdapterImplementationPlanReviewStatuses.has(body.status)) {
        return reply.code(400).send({
          error: 'unsupported implementation plan review status',
          liveExecution: false,
          externalProcessStarted: false,
          executionDisabled: true,
        });
      }

      const store = await getStore();
      let reviewRecord = createReadOnlyAdapterImplementationPlanReviewDecisionRecord({
        outcome: body.outcome,
        status: body.status,
        reviewerLabel: body.reviewerLabel ?? 'local-operator',
        rationaleSummary:
          body.rationaleSummary ??
          'Implementation plan review records governance only; process adapter and execution remain unapproved.',
        metadata: {
          requestedBy: 'supervisor-api',
        },
      });
      const evidenceRefs = createReadOnlyAdapterImplementationPlanReviewEvidenceRefs(reviewRecord);
      const auditEvents = createReadOnlyAdapterImplementationPlanReviewAuditEvents(
        reviewRecord,
        evidenceRefs,
      );
      reviewRecord = {
        ...reviewRecord,
        evidenceRefs,
        auditEventIds: auditEvents.map((event) => event.id),
      };

      if (store) {
        for (const evidenceRef of evidenceRefs) {
          await store.evidenceRefs.create(evidenceRef);
        }

        for (const auditEvent of auditEvents) {
          await store.auditEvents.append(auditEvent);
        }
      }

      await persistReadOnlyAdapterImplementationPlanReviewRecord(reviewRecord, store);

      return createReadOnlyAdapterImplementationPlanReviewResponse(
        reviewRecord,
        evidenceRefs,
        auditEvents,
      );
    },
  );

  server.get(
    '/api/codex/exec/read-only-adapter/implementation-plan-reviews',
    async (request, reply) => {
      const queryResult = parseReadOnlyAdapterImplementationPlanReviewQuery(request.query);

      if (!queryResult.allowed) {
        return reply.code(400).send({
          error: queryResult.reason,
          liveExecution: false,
          externalProcessStarted: false,
          executionDisabled: true,
        });
      }

      const store = await getStore();
      const records = await listReadOnlyAdapterImplementationPlanReviewRecords(
        store,
        queryResult.query,
      );

      return {
        records,
        reviews: listReadOnlyAdapterImplementationPlanReviewSummaries(records, queryResult.query),
        liveExecution: false,
        externalProcessStarted: false,
        executionDisabled: true,
        processAdapterStarted: false,
        implementationApproved: false,
        processAdapterApproved: false,
        dashboardTriggerAllowed: false,
        recommendationGrantsExecution: false,
        workspaceWriteAllowed: false,
        dangerFullAccessAllowed: false,
        degraded: persistenceState.status !== 'ok',
        reason: persistenceState.reason,
      };
    },
  );

  server.get(
    '/api/codex/exec/read-only-adapter/implementation-plan-review/latest',
    async (_request, reply) => {
      const store = await getStore();
      const records = await listReadOnlyAdapterImplementationPlanReviewRecords(store, {
        limit: 50,
      });
      const reviewRecord = getLatestReadOnlyAdapterImplementationPlanReview(records);

      if (!reviewRecord) {
        return reply.code(404).send({
          error: 'read-only adapter implementation plan review was not found',
          liveExecution: false,
          externalProcessStarted: false,
          executionDisabled: true,
        });
      }

      return createReadOnlyAdapterImplementationPlanReviewResponse(reviewRecord);
    },
  );

  server.get(
    '/api/codex/exec/read-only-adapter/implementation-plan-review/:reviewId',
    async (request, reply) => {
      const params = request.params as { reviewId?: string };

      if (!params.reviewId) {
        return reply.code(400).send({
          error: 'reviewId is required',
          liveExecution: false,
          externalProcessStarted: false,
          executionDisabled: true,
        });
      }

      const store = await getStore();
      const reviewRecord = await resolveReadOnlyAdapterImplementationPlanReviewRecord(
        params.reviewId,
        store,
      );

      if (!reviewRecord) {
        return reply.code(404).send({
          error: 'read-only adapter implementation plan review was not found',
          liveExecution: false,
          externalProcessStarted: false,
          executionDisabled: true,
        });
      }

      return createReadOnlyAdapterImplementationPlanReviewResponse(reviewRecord);
    },
  );

  server.get('/api/codex/exec/read-only-adapter/skeleton-preview', async () => {
    const preview = createReadOnlyAdapterSkeletonPreview({
      metadata: {
        requestedBy: 'supervisor-api',
      },
    });
    const evidenceRefs = createReadOnlyAdapterSkeletonEvidenceRefs(preview);
    const auditEvents = createReadOnlyAdapterSkeletonAuditEvents(preview, evidenceRefs);

    return {
      preview,
      evidenceRefs,
      auditEvents,
      liveExecution: false,
      externalProcessStarted: false,
      executionDisabled: true,
      processAdapterStarted: false,
      implementationApproved: false,
      processAdapterApproved: false,
      dashboardTriggerAllowed: false,
      recommendationGrantsExecution: false,
      workspaceWriteAllowed: false,
      dangerFullAccessAllowed: false,
      degraded: persistenceState.status !== 'ok',
      reason: persistenceState.reason,
    };
  });

  server.post('/api/codex/exec/read-only-adapter/skeleton-review', async (request, reply) => {
    const body = request.body as
      | {
          reviewerLabel?: string;
          outcome?: CodexExecReadOnlyAdapterSkeletonReviewOutcome;
          status?: CodexExecReadOnlyAdapterSkeletonReviewStatus;
          rationaleSummary?: string;
        }
      | undefined;
    const outcome = body?.outcome ?? 'skeleton_accepted_for_fixture_boundary_only';

    if (!readOnlyAdapterSkeletonReviewOutcomes.has(outcome)) {
      return reply.code(400).send({
        error: 'unsupported skeleton review outcome',
        liveExecution: false,
        externalProcessStarted: false,
        executionDisabled: true,
      });
    }

    if (body?.status && !readOnlyAdapterSkeletonReviewStatuses.has(body.status)) {
      return reply.code(400).send({
        error: 'unsupported skeleton review status',
        liveExecution: false,
        externalProcessStarted: false,
        executionDisabled: true,
      });
    }

    const store = await getStore();
    const preview = createReadOnlyAdapterSkeletonPreview({
      metadata: {
        requestedBy: 'supervisor-api',
      },
    });
    let reviewRecord = createReadOnlyAdapterSkeletonReviewDecisionRecord({
      preview,
      outcome,
      status: body?.status,
      reviewerLabel: body?.reviewerLabel ?? 'local-operator',
      rationaleSummary:
        body?.rationaleSummary ??
        'Skeleton review allows fixture-backed replay boundary only; execution remains disabled.',
      metadata: {
        requestedBy: 'supervisor-api',
      },
    });
    const evidenceRefs = createReadOnlyAdapterSkeletonReviewEvidenceRefs(reviewRecord);
    const auditEvents = createReadOnlyAdapterSkeletonReviewAuditEvents(reviewRecord, evidenceRefs);
    reviewRecord = {
      ...reviewRecord,
      evidenceRefs,
      auditEventIds: auditEvents.map((event) => event.id),
    };

    if (store) {
      for (const evidenceRef of evidenceRefs) {
        await store.evidenceRefs.create(evidenceRef);
      }

      for (const auditEvent of auditEvents) {
        await store.auditEvents.append(auditEvent);
      }
    }

    await persistReadOnlyAdapterSkeletonReviewRecord(reviewRecord, store);

    return createReadOnlyAdapterSkeletonReviewResponse(reviewRecord, evidenceRefs, auditEvents);
  });

  server.get('/api/codex/exec/read-only-adapter/skeleton-reviews', async (request, reply) => {
    const queryResult = parseReadOnlyAdapterSkeletonReviewQuery(request.query);

    if (!queryResult.allowed) {
      return reply.code(400).send({
        error: queryResult.reason,
        liveExecution: false,
        externalProcessStarted: false,
        executionDisabled: true,
      });
    }

    const store = await getStore();
    const records = await listReadOnlyAdapterSkeletonReviewRecords(store, queryResult.query);

    return {
      records,
      reviews: listReadOnlyAdapterSkeletonReviewSummaries(records, queryResult.query),
      liveExecution: false,
      externalProcessStarted: false,
      executionDisabled: true,
      processAdapterStarted: false,
      implementationApproved: false,
      processAdapterApproved: false,
      dashboardTriggerAllowed: false,
      recommendationGrantsExecution: false,
      workspaceWriteAllowed: false,
      dangerFullAccessAllowed: false,
      degraded: persistenceState.status !== 'ok',
      reason: persistenceState.reason,
    };
  });

  server.get(
    '/api/codex/exec/read-only-adapter/skeleton-review/latest',
    async (_request, reply) => {
      const store = await getStore();
      const records = await listReadOnlyAdapterSkeletonReviewRecords(store, { limit: 50 });
      const reviewRecord = getLatestReadOnlyAdapterSkeletonReview(records);

      if (!reviewRecord) {
        return reply.code(404).send({
          error: 'read-only adapter skeleton review was not found',
          liveExecution: false,
          externalProcessStarted: false,
          executionDisabled: true,
        });
      }

      return createReadOnlyAdapterSkeletonReviewResponse(reviewRecord);
    },
  );

  server.get(
    '/api/codex/exec/read-only-adapter/skeleton-review/:reviewId',
    async (request, reply) => {
      const params = request.params as { reviewId?: string };

      if (!params.reviewId) {
        return reply.code(400).send({
          error: 'reviewId is required',
          liveExecution: false,
          externalProcessStarted: false,
          executionDisabled: true,
        });
      }

      const store = await getStore();
      const reviewRecord = await resolveReadOnlyAdapterSkeletonReviewRecord(params.reviewId, store);

      if (!reviewRecord) {
        return reply.code(404).send({
          error: 'read-only adapter skeleton review was not found',
          liveExecution: false,
          externalProcessStarted: false,
          executionDisabled: true,
        });
      }

      return createReadOnlyAdapterSkeletonReviewResponse(reviewRecord);
    },
  );

  server.post('/api/codex/exec/read-only-adapter/fixture-boundary', async (request, reply) => {
    const body = request.body as { fixturePath?: string; dryRunId?: string } | undefined;

    if (!body?.fixturePath) {
      return reply.code(400).send({
        error: 'fixturePath is required',
        liveExecution: false,
        externalProcessStarted: false,
        executionDisabled: true,
      });
    }

    const guard = resolveAllowedFixture(body.fixturePath);

    if (!guard.allowed) {
      return reply.code(400).send({
        error: guard.reason,
        liveExecution: false,
        externalProcessStarted: false,
        executionDisabled: true,
      });
    }

    if (!existsSync(guard.path)) {
      return reply.code(404).send({
        error: 'fixture file was not found',
        liveExecution: false,
        externalProcessStarted: false,
        executionDisabled: true,
      });
    }

    const store = await getStore();
    const fixtureText = await readFile(guard.path, 'utf8');
    const result = await runReadOnlyAdapterFixtureBoundary({
      fixturePath: guard.fixturePath,
      fixtureText,
      dryRunId: body.dryRunId,
      metadata: {
        requestedBy: 'supervisor-api',
      },
    });

    if (store) {
      for (const evidenceRef of result.evidenceRefs) {
        await store.evidenceRefs.create(evidenceRef);
      }

      for (const auditEvent of result.auditEvents) {
        await store.auditEvents.append(auditEvent);
      }
    }

    readOnlyAdapterFixtureBoundaryResults.unshift(result);

    return {
      result,
      summary: summarizeReadOnlyAdapterFixtureBoundary(result),
      evidenceRefs: result.evidenceRefs,
      auditEvents: result.auditEvents,
      liveExecution: false,
      externalProcessStarted: false,
      executionDisabled: true,
      processAdapterStarted: false,
      implementationApproved: false,
      processAdapterApproved: false,
      dashboardTriggerAllowed: false,
      recommendationGrantsExecution: false,
      workspaceWriteAllowed: false,
      dangerFullAccessAllowed: false,
      degraded: persistenceState.status !== 'ok',
      reason: persistenceState.reason,
    };
  });

  server.get('/api/codex/exec/read-only-adapter/fixture-boundaries', async () => ({
    results: readOnlyAdapterFixtureBoundaryResults.slice(0, 10),
    summaries: readOnlyAdapterFixtureBoundaryResults
      .slice(0, 10)
      .map((result) => summarizeReadOnlyAdapterFixtureBoundary(result)),
    liveExecution: false,
    externalProcessStarted: false,
    executionDisabled: true,
    processAdapterStarted: false,
    implementationApproved: false,
    processAdapterApproved: false,
    dashboardTriggerAllowed: false,
    recommendationGrantsExecution: false,
    workspaceWriteAllowed: false,
    dangerFullAccessAllowed: false,
    degraded: persistenceState.status !== 'ok',
    reason: persistenceState.reason,
  }));

  server.post('/api/codex/exec/read-only-adapter/final-readiness', async (request, reply) => {
    const body = request.body as
      | {
          reviewerLabel?: string;
          outcome?: CodexExecReadOnlyAdapterFinalReadinessOutcome;
          status?: CodexExecReadOnlyAdapterFinalReadinessStatus;
          rationaleSummary?: string;
        }
      | undefined;
    const outcome = body?.outcome ?? 'ready_for_separate_read_only_adapter_adr';

    if (!readOnlyAdapterFinalReadinessOutcomes.has(outcome)) {
      return reply.code(400).send({
        error: 'unsupported final readiness outcome',
        liveExecution: false,
        externalProcessStarted: false,
        executionDisabled: true,
      });
    }

    if (body?.status && !readOnlyAdapterFinalReadinessStatuses.has(body.status)) {
      return reply.code(400).send({
        error: 'unsupported final readiness status',
        liveExecution: false,
        externalProcessStarted: false,
        executionDisabled: true,
      });
    }

    const store = await getStore();
    const skeletonReviews = await listReadOnlyAdapterSkeletonReviewRecords(store, { limit: 50 });
    const skeletonReview = getLatestReadOnlyAdapterSkeletonReview(skeletonReviews);
    const fixtureBoundary = readOnlyAdapterFixtureBoundaryResults[0];

    if (!skeletonReview) {
      return reply.code(404).send({
        error: 'read-only adapter skeleton review was not found',
        liveExecution: false,
        externalProcessStarted: false,
        executionDisabled: true,
      });
    }

    if (!fixtureBoundary) {
      return reply.code(404).send({
        error: 'fixture-backed replay boundary result was not found',
        liveExecution: false,
        externalProcessStarted: false,
        executionDisabled: true,
      });
    }

    const skeletonPreview = createReadOnlyAdapterSkeletonPreview();
    let decisionRecord = createReadOnlyAdapterFinalReadinessDecisionRecord({
      skeletonPreview,
      skeletonReview,
      fixtureBoundary,
      outcome,
      status: body?.status,
      reviewerLabel: body?.reviewerLabel ?? 'local-operator',
      rationaleSummary:
        body?.rationaleSummary ??
        'Final readiness review requires a separate ADR before any real read-only adapter can be considered.',
      metadata: {
        requestedBy: 'supervisor-api',
      },
    });
    const evidenceRefs = createReadOnlyAdapterFinalReadinessEvidenceRefs(decisionRecord);
    const auditEvents = createReadOnlyAdapterFinalReadinessAuditEvents(
      decisionRecord,
      evidenceRefs,
    );
    decisionRecord = {
      ...decisionRecord,
      evidenceRefs,
      auditEventIds: auditEvents.map((event) => event.id),
    };

    if (store) {
      for (const evidenceRef of evidenceRefs) {
        await store.evidenceRefs.create(evidenceRef);
      }

      for (const auditEvent of auditEvents) {
        await store.auditEvents.append(auditEvent);
      }
    }

    await persistReadOnlyAdapterFinalReadinessRecord(decisionRecord, store);

    return createReadOnlyAdapterFinalReadinessResponse(decisionRecord, evidenceRefs, auditEvents);
  });

  server.get('/api/codex/exec/read-only-adapter/final-readiness', async (request, reply) => {
    const queryResult = parseReadOnlyAdapterFinalReadinessQuery(request.query);

    if (!queryResult.allowed) {
      return reply.code(400).send({
        error: queryResult.reason,
        liveExecution: false,
        externalProcessStarted: false,
        executionDisabled: true,
      });
    }

    const store = await getStore();
    const records = await listReadOnlyAdapterFinalReadinessRecords(store, queryResult.query);

    return {
      records,
      reviews: listReadOnlyAdapterFinalReadinessSummaries(records, queryResult.query),
      liveExecution: false,
      externalProcessStarted: false,
      executionDisabled: true,
      processAdapterStarted: false,
      implementationApproved: false,
      processAdapterApproved: false,
      dashboardTriggerAllowed: false,
      recommendationGrantsExecution: false,
      workspaceWriteAllowed: false,
      dangerFullAccessAllowed: false,
      degraded: persistenceState.status !== 'ok',
      reason: persistenceState.reason,
    };
  });

  server.get(
    '/api/codex/exec/read-only-adapter/final-readiness/latest',
    async (_request, reply) => {
      const store = await getStore();
      const records = await listReadOnlyAdapterFinalReadinessRecords(store, { limit: 50 });
      const decisionRecord = getLatestReadOnlyAdapterFinalReadiness(records);

      if (!decisionRecord) {
        return reply.code(404).send({
          error: 'read-only adapter final readiness review was not found',
          liveExecution: false,
          externalProcessStarted: false,
          executionDisabled: true,
        });
      }

      return createReadOnlyAdapterFinalReadinessResponse(decisionRecord);
    },
  );

  server.post(
    '/api/codex/exec/real-read-only-adapter/readiness-package',
    async (request, reply) => {
      const body = request.body as
        | {
            dryRunId?: string;
            symlinkEscapeVerified?: boolean;
            approvalReadinessReady?: boolean;
            worktreeReadinessReady?: boolean;
            operatorChecklistComplete?: boolean;
            postRunVerificationReady?: boolean;
          }
        | undefined;

      if (!body?.dryRunId) {
        return reply.code(400).send({
          error: 'dryRunId is required',
          liveExecution: false,
          externalProcessStarted: false,
          executionDisabled: true,
        });
      }

      const store = await getStore();

      if (!store) {
        return reply.code(503).send({
          error: 'readiness package store is unavailable',
          degraded: true,
          notPersisted: true,
          liveExecution: false,
          externalProcessStarted: false,
          executionDisabled: true,
          processAdapterStarted: false,
          implementationApproved: false,
          processAdapterApproved: false,
          recommendationGrantsExecution: false,
          workspaceWriteAllowed: false,
          dangerFullAccessAllowed: false,
          dashboardTriggerAllowed: false,
          reason: persistenceState.reason ?? 'store unavailable',
        });
      }

      const record = await resolveCodexExecLiveRunRecord(body.dryRunId, store);

      if (!record) {
        return reply.code(404).send({
          error: 'dry-run record was not found',
          liveExecution: false,
          externalProcessStarted: false,
          executionDisabled: true,
        });
      }

      const governanceReviews = await listReadOnlyAdapterImplementationPlanReviewRecords(store, {
        outcome: 'conditional_go_to_disabled_skeleton',
        limit: 50,
      });
      const governanceDecision =
        getLatestReadOnlyAdapterImplementationPlanReview(governanceReviews);
      const skeletonReviews = await listReadOnlyAdapterSkeletonReviewRecords(store, { limit: 50 });
      const skeletonReview = getLatestReadOnlyAdapterSkeletonReview(skeletonReviews);
      const finalReadinessRecords = await listReadOnlyAdapterFinalReadinessRecords(store, {
        limit: 50,
      });
      const finalReadiness = getLatestReadOnlyAdapterFinalReadiness(finalReadinessRecords);
      const fixtureBoundary = readOnlyAdapterFixtureBoundaryResults.find(
        (candidate) => candidate.input.dryRunId === record.dryRunPlanId,
      );
      const documentedArtifactRefs = existingReadinessDocumentRefs();
      const packageRecord = buildRealReadOnlyAdapterReadinessPackage({
        dryRunId: record.dryRunPlanId,
        governanceDecision,
        skeletonPreview: createReadOnlyAdapterSkeletonPreview(),
        skeletonReview,
        fixtureBoundary,
        finalReadiness,
        documentedArtifactRefs,
        symlinkEscapeVerified: body.symlinkEscapeVerified === true,
        approvalReadinessReady: body.approvalReadinessReady === true,
        worktreeReadinessReady: body.worktreeReadinessReady === true,
        evidenceStoreReady: true,
        auditStoreReady: true,
        operatorChecklistComplete: body.operatorChecklistComplete === true,
        postRunVerificationReady: body.postRunVerificationReady === true,
        metadata: {
          requestedBy: 'supervisor-api',
          liveRunRecordId: record.id,
          persisted3SDecisionRequired: true,
        },
      });

      if (!governanceDecision) {
        return reply.code(409).send({
          package: packageRecord,
          summary: summarizeRealReadOnlyAdapterReadinessPackage(packageRecord),
          recommendation: REAL_READ_ONLY_ADAPTER_READINESS_RECOMMENDATION,
          error: 'required Round 3S conditional skeleton governance decision was not found',
          degraded: false,
          notPersisted: true,
          liveExecution: false,
          externalProcessStarted: false,
          executionDisabled: true,
          processAdapterStarted: false,
          implementationApproved: false,
          processAdapterApproved: false,
          recommendationGrantsExecution: false,
          workspaceWriteAllowed: false,
          dangerFullAccessAllowed: false,
          dashboardTriggerAllowed: false,
        });
      }

      const evidenceRefs = createRealReadOnlyAdapterReadinessEvidenceRefs(packageRecord);
      const auditEvents = createRealReadOnlyAdapterReadinessAuditEvents(
        packageRecord,
        evidenceRefs,
      );
      const persistedPackage = {
        ...packageRecord,
        evidenceRefs,
        auditEventIds: auditEvents.map((event) => event.id),
      };

      for (const evidenceRef of evidenceRefs) {
        await store.evidenceRefs.create(evidenceRef);
      }

      for (const auditEvent of auditEvents) {
        await store.auditEvents.append(auditEvent);
      }

      await persistRealReadOnlyAdapterReadinessPackage(persistedPackage, store);

      return createRealReadOnlyAdapterReadinessResponse(
        persistedPackage,
        evidenceRefs,
        auditEvents,
      );
    },
  );

  server.get(
    '/api/codex/exec/real-read-only-adapter/readiness-package/:packageId',
    async (request, reply) => {
      const params = request.params as { packageId?: string };

      if (!params.packageId) {
        return reply.code(400).send({
          error: 'packageId is required',
          liveExecution: false,
          externalProcessStarted: false,
          executionDisabled: true,
        });
      }

      const store = await getStore();
      const packageRecord = await resolveRealReadOnlyAdapterReadinessPackage(
        params.packageId,
        store,
      );

      if (!packageRecord) {
        return reply.code(404).send({
          error: 'readiness package was not found',
          liveExecution: false,
          externalProcessStarted: false,
          executionDisabled: true,
        });
      }

      return createRealReadOnlyAdapterReadinessResponse(packageRecord);
    },
  );

  server.get(
    '/api/codex/exec/real-read-only-adapter/readiness-packages',
    async (request, reply) => {
      const queryResult = parseRealReadOnlyAdapterReadinessQuery(request.query);

      if (!queryResult.allowed) {
        return reply.code(400).send({
          error: queryResult.reason,
          liveExecution: false,
          externalProcessStarted: false,
          executionDisabled: true,
        });
      }

      const store = await getStore();
      const packages = await listRealReadOnlyAdapterReadinessPackages(store, queryResult.query);

      return {
        packages,
        summaries: packages.map((packageRecord) =>
          summarizeRealReadOnlyAdapterReadinessPackage(packageRecord),
        ),
        recommendation: REAL_READ_ONLY_ADAPTER_READINESS_RECOMMENDATION,
        liveExecution: false,
        externalProcessStarted: false,
        executionDisabled: true,
        processAdapterStarted: false,
        implementationApproved: false,
        processAdapterApproved: false,
        recommendationGrantsExecution: false,
        workspaceWriteAllowed: false,
        dangerFullAccessAllowed: false,
        dashboardTriggerAllowed: false,
        degraded: persistenceState.status !== 'ok',
        reason: persistenceState.reason,
      };
    },
  );

  server.get(
    '/api/codex/exec/real-read-only-adapter/readiness-package/latest/:dryRunId',
    async (request, reply) => {
      const params = request.params as { dryRunId?: string };

      if (!params.dryRunId) {
        return reply.code(400).send({
          error: 'dryRunId is required',
          liveExecution: false,
          externalProcessStarted: false,
          executionDisabled: true,
        });
      }

      const store = await getStore();
      const packageRecord = await latestRealReadOnlyAdapterReadinessPackage(params.dryRunId, store);

      if (!packageRecord) {
        return reply.code(404).send({
          error: 'readiness package was not found',
          liveExecution: false,
          externalProcessStarted: false,
          executionDisabled: true,
        });
      }

      return createRealReadOnlyAdapterReadinessResponse(packageRecord);
    },
  );

  server.post('/api/codex/exec/real-read-only-adapter/readiness-review', async (request, reply) => {
    const body = request.body as
      | {
          packageId?: string;
          outcome?: string;
          reviewerLabel?: string;
          rationaleSummary?: string;
          status?: string;
        }
      | undefined;

    if (!body?.packageId) {
      return reply.code(400).send({
        error: 'packageId is required',
        liveExecution: false,
        externalProcessStarted: false,
        executionDisabled: true,
      });
    }

    if (!body.outcome || !realReadOnlyAdapterReadinessReviewOutcomes.has(body.outcome)) {
      return reply.code(400).send({
        error: 'valid outcome is required',
        liveExecution: false,
        externalProcessStarted: false,
        executionDisabled: true,
      });
    }

    if (body.status && !realReadOnlyAdapterReadinessReviewStatuses.has(body.status)) {
      return reply.code(400).send({
        error: 'unsupported readiness review status',
        liveExecution: false,
        externalProcessStarted: false,
        executionDisabled: true,
      });
    }

    const store = await getStore();

    if (!store) {
      return reply.code(503).send({
        error: 'readiness review store is unavailable',
        degraded: true,
        notPersisted: true,
        liveExecution: false,
        externalProcessStarted: false,
        executionDisabled: true,
        processAdapterStarted: false,
        implementationApproved: false,
        processAdapterApproved: false,
        recommendationGrantsExecution: false,
        workspaceWriteAllowed: false,
        dangerFullAccessAllowed: false,
        dashboardTriggerAllowed: false,
        reason: persistenceState.reason ?? 'store unavailable',
      });
    }

    const packageRecord = await resolveRealReadOnlyAdapterReadinessPackage(body.packageId, store);

    if (!packageRecord) {
      return reply.code(404).send({
        error: 'readiness package was not found',
        liveExecution: false,
        externalProcessStarted: false,
        executionDisabled: true,
      });
    }

    const validation = validateRealReadOnlyAdapterReadinessReviewDecision({
      packageRecord,
      outcome: body.outcome as CodexExecRealReadOnlyAdapterReadinessReviewOutcome,
      rationaleSummary: body.rationaleSummary ?? '',
    });

    if (!validation.valid) {
      return reply.code(400).send({
        error: validation.reason,
        requiredAcknowledgementCodes: validation.requiredAcknowledgementCodes,
        missingAcknowledgementCodes: validation.missingAcknowledgementCodes,
        liveExecution: false,
        externalProcessStarted: false,
        executionDisabled: true,
        implementationApproved: false,
        processAdapterApproved: false,
        recommendationGrantsExecution: false,
      });
    }

    const reviewRecord = createRealReadOnlyAdapterReadinessReviewDecisionRecord({
      packageRecord,
      outcome: body.outcome as CodexExecRealReadOnlyAdapterReadinessReviewOutcome,
      status:
        (body.status as CodexExecRealReadOnlyAdapterReadinessReviewStatus | undefined) ??
        'recorded',
      reviewerLabel: body.reviewerLabel ?? 'local-operator',
      rationaleSummary: body.rationaleSummary ?? 'Readiness package reviewed.',
      metadata: {
        requestedBy: 'supervisor-api',
      },
    });
    const evidenceRefs = createRealReadOnlyAdapterReadinessReviewEvidenceRefs(reviewRecord);
    const auditEvents = createRealReadOnlyAdapterReadinessReviewAuditEvents(
      reviewRecord,
      evidenceRefs,
    );
    const persistedReview = {
      ...reviewRecord,
      evidenceRefs,
      auditEventIds: auditEvents.map((event) => event.id),
    };

    for (const evidenceRef of evidenceRefs) {
      await store.evidenceRefs.create(evidenceRef);
    }

    for (const auditEvent of auditEvents) {
      await store.auditEvents.append(auditEvent);
    }

    await persistRealReadOnlyAdapterReadinessReview(persistedReview, store);

    return createRealReadOnlyAdapterReadinessReviewResponse(
      persistedReview,
      evidenceRefs,
      auditEvents,
    );
  });

  server.get(
    '/api/codex/exec/real-read-only-adapter/readiness-review/:reviewId',
    async (request, reply) => {
      const params = request.params as { reviewId?: string };

      if (!params.reviewId) {
        return reply.code(400).send({
          error: 'reviewId is required',
          liveExecution: false,
          externalProcessStarted: false,
          executionDisabled: true,
        });
      }

      const store = await getStore();
      const review = await resolveRealReadOnlyAdapterReadinessReview(params.reviewId, store);

      if (!review) {
        return reply.code(404).send({
          error: 'readiness review was not found',
          liveExecution: false,
          externalProcessStarted: false,
          executionDisabled: true,
        });
      }

      return createRealReadOnlyAdapterReadinessReviewResponse(review);
    },
  );

  server.get('/api/codex/exec/real-read-only-adapter/readiness-reviews', async (request, reply) => {
    const queryResult = parseRealReadOnlyAdapterReadinessReviewQuery(request.query);

    if (!queryResult.allowed) {
      return reply.code(400).send({
        error: queryResult.reason,
        liveExecution: false,
        externalProcessStarted: false,
        executionDisabled: true,
      });
    }

    const store = await getStore();
    const reviews = await listRealReadOnlyAdapterReadinessReviews(store, queryResult.query);

    return {
      reviews,
      summaries: listRealReadOnlyAdapterReadinessReviewSummaries(reviews, queryResult.query),
      recommendation: REAL_READ_ONLY_ADAPTER_READINESS_REVIEW_RECOMMENDATION,
      liveExecution: false,
      externalProcessStarted: false,
      executionDisabled: true,
      processAdapterStarted: false,
      implementationApproved: false,
      processAdapterApproved: false,
      recommendationGrantsExecution: false,
      workspaceWriteAllowed: false,
      dangerFullAccessAllowed: false,
      dashboardTriggerAllowed: false,
      degraded: persistenceState.status !== 'ok',
      reason: persistenceState.reason,
    };
  });

  server.get(
    '/api/codex/exec/real-read-only-adapter/readiness-review/latest/:dryRunId',
    async (request, reply) => {
      const params = request.params as { dryRunId?: string };

      if (!params.dryRunId) {
        return reply.code(400).send({
          error: 'dryRunId is required',
          liveExecution: false,
          externalProcessStarted: false,
          executionDisabled: true,
        });
      }

      const store = await getStore();
      const review = await latestRealReadOnlyAdapterReadinessReview(params.dryRunId, store);

      if (!review) {
        return reply.code(404).send({
          error: 'readiness review was not found',
          liveExecution: false,
          externalProcessStarted: false,
          executionDisabled: true,
        });
      }

      return createRealReadOnlyAdapterReadinessReviewResponse(review);
    },
  );

  server.post(
    '/api/codex/exec/real-read-only-adapter/policy-sources',
    async (request, reply) => {
      const body = request.body as { dryRunId?: string } | undefined;

      if (!body?.dryRunId) {
        return reply.code(400).send({
          error: 'dryRunId is required',
          liveExecution: false,
          externalProcessStarted: false,
          executionDisabled: true,
        });
      }

      const store = await getStore();

      if (!store) {
        return reply
          .code(503)
          .send(createRealReadOnlyAdapterPolicySourceUnavailableResponse(body.dryRunId));
      }

      const configLoadResult = await getLiveConfigLoadResult();
      const dryRunRecord = await resolveCodexExecLiveRunRecord(body.dryRunId, store);
      const readOnlyOnly =
        configLoadResult.status === 'loaded' &&
        configLoadResult.config.allowedSandboxModes.length === 1 &&
        configLoadResult.config.allowedSandboxModes[0] === 'read_only' &&
        configLoadResult.config.forbiddenSandboxModes.includes('workspace_write') &&
        configLoadResult.config.forbiddenSandboxModes.includes('danger_full_access');
      const alignedPolicyDecision = dryRunRecord
        ? evaluateCodexExecDryRunPolicy(
            {
              ...dryRunRecord.dryRunPlan,
              liveAdapterEnabled: configLoadResult.config.liveEnabled,
            },
            policyEngine,
          )
        : undefined;
      const record = buildRealReadOnlyAdapterPolicySourceRecord({
        dryRunId: body.dryRunId,
        authoritative: true,
        supervisorBacked: true,
        persisted: true,
        degraded: false,
        notPersisted: false,
        dryRunRecordPresent: dryRunRecord !== undefined,
        configExplicitlyEnabled:
          configLoadResult.status === 'loaded' && configLoadResult.config.liveEnabled === true,
        readOnlyOnly,
        policyDecision: alignedPolicyDecision,
        dryRunPlan: dryRunRecord?.dryRunPlan,
        evidenceAuditReady: persistenceState.status === 'ok',
        fallbackUsedAsAuthority: false,
        metadata: {
          requestedBy: 'supervisor-api',
          configLoadStatus: configLoadResult.status,
          configSource: configLoadResult.source,
          historicalPolicyDecisionId: dryRunRecord?.policyDecision.id,
          historicalPolicyDecisionOutcome: dryRunRecord?.policyDecision.outcome,
          historicalPolicyMutated: false,
          source: 'apps.supervisor.real-read-only-adapter.policy-source',
        },
      });
      const evidenceRefs = createRealReadOnlyAdapterPolicySourceEvidenceRefs(record);
      const auditEvents = createRealReadOnlyAdapterPolicySourceAuditEvents(record, evidenceRefs);
      const recordWithRefs = {
        ...record,
        evidenceRefs,
        auditEventIds: auditEvents.map((event) => event.id),
      };

      for (const evidenceRef of evidenceRefs) {
        await store.evidenceRefs.create(evidenceRef);
      }

      for (const auditEvent of auditEvents) {
        await store.auditEvents.append(auditEvent);
      }

      const persistedRecord =
        await store.codexExecRealReadOnlyAdapterPolicySources.savePolicySource(recordWithRefs);

      return createRealReadOnlyAdapterPolicySourceResponse(persistedRecord, {
        evidenceRefs,
        auditEvents,
      });
    },
  );

  server.get(
    '/api/codex/exec/real-read-only-adapter/policy-sources/:recordId',
    async (request, reply) => {
      const params = request.params as { recordId?: string };

      if (!params.recordId) {
        return reply.code(400).send({
          error: 'recordId is required',
          liveExecution: false,
          externalProcessStarted: false,
          executionDisabled: true,
        });
      }

      const store = await getStore();

      if (!store) {
        return reply.code(503).send(createRealReadOnlyAdapterPolicySourceUnavailableResponse());
      }

      const record = await store.codexExecRealReadOnlyAdapterPolicySources.getPolicySource(
        params.recordId,
      );

      if (!record) {
        return reply.code(404).send({
          error: 'policy source record was not found',
          liveExecution: false,
          externalProcessStarted: false,
          executionDisabled: true,
        });
      }

      return createRealReadOnlyAdapterPolicySourceResponse(record);
    },
  );

  server.get(
    '/api/codex/exec/real-read-only-adapter/policy-sources',
    async (request, reply) => {
      const queryResult = parseRealReadOnlyAdapterPolicySourceQuery(request.query);

      if (!queryResult.allowed) {
        return reply.code(400).send({
          error: queryResult.reason,
          liveExecution: false,
          externalProcessStarted: false,
          executionDisabled: true,
        });
      }

      const store = await getStore();

      if (!store) {
        return reply.code(503).send(createRealReadOnlyAdapterPolicySourceUnavailableResponse());
      }

      const records = await store.codexExecRealReadOnlyAdapterPolicySources.listPolicySources(
        queryResult.query,
      );

      return createRealReadOnlyAdapterPolicySourceListResponse(records, queryResult.query);
    },
  );

  server.get(
    '/api/codex/exec/real-read-only-adapter/policy-source/latest/:dryRunId',
    async (request, reply) => {
      const params = request.params as { dryRunId?: string };

      if (!params.dryRunId) {
        return reply.code(400).send({
          error: 'dryRunId is required',
          liveExecution: false,
          externalProcessStarted: false,
          executionDisabled: true,
        });
      }

      const store = await getStore();

      if (!store) {
        return reply
          .code(503)
          .send(createRealReadOnlyAdapterPolicySourceUnavailableResponse(params.dryRunId));
      }

      const record = await store.codexExecRealReadOnlyAdapterPolicySources.latestPolicySource(
        params.dryRunId,
      );

      if (!record) {
        return reply.code(404).send({
          error: 'policy source record was not found',
          liveExecution: false,
          externalProcessStarted: false,
          executionDisabled: true,
        });
      }

      return createRealReadOnlyAdapterPolicySourceResponse(record);
    },
  );

  server.post('/api/codex/exec/real-read-only-adapter/attempt', async (request, reply) => {
    const body = request.body as
      | {
          dryRunId?: string;
          approvalArtifactId?: string;
          policyDecisionId?: string;
          isolatedWorktreeProvided?: boolean;
          worktreePath?: string;
        }
      | undefined;

    if (!body?.dryRunId) {
      return reply.code(400).send({
        error: 'dryRunId is required',
        liveExecution: false,
        externalProcessStarted: false,
        executionDisabled: true,
      });
    }

    const store = await getStore();

    if (!store) {
      return reply.code(503).send(createRealReadOnlyAdapterAttemptUnavailableResponse(body.dryRunId));
    }

    const configLoadResult = await getLiveConfigLoadResult();
    const config =
      configLoadResult.status === 'loaded'
        ? createRealReadOnlyAdapterConfigFromLiveConfig({
            liveConfig: configLoadResult.config,
            metadata: {
              requestedBy: 'supervisor-api',
              configLoadStatus: configLoadResult.status,
              configSource: configLoadResult.source,
              source: 'apps.supervisor.real-read-only-adapter.attempt',
            },
          })
        : createDefaultRealReadOnlyAdapterConfig({
            requestedBy: 'supervisor-api',
            configLoadStatus: configLoadResult.status,
            configSource: configLoadResult.source,
            source: 'apps.supervisor.real-read-only-adapter.attempt',
          });
    const dryRunRecord = await resolveCodexExecLiveRunRecord(body.dryRunId, store);
    const approvalRecords = dryRunRecord
      ? await resolveCodexExecApprovalRecordsForDryRun(dryRunRecord.dryRunPlanId, store)
      : [];
    const validApprovalRecord = approvalRecords.find((record) =>
      isValidUnusedApprovalRecordForPilot(record, body.approvalArtifactId),
    );
    const approvalArtifact = validApprovalRecord?.approvalArtifact;
    const latestSourcePreparation =
      await store.codexExecRealReadOnlyAdapterPilotSourcePreparations.latestPilotSourcePreparation(
        body.dryRunId,
      );
    const latestPrerequisite =
      await store.codexExecRealReadOnlyAdapterPilotPrerequisites.latestPilotPrerequisite(
        body.dryRunId,
      );
    const latestPolicySource = await store.codexExecRealReadOnlyAdapterPolicySources.latestPolicySource(
      body.dryRunId,
    );
    const authoritativePolicySourcePresent =
      latestPolicySource?.status === 'aligned' &&
      latestPolicySource.authoritative === true &&
      latestPolicySource.supervisorBacked === true &&
      latestPolicySource.persisted === true &&
      latestPolicySource.degraded === false &&
      latestPolicySource.notPersisted === false &&
      latestPolicySource.fallbackUsedAsAuthority === false &&
      latestPolicySource.policyDecisionOutcome !== 'deny';
    const policyDecisionForAttempt = authoritativePolicySourcePresent
      ? createPolicyDecisionFromRealReadOnlyAdapterPolicySource(latestPolicySource)
      : undefined;
    const authoritativeSourcePreparationPresent =
      latestSourcePreparation?.status === 'prepared' &&
      latestSourcePreparation.authoritative === true &&
      latestSourcePreparation.supervisorBacked === true &&
      latestSourcePreparation.persisted === true &&
      latestSourcePreparation.degraded === false &&
      latestSourcePreparation.notPersisted === false;
    const authoritativePrerequisiteReady =
      latestPrerequisite?.status === 'ready_for_pilot_retry' &&
      latestPrerequisite.authoritative === true &&
      latestPrerequisite.supervisorBacked === true &&
      latestPrerequisite.persisted === true &&
      latestPrerequisite.degraded === false &&
      latestPrerequisite.notPersisted === false &&
      latestPrerequisite.fallbackUsedAsAuthority === false;
    const evidenceAuditReady =
      persistenceState.status === 'ok' &&
      ((authoritativeSourcePreparationPresent &&
        (latestSourcePreparation?.evidenceRefs.length ?? 0) > 0 &&
        (latestSourcePreparation?.auditEventIds.length ?? 0) > 0) ||
        (authoritativePrerequisiteReady &&
          (latestPrerequisite?.evidenceRefs.length ?? 0) > 0 &&
          (latestPrerequisite?.auditEventIds.length ?? 0) > 0));
    const expectedWorktreePathHash =
      latestSourcePreparation?.worktreePathHash ?? latestPrerequisite?.worktreePathHash;
    const runtimeWorktreePathHash =
      body.worktreePath && body.worktreePath.trim().length > 0
        ? hashRealReadOnlyAdapterRuntimeWorktreePath(body.worktreePath)
        : undefined;
    const worktreePathHashMatched =
      expectedWorktreePathHash !== undefined && runtimeWorktreePathHash === expectedWorktreePathHash;
    const isolatedCleanWorktreeMetadataPresent =
      latestSourcePreparation?.isolatedCleanWorktreeMetadataPresent === true ||
      latestPrerequisite?.isolatedCleanWorktreeMetadataPresent === true;
    const attemptRequest = createRealReadOnlyAdapterRequest({
      dryRunId: body.dryRunId,
      config,
      approvalArtifactId: body.approvalArtifactId,
      policyDecisionId:
        body.policyDecisionId ?? policyDecisionForAttempt?.id ?? dryRunRecord?.policyDecision.id,
      metadata: {
        requestedBy: 'supervisor-api',
        isolatedWorktreeProvided:
          body.isolatedWorktreeProvided === true || body.worktreePath !== undefined,
        configLoadStatus: configLoadResult.status,
        configSource: configLoadResult.source,
        dryRunRecordPresent: dryRunRecord !== undefined,
        approvalArtifactPresent: approvalArtifact !== undefined,
        latestPolicySourceId: latestPolicySource?.id,
        policySourceReady: authoritativePolicySourcePresent,
        latestSourcePreparationId: latestSourcePreparation?.id,
        latestPrerequisiteId: latestPrerequisite?.id,
        runtimeWorktreePathHashMatched: worktreePathHashMatched,
        worktreePathStored: false,
      },
    });
    const preflight = createRealReadOnlyAdapterGuardPreflight({
      dryRunId: body.dryRunId,
      request: attemptRequest,
      config,
      dryRunPlan: dryRunRecord?.dryRunPlan,
      policyDecision: policyDecisionForAttempt,
      approvalArtifact,
      expectedDryRunPlanHash:
        latestPolicySource?.dryRunPlanHash ??
        latestSourcePreparation?.dryRunPlanHash ??
        approvalArtifact?.dryRunPlanHash,
      expectedPolicyDecisionHash:
        latestPolicySource?.policyDecisionHash ??
        latestSourcePreparation?.policyDecisionHash ??
        approvalArtifact?.policyDecisionHash,
      requestedSandboxMode: 'read_only',
      triggerKind: 'cli',
      worktree: {
        isolated:
          isolatedCleanWorktreeMetadataPresent &&
          authoritativeSourcePreparationPresent &&
          authoritativePrerequisiteReady &&
          worktreePathHashMatched,
        status:
          isolatedCleanWorktreeMetadataPresent && worktreePathHashMatched ? 'clean' : 'missing',
        pathHash: worktreePathHashMatched ? runtimeWorktreePathHash : undefined,
      },
      evidenceStoreReady: evidenceAuditReady,
      auditStoreReady: evidenceAuditReady,
      metadata: {
        requestedBy: 'supervisor-api',
        authoritativeAttemptRecord: true,
        policySourceReady: authoritativePolicySourcePresent,
        latestPolicySourceId: latestPolicySource?.id,
        sourcePreparationReady: authoritativeSourcePreparationPresent,
        prerequisiteReady: authoritativePrerequisiteReady,
        worktreePathStored: false,
      },
    });
    const boundaryResult =
      preflight.status === 'passed' && body.worktreePath && body.approvalArtifactId
        ? await runRealReadOnlyAdapterProcessBoundary(
            createRealReadOnlyAdapterProcessPlan({
              dryRunId: body.dryRunId,
              approvalArtifactId: body.approvalArtifactId,
              executablePath: 'codex',
              worktreePath: body.worktreePath,
              timeoutMs: 60_000,
              metadata: {
                executablePolicyLabel: 'codex_cli',
                executablePathStored: false,
                argvStored: false,
                worktreePathStored: false,
                source: 'apps.supervisor.real-read-only-adapter.attempt-process-plan',
              },
            }),
            { runner: options.realReadOnlyAdapterProcessRunner },
          )
        : undefined;
    const initialResult =
      boundaryResult === undefined
        ? createRealReadOnlyAdapterBlockedResult({
            request: attemptRequest,
            preflight,
            config,
            metadata: {
              requestedBy: 'supervisor-api',
              authoritativeAttemptRecord: true,
              configLoadStatus: configLoadResult.status,
              sourcePreparationReady: authoritativeSourcePreparationPresent,
              prerequisiteReady: authoritativePrerequisiteReady,
              worktreePathHashMatched,
            },
          })
        : createRealReadOnlyAdapterResultFromBoundary({
            request: attemptRequest,
            preflight,
            boundaryResult,
            metadata: {
              requestedBy: 'supervisor-api',
              authoritativeAttemptRecord: true,
              configLoadStatus: configLoadResult.status,
              executablePolicyLabel: 'codex_cli',
              worktreePathStored: false,
            },
          });
    const postRunVerificationResult =
      boundaryResult === undefined
        ? undefined
        : await runRealReadOnlyAdapterPostRunVerification(
            createRealReadOnlyAdapterPostRunVerificationPlan({
              dryRunId: body.dryRunId,
              worktreePath: body.worktreePath ?? '.',
              timeoutMs: 60_000,
              metadata: {
                requestedBy: 'supervisor-api',
                executablePolicyLabel: 'pnpm_verify_foundation',
                worktreePathStored: false,
              },
            }),
            {
              attemptStatus: boundaryResult.status,
              worktreeState:
                options.realReadOnlyAdapterPostRunWorktreeState ?? {
                  beforeStatus: 'clean',
                  afterStatus: 'unknown',
                  unexpectedDiff: true,
                  statusHash: expectedWorktreePathHash,
                },
              runner: options.realReadOnlyAdapterPostRunVerificationRunner,
            },
          );
    const telemetryInput = {
      request: attemptRequest,
      preflight,
      resultId: initialResult.id,
      resultStatus: initialResult.status,
      boundaryResult,
      metadata: {
        requestedBy: 'supervisor-api',
        authoritativeAttemptRecord: true,
        configLoadStatus: configLoadResult.status,
        postRunVerificationStatus: postRunVerificationResult?.status,
        worktreePathStored: false,
      },
    };
    const evidenceRefs = createRealReadOnlyAdapterAttemptEvidenceRefs(telemetryInput);
    const auditEvents = createRealReadOnlyAdapterAttemptAuditEvents(telemetryInput, evidenceRefs);
    const evidenceSummary = createRealReadOnlyAdapterEvidenceSummaryFromRefs(
      telemetryInput,
      evidenceRefs,
    );
    const auditSummary = createRealReadOnlyAdapterAuditSummaryFromEvents(
      telemetryInput,
      auditEvents,
    );
    const result = {
      ...initialResult,
      evidenceSummary,
      auditSummary,
    };
    const attemptRecord = createRealReadOnlyAdapterAttemptRecord({
      request: attemptRequest,
      preflight,
      result,
      boundaryResult,
      postRunVerificationResult,
      evidenceRefs,
      auditEvents,
      metadata: {
        requestedBy: 'supervisor-api',
        postRunVerificationStatus: postRunVerificationResult?.status,
      },
    });

    for (const ref of evidenceRefs) {
      await store.evidenceRefs.create(ref);
    }

    for (const event of auditEvents) {
      await store.auditEvents.append(event);
    }

    const persistedAttempt =
      await store.codexExecRealReadOnlyAdapterAttempts.saveAttempt(attemptRecord);

    return createRealReadOnlyAdapterAttemptResponse(persistedAttempt, {
      request: attemptRequest,
      preflight,
      result,
      evidenceRefs,
      auditEvents,
    });
  });

  server.get(
    '/api/codex/exec/real-read-only-adapter/attempt/:attemptId',
    async (request, reply) => {
      const params = request.params as { attemptId?: string };

      if (!params.attemptId) {
        return reply.code(400).send({
          error: 'attemptId is required',
          liveExecution: false,
          externalProcessStarted: false,
          executionDisabled: true,
        });
      }

      const store = await getStore();

      if (!store) {
        return reply.code(503).send(createRealReadOnlyAdapterAttemptUnavailableResponse());
      }

      const attemptRecord = await store.codexExecRealReadOnlyAdapterAttempts.getAttempt(
        params.attemptId,
      );

      if (!attemptRecord) {
        return reply.code(404).send({
          error: 'attempt record was not found',
          liveExecution: false,
          externalProcessStarted: false,
          executionDisabled: true,
        });
      }

      return createRealReadOnlyAdapterAttemptResponse(attemptRecord);
    },
  );

  server.get('/api/codex/exec/real-read-only-adapter/attempts', async (request, reply) => {
    const queryResult = parseRealReadOnlyAdapterAttemptQuery(request.query);

    if (!queryResult.allowed) {
      return reply.code(400).send({
        error: queryResult.reason,
        liveExecution: false,
        externalProcessStarted: false,
        executionDisabled: true,
      });
    }

    const store = await getStore();

    if (!store) {
      return reply.code(503).send(createRealReadOnlyAdapterAttemptUnavailableResponse());
    }

    const attempts = await store.codexExecRealReadOnlyAdapterAttempts.listAttempts(
      queryResult.query,
    );

    return createRealReadOnlyAdapterAttemptListResponse(attempts);
  });

  server.get(
    '/api/codex/exec/real-read-only-adapter/attempt/latest/:dryRunId',
    async (request, reply) => {
      const params = request.params as { dryRunId?: string };

      if (!params.dryRunId) {
        return reply.code(400).send({
          error: 'dryRunId is required',
          liveExecution: false,
          externalProcessStarted: false,
          executionDisabled: true,
        });
      }

      const store = await getStore();

      if (!store) {
        return reply.code(503).send(createRealReadOnlyAdapterAttemptUnavailableResponse(params.dryRunId));
      }

      const attemptRecord = await store.codexExecRealReadOnlyAdapterAttempts.latestAttempt(
        params.dryRunId,
      );

      if (!attemptRecord) {
        return reply.code(404).send({
          error: 'attempt record was not found',
          liveExecution: false,
          externalProcessStarted: false,
          executionDisabled: true,
        });
      }

      return createRealReadOnlyAdapterAttemptResponse(attemptRecord);
    },
  );

  server.get(
    '/api/codex/exec/real-read-only-adapter/attempt-timeline/:dryRunId',
    async (request, reply) => {
      const params = request.params as { dryRunId?: string };

      if (!params.dryRunId) {
        return reply.code(400).send({
          error: 'dryRunId is required',
          liveExecution: false,
          externalProcessStarted: false,
          executionDisabled: true,
        });
      }

      const queryResult = parseRealReadOnlyAdapterAttemptTimelineQuery(
        request.query,
        params.dryRunId,
      );

      if (!queryResult.allowed) {
        return reply.code(400).send({
          error: queryResult.reason,
          liveExecution: false,
          externalProcessStarted: false,
          executionDisabled: true,
        });
      }

      const store = await getStore();

      if (!store) {
        return reply
          .code(503)
          .send(createRealReadOnlyAdapterAttemptUnavailableResponse(params.dryRunId));
      }

      const attempts = await store.codexExecRealReadOnlyAdapterAttempts.listAttempts(
        queryResult.query,
      );
      const timeline = createRealReadOnlyAdapterAttemptTimeline({
        dryRunId: params.dryRunId,
        records: attempts,
        query: queryResult.query,
        metadata: {
          requestedBy: 'supervisor-api',
        },
      });

      return {
        timeline,
        attempts,
        attemptRecords: attempts,
        summaries: attempts.map((attempt) => summarizeRealReadOnlyAdapterAttempt(attempt)),
        count: attempts.length,
        authoritative: true,
        supervisorBacked: true,
        persisted: true,
        degraded: false,
        notPersisted: false,
        ...realReadOnlyAdapterAttemptSafetyFlags,
        reason: persistenceState.reason,
      };
    },
  );

  server.post(
    '/api/codex/exec/real-read-only-adapter/pilot-prerequisite-sources',
    async (request, reply) => {
      const body = request.body as
        | {
            dryRunId?: string;
            approvalArtifactId?: string;
            worktreeLabel?: string;
            worktreeStatus?: 'clean' | 'dirty' | 'missing' | 'unknown';
            worktreePathHash?: string;
            worktreePath?: string;
          }
        | undefined;

      if (!body?.dryRunId) {
        return reply.code(400).send({
          error: 'dryRunId is required',
          liveExecution: false,
          externalProcessStarted: false,
          executionDisabled: true,
        });
      }

      if (body.worktreePath) {
        return reply.code(400).send({
          error:
            'raw worktree paths are not accepted; provide worktreeLabel, worktreeStatus, and worktreePathHash',
          liveExecution: false,
          externalProcessStarted: false,
          executionDisabled: true,
          workspaceWriteAllowed: false,
          dangerFullAccessAllowed: false,
          dashboardTriggerAllowed: false,
        });
      }

      if (body.worktreeStatus && !isPilotPrerequisiteWorktreeStatus(body.worktreeStatus)) {
        return reply.code(400).send({
          error: 'worktreeStatus must be clean, dirty, missing, or unknown',
          liveExecution: false,
          externalProcessStarted: false,
          executionDisabled: true,
        });
      }

      const store = await getStore();

      if (!store) {
        return reply
          .code(503)
          .send(createRealReadOnlyAdapterPilotSourcePreparationUnavailableResponse(body.dryRunId));
      }

      const configLoadResult = await getLiveConfigLoadResult();
      const dryRunRecord = await resolveCodexExecLiveRunRecord(body.dryRunId, store);
      const approvalRecords = dryRunRecord
        ? await resolveCodexExecApprovalRecordsForDryRun(dryRunRecord.dryRunPlanId, store)
        : [];
      const latestPolicySource =
        await store.codexExecRealReadOnlyAdapterPolicySources.latestPolicySource(body.dryRunId);
      const authoritativePolicySourcePresent =
        latestPolicySource?.status === 'aligned' &&
        latestPolicySource.authoritative === true &&
        latestPolicySource.supervisorBacked === true &&
        latestPolicySource.persisted === true &&
        latestPolicySource.degraded === false &&
        latestPolicySource.notPersisted === false &&
        latestPolicySource.fallbackUsedAsAuthority === false;
      const validApprovalRecord = approvalRecords.find((record) =>
        isValidUnusedApprovalRecordForPilot(record, body.approvalArtifactId) &&
        (!authoritativePolicySourcePresent ||
          record.approvalArtifact?.policyDecisionHash === latestPolicySource.policyDecisionHash),
      );
      const approvalArtifact = validApprovalRecord?.approvalArtifact;
      const record = buildRealReadOnlyAdapterPilotSourcePreparationRecord({
        dryRunId: body.dryRunId,
        authoritative: true,
        supervisorBacked: true,
        persisted: true,
        degraded: false,
        notPersisted: false,
        dryRunRecordPresent: dryRunRecord !== undefined,
        configExplicitlyEnabled:
          configLoadResult.status === 'loaded' && configLoadResult.config.liveEnabled === true,
        authoritativePolicySourcePresent,
        validUnusedApprovalPresent: approvalArtifact !== undefined,
        approvalArtifactId: approvalArtifact?.id,
        approvalArtifactHash: approvalArtifact ? hashLocalMetadata(approvalArtifact) : undefined,
        dryRunPlanHash: latestPolicySource?.dryRunPlanHash ?? approvalArtifact?.dryRunPlanHash,
        policyDecisionHash:
          latestPolicySource?.policyDecisionHash ?? approvalArtifact?.policyDecisionHash,
        isolatedCleanWorktreeMetadataPresent:
          body.worktreeStatus === 'clean' && Boolean(body.worktreePathHash),
        worktreeLabel: body.worktreeLabel,
        worktreeStatus: body.worktreeStatus,
        worktreePathHash: body.worktreePathHash,
        evidenceAuditReady: persistenceState.status === 'ok',
        fallbackUsedAsAuthority: false,
        metadata: {
          requestedBy: 'supervisor-api',
          configLoadStatus: configLoadResult.status,
          configSource: configLoadResult.source,
          approvalArtifactIdProvided: Boolean(body.approvalArtifactId),
          latestPolicySourceId: latestPolicySource?.id,
          policySourceReady: authoritativePolicySourcePresent,
          worktreePathStored: false,
        },
      });
      const evidenceRefs = createRealReadOnlyAdapterPilotSourcePreparationEvidenceRefs(record);
      const auditEvents = createRealReadOnlyAdapterPilotSourcePreparationAuditEvents(
        record,
        evidenceRefs,
      );
      const recordWithRefs = {
        ...record,
        evidenceRefs,
        auditEventIds: auditEvents.map((event) => event.id),
      };

      for (const evidenceRef of evidenceRefs) {
        await store.evidenceRefs.create(evidenceRef);
      }

      for (const auditEvent of auditEvents) {
        await store.auditEvents.append(auditEvent);
      }

      const persistedRecord =
        await store.codexExecRealReadOnlyAdapterPilotSourcePreparations.savePilotSourcePreparation(
          recordWithRefs,
        );

      return createRealReadOnlyAdapterPilotSourcePreparationResponse(persistedRecord, {
        evidenceRefs,
        auditEvents,
      });
    },
  );

  server.get(
    '/api/codex/exec/real-read-only-adapter/pilot-prerequisite-sources/:recordId',
    async (request, reply) => {
      const params = request.params as { recordId?: string };

      if (!params.recordId) {
        return reply.code(400).send({
          error: 'recordId is required',
          liveExecution: false,
          externalProcessStarted: false,
          executionDisabled: true,
        });
      }

      const store = await getStore();

      if (!store) {
        return reply
          .code(503)
          .send(createRealReadOnlyAdapterPilotSourcePreparationUnavailableResponse());
      }

      const record =
        await store.codexExecRealReadOnlyAdapterPilotSourcePreparations.getPilotSourcePreparation(
          params.recordId,
        );

      if (!record) {
        return reply.code(404).send({
          error: 'pilot source preparation record was not found',
          liveExecution: false,
          externalProcessStarted: false,
          executionDisabled: true,
        });
      }

      return createRealReadOnlyAdapterPilotSourcePreparationResponse(record);
    },
  );

  server.get(
    '/api/codex/exec/real-read-only-adapter/pilot-prerequisite-sources',
    async (request, reply) => {
      const queryResult = parseRealReadOnlyAdapterPilotSourcePreparationQuery(request.query);

      if (!queryResult.allowed) {
        return reply.code(400).send({
          error: queryResult.reason,
          liveExecution: false,
          externalProcessStarted: false,
          executionDisabled: true,
        });
      }

      const store = await getStore();

      if (!store) {
        return reply
          .code(503)
          .send(createRealReadOnlyAdapterPilotSourcePreparationUnavailableResponse());
      }

      const records =
        await store.codexExecRealReadOnlyAdapterPilotSourcePreparations.listPilotSourcePreparations(
          queryResult.query,
        );

      return createRealReadOnlyAdapterPilotSourcePreparationListResponse(
        records,
        queryResult.query,
      );
    },
  );

  server.get(
    '/api/codex/exec/real-read-only-adapter/pilot-prerequisite-source/latest/:dryRunId',
    async (request, reply) => {
      const params = request.params as { dryRunId?: string };

      if (!params.dryRunId) {
        return reply.code(400).send({
          error: 'dryRunId is required',
          liveExecution: false,
          externalProcessStarted: false,
          executionDisabled: true,
        });
      }

      const store = await getStore();

      if (!store) {
        return reply
          .code(503)
          .send(createRealReadOnlyAdapterPilotSourcePreparationUnavailableResponse(params.dryRunId));
      }

      const record =
        await store.codexExecRealReadOnlyAdapterPilotSourcePreparations.latestPilotSourcePreparation(
          params.dryRunId,
        );

      if (!record) {
        return reply.code(404).send({
          error: 'pilot source preparation record was not found',
          liveExecution: false,
          externalProcessStarted: false,
          executionDisabled: true,
        });
      }

      return createRealReadOnlyAdapterPilotSourcePreparationResponse(record);
    },
  );

  server.post(
    '/api/codex/exec/real-read-only-adapter/pilot-prerequisites',
    async (request, reply) => {
      const body = request.body as
        | {
            dryRunId?: string;
            approvalArtifactId?: string;
            worktreeLabel?: string;
            worktreeStatus?: 'clean' | 'dirty' | 'missing' | 'unknown';
            worktreePathHash?: string;
            worktreePath?: string;
            handoffContextComplete?: boolean;
          }
        | undefined;

      if (!body?.dryRunId) {
        return reply.code(400).send({
          error: 'dryRunId is required',
          liveExecution: false,
          externalProcessStarted: false,
          executionDisabled: true,
        });
      }

      if (body.worktreePath) {
        return reply.code(400).send({
          error: 'raw worktree paths are not accepted; provide worktreeLabel, worktreeStatus, and worktreePathHash',
          liveExecution: false,
          externalProcessStarted: false,
          executionDisabled: true,
          workspaceWriteAllowed: false,
          dangerFullAccessAllowed: false,
          dashboardTriggerAllowed: false,
        });
      }

      if (body.worktreeStatus && !isPilotPrerequisiteWorktreeStatus(body.worktreeStatus)) {
        return reply.code(400).send({
          error: 'worktreeStatus must be clean, dirty, missing, or unknown',
          liveExecution: false,
          externalProcessStarted: false,
          executionDisabled: true,
        });
      }

      const store = await getStore();

      if (!store) {
        return reply
          .code(503)
          .send(createRealReadOnlyAdapterPilotPrerequisiteUnavailableResponse(body.dryRunId));
      }

      const configLoadResult = await getLiveConfigLoadResult();
      const dryRunRecord = await resolveCodexExecLiveRunRecord(body.dryRunId, store);
      const approvalRecords = dryRunRecord
        ? await resolveCodexExecApprovalRecordsForDryRun(dryRunRecord.dryRunPlanId, store)
        : [];
      const latestAttempt = await store.codexExecRealReadOnlyAdapterAttempts.latestAttempt(
        body.dryRunId,
      );
      const latestSourcePreparation =
        await store.codexExecRealReadOnlyAdapterPilotSourcePreparations.latestPilotSourcePreparation(
          body.dryRunId,
        );
      const latestPolicySource =
        await store.codexExecRealReadOnlyAdapterPolicySources.latestPolicySource(body.dryRunId);
      const authoritativePolicySourcePresent =
        latestPolicySource?.status === 'aligned' &&
        latestPolicySource.authoritative === true &&
        latestPolicySource.supervisorBacked === true &&
        latestPolicySource.persisted === true &&
        latestPolicySource.degraded === false &&
        latestPolicySource.notPersisted === false &&
        latestPolicySource.fallbackUsedAsAuthority === false;
      const validUnusedApprovalPresent = approvalRecords.some((record) =>
        isValidUnusedApprovalRecordForPilot(record, body.approvalArtifactId) &&
        (!authoritativePolicySourcePresent ||
          record.approvalArtifact?.policyDecisionHash === latestPolicySource?.policyDecisionHash),
      );
      const authoritativeAttemptEvidencePresent =
        latestAttempt?.authoritative === true &&
        latestAttempt.supervisorBacked === true &&
        latestAttempt.persisted === true &&
        latestAttempt.degraded === false &&
        latestAttempt.notPersisted === false;
      const authoritativeSourcePreparationPresent =
        latestSourcePreparation?.status === 'prepared' &&
        latestSourcePreparation.authoritative === true &&
        latestSourcePreparation.supervisorBacked === true &&
        latestSourcePreparation.persisted === true &&
        latestSourcePreparation.degraded === false &&
        latestSourcePreparation.notPersisted === false;
      const evidenceAuditReady =
        (authoritativeAttemptEvidencePresent &&
          (latestAttempt?.evidenceRefIds.length ?? 0) > 0 &&
          (latestAttempt?.auditEventIds.length ?? 0) > 0) ||
        (authoritativeSourcePreparationPresent &&
          (latestSourcePreparation?.evidenceRefs.length ?? 0) > 0 &&
          (latestSourcePreparation?.auditEventIds.length ?? 0) > 0);
      const record = buildRealReadOnlyAdapterPilotPrerequisiteRecord({
        dryRunId: body.dryRunId,
        authoritative: true,
        supervisorBacked: true,
        persisted: true,
        degraded: false,
        notPersisted: false,
        dryRunRecordPresent: dryRunRecord !== undefined,
        configExplicitlyEnabled:
          configLoadResult.status === 'loaded' && configLoadResult.config.liveEnabled === true,
        validUnusedApprovalPresent,
        isolatedCleanWorktreeMetadataPresent:
          body.worktreeStatus === 'clean' && Boolean(body.worktreePathHash),
        authoritativePolicySourcePresent,
        authoritativeSourcePreparationPresent,
        authoritativeAttemptEvidencePresent,
        evidenceAuditReady,
        fallbackUsedAsAuthority: false,
        handoffContextComplete: body.handoffContextComplete,
        worktreeLabel: body.worktreeLabel,
        worktreeStatus: body.worktreeStatus,
        worktreePathHash: body.worktreePathHash,
        metadata: {
          requestedBy: 'supervisor-api',
          configLoadStatus: configLoadResult.status,
          configSource: configLoadResult.source,
          approvalArtifactIdProvided: Boolean(body.approvalArtifactId),
          latestPolicySourceId: latestPolicySource?.id,
          policySourceReady: authoritativePolicySourcePresent,
          latestAttemptId: latestAttempt?.id,
          latestSourcePreparationId: latestSourcePreparation?.id,
          worktreePathStored: false,
        },
      });
      const evidenceRefs = createRealReadOnlyAdapterPilotPrerequisiteEvidenceRefs(record);
      const auditEvents = createRealReadOnlyAdapterPilotPrerequisiteAuditEvents(
        record,
        evidenceRefs,
      );
      const recordWithRefs = {
        ...record,
        evidenceRefs,
        auditEventIds: auditEvents.map((event) => event.id),
      };

      for (const evidenceRef of evidenceRefs) {
        await store.evidenceRefs.create(evidenceRef);
      }

      for (const auditEvent of auditEvents) {
        await store.auditEvents.append(auditEvent);
      }

      const persistedRecord =
        await store.codexExecRealReadOnlyAdapterPilotPrerequisites.savePilotPrerequisite(
          recordWithRefs,
        );

      return createRealReadOnlyAdapterPilotPrerequisiteResponse(persistedRecord, {
        evidenceRefs,
        auditEvents,
      });
    },
  );

  server.get(
    '/api/codex/exec/real-read-only-adapter/pilot-prerequisites/:recordId',
    async (request, reply) => {
      const params = request.params as { recordId?: string };

      if (!params.recordId) {
        return reply.code(400).send({
          error: 'recordId is required',
          liveExecution: false,
          externalProcessStarted: false,
          executionDisabled: true,
        });
      }

      const store = await getStore();

      if (!store) {
        return reply.code(503).send(createRealReadOnlyAdapterPilotPrerequisiteUnavailableResponse());
      }

      const record = await store.codexExecRealReadOnlyAdapterPilotPrerequisites.getPilotPrerequisite(
        params.recordId,
      );

      if (!record) {
        return reply.code(404).send({
          error: 'pilot prerequisite record was not found',
          liveExecution: false,
          externalProcessStarted: false,
          executionDisabled: true,
        });
      }

      return createRealReadOnlyAdapterPilotPrerequisiteResponse(record);
    },
  );

  server.get('/api/codex/exec/real-read-only-adapter/pilot-prerequisites', async (request, reply) => {
    const queryResult = parseRealReadOnlyAdapterPilotPrerequisiteQuery(request.query);

    if (!queryResult.allowed) {
      return reply.code(400).send({
        error: queryResult.reason,
        liveExecution: false,
        externalProcessStarted: false,
        executionDisabled: true,
      });
    }

    const store = await getStore();

    if (!store) {
      return reply.code(503).send(createRealReadOnlyAdapterPilotPrerequisiteUnavailableResponse());
    }

    const records =
      await store.codexExecRealReadOnlyAdapterPilotPrerequisites.listPilotPrerequisites(
        queryResult.query,
      );

    return createRealReadOnlyAdapterPilotPrerequisiteListResponse(records, queryResult.query);
  });

  server.get(
    '/api/codex/exec/real-read-only-adapter/pilot-prerequisite/latest/:dryRunId',
    async (request, reply) => {
      const params = request.params as { dryRunId?: string };

      if (!params.dryRunId) {
        return reply.code(400).send({
          error: 'dryRunId is required',
          liveExecution: false,
          externalProcessStarted: false,
          executionDisabled: true,
        });
      }

      const store = await getStore();

      if (!store) {
        return reply
          .code(503)
          .send(createRealReadOnlyAdapterPilotPrerequisiteUnavailableResponse(params.dryRunId));
      }

      const record =
        await store.codexExecRealReadOnlyAdapterPilotPrerequisites.latestPilotPrerequisite(
          params.dryRunId,
        );

      if (!record) {
        return reply.code(404).send({
          error: 'pilot prerequisite record was not found',
          liveExecution: false,
          externalProcessStarted: false,
          executionDisabled: true,
        });
      }

      return createRealReadOnlyAdapterPilotPrerequisiteResponse(record);
    },
  );

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

  server.get('/api/codex/exec/adr-draft/:dryRunId', async (request, reply) => {
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
    const adrDraft = buildCodexExecLiveAdapterAdrDraft({
      dryRunId,
      governancePackage,
      format: queryResult.format,
      includeEvidence: queryResult.includeEvidence,
      includeAudit: queryResult.includeAudit,
      degraded: persistenceState.status !== 'ok',
      reason: persistenceState.reason,
    });
    const exportResult =
      queryResult.format === 'markdown'
        ? renderCodexExecLiveAdapterAdrDraftMarkdown(adrDraft)
        : renderCodexExecLiveAdapterAdrDraftJson(adrDraft);

    return reply.code(adrDraft.status === 'not_found' ? 404 : 200).send({
      adrDraft,
      exportResult,
      renderedContent: exportResult.renderedContent,
      recommendationGrantsExecution: false,
      liveExecution: false,
      externalProcessStarted: false,
      executionDisabled: true,
      degraded: persistenceState.status !== 'ok',
      reason: persistenceState.reason,
    });
  });

  server.post('/api/codex/exec/live-adapter-adr-decision', async (request, reply) => {
    const body = request.body as
      | {
          dryRunId?: string;
          reviewerLabel?: string;
          rationaleSummary?: string;
          decision?: CodexExecLiveAdapterAdrDecisionOutcome;
          status?: CodexExecLiveAdapterAdrDecisionStatus;
        }
      | undefined;

    if (!body?.dryRunId || !body.reviewerLabel) {
      return reply.code(400).send({
        error: 'dryRunId and reviewerLabel are required',
        liveExecution: false,
        externalProcessStarted: false,
        executionDisabled: true,
      });
    }

    if (body.decision && !liveAdapterAdrDecisionOutcomes.has(body.decision)) {
      return reply.code(400).send({
        error: 'unsupported ADR decision outcome',
        liveExecution: false,
        externalProcessStarted: false,
        executionDisabled: true,
      });
    }

    if (body.status && !liveAdapterAdrDecisionStatuses.has(body.status)) {
      return reply.code(400).send({
        error: 'unsupported ADR decision status',
        liveExecution: false,
        externalProcessStarted: false,
        executionDisabled: true,
      });
    }

    const store = await getStore();
    const dryRunRecord = await resolveCodexExecLiveRunRecord(body.dryRunId, store);

    if (!dryRunRecord) {
      return reply.code(404).send({
        error: 'dry-run record was not found',
        liveExecution: false,
        externalProcessStarted: false,
        executionDisabled: true,
      });
    }

    const draftRecord = createCodexExecLiveAdapterAdrDecisionRecord({
      dryRunId: dryRunRecord.dryRunPlanId,
      reviewerLabel: body.reviewerLabel,
      rationaleSummary: body.rationaleSummary,
      decision: body.decision,
      status: body.status,
      metadata: { liveRunRecordId: dryRunRecord.id },
    });
    const evidenceRefs = createCodexExecLiveAdapterAdrDecisionEvidenceRefs(draftRecord);
    const auditEvents = createCodexExecLiveAdapterAdrDecisionAuditEvents(draftRecord, evidenceRefs);
    const decisionRecord = {
      ...draftRecord,
      evidenceRefs,
      auditEventIds: auditEvents.map((event) => event.id),
    };

    await persistCodexExecLiveAdapterAdrDecisionRecord(decisionRecord, store);

    if (store) {
      for (const evidenceRef of evidenceRefs) {
        await store.evidenceRefs.create(evidenceRef);
      }

      for (const auditEvent of auditEvents) {
        await store.auditEvents.append(auditEvent);
      }
    }

    return {
      decisionRecord,
      summary: summarizeCodexExecLiveAdapterAdrDecision(decisionRecord),
      evidenceRefs,
      auditEvents,
      implementationApproved: false,
      processAdapterApproved: false,
      recommendationGrantsExecution: false,
      liveExecution: false,
      externalProcessStarted: false,
      executionDisabled: true,
      degraded: persistenceState.status !== 'ok',
      reason: persistenceState.reason,
    };
  });

  server.get('/api/codex/exec/live-adapter-adr-decision/:decisionId', async (request, reply) => {
    const params = request.params as { decisionId?: string };

    if (!params.decisionId) {
      return reply.code(400).send({
        error: 'decisionId is required',
        liveExecution: false,
        externalProcessStarted: false,
        executionDisabled: true,
      });
    }

    const store = await getStore();
    const decisionRecord = await resolveCodexExecLiveAdapterAdrDecisionRecord(
      params.decisionId,
      store,
    );

    if (!decisionRecord) {
      return reply.code(404).send({
        error: 'ADR decision record was not found',
        liveExecution: false,
        externalProcessStarted: false,
        executionDisabled: true,
      });
    }

    return createCodexExecLiveAdapterAdrDecisionResponse(decisionRecord);
  });

  server.get('/api/codex/exec/live-adapter-adr-decisions', async (request, reply) => {
    const queryResult = parseLiveAdapterAdrDecisionQuery(request.query);

    if (!queryResult.allowed) {
      return reply.code(400).send({
        error: queryResult.reason,
        liveExecution: false,
        externalProcessStarted: false,
        executionDisabled: true,
      });
    }

    const store = await getStore();
    const records = await listCodexExecLiveAdapterAdrDecisionRecords(store, queryResult.query);

    return {
      decisions: listCodexExecLiveAdapterAdrDecisionSummaries(records, queryResult.query),
      records,
      implementationApproved: false,
      processAdapterApproved: false,
      recommendationGrantsExecution: false,
      liveExecution: false,
      externalProcessStarted: false,
      executionDisabled: true,
      degraded: persistenceState.status !== 'ok',
      reason: persistenceState.reason,
    };
  });

  server.get(
    '/api/codex/exec/live-adapter-adr-decision/latest/:dryRunId',
    async (request, reply) => {
      const params = request.params as { dryRunId?: string };

      if (!params.dryRunId) {
        return reply.code(400).send({
          error: 'dryRunId is required',
          liveExecution: false,
          externalProcessStarted: false,
          executionDisabled: true,
        });
      }

      const store = await getStore();
      const records = await listCodexExecLiveAdapterAdrDecisionRecords(store, {
        dryRunId: params.dryRunId,
        limit: 50,
      });
      const latest = getLatestCodexExecLiveAdapterAdrDecision(records, params.dryRunId);

      if (!latest) {
        return reply.code(404).send({
          error: 'ADR decision record was not found',
          liveExecution: false,
          externalProcessStarted: false,
          executionDisabled: true,
        });
      }

      return createCodexExecLiveAdapterAdrDecisionResponse(latest);
    },
  );

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

  async function resolveCodexExecLiveAdapterAdrDecisionRecord(
    decisionId: string,
    store: CodexHubStore | undefined,
  ): Promise<CodexExecLiveAdapterAdrDecisionRecord | undefined> {
    return store
      ? await store.codexExecLiveAdapterAdrDecisions.getDecision(decisionId)
      : codexLiveAdapterAdrDecisionRecords.find((record) => record.id === decisionId);
  }

  async function listCodexExecLiveAdapterAdrDecisionRecords(
    store: CodexHubStore | undefined,
    query: Partial<CodexExecLiveAdapterAdrDecisionQuery>,
  ): Promise<CodexExecLiveAdapterAdrDecisionRecord[]> {
    return store
      ? await store.codexExecLiveAdapterAdrDecisions.listDecisions(query)
      : filterInMemoryLiveAdapterAdrDecisions(codexLiveAdapterAdrDecisionRecords, query);
  }

  async function persistCodexExecLiveAdapterAdrDecisionRecord(
    record: CodexExecLiveAdapterAdrDecisionRecord,
    store: CodexHubStore | undefined,
  ): Promise<void> {
    if (store) {
      await store.codexExecLiveAdapterAdrDecisions.saveDecision(record);
      return;
    }

    const existingIndex = codexLiveAdapterAdrDecisionRecords.findIndex(
      (candidate) => candidate.id === record.id,
    );

    if (existingIndex >= 0) {
      codexLiveAdapterAdrDecisionRecords.splice(existingIndex, 1, record);
    } else {
      codexLiveAdapterAdrDecisionRecords.unshift(record);
    }
  }

  function createCodexExecLiveAdapterAdrDecisionResponse(
    decisionRecord: CodexExecLiveAdapterAdrDecisionRecord,
  ) {
    return {
      decisionRecord,
      summary: summarizeCodexExecLiveAdapterAdrDecision(decisionRecord),
      implementationApproved: false,
      processAdapterApproved: false,
      recommendationGrantsExecution: false,
      liveExecution: false,
      externalProcessStarted: false,
      executionDisabled: true,
      degraded: persistenceState.status !== 'ok',
      reason: persistenceState.reason,
    };
  }

  async function resolveReadOnlyAdapterSimulatorReviewRecord(
    reviewId: string,
    store: CodexHubStore | undefined,
  ): Promise<CodexExecReadOnlyAdapterSimulatorReviewDecisionRecord | undefined> {
    return store
      ? await store.codexExecReadOnlyAdapterSimulatorReviews.getSimulatorReview(reviewId)
      : readOnlyAdapterSimulatorReviewRecords.find((record) => record.id === reviewId);
  }

  async function listReadOnlyAdapterSimulatorReviewRecords(
    store: CodexHubStore | undefined,
    query: Partial<CodexExecReadOnlyAdapterSimulatorReviewQuery>,
  ): Promise<CodexExecReadOnlyAdapterSimulatorReviewDecisionRecord[]> {
    return store
      ? await store.codexExecReadOnlyAdapterSimulatorReviews.listSimulatorReviews(query)
      : filterInMemoryReadOnlyAdapterSimulatorReviews(readOnlyAdapterSimulatorReviewRecords, query);
  }

  async function persistReadOnlyAdapterSimulatorReviewRecord(
    record: CodexExecReadOnlyAdapterSimulatorReviewDecisionRecord,
    store: CodexHubStore | undefined,
  ): Promise<void> {
    if (store) {
      await store.codexExecReadOnlyAdapterSimulatorReviews.saveSimulatorReview(record);
      return;
    }

    const existingIndex = readOnlyAdapterSimulatorReviewRecords.findIndex(
      (candidate) => candidate.id === record.id,
    );

    if (existingIndex >= 0) {
      readOnlyAdapterSimulatorReviewRecords.splice(existingIndex, 1, record);
    } else {
      readOnlyAdapterSimulatorReviewRecords.unshift(record);
    }
  }

  function createReadOnlyAdapterSimulatorReviewResponse(
    reviewRecord: CodexExecReadOnlyAdapterSimulatorReviewDecisionRecord,
    evidenceRefs = reviewRecord.evidenceRefs,
    auditEvents: ReturnType<typeof createReadOnlyAdapterSimulatorReviewAuditEvents> = [],
  ) {
    return {
      reviewRecord,
      summary: summarizeReadOnlyAdapterSimulatorReview(reviewRecord),
      evidenceRefs,
      auditEvents,
      liveExecution: false,
      externalProcessStarted: false,
      executionDisabled: true,
      processAdapterStarted: false,
      implementationApproved: false,
      processAdapterApproved: false,
      dashboardTriggerAllowed: false,
      recommendationGrantsExecution: false,
      degraded: persistenceState.status !== 'ok',
      reason: persistenceState.reason,
    };
  }

  async function resolveReadOnlyAdapterImplementationPlanReviewRecord(
    reviewId: string,
    store: CodexHubStore | undefined,
  ): Promise<CodexExecReadOnlyAdapterImplementationPlanReviewDecisionRecord | undefined> {
    return store
      ? await store.codexExecReadOnlyAdapterImplementationPlanReviews.getImplementationPlanReview(
          reviewId,
        )
      : readOnlyAdapterImplementationPlanReviewRecords.find((record) => record.id === reviewId);
  }

  async function listReadOnlyAdapterImplementationPlanReviewRecords(
    store: CodexHubStore | undefined,
    query: Partial<CodexExecReadOnlyAdapterImplementationPlanReviewQuery>,
  ): Promise<CodexExecReadOnlyAdapterImplementationPlanReviewDecisionRecord[]> {
    return store
      ? await store.codexExecReadOnlyAdapterImplementationPlanReviews.listImplementationPlanReviews(
          query,
        )
      : filterInMemoryReadOnlyAdapterImplementationPlanReviews(
          readOnlyAdapterImplementationPlanReviewRecords,
          query,
        );
  }

  async function persistReadOnlyAdapterImplementationPlanReviewRecord(
    record: CodexExecReadOnlyAdapterImplementationPlanReviewDecisionRecord,
    store: CodexHubStore | undefined,
  ): Promise<void> {
    if (store) {
      await store.codexExecReadOnlyAdapterImplementationPlanReviews.saveImplementationPlanReview(
        record,
      );
      return;
    }

    const existingIndex = readOnlyAdapterImplementationPlanReviewRecords.findIndex(
      (candidate) => candidate.id === record.id,
    );

    if (existingIndex >= 0) {
      readOnlyAdapterImplementationPlanReviewRecords.splice(existingIndex, 1, record);
    } else {
      readOnlyAdapterImplementationPlanReviewRecords.unshift(record);
    }
  }

  function createReadOnlyAdapterImplementationPlanReviewResponse(
    reviewRecord: CodexExecReadOnlyAdapterImplementationPlanReviewDecisionRecord,
    evidenceRefs = reviewRecord.evidenceRefs,
    auditEvents: ReturnType<typeof createReadOnlyAdapterImplementationPlanReviewAuditEvents> = [],
  ) {
    return {
      reviewRecord,
      summary: summarizeReadOnlyAdapterImplementationPlanReview(reviewRecord),
      evidenceRefs,
      auditEvents,
      liveExecution: false,
      externalProcessStarted: false,
      executionDisabled: true,
      processAdapterStarted: false,
      implementationApproved: false,
      processAdapterApproved: false,
      dashboardTriggerAllowed: false,
      recommendationGrantsExecution: false,
      workspaceWriteAllowed: false,
      dangerFullAccessAllowed: false,
      degraded: persistenceState.status !== 'ok',
      reason: persistenceState.reason,
    };
  }

  async function listReadOnlyAdapterSkeletonReviewRecords(
    store: CodexHubStore | undefined,
    query: Partial<CodexExecReadOnlyAdapterSkeletonReviewQuery>,
  ): Promise<CodexExecReadOnlyAdapterSkeletonReviewDecisionRecord[]> {
    return store
      ? await store.codexExecReadOnlyAdapterSkeletonReviews.listSkeletonReviews(query)
      : filterInMemoryReadOnlyAdapterSkeletonReviews(readOnlyAdapterSkeletonReviewRecords, query);
  }

  async function persistReadOnlyAdapterSkeletonReviewRecord(
    record: CodexExecReadOnlyAdapterSkeletonReviewDecisionRecord,
    store: CodexHubStore | undefined,
  ): Promise<void> {
    if (store) {
      await store.codexExecReadOnlyAdapterSkeletonReviews.saveSkeletonReview(record);
      return;
    }

    const existingIndex = readOnlyAdapterSkeletonReviewRecords.findIndex(
      (candidate) => candidate.id === record.id,
    );

    if (existingIndex >= 0) {
      readOnlyAdapterSkeletonReviewRecords.splice(existingIndex, 1, record);
    } else {
      readOnlyAdapterSkeletonReviewRecords.unshift(record);
    }
  }

  async function resolveReadOnlyAdapterSkeletonReviewRecord(
    id: string,
    store: CodexHubStore | undefined,
  ): Promise<CodexExecReadOnlyAdapterSkeletonReviewDecisionRecord | undefined> {
    return store
      ? await store.codexExecReadOnlyAdapterSkeletonReviews.getSkeletonReview(id)
      : readOnlyAdapterSkeletonReviewRecords.find((record) => record.id === id);
  }

  function createReadOnlyAdapterSkeletonReviewResponse(
    reviewRecord: CodexExecReadOnlyAdapterSkeletonReviewDecisionRecord,
    evidenceRefs = reviewRecord.evidenceRefs,
    auditEvents: ReturnType<typeof createReadOnlyAdapterSkeletonReviewAuditEvents> = [],
  ) {
    return {
      reviewRecord,
      summary: summarizeReadOnlyAdapterSkeletonReview(reviewRecord),
      evidenceRefs,
      auditEvents,
      liveExecution: false,
      externalProcessStarted: false,
      executionDisabled: true,
      processAdapterStarted: false,
      implementationApproved: false,
      processAdapterApproved: false,
      dashboardTriggerAllowed: false,
      recommendationGrantsExecution: false,
      workspaceWriteAllowed: false,
      dangerFullAccessAllowed: false,
      degraded: persistenceState.status !== 'ok',
      reason: persistenceState.reason,
    };
  }

  async function listReadOnlyAdapterFinalReadinessRecords(
    store: CodexHubStore | undefined,
    query: Partial<CodexExecReadOnlyAdapterFinalReadinessQuery>,
  ): Promise<CodexExecReadOnlyAdapterFinalReadinessDecisionRecord[]> {
    return store
      ? await store.codexExecReadOnlyAdapterFinalReadiness.listFinalReadinessRecords(query)
      : filterInMemoryReadOnlyAdapterFinalReadiness(readOnlyAdapterFinalReadinessRecords, query);
  }

  async function persistReadOnlyAdapterFinalReadinessRecord(
    record: CodexExecReadOnlyAdapterFinalReadinessDecisionRecord,
    store: CodexHubStore | undefined,
  ): Promise<void> {
    if (store) {
      await store.codexExecReadOnlyAdapterFinalReadiness.saveFinalReadiness(record);
      return;
    }

    const existingIndex = readOnlyAdapterFinalReadinessRecords.findIndex(
      (candidate) => candidate.id === record.id,
    );

    if (existingIndex >= 0) {
      readOnlyAdapterFinalReadinessRecords.splice(existingIndex, 1, record);
    } else {
      readOnlyAdapterFinalReadinessRecords.unshift(record);
    }
  }

  function createReadOnlyAdapterFinalReadinessResponse(
    decisionRecord: CodexExecReadOnlyAdapterFinalReadinessDecisionRecord,
    evidenceRefs = decisionRecord.evidenceRefs,
    auditEvents: ReturnType<typeof createReadOnlyAdapterFinalReadinessAuditEvents> = [],
  ) {
    return {
      decisionRecord,
      summary: summarizeReadOnlyAdapterFinalReadiness(decisionRecord),
      evidenceRefs,
      auditEvents,
      liveExecution: false,
      externalProcessStarted: false,
      executionDisabled: true,
      processAdapterStarted: false,
      implementationApproved: false,
      processAdapterApproved: false,
      dashboardTriggerAllowed: false,
      recommendationGrantsExecution: false,
      workspaceWriteAllowed: false,
      dangerFullAccessAllowed: false,
      degraded: persistenceState.status !== 'ok',
      reason: persistenceState.reason,
    };
  }

  async function resolveRealReadOnlyAdapterReadinessPackage(
    packageId: string,
    store: CodexHubStore | undefined,
  ): Promise<CodexExecRealReadOnlyAdapterReadinessPackage | undefined> {
    return store
      ? await store.codexExecRealReadOnlyAdapterReadiness.getReadinessPackage(packageId)
      : realReadOnlyAdapterReadinessPackages.find(
          (packageRecord) => packageRecord.id === packageId,
        );
  }

  async function listRealReadOnlyAdapterReadinessPackages(
    store: CodexHubStore | undefined,
    query: Partial<CodexExecRealReadOnlyAdapterReadinessQuery>,
  ): Promise<CodexExecRealReadOnlyAdapterReadinessPackage[]> {
    return store
      ? await store.codexExecRealReadOnlyAdapterReadiness.listReadinessPackages(query)
      : filterInMemoryRealReadOnlyAdapterReadinessPackages(
          realReadOnlyAdapterReadinessPackages,
          query,
        );
  }

  async function latestRealReadOnlyAdapterReadinessPackage(
    dryRunId: string,
    store: CodexHubStore | undefined,
  ): Promise<CodexExecRealReadOnlyAdapterReadinessPackage | undefined> {
    return store
      ? await store.codexExecRealReadOnlyAdapterReadiness.latestReadinessPackage(dryRunId)
      : filterInMemoryRealReadOnlyAdapterReadinessPackages(realReadOnlyAdapterReadinessPackages, {
          dryRunId,
          limit: 1,
        })[0];
  }

  async function persistRealReadOnlyAdapterReadinessPackage(
    packageRecord: CodexExecRealReadOnlyAdapterReadinessPackage,
    store: CodexHubStore | undefined,
  ): Promise<void> {
    if (store) {
      await store.codexExecRealReadOnlyAdapterReadiness.saveReadinessPackage(packageRecord);
      return;
    }

    const existingIndex = realReadOnlyAdapterReadinessPackages.findIndex(
      (candidate) => candidate.id === packageRecord.id,
    );

    if (existingIndex >= 0) {
      realReadOnlyAdapterReadinessPackages.splice(existingIndex, 1, packageRecord);
    } else {
      realReadOnlyAdapterReadinessPackages.unshift(packageRecord);
    }
  }

  function createRealReadOnlyAdapterReadinessResponse(
    packageRecord: CodexExecRealReadOnlyAdapterReadinessPackage,
    evidenceRefs = packageRecord.evidenceRefs,
    auditEvents: ReturnType<typeof createRealReadOnlyAdapterReadinessAuditEvents> = [],
  ) {
    return {
      package: packageRecord,
      summary: summarizeRealReadOnlyAdapterReadinessPackage(packageRecord),
      evidenceRefs,
      auditEvents,
      recommendation: REAL_READ_ONLY_ADAPTER_READINESS_RECOMMENDATION,
      liveExecution: false,
      externalProcessStarted: false,
      executionDisabled: true,
      processAdapterStarted: false,
      implementationApproved: false,
      processAdapterApproved: false,
      recommendationGrantsExecution: false,
      workspaceWriteAllowed: false,
      dangerFullAccessAllowed: false,
      dashboardTriggerAllowed: false,
      degraded: persistenceState.status !== 'ok',
      notPersisted: false,
      reason: persistenceState.reason,
    };
  }

  async function resolveRealReadOnlyAdapterReadinessReview(
    reviewId: string,
    store: CodexHubStore | undefined,
  ): Promise<CodexExecRealReadOnlyAdapterReadinessReviewDecisionRecord | undefined> {
    return store
      ? await store.codexExecRealReadOnlyAdapterReadinessReviews.getReadinessReview(reviewId)
      : realReadOnlyAdapterReadinessReviewRecords.find((record) => record.id === reviewId);
  }

  async function listRealReadOnlyAdapterReadinessReviews(
    store: CodexHubStore | undefined,
    query: Partial<CodexExecRealReadOnlyAdapterReadinessReviewQuery>,
  ): Promise<CodexExecRealReadOnlyAdapterReadinessReviewDecisionRecord[]> {
    return store
      ? await store.codexExecRealReadOnlyAdapterReadinessReviews.listReadinessReviews(query)
      : filterInMemoryRealReadOnlyAdapterReadinessReviews(
          realReadOnlyAdapterReadinessReviewRecords,
          query,
        );
  }

  async function latestRealReadOnlyAdapterReadinessReview(
    dryRunId: string,
    store: CodexHubStore | undefined,
  ): Promise<CodexExecRealReadOnlyAdapterReadinessReviewDecisionRecord | undefined> {
    return store
      ? await store.codexExecRealReadOnlyAdapterReadinessReviews.latestReadinessReview(dryRunId)
      : filterInMemoryRealReadOnlyAdapterReadinessReviews(
          realReadOnlyAdapterReadinessReviewRecords,
          {
            dryRunId,
            limit: 1,
          },
        )[0];
  }

  async function persistRealReadOnlyAdapterReadinessReview(
    reviewRecord: CodexExecRealReadOnlyAdapterReadinessReviewDecisionRecord,
    store: CodexHubStore | undefined,
  ): Promise<void> {
    if (store) {
      await store.codexExecRealReadOnlyAdapterReadinessReviews.saveReadinessReview(reviewRecord);
      return;
    }

    const existingIndex = realReadOnlyAdapterReadinessReviewRecords.findIndex(
      (candidate) => candidate.id === reviewRecord.id,
    );

    if (existingIndex >= 0) {
      realReadOnlyAdapterReadinessReviewRecords.splice(existingIndex, 1, reviewRecord);
    } else {
      realReadOnlyAdapterReadinessReviewRecords.unshift(reviewRecord);
    }
  }

  function createRealReadOnlyAdapterReadinessReviewResponse(
    reviewRecord: CodexExecRealReadOnlyAdapterReadinessReviewDecisionRecord,
    evidenceRefs = reviewRecord.evidenceRefs,
    auditEvents: ReturnType<typeof createRealReadOnlyAdapterReadinessReviewAuditEvents> = [],
  ) {
    return {
      reviewRecord,
      summary: summarizeRealReadOnlyAdapterReadinessReview(reviewRecord),
      evidenceRefs,
      auditEvents,
      recommendation: REAL_READ_ONLY_ADAPTER_READINESS_REVIEW_RECOMMENDATION,
      liveExecution: false,
      externalProcessStarted: false,
      executionDisabled: true,
      processAdapterStarted: false,
      implementationApproved: false,
      processAdapterApproved: false,
      recommendationGrantsExecution: false,
      workspaceWriteAllowed: false,
      dangerFullAccessAllowed: false,
      dashboardTriggerAllowed: false,
      degraded: persistenceState.status !== 'ok',
      notPersisted: false,
      reason: persistenceState.reason,
    };
  }

  function createRealReadOnlyAdapterAttemptResponse(
    attemptRecord: CodexExecRealReadOnlyAdapterAttemptRecord,
    details: {
      request?: ReturnType<typeof createRealReadOnlyAdapterRequest>;
      preflight?: ReturnType<typeof createRealReadOnlyAdapterGuardPreflight>;
      result?:
        | ReturnType<typeof createRealReadOnlyAdapterBlockedResult>
        | ReturnType<typeof createRealReadOnlyAdapterResultFromBoundary>;
      evidenceRefs?: ReturnType<typeof createRealReadOnlyAdapterAttemptEvidenceRefs>;
      auditEvents?: ReturnType<typeof createRealReadOnlyAdapterAttemptAuditEvents>;
    } = {},
  ) {
    return {
      attempt: attemptRecord,
      attemptRecord,
      summary: summarizeRealReadOnlyAdapterAttempt(attemptRecord),
      request: details.request,
      preflight: details.preflight,
      result: details.result,
      evidenceRefs: details.evidenceRefs ?? [],
      auditEvents: details.auditEvents ?? [],
      authoritative: true,
      supervisorBacked: true,
      persisted: true,
      degraded: false,
      notPersisted: false,
      ...realReadOnlyAdapterAttemptSafetyFlags,
      reason: persistenceState.reason,
    };
  }

  function createRealReadOnlyAdapterAttemptListResponse(
    attempts: CodexExecRealReadOnlyAdapterAttemptRecord[],
  ) {
    return {
      attempts,
      attemptRecords: attempts,
      summaries: attempts.map((attempt) => summarizeRealReadOnlyAdapterAttempt(attempt)),
      count: attempts.length,
      authoritative: true,
      supervisorBacked: true,
      persisted: true,
      degraded: false,
      notPersisted: false,
      ...realReadOnlyAdapterAttemptSafetyFlags,
      reason: persistenceState.reason,
    };
  }

  function createRealReadOnlyAdapterAttemptUnavailableResponse(dryRunId?: string) {
    return {
      error: 'real read-only adapter attempt store is unavailable',
      dryRunId,
      authoritative: false,
      supervisorBacked: false,
      persisted: false,
      degraded: true,
      notPersisted: true,
      ...realReadOnlyAdapterAttemptSafetyFlags,
      reason: persistenceState.reason ?? 'store unavailable',
    };
  }

  function createRealReadOnlyAdapterPolicySourceResponse(
    record: CodexExecRealReadOnlyAdapterPolicySourceRecord,
    details: {
      evidenceRefs?: ReturnType<typeof createRealReadOnlyAdapterPolicySourceEvidenceRefs>;
      auditEvents?: ReturnType<typeof createRealReadOnlyAdapterPolicySourceAuditEvents>;
    } = {},
  ) {
    return {
      record,
      policySourceRecord: record,
      summary: summarizeRealReadOnlyAdapterPolicySourceRecord(record),
      evidenceRefs: details.evidenceRefs ?? record.evidenceRefs,
      auditEvents: details.auditEvents ?? [],
      recordId: record.id,
      dryRunId: record.dryRunId,
      status: record.status,
      hardGateCount: record.hardGateCount,
      passedGateCount: record.passedGateCount,
      blockedGateCount: record.blockedGateCount,
      requiresReviewFindingCount: record.requiresReviewFindingCount,
      missingSources: record.missingSources,
      degraded: false,
      notPersisted: false,
      configExplicitlyEnabled: record.configExplicitlyEnabled,
      readOnlyOnly: record.readOnlyOnly,
      policyDecisionPresent: record.policyDecisionPresent,
      policyDecisionAllowsPilot: record.policyDecisionAllowsPilot,
      policyDecisionId: record.policyDecisionId,
      policyDecisionHash: record.policyDecisionHash,
      policyDecisionOutcome: record.policyDecisionOutcome,
      dryRunPlanHash: record.dryRunPlanHash,
      evidenceAuditReady: record.evidenceAuditReady,
      fallbackUsedAsAuthority: false,
      pilotExecuted: false,
      adapterAttemptInvoked: false,
      authoritative: true,
      supervisorBacked: true,
      persisted: true,
      ...realReadOnlyAdapterAttemptSafetyFlags,
      reason: persistenceState.reason,
    };
  }

  function createRealReadOnlyAdapterPolicySourceListResponse(
    records: CodexExecRealReadOnlyAdapterPolicySourceRecord[],
    query: Partial<CodexExecRealReadOnlyAdapterPolicySourceQuery>,
  ) {
    return {
      records,
      policySourceRecords: records,
      summaries: listRealReadOnlyAdapterPolicySourceSummaries(records, query),
      count: records.length,
      authoritative: true,
      supervisorBacked: true,
      persisted: true,
      degraded: false,
      notPersisted: false,
      fallbackUsedAsAuthority: false,
      pilotExecuted: false,
      adapterAttemptInvoked: false,
      ...realReadOnlyAdapterAttemptSafetyFlags,
      reason: persistenceState.reason,
    };
  }

  function createRealReadOnlyAdapterPolicySourceUnavailableResponse(dryRunId?: string) {
    return {
      error: 'real read-only adapter policy source store is unavailable',
      dryRunId,
      status: 'blocked',
      authoritative: false,
      supervisorBacked: false,
      persisted: false,
      degraded: true,
      notPersisted: true,
      fallbackUsedAsAuthority: false,
      pilotExecuted: false,
      adapterAttemptInvoked: false,
      configExplicitlyEnabled: false,
      readOnlyOnly: false,
      policyDecisionPresent: false,
      policyDecisionAllowsPilot: false,
      evidenceAuditReady: false,
      ...realReadOnlyAdapterAttemptSafetyFlags,
      reason: persistenceState.reason ?? 'store unavailable',
    };
  }

  function createRealReadOnlyAdapterPilotSourcePreparationResponse(
    record: CodexExecRealReadOnlyAdapterPilotSourcePreparationRecord,
    details: {
      evidenceRefs?: ReturnType<typeof createRealReadOnlyAdapterPilotSourcePreparationEvidenceRefs>;
      auditEvents?: ReturnType<typeof createRealReadOnlyAdapterPilotSourcePreparationAuditEvents>;
    } = {},
  ) {
    return {
      record,
      sourcePreparationRecord: record,
      summary: summarizeRealReadOnlyAdapterPilotSourcePreparationRecord(record),
      evidenceRefs: details.evidenceRefs ?? record.evidenceRefs,
      auditEvents: details.auditEvents ?? [],
      recordId: record.id,
      dryRunId: record.dryRunId,
      status: record.status,
      hardGateCount: record.hardGateCount,
      passedGateCount: record.passedGateCount,
      blockedGateCount: record.blockedGateCount,
      requiresReviewFindingCount: record.requiresReviewFindingCount,
      missingSources: record.missingSources,
      degraded: false,
      notPersisted: false,
      configExplicitlyEnabled: record.configExplicitlyEnabled,
      authoritativePolicySourcePresent: record.authoritativePolicySourcePresent,
      validUnusedApprovalPresent: record.validUnusedApprovalPresent,
      isolatedCleanWorktreeMetadataPresent: record.isolatedCleanWorktreeMetadataPresent,
      evidenceAuditReady: record.evidenceAuditReady,
      fallbackUsedAsAuthority: false,
      pilotExecuted: false,
      adapterAttemptInvoked: false,
      authoritative: true,
      supervisorBacked: true,
      persisted: true,
      ...realReadOnlyAdapterAttemptSafetyFlags,
      reason: persistenceState.reason,
    };
  }

  function createRealReadOnlyAdapterPilotSourcePreparationListResponse(
    records: CodexExecRealReadOnlyAdapterPilotSourcePreparationRecord[],
    query: Partial<CodexExecRealReadOnlyAdapterPilotSourcePreparationQuery>,
  ) {
    return {
      records,
      sourcePreparationRecords: records,
      summaries: listRealReadOnlyAdapterPilotSourcePreparationSummaries(records, query),
      count: records.length,
      authoritative: true,
      supervisorBacked: true,
      persisted: true,
      degraded: false,
      notPersisted: false,
      fallbackUsedAsAuthority: false,
      pilotExecuted: false,
      adapterAttemptInvoked: false,
      ...realReadOnlyAdapterAttemptSafetyFlags,
      reason: persistenceState.reason,
    };
  }

  function createRealReadOnlyAdapterPilotSourcePreparationUnavailableResponse(dryRunId?: string) {
    return {
      error: 'real read-only adapter pilot source preparation store is unavailable',
      dryRunId,
      status: 'blocked',
      authoritative: false,
      supervisorBacked: false,
      persisted: false,
      degraded: true,
      notPersisted: true,
      fallbackUsedAsAuthority: false,
      pilotExecuted: false,
      adapterAttemptInvoked: false,
      configExplicitlyEnabled: false,
      authoritativePolicySourcePresent: false,
      validUnusedApprovalPresent: false,
      isolatedCleanWorktreeMetadataPresent: false,
      evidenceAuditReady: false,
      ...realReadOnlyAdapterAttemptSafetyFlags,
      reason: persistenceState.reason ?? 'store unavailable',
    };
  }

  function createRealReadOnlyAdapterPilotPrerequisiteResponse(
    record: CodexExecRealReadOnlyAdapterPilotPrerequisiteRecord,
    details: {
      evidenceRefs?: ReturnType<typeof createRealReadOnlyAdapterPilotPrerequisiteEvidenceRefs>;
      auditEvents?: ReturnType<typeof createRealReadOnlyAdapterPilotPrerequisiteAuditEvents>;
    } = {},
  ) {
    return {
      record,
      prerequisiteRecord: record,
      summary: summarizeRealReadOnlyAdapterPilotPrerequisiteRecord(record),
      evidenceRefs: details.evidenceRefs ?? record.evidenceRefs,
      auditEvents: details.auditEvents ?? [],
      recordId: record.id,
      dryRunId: record.dryRunId,
      status: record.status,
      hardGateCount: record.hardGateCount,
      passedGateCount: record.passedGateCount,
      blockedGateCount: record.blockedGateCount,
      requiresReviewFindingCount: record.requiresReviewFindingCount,
      missingPrerequisites: record.missingPrerequisites,
      degraded: false,
      notPersisted: false,
      configExplicitlyEnabled: record.configExplicitlyEnabled,
      validUnusedApprovalPresent: record.validUnusedApprovalPresent,
      isolatedCleanWorktreeMetadataPresent: record.isolatedCleanWorktreeMetadataPresent,
      authoritativePolicySourcePresent: record.authoritativePolicySourcePresent,
      authoritativeSourcePreparationPresent: record.authoritativeSourcePreparationPresent,
      authoritativeAttemptEvidencePresent: record.authoritativeAttemptEvidencePresent,
      evidenceAuditReady: record.evidenceAuditReady,
      fallbackUsedAsAuthority: false,
      pilotExecuted: false,
      adapterAttemptInvoked: false,
      authoritative: true,
      supervisorBacked: true,
      persisted: true,
      ...realReadOnlyAdapterAttemptSafetyFlags,
      reason: persistenceState.reason,
    };
  }

  function createRealReadOnlyAdapterPilotPrerequisiteListResponse(
    records: CodexExecRealReadOnlyAdapterPilotPrerequisiteRecord[],
    query: Partial<CodexExecRealReadOnlyAdapterPilotPrerequisiteQuery>,
  ) {
    return {
      records,
      prerequisiteRecords: records,
      summaries: listRealReadOnlyAdapterPilotPrerequisiteSummaries(records, query),
      count: records.length,
      authoritative: true,
      supervisorBacked: true,
      persisted: true,
      degraded: false,
      notPersisted: false,
      fallbackUsedAsAuthority: false,
      pilotExecuted: false,
      adapterAttemptInvoked: false,
      ...realReadOnlyAdapterAttemptSafetyFlags,
      reason: persistenceState.reason,
    };
  }

  function createRealReadOnlyAdapterPilotPrerequisiteUnavailableResponse(dryRunId?: string) {
    return {
      error: 'real read-only adapter pilot prerequisite store is unavailable',
      dryRunId,
      status: 'blocked',
      authoritative: false,
      supervisorBacked: false,
      persisted: false,
      degraded: true,
      notPersisted: true,
      fallbackUsedAsAuthority: false,
      pilotExecuted: false,
      adapterAttemptInvoked: false,
      configExplicitlyEnabled: false,
      validUnusedApprovalPresent: false,
      isolatedCleanWorktreeMetadataPresent: false,
      authoritativePolicySourcePresent: false,
      authoritativeSourcePreparationPresent: false,
      authoritativeAttemptEvidencePresent: false,
      evidenceAuditReady: false,
      ...realReadOnlyAdapterAttemptSafetyFlags,
      reason: persistenceState.reason ?? 'store unavailable',
    };
  }

  function isValidUnusedApprovalRecordForPilot(
    record: CodexExecManualApprovalRecord,
    approvalArtifactId?: string,
  ): boolean {
    const artifact = record.approvalArtifact;

    if (!artifact) {
      return false;
    }

    if (approvalArtifactId && artifact.id !== approvalArtifactId) {
      return false;
    }

    return (
      artifact.status === 'approved' &&
      artifact.revoked === false &&
      artifact.usedAt === undefined &&
      artifact.dryRunPlanHash === record.request.dryRunPlanHash &&
      artifact.policyDecisionHash === record.request.policyDecisionHash &&
      Date.parse(artifact.expiresAt) > Date.now()
    );
  }

function isPilotPrerequisiteWorktreeStatus(
  status: string,
): status is 'clean' | 'dirty' | 'missing' | 'unknown' {
  return ['clean', 'dirty', 'missing', 'unknown'].includes(status);
}

function hashLocalMetadata(value: unknown): string {
  return `sha256:${createHash('sha256').update(JSON.stringify(value)).digest('hex')}`;
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
  'codex.exec.live_adapter_adr_decision',
  'codex.exec.read_only_adapter.preflight_simulation',
  'codex.exec.read_only_adapter.simulator_review',
  'codex.exec.read_only_adapter.skeleton_preview',
  'codex.exec.read_only_adapter.skeleton_review',
  'codex.exec.read_only_adapter.fixture_boundary',
  'codex.exec.read_only_adapter.final_readiness',
  'codex.exec.real_read_only_adapter.readiness_package',
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
const liveAdapterAdrDecisionOutcomes = new Set(['no_go', 'conditional_read_only_go']);
const liveAdapterAdrDecisionStatuses = new Set(['draft', 'recorded', 'superseded']);
const readOnlyAdapterSimulatorReviewOutcomes = new Set(['no_go', 'go_to_implementation_planning']);
const readOnlyAdapterSimulatorReviewStatuses = new Set(['draft', 'recorded', 'superseded']);
const readOnlyAdapterImplementationPlanReviewOutcomes = new Set([
  'no_go',
  'conditional_go_to_disabled_skeleton',
]);
const readOnlyAdapterImplementationPlanReviewStatuses = new Set([
  'draft',
  'recorded',
  'superseded',
]);
const readOnlyAdapterSkeletonReviewOutcomes = new Set([
  'no_go',
  'skeleton_accepted_for_fixture_boundary_only',
]);
const readOnlyAdapterSkeletonReviewStatuses = new Set(['draft', 'recorded', 'superseded']);
const readOnlyAdapterFinalReadinessOutcomes = new Set([
  'no_go',
  'ready_for_separate_read_only_adapter_adr',
  'ready_for_separate_disabled_skeleton_followup',
]);
const readOnlyAdapterFinalReadinessStatuses = new Set(['draft', 'recorded', 'superseded']);
const realReadOnlyAdapterReadinessStatuses = new Set([
  'not_ready',
  'ready_for_separate_adr',
  'blocked',
  'requires_review',
]);
const realReadOnlyAdapterReadinessReviewOutcomes = new Set([
  'no_go_to_separate_adr_draft',
  'conditional_go_to_separate_adr_draft',
]);
const realReadOnlyAdapterReadinessReviewStatuses = new Set(['draft', 'recorded', 'superseded']);
const realReadOnlyAdapterAttemptStatuses = new Set(['blocked', 'completed', 'failed', 'aborted']);
const realReadOnlyAdapterPolicySourceStatuses = new Set([
  'aligned',
  'blocked',
  'requires_review',
]);
const realReadOnlyAdapterPilotPrerequisiteStatuses = new Set([
  'ready_for_pilot_retry',
  'blocked',
  'requires_review',
]);
const realReadOnlyAdapterPilotSourcePreparationStatuses = new Set([
  'prepared',
  'blocked',
  'requires_review',
]);
const realReadOnlyAdapterAttemptSafetyFlags = {
  liveExecution: false,
  externalProcessStarted: false,
  executionDisabled: true,
  processAdapterStarted: false,
  implementationApproved: false,
  processAdapterApproved: false,
  recommendationGrantsExecution: false,
  workspaceWriteAllowed: false,
  dangerFullAccessAllowed: false,
  dashboardTriggerAllowed: false,
} as const;
const codexExecSandboxModes = new Set(['read_only', 'workspace_write', 'danger_full_access']);

function createReadOnlyAdapterOperatorChecklistFromBody(
  body:
    | {
        checklistComplete?: boolean;
        operatorChecklist?: CodexExecReadOnlyAdapterOperatorChecklistItem[];
      }
    | undefined,
): CodexExecReadOnlyAdapterOperatorChecklistItem[] {
  if (body?.operatorChecklist && body.operatorChecklist.length > 0) {
    return body.operatorChecklist;
  }

  const checklist = createDefaultReadOnlyAdapterOperatorChecklist();

  return body?.checklistComplete === true
    ? checklist.map((item) => ({ ...item, checked: true }))
    : checklist;
}

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

function parseLiveAdapterAdrDecisionQuery(
  query: unknown,
):
  | { allowed: true; query: Partial<CodexExecLiveAdapterAdrDecisionQuery> }
  | { allowed: false; reason: string } {
  const dryRunId = readQueryValue(query, 'dryRunId');
  const status = readQueryValue(query, 'status');
  const decision = readQueryValue(query, 'decision');
  const limitResult = parseLimitQueryValue(readQueryValue(query, 'limit'));

  if (!limitResult.allowed) {
    return limitResult;
  }

  if (status && !liveAdapterAdrDecisionStatuses.has(status)) {
    return { allowed: false, reason: 'unsupported ADR decision status' };
  }

  if (decision && !liveAdapterAdrDecisionOutcomes.has(decision)) {
    return { allowed: false, reason: 'unsupported ADR decision outcome' };
  }

  return {
    allowed: true,
    query: {
      dryRunId,
      status: status as CodexExecLiveAdapterAdrDecisionStatus | undefined,
      decision: decision as CodexExecLiveAdapterAdrDecisionOutcome | undefined,
      limit: limitResult.limit,
    },
  };
}

function parseReadOnlyAdapterSimulatorReviewQuery(
  query: unknown,
):
  | { allowed: true; query: Partial<CodexExecReadOnlyAdapterSimulatorReviewQuery> }
  | { allowed: false; reason: string } {
  const dryRunId = readQueryValue(query, 'dryRunId');
  const status = readQueryValue(query, 'status');
  const outcome = readQueryValue(query, 'outcome');
  const limitResult = parseLimitQueryValue(readQueryValue(query, 'limit'));

  if (!limitResult.allowed) {
    return limitResult;
  }

  if (status && !readOnlyAdapterSimulatorReviewStatuses.has(status)) {
    return { allowed: false, reason: 'unsupported simulator review status' };
  }

  if (outcome && !readOnlyAdapterSimulatorReviewOutcomes.has(outcome)) {
    return { allowed: false, reason: 'unsupported simulator review outcome' };
  }

  return {
    allowed: true,
    query: {
      dryRunId,
      status: status as CodexExecReadOnlyAdapterSimulatorReviewStatus | undefined,
      outcome: outcome as CodexExecReadOnlyAdapterSimulatorReviewOutcome | undefined,
      limit: limitResult.limit,
    },
  };
}

function parseReadOnlyAdapterImplementationPlanReviewQuery(
  query: unknown,
):
  | { allowed: true; query: Partial<CodexExecReadOnlyAdapterImplementationPlanReviewQuery> }
  | { allowed: false; reason: string } {
  const status = readQueryValue(query, 'status');
  const outcome = readQueryValue(query, 'outcome');
  const limitResult = parseLimitQueryValue(readQueryValue(query, 'limit'));

  if (!limitResult.allowed) {
    return limitResult;
  }

  if (status && !readOnlyAdapterImplementationPlanReviewStatuses.has(status)) {
    return { allowed: false, reason: 'unsupported implementation plan review status' };
  }

  if (outcome && !readOnlyAdapterImplementationPlanReviewOutcomes.has(outcome)) {
    return { allowed: false, reason: 'unsupported implementation plan review outcome' };
  }

  return {
    allowed: true,
    query: {
      status: status as CodexExecReadOnlyAdapterImplementationPlanReviewStatus | undefined,
      outcome: outcome as CodexExecReadOnlyAdapterImplementationPlanReviewOutcome | undefined,
      limit: limitResult.limit,
    },
  };
}

function parseReadOnlyAdapterSkeletonReviewQuery(
  query: unknown,
):
  | { allowed: true; query: Partial<CodexExecReadOnlyAdapterSkeletonReviewQuery> }
  | { allowed: false; reason: string } {
  const status = readQueryValue(query, 'status');
  const outcome = readQueryValue(query, 'outcome');
  const limitResult = parseLimitQueryValue(readQueryValue(query, 'limit'));

  if (!limitResult.allowed) {
    return limitResult;
  }

  if (status && !readOnlyAdapterSkeletonReviewStatuses.has(status)) {
    return { allowed: false, reason: 'unsupported skeleton review status' };
  }

  if (outcome && !readOnlyAdapterSkeletonReviewOutcomes.has(outcome)) {
    return { allowed: false, reason: 'unsupported skeleton review outcome' };
  }

  return {
    allowed: true,
    query: {
      status: status as CodexExecReadOnlyAdapterSkeletonReviewStatus | undefined,
      outcome: outcome as CodexExecReadOnlyAdapterSkeletonReviewOutcome | undefined,
      limit: limitResult.limit,
    },
  };
}

function parseReadOnlyAdapterFinalReadinessQuery(
  query: unknown,
):
  | { allowed: true; query: Partial<CodexExecReadOnlyAdapterFinalReadinessQuery> }
  | { allowed: false; reason: string } {
  const status = readQueryValue(query, 'status');
  const outcome = readQueryValue(query, 'outcome');
  const limitResult = parseLimitQueryValue(readQueryValue(query, 'limit'));

  if (!limitResult.allowed) {
    return limitResult;
  }

  if (status && !readOnlyAdapterFinalReadinessStatuses.has(status)) {
    return { allowed: false, reason: 'unsupported final readiness status' };
  }

  if (outcome && !readOnlyAdapterFinalReadinessOutcomes.has(outcome)) {
    return { allowed: false, reason: 'unsupported final readiness outcome' };
  }

  return {
    allowed: true,
    query: {
      status: status as CodexExecReadOnlyAdapterFinalReadinessStatus | undefined,
      outcome: outcome as CodexExecReadOnlyAdapterFinalReadinessOutcome | undefined,
      limit: limitResult.limit,
    },
  };
}

function parseRealReadOnlyAdapterReadinessQuery(
  query: unknown,
):
  | { allowed: true; query: Partial<CodexExecRealReadOnlyAdapterReadinessQuery> }
  | { allowed: false; reason: string } {
  const dryRunId = readQueryValue(query, 'dryRunId');
  const status = readQueryValue(query, 'status');
  const limitResult = parseLimitQueryValue(readQueryValue(query, 'limit'));

  if (!limitResult.allowed) {
    return limitResult;
  }

  if (status && !realReadOnlyAdapterReadinessStatuses.has(status)) {
    return { allowed: false, reason: 'unsupported readiness status' };
  }

  return {
    allowed: true,
    query: {
      dryRunId,
      status: status as CodexExecRealReadOnlyAdapterReadinessStatus | undefined,
      limit: limitResult.limit,
    },
  };
}

function parseRealReadOnlyAdapterReadinessReviewQuery(
  query: unknown,
):
  | { allowed: true; query: Partial<CodexExecRealReadOnlyAdapterReadinessReviewQuery> }
  | { allowed: false; reason: string } {
  const packageId = readQueryValue(query, 'packageId');
  const dryRunId = readQueryValue(query, 'dryRunId');
  const status = readQueryValue(query, 'status');
  const outcome = readQueryValue(query, 'outcome');
  const limitResult = parseLimitQueryValue(readQueryValue(query, 'limit'));

  if (!limitResult.allowed) {
    return limitResult;
  }

  if (status && !realReadOnlyAdapterReadinessReviewStatuses.has(status)) {
    return { allowed: false, reason: 'unsupported readiness review status' };
  }

  if (outcome && !realReadOnlyAdapterReadinessReviewOutcomes.has(outcome)) {
    return { allowed: false, reason: 'unsupported readiness review outcome' };
  }

  return {
    allowed: true,
    query: {
      packageId,
      dryRunId,
      status: status as CodexExecRealReadOnlyAdapterReadinessReviewStatus | undefined,
      outcome: outcome as CodexExecRealReadOnlyAdapterReadinessReviewOutcome | undefined,
      limit: limitResult.limit,
    },
  };
}

function parseRealReadOnlyAdapterAttemptQuery(
  query: unknown,
):
  | { allowed: true; query: Partial<CodexExecRealReadOnlyAdapterAttemptQuery> }
  | { allowed: false; reason: string } {
  const dryRunId = readQueryValue(query, 'dryRunId');
  const status = readQueryValue(query, 'status');
  const limitResult = parseLimitQueryValue(readQueryValue(query, 'limit'));

  if (!limitResult.allowed) {
    return limitResult;
  }

  if (status && !realReadOnlyAdapterAttemptStatuses.has(status)) {
    return { allowed: false, reason: 'unsupported attempt status' };
  }

  return {
    allowed: true,
    query: {
      dryRunId,
      status: status as CodexExecRealReadOnlyAdapterAttemptStatus | undefined,
      limit: limitResult.limit,
    },
  };
}

function parseRealReadOnlyAdapterAttemptTimelineQuery(
  query: unknown,
  dryRunId: string,
):
  | { allowed: true; query: Partial<CodexExecRealReadOnlyAdapterAttemptTimelineQuery> }
  | { allowed: false; reason: string } {
  const status = readQueryValue(query, 'status');
  const limitResult = parseLimitQueryValue(readQueryValue(query, 'limit'));

  if (!limitResult.allowed) {
    return limitResult;
  }

  if (status && !realReadOnlyAdapterAttemptStatuses.has(status)) {
    return { allowed: false, reason: 'unsupported attempt timeline status' };
  }

  return {
    allowed: true,
    query: {
      dryRunId,
      status: status as CodexExecRealReadOnlyAdapterAttemptStatus | undefined,
      includeEvidence: parseBooleanQueryValue(readQueryValue(query, 'includeEvidence') ?? '') === true,
      includeAudit: parseBooleanQueryValue(readQueryValue(query, 'includeAudit') ?? '') === true,
      limit: limitResult.limit,
    },
  };
}

function parseRealReadOnlyAdapterPolicySourceQuery(
  query: unknown,
):
  | { allowed: true; query: Partial<CodexExecRealReadOnlyAdapterPolicySourceQuery> }
  | { allowed: false; reason: string } {
  const dryRunId = readQueryValue(query, 'dryRunId');
  const status = readQueryValue(query, 'status');
  const limitResult = parseLimitQueryValue(readQueryValue(query, 'limit'));

  if (!limitResult.allowed) {
    return limitResult;
  }

  if (status && !realReadOnlyAdapterPolicySourceStatuses.has(status)) {
    return { allowed: false, reason: 'unsupported policy source status' };
  }

  return {
    allowed: true,
    query: {
      dryRunId,
      status: status as CodexExecRealReadOnlyAdapterPolicySourceStatus | undefined,
      limit: limitResult.limit,
    },
  };
}

function parseRealReadOnlyAdapterPilotPrerequisiteQuery(
  query: unknown,
):
  | { allowed: true; query: Partial<CodexExecRealReadOnlyAdapterPilotPrerequisiteQuery> }
  | { allowed: false; reason: string } {
  const dryRunId = readQueryValue(query, 'dryRunId');
  const status = readQueryValue(query, 'status');
  const limitResult = parseLimitQueryValue(readQueryValue(query, 'limit'));

  if (!limitResult.allowed) {
    return limitResult;
  }

  if (status && !realReadOnlyAdapterPilotPrerequisiteStatuses.has(status)) {
    return { allowed: false, reason: 'unsupported pilot prerequisite status' };
  }

  return {
    allowed: true,
    query: {
      dryRunId,
      status: status as CodexExecRealReadOnlyAdapterPilotPrerequisiteStatus | undefined,
      limit: limitResult.limit,
    },
  };
}

function parseRealReadOnlyAdapterPilotSourcePreparationQuery(
  query: unknown,
):
  | { allowed: true; query: Partial<CodexExecRealReadOnlyAdapterPilotSourcePreparationQuery> }
  | { allowed: false; reason: string } {
  const dryRunId = readQueryValue(query, 'dryRunId');
  const status = readQueryValue(query, 'status');
  const limitResult = parseLimitQueryValue(readQueryValue(query, 'limit'));

  if (!limitResult.allowed) {
    return limitResult;
  }

  if (status && !realReadOnlyAdapterPilotSourcePreparationStatuses.has(status)) {
    return { allowed: false, reason: 'unsupported pilot source preparation status' };
  }

  return {
    allowed: true,
    query: {
      dryRunId,
      status: status as CodexExecRealReadOnlyAdapterPilotSourcePreparationStatus | undefined,
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

function filterInMemoryLiveAdapterAdrDecisions(
  records: CodexExecLiveAdapterAdrDecisionRecord[],
  query: Partial<CodexExecLiveAdapterAdrDecisionQuery>,
): CodexExecLiveAdapterAdrDecisionRecord[] {
  return records
    .filter((record) => {
      if (query.dryRunId && record.dryRunId !== query.dryRunId) {
        return false;
      }

      if (query.status && record.status !== query.status) {
        return false;
      }

      if (query.decision && record.decision !== query.decision) {
        return false;
      }

      return true;
    })
    .sort((left, right) => right.createdAt.localeCompare(left.createdAt))
    .slice(0, query.limit ?? 20);
}

function filterInMemoryReadOnlyAdapterSimulatorReviews(
  records: CodexExecReadOnlyAdapterSimulatorReviewDecisionRecord[],
  query: Partial<CodexExecReadOnlyAdapterSimulatorReviewQuery>,
): CodexExecReadOnlyAdapterSimulatorReviewDecisionRecord[] {
  return records
    .filter((record) => {
      if (query.dryRunId && record.dryRunId !== query.dryRunId) {
        return false;
      }

      if (query.status && record.status !== query.status) {
        return false;
      }

      if (query.outcome && record.outcome !== query.outcome) {
        return false;
      }

      return true;
    })
    .sort((left, right) => right.createdAt.localeCompare(left.createdAt))
    .slice(0, query.limit ?? 20);
}

function filterInMemoryReadOnlyAdapterImplementationPlanReviews(
  records: CodexExecReadOnlyAdapterImplementationPlanReviewDecisionRecord[],
  query: Partial<CodexExecReadOnlyAdapterImplementationPlanReviewQuery>,
): CodexExecReadOnlyAdapterImplementationPlanReviewDecisionRecord[] {
  return records
    .filter((record) => {
      if (query.status && record.status !== query.status) {
        return false;
      }

      if (query.outcome && record.outcome !== query.outcome) {
        return false;
      }

      return true;
    })
    .sort((left, right) => right.createdAt.localeCompare(left.createdAt))
    .slice(0, query.limit ?? 20);
}

function filterInMemoryReadOnlyAdapterSkeletonReviews(
  records: CodexExecReadOnlyAdapterSkeletonReviewDecisionRecord[],
  query: Partial<CodexExecReadOnlyAdapterSkeletonReviewQuery>,
): CodexExecReadOnlyAdapterSkeletonReviewDecisionRecord[] {
  return records
    .filter((record) => {
      if (query.status && record.status !== query.status) {
        return false;
      }

      if (query.outcome && record.outcome !== query.outcome) {
        return false;
      }

      return true;
    })
    .sort((left, right) => right.createdAt.localeCompare(left.createdAt))
    .slice(0, query.limit ?? 20);
}

function filterInMemoryReadOnlyAdapterFinalReadiness(
  records: CodexExecReadOnlyAdapterFinalReadinessDecisionRecord[],
  query: Partial<CodexExecReadOnlyAdapterFinalReadinessQuery>,
): CodexExecReadOnlyAdapterFinalReadinessDecisionRecord[] {
  return records
    .filter((record) => {
      if (query.status && record.status !== query.status) {
        return false;
      }

      if (query.outcome && record.outcome !== query.outcome) {
        return false;
      }

      return true;
    })
    .sort((left, right) => right.createdAt.localeCompare(left.createdAt))
    .slice(0, query.limit ?? 20);
}

function filterInMemoryRealReadOnlyAdapterReadinessPackages(
  records: CodexExecRealReadOnlyAdapterReadinessPackage[],
  query: Partial<CodexExecRealReadOnlyAdapterReadinessQuery>,
): CodexExecRealReadOnlyAdapterReadinessPackage[] {
  return records
    .filter((packageRecord) => {
      if (query.dryRunId && packageRecord.dryRunId !== query.dryRunId) {
        return false;
      }

      if (query.status && packageRecord.status !== query.status) {
        return false;
      }

      return true;
    })
    .sort((left, right) => right.createdAt.localeCompare(left.createdAt))
    .slice(0, query.limit ?? 20);
}

function filterInMemoryRealReadOnlyAdapterReadinessReviews(
  records: CodexExecRealReadOnlyAdapterReadinessReviewDecisionRecord[],
  query: Partial<CodexExecRealReadOnlyAdapterReadinessReviewQuery>,
): CodexExecRealReadOnlyAdapterReadinessReviewDecisionRecord[] {
  return records
    .filter((record) => {
      if (query.packageId && record.packageId !== query.packageId) {
        return false;
      }

      if (query.dryRunId && record.dryRunId !== query.dryRunId) {
        return false;
      }

      if (query.status && record.status !== query.status) {
        return false;
      }

      if (query.outcome && record.outcome !== query.outcome) {
        return false;
      }

      return true;
    })
    .sort((left, right) => right.createdAt.localeCompare(left.createdAt))
    .slice(0, query.limit ?? 20);
}

function existingReadinessDocumentRefs(): string[] {
  const workspaceRoot = findWorkspaceRoot(process.cwd());
  const candidateRefs = [
    'docs/reviews/round-3tw-additional-rules-audit.md',
    'docs/reviews/round-3w-disabled-skeleton-fixture-boundary-review.md',
    'docs/adr/round-3w-read-only-adapter-final-readiness-review.md',
  ];

  return candidateRefs.filter((candidateRef) => existsSync(resolve(workspaceRoot, candidateRef)));
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

  if (existsSync(requestedPath)) {
    const fixturesRootRealPath = realpathSync(fixturesRoot);
    const requestedRealPath = realpathSync(requestedPath);

    if (
      !isPathInside(requestedRealPath, fixturesRootRealPath) ||
      extname(requestedRealPath) !== '.jsonl'
    ) {
      return {
        allowed: false,
        reason: 'fixturePath must resolve inside packages/codex-kernel/fixtures/*.jsonl',
      };
    }
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

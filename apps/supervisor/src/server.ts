import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { dirname, extname, isAbsolute, parse, relative, resolve, sep } from 'node:path';
import Fastify from 'fastify';
import {
  createCodexExecDisabledLiveRunRecord,
  createCodexExecDryRunPlan,
  createCodexExecExecutionIntent,
  evaluateCodexExecDryRunPolicy,
  type CodexExecReplaySummary,
  createCodexReplayRecord,
  replayCodexExecFixture,
  summarizeCodexExecReplay,
} from '@codexhub/codex-kernel';
import type {
  CodexExecApprovalMode,
  CodexExecLiveRunRecord,
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
  const policyEngine = new DefaultPolicyEngine();
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
    const intent = createCodexExecExecutionIntent({
      title: body.title,
      prompt: body.prompt,
      cwd: cwdGuard.cwd,
      sandboxMode: body.sandboxMode ?? 'read_only',
      approvalMode: body.approvalMode ?? 'required',
      metadata: body.metadata,
    });
    const dryRunPlan = createCodexExecDryRunPlan(intent);
    const policyDecision = evaluateCodexExecDryRunPolicy(dryRunPlan, policyEngine);
    const liveRunRecord = createCodexExecDisabledLiveRunRecord(
      dryRunPlan,
      policyDecision,
      'live adapter disabled in Round 3B control-plane skeleton',
    );

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
      liveExecution: false,
      externalProcessStarted: false,
      executionDisabled: true,
      degraded: persistenceState.status !== 'ok',
      reason: persistenceState.reason,
    };
  });

  server.get('/api/codex/exec/dry-runs', async () => {
    const store = await getStore();
    const records = store
      ? await store.codexExecLiveRuns.listCodexExecLiveRunRecords(10)
      : codexExecLiveRunRecords.slice(0, 10);

    return {
      runs: records,
      degraded: persistenceState.status !== 'ok',
      reason: persistenceState.reason,
      metadata: { liveExecution: false, externalProcessStarted: false, executionDisabled: true },
    };
  });

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

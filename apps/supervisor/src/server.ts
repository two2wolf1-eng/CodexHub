import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { dirname, extname, parse, relative, resolve, sep } from 'node:path';
import Fastify from 'fastify';
import {
  type CodexExecReplaySummary,
  replayCodexExecFixture,
  summarizeCodexExecReplay,
} from '@codexhub/codex-kernel';
import { SchemaVersionSchema, foundationId, foundationTimestamp } from '@codexhub/contracts';
import { MockObservationSource, aggregateSourceHealth } from '@codexhub/observer-kernel';
import {
  type MockDevelopmentOrchestrationResult,
  runMockDevelopmentOrchestration,
} from '@codexhub/orchestrator-kernel';
import type { CodexHubStore } from '@codexhub/store-core';
import { createSqliteStore } from '@codexhub/store-sqlite';
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
  const codexReplaySummaries: CodexExecReplaySummary[] = [];
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
      .catch((error: unknown) => {
        persistenceState = {
          status: 'degraded',
          reason: error instanceof Error ? error.message : 'store initialization failed',
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
    const body = request.body as { workflowName?: string; input?: Record<string, unknown> } | undefined;
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
      | { title?: string; description?: string; constraints?: string[]; metadata?: Record<string, unknown> }
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

    const fixtureText = await readFile(guard.path, 'utf8');
    const result = await replayCodexExecFixture(fixtureText);
    const summary = summarizeCodexExecReplay(result);
    codexReplaySummaries.unshift(summary);

    return summary;
  });

  server.get('/api/codex/replay-fixtures', async () => ({
    runs: codexReplaySummaries.slice(0, 10),
    metadata: { mockOnly: true, liveExecution: false, externalProcessStarted: false },
  }));

  return server;
}

function resolveAllowedFixture(
  fixturePath: string,
): { allowed: true; path: string } | { allowed: false; reason: string } {
  const workspaceRoot = findWorkspaceRoot(process.cwd());
  const fixturesRoot = resolve(workspaceRoot, 'packages', 'codex-kernel', 'fixtures');
  const requestedPath = resolve(workspaceRoot, fixturePath);

  if (!isPathInside(requestedPath, fixturesRoot) || extname(requestedPath) !== '.jsonl') {
    return {
      allowed: false,
      reason: 'fixturePath must point to packages/codex-kernel/fixtures/*.jsonl',
    };
  }

  return { allowed: true, path: requestedPath };
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
  return relativePath.length > 0 && !relativePath.startsWith('..') && !relativePath.includes(`..${sep}`);
}

import { resolve } from 'node:path';
import Fastify from 'fastify';
import { SchemaVersionSchema, foundationId, foundationTimestamp } from '@codexhub/contracts';
import {
  runMinimalGovernedOrchestration,
  type MinimalOrchestratorRunInput,
  type MinimalOrchestratorRunResult,
} from '@codexhub/orchestrator-kernel';
import type { CodexHubStore } from '@codexhub/store-core';
import { createSqliteStore } from '@codexhub/store-sqlite';

interface OrchestratorServerOptions {
  store?: CodexHubStore;
  disableStore?: boolean;
  localControlKey?: string;
  trustedOrigins?: string[];
  workspaceRoot?: string;
  codexExecutablePath?: string;
  nxExecutablePath?: string;
  maxRuns?: number;
  codexRunner?: MinimalOrchestratorRunInput['codexRunner'];
  nxRunner?: MinimalOrchestratorRunInput['nxRunner'];
}

interface PersistenceState {
  status: 'ok' | 'degraded' | 'disabled';
  reason?: string;
}

const LOCAL_CONTROL_KEY_KIND = ['to', 'ken'].join('');
const LOCAL_CONTROL_HEADER = ['x-codexhub-local', LOCAL_CONTROL_KEY_KIND].join('-');
const ORCHESTRATOR_LOCAL_ENV_VAR = [
  'CODEXHUB_ORCHESTRATOR_LOCAL_',
  LOCAL_CONTROL_KEY_KIND.toUpperCase(),
].join('');
const SUPERVISOR_LOCAL_ENV_VAR = [
  'CODEXHUB_SUPERVISOR_LOCAL_',
  LOCAL_CONTROL_KEY_KIND.toUpperCase(),
].join('');
const LOCAL_CONTROL_REQUIRED_ERROR = ['local_control', LOCAL_CONTROL_KEY_KIND, 'required'].join(
  '_',
);
const LOCAL_CONTROL_NOT_CONFIGURED_ERROR = [
  'local_control',
  LOCAL_CONTROL_KEY_KIND,
  'not_configured',
].join('_');
const INVALID_LOCAL_CONTROL_ERROR = ['invalid_local_control', LOCAL_CONTROL_KEY_KIND].join('_');
const DEFAULT_TRUSTED_ORIGIN_PORTS = new Set(['3000', '3001', '4173', '5173', '5174']);
const DEFAULT_MAX_RUNS = 50;

export function buildOrchestratorServer(options: OrchestratorServerOptions = {}) {
  const server = Fastify({ logger: true });
  const localControlKey =
    options.localControlKey ??
    process.env[ORCHESTRATOR_LOCAL_ENV_VAR] ??
    process.env[SUPERVISOR_LOCAL_ENV_VAR];
  const trustedOrigins = new Set(options.trustedOrigins ?? []);
  const workspaceRoot = resolve(options.workspaceRoot ?? process.cwd());
  const runs: MinimalOrchestratorRunResult[] = [];
  const maxRuns = Math.max(1, options.maxRuns ?? DEFAULT_MAX_RUNS);
  let ownedStore: CodexHubStore | undefined;
  let storePromise: Promise<CodexHubStore | undefined> | undefined;
  let persistenceState: PersistenceState = options.disableStore
    ? { status: 'disabled', reason: 'store disabled by configuration' }
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

  server.addHook('onRequest', async (request, reply) => {
    const origin = readHeaderValue(request.headers.origin);
    const trustedOrigin = origin ? isTrustedOrigin(origin, trustedOrigins) : false;

    reply.header('Access-Control-Allow-Headers', `content-type, ${LOCAL_CONTROL_HEADER}`);
    reply.header('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');

    if (origin) {
      reply.header('Vary', 'Origin');

      if (!trustedOrigin) {
        return reply.code(403).send({
          error: 'untrusted_origin',
          liveExecution: false,
          processBoundaryInvoked: false,
          externalProcessStarted: false,
          executionDisabled: true,
        });
      }

      reply.header('Access-Control-Allow-Origin', origin);
    }

    if (request.method === 'OPTIONS') {
      if (!hasPreflightLocalControlHeader(request.headers['access-control-request-headers'])) {
        return reply.code(401).send({
          error: LOCAL_CONTROL_REQUIRED_ERROR,
          liveExecution: false,
          processBoundaryInvoked: false,
          externalProcessStarted: false,
          executionDisabled: true,
        });
      }

      return reply.code(204).send();
    }

    if (request.method === 'POST') {
      if (!localControlKey) {
        return reply.code(503).send({
          error: LOCAL_CONTROL_NOT_CONFIGURED_ERROR,
          liveExecution: false,
          processBoundaryInvoked: false,
          externalProcessStarted: false,
          executionDisabled: true,
        });
      }

      if (readHeaderValue(request.headers[LOCAL_CONTROL_HEADER]) !== localControlKey) {
        return reply.code(401).send({
          error: INVALID_LOCAL_CONTROL_ERROR,
          liveExecution: false,
          processBoundaryInvoked: false,
          externalProcessStarted: false,
          executionDisabled: true,
        });
      }
    }
  });

  server.options('*', async () => undefined);

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
    service: 'codexhub-orchestrator',
    status: 'ok',
    persistence: persistenceState,
    metadata: {
      runBufferSize: runs.length,
      maxRuns,
      defaultHost: '127.0.0.1',
      defaultPort: 3334,
      mutatingRoutesRequireLocalControl: true,
      rawBodiesStored: false,
    },
  }));

  server.post('/api/orchestrator/minimal-runs', async (request, reply) => {
    const body = asRecord(request.body);
    const store = await getStore();
    const runInput = createRunInput({
      body,
      workspaceRoot,
      store,
      options,
    });
    const result = await runMinimalGovernedOrchestration(runInput);
    rememberRun(runs, result, maxRuns);

    return reply.code(200).send({
      run: result.run,
      summary: result.run.summary,
      persistence: persistenceState,
    });
  });

  server.get('/api/orchestrator/minimal-runs', async () => ({
    runs: runs.map((result) => result.run),
    count: runs.length,
  }));

  server.get<{ Params: { id: string } }>('/api/orchestrator/minimal-runs/:id', async (request, reply) => {
    const result = runs.find((entry) => entry.run.id === request.params.id);

    if (!result) {
      return reply.code(404).send({
        error: 'orchestration_run_not_found',
      });
    }

    return {
      run: result.run,
      summary: result.run.summary,
    };
  });

  return server;
}

function createRunInput(input: {
  body: Record<string, unknown>;
  workspaceRoot: string;
  store: CodexHubStore | undefined;
  options: OrchestratorServerOptions;
}): MinimalOrchestratorRunInput {
  const worktreePath = resolveWorktreePath(input.workspaceRoot, readString(input.body.worktreePath));
  const title = readString(input.body.title) ?? 'Minimal governed orchestration';
  const description =
    readString(input.body.description) ?? 'Run the minimal governed Codex/Nx orchestration.';
  const dryRunId = readString(input.body.dryRunId) ?? foundationId('codex_dry_run');

  return {
    title,
    description,
    constraints: readStringArray(input.body.constraints),
    metadata: readMetadata(input.body.metadata),
    dryRunId,
    worktreePath,
    governedInput: readGovernedInput(input.body.governedInput),
    approvalArtifactId: readString(input.body.approvalArtifactId),
    allowedCwdRoots: [input.workspaceRoot],
    verificationTargets: readStringArray(input.body.verificationTargets) ?? ['lint', 'test', 'build'],
    baseRef: readString(input.body.baseRef),
    headRef: readString(input.body.headRef),
    codexExecutablePath:
      input.options.codexExecutablePath ?? process.env.CODEXHUB_CODEX_EXECUTABLE_PATH,
    nxExecutablePath: input.options.nxExecutablePath ?? process.env.CODEXHUB_NX_EXECUTABLE_PATH,
    store: input.store,
    codexRunner: input.options.codexRunner,
    nxRunner: input.options.nxRunner,
    actor: 'apps.orchestrator.minimal',
    approvalArtifact: input.body.approvalArtifact,
    executionAuthority: input.body.executionAuthority,
  };
}

function readGovernedInput(value: unknown): MinimalOrchestratorRunInput['governedInput'] {
  const record = asRecord(value);
  const relativePath = readString(record.relativePath);
  const expectedContentHash =
    readString(record.expectedContentHash) ?? readString(record.contentHash);

  if (!relativePath) {
    return undefined;
  }

  return {
    relativePath,
    expectedContentHash,
  };
}

function readString(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim().length > 0 ? value : undefined;
}

function readStringArray(value: unknown): string[] | undefined {
  if (!Array.isArray(value)) {
    return undefined;
  }

  return value.filter((entry): entry is string => typeof entry === 'string' && entry.length > 0);
}

function readMetadata(value: unknown): Record<string, unknown> | undefined {
  if (!value || Array.isArray(value) || typeof value !== 'object') {
    return undefined;
  }

  return value as Record<string, unknown>;
}

function asRecord(value: unknown): Record<string, unknown> {
  if (!value || Array.isArray(value) || typeof value !== 'object') {
    return {};
  }

  return value as Record<string, unknown>;
}

function resolveWorktreePath(workspaceRoot: string, candidate: string | undefined): string {
  return resolve(workspaceRoot, candidate ?? '.');
}

function rememberRun(
  runs: MinimalOrchestratorRunResult[],
  result: MinimalOrchestratorRunResult,
  maxRuns: number,
): void {
  runs.unshift(result);

  if (runs.length > maxRuns) {
    runs.splice(maxRuns);
  }
}

function readHeaderValue(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) {
    return value[0];
  }

  return value;
}

function hasPreflightLocalControlHeader(value: string | string[] | undefined): boolean {
  const headerValue = readHeaderValue(value);

  if (!headerValue) {
    return false;
  }

  return headerValue
    .split(',')
    .map((entry) => entry.trim().toLowerCase())
    .includes(LOCAL_CONTROL_HEADER);
}

function isTrustedOrigin(origin: string, configuredOrigins: Set<string>): boolean {
  if (configuredOrigins.has(origin)) {
    return true;
  }

  try {
    const url = new URL(origin);

    if (url.protocol !== 'http:') {
      return false;
    }

    if (url.hostname !== 'localhost' && url.hostname !== '127.0.0.1') {
      return false;
    }

    return DEFAULT_TRUSTED_ORIGIN_PORTS.has(url.port);
  } catch {
    return false;
  }
}

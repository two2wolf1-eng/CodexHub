import { createHash } from 'node:crypto';
import { mkdirSync, mkdtempSync, readFileSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import {
  createDefaultCodexExecConfigLoadResult,
  hashRealReadOnlyAdapterRuntimeWorktreePath,
  REAL_READ_ONLY_ADAPTER_CODEX_CLI_INVOCATION_CONTRACT_VERSION,
  REAL_READ_ONLY_ADAPTER_CODEX_CLI_PROCESS_ARGV,
  REAL_READ_ONLY_ADAPTER_CODEX_CLI_PROCESS_ARGV_HASH,
} from '@codexhub/codex-kernel';
import type { CodexExecRealReadOnlyAdapterExecutableResolution } from '@codexhub/codex-kernel';
import type {
  CodexPatchChildRecord,
  LocalReviewPackageApprovalArtifactRecord,
  LocalReviewPackageControlPlaneRun,
  LocalReviewPackageDryRunRecord,
  NxVerificationChildRecord,
  WorktreeApprovalArtifactRecord,
  WorktreeControlPlaneRun,
  WorktreeDryRunRecord,
} from '@codexhub/contracts';
import { createSqliteStore } from '@codexhub/store-sqlite';
import { buildSupervisorServer } from './server';

const symlinkEscapeFixturePath =
  'packages/codex-kernel/fixtures/codexhub-symlink-escape-test.jsonl';
const symlinkEscapeAbsolutePath = join(process.cwd(), ...symlinkEscapeFixturePath.split('/'));
const localControlToken = 'test-local-control-token';
const localControlHeaders = { 'x-codexhub-local-token': localControlToken };
const trustedLoopbackOrigin = 'http://127.0.0.1:5173';
const lateStageSupervisorControlPlaneMatrix = [
  { family: 'review-packages', prefix: '/api/review-packages', approvalManagedExternally: false },
  {
    family: 'release-candidates',
    prefix: '/api/release-candidates',
    approvalManagedExternally: false,
  },
  { family: 'github-metadata', prefix: '/api/github/metadata', approvalManagedExternally: false },
  {
    family: 'github-pr-lifecycle',
    prefix: '/api/github/pr-lifecycle',
    approvalManagedExternally: false,
  },
  {
    family: 'github-pr-labels',
    prefix: '/api/github/pr-labels',
    approvalManagedExternally: false,
  },
  {
    family: 'github-pr-assignees',
    prefix: '/api/github/pr-assignees',
    approvalManagedExternally: false,
  },
  {
    family: 'github-pr-reviewers',
    prefix: '/api/github/pr-reviewers',
    approvalManagedExternally: false,
  },
  {
    family: 'github-pr-milestones',
    prefix: '/api/github/pr-milestones',
    approvalManagedExternally: false,
  },
  {
    family: 'github-pr-comments',
    prefix: '/api/github/pr-comments',
    approvalManagedExternally: false,
  },
  {
    family: 'github-merges',
    prefix: '/api/github/merges',
    approvalManagedExternally: false,
  },
  {
    family: 'github-actions-observations',
    prefix: '/api/github/actions/observations',
    approvalManagedExternally: false,
  },
  {
    family: 'github-actions-reruns',
    prefix: '/api/github/actions/reruns',
    approvalManagedExternally: false,
  },
  {
    family: 'github-actions-cancels',
    prefix: '/api/github/actions/cancels',
    approvalManagedExternally: false,
  },
  {
    family: 'github-actions-dispatches',
    prefix: '/api/github/actions/dispatches',
    approvalManagedExternally: false,
  },
  {
    family: 'release-version-plans',
    prefix: '/api/releases/version-plans',
    approvalManagedExternally: true,
    routeSuffixes: ['/dry-runs'],
  },
  {
    family: 'github-release-tags',
    prefix: '/api/github/release-tags',
    approvalManagedExternally: false,
  },
  {
    family: 'github-release-drafts',
    prefix: '/api/github/release-drafts',
    approvalManagedExternally: false,
  },
  {
    family: 'deployment-observations',
    prefix: '/api/deployments/observations',
    approvalManagedExternally: false,
  },
  {
    family: 'github-draft-prs',
    prefix: '/api/github/draft-prs',
    approvalManagedExternally: false,
  },
  {
    family: 'github-branch-publishes',
    prefix: '/api/github/branch-publishes',
    approvalManagedExternally: false,
  },
  {
    family: 'github-publish-draft-pr-chains',
    prefix: '/api/github/publish-draft-pr-chains',
    approvalManagedExternally: true,
  },
  {
    family: 'github-remote-cleanups',
    prefix: '/api/github/remote-cleanups',
    approvalManagedExternally: false,
  },
  { family: 'rework-loops', prefix: '/api/rework-loops', approvalManagedExternally: false },
  {
    family: 'custom-workflows',
    prefix: '/api/workflows/custom',
    approvalManagedExternally: false,
  },
  {
    family: 'production-workflow-recoveries',
    prefix: '/api/workflows/production/recoveries',
    approvalManagedExternally: false,
  },
  {
    family: 'deployment-operations',
    prefix: '/api/deployments/operations',
    approvalManagedExternally: false,
    extraMutatingRoutes: ['/api/deployments/operations/rollback-plans'],
  },
  {
    family: 'secret-readiness',
    prefix: '/api/secrets/readiness',
    approvalManagedExternally: false,
  },
  {
    family: 'real-policy-backend-evaluations',
    prefix: '/api/policy-backends/evaluations',
    approvalManagedExternally: false,
  },
  {
    family: 'real-telemetry-exports',
    prefix: '/api/telemetry/exports',
    approvalManagedExternally: false,
  },
  {
    family: 'browser-actions',
    prefix: '/api/browser/actions',
    approvalManagedExternally: false,
  },
  {
    family: 'electron-main-inspector',
    prefix: '/api/electron-cdp/main-inspector',
    approvalManagedExternally: false,
  },
  {
    family: 'mcp-write-tools',
    prefix: '/api/mcp/write-tools',
    approvalManagedExternally: false,
  },
] as const;
function getLateStageMutatingRoutes(
  entry: (typeof lateStageSupervisorControlPlaneMatrix)[number],
): string[] {
  const baseRoutes =
    'routeSuffixes' in entry
      ? entry.routeSuffixes.map((suffix) => `${entry.prefix}${suffix}`)
      : entry.approvalManagedExternally
      ? [`${entry.prefix}/dry-runs`, `${entry.prefix}/runs`]
      : [
          `${entry.prefix}/dry-runs`,
          `${entry.prefix}/approval-requests`,
          `${entry.prefix}/manual-approvals`,
          `${entry.prefix}/runs`,
        ];

  return baseRoutes.concat('extraMutatingRoutes' in entry ? entry.extraMutatingRoutes : []);
}

const lateStageSupervisorMutatingRoutes =
  lateStageSupervisorControlPlaneMatrix.flatMap(getLateStageMutatingRoutes);
const lateStageSupervisorRoutePrefixes = lateStageSupervisorControlPlaneMatrix.map(
  (entry) => entry.prefix,
);
const lateStageSupervisorHelperRouteNamespaces = [
  '/api/github/',
  '/api/releases/',
  '/api/deployments/',
  '/api/secrets/',
  '/api/policy-backends/',
  '/api/telemetry/',
  '/api/browser/actions',
  '/api/electron-cdp/main-inspector',
  '/api/mcp/write-tools',
] as const;

process.env.CODEXHUB_SUPERVISOR_LOCAL_TOKEN = localControlToken;

function hashTestWorktreePath(worktreePath: string): string {
  return hashRealReadOnlyAdapterRuntimeWorktreePath(worktreePath);
}

function hashTestText(text: string): string {
  return createHash('sha256').update(text).digest('hex');
}

function hashTestMetadata(value: unknown): string {
  return `sha256:${createHash('sha256').update(JSON.stringify(value)).digest('hex')}`;
}

afterEach(() => {
  rmSync(symlinkEscapeAbsolutePath, { force: true });
});

describe('supervisor mock development API', () => {
  it('reports the read-only adapter invocation contract in health metadata', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'codexhub-supervisor-health-'));
    const store = await createSqliteStore({ dbPath: join(dir, 'codexhub.sqlite') });
    const server = buildSupervisorServer({ store });

    const response = await server.inject({
      method: 'GET',
      url: '/health',
    });

    await server.close();
    await store.close();

    expect(response.statusCode).toBe(200);
    expect(response.json()).toMatchObject({
      service: 'codexhub-supervisor',
      status: 'ok',
      metadata: {
        realReadOnlyAdapterCodexCliInvocationContractVersion:
          REAL_READ_ONLY_ADAPTER_CODEX_CLI_INVOCATION_CONTRACT_VERSION,
        realReadOnlyAdapterCodexCliArgvCount: REAL_READ_ONLY_ADAPTER_CODEX_CLI_PROCESS_ARGV.length,
        realReadOnlyAdapterCodexCliArgvHash: REAL_READ_ONLY_ADAPTER_CODEX_CLI_PROCESS_ARGV_HASH,
        realReadOnlyAdapterCodexCliStdinClosedWithoutBody: true,
        realReadOnlyAdapterCodexCliGovernedInputRequired: true,
        realReadOnlyAdapterCodexCliPromptArgumentStored: false,
        realReadOnlyAdapterCodexCliArgvStored: false,
      },
    });
    expect(response.body).not.toContain('"argv":');
    expect(response.body).not.toContain('"executablePath":');
  });

  it('protects mutating local API routes with trusted origins and a local token', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'codexhub-supervisor-api-guard-'));
    const store = await createSqliteStore({ dbPath: join(dir, 'codexhub.sqlite') });
    const server = buildSupervisorServer({ store });

    const maliciousOriginResponse = await server.inject({
      method: 'POST',
      url: '/api/workflows/dry-run',
      headers: {
        ...localControlHeaders,
        origin: 'https://evil.example',
      },
      payload: { workflowName: 'development.bootstrap' },
    });
    const missingTokenResponse = await server.inject({
      method: 'POST',
      url: '/api/workflows/dry-run',
      payload: { workflowName: 'development.bootstrap' },
    });
    const trustedOriginResponse = await server.inject({
      method: 'POST',
      url: '/api/workflows/dry-run',
      headers: {
        ...localControlHeaders,
        origin: 'http://127.0.0.1:5173',
      },
      payload: { workflowName: 'development.bootstrap' },
    });
    const unsupportedProtocolResponse = await server.inject({
      method: 'POST',
      url: '/api/workflows/dry-run',
      headers: {
        ...localControlHeaders,
        origin: 'ftp://localhost:5173',
      },
      payload: { workflowName: 'development.bootstrap' },
    });
    const cliStyleResponse = await server.inject({
      method: 'POST',
      url: '/api/workflows/dry-run',
      headers: localControlHeaders,
      payload: { workflowName: 'development.bootstrap' },
    });
    const preflightResponse = await server.inject({
      method: 'OPTIONS',
      url: '/api/workflows/dry-run',
      headers: {
        origin: 'http://localhost:4173',
        'access-control-request-method': 'POST',
        'access-control-request-headers': 'content-type, x-codexhub-local-token',
      },
    });

    await server.close();
    await store.close();

    expect(maliciousOriginResponse.statusCode).toBe(403);
    expect(maliciousOriginResponse.json().error).toBe('untrusted_origin');
    expect(unsupportedProtocolResponse.statusCode).toBe(403);
    expect(unsupportedProtocolResponse.json().error).toBe('untrusted_origin');
    expect(missingTokenResponse.statusCode).toBe(401);
    expect(missingTokenResponse.json().error).toBe('invalid_local_control_token');
    expect(trustedOriginResponse.statusCode).toBe(200);
    expect(trustedOriginResponse.headers['access-control-allow-origin']).toBe(
      'http://127.0.0.1:5173',
    );
    expect(cliStyleResponse.statusCode).toBe(200);
    expect(preflightResponse.statusCode).toBe(204);
    expect(preflightResponse.headers['access-control-allow-origin']).toBe('http://localhost:4173');
    expect(preflightResponse.headers['access-control-allow-origin']).not.toBe('*');
  });

  it('protects late-stage mutating control-plane routes with local gate and non-wildcard CORS', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'codexhub-supervisor-late-stage-gate-'));
    const store = await createSqliteStore({ dbPath: join(dir, 'codexhub.sqlite') });
    const server = buildSupervisorServer({ store });

    for (const url of lateStageSupervisorMutatingRoutes) {
      const missingTokenResponse = await server.inject({
        method: 'POST',
        url,
        payload: {},
      });
      const badTokenResponse = await server.inject({
        method: 'POST',
        url,
        headers: { 'x-codexhub-local-token': 'bad-token-fixture' },
        payload: {},
      });
      const maliciousOriginResponse = await server.inject({
        method: 'POST',
        url,
        headers: {
          ...localControlHeaders,
          origin: 'https://evil.example',
        },
        payload: {},
      });
      const trustedOriginResponse = await server.inject({
        method: 'POST',
        url,
        headers: {
          ...localControlHeaders,
          origin: trustedLoopbackOrigin,
        },
        payload: {},
      });
      const preflightResponse = await server.inject({
        method: 'OPTIONS',
        url,
        headers: {
          origin: 'http://localhost:4173',
          'access-control-request-method': 'POST',
          'access-control-request-headers': 'content-type, x-codexhub-local-token',
        },
      });

      expect(missingTokenResponse.statusCode).toBe(401);
      expect(missingTokenResponse.json().error).toBe('invalid_local_control_token');
      expect(badTokenResponse.statusCode).toBe(401);
      expect(badTokenResponse.json().error).toBe('invalid_local_control_token');
      expect(maliciousOriginResponse.statusCode).toBe(403);
      expect(maliciousOriginResponse.json().error).toBe('untrusted_origin');
      expect(trustedOriginResponse.statusCode).not.toBe(401);
      expect(trustedOriginResponse.body).not.toContain('invalid_local_control_token');
      expect(trustedOriginResponse.body).not.toContain('untrusted_origin');
      expect(trustedOriginResponse.body).not.toContain('Route POST:');
      expect(trustedOriginResponse.headers['access-control-allow-origin']).toBe(
        trustedLoopbackOrigin,
      );
      expect(trustedOriginResponse.headers['access-control-allow-origin']).not.toBe('*');
      expect(preflightResponse.statusCode).toBe(204);
      expect(preflightResponse.headers['access-control-allow-origin']).toBe('http://localhost:4173');
      expect(preflightResponse.headers['access-control-allow-origin']).not.toBe('*');
    }

    await server.close();
    await store.close();
  });

  it('keeps late-stage mutating route gate coverage synced with server POST registrations', () => {
    const serverSource = readFileSync(new URL('./server.ts', import.meta.url), 'utf8');
    const registeredLateStageRoutes = [
      ...serverSource.matchAll(/server\.post\('([^']+)'/g),
    ]
      .map((match) => match[1])
      .filter((route): route is string => Boolean(route))
      .filter((route) =>
        lateStageSupervisorRoutePrefixes.some((prefix) => route.startsWith(prefix)),
      )
      .concat(
        [...serverSource.matchAll(/registerGithubMergeRoutes\('([^']+)'\)/g)]
          .map((match) => match[1])
          .filter((prefix): prefix is string => Boolean(prefix))
          .flatMap((prefix) => [
            `${prefix}/dry-runs`,
            `${prefix}/approval-requests`,
            `${prefix}/manual-approvals`,
            `${prefix}/runs`,
          ]),
      )
      .concat(
        [...serverSource.matchAll(/registerGithubPrManagementRoutes\('[^']+', '([^']+)'\)/g)]
          .map((match) => match[1])
          .filter((prefix): prefix is string => Boolean(prefix))
          .flatMap((prefix) => [
            `${prefix}/dry-runs`,
            `${prefix}/approval-requests`,
            `${prefix}/manual-approvals`,
            `${prefix}/runs`,
          ]),
      )
      .concat(
        [...serverSource.matchAll(/registerGithubActionsObservationRoutes\('([^']+)'\)/g)]
          .map((match) => match[1])
          .filter((prefix): prefix is string => Boolean(prefix))
          .flatMap((prefix) => [
            `${prefix}/dry-runs`,
            `${prefix}/approval-requests`,
            `${prefix}/manual-approvals`,
            `${prefix}/runs`,
          ]),
      )
      .concat(
        [...serverSource.matchAll(/registerGithubActionsRunControlRoutes\('[^']+', '([^']+)'\)/g)]
          .map((match) => match[1])
          .filter((prefix): prefix is string => Boolean(prefix))
          .flatMap((prefix) => [
            `${prefix}/dry-runs`,
            `${prefix}/approval-requests`,
            `${prefix}/manual-approvals`,
            `${prefix}/runs`,
          ]),
      )
      .concat(
        [...serverSource.matchAll(/registerGithubActionsDispatchRoutes\('([^']+)'\)/g)]
          .map((match) => match[1])
          .filter((prefix): prefix is string => Boolean(prefix))
          .flatMap((prefix) => [
            `${prefix}/dry-runs`,
            `${prefix}/approval-requests`,
            `${prefix}/manual-approvals`,
            `${prefix}/runs`,
          ]),
      )
      .concat(
        [...serverSource.matchAll(/registerReleaseVersionPlanRoutes\('([^']+)'\)/g)]
          .map((match) => match[1])
          .filter((prefix): prefix is string => Boolean(prefix))
          .map((prefix) => `${prefix}/dry-runs`),
      )
      .concat(
        [...serverSource.matchAll(/registerGithubRelease(?:Tag|Draft)Routes\('([^']+)'\)/g)]
          .map((match) => match[1])
          .filter((prefix): prefix is string => Boolean(prefix))
          .flatMap((prefix) => [
            `${prefix}/dry-runs`,
            `${prefix}/approval-requests`,
            `${prefix}/manual-approvals`,
            `${prefix}/runs`,
          ]),
      )
      .concat(
        [...serverSource.matchAll(/registerDeploymentObservationRoutes\('([^']+)'\)/g)]
          .map((match) => match[1])
          .filter((prefix): prefix is string => Boolean(prefix))
          .flatMap((prefix) => [
            `${prefix}/dry-runs`,
            `${prefix}/approval-requests`,
            `${prefix}/manual-approvals`,
            `${prefix}/runs`,
          ]),
      )
      .concat(
        [...serverSource.matchAll(/registerDeploymentOperationRoutes\('([^']+)'\)/g)]
          .map((match) => match[1])
          .filter((prefix): prefix is string => Boolean(prefix))
          .flatMap((prefix) => [
            `${prefix}/dry-runs`,
            `${prefix}/approval-requests`,
            `${prefix}/manual-approvals`,
            `${prefix}/rollback-plans`,
            `${prefix}/runs`,
          ]),
      )
      .concat(
        [...serverSource.matchAll(/registerSecretReadinessRoutes\('([^']+)'\)/g)]
          .map((match) => match[1])
          .filter((prefix): prefix is string => Boolean(prefix))
          .flatMap((prefix) => [
            `${prefix}/dry-runs`,
            `${prefix}/approval-requests`,
            `${prefix}/manual-approvals`,
            `${prefix}/runs`,
          ]),
      )
      .concat(
        [...serverSource.matchAll(/registerRealPolicyBackendRoutes\('([^']+)'\)/g)]
          .map((match) => match[1])
          .filter((prefix): prefix is string => Boolean(prefix))
          .flatMap((prefix) => [
            `${prefix}/dry-runs`,
            `${prefix}/approval-requests`,
            `${prefix}/manual-approvals`,
            `${prefix}/runs`,
          ]),
      )
      .concat(
        [...serverSource.matchAll(/registerRealTelemetryExportRoutes\('([^']+)'\)/g)]
          .map((match) => match[1])
          .filter((prefix): prefix is string => Boolean(prefix))
          .flatMap((prefix) => [
            `${prefix}/dry-runs`,
            `${prefix}/approval-requests`,
            `${prefix}/manual-approvals`,
            `${prefix}/runs`,
          ]),
      )
      .concat(
        [
          ...serverSource.matchAll(
            /register(?:BrowserAction|ElectronMainInspector|McpWriteTool)Routes\('([^']+)'\)/g,
          ),
        ]
          .map((match) => match[1])
          .filter((prefix): prefix is string => Boolean(prefix))
          .flatMap((prefix) => [
            `${prefix}/dry-runs`,
            `${prefix}/approval-requests`,
            `${prefix}/manual-approvals`,
            `${prefix}/runs`,
          ]),
      )
      .sort();
    const registeredLateStageHelperPrefixes = [
      ...serverSource.matchAll(/register[A-Za-z0-9]+Routes\(([^)]*)\)/g),
    ]
      .flatMap((match) => [...match[1].matchAll(/'([^']+)'/g)].map((argMatch) => argMatch[1]))
      .filter((prefix): prefix is string => Boolean(prefix))
      .filter((prefix) =>
        lateStageSupervisorHelperRouteNamespaces.some((namespace) => prefix.startsWith(namespace)),
      )
      .sort();
    const coveredLateStageRoutes = [...lateStageSupervisorMutatingRoutes].sort();

    for (const prefix of registeredLateStageHelperPrefixes) {
      expect(lateStageSupervisorRoutePrefixes).toContain(prefix);
    }
    expect(coveredLateStageRoutes).toEqual(registeredLateStageRoutes);
  });

  it('keeps late-stage control-plane matrix classified by family and approval source', () => {
    const coveredLateStageRoutes = [...lateStageSupervisorMutatingRoutes];

    expect(new Set(coveredLateStageRoutes).size).toBe(coveredLateStageRoutes.length);

    for (const entry of lateStageSupervisorControlPlaneMatrix) {
      const routes = coveredLateStageRoutes.filter((route) => route.startsWith(entry.prefix));
      const expectedRoutes = getLateStageMutatingRoutes(entry);

      for (const expectedRoute of expectedRoutes) {
        expect(routes).toContain(expectedRoute);
      }
      expect(routes.every((route) => route.startsWith(entry.prefix))).toBe(true);

      if ('routeSuffixes' in entry) {
        expect(routes.sort()).toEqual([...expectedRoutes].sort());
        continue;
      }

      if (entry.approvalManagedExternally) {
        expect(routes).not.toContain(`${entry.prefix}/approval-requests`);
        expect(routes).not.toContain(`${entry.prefix}/manual-approvals`);
        continue;
      }

      expect(routes).toContain(`${entry.prefix}/approval-requests`);
      expect(routes).toContain(`${entry.prefix}/manual-approvals`);
    }
  });

  it('rejects caller-supplied authority objects on late-stage approval and run routes', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'codexhub-supervisor-late-stage-authority-'));
    const store = await createSqliteStore({ dbPath: join(dir, 'codexhub.sqlite') });
    const server = buildSupervisorServer({ store });
    const routesWithAuthorityInputs = lateStageSupervisorMutatingRoutes.filter(
      (url) => url.endsWith('/approval-requests') || url.endsWith('/runs'),
    );

    for (const url of routesWithAuthorityInputs) {
      const response = await server.inject({
        method: 'POST',
        url,
        headers: localControlHeaders,
        payload: {
          dryRunId: 'dry-run-fixture',
          approvalArtifactId: 'approval-fixture',
          approvalArtifact: { id: 'caller_supplied_artifact', status: 'approved' },
          executionAuthority: { allowed: true, policyDecisionId: 'caller_supplied_policy' },
          authority: { allowed: true, policyDecisionId: 'caller_supplied_authority' },
          rawUrl: 'https://evil.example/caller-supplied-url',
          rawBody: 'caller supplied raw body fixture',
          requestBody: 'caller supplied request body fixture',
          responseBody: 'caller supplied response body fixture',
          token: 'ghp_caller_supplied_token',
          envValue: 'CALLER_SUPPLIED_ENV_VALUE',
          childArtifacts: [{ id: 'caller_supplied_child_artifact' }],
          fullArtifact: { id: 'caller_supplied_full_artifact' },
        },
      });

      expect(response.statusCode).toBeGreaterThanOrEqual(400);
      expect(response.body).not.toContain('caller_supplied_artifact');
      expect(response.body).not.toContain('caller_supplied_policy');
      expect(response.body).not.toContain('caller_supplied_authority');
      expect(response.body).not.toContain('caller-supplied-url');
      expect(response.body).not.toContain('caller supplied raw body fixture');
      expect(response.body).not.toContain('caller supplied request body fixture');
      expect(response.body).not.toContain('caller supplied response body fixture');
      expect(response.body).not.toContain('ghp_caller_supplied_token');
      expect(response.body).not.toContain('CALLER_SUPPLIED_ENV_VALUE');
      expect(response.body).not.toContain('caller_supplied_child_artifact');
      expect(response.body).not.toContain('caller_supplied_full_artifact');
      expect(response.body).not.toContain('"allowed":true');
    }

    await server.close();
    await store.close();
  });

  it('governs browser observation dry-run, persisted approval, and injected execution', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'codexhub-supervisor-browser-observation-'));
    const store = await createSqliteStore({ dbPath: join(dir, 'codexhub.sqlite') });
    const server = buildSupervisorServer({
      store,
      playwrightObserverEnabled: true,
      playwrightObserverRunner: {
        async observe() {
          return {
            status: 'completed',
            targetUrlHash: `sha256:${hashTestText('http://127.0.0.1:4173/#/browser-profiles')}`,
            pageTitle: 'Local Browser Target',
            pageUrl: 'http://127.0.0.1:4173/#/browser-profiles',
            consoleSummary: {
              messageCount: 1,
              warningCount: 0,
              errorCount: 0,
              bodyStored: false,
            },
            networkSummary: {
              requestCount: 1,
              responseCount: 1,
              failedRequestCount: 0,
              bodyStored: false,
            },
            processBoundaryInvoked: true,
            externalProcessStarted: true,
            summary: 'Injected controlled browser observation completed.',
          };
        },
      },
    });
    const missingTokenResponse = await server.inject({
      method: 'POST',
      url: '/api/browser/observation/dry-runs',
      payload: {},
    });
    const maliciousOriginResponse = await server.inject({
      method: 'POST',
      url: '/api/browser/observation/dry-runs',
      headers: {
        ...localControlHeaders,
        origin: 'https://evil.example',
      },
      payload: {},
    });
    const dryRunResponse = await server.inject({
      method: 'POST',
      url: '/api/browser/observation/dry-runs',
      headers: localControlHeaders,
      payload: {
        runnerMode: 'controlled-local-browser',
        targetUrl: 'http://127.0.0.1:4173/#/browser-profiles',
        capabilities: ['title', 'url', 'console_summary', 'network_metadata_summary'],
      },
    });
    const dryRunId = dryRunResponse.json().dryRunId as string;
    const nullArtifactApprovalRequestResponse = await server.inject({
      method: 'POST',
      url: '/api/browser/observation/approval-requests',
      headers: localControlHeaders,
      payload: {
        dryRunId,
        approvalArtifact: null,
      },
    });
    const approvalRequestResponse = await server.inject({
      method: 'POST',
      url: '/api/browser/observation/approval-requests',
      headers: localControlHeaders,
      payload: {
        dryRunId,
        requestedBy: 'local-operator',
        reason: 'private approval reason',
      },
    });
    const approvalResponse = await server.inject({
      method: 'POST',
      url: '/api/browser/observation/manual-approvals',
      headers: localControlHeaders,
      payload: {
        dryRunId,
        approvalRequestId: approvalRequestResponse.json().approvalRequestId,
        outcome: 'approved',
        reason: 'private approval reason',
      },
    });
    const forgedRunResponse = await server.inject({
      method: 'POST',
      url: '/api/browser/observation/runs',
      headers: localControlHeaders,
      payload: {
        dryRunId,
        approvalArtifact: approvalResponse.json(),
      },
    });
    const nullAuthorityRunResponse = await server.inject({
      method: 'POST',
      url: '/api/browser/observation/runs',
      headers: localControlHeaders,
      payload: {
        dryRunId,
        approvalArtifactId: approvalResponse.json().approvalArtifactId,
        authority: null,
      },
    });
    const runResponse = await server.inject({
      method: 'POST',
      url: '/api/browser/observation/runs',
      headers: localControlHeaders,
      payload: {
        dryRunId,
        approvalArtifactId: approvalResponse.json().approvalArtifactId,
      },
    });
    const listResponse = await server.inject({
      method: 'GET',
      url: '/api/browser/observation/runs',
    });

    await server.close();
    await store.close();

    expect(missingTokenResponse.statusCode).toBe(401);
    expect(maliciousOriginResponse.statusCode).toBe(403);
    expect(dryRunResponse.statusCode).toBe(200);
    expect(dryRunResponse.json()).toMatchObject({
      status: 'ready',
      processBoundaryPlanned: true,
      processBoundaryInvoked: false,
      externalProcessStarted: false,
      noRealWrite: true,
      bodyStored: false,
      rawPathStored: false,
    });
    expect(approvalRequestResponse.statusCode).toBe(200);
    expect(nullArtifactApprovalRequestResponse.statusCode).toBe(400);
    expect(nullArtifactApprovalRequestResponse.json().error).toBe(
      'untrusted_browser_observation_authority_body',
    );
    expect(approvalResponse.statusCode).toBe(200);
    expect(approvalResponse.json().status).toBe('approved');
    expect(forgedRunResponse.statusCode).toBe(400);
    expect(forgedRunResponse.json().error).toBe('untrusted_browser_observation_authority_body');
    expect(nullAuthorityRunResponse.statusCode).toBe(400);
    expect(nullAuthorityRunResponse.json().error).toBe(
      'untrusted_browser_observation_authority_body',
    );
    expect(runResponse.statusCode).toBe(200);
    expect(runResponse.json()).toMatchObject({
      status: 'completed',
      processBoundaryInvoked: true,
      externalProcessStarted: true,
      noRealWrite: true,
      bodyStored: false,
      rawPathStored: false,
    });
    expect(listResponse.json().records).toHaveLength(1);
    expect(JSON.stringify({ dryRun: dryRunResponse.json(), approval: approvalResponse.json(), run: runResponse.json() })).not.toContain(
      'http://127.0.0.1:4173',
    );
    expect(JSON.stringify({ approval: approvalResponse.json() })).not.toContain(
      'private approval reason',
    );
  });

  it('blocks browser observation execution when store or enablement is unavailable', async () => {
    const disabledStoreServer = buildSupervisorServer({ disableStore: true });
    const disabledStoreResponse = await disabledStoreServer.inject({
      method: 'POST',
      headers: localControlHeaders,
      url: '/api/browser/observation/dry-runs',
      payload: {},
    });
    const dir = mkdtempSync(join(tmpdir(), 'codexhub-supervisor-browser-disabled-'));
    const store = await createSqliteStore({ dbPath: join(dir, 'codexhub.sqlite') });
    const server = buildSupervisorServer({ store });
    const dryRunResponse = await server.inject({
      method: 'POST',
      headers: localControlHeaders,
      url: '/api/browser/observation/dry-runs',
      payload: {
        runnerMode: 'controlled-local-browser',
        targetUrl: 'http://localhost:4173/',
      },
    });
    const approvalRequestResponse = await server.inject({
      method: 'POST',
      headers: localControlHeaders,
      url: '/api/browser/observation/approval-requests',
      payload: {
        dryRunId: dryRunResponse.json().dryRunId,
      },
    });
    const approvalResponse = await server.inject({
      method: 'POST',
      headers: localControlHeaders,
      url: '/api/browser/observation/manual-approvals',
      payload: {
        dryRunId: dryRunResponse.json().dryRunId,
        approvalRequestId: approvalRequestResponse.json().approvalRequestId,
        outcome: 'approved',
      },
    });
    const blockedRunResponse = await server.inject({
      method: 'POST',
      headers: localControlHeaders,
      url: '/api/browser/observation/runs',
      payload: {
        dryRunId: dryRunResponse.json().dryRunId,
        approvalArtifactId: approvalResponse.json().approvalArtifactId,
      },
    });

    await disabledStoreServer.close();
    await server.close();
    await store.close();

    expect(disabledStoreResponse.statusCode).toBe(503);
    expect(disabledStoreResponse.json()).toMatchObject({
      status: 'blocked',
      processBoundaryInvoked: false,
      externalProcessStarted: false,
    });
    expect(blockedRunResponse.statusCode).toBe(200);
    expect(blockedRunResponse.json()).toMatchObject({
      status: 'blocked',
      processBoundaryInvoked: false,
      externalProcessStarted: false,
      noRealWrite: true,
    });
  });

  it('governs electron cdp dry-run, persisted approval, and injected HTTP execution', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'codexhub-supervisor-electron-cdp-'));
    const store = await createSqliteStore({ dbPath: join(dir, 'codexhub.sqlite') });
    const server = buildSupervisorServer({
      store,
      electronCdpObserverEnabled: true,
      electronCdpObserverRunner: {
        async observe() {
          return {
            status: 'completed',
            cdpHttpBoundaryInvoked: true,
            processBoundaryInvoked: false,
            externalProcessStarted: false,
            metadata: {
              versionBodyHash: `sha256:${hashTestText('version fixture')}`,
              listBodyHash: `sha256:${hashTestText('list fixture')}`,
              targetCount: 1,
              bodyStored: false,
              rawPathStored: false,
            },
            summary: 'Injected Electron/CDP controlled HTTP metadata observation completed.',
          };
        },
      },
    });
    const missingTokenResponse = await server.inject({
      method: 'POST',
      url: '/api/electron-cdp/observation/dry-runs',
      payload: {},
    });
    const maliciousOriginResponse = await server.inject({
      method: 'POST',
      url: '/api/electron-cdp/observation/dry-runs',
      headers: {
        ...localControlHeaders,
        origin: 'https://evil.example',
      },
      payload: {},
    });
    const preflightResponse = await server.inject({
      method: 'OPTIONS',
      url: '/api/electron-cdp/observation/dry-runs',
      headers: {
        origin: 'http://localhost:5173',
        'access-control-request-method': 'POST',
        'access-control-request-headers': 'content-type',
      },
    });
    const dryRunResponse = await server.inject({
      method: 'POST',
      url: '/api/electron-cdp/observation/dry-runs',
      headers: localControlHeaders,
      payload: {
        runnerMode: 'controlled-local-http',
        host: '127.0.0.1',
        port: 9222,
        capabilities: ['debug_endpoint_summary', 'target_summary'],
        metadata: {
          targetUrl: 'app://codex/?secret=value',
          cwd: 'C:\\Users\\Thomas\\CodexHub',
        },
      },
    });
    const dryRunId = dryRunResponse.json().dryRunId as string;
    const persistedDryRun =
      await store.electronCdpObservationDryRuns.getDryRun(dryRunId);
    const nullArtifactApprovalRequestResponse = await server.inject({
      method: 'POST',
      url: '/api/electron-cdp/observation/approval-requests',
      headers: localControlHeaders,
      payload: {
        dryRunId,
        approvalArtifact: null,
      },
    });
    const approvalRequestResponse = await server.inject({
      method: 'POST',
      url: '/api/electron-cdp/observation/approval-requests',
      headers: localControlHeaders,
      payload: {
        dryRunId,
        requestedBy: 'local-operator',
        reason: 'private electron approval reason',
      },
    });
    const approvalResponse = await server.inject({
      method: 'POST',
      url: '/api/electron-cdp/observation/manual-approvals',
      headers: localControlHeaders,
      payload: {
        dryRunId,
        approvalRequestId: approvalRequestResponse.json().approvalRequestId,
        outcome: 'approved',
        reason: 'private electron approval reason',
      },
    });
    const forgedRunResponse = await server.inject({
      method: 'POST',
      url: '/api/electron-cdp/observation/runs',
      headers: localControlHeaders,
      payload: {
        dryRunId,
        approvalArtifact: approvalResponse.json(),
      },
    });
    const nullAuthorityRunResponse = await server.inject({
      method: 'POST',
      url: '/api/electron-cdp/observation/runs',
      headers: localControlHeaders,
      payload: {
        dryRunId,
        approvalArtifactId: approvalResponse.json().approvalArtifactId,
        authority: null,
        host: '127.0.0.1',
        port: 9222,
      },
    });
    const mismatchRunResponse = await server.inject({
      method: 'POST',
      url: '/api/electron-cdp/observation/runs',
      headers: localControlHeaders,
      payload: {
        dryRunId,
        approvalArtifactId: approvalResponse.json().approvalArtifactId,
        host: '127.0.0.1',
        port: 9333,
      },
    });
    const runResponse = await server.inject({
      method: 'POST',
      url: '/api/electron-cdp/observation/runs',
      headers: localControlHeaders,
      payload: {
        dryRunId,
        approvalArtifactId: approvalResponse.json().approvalArtifactId,
        host: '127.0.0.1',
        port: 9222,
      },
    });
    const listResponse = await server.inject({
      method: 'GET',
      url: '/api/electron-cdp/observation/runs',
    });
    const showResponse = await server.inject({
      method: 'GET',
      url: `/api/electron-cdp/observation/runs/${runResponse.json().runId}`,
    });
    const usedApprovalsResponse = await server.inject({
      method: 'GET',
      url: `/api/electron-cdp/observation/approvals?dryRunId=${dryRunId}&status=used`,
    });

    await server.close();
    await store.close();

    expect(missingTokenResponse.statusCode).toBe(401);
    expect(maliciousOriginResponse.statusCode).toBe(403);
    expect(preflightResponse.statusCode).toBe(401);
    expect(dryRunResponse.statusCode).toBe(200);
    expect(dryRunResponse.json()).toMatchObject({
      status: 'ready',
      runnerMode: 'controlled-local-http',
      cdpHttpBoundaryPlanned: true,
      cdpHttpBoundaryInvoked: false,
      processBoundaryInvoked: false,
      externalProcessStarted: false,
      noRealWrite: true,
      bodyStored: false,
      rawPathStored: false,
    });
    expect(JSON.stringify(persistedDryRun)).not.toContain('app://codex');
    expect(JSON.stringify(persistedDryRun)).not.toContain('C:\\Users\\Thomas');
    expect(JSON.stringify(persistedDryRun)).not.toContain('secret=value');
    expect(nullArtifactApprovalRequestResponse.statusCode).toBe(400);
    expect(nullArtifactApprovalRequestResponse.json().error).toBe(
      'untrusted_electron_cdp_observation_authority_body',
    );
    expect(approvalRequestResponse.statusCode).toBe(200);
    expect(approvalResponse.statusCode).toBe(200);
    expect(approvalResponse.json().status).toBe('approved');
    expect(forgedRunResponse.statusCode).toBe(400);
    expect(forgedRunResponse.json().error).toBe(
      'untrusted_electron_cdp_observation_authority_body',
    );
    expect(nullAuthorityRunResponse.statusCode).toBe(400);
    expect(nullAuthorityRunResponse.json().error).toBe(
      'untrusted_electron_cdp_observation_authority_body',
    );
    expect(mismatchRunResponse.statusCode).toBe(200);
    expect(mismatchRunResponse.json()).toMatchObject({
      status: 'blocked',
      cdpHttpBoundaryInvoked: false,
      processBoundaryInvoked: false,
      externalProcessStarted: false,
    });
    expect(runResponse.statusCode).toBe(200);
    expect(runResponse.json()).toMatchObject({
      status: 'completed',
      cdpHttpBoundaryInvoked: true,
      processBoundaryInvoked: false,
      externalProcessStarted: false,
      noRealWrite: true,
      bodyStored: false,
      rawPathStored: false,
    });
    expect(listResponse.json().records.length).toBeGreaterThanOrEqual(2);
    expect(showResponse.statusCode).toBe(200);
    expect(showResponse.json().runId).toBe(runResponse.json().runId);
    expect(usedApprovalsResponse.json().records).toHaveLength(1);
    const serializedElectronCdpRecords = JSON.stringify({
      dryRun: dryRunResponse.json(),
      approval: approvalResponse.json(),
      run: runResponse.json(),
    });
    const publicRun = runResponse.json() as Record<string, unknown>;
    expect(serializedElectronCdpRecords).not.toContain('127.0.0.1');
    expect(publicRun).not.toHaveProperty('host');
    expect(publicRun).not.toHaveProperty('port');
    expect(publicRun).not.toHaveProperty('rawHost');
    expect(publicRun).not.toHaveProperty('rawPort');
    expect(publicRun).not.toHaveProperty('webSocketDebuggerUrl');
    expect(publicRun.endpointIdHash).toMatch(/^sha256:/);
    expect(approvalResponse.body).not.toContain('private electron approval reason');
  });

  it('governs electron cdp WebSocket event dry-run, approval, and injected execution', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'codexhub-supervisor-electron-events-'));
    const store = await createSqliteStore({ dbPath: join(dir, 'codexhub.sqlite') });
    const targetIdHash = `sha256:${hashTestText('target-1')}`;
    const server = buildSupervisorServer({
      store,
      electronCdpObserverEnabled: true,
      electronCdpEventsEnabled: true,
      electronCdpObserverRunner: {
        async observe() {
          return {
            status: 'completed',
            cdpHttpBoundaryInvoked: true,
            cdpWebSocketBoundaryInvoked: true,
            processBoundaryInvoked: false,
            externalProcessStarted: false,
            eventSummary: {
              observationWindowMs: 10,
              eventCount: 3,
              consoleEventCount: 1,
              networkEventCount: 2,
              payloadHashes: [`sha256:${hashTestText('private event payload')}`],
              bodyStored: false,
              rawPathStored: false,
              noRealWrite: true,
            },
            metadata: {
              cdpHttpBoundaryInvoked: true,
              cdpWebSocketBoundaryInvoked: true,
              payloadHashes: [`sha256:${hashTestText('private event payload')}`],
              bodyStored: false,
              rawPathStored: false,
            },
            summary: 'Injected Electron/CDP WebSocket event metadata observation completed.',
          };
        },
      },
    });
    const dryRunResponse = await server.inject({
      method: 'POST',
      url: '/api/electron-cdp/observation/dry-runs',
      headers: localControlHeaders,
      payload: {
        runnerMode: 'controlled-websocket-events',
        host: '127.0.0.1',
        port: 9222,
        targetIdHash,
        observationWindowMs: 10,
        capabilities: ['console_summary', 'network_metadata_summary'],
      },
    });
    const dryRunId = dryRunResponse.json().dryRunId as string;
    const persistedDryRun =
      await store.electronCdpObservationDryRuns.getDryRun(dryRunId);
    const approvalRequestResponse = await server.inject({
      method: 'POST',
      url: '/api/electron-cdp/observation/approval-requests',
      headers: localControlHeaders,
      payload: { dryRunId },
    });
    const approvalResponse = await server.inject({
      method: 'POST',
      url: '/api/electron-cdp/observation/manual-approvals',
      headers: localControlHeaders,
      payload: {
        dryRunId,
        approvalRequestId: approvalRequestResponse.json().approvalRequestId,
        outcome: 'approved',
      },
    });
    const runResponse = await server.inject({
      method: 'POST',
      url: '/api/electron-cdp/observation/runs',
      headers: localControlHeaders,
      payload: {
        dryRunId,
        approvalArtifactId: approvalResponse.json().approvalArtifactId,
        host: '127.0.0.1',
        port: 9222,
      },
    });
    const usedApprovalsResponse = await server.inject({
      method: 'GET',
      url: `/api/electron-cdp/observation/approvals?dryRunId=${dryRunId}&status=used`,
    });

    await server.close();
    await store.close();

    expect(dryRunResponse.statusCode).toBe(200);
    expect(dryRunResponse.json()).toMatchObject({
      status: 'ready',
      runnerMode: 'controlled-websocket-events',
      targetIdHash,
      cdpHttpBoundaryPlanned: true,
      cdpWebSocketBoundaryPlanned: true,
      cdpWebSocketBoundaryInvoked: false,
      processBoundaryInvoked: false,
      externalProcessStarted: false,
      noRealWrite: true,
      bodyStored: false,
      rawPathStored: false,
    });
    expect(persistedDryRun?.targetIdHash).toBe(targetIdHash);
    expect(runResponse.statusCode).toBe(200);
    expect(runResponse.json()).toMatchObject({
      status: 'completed',
      targetIdHash,
      cdpHttpBoundaryInvoked: true,
      cdpWebSocketBoundaryInvoked: true,
      processBoundaryInvoked: false,
      externalProcessStarted: false,
      noRealWrite: true,
      bodyStored: false,
      rawPathStored: false,
    });
    expect(usedApprovalsResponse.json().records).toHaveLength(1);
    expect(JSON.stringify({ dryRun: dryRunResponse.json(), run: runResponse.json() })).not.toContain(
      '127.0.0.1',
    );
    expect(runResponse.body).not.toContain('9222');
    expect(runResponse.body).not.toContain('private event payload');
  });

  it('preserves electron cdp HTTP boundary truth when WebSocket execution blocks after target list read', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'codexhub-supervisor-electron-events-blocked-'));
    const store = await createSqliteStore({ dbPath: join(dir, 'codexhub.sqlite') });
    const targetIdHash = `sha256:${hashTestText('target-1')}`;
    const server = buildSupervisorServer({
      store,
      electronCdpObserverEnabled: true,
      electronCdpEventsEnabled: true,
      electronCdpObserverRunner: {
        async observe() {
          return {
            status: 'blocked',
            cdpHttpBoundaryInvoked: true,
            cdpWebSocketBoundaryInvoked: false,
            processBoundaryInvoked: false,
            externalProcessStarted: false,
            metadata: {
              blockReason: 'websocket_debugger_url_missing',
              listBodyHash: `sha256:${hashTestText('target list with missing debugger url')}`,
              bodyStored: false,
              rawPathStored: false,
            },
            summary:
              'Injected Electron/CDP WebSocket event observation blocked after target list read.',
          };
        },
      },
    });
    const dryRunResponse = await server.inject({
      method: 'POST',
      url: '/api/electron-cdp/observation/dry-runs',
      headers: localControlHeaders,
      payload: {
        runnerMode: 'controlled-websocket-events',
        host: '127.0.0.1',
        port: 9222,
        targetIdHash,
        observationWindowMs: 10,
      },
    });
    const dryRunId = dryRunResponse.json().dryRunId as string;
    const approvalRequestResponse = await server.inject({
      method: 'POST',
      url: '/api/electron-cdp/observation/approval-requests',
      headers: localControlHeaders,
      payload: { dryRunId },
    });
    const approvalResponse = await server.inject({
      method: 'POST',
      url: '/api/electron-cdp/observation/manual-approvals',
      headers: localControlHeaders,
      payload: {
        dryRunId,
        approvalRequestId: approvalRequestResponse.json().approvalRequestId,
        outcome: 'approved',
      },
    });
    const runResponse = await server.inject({
      method: 'POST',
      url: '/api/electron-cdp/observation/runs',
      headers: localControlHeaders,
      payload: {
        dryRunId,
        approvalArtifactId: approvalResponse.json().approvalArtifactId,
        host: '127.0.0.1',
        port: 9222,
      },
    });
    const usedApprovalsResponse = await server.inject({
      method: 'GET',
      url: `/api/electron-cdp/observation/approvals?dryRunId=${dryRunId}&status=used`,
    });

    await server.close();
    await store.close();

    expect(runResponse.statusCode).toBe(200);
    expect(runResponse.json()).toMatchObject({
      status: 'blocked',
      cdpHttpBoundaryInvoked: true,
      cdpWebSocketBoundaryInvoked: false,
      processBoundaryInvoked: false,
      externalProcessStarted: false,
      noRealWrite: true,
      bodyStored: false,
      rawPathStored: false,
    });
    expect(usedApprovalsResponse.json().records).toHaveLength(1);
    expect(runResponse.body).not.toContain('127.0.0.1');
    expect(runResponse.body).not.toContain('9222');
    expect(runResponse.body).not.toContain('target list with missing debugger url');
  });

  it('governs worktree dry-run, persisted approval, and injected controlled git execution', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'codexhub-supervisor-worktree-'));
    const repoRoot = join(dir, 'repo');
    const worktreeRoot = join(dir, 'CodexHub-worktrees');
    const worktreeSlug = 'feature-m6b';
    const branchName = 'codex/feature-m6b';
    const baseRef = 'HEAD';
    mkdirSync(repoRoot, { recursive: true });
    const store = await createSqliteStore({ dbPath: join(dir, 'codexhub.sqlite') });
    const server = buildSupervisorServer({
      store,
      worktreeManagerEnabled: true,
      worktreeManagerRunner: {
        async run() {
          return {
            status: 'completed',
            changedFiles: ['packages/worktree-manager/src/execute.ts'],
            diffHash: 'sha256:diff',
            diffLineCount: 3,
            commandSummaryHash: 'sha256:command',
            gitProcessBoundaryInvoked: true,
            processBoundaryInvoked: true,
            externalProcessStarted: true,
            noRealWrite: false,
            cleanupRequired: true,
            cleanupDeferred: true,
            summary: 'Injected controlled git run completed.',
          };
        },
      },
    });

    const dryRunResponse = await server.inject({
      method: 'POST',
      url: '/api/worktrees/dry-runs',
      headers: localControlHeaders,
      payload: {
        repoRoot,
        worktreeSlug,
        branchName,
        baseRef,
        runnerMode: 'controlled-git-worktree',
      },
    });
    const dryRunId = dryRunResponse.json().dryRunId as string;
    const approvalRequestResponse = await server.inject({
      method: 'POST',
      url: '/api/worktrees/approval-requests',
      headers: localControlHeaders,
      payload: { dryRunId, reason: 'hash-bound worktree approval' },
    });
    const approvalResponse = await server.inject({
      method: 'POST',
      url: '/api/worktrees/manual-approvals',
      headers: localControlHeaders,
      payload: {
        dryRunId,
        approvalRequestId: approvalRequestResponse.json().approvalRequestId,
        outcome: 'approved',
      },
    });
    const untrustedRunResponse = await server.inject({
      method: 'POST',
      url: '/api/worktrees/runs',
      headers: localControlHeaders,
      payload: {
        dryRunId,
        approvalArtifact: approvalResponse.json(),
      },
    });
    const runResponse = await server.inject({
      method: 'POST',
      url: '/api/worktrees/runs',
      headers: localControlHeaders,
      payload: {
        dryRunId,
        approvalArtifactId: approvalResponse.json().approvalArtifactId,
        repoRoot,
        worktreeRoot,
        worktreePath: join(worktreeRoot, worktreeSlug),
        worktreeSlug,
        branchName,
        baseRef,
      },
    });
    const approvalsResponse = await server.inject({
      method: 'GET',
      url: `/api/worktrees/approvals?dryRunId=${dryRunId}&status=used`,
    });

    await server.close();
    await store.close();

    expect(dryRunResponse.statusCode).toBe(200);
    expect(dryRunResponse.json()).toMatchObject({
      status: 'ready',
      runnerMode: 'controlled-git-worktree',
      gitProcessBoundaryPlanned: true,
      gitProcessBoundaryInvoked: false,
    });
    expect(untrustedRunResponse.statusCode).toBe(400);
    expect(runResponse.statusCode).toBe(200);
    expect(runResponse.json()).toMatchObject({
      status: 'completed',
      gitProcessBoundaryInvoked: true,
      processBoundaryInvoked: true,
      externalProcessStarted: true,
      cleanupRequired: true,
      cleanupDeferred: true,
      noRealWrite: false,
    });
    expect(approvalsResponse.json().records).toHaveLength(1);
    expect(JSON.stringify(runResponse.json())).not.toContain(repoRoot);
    expect(JSON.stringify(runResponse.json())).not.toContain('diff --git');
  });

  it('aggregates approval inbox and records decisions through local-control gate', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'codexhub-supervisor-approval-ux-'));
    const repoRoot = join(dir, 'repo');
    const worktreeSlug = 'feature-approval-ux';
    const branchName = 'codex/feature-approval-ux';
    mkdirSync(repoRoot, { recursive: true });
    const store = await createSqliteStore({ dbPath: join(dir, 'codexhub.sqlite') });
    const server = buildSupervisorServer({ store });

    const dryRunResponse = await server.inject({
      method: 'POST',
      url: '/api/worktrees/dry-runs',
      headers: localControlHeaders,
      payload: {
        repoRoot,
        worktreeSlug,
        branchName,
        baseRef: 'HEAD',
        runnerMode: 'controlled-git-worktree',
      },
    });
    const approvalRequestResponse = await server.inject({
      method: 'POST',
      url: '/api/worktrees/approval-requests',
      headers: localControlHeaders,
      payload: {
        dryRunId: dryRunResponse.json().dryRunId,
        reason: 'approval UX decision test',
      },
    });
    const inboxResponse = await server.inject({
      method: 'GET',
      url: '/api/approvals/inbox?type=worktree',
    });
    const missingTokenResponse = await server.inject({
      method: 'POST',
      url: '/api/approvals/decisions',
      payload: {
        approvalRequestId: approvalRequestResponse.json().approvalRequestId,
        approvalType: 'worktree',
        decision: 'approved',
        reason: 'Review evidence',
      },
    });
    const untrustedBodyResponse = await server.inject({
      method: 'POST',
      url: '/api/approvals/decisions',
      headers: localControlHeaders,
      payload: {
        approvalRequestId: approvalRequestResponse.json().approvalRequestId,
        approvalType: 'worktree',
        decision: 'approved',
        reason: 'Review evidence',
        approvalArtifact: { id: 'caller_supplied' },
      },
    });
    const decisionResponse = await server.inject({
      method: 'POST',
      url: '/api/approvals/decisions',
      headers: {
        ...localControlHeaders,
        origin: 'http://127.0.0.1:5173',
      },
      payload: {
        approvalRequestId: approvalRequestResponse.json().approvalRequestId,
        approvalType: 'worktree',
        decision: 'approved',
        reason: 'Review evidence',
      },
    });

    await server.close();
    await store.close();

    expect(dryRunResponse.statusCode).toBe(200);
    expect(inboxResponse.statusCode).toBe(200);
    expect(inboxResponse.json()).toMatchObject({
      itemCount: 1,
      requestedCount: 1,
      bodyStored: false,
      tokenStored: false,
    });
    expect(inboxResponse.json().items[0]).toMatchObject({
      approvalType: 'worktree',
      canApprove: true,
      canDeny: true,
      processBoundaryInvoked: false,
      externalProcessStarted: false,
    });
    expect(missingTokenResponse.statusCode).toBe(401);
    expect(untrustedBodyResponse.statusCode).toBe(400);
    expect(decisionResponse.statusCode).toBe(200);
    expect(decisionResponse.json()).toMatchObject({
      approvalType: 'worktree',
      decision: 'approved',
      status: 'approved',
      approved: true,
      processBoundaryInvoked: false,
      externalProcessStarted: false,
      tokenStored: false,
    });
    const serialized = JSON.stringify({
      inbox: inboxResponse.json(),
      decision: decisionResponse.json(),
    });
    expect(serialized).not.toContain(repoRoot);
    expect(serialized).not.toContain('approval UX decision test');
    expect(serialized).not.toContain('caller_supplied');
  });

  it('marks worktree approvals used when a controlled git attempt fails after the boundary', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'codexhub-supervisor-worktree-failed-'));
    const repoRoot = join(dir, 'repo');
    const worktreeRoot = join(dir, 'CodexHub-worktrees');
    const worktreeSlug = 'feature-m6b-failed';
    const branchName = 'codex/feature-m6b-failed';
    const baseRef = 'HEAD';
    mkdirSync(repoRoot, { recursive: true });
    const store = await createSqliteStore({ dbPath: join(dir, 'codexhub.sqlite') });
    const server = buildSupervisorServer({
      store,
      worktreeManagerEnabled: true,
      worktreeManagerRunner: {
        async run() {
          return {
            status: 'failed',
            commandSummaryHash: 'sha256:command',
            gitProcessBoundaryInvoked: true,
            processBoundaryInvoked: true,
            externalProcessStarted: true,
            noRealWrite: false,
            cleanupRequired: true,
            cleanupDeferred: true,
            summary: 'Injected controlled git run failed after boundary.',
          };
        },
      },
    });

    const dryRunResponse = await server.inject({
      method: 'POST',
      url: '/api/worktrees/dry-runs',
      headers: localControlHeaders,
      payload: {
        repoRoot,
        worktreeSlug,
        branchName,
        baseRef,
        runnerMode: 'controlled-git-worktree',
      },
    });
    const dryRunId = dryRunResponse.json().dryRunId as string;
    const approvalRequestResponse = await server.inject({
      method: 'POST',
      url: '/api/worktrees/approval-requests',
      headers: localControlHeaders,
      payload: { dryRunId, reason: 'hash-bound worktree approval' },
    });
    const approvalResponse = await server.inject({
      method: 'POST',
      url: '/api/worktrees/manual-approvals',
      headers: localControlHeaders,
      payload: {
        dryRunId,
        approvalRequestId: approvalRequestResponse.json().approvalRequestId,
        outcome: 'approved',
      },
    });
    const runResponse = await server.inject({
      method: 'POST',
      url: '/api/worktrees/runs',
      headers: localControlHeaders,
      payload: {
        dryRunId,
        approvalArtifactId: approvalResponse.json().approvalArtifactId,
        repoRoot,
        worktreeRoot,
        worktreePath: join(worktreeRoot, worktreeSlug),
        worktreeSlug,
        branchName,
        baseRef,
      },
    });
    const usedApprovalsResponse = await server.inject({
      method: 'GET',
      url: `/api/worktrees/approvals?dryRunId=${dryRunId}&status=used`,
    });

    await server.close();
    await store.close();

    expect(runResponse.statusCode).toBe(200);
    expect(runResponse.json()).toMatchObject({
      status: 'failed',
      gitProcessBoundaryInvoked: true,
      processBoundaryInvoked: true,
      externalProcessStarted: true,
      cleanupRequired: true,
      cleanupDeferred: true,
      noRealWrite: false,
    });
    expect(usedApprovalsResponse.json().records).toHaveLength(1);
    expect(JSON.stringify(runResponse.json())).not.toContain(repoRoot);
    expect(JSON.stringify(runResponse.json())).not.toContain('diff --git');
  });

  it('exposes M9 local pilot runs through local-control gated metadata routes', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'codexhub-supervisor-m9-pilot-'));
    const repoRoot = join(dir, 'repo');
    const worktreeRoot = join(dir, 'CodexHub-worktrees');
    const worktreeSlug = 'pilot-m9';
    const branchName = 'codex/pilot-m9';
    const baseRef = 'HEAD';
    mkdirSync(repoRoot, { recursive: true });
    mkdirSync(worktreeRoot, { recursive: true });
    writeFileSync(join(repoRoot, 'package.json'), '{"name":"fixture"}');
    const store = await createSqliteStore({ dbPath: join(dir, 'codexhub.sqlite') });
    const server = buildSupervisorServer({ store, m9LocalPilotEnabled: true });
    const dryRunResponse = await server.inject({
      method: 'POST',
      url: '/api/worktrees/dry-runs',
      headers: localControlHeaders,
      payload: {
        repoRoot,
        worktreeSlug,
        branchName,
        baseRef,
        worktreeRoot,
        runnerMode: 'controlled-git-worktree',
      },
    });
    const dryRunId = dryRunResponse.json().dryRunId as string;
    const missingTokenResponse = await server.inject({
      method: 'POST',
      url: '/api/pilots/m9/local-runs',
      payload: { worktreeDryRunId: dryRunId },
    });
    const maliciousOriginResponse = await server.inject({
      method: 'POST',
      url: '/api/pilots/m9/local-runs',
      headers: { ...localControlHeaders, origin: 'https://evil.example' },
      payload: { worktreeDryRunId: dryRunId },
    });
    const untrustedBodyResponse = await server.inject({
      method: 'POST',
      url: '/api/pilots/m9/local-runs',
      headers: localControlHeaders,
      payload: { worktreeDryRunId: dryRunId, authority: null },
    });
    const blockedRunResponse = await server.inject({
      method: 'POST',
      url: '/api/pilots/m9/local-runs',
      headers: localControlHeaders,
      payload: {
        title: 'M9 pilot blocked fixture',
        description: 'Missing approval artifacts should block before boundaries.',
        worktreeDryRunId: dryRunId,
        repoRoot,
        worktreeRoot,
        worktreePath: join(worktreeRoot, worktreeSlug),
        worktreeSlug,
        branchName,
        baseRef,
        codexDryRunId: 'codex_dry_run_1',
        governedInput: {
          relativePath: 'package.json',
          expectedContentHash: 'sha256:governed-input',
        },
      },
    });
    const listResponse = await server.inject({ method: 'GET', url: '/api/pilots/m9/local-runs' });
    const showResponse = await server.inject({
      method: 'GET',
      url: `/api/pilots/m9/local-runs/${blockedRunResponse.json().runId}`,
    });

    await server.close();
    await store.close();

    expect(missingTokenResponse.statusCode).toBe(401);
    expect(maliciousOriginResponse.statusCode).toBe(403);
    expect(untrustedBodyResponse.statusCode).toBe(400);
    expect(blockedRunResponse.statusCode).toBe(200);
    expect(blockedRunResponse.json()).toMatchObject({
      status: 'blocked',
      processBoundaryInvoked: false,
      externalProcessStarted: false,
      rawPathStored: false,
      bodyStored: false,
    });
    expect(blockedRunResponse.json().readinessBlockers).toContain(
      'worktree_approval_artifact_id_required',
    );
    expect(listResponse.json().count).toBe(1);
    expect(showResponse.json().runId).toBe(blockedRunResponse.json().runId);
    expect(blockedRunResponse.body).not.toContain(repoRoot);
    expect(blockedRunResponse.body).not.toContain(worktreeRoot);
    expect(blockedRunResponse.body).not.toContain('package.json');
    expect(blockedRunResponse.body).not.toContain('expectedContentHash');
  });

  it('exposes M11 narrow-path pilot runs through local-control gated metadata routes', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'codexhub-supervisor-m11-pilot-'));
    const repoRoot = join(dir, 'repo');
    const worktreeRoot = join(dir, 'CodexHub-worktrees');
    const worktreeSlug = 'pilot-m11';
    const branchName = 'codex/pilot-m11';
    const baseRef = 'HEAD';
    mkdirSync(repoRoot, { recursive: true });
    mkdirSync(worktreeRoot, { recursive: true });
    writeFileSync(join(repoRoot, 'package.json'), '{"name":"fixture"}');
    const store = await createSqliteStore({ dbPath: join(dir, 'codexhub.sqlite') });
    const server = buildSupervisorServer({ store, m11ProductionPilotEnabled: true });
    const dryRunResponse = await server.inject({
      method: 'POST',
      url: '/api/worktrees/dry-runs',
      headers: localControlHeaders,
      payload: {
        repoRoot,
        worktreeSlug,
        branchName,
        baseRef,
        worktreeRoot,
        runnerMode: 'controlled-git-worktree',
      },
    });
    const dryRunId = dryRunResponse.json().dryRunId as string;
    const missingTokenResponse = await server.inject({
      method: 'POST',
      url: '/api/pilots/m11/local-runs',
      payload: { worktreeDryRunId: dryRunId },
    });
    const maliciousOriginResponse = await server.inject({
      method: 'POST',
      url: '/api/pilots/m11/local-runs',
      headers: { ...localControlHeaders, origin: 'https://evil.example' },
      payload: { worktreeDryRunId: dryRunId },
    });
    const untrustedBodyResponse = await server.inject({
      method: 'POST',
      url: '/api/pilots/m11/local-runs',
      headers: localControlHeaders,
      payload: { worktreeDryRunId: dryRunId, executionAuthority: null },
    });
    const blockedRunResponse = await server.inject({
      method: 'POST',
      url: '/api/pilots/m11/local-runs',
      headers: localControlHeaders,
      payload: {
        title: 'M11 pilot blocked fixture',
        description: 'Missing approval artifacts should block before boundaries.',
        worktreeDryRunId: dryRunId,
        repoRoot,
        worktreeRoot,
        worktreePath: join(worktreeRoot, worktreeSlug),
        worktreeSlug,
        branchName,
        baseRef,
        codexDryRunId: 'codex_dry_run_1',
        governedInput: {
          relativePath: 'package.json',
          expectedContentHash: 'sha256:governed-input',
        },
      },
    });
    const listResponse = await server.inject({ method: 'GET', url: '/api/pilots/m11/local-runs' });
    const showResponse = await server.inject({
      method: 'GET',
      url: `/api/pilots/m11/local-runs/${blockedRunResponse.json().runId}`,
    });

    await server.close();
    await store.close();

    expect(missingTokenResponse.statusCode).toBe(401);
    expect(maliciousOriginResponse.statusCode).toBe(403);
    expect(untrustedBodyResponse.statusCode).toBe(400);
    expect(blockedRunResponse.statusCode).toBe(200);
    expect(blockedRunResponse.json()).toMatchObject({
      status: 'blocked',
      failureClassification: 'approval_blocked',
      prDraftStatus: 'blocked',
      changedFileCount: 0,
      codexReadOnlyDryRunOnly: true,
      patchGenerationAllowed: false,
      pushAllowed: false,
      pullRequestOpened: false,
      processBoundaryInvoked: false,
      externalProcessStarted: false,
      rawPathStored: false,
      bodyStored: false,
      recovery: {
        recoveryAction: 'request_worktree_approval',
        cleanupRequired: false,
        cleanupApprovalStatus: 'not_requested',
        processBoundaryInvoked: false,
        externalProcessStarted: false,
        rawPathStored: false,
        bodyStored: false,
      },
    });
    expect(blockedRunResponse.json().readinessBlockers).toContain(
      'worktree_approval_artifact_id_required',
    );
    expect(listResponse.json().count).toBe(1);
    expect(showResponse.json().runId).toBe(blockedRunResponse.json().runId);
    expect(blockedRunResponse.body).not.toContain(repoRoot);
    expect(blockedRunResponse.body).not.toContain(worktreeRoot);
    expect(blockedRunResponse.body).not.toContain('package.json');
    expect(blockedRunResponse.body).not.toContain('expectedContentHash');
  });

  it('governs worktree cleanup dry-run, approval, and injected controlled git cleanup', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'codexhub-supervisor-worktree-cleanup-'));
    const repoRoot = join(dir, 'repo');
    const worktreeRoot = join(dir, 'CodexHub-worktrees');
    const worktreeSlug = 'feature-m6c-cleanup';
    const branchName = 'codex/feature-m6c-cleanup';
    const baseRef = 'HEAD';
    mkdirSync(repoRoot, { recursive: true });
    const store = await createSqliteStore({ dbPath: join(dir, 'codexhub.sqlite') });
    const server = buildSupervisorServer({
      store,
      worktreeManagerEnabled: true,
      worktreeCleanupEnabled: true,
      worktreeManagerRunner: {
        async run() {
          return {
            status: 'completed',
            changedFiles: ['packages/worktree-manager/src/cleanup.ts'],
            diffHash: 'sha256:diff',
            diffLineCount: 3,
            commandSummaryHash: 'sha256:command',
            gitProcessBoundaryInvoked: true,
            processBoundaryInvoked: true,
            externalProcessStarted: true,
            noRealWrite: false,
            cleanupRequired: true,
            cleanupDeferred: true,
            summary: 'Injected controlled git run completed.',
          };
        },
      },
      worktreeCleanupRunner: {
        async run() {
          return {
            status: 'completed',
            commandSummaryHash: 'sha256:cleanup-command',
            dirtyFileCount: 0,
            cleanupAttempted: true,
            cleanupCompleted: true,
            cleanupRequired: false,
            cleanupDeferred: false,
            gitProcessBoundaryInvoked: true,
            processBoundaryInvoked: true,
            externalProcessStarted: true,
            noRealWrite: false,
            summary: 'Injected controlled git cleanup completed.',
          };
        },
      },
    });

    const worktreePath = join(worktreeRoot, worktreeSlug);
    const dryRunResponse = await server.inject({
      method: 'POST',
      url: '/api/worktrees/dry-runs',
      headers: localControlHeaders,
      payload: {
        repoRoot,
        worktreeSlug,
        branchName,
        baseRef,
        runnerMode: 'controlled-git-worktree',
      },
    });
    const dryRunId = dryRunResponse.json().dryRunId as string;
    const approvalRequestResponse = await server.inject({
      method: 'POST',
      url: '/api/worktrees/approval-requests',
      headers: localControlHeaders,
      payload: { dryRunId, reason: 'hash-bound worktree approval' },
    });
    const approvalResponse = await server.inject({
      method: 'POST',
      url: '/api/worktrees/manual-approvals',
      headers: localControlHeaders,
      payload: {
        dryRunId,
        approvalRequestId: approvalRequestResponse.json().approvalRequestId,
        outcome: 'approved',
      },
    });
    const createRunResponse = await server.inject({
      method: 'POST',
      url: '/api/worktrees/runs',
      headers: localControlHeaders,
      payload: {
        dryRunId,
        approvalArtifactId: approvalResponse.json().approvalArtifactId,
        repoRoot,
        worktreeRoot,
        worktreePath,
        worktreeSlug,
        branchName,
        baseRef,
      },
    });
    const cleanupDryRunResponse = await server.inject({
      method: 'POST',
      url: '/api/worktrees/cleanup/dry-runs',
      headers: localControlHeaders,
      payload: {
        sourceRunId: createRunResponse.json().runId,
        repoRoot,
        worktreeRoot,
        worktreePath,
      },
    });
    const cleanupDryRunId = cleanupDryRunResponse.json().dryRunId as string;
    const cleanupApprovalRequestResponse = await server.inject({
      method: 'POST',
      url: '/api/worktrees/cleanup/approval-requests',
      headers: localControlHeaders,
      payload: { dryRunId: cleanupDryRunId, reason: 'non-force cleanup approval' },
    });
    const cleanupApprovalResponse = await server.inject({
      method: 'POST',
      url: '/api/worktrees/cleanup/manual-approvals',
      headers: localControlHeaders,
      payload: {
        dryRunId: cleanupDryRunId,
        approvalRequestId: cleanupApprovalRequestResponse.json().approvalRequestId,
        outcome: 'approved',
      },
    });
    const untrustedCleanupRunResponse = await server.inject({
      method: 'POST',
      url: '/api/worktrees/cleanup/runs',
      headers: localControlHeaders,
      payload: {
        dryRunId: cleanupDryRunId,
        approvalArtifact: cleanupApprovalResponse.json(),
      },
    });
    const cleanupRunResponse = await server.inject({
      method: 'POST',
      url: '/api/worktrees/cleanup/runs',
      headers: localControlHeaders,
      payload: {
        dryRunId: cleanupDryRunId,
        approvalArtifactId: cleanupApprovalResponse.json().approvalArtifactId,
        repoRoot,
        worktreeRoot,
        worktreePath,
      },
    });
    const cleanupApprovalsResponse = await server.inject({
      method: 'GET',
      url: `/api/worktrees/cleanup/approvals?dryRunId=${cleanupDryRunId}&status=used`,
    });
    const cleanupRunsResponse = await server.inject({
      method: 'GET',
      url: '/api/worktrees/cleanup/runs',
    });

    await server.close();
    await store.close();

    expect(cleanupDryRunResponse.statusCode).toBe(200);
    expect(cleanupDryRunResponse.json()).toMatchObject({
      status: 'ready',
      cleanupRequired: true,
      gitProcessBoundaryInvoked: false,
    });
    expect(untrustedCleanupRunResponse.statusCode).toBe(400);
    expect(cleanupRunResponse.statusCode).toBe(200);
    expect(cleanupRunResponse.json()).toMatchObject({
      status: 'completed',
      cleanupAttempted: true,
      cleanupCompleted: true,
      cleanupRequired: false,
      cleanupDeferred: false,
      gitProcessBoundaryInvoked: true,
      processBoundaryInvoked: true,
      externalProcessStarted: true,
      noRealWrite: false,
    });
    expect(cleanupApprovalsResponse.json().records).toHaveLength(1);
    expect(cleanupRunsResponse.json().records).toHaveLength(1);
    expect(JSON.stringify(cleanupRunResponse.json())).not.toContain(repoRoot);
    expect(JSON.stringify(cleanupRunResponse.json())).not.toContain(worktreePath);
    expect(JSON.stringify(cleanupRunResponse.json())).not.toContain('git worktree remove');
  });

  it('blocks electron cdp execution when store or enablement is unavailable', async () => {
    const disabledStoreServer = buildSupervisorServer({ disableStore: true });
    const disabledStoreResponse = await disabledStoreServer.inject({
      method: 'POST',
      headers: localControlHeaders,
      url: '/api/electron-cdp/observation/dry-runs',
      payload: {},
    });
    const dir = mkdtempSync(join(tmpdir(), 'codexhub-supervisor-electron-disabled-'));
    const store = await createSqliteStore({ dbPath: join(dir, 'codexhub.sqlite') });
    const server = buildSupervisorServer({ store });
    const dryRunResponse = await server.inject({
      method: 'POST',
      headers: localControlHeaders,
      url: '/api/electron-cdp/observation/dry-runs',
      payload: {
        runnerMode: 'controlled-local-http',
        host: 'localhost',
        port: 9222,
      },
    });
    const approvalRequestResponse = await server.inject({
      method: 'POST',
      headers: localControlHeaders,
      url: '/api/electron-cdp/observation/approval-requests',
      payload: {
        dryRunId: dryRunResponse.json().dryRunId,
      },
    });
    const approvalResponse = await server.inject({
      method: 'POST',
      headers: localControlHeaders,
      url: '/api/electron-cdp/observation/manual-approvals',
      payload: {
        dryRunId: dryRunResponse.json().dryRunId,
        approvalRequestId: approvalRequestResponse.json().approvalRequestId,
        outcome: 'approved',
      },
    });
    const blockedRunResponse = await server.inject({
      method: 'POST',
      headers: localControlHeaders,
      url: '/api/electron-cdp/observation/runs',
      payload: {
        dryRunId: dryRunResponse.json().dryRunId,
        approvalArtifactId: approvalResponse.json().approvalArtifactId,
        host: 'localhost',
        port: 9222,
      },
    });

    await disabledStoreServer.close();
    await server.close();
    await store.close();

    expect(disabledStoreResponse.statusCode).toBe(503);
    expect(disabledStoreResponse.json()).toMatchObject({
      status: 'blocked',
      cdpHttpBoundaryInvoked: false,
      processBoundaryInvoked: false,
      externalProcessStarted: false,
    });
    expect(blockedRunResponse.statusCode).toBe(200);
    expect(blockedRunResponse.json()).toMatchObject({
      status: 'blocked',
      cdpHttpBoundaryInvoked: false,
      processBoundaryInvoked: false,
      externalProcessStarted: false,
      noRealWrite: true,
    });
  });

  it('blocks symlink cwd escapes when creating codex dry-runs', async () => {
    const outsideDir = mkdtempSync(join(tmpdir(), 'codexhub-supervisor-cwd-escape-'));
    const workspaceRoot = resolve(process.cwd(), '..', '..');
    const linkDir = join(workspaceRoot, 'tmp');
    const linkPath = join(linkDir, 'supervisor-cwd-escape-link');
    const server = buildSupervisorServer({ localControlKey: localControlToken });

    try {
      mkdirSync(linkDir, { recursive: true });
      rmSync(linkPath, { force: true, recursive: true });
      symlinkSync(outsideDir, linkPath, 'dir');

      const response = await server.inject({
        method: 'POST',
        url: '/api/codex/exec/dry-run',
        headers: localControlHeaders,
        payload: {
          title: 'Blocked cwd symlink escape',
          prompt: 'metadata-only dry-run',
          cwd: 'tmp/supervisor-cwd-escape-link',
        },
      });

      expect(response.statusCode).toBe(400);
      expect(response.json().error).toBe('cwd must resolve within the repository root');
    } finally {
      await server.close();
      rmSync(linkPath, { force: true, recursive: true });
      rmSync(outsideDir, { force: true, recursive: true });
    }
  });

  it('runs and lists mock development orchestrations', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'codexhub-supervisor-'));
    const store = await createSqliteStore({ dbPath: join(dir, 'codexhub.sqlite') });
    const server = buildSupervisorServer({ store });

    const runResponse = await server.inject({
      method: 'POST',
      headers: localControlHeaders,
      url: '/api/development/mock-run',
      payload: {
        title: 'Add Electron CDP read-only observation skeleton',
        description: 'Create interfaces and tests only',
      },
    });
    const listResponse = await server.inject({
      method: 'GET',
      url: '/api/development/mock-runs',
    });

    await server.close();
    await store.close();

    expect(runResponse.statusCode).toBe(200);
    expect(runResponse.json().summary.requestTitle).toBe(
      'Add Electron CDP read-only observation skeleton',
    );
    expect(listResponse.statusCode).toBe(200);
    expect(listResponse.json().runs).toHaveLength(1);
    expect(listResponse.json().persistence.status).toBe('ok');
  });

  it('replays codex fixtures and guards fixture paths', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'codexhub-supervisor-codex-'));
    const store = await createSqliteStore({ dbPath: join(dir, 'codexhub.sqlite') });
    const server = buildSupervisorServer({ store });

    const replayResponse = await server.inject({
      method: 'POST',
      headers: localControlHeaders,
      url: '/api/codex/replay-fixture',
      payload: {
        fixturePath: 'packages/codex-kernel/fixtures/codex-exec-basic.jsonl',
      },
    });
    const listResponse = await server.inject({
      method: 'GET',
      url: '/api/codex/replay-fixtures',
    });
    const rejectedPayloads = [
      '../codex-exec-basic.jsonl',
      join(process.cwd(), 'packages', 'codex-kernel', 'fixtures', 'codex-exec-basic.jsonl'),
      'packages/codex-kernel/fixtures/codex-exec-basic.txt',
      'package.json',
      'packages/codex-kernel/fixtures/missing.jsonl',
    ];
    const rejectedResponses = await Promise.all(
      rejectedPayloads.map((fixturePath) =>
        server.inject({
          method: 'POST',
          headers: localControlHeaders,
          url: '/api/codex/replay-fixture',
          payload: { fixturePath },
        }),
      ),
    );

    await server.close();
    await store.close();

    expect(replayResponse.statusCode).toBe(200);
    expect(replayResponse.json()).toMatchObject({
      threadId: 'thread_fixture_basic',
      status: 'completed',
      liveExecution: false,
      degraded: false,
    });
    expect(listResponse.statusCode).toBe(200);
    expect(listResponse.json().runs).toHaveLength(1);
    expect(listResponse.json().degraded).toBe(false);
    expect(listResponse.json().runs[0]).toMatchObject({
      fixturePath: 'packages/codex-kernel/fixtures/codex-exec-basic.jsonl',
      status: 'completed',
    });
    expect(rejectedResponses.map((response) => response.statusCode)).toEqual([
      400, 400, 400, 400, 404,
    ]);
    expect(rejectedResponses.every((response) => !response.body.includes(process.cwd()))).toBe(
      true,
    );
  });

  it('creates and lists disabled codex dry-run control-plane records', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'codexhub-supervisor-codex-dry-run-'));
    const store = await createSqliteStore({ dbPath: join(dir, 'codexhub.sqlite') });
    const server = buildSupervisorServer({ store });

    const dryRunResponse = await server.inject({
      method: 'POST',
      headers: localControlHeaders,
      url: '/api/codex/exec/dry-run',
      payload: {
        title: 'Summarize repository structure',
        prompt: 'Summarize the repository structure and list risk areas',
        cwd: '.',
        sandboxMode: 'read_only',
        approvalMode: 'required',
      },
    });
    const listResponse = await server.inject({
      method: 'GET',
      url: '/api/codex/exec/dry-runs',
    });
    const dryRunId = dryRunResponse.json().liveRunRecord.id as string;
    const preflightResponse = await server.inject({
      method: 'POST',
      headers: localControlHeaders,
      url: '/api/codex/exec/preflight',
      payload: { dryRunId },
    });
    const configResponse = await server.inject({
      method: 'GET',
      url: '/api/codex/exec/config',
    });
    const approvalRequestResponse = await server.inject({
      method: 'POST',
      headers: localControlHeaders,
      url: '/api/codex/exec/approval-request',
      payload: {
        dryRunId,
        reason: 'manual private reason',
      },
    });
    const legacyApprovalArtifactResponse = await server.inject({
      method: 'POST',
      headers: localControlHeaders,
      url: '/api/codex/exec/approval-artifact',
      payload: { dryRunId },
    });
    const manualApprovalResponse = await server.inject({
      method: 'POST',
      headers: localControlHeaders,
      url: '/api/codex/exec/manual-approval',
      payload: {
        dryRunId,
        approvalRequestId: approvalRequestResponse.json().approvalRequest.id,
        outcome: 'approved',
        reason: 'manual private reason',
      },
    });
    const duplicateApprovalResponse = await server.inject({
      method: 'POST',
      headers: localControlHeaders,
      url: '/api/codex/exec/manual-approval',
      payload: {
        dryRunId,
        approvalRequestId: approvalRequestResponse.json().approvalRequest.id,
        outcome: 'approved',
        reason: 'manual private reason',
      },
    });
    const approvalListResponse = await server.inject({
      method: 'GET',
      url: '/api/codex/exec/approvals',
    });
    const forgedGateResponse = await server.inject({
      method: 'POST',
      headers: localControlHeaders,
      url: '/api/codex/exec/evaluate-gate',
      payload: {
        dryRunId,
        approvalArtifact: manualApprovalResponse.json().approvalArtifact,
      },
    });
    const gateResponse = await server.inject({
      method: 'POST',
      headers: localControlHeaders,
      url: '/api/codex/exec/evaluate-gate',
      payload: {
        dryRunId,
        approvalArtifactId: manualApprovalResponse.json().approvalArtifact.id,
      },
    });
    const timelineResponse = await server.inject({
      method: 'GET',
      url: `/api/codex/exec/timeline/${dryRunId}`,
    });
    const filteredTimelineResponse = await server.inject({
      method: 'GET',
      url: `/api/codex/exec/timeline/${dryRunId}?source=approval&includeEvidence=false&includeAudit=false`,
    });
    const detailResponse = await server.inject({
      method: 'GET',
      url: `/api/codex/exec/timeline/${dryRunId}/detail?includeEvidence=true&includeAudit=true`,
    });
    const evidenceListResponse = await server.inject({
      method: 'GET',
      url: `/api/codex/exec/evidence?dryRunId=${dryRunId}&kind=codex.exec.dry_run_plan&limit=10`,
    });
    const evidenceId = evidenceListResponse.json().result.items[0].evidenceRefId as string;
    const evidenceDetailResponse = await server.inject({
      method: 'GET',
      url: `/api/codex/exec/evidence/${evidenceId}`,
    });
    const missingEvidenceResponse = await server.inject({
      method: 'GET',
      url: '/api/codex/exec/evidence/missing_evidence',
    });
    const auditListResponse = await server.inject({
      method: 'GET',
      url: `/api/codex/exec/audit?dryRunId=${dryRunId}&action=codex.exec.policy_evaluated&limit=10`,
    });
    const auditEventId = auditListResponse.json().result.items[0].auditEventId as string;
    const auditDetailResponse = await server.inject({
      method: 'GET',
      url: `/api/codex/exec/audit/${auditEventId}`,
    });
    const missingAuditResponse = await server.inject({
      method: 'GET',
      url: '/api/codex/exec/audit/missing_audit',
    });
    const drilldownResponse = await server.inject({
      method: 'GET',
      url: `/api/codex/exec/drilldown/${dryRunId}`,
    });
    const reportJsonResponse = await server.inject({
      method: 'GET',
      url: `/api/codex/exec/report/${dryRunId}?format=json&includeEvidence=true&includeAudit=true`,
    });
    const reportMarkdownResponse = await server.inject({
      method: 'GET',
      url: `/api/codex/exec/report/${dryRunId}?format=markdown&includeEvidence=false&includeAudit=false`,
    });
    const missingReportResponse = await server.inject({
      method: 'GET',
      url: '/api/codex/exec/report/missing_dry_run?format=markdown',
    });
    const invalidReportResponse = await server.inject({
      method: 'GET',
      url: `/api/codex/exec/report/${dryRunId}?format=txt`,
    });
    const reportReviewResponse = await server.inject({
      method: 'POST',
      headers: localControlHeaders,
      url: '/api/codex/exec/report-review',
      payload: {
        dryRunId,
        reviewerLabel: 'local-operator',
        status: 'reviewed',
        recommendation: 'ready_for_adr',
        notesSummary: 'No-live boundary intact; live adapter still requires ADR.',
      },
    });
    const canonicalDryRunPlanId = dryRunResponse.json().liveRunRecord.dryRunPlanId as string;
    const reportReviewId = reportReviewResponse.json().reviewRecord.id as string;
    const reportReviewSecondResponse = await server.inject({
      method: 'POST',
      headers: localControlHeaders,
      url: '/api/codex/exec/report-review',
      payload: {
        dryRunId,
        reviewerLabel: 'second-reviewer',
        status: 'changes_requested',
        recommendation: 'needs_changes',
        notesSummary: 'Metadata-only follow-up review requested changes.',
      },
    });
    const reportReviewSecondId = reportReviewSecondResponse.json().reviewRecord.id as string;
    const reportReviewGetResponse = await server.inject({
      method: 'GET',
      url: `/api/codex/exec/report-review/${reportReviewId}`,
    });
    const reportReviewListResponse = await server.inject({
      method: 'GET',
      url: `/api/codex/exec/report-reviews?dryRunId=${canonicalDryRunPlanId}&status=reviewed&recommendation=ready_for_adr&limit=10`,
    });
    const reportReviewLatestResponse = await server.inject({
      method: 'GET',
      url: `/api/codex/exec/report-reviews/latest/${canonicalDryRunPlanId}`,
    });
    const reportReviewHistoryResponse = await server.inject({
      method: 'GET',
      url: `/api/codex/exec/report-reviews/history?dryRunId=${canonicalDryRunPlanId}&limit=10`,
    });
    const reportReviewCompareResponse = await server.inject({
      method: 'GET',
      url: `/api/codex/exec/report-reviews/compare?leftReviewId=${reportReviewId}&rightReviewId=${reportReviewSecondId}`,
    });
    const reportReviewHandoffResponse = await server.inject({
      method: 'GET',
      url: `/api/codex/exec/report-reviews/handoff/${canonicalDryRunPlanId}?fromReviewer=local-operator&toReviewer=second-reviewer`,
    });
    const governancePackageResponse = await server.inject({
      method: 'GET',
      url: `/api/codex/exec/governance-package/${canonicalDryRunPlanId}?includeEvidence=true&includeAudit=false`,
    });
    const missingGovernancePackageResponse = await server.inject({
      method: 'GET',
      url: '/api/codex/exec/governance-package/missing_dry_run',
    });
    const adrDraftJsonResponse = await server.inject({
      method: 'GET',
      url: `/api/codex/exec/adr-draft/${canonicalDryRunPlanId}?format=json&includeEvidence=true&includeAudit=false`,
    });
    const adrDraftMarkdownResponse = await server.inject({
      method: 'GET',
      url: `/api/codex/exec/adr-draft/${canonicalDryRunPlanId}?format=markdown&includeEvidence=false&includeAudit=false`,
    });
    const missingAdrDraftResponse = await server.inject({
      method: 'GET',
      url: '/api/codex/exec/adr-draft/missing_dry_run?format=markdown',
    });
    const adrDecisionCreateResponse = await server.inject({
      method: 'POST',
      headers: localControlHeaders,
      url: '/api/codex/exec/live-adapter-adr-decision',
      payload: {
        dryRunId: canonicalDryRunPlanId,
        reviewerLabel: 'local-operator',
        rationaleSummary:
          'Conditional read-only design is allowed; implementation remains unapproved.',
      },
    });
    const adrDecisionId = adrDecisionCreateResponse.json().decisionRecord.id as string;
    const adrDecisionGetResponse = await server.inject({
      method: 'GET',
      url: `/api/codex/exec/live-adapter-adr-decision/${adrDecisionId}`,
    });
    const adrDecisionListResponse = await server.inject({
      method: 'GET',
      url: `/api/codex/exec/live-adapter-adr-decisions?dryRunId=${canonicalDryRunPlanId}&status=recorded&decision=conditional_read_only_go&limit=10`,
    });
    const adrDecisionLatestResponse = await server.inject({
      method: 'GET',
      url: `/api/codex/exec/live-adapter-adr-decision/latest/${canonicalDryRunPlanId}`,
    });
    const missingAdrDecisionResponse = await server.inject({
      method: 'GET',
      url: '/api/codex/exec/live-adapter-adr-decision/missing_decision',
    });
    const missingAdrDecisionLatestResponse = await server.inject({
      method: 'GET',
      url: '/api/codex/exec/live-adapter-adr-decision/latest/missing_dry_run',
    });
    const invalidAdrDecisionQueryResponse = await server.inject({
      method: 'GET',
      url: `/api/codex/exec/live-adapter-adr-decisions?dryRunId=${canonicalDryRunPlanId}&decision=execute_now`,
    });
    const readOnlyPreflightSimulationResponse = await server.inject({
      method: 'POST',
      headers: localControlHeaders,
      url: '/api/codex/exec/read-only-adapter/preflight-simulate',
      payload: {
        dryRunId: canonicalDryRunPlanId,
        isolatedWorktreePresent: true,
        evidenceStoreReady: true,
        auditStoreReady: true,
        checklistComplete: true,
      },
    });
    const blockedReadOnlyPreflightSimulationResponse = await server.inject({
      method: 'POST',
      headers: localControlHeaders,
      url: '/api/codex/exec/read-only-adapter/preflight-simulate',
      payload: {
        dryRunId: canonicalDryRunPlanId,
        requestedSandboxMode: 'workspace_write',
        workspaceWriteRequested: true,
        isolatedWorktreePresent: true,
        evidenceStoreReady: true,
        auditStoreReady: true,
        checklistComplete: true,
      },
    });
    const readOnlyPreflightSimulationListResponse = await server.inject({
      method: 'GET',
      url: '/api/codex/exec/read-only-adapter/preflight-simulations?limit=10',
    });
    const readOnlySimulatorReviewCreateResponse = await server.inject({
      method: 'POST',
      headers: localControlHeaders,
      url: '/api/codex/exec/read-only-adapter/simulator-review',
      payload: {
        dryRunId: canonicalDryRunPlanId,
        reviewerLabel: 'local-operator',
        outcome: 'go_to_implementation_planning',
        rationaleSummary:
          'Simulator review allows Round 3R planning only; implementation remains unapproved.',
      },
    });
    const readOnlySimulatorReviewId = readOnlySimulatorReviewCreateResponse.json().reviewRecord
      .id as string;
    const readOnlySimulatorReviewGetResponse = await server.inject({
      method: 'GET',
      url: `/api/codex/exec/read-only-adapter/simulator-review/${readOnlySimulatorReviewId}`,
    });
    const readOnlySimulatorReviewListResponse = await server.inject({
      method: 'GET',
      url: `/api/codex/exec/read-only-adapter/simulator-reviews?dryRunId=${canonicalDryRunPlanId}&status=recorded&outcome=go_to_implementation_planning&limit=10`,
    });
    const readOnlySimulatorReviewLatestResponse = await server.inject({
      method: 'GET',
      url: `/api/codex/exec/read-only-adapter/simulator-review/latest/${canonicalDryRunPlanId}`,
    });
    const implementationPlanReviewCreateResponse = await server.inject({
      method: 'POST',
      headers: localControlHeaders,
      url: '/api/codex/exec/read-only-adapter/implementation-plan-review',
      payload: {
        outcome: 'conditional_go_to_disabled_skeleton',
        reviewerLabel: 'local-operator',
        rationaleSummary:
          'Allows only Round 3T disabled-by-default skeleton; execution remains unapproved.',
      },
    });
    const implementationPlanReviewId = implementationPlanReviewCreateResponse.json().reviewRecord
      .id as string;
    const implementationPlanReviewGetResponse = await server.inject({
      method: 'GET',
      url: `/api/codex/exec/read-only-adapter/implementation-plan-review/${implementationPlanReviewId}`,
    });
    const implementationPlanReviewListResponse = await server.inject({
      method: 'GET',
      url: '/api/codex/exec/read-only-adapter/implementation-plan-reviews?status=recorded&outcome=conditional_go_to_disabled_skeleton&limit=10',
    });
    const implementationPlanReviewLatestResponse = await server.inject({
      method: 'GET',
      url: '/api/codex/exec/read-only-adapter/implementation-plan-review/latest',
    });
    const implementationPlanReviewMissingResponse = await server.inject({
      method: 'GET',
      url: '/api/codex/exec/read-only-adapter/implementation-plan-review/missing_review',
    });
    const implementationPlanReviewInvalidOutcomeResponse = await server.inject({
      method: 'POST',
      headers: localControlHeaders,
      url: '/api/codex/exec/read-only-adapter/implementation-plan-review',
      payload: {
        outcome: 'execute_now',
      },
    });
    const implementationPlanReviewMissingOutcomeResponse = await server.inject({
      method: 'POST',
      headers: localControlHeaders,
      url: '/api/codex/exec/read-only-adapter/implementation-plan-review',
      payload: {},
    });
    const missingReadOnlySimulatorReviewGetResponse = await server.inject({
      method: 'GET',
      url: '/api/codex/exec/read-only-adapter/simulator-review/missing_review',
    });
    const invalidReadOnlySimulatorReviewQueryResponse = await server.inject({
      method: 'GET',
      url: `/api/codex/exec/read-only-adapter/simulator-reviews?dryRunId=${canonicalDryRunPlanId}&outcome=execute_now`,
    });
    const readOnlySimulatorReviewMissingIdResponse = await server.inject({
      method: 'POST',
      headers: localControlHeaders,
      url: '/api/codex/exec/read-only-adapter/simulator-review',
      payload: {},
    });
    const dryRunWithoutSimulationResponse = await server.inject({
      method: 'POST',
      headers: localControlHeaders,
      url: '/api/codex/exec/dry-run',
      payload: {
        title: 'Dry-run without simulator result',
        prompt: 'Summarize repository structure only',
        cwd: '.',
        sandboxMode: 'read_only',
        approvalMode: 'required',
      },
    });
    const missingReadOnlySimulatorReviewSimulationResponse = await server.inject({
      method: 'POST',
      headers: localControlHeaders,
      url: '/api/codex/exec/read-only-adapter/simulator-review',
      payload: {
        dryRunId: dryRunWithoutSimulationResponse.json().liveRunRecord.dryRunPlanId,
      },
    });
    const missingReadOnlyPreflightSimulationDryRunResponse = await server.inject({
      method: 'POST',
      headers: localControlHeaders,
      url: '/api/codex/exec/read-only-adapter/preflight-simulate',
      payload: { dryRunId: 'missing_dry_run' },
    });
    const missingReadOnlyPreflightSimulationIdResponse = await server.inject({
      method: 'POST',
      headers: localControlHeaders,
      url: '/api/codex/exec/read-only-adapter/preflight-simulate',
      payload: {},
    });
    const missingReportReviewResponse = await server.inject({
      method: 'GET',
      url: '/api/codex/exec/report-review/missing_review',
    });
    const missingReportReviewLatestResponse = await server.inject({
      method: 'GET',
      url: '/api/codex/exec/report-reviews/latest/missing_dry_run',
    });
    const invalidReportReviewHistoryResponse = await server.inject({
      method: 'GET',
      url: `/api/codex/exec/report-reviews/history?dryRunId=${canonicalDryRunPlanId}&status=unsupported`,
    });
    const invalidTimelineResponse = await server.inject({
      method: 'GET',
      url: `/api/codex/exec/timeline/${dryRunId}?source=unsupported`,
    });
    const rejectedCwdResponse = await server.inject({
      method: 'POST',
      headers: localControlHeaders,
      url: '/api/codex/exec/dry-run',
      payload: {
        title: 'Bad cwd',
        prompt: 'Summarize safely',
        cwd: '..',
      },
    });

    await server.close();
    await store.close();

    expect(dryRunResponse.statusCode).toBe(200);
    expect(dryRunResponse.json()).toMatchObject({
      liveExecution: false,
      externalProcessStarted: false,
      executionDisabled: true,
      degraded: false,
      dryRunPlan: {
        riskLevel: 'medium',
        promptBodyStored: false,
      },
      policyDecision: {
        outcome: 'approval_required',
      },
      liveRunRecord: {
        status: 'awaiting_approval',
        promptBodyStored: false,
      },
    });
    expect(JSON.stringify(dryRunResponse.json())).not.toContain('list risk areas');
    expect(listResponse.statusCode).toBe(200);
    expect(listResponse.json().runs).toHaveLength(1);
    expect(listResponse.json().runs[0]).toMatchObject({
      title: 'Summarize repository structure',
      liveExecution: false,
      externalProcessStarted: false,
      executionDisabled: true,
    });
    expect(listResponse.json().liveConfig).toMatchObject({
      liveEnabled: true,
      allowedSandboxModes: ['read_only'],
    });
    expect(preflightResponse.statusCode).toBe(200);
    expect(preflightResponse.json()).toMatchObject({
      preflightResult: {
        status: 'passed',
        liveExecution: false,
        externalProcessStarted: false,
        executionDisabled: true,
      },
    });
    expect(configResponse.statusCode).toBe(200);
    expect(configResponse.json()).toMatchObject({
      configLoadResult: {
        status: 'loaded',
        config: {
          liveEnabled: true,
          configSource: 'file',
          configBodyStored: false,
        },
      },
      liveExecution: false,
      externalProcessStarted: false,
      executionDisabled: true,
    });
    expect(approvalRequestResponse.statusCode).toBe(200);
    expect(approvalRequestResponse.json()).toMatchObject({
      approvalRequest: {
        status: 'pending',
        liveExecution: false,
        externalProcessStarted: false,
        executionDisabled: true,
      },
      approvalState: {
        status: 'pending',
        canDecide: true,
        terminal: false,
      },
      approvalRecord: {
        status: 'pending',
      },
    });
    expect(JSON.stringify(approvalRequestResponse.json())).not.toContain('manual private reason');
    expect(legacyApprovalArtifactResponse.statusCode).toBe(410);
    expect(legacyApprovalArtifactResponse.json()).toMatchObject({
      strategy: 'deprecated-gone',
      liveExecution: false,
      externalProcessStarted: false,
      executionDisabled: true,
    });
    expect(legacyApprovalArtifactResponse.json().approvalArtifact).toBeUndefined();
    expect(manualApprovalResponse.statusCode).toBe(200);
    expect(manualApprovalResponse.json()).toMatchObject({
      approvalDecision: {
        outcome: 'approved',
        approved: true,
      },
      approvalState: {
        status: 'approved',
        canDecide: false,
      },
      approvalTransition: {
        allowed: true,
        fromStatus: 'pending',
        toStatus: 'approved',
      },
      approvalArtifact: {
        status: 'approved',
      },
      liveExecution: false,
      externalProcessStarted: false,
      executionDisabled: true,
    });
    expect(JSON.stringify(manualApprovalResponse.json())).not.toContain('manual private reason');
    expect(duplicateApprovalResponse.statusCode).toBe(409);
    expect(duplicateApprovalResponse.json()).toMatchObject({
      error: 'manual approval transition is blocked',
      approvalTransition: {
        allowed: false,
        fromStatus: 'approved',
      },
      liveExecution: false,
      externalProcessStarted: false,
      executionDisabled: true,
    });
    expect(approvalListResponse.statusCode).toBe(200);
    expect(approvalListResponse.json().approvals).toHaveLength(1);
    expect(approvalListResponse.json().approvals[0]).toMatchObject({
      status: 'approved',
      approvalState: {
        status: 'approved',
        nextAllowedActions: ['revoke'],
      },
    });
    expect(forgedGateResponse.statusCode).toBe(400);
    expect(forgedGateResponse.json()).toMatchObject({
      error: 'untrusted_approval_artifact_body',
      liveExecution: false,
      externalProcessStarted: false,
      executionDisabled: true,
    });
    expect(forgedGateResponse.json().evidenceRefs[0]).toMatchObject({
      kind: 'audit',
      redacted: true,
    });
    expect(gateResponse.statusCode).toBe(200);
    expect(gateResponse.json()).toMatchObject({
      executionGateResult: {
        status: 'ready',
        liveExecution: false,
        externalProcessStarted: false,
        executionDisabled: true,
      },
    });
    expect(gateResponse.json().executionGateResult.reasons).toEqual([]);
    expect(timelineResponse.statusCode).toBe(200);
    expect(timelineResponse.json()).toMatchObject({
      timeline: {
        status: 'gate_ready',
        liveExecution: false,
        externalProcessStarted: false,
        executionDisabled: true,
      },
      liveExecution: false,
      externalProcessStarted: false,
      executionDisabled: true,
    });
    const timelineEvents = timelineResponse
      .json()
      .timeline.events.map((event: { eventType: string }) => event.eventType);
    expect(timelineEvents.indexOf('codex.exec.dry_run.created')).toBeLessThan(
      timelineEvents.indexOf('codex.exec.policy.evaluated'),
    );
    expect(timelineEvents).toContain('codex.exec.approval.state_evaluated');
    expect(timelineEvents).toContain('codex.exec.gate.evaluated');
    expect(
      timelineResponse
        .json()
        .timeline.events.every(
          (event: {
            liveExecution: boolean;
            externalProcessStarted: boolean;
            executionDisabled: boolean;
          }) =>
            event.liveExecution === false &&
            event.externalProcessStarted === false &&
            event.executionDisabled === true,
        ),
    ).toBe(true);
    expect(filteredTimelineResponse.statusCode).toBe(200);
    expect(
      filteredTimelineResponse
        .json()
        .timeline.events.every((event: { sourceKind: string }) =>
          event.sourceKind.startsWith('approval_'),
        ),
    ).toBe(true);
    expect(
      filteredTimelineResponse
        .json()
        .timeline.events.some(
          (event: { sourceKind: string }) =>
            event.sourceKind === 'evidence' || event.sourceKind === 'audit',
        ),
    ).toBe(false);
    expect(detailResponse.statusCode).toBe(200);
    expect(detailResponse.json()).toMatchObject({
      detail: {
        dryRunId: dryRunResponse.json().liveRunRecord.dryRunPlanId,
        latestGateStatus: 'ready',
        approvalStatus: 'approved',
        evidenceSummary: {
          metadataOnly: true,
          bodyStored: false,
        },
        auditSummary: {
          metadataOnly: true,
          bodyStored: false,
        },
        liveExecution: false,
        externalProcessStarted: false,
        executionDisabled: true,
      },
      liveExecution: false,
      externalProcessStarted: false,
      executionDisabled: true,
    });
    expect(JSON.stringify(detailResponse.json())).not.toContain('list risk areas');
    expect(JSON.stringify(detailResponse.json())).not.toContain('manual private reason');
    expect(evidenceListResponse.statusCode).toBe(200);
    expect(evidenceListResponse.json()).toMatchObject({
      result: {
        count: 1,
        items: [
          {
            status: 'found',
            kind: 'codex.exec.dry_run_plan',
            metadataOnly: true,
            bodyStored: false,
          },
        ],
      },
      liveExecution: false,
      externalProcessStarted: false,
      executionDisabled: true,
    });
    expect(evidenceDetailResponse.statusCode).toBe(200);
    expect(evidenceDetailResponse.json()).toMatchObject({
      detail: {
        status: 'found',
        evidenceRefId: evidenceId,
        metadataOnly: true,
        bodyStored: false,
      },
      liveExecution: false,
      externalProcessStarted: false,
      executionDisabled: true,
    });
    expect(JSON.stringify(evidenceDetailResponse.json())).not.toContain('list risk areas');
    expect(missingEvidenceResponse.statusCode).toBe(404);
    expect(missingEvidenceResponse.body).not.toContain(process.cwd());
    expect(auditListResponse.statusCode).toBe(200);
    expect(auditListResponse.json()).toMatchObject({
      result: {
        count: 1,
        items: [
          {
            status: 'found',
            action: 'codex.exec.policy_evaluated',
            metadataOnly: true,
            bodyStored: false,
          },
        ],
      },
      liveExecution: false,
      externalProcessStarted: false,
      executionDisabled: true,
    });
    expect(auditDetailResponse.statusCode).toBe(200);
    expect(auditDetailResponse.json()).toMatchObject({
      detail: {
        status: 'found',
        auditEventId,
        metadataOnly: true,
        bodyStored: false,
      },
      liveExecution: false,
      externalProcessStarted: false,
      executionDisabled: true,
    });
    expect(JSON.stringify(auditDetailResponse.json())).not.toContain('manual private reason');
    expect(missingAuditResponse.statusCode).toBe(404);
    expect(missingAuditResponse.body).not.toContain(process.cwd());
    expect(drilldownResponse.statusCode).toBe(200);
    expect(drilldownResponse.json()).toMatchObject({
      drilldown: {
        status: 'found',
        metadataOnly: true,
        bodyStored: false,
        liveExecution: false,
        externalProcessStarted: false,
        executionDisabled: true,
      },
      liveExecution: false,
      externalProcessStarted: false,
      executionDisabled: true,
    });
    expect(drilldownResponse.json().drilldown.evidenceCount).toBeGreaterThan(0);
    expect(drilldownResponse.json().drilldown.auditEventCount).toBeGreaterThan(0);
    expect(JSON.stringify(drilldownResponse.json())).not.toContain('manual private reason');
    expect(reportJsonResponse.statusCode).toBe(200);
    expect(reportJsonResponse.json()).toMatchObject({
      report: {
        status: 'found',
        summary: {
          evidenceCount: expect.any(Number),
          auditEventCount: expect.any(Number),
        },
        liveExecution: false,
        externalProcessStarted: false,
        executionDisabled: true,
      },
      exportResult: {
        format: 'json',
        liveExecution: false,
        externalProcessStarted: false,
        executionDisabled: true,
      },
    });
    expect(
      reportJsonResponse.json().report.sections.map((section: { kind: string }) => section.kind),
    ).toEqual([
      'overview',
      'dry_run',
      'timeline',
      'approval',
      'gate',
      'evidence',
      'audit',
      'no_live_boundary',
      'risks',
      'recommendations',
    ]);
    expect(JSON.stringify(reportJsonResponse.json())).not.toContain('manual private reason');
    expect(JSON.stringify(reportJsonResponse.json())).not.toContain('list risk areas');
    expect(reportMarkdownResponse.statusCode).toBe(200);
    expect(reportMarkdownResponse.json()).toMatchObject({
      report: {
        status: 'found',
        summary: {
          evidenceCount: 0,
          auditEventCount: 0,
        },
      },
      exportResult: {
        format: 'markdown',
      },
      liveExecution: false,
      externalProcessStarted: false,
      executionDisabled: true,
    });
    expect(reportMarkdownResponse.json().renderedContent).toContain('# Codex Control-plane Report');
    expect(reportMarkdownResponse.json().renderedContent).toContain('liveExecution=false');
    expect(missingReportResponse.statusCode).toBe(404);
    expect(missingReportResponse.body).not.toContain(process.cwd());
    expect(invalidReportResponse.statusCode).toBe(400);
    expect(reportReviewResponse.statusCode).toBe(200);
    expect(reportReviewResponse.json()).toMatchObject({
      reviewRecord: {
        dryRunId: canonicalDryRunPlanId,
        status: 'reviewed',
        recommendation: 'ready_for_adr',
        recommendationGrantsExecution: false,
        metadataOnly: true,
        bodyStored: false,
        liveExecution: false,
        externalProcessStarted: false,
        executionDisabled: true,
      },
      summary: {
        recommendationGrantsExecution: false,
      },
      liveExecution: false,
      externalProcessStarted: false,
      executionDisabled: true,
    });
    expect(JSON.stringify(reportReviewResponse.json())).not.toContain('manual private reason');
    expect(JSON.stringify(reportReviewResponse.json())).not.toContain('list risk areas');
    expect(reportReviewGetResponse.statusCode).toBe(200);
    expect(reportReviewGetResponse.json().reviewRecord.id).toBe(reportReviewId);
    expect(reportReviewListResponse.statusCode).toBe(200);
    expect(reportReviewListResponse.json().reviews).toHaveLength(1);
    expect(reportReviewListResponse.json().summaries[0]).toMatchObject({
      reviewId: reportReviewId,
      recommendationGrantsExecution: false,
    });
    expect(reportReviewSecondResponse.statusCode).toBe(200);
    expect(reportReviewLatestResponse.statusCode).toBe(200);
    expect(reportReviewLatestResponse.json()).toMatchObject({
      reviewRecord: {
        id: reportReviewSecondId,
        dryRunId: canonicalDryRunPlanId,
        recommendationGrantsExecution: false,
        liveExecution: false,
        externalProcessStarted: false,
        executionDisabled: true,
      },
      liveExecution: false,
      externalProcessStarted: false,
      executionDisabled: true,
    });
    expect(reportReviewHistoryResponse.statusCode).toBe(200);
    expect(reportReviewHistoryResponse.json()).toMatchObject({
      history: {
        dryRunId: canonicalDryRunPlanId,
        historyCount: 2,
        recommendationGrantsExecution: false,
        liveExecution: false,
        externalProcessStarted: false,
        executionDisabled: true,
      },
      liveExecution: false,
      externalProcessStarted: false,
      executionDisabled: true,
    });
    expect(reportReviewHistoryResponse.json().history.comparison.changedItemCount).toBeGreaterThan(
      0,
    );
    expect(reportReviewCompareResponse.statusCode).toBe(200);
    expect(reportReviewCompareResponse.json()).toMatchObject({
      comparison: {
        leftReviewId: reportReviewId,
        rightReviewId: reportReviewSecondId,
        comparable: true,
        recommendationGrantsExecution: false,
        liveExecution: false,
        externalProcessStarted: false,
        executionDisabled: true,
      },
      liveExecution: false,
      externalProcessStarted: false,
      executionDisabled: true,
    });
    expect(reportReviewCompareResponse.json().comparison.changedItemCount).toBeGreaterThan(0);
    expect(JSON.stringify(reportReviewCompareResponse.json())).not.toContain('list risk areas');
    expect(reportReviewHandoffResponse.statusCode).toBe(200);
    expect(reportReviewHandoffResponse.json()).toMatchObject({
      handoff: {
        dryRunId: canonicalDryRunPlanId,
        fromReviewer: 'local-operator',
        toReviewer: 'second-reviewer',
        recommendationGrantsExecution: false,
        liveExecution: false,
        externalProcessStarted: false,
        executionDisabled: true,
      },
      liveExecution: false,
      externalProcessStarted: false,
      executionDisabled: true,
    });
    expect(reportReviewHandoffResponse.json().handoff.handoffSummary).toContain(
      'does not grant execution',
    );
    expect(governancePackageResponse.statusCode).toBe(200);
    expect(governancePackageResponse.json()).toMatchObject({
      governancePackage: {
        dryRunId: canonicalDryRunPlanId,
        recommendationGrantsExecution: false,
        liveExecution: false,
        externalProcessStarted: false,
        executionDisabled: true,
        query: {
          includeEvidence: true,
          includeAudit: false,
        },
        noLiveEvidence: {
          noRealCodexExec: true,
          noExternalProcessStarted: true,
          noBrowserOrCdpAction: true,
          noWorkspaceWrite: true,
          noExecutionApprovalGranted: true,
        },
        summary: {
          recommendationGrantsExecution: false,
        },
      },
      recommendationGrantsExecution: false,
      liveExecution: false,
      externalProcessStarted: false,
      executionDisabled: true,
    });
    expect(
      governancePackageResponse
        .json()
        .governancePackage.adrReadinessChecklist.map((item: { code: string }) => item.code),
    ).toContain('live_adapter_requires_separate_adr');
    expect(JSON.stringify(governancePackageResponse.json())).not.toContain('list risk areas');
    expect(missingGovernancePackageResponse.statusCode).toBe(404);
    expect(missingGovernancePackageResponse.json()).toMatchObject({
      governancePackage: {
        status: 'not_found',
        recommendation: 'no_go',
        recommendationGrantsExecution: false,
      },
      liveExecution: false,
      externalProcessStarted: false,
      executionDisabled: true,
    });
    expect(missingGovernancePackageResponse.body).not.toContain(process.cwd());
    expect(adrDraftJsonResponse.statusCode).toBe(200);
    expect(adrDraftJsonResponse.json()).toMatchObject({
      adrDraft: {
        dryRunId: canonicalDryRunPlanId,
        format: 'json',
        recommendationGrantsExecution: false,
        metadataOnly: true,
        bodyStored: false,
        draftOnly: true,
        liveExecution: false,
        externalProcessStarted: false,
        executionDisabled: true,
        query: {
          includeEvidence: true,
          includeAudit: false,
        },
      },
      exportResult: {
        format: 'json',
        recommendationGrantsExecution: false,
        draftOnly: true,
        liveExecution: false,
        externalProcessStarted: false,
        executionDisabled: true,
      },
      liveExecution: false,
      externalProcessStarted: false,
      executionDisabled: true,
    });
    expect(
      adrDraftJsonResponse
        .json()
        .adrDraft.sections.map((section: { kind: string }) => section.kind),
    ).toEqual([
      'title',
      'status',
      'context',
      'governance_summary',
      'no_live_boundary',
      'adr_readiness',
      'risk_assessment',
      'unresolved_blockers',
      'decision_options',
      'recommended_decision',
      'consequences',
      'next_review_steps',
    ]);
    expect(JSON.stringify(adrDraftJsonResponse.json())).not.toContain('list risk areas');
    expect(adrDraftMarkdownResponse.statusCode).toBe(200);
    expect(adrDraftMarkdownResponse.json()).toMatchObject({
      adrDraft: {
        format: 'markdown',
        query: {
          includeEvidence: false,
          includeAudit: false,
        },
      },
      exportResult: {
        format: 'markdown',
      },
    });
    expect(adrDraftMarkdownResponse.json().renderedContent).toContain(
      '# ADR Draft: Codex control\\-plane live adapter readiness',
    );
    expect(adrDraftMarkdownResponse.json().renderedContent).toContain('does not grant execution');
    expect(adrDraftMarkdownResponse.json().renderedContent).not.toContain('execution approval');
    expect(missingAdrDraftResponse.statusCode).toBe(404);
    expect(missingAdrDraftResponse.json()).toMatchObject({
      adrDraft: {
        status: 'not_found',
        recommendation: 'no_go',
        recommendationGrantsExecution: false,
        draftOnly: true,
      },
      liveExecution: false,
      externalProcessStarted: false,
      executionDisabled: true,
    });
    expect(missingAdrDraftResponse.body).not.toContain(process.cwd());
    expect(adrDecisionCreateResponse.statusCode).toBe(200);
    expect(adrDecisionCreateResponse.json()).toMatchObject({
      decisionRecord: {
        dryRunId: canonicalDryRunPlanId,
        decision: 'conditional_read_only_go',
        status: 'recorded',
        allowedSandboxModes: ['read_only'],
        forbiddenSandboxModes: ['workspace_write', 'danger_full_access'],
        futureTriggerPolicy: 'cli_only',
        dashboardTriggerAllowed: false,
        implementationApproved: false,
        processAdapterApproved: false,
        recommendationGrantsExecution: false,
        metadataOnly: true,
        bodyStored: false,
        liveExecution: false,
        externalProcessStarted: false,
        executionDisabled: true,
        gatePolicy: {
          dryRunPlanHashMatchRequired: true,
          policyDecisionHashMatchRequired: true,
          isolatedWorktreeRequired: true,
          postRunVerificationCommand: 'pnpm verify:foundation',
        },
      },
      summary: {
        decision: 'conditional_read_only_go',
        implementationApproved: false,
        processAdapterApproved: false,
        recommendationGrantsExecution: false,
      },
      implementationApproved: false,
      processAdapterApproved: false,
      recommendationGrantsExecution: false,
      liveExecution: false,
      externalProcessStarted: false,
      executionDisabled: true,
    });
    expect(adrDecisionCreateResponse.json().evidenceRefs).toHaveLength(1);
    expect(adrDecisionCreateResponse.json().auditEvents).toHaveLength(1);
    expect(JSON.stringify(adrDecisionCreateResponse.json())).not.toContain('list risk areas');
    expect(adrDecisionGetResponse.statusCode).toBe(200);
    expect(adrDecisionGetResponse.json().decisionRecord.id).toBe(adrDecisionId);
    expect(adrDecisionGetResponse.json()).toMatchObject({
      implementationApproved: false,
      processAdapterApproved: false,
      recommendationGrantsExecution: false,
      liveExecution: false,
      externalProcessStarted: false,
      executionDisabled: true,
    });
    expect(adrDecisionListResponse.statusCode).toBe(200);
    expect(adrDecisionListResponse.json().records).toHaveLength(1);
    expect(adrDecisionListResponse.json().decisions[0]).toMatchObject({
      decisionId: adrDecisionId,
      implementationApproved: false,
      processAdapterApproved: false,
      recommendationGrantsExecution: false,
    });
    expect(adrDecisionLatestResponse.statusCode).toBe(200);
    expect(adrDecisionLatestResponse.json()).toMatchObject({
      decisionRecord: {
        id: adrDecisionId,
        dashboardTriggerAllowed: false,
        implementationApproved: false,
        processAdapterApproved: false,
        recommendationGrantsExecution: false,
      },
      liveExecution: false,
      externalProcessStarted: false,
      executionDisabled: true,
    });
    expect(missingAdrDecisionResponse.statusCode).toBe(404);
    expect(missingAdrDecisionResponse.body).not.toContain(process.cwd());
    expect(missingAdrDecisionLatestResponse.statusCode).toBe(404);
    expect(missingAdrDecisionLatestResponse.body).not.toContain(process.cwd());
    expect(invalidAdrDecisionQueryResponse.statusCode).toBe(400);
    expect(readOnlyPreflightSimulationResponse.statusCode).toBe(200);
    expect(readOnlyPreflightSimulationResponse.json()).toMatchObject({
      simulationResult: {
        dryRunId: canonicalDryRunPlanId,
        status: 'passed',
        requestedSandboxMode: 'read_only',
        liveExecution: false,
        externalProcessStarted: false,
        executionDisabled: true,
        processAdapterStarted: false,
        implementationApproved: false,
        dashboardTriggerAllowed: false,
        recommendationGrantsExecution: false,
      },
      summary: {
        dryRunId: canonicalDryRunPlanId,
        liveExecution: false,
        externalProcessStarted: false,
        executionDisabled: true,
        processAdapterStarted: false,
        implementationApproved: false,
        dashboardTriggerAllowed: false,
      },
      liveExecution: false,
      externalProcessStarted: false,
      executionDisabled: true,
      processAdapterStarted: false,
      implementationApproved: false,
      dashboardTriggerAllowed: false,
    });
    expect(readOnlyPreflightSimulationResponse.json().evidenceRefs).toHaveLength(1);
    expect(readOnlyPreflightSimulationResponse.json().auditEvents).toHaveLength(1);
    expect(
      readOnlyPreflightSimulationResponse
        .json()
        .simulationResult.blockers.map((blocker: { code: string }) => blocker.code),
    ).not.toContain('config_explicit_enable_state');
    expect(JSON.stringify(readOnlyPreflightSimulationResponse.json())).not.toContain(
      'list risk areas',
    );
    expect(blockedReadOnlyPreflightSimulationResponse.statusCode).toBe(200);
    expect(blockedReadOnlyPreflightSimulationResponse.json()).toMatchObject({
      simulationResult: {
        status: 'blocked',
        requestedSandboxMode: 'workspace_write',
        liveExecution: false,
        externalProcessStarted: false,
        executionDisabled: true,
      },
    });
    expect(
      blockedReadOnlyPreflightSimulationResponse
        .json()
        .simulationResult.blockers.some(
          (blocker: { severity: string }) => blocker.severity === 'critical',
        ),
    ).toBe(true);
    expect(readOnlyPreflightSimulationListResponse.statusCode).toBe(200);
    expect(
      readOnlyPreflightSimulationListResponse.json().simulations.length,
    ).toBeGreaterThanOrEqual(2);
    expect(readOnlySimulatorReviewCreateResponse.statusCode).toBe(200);
    expect(readOnlySimulatorReviewCreateResponse.json()).toMatchObject({
      reviewRecord: {
        dryRunId: canonicalDryRunPlanId,
        outcome: 'go_to_implementation_planning',
        status: 'recorded',
        simulationStatus: 'blocked',
        implementationApproved: false,
        processAdapterApproved: false,
        recommendationGrantsExecution: false,
        liveExecution: false,
        externalProcessStarted: false,
        executionDisabled: true,
      },
      summary: {
        implementationApproved: false,
        processAdapterApproved: false,
        recommendationGrantsExecution: false,
      },
      liveExecution: false,
      externalProcessStarted: false,
      executionDisabled: true,
      processAdapterStarted: false,
      implementationApproved: false,
      processAdapterApproved: false,
      dashboardTriggerAllowed: false,
      recommendationGrantsExecution: false,
    });
    expect(readOnlySimulatorReviewCreateResponse.json().evidenceRefs).toHaveLength(1);
    expect(readOnlySimulatorReviewCreateResponse.json().auditEvents).toHaveLength(1);
    expect(JSON.stringify(readOnlySimulatorReviewCreateResponse.json())).not.toContain(
      'list risk areas',
    );
    expect(readOnlySimulatorReviewGetResponse.statusCode).toBe(200);
    expect(readOnlySimulatorReviewGetResponse.json().reviewRecord.id).toBe(
      readOnlySimulatorReviewId,
    );
    expect(readOnlySimulatorReviewListResponse.statusCode).toBe(200);
    expect(readOnlySimulatorReviewListResponse.json().records).toHaveLength(1);
    expect(readOnlySimulatorReviewListResponse.json().reviews[0]).toMatchObject({
      reviewId: readOnlySimulatorReviewId,
      outcome: 'go_to_implementation_planning',
      implementationApproved: false,
      processAdapterApproved: false,
      recommendationGrantsExecution: false,
    });
    expect(readOnlySimulatorReviewLatestResponse.statusCode).toBe(200);
    expect(readOnlySimulatorReviewLatestResponse.json()).toMatchObject({
      reviewRecord: {
        id: readOnlySimulatorReviewId,
        implementationApproved: false,
        processAdapterApproved: false,
        recommendationGrantsExecution: false,
      },
      liveExecution: false,
      externalProcessStarted: false,
      executionDisabled: true,
    });
    expect(implementationPlanReviewCreateResponse.statusCode).toBe(200);
    expect(implementationPlanReviewCreateResponse.json()).toMatchObject({
      reviewRecord: {
        outcome: 'conditional_go_to_disabled_skeleton',
        status: 'recorded',
        disabledSkeletonApproved: true,
        implementationApproved: false,
        processAdapterApproved: false,
        recommendationGrantsExecution: false,
        workspaceWriteAllowed: false,
        dangerFullAccessAllowed: false,
        liveExecution: false,
        externalProcessStarted: false,
        executionDisabled: true,
      },
      summary: {
        disabledSkeletonApproved: true,
        implementationApproved: false,
        processAdapterApproved: false,
        recommendationGrantsExecution: false,
      },
      liveExecution: false,
      externalProcessStarted: false,
      executionDisabled: true,
    });
    expect(implementationPlanReviewCreateResponse.json().evidenceRefs).toHaveLength(1);
    expect(implementationPlanReviewCreateResponse.json().auditEvents).toHaveLength(1);
    expect(JSON.stringify(implementationPlanReviewCreateResponse.json())).not.toContain(
      'list risk areas',
    );
    expect(implementationPlanReviewGetResponse.statusCode).toBe(200);
    expect(implementationPlanReviewGetResponse.json().reviewRecord.id).toBe(
      implementationPlanReviewId,
    );
    expect(implementationPlanReviewListResponse.statusCode).toBe(200);
    expect(implementationPlanReviewListResponse.json().records).toHaveLength(1);
    expect(implementationPlanReviewListResponse.json().reviews[0]).toMatchObject({
      reviewId: implementationPlanReviewId,
      outcome: 'conditional_go_to_disabled_skeleton',
      disabledSkeletonApproved: true,
      implementationApproved: false,
      processAdapterApproved: false,
      recommendationGrantsExecution: false,
    });
    expect(implementationPlanReviewLatestResponse.statusCode).toBe(200);
    expect(implementationPlanReviewLatestResponse.json()).toMatchObject({
      reviewRecord: {
        id: implementationPlanReviewId,
        disabledSkeletonApproved: true,
        implementationApproved: false,
        processAdapterApproved: false,
        recommendationGrantsExecution: false,
      },
      liveExecution: false,
      externalProcessStarted: false,
      executionDisabled: true,
    });
    expect(implementationPlanReviewMissingResponse.statusCode).toBe(404);
    expect(implementationPlanReviewMissingResponse.body).not.toContain(process.cwd());
    expect(implementationPlanReviewInvalidOutcomeResponse.statusCode).toBe(400);
    expect(implementationPlanReviewMissingOutcomeResponse.statusCode).toBe(400);
    expect(missingReadOnlySimulatorReviewGetResponse.statusCode).toBe(404);
    expect(missingReadOnlySimulatorReviewGetResponse.body).not.toContain(process.cwd());
    expect(invalidReadOnlySimulatorReviewQueryResponse.statusCode).toBe(400);
    expect(readOnlySimulatorReviewMissingIdResponse.statusCode).toBe(400);
    expect(missingReadOnlySimulatorReviewSimulationResponse.statusCode).toBe(404);
    expect(missingReadOnlySimulatorReviewSimulationResponse.body).not.toContain(process.cwd());
    expect(missingReadOnlyPreflightSimulationDryRunResponse.statusCode).toBe(404);
    expect(missingReadOnlyPreflightSimulationDryRunResponse.body).not.toContain(process.cwd());
    expect(missingReadOnlyPreflightSimulationIdResponse.statusCode).toBe(400);
    expect(missingReportReviewResponse.statusCode).toBe(404);
    expect(missingReportReviewResponse.body).not.toContain(process.cwd());
    expect(missingReportReviewLatestResponse.statusCode).toBe(404);
    expect(missingReportReviewLatestResponse.body).not.toContain(process.cwd());
    expect(invalidReportReviewHistoryResponse.statusCode).toBe(400);
    expect(invalidTimelineResponse.statusCode).toBe(400);
    expect(rejectedCwdResponse.statusCode).toBe(400);
  });

  it('keeps disabled skeleton and fixture-backed replay boundary read-only', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'codexhub-supervisor-read-only-adapter-'));
    const store = await createSqliteStore({ dbPath: join(dir, 'codexhub.sqlite') });
    const server = buildSupervisorServer({ store });

    const previewResponse = await server.inject({
      method: 'GET',
      url: '/api/codex/exec/read-only-adapter/skeleton-preview',
    });
    const reviewResponse = await server.inject({
      method: 'POST',
      headers: localControlHeaders,
      url: '/api/codex/exec/read-only-adapter/skeleton-review',
      payload: {
        outcome: 'skeleton_accepted_for_fixture_boundary_only',
        reviewerLabel: 'local-operator',
        rationaleSummary: 'Fixture boundary only; execution remains unapproved.',
      },
    });
    const reviewId = reviewResponse.json().reviewRecord.id as string;
    const reviewGetResponse = await server.inject({
      method: 'GET',
      url: `/api/codex/exec/read-only-adapter/skeleton-review/${reviewId}`,
    });
    const reviewListResponse = await server.inject({
      method: 'GET',
      url: '/api/codex/exec/read-only-adapter/skeleton-reviews?status=recorded&outcome=skeleton_accepted_for_fixture_boundary_only&limit=10',
    });
    let symlinkEscapeAvailable = false;

    try {
      rmSync(symlinkEscapeAbsolutePath, { force: true });
      symlinkSync(join(process.cwd(), 'package.json'), symlinkEscapeAbsolutePath, 'file');
      symlinkEscapeAvailable = true;
    } catch {
      rmSync(symlinkEscapeAbsolutePath, { force: true });
    }

    const fixtureResponse = await server.inject({
      method: 'POST',
      headers: localControlHeaders,
      url: '/api/codex/exec/read-only-adapter/fixture-boundary',
      payload: {
        fixturePath: 'packages/codex-kernel/fixtures/codex-exec-basic.jsonl',
      },
    });
    const rejectedFixturePayloads = [
      '../codex-exec-basic.jsonl',
      join(process.cwd(), 'packages', 'codex-kernel', 'fixtures', 'codex-exec-basic.jsonl'),
      'packages/codex-kernel/fixtures/codex-exec-basic.txt',
      'package.json',
      'packages/codex-kernel/fixtures/missing.jsonl',
    ];

    if (symlinkEscapeAvailable) {
      rejectedFixturePayloads.push(symlinkEscapeFixturePath);
    }

    const rejectedFixtureResponses = await Promise.all(
      rejectedFixturePayloads.map((fixturePath) =>
        server.inject({
          method: 'POST',
          headers: localControlHeaders,
          url: '/api/codex/exec/read-only-adapter/fixture-boundary',
          payload: { fixturePath },
        }),
      ),
    );
    const fixtureListResponse = await server.inject({
      method: 'GET',
      url: '/api/codex/exec/read-only-adapter/fixture-boundaries',
    });
    const finalReadinessResponse = await server.inject({
      method: 'POST',
      headers: localControlHeaders,
      url: '/api/codex/exec/read-only-adapter/final-readiness',
      payload: {
        outcome: 'ready_for_separate_read_only_adapter_adr',
        reviewerLabel: 'local-operator',
        rationaleSummary: 'Separate ADR remains required.',
      },
    });
    const finalReadinessListResponse = await server.inject({
      method: 'GET',
      url: '/api/codex/exec/read-only-adapter/final-readiness?status=recorded&outcome=ready_for_separate_read_only_adapter_adr&limit=10',
    });
    const finalReadinessLatestResponse = await server.inject({
      method: 'GET',
      url: '/api/codex/exec/read-only-adapter/final-readiness/latest',
    });

    await server.close();
    await store.close();

    expect(previewResponse.statusCode).toBe(200);
    expect(previewResponse.json()).toMatchObject({
      preview: {
        status: 'disabled',
        noRunnableCommand: true,
        commandPreviewStored: false,
        argvStored: false,
        executablePathStored: false,
        shellSnippetStored: false,
        envPlanStored: false,
        liveExecution: false,
        externalProcessStarted: false,
        executionDisabled: true,
        processAdapterStarted: false,
        processAdapterApproved: false,
        recommendationGrantsExecution: false,
      },
      liveExecution: false,
      externalProcessStarted: false,
      executionDisabled: true,
    });
    expect(reviewResponse.statusCode).toBe(200);
    expect(reviewResponse.json()).toMatchObject({
      reviewRecord: {
        outcome: 'skeleton_accepted_for_fixture_boundary_only',
        fixtureBoundaryAllowed: true,
        processAdapterApproved: false,
        recommendationGrantsExecution: false,
      },
      liveExecution: false,
      externalProcessStarted: false,
      executionDisabled: true,
    });
    expect(reviewGetResponse.statusCode).toBe(200);
    expect(reviewGetResponse.json().reviewRecord.id).toBe(reviewId);
    expect(reviewListResponse.statusCode).toBe(200);
    expect(reviewListResponse.json().records).toHaveLength(1);
    expect(fixtureResponse.statusCode).toBe(200);
    expect(fixtureResponse.json()).toMatchObject({
      result: {
        fixtureOnly: true,
        liveExecution: false,
        externalProcessStarted: false,
        executionDisabled: true,
        processAdapterStarted: false,
        processAdapterApproved: false,
      },
      liveExecution: false,
      externalProcessStarted: false,
      executionDisabled: true,
    });
    expect(fixtureResponse.json().evidenceRefs).toHaveLength(1);
    expect(fixtureResponse.json().auditEvents).toHaveLength(1);
    expect(fixtureResponse.json().result.auditEventIds).toEqual(
      fixtureResponse.json().auditEvents.map((event: { id: string }) => event.id),
    );
    expect(rejectedFixtureResponses.map((response) => response.statusCode)).toEqual(
      symlinkEscapeAvailable ? [400, 400, 400, 400, 404, 400] : [400, 400, 400, 400, 404],
    );
    expect(
      rejectedFixtureResponses.every((response) => !response.body.includes(process.cwd())),
    ).toBe(true);
    expect(fixtureListResponse.statusCode).toBe(200);
    expect(fixtureListResponse.json().summaries).toHaveLength(1);
    expect(finalReadinessResponse.statusCode).toBe(200);
    expect(finalReadinessResponse.json()).toMatchObject({
      decisionRecord: {
        outcome: 'ready_for_separate_read_only_adapter_adr',
        realAdapterRequiresSeparateAdr: true,
        currentRoundApprovesProcessStart: false,
        currentRoundApprovesCodexExecution: false,
        currentRoundApprovesWorkspaceWrites: false,
        processAdapterApproved: false,
        recommendationGrantsExecution: false,
      },
      liveExecution: false,
      externalProcessStarted: false,
      executionDisabled: true,
    });
    expect(finalReadinessListResponse.statusCode).toBe(200);
    expect(finalReadinessListResponse.json().records).toHaveLength(1);
    expect(finalReadinessLatestResponse.statusCode).toBe(200);
    expect(finalReadinessLatestResponse.json().decisionRecord.realAdapterRequiresSeparateAdr).toBe(
      true,
    );
    expect(JSON.stringify(fixtureResponse.json())).not.toContain('synthetic stdout body');
    expect(JSON.stringify(finalReadinessResponse.json())).not.toContain('full command body');
  });

  it('creates real read-only adapter readiness packages only with explicit 3S evidence', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'codexhub-supervisor-real-readiness-'));
    const store = await createSqliteStore({ dbPath: join(dir, 'codexhub.sqlite') });
    const server = buildSupervisorServer({ store });

    const dryRunResponse = await server.inject({
      method: 'POST',
      headers: localControlHeaders,
      url: '/api/codex/exec/dry-run',
      payload: {
        title: 'Summarize repository structure',
        prompt: 'Summarize repository structure only',
        cwd: '.',
        sandboxMode: 'read_only',
        approvalMode: 'required',
      },
    });
    const dryRunId = dryRunResponse.json().liveRunRecord.dryRunPlanId as string;
    const missingDecisionResponse = await server.inject({
      method: 'POST',
      headers: localControlHeaders,
      url: '/api/codex/exec/real-read-only-adapter/readiness-package',
      payload: { dryRunId },
    });

    await server.inject({
      method: 'POST',
      headers: localControlHeaders,
      url: '/api/codex/exec/read-only-adapter/implementation-plan-review',
      payload: {
        outcome: 'conditional_go_to_disabled_skeleton',
        reviewerLabel: 'local-operator',
        rationaleSummary:
          'Allows only disabled skeleton scope; process adapter remains unapproved.',
      },
    });
    await server.inject({
      method: 'POST',
      headers: localControlHeaders,
      url: '/api/codex/exec/read-only-adapter/skeleton-review',
      payload: {
        outcome: 'skeleton_accepted_for_fixture_boundary_only',
        reviewerLabel: 'local-operator',
        rationaleSummary: 'Fixture boundary only; process adapter remains unapproved.',
      },
    });

    const createResponse = await server.inject({
      method: 'POST',
      headers: localControlHeaders,
      url: '/api/codex/exec/real-read-only-adapter/readiness-package',
      payload: { dryRunId },
    });
    const packageId = createResponse.json().package.id as string;
    const getResponse = await server.inject({
      method: 'GET',
      url: `/api/codex/exec/real-read-only-adapter/readiness-package/${packageId}`,
    });
    const listResponse = await server.inject({
      method: 'GET',
      url: `/api/codex/exec/real-read-only-adapter/readiness-packages?dryRunId=${dryRunId}&status=requires_review&limit=10`,
    });
    const latestResponse = await server.inject({
      method: 'GET',
      url: `/api/codex/exec/real-read-only-adapter/readiness-package/latest/${dryRunId}`,
    });
    const missingReviewPackageResponse = await server.inject({
      method: 'POST',
      headers: localControlHeaders,
      url: '/api/codex/exec/real-read-only-adapter/readiness-review',
      payload: {
        packageId: 'missing_readiness_package',
        outcome: 'conditional_go_to_separate_adr_draft',
        reviewerLabel: 'local-operator',
        rationaleSummary:
          'Acknowledges symlink_escape_verification_pending and documented_only_3tw_evidence.',
      },
    });
    const invalidReviewResponse = await server.inject({
      method: 'POST',
      headers: localControlHeaders,
      url: '/api/codex/exec/real-read-only-adapter/readiness-review',
      payload: {
        packageId,
        outcome: 'conditional_go_to_separate_adr_draft',
        reviewerLabel: 'local-operator',
        rationaleSummary: 'Looks acceptable for ADR drafting.',
      },
    });
    const validReviewResponse = await server.inject({
      method: 'POST',
      headers: localControlHeaders,
      url: '/api/codex/exec/real-read-only-adapter/readiness-review',
      payload: {
        packageId,
        outcome: 'conditional_go_to_separate_adr_draft',
        reviewerLabel: 'local-operator',
        rationaleSummary:
          'Acknowledges symlink_escape_verification_pending and documented_only_3tw_evidence.',
      },
    });
    const reviewId = validReviewResponse.json().reviewRecord.id as string;
    const getReviewResponse = await server.inject({
      method: 'GET',
      url: `/api/codex/exec/real-read-only-adapter/readiness-review/${reviewId}`,
    });
    const listReviewsResponse = await server.inject({
      method: 'GET',
      url: `/api/codex/exec/real-read-only-adapter/readiness-reviews?packageId=${packageId}&outcome=conditional_go_to_separate_adr_draft&limit=10`,
    });
    const latestReviewResponse = await server.inject({
      method: 'GET',
      url: `/api/codex/exec/real-read-only-adapter/readiness-review/latest/${dryRunId}`,
    });
    const invalidReviewQueryResponse = await server.inject({
      method: 'GET',
      url: '/api/codex/exec/real-read-only-adapter/readiness-reviews?outcome=execution_approved',
    });
    const missingReviewBodyResponse = await server.inject({
      method: 'POST',
      headers: localControlHeaders,
      url: '/api/codex/exec/real-read-only-adapter/readiness-review',
      payload: {},
    });
    const missingDryRunResponse = await server.inject({
      method: 'POST',
      headers: localControlHeaders,
      url: '/api/codex/exec/real-read-only-adapter/readiness-package',
      payload: { dryRunId: 'missing_dry_run' },
    });
    const missingIdResponse = await server.inject({
      method: 'POST',
      headers: localControlHeaders,
      url: '/api/codex/exec/real-read-only-adapter/readiness-package',
      payload: {},
    });
    const disabledStoreServer = buildSupervisorServer({ disableStore: true });
    const disabledStoreResponse = await disabledStoreServer.inject({
      method: 'POST',
      headers: localControlHeaders,
      url: '/api/codex/exec/real-read-only-adapter/readiness-package',
      payload: { dryRunId },
    });
    const disabledStoreReviewResponse = await disabledStoreServer.inject({
      method: 'POST',
      headers: localControlHeaders,
      url: '/api/codex/exec/real-read-only-adapter/readiness-review',
      payload: {
        packageId,
        outcome: 'no_go_to_separate_adr_draft',
        reviewerLabel: 'local-operator',
        rationaleSummary: 'No persisted readiness package is available here.',
      },
    });

    await disabledStoreServer.close();
    await server.close();
    await store.close();

    expect(missingDecisionResponse.statusCode).toBe(409);
    expect(missingDecisionResponse.json()).toMatchObject({
      notPersisted: true,
      package: {
        status: 'blocked',
        implementationApproved: false,
        processAdapterApproved: false,
        recommendationGrantsExecution: false,
      },
      liveExecution: false,
      externalProcessStarted: false,
      executionDisabled: true,
    });
    expect(
      missingDecisionResponse
        .json()
        .package.blockers.map((blocker: { code: string }) => blocker.code),
    ).toContain('round_3s_conditional_decision_exists');
    expect(createResponse.statusCode).toBe(200);
    expect(createResponse.json()).toMatchObject({
      package: {
        dryRunId,
        status: 'requires_review',
        documentedOnly3twEvidence: true,
        symlinkEscapeVerificationPending: true,
        implementationApproved: false,
        processAdapterApproved: false,
        recommendationGrantsExecution: false,
      },
      summary: {
        status: 'requires_review',
        implementationApproved: false,
        processAdapterApproved: false,
        recommendationGrantsExecution: false,
      },
      liveExecution: false,
      externalProcessStarted: false,
      executionDisabled: true,
      notPersisted: false,
    });
    expect(
      createResponse.json().package.findings.map((finding: { code: string }) => finding.code),
    ).toContain('documented_only_3tw_evidence');
    expect(
      createResponse.json().package.findings.map((finding: { code: string }) => finding.code),
    ).toContain('fixture_path_guard_symlink_escape');
    expect(createResponse.json().recommendation).toContain(
      'Does not grant implementation, process launch, or execution permission.',
    );
    expect(getResponse.statusCode).toBe(200);
    expect(getResponse.json().package.id).toBe(packageId);
    expect(listResponse.statusCode).toBe(200);
    expect(listResponse.json().summaries).toHaveLength(1);
    expect(latestResponse.statusCode).toBe(200);
    expect(latestResponse.json().package.id).toBe(packageId);
    expect(missingReviewPackageResponse.statusCode).toBe(404);
    expect(missingReviewPackageResponse.body).not.toContain(process.cwd());
    expect(invalidReviewResponse.statusCode).toBe(400);
    expect(invalidReviewResponse.json().missingAcknowledgementCodes).toEqual(
      expect.arrayContaining([
        'symlink_escape_verification_pending',
        'documented_only_3tw_evidence',
      ]),
    );
    expect(validReviewResponse.statusCode).toBe(200);
    expect(validReviewResponse.json()).toMatchObject({
      reviewRecord: {
        packageId,
        dryRunId,
        outcome: 'conditional_go_to_separate_adr_draft',
        separateAdrDraftAllowed: true,
        implementationApproved: false,
        processAdapterApproved: false,
        recommendationGrantsExecution: false,
        acknowledgedFindingCodes: expect.arrayContaining([
          'symlink_escape_verification_pending',
          'documented_only_3tw_evidence',
        ]),
        unresolvedFindingCount: expect.any(Number),
      },
      liveExecution: false,
      externalProcessStarted: false,
      executionDisabled: true,
      notPersisted: false,
    });
    expect(validReviewResponse.json().recommendation).toContain(
      'Does not grant implementation, process launch, or execution permission.',
    );
    expect(getReviewResponse.statusCode).toBe(200);
    expect(getReviewResponse.json().reviewRecord.id).toBe(reviewId);
    expect(listReviewsResponse.statusCode).toBe(200);
    expect(listReviewsResponse.json().summaries).toHaveLength(1);
    expect(latestReviewResponse.statusCode).toBe(200);
    expect(latestReviewResponse.json().reviewRecord.id).toBe(reviewId);
    expect(invalidReviewQueryResponse.statusCode).toBe(400);
    expect(missingReviewBodyResponse.statusCode).toBe(400);
    expect(missingDryRunResponse.statusCode).toBe(404);
    expect(missingDryRunResponse.body).not.toContain(process.cwd());
    expect(missingIdResponse.statusCode).toBe(400);
    expect(disabledStoreResponse.statusCode).toBe(503);
    expect(disabledStoreResponse.json()).toMatchObject({
      degraded: true,
      notPersisted: true,
      implementationApproved: false,
      processAdapterApproved: false,
      recommendationGrantsExecution: false,
      liveExecution: false,
      externalProcessStarted: false,
      executionDisabled: true,
    });
    expect(disabledStoreReviewResponse.statusCode).toBe(503);
    expect(disabledStoreReviewResponse.json()).toMatchObject({
      degraded: true,
      notPersisted: true,
      implementationApproved: false,
      processAdapterApproved: false,
      recommendationGrantsExecution: false,
      liveExecution: false,
      externalProcessStarted: false,
      executionDisabled: true,
    });
    expect(JSON.stringify(createResponse.json())).not.toContain(
      'Summarize repository structure only',
    );
    expect(JSON.stringify(validReviewResponse.json())).not.toContain(
      'Summarize repository structure only',
    );
    expect(JSON.stringify(createResponse.json())).not.toContain('full report markdown');
    expect(createResponse.body).not.toContain(process.cwd());
  });

  it('creates authoritative metadata-only real read-only adapter attempt records', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'codexhub-supervisor-real-attempt-'));
    const store = await createSqliteStore({ dbPath: join(dir, 'codexhub.sqlite') });
    const defaultConfigLoadResult = createDefaultCodexExecConfigLoadResult();
    const server = buildSupervisorServer({
      store,
      configLoadResult: {
        ...defaultConfigLoadResult,
        source: 'file',
        status: 'loaded',
        summary: 'Loaded explicit enabled config for attempt authority test',
        config: {
          ...defaultConfigLoadResult.config,
          liveEnabled: true,
          allowedSandboxModes: ['read_only'],
          forbiddenSandboxModes: ['workspace_write', 'danger_full_access'],
          configSource: 'file',
        },
      },
    });

    const createResponse = await server.inject({
      method: 'POST',
      headers: localControlHeaders,
      url: '/api/codex/exec/real-read-only-adapter/attempt',
      payload: {
        dryRunId: 'codex_dry_run_attempt_fixture',
        approvalArtifactId: 'codex_approval_attempt_fixture',
        isolatedWorktreeProvided: true,
      },
    });
    const attemptId = createResponse.json().attemptRecord.id as string;
    const getResponse = await server.inject({
      method: 'GET',
      url: `/api/codex/exec/real-read-only-adapter/attempt/${attemptId}`,
    });
    const listResponse = await server.inject({
      method: 'GET',
      url: '/api/codex/exec/real-read-only-adapter/attempts?dryRunId=codex_dry_run_attempt_fixture&status=blocked&limit=10',
    });
    const latestResponse = await server.inject({
      method: 'GET',
      url: '/api/codex/exec/real-read-only-adapter/attempt/latest/codex_dry_run_attempt_fixture',
    });
    const timelineResponse = await server.inject({
      method: 'GET',
      url:
        '/api/codex/exec/real-read-only-adapter/attempt-timeline/codex_dry_run_attempt_fixture' +
        '?status=blocked&includeEvidence=true&includeAudit=true&limit=10',
    });
    const invalidTimelineQueryResponse = await server.inject({
      method: 'GET',
      url: '/api/codex/exec/real-read-only-adapter/attempt-timeline/codex_dry_run_attempt_fixture?status=execution_approved',
    });
    const invalidQueryResponse = await server.inject({
      method: 'GET',
      url: '/api/codex/exec/real-read-only-adapter/attempts?status=execution_approved',
    });
    const missingBodyResponse = await server.inject({
      method: 'POST',
      headers: localControlHeaders,
      url: '/api/codex/exec/real-read-only-adapter/attempt',
      payload: {},
    });
    const disabledStoreServer = buildSupervisorServer({ disableStore: true });
    const disabledStoreResponse = await disabledStoreServer.inject({
      method: 'POST',
      headers: localControlHeaders,
      url: '/api/codex/exec/real-read-only-adapter/attempt',
      payload: { dryRunId: 'codex_dry_run_attempt_fixture' },
    });
    const disabledConfigDir = mkdtempSync(
      join(tmpdir(), 'codexhub-supervisor-real-attempt-disabled-config-'),
    );
    const disabledConfigStore = await createSqliteStore({
      dbPath: join(disabledConfigDir, 'codexhub.sqlite'),
    });
    const disabledConfigServer = buildSupervisorServer({
      store: disabledConfigStore,
      configLoadResult: {
        ...defaultConfigLoadResult,
        source: 'file',
        status: 'loaded',
        summary: 'Loaded disabled config for attempt authority test',
        config: {
          ...defaultConfigLoadResult.config,
          liveEnabled: false,
          allowedSandboxModes: ['read_only'],
          forbiddenSandboxModes: ['workspace_write', 'danger_full_access'],
          configSource: 'file',
        },
      },
    });
    const disabledConfigResponse = await disabledConfigServer.inject({
      method: 'POST',
      headers: localControlHeaders,
      url: '/api/codex/exec/real-read-only-adapter/attempt',
      payload: { dryRunId: 'codex_dry_run_attempt_fixture' },
    });

    await disabledConfigServer.close();
    await disabledConfigStore.close();
    await disabledStoreServer.close();
    await server.close();
    await store.close();

    expect(createResponse.statusCode).toBe(200);
    expect(createResponse.json()).toMatchObject({
      attemptRecord: {
        id: attemptId,
        dryRunId: 'codex_dry_run_attempt_fixture',
        status: 'blocked',
        authoritative: true,
        supervisorBacked: true,
        persisted: true,
        degraded: false,
        notPersisted: false,
        processBoundaryInvoked: false,
        implementationApproved: false,
        processAdapterApproved: false,
        recommendationGrantsExecution: false,
        workspaceWriteAllowed: false,
        dangerFullAccessAllowed: false,
        dashboardTriggerAllowed: false,
      },
      liveExecution: false,
      externalProcessStarted: false,
      executionDisabled: true,
      notPersisted: false,
    });
    expect(createResponse.json().request.metadata.configuredEnabled).toBe(true);
    expect(
      createResponse
        .json()
        .preflight.checks.find((check: { code: string }) => check.code === 'config_explicit_enable')
        ?.status,
    ).toBe('passed');
    expect(createResponse.json().result.error.code).toBe('missing_dry_run');
    expect(JSON.stringify(createResponse.json())).not.toContain('config_disabled');
    expect(createResponse.json().evidenceRefs).toHaveLength(1);
    expect(createResponse.json().auditEvents.length).toBeGreaterThan(0);
    expect(getResponse.statusCode).toBe(200);
    expect(getResponse.json().attemptRecord.id).toBe(attemptId);
    expect(listResponse.statusCode).toBe(200);
    expect(listResponse.json().summaries).toHaveLength(1);
    expect(latestResponse.statusCode).toBe(200);
    expect(latestResponse.json().attemptRecord.id).toBe(attemptId);
    expect(timelineResponse.statusCode).toBe(200);
    expect(timelineResponse.json()).toMatchObject({
      timeline: {
        dryRunId: 'codex_dry_run_attempt_fixture',
        status: 'blocked',
        eventCount: 1,
        includeEvidence: true,
        includeAudit: true,
        implementationApproved: false,
        processAdapterApproved: false,
        recommendationGrantsExecution: false,
        workspaceWriteAllowed: false,
        dangerFullAccessAllowed: false,
        dashboardTriggerAllowed: false,
      },
      authoritative: true,
      supervisorBacked: true,
      persisted: true,
      degraded: false,
      notPersisted: false,
    });
    expect(timelineResponse.json().timeline.evidenceRefCount).toBeGreaterThan(0);
    expect(timelineResponse.json().timeline.auditEventCount).toBeGreaterThan(0);
    expect(timelineResponse.json().timeline.entries[0].attemptId).toBe(attemptId);
    expect(invalidTimelineQueryResponse.statusCode).toBe(400);
    expect(invalidQueryResponse.statusCode).toBe(400);
    expect(missingBodyResponse.statusCode).toBe(400);
    expect(disabledStoreResponse.statusCode).toBe(503);
    expect(disabledStoreResponse.json()).toMatchObject({
      authoritative: false,
      supervisorBacked: false,
      persisted: false,
      degraded: true,
      notPersisted: true,
      liveExecution: false,
      externalProcessStarted: false,
      executionDisabled: true,
      implementationApproved: false,
      processAdapterApproved: false,
      recommendationGrantsExecution: false,
    });
    expect(disabledConfigResponse.statusCode).toBe(200);
    expect(disabledConfigResponse.json().result.error.code).toBe('config_disabled');
    expect(
      disabledConfigResponse
        .json()
        .preflight.checks.find((check: { code: string }) => check.code === 'config_explicit_enable')
        ?.status,
    ).toBe('failed');
    expect(JSON.stringify(createResponse.json())).not.toContain('raw prompt body');
    expect(JSON.stringify(createResponse.json())).not.toContain('raw command body');
    expect(JSON.stringify(createResponse.json())).not.toContain('raw stdout body');
    expect(JSON.stringify(createResponse.json())).not.toContain('raw stderr body');
    expect(JSON.stringify(timelineResponse.json())).not.toContain('raw stdout body');
    expect(JSON.stringify(timelineResponse.json())).not.toContain('raw stderr body');
    expect(JSON.stringify(createResponse.json())).not.toContain('"argv"');
    expect(JSON.stringify(timelineResponse.json())).not.toContain('"argv"');
    expect(JSON.stringify(createResponse.json())).not.toContain('"executablePath":');
    expect(JSON.stringify(timelineResponse.json())).not.toContain('"executablePath":');
    expect(createResponse.body).not.toContain(process.cwd());
  });

  it('uses authoritative guard sources and an injected runner before recording completed attempts', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'codexhub-supervisor-real-attempt-completed-'));
    const store = await createSqliteStore({ dbPath: join(dir, 'codexhub.sqlite') });
    const defaultConfigLoadResult = createDefaultCodexExecConfigLoadResult();
    const pilotWorktreePath = join(dir, 'pilot-worktree');
    const pilotWorktreeHash = hashTestWorktreePath(pilotWorktreePath);
    mkdirSync(pilotWorktreePath);
    const governedInputRelativePath = '.codexhub/governed-input.md';
    const governedInputText = 'Summarize repository structure without making changes.';
    const governedInputHash = `sha256:${hashTestText(governedInputText)}`;
    mkdirSync(join(pilotWorktreePath, '.codexhub'));
    writeFileSync(join(pilotWorktreePath, '.codexhub', 'governed-input.md'), governedInputText);
    let fakeRunnerResult = {
      exitCode: 0 as number | undefined,
      stdout: '{"type":"result","status":"ok"}\n',
      stderr: '',
    };
    let observedPromptArgumentHash: string | undefined;
    const fakeRunner = {
      start: async (plan: {
        argv?: readonly string[];
        metadata?: Record<string, unknown>;
        postRunVerification?: boolean;
      }) => {
        if (plan.postRunVerification !== true) {
          observedPromptArgumentHash = plan.metadata?.promptArgumentHash as string | undefined;

          if (plan.argv?.at(-1)?.includes(governedInputRelativePath) !== true) {
            throw new Error('expected governed input prompt argument');
          }
        }

        return fakeRunnerResult;
      },
    };
    const resolvedExecutablePath = join(dir, 'codex.exe');
    let executableResolution: CodexExecRealReadOnlyAdapterExecutableResolution = {
      status: 'resolved',
      policyLabel: 'codex_cli',
      executablePath: resolvedExecutablePath,
      env: { PATH: dir, SystemRoot: 'C:/Windows' },
      shell: false,
      executablePathStored: false,
      envPlanStored: false,
      argvStored: false,
      metadataOnly: true,
      envAllowlistKeyCount: 2,
      envAllowlistKeyHash: 'sha256:supervisor-test-env-keys',
      platform: 'win32',
      resolvedExecutableKind: 'native_exe',
      spawnTargetKind: 'native_exe',
      executableResolutionSource: 'direct_path',
      executablePathHash: 'sha256:supervisor-test-executable-path',
      executableExists: true,
      executableAccessible: true,
    };
    const server = buildSupervisorServer({
      store,
      configLoadResult: {
        ...defaultConfigLoadResult,
        source: 'file',
        status: 'loaded',
        summary: 'Loaded explicit enabled config for guarded attempt test',
        config: {
          ...defaultConfigLoadResult.config,
          liveEnabled: true,
          allowedSandboxModes: ['read_only'],
          forbiddenSandboxModes: ['workspace_write', 'danger_full_access'],
          configSource: 'file',
        },
      },
      realReadOnlyAdapterExecutableResolver: () => executableResolution,
      realReadOnlyAdapterProcessRunner: fakeRunner,
      realReadOnlyAdapterPostRunVerificationRunner: fakeRunner,
      realReadOnlyAdapterPostRunWorktreeState: {
        beforeStatus: 'clean',
        afterStatus: 'clean',
        unexpectedDiff: false,
        statusHash: pilotWorktreeHash,
      },
    });

    const dryRunResponse = await server.inject({
      method: 'POST',
      headers: localControlHeaders,
      url: '/api/codex/exec/dry-run',
      payload: {
        title: 'Guarded real read-only attempt fixture',
        prompt: 'Summarize repository structure',
        cwd: '.',
        sandboxMode: 'read_only',
        approvalMode: 'required',
      },
    });
    const dryRunId = dryRunResponse.json().liveRunRecord.id as string;
    const policySourceResponse = await server.inject({
      method: 'POST',
      headers: localControlHeaders,
      url: '/api/codex/exec/real-read-only-adapter/policy-sources',
      payload: { dryRunId },
    });
    const policySourceRecordId = policySourceResponse.json().recordId as string;
    const approvalRequestResponse = await server.inject({
      method: 'POST',
      headers: localControlHeaders,
      url: '/api/codex/exec/approval-request',
      payload: {
        dryRunId,
        policySourceId: policySourceRecordId,
        requestedBy: 'local-operator',
        reason: 'Guarded read-only adapter attempt fixture',
      },
    });
    const approvalResponse = await server.inject({
      method: 'POST',
      headers: localControlHeaders,
      url: '/api/codex/exec/manual-approval',
      payload: {
        dryRunId,
        approvalRequestId: approvalRequestResponse.json().approvalRequest.id,
        outcome: 'approved',
        reason: 'Guarded read-only adapter attempt fixture',
      },
    });
    const approvalArtifactId = approvalResponse.json().approvalArtifact.id as string;
    let unrelatedApprovalArtifactId: string | undefined;

    for (let index = 0; index < 55; index += 1) {
      const unrelatedDryRunResponse = await server.inject({
        method: 'POST',
        headers: localControlHeaders,
        url: '/api/codex/exec/dry-run',
        payload: {
          title: `Unrelated approval authority fixture ${index}`,
          prompt: 'Summarize repository structure',
          cwd: '.',
          sandboxMode: 'read_only',
          approvalMode: 'required',
        },
      });
      const unrelatedDryRunId = unrelatedDryRunResponse.json().liveRunRecord.id as string;
      const unrelatedPolicySourceResponse = await server.inject({
        method: 'POST',
        headers: localControlHeaders,
        url: '/api/codex/exec/real-read-only-adapter/policy-sources',
        payload: { dryRunId: unrelatedDryRunId },
      });
      const unrelatedApprovalRequestResponse = await server.inject({
        method: 'POST',
        headers: localControlHeaders,
        url: '/api/codex/exec/approval-request',
        payload: {
          dryRunId: unrelatedDryRunId,
          policySourceId: unrelatedPolicySourceResponse.json().recordId,
          requestedBy: 'local-operator',
          reason: `Unrelated approval authority fixture ${index}`,
        },
      });
      const unrelatedManualApprovalResponse = await server.inject({
        method: 'POST',
        headers: localControlHeaders,
        url: '/api/codex/exec/manual-approval',
        payload: {
          dryRunId: unrelatedDryRunId,
          approvalRequestId: unrelatedApprovalRequestResponse.json().approvalRequest.id,
          outcome: 'approved',
          reason: `Unrelated approval authority fixture ${index}`,
        },
      });
      unrelatedApprovalArtifactId ??= unrelatedManualApprovalResponse.json().approvalArtifact.id as
        | string
        | undefined;
    }

    const mismatchedApprovalSourceResponse = await server.inject({
      method: 'POST',
      headers: localControlHeaders,
      url: '/api/codex/exec/real-read-only-adapter/pilot-prerequisite-sources',
      payload: {
        dryRunId,
        approvalArtifactId: unrelatedApprovalArtifactId,
        worktreeLabel: 'isolated-clean-fixture',
        worktreeStatus: 'clean',
        worktreePathHash: pilotWorktreeHash,
      },
    });
    const sourcePreparationResponse = await server.inject({
      method: 'POST',
      headers: localControlHeaders,
      url: '/api/codex/exec/real-read-only-adapter/pilot-prerequisite-sources',
      payload: {
        dryRunId,
        approvalArtifactId,
        worktreeLabel: 'isolated-clean-fixture',
        worktreeStatus: 'clean',
        worktreePathHash: pilotWorktreeHash,
      },
    });
    const prerequisiteResponse = await server.inject({
      method: 'POST',
      headers: localControlHeaders,
      url: '/api/codex/exec/real-read-only-adapter/pilot-prerequisites',
      payload: {
        dryRunId,
        approvalArtifactId,
        worktreeLabel: 'isolated-clean-fixture',
        worktreeStatus: 'clean',
        worktreePathHash: pilotWorktreeHash,
        handoffContextComplete: true,
      },
    });
    const attemptResponse = await server.inject({
      method: 'POST',
      headers: localControlHeaders,
      url: '/api/codex/exec/real-read-only-adapter/attempt',
      payload: {
        dryRunId,
        approvalArtifactId,
        worktreePath: pilotWorktreePath,
        governedInputRelativePath,
        governedInputContentHash: governedInputHash,
      },
    });
    const attemptBodyText = attemptResponse.body;
    fakeRunnerResult = {
      exitCode: 2,
      stdout: 'supervisor failed stdout must remain hashed',
      stderr: 'supervisor failed stderr must remain hashed',
    };
    const failedAttemptResponse = await server.inject({
      method: 'POST',
      headers: localControlHeaders,
      url: '/api/codex/exec/real-read-only-adapter/attempt',
      payload: {
        dryRunId,
        approvalArtifactId,
        worktreePath: pilotWorktreePath,
        governedInputRelativePath,
        governedInputContentHash: governedInputHash,
      },
    });
    const failedAttemptId = failedAttemptResponse.json().attemptRecord.id as string;
    const failedAttemptReadbackResponse = await server.inject({
      method: 'GET',
      url: `/api/codex/exec/real-read-only-adapter/attempt/${failedAttemptId}`,
    });
    const failedAttemptLatestResponse = await server.inject({
      method: 'GET',
      url: `/api/codex/exec/real-read-only-adapter/attempt/latest/${dryRunId}`,
    });
    const failedAttemptTimelineResponse = await server.inject({
      method: 'GET',
      url:
        `/api/codex/exec/real-read-only-adapter/attempt-timeline/${dryRunId}` +
        '?includeEvidence=true&includeAudit=true&limit=1',
    });
    const mismatchResponse = await server.inject({
      method: 'POST',
      headers: localControlHeaders,
      url: '/api/codex/exec/real-read-only-adapter/attempt',
      payload: {
        dryRunId,
        approvalArtifactId,
        worktreePath: join(dir, 'different-worktree'),
        governedInputRelativePath,
        governedInputContentHash: governedInputHash,
      },
    });
    const missingGovernedInputResponse = await server.inject({
      method: 'POST',
      headers: localControlHeaders,
      url: '/api/codex/exec/real-read-only-adapter/attempt',
      payload: {
        dryRunId,
        approvalArtifactId,
        worktreePath: pilotWorktreePath,
      },
    });
    executableResolution = {
      status: 'blocked',
      policyLabel: 'codex_cli',
      reasonCode: 'executable_requires_shell',
      directExecutableFound: false,
      shellShimDetected: true,
      shell: false,
      executablePathStored: false,
      envPlanStored: false,
      argvStored: false,
      metadataOnly: true,
      envAllowlistKeyCount: 2,
      envAllowlistKeyHash: 'sha256:supervisor-test-env-keys',
      platform: 'win32',
      resolvedExecutableKind: 'shell_shim',
      spawnTargetKind: 'unknown',
      executableResolutionSource: 'blocked_shell_shim',
      executableExists: true,
      executableAccessible: false,
    };
    const blockedExecutableResponse = await server.inject({
      method: 'POST',
      headers: localControlHeaders,
      url: '/api/codex/exec/real-read-only-adapter/attempt',
      payload: {
        dryRunId,
        approvalArtifactId,
        worktreePath: pilotWorktreePath,
        governedInputRelativePath,
        governedInputContentHash: governedInputHash,
      },
    });
    const blockedExecutableAttemptId = blockedExecutableResponse.json().attemptRecord.id as string;
    const blockedExecutableReadbackResponse = await server.inject({
      method: 'GET',
      url: `/api/codex/exec/real-read-only-adapter/attempt/${blockedExecutableAttemptId}`,
    });
    const blockedExecutableLatestResponse = await server.inject({
      method: 'GET',
      url: `/api/codex/exec/real-read-only-adapter/attempt/latest/${dryRunId}`,
    });
    const blockedExecutableListResponse = await server.inject({
      method: 'GET',
      url:
        `/api/codex/exec/real-read-only-adapter/attempts?dryRunId=${dryRunId}` +
        '&status=blocked&limit=10',
    });
    const blockedExecutableTimelineResponse = await server.inject({
      method: 'GET',
      url:
        `/api/codex/exec/real-read-only-adapter/attempt-timeline/${dryRunId}` +
        '?status=blocked&includeEvidence=true&includeAudit=true&limit=1',
    });

    await server.close();
    await store.close();

    expect(policySourceResponse.statusCode).toBe(200);
    expect(policySourceResponse.json()).toMatchObject({
      recordId: policySourceRecordId,
      dryRunId,
      status: 'aligned',
      degraded: false,
      notPersisted: false,
      configExplicitlyEnabled: true,
      readOnlyOnly: true,
      policyDecisionAllowsPilot: true,
      evidenceAuditReady: true,
      fallbackUsedAsAuthority: false,
      pilotExecuted: false,
      adapterAttemptInvoked: false,
    });
    expect(mismatchedApprovalSourceResponse.statusCode).toBe(200);
    expect(mismatchedApprovalSourceResponse.json().status).toBe('blocked');
    expect(mismatchedApprovalSourceResponse.json().sourcePreparationRecord.metadata).toMatchObject({
      approvalAuthorityStatus: expect.stringMatching(/mismatch|invalid/),
      approvalDryRunHashMatched: false,
      approvalPolicyHashMatched: false,
    });
    expect(sourcePreparationResponse.statusCode).toBe(200);
    expect(sourcePreparationResponse.json().status).toBe('prepared');
    expect(sourcePreparationResponse.json().sourcePreparationRecord.metadata).toMatchObject({
      approvalAuthorityStatus: 'resolved',
      approvalRecordId: expect.any(String),
      approvalDryRunHashMatched: true,
      approvalPolicyHashMatched: true,
    });
    expect(prerequisiteResponse.statusCode).toBe(200);
    expect(prerequisiteResponse.json().status).toBe('ready_for_pilot_retry');
    expect(prerequisiteResponse.json().prerequisiteRecord.metadata).toMatchObject({
      approvalAuthorityStatus: 'resolved',
      approvalRecordId: expect.any(String),
      approvalDryRunHashMatched: true,
      approvalPolicyHashMatched: true,
    });
    expect(attemptResponse.statusCode).toBe(200);
    expect(attemptResponse.json()).toMatchObject({
      attemptRecord: {
        dryRunId,
        status: 'completed',
        processBoundaryInvoked: true,
        preflightStatus: 'passed',
        resultStatus: 'completed',
        postRunVerificationStatus: 'passed',
        workspaceMutationDetected: false,
        failedCheckCodes: [],
        blockedCheckCodes: [],
        implementationApproved: false,
        processAdapterApproved: false,
        recommendationGrantsExecution: false,
        workspaceWriteAllowed: false,
        dangerFullAccessAllowed: false,
        dashboardTriggerAllowed: false,
        externalProcessStarted: true,
        processAdapterStarted: true,
      },
      liveExecution: false,
      externalProcessStarted: true,
      processAdapterStarted: true,
      executionDisabled: true,
      degraded: false,
      notPersisted: false,
    });
    expect(
      attemptResponse
        .json()
        .preflight.checks.every((check: { status: string }) => check.status === 'passed'),
    ).toBe(true);
    expect(attemptResponse.json().attemptRecord.metadata).toMatchObject({
      approvalAuthorityStatus: 'resolved',
      approvalArtifactId,
      approvalDryRunHashMatched: true,
      approvalPolicyHashMatched: true,
      executablePolicyLabel: 'codex_cli',
      executableResolutionStatus: 'resolved',
      executablePathStored: false,
      envPlanStored: false,
      argvStored: false,
      executableResolvedKind: 'native_exe',
      executablePathHash: 'sha256:supervisor-test-executable-path',
      executableExists: true,
      executableAccessible: true,
      envAllowlistKeyCount: 2,
      envAllowlistKeyHash: 'sha256:supervisor-test-env-keys',
      cwdSelfCheckStatus: 'passed',
      cwdHash: pilotWorktreeHash,
      cwdExists: true,
      cwdIsDirectory: true,
      cwdPathStored: false,
      governedInputVerified: true,
      governedInputContentHash: governedInputHash,
      governedInputBodyStored: false,
      promptArgumentStored: false,
    });
    expect(observedPromptArgumentHash).toMatch(/^sha256:/);
    expect(attemptResponse.json().result.error).toBeUndefined();
    expect(attemptResponse.json().evidenceRefs.length).toBeGreaterThan(0);
    expect(attemptResponse.json().auditEvents.length).toBeGreaterThan(0);
    expect(failedAttemptResponse.statusCode).toBe(200);
    expect(failedAttemptResponse.json()).toMatchObject({
      attemptRecord: {
        dryRunId,
        status: 'failed',
        processBoundaryInvoked: true,
        preflightStatus: 'passed',
        resultStatus: 'failed',
        resultErrorCode: 'boundary_failed',
        boundaryDiagnostics: {
          failureCode: 'process_exit_nonzero',
          startFailureKind: 'none',
          platform: 'win32',
          resolvedExecutableKind: 'native_exe',
          cwdHash: pilotWorktreeHash,
          cwdExists: true,
          cwdIsDirectory: true,
          executableExists: true,
          executableAccessible: true,
          envAllowlistKeyCount: 2,
          envAllowlistKeyHash: 'sha256:supervisor-test-env-keys',
          exitCode: 2,
          nonzeroExitKind: 'codex_cli_usage_error_suspected',
          timedOut: false,
          cancelled: false,
          stdoutHash: expect.stringMatching(/^sha256:/),
          stderrHash: expect.stringMatching(/^sha256:/),
          stdoutByteLength: expect.any(Number),
          stderrByteLength: expect.any(Number),
        },
        boundaryDiagnosticsComplete: true,
        boundaryDiagnosticsMissingFields: [],
        postRunVerificationStatus: 'skipped',
        postRunVerificationSkipReason: 'attempt_not_completed',
        workspaceMutationDetected: false,
        implementationApproved: false,
        processAdapterApproved: false,
        recommendationGrantsExecution: false,
        workspaceWriteAllowed: false,
        dangerFullAccessAllowed: false,
        dashboardTriggerAllowed: false,
      },
      summary: {
        boundaryDiagnosticsComplete: true,
        boundaryDiagnosticsMissingFields: [],
        boundaryDiagnostics: {
          failureCode: 'process_exit_nonzero',
          exitCode: 2,
          nonzeroExitKind: 'codex_cli_usage_error_suspected',
        },
      },
    });
    for (const response of [
      failedAttemptReadbackResponse,
      failedAttemptLatestResponse,
      failedAttemptTimelineResponse,
    ]) {
      expect(response.statusCode).toBe(200);
      expect(response.body).not.toContain('supervisor failed stdout must remain hashed');
      expect(response.body).not.toContain('supervisor failed stderr must remain hashed');
      expect(response.body).not.toContain(pilotWorktreePath);
      expect(response.body).not.toContain(resolvedExecutablePath);
      expect(response.body).not.toContain('C:/Windows');
      expect(response.body).not.toContain(governedInputText);
      expect(response.body).not.toContain(governedInputRelativePath);
      expect(response.body).not.toContain('"argv"');
      expect(response.body).not.toContain('"executablePath":');
    }
    expect(failedAttemptReadbackResponse.json()).toMatchObject({
      attemptRecord: {
        id: failedAttemptId,
        processBoundaryInvoked: true,
        boundaryDiagnostics: {
          failureCode: 'process_exit_nonzero',
          exitCode: 2,
          nonzeroExitKind: 'codex_cli_usage_error_suspected',
          startFailureKind: 'none',
          platform: 'win32',
          resolvedExecutableKind: 'native_exe',
          cwdHash: pilotWorktreeHash,
          cwdExists: true,
          cwdIsDirectory: true,
          executableExists: true,
          executableAccessible: true,
          envAllowlistKeyCount: 2,
          envAllowlistKeyHash: 'sha256:supervisor-test-env-keys',
          stdoutHash: expect.stringMatching(/^sha256:/),
          stderrHash: expect.stringMatching(/^sha256:/),
          stdoutByteLength: expect.any(Number),
          stderrByteLength: expect.any(Number),
          stdoutLineCount: expect.any(Number),
          stderrLineCount: expect.any(Number),
          stdoutTruncated: false,
          stderrTruncated: false,
        },
        boundaryDiagnosticsComplete: true,
        boundaryDiagnosticsMissingFields: [],
        postRunVerificationStatus: 'skipped',
        postRunVerificationSkipReason: 'attempt_not_completed',
      },
      summary: {
        boundaryDiagnosticsComplete: true,
        boundaryDiagnosticsMissingFields: [],
        boundaryDiagnostics: {
          failureCode: 'process_exit_nonzero',
          exitCode: 2,
          nonzeroExitKind: 'codex_cli_usage_error_suspected',
          startFailureKind: 'none',
          resolvedExecutableKind: 'native_exe',
          stdoutHash: expect.stringMatching(/^sha256:/),
          stderrHash: expect.stringMatching(/^sha256:/),
        },
        postRunVerificationSkipReason: 'attempt_not_completed',
      },
    });
    expect(failedAttemptLatestResponse.json().attemptRecord.id).toBe(failedAttemptId);
    expect(failedAttemptLatestResponse.json().attemptRecord.boundaryDiagnostics.failureCode).toBe(
      'process_exit_nonzero',
    );
    expect(failedAttemptLatestResponse.json().attemptRecord.boundaryDiagnosticsComplete).toBe(true);
    expect(failedAttemptTimelineResponse.json().timeline.entries[0]).toMatchObject({
      attemptId: failedAttemptId,
      processBoundaryInvoked: true,
      boundaryDiagnosticsComplete: true,
      boundaryDiagnosticsMissingFields: [],
      boundaryDiagnostics: {
        failureCode: 'process_exit_nonzero',
        exitCode: 2,
        nonzeroExitKind: 'codex_cli_usage_error_suspected',
        startFailureKind: 'none',
        resolvedExecutableKind: 'native_exe',
      },
      postRunVerificationStatus: 'skipped',
      postRunVerificationSkipReason: 'attempt_not_completed',
    });
    expect(failedAttemptResponse.body).not.toContain('supervisor failed stdout must remain hashed');
    expect(failedAttemptResponse.body).not.toContain('supervisor failed stderr must remain hashed');
    expect(failedAttemptResponse.body).not.toContain(pilotWorktreePath);
    expect(failedAttemptResponse.body).not.toContain(resolvedExecutablePath);
    expect(failedAttemptResponse.body).not.toContain('C:/Windows');
    expect(failedAttemptResponse.body).not.toContain(governedInputText);
    expect(failedAttemptResponse.body).not.toContain(governedInputRelativePath);
    expect(failedAttemptResponse.body).not.toContain('"argv"');
    expect(failedAttemptResponse.body).not.toContain('"executablePath":');
    expect(attemptBodyText).not.toContain(pilotWorktreePath);
    expect(attemptBodyText).not.toContain(resolvedExecutablePath);
    expect(attemptBodyText).not.toContain('C:/Windows');
    expect(attemptBodyText).not.toContain(governedInputText);
    expect(attemptBodyText).not.toContain(governedInputRelativePath);
    expect(attemptBodyText).not.toContain('"argv"');
    expect(attemptBodyText).not.toContain('"executablePath":');
    expect(mismatchResponse.statusCode).toBe(200);
    expect(mismatchResponse.json().attemptRecord.status).toBe('blocked');
    expect(mismatchResponse.json().attemptRecord.processBoundaryInvoked).toBe(false);
    expect(mismatchResponse.json().attemptRecord.failedCheckCodes).toContain(
      'isolated_worktree_clean',
    );
    expect(mismatchResponse.body).not.toContain(join(dir, 'different-worktree'));
    expect(mismatchResponse.body).not.toContain(governedInputText);
    expect(mismatchResponse.body).not.toContain(governedInputRelativePath);
    expect(missingGovernedInputResponse.statusCode).toBe(200);
    expect(missingGovernedInputResponse.json()).toMatchObject({
      attemptRecord: {
        dryRunId,
        status: 'blocked',
        processBoundaryInvoked: false,
        resultErrorCode: 'governed_input_missing',
        failedCheckCodes: ['governed_input_verified'],
        metadata: {
          governedInputProvided: false,
          governedInputVerified: false,
          governedInputReasonCode: 'governed_input_missing',
          governedInputBodyStored: false,
          promptArgumentStored: false,
        },
      },
    });
    expect(missingGovernedInputResponse.body).not.toContain(governedInputText);
    expect(missingGovernedInputResponse.body).not.toContain(governedInputRelativePath);
    expect(missingGovernedInputResponse.body).not.toContain('"argv"');
    expect(blockedExecutableResponse.statusCode).toBe(200);
    expect(blockedExecutableResponse.json()).toMatchObject({
      attemptRecord: {
        dryRunId,
        status: 'blocked',
        processBoundaryInvoked: false,
        preflightStatus: 'passed',
        resultStatus: 'not_started',
        resultErrorCode: 'boundary_deferred',
        boundaryDeferredReasonCode: 'executable_resolution_blocked',
        boundaryDeferredReasonCodes: ['executable_resolution_blocked'],
        boundaryDeferredDiagnostics: {
          reasonCode: 'executable_resolution_blocked',
          executableResolutionStatus: 'blocked',
          executableResolutionReasonCode: 'executable_requires_shell',
          cwdSelfCheckStatus: 'passed',
          processBoundaryReady: false,
        },
        metadata: {
          executableResolutionStatus: 'blocked',
          executableResolutionReasonCode: 'executable_requires_shell',
          executableResolvedKind: 'shell_shim',
          executableExists: true,
          executableAccessible: false,
          executablePathStored: false,
          envPlanStored: false,
          argvStored: false,
        },
      },
    });
    expect(blockedExecutableResponse.body).not.toContain(pilotWorktreePath);
    expect(blockedExecutableResponse.body).not.toContain(governedInputText);
    expect(blockedExecutableResponse.body).not.toContain(governedInputRelativePath);
    expect(blockedExecutableResponse.body).not.toContain('"executablePath":');
    expect(blockedExecutableResponse.body).not.toContain('"argv"');
    for (const response of [
      blockedExecutableReadbackResponse,
      blockedExecutableLatestResponse,
      blockedExecutableListResponse,
      blockedExecutableTimelineResponse,
    ]) {
      expect(response.statusCode).toBe(200);
      expect(response.body).not.toContain(pilotWorktreePath);
      expect(response.body).not.toContain(resolvedExecutablePath);
      expect(response.body).not.toContain('C:/Windows');
      expect(response.body).not.toContain(governedInputText);
      expect(response.body).not.toContain(governedInputRelativePath);
      expect(response.body).not.toContain('"executablePath":');
      expect(response.body).not.toContain('"argv"');
      expect(response.body).not.toContain('"env"');
    }
    expect(blockedExecutableReadbackResponse.json()).toMatchObject({
      attemptRecord: {
        id: blockedExecutableAttemptId,
        boundaryDeferredReasonCode: 'executable_resolution_blocked',
        boundaryDeferredReasonCodes: ['executable_resolution_blocked'],
        boundaryDeferredDiagnostics: {
          reasonCode: 'executable_resolution_blocked',
          executableResolutionStatus: 'blocked',
          executableResolutionReasonCode: 'executable_requires_shell',
          cwdSelfCheckStatus: 'passed',
          processBoundaryReady: false,
        },
      },
      summary: {
        boundaryDeferredReasonCode: 'executable_resolution_blocked',
        boundaryDeferredDiagnostics: {
          executableResolutionStatus: 'blocked',
          executableResolutionReasonCode: 'executable_requires_shell',
        },
      },
    });
    expect(blockedExecutableLatestResponse.json().attemptRecord.id).toBe(
      blockedExecutableAttemptId,
    );
    expect(blockedExecutableLatestResponse.json().attemptRecord.boundaryDeferredReasonCode).toBe(
      'executable_resolution_blocked',
    );
    expect(blockedExecutableListResponse.json().summaries[0]).toMatchObject({
      attemptId: blockedExecutableAttemptId,
      boundaryDeferredReasonCode: 'executable_resolution_blocked',
      boundaryDeferredDiagnostics: {
        executableResolutionStatus: 'blocked',
        executableResolutionReasonCode: 'executable_requires_shell',
      },
    });
    expect(blockedExecutableTimelineResponse.json().timeline.entries[0]).toMatchObject({
      attemptId: blockedExecutableAttemptId,
      boundaryDeferredReasonCode: 'executable_resolution_blocked',
      boundaryDeferredReasonCodes: ['executable_resolution_blocked'],
      boundaryDeferredDiagnostics: {
        executableResolutionStatus: 'blocked',
        executableResolutionReasonCode: 'executable_requires_shell',
        cwdSelfCheckStatus: 'passed',
        processBoundaryReady: false,
      },
    });
  });

  it('records pilot prerequisite readiness without running a pilot or storing raw worktree paths', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'codexhub-supervisor-pilot-prereq-'));
    const store = await createSqliteStore({ dbPath: join(dir, 'codexhub.sqlite') });
    const defaultConfigLoadResult = createDefaultCodexExecConfigLoadResult();
    const server = buildSupervisorServer({
      store,
      configLoadResult: {
        ...defaultConfigLoadResult,
        source: 'file',
        status: 'loaded',
        summary: 'Loaded explicit test config for pilot prerequisite inspection',
        config: {
          ...defaultConfigLoadResult.config,
          liveEnabled: true,
          configSource: 'file',
        },
      },
    });

    const dryRunResponse = await server.inject({
      method: 'POST',
      headers: localControlHeaders,
      url: '/api/codex/exec/dry-run',
      payload: {
        title: 'Pilot prerequisite dry-run fixture',
        prompt: 'Summarize repository structure',
        cwd: '.',
        sandboxMode: 'read_only',
        approvalMode: 'required',
      },
    });
    const dryRunId = dryRunResponse.json().liveRunRecord.id as string;
    const blockedResponse = await server.inject({
      method: 'POST',
      headers: localControlHeaders,
      url: '/api/codex/exec/real-read-only-adapter/pilot-prerequisites',
      payload: { dryRunId },
    });
    const policySourceResponse = await server.inject({
      method: 'POST',
      headers: localControlHeaders,
      url: '/api/codex/exec/real-read-only-adapter/policy-sources',
      payload: { dryRunId },
    });
    const policySourceRecordId = policySourceResponse.json().recordId as string;
    const policySourceGetResponse = await server.inject({
      method: 'GET',
      url: `/api/codex/exec/real-read-only-adapter/policy-sources/${policySourceRecordId}`,
    });
    const policySourceListResponse = await server.inject({
      method: 'GET',
      url: `/api/codex/exec/real-read-only-adapter/policy-sources?dryRunId=${dryRunId}&status=aligned&limit=10`,
    });
    const policySourceLatestResponse = await server.inject({
      method: 'GET',
      url: `/api/codex/exec/real-read-only-adapter/policy-source/latest/${dryRunId}`,
    });
    const approvalRequestResponse = await server.inject({
      method: 'POST',
      headers: localControlHeaders,
      url: '/api/codex/exec/approval-request',
      payload: {
        dryRunId,
        policySourceId: policySourceRecordId,
        requestedBy: 'local-operator',
        reason: 'Pilot prerequisite verification fixture',
      },
    });
    const approvalResponse = await server.inject({
      method: 'POST',
      headers: localControlHeaders,
      url: '/api/codex/exec/manual-approval',
      payload: {
        dryRunId,
        approvalRequestId: approvalRequestResponse.json().approvalRequest.id,
        outcome: 'approved',
        reason: 'Pilot prerequisite verification fixture',
      },
    });
    const approvalArtifactId = approvalResponse.json().approvalArtifact.id as string;
    const sourcePreparationResponse = await server.inject({
      method: 'POST',
      headers: localControlHeaders,
      url: '/api/codex/exec/real-read-only-adapter/pilot-prerequisite-sources',
      payload: {
        dryRunId,
        approvalArtifactId,
        worktreeLabel: 'isolated-clean-fixture',
        worktreeStatus: 'clean',
        worktreePathHash: 'sha256:isolated-clean-worktree',
      },
    });
    const sourcePreparationRecordId = sourcePreparationResponse.json().recordId as string;
    const sourcePreparationGetResponse = await server.inject({
      method: 'GET',
      url: `/api/codex/exec/real-read-only-adapter/pilot-prerequisite-sources/${sourcePreparationRecordId}`,
    });
    const sourcePreparationListResponse = await server.inject({
      method: 'GET',
      url: `/api/codex/exec/real-read-only-adapter/pilot-prerequisite-sources?dryRunId=${dryRunId}&status=prepared&limit=10`,
    });
    const sourcePreparationLatestResponse = await server.inject({
      method: 'GET',
      url: `/api/codex/exec/real-read-only-adapter/pilot-prerequisite-source/latest/${dryRunId}`,
    });
    const sourcePreparationRawPathResponse = await server.inject({
      method: 'POST',
      headers: localControlHeaders,
      url: '/api/codex/exec/real-read-only-adapter/pilot-prerequisite-sources',
      payload: {
        dryRunId,
        worktreePath: 'C:/safe/worktree',
      },
    });
    const readyResponse = await server.inject({
      method: 'POST',
      headers: localControlHeaders,
      url: '/api/codex/exec/real-read-only-adapter/pilot-prerequisites',
      payload: {
        dryRunId,
        approvalArtifactId,
        worktreeLabel: 'isolated-clean-fixture',
        worktreeStatus: 'clean',
        worktreePathHash: 'sha256:isolated-clean-worktree',
        handoffContextComplete: true,
      },
    });
    const approvalAuthorityTraceResponse = await server.inject({
      method: 'POST',
      headers: localControlHeaders,
      url: '/api/codex/exec/real-read-only-adapter/approval-authority-traces',
      payload: {
        dryRunId,
        approvalArtifactId,
      },
    });
    const approvalAuthorityTraceRecordId = approvalAuthorityTraceResponse.json().recordId as string;
    const approvalAuthorityTraceGetResponse = await server.inject({
      method: 'GET',
      url: `/api/codex/exec/real-read-only-adapter/approval-authority-traces/${approvalAuthorityTraceRecordId}`,
    });
    const approvalAuthorityTraceListResponse = await server.inject({
      method: 'GET',
      url: `/api/codex/exec/real-read-only-adapter/approval-authority-traces?dryRunId=${dryRunId}&status=aligned&limit=10`,
    });
    const approvalAuthorityTraceLatestResponse = await server.inject({
      method: 'GET',
      url: `/api/codex/exec/real-read-only-adapter/approval-authority-trace/latest/${dryRunId}`,
    });
    const recordId = readyResponse.json().recordId as string;
    const getResponse = await server.inject({
      method: 'GET',
      url: `/api/codex/exec/real-read-only-adapter/pilot-prerequisites/${recordId}`,
    });
    const listResponse = await server.inject({
      method: 'GET',
      url: `/api/codex/exec/real-read-only-adapter/pilot-prerequisites?dryRunId=${dryRunId}&status=ready_for_pilot_retry&limit=10`,
    });
    const latestResponse = await server.inject({
      method: 'GET',
      url: `/api/codex/exec/real-read-only-adapter/pilot-prerequisite/latest/${dryRunId}`,
    });
    const rawPathResponse = await server.inject({
      method: 'POST',
      headers: localControlHeaders,
      url: '/api/codex/exec/real-read-only-adapter/pilot-prerequisites',
      payload: {
        dryRunId,
        worktreePath: 'C:/safe/worktree',
      },
    });
    const invalidQueryResponse = await server.inject({
      method: 'GET',
      url: '/api/codex/exec/real-read-only-adapter/pilot-prerequisites?status=pilot_passed',
    });
    const missingBodyResponse = await server.inject({
      method: 'POST',
      headers: localControlHeaders,
      url: '/api/codex/exec/real-read-only-adapter/pilot-prerequisites',
      payload: {},
    });
    const disabledStoreServer = buildSupervisorServer({ disableStore: true });
    const disabledStoreSourceResponse = await disabledStoreServer.inject({
      method: 'POST',
      headers: localControlHeaders,
      url: '/api/codex/exec/real-read-only-adapter/pilot-prerequisite-sources',
      payload: { dryRunId },
    });
    const disabledStoreApprovalTraceResponse = await disabledStoreServer.inject({
      method: 'POST',
      headers: localControlHeaders,
      url: '/api/codex/exec/real-read-only-adapter/approval-authority-traces',
      payload: { dryRunId, approvalArtifactId },
    });
    const disabledStoreResponse = await disabledStoreServer.inject({
      method: 'POST',
      headers: localControlHeaders,
      url: '/api/codex/exec/real-read-only-adapter/pilot-prerequisites',
      payload: { dryRunId },
    });

    await disabledStoreServer.close();
    await server.close();
    await store.close();

    expect(blockedResponse.statusCode).toBe(200);
    expect(blockedResponse.json()).toMatchObject({
      status: 'blocked',
      validUnusedApprovalPresent: false,
      isolatedCleanWorktreeMetadataPresent: false,
      authoritativePolicySourcePresent: false,
      authoritativeSourcePreparationPresent: false,
      authoritativeAttemptEvidencePresent: false,
      fallbackUsedAsAuthority: false,
      pilotExecuted: false,
      adapterAttemptInvoked: false,
    });
    expect(policySourceResponse.statusCode).toBe(200);
    expect(policySourceResponse.json()).toMatchObject({
      recordId: policySourceRecordId,
      dryRunId,
      status: 'aligned',
      degraded: false,
      notPersisted: false,
      configExplicitlyEnabled: true,
      readOnlyOnly: true,
      policyDecisionAllowsPilot: true,
      evidenceAuditReady: true,
      fallbackUsedAsAuthority: false,
      pilotExecuted: false,
      adapterAttemptInvoked: false,
      workspaceWriteAllowed: false,
      dangerFullAccessAllowed: false,
      dashboardTriggerAllowed: false,
    });
    expect(policySourceGetResponse.statusCode).toBe(200);
    expect(policySourceGetResponse.json().recordId).toBe(policySourceRecordId);
    expect(policySourceListResponse.statusCode).toBe(200);
    expect(policySourceListResponse.json().summaries).toHaveLength(1);
    expect(policySourceLatestResponse.statusCode).toBe(200);
    expect(policySourceLatestResponse.json().recordId).toBe(policySourceRecordId);
    expect(approvalRequestResponse.statusCode).toBe(200);
    expect(approvalResponse.statusCode).toBe(200);
    expect(sourcePreparationResponse.statusCode).toBe(200);
    expect(sourcePreparationResponse.json()).toMatchObject({
      recordId: sourcePreparationRecordId,
      dryRunId,
      status: 'prepared',
      degraded: false,
      notPersisted: false,
      configExplicitlyEnabled: true,
      authoritativePolicySourcePresent: true,
      validUnusedApprovalPresent: true,
      isolatedCleanWorktreeMetadataPresent: true,
      evidenceAuditReady: true,
      fallbackUsedAsAuthority: false,
      pilotExecuted: false,
      adapterAttemptInvoked: false,
      workspaceWriteAllowed: false,
      dangerFullAccessAllowed: false,
      dashboardTriggerAllowed: false,
    });
    expect(sourcePreparationResponse.json().evidenceRefs.length).toBeGreaterThan(0);
    expect(sourcePreparationResponse.json().auditEvents.length).toBeGreaterThan(0);
    expect(sourcePreparationGetResponse.statusCode).toBe(200);
    expect(sourcePreparationGetResponse.json().recordId).toBe(sourcePreparationRecordId);
    expect(sourcePreparationListResponse.statusCode).toBe(200);
    expect(sourcePreparationListResponse.json().summaries).toHaveLength(1);
    expect(sourcePreparationLatestResponse.statusCode).toBe(200);
    expect(sourcePreparationLatestResponse.json().recordId).toBe(sourcePreparationRecordId);
    expect(sourcePreparationRawPathResponse.statusCode).toBe(400);
    expect(sourcePreparationRawPathResponse.body).not.toContain('C:/safe/worktree');
    expect(readyResponse.statusCode).toBe(200);
    expect(readyResponse.json()).toMatchObject({
      recordId,
      dryRunId,
      status: 'ready_for_pilot_retry',
      degraded: false,
      notPersisted: false,
      configExplicitlyEnabled: true,
      authoritativePolicySourcePresent: true,
      validUnusedApprovalPresent: true,
      isolatedCleanWorktreeMetadataPresent: true,
      authoritativeSourcePreparationPresent: true,
      authoritativeAttemptEvidencePresent: false,
      evidenceAuditReady: true,
      fallbackUsedAsAuthority: false,
      pilotExecuted: false,
      adapterAttemptInvoked: false,
      workspaceWriteAllowed: false,
      dangerFullAccessAllowed: false,
      dashboardTriggerAllowed: false,
    });
    expect(readyResponse.json().hardGateCount).toBeGreaterThan(0);
    expect(readyResponse.json().blockedGateCount).toBe(0);
    expect(readyResponse.json().evidenceRefs.length).toBeGreaterThan(0);
    expect(readyResponse.json().auditEvents.length).toBeGreaterThan(0);
    expect(approvalAuthorityTraceResponse.statusCode).toBe(200);
    expect(approvalAuthorityTraceResponse.json()).toMatchObject({
      recordId: approvalAuthorityTraceRecordId,
      dryRunId,
      status: 'aligned',
      degraded: false,
      notPersisted: false,
      exactLookupMatched: true,
      sourcePreparationMatched: true,
      prerequisiteMatched: true,
      dryRunHashMatched: true,
      policyHashMatched: true,
      approvalApproved: true,
      approvalUnused: true,
      approvalNotRevoked: true,
      approvalNotExpired: true,
      attemptPreflightWouldAccept: true,
      fallbackUsedAsAuthority: false,
      pilotExecuted: false,
      adapterAttemptInvoked: false,
      workspaceWriteAllowed: false,
      dangerFullAccessAllowed: false,
      dashboardTriggerAllowed: false,
    });
    expect(approvalAuthorityTraceGetResponse.statusCode).toBe(200);
    expect(approvalAuthorityTraceGetResponse.json().recordId).toBe(approvalAuthorityTraceRecordId);
    expect(approvalAuthorityTraceListResponse.statusCode).toBe(200);
    expect(approvalAuthorityTraceListResponse.json().summaries).toHaveLength(1);
    expect(approvalAuthorityTraceLatestResponse.statusCode).toBe(200);
    expect(approvalAuthorityTraceLatestResponse.json().recordId).toBe(
      approvalAuthorityTraceRecordId,
    );
    expect(getResponse.statusCode).toBe(200);
    expect(getResponse.json().recordId).toBe(recordId);
    expect(listResponse.statusCode).toBe(200);
    expect(listResponse.json().summaries).toHaveLength(1);
    expect(latestResponse.statusCode).toBe(200);
    expect(latestResponse.json().recordId).toBe(recordId);
    expect(rawPathResponse.statusCode).toBe(400);
    expect(rawPathResponse.body).not.toContain('C:/safe/worktree');
    expect(invalidQueryResponse.statusCode).toBe(400);
    expect(missingBodyResponse.statusCode).toBe(400);
    expect(disabledStoreSourceResponse.statusCode).toBe(503);
    expect(disabledStoreSourceResponse.json()).toMatchObject({
      status: 'blocked',
      authoritative: false,
      supervisorBacked: false,
      persisted: false,
      degraded: true,
      notPersisted: true,
      configExplicitlyEnabled: false,
      authoritativePolicySourcePresent: false,
      validUnusedApprovalPresent: false,
      isolatedCleanWorktreeMetadataPresent: false,
      evidenceAuditReady: false,
      fallbackUsedAsAuthority: false,
      pilotExecuted: false,
      adapterAttemptInvoked: false,
    });
    expect(disabledStoreApprovalTraceResponse.statusCode).toBe(503);
    expect(disabledStoreApprovalTraceResponse.json()).toMatchObject({
      status: 'blocked',
      authoritative: false,
      supervisorBacked: false,
      persisted: false,
      degraded: true,
      notPersisted: true,
      attemptPreflightWouldAccept: false,
      fallbackUsedAsAuthority: false,
      pilotExecuted: false,
      adapterAttemptInvoked: false,
    });
    expect(disabledStoreResponse.statusCode).toBe(503);
    expect(disabledStoreResponse.json()).toMatchObject({
      status: 'blocked',
      authoritative: false,
      supervisorBacked: false,
      persisted: false,
      degraded: true,
      notPersisted: true,
      configExplicitlyEnabled: false,
      validUnusedApprovalPresent: false,
      isolatedCleanWorktreeMetadataPresent: false,
      authoritativeSourcePreparationPresent: false,
      authoritativeAttemptEvidencePresent: false,
      evidenceAuditReady: false,
      fallbackUsedAsAuthority: false,
      pilotExecuted: false,
      adapterAttemptInvoked: false,
    });
    expect(JSON.stringify(sourcePreparationResponse.json())).not.toContain('C:/safe/worktree');
    expect(JSON.stringify(sourcePreparationResponse.json())).not.toContain('raw prompt body');
    expect(JSON.stringify(sourcePreparationResponse.json())).not.toContain('raw command body');
    expect(JSON.stringify(sourcePreparationResponse.json())).not.toContain('raw stdout body');
    expect(JSON.stringify(sourcePreparationResponse.json())).not.toContain('raw stderr body');
    expect(JSON.stringify(sourcePreparationResponse.json())).not.toContain('"argv"');
    expect(JSON.stringify(sourcePreparationResponse.json())).not.toContain('"executablePath":');
    expect(JSON.stringify(readyResponse.json())).not.toContain('C:/safe/worktree');
    expect(JSON.stringify(readyResponse.json())).not.toContain('raw prompt body');
    expect(JSON.stringify(readyResponse.json())).not.toContain('raw command body');
    expect(JSON.stringify(readyResponse.json())).not.toContain('raw stdout body');
    expect(JSON.stringify(readyResponse.json())).not.toContain('raw stderr body');
    expect(JSON.stringify(readyResponse.json())).not.toContain('"argv"');
    expect(JSON.stringify(readyResponse.json())).not.toContain('"executablePath":');
    expect(JSON.stringify(approvalAuthorityTraceResponse.json())).not.toContain('C:/safe/worktree');
    expect(JSON.stringify(approvalAuthorityTraceResponse.json())).not.toContain('raw prompt body');
    expect(JSON.stringify(approvalAuthorityTraceResponse.json())).not.toContain('raw command body');
    expect(JSON.stringify(approvalAuthorityTraceResponse.json())).not.toContain('raw stdout body');
    expect(JSON.stringify(approvalAuthorityTraceResponse.json())).not.toContain('raw stderr body');
    expect(JSON.stringify(approvalAuthorityTraceResponse.json())).not.toContain('"argv"');
    expect(JSON.stringify(approvalAuthorityTraceResponse.json())).not.toContain(
      '"executablePath":',
    );
    expect(readyResponse.body).not.toContain(process.cwd());
  });

  it('binds approval requests to policy sources prepared with a dry-run plan id', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'codexhub-supervisor-policy-source-plan-id-'));
    const store = await createSqliteStore({ dbPath: join(dir, 'codexhub.sqlite') });
    const defaultConfigLoadResult = createDefaultCodexExecConfigLoadResult();
    const server = buildSupervisorServer({
      store,
      configLoadResult: {
        ...defaultConfigLoadResult,
        source: 'file',
        status: 'loaded',
        summary: 'Loaded explicit test config for policy source approval binding',
        config: {
          ...defaultConfigLoadResult.config,
          liveEnabled: true,
          configSource: 'file',
        },
      },
    });

    const dryRunResponse = await server.inject({
      method: 'POST',
      headers: localControlHeaders,
      url: '/api/codex/exec/dry-run',
      payload: {
        title: 'Policy source approval binding fixture',
        prompt: 'Summarize repository structure',
        cwd: '.',
        sandboxMode: 'read_only',
        approvalMode: 'required',
      },
    });
    const dryRunPlanId = dryRunResponse.json().liveRunRecord.dryRunPlanId as string;
    const policySourceResponse = await server.inject({
      method: 'POST',
      headers: localControlHeaders,
      url: '/api/codex/exec/real-read-only-adapter/policy-sources',
      payload: { dryRunId: dryRunPlanId },
    });
    const policySourceRecordId = policySourceResponse.json().recordId as string;
    const approvalRequestResponse = await server.inject({
      method: 'POST',
      headers: localControlHeaders,
      url: '/api/codex/exec/approval-request',
      payload: {
        dryRunId: dryRunPlanId,
        policySourceId: policySourceRecordId,
        requestedBy: 'local-operator',
        reason: 'Policy source approval binding fixture',
      },
    });

    await server.close();
    await store.close();

    expect(policySourceResponse.statusCode).toBe(200);
    expect(policySourceResponse.json()).toMatchObject({
      dryRunId: dryRunPlanId,
      status: 'aligned',
      degraded: false,
      notPersisted: false,
      fallbackUsedAsAuthority: false,
    });
    expect(approvalRequestResponse.statusCode).toBe(200);
    expect(approvalRequestResponse.json().approvalRequest).toMatchObject({
      dryRunPlanId,
      policyDecisionHash: policySourceResponse.json().policyDecisionHash,
    });
    expect(approvalRequestResponse.body).not.toContain('policy source is not aligned');
  });
});

describe('supervisor local review package control plane', () => {
  it('requires stored approval and hash-bound runtime input before local artifact export', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'codexhub-review-package-store-'));
    const workspaceRoot = mkdtempSync(join(tmpdir(), 'codexhub-review-package-workspace-'));
    const artifactRoot = resolve(workspaceRoot, '..', 'CodexHub-artifacts');
    const store = await createSqliteStore({ dbPath: join(dir, 'codexhub.sqlite') });
    const server = buildSupervisorServer({
      store,
      reviewPackageExportEnabled: true,
      localControlKey: localControlToken,
    });

    const dryRunResponse = await server.inject({
      method: 'POST',
      url: '/api/review-packages/dry-runs',
      headers: localControlHeaders,
      payload: {
        sourceLifecycleRunId: 'm12_lifecycle_review_export',
        sourcePatchRunId: 'm12_patch_review_export',
        changedFilePathHashes: ['sha256:file'],
        diffHash: 'sha256:diff',
        verificationStatus: 'passed',
        readinessStatus: 'ready_for_review_draft_only',
        readyForReviewDraftOnly: true,
        packageId: 'review-package-control-plane',
        workspaceRoot,
      },
    });
    const dryRun = dryRunResponse.json();
    const approvalRequestResponse = await server.inject({
      method: 'POST',
      url: '/api/review-packages/approval-requests',
      headers: localControlHeaders,
      payload: {
        dryRunId: dryRun.dryRunId,
        reason: 'request local review package export',
      },
    });
    const approvalRequest = approvalRequestResponse.json();
    const approvalResponse = await server.inject({
      method: 'POST',
      url: '/api/review-packages/manual-approvals',
      headers: localControlHeaders,
      payload: {
        dryRunId: dryRun.dryRunId,
        approvalRequestId: approvalRequest.approvalRequestId,
        outcome: 'approved',
        reason: 'approve local review package export',
      },
    });
    const approval = approvalResponse.json();
    const blockedMismatchResponse = await server.inject({
      method: 'POST',
      url: '/api/review-packages/runs',
      headers: localControlHeaders,
      payload: {
        dryRunId: dryRun.dryRunId,
        approvalArtifactId: approval.approvalArtifactId,
        workspaceRoot,
        packageId: 'different-review-package',
      },
    });
    const completedResponse = await server.inject({
      method: 'POST',
      url: '/api/review-packages/runs',
      headers: localControlHeaders,
      payload: {
        dryRunId: dryRun.dryRunId,
        approvalArtifactId: approval.approvalArtifactId,
        workspaceRoot,
        packageId: 'review-package-control-plane',
      },
    });
    const completed = completedResponse.json();

    await server.close();
    await store.close();
    rmSync(dir, { recursive: true, force: true });
    rmSync(workspaceRoot, { recursive: true, force: true });
    rmSync(artifactRoot, { recursive: true, force: true });

    expect(dryRunResponse.statusCode).toBe(200);
    expect(dryRun.status).toBe('planned');
    expect(approvalResponse.statusCode).toBe(200);
    expect(blockedMismatchResponse.statusCode).toBe(200);
    expect(blockedMismatchResponse.json()).toMatchObject({
      status: 'blocked',
      artifactWriteBoundaryInvoked: false,
    });
    expect(completedResponse.statusCode).toBe(200);
    expect(completed.status).toBe('completed');
    expect(completed.artifactWriteBoundaryInvoked).toBe(true);
    expect(completed.bodyStored).toBe(false);
    expect(completed.rawPathStored).toBe(false);
    expect(completedResponse.body).not.toContain(workspaceRoot);
    expect(completedResponse.body).not.toContain('diff --git');
    expect(completedResponse.body).not.toContain('pull request body');
  });

  it('rejects request-body authority and raw review package bodies', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'codexhub-review-package-guard-'));
    const store = await createSqliteStore({ dbPath: join(dir, 'codexhub.sqlite') });
    const server = buildSupervisorServer({
      store,
      localControlKey: localControlToken,
    });

    const authorityResponse = await server.inject({
      method: 'POST',
      url: '/api/review-packages/dry-runs',
      headers: localControlHeaders,
      payload: {
        authority: { allowed: true },
      },
    });
    const rawBodyResponse = await server.inject({
      method: 'POST',
      url: '/api/review-packages/dry-runs',
      headers: localControlHeaders,
      payload: {
        sourceLifecycleRunId: 'm12_lifecycle_raw',
        sourcePatchRunId: 'm12_patch_raw',
        rawDiff: 'diff --git private',
      },
    });

    await server.close();
    await store.close();
    rmSync(dir, { recursive: true, force: true });

    expect(authorityResponse.statusCode).toBe(400);
    expect(authorityResponse.json()).toMatchObject({
      error: 'untrusted_review_package_authority_body',
      artifactWriteBoundaryInvoked: false,
    });
    expect(rawBodyResponse.statusCode).toBe(400);
    expect(rawBodyResponse.json()).toMatchObject({
      error: 'forbidden_review_package_raw_body',
      artifactWriteBoundaryInvoked: false,
    });
    expect(rawBodyResponse.body).not.toContain('diff --git private');
  });
});

describe('supervisor local release candidate control plane', () => {
  it('requires stored approval and hash-bound runtime input before local RC export', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'codexhub-release-candidate-store-'));
    const workspaceRoot = mkdtempSync(join(tmpdir(), 'codexhub-release-candidate-workspace-'));
    const artifactRoot = resolve(workspaceRoot, '..', 'CodexHub-artifacts');
    const store = await createSqliteStore({ dbPath: join(dir, 'codexhub.sqlite') });
    const server = buildSupervisorServer({
      store,
      releaseCandidateExportEnabled: true,
      localControlKey: localControlToken,
    });

    const dryRunResponse = await server.inject({
      method: 'POST',
      url: '/api/release-candidates/dry-runs',
      headers: localControlHeaders,
      payload: {
        sourceLifecycleRunId: 'm12_lifecycle_rc_export',
        sourcePatchRunId: 'm12_patch_rc_export',
        changedFilePathHashes: ['sha256:file'],
        diffHash: 'sha256:diff',
        verificationStatus: 'passed',
        readinessStatus: 'ready_for_review_draft_only',
        readyForReviewDraftOnly: true,
        reviewDecisionStatus: 'approved_for_local_rc',
        operatorReadinessStatus: 'pass',
        bundleId: 'rc-bundle-control-plane',
        workspaceRoot,
      },
    });
    const dryRun = dryRunResponse.json();
    const approvalRequestResponse = await server.inject({
      method: 'POST',
      url: '/api/release-candidates/approval-requests',
      headers: localControlHeaders,
      payload: {
        dryRunId: dryRun.dryRunId,
        reason: 'request local release candidate export',
      },
    });
    const approvalRequest = approvalRequestResponse.json();
    const approvalResponse = await server.inject({
      method: 'POST',
      url: '/api/release-candidates/manual-approvals',
      headers: localControlHeaders,
      payload: {
        dryRunId: dryRun.dryRunId,
        approvalRequestId: approvalRequest.approvalRequestId,
        outcome: 'approved',
        reason: 'approve local release candidate export',
      },
    });
    const approval = approvalResponse.json();
    const blockedMismatchResponse = await server.inject({
      method: 'POST',
      url: '/api/release-candidates/runs',
      headers: localControlHeaders,
      payload: {
        dryRunId: dryRun.dryRunId,
        approvalArtifactId: approval.approvalArtifactId,
        workspaceRoot,
        bundleId: 'different-rc-bundle',
      },
    });
    const completedResponse = await server.inject({
      method: 'POST',
      url: '/api/release-candidates/runs',
      headers: localControlHeaders,
      payload: {
        dryRunId: dryRun.dryRunId,
        approvalArtifactId: approval.approvalArtifactId,
        workspaceRoot,
        bundleId: 'rc-bundle-control-plane',
      },
    });
    const completed = completedResponse.json();

    await server.close();
    await store.close();
    rmSync(dir, { recursive: true, force: true });
    rmSync(workspaceRoot, { recursive: true, force: true });
    rmSync(artifactRoot, { recursive: true, force: true });

    expect(dryRunResponse.statusCode).toBe(200);
    expect(dryRun.status).toBe('planned');
    expect(approvalResponse.statusCode).toBe(200);
    expect(blockedMismatchResponse.statusCode).toBe(200);
    expect(blockedMismatchResponse.json()).toMatchObject({
      status: 'blocked',
      artifactWriteBoundaryInvoked: false,
    });
    expect(completedResponse.statusCode).toBe(200);
    expect(completed.status).toBe('completed');
    expect(completed.artifactWriteBoundaryInvoked).toBe(true);
    expect(completed.bodyStored).toBe(false);
    expect(completed.rawPathStored).toBe(false);
    expect(completedResponse.body).not.toContain(workspaceRoot);
    expect(completedResponse.body).not.toContain('diff --git');
    expect(completedResponse.body).not.toContain('pull request body');
  });

  it('rejects request-body authority and raw release candidate bodies', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'codexhub-release-candidate-guard-'));
    const store = await createSqliteStore({ dbPath: join(dir, 'codexhub.sqlite') });
    const server = buildSupervisorServer({
      store,
      localControlKey: localControlToken,
    });

    const authorityResponse = await server.inject({
      method: 'POST',
      url: '/api/release-candidates/dry-runs',
      headers: localControlHeaders,
      payload: {
        authority: { allowed: true },
      },
    });
    const rawBodyResponse = await server.inject({
      method: 'POST',
      url: '/api/release-candidates/dry-runs',
      headers: localControlHeaders,
      payload: {
        sourceLifecycleRunId: 'm12_lifecycle_raw',
        sourcePatchRunId: 'm12_patch_raw',
        rawPrBody: 'pull request body',
      },
    });

    await server.close();
    await store.close();
    rmSync(dir, { recursive: true, force: true });

    expect(authorityResponse.statusCode).toBe(400);
    expect(authorityResponse.json()).toMatchObject({
      error: 'untrusted_release_candidate_authority_body',
      artifactWriteBoundaryInvoked: false,
    });
    expect(rawBodyResponse.statusCode).toBe(400);
    expect(rawBodyResponse.json()).toMatchObject({
      error: 'forbidden_release_candidate_raw_body',
      artifactWriteBoundaryInvoked: false,
    });
    expect(rawBodyResponse.body).not.toContain('pull request body');
  });
});

describe('supervisor GitHub metadata control plane', () => {
  it('requires token/origin gate, persisted approval, and hash-bound metadata runtime input', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'codexhub-github-metadata-store-'));
    const store = await createSqliteStore({ dbPath: join(dir, 'codexhub.sqlite') });
    const requestedUrls: string[] = [];
    const fetchImpl = (async (url: string) => {
      requestedUrls.push(url);
      const body = url.includes('/pulls?') ? '[{"number":1}]' : '{"ok":true}';

      return {
        ok: true,
        status: 200,
        async text() {
          return body;
        },
      };
    }) as unknown as typeof fetch;
    const server = buildSupervisorServer({
      store,
      localControlKey: localControlToken,
      githubProviderEnabled: true,
      githubProviderCredential: 'ghp_secret',
      githubProviderFetch: fetchImpl,
    });

    const missingTokenResponse = await server.inject({
      method: 'POST',
      url: '/api/github/metadata/dry-runs',
      payload: {
        owner: 'octo-org',
        repo: 'codexhub',
      },
    });
    const maliciousOriginResponse = await server.inject({
      method: 'POST',
      url: '/api/github/metadata/dry-runs',
      headers: {
        ...localControlHeaders,
        origin: 'https://evil.example',
      },
      payload: {
        owner: 'octo-org',
        repo: 'codexhub',
      },
    });
    const dryRunResponse = await server.inject({
      method: 'POST',
      url: '/api/github/metadata/dry-runs',
      headers: localControlHeaders,
      payload: {
        owner: 'octo-org',
        repo: 'codexhub',
        baseBranch: 'main',
        headBranch: 'codex/m15',
        runnerMode: 'controlled-github-http',
      },
    });
    const dryRun = dryRunResponse.json();
    const approvalRequestResponse = await server.inject({
      method: 'POST',
      url: '/api/github/metadata/approval-requests',
      headers: localControlHeaders,
      payload: {
        dryRunId: dryRun.dryRunId,
        reason: 'approve metadata observation',
      },
    });
    const approvalRequest = approvalRequestResponse.json();
    const approvalResponse = await server.inject({
      method: 'POST',
      url: '/api/github/metadata/manual-approvals',
      headers: localControlHeaders,
      payload: {
        dryRunId: dryRun.dryRunId,
        approvalRequestId: approvalRequest.approvalRequestId,
        outcome: 'approved',
        reason: 'approved for metadata observation',
      },
    });
    const approval = approvalResponse.json();
    const forbiddenAuthorityResponse = await server.inject({
      method: 'POST',
      url: '/api/github/metadata/runs',
      headers: localControlHeaders,
      payload: {
        dryRunId: dryRun.dryRunId,
        approvalArtifactId: approval.approvalArtifactId,
        approvalArtifact: approval,
      },
    });
    const forbiddenTokenBodyResponse = await server.inject({
      method: 'POST',
      url: '/api/github/metadata/runs',
      headers: localControlHeaders,
      payload: {
        dryRunId: dryRun.dryRunId,
        approvalArtifactId: approval.approvalArtifactId,
        owner: 'octo-org',
        repo: 'codexhub',
        token: 'ghp_secret',
      },
    });
    const mismatchResponse = await server.inject({
      method: 'POST',
      url: '/api/github/metadata/runs',
      headers: localControlHeaders,
      payload: {
        dryRunId: dryRun.dryRunId,
        approvalArtifactId: approval.approvalArtifactId,
        owner: 'octo-org',
        repo: 'codexhub',
        baseBranch: 'main',
        headBranch: 'different',
      },
    });
    const completedResponse = await server.inject({
      method: 'POST',
      url: '/api/github/metadata/runs',
      headers: localControlHeaders,
      payload: {
        dryRunId: dryRun.dryRunId,
        approvalArtifactId: approval.approvalArtifactId,
        owner: 'octo-org',
        repo: 'codexhub',
        baseBranch: 'main',
        headBranch: 'codex/m15',
      },
    });
    const approvalsResponse = await server.inject({
      method: 'GET',
      url: '/api/github/metadata/approvals',
    });
    const completed = completedResponse.json();

    await server.close();
    await store.close();
    rmSync(dir, { recursive: true, force: true });

    expect(missingTokenResponse.statusCode).toBe(401);
    expect(maliciousOriginResponse.statusCode).toBe(403);
    expect(dryRunResponse.statusCode).toBe(200);
    expect(dryRun.status).toBe('planned');
    expect(dryRunResponse.body).not.toContain('octo-org');
    expect(dryRunResponse.body).not.toContain('codex/m15');
    expect(approvalResponse.statusCode).toBe(200);
    expect(forbiddenAuthorityResponse.statusCode).toBe(400);
    expect(forbiddenAuthorityResponse.json()).toMatchObject({
      error: 'untrusted_github_metadata_authority_body',
      networkBoundaryInvoked: false,
    });
    expect(forbiddenTokenBodyResponse.statusCode).toBe(400);
    expect(forbiddenTokenBodyResponse.json()).toMatchObject({
      error: 'forbidden_github_metadata_raw_body',
      networkBoundaryInvoked: false,
    });
    expect(mismatchResponse.statusCode).toBe(200);
    expect(mismatchResponse.json()).toMatchObject({
      status: 'blocked',
      networkBoundaryInvoked: false,
    });
    expect(completedResponse.statusCode).toBe(200);
    expect(completed.status).toBe('completed');
    expect(completed.networkBoundaryInvoked).toBe(true);
    expect(completed.responseBodyHashCount).toBe(4);
    expect(completed.existingPullRequestCount).toBe(1);
    expect(approvalsResponse.json().records.some((record: { status: string }) => record.status === 'used')).toBe(
      true,
    );
    expect(requestedUrls).toEqual([
      'https://api.github.com/repos/octo-org/codexhub',
      'https://api.github.com/repos/octo-org/codexhub/branches/main',
      'https://api.github.com/repos/octo-org/codexhub/branches/codex%2Fm15',
      'https://api.github.com/repos/octo-org/codexhub/pulls?state=open&base=main&head=octo-org%3Acodex%2Fm15',
    ]);
    expect(completedResponse.body).not.toContain('octo-org');
    expect(completedResponse.body).not.toContain('codex/m15');
    expect(completedResponse.body).not.toContain('ghp_secret');
    expect(completedResponse.body).not.toContain('{"ok":true}');
  });

  it('blocks GitHub metadata execution while the integration is disabled', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'codexhub-github-metadata-disabled-'));
    const store = await createSqliteStore({ dbPath: join(dir, 'codexhub.sqlite') });
    let fetchCalled = false;
    const server = buildSupervisorServer({
      store,
      localControlKey: localControlToken,
      githubProviderEnabled: false,
      githubProviderCredential: 'ghp_secret',
      githubProviderFetch: (async () => {
        fetchCalled = true;
        throw new Error('should not fetch');
      }) as unknown as typeof fetch,
    });

    const dryRunResponse = await server.inject({
      method: 'POST',
      url: '/api/github/metadata/dry-runs',
      headers: localControlHeaders,
      payload: {
        owner: 'octo-org',
        repo: 'codexhub',
        baseBranch: 'main',
        headBranch: 'codex/m15',
        runnerMode: 'controlled-github-http',
      },
    });
    const dryRun = dryRunResponse.json();
    const approvalRequestResponse = await server.inject({
      method: 'POST',
      url: '/api/github/metadata/approval-requests',
      headers: localControlHeaders,
      payload: { dryRunId: dryRun.dryRunId },
    });
    const approvalResponse = await server.inject({
      method: 'POST',
      url: '/api/github/metadata/manual-approvals',
      headers: localControlHeaders,
      payload: {
        dryRunId: dryRun.dryRunId,
        approvalRequestId: approvalRequestResponse.json().approvalRequestId,
        outcome: 'approved',
      },
    });
    const runResponse = await server.inject({
      method: 'POST',
      url: '/api/github/metadata/runs',
      headers: localControlHeaders,
      payload: {
        dryRunId: dryRun.dryRunId,
        approvalArtifactId: approvalResponse.json().approvalArtifactId,
        owner: 'octo-org',
        repo: 'codexhub',
        baseBranch: 'main',
        headBranch: 'codex/m15',
      },
    });

    await server.close();
    await store.close();
    rmSync(dir, { recursive: true, force: true });

    expect(runResponse.statusCode).toBe(200);
    expect(runResponse.json()).toMatchObject({
      status: 'blocked',
      networkBoundaryInvoked: false,
    });
    expect(runResponse.json().blockReasons).toContain('github_provider_disabled');
    expect(fetchCalled).toBe(false);
  });
});

describe('supervisor GitHub PR lifecycle control plane', () => {
  it('observes PR status and check metadata through approval-gated fixed GETs', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'codexhub-github-pr-lifecycle-store-'));
    const store = await createSqliteStore({ dbPath: join(dir, 'codexhub.sqlite') });
    const requestedUrls: string[] = [];
    const fetchImpl = (async (url: string) => {
      requestedUrls.push(url);
      const body = url.endsWith('/pulls/42')
        ? '{"number":42,"html_url":"https://github.com/octo-org/codexhub/pull/42","state":"open","head":{"sha":"abc123"}}'
        : url.endsWith('/status')
          ? '{"state":"success","statuses":[{"state":"success"}]}'
          : url.endsWith('/check-runs')
            ? '{"total_count":2,"check_runs":[{"conclusion":"success","status":"completed"},{"conclusion":null,"status":"in_progress"}]}'
            : '{"ok":true}';

      return {
        ok: true,
        status: 200,
        async text() {
          return body;
        },
      };
    }) as unknown as typeof fetch;
    const server = buildSupervisorServer({
      store,
      localControlKey: localControlToken,
      githubProviderEnabled: true,
      githubPrLifecycleObserverEnabled: true,
      githubProviderCredential: 'ghp_secret',
      githubProviderFetch: fetchImpl,
    });

    const missingTokenResponse = await server.inject({
      method: 'POST',
      url: '/api/github/pr-lifecycle/dry-runs',
      payload: {
        owner: 'octo-org',
        repo: 'codexhub',
      },
    });
    const dryRunResponse = await server.inject({
      method: 'POST',
      url: '/api/github/pr-lifecycle/dry-runs',
      headers: localControlHeaders,
      payload: {
        owner: 'octo-org',
        repo: 'codexhub',
        baseBranch: 'main',
        headBranch: 'codex/m19',
        prNumber: '42',
        commitSha: 'abc123',
        runnerMode: 'controlled-github-pr-lifecycle',
      },
    });
    const dryRun = dryRunResponse.json();
    const approvalRequestResponse = await server.inject({
      method: 'POST',
      url: '/api/github/pr-lifecycle/approval-requests',
      headers: localControlHeaders,
      payload: {
        dryRunId: dryRun.dryRunId,
        reason: 'approve PR lifecycle observation',
      },
    });
    const approvalResponse = await server.inject({
      method: 'POST',
      url: '/api/github/pr-lifecycle/manual-approvals',
      headers: localControlHeaders,
      payload: {
        dryRunId: dryRun.dryRunId,
        approvalRequestId: approvalRequestResponse.json().approvalRequestId,
        outcome: 'approved',
        reason: 'approved for PR lifecycle observation',
      },
    });
    const approval = approvalResponse.json();
    const forbiddenAuthorityResponse = await server.inject({
      method: 'POST',
      url: '/api/github/pr-lifecycle/runs',
      headers: localControlHeaders,
      payload: {
        dryRunId: dryRun.dryRunId,
        approvalArtifactId: approval.approvalArtifactId,
        executionAuthority: approval,
      },
    });
    const mismatchResponse = await server.inject({
      method: 'POST',
      url: '/api/github/pr-lifecycle/runs',
      headers: localControlHeaders,
      payload: {
        dryRunId: dryRun.dryRunId,
        approvalArtifactId: approval.approvalArtifactId,
        owner: 'octo-org',
        repo: 'codexhub',
        baseBranch: 'main',
        headBranch: 'different',
        prNumber: '42',
        commitSha: 'abc123',
      },
    });
    const completedResponse = await server.inject({
      method: 'POST',
      url: '/api/github/pr-lifecycle/runs',
      headers: localControlHeaders,
      payload: {
        dryRunId: dryRun.dryRunId,
        approvalArtifactId: approval.approvalArtifactId,
        owner: 'octo-org',
        repo: 'codexhub',
        baseBranch: 'main',
        headBranch: 'codex/m19',
        prNumber: '42',
        commitSha: 'abc123',
      },
    });
    const approvalsResponse = await server.inject({
      method: 'GET',
      url: '/api/github/pr-lifecycle/approvals',
    });
    const runsResponse = await server.inject({
      method: 'GET',
      url: '/api/github/pr-lifecycle/runs',
    });
    const completed = completedResponse.json();

    await server.close();
    await store.close();
    rmSync(dir, { recursive: true, force: true });

    expect(missingTokenResponse.statusCode).toBe(401);
    expect(dryRunResponse.statusCode).toBe(200);
    expect(dryRun.status).toBe('planned');
    expect(dryRunResponse.body).not.toContain('octo-org');
    expect(dryRunResponse.body).not.toContain('codex/m19');
    expect(forbiddenAuthorityResponse.statusCode).toBe(400);
    expect(forbiddenAuthorityResponse.json()).toMatchObject({
      error: 'untrusted_github_pr_lifecycle_authority_body',
      networkBoundaryInvoked: false,
    });
    expect(mismatchResponse.statusCode).toBe(200);
    expect(mismatchResponse.json()).toMatchObject({
      status: 'blocked',
      networkBoundaryInvoked: false,
    });
    expect(completedResponse.statusCode).toBe(200);
    expect(completed.status).toBe('completed');
    expect(completed.networkBoundaryInvoked).toBe(true);
    expect(completed.responseBodyHashCount).toBe(5);
    expect(completed.checkRunCount).toBe(2);
    expect(completed.statusContextCount).toBe(1);
    expect(approvalsResponse.json().records.some((record: { status: string }) => record.status === 'used')).toBe(
      true,
    );
    expect(runsResponse.json().count).toBe(2);
    expect(requestedUrls).toEqual([
      'https://api.github.com/repos/octo-org/codexhub',
      'https://api.github.com/repos/octo-org/codexhub/pulls/42',
      'https://api.github.com/repos/octo-org/codexhub/git/ref/heads/codex%2Fm19',
      'https://api.github.com/repos/octo-org/codexhub/commits/abc123/status',
      'https://api.github.com/repos/octo-org/codexhub/commits/abc123/check-runs',
    ]);
    expect(completedResponse.body).not.toContain('octo-org');
    expect(completedResponse.body).not.toContain('codex/m19');
    expect(completedResponse.body).not.toContain('ghp_secret');
    expect(completedResponse.body).not.toContain('html_url');
    expect(completedResponse.body).not.toContain('check_runs');
  });

  it('blocks PR lifecycle observation while the observer integration is disabled', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'codexhub-github-pr-lifecycle-disabled-'));
    const store = await createSqliteStore({ dbPath: join(dir, 'codexhub.sqlite') });
    let fetchCalled = false;
    const server = buildSupervisorServer({
      store,
      localControlKey: localControlToken,
      githubProviderEnabled: true,
      githubPrLifecycleObserverEnabled: false,
      githubProviderCredential: 'ghp_secret',
      githubProviderFetch: (async () => {
        fetchCalled = true;
        throw new Error('should not fetch');
      }) as unknown as typeof fetch,
    });

    const dryRunResponse = await server.inject({
      method: 'POST',
      url: '/api/github/pr-lifecycle/dry-runs',
      headers: localControlHeaders,
      payload: {
        owner: 'octo-org',
        repo: 'codexhub',
        baseBranch: 'main',
        headBranch: 'codex/m19',
        prNumber: '42',
        commitSha: 'abc123',
        runnerMode: 'controlled-github-pr-lifecycle',
      },
    });
    const dryRun = dryRunResponse.json();
    const approvalRequestResponse = await server.inject({
      method: 'POST',
      url: '/api/github/pr-lifecycle/approval-requests',
      headers: localControlHeaders,
      payload: { dryRunId: dryRun.dryRunId },
    });
    const approvalResponse = await server.inject({
      method: 'POST',
      url: '/api/github/pr-lifecycle/manual-approvals',
      headers: localControlHeaders,
      payload: {
        dryRunId: dryRun.dryRunId,
        approvalRequestId: approvalRequestResponse.json().approvalRequestId,
        outcome: 'approved',
      },
    });
    const runResponse = await server.inject({
      method: 'POST',
      url: '/api/github/pr-lifecycle/runs',
      headers: localControlHeaders,
      payload: {
        dryRunId: dryRun.dryRunId,
        approvalArtifactId: approvalResponse.json().approvalArtifactId,
        owner: 'octo-org',
        repo: 'codexhub',
        baseBranch: 'main',
        headBranch: 'codex/m19',
        prNumber: '42',
        commitSha: 'abc123',
      },
    });

    await server.close();
    await store.close();
    rmSync(dir, { recursive: true, force: true });

    expect(runResponse.statusCode).toBe(200);
    expect(runResponse.json()).toMatchObject({
      status: 'blocked',
      networkBoundaryInvoked: false,
    });
    expect(runResponse.json().blockReasons).toContain('github_pr_lifecycle_disabled');
    expect(fetchCalled).toBe(false);
  });
});

describe('supervisor GitHub PR management control planes', () => {
  it('runs label management through store-resolved approval and fixed endpoints', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'codexhub-github-pr-labels-store-'));
    const store = await createSqliteStore({ dbPath: join(dir, 'codexhub.sqlite') });
    const requested: Array<{ url: string; method?: string }> = [];
    const fetchImpl = (async (url: string, init?: RequestInit) => {
      requested.push({ url, method: init?.method });
      const method = init?.method ?? 'GET';

      return {
        ok: true,
        status: method === 'POST' ? 201 : 200,
        async text() {
          return method === 'POST' ? '{"labels":["bug","m37"]}' : '{"ok":true}';
        },
      };
    }) as unknown as typeof fetch;
    const server = buildSupervisorServer({
      store,
      localControlKey: localControlToken,
      githubProviderEnabled: true,
      githubPrLabelsEnabled: true,
      githubProviderCredential: 'ghp_secret',
      githubProviderFetch: fetchImpl,
    });

    const dryRunResponse = await server.inject({
      method: 'POST',
      url: '/api/github/pr-labels/dry-runs',
      headers: localControlHeaders,
      payload: {
        owner: 'octo-org',
        repo: 'codexhub',
        baseBranch: 'main',
        headBranch: 'codexhub/m37',
        prNumber: '42',
        itemSummaries: ['bug', 'm37'],
        payloadSummary: 'Apply approved labels from metadata summary.',
      },
    });
    const approvalRequestResponse = await server.inject({
      method: 'POST',
      url: '/api/github/pr-labels/approval-requests',
      headers: localControlHeaders,
      payload: { dryRunId: dryRunResponse.json().dryRunId, reason: 'approve labels' },
    });
    const approvalResponse = await server.inject({
      method: 'POST',
      url: '/api/github/pr-labels/manual-approvals',
      headers: localControlHeaders,
      payload: {
        dryRunId: dryRunResponse.json().dryRunId,
        approvalRequestId: approvalRequestResponse.json().approvalRequestId,
        outcome: 'approved',
      },
    });
    const forbiddenRawResponse = await server.inject({
      method: 'POST',
      url: '/api/github/pr-labels/runs',
      headers: localControlHeaders,
      payload: {
        dryRunId: dryRunResponse.json().dryRunId,
        approvalArtifactId: approvalResponse.json().approvalArtifactId,
        rawLabelBody: 'bug,m37',
      },
    });
    const completedResponse = await server.inject({
      method: 'POST',
      url: '/api/github/pr-labels/runs',
      headers: localControlHeaders,
      payload: {
        dryRunId: dryRunResponse.json().dryRunId,
        approvalArtifactId: approvalResponse.json().approvalArtifactId,
        owner: 'octo-org',
        repo: 'codexhub',
        baseBranch: 'main',
        headBranch: 'codexhub/m37',
        prNumber: '42',
        itemSummaries: ['bug', 'm37'],
        payloadSummary: 'Apply approved labels from metadata summary.',
      },
    });
    const runsResponse = await server.inject({ method: 'GET', url: '/api/github/pr-labels/runs' });

    await server.close();
    await store.close();
    rmSync(dir, { recursive: true, force: true });

    expect(dryRunResponse.statusCode).toBe(200);
    expect(approvalResponse.json().status).toBe('approved');
    expect(forbiddenRawResponse.statusCode).toBe(400);
    expect(forbiddenRawResponse.json()).toMatchObject({
      error: 'request body contains forbidden raw GitHub PR labels fields',
      networkBoundaryInvoked: false,
    });
    expect(completedResponse.statusCode).toBe(200);
    expect(completedResponse.json()).toMatchObject({
      status: 'completed',
      managementKind: 'labels',
      networkBoundaryInvoked: true,
      bodyStored: false,
      rawCommentBodyStored: false,
      rawResponseBodyStored: false,
    });
    expect(runsResponse.json().count).toBe(1);
    expect(requested.map((request) => `${request.method ?? 'GET'} ${request.url}`)).toEqual([
      'GET https://api.github.com/repos/octo-org/codexhub',
      'GET https://api.github.com/repos/octo-org/codexhub/pulls/42',
      'GET https://api.github.com/repos/octo-org/codexhub/issues/42/labels',
      'POST https://api.github.com/repos/octo-org/codexhub/issues/42/labels',
    ]);
    expect(completedResponse.body).not.toContain('octo-org');
    expect(completedResponse.body).not.toContain('codexhub/m37');
    expect(completedResponse.body).not.toContain('ghp_secret');
    expect(completedResponse.body).not.toContain('"bug"');
  });
});

describe('supervisor GitHub draft PR control plane', () => {
  it('creates an approved existing-branch draft PR through the governed control plane', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'codexhub-github-draft-pr-store-'));
    const store = await createSqliteStore({ dbPath: join(dir, 'codexhub.sqlite') });
    const requested: Array<{ url: string; method?: string; body?: string }> = [];
    const fetchImpl = (async (url: string, init?: RequestInit) => {
      requested.push({ url, method: init?.method, body: init?.body as string | undefined });
      const isPullRequestLookup = url.includes('/pulls?');
      const isPullRequestPost = init?.method === 'POST';
      const body = isPullRequestLookup
        ? '[]'
        : isPullRequestPost
          ? '{"number":42,"html_url":"https://github.com/octo-org/codexhub/pull/42"}'
          : '{"ok":true}';

      return {
        ok: true,
        status: isPullRequestPost ? 201 : 200,
        async text() {
          return body;
        },
      };
    }) as unknown as typeof fetch;
    const server = buildSupervisorServer({
      store,
      localControlKey: localControlToken,
      githubProviderEnabled: true,
      githubDraftPrEnabled: true,
      githubProviderCredential: 'ghp_secret',
      githubProviderFetch: fetchImpl,
    });

    const missingTokenResponse = await server.inject({
      method: 'POST',
      url: '/api/github/draft-prs/dry-runs',
      payload: { owner: 'octo-org', repo: 'codexhub' },
    });
    const maliciousOriginResponse = await server.inject({
      method: 'POST',
      url: '/api/github/draft-prs/dry-runs',
      headers: {
        ...localControlHeaders,
        origin: 'https://evil.example',
      },
      payload: { owner: 'octo-org', repo: 'codexhub' },
    });
    const dryRunResponse = await server.inject({
      method: 'POST',
      url: '/api/github/draft-prs/dry-runs',
      headers: localControlHeaders,
      payload: {
        owner: 'octo-org',
        repo: 'codexhub',
        baseBranch: 'main',
        headBranch: 'codex/m16-draft',
        sourceKind: 'local_rc_readiness',
        sourceId: 'local_rc_123',
        sourceSummary: 'Local RC metadata summary',
        titleSummary: 'Draft PR from local RC',
        bodySectionSummaries: ['Local RC summary', 'Verification passed summary'],
        remoteHeadBranchExists: true,
        existingPullRequestCount: 0,
        runnerMode: 'controlled-github-draft-pr',
      },
    });
    const dryRun = dryRunResponse.json();
    const approvalRequestResponse = await server.inject({
      method: 'POST',
      url: '/api/github/draft-prs/approval-requests',
      headers: localControlHeaders,
      payload: {
        dryRunId: dryRun.dryRunId,
        reason: 'approve draft PR creation',
      },
    });
    const approvalRequest = approvalRequestResponse.json();
    const approvalResponse = await server.inject({
      method: 'POST',
      url: '/api/github/draft-prs/manual-approvals',
      headers: localControlHeaders,
      payload: {
        dryRunId: dryRun.dryRunId,
        approvalRequestId: approvalRequest.approvalRequestId,
        outcome: 'approved',
        reason: 'approved for draft PR creation',
      },
    });
    const approval = approvalResponse.json();
    const forbiddenAuthorityResponse = await server.inject({
      method: 'POST',
      url: '/api/github/draft-prs/runs',
      headers: localControlHeaders,
      payload: {
        dryRunId: dryRun.dryRunId,
        approvalArtifactId: approval.approvalArtifactId,
        executionAuthority: { allowed: true },
      },
    });
    const mismatchResponse = await server.inject({
      method: 'POST',
      url: '/api/github/draft-prs/runs',
      headers: localControlHeaders,
      payload: {
        dryRunId: dryRun.dryRunId,
        approvalArtifactId: approval.approvalArtifactId,
        owner: 'octo-org',
        repo: 'codexhub',
        baseBranch: 'main',
        headBranch: 'different',
        titleSummary: 'Draft PR from local RC',
        bodySectionSummaries: ['Local RC summary', 'Verification passed summary'],
      },
    });
    const approvalsAfterMismatchResponse = await server.inject({
      method: 'GET',
      url: '/api/github/draft-prs/approvals',
    });
    const requestCountBeforeCompleted = requested.length;
    const completedResponse = await server.inject({
      method: 'POST',
      url: '/api/github/draft-prs/runs',
      headers: localControlHeaders,
      payload: {
        dryRunId: dryRun.dryRunId,
        approvalArtifactId: approval.approvalArtifactId,
        owner: 'octo-org',
        repo: 'codexhub',
        baseBranch: 'main',
        headBranch: 'codex/m16-draft',
        titleSummary: 'Draft PR from local RC',
        bodySectionSummaries: ['Local RC summary', 'Verification passed summary'],
      },
    });
    const runsResponse = await server.inject({
      method: 'GET',
      url: '/api/github/draft-prs/runs',
    });
    const approvalsResponse = await server.inject({
      method: 'GET',
      url: '/api/github/draft-prs/approvals',
    });
    const completed = completedResponse.json();

    await server.close();
    await store.close();
    rmSync(dir, { recursive: true, force: true });

    expect(missingTokenResponse.statusCode).toBe(401);
    expect(maliciousOriginResponse.statusCode).toBe(403);
    expect(dryRunResponse.statusCode).toBe(200);
    expect(dryRun.status).toBe('planned');
    expect(dryRun.readinessStatus).toBe('ready_for_draft_pr');
    expect(dryRunResponse.body).not.toContain('octo-org');
    expect(dryRunResponse.body).not.toContain('codex/m16-draft');
    expect(dryRunResponse.body).not.toContain('Draft PR from local RC');
    expect(approvalResponse.statusCode).toBe(200);
    expect(forbiddenAuthorityResponse.statusCode).toBe(400);
    expect(forbiddenAuthorityResponse.json()).toMatchObject({
      error: 'untrusted_github_draft_pr_authority_body',
      networkBoundaryInvoked: false,
    });
    expect(mismatchResponse.statusCode).toBe(200);
    expect(mismatchResponse.json()).toMatchObject({
      status: 'blocked',
      networkBoundaryInvoked: false,
    });
    expect(requestCountBeforeCompleted).toBe(0);
    expect(
      approvalsAfterMismatchResponse
        .json()
        .records.some((record: { status: string }) => record.status === 'approved'),
    ).toBe(true);
    expect(
      approvalsAfterMismatchResponse
        .json()
        .records.some((record: { status: string }) => record.status === 'used'),
    ).toBe(false);
    expect(completedResponse.statusCode).toBe(200);
    expect(completed.status).toBe('completed');
    expect(completed.created).toBe(true);
    expect(completed.networkBoundaryInvoked).toBe(true);
    expect(completed.noRealWrite).toBe(false);
    expect(completed.responseBodyHashCount).toBe(5);
    expect(completed.prNumberHash).toMatch(/^sha256:/);
    expect(completed.prUrlHash).toMatch(/^sha256:/);
    expect(runsResponse.json().records).toHaveLength(2);
    expect(approvalsResponse.json().records.some((record: { status: string }) => record.status === 'used')).toBe(
      true,
    );
    expect(requested.map((request) => `${request.method ?? 'GET'} ${request.url}`)).toEqual([
      'GET https://api.github.com/repos/octo-org/codexhub',
      'GET https://api.github.com/repos/octo-org/codexhub/branches/main',
      'GET https://api.github.com/repos/octo-org/codexhub/branches/codex%2Fm16-draft',
      'GET https://api.github.com/repos/octo-org/codexhub/pulls?state=open&base=main&head=octo-org%3Acodex%2Fm16-draft',
      'POST https://api.github.com/repos/octo-org/codexhub/pulls',
    ]);
    expect(requested.at(-1)?.body).toContain('"draft":true');
    expect(completedResponse.body).not.toContain('octo-org');
    expect(completedResponse.body).not.toContain('codex/m16-draft');
    expect(completedResponse.body).not.toContain('ghp_secret');
    expect(completedResponse.body).not.toContain('Draft PR from local RC');
    expect(completedResponse.body).not.toContain('Local RC summary');
    expect(completedResponse.body).not.toContain('https://github.com/octo-org/codexhub/pull/42');
  });

  it('blocks GitHub draft PR creation while the integration is disabled', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'codexhub-github-draft-pr-disabled-'));
    const store = await createSqliteStore({ dbPath: join(dir, 'codexhub.sqlite') });
    let fetchCalled = false;
    const server = buildSupervisorServer({
      store,
      localControlKey: localControlToken,
      githubProviderEnabled: true,
      githubDraftPrEnabled: false,
      githubProviderCredential: 'ghp_secret',
      githubProviderFetch: (async () => {
        fetchCalled = true;
        throw new Error('should not fetch');
      }) as unknown as typeof fetch,
    });

    const dryRunResponse = await server.inject({
      method: 'POST',
      url: '/api/github/draft-prs/dry-runs',
      headers: localControlHeaders,
      payload: {
        owner: 'octo-org',
        repo: 'codexhub',
        baseBranch: 'main',
        headBranch: 'codex/m16-draft',
        sourceKind: 'local_rc_readiness',
        sourceId: 'local_rc_123',
        sourceSummary: 'Local RC metadata summary',
        titleSummary: 'Draft PR from local RC',
        bodySectionSummaries: ['Local RC summary'],
        remoteHeadBranchExists: true,
        existingPullRequestCount: 0,
        runnerMode: 'controlled-github-draft-pr',
      },
    });
    const dryRun = dryRunResponse.json();
    const approvalRequestResponse = await server.inject({
      method: 'POST',
      url: '/api/github/draft-prs/approval-requests',
      headers: localControlHeaders,
      payload: { dryRunId: dryRun.dryRunId },
    });
    const approvalResponse = await server.inject({
      method: 'POST',
      url: '/api/github/draft-prs/manual-approvals',
      headers: localControlHeaders,
      payload: {
        dryRunId: dryRun.dryRunId,
        approvalRequestId: approvalRequestResponse.json().approvalRequestId,
        outcome: 'approved',
      },
    });
    const runResponse = await server.inject({
      method: 'POST',
      url: '/api/github/draft-prs/runs',
      headers: localControlHeaders,
      payload: {
        dryRunId: dryRun.dryRunId,
        approvalArtifactId: approvalResponse.json().approvalArtifactId,
        owner: 'octo-org',
        repo: 'codexhub',
        baseBranch: 'main',
        headBranch: 'codex/m16-draft',
        titleSummary: 'Draft PR from local RC',
        bodySectionSummaries: ['Local RC summary'],
      },
    });

    await server.close();
    await store.close();
    rmSync(dir, { recursive: true, force: true });

    expect(runResponse.statusCode).toBe(200);
    expect(runResponse.json()).toMatchObject({
      status: 'blocked',
      networkBoundaryInvoked: false,
    });
    expect(runResponse.json().blockReasons).toContain('github_draft_pr_disabled');
    expect(fetchCalled).toBe(false);
  });
});

describe('supervisor deployment and secrets governance control planes', () => {
  it('governs prod deployment operations with two approvals and metadata-only output', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'codexhub-deployment-operation-'));
    const store = await createSqliteStore({ dbPath: join(dir, 'codexhub.sqlite') });
    const server = buildSupervisorServer({
      store,
      localControlKey: localControlToken,
      deploymentOperatorEnabled: true,
      deploymentKubernetesWriteEnabled: true,
      deploymentProdWriteEnabled: true,
    });

    const dryRunResponse = await server.inject({
      method: 'POST',
      url: '/api/deployments/operations/dry-runs',
      headers: localControlHeaders,
      payload: {
        provider: 'kubernetes',
        action: 'apply',
        environment: 'prod',
        targetHash: 'sha256:deployment-target',
        artifactHash: 'sha256:manifest-artifact',
      },
    });
    const dryRun = dryRunResponse.json();

    const firstApprovalRequestResponse = await server.inject({
      method: 'POST',
      url: '/api/deployments/operations/approval-requests',
      headers: localControlHeaders,
      payload: { dryRunId: dryRun.dryRunId, approvalSlot: 'primary' },
    });
    const firstApprovalRequest = firstApprovalRequestResponse.json();
    const firstApprovalResponse = await server.inject({
      method: 'POST',
      url: '/api/deployments/operations/manual-approvals',
      headers: localControlHeaders,
      payload: {
        dryRunId: dryRun.dryRunId,
        approvalRequestId: firstApprovalRequest.approvalRequestId,
        outcome: 'approved',
        approvalSlot: 'primary',
        decidedBy: 'operator-a',
      },
    });
    const firstApproval = firstApprovalResponse.json();

    const oneApprovalRunResponse = await server.inject({
      method: 'POST',
      url: '/api/deployments/operations/runs',
      headers: localControlHeaders,
      payload: {
        dryRunId: dryRun.dryRunId,
        approvalArtifactIds: [firstApproval.approvalArtifactId],
      },
    });

    const secondApprovalRequestResponse = await server.inject({
      method: 'POST',
      url: '/api/deployments/operations/approval-requests',
      headers: localControlHeaders,
      payload: { dryRunId: dryRun.dryRunId, approvalSlot: 'secondary' },
    });
    const secondApprovalRequest = secondApprovalRequestResponse.json();
    const secondApprovalResponse = await server.inject({
      method: 'POST',
      url: '/api/deployments/operations/manual-approvals',
      headers: localControlHeaders,
      payload: {
        dryRunId: dryRun.dryRunId,
        approvalRequestId: secondApprovalRequest.approvalRequestId,
        outcome: 'approved',
        approvalSlot: 'secondary',
        decidedBy: 'operator-b',
      },
    });
    const secondApproval = secondApprovalResponse.json();

    const completedResponse = await server.inject({
      method: 'POST',
      url: '/api/deployments/operations/runs',
      headers: localControlHeaders,
      payload: {
        dryRunId: dryRun.dryRunId,
        approvalArtifactIds: [
          firstApproval.approvalArtifactId,
          secondApproval.approvalArtifactId,
        ],
      },
    });
    const rawBodyResponse = await server.inject({
      method: 'POST',
      url: '/api/deployments/operations/dry-runs',
      headers: localControlHeaders,
      payload: { rawManifest: 'apiVersion: v1\nkind: Secret' },
    });

    await server.close();

    expect(dryRunResponse.statusCode).toBe(200);
    expect(dryRun.requiredApprovalCount).toBe(2);
    expect(oneApprovalRunResponse.statusCode).toBe(200);
    expect(oneApprovalRunResponse.json().status).toBe('blocked');
    expect(oneApprovalRunResponse.json().processBoundaryInvoked).toBe(false);
    expect(completedResponse.statusCode).toBe(200);
    expect(completedResponse.json().status).toBe('completed');
    expect(completedResponse.json().processBoundaryInvoked).toBe(true);
    expect(completedResponse.body).not.toContain('apiVersion');
    expect(completedResponse.body).not.toContain('kind: Secret');
    expect(rawBodyResponse.statusCode).toBe(400);
  });

  it('keeps secrets readiness hash-only and rejects secret values', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'codexhub-secrets-readiness-'));
    const store = await createSqliteStore({ dbPath: join(dir, 'codexhub.sqlite') });
    const server = buildSupervisorServer({
      store,
      localControlKey: localControlToken,
      secretsGovernanceEnabled: true,
      secretsVaultReadinessEnabled: true,
    });

    const dryRunResponse = await server.inject({
      method: 'POST',
      url: '/api/secrets/readiness/dry-runs',
      headers: localControlHeaders,
      payload: {
        provider: 'vault',
        environment: 'prod',
        configHash: 'sha256:vault-config',
        expectedReferenceCount: 1,
      },
    });
    const dryRun = dryRunResponse.json();
    const approvalRequestResponse = await server.inject({
      method: 'POST',
      url: '/api/secrets/readiness/approval-requests',
      headers: localControlHeaders,
      payload: { dryRunId: dryRun.dryRunId },
    });
    const approvalRequest = approvalRequestResponse.json();
    const approvalResponse = await server.inject({
      method: 'POST',
      url: '/api/secrets/readiness/manual-approvals',
      headers: localControlHeaders,
      payload: {
        dryRunId: dryRun.dryRunId,
        approvalRequestId: approvalRequest.approvalRequestId,
        outcome: 'approved',
        decidedBy: 'operator-a',
      },
    });
    const approval = approvalResponse.json();
    const completedResponse = await server.inject({
      method: 'POST',
      url: '/api/secrets/readiness/runs',
      headers: localControlHeaders,
      payload: {
        dryRunId: dryRun.dryRunId,
        approvalArtifactId: approval.approvalArtifactId,
      },
    });
    const rawSecretResponse = await server.inject({
      method: 'POST',
      url: '/api/secrets/readiness/dry-runs',
      headers: localControlHeaders,
      payload: { provider: 'vault', secretValue: 'plaintext-secret' },
    });

    await server.close();

    expect(dryRunResponse.statusCode).toBe(200);
    expect(completedResponse.statusCode).toBe(200);
    expect(completedResponse.json().secretValueReadAllowed).toBe(false);
    expect(completedResponse.json().secretValueStored).toBe(false);
    expect(completedResponse.body).not.toContain('plaintext-secret');
    expect(rawSecretResponse.statusCode).toBe(400);
  });
});

describe('supervisor GitHub branch publish control plane', () => {
  const branchPublishFiles = [
    {
      relativePath: 'packages/example/src/index.ts',
      content: 'export const answer = 42;\n',
    },
    {
      relativePath: 'docs/example.md',
      content: '# Example\n\nMetadata only.\n',
    },
  ];
  const branchPublishPlanFiles = branchPublishFiles.map((file) => ({
    relativePath: file.relativePath,
    contentHash: `sha256:${hashTestText(file.content)}`,
    byteCount: Buffer.byteLength(file.content, 'utf8'),
    text: true,
  }));

  it('creates an approved new codexhub branch through the governed control plane', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'codexhub-github-branch-publish-store-'));
    const store = await createSqliteStore({ dbPath: join(dir, 'codexhub.sqlite') });
    const requested: Array<{ url: string; method?: string; body?: string }> = [];
    const fetchImpl = (async (url: string, init?: RequestInit) => {
      requested.push({ url, method: init?.method, body: init?.body as string | undefined });

      if (url.endsWith('/git/ref/heads/codexhub%2Fm17-publish')) {
        return {
          ok: false,
          status: 404,
          async text() {
            return '{"message":"Not Found"}';
          },
        };
      }

      const method = init?.method ?? 'GET';
      const body =
        method === 'GET' && url.endsWith('/git/ref/heads/main')
          ? '{"object":{"sha":"base-commit-sha"}}'
          : method === 'GET' && url.endsWith('/git/commits/base-commit-sha')
            ? '{"tree":{"sha":"base-tree-sha"}}'
            : method === 'POST' && url.endsWith('/git/blobs')
              ? '{"sha":"blob-sha"}'
              : method === 'POST' && url.endsWith('/git/trees')
                ? '{"sha":"new-tree-sha"}'
                : method === 'POST' && url.endsWith('/git/commits')
                  ? '{"sha":"new-commit-sha"}'
                  : '{"ok":true}';

      return {
        ok: true,
        status: method === 'POST' ? 201 : 200,
        async text() {
          return body;
        },
      };
    }) as unknown as typeof fetch;
    const server = buildSupervisorServer({
      store,
      localControlKey: localControlToken,
      githubProviderEnabled: true,
      githubBranchPublishEnabled: true,
      githubProviderCredential: 'ghp_secret',
      githubProviderFetch: fetchImpl,
    });

    const missingTokenResponse = await server.inject({
      method: 'POST',
      url: '/api/github/branch-publishes/dry-runs',
      payload: { owner: 'octo-org', repo: 'codexhub' },
    });
    const maliciousOriginResponse = await server.inject({
      method: 'POST',
      url: '/api/github/branch-publishes/dry-runs',
      headers: {
        ...localControlHeaders,
        origin: 'https://evil.example',
      },
      payload: { owner: 'octo-org', repo: 'codexhub' },
    });
    const dryRunResponse = await server.inject({
      method: 'POST',
      url: '/api/github/branch-publishes/dry-runs',
      headers: localControlHeaders,
      payload: {
        owner: 'octo-org',
        repo: 'codexhub',
        baseBranch: 'main',
        sourceKind: 'local_rc_readiness',
        sourceId: 'local_rc_123',
        sourceSummary: 'Local RC metadata summary',
        worktreePathHash: 'sha256:worktree',
        branchSlug: 'm17-publish',
        commitMessageSummary: 'Publish governed CodexHub patch',
        files: branchPublishPlanFiles,
        runnerMode: 'controlled-github-branch-publish',
      },
    });
    const dryRun = dryRunResponse.json();
    const approvalRequestResponse = await server.inject({
      method: 'POST',
      url: '/api/github/branch-publishes/approval-requests',
      headers: localControlHeaders,
      payload: {
        dryRunId: dryRun.dryRunId,
        reason: 'approve branch publish',
      },
    });
    const approvalRequest = approvalRequestResponse.json();
    const approvalResponse = await server.inject({
      method: 'POST',
      url: '/api/github/branch-publishes/manual-approvals',
      headers: localControlHeaders,
      payload: {
        dryRunId: dryRun.dryRunId,
        approvalRequestId: approvalRequest.approvalRequestId,
        outcome: 'approved',
        reason: 'approved for branch publish',
      },
    });
    const approval = approvalResponse.json();
    const forbiddenAuthorityResponse = await server.inject({
      method: 'POST',
      url: '/api/github/branch-publishes/runs',
      headers: localControlHeaders,
      payload: {
        dryRunId: dryRun.dryRunId,
        approvalArtifactId: approval.approvalArtifactId,
        executionAuthority: { allowed: true },
      },
    });
    const mismatchResponse = await server.inject({
      method: 'POST',
      url: '/api/github/branch-publishes/runs',
      headers: localControlHeaders,
      payload: {
        dryRunId: dryRun.dryRunId,
        approvalArtifactId: approval.approvalArtifactId,
        owner: 'octo-org',
        repo: 'codexhub',
        baseBranch: 'main',
        branchName: 'codexhub/different',
        commitMessageSummary: 'Publish governed CodexHub patch',
        files: branchPublishFiles,
      },
    });
    const approvalsAfterMismatchResponse = await server.inject({
      method: 'GET',
      url: '/api/github/branch-publishes/approvals',
    });
    const requestCountBeforeCompleted = requested.length;
    const completedResponse = await server.inject({
      method: 'POST',
      url: '/api/github/branch-publishes/runs',
      headers: localControlHeaders,
      payload: {
        dryRunId: dryRun.dryRunId,
        approvalArtifactId: approval.approvalArtifactId,
        owner: 'octo-org',
        repo: 'codexhub',
        baseBranch: 'main',
        branchName: 'codexhub/m17-publish',
        commitMessageSummary: 'Publish governed CodexHub patch',
        files: branchPublishFiles,
      },
    });
    const runsResponse = await server.inject({
      method: 'GET',
      url: '/api/github/branch-publishes/runs',
    });
    const approvalsResponse = await server.inject({
      method: 'GET',
      url: '/api/github/branch-publishes/approvals',
    });
    const completed = completedResponse.json();

    await server.close();
    await store.close();
    rmSync(dir, { recursive: true, force: true });

    expect(missingTokenResponse.statusCode).toBe(401);
    expect(maliciousOriginResponse.statusCode).toBe(403);
    expect(dryRunResponse.statusCode).toBe(200);
    expect(dryRun.status).toBe('planned');
    expect(dryRun.readinessStatus).toBe('ready_for_branch_publish');
    expect(dryRun.createRefAllowed).toBe(true);
    expect(dryRun.updateRefAllowed).toBe(false);
    expect(dryRun.forceAllowed).toBe(false);
    expect(dryRun.pushAllowed).toBe(false);
    expect(dryRunResponse.body).not.toContain('octo-org');
    expect(dryRunResponse.body).not.toContain('m17-publish');
    expect(dryRunResponse.body).not.toContain('packages/example/src/index.ts');
    expect(dryRunResponse.body).not.toContain('Publish governed CodexHub patch');
    expect(approvalResponse.statusCode).toBe(200);
    expect(forbiddenAuthorityResponse.statusCode).toBe(400);
    expect(forbiddenAuthorityResponse.json()).toMatchObject({
      error: 'untrusted_github_branch_publish_authority_body',
      networkBoundaryInvoked: false,
    });
    expect(mismatchResponse.statusCode).toBe(200);
    expect(mismatchResponse.json()).toMatchObject({
      status: 'blocked',
      networkBoundaryInvoked: false,
    });
    expect(requestCountBeforeCompleted).toBe(0);
    expect(
      approvalsAfterMismatchResponse
        .json()
        .records.some((record: { status: string }) => record.status === 'approved'),
    ).toBe(true);
    expect(
      approvalsAfterMismatchResponse
        .json()
        .records.some((record: { status: string }) => record.status === 'used'),
    ).toBe(false);
    expect(completedResponse.statusCode).toBe(200);
    expect(completed.status).toBe('completed');
    expect(completed.created).toBe(true);
    expect(completed.networkBoundaryInvoked).toBe(true);
    expect(completed.noRealWrite).toBe(false);
    expect(completed.responseBodyHashCount).toBe(9);
    expect(completed.commitShaHash).toMatch(/^sha256:/);
    expect(completed.treeShaHash).toMatch(/^sha256:/);
    expect(runsResponse.json().records).toHaveLength(2);
    expect(approvalsResponse.json().records.some((record: { status: string }) => record.status === 'used')).toBe(
      true,
    );
    expect(requested.map((request) => `${request.method ?? 'GET'} ${request.url}`)).toEqual([
      'GET https://api.github.com/repos/octo-org/codexhub',
      'GET https://api.github.com/repos/octo-org/codexhub/git/ref/heads/main',
      'GET https://api.github.com/repos/octo-org/codexhub/git/ref/heads/codexhub%2Fm17-publish',
      'GET https://api.github.com/repos/octo-org/codexhub/git/commits/base-commit-sha',
      'POST https://api.github.com/repos/octo-org/codexhub/git/blobs',
      'POST https://api.github.com/repos/octo-org/codexhub/git/blobs',
      'POST https://api.github.com/repos/octo-org/codexhub/git/trees',
      'POST https://api.github.com/repos/octo-org/codexhub/git/commits',
      'POST https://api.github.com/repos/octo-org/codexhub/git/refs',
    ]);
    expect(requested.at(-1)?.body).toContain('"refs/heads/codexhub/m17-publish"');
    expect(completedResponse.body).not.toContain('octo-org');
    expect(completedResponse.body).not.toContain('codexhub/m17-publish');
    expect(completedResponse.body).not.toContain('ghp_secret');
    expect(completedResponse.body).not.toContain('Publish governed CodexHub patch');
    expect(completedResponse.body).not.toContain('export const answer');
    expect(completedResponse.body).not.toContain('packages/example/src/index.ts');
    expect(completedResponse.body).not.toContain('new-commit-sha');
  });

  it('blocks GitHub branch publish while the integration is disabled', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'codexhub-github-branch-publish-disabled-'));
    const store = await createSqliteStore({ dbPath: join(dir, 'codexhub.sqlite') });
    let fetchCalled = false;
    const server = buildSupervisorServer({
      store,
      localControlKey: localControlToken,
      githubProviderEnabled: true,
      githubBranchPublishEnabled: false,
      githubProviderCredential: 'ghp_secret',
      githubProviderFetch: (async () => {
        fetchCalled = true;
        throw new Error('should not fetch');
      }) as unknown as typeof fetch,
    });

    const dryRunResponse = await server.inject({
      method: 'POST',
      url: '/api/github/branch-publishes/dry-runs',
      headers: localControlHeaders,
      payload: {
        owner: 'octo-org',
        repo: 'codexhub',
        baseBranch: 'main',
        sourceKind: 'local_rc_readiness',
        sourceId: 'local_rc_123',
        sourceSummary: 'Local RC metadata summary',
        worktreePathHash: 'sha256:worktree',
        branchSlug: 'm17-publish',
        commitMessageSummary: 'Publish governed CodexHub patch',
        files: branchPublishPlanFiles,
        runnerMode: 'controlled-github-branch-publish',
      },
    });
    const dryRun = dryRunResponse.json();
    const approvalRequestResponse = await server.inject({
      method: 'POST',
      url: '/api/github/branch-publishes/approval-requests',
      headers: localControlHeaders,
      payload: { dryRunId: dryRun.dryRunId },
    });
    const approvalResponse = await server.inject({
      method: 'POST',
      url: '/api/github/branch-publishes/manual-approvals',
      headers: localControlHeaders,
      payload: {
        dryRunId: dryRun.dryRunId,
        approvalRequestId: approvalRequestResponse.json().approvalRequestId,
        outcome: 'approved',
      },
    });
    const runResponse = await server.inject({
      method: 'POST',
      url: '/api/github/branch-publishes/runs',
      headers: localControlHeaders,
      payload: {
        dryRunId: dryRun.dryRunId,
        approvalArtifactId: approvalResponse.json().approvalArtifactId,
        owner: 'octo-org',
        repo: 'codexhub',
        baseBranch: 'main',
        branchName: 'codexhub/m17-publish',
        commitMessageSummary: 'Publish governed CodexHub patch',
        files: branchPublishFiles,
      },
    });

    await server.close();
    await store.close();
    rmSync(dir, { recursive: true, force: true });

    expect(runResponse.statusCode).toBe(200);
    expect(runResponse.json()).toMatchObject({
      status: 'blocked',
      networkBoundaryInvoked: false,
    });
    expect(runResponse.json().blockReasons).toContain('github_branch_publish_disabled');
    expect(fetchCalled).toBe(false);
  });

  it('governs GitHub remote cleanup with token/origin gates and store-resolved approval', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'codexhub-github-remote-cleanup-'));
    const store = await createSqliteStore({ dbPath: join(dir, 'codexhub.sqlite') });
    const requested: Array<{ url: string; method?: string; body?: string }> = [];
    const fetchImpl = (async (url: string, init?: RequestInit) => {
      requested.push({ url, method: init?.method, body: init?.body as string | undefined });
      const method = init?.method ?? 'GET';
      const body =
        method === 'GET' && url.endsWith('/pulls/42')
          ? '{"number":42,"draft":true,"state":"open"}'
          : method === 'GET' && url.includes('/git/ref/heads/codexhub%2Fm20-r1')
            ? '{"ref":"refs/heads/codexhub/m20-r1"}'
            : method === 'PATCH'
              ? '{"number":42,"state":"closed"}'
              : method === 'DELETE'
                ? ''
                : '{"ok":true}';

      return {
        ok: true,
        status: method === 'DELETE' ? 204 : 200,
        async text() {
          return body;
        },
      };
    }) as unknown as typeof fetch;
    const server = buildSupervisorServer({
      store,
      localControlKey: localControlToken,
      githubProviderEnabled: true,
      githubRemoteCleanupEnabled: true,
      githubProviderCredential: 'ghp_secret',
      githubProviderFetch: fetchImpl,
    });

    const supersedesResponse = await server.inject({
      method: 'GET',
      url: '/api/github/supersedes/runs',
    });
    const missingTokenResponse = await server.inject({
      method: 'POST',
      url: '/api/github/remote-cleanups/dry-runs',
      payload: { owner: 'octo-org', repo: 'codexhub' },
    });
    const maliciousOriginResponse = await server.inject({
      method: 'POST',
      url: '/api/github/remote-cleanups/dry-runs',
      headers: { ...localControlHeaders, origin: 'https://evil.example' },
      payload: { owner: 'octo-org', repo: 'codexhub' },
    });
    const dryRunResponse = await server.inject({
      method: 'POST',
      url: '/api/github/remote-cleanups/dry-runs',
      headers: localControlHeaders,
      payload: {
        owner: 'octo-org',
        repo: 'codexhub',
        baseBranch: 'main',
        oldBranchName: 'codexhub/m20-r1',
        oldPrNumber: '42',
        sourceBranchPublishRunId: 'branch_publish_run_1',
        sourceDraftPrRunId: 'draft_pr_run_1',
        successorRunId: 'draft_pr_run_2',
        successorReady: true,
        oldPrDraft: true,
        supersededByNewerDraftPr: true,
        runnerMode: 'controlled-github-remote-cleanup',
      },
    });
    const dryRun = dryRunResponse.json();
    const disabledStoreDir = mkdtempSync(join(tmpdir(), 'codexhub-supervisor-disabled-recovery-'));
    const disabledStore = await createSqliteStore({
      dbPath: join(disabledStoreDir, 'codexhub.sqlite'),
    });
    const disabledRunServer = buildSupervisorServer({
      store: disabledStore,
      productionWorkflowRecoveryEnabled: true,
      productionWorkflowChildOrchestrationEnabled: false,
    });
    const disabledDryRunResponse = await disabledRunServer.inject({
      method: 'POST',
      url: '/api/workflows/production/recoveries/dry-runs',
      headers: localControlHeaders,
      payload: { templateId: 'local-patch-review' },
    });
    const forgedApprovalRequestResponse = await server.inject({
      method: 'POST',
      url: '/api/github/remote-cleanups/approval-requests',
      headers: localControlHeaders,
      payload: {
        dryRunId: dryRun.dryRunId,
        approvalArtifact: { approved: true },
      },
    });
    const approvalRequestResponse = await server.inject({
      method: 'POST',
      url: '/api/github/remote-cleanups/approval-requests',
      headers: localControlHeaders,
      payload: {
        dryRunId: dryRun.dryRunId,
        reason: 'approve remote cleanup',
      },
    });
    const approvalResponse = await server.inject({
      method: 'POST',
      url: '/api/github/remote-cleanups/manual-approvals',
      headers: localControlHeaders,
      payload: {
        dryRunId: dryRun.dryRunId,
        approvalRequestId: approvalRequestResponse.json().approvalRequestId,
        outcome: 'approved',
        reason: 'approved for cleanup',
      },
    });
    const forbiddenAuthorityResponse = await server.inject({
      method: 'POST',
      url: '/api/github/remote-cleanups/runs',
      headers: localControlHeaders,
      payload: {
        dryRunId: dryRun.dryRunId,
        approvalArtifactId: approvalResponse.json().approvalArtifactId,
        executionAuthority: { allowed: true },
      },
    });
    const mismatchResponse = await server.inject({
      method: 'POST',
      url: '/api/github/remote-cleanups/runs',
      headers: localControlHeaders,
      payload: {
        dryRunId: dryRun.dryRunId,
        approvalArtifactId: approvalResponse.json().approvalArtifactId,
        owner: 'octo-org',
        repo: 'codexhub',
        baseBranch: 'main',
        oldBranchName: 'codexhub/different',
        oldPrNumber: '42',
      },
    });
    const approvalsAfterMismatchResponse = await server.inject({
      method: 'GET',
      url: '/api/github/remote-cleanups/approvals',
    });
    const requestCountBeforeCompleted = requested.length;
    const completedResponse = await server.inject({
      method: 'POST',
      url: '/api/github/remote-cleanups/runs',
      headers: localControlHeaders,
      payload: {
        dryRunId: dryRun.dryRunId,
        approvalArtifactId: approvalResponse.json().approvalArtifactId,
        owner: 'octo-org',
        repo: 'codexhub',
        baseBranch: 'main',
        oldBranchName: 'codexhub/m20-r1',
        oldPrNumber: '42',
      },
    });
    const runsResponse = await server.inject({
      method: 'GET',
      url: '/api/github/remote-cleanups/runs',
    });
    const approvalsResponse = await server.inject({
      method: 'GET',
      url: '/api/github/remote-cleanups/approvals',
    });

    await server.close();
    await store.close();
    rmSync(dir, { recursive: true, force: true });
    await disabledRunServer.close();
    await disabledStore.close();
    rmSync(disabledStoreDir, { recursive: true, force: true });

    expect(supersedesResponse.statusCode).toBe(200);
    expect(supersedesResponse.json().records).toEqual([]);
    expect(missingTokenResponse.statusCode).toBe(401);
    expect(maliciousOriginResponse.statusCode).toBe(403);
    expect(dryRunResponse.statusCode).toBe(200);
    expect(disabledDryRunResponse.statusCode).toBe(200);
    expect(disabledDryRunResponse.json()).toMatchObject({
      status: 'blocked',
      childAdapterExecuteAllowed: false,
      processBoundaryInvoked: false,
      networkBoundaryInvoked: false,
    });
    expect(dryRun.status).toBe('planned');
    expect(dryRun.deleteRefAllowed).toBe(true);
    expect(dryRun.deleteNonCodexhubBranchAllowed).toBe(false);
    expect(dryRunResponse.body).not.toContain('octo-org');
    expect(dryRunResponse.body).not.toContain('codexhub/m20-r1');
    expect(forgedApprovalRequestResponse.statusCode).toBe(400);
    expect(approvalResponse.statusCode).toBe(200);
    expect(forbiddenAuthorityResponse.statusCode).toBe(400);
    expect(forbiddenAuthorityResponse.json()).toMatchObject({
      networkBoundaryInvoked: false,
    });
    expect(mismatchResponse.statusCode).toBe(200);
    expect(mismatchResponse.json()).toMatchObject({
      status: 'blocked',
      networkBoundaryInvoked: false,
    });
    expect(requestCountBeforeCompleted).toBe(0);
    expect(
      approvalsAfterMismatchResponse
        .json()
        .records.some((record: { status: string }) => record.status === 'approved'),
    ).toBe(true);
    expect(
      approvalsAfterMismatchResponse
        .json()
        .records.some((record: { status: string }) => record.status === 'used'),
    ).toBe(false);
    expect(completedResponse.statusCode).toBe(200);
    expect(completedResponse.json()).toMatchObject({
      status: 'completed',
      oldPrClosed: true,
      oldBranchDeleted: true,
      networkBoundaryInvoked: true,
      noRealWrite: false,
    });
    expect(runsResponse.json().records).toHaveLength(2);
    expect(approvalsResponse.json().records.some((record: { status: string }) => record.status === 'used')).toBe(
      true,
    );
    expect(requested.map((request) => `${request.method ?? 'GET'} ${request.url}`)).toEqual([
      'GET https://api.github.com/repos/octo-org/codexhub',
      'GET https://api.github.com/repos/octo-org/codexhub/pulls/42',
      'GET https://api.github.com/repos/octo-org/codexhub/git/ref/heads/codexhub%2Fm20-r1',
      'PATCH https://api.github.com/repos/octo-org/codexhub/pulls/42',
      'DELETE https://api.github.com/repos/octo-org/codexhub/git/refs/heads/codexhub%2Fm20-r1',
    ]);
    expect(requested.at(3)?.body).toBe('{"state":"closed"}');
    expect(completedResponse.body).not.toContain('octo-org');
    expect(completedResponse.body).not.toContain('codexhub/m20-r1');
    expect(completedResponse.body).not.toContain('ghp_secret');
    expect(completedResponse.body).not.toContain('refs/heads');
    expect(completedResponse.body).not.toContain('/merge');
  });

  it('governs custom workflow dry-runs, approvals, and metadata-only coordination runs', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'codexhub-supervisor-custom-workflows-'));
    const store = await createSqliteStore({ dbPath: join(dir, 'codexhub.sqlite') });
    const server = buildSupervisorServer({ store, customWorkflowEnabled: true });

    const missingTokenResponse = await server.inject({
      method: 'POST',
      url: '/api/workflows/custom/dry-runs',
      payload: { templateId: 'fixture.custom-workflow.local-pilot' },
    });
    const maliciousOriginResponse = await server.inject({
      method: 'POST',
      url: '/api/workflows/custom/dry-runs',
      headers: { ...localControlHeaders, origin: 'https://evil.example' },
      payload: { templateId: 'fixture.custom-workflow.local-pilot' },
    });
    const forbiddenRawBodyResponse = await server.inject({
      method: 'POST',
      url: '/api/workflows/custom/dry-runs',
      headers: localControlHeaders,
      payload: {
        templateId: 'fixture.custom-workflow.local-pilot',
        prompt: 'raw prompt body',
      },
    });
    const dryRunResponse = await server.inject({
      method: 'POST',
      url: '/api/workflows/custom/dry-runs',
      headers: localControlHeaders,
      payload: {
        templateId: 'fixture.custom-workflow.local-pilot',
        templateHash: 'sha256:custom-workflow-template',
      },
    });
    const catalogDisabledDryRunResponse = await server.inject({
      method: 'POST',
      url: '/api/workflows/custom/dry-runs',
      headers: localControlHeaders,
      payload: {
        templateId: 'local-patch-review',
      },
    });
    const catalogStaleHashResponse = await server.inject({
      method: 'POST',
      url: '/api/workflows/custom/dry-runs',
      headers: localControlHeaders,
      payload: {
        templateId: 'local-patch-review',
        templateHash: 'sha256:stale-template-hash',
      },
    });
    const catalogBlockedApprovalResponse = await server.inject({
      method: 'POST',
      url: '/api/workflows/custom/approval-requests',
      headers: localControlHeaders,
      payload: {
        dryRunId: catalogDisabledDryRunResponse.json().dryRunId,
        reason: 'blocked catalog template should not be approvable',
      },
    });
    const dryRun = dryRunResponse.json();
    const forgedApprovalRequestResponse = await server.inject({
      method: 'POST',
      url: '/api/workflows/custom/approval-requests',
      headers: localControlHeaders,
      payload: {
        dryRunId: dryRun.dryRunId,
        approvalArtifact: { id: 'caller-supplied' },
      },
    });
    const approvalRequestResponse = await server.inject({
      method: 'POST',
      url: '/api/workflows/custom/approval-requests',
      headers: localControlHeaders,
      payload: {
        dryRunId: dryRun.dryRunId,
        reason: 'custom workflow operator review',
      },
    });
    const manualApprovalResponse = await server.inject({
      method: 'POST',
      url: '/api/workflows/custom/manual-approvals',
      headers: localControlHeaders,
      payload: {
        dryRunId: dryRun.dryRunId,
        approvalRequestId: approvalRequestResponse.json().approvalRequestId,
        outcome: 'approved',
        reason: 'custom workflow approved',
      },
    });
    const persistedDryRun = await store.customWorkflowDryRuns.getDryRun(dryRun.recordId);
    const childRecordHashes = Object.fromEntries(
      (persistedDryRun?.stepPlans ?? [])
        .filter((step) => step.childApprovalRequired)
        .map((step) => [step.stepId, `sha256:${hashTestText(step.stepId)}`]),
    );
    const forbiddenAuthorityResponse = await server.inject({
      method: 'POST',
      url: '/api/workflows/custom/runs',
      headers: localControlHeaders,
      payload: {
        dryRunId: dryRun.dryRunId,
        approvalArtifactId: manualApprovalResponse.json().approvalArtifactId,
        executionAuthority: { allowed: true },
      },
    });
    const mismatchResponse = await server.inject({
      method: 'POST',
      url: '/api/workflows/custom/runs',
      headers: localControlHeaders,
      payload: {
        dryRunId: dryRun.dryRunId,
        approvalArtifactId: manualApprovalResponse.json().approvalArtifactId,
        templateId: dryRun.templateId,
        templateHash: 'sha256:mismatched-custom-workflow-template',
        childRecordHashes,
      },
    });
    const approvalsAfterMismatchResponse = await server.inject({
      method: 'GET',
      url: '/api/workflows/custom/approvals',
    });
    const missingChildHashesResponse = await server.inject({
      method: 'POST',
      url: '/api/workflows/custom/runs',
      headers: localControlHeaders,
      payload: {
        dryRunId: dryRun.dryRunId,
        approvalArtifactId: manualApprovalResponse.json().approvalArtifactId,
        templateId: dryRun.templateId,
        templateHash: dryRun.templateHash,
        childRecordHashes: {},
      },
    });
    const approvalsAfterMissingChildResponse = await server.inject({
      method: 'GET',
      url: '/api/workflows/custom/approvals',
    });
    const completedResponse = await server.inject({
      method: 'POST',
      url: '/api/workflows/custom/runs',
      headers: localControlHeaders,
      payload: {
        dryRunId: dryRun.dryRunId,
        approvalArtifactId: manualApprovalResponse.json().approvalArtifactId,
        templateId: dryRun.templateId,
        templateHash: dryRun.templateHash,
        childRecordHashes,
      },
    });
    const reusedApprovalResponse = await server.inject({
      method: 'POST',
      url: '/api/workflows/custom/runs',
      headers: localControlHeaders,
      payload: {
        dryRunId: dryRun.dryRunId,
        approvalArtifactId: manualApprovalResponse.json().approvalArtifactId,
        templateId: dryRun.templateId,
        templateHash: dryRun.templateHash,
        childRecordHashes,
      },
    });
    const runsResponse = await server.inject({
      method: 'GET',
      url: '/api/workflows/custom/runs',
    });
    const runShowResponse = await server.inject({
      method: 'GET',
      url: `/api/workflows/custom/runs/${completedResponse.json().runId}`,
    });
    const approvalsResponse = await server.inject({
      method: 'GET',
      url: '/api/workflows/custom/approvals',
    });
    const rehearsalResponse = await server.inject({
      method: 'GET',
      url: '/api/workflows/custom/rehearsals/latest',
    });

    await server.close();
    await store.close();
    rmSync(dir, { recursive: true, force: true });

    expect(missingTokenResponse.statusCode).toBe(401);
    expect(maliciousOriginResponse.statusCode).toBe(403);
    expect(forbiddenRawBodyResponse.statusCode).toBe(400);
    expect(dryRunResponse.statusCode).toBe(200);
    expect(dryRun).toMatchObject({
      status: 'planned',
      templateId: 'fixture.custom-workflow.local-pilot',
      templateHash: 'sha256:custom-workflow-template',
      directAdapterExecutionAllowed: false,
      processBoundaryInvoked: false,
      networkBoundaryInvoked: false,
    });
    expect(catalogDisabledDryRunResponse.statusCode).toBe(200);
    expect(catalogDisabledDryRunResponse.json()).toMatchObject({
      status: 'blocked',
      templateId: 'local-patch-review',
      validationStatus: 'valid',
      directAdapterExecutionAllowed: false,
      processBoundaryInvoked: false,
      networkBoundaryInvoked: false,
    });
    expect(catalogDisabledDryRunResponse.json().blockReasons).toContain(
      'custom_workflow_template_production_disabled',
    );
    expect(catalogStaleHashResponse.statusCode).toBe(409);
    expect(catalogStaleHashResponse.json()).toMatchObject({
      error: 'custom workflow catalog template hash mismatch',
      status: 'blocked',
      directAdapterExecutionAllowed: false,
    });
    expect(catalogBlockedApprovalResponse.statusCode).toBe(409);
    expect(catalogBlockedApprovalResponse.json()).toMatchObject({
      error: 'custom workflow dry-run is blocked',
      status: 'blocked',
      directAdapterExecutionAllowed: false,
    });
    expect(forgedApprovalRequestResponse.statusCode).toBe(400);
    expect(approvalRequestResponse.statusCode).toBe(200);
    expect(manualApprovalResponse.statusCode).toBe(200);
    expect(manualApprovalResponse.json()).toMatchObject({
      status: 'approved',
      reasonHash: expect.any(String),
      processBoundaryInvoked: false,
      networkBoundaryInvoked: false,
    });
    expect(forbiddenAuthorityResponse.statusCode).toBe(400);
    expect(forbiddenAuthorityResponse.json()).toMatchObject({
      directAdapterExecutionAllowed: false,
      processBoundaryInvoked: false,
      networkBoundaryInvoked: false,
    });
    expect(mismatchResponse.statusCode).toBe(409);
    expect(mismatchResponse.json()).toMatchObject({
      error: 'custom workflow template hash mismatch',
    });
    expect(
      approvalsAfterMismatchResponse
        .json()
        .records.some((record: { status: string }) => record.status === 'approved'),
    ).toBe(true);
    expect(
      approvalsAfterMismatchResponse
        .json()
        .records.some((record: { status: string }) => record.status === 'used'),
    ).toBe(false);
    expect(missingChildHashesResponse.statusCode).toBe(200);
    expect(missingChildHashesResponse.json()).toMatchObject({
      status: 'blocked',
      directAdapterExecutionAllowed: false,
      processBoundaryInvoked: false,
      externalProcessStarted: false,
      networkBoundaryInvoked: false,
    });
    expect(missingChildHashesResponse.json().blockReasons).toEqual([]);
    expect(
      missingChildHashesResponse
        .json()
        .steps.some((step: { blockReasons: string[] }) =>
          step.blockReasons.includes('custom_workflow_child_record_missing'),
        ),
    ).toBe(true);
    expect(
      approvalsAfterMissingChildResponse
        .json()
        .records.some((record: { status: string }) => record.status === 'approved'),
    ).toBe(true);
    expect(
      approvalsAfterMissingChildResponse
        .json()
        .records.some((record: { status: string }) => record.status === 'used'),
    ).toBe(false);
    expect(completedResponse.statusCode).toBe(200);
    expect(completedResponse.json()).toMatchObject({
      status: 'completed',
      directAdapterExecutionAllowed: false,
      processBoundaryInvoked: false,
      externalProcessStarted: false,
      networkBoundaryInvoked: false,
      noRealWrite: true,
    });
    expect(reusedApprovalResponse.statusCode).toBe(409);
    expect(reusedApprovalResponse.json()).toMatchObject({
      error: 'custom workflow approval is not approved',
      status: 'blocked',
      approvalStatus: 'used',
      directAdapterExecutionAllowed: false,
    });
    expect(runsResponse.json().records).toHaveLength(2);
    expect(runShowResponse.statusCode).toBe(200);
    expect(
      approvalsResponse.json().records.filter((record: { status: string }) => record.status === 'used'),
    ).toHaveLength(1);
    expect(rehearsalResponse.json()).toMatchObject({
      processBoundaryInvoked: false,
      networkBoundaryInvoked: false,
      executionDisabled: true,
    });
    for (const responseBody of [
      dryRunResponse.body,
      manualApprovalResponse.body,
      missingChildHashesResponse.body,
      completedResponse.body,
      reusedApprovalResponse.body,
      runShowResponse.body,
      rehearsalResponse.body,
    ]) {
      expect(responseBody).not.toContain('raw prompt body');
      expect(responseBody).not.toContain('adapter.execute');
      expect(responseBody).not.toContain(localControlToken);
      expect(responseBody).not.toContain('custom workflow approved');
    }
  });

  it('governs production workflow recovery without substituting child approvals', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'codexhub-supervisor-workflow-recoveries-'));
    const store = await createSqliteStore({ dbPath: join(dir, 'codexhub.sqlite') });
    const server = buildSupervisorServer({
      store,
      productionWorkflowRecoveryEnabled: true,
      productionWorkflowChildOrchestrationEnabled: true,
      localProductionWorkflowPilotEnabled: true,
    });

    const missingTokenResponse = await server.inject({
      method: 'POST',
      url: '/api/workflows/production/recoveries/dry-runs',
      payload: { templateId: 'local-patch-review' },
    });
    const maliciousOriginResponse = await server.inject({
      method: 'POST',
      url: '/api/workflows/production/recoveries/dry-runs',
      headers: { ...localControlHeaders, origin: 'https://evil.example' },
      payload: { templateId: 'local-patch-review' },
    });
    const forbiddenRawBodyResponse = await server.inject({
      method: 'POST',
      url: '/api/workflows/production/recoveries/dry-runs',
      headers: localControlHeaders,
      payload: { templateId: 'local-patch-review', prompt: 'raw prompt body' },
    });
    const staleHashResponse = await server.inject({
      method: 'POST',
      url: '/api/workflows/production/recoveries/dry-runs',
      headers: localControlHeaders,
      payload: { templateId: 'local-patch-review', templateHash: 'sha256:stale' },
    });
    const dryRunResponse = await server.inject({
      method: 'POST',
      url: '/api/workflows/production/recoveries/dry-runs',
      headers: localControlHeaders,
      payload: { templateId: 'local-patch-review' },
    });
    const dryRun = dryRunResponse.json();
    const forgedApprovalRequestResponse = await server.inject({
      method: 'POST',
      url: '/api/workflows/production/recoveries/approval-requests',
      headers: localControlHeaders,
      payload: { dryRunId: dryRun.dryRunId, childArtifacts: [{ id: 'caller-child' }] },
    });
    const approvalRequestResponse = await server.inject({
      method: 'POST',
      url: '/api/workflows/production/recoveries/approval-requests',
      headers: localControlHeaders,
      payload: { dryRunId: dryRun.dryRunId, reason: 'recover local workflow' },
    });
    const manualApprovalResponse = await server.inject({
      method: 'POST',
      url: '/api/workflows/production/recoveries/manual-approvals',
      headers: localControlHeaders,
      payload: {
        dryRunId: dryRun.dryRunId,
        approvalRequestId: approvalRequestResponse.json().approvalRequestId,
        outcome: 'approved',
        reason: 'approve workflow recovery',
      },
    });
    const forbiddenAuthorityResponse = await server.inject({
      method: 'POST',
      url: '/api/workflows/production/recoveries/runs',
      headers: localControlHeaders,
      payload: {
        dryRunId: dryRun.dryRunId,
        approvalArtifactId: manualApprovalResponse.json().approvalArtifactId,
        executionAuthority: { allowed: true },
      },
    });
    const forgedRunChildArtifactResponse = await server.inject({
      method: 'POST',
      url: '/api/workflows/production/recoveries/runs',
      headers: localControlHeaders,
      payload: {
        dryRunId: dryRun.dryRunId,
        approvalArtifactId: manualApprovalResponse.json().approvalArtifactId,
        childArtifacts: [{ id: 'caller-child' }],
      },
    });
    const forgedRunApprovalArtifactResponse = await server.inject({
      method: 'POST',
      url: '/api/workflows/production/recoveries/runs',
      headers: localControlHeaders,
      payload: {
        dryRunId: dryRun.dryRunId,
        approvalArtifactId: manualApprovalResponse.json().approvalArtifactId,
        approvalArtifact: { status: 'approved' },
      },
    });
    const mismatchResponse = await server.inject({
      method: 'POST',
      url: '/api/workflows/production/recoveries/runs',
      headers: localControlHeaders,
      payload: {
        dryRunId: dryRun.dryRunId,
        approvalArtifactId: manualApprovalResponse.json().approvalArtifactId,
        templateId: dryRun.templateId,
        templateHash: 'sha256:mismatch',
      },
    });
    const approvalsAfterMismatchResponse = await server.inject({
      method: 'GET',
      url: '/api/workflows/production/recoveries/approvals',
    });
    const waitingChildApprovalResponse = await server.inject({
      method: 'POST',
      url: '/api/workflows/production/recoveries/runs',
      headers: localControlHeaders,
      payload: {
        dryRunId: dryRun.dryRunId,
        approvalArtifactId: manualApprovalResponse.json().approvalArtifactId,
        templateId: dryRun.templateId,
        templateHash: dryRun.templateHash,
      },
    });
    const approvalsAfterWaitingChildResponse = await server.inject({
      method: 'GET',
      url: '/api/workflows/production/recoveries/approvals',
    });
    const reusedWaitingApprovalResponse = await server.inject({
      method: 'POST',
      url: '/api/workflows/production/recoveries/runs',
      headers: localControlHeaders,
      payload: {
        dryRunId: dryRun.dryRunId,
        approvalArtifactId: manualApprovalResponse.json().approvalArtifactId,
        templateId: dryRun.templateId,
        templateHash: dryRun.templateHash,
      },
    });
    const secondApprovalRequestResponse = await server.inject({
      method: 'POST',
      url: '/api/workflows/production/recoveries/approval-requests',
      headers: localControlHeaders,
      payload: { dryRunId: dryRun.dryRunId, reason: 'recover after child approvals' },
    });
    const secondManualApprovalResponse = await server.inject({
      method: 'POST',
      url: '/api/workflows/production/recoveries/manual-approvals',
      headers: localControlHeaders,
      payload: {
        dryRunId: dryRun.dryRunId,
        approvalRequestId: secondApprovalRequestResponse.json().approvalRequestId,
        outcome: 'approved',
        reason: 'second recovery approval',
      },
    });
    const forgedChildStateResponse = await server.inject({
      method: 'POST',
      url: '/api/workflows/production/recoveries/runs',
      headers: localControlHeaders,
      payload: {
        dryRunId: dryRun.dryRunId,
        approvalArtifactId: secondManualApprovalResponse.json().approvalArtifactId,
        templateId: dryRun.templateId,
        templateHash: dryRun.templateHash,
        childApprovalApproved: Object.fromEntries(
          dryRun.childActionPlans.map((action: { actionId: string }) => [action.actionId, true]),
        ),
      },
    });
    const childCreatedAt = '2026-05-06T00:00:00.000Z';
    const worktreeDryRun = {
      id: 'm35_worktree_dry_run',
      schemaVersion: '2026-04-28.foundation',
      createdAt: childCreatedAt,
      dryRunId: 'm35_worktree_dry_run',
      status: 'ready',
      evidenceRefs: [],
      auditEventIds: ['audit_m35_worktree_dry_run'],
      summary: 'Worktree child dry-run metadata only.',
    } as unknown as WorktreeDryRunRecord;
    const worktreeApproval = {
      id: 'm35_worktree_approval_record',
      schemaVersion: '2026-04-28.foundation',
      createdAt: childCreatedAt,
      dryRunId: worktreeDryRun.dryRunId,
      approvalRequestId: 'm35_worktree_approval_request',
      approvalArtifactId: 'm35_worktree_approval_artifact',
      status: 'approved',
      approved: true,
      auditEventIds: ['audit_m35_worktree_approval'],
      evidenceRefs: [],
      rawPathStored: false,
      bodyStored: false,
      summary: 'Worktree child approval metadata only.',
    } as unknown as WorktreeApprovalArtifactRecord;
    const worktreeRun = {
      id: 'm35_worktree_run',
      schemaVersion: '2026-04-28.foundation',
      createdAt: childCreatedAt,
      dryRunId: worktreeDryRun.dryRunId,
      status: 'completed',
      processBoundaryInvoked: true,
      externalProcessStarted: true,
      networkBoundaryInvoked: false,
      evidenceRefIds: ['evidence_m35_worktree_run'],
      auditEventIds: ['audit_m35_worktree_run'],
      rawPathStored: false,
      bodyStored: false,
      summary: 'Worktree child run completed through its own control plane.',
    } as unknown as WorktreeControlPlaneRun;
    const codexPatchRecord: CodexPatchChildRecord = {
      id: 'm35_codex_patch_child_record',
      schemaVersion: '2026-04-28.foundation',
      createdAt: childCreatedAt,
      childRecordId: 'm35_codex_patch_child_record',
      dryRunId: 'm35_codex_patch_dry_run',
      approvalArtifactId: 'm35_codex_patch_approval_artifact',
      runId: 'm35_codex_patch_run',
      status: 'completed',
      governedInputHash: 'sha256:codex-input',
      expectedInputHash: 'sha256:codex-input',
      worktreePathHash: 'sha256:worktree-path',
      changedFileCount: 1,
      diffHash: 'sha256:codex-diff',
      evidenceRefIds: ['evidence_m35_codex_patch_run'],
      auditEventIds: ['audit_m35_codex_patch_run'],
      processBoundaryInvoked: true,
      externalProcessStarted: true,
      networkBoundaryInvoked: false,
      realWriteExecuted: true,
      repoRootWriteAllowed: false,
      rawPromptStored: false,
      rawStdoutStored: false,
      rawStderrStored: false,
      rawDiffStored: false,
      bodyStored: false,
      rawPathStored: false,
      summary: 'Codex patch child record stores only isolated worktree patch metadata.',
    };
    const nxRecord: NxVerificationChildRecord = {
      id: 'm35_nx_verification_child_record',
      schemaVersion: '2026-04-28.foundation',
      createdAt: childCreatedAt,
      childRecordId: 'm35_nx_verification_child_record',
      dryRunId: 'm35_nx_verification_dry_run',
      runId: 'm35_nx_verification_run',
      status: 'completed',
      verificationRunIdHash: 'sha256:nx-run',
      targetCount: 3,
      passedCount: 3,
      failedCount: 0,
      skippedCount: 0,
      commandSummaryHash: 'sha256:nx-command',
      evidenceRefIds: ['evidence_m35_nx_verification_run'],
      auditEventIds: ['audit_m35_nx_verification_run'],
      processBoundaryInvoked: true,
      externalProcessStarted: true,
      networkBoundaryInvoked: false,
      rawStdoutStored: false,
      rawStderrStored: false,
      bodyStored: false,
      rawPathStored: false,
      summary: 'Nx verification child record stores only target counts and hashes.',
    };
    const reviewDryRun = {
      id: 'm35_review_package_dry_run',
      schemaVersion: '2026-04-28.foundation',
      createdAt: childCreatedAt,
      dryRunId: 'm35_review_package_dry_run',
      status: 'planned',
      evidenceRefs: [],
      auditEventIds: ['audit_m35_review_package_dry_run'],
      summary: 'Review package dry-run metadata only.',
    } as unknown as LocalReviewPackageDryRunRecord;
    const reviewApproval = {
      id: 'm35_review_package_approval_record',
      schemaVersion: '2026-04-28.foundation',
      createdAt: childCreatedAt,
      dryRunId: reviewDryRun.dryRunId,
      approvalRequestId: 'm35_review_package_approval_request',
      approvalArtifactId: 'm35_review_package_approval_artifact',
      status: 'approved',
      approved: true,
      evidenceRefs: [],
      auditEventIds: ['audit_m35_review_package_approval'],
      rawPathStored: false,
      bodyStored: false,
      summary: 'Review package approval metadata only.',
    } as unknown as LocalReviewPackageApprovalArtifactRecord;
    const reviewRun = {
      id: 'm35_review_package_run',
      schemaVersion: '2026-04-28.foundation',
      createdAt: childCreatedAt,
      dryRunId: reviewDryRun.dryRunId,
      status: 'completed',
      processBoundaryInvoked: false,
      externalProcessStarted: false,
      artifactWriteBoundaryInvoked: true,
      evidenceRefs: [],
      auditEventIds: ['audit_m35_review_package_run'],
      rawPathStored: false,
      bodyStored: false,
      summary: 'Review package export child run completed through its own control plane.',
    } as unknown as LocalReviewPackageControlPlaneRun;
    await store.worktreeDryRuns.saveDryRun(worktreeDryRun);
    await store.worktreeApprovals.saveApproval(worktreeApproval);
    await store.worktreeRuns.saveRun(worktreeRun);
    await store.codexPatchChildRecords.saveRecord(codexPatchRecord);
    await store.nxVerificationChildRecords.saveRecord(nxRecord);
    await store.reviewPackageDryRuns.saveDryRun(reviewDryRun);
    await store.reviewPackageApprovals.saveApproval(reviewApproval);
    await store.reviewPackageRuns.saveRun(reviewRun);
    const childRecordRefs = dryRun.childActionPlans
      .filter((action: { childActionKind: string }) =>
        [
          'worktree-create',
          'codex-patch',
          'nx-verification',
          'review-package-export',
        ].includes(action.childActionKind),
      )
      .map((action: { actionId: string; stepId: string; childActionKind: string; childControlPlane: string }) => {
        if (action.childActionKind === 'worktree-create') {
          return {
            actionId: action.actionId,
            stepId: action.stepId,
            childActionKind: action.childActionKind,
            childControlPlane: action.childControlPlane,
            childDryRunId: worktreeDryRun.dryRunId,
            childApprovalArtifactId: worktreeApproval.approvalArtifactId,
            childRunId: worktreeRun.id,
            expectedRecordHash: hashTestMetadata({
              childControlPlane: action.childControlPlane,
              dryRun: worktreeDryRun,
              approval: worktreeApproval,
              run: worktreeRun,
            }),
          };
        }
        if (action.childActionKind === 'codex-patch') {
          return {
            actionId: action.actionId,
            stepId: action.stepId,
            childActionKind: action.childActionKind,
            childControlPlane: action.childControlPlane,
            childRecordId: codexPatchRecord.childRecordId,
            expectedRecordHash: hashTestMetadata(codexPatchRecord),
          };
        }
        if (action.childActionKind === 'nx-verification') {
          return {
            actionId: action.actionId,
            stepId: action.stepId,
            childActionKind: action.childActionKind,
            childControlPlane: action.childControlPlane,
            childRecordId: nxRecord.childRecordId,
            expectedRecordHash: hashTestMetadata(nxRecord),
          };
        }
        return {
          actionId: action.actionId,
          stepId: action.stepId,
          childActionKind: action.childActionKind,
          childControlPlane: action.childControlPlane,
          childDryRunId: reviewDryRun.dryRunId,
          childApprovalArtifactId: reviewApproval.approvalArtifactId,
          childRunId: reviewRun.id,
          expectedRecordHash: hashTestMetadata({
            childControlPlane: action.childControlPlane,
            dryRun: reviewDryRun,
            approval: reviewApproval,
            run: reviewRun,
          }),
        };
      });
    const completedResponse = await server.inject({
      method: 'POST',
      url: '/api/workflows/production/recoveries/runs',
      headers: localControlHeaders,
      payload: {
        dryRunId: dryRun.dryRunId,
        approvalArtifactId: secondManualApprovalResponse.json().approvalArtifactId,
        templateId: dryRun.templateId,
        templateHash: dryRun.templateHash,
        childRecordRefs,
      },
    });
    const runsResponse = await server.inject({
      method: 'GET',
      url: '/api/workflows/production/recoveries/runs',
    });
    const showResponse = await server.inject({
      method: 'GET',
      url: `/api/workflows/production/recoveries/runs/${completedResponse.json().runId}`,
    });
    const approvalsResponse = await server.inject({
      method: 'GET',
      url: '/api/workflows/production/recoveries/approvals',
    });
    const rehearsalResponse = await server.inject({
      method: 'GET',
      url: '/api/workflows/production/recoveries/rehearsals/latest',
    });

    await server.close();
    await store.close();
    rmSync(dir, { recursive: true, force: true });

    expect(missingTokenResponse.statusCode).toBe(401);
    expect(maliciousOriginResponse.statusCode).toBe(403);
    expect(forbiddenRawBodyResponse.statusCode).toBe(400);
    expect(staleHashResponse.statusCode).toBe(409);
    expect(dryRunResponse.statusCode).toBe(200);
    expect(dryRun).toMatchObject({
      status: 'planned',
      templateId: 'local-patch-review',
      childActionCount: 5,
      directAdapterExecutionAllowed: false,
      childAdapterExecuteAllowed: false,
      processBoundaryInvoked: false,
      networkBoundaryInvoked: false,
    });
    expect(forgedApprovalRequestResponse.statusCode).toBe(400);
    expect(approvalRequestResponse.statusCode).toBe(200);
    expect(manualApprovalResponse.statusCode).toBe(200);
    expect(manualApprovalResponse.json()).toMatchObject({
      status: 'approved',
      childApprovalsIncluded: false,
      processBoundaryInvoked: false,
      networkBoundaryInvoked: false,
    });
    expect(forbiddenAuthorityResponse.statusCode).toBe(400);
    expect(forgedRunChildArtifactResponse.statusCode).toBe(400);
    expect(forgedRunApprovalArtifactResponse.statusCode).toBe(400);
    expect(mismatchResponse.statusCode).toBe(409);
    expect(
      approvalsAfterMismatchResponse
        .json()
        .records.some((record: { status: string }) => record.status === 'approved'),
    ).toBe(true);
    expect(
      approvalsAfterMismatchResponse
        .json()
        .records.some((record: { status: string }) => record.status === 'used'),
    ).toBe(false);
    expect(waitingChildApprovalResponse.statusCode).toBe(409);
    expect(waitingChildApprovalResponse.json()).toMatchObject({
      status: 'blocked',
      directAdapterExecutionAllowed: false,
      childAdapterExecuteAllowed: false,
      processBoundaryInvoked: false,
      networkBoundaryInvoked: false,
    });
    expect(
      approvalsAfterWaitingChildResponse
        .json()
        .records.filter((record: { status: string }) => record.status === 'used'),
    ).toHaveLength(0);
    expect(reusedWaitingApprovalResponse.statusCode).toBe(409);
    expect(forgedChildStateResponse.statusCode).toBe(400);
    expect(completedResponse.statusCode).toBe(200);
    expect(completedResponse.json()).toMatchObject({
      status: 'completed',
      completedChildActionCount: 5,
      directAdapterExecutionAllowed: false,
      childAdapterExecuteAllowed: false,
      processBoundaryInvoked: false,
      networkBoundaryInvoked: false,
      noRealWrite: true,
    });
    expect(runsResponse.json().records).toHaveLength(1);
    expect(showResponse.statusCode).toBe(200);
    expect(
      approvalsResponse.json().records.filter((record: { status: string }) => record.status === 'used'),
    ).toHaveLength(1);
    expect(rehearsalResponse.json()).toMatchObject({
      processBoundaryInvoked: false,
      networkBoundaryInvoked: false,
      executionDisabled: true,
    });
    for (const responseBody of [
      dryRunResponse.body,
      manualApprovalResponse.body,
      waitingChildApprovalResponse.body,
      completedResponse.body,
      showResponse.body,
      rehearsalResponse.body,
    ]) {
      expect(responseBody).not.toContain('raw prompt body');
      expect(responseBody).not.toContain('adapter.execute');
      expect(responseBody).not.toContain(localControlToken);
      expect(responseBody).not.toContain('approve workflow recovery');
      expect(responseBody).not.toContain('childArtifacts');
    }
  });

  it('keeps remote production recovery waiting on separate child approvals', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'codexhub-supervisor-remote-workflow-recoveries-'));
    const store = await createSqliteStore({ dbPath: join(dir, 'codexhub.sqlite') });
    const server = buildSupervisorServer({
      store,
      productionWorkflowRecoveryEnabled: true,
      productionWorkflowChildOrchestrationEnabled: true,
    });

    const dryRunResponse = await server.inject({
      method: 'POST',
      url: '/api/workflows/production/recoveries/dry-runs',
      headers: localControlHeaders,
      payload: { templateId: 'github-draft-pr-chain' },
    });
    const dryRun = dryRunResponse.json();
    const approvalRequestResponse = await server.inject({
      method: 'POST',
      url: '/api/workflows/production/recoveries/approval-requests',
      headers: localControlHeaders,
      payload: { dryRunId: dryRun.dryRunId, reason: 'recover remote workflow' },
    });
    const manualApprovalResponse = await server.inject({
      method: 'POST',
      url: '/api/workflows/production/recoveries/manual-approvals',
      headers: localControlHeaders,
      payload: {
        dryRunId: dryRun.dryRunId,
        approvalRequestId: approvalRequestResponse.json().approvalRequestId,
        outcome: 'approved',
        reason: 'approve remote workflow recovery',
      },
    });
    const waitingChildApprovalResponse = await server.inject({
      method: 'POST',
      url: '/api/workflows/production/recoveries/runs',
      headers: localControlHeaders,
      payload: {
        dryRunId: dryRun.dryRunId,
        approvalArtifactId: manualApprovalResponse.json().approvalArtifactId,
        templateId: dryRun.templateId,
        templateHash: dryRun.templateHash,
      },
    });
    const approvalsAfterWaitingChildResponse = await server.inject({
      method: 'GET',
      url: '/api/workflows/production/recoveries/approvals',
    });

    await server.close();
    await store.close();
    rmSync(dir, { recursive: true, force: true });

    expect(dryRunResponse.statusCode).toBe(200);
    expect(dryRun).toMatchObject({
      status: 'planned',
      templateId: 'github-draft-pr-chain',
      directAdapterExecutionAllowed: false,
      childAdapterExecuteAllowed: false,
    });
    expect(approvalRequestResponse.statusCode).toBe(200);
    expect(manualApprovalResponse.statusCode).toBe(200);
    expect(waitingChildApprovalResponse.statusCode).toBe(200);
    expect(waitingChildApprovalResponse.json()).toMatchObject({
      status: 'waiting_for_child_approval',
      directAdapterExecutionAllowed: false,
      childAdapterExecuteAllowed: false,
      processBoundaryInvoked: false,
      networkBoundaryInvoked: false,
    });
    expect(
      waitingChildApprovalResponse
        .json()
        .childActionStates.every(
          (state: { childAutoApprovalAllowed: boolean; childAdapterExecuteAllowed: boolean }) =>
            state.childAutoApprovalAllowed === false && state.childAdapterExecuteAllowed === false,
        ),
    ).toBe(true);
    expect(
      approvalsAfterWaitingChildResponse
        .json()
        .records.filter((record: { status: string }) => record.status === 'used'),
    ).toHaveLength(1);
    expect(waitingChildApprovalResponse.body).not.toContain('approve remote workflow recovery');
    expect(waitingChildApprovalResponse.body).not.toContain(localControlToken);
  });
});

import { readFileSync } from 'node:fs';
import { request as httpRequest } from 'node:http';
import { describe, expect, it } from 'vitest';
import type { CodexHubStore } from '@codexhub/store-core';
import {
  adversarialPublicOutputFixture,
  findAdversarialPublicOutputRoundTripLeaks,
} from '../../../test-fixtures/adversarial-public-output-fixture';
import { createCodexHubMcpServer, startCodexHubMcpHttpServer } from './server';
import { invokeReadOnlyMcpTool } from './tools';

const localControlValue = 'test-local-control-value';
const localControlHeader = 'x-codexhub-local-token';

describe('codexhub MCP server', () => {
  it('registers stdio-capable tools without opening an HTTP server', () => {
    const server = createCodexHubMcpServer({
      workspaceRoot: process.cwd(),
      store: createFakeStore() as unknown as CodexHubStore,
    });

    expect(server.isConnected()).toBe(false);
  });

  it('protects HTTP MCP requests with local control, Origin, and Host gates', async () => {
    let handled = 0;
    const server = await startCodexHubMcpHttpServer({
      port: 0,
      localControlKey: localControlValue,
      disableStore: true,
      handleMcpRequest: async (_request, response) => {
        handled += 1;
        response.statusCode = 200;
        response.setHeader('content-type', 'application/json; charset=utf-8');
        response.end(JSON.stringify({ reached: true }));
      },
    });

    try {
      const base = `http://127.0.0.1:${server.port}`;
      const missing = await requestJson(base, {});
      const bad = await requestJson(base, {
        [localControlHeader]: 'bad',
      });
      const maliciousOrigin = await requestJson(base, {
        [localControlHeader]: localControlValue,
        origin: 'https://evil.example',
      });
      const badHost = await requestJson(base, {
        [localControlHeader]: localControlValue,
        host: 'evil.example',
      });
      const malformedLoopbackHost = await requestJson(base, {
        [localControlHeader]: localControlValue,
        host: 'localhost:3335.evil',
      });
      const missingPreflightHeader = await requestJson(base, {
        origin: 'http://localhost:5173',
        'access-control-request-method': 'POST',
        'access-control-request-headers': 'content-type',
      }, 'OPTIONS');
      const trustedPreflight = await requestJson(base, {
        origin: 'http://localhost:5173',
        'access-control-request-method': 'POST',
        'access-control-request-headers': `content-type, ${localControlHeader}`,
      }, 'OPTIONS');
      const trusted = await requestJson(base, {
        [localControlHeader]: localControlValue,
        origin: 'http://localhost:5173',
      });
      const mcpPrefixEscape = await requestJson(
        base,
        {
          [localControlHeader]: localControlValue,
          origin: 'http://localhost:5173',
        },
        'POST',
        '/mcp-extra',
      );

      expect(missing.statusCode).toBe(401);
      expect(bad.statusCode).toBe(401);
      expect(maliciousOrigin.statusCode).toBe(403);
      expect(badHost.statusCode).toBe(403);
      expect(malformedLoopbackHost.statusCode).toBe(403);
      expect(missingPreflightHeader.statusCode).toBe(401);
      expect(trustedPreflight.statusCode).toBe(204);
      expect(trustedPreflight.headers['access-control-allow-origin']).toBe(
        'http://localhost:5173',
      );
      expect(trustedPreflight.headers['access-control-allow-origin']).not.toBe('*');
      expect(trusted.statusCode).toBe(200);
      expect(mcpPrefixEscape.statusCode).toBe(404);
      expect(handled).toBe(1);
    } finally {
      await server.close();
    }
  });

  it('reports degraded health when the audit store is unavailable', async () => {
    const server = await startCodexHubMcpHttpServer({
      port: 0,
      localControlKey: localControlValue,
      disableStore: true,
    });

    try {
      const response = await requestJson(`http://127.0.0.1:${server.port}`, {}, 'GET', '/health');
      const maliciousOrigin = await requestJson(
        `http://127.0.0.1:${server.port}`,
        { origin: 'https://evil.example' },
        'GET',
        '/health',
      );
      const body = response.body as { metadata: { readOnlyToolsOnly: boolean }; status: string };

      expect(response.statusCode).toBe(200);
      expect(body.status).toBe('degraded');
      expect(body.metadata.readOnlyToolsOnly).toBe(true);
      expect(maliciousOrigin.statusCode).toBe(403);
    } finally {
      await server.close();
    }
  });

  it('returns MCP tool errors when audit store is unavailable', async () => {
    const result = await invokeReadOnlyMcpTool(
      'codexhub.getArchitectureMap',
      {},
      { workspaceRoot: process.cwd() },
    );

    expect(result.isError).toBe(true);
    expect(JSON.stringify(result)).toContain('audit_store_unavailable');
  });

  it('returns MCP tool errors when audit persistence fails', async () => {
    const store = createFakeStore();
    store.evidenceRefs.create = async () => {
      throw new Error('store unavailable');
    };

    const result = await invokeReadOnlyMcpTool(
      'codexhub.getArchitectureMap',
      {},
      { workspaceRoot: process.cwd(), store: store as unknown as CodexHubStore },
    );

    expect(result.isError).toBe(true);
    expect(JSON.stringify(result)).toContain('audit_store_unavailable');
    expect(JSON.stringify(result)).not.toContain('apps');
  });

  it('returns JSON summaries and records evidence plus audit for read-only tools', async () => {
    const store = createFakeStore();
    const result = await invokeReadOnlyMcpTool(
      'codexhub.getAffectedProjectsDryRun',
      { targets: ['lint'], baseRef: 'HEAD~1', headRef: 'HEAD' },
      { workspaceRoot: process.cwd(), store: store as unknown as CodexHubStore },
    );
    const serialized = JSON.stringify(result);

    expect(result.isError).toBeUndefined();
    expect(result.structuredContent).toMatchObject({
      status: 'ready',
      targets: ['lint'],
      externalProcessStarted: false,
    });
    expect(store.evidenceRefs.records).toHaveLength(1);
    expect(store.auditEvents.records).toHaveLength(1);
    expect(serialized).not.toContain('stdout');
    expect(serialized).not.toContain('stderr');
    expect(serialized).not.toContain('jsonl');
  });

  it('keeps MCP development request summaries metadata-only after store round-trip', async () => {
    const store = createFakeStore({
      developmentRuns: [
        {
          id: adversarialPublicOutputFixture,
          summary: {
            requestTitle: adversarialPublicOutputFixture,
            taskCount: 1,
            selectedSkillIds: [],
            agentRunCount: 1,
            verificationStatus: 'blocked',
            evidenceCount: 1,
            auditEventCount: 1,
            orchestrationPlanId: adversarialPublicOutputFixture,
            mockOnly: true,
          },
          evidenceRefs: [{ id: 'evidence_adversarial', kind: 'mcp.tool_invocation' }],
        },
      ],
    });

    const result = await invokeReadOnlyMcpTool(
      'codexhub.getOpenDevelopmentRequests',
      {},
      { workspaceRoot: process.cwd(), store: store as unknown as CodexHubStore },
    );
    const summary = result.structuredContent as {
      recentRunSummaries: Array<Record<string, unknown>>;
    };

    expect(result.isError).toBeUndefined();
    expect(findAdversarialPublicOutputRoundTripLeaks(result)).toEqual([]);
    expect(summary.recentRunSummaries[0]).toMatchObject({
      status: 'blocked',
      taskCount: 1,
      agentRunCount: 1,
      evidenceRefCount: 1,
    });
    expect(summary.recentRunSummaries[0]?.idHash).toMatch(/^sha256:/);
    expect(summary.recentRunSummaries[0]?.titleHash).toMatch(/^sha256:/);
    expect(summary.recentRunSummaries[0]?.summaryHash).toMatch(/^sha256:/);
    expect(summary.recentRunSummaries[0]).not.toHaveProperty('title');
    expect(summary.recentRunSummaries[0]).not.toHaveProperty('summary');
  });

  it('keeps all production MCP source away from adapter execute and live boundary helpers', () => {
    const mcpProductionSources = ['server.ts', 'security.ts', 'tool-outputs.ts', 'tools.ts'].map(
      (fileName) => ({
        fileName,
        source: readFileSync(new URL(`./${fileName}`, import.meta.url), 'utf8'),
      }),
    );
    const forbiddenExecuteTerms = [
      'executeCodexExecAdapter',
      'executeNxVerificationAdapter',
      'executeWorktreeManager',
      'executeWorktreeCleanup',
      'executePlaywrightObserverAdapter',
      'executeElectronCdpAdapter',
      'executeGithubMetadataObservation',
      'executeGithubBranchPublish',
      'executeGithubDraftPrCreation',
      'executeGithubPrLifecycleObservation',
      'executeGithubPublishDraftPrChain',
      'executeGithubRemoteCleanup',
      'executeLocalReviewPackageExport',
      'executeLocalRcBundleExport',
      'executeReworkLoop',
      'executeCustomWorkflowRun',
    ];

    for (const { source } of mcpProductionSources) {
      const directExecuteMatches = [...source.matchAll(/\bexecute[A-Z][A-Za-z0-9_]*/g)]
        .map((match) => match[0])
        .filter((term) => term !== 'executeTool');

      expect(directExecuteMatches).toEqual([]);

      for (const term of forbiddenExecuteTerms) {
        expect(source).not.toContain(term);
      }

      const childProcessName = ['child', 'process'].join('_');
      const childProcessModule = ['node:', childProcessName].join('');
      const githubTokenEnv = ['CODEXHUB', 'GITHUB', 'TOKEN'].join('_');
      const localControlTokenEnv = ['CODEXHUB', 'SUPERVISOR', 'LOCAL', 'TOKEN'].join('_');
      const supervisorLocalControlPrefix = ['CODEXHUB', 'SUPERVISOR', 'LOCAL', ''].join('_');

      expect(source).not.toContain(childProcessName);
      expect(source).not.toContain(childProcessModule);
      expect(source).not.toContain('fetch(');
      expect(source).not.toContain('globalThis["fetch"]');
      expect(source).not.toContain("globalThis['fetch']");
      expect(source).not.toContain(githubTokenEnv);
      expect(source).not.toContain(localControlTokenEnv);
      expect(source).not.toContain(supervisorLocalControlPrefix);
      expect(source).not.toContain('SUPERVISOR_LOCAL_ENV_VAR');
      expect(source).not.toContain(`process.env['${githubTokenEnv}']`);
      expect(source).not.toContain(`process.env["${githubTokenEnv}"]`);
      expect(source).not.toContain(`process.env['${localControlTokenEnv}']`);
      expect(source).not.toContain(`process.env["${localControlTokenEnv}"]`);
      expect(source).not.toContain('process["env"]');
      expect(source).not.toContain("process['env']");
      expect(source).not.toContain('workspace.applyPatchToControlledWorktree');
      expect(source).not.toContain(`import('${childProcessModule}')`);
      expect(source).not.toContain(`import("${childProcessModule}")`);
      expect(source).not.toContain(`require('${childProcessModule}')`);
      expect(source).not.toContain(`require("${childProcessModule}")`);
    }
  });

  it('keeps MCP bootstrap and HTTP security env access narrow and non-authoritative', () => {
    const mainSource = readFileSync(new URL('./main.ts', import.meta.url), 'utf8');
    const securitySource = readFileSync(new URL('./security.ts', import.meta.url), 'utf8');
    const combinedSource = `${mainSource}\n${securitySource}`;
    const allowedMainEnvReads = [
      'process.env.CODEXHUB_MCP_TRANSPORT',
      'process.env.CODEXHUB_MCP_HOST',
      'process.env.CODEXHUB_MCP_PORT',
    ];

    for (const envRead of allowedMainEnvReads) {
      expect(mainSource).toContain(envRead);
    }

    expect(securitySource).toContain('process.env[MCP_LOCAL_ENV_VAR]');
    expect(combinedSource).not.toContain('CODEXHUB_GITHUB_TOKEN');
    expect(combinedSource).not.toContain('CODEXHUB_SUPERVISOR_LOCAL_TOKEN');
    expect(combinedSource).not.toContain('CODEXHUB_RUNTIME_SCHEDULER_ENABLED');
    expect(combinedSource).not.toContain('CODEXHUB_EXTERNAL_AGENTS_ENABLED');
    expect(combinedSource).not.toContain('CODEXHUB_PLATFORM_OPERATIONS_ENABLED');
    expect(combinedSource).not.toContain('process.env["');
    expect(combinedSource).not.toContain("process.env['");
    expect(combinedSource).not.toContain('process["env"]');
    expect(combinedSource).not.toContain("process['env']");
    expect(combinedSource).not.toContain('fetch(');
    expect(combinedSource).not.toContain('globalThis.fetch');
    expect(combinedSource).not.toContain('child_process');
    expect(combinedSource).not.toContain('node:child_process');
    expect(combinedSource).not.toContain('spawn(');
    expect(combinedSource).not.toContain('execFile(');
  });

  it('keeps MCP production tools away from runtime, agent, and platform mutation routes', () => {
    const mcpProductionSources = ['server.ts', 'security.ts', 'tool-outputs.ts', 'tools.ts'].map(
      (fileName) => ({
        fileName,
        source: readFileSync(new URL(`./${fileName}`, import.meta.url), 'utf8'),
      }),
    );
    const forbiddenMutationTerms = [
      '/api/runtime/',
      '/api/agents/',
      '/api/platform/',
      '/api/production-ga/',
      '/api/browser/actions/',
      '/api/electron-cdp/main-inspector/',
      '/api/mcp/write-tools/',
      'RuntimeJobPlan',
      'ExternalAgentPatchPlan',
      'PlatformBackupPlan',
      'PlatformRestorePlan',
      'ProductionGaSignoffRun',
      'ProductionGaApprovalArtifact',
      'RuntimeQueueEntry',
      'workspace.applyPatchToControlledWorktree',
      'postControlledWriteCliMutation',
      'startRuntimeJob',
      'startExternalAgent',
      'startPlatformOperation',
    ];

    for (const { source } of mcpProductionSources) {
      for (const term of forbiddenMutationTerms) {
        expect(source).not.toContain(term);
      }
    }
  });

  it('keeps MCP tool execution source free of network, process, token, and route passthrough', () => {
    const toolExecutionSources = ['tool-outputs.ts', 'tools.ts'].map((fileName) => ({
      fileName,
      source: readFileSync(new URL(`./${fileName}`, import.meta.url), 'utf8'),
    }));
    const forbiddenToolExecutionTerms = [
      'process.env',
      'process["env"]',
      "process['env']",
      'CODEXHUB_GITHUB_TOKEN',
      'CODEXHUB_SUPERVISOR_LOCAL_TOKEN',
      'CODEXHUB_RUNTIME_SCHEDULER_ENABLED',
      'CODEXHUB_EXTERNAL_AGENTS_ENABLED',
      'CODEXHUB_PLATFORM_OPERATIONS_ENABLED',
      'CODEXHUB_PRODUCTION_GA_ENABLED',
      'node:child_process',
      'child_process',
      'spawn(',
      'execFile(',
      'exec(',
      'fetch(',
      'globalThis.fetch',
      'XMLHttpRequest',
      'WebSocket',
      'node:http',
      'node:https',
      'import(',
      'require(',
      '/api/runtime/',
      '/api/agents/',
      '/api/platform/',
      '/api/production-ga/',
      '/api/browser/actions/',
      '/api/electron-cdp/main-inspector/',
      '/api/mcp/write-tools/',
      'http://',
      'https://',
    ];

    for (const { fileName, source } of toolExecutionSources) {
      for (const term of forbiddenToolExecutionTerms) {
        expect(source, `${fileName} should not contain ${term}`).not.toContain(term);
      }
    }
  });
});

function requestJson(
  baseUrl: string,
  headers: Record<string, string>,
  method = 'POST',
  path = '/mcp',
): Promise<{
  statusCode: number;
  headers: Record<string, string | string[] | undefined>;
  body: Record<string, unknown>;
}> {
  return new Promise((resolve, reject) => {
    const url = new URL(path, baseUrl);
    const request = httpRequest(
      url,
      {
        method,
        headers,
      },
      (response) => {
        const chunks: Buffer[] = [];
        response.on('data', (chunk: Buffer) => chunks.push(chunk));
        response.on('end', () => {
          const text = Buffer.concat(chunks).toString('utf8');
          resolve({
            statusCode: response.statusCode ?? 0,
            headers: response.headers,
            body: text.length > 0 ? (JSON.parse(text) as Record<string, unknown>) : {},
          });
        });
      },
    );
    request.on('error', reject);
    request.end();
  });
}

function createFakeStore(options: { developmentRuns?: unknown[] } = {}) {
  const evidenceRecords: unknown[] = [];
  const auditRecords: unknown[] = [];
  const store = {
    evidenceRefs: {
      records: evidenceRecords,
      async create(ref: unknown) {
        evidenceRecords.push(ref);
        return ref;
      },
      async listEvidenceRefs() {
        return evidenceRecords;
      },
    },
    auditEvents: {
      records: auditRecords,
      async append(event: unknown) {
        auditRecords.push(event);
        return event;
      },
    },
    developmentRuns: {
      async listMockDevelopmentRuns() {
        return options.developmentRuns ?? [];
      },
    },
  };

  return store;
}

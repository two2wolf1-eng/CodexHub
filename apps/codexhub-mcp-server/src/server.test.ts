import { request as httpRequest } from 'node:http';
import { describe, expect, it } from 'vitest';
import type { CodexHubStore } from '@codexhub/store-core';
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

      expect(missing.statusCode).toBe(401);
      expect(bad.statusCode).toBe(401);
      expect(maliciousOrigin.statusCode).toBe(403);
      expect(badHost.statusCode).toBe(403);
      expect(missingPreflightHeader.statusCode).toBe(401);
      expect(trustedPreflight.statusCode).toBe(204);
      expect(trustedPreflight.headers['access-control-allow-origin']).toBe(
        'http://localhost:5173',
      );
      expect(trustedPreflight.headers['access-control-allow-origin']).not.toBe('*');
      expect(trusted.statusCode).toBe(200);
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

function createFakeStore() {
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
        return [];
      },
    },
  };

  return store;
}

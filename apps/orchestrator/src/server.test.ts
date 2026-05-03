import { describe, expect, it } from 'vitest';
import { buildOrchestratorServer } from './server';

const localControlToken = 'test-local-control-token';
const localControlHeaders = { 'x-codexhub-local-token': localControlToken };

describe('orchestrator local control server', () => {
  it('protects mutating minimal orchestration routes with origin and local control gates', async () => {
    const server = buildOrchestratorServer({
      disableStore: true,
      localControlKey: localControlToken,
      workspaceRoot: process.cwd(),
    });

    try {
      const maliciousOriginResponse = await server.inject({
        method: 'POST',
        url: '/api/orchestrator/minimal-runs',
        headers: {
          ...localControlHeaders,
          origin: 'https://evil.example',
        },
        payload: { title: 'Blocked origin' },
      });
      const missingTokenResponse = await server.inject({
        method: 'POST',
        url: '/api/orchestrator/minimal-runs',
        headers: {
          origin: 'http://127.0.0.1:5173',
        },
        payload: { title: 'Missing token' },
      });
      const missingPreflightHeaderResponse = await server.inject({
        method: 'OPTIONS',
        url: '/api/orchestrator/minimal-runs',
        headers: {
          origin: 'http://localhost:4173',
          'access-control-request-method': 'POST',
          'access-control-request-headers': 'content-type',
        },
      });
      const trustedPreflightResponse = await server.inject({
        method: 'OPTIONS',
        url: '/api/orchestrator/minimal-runs',
        headers: {
          origin: 'http://localhost:4173',
          'access-control-request-method': 'POST',
          'access-control-request-headers': 'content-type, x-codexhub-local-token',
        },
      });
      const trustedOriginResponse = await server.inject({
        method: 'POST',
        url: '/api/orchestrator/minimal-runs',
        headers: {
          ...localControlHeaders,
          origin: 'http://127.0.0.1:5173',
        },
        payload: {
          title: 'Blocked missing executable',
          description: 'No process boundary is configured for this route fixture.',
          dryRunId: 'codex_dry_run_route_fixture',
          governedInput: {
            relativePath: 'package.json',
            expectedContentHash: 'sha256:not-used-because-executable-is-missing',
          },
        },
      });
      const localResponse = await server.inject({
        method: 'POST',
        url: '/api/orchestrator/minimal-runs',
        headers: localControlHeaders,
        payload: {
          title: 'Blocked local request',
          description: 'No Origin requests still require local control.',
          dryRunId: 'codex_dry_run_local_route_fixture',
          governedInput: {
            relativePath: 'package.json',
            expectedContentHash: 'sha256:not-used-because-executable-is-missing',
          },
        },
      });

      expect(maliciousOriginResponse.statusCode).toBe(403);
      expect(maliciousOriginResponse.json().error).toBe('untrusted_origin');
      expect(missingTokenResponse.statusCode).toBe(401);
      expect(missingTokenResponse.json().error).toBe('invalid_local_control_token');
      expect(missingPreflightHeaderResponse.statusCode).toBe(401);
      expect(missingPreflightHeaderResponse.json().error).toBe('local_control_token_required');
      expect(trustedPreflightResponse.statusCode).toBe(204);
      expect(trustedPreflightResponse.headers['access-control-allow-origin']).toBe(
        'http://localhost:4173',
      );
      expect(trustedPreflightResponse.headers['access-control-allow-origin']).not.toBe('*');
      expect(trustedOriginResponse.statusCode).toBe(200);
      expect(trustedOriginResponse.headers['access-control-allow-origin']).toBe(
        'http://127.0.0.1:5173',
      );
      expect(trustedOriginResponse.json().run.status).toBe('blocked');
      expect(trustedOriginResponse.json().run.summary.processBoundaryInvoked).toBe(false);
      expect(trustedOriginResponse.json().run.summary.externalProcessStarted).toBe(false);
      expect(localResponse.statusCode).toBe(200);
      expect(localResponse.json().run.status).toBe('blocked');
    } finally {
      await server.close();
    }
  });

  it('returns metadata-only run list and detail records', async () => {
    const server = buildOrchestratorServer({
      disableStore: true,
      localControlKey: localControlToken,
      workspaceRoot: process.cwd(),
    });

    try {
      const createResponse = await server.inject({
        method: 'POST',
        url: '/api/orchestrator/minimal-runs',
        headers: localControlHeaders,
        payload: {
          title: 'List route fixture',
          description: 'Fixture must remain metadata-only.',
          dryRunId: 'codex_dry_run_list_fixture',
          governedInput: {
            relativePath: 'package.json',
            expectedContentHash: 'sha256:not-used-because-executable-is-missing',
          },
        },
      });
      const runId = createResponse.json().run.id;
      const listResponse = await server.inject({
        method: 'GET',
        url: '/api/orchestrator/minimal-runs',
      });
      const detailResponse = await server.inject({
        method: 'GET',
        url: `/api/orchestrator/minimal-runs/${runId}`,
      });
      const serialized = JSON.stringify(detailResponse.json());

      expect(listResponse.statusCode).toBe(200);
      expect(listResponse.json().count).toBe(1);
      expect(detailResponse.statusCode).toBe(200);
      expect(detailResponse.json().run.id).toBe(runId);
      expect(detailResponse.json().summary.bodyStored).toBe(false);
      expect(detailResponse.json().summary.rawPathStored).toBe(false);
      expect(serialized).not.toContain('Fixture must remain metadata-only.');
      expect(serialized).not.toContain('not-used-because-executable-is-missing');
    } finally {
      await server.close();
    }
  });
});


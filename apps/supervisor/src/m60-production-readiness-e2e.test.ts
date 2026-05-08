import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { createSqliteStore } from '@codexhub/store-sqlite';
import { buildSupervisorServer } from './server';

const localControlToken = 'test-local-control-token';
const localControlHeaders = { 'x-codexhub-local-token': localControlToken };

process.env.CODEXHUB_SUPERVISOR_LOCAL_TOKEN = localControlToken;

describe('M60 production readiness E2E rehearsal', () => {
  it('runs readiness, live-smoke gate, audit export, and blocked-live rehearsal as metadata-only projections', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'codexhub-m60-e2e-'));
    const store = await createSqliteStore({ dbPath: join(dir, 'codexhub.sqlite') });
    const server = buildSupervisorServer({ store });

    const readinessResponse = await server.inject({
      method: 'POST',
      url: '/api/production-readiness/rehearsals',
      headers: localControlHeaders,
      payload: {
        canaryKind: 'thread-turn',
        taskSeed: 'private e2e readiness task',
        targetSeed: 'private e2e readiness target',
        liveSmokeRequested: true,
      },
    });
    const liveSmokeResponse = await server.inject({
      method: 'POST',
      url: '/api/production-readiness/live-smoke-gates',
      headers: localControlHeaders,
      payload: {
        readinessGateId: readinessResponse.json().readinessGate.id,
        approvalArtifactSeed: 'private e2e live smoke approval',
        taskSeed: 'private e2e live smoke task',
      },
    });
    const auditExportResponse = await server.inject({
      method: 'POST',
      url: '/api/production-readiness/audit-exports',
      headers: localControlHeaders,
      payload: {
        exportSeed: 'private e2e audit export',
        manifestSeed: 'private e2e audit manifest',
      },
    });
    const blockedReadinessResponse = await server.inject({
      method: 'POST',
      url: '/api/production-readiness/rehearsals',
      headers: localControlHeaders,
      payload: {
        canaryKind: 'quota',
        failedCount: 1,
        liveSmokeRequested: true,
      },
    });
    const blockedLiveSmokeResponse = await server.inject({
      method: 'POST',
      url: '/api/production-readiness/live-smoke-gates',
      headers: localControlHeaders,
      payload: {
        readinessGateId: blockedReadinessResponse.json().readinessGate.id,
        approvalArtifactSeed: 'private e2e blocked approval',
      },
    });
    const summaryResponse = await server.inject({
      method: 'GET',
      url: '/api/production-readiness/summary',
    });

    await server.close();
    await store.close();
    rmSync(dir, { recursive: true, force: true });

    expect(readinessResponse.statusCode).toBe(200);
    expect(readinessResponse.json()).toMatchObject({
      status: 'ready',
      liveSmokeAllowed: true,
      highRiskLiveTaskBlocked: false,
    });
    expect(liveSmokeResponse.statusCode).toBe(200);
    expect(liveSmokeResponse.json()).toMatchObject({
      status: 'passed',
      liveSmokeAllowed: true,
      highRiskLiveTaskBlocked: false,
      processBoundaryInvoked: false,
      externalProcessStarted: false,
      networkBoundaryInvoked: false,
    });
    expect(auditExportResponse.statusCode).toBe(200);
    expect(auditExportResponse.json()).toMatchObject({
      status: 'planned',
      metadataOnly: true,
      processBoundaryInvoked: false,
      externalProcessStarted: false,
      networkBoundaryInvoked: false,
    });
    expect(blockedReadinessResponse.json()).toMatchObject({
      status: 'canary_blocked',
      highRiskLiveTaskBlocked: true,
    });
    expect(blockedLiveSmokeResponse.statusCode).toBe(409);
    expect(blockedLiveSmokeResponse.json()).toMatchObject({
      status: 'blocked',
      highRiskLiveTaskBlocked: true,
    });
    expect(summaryResponse.json()).toMatchObject({
      canaryRunCount: 3,
      driftGateCount: 2,
      readinessGateCount: 2,
      auditExportSummaryCount: 3,
      executionDisabled: true,
      processBoundaryInvoked: false,
      externalProcessStarted: false,
    });

    for (const body of [
      readinessResponse.body,
      liveSmokeResponse.body,
      auditExportResponse.body,
      blockedReadinessResponse.body,
      blockedLiveSmokeResponse.body,
      summaryResponse.body,
    ]) {
      expect(body).not.toContain('private e2e readiness task');
      expect(body).not.toContain('private e2e readiness target');
      expect(body).not.toContain('private e2e live smoke approval');
      expect(body).not.toContain('private e2e live smoke task');
      expect(body).not.toContain('private e2e audit export');
      expect(body).not.toContain('private e2e audit manifest');
      expect(body).not.toContain('private e2e blocked approval');
      expect(body).not.toContain(localControlToken);
    }
  });
});

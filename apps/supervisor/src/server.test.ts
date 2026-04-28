import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { createSqliteStore } from '@codexhub/store-sqlite';
import { buildSupervisorServer } from './server';

describe('supervisor mock development API', () => {
  it('runs and lists mock development orchestrations', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'codexhub-supervisor-'));
    const store = await createSqliteStore({ dbPath: join(dir, 'codexhub.sqlite') });
    const server = buildSupervisorServer({ store });

    const runResponse = await server.inject({
      method: 'POST',
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
      url: '/api/codex/exec/preflight',
      payload: { dryRunId },
    });
    const configResponse = await server.inject({
      method: 'GET',
      url: '/api/codex/exec/config',
    });
    const approvalRequestResponse = await server.inject({
      method: 'POST',
      url: '/api/codex/exec/approval-request',
      payload: {
        dryRunId,
        reason: 'manual private reason',
      },
    });
    const manualApprovalResponse = await server.inject({
      method: 'POST',
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
    const gateResponse = await server.inject({
      method: 'POST',
      url: '/api/codex/exec/evaluate-gate',
      payload: { dryRunId },
    });
    const rejectedCwdResponse = await server.inject({
      method: 'POST',
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
        outcome: 'deny',
      },
      liveRunRecord: {
        status: 'blocked',
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
      liveEnabled: false,
      allowedSandboxModes: ['read_only'],
    });
    expect(preflightResponse.statusCode).toBe(200);
    expect(preflightResponse.json()).toMatchObject({
      preflightResult: {
        status: 'blocked',
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
          liveEnabled: false,
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
    expect(gateResponse.statusCode).toBe(200);
    expect(gateResponse.json()).toMatchObject({
      executionGateResult: {
        status: 'blocked',
        liveExecution: false,
        externalProcessStarted: false,
        executionDisabled: true,
      },
    });
    expect(gateResponse.json().executionGateResult.reasons.join(' ')).toContain('disabled');
    expect(rejectedCwdResponse.statusCode).toBe(400);
  });
});

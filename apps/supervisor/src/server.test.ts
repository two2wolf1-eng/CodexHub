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
    expect(rejectedCwdResponse.statusCode).toBe(400);
  });
});

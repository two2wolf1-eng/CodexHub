import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  type CodexReplayRecord,
  type MockDevelopmentRun,
  SchemaVersionSchema,
} from '@codexhub/contracts';
import { createSqliteStore, resolveCodexHubDbPath } from './index';

describe('store-sqlite migration initialization', () => {
  it('creates an idempotent temp file database and repositories', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'codexhub-store-'));
    const dbPath = join(dir, 'codexhub.sqlite');

    const first = await createSqliteStore({ dbPath });
    await first.workflowRuns.create({
      id: 'run_1',
      schemaVersion: SchemaVersionSchema.value,
      createdAt: '2026-04-28T00:00:00.000Z',
      workflowName: 'development.bootstrap',
      status: 'created',
      dryRun: true,
      steps: [],
      evidenceRefs: [],
    });
    const mockDevelopmentRun: MockDevelopmentRun = {
      id: 'development_run_1',
      schemaVersion: SchemaVersionSchema.value,
      createdAt: '2026-04-28T00:00:01.000Z',
      request: {
        id: 'development_request_1',
        schemaVersion: SchemaVersionSchema.value,
        createdAt: '2026-04-28T00:00:01.000Z',
        title: 'Add Electron CDP read-only observation skeleton',
        description: 'Create interfaces and tests only',
        constraints: [],
      },
      taskGraph: {
        id: 'task_graph_1',
        schemaVersion: SchemaVersionSchema.value,
        createdAt: '2026-04-28T00:00:01.000Z',
        requestId: 'development_request_1',
        tasks: [],
      },
      skillResolution: {
        id: 'skill_resolution_1',
        schemaVersion: SchemaVersionSchema.value,
        createdAt: '2026-04-28T00:00:01.000Z',
        inputSummary: 'mock skill resolution',
        selectedSkills: [],
        unmatchedCapabilities: [],
        reasons: [],
      },
      agentRuns: [],
      verificationRun: {
        id: 'verification_run_1',
        schemaVersion: SchemaVersionSchema.value,
        createdAt: '2026-04-28T00:00:01.000Z',
        targetId: 'task_graph_1',
        status: 'passed',
        checks: [],
        evidenceRefs: [],
      },
      evidenceRefs: [],
      auditEvents: [],
      summary: {
        requestTitle: 'Add Electron CDP read-only observation skeleton',
        taskCount: 0,
        selectedSkillIds: [],
        agentRunCount: 0,
        verificationStatus: 'passed',
        evidenceCount: 0,
        auditEventCount: 0,
        orchestrationPlanId: 'orchestration_plan_1',
        mockOnly: true,
      },
    };
    await first.developmentRuns.saveMockDevelopmentRun(mockDevelopmentRun);
    const codexReplay: CodexReplayRecord = {
      id: 'codex_replay_1',
      schemaVersion: SchemaVersionSchema.value,
      createdAt: '2026-04-28T00:00:02.000Z',
      sourceKind: 'fixture',
      fixturePath: 'packages/codex-kernel/fixtures/codex-exec-basic.jsonl',
      threadId: 'thread_fixture_basic',
      status: 'completed',
      summary: 'Fixture replay completed: 10 events, 0 errors',
      replayHash: 'sha256:replay',
      eventCount: 10,
      itemCount: 7,
      commandExecutionCount: 1,
      fileChangeCount: 1,
      mcpToolCallCount: 1,
      webSearchCount: 1,
      errorCount: 0,
      mockOnly: true,
      liveExecution: false,
      externalProcessStarted: false,
      evidenceRefs: [],
      auditEventIds: ['audit_1', 'audit_2'],
      storageMetadata: {
        sourceKind: 'fixture',
        fixturePath: 'packages/codex-kernel/fixtures/codex-exec-basic.jsonl',
        fixturePathHash: 'sha256:path',
        replayHash: 'sha256:replay',
        bodyStored: false,
        normalizedEventsStored: false,
        eventHashCount: 10,
        mockOnly: true,
        liveExecution: false,
        externalProcessStarted: false,
      },
    };
    await first.codexReplays.saveCodexReplay(codexReplay);
    await first.close();

    const second = await createSqliteStore({ dbPath });
    const runs = await second.workflowRuns.list();
    const developmentRuns = await second.developmentRuns.listMockDevelopmentRuns(10);
    const developmentRun = await second.developmentRuns.getMockDevelopmentRun('development_run_1');
    const codexReplays = await second.codexReplays.listCodexReplays(10);
    const codexReplayRecord = await second.codexReplays.getCodexReplay('codex_replay_1');
    await second.close();

    expect(resolveCodexHubDbPath({ dbPath })).toBe(dbPath);
    expect(runs).toHaveLength(1);
    expect(runs[0]?.workflowName).toBe('development.bootstrap');
    expect(developmentRuns).toHaveLength(1);
    expect(developmentRuns[0]?.summary.requestTitle).toBe(
      'Add Electron CDP read-only observation skeleton',
    );
    expect(developmentRun?.id).toBe('development_run_1');
    expect(codexReplays).toHaveLength(1);
    expect(codexReplays[0]?.fixturePath).toBe(
      'packages/codex-kernel/fixtures/codex-exec-basic.jsonl',
    );
    expect(codexReplayRecord?.storageMetadata.bodyStored).toBe(false);
    expect(JSON.stringify(codexReplayRecord)).not.toContain('thread.started');
  });
});

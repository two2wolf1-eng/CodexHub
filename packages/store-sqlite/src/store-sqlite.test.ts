import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  type CodexExecLiveRunRecord,
  type CodexExecManualApprovalRecord,
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
    const codexExecLiveRun: CodexExecLiveRunRecord = createCodexExecLiveRunFixture();
    await first.codexExecLiveRuns.saveCodexExecLiveRunRecord(codexExecLiveRun);
    const approvalRecord: CodexExecManualApprovalRecord = createCodexExecApprovalRecordFixture();
    await first.codexExecApprovals.saveCodexExecApprovalRecord(approvalRecord);
    await first.close();

    const second = await createSqliteStore({ dbPath });
    const runs = await second.workflowRuns.list();
    const developmentRuns = await second.developmentRuns.listMockDevelopmentRuns(10);
    const developmentRun = await second.developmentRuns.getMockDevelopmentRun('development_run_1');
    const codexReplays = await second.codexReplays.listCodexReplays(10);
    const codexReplayRecord = await second.codexReplays.getCodexReplay('codex_replay_1');
    const codexExecLiveRuns = await second.codexExecLiveRuns.listCodexExecLiveRunRecords(10);
    const codexExecLiveRunRecord =
      await second.codexExecLiveRuns.getCodexExecLiveRunRecord('codex_live_run_1');
    const codexExecApprovals = await second.codexExecApprovals.listCodexExecApprovalRecords(10);
    const codexExecApprovalRecord =
      await second.codexExecApprovals.getCodexExecApprovalRecord('codex_approval_record_1');
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
    expect(codexExecLiveRuns).toHaveLength(1);
    expect(codexExecLiveRuns[0]?.status).toBe('blocked');
    expect(codexExecLiveRunRecord?.promptBodyStored).toBe(false);
    expect(JSON.stringify(codexExecLiveRunRecord)).not.toContain('list risk areas');
    expect(codexExecApprovals).toHaveLength(1);
    expect(codexExecApprovals[0]?.status).toBe('approved');
    expect(codexExecApprovalRecord?.request.reason).toContain('hash sha256:');
    expect(JSON.stringify(codexExecApprovalRecord)).not.toContain('manual private reason');
  });
});

function createCodexExecLiveRunFixture(): CodexExecLiveRunRecord {
  const createdAt = '2026-04-28T00:00:03.000Z';
  const intent = {
    id: 'codex_intent_1',
    schemaVersion: SchemaVersionSchema.value,
    createdAt,
    title: 'Summarize repository structure',
    cwd: '.',
    sandboxMode: 'read_only' as const,
    approvalMode: 'required' as const,
    promptSummary: 'Summarize repository structure',
    promptHash: 'sha256:prompt',
    promptLength: 30,
    promptBodyStored: false as const,
    liveAdapterEnabled: false,
    liveExecution: false as const,
    externalProcessStarted: false as const,
    executionDisabled: true as const,
  };
  const dryRunPlan = {
    id: 'codex_dry_run_1',
    schemaVersion: SchemaVersionSchema.value,
    createdAt,
    intentId: intent.id,
    intent,
    title: intent.title,
    cwd: '.',
    sandboxMode: 'read_only' as const,
    approvalMode: 'required' as const,
    riskLevel: 'medium' as const,
    promptSummary: intent.promptSummary,
    promptHash: intent.promptHash,
    promptLength: intent.promptLength,
    promptBodyStored: false as const,
    liveAdapterEnabled: false,
    liveExecution: false as const,
    externalProcessStarted: false as const,
    executionDisabled: true as const,
    summary: 'Dry-run control plan',
  };
  const policyDecision = {
    id: 'policy_1',
    schemaVersion: SchemaVersionSchema.value,
    createdAt,
    actionId: dryRunPlan.id,
    actionType: 'codex.exec.live.intent',
    actionMode: 'read' as const,
    riskLevel: 'medium' as const,
    outcome: 'deny' as const,
    reasons: ['disabled'],
    requiresDryRun: true,
    requiresApproval: true,
  };

  return {
    id: 'codex_live_run_1',
    schemaVersion: SchemaVersionSchema.value,
    createdAt,
    intentId: intent.id,
    dryRunPlanId: dryRunPlan.id,
    title: intent.title,
    cwd: '.',
    sandboxMode: 'read_only',
    approvalMode: 'required',
    riskLevel: 'medium',
    status: 'blocked',
    intent,
    dryRunPlan,
    commandPreview: {
      id: 'codex_preview_1',
      schemaVersion: SchemaVersionSchema.value,
      createdAt,
      intentId: intent.id,
      dryRunPlanId: dryRunPlan.id,
      cwd: '.',
      sandboxMode: 'read_only',
      approvalMode: 'required',
      previewSummary: 'Disabled preview',
      binaryName: 'codex',
      argumentSummary: 'summarized arguments only',
      previewHash: 'sha256:preview',
      redacted: true,
      liveExecution: false,
      externalProcessStarted: false,
      executionDisabled: true,
    },
    policyDecision,
    approvalRequirement: {
      id: 'codex_approval_1',
      schemaVersion: SchemaVersionSchema.value,
      createdAt,
      dryRunPlanId: dryRunPlan.id,
      policyDecisionId: policyDecision.id,
      required: true,
      riskLevel: 'medium',
      approvalMode: 'required',
      status: 'blocked',
      reason: 'approval required',
    },
    disabledError: {
      id: 'codex_disabled_error_1',
      schemaVersion: SchemaVersionSchema.value,
      createdAt,
      code: 'CODEX_EXEC_LIVE_DISABLED',
      message: 'Live adapter disabled',
      reason: 'control-plane only',
      liveExecution: false,
      externalProcessStarted: false,
      executionDisabled: true,
    },
    evidenceRefs: [],
    auditEvents: [],
    promptSummary: intent.promptSummary,
    promptHash: intent.promptHash,
    promptLength: intent.promptLength,
    promptBodyStored: false,
    liveExecution: false,
    externalProcessStarted: false,
    executionDisabled: true,
  };
}

function createCodexExecApprovalRecordFixture(): CodexExecManualApprovalRecord {
  const createdAt = '2026-04-28T00:00:04.000Z';

  return {
    id: 'codex_approval_record_1',
    schemaVersion: SchemaVersionSchema.value,
    createdAt,
    request: {
      id: 'codex_approval_request_1',
      schemaVersion: SchemaVersionSchema.value,
      createdAt,
      dryRunPlanId: 'codex_dry_run_1',
      dryRunPlanHash: 'sha256:dry-run',
      policyDecisionId: 'policy_1',
      policyDecisionHash: 'sha256:policy',
      scope: 'read_only_plan',
      status: 'pending',
      riskLevel: 'medium',
      requestedBy: 'local-human',
      reason: 'approval request reason (21 chars, hash sha256:reason)',
      expiresAt: '2026-04-28T01:00:00.000Z',
      singleUse: true,
      summary: 'Manual approval requested',
      liveExecution: false,
      externalProcessStarted: false,
      executionDisabled: true,
    },
    decision: {
      id: 'codex_approval_decision_1',
      schemaVersion: SchemaVersionSchema.value,
      createdAt,
      approvalRequestId: 'codex_approval_request_1',
      dryRunPlanId: 'codex_dry_run_1',
      policyDecisionId: 'policy_1',
      outcome: 'approved',
      decidedBy: 'local-human',
      reasonSummary: 'approval decision reason (21 chars, hash sha256:decision)',
      decisionHash: 'sha256:decision',
      approved: true,
      summary: 'Manual approval approved',
      liveExecution: false,
      externalProcessStarted: false,
      executionDisabled: true,
    },
    status: 'approved',
    evidenceRefs: [],
    auditEventIds: [],
    summary: 'Manual approval record',
    liveExecution: false,
    externalProcessStarted: false,
    executionDisabled: true,
  };
}

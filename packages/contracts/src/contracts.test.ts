import { describe, expect, it } from 'vitest';
import {
  DevelopmentRequestSchema,
  CodexReplayRecordSchema,
  CodexExecReplayResultSchema,
  EvidenceRefSchema,
  PolicyDecisionSchema,
  SchemaVersionSchema,
  SkillResolutionResultSchema,
  WorkflowRunSchema,
} from './index';

const createdAt = '2026-04-28T00:00:00.000Z';
const schemaVersion = SchemaVersionSchema.value;

describe('contracts schemas', () => {
  it('parses core created models', () => {
    const evidence = EvidenceRefSchema.parse({
      id: 'evidence_1',
      schemaVersion,
      createdAt,
      kind: 'dry-run',
      hash: 'sha256:abc',
      metadata: { source: 'test' },
    });

    const decision = PolicyDecisionSchema.parse({
      id: 'policy_1',
      schemaVersion,
      createdAt,
      actionId: 'action_1',
      actionType: 'filesystem.read',
      actionMode: 'read',
      riskLevel: 'low',
      outcome: 'allow',
      requiresDryRun: false,
      requiresApproval: false,
    });

    const run = WorkflowRunSchema.parse({
      id: 'run_1',
      schemaVersion,
      createdAt,
      workflowName: 'development.bootstrap',
      status: 'created',
      dryRun: true,
      evidenceRefs: [evidence],
    });

    const request = DevelopmentRequestSchema.parse({
      id: 'devreq_1',
      schemaVersion,
      createdAt,
      title: 'Bootstrap',
      description: 'Create a foundation-only scaffold.',
    });

    expect(decision.outcome).toBe('allow');
    expect(run.workflowName).toBe('development.bootstrap');
    expect(request.constraints).toEqual([]);
  });

  it('parses skill resolution contract models', () => {
    const result = SkillResolutionResultSchema.parse({
      id: 'skill_resolution_1',
      schemaVersion,
      createdAt,
      inputSummary: 'mock resolution',
      selectedSkills: [
        {
          skillId: 'codexhub-architecture-planner',
          score: 90,
          matchedKeywords: ['architecture'],
          reason: 'Required capability architecture.planning matched.',
          required: true,
          skill: {
            id: 'codexhub-architecture-planner',
            displayName: 'Architecture Planner',
            description: 'Mock descriptor',
            capabilities: [
              {
                id: 'architecture.planning',
                description: 'Plan architecture',
                riskLevel: 'low',
                readOnlyDefault: true,
              },
            ],
            triggers: [
              {
                id: 'architecture.trigger',
                keywords: ['architecture'],
                capabilityIds: ['architecture.planning'],
              },
            ],
          },
        },
      ],
    });

    expect(result.selectedSkills[0]?.skillId).toBe('codexhub-architecture-planner');
  });

  it('parses codex exec replay contract models', () => {
    const result = CodexExecReplayResultSchema.parse({
      id: 'codex_replay_1',
      schemaVersion,
      createdAt,
      threadId: 'thread_fixture_1',
      events: [
        {
          id: 'codex_event_1',
          schemaVersion,
          createdAt,
          rawEventType: 'thread.started',
          normalizedType: 'thread.started',
          threadId: 'thread_fixture_1',
          summary: 'Thread started',
          payloadHash: 'sha256:event',
          payloadLength: 42,
          safe: true,
        },
      ],
      eventCount: 1,
      itemCount: 0,
      commandExecutionCount: 0,
      fileChangeCount: 0,
      mcpToolCallCount: 0,
      webSearchCount: 0,
      errorCount: 0,
      finalStatus: 'completed',
      evidenceRefs: [
        {
          id: 'evidence_codex_1',
          schemaVersion,
          createdAt,
          kind: 'codex.exec.jsonl.replay',
          hash: 'sha256:replay',
          summary: 'Codex fixture replay summary',
        },
      ],
      auditEvents: [
        {
          id: 'audit_codex_1',
          schemaVersion,
          createdAt,
          actor: 'codex-kernel.fixture-replay',
          action: 'codex.exec.fixture_replay.completed',
          outcome: 'completed',
          evidenceRefs: [],
        },
      ],
    });

    expect(result.finalStatus).toBe('completed');
    expect(result.evidenceRefs[0]?.kind).toBe('codex.exec.jsonl.replay');
  });

  it('parses codex replay storage records without jsonl body', () => {
    const record = CodexReplayRecordSchema.parse({
      id: 'codex_replay_1',
      schemaVersion,
      createdAt,
      sourceKind: 'fixture',
      fixturePath: 'packages/codex-kernel/fixtures/codex-exec-basic.jsonl',
      threadId: 'thread_fixture_1',
      status: 'completed',
      summary: 'Fixture replay completed: 1 events, 0 errors',
      replayHash: 'sha256:replay',
      eventCount: 1,
      itemCount: 0,
      commandExecutionCount: 0,
      fileChangeCount: 0,
      mcpToolCallCount: 0,
      webSearchCount: 0,
      errorCount: 0,
      mockOnly: true,
      liveExecution: false,
      externalProcessStarted: false,
      evidenceRefs: [],
      auditEventIds: ['audit_codex_1'],
      storageMetadata: {
        sourceKind: 'fixture',
        fixturePath: 'packages/codex-kernel/fixtures/codex-exec-basic.jsonl',
        fixturePathHash: 'sha256:path',
        replayHash: 'sha256:replay',
        bodyStored: false,
        normalizedEventsStored: false,
        eventHashCount: 1,
        mockOnly: true,
        liveExecution: false,
        externalProcessStarted: false,
      },
    });

    expect(record.sourceKind).toBe('fixture');
    expect(JSON.stringify(record)).not.toContain('thread.started');
  });
});

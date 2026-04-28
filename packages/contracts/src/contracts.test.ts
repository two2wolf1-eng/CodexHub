import { describe, expect, it } from 'vitest';
import {
  CodexExecLiveRunRecordSchema,
  CodexExecLiveConfigSchema,
  CodexExecConfigLoadResultSchema,
  CodexExecManualApprovalRecordSchema,
  CodexExecPreflightResultSchema,
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

  it('parses codex live control-plane records without prompt body', () => {
    const intent = {
      id: 'codex_intent_1',
      schemaVersion,
      createdAt,
      title: 'Summarize repository structure',
      cwd: '.',
      sandboxMode: 'read_only',
      approvalMode: 'required',
      promptSummary: 'Summarize repository structure',
      promptHash: 'sha256:prompt',
      promptLength: 30,
      promptBodyStored: false,
      liveAdapterEnabled: false,
      liveExecution: false,
      externalProcessStarted: false,
      executionDisabled: true,
    };
    const dryRunPlan = {
      id: 'codex_dry_run_1',
      schemaVersion,
      createdAt,
      intentId: intent.id,
      intent,
      title: intent.title,
      cwd: '.',
      sandboxMode: 'read_only',
      approvalMode: 'required',
      riskLevel: 'medium',
      promptSummary: intent.promptSummary,
      promptHash: intent.promptHash,
      promptLength: intent.promptLength,
      promptBodyStored: false,
      liveAdapterEnabled: false,
      liveExecution: false,
      externalProcessStarted: false,
      executionDisabled: true,
      summary: 'Dry-run control plan',
    };
    const policyDecision = {
      id: 'policy_1',
      schemaVersion,
      createdAt,
      actionId: dryRunPlan.id,
      actionType: 'codex.exec.live.intent',
      actionMode: 'read',
      riskLevel: 'medium',
      outcome: 'deny',
      reasons: ['disabled'],
      requiresDryRun: true,
      requiresApproval: true,
    };
    const record = CodexExecLiveRunRecordSchema.parse({
      id: 'codex_live_run_1',
      schemaVersion,
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
        schemaVersion,
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
        schemaVersion,
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
        schemaVersion,
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
    });

    expect(record.liveExecution).toBe(false);
    expect(record.externalProcessStarted).toBe(false);
    expect(record.promptBodyStored).toBe(false);
    expect(JSON.stringify(record)).not.toContain('list risk areas');
  });

  it('parses codex live config and preflight models', () => {
    const config = CodexExecLiveConfigSchema.parse({
      id: 'codex_live_config_1',
      schemaVersion,
      createdAt,
    });
    const preflight = CodexExecPreflightResultSchema.parse({
      id: 'codex_preflight_1',
      schemaVersion,
      createdAt,
      dryRunPlanId: 'codex_dry_run_1',
      dryRunPlanHash: 'sha256:dry-run',
      configId: config.id,
      status: 'blocked',
      checks: [
        {
          id: 'codex_preflight_check_1',
          schemaVersion,
          createdAt,
          name: 'live-config',
          status: 'failed',
          summary: 'disabled by config',
        },
      ],
      worktreeRequirement: {
        id: 'codex_worktree_requirement_1',
        schemaVersion,
        createdAt,
        sandboxMode: 'read_only',
        requirement: {
          requiresIsolatedWorktree: false,
          isolatedWorktreePresent: false,
        },
        status: 'not_required',
        summary: 'not required',
      },
      summary: 'blocked',
      liveExecution: false,
      externalProcessStarted: false,
      executionDisabled: true,
    });

    expect(config.liveEnabled).toBe(false);
    expect(config.allowedSandboxModes).toEqual(['read_only']);
    expect(config.forbiddenSandboxModes).toEqual(['danger_full_access']);
    expect(config.liveExecution).toBe(false);
    expect(config.executionDisabled).toBe(true);
    expect(preflight.status).toBe('blocked');
  });

  it('parses codex config load and manual approval records', () => {
    const config = CodexExecLiveConfigSchema.parse({
      id: 'codex_live_config_1',
      schemaVersion,
      createdAt,
      configSource: 'file',
      configPath: '.codexhub/codex-exec.yaml',
      configPathHash: 'sha256:path',
    });
    const configLoad = CodexExecConfigLoadResultSchema.parse({
      id: 'codex_config_load_1',
      schemaVersion,
      createdAt,
      source: 'file',
      status: 'loaded',
      config,
      configFile: {
        id: 'codex_config_file_1',
        schemaVersion,
        createdAt,
        configPath: '.codexhub/codex-exec.yaml',
        configPathHash: 'sha256:path',
        configHash: 'sha256:config',
        bodyStored: false,
        summary: 'Loaded disabled config file',
      },
      summary: 'Loaded config',
    });
    const approvalRecord = CodexExecManualApprovalRecordSchema.parse({
      id: 'codex_approval_record_1',
      schemaVersion,
      createdAt,
      request: {
        id: 'codex_approval_request_1',
        schemaVersion,
        createdAt,
        dryRunPlanId: 'codex_dry_run_1',
        dryRunPlanHash: 'sha256:dry-run',
        policyDecisionId: 'policy_1',
        policyDecisionHash: 'sha256:policy',
        scope: 'read_only_plan',
        status: 'pending',
        riskLevel: 'medium',
        requestedBy: 'local-human',
        reason: 'Review disabled control-plane run',
        expiresAt: '2026-04-28T01:00:00.000Z',
        singleUse: true,
        summary: 'Approval requested',
      },
      decision: {
        id: 'codex_approval_decision_1',
        schemaVersion,
        createdAt,
        approvalRequestId: 'codex_approval_request_1',
        dryRunPlanId: 'codex_dry_run_1',
        policyDecisionId: 'policy_1',
        outcome: 'approved',
        decidedBy: 'local-human',
        reasonSummary: 'Approved for disabled gate evaluation',
        decisionHash: 'sha256:decision',
        approved: true,
        summary: 'Approval approved',
      },
      status: 'approved',
      evidenceRefs: [],
      auditEventIds: [],
      summary: 'Manual approval record',
    });

    expect(configLoad.config.configSource).toBe('file');
    expect(configLoad.configFile?.bodyStored).toBe(false);
    expect(approvalRecord.decision?.approved).toBe(true);
    expect(approvalRecord.liveExecution).toBe(false);
  });
});

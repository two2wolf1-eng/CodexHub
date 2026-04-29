import { describe, expect, it } from 'vitest';
import {
  CodexExecLiveRunRecordSchema,
  CodexExecLiveConfigSchema,
  CodexExecConfigLoadResultSchema,
  CodexExecApprovalTransitionResultSchema,
  CodexExecControlPlaneTimelineSchema,
  CodexExecTimelineDetailViewSchema,
  CodexExecAuditDetailViewSchema,
  CodexExecAuditSearchResultSchema,
  CodexExecControlPlaneDrilldownViewSchema,
  CodexExecEvidenceDetailViewSchema,
  CodexExecEvidenceSearchResultSchema,
  CodexExecControlPlaneReportExportResultSchema,
  CodexExecControlPlaneReportSchema,
  CodexExecTimelineFilterSchema,
  CodexExecTimelineQuerySchema,
  CodexExecManualApprovalRecordSchema,
  CodexExecManualApprovalStateSchema,
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

  it('parses codex manual approval state and transition results', () => {
    const approvalState = CodexExecManualApprovalStateSchema.parse({
      id: 'codex_approval_state_1',
      schemaVersion,
      createdAt,
      approvalRecordId: 'codex_approval_record_1',
      approvalRequestId: 'codex_approval_request_1',
      dryRunPlanId: 'codex_dry_run_1',
      dryRunPlanHash: 'sha256:dry-run',
      policyDecisionId: 'policy_1',
      policyDecisionHash: 'sha256:policy',
      status: 'pending',
      requestedStatus: 'pending',
      expiresAt: '2026-04-28T01:00:00.000Z',
      expired: false,
      terminal: false,
      canDecide: true,
      nextAllowedActions: ['approve', 'deny', 'revoke'],
      reasons: ['manual approval is awaiting a decision'],
      summary: 'Manual approval state is pending',
      liveExecution: false,
      externalProcessStarted: false,
      executionDisabled: true,
    });
    const transition = CodexExecApprovalTransitionResultSchema.parse({
      id: 'codex_approval_transition_1',
      schemaVersion,
      createdAt,
      approvalRecordId: 'codex_approval_record_1',
      approvalRequestId: 'codex_approval_request_1',
      dryRunPlanId: 'codex_dry_run_1',
      action: 'approve',
      fromStatus: 'pending',
      toStatus: 'approved',
      allowed: true,
      reasons: ['manual approval transition approve is allowed'],
      state: approvalState,
      summary: 'Manual approval transition approve allowed',
      liveExecution: false,
      externalProcessStarted: false,
      executionDisabled: true,
    });

    expect(approvalState.canDecide).toBe(true);
    expect(transition.allowed).toBe(true);
    expect(transition.liveExecution).toBe(false);
  });

  it('parses codex control-plane timeline models', () => {
    const timeline = CodexExecControlPlaneTimelineSchema.parse({
      id: 'codex_timeline_1',
      schemaVersion,
      createdAt,
      dryRunId: 'codex_dry_run_1',
      liveRunRecordId: 'codex_live_run_1',
      status: 'gate_blocked',
      events: [
        {
          id: 'codex_timeline_event_1',
          schemaVersion,
          createdAt,
          dryRunId: 'codex_dry_run_1',
          liveRunRecordId: 'codex_live_run_1',
          eventType: 'codex.exec.dry_run.created',
          sourceKind: 'dry_run',
          sourceId: 'codex_dry_run_1',
          status: 'medium',
          summary: 'Dry-run control plan',
          occurredAt: createdAt,
          liveExecution: false,
          externalProcessStarted: false,
          executionDisabled: true,
        },
        {
          id: 'codex_timeline_event_2',
          schemaVersion,
          createdAt,
          dryRunId: 'codex_dry_run_1',
          liveRunRecordId: 'codex_live_run_1',
          eventType: 'codex.exec.gate.evaluated',
          sourceKind: 'gate',
          sourceId: 'codex_gate_1',
          status: 'blocked',
          summary: 'Execution gate blocked',
          occurredAt: createdAt,
          liveExecution: false,
          externalProcessStarted: false,
          executionDisabled: true,
        },
      ],
      eventCount: 2,
      evidenceCount: 1,
      auditEventCount: 1,
      summary: 'Timeline has 2 events',
      liveExecution: false,
      externalProcessStarted: false,
      executionDisabled: true,
    });

    expect(timeline.status).toBe('gate_blocked');
    expect(timeline.events.every((event) => event.liveExecution === false)).toBe(true);
    expect(timeline.events.every((event) => event.externalProcessStarted === false)).toBe(true);
    expect(timeline.events.every((event) => event.executionDisabled === true)).toBe(true);
  });

  it('parses codex timeline query and detail view models without body storage', () => {
    const filter = CodexExecTimelineFilterSchema.parse({
      source: 'approval',
      status: 'blocked',
      includeEvidence: false,
      includeAudit: false,
      limit: 10,
    });
    const query = CodexExecTimelineQuerySchema.parse({
      id: 'codex_timeline_query_1',
      schemaVersion,
      createdAt,
      dryRunId: 'codex_dry_run_1',
      filter,
      liveExecution: false,
      externalProcessStarted: false,
      executionDisabled: true,
    });
    const detail = CodexExecTimelineDetailViewSchema.parse({
      id: 'codex_timeline_detail_1',
      schemaVersion,
      createdAt,
      dryRunId: 'codex_dry_run_1',
      liveRunRecordId: 'codex_live_run_1',
      timeline: {
        id: 'codex_timeline_1',
        schemaVersion,
        createdAt,
        dryRunId: 'codex_dry_run_1',
        liveRunRecordId: 'codex_live_run_1',
        status: 'gate_blocked',
        events: [],
        eventCount: 0,
        evidenceCount: 1,
        auditEventCount: 1,
        summary: 'Timeline has no filtered events',
        liveExecution: false,
        externalProcessStarted: false,
        executionDisabled: true,
      },
      sourceBreakdown: {},
      latestGateStatus: 'blocked',
      approvalStatus: 'approved',
      dryRunSummary: {
        dryRunPlanId: 'codex_dry_run_1',
        title: 'Summarize repository structure',
        sandboxMode: 'read_only',
        approvalMode: 'required',
        riskLevel: 'medium',
        promptSummary: 'Prompt summary only',
        promptHash: 'sha256:prompt',
        promptLength: 30,
        promptBodyStored: false,
      },
      commandPreviewSummary: {
        commandPreviewId: 'codex_preview_1',
        previewSummary: 'Preview summary only',
        previewHash: 'sha256:preview',
        redacted: true,
        argumentSummary: 'promptHash=sha256:prompt',
      },
      policySummary: {
        policyDecisionId: 'policy_1',
        outcome: 'deny',
        riskLevel: 'medium',
        requiresDryRun: true,
        requiresApproval: true,
        reasonCount: 1,
      },
      approvalStateSummary: {
        approvalRequestId: 'codex_approval_request_1',
        status: 'approved',
        canDecide: false,
        terminal: true,
        reasonCount: 1,
      },
      gateSummary: {
        executionGateResultId: 'codex_gate_1',
        status: 'blocked',
        reasonCount: 1,
        liveEnabled: false,
      },
      evidenceSummary: {
        id: 'codex_evidence_summary_1',
        schemaVersion,
        createdAt,
        dryRunId: 'codex_dry_run_1',
        liveRunRecordId: 'codex_live_run_1',
        count: 1,
        evidenceRefIds: ['evidence_1'],
        items: [
          {
            evidenceRefId: 'evidence_1',
            kind: 'codex.exec.dry_run_plan',
            summary: 'Evidence summary only',
            hash: 'sha256:evidence',
            labels: ['codex.dry_run_plan'],
            createdAt,
          },
        ],
        metadataOnly: true,
        bodyStored: false,
        liveExecution: false,
        externalProcessStarted: false,
        executionDisabled: true,
      },
      auditSummary: {
        id: 'codex_audit_summary_1',
        schemaVersion,
        createdAt,
        dryRunId: 'codex_dry_run_1',
        liveRunRecordId: 'codex_live_run_1',
        count: 1,
        auditEventIds: ['audit_1'],
        items: [
          {
            auditEventId: 'audit_1',
            action: 'codex.exec.policy_evaluated',
            outcome: 'deny',
            createdAt,
            policyDecisionId: 'policy_1',
            evidenceRefIds: ['evidence_1'],
          },
        ],
        metadataOnly: true,
        bodyStored: false,
        liveExecution: false,
        externalProcessStarted: false,
        executionDisabled: true,
      },
      summary: 'Detail summary only',
      liveExecution: false,
      externalProcessStarted: false,
      executionDisabled: true,
    });

    expect(query.filter.source).toBe('approval');
    expect(detail.evidenceSummary.bodyStored).toBe(false);
    expect(detail.auditSummary.metadataOnly).toBe(true);
    expect(JSON.stringify(detail)).not.toContain('full prompt body');
  });

  it('parses codex evidence and audit drilldown views without body storage', () => {
    const evidenceDetail = CodexExecEvidenceDetailViewSchema.parse({
      id: 'codex_evidence_detail_1',
      schemaVersion,
      createdAt,
      status: 'found',
      evidenceRefId: 'evidence_1',
      dryRunId: 'codex_dry_run_1',
      liveRunRecordId: 'codex_live_run_1',
      kind: 'codex.exec.dry_run_plan',
      summary: 'Evidence summary only',
      hash: 'sha256:evidence',
      labels: ['codex.dry_run_plan'],
      refCreatedAt: createdAt,
      relatedAuditEventIds: ['audit_1'],
      metadataSummary: {
        keyCount: 2,
        keys: ['dryRunPlanId', 'riskLevel'],
        relatedIds: ['codex_dry_run_1'],
        bodyStored: false,
      },
      metadataOnly: true,
      bodyStored: false,
      liveExecution: false,
      externalProcessStarted: false,
      executionDisabled: true,
    });
    const auditDetail = CodexExecAuditDetailViewSchema.parse({
      id: 'codex_audit_detail_1',
      schemaVersion,
      createdAt,
      status: 'found',
      auditEventId: 'audit_1',
      dryRunId: 'codex_dry_run_1',
      liveRunRecordId: 'codex_live_run_1',
      action: 'codex.exec.policy_evaluated',
      outcome: 'deny',
      actor: 'codex-kernel.control-plane',
      eventCreatedAt: createdAt,
      policyDecisionId: 'policy_1',
      evidenceRefIds: ['evidence_1'],
      metadataSummary: {
        keyCount: 2,
        keys: ['dryRunPlanId', 'policyDecisionId'],
        relatedIds: ['codex_dry_run_1', 'policy_1'],
        bodyStored: false,
      },
      metadataOnly: true,
      bodyStored: false,
      liveExecution: false,
      externalProcessStarted: false,
      executionDisabled: true,
    });
    const evidenceSearch = CodexExecEvidenceSearchResultSchema.parse({
      id: 'codex_evidence_search_1',
      schemaVersion,
      createdAt,
      query: {
        id: 'codex_evidence_query_1',
        schemaVersion,
        createdAt,
        dryRunId: 'codex_dry_run_1',
        kind: 'codex.exec.dry_run_plan',
        limit: 20,
        liveExecution: false,
        externalProcessStarted: false,
        executionDisabled: true,
      },
      count: 1,
      items: [evidenceDetail],
      metadataOnly: true,
      bodyStored: false,
      summary: '1 evidence refs',
      liveExecution: false,
      externalProcessStarted: false,
      executionDisabled: true,
    });
    const auditSearch = CodexExecAuditSearchResultSchema.parse({
      id: 'codex_audit_search_1',
      schemaVersion,
      createdAt,
      query: {
        id: 'codex_audit_query_1',
        schemaVersion,
        createdAt,
        dryRunId: 'codex_dry_run_1',
        action: 'codex.exec.policy_evaluated',
        limit: 20,
        liveExecution: false,
        externalProcessStarted: false,
        executionDisabled: true,
      },
      count: 1,
      items: [auditDetail],
      metadataOnly: true,
      bodyStored: false,
      summary: '1 audit events',
      liveExecution: false,
      externalProcessStarted: false,
      executionDisabled: true,
    });
    const drilldown = CodexExecControlPlaneDrilldownViewSchema.parse({
      id: 'codex_drilldown_1',
      schemaVersion,
      createdAt,
      dryRunId: 'codex_dry_run_1',
      liveRunRecordId: 'codex_live_run_1',
      status: 'found',
      evidenceSearch,
      auditSearch,
      selectedEvidence: evidenceDetail,
      selectedAudit: auditDetail,
      evidenceCount: 1,
      auditEventCount: 1,
      metadataOnly: true,
      bodyStored: false,
      summary: 'Read-only drilldown summary',
      liveExecution: false,
      externalProcessStarted: false,
      executionDisabled: true,
    });

    expect(drilldown.status).toBe('found');
    expect(drilldown.evidenceSearch.items[0]?.metadataOnly).toBe(true);
    expect(drilldown.auditSearch.items[0]?.bodyStored).toBe(false);
    expect(JSON.stringify(drilldown)).not.toContain('full command body');
  });

  it('parses codex control-plane report export models', () => {
    const query = {
      id: 'codex_report_query_1',
      schemaVersion,
      createdAt,
      dryRunId: 'codex_dry_run_1',
      format: 'markdown',
      includeEvidence: true,
      includeAudit: true,
      liveExecution: false,
      externalProcessStarted: false,
      executionDisabled: true,
    };
    const section = {
      id: 'codex_report_section_1',
      schemaVersion,
      createdAt,
      kind: 'overview',
      title: 'Overview',
      status: 'ok',
      summary: 'Report overview summary only',
      items: [
        {
          label: 'dryRunId',
          value: 'codex_dry_run_1',
          refId: 'codex_dry_run_1',
        },
      ],
      refIds: ['codex_dry_run_1'],
      hashes: ['sha256:summary'],
      metadataOnly: true,
      bodyStored: false,
      liveExecution: false,
      externalProcessStarted: false,
      executionDisabled: true,
    };
    const summary = {
      id: 'codex_report_summary_1',
      schemaVersion,
      createdAt,
      dryRunId: 'codex_dry_run_1',
      status: 'found',
      sectionCount: 10,
      evidenceCount: 1,
      auditEventCount: 1,
      riskLevel: 'medium',
      finalControlPlaneStatus: 'gate_blocked',
      recommendationCount: 1,
      metadataOnly: true,
      bodyStored: false,
      liveExecution: false,
      externalProcessStarted: false,
      executionDisabled: true,
    };
    const report = CodexExecControlPlaneReportSchema.parse({
      id: 'codex_report_1',
      schemaVersion,
      createdAt,
      dryRunId: 'codex_dry_run_1',
      status: 'found',
      format: 'markdown',
      query,
      summary,
      sections: [section],
      sectionOrder: [
        'overview',
        'dry_run',
        'timeline',
        'approval',
        'gate',
        'evidence',
        'audit',
        'no_live_boundary',
        'risks',
        'recommendations',
      ],
      metadataOnly: true,
      bodyStored: false,
      liveExecution: false,
      externalProcessStarted: false,
      executionDisabled: true,
    });
    const exportResult = CodexExecControlPlaneReportExportResultSchema.parse({
      id: 'codex_report_export_1',
      schemaVersion,
      createdAt,
      dryRunId: 'codex_dry_run_1',
      format: 'markdown',
      status: 'found',
      report,
      renderedContent: '# Safe report',
      renderedContentHash: 'sha256:rendered',
      renderedContentLength: 13,
      metadataOnly: true,
      sourceBodyStored: false,
      liveExecution: false,
      externalProcessStarted: false,
      executionDisabled: true,
    });

    expect(report.sections[0]?.bodyStored).toBe(false);
    expect(exportResult.report.summary.sectionCount).toBe(10);
    expect(JSON.stringify(exportResult)).not.toContain('full stdout body');
  });
});

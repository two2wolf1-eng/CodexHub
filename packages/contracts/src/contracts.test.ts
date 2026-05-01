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
  CodexExecAdrReadinessChecklistItemSchema,
  CodexExecGovernanceBlockerSchema,
  CodexExecGovernanceReviewPackageQuerySchema,
  CodexExecGovernanceReviewPackageSchema,
  CodexExecGovernanceReviewPackageSummarySchema,
  CodexExecLiveAdapterAdrDraftExportResultSchema,
  CodexExecLiveAdapterAdrDraftQuerySchema,
  CodexExecLiveAdapterAdrDraftSchema,
  CodexExecLiveAdapterAdrDraftSectionSchema,
  CodexExecLiveAdapterAdrDraftSummarySchema,
  CodexExecLiveAdapterAdrDecisionGatePolicySchema,
  CodexExecLiveAdapterAdrDecisionQuerySchema,
  CodexExecLiveAdapterAdrDecisionRecordSchema,
  CodexExecLiveAdapterAdrDecisionSummarySchema,
  CodexExecReadOnlyAdapterOperatorChecklistItemSchema,
  CodexExecReadOnlyAdapterPreflightSimulationBlockerSchema,
  CodexExecReadOnlyAdapterPreflightSimulationCheckSchema,
  CodexExecReadOnlyAdapterPreflightSimulationInputSchema,
  CodexExecReadOnlyAdapterPreflightSimulationResultSchema,
  CodexExecReadOnlyAdapterPreflightSimulationSummarySchema,
  CodexExecReadOnlyAdapterSimulatorReviewChecklistItemSchema,
  CodexExecReadOnlyAdapterSimulatorReviewDecisionRecordSchema,
  CodexExecReadOnlyAdapterSimulatorReviewFindingSchema,
  CodexExecReadOnlyAdapterSimulatorReviewQuerySchema,
  CodexExecReadOnlyAdapterSimulatorReviewSummarySchema,
  CodexExecReadOnlyAdapterImplementationPlanReviewChecklistItemSchema,
  CodexExecReadOnlyAdapterImplementationPlanReviewDecisionRecordSchema,
  CodexExecReadOnlyAdapterImplementationPlanReviewFindingSchema,
  CodexExecReadOnlyAdapterImplementationPlanReviewQuerySchema,
  CodexExecReadOnlyAdapterImplementationPlanReviewSummarySchema,
  CodexExecReadOnlyAdapterSkeletonConfigSchema,
  CodexExecReadOnlyAdapterSkeletonPreviewSchema,
  CodexExecReadOnlyAdapterSkeletonReviewDecisionRecordSchema,
  CodexExecReadOnlyAdapterSkeletonReviewSummarySchema,
  CodexExecReadOnlyAdapterFixtureBoundaryResultSchema,
  CodexExecReadOnlyAdapterFixtureBoundarySummarySchema,
  CodexExecReadOnlyAdapterFinalReadinessDecisionRecordSchema,
  CodexExecReadOnlyAdapterFinalReadinessSummarySchema,
  CodexExecRealReadOnlyAdapterReadinessBlockerSchema,
  CodexExecRealReadOnlyAdapterReadinessChecklistItemSchema,
  CodexExecRealReadOnlyAdapterReadinessFindingSchema,
  CodexExecRealReadOnlyAdapterReadinessGateSchema,
  CodexExecRealReadOnlyAdapterReadinessPackageSchema,
  CodexExecRealReadOnlyAdapterReadinessQuerySchema,
  CodexExecRealReadOnlyAdapterReadinessReviewChecklistItemSchema,
  CodexExecRealReadOnlyAdapterReadinessReviewDecisionRecordSchema,
  CodexExecRealReadOnlyAdapterReadinessReviewFindingSchema,
  CodexExecRealReadOnlyAdapterReadinessReviewQuerySchema,
  CodexExecRealReadOnlyAdapterReadinessReviewSummarySchema,
  CodexExecRealReadOnlyAdapterReadinessSummarySchema,
  CodexExecRealReadOnlyAdapterAuditSummarySchema,
  CodexExecRealReadOnlyAdapterAttemptQuerySchema,
  CodexExecRealReadOnlyAdapterAttemptRecordSchema,
  CodexExecRealReadOnlyAdapterAttemptSummarySchema,
  CodexExecRealReadOnlyAdapterAttemptTimelineEntrySchema,
  CodexExecRealReadOnlyAdapterAttemptTimelineQuerySchema,
  CodexExecRealReadOnlyAdapterAttemptTimelineSummarySchema,
  CodexExecRealReadOnlyAdapterBoundaryPlanSchema,
  CodexExecRealReadOnlyAdapterConfigSchema,
  CodexExecRealReadOnlyAdapterErrorSchema,
  CodexExecRealReadOnlyAdapterEvidenceSummarySchema,
  CodexExecRealReadOnlyAdapterPilotSourcePreparationBlockerSchema,
  CodexExecRealReadOnlyAdapterPilotSourcePreparationChecklistItemSchema,
  CodexExecRealReadOnlyAdapterPilotSourcePreparationFindingSchema,
  CodexExecRealReadOnlyAdapterPilotSourcePreparationGateSchema,
  CodexExecRealReadOnlyAdapterPilotSourcePreparationQuerySchema,
  CodexExecRealReadOnlyAdapterPilotSourcePreparationRecordSchema,
  CodexExecRealReadOnlyAdapterPilotSourcePreparationSummarySchema,
  CodexExecRealReadOnlyAdapterPilotPrerequisiteBlockerSchema,
  CodexExecRealReadOnlyAdapterPilotPrerequisiteChecklistItemSchema,
  CodexExecRealReadOnlyAdapterPilotPrerequisiteFindingSchema,
  CodexExecRealReadOnlyAdapterPilotPrerequisiteGateSchema,
  CodexExecRealReadOnlyAdapterPilotPrerequisiteQuerySchema,
  CodexExecRealReadOnlyAdapterPilotPrerequisiteRecordSchema,
  CodexExecRealReadOnlyAdapterPilotPrerequisiteSummarySchema,
  CodexExecRealReadOnlyAdapterPreflightCheckSchema,
  CodexExecRealReadOnlyAdapterPreflightSchema,
  CodexExecRealReadOnlyAdapterRequestSchema,
  CodexExecRealReadOnlyAdapterResultSchema,
  CodexExecNoLiveEvidenceSummarySchema,
  CodexExecReportReviewComparisonSchema,
  CodexExecReportReviewComparisonItemSchema,
  CodexExecReportReviewHistoryViewSchema,
  CodexExecReportReviewRecordSchema,
  CodexExecReportReviewSummarySchema,
  CodexExecReviewerHandoffSummarySchema,
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
    expect(config.forbiddenSandboxModes).toEqual(['workspace_write', 'danger_full_access']);
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

  it('parses codex report review workflow models', () => {
    const checklistItem = {
      id: 'codex_report_review_check_1',
      schemaVersion,
      createdAt,
      code: 'no_live_flags_present',
      label: 'No-live flags are present',
      status: 'passed',
      required: true,
      summary: 'liveExecution=false, externalProcessStarted=false, executionDisabled=true',
      relatedSection: 'no_live_boundary',
      metadataOnly: true,
      bodyStored: false,
      liveExecution: false,
      externalProcessStarted: false,
      executionDisabled: true,
    };
    const finding = {
      id: 'codex_report_review_finding_1',
      schemaVersion,
      createdAt,
      severity: 'medium',
      code: 'approval_state_missing',
      summary: 'Approval state is missing from the reviewed report summary.',
      relatedSection: 'approval',
      recommendation: 'Create a manual approval request before any later ADR review.',
      metadataOnly: true,
      bodyStored: false,
      liveExecution: false,
      externalProcessStarted: false,
      executionDisabled: true,
    };
    const record = CodexExecReportReviewRecordSchema.parse({
      id: 'codex_report_review_1',
      schemaVersion,
      createdAt,
      dryRunId: 'codex_dry_run_1',
      reportId: 'codex_report_1',
      reportHash: 'sha256:report',
      reportSectionHashes: ['sha256:overview'],
      sectionSummaryRefs: ['overview'],
      reviewedAt: createdAt,
      reviewerLabel: 'local-operator',
      status: 'reviewed',
      recommendation: 'ready_for_adr',
      recommendationGrantsExecution: false,
      riskClassification: 'medium',
      checklistItems: [checklistItem],
      findings: [finding],
      notesSummary: 'No-live boundary intact; live adapter still requires ADR.',
      metadataOnly: true,
      bodyStored: false,
      liveExecution: false,
      externalProcessStarted: false,
      executionDisabled: true,
    });
    const summary = CodexExecReportReviewSummarySchema.parse({
      id: 'codex_report_review_summary_1',
      schemaVersion,
      createdAt,
      reviewId: record.id,
      dryRunId: record.dryRunId,
      reportHash: record.reportHash,
      status: record.status,
      recommendation: record.recommendation,
      recommendationGrantsExecution: false,
      riskClassification: record.riskClassification,
      reviewerLabel: record.reviewerLabel,
      reviewedAt: record.reviewedAt,
      findingCount: record.findings.length,
      failedChecklistCount: 0,
      metadataOnly: true,
      bodyStored: false,
      liveExecution: false,
      externalProcessStarted: false,
      executionDisabled: true,
    });
    const historyQuery = {
      id: 'codex_report_review_history_query_1',
      schemaVersion,
      createdAt,
      dryRunId: record.dryRunId,
      status: 'reviewed',
      recommendation: 'ready_for_adr',
      limit: 20,
      recommendationGrantsExecution: false,
      metadataOnly: true,
      bodyStored: false,
      liveExecution: false,
      externalProcessStarted: false,
      executionDisabled: true,
    };
    const comparisonItem = CodexExecReportReviewComparisonItemSchema.parse({
      id: 'codex_report_review_comparison_item_1',
      schemaVersion,
      createdAt,
      field: 'status',
      leftValueSummary: 'reviewed',
      rightValueSummary: 'changes_requested',
      changed: true,
      metadataOnly: true,
      bodyStored: false,
      liveExecution: false,
      externalProcessStarted: false,
      executionDisabled: true,
    });
    const comparison = CodexExecReportReviewComparisonSchema.parse({
      id: 'codex_report_review_comparison_1',
      schemaVersion,
      createdAt,
      leftReviewId: 'codex_report_review_1',
      rightReviewId: 'codex_report_review_2',
      dryRunId: record.dryRunId,
      comparable: true,
      summary: 'Review metadata changed across 1 fields.',
      changedItemCount: 1,
      items: [comparisonItem],
      recommendationGrantsExecution: false,
      metadataOnly: true,
      bodyStored: false,
      liveExecution: false,
      externalProcessStarted: false,
      executionDisabled: true,
    });
    const history = CodexExecReportReviewHistoryViewSchema.parse({
      id: 'codex_report_review_history_1',
      schemaVersion,
      createdAt,
      dryRunId: record.dryRunId,
      query: historyQuery,
      latestReview: summary,
      summaries: [summary],
      comparison,
      historyCount: 1,
      recommendationGrantsExecution: false,
      metadataOnly: true,
      bodyStored: false,
      liveExecution: false,
      externalProcessStarted: false,
      executionDisabled: true,
    });
    const handoff = CodexExecReviewerHandoffSummarySchema.parse({
      id: 'codex_reviewer_handoff_1',
      schemaVersion,
      createdAt,
      dryRunId: record.dryRunId,
      fromReviewer: 'local-operator',
      toReviewer: 'next-reviewer',
      latestReviewId: record.id,
      latestStatus: record.status,
      latestRecommendation: record.recommendation,
      latestRiskClassification: record.riskClassification,
      reviewCount: 1,
      findingCount: record.findings.length,
      failedChecklistCount: 0,
      handoffSummary: 'Handoff summary is metadata-only and non-executing.',
      recommendedNextStep: 'Continue read-only ADR preparation.',
      recommendationGrantsExecution: false,
      metadataOnly: true,
      bodyStored: false,
      liveExecution: false,
      externalProcessStarted: false,
      executionDisabled: true,
    });
    const governanceQuery = CodexExecGovernanceReviewPackageQuerySchema.parse({
      id: 'codex_governance_package_query_1',
      schemaVersion,
      createdAt,
      dryRunId: record.dryRunId,
      includeEvidence: true,
      includeAudit: true,
      recommendationGrantsExecution: false,
      metadataOnly: true,
      bodyStored: false,
      liveExecution: false,
      externalProcessStarted: false,
      executionDisabled: true,
    });
    const adrCheck = CodexExecAdrReadinessChecklistItemSchema.parse({
      id: 'codex_adr_readiness_check_1',
      schemaVersion,
      createdAt,
      code: 'no_live_boundary_confirmed',
      label: 'No-live boundary is confirmed',
      status: 'passed',
      required: true,
      summary: 'No live execution or external process was started.',
      sourceSection: 'no_live_boundary',
      recommendationGrantsExecution: false,
      metadataOnly: true,
      bodyStored: false,
      liveExecution: false,
      externalProcessStarted: false,
      executionDisabled: true,
    });
    const noLiveEvidence = CodexExecNoLiveEvidenceSummarySchema.parse({
      id: 'codex_no_live_evidence_1',
      schemaVersion,
      createdAt,
      dryRunId: record.dryRunId,
      noRealCodexExec: true,
      noExternalProcessStarted: true,
      noBrowserOrCdpAction: true,
      noWorkspaceWrite: true,
      noExecutionApprovalGranted: true,
      evidenceRefCount: 1,
      auditEventCount: 1,
      evidenceKinds: ['codex.exec.dry_run_plan'],
      auditActions: ['codex.exec.policy_evaluated'],
      summary: 'No-live evidence is metadata-only.',
      recommendationGrantsExecution: false,
      metadataOnly: true,
      bodyStored: false,
      liveExecution: false,
      externalProcessStarted: false,
      executionDisabled: true,
    });
    const governanceBlocker = CodexExecGovernanceBlockerSchema.parse({
      id: 'codex_governance_blocker_1',
      schemaVersion,
      createdAt,
      severity: 'medium',
      code: 'review_history_missing',
      summary: 'Review history should be present before ADR review.',
      sourceSection: 'review_history',
      recommendedResolution: 'Create a non-executing report review history.',
      recommendationGrantsExecution: false,
      metadataOnly: true,
      bodyStored: false,
      liveExecution: false,
      externalProcessStarted: false,
      executionDisabled: true,
    });
    const governanceSummary = CodexExecGovernanceReviewPackageSummarySchema.parse({
      id: 'codex_governance_package_summary_1',
      schemaVersion,
      createdAt,
      dryRunId: record.dryRunId,
      status: 'needs_changes',
      riskClassification: 'medium',
      recommendation: 'needs_changes',
      recommendationGrantsExecution: false,
      checklistPassedCount: 1,
      checklistWarningCount: 0,
      checklistFailedCount: 0,
      blockerCount: 1,
      unresolvedBlockerCount: 1,
      evidenceRefCount: 1,
      auditEventCount: 1,
      latestReviewId: record.id,
      reportId: 'codex_report_1',
      handoffId: handoff.id,
      metadataOnly: true,
      bodyStored: false,
      liveExecution: false,
      externalProcessStarted: false,
      executionDisabled: true,
    });
    const governancePackage = CodexExecGovernanceReviewPackageSchema.parse({
      id: 'codex_governance_package_1',
      schemaVersion,
      createdAt,
      dryRunId: record.dryRunId,
      status: 'needs_changes',
      query: governanceQuery,
      summary: governanceSummary,
      sectionOrder: [
        'dry_run',
        'timeline',
        'evidence',
        'audit',
        'report',
        'report_review',
        'review_history',
        'handoff',
        'no_live_boundary',
        'adr_readiness',
        'risks',
        'blockers',
        'recommendation',
      ],
      reviewHistory: history,
      latestReview: summary,
      handoff,
      noLiveEvidence,
      adrReadinessChecklist: [adrCheck],
      blockers: [governanceBlocker],
      riskClassification: 'medium',
      recommendation: 'needs_changes',
      recommendationGrantsExecution: false,
      metadataOnly: true,
      bodyStored: false,
      liveExecution: false,
      externalProcessStarted: false,
      executionDisabled: true,
    });
    const adrDraftQuery = CodexExecLiveAdapterAdrDraftQuerySchema.parse({
      id: 'codex_adr_draft_query_1',
      schemaVersion,
      createdAt,
      dryRunId: record.dryRunId,
      format: 'markdown',
      includeEvidence: true,
      includeAudit: true,
      recommendationGrantsExecution: false,
      metadataOnly: true,
      bodyStored: false,
      draftOnly: true,
      liveExecution: false,
      externalProcessStarted: false,
      executionDisabled: true,
    });
    const adrDraftSection = CodexExecLiveAdapterAdrDraftSectionSchema.parse({
      id: 'codex_adr_draft_section_1',
      schemaVersion,
      createdAt,
      kind: 'recommended_decision',
      title: 'Recommended Decision',
      status: 'blocked',
      summary: 'Recommendation is ADR guidance only and does not grant execution.',
      items: [
        {
          label: 'recommendation',
          value: 'needs_changes',
        },
      ],
      refIds: [governancePackage.id],
      hashes: ['sha256:adr-draft-section'],
      recommendationGrantsExecution: false,
      metadataOnly: true,
      bodyStored: false,
      draftOnly: true,
      liveExecution: false,
      externalProcessStarted: false,
      executionDisabled: true,
    });
    const adrDraftSummary = CodexExecLiveAdapterAdrDraftSummarySchema.parse({
      id: 'codex_adr_draft_summary_1',
      schemaVersion,
      createdAt,
      dryRunId: record.dryRunId,
      status: 'blocked',
      title: 'ADR Draft: Codex control-plane live adapter readiness',
      sectionCount: 1,
      governancePackageStatus: governancePackage.status,
      riskClassification: governancePackage.riskClassification,
      recommendation: governancePackage.recommendation,
      recommendationGrantsExecution: false,
      blockerCount: governancePackage.blockers.length,
      readinessPassedCount: 1,
      readinessFailedCount: 0,
      metadataOnly: true,
      bodyStored: false,
      draftOnly: true,
      liveExecution: false,
      externalProcessStarted: false,
      executionDisabled: true,
    });
    const adrDraft = CodexExecLiveAdapterAdrDraftSchema.parse({
      id: 'codex_adr_draft_1',
      schemaVersion,
      createdAt,
      dryRunId: record.dryRunId,
      status: 'blocked',
      format: 'markdown',
      query: adrDraftQuery,
      title: 'ADR Draft: Codex control-plane live adapter readiness',
      summary: adrDraftSummary,
      governancePackageSummary: governancePackage.summary,
      governancePackage,
      sections: [adrDraftSection],
      sectionOrder: ['recommended_decision'],
      recommendation: governancePackage.recommendation,
      recommendationGrantsExecution: false,
      metadataOnly: true,
      bodyStored: false,
      draftOnly: true,
      liveExecution: false,
      externalProcessStarted: false,
      executionDisabled: true,
    });
    const adrDraftExport = CodexExecLiveAdapterAdrDraftExportResultSchema.parse({
      id: 'codex_adr_draft_export_1',
      schemaVersion,
      createdAt,
      dryRunId: record.dryRunId,
      format: 'markdown',
      status: 'blocked',
      draft: adrDraft,
      renderedContent: '# ADR Draft\n\nThis is metadata-only guidance.',
      renderedContentHash: 'sha256:adr-draft',
      renderedContentLength: 40,
      recommendationGrantsExecution: false,
      metadataOnly: true,
      bodyStored: false,
      sourceBodyStored: false,
      draftOnly: true,
      liveExecution: false,
      externalProcessStarted: false,
      executionDisabled: true,
    });

    expect(record.recommendationGrantsExecution).toBe(false);
    expect(summary.recommendation).toBe('ready_for_adr');
    expect(history.latestReview?.reviewId).toBe(record.id);
    expect(comparison.recommendationGrantsExecution).toBe(false);
    expect(handoff.recommendationGrantsExecution).toBe(false);
    expect(governancePackage.recommendationGrantsExecution).toBe(false);
    expect(governancePackage.noLiveEvidence.noRealCodexExec).toBe(true);
    expect(adrDraft.draftOnly).toBe(true);
    expect(adrDraft.recommendationGrantsExecution).toBe(false);
    expect(adrDraftExport.sourceBodyStored).toBe(false);
    expect(JSON.stringify(record)).not.toContain('full command body');
    expect(JSON.stringify(history)).not.toContain('full command body');
    expect(JSON.stringify(handoff)).not.toContain('full command body');
    expect(JSON.stringify(governancePackage)).not.toContain('full command body');
    expect(JSON.stringify(adrDraft)).not.toContain('full command body');
  });

  it('parses live adapter ADR decision records without granting execution', () => {
    const gatePolicy = CodexExecLiveAdapterAdrDecisionGatePolicySchema.parse({
      id: 'codex_live_adapter_adr_gate_policy_1',
      schemaVersion,
      createdAt,
      allowedSandboxModes: ['read_only'],
      forbiddenSandboxModes: ['workspace_write', 'danger_full_access'],
      triggerSurface: 'cli_only',
      dashboardTriggerAllowed: false,
      dryRunRequired: true,
      approvalArtifactRequired: true,
      dryRunPlanHashMatchRequired: true,
      policyDecisionHashMatchRequired: true,
      isolatedWorktreeRequired: true,
      postRunVerificationCommand: 'pnpm verify:foundation',
      evidenceRequired: true,
      auditRequired: true,
      implementationApproved: false,
      processAdapterApproved: false,
      recommendationGrantsExecution: false,
      metadataOnly: true,
      bodyStored: false,
      liveExecution: false,
      externalProcessStarted: false,
      executionDisabled: true,
    });
    const evidenceRef = {
      id: 'evidence_adr_decision_1',
      schemaVersion,
      createdAt,
      kind: 'codex.exec.live_adapter_adr_decision',
      summary: 'ADR decision evidence is metadata-only.',
      hash: 'sha256:adr-decision',
      redacted: true,
      labels: ['codex.live_adapter_adr_decision'],
    };
    const record = CodexExecLiveAdapterAdrDecisionRecordSchema.parse({
      id: 'codex_live_adapter_adr_decision_1',
      schemaVersion,
      createdAt,
      dryRunId: 'codex_dry_run_1',
      adrDocumentPath: 'docs/adr/round-3n-live-adapter-adr.md',
      decisionDocumentPath: 'docs/adr/round-3n-go-no-go-decision.md',
      decision: 'conditional_read_only_go',
      status: 'recorded',
      reviewerLabel: 'local-operator',
      rationaleSummary:
        'Conditional read-only design can continue; implementation is not approved.',
      recordedAt: createdAt,
      gatePolicy,
      allowedSandboxModes: ['read_only'],
      forbiddenSandboxModes: ['workspace_write', 'danger_full_access'],
      futureTriggerPolicy: 'cli_only',
      dashboardTriggerAllowed: false,
      dryRunRequired: true,
      approvalArtifactRequired: true,
      dryRunPlanHashMatchRequired: true,
      policyDecisionHashMatchRequired: true,
      isolatedWorktreeRequired: true,
      postRunVerificationCommand: 'pnpm verify:foundation',
      evidenceRequired: true,
      auditRequired: true,
      implementationApproved: false,
      processAdapterApproved: false,
      recommendationGrantsExecution: false,
      evidenceRefs: [evidenceRef],
      auditEventIds: ['audit_adr_decision_1'],
      metadataOnly: true,
      bodyStored: false,
      liveExecution: false,
      externalProcessStarted: false,
      executionDisabled: true,
    });
    const summary = CodexExecLiveAdapterAdrDecisionSummarySchema.parse({
      id: 'codex_live_adapter_adr_decision_summary_1',
      schemaVersion,
      createdAt,
      decisionId: record.id,
      dryRunId: record.dryRunId,
      decision: record.decision,
      status: record.status,
      reviewerLabel: record.reviewerLabel,
      rationaleSummary: record.rationaleSummary,
      allowedSandboxModes: record.allowedSandboxModes,
      forbiddenSandboxModes: record.forbiddenSandboxModes,
      futureTriggerPolicy: 'cli_only',
      dashboardTriggerAllowed: false,
      approvalArtifactRequired: true,
      dryRunPlanHashMatchRequired: true,
      policyDecisionHashMatchRequired: true,
      isolatedWorktreeRequired: true,
      postRunVerificationCommand: 'pnpm verify:foundation',
      evidenceCount: 1,
      auditEventCount: 1,
      implementationApproved: false,
      processAdapterApproved: false,
      recommendationGrantsExecution: false,
      metadataOnly: true,
      bodyStored: false,
      liveExecution: false,
      externalProcessStarted: false,
      executionDisabled: true,
    });
    const query = CodexExecLiveAdapterAdrDecisionQuerySchema.parse({
      id: 'codex_live_adapter_adr_decision_query_1',
      schemaVersion,
      createdAt,
      dryRunId: record.dryRunId,
      status: 'recorded',
      decision: 'conditional_read_only_go',
      limit: 10,
      implementationApproved: false,
      processAdapterApproved: false,
      recommendationGrantsExecution: false,
      dashboardTriggerAllowed: false,
      metadataOnly: true,
      bodyStored: false,
      liveExecution: false,
      externalProcessStarted: false,
      executionDisabled: true,
    });

    expect(record.decision).toBe('conditional_read_only_go');
    expect(record.allowedSandboxModes).toEqual(['read_only']);
    expect(record.forbiddenSandboxModes).toEqual(['workspace_write', 'danger_full_access']);
    expect(record.dashboardTriggerAllowed).toBe(false);
    expect(record.implementationApproved).toBe(false);
    expect(record.processAdapterApproved).toBe(false);
    expect(record.recommendationGrantsExecution).toBe(false);
    expect(summary.evidenceCount).toBe(1);
    expect(query.limit).toBe(10);
    expect(JSON.stringify(record)).not.toContain('full prompt body');
    expect(JSON.stringify(record)).not.toContain('full command body');
  });

  it('parses read-only adapter preflight simulator contracts with fixed no-live flags', () => {
    const checklistItem = CodexExecReadOnlyAdapterOperatorChecklistItemSchema.parse({
      id: 'codex_read_only_checklist_1',
      schemaVersion,
      createdAt,
      code: 'dry_run_reviewed',
      label: 'Dry-run reviewed',
      summary: 'Operator reviewed metadata-only dry-run summary.',
      checked: true,
      required: true,
      metadataOnly: true,
      bodyStored: false,
      liveExecution: false,
      externalProcessStarted: false,
      executionDisabled: true,
      processAdapterStarted: false,
      implementationApproved: false,
      dashboardTriggerAllowed: false,
    });
    const check = CodexExecReadOnlyAdapterPreflightSimulationCheckSchema.parse({
      id: 'codex_read_only_preflight_check_1',
      schemaVersion,
      createdAt,
      code: 'sandbox_read_only_only',
      source: 'sandbox',
      status: 'passed',
      required: true,
      summary: 'Sandbox is read_only.',
      metadataOnly: true,
      bodyStored: false,
      liveExecution: false,
      externalProcessStarted: false,
      executionDisabled: true,
      processAdapterStarted: false,
      implementationApproved: false,
      dashboardTriggerAllowed: false,
    });
    const blocker = CodexExecReadOnlyAdapterPreflightSimulationBlockerSchema.parse({
      id: 'codex_read_only_preflight_blocker_1',
      schemaVersion,
      createdAt,
      code: 'approval_artifact_exists',
      source: 'approval',
      severity: 'high',
      relatedCheckCode: 'approval_artifact_exists',
      summary: 'Approval artifact is missing.',
      metadataOnly: true,
      bodyStored: false,
      liveExecution: false,
      externalProcessStarted: false,
      executionDisabled: true,
      processAdapterStarted: false,
      implementationApproved: false,
      dashboardTriggerAllowed: false,
    });
    const input = CodexExecReadOnlyAdapterPreflightSimulationInputSchema.parse({
      id: 'codex_read_only_preflight_input_1',
      schemaVersion,
      createdAt,
      dryRunId: 'codex_dry_run_1',
      requestedSandboxMode: 'read_only',
      isolatedWorktreePresent: true,
      evidenceStoreReady: true,
      auditStoreReady: true,
      operatorChecklist: [checklistItem],
      metadataOnly: true,
      bodyStored: false,
      liveExecution: false,
      externalProcessStarted: false,
      executionDisabled: true,
      processAdapterStarted: false,
      implementationApproved: false,
      dashboardTriggerAllowed: false,
    });
    const result = CodexExecReadOnlyAdapterPreflightSimulationResultSchema.parse({
      id: 'codex_read_only_preflight_result_1',
      schemaVersion,
      createdAt,
      dryRunId: input.dryRunId,
      status: 'failed',
      requestedSandboxMode: 'read_only',
      checks: [check],
      blockers: [blocker],
      operatorChecklist: [checklistItem],
      configLiveEnabled: false,
      dryRunExists: true,
      policyDecisionExists: true,
      approvalArtifactExists: false,
      approvalArtifactValid: false,
      dryRunPlanHashMatched: false,
      policyDecisionHashMatched: false,
      isolatedWorktreePresent: true,
      evidenceStoreReady: true,
      auditStoreReady: true,
      checklistComplete: true,
      adrDecisionDesignOnly: true,
      passedCheckCount: 1,
      failedCheckCount: 1,
      warningCheckCount: 0,
      blockerCount: 1,
      summary: 'Simulation failed because approval artifact is missing.',
      recommendationGrantsExecution: false,
      metadataOnly: true,
      bodyStored: false,
      liveExecution: false,
      externalProcessStarted: false,
      executionDisabled: true,
      processAdapterStarted: false,
      implementationApproved: false,
      dashboardTriggerAllowed: false,
    });
    const summary = CodexExecReadOnlyAdapterPreflightSimulationSummarySchema.parse({
      id: 'codex_read_only_preflight_summary_1',
      schemaVersion,
      createdAt,
      simulationId: result.id,
      dryRunId: result.dryRunId,
      status: result.status,
      requestedSandboxMode: 'read_only',
      passedCheckCount: 1,
      failedCheckCount: 1,
      warningCheckCount: 0,
      blockerCount: 1,
      checklistCompletedCount: 1,
      checklistTotalCount: 1,
      summary: result.summary,
      recommendationGrantsExecution: false,
      metadataOnly: true,
      bodyStored: false,
      liveExecution: false,
      externalProcessStarted: false,
      executionDisabled: true,
      processAdapterStarted: false,
      implementationApproved: false,
      dashboardTriggerAllowed: false,
    });

    expect(result.liveExecution).toBe(false);
    expect(result.externalProcessStarted).toBe(false);
    expect(result.executionDisabled).toBe(true);
    expect(result.processAdapterStarted).toBe(false);
    expect(result.implementationApproved).toBe(false);
    expect(result.dashboardTriggerAllowed).toBe(false);
    expect(result.recommendationGrantsExecution).toBe(false);
    expect(summary.status).toBe('failed');
  });

  it('parses read-only adapter simulator review contracts without granting execution', () => {
    const checklistItem = CodexExecReadOnlyAdapterSimulatorReviewChecklistItemSchema.parse({
      id: 'codex_read_only_adapter_simulator_review_check_1',
      schemaVersion,
      createdAt,
      code: 'simulator_check_approval_artifact_exists',
      label: 'Approval Artifact Exists',
      checkCode: 'approval_artifact_exists',
      disposition: 'hard_gate',
      status: 'failed',
      required: true,
      summary: 'Approval artifact is missing.',
      processAdapterApproved: false,
      recommendationGrantsExecution: false,
      metadataOnly: true,
      bodyStored: false,
      liveExecution: false,
      externalProcessStarted: false,
      executionDisabled: true,
      processAdapterStarted: false,
      implementationApproved: false,
      dashboardTriggerAllowed: false,
    });
    const finding = CodexExecReadOnlyAdapterSimulatorReviewFindingSchema.parse({
      id: 'codex_read_only_adapter_simulator_review_finding_1',
      schemaVersion,
      createdAt,
      code: checklistItem.code,
      severity: 'high',
      relatedCheckCode: checklistItem.checkCode,
      disposition: 'hard_gate',
      summary: checklistItem.summary,
      recommendation: 'Resolve this hard gate before implementation planning exits.',
      processAdapterApproved: false,
      recommendationGrantsExecution: false,
      metadataOnly: true,
      bodyStored: false,
      liveExecution: false,
      externalProcessStarted: false,
      executionDisabled: true,
      processAdapterStarted: false,
      implementationApproved: false,
      dashboardTriggerAllowed: false,
    });
    const blocker = CodexExecReadOnlyAdapterPreflightSimulationBlockerSchema.parse({
      id: 'codex_read_only_preflight_blocker_2',
      schemaVersion,
      createdAt,
      code: 'approval_artifact_exists',
      source: 'approval',
      severity: 'high',
      relatedCheckCode: 'approval_artifact_exists',
      summary: 'Approval artifact is missing.',
      metadataOnly: true,
      bodyStored: false,
      liveExecution: false,
      externalProcessStarted: false,
      executionDisabled: true,
      processAdapterStarted: false,
      implementationApproved: false,
      dashboardTriggerAllowed: false,
    });
    const record = CodexExecReadOnlyAdapterSimulatorReviewDecisionRecordSchema.parse({
      id: 'codex_read_only_adapter_simulator_review_1',
      schemaVersion,
      createdAt,
      dryRunId: 'codex_dry_run_1',
      simulationId: 'codex_read_only_preflight_result_1',
      simulationStatus: 'failed',
      outcome: 'go_to_implementation_planning',
      status: 'recorded',
      reviewerLabel: 'local-operator',
      rationaleSummary:
        'Implementation planning may continue, but implementation and process adapter remain unapproved.',
      reviewedAt: createdAt,
      checklistItems: [checklistItem],
      findings: [finding],
      simulatorBlockers: [blocker],
      hardGateCount: 1,
      requiresReviewCount: 0,
      informationalCount: 0,
      unresolvedBlockerCount: 1,
      evidenceRefs: [],
      auditEventIds: ['audit_simulator_review_1'],
      processAdapterApproved: false,
      recommendationGrantsExecution: false,
      metadataOnly: true,
      bodyStored: false,
      liveExecution: false,
      externalProcessStarted: false,
      executionDisabled: true,
      processAdapterStarted: false,
      implementationApproved: false,
      dashboardTriggerAllowed: false,
    });
    const summary = CodexExecReadOnlyAdapterSimulatorReviewSummarySchema.parse({
      id: 'codex_read_only_adapter_simulator_review_summary_1',
      schemaVersion,
      createdAt,
      reviewId: record.id,
      dryRunId: record.dryRunId,
      simulationId: record.simulationId,
      simulationStatus: record.simulationStatus,
      outcome: record.outcome,
      status: record.status,
      reviewerLabel: record.reviewerLabel,
      reviewedAt: record.reviewedAt,
      hardGateCount: 1,
      requiresReviewCount: 0,
      informationalCount: 0,
      unresolvedBlockerCount: 1,
      summary: 'Review allows implementation planning only.',
      processAdapterApproved: false,
      recommendationGrantsExecution: false,
      metadataOnly: true,
      bodyStored: false,
      liveExecution: false,
      externalProcessStarted: false,
      executionDisabled: true,
      processAdapterStarted: false,
      implementationApproved: false,
      dashboardTriggerAllowed: false,
    });
    const query = CodexExecReadOnlyAdapterSimulatorReviewQuerySchema.parse({
      id: 'codex_read_only_adapter_simulator_review_query_1',
      schemaVersion,
      createdAt,
      dryRunId: record.dryRunId,
      status: 'recorded',
      outcome: 'go_to_implementation_planning',
      limit: 10,
      processAdapterApproved: false,
      recommendationGrantsExecution: false,
      metadataOnly: true,
      bodyStored: false,
      liveExecution: false,
      externalProcessStarted: false,
      executionDisabled: true,
      processAdapterStarted: false,
      implementationApproved: false,
      dashboardTriggerAllowed: false,
    });

    expect(record.outcome).toBe('go_to_implementation_planning');
    expect(record.implementationApproved).toBe(false);
    expect(record.processAdapterApproved).toBe(false);
    expect(record.recommendationGrantsExecution).toBe(false);
    expect(summary.executionDisabled).toBe(true);
    expect(query.limit).toBe(10);
    expect(JSON.stringify(record)).not.toContain('full prompt body');
    expect(JSON.stringify(record)).not.toContain('full command body');
  });

  it('parses implementation plan review contracts without granting execution', () => {
    const checklistItem = CodexExecReadOnlyAdapterImplementationPlanReviewChecklistItemSchema.parse(
      {
        id: 'codex_read_only_adapter_implementation_plan_review_check_1',
        schemaVersion,
        createdAt,
        code: 'cli_only_trigger',
        label: 'CLI-only trigger',
        disposition: 'hard_gate',
        status: 'passed',
        required: true,
        summary: 'Future skeleton remains CLI-only and disabled by default.',
        processAdapterApproved: false,
        recommendationGrantsExecution: false,
        workspaceWriteAllowed: false,
        dangerFullAccessAllowed: false,
        metadataOnly: true,
        bodyStored: false,
        liveExecution: false,
        externalProcessStarted: false,
        executionDisabled: true,
        processAdapterStarted: false,
        implementationApproved: false,
        dashboardTriggerAllowed: false,
      },
    );
    const finding = CodexExecReadOnlyAdapterImplementationPlanReviewFindingSchema.parse({
      id: 'codex_read_only_adapter_implementation_plan_review_finding_1',
      schemaVersion,
      createdAt,
      code: 'skeleton_only_if_approved',
      severity: 'medium',
      relatedChecklistCode: 'skeleton_only_if_approved',
      disposition: 'requires_review',
      summary: 'Round 3T scope must remain disabled-by-default skeleton only.',
      recommendation: 'Confirm this during Round 3S before allowing skeleton work.',
      processAdapterApproved: false,
      recommendationGrantsExecution: false,
      workspaceWriteAllowed: false,
      dangerFullAccessAllowed: false,
      metadataOnly: true,
      bodyStored: false,
      liveExecution: false,
      externalProcessStarted: false,
      executionDisabled: true,
      processAdapterStarted: false,
      implementationApproved: false,
      dashboardTriggerAllowed: false,
    });
    const record = CodexExecReadOnlyAdapterImplementationPlanReviewDecisionRecordSchema.parse({
      id: 'codex_read_only_adapter_implementation_plan_review_1',
      schemaVersion,
      createdAt,
      planDocumentPath: 'docs/design/round-3r-read-only-adapter-implementation-plan.md',
      planDocumentHash: 'sha256:implementation-plan',
      outcome: 'conditional_go_to_disabled_skeleton',
      status: 'recorded',
      reviewerLabel: 'local-operator',
      rationaleSummary:
        'Conditional skeleton work may continue, but process adapter and execution remain unapproved.',
      reviewedAt: createdAt,
      disabledSkeletonApproved: true,
      checklistItems: [checklistItem],
      findings: [finding],
      hardGateCount: 1,
      requiresReviewCount: 1,
      informationalCount: 0,
      unresolvedFindingCount: 1,
      evidenceRefs: [],
      auditEventIds: ['audit_implementation_plan_review_1'],
      processAdapterApproved: false,
      recommendationGrantsExecution: false,
      workspaceWriteAllowed: false,
      dangerFullAccessAllowed: false,
      metadataOnly: true,
      bodyStored: false,
      liveExecution: false,
      externalProcessStarted: false,
      executionDisabled: true,
      processAdapterStarted: false,
      implementationApproved: false,
      dashboardTriggerAllowed: false,
    });
    const summary = CodexExecReadOnlyAdapterImplementationPlanReviewSummarySchema.parse({
      id: 'codex_read_only_adapter_implementation_plan_review_summary_1',
      schemaVersion,
      createdAt,
      reviewId: record.id,
      planDocumentPath: record.planDocumentPath,
      planDocumentHash: record.planDocumentHash,
      outcome: record.outcome,
      status: record.status,
      reviewerLabel: record.reviewerLabel,
      reviewedAt: record.reviewedAt,
      disabledSkeletonApproved: true,
      hardGateCount: 1,
      requiresReviewCount: 1,
      informationalCount: 0,
      unresolvedFindingCount: 1,
      summary: 'Conditional skeleton approval is not execution approval.',
      processAdapterApproved: false,
      recommendationGrantsExecution: false,
      workspaceWriteAllowed: false,
      dangerFullAccessAllowed: false,
      metadataOnly: true,
      bodyStored: false,
      liveExecution: false,
      externalProcessStarted: false,
      executionDisabled: true,
      processAdapterStarted: false,
      implementationApproved: false,
      dashboardTriggerAllowed: false,
    });
    const query = CodexExecReadOnlyAdapterImplementationPlanReviewQuerySchema.parse({
      id: 'codex_read_only_adapter_implementation_plan_review_query_1',
      schemaVersion,
      createdAt,
      status: 'recorded',
      outcome: 'conditional_go_to_disabled_skeleton',
      limit: 10,
      processAdapterApproved: false,
      recommendationGrantsExecution: false,
      workspaceWriteAllowed: false,
      dangerFullAccessAllowed: false,
      metadataOnly: true,
      bodyStored: false,
      liveExecution: false,
      externalProcessStarted: false,
      executionDisabled: true,
      processAdapterStarted: false,
      implementationApproved: false,
      dashboardTriggerAllowed: false,
    });

    expect(record.disabledSkeletonApproved).toBe(true);
    expect(record.implementationApproved).toBe(false);
    expect(record.processAdapterApproved).toBe(false);
    expect(record.recommendationGrantsExecution).toBe(false);
    expect(record.workspaceWriteAllowed).toBe(false);
    expect(record.dangerFullAccessAllowed).toBe(false);
    expect(summary.executionDisabled).toBe(true);
    expect(query.limit).toBe(10);
    expect(JSON.stringify(record)).not.toContain('full prompt body');
    expect(JSON.stringify(record)).not.toContain('full command body');

    expect(() =>
      CodexExecReadOnlyAdapterImplementationPlanReviewDecisionRecordSchema.parse({
        ...record,
        id: 'codex_read_only_adapter_implementation_plan_review_invalid',
        outcome: 'no_go',
        disabledSkeletonApproved: true,
      }),
    ).toThrow();
  });

  it('parses disabled skeleton, fixture boundary, and final readiness contracts', () => {
    const flagFields = {
      processAdapterApproved: false,
      recommendationGrantsExecution: false,
      workspaceWriteAllowed: false,
      dangerFullAccessAllowed: false,
      metadataOnly: true,
      bodyStored: false,
      liveExecution: false,
      externalProcessStarted: false,
      executionDisabled: true,
      processAdapterStarted: false,
      implementationApproved: false,
      dashboardTriggerAllowed: false,
    } as const;
    const config = CodexExecReadOnlyAdapterSkeletonConfigSchema.parse({
      id: 'codex_read_only_adapter_skeleton_config_1',
      schemaVersion,
      createdAt,
      status: 'disabled',
      explicitEnableRequired: true,
      configuredEnabled: false,
      allowedSandboxModes: ['read_only'],
      forbiddenSandboxModes: ['workspace_write', 'danger_full_access'],
      cliOnly: true,
      noRunnableCommand: true,
      commandPreviewStored: false,
      argvStored: false,
      executablePathStored: false,
      shellSnippetStored: false,
      envPlanStored: false,
      ...flagFields,
    });
    const preview = CodexExecReadOnlyAdapterSkeletonPreviewSchema.parse({
      id: 'codex_read_only_adapter_skeleton_preview_1',
      schemaVersion,
      createdAt,
      status: 'disabled',
      config,
      disabledReasons: [],
      summary: 'Disabled skeleton preview only.',
      noRunnableCommand: true,
      commandPreviewStored: false,
      argvStored: false,
      executablePathStored: false,
      shellSnippetStored: false,
      envPlanStored: false,
      ...flagFields,
    });
    const skeletonReview = CodexExecReadOnlyAdapterSkeletonReviewDecisionRecordSchema.parse({
      id: 'codex_read_only_adapter_skeleton_review_1',
      schemaVersion,
      createdAt,
      skeletonPreviewId: preview.id,
      outcome: 'skeleton_accepted_for_fixture_boundary_only',
      status: 'recorded',
      reviewerLabel: 'local-operator',
      rationaleSummary: 'Fixture-backed boundary only; no process adapter approval.',
      reviewedAt: createdAt,
      fixtureBoundaryAllowed: true,
      checklistItems: [],
      findings: [],
      hardGateCount: 0,
      requiresReviewCount: 0,
      informationalCount: 0,
      unresolvedFindingCount: 0,
      evidenceRefs: [],
      auditEventIds: [],
      ...flagFields,
    });
    const skeletonSummary = CodexExecReadOnlyAdapterSkeletonReviewSummarySchema.parse({
      id: 'codex_read_only_adapter_skeleton_review_summary_1',
      schemaVersion,
      createdAt,
      reviewId: skeletonReview.id,
      skeletonPreviewId: preview.id,
      outcome: skeletonReview.outcome,
      status: skeletonReview.status,
      reviewerLabel: skeletonReview.reviewerLabel,
      reviewedAt: createdAt,
      fixtureBoundaryAllowed: true,
      hardGateCount: 0,
      requiresReviewCount: 0,
      informationalCount: 0,
      unresolvedFindingCount: 0,
      summary: 'Skeleton accepted for fixture-backed replay boundary only.',
      ...flagFields,
    });
    const fixtureBoundary = CodexExecReadOnlyAdapterFixtureBoundaryResultSchema.parse({
      id: 'codex_read_only_adapter_fixture_boundary_1',
      schemaVersion,
      createdAt,
      input: {
        id: 'codex_read_only_adapter_fixture_boundary_input_1',
        schemaVersion,
        createdAt,
        fixturePath: 'packages/codex-kernel/fixtures/codex-exec-basic.jsonl',
        fixtureOnly: true,
        ...flagFields,
      },
      status: 'completed',
      fixturePath: 'packages/codex-kernel/fixtures/codex-exec-basic.jsonl',
      fixturePathHash: 'sha256:fixture-path',
      fixtureOnly: true,
      eventCount: 1,
      itemCount: 0,
      errorCount: 0,
      finalStatus: 'completed',
      events: [],
      evidenceRefs: [],
      auditEvents: [],
      auditEventIds: [],
      summary: 'Fixture-backed replay boundary completed.',
      ...flagFields,
    });
    const fixtureSummary = CodexExecReadOnlyAdapterFixtureBoundarySummarySchema.parse({
      id: 'codex_read_only_adapter_fixture_boundary_summary_1',
      schemaVersion,
      createdAt,
      boundaryResultId: fixtureBoundary.id,
      status: fixtureBoundary.status,
      fixturePath: fixtureBoundary.fixturePath,
      fixturePathHash: fixtureBoundary.fixturePathHash,
      fixtureOnly: true,
      eventCount: 1,
      itemCount: 0,
      errorCount: 0,
      finalStatus: 'completed',
      summary: 'Fixture-backed replay boundary completed.',
      ...flagFields,
    });
    const finalReadiness = CodexExecReadOnlyAdapterFinalReadinessDecisionRecordSchema.parse({
      id: 'codex_read_only_adapter_final_readiness_1',
      schemaVersion,
      createdAt,
      outcome: 'ready_for_separate_read_only_adapter_adr',
      status: 'recorded',
      reviewerLabel: 'local-operator',
      rationaleSummary: 'Separate ADR remains required.',
      reviewedAt: createdAt,
      phaseAStatus: 'disabled',
      phaseBOutcome: 'skeleton_accepted_for_fixture_boundary_only',
      phaseCStatus: 'completed',
      realAdapterRequiresSeparateAdr: true,
      currentRoundApprovesProcessStart: false,
      currentRoundApprovesCodexExecution: false,
      currentRoundApprovesWorkspaceWrites: false,
      evidenceRefs: [],
      auditEventIds: [],
      summary: 'Ready only for a separate future ADR.',
      ...flagFields,
    });
    const finalSummary = CodexExecReadOnlyAdapterFinalReadinessSummarySchema.parse({
      id: 'codex_read_only_adapter_final_readiness_summary_1',
      schemaVersion,
      createdAt,
      decisionId: finalReadiness.id,
      outcome: finalReadiness.outcome,
      status: finalReadiness.status,
      reviewerLabel: finalReadiness.reviewerLabel,
      reviewedAt: createdAt,
      phaseAStatus: 'disabled',
      phaseBOutcome: 'skeleton_accepted_for_fixture_boundary_only',
      phaseCStatus: 'completed',
      realAdapterRequiresSeparateAdr: true,
      summary: 'Ready only for a separate future ADR.',
      ...flagFields,
    });

    expect(config.configuredEnabled).toBe(false);
    expect(preview.noRunnableCommand).toBe(true);
    expect(skeletonSummary.fixtureBoundaryAllowed).toBe(true);
    expect(fixtureSummary.fixtureOnly).toBe(true);
    expect(finalSummary.realAdapterRequiresSeparateAdr).toBe(true);
    expect(finalReadiness.currentRoundApprovesProcessStart).toBe(false);
    expect(finalReadiness.currentRoundApprovesCodexExecution).toBe(false);
    expect(finalReadiness.currentRoundApprovesWorkspaceWrites).toBe(false);
    expect(JSON.stringify(fixtureBoundary)).not.toContain('synthetic stdout body');
  });

  it('parses real read-only adapter readiness contracts without approval semantics', () => {
    const flagFields = {
      processAdapterApproved: false,
      recommendationGrantsExecution: false,
      workspaceWriteAllowed: false,
      dangerFullAccessAllowed: false,
      metadataOnly: true,
      bodyStored: false,
      liveExecution: false,
      externalProcessStarted: false,
      executionDisabled: true,
      processAdapterStarted: false,
      implementationApproved: false,
      dashboardTriggerAllowed: false,
    } as const;
    const gate = CodexExecRealReadOnlyAdapterReadinessGateSchema.parse({
      id: 'codex_real_read_only_adapter_readiness_gate_1',
      schemaVersion,
      createdAt,
      code: 'fixture_path_guard_symlink_escape',
      label: 'Fixture path guard symlink escape',
      category: 'fixture_boundary',
      disposition: 'requires_review',
      status: 'requires_review',
      required: true,
      summary: 'Symlink escape verification remains pending.',
      ...flagFields,
    });
    const blocker = CodexExecRealReadOnlyAdapterReadinessBlockerSchema.parse({
      id: 'codex_real_read_only_adapter_readiness_blocker_1',
      schemaVersion,
      createdAt,
      code: 'round_3s_conditional_decision_exists',
      severity: 'critical',
      relatedGateCode: 'round_3s_conditional_decision_exists',
      status: 'blocked',
      summary: 'Round 3S conditional decision is missing.',
      recommendation: 'Create an explicit local governance decision before readiness persistence.',
      ...flagFields,
    });
    const finding = CodexExecRealReadOnlyAdapterReadinessFindingSchema.parse({
      id: 'codex_real_read_only_adapter_readiness_finding_1',
      schemaVersion,
      createdAt,
      code: 'documented_only_3tw_evidence',
      severity: 'medium',
      status: 'requires_review',
      summary: 'Round 3T-W evidence is documented-only.',
      recommendation: 'Treat this package as requires_review until persisted evidence exists.',
      ...flagFields,
    });
    const checklistItem = CodexExecRealReadOnlyAdapterReadinessChecklistItemSchema.parse({
      id: 'codex_real_read_only_adapter_readiness_check_1',
      schemaVersion,
      createdAt,
      code: 'separate_adr_required',
      label: 'Separate ADR required',
      status: 'passed',
      required: true,
      summary: 'A separate ADR is required before any implementation can be considered.',
      ...flagFields,
    });
    const packageRecord = CodexExecRealReadOnlyAdapterReadinessPackageSchema.parse({
      id: 'codex_real_read_only_adapter_readiness_package_1',
      schemaVersion,
      createdAt,
      dryRunId: 'codex_dry_run_1',
      status: 'ready_for_separate_adr',
      recommendation:
        'Ready for separate ADR review only. Does not grant implementation, process launch, or execution permission.',
      governanceDecisionId: 'codex_read_only_adapter_implementation_plan_review_1',
      documentedArtifactRefs: ['docs/reviews/round-3tw-additional-rules-audit.md'],
      gates: [gate],
      blockers: [],
      findings: [finding],
      checklistItems: [checklistItem],
      hardGateCount: 1,
      passedGateCount: 1,
      requiresReviewCount: 0,
      blockerCount: 0,
      findingCount: 1,
      documentedOnly3twEvidence: false,
      symlinkEscapeVerificationPending: false,
      evidenceRefs: [],
      auditEventIds: ['audit_readiness_1'],
      summary: 'Ready only for a separate ADR review.',
      ...flagFields,
    });
    const summary = CodexExecRealReadOnlyAdapterReadinessSummarySchema.parse({
      id: 'codex_real_read_only_adapter_readiness_summary_1',
      schemaVersion,
      createdAt,
      packageId: packageRecord.id,
      dryRunId: packageRecord.dryRunId,
      status: packageRecord.status,
      recommendation: packageRecord.recommendation,
      hardGateCount: 1,
      passedGateCount: 1,
      requiresReviewCount: 0,
      blockerCount: 0,
      findingCount: 1,
      documentedOnly3twEvidence: false,
      symlinkEscapeVerificationPending: false,
      summary: packageRecord.summary,
      ...flagFields,
    });
    const query = CodexExecRealReadOnlyAdapterReadinessQuerySchema.parse({
      id: 'codex_real_read_only_adapter_readiness_query_1',
      schemaVersion,
      createdAt,
      dryRunId: packageRecord.dryRunId,
      status: 'ready_for_separate_adr',
      limit: 10,
      ...flagFields,
    });

    expect(blocker.status).toBe('blocked');
    expect(packageRecord.status).toBe('ready_for_separate_adr');
    expect(packageRecord.implementationApproved).toBe(false);
    expect(packageRecord.processAdapterApproved).toBe(false);
    expect(packageRecord.recommendationGrantsExecution).toBe(false);
    expect(summary.executionDisabled).toBe(true);
    expect(query.limit).toBe(10);
    expect(JSON.stringify(packageRecord)).not.toContain('full report markdown');
    expect(JSON.stringify(packageRecord)).not.toContain('prompt body');
    expect(JSON.stringify(packageRecord)).not.toContain('stdout');
  });

  it('parses real read-only adapter readiness review contracts without approval semantics', () => {
    const flagFields = {
      processAdapterApproved: false,
      recommendationGrantsExecution: false,
      workspaceWriteAllowed: false,
      dangerFullAccessAllowed: false,
      metadataOnly: true,
      bodyStored: false,
      liveExecution: false,
      externalProcessStarted: false,
      executionDisabled: true,
      processAdapterStarted: false,
      implementationApproved: false,
      dashboardTriggerAllowed: false,
    } as const;
    const checklistItem = CodexExecRealReadOnlyAdapterReadinessReviewChecklistItemSchema.parse({
      id: 'codex_real_read_only_adapter_readiness_review_check_1',
      schemaVersion,
      createdAt,
      code: 'unresolved_findings_acknowledged',
      label: 'Unresolved findings acknowledged',
      status: 'passed',
      required: true,
      summary: 'Required finding codes were acknowledged.',
      ...flagFields,
    });
    const finding = CodexExecRealReadOnlyAdapterReadinessReviewFindingSchema.parse({
      id: 'codex_real_read_only_adapter_readiness_review_finding_1',
      schemaVersion,
      createdAt,
      code: 'symlink_escape_verification_pending',
      severity: 'medium',
      status: 'requires_review',
      relatedReadinessFindingId: 'codex_real_read_only_adapter_readiness_finding_1',
      relatedReadinessFindingCode: 'symlink_escape_verification_pending',
      summary: 'Symlink escape verification is pending.',
      recommendation: 'Acknowledge before ADR drafting and verify before any boundary work.',
      ...flagFields,
    });
    const record = CodexExecRealReadOnlyAdapterReadinessReviewDecisionRecordSchema.parse({
      id: 'codex_real_read_only_adapter_readiness_review_1',
      schemaVersion,
      createdAt,
      packageId: 'codex_real_read_only_adapter_readiness_package_1',
      dryRunId: 'codex_dry_run_1',
      packageStatus: 'requires_review',
      outcome: 'conditional_go_to_separate_adr_draft',
      status: 'recorded',
      reviewerLabel: 'local-operator',
      rationaleSummary:
        'Acknowledges symlink_escape_verification_pending and documented_only_3tw_evidence.',
      reviewedAt: createdAt,
      separateAdrDraftAllowed: true,
      acknowledgedFindingCodes: [
        'symlink_escape_verification_pending',
        'documented_only_3tw_evidence',
      ],
      acknowledgedFindingIds: ['codex_real_read_only_adapter_readiness_finding_1'],
      unresolvedFindingCount: 2,
      checklistItems: [checklistItem],
      findings: [finding],
      evidenceRefs: [
        {
          id: 'evidence_readiness_review_1',
          schemaVersion,
          createdAt,
          kind: 'codex.exec.real_read_only_adapter.readiness_review',
          hash: 'sha256:readiness-review',
          summary: 'Readiness review summary only',
        },
      ],
      auditEventIds: ['audit_readiness_review_1'],
      summary:
        'ADR drafting only. Does not grant implementation, process launch, or execution permission.',
      ...flagFields,
    });
    const summary = CodexExecRealReadOnlyAdapterReadinessReviewSummarySchema.parse({
      id: 'codex_real_read_only_adapter_readiness_review_summary_1',
      schemaVersion,
      createdAt,
      reviewId: record.id,
      packageId: record.packageId,
      dryRunId: record.dryRunId,
      packageStatus: record.packageStatus,
      outcome: record.outcome,
      status: record.status,
      reviewerLabel: record.reviewerLabel,
      reviewedAt: record.reviewedAt,
      separateAdrDraftAllowed: true,
      acknowledgedFindingCodes: record.acknowledgedFindingCodes,
      acknowledgedFindingIds: record.acknowledgedFindingIds,
      unresolvedFindingCount: record.unresolvedFindingCount,
      summary: record.summary,
      ...flagFields,
    });
    const query = CodexExecRealReadOnlyAdapterReadinessReviewQuerySchema.parse({
      id: 'codex_real_read_only_adapter_readiness_review_query_1',
      schemaVersion,
      createdAt,
      packageId: record.packageId,
      dryRunId: record.dryRunId,
      status: 'recorded',
      outcome: 'conditional_go_to_separate_adr_draft',
      limit: 10,
      ...flagFields,
    });

    expect(record.separateAdrDraftAllowed).toBe(true);
    expect(record.implementationApproved).toBe(false);
    expect(record.processAdapterApproved).toBe(false);
    expect(record.recommendationGrantsExecution).toBe(false);
    expect(summary.executionDisabled).toBe(true);
    expect(query.limit).toBe(10);
    expect(JSON.stringify(record)).not.toContain('full report markdown');
    expect(JSON.stringify(record)).not.toContain('prompt body');
    expect(JSON.stringify(record)).not.toContain('stdout');

    expect(() =>
      CodexExecRealReadOnlyAdapterReadinessReviewDecisionRecordSchema.parse({
        ...record,
        id: 'codex_real_read_only_adapter_readiness_review_invalid',
        outcome: 'no_go_to_separate_adr_draft',
        separateAdrDraftAllowed: true,
      }),
    ).toThrow();
  });

  it('parses real read-only adapter contract models as metadata-only non-approval records', () => {
    const flagFields = {
      processAdapterApproved: false,
      recommendationGrantsExecution: false,
      workspaceWriteAllowed: false,
      dangerFullAccessAllowed: false,
      metadataOnly: true,
      bodyStored: false,
      liveExecution: false,
      externalProcessStarted: false,
      executionDisabled: true,
      processAdapterStarted: false,
      implementationApproved: false,
      dashboardTriggerAllowed: false,
      promptBodyStored: false,
      commandBodyStored: false,
      stdoutBodyStored: false,
      stderrBodyStored: false,
      agentMessageBodyStored: false,
      reasoningBodyStored: false,
    } as const;
    const noRunnableFields = {
      noRunnableCommand: true,
      commandPreviewStored: false,
      argvStored: false,
      executablePathStored: false,
      shellSnippetStored: false,
      envPlanStored: false,
    } as const;
    const config = CodexExecRealReadOnlyAdapterConfigSchema.parse({
      id: 'codex_real_read_only_adapter_config_1',
      schemaVersion,
      createdAt,
      status: 'disabled',
      defaultEnabled: false,
      configuredEnabled: false,
      explicitEnableRequired: true,
      cliOnly: true,
      dashboardTriggerForbidden: true,
      allowedSandboxMode: 'read_only',
      forbiddenSandboxModes: ['workspace_write', 'danger_full_access'],
      existingDryRunRequired: true,
      approvalArtifactRequired: true,
      dryRunPlanHashRequired: true,
      policyDecisionHashRequired: true,
      isolatedWorktreeRequired: true,
      cleanWorktreeRequired: true,
      metadataEvidenceOnly: true,
      summary: 'Read-only adapter config is disabled by default.',
      ...flagFields,
      ...noRunnableFields,
    });
    const request = CodexExecRealReadOnlyAdapterRequestSchema.parse({
      id: 'codex_real_read_only_adapter_request_1',
      schemaVersion,
      createdAt,
      dryRunId: 'codex_dry_run_1',
      configId: config.id,
      approvalArtifactId: 'codex_approval_artifact_1',
      policyDecisionId: 'policy_1',
      requestedSandboxMode: 'read_only',
      triggerKind: 'cli',
      existingDryRunRequired: true,
      summary: 'Metadata-only request for a future read-only adapter attempt.',
      ...flagFields,
      ...noRunnableFields,
    });
    const boundaryPlan = CodexExecRealReadOnlyAdapterBoundaryPlanSchema.parse({
      id: 'codex_real_read_only_adapter_boundary_plan_1',
      schemaVersion,
      createdAt,
      requestId: request.id,
      dryRunId: request.dryRunId,
      processBoundaryDeferred: true,
      adapterModuleRef: '@codexhub/codex-kernel/read-only-adapter',
      dryRunPlanHash: 'sha256:dry-run',
      policyDecisionHash: 'sha256:policy',
      approvalArtifactHash: 'sha256:approval',
      evidencePlanSummary: 'Metadata and hashes only.',
      auditPlanSummary: 'Audit before, after, abort, and failure.',
      summary: 'Boundary planning metadata only; no runnable command is stored.',
      ...flagFields,
      ...noRunnableFields,
    });
    const check = CodexExecRealReadOnlyAdapterPreflightCheckSchema.parse({
      id: 'codex_real_read_only_adapter_preflight_check_1',
      schemaVersion,
      createdAt,
      code: 'config_default_disabled',
      label: 'Config default disabled',
      status: 'passed',
      required: true,
      summary: 'Default config remains disabled.',
      ...flagFields,
    });
    const preflight = CodexExecRealReadOnlyAdapterPreflightSchema.parse({
      id: 'codex_real_read_only_adapter_preflight_1',
      schemaVersion,
      createdAt,
      requestId: request.id,
      dryRunId: request.dryRunId,
      configId: config.id,
      status: 'passed',
      requestedSandboxMode: 'read_only',
      boundaryPlan,
      checks: [check],
      hardGateCount: 1,
      passedGateCount: 1,
      failedGateCount: 0,
      requiresReviewCount: 0,
      blockerCount: 0,
      summary: 'Preflight contract is metadata only.',
      ...flagFields,
    });
    const error = CodexExecRealReadOnlyAdapterErrorSchema.parse({
      id: 'codex_real_read_only_adapter_error_1',
      schemaVersion,
      createdAt,
      code: 'boundary_deferred',
      severity: 'medium',
      relatedCheckCode: check.code,
      messageSummary: 'Boundary remains deferred in P1.',
      remediationSummary: 'Proceed only after the next gated round.',
      absolutePathLeaked: false,
      ...flagFields,
    });
    const evidenceSummary = CodexExecRealReadOnlyAdapterEvidenceSummarySchema.parse({
      id: 'codex_real_read_only_adapter_evidence_summary_1',
      schemaVersion,
      createdAt,
      dryRunId: request.dryRunId,
      requestId: request.id,
      evidenceRefIds: ['evidence_1'],
      eventHashCount: 1,
      outputHashCount: 0,
      metadataHash: 'sha256:metadata',
      redacted: true,
      summary: 'Evidence summary is metadata-only.',
      ...flagFields,
    });
    const auditSummary = CodexExecRealReadOnlyAdapterAuditSummarySchema.parse({
      id: 'codex_real_read_only_adapter_audit_summary_1',
      schemaVersion,
      createdAt,
      dryRunId: request.dryRunId,
      requestId: request.id,
      auditEventIds: ['audit_1'],
      beforeStartRequired: true,
      afterFinishRequired: true,
      abortRequired: true,
      failureRequired: true,
      eventCount: 1,
      summary: 'Audit summary requires before, after, abort, and failure events.',
      ...flagFields,
    });
    const result = CodexExecRealReadOnlyAdapterResultSchema.parse({
      id: 'codex_real_read_only_adapter_result_1',
      schemaVersion,
      createdAt,
      requestId: request.id,
      dryRunId: request.dryRunId,
      preflightId: preflight.id,
      status: 'blocked',
      boundaryPlanId: boundaryPlan.id,
      error,
      evidenceSummary,
      auditSummary,
      postRunVerificationRequired: true,
      workspaceMutationAllowed: false,
      unexpectedWorkspaceDiffCritical: true,
      autoRevertAllowed: false,
      summary: 'P1 result contract is non-executing metadata only.',
      ...flagFields,
    });

    expect(config.defaultEnabled).toBe(false);
    expect(request.dryRunId).toBe('codex_dry_run_1');
    expect(preflight.requestedSandboxMode).toBe('read_only');
    expect(result.executionDisabled).toBe(true);
    expect(result.implementationApproved).toBe(false);
    expect(result.processAdapterApproved).toBe(false);
    expect(result.recommendationGrantsExecution).toBe(false);
    expect(result.workspaceWriteAllowed).toBe(false);
    expect(result.dangerFullAccessAllowed).toBe(false);
    expect(result.dashboardTriggerAllowed).toBe(false);
    expect(result.promptBodyStored).toBe(false);
    expect(result.commandBodyStored).toBe(false);
    expect(result.stdoutBodyStored).toBe(false);
    expect(result.stderrBodyStored).toBe(false);
    const attemptRecord = CodexExecRealReadOnlyAdapterAttemptRecordSchema.parse({
      id: 'codex_real_read_only_adapter_attempt_1',
      schemaVersion,
      createdAt,
      dryRunId: request.dryRunId,
      requestId: request.id,
      preflightId: preflight.id,
      resultId: result.id,
      status: 'blocked',
      authoritative: true,
      supervisorBacked: true,
      persisted: true,
      degraded: false,
      notPersisted: false,
      processBoundaryInvoked: false,
      preflightStatus: preflight.status,
      resultStatus: result.status,
      resultErrorCode: error.code,
      failedCheckCodes: [],
      blockedCheckCodes: [],
      postRunVerificationStatus: 'not_required',
      workspaceMutationDetected: false,
      evidenceSummary,
      auditSummary,
      evidenceRefIds: ['evidence_1'],
      auditEventIds: ['audit_1'],
      outputHashCount: 0,
      metadataHash: 'sha256:attempt',
      summary: 'Authoritative blocked attempt record stores metadata only.',
      ...flagFields,
    });
    const attemptSummary = CodexExecRealReadOnlyAdapterAttemptSummarySchema.parse({
      id: 'codex_real_read_only_adapter_attempt_summary_1',
      schemaVersion,
      createdAt,
      attemptId: attemptRecord.id,
      dryRunId: request.dryRunId,
      status: attemptRecord.status,
      authoritative: true,
      supervisorBacked: true,
      persisted: true,
      degraded: false,
      notPersisted: false,
      processBoundaryInvoked: false,
      preflightStatus: attemptRecord.preflightStatus,
      resultStatus: attemptRecord.resultStatus,
      resultErrorCode: attemptRecord.resultErrorCode,
      failedCheckCodes: attemptRecord.failedCheckCodes,
      blockedCheckCodes: attemptRecord.blockedCheckCodes,
      postRunVerificationStatus: attemptRecord.postRunVerificationStatus,
      workspaceMutationDetected: attemptRecord.workspaceMutationDetected,
      evidenceRefCount: 1,
      auditEventCount: 1,
      outputHashCount: 0,
      metadataHash: attemptRecord.metadataHash,
      summary: 'Attempt summary is metadata only.',
      ...flagFields,
    });
    const attemptQuery = CodexExecRealReadOnlyAdapterAttemptQuerySchema.parse({
      id: 'codex_real_read_only_adapter_attempt_query_1',
      schemaVersion,
      createdAt,
      dryRunId: request.dryRunId,
      status: 'blocked',
      limit: 10,
      ...flagFields,
    });
    const attemptTimelineEntry = CodexExecRealReadOnlyAdapterAttemptTimelineEntrySchema.parse({
      id: 'codex_real_read_only_adapter_attempt_timeline_entry_1',
      schemaVersion,
      createdAt,
      attemptId: attemptRecord.id,
      dryRunId: request.dryRunId,
      status: attemptRecord.status,
      occurredAt: createdAt,
      processBoundaryInvoked: false,
      preflightStatus: attemptRecord.preflightStatus,
      resultStatus: attemptRecord.resultStatus,
      resultErrorCode: attemptRecord.resultErrorCode,
      failedCheckCodes: attemptRecord.failedCheckCodes,
      blockedCheckCodes: attemptRecord.blockedCheckCodes,
      postRunVerificationStatus: attemptRecord.postRunVerificationStatus,
      workspaceMutationDetected: attemptRecord.workspaceMutationDetected,
      evidenceRefIds: ['evidence_1'],
      auditEventIds: ['audit_1'],
      evidenceRefCount: 1,
      auditEventCount: 1,
      outputHashCount: 0,
      metadataHash: attemptRecord.metadataHash,
      summary: 'Timeline entry is read-only metadata only.',
      ...flagFields,
    });
    const attemptTimelineSummary = CodexExecRealReadOnlyAdapterAttemptTimelineSummarySchema.parse({
      id: 'codex_real_read_only_adapter_attempt_timeline_1',
      schemaVersion,
      createdAt,
      dryRunId: request.dryRunId,
      status: 'blocked',
      entries: [attemptTimelineEntry],
      eventCount: 1,
      evidenceRefCount: 1,
      auditEventCount: 1,
      outputHashCount: 0,
      processBoundaryInvokedCount: 0,
      includeEvidence: true,
      includeAudit: true,
      verificationSummary: 'Post-run verification is represented as metadata only.',
      workspaceMutationSummary: 'Workspace mutation remains forbidden.',
      recommendation: 'Timeline evidence is informational only.',
      summary: 'Attempt timeline stores counts, refs, hashes, and status only.',
      ...flagFields,
    });
    const attemptTimelineQuery = CodexExecRealReadOnlyAdapterAttemptTimelineQuerySchema.parse({
      id: 'codex_real_read_only_adapter_attempt_timeline_query_1',
      schemaVersion,
      createdAt,
      dryRunId: request.dryRunId,
      status: 'blocked',
      includeEvidence: true,
      includeAudit: true,
      limit: 10,
      ...flagFields,
    });

    expect(attemptRecord.status).toBe('blocked');
    expect(attemptRecord.executionDisabled).toBe(true);
    expect(attemptRecord.implementationApproved).toBe(false);
    expect(attemptRecord.processAdapterApproved).toBe(false);
    expect(attemptRecord.recommendationGrantsExecution).toBe(false);
    expect(attemptRecord.workspaceWriteAllowed).toBe(false);
    expect(attemptRecord.dangerFullAccessAllowed).toBe(false);
    expect(attemptRecord.dashboardTriggerAllowed).toBe(false);
    expect(attemptRecord.preflightStatus).toBe('passed');
    expect(attemptRecord.resultStatus).toBe('blocked');
    expect(attemptRecord.resultErrorCode).toBe('boundary_deferred');
    expect(attemptRecord.failedCheckCodes).toHaveLength(0);
    expect(attemptRecord.postRunVerificationStatus).toBe('not_required');
    expect(attemptRecord.workspaceMutationDetected).toBe(false);
    expect(attemptRecord.promptBodyStored).toBe(false);
    expect(attemptRecord.commandBodyStored).toBe(false);
    expect(attemptRecord.stdoutBodyStored).toBe(false);
    expect(attemptRecord.stderrBodyStored).toBe(false);
    expect(attemptRecord.degraded).toBe(false);
    expect(attemptRecord.notPersisted).toBe(false);
    expect(attemptSummary.attemptId).toBe(attemptRecord.id);
    expect(attemptQuery.status).toBe('blocked');
    expect(attemptTimelineEntry.attemptId).toBe(attemptRecord.id);
    expect(attemptTimelineSummary.eventCount).toBe(1);
    expect(attemptTimelineSummary.implementationApproved).toBe(false);
    expect(attemptTimelineSummary.processAdapterApproved).toBe(false);
    expect(attemptTimelineSummary.recommendationGrantsExecution).toBe(false);
    expect(attemptTimelineSummary.workspaceWriteAllowed).toBe(false);
    expect(attemptTimelineSummary.dangerFullAccessAllowed).toBe(false);
    expect(attemptTimelineSummary.dashboardTriggerAllowed).toBe(false);
    expect(attemptTimelineQuery.includeEvidence).toBe(true);
    expect(JSON.stringify(attemptRecord)).not.toContain('raw prompt body');
    expect(JSON.stringify(attemptRecord)).not.toContain('raw command body');
    expect(JSON.stringify(attemptRecord)).not.toContain('raw stdout body');
    expect(JSON.stringify(attemptRecord)).not.toContain('raw stderr body');
    expect(JSON.stringify(attemptRecord)).not.toContain('argv');
    expect(JSON.stringify(attemptRecord)).not.toContain('executablePath');
    expect(JSON.stringify(attemptRecord)).not.toContain('shellSnippet');
    expect(JSON.stringify(attemptRecord)).not.toContain('envPlan');
    expect(JSON.stringify(attemptTimelineSummary)).not.toContain('raw prompt body');
    expect(JSON.stringify(attemptTimelineSummary)).not.toContain('raw command body');
    expect(JSON.stringify(attemptTimelineSummary)).not.toContain('raw stdout body');
    expect(JSON.stringify(attemptTimelineSummary)).not.toContain('raw stderr body');
    expect(JSON.stringify(attemptTimelineSummary)).not.toContain('argv');
    expect(JSON.stringify(attemptTimelineSummary)).not.toContain('executablePath');
    expect(JSON.stringify(attemptTimelineSummary)).not.toContain('shellSnippet');
    expect(JSON.stringify(attemptTimelineSummary)).not.toContain('envPlan');
    expect('command' in boundaryPlan).toBe(false);
    expect('argv' in boundaryPlan).toBe(false);
    expect('executablePath' in boundaryPlan).toBe(false);
    expect('shellSnippet' in boundaryPlan).toBe(false);
    expect('envPlan' in boundaryPlan).toBe(false);
    expect(JSON.stringify(result)).not.toContain('raw prompt body');
    expect(JSON.stringify(result)).not.toContain('raw command body');
    expect(JSON.stringify(result)).not.toContain('raw stdout body');
    expect(JSON.stringify(result)).not.toContain('raw stderr body');

    expect(() =>
      CodexExecRealReadOnlyAdapterRequestSchema.parse({
        ...request,
        id: 'codex_real_read_only_adapter_request_invalid_sandbox',
        requestedSandboxMode: 'workspace_write',
      }),
    ).toThrow();
    expect(() =>
      CodexExecRealReadOnlyAdapterConfigSchema.parse({
        ...config,
        id: 'codex_real_read_only_adapter_config_invalid_dashboard_trigger',
        dashboardTriggerAllowed: true,
      }),
    ).toThrow();
    expect(() =>
      CodexExecRealReadOnlyAdapterRequestSchema.parse({
        ...request,
        id: 'codex_real_read_only_adapter_request_invalid_danger',
        dangerFullAccessAllowed: true,
      }),
    ).toThrow();
  });

  it('parses pilot prerequisite readiness models and blocks degraded ready states', () => {
    const flagFields = {
      processAdapterApproved: false,
      recommendationGrantsExecution: false,
      workspaceWriteAllowed: false,
      dangerFullAccessAllowed: false,
      metadataOnly: true,
      bodyStored: false,
      liveExecution: false,
      externalProcessStarted: false,
      executionDisabled: true,
      processAdapterStarted: false,
      implementationApproved: false,
      dashboardTriggerAllowed: false,
      promptBodyStored: false,
      commandBodyStored: false,
      stdoutBodyStored: false,
      stderrBodyStored: false,
      agentMessageBodyStored: false,
      reasoningBodyStored: false,
    } as const;
    const gate = CodexExecRealReadOnlyAdapterPilotPrerequisiteGateSchema.parse({
      id: 'codex_real_read_only_adapter_pilot_prerequisite_gate_1',
      schemaVersion,
      createdAt,
      code: 'authoritative_attempt_evidence',
      label: 'Authoritative attempt evidence',
      category: 'authority',
      status: 'blocked',
      required: true,
      summary: 'Persisted Supervisor-backed attempt evidence is required.',
      ...flagFields,
    });
    const blocker = CodexExecRealReadOnlyAdapterPilotPrerequisiteBlockerSchema.parse({
      id: 'codex_real_read_only_adapter_pilot_prerequisite_blocker_1',
      schemaVersion,
      createdAt,
      code: 'missing_authoritative_attempt_evidence',
      severity: 'high',
      relatedGateCode: gate.code,
      summary: 'No persisted authoritative attempt evidence is available.',
      recommendation: 'Create authoritative attempt evidence before pilot retry.',
      ...flagFields,
    });
    const finding = CodexExecRealReadOnlyAdapterPilotPrerequisiteFindingSchema.parse({
      id: 'codex_real_read_only_adapter_pilot_prerequisite_finding_1',
      schemaVersion,
      createdAt,
      code: 'handoff_context_incomplete',
      severity: 'medium',
      status: 'requires_review',
      summary: 'Handoff context is incomplete.',
      recommendation: 'Record operator handoff context before pilot retry.',
      ...flagFields,
    });
    const checklistItem = CodexExecRealReadOnlyAdapterPilotPrerequisiteChecklistItemSchema.parse({
      id: 'codex_real_read_only_adapter_pilot_prerequisite_check_1',
      schemaVersion,
      createdAt,
      code: 'config_explicitly_enabled',
      label: 'Config explicitly enabled',
      status: 'blocked',
      required: true,
      summary: 'Config is inspected only and remains disabled.',
      ...flagFields,
    });
    const record = CodexExecRealReadOnlyAdapterPilotPrerequisiteRecordSchema.parse({
      id: 'codex_real_read_only_adapter_pilot_prerequisite_1',
      schemaVersion,
      createdAt,
      dryRunId: 'codex_dry_run_1',
      status: 'blocked',
      recommendation: 'Pilot retry remains blocked until hard prerequisites are present.',
      gates: [gate],
      blockers: [blocker],
      findings: [finding],
      checklistItems: [checklistItem],
      hardGateCount: 1,
      passedGateCount: 0,
      blockedGateCount: 1,
      requiresReviewFindingCount: 1,
      missingPrerequisites: ['authoritative_attempt_evidence'],
      degraded: false,
      notPersisted: false,
      dryRunRecordPresent: true,
      configExplicitlyEnabled: false,
      validUnusedApprovalPresent: false,
      isolatedCleanWorktreeMetadataPresent: false,
      authoritativeSourcePreparationPresent: false,
      authoritativeAttemptEvidencePresent: false,
      evidenceAuditReady: false,
      fallbackUsedAsAuthority: false,
      pilotExecuted: false,
      adapterAttemptInvoked: false,
      authoritative: true,
      supervisorBacked: true,
      persisted: true,
      worktreeLabel: 'operator-provided-isolated-worktree',
      worktreeStatus: 'missing',
      worktreePathHash: 'sha256:worktree-path',
      evidenceRefs: [],
      auditEventIds: ['audit_pilot_prerequisite_1'],
      summary: 'Pilot prerequisite record stores status, counts, hashes, and refs only.',
      ...flagFields,
    });
    const summary = CodexExecRealReadOnlyAdapterPilotPrerequisiteSummarySchema.parse({
      id: 'codex_real_read_only_adapter_pilot_prerequisite_summary_1',
      schemaVersion,
      createdAt,
      recordId: record.id,
      dryRunId: record.dryRunId,
      status: record.status,
      hardGateCount: record.hardGateCount,
      passedGateCount: record.passedGateCount,
      blockedGateCount: record.blockedGateCount,
      requiresReviewFindingCount: record.requiresReviewFindingCount,
      missingPrerequisites: record.missingPrerequisites,
      degraded: record.degraded,
      notPersisted: record.notPersisted,
      dryRunRecordPresent: record.dryRunRecordPresent,
      configExplicitlyEnabled: record.configExplicitlyEnabled,
      validUnusedApprovalPresent: record.validUnusedApprovalPresent,
      isolatedCleanWorktreeMetadataPresent: record.isolatedCleanWorktreeMetadataPresent,
      authoritativeSourcePreparationPresent: record.authoritativeSourcePreparationPresent,
      authoritativeAttemptEvidencePresent: record.authoritativeAttemptEvidencePresent,
      evidenceAuditReady: record.evidenceAuditReady,
      fallbackUsedAsAuthority: false,
      pilotExecuted: false,
      adapterAttemptInvoked: false,
      recommendation: record.recommendation,
      summary: 'Pilot prerequisite summary stores metadata only.',
      ...flagFields,
    });
    const query = CodexExecRealReadOnlyAdapterPilotPrerequisiteQuerySchema.parse({
      id: 'codex_real_read_only_adapter_pilot_prerequisite_query_1',
      schemaVersion,
      createdAt,
      dryRunId: record.dryRunId,
      status: 'blocked',
      limit: 10,
      ...flagFields,
    });

    expect(record.status).toBe('blocked');
    expect(record.pilotExecuted).toBe(false);
    expect(record.adapterAttemptInvoked).toBe(false);
    expect(record.fallbackUsedAsAuthority).toBe(false);
    expect(summary.status).toBe('blocked');
    expect(query.status).toBe('blocked');
    expect(JSON.stringify(record)).not.toContain('C:/');
    expect(JSON.stringify(record)).not.toContain('raw prompt body');
    expect(JSON.stringify(record)).not.toContain('raw command body');
    expect(JSON.stringify(record)).not.toContain('raw stdout body');
    expect(JSON.stringify(record)).not.toContain('raw stderr body');
    expect(JSON.stringify(record)).not.toContain('"argv"');
    expect(JSON.stringify(record)).not.toContain('"executablePath":');
    expect(() =>
      CodexExecRealReadOnlyAdapterPilotPrerequisiteRecordSchema.parse({
        ...record,
        id: 'codex_real_read_only_adapter_pilot_prerequisite_invalid_ready',
        status: 'ready_for_pilot_retry',
        degraded: true,
      }),
    ).toThrow();
  });

  it('parses pilot prerequisite source preparation models and blocks degraded prepared states', () => {
    const createdAt = '2026-04-30T00:00:00.000Z';
    const flagFields = {
      workspaceWriteAllowed: false,
      dangerFullAccessAllowed: false,
      metadataOnly: true,
      bodyStored: false,
      liveExecution: false,
      externalProcessStarted: false,
      executionDisabled: true,
      processAdapterStarted: false,
      processAdapterApproved: false,
      implementationApproved: false,
      recommendationGrantsExecution: false,
      dashboardTriggerAllowed: false,
      promptBodyStored: false,
      commandBodyStored: false,
      stdoutBodyStored: false,
      stderrBodyStored: false,
      agentMessageBodyStored: false,
      reasoningBodyStored: false,
    } as const;
    const gate = CodexExecRealReadOnlyAdapterPilotSourcePreparationGateSchema.parse({
      id: 'codex_real_read_only_adapter_pilot_source_preparation_gate_1',
      schemaVersion,
      createdAt,
      code: 'isolated_clean_worktree_metadata',
      label: 'Isolated clean worktree metadata',
      category: 'worktree',
      status: 'blocked',
      required: true,
      summary: 'Existing isolated worktree metadata is required.',
      ...flagFields,
    });
    const blocker = CodexExecRealReadOnlyAdapterPilotSourcePreparationBlockerSchema.parse({
      id: 'codex_real_read_only_adapter_pilot_source_preparation_blocker_1',
      schemaVersion,
      createdAt,
      code: gate.code,
      severity: 'high',
      relatedGateCode: gate.code,
      summary: 'No isolated clean worktree metadata is present.',
      recommendation: 'Record worktree label/hash/status before 4F.2.',
      ...flagFields,
    });
    const finding = CodexExecRealReadOnlyAdapterPilotSourcePreparationFindingSchema.parse({
      id: 'codex_real_read_only_adapter_pilot_source_preparation_finding_1',
      schemaVersion,
      createdAt,
      code: 'handoff_context_incomplete',
      severity: 'medium',
      status: 'requires_review',
      summary: 'Operator handoff context needs review.',
      recommendation: 'Record handoff context before 4F.2.',
      ...flagFields,
    });
    const checklistItem =
      CodexExecRealReadOnlyAdapterPilotSourcePreparationChecklistItemSchema.parse({
        id: 'codex_real_read_only_adapter_pilot_source_preparation_check_1',
        schemaVersion,
        createdAt,
        code: gate.code,
        label: gate.label,
        status: gate.status,
        required: true,
        summary: gate.summary,
        ...flagFields,
      });
    const record = CodexExecRealReadOnlyAdapterPilotSourcePreparationRecordSchema.parse({
      id: 'codex_real_read_only_adapter_pilot_source_preparation_1',
      schemaVersion,
      createdAt,
      dryRunId: 'codex_dry_run_1',
      status: 'blocked',
      recommendation: 'Source preparation remains blocked.',
      gates: [gate],
      blockers: [blocker],
      findings: [finding],
      checklistItems: [checklistItem],
      hardGateCount: 1,
      passedGateCount: 0,
      blockedGateCount: 1,
      requiresReviewFindingCount: 1,
      missingSources: ['isolated_clean_worktree_metadata'],
      degraded: false,
      notPersisted: false,
      dryRunRecordPresent: true,
      configExplicitlyEnabled: true,
      validUnusedApprovalPresent: true,
      approvalArtifactId: 'codex_approval_artifact_1',
      approvalArtifactHash: 'sha256:approval',
      dryRunPlanHash: 'sha256:dry-run',
      policyDecisionHash: 'sha256:policy',
      isolatedCleanWorktreeMetadataPresent: false,
      worktreeLabel: 'operator-isolated-worktree',
      worktreeStatus: 'missing',
      worktreePathHash: 'sha256:worktree',
      evidenceAuditReady: true,
      fallbackUsedAsAuthority: false,
      pilotExecuted: false,
      adapterAttemptInvoked: false,
      authoritative: true,
      supervisorBacked: true,
      persisted: true,
      evidenceRefs: [],
      auditEventIds: ['audit_source_preparation_1'],
      summary: 'Source preparation stores metadata only.',
      ...flagFields,
    });
    const summary = CodexExecRealReadOnlyAdapterPilotSourcePreparationSummarySchema.parse({
      id: 'codex_real_read_only_adapter_pilot_source_preparation_summary_1',
      schemaVersion,
      createdAt,
      recordId: record.id,
      dryRunId: record.dryRunId,
      status: record.status,
      hardGateCount: record.hardGateCount,
      passedGateCount: record.passedGateCount,
      blockedGateCount: record.blockedGateCount,
      requiresReviewFindingCount: record.requiresReviewFindingCount,
      missingSources: record.missingSources,
      degraded: record.degraded,
      notPersisted: record.notPersisted,
      dryRunRecordPresent: record.dryRunRecordPresent,
      configExplicitlyEnabled: record.configExplicitlyEnabled,
      validUnusedApprovalPresent: record.validUnusedApprovalPresent,
      isolatedCleanWorktreeMetadataPresent: record.isolatedCleanWorktreeMetadataPresent,
      evidenceAuditReady: record.evidenceAuditReady,
      fallbackUsedAsAuthority: false,
      pilotExecuted: false,
      adapterAttemptInvoked: false,
      recommendation: record.recommendation,
      summary: 'Source preparation summary stores metadata only.',
      ...flagFields,
    });
    const query = CodexExecRealReadOnlyAdapterPilotSourcePreparationQuerySchema.parse({
      id: 'codex_real_read_only_adapter_pilot_source_preparation_query_1',
      schemaVersion,
      createdAt,
      dryRunId: record.dryRunId,
      status: 'blocked',
      limit: 10,
      ...flagFields,
    });

    expect(record.status).toBe('blocked');
    expect(summary.status).toBe('blocked');
    expect(query.status).toBe('blocked');
    expect(record.pilotExecuted).toBe(false);
    expect(record.adapterAttemptInvoked).toBe(false);
    expect(JSON.stringify(record)).not.toContain('C:/');
    expect(JSON.stringify(record)).not.toContain('raw prompt body');
    expect(JSON.stringify(record)).not.toContain('"argv"');
    expect(JSON.stringify(record)).not.toContain('"executablePath":');
    expect(() =>
      CodexExecRealReadOnlyAdapterPilotSourcePreparationRecordSchema.parse({
        ...record,
        id: 'codex_real_read_only_adapter_pilot_source_preparation_invalid_prepared',
        status: 'prepared',
        degraded: true,
      }),
    ).toThrow();
  });
});

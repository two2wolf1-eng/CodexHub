import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  createCodexExecDisabledLiveRunRecord,
  createCodexExecDryRunPlan,
  createCodexExecExecutionIntent,
  createCodexExecApprovalArtifact,
  createCodexExecApprovalArtifactFromDecision,
  createCodexExecApprovalTransitionResult,
  createCodexExecControlPlaneAuditEvents,
  createCodexExecControlPlaneEvidenceRefs,
  createCodexExecControlPlaneTimeline,
  createCodexExecLiveAdapterAdrDecisionAuditEvents,
  createCodexExecLiveAdapterAdrDecisionEvidenceRefs,
  createCodexExecLiveAdapterAdrDecisionRecord,
  createDefaultReadOnlyAdapterOperatorChecklist,
  createReadOnlyAdapterPreflightSimulationAuditEvents,
  createReadOnlyAdapterPreflightSimulationEvidenceRefs,
  classifyReadOnlyAdapterSimulatorGateChecks,
  createReadOnlyAdapterSimulatorReviewAuditEvents,
  createReadOnlyAdapterSimulatorReviewDecisionRecord,
  createReadOnlyAdapterSimulatorReviewEvidenceRefs,
  createDefaultReadOnlyAdapterImplementationPlanReviewChecklist,
  createReadOnlyAdapterImplementationPlanReviewAuditEvents,
  createReadOnlyAdapterImplementationPlanReviewDecisionRecord,
  createReadOnlyAdapterImplementationPlanReviewEvidenceRefs,
  createReadOnlyAdapterSkeletonPreview,
  createReadOnlyAdapterSkeletonReviewDecisionRecord,
  summarizeReadOnlyAdapterSkeletonReview,
  runReadOnlyAdapterFixtureBoundary,
  summarizeReadOnlyAdapterFixtureBoundary,
  createReadOnlyAdapterFinalReadinessDecisionRecord,
  summarizeReadOnlyAdapterFinalReadiness,
  buildRealReadOnlyAdapterReadinessPackage,
  createRealReadOnlyAdapterReadinessAuditEvents,
  createRealReadOnlyAdapterReadinessEvidenceRefs,
  createRealReadOnlyAdapterReadinessReviewAuditEvents,
  createRealReadOnlyAdapterReadinessReviewDecisionRecord,
  createRealReadOnlyAdapterReadinessReviewEvidenceRefs,
  getLatestRealReadOnlyAdapterReadinessReview,
  listRealReadOnlyAdapterReadinessReviewSummaries,
  summarizeRealReadOnlyAdapterReadinessPackage,
  summarizeRealReadOnlyAdapterReadinessReview,
  validateRealReadOnlyAdapterReadinessReviewDecision,
  createDefaultRealReadOnlyAdapterConfig,
  createDisabledRealReadOnlyAdapter,
  createDisabledRealReadOnlyAdapterResult,
  createRealReadOnlyAdapterGuardPreflight,
  createRealReadOnlyAdapterRequest,
  createCodexExecTimelineDetailView,
  createDefaultCodexExecLiveConfig,
  createDefaultCodexExecConfigLoadResult,
  buildControlPlaneDrilldownView,
  buildCodexExecControlPlaneReport,
  buildCodexExecAdrReadinessChecklist,
  buildCodexExecGovernanceReviewPackage,
  buildCodexExecLiveAdapterAdrDraft,
  buildCodexExecNoLiveEvidenceSummary,
  buildCodexExecReportReviewHistory,
  buildCodexExecReviewerHandoffSummary,
  classifyCodexExecGovernanceRisk,
  classifyCodexExecReportRisk,
  compareCodexExecReportReviews,
  createCodexExecReportReviewDraft,
  createCodexExecReportReviewRecord,
  createCodexExecManualApprovalDecision,
  createCodexExecManualApprovalRecord,
  createCodexExecManualApprovalRequest,
  evaluateCodexExecReportReviewChecklist,
  evaluateCodexExecDryRunPolicy,
  evaluateCodexExecExecutionGate,
  evaluateCodexExecManualApprovalState,
  getAuditDetail,
  getEvidenceDetail,
  getLatestCodexExecReportReview,
  getLatestCodexExecLiveAdapterAdrDecision,
  listCodexExecLiveAdapterAdrDecisionSummaries,
  normalizeCodexExecEvent,
  parseCodexExecJsonl,
  parseCodexExecJsonlLine,
  parseCodexExecLiveConfigFile,
  createCodexReplayRecord,
  replayCodexExecFixture,
  runCodexExecPreflight,
  searchAuditEvents,
  searchEvidence,
  renderCodexExecControlPlaneReportJson,
  renderCodexExecControlPlaneReportMarkdown,
  renderCodexExecLiveAdapterAdrDraftJson,
  renderCodexExecLiveAdapterAdrDraftMarkdown,
  summarizeCodexExecGovernanceReviewPackage,
  summarizeCodexExecLiveAdapterAdrDraft,
  summarizeReadOnlyAdapterPreflightSimulation,
  summarizeReadOnlyAdapterImplementationPlanReview,
  summarizeReadOnlyAdapterSimulatorReview,
  getLatestReadOnlyAdapterImplementationPlanReview,
  listReadOnlyAdapterImplementationPlanReviewSummaries,
  summarizeCodexExecReportReview,
  listCodexExecReportReviewSummaries,
  summarizeCodexExecReplay,
  simulateReadOnlyAdapterPreflight,
  getLatestReadOnlyAdapterSimulatorReview,
  listReadOnlyAdapterSimulatorReviewSummaries,
} from './index';

describe('codex-kernel fixture replay parser', () => {
  it('parses valid JSONL lines', () => {
    const parsed = parseCodexExecJsonl('{"type":"thread.started","thread_id":"thread_1"}\n\n');

    expect(parsed).toHaveLength(1);
    expect(parsed[0]?.rawEvent?.type).toBe('thread.started');
  });

  it('keeps malformed JSONL lines as parse error events', () => {
    const parsed = parseCodexExecJsonlLine('{"type":', 7);

    expect(parsed.parseErrorEvent?.normalizedType).toBe('parse_error');
    expect(parsed.parseErrorEvent?.summary).toBe('Malformed JSONL at line 7');
  });

  it('normalizes unknown event types safely', () => {
    const event = normalizeCodexExecEvent({
      type: 'future.event',
      payload: { value: 'synthetic unknown payload' },
    });

    expect(event.normalizedType).toBe('unknown');
    expect(event.rawEventType).toBe('future.event');
    expect(event.summary).toBe('Unknown Codex event type: future.event');
    expect(event.payloadHash).toMatch(/^sha256:/);
  });

  it('summarizes command execution items without storing full body fields', () => {
    const event = normalizeCodexExecEvent({
      type: 'item.completed',
      item: {
        id: 'item_command',
        type: 'command_execution',
        command: 'synthetic command body',
        stdout: 'synthetic output body',
        exit_code: 0,
      },
    });

    expect(event.itemType).toBe('command_execution');
    expect(event.item?.itemType).toBe('command_execution');

    if (event.item?.itemType === 'command_execution') {
      expect(event.item.command.summary).toBe('command text (22 chars)');
      expect(event.item.output?.summary).toBe('command output (21 chars)');
      expect(JSON.stringify(event.item)).not.toContain('synthetic command body');
      expect(JSON.stringify(event.item)).not.toContain('synthetic output body');
    }
  });

  it('replays the basic fixture and creates evidence plus audit events', async () => {
    const fixture = readFixture('codex-exec-basic.jsonl');
    const result = await replayCodexExecFixture(fixture);
    const summary = summarizeCodexExecReplay(
      result,
      'packages/codex-kernel/fixtures/codex-exec-basic.jsonl',
    );
    const record = createCodexReplayRecord(
      result,
      'packages/codex-kernel/fixtures/codex-exec-basic.jsonl',
    );

    expect(result.threadId).toBe('thread_fixture_basic');
    expect(summary.status).toBe('completed');
    expect(summary.commandExecutionCount).toBe(1);
    expect(summary.fileChangeCount).toBe(1);
    expect(summary.mcpToolCallCount).toBe(1);
    expect(summary.webSearchCount).toBe(1);
    expect(result.evidenceRefs.length).toBe(result.eventCount + 1);
    expect(result.evidenceRefs[0]?.kind).toBe('codex.exec.jsonl.replay');
    expect(result.auditEvents.map((event) => event.action)).toContain(
      'codex.exec.fixture_replay.completed',
    );
    expect(result.auditEvents.every((event) => event.metadata?.liveExecution === false)).toBe(true);
    expect(record.storageMetadata.bodyStored).toBe(false);
    expect(record.storageMetadata.normalizedEventsStored).toBe(false);
    expect(JSON.stringify(record)).not.toContain('synthetic stdout summary only');
    expect(JSON.stringify(record)).not.toContain('Synthetic agent response for fixture replay.');
  });

  it('replays the error fixture as failed without throwing', async () => {
    const fixture = readFixture('codex-exec-error.jsonl');
    const result = await replayCodexExecFixture(fixture);

    expect(result.finalStatus).toBe('failed');
    expect(result.errorCount).toBeGreaterThan(0);
    expect(result.auditEvents.map((event) => event.action)).toContain(
      'codex.exec.fixture_replay.failed',
    );
  });
});

describe('codex-kernel live control-plane skeleton', () => {
  it('creates a dry-run plan without storing prompt body', () => {
    const intent = createCodexExecExecutionIntent({
      title: 'Summarize repository structure',
      prompt: 'Summarize the repository structure and list risk areas',
      cwd: '.',
    });
    const plan = createCodexExecDryRunPlan(intent);

    expect(plan.riskLevel).toBe('medium');
    expect(plan.promptSummary).toContain('Summarize');
    expect(plan.promptHash).toMatch(/^sha256:/);
    expect(plan.promptBodyStored).toBe(false);
    expect(JSON.stringify(plan)).not.toContain('list risk areas');
  });

  it('maps sandbox modes to conservative risk levels', () => {
    const workspacePlan = createCodexExecDryRunPlan(
      createCodexExecExecutionIntent({
        title: 'Workspace write preview',
        prompt: 'Preview a workspace change',
        sandboxMode: 'workspace_write',
      }),
    );
    const dangerPlan = createCodexExecDryRunPlan(
      createCodexExecExecutionIntent({
        title: 'Full access preview',
        prompt: 'Preview a full access run',
        sandboxMode: 'danger_full_access',
      }),
    );

    expect(workspacePlan.riskLevel).toBe('high');
    expect(dangerPlan.riskLevel).toBe('critical');
  });

  it('creates evidence and audit metadata with live execution disabled', () => {
    const plan = createCodexExecDryRunPlan(
      createCodexExecExecutionIntent({
        title: 'Summarize repository structure',
        prompt: 'Summarize the repository structure and list risk areas',
      }),
    );
    const policyDecision = evaluateCodexExecDryRunPolicy(plan, {
      evaluateAction: (input) => ({
        id: 'policy_test',
        schemaVersion: '2026-04-28.foundation',
        createdAt: '2026-04-28T00:00:00.000Z',
        actionId: input.actionId,
        actionType: input.actionType,
        actionMode: input.actionMode,
        riskLevel: input.riskLevel ?? 'medium',
        outcome: 'deny',
        reasons: ['disabled'],
        requiresDryRun: true,
        requiresApproval: true,
        metadata: input.metadata,
      }),
    });
    const record = createCodexExecDisabledLiveRunRecord(plan, policyDecision, 'disabled for test');

    expect(record.status).toBe('blocked');
    expect(record.evidenceRefs.map((ref) => ref.kind)).toEqual([
      'codex.exec.dry_run_plan',
      'codex.exec.command_preview',
      'codex.exec.policy_decision',
    ]);
    expect(record.auditEvents.map((event) => event.action)).toContain(
      'codex.exec.live_execution.blocked',
    );
    expect(record.auditEvents.every((event) => event.metadata?.liveExecution === false)).toBe(true);
    expect(
      record.auditEvents.every((event) => event.metadata?.externalProcessStarted === false),
    ).toBe(true);
    expect(record.auditEvents.every((event) => event.metadata?.executionDisabled === true)).toBe(
      true,
    );
    expect(JSON.stringify(record)).not.toContain('list risk areas');
  });

  it('does not import external process modules', () => {
    const source = readFileSync('src/index.ts', 'utf8');

    expect(source).not.toContain(['node:', 'child', '_process'].join(''));
    expect(source).not.toContain(['child', '_process'].join(''));
  });

  it('blocks execution with the default live config', () => {
    const { plan, policyDecision } = createControlPlaneFixture();
    const config = createDefaultCodexExecLiveConfig();
    const artifact = createCodexExecApprovalArtifact(plan, policyDecision);
    const preflight = runCodexExecPreflight(plan, config);
    const gate = evaluateCodexExecExecutionGate(plan, policyDecision, artifact, config);

    expect(config.liveEnabled).toBe(false);
    expect(config.allowedSandboxModes).toEqual(['read_only']);
    expect(preflight.status).toBe('blocked');
    expect(gate.status).toBe('blocked');
    expect(gate.reasons.join(' ')).toContain('disabled');
    expect(gate.liveExecution).toBe(false);
    expect(gate.externalProcessStarted).toBe(false);
  });

  it('loads disabled config file metadata without storing file body', () => {
    const result = parseCodexExecLiveConfigFile({
      configPath: '.codexhub/codex-exec.yaml',
      fileText: [
        'liveEnabled: false',
        'allowedSandboxModes:',
        '  - read_only',
        'forbiddenSandboxModes:',
        '  - workspace_write',
        '  - danger_full_access',
        'requiresApproval: true',
        'requiresIsolatedWorktreeForWorkspaceWrite: true',
        'approvalTtlMinutes: 20',
        'singleUseApprovals: true',
      ].join('\n'),
    });
    const defaultResult = createDefaultCodexExecConfigLoadResult();

    expect(result.status).toBe('loaded');
    expect(result.config.liveEnabled).toBe(false);
    expect(result.config.configSource).toBe('file');
    expect(result.config.configBodyStored).toBe(false);
    expect(result.configFile?.bodyStored).toBe(false);
    expect(result.configFile?.configHash).toMatch(/^sha256:/);
    expect(defaultResult.status).toBe('defaulted');
    expect(JSON.stringify(result)).not.toContain('liveEnabled: false');
  });

  it('creates manual approval request, decision, record, evidence, and audit safely', () => {
    const { plan, policyDecision } = createControlPlaneFixture();
    const config = createDefaultCodexExecLiveConfig();
    const request = createCodexExecManualApprovalRequest(plan, policyDecision, config, {
      requestedBy: 'local-human',
      reason: 'Review disabled control-plane run',
    });
    const decision = createCodexExecManualApprovalDecision(request, {
      outcome: 'approved',
      decidedBy: 'local-human',
      reason: 'Approved for disabled gate evaluation',
    });
    const artifact = createCodexExecApprovalArtifactFromDecision(
      plan,
      policyDecision,
      request,
      decision,
    );
    const pendingRecord = createCodexExecManualApprovalRecord({ request });
    const transition = createCodexExecApprovalTransitionResult(pendingRecord, 'approve');
    const state = evaluateCodexExecManualApprovalState(pendingRecord);
    const evidenceRefs = createCodexExecControlPlaneEvidenceRefs({
      approvalRequest: request,
      approvalDecision: decision,
      approvalState: state,
      approvalTransition: transition,
      approvalArtifact: artifact,
    });
    const auditEvents = createCodexExecControlPlaneAuditEvents({
      approvalRequest: request,
      approvalDecision: decision,
      approvalState: state,
      approvalTransition: transition,
      approvalArtifact: artifact,
      evidenceRefs,
    });
    const record = createCodexExecManualApprovalRecord({
      request,
      decision,
      approvalArtifact: artifact,
      evidenceRefs,
      auditEvents,
    });
    const gate = evaluateCodexExecExecutionGate(plan, policyDecision, artifact, config);

    expect(request.status).toBe('pending');
    expect(decision.approved).toBe(true);
    expect(state.canDecide).toBe(true);
    expect(transition.allowed).toBe(true);
    expect(artifact?.status).toBe('approved');
    expect(record.status).toBe('approved');
    expect(record.approvalState?.status).toBe('approved');
    expect(evidenceRefs.map((ref) => ref.kind)).toContain('codex.exec.approval_request');
    expect(evidenceRefs.map((ref) => ref.kind)).toContain('codex.exec.approval_decision');
    expect(evidenceRefs.map((ref) => ref.kind)).toContain('codex.exec.approval_state');
    expect(auditEvents.map((event) => event.action)).toContain(
      'codex.exec.manual_approval.requested',
    );
    expect(auditEvents.map((event) => event.action)).toContain(
      'codex.exec.manual_approval.decided',
    );
    expect(auditEvents.map((event) => event.action)).toContain(
      'codex.exec.manual_approval.transition_allowed',
    );
    expect(gate.status).toBe('blocked');
    expect(gate.reasons.join(' ')).toContain('disabled');
    expect(JSON.stringify(record)).not.toContain('Approved for disabled gate evaluation');
  });

  it('blocks manual approval transitions for expired requests and terminal records', () => {
    const { plan, policyDecision } = createControlPlaneFixture();
    const expiredRequest = createCodexExecManualApprovalRequest(
      plan,
      policyDecision,
      createDefaultCodexExecLiveConfig(),
      {
        expiresAt: '2020-01-01T00:00:00.000Z',
      },
    );
    const expiredRecord = createCodexExecManualApprovalRecord({ request: expiredRequest });
    const expiredState = evaluateCodexExecManualApprovalState(expiredRecord);
    const expiredTransition = createCodexExecApprovalTransitionResult(expiredRecord, 'approve');
    const deniedRequest = createCodexExecManualApprovalRequest(plan, policyDecision);
    const deniedDecision = createCodexExecManualApprovalDecision(deniedRequest, {
      outcome: 'denied',
    });
    const deniedRecord = createCodexExecManualApprovalRecord({
      request: deniedRequest,
      decision: deniedDecision,
    });
    const deniedTransition = createCodexExecApprovalTransitionResult(deniedRecord, 'approve');

    expect(expiredState.status).toBe('expired');
    expect(expiredState.canDecide).toBe(false);
    expect(expiredTransition.allowed).toBe(false);
    expect(expiredTransition.reasons.join(' ')).toContain('expired');
    expect(deniedRecord.approvalState?.terminal).toBe(true);
    expect(deniedTransition.allowed).toBe(false);
  });

  it('blocks approval artifact hash mismatch', () => {
    const { plan, policyDecision } = createControlPlaneFixture({ liveAdapterEnabled: true });
    const config = {
      ...createDefaultCodexExecLiveConfig(),
      liveEnabled: true,
      allowedSandboxModes: ['read_only' as const],
    };
    const artifact = {
      ...createCodexExecApprovalArtifact(plan, policyDecision),
      dryRunPlanHash: 'sha256:mismatch',
    };
    const gate = evaluateCodexExecExecutionGate(plan, policyDecision, artifact, config);

    expect(gate.status).toBe('blocked');
    expect(gate.reasons.join(' ')).toContain('hash mismatch');
  });

  it('blocks expired, revoked, or used approvals', () => {
    const { plan, policyDecision } = createControlPlaneFixture({ liveAdapterEnabled: true });
    const config = {
      ...createDefaultCodexExecLiveConfig(),
      liveEnabled: true,
      allowedSandboxModes: ['read_only' as const],
    };
    const artifact = createCodexExecApprovalArtifact(plan, policyDecision);
    const expired = evaluateCodexExecExecutionGate(
      plan,
      policyDecision,
      { ...artifact, expiresAt: '2020-01-01T00:00:00.000Z' },
      config,
    );
    const revoked = evaluateCodexExecExecutionGate(
      plan,
      policyDecision,
      { ...artifact, revoked: true, status: 'revoked' },
      config,
    );
    const used = evaluateCodexExecExecutionGate(
      plan,
      policyDecision,
      { ...artifact, status: 'used', usedAt: '2026-04-28T00:00:00.000Z' },
      config,
    );

    expect(expired.reasons.join(' ')).toContain('expired');
    expect(revoked.reasons.join(' ')).toContain('revoked');
    expect(used.reasons.join(' ')).toContain('already used');
  });

  it('blocks workspace writes without an isolated worktree', () => {
    const { plan, policyDecision } = createControlPlaneFixture({
      sandboxMode: 'workspace_write',
      liveAdapterEnabled: true,
    });
    const config = {
      ...createDefaultCodexExecLiveConfig(),
      liveEnabled: true,
      allowedSandboxModes: ['read_only' as const, 'workspace_write' as const],
    };
    const artifact = createCodexExecApprovalArtifact(plan, policyDecision);
    const preflight = runCodexExecPreflight(plan, config);
    const gate = evaluateCodexExecExecutionGate(plan, policyDecision, artifact, config);

    expect(preflight.status).toBe('blocked');
    expect(preflight.worktreeRequirement.status).toBe('missing');
    expect(gate.status).toBe('blocked');
    expect(gate.reasons.join(' ')).toContain('isolated worktree');
  });

  it('keeps full access blocked by default', () => {
    const { plan, policyDecision } = createControlPlaneFixture({
      sandboxMode: 'danger_full_access',
      liveAdapterEnabled: true,
    });
    const config = {
      ...createDefaultCodexExecLiveConfig(),
      liveEnabled: true,
      allowedSandboxModes: ['read_only' as const, 'danger_full_access' as const],
    };
    const artifact = createCodexExecApprovalArtifact(plan, policyDecision);
    const gate = evaluateCodexExecExecutionGate(plan, policyDecision, artifact, config);

    expect(plan.riskLevel).toBe('critical');
    expect(gate.status).toBe('blocked');
    expect(gate.reasons.join(' ')).toContain('danger_full_access');
  });

  it('creates an ordered read-only control-plane timeline', () => {
    const { record, approvalRecord } = createFullTimelineFixture();
    const timeline = createCodexExecControlPlaneTimeline({
      record,
      approvalRecords: [approvalRecord],
    });
    const eventTypes = timeline.events.map((event) => event.eventType);

    expect(timeline.status).toBe('gate_blocked');
    expect(eventTypes.indexOf('codex.exec.dry_run.created')).toBeLessThan(
      eventTypes.indexOf('codex.exec.policy.evaluated'),
    );
    expect(eventTypes).toContain('codex.exec.approval.state_evaluated');
    expect(eventTypes).toContain('codex.exec.gate.evaluated');
    expect(timeline.liveExecution).toBe(false);
    expect(timeline.externalProcessStarted).toBe(false);
    expect(timeline.executionDisabled).toBe(true);
    expect(timeline.events.every((event) => event.liveExecution === false)).toBe(true);
    expect(timeline.events.every((event) => event.externalProcessStarted === false)).toBe(true);
    expect(timeline.events.every((event) => event.executionDisabled === true)).toBe(true);
  });

  it('filters control-plane timeline events by source, status, and evidence/audit toggles', () => {
    const { record, approvalRecord } = createFullTimelineFixture();
    const approvalTimeline = createCodexExecControlPlaneTimeline({
      record,
      approvalRecords: [approvalRecord],
      filter: {
        source: 'approval',
        includeEvidence: false,
        includeAudit: false,
      },
    });
    const blockedTimeline = createCodexExecControlPlaneTimeline({
      record,
      approvalRecords: [approvalRecord],
      filter: {
        status: 'blocked',
        includeEvidence: false,
        includeAudit: false,
      },
    });

    expect(approvalTimeline.events).toHaveLength(4);
    expect(approvalTimeline.events.every((event) => event.sourceKind.startsWith('approval_'))).toBe(
      true,
    );
    expect(blockedTimeline.events.every((event) => event.status === 'blocked')).toBe(true);
    expect(blockedTimeline.events.some((event) => event.sourceKind === 'evidence')).toBe(false);
    expect(blockedTimeline.events.some((event) => event.sourceKind === 'audit')).toBe(false);
  });

  it('creates metadata-only timeline detail summaries', () => {
    const { record, approvalRecord } = createFullTimelineFixture();
    const detail = createCodexExecTimelineDetailView({
      record,
      approvalRecords: [approvalRecord],
      filter: { includeEvidence: true, includeAudit: true },
    });

    expect(detail.latestGateStatus).toBe('blocked');
    expect(detail.approvalStatus).toBe('approved');
    expect(detail.evidenceSummary.metadataOnly).toBe(true);
    expect(detail.evidenceSummary.bodyStored).toBe(false);
    expect(detail.auditSummary.metadataOnly).toBe(true);
    expect(detail.auditSummary.bodyStored).toBe(false);
    expect(detail.liveExecution).toBe(false);
    expect(detail.externalProcessStarted).toBe(false);
    expect(detail.executionDisabled).toBe(true);
    expect(JSON.stringify(detail)).not.toContain('Summarize repository structure and list');
    expect(JSON.stringify(detail)).not.toContain('disabled for timeline test');
  });

  it('creates evidence and audit details without exposing stored body fields', () => {
    const { record } = createFullTimelineFixture();
    const evidenceDetail = getEvidenceDetail({
      evidenceRefId: record.evidenceRefs[0]?.id ?? 'missing',
      records: [record],
    });
    const auditDetail = getAuditDetail({
      auditEventId: record.auditEvents[0]?.id ?? 'missing',
      records: [record],
    });

    expect(evidenceDetail).toMatchObject({
      status: 'found',
      dryRunId: record.dryRunPlanId,
      liveRunRecordId: record.id,
      metadataOnly: true,
      bodyStored: false,
      liveExecution: false,
      externalProcessStarted: false,
      executionDisabled: true,
    });
    expect(auditDetail).toMatchObject({
      status: 'found',
      dryRunId: record.dryRunPlanId,
      liveRunRecordId: record.id,
      metadataOnly: true,
      bodyStored: false,
      liveExecution: false,
      externalProcessStarted: false,
      executionDisabled: true,
    });
    expect(JSON.stringify(evidenceDetail)).not.toContain('disabled for timeline test');
    expect(JSON.stringify(auditDetail)).not.toContain('disabled for timeline test');
  });

  it('searches evidence and audit events by dry-run and kind or action', () => {
    const { record } = createFullTimelineFixture();
    const evidenceSearch = searchEvidence({
      query: {
        dryRunId: record.dryRunPlanId,
        kind: 'codex.exec.dry_run_plan',
      },
      records: [record],
    });
    const auditSearch = searchAuditEvents({
      query: {
        dryRunId: record.dryRunPlanId,
        action: 'codex.exec.policy_evaluated',
      },
      records: [record],
    });

    expect(evidenceSearch.count).toBe(1);
    expect(evidenceSearch.items[0]?.kind).toBe('codex.exec.dry_run_plan');
    expect(auditSearch.count).toBe(1);
    expect(auditSearch.items[0]?.action).toBe('codex.exec.policy_evaluated');
    expect(evidenceSearch.items.every((item) => item.metadataOnly)).toBe(true);
    expect(auditSearch.items.every((item) => item.bodyStored === false)).toBe(true);
  });

  it('returns safe not_found details without throwing', () => {
    const evidenceDetail = getEvidenceDetail({ evidenceRefId: 'missing_evidence' });
    const auditDetail = getAuditDetail({ auditEventId: 'missing_audit' });

    expect(evidenceDetail).toMatchObject({
      status: 'not_found',
      evidenceRefId: 'missing_evidence',
      liveExecution: false,
      externalProcessStarted: false,
      executionDisabled: true,
    });
    expect(auditDetail).toMatchObject({
      status: 'not_found',
      auditEventId: 'missing_audit',
      liveExecution: false,
      externalProcessStarted: false,
      executionDisabled: true,
    });
  });

  it('builds a read-only drilldown view with timeline, evidence, and audit summaries', () => {
    const { record, approvalRecord } = createFullTimelineFixture();
    const drilldown = buildControlPlaneDrilldownView({
      dryRunId: record.dryRunPlanId,
      records: [record],
      approvalRecords: [approvalRecord],
    });

    expect(drilldown.status).toBe('found');
    expect(drilldown.timeline?.status).toBe('gate_blocked');
    expect(drilldown.timelineDetail?.latestGateStatus).toBe('blocked');
    expect(drilldown.evidenceCount).toBe(record.evidenceRefs.length);
    expect(drilldown.auditEventCount).toBe(record.auditEvents.length);
    expect(drilldown.selectedEvidence?.metadataOnly).toBe(true);
    expect(drilldown.selectedAudit?.bodyStored).toBe(false);
    expect(drilldown.liveExecution).toBe(false);
    expect(drilldown.externalProcessStarted).toBe(false);
    expect(drilldown.executionDisabled).toBe(true);
    expect(JSON.stringify(drilldown)).not.toContain('disabled for timeline test');
  });

  it('builds a read-only report with required sections and no body exposure', () => {
    const { record, approvalRecord } = createFullTimelineFixture();
    const report = buildCodexExecControlPlaneReport({
      dryRunId: record.dryRunPlanId,
      record,
      approvalRecords: [approvalRecord],
      format: 'json',
      includeEvidence: true,
      includeAudit: true,
    });
    const sectionKinds = report.sections.map((section) => section.kind);

    expect(sectionKinds).toEqual([
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
    ]);
    expect(report.summary.evidenceCount).toBeGreaterThan(0);
    expect(report.summary.auditEventCount).toBeGreaterThan(0);
    expect(report.liveExecution).toBe(false);
    expect(report.externalProcessStarted).toBe(false);
    expect(report.executionDisabled).toBe(true);
    expect(JSON.stringify(report)).not.toContain('disabled for timeline test');
    expect(JSON.stringify(report)).not.toContain('Summarize repository structure and list');
  });

  it('renders report JSON and Markdown with no-live flags and safe content only', () => {
    const { record, approvalRecord } = createFullTimelineFixture();
    const report = buildCodexExecControlPlaneReport({
      dryRunId: record.dryRunPlanId,
      record,
      approvalRecords: [approvalRecord],
      format: 'markdown',
    });
    const jsonExport = renderCodexExecControlPlaneReportJson(report);
    const markdownExport = renderCodexExecControlPlaneReportMarkdown(report);

    expect(jsonExport.format).toBe('json');
    expect(jsonExport.renderedContentHash).toMatch(/^sha256:/);
    expect(jsonExport.liveExecution).toBe(false);
    expect(markdownExport.format).toBe('markdown');
    expect(markdownExport.renderedContent).toContain('# Codex Control-plane Report');
    expect(markdownExport.renderedContent).toContain('liveExecution=false');
    expect(markdownExport.renderedContent).toContain('externalProcessStarted=false');
    expect(markdownExport.renderedContent).toContain('executionDisabled=true');
    expect(markdownExport.renderedContent).not.toContain('disabled for timeline test');
    expect(markdownExport.renderedContent).not.toContain('Summarize repository structure and list');
  });

  it('excludes evidence and audit summaries when disabled by query', () => {
    const { record, approvalRecord } = createFullTimelineFixture();
    const report = buildCodexExecControlPlaneReport({
      dryRunId: record.dryRunPlanId,
      record,
      approvalRecords: [approvalRecord],
      includeEvidence: false,
      includeAudit: false,
    });
    const evidenceSection = report.sections.find((section) => section.kind === 'evidence');
    const auditSection = report.sections.find((section) => section.kind === 'audit');

    expect(report.summary.evidenceCount).toBe(0);
    expect(report.summary.auditEventCount).toBe(0);
    expect(evidenceSection?.summary).toContain('excluded');
    expect(auditSection?.summary).toContain('excluded');
    expect(evidenceSection?.refIds).toEqual([]);
    expect(auditSection?.refIds).toEqual([]);
  });

  it('returns a safe not_found report without throwing', () => {
    const report = buildCodexExecControlPlaneReport({
      dryRunId: 'missing_dry_run',
      records: [],
    });

    expect(report.status).toBe('not_found');
    expect(report.summary.finalControlPlaneStatus).toBe('not_found');
    expect(report.sections.find((section) => section.kind === 'overview')?.status).toBe('missing');
    expect(report.liveExecution).toBe(false);
    expect(report.externalProcessStarted).toBe(false);
    expect(report.executionDisabled).toBe(true);
  });

  it('creates a report review draft without granting execution', () => {
    const { record, approvalRecord } = createFullTimelineFixture();
    const report = buildCodexExecControlPlaneReport({
      dryRunId: record.dryRunPlanId,
      record,
      approvalRecords: [approvalRecord],
    });
    const draft = createCodexExecReportReviewDraft({
      report,
      reviewerLabel: 'local-operator',
      notesSummary: 'No-live boundary intact; live adapter still requires ADR.',
    });
    const summary = summarizeCodexExecReportReview(draft);

    expect(draft.status).toBe('draft');
    expect(draft.dryRunId).toBe(record.dryRunPlanId);
    expect(draft.reportHash).toMatch(/^sha256:/);
    expect(draft.reportSectionHashes.length).toBe(report.sections.length);
    expect(draft.recommendationGrantsExecution).toBe(false);
    expect(summary.recommendationGrantsExecution).toBe(false);
    expect(draft.liveExecution).toBe(false);
    expect(draft.externalProcessStarted).toBe(false);
    expect(draft.executionDisabled).toBe(true);
    expect(JSON.stringify(draft)).not.toContain('Summarize repository structure and list');
  });

  it('evaluates review checklist and detects missing report sections', () => {
    const { record, approvalRecord } = createFullTimelineFixture();
    const report = buildCodexExecControlPlaneReport({
      dryRunId: record.dryRunPlanId,
      record,
      approvalRecords: [approvalRecord],
    });
    const missingSectionReport = {
      ...report,
      sections: report.sections.filter((section) => section.kind !== 'gate'),
    };
    const checklist = evaluateCodexExecReportReviewChecklist(missingSectionReport);
    const requiredSections = checklist.find((item) => item.code === 'report_has_required_sections');
    const noLiveFlags = checklist.find((item) => item.code === 'no_live_flags_present');

    expect(requiredSections?.status).toBe('failed');
    expect(requiredSections?.summary).toContain('gate');
    expect(noLiveFlags?.status).toBe('passed');
  });

  it('classifies report review risk from findings and keeps recommendation non-executing', () => {
    const { record, approvalRecord } = createFullTimelineFixture();
    const report = buildCodexExecControlPlaneReport({
      dryRunId: record.dryRunPlanId,
      record,
      approvalRecords: [approvalRecord],
    });
    const finding = {
      id: 'codex_report_review_finding_test',
      schemaVersion: '2026-04-28.foundation' as const,
      createdAt: '2026-04-28T00:00:00.000Z',
      severity: 'critical' as const,
      code: 'no_live_boundary_missing',
      summary: 'No-live boundary summary is missing.',
      relatedSection: 'no_live_boundary' as const,
      recommendation: 'Stop and repair the report before any later ADR review.',
      metadataOnly: true as const,
      bodyStored: false as const,
      liveExecution: false as const,
      externalProcessStarted: false as const,
      executionDisabled: true as const,
    };
    const recordReview = createCodexExecReportReviewRecord({
      report,
      status: 'changes_requested',
      recommendation: 'no_go',
      findings: [finding],
    });
    const summaries = listCodexExecReportReviewSummaries([recordReview], {
      dryRunId: record.dryRunPlanId,
      recommendation: 'no_go',
      limit: 5,
    });

    expect(classifyCodexExecReportRisk(report, [finding])).toBe('critical');
    expect(recordReview.riskClassification).toBe('critical');
    expect(recordReview.recommendation).toBe('no_go');
    expect(recordReview.recommendationGrantsExecution).toBe(false);
    expect(summaries).toHaveLength(1);
    expect(summaries[0]?.bodyStored).toBe(false);
  });

  it('builds report review history and selects the latest review by dryRunId', () => {
    const { record, approvalRecord } = createFullTimelineFixture();
    const report = buildCodexExecControlPlaneReport({
      dryRunId: record.dryRunPlanId,
      record,
      approvalRecords: [approvalRecord],
    });
    const olderReview = {
      ...createCodexExecReportReviewRecord({
        report,
        reviewerLabel: 'first-reviewer',
        status: 'changes_requested',
        recommendation: 'needs_changes',
      }),
      id: 'codex_report_review_older',
      reviewedAt: '2026-04-28T01:00:00.000Z',
      createdAt: '2026-04-28T01:00:00.000Z',
    };
    const latestReview = {
      ...createCodexExecReportReviewRecord({
        report,
        reviewerLabel: 'second-reviewer',
        status: 'reviewed',
        recommendation: 'ready_for_adr',
      }),
      id: 'codex_report_review_latest',
      reviewedAt: '2026-04-28T02:00:00.000Z',
      createdAt: '2026-04-28T02:00:00.000Z',
    };
    const unrelatedReview = {
      ...olderReview,
      id: 'codex_report_review_unrelated',
      dryRunId: 'other_dry_run',
    };
    const reviews = [olderReview, latestReview, unrelatedReview];
    const latest = getLatestCodexExecReportReview(reviews, record.dryRunPlanId);
    const history = buildCodexExecReportReviewHistory(reviews, {
      dryRunId: record.dryRunPlanId,
      recommendation: 'ready_for_adr',
      limit: 5,
    });

    expect(latest?.id).toBe(latestReview.id);
    expect(history.latestReview?.reviewId).toBe(latestReview.id);
    expect(history.summaries).toHaveLength(1);
    expect(history.recommendationGrantsExecution).toBe(false);
    expect(history.liveExecution).toBe(false);
    expect(history.externalProcessStarted).toBe(false);
    expect(history.executionDisabled).toBe(true);
  });

  it('compares reviews and creates a metadata-only reviewer handoff summary', () => {
    const { record, approvalRecord } = createFullTimelineFixture();
    const report = buildCodexExecControlPlaneReport({
      dryRunId: record.dryRunPlanId,
      record,
      approvalRecords: [approvalRecord],
    });
    const leftReview = {
      ...createCodexExecReportReviewRecord({
        report,
        reviewerLabel: 'first-reviewer',
        status: 'changes_requested',
        recommendation: 'needs_changes',
      }),
      id: 'codex_report_review_left',
      reviewedAt: '2026-04-28T01:00:00.000Z',
    };
    const rightReview = {
      ...createCodexExecReportReviewRecord({
        report,
        reviewerLabel: 'second-reviewer',
        status: 'reviewed',
        recommendation: 'ready_for_adr',
      }),
      id: 'codex_report_review_right',
      reviewedAt: '2026-04-28T02:00:00.000Z',
    };
    const comparison = compareCodexExecReportReviews(leftReview, rightReview);
    const handoff = buildCodexExecReviewerHandoffSummary(
      [leftReview, rightReview],
      record.dryRunPlanId,
      {
        fromReviewer: 'first-reviewer',
        toReviewer: 'second-reviewer',
      },
    );

    expect(comparison.comparable).toBe(true);
    expect(comparison.changedItemCount).toBeGreaterThan(0);
    expect(comparison.items.some((item) => item.field === 'status' && item.changed)).toBe(true);
    expect(handoff.latestReviewId).toBe(rightReview.id);
    expect(handoff.handoffSummary).toContain('does not grant execution');
    expect(comparison.recommendationGrantsExecution).toBe(false);
    expect(handoff.recommendationGrantsExecution).toBe(false);
    expect(JSON.stringify(comparison)).not.toContain('Summarize repository structure and list');
    expect(JSON.stringify(handoff)).not.toContain('Summarize repository structure and list');
    expect(comparison.liveExecution).toBe(false);
    expect(handoff.externalProcessStarted).toBe(false);
    expect(handoff.executionDisabled).toBe(true);
  });

  it('builds an ADR readiness governance package without granting execution', () => {
    const { record, approvalRecord } = createFullTimelineFixture();
    const report = buildCodexExecControlPlaneReport({
      dryRunId: record.dryRunPlanId,
      record,
      approvalRecords: [approvalRecord],
    });
    const review = createCodexExecReportReviewRecord({
      report,
      reviewerLabel: 'local-operator',
      status: 'reviewed',
      recommendation: 'ready_for_adr',
      notesSummary: 'No-live boundary intact; live adapter still requires ADR.',
    });
    const governancePackage = buildCodexExecGovernanceReviewPackage({
      dryRunId: record.dryRunPlanId,
      record,
      approvalRecords: [approvalRecord],
      report,
      reportReviews: [review],
    });
    const summary = summarizeCodexExecGovernanceReviewPackage(governancePackage);

    expect(governancePackage.status).toBe('ready_for_adr');
    expect(governancePackage.sectionOrder).toEqual([
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
    ]);
    expect(governancePackage.adrReadinessChecklist.map((item) => item.code)).toContain(
      'no_live_boundary_confirmed',
    );
    expect(governancePackage.noLiveEvidence.noRealCodexExec).toBe(true);
    expect(governancePackage.summary.latestReviewId).toBe(review.id);
    expect(summary.recommendationGrantsExecution).toBe(false);
    expect(governancePackage.recommendationGrantsExecution).toBe(false);
    expect(governancePackage.liveExecution).toBe(false);
    expect(governancePackage.externalProcessStarted).toBe(false);
    expect(governancePackage.executionDisabled).toBe(true);
    expect(JSON.stringify(governancePackage)).not.toContain(
      'Summarize repository structure and list',
    );
  });

  it('creates governance blockers for missing dry-run and review history', () => {
    const governancePackage = buildCodexExecGovernanceReviewPackage({
      dryRunId: 'missing_dry_run',
      records: [],
      reportReviews: [],
    });

    expect(governancePackage.status).toBe('not_found');
    expect(governancePackage.recommendation).toBe('no_go');
    expect(governancePackage.riskClassification).toBe('high');
    expect(governancePackage.blockers.map((blocker) => blocker.code)).toContain(
      'dry_run_available',
    );
    expect(governancePackage.blockers.map((blocker) => blocker.code)).toContain(
      'governance_report_not_found',
    );
    expect(governancePackage.summary.unresolvedBlockerCount).toBeGreaterThan(0);
    expect(governancePackage.noLiveEvidence.noExternalProcessStarted).toBe(true);
  });

  it('builds governance checklist and no-live evidence from existing summaries', () => {
    const { record, approvalRecord } = createFullTimelineFixture();
    const report = buildCodexExecControlPlaneReport({
      dryRunId: record.dryRunPlanId,
      record,
      approvalRecords: [approvalRecord],
    });
    const review = createCodexExecReportReviewRecord({ report });
    const reviewHistory = buildCodexExecReportReviewHistory([review], {
      dryRunId: record.dryRunPlanId,
    });
    const handoff = buildCodexExecReviewerHandoffSummary([review], record.dryRunPlanId);
    const drilldown = buildControlPlaneDrilldownView({
      dryRunId: record.dryRunPlanId,
      records: [record],
      approvalRecords: [approvalRecord],
    });
    const noLiveEvidence = buildCodexExecNoLiveEvidenceSummary({
      dryRunId: record.dryRunPlanId,
      drilldown,
      record,
    });
    const checklist = buildCodexExecAdrReadinessChecklist({
      dryRunId: record.dryRunPlanId,
      report,
      reviewHistory,
      handoff,
      noLiveEvidence,
    });

    expect(checklist.every((item) => item.recommendationGrantsExecution === false)).toBe(true);
    expect(noLiveEvidence.evidenceRefCount).toBeGreaterThan(0);
    expect(noLiveEvidence.auditEventCount).toBeGreaterThan(0);
    expect(noLiveEvidence.noWorkspaceWrite).toBe(true);
    expect(
      classifyCodexExecGovernanceRisk({
        report,
        reviewHistory,
        blockers: [],
      }),
    ).toBe('medium');
    expect(JSON.stringify(noLiveEvidence)).not.toContain('Summarize repository structure and list');
  });

  it('builds and renders a read-only live adapter ADR draft', () => {
    const { record, approvalRecord } = createFullTimelineFixture();
    const report = buildCodexExecControlPlaneReport({
      dryRunId: record.dryRunPlanId,
      record,
      approvalRecords: [approvalRecord],
    });
    const review = createCodexExecReportReviewRecord({
      report,
      status: 'reviewed',
      recommendation: 'ready_for_adr',
    });
    const governancePackage = buildCodexExecGovernanceReviewPackage({
      dryRunId: record.dryRunPlanId,
      record,
      approvalRecords: [approvalRecord],
      report,
      reportReviews: [review],
    });
    const draft = buildCodexExecLiveAdapterAdrDraft({
      dryRunId: record.dryRunPlanId,
      governancePackage,
      format: 'markdown',
    });
    const summary = summarizeCodexExecLiveAdapterAdrDraft(draft);
    const markdown = renderCodexExecLiveAdapterAdrDraftMarkdown(draft);
    const json = renderCodexExecLiveAdapterAdrDraftJson(draft);

    expect(draft.status).toBe('ready_for_review');
    expect(draft.sectionOrder).toEqual([
      'title',
      'status',
      'context',
      'governance_summary',
      'no_live_boundary',
      'adr_readiness',
      'risk_assessment',
      'unresolved_blockers',
      'decision_options',
      'recommended_decision',
      'consequences',
      'next_review_steps',
    ]);
    expect(draft.draftOnly).toBe(true);
    expect(draft.recommendationGrantsExecution).toBe(false);
    expect(summary.recommendationGrantsExecution).toBe(false);
    expect(markdown.renderedContent).toContain('does not grant execution');
    expect(markdown.renderedContent).not.toContain('execution approval');
    expect(json.renderedContent).toContain('"draftOnly": true');
    expect(markdown.liveExecution).toBe(false);
    expect(json.externalProcessStarted).toBe(false);
    expect(markdown.executionDisabled).toBe(true);
    expect(JSON.stringify(draft)).not.toContain('Summarize repository structure and list');
    expect(markdown.renderedContent).not.toContain('Summarize repository structure and list');
  });

  it('creates a safe not_found ADR draft from missing governance data', () => {
    const draft = buildCodexExecLiveAdapterAdrDraft({
      dryRunId: 'missing_dry_run',
      format: 'json',
    });
    const markdown = renderCodexExecLiveAdapterAdrDraftMarkdown(draft);

    expect(draft.status).toBe('not_found');
    expect(draft.summary.recommendation).toBe('no_go');
    expect(draft.summary.blockerCount).toBeGreaterThan(0);
    expect(draft.recommendationGrantsExecution).toBe(false);
    expect(draft.liveExecution).toBe(false);
    expect(draft.externalProcessStarted).toBe(false);
    expect(draft.executionDisabled).toBe(true);
    expect(markdown.renderedContent).toContain('does not grant execution');
    expect(markdown.renderedContent).not.toContain('full command body');
  });

  it('records a conditional read-only ADR decision without approving implementation', () => {
    const record = createCodexExecLiveAdapterAdrDecisionRecord({
      dryRunId: 'codex_dry_run_1',
      reviewerLabel: 'local-operator',
      rationaleSummary:
        'Conditional read-only design can continue; implementation is not approved.',
    });
    const evidenceRefs = createCodexExecLiveAdapterAdrDecisionEvidenceRefs(record);
    const auditEvents = createCodexExecLiveAdapterAdrDecisionAuditEvents(record, evidenceRefs);
    const persistedRecord = {
      ...record,
      evidenceRefs,
      auditEventIds: auditEvents.map((event) => event.id),
    };
    const summary = listCodexExecLiveAdapterAdrDecisionSummaries([persistedRecord], {
      dryRunId: record.dryRunId,
      decision: 'conditional_read_only_go',
      status: 'recorded',
      limit: 10,
    })[0];
    const latest = getLatestCodexExecLiveAdapterAdrDecision([persistedRecord], record.dryRunId);

    expect(record.decision).toBe('conditional_read_only_go');
    expect(record.allowedSandboxModes).toEqual(['read_only']);
    expect(record.forbiddenSandboxModes).toEqual(['workspace_write', 'danger_full_access']);
    expect(record.futureTriggerPolicy).toBe('cli_only');
    expect(record.dashboardTriggerAllowed).toBe(false);
    expect(record.implementationApproved).toBe(false);
    expect(record.processAdapterApproved).toBe(false);
    expect(record.recommendationGrantsExecution).toBe(false);
    expect(record.gatePolicy.dryRunPlanHashMatchRequired).toBe(true);
    expect(record.gatePolicy.policyDecisionHashMatchRequired).toBe(true);
    expect(record.gatePolicy.isolatedWorktreeRequired).toBe(true);
    expect(record.gatePolicy.postRunVerificationCommand).toBe('pnpm verify:foundation');
    expect(evidenceRefs).toHaveLength(1);
    expect(evidenceRefs[0]?.kind).toBe('codex.exec.live_adapter_adr_decision');
    expect(auditEvents).toHaveLength(1);
    expect(auditEvents[0]?.action).toBe('codex.exec.live_adapter_adr_decision.recorded');
    expect(summary?.decisionId).toBe(record.id);
    expect(summary?.evidenceCount).toBe(1);
    expect(latest?.id).toBe(record.id);
    expect(JSON.stringify(persistedRecord)).not.toContain('full prompt body');
    expect(JSON.stringify(persistedRecord)).not.toContain('full command body');
  });

  it('simulates a passing read-only adapter preflight without granting execution', () => {
    const { record } = createFullTimelineFixture();
    const config = {
      ...createDefaultCodexExecLiveConfig(),
      liveEnabled: true,
      forbiddenSandboxModes: ['workspace_write' as const, 'danger_full_access' as const],
    };
    const adrDecision = createCodexExecLiveAdapterAdrDecisionRecord({
      dryRunId: record.dryRunPlanId,
      reviewerLabel: 'local-operator',
    });
    const checklist = createDefaultReadOnlyAdapterOperatorChecklist().map((item) => ({
      ...item,
      checked: true,
    }));
    const result = simulateReadOnlyAdapterPreflight({
      dryRunId: record.dryRunPlanId,
      record,
      config,
      adrDecision,
      isolatedWorktreePresent: true,
      evidenceStoreReady: true,
      auditStoreReady: true,
      operatorChecklist: checklist,
    });
    const summary = summarizeReadOnlyAdapterPreflightSimulation(result);

    expect(result.status).toBe('passed');
    expect(result.executionDisabled).toBe(true);
    expect(result.liveExecution).toBe(false);
    expect(result.externalProcessStarted).toBe(false);
    expect(result.processAdapterStarted).toBe(false);
    expect(result.implementationApproved).toBe(false);
    expect(result.dashboardTriggerAllowed).toBe(false);
    expect(result.recommendationGrantsExecution).toBe(false);
    expect(result.blockers).toHaveLength(0);
    expect(summary.status).toBe('passed');
    expect(summary.checklistCompletedCount).toBe(summary.checklistTotalCount);
  });

  it('fails simulation when config is disabled or required governance is missing', () => {
    const { record } = createFullTimelineFixture();
    const disabledResult = simulateReadOnlyAdapterPreflight({
      dryRunId: record.dryRunPlanId,
      record,
      config: createDefaultCodexExecLiveConfig(),
      isolatedWorktreePresent: true,
      evidenceStoreReady: true,
      auditStoreReady: true,
      operatorChecklist: createDefaultReadOnlyAdapterOperatorChecklist().map((item) => ({
        ...item,
        checked: true,
      })),
    });
    const { approvalArtifact: _approvalArtifact, ...recordWithoutApprovalArtifact } = record;
    const missingApprovalResult = simulateReadOnlyAdapterPreflight({
      dryRunId: record.dryRunPlanId,
      record: recordWithoutApprovalArtifact,
      config: {
        ...createDefaultCodexExecLiveConfig(),
        liveEnabled: true,
        forbiddenSandboxModes: ['workspace_write' as const, 'danger_full_access' as const],
      },
      isolatedWorktreePresent: true,
      evidenceStoreReady: true,
      auditStoreReady: true,
      operatorChecklist: createDefaultReadOnlyAdapterOperatorChecklist().map((item) => ({
        ...item,
        checked: true,
      })),
    });

    expect(disabledResult.status).toBe('failed');
    expect(disabledResult.blockers.map((blocker) => blocker.code)).toContain(
      'config_explicit_enable_state',
    );
    expect(missingApprovalResult.status).toBe('failed');
    expect(missingApprovalResult.blockers.map((blocker) => blocker.code)).toContain(
      'approval_artifact_exists',
    );
  });

  it('blocks simulation when forbidden sandbox capabilities are requested', () => {
    const { record } = createFullTimelineFixture();
    const result = simulateReadOnlyAdapterPreflight({
      dryRunId: record.dryRunPlanId,
      record,
      config: {
        ...createDefaultCodexExecLiveConfig(),
        liveEnabled: true,
        forbiddenSandboxModes: ['workspace_write' as const, 'danger_full_access' as const],
      },
      requestedSandboxMode: 'workspace_write',
      workspaceWriteRequested: true,
      isolatedWorktreePresent: true,
      evidenceStoreReady: true,
      auditStoreReady: true,
      operatorChecklist: createDefaultReadOnlyAdapterOperatorChecklist().map((item) => ({
        ...item,
        checked: true,
      })),
    });

    expect(result.status).toBe('blocked');
    expect(result.blockers.some((blocker) => blocker.severity === 'critical')).toBe(true);
    expect(result.liveExecution).toBe(false);
    expect(result.externalProcessStarted).toBe(false);
    expect(result.executionDisabled).toBe(true);
  });

  it('fails simulation on hash mismatch or missing isolated worktree', () => {
    const { record } = createFullTimelineFixture();
    const config = {
      ...createDefaultCodexExecLiveConfig(),
      liveEnabled: true,
      forbiddenSandboxModes: ['workspace_write' as const, 'danger_full_access' as const],
    };
    const checklist = createDefaultReadOnlyAdapterOperatorChecklist().map((item) => ({
      ...item,
      checked: true,
    }));
    const hashMismatch = simulateReadOnlyAdapterPreflight({
      dryRunId: record.dryRunPlanId,
      record,
      config,
      approvalArtifact: record.approvalArtifact
        ? { ...record.approvalArtifact, dryRunPlanHash: 'sha256:mismatch' }
        : undefined,
      isolatedWorktreePresent: true,
      evidenceStoreReady: true,
      auditStoreReady: true,
      operatorChecklist: checklist,
    });
    const missingWorktree = simulateReadOnlyAdapterPreflight({
      dryRunId: record.dryRunPlanId,
      record,
      config,
      isolatedWorktreePresent: false,
      evidenceStoreReady: true,
      auditStoreReady: true,
      operatorChecklist: checklist,
    });

    expect(hashMismatch.status).toBe('failed');
    expect(hashMismatch.blockers.map((blocker) => blocker.code)).toContain(
      'dry_run_plan_hash_match',
    );
    expect(missingWorktree.status).toBe('failed');
    expect(missingWorktree.blockers.map((blocker) => blocker.code)).toContain(
      'isolated_worktree_present',
    );
  });

  it('requires review for incomplete operator checklist and creates metadata-only evidence/audit', () => {
    const { record } = createFullTimelineFixture();
    const result = simulateReadOnlyAdapterPreflight({
      dryRunId: record.dryRunPlanId,
      record,
      config: {
        ...createDefaultCodexExecLiveConfig(),
        liveEnabled: true,
        forbiddenSandboxModes: ['workspace_write' as const, 'danger_full_access' as const],
      },
      adrDecision: createCodexExecLiveAdapterAdrDecisionRecord({
        dryRunId: record.dryRunPlanId,
        reviewerLabel: 'local-operator',
      }),
      isolatedWorktreePresent: true,
      evidenceStoreReady: true,
      auditStoreReady: true,
      operatorChecklist: createDefaultReadOnlyAdapterOperatorChecklist(),
    });
    const evidenceRefs = createReadOnlyAdapterPreflightSimulationEvidenceRefs(result);
    const auditEvents = createReadOnlyAdapterPreflightSimulationAuditEvents(result, evidenceRefs);

    expect(result.status).toBe('requires_review');
    expect(result.warningCheckCount).toBeGreaterThan(0);
    expect(evidenceRefs).toHaveLength(1);
    expect(evidenceRefs[0]?.kind).toBe('codex.exec.read_only_adapter.preflight_simulation');
    expect(evidenceRefs[0]?.metadata?.bodyStored).toBe(false);
    expect(auditEvents[0]?.action).toBe('codex.exec.read_only_adapter.preflight_simulated');
    expect(auditEvents[0]?.metadata?.externalProcessStarted).toBe(false);
    expect(JSON.stringify(result)).not.toContain('Summarize repository structure and list');
  });

  it('classifies simulator checks into hard gates and requires-review items', () => {
    const { record } = createFullTimelineFixture();
    const result = simulateReadOnlyAdapterPreflight({
      dryRunId: record.dryRunPlanId,
      record,
      config: {
        ...createDefaultCodexExecLiveConfig(),
        liveEnabled: true,
        forbiddenSandboxModes: ['workspace_write' as const, 'danger_full_access' as const],
      },
      adrDecision: createCodexExecLiveAdapterAdrDecisionRecord({
        dryRunId: record.dryRunPlanId,
        reviewerLabel: 'local-operator',
      }),
      isolatedWorktreePresent: true,
      evidenceStoreReady: true,
      auditStoreReady: true,
      operatorChecklist: createDefaultReadOnlyAdapterOperatorChecklist(),
    });
    const classified = classifyReadOnlyAdapterSimulatorGateChecks(result);

    expect(classified.some((item) => item.disposition === 'hard_gate')).toBe(true);
    expect(
      classified.some(
        (item) =>
          item.checkCode === 'operator_checklist_complete' &&
          item.disposition === 'requires_review' &&
          item.status === 'requires_review',
      ),
    ).toBe(true);
    expect(classified.every((item) => item.implementationApproved === false)).toBe(true);
    expect(classified.every((item) => item.recommendationGrantsExecution === false)).toBe(true);
  });

  it('creates simulator review record from a passing simulation without approving implementation', () => {
    const { record } = createFullTimelineFixture();
    const checklist = createDefaultReadOnlyAdapterOperatorChecklist().map((item) => ({
      ...item,
      checked: true,
    }));
    const result = simulateReadOnlyAdapterPreflight({
      dryRunId: record.dryRunPlanId,
      record,
      config: {
        ...createDefaultCodexExecLiveConfig(),
        liveEnabled: true,
        forbiddenSandboxModes: ['workspace_write' as const, 'danger_full_access' as const],
      },
      adrDecision: createCodexExecLiveAdapterAdrDecisionRecord({
        dryRunId: record.dryRunPlanId,
        reviewerLabel: 'local-operator',
      }),
      isolatedWorktreePresent: true,
      evidenceStoreReady: true,
      auditStoreReady: true,
      operatorChecklist: checklist,
    });
    const review = createReadOnlyAdapterSimulatorReviewDecisionRecord({
      simulationResult: result,
      reviewerLabel: 'local-operator',
      outcome: 'go_to_implementation_planning',
    });
    const summary = summarizeReadOnlyAdapterSimulatorReview(review);

    expect(result.status).toBe('passed');
    expect(review.outcome).toBe('go_to_implementation_planning');
    expect(review.implementationApproved).toBe(false);
    expect(review.processAdapterApproved).toBe(false);
    expect(review.recommendationGrantsExecution).toBe(false);
    expect(summary.summary).toContain('implementationApproved=false');
    expect(JSON.stringify(review)).not.toContain('full prompt body');
    expect(JSON.stringify(review)).not.toContain('full command body');
  });

  it('records simulator blockers and creates metadata-only review evidence/audit', () => {
    const { record } = createFullTimelineFixture();
    const result = simulateReadOnlyAdapterPreflight({
      dryRunId: record.dryRunPlanId,
      record,
      config: createDefaultCodexExecLiveConfig(),
      isolatedWorktreePresent: false,
      evidenceStoreReady: false,
      auditStoreReady: false,
    });
    const review = createReadOnlyAdapterSimulatorReviewDecisionRecord({
      simulationResult: result,
      reviewerLabel: 'local-operator',
      rationaleSummary: 'Planning can continue, but hard gates remain unresolved.',
    });
    const evidenceRefs = createReadOnlyAdapterSimulatorReviewEvidenceRefs(review);
    const auditEvents = createReadOnlyAdapterSimulatorReviewAuditEvents(review, evidenceRefs);

    expect(result.status).toBe('failed');
    expect(review.unresolvedBlockerCount).toBeGreaterThan(0);
    expect(review.findings.some((finding) => finding.disposition === 'hard_gate')).toBe(true);
    expect(evidenceRefs[0]?.kind).toBe('codex.exec.read_only_adapter.simulator_review');
    expect(evidenceRefs[0]?.metadata?.bodyStored).toBe(false);
    expect(auditEvents[0]?.action).toBe('codex.exec.read_only_adapter.simulator_review.recorded');
    expect(auditEvents[0]?.metadata?.implementationApproved).toBe(false);
  });

  it('lists and selects latest simulator review summaries by dry-run', () => {
    const { record } = createFullTimelineFixture();
    const result = simulateReadOnlyAdapterPreflight({
      dryRunId: record.dryRunPlanId,
      record,
      config: createDefaultCodexExecLiveConfig(),
    });
    const first = createReadOnlyAdapterSimulatorReviewDecisionRecord({
      simulationResult: result,
      status: 'superseded',
      outcome: 'no_go',
      reviewerLabel: 'first-reviewer',
    });
    const second = createReadOnlyAdapterSimulatorReviewDecisionRecord({
      simulationResult: result,
      outcome: 'go_to_implementation_planning',
      reviewerLabel: 'second-reviewer',
    });
    const records = [first, second];
    const summaries = listReadOnlyAdapterSimulatorReviewSummaries(records, {
      dryRunId: record.dryRunPlanId,
      status: 'recorded',
      outcome: 'go_to_implementation_planning',
      limit: 10,
    });
    const latest = getLatestReadOnlyAdapterSimulatorReview(records, record.dryRunPlanId);

    expect(summaries).toHaveLength(1);
    expect(summaries[0]?.outcome).toBe('go_to_implementation_planning');
    expect(latest?.reviewerLabel).toBe('second-reviewer');
  });

  it('creates read-only adapter implementation plan reviews without approving execution', () => {
    const noGo = createReadOnlyAdapterImplementationPlanReviewDecisionRecord({
      outcome: 'no_go',
      reviewerLabel: 'reviewer-a',
      rationaleSummary: 'Planning is not ready for even a disabled skeleton.',
    });
    const conditionalSkeleton = createReadOnlyAdapterImplementationPlanReviewDecisionRecord({
      outcome: 'conditional_go_to_disabled_skeleton',
      reviewerLabel: 'reviewer-b',
      rationaleSummary:
        'Allows only Round 3T disabled-by-default skeleton work, not process launch.',
    });
    const summary = summarizeReadOnlyAdapterImplementationPlanReview(conditionalSkeleton);
    const evidenceRefs =
      createReadOnlyAdapterImplementationPlanReviewEvidenceRefs(conditionalSkeleton);
    const auditEvents = createReadOnlyAdapterImplementationPlanReviewAuditEvents(
      conditionalSkeleton,
      evidenceRefs,
    );

    expect(noGo.disabledSkeletonApproved).toBe(false);
    expect(conditionalSkeleton.disabledSkeletonApproved).toBe(true);
    expect(summary).toMatchObject({
      outcome: 'conditional_go_to_disabled_skeleton',
      disabledSkeletonApproved: true,
      implementationApproved: false,
      processAdapterApproved: false,
      recommendationGrantsExecution: false,
      workspaceWriteAllowed: false,
      dangerFullAccessAllowed: false,
      liveExecution: false,
      externalProcessStarted: false,
      executionDisabled: true,
    });
    expect(
      createDefaultReadOnlyAdapterImplementationPlanReviewChecklist().map((item) => item.code),
    ).toEqual(
      expect.arrayContaining([
        'cli_only_trigger',
        'read_only_only',
        'config_gates_default_disabled',
        'approval_hash_binding_required',
        'isolated_worktree_required',
        'dashboard_trigger_forbidden',
      ]),
    );
    expect(evidenceRefs[0]?.kind).toBe('codex.exec.read_only_adapter.implementation_plan_review');
    expect(evidenceRefs[0]?.metadata?.bodyStored).toBe(false);
    expect(auditEvents[0]?.action).toBe(
      'codex.exec.read_only_adapter.implementation_plan_review.recorded',
    );
    expect(auditEvents[0]?.metadata).toMatchObject({
      implementationApproved: false,
      processAdapterApproved: false,
      recommendationGrantsExecution: false,
    });
    expect(JSON.stringify(conditionalSkeleton)).not.toContain('prompt body');
    expect(JSON.stringify(conditionalSkeleton)).not.toContain('stdout');
  });

  it('lists and selects latest implementation plan review summaries', () => {
    const first = createReadOnlyAdapterImplementationPlanReviewDecisionRecord({
      outcome: 'no_go',
      status: 'superseded',
      reviewerLabel: 'first-reviewer',
    });
    const second = createReadOnlyAdapterImplementationPlanReviewDecisionRecord({
      outcome: 'conditional_go_to_disabled_skeleton',
      reviewerLabel: 'second-reviewer',
    });
    const records = [first, second];
    const summaries = listReadOnlyAdapterImplementationPlanReviewSummaries(records, {
      status: 'recorded',
      outcome: 'conditional_go_to_disabled_skeleton',
      limit: 10,
    });
    const latest = getLatestReadOnlyAdapterImplementationPlanReview(records);

    expect(summaries).toHaveLength(1);
    expect(summaries[0]?.disabledSkeletonApproved).toBe(true);
    expect(latest?.reviewerLabel).toBe('second-reviewer');
  });

  it('returns a safe not_found review draft when report is unavailable', () => {
    const review = createCodexExecReportReviewDraft({
      dryRunId: 'missing_dry_run',
      reviewerLabel: 'local-operator',
    });

    expect(review.dryRunId).toBe('missing_dry_run');
    expect(review.recommendation).toBe('no_go');
    expect(review.riskClassification).toBe('high');
    expect(review.findings.length).toBeGreaterThan(0);
    expect(review.bodyStored).toBe(false);
    expect(review.liveExecution).toBe(false);
    expect(review.externalProcessStarted).toBe(false);
    expect(review.executionDisabled).toBe(true);
  });

  it('keeps disabled skeleton, fixture boundary, and final readiness non-executing', async () => {
    const skeletonPreview = createReadOnlyAdapterSkeletonPreview();
    const skeletonReview = createReadOnlyAdapterSkeletonReviewDecisionRecord({
      preview: skeletonPreview,
      outcome: 'skeleton_accepted_for_fixture_boundary_only',
      reviewerLabel: 'local-operator',
      rationaleSummary: 'Fixture-backed replay boundary only; process adapter remains unapproved.',
    });
    const skeletonSummary = summarizeReadOnlyAdapterSkeletonReview(skeletonReview);
    const fixtureBoundary = await runReadOnlyAdapterFixtureBoundary({
      fixturePath: 'packages/codex-kernel/fixtures/codex-exec-basic.jsonl',
      fixtureText: readFixture('codex-exec-basic.jsonl'),
      metadata: { test: true },
    });
    const fixtureSummary = summarizeReadOnlyAdapterFixtureBoundary(fixtureBoundary);
    const finalReadiness = createReadOnlyAdapterFinalReadinessDecisionRecord({
      skeletonPreview,
      skeletonReview,
      fixtureBoundary,
      outcome: 'ready_for_separate_read_only_adapter_adr',
      reviewerLabel: 'local-operator',
      rationaleSummary: 'Separate ADR remains required before any real adapter can be considered.',
    });
    const finalSummary = summarizeReadOnlyAdapterFinalReadiness(finalReadiness);

    expect(skeletonPreview.status).toBe('disabled');
    expect(skeletonPreview.noRunnableCommand).toBe(true);
    expect(skeletonPreview.commandPreviewStored).toBe(false);
    expect(skeletonReview.fixtureBoundaryAllowed).toBe(true);
    expect(skeletonReview.processAdapterApproved).toBe(false);
    expect(skeletonReview.recommendationGrantsExecution).toBe(false);
    expect(skeletonSummary.fixtureBoundaryAllowed).toBe(true);
    expect(fixtureBoundary.fixtureOnly).toBe(true);
    expect(fixtureBoundary.liveExecution).toBe(false);
    expect(fixtureBoundary.externalProcessStarted).toBe(false);
    expect(fixtureBoundary.processAdapterStarted).toBe(false);
    expect(fixtureBoundary.evidenceRefs).toHaveLength(1);
    expect(fixtureBoundary.auditEvents).toHaveLength(1);
    expect(fixtureBoundary.auditEventIds).toEqual(
      fixtureBoundary.auditEvents.map((event) => event.id),
    );
    expect(fixtureSummary.fixtureOnly).toBe(true);
    expect(finalReadiness.realAdapterRequiresSeparateAdr).toBe(true);
    expect(finalReadiness.currentRoundApprovesProcessStart).toBe(false);
    expect(finalReadiness.currentRoundApprovesCodexExecution).toBe(false);
    expect(finalReadiness.currentRoundApprovesWorkspaceWrites).toBe(false);
    expect(finalSummary.realAdapterRequiresSeparateAdr).toBe(true);
    expect(JSON.stringify(fixtureBoundary)).not.toContain('synthetic stdout body');
    expect(JSON.stringify(finalReadiness)).not.toContain('full command body');
  });

  it('blocks readiness package persistence when the 3S conditional decision is missing', () => {
    const packageRecord = buildRealReadOnlyAdapterReadinessPackage({
      dryRunId: 'codex_dry_run_missing_3s',
      skeletonPreview: createReadOnlyAdapterSkeletonPreview(),
      documentedArtifactRefs: ['docs/reviews/round-3tw-additional-rules-audit.md'],
      symlinkEscapeVerified: false,
      evidenceStoreReady: true,
      auditStoreReady: true,
    });

    expect(packageRecord.status).toBe('blocked');
    expect(packageRecord.blockers.map((blocker) => blocker.code)).toContain(
      'round_3s_conditional_decision_exists',
    );
    expect(packageRecord.implementationApproved).toBe(false);
    expect(packageRecord.processAdapterApproved).toBe(false);
    expect(packageRecord.recommendationGrantsExecution).toBe(false);
  });

  it('requires review when 3T-W evidence is documented-only or symlink verification is pending', () => {
    const governanceDecision = createReadOnlyAdapterImplementationPlanReviewDecisionRecord({
      outcome: 'conditional_go_to_disabled_skeleton',
      reviewerLabel: 'local-operator',
    });
    const skeletonPreview = createReadOnlyAdapterSkeletonPreview();
    const skeletonReview = createReadOnlyAdapterSkeletonReviewDecisionRecord({
      preview: skeletonPreview,
      outcome: 'skeleton_accepted_for_fixture_boundary_only',
      reviewerLabel: 'local-operator',
    });
    const packageRecord = buildRealReadOnlyAdapterReadinessPackage({
      dryRunId: 'codex_dry_run_docs_only',
      governanceDecision,
      skeletonPreview,
      skeletonReview,
      documentedArtifactRefs: [
        'docs/reviews/round-3w-disabled-skeleton-fixture-boundary-review.md',
      ],
      symlinkEscapeVerified: false,
      approvalReadinessReady: true,
      worktreeReadinessReady: true,
      evidenceStoreReady: true,
      auditStoreReady: true,
      operatorChecklistComplete: true,
      postRunVerificationReady: true,
    });

    expect(packageRecord.status).toBe('requires_review');
    expect(packageRecord.findings.map((finding) => finding.code)).toContain(
      'documented_only_3tw_evidence',
    );
    expect(packageRecord.findings.map((finding) => finding.code)).toContain(
      'fixture_path_guard_symlink_escape',
    );
    expect(packageRecord.symlinkEscapeVerificationPending).toBe(true);
  });

  it('requires explicit unresolved finding acknowledgement for readiness ADR draft review', () => {
    const governanceDecision = createReadOnlyAdapterImplementationPlanReviewDecisionRecord({
      outcome: 'conditional_go_to_disabled_skeleton',
      reviewerLabel: 'local-operator',
    });
    const skeletonPreview = createReadOnlyAdapterSkeletonPreview();
    const skeletonReview = createReadOnlyAdapterSkeletonReviewDecisionRecord({
      preview: skeletonPreview,
      outcome: 'skeleton_accepted_for_fixture_boundary_only',
      reviewerLabel: 'local-operator',
    });
    const packageRecord = buildRealReadOnlyAdapterReadinessPackage({
      dryRunId: 'codex_dry_run_readiness_review',
      governanceDecision,
      skeletonPreview,
      skeletonReview,
      documentedArtifactRefs: [
        'docs/reviews/round-3w-disabled-skeleton-fixture-boundary-review.md',
      ],
      symlinkEscapeVerified: false,
      approvalReadinessReady: true,
      worktreeReadinessReady: true,
      evidenceStoreReady: true,
      auditStoreReady: true,
      operatorChecklistComplete: true,
      postRunVerificationReady: true,
    });
    const invalid = validateRealReadOnlyAdapterReadinessReviewDecision({
      packageRecord,
      outcome: 'conditional_go_to_separate_adr_draft',
      rationaleSummary: 'Looks acceptable for ADR drafting.',
    });
    const valid = validateRealReadOnlyAdapterReadinessReviewDecision({
      packageRecord,
      outcome: 'conditional_go_to_separate_adr_draft',
      rationaleSummary:
        'Acknowledges symlink_escape_verification_pending and documented_only_3tw_evidence.',
    });

    expect(packageRecord.status).toBe('requires_review');
    expect(invalid.valid).toBe(false);
    expect(invalid.missingAcknowledgementCodes).toEqual(
      expect.arrayContaining([
        'symlink_escape_verification_pending',
        'documented_only_3tw_evidence',
      ]),
    );
    expect(valid.valid).toBe(true);

    const reviewRecord = createRealReadOnlyAdapterReadinessReviewDecisionRecord({
      packageRecord,
      outcome: 'conditional_go_to_separate_adr_draft',
      reviewerLabel: 'local-operator',
      rationaleSummary:
        'Acknowledges symlink_escape_verification_pending and documented_only_3tw_evidence.',
    });
    const summary = summarizeRealReadOnlyAdapterReadinessReview(reviewRecord);
    const evidenceRefs = createRealReadOnlyAdapterReadinessReviewEvidenceRefs(reviewRecord);
    const auditEvents = createRealReadOnlyAdapterReadinessReviewAuditEvents(
      reviewRecord,
      evidenceRefs,
    );
    const listed = listRealReadOnlyAdapterReadinessReviewSummaries([reviewRecord], {
      dryRunId: packageRecord.dryRunId,
      outcome: 'conditional_go_to_separate_adr_draft',
    });
    const latest = getLatestRealReadOnlyAdapterReadinessReview(
      [reviewRecord],
      packageRecord.dryRunId,
    );

    expect(reviewRecord.separateAdrDraftAllowed).toBe(true);
    expect(reviewRecord.acknowledgedFindingCodes).toEqual(
      expect.arrayContaining([
        'symlink_escape_verification_pending',
        'documented_only_3tw_evidence',
      ]),
    );
    expect(reviewRecord.unresolvedFindingCount).toBeGreaterThan(0);
    expect(reviewRecord.implementationApproved).toBe(false);
    expect(reviewRecord.processAdapterApproved).toBe(false);
    expect(reviewRecord.recommendationGrantsExecution).toBe(false);
    expect(summary.separateAdrDraftAllowed).toBe(true);
    expect(listed).toHaveLength(1);
    expect(latest?.id).toBe(reviewRecord.id);
    expect(evidenceRefs[0]?.kind).toBe('codex.exec.real_read_only_adapter.readiness_review');
    expect(evidenceRefs[0]?.metadata?.bodyStored).toBe(false);
    expect(auditEvents[0]?.action).toBe(
      'codex.exec.real_read_only_adapter.readiness_review.recorded',
    );
    expect(JSON.stringify(reviewRecord)).not.toContain('full report markdown');
    expect(JSON.stringify(reviewRecord)).not.toContain('prompt body');
    expect(JSON.stringify(reviewRecord)).not.toContain('stdout');
  });

  it('keeps the real read-only adapter disabled by default without runnable boundary data', async () => {
    const config = createDefaultRealReadOnlyAdapterConfig();
    const request = createRealReadOnlyAdapterRequest({
      dryRunId: 'codex_dry_run_disabled_default',
      config,
    });
    const adapter = createDisabledRealReadOnlyAdapter();
    const result = await adapter.attempt({
      dryRunId: 'codex_dry_run_disabled_default',
      config,
    });
    const directResult = createDisabledRealReadOnlyAdapterResult({
      dryRunId: 'codex_dry_run_disabled_default',
      config,
    });
    const serialized = JSON.stringify({ config, request, result, directResult });

    expect(config.status).toBe('disabled');
    expect(config.defaultEnabled).toBe(false);
    expect(config.configuredEnabled).toBe(false);
    expect(config.executionDisabled).toBe(true);
    expect(config.workspaceWriteAllowed).toBe(false);
    expect(config.dangerFullAccessAllowed).toBe(false);
    expect(config.dashboardTriggerAllowed).toBe(false);
    expect(config.noRunnableCommand).toBe(true);
    expect(request.triggerKind).toBe('cli');
    expect(request.requestedSandboxMode).toBe('read_only');
    expect(result.status).toBe('blocked');
    expect(result.error?.code).toBe('config_disabled');
    expect(result.executionDisabled).toBe(true);
    expect(result.processAdapterStarted).toBe(false);
    expect(result.implementationApproved).toBe(false);
    expect(result.processAdapterApproved).toBe(false);
    expect(result.recommendationGrantsExecution).toBe(false);
    expect(result.evidenceSummary?.eventHashCount).toBe(0);
    expect(result.auditSummary?.eventCount).toBe(0);
    expect(directResult.error?.absolutePathLeaked).toBe(false);
    expect(serialized).not.toContain('"argv":');
    expect(serialized).not.toContain('"executablePath":');
    expect(serialized).not.toContain('"shellSnippet":');
    expect(serialized).not.toContain('"envPlan":');
    expect(serialized).not.toContain('stdout body');
    expect(serialized).not.toContain('prompt body');
  });

  it('fails real read-only adapter hard gates before boundary planning', () => {
    const { plan, policyDecision } = createControlPlaneFixture({ liveAdapterEnabled: true });
    const approvalArtifact = createCodexExecApprovalArtifact(plan, policyDecision);
    const enabledConfig = {
      ...createDefaultRealReadOnlyAdapterConfig(),
      status: 'enabled' as const,
      configuredEnabled: true,
      summary: 'Enabled for pure guard test only.',
    };
    const missingApproval = createRealReadOnlyAdapterGuardPreflight({
      config: enabledConfig,
      dryRunPlan: plan,
      policyDecision,
      expectedDryRunPlanHash: approvalArtifact.dryRunPlanHash,
      expectedPolicyDecisionHash: approvalArtifact.policyDecisionHash,
      worktree: { isolated: true, status: 'clean' },
      evidenceStoreReady: true,
      auditStoreReady: true,
    });
    const hashMismatch = createRealReadOnlyAdapterGuardPreflight({
      config: enabledConfig,
      dryRunPlan: plan,
      policyDecision,
      approvalArtifact,
      expectedDryRunPlanHash: 'sha256:mismatch',
      expectedPolicyDecisionHash: approvalArtifact.policyDecisionHash,
      worktree: { isolated: true, status: 'clean' },
      evidenceStoreReady: true,
      auditStoreReady: true,
    });
    const dirtyWorktree = createRealReadOnlyAdapterGuardPreflight({
      config: enabledConfig,
      dryRunPlan: plan,
      policyDecision,
      approvalArtifact,
      expectedDryRunPlanHash: approvalArtifact.dryRunPlanHash,
      expectedPolicyDecisionHash: approvalArtifact.policyDecisionHash,
      worktree: { isolated: true, status: 'dirty' },
      evidenceStoreReady: true,
      auditStoreReady: true,
    });

    expect(missingApproval.status).toBe('failed');
    expect(missingApproval.boundaryPlan).toBeUndefined();
    expect(missingApproval.checks.find((check) => check.code === 'approval_artifact_exists')?.status).toBe(
      'failed',
    );
    expect(hashMismatch.status).toBe('failed');
    expect(hashMismatch.checks.find((check) => check.code === 'dry_run_hash_match')?.status).toBe(
      'failed',
    );
    expect(dirtyWorktree.status).toBe('failed');
    expect(
      dirtyWorktree.checks.find((check) => check.code === 'isolated_worktree_clean')?.status,
    ).toBe('failed');
    expect(JSON.stringify({ missingApproval, hashMismatch, dirtyWorktree })).not.toContain(
      '"argv":',
    );
  });

  it('blocks forbidden real read-only adapter modes and dashboard trigger', () => {
    const { plan, policyDecision } = createControlPlaneFixture({ liveAdapterEnabled: true });
    const approvalArtifact = createCodexExecApprovalArtifact(plan, policyDecision);
    const enabledConfig = {
      ...createDefaultRealReadOnlyAdapterConfig(),
      status: 'enabled' as const,
      configuredEnabled: true,
      summary: 'Enabled for pure guard test only.',
    };
    const workspaceWrite = createRealReadOnlyAdapterGuardPreflight({
      config: enabledConfig,
      dryRunPlan: { ...plan, sandboxMode: 'workspace_write' },
      policyDecision,
      approvalArtifact,
      expectedDryRunPlanHash: approvalArtifact.dryRunPlanHash,
      expectedPolicyDecisionHash: approvalArtifact.policyDecisionHash,
      requestedSandboxMode: 'workspace_write',
      worktree: { isolated: true, status: 'clean' },
      evidenceStoreReady: true,
      auditStoreReady: true,
    });
    const dangerFullAccess = createRealReadOnlyAdapterGuardPreflight({
      config: enabledConfig,
      dryRunPlan: { ...plan, sandboxMode: 'danger_full_access' },
      policyDecision,
      approvalArtifact,
      expectedDryRunPlanHash: approvalArtifact.dryRunPlanHash,
      expectedPolicyDecisionHash: approvalArtifact.policyDecisionHash,
      requestedSandboxMode: 'danger_full_access',
      worktree: { isolated: true, status: 'clean' },
      evidenceStoreReady: true,
      auditStoreReady: true,
    });
    const dashboardTrigger = createRealReadOnlyAdapterGuardPreflight({
      config: enabledConfig,
      dryRunPlan: plan,
      policyDecision,
      approvalArtifact,
      expectedDryRunPlanHash: approvalArtifact.dryRunPlanHash,
      expectedPolicyDecisionHash: approvalArtifact.policyDecisionHash,
      triggerKind: 'dashboard',
      worktree: { isolated: true, status: 'clean' },
      evidenceStoreReady: true,
      auditStoreReady: true,
    });

    expect(workspaceWrite.status).toBe('blocked');
    expect(workspaceWrite.checks.find((check) => check.code === 'sandbox_read_only')?.status).toBe(
      'blocked',
    );
    expect(dangerFullAccess.status).toBe('blocked');
    expect(
      dangerFullAccess.checks.find((check) => check.code === 'danger_full_access_forbidden')
        ?.status,
    ).toBe('blocked');
    expect(dashboardTrigger.status).toBe('blocked');
    expect(
      dashboardTrigger.checks.find((check) => check.code === 'dashboard_trigger_forbidden')
        ?.status,
    ).toBe('blocked');
  });

  it('passes real read-only adapter hard gates with deferred metadata-only boundary plan', () => {
    const { plan, policyDecision } = createControlPlaneFixture({ liveAdapterEnabled: true });
    const approvalArtifact = createCodexExecApprovalArtifact(plan, policyDecision, {
      expiresAt: '2099-01-01T00:00:00.000Z',
    });
    const enabledConfig = {
      ...createDefaultRealReadOnlyAdapterConfig(),
      status: 'enabled' as const,
      configuredEnabled: true,
      summary: 'Enabled for pure guard test only.',
    };
    const preflight = createRealReadOnlyAdapterGuardPreflight({
      config: enabledConfig,
      dryRunPlan: plan,
      policyDecision,
      approvalArtifact,
      expectedDryRunPlanHash: approvalArtifact.dryRunPlanHash,
      expectedPolicyDecisionHash: approvalArtifact.policyDecisionHash,
      worktree: { isolated: true, status: 'clean' },
      evidenceStoreReady: true,
      auditStoreReady: true,
      now: '2026-04-30T00:00:00.000Z',
    });
    const serialized = JSON.stringify(preflight);

    expect(preflight.status).toBe('passed');
    expect(preflight.boundaryPlan?.processBoundaryDeferred).toBe(true);
    expect(preflight.boundaryPlan?.noRunnableCommand).toBe(true);
    expect(preflight.boundaryPlan?.commandPreviewStored).toBe(false);
    expect(preflight.boundaryPlan?.argvStored).toBe(false);
    expect(preflight.boundaryPlan?.executablePathStored).toBe(false);
    expect(preflight.boundaryPlan?.shellSnippetStored).toBe(false);
    expect(preflight.boundaryPlan?.envPlanStored).toBe(false);
    expect(preflight.liveExecution).toBe(false);
    expect(preflight.externalProcessStarted).toBe(false);
    expect(preflight.executionDisabled).toBe(true);
    expect(serialized).not.toContain('"argv":');
    expect(serialized).not.toContain('"executablePath":');
    expect(serialized).not.toContain('"shellSnippet":');
    expect(serialized).not.toContain('"envPlan":');
  });

  it('rejects conditional readiness ADR draft review for blocked packages', () => {
    const packageRecord = buildRealReadOnlyAdapterReadinessPackage({
      dryRunId: 'codex_dry_run_blocked_review',
      skeletonPreview: createReadOnlyAdapterSkeletonPreview(),
      symlinkEscapeVerified: false,
      evidenceStoreReady: true,
      auditStoreReady: true,
    });
    const validation = validateRealReadOnlyAdapterReadinessReviewDecision({
      packageRecord,
      outcome: 'conditional_go_to_separate_adr_draft',
      rationaleSummary:
        'Acknowledges symlink_escape_verification_pending and documented_only_3tw_evidence.',
    });

    expect(packageRecord.status).toBe('blocked');
    expect(validation.valid).toBe(false);
    expect(validation.reason).toContain('not allowed');
  });

  it('marks readiness ready only when hard gates pass and symlink verification is complete', async () => {
    const governanceDecision = createReadOnlyAdapterImplementationPlanReviewDecisionRecord({
      outcome: 'conditional_go_to_disabled_skeleton',
      reviewerLabel: 'local-operator',
    });
    const skeletonPreview = createReadOnlyAdapterSkeletonPreview();
    const skeletonReview = createReadOnlyAdapterSkeletonReviewDecisionRecord({
      preview: skeletonPreview,
      outcome: 'skeleton_accepted_for_fixture_boundary_only',
      reviewerLabel: 'local-operator',
    });
    const fixtureBoundary = await runReadOnlyAdapterFixtureBoundary({
      fixturePath: 'packages/codex-kernel/fixtures/codex-exec-basic.jsonl',
      fixtureText: readFixture('codex-exec-basic.jsonl'),
      dryRunId: 'codex_dry_run_ready',
    });
    const finalReadiness = createReadOnlyAdapterFinalReadinessDecisionRecord({
      skeletonPreview,
      skeletonReview,
      fixtureBoundary,
      outcome: 'ready_for_separate_read_only_adapter_adr',
      reviewerLabel: 'local-operator',
    });
    const packageRecord = buildRealReadOnlyAdapterReadinessPackage({
      dryRunId: 'codex_dry_run_ready',
      governanceDecision,
      skeletonPreview,
      skeletonReview,
      fixtureBoundary,
      finalReadiness,
      symlinkEscapeVerified: true,
      approvalReadinessReady: true,
      worktreeReadinessReady: true,
      evidenceStoreReady: true,
      auditStoreReady: true,
      operatorChecklistComplete: true,
      postRunVerificationReady: true,
    });
    const summary = summarizeRealReadOnlyAdapterReadinessPackage(packageRecord);
    const evidenceRefs = createRealReadOnlyAdapterReadinessEvidenceRefs(packageRecord);
    const auditEvents = createRealReadOnlyAdapterReadinessAuditEvents(packageRecord, evidenceRefs);

    expect(packageRecord.status).toBe('ready_for_separate_adr');
    expect(packageRecord.blockers).toHaveLength(0);
    expect(packageRecord.findings).toHaveLength(0);
    expect(packageRecord.implementationApproved).toBe(false);
    expect(packageRecord.processAdapterApproved).toBe(false);
    expect(packageRecord.recommendationGrantsExecution).toBe(false);
    expect(summary.status).toBe('ready_for_separate_adr');
    expect(summary.implementationApproved).toBe(false);
    expect(evidenceRefs[0]?.kind).toBe('codex.exec.real_read_only_adapter.readiness_package');
    expect(evidenceRefs[0]?.metadata?.bodyStored).toBe(false);
    expect(auditEvents[0]?.action).toBe(
      'codex.exec.real_read_only_adapter.readiness_package.created',
    );
    expect(auditEvents[0]?.metadata).toMatchObject({
      implementationApproved: false,
      processAdapterApproved: false,
      recommendationGrantsExecution: false,
    });
    expect(JSON.stringify(packageRecord)).not.toContain('full report markdown');
    expect(JSON.stringify(packageRecord)).not.toContain('synthetic stdout body');
    expect(JSON.stringify(packageRecord)).not.toContain('full command body');
  });
});

function createControlPlaneFixture(
  options: {
    sandboxMode?: 'read_only' | 'workspace_write' | 'danger_full_access';
    liveAdapterEnabled?: boolean;
  } = {},
) {
  const intent = createCodexExecExecutionIntent({
    title: 'Summarize repository structure',
    prompt: 'Summarize repository structure',
    sandboxMode: options.sandboxMode ?? 'read_only',
    liveAdapterEnabled: options.liveAdapterEnabled ?? false,
  });
  const plan = createCodexExecDryRunPlan(intent);
  const policyDecision = evaluateCodexExecDryRunPolicy(plan, {
    evaluateAction: (input) => ({
      id: 'policy_test',
      schemaVersion: '2026-04-28.foundation',
      createdAt: '2026-04-28T00:00:00.000Z',
      actionId: input.actionId,
      actionType: input.actionType,
      actionMode: input.actionMode,
      riskLevel: input.riskLevel ?? 'medium',
      outcome: 'allow',
      reasons: ['test policy'],
      requiresDryRun: true,
      requiresApproval: true,
      metadata: input.metadata,
    }),
  });

  return { intent, plan, policyDecision };
}

function createFullTimelineFixture() {
  const { plan, policyDecision } = createControlPlaneFixture();
  const config = createDefaultCodexExecLiveConfig();
  const preflightResult = runCodexExecPreflight(plan, config);
  const request = createCodexExecManualApprovalRequest(plan, policyDecision, config);
  const decision = createCodexExecManualApprovalDecision(request, {
    outcome: 'approved',
  });
  const approvalArtifact = createCodexExecApprovalArtifactFromDecision(
    plan,
    policyDecision,
    request,
    decision,
  );
  const approvalRecord = createCodexExecManualApprovalRecord({
    request,
    decision,
    approvalArtifact,
  });
  const executionGateResult = evaluateCodexExecExecutionGate(
    plan,
    policyDecision,
    approvalArtifact,
    config,
  );
  const record = {
    ...createCodexExecDisabledLiveRunRecord(plan, policyDecision, 'disabled for timeline test'),
    preflightResult,
    manualApprovalRequest: request,
    manualApprovalDecision: decision,
    manualApprovalRecord: approvalRecord,
    manualApprovalState: approvalRecord.approvalState,
    approvalArtifact,
    executionGateResult,
  };

  return { record, approvalRecord };
}

function readFixture(name: string): string {
  return readFileSync(join('fixtures', name), 'utf8');
}

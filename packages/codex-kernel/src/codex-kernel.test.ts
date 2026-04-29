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
  createCodexExecTimelineDetailView,
  createDefaultCodexExecLiveConfig,
  createDefaultCodexExecConfigLoadResult,
  createCodexExecManualApprovalDecision,
  createCodexExecManualApprovalRecord,
  createCodexExecManualApprovalRequest,
  evaluateCodexExecDryRunPolicy,
  evaluateCodexExecExecutionGate,
  evaluateCodexExecManualApprovalState,
  normalizeCodexExecEvent,
  parseCodexExecJsonl,
  parseCodexExecJsonlLine,
  parseCodexExecLiveConfigFile,
  createCodexReplayRecord,
  replayCodexExecFixture,
  runCodexExecPreflight,
  summarizeCodexExecReplay,
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

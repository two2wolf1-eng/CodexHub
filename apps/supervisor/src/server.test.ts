import { createHash } from 'node:crypto';
import { mkdtempSync, rmSync, symlinkSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { createDefaultCodexExecConfigLoadResult } from '@codexhub/codex-kernel';
import { createSqliteStore } from '@codexhub/store-sqlite';
import { buildSupervisorServer } from './server';

const symlinkEscapeFixturePath =
  'packages/codex-kernel/fixtures/codexhub-symlink-escape-test.jsonl';
const symlinkEscapeAbsolutePath = join(process.cwd(), ...symlinkEscapeFixturePath.split('/'));

function hashTestWorktreePath(worktreePath: string): string {
  return `sha256:${createHash('sha256').update(resolve(worktreePath).replace(/\\/g, '/')).digest('hex')}`;
}

afterEach(() => {
  rmSync(symlinkEscapeAbsolutePath, { force: true });
});

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
    const legacyApprovalArtifactResponse = await server.inject({
      method: 'POST',
      url: '/api/codex/exec/approval-artifact',
      payload: { dryRunId },
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
    const timelineResponse = await server.inject({
      method: 'GET',
      url: `/api/codex/exec/timeline/${dryRunId}`,
    });
    const filteredTimelineResponse = await server.inject({
      method: 'GET',
      url: `/api/codex/exec/timeline/${dryRunId}?source=approval&includeEvidence=false&includeAudit=false`,
    });
    const detailResponse = await server.inject({
      method: 'GET',
      url: `/api/codex/exec/timeline/${dryRunId}/detail?includeEvidence=true&includeAudit=true`,
    });
    const evidenceListResponse = await server.inject({
      method: 'GET',
      url: `/api/codex/exec/evidence?dryRunId=${dryRunId}&kind=codex.exec.dry_run_plan&limit=10`,
    });
    const evidenceId = evidenceListResponse.json().result.items[0].evidenceRefId as string;
    const evidenceDetailResponse = await server.inject({
      method: 'GET',
      url: `/api/codex/exec/evidence/${evidenceId}`,
    });
    const missingEvidenceResponse = await server.inject({
      method: 'GET',
      url: '/api/codex/exec/evidence/missing_evidence',
    });
    const auditListResponse = await server.inject({
      method: 'GET',
      url: `/api/codex/exec/audit?dryRunId=${dryRunId}&action=codex.exec.policy_evaluated&limit=10`,
    });
    const auditEventId = auditListResponse.json().result.items[0].auditEventId as string;
    const auditDetailResponse = await server.inject({
      method: 'GET',
      url: `/api/codex/exec/audit/${auditEventId}`,
    });
    const missingAuditResponse = await server.inject({
      method: 'GET',
      url: '/api/codex/exec/audit/missing_audit',
    });
    const drilldownResponse = await server.inject({
      method: 'GET',
      url: `/api/codex/exec/drilldown/${dryRunId}`,
    });
    const reportJsonResponse = await server.inject({
      method: 'GET',
      url: `/api/codex/exec/report/${dryRunId}?format=json&includeEvidence=true&includeAudit=true`,
    });
    const reportMarkdownResponse = await server.inject({
      method: 'GET',
      url: `/api/codex/exec/report/${dryRunId}?format=markdown&includeEvidence=false&includeAudit=false`,
    });
    const missingReportResponse = await server.inject({
      method: 'GET',
      url: '/api/codex/exec/report/missing_dry_run?format=markdown',
    });
    const invalidReportResponse = await server.inject({
      method: 'GET',
      url: `/api/codex/exec/report/${dryRunId}?format=txt`,
    });
    const reportReviewResponse = await server.inject({
      method: 'POST',
      url: '/api/codex/exec/report-review',
      payload: {
        dryRunId,
        reviewerLabel: 'local-operator',
        status: 'reviewed',
        recommendation: 'ready_for_adr',
        notesSummary: 'No-live boundary intact; live adapter still requires ADR.',
      },
    });
    const canonicalDryRunPlanId = dryRunResponse.json().liveRunRecord.dryRunPlanId as string;
    const reportReviewId = reportReviewResponse.json().reviewRecord.id as string;
    const reportReviewSecondResponse = await server.inject({
      method: 'POST',
      url: '/api/codex/exec/report-review',
      payload: {
        dryRunId,
        reviewerLabel: 'second-reviewer',
        status: 'changes_requested',
        recommendation: 'needs_changes',
        notesSummary: 'Metadata-only follow-up review requested changes.',
      },
    });
    const reportReviewSecondId = reportReviewSecondResponse.json().reviewRecord.id as string;
    const reportReviewGetResponse = await server.inject({
      method: 'GET',
      url: `/api/codex/exec/report-review/${reportReviewId}`,
    });
    const reportReviewListResponse = await server.inject({
      method: 'GET',
      url: `/api/codex/exec/report-reviews?dryRunId=${canonicalDryRunPlanId}&status=reviewed&recommendation=ready_for_adr&limit=10`,
    });
    const reportReviewLatestResponse = await server.inject({
      method: 'GET',
      url: `/api/codex/exec/report-reviews/latest/${canonicalDryRunPlanId}`,
    });
    const reportReviewHistoryResponse = await server.inject({
      method: 'GET',
      url: `/api/codex/exec/report-reviews/history?dryRunId=${canonicalDryRunPlanId}&limit=10`,
    });
    const reportReviewCompareResponse = await server.inject({
      method: 'GET',
      url: `/api/codex/exec/report-reviews/compare?leftReviewId=${reportReviewId}&rightReviewId=${reportReviewSecondId}`,
    });
    const reportReviewHandoffResponse = await server.inject({
      method: 'GET',
      url: `/api/codex/exec/report-reviews/handoff/${canonicalDryRunPlanId}?fromReviewer=local-operator&toReviewer=second-reviewer`,
    });
    const governancePackageResponse = await server.inject({
      method: 'GET',
      url: `/api/codex/exec/governance-package/${canonicalDryRunPlanId}?includeEvidence=true&includeAudit=false`,
    });
    const missingGovernancePackageResponse = await server.inject({
      method: 'GET',
      url: '/api/codex/exec/governance-package/missing_dry_run',
    });
    const adrDraftJsonResponse = await server.inject({
      method: 'GET',
      url: `/api/codex/exec/adr-draft/${canonicalDryRunPlanId}?format=json&includeEvidence=true&includeAudit=false`,
    });
    const adrDraftMarkdownResponse = await server.inject({
      method: 'GET',
      url: `/api/codex/exec/adr-draft/${canonicalDryRunPlanId}?format=markdown&includeEvidence=false&includeAudit=false`,
    });
    const missingAdrDraftResponse = await server.inject({
      method: 'GET',
      url: '/api/codex/exec/adr-draft/missing_dry_run?format=markdown',
    });
    const adrDecisionCreateResponse = await server.inject({
      method: 'POST',
      url: '/api/codex/exec/live-adapter-adr-decision',
      payload: {
        dryRunId: canonicalDryRunPlanId,
        reviewerLabel: 'local-operator',
        rationaleSummary:
          'Conditional read-only design is allowed; implementation remains unapproved.',
      },
    });
    const adrDecisionId = adrDecisionCreateResponse.json().decisionRecord.id as string;
    const adrDecisionGetResponse = await server.inject({
      method: 'GET',
      url: `/api/codex/exec/live-adapter-adr-decision/${adrDecisionId}`,
    });
    const adrDecisionListResponse = await server.inject({
      method: 'GET',
      url: `/api/codex/exec/live-adapter-adr-decisions?dryRunId=${canonicalDryRunPlanId}&status=recorded&decision=conditional_read_only_go&limit=10`,
    });
    const adrDecisionLatestResponse = await server.inject({
      method: 'GET',
      url: `/api/codex/exec/live-adapter-adr-decision/latest/${canonicalDryRunPlanId}`,
    });
    const missingAdrDecisionResponse = await server.inject({
      method: 'GET',
      url: '/api/codex/exec/live-adapter-adr-decision/missing_decision',
    });
    const missingAdrDecisionLatestResponse = await server.inject({
      method: 'GET',
      url: '/api/codex/exec/live-adapter-adr-decision/latest/missing_dry_run',
    });
    const invalidAdrDecisionQueryResponse = await server.inject({
      method: 'GET',
      url: `/api/codex/exec/live-adapter-adr-decisions?dryRunId=${canonicalDryRunPlanId}&decision=execute_now`,
    });
    const readOnlyPreflightSimulationResponse = await server.inject({
      method: 'POST',
      url: '/api/codex/exec/read-only-adapter/preflight-simulate',
      payload: {
        dryRunId: canonicalDryRunPlanId,
        isolatedWorktreePresent: true,
        evidenceStoreReady: true,
        auditStoreReady: true,
        checklistComplete: true,
      },
    });
    const blockedReadOnlyPreflightSimulationResponse = await server.inject({
      method: 'POST',
      url: '/api/codex/exec/read-only-adapter/preflight-simulate',
      payload: {
        dryRunId: canonicalDryRunPlanId,
        requestedSandboxMode: 'workspace_write',
        workspaceWriteRequested: true,
        isolatedWorktreePresent: true,
        evidenceStoreReady: true,
        auditStoreReady: true,
        checklistComplete: true,
      },
    });
    const readOnlyPreflightSimulationListResponse = await server.inject({
      method: 'GET',
      url: '/api/codex/exec/read-only-adapter/preflight-simulations?limit=10',
    });
    const readOnlySimulatorReviewCreateResponse = await server.inject({
      method: 'POST',
      url: '/api/codex/exec/read-only-adapter/simulator-review',
      payload: {
        dryRunId: canonicalDryRunPlanId,
        reviewerLabel: 'local-operator',
        outcome: 'go_to_implementation_planning',
        rationaleSummary:
          'Simulator review allows Round 3R planning only; implementation remains unapproved.',
      },
    });
    const readOnlySimulatorReviewId = readOnlySimulatorReviewCreateResponse.json().reviewRecord
      .id as string;
    const readOnlySimulatorReviewGetResponse = await server.inject({
      method: 'GET',
      url: `/api/codex/exec/read-only-adapter/simulator-review/${readOnlySimulatorReviewId}`,
    });
    const readOnlySimulatorReviewListResponse = await server.inject({
      method: 'GET',
      url: `/api/codex/exec/read-only-adapter/simulator-reviews?dryRunId=${canonicalDryRunPlanId}&status=recorded&outcome=go_to_implementation_planning&limit=10`,
    });
    const readOnlySimulatorReviewLatestResponse = await server.inject({
      method: 'GET',
      url: `/api/codex/exec/read-only-adapter/simulator-review/latest/${canonicalDryRunPlanId}`,
    });
    const implementationPlanReviewCreateResponse = await server.inject({
      method: 'POST',
      url: '/api/codex/exec/read-only-adapter/implementation-plan-review',
      payload: {
        outcome: 'conditional_go_to_disabled_skeleton',
        reviewerLabel: 'local-operator',
        rationaleSummary:
          'Allows only Round 3T disabled-by-default skeleton; execution remains unapproved.',
      },
    });
    const implementationPlanReviewId = implementationPlanReviewCreateResponse.json().reviewRecord
      .id as string;
    const implementationPlanReviewGetResponse = await server.inject({
      method: 'GET',
      url: `/api/codex/exec/read-only-adapter/implementation-plan-review/${implementationPlanReviewId}`,
    });
    const implementationPlanReviewListResponse = await server.inject({
      method: 'GET',
      url: '/api/codex/exec/read-only-adapter/implementation-plan-reviews?status=recorded&outcome=conditional_go_to_disabled_skeleton&limit=10',
    });
    const implementationPlanReviewLatestResponse = await server.inject({
      method: 'GET',
      url: '/api/codex/exec/read-only-adapter/implementation-plan-review/latest',
    });
    const implementationPlanReviewMissingResponse = await server.inject({
      method: 'GET',
      url: '/api/codex/exec/read-only-adapter/implementation-plan-review/missing_review',
    });
    const implementationPlanReviewInvalidOutcomeResponse = await server.inject({
      method: 'POST',
      url: '/api/codex/exec/read-only-adapter/implementation-plan-review',
      payload: {
        outcome: 'execute_now',
      },
    });
    const implementationPlanReviewMissingOutcomeResponse = await server.inject({
      method: 'POST',
      url: '/api/codex/exec/read-only-adapter/implementation-plan-review',
      payload: {},
    });
    const missingReadOnlySimulatorReviewGetResponse = await server.inject({
      method: 'GET',
      url: '/api/codex/exec/read-only-adapter/simulator-review/missing_review',
    });
    const invalidReadOnlySimulatorReviewQueryResponse = await server.inject({
      method: 'GET',
      url: `/api/codex/exec/read-only-adapter/simulator-reviews?dryRunId=${canonicalDryRunPlanId}&outcome=execute_now`,
    });
    const readOnlySimulatorReviewMissingIdResponse = await server.inject({
      method: 'POST',
      url: '/api/codex/exec/read-only-adapter/simulator-review',
      payload: {},
    });
    const dryRunWithoutSimulationResponse = await server.inject({
      method: 'POST',
      url: '/api/codex/exec/dry-run',
      payload: {
        title: 'Dry-run without simulator result',
        prompt: 'Summarize repository structure only',
        cwd: '.',
        sandboxMode: 'read_only',
        approvalMode: 'required',
      },
    });
    const missingReadOnlySimulatorReviewSimulationResponse = await server.inject({
      method: 'POST',
      url: '/api/codex/exec/read-only-adapter/simulator-review',
      payload: {
        dryRunId: dryRunWithoutSimulationResponse.json().liveRunRecord.dryRunPlanId,
      },
    });
    const missingReadOnlyPreflightSimulationDryRunResponse = await server.inject({
      method: 'POST',
      url: '/api/codex/exec/read-only-adapter/preflight-simulate',
      payload: { dryRunId: 'missing_dry_run' },
    });
    const missingReadOnlyPreflightSimulationIdResponse = await server.inject({
      method: 'POST',
      url: '/api/codex/exec/read-only-adapter/preflight-simulate',
      payload: {},
    });
    const missingReportReviewResponse = await server.inject({
      method: 'GET',
      url: '/api/codex/exec/report-review/missing_review',
    });
    const missingReportReviewLatestResponse = await server.inject({
      method: 'GET',
      url: '/api/codex/exec/report-reviews/latest/missing_dry_run',
    });
    const invalidReportReviewHistoryResponse = await server.inject({
      method: 'GET',
      url: `/api/codex/exec/report-reviews/history?dryRunId=${canonicalDryRunPlanId}&status=unsupported`,
    });
    const invalidTimelineResponse = await server.inject({
      method: 'GET',
      url: `/api/codex/exec/timeline/${dryRunId}?source=unsupported`,
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
        outcome: 'approval_required',
      },
      liveRunRecord: {
        status: 'awaiting_approval',
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
      liveEnabled: true,
      allowedSandboxModes: ['read_only'],
    });
    expect(preflightResponse.statusCode).toBe(200);
    expect(preflightResponse.json()).toMatchObject({
      preflightResult: {
        status: 'passed',
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
          liveEnabled: true,
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
    expect(legacyApprovalArtifactResponse.statusCode).toBe(410);
    expect(legacyApprovalArtifactResponse.json()).toMatchObject({
      strategy: 'deprecated-gone',
      liveExecution: false,
      externalProcessStarted: false,
      executionDisabled: true,
    });
    expect(legacyApprovalArtifactResponse.json().approvalArtifact).toBeUndefined();
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
        status: 'ready',
        liveExecution: false,
        externalProcessStarted: false,
        executionDisabled: true,
      },
    });
    expect(gateResponse.json().executionGateResult.reasons).toEqual([]);
    expect(timelineResponse.statusCode).toBe(200);
    expect(timelineResponse.json()).toMatchObject({
      timeline: {
        status: 'gate_ready',
        liveExecution: false,
        externalProcessStarted: false,
        executionDisabled: true,
      },
      liveExecution: false,
      externalProcessStarted: false,
      executionDisabled: true,
    });
    const timelineEvents = timelineResponse
      .json()
      .timeline.events.map((event: { eventType: string }) => event.eventType);
    expect(timelineEvents.indexOf('codex.exec.dry_run.created')).toBeLessThan(
      timelineEvents.indexOf('codex.exec.policy.evaluated'),
    );
    expect(timelineEvents).toContain('codex.exec.approval.state_evaluated');
    expect(timelineEvents).toContain('codex.exec.gate.evaluated');
    expect(
      timelineResponse
        .json()
        .timeline.events.every(
          (event: {
            liveExecution: boolean;
            externalProcessStarted: boolean;
            executionDisabled: boolean;
          }) =>
            event.liveExecution === false &&
            event.externalProcessStarted === false &&
            event.executionDisabled === true,
        ),
    ).toBe(true);
    expect(filteredTimelineResponse.statusCode).toBe(200);
    expect(
      filteredTimelineResponse
        .json()
        .timeline.events.every((event: { sourceKind: string }) =>
          event.sourceKind.startsWith('approval_'),
        ),
    ).toBe(true);
    expect(
      filteredTimelineResponse
        .json()
        .timeline.events.some(
          (event: { sourceKind: string }) =>
            event.sourceKind === 'evidence' || event.sourceKind === 'audit',
        ),
    ).toBe(false);
    expect(detailResponse.statusCode).toBe(200);
    expect(detailResponse.json()).toMatchObject({
      detail: {
        dryRunId: dryRunResponse.json().liveRunRecord.dryRunPlanId,
        latestGateStatus: 'ready',
        approvalStatus: 'approved',
        evidenceSummary: {
          metadataOnly: true,
          bodyStored: false,
        },
        auditSummary: {
          metadataOnly: true,
          bodyStored: false,
        },
        liveExecution: false,
        externalProcessStarted: false,
        executionDisabled: true,
      },
      liveExecution: false,
      externalProcessStarted: false,
      executionDisabled: true,
    });
    expect(JSON.stringify(detailResponse.json())).not.toContain('list risk areas');
    expect(JSON.stringify(detailResponse.json())).not.toContain('manual private reason');
    expect(evidenceListResponse.statusCode).toBe(200);
    expect(evidenceListResponse.json()).toMatchObject({
      result: {
        count: 1,
        items: [
          {
            status: 'found',
            kind: 'codex.exec.dry_run_plan',
            metadataOnly: true,
            bodyStored: false,
          },
        ],
      },
      liveExecution: false,
      externalProcessStarted: false,
      executionDisabled: true,
    });
    expect(evidenceDetailResponse.statusCode).toBe(200);
    expect(evidenceDetailResponse.json()).toMatchObject({
      detail: {
        status: 'found',
        evidenceRefId: evidenceId,
        metadataOnly: true,
        bodyStored: false,
      },
      liveExecution: false,
      externalProcessStarted: false,
      executionDisabled: true,
    });
    expect(JSON.stringify(evidenceDetailResponse.json())).not.toContain('list risk areas');
    expect(missingEvidenceResponse.statusCode).toBe(404);
    expect(missingEvidenceResponse.body).not.toContain(process.cwd());
    expect(auditListResponse.statusCode).toBe(200);
    expect(auditListResponse.json()).toMatchObject({
      result: {
        count: 1,
        items: [
          {
            status: 'found',
            action: 'codex.exec.policy_evaluated',
            metadataOnly: true,
            bodyStored: false,
          },
        ],
      },
      liveExecution: false,
      externalProcessStarted: false,
      executionDisabled: true,
    });
    expect(auditDetailResponse.statusCode).toBe(200);
    expect(auditDetailResponse.json()).toMatchObject({
      detail: {
        status: 'found',
        auditEventId,
        metadataOnly: true,
        bodyStored: false,
      },
      liveExecution: false,
      externalProcessStarted: false,
      executionDisabled: true,
    });
    expect(JSON.stringify(auditDetailResponse.json())).not.toContain('manual private reason');
    expect(missingAuditResponse.statusCode).toBe(404);
    expect(missingAuditResponse.body).not.toContain(process.cwd());
    expect(drilldownResponse.statusCode).toBe(200);
    expect(drilldownResponse.json()).toMatchObject({
      drilldown: {
        status: 'found',
        metadataOnly: true,
        bodyStored: false,
        liveExecution: false,
        externalProcessStarted: false,
        executionDisabled: true,
      },
      liveExecution: false,
      externalProcessStarted: false,
      executionDisabled: true,
    });
    expect(drilldownResponse.json().drilldown.evidenceCount).toBeGreaterThan(0);
    expect(drilldownResponse.json().drilldown.auditEventCount).toBeGreaterThan(0);
    expect(JSON.stringify(drilldownResponse.json())).not.toContain('manual private reason');
    expect(reportJsonResponse.statusCode).toBe(200);
    expect(reportJsonResponse.json()).toMatchObject({
      report: {
        status: 'found',
        summary: {
          evidenceCount: expect.any(Number),
          auditEventCount: expect.any(Number),
        },
        liveExecution: false,
        externalProcessStarted: false,
        executionDisabled: true,
      },
      exportResult: {
        format: 'json',
        liveExecution: false,
        externalProcessStarted: false,
        executionDisabled: true,
      },
    });
    expect(
      reportJsonResponse.json().report.sections.map((section: { kind: string }) => section.kind),
    ).toEqual([
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
    expect(JSON.stringify(reportJsonResponse.json())).not.toContain('manual private reason');
    expect(JSON.stringify(reportJsonResponse.json())).not.toContain('list risk areas');
    expect(reportMarkdownResponse.statusCode).toBe(200);
    expect(reportMarkdownResponse.json()).toMatchObject({
      report: {
        status: 'found',
        summary: {
          evidenceCount: 0,
          auditEventCount: 0,
        },
      },
      exportResult: {
        format: 'markdown',
      },
      liveExecution: false,
      externalProcessStarted: false,
      executionDisabled: true,
    });
    expect(reportMarkdownResponse.json().renderedContent).toContain('# Codex Control-plane Report');
    expect(reportMarkdownResponse.json().renderedContent).toContain('liveExecution=false');
    expect(missingReportResponse.statusCode).toBe(404);
    expect(missingReportResponse.body).not.toContain(process.cwd());
    expect(invalidReportResponse.statusCode).toBe(400);
    expect(reportReviewResponse.statusCode).toBe(200);
    expect(reportReviewResponse.json()).toMatchObject({
      reviewRecord: {
        dryRunId: canonicalDryRunPlanId,
        status: 'reviewed',
        recommendation: 'ready_for_adr',
        recommendationGrantsExecution: false,
        metadataOnly: true,
        bodyStored: false,
        liveExecution: false,
        externalProcessStarted: false,
        executionDisabled: true,
      },
      summary: {
        recommendationGrantsExecution: false,
      },
      liveExecution: false,
      externalProcessStarted: false,
      executionDisabled: true,
    });
    expect(JSON.stringify(reportReviewResponse.json())).not.toContain('manual private reason');
    expect(JSON.stringify(reportReviewResponse.json())).not.toContain('list risk areas');
    expect(reportReviewGetResponse.statusCode).toBe(200);
    expect(reportReviewGetResponse.json().reviewRecord.id).toBe(reportReviewId);
    expect(reportReviewListResponse.statusCode).toBe(200);
    expect(reportReviewListResponse.json().reviews).toHaveLength(1);
    expect(reportReviewListResponse.json().summaries[0]).toMatchObject({
      reviewId: reportReviewId,
      recommendationGrantsExecution: false,
    });
    expect(reportReviewSecondResponse.statusCode).toBe(200);
    expect(reportReviewLatestResponse.statusCode).toBe(200);
    expect(reportReviewLatestResponse.json()).toMatchObject({
      reviewRecord: {
        id: reportReviewSecondId,
        dryRunId: canonicalDryRunPlanId,
        recommendationGrantsExecution: false,
        liveExecution: false,
        externalProcessStarted: false,
        executionDisabled: true,
      },
      liveExecution: false,
      externalProcessStarted: false,
      executionDisabled: true,
    });
    expect(reportReviewHistoryResponse.statusCode).toBe(200);
    expect(reportReviewHistoryResponse.json()).toMatchObject({
      history: {
        dryRunId: canonicalDryRunPlanId,
        historyCount: 2,
        recommendationGrantsExecution: false,
        liveExecution: false,
        externalProcessStarted: false,
        executionDisabled: true,
      },
      liveExecution: false,
      externalProcessStarted: false,
      executionDisabled: true,
    });
    expect(reportReviewHistoryResponse.json().history.comparison.changedItemCount).toBeGreaterThan(
      0,
    );
    expect(reportReviewCompareResponse.statusCode).toBe(200);
    expect(reportReviewCompareResponse.json()).toMatchObject({
      comparison: {
        leftReviewId: reportReviewId,
        rightReviewId: reportReviewSecondId,
        comparable: true,
        recommendationGrantsExecution: false,
        liveExecution: false,
        externalProcessStarted: false,
        executionDisabled: true,
      },
      liveExecution: false,
      externalProcessStarted: false,
      executionDisabled: true,
    });
    expect(reportReviewCompareResponse.json().comparison.changedItemCount).toBeGreaterThan(0);
    expect(JSON.stringify(reportReviewCompareResponse.json())).not.toContain('list risk areas');
    expect(reportReviewHandoffResponse.statusCode).toBe(200);
    expect(reportReviewHandoffResponse.json()).toMatchObject({
      handoff: {
        dryRunId: canonicalDryRunPlanId,
        fromReviewer: 'local-operator',
        toReviewer: 'second-reviewer',
        recommendationGrantsExecution: false,
        liveExecution: false,
        externalProcessStarted: false,
        executionDisabled: true,
      },
      liveExecution: false,
      externalProcessStarted: false,
      executionDisabled: true,
    });
    expect(reportReviewHandoffResponse.json().handoff.handoffSummary).toContain(
      'does not grant execution',
    );
    expect(governancePackageResponse.statusCode).toBe(200);
    expect(governancePackageResponse.json()).toMatchObject({
      governancePackage: {
        dryRunId: canonicalDryRunPlanId,
        recommendationGrantsExecution: false,
        liveExecution: false,
        externalProcessStarted: false,
        executionDisabled: true,
        query: {
          includeEvidence: true,
          includeAudit: false,
        },
        noLiveEvidence: {
          noRealCodexExec: true,
          noExternalProcessStarted: true,
          noBrowserOrCdpAction: true,
          noWorkspaceWrite: true,
          noExecutionApprovalGranted: true,
        },
        summary: {
          recommendationGrantsExecution: false,
        },
      },
      recommendationGrantsExecution: false,
      liveExecution: false,
      externalProcessStarted: false,
      executionDisabled: true,
    });
    expect(
      governancePackageResponse
        .json()
        .governancePackage.adrReadinessChecklist.map((item: { code: string }) => item.code),
    ).toContain('live_adapter_requires_separate_adr');
    expect(JSON.stringify(governancePackageResponse.json())).not.toContain('list risk areas');
    expect(missingGovernancePackageResponse.statusCode).toBe(404);
    expect(missingGovernancePackageResponse.json()).toMatchObject({
      governancePackage: {
        status: 'not_found',
        recommendation: 'no_go',
        recommendationGrantsExecution: false,
      },
      liveExecution: false,
      externalProcessStarted: false,
      executionDisabled: true,
    });
    expect(missingGovernancePackageResponse.body).not.toContain(process.cwd());
    expect(adrDraftJsonResponse.statusCode).toBe(200);
    expect(adrDraftJsonResponse.json()).toMatchObject({
      adrDraft: {
        dryRunId: canonicalDryRunPlanId,
        format: 'json',
        recommendationGrantsExecution: false,
        metadataOnly: true,
        bodyStored: false,
        draftOnly: true,
        liveExecution: false,
        externalProcessStarted: false,
        executionDisabled: true,
        query: {
          includeEvidence: true,
          includeAudit: false,
        },
      },
      exportResult: {
        format: 'json',
        recommendationGrantsExecution: false,
        draftOnly: true,
        liveExecution: false,
        externalProcessStarted: false,
        executionDisabled: true,
      },
      liveExecution: false,
      externalProcessStarted: false,
      executionDisabled: true,
    });
    expect(
      adrDraftJsonResponse
        .json()
        .adrDraft.sections.map((section: { kind: string }) => section.kind),
    ).toEqual([
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
    expect(JSON.stringify(adrDraftJsonResponse.json())).not.toContain('list risk areas');
    expect(adrDraftMarkdownResponse.statusCode).toBe(200);
    expect(adrDraftMarkdownResponse.json()).toMatchObject({
      adrDraft: {
        format: 'markdown',
        query: {
          includeEvidence: false,
          includeAudit: false,
        },
      },
      exportResult: {
        format: 'markdown',
      },
    });
    expect(adrDraftMarkdownResponse.json().renderedContent).toContain(
      '# ADR Draft: Codex control\\-plane live adapter readiness',
    );
    expect(adrDraftMarkdownResponse.json().renderedContent).toContain('does not grant execution');
    expect(adrDraftMarkdownResponse.json().renderedContent).not.toContain('execution approval');
    expect(missingAdrDraftResponse.statusCode).toBe(404);
    expect(missingAdrDraftResponse.json()).toMatchObject({
      adrDraft: {
        status: 'not_found',
        recommendation: 'no_go',
        recommendationGrantsExecution: false,
        draftOnly: true,
      },
      liveExecution: false,
      externalProcessStarted: false,
      executionDisabled: true,
    });
    expect(missingAdrDraftResponse.body).not.toContain(process.cwd());
    expect(adrDecisionCreateResponse.statusCode).toBe(200);
    expect(adrDecisionCreateResponse.json()).toMatchObject({
      decisionRecord: {
        dryRunId: canonicalDryRunPlanId,
        decision: 'conditional_read_only_go',
        status: 'recorded',
        allowedSandboxModes: ['read_only'],
        forbiddenSandboxModes: ['workspace_write', 'danger_full_access'],
        futureTriggerPolicy: 'cli_only',
        dashboardTriggerAllowed: false,
        implementationApproved: false,
        processAdapterApproved: false,
        recommendationGrantsExecution: false,
        metadataOnly: true,
        bodyStored: false,
        liveExecution: false,
        externalProcessStarted: false,
        executionDisabled: true,
        gatePolicy: {
          dryRunPlanHashMatchRequired: true,
          policyDecisionHashMatchRequired: true,
          isolatedWorktreeRequired: true,
          postRunVerificationCommand: 'pnpm verify:foundation',
        },
      },
      summary: {
        decision: 'conditional_read_only_go',
        implementationApproved: false,
        processAdapterApproved: false,
        recommendationGrantsExecution: false,
      },
      implementationApproved: false,
      processAdapterApproved: false,
      recommendationGrantsExecution: false,
      liveExecution: false,
      externalProcessStarted: false,
      executionDisabled: true,
    });
    expect(adrDecisionCreateResponse.json().evidenceRefs).toHaveLength(1);
    expect(adrDecisionCreateResponse.json().auditEvents).toHaveLength(1);
    expect(JSON.stringify(adrDecisionCreateResponse.json())).not.toContain('list risk areas');
    expect(adrDecisionGetResponse.statusCode).toBe(200);
    expect(adrDecisionGetResponse.json().decisionRecord.id).toBe(adrDecisionId);
    expect(adrDecisionGetResponse.json()).toMatchObject({
      implementationApproved: false,
      processAdapterApproved: false,
      recommendationGrantsExecution: false,
      liveExecution: false,
      externalProcessStarted: false,
      executionDisabled: true,
    });
    expect(adrDecisionListResponse.statusCode).toBe(200);
    expect(adrDecisionListResponse.json().records).toHaveLength(1);
    expect(adrDecisionListResponse.json().decisions[0]).toMatchObject({
      decisionId: adrDecisionId,
      implementationApproved: false,
      processAdapterApproved: false,
      recommendationGrantsExecution: false,
    });
    expect(adrDecisionLatestResponse.statusCode).toBe(200);
    expect(adrDecisionLatestResponse.json()).toMatchObject({
      decisionRecord: {
        id: adrDecisionId,
        dashboardTriggerAllowed: false,
        implementationApproved: false,
        processAdapterApproved: false,
        recommendationGrantsExecution: false,
      },
      liveExecution: false,
      externalProcessStarted: false,
      executionDisabled: true,
    });
    expect(missingAdrDecisionResponse.statusCode).toBe(404);
    expect(missingAdrDecisionResponse.body).not.toContain(process.cwd());
    expect(missingAdrDecisionLatestResponse.statusCode).toBe(404);
    expect(missingAdrDecisionLatestResponse.body).not.toContain(process.cwd());
    expect(invalidAdrDecisionQueryResponse.statusCode).toBe(400);
    expect(readOnlyPreflightSimulationResponse.statusCode).toBe(200);
    expect(readOnlyPreflightSimulationResponse.json()).toMatchObject({
      simulationResult: {
        dryRunId: canonicalDryRunPlanId,
        status: 'passed',
        requestedSandboxMode: 'read_only',
        liveExecution: false,
        externalProcessStarted: false,
        executionDisabled: true,
        processAdapterStarted: false,
        implementationApproved: false,
        dashboardTriggerAllowed: false,
        recommendationGrantsExecution: false,
      },
      summary: {
        dryRunId: canonicalDryRunPlanId,
        liveExecution: false,
        externalProcessStarted: false,
        executionDisabled: true,
        processAdapterStarted: false,
        implementationApproved: false,
        dashboardTriggerAllowed: false,
      },
      liveExecution: false,
      externalProcessStarted: false,
      executionDisabled: true,
      processAdapterStarted: false,
      implementationApproved: false,
      dashboardTriggerAllowed: false,
    });
    expect(readOnlyPreflightSimulationResponse.json().evidenceRefs).toHaveLength(1);
    expect(readOnlyPreflightSimulationResponse.json().auditEvents).toHaveLength(1);
    expect(
      readOnlyPreflightSimulationResponse
        .json()
        .simulationResult.blockers.map((blocker: { code: string }) => blocker.code),
    ).not.toContain('config_explicit_enable_state');
    expect(JSON.stringify(readOnlyPreflightSimulationResponse.json())).not.toContain(
      'list risk areas',
    );
    expect(blockedReadOnlyPreflightSimulationResponse.statusCode).toBe(200);
    expect(blockedReadOnlyPreflightSimulationResponse.json()).toMatchObject({
      simulationResult: {
        status: 'blocked',
        requestedSandboxMode: 'workspace_write',
        liveExecution: false,
        externalProcessStarted: false,
        executionDisabled: true,
      },
    });
    expect(
      blockedReadOnlyPreflightSimulationResponse
        .json()
        .simulationResult.blockers.some(
          (blocker: { severity: string }) => blocker.severity === 'critical',
        ),
    ).toBe(true);
    expect(readOnlyPreflightSimulationListResponse.statusCode).toBe(200);
    expect(
      readOnlyPreflightSimulationListResponse.json().simulations.length,
    ).toBeGreaterThanOrEqual(2);
    expect(readOnlySimulatorReviewCreateResponse.statusCode).toBe(200);
    expect(readOnlySimulatorReviewCreateResponse.json()).toMatchObject({
      reviewRecord: {
        dryRunId: canonicalDryRunPlanId,
        outcome: 'go_to_implementation_planning',
        status: 'recorded',
        simulationStatus: 'blocked',
        implementationApproved: false,
        processAdapterApproved: false,
        recommendationGrantsExecution: false,
        liveExecution: false,
        externalProcessStarted: false,
        executionDisabled: true,
      },
      summary: {
        implementationApproved: false,
        processAdapterApproved: false,
        recommendationGrantsExecution: false,
      },
      liveExecution: false,
      externalProcessStarted: false,
      executionDisabled: true,
      processAdapterStarted: false,
      implementationApproved: false,
      processAdapterApproved: false,
      dashboardTriggerAllowed: false,
      recommendationGrantsExecution: false,
    });
    expect(readOnlySimulatorReviewCreateResponse.json().evidenceRefs).toHaveLength(1);
    expect(readOnlySimulatorReviewCreateResponse.json().auditEvents).toHaveLength(1);
    expect(JSON.stringify(readOnlySimulatorReviewCreateResponse.json())).not.toContain(
      'list risk areas',
    );
    expect(readOnlySimulatorReviewGetResponse.statusCode).toBe(200);
    expect(readOnlySimulatorReviewGetResponse.json().reviewRecord.id).toBe(
      readOnlySimulatorReviewId,
    );
    expect(readOnlySimulatorReviewListResponse.statusCode).toBe(200);
    expect(readOnlySimulatorReviewListResponse.json().records).toHaveLength(1);
    expect(readOnlySimulatorReviewListResponse.json().reviews[0]).toMatchObject({
      reviewId: readOnlySimulatorReviewId,
      outcome: 'go_to_implementation_planning',
      implementationApproved: false,
      processAdapterApproved: false,
      recommendationGrantsExecution: false,
    });
    expect(readOnlySimulatorReviewLatestResponse.statusCode).toBe(200);
    expect(readOnlySimulatorReviewLatestResponse.json()).toMatchObject({
      reviewRecord: {
        id: readOnlySimulatorReviewId,
        implementationApproved: false,
        processAdapterApproved: false,
        recommendationGrantsExecution: false,
      },
      liveExecution: false,
      externalProcessStarted: false,
      executionDisabled: true,
    });
    expect(implementationPlanReviewCreateResponse.statusCode).toBe(200);
    expect(implementationPlanReviewCreateResponse.json()).toMatchObject({
      reviewRecord: {
        outcome: 'conditional_go_to_disabled_skeleton',
        status: 'recorded',
        disabledSkeletonApproved: true,
        implementationApproved: false,
        processAdapterApproved: false,
        recommendationGrantsExecution: false,
        workspaceWriteAllowed: false,
        dangerFullAccessAllowed: false,
        liveExecution: false,
        externalProcessStarted: false,
        executionDisabled: true,
      },
      summary: {
        disabledSkeletonApproved: true,
        implementationApproved: false,
        processAdapterApproved: false,
        recommendationGrantsExecution: false,
      },
      liveExecution: false,
      externalProcessStarted: false,
      executionDisabled: true,
    });
    expect(implementationPlanReviewCreateResponse.json().evidenceRefs).toHaveLength(1);
    expect(implementationPlanReviewCreateResponse.json().auditEvents).toHaveLength(1);
    expect(JSON.stringify(implementationPlanReviewCreateResponse.json())).not.toContain(
      'list risk areas',
    );
    expect(implementationPlanReviewGetResponse.statusCode).toBe(200);
    expect(implementationPlanReviewGetResponse.json().reviewRecord.id).toBe(
      implementationPlanReviewId,
    );
    expect(implementationPlanReviewListResponse.statusCode).toBe(200);
    expect(implementationPlanReviewListResponse.json().records).toHaveLength(1);
    expect(implementationPlanReviewListResponse.json().reviews[0]).toMatchObject({
      reviewId: implementationPlanReviewId,
      outcome: 'conditional_go_to_disabled_skeleton',
      disabledSkeletonApproved: true,
      implementationApproved: false,
      processAdapterApproved: false,
      recommendationGrantsExecution: false,
    });
    expect(implementationPlanReviewLatestResponse.statusCode).toBe(200);
    expect(implementationPlanReviewLatestResponse.json()).toMatchObject({
      reviewRecord: {
        id: implementationPlanReviewId,
        disabledSkeletonApproved: true,
        implementationApproved: false,
        processAdapterApproved: false,
        recommendationGrantsExecution: false,
      },
      liveExecution: false,
      externalProcessStarted: false,
      executionDisabled: true,
    });
    expect(implementationPlanReviewMissingResponse.statusCode).toBe(404);
    expect(implementationPlanReviewMissingResponse.body).not.toContain(process.cwd());
    expect(implementationPlanReviewInvalidOutcomeResponse.statusCode).toBe(400);
    expect(implementationPlanReviewMissingOutcomeResponse.statusCode).toBe(400);
    expect(missingReadOnlySimulatorReviewGetResponse.statusCode).toBe(404);
    expect(missingReadOnlySimulatorReviewGetResponse.body).not.toContain(process.cwd());
    expect(invalidReadOnlySimulatorReviewQueryResponse.statusCode).toBe(400);
    expect(readOnlySimulatorReviewMissingIdResponse.statusCode).toBe(400);
    expect(missingReadOnlySimulatorReviewSimulationResponse.statusCode).toBe(404);
    expect(missingReadOnlySimulatorReviewSimulationResponse.body).not.toContain(process.cwd());
    expect(missingReadOnlyPreflightSimulationDryRunResponse.statusCode).toBe(404);
    expect(missingReadOnlyPreflightSimulationDryRunResponse.body).not.toContain(process.cwd());
    expect(missingReadOnlyPreflightSimulationIdResponse.statusCode).toBe(400);
    expect(missingReportReviewResponse.statusCode).toBe(404);
    expect(missingReportReviewResponse.body).not.toContain(process.cwd());
    expect(missingReportReviewLatestResponse.statusCode).toBe(404);
    expect(missingReportReviewLatestResponse.body).not.toContain(process.cwd());
    expect(invalidReportReviewHistoryResponse.statusCode).toBe(400);
    expect(invalidTimelineResponse.statusCode).toBe(400);
    expect(rejectedCwdResponse.statusCode).toBe(400);
  });

  it('keeps disabled skeleton and fixture-backed replay boundary read-only', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'codexhub-supervisor-read-only-adapter-'));
    const store = await createSqliteStore({ dbPath: join(dir, 'codexhub.sqlite') });
    const server = buildSupervisorServer({ store });

    const previewResponse = await server.inject({
      method: 'GET',
      url: '/api/codex/exec/read-only-adapter/skeleton-preview',
    });
    const reviewResponse = await server.inject({
      method: 'POST',
      url: '/api/codex/exec/read-only-adapter/skeleton-review',
      payload: {
        outcome: 'skeleton_accepted_for_fixture_boundary_only',
        reviewerLabel: 'local-operator',
        rationaleSummary: 'Fixture boundary only; execution remains unapproved.',
      },
    });
    const reviewId = reviewResponse.json().reviewRecord.id as string;
    const reviewGetResponse = await server.inject({
      method: 'GET',
      url: `/api/codex/exec/read-only-adapter/skeleton-review/${reviewId}`,
    });
    const reviewListResponse = await server.inject({
      method: 'GET',
      url: '/api/codex/exec/read-only-adapter/skeleton-reviews?status=recorded&outcome=skeleton_accepted_for_fixture_boundary_only&limit=10',
    });
    let symlinkEscapeAvailable = false;

    try {
      rmSync(symlinkEscapeAbsolutePath, { force: true });
      symlinkSync(join(process.cwd(), 'package.json'), symlinkEscapeAbsolutePath, 'file');
      symlinkEscapeAvailable = true;
    } catch {
      rmSync(symlinkEscapeAbsolutePath, { force: true });
    }

    const fixtureResponse = await server.inject({
      method: 'POST',
      url: '/api/codex/exec/read-only-adapter/fixture-boundary',
      payload: {
        fixturePath: 'packages/codex-kernel/fixtures/codex-exec-basic.jsonl',
      },
    });
    const rejectedFixturePayloads = [
      '../codex-exec-basic.jsonl',
      join(process.cwd(), 'packages', 'codex-kernel', 'fixtures', 'codex-exec-basic.jsonl'),
      'packages/codex-kernel/fixtures/codex-exec-basic.txt',
      'package.json',
      'packages/codex-kernel/fixtures/missing.jsonl',
    ];

    if (symlinkEscapeAvailable) {
      rejectedFixturePayloads.push(symlinkEscapeFixturePath);
    }

    const rejectedFixtureResponses = await Promise.all(
      rejectedFixturePayloads.map((fixturePath) =>
        server.inject({
          method: 'POST',
          url: '/api/codex/exec/read-only-adapter/fixture-boundary',
          payload: { fixturePath },
        }),
      ),
    );
    const fixtureListResponse = await server.inject({
      method: 'GET',
      url: '/api/codex/exec/read-only-adapter/fixture-boundaries',
    });
    const finalReadinessResponse = await server.inject({
      method: 'POST',
      url: '/api/codex/exec/read-only-adapter/final-readiness',
      payload: {
        outcome: 'ready_for_separate_read_only_adapter_adr',
        reviewerLabel: 'local-operator',
        rationaleSummary: 'Separate ADR remains required.',
      },
    });
    const finalReadinessListResponse = await server.inject({
      method: 'GET',
      url: '/api/codex/exec/read-only-adapter/final-readiness?status=recorded&outcome=ready_for_separate_read_only_adapter_adr&limit=10',
    });
    const finalReadinessLatestResponse = await server.inject({
      method: 'GET',
      url: '/api/codex/exec/read-only-adapter/final-readiness/latest',
    });

    await server.close();
    await store.close();

    expect(previewResponse.statusCode).toBe(200);
    expect(previewResponse.json()).toMatchObject({
      preview: {
        status: 'disabled',
        noRunnableCommand: true,
        commandPreviewStored: false,
        argvStored: false,
        executablePathStored: false,
        shellSnippetStored: false,
        envPlanStored: false,
        liveExecution: false,
        externalProcessStarted: false,
        executionDisabled: true,
        processAdapterStarted: false,
        processAdapterApproved: false,
        recommendationGrantsExecution: false,
      },
      liveExecution: false,
      externalProcessStarted: false,
      executionDisabled: true,
    });
    expect(reviewResponse.statusCode).toBe(200);
    expect(reviewResponse.json()).toMatchObject({
      reviewRecord: {
        outcome: 'skeleton_accepted_for_fixture_boundary_only',
        fixtureBoundaryAllowed: true,
        processAdapterApproved: false,
        recommendationGrantsExecution: false,
      },
      liveExecution: false,
      externalProcessStarted: false,
      executionDisabled: true,
    });
    expect(reviewGetResponse.statusCode).toBe(200);
    expect(reviewGetResponse.json().reviewRecord.id).toBe(reviewId);
    expect(reviewListResponse.statusCode).toBe(200);
    expect(reviewListResponse.json().records).toHaveLength(1);
    expect(fixtureResponse.statusCode).toBe(200);
    expect(fixtureResponse.json()).toMatchObject({
      result: {
        fixtureOnly: true,
        liveExecution: false,
        externalProcessStarted: false,
        executionDisabled: true,
        processAdapterStarted: false,
        processAdapterApproved: false,
      },
      liveExecution: false,
      externalProcessStarted: false,
      executionDisabled: true,
    });
    expect(fixtureResponse.json().evidenceRefs).toHaveLength(1);
    expect(fixtureResponse.json().auditEvents).toHaveLength(1);
    expect(fixtureResponse.json().result.auditEventIds).toEqual(
      fixtureResponse.json().auditEvents.map((event: { id: string }) => event.id),
    );
    expect(rejectedFixtureResponses.map((response) => response.statusCode)).toEqual(
      symlinkEscapeAvailable ? [400, 400, 400, 400, 404, 400] : [400, 400, 400, 400, 404],
    );
    expect(
      rejectedFixtureResponses.every((response) => !response.body.includes(process.cwd())),
    ).toBe(true);
    expect(fixtureListResponse.statusCode).toBe(200);
    expect(fixtureListResponse.json().summaries).toHaveLength(1);
    expect(finalReadinessResponse.statusCode).toBe(200);
    expect(finalReadinessResponse.json()).toMatchObject({
      decisionRecord: {
        outcome: 'ready_for_separate_read_only_adapter_adr',
        realAdapterRequiresSeparateAdr: true,
        currentRoundApprovesProcessStart: false,
        currentRoundApprovesCodexExecution: false,
        currentRoundApprovesWorkspaceWrites: false,
        processAdapterApproved: false,
        recommendationGrantsExecution: false,
      },
      liveExecution: false,
      externalProcessStarted: false,
      executionDisabled: true,
    });
    expect(finalReadinessListResponse.statusCode).toBe(200);
    expect(finalReadinessListResponse.json().records).toHaveLength(1);
    expect(finalReadinessLatestResponse.statusCode).toBe(200);
    expect(finalReadinessLatestResponse.json().decisionRecord.realAdapterRequiresSeparateAdr).toBe(
      true,
    );
    expect(JSON.stringify(fixtureResponse.json())).not.toContain('synthetic stdout body');
    expect(JSON.stringify(finalReadinessResponse.json())).not.toContain('full command body');
  });

  it('creates real read-only adapter readiness packages only with explicit 3S evidence', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'codexhub-supervisor-real-readiness-'));
    const store = await createSqliteStore({ dbPath: join(dir, 'codexhub.sqlite') });
    const server = buildSupervisorServer({ store });

    const dryRunResponse = await server.inject({
      method: 'POST',
      url: '/api/codex/exec/dry-run',
      payload: {
        title: 'Summarize repository structure',
        prompt: 'Summarize repository structure only',
        cwd: '.',
        sandboxMode: 'read_only',
        approvalMode: 'required',
      },
    });
    const dryRunId = dryRunResponse.json().liveRunRecord.dryRunPlanId as string;
    const missingDecisionResponse = await server.inject({
      method: 'POST',
      url: '/api/codex/exec/real-read-only-adapter/readiness-package',
      payload: { dryRunId },
    });

    await server.inject({
      method: 'POST',
      url: '/api/codex/exec/read-only-adapter/implementation-plan-review',
      payload: {
        outcome: 'conditional_go_to_disabled_skeleton',
        reviewerLabel: 'local-operator',
        rationaleSummary:
          'Allows only disabled skeleton scope; process adapter remains unapproved.',
      },
    });
    await server.inject({
      method: 'POST',
      url: '/api/codex/exec/read-only-adapter/skeleton-review',
      payload: {
        outcome: 'skeleton_accepted_for_fixture_boundary_only',
        reviewerLabel: 'local-operator',
        rationaleSummary: 'Fixture boundary only; process adapter remains unapproved.',
      },
    });

    const createResponse = await server.inject({
      method: 'POST',
      url: '/api/codex/exec/real-read-only-adapter/readiness-package',
      payload: { dryRunId },
    });
    const packageId = createResponse.json().package.id as string;
    const getResponse = await server.inject({
      method: 'GET',
      url: `/api/codex/exec/real-read-only-adapter/readiness-package/${packageId}`,
    });
    const listResponse = await server.inject({
      method: 'GET',
      url: `/api/codex/exec/real-read-only-adapter/readiness-packages?dryRunId=${dryRunId}&status=requires_review&limit=10`,
    });
    const latestResponse = await server.inject({
      method: 'GET',
      url: `/api/codex/exec/real-read-only-adapter/readiness-package/latest/${dryRunId}`,
    });
    const missingReviewPackageResponse = await server.inject({
      method: 'POST',
      url: '/api/codex/exec/real-read-only-adapter/readiness-review',
      payload: {
        packageId: 'missing_readiness_package',
        outcome: 'conditional_go_to_separate_adr_draft',
        reviewerLabel: 'local-operator',
        rationaleSummary:
          'Acknowledges symlink_escape_verification_pending and documented_only_3tw_evidence.',
      },
    });
    const invalidReviewResponse = await server.inject({
      method: 'POST',
      url: '/api/codex/exec/real-read-only-adapter/readiness-review',
      payload: {
        packageId,
        outcome: 'conditional_go_to_separate_adr_draft',
        reviewerLabel: 'local-operator',
        rationaleSummary: 'Looks acceptable for ADR drafting.',
      },
    });
    const validReviewResponse = await server.inject({
      method: 'POST',
      url: '/api/codex/exec/real-read-only-adapter/readiness-review',
      payload: {
        packageId,
        outcome: 'conditional_go_to_separate_adr_draft',
        reviewerLabel: 'local-operator',
        rationaleSummary:
          'Acknowledges symlink_escape_verification_pending and documented_only_3tw_evidence.',
      },
    });
    const reviewId = validReviewResponse.json().reviewRecord.id as string;
    const getReviewResponse = await server.inject({
      method: 'GET',
      url: `/api/codex/exec/real-read-only-adapter/readiness-review/${reviewId}`,
    });
    const listReviewsResponse = await server.inject({
      method: 'GET',
      url: `/api/codex/exec/real-read-only-adapter/readiness-reviews?packageId=${packageId}&outcome=conditional_go_to_separate_adr_draft&limit=10`,
    });
    const latestReviewResponse = await server.inject({
      method: 'GET',
      url: `/api/codex/exec/real-read-only-adapter/readiness-review/latest/${dryRunId}`,
    });
    const invalidReviewQueryResponse = await server.inject({
      method: 'GET',
      url: '/api/codex/exec/real-read-only-adapter/readiness-reviews?outcome=execution_approved',
    });
    const missingReviewBodyResponse = await server.inject({
      method: 'POST',
      url: '/api/codex/exec/real-read-only-adapter/readiness-review',
      payload: {},
    });
    const missingDryRunResponse = await server.inject({
      method: 'POST',
      url: '/api/codex/exec/real-read-only-adapter/readiness-package',
      payload: { dryRunId: 'missing_dry_run' },
    });
    const missingIdResponse = await server.inject({
      method: 'POST',
      url: '/api/codex/exec/real-read-only-adapter/readiness-package',
      payload: {},
    });
    const disabledStoreServer = buildSupervisorServer({ disableStore: true });
    const disabledStoreResponse = await disabledStoreServer.inject({
      method: 'POST',
      url: '/api/codex/exec/real-read-only-adapter/readiness-package',
      payload: { dryRunId },
    });
    const disabledStoreReviewResponse = await disabledStoreServer.inject({
      method: 'POST',
      url: '/api/codex/exec/real-read-only-adapter/readiness-review',
      payload: {
        packageId,
        outcome: 'no_go_to_separate_adr_draft',
        reviewerLabel: 'local-operator',
        rationaleSummary: 'No persisted readiness package is available here.',
      },
    });

    await disabledStoreServer.close();
    await server.close();
    await store.close();

    expect(missingDecisionResponse.statusCode).toBe(409);
    expect(missingDecisionResponse.json()).toMatchObject({
      notPersisted: true,
      package: {
        status: 'blocked',
        implementationApproved: false,
        processAdapterApproved: false,
        recommendationGrantsExecution: false,
      },
      liveExecution: false,
      externalProcessStarted: false,
      executionDisabled: true,
    });
    expect(
      missingDecisionResponse
        .json()
        .package.blockers.map((blocker: { code: string }) => blocker.code),
    ).toContain('round_3s_conditional_decision_exists');
    expect(createResponse.statusCode).toBe(200);
    expect(createResponse.json()).toMatchObject({
      package: {
        dryRunId,
        status: 'requires_review',
        documentedOnly3twEvidence: true,
        symlinkEscapeVerificationPending: true,
        implementationApproved: false,
        processAdapterApproved: false,
        recommendationGrantsExecution: false,
      },
      summary: {
        status: 'requires_review',
        implementationApproved: false,
        processAdapterApproved: false,
        recommendationGrantsExecution: false,
      },
      liveExecution: false,
      externalProcessStarted: false,
      executionDisabled: true,
      notPersisted: false,
    });
    expect(
      createResponse.json().package.findings.map((finding: { code: string }) => finding.code),
    ).toContain('documented_only_3tw_evidence');
    expect(
      createResponse.json().package.findings.map((finding: { code: string }) => finding.code),
    ).toContain('fixture_path_guard_symlink_escape');
    expect(createResponse.json().recommendation).toContain(
      'Does not grant implementation, process launch, or execution permission.',
    );
    expect(getResponse.statusCode).toBe(200);
    expect(getResponse.json().package.id).toBe(packageId);
    expect(listResponse.statusCode).toBe(200);
    expect(listResponse.json().summaries).toHaveLength(1);
    expect(latestResponse.statusCode).toBe(200);
    expect(latestResponse.json().package.id).toBe(packageId);
    expect(missingReviewPackageResponse.statusCode).toBe(404);
    expect(missingReviewPackageResponse.body).not.toContain(process.cwd());
    expect(invalidReviewResponse.statusCode).toBe(400);
    expect(invalidReviewResponse.json().missingAcknowledgementCodes).toEqual(
      expect.arrayContaining([
        'symlink_escape_verification_pending',
        'documented_only_3tw_evidence',
      ]),
    );
    expect(validReviewResponse.statusCode).toBe(200);
    expect(validReviewResponse.json()).toMatchObject({
      reviewRecord: {
        packageId,
        dryRunId,
        outcome: 'conditional_go_to_separate_adr_draft',
        separateAdrDraftAllowed: true,
        implementationApproved: false,
        processAdapterApproved: false,
        recommendationGrantsExecution: false,
        acknowledgedFindingCodes: expect.arrayContaining([
          'symlink_escape_verification_pending',
          'documented_only_3tw_evidence',
        ]),
        unresolvedFindingCount: expect.any(Number),
      },
      liveExecution: false,
      externalProcessStarted: false,
      executionDisabled: true,
      notPersisted: false,
    });
    expect(validReviewResponse.json().recommendation).toContain(
      'Does not grant implementation, process launch, or execution permission.',
    );
    expect(getReviewResponse.statusCode).toBe(200);
    expect(getReviewResponse.json().reviewRecord.id).toBe(reviewId);
    expect(listReviewsResponse.statusCode).toBe(200);
    expect(listReviewsResponse.json().summaries).toHaveLength(1);
    expect(latestReviewResponse.statusCode).toBe(200);
    expect(latestReviewResponse.json().reviewRecord.id).toBe(reviewId);
    expect(invalidReviewQueryResponse.statusCode).toBe(400);
    expect(missingReviewBodyResponse.statusCode).toBe(400);
    expect(missingDryRunResponse.statusCode).toBe(404);
    expect(missingDryRunResponse.body).not.toContain(process.cwd());
    expect(missingIdResponse.statusCode).toBe(400);
    expect(disabledStoreResponse.statusCode).toBe(503);
    expect(disabledStoreResponse.json()).toMatchObject({
      degraded: true,
      notPersisted: true,
      implementationApproved: false,
      processAdapterApproved: false,
      recommendationGrantsExecution: false,
      liveExecution: false,
      externalProcessStarted: false,
      executionDisabled: true,
    });
    expect(disabledStoreReviewResponse.statusCode).toBe(503);
    expect(disabledStoreReviewResponse.json()).toMatchObject({
      degraded: true,
      notPersisted: true,
      implementationApproved: false,
      processAdapterApproved: false,
      recommendationGrantsExecution: false,
      liveExecution: false,
      externalProcessStarted: false,
      executionDisabled: true,
    });
    expect(JSON.stringify(createResponse.json())).not.toContain(
      'Summarize repository structure only',
    );
    expect(JSON.stringify(validReviewResponse.json())).not.toContain(
      'Summarize repository structure only',
    );
    expect(JSON.stringify(createResponse.json())).not.toContain('full report markdown');
    expect(createResponse.body).not.toContain(process.cwd());
  });

  it('creates authoritative metadata-only real read-only adapter attempt records', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'codexhub-supervisor-real-attempt-'));
    const store = await createSqliteStore({ dbPath: join(dir, 'codexhub.sqlite') });
    const defaultConfigLoadResult = createDefaultCodexExecConfigLoadResult();
    const server = buildSupervisorServer({
      store,
      configLoadResult: {
        ...defaultConfigLoadResult,
        source: 'file',
        status: 'loaded',
        summary: 'Loaded explicit enabled config for attempt authority test',
        config: {
          ...defaultConfigLoadResult.config,
          liveEnabled: true,
          allowedSandboxModes: ['read_only'],
          forbiddenSandboxModes: ['workspace_write', 'danger_full_access'],
          configSource: 'file',
        },
      },
    });

    const createResponse = await server.inject({
      method: 'POST',
      url: '/api/codex/exec/real-read-only-adapter/attempt',
      payload: {
        dryRunId: 'codex_dry_run_attempt_fixture',
        approvalArtifactId: 'codex_approval_attempt_fixture',
        isolatedWorktreeProvided: true,
      },
    });
    const attemptId = createResponse.json().attemptRecord.id as string;
    const getResponse = await server.inject({
      method: 'GET',
      url: `/api/codex/exec/real-read-only-adapter/attempt/${attemptId}`,
    });
    const listResponse = await server.inject({
      method: 'GET',
      url: '/api/codex/exec/real-read-only-adapter/attempts?dryRunId=codex_dry_run_attempt_fixture&status=blocked&limit=10',
    });
    const latestResponse = await server.inject({
      method: 'GET',
      url: '/api/codex/exec/real-read-only-adapter/attempt/latest/codex_dry_run_attempt_fixture',
    });
    const timelineResponse = await server.inject({
      method: 'GET',
      url:
        '/api/codex/exec/real-read-only-adapter/attempt-timeline/codex_dry_run_attempt_fixture' +
        '?status=blocked&includeEvidence=true&includeAudit=true&limit=10',
    });
    const invalidTimelineQueryResponse = await server.inject({
      method: 'GET',
      url: '/api/codex/exec/real-read-only-adapter/attempt-timeline/codex_dry_run_attempt_fixture?status=execution_approved',
    });
    const invalidQueryResponse = await server.inject({
      method: 'GET',
      url: '/api/codex/exec/real-read-only-adapter/attempts?status=execution_approved',
    });
    const missingBodyResponse = await server.inject({
      method: 'POST',
      url: '/api/codex/exec/real-read-only-adapter/attempt',
      payload: {},
    });
    const disabledStoreServer = buildSupervisorServer({ disableStore: true });
    const disabledStoreResponse = await disabledStoreServer.inject({
      method: 'POST',
      url: '/api/codex/exec/real-read-only-adapter/attempt',
      payload: { dryRunId: 'codex_dry_run_attempt_fixture' },
    });
    const disabledConfigDir = mkdtempSync(
      join(tmpdir(), 'codexhub-supervisor-real-attempt-disabled-config-'),
    );
    const disabledConfigStore = await createSqliteStore({
      dbPath: join(disabledConfigDir, 'codexhub.sqlite'),
    });
    const disabledConfigServer = buildSupervisorServer({
      store: disabledConfigStore,
      configLoadResult: {
        ...defaultConfigLoadResult,
        source: 'file',
        status: 'loaded',
        summary: 'Loaded disabled config for attempt authority test',
        config: {
          ...defaultConfigLoadResult.config,
          liveEnabled: false,
          allowedSandboxModes: ['read_only'],
          forbiddenSandboxModes: ['workspace_write', 'danger_full_access'],
          configSource: 'file',
        },
      },
    });
    const disabledConfigResponse = await disabledConfigServer.inject({
      method: 'POST',
      url: '/api/codex/exec/real-read-only-adapter/attempt',
      payload: { dryRunId: 'codex_dry_run_attempt_fixture' },
    });

    await disabledConfigServer.close();
    await disabledConfigStore.close();
    await disabledStoreServer.close();
    await server.close();
    await store.close();

    expect(createResponse.statusCode).toBe(200);
    expect(createResponse.json()).toMatchObject({
      attemptRecord: {
        id: attemptId,
        dryRunId: 'codex_dry_run_attempt_fixture',
        status: 'blocked',
        authoritative: true,
        supervisorBacked: true,
        persisted: true,
        degraded: false,
        notPersisted: false,
        processBoundaryInvoked: false,
        implementationApproved: false,
        processAdapterApproved: false,
        recommendationGrantsExecution: false,
        workspaceWriteAllowed: false,
        dangerFullAccessAllowed: false,
        dashboardTriggerAllowed: false,
      },
      liveExecution: false,
      externalProcessStarted: false,
      executionDisabled: true,
      notPersisted: false,
    });
    expect(createResponse.json().request.metadata.configuredEnabled).toBe(true);
    expect(
      createResponse
        .json()
        .preflight.checks.find((check: { code: string }) => check.code === 'config_explicit_enable')
        ?.status,
    ).toBe('passed');
    expect(createResponse.json().result.error.code).toBe('missing_dry_run');
    expect(JSON.stringify(createResponse.json())).not.toContain('config_disabled');
    expect(createResponse.json().evidenceRefs).toHaveLength(1);
    expect(createResponse.json().auditEvents.length).toBeGreaterThan(0);
    expect(getResponse.statusCode).toBe(200);
    expect(getResponse.json().attemptRecord.id).toBe(attemptId);
    expect(listResponse.statusCode).toBe(200);
    expect(listResponse.json().summaries).toHaveLength(1);
    expect(latestResponse.statusCode).toBe(200);
    expect(latestResponse.json().attemptRecord.id).toBe(attemptId);
    expect(timelineResponse.statusCode).toBe(200);
    expect(timelineResponse.json()).toMatchObject({
      timeline: {
        dryRunId: 'codex_dry_run_attempt_fixture',
        status: 'blocked',
        eventCount: 1,
        includeEvidence: true,
        includeAudit: true,
        implementationApproved: false,
        processAdapterApproved: false,
        recommendationGrantsExecution: false,
        workspaceWriteAllowed: false,
        dangerFullAccessAllowed: false,
        dashboardTriggerAllowed: false,
      },
      authoritative: true,
      supervisorBacked: true,
      persisted: true,
      degraded: false,
      notPersisted: false,
    });
    expect(timelineResponse.json().timeline.evidenceRefCount).toBeGreaterThan(0);
    expect(timelineResponse.json().timeline.auditEventCount).toBeGreaterThan(0);
    expect(timelineResponse.json().timeline.entries[0].attemptId).toBe(attemptId);
    expect(invalidTimelineQueryResponse.statusCode).toBe(400);
    expect(invalidQueryResponse.statusCode).toBe(400);
    expect(missingBodyResponse.statusCode).toBe(400);
    expect(disabledStoreResponse.statusCode).toBe(503);
    expect(disabledStoreResponse.json()).toMatchObject({
      authoritative: false,
      supervisorBacked: false,
      persisted: false,
      degraded: true,
      notPersisted: true,
      liveExecution: false,
      externalProcessStarted: false,
      executionDisabled: true,
      implementationApproved: false,
      processAdapterApproved: false,
      recommendationGrantsExecution: false,
    });
    expect(disabledConfigResponse.statusCode).toBe(200);
    expect(disabledConfigResponse.json().result.error.code).toBe('config_disabled');
    expect(
      disabledConfigResponse
        .json()
        .preflight.checks.find((check: { code: string }) => check.code === 'config_explicit_enable')
        ?.status,
    ).toBe('failed');
    expect(JSON.stringify(createResponse.json())).not.toContain('raw prompt body');
    expect(JSON.stringify(createResponse.json())).not.toContain('raw command body');
    expect(JSON.stringify(createResponse.json())).not.toContain('raw stdout body');
    expect(JSON.stringify(createResponse.json())).not.toContain('raw stderr body');
    expect(JSON.stringify(timelineResponse.json())).not.toContain('raw stdout body');
    expect(JSON.stringify(timelineResponse.json())).not.toContain('raw stderr body');
    expect(JSON.stringify(createResponse.json())).not.toContain('"argv"');
    expect(JSON.stringify(timelineResponse.json())).not.toContain('"argv"');
    expect(JSON.stringify(createResponse.json())).not.toContain('"executablePath":');
    expect(JSON.stringify(timelineResponse.json())).not.toContain('"executablePath":');
    expect(createResponse.body).not.toContain(process.cwd());
  });

  it('uses authoritative guard sources and an injected runner before recording completed attempts', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'codexhub-supervisor-real-attempt-completed-'));
    const store = await createSqliteStore({ dbPath: join(dir, 'codexhub.sqlite') });
    const defaultConfigLoadResult = createDefaultCodexExecConfigLoadResult();
    const pilotWorktreePath = join(dir, 'pilot-worktree');
    const pilotWorktreeHash = hashTestWorktreePath(pilotWorktreePath);
    const fakeRunner = {
      start: async () => ({
        exitCode: 0,
        stdout: '{"type":"result","status":"ok"}\n',
        stderr: '',
      }),
    };
    const server = buildSupervisorServer({
      store,
      configLoadResult: {
        ...defaultConfigLoadResult,
        source: 'file',
        status: 'loaded',
        summary: 'Loaded explicit enabled config for guarded attempt test',
        config: {
          ...defaultConfigLoadResult.config,
          liveEnabled: true,
          allowedSandboxModes: ['read_only'],
          forbiddenSandboxModes: ['workspace_write', 'danger_full_access'],
          configSource: 'file',
        },
      },
      realReadOnlyAdapterProcessRunner: fakeRunner,
      realReadOnlyAdapterPostRunVerificationRunner: fakeRunner,
      realReadOnlyAdapterPostRunWorktreeState: {
        beforeStatus: 'clean',
        afterStatus: 'clean',
        unexpectedDiff: false,
        statusHash: pilotWorktreeHash,
      },
    });

    const dryRunResponse = await server.inject({
      method: 'POST',
      url: '/api/codex/exec/dry-run',
      payload: {
        title: 'Guarded real read-only attempt fixture',
        prompt: 'Summarize repository structure',
        cwd: '.',
        sandboxMode: 'read_only',
        approvalMode: 'required',
      },
    });
    const dryRunId = dryRunResponse.json().liveRunRecord.id as string;
    const policySourceResponse = await server.inject({
      method: 'POST',
      url: '/api/codex/exec/real-read-only-adapter/policy-sources',
      payload: { dryRunId },
    });
    const policySourceRecordId = policySourceResponse.json().recordId as string;
    const approvalRequestResponse = await server.inject({
      method: 'POST',
      url: '/api/codex/exec/approval-request',
      payload: {
        dryRunId,
        policySourceId: policySourceRecordId,
        requestedBy: 'local-operator',
        reason: 'Guarded read-only adapter attempt fixture',
      },
    });
    const approvalResponse = await server.inject({
      method: 'POST',
      url: '/api/codex/exec/manual-approval',
      payload: {
        dryRunId,
        approvalRequestId: approvalRequestResponse.json().approvalRequest.id,
        outcome: 'approved',
        reason: 'Guarded read-only adapter attempt fixture',
      },
    });
    const approvalArtifactId = approvalResponse.json().approvalArtifact.id as string;
    const sourcePreparationResponse = await server.inject({
      method: 'POST',
      url: '/api/codex/exec/real-read-only-adapter/pilot-prerequisite-sources',
      payload: {
        dryRunId,
        approvalArtifactId,
        worktreeLabel: 'isolated-clean-fixture',
        worktreeStatus: 'clean',
        worktreePathHash: pilotWorktreeHash,
      },
    });
    const prerequisiteResponse = await server.inject({
      method: 'POST',
      url: '/api/codex/exec/real-read-only-adapter/pilot-prerequisites',
      payload: {
        dryRunId,
        approvalArtifactId,
        worktreeLabel: 'isolated-clean-fixture',
        worktreeStatus: 'clean',
        worktreePathHash: pilotWorktreeHash,
        handoffContextComplete: true,
      },
    });
    const attemptResponse = await server.inject({
      method: 'POST',
      url: '/api/codex/exec/real-read-only-adapter/attempt',
      payload: {
        dryRunId,
        approvalArtifactId,
        worktreePath: pilotWorktreePath,
      },
    });
    const attemptBodyText = attemptResponse.body;
    const mismatchResponse = await server.inject({
      method: 'POST',
      url: '/api/codex/exec/real-read-only-adapter/attempt',
      payload: {
        dryRunId,
        approvalArtifactId,
        worktreePath: join(dir, 'different-worktree'),
      },
    });

    await server.close();
    await store.close();

    expect(policySourceResponse.statusCode).toBe(200);
    expect(policySourceResponse.json()).toMatchObject({
      recordId: policySourceRecordId,
      dryRunId,
      status: 'aligned',
      degraded: false,
      notPersisted: false,
      configExplicitlyEnabled: true,
      readOnlyOnly: true,
      policyDecisionAllowsPilot: true,
      evidenceAuditReady: true,
      fallbackUsedAsAuthority: false,
      pilotExecuted: false,
      adapterAttemptInvoked: false,
    });
    expect(sourcePreparationResponse.statusCode).toBe(200);
    expect(sourcePreparationResponse.json().status).toBe('prepared');
    expect(prerequisiteResponse.statusCode).toBe(200);
    expect(prerequisiteResponse.json().status).toBe('ready_for_pilot_retry');
    expect(attemptResponse.statusCode).toBe(200);
    expect(attemptResponse.json()).toMatchObject({
      attemptRecord: {
        dryRunId,
        status: 'completed',
        processBoundaryInvoked: true,
        preflightStatus: 'passed',
        resultStatus: 'completed',
        postRunVerificationStatus: 'passed',
        workspaceMutationDetected: false,
        failedCheckCodes: [],
        blockedCheckCodes: [],
        implementationApproved: false,
        processAdapterApproved: false,
        recommendationGrantsExecution: false,
        workspaceWriteAllowed: false,
        dangerFullAccessAllowed: false,
        dashboardTriggerAllowed: false,
      },
      liveExecution: false,
      externalProcessStarted: false,
      executionDisabled: true,
      degraded: false,
      notPersisted: false,
    });
    expect(attemptResponse.json().preflight.checks.every((check: { status: string }) => check.status === 'passed')).toBe(
      true,
    );
    expect(attemptResponse.json().result.error).toBeUndefined();
    expect(attemptResponse.json().evidenceRefs.length).toBeGreaterThan(0);
    expect(attemptResponse.json().auditEvents.length).toBeGreaterThan(0);
    expect(attemptBodyText).not.toContain(pilotWorktreePath);
    expect(attemptBodyText).not.toContain('"argv"');
    expect(attemptBodyText).not.toContain('"executablePath":');
    expect(mismatchResponse.statusCode).toBe(200);
    expect(mismatchResponse.json().attemptRecord.status).toBe('blocked');
    expect(mismatchResponse.json().attemptRecord.processBoundaryInvoked).toBe(false);
    expect(mismatchResponse.json().attemptRecord.failedCheckCodes).toContain(
      'isolated_worktree_clean',
    );
    expect(mismatchResponse.body).not.toContain(join(dir, 'different-worktree'));
  });

  it('records pilot prerequisite readiness without running a pilot or storing raw worktree paths', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'codexhub-supervisor-pilot-prereq-'));
    const store = await createSqliteStore({ dbPath: join(dir, 'codexhub.sqlite') });
    const defaultConfigLoadResult = createDefaultCodexExecConfigLoadResult();
    const server = buildSupervisorServer({
      store,
      configLoadResult: {
        ...defaultConfigLoadResult,
        source: 'file',
        status: 'loaded',
        summary: 'Loaded explicit test config for pilot prerequisite inspection',
        config: {
          ...defaultConfigLoadResult.config,
          liveEnabled: true,
          configSource: 'file',
        },
      },
    });

    const dryRunResponse = await server.inject({
      method: 'POST',
      url: '/api/codex/exec/dry-run',
      payload: {
        title: 'Pilot prerequisite dry-run fixture',
        prompt: 'Summarize repository structure',
        cwd: '.',
        sandboxMode: 'read_only',
        approvalMode: 'required',
      },
    });
    const dryRunId = dryRunResponse.json().liveRunRecord.id as string;
    const blockedResponse = await server.inject({
      method: 'POST',
      url: '/api/codex/exec/real-read-only-adapter/pilot-prerequisites',
      payload: { dryRunId },
    });
    const policySourceResponse = await server.inject({
      method: 'POST',
      url: '/api/codex/exec/real-read-only-adapter/policy-sources',
      payload: { dryRunId },
    });
    const policySourceRecordId = policySourceResponse.json().recordId as string;
    const policySourceGetResponse = await server.inject({
      method: 'GET',
      url: `/api/codex/exec/real-read-only-adapter/policy-sources/${policySourceRecordId}`,
    });
    const policySourceListResponse = await server.inject({
      method: 'GET',
      url: `/api/codex/exec/real-read-only-adapter/policy-sources?dryRunId=${dryRunId}&status=aligned&limit=10`,
    });
    const policySourceLatestResponse = await server.inject({
      method: 'GET',
      url: `/api/codex/exec/real-read-only-adapter/policy-source/latest/${dryRunId}`,
    });
    const approvalRequestResponse = await server.inject({
      method: 'POST',
      url: '/api/codex/exec/approval-request',
      payload: {
        dryRunId,
        policySourceId: policySourceRecordId,
        requestedBy: 'local-operator',
        reason: 'Pilot prerequisite verification fixture',
      },
    });
    const approvalResponse = await server.inject({
      method: 'POST',
      url: '/api/codex/exec/manual-approval',
      payload: {
        dryRunId,
        approvalRequestId: approvalRequestResponse.json().approvalRequest.id,
        outcome: 'approved',
        reason: 'Pilot prerequisite verification fixture',
      },
    });
    const approvalArtifactId = approvalResponse.json().approvalArtifact.id as string;
    const sourcePreparationResponse = await server.inject({
      method: 'POST',
      url: '/api/codex/exec/real-read-only-adapter/pilot-prerequisite-sources',
      payload: {
        dryRunId,
        approvalArtifactId,
        worktreeLabel: 'isolated-clean-fixture',
        worktreeStatus: 'clean',
        worktreePathHash: 'sha256:isolated-clean-worktree',
      },
    });
    const sourcePreparationRecordId = sourcePreparationResponse.json().recordId as string;
    const sourcePreparationGetResponse = await server.inject({
      method: 'GET',
      url: `/api/codex/exec/real-read-only-adapter/pilot-prerequisite-sources/${sourcePreparationRecordId}`,
    });
    const sourcePreparationListResponse = await server.inject({
      method: 'GET',
      url: `/api/codex/exec/real-read-only-adapter/pilot-prerequisite-sources?dryRunId=${dryRunId}&status=prepared&limit=10`,
    });
    const sourcePreparationLatestResponse = await server.inject({
      method: 'GET',
      url: `/api/codex/exec/real-read-only-adapter/pilot-prerequisite-source/latest/${dryRunId}`,
    });
    const sourcePreparationRawPathResponse = await server.inject({
      method: 'POST',
      url: '/api/codex/exec/real-read-only-adapter/pilot-prerequisite-sources',
      payload: {
        dryRunId,
        worktreePath: 'C:/safe/worktree',
      },
    });
    const readyResponse = await server.inject({
      method: 'POST',
      url: '/api/codex/exec/real-read-only-adapter/pilot-prerequisites',
      payload: {
        dryRunId,
        approvalArtifactId,
        worktreeLabel: 'isolated-clean-fixture',
        worktreeStatus: 'clean',
        worktreePathHash: 'sha256:isolated-clean-worktree',
        handoffContextComplete: true,
      },
    });
    const recordId = readyResponse.json().recordId as string;
    const getResponse = await server.inject({
      method: 'GET',
      url: `/api/codex/exec/real-read-only-adapter/pilot-prerequisites/${recordId}`,
    });
    const listResponse = await server.inject({
      method: 'GET',
      url: `/api/codex/exec/real-read-only-adapter/pilot-prerequisites?dryRunId=${dryRunId}&status=ready_for_pilot_retry&limit=10`,
    });
    const latestResponse = await server.inject({
      method: 'GET',
      url: `/api/codex/exec/real-read-only-adapter/pilot-prerequisite/latest/${dryRunId}`,
    });
    const rawPathResponse = await server.inject({
      method: 'POST',
      url: '/api/codex/exec/real-read-only-adapter/pilot-prerequisites',
      payload: {
        dryRunId,
        worktreePath: 'C:/safe/worktree',
      },
    });
    const invalidQueryResponse = await server.inject({
      method: 'GET',
      url: '/api/codex/exec/real-read-only-adapter/pilot-prerequisites?status=pilot_passed',
    });
    const missingBodyResponse = await server.inject({
      method: 'POST',
      url: '/api/codex/exec/real-read-only-adapter/pilot-prerequisites',
      payload: {},
    });
    const disabledStoreServer = buildSupervisorServer({ disableStore: true });
    const disabledStoreSourceResponse = await disabledStoreServer.inject({
      method: 'POST',
      url: '/api/codex/exec/real-read-only-adapter/pilot-prerequisite-sources',
      payload: { dryRunId },
    });
    const disabledStoreResponse = await disabledStoreServer.inject({
      method: 'POST',
      url: '/api/codex/exec/real-read-only-adapter/pilot-prerequisites',
      payload: { dryRunId },
    });

    await disabledStoreServer.close();
    await server.close();
    await store.close();

    expect(blockedResponse.statusCode).toBe(200);
    expect(blockedResponse.json()).toMatchObject({
      status: 'blocked',
      validUnusedApprovalPresent: false,
      isolatedCleanWorktreeMetadataPresent: false,
      authoritativePolicySourcePresent: false,
      authoritativeSourcePreparationPresent: false,
      authoritativeAttemptEvidencePresent: false,
      fallbackUsedAsAuthority: false,
      pilotExecuted: false,
      adapterAttemptInvoked: false,
    });
    expect(policySourceResponse.statusCode).toBe(200);
    expect(policySourceResponse.json()).toMatchObject({
      recordId: policySourceRecordId,
      dryRunId,
      status: 'aligned',
      degraded: false,
      notPersisted: false,
      configExplicitlyEnabled: true,
      readOnlyOnly: true,
      policyDecisionAllowsPilot: true,
      evidenceAuditReady: true,
      fallbackUsedAsAuthority: false,
      pilotExecuted: false,
      adapterAttemptInvoked: false,
      workspaceWriteAllowed: false,
      dangerFullAccessAllowed: false,
      dashboardTriggerAllowed: false,
    });
    expect(policySourceGetResponse.statusCode).toBe(200);
    expect(policySourceGetResponse.json().recordId).toBe(policySourceRecordId);
    expect(policySourceListResponse.statusCode).toBe(200);
    expect(policySourceListResponse.json().summaries).toHaveLength(1);
    expect(policySourceLatestResponse.statusCode).toBe(200);
    expect(policySourceLatestResponse.json().recordId).toBe(policySourceRecordId);
    expect(approvalRequestResponse.statusCode).toBe(200);
    expect(approvalResponse.statusCode).toBe(200);
    expect(sourcePreparationResponse.statusCode).toBe(200);
    expect(sourcePreparationResponse.json()).toMatchObject({
      recordId: sourcePreparationRecordId,
      dryRunId,
      status: 'prepared',
      degraded: false,
      notPersisted: false,
      configExplicitlyEnabled: true,
      authoritativePolicySourcePresent: true,
      validUnusedApprovalPresent: true,
      isolatedCleanWorktreeMetadataPresent: true,
      evidenceAuditReady: true,
      fallbackUsedAsAuthority: false,
      pilotExecuted: false,
      adapterAttemptInvoked: false,
      workspaceWriteAllowed: false,
      dangerFullAccessAllowed: false,
      dashboardTriggerAllowed: false,
    });
    expect(sourcePreparationResponse.json().evidenceRefs.length).toBeGreaterThan(0);
    expect(sourcePreparationResponse.json().auditEvents.length).toBeGreaterThan(0);
    expect(sourcePreparationGetResponse.statusCode).toBe(200);
    expect(sourcePreparationGetResponse.json().recordId).toBe(sourcePreparationRecordId);
    expect(sourcePreparationListResponse.statusCode).toBe(200);
    expect(sourcePreparationListResponse.json().summaries).toHaveLength(1);
    expect(sourcePreparationLatestResponse.statusCode).toBe(200);
    expect(sourcePreparationLatestResponse.json().recordId).toBe(sourcePreparationRecordId);
    expect(sourcePreparationRawPathResponse.statusCode).toBe(400);
    expect(sourcePreparationRawPathResponse.body).not.toContain('C:/safe/worktree');
    expect(readyResponse.statusCode).toBe(200);
    expect(readyResponse.json()).toMatchObject({
      recordId,
      dryRunId,
      status: 'ready_for_pilot_retry',
      degraded: false,
      notPersisted: false,
      configExplicitlyEnabled: true,
      authoritativePolicySourcePresent: true,
      validUnusedApprovalPresent: true,
      isolatedCleanWorktreeMetadataPresent: true,
      authoritativeSourcePreparationPresent: true,
      authoritativeAttemptEvidencePresent: false,
      evidenceAuditReady: true,
      fallbackUsedAsAuthority: false,
      pilotExecuted: false,
      adapterAttemptInvoked: false,
      workspaceWriteAllowed: false,
      dangerFullAccessAllowed: false,
      dashboardTriggerAllowed: false,
    });
    expect(readyResponse.json().hardGateCount).toBeGreaterThan(0);
    expect(readyResponse.json().blockedGateCount).toBe(0);
    expect(readyResponse.json().evidenceRefs.length).toBeGreaterThan(0);
    expect(readyResponse.json().auditEvents.length).toBeGreaterThan(0);
    expect(getResponse.statusCode).toBe(200);
    expect(getResponse.json().recordId).toBe(recordId);
    expect(listResponse.statusCode).toBe(200);
    expect(listResponse.json().summaries).toHaveLength(1);
    expect(latestResponse.statusCode).toBe(200);
    expect(latestResponse.json().recordId).toBe(recordId);
    expect(rawPathResponse.statusCode).toBe(400);
    expect(rawPathResponse.body).not.toContain('C:/safe/worktree');
    expect(invalidQueryResponse.statusCode).toBe(400);
    expect(missingBodyResponse.statusCode).toBe(400);
    expect(disabledStoreSourceResponse.statusCode).toBe(503);
    expect(disabledStoreSourceResponse.json()).toMatchObject({
      status: 'blocked',
      authoritative: false,
      supervisorBacked: false,
      persisted: false,
      degraded: true,
      notPersisted: true,
      configExplicitlyEnabled: false,
      authoritativePolicySourcePresent: false,
      validUnusedApprovalPresent: false,
      isolatedCleanWorktreeMetadataPresent: false,
      evidenceAuditReady: false,
      fallbackUsedAsAuthority: false,
      pilotExecuted: false,
      adapterAttemptInvoked: false,
    });
    expect(disabledStoreResponse.statusCode).toBe(503);
    expect(disabledStoreResponse.json()).toMatchObject({
      status: 'blocked',
      authoritative: false,
      supervisorBacked: false,
      persisted: false,
      degraded: true,
      notPersisted: true,
      configExplicitlyEnabled: false,
      validUnusedApprovalPresent: false,
      isolatedCleanWorktreeMetadataPresent: false,
      authoritativeSourcePreparationPresent: false,
      authoritativeAttemptEvidencePresent: false,
      evidenceAuditReady: false,
      fallbackUsedAsAuthority: false,
      pilotExecuted: false,
      adapterAttemptInvoked: false,
    });
    expect(JSON.stringify(sourcePreparationResponse.json())).not.toContain('C:/safe/worktree');
    expect(JSON.stringify(sourcePreparationResponse.json())).not.toContain('raw prompt body');
    expect(JSON.stringify(sourcePreparationResponse.json())).not.toContain('raw command body');
    expect(JSON.stringify(sourcePreparationResponse.json())).not.toContain('raw stdout body');
    expect(JSON.stringify(sourcePreparationResponse.json())).not.toContain('raw stderr body');
    expect(JSON.stringify(sourcePreparationResponse.json())).not.toContain('"argv"');
    expect(JSON.stringify(sourcePreparationResponse.json())).not.toContain('"executablePath":');
    expect(JSON.stringify(readyResponse.json())).not.toContain('C:/safe/worktree');
    expect(JSON.stringify(readyResponse.json())).not.toContain('raw prompt body');
    expect(JSON.stringify(readyResponse.json())).not.toContain('raw command body');
    expect(JSON.stringify(readyResponse.json())).not.toContain('raw stdout body');
    expect(JSON.stringify(readyResponse.json())).not.toContain('raw stderr body');
    expect(JSON.stringify(readyResponse.json())).not.toContain('"argv"');
    expect(JSON.stringify(readyResponse.json())).not.toContain('"executablePath":');
    expect(readyResponse.body).not.toContain(process.cwd());
  });

  it('binds approval requests to policy sources prepared with a dry-run plan id', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'codexhub-supervisor-policy-source-plan-id-'));
    const store = await createSqliteStore({ dbPath: join(dir, 'codexhub.sqlite') });
    const defaultConfigLoadResult = createDefaultCodexExecConfigLoadResult();
    const server = buildSupervisorServer({
      store,
      configLoadResult: {
        ...defaultConfigLoadResult,
        source: 'file',
        status: 'loaded',
        summary: 'Loaded explicit test config for policy source approval binding',
        config: {
          ...defaultConfigLoadResult.config,
          liveEnabled: true,
          configSource: 'file',
        },
      },
    });

    const dryRunResponse = await server.inject({
      method: 'POST',
      url: '/api/codex/exec/dry-run',
      payload: {
        title: 'Policy source approval binding fixture',
        prompt: 'Summarize repository structure',
        cwd: '.',
        sandboxMode: 'read_only',
        approvalMode: 'required',
      },
    });
    const dryRunPlanId = dryRunResponse.json().liveRunRecord.dryRunPlanId as string;
    const policySourceResponse = await server.inject({
      method: 'POST',
      url: '/api/codex/exec/real-read-only-adapter/policy-sources',
      payload: { dryRunId: dryRunPlanId },
    });
    const policySourceRecordId = policySourceResponse.json().recordId as string;
    const approvalRequestResponse = await server.inject({
      method: 'POST',
      url: '/api/codex/exec/approval-request',
      payload: {
        dryRunId: dryRunPlanId,
        policySourceId: policySourceRecordId,
        requestedBy: 'local-operator',
        reason: 'Policy source approval binding fixture',
      },
    });

    await server.close();
    await store.close();

    expect(policySourceResponse.statusCode).toBe(200);
    expect(policySourceResponse.json()).toMatchObject({
      dryRunId: dryRunPlanId,
      status: 'aligned',
      degraded: false,
      notPersisted: false,
      fallbackUsedAsAuthority: false,
    });
    expect(approvalRequestResponse.statusCode).toBe(200);
    expect(approvalRequestResponse.json().approvalRequest).toMatchObject({
      dryRunPlanId,
      policyDecisionHash: policySourceResponse.json().policyDecisionHash,
    });
    expect(approvalRequestResponse.body).not.toContain('policy source is not aligned');
  });
});

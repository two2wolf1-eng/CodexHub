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
    expect(listResponse.json().liveConfig).toMatchObject({
      liveEnabled: false,
      allowedSandboxModes: ['read_only'],
    });
    expect(preflightResponse.statusCode).toBe(200);
    expect(preflightResponse.json()).toMatchObject({
      preflightResult: {
        status: 'blocked',
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
          liveEnabled: false,
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
        status: 'blocked',
        liveExecution: false,
        externalProcessStarted: false,
        executionDisabled: true,
      },
    });
    expect(gateResponse.json().executionGateResult.reasons.join(' ')).toContain('disabled');
    expect(timelineResponse.statusCode).toBe(200);
    expect(timelineResponse.json()).toMatchObject({
      timeline: {
        status: 'gate_blocked',
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
        latestGateStatus: 'blocked',
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
    expect(missingReportReviewResponse.statusCode).toBe(404);
    expect(missingReportReviewResponse.body).not.toContain(process.cwd());
    expect(missingReportReviewLatestResponse.statusCode).toBe(404);
    expect(missingReportReviewLatestResponse.body).not.toContain(process.cwd());
    expect(invalidReportReviewHistoryResponse.statusCode).toBe(400);
    expect(invalidTimelineResponse.statusCode).toBe(400);
    expect(rejectedCwdResponse.statusCode).toBe(400);
  });
});

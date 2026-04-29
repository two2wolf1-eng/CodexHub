import { describe, expect, it } from 'vitest';

describe('cli development mock-run fallback', () => {
  it('falls back to local mock orchestration when supervisor is unavailable', async () => {
    process.env.CODEXHUB_SUPERVISOR_URL = 'http://127.0.0.1:9';
    const { mockRunDevelopment } = await import('./main');
    const result = await mockRunDevelopment(
      'Add Electron CDP read-only observation skeleton',
      'Create interfaces and tests only',
    );

    expect(result.summary).toMatchObject({
      requestTitle: 'Add Electron CDP read-only observation skeleton',
      mockOnly: true,
    });
  });

  it('replays a local codex fixture when supervisor is unavailable', async () => {
    process.env.CODEXHUB_SUPERVISOR_URL = 'http://127.0.0.1:9';
    const { replayCodexFixture } = await import('./main');
    const summary = await replayCodexFixture(
      'packages/codex-kernel/fixtures/codex-exec-basic.jsonl',
    );

    expect(summary).toMatchObject({
      threadId: 'thread_fixture_basic',
      status: 'completed',
      mockOnly: true,
      liveExecution: false,
      externalProcessStarted: false,
    });
  });

  it('creates a local codex dry-run control-plane record when supervisor is unavailable', async () => {
    process.env.CODEXHUB_SUPERVISOR_URL = 'http://127.0.0.1:9';
    const { dryRunCodexExec } = await import('./main');
    const result = await dryRunCodexExec('Summarize repository structure');

    expect(result).toMatchObject({
      title: 'Summarize repository structure',
      status: 'blocked',
      liveExecution: false,
      externalProcessStarted: false,
      executionDisabled: true,
      promptBodyStored: false,
    });
  });

  it('creates local preflight and gate results when supervisor is unavailable', async () => {
    process.env.CODEXHUB_SUPERVISOR_URL = 'http://127.0.0.1:9';
    const { preflightCodexExec, evaluateCodexExecGate, getCodexExecTimeline } =
      await import('./main');
    const preflight = await preflightCodexExec('codex_dry_run_fixture');
    const gate = await evaluateCodexExecGate('codex_dry_run_fixture');
    const timeline = await getCodexExecTimeline('codex_dry_run_fixture', {
      source: 'dry_run',
      includeEvidence: false,
      includeAudit: false,
    });

    expect(preflight).toMatchObject({
      preflightResult: {
        status: 'blocked',
        liveExecution: false,
        externalProcessStarted: false,
        executionDisabled: true,
      },
    });
    expect(gate).toMatchObject({
      executionGateResult: {
        status: 'blocked',
        liveExecution: false,
        externalProcessStarted: false,
        executionDisabled: true,
      },
    });
    expect(gate.executionGateResult).toMatchObject({
      status: 'blocked',
    });
    expect(JSON.stringify(gate)).not.toContain('approvalArtifact');
    expect(timeline).toMatchObject({
      timeline: {
        liveExecution: false,
        externalProcessStarted: false,
        executionDisabled: true,
      },
      liveExecution: false,
      externalProcessStarted: false,
      executionDisabled: true,
    });
    expect(
      (timeline.timeline as { events: Array<{ eventType: string }> }).events.map(
        (event) => event.eventType,
      ),
    ).toContain('codex.exec.dry_run.created');
    expect(
      (timeline.timeline as { events: Array<{ sourceKind: string }> }).events.every(
        (event) => event.sourceKind === 'dry_run',
      ),
    ).toBe(true);
  });

  it('formats timeline fallback output with no-live flags', async () => {
    process.env.CODEXHUB_SUPERVISOR_URL = 'http://127.0.0.1:9';
    const { formatCodexExecTimelineOutput, getCodexExecTimeline } = await import('./main');
    const timeline = await getCodexExecTimeline('codex_dry_run_fixture', {
      includeEvidence: false,
      includeAudit: false,
    });
    const output = formatCodexExecTimelineOutput(timeline);

    expect(output).toContain('Codex control timeline');
    expect(output).toContain('liveExecution=false');
    expect(output).toContain('externalProcessStarted=false');
    expect(output).toContain('executionDisabled=true');
  });

  it('creates local config and manual approval records when supervisor is unavailable', async () => {
    process.env.CODEXHUB_SUPERVISOR_URL = 'http://127.0.0.1:9';
    const {
      getCodexExecConfig,
      requestCodexExecApproval,
      decideCodexExecApproval,
      listCodexExecApprovals,
    } = await import('./main');
    const config = await getCodexExecConfig();
    const request = await requestCodexExecApproval(
      'codex_dry_run_fixture',
      'manual private reason',
    );
    const decision = await decideCodexExecApproval(
      'codex_dry_run_fixture',
      'approved',
      'manual private reason',
    );
    const approvals = await listCodexExecApprovals();

    expect(config).toMatchObject({
      liveConfig: {
        liveEnabled: false,
        liveExecution: false,
        externalProcessStarted: false,
        executionDisabled: true,
      },
    });
    expect(request).toMatchObject({
      approvalRequest: {
        status: 'pending',
        liveExecution: false,
      },
      approvalState: {
        status: 'pending',
        canDecide: true,
      },
    });
    expect(JSON.stringify(request)).not.toContain('manual private reason');
    expect(decision).toMatchObject({
      approvalDecision: {
        outcome: 'approved',
        approved: true,
      },
      approvalState: {
        status: 'approved',
      },
      approvalTransition: {
        allowed: true,
      },
      liveExecution: false,
      externalProcessStarted: false,
      executionDisabled: true,
    });
    expect(approvals).toMatchObject({ approvals: [] });
  });

  it('creates local evidence, audit, and drilldown views when supervisor is unavailable', async () => {
    process.env.CODEXHUB_SUPERVISOR_URL = 'http://127.0.0.1:9';
    const {
      formatCodexExecDrilldownOutput,
      formatCodexExecEvidenceListOutput,
      getCodexExecAudit,
      getCodexExecDrilldown,
      getCodexExecEvidence,
      listCodexExecAudit,
      listCodexExecEvidence,
    } = await import('./main');
    const evidenceSearch = await listCodexExecEvidence({
      dryRun: 'codex_dry_run_fixture',
      kind: 'codex.exec.dry_run_plan',
    });
    const auditSearch = await listCodexExecAudit({
      dryRun: 'codex_dry_run_fixture',
      action: 'codex.exec.policy_evaluated',
    });
    const evidenceItem = (
      evidenceSearch.result as {
        items: Array<{ evidenceRefId: string }>;
      }
    ).items[0];
    const auditItem = (
      auditSearch.result as {
        items: Array<{ auditEventId: string }>;
      }
    ).items[0];
    const evidenceDetail = await getCodexExecEvidence(evidenceItem?.evidenceRefId ?? 'missing');
    const auditDetail = await getCodexExecAudit(auditItem?.auditEventId ?? 'missing');
    const drilldown = await getCodexExecDrilldown('codex_dry_run_fixture');

    expect(evidenceSearch).toMatchObject({
      result: {
        count: 1,
        items: [
          {
            status: 'found',
            kind: 'codex.exec.dry_run_plan',
            bodyStored: false,
          },
        ],
      },
      liveExecution: false,
      externalProcessStarted: false,
      executionDisabled: true,
    });
    expect(auditSearch).toMatchObject({
      result: {
        count: 1,
        items: [
          {
            status: 'found',
            action: 'codex.exec.policy_evaluated',
            bodyStored: false,
          },
        ],
      },
      liveExecution: false,
      externalProcessStarted: false,
      executionDisabled: true,
    });
    expect(evidenceDetail.detail).toMatchObject({
      status: 'not_found',
      bodyStored: false,
    });
    expect(auditDetail.detail).toMatchObject({
      status: 'not_found',
      bodyStored: false,
    });
    expect(drilldown).toMatchObject({
      drilldown: {
        status: 'found',
        evidenceCount: 3,
        auditEventCount: 4,
        bodyStored: false,
      },
      liveExecution: false,
      externalProcessStarted: false,
      executionDisabled: true,
    });
    expect(formatCodexExecEvidenceListOutput(evidenceSearch)).toContain('liveExecution=false');
    expect(formatCodexExecDrilldownOutput(drilldown)).toContain('executionDisabled=true');
  });

  it('creates a local report when supervisor is unavailable', async () => {
    process.env.CODEXHUB_SUPERVISOR_URL = 'http://127.0.0.1:9';
    const { formatCodexExecReportOutput, getCodexExecReport } = await import('./main');
    const result = await getCodexExecReport('codex_dry_run_fixture', {
      format: 'markdown',
      includeEvidence: true,
      includeAudit: true,
    });
    const output = formatCodexExecReportOutput(result);

    expect(result).toMatchObject({
      report: {
        status: 'found',
        liveExecution: false,
        externalProcessStarted: false,
        executionDisabled: true,
      },
      exportResult: {
        format: 'markdown',
      },
      liveExecution: false,
      externalProcessStarted: false,
      executionDisabled: true,
    });
    expect(output).toContain('# Codex Control-plane Report');
    expect(output).toContain('liveExecution=false');
    expect(output).toContain('externalProcessStarted=false');
    expect(output).toContain('executionDisabled=true');
    expect(output).not.toContain('Local control-plane fallback for');
  });

  it('guards report output paths', async () => {
    const { resolveCodexExecReportOutputPath } = await import('./main');

    expect(resolveCodexExecReportOutputPath('reports/foo.md').workspacePath).toBe('reports/foo.md');
    expect(resolveCodexExecReportOutputPath('tmp/foo.md').workspacePath).toBe('tmp/foo.md');
    expect(() => resolveCodexExecReportOutputPath('C:/tmp/foo.md')).toThrow('repository-relative');
    expect(() => resolveCodexExecReportOutputPath('../foo.md')).toThrow('traversal');
    expect(() => resolveCodexExecReportOutputPath('docs/foo.md')).toThrow('reports/ or tmp/');
  });

  it('creates a local ADR draft when supervisor is unavailable', async () => {
    process.env.CODEXHUB_SUPERVISOR_URL = 'http://127.0.0.1:9';
    const { formatCodexExecAdrDraftOutput, getCodexExecAdrDraft } = await import('./main');
    const result = await getCodexExecAdrDraft('codex_dry_run_fixture', {
      format: 'markdown',
      includeEvidence: true,
      includeAudit: true,
    });
    const output = formatCodexExecAdrDraftOutput(result);

    expect(result).toMatchObject({
      adrDraft: {
        format: 'markdown',
        recommendationGrantsExecution: false,
        metadataOnly: true,
        bodyStored: false,
        draftOnly: true,
        liveExecution: false,
        externalProcessStarted: false,
        executionDisabled: true,
      },
      exportResult: {
        format: 'markdown',
        recommendationGrantsExecution: false,
        draftOnly: true,
      },
      liveExecution: false,
      externalProcessStarted: false,
      executionDisabled: true,
    });
    expect(output).toContain('# ADR Draft: Codex control\\-plane live adapter readiness');
    expect(output).toContain('does not grant execution');
    expect(output).toContain('draftOnly=true');
    expect(output).not.toContain('execution approval');
    expect(output).not.toContain('Local control-plane fallback for');
  });

  it('creates local ADR decision records without approving implementation', async () => {
    process.env.CODEXHUB_SUPERVISOR_URL = 'http://127.0.0.1:9';
    const {
      createCodexExecAdrDecision,
      formatCodexExecAdrDecisionListOutput,
      formatCodexExecAdrDecisionOutput,
      getCodexExecAdrDecision,
      getLatestCodexExecAdrDecisionCommand,
      listCodexExecAdrDecisions,
    } = await import('./main');
    const result = await createCodexExecAdrDecision('codex_dry_run_fixture', {
      reviewer: 'local-operator',
      rationaleSummary: 'Conditional read-only design only.',
      json: false,
    });
    const decisionId = (result.decisionRecord as { id: string }).id;
    const detail = await getCodexExecAdrDecision(decisionId);
    const list = await listCodexExecAdrDecisions({
      dryRun: 'codex_dry_run_fixture',
      status: 'recorded',
      decision: 'conditional_read_only_go',
    });
    const latest = await getLatestCodexExecAdrDecisionCommand('codex_dry_run_fixture');
    const output = formatCodexExecAdrDecisionOutput(result);
    const listOutput = formatCodexExecAdrDecisionListOutput(list);

    expect(result).toMatchObject({
      decisionRecord: {
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
      },
      implementationApproved: false,
      processAdapterApproved: false,
      recommendationGrantsExecution: false,
      liveExecution: false,
      externalProcessStarted: false,
      executionDisabled: true,
      degraded: true,
    });
    expect(detail).toMatchObject({
      decisionRecord: {
        id: decisionId,
        implementationApproved: false,
        processAdapterApproved: false,
      },
    });
    expect(list).toMatchObject({
      decisions: [
        {
          decision: 'conditional_read_only_go',
          implementationApproved: false,
          processAdapterApproved: false,
          recommendationGrantsExecution: false,
        },
      ],
      liveExecution: false,
      externalProcessStarted: false,
      executionDisabled: true,
    });
    expect(latest).toMatchObject({
      decisionRecord: {
        decision: 'conditional_read_only_go',
        dashboardTriggerAllowed: false,
        recommendationGrantsExecution: false,
      },
      liveExecution: false,
      externalProcessStarted: false,
      executionDisabled: true,
    });
    expect(output).toContain('implementationApproved=false');
    expect(output).toContain('processAdapterApproved=false');
    expect(output).toContain('recommendationGrantsExecution=false');
    expect(output).toContain('does not approve implementation');
    expect(output).not.toContain('execution approval');
    expect(listOutput).toContain('processAdapterApproved=false');
    expect(JSON.stringify(result)).not.toContain('Local control-plane fallback for');
  });

  it('creates local report review records when supervisor is unavailable', async () => {
    process.env.CODEXHUB_SUPERVISOR_URL = 'http://127.0.0.1:9';
    const {
      createCodexExecReportReview,
      compareCodexExecReportReviewCommand,
      formatCodexExecGovernancePackageOutput,
      formatCodexExecReportReviewOutput,
      formatCodexExecReportReviewComparisonOutput,
      formatCodexExecReportReviewHandoffOutput,
      formatCodexExecReportReviewHistoryOutput,
      formatCodexExecReportReviewListOutput,
      getCodexExecGovernancePackage,
      getCodexExecReportReviewHandoff,
      getCodexExecReportReviewHistory,
      getCodexExecReportReview,
      getLatestCodexExecReportReviewCommand,
      listCodexExecReportReviews,
    } = await import('./main');
    const result = await createCodexExecReportReview('codex_dry_run_fixture', {
      reviewer: 'local-operator',
      status: 'reviewed',
      recommendation: 'ready_for_adr',
      notesSummary: 'No-live boundary intact; live adapter still requires ADR.',
    });
    const output = formatCodexExecReportReviewOutput(result);
    const reviewId = (result.reviewRecord as { id: string }).id;
    const detail = await getCodexExecReportReview(reviewId);
    const list = await listCodexExecReportReviews({
      dryRun: 'codex_dry_run_fixture',
      status: 'reviewed',
      recommendation: 'ready_for_adr',
    });
    const latest = await getLatestCodexExecReportReviewCommand('codex_dry_run_fixture');
    const history = await getCodexExecReportReviewHistory({
      dryRun: 'codex_dry_run_fixture',
    });
    const comparison = await compareCodexExecReportReviewCommand(
      'codex_report_review_left',
      'codex_report_review_right',
    );
    const handoff = await getCodexExecReportReviewHandoff('codex_dry_run_fixture', {
      from: 'local-operator',
      to: 'next-reviewer',
    });
    const governancePackage = await getCodexExecGovernancePackage('codex_dry_run_fixture', {
      includeEvidence: true,
      includeAudit: true,
    });
    const listOutput = formatCodexExecReportReviewListOutput(list);
    const historyOutput = formatCodexExecReportReviewHistoryOutput(history);
    const comparisonOutput = formatCodexExecReportReviewComparisonOutput(comparison);
    const handoffOutput = formatCodexExecReportReviewHandoffOutput(handoff);
    const governanceOutput = formatCodexExecGovernancePackageOutput(governancePackage);

    expect(result).toMatchObject({
      reviewRecord: {
        status: 'reviewed',
        recommendation: 'ready_for_adr',
        recommendationGrantsExecution: false,
        bodyStored: false,
        liveExecution: false,
        externalProcessStarted: false,
        executionDisabled: true,
      },
      liveExecution: false,
      externalProcessStarted: false,
      executionDisabled: true,
    });
    expect(detail).toMatchObject({
      reviewRecord: {
        id: reviewId,
        recommendationGrantsExecution: false,
      },
    });
    expect(list).toMatchObject({
      summaries: [
        {
          recommendationGrantsExecution: false,
        },
      ],
      liveExecution: false,
      externalProcessStarted: false,
      executionDisabled: true,
    });
    expect(latest).toMatchObject({
      reviewRecord: {
        recommendationGrantsExecution: false,
      },
      liveExecution: false,
      externalProcessStarted: false,
      executionDisabled: true,
    });
    expect(history).toMatchObject({
      history: {
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
    expect(comparison).toMatchObject({
      comparison: {
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
    expect(handoff).toMatchObject({
      handoff: {
        fromReviewer: 'local-operator',
        toReviewer: 'next-reviewer',
        recommendationGrantsExecution: false,
        liveExecution: false,
        externalProcessStarted: false,
        executionDisabled: true,
      },
      liveExecution: false,
      externalProcessStarted: false,
      executionDisabled: true,
    });
    expect(governancePackage).toMatchObject({
      governancePackage: {
        recommendationGrantsExecution: false,
        liveExecution: false,
        externalProcessStarted: false,
        executionDisabled: true,
        noLiveEvidence: {
          noRealCodexExec: true,
          noExternalProcessStarted: true,
        },
      },
      liveExecution: false,
      externalProcessStarted: false,
      executionDisabled: true,
    });
    expect(output).toContain('does not grant execution');
    expect(output).not.toContain('execution approval');
    expect(listOutput).toContain('grantsExecution=false');
    expect(historyOutput).toContain('recommendation grants execution: false');
    expect(comparisonOutput).toContain('recommendationGrantsExecution=false');
    expect(handoffOutput).toContain('does not grant execution');
    expect(governanceOutput).toContain('does not grant execution');
    expect(governanceOutput).not.toContain('execution approval');
    expect(JSON.stringify(result)).not.toContain('Local control-plane fallback for');
    expect(JSON.stringify(history)).not.toContain('Local control-plane fallback for');
    expect(JSON.stringify(comparison)).not.toContain('Local control-plane fallback for');
    expect(JSON.stringify(handoff)).not.toContain('Local control-plane fallback for');
    expect(JSON.stringify(governancePackage)).not.toContain('Local control-plane fallback for');
  });
});

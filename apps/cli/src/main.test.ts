import { describe, expect, it, vi } from 'vitest';

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

  it('creates local implementation plan review records without execution approval', async () => {
    process.env.CODEXHUB_SUPERVISOR_URL = 'http://127.0.0.1:9';
    const {
      createReadOnlyAdapterImplementationPlanReviewCommand,
      getReadOnlyAdapterImplementationPlanReviewCommand,
      getLatestReadOnlyAdapterImplementationPlanReviewCommand,
      listReadOnlyAdapterImplementationPlanReviewsCommand,
      formatReadOnlyAdapterImplementationPlanReviewOutput,
      formatReadOnlyAdapterImplementationPlanReviewListOutput,
    } = await import('./main');
    const created = await createReadOnlyAdapterImplementationPlanReviewCommand({
      outcome: 'conditional_go_to_disabled_skeleton',
      reviewer: 'local-operator',
      rationaleSummary: 'Skeleton planning only; execution remains unapproved.',
    });
    const fetched = await getReadOnlyAdapterImplementationPlanReviewCommand('review_1');
    const listed = await listReadOnlyAdapterImplementationPlanReviewsCommand({
      outcome: 'conditional_go_to_disabled_skeleton',
    });
    const latest = await getLatestReadOnlyAdapterImplementationPlanReviewCommand();
    const createdOutput = formatReadOnlyAdapterImplementationPlanReviewOutput(created);
    const listOutput = formatReadOnlyAdapterImplementationPlanReviewListOutput(listed);

    expect(created).toMatchObject({
      reviewRecord: {
        outcome: 'conditional_go_to_disabled_skeleton',
        disabledSkeletonApproved: true,
        implementationApproved: false,
        processAdapterApproved: false,
        recommendationGrantsExecution: false,
        workspaceWriteAllowed: false,
        dangerFullAccessAllowed: false,
      },
      degraded: true,
      liveExecution: false,
      externalProcessStarted: false,
      executionDisabled: true,
    });
    expect(fetched).toMatchObject({
      reviewRecord: {
        id: 'review_1',
        implementationApproved: false,
        processAdapterApproved: false,
      },
    });
    expect(listed).toMatchObject({
      reviews: [
        {
          outcome: 'conditional_go_to_disabled_skeleton',
          disabledSkeletonApproved: true,
        },
      ],
      liveExecution: false,
      externalProcessStarted: false,
      executionDisabled: true,
    });
    expect(latest).toMatchObject({
      reviewRecord: {
        implementationApproved: false,
        processAdapterApproved: false,
        recommendationGrantsExecution: false,
      },
    });
    expect(createdOutput).toContain('implementationApproved=false');
    expect(createdOutput).toContain('processAdapterApproved=false');
    expect(createdOutput).toContain('recommendationGrantsExecution=false');
    expect(createdOutput).toContain('does not approve process adapter work or execution');
    expect(listOutput).toContain('never grant execution');
  });

  it('uses local disabled skeleton and fixture-boundary fallbacks without approval language', async () => {
    process.env.CODEXHUB_SUPERVISOR_URL = 'http://127.0.0.1:9';
    const {
      getReadOnlyAdapterSkeletonPreviewCommand,
      createReadOnlyAdapterSkeletonReviewCommand,
      runReadOnlyAdapterFixtureBoundaryCommand,
      createReadOnlyAdapterFinalReadinessCommand,
      formatReadOnlyAdapterGenericOutput,
      formatReadOnlyAdapterSkeletonReviewOutput,
      formatReadOnlyAdapterFinalReadinessOutput,
    } = await import('./main');
    const preview = await getReadOnlyAdapterSkeletonPreviewCommand();
    const review = await createReadOnlyAdapterSkeletonReviewCommand({
      outcome: 'skeleton_accepted_for_fixture_boundary_only',
      reviewer: 'local-operator',
      rationaleSummary: 'Fixture boundary only; execution remains unapproved.',
    });
    const fixtureBoundary = await runReadOnlyAdapterFixtureBoundaryCommand(
      'packages/codex-kernel/fixtures/codex-exec-basic.jsonl',
      {},
    );
    const finalReadiness = await createReadOnlyAdapterFinalReadinessCommand({
      outcome: 'ready_for_separate_read_only_adapter_adr',
      reviewer: 'local-operator',
      rationaleSummary: 'Separate ADR remains required.',
    });

    expect(preview).toMatchObject({
      preview: {
        status: 'disabled',
        noRunnableCommand: true,
        commandPreviewStored: false,
        argvStored: false,
        executablePathStored: false,
        shellSnippetStored: false,
        envPlanStored: false,
      },
      liveExecution: false,
      externalProcessStarted: false,
      executionDisabled: true,
    });
    expect(review).toMatchObject({
      reviewRecord: {
        outcome: 'skeleton_accepted_for_fixture_boundary_only',
        processAdapterApproved: false,
        recommendationGrantsExecution: false,
      },
      degraded: true,
    });
    expect(fixtureBoundary).toMatchObject({
      result: {
        fixtureOnly: true,
        liveExecution: false,
        externalProcessStarted: false,
        executionDisabled: true,
        processAdapterStarted: false,
      },
      degraded: true,
    });
    expect(finalReadiness).toMatchObject({
      decisionRecord: {
        outcome: 'ready_for_separate_read_only_adapter_adr',
        realAdapterRequiresSeparateAdr: true,
        currentRoundApprovesProcessStart: false,
        currentRoundApprovesCodexExecution: false,
        currentRoundApprovesWorkspaceWrites: false,
        processAdapterApproved: false,
        recommendationGrantsExecution: false,
      },
      degraded: true,
    });
    expect(formatReadOnlyAdapterGenericOutput(fixtureBoundary)).toContain('executionDisabled=true');
    expect(formatReadOnlyAdapterSkeletonReviewOutput(review)).toContain(
      'processAdapterApproved=false',
    );
    expect(formatReadOnlyAdapterFinalReadinessOutput(finalReadiness)).toContain(
      'realAdapterRequiresSeparateAdr=true',
    );
    expect(JSON.stringify(fixtureBoundary)).not.toContain('synthetic stdout body');
  });

  it('creates local real read-only adapter readiness fallback without approval language', async () => {
    process.env.CODEXHUB_SUPERVISOR_URL = 'http://127.0.0.1:9';
    const {
      createRealReadOnlyAdapterReadinessCommand,
      formatRealReadOnlyAdapterReadinessListOutput,
      formatRealReadOnlyAdapterReadinessOutput,
      getLatestRealReadOnlyAdapterReadinessCommand,
      getRealReadOnlyAdapterReadinessCommand,
      listRealReadOnlyAdapterReadinessCommand,
    } = await import('./main');
    const created = await createRealReadOnlyAdapterReadinessCommand('codex_dry_run_fixture');
    const fetched = await getRealReadOnlyAdapterReadinessCommand('readiness_1');
    const listed = await listRealReadOnlyAdapterReadinessCommand({
      dryRun: 'codex_dry_run_fixture',
      status: 'blocked',
    });
    const latest = await getLatestRealReadOnlyAdapterReadinessCommand('codex_dry_run_fixture');
    const output = formatRealReadOnlyAdapterReadinessOutput(created);
    const listOutput = formatRealReadOnlyAdapterReadinessListOutput(listed);

    expect(created).toMatchObject({
      package: {
        dryRunId: 'codex_dry_run_fixture',
        status: 'blocked',
        implementationApproved: false,
        processAdapterApproved: false,
        recommendationGrantsExecution: false,
        symlinkEscapeVerificationPending: true,
      },
      degraded: true,
      notPersisted: true,
      liveExecution: false,
      externalProcessStarted: false,
      executionDisabled: true,
    });
    expect(fetched).toMatchObject({
      package: {
        id: 'readiness_1',
        implementationApproved: false,
        processAdapterApproved: false,
        recommendationGrantsExecution: false,
      },
      degraded: true,
      notPersisted: true,
    });
    expect(listed).toMatchObject({
      summaries: [
        {
          status: 'blocked',
          implementationApproved: false,
          processAdapterApproved: false,
          recommendationGrantsExecution: false,
        },
      ],
      degraded: true,
      notPersisted: true,
    });
    expect(latest).toMatchObject({
      package: {
        dryRunId: 'codex_dry_run_fixture',
        implementationApproved: false,
        processAdapterApproved: false,
        recommendationGrantsExecution: false,
      },
      degraded: true,
      notPersisted: true,
    });
    expect(output).toContain(
      'Ready for separate ADR review only. Does not grant implementation, process launch, or execution permission.',
    );
    expect(output).toContain('implementationApproved=false');
    expect(output).toContain('processAdapterApproved=false');
    expect(output).toContain('recommendationGrantsExecution=false');
    expect(output).toContain('notPersisted=true');
    expect(output).not.toContain('execution approval');
    expect(listOutput).toContain('processAdapterApproved=false');
    expect(listOutput).not.toContain('execution approval');
    expect(JSON.stringify(created)).not.toContain('Local control-plane fallback for');
    expect(JSON.stringify(created)).not.toContain('full report markdown');
    expect(JSON.stringify(created)).not.toContain('full command body');
  });

  it('refuses local readiness review creation fallback without approval language', async () => {
    process.env.CODEXHUB_SUPERVISOR_URL = 'http://127.0.0.1:9';
    const {
      createRealReadOnlyAdapterReadinessReviewCommand,
      formatRealReadOnlyAdapterReadinessReviewListOutput,
      formatRealReadOnlyAdapterReadinessReviewOutput,
      getLatestRealReadOnlyAdapterReadinessReviewCommand,
      getRealReadOnlyAdapterReadinessReviewCommand,
      listRealReadOnlyAdapterReadinessReviewCommand,
    } = await import('./main');

    const created = await createRealReadOnlyAdapterReadinessReviewCommand(
      'codex_real_read_only_adapter_readiness_package_fixture',
      {
        outcome: 'conditional_go_to_separate_adr_draft',
        reviewer: 'local-operator',
        rationaleSummary:
          'Acknowledges symlink_escape_verification_pending and documented_only_3tw_evidence.',
      },
    );
    const fetched = await getRealReadOnlyAdapterReadinessReviewCommand('readiness_review_1');
    const listed = await listRealReadOnlyAdapterReadinessReviewCommand({
      dryRun: 'codex_dry_run_fixture',
      outcome: 'conditional_go_to_separate_adr_draft',
    });
    const latest =
      await getLatestRealReadOnlyAdapterReadinessReviewCommand('codex_dry_run_fixture');
    const output = formatRealReadOnlyAdapterReadinessReviewOutput(created);
    const listOutput = formatRealReadOnlyAdapterReadinessReviewListOutput(listed);

    expect(created).toMatchObject({
      degraded: true,
      notPersisted: true,
      implementationApproved: false,
      processAdapterApproved: false,
      recommendationGrantsExecution: false,
      liveExecution: false,
      externalProcessStarted: false,
      executionDisabled: true,
    });
    expect(created).not.toHaveProperty('reviewRecord');
    expect(fetched).toMatchObject({
      degraded: true,
      notPersisted: true,
      implementationApproved: false,
      processAdapterApproved: false,
      recommendationGrantsExecution: false,
    });
    expect(fetched).not.toHaveProperty('reviewRecord');
    expect(listed).toMatchObject({
      summaries: [],
      degraded: true,
      notPersisted: true,
    });
    expect(latest).toMatchObject({
      degraded: true,
      notPersisted: true,
      implementationApproved: false,
      processAdapterApproved: false,
      recommendationGrantsExecution: false,
    });
    expect(latest).not.toHaveProperty('reviewRecord');
    expect(output).toContain('notPersisted=true');
    expect(output).toContain('implementationApproved=false');
    expect(output).toContain('processAdapterApproved=false');
    expect(output).toContain('recommendationGrantsExecution=false');
    expect(output).not.toContain('execution approval');
    expect(listOutput).toContain('notPersisted=true');
    expect(listOutput).not.toContain('execution approval');
  });

  it('blocks real read-only adapter CLI attempts when supervisor attempt path is unavailable', async () => {
    process.env.CODEXHUB_SUPERVISOR_URL = 'http://127.0.0.1:9';
    const { attemptRealReadOnlyAdapterCommand, formatRealReadOnlyAdapterAttemptOutput } =
      await import('./main');
    const result = await attemptRealReadOnlyAdapterCommand('codex_dry_run_fixture', {
      approval: 'codex_approval_fixture',
      worktree: 'C:/safe/isolated-worktree',
    });
    const output = formatRealReadOnlyAdapterAttemptOutput(result);

    expect(result).toMatchObject({
      status: 'blocked',
      attempt: {
        status: 'blocked',
        processBoundaryInvoked: false,
        liveExecution: false,
        externalProcessStarted: false,
        executionDisabled: true,
        processAdapterStarted: false,
        implementationApproved: false,
        processAdapterApproved: false,
        recommendationGrantsExecution: false,
        workspaceWriteAllowed: false,
        dangerFullAccessAllowed: false,
        dashboardTriggerAllowed: false,
        argvStored: false,
        executablePathStored: false,
      },
      preflight: {
        status: 'failed',
      },
      degraded: true,
      notPersisted: true,
      fallbackRefused: true,
      liveExecution: false,
      externalProcessStarted: false,
      executionDisabled: true,
    });
    expect(
      (result.preflight as { checks: Array<{ code: string; status: string }> }).checks.map(
        (check) => check.code,
      ),
    ).toEqual(
      expect.arrayContaining([
        'config_explicit_enable',
        'approval_artifact_exists',
        'dry_run_hash_match',
        'policy_hash_match',
        'isolated_worktree_clean',
        'evidence_store_ready',
        'audit_store_ready',
      ]),
    );
    expect(output).toContain('processBoundaryInvoked=false');
    expect(output).toContain('operator prerequisites: explicit config');
    expect(output).toContain('abort/failure semantics: missing or mismatched gates');
    expect(output).toContain('implementationApproved=false');
    expect(output).toContain('processAdapterApproved=false');
    expect(output).toContain('recommendationGrantsExecution=false');
    expect(output).not.toContain('execution approval');
    expect(JSON.stringify(result)).not.toContain('C:/safe/isolated-worktree');
    expect(JSON.stringify(result)).not.toContain('"argv":');
    expect(JSON.stringify(result)).not.toContain('"executablePath":');
  });

  it('sends runtime worktree input only to the supervisor attempt path', async () => {
    const fetchCalls: Array<{ url: string; init?: RequestInit }> = [];
    const rawWorktreePath = 'C:/safe/isolated-worktree-runtime';
    vi.stubGlobal('fetch', async (url: string | URL | Request, init?: RequestInit) => {
      fetchCalls.push({ url: String(url), init });
      return new Response(
        JSON.stringify({
          status: 'blocked',
          attempt: {
            status: 'blocked',
            processBoundaryInvoked: false,
            liveExecution: false,
            externalProcessStarted: false,
            executionDisabled: true,
            processAdapterStarted: false,
            implementationApproved: false,
            processAdapterApproved: false,
            recommendationGrantsExecution: false,
            workspaceWriteAllowed: false,
            dangerFullAccessAllowed: false,
            dashboardTriggerAllowed: false,
            argvStored: false,
            executablePathStored: false,
          },
          preflight: { status: 'failed', checks: [] },
          degraded: false,
          notPersisted: false,
          fallbackRefused: false,
          liveExecution: false,
          externalProcessStarted: false,
          executionDisabled: true,
          persisted: true,
          authoritative: true,
        }),
        { status: 200, headers: { 'content-type': 'application/json' } },
      );
    });

    try {
      const { attemptRealReadOnlyAdapterCommand, formatRealReadOnlyAdapterAttemptOutput } =
        await import('./main');
      const result = await attemptRealReadOnlyAdapterCommand('codex_dry_run_fixture', {
        approval: 'codex_approval_fixture',
        worktree: rawWorktreePath,
      });
      const output = formatRealReadOnlyAdapterAttemptOutput(result);
      const requestBody = JSON.parse(String(fetchCalls[0]?.init?.body));

      expect(fetchCalls[0]?.url).toContain(
        '/api/codex/exec/real-read-only-adapter/attempt',
      );
      expect(requestBody).toMatchObject({
        dryRunId: 'codex_dry_run_fixture',
        approvalArtifactId: 'codex_approval_fixture',
        isolatedWorktreeProvided: true,
        worktreePath: rawWorktreePath,
      });
      expect(result).toMatchObject({
        authoritative: true,
        degraded: false,
        notPersisted: false,
      });
      expect(JSON.stringify(result)).not.toContain(rawWorktreePath);
      expect(output).not.toContain(rawWorktreePath);
      expect(output).not.toContain('execution approval');
    } finally {
      vi.unstubAllGlobals();
    }
  });

  it('derives source-prep worktree hashes from runtime input without sending raw paths', async () => {
    const fetchCalls: Array<{ url: string; init?: RequestInit }> = [];
    const rawWorktreePath = 'C:/safe/isolated-source-worktree-runtime';
    vi.stubGlobal('fetch', async (url: string | URL | Request, init?: RequestInit) => {
      fetchCalls.push({ url: String(url), init });
      return new Response(
        JSON.stringify({
          status: String(url).includes('pilot-prerequisites')
            ? 'ready_for_pilot_retry'
            : 'prepared',
          authoritative: true,
          supervisorBacked: true,
          persisted: true,
          degraded: false,
          notPersisted: false,
          fallbackUsedAsAuthority: false,
          pilotExecuted: false,
          adapterAttemptInvoked: false,
          liveExecution: false,
          externalProcessStarted: false,
          executionDisabled: true,
          workspaceWriteAllowed: false,
          dangerFullAccessAllowed: false,
          dashboardTriggerAllowed: false,
        }),
        { status: 200, headers: { 'content-type': 'application/json' } },
      );
    });

    try {
      const {
        checkRealReadOnlyAdapterPilotPrerequisitesCommand,
        prepareRealReadOnlyAdapterPilotSourceCommand,
      } = await import('./main');
      const { hashRealReadOnlyAdapterRuntimeWorktreePath } = await import(
        '@codexhub/codex-kernel'
      );
      const expectedHash = hashRealReadOnlyAdapterRuntimeWorktreePath(rawWorktreePath);

      const sourceResult = await prepareRealReadOnlyAdapterPilotSourceCommand(
        'codex_dry_run_fixture',
        {
          approval: 'codex_approval_fixture',
          worktree: rawWorktreePath,
          worktreeLabel: 'isolated-fixture',
          worktreeStatus: 'clean',
          worktreePathHash: 'sha256:manual-stale-hash',
        },
      );
      const prerequisiteResult = await checkRealReadOnlyAdapterPilotPrerequisitesCommand(
        'codex_dry_run_fixture',
        {
          approval: 'codex_approval_fixture',
          worktree: rawWorktreePath,
          worktreeLabel: 'isolated-fixture',
          worktreeStatus: 'clean',
          worktreePathHash: 'sha256:manual-stale-hash',
          handoffContextComplete: true,
        },
      );
      const sourceBody = JSON.parse(String(fetchCalls[0]?.init?.body));
      const prerequisiteBody = JSON.parse(String(fetchCalls[1]?.init?.body));

      expect(sourceBody).toMatchObject({
        dryRunId: 'codex_dry_run_fixture',
        approvalArtifactId: 'codex_approval_fixture',
        worktreeLabel: 'isolated-fixture',
        worktreeStatus: 'clean',
        worktreePathHash: expectedHash,
      });
      expect(prerequisiteBody).toMatchObject({
        dryRunId: 'codex_dry_run_fixture',
        approvalArtifactId: 'codex_approval_fixture',
        worktreeLabel: 'isolated-fixture',
        worktreeStatus: 'clean',
        worktreePathHash: expectedHash,
        handoffContextComplete: true,
      });
      expect(sourceBody).not.toHaveProperty('worktreePath');
      expect(prerequisiteBody).not.toHaveProperty('worktreePath');
      expect(
        JSON.stringify({ sourceBody, prerequisiteBody, sourceResult, prerequisiteResult }),
      ).not.toContain(rawWorktreePath);
    } finally {
      vi.unstubAllGlobals();
    }
  });

  it('passes approval authority trace input unchanged without invoking attempts', async () => {
    const fetchCalls: Array<{ url: string; init?: RequestInit }> = [];

    vi.stubGlobal('fetch', async (url: string | URL | Request, init?: RequestInit) => {
      fetchCalls.push({ url: String(url), init });
      return new Response(
        JSON.stringify({
          status: 'blocked',
          record: undefined,
          approvalAuthorityTraceRecord: undefined,
          authoritative: false,
          supervisorBacked: false,
          persisted: false,
          degraded: true,
          notPersisted: true,
          fallbackUsedAsAuthority: false,
          pilotExecuted: false,
          adapterAttemptInvoked: false,
          attemptPreflightWouldAccept: false,
          liveExecution: false,
          externalProcessStarted: false,
          executionDisabled: true,
          workspaceWriteAllowed: false,
          dangerFullAccessAllowed: false,
          dashboardTriggerAllowed: false,
        }),
        { status: 200, headers: { 'content-type': 'application/json' } },
      );
    });

    try {
      const {
        formatRealReadOnlyAdapterApprovalAuthorityTraceOutput,
        traceRealReadOnlyAdapterApprovalAuthorityCommand,
      } = await import('./main');
      const result = await traceRealReadOnlyAdapterApprovalAuthorityCommand(
        'codex_dry_run_fixture',
        {
          approval: 'codex_approval_artifact_exact',
        },
      );
      const requestBody = JSON.parse(String(fetchCalls[0]?.init?.body));
      const output = formatRealReadOnlyAdapterApprovalAuthorityTraceOutput(result);

      expect(fetchCalls[0]?.url).toContain(
        '/api/codex/exec/real-read-only-adapter/approval-authority-traces',
      );
      expect(requestBody).toMatchObject({
        dryRunId: 'codex_dry_run_fixture',
        approvalArtifactId: 'codex_approval_artifact_exact',
      });
      expect(requestBody).not.toHaveProperty('worktreePath');
      expect(output).toContain('adapterAttemptInvoked=false');
      expect(output).toContain('does not create approvals');
    } finally {
      vi.unstubAllGlobals();
    }
  });

  it('uses degraded read-only attempt query fallbacks without creating authoritative records', async () => {
    process.env.CODEXHUB_SUPERVISOR_URL = 'http://127.0.0.1:9';
    const {
      formatRealReadOnlyAdapterAttemptListOutput,
      formatRealReadOnlyAdapterAttemptOutput,
      formatRealReadOnlyAdapterAttemptTimelineOutput,
      getLatestRealReadOnlyAdapterAttemptCommand,
      getRealReadOnlyAdapterAttemptCommand,
      getRealReadOnlyAdapterAttemptTimelineCommand,
      listRealReadOnlyAdapterAttemptsCommand,
    } = await import('./main');
    const fetched = await getRealReadOnlyAdapterAttemptCommand('attempt_1');
    const listed = await listRealReadOnlyAdapterAttemptsCommand({
      dryRun: 'codex_dry_run_fixture',
      status: 'completed',
    });
    const latest = await getLatestRealReadOnlyAdapterAttemptCommand('codex_dry_run_fixture');
    const timeline = await getRealReadOnlyAdapterAttemptTimelineCommand('codex_dry_run_fixture', {
      includeEvidence: true,
      includeAudit: true,
    });
    const diagnosticOutput = formatRealReadOnlyAdapterAttemptOutput({
      attempt: {
        id: 'codex_real_read_only_adapter_attempt_diag',
        dryRunId: 'codex_dry_run_fixture',
        status: 'failed',
        processBoundaryInvoked: true,
        boundaryDiagnosticsComplete: true,
        boundaryDiagnosticsMissingFields: [],
        postRunVerificationSkipReason: 'attempt_not_completed',
        boundaryDiagnostics: {
          failureCode: 'process_exit_nonzero',
          startFailureKind: 'none',
          enoentKind: 'none',
          platform: 'win32',
          resolvedExecutableKind: 'native_exe',
          spawnTargetKind: 'native_exe',
          cwdHash: 'sha256:safe-cwd-hash',
          cwdExists: true,
          cwdIsDirectory: true,
          executableHash: 'sha256:safe-executable-hash',
          executableExists: true,
          executableAccessible: true,
          executableResolutionSource: 'direct_path',
          dependencyResolutionStatus: 'not_applicable',
          envAllowlistKeyCount: 5,
          envAllowlistKeyHash: 'sha256:safe-env-keys-hash',
          exitCode: 2,
          signal: 'SIGTERM',
          timedOut: false,
          cancelled: false,
          durationMs: 42,
          stdoutHash: 'sha256:safe-stdout-hash',
          stderrHash: 'sha256:safe-stderr-hash',
          stdoutByteLength: 12,
          stderrByteLength: 20,
          stdoutLineCount: 1,
          stderrLineCount: 2,
          stdoutTruncated: false,
          stderrTruncated: false,
        },
        implementationApproved: false,
        processAdapterApproved: false,
        recommendationGrantsExecution: false,
        workspaceWriteAllowed: false,
        dangerFullAccessAllowed: false,
        dashboardTriggerAllowed: false,
      },
      preflight: { status: 'passed', blockerCount: 0, failedGateCount: 0, checks: [] },
      degraded: false,
      notPersisted: false,
    });
    const listOutput = formatRealReadOnlyAdapterAttemptListOutput(listed);
    const latestOutput = formatRealReadOnlyAdapterAttemptOutput(latest);
    const timelineOutput = formatRealReadOnlyAdapterAttemptTimelineOutput(timeline);

    expect(fetched).toMatchObject({
      authoritative: false,
      supervisorBacked: false,
      persisted: false,
      degraded: true,
      notPersisted: true,
      implementationApproved: false,
      processAdapterApproved: false,
      recommendationGrantsExecution: false,
      liveExecution: false,
      externalProcessStarted: false,
      executionDisabled: true,
    });
    expect(fetched.attemptRecord).toBeUndefined();
    expect(listed).toMatchObject({
      attempts: [],
      summaries: [],
      authoritative: false,
      supervisorBacked: false,
      persisted: false,
      degraded: true,
      notPersisted: true,
    });
    expect(latest).toMatchObject({
      authoritative: false,
      supervisorBacked: false,
      persisted: false,
      degraded: true,
      notPersisted: true,
      implementationApproved: false,
      processAdapterApproved: false,
      recommendationGrantsExecution: false,
    });
    expect(timeline).toMatchObject({
      timeline: {
        dryRunId: 'codex_dry_run_fixture',
        status: 'empty',
        eventCount: 0,
        implementationApproved: false,
        processAdapterApproved: false,
        recommendationGrantsExecution: false,
      },
      authoritative: false,
      supervisorBacked: false,
      persisted: false,
      degraded: true,
      notPersisted: true,
    });
    expect(listOutput).toContain('notPersisted=true');
    expect(listOutput).toContain('state guide: blocked means gate refused');
    expect(listOutput).toContain('Records are metadata-only');
    expect(listOutput).not.toContain('execution approval');
    expect(latestOutput).toContain('notPersisted=true');
    expect(latestOutput).not.toContain('execution approval');
    expect(timelineOutput).toContain('Real read-only adapter attempt timeline');
    expect(timelineOutput).toContain('notPersisted=true');
    expect(timelineOutput).toContain('state guide: blocked means gate refused');
    expect(timelineOutput).toContain('metadata-only');
    expect(timelineOutput).not.toContain('execution approval');
    expect(diagnosticOutput).toContain('boundaryFailureCode=process_exit_nonzero');
    expect(diagnosticOutput).toContain('boundaryStartFailureKind=none');
    expect(diagnosticOutput).toContain('boundaryEnoentKind=none');
    expect(diagnosticOutput).toContain('boundaryPlatform=win32');
    expect(diagnosticOutput).toContain('boundaryResolvedExecutableKind=native_exe');
    expect(diagnosticOutput).toContain('boundarySpawnTargetKind=native_exe');
    expect(diagnosticOutput).toContain('boundaryCwdHash=sha256:safe-cwd-hash');
    expect(diagnosticOutput).toContain('boundaryCwdExists=true');
    expect(diagnosticOutput).toContain('boundaryCwdIsDirectory=true');
    expect(diagnosticOutput).toContain('boundaryExecutableExists=true');
    expect(diagnosticOutput).toContain('boundaryExecutableAccessible=true');
    expect(diagnosticOutput).toContain('boundaryExecutableHash=sha256:safe-executable-hash');
    expect(diagnosticOutput).toContain('boundaryExecutableResolutionSource=direct_path');
    expect(diagnosticOutput).toContain(
      'boundaryDependencyResolutionStatus=not_applicable',
    );
    expect(diagnosticOutput).toContain('boundaryEnvAllowlistKeyCount=5');
    expect(diagnosticOutput).toContain(
      'boundaryEnvAllowlistKeyHash=sha256:safe-env-keys-hash',
    );
    expect(diagnosticOutput).toContain('boundaryDiagnosticsComplete=true');
    expect(diagnosticOutput).toContain('boundaryDiagnosticsMissingFields=none');
    expect(diagnosticOutput).toContain('boundaryExitCode=2');
    expect(diagnosticOutput).toContain('boundaryStdoutHash=sha256:safe-stdout-hash');
    expect(diagnosticOutput).toContain('boundarySignal=SIGTERM');
    expect(diagnosticOutput).toContain('boundaryStdoutByteLength=12');
    expect(diagnosticOutput).toContain('boundaryStderrByteLength=20');
    expect(diagnosticOutput).toContain('boundaryStdoutLineCount=1');
    expect(diagnosticOutput).toContain('boundaryStderrLineCount=2');
    expect(diagnosticOutput).toContain('boundaryStdoutTruncated=false');
    expect(diagnosticOutput).toContain('boundaryStderrTruncated=false');
    expect(diagnosticOutput).toContain('postRunVerificationSkipReason=attempt_not_completed');
    expect(diagnosticOutput).not.toContain('raw stdout body');
    expect(diagnosticOutput).not.toContain('raw stderr body');
    expect(diagnosticOutput).not.toContain('"argv":');
    expect(diagnosticOutput).not.toContain('"executablePath":');
  });

  it('uses degraded pilot prerequisite fallbacks without creating authoritative readiness', async () => {
    process.env.CODEXHUB_SUPERVISOR_URL = 'http://127.0.0.1:9';
    const {
      checkRealReadOnlyAdapterPilotPrerequisitesCommand,
      formatRealReadOnlyAdapterApprovalAuthorityTraceListOutput,
      formatRealReadOnlyAdapterApprovalAuthorityTraceOutput,
      formatRealReadOnlyAdapterPolicySourceListOutput,
      formatRealReadOnlyAdapterPolicySourceOutput,
      formatRealReadOnlyAdapterPilotSourcePreparationListOutput,
      formatRealReadOnlyAdapterPilotSourcePreparationOutput,
      formatRealReadOnlyAdapterPilotPrerequisiteListOutput,
      formatRealReadOnlyAdapterPilotPrerequisiteOutput,
      getLatestRealReadOnlyAdapterPolicySourceCommand,
      getLatestRealReadOnlyAdapterApprovalAuthorityTraceCommand,
      getLatestRealReadOnlyAdapterPilotSourceCommand,
      getLatestRealReadOnlyAdapterPilotPrerequisiteCommand,
      getRealReadOnlyAdapterPolicySourceCommand,
      getRealReadOnlyAdapterApprovalAuthorityTraceCommand,
      getRealReadOnlyAdapterPilotSourceCommand,
      getRealReadOnlyAdapterPilotPrerequisiteCommand,
      listRealReadOnlyAdapterPolicySourcesCommand,
      listRealReadOnlyAdapterApprovalAuthorityTracesCommand,
      listRealReadOnlyAdapterPilotSourcesCommand,
      listRealReadOnlyAdapterPilotPrerequisitesCommand,
      prepareRealReadOnlyAdapterPolicySourceCommand,
      prepareRealReadOnlyAdapterPilotSourceCommand,
      traceRealReadOnlyAdapterApprovalAuthorityCommand,
    } = await import('./main');
    const preparedPolicySource =
      await prepareRealReadOnlyAdapterPolicySourceCommand('codex_dry_run_fixture');
    const fetchedPolicySource = await getRealReadOnlyAdapterPolicySourceCommand(
      'codex_real_read_only_adapter_policy_source_1',
    );
    const listedPolicySources = await listRealReadOnlyAdapterPolicySourcesCommand({
      dryRun: 'codex_dry_run_fixture',
      status: 'aligned',
    });
    const latestPolicySource =
      await getLatestRealReadOnlyAdapterPolicySourceCommand('codex_dry_run_fixture');
    const tracedApproval = await traceRealReadOnlyAdapterApprovalAuthorityCommand(
      'codex_dry_run_fixture',
      { approval: 'codex_approval_fixture' },
    );
    const fetchedTrace = await getRealReadOnlyAdapterApprovalAuthorityTraceCommand(
      'codex_real_read_only_adapter_approval_authority_trace_1',
    );
    const listedTraces = await listRealReadOnlyAdapterApprovalAuthorityTracesCommand({
      dryRun: 'codex_dry_run_fixture',
      status: 'aligned',
    });
    const latestTrace =
      await getLatestRealReadOnlyAdapterApprovalAuthorityTraceCommand('codex_dry_run_fixture');
    const preparedSource = await prepareRealReadOnlyAdapterPilotSourceCommand(
      'codex_dry_run_fixture',
      {
        approval: 'codex_approval_fixture',
        worktreeLabel: 'isolated-fixture',
        worktreeStatus: 'clean',
        worktreePathHash: 'sha256:worktree',
      },
    );
    const fetchedSource = await getRealReadOnlyAdapterPilotSourceCommand(
      'codex_real_read_only_adapter_pilot_source_preparation_1',
    );
    const listedSources = await listRealReadOnlyAdapterPilotSourcesCommand({
      dryRun: 'codex_dry_run_fixture',
      status: 'prepared',
    });
    const latestSource =
      await getLatestRealReadOnlyAdapterPilotSourceCommand('codex_dry_run_fixture');
    const checked = await checkRealReadOnlyAdapterPilotPrerequisitesCommand(
      'codex_dry_run_fixture',
      {
        approval: 'codex_approval_fixture',
        worktreeLabel: 'isolated-fixture',
        worktreeStatus: 'clean',
        worktreePathHash: 'sha256:worktree',
      },
    );
    const fetched = await getRealReadOnlyAdapterPilotPrerequisiteCommand(
      'codex_real_read_only_adapter_pilot_prerequisite_1',
    );
    const listed = await listRealReadOnlyAdapterPilotPrerequisitesCommand({
      dryRun: 'codex_dry_run_fixture',
      status: 'ready_for_pilot_retry',
    });
    const latest =
      await getLatestRealReadOnlyAdapterPilotPrerequisiteCommand('codex_dry_run_fixture');
    const sourceOutput = formatRealReadOnlyAdapterPilotSourcePreparationOutput(preparedSource);
    const sourceListOutput = formatRealReadOnlyAdapterPilotSourcePreparationListOutput(listedSources);
    const policySourceOutput = formatRealReadOnlyAdapterPolicySourceOutput(preparedPolicySource);
    const policySourceListOutput =
      formatRealReadOnlyAdapterPolicySourceListOutput(listedPolicySources);
    const traceOutput = formatRealReadOnlyAdapterApprovalAuthorityTraceOutput(tracedApproval);
    const traceListOutput = formatRealReadOnlyAdapterApprovalAuthorityTraceListOutput(listedTraces);
    const checkOutput = formatRealReadOnlyAdapterPilotPrerequisiteOutput(checked);
    const listOutput = formatRealReadOnlyAdapterPilotPrerequisiteListOutput(listed);
    const latestOutput = formatRealReadOnlyAdapterPilotPrerequisiteOutput(latest);

    expect(preparedPolicySource).toMatchObject({
      status: 'blocked',
      authoritative: false,
      supervisorBacked: false,
      persisted: false,
      degraded: true,
      notPersisted: true,
      fallbackUsedAsAuthority: false,
      pilotExecuted: false,
      adapterAttemptInvoked: false,
      configExplicitlyEnabled: false,
      readOnlyOnly: false,
      policyDecisionAllowsPilot: false,
      evidenceAuditReady: false,
      workspaceWriteAllowed: false,
      dangerFullAccessAllowed: false,
      dashboardTriggerAllowed: false,
    });
    expect(fetchedPolicySource).toMatchObject({
      status: 'blocked',
      degraded: true,
      notPersisted: true,
      fallbackUsedAsAuthority: false,
      pilotExecuted: false,
      adapterAttemptInvoked: false,
    });
    expect(listedPolicySources).toMatchObject({
      records: [],
      summaries: [],
      authoritative: false,
      persisted: false,
      degraded: true,
      notPersisted: true,
      fallbackUsedAsAuthority: false,
      pilotExecuted: false,
      adapterAttemptInvoked: false,
    });
    expect(latestPolicySource).toMatchObject({
      status: 'blocked',
      degraded: true,
      notPersisted: true,
      fallbackUsedAsAuthority: false,
      pilotExecuted: false,
      adapterAttemptInvoked: false,
    });
    expect(tracedApproval).toMatchObject({
      status: 'blocked',
      authoritative: false,
      supervisorBacked: false,
      persisted: false,
      degraded: true,
      notPersisted: true,
      fallbackUsedAsAuthority: false,
      pilotExecuted: false,
      adapterAttemptInvoked: false,
      attemptPreflightWouldAccept: false,
    });
    expect(fetchedTrace).toMatchObject({
      status: 'blocked',
      degraded: true,
      notPersisted: true,
      fallbackUsedAsAuthority: false,
      pilotExecuted: false,
      adapterAttemptInvoked: false,
    });
    expect(listedTraces).toMatchObject({
      records: [],
      summaries: [],
      authoritative: false,
      persisted: false,
      degraded: true,
      notPersisted: true,
      fallbackUsedAsAuthority: false,
      pilotExecuted: false,
      adapterAttemptInvoked: false,
    });
    expect(latestTrace).toMatchObject({
      status: 'blocked',
      degraded: true,
      notPersisted: true,
      fallbackUsedAsAuthority: false,
      pilotExecuted: false,
      adapterAttemptInvoked: false,
    });
    expect(preparedSource).toMatchObject({
      status: 'blocked',
      authoritative: false,
      supervisorBacked: false,
      persisted: false,
      degraded: true,
      notPersisted: true,
      fallbackUsedAsAuthority: false,
      pilotExecuted: false,
      adapterAttemptInvoked: false,
      configExplicitlyEnabled: false,
      authoritativePolicySourcePresent: false,
      validUnusedApprovalPresent: false,
      isolatedCleanWorktreeMetadataPresent: false,
      evidenceAuditReady: false,
      workspaceWriteAllowed: false,
      dangerFullAccessAllowed: false,
      dashboardTriggerAllowed: false,
    });
    expect(fetchedSource).toMatchObject({
      status: 'blocked',
      degraded: true,
      notPersisted: true,
      fallbackUsedAsAuthority: false,
      pilotExecuted: false,
      adapterAttemptInvoked: false,
    });
    expect(listedSources).toMatchObject({
      records: [],
      summaries: [],
      authoritative: false,
      persisted: false,
      degraded: true,
      notPersisted: true,
      fallbackUsedAsAuthority: false,
      pilotExecuted: false,
      adapterAttemptInvoked: false,
    });
    expect(latestSource).toMatchObject({
      status: 'blocked',
      degraded: true,
      notPersisted: true,
      fallbackUsedAsAuthority: false,
      pilotExecuted: false,
      adapterAttemptInvoked: false,
    });
    expect(checked).toMatchObject({
      status: 'blocked',
      authoritative: false,
      supervisorBacked: false,
      persisted: false,
      degraded: true,
      notPersisted: true,
      fallbackUsedAsAuthority: false,
      pilotExecuted: false,
      adapterAttemptInvoked: false,
      configExplicitlyEnabled: false,
      authoritativePolicySourcePresent: false,
      validUnusedApprovalPresent: false,
      isolatedCleanWorktreeMetadataPresent: false,
      authoritativeSourcePreparationPresent: false,
      authoritativeAttemptEvidencePresent: false,
      evidenceAuditReady: false,
      workspaceWriteAllowed: false,
      dangerFullAccessAllowed: false,
      dashboardTriggerAllowed: false,
    });
    expect(fetched).toMatchObject({
      status: 'blocked',
      degraded: true,
      notPersisted: true,
      fallbackUsedAsAuthority: false,
      pilotExecuted: false,
      adapterAttemptInvoked: false,
    });
    expect(listed).toMatchObject({
      records: [],
      summaries: [],
      authoritative: false,
      persisted: false,
      degraded: true,
      notPersisted: true,
      fallbackUsedAsAuthority: false,
      pilotExecuted: false,
      adapterAttemptInvoked: false,
    });
    expect(latest).toMatchObject({
      status: 'blocked',
      degraded: true,
      notPersisted: true,
      fallbackUsedAsAuthority: false,
      pilotExecuted: false,
      adapterAttemptInvoked: false,
    });
    expect(checkOutput).toContain('status: blocked');
    expect(checkOutput).toContain('degraded=true');
    expect(checkOutput).toContain('notPersisted=true');
    expect(checkOutput).toContain('fallbackUsedAsAuthority=false');
    expect(checkOutput).toContain('pilotExecuted=false');
    expect(checkOutput).toContain('adapterAttemptInvoked=false');
    expect(checkOutput).toContain('authoritativeSourcePreparationPresent=false');
    expect(checkOutput).toContain('workspaceWriteAllowed=false');
    expect(checkOutput).toContain('dangerFullAccessAllowed=false');
    expect(checkOutput).toContain('dashboardTriggerAllowed=false');
    expect(checkOutput).toContain('degraded or notPersisted output is never ready');
    expect(checkOutput).not.toContain('execution approval');
    expect(sourceOutput).toContain('status: blocked');
    expect(sourceOutput).toContain('notPersisted=true');
    expect(sourceOutput).toContain('authoritativePolicySourcePresent=false');
    expect(sourceOutput).toContain('This source-preparation command does not invoke');
    expect(sourceOutput).not.toContain('execution approval');
    expect(policySourceOutput).toContain('status: blocked');
    expect(policySourceOutput).toContain('notPersisted=true');
    expect(policySourceOutput).toContain('fallbackUsedAsAuthority=false');
    expect(policySourceOutput).toContain('fallback output is never aligned');
    expect(policySourceOutput).not.toContain('execution approval');
    expect(policySourceListOutput).toContain('records: none');
    expect(policySourceListOutput).toContain('Policy-source records are metadata-only');
    expect(traceOutput).toContain('status: blocked');
    expect(traceOutput).toContain('attemptPreflightWouldAccept=false');
    expect(traceOutput).toContain('notPersisted=true');
    expect(traceOutput).toContain('does not create approvals');
    expect(traceOutput).not.toContain('execution approval');
    expect(traceListOutput).toContain('records: none');
    expect(traceListOutput).toContain('Approval-authority traces are metadata-only');
    expect(sourceListOutput).toContain('records: none');
    expect(sourceListOutput).toContain('Source-preparation records are metadata-only');
    expect(listOutput).toContain('Records are metadata-only');
    expect(listOutput).toContain('records: none');
    expect(latestOutput).toContain('notPersisted=true');
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
        liveEnabled: true,
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

  it('simulates read-only adapter preflight locally without implying execution approval', async () => {
    process.env.CODEXHUB_SUPERVISOR_URL = 'http://127.0.0.1:9';
    const {
      formatReadOnlyAdapterPreflightSimulationOutput,
      simulateReadOnlyAdapterPreflightCommand,
    } = await import('./main');
    const result = await simulateReadOnlyAdapterPreflightCommand('codex_dry_run_fixture', {
      isolatedWorktree: true,
      evidenceReady: true,
      auditReady: true,
      checklistComplete: true,
    });
    const output = formatReadOnlyAdapterPreflightSimulationOutput(result);

    expect(result).toMatchObject({
      simulationResult: {
        dryRunId: 'codex_dry_run_fixture',
        liveExecution: false,
        externalProcessStarted: false,
        executionDisabled: true,
        processAdapterStarted: false,
        implementationApproved: false,
        dashboardTriggerAllowed: false,
        recommendationGrantsExecution: false,
      },
      liveExecution: false,
      externalProcessStarted: false,
      executionDisabled: true,
      processAdapterStarted: false,
      implementationApproved: false,
      dashboardTriggerAllowed: false,
      degraded: true,
    });
    expect(output).toContain('Read-only adapter preflight simulation');
    expect(output).toContain('liveExecution=false');
    expect(output).toContain('externalProcessStarted=false');
    expect(output).toContain('executionDisabled=true');
    expect(output).toContain('processAdapterStarted=false');
    expect(output).toContain('implementationApproved=false');
    expect(output).toContain('dashboardTriggerAllowed=false');
    expect(output).toContain('does not grant execution permission');
    expect(output).not.toContain('execution approval');
    expect(JSON.stringify(result)).not.toContain('Local control-plane fallback for');
  });

  it('creates local simulator review records without approving implementation', async () => {
    process.env.CODEXHUB_SUPERVISOR_URL = 'http://127.0.0.1:9';
    const {
      createReadOnlyAdapterSimulatorReviewCommand,
      formatReadOnlyAdapterSimulatorReviewListOutput,
      formatReadOnlyAdapterSimulatorReviewOutput,
      getLatestReadOnlyAdapterSimulatorReviewCommand,
      getReadOnlyAdapterSimulatorReviewCommand,
      listReadOnlyAdapterSimulatorReviewsCommand,
    } = await import('./main');
    const result = await createReadOnlyAdapterSimulatorReviewCommand('codex_dry_run_fixture', {
      reviewer: 'local-operator',
      outcome: 'go_to_implementation_planning',
      rationaleSummary:
        'Simulator review allows implementation planning only; implementation remains unapproved.',
    });
    const reviewId = (result.reviewRecord as { id: string }).id;
    const detail = await getReadOnlyAdapterSimulatorReviewCommand(reviewId);
    const list = await listReadOnlyAdapterSimulatorReviewsCommand({
      dryRun: 'codex_dry_run_fixture',
      status: 'recorded',
      outcome: 'go_to_implementation_planning',
    });
    const latest = await getLatestReadOnlyAdapterSimulatorReviewCommand('codex_dry_run_fixture');
    const output = formatReadOnlyAdapterSimulatorReviewOutput(result);
    const listOutput = formatReadOnlyAdapterSimulatorReviewListOutput(list);

    expect(result).toMatchObject({
      reviewRecord: {
        dryRunId: 'codex_dry_run_fixture',
        outcome: 'go_to_implementation_planning',
        status: 'recorded',
        implementationApproved: false,
        processAdapterApproved: false,
        recommendationGrantsExecution: false,
        metadataOnly: true,
        bodyStored: false,
        liveExecution: false,
        externalProcessStarted: false,
        executionDisabled: true,
      },
      liveExecution: false,
      externalProcessStarted: false,
      executionDisabled: true,
      processAdapterStarted: false,
      implementationApproved: false,
      processAdapterApproved: false,
      dashboardTriggerAllowed: false,
      recommendationGrantsExecution: false,
      degraded: true,
    });
    expect(detail).toMatchObject({
      reviewRecord: {
        id: reviewId,
        implementationApproved: false,
        processAdapterApproved: false,
        recommendationGrantsExecution: false,
      },
    });
    expect(list).toMatchObject({
      reviews: [
        {
          outcome: 'go_to_implementation_planning',
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
      reviewRecord: {
        outcome: 'go_to_implementation_planning',
        implementationApproved: false,
        processAdapterApproved: false,
        recommendationGrantsExecution: false,
      },
      liveExecution: false,
      externalProcessStarted: false,
      executionDisabled: true,
    });
    expect(output).toContain('implementationApproved=false');
    expect(output).toContain('processAdapterApproved=false');
    expect(output).toContain('recommendationGrantsExecution=false');
    expect(output).toContain('does not approve implementation or execution');
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

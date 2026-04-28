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
    const timeline = await getCodexExecTimeline('codex_dry_run_fixture');

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
});

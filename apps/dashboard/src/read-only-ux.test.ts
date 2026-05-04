import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import {
  createApprovalDecisionHistoryReadOnlySummary,
  createElectronCdpReadOnlySummary,
  createGovernanceReadOnlySummary,
  createM10PilotAcceptanceReadOnlySummary,
  createM10PilotReadOnlySummary,
  createM11PilotReadOnlySummary,
  createOperatorReadinessReadOnlySummary,
  createPolicyTelemetryReadOnlySummary,
  createVerificationReadinessPreview,
  createBrowserProfilesReadOnlySummary,
  createWorktreeReadOnlySummary,
  getDashboardHash,
  getDashboardViewFromHash,
  summarizeDegradedState,
  summarizeMcpTools,
} from './read-only-ux';

describe('dashboard read-only UX helpers', () => {
  it('selects stable hash routes with overview fallback', () => {
    expect(getDashboardViewFromHash('#/mcp-tools')).toBe('mcp-tools');
    expect(getDashboardViewFromHash('#/browser-profiles')).toBe('browser-profiles');
    expect(getDashboardViewFromHash('#/electron')).toBe('electron');
    expect(getDashboardViewFromHash('#/worktrees')).toBe('worktrees');
    expect(getDashboardViewFromHash('#/policy-telemetry')).toBe('policy-telemetry');
    expect(getDashboardViewFromHash('#/governance')).toBe('governance');
    expect(getDashboardViewFromHash('#/readiness')).toBe('readiness');
    expect(getDashboardViewFromHash('#/pilot')).toBe('pilot');
    expect(getDashboardViewFromHash('#/approvals')).toBe('approvals');
    expect(getDashboardViewFromHash('#verification')).toBe('verification');
    expect(getDashboardViewFromHash('#/unknown')).toBe('overview');
    expect(getDashboardHash('evidence')).toBe('#/evidence');
  });

  it('keeps approval UX token handling in component memory only', () => {
    const appSource = readFileSync(new URL('./App.tsx', import.meta.url), 'utf8');

    expect(appSource).toContain('/api/approvals/inbox');
    expect(appSource).toContain('/api/approvals/decisions');
    expect(appSource).not.toContain('localStorage');
    expect(appSource).not.toContain('sessionStorage');
    expect(appSource).not.toContain('indexedDB');
    expect(appSource).not.toContain('approvalToken=');
  });

  it('summarizes approval decision history without raw reason or token data', () => {
    const summary = createApprovalDecisionHistoryReadOnlySummary({
      inboxItems: [
        {
          id: 'approval_inbox_item_1',
          schemaVersion: '2026-04-28.foundation',
          createdAt: '2026-05-04T00:00:00.000Z',
          approvalType: 'worktree',
          approvalRequestId: 'worktree_approval_request_1',
          status: 'requested',
          targetHash: 'sha256:target',
          evidenceRefIds: ['evidence_1'],
          auditEventIds: ['audit_1'],
          canApprove: true,
          canDeny: true,
          canRevoke: false,
          processBoundaryInvoked: false,
          externalProcessStarted: false,
          noRealWrite: true,
          rawPathStored: false,
          bodyStored: false,
          tokenStored: false,
          summary: 'Worktree approval pending.',
        },
      ],
    });
    const serialized = JSON.stringify(summary);

    expect(summary.itemCount).toBe(1);
    expect(summary.requestedCount).toBe(1);
    expect(summary.items[0]?.approvalType).toBe('worktree');
    expect(summary.rawPathStored).toBe(false);
    expect(summary.bodyStored).toBe(false);
    expect(summary.tokenStored).toBe(false);
    expect(serialized).not.toContain('local-control-secret');
    expect(serialized).not.toContain('C:\\');
    expect(serialized).not.toContain('raw prompt');
    expect(serialized).not.toContain('diff --git');
  });

  it('keeps M10 history and acceptance panels display-only in the Dashboard source', () => {
    const appSource = readFileSync(new URL('./App.tsx', import.meta.url), 'utf8');
    const historyPanel = appSource.slice(
      appSource.indexOf('<Panel title="Decision History">'),
      appSource.indexOf('<Panel title="Page-Memory Decision Key">'),
    );
    const acceptancePanel = appSource.slice(
      appSource.indexOf('<Panel title="Acceptance Rehearsal">'),
      appSource.indexOf('      </section>', appSource.indexOf('<Panel title="Acceptance Rehearsal">')),
    );
    const combined = `${historyPanel}\n${acceptancePanel}`;

    expect(combined).toContain('Decision History');
    expect(combined).toContain('Acceptance Rehearsal');
    expect(combined).not.toContain('<button');
    expect(combined).not.toContain('method:');
    expect(combined).not.toContain('fetch(');
    expect(combined).not.toContain('submitApprovalDecision');
    expect(combined).not.toContain('approvalKey');
    expect(combined).not.toContain('local-control');
  });

  it('summarizes MCP tools without write/admin or process boundary state', () => {
    const summary = summarizeMcpTools();

    expect(summary.toolCount).toBe(7);
    expect(summary.actionModes).toEqual(['read']);
    expect(summary.approvalPolicies).toEqual(['not-required']);
    expect(summary.processBoundaryInvoked).toBe(false);
    expect(summary.externalProcessStarted).toBe(false);
    expect(summary.tools.every((tool) => tool.noRealWrite)).toBe(true);
  });

  it('creates a verification preview that cannot start Nx', () => {
    const preview = createVerificationReadinessPreview(['test', 'lint', 'test']);

    expect(preview.targets).toEqual(['lint', 'test']);
    expect(preview.processBoundaryInvoked).toBe(false);
    expect(preview.externalProcessStarted).toBe(false);
    expect(preview.noRealWrite).toBe(true);
    expect(preview.bodyStored).toBe(false);
    expect(preview.verificationCommandPreviewHash).toMatch(/^preview:/);
  });

  it('keeps degraded copy explicit and metadata-only', () => {
    expect(summarizeDegradedState('degraded', 'Supervisor unavailable')).toBe(
      'Supervisor unavailable',
    );
    expect(summarizeDegradedState('ready')).toBe('Read-only data loaded.');
  });

  it('summarizes browser profiles without raw paths or browser execution', () => {
    const summary = createBrowserProfilesReadOnlySummary({
      dryRunCount: 2,
      approvalCount: 1,
      runCount: 1,
      latestRunStatus: 'completed',
    });
    const serialized = JSON.stringify(summary);

    expect(summary.manifestName).toBe('playwright-observer');
    expect(summary.profileCount).toBe(1);
    expect(summary.manifestVersion).toContain('m4c');
    expect(summary.dryRunCount).toBe(2);
    expect(summary.approvalCount).toBe(1);
    expect(summary.runCount).toBe(1);
    expect(summary.latestRunStatus).toBe('completed');
    expect(summary.profilePathHashes[0]).toMatch(/^sha256:/);
    expect(summary.readinessStatus).toBe('blocked');
    expect(summary.processBoundaryInvoked).toBe(false);
    expect(summary.externalProcessStarted).toBe(false);
    expect(summary.noRealWrite).toBe(true);
    expect(summary.rawPathStored).toBe(false);
    expect(summary.bodyStored).toBe(false);
    expect(serialized).not.toContain('codexhub-fixture-browser-profile');
  });

  it('summarizes Electron CDP control-plane metadata without raw endpoint data', () => {
    const summary = createElectronCdpReadOnlySummary({
      dryRunCount: 2,
      approvalCount: 1,
      runCount: 1,
      latestRunStatus: 'completed',
      runnerModes: ['controlled-websocket-events'],
      cdpHttpBoundaryInvoked: true,
      cdpWebSocketBoundaryInvoked: true,
    });
    const serialized = JSON.stringify(summary);

    expect(summary.manifestName).toBe('electron-cdp-adapter');
    expect(summary.manifestVersion).toContain('m5c');
    expect(summary.runnerModes).toEqual(['controlled-websocket-events']);
    expect(summary.allowedCommands).toEqual(['Log.enable', 'Network.enable', 'Runtime.enable']);
    expect(summary.approvalRequired).toBe(true);
    expect(summary.productDefaultEnabled).toBe(false);
    expect(summary.cdpHttpBoundaryInvoked).toBe(true);
    expect(summary.cdpWebSocketBoundaryInvoked).toBe(true);
    expect(summary.processBoundaryInvoked).toBe(false);
    expect(summary.externalProcessStarted).toBe(false);
    expect(summary.noRealWrite).toBe(true);
    expect(summary.rawPathStored).toBe(false);
    expect(summary.bodyStored).toBe(false);
    expect(serialized).not.toContain('127.0.0.1');
    expect(serialized).not.toContain('9222');
    expect(serialized).not.toContain('Codex Desktop');
    expect(serialized).not.toContain('app://');
    expect(serialized).not.toContain('payload');
  });

  it('summarizes worktree control-plane metadata without raw paths or git commands', () => {
    const summary = createWorktreeReadOnlySummary({
      dryRunCount: 1,
      approvalCount: 1,
      runCount: 1,
      cleanupDryRunCount: 1,
      cleanupApprovalCount: 1,
      cleanupRunCount: 1,
      latestRunStatus: 'completed',
      latestCleanupStatus: 'blocked',
      runnerModes: ['controlled-git-worktree'],
      gitBoundaryInvoked: true,
      cleanupRequiredCount: 1,
      cleanupCompletedCount: 0,
    });
    const serialized = JSON.stringify(summary);

    expect(summary.manifestName).toBe('worktree-manager');
    expect(summary.manifestVersion).toContain('m6d');
    expect(summary.runCount).toBe(1);
    expect(summary.cleanupRunCount).toBe(1);
    expect(summary.approvalRequired).toBe(true);
    expect(summary.productDefaultEnabled).toBe(false);
    expect(summary.gitBoundaryInvoked).toBe(true);
    expect(summary.processBoundaryInvoked).toBe(true);
    expect(summary.externalProcessStarted).toBe(true);
    expect(summary.rawPathStored).toBe(false);
    expect(summary.bodyStored).toBe(false);
    expect(serialized).not.toContain('C:\\');
    expect(serialized).not.toContain('../CodexHub-worktrees');
    expect(serialized).not.toContain('git worktree remove');
    expect(serialized).not.toContain('diff --numstat');
    expect(serialized).not.toContain('payload');
  });

  it('summarizes policy backend and telemetry status as read-only advisory metadata', () => {
    const summary = createPolicyTelemetryReadOnlySummary({ projectionSpanCount: 4 });
    const serialized = JSON.stringify(summary);

    expect(summary.policyBackend.manifestName).toBe('policy-backend-adapter');
    expect(summary.policyBackend.productDefaultEnabled).toBe(false);
    expect(summary.policyBackend.advisoryOnly).toBe(true);
    expect(summary.policyBackend.authorityProvider).toBe('codexhub');
    expect(summary.policyBackend.processBoundaryInvoked).toBe(false);
    expect(summary.policyBackend.networkBoundaryInvoked).toBe(false);
    expect(summary.policyBackend.rawPolicySourceStored).toBe(false);
    expect(summary.telemetry.manifestName).toBe('otel-adapter');
    expect(summary.telemetry.localProjectionEnabled).toBe(true);
    expect(summary.telemetry.projectionSpanCount).toBe(4);
    expect(summary.telemetry.projectionHash).toMatch(/^sha256:/);
    expect(summary.telemetry.networkExportAttempted).toBe(false);
    expect(summary.telemetry.openTelemetrySdkLoaded).toBe(false);
    expect(summary.telemetry.evidenceAuditAuthoritative).toBe(false);
    expect(serialized).not.toContain('C:\\');
    expect(serialized).not.toContain('requestBody');
    expect(serialized).not.toContain('responseBody');
    expect(serialized).not.toContain('token');
    expect(serialized).not.toContain('cookie');
    expect(serialized).not.toContain('session');
  });

  it('summarizes unified governance projections without raw run data', () => {
    const summary = createGovernanceReadOnlySummary([
      {
        id: 'codex_run_1',
        source: 'codex_exec_dry_run',
        title: 'Raw title should be hashed',
        status: 'blocked',
        evidenceRefIds: ['evidence_codex_1'],
        auditEventIds: ['audit_codex_1'],
      },
      {
        id: 'electron_run_1',
        source: 'electron_cdp_observation',
        status: 'completed',
        evidenceRefIds: ['evidence_electron_1'],
        auditEventIds: ['audit_electron_1'],
        networkBoundaryInvoked: true,
      },
    ]);
    const serialized = JSON.stringify(summary);

    expect(summary.runCount).toBe(2);
    expect(summary.evidenceCount).toBe(2);
    expect(summary.auditEventCount).toBe(2);
    expect(summary.networkBoundaryCount).toBe(1);
    expect(summary.sources).toEqual([
      { source: 'codex', count: 1 },
      { source: 'electron', count: 1 },
    ]);
    expect(summary.rawPathStored).toBe(false);
    expect(summary.bodyStored).toBe(false);
    expect(summary.projectionHash).toMatch(/^projection:/);
    expect(serialized).not.toContain('Raw title should be hashed');
    expect(serialized).not.toContain('stdout');
    expect(serialized).not.toContain('stderr');
    expect(serialized).not.toContain('diff --git');
    expect(serialized).not.toContain('payload');
  });

  it('summarizes operator readiness without secret values or raw config', () => {
    const summary = createOperatorReadinessReadOnlySummary();
    const serialized = JSON.stringify(summary);

    expect(summary.checkCount).toBeGreaterThan(0);
    expect(summary.integrations.length).toBeGreaterThan(0);
    expect(summary.policyConfigHash).toMatch(/^readiness:/);
    expect(summary.riskConfigHash).toMatch(/^readiness:/);
    expect(summary.integrationConfigHash).toMatch(/^readiness:/);
    expect(summary.rawPathStored).toBe(false);
    expect(summary.bodyStored).toBe(false);
    expect(serialized).not.toContain('CODEXHUB_SUPERVISOR_LOCAL_TOKEN');
    expect(serialized).not.toContain('secret-value');
    expect(serialized).not.toContain('C:\\');
    expect(serialized).not.toContain('raw config body');
  });

  it('summarizes M10 pilot checklist as read-only operator metadata', () => {
    const summary = createM10PilotReadOnlySummary({
      approvalInboxItemCount: 0,
      governanceRunCount: 0,
    });
    const serialized = JSON.stringify(summary);

    expect(summary.status).toBe('blocked');
    expect(summary.stepCount).toBeGreaterThan(0);
    expect(summary.blockerCount).toBeGreaterThan(0);
    expect(summary.localControlKeyRead).toBe(false);
    expect(summary.supervisorPostAllowed).toBe(false);
    expect(summary.adapterExecuteAllowed).toBe(false);
    expect(summary.rawPathStored).toBe(false);
    expect(summary.bodyStored).toBe(false);
    expect(serialized).not.toContain('CODEXHUB_SUPERVISOR_LOCAL_TOKEN');
    expect(serialized).not.toContain('x-codexhub-local-token');
    expect(serialized).not.toContain('raw prompt');
    expect(serialized).not.toContain('stdout');
    expect(serialized).not.toContain('stderr');
    expect(serialized).not.toContain('diff --git');
    expect(serialized).not.toContain('C:\\');
  });

  it('summarizes M10 acceptance rehearsal without execution controls', () => {
    const summary = createM10PilotAcceptanceReadOnlySummary({ scenario: 'all-pass' });
    const failed = createM10PilotAcceptanceReadOnlySummary({ scenario: 'nx-failed' });
    const serialized = JSON.stringify({ summary, failed });

    expect(summary.status).toBe('passed');
    expect(summary.prActionStatus).toBe('not_ready_no_live_pr');
    expect(failed.status).toBe('failed');
    expect(failed.prActionStatus).toBe('blocked');
    expect(summary.processBoundaryInvoked).toBe(false);
    expect(summary.externalProcessStarted).toBe(false);
    expect(summary.networkBoundaryInvoked).toBe(false);
    expect(summary.localControlKeyRead).toBe(false);
    expect(summary.supervisorPostAllowed).toBe(false);
    expect(summary.adapterExecuteAllowed).toBe(false);
    expect(summary.pushAllowed).toBe(false);
    expect(summary.pullRequestOpened).toBe(false);
    expect(serialized).not.toContain('CODEXHUB_SUPERVISOR_LOCAL_TOKEN');
    expect(serialized).not.toContain('x-codexhub-local-token');
    expect(serialized).not.toContain('raw prompt');
    expect(serialized).not.toContain('stdout');
    expect(serialized).not.toContain('stderr');
    expect(serialized).not.toContain('diff --git');
    expect(serialized).not.toContain('C:\\');
  });

  it('summarizes M11 narrow-path pilot metadata without write controls', () => {
    const summary = createM11PilotReadOnlySummary({
      runCount: 1,
      latestRunStatus: 'blocked',
      latestPrDraftStatus: 'blocked',
      latestFailureClassification: 'approval_blocked',
      processBoundaryInvoked: false,
      externalProcessStarted: false,
    });
    const serialized = JSON.stringify(summary);

    expect(summary.status).toBe('available');
    expect(summary.runCount).toBe(1);
    expect(summary.latestPrDraftStatus).toBe('blocked');
    expect(summary.codexReadOnlyDryRunOnly).toBe(true);
    expect(summary.patchGenerationAllowed).toBe(false);
    expect(summary.pushAllowed).toBe(false);
    expect(summary.pullRequestOpened).toBe(false);
    expect(summary.localControlKeyRead).toBe(false);
    expect(summary.supervisorPostAllowed).toBe(false);
    expect(summary.adapterExecuteAllowed).toBe(false);
    expect(summary.rawPathStored).toBe(false);
    expect(summary.bodyStored).toBe(false);
    expect(summary.tokenStored).toBe(false);
    expect(serialized).not.toContain('CODEXHUB_SUPERVISOR_LOCAL_TOKEN');
    expect(serialized).not.toContain('x-codexhub-local-token');
    expect(serialized).not.toContain('raw prompt');
    expect(serialized).not.toContain('stdout');
    expect(serialized).not.toContain('stderr');
    expect(serialized).not.toContain('diff --git');
    expect(serialized).not.toContain('C:\\');
  });
});

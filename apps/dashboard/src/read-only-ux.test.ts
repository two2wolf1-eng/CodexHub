import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { findAdversarialPublicOutputLeaks } from '../../../test-fixtures/adversarial-public-output-fixture';
import {
  createApprovalDecisionHistoryReadOnlySummary,
  createCustomWorkflowReadOnlySummary,
  createElectronCdpReadOnlySummary,
  createGithubActionsAcceptanceRehearsalReadOnlySummary,
  createGithubBranchPublishAcceptanceRehearsalReadOnlySummary,
  createGithubDraftPrAcceptanceRehearsalReadOnlySummary,
  createGithubMergeAcceptanceRehearsalReadOnlySummary,
  createGithubPrLifecycleAcceptanceRehearsalReadOnlySummary,
  createGithubPublishDraftPrAcceptanceRehearsalReadOnlySummary,
  createGithubRemoteCleanupAcceptanceRehearsalReadOnlySummary,
  createGithubProviderReadOnlySummary,
  createGovernanceReadOnlySummary,
  createLocalReviewPackageReadOnlySummary,
  createLocalRcAcceptanceRehearsalReadOnlySummary,
  createLocalRcOperatorReadOnlySummary,
  createM10PilotAcceptanceReadOnlySummary,
  createM10PilotReadOnlySummary,
  createM11PilotAcceptanceSmokeReadOnlySummary,
  createM11PilotReadOnlySummary,
  createOperatorReadinessReadOnlySummary,
  createPolicyTelemetryReadOnlySummary,
  createRemoteSupersedeAcceptanceRehearsalReadOnlySummary,
  createReworkLoopAcceptanceRehearsalReadOnlySummary,
  createVerificationReadinessPreview,
  createBrowserProfilesReadOnlySummary,
  createWorktreeReadOnlySummary,
  DASHBOARD_VIEWS,
  getDashboardHash,
  getDashboardViewFromHash,
  summarizeDegradedState,
  summarizeMcpTools,
} from './read-only-ux';

function expectNoForbiddenRawOutputTerms(serialized: string): void {
  expect(findAdversarialPublicOutputLeaks(serialized)).toEqual([]);
}

function sourceWindow(source: string, startMarker: string, endMarker: string): string {
  const start = source.indexOf(startMarker);
  expect(start).toBeGreaterThanOrEqual(0);

  if (endMarker.length === 0) {
    return source.slice(start);
  }

  const end = source.indexOf(endMarker, start + startMarker.length);
  expect(end).toBeGreaterThan(start);

  return source.slice(start, end);
}

function extractDashboardPostRouteSets(source: string): Record<string, string[]> {
  return Object.fromEntries(
    [
      ...source.matchAll(
        /const\s+(\w+DashboardPostRoutes)\s*=\s*new Set\(\[([\s\S]*?)\]\);/g,
      ),
    ].map((match) => [
      match[1],
      [...match[2].matchAll(/'([^']+)'/g)].map((routeMatch) => routeMatch[1]),
    ]),
  );
}

describe('dashboard read-only UX helpers', () => {
  it('selects stable hash routes with overview fallback', () => {
    expect(getDashboardViewFromHash('#/mcp-tools')).toBe('mcp-tools');
    expect(getDashboardViewFromHash('#/browser-profiles')).toBe('browser-profiles');
    expect(getDashboardViewFromHash('#/electron')).toBe('electron');
    expect(getDashboardViewFromHash('#/github')).toBe('github');
    expect(getDashboardViewFromHash('#/worktrees')).toBe('worktrees');
    expect(getDashboardViewFromHash('#/policy-telemetry')).toBe('policy-telemetry');
    expect(getDashboardViewFromHash('#/governance')).toBe('governance');
    expect(getDashboardViewFromHash('#/readiness')).toBe('readiness');
    expect(getDashboardViewFromHash('#/pilot')).toBe('pilot');
    expect(getDashboardViewFromHash('#/approvals')).toBe('approvals');
    expect(getDashboardViewFromHash('#/release-candidates')).toBe('release-candidates');
    expect(getDashboardViewFromHash('#/operations')).toBe('operations');
    expect(getDashboardViewFromHash('#/workflows')).toBe('workflows');
    expect(getDashboardViewFromHash('#verification')).toBe('verification');
    expect(getDashboardViewFromHash('#/unknown')).toBe('overview');
    expect(getDashboardHash('evidence')).toBe('#/evidence');
  });

  it('keeps M45.8 operator smoke routes registered as stable hash views', () => {
    const operatorSmokeViews = [
      'governance',
      'readiness',
      'github',
      'workflows',
      'deployments',
      'secrets',
      'runtime',
      'operations',
      'policy-telemetry',
      'browser-profiles',
      'electron',
      'mcp-tools',
      'approvals',
      'pilot',
      'release-candidates',
      'releases',
    ] as const;

    for (const view of operatorSmokeViews) {
      expect(DASHBOARD_VIEWS).toContain(view);
      expect(getDashboardViewFromHash(getDashboardHash(view))).toBe(view);
    }
  });

  it('keeps M47-D18 operator smoke routes backed by concrete degraded-safe panels', () => {
    const appSource = readFileSync(new URL('./App.tsx', import.meta.url), 'utf8');
    const operatorSmokePanels = [
      { view: 'governance', firstPanel: 'Unified Governance Projection' },
      { view: 'readiness', firstPanel: 'Operator Readiness' },
      { view: 'github', firstPanel: 'GitHub Provider Readiness' },
      { view: 'workflows', firstPanel: 'Custom Workflow Templates' },
      { view: 'deployments', firstPanel: 'Deployment Observations' },
      { view: 'secrets', firstPanel: 'Secrets Governance' },
      { view: 'policy-telemetry', firstPanel: 'Policy Backend' },
      { view: 'runtime', firstPanel: 'Runtime Scheduler' },
      { view: 'operations', firstPanel: 'Platform Operations' },
    ] as const;

    const smokeSummary = operatorSmokePanels.map(({ view, firstPanel }) => {
      const marker = `activeView === '${view}'`;
      const routeStart = appSource.indexOf(marker);
      expect(routeStart, `${view} route marker`).toBeGreaterThanOrEqual(0);
      const routeWindow = appSource.slice(routeStart, routeStart + 9000);

      expect(DASHBOARD_VIEWS).toContain(view);
      expect(getDashboardViewFromHash(getDashboardHash(view))).toBe(view);
      expect(routeWindow).toContain(`<Panel title="${firstPanel}"`);

      return {
        view,
        route: getDashboardHash(view),
        firstPanel,
        degradedState: summarizeDegradedState('degraded', 'Supervisor unavailable'),
        supervisorPostAttempted: false,
        adapterExecuteInvoked: false,
        tokenPersisted: false,
      };
    });
    const serialized = JSON.stringify(smokeSummary);

    expect(serialized).toContain('#/policy-telemetry');
    expect(serialized).toContain('#/runtime');
    expect(serialized).toContain('#/operations');
    expectNoForbiddenRawOutputTerms(serialized);
    expect(serialized).not.toContain('CODEXHUB_SUPERVISOR_LOCAL_TOKEN');
    expect(serialized).not.toContain('localStorage');
    expect(serialized).not.toContain('sessionStorage');
    expect(serialized).not.toContain('indexedDB');
  });

  it('keeps approval UX token handling in component memory only', () => {
    const appSource = readFileSync(new URL('./App.tsx', import.meta.url), 'utf8');

    expect(appSource).toContain('/api/approvals/inbox');
    expect(appSource).toContain('/api/approvals/decisions');
    expect(appSource).not.toContain('localStorage');
    expect(appSource).not.toContain('window["localStorage"]');
    expect(appSource).not.toContain("window['localStorage']");
    expect(appSource).not.toContain('globalThis["localStorage"]');
    expect(appSource).not.toContain("globalThis['localStorage']");
    expect(appSource).not.toContain('sessionStorage');
    expect(appSource).not.toContain('window["sessionStorage"]');
    expect(appSource).not.toContain("window['sessionStorage']");
    expect(appSource).not.toContain('globalThis["sessionStorage"]');
    expect(appSource).not.toContain("globalThis['sessionStorage']");
    expect(appSource).not.toContain('indexedDB');
    expect(appSource).not.toContain('window["indexedDB"]');
    expect(appSource).not.toContain("window['indexedDB']");
    expect(appSource).not.toContain('globalThis["indexedDB"]');
    expect(appSource).not.toContain("globalThis['indexedDB']");
    expect(appSource).not.toContain('approvalToken=');
  });

  it('keeps Dashboard mutating calls restricted to governed approval, recovery, merge, deployment, and policy telemetry paths', () => {
    const appSource = readFileSync(new URL('./App.tsx', import.meta.url), 'utf8');
    const postMatches = [...appSource.matchAll(/method:\s*['"]POST['"]/g)];
    const approvalDecisionIndex = appSource.indexOf('/api/approvals/decisions');
    const recoveryControlIndex = appSource.indexOf('async function postRecoveryJson');
    const mergeControlIndex = appSource.indexOf('async function postMergeJson');
    const deploymentControlIndex = appSource.indexOf('async function postDeploymentOperationJson');
    const policyTelemetryControlIndex = appSource.indexOf(
      'async function postPolicyTelemetryJson',
    );

    expect(postMatches).toHaveLength(5);
    expect(approvalDecisionIndex).toBeGreaterThanOrEqual(0);
    expect(recoveryControlIndex).toBeGreaterThanOrEqual(0);
    expect(mergeControlIndex).toBeGreaterThanOrEqual(0);
    expect(deploymentControlIndex).toBeGreaterThanOrEqual(0);
    expect(policyTelemetryControlIndex).toBeGreaterThanOrEqual(0);

    const approvalPostIndex = postMatches[0]?.index ?? -1;
    const recoveryPostIndex = postMatches[1]?.index ?? -1;
    const mergePostIndex = postMatches[2]?.index ?? -1;
    const deploymentPostIndex = postMatches[3]?.index ?? -1;
    const policyTelemetryPostIndex = postMatches[4]?.index ?? -1;
    const approvalDecisionWindow = appSource.slice(
      Math.max(0, approvalDecisionIndex - 400),
      approvalDecisionIndex + 900,
    );
    const recoveryControlWindow = appSource.slice(
      Math.max(0, recoveryControlIndex - 500),
      recoveryControlIndex + 1300,
    );
    const mergeControlWindow = appSource.slice(
      Math.max(0, mergeControlIndex - 500),
      mergeControlIndex + 1300,
    );
    const deploymentControlWindow = appSource.slice(
      Math.max(0, deploymentControlIndex - 500),
      deploymentControlIndex + 1300,
    );
    const policyTelemetryControlWindow = appSource.slice(
      Math.max(0, policyTelemetryControlIndex - 500),
      policyTelemetryControlIndex + 1300,
    );

    expect(approvalPostIndex).toBeGreaterThan(approvalDecisionIndex);
    expect(approvalDecisionWindow).toContain("method: 'POST'");
    expect(approvalDecisionWindow).toContain('dashboardLocalControlHeaderName');
    expect(recoveryPostIndex).toBeGreaterThan(recoveryControlIndex);
    expect(recoveryControlWindow).toContain("method: 'POST'");
    expect(recoveryControlWindow).toContain('dashboardLocalControlHeaderName');
    expect(mergePostIndex).toBeGreaterThan(mergeControlIndex);
    expect(mergeControlWindow).toContain("method: 'POST'");
    expect(mergeControlWindow).toContain('dashboardLocalControlHeaderName');
    expect(mergeControlWindow).toContain('mergeDashboardPostRoutes.has(path)');
    expect(deploymentPostIndex).toBeGreaterThan(deploymentControlIndex);
    expect(deploymentControlWindow).toContain("method: 'POST'");
    expect(deploymentControlWindow).toContain('dashboardLocalControlHeaderName');
    expect(deploymentControlWindow).toContain('deploymentOperationDashboardPostRoutes.has(path)');
    expect(policyTelemetryPostIndex).toBeGreaterThan(policyTelemetryControlIndex);
    expect(policyTelemetryControlWindow).toContain("method: 'POST'");
    expect(policyTelemetryControlWindow).toContain('dashboardLocalControlHeaderName');
    expect(policyTelemetryControlWindow).toContain('policyTelemetryDashboardPostRoutes.has(path)');
    expect(approvalDecisionWindow).not.toContain('localStorage');
    expect(approvalDecisionWindow).not.toContain('sessionStorage');
    expect(approvalDecisionWindow).not.toContain('indexedDB');
    expect(approvalDecisionWindow).not.toContain('executeGithub');
    expect(approvalDecisionWindow).not.toContain('adapter.execute');
    expect(recoveryControlWindow).not.toContain('localStorage');
    expect(recoveryControlWindow).not.toContain('sessionStorage');
    expect(recoveryControlWindow).not.toContain('indexedDB');
    expect(recoveryControlWindow).not.toContain('executeGithub');
    expect(recoveryControlWindow).not.toContain('adapter.execute');
    expect(mergeControlWindow).not.toContain('localStorage');
    expect(mergeControlWindow).not.toContain('sessionStorage');
    expect(mergeControlWindow).not.toContain('indexedDB');
    expect(mergeControlWindow).not.toContain('executeGithub');
    expect(mergeControlWindow).not.toContain('adapter.execute');
    expect(deploymentControlWindow).not.toContain('localStorage');
    expect(deploymentControlWindow).not.toContain('sessionStorage');
    expect(deploymentControlWindow).not.toContain('indexedDB');
    expect(deploymentControlWindow).not.toContain('executeGithub');
    expect(deploymentControlWindow).not.toContain('adapter.execute');
    expect(policyTelemetryControlWindow).not.toContain('localStorage');
    expect(policyTelemetryControlWindow).not.toContain('sessionStorage');
    expect(policyTelemetryControlWindow).not.toContain('indexedDB');
    expect(policyTelemetryControlWindow).not.toContain('executeGithub');
    expect(policyTelemetryControlWindow).not.toContain('adapter.execute');
  });

  it('keeps Dashboard POST route sets exact and free of generic expansion', () => {
    const appSource = readFileSync(new URL('./App.tsx', import.meta.url), 'utf8');
    const routeSets = extractDashboardPostRouteSets(appSource);
    const expectedRouteSets = {
      recoveryDashboardPostRoutes: [
        '/api/workflows/production/recoveries/dry-runs',
        '/api/workflows/production/recoveries/approval-requests',
        '/api/workflows/production/recoveries/manual-approvals',
        '/api/workflows/production/recoveries/runs',
      ],
      mergeDashboardPostRoutes: [
        '/api/github/merges/dry-runs',
        '/api/github/merges/approval-requests',
        '/api/github/merges/manual-approvals',
        '/api/github/merges/runs',
      ],
      deploymentOperationDashboardPostRoutes: [
        '/api/deployments/operations/dry-runs',
        '/api/deployments/operations/approval-requests',
        '/api/deployments/operations/manual-approvals',
        '/api/deployments/operations/rollback-plans',
        '/api/deployments/operations/runs',
      ],
      policyTelemetryDashboardPostRoutes: [
        '/api/policy-backends/evaluations/dry-runs',
        '/api/policy-backends/evaluations/approval-requests',
        '/api/policy-backends/evaluations/manual-approvals',
        '/api/policy-backends/evaluations/runs',
        '/api/telemetry/exports/dry-runs',
        '/api/telemetry/exports/approval-requests',
        '/api/telemetry/exports/manual-approvals',
        '/api/telemetry/exports/runs',
      ],
    } satisfies Record<string, string[]>;
    const allowedRoutePrefixes = [
      '/api/workflows/production/recoveries/',
      '/api/github/merges/',
      '/api/deployments/operations/',
      '/api/policy-backends/evaluations/',
      '/api/telemetry/exports/',
    ];
    const unsafeRouteTerms = [
      'actions',
      'agents',
      'browser',
      'comments',
      'electron',
      'labels',
      'mcp',
      'platform',
      'release',
      'reviewers',
      'runtime',
      'secrets',
    ];

    expect(routeSets).toEqual(expectedRouteSets);
    expect(Object.keys(routeSets).sort()).toEqual(Object.keys(expectedRouteSets).sort());

    for (const routes of Object.values(routeSets)) {
      for (const route of routes) {
        expect(allowedRoutePrefixes.some((prefix) => route.startsWith(prefix))).toBe(true);
        for (const unsafeTerm of unsafeRouteTerms) {
          expect(route).not.toContain(unsafeTerm);
        }
      }
    }

    expect(appSource).not.toContain("startsWith('/api/");
    expect(appSource).not.toContain('startsWith("/api/');
    expect(appSource).not.toContain("includes('/api/");
    expect(appSource).not.toContain('includes("/api/');
    expect(appSource).not.toContain("indexOf('/api/");
    expect(appSource).not.toContain('indexOf("/api/');
    expect(appSource).not.toContain('.setItem(');
    expect(appSource).not.toContain('.getItem(');
    expect(appSource).not.toContain('localStorage');
    expect(appSource).not.toContain('sessionStorage');
    expect(appSource).not.toContain('indexedDB');
    expect(appSource).not.toContain('document.cookie');
    expect(appSource).not.toContain('URLSearchParams');
    expect(appSource).not.toContain('history.pushState');
    expect(appSource).not.toContain('history.replaceState');
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

  it('keeps M45.8 degraded smoke summaries metadata-only across late views', () => {
    const smokeViews = [
      'governance',
      'readiness',
      'github',
      'workflows',
      'deployments',
      'secrets',
      'runtime',
      'operations',
      'policy-telemetry',
      'browser-profiles',
      'electron',
      'mcp-tools',
    ] as const;
    const summaries = smokeViews.map((view) => ({
      view,
      route: getDashboardHash(view),
      state: summarizeDegradedState('degraded', 'Supervisor unavailable'),
      postAttempted: false,
      adapterExecuteInvoked: false,
      localControlStored: false,
    }));
    const serialized = JSON.stringify(summaries);

    expect(serialized).toContain('#/deployments');
    expect(serialized).toContain('#/secrets');
    expect(serialized).toContain('#/runtime');
    expect(serialized).toContain('#/operations');
    expect(serialized).toContain('#/policy-telemetry');
    expect(serialized).toContain('#/browser-profiles');
    expect(serialized).toContain('#/electron');
    expect(serialized).toContain('#/mcp-tools');
    expectNoForbiddenRawOutputTerms(serialized);
    expect(serialized).not.toContain('CODEXHUB_SUPERVISOR_LOCAL_TOKEN');
    expect(serialized).not.toContain('localStorage');
    expect(serialized).not.toContain('sessionStorage');
    expect(serialized).not.toContain('indexedDB');
  });

  it('applies shared forbidden raw-output checks to representative read-only summaries', () => {
    const summaries = [
      createGithubProviderReadOnlySummary({
        runCount: 1,
        draftPrRunCount: 1,
        branchPublishRunCount: 1,
        prLifecycleRunCount: 1,
        actionsObservationRunCount: 1,
        actionsDispatchRunCount: 1,
        remoteCleanupRunCount: 1,
        networkBoundaryInvoked: true,
      }),
      createGithubActionsAcceptanceRehearsalReadOnlySummary({
        scenario: 'dispatch-inputs-rejected',
      }),
      createCustomWorkflowReadOnlySummary({
        templateCount: 1,
        validationCount: 1,
        runCount: 1,
        latestRunStatus: 'blocked',
      }),
      createM11PilotReadOnlySummary({
        runCount: 1,
        latestRunStatus: 'blocked',
        latestPrDraftStatus: 'blocked',
      }),
      createLocalRcOperatorReadOnlySummary({
        runCount: 1,
        readinessStatus: 'blocked_operator_readiness',
        reviewDecisionStatus: 'approved_for_local_rc',
        verificationStatus: 'passed',
        operatorReadinessStatus: 'blocked',
      }),
    ];

    expectNoForbiddenRawOutputTerms(JSON.stringify(summaries));
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

  it('summarizes custom workflow UX as read-only governance metadata', () => {
    const summary = createCustomWorkflowReadOnlySummary({
      dryRunCount: 2,
      approvalCount: 1,
      runCount: 1,
      latestRunStatus: 'blocked',
      latestProductionRehearsalScenario: 'stale-template-hash',
      latestProductionRehearsalStatus: 'blocked',
      latestProductionPilotTemplateId: 'github-draft-pr-chain',
      latestProductionPilotStatus: 'blocked',
      latestProductionPilotReadinessStatus: 'blocked',
      productionPilotEvidenceRefCount: 2,
      productionPilotAuditEventCount: 2,
      operationsRunHealth: 'rollback-required',
      operationsBlockedReasonCount: 1,
      operationsStaleChildRecordCount: 1,
      operationsRollbackAvailable: true,
      recoveryDryRunCount: 1,
      recoveryApprovalCount: 1,
      recoveryRunCount: 1,
      latestRecoveryStatus: 'waiting_for_child_approval',
      latestRecoveryChildActionCount: 5,
      latestRecoveryWaitingForChildApproval: true,
      processBoundaryInvoked: false,
      networkBoundaryInvoked: false,
    });
    const serialized = JSON.stringify(summary);

    expect(summary.manifestName).toBe('custom-workflow');
    expect(summary.manifestVersion).toContain('m30');
    expect(summary.catalogTemplateCount).toBe(4);
    expect(summary.catalogReadyCount).toBe(0);
    expect(summary.catalogBlockedOrDisabledCount).toBe(4);
    expect(summary.catalogFamilies).toEqual(['local', 'github']);
    expect(summary.productionTemplateIds).toContain('local-patch-review');
    expect(summary.productionExecutionEnabled).toBe(false);
    expect(summary.latestProductionRehearsalScenario).toBe('stale-template-hash');
    expect(summary.latestProductionRehearsalStatus).toBe('blocked');
    expect(summary.productionRehearsalFixtureOnly).toBe(true);
    expect(summary.latestProductionPilotTemplateId).toBe('github-draft-pr-chain');
    expect(summary.latestProductionPilotStatus).toBe('blocked');
    expect(summary.latestProductionPilotReadinessStatus).toBe('blocked');
    expect(summary.productionPilotEvidenceRefCount).toBe(2);
    expect(summary.productionPilotAuditEventCount).toBe(2);
    expect(summary.productionPilotFixtureOnly).toBe(true);
    expect(summary.operationsRunHealth).toBe('rollback-required');
    expect(summary.operationsBlockedReasonCount).toBe(1);
    expect(summary.operationsStaleChildRecordCount).toBe(1);
    expect(summary.operationsRollbackAvailable).toBe(true);
    expect(summary.recoveryDryRunCount).toBe(1);
    expect(summary.recoveryApprovalCount).toBe(1);
    expect(summary.recoveryRunCount).toBe(1);
    expect(summary.latestRecoveryStatus).toBe('waiting_for_child_approval');
    expect(summary.latestRecoveryChildActionCount).toBe(5);
    expect(summary.latestRecoveryWaitingForChildApproval).toBe(true);
    expect(summary.recoveryChildApprovalsRemainSeparate).toBe(true);
    expect(summary.recoveryDirectChildExecutionAllowed).toBe(false);
    expect(summary.dryRunCount).toBe(2);
    expect(summary.approvalRequired).toBe(true);
    expect(summary.childApprovalsRequired).toBe(true);
    expect(summary.productDefaultEnabled).toBe(false);
    expect(summary.supervisorPostAllowed).toBe(false);
    expect(summary.localControlKeyRead).toBe(false);
    expect(summary.directAdapterExecutionAllowed).toBe(false);
    expect(summary.directChildExecutionAllowed).toBe(false);
    expect(summary.processBoundaryInvoked).toBe(false);
    expect(summary.externalProcessStarted).toBe(false);
    expect(summary.networkBoundaryInvoked).toBe(false);
    expect(summary.noRealWrite).toBe(true);
    expect(summary.rawPathStored).toBe(false);
    expect(summary.bodyStored).toBe(false);
    expect(serialized).not.toContain('raw prompt');
    expect(serialized).not.toContain('diff --git');
    expect(serialized).not.toContain('local-control-secret');
    expect(serialized).not.toContain('C:\\');
    expect(serialized).not.toContain('approvalArtifact');
  });

  it('summarizes GitHub provider metadata without raw remote refs or credentials', () => {
    const summary = createGithubProviderReadOnlySummary({
      dryRunCount: 1,
      approvalCount: 1,
      runCount: 1,
      draftPrDryRunCount: 1,
      draftPrApprovalCount: 1,
      draftPrRunCount: 1,
      branchPublishDryRunCount: 1,
      branchPublishApprovalCount: 1,
      branchPublishRunCount: 1,
      publishDraftPrChainDryRunCount: 1,
      publishDraftPrChainRunCount: 1,
      prLifecycleDryRunCount: 1,
      prLifecycleApprovalCount: 1,
      prLifecycleRunCount: 1,
      mergeDryRunCount: 1,
      mergeApprovalCount: 2,
      mergeRunCount: 1,
      actionsObservationDryRunCount: 1,
      actionsObservationApprovalCount: 1,
      actionsObservationRunCount: 1,
      actionsRerunDryRunCount: 1,
      actionsRerunApprovalCount: 1,
      actionsRerunRunCount: 1,
      actionsCancelDryRunCount: 1,
      actionsCancelApprovalCount: 1,
      actionsCancelRunCount: 1,
      actionsDispatchDryRunCount: 1,
      actionsDispatchApprovalCount: 1,
      actionsDispatchRunCount: 1,
      remoteSupersedeDryRunCount: 1,
      remoteSupersedeRunCount: 1,
      remoteCleanupDryRunCount: 1,
      remoteCleanupApprovalCount: 1,
      remoteCleanupRunCount: 1,
      latestRunStatus: 'completed',
      latestDraftPrRunStatus: 'completed',
      latestDraftPrCreationStatus: 'created',
      latestBranchPublishRunStatus: 'completed',
      latestBranchPublishCreationStatus: 'created',
      latestPublishDraftPrChainRunStatus: 'completed',
      latestPublishDraftPrChainLifecycleStatus: 'checks_passed',
      latestPrLifecycleRunStatus: 'completed',
      latestPrLifecycleStatusSummary: 'checks_passed',
      latestMergeRunStatus: 'completed',
      latestMergeReadinessStatus: 'ready_for_merge',
      latestActionsObservationRunStatus: 'completed',
      latestActionsObservationConclusion: 'success',
      latestActionsLogStatus: 'hashed',
      latestActionsRerunRunStatus: 'completed',
      latestActionsCancelRunStatus: 'completed',
      latestActionsDispatchRunStatus: 'completed',
      latestRemoteSupersedeRunStatus: 'projected',
      latestRemoteCleanupRunStatus: 'completed',
      latestRemoteCleanupReadinessStatus: 'ready_for_cleanup',
      draftPrCreatedCount: 1,
      branchPublishCreatedCount: 1,
      credentialConfigured: true,
      networkBoundaryInvoked: true,
    });
    const serialized = JSON.stringify(summary);

    expect(summary.manifestName).toBe('github-provider');
    expect(summary.manifestVersion).toContain('m39');
    expect(summary.draftPrRunCount).toBe(1);
    expect(summary.branchPublishRunCount).toBe(1);
    expect(summary.publishDraftPrChainRunCount).toBe(1);
    expect(summary.prLifecycleRunCount).toBe(1);
    expect(summary.mergeRunCount).toBe(1);
    expect(summary.actionsObservationRunCount).toBe(1);
    expect(summary.actionsRerunRunCount).toBe(1);
    expect(summary.actionsCancelRunCount).toBe(1);
    expect(summary.actionsDispatchRunCount).toBe(1);
    expect(summary.remoteSupersedeRunCount).toBe(1);
    expect(summary.remoteCleanupRunCount).toBe(1);
    expect(summary.latestRemoteCleanupReadinessStatus).toBe('ready_for_cleanup');
    expect(summary.latestDraftPrCreationStatus).toBe('created');
    expect(summary.latestBranchPublishCreationStatus).toBe('created');
    expect(summary.draftPrCreatedCount).toBe(1);
    expect(summary.branchPublishCreatedCount).toBe(1);
    expect(summary.productDefaultEnabled).toBe(false);
    expect(summary.approvalRequired).toBe(true);
    expect(summary.draftPrApprovalRequired).toBe(true);
    expect(summary.branchPublishApprovalRequired).toBe(true);
    expect(summary.publishDraftPrChainSeparateApprovalsRequired).toBe(true);
    expect(summary.prLifecycleApprovalRequired).toBe(true);
    expect(summary.mergeApprovalRequired).toBe(true);
    expect(summary.mergeRequiresTwoApprovals).toBe(true);
    expect(summary.actionsObservationApprovalRequired).toBe(true);
    expect(summary.actionsRunControlApprovalRequired).toBe(true);
    expect(summary.actionsDispatchApprovalRequired).toBe(true);
    expect(summary.remoteSupersedeProjectionOnly).toBe(true);
    expect(summary.remoteCleanupApprovalRequired).toBe(true);
    expect(summary.allowedRemoteCleanupActions).toContain('codexhub_ref_delete');
    expect(summary.allowedGithubActionsObservationActions).toContain('workflow_run_logs_hash');
    expect(summary.allowedGithubActionsDispatchActions).toContain('fixed_ref_dispatch_post');
    expect(summary.blockedOperations).toEqual(
      expect.arrayContaining([
        'non_codexhub_branch_delete',
        'arbitrary_workflow_dispatch_payload',
        'raw_actions_logs',
        'release',
        'deployment',
      ]),
    );
    expect(summary.credentialHashOnly).toBe(true);
    expect(summary.credentialValueStored).toBe(false);
    expect(summary.networkBoundaryInvoked).toBe(true);
    expect(summary.processBoundaryInvoked).toBe(false);
    expect(summary.externalProcessStarted).toBe(false);
    expect(summary.rawRemoteRefStored).toBe(false);
    expect(summary.rawUrlStored).toBe(false);
    expect(summary.bodyStored).toBe(false);
    expect(serialized).not.toContain('octocat');
    expect(serialized).not.toContain('hello-world');
    expect(serialized).not.toContain('refs/heads');
    expect(serialized).not.toContain('https://api.github.com');
    expect(serialized).not.toContain('raw PR markdown');
    expect(serialized).not.toContain('ghp_');
    expect(serialized).not.toContain('Authorization');
    expect(serialized).not.toContain('responseBody');
    expect(serialized).not.toContain('file contents');
    expect(serialized).not.toContain('raw action log');
    expect(serialized).not.toContain('workflow inputs');
  });

  it('summarizes GitHub Actions acceptance rehearsal without raw logs or dispatch payloads', () => {
    const passed = createGithubActionsAcceptanceRehearsalReadOnlySummary({
      scenario: 'observation-all-pass',
    });
    const blocked = createGithubActionsAcceptanceRehearsalReadOnlySummary({
      scenario: 'dispatch-inputs-rejected',
    });
    const failed = createGithubActionsAcceptanceRehearsalReadOnlySummary({
      scenario: 'rerun-failed',
    });
    const serialized = JSON.stringify({ passed, blocked, failed });

    expect(passed.status).toBe('passed');
    expect(blocked.status).toBe('blocked');
    expect(failed.status).toBe('failed');
    expect(passed.fixedEndpointOnly).toBe(true);
    expect(passed.supervisorPostAllowed).toBe(false);
    expect(passed.adapterExecuteAllowed).toBe(false);
    expect(passed.networkBoundaryInvoked).toBe(false);
    expect(passed.rawLogStored).toBe(false);
    expect(passed.rawArtifactStored).toBe(false);
    expect(passed.arbitraryPayloadAllowed).toBe(false);
    expect(passed.jenkinsLiveRouteEnabled).toBe(false);
    expect(passed.buildkiteLiveRouteEnabled).toBe(false);
    expect(passed.droneLiveRouteEnabled).toBe(false);
    expect(serialized).not.toContain('ghp_');
    expect(serialized).not.toContain('https://api.github.com');
    expect(serialized).not.toContain('raw log');
    expect(serialized).not.toContain('artifact body');
    expect(serialized).not.toContain('workflow inputs');
  });

  it('summarizes remote supersede and cleanup rehearsals without network or write controls', () => {
    const supersede = createRemoteSupersedeAcceptanceRehearsalReadOnlySummary({
      scenario: 'old-pr-open',
    });
    const cleanup = createGithubRemoteCleanupAcceptanceRehearsalReadOnlySummary({
      scenario: 'branch-not-codexhub',
    });
    const serialized = JSON.stringify({ supersede, cleanup });

    expect(supersede.status).toBe('passed');
    expect(supersede.remoteWriteInvoked).toBe(false);
    expect(supersede.cleanupRecommended).toBe(true);
    expect(supersede.supervisorPostAllowed).toBe(false);
    expect(cleanup.status).toBe('blocked');
    expect(cleanup.deleteNonCodexhubBranchAllowed).toBe(false);
    expect(cleanup.closePrAllowed).toBe(true);
    expect(cleanup.deleteRefAllowed).toBe(true);
    expect(cleanup.updateRefAllowed).toBe(false);
    expect(cleanup.forceAllowed).toBe(false);
    expect(cleanup.commentAllowed).toBe(false);
    expect(cleanup.labelAllowed).toBe(false);
    expect(cleanup.reviewerAllowed).toBe(false);
    expect(cleanup.networkBoundaryInvoked).toBe(false);
    expect(cleanup.localControlKeyRead).toBe(false);
    expect(cleanup.adapterExecuteAllowed).toBe(false);
    expect(serialized).not.toContain('ghp_');
    expect(serialized).not.toContain('octocat');
    expect(serialized).not.toContain('https://api.github.com');
    expect(serialized).not.toContain('raw PR markdown');
  });

  it('summarizes GitHub PR lifecycle acceptance rehearsal without network or raw response use', () => {
    const passed = createGithubPrLifecycleAcceptanceRehearsalReadOnlySummary({
      scenario: 'checks-passed',
    });
    const failed = createGithubPrLifecycleAcceptanceRehearsalReadOnlySummary({
      scenario: 'checks-failed',
    });
    const blocked = createGithubPrLifecycleAcceptanceRehearsalReadOnlySummary({
      scenario: 'pr-not-found',
    });
    const serialized = JSON.stringify({ passed, failed, blocked });

    expect(passed.status).toBe('passed');
    expect(passed.lifecycleStatus).toBe('checks_passed');
    expect(failed.status).toBe('failed');
    expect(blocked.status).toBe('blocked');
    expect(blocked.lifecycleStatus).toBe('not_found');
    expect(passed.fixedGetOnly).toBe(true);
    expect(passed.networkBoundaryInvoked).toBe(false);
    expect(passed.supervisorPostAllowed).toBe(false);
    expect(passed.adapterExecuteAllowed).toBe(false);
    expect(passed.commentsAllowed).toBe(false);
    expect(passed.labelsAllowed).toBe(false);
    expect(passed.reviewersAllowed).toBe(false);
    expect(passed.mergeAllowed).toBe(false);
    expect(passed.rawUrlStored).toBe(false);
    expect(passed.rawResponseBodyStored).toBe(false);
    expect(serialized).not.toContain('octocat');
    expect(serialized).not.toContain('hello-world');
    expect(serialized).not.toContain('ghp_');
    expect(serialized).not.toContain('Authorization');
    expect(serialized).not.toContain('raw PR markdown');
    expect(serialized).not.toContain('https://api.github.com');
    expect(serialized).not.toContain('check logs');
  });

  it('summarizes rework loop acceptance rehearsal without child execution or raw reasons', () => {
    const passed = createReworkLoopAcceptanceRehearsalReadOnlySummary({
      scenario: 'all-pass',
    });
    const blocked = createReworkLoopAcceptanceRehearsalReadOnlySummary({
      scenario: 'approval-blocked',
    });
    const failed = createReworkLoopAcceptanceRehearsalReadOnlySummary({
      scenario: 'branch-publish-failed',
    });
    const serialized = JSON.stringify({ passed, blocked, failed });

    expect(passed.status).toBe('passed');
    expect(blocked.status).toBe('blocked');
    expect(failed.status).toBe('failed');
    expect(passed.childApprovalsRequired).toBe(true);
    expect(passed.directChildExecutionAllowed).toBe(false);
    expect(passed.patchExecuted).toBe(false);
    expect(passed.branchPublished).toBe(false);
    expect(passed.draftPrCreated).toBe(false);
    expect(passed.networkBoundaryInvoked).toBe(false);
    expect(passed.processBoundaryInvoked).toBe(false);
    expect(serialized).not.toContain('raw diff');
    expect(serialized).not.toContain('raw PR markdown');
    expect(serialized).not.toContain('raw reason');
    expect(serialized).not.toContain('Authorization');
    expect(serialized).not.toContain('CODEXHUB_SUPERVISOR_LOCAL');
  });

  it('summarizes GitHub branch publish acceptance rehearsal without network or file content use', () => {
    const passed = createGithubBranchPublishAcceptanceRehearsalReadOnlySummary({
      scenario: 'all-pass',
    });
    const failed = createGithubBranchPublishAcceptanceRehearsalReadOnlySummary({
      scenario: 'ref-create-failed',
    });
    const blocked = createGithubBranchPublishAcceptanceRehearsalReadOnlySummary({
      scenario: 'branch-exists',
    });
    const serialized = JSON.stringify({ passed, failed, blocked });

    expect(passed.status).toBe('passed');
    expect(passed.publishStatus).toBe('fixture_completed');
    expect(failed.status).toBe('failed');
    expect(blocked.status).toBe('blocked');
    expect(blocked.readinessStatus).toBe('blocked_existing_branch');
    expect(passed.networkBoundaryInvoked).toBe(false);
    expect(passed.supervisorPostAllowed).toBe(false);
    expect(passed.adapterExecuteAllowed).toBe(false);
    expect(passed.createRefAllowed).toBe(true);
    expect(passed.updateRefAllowed).toBe(false);
    expect(passed.forceAllowed).toBe(false);
    expect(passed.pushAllowed).toBe(false);
    expect(passed.mergeAllowed).toBe(false);
    expect(passed.rawFileContentStored).toBe(false);
    expect(passed.credentialValueStored).toBe(false);
    expect(serialized).not.toContain('octocat');
    expect(serialized).not.toContain('hello-world');
    expect(serialized).not.toContain('ghp_');
    expect(serialized).not.toContain('Authorization');
    expect(serialized).not.toContain('diff --git');
    expect(serialized).not.toContain('raw file content');
  });

  it('summarizes GitHub draft PR acceptance rehearsal without network or credential use', () => {
    const passed = createGithubDraftPrAcceptanceRehearsalReadOnlySummary({
      scenario: 'all-pass',
    });
    const failed = createGithubDraftPrAcceptanceRehearsalReadOnlySummary({
      scenario: 'github-post-failed',
    });
    const blocked = createGithubDraftPrAcceptanceRehearsalReadOnlySummary({
      scenario: 'existing-pr-found',
    });
    const serialized = JSON.stringify({ passed, failed, blocked });

    expect(passed.status).toBe('passed');
    expect(passed.prCreationStatus).toBe('fixture_completed');
    expect(failed.status).toBe('failed');
    expect(blocked.status).toBe('blocked');
    expect(blocked.readinessStatus).toBe('blocked_existing_pr');
    expect(passed.networkBoundaryInvoked).toBe(false);
    expect(passed.supervisorPostAllowed).toBe(false);
    expect(passed.adapterExecuteAllowed).toBe(false);
    expect(passed.pushAllowed).toBe(false);
    expect(passed.createRefAllowed).toBe(false);
    expect(passed.mergeAllowed).toBe(false);
    expect(passed.credentialValueStored).toBe(false);
    expect(serialized).not.toContain('octocat');
    expect(serialized).not.toContain('hello-world');
    expect(serialized).not.toContain('ghp_');
    expect(serialized).not.toContain('Authorization');
    expect(serialized).not.toContain('raw PR markdown');
  });

  it('summarizes GitHub publish to draft PR acceptance rehearsal without remote writes', () => {
    const passed = createGithubPublishDraftPrAcceptanceRehearsalReadOnlySummary({
      scenario: 'checks-passed',
    });
    const failed = createGithubPublishDraftPrAcceptanceRehearsalReadOnlySummary({
      scenario: 'checks-failed',
    });
    const blocked = createGithubPublishDraftPrAcceptanceRehearsalReadOnlySummary({
      scenario: 'publish-blocked',
    });
    const serialized = JSON.stringify({ passed, failed, blocked });

    expect(passed.status).toBe('passed');
    expect(passed.lifecycleStatus).toBe('checks_passed');
    expect(failed.status).toBe('failed');
    expect(blocked.status).toBe('blocked');
    expect(blocked.draftPrStatus).toBe('skipped');
    expect(passed.networkBoundaryInvoked).toBe(false);
    expect(passed.supervisorPostAllowed).toBe(false);
    expect(passed.adapterExecuteAllowed).toBe(false);
    expect(passed.pushAllowed).toBe(false);
    expect(passed.updateRefAllowed).toBe(false);
    expect(passed.forceAllowed).toBe(false);
    expect(passed.mergeAllowed).toBe(false);
    expect(passed.rawPrBodyStored).toBe(false);
    expect(passed.rawUrlStored).toBe(false);
    expect(serialized).not.toContain('octocat');
    expect(serialized).not.toContain('hello-world');
    expect(serialized).not.toContain('ghp_');
    expect(serialized).not.toContain('Authorization');
    expect(serialized).not.toContain('raw PR markdown');
    expect(serialized).not.toContain('https://api.github.com');
  });

  it('summarizes GitHub merge acceptance rehearsal without network or credential use', () => {
    const passed = createGithubMergeAcceptanceRehearsalReadOnlySummary({
      scenario: 'all-pass',
    });
    const blocked = createGithubMergeAcceptanceRehearsalReadOnlySummary({
      scenario: 'second-approval-missing',
    });
    const failed = createGithubMergeAcceptanceRehearsalReadOnlySummary({
      scenario: 'merge-conflict',
    });
    const serialized = JSON.stringify({ passed, blocked, failed });

    expect(passed.status).toBe('passed');
    expect(passed.readinessStatus).toBe('ready_for_merge');
    expect(blocked.status).toBe('blocked');
    expect(blocked.readinessStatus).toBe('blocked_second_approval');
    expect(failed.status).toBe('failed');
    expect(passed.requiresTwoApprovals).toBe(true);
    expect(passed.networkBoundaryInvoked).toBe(false);
    expect(passed.supervisorPostAllowed).toBe(false);
    expect(passed.adapterExecuteAllowed).toBe(false);
    expect(passed.pushAllowed).toBe(false);
    expect(passed.updateRefAllowed).toBe(false);
    expect(passed.forceAllowed).toBe(false);
    expect(passed.arbitraryEndpointAllowed).toBe(false);
    expect(passed.rawPrBodyStored).toBe(false);
    expect(passed.rawReviewBodyStored).toBe(false);
    expect(passed.rawResponseBodyStored).toBe(false);
    expect(passed.credentialValueStored).toBe(false);
    expect(serialized).not.toContain('octocat');
    expect(serialized).not.toContain('hello-world');
    expect(serialized).not.toContain('ghp_');
    expect(serialized).not.toContain('Authorization');
    expect(serialized).not.toContain('raw PR markdown');
    expect(serialized).not.toContain('https://api.github.com');
  });

  it('summarizes local review packages without raw artifacts or decision reasons', () => {
    const summary = createLocalReviewPackageReadOnlySummary({
      dryRunCount: 1,
      approvalCount: 1,
      runCount: 1,
      decisionCount: 1,
      latestRunStatus: 'completed',
      latestDecisionStatus: 'pending',
      verificationStatuses: ['passed'],
      exportedCount: 1,
      artifactWriteBoundaryInvoked: true,
      fileCount: 2,
      byteCount: 512,
      evidenceCount: 1,
      auditEventCount: 1,
    });
    const serialized = JSON.stringify(summary);

    expect(summary.runCount).toBe(1);
    expect(summary.approvalRequired).toBe(true);
    expect(summary.productDefaultEnabled).toBe(false);
    expect(summary.artifactWriteBoundaryInvoked).toBe(true);
    expect(summary.rawPathStored).toBe(false);
    expect(summary.bodyStored).toBe(false);
    expect(summary.tokenStored).toBe(false);
    expect(serialized).not.toContain('../CodexHub-artifacts');
    expect(serialized).not.toContain('diff --git');
    expect(serialized).not.toContain('raw PR');
    expect(serialized).not.toContain('raw reason');
    expect(serialized).not.toContain('local-control-secret');
  });

  it('summarizes local RC acceptance rehearsal without export or remote actions', () => {
    const passed = createLocalRcAcceptanceRehearsalReadOnlySummary({ scenario: 'all-pass' });
    const blocked = createLocalRcAcceptanceRehearsalReadOnlySummary({
      scenario: 'export-blocked',
    });
    const serialized = JSON.stringify({ passed, blocked });

    expect(passed.status).toBe('passed');
    expect(passed.operatorAcceptanceStatus).toBe('accepted');
    expect(blocked.status).toBe('blocked');
    expect(blocked.exportSummaryStatus).toBe('blocked');
    expect(passed.artifactWriteBoundaryInvoked).toBe(false);
    expect(passed.supervisorPostAllowed).toBe(false);
    expect(passed.adapterExecuteAllowed).toBe(false);
    expect(passed.rawPathStored).toBe(false);
    expect(passed.bodyStored).toBe(false);
    expect(passed.tokenStored).toBe(false);
    expect(serialized).not.toContain('../CodexHub-artifacts');
    expect(serialized).not.toContain('diff --git');
    expect(serialized).not.toContain('raw reason');
    expect(serialized).not.toContain('local-control-secret');
    expect(serialized).not.toContain('token=');
  });

  it('summarizes local RC operator metadata without raw artifacts or write controls', () => {
    const summary = createLocalRcOperatorReadOnlySummary({
      dryRunCount: 1,
      approvalCount: 1,
      runCount: 1,
      latestRunStatus: 'completed',
      readinessStatus: 'ready_for_local_acceptance',
      reviewDecisionStatus: 'approved_for_local_rc',
      verificationStatus: 'passed',
      operatorReadinessStatus: 'ready',
      bundleHash: 'sha256:local-rc-bundle',
      artifactWriteBoundaryInvoked: true,
      fileCount: 2,
      byteCount: 1024,
      evidenceCount: 3,
      auditEventCount: 3,
      noRealWrite: false,
    });
    const serialized = JSON.stringify(summary);

    expect(summary.runCount).toBe(1);
    expect(summary.readinessStatus).toBe('ready_for_local_acceptance');
    expect(summary.reviewDecisionStatus).toBe('approved_for_local_rc');
    expect(summary.productDefaultEnabled).toBe(false);
    expect(summary.approvalRequired).toBe(true);
    expect(summary.localOnly).toBe(true);
    expect(summary.localControlKeyRead).toBe(false);
    expect(summary.supervisorPostAllowed).toBe(false);
    expect(summary.adapterExecuteAllowed).toBe(false);
    expect(summary.pushAllowed).toBe(false);
    expect(summary.pullRequestOpened).toBe(false);
    expect(summary.rawPathStored).toBe(false);
    expect(summary.bodyStored).toBe(false);
    expect(summary.tokenStored).toBe(false);
    expect(serialized).not.toContain('../CodexHub-artifacts');
    expect(serialized).not.toContain('diff --git');
    expect(serialized).not.toContain('raw PR');
    expect(serialized).not.toContain('raw reason');
    expect(serialized).not.toContain('local-control-secret');
  });

  it('keeps the local RC acceptance panel display-only in the Dashboard source', () => {
    const appSource = readFileSync(new URL('./App.tsx', import.meta.url), 'utf8');
    const localRcPanel = appSource.slice(
      appSource.indexOf('<Panel title="Local RC Acceptance Rehearsal">'),
      appSource.indexOf('<Panel title="M10 Pilot Checklist">'),
    );

    expect(localRcPanel).toContain('Local RC Acceptance Rehearsal');
    expect(localRcPanel).not.toContain('<button');
    expect(localRcPanel).not.toContain('fetch(');
    expect(localRcPanel).not.toContain("method: 'POST'");
    expect(localRcPanel).not.toContain('approvalKey');
    expect(localRcPanel).not.toContain('local-control');
  });

  it('keeps the local RC operator route display-only in the Dashboard source', () => {
    const appSource = readFileSync(new URL('./App.tsx', import.meta.url), 'utf8');
    const localRcRoute = appSource.slice(
      appSource.indexOf("if (activeView === 'release-candidates')"),
      appSource.indexOf("if (activeView === 'releases')"),
    );

    expect(localRcRoute).toContain('Local RC Readiness');
    expect(localRcRoute).toContain('RC Bundle Runs');
    expect(localRcRoute).toContain('Review Package State');
    expect(localRcRoute).toContain('Acceptance Rehearsal');
    expect(localRcRoute).not.toContain('<button');
    expect(localRcRoute).not.toContain('fetch(');
    expect(localRcRoute).not.toContain("method: 'POST'");
    expect(localRcRoute).not.toContain('approvalKey');
    expect(localRcRoute).not.toContain('local-control');
  });

  it('keeps the GitHub provider route limited to the merge wizard mutation surface', () => {
    const appSource = readFileSync(new URL('./App.tsx', import.meta.url), 'utf8');
    const githubRoute = appSource.slice(
      appSource.indexOf("if (activeView === 'github')"),
      appSource.indexOf("if (activeView === 'worktrees')"),
    );
    const mergeWizard = githubRoute.slice(
      githubRoute.indexOf('<Panel title="GitHub Merge Guided Operation">'),
      githubRoute.indexOf('<Panel title="GitHub Merge Runs">'),
    );

    expect(githubRoute).toContain('GitHub Provider Readiness');
    expect(githubRoute).toContain('GitHub Metadata Runs');
    expect(githubRoute).toContain('GitHub Draft PR Runs');
    expect(githubRoute).toContain('GitHub Branch Publish Runs');
    expect(githubRoute).toContain('GitHub Publish To Draft PR Chains');
    expect(githubRoute).toContain('GitHub PR Lifecycle Runs');
    expect(githubRoute).toContain('GitHub Merge Guided Operation');
    expect(githubRoute).toContain('GitHub Merge Runs');
    expect(githubRoute).toContain('GitHub Merge Acceptance Rehearsal');
    expect(githubRoute).toContain('GitHub Actions CI/CD');
    expect(githubRoute).toContain('GitHub Actions Acceptance Rehearsal');
    expect(githubRoute).toContain('GitHub Remote Supersede Runs');
    expect(githubRoute).toContain('GitHub Remote Cleanup Runs');
    expect(githubRoute).toContain('GitHub Branch Publish Acceptance Rehearsal');
    expect(githubRoute).toContain('GitHub Draft PR Acceptance Rehearsal');
    expect(githubRoute).toContain('GitHub Publish To Draft PR Acceptance Rehearsal');
    expect(githubRoute).toContain('GitHub PR Lifecycle Acceptance Rehearsal');
    expect(githubRoute).toContain('GitHub Merge Acceptance Rehearsal');
    expect(githubRoute).toContain('GitHub Remote Supersede Acceptance Rehearsal');
    expect(githubRoute).toContain('GitHub Remote Cleanup Acceptance Rehearsal');
    expect(mergeWizard).toContain('<button');
    expect(mergeWizard).toContain('createMergeDryRun');
    expect(mergeWizard).toContain('requestMergeApproval');
    expect(mergeWizard).toContain('approveMergeRequest');
    expect(mergeWizard).toContain('runMerge');
    expect(githubRoute).not.toContain('postRecoveryJson');
    expect(githubRoute).not.toContain('/api/approvals/decisions');
    expect(githubRoute).not.toContain('approvalKey');
    expect(githubRoute).not.toContain('local-control');
    expect(githubRoute).not.toContain('CODEXHUB_GITHUB_TOKEN');
    expect(githubRoute).not.toContain('executionAuthority');
    expect(githubRoute).not.toContain('authority');
  });

  it('keeps the merge wizard scoped to fixed merge routes and metadata payloads', () => {
    const appSource = readFileSync(new URL('./App.tsx', import.meta.url), 'utf8');
    const createWindow = sourceWindow(
      appSource,
      'async function createMergeDryRun',
      'async function requestMergeApproval',
    );
    const requestWindow = sourceWindow(
      appSource,
      'async function requestMergeApproval',
      'async function approveMergeRequest',
    );
    const approveWindow = sourceWindow(
      appSource,
      'async function approveMergeRequest',
      'async function runMerge',
    );
    const runWindow = sourceWindow(appSource, 'async function runMerge', 'return (');
    const postWindow = sourceWindow(appSource, 'async function postMergeJson', '');

    expect(appSource).toContain('/api/github/merges/dry-runs');
    expect(appSource).toContain('/api/github/merges/approval-requests');
    expect(appSource).toContain('/api/github/merges/manual-approvals');
    expect(appSource).toContain('/api/github/merges/runs');
    expect(appSource).toContain('mergeDashboardPostRoutes.has(path)');
    expect(appSource).not.toContain("startsWith('/api/github/merges/')");
    expect(postWindow).toContain('mergeDashboardPostRoutes.has(path)');
    expect(postWindow).not.toContain('localStorage');
    expect(postWindow).not.toContain('sessionStorage');
    expect(postWindow).not.toContain('indexedDB');
    for (const window of [createWindow, requestWindow, approveWindow, runWindow]) {
      expect(window).not.toContain('approvalArtifact:');
      expect(window).not.toContain('executionAuthority');
      expect(window).not.toContain('authority:');
      expect(window).not.toContain('rawUrl');
      expect(window).not.toContain('rawResponseBody');
      expect(window).not.toContain('rawPrBody');
      expect(window).not.toContain('CODEXHUB_GITHUB_TOKEN');
      expect(window).not.toContain('executeGithub');
      expect(window).not.toContain('adapter.execute');
    }
  });

  it('keeps the deployment wizard scoped to fixed operation routes and metadata payloads', () => {
    const appSource = readFileSync(new URL('./App.tsx', import.meta.url), 'utf8');
    const createWindow = sourceWindow(
      appSource,
      'async function createDeploymentOperationDryRun',
      'async function requestDeploymentOperationApproval',
    );
    const requestWindow = sourceWindow(
      appSource,
      'async function requestDeploymentOperationApproval',
      'async function approveDeploymentOperationRequest',
    );
    const approveWindow = sourceWindow(
      appSource,
      'async function approveDeploymentOperationRequest',
      'async function createDeploymentRollbackPlan',
    );
    const rollbackWindow = sourceWindow(
      appSource,
      'async function createDeploymentRollbackPlan',
      'async function runDeploymentOperation',
    );
    const runWindow = sourceWindow(
      appSource,
      'async function runDeploymentOperation',
      'return (',
    );
    const postWindow = sourceWindow(
      appSource,
      'async function postDeploymentOperationJson',
      '',
    );

    expect(appSource).toContain('/api/deployments/operations/dry-runs');
    expect(appSource).toContain('/api/deployments/operations/approval-requests');
    expect(appSource).toContain('/api/deployments/operations/manual-approvals');
    expect(appSource).toContain('/api/deployments/operations/rollback-plans');
    expect(appSource).toContain('/api/deployments/operations/runs');
    expect(appSource).toContain('deploymentOperationDashboardPostRoutes.has(path)');
    expect(appSource).not.toContain("startsWith('/api/deployments/operations/')");
    expect(postWindow).toContain('deploymentOperationDashboardPostRoutes.has(path)');
    expect(postWindow).not.toContain('localStorage');
    expect(postWindow).not.toContain('sessionStorage');
    expect(postWindow).not.toContain('indexedDB');
    for (const window of [createWindow, requestWindow, approveWindow, rollbackWindow, runWindow]) {
      expect(window).not.toContain('approvalArtifact:');
      expect(window).not.toContain('executionAuthority');
      expect(window).not.toContain('authority:');
      expect(window).not.toContain('rawManifest');
      expect(window).not.toContain('rawPlan');
      expect(window).not.toContain('rawDiff');
      expect(window).not.toContain('rawLog');
      expect(window).not.toContain('CODEXHUB_DEPLOYMENT_');
      expect(window).not.toContain('adapter.execute');
    }
  });

  it('adds platform operations as a GET-only operator view', () => {
    const appSource = readFileSync(new URL('./App.tsx', import.meta.url), 'utf8');
    const operationsRoute = appSource.slice(
      appSource.indexOf("if (activeView === 'operations')"),
      appSource.indexOf("if (activeView === 'policy-telemetry')"),
    );

    for (const route of [
      '/api/platform/backups/dry-runs',
      '/api/platform/backups/approvals',
      '/api/platform/backups/runs',
      '/api/platform/restores/dry-runs',
      '/api/platform/migrations/runs',
      '/api/platform/retention/runs',
      '/api/platform/audit-exports/runs',
      '/api/platform/operator-roles/runs',
    ]) {
      expect(appSource).toContain(route);
    }
    expect(operationsRoute).toContain('Platform Operations');
    expect(operationsRoute).toContain('Operator Roles / DR');
    expect(operationsRoute).not.toContain('Local control key');
    expect(operationsRoute).not.toContain('postPlatform');
    expect(operationsRoute).not.toContain('createSupervisorPostHeaders');
    expect(operationsRoute).not.toContain('approvalArtifact:');
    expect(operationsRoute).not.toContain('executionAuthority');
    expect(operationsRoute).not.toContain('authority:');
    expect(operationsRoute).not.toContain('rawSql');
    expect(operationsRoute).not.toContain('rawDbRows');
    expect(operationsRoute).not.toContain('rawBackupBody');
    expect(operationsRoute).not.toContain('rawAuditBody');
  });

  it('keeps the production workflow recovery wizard scoped to existing recovery routes', () => {
    const appSource = readFileSync(new URL('./App.tsx', import.meta.url), 'utf8');
    const workflowRoute = appSource.slice(
      appSource.indexOf("if (activeView === 'workflows')"),
      appSource.indexOf("if (activeView === 'release-candidates')"),
    );
    const recoveryWizard = workflowRoute.slice(
      workflowRoute.indexOf('<Panel title="Recovery Guided Operation">'),
      workflowRoute.indexOf('<Panel title="Production Workflow Catalog">'),
    );

    expect(workflowRoute).toContain('Production Workflow Runtime Recovery');
    expect(workflowRoute).toContain('workflow approval does not grant child authority');
    expect(workflowRoute).toContain('local pilot gate');
    expect(workflowRoute).toContain('localProductionPilotRuntimeGate');
    expect(workflowRoute).toContain('store-resolved ids and hashes only');
    expect(workflowRoute).toContain('request body child state is not trusted');
    expect(readFileSync(new URL('./read-only-ux.ts', import.meta.url), 'utf8')).toContain(
      'CODEXHUB_LOCAL_PRODUCTION_WORKFLOW_PILOT_ENABLED',
    );
    expect(recoveryWizard).toContain('Recovery Guided Operation');
    expect(recoveryWizard).toContain('<button');
    expect(appSource).toContain('/api/workflows/production/recoveries/dry-runs');
    expect(appSource).toContain('/api/workflows/production/recoveries/approval-requests');
    expect(appSource).toContain('/api/workflows/production/recoveries/manual-approvals');
    expect(appSource).toContain('/api/workflows/production/recoveries/runs');
    expect(appSource).toContain('recoveryDashboardPostRoutes.has(path)');
    expect(appSource).not.toContain("startsWith('/api/workflows/production/recoveries/')");
    expect(recoveryWizard).not.toContain('approvalKey');
    expect(recoveryWizard).not.toContain('local-control');
    expect(workflowRoute).not.toContain('CODEXHUB_SUPERVISOR_LOCAL');
    expect(appSource).not.toContain('reason: recoveryReason');
    for (const forbidden of [
      'approvalArtifact:',
      'executionAuthority',
      'authority:',
      'childArtifacts',
      'childApprovalApproved',
      'childRunStatuses',
      'rawPath',
      'rawBody',
      'CODEXHUB_GITHUB_TOKEN',
      'executeGithub',
      'adapter.execute',
    ]) {
      expect(recoveryWizard).not.toContain(forbidden);
    }
  });

  it('keeps recovery wizard POST payloads limited to ids and hashes', () => {
    const appSource = readFileSync(new URL('./App.tsx', import.meta.url), 'utf8');
    const requestApprovalWindow = sourceWindow(
      appSource,
      'async function requestRecoveryApproval',
      'async function approveRecoveryRequest',
    );
    const approveWindow = sourceWindow(
      appSource,
      'async function approveRecoveryRequest',
      'async function runRecovery',
    );
    const runWindow = sourceWindow(
      appSource,
      'async function runRecovery',
      'async function createMergeDryRun',
    );
    const postWindow = sourceWindow(appSource, 'async function postRecoveryJson', '');

    for (const window of [requestApprovalWindow, approveWindow, runWindow]) {
      expect(window).not.toContain('reason:');
      expect(window).not.toContain('reasonSummary');
      expect(window).not.toContain('rawReason');
      expect(window).not.toContain('approvalArtifact:');
      expect(window).not.toContain('executionAuthority');
      expect(window).not.toContain('authority:');
      expect(window).not.toContain('childArtifacts');
      expect(window).not.toContain('childApprovalApproved');
      expect(window).not.toContain('childRunStatuses');
    }

    expect(postWindow).toContain('recoveryDashboardPostRoutes.has(path)');
    expect(postWindow).not.toContain('startsWith');
    expect(postWindow).not.toContain('indexOf(');
    expect(postWindow).not.toContain('includes(');
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

  it('keeps the rework loop governance panel display-only in the Dashboard source', () => {
    const appSource = readFileSync(new URL('./App.tsx', import.meta.url), 'utf8');
    const governanceRoute = appSource.slice(
      appSource.indexOf('<Panel title="Rework Loop">'),
      appSource.indexOf('</Panel>', appSource.indexOf('<Panel title="Rework Loop">')),
    );

    expect(governanceRoute).toContain('Rework Loop');
    expect(governanceRoute).toContain('acceptance rehearsal');
    expect(governanceRoute).not.toContain('<button');
    expect(governanceRoute).not.toContain('fetch(');
    expect(governanceRoute).not.toContain("method: 'POST'");
    expect(governanceRoute).not.toContain('approvalKey');
    expect(governanceRoute).not.toContain('local-control');
  });

  it('summarizes operator readiness without secret values or raw config', () => {
    const summary = createOperatorReadinessReadOnlySummary();
    const serialized = JSON.stringify(summary);

    expect(summary.checkCount).toBeGreaterThan(0);
    expect(summary.integrations.length).toBeGreaterThan(0);
    expect(summary.integrations.some((integration) => integration.name === 'custom-workflow-production')).toBe(
      true,
    );
    expect(serialized).toContain('custom_workflow_production_execution_disabled');
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
      latestRecoveryAction: 'request_worktree_approval',
      cleanupRequiredCount: 1,
      cleanupHandoffCount: 1,
      latestCleanupApprovalStatus: 'not_requested',
      latestCleanupDeferred: true,
      latestCleanupCompleted: false,
      processBoundaryInvoked: false,
      externalProcessStarted: false,
    });
    const serialized = JSON.stringify(summary);

    expect(summary.status).toBe('available');
    expect(summary.runCount).toBe(1);
    expect(summary.enablementStatus).toBe('blocked');
    expect(summary.enablementBlockerCount).toBeGreaterThan(0);
    expect(summary.requiredEnvFlags).toContain('CODEXHUB_M11_PRODUCTION_PILOT_ENABLED');
    expect(summary.safeEnableBlockers).toContain('m11_pilot_not_safe_to_enable');
    expect(summary.steps.length).toBeGreaterThan(0);
    expect(summary.nextAction).toContain('Resolve M11 enablement blockers');
    expect(summary.latestPrDraftStatus).toBe('blocked');
    expect(summary.latestRecoveryAction).toBe('request_worktree_approval');
    expect(summary.cleanupHandoffCount).toBe(1);
    expect(summary.latestCleanupApprovalStatus).toBe('not_requested');
    expect(summary.latestCleanupDeferred).toBe(true);
    expect(summary.latestCleanupCompleted).toBe(false);
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

  it('summarizes M11 acceptance smoke without execution controls', () => {
    const summary = createM11PilotAcceptanceSmokeReadOnlySummary({ scenario: 'all-pass' });
    const failed = createM11PilotAcceptanceSmokeReadOnlySummary({ scenario: 'nx-failed' });
    const blocked = createM11PilotAcceptanceSmokeReadOnlySummary({
      scenario: 'worktree-approval-blocked',
    });
    const serialized = JSON.stringify({ summary, failed, blocked });

    expect(summary.status).toBe('passed');
    expect(summary.prDraftStatus).toBe('not_ready_no_patch');
    expect(summary.cleanupRequired).toBe(true);
    expect(failed.status).toBe('failed');
    expect(failed.failureClassification).toBe('nx_failed');
    expect(failed.prDraftStatus).toBe('blocked');
    expect(blocked.status).toBe('blocked');
    expect(blocked.recoveryAction).toBe('request_worktree_approval');
    expect(summary.fixtureOnly).toBe(true);
    expect(summary.processBoundaryInvoked).toBe(false);
    expect(summary.externalProcessStarted).toBe(false);
    expect(summary.networkBoundaryInvoked).toBe(false);
    expect(summary.localControlKeyRead).toBe(false);
    expect(summary.supervisorPostAllowed).toBe(false);
    expect(summary.adapterExecuteAllowed).toBe(false);
    expect(summary.patchGenerationAllowed).toBe(false);
    expect(summary.pushAllowed).toBe(false);
    expect(summary.pullRequestOpened).toBe(false);
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

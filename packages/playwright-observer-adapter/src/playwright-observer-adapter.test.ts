import { describe, expect, it } from 'vitest';
import { CapabilityManifestSchema, type ExecutionAuthority } from '@codexhub/contracts';
import {
  createBrowserProfileReadiness,
  createBrowserProfileRef,
} from '@codexhub/browser-profile-kernel';
import {
  createPlaywrightObserverAdapterManifest,
  createPlaywrightObserverAdapterPlan,
  createPlaywrightReadOnlyRealRunner,
  executePlaywrightObserverAdapter,
  isAllowedReadOnlyTargetUrl,
} from './index';

const createdAt = '2026-05-03T00:00:00.000Z';

function createAuthority(overrides: Partial<ExecutionAuthority> = {}): ExecutionAuthority {
  return {
    id: 'authority_browser_1',
    schemaVersion: '2026-04-28.foundation',
    createdAt,
    policyDecisionId: 'policy_browser_1',
    allowed: true,
    constraints: ['fixture-runner-only'],
    ...overrides,
  };
}

function createProfileRef() {
  return createBrowserProfileRef({
    profileId: 'default',
    displayName: 'Default',
    profilePath: 'C:\\Users\\Thomas\\AppData\\Local\\Chrome\\Default',
  });
}

describe('playwright-observer-adapter', () => {
  it('creates a browser capability manifest with an audited controlled boundary', () => {
    const manifest = CapabilityManifestSchema.parse(createPlaywrightObserverAdapterManifest());

    expect(manifest.name).toBe('playwright-observer');
    expect(manifest.kind).toBe('browser');
    expect(manifest.version).toBe('0.2.0-m4b');
    expect(manifest.defaultActionMode).toBe('read');
    expect(manifest.processBoundary.mayStartExternalProcess).toBe(true);
    expect(manifest.processBoundary.requiresProcessAudit).toBe(true);
    expect(manifest.evidencePolicy.bodyStorage).toBe('hash-only');
  });

  it('plans only allowlisted read-only browser observation capabilities', () => {
    const profileRef = createProfileRef();
    const plan = createPlaywrightObserverAdapterPlan({
      dryRunId: 'browser_dry_run_1',
      profileRef,
      requestedCapabilities: ['title', 'url', 'console_summary'],
    });

    expect(plan.status).toBe('ready');
    expect(plan.runnerMode).toBe('fixture');
    expect(plan.requestedCapabilities).toEqual(['title', 'url', 'console_summary']);
    expect(plan.processBoundaryPlanned).toBe(false);
    expect(plan.processBoundaryInvoked).toBe(false);
    expect(plan.externalProcessStarted).toBe(false);
    expect(plan.noRealWrite).toBe(true);
    expect(plan.bodyStored).toBe(false);
    expect(JSON.stringify(plan)).not.toContain('Chrome\\Default');
  });

  it('plans controlled local browser observation as approval-gated metadata', () => {
    const profileRef = createProfileRef();
    const plan = createPlaywrightObserverAdapterPlan({
      dryRunId: 'browser_dry_run_controlled',
      profileRef,
      runnerMode: 'controlled-local-browser',
      targetUrl: 'http://127.0.0.1:4173/#/browser-profiles',
      requestedCapabilities: ['title', 'url'],
    });
    const serialized = JSON.stringify(plan);

    expect(plan.status).toBe('ready');
    expect(plan.runnerMode).toBe('controlled-local-browser');
    expect(plan.targetUrlHash).toMatch(/^sha256:/);
    expect(plan.processBoundaryPlanned).toBe(true);
    expect(plan.processBoundaryInvoked).toBe(false);
    expect(plan.externalProcessStarted).toBe(false);
    expect(plan.capabilityDryRun.plannedActions[0]?.requiresApproval).toBe(true);
    expect(plan.capabilityDryRun.plannedActions[0]?.risk).toBe('high');
    expect(serialized).not.toContain('127.0.0.1:4173');
  });

  it('blocks controlled browser plans without a safe local target', () => {
    const profileRef = createProfileRef();
    const missingTarget = createPlaywrightObserverAdapterPlan({
      dryRunId: 'browser_dry_run_missing_target',
      profileRef,
      runnerMode: 'controlled-local-browser',
    });
    const externalTarget = createPlaywrightObserverAdapterPlan({
      dryRunId: 'browser_dry_run_external_target',
      profileRef,
      runnerMode: 'controlled-local-browser',
      targetUrl: 'https://example.test/app',
    });

    expect(missingTarget.status).toBe('blocked');
    expect(missingTarget.blockReasons).toContain('target_url_required');
    expect(externalTarget.status).toBe('blocked');
    expect(externalTarget.blockReasons).toContain('target_url_forbidden');
    expect(isAllowedReadOnlyTargetUrl('about:blank')).toBe(true);
    expect(isAllowedReadOnlyTargetUrl('data:text/html,<main>ok</main>')).toBe(true);
    expect(isAllowedReadOnlyTargetUrl('http://localhost:3000')).toBe(true);
    expect(isAllowedReadOnlyTargetUrl('https://localhost:3000')).toBe(false);
    expect(isAllowedReadOnlyTargetUrl('http://user:pass@localhost:3000')).toBe(false);
  });

  it('blocks screenshot, network body, browser act, storage, and raw path requests', () => {
    const profileRef = createProfileRef();
    const plan = createPlaywrightObserverAdapterPlan({
      dryRunId: 'browser_dry_run_blocked',
      profileRef,
      requestedCapabilities: ['title', 'storage_dump'],
      requestedActions: ['click', 'type', 'cookie_extraction', 'token_extraction'],
      rawProfilePath: 'C:\\Users\\Thomas\\AppData\\Local\\Chrome\\Default',
      screenshotRequested: true,
      networkBodyRequested: true,
      bodyStorageRequested: true,
    });

    expect(plan.status).toBe('blocked');
    expect(plan.blockReasons).toEqual(
      expect.arrayContaining([
        'capability_forbidden',
        'raw_profile_path_forbidden',
        'screenshot_requires_approval',
        'network_body_forbidden',
        'forbidden_action_requested',
      ]),
    );
    expect(plan.browserPlan.screenshotPlanned).toBe(false);
    expect(plan.browserPlan.networkBodyStorage).toBe('forbidden');
    expect(plan.bodyStored).toBe(false);
  });

  it('blocks execute without authority or fixture runner and never invokes a boundary', async () => {
    const profileRef = createProfileRef();
    const plan = createPlaywrightObserverAdapterPlan({
      dryRunId: 'browser_dry_run_no_authority',
      profileRef,
    });
    const result = await executePlaywrightObserverAdapter({ plan });

    expect(result.status).toBe('blocked');
    expect(result.capabilityResult.processBoundaryInvoked).toBe(false);
    expect(result.capabilityResult.externalProcessStarted).toBe(false);
    expect(result.browserRun.bodyStored).toBe(false);
    expect(result.evidenceRefs.every((ref) => ref.redacted)).toBe(true);
  });

  it('blocks controlled browser execution without persisted approval metadata', async () => {
    const profileRef = createProfileRef();
    const plan = createPlaywrightObserverAdapterPlan({
      dryRunId: 'browser_dry_run_controlled_no_approval',
      profileRef,
      runnerMode: 'controlled-local-browser',
      targetUrl: 'http://localhost:4173/',
    });
    let invoked = false;
    const result = await executePlaywrightObserverAdapter({
      plan,
      authority: createAuthority(),
      runner: {
        async observe() {
          invoked = true;
          return {
            status: 'completed',
          };
        },
      },
    });

    expect(result.status).toBe('blocked');
    expect(invoked).toBe(false);
    expect(result.browserRun.summary).toContain('approval_artifact_missing');
    expect(result.capabilityResult.processBoundaryInvoked).toBe(false);
    expect(result.capabilityResult.externalProcessStarted).toBe(false);
  });

  it('runs injected fixture observations as metadata-only evidence', async () => {
    const profileRef = createProfileRef();
    const readiness = createBrowserProfileReadiness({
      profileRef,
      status: 'ready',
      blockReasons: [],
      summary: 'Fixture profile is ready.',
    });
    const plan = createPlaywrightObserverAdapterPlan({
      dryRunId: 'browser_dry_run_completed',
      profileRef,
      requestedCapabilities: ['title', 'url', 'accessibility_snapshot'],
    });
    const result = await executePlaywrightObserverAdapter({
      plan,
      authority: createAuthority(),
      readiness,
      runner: {
        async observe() {
          return {
            status: 'completed',
            pageTitle: 'CodexHub Dashboard',
            pageUrl: 'https://example.test/app?token=secret',
            accessibilitySnapshot: 'root: app',
            accessibilityNodeCount: 2,
            consoleSummary: {
              messageCount: 1,
              warningCount: 0,
              errorCount: 0,
              bodyStored: false,
            },
            networkSummary: {
              requestCount: 3,
              responseCount: 3,
              failedRequestCount: 0,
              bodyStored: false,
            },
            summary: 'Fixture observation completed.',
          };
        },
      },
    });
    const serialized = JSON.stringify(result);

    expect(result.status).toBe('completed');
    expect(result.pageSummary?.pageTitleHash).toMatch(/^sha256:/);
    expect(result.pageSummary?.pageUrlHash).toMatch(/^sha256:/);
    expect(result.capabilityResult.processBoundaryInvoked).toBe(false);
    expect(result.capabilityResult.externalProcessStarted).toBe(false);
    expect(result.capabilityResult.noRealWrite).toBe(true);
    expect(serialized).not.toContain('CodexHub Dashboard');
    expect(serialized).not.toContain('example.test/app');
    expect(serialized).not.toContain('secret');
  });

  it('runs injected controlled browser observations with boundary truth preserved', async () => {
    const profileRef = createProfileRef();
    const plan = createPlaywrightObserverAdapterPlan({
      dryRunId: 'browser_dry_run_controlled_completed',
      profileRef,
      runnerMode: 'controlled-local-browser',
      targetUrl: 'http://localhost:4173/#/overview',
      requestedCapabilities: ['title', 'url', 'network_metadata_summary'],
    });
    const result = await executePlaywrightObserverAdapter({
      plan,
      authority: createAuthority({
        approvalArtifactId: 'approval_browser_boundary_1',
      }),
      runner: {
        async observe() {
          return {
            status: 'completed',
            pageTitle: 'CodexHub',
            pageUrl: 'http://localhost:4173/#/overview',
            networkSummary: {
              requestCount: 2,
              responseCount: 2,
              failedRequestCount: 0,
              bodyStored: false,
            },
            processBoundaryInvoked: true,
            externalProcessStarted: true,
            sourceLabel: 'playwright-observer.controlled-local-browser',
            summary: 'Controlled fixture completed.',
          };
        },
      },
    });
    const serialized = JSON.stringify(result);

    expect(result.status).toBe('completed');
    expect(result.capabilityResult.processBoundaryInvoked).toBe(true);
    expect(result.capabilityResult.externalProcessStarted).toBe(true);
    expect(result.browserRun.processBoundaryInvoked).toBe(true);
    expect(result.pageSummary?.processBoundaryInvoked).toBe(true);
    expect(result.auditEvents[0]?.metadata?.processBoundaryInvoked).toBe(true);
    expect(serialized).not.toContain('http://localhost:4173/#/overview');
    expect(serialized).not.toContain('CodexHub');
  });

  it('maps injected fixture failed and aborted statuses without storing bodies', async () => {
    const profileRef = createProfileRef();
    const failedPlan = createPlaywrightObserverAdapterPlan({
      dryRunId: 'browser_dry_run_failed',
      profileRef,
    });
    const failed = await executePlaywrightObserverAdapter({
      plan: failedPlan,
      authority: createAuthority(),
      runner: {
        async observe() {
          return {
            status: 'failed',
            summary: 'Fixture failed.',
          };
        },
      },
    });
    const aborted = await executePlaywrightObserverAdapter({
      plan: createPlaywrightObserverAdapterPlan({
        dryRunId: 'browser_dry_run_aborted',
        profileRef,
      }),
      authority: createAuthority(),
      runner: {
        async observe() {
          return {
            status: 'aborted',
            summary: 'Fixture aborted.',
          };
        },
      },
    });

    expect(failed.status).toBe('failed');
    expect(aborted.status).toBe('aborted');
    expect(failed.browserRun.bodyStored).toBe(false);
    expect(aborted.browserRun.processBoundaryInvoked).toBe(false);
  });

  it('uses an injected Playwright loader without opening a real browser in tests', async () => {
    const profileRef = createProfileRef();
    const plan = createPlaywrightObserverAdapterPlan({
      dryRunId: 'browser_dry_run_real_runner_fake',
      profileRef,
      runnerMode: 'controlled-local-browser',
      targetUrl: 'http://127.0.0.1:4173/',
    });
    const closed: string[] = [];
    const runner = createPlaywrightReadOnlyRealRunner({
      targetUrl: 'http://127.0.0.1:4173/',
      loadPlaywright: async () => ({
        chromium: {
          async launch() {
            return {
              async newContext() {
                return {
                  async newPage() {
                    const listeners = new Map<string, Array<(...args: unknown[]) => void>>();

                    return {
                      on(event: string, listener: (...args: unknown[]) => void) {
                        listeners.set(event, [...(listeners.get(event) ?? []), listener]);
                      },
                      async goto() {
                        for (const listener of listeners.get('request') ?? []) {
                          listener({});
                        }
                        for (const listener of listeners.get('response') ?? []) {
                          listener({});
                        }
                        for (const listener of listeners.get('console') ?? []) {
                          listener({
                            type: () => 'warning',
                          });
                        }
                      },
                      async title() {
                        return 'Local Dashboard';
                      },
                      url() {
                        return 'http://127.0.0.1:4173/';
                      },
                      locator() {
                        return {
                          async ariaSnapshot() {
                            return 'main: Local Dashboard';
                          },
                        };
                      },
                    };
                  },
                  async close() {
                    closed.push('context');
                  },
                };
              },
              async close() {
                closed.push('browser');
              },
            };
          },
        },
      }),
    });
    const result = await runner.observe(plan);

    expect(result.status).toBe('completed');
    expect(result.processBoundaryInvoked).toBe(true);
    expect(result.externalProcessStarted).toBe(true);
    expect(result.consoleSummary?.warningCount).toBe(1);
    expect(result.networkSummary?.requestCount).toBe(1);
    expect(result.accessibilityNodeCount).toBe(1);
    expect(closed).toEqual(['context', 'browser']);
  });
});

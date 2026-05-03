import { describe, expect, it } from 'vitest';
import { CapabilityManifestSchema, type ExecutionAuthority } from '@codexhub/contracts';
import {
  createBrowserProfileReadiness,
  createBrowserProfileRef,
} from '@codexhub/browser-profile-kernel';
import {
  createPlaywrightObserverAdapterManifest,
  createPlaywrightObserverAdapterPlan,
  executePlaywrightObserverAdapter,
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
  it('creates a browser capability manifest without a process boundary', () => {
    const manifest = CapabilityManifestSchema.parse(createPlaywrightObserverAdapterManifest());

    expect(manifest.name).toBe('playwright-observer');
    expect(manifest.kind).toBe('browser');
    expect(manifest.defaultActionMode).toBe('read');
    expect(manifest.processBoundary.mayStartExternalProcess).toBe(false);
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
    expect(plan.requestedCapabilities).toEqual(['title', 'url', 'console_summary']);
    expect(plan.processBoundaryPlanned).toBe(false);
    expect(plan.processBoundaryInvoked).toBe(false);
    expect(plan.externalProcessStarted).toBe(false);
    expect(plan.noRealWrite).toBe(true);
    expect(plan.bodyStored).toBe(false);
    expect(JSON.stringify(plan)).not.toContain('Chrome\\Default');
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
});

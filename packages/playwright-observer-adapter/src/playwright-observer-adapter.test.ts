import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import {
  validateCapabilityExecutionEnvelope,
  validateCapabilityManifest,
  validateCapabilityPlanEnvelope,
} from '@codexhub/capability-adapter-kernel';
import { CapabilityManifestSchema, type ExecutionAuthority } from '@codexhub/contracts';
import {
  createBrowserProfileReadiness,
  createBrowserProfileRef,
} from '@codexhub/browser-profile-kernel';
import { hashText } from '@codexhub/evidence-kernel';
import {
  createPlaywrightObserverAdapterManifest,
  createPlaywrightObserverAdapterPlan,
  createPlaywrightReadOnlyRealRunner,
  executePlaywrightObserverAdapter,
  isAllowedReadOnlyTargetUrl,
  runControlledBrowserActionBoundary,
} from './index';

const createdAt = '2026-05-03T00:00:00.000Z';
const sourceDir = new URL('.', import.meta.url);

function sha256Ref(value: string): string {
  return `sha256:${hashText(value)}`;
}

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
  it('keeps controlled browser actions limited to fixed click and type operations', () => {
    const source = readFileSync(new URL('./action-boundary.ts', sourceDir), 'utf8');
    const forbiddenTerms = [
      'page.evaluate',
      '.evaluate(',
      'keyboard.',
      '.press(',
      '.check(',
      '.setInputFiles(',
      '.dragTo(',
      '.route(',
      '.screenshot(',
      'storageState',
      'localStorage',
      'sessionStorage',
      'document.cookie',
      'process.env',
      'child_process',
      'execFile(',
      'spawn(',
      'shell: true',
    ];

    expect(forbiddenTerms.filter((term) => source.includes(term))).toEqual([]);
    expect(source).toContain("if (input.actionKind === 'click')");
    expect(source).toContain('locator.click({ timeout:');
    expect(source).toContain('locator.fill(input.typedText ??');
    expect(source).toContain('isAllowedReadOnlyTargetUrl(page.url())');
  });

  it('creates a browser capability manifest with an audited controlled boundary', () => {
    const manifest = CapabilityManifestSchema.parse(createPlaywrightObserverAdapterManifest());

    expect(manifest.name).toBe('playwright-observer');
    expect(manifest.kind).toBe('browser');
    expect(manifest.version).toBe('0.2.0-m4b');
    expect(manifest.defaultActionMode).toBe('read');
    expect(manifest.processBoundary.mayStartExternalProcess).toBe(true);
    expect(manifest.processBoundary.requiresProcessAudit).toBe(true);
    expect(manifest.evidencePolicy.bodyStorage).toBe('hash-only');
    expect(validateCapabilityManifest(manifest).ok).toBe(true);
  });

  it('plans only allowlisted read-only browser observation capabilities', () => {
    const profileRef = createProfileRef();
    const plan = createPlaywrightObserverAdapterPlan({
      dryRunId: 'browser_dry_run_1',
      profileRef,
      requestedCapabilities: ['title', 'url', 'console_summary'],
    });

    expect(plan.status).toBe('ready');
    expect(validateCapabilityPlanEnvelope(plan).ok).toBe(true);
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
    expect(isAllowedReadOnlyTargetUrl('data:text/html,<main>ok</main>')).toBe(false);
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
    expect(
      validateCapabilityExecutionEnvelope({
        manifest: plan.manifest,
        capabilityResult: result.capabilityResult,
        evidenceRefs: result.evidenceRefs,
        auditEvents: result.auditEvents,
      }).ok,
    ).toBe(true);
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
    expect(
      validateCapabilityExecutionEnvelope({
        manifest: plan.manifest,
        authority: createAuthority(),
        capabilityResult: result.capabilityResult,
        evidenceRefs: result.evidenceRefs,
        auditEvents: result.auditEvents,
      }).ok,
    ).toBe(true);
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
            targetUrlHash: sha256Ref('http://localhost:4173/#/overview'),
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
    expect(
      validateCapabilityExecutionEnvelope({
        manifest: plan.manifest,
        authority: createAuthority({
          approvalArtifactId: 'approval_browser_boundary_1',
        }),
        capabilityResult: result.capabilityResult,
        evidenceRefs: result.evidenceRefs,
        auditEvents: result.auditEvents,
        approvalRequired: true,
      }).ok,
    ).toBe(true);
    expect(result.capabilityResult.processBoundaryInvoked).toBe(true);
    expect(result.capabilityResult.externalProcessStarted).toBe(true);
    expect(result.browserRun.processBoundaryInvoked).toBe(true);
    expect(result.pageSummary?.processBoundaryInvoked).toBe(true);
    expect(result.auditEvents[0]?.metadata?.processBoundaryInvoked).toBe(true);
    expect(serialized).not.toContain('http://localhost:4173/#/overview');
    expect(serialized).not.toContain('CodexHub');
  });

  it('fails controlled browser execution when final page URL leaves the read-only target policy', async () => {
    const profileRef = createProfileRef();
    const plan = createPlaywrightObserverAdapterPlan({
      dryRunId: 'browser_dry_run_final_url_forbidden',
      profileRef,
      runnerMode: 'controlled-local-browser',
      targetUrl: 'http://localhost:4173/#/approved',
      requestedCapabilities: ['title', 'url'],
    });
    const result = await executePlaywrightObserverAdapter({
      plan,
      authority: createAuthority({
        approvalArtifactId: 'approval_browser_boundary_final_url',
      }),
      runner: {
        async observe() {
          return {
            status: 'completed',
            targetUrlHash: sha256Ref('http://localhost:4173/#/approved'),
            pageTitle: 'External redirect',
            pageUrl: 'https://example.test/redirected?token=secret',
            processBoundaryInvoked: true,
            externalProcessStarted: true,
          };
        },
      },
    });
    const serialized = JSON.stringify(result);

    expect(result.status).toBe('failed');
    expect(result.pageSummary).toBeUndefined();
    expect(result.capabilityResult.processBoundaryInvoked).toBe(true);
    expect(result.capabilityResult.externalProcessStarted).toBe(true);
    expect(result.browserRun.summary).toContain('runner_final_url_forbidden');
    expect(serialized).not.toContain('https://example.test');
    expect(serialized).not.toContain('secret');
    expect(serialized).not.toContain('External redirect');
  });

  it('fails controlled browser execution when runner output is not bound to the approved target hash', async () => {
    const profileRef = createProfileRef();
    const plan = createPlaywrightObserverAdapterPlan({
      dryRunId: 'browser_dry_run_target_mismatch',
      profileRef,
      runnerMode: 'controlled-local-browser',
      targetUrl: 'http://localhost:4173/#/approved',
      requestedCapabilities: ['title', 'url'],
    });
    const missingHash = await executePlaywrightObserverAdapter({
      plan,
      authority: createAuthority({
        approvalArtifactId: 'approval_browser_boundary_2',
      }),
      runner: {
        async observe() {
          return {
            status: 'completed',
            pageTitle: 'Wrong target',
            pageUrl: 'http://localhost:4173/#/other',
            processBoundaryInvoked: true,
            externalProcessStarted: true,
          };
        },
      },
    });
    const mismatch = await executePlaywrightObserverAdapter({
      plan,
      authority: createAuthority({
        approvalArtifactId: 'approval_browser_boundary_3',
      }),
      runner: {
        async observe() {
          return {
            status: 'completed',
            targetUrlHash: sha256Ref('http://localhost:4173/#/other'),
            pageTitle: 'Wrong target',
            pageUrl: 'http://localhost:4173/#/other',
            processBoundaryInvoked: true,
            externalProcessStarted: true,
          };
        },
      },
    });
    const serialized = JSON.stringify({ missingHash, mismatch });

    expect(missingHash.status).toBe('failed');
    expect(missingHash.pageSummary).toBeUndefined();
    expect(missingHash.capabilityResult.processBoundaryInvoked).toBe(true);
    expect(missingHash.capabilityResult.externalProcessStarted).toBe(true);
    expect(missingHash.browserRun.summary).toContain('runner_target_hash_missing');
    expect(mismatch.status).toBe('failed');
    expect(mismatch.pageSummary).toBeUndefined();
    expect(mismatch.browserRun.summary).toContain('runner_target_hash_mismatch');
    expect(serialized).not.toContain('http://localhost:4173/#/approved');
    expect(serialized).not.toContain('http://localhost:4173/#/other');
    expect(serialized).not.toContain('Wrong target');
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
    expect(result.targetUrlHash).toBe(sha256Ref('http://127.0.0.1:4173/'));
    expect(result.processBoundaryInvoked).toBe(true);
    expect(result.externalProcessStarted).toBe(true);
    expect(result.consoleSummary?.warningCount).toBe(1);
    expect(result.networkSummary?.requestCount).toBe(1);
    expect(result.accessibilityNodeCount).toBe(1);
    expect(closed).toEqual(['context', 'browser']);
  });

  it('blocks final external URL inside the real runner before reading page metadata', async () => {
    const profileRef = createProfileRef();
    const plan = createPlaywrightObserverAdapterPlan({
      dryRunId: 'browser_dry_run_real_runner_redirect',
      profileRef,
      runnerMode: 'controlled-local-browser',
      targetUrl: 'http://localhost:4173/start',
    });
    const closed: string[] = [];
    let titleRead = false;
    let accessibilityRead = false;
    const runner = createPlaywrightReadOnlyRealRunner({
      targetUrl: 'http://localhost:4173/start',
      loadPlaywright: async () => ({
        chromium: {
          async launch() {
            return {
              async newContext() {
                return {
                  async newPage() {
                    return {
                      on() {
                        return undefined;
                      },
                      async goto() {
                        return undefined;
                      },
                      async title() {
                        titleRead = true;
                        return 'External target';
                      },
                      url() {
                        return 'https://example.test/redirected?token=secret';
                      },
                      locator() {
                        return {
                          async ariaSnapshot() {
                            accessibilityRead = true;
                            return 'main: External target';
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
    const serialized = JSON.stringify(result);

    expect(result.status).toBe('failed');
    expect(result.targetUrlHash).toBe(sha256Ref('http://localhost:4173/start'));
    expect(result.processBoundaryInvoked).toBe(true);
    expect(result.externalProcessStarted).toBe(true);
    expect(result.summary).toContain('final URL policy');
    expect(titleRead).toBe(false);
    expect(accessibilityRead).toBe(false);
    expect(closed).toEqual(['context', 'browser']);
    expect(serialized).not.toContain('https://example.test');
    expect(serialized).not.toContain('secret');
    expect(serialized).not.toContain('External target');
  });

  it('runs controlled browser actions through a fixed click/type boundary', async () => {
    const targetUrl = 'http://127.0.0.1:3000/workflows';
    const selector = '#approve';
    const result = await runControlledBrowserActionBoundary({
      actionKind: 'click',
      targetUrl,
      targetUrlHash: sha256Ref(targetUrl),
      selector,
      selectorHash: sha256Ref(selector),
      loadPlaywright: async () => ({
        chromium: {
          async launch() {
            return {
              async newContext() {
                return {
                  async newPage() {
                    return {
                      async goto() {
                        return undefined;
                      },
                      url() {
                        return targetUrl;
                      },
                      locator() {
                        return {
                          async click() {
                            return undefined;
                          },
                          async fill() {
                            return undefined;
                          },
                        };
                      },
                    };
                  },
                  async close() {
                    return undefined;
                  },
                };
              },
              async close() {
                return undefined;
              },
            };
          },
        },
      }),
    });

    expect(result.status).toBe('completed');
    expect(result.browserActionInvoked).toBe(true);
    expect(result.rawSelectorStored).toBe(false);
    expect(JSON.stringify(result)).not.toContain(selector);
  });

  it('blocks controlled browser type actions on typed text hash mismatch before launching', async () => {
    const targetUrl = 'http://127.0.0.1:3000/workflows';
    const selector = '#operator-token';
    const typedText = 'private typed value';
    let loadCount = 0;
    const result = await runControlledBrowserActionBoundary({
      actionKind: 'type',
      targetUrl,
      targetUrlHash: sha256Ref(targetUrl),
      selector,
      selectorHash: sha256Ref(selector),
      typedText,
      typedTextHash: sha256Ref('different typed value'),
      loadPlaywright: async () => {
        loadCount += 1;
        throw new Error('loader must not run before typed text hash binding passes');
      },
    });
    const serialized = JSON.stringify(result);

    expect(result.status).toBe('blocked');
    expect(result.browserActionInvoked).toBe(false);
    expect(result.processBoundaryInvoked).toBe(false);
    expect(result.externalProcessStarted).toBe(false);
    expect(loadCount).toBe(0);
    expect(result.rawTypedTextStored).toBe(false);
    expect(serialized).not.toContain(typedText);
    expect(serialized).not.toContain(selector);
    expect(serialized).not.toContain(targetUrl);
  });

  it('runs controlled browser type actions with fixed fill and metadata-only output', async () => {
    const targetUrl = 'http://127.0.0.1:3000/workflows';
    const selector = '#operator-note';
    const typedText = 'private operator note';
    let filledValue = '';
    const result = await runControlledBrowserActionBoundary({
      actionKind: 'type',
      targetUrl,
      targetUrlHash: sha256Ref(targetUrl),
      selector,
      selectorHash: sha256Ref(selector),
      typedText,
      typedTextHash: sha256Ref(typedText),
      loadPlaywright: async () => ({
        chromium: {
          async launch() {
            return {
              async newContext() {
                return {
                  async newPage() {
                    return {
                      async goto() {
                        return undefined;
                      },
                      url() {
                        return targetUrl;
                      },
                      locator() {
                        return {
                          async click() {
                            return undefined;
                          },
                          async fill(value: string) {
                            filledValue = value;
                          },
                        };
                      },
                    };
                  },
                  async close() {
                    return undefined;
                  },
                };
              },
              async close() {
                return undefined;
              },
            };
          },
        },
      }),
    });
    const serialized = JSON.stringify(result);

    expect(result.status).toBe('completed');
    expect(result.browserActionInvoked).toBe(true);
    expect(filledValue).toBe(typedText);
    expect(result.rawSelectorStored).toBe(false);
    expect(result.rawTypedTextStored).toBe(false);
    expect(serialized).not.toContain(typedText);
    expect(serialized).not.toContain(selector);
    expect(serialized).not.toContain(targetUrl);
  });
});

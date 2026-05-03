import {
  validateCapabilityExecutionEnvelope,
  validateCapabilityManifest,
  validateCapabilityPlanEnvelope,
} from '@codexhub/capability-adapter-kernel';
import type { ElectronDebugEndpointSummary, ExecutionAuthority } from '@codexhub/contracts';
import {
  createElectronCdpConsoleSummary,
  createElectronCdpNetworkMetadataSummary,
  createElectronDebugEndpointSummary,
  createElectronProcessSummary,
  createElectronTargetSummary,
} from '@codexhub/electron-cdp-kernel';
import { describe, expect, it } from 'vitest';

import { createElectronCdpControlledHttpRunner } from './controlled-http-runner';
import { executeElectronCdpAdapter } from './execute';
import { createElectronCdpFixtureRunner } from './fixture';
import { createElectronCdpAdapterManifest } from './manifest';
import { planElectronCdpObservation } from './plan';

const authority: ExecutionAuthority = {
  id: 'authority_electron_1',
  schemaVersion: '2026-04-28.foundation',
  createdAt: '2026-05-03T00:00:00.000Z',
  policyDecisionId: 'policy_electron_1',
  allowed: true,
  constraints: ['fixture-only', 'metadata-only'],
};

describe('electron-cdp-adapter', () => {
  it('declares a fixture-only Electron capability manifest', () => {
    const manifest = createElectronCdpAdapterManifest();
    const validation = validateCapabilityManifest(manifest);

    expect(validation.ok).toBe(true);
    expect(manifest.kind).toBe('electron');
    expect(manifest.provider).toBe('builtin');
    expect(manifest.processBoundary.mayStartExternalProcess).toBe(false);
    expect(manifest.metadata?.integrationStage).toBe('m5b');
    expect(manifest.metadata?.controlledLocalHttpSupported).toBe(true);
  });

  it('plans read-only fixture observations without process boundaries', () => {
    const plan = planElectronCdpObservation({
      processSummary: createProcessSummary(),
      debugEndpoint: createEndpointSummary(),
      targets: [createTargetSummary()],
      requestedCommands: ['Target.getTargets'],
      requestedCapabilities: ['target_summary', 'console_summary'],
      metadata: {
        targetUrl: 'app://codex/?secret=value',
        cwd: 'C:\\Users\\Thomas\\CodexHub',
      },
    });
    const validation = validateCapabilityPlanEnvelope(plan);
    const serialized = JSON.stringify(plan);

    expect(validation.ok).toBe(true);
    expect(plan.status).toBe('ready');
    expect(plan.processBoundaryPlanned).toBe(false);
    expect(plan.externalProcessStarted).toBe(false);
    expect(plan.observationPlan.commandDecisions[0]?.allowed).toBe(true);
    expect(plan.observationPlan.runnerMode).toBe('fixture');
    expect(serialized).not.toContain('Codex.exe');
    expect(serialized).not.toContain('app://codex');
    expect(serialized).not.toContain('C:\\Users\\Thomas');
  });

  it('plans controlled HTTP observations as approval-gated without process boundaries', () => {
    const plan = planElectronCdpObservation({
      runnerMode: 'controlled-local-http',
      debugEndpoint: createEndpointSummary(),
      requestedCapabilities: ['debug_endpoint_summary', 'target_summary'],
    });

    expect(plan.status).toBe('ready');
    expect(plan.observationPlan.runnerMode).toBe('controlled-local-http');
    expect(plan.observationPlan.cdpHttpBoundaryPlanned).toBe(true);
    expect(plan.observationPlan.cdpHttpBoundaryInvoked).toBe(false);
    expect(plan.capabilityDryRun.plannedActions[0]?.requiresApproval).toBe(true);
    expect(plan.processBoundaryPlanned).toBe(false);
    expect(plan.externalProcessStarted).toBe(false);
  });

  it('blocks forbidden Electron/CDP and UI actions at plan time', () => {
    const plan = planElectronCdpObservation({
      debugEndpoint: {
        ...createEndpointSummary(),
        loopbackOnly: false,
      } as unknown as ElectronDebugEndpointSummary,
      requestedCapabilities: ['target_summary', 'dom_snapshot'],
      requestedCommands: ['Runtime.evaluate', 'Page.captureScreenshot'],
      mainInspectorRequested: true,
      screenshotRequested: true,
      domSnapshotRequested: true,
      networkBodyRequested: true,
      domMutationRequested: true,
      clickTypeRequested: true,
      genericCommandPassthroughRequested: true,
    });

    expect(plan.status).toBe('blocked');
    expect(plan.observationPlan.blockReasons).toContain('non_loopback_endpoint_forbidden');
    expect(plan.observationPlan.blockReasons).toContain('main_inspector_forbidden');
    expect(plan.observationPlan.blockReasons).toContain('runtime_evaluate_forbidden');
    expect(plan.observationPlan.blockReasons).toContain('screenshot_forbidden');
    expect(plan.observationPlan.blockReasons).toContain('dom_snapshot_forbidden');
    expect(plan.observationPlan.blockReasons).toContain('network_body_forbidden');
    expect(plan.observationPlan.blockReasons).toContain('dom_mutation_forbidden');
    expect(plan.observationPlan.blockReasons).toContain('click_type_forbidden');
    expect(plan.observationPlan.runtimeEvaluateAllowed).toBe(false);
    expect(plan.observationPlan.genericCommandPassthrough).toBe(false);
    expect(plan.observationPlan.processBoundaryPlanned).toBe(false);
  });

  it('blocks execution without valid authority and never invokes the runner', async () => {
    let invoked = false;
    const plan = planElectronCdpObservation({ debugEndpoint: createEndpointSummary() });
    const result = await executeElectronCdpAdapter({
      plan,
      runner: {
        async observe() {
          invoked = true;
          return { status: 'completed' };
        },
      },
    });
    const validation = validateCapabilityExecutionEnvelope(result);

    expect(validation.ok).toBe(true);
    expect(invoked).toBe(false);
    expect(result.capabilityResult.status).toBe('blocked');
    expect(result.capabilityResult.processBoundaryInvoked).toBe(false);
    expect(result.capabilityResult.externalProcessStarted).toBe(false);
  });

  it('requires persisted approval for controlled HTTP execution', async () => {
    const plan = planElectronCdpObservation({
      runnerMode: 'controlled-local-http',
      debugEndpoint: createEndpointSummary(),
    });
    const result = await executeElectronCdpAdapter({
      plan,
      authority,
      runner: createElectronCdpControlledHttpRunner({
        host: '127.0.0.1',
        port: 9222,
        fetch: async () => ({
          ok: true,
          status: 200,
          async text() {
            return '{}';
          },
        }),
      }),
    });

    expect(result.capabilityResult.status).toBe('blocked');
    expect(result.electronRun.plan.blockReasons).toContain('approval_artifact_missing');
    expect(result.electronRun.cdpHttpBoundaryInvoked).toBe(false);
  });

  it('executes controlled HTTP metadata reads with endpoint hash binding', async () => {
    const plan = planElectronCdpObservation({
      runnerMode: 'controlled-local-http',
      debugEndpoint: createEndpointSummary(),
      requestedCapabilities: ['debug_endpoint_summary', 'target_summary'],
    });
    const requestedUrls: string[] = [];
    const approvedAuthority: ExecutionAuthority = {
      ...authority,
      approvalArtifactId: 'electron_approval_artifact_1',
    };
    const result = await executeElectronCdpAdapter({
      plan,
      authority: approvedAuthority,
      runner: createElectronCdpControlledHttpRunner({
        host: '127.0.0.1',
        port: 9222,
        fetch: async (url) => {
          requestedUrls.push(url);

          return {
            ok: true,
            status: 200,
            async text() {
              return url.endsWith('/json/list')
                ? JSON.stringify([
                    {
                      id: 'target-1',
                      type: 'page',
                      title: 'Codex Desktop',
                      url: 'app://codex/?secret=value',
                      webSocketDebuggerUrl: 'ws://127.0.0.1:9222/devtools/page/target-1',
                    },
                  ])
                : JSON.stringify({ Browser: 'Electron test' });
            },
          };
        },
      }),
    });
    const serialized = JSON.stringify(result);

    expect(result.capabilityResult.status).toBe('completed');
    expect(result.electronRun.cdpHttpBoundaryInvoked).toBe(true);
    expect(result.electronRun.processBoundaryInvoked).toBe(false);
    expect(result.electronRun.externalProcessStarted).toBe(false);
    expect(result.electronRun.observationSummary?.targets).toHaveLength(1);
    expect(result.electronRun.observationSummary?.targets[0]?.urlHash).toMatch(/^sha256:/);
    expect(result.auditEvents[0]?.metadata?.cdpHttpBoundaryInvoked).toBe(true);
    expect(requestedUrls).toEqual([
      'http://127.0.0.1:9222/json/version',
      'http://127.0.0.1:9222/json/list',
    ]);
    expect(serialized).not.toContain('Codex Desktop');
    expect(serialized).not.toContain('app://codex');
    expect(serialized).not.toContain('ws://');
    expect(serialized).not.toContain('secret=value');
  });

  it('executes injected fixtures as metadata-only evidence and audit', async () => {
    const plan = planElectronCdpObservation({
      processSummary: createProcessSummary(),
      debugEndpoint: createEndpointSummary(),
      targets: [createTargetSummary()],
    });
    const result = await executeElectronCdpAdapter({
      plan,
      authority,
      actor: 'test-runner',
      runner: createElectronCdpFixtureRunner({
        status: 'completed',
        consoleSummary: createElectronCdpConsoleSummary({
          messageCount: 3,
          warningCount: 1,
          errorCount: 0,
        }),
        networkSummary: createElectronCdpNetworkMetadataSummary({
          requestCount: 4,
          responseCount: 4,
          failedRequestCount: 0,
        }),
        summary: 'Fixture observed Electron renderer metadata.',
        metadata: {
          cwd: 'C:\\Users\\Thomas\\CodexHub',
          authorization: 'Bearer secret',
        },
      }),
    });
    const validation = validateCapabilityExecutionEnvelope(result);
    const serialized = JSON.stringify(result);

    expect(validation.ok).toBe(true);
    expect(result.capabilityResult.status).toBe('completed');
    expect(result.electronRun.observationSummary?.consoleSummary.messageCount).toBe(3);
    expect(result.auditEvents[0]?.policyDecisionId).toBe(authority.policyDecisionId);
    expect(result.auditEvents[0]?.target).toBe(plan.observationPlan.debugEndpoint?.endpointIdHash);
    expect(result.evidenceRefs.some((ref) => ref.kind === 'electron.run_summary')).toBe(
      true,
    );
    expect(serialized).not.toContain('C:\\Users\\Thomas');
    expect(serialized).not.toContain('Bearer secret');
    expect(serialized).not.toContain('app://codex');
    expect(result.capabilityResult.processBoundaryInvoked).toBe(false);
    expect(result.capabilityResult.externalProcessStarted).toBe(false);
  });

  it('fails closed when an injected fixture claims a process boundary', async () => {
    const plan = planElectronCdpObservation({ debugEndpoint: createEndpointSummary() });
    const result = await executeElectronCdpAdapter({
      plan,
      authority,
      runner: createElectronCdpFixtureRunner({
        status: 'completed',
        processBoundaryInvoked: true,
        externalProcessStarted: true,
      }),
    });
    const validation = validateCapabilityExecutionEnvelope(result);

    expect(validation.ok).toBe(true);
    expect(result.capabilityResult.status).toBe('failed');
    expect(result.electronRun.processBoundaryInvoked).toBe(false);
    expect(result.electronRun.externalProcessStarted).toBe(false);
    expect(result.electronRun.plan.blockReasons).toContain(
      'fixture_process_boundary_forbidden',
    );
  });
});

function createProcessSummary() {
  return createElectronProcessSummary({
    processId: 9123,
    executablePath: 'C:\\Users\\Thomas\\AppData\\Local\\Codex\\Codex.exe',
    commandLine: '--remote-debugging-port=9222',
    processKind: 'renderer',
  });
}

function createEndpointSummary() {
  return createElectronDebugEndpointSummary({
    host: '127.0.0.1',
    port: 9222,
    userEnabled: true,
  });
}

function createTargetSummary() {
  return createElectronTargetSummary({
    endpointIdHash: createEndpointSummary().endpointIdHash,
    targetId: 'target-1',
    targetType: 'webview',
    title: 'Codex renderer',
    url: 'app://codex/?token=secret',
  });
}

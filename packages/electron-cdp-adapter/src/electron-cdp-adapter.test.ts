import { readFileSync } from 'node:fs';
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
import { hashText } from '@codexhub/evidence-kernel';
import { describe, expect, it } from 'vitest';

import { createElectronCdpControlledHttpRunner } from './controlled-http-runner';
import { createElectronCdpControlledWebSocketEventRunner } from './controlled-websocket-event-runner';
import { executeElectronCdpAdapter } from './execute';
import { createElectronCdpFixtureRunner } from './fixture';
import { runElectronMainInspectorBoundary } from './main-inspector-boundary';
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
const sourceDir = new URL('.', import.meta.url);

describe('electron-cdp-adapter', () => {
  it('keeps Electron main inspector constrained to named snippet hash execution', () => {
    const source = readFileSync(new URL('./main-inspector-boundary.ts', sourceDir), 'utf8');
    const forbiddenTerms = [
      'eval(',
      'new Function',
      'Function(',
      'Page.',
      'DOM.',
      'Input.',
      'Browser.',
      'process.env',
      'child_process',
      'execFile(',
      'spawn(',
      'shell: true',
      'fetch(',
      'http://',
      'https://',
      'rawJavascriptStored: true',
      'rawOutputStored: true',
      'rawPathStored: true',
    ];

    expect(forbiddenTerms.filter((term) => source.includes(term))).toEqual([]);
    expect(source).toContain('lookupSnippetHash(input.allowedSnippetHashes, input.snippetId)');
    expect(source).toContain('snippetSourceHash');
    expect(source).toContain('isLoopbackElectronEndpointHost(endpoint.hostname)');
  });

  it('declares a fixture-only Electron capability manifest', () => {
    const manifest = createElectronCdpAdapterManifest();
    const validation = validateCapabilityManifest(manifest);

    expect(validation.ok).toBe(true);
    expect(manifest.kind).toBe('electron');
    expect(manifest.provider).toBe('builtin');
    expect(manifest.processBoundary.mayStartExternalProcess).toBe(false);
    expect(manifest.metadata?.integrationStage).toBe('m5c');
    expect(manifest.metadata?.controlledLocalHttpSupported).toBe(true);
    expect(manifest.metadata?.controlledWebSocketEventsSupported).toBe(true);
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

  it('plans controlled WebSocket event observations with fixed read subscription commands', () => {
    const target = createTargetSummary();
    const plan = planElectronCdpObservation({
      runnerMode: 'controlled-websocket-events',
      debugEndpoint: createEndpointSummary(),
      targetIdHash: target.targetIdHash,
      observationWindowMs: 1_500,
      requestedCapabilities: ['console_summary', 'network_metadata_summary'],
    });

    expect(plan.status).toBe('ready');
    expect(plan.observationPlan.runnerMode).toBe('controlled-websocket-events');
    expect(plan.observationPlan.targetIdHash).toBe(target.targetIdHash);
    expect(plan.observationPlan.observationWindowMs).toBe(1_500);
    expect(plan.observationPlan.cdpHttpBoundaryPlanned).toBe(true);
    expect(plan.observationPlan.cdpWebSocketBoundaryPlanned).toBe(true);
    expect(plan.observationPlan.cdpWebSocketBoundaryInvoked).toBe(false);
    expect(plan.capabilityDryRun.plannedActions[0]?.requiresApproval).toBe(true);
    expect(plan.observationPlan.commandDecisions.map((decision) => decision.command)).toEqual([
      'Log.enable',
      'Runtime.enable',
      'Network.enable',
    ]);
    expect(plan.observationPlan.commandDecisions.every((decision) => decision.allowed)).toBe(
      true,
    );
  });

  it('blocks controlled WebSocket event plans without a target hash', () => {
    const plan = planElectronCdpObservation({
      runnerMode: 'controlled-websocket-events',
      debugEndpoint: createEndpointSummary(),
    });

    expect(plan.status).toBe('blocked');
    expect(plan.observationPlan.blockReasons).toContain('target_hash_required');
    expect(plan.observationPlan.cdpWebSocketBoundaryPlanned).toBe(true);
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

  it('preserves controlled HTTP metadata hashes when target parsing fails', async () => {
    const plan = planElectronCdpObservation({
      runnerMode: 'controlled-local-http',
      debugEndpoint: createEndpointSummary(),
      requestedCapabilities: ['debug_endpoint_summary', 'target_summary'],
    });
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
        fetch: async (url) => ({
          ok: true,
          status: 200,
          async text() {
            return url.endsWith('/json/list')
              ? '{"privateTargetUrl":"app://codex/?token=secret"'
              : '{"Browser":"Electron test"}';
          },
        }),
      }),
    });
    const serialized = JSON.stringify(result);

    expect(result.capabilityResult.status).toBe('failed');
    expect(result.electronRun.cdpHttpBoundaryInvoked).toBe(true);
    expect(result.electronRun.observationSummary?.networkSummary.requestCount).toBe(2);
    expect(result.electronRun.observationSummary?.networkSummary.responseCount).toBe(2);
    expect(result.electronRun.observationSummary?.networkSummary.failedRequestCount).toBe(0);
    expect(String(result.auditEvents[0]?.metadata?.versionBodyHash)).toMatch(/^sha256:/);
    expect(String(result.auditEvents[0]?.metadata?.listBodyHash)).toMatch(/^sha256:/);
    expect(serialized).not.toContain('privateTargetUrl');
    expect(serialized).not.toContain('app://codex');
    expect(serialized).not.toContain('token=secret');
  });

  it('executes controlled WebSocket event observations with metadata-only summaries', async () => {
    const target = createTargetSummary();
    const plan = planElectronCdpObservation({
      runnerMode: 'controlled-websocket-events',
      debugEndpoint: createEndpointSummary(),
      targetIdHash: target.targetIdHash,
      observationWindowMs: 10,
    });
    const sentCommands: string[] = [];
    const approvedAuthority: ExecutionAuthority = {
      ...authority,
      approvalArtifactId: 'electron_approval_artifact_1',
    };
    const result = await executeElectronCdpAdapter({
      plan,
      authority: approvedAuthority,
      runner: createElectronCdpControlledWebSocketEventRunner({
        host: '127.0.0.1',
        port: 9222,
        targetIdHash: target.targetIdHash,
        fetch: async () => ({
          ok: true,
          status: 200,
          async text() {
            return JSON.stringify([
              {
                id: 'target-1',
                type: 'webview',
                title: 'Codex Desktop',
                url: 'app://codex/?secret=value',
                webSocketDebuggerUrl: 'ws://127.0.0.1:9222/devtools/page/target-1',
              },
            ]);
          },
        }),
        webSocketFactory: () => {
          const socket = {
            onopen: null as (() => void) | null,
            onmessage: null as ((event: { data?: unknown }) => void) | null,
            onerror: null as (() => void) | null,
            onclose: null as (() => void) | null,
            send(data: string) {
              sentCommands.push(JSON.parse(data).method as string);
              if (sentCommands.length === 3) {
                queueMicrotask(() => {
                  socket.onmessage?.({
                    data: JSON.stringify({
                      method: 'Log.entryAdded',
                      params: { entry: { level: 'warning', text: 'private' } },
                    }),
                  });
                  socket.onmessage?.({
                    data: JSON.stringify({
                      method: 'Network.requestWillBeSent',
                      params: { request: { url: 'https://example.test/private' } },
                    }),
                  });
                  socket.onmessage?.({
                    data: JSON.stringify({ method: 'Network.responseReceived' }),
                  });
                  socket.onclose?.();
                });
              }
            },
            close() {},
          };
          queueMicrotask(() => socket.onopen?.());
          return socket;
        },
      }),
    });
    const serialized = JSON.stringify(result);

    expect(result.capabilityResult.status).toBe('completed');
    expect(result.electronRun.cdpHttpBoundaryInvoked).toBe(true);
    expect(result.electronRun.cdpWebSocketBoundaryInvoked).toBe(true);
    expect(result.electronRun.observationSummary?.eventSummary?.eventCount).toBe(3);
    expect(result.electronRun.observationSummary?.consoleSummary.warningCount).toBe(1);
    expect(result.electronRun.observationSummary?.networkSummary.requestCount).toBe(1);
    expect(sentCommands).toEqual(['Log.enable', 'Runtime.enable', 'Network.enable']);
    expect(result.auditEvents[0]?.metadata?.cdpWebSocketBoundaryInvoked).toBe(true);
    expect(serialized).not.toContain('Codex Desktop');
    expect(serialized).not.toContain('app://codex');
    expect(serialized).not.toContain('ws://');
    expect(serialized).not.toContain('https://example.test/private');
    expect(serialized).not.toContain('secret=value');
  });

  it('blocks controlled WebSocket event execution when the debugger URL is not loopback', async () => {
    const target = createTargetSummary();
    const plan = planElectronCdpObservation({
      runnerMode: 'controlled-websocket-events',
      debugEndpoint: createEndpointSummary(),
      targetIdHash: target.targetIdHash,
      observationWindowMs: 10,
    });
    const approvedAuthority: ExecutionAuthority = {
      ...authority,
      approvalArtifactId: 'electron_approval_artifact_1',
    };
    const result = await executeElectronCdpAdapter({
      plan,
      authority: approvedAuthority,
      runner: createElectronCdpControlledWebSocketEventRunner({
        host: '127.0.0.1',
        port: 9222,
        targetIdHash: target.targetIdHash,
        fetch: async () => ({
          ok: true,
          status: 200,
          async text() {
            return JSON.stringify([
              {
                id: 'target-1',
                type: 'webview',
                webSocketDebuggerUrl: 'ws://192.168.1.10:9222/devtools/page/target-1',
              },
            ]);
          },
        }),
        webSocketFactory: () => {
          throw new Error('should not connect');
        },
      }),
    });

    expect(result.capabilityResult.status).toBe('blocked');
    expect(result.electronRun.cdpHttpBoundaryInvoked).toBe(true);
    expect(result.electronRun.cdpWebSocketBoundaryInvoked).toBe(false);
    expect(result.auditEvents[0]?.metadata?.cdpHttpBoundaryInvoked).toBe(true);
    expect(result.auditEvents[0]?.metadata?.blockReason).toBe(
      'non_loopback_websocket_url_forbidden',
    );
  });

  it('blocks controlled WebSocket event execution when debugger URL does not match the endpoint', async () => {
    const target = createTargetSummary();
    const plan = planElectronCdpObservation({
      runnerMode: 'controlled-websocket-events',
      debugEndpoint: createEndpointSummary(),
      targetIdHash: target.targetIdHash,
      observationWindowMs: 10,
    });
    const approvedAuthority: ExecutionAuthority = {
      ...authority,
      approvalArtifactId: 'electron_approval_artifact_1',
    };
    const result = await executeElectronCdpAdapter({
      plan,
      authority: approvedAuthority,
      runner: createElectronCdpControlledWebSocketEventRunner({
        host: '127.0.0.1',
        port: 9222,
        targetIdHash: target.targetIdHash,
        fetch: async () => ({
          ok: true,
          status: 200,
          async text() {
            return JSON.stringify([
              {
                id: 'target-1',
                type: 'webview',
                webSocketDebuggerUrl: 'ws://127.0.0.1:9223/devtools/page/target-1',
              },
            ]);
          },
        }),
        webSocketFactory: () => {
          throw new Error('should not connect');
        },
      }),
    });

    expect(result.capabilityResult.status).toBe('blocked');
    expect(result.electronRun.cdpHttpBoundaryInvoked).toBe(true);
    expect(result.electronRun.cdpWebSocketBoundaryInvoked).toBe(false);
    expect(result.auditEvents[0]?.metadata?.cdpHttpBoundaryInvoked).toBe(true);
    expect(result.auditEvents[0]?.metadata?.blockReason).toBe('endpoint_hash_mismatch');
  });

  it('preserves HTTP boundary truth when WebSocket execution blocks after target list read', async () => {
    const target = createTargetSummary();
    const plan = planElectronCdpObservation({
      runnerMode: 'controlled-websocket-events',
      debugEndpoint: createEndpointSummary(),
      targetIdHash: target.targetIdHash,
      observationWindowMs: 10,
    });
    const approvedAuthority: ExecutionAuthority = {
      ...authority,
      approvalArtifactId: 'electron_approval_artifact_1',
    };
    const result = await executeElectronCdpAdapter({
      plan,
      authority: approvedAuthority,
      runner: createElectronCdpControlledWebSocketEventRunner({
        host: '127.0.0.1',
        port: 9222,
        targetIdHash: target.targetIdHash,
        fetch: async () => ({
          ok: true,
          status: 200,
          async text() {
            return JSON.stringify([
              {
                id: 'target-1',
                type: 'webview',
                title: 'Codex Desktop',
                url: 'app://codex/?secret=value',
              },
            ]);
          },
        }),
        webSocketFactory: () => {
          throw new Error('should not connect');
        },
      }),
    });
    const serialized = JSON.stringify(result);

    expect(result.capabilityResult.status).toBe('blocked');
    expect(result.electronRun.cdpHttpBoundaryInvoked).toBe(true);
    expect(result.electronRun.cdpWebSocketBoundaryInvoked).toBe(false);
    expect(result.electronRun.processBoundaryInvoked).toBe(false);
    expect(result.electronRun.externalProcessStarted).toBe(false);
    expect(result.auditEvents[0]?.metadata?.blockReason).toBe('websocket_debugger_url_missing');
    expect(result.auditEvents[0]?.metadata?.cdpHttpBoundaryInvoked).toBe(true);
    expect(String(result.auditEvents[0]?.metadata?.listBodyHash)).toMatch(/^sha256:/);
    expect(serialized).not.toContain('Codex Desktop');
    expect(serialized).not.toContain('app://codex');
    expect(serialized).not.toContain('secret=value');
    expect(serialized).not.toContain('ws://');
  });

  it('preserves WebSocket HTTP metadata hashes when target list parsing fails', async () => {
    const target = createTargetSummary();
    const plan = planElectronCdpObservation({
      runnerMode: 'controlled-websocket-events',
      debugEndpoint: createEndpointSummary(),
      targetIdHash: target.targetIdHash,
      observationWindowMs: 10,
    });
    const approvedAuthority: ExecutionAuthority = {
      ...authority,
      approvalArtifactId: 'electron_approval_artifact_1',
    };
    const result = await executeElectronCdpAdapter({
      plan,
      authority: approvedAuthority,
      runner: createElectronCdpControlledWebSocketEventRunner({
        host: '127.0.0.1',
        port: 9222,
        targetIdHash: target.targetIdHash,
        fetch: async () => ({
          ok: true,
          status: 200,
          async text() {
            return '{"webSocketDebuggerUrl":"ws://127.0.0.1:9222/devtools/page/private"';
          },
        }),
        webSocketFactory: () => {
          throw new Error('should not connect');
        },
      }),
    });
    const serialized = JSON.stringify(result);

    expect(result.capabilityResult.status).toBe('failed');
    expect(result.electronRun.cdpHttpBoundaryInvoked).toBe(true);
    expect(result.electronRun.cdpWebSocketBoundaryInvoked).toBe(false);
    expect(result.electronRun.observationSummary?.networkSummary.requestCount).toBe(1);
    expect(result.electronRun.observationSummary?.networkSummary.responseCount).toBe(1);
    expect(result.electronRun.observationSummary?.networkSummary.failedRequestCount).toBe(0);
    expect(String(result.auditEvents[0]?.metadata?.listBodyHash)).toMatch(/^sha256:/);
    expect(serialized).not.toContain('webSocketDebuggerUrl');
    expect(serialized).not.toContain('ws://127.0.0.1');
    expect(serialized).not.toContain('private');
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

  it('runs Electron main inspector snippets only when snippet hash is allowlisted', async () => {
    const endpointUrl = 'http://127.0.0.1:9222/devtools/page/1';
    const snippetSource = '(() => 1)()';
    const snippetSourceHash = `sha256:${hashText(snippetSource)}`;
    const result = await runElectronMainInspectorBoundary({
      endpointUrl,
      endpointHash: `sha256:${hashText(endpointUrl)}`,
      targetIdHash: 'sha256:target',
      snippetId: 'safe-snippet',
      snippetSource,
      snippetSourceHash,
      allowedSnippetHashes: { 'safe-snippet': snippetSourceHash },
      runtimeRunner: async () => ({
        status: 'completed',
        resultHash: 'sha256:result',
        summary: 'Synthetic runtime completed.',
      }),
    });
    const serialized = JSON.stringify(result);

    expect(result.status).toBe('completed');
    expect(result.mainInspectorInvoked).toBe(true);
    expect(result.rawJavascriptStored).toBe(false);
    expect(serialized).not.toContain(snippetSource);
  });

  it('does not trust raw Electron main inspector runner summaries', async () => {
    const endpointUrl = 'http://127.0.0.1:9222/devtools/page/1';
    const snippetSource = '(() => "private-token-from-snippet")()';
    const snippetSourceHash = `sha256:${hashText(snippetSource)}`;
    const result = await runElectronMainInspectorBoundary({
      endpointUrl,
      endpointHash: `sha256:${hashText(endpointUrl)}`,
      targetIdHash: 'sha256:target',
      snippetId: 'safe-snippet',
      snippetSource,
      snippetSourceHash,
      allowedSnippetHashes: { 'safe-snippet': snippetSourceHash },
      runtimeRunner: async () => ({
        status: 'completed',
        summary:
          'Raw runner output included private-token-from-snippet and C:\\Users\\Thomas\\CodexHub',
      }),
    });
    const serialized = JSON.stringify(result);

    expect(result.status).toBe('completed');
    expect(result.mainInspectorInvoked).toBe(true);
    expect(result.summary).toBe(
      'Electron main inspector fixed snippet completed with metadata-only result.',
    );
    expect(result.rawJavascriptStored).toBe(false);
    expect(result.rawOutputStored).toBe(false);
    expect(serialized).not.toContain('private-token-from-snippet');
    expect(serialized).not.toContain('C:\\Users\\Thomas');
    expect(serialized).not.toContain(snippetSource);
  });

  it('blocks Electron main inspector when endpoint, snippet hash, or allowlist binding fails', async () => {
    const endpointUrl = 'http://127.0.0.1:9222/devtools/page/1';
    const snippetSource = '(() => 1)()';
    const snippetSourceHash = `sha256:${hashText(snippetSource)}`;
    const mismatchedEndpoint = await runElectronMainInspectorBoundary({
      endpointUrl,
      endpointHash: `sha256:${hashText('http://127.0.0.1:9222/devtools/page/other')}`,
      targetIdHash: 'sha256:target',
      snippetId: 'safe-snippet',
      snippetSource,
      snippetSourceHash,
      allowedSnippetHashes: { 'safe-snippet': snippetSourceHash },
      runtimeRunner: async () => {
        throw new Error('runner must not be reached on endpoint mismatch');
      },
    });
    const nonLoopback = await runElectronMainInspectorBoundary({
      endpointUrl: 'http://192.168.1.20:9222/devtools/page/1',
      endpointHash: `sha256:${hashText('http://192.168.1.20:9222/devtools/page/1')}`,
      targetIdHash: 'sha256:target',
      snippetId: 'safe-snippet',
      snippetSource,
      snippetSourceHash,
      allowedSnippetHashes: { 'safe-snippet': snippetSourceHash },
      runtimeRunner: async () => {
        throw new Error('runner must not be reached on non-loopback endpoint');
      },
    });
    const snippetMismatch = await runElectronMainInspectorBoundary({
      endpointUrl,
      endpointHash: `sha256:${hashText(endpointUrl)}`,
      targetIdHash: 'sha256:target',
      snippetId: 'safe-snippet',
      snippetSource,
      snippetSourceHash: `sha256:${hashText('(() => 2)()')}`,
      allowedSnippetHashes: { 'safe-snippet': snippetSourceHash },
      runtimeRunner: async () => {
        throw new Error('runner must not be reached on snippet mismatch');
      },
    });
    const notAllowlisted = await runElectronMainInspectorBoundary({
      endpointUrl,
      endpointHash: `sha256:${hashText(endpointUrl)}`,
      targetIdHash: 'sha256:target',
      snippetId: 'unsafe-snippet',
      snippetSource,
      snippetSourceHash,
      allowedSnippetHashes: { 'safe-snippet': snippetSourceHash },
      runtimeRunner: async () => {
        throw new Error('runner must not be reached when snippet is not allowlisted');
      },
    });
    const serialized = JSON.stringify([
      mismatchedEndpoint,
      nonLoopback,
      snippetMismatch,
      notAllowlisted,
    ]);

    expect(mismatchedEndpoint.status).toBe('blocked');
    expect(nonLoopback.status).toBe('blocked');
    expect(snippetMismatch.status).toBe('blocked');
    expect(notAllowlisted.status).toBe('blocked');
    for (const result of [mismatchedEndpoint, nonLoopback, snippetMismatch, notAllowlisted]) {
      expect(result.mainInspectorInvoked).toBe(false);
      expect(result.rawJavascriptStored).toBe(false);
      expect(result.rawOutputStored).toBe(false);
    }
    expect(serialized).not.toContain(snippetSource);
    expect(serialized).not.toContain('192.168.1.20');
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

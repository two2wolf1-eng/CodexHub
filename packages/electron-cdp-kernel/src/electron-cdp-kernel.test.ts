import { describe, expect, it } from 'vitest';
import {
  ELECTRON_CDP_COMMAND_ALLOWLIST,
  ELECTRON_CDP_FORBIDDEN_ACTIONS,
  ELECTRON_CDP_READ_ONLY_CAPABILITIES,
  createElectronCdpCommandAllowlistDecision,
  createElectronCdpConsoleSummary,
  createElectronCdpEventMetadataSummary,
  createElectronCdpNetworkMetadataSummary,
  createElectronDebugEndpointSummary,
  createElectronProcessSummary,
  createElectronTargetSummary,
  hashElectronLocalMetadata,
  isLoopbackElectronEndpointHost,
  isLoopbackElectronWebSocketUrl,
} from './index';

describe('electron-cdp-kernel', () => {
  it('creates hash-only process and target summaries', () => {
    const processSummary = createElectronProcessSummary({
      processId: 12345,
      executablePath: 'C:\\Users\\Thomas\\AppData\\Local\\Codex\\Codex.exe',
      commandLine: '--remote-debugging-port=9222 --inspect',
      processKind: 'renderer',
      windowTitle: 'Codex Desktop',
      metadata: {
        executablePath: 'C:\\Users\\Thomas\\AppData\\Local\\Codex\\Codex.exe',
        nested: {
          token: 'secret',
        },
      },
    });
    const endpoint = createElectronDebugEndpointSummary({
      host: '127.0.0.1',
      port: 9222,
      userEnabled: true,
    });
    const target = createElectronTargetSummary({
      endpointIdHash: endpoint.endpointIdHash,
      targetId: 'renderer-target-1',
      targetType: 'webview',
      title: 'Codex renderer',
      url: 'app://codex/?token=secret',
    });
    const serialized = JSON.stringify({ processSummary, endpoint, target });

    expect(processSummary.rawPathStored).toBe(false);
    expect(processSummary.processBoundaryInvoked).toBe(false);
    expect(endpoint.loopbackOnly).toBe(true);
    expect(endpoint.mainInspectorEnabled).toBe(false);
    expect(target.urlHash).toMatch(/^sha256:/);
    expect(serialized).not.toContain('Codex.exe');
    expect(serialized).not.toContain('renderer-target-1');
    expect(serialized).not.toContain('app://codex');
    expect(serialized).not.toContain('secret');
  });

  it('hashes local metadata stably', () => {
    expect(hashElectronLocalMetadata('C:\\Codex\\Codex.exe')).toBe(
      hashElectronLocalMetadata('C:\\Codex\\Codex.exe'),
    );
    expect(hashElectronLocalMetadata('C:\\Codex\\Codex.exe')).not.toBe(
      hashElectronLocalMetadata('C:\\Other\\Codex.exe'),
    );
  });

  it('requires loopback endpoints', () => {
    expect(isLoopbackElectronEndpointHost('localhost')).toBe(true);
    expect(isLoopbackElectronEndpointHost('127.0.0.1')).toBe(true);
    expect(isLoopbackElectronEndpointHost('::1')).toBe(true);
    expect(isLoopbackElectronEndpointHost('192.168.1.10')).toBe(false);
    expect(isLoopbackElectronWebSocketUrl('ws://127.0.0.1:9222/devtools/page/1')).toBe(
      true,
    );
    expect(isLoopbackElectronWebSocketUrl('ws://192.168.1.10:9222/devtools/page/1')).toBe(
      false,
    );
    expect(() =>
      createElectronDebugEndpointSummary({
        host: '192.168.1.10',
        port: 9222,
        userEnabled: true,
      }),
    ).toThrow();
  });

  it('keeps a narrow command allowlist', () => {
    expect(ELECTRON_CDP_READ_ONLY_CAPABILITIES).toEqual([
      'process_summary',
      'debug_endpoint_summary',
      'target_summary',
      'console_summary',
      'network_metadata_summary',
    ]);
    expect(ELECTRON_CDP_FORBIDDEN_ACTIONS).toContain('runtime_evaluate');
    expect(ELECTRON_CDP_COMMAND_ALLOWLIST).toEqual([
      'Browser.getVersion',
      'Target.getTargets',
      'Log.enable',
      'Runtime.enable',
      'Network.enable',
    ]);

    const allowed = createElectronCdpCommandAllowlistDecision('Target.getTargets');
    const runtimeEvaluate = createElectronCdpCommandAllowlistDecision(
      'Runtime.evaluate',
    );
    const genericCommand = createElectronCdpCommandAllowlistDecision('Page.captureScreenshot');

    expect(allowed.allowed).toBe(true);
    expect(runtimeEvaluate.allowed).toBe(false);
    expect(runtimeEvaluate.riskLevel).toBe('critical');
    expect(runtimeEvaluate.runtimeEvaluateAllowed).toBe(false);
    expect(genericCommand.allowed).toBe(false);
    expect(genericCommand.genericCommandPassthrough).toBe(false);
  });

  it('creates metadata-only console and network summaries', () => {
    const consoleSummary = createElectronCdpConsoleSummary({
      messageCount: 3,
      warningCount: 1,
      errorCount: 1,
    });
    const networkSummary = createElectronCdpNetworkMetadataSummary({
      requestCount: 5,
      responseCount: 4,
      failedRequestCount: 1,
    });

    expect(consoleSummary.bodyStored).toBe(false);
    expect(networkSummary.bodyStored).toBe(false);
    expect(networkSummary.requestCount).toBe(5);

    const eventSummary = createElectronCdpEventMetadataSummary({
      observationWindowMs: 1_000,
      eventCount: 2,
      consoleEventCount: 1,
      networkEventCount: 1,
      payloadHashes: ['sha256:event'],
    });

    expect(eventSummary.bodyStored).toBe(false);
    expect(eventSummary.rawPathStored).toBe(false);
    expect(eventSummary.payloadHashes).toEqual(['sha256:event']);
  });
});

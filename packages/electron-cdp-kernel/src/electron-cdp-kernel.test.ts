import { describe, expect, it } from 'vitest';
import {
  CodexAccountBindingSchema,
  CodexAppServerSessionSchema,
  QuotaSnapshotSchema,
} from '@codexhub/contracts';
import {
  ELECTRON_CDP_COMMAND_ALLOWLIST,
  ELECTRON_CDP_FORBIDDEN_ACTIONS,
  ELECTRON_CDP_READ_ONLY_CAPABILITIES,
  createElectronCdpCommandAllowlistDecision,
  createElectronCdpConsoleSummary,
  createElectronCdpEventMetadataSummary,
  createElectronCdpNetworkMetadataSummary,
  createCodexDesktopHealthSnapshot,
  createElectronDebugEndpointSummary,
  createElectronProcessSummary,
  createElectronTargetSummary,
  hashElectronLocalMetadata,
  inferCodexDesktopDiagnosticHints,
  isCodexDesktopProcessName,
  isLoopbackElectronEndpointHost,
  isLoopbackElectronWebSocketUrl,
  reconcileCodexDesktopDiagnosticHints,
  reconcileCodexDesktopHealth,
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

  it('creates Codex Desktop health snapshots from read-only metadata', () => {
    const processSummary = createElectronProcessSummary({
      processId: 12345,
      executablePath: 'C:\\Users\\Thomas\\AppData\\Local\\Codex\\Codex.exe',
      commandLine: '--remote-debugging-port=43325',
      processKind: 'main',
    });
    const endpoint = createElectronDebugEndpointSummary({
      host: '127.0.0.1',
      port: 43325,
      userEnabled: true,
    });
    const health = createCodexDesktopHealthSnapshot({
      processSummary,
      debugEndpoint: endpoint,
      targetCount: 1,
      consoleErrorCount: 0,
      networkFailedRequestCount: 0,
      appServerResponsive: false,
      desktopUiResponsive: false,
      quotaAvailable: false,
      loggedIn: true,
      accountMatched: true,
      workspaceMatched: true,
    });
    const serialized = JSON.stringify(health);

    expect(isCodexDesktopProcessName('Codex.exe')).toBe(true);
    expect(isCodexDesktopProcessName('notepad.exe')).toBe(false);
    expect(health.status).toBe('degraded');
    expect(health.diagnosticHints).toEqual([
      'desktop_ui_frozen',
      'app_server_unresponsive',
      'quota_depleted',
    ]);
    expect(health.rawPathStored).toBe(false);
    expect(health.processBoundaryInvoked).toBe(false);
    expect(serialized).not.toContain('Codex.exe');
    expect(serialized).not.toContain('43325');
    expect(serialized).not.toContain('C:\\Users\\Thomas');
    expect(inferCodexDesktopDiagnosticHints({ loggedIn: false })).toContain(
      'codex_logged_out',
    );
  });

  it('reconciles App Server, quota, login, account, and workspace hints', () => {
    const appServerSession = CodexAppServerSessionSchema.parse({
      id: 'codex_app_server_session_1',
      schemaVersion: '2026-04-28.foundation',
      observedAt: '2026-05-08T00:00:00.000Z',
      clientInstanceId: 'codex_client_1',
      appServerSessionHash: 'sha256:app-server',
      status: 'degraded',
      initialized: false,
      protocolDriftDetected: true,
      summary: 'App Server metadata indicates degraded readiness.',
    });
    const accountBinding = CodexAccountBindingSchema.parse({
      id: 'codex_account_binding_1',
      schemaVersion: '2026-04-28.foundation',
      observedAt: '2026-05-08T00:00:00.000Z',
      codexAccountHash: 'sha256:account',
      status: 'mismatch',
      summary: 'Account binding metadata indicates mismatch.',
    });
    const quotaSnapshot = QuotaSnapshotSchema.parse({
      id: 'quota_snapshot_1',
      schemaVersion: '2026-04-28.foundation',
      observedAt: '2026-05-08T00:00:00.000Z',
      subjectKind: 'codex-account',
      subjectHash: 'sha256:account',
      status: 'exhausted',
      summary: 'Quota metadata indicates exhausted quota.',
    });
    const health = reconcileCodexDesktopHealth({
      appServerState: appServerSession,
      accountBinding,
      quotaSnapshot,
      desktopUiResponsive: false,
    });
    const hints = reconcileCodexDesktopDiagnosticHints({
      appServerState: appServerSession,
      accountBinding,
      quotaSnapshot,
      desktopUiResponsive: false,
    });
    const serialized = JSON.stringify(health);

    expect(health.status).toBe('blocked');
    expect(health.diagnosticHints).toEqual([
      'no_process',
      'no_cdp_endpoint',
      'desktop_ui_frozen',
      'app_server_unresponsive',
      'quota_depleted',
      'wrong_account',
      'workspace_mismatch',
    ]);
    expect(hints).toContain('app_server_unresponsive');
    expect(hints).toContain('quota_depleted');
    expect(hints).toContain('wrong_account');
    expect(serialized).not.toContain('degraded readiness');
    expect(serialized).not.toContain('exhausted quota');
  });
});

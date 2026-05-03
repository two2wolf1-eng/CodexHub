import { describe, expect, it } from 'vitest';
import {
  createElectronCdpReadOnlySummary,
  createVerificationReadinessPreview,
  createBrowserProfilesReadOnlySummary,
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
    expect(getDashboardViewFromHash('#verification')).toBe('verification');
    expect(getDashboardViewFromHash('#/unknown')).toBe('overview');
    expect(getDashboardHash('evidence')).toBe('#/evidence');
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
});

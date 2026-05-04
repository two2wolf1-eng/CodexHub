import { describe, expect, it } from 'vitest';
import { OperatorReadinessReportSchema } from '@codexhub/contracts';
import {
  createConfigHashSummary,
  createDefaultOperatorReadinessPreview,
  createIntegrationReadinessSummary,
  createOperatorReadinessReport,
} from './index';

describe('operator-readiness-kernel', () => {
  it('creates a metadata-only readiness report from configs and integrations', () => {
    const report = createOperatorReadinessReport({
      storeAvailable: true,
      processBoundaryAllowlistPassed: true,
      noLiveAuditPassed: true,
      configs: [
        { name: 'policies', kind: 'policy', text: 'risk rules', itemCount: 2 },
        { name: 'integrations', kind: 'integration', text: 'integration rules', itemCount: 8 },
      ],
      integrations: [
        {
          name: 'worktree-manager',
          enabled: false,
          riskLevel: 'high',
          approvalRequired: true,
          processBoundary: true,
          blockers: ['disabled_by_default'],
        },
      ],
      localControlKeys: [{ name: 'supervisor', configured: true, value: 'do-not-print' }],
    });
    const serialized = JSON.stringify(report);

    expect(OperatorReadinessReportSchema.parse(report).status).toBe('warn');
    expect(report.configuredLocalControlKeyCount).toBe(1);
    expect(report.configHashes[0]?.hash).toMatch(/^readiness:/);
    expect(serialized).not.toContain('do-not-print');
    expect(serialized).not.toContain('risk rules');
    expect(serialized).not.toContain('integration rules');
    expect(serialized).not.toContain('C:/');
  });

  it('reports store and audit failures as blockers', () => {
    const report = createOperatorReadinessReport({
      storeAvailable: false,
      processBoundaryAllowlistPassed: false,
      noLiveAuditPassed: false,
    });

    expect(report.status).toBe('fail');
    expect(report.failedCheckCount).toBe(3);
    expect(report.checks.some((check) => check.blockers.includes('store_unavailable'))).toBe(true);
  });

  it('summarizes missing configs without raw path or body storage', () => {
    const config = createConfigHashSummary({
      name: 'integration-config',
      kind: 'integration',
      configured: false,
    });

    expect(config.configured).toBe(false);
    expect(config.hash).toBeUndefined();
    expect(config.rawPathStored).toBe(false);
    expect(config.bodyStored).toBe(false);
  });

  it('summarizes integration readiness with conservative defaults', () => {
    const integration = createIntegrationReadinessSummary({
      name: 'electron-cdp',
      enabled: false,
      riskLevel: 'high',
      processBoundary: false,
      networkBoundary: true,
      blockers: ['disabled_by_default'],
    });

    expect(integration.safeToEnable).toBe(false);
    expect(integration.approvalRequired).toBe(true);
    expect(integration.networkBoundary).toBe(true);
  });

  it('creates a degraded-safe default preview', () => {
    const preview = createDefaultOperatorReadinessPreview();

    expect(preview.integrations.length).toBeGreaterThan(0);
    expect(preview.rawValueStored).toBe(false);
    expect(preview.rawPathStored).toBe(false);
    expect(preview.bodyStored).toBe(false);
  });
});

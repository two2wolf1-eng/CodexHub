import { describe, expect, it } from 'vitest';
import {
  M10PilotChecklistSchema,
  M11PilotEnablementChecklistSchema,
  OperatorReadinessReportSchema,
} from '@codexhub/contracts';
import {
  createConfigHashSummary,
  createDefaultOperatorReadinessPreview,
  createIntegrationReadinessSummary,
  createM10PilotChecklist,
  createM10PilotRunbookSummary,
  createM11PilotEnablementChecklist,
  createM11PilotEnablementRunbookSummary,
  createOperatorReadinessReport,
} from './index';
import {
  adversarialPublicOutputFixture,
  findAdversarialPublicOutputLeaks,
} from '../../../test-fixtures/adversarial-public-output-fixture';

function expectNoForbiddenReadinessOutput(serialized: string): void {
  expect(findAdversarialPublicOutputLeaks(serialized)).toEqual([]);
}

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

  it('hashes adversarial config and token values out of readiness public output', () => {
    const report = createOperatorReadinessReport({
      storeAvailable: true,
      processBoundaryAllowlistPassed: true,
      noLiveAuditPassed: true,
      configs: [
        {
          name: 'integrations',
          kind: 'integration',
          text: adversarialPublicOutputFixture,
          itemCount: 1,
        },
      ],
      integrations: [
        {
          name: 'github-provider',
          enabled: false,
          riskLevel: 'high',
          approvalRequired: true,
          networkBoundary: true,
          blockers: ['disabled_by_default'],
        },
      ],
      localControlKeys: [
        { name: 'supervisor', configured: true, value: adversarialPublicOutputFixture },
      ],
    });
    const serialized = JSON.stringify(report);

    expectNoForbiddenReadinessOutput(serialized);
    expect(report.configHashes[0]?.hash).toMatch(/^readiness:/);
    expect(report.checks.find((check) => check.code === 'local_control_key_supervisor')?.hash).toMatch(
      /^readiness:/,
    );
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
    const github = preview.integrations.find((integration) => integration.name === 'github-provider');

    expect(preview.integrations.length).toBeGreaterThan(0);
    expect(github?.networkBoundary).toBe(true);
    expect(github?.blockers).toContain('github_credential_missing');
    expect(github?.blockers).toContain('github_remote_base_branch_not_observed');
    expect(preview.rawValueStored).toBe(false);
    expect(preview.rawPathStored).toBe(false);
    expect(preview.bodyStored).toBe(false);
  });

  it('creates an M10 pilot checklist with safe-enable blockers and no execution', () => {
    const checklist = createM10PilotChecklist();
    const runbook = createM10PilotRunbookSummary({ checklist });
    const serialized = JSON.stringify({ checklist, runbook });

    expect(M10PilotChecklistSchema.parse(checklist).status).toBe('blocked');
    expect(checklist.steps.length).toBeGreaterThan(0);
    expect(checklist.blockerCount).toBeGreaterThan(0);
    expect(checklist.supervisorPostAllowed).toBe(false);
    expect(checklist.localControlKeyRead).toBe(false);
    expect(checklist.adapterExecuteAllowed).toBe(false);
    expect(runbook.status).toBe(checklist.status);
    expect(runbook.supervisorPostAllowed).toBe(false);
    expect(serialized).not.toContain('CODEXHUB_SUPERVISOR_LOCAL_TOKEN');
    expect(serialized).not.toContain('raw prompt');
    expect(serialized).not.toContain('stdout');
    expect(serialized).not.toContain('stderr');
    expect(serialized).not.toContain('diff --git');
    expect(serialized).not.toContain('C:/');
  });

  it('marks M10 pilot checklist ready only after operator prerequisites are present', () => {
    const report = createOperatorReadinessReport({
      storeAvailable: true,
      processBoundaryAllowlistPassed: true,
      noLiveAuditPassed: true,
      configs: [{ name: 'integrations', kind: 'integration', text: 'rules' }],
      integrations: [
        {
          name: 'codex-cli',
          enabled: true,
          defaultEnabled: true,
          riskLevel: 'medium',
          approvalRequired: true,
          processBoundary: true,
          envFlagConfigured: true,
        },
        {
          name: 'nx-affected',
          enabled: true,
          defaultEnabled: true,
          riskLevel: 'low',
          approvalRequired: false,
          processBoundary: true,
          envFlagConfigured: true,
        },
        {
          name: 'worktree-manager',
          enabled: true,
          riskLevel: 'high',
          approvalRequired: true,
          processBoundary: true,
          envFlagConfigured: true,
        },
      ],
      localControlKeys: [{ name: 'supervisor', configured: true, value: 'do-not-print' }],
    });
    const checklist = createM10PilotChecklist({
      readinessReport: report,
      approvalInboxItemCount: 1,
      governanceRunCount: 1,
    });

    expect(checklist.status).toBe('ready');
    expect(checklist.blockerCount).toBe(0);
    expect(checklist.readyStepCount).toBe(checklist.steps.length);
    expect(JSON.stringify(checklist)).not.toContain('do-not-print');
  });

  it('creates an M11 enablement checklist with pilot blockers and no execution', () => {
    const checklist = createM11PilotEnablementChecklist();
    const runbook = createM11PilotEnablementRunbookSummary({ checklist });
    const serialized = JSON.stringify({ checklist, runbook });

    expect(M11PilotEnablementChecklistSchema.parse(checklist).status).toBe('blocked');
    expect(checklist.requiredEnvFlags).toEqual([
      'CODEXHUB_M11_PRODUCTION_PILOT_ENABLED',
      'CODEXHUB_WORKTREE_MANAGER_ENABLED',
    ]);
    expect(checklist.safeEnableBlockers).toContain('m11_pilot_not_safe_to_enable');
    expect(checklist.codexReadOnlyDryRunOnly).toBe(true);
    expect(checklist.patchGenerationAllowed).toBe(false);
    expect(checklist.pushAllowed).toBe(false);
    expect(checklist.pullRequestOpened).toBe(false);
    expect(checklist.localControlKeyRead).toBe(false);
    expect(checklist.supervisorPostAllowed).toBe(false);
    expect(checklist.adapterExecuteAllowed).toBe(false);
    expect(runbook.status).toBe(checklist.status);
    expect(serialized).not.toContain('CODEXHUB_SUPERVISOR_LOCAL_TOKEN');
    expect(serialized).not.toContain('raw prompt');
    expect(serialized).not.toContain('stdout');
    expect(serialized).not.toContain('stderr');
    expect(serialized).not.toContain('diff --git');
    expect(serialized).not.toContain('C:/');
  });

  it('marks M11 enablement ready only after required pilot prerequisites are present', () => {
    const report = createOperatorReadinessReport({
      storeAvailable: true,
      processBoundaryAllowlistPassed: true,
      noLiveAuditPassed: true,
      configs: [{ name: 'integrations', kind: 'integration', text: 'rules' }],
      integrations: [
        {
          name: 'codex-cli',
          enabled: true,
          defaultEnabled: true,
          riskLevel: 'medium',
          approvalRequired: true,
          processBoundary: true,
          envFlagConfigured: true,
        },
        {
          name: 'nx-affected',
          enabled: true,
          defaultEnabled: true,
          riskLevel: 'low',
          approvalRequired: false,
          processBoundary: true,
          envFlagConfigured: true,
        },
        {
          name: 'worktree-manager',
          enabled: true,
          riskLevel: 'high',
          approvalRequired: true,
          processBoundary: true,
          envFlagConfigured: true,
        },
        {
          name: 'm11-production-pilot',
          enabled: true,
          riskLevel: 'high',
          approvalRequired: true,
          processBoundary: true,
          envFlagConfigured: true,
        },
      ],
      localControlKeys: [{ name: 'supervisor', configured: true, value: 'do-not-print' }],
    });
    const checklist = createM11PilotEnablementChecklist({
      readinessReport: report,
      approvalInboxItemCount: 1,
      governanceRunCount: 1,
      latestRunCount: 1,
    });

    expect(checklist.status).toBe('ready');
    expect(checklist.blockerCount).toBe(0);
    expect(checklist.readyStepCount).toBe(checklist.steps.length);
    expect(JSON.stringify(checklist)).not.toContain('do-not-print');
  });
});

import { describe, expect, it } from 'vitest';
import {
  attributeBusinessQuota,
  createBusinessQuotaCrossCheckReport,
  createOwnerAdminExtractionBundle,
  createQuotaDispatchGate,
  createQuotaSnapshotFromSource,
  redactSensitiveObservation,
  summarizeQuotaSourceHealth,
  summarizeUiObservation,
} from './index';

describe('business quota kernel', () => {
  it('summarizes healthy quota sources and blocks unknown quota dispatch', () => {
    const sourceHealth = summarizeQuotaSourceHealth({
      sourceKind: 'app-server-rate-limits',
      sourceRefSeed: 'codex-app-server',
      status: 'healthy',
      observationCount: 1,
      canaryPassed: true,
      liveReadReady: true,
    });
    const quotaSnapshot = createQuotaSnapshotFromSource({
      subjectKind: 'codex-account',
      subjectSeed: 'account-ref',
      status: 'available',
      limitCount: 10,
      usedCount: 2,
      remainingCount: 8,
      sourceHealth,
    });
    const readyGate = createQuotaDispatchGate({
      sourceHealth,
      quotaSnapshot,
      canaryPassed: true,
      liveDispatchRequested: true,
    });
    const blockedGate = createQuotaDispatchGate({
      sourceHealth,
      quotaSnapshot: createQuotaSnapshotFromSource({
        subjectKind: 'codex-account',
        subjectSeed: 'account-ref',
        status: 'unknown',
        sourceHealth,
      }),
      canaryPassed: true,
      liveDispatchRequested: true,
    });

    expect(sourceHealth.rawSourceStored).toBe(false);
    expect(quotaSnapshot.rawBodyStored).toBe(false);
    expect(readyGate.dispatchAllowed).toBe(true);
    expect(blockedGate.dispatchAllowed).toBe(false);
    expect(blockedGate.blockReasons).toContain('quota_unknown');
  });

  it('redacts UI observations and blocks forbidden field keys before persistence', () => {
    const safeObservation = summarizeUiObservation({
      sourceKind: 'business-page-dom',
      targetSeed: 'business-quota-page',
      selectorManifestSeed: 'quota-selectors-v1',
      fieldKeys: ['quotaStatus', 'remainingCount'],
      readableFieldCount: 2,
    });
    const blockedRedaction = redactSensitiveObservation({
      sourceSeed: 'business-quota-page',
      fieldKeys: ['quotaStatus', 'sessionStorage'],
    });

    expect(safeObservation.redactionReport.status).toBe('passed');
    expect(safeObservation.observation.rawDomStored).toBe(false);
    expect(safeObservation.domSummary.networkBodyStored).toBe(false);
    expect(blockedRedaction.status).toBe('blocked');
    expect(blockedRedaction.blockedPersistence).toBe(true);
    expect(blockedRedaction.tokenCookieSessionStorageDetected).toBe(true);
  });

  it('attributes quota only through source and snapshot metadata', () => {
    const sourceHealth = summarizeQuotaSourceHealth({
      sourceKind: 'browser-cdp-dom',
      status: 'healthy',
      canaryPassed: true,
      liveReadReady: true,
    });
    const quotaSnapshot = createQuotaSnapshotFromSource({
      subjectKind: 'business-workspace',
      subjectSeed: 'workspace-ref',
      status: 'limited',
      remainingCount: 3,
      sourceHealth,
    });
    const attribution = attributeBusinessQuota({
      sourceHealth,
      quotaSnapshot,
      workspaceIdHash: quotaSnapshot.subjectHash,
      confidence: 'high',
    });
    const blockedSource = summarizeQuotaSourceHealth({
      sourceKind: 'business-page-dom',
      status: 'blocked',
      failureKind: 'redaction_failed',
      blockReasons: ['redaction_failed'],
    });
    const blockedAttribution = attributeBusinessQuota({ sourceHealth: blockedSource });

    expect(attribution.status).toBe('attributed');
    expect(attribution.rawAttributionStored).toBe(false);
    expect(blockedAttribution.status).toBe('blocked');
    expect(blockedAttribution.blockReasons).toContain('redaction_failed');
  });

  it('cross-checks App Server quota with redacted DOM and renderer observation metadata', () => {
    const sourceHealth = summarizeQuotaSourceHealth({
      sourceKind: 'app-server-rate-limits',
      status: 'healthy',
      canaryPassed: true,
      liveReadReady: true,
    });
    const quotaSnapshot = createQuotaSnapshotFromSource({
      subjectKind: 'codex-account',
      subjectSeed: 'codex-account-ref',
      status: 'limited',
      limitCount: 100,
      usedCount: 43,
      remainingCount: 57,
      sourceHealth,
    });
    const observation = summarizeUiObservation({
      sourceKind: 'electron-renderer-dom',
      targetSeed: 'codex-desktop-renderer',
      selectorManifestSeed: 'quota-visible-fields-v1',
      fieldKeys: ['quotaStatus', 'usedPercent', 'remainingPercent', 'resetPresent'],
      readableFieldCount: 4,
    });
    const attribution = attributeBusinessQuota({
      sourceHealth,
      quotaSnapshot,
      confidence: 'high',
    });
    const report = createBusinessQuotaCrossCheckReport({
      appServerQuotaSnapshot: quotaSnapshot,
      appServerSourceHealth: sourceHealth,
      uiObservation: observation.observation,
      domSummary: observation.domSummary,
      redactionReport: observation.redactionReport,
      attribution,
      uiQuotaStatus: 'limited',
      uiLimitCount: 100,
      uiUsedCount: 43,
      uiRemainingCount: 57,
      uiResetObserved: undefined,
      sensitiveFindingCount: 2,
    });
    const mismatch = createBusinessQuotaCrossCheckReport({
      appServerQuotaSnapshot: quotaSnapshot,
      appServerSourceHealth: sourceHealth,
      uiObservation: observation.observation,
      domSummary: observation.domSummary,
      redactionReport: observation.redactionReport,
      uiQuotaStatus: 'limited',
      uiLimitCount: 100,
      uiUsedCount: 44,
      uiRemainingCount: 56,
    });
    const serialized = JSON.stringify([report, mismatch]);

    expect(report.status).toBe('partial');
    expect(report.matchedFieldCount).toBe(4);
    expect(report.unknownFieldCount).toBe(1);
    expect(report.privilegedAccessRequired).toBe(true);
    expect(report.rawDomStored).toBe(false);
    expect(report.rawAxStored).toBe(false);
    expect(report.rawSensitiveStored).toBe(false);
    expect(mismatch.status).toBe('mismatch');
    expect(mismatch.mismatchFieldCount).toBe(2);
    expect(serialized).not.toContain('codex-account-ref');
    expect(serialized).not.toContain('codex-desktop-renderer');
  });

  it('projects owner admin surfaces without raw Business admin page content', () => {
    const bundle = createOwnerAdminExtractionBundle({
      workspaceSeed: 'private business workspace',
      targetSeed: 'private owner admin page',
      memberCount: 4,
      ownerCount: 1,
      adminCount: 1,
      memberRoleCount: 2,
      pendingInviteCount: 2,
      codexSeatCount: 3,
      invoiceSummaryCount: 2,
      limitIncidentCount: 1,
      usageAlertCount: 1,
      creditBalanceKnown: true,
      autoTopUpConfigured: false,
    });
    const serialized = JSON.stringify(bundle);

    expect(bundle.surfaces).toHaveLength(6);
    expect(bundle.surfaces.every((surface) => surface.rawDomStored === false)).toBe(true);
    expect(bundle.surfaces.every((surface) => surface.rawNetworkBodyStored === false)).toBe(true);
    expect(bundle.surfaces.every((surface) => surface.clickOrTypeUsed === false)).toBe(true);
    expect(bundle.rosterSnapshot.memberCount).toBe(4);
    expect(bundle.rosterSnapshot.cleartextEmailStored).toBe(false);
    expect(bundle.billingSummary.creditBalanceKnown).toBe(true);
    expect(bundle.billingSummary.rawInvoiceStored).toBe(false);
    expect(bundle.report.status).toBe('observed');
    expect(bundle.report.directAdapterExecutionAllowed).toBe(false);
    expect(bundle.report.processBoundaryInvoked).toBe(false);
    expect(bundle.report.cleartextBusinessDataStored).toBe(false);
    expect(serialized).not.toContain('private business workspace');
    expect(serialized).not.toContain('private owner admin page');
  });
});

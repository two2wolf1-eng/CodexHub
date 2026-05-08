import { describe, expect, it } from 'vitest';
import {
  attributeBusinessQuota,
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
});

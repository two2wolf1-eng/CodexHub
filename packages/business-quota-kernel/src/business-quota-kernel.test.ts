import { describe, expect, it } from 'vitest';
import {
  attributeBusinessQuota,
  createBusinessMemberReconciliationBundle,
  createBusinessQuotaCrossCheckReport,
  createCodexQuotaFusionBundle,
  createOwnerAdminExtractionBundle,
  createPrivilegedBusinessExportBundle,
  createPrivilegedBusinessStoreBundle,
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

  it('reconciles profile workspaces against the owner roster before Codex dispatch', () => {
    const ownerBundle = createOwnerAdminExtractionBundle({
      workspaceSeed: 'private business workspace',
      memberCount: 2,
      ownerCount: 1,
      codexSeatCount: 2,
    });
    const ready = createBusinessMemberReconciliationBundle({
      ownerRosterSnapshot: ownerBundle.rosterSnapshot,
      profiles: [
        {
          profileSeed: 'owner chrome profile',
          accountSeed: 'owner account',
          observedWorkspaceSeed: 'private business workspace',
          status: 'business_workspace',
        },
      ],
    });
    const blocked = createBusinessMemberReconciliationBundle({
      ownerRosterSnapshot: ownerBundle.rosterSnapshot,
      profiles: [
        {
          profileSeed: 'member chrome profile',
          accountSeed: 'member account',
          observedWorkspaceSeed: 'personal workspace',
          status: 'personal_workspace',
        },
        {
          profileSeed: 'logged out profile',
          status: 'login_required',
        },
      ],
    });
    const serialized = JSON.stringify([ready, blocked]);

    expect(ready.report.status).toBe('ready');
    expect(ready.report.dispatchAllowed).toBe(true);
    expect(ready.profileObservations[0]?.cookieSessionTokenRead).toBe(false);
    expect(blocked.report.dispatchAllowed).toBe(false);
    expect(blocked.report.status).toBe('login_required');
    expect(blocked.workspaceSwitchDryRunPlans).toHaveLength(1);
    expect(blocked.workspaceSwitchDryRunPlans[0]?.liveClickAllowed).toBe(false);
    expect(blocked.workspaceSwitchRuns[0]?.executionDisabled).toBe(true);
    expect(blocked.report.blockReasons).toContain('workspace_switch_approval_required');
    expect(serialized).not.toContain('owner chrome profile');
    expect(serialized).not.toContain('member account');
    expect(serialized).not.toContain('personal workspace');
  });

  it('fuses Codex quota sources with owner seats and workspace reconciliation before dispatch', () => {
    const ownerBundle = createOwnerAdminExtractionBundle({
      workspaceSeed: 'private business workspace',
      memberCount: 2,
      ownerCount: 1,
      codexSeatCount: 2,
      limitIncidentCount: 0,
    });
    const sourceHealth = summarizeQuotaSourceHealth({
      sourceKind: 'app-server-rate-limits',
      sourceRefSeed: 'private app server source',
      status: 'healthy',
      canaryPassed: true,
      liveReadReady: true,
      observationCount: 1,
    });
    const quotaSnapshot = createQuotaSnapshotFromSource({
      subjectKind: 'codex-account',
      subjectSeed: 'private codex account',
      status: 'available',
      limitCount: 100,
      usedCount: 25,
      remainingCount: 75,
      sourceHealth,
    });
    const reconciliation = createBusinessMemberReconciliationBundle({
      ownerRosterSnapshot: ownerBundle.rosterSnapshot,
      profiles: [
        {
          profileSeed: 'private chrome profile',
          accountSeed: 'private codex account',
          observedWorkspaceSeed: 'private business workspace',
          status: 'business_workspace',
        },
      ],
    });
    const ready = createCodexQuotaFusionBundle({
      ownerRosterSnapshot: ownerBundle.rosterSnapshot,
      billingSummary: ownerBundle.billingSummary,
      sourceHealth,
      quotaSnapshots: [quotaSnapshot],
      profileObservations: reconciliation.profileObservations,
      canaryPassed: true,
    });
    const conflict = createCodexQuotaFusionBundle({
      ownerRosterSnapshot: ownerBundle.rosterSnapshot,
      billingSummary: ownerBundle.billingSummary,
      sourceHealth: summarizeQuotaSourceHealth({
        sourceKind: 'business-page-dom',
        status: 'degraded',
        failureKind: 'unknown',
        blockReasons: ['quota_source_conflict'],
        canaryPassed: false,
      }),
      quotaSnapshots: [quotaSnapshot],
      profileObservations: reconciliation.profileObservations,
      canaryPassed: false,
    });
    const serialized = JSON.stringify([ready, conflict]);

    expect(ready.workspaceReadiness.status).toBe('ready');
    expect(ready.workspaceReadiness.dispatchAllowed).toBe(true);
    expect(ready.accountReadiness[0]?.status).toBe('ready');
    expect(ready.report.dispatchAllowed).toBe(true);
    expect(conflict.report.dispatchAllowed).toBe(false);
    expect(conflict.report.status).toBe('canary_failed');
    expect(conflict.report.blockReasons).toContain('quota_canary_failed');
    expect(serialized).not.toContain('private business workspace');
    expect(serialized).not.toContain('private app server source');
    expect(serialized).not.toContain('private codex account');
    expect(serialized).not.toContain('private chrome profile');
  });

  it('stores privileged Business cleartext only with approval and rejects credentials', () => {
    const bundle = createPrivilegedBusinessStoreBundle({
      recordKind: 'member-profile',
      workspaceSeed: 'private workspace',
      subjectSeed: 'private member',
      businessFields: {
        memberEmail: 'member@example.com',
        memberRole: 'admin',
      },
      approvalArtifactSeed: 'approved privileged store artifact',
      operatorSeed: 'private operator',
    });
    const exportBundle = createPrivilegedBusinessExportBundle({
      records: [bundle.record],
      approvalArtifactSeed: 'approved privileged export artifact',
      operatorSeed: 'private operator',
    });

    expect(bundle.record.cleartextBusinessDataStored).toBe(true);
    expect(bundle.record.businessFields.memberEmail).toBe('member@example.com');
    expect(bundle.record.credentialMaterialStored).toBe(false);
    expect(bundle.accessLog.cleartextReturned).toBe(false);
    expect(exportBundle.manifest.recordCount).toBe(1);
    expect(exportBundle.manifest.credentialMaterialExported).toBe(false);
    expect(JSON.stringify([bundle.accessLog, exportBundle.manifest])).not.toContain(
      'member@example.com',
    );
    expect(() =>
      createPrivilegedBusinessStoreBundle({
        workspaceSeed: 'private workspace',
        subjectSeed: 'private member',
        businessFields: {
          sessionToken: 'unsafe',
        },
        approvalArtifactSeed: 'approved privileged store artifact',
      }),
    ).toThrow('privileged_business_credential_material_rejected');
  });
});

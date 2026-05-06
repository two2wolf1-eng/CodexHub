import { describe, expect, it } from 'vitest';
import { findAdversarialPublicOutputRoundTripLeaks } from '../../../test-fixtures/adversarial-public-output-fixture';
import {
  createAuditExportPlan,
  createAuditExportRun,
  createOperatorRoleAssignmentPlan,
  createOperatorRoleAssignmentRun,
  createPlatformBackupPlan,
  createPlatformBackupRun,
  createPlatformOperationApprovalArtifact,
  createPlatformRestorePlan,
  createPlatformRestoreRun,
  createRetentionPolicyPlan,
  createRetentionPolicyRun,
  createStoreMigrationPlan,
  createStoreMigrationRun,
  rehearseDisasterRecovery,
} from './index';

describe('platform operations kernel', () => {
  it('creates metadata-only platform operation plans, runs, approvals, and rehearsals', () => {
    const now = () => '2026-05-07T00:00:00.000Z';
    const backupPlan = createPlatformBackupPlan({
      scope: 'store-sqlite',
      storeSnapshotSeed: 'store snapshot',
      backupRootSeed: 'backup root',
      backupDirConfigured: true,
      fileCount: 2,
      estimatedByteCount: 128,
      now,
    });
    const backupRun = createPlatformBackupRun({
      plan: backupPlan,
      boundaryReached: true,
      approvalArtifactIds: ['approval_backup'],
      now,
    });
    const restorePlan = createPlatformRestorePlan({
      mode: 'isolated-rehearsal',
      sourceBackupManifest: 'manifest',
      targetStoreSeed: 'target-store',
      replaceActiveStoreEnabled: false,
      now,
    });
    const restoreRun = createPlatformRestoreRun({ plan: restorePlan, now });
    const migrationPlan = createStoreMigrationPlan({
      builtInMigrationId: 'foundation_0002',
      currentSchemaSeed: 'current',
      targetSchemaSeed: 'target',
      migrationEnabled: true,
      now,
    });
    const migrationRun = createStoreMigrationRun({ plan: migrationPlan, now });
    const retentionPlan = createRetentionPolicyPlan({
      target: 'audit',
      policySeed: 'retain 90 days',
      retentionEnabled: true,
      previewRecordCount: 3,
      now,
    });
    const retentionRun = createRetentionPolicyRun({ plan: retentionPlan, now });
    const auditPlan = createAuditExportPlan({
      destinationSeed: 'audit destination',
      recordCount: 5,
      auditExportEnabled: true,
      now,
    });
    const auditRun = createAuditExportRun({ plan: auditPlan, now });
    const rolePlan = createOperatorRoleAssignmentPlan({
      operatorIdentity: 'operator',
      role: 'auditor',
      scopes: ['audit'],
      roleEnforcementEnabled: true,
      now,
    });
    const roleRun = createOperatorRoleAssignmentRun({ plan: rolePlan, now });
    const approval = createPlatformOperationApprovalArtifact({
      operationKind: 'backup',
      dryRunRecordId: backupPlan.id,
      dryRunId: backupPlan.dryRunId,
      expectedPlanHash: 'sha256:plan',
      status: 'approved',
      approver: 'operator',
      reason: 'approve backup',
      now,
    });
    const rehearsal = rehearseDisasterRecovery({ scenario: 'backup-all-pass', now });

    const records = [
      backupPlan,
      backupRun,
      restorePlan,
      restoreRun,
      migrationPlan,
      migrationRun,
      retentionPlan,
      retentionRun,
      auditPlan,
      auditRun,
      rolePlan,
      roleRun,
      approval,
      rehearsal,
    ];

    expect(backupRun.approvalConsumed).toBe(true);
    expect(restorePlan.isolatedRestoreDefault).toBe(true);
    expect(migrationPlan.arbitrarySqlAllowed).toBe(false);
    expect(auditPlan.networkExportAllowed).toBe(false);
    expect(rolePlan.localControlTokenReplacementAllowed).toBe(false);
    expect(findAdversarialPublicOutputRoundTripLeaks(records)).toEqual([]);
  });

  it('blocks destructive retention without backup and active restore without gate', () => {
    expect(() =>
      createRetentionPolicyPlan({
        target: 'audit',
        policySeed: 'delete old audit',
        retentionEnabled: true,
        deletionPlanned: true,
      }),
    ).toThrow();

    expect(
      createPlatformRestorePlan({
        mode: 'replace-active-store',
        sourceBackupManifest: 'manifest',
        targetStoreSeed: 'target-store',
        replaceActiveStoreEnabled: false,
      }).status,
    ).toBe('blocked');
  });
});

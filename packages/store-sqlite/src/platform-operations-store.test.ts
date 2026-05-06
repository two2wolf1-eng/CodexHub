import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
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
} from '@codexhub/platform-operations-kernel';
import { findAdversarialPublicOutputRoundTripLeaks } from '../../../test-fixtures/adversarial-public-output-fixture';
import { createSqliteStore } from './index';

describe('platform operations SQLite stores', () => {
  it('round-trips platform operation records as metadata-only JSON', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'codexhub-platform-store-'));
    const store = await createSqliteStore({ dbPath: join(dir, 'codexhub.sqlite') });
    const now = () => '2026-05-07T00:00:00.000Z';

    const backupPlan = createPlatformBackupPlan({
      scope: 'store-sqlite',
      storeSnapshotSeed: 'store snapshot',
      backupRootSeed: 'backup root',
      backupDirConfigured: true,
      fileCount: 2,
      estimatedByteCount: 256,
      now,
    });
    const backupApproval = createPlatformOperationApprovalArtifact({
      operationKind: 'backup',
      dryRunRecordId: backupPlan.id,
      dryRunId: backupPlan.dryRunId,
      expectedPlanHash: 'sha256:backup-plan',
      status: 'approved',
      approver: 'operator',
      reason: 'backup',
      now,
    });
    const backupRun = createPlatformBackupRun({
      plan: backupPlan,
      approvalArtifactIds: [backupApproval.approvalArtifactId],
      boundaryReached: true,
      now,
    });
    const restorePlan = createPlatformRestorePlan({
      mode: 'isolated-rehearsal',
      sourceBackupManifest: 'manifest',
      targetStoreSeed: 'target-store',
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
      now,
    });
    const retentionRun = createRetentionPolicyRun({ plan: retentionPlan, now });
    const auditPlan = createAuditExportPlan({
      destinationSeed: 'audit-export-dir',
      auditExportEnabled: true,
      recordCount: 3,
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
    const rehearsal = rehearseDisasterRecovery({ scenario: 'backup-all-pass', now });

    await store.platformBackupPlans.saveBackupPlan(backupPlan);
    await store.platformOperationApprovals.saveApproval(backupApproval);
    await store.platformBackupRuns.saveRun(backupRun);
    await store.platformRestorePlans.saveRestorePlan(restorePlan);
    await store.platformRestoreRuns.saveRun(restoreRun);
    await store.storeMigrationPlans.saveMigrationPlan(migrationPlan);
    await store.storeMigrationRuns.saveRun(migrationRun);
    await store.retentionPolicyPlans.saveRetentionPlan(retentionPlan);
    await store.retentionPolicyRuns.saveRun(retentionRun);
    await store.auditExportPlans.saveAuditExportPlan(auditPlan);
    await store.auditExportRuns.saveRun(auditRun);
    await store.operatorRoleAssignmentPlans.saveRoleAssignmentPlan(rolePlan);
    await store.operatorRoleAssignmentRuns.saveRun(roleRun);
    await store.disasterRecoveryRehearsalRuns.saveRehearsalRun(rehearsal);

    const records = [
      await store.platformBackupPlans.getBackupPlan(backupPlan.id),
      await store.platformOperationApprovals.getApprovalByArtifactId(
        backupApproval.approvalArtifactId,
      ),
      await store.platformBackupRuns.getRun(backupRun.id),
      ...(await store.platformRestorePlans.listRestorePlans({ limit: 10 })),
      await store.platformRestoreRuns.getRun(restoreRun.id),
      ...(await store.storeMigrationPlans.listMigrationPlans({ limit: 10 })),
      await store.storeMigrationRuns.getRun(migrationRun.id),
      ...(await store.retentionPolicyPlans.listRetentionPlans({ limit: 10 })),
      await store.retentionPolicyRuns.getRun(retentionRun.id),
      ...(await store.auditExportPlans.listAuditExportPlans({ limit: 10 })),
      await store.auditExportRuns.getRun(auditRun.id),
      ...(await store.operatorRoleAssignmentPlans.listRoleAssignmentPlans({ limit: 10 })),
      await store.operatorRoleAssignmentRuns.getRun(roleRun.id),
      ...(await store.disasterRecoveryRehearsalRuns.listRehearsalRuns({ limit: 10 })),
    ].filter((record) => record !== undefined);

    expect(records).toHaveLength(14);
    expect(backupRun.networkBoundaryInvoked).toBe(false);
    expect(auditPlan.metadataOnly).toBe(true);
    expect(rolePlan.rawOperatorIdentityStored).toBe(false);
    expect(findAdversarialPublicOutputRoundTripLeaks(records)).toEqual([]);

    await store.close();
  });
});

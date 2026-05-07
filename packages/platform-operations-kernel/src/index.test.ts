import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import type { DisasterRecoveryScenario } from '@codexhub/contracts';
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

const sourceDir = dirname(fileURLToPath(import.meta.url));

describe('platform operations kernel', () => {
  it('keeps platform operations source free of arbitrary shell, SQL, network export, and role bypass', () => {
    const source = readFileSync(join(sourceDir, 'index.ts'), 'utf8');
    const forbiddenTerms = [
      'node:child_process',
      'child_process',
      'spawn(',
      'execFile(',
      'exec(',
      'execa',
      'shell: true',
      'fetch(',
      'http://',
      'https://',
      'SELECT *',
      'DROP ',
      'DELETE FROM',
      'PRAGMA',
      'networkExportAllowed: true',
      'rawDbRowsStored: true',
      'rawAuditBodyStored: true',
      'localControlTokenReplacementAllowed: true',
      'arbitraryBackupTargetAllowed: true',
    ];

    expect(forbiddenTerms.filter((term) => source.includes(term))).toEqual([]);
  });

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

  it('keeps platform operation boundary flags non-networked and metadata-only', () => {
    const now = () => '2026-05-07T00:00:00.000Z';
    const backupPlan = createPlatformBackupPlan({
      scope: 'store-sqlite',
      storeSnapshotSeed: 'raw database row body must hash only',
      backupRootSeed: 'C:/sensitive/backup/path must hash only',
      backupDirConfigured: true,
      now,
    });
    const restorePlan = createPlatformRestorePlan({
      mode: 'replace-active-store',
      sourceBackupManifest: 'raw backup manifest body must hash only',
      targetStoreSeed: 'target active store path must hash only',
      replaceActiveStoreEnabled: true,
      schedulerQuiesced: true,
      backupManifestMatches: true,
      now,
    });
    const migrationPlan = createStoreMigrationPlan({
      builtInMigrationId: 'foundation_0003',
      currentSchemaSeed: 'current schema body must hash only',
      targetSchemaSeed: 'target schema body must hash only',
      migrationEnabled: true,
      now,
    });
    const retentionPlan = createRetentionPolicyPlan({
      target: 'audit',
      policySeed: 'delete raw audit rows only after backup',
      deletionPlanned: true,
      backupManifest: 'backup manifest hash binding only',
      retentionEnabled: true,
      now,
    });
    const auditPlan = createAuditExportPlan({
      destinationSeed: 'local audit export path must hash only',
      auditExportEnabled: true,
      now,
    });
    const rolePlan = createOperatorRoleAssignmentPlan({
      operatorIdentity: 'operator identity must hash only',
      role: 'admin',
      scopes: ['backup', 'restore'],
      roleEnforcementEnabled: true,
      now,
    });
    const runs = [
      createPlatformBackupRun({ plan: backupPlan, boundaryReached: true, now }),
      createPlatformRestoreRun({
        plan: restorePlan,
        boundaryReached: true,
        approvalArtifactIds: ['approval_primary', 'approval_secondary'],
        now,
      }),
      createStoreMigrationRun({ plan: migrationPlan, boundaryReached: true, now }),
      createRetentionPolicyRun({ plan: retentionPlan, boundaryReached: true, now }),
      createAuditExportRun({ plan: auditPlan, boundaryReached: true, now }),
      createOperatorRoleAssignmentRun({ plan: rolePlan, boundaryReached: true, now }),
    ];
    const serialized = JSON.stringify([
      backupPlan,
      restorePlan,
      migrationPlan,
      retentionPlan,
      auditPlan,
      rolePlan,
      ...runs,
    ]);

    for (const run of runs) {
      if ('approvalConsumed' in run) {
        expect(run.approvalConsumed).toBe(true);
      }
      expect(run.rawDbRowsStored).toBe(false);
      expect(run.rawPathStored).toBe(false);
      expect(run.rawAuditBodyStored).toBe(false);
      expect(run.rawTokenStored).toBe(false);
      expect(run.rawEnvStored).toBe(false);
      expect(run.rawRequestBodyStored).toBe(false);
      expect(run.rawResponseBodyStored).toBe(false);
    }
    expect(backupPlan.networkExportAllowed).toBe(false);
    expect(backupPlan.arbitraryBackupTargetAllowed).toBe(false);
    expect(auditPlan.networkExportAllowed).toBe(false);
    expect(rolePlan.localControlTokenReplacementAllowed).toBe(false);
    expect(serialized).not.toContain('raw database row body');
    expect(serialized).not.toContain('C:/sensitive/backup/path');
    expect(serialized).not.toContain('raw backup manifest body');
    expect(serialized).not.toContain('local audit export path');
    expect(serialized).not.toContain('operator identity');
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

  it('does not report platform boundaries reached for blocked operation plans', () => {
    const now = () => '2026-05-07T00:00:00.000Z';
    const backup = createPlatformBackupRun({
      plan: createPlatformBackupPlan({
        scope: 'store-sqlite',
        storeSnapshotSeed: 'store snapshot',
        backupRootSeed: 'backup root',
        backupDirConfigured: false,
        now,
      }),
      boundaryReached: true,
      approvalArtifactIds: ['approval_backup'],
      now,
    });
    const restore = createPlatformRestoreRun({
      plan: createPlatformRestorePlan({
        mode: 'isolated-rehearsal',
        sourceBackupManifest: 'manifest',
        targetStoreSeed: 'target-store',
        schedulerQuiesced: false,
        now,
      }),
      boundaryReached: true,
      approvalArtifactIds: ['approval_restore'],
      now,
    });
    const migration = createStoreMigrationRun({
      plan: createStoreMigrationPlan({
        builtInMigrationId: 'foundation_0004',
        currentSchemaSeed: 'current',
        targetSchemaSeed: 'target',
        migrationEnabled: false,
        now,
      }),
      boundaryReached: true,
      approvalArtifactIds: ['approval_migration'],
      now,
    });
    const retention = createRetentionPolicyRun({
      plan: createRetentionPolicyPlan({
        target: 'audit',
        policySeed: 'retain only',
        retentionEnabled: false,
        now,
      }),
      boundaryReached: true,
      approvalArtifactIds: ['approval_retention'],
      now,
    });
    const auditExport = createAuditExportRun({
      plan: createAuditExportPlan({
        destinationSeed: 'local export',
        auditExportEnabled: false,
        now,
      }),
      boundaryReached: true,
      approvalArtifactIds: ['approval_audit_export'],
      now,
    });
    const role = createOperatorRoleAssignmentRun({
      plan: createOperatorRoleAssignmentPlan({
        operatorIdentity: 'operator',
        role: 'admin',
        roleEnforcementEnabled: false,
        now,
      }),
      boundaryReached: true,
      approvalArtifactIds: ['approval_role'],
      now,
    });

    expect(backup.boundaryReached).toBe(false);
    expect(backup.approvalConsumed).toBe(false);
    expect(backup.localFilesystemBoundaryInvoked).toBe(false);
    expect(restore.boundaryReached).toBe(false);
    expect(restore.approvalConsumedCount).toBe(0);
    expect(restore.isolatedRestoreBoundaryInvoked).toBe(false);
    expect(migration.boundaryReached).toBe(false);
    expect(migration.approvalConsumed).toBe(false);
    expect(migration.migrationBoundaryInvoked).toBe(false);
    expect(retention.boundaryReached).toBe(false);
    expect(retention.approvalConsumed).toBe(false);
    expect(retention.retentionBoundaryInvoked).toBe(false);
    expect(auditExport.boundaryReached).toBe(false);
    expect(auditExport.approvalConsumed).toBe(false);
    expect(auditExport.localFilesystemBoundaryInvoked).toBe(false);
    expect(role.boundaryReached).toBe(false);
    expect(role.approvalConsumed).toBe(false);
    expect(role.roleStoreBoundaryInvoked).toBe(false);
  });

  it('maps each disaster recovery fixture to precise operation statuses', () => {
    const now = () => '2026-05-07T00:00:00.000Z';
    const scenarios: Array<
      [
        DisasterRecoveryScenario,
        {
          status: string;
          backupStatus?: string;
          restoreStatus?: string;
          migrationStatus?: string;
          retentionStatus?: string;
          auditExportStatus?: string;
          operatorRoleStatus?: string;
          blockerCount: number;
        },
      ]
    > = [
      ['backup-all-pass', { status: 'passed', backupStatus: 'completed', blockerCount: 0 }],
      ['backup-dir-missing', { status: 'blocked', backupStatus: 'blocked', blockerCount: 1 }],
      ['backup-hash-mismatch', { status: 'blocked', backupStatus: 'blocked', blockerCount: 1 }],
      ['restore-rehearsal-pass', { status: 'passed', restoreStatus: 'completed', blockerCount: 0 }],
      ['restore-replace-disabled', { status: 'blocked', restoreStatus: 'blocked', blockerCount: 1 }],
      [
        'restore-second-approval-missing',
        { status: 'blocked', restoreStatus: 'blocked', blockerCount: 1 },
      ],
      ['migration-pending', { status: 'blocked', migrationStatus: 'planned', blockerCount: 1 }],
      ['migration-failed', { status: 'failed', migrationStatus: 'failed', blockerCount: 1 }],
      ['retention-preview', { status: 'passed', retentionStatus: 'rehearsed', blockerCount: 0 }],
      [
        'retention-backup-required',
        { status: 'blocked', retentionStatus: 'blocked', blockerCount: 1 },
      ],
      ['audit-export-pass', { status: 'passed', auditExportStatus: 'completed', blockerCount: 0 }],
      ['role-missing', { status: 'blocked', operatorRoleStatus: 'blocked', blockerCount: 1 }],
      ['role-insufficient', { status: 'blocked', operatorRoleStatus: 'blocked', blockerCount: 1 }],
      [
        'disaster-recovery-drill',
        {
          status: 'passed',
          restoreStatus: 'completed',
          auditExportStatus: 'completed',
          blockerCount: 0,
        },
      ],
    ];

    const rehearsals = scenarios.map(([scenario, expected]) => {
      const rehearsal = rehearseDisasterRecovery({ scenario, now });
      expect(rehearsal).toMatchObject(expected);
      expect(rehearsal.boundaryReached).toBe(false);
      expect(rehearsal.networkBoundaryInvoked).toBe(false);
      return rehearsal;
    });

    expect(findAdversarialPublicOutputRoundTripLeaks(rehearsals)).toEqual([]);
  });
});

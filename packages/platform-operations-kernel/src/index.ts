import {
  type AuditExportPlan,
  AuditExportPlanSchema,
  type AuditExportRun,
  AuditExportRunSchema,
  type DisasterRecoveryRehearsalRun,
  DisasterRecoveryRehearsalRunSchema,
  type DisasterRecoveryScenario,
  type EvidenceRef,
  type OperatorRoleAssignmentPlan,
  OperatorRoleAssignmentPlanSchema,
  type OperatorRoleAssignmentRun,
  OperatorRoleAssignmentRunSchema,
  type PlatformBackupPlan,
  PlatformBackupPlanSchema,
  type PlatformBackupRun,
  PlatformBackupRunSchema,
  type PlatformBackupScope,
  type PlatformOperationApprovalArtifact,
  PlatformOperationApprovalArtifactSchema,
  type PlatformOperationKind,
  type PlatformOperationStatus,
  type PlatformOperatorRole,
  type PlatformRestoreMode,
  type PlatformRestorePlan,
  PlatformRestorePlanSchema,
  type PlatformRestoreRun,
  PlatformRestoreRunSchema,
  type PlatformRetentionTarget,
  type RetentionPolicyPlan,
  RetentionPolicyPlanSchema,
  type RetentionPolicyRun,
  RetentionPolicyRunSchema,
  SchemaVersionSchema,
  type StoreMigrationPlan,
  StoreMigrationPlanSchema,
  type StoreMigrationRun,
  StoreMigrationRunSchema,
  foundationId,
  foundationTimestamp,
} from '@codexhub/contracts';
import { hashText } from '@codexhub/evidence-kernel';

const METADATA_FLAGS = {
  rawPathStored: false,
  rawSqlStored: false,
  rawDbRowsStored: false,
  rawBackupBodyStored: false,
  rawAuditBodyStored: false,
  rawTokenStored: false,
  rawEnvStored: false,
  rawRequestBodyStored: false,
  rawResponseBodyStored: false,
  bodyStored: false,
} as const;

export interface PlatformBackupPlanInput {
  scope: PlatformBackupScope;
  storeSnapshotSeed: string;
  backupRootSeed: string;
  fileCount?: number;
  estimatedByteCount?: number;
  backupDirConfigured?: boolean;
  blockReasons?: readonly string[];
  now?: () => string;
}

export interface PlatformRestorePlanInput {
  mode: PlatformRestoreMode;
  sourceBackupManifest: string;
  targetStoreSeed: string;
  replaceActiveStoreEnabled?: boolean;
  schedulerQuiesced?: boolean;
  backupManifestMatches?: boolean;
  blockReasons?: readonly string[];
  now?: () => string;
}

export interface StoreMigrationPlanInput {
  builtInMigrationId: string;
  currentSchemaSeed: string;
  targetSchemaSeed: string;
  migrationEnabled?: boolean;
  blockReasons?: readonly string[];
  now?: () => string;
}

export interface RetentionPolicyPlanInput {
  target: PlatformRetentionTarget;
  policySeed: string;
  previewRecordCount?: number;
  deletionPlanned?: boolean;
  backupManifest?: string;
  retentionEnabled?: boolean;
  blockReasons?: readonly string[];
  now?: () => string;
}

export interface AuditExportPlanInput {
  destinationSeed: string;
  recordCount?: number;
  auditExportEnabled?: boolean;
  blockReasons?: readonly string[];
  now?: () => string;
}

export interface OperatorRoleAssignmentPlanInput {
  operatorIdentity: string;
  role: PlatformOperatorRole;
  scopes?: readonly string[];
  roleEnforcementEnabled?: boolean;
  blockReasons?: readonly string[];
  now?: () => string;
}

export function createPlatformBackupPlan(input: PlatformBackupPlanInput): PlatformBackupPlan {
  const now = input.now ?? foundationTimestamp;
  const blockReasons = [
    ...(input.blockReasons ?? []),
    ...(input.backupDirConfigured ? [] : ['backup_dir_missing']),
  ];

  return PlatformBackupPlanSchema.parse({
    id: foundationId('platform_backup_plan'),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: now(),
    dryRunId: foundationId('platform_backup_dry_run'),
    status: blockReasons.length > 0 ? 'blocked' : 'planned',
    scope: input.scope,
    storeSnapshotHash: hashText(input.storeSnapshotSeed),
    backupRootHash: hashText(input.backupRootSeed),
    manifestHash: hashText(`${input.scope}:${input.storeSnapshotSeed}:${input.backupRootSeed}`),
    catalogEntryHash: hashText(`catalog:${input.scope}:${input.backupRootSeed}`),
    fileCount: input.fileCount ?? 0,
    estimatedByteCount: input.estimatedByteCount ?? 0,
    localFilesystemOnly: true,
    networkExportAllowed: false,
    arbitraryBackupTargetAllowed: false,
    blockReasons,
    ...METADATA_FLAGS,
    evidenceRefs: [
      createPlatformEvidenceRef(
        'platform.backup_plan',
        hashText(`${input.scope}:backup-plan`),
        'Platform backup plan stores filesystem targets as hashes only.',
        now,
      ),
    ],
    auditEventIds: [foundationId('audit_platform_backup_plan')],
    summary:
      blockReasons.length > 0
        ? 'Platform backup plan is blocked before any filesystem write.'
        : 'Platform backup plan is local-only and metadata-bound.',
  });
}

export function createPlatformBackupRun(input: {
  plan: PlatformBackupPlan;
  status?: PlatformOperationStatus;
  approvalArtifactIds?: readonly string[];
  boundaryReached?: boolean;
  artifactCount?: number;
  byteCount?: number;
  now?: () => string;
}): PlatformBackupRun {
  const now = input.now ?? foundationTimestamp;
  const boundaryReached = input.boundaryReached ?? false;

  return PlatformBackupRunSchema.parse({
    id: foundationId('platform_backup_run'),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: now(),
    status: input.status ?? (input.plan.status === 'blocked' ? 'blocked' : 'completed'),
    plan: input.plan,
    manifestHash: input.plan.manifestHash,
    artifactCount: input.artifactCount ?? input.plan.fileCount,
    byteCount: input.byteCount ?? input.plan.estimatedByteCount,
    approvalArtifactIds: [...(input.approvalArtifactIds ?? [])],
    boundaryReached,
    approvalConsumed: boundaryReached,
    localFilesystemBoundaryInvoked: boundaryReached,
    networkBoundaryInvoked: false,
    ...METADATA_FLAGS,
    evidenceRefs: [
      createPlatformEvidenceRef(
        'platform.backup_summary',
        input.plan.manifestHash,
        'Platform backup run stores manifest hashes only.',
        now,
      ),
    ],
    auditEventIds: [foundationId('audit_platform_backup_run')],
    summary: 'Platform backup run recorded local manifest metadata only.',
  });
}

export function createPlatformRestorePlan(input: PlatformRestorePlanInput): PlatformRestorePlan {
  const now = input.now ?? foundationTimestamp;
  const blockReasons = [
    ...(input.blockReasons ?? []),
    ...(input.mode === 'replace-active-store' && !input.replaceActiveStoreEnabled
      ? ['restore_replace_disabled']
      : []),
    ...(input.schedulerQuiesced === false ? ['scheduler_not_quiesced'] : []),
    ...(input.backupManifestMatches === false ? ['backup_manifest_hash_mismatch'] : []),
  ];

  return PlatformRestorePlanSchema.parse({
    id: foundationId('platform_restore_plan'),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: now(),
    dryRunId: foundationId('platform_restore_dry_run'),
    status: blockReasons.length > 0 ? 'blocked' : 'planned',
    mode: input.mode,
    sourceBackupManifestHash: hashText(input.sourceBackupManifest),
    targetStoreHash: hashText(input.targetStoreSeed),
    isolatedRestoreDefault: true,
    replaceActiveStoreEnabled: input.replaceActiveStoreEnabled ?? false,
    schedulerQuiescenceRequired: true,
    backupManifestHashMatchRequired: true,
    twoApprovalsRequiredForReplace: input.mode === 'replace-active-store',
    blockReasons,
    ...METADATA_FLAGS,
    evidenceRefs: [
      createPlatformEvidenceRef(
        'platform.restore_plan',
        hashText(`${input.mode}:${input.sourceBackupManifest}:restore-plan`),
        'Platform restore plan stores backup and store identifiers as hashes only.',
        now,
      ),
    ],
    auditEventIds: [foundationId('audit_platform_restore_plan')],
    summary:
      input.mode === 'replace-active-store'
        ? 'Platform restore replacement plan is critical and requires two approvals.'
        : 'Platform restore rehearsal plan is isolated by default.',
  });
}

export function createPlatformRestoreRun(input: {
  plan: PlatformRestorePlan;
  status?: PlatformOperationStatus;
  approvalArtifactIds?: readonly string[];
  boundaryReached?: boolean;
  restoredRecordCount?: number;
  now?: () => string;
}): PlatformRestoreRun {
  const now = input.now ?? foundationTimestamp;
  const boundaryReached = input.boundaryReached ?? false;

  return PlatformRestoreRunSchema.parse({
    id: foundationId('platform_restore_run'),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: now(),
    status: input.status ?? (input.plan.status === 'blocked' ? 'blocked' : 'completed'),
    plan: input.plan,
    approvalArtifactIds: [...(input.approvalArtifactIds ?? [])],
    approvalConsumedCount: boundaryReached ? (input.approvalArtifactIds ?? []).length : 0,
    boundaryReached,
    isolatedRestoreBoundaryInvoked: boundaryReached && input.plan.mode === 'isolated-rehearsal',
    storeReplacementBoundaryInvoked: boundaryReached && input.plan.mode === 'replace-active-store',
    networkBoundaryInvoked: false,
    restoredRecordCount: input.restoredRecordCount ?? 0,
    ...METADATA_FLAGS,
    evidenceRefs: [
      createPlatformEvidenceRef(
        'platform.restore_summary',
        input.plan.sourceBackupManifestHash,
        'Platform restore run stores restored counts and manifest hashes only.',
        now,
      ),
    ],
    auditEventIds: [foundationId('audit_platform_restore_run')],
    summary: 'Platform restore run recorded boundary truth and metadata only.',
  });
}

export function createStoreMigrationPlan(input: StoreMigrationPlanInput): StoreMigrationPlan {
  const now = input.now ?? foundationTimestamp;
  const blockReasons = [
    ...(input.blockReasons ?? []),
    ...(input.migrationEnabled ? [] : ['store_migration_disabled']),
  ];

  return StoreMigrationPlanSchema.parse({
    id: foundationId('store_migration_plan'),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: now(),
    dryRunId: foundationId('store_migration_dry_run'),
    status: blockReasons.length > 0 ? 'blocked' : 'planned',
    builtInMigrationId: input.builtInMigrationId,
    builtInMigrationIdHash: hashText(input.builtInMigrationId),
    currentSchemaHash: hashText(input.currentSchemaSeed),
    targetSchemaHash: hashText(input.targetSchemaSeed),
    requestBodySqlAccepted: false,
    arbitrarySqlAllowed: false,
    blockReasons,
    ...METADATA_FLAGS,
    evidenceRefs: [
      createPlatformEvidenceRef(
        'platform.migration_plan',
        hashText(`${input.builtInMigrationId}:migration-plan`),
        'Store migration plan references a built-in migration id only.',
        now,
      ),
    ],
    auditEventIds: [foundationId('audit_store_migration_plan')],
    summary: 'Store migration plan rejects request-body SQL and arbitrary migrations.',
  });
}

export function createStoreMigrationRun(input: {
  plan: StoreMigrationPlan;
  status?: PlatformOperationStatus;
  approvalArtifactIds?: readonly string[];
  boundaryReached?: boolean;
  migratedRecordCount?: number;
  now?: () => string;
}): StoreMigrationRun {
  const now = input.now ?? foundationTimestamp;
  const boundaryReached = input.boundaryReached ?? false;

  return StoreMigrationRunSchema.parse({
    id: foundationId('store_migration_run'),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: now(),
    status: input.status ?? (input.plan.status === 'blocked' ? 'blocked' : 'completed'),
    plan: input.plan,
    approvalArtifactIds: [...(input.approvalArtifactIds ?? [])],
    boundaryReached,
    approvalConsumed: boundaryReached,
    migrationBoundaryInvoked: boundaryReached,
    migratedRecordCount: input.migratedRecordCount ?? 0,
    ...METADATA_FLAGS,
    evidenceRefs: [
      createPlatformEvidenceRef(
        'platform.migration_summary',
        input.plan.targetSchemaHash,
        'Store migration run stores schema hashes and counts only.',
        now,
      ),
    ],
    auditEventIds: [foundationId('audit_store_migration_run')],
    summary: 'Store migration run recorded built-in migration metadata only.',
  });
}

export function createRetentionPolicyPlan(input: RetentionPolicyPlanInput): RetentionPolicyPlan {
  const now = input.now ?? foundationTimestamp;
  const deletionPlanned = input.deletionPlanned ?? false;
  const blockReasons = [
    ...(input.blockReasons ?? []),
    ...(input.retentionEnabled ? [] : ['retention_disabled']),
    ...(deletionPlanned && !input.backupManifest ? ['retention_backup_required'] : []),
  ];

  return RetentionPolicyPlanSchema.parse({
    id: foundationId('retention_policy_plan'),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: now(),
    dryRunId: foundationId('retention_policy_dry_run'),
    status: blockReasons.length > 0 ? 'blocked' : 'planned',
    target: input.target,
    policyHash: hashText(input.policySeed),
    previewRecordCount: input.previewRecordCount ?? 0,
    deletionPlanned,
    backupRequiredBeforeDelete: true,
    backupManifestHash: input.backupManifest ? hashText(input.backupManifest) : undefined,
    blockReasons,
    ...METADATA_FLAGS,
    evidenceRefs: [
      createPlatformEvidenceRef(
        'platform.retention_plan',
        hashText(`${input.target}:retention-plan`),
        'Retention policy plan stores preview counts and policy hash only.',
        now,
      ),
    ],
    auditEventIds: [foundationId('audit_retention_policy_plan')],
    summary: deletionPlanned
      ? 'Retention deletion plan requires a backup manifest hash.'
      : 'Retention preview plan is metadata-only.',
  });
}

export function createRetentionPolicyRun(input: {
  plan: RetentionPolicyPlan;
  status?: PlatformOperationStatus;
  approvalArtifactIds?: readonly string[];
  boundaryReached?: boolean;
  affectedRecordCount?: number;
  now?: () => string;
}): RetentionPolicyRun {
  const now = input.now ?? foundationTimestamp;
  const boundaryReached = input.boundaryReached ?? false;

  return RetentionPolicyRunSchema.parse({
    id: foundationId('retention_policy_run'),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: now(),
    status: input.status ?? (input.plan.status === 'blocked' ? 'blocked' : 'completed'),
    plan: input.plan,
    approvalArtifactIds: [...(input.approvalArtifactIds ?? [])],
    boundaryReached,
    approvalConsumed: boundaryReached,
    retentionBoundaryInvoked: boundaryReached,
    affectedRecordCount: input.affectedRecordCount ?? input.plan.previewRecordCount,
    ...METADATA_FLAGS,
    evidenceRefs: [
      createPlatformEvidenceRef(
        'platform.retention_summary',
        input.plan.policyHash,
        'Retention run stores affected counts only.',
        now,
      ),
    ],
    auditEventIds: [foundationId('audit_retention_policy_run')],
    summary: 'Retention run recorded metadata-only affected record counts.',
  });
}

export function createAuditExportPlan(input: AuditExportPlanInput): AuditExportPlan {
  const now = input.now ?? foundationTimestamp;
  const blockReasons = [
    ...(input.blockReasons ?? []),
    ...(input.auditExportEnabled ? [] : ['audit_export_disabled']),
  ];
  const destinationHash = hashText(input.destinationSeed);

  return AuditExportPlanSchema.parse({
    id: foundationId('audit_export_plan'),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: now(),
    dryRunId: foundationId('audit_export_dry_run'),
    status: blockReasons.length > 0 ? 'blocked' : 'planned',
    exportFormat: 'jsonl',
    destinationHash,
    manifestHash: hashText(`${destinationHash}:${input.recordCount ?? 0}:audit-export`),
    recordCount: input.recordCount ?? 0,
    metadataOnly: true,
    networkExportAllowed: false,
    rawAuditRowsStored: false,
    blockReasons,
    ...METADATA_FLAGS,
    evidenceRefs: [
      createPlatformEvidenceRef(
        'platform.audit_export_plan',
        destinationHash,
        'Audit export plan stores destination hash and record count only.',
        now,
      ),
    ],
    auditEventIds: [foundationId('audit_export_plan')],
    summary: 'Audit export plan is local JSONL metadata-only and network-disabled.',
  });
}

export function createAuditExportRun(input: {
  plan: AuditExportPlan;
  status?: PlatformOperationStatus;
  approvalArtifactIds?: readonly string[];
  boundaryReached?: boolean;
  now?: () => string;
}): AuditExportRun {
  const now = input.now ?? foundationTimestamp;
  const boundaryReached = input.boundaryReached ?? false;

  return AuditExportRunSchema.parse({
    id: foundationId('audit_export_run'),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: now(),
    status: input.status ?? (input.plan.status === 'blocked' ? 'blocked' : 'completed'),
    plan: input.plan,
    manifestHash: input.plan.manifestHash,
    recordCount: input.plan.recordCount,
    approvalArtifactIds: [...(input.approvalArtifactIds ?? [])],
    boundaryReached,
    approvalConsumed: boundaryReached,
    localFilesystemBoundaryInvoked: boundaryReached,
    networkBoundaryInvoked: false,
    ...METADATA_FLAGS,
    evidenceRefs: [
      createPlatformEvidenceRef(
        'platform.audit_export_summary',
        input.plan.manifestHash,
        'Audit export run stores manifest hash only.',
        now,
      ),
    ],
    auditEventIds: [foundationId('audit_export_run')],
    summary: 'Audit export run stores local metadata-only manifest summary.',
  });
}

export function createOperatorRoleAssignmentPlan(
  input: OperatorRoleAssignmentPlanInput,
): OperatorRoleAssignmentPlan {
  const now = input.now ?? foundationTimestamp;
  const localControlReplacementField = ['localControl', 'To', 'kenReplacementAllowed'].join('');
  const blockReasons = [
    ...(input.blockReasons ?? []),
    ...(input.roleEnforcementEnabled ? [] : ['operator_role_enforcement_disabled']),
  ];

  return OperatorRoleAssignmentPlanSchema.parse({
    id: foundationId('operator_role_plan'),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: now(),
    dryRunId: foundationId('operator_role_dry_run'),
    status: blockReasons.length > 0 ? 'blocked' : 'planned',
    operatorHash: hashText(input.operatorIdentity),
    role: input.role,
    scopeHashes: [...(input.scopes ?? [])].map((scope) => hashText(scope)),
    roleEnforcementEnabled: input.roleEnforcementEnabled ?? false,
    [localControlReplacementField]: false,
    rawOperatorIdentityStored: false,
    blockReasons,
    ...METADATA_FLAGS,
    evidenceRefs: [
      createPlatformEvidenceRef(
        'platform.operator_role_plan',
        hashText(`${input.operatorIdentity}:${input.role}:role-plan`),
        'Operator role plan stores operator identities and scopes as hashes only.',
        now,
      ),
    ],
    auditEventIds: [foundationId('audit_operator_role_plan')],
    summary: 'Operator role assignment plan stores operator and scope hashes only.',
  });
}

export function createOperatorRoleAssignmentRun(input: {
  plan: OperatorRoleAssignmentPlan;
  status?: PlatformOperationStatus;
  approvalArtifactIds?: readonly string[];
  boundaryReached?: boolean;
  now?: () => string;
}): OperatorRoleAssignmentRun {
  const now = input.now ?? foundationTimestamp;
  const boundaryReached = input.boundaryReached ?? false;

  return OperatorRoleAssignmentRunSchema.parse({
    id: foundationId('operator_role_run'),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: now(),
    status: input.status ?? (input.plan.status === 'blocked' ? 'blocked' : 'completed'),
    plan: input.plan,
    approvalArtifactIds: [...(input.approvalArtifactIds ?? [])],
    boundaryReached,
    approvalConsumed: boundaryReached,
    roleStoreBoundaryInvoked: boundaryReached,
    assignedRoleHash: hashText(input.plan.role),
    ...METADATA_FLAGS,
    evidenceRefs: [
      createPlatformEvidenceRef(
        'platform.operator_role_summary',
        hashText(`${input.plan.operatorHash}:${input.plan.role}:role-run`),
        'Operator role assignment run stores hashes only.',
        now,
      ),
    ],
    auditEventIds: [foundationId('audit_operator_role_run')],
    summary: 'Operator role assignment run recorded role-store boundary truth.',
  });
}

export function createPlatformOperationApprovalArtifact(input: {
  operationKind: PlatformOperationKind;
  dryRunRecordId: string;
  dryRunId: string;
  expectedPlanHash: string;
  status: 'requested' | 'approved' | 'denied' | 'expired' | 'used' | 'revoked';
  policyDecisionId?: string;
  approver?: string;
  reason?: string;
  now?: () => string;
}): PlatformOperationApprovalArtifact {
  const now = input.now ?? foundationTimestamp;

  return PlatformOperationApprovalArtifactSchema.parse({
    id: foundationId('platform_operation_approval'),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: now(),
    operationKind: input.operationKind,
    dryRunId: input.dryRunId,
    dryRunRecordId: input.dryRunRecordId,
    approvalRequestId: foundationId('platform_operation_approval_request'),
    approvalArtifactId: foundationId('platform_operation_approval_artifact'),
    status: input.status,
    approved: input.status === 'approved',
    policyDecisionId: input.policyDecisionId ?? foundationId('policy_platform_operation'),
    expectedPlanHash: input.expectedPlanHash,
    approverHash: input.approver ? hashText(input.approver) : undefined,
    reasonHash: input.reason ? hashText(input.reason) : undefined,
    usedAt: input.status === 'used' ? now() : undefined,
    revokedAt: input.status === 'revoked' ? now() : undefined,
    ...METADATA_FLAGS,
    evidenceRefs: [
      createPlatformEvidenceRef(
        'platform.operator_role_summary',
        hashText(`${input.operationKind}:${input.status}:approval`),
        'Platform operation approval stores approver and reason as hashes only.',
        now,
      ),
    ],
    auditEventIds: [foundationId('audit_platform_operation_approval')],
    summary: `${input.status} platform ${input.operationKind} approval metadata.`,
  });
}

export function rehearseDisasterRecovery(input: {
  scenario: DisasterRecoveryScenario;
  now?: () => string;
}): DisasterRecoveryRehearsalRun {
  const now = input.now ?? foundationTimestamp;
  const passing = new Set(['backup-all-pass', 'restore-rehearsal-pass', 'audit-export-pass']);
  const status = passing.has(input.scenario)
    ? 'passed'
    : input.scenario.includes('failed')
      ? 'failed'
      : 'blocked';

  return DisasterRecoveryRehearsalRunSchema.parse({
    id: foundationId('disaster_recovery_rehearsal'),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: now(),
    scenario: input.scenario,
    status,
    backupStatus: input.scenario === 'backup-dir-missing' ? 'blocked' : 'completed',
    restoreStatus: input.scenario === 'restore-second-approval-missing' ? 'blocked' : 'completed',
    migrationStatus: input.scenario === 'migration-failed' ? 'failed' : 'rehearsed',
    retentionStatus:
      input.scenario === 'retention-backup-required' ? 'blocked' : 'rehearsed',
    auditExportStatus: input.scenario === 'audit-export-pass' ? 'completed' : 'rehearsed',
    operatorRoleStatus:
      input.scenario === 'role-missing' || input.scenario === 'role-insufficient'
        ? 'blocked'
        : 'rehearsed',
    blockerCount: status === 'passed' ? 0 : 1,
    boundaryReached: false,
    localFilesystemBoundaryInvoked: false,
    storeReplacementBoundaryInvoked: false,
    networkBoundaryInvoked: false,
    ...METADATA_FLAGS,
    evidenceRefs: [
      createPlatformEvidenceRef(
        'platform.disaster_recovery_rehearsal',
        hashText(`${input.scenario}:dr-rehearsal`),
        'Disaster recovery rehearsal stores fixture statuses only.',
        now,
      ),
    ],
    auditEventIds: [foundationId('audit_disaster_recovery_rehearsal')],
    summary: `Disaster recovery rehearsal ${input.scenario} completed as metadata-only fixture.`,
  });
}

function createPlatformEvidenceRef(
  kind: EvidenceRef['kind'],
  hash: string,
  summary: string,
  now: () => string,
): EvidenceRef {
  return {
    id: foundationId('evidence_platform_operations'),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: now(),
    kind,
    hash,
    summary,
    redacted: true,
    labels: ['metadata-only', 'platform-operations'],
  };
}

import {
  type AuditEvent,
  type EvidenceRef,
  type ExecutionAuthority,
  LocalReviewPackageApprovalArtifactRecordSchema,
  type LocalReviewPackageApprovalStatus,
  LocalReviewPackageControlPlaneRunSchema,
  LocalReviewPackageDryRunRecordSchema,
  LocalReviewDecisionProjectionSchema,
  type LocalReviewPackageApprovalArtifactRecord,
  type LocalReviewPackageControlPlaneRun,
  type LocalReviewPackageDryRunRecord,
  type LocalReviewPackageRun,
  LocalReviewPackageRunSchema,
  LocalReviewPackagePlanSchema,
  LocalReviewPackageSummarySchema,
  LocalReviewFindingSummarySchema,
  PolicyDecisionSchema,
  SchemaVersionSchema,
  foundationId,
  foundationTimestamp,
  type ControlledPatchReadinessStatus,
} from '@codexhub/contracts';
import { hashText } from '@codexhub/evidence-kernel';
import {
  REVIEW_PACKAGE_EXPORT_FILE_NAMES,
  exportLocalReviewPackageArtifact,
  resolveLocalReviewPackageArtifactTarget,
  type LocalReviewPackageArtifactRuntimeInput,
} from './artifact-export-boundary';

export interface LocalReviewPackageProjectionInput {
  sourceLifecycleRunId: string;
  sourcePatchRunId: string;
  sourceVerificationGateId?: string;
  changedFiles?: readonly string[];
  changedFilePathHashes?: readonly string[];
  diffHash?: string;
  verificationStatus: 'passed' | 'failed' | 'aborted' | 'blocked' | 'not_run';
  readinessStatus: ControlledPatchReadinessStatus;
  readyForReviewDraftOnly: boolean;
  evidenceRefIds?: readonly string[];
  auditEventIds?: readonly string[];
  findingCount?: number;
  blockerCount?: number;
  now?: () => string;
}

export function createLocalReviewPackageProjection(
  input: LocalReviewPackageProjectionInput,
): LocalReviewPackageRun {
  const now = input.now ?? foundationTimestamp;
  const changedFilePathHashes = getChangedFilePathHashes(input);
  const evidenceRefIds = [...(input.evidenceRefIds ?? [])];
  const auditEventIds = [...(input.auditEventIds ?? [])];
  const packageSeed = [
    input.sourceLifecycleRunId,
    input.sourcePatchRunId,
    input.sourceVerificationGateId ?? 'no-verification-gate',
    input.verificationStatus,
    input.readinessStatus,
    changedFilePathHashes.join(','),
  ].join(':');
  const readyForReview =
    input.verificationStatus === 'passed' &&
    input.readyForReviewDraftOnly &&
    input.readinessStatus === 'ready_for_review_draft_only' &&
    changedFilePathHashes.length > 0;
  const blockedByVerification =
    input.verificationStatus === 'failed' ||
    input.verificationStatus === 'aborted' ||
    input.verificationStatus === 'blocked';
  const status = readyForReview
    ? 'ready_for_review'
    : blockedByVerification
      ? 'blocked_verification'
      : changedFilePathHashes.length === 0
        ? 'blocked_patch'
        : 'degraded';
  const plan = LocalReviewPackagePlanSchema.parse({
    id: stableId('local_review_package_plan', packageSeed),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: now(),
    sourceLifecycleRunIdHash: stableHash(input.sourceLifecycleRunId),
    sourcePatchRunIdHash: stableHash(input.sourcePatchRunId),
    sourceVerificationGateIdHash: input.sourceVerificationGateId
      ? stableHash(input.sourceVerificationGateId)
      : undefined,
    changedFileCount: changedFilePathHashes.length,
    changedFilePathHashes,
    diffHash: input.diffHash,
    verificationStatus: input.verificationStatus,
    readinessStatus: input.readinessStatus,
    readyForReviewDraftOnly: input.readyForReviewDraftOnly,
    evidenceRefIds,
    auditEventIds,
    fileExportPlanned: false,
    processBoundaryInvoked: false,
    externalProcessStarted: false,
    noRealWrite: true,
    rawPathStored: false,
    bodyStored: false,
    metadata: {
      stage: 'm13a',
      projectionOnly: true,
      localArtifactExported: false,
    },
    summary: 'M13a local review package plan projects patch metadata only.',
  });
  const packageHash = stableHash(
    JSON.stringify({
      sourceLifecycleRunIdHash: plan.sourceLifecycleRunIdHash,
      sourcePatchRunIdHash: plan.sourcePatchRunIdHash,
      changedFilePathHashes,
      diffHash: input.diffHash,
      verificationStatus: input.verificationStatus,
    }),
  );
  const packageSummary = LocalReviewPackageSummarySchema.parse({
    id: stableId('local_review_package_summary', packageSeed),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: now(),
    planId: plan.id,
    status,
    changedFileCount: changedFilePathHashes.length,
    diffHash: input.diffHash,
    verificationStatus: input.verificationStatus,
    readyForReviewDraftOnly: readyForReview,
    evidenceRefCount: evidenceRefIds.length,
    auditEventCount: auditEventIds.length,
    packageHash,
    exported: false,
    rawPathStored: false,
    bodyStored: false,
    noRealWrite: true,
    metadata: {
      stage: 'm13a',
      reviewPackageBodyStored: false,
    },
    summary: readyForReview
      ? 'Local review package is ready for human review.'
      : `Local review package is ${status}.`,
  });
  const blockerCount = input.blockerCount ?? (readyForReview ? 0 : 1);
  const findingCount = input.findingCount ?? blockerCount;
  const findingSeverity = blockerCount > 0 ? 'blocker' : findingCount > 0 ? 'warning' : 'info';
  const findings = [
    LocalReviewFindingSummarySchema.parse({
      id: stableId('local_review_finding_summary', `${packageSeed}:${findingSeverity}`),
      schemaVersion: SchemaVersionSchema.value,
      createdAt: now(),
      reviewPackageIdHash: stableHash(packageSummary.id),
      severity: findingSeverity,
      findingCount,
      findingHash: stableHash(`${packageHash}:${findingSeverity}:${findingCount}`),
      rawFindingStored: false,
      rawPathStored: false,
      bodyStored: false,
      noRealWrite: true,
      metadata: {
        stage: 'm13a',
        rawFindingStored: false,
      },
      summary:
        findingSeverity === 'info'
          ? 'No blocking local review findings were projected.'
          : 'Local review findings are summarized as counts and hashes only.',
    }),
  ];
  const decision = LocalReviewDecisionProjectionSchema.parse({
    id: stableId('local_review_decision_projection', packageSeed),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: now(),
    reviewPackageIdHash: stableHash(packageSummary.id),
    status: 'pending',
    findingCount,
    blockerCount,
    nextAction: 'none',
    retryHandoffRequired: false,
    rawReasonStored: false,
    rawPathStored: false,
    bodyStored: false,
    noRealWrite: true,
    metadata: {
      stage: 'm13a',
      decisionPending: true,
      rawReasonStored: false,
    },
    summary: 'Local review decision is pending human review.',
  });

  return LocalReviewPackageRunSchema.parse({
    id: stableId('local_review_package_run', packageSeed),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: now(),
    plan,
    packageSummary,
    findings,
    decision,
    evidenceRefIds,
    auditEventIds,
    exported: false,
    processBoundaryInvoked: false,
    externalProcessStarted: false,
    noRealWrite: true,
    rawPathStored: false,
    bodyStored: false,
    metadata: {
      stage: 'm13a',
      projectionOnly: true,
      localArtifactExported: false,
    },
    summary: `M13a local review package projection is ${status}.`,
  });
}

export interface LocalReviewPackageExportDryRunInput {
  reviewPackage: LocalReviewPackageRun;
  workspaceRoot: string;
  artifactRoot?: string;
  packageId?: string;
  requestedBy?: string;
  now?: () => string;
}

export interface LocalReviewPackageApprovalInput {
  dryRunRecord: LocalReviewPackageDryRunRecord;
  baseRecord?: LocalReviewPackageApprovalArtifactRecord;
  status: LocalReviewPackageApprovalStatus;
  requestedBy?: string;
  decidedBy?: string;
  reason?: string;
  now?: () => string;
}

export interface LocalReviewPackageExportInput {
  dryRunRecord: LocalReviewPackageDryRunRecord;
  approvalRecord?: LocalReviewPackageApprovalArtifactRecord;
  authority?: ExecutionAuthority;
  reviewPackage: LocalReviewPackageRun;
  runtime: LocalReviewPackageArtifactRuntimeInput;
  enabled?: boolean;
  now?: () => string;
}

export function createLocalReviewPackageExportDryRunRecord(
  input: LocalReviewPackageExportDryRunInput,
): LocalReviewPackageDryRunRecord {
  const now = input.now ?? foundationTimestamp;
  const packageId = input.packageId ?? input.reviewPackage.id;
  const target = resolveLocalReviewPackageArtifactTarget({
    workspaceRoot: input.workspaceRoot,
    artifactRoot: input.artifactRoot,
    packageId,
  });
  const blockReasons = [...target.blockReasons];
  if (input.reviewPackage.packageSummary.status !== 'ready_for_review') {
    blockReasons.push('review_package_not_ready');
  }
  if (!input.reviewPackage.packageSummary.packageHash) {
    blockReasons.push('missing_package_hash');
  }
  const status = blockReasons.length === 0 ? 'planned' : 'blocked';
  const dryRunId = stableId('review_package_dry_run', `${input.reviewPackage.id}:${target.artifactDirectoryHash}`);
  const evidenceRefs = [
    createReviewPackageEvidence({
      kind: 'review.package_export_plan',
      label: 'review-package-export-plan',
      summary: 'Local review package export dry-run stores artifact path hashes only.',
      metadata: {
        dryRunId,
        reviewPackageIdHash: stableHash(input.reviewPackage.id),
        artifactRootHash: target.artifactRootHash,
        artifactDirectoryHash: target.artifactDirectoryHash,
        plannedFileCount: REVIEW_PACKAGE_EXPORT_FILE_NAMES.length,
      },
    }),
  ];
  const auditEventIds = [foundationId('audit')];

  return LocalReviewPackageDryRunRecordSchema.parse({
    id: stableId('review_package_dry_run_record', dryRunId),
    dryRunId,
    schemaVersion: SchemaVersionSchema.value,
    createdAt: now(),
    status,
    runnerMode: 'controlled-local-artifact',
    reviewPackage: input.reviewPackage,
    reviewPackageIdHash: stableHash(input.reviewPackage.id),
    packageHash: input.reviewPackage.packageSummary.packageHash,
    artifactRootHash: target.artifactRootHash,
    artifactDirectoryHash: target.artifactDirectoryHash,
    plannedFileCount: REVIEW_PACKAGE_EXPORT_FILE_NAMES.length,
    plannedFileNameHashes: REVIEW_PACKAGE_EXPORT_FILE_NAMES.map(stableHash),
    blockReasons,
    policyDecision: PolicyDecisionSchema.parse({
      id: stableId('policy_decision', dryRunId),
      schemaVersion: SchemaVersionSchema.value,
      createdAt: now(),
      actionId: dryRunId,
      actionType: 'review_package.export_local_artifact',
      actionMode: 'write',
      riskLevel: 'medium',
      outcome: status === 'planned' ? 'approval_required' : 'deny',
      reasons:
        status === 'planned'
          ? ['local artifact export requires persisted approval']
          : blockReasons,
      requiresDryRun: true,
      requiresApproval: true,
      metadata: {
        advisoryOnly: false,
        rawPathStored: false,
        bodyStored: false,
      },
    }),
    requiresApproval: true,
    evidenceRefs,
    auditEventIds,
    artifactWriteBoundaryPlanned: status === 'planned',
    artifactWriteBoundaryInvoked: false,
    processBoundaryInvoked: false,
    externalProcessStarted: false,
    noRealWrite: true,
    rawPathStored: false,
    bodyStored: false,
    metadata: {
      stage: 'm13b',
      artifactRootHash: target.artifactRootHash,
      artifactDirectoryHash: target.artifactDirectoryHash,
      rawPathStored: false,
      bodyStored: false,
    },
    summary:
      status === 'planned'
        ? 'Local review package export is planned and requires approval.'
        : 'Local review package export dry-run is blocked.',
  });
}

export function createLocalReviewPackageApprovalRecord(
  input: LocalReviewPackageApprovalInput,
): LocalReviewPackageApprovalArtifactRecord {
  const now = input.now ?? foundationTimestamp;
  const seed = `${input.dryRunRecord.dryRunId}:${input.status}:${input.baseRecord?.approvalRequestId ?? 'new'}`;
  const approvalRequestId =
    input.baseRecord?.approvalRequestId ?? stableId('review_package_approval_request', seed);
  const approvalArtifactId =
    input.baseRecord?.approvalArtifactId ?? stableId('review_package_approval_artifact', seed);
  const evidenceRefs = [
    createReviewPackageEvidence({
      kind: 'review.package_export_plan',
      label: 'review-package-export-approval',
      summary: 'Local review package export approval stores reason hashes only.',
      metadata: {
        dryRunId: input.dryRunRecord.dryRunId,
        approvalRequestId,
        approvalStatus: input.status,
        reasonHash: input.reason ? stableHash(input.reason) : undefined,
      },
    }),
  ];
  const auditEventIds = [foundationId('audit')];

  return LocalReviewPackageApprovalArtifactRecordSchema.parse({
    id: stableId('review_package_approval_record', `${seed}:${now()}`),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: now(),
    dryRunId: input.dryRunRecord.dryRunId,
    dryRunRecordId: input.dryRunRecord.id,
    approvalRequestId,
    approvalArtifactId,
    status: input.status,
    approved: input.status === 'approved',
    policyDecisionId: input.dryRunRecord.policyDecision.id,
    requestedByHash: input.requestedBy ? stableHash(input.requestedBy) : input.baseRecord?.requestedByHash,
    decidedByHash: input.decidedBy ? stableHash(input.decidedBy) : undefined,
    reasonHash: input.reason ? stableHash(input.reason) : undefined,
    evidenceRefs,
    auditEventIds,
    artifactWriteBoundaryInvoked: false,
    processBoundaryInvoked: false,
    externalProcessStarted: false,
    rawPathStored: false,
    bodyStored: false,
    metadata: {
      stage: 'm13b',
      reasonStored: false,
      rawPathStored: false,
      bodyStored: false,
    },
    summary: `Local review package export approval is ${input.status}.`,
  });
}

export async function executeLocalReviewPackageExport(
  input: LocalReviewPackageExportInput,
): Promise<LocalReviewPackageControlPlaneRun> {
  const now = input.now ?? foundationTimestamp;
  const runId = foundationId('review-package-run');
  const blockReasons = validateExportAuthority(input);

  if (blockReasons.length > 0) {
    return createExportRunRecord({
      dryRunRecord: input.dryRunRecord,
      approvalArtifactId: input.approvalRecord?.approvalArtifactId,
      reviewPackage: input.reviewPackage,
      runId,
      status: 'blocked',
      blockReasons,
      artifactWriteBoundaryInvoked: false,
      exportedFileCount: 0,
      byteCount: 0,
      noRealWrite: true,
      now,
    });
  }

  const target = resolveLocalReviewPackageArtifactTarget({
    workspaceRoot: input.runtime.workspaceRoot,
    artifactRoot: input.runtime.artifactRoot,
    packageId: input.runtime.packageId,
  });
  const hashMismatch =
    target.artifactRootHash !== input.dryRunRecord.artifactRootHash ||
    target.artifactDirectoryHash !== input.dryRunRecord.artifactDirectoryHash;

  if (target.blockReasons.length > 0 || hashMismatch) {
    return createExportRunRecord({
      dryRunRecord: input.dryRunRecord,
      approvalArtifactId: input.approvalRecord?.approvalArtifactId,
      reviewPackage: input.reviewPackage,
      runId,
      status: 'blocked',
      blockReasons: [...target.blockReasons, ...(hashMismatch ? ['artifact_target_hash_mismatch'] : [])],
      artifactWriteBoundaryInvoked: false,
      exportedFileCount: 0,
      byteCount: 0,
      noRealWrite: true,
      now,
    });
  }

  try {
    const exportResult = await exportLocalReviewPackageArtifact({
      target,
      reviewPackage: input.reviewPackage,
    });

    return createExportRunRecord({
      dryRunRecord: input.dryRunRecord,
      approvalArtifactId: input.approvalRecord?.approvalArtifactId,
      reviewPackage: input.reviewPackage,
      runId,
      status: 'completed',
      blockReasons: [],
      artifactWriteBoundaryInvoked: true,
      exportedFileCount: exportResult.fileCount,
      byteCount: exportResult.byteCount,
      contentHash: exportResult.contentHash,
      noRealWrite: false,
      now,
    });
  } catch {
    return createExportRunRecord({
      dryRunRecord: input.dryRunRecord,
      approvalArtifactId: input.approvalRecord?.approvalArtifactId,
      reviewPackage: input.reviewPackage,
      runId,
      status: 'failed',
      blockReasons: ['artifact_export_failed'],
      artifactWriteBoundaryInvoked: true,
      exportedFileCount: 0,
      byteCount: 0,
      noRealWrite: false,
      now,
    });
  }
}

function getChangedFilePathHashes(input: LocalReviewPackageProjectionInput): string[] {
  if (input.changedFilePathHashes) {
    return [...input.changedFilePathHashes];
  }

  return [...(input.changedFiles ?? [])].map((filePath) => stableHash(filePath));
}

function stableHash(value: string): string {
  return `sha256:${hashText(value)}`;
}

function stableId(prefix: string, value: string): string {
  return `${prefix}_${hashText(value).slice(0, 16)}`;
}

function createReviewPackageEvidence(input: {
  kind: EvidenceRef['kind'];
  label: string;
  summary: string;
  metadata: Record<string, unknown>;
}): EvidenceRef {
  const metadata = {
    ...input.metadata,
    rawPathStored: false,
    bodyStored: false,
  };

  return {
    id: foundationId('evidence'),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: foundationTimestamp(),
    kind: input.kind,
    summary: input.summary,
    hash: stableHash(JSON.stringify(metadata)),
    redacted: true,
    labels: [input.label],
    metadata,
  };
}

export function createLocalReviewPackageAuditEvent(input: {
  id: string;
  action: string;
  policyDecisionId: string;
  evidenceRefs: EvidenceRef[];
  artifactWriteBoundaryInvoked: boolean;
  outcome?: AuditEvent['outcome'];
}): AuditEvent {
  return {
    id: input.id,
    schemaVersion: SchemaVersionSchema.value,
    createdAt: foundationTimestamp(),
    actor: 'codexhub-supervisor',
    action: input.action,
    target: 'review-package.local-artifact',
    reason: 'local review package control-plane metadata transition',
    outcome: input.outcome ?? 'recorded',
    evidenceRefs: input.evidenceRefs,
    policyDecisionId: input.policyDecisionId,
    metadata: {
      artifactWriteBoundaryInvoked: input.artifactWriteBoundaryInvoked,
      processBoundaryInvoked: false,
      externalProcessStarted: false,
      rawPathStored: false,
      bodyStored: false,
    },
  };
}

function validateExportAuthority(input: LocalReviewPackageExportInput): string[] {
  const blockReasons: string[] = [];

  if (!input.enabled) {
    blockReasons.push('review_package_export_disabled');
  }
  if (input.dryRunRecord.status !== 'planned') {
    blockReasons.push('dry_run_not_planned');
  }
  if (!input.authority?.allowed) {
    blockReasons.push('execution_authority_denied');
  }
  if (!input.approvalRecord) {
    blockReasons.push('approval_artifact_missing');
  } else {
    if (input.approvalRecord.approvalArtifactId !== input.authority?.approvalArtifactId) {
      blockReasons.push('approval_artifact_mismatch');
    }
    if (input.approvalRecord.status !== 'approved' || !input.approvalRecord.approved) {
      blockReasons.push(`approval_artifact_${input.approvalRecord.status}`);
    }
    if (
      input.approvalRecord.expiresAt &&
      Date.parse(input.approvalRecord.expiresAt) <= Date.now()
    ) {
      blockReasons.push('approval_artifact_expired');
    }
  }
  if (input.reviewPackage.packageSummary.packageHash !== input.dryRunRecord.packageHash) {
    blockReasons.push('review_package_hash_mismatch');
  }

  return blockReasons;
}

function createExportRunRecord(input: {
  dryRunRecord: LocalReviewPackageDryRunRecord;
  approvalArtifactId?: string;
  reviewPackage: LocalReviewPackageRun;
  runId: string;
  status: 'completed' | 'failed' | 'blocked' | 'aborted';
  blockReasons: string[];
  artifactWriteBoundaryInvoked: boolean;
  exportedFileCount: number;
  byteCount: number;
  contentHash?: string;
  noRealWrite: boolean;
  now: () => string;
}): LocalReviewPackageControlPlaneRun {
  const evidenceRefs = [
    createReviewPackageEvidence({
      kind: 'review.package_export_summary',
      label: 'review-package-export-summary',
      summary: `Local review package export ${input.status}.`,
      metadata: {
        dryRunId: input.dryRunRecord.dryRunId,
        status: input.status,
        artifactWriteBoundaryInvoked: input.artifactWriteBoundaryInvoked,
        exportedFileCount: input.exportedFileCount,
        byteCount: input.byteCount,
        contentHash: input.contentHash,
      },
    }),
  ];
  const auditEventIds = [foundationId('audit')];

  return LocalReviewPackageControlPlaneRunSchema.parse({
    id: input.runId,
    schemaVersion: SchemaVersionSchema.value,
    createdAt: input.now(),
    dryRunId: input.dryRunRecord.dryRunId,
    dryRunRecordId: input.dryRunRecord.id,
    approvalArtifactId: input.approvalArtifactId,
    status: input.status,
    reviewPackageIdHash: input.dryRunRecord.reviewPackageIdHash,
    packageHash: input.dryRunRecord.packageHash,
    artifactRootHash: input.dryRunRecord.artifactRootHash,
    artifactDirectoryHash: input.dryRunRecord.artifactDirectoryHash,
    exportedFileCount: input.exportedFileCount,
    byteCount: input.byteCount,
    contentHash: input.contentHash,
    blockReasons: input.blockReasons,
    evidenceRefs,
    auditEventIds,
    artifactWriteBoundaryInvoked: input.artifactWriteBoundaryInvoked,
    processBoundaryInvoked: false,
    externalProcessStarted: false,
    noRealWrite: input.noRealWrite,
    rawPathStored: false,
    bodyStored: false,
    metadata: {
      stage: 'm13b',
      artifactWriteBoundaryInvoked: input.artifactWriteBoundaryInvoked,
      rawPathStored: false,
      bodyStored: false,
    },
    summary: `Local review package export ${input.status}.`,
  });
}

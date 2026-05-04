import {
  LocalReviewDecisionProjectionSchema,
  type LocalReviewPackageRun,
  LocalReviewPackageRunSchema,
  LocalReviewPackagePlanSchema,
  LocalReviewPackageSummarySchema,
  LocalReviewFindingSummarySchema,
  SchemaVersionSchema,
  foundationTimestamp,
  type ControlledPatchReadinessStatus,
} from '@codexhub/contracts';
import { hashText } from '@codexhub/evidence-kernel';

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

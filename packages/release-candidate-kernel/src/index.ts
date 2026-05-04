import {
  LocalRcAuditChainSchema,
  LocalRcEvidenceBundleSchema,
  LocalRcReadinessPlanSchema,
  LocalRcReadinessSummarySchema,
  SchemaVersionSchema,
  foundationTimestamp,
  type LocalRcAuditChain,
  type LocalRcEvidenceBundle,
  type LocalRcReadinessOperatorStatus,
  type LocalRcReadinessPlan,
  type LocalRcReadinessStatus,
  type LocalRcReadinessSummary,
  type LocalReviewPackageRun,
} from '@codexhub/contracts';
import { hashText } from '@codexhub/evidence-kernel';

export interface LocalRcReadinessProjectionInput {
  reviewPackage: LocalReviewPackageRun;
  operatorReadinessStatus?: LocalRcReadinessOperatorStatus;
  evidenceRefIds?: readonly string[];
  auditEventIds?: readonly string[];
  processBoundaryCount?: number;
  externalProcessStartedCount?: number;
  networkBoundaryCount?: number;
  now?: () => string;
}

export interface LocalRcReadinessProjection {
  plan: LocalRcReadinessPlan;
  summary: LocalRcReadinessSummary;
  evidenceBundle: LocalRcEvidenceBundle;
  auditChain: LocalRcAuditChain;
}

export function createLocalRcReadinessProjection(
  input: LocalRcReadinessProjectionInput,
): LocalRcReadinessProjection {
  const now = input.now ?? foundationTimestamp;
  const reviewPackage = input.reviewPackage;
  const operatorReadinessStatus = input.operatorReadinessStatus ?? 'unknown';
  const evidenceRefIds = [
    ...new Set([...(reviewPackage.evidenceRefIds ?? []), ...(input.evidenceRefIds ?? [])]),
  ];
  const auditEventIds = [
    ...new Set([...(reviewPackage.auditEventIds ?? []), ...(input.auditEventIds ?? [])]),
  ];
  const status = getReadinessStatus(reviewPackage, operatorReadinessStatus);
  const blockerCount = getBlockerCount(status);
  const seed = [
    reviewPackage.id,
    reviewPackage.decision.id,
    reviewPackage.decision.status,
    reviewPackage.packageSummary.verificationStatus,
    operatorReadinessStatus,
  ].join(':');
  const plan = LocalRcReadinessPlanSchema.parse({
    id: stableId('local_rc_readiness_plan', seed),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: now(),
    reviewPackageIdHash: stableHash(reviewPackage.id),
    reviewDecisionIdHash: stableHash(reviewPackage.decision.id),
    reviewDecisionStatus: reviewPackage.decision.status,
    verificationStatus: reviewPackage.packageSummary.verificationStatus,
    operatorReadinessStatus,
    plannedReadinessStatus: status,
    evidenceRefIds,
    auditEventIds,
    exportPlanned: false,
    processBoundaryInvoked: false,
    externalProcessStarted: false,
    noRealWrite: true,
    rawPathStored: false,
    bodyStored: false,
    metadata: {
      stage: 'm14a',
      projectionOnly: true,
      bundleExportPlanned: false,
    },
    summary: `M14a local RC readiness plan is ${status}.`,
  });
  const summary = LocalRcReadinessSummarySchema.parse({
    id: stableId('local_rc_readiness_summary', `${plan.id}:${status}`),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: now(),
    planId: plan.id,
    status,
    reviewDecisionStatus: plan.reviewDecisionStatus,
    verificationStatus: plan.verificationStatus,
    operatorReadinessStatus,
    blockerCount,
    evidenceRefCount: evidenceRefIds.length,
    auditEventCount: auditEventIds.length,
    localAcceptanceReady: status === 'ready_for_local_acceptance',
    bundleExported: false,
    rawPathStored: false,
    bodyStored: false,
    noRealWrite: true,
    metadata: {
      stage: 'm14a',
      projectionOnly: true,
    },
    summary:
      status === 'ready_for_local_acceptance'
        ? 'Local RC is ready for local acceptance.'
        : `Local RC readiness is blocked as ${status}.`,
  });
  const evidenceBundle = LocalRcEvidenceBundleSchema.parse({
    id: stableId('local_rc_evidence_bundle', `${summary.id}:${evidenceRefIds.join(',')}`),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: now(),
    rcReadinessIdHash: stableHash(summary.id),
    evidenceRefIds,
    evidenceCount: evidenceRefIds.length,
    bundleHash: stableHash(JSON.stringify({ summaryId: summary.id, evidenceRefIds })),
    artifactExported: false,
    rawPathStored: false,
    bodyStored: false,
    noRealWrite: true,
    metadata: {
      stage: 'm14a',
      factChainReplacement: false,
    },
    summary: 'Local RC evidence bundle projection references existing evidence ids only.',
  });
  const auditChain = LocalRcAuditChainSchema.parse({
    id: stableId('local_rc_audit_chain', `${summary.id}:${auditEventIds.join(',')}`),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: now(),
    rcReadinessIdHash: stableHash(summary.id),
    auditEventIds,
    auditEventCount: auditEventIds.length,
    chainHash: stableHash(JSON.stringify({ summaryId: summary.id, auditEventIds })),
    processBoundaryCount: input.processBoundaryCount ?? 0,
    externalProcessStartedCount: input.externalProcessStartedCount ?? 0,
    networkBoundaryCount: input.networkBoundaryCount ?? 0,
    artifactExported: false,
    rawPathStored: false,
    bodyStored: false,
    noRealWrite: true,
    metadata: {
      stage: 'm14a',
      projectionOnly: true,
    },
    summary: 'Local RC audit chain projection references existing audit ids only.',
  });

  return {
    plan,
    summary,
    evidenceBundle,
    auditChain,
  };
}

function getReadinessStatus(
  reviewPackage: LocalReviewPackageRun,
  operatorReadinessStatus: LocalRcReadinessOperatorStatus,
): LocalRcReadinessStatus {
  if (reviewPackage.decision.status === 'pending') {
    return 'not_ready';
  }

  if (reviewPackage.decision.status !== 'approved_for_local_rc') {
    return 'blocked_review';
  }

  if (
    reviewPackage.packageSummary.verificationStatus !== 'passed' ||
    !reviewPackage.packageSummary.readyForReviewDraftOnly
  ) {
    return 'blocked_verification';
  }

  if (operatorReadinessStatus !== 'pass') {
    return 'blocked_operator_readiness';
  }

  return 'ready_for_local_acceptance';
}

function getBlockerCount(status: LocalRcReadinessStatus): number {
  return status === 'ready_for_local_acceptance' ? 0 : 1;
}

function stableId(prefix: string, value: string): string {
  return `${prefix}_${hashText(value).slice(0, 16)}`;
}

function stableHash(value: string): string {
  return `sha256:${hashText(value)}`;
}

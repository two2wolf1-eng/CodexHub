import {
  type AuditEvent,
  type EvidenceRef,
  type ExecutionAuthority,
  LocalRcBundleApprovalArtifactRecordSchema,
  LocalRcAcceptanceRehearsalRunSchema,
  LocalRcAcceptanceRehearsalStepSchema,
  type LocalRcBundleApprovalStatus,
  LocalRcBundleControlPlaneRunSchema,
  LocalRcBundleDryRunRecordSchema,
  LocalRcAuditChainSchema,
  LocalRcEvidenceBundleSchema,
  LocalRcReadinessPlanSchema,
  LocalRcReadinessSummarySchema,
  PolicyDecisionSchema,
  SchemaVersionSchema,
  foundationId,
  foundationTimestamp,
  type LocalRcAuditChain,
  type LocalRcAcceptanceRehearsalRun,
  type LocalRcAcceptanceRehearsalScenario,
  type LocalRcAcceptanceRehearsalStep,
  type LocalRcBundleApprovalArtifactRecord,
  type LocalRcBundleControlPlaneRun,
  type LocalRcBundleDryRunRecord,
  type LocalRcEvidenceBundle,
  type LocalRcReadinessOperatorStatus,
  type LocalRcReadinessPlan,
  type LocalRcReadinessStatus,
  type LocalRcReadinessSummary,
  type LocalReviewPackageRun,
} from '@codexhub/contracts';
import { hashText } from '@codexhub/evidence-kernel';
import {
  RC_BUNDLE_EXPORT_FILE_NAMES,
  exportLocalRcBundleArtifact,
  resolveLocalRcBundleArtifactTarget,
  type LocalRcBundleArtifactRuntimeInput,
} from './artifact-export-boundary';

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

export interface LocalRcBundleExportDryRunInput extends LocalRcReadinessProjection {
  workspaceRoot: string;
  artifactRoot?: string;
  bundleId?: string;
  requestedBy?: string;
  now?: () => string;
}

export interface LocalRcBundleApprovalInput {
  dryRunRecord: LocalRcBundleDryRunRecord;
  baseRecord?: LocalRcBundleApprovalArtifactRecord;
  status: LocalRcBundleApprovalStatus;
  requestedBy?: string;
  decidedBy?: string;
  reason?: string;
  now?: () => string;
}

export interface LocalRcBundleExportInput {
  dryRunRecord: LocalRcBundleDryRunRecord;
  approvalRecord?: LocalRcBundleApprovalArtifactRecord;
  authority?: ExecutionAuthority;
  runtime: LocalRcBundleArtifactRuntimeInput;
  enabled?: boolean;
  now?: () => string;
}

export interface LocalRcAcceptanceRehearsalInput {
  scenario?: LocalRcAcceptanceRehearsalScenario;
  evidenceRefIds?: readonly string[];
  auditEventIds?: readonly string[];
  now?: () => string;
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

export function createLocalRcBundleExportDryRunRecord(
  input: LocalRcBundleExportDryRunInput,
): LocalRcBundleDryRunRecord {
  const now = input.now ?? foundationTimestamp;
  const bundleId = input.bundleId ?? input.summary.id;
  const target = resolveLocalRcBundleArtifactTarget({
    workspaceRoot: input.workspaceRoot,
    artifactRoot: input.artifactRoot,
    bundleId,
  });
  const blockReasons = [...target.blockReasons];
  if (input.summary.status !== 'ready_for_local_acceptance') {
    blockReasons.push('rc_not_ready_for_local_acceptance');
  }
  if (!input.evidenceBundle.bundleHash || !input.auditChain.chainHash) {
    blockReasons.push('missing_rc_bundle_hash');
  }
  const status = blockReasons.length === 0 ? 'planned' : 'blocked';
  const dryRunId = stableId('rc_bundle_dry_run', `${input.summary.id}:${target.artifactDirectoryHash}`);
  const rcBundleHash = stableHash(
    JSON.stringify({
      readinessSummaryId: input.summary.id,
      evidenceBundleHash: input.evidenceBundle.bundleHash,
      auditChainHash: input.auditChain.chainHash,
    }),
  );
  const evidenceRefs = [
    createRcBundleEvidence({
      kind: 'release.rc_bundle_export_plan',
      label: 'rc-bundle-export-plan',
      summary: 'Local RC bundle export dry-run stores artifact path hashes only.',
      metadata: {
        dryRunId,
        rcReadinessIdHash: stableHash(input.summary.id),
        artifactRootHash: target.artifactRootHash,
        artifactDirectoryHash: target.artifactDirectoryHash,
        plannedFileCount: RC_BUNDLE_EXPORT_FILE_NAMES.length,
      },
    }),
  ];
  const auditEventIds = [foundationId('audit')];

  return LocalRcBundleDryRunRecordSchema.parse({
    id: stableId('rc_bundle_dry_run_record', dryRunId),
    dryRunId,
    schemaVersion: SchemaVersionSchema.value,
    createdAt: now(),
    status,
    runnerMode: 'controlled-local-artifact',
    readinessPlan: input.plan,
    readinessSummary: input.summary,
    evidenceBundle: input.evidenceBundle,
    auditChain: input.auditChain,
    rcReadinessIdHash: stableHash(input.summary.id),
    rcBundleHash,
    artifactRootHash: target.artifactRootHash,
    artifactDirectoryHash: target.artifactDirectoryHash,
    plannedFileCount: RC_BUNDLE_EXPORT_FILE_NAMES.length,
    plannedFileNameHashes: RC_BUNDLE_EXPORT_FILE_NAMES.map(stableHash),
    blockReasons,
    policyDecision: PolicyDecisionSchema.parse({
      id: stableId('policy_decision', dryRunId),
      schemaVersion: SchemaVersionSchema.value,
      createdAt: now(),
      actionId: dryRunId,
      actionType: 'release_candidate.export_local_artifact',
      actionMode: 'write',
      riskLevel: 'medium',
      outcome: status === 'planned' ? 'approval_required' : 'deny',
      reasons:
        status === 'planned'
          ? ['local RC bundle export requires persisted approval']
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
      stage: 'm14b',
      artifactRootHash: target.artifactRootHash,
      artifactDirectoryHash: target.artifactDirectoryHash,
      rawPathStored: false,
      bodyStored: false,
    },
    summary:
      status === 'planned'
        ? 'Local RC bundle export is planned and requires approval.'
        : 'Local RC bundle export dry-run is blocked.',
  });
}

export function createLocalRcBundleApprovalRecord(
  input: LocalRcBundleApprovalInput,
): LocalRcBundleApprovalArtifactRecord {
  const now = input.now ?? foundationTimestamp;
  const seed = `${input.dryRunRecord.dryRunId}:${input.status}:${input.baseRecord?.approvalRequestId ?? 'new'}`;
  const approvalRequestId =
    input.baseRecord?.approvalRequestId ?? stableId('rc_bundle_approval_request', seed);
  const approvalArtifactId =
    input.baseRecord?.approvalArtifactId ?? stableId('rc_bundle_approval_artifact', seed);
  const evidenceRefs = [
    createRcBundleEvidence({
      kind: 'release.rc_bundle_export_plan',
      label: 'rc-bundle-export-approval',
      summary: 'Local RC bundle export approval stores reason hashes only.',
      metadata: {
        dryRunId: input.dryRunRecord.dryRunId,
        approvalRequestId,
        approvalStatus: input.status,
        reasonHash: input.reason ? stableHash(input.reason) : undefined,
      },
    }),
  ];
  const auditEventIds = [foundationId('audit')];

  return LocalRcBundleApprovalArtifactRecordSchema.parse({
    id: stableId('rc_bundle_approval_record', `${seed}:${now()}`),
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
      stage: 'm14b',
      reasonStored: false,
      rawPathStored: false,
      bodyStored: false,
    },
    summary: `Local RC bundle export approval is ${input.status}.`,
  });
}

export async function executeLocalRcBundleExport(
  input: LocalRcBundleExportInput,
): Promise<LocalRcBundleControlPlaneRun> {
  const now = input.now ?? foundationTimestamp;
  const runId = foundationId('rc-bundle-run');
  const blockReasons = validateRcBundleExportAuthority(input);

  if (blockReasons.length > 0) {
    return createRcBundleExportRunRecord({
      dryRunRecord: input.dryRunRecord,
      approvalArtifactId: input.approvalRecord?.approvalArtifactId,
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

  const target = resolveLocalRcBundleArtifactTarget(input.runtime);
  const hashMismatch =
    target.artifactRootHash !== input.dryRunRecord.artifactRootHash ||
    target.artifactDirectoryHash !== input.dryRunRecord.artifactDirectoryHash;

  if (target.blockReasons.length > 0 || hashMismatch) {
    return createRcBundleExportRunRecord({
      dryRunRecord: input.dryRunRecord,
      approvalArtifactId: input.approvalRecord?.approvalArtifactId,
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
    const exportResult = await exportLocalRcBundleArtifact({
      target,
      readinessPlan: input.dryRunRecord.readinessPlan,
      readinessSummary: input.dryRunRecord.readinessSummary,
      evidenceBundle: input.dryRunRecord.evidenceBundle,
      auditChain: input.dryRunRecord.auditChain,
    });

    return createRcBundleExportRunRecord({
      dryRunRecord: input.dryRunRecord,
      approvalArtifactId: input.approvalRecord?.approvalArtifactId,
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
    return createRcBundleExportRunRecord({
      dryRunRecord: input.dryRunRecord,
      approvalArtifactId: input.approvalRecord?.approvalArtifactId,
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

export function runLocalRcAcceptanceRehearsal(
  input: LocalRcAcceptanceRehearsalInput = {},
): LocalRcAcceptanceRehearsalRun {
  const now = input.now ?? foundationTimestamp;
  const scenario = input.scenario ?? 'all-pass';
  const scenarioState = getLocalRcAcceptanceScenarioState(scenario);
  const runId = stableId('local_rc_acceptance_rehearsal', scenario);
  const evidenceRefIds = [...new Set(input.evidenceRefIds ?? ['evidence_rc_acceptance_fixture'])];
  const auditEventIds = [...new Set(input.auditEventIds ?? ['audit_rc_acceptance_fixture'])];
  const bundleHash = stableHash(
    JSON.stringify({
      scenario,
      readinessStatus: scenarioState.rcReadinessStatus,
      reviewDecisionStatus: scenarioState.reviewDecisionStatus,
      verificationStatus: scenarioState.verificationStatus,
      exportSummaryStatus: scenarioState.exportSummaryStatus,
    }),
  );
  const steps = createLocalRcAcceptanceSteps({
    scenario,
    now,
    evidenceRefIds,
    auditEventIds,
    bundleHash,
    blockedPhase: scenarioState.blockedPhase,
  });

  return LocalRcAcceptanceRehearsalRunSchema.parse({
    id: runId,
    schemaVersion: SchemaVersionSchema.value,
    createdAt: now(),
    scenario,
    status: scenarioState.status,
    rcReadinessStatus: scenarioState.rcReadinessStatus,
    reviewDecisionStatus: scenarioState.reviewDecisionStatus,
    verificationStatus: scenarioState.verificationStatus,
    exportSummaryStatus: scenarioState.exportSummaryStatus,
    operatorAcceptanceStatus: scenarioState.operatorAcceptanceStatus,
    stepCount: steps.length,
    steps,
    evidenceRefIds,
    auditEventIds,
    evidenceRefCount: evidenceRefIds.length,
    auditEventCount: auditEventIds.length,
    bundleHash,
    blockReasons: scenarioState.blockReasons,
    artifactWriteBoundaryInvoked: false,
    processBoundaryInvoked: false,
    externalProcessStarted: false,
    networkBoundaryInvoked: false,
    noRealWrite: true,
    rawPathStored: false,
    bodyStored: false,
    metadata: {
      stage: 'm14c',
      fixtureOnly: true,
      localOnly: true,
      remoteActionPlanned: false,
      artifactWriteBoundaryInvoked: false,
    },
    summary:
      scenarioState.status === 'passed'
        ? 'Local RC acceptance rehearsal passed with fixture metadata only.'
        : `Local RC acceptance rehearsal blocked by ${scenarioState.blockReasons.join(', ')}.`,
  });
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

function createRcBundleEvidence(input: {
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

export function createLocalRcBundleAuditEvent(input: {
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
    target: 'release-candidate.local-artifact',
    reason: 'local RC bundle control-plane metadata transition',
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

function getLocalRcAcceptanceScenarioState(scenario: LocalRcAcceptanceRehearsalScenario): {
  status: 'passed' | 'failed' | 'blocked' | 'aborted';
  rcReadinessStatus: LocalRcReadinessStatus;
  reviewDecisionStatus: LocalReviewPackageRun['decision']['status'];
  verificationStatus: 'passed' | 'failed' | 'aborted' | 'blocked' | 'not_run';
  exportSummaryStatus: 'fixture_completed' | 'blocked' | 'skipped';
  operatorAcceptanceStatus: 'accepted' | 'blocked' | 'not_ready';
  blockedPhase?: LocalRcAcceptanceRehearsalStep['phase'];
  blockReasons: string[];
} {
  if (scenario === 'all-pass') {
    return {
      status: 'passed',
      rcReadinessStatus: 'ready_for_local_acceptance',
      reviewDecisionStatus: 'approved_for_local_rc',
      verificationStatus: 'passed',
      exportSummaryStatus: 'fixture_completed',
      operatorAcceptanceStatus: 'accepted',
      blockReasons: [],
    };
  }

  if (scenario === 'review-blocked') {
    return {
      status: 'blocked',
      rcReadinessStatus: 'blocked_review',
      reviewDecisionStatus: 'changes_requested',
      verificationStatus: 'passed',
      exportSummaryStatus: 'skipped',
      operatorAcceptanceStatus: 'not_ready',
      blockedPhase: 'review-decision',
      blockReasons: ['review_decision_not_approved'],
    };
  }

  if (scenario === 'verification-blocked') {
    return {
      status: 'blocked',
      rcReadinessStatus: 'blocked_verification',
      reviewDecisionStatus: 'approved_for_local_rc',
      verificationStatus: 'failed',
      exportSummaryStatus: 'skipped',
      operatorAcceptanceStatus: 'not_ready',
      blockedPhase: 'rc-readiness',
      blockReasons: ['verification_not_passed'],
    };
  }

  if (scenario === 'readiness-blocked') {
    return {
      status: 'blocked',
      rcReadinessStatus: 'blocked_operator_readiness',
      reviewDecisionStatus: 'approved_for_local_rc',
      verificationStatus: 'passed',
      exportSummaryStatus: 'skipped',
      operatorAcceptanceStatus: 'not_ready',
      blockedPhase: 'rc-readiness',
      blockReasons: ['operator_readiness_not_passing'],
    };
  }

  if (scenario === 'export-blocked') {
    return {
      status: 'blocked',
      rcReadinessStatus: 'ready_for_local_acceptance',
      reviewDecisionStatus: 'approved_for_local_rc',
      verificationStatus: 'passed',
      exportSummaryStatus: 'blocked',
      operatorAcceptanceStatus: 'blocked',
      blockedPhase: 'rc-export-summary',
      blockReasons: ['rc_bundle_export_blocked'],
    };
  }

  return {
    status: 'blocked',
    rcReadinessStatus: 'blocked_review',
    reviewDecisionStatus: 'superseded',
    verificationStatus: 'passed',
    exportSummaryStatus: 'skipped',
    operatorAcceptanceStatus: 'not_ready',
    blockedPhase: 'review-decision',
    blockReasons: ['review_package_superseded'],
  };
}

function createLocalRcAcceptanceSteps(input: {
  scenario: LocalRcAcceptanceRehearsalScenario;
  now: () => string;
  evidenceRefIds: string[];
  auditEventIds: string[];
  bundleHash: string;
  blockedPhase?: LocalRcAcceptanceRehearsalStep['phase'];
}): LocalRcAcceptanceRehearsalStep[] {
  const phases: LocalRcAcceptanceRehearsalStep['phase'][] = [
    'review-package',
    'review-decision',
    'rc-readiness',
    'rc-export-summary',
    'operator-acceptance',
  ];
  const blockedIndex = input.blockedPhase ? phases.indexOf(input.blockedPhase) : -1;

  return phases.map((phase, order) => {
    const status =
      blockedIndex === -1
        ? 'passed'
        : order < blockedIndex
          ? 'passed'
          : order === blockedIndex
            ? 'blocked'
            : 'skipped';

    return LocalRcAcceptanceRehearsalStepSchema.parse({
      id: stableId('local_rc_acceptance_step', `${input.scenario}:${phase}`),
      schemaVersion: SchemaVersionSchema.value,
      createdAt: input.now(),
      scenario: input.scenario,
      phase,
      status,
      order,
      evidenceRefIds: input.evidenceRefIds,
      auditEventIds: input.auditEventIds,
      processBoundaryInvoked: false,
      externalProcessStarted: false,
      networkBoundaryInvoked: false,
      artifactWriteBoundaryInvoked: false,
      noRealWrite: true,
      rawPathStored: false,
      bodyStored: false,
      metadata: {
        stage: 'm14c',
        fixtureOnly: true,
        bundleHash: input.bundleHash,
      },
      summary: `Local RC acceptance ${phase} fixture step ${status}.`,
    });
  });
}

function validateRcBundleExportAuthority(input: LocalRcBundleExportInput): string[] {
  const blockReasons: string[] = [];

  if (!input.enabled) {
    blockReasons.push('release_candidate_export_disabled');
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
  if (input.dryRunRecord.readinessSummary.status !== 'ready_for_local_acceptance') {
    blockReasons.push('rc_not_ready_for_local_acceptance');
  }

  return blockReasons;
}

function createRcBundleExportRunRecord(input: {
  dryRunRecord: LocalRcBundleDryRunRecord;
  approvalArtifactId?: string;
  runId: string;
  status: 'completed' | 'failed' | 'blocked' | 'aborted';
  blockReasons: string[];
  artifactWriteBoundaryInvoked: boolean;
  exportedFileCount: number;
  byteCount: number;
  contentHash?: string;
  noRealWrite: boolean;
  now: () => string;
}): LocalRcBundleControlPlaneRun {
  const evidenceRefs = [
    createRcBundleEvidence({
      kind: 'release.rc_bundle_export_summary',
      label: 'rc-bundle-export-summary',
      summary: `Local RC bundle export ${input.status}.`,
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

  return LocalRcBundleControlPlaneRunSchema.parse({
    id: input.runId,
    schemaVersion: SchemaVersionSchema.value,
    createdAt: input.now(),
    dryRunId: input.dryRunRecord.dryRunId,
    dryRunRecordId: input.dryRunRecord.id,
    approvalArtifactId: input.approvalArtifactId,
    status: input.status,
    rcReadinessIdHash: input.dryRunRecord.rcReadinessIdHash,
    rcBundleHash: input.dryRunRecord.rcBundleHash,
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
      stage: 'm14b',
      artifactWriteBoundaryInvoked: input.artifactWriteBoundaryInvoked,
      rawPathStored: false,
      bodyStored: false,
    },
    summary: `Local RC bundle export ${input.status}.`,
  });
}

function stableId(prefix: string, value: string): string {
  return `${prefix}_${hashText(value).slice(0, 16)}`;
}

function stableHash(value: string): string {
  return `sha256:${hashText(value)}`;
}

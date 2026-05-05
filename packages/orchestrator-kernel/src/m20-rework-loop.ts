import {
  type ExecutionAuthority,
  type PolicyDecision,
  PolicyDecisionSchema,
  ReworkAttemptSummarySchema,
  type ReworkLoopAcceptanceRehearsalRun,
  ReworkLoopAcceptanceRehearsalRunSchema,
  type ReworkLoopAcceptanceScenario,
  type ReworkLoopApprovalArtifactRecord,
  ReworkLoopApprovalArtifactRecordSchema,
  type ReworkLoopPlan,
  ReworkLoopPlanSchema,
  type ReworkLoopRun,
  ReworkLoopRunSchema,
  ReworkSupersedeProjectionSchema,
  type ReworkTriggerKind,
  type ReworkTriggerSummary,
  ReworkTriggerSummarySchema,
  SchemaVersionSchema,
  foundationTimestamp,
} from '@codexhub/contracts';
import { hashText } from '@codexhub/evidence-kernel';

export interface ReworkLoopPlanInput {
  triggerKind?: ReworkTriggerKind;
  sourceRunId: string;
  sourceStatus?: string;
  sourceSummaryLabel?: string;
  sourcePackageLabel?: string;
  sourcePrLifecycleRunId?: string;
  previousAttemptId?: string;
  attemptNumber?: number;
  branchSlug?: string;
  changedFileLabels?: readonly string[];
  checkFailureCount?: number;
  reviewFindingCount?: number;
  staleBranch?: boolean;
  requestedBy?: string;
  now?: () => string;
}

export interface ReworkLoopApprovalInput {
  dryRunRecord: ReworkLoopPlan;
  baseRecord?: ReworkLoopApprovalArtifactRecord;
  status: ReworkLoopApprovalArtifactRecord['status'];
  requestedBy?: string;
  decidedBy?: string;
  reason?: string;
  now?: () => string;
}

export interface ReworkLoopExecutionInput {
  dryRunRecord: ReworkLoopPlan;
  approvalRecord?: ReworkLoopApprovalArtifactRecord;
  authority?: ExecutionAuthority;
  enabled?: boolean;
  now?: () => string;
}

export interface ReworkLoopAcceptanceRehearsalInput {
  scenario?: ReworkLoopAcceptanceScenario;
  now?: () => string;
}

export function createReworkLoopPlan(input: ReworkLoopPlanInput): ReworkLoopPlan {
  const now = input.now ?? foundationTimestamp;
  const createdAt = now();
  const attemptNumber = input.attemptNumber ?? 2;
  const branchSlug = normalizeBranchSlug(input.branchSlug ?? 'rework-loop');
  const blockReasons = collectPlanBlockReasons(input, attemptNumber, branchSlug);
  const status = blockReasons.length > 0 ? 'blocked' : 'planned';
  const trigger = createTriggerSummary(input, createdAt);
  const nextAttempt = ReworkAttemptSummarySchema.parse({
    id: stableId('rework_attempt', `${input.sourceRunId}:${attemptNumber}:${branchSlug}`),
    schemaVersion: SchemaVersionSchema.value,
    createdAt,
    attemptNumber,
    status: status === 'planned' ? 'planned' : 'blocked',
    previousAttemptIdHash: input.previousAttemptId
      ? stableHash(input.previousAttemptId)
      : stableHash(`${input.sourceRunId}:attempt:${attemptNumber - 1}`),
    sourcePatchLifecycleIdHash: stableHash(`${input.sourceRunId}:patch-lifecycle`),
    sourceReviewPackageIdHash: stableHash(`${input.sourceRunId}:review-package`),
    sourceRcReadinessIdHash: stableHash(`${input.sourceRunId}:rc-readiness`),
    sourceBranchPublishRunIdHash: stableHash(`${input.sourceRunId}:branch-publish`),
    sourceDraftPrRunIdHash: stableHash(`${input.sourceRunId}:draft-pr`),
    sourcePrLifecycleRunIdHash: input.sourcePrLifecycleRunId
      ? stableHash(input.sourcePrLifecycleRunId)
      : stableHash(`${input.sourceRunId}:pr-lifecycle`),
    plannedBranchNameHash: stableHash(`codexhub/${branchSlug}-r${attemptNumber}`),
    branchPrefix: 'codexhub/',
    branchAttemptSuffix: `r${attemptNumber}`,
    changedFileCount: input.changedFileLabels?.length ?? 0,
    changedFilePathHashes: [...(input.changedFileLabels ?? [])].map(stableHash),
    diffHash: input.changedFileLabels && input.changedFileLabels.length > 0
      ? stableHash(`${input.sourceRunId}:diff:${attemptNumber}`)
      : undefined,
    evidenceRefIds: [stableId('evidence_rework_attempt', input.sourceRunId)],
    auditEventIds: [stableId('audit_rework_attempt', input.sourceRunId)],
    childApprovalsRequired: true,
    patchApprovalRequired: true,
    branchPublishApprovalRequired: true,
    draftPrApprovalRequired: true,
    directChildExecutionAllowed: false,
    updatesExistingBranch: false,
    forceAllowed: false,
    mergeAllowed: false,
    commentAllowed: false,
    labelAllowed: false,
    reviewerAllowed: false,
    rawDiffStored: false,
    rawPrBodyStored: false,
    rawReasonStored: false,
    rawPathStored: false,
    bodyStored: false,
    noRealWrite: true,
    processBoundaryInvoked: false,
    externalProcessStarted: false,
    networkBoundaryInvoked: false,
    metadata: {
      stage: 'm20',
      projectionOnly: true,
      childControlPlanesRequired: true,
    },
    summary: `M20 rework attempt ${attemptNumber} is ${status}; child planes require separate approvals.`,
  });
  const supersedeProjection = ReworkSupersedeProjectionSchema.parse({
    id: stableId('rework_supersede', `${input.sourceRunId}:${attemptNumber}`),
    schemaVersion: SchemaVersionSchema.value,
    createdAt,
    sourceAttemptIdHash: stableHash(input.previousAttemptId ?? `${input.sourceRunId}:attempt:${attemptNumber - 1}`),
    supersedingAttemptIdHash: stableHash(nextAttempt.id),
    sourcePackageHash: stableHash(input.sourcePackageLabel ?? `${input.sourceRunId}:package`),
    sourceBranchHash: stableHash(`${input.sourceRunId}:branch`),
    sourceDraftPrHash: stableHash(`${input.sourceRunId}:draft-pr`),
    superseded: true,
    oldBranchPreserved: true,
    oldDraftPrClosed: false,
    deleteRemoteBranchAllowed: false,
    mergeAllowed: false,
    evidenceRefIds: [stableId('evidence_rework_supersede', input.sourceRunId)],
    auditEventIds: [stableId('audit_rework_supersede', input.sourceRunId)],
    rawRefStored: false,
    rawUrlStored: false,
    rawReasonStored: false,
    rawPathStored: false,
    bodyStored: false,
    noRealWrite: true,
    metadata: {
      stage: 'm20',
      supersedeMetadataOnly: true,
    },
    summary: 'Supersede projection preserves old remote branch and draft PR metadata only.',
  });
  const policyDecision = createReworkPolicyDecision({
    actionId: stableId('rework_loop_action', input.sourceRunId),
    createdAt,
    outcome: status === 'planned' ? 'approval_required' : 'deny',
    reasons:
      status === 'planned'
        ? ['rework orchestration requires persisted approval before creating metadata run']
        : blockReasons,
  });

  return ReworkLoopPlanSchema.parse({
    id: stableId('rework_loop_plan', `${input.sourceRunId}:${attemptNumber}`),
    schemaVersion: SchemaVersionSchema.value,
    createdAt,
    dryRunId: stableId('rework_loop_dry_run', `${input.sourceRunId}:${attemptNumber}`),
    status,
    trigger,
    nextAttempt,
    supersedeProjection,
    sourceRunIdHash: stableHash(input.sourceRunId),
    sourcePackageHash: stableHash(input.sourcePackageLabel ?? `${input.sourceRunId}:package`),
    sourcePrLifecycleRunIdHash: input.sourcePrLifecycleRunId
      ? stableHash(input.sourcePrLifecycleRunId)
      : undefined,
    requestedAttemptNumber: attemptNumber,
    blockReasons,
    policyDecision,
    evidenceRefs: [],
    auditEventIds: [stableId('audit_rework_plan', input.sourceRunId)],
    childApprovalsRequired: true,
    directChildExecutionAllowed: false,
    updateExistingBranchAllowed: false,
    forceAllowed: false,
    mergeAllowed: false,
    rawDiffStored: false,
    rawPrBodyStored: false,
    rawReasonStored: false,
    rawPathStored: false,
    bodyStored: false,
    noRealWrite: true,
    processBoundaryInvoked: false,
    externalProcessStarted: false,
    networkBoundaryInvoked: false,
    metadata: {
      stage: 'm20',
      projectionOnly: true,
      noChildExecution: true,
    },
    summary: `M20 rework loop dry-run is ${status}; no patch, branch, or PR was executed.`,
  });
}

export function createReworkLoopApprovalRecord(
  input: ReworkLoopApprovalInput,
): ReworkLoopApprovalArtifactRecord {
  const now = input.now ?? foundationTimestamp;
  const createdAt = now();
  const approved = input.status === 'approved';

  return ReworkLoopApprovalArtifactRecordSchema.parse({
    id: stableId('rework_loop_approval', `${input.dryRunRecord.id}:${input.status}`),
    schemaVersion: SchemaVersionSchema.value,
    createdAt,
    dryRunId: input.dryRunRecord.dryRunId,
    dryRunRecordId: input.dryRunRecord.id,
    status: input.status,
    approvalArtifactId: approved
      ? stableId('rework_loop_approval_artifact', input.dryRunRecord.id)
      : input.baseRecord?.approvalArtifactId,
    approved,
    policyDecisionId: input.dryRunRecord.policyDecision.id,
    requestedBy: input.requestedBy ?? input.baseRecord?.requestedBy ?? 'operator',
    decidedBy: input.decidedBy ?? input.baseRecord?.decidedBy,
    expiresAt: approved ? futureIso(createdAt) : input.baseRecord?.expiresAt,
    reasonHash: input.reason ? stableHash(input.reason) : undefined,
    evidenceRefs: [],
    auditEventIds: [stableId('audit_rework_approval', `${input.dryRunRecord.id}:${input.status}`)],
    rawReasonStored: false,
    rawPathStored: false,
    bodyStored: false,
    noRealWrite: true,
    processBoundaryInvoked: false,
    externalProcessStarted: false,
    networkBoundaryInvoked: false,
    metadata: {
      stage: 'm20',
      rawReasonStored: false,
    },
    summary: `M20 rework approval record is ${input.status}.`,
  });
}

export function executeReworkLoop(input: ReworkLoopExecutionInput): ReworkLoopRun {
  const now = input.now ?? foundationTimestamp;
  const createdAt = now();
  const blockReasons = collectExecutionBlockReasons(input);
  const status = blockReasons.length > 0 ? 'blocked' : 'completed';

  return ReworkLoopRunSchema.parse({
    id: stableId('rework_loop_run', `${input.dryRunRecord.id}:${status}`),
    schemaVersion: SchemaVersionSchema.value,
    createdAt,
    dryRunId: input.dryRunRecord.dryRunId,
    dryRunRecordId: input.dryRunRecord.id,
    approvalArtifactId: input.approvalRecord?.approvalArtifactId,
    status,
    plan: input.dryRunRecord,
    trigger: input.dryRunRecord.trigger,
    attempts: [input.dryRunRecord.nextAttempt],
    attemptCount: 1,
    supersedeProjection: input.dryRunRecord.supersedeProjection,
    nextActionSummaryHash: stableHash(`${input.dryRunRecord.id}:${status}:next-action`),
    blockReasons,
    evidenceRefs: [],
    evidenceRefIds: input.dryRunRecord.nextAttempt.evidenceRefIds,
    auditEventIds: [stableId('audit_rework_run', `${input.dryRunRecord.id}:${status}`)],
    childApprovalsRequired: true,
    directChildExecutionAllowed: false,
    patchExecuted: false,
    branchPublished: false,
    draftPrCreated: false,
    updateExistingBranchAllowed: false,
    forceAllowed: false,
    mergeAllowed: false,
    rawDiffStored: false,
    rawPrBodyStored: false,
    rawReasonStored: false,
    rawPathStored: false,
    bodyStored: false,
    noRealWrite: true,
    processBoundaryInvoked: false,
    externalProcessStarted: false,
    networkBoundaryInvoked: false,
    metadata: {
      stage: 'm20',
      childControlPlanesRequired: true,
      noChildExecution: true,
    },
    summary:
      status === 'completed'
        ? 'Rework loop recorded next-action metadata; child control planes still require their own approvals.'
        : `Rework loop blocked before child control-plane handoff: ${blockReasons.join(', ')}`,
  });
}

export function runReworkLoopAcceptanceRehearsal(
  input: ReworkLoopAcceptanceRehearsalInput = {},
): ReworkLoopAcceptanceRehearsalRun {
  const scenario = input.scenario ?? 'all-pass';
  const now = input.now ?? foundationTimestamp;
  const createdAt = now();
  const config = getRehearsalScenarioConfig(scenario);

  return ReworkLoopAcceptanceRehearsalRunSchema.parse({
    id: stableId('rework_loop_rehearsal', scenario),
    schemaVersion: SchemaVersionSchema.value,
    createdAt,
    scenario,
    status: config.status,
    triggerKind: config.triggerKind,
    attemptStatus: config.attemptStatus,
    supersededSource: config.supersededSource,
    stepCount: config.stepCount,
    evidenceRefCount: config.evidenceRefCount,
    auditEventCount: config.auditEventCount,
    blockerCount: config.blockerCount,
    nextBranchNameHash: stableHash(`codexhub/rework-loop-r${config.nextAttemptNumber}`),
    childApprovalsRequired: true,
    directChildExecutionAllowed: false,
    patchExecuted: false,
    branchPublished: false,
    draftPrCreated: false,
    updateExistingBranchAllowed: false,
    forceAllowed: false,
    mergeAllowed: false,
    rawDiffStored: false,
    rawPrBodyStored: false,
    rawReasonStored: false,
    rawPathStored: false,
    bodyStored: false,
    processBoundaryInvoked: false,
    externalProcessStarted: false,
    networkBoundaryInvoked: false,
    noRealWrite: true,
    metadata: {
      stage: 'm20d',
      fixtureOnly: true,
      noLiveBoundary: true,
    },
    summary: `M20 rework rehearsal ${scenario} is ${config.status}; no child execution occurred.`,
  });
}

function createTriggerSummary(input: ReworkLoopPlanInput, createdAt: string): ReworkTriggerSummary {
  const kind = input.triggerKind ?? inferTriggerKind(input);

  return ReworkTriggerSummarySchema.parse({
    id: stableId('rework_trigger', `${input.sourceRunId}:${kind}`),
    schemaVersion: SchemaVersionSchema.value,
    createdAt,
    kind,
    sourceRunIdHash: stableHash(input.sourceRunId),
    sourceStatus: input.sourceStatus ?? kind,
    sourceSummaryHash: stableHash(input.sourceSummaryLabel ?? `${input.sourceRunId}:summary`),
    checkFailureCount: input.checkFailureCount ?? (kind === 'checks_failed' ? 1 : 0),
    reviewFindingCount:
      input.reviewFindingCount ?? (kind === 'review_changes_requested' ? 1 : 0),
    staleBranch: input.staleBranch ?? kind === 'stale_branch',
    reasonHash: stableHash(`${input.sourceRunId}:${kind}:reason`),
    rawReasonStored: false,
    rawPathStored: false,
    bodyStored: false,
    noRealWrite: true,
    metadata: {
      stage: 'm20',
      triggerMetadataOnly: true,
    },
    summary: `Rework trigger ${kind} is represented as counts and hashes only.`,
  });
}

function collectPlanBlockReasons(
  input: ReworkLoopPlanInput,
  attemptNumber: number,
  branchSlug: string,
): string[] {
  const reasons: string[] = [];

  if (!input.sourceRunId || input.sourceRunId.trim().length === 0) {
    reasons.push('source_run_required');
  }

  if (attemptNumber < 2) {
    reasons.push('new_attempt_number_required');
  }

  if (!/^[a-z0-9][a-z0-9-]{1,62}$/.test(branchSlug)) {
    reasons.push('safe_branch_slug_required');
  }

  return reasons;
}

function collectExecutionBlockReasons(input: ReworkLoopExecutionInput): string[] {
  const reasons: string[] = [];

  if (!input.enabled) {
    reasons.push('rework_loop_disabled');
  }

  if (input.dryRunRecord.status !== 'planned') {
    reasons.push('dry_run_not_planned');
  }

  if (!input.authority?.allowed) {
    reasons.push('authority_required');
  }

  if (!input.approvalRecord?.approvalArtifactId || input.approvalRecord.status !== 'approved') {
    reasons.push('approved_persisted_approval_required');
  }

  if (input.authority?.approvalArtifactId !== input.approvalRecord?.approvalArtifactId) {
    reasons.push('authority_approval_mismatch');
  }

  return reasons;
}

function createReworkPolicyDecision(input: {
  actionId: string;
  createdAt: string;
  outcome: PolicyDecision['outcome'];
  reasons: readonly string[];
}): PolicyDecision {
  return PolicyDecisionSchema.parse({
    id: stableId('policy_decision_rework', input.actionId),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: input.createdAt,
    actionId: input.actionId,
    actionType: 'rework.loop.orchestrate',
    actionMode: 'dry-run',
    riskLevel: 'high',
    outcome: input.outcome,
    reasons: [...input.reasons],
    requiresDryRun: true,
    requiresApproval: true,
  });
}

function inferTriggerKind(input: ReworkLoopPlanInput): ReworkTriggerKind {
  if (input.staleBranch) {
    return 'stale_branch';
  }

  if ((input.reviewFindingCount ?? 0) > 0) {
    return 'review_changes_requested';
  }

  if ((input.checkFailureCount ?? 0) > 0 || input.sourceStatus === 'checks_failed') {
    return 'checks_failed';
  }

  return 'operator_requested';
}

function getRehearsalScenarioConfig(scenario: ReworkLoopAcceptanceScenario): {
  status: ReworkLoopAcceptanceRehearsalRun['status'];
  triggerKind: ReworkTriggerKind;
  attemptStatus: ReworkLoopAcceptanceRehearsalRun['attemptStatus'];
  supersededSource: boolean;
  stepCount: number;
  evidenceRefCount: number;
  auditEventCount: number;
  blockerCount: number;
  nextAttemptNumber: number;
} {
  switch (scenario) {
    case 'all-pass':
      return createScenarioConfig('passed', 'operator_requested', 'planned', false, 0);
    case 'checks-failed-rework':
      return createScenarioConfig('passed', 'checks_failed', 'planned', true, 0);
    case 'review-changes-requested':
      return createScenarioConfig('passed', 'review_changes_requested', 'planned', true, 0);
    case 'patch-failed':
      return createScenarioConfig('failed', 'operator_requested', 'patch_ready', true, 1);
    case 'verification-failed':
      return createScenarioConfig('failed', 'checks_failed', 'verification_failed', true, 1);
    case 'branch-publish-failed':
      return createScenarioConfig('failed', 'operator_requested', 'branch_publish_failed', true, 1);
    case 'draft-pr-failed':
      return createScenarioConfig('failed', 'operator_requested', 'draft_pr_failed', true, 1);
    case 'stale-branch':
      return createScenarioConfig('blocked', 'stale_branch', 'blocked', false, 1);
    case 'superseded-source':
      return createScenarioConfig('blocked', 'stale_branch', 'superseded', true, 1);
    case 'approval-blocked':
      return createScenarioConfig('blocked', 'operator_requested', 'blocked', false, 1);
  }
}

function createScenarioConfig(
  status: ReworkLoopAcceptanceRehearsalRun['status'],
  triggerKind: ReworkTriggerKind,
  attemptStatus: ReworkLoopAcceptanceRehearsalRun['attemptStatus'],
  supersededSource: boolean,
  blockerCount: number,
): ReturnType<typeof getRehearsalScenarioConfig> {
  return {
    status,
    triggerKind,
    attemptStatus,
    supersededSource,
    stepCount: 6,
    evidenceRefCount: blockerCount === 0 ? 4 : 2,
    auditEventCount: blockerCount === 0 ? 4 : 2,
    blockerCount,
    nextAttemptNumber: 2,
  };
}

function normalizeBranchSlug(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 63);
}

function futureIso(createdAt: string): string {
  return new Date(new Date(createdAt).getTime() + 60 * 60 * 1000).toISOString();
}

function stableHash(value: string): string {
  return `sha256:${hashText(value)}`;
}

function stableId(prefix: string, value: string): string {
  return `${prefix}_${hashText(value).slice(0, 16)}`;
}

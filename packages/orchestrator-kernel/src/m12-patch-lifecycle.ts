import {
  type ControlledPatchLifecycleRun,
  ControlledPatchLifecycleRunSchema,
  type ControlledPatchLifecycleStatus,
  ControlledPatchPlanSchema,
  ControlledPatchReadinessSchema,
  type ControlledPatchReadinessStatus,
  type ControlledPatchRejectionReason,
  ControlledPatchRunSchema,
  type ControlledPatchVerificationStatus,
  DiffReviewSummarySchema,
  type DiffReviewStatus,
  type EvidenceRef,
  SchemaVersionSchema,
  foundationTimestamp,
} from '@codexhub/contracts';
import { hashText } from '@codexhub/evidence-kernel';

export type M12PatchLifecycleScenario =
  | 'all-pass'
  | 'no-patch'
  | 'policy-blocked'
  | 'codex-failed'
  | 'verification-failed'
  | 'aborted';

export interface M12ControlledPatchLifecycleFixtureInput {
  scenario?: M12PatchLifecycleScenario;
  requestId?: string;
  worktreeRunId?: string;
  worktreePathLabel?: string;
  changedFiles?: string[];
  now?: () => string;
}

interface M12PatchLifecycleScenarioConfig {
  lifecycleStatus: ControlledPatchLifecycleStatus;
  readinessStatus: ControlledPatchReadinessStatus;
  verificationStatus: ControlledPatchVerificationStatus;
  diffReviewStatus: DiffReviewStatus;
  rejectionReasons: ControlledPatchRejectionReason[];
  changedFiles: string[];
  readyForReviewDraftOnly: boolean;
  blockerCodes: string[];
}

export function runM12ControlledPatchLifecycleFixture(
  input: M12ControlledPatchLifecycleFixtureInput = {},
): ControlledPatchLifecycleRun {
  const scenario = input.scenario ?? 'all-pass';
  const now = input.now ?? foundationTimestamp;
  const config = getScenarioConfig(scenario, input.changedFiles);
  const stableSeed = [
    scenario,
    input.requestId ?? 'request:m12',
    input.worktreeRunId ?? 'worktree:m12',
    input.worktreePathLabel ?? 'worktree:path:m12',
  ].join(':');
  const evidenceRefs = createEvidenceRefs(stableSeed, now);
  const auditEventIds = [
    stableId('audit_m12_patch_plan', stableSeed),
    stableId('audit_m12_patch_run', stableSeed),
    stableId('audit_m12_diff_review', stableSeed),
    stableId('audit_m12_readiness', stableSeed),
  ];
  const changedFileHashes = config.changedFiles.map((filePath) => stableHash(filePath));
  const diffHash =
    config.changedFiles.length > 0 ? stableHash(`diff-summary:${stableSeed}`) : undefined;
  const diffLineCount = config.changedFiles.length * 12;
  const plan = ControlledPatchPlanSchema.parse({
    id: stableId('m12_patch_plan', stableSeed),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: now(),
    requestIdHash: stableHash(input.requestId ?? 'request:m12'),
    worktreeRunIdHash: stableHash(input.worktreeRunId ?? 'worktree:m12'),
    worktreePathHash: stableHash(input.worktreePathLabel ?? 'worktree:path:m12'),
    plannedChangedFileCount: config.changedFiles.length,
    plannedChangedFilePathHashes: changedFileHashes,
    patchBodyHash: stableHash(`patch-body:${stableSeed}`),
    codexPatchAllowed: false,
    fixtureOnly: true,
    noRealWrite: true,
    rawPathStored: false,
    bodyStored: false,
    processBoundaryInvoked: false,
    externalProcessStarted: false,
    metadata: {
      fixtureOnly: true,
      scenario,
      noLiveBoundary: true,
      noPush: true,
      noPullRequestOpened: true,
    },
    summary: `M12 fixture patch plan for ${scenario}.`,
  });
  const patchRun = ControlledPatchRunSchema.parse({
    id: stableId('m12_patch_run', stableSeed),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: now(),
    planId: plan.id,
    status: config.lifecycleStatus,
    attemptNumber: 1,
    changedFiles: config.changedFiles,
    changedFileCount: config.changedFiles.length,
    diffHash,
    diffLineCount,
    diffSummaryHash: diffHash ? stableHash(`diff-review:${stableSeed}`) : undefined,
    worktreePathHash: plan.worktreePathHash,
    rejectionReasons: config.rejectionReasons,
    evidenceRefs: [evidenceRefs[1]].filter(isDefined),
    auditEventIds: [auditEventIds[1]].filter(isDefined),
    fixtureOnly: true,
    codexPatchExecuted: false,
    noRealWrite: true,
    rawPathStored: false,
    bodyStored: false,
    processBoundaryInvoked: false,
    externalProcessStarted: false,
    metadata: {
      fixtureOnly: true,
      scenario,
      noLiveBoundary: true,
    },
    summary: `M12 fixture patch run is ${config.lifecycleStatus}.`,
  });
  const diffReview = DiffReviewSummarySchema.parse({
    id: stableId('m12_diff_review', stableSeed),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: now(),
    patchRunId: patchRun.id,
    status: config.diffReviewStatus,
    changedFileCount: config.changedFiles.length,
    diffHash,
    diffLineCount,
    findingCount: config.diffReviewStatus === 'passed' ? 0 : config.blockerCodes.length,
    reviewerLabel: 'orchestrator-kernel.m12-fixture',
    evidenceRefs: [evidenceRefs[2]].filter(isDefined),
    auditEventIds: [auditEventIds[2]].filter(isDefined),
    rawDiffStored: false,
    rawPathStored: false,
    bodyStored: false,
    noRealWrite: true,
    metadata: {
      fixtureOnly: true,
      scenario,
      noLiveBoundary: true,
    },
    summary: `M12 fixture diff review is ${config.diffReviewStatus}.`,
  });
  const readiness = ControlledPatchReadinessSchema.parse({
    id: stableId('m12_patch_readiness', stableSeed),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: now(),
    patchRunId: patchRun.id,
    status: config.readinessStatus,
    verificationStatus: config.verificationStatus,
    changedFileCount: config.changedFiles.length,
    blockerCount: config.blockerCodes.length,
    blockers: config.blockerCodes,
    readyForReviewDraftOnly: config.readyForReviewDraftOnly,
    pushAllowed: false,
    pullRequestOpened: false,
    evidenceRefs: [evidenceRefs[3]].filter(isDefined),
    auditEventIds: [auditEventIds[3]].filter(isDefined),
    rawPathStored: false,
    bodyStored: false,
    noRealWrite: true,
    metadata: {
      fixtureOnly: true,
      scenario,
      noLiveBoundary: true,
    },
    summary:
      config.readinessStatus === 'ready_for_review_draft_only'
        ? 'Patch is ready for local draft review only.'
        : `Patch readiness blocked as ${config.readinessStatus}.`,
  });

  return ControlledPatchLifecycleRunSchema.parse({
    id: stableId('m12_patch_lifecycle_run', stableSeed),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: now(),
    status: config.lifecycleStatus,
    plan,
    patchRun,
    diffReview,
    readiness,
    evidenceRefs,
    auditEventIds,
    evidenceRefIds: evidenceRefs.map((evidenceRef) => evidenceRef.id),
    auditEventCount: auditEventIds.length,
    fixtureOnly: true,
    codexPatchExecuted: false,
    noRealWrite: true,
    rawPathStored: false,
    bodyStored: false,
    processBoundaryInvoked: false,
    externalProcessStarted: false,
    pushAllowed: false,
    pullRequestOpened: false,
    metadata: {
      fixtureOnly: true,
      scenario,
      noLiveBoundary: true,
      noPush: true,
      noPullRequestOpened: true,
    },
    summary: `M12 controlled patch lifecycle fixture completed as ${config.lifecycleStatus}.`,
  });
}

function getScenarioConfig(
  scenario: M12PatchLifecycleScenario,
  changedFilesOverride?: string[],
): M12PatchLifecycleScenarioConfig {
  const changedFiles = changedFilesOverride ?? ['packages/orchestrator-kernel/src/m12-patch-lifecycle.ts'];

  switch (scenario) {
    case 'all-pass':
      return {
        lifecycleStatus: 'verified',
        readinessStatus: 'ready_for_review_draft_only',
        verificationStatus: 'passed',
        diffReviewStatus: 'passed',
        rejectionReasons: ['none'],
        changedFiles,
        readyForReviewDraftOnly: true,
        blockerCodes: [],
      };
    case 'verification-failed':
      return {
        lifecycleStatus: 'blocked',
        readinessStatus: 'blocked_verification_failed',
        verificationStatus: 'failed',
        diffReviewStatus: 'failed',
        rejectionReasons: ['verification_failed'],
        changedFiles,
        readyForReviewDraftOnly: false,
        blockerCodes: ['verification_failed'],
      };
    case 'policy-blocked':
      return {
        lifecycleStatus: 'blocked',
        readinessStatus: 'blocked_policy',
        verificationStatus: 'blocked',
        diffReviewStatus: 'blocked',
        rejectionReasons: ['policy_blocked'],
        changedFiles: [],
        readyForReviewDraftOnly: false,
        blockerCodes: ['policy_blocked'],
      };
    case 'codex-failed':
      return {
        lifecycleStatus: 'rejected',
        readinessStatus: 'not_ready_no_patch',
        verificationStatus: 'not_run',
        diffReviewStatus: 'blocked',
        rejectionReasons: ['codex_failed'],
        changedFiles: [],
        readyForReviewDraftOnly: false,
        blockerCodes: ['codex_failed'],
      };
    case 'aborted':
      return {
        lifecycleStatus: 'aborted',
        readinessStatus: 'blocked_policy',
        verificationStatus: 'aborted',
        diffReviewStatus: 'blocked',
        rejectionReasons: ['policy_blocked'],
        changedFiles: [],
        readyForReviewDraftOnly: false,
        blockerCodes: ['patch_lifecycle_aborted'],
      };
    case 'no-patch':
    default:
      return {
        lifecycleStatus: 'rejected',
        readinessStatus: 'not_ready_no_patch',
        verificationStatus: 'not_run',
        diffReviewStatus: 'blocked',
        rejectionReasons: ['empty_patch'],
        changedFiles: [],
        readyForReviewDraftOnly: false,
        blockerCodes: ['empty_patch'],
      };
  }
}

function createEvidenceRefs(seed: string, now: () => string): EvidenceRef[] {
  return [
    {
      id: stableId('evidence_m12_patch_plan', seed),
      schemaVersion: SchemaVersionSchema.value,
      createdAt: now(),
      kind: 'patch.lifecycle_plan',
      hash: stableHash(`plan:${seed}`),
      summary: 'M12 fixture patch plan evidence.',
      redacted: true,
      labels: [],
    },
    {
      id: stableId('evidence_m12_patch_run', seed),
      schemaVersion: SchemaVersionSchema.value,
      createdAt: now(),
      kind: 'patch.lifecycle_run_summary',
      hash: stableHash(`run:${seed}`),
      summary: 'M12 fixture patch run evidence.',
      redacted: true,
      labels: [],
    },
    {
      id: stableId('evidence_m12_diff_review', seed),
      schemaVersion: SchemaVersionSchema.value,
      createdAt: now(),
      kind: 'patch.diff_review_summary',
      hash: stableHash(`review:${seed}`),
      summary: 'M12 fixture diff review evidence.',
      redacted: true,
      labels: [],
    },
    {
      id: stableId('evidence_m12_readiness', seed),
      schemaVersion: SchemaVersionSchema.value,
      createdAt: now(),
      kind: 'patch.readiness_summary',
      hash: stableHash(`readiness:${seed}`),
      summary: 'M12 fixture readiness evidence.',
      redacted: true,
      labels: [],
    },
  ];
}

function stableHash(value: string): string {
  return `sha256:${hashText(value)}`;
}

function stableId(prefix: string, value: string): string {
  return `${prefix}_${hashText(value).slice(0, 16)}`;
}

function isDefined<T>(value: T | undefined): value is T {
  return value !== undefined;
}

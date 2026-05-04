import {
  createGovernedCodexPatchAdapterResult,
  createGovernedCodexPatchPlan,
  type GovernedCodexPatchAdapterResult,
} from '@codexhub/codex-exec-adapter';
import {
  type ControlledPatchLifecycleRun,
  ControlledPatchLifecycleRunSchema,
  type ControlledPatchLifecycleStatus,
  ControlledPatchPlanSchema,
  ControlledPatchReadinessSchema,
  type ControlledPatchReadinessStatus,
  type ControlledPatchRejectionReason,
  ControlledPatchRunSchema,
  type ControlledPatchVerificationGate,
  ControlledPatchVerificationGateSchema,
  type ControlledPatchVerificationStatus,
  DiffReviewSummarySchema,
  type DiffReviewStatus,
  type EvidenceRef,
  type GovernedCodexPatchRunStatus,
  SchemaVersionSchema,
  type VerificationRun,
  VerificationRunSchema,
  type VerificationTarget,
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

export interface M12GovernedCodexPatchInWorktreeInput {
  status?: GovernedCodexPatchRunStatus;
  requestId?: string;
  dryRunId?: string;
  policyDecisionId?: string;
  approvalArtifactId?: string;
  worktreeRunId?: string;
  worktreePathLabel?: string;
  governedInputLabel?: string;
  changedFiles?: string[];
  now?: () => string;
}

export interface M12GovernedCodexPatchInWorktreeResult {
  codexPatch: GovernedCodexPatchAdapterResult;
  lifecycle: ControlledPatchLifecycleRun;
}

export interface M12PatchVerificationReadinessGateInput
  extends M12GovernedCodexPatchInWorktreeInput {
  verificationStatus?: Exclude<ControlledPatchVerificationStatus, 'not_run'>;
  targets?: VerificationTarget[];
  affectedProjects?: string[];
  processBoundaryInvoked?: boolean;
  externalProcessStarted?: boolean;
}

export interface M12PatchVerificationReadinessGateResult {
  codexPatch: GovernedCodexPatchAdapterResult;
  verificationRun: VerificationRun;
  verificationGate: ControlledPatchVerificationGate;
  lifecycle: ControlledPatchLifecycleRun;
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

export function runM12GovernedCodexPatchInWorktree(
  input: M12GovernedCodexPatchInWorktreeInput = {},
): M12GovernedCodexPatchInWorktreeResult {
  const status = input.status ?? 'completed';
  const now = input.now ?? foundationTimestamp;
  const stableSeed = [
    'm12b',
    status,
    input.requestId ?? 'request:m12b',
    input.worktreeRunId ?? 'worktree:m12b',
    input.worktreePathLabel ?? 'worktree:path:m12b',
  ].join(':');
  const plan = createGovernedCodexPatchPlan({
    dryRunIdHash: stableHash(input.dryRunId ?? 'dry-run:m12b'),
    policyDecisionIdHash: stableHash(input.policyDecisionId ?? 'policy:m12b'),
    approvalArtifactIdHash: stableHash(input.approvalArtifactId ?? 'approval:m12b'),
    worktreeRunIdHash: stableHash(input.worktreeRunId ?? 'worktree:m12b'),
    worktreePathHash: stableHash(input.worktreePathLabel ?? 'worktree:path:m12b'),
    governedInputHash: stableHash(input.governedInputLabel ?? 'governed-input:m12b'),
    expectedInputHash: stableHash(input.governedInputLabel ?? 'governed-input:m12b'),
    metadata: {
      stage: 'm12b',
      source: 'orchestrator-kernel.m12-governed-codex-patch',
    },
  });
  const codexPatch = createGovernedCodexPatchAdapterResult({
    plan,
    status,
    changedFiles: input.changedFiles ?? defaultGovernedChangedFiles(status),
    actor: 'orchestrator-kernel.m12b',
    policyDecisionId: input.policyDecisionId ?? 'policy_m12b',
    metadata: {
      stage: 'm12b',
      source: 'orchestrator-kernel.m12-governed-codex-patch',
    },
  });
  const lifecycle = createLifecycleFromGovernedCodexPatch({
    codexPatch,
    stableSeed,
    now,
  });

  return {
    codexPatch,
    lifecycle,
  };
}

export function runM12PatchVerificationReadinessGate(
  input: M12PatchVerificationReadinessGateInput = {},
): M12PatchVerificationReadinessGateResult {
  const verificationStatus = input.verificationStatus ?? 'passed';
  const governedPatch = runM12GovernedCodexPatchInWorktree({
    ...input,
    status: input.status ?? 'completed',
  });
  const now = input.now ?? foundationTimestamp;
  const stableSeed = [
    'm12c',
    verificationStatus,
    governedPatch.lifecycle.id,
    input.requestId ?? 'request:m12c',
  ].join(':');
  const boundaryInvoked =
    input.processBoundaryInvoked ?? (governedPatch.codexPatch.run.status === 'completed');
  const externalProcessStarted =
    input.externalProcessStarted ?? (boundaryInvoked && verificationStatus !== 'blocked');
  const targets = input.targets ?? ['lint', 'test', 'build'];
  const affectedProjects = input.affectedProjects ?? defaultAffectedProjects(verificationStatus);
  const verificationRun = createM12cVerificationRun({
    status: verificationStatus,
    stableSeed,
    now,
    targets,
    affectedProjects,
    processBoundaryInvoked: boundaryInvoked,
    externalProcessStarted,
  });
  const verificationEvidence =
    verificationRun.evidenceRefs?.[0] ?? createVerificationEvidenceRef(stableSeed, now);
  const verificationGate = ControlledPatchVerificationGateSchema.parse({
    id: stableId('m12c_verification_gate', stableSeed),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: now(),
    patchRunId: governedPatch.lifecycle.patchRun.id,
    lifecycleRunIdHash: stableHash(governedPatch.lifecycle.id),
    verificationRunId: verificationRun.id,
    verificationStatus,
    targets,
    changedFileCount: governedPatch.lifecycle.patchRun.changedFileCount,
    affectedProjectCount: affectedProjects.length,
    commandResultCount: verificationRun.commandResults?.length ?? 0,
    readyForReviewDraftOnly:
      verificationStatus === 'passed' && governedPatch.lifecycle.patchRun.changedFileCount > 0,
    pushAllowed: false,
    pullRequestOpened: false,
    processBoundaryInvoked: boundaryInvoked,
    externalProcessStarted,
    noRealWrite: true,
    rawPathStored: false,
    bodyStored: false,
    evidenceRefs: [verificationEvidence],
    auditEventIds: [stableId('audit_m12c_verification_gate', stableSeed)],
    metadata: {
      stage: 'm12c',
      verificationOutputStored: false,
      rawCommandStored: false,
      rawPathStored: false,
    },
    summary:
      verificationStatus === 'passed'
        ? 'M12c verification gate passed; local PR draft readiness is allowed.'
        : `M12c verification gate ${verificationStatus}; PR draft remains blocked.`,
  });
  const lifecycle = createLifecycleFromVerificationGate({
    base: governedPatch.lifecycle,
    verificationRun,
    verificationGate,
    stableSeed,
    now,
  });

  return {
    codexPatch: governedPatch.codexPatch,
    verificationRun,
    verificationGate,
    lifecycle,
  };
}

function createLifecycleFromGovernedCodexPatch(input: {
  codexPatch: GovernedCodexPatchAdapterResult;
  stableSeed: string;
  now: () => string;
}): ControlledPatchLifecycleRun {
  const { codexPatch, stableSeed, now } = input;
  const config = getGovernedPatchConfig(codexPatch.run);
  const evidenceRefs = [
    ...codexPatch.evidenceRefs,
    ...createEvidenceRefs(`${stableSeed}:lifecycle`, now),
  ];
  const lifecycleAuditEventIds = [
    stableId('audit_m12b_patch_plan', stableSeed),
    stableId('audit_m12b_patch_run', stableSeed),
    stableId('audit_m12b_diff_review', stableSeed),
    stableId('audit_m12b_readiness', stableSeed),
  ];
  const auditEventIds = [
    ...codexPatch.auditEvents.map((auditEvent) => auditEvent.id),
    ...lifecycleAuditEventIds,
  ];
  const changedFileHashes = codexPatch.run.changedFiles.map((filePath) => stableHash(filePath));
  const plan = ControlledPatchPlanSchema.parse({
    id: stableId('m12b_patch_plan', stableSeed),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: now(),
    requestIdHash: stableHash(`${stableSeed}:request`),
    worktreeRunIdHash: codexPatch.plan.worktreeRunIdHash,
    worktreePathHash: codexPatch.plan.worktreePathHash,
    plannedChangedFileCount: codexPatch.run.changedFileCount,
    plannedChangedFilePathHashes: changedFileHashes,
    patchBodyHash: codexPatch.run.diffHash,
    codexPatchAllowed: true,
    fixtureOnly: false,
    noRealWrite: true,
    rawPathStored: false,
    bodyStored: false,
    processBoundaryInvoked: false,
    externalProcessStarted: false,
    metadata: {
      stage: 'm12b',
      codexPatchPlanIdHash: stableHash(codexPatch.plan.id),
      noPush: true,
      noPullRequestOpened: true,
    },
    summary: 'M12b governed Codex patch plan is bound to the approved isolated worktree.',
  });
  const patchRun = ControlledPatchRunSchema.parse({
    id: stableId('m12b_patch_run', stableSeed),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: now(),
    planId: plan.id,
    status: config.lifecycleStatus,
    attemptNumber: 1,
    changedFiles: codexPatch.run.changedFiles,
    changedFileCount: codexPatch.run.changedFileCount,
    diffHash: codexPatch.run.diffHash,
    diffLineCount: codexPatch.run.diffLineCount,
    diffSummaryHash: codexPatch.run.diffHash
      ? stableHash(`m12b:diff-review:${codexPatch.run.diffHash}`)
      : undefined,
    worktreePathHash: codexPatch.plan.worktreePathHash,
    rejectionReasons: config.rejectionReasons,
    evidenceRefs: codexPatch.evidenceRefs,
    auditEventIds: codexPatch.auditEvents.map((auditEvent) => auditEvent.id),
    fixtureOnly: false,
    codexPatchExecuted: codexPatch.run.codexPatchExecuted,
    noRealWrite: !codexPatch.run.realWriteExecuted,
    rawPathStored: false,
    bodyStored: false,
    processBoundaryInvoked: codexPatch.run.processBoundaryInvoked,
    externalProcessStarted: codexPatch.run.externalProcessStarted,
    metadata: {
      stage: 'm12b',
      writeScope: codexPatch.run.writeScope,
      repoRootWriteAllowed: false,
      pushAllowed: false,
      pullRequestOpened: false,
    },
    summary: `M12b patch run is ${config.lifecycleStatus}; PR readiness awaits verification.`,
  });
  const diffReview = DiffReviewSummarySchema.parse({
    id: stableId('m12b_diff_review', stableSeed),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: now(),
    patchRunId: patchRun.id,
    status: config.diffReviewStatus,
    changedFileCount: codexPatch.run.changedFileCount,
    diffHash: codexPatch.run.diffHash,
    diffLineCount: codexPatch.run.diffLineCount,
    findingCount: config.blockerCodes.length,
    reviewerLabel: 'orchestrator-kernel.m12b-governed-codex-patch',
    evidenceRefs: codexPatch.evidenceRefs,
    auditEventIds: codexPatch.auditEvents.map((auditEvent) => auditEvent.id),
    rawDiffStored: false,
    rawPathStored: false,
    bodyStored: false,
    noRealWrite: true,
    metadata: {
      stage: 'm12b',
      verificationPending: config.verificationStatus === 'not_run',
    },
    summary: `M12b diff review is ${config.diffReviewStatus}; raw diff is not stored.`,
  });
  const readiness = ControlledPatchReadinessSchema.parse({
    id: stableId('m12b_patch_readiness', stableSeed),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: now(),
    patchRunId: patchRun.id,
    status: config.readinessStatus,
    verificationStatus: config.verificationStatus,
    changedFileCount: codexPatch.run.changedFileCount,
    blockerCount: config.blockerCodes.length,
    blockers: config.blockerCodes,
    readyForReviewDraftOnly: false,
    pushAllowed: false,
    pullRequestOpened: false,
    evidenceRefs: codexPatch.evidenceRefs,
    auditEventIds: codexPatch.auditEvents.map((auditEvent) => auditEvent.id),
    rawPathStored: false,
    bodyStored: false,
    noRealWrite: true,
    metadata: {
      stage: 'm12b',
      verificationPending: config.verificationStatus === 'not_run',
    },
    summary:
      config.readinessStatus === 'not_ready_pending_verification'
        ? 'Patch metadata exists, but Nx verification has not run yet.'
        : `Patch readiness is ${config.readinessStatus}.`,
  });

  return ControlledPatchLifecycleRunSchema.parse({
    id: stableId('m12b_patch_lifecycle_run', stableSeed),
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
    fixtureOnly: false,
    codexPatchExecuted: codexPatch.run.codexPatchExecuted,
    noRealWrite: !codexPatch.run.realWriteExecuted,
    rawPathStored: false,
    bodyStored: false,
    processBoundaryInvoked: codexPatch.run.processBoundaryInvoked,
    externalProcessStarted: codexPatch.run.externalProcessStarted,
    pushAllowed: false,
    pullRequestOpened: false,
    metadata: {
      stage: 'm12b',
      writeScope: codexPatch.run.writeScope,
      repoRootWriteAllowed: false,
      noPush: true,
      noPullRequestOpened: true,
    },
    summary: `M12b governed Codex patch lifecycle is ${config.lifecycleStatus}.`,
  });
}

function createLifecycleFromVerificationGate(input: {
  base: ControlledPatchLifecycleRun;
  verificationRun: VerificationRun;
  verificationGate: ControlledPatchVerificationGate;
  stableSeed: string;
  now: () => string;
}): ControlledPatchLifecycleRun {
  const { base, verificationRun, verificationGate, stableSeed, now } = input;
  const config = getVerificationGateConfig(verificationGate.verificationStatus);
  const evidenceRefs = [
    ...base.evidenceRefs,
    ...(verificationRun.evidenceRefs ?? []),
    ...verificationGate.evidenceRefs,
  ];
  const auditEventIds = [
    ...base.auditEventIds,
    ...(verificationRun.auditEventIds ?? []),
    ...verificationGate.auditEventIds,
  ];
  const patchRun = ControlledPatchRunSchema.parse({
    ...base.patchRun,
    status: config.lifecycleStatus,
    rejectionReasons: config.rejectionReasons,
    summary: `M12c patch run is ${config.lifecycleStatus} after verification gate.`,
  });
  const diffReview = DiffReviewSummarySchema.parse({
    ...base.diffReview,
    id: stableId('m12c_diff_review', stableSeed),
    status: config.diffReviewStatus,
    findingCount: config.blockerCodes.length,
    evidenceRefs: verificationGate.evidenceRefs,
    auditEventIds: verificationGate.auditEventIds,
    metadata: {
      stage: 'm12c',
      verificationRunIdHash: stableHash(verificationRun.id),
      rawDiffStored: false,
    },
    summary: `M12c diff review is ${config.diffReviewStatus} after Nx verification.`,
  });
  const readiness = ControlledPatchReadinessSchema.parse({
    ...base.readiness,
    id: stableId('m12c_patch_readiness', stableSeed),
    status: config.readinessStatus,
    verificationStatus: verificationGate.verificationStatus,
    blockerCount: config.blockerCodes.length,
    blockers: config.blockerCodes,
    readyForReviewDraftOnly: config.readyForReviewDraftOnly,
    evidenceRefs: verificationGate.evidenceRefs,
    auditEventIds: verificationGate.auditEventIds,
    metadata: {
      stage: 'm12c',
      verificationRunIdHash: stableHash(verificationRun.id),
      pushAllowed: false,
      pullRequestOpened: false,
    },
    summary:
      config.readinessStatus === 'ready_for_review_draft_only'
        ? 'Patch passed verification and is ready for local PR draft review only.'
        : `Patch readiness remains ${config.readinessStatus}.`,
  });

  return ControlledPatchLifecycleRunSchema.parse({
    ...base,
    id: stableId('m12c_patch_lifecycle_run', stableSeed),
    createdAt: now(),
    status: config.lifecycleStatus,
    patchRun,
    diffReview,
    readiness,
    evidenceRefs,
    auditEventIds,
    evidenceRefIds: evidenceRefs.map((evidenceRef) => evidenceRef.id),
    auditEventCount: auditEventIds.length,
    metadata: {
      stage: 'm12c',
      verificationRunIdHash: stableHash(verificationRun.id),
      verificationStatus: verificationGate.verificationStatus,
      repoRootWriteAllowed: false,
      noPush: true,
      noPullRequestOpened: true,
    },
    summary: `M12c verification-gated patch lifecycle is ${config.lifecycleStatus}.`,
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

function getGovernedPatchConfig(
  run: GovernedCodexPatchAdapterResult['run'],
): M12PatchLifecycleScenarioConfig {
  if (run.status === 'completed') {
    return {
      lifecycleStatus: 'generated',
      readinessStatus: 'not_ready_pending_verification',
      verificationStatus: 'not_run',
      diffReviewStatus: 'blocked',
      rejectionReasons: ['pending_verification'],
      changedFiles: run.changedFiles,
      readyForReviewDraftOnly: false,
      blockerCodes: ['verification_pending'],
    };
  }

  if (run.status === 'failed') {
    return {
      lifecycleStatus: 'rejected',
      readinessStatus: 'not_ready_no_patch',
      verificationStatus: 'not_run',
      diffReviewStatus: 'failed',
      rejectionReasons: ['codex_failed'],
      changedFiles: [],
      readyForReviewDraftOnly: false,
      blockerCodes: ['codex_failed'],
    };
  }

  if (run.status === 'aborted') {
    return {
      lifecycleStatus: 'aborted',
      readinessStatus: 'blocked_policy',
      verificationStatus: 'aborted',
      diffReviewStatus: 'blocked',
      rejectionReasons: ['policy_blocked'],
      changedFiles: [],
      readyForReviewDraftOnly: false,
      blockerCodes: ['codex_patch_aborted'],
    };
  }

  return {
    lifecycleStatus: 'blocked',
    readinessStatus: 'blocked_policy',
    verificationStatus: 'blocked',
    diffReviewStatus: 'blocked',
    rejectionReasons: ['policy_blocked'],
    changedFiles: [],
    readyForReviewDraftOnly: false,
    blockerCodes: ['codex_patch_blocked'],
  };
}

function getVerificationGateConfig(
  verificationStatus: Exclude<ControlledPatchVerificationStatus, 'not_run'>,
): M12PatchLifecycleScenarioConfig {
  if (verificationStatus === 'passed') {
    return {
      lifecycleStatus: 'verified',
      readinessStatus: 'ready_for_review_draft_only',
      verificationStatus: 'passed',
      diffReviewStatus: 'passed',
      rejectionReasons: ['none'],
      changedFiles: [],
      readyForReviewDraftOnly: true,
      blockerCodes: [],
    };
  }

  if (verificationStatus === 'failed') {
    return {
      lifecycleStatus: 'blocked',
      readinessStatus: 'blocked_verification_failed',
      verificationStatus: 'failed',
      diffReviewStatus: 'failed',
      rejectionReasons: ['verification_failed'],
      changedFiles: [],
      readyForReviewDraftOnly: false,
      blockerCodes: ['verification_failed'],
    };
  }

  if (verificationStatus === 'aborted') {
    return {
      lifecycleStatus: 'aborted',
      readinessStatus: 'blocked_policy',
      verificationStatus: 'aborted',
      diffReviewStatus: 'blocked',
      rejectionReasons: ['verification_failed'],
      changedFiles: [],
      readyForReviewDraftOnly: false,
      blockerCodes: ['verification_aborted'],
    };
  }

  return {
    lifecycleStatus: 'blocked',
    readinessStatus: 'blocked_policy',
    verificationStatus: 'blocked',
    diffReviewStatus: 'blocked',
    rejectionReasons: ['policy_blocked'],
    changedFiles: [],
    readyForReviewDraftOnly: false,
    blockerCodes: ['verification_blocked'],
  };
}

function createM12cVerificationRun(input: {
  status: Exclude<ControlledPatchVerificationStatus, 'not_run'>;
  stableSeed: string;
  now: () => string;
  targets: readonly VerificationTarget[];
  affectedProjects: readonly string[];
  processBoundaryInvoked: boolean;
  externalProcessStarted: boolean;
}): VerificationRun {
  const evidenceRef = createVerificationEvidenceRef(input.stableSeed, input.now);
  const commandResults =
    input.processBoundaryInvoked && input.status !== 'blocked'
      ? [
          {
            id: stableId('m12c_affected_projects_command', input.stableSeed),
            schemaVersion: SchemaVersionSchema.value,
            createdAt: input.now(),
            commandKind: 'affected-projects' as const,
            targets: [],
            status: 'completed' as const,
            exitCode: 0,
            stdoutHash: stableHash(`affected:${input.stableSeed}`),
            stderrHash: stableHash(''),
            stdoutLineCount: input.affectedProjects.length,
            stderrLineCount: 0,
            outputBodyStored: false as const,
            processBoundaryInvoked: true as const,
            externalProcessStarted: input.externalProcessStarted,
            summary: 'M12c affected projects command stores hashes and counts only.',
          },
          {
            id: stableId('m12c_verification_command', input.stableSeed),
            schemaVersion: SchemaVersionSchema.value,
            createdAt: input.now(),
            commandKind: 'verification' as const,
            targets: [...input.targets],
            status:
              input.status === 'passed'
                ? ('completed' as const)
                : input.status === 'aborted'
                  ? ('aborted' as const)
                  : ('failed' as const),
            exitCode: input.status === 'passed' ? 0 : 1,
            stdoutHash: stableHash(`verification:${input.status}:${input.stableSeed}`),
            stderrHash: stableHash(`verification-stderr:${input.status}`),
            stdoutLineCount: input.status === 'passed' ? 1 : 0,
            stderrLineCount: input.status === 'passed' ? 0 : 1,
            outputBodyStored: false as const,
            processBoundaryInvoked: true as const,
            externalProcessStarted: input.externalProcessStarted,
            summary: `M12c verification command ${input.status}; output body is not stored.`,
          },
        ]
      : [];

  return VerificationRunSchema.parse({
    id: stableId('m12c_verification_run', input.stableSeed),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: input.now(),
    targetId: stableId('m12c_patch_target', input.stableSeed),
    status: input.status,
    checks: input.targets,
    evidenceRefs: [evidenceRef],
    planId: stableId('m12c_verification_plan', input.stableSeed),
    affectedProjects: input.affectedProjects.map((projectName) => ({
      id: stableId('m12c_affected_project', `${input.stableSeed}:${projectName}`),
      schemaVersion: SchemaVersionSchema.value,
      createdAt: input.now(),
      name: projectName,
      nameHash: stableHash(projectName),
    })),
    commandResults,
    processBoundaryInvoked: input.processBoundaryInvoked,
    externalProcessStarted: input.externalProcessStarted,
    noRealWrite: true,
    auditEventIds: [stableId('audit_m12c_verification_run', input.stableSeed)],
    summary: `M12c Nx verification ${input.status}.`,
  });
}

function createVerificationEvidenceRef(seed: string, now: () => string): EvidenceRef {
  return {
    id: stableId('evidence_m12c_verification', seed),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: now(),
    kind: 'verification.run_summary',
    hash: stableHash(`verification:${seed}`),
    summary: 'M12c verification run evidence stores hashes and counts only.',
    redacted: true,
    labels: [],
  };
}

function defaultAffectedProjects(
  status: Exclude<ControlledPatchVerificationStatus, 'not_run'>,
): string[] {
  return status === 'blocked' ? [] : ['orchestrator-kernel', 'contracts'];
}

function defaultGovernedChangedFiles(status: GovernedCodexPatchRunStatus): string[] {
  return status === 'completed'
    ? ['packages/orchestrator-kernel/src/m12-patch-lifecycle.ts']
    : [];
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

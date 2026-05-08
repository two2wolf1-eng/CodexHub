import {
  CodexTaskClosureRunSchema,
  CodexTaskDiffSummaryProjectionSchema,
  CodexTaskGithubClosureProjectionSchema,
  CodexTaskReviewProjectionSchema,
  CodexTaskRunSchema,
  CodexTaskVerificationProjectionSchema,
  SchemaVersionSchema,
  foundationTimestamp,
  type CodexTaskClosureRun,
  type CodexTaskDiffSummaryProjection,
  type CodexTaskGithubClosureProjection,
  type CodexTaskReviewProjection,
  type CodexTaskRun,
  type CodexTaskVerificationProjection,
  type GithubBranchPublishPlan,
  type GithubDraftPrPlan,
  type LocalReviewPackageRun,
} from '@codexhub/contracts';
import { hashText } from '@codexhub/evidence-kernel';

export interface TaskClosureDiffSummaryInput {
  taskRun: CodexTaskRun;
  pathHashes?: readonly string[];
  fileCount?: number;
  diffHash?: string;
  diffSummaryHash?: string;
  status?: CodexTaskDiffSummaryProjection['status'];
  observedAt?: string;
  evidenceRefIds?: readonly string[];
  auditEventIds?: readonly string[];
}

export interface TaskClosureVerificationInput {
  taskRun: CodexTaskRun;
  status?: CodexTaskVerificationProjection['status'];
  targetCount?: number;
  passedCount?: number;
  failedCount?: number;
  skippedCount?: number;
  verificationRunId?: string;
  verificationRunIdHash?: string;
  commandSummaryHash?: string;
  outputSummaryHash?: string;
  processBoundaryInvoked?: boolean;
  externalProcessStarted?: boolean;
  createdAt?: string;
  evidenceRefIds?: readonly string[];
  auditEventIds?: readonly string[];
}

export interface TaskClosureReviewInput {
  taskRun: CodexTaskRun;
  reviewPackage?: LocalReviewPackageRun;
  status?: CodexTaskReviewProjection['status'];
  reviewPackageIdHash?: string;
  packageHash?: string;
  findingCount?: number;
  blockerCount?: number;
  readyForReviewDraftOnly?: boolean;
  createdAt?: string;
  evidenceRefIds?: readonly string[];
  auditEventIds?: readonly string[];
}

export interface TaskClosureGithubInput {
  taskRun: CodexTaskRun;
  branchPublishPlan?: GithubBranchPublishPlan;
  draftPrPlan?: GithubDraftPrPlan;
  branchPublishPlanIdHash?: string;
  draftPrPlanIdHash?: string;
  ciStatus?: CodexTaskGithubClosureProjection['ciStatus'];
  blocked?: boolean;
  approvalWaiting?: boolean;
  createdAt?: string;
  evidenceRefIds?: readonly string[];
  auditEventIds?: readonly string[];
}

export interface TaskClosureRunInput {
  taskRun: CodexTaskRun;
  diffSummary: CodexTaskDiffSummaryProjection;
  verification: CodexTaskVerificationProjection;
  review: CodexTaskReviewProjection;
  githubClosure: CodexTaskGithubClosureProjection;
  branchPublishDryRunId?: string;
  draftPrDryRunId?: string;
  createdAt?: string;
  evidenceRefIds?: readonly string[];
  auditEventIds?: readonly string[];
}

export interface TaskClosureProjectionBundle {
  diffSummary: CodexTaskDiffSummaryProjection;
  verification: CodexTaskVerificationProjection;
  review: CodexTaskReviewProjection;
  githubClosure: CodexTaskGithubClosureProjection;
  closureRun: CodexTaskClosureRun;
  taskRun: CodexTaskRun;
  metadataOnly: true;
  rawPromptStored: false;
  rawDiffStored: false;
  rawPathStored: false;
  rawBodyStored: false;
  liveRemoteWriteAllowed: false;
  externalProcessStarted: boolean;
}

export function createTaskClosureDiffSummary(
  input: TaskClosureDiffSummaryInput,
): CodexTaskDiffSummaryProjection {
  const observedAt = input.observedAt ?? foundationTimestamp();
  const pathHashes = dedupeHashes(input.pathHashes ?? []);
  const fileCount = input.fileCount ?? pathHashes.length;
  const diffHash = input.diffHash ? normalizeHash(input.diffHash) : undefined;
  const status =
    input.status ??
    (pathHashes.length === 0 && !diffHash ? 'empty' : diffHash ? 'changed' : 'blocked');
  const seed = `${input.taskRun.id}:${status}:${pathHashes.join(',')}:${diffHash ?? 'no-diff'}`;

  return CodexTaskDiffSummaryProjectionSchema.parse({
    id: stableId('codex_task_diff_summary', seed),
    schemaVersion: SchemaVersionSchema.value,
    observedAt,
    taskRunId: input.taskRun.id,
    status,
    fileCount,
    pathHashCount: pathHashes.length,
    pathHashes,
    diffHash,
    diffSummaryHash: input.diffSummaryHash ? normalizeHash(input.diffSummaryHash) : undefined,
    emptyDiff: status === 'empty',
    sourceHash: stableHash(seed),
    evidenceRefIds: [...(input.evidenceRefIds ?? input.taskRun.evidenceRefIds)],
    auditEventIds: [...(input.auditEventIds ?? input.taskRun.auditEventIds)],
    summary:
      status === 'changed'
        ? 'Task diff summary stores changed file hashes and a diff hash only.'
        : `Task diff summary is ${status} and stores no raw diff or path.`,
  });
}

export function createTaskClosureVerificationProjection(
  input: TaskClosureVerificationInput,
): CodexTaskVerificationProjection {
  const createdAt = input.createdAt ?? foundationTimestamp();
  const targetCount = input.targetCount ?? 0;
  const passedCount = input.passedCount ?? 0;
  const failedCount = input.failedCount ?? 0;
  const skippedCount = input.skippedCount ?? 0;
  const status =
    input.status ??
    (failedCount > 0
      ? 'failed'
      : targetCount > 0 && passedCount + skippedCount >= targetCount
        ? 'passed'
        : targetCount > 0
          ? 'planned'
          : 'not_run');
  const seed = `${input.taskRun.id}:${status}:${targetCount}:${passedCount}:${failedCount}:${skippedCount}`;

  return CodexTaskVerificationProjectionSchema.parse({
    id: stableId('codex_task_verification', seed),
    schemaVersion: SchemaVersionSchema.value,
    createdAt,
    taskRunId: input.taskRun.id,
    status,
    targetCount,
    passedCount,
    failedCount,
    skippedCount,
    verificationRunIdHash: input.verificationRunIdHash
      ? normalizeHash(input.verificationRunIdHash)
      : input.verificationRunId
        ? stableHash(input.verificationRunId)
        : undefined,
    commandSummaryHash: input.commandSummaryHash
      ? normalizeHash(input.commandSummaryHash)
      : undefined,
    outputSummaryHash: input.outputSummaryHash ? normalizeHash(input.outputSummaryHash) : undefined,
    processBoundaryInvoked: input.processBoundaryInvoked ?? false,
    externalProcessStarted: input.externalProcessStarted ?? false,
    evidenceRefIds: [...(input.evidenceRefIds ?? input.taskRun.evidenceRefIds)],
    auditEventIds: [...(input.auditEventIds ?? input.taskRun.auditEventIds)],
    summary: `Task verification projection is ${status}; output is represented by hashes and counts only.`,
  });
}

export function createTaskClosureReviewProjection(
  input: TaskClosureReviewInput,
): CodexTaskReviewProjection {
  const createdAt = input.createdAt ?? foundationTimestamp();
  const packageSummary = input.reviewPackage?.packageSummary;
  const status =
    input.status ??
    (packageSummary?.status === 'ready_for_review'
      ? 'ready_for_review'
      : packageSummary?.status === 'blocked_verification'
        ? 'blocked_verification'
        : packageSummary?.status === 'blocked_patch'
          ? 'blocked_patch'
          : 'pending');
  const findingCount = input.findingCount ?? input.reviewPackage?.findings.length ?? 0;
  const blockerCount =
    input.blockerCount ??
    input.reviewPackage?.findings.filter((finding) => finding.severity === 'blocker').length ??
    (status === 'ready_for_review' ? 0 : Math.min(1, findingCount));
  const readyForReviewDraftOnly =
    input.readyForReviewDraftOnly ?? packageSummary?.readyForReviewDraftOnly ?? false;
  const seed = `${input.taskRun.id}:${status}:${packageSummary?.packageHash ?? 'no-package'}`;

  return CodexTaskReviewProjectionSchema.parse({
    id: stableId('codex_task_review', seed),
    schemaVersion: SchemaVersionSchema.value,
    createdAt,
    taskRunId: input.taskRun.id,
    status,
    reviewPackageIdHash: input.reviewPackageIdHash
      ? normalizeHash(input.reviewPackageIdHash)
      : input.reviewPackage
        ? stableHash(input.reviewPackage.id)
        : undefined,
    packageHash: input.packageHash
      ? normalizeHash(input.packageHash)
      : packageSummary?.packageHash,
    findingCount,
    blockerCount,
    readyForReviewDraftOnly,
    evidenceRefIds: [...(input.evidenceRefIds ?? input.taskRun.evidenceRefIds)],
    auditEventIds: [...(input.auditEventIds ?? input.taskRun.auditEventIds)],
    summary:
      status === 'ready_for_review'
        ? 'Task review projection is ready for draft-only human review.'
        : `Task review projection is ${status}.`,
  });
}

export function createTaskClosureGithubProjection(
  input: TaskClosureGithubInput,
): CodexTaskGithubClosureProjection {
  const createdAt = input.createdAt ?? foundationTimestamp();
  const branchPlanHash = input.branchPublishPlanIdHash
    ? normalizeHash(input.branchPublishPlanIdHash)
    : input.branchPublishPlan
      ? stableHash(input.branchPublishPlan.id)
      : undefined;
  const draftPrPlanHash = input.draftPrPlanIdHash
    ? normalizeHash(input.draftPrPlanIdHash)
    : input.draftPrPlan
      ? stableHash(input.draftPrPlan.id)
      : undefined;
  const branchDryRunPlanned = Boolean(branchPlanHash);
  const draftDryRunPlanned = Boolean(draftPrPlanHash);
  const ciStatus = input.ciStatus ?? 'not_run';
  const status = input.blocked
    ? 'blocked'
    : input.approvalWaiting
      ? 'approval_waiting'
      : ciStatus === 'pending'
        ? 'ci_pending'
        : ciStatus === 'passed'
          ? 'ci_passed'
          : ciStatus === 'failed'
            ? 'ci_failed'
            : branchDryRunPlanned || draftDryRunPlanned
              ? 'dry_run_planned'
              : 'not_started';
  const seed = `${input.taskRun.id}:${status}:${branchPlanHash ?? 'no-branch'}:${draftPrPlanHash ?? 'no-pr'}`;

  return CodexTaskGithubClosureProjectionSchema.parse({
    id: stableId('codex_task_github_closure', seed),
    schemaVersion: SchemaVersionSchema.value,
    createdAt,
    taskRunId: input.taskRun.id,
    status,
    branchPublishPlanIdHash: branchPlanHash,
    draftPrPlanIdHash: draftPrPlanHash,
    ciStatus,
    dryRunOnly: true,
    approvalRequired: branchDryRunPlanned || draftDryRunPlanned,
    remoteWriteAllowed: false,
    branchPublishDryRunPlanned: branchDryRunPlanned,
    draftPrDryRunPlanned: draftDryRunPlanned,
    evidenceRefIds: [...(input.evidenceRefIds ?? input.taskRun.evidenceRefIds)],
    auditEventIds: [...(input.auditEventIds ?? input.taskRun.auditEventIds)],
    summary:
      status === 'dry_run_planned'
        ? 'GitHub closure projection planned branch/draft PR dry-runs only.'
        : `GitHub closure projection is ${status}.`,
  });
}

export function createTaskClosureRun(input: TaskClosureRunInput): CodexTaskClosureRun {
  const createdAt = input.createdAt ?? foundationTimestamp();
  const status = classifyClosureRunStatus(input);
  const branchPublishDryRunIdHash = input.branchPublishDryRunId
    ? stableHash(input.branchPublishDryRunId)
    : input.githubClosure.branchPublishPlanIdHash;
  const draftPrDryRunIdHash = input.draftPrDryRunId
    ? stableHash(input.draftPrDryRunId)
    : input.githubClosure.draftPrPlanIdHash;
  const closureHash = stableHash(
    JSON.stringify({
      taskRunId: input.taskRun.id,
      diffSummaryId: input.diffSummary.id,
      verificationProjectionId: input.verification.id,
      reviewProjectionId: input.review.id,
      githubClosureProjectionId: input.githubClosure.id,
      ciStatus: input.githubClosure.ciStatus,
      status,
    }),
  );

  return CodexTaskClosureRunSchema.parse({
    id: stableId('codex_task_closure_run', closureHash),
    schemaVersion: SchemaVersionSchema.value,
    createdAt,
    taskRunId: input.taskRun.id,
    status,
    diffSummaryId: input.diffSummary.id,
    verificationProjectionId: input.verification.id,
    reviewProjectionId: input.review.id,
    githubClosureProjectionId: input.githubClosure.id,
    ciStatus: input.githubClosure.ciStatus,
    changedFileCount: input.diffSummary.fileCount,
    verificationTargetCount: input.verification.targetCount,
    reviewFindingCount: input.review.findingCount,
    blockerCount: countClosureBlockers(input),
    dryRunOnly: true,
    approvalRequired: input.githubClosure.approvalRequired,
    liveRemoteWriteAllowed: false,
    branchPublishDryRunIdHash,
    draftPrDryRunIdHash,
    closureHash,
    evidenceRefIds: [
      ...(input.evidenceRefIds ?? []),
      ...input.diffSummary.evidenceRefIds,
      ...input.verification.evidenceRefIds,
      ...input.review.evidenceRefIds,
      ...input.githubClosure.evidenceRefIds,
    ],
    auditEventIds: [
      ...(input.auditEventIds ?? []),
      ...input.diffSummary.auditEventIds,
      ...input.verification.auditEventIds,
      ...input.review.auditEventIds,
      ...input.githubClosure.auditEventIds,
    ],
    summary: `Task closure run is ${status} with metadata-only child projections.`,
  });
}

export function applyTaskClosureWriteback(input: {
  taskRun: CodexTaskRun;
  closureRun: CodexTaskClosureRun;
  diffSummary: CodexTaskDiffSummaryProjection;
  verification: CodexTaskVerificationProjection;
  review: CodexTaskReviewProjection;
  githubClosure: CodexTaskGithubClosureProjection;
}): CodexTaskRun {
  return CodexTaskRunSchema.parse({
    ...input.taskRun,
    ciStatus: input.githubClosure.ciStatus,
    diffSummaryId: input.diffSummary.id,
    verificationProjectionId: input.verification.id,
    reviewProjectionId: input.review.id,
    githubClosureProjectionId: input.githubClosure.id,
    closureRunId: input.closureRun.id,
    closureSummaryHash: input.closureRun.closureHash,
    outputSummaryHash: input.verification.outputSummaryHash ?? input.taskRun.outputSummaryHash,
    summary: `Task run closure writeback is ${input.closureRun.status}; metadata only.`,
  });
}

export function createTaskClosureProjectionBundle(input: {
  taskRun: CodexTaskRun;
  diff?: Omit<TaskClosureDiffSummaryInput, 'taskRun'>;
  verification?: Omit<TaskClosureVerificationInput, 'taskRun'>;
  review?: Omit<TaskClosureReviewInput, 'taskRun'>;
  github?: Omit<TaskClosureGithubInput, 'taskRun'>;
  createdAt?: string;
}): TaskClosureProjectionBundle {
  const diffSummary = createTaskClosureDiffSummary({
    taskRun: input.taskRun,
    observedAt: input.createdAt,
    ...(input.diff ?? {}),
  });
  const verification = createTaskClosureVerificationProjection({
    taskRun: input.taskRun,
    createdAt: input.createdAt,
    ...(input.verification ?? {}),
  });
  const review = createTaskClosureReviewProjection({
    taskRun: input.taskRun,
    createdAt: input.createdAt,
    status:
      input.review?.status ??
      (diffSummary.status === 'empty'
        ? 'blocked_patch'
        : verification.status === 'failed' ||
            verification.status === 'blocked' ||
            verification.status === 'aborted'
          ? 'blocked_verification'
          : undefined),
    ...(input.review ?? {}),
  });
  const githubClosure = createTaskClosureGithubProjection({
    taskRun: input.taskRun,
    createdAt: input.createdAt,
    blocked:
      input.github?.blocked ??
      (review.status !== 'ready_for_review' ||
        verification.status === 'failed' ||
        verification.status === 'blocked' ||
        verification.status === 'aborted'),
    ...(input.github ?? {}),
  });
  const closureRun = createTaskClosureRun({
    taskRun: input.taskRun,
    diffSummary,
    verification,
    review,
    githubClosure,
    createdAt: input.createdAt,
  });
  const taskRun = applyTaskClosureWriteback({
    taskRun: input.taskRun,
    closureRun,
    diffSummary,
    verification,
    review,
    githubClosure,
  });

  return {
    diffSummary,
    verification,
    review,
    githubClosure,
    closureRun,
    taskRun,
    metadataOnly: true,
    rawPromptStored: false,
    rawDiffStored: false,
    rawPathStored: false,
    rawBodyStored: false,
    liveRemoteWriteAllowed: false,
    externalProcessStarted: verification.externalProcessStarted,
  };
}

function classifyClosureRunStatus(input: TaskClosureRunInput): CodexTaskClosureRun['status'] {
  if (input.githubClosure.ciStatus === 'failed' || input.githubClosure.status === 'ci_failed') {
    return 'failed';
  }

  if (input.githubClosure.ciStatus === 'passed' || input.githubClosure.status === 'ci_passed') {
    return 'completed';
  }

  if (input.githubClosure.ciStatus === 'pending' || input.githubClosure.status === 'ci_pending') {
    return 'ci_pending';
  }

  if (
    input.diffSummary.status === 'blocked' ||
    input.diffSummary.status === 'unknown' ||
    input.verification.status === 'blocked' ||
    input.review.status.startsWith('blocked') ||
    input.githubClosure.status === 'blocked'
  ) {
    return 'blocked';
  }

  if (input.verification.status === 'failed' || input.verification.status === 'aborted') {
    return 'failed';
  }

  if (input.githubClosure.status === 'approval_waiting') {
    return 'waiting_approval';
  }

  if (input.githubClosure.status === 'dry_run_planned') {
    return 'dry_run_planned';
  }

  if (input.review.status === 'ready_for_review') {
    return 'ready_for_review';
  }

  return 'not_started';
}

function countClosureBlockers(input: TaskClosureRunInput): number {
  return [
    input.diffSummary.status === 'blocked' || input.diffSummary.status === 'unknown',
    input.verification.status === 'failed' ||
      input.verification.status === 'blocked' ||
      input.verification.status === 'aborted',
    input.review.blockerCount > 0 || input.review.status.startsWith('blocked'),
    input.githubClosure.status === 'blocked' || input.githubClosure.ciStatus === 'failed',
  ].filter(Boolean).length;
}

function dedupeHashes(values: readonly string[]): string[] {
  return [...new Set(values.filter((value) => value.trim().length > 0).map(normalizeHash))];
}

function normalizeHash(value: string): string {
  return value.startsWith('sha256:') ? value : stableHash(value);
}

function stableHash(value: string): string {
  return `sha256:${hashText(value)}`;
}

function stableId(prefix: string, seed: string): string {
  return `${prefix}_${hashText(seed).slice(0, 16)}`;
}

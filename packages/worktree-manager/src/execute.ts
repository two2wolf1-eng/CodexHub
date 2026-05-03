import {
  type CapabilityAuditEvent,
  type CapabilityExecutionResult,
  CapabilityExecutionResultSchema,
  type EvidenceRef,
  type ExecutionAuthority,
  ExecutionAuthoritySchema,
  type PatchRun,
  type PatchSummary,
  type PullRequestSummaryDraft,
  type ReleaseAuditDraft,
  RepoRelativePathSchema,
  SchemaVersionSchema,
  type WorktreeRun,
  WorktreeRunSchema,
  foundationId,
  foundationTimestamp,
} from '@codexhub/contracts';
import { hashText } from '@codexhub/evidence-kernel';
import { createWorktreeManagerAuditEvent } from './audit';
import {
  createPatchSummaryEvidence,
  createPullRequestSummaryDraftEvidence,
  createReleaseAuditDraftEvidence,
  createWorktreePlanEvidence,
  createWorktreeRunEvidence,
} from './evidence';
import { type WorktreeManagerPlanResult } from './plan';
import {
  createPatchRunAndSummary,
  createPullRequestSummaryDraft,
  createReleaseAuditDraft,
} from './summary';

export type WorktreeManagerExecuteStatus =
  | 'completed'
  | 'failed'
  | 'blocked'
  | 'aborted';

export interface WorktreeManagerFixtureRunnerResult {
  status: 'completed' | 'failed' | 'aborted';
  changedFiles?: readonly string[];
  diffText?: string;
  diffHash?: string;
  diffLineCount?: number;
  summary?: string;
}

export interface WorktreeManagerFixtureRunner {
  run(input: {
    planId: string;
    worktreePathHash: string;
    branchNameHash: string;
  }): Promise<WorktreeManagerFixtureRunnerResult>;
}

export interface WorktreeManagerExecuteInput {
  plan: WorktreeManagerPlanResult;
  authority?: ExecutionAuthority;
  runner?: WorktreeManagerFixtureRunner;
  actor?: string;
  now?: () => string;
}

export interface WorktreeManagerExecuteResult {
  status: WorktreeManagerExecuteStatus;
  capabilityResult: CapabilityExecutionResult;
  worktreeRun: WorktreeRun;
  patchRun: PatchRun;
  patchSummary: PatchSummary;
  pullRequestDraft: PullRequestSummaryDraft;
  releaseAuditDraft: ReleaseAuditDraft;
  evidenceRefs: EvidenceRef[];
  auditEvents: CapabilityAuditEvent[];
  blockReasons: string[];
}

export async function executeWorktreeManager(
  input: WorktreeManagerExecuteInput,
): Promise<WorktreeManagerExecuteResult> {
  const authorityBlockReason = validateAuthority(input.authority, input.now);
  const planBlockReasons =
    input.plan.status === 'blocked' ? input.plan.blockReasons : [];
  const runnerBlockReason = input.runner ? undefined : 'fixture_runner_required';
  const blockReasons = [
    ...planBlockReasons,
    ...(authorityBlockReason ? [authorityBlockReason] : []),
    ...(runnerBlockReason ? [runnerBlockReason] : []),
  ];

  if (blockReasons.length > 0) {
    return createBlockedExecuteResult(input, blockReasons);
  }

  const runner = input.runner;
  if (!runner) {
    return createBlockedExecuteResult(input, ['fixture_runner_required']);
  }

  const runnerResult = await runner.run({
    planId: input.plan.id,
    worktreePathHash: input.plan.worktreePathHash,
    branchNameHash: input.plan.branchNameHash,
  });
  const changedFiles = [...(runnerResult.changedFiles ?? [])];
  const invalidChangedFiles = validateChangedFiles(changedFiles);
  const validChangedFiles = changedFiles.filter((file) =>
    RepoRelativePathSchema.safeParse(file).success,
  );
  const invalidChangedFileHashes = invalidChangedFiles.map(
    (file) => `sha256:${hashText(file)}`,
  );
  const status: WorktreeManagerExecuteStatus =
    invalidChangedFiles.length > 0 ? 'failed' : runnerResult.status;
  const diffHash =
    runnerResult.diffHash ??
    `sha256:${hashText(runnerResult.diffText ?? JSON.stringify(validChangedFiles))}`;
  const diffLineCount =
    runnerResult.diffLineCount ?? countLines(runnerResult.diffText ?? '');
  const createdAt = (input.now ?? foundationTimestamp)();
  const worktreeRun = WorktreeRunSchema.parse({
    id: foundationId('worktree_run'),
    schemaVersion: SchemaVersionSchema.value,
    createdAt,
    planId: input.plan.id,
    status,
    worktreePathHash: input.plan.worktreePathHash,
    branchNameHash: input.plan.branchNameHash,
    changedFiles: validChangedFiles,
    changedFileCount: validChangedFiles.length,
    diffHash,
    evidenceRefs: [],
    auditEventIds: [],
    rawPathStored: false,
    bodyStored: false,
    noRealWrite: true,
    processBoundaryInvoked: false,
    externalProcessStarted: false,
    summary:
      invalidChangedFiles.length > 0
        ? 'Fixture runner returned invalid changed file paths.'
        : runnerResult.summary ?? `Fixture worktree execution ${status}.`,
  });
  const patchStatus =
    status === 'completed'
      ? 'generated'
      : status === 'aborted'
        ? 'aborted'
        : status === 'failed'
          ? 'rejected'
          : 'blocked';
  const { patchRun, patchSummary } = createPatchRunAndSummary({
    taskId: input.plan.id,
    worktreePathHash: input.plan.worktreePathHash,
    changedFiles: validChangedFiles,
    diffHash,
    diffLineCount,
    status: patchStatus,
    now: input.now,
  });
  const prStatus = status === 'completed' ? 'ready' : 'blocked';
  const verificationStatus = status === 'completed' ? 'passed' : status;
  const pullRequestDraft = createPullRequestSummaryDraft({
    status: prStatus,
    verificationStatus,
    changedFiles: validChangedFiles,
    now: input.now,
  });
  const releaseAuditDraft = createReleaseAuditDraft({
    status: prStatus,
    verificationStatus,
    changedFiles: validChangedFiles,
    now: input.now,
  });
  const evidenceRefs = [
    createWorktreePlanEvidence(input.plan.worktreePlan),
    createWorktreeRunEvidence(worktreeRun),
    createPatchSummaryEvidence(patchSummary),
    createPullRequestSummaryDraftEvidence(pullRequestDraft),
    createReleaseAuditDraftEvidence(releaseAuditDraft),
  ];
  const auditEvents = [
    createWorktreeManagerAuditEvent({
      actor: input.actor,
      action: 'worktree-manager.execute',
      target: input.plan.worktreePathHash,
      reason: 'execution authority accepted by workflow gate for fixture-only worktree summary',
      outcome: status,
      policyDecisionId: input.authority?.policyDecisionId ?? 'missing-policy-decision',
      evidenceRefs,
      metadata: {
        liveExecution: false,
        processBoundaryInvoked: false,
        externalProcessStarted: false,
        noRealWrite: true,
        changedFileCount: validChangedFiles.length,
        invalidChangedFileHashes,
        bodyStored: false,
        rawPathStored: false,
      },
    }),
  ];

  return {
    status,
    capabilityResult: createCapabilityExecutionResult({
      status,
      evidenceRefs,
      auditEvents,
      summary: `Worktree manager fixture execution ${status}.`,
    }),
    worktreeRun: {
      ...worktreeRun,
      evidenceRefs: [evidenceRefs[1]],
      auditEventIds: auditEvents.map((event) => event.id),
    },
    patchRun: {
      ...patchRun,
      evidenceRefs: [evidenceRefs[2]],
      auditEventIds: auditEvents.map((event) => event.id),
    },
    patchSummary: {
      ...patchSummary,
      evidenceRefs: [evidenceRefs[2]],
      auditEventIds: auditEvents.map((event) => event.id),
    },
    pullRequestDraft: {
      ...pullRequestDraft,
      evidenceRefs: [evidenceRefs[3]],
      auditEventIds: auditEvents.map((event) => event.id),
    },
    releaseAuditDraft: {
      ...releaseAuditDraft,
      evidenceRefs: [evidenceRefs[4]],
      auditEventIds: auditEvents.map((event) => event.id),
    },
    evidenceRefs,
    auditEvents,
    blockReasons:
      invalidChangedFiles.length > 0 ? ['invalid_changed_file_paths'] : [],
  };
}

function validateAuthority(
  authority: ExecutionAuthority | undefined,
  now: (() => string) | undefined,
): string | undefined {
  if (!authority) {
    return 'execution_authority_missing';
  }

  const parsedAuthority = ExecutionAuthoritySchema.safeParse(authority);
  if (!parsedAuthority.success) {
    return 'execution_authority_invalid';
  }

  if (!authority.allowed) {
    return 'execution_authority_not_allowed';
  }

  if (authority.policyDecisionId.trim().length === 0) {
    return 'policy_decision_missing';
  }

  if (
    authority.expiresAt &&
    Date.parse(authority.expiresAt) <= Date.parse((now ?? foundationTimestamp)())
  ) {
    return 'execution_authority_expired';
  }

  return undefined;
}

function createBlockedExecuteResult(
  input: WorktreeManagerExecuteInput,
  blockReasons: readonly string[],
): WorktreeManagerExecuteResult {
  const createdAt = (input.now ?? foundationTimestamp)();
  const emptyDiffHash = `sha256:${hashText(JSON.stringify(blockReasons))}`;
  const worktreeRun = WorktreeRunSchema.parse({
    id: foundationId('worktree_run'),
    schemaVersion: SchemaVersionSchema.value,
    createdAt,
    planId: input.plan.id,
    status: 'blocked',
    worktreePathHash: input.plan.worktreePathHash,
    branchNameHash: input.plan.branchNameHash,
    changedFiles: [],
    changedFileCount: 0,
    diffHash: emptyDiffHash,
    evidenceRefs: [],
    auditEventIds: [],
    rawPathStored: false,
    bodyStored: false,
    noRealWrite: true,
    processBoundaryInvoked: false,
    externalProcessStarted: false,
    summary: `Worktree manager execution blocked: ${blockReasons.join(', ')}.`,
  });
  const { patchRun, patchSummary } = createPatchRunAndSummary({
    taskId: input.plan.id,
    worktreePathHash: input.plan.worktreePathHash,
    changedFiles: [],
    diffHash: emptyDiffHash,
    diffLineCount: 0,
    status: 'blocked',
    now: input.now,
  });
  const pullRequestDraft = createPullRequestSummaryDraft({
    status: 'blocked',
    verificationStatus: 'blocked',
    changedFiles: [],
    now: input.now,
  });
  const releaseAuditDraft = createReleaseAuditDraft({
    status: 'blocked',
    verificationStatus: 'blocked',
    changedFiles: [],
    now: input.now,
  });
  const evidenceRefs = [
    createWorktreePlanEvidence(input.plan.worktreePlan),
    createWorktreeRunEvidence(worktreeRun),
    createPatchSummaryEvidence(patchSummary),
    createPullRequestSummaryDraftEvidence(pullRequestDraft),
    createReleaseAuditDraftEvidence(releaseAuditDraft),
  ];
  const auditEvents = [
    createWorktreeManagerAuditEvent({
      actor: input.actor,
      action: 'worktree-manager.execute',
      target: input.plan.worktreePathHash,
      reason: 'capability execution blocked by governance gate',
      outcome: 'blocked',
      policyDecisionId: input.authority?.policyDecisionId ?? 'missing-policy-decision',
      evidenceRefs,
      metadata: {
        blockReasons: [...blockReasons],
        liveExecution: false,
        processBoundaryInvoked: false,
        externalProcessStarted: false,
        noRealWrite: true,
        bodyStored: false,
        rawPathStored: false,
      },
    }),
  ];

  return {
    status: 'blocked',
    capabilityResult: createCapabilityExecutionResult({
      status: 'blocked',
      evidenceRefs,
      auditEvents,
      summary: 'Worktree manager execution blocked before any git boundary.',
    }),
    worktreeRun: {
      ...worktreeRun,
      evidenceRefs: [evidenceRefs[1]],
      auditEventIds: auditEvents.map((event) => event.id),
    },
    patchRun: {
      ...patchRun,
      evidenceRefs: [evidenceRefs[2]],
      auditEventIds: auditEvents.map((event) => event.id),
    },
    patchSummary: {
      ...patchSummary,
      evidenceRefs: [evidenceRefs[2]],
      auditEventIds: auditEvents.map((event) => event.id),
    },
    pullRequestDraft: {
      ...pullRequestDraft,
      evidenceRefs: [evidenceRefs[3]],
      auditEventIds: auditEvents.map((event) => event.id),
    },
    releaseAuditDraft: {
      ...releaseAuditDraft,
      evidenceRefs: [evidenceRefs[4]],
      auditEventIds: auditEvents.map((event) => event.id),
    },
    evidenceRefs,
    auditEvents,
    blockReasons: [...blockReasons],
  };
}

function createCapabilityExecutionResult(input: {
  status: WorktreeManagerExecuteStatus;
  evidenceRefs: readonly EvidenceRef[];
  auditEvents: readonly CapabilityAuditEvent[];
  summary: string;
}): CapabilityExecutionResult {
  return CapabilityExecutionResultSchema.parse({
    id: foundationId('capability_result'),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: foundationTimestamp(),
    status: input.status,
    processBoundaryInvoked: false,
    externalProcessStarted: false,
    noRealWrite: true,
    evidenceRefs: input.evidenceRefs.map((ref) => ref.id),
    auditEventIds: input.auditEvents.map((event) => event.id),
    summary: input.summary,
  });
}

function validateChangedFiles(changedFiles: readonly string[]): string[] {
  return changedFiles.filter((file) => !RepoRelativePathSchema.safeParse(file).success);
}

function countLines(text: string): number {
  return text.length === 0 ? 0 : text.split(/\r?\n/).length;
}

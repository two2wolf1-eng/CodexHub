import {
  type EvidenceRef,
  type PatchSummary,
  type PullRequestSummaryDraft,
  type ReleaseAuditDraft,
  type WorktreeCleanupPlan,
  type WorktreeCleanupRun,
  type WorktreePlan,
  type WorktreeRun,
} from '@codexhub/contracts';
import { createEvidenceRef } from '@codexhub/evidence-kernel';

export function createWorktreePlanEvidence(plan: WorktreePlan): EvidenceRef {
  return createEvidenceRef({
    kind: 'worktree.plan',
    label: 'worktree-manager-plan',
    summary: plan.summary,
    metadata: {
      adapterName: plan.adapterName,
      planId: plan.id,
      status: plan.status,
      repoRootHash: plan.repoRootHash,
      worktreeRootHash: plan.worktreeRootHash,
      worktreePathHash: plan.worktreePathHash,
      branchNameHash: plan.branchNameHash,
      worktreeSlugHash: plan.worktreeSlugHash,
      baseRefHash: plan.baseRefHash,
      runnerMode: plan.runnerMode,
      commandSummaryHash: plan.commandSummaryHash,
      defaultRootKind: plan.defaultRootKind,
      blockReasons: plan.blockReasons,
      gitProcessBoundaryPlanned: plan.gitProcessBoundaryPlanned,
      processBoundaryPlanned: plan.processBoundaryPlanned,
      processBoundaryInvoked: false,
      externalProcessStarted: false,
      rawPathStored: false,
      bodyStored: false,
      noRealWrite: true,
    },
  });
}

export function createWorktreeRunEvidence(run: WorktreeRun): EvidenceRef {
  return createEvidenceRef({
    kind: 'worktree.run_summary',
    label: 'worktree-manager-run',
    summary: run.summary,
    metadata: {
      planId: run.planId,
      runId: run.id,
      status: run.status,
      runnerMode: run.runnerMode,
      changedFiles: run.changedFiles,
      changedFileCount: run.changedFileCount,
      diffHash: run.diffHash,
      commandSummaryHash: run.commandSummaryHash,
      gitProcessBoundaryInvoked: run.gitProcessBoundaryInvoked,
      cleanupRequired: run.cleanupRequired,
      cleanupDeferred: run.cleanupDeferred,
      processBoundaryInvoked: run.processBoundaryInvoked,
      externalProcessStarted: run.externalProcessStarted,
      rawPathStored: false,
      bodyStored: false,
      noRealWrite: run.noRealWrite,
    },
  });
}

export function createPatchSummaryEvidence(summary: PatchSummary): EvidenceRef {
  return createEvidenceRef({
    kind: 'patch.diff_summary',
    label: 'worktree-manager-patch-summary',
    summary: summary.summary,
    metadata: {
      patchRunId: summary.patchRunId,
      changedFiles: summary.changedFiles,
      changedFileCount: summary.changedFileCount,
      diffHash: summary.diffHash,
      diffLineCount: summary.diffLineCount,
      rawPathStored: false,
      bodyStored: false,
      noRealWrite: true,
    },
  });
}

export function createPullRequestSummaryDraftEvidence(
  draft: PullRequestSummaryDraft,
): EvidenceRef {
  return createEvidenceRef({
    kind: 'pr.draft_summary',
    label: 'worktree-manager-pr-draft',
    summary: draft.summary,
    metadata: {
      draftId: draft.id,
      status: draft.status,
      titleHash: draft.titleHash,
      bodyHash: draft.bodyHash,
      sectionCount: draft.sectionCount,
      changedFileCount: draft.changedFiles.length,
      rawPathStored: false,
      bodyStored: false,
      noRealWrite: true,
    },
  });
}

export function createReleaseAuditDraftEvidence(draft: ReleaseAuditDraft): EvidenceRef {
  return createEvidenceRef({
    kind: 'release.audit_draft',
    label: 'worktree-manager-release-audit-draft',
    summary: draft.summary,
    metadata: {
      draftId: draft.id,
      status: draft.status,
      verificationStatus: draft.verificationStatus,
      rollbackNotesHash: draft.rollbackNotesHash,
      riskNotesHash: draft.riskNotesHash,
      rawPathStored: false,
      bodyStored: false,
      noRealWrite: true,
    },
  });
}

export function createWorktreeCleanupPlanEvidence(plan: WorktreeCleanupPlan): EvidenceRef {
  return createEvidenceRef({
    kind: 'worktree.cleanup_plan',
    label: 'worktree-manager-cleanup-plan',
    summary: plan.summary,
    metadata: {
      planId: plan.id,
      sourceRunId: plan.sourceRunId,
      status: plan.status,
      repoRootHash: plan.repoRootHash,
      worktreeRootHash: plan.worktreeRootHash,
      worktreePathHash: plan.worktreePathHash,
      sourceRunHash: plan.sourceRunHash,
      commandSummaryHash: plan.commandSummaryHash,
      blockReasons: plan.blockReasons,
      dirtyCheckPlanned: plan.dirtyCheckPlanned,
      cleanupDeletePlanned: plan.cleanupDeletePlanned,
      cleanupRequired: plan.cleanupRequired,
      cleanupDeferred: plan.cleanupDeferred,
      gitProcessBoundaryPlanned: plan.gitProcessBoundaryPlanned,
      processBoundaryPlanned: plan.processBoundaryPlanned,
      rawPathStored: false,
      bodyStored: false,
      noRealWrite: true,
    },
  });
}

export function createWorktreeCleanupRunEvidence(run: WorktreeCleanupRun): EvidenceRef {
  return createEvidenceRef({
    kind: 'worktree.cleanup_summary',
    label: 'worktree-manager-cleanup-run',
    summary: run.summary,
    metadata: {
      runId: run.id,
      planId: run.planId,
      sourceRunId: run.sourceRunId,
      status: run.status,
      repoRootHash: run.repoRootHash,
      worktreeRootHash: run.worktreeRootHash,
      worktreePathHash: run.worktreePathHash,
      sourceRunHash: run.sourceRunHash,
      commandSummaryHash: run.commandSummaryHash,
      dirtyFileCount: run.dirtyFileCount,
      dirtyStatusHash: run.dirtyStatusHash,
      cleanupAttempted: run.cleanupAttempted,
      cleanupCompleted: run.cleanupCompleted,
      cleanupRequired: run.cleanupRequired,
      cleanupDeferred: run.cleanupDeferred,
      gitProcessBoundaryInvoked: run.gitProcessBoundaryInvoked,
      processBoundaryInvoked: run.processBoundaryInvoked,
      externalProcessStarted: run.externalProcessStarted,
      rawPathStored: false,
      bodyStored: false,
      noRealWrite: run.noRealWrite,
    },
  });
}

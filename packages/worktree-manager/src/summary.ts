import {
  type PatchRun,
  PatchRunSchema,
  type PatchSummary,
  PatchSummarySchema,
  type PullRequestSummaryDraft,
  PullRequestSummaryDraftSchema,
  type ReleaseAuditDraft,
  ReleaseAuditDraftSchema,
  SchemaVersionSchema,
  foundationId,
  foundationTimestamp,
} from '@codexhub/contracts';
import { hashText } from '@codexhub/evidence-kernel';

export interface PatchSummaryInput {
  taskId: string;
  worktreePathHash: string;
  changedFiles: readonly string[];
  diffHash: string;
  diffLineCount: number;
  status: 'generated' | 'verified' | 'rejected' | 'blocked' | 'aborted';
  evidenceRefIds?: readonly string[];
  auditEventIds?: readonly string[];
  now?: () => string;
}

export function createPatchRunAndSummary(input: PatchSummaryInput): {
  patchRun: PatchRun;
  patchSummary: PatchSummary;
} {
  const createdAt = (input.now ?? foundationTimestamp)();
  const patchRun = PatchRunSchema.parse({
    id: foundationId('patch_run'),
    schemaVersion: SchemaVersionSchema.value,
    createdAt,
    taskId: input.taskId,
    status: input.status,
    changedFiles: [...input.changedFiles],
    diffHash: input.diffHash,
    worktreePathHash: input.worktreePathHash,
    evidenceRefs: [],
    auditEventIds: [...(input.auditEventIds ?? [])],
    noRealWrite: true,
    bodyStored: false,
    rawPathStored: false,
    summary:
      input.status === 'verified'
        ? 'Patch metadata verified from fixture execution.'
        : 'Patch metadata generated without persisting raw diff body.',
  });
  const patchSummary = PatchSummarySchema.parse({
    id: foundationId('patch_summary'),
    schemaVersion: SchemaVersionSchema.value,
    createdAt,
    patchRunId: patchRun.id,
    changedFiles: [...input.changedFiles],
    changedFileCount: input.changedFiles.length,
    diffHash: input.diffHash,
    diffLineCount: input.diffLineCount,
    evidenceRefs: [],
    auditEventIds: [...(input.auditEventIds ?? [])],
    rawPathStored: false,
    bodyStored: false,
    noRealWrite: true,
    summary: 'Patch summary stores changed file names, counts, and diff hash only.',
  });

  return { patchRun, patchSummary };
}

export function createPullRequestSummaryDraft(input: {
  status: 'ready' | 'blocked';
  changedFiles: readonly string[];
  verificationStatus: 'passed' | 'failed' | 'blocked' | 'aborted';
  evidenceRefIds?: readonly string[];
  auditEventIds?: readonly string[];
  now?: () => string;
}): PullRequestSummaryDraft {
  const titleSeed = `CodexHub governed patch draft:${input.status}:${input.changedFiles.join(',')}`;
  const bodySeed = JSON.stringify({
    status: input.status,
    verificationStatus: input.verificationStatus,
    changedFiles: input.changedFiles,
    sections: ['summary', 'verification', 'risk', 'rollback'],
  });

  return PullRequestSummaryDraftSchema.parse({
    id: foundationId('pr_draft'),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: (input.now ?? foundationTimestamp)(),
    status: input.status,
    titleHash: `sha256:${hashText(titleSeed)}`,
    bodyHash: `sha256:${hashText(bodySeed)}`,
    sectionCount: 4,
    changedFiles: [...input.changedFiles],
    evidenceRefs: [],
    auditEventIds: [...(input.auditEventIds ?? [])],
    rawPathStored: false,
    bodyStored: false,
    noRealWrite: true,
    summary:
      input.status === 'ready'
        ? 'PR draft metadata is ready after verification passed.'
        : 'PR draft metadata is blocked until verification passes.',
  });
}

export function createReleaseAuditDraft(input: {
  status: 'ready' | 'blocked';
  verificationStatus: 'passed' | 'failed' | 'blocked' | 'aborted';
  changedFiles: readonly string[];
  noRealGitBoundary?: boolean;
  evidenceRefIds?: readonly string[];
  auditEventIds?: readonly string[];
  now?: () => string;
}): ReleaseAuditDraft {
  const rollbackNotesSeed = JSON.stringify({
    status: input.status,
    verificationStatus: input.verificationStatus,
    changedFiles: input.changedFiles,
    rollback: 'review patch summary and revert fixture changes in future real worktree',
  });
  const riskNotesSeed = JSON.stringify({
    status: input.status,
    verificationStatus: input.verificationStatus,
    noRealGitBoundary: input.noRealGitBoundary ?? true,
    noPush: true,
    noPullRequestOpened: true,
  });

  return ReleaseAuditDraftSchema.parse({
    id: foundationId('release_audit_draft'),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: (input.now ?? foundationTimestamp)(),
    status: input.status,
    verificationStatus: input.verificationStatus,
    rollbackNotesHash: `sha256:${hashText(rollbackNotesSeed)}`,
    riskNotesHash: `sha256:${hashText(riskNotesSeed)}`,
    evidenceRefs: [],
    auditEventIds: [...(input.auditEventIds ?? [])],
    rawPathStored: false,
    bodyStored: false,
    noRealWrite: true,
    summary:
      input.status === 'ready'
        ? 'Release audit draft metadata is ready.'
        : 'Release audit draft metadata is blocked.',
  });
}

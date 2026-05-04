import {
  type CapabilityAuditEvent,
  type EvidenceRef,
  type GovernedCodexPatchMode,
  type GovernedCodexPatchPlan,
  GovernedCodexPatchPlanSchema,
  type GovernedCodexPatchRun,
  GovernedCodexPatchRunSchema,
  type GovernedCodexPatchRunStatus,
  SchemaVersionSchema,
  foundationId,
  foundationTimestamp,
} from '@codexhub/contracts';
import { createEvidenceRef, hashText } from '@codexhub/evidence-kernel';
import { createCodexExecAdapterAuditEvent } from './audit';

export interface GovernedCodexPatchPlanInput {
  mode?: GovernedCodexPatchMode;
  dryRunIdHash: string;
  policyDecisionIdHash: string;
  approvalArtifactIdHash: string;
  worktreeRunIdHash: string;
  worktreePathHash: string;
  governedInputHash: string;
  expectedInputHash: string;
  metadata?: Record<string, unknown>;
}

export interface GovernedCodexPatchRunInput {
  plan: GovernedCodexPatchPlan;
  status: GovernedCodexPatchRunStatus;
  changedFiles?: string[];
  diffHash?: string;
  diffLineCount?: number;
  processBoundaryInvoked?: boolean;
  externalProcessStarted?: boolean;
  codexPatchExecuted?: boolean;
  realWriteExecuted?: boolean;
  actor?: string;
  policyDecisionId?: string;
  metadata?: Record<string, unknown>;
}

export interface GovernedCodexPatchAdapterResult {
  plan: GovernedCodexPatchPlan;
  run: GovernedCodexPatchRun;
  evidenceRefs: EvidenceRef[];
  auditEvents: CapabilityAuditEvent[];
}

export function createGovernedCodexPatchPlan(
  input: GovernedCodexPatchPlanInput,
): GovernedCodexPatchPlan {
  const mode = input.mode ?? 'governed-worktree';

  return GovernedCodexPatchPlanSchema.parse({
    id: foundationId('codex_patch_plan'),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: foundationTimestamp(),
    mode,
    dryRunIdHash: input.dryRunIdHash,
    policyDecisionIdHash: input.policyDecisionIdHash,
    approvalArtifactIdHash: input.approvalArtifactIdHash,
    worktreeRunIdHash: input.worktreeRunIdHash,
    worktreePathHash: input.worktreePathHash,
    governedInputHash: input.governedInputHash,
    expectedInputHash: input.expectedInputHash,
    sandboxMode: 'workspace-write-limited',
    writeScope: 'isolated-worktree-only',
    approvalRequired: true,
    persistedApprovalRequired: true,
    hashBoundWorktreeRequired: true,
    repoRootWriteAllowed: false,
    pushAllowed: false,
    pullRequestOpened: false,
    rawPromptStored: false,
    rawPathStored: false,
    bodyStored: false,
    processBoundaryPlanned: mode === 'governed-worktree',
    externalProcessStarted: false,
    evidenceRefs: [],
    auditEventIds: [],
    metadata: summarizePatchMetadata(input.metadata),
    summary:
      mode === 'governed-worktree'
        ? 'Governed Codex patch is planned for the approved isolated worktree only.'
        : 'Fixture Codex patch plan records metadata only.',
  });
}

export function createGovernedCodexPatchAdapterResult(
  input: GovernedCodexPatchRunInput,
): GovernedCodexPatchAdapterResult {
  const runEvidence = createGovernedCodexPatchRunEvidence(input);
  const planEvidence = createGovernedCodexPatchPlanEvidence(input.plan);
  const evidenceRefs = [planEvidence, runEvidence];
  const auditEvents = [
    createCodexExecAdapterAuditEvent({
      actor: input.actor,
      action: 'codex-cli.patch.governed-worktree',
      target: 'isolated-worktree',
      reason: 'governed Codex patch handoff is metadata-only in CodexHub',
      outcome: input.status,
      policyDecisionId: input.policyDecisionId ?? 'policy_decision_hash_bound',
      evidenceRefs,
      metadata: {
        processBoundaryInvoked:
          input.processBoundaryInvoked ?? defaultBoundaryInvoked(input.status),
        externalProcessStarted:
          input.externalProcessStarted ?? defaultExternalProcessStarted(input.status),
        codexPatchExecuted: input.codexPatchExecuted ?? input.status === 'completed',
        realWriteExecuted: input.realWriteExecuted ?? input.status === 'completed',
        repoRootWriteAllowed: false,
        pushAllowed: false,
        pullRequestOpened: false,
        rawPromptStored: false,
        rawDiffStored: false,
        rawPathStored: false,
        bodyStored: false,
      },
    }),
  ];
  const changedFiles = input.changedFiles ?? defaultChangedFiles(input.status);
  const run = GovernedCodexPatchRunSchema.parse({
    id: foundationId('codex_patch_run'),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: foundationTimestamp(),
    planId: input.plan.id,
    mode: input.plan.mode,
    status: input.status,
    changedFiles,
    changedFileCount: changedFiles.length,
    diffHash: input.diffHash ?? defaultDiffHash(input.plan.id, input.status, changedFiles),
    diffLineCount: input.diffLineCount ?? (changedFiles.length > 0 ? changedFiles.length * 16 : 0),
    processBoundaryInvoked: input.processBoundaryInvoked ?? defaultBoundaryInvoked(input.status),
    externalProcessStarted:
      input.externalProcessStarted ?? defaultExternalProcessStarted(input.status),
    codexPatchExecuted: input.codexPatchExecuted ?? input.status === 'completed',
    realWriteExecuted: input.realWriteExecuted ?? input.status === 'completed',
    writeScope: 'isolated-worktree-only',
    repoRootWriteAllowed: false,
    pushAllowed: false,
    pullRequestOpened: false,
    rawStdoutStored: false,
    rawStderrStored: false,
    rawDiffStored: false,
    rawPathStored: false,
    bodyStored: false,
    evidenceRefs: [runEvidence],
    auditEventIds: auditEvents.map((auditEvent) => auditEvent.id),
    metadata: summarizePatchMetadata(input.metadata),
    summary:
      input.status === 'completed'
        ? 'Governed Codex patch completed in the isolated worktree; PR remains local draft only.'
        : `Governed Codex patch ${input.status}; no push or PR action is permitted.`,
  });

  return {
    plan: input.plan,
    run,
    evidenceRefs,
    auditEvents,
  };
}

function createGovernedCodexPatchPlanEvidence(plan: GovernedCodexPatchPlan): EvidenceRef {
  return createEvidenceRef({
    kind: 'codex.patch_plan',
    label: 'codex-governed-patch-plan',
    summary: plan.summary,
    metadata: {
      planId: plan.id,
      mode: plan.mode,
      dryRunIdHash: plan.dryRunIdHash,
      policyDecisionIdHash: plan.policyDecisionIdHash,
      approvalArtifactIdHash: plan.approvalArtifactIdHash,
      worktreeRunIdHash: plan.worktreeRunIdHash,
      worktreePathHash: plan.worktreePathHash,
      writeScope: plan.writeScope,
      repoRootWriteAllowed: false,
      pushAllowed: false,
      pullRequestOpened: false,
      rawPromptStored: false,
      rawPathStored: false,
      bodyStored: false,
    },
  });
}

function createGovernedCodexPatchRunEvidence(input: GovernedCodexPatchRunInput): EvidenceRef {
  const changedFiles = input.changedFiles ?? defaultChangedFiles(input.status);

  return createEvidenceRef({
    kind: 'codex.patch_run_summary',
    label: 'codex-governed-patch-run',
    summary: `Governed Codex patch run ${input.status}`,
    metadata: {
      planId: input.plan.id,
      mode: input.plan.mode,
      status: input.status,
      changedFileCount: changedFiles.length,
      changedFileHashes: changedFiles.map((changedFile) => hashOnly(changedFile)),
      diffHash: input.diffHash ?? defaultDiffHash(input.plan.id, input.status, changedFiles),
      processBoundaryInvoked: input.processBoundaryInvoked ?? defaultBoundaryInvoked(input.status),
      externalProcessStarted:
        input.externalProcessStarted ?? defaultExternalProcessStarted(input.status),
      codexPatchExecuted: input.codexPatchExecuted ?? input.status === 'completed',
      realWriteExecuted: input.realWriteExecuted ?? input.status === 'completed',
      repoRootWriteAllowed: false,
      pushAllowed: false,
      pullRequestOpened: false,
      rawStdoutStored: false,
      rawStderrStored: false,
      rawDiffStored: false,
      rawPathStored: false,
      bodyStored: false,
    },
  });
}

function defaultChangedFiles(status: GovernedCodexPatchRunStatus): string[] {
  return status === 'completed'
    ? ['packages/orchestrator-kernel/src/m12-patch-lifecycle.ts']
    : [];
}

function defaultBoundaryInvoked(status: GovernedCodexPatchRunStatus): boolean {
  return status === 'completed' || status === 'failed' || status === 'aborted';
}

function defaultExternalProcessStarted(status: GovernedCodexPatchRunStatus): boolean {
  return status === 'completed' || status === 'failed';
}

function defaultDiffHash(
  planId: string,
  status: GovernedCodexPatchRunStatus,
  changedFiles: readonly string[],
): string | undefined {
  return status === 'completed' && changedFiles.length > 0
    ? hashOnly(`${planId}:${changedFiles.join(',')}:diff-summary`)
    : undefined;
}

function summarizePatchMetadata(
  metadata: Record<string, unknown> | undefined,
): Record<string, unknown> | undefined {
  if (!metadata) {
    return undefined;
  }

  return {
    metadataProvided: true,
    metadataKeyCount: Object.keys(metadata).length,
    metadataHash: hashOnly(JSON.stringify(metadata)),
    bodyStored: false,
    rawPathStored: false,
  };
}

function hashOnly(value: string): string {
  return `sha256:${hashText(value)}`;
}

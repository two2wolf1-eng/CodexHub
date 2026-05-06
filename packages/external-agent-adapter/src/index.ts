import {
  type EvidenceRef,
  type ExternalAgentApprovalArtifact,
  ExternalAgentApprovalArtifactSchema,
  type ExternalAgentManifest,
  ExternalAgentManifestSchema,
  type ExternalAgentPatchPlan,
  ExternalAgentPatchPlanSchema,
  type ExternalAgentPatchSummary,
  ExternalAgentPatchSummarySchema,
  type ExternalAgentProvider,
  type ExternalAgentReadiness,
  ExternalAgentReadinessSchema,
  type ExternalAgentRehearsalRun,
  ExternalAgentRehearsalRunSchema,
  type ExternalAgentRehearsalScenario,
  type ExternalAgentRun,
  ExternalAgentRunSchema,
  SchemaVersionSchema,
  foundationId,
  foundationTimestamp,
} from '@codexhub/contracts';
import { hashText } from '@codexhub/evidence-kernel';

export const EXTERNAL_AGENT_CODEX_FIXED_ARGV_SHAPE = [
  'codex',
  'exec',
  '--cwd',
  '<controlled-sibling-worktree>',
  '--instructions-file',
  '<transient-hash-bound-instructions>',
  '--json',
] as const;

export const EXTERNAL_AGENT_CLAUDE_FIXED_ARGV_SHAPE = [
  'claude',
  '--cwd',
  '<controlled-sibling-worktree>',
  '--print',
  '<transient-hash-bound-instructions>',
] as const;

export const EXTERNAL_AGENT_FIXED_ARGV_SHAPE_HASHES: Record<ExternalAgentProvider, string> = {
  'codex-cli': hashText(EXTERNAL_AGENT_CODEX_FIXED_ARGV_SHAPE.join('\0')),
  'claude-code-cli': hashText(EXTERNAL_AGENT_CLAUDE_FIXED_ARGV_SHAPE.join('\0')),
};

export interface ExternalAgentManifestInput {
  provider: ExternalAgentProvider;
  version?: string;
  now?: () => string;
}

export interface ExternalAgentReadinessInput {
  provider: ExternalAgentProvider;
  externalAgentsEnabled?: boolean;
  providerEnabled?: boolean;
  cliConfigured?: boolean;
  cliExecutable?: string;
  worktreeRecordId?: string;
  worktreeResolved?: boolean;
  blockReasons?: readonly string[];
  now?: () => string;
}

export interface ExternalAgentPatchPlanInput {
  provider: ExternalAgentProvider;
  worktreeRecordId: string;
  worktreePath: string;
  prompt: string;
  instructions: string;
  expectedPatch?: string;
  changedFileCount?: number;
  maxRuntimeSeconds?: number;
  enabled?: boolean;
  blockReasons?: readonly string[];
  evidenceRefs?: readonly EvidenceRef[];
  auditEventIds?: readonly string[];
  now?: () => string;
}

export interface ExternalAgentApprovalInput {
  plan: ExternalAgentPatchPlan;
  status: 'requested' | 'approved' | 'denied' | 'expired' | 'used' | 'revoked';
  decidedBy?: string;
  reason?: string;
  now?: () => string;
}

export interface ExternalAgentPatchSummaryInput {
  provider: ExternalAgentProvider;
  patch: string;
  changedFileCount: number;
  addedLineCount?: number;
  deletedLineCount?: number;
  worktreePath: string;
  evidenceRefs?: readonly EvidenceRef[];
  auditEventIds?: readonly string[];
  now?: () => string;
}

export interface ExternalAgentBoundaryRequest {
  provider: ExternalAgentProvider;
  planId: string;
  expectedPlanHash: string;
  worktreePathHash: string;
  promptHash: string;
  instructionHash: string;
  fixedArgvShapeHash: string;
}

export interface ExternalAgentBoundaryResult {
  status: 'completed' | 'failed' | 'timed_out';
  patchHash?: string;
  changedFileCount?: number;
  addedLineCount?: number;
  deletedLineCount?: number;
  resultSummaryHash?: string;
}

export interface ExternalAgentBoundaryRunner {
  run(request: ExternalAgentBoundaryRequest): Promise<ExternalAgentBoundaryResult>;
}

export function createExternalAgentManifest(input: ExternalAgentManifestInput): ExternalAgentManifest {
  const now = input.now ?? foundationTimestamp;

  return ExternalAgentManifestSchema.parse({
    id: foundationId('external_agent_manifest'),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: now(),
    provider: input.provider,
    versionHash: input.version ? hashText(input.version) : undefined,
    enabledByDefault: false,
    actionMode: 'write',
    riskLevel: 'critical',
    approvalPolicy: 'required',
    fixedArgvShapeHash: EXTERNAL_AGENT_FIXED_ARGV_SHAPE_HASHES[input.provider],
    controlledSiblingWorktreeOnly: true,
    repoRootMutationAllowed: false,
    arbitraryCommandAllowed: false,
    rawPromptStored: false,
    rawCommandStored: false,
    rawPathStored: false,
    bodyStored: false,
    summary: `${input.provider} external agent is fixed-argv and disabled by default.`,
  });
}

export function createExternalAgentReadiness(
  input: ExternalAgentReadinessInput,
): ExternalAgentReadiness {
  const now = input.now ?? foundationTimestamp;
  const blockReasons = [
    ...(input.blockReasons ?? []),
    ...(input.externalAgentsEnabled ? [] : ['external_agents_disabled']),
    ...(input.providerEnabled ? [] : [`external_agent_${input.provider}_disabled`]),
    ...(input.cliConfigured ? [] : ['external_agent_cli_missing']),
    ...(input.worktreeResolved ? [] : ['external_agent_worktree_missing']),
  ];

  return ExternalAgentReadinessSchema.parse({
    id: foundationId('external_agent_readiness'),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: now(),
    provider: input.provider,
    externalAgentsEnabled: input.externalAgentsEnabled ?? false,
    providerEnabled: input.providerEnabled ?? false,
    cliConfigured: input.cliConfigured ?? false,
    cliExecutableHash: input.cliConfigured
      ? hashText(input.cliExecutable ?? `${input.provider}:cli`)
      : undefined,
    worktreeResolved: input.worktreeResolved ?? false,
    worktreeRecordHash: input.worktreeRecordId ? hashText(input.worktreeRecordId) : undefined,
    controlledSiblingWorktreeOnly: true,
    repoRootMutationAllowed: false,
    blockerCount: blockReasons.length,
    blockReasons,
    rawPromptStored: false,
    rawCommandStored: false,
    rawPathStored: false,
    bodyStored: false,
    summary: `${input.provider} readiness stores only hashes and configured/missing state.`,
  });
}

export function planExternalAgentPatch(input: ExternalAgentPatchPlanInput): ExternalAgentPatchPlan {
  const now = input.now ?? foundationTimestamp;
  const blockReasons = [
    ...(input.blockReasons ?? []),
    ...(input.enabled ? [] : ['external_agent_runtime_disabled']),
  ];

  return ExternalAgentPatchPlanSchema.parse({
    id: foundationId('external_agent_patch_plan'),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: now(),
    dryRunId: foundationId('external_agent_dry_run'),
    status: blockReasons.length > 0 ? 'blocked' : 'planned',
    provider: input.provider,
    sourceWorktreeRecordHash: hashText(input.worktreeRecordId),
    worktreePathHash: hashText(input.worktreePath),
    promptHash: hashText(input.prompt),
    instructionHash: hashText(input.instructions),
    expectedPatchHash: input.expectedPatch ? hashText(input.expectedPatch) : undefined,
    changedFileCount: input.changedFileCount ?? 0,
    maxRuntimeSeconds: input.maxRuntimeSeconds ?? 900,
    fixedArgvShapeHash: EXTERNAL_AGENT_FIXED_ARGV_SHAPE_HASHES[input.provider],
    processBoundaryPlanned: true,
    externalProcessPlanned: true,
    controlledSiblingWorktreeOnly: true,
    repoRootMutationAllowed: false,
    arbitraryCommandAllowed: false,
    blockReasons,
    rawPromptStored: false,
    rawDiffStored: false,
    rawPatchStored: false,
    rawCommandStored: false,
    rawPathStored: false,
    bodyStored: false,
    evidenceRefs: [...(input.evidenceRefs ?? [])],
    auditEventIds: [...(input.auditEventIds ?? [])],
    summary: `${input.provider} patch plan stores prompt and target hashes only.`,
  });
}

export function createExternalAgentApprovalArtifact(
  input: ExternalAgentApprovalInput,
): ExternalAgentApprovalArtifact {
  const now = input.now ?? foundationTimestamp;

  return ExternalAgentApprovalArtifactSchema.parse({
    id: foundationId('external_agent_approval'),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: now(),
    dryRunId: input.plan.dryRunId,
    dryRunRecordId: input.plan.id,
    approvalRequestId: foundationId('external_agent_approval_request'),
    approvalArtifactId: foundationId('external_agent_approval_artifact'),
    status: input.status,
    approved: input.status === 'approved',
    policyDecisionId: foundationId('policy_decision_external_agent'),
    expectedPlanHash: hashText(JSON.stringify(input.plan)),
    decidedByHash: input.decidedBy ? hashText(input.decidedBy) : undefined,
    reasonHash: input.reason ? hashText(input.reason) : undefined,
    rawPromptStored: false,
    rawDiffStored: false,
    rawPatchStored: false,
    rawCommandStored: false,
    rawPathStored: false,
    bodyStored: false,
    evidenceRefs: input.plan.evidenceRefs,
    auditEventIds: input.plan.auditEventIds,
    summary: 'External agent approval is persisted and hash-bound.',
  });
}

export function summarizeExternalAgentPatch(
  input: ExternalAgentPatchSummaryInput,
): ExternalAgentPatchSummary {
  const now = input.now ?? foundationTimestamp;

  return ExternalAgentPatchSummarySchema.parse({
    id: foundationId('external_agent_patch_summary'),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: now(),
    provider: input.provider,
    patchHash: hashText(input.patch),
    changedFileCount: input.changedFileCount,
    addedLineCount: input.addedLineCount ?? 0,
    deletedLineCount: input.deletedLineCount ?? 0,
    worktreePathHash: hashText(input.worktreePath),
    rawPromptStored: false,
    rawDiffStored: false,
    rawPatchStored: false,
    rawCommandStored: false,
    rawPathStored: false,
    bodyStored: false,
    evidenceRefs: [...(input.evidenceRefs ?? [])],
    auditEventIds: [...(input.auditEventIds ?? [])],
    summary: 'External agent patch output is reduced to hash and counts.',
  });
}

export function buildExternalAgentBoundaryRequest(
  plan: ExternalAgentPatchPlan,
): ExternalAgentBoundaryRequest {
  return {
    provider: plan.provider,
    planId: plan.id,
    expectedPlanHash: hashText(JSON.stringify(plan)),
    worktreePathHash: plan.worktreePathHash,
    promptHash: plan.promptHash,
    instructionHash: plan.instructionHash,
    fixedArgvShapeHash: plan.fixedArgvShapeHash,
  };
}

export async function runExternalAgentPatchWithRunner(input: {
  plan: ExternalAgentPatchPlan;
  readiness: ExternalAgentReadiness;
  approval: ExternalAgentApprovalArtifact;
  runner: ExternalAgentBoundaryRunner;
  now?: () => string;
}): Promise<ExternalAgentRun> {
  const now = input.now ?? foundationTimestamp;
  const boundaryReached = input.approval.approved && input.plan.status === 'planned';

  if (!boundaryReached) {
    return ExternalAgentRunSchema.parse({
      id: foundationId('external_agent_run'),
      schemaVersion: SchemaVersionSchema.value,
      createdAt: now(),
      status: 'blocked',
      provider: input.plan.provider,
      plan: input.plan,
      readiness: input.readiness,
      approvalArtifactId: input.approval.approvalArtifactId,
      approvalConsumed: false,
      boundaryReached: false,
      processBoundaryInvoked: false,
      externalProcessStarted: false,
      networkBoundaryInvoked: false,
      controlledSiblingWorktreeOnly: true,
      repoRootMutationAllowed: false,
      rawPromptStored: false,
      rawDiffStored: false,
      rawPatchStored: false,
      rawCommandStored: false,
      rawPathStored: false,
      bodyStored: false,
      evidenceRefs: input.plan.evidenceRefs,
      auditEventIds: input.plan.auditEventIds,
      summary: 'External agent run blocked before process boundary.',
    });
  }

  const result = await input.runner.run(buildExternalAgentBoundaryRequest(input.plan));
  const patchSummary =
    result.patchHash || result.changedFileCount
      ? ExternalAgentPatchSummarySchema.parse({
          id: foundationId('external_agent_patch_summary'),
          schemaVersion: SchemaVersionSchema.value,
          createdAt: now(),
          provider: input.plan.provider,
          patchHash: result.patchHash ?? 'sha256:no-patch',
          changedFileCount: result.changedFileCount ?? 0,
          addedLineCount: result.addedLineCount ?? 0,
          deletedLineCount: result.deletedLineCount ?? 0,
          worktreePathHash: input.plan.worktreePathHash,
          rawPromptStored: false,
          rawDiffStored: false,
          rawPatchStored: false,
          rawCommandStored: false,
          rawPathStored: false,
          bodyStored: false,
          evidenceRefs: input.plan.evidenceRefs,
          auditEventIds: input.plan.auditEventIds,
          summary: 'Injected external agent runner returned metadata-only patch summary.',
        })
      : undefined;

  return ExternalAgentRunSchema.parse({
    id: foundationId('external_agent_run'),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: now(),
    status: result.status,
    provider: input.plan.provider,
    plan: input.plan,
    readiness: input.readiness,
    patchSummary,
    approvalArtifactId: input.approval.approvalArtifactId,
    approvalConsumed: true,
    boundaryReached: true,
    processBoundaryInvoked: true,
    externalProcessStarted: true,
    networkBoundaryInvoked: false,
    controlledSiblingWorktreeOnly: true,
    repoRootMutationAllowed: false,
    rawPromptStored: false,
    rawDiffStored: false,
    rawPatchStored: false,
    rawCommandStored: false,
    rawPathStored: false,
    bodyStored: false,
    evidenceRefs: input.plan.evidenceRefs,
    auditEventIds: input.plan.auditEventIds,
    summary: 'External agent run used injected fixed boundary runner.',
  });
}

export function rehearseExternalAgent(input: {
  provider: ExternalAgentProvider;
  scenario: ExternalAgentRehearsalScenario;
  now?: () => string;
}): ExternalAgentRehearsalRun {
  const now = input.now ?? foundationTimestamp;
  const passes =
    (input.provider === 'codex-cli' && input.scenario === 'codex-all-pass') ||
    (input.provider === 'claude-code-cli' && input.scenario === 'claude-all-pass');

  return ExternalAgentRehearsalRunSchema.parse({
    id: foundationId('external_agent_rehearsal'),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: now(),
    scenario: input.scenario,
    provider: input.provider,
    status: passes ? 'passed' : 'blocked',
    readinessStatus: passes ? 'fixture_completed' : 'blocked',
    runStatus: passes ? 'fixture_completed' : 'blocked',
    blockerCount: passes ? 0 : 1,
    processBoundaryInvoked: false,
    externalProcessStarted: false,
    networkBoundaryInvoked: false,
    controlledSiblingWorktreeOnly: true,
    repoRootMutationAllowed: false,
    rawPromptStored: false,
    rawDiffStored: false,
    rawPatchStored: false,
    rawCommandStored: false,
    rawPathStored: false,
    bodyStored: false,
    evidenceRefs: [],
    auditEventIds: [`audit_external_agent_rehearsal_${input.scenario}`],
    summary: `External agent rehearsal ${input.scenario} is fixture-only.`,
  });
}

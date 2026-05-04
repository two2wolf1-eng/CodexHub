import {
  type AuditEvent,
  type EvidenceRef,
  type M11PilotEvidenceSummary,
  M11PilotEvidenceSummarySchema,
  type M11PilotFailureClassification,
  type M11PilotFailureSummary,
  M11PilotFailureSummarySchema,
  type M11PilotReadiness,
  M11PilotReadinessSchema,
  type M11PilotRun,
  M11PilotRunSchema,
  type M11PilotRunStatus,
  type M11PilotStep,
  M11PilotStepSchema,
  type M11PilotStepStatus,
  type M9PilotStep,
  type PolicyDecision,
  SchemaVersionSchema,
  foundationId,
  foundationTimestamp,
} from '@codexhub/contracts';
import { hashText } from '@codexhub/evidence-kernel';
import type { WorktreeManagerExecuteResult } from '@codexhub/worktree-manager';
import {
  type M9LocalPilotInput,
  type M9LocalPilotResult,
  runM9LocalPilot,
} from './m9-pilot-runner';
import type { MinimalOrchestratorRunResult } from './minimal-runner';

export interface M11ProductionPilotNarrowPathInput extends M9LocalPilotInput {
  m11PilotEnabled?: boolean;
}

export interface M11ProductionPilotNarrowPathResult {
  run: M11PilotRun;
  worktree?: WorktreeManagerExecuteResult;
  minimalRun?: MinimalOrchestratorRunResult;
  policyDecisions: PolicyDecision[];
  evidenceRefs: EvidenceRef[];
  auditEvents: AuditEvent[];
  m9Result: M9LocalPilotResult;
}

export async function runM11ProductionPilotNarrowPath(
  input: M11ProductionPilotNarrowPathInput,
): Promise<M11ProductionPilotNarrowPathResult> {
  const now = input.now ?? foundationTimestamp;
  const m9Result = await runM9LocalPilot({
    ...input,
    pilotEnabled: input.m11PilotEnabled ?? input.pilotEnabled,
    metadata: {
      ...(input.metadata ?? {}),
      m11Pilot: true,
      codexReadOnlyDryRunOnly: true,
      patchGenerationAllowed: false,
      pushAllowed: false,
      pullRequestOpened: false,
      bodyStored: false,
      rawPathStored: false,
    },
    actor: input.actor ?? 'orchestrator-kernel.m11-pilot',
  });
  const run = createM11Run({ input, m9Result, now });

  return {
    run,
    worktree: m9Result.worktree,
    minimalRun: m9Result.minimalRun,
    policyDecisions: m9Result.policyDecisions,
    evidenceRefs: m9Result.evidenceRefs,
    auditEvents: m9Result.auditEvents,
    m9Result,
  };
}

function createM11Run(input: {
  input: M11ProductionPilotNarrowPathInput;
  m9Result: M9LocalPilotResult;
  now: () => string;
}): M11PilotRun {
  const runId = foundationId('m11_pilot_run');
  const readiness = createM11Readiness(input.m9Result.run.readiness, input.now);
  const steps = input.m9Result.run.steps.map((step, index) =>
    createM11Step({ step, order: index, now: input.now }),
  );
  const evidenceSummary = createEvidenceSummary({
    runId,
    evidenceRefs: input.m9Result.evidenceRefs,
    auditEvents: input.m9Result.auditEvents,
    now: input.now,
  });
  const failureSummary = createFailureSummary({
    runId,
    readiness,
    status: input.m9Result.run.status,
    steps,
    cleanupRequired: input.m9Result.run.cleanupRequired,
    boundaryReached: input.m9Result.run.processBoundaryInvoked,
    approvalConsumed: Boolean(input.m9Result.run.gitProcessBoundaryInvoked),
    now: input.now,
  });
  const status = input.m9Result.run.status as M11PilotRunStatus;

  return M11PilotRunSchema.parse({
    id: runId,
    schemaVersion: SchemaVersionSchema.value,
    createdAt: input.now(),
    status,
    requestTitleHash: stableHash(input.input.title),
    requestDescriptionHash: stableHash(input.input.description),
    readiness,
    steps,
    evidenceSummary,
    failureSummary,
    worktreeRunId: input.m9Result.run.worktreeRunId,
    codexStatus: input.m9Result.run.codexStatus,
    verificationStatus: input.m9Result.run.verificationStatus,
    prDraftStatus: status === 'passed' ? 'not_ready_no_patch' : 'blocked',
    changedFileCount: 0,
    cleanupRequired: input.m9Result.run.cleanupRequired,
    gitProcessBoundaryInvoked: input.m9Result.run.gitProcessBoundaryInvoked,
    codexProcessBoundaryInvoked: input.m9Result.run.codexProcessBoundaryInvoked,
    nxProcessBoundaryInvoked: input.m9Result.run.nxProcessBoundaryInvoked,
    processBoundaryInvoked: input.m9Result.run.processBoundaryInvoked,
    externalProcessStarted: input.m9Result.run.externalProcessStarted,
    codexNoRealWrite: true,
    codexReadOnlyDryRunOnly: true,
    patchGenerationAllowed: false,
    pushAllowed: false,
    pullRequestOpened: false,
    rawPathStored: false,
    bodyStored: false,
    summary: `M11 narrow-path pilot ${status}; PR draft remains ${
      status === 'passed' ? 'not_ready_no_patch' : 'blocked'
    } because Codex is read-only/dry-run only.`,
  });
}

function createM11Readiness(
  readiness: M9LocalPilotResult['run']['readiness'],
  now: () => string,
): M11PilotReadiness {
  const blockers = readiness.blockers.map((blocker) =>
    blocker === 'm9_local_pilot_disabled' ? 'm11_narrow_path_pilot_disabled' : blocker,
  );

  return M11PilotReadinessSchema.parse({
    id: foundationId('m11_pilot_readiness'),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: now(),
    status: blockers.length === 0 ? readiness.status : 'blocked',
    checkCount: readiness.checkCount,
    passedCheckCount: Math.max(0, readiness.checkCount - blockers.length),
    blockerCount: blockers.length,
    blockers,
    worktreeManagerEnabled: readiness.worktreeManagerEnabled,
    codexReadOnlyDryRunOnly: true,
    nxVerificationPlanned: readiness.nxVerificationPlanned,
    localControlRequired: true,
    rawPathStored: false,
    bodyStored: false,
    summary:
      blockers.length === 0
        ? 'M11 narrow-path pilot readiness checks passed.'
        : `M11 narrow-path pilot readiness blocked by ${blockers.length} gate(s).`,
  });
}

function createM11Step(input: {
  step: M9PilotStep;
  order: number;
  now: () => string;
}): M11PilotStep {
  const phase =
    input.step.phase === 'evidence' ||
    input.step.phase === 'audit' ||
    input.step.phase === 'telemetry' ||
    input.step.phase === 'summary'
      ? 'projection'
      : input.step.phase;

  return M11PilotStepSchema.parse({
    id: stableId('m11_pilot_step', `${input.order}:${phase}:${input.step.status}`),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: input.now(),
    phase,
    status: input.step.status as M11PilotStepStatus,
    order: input.order,
    evidenceRefIds: input.step.evidenceRefIds,
    auditEventIds: input.step.auditEventIds,
    boundaryInvoked: input.step.boundaryInvoked,
    externalProcessStarted: input.step.externalProcessStarted,
    rawPathStored: false,
    bodyStored: false,
    summary: input.step.summary.split('M9').join('M11'),
  });
}

function createEvidenceSummary(input: {
  runId: string;
  evidenceRefs: readonly EvidenceRef[];
  auditEvents: readonly AuditEvent[];
  now: () => string;
}): M11PilotEvidenceSummary {
  const evidenceRefIds = input.evidenceRefs.map((ref) => ref.id);
  const auditEventIds = input.auditEvents.map((event) => event.id);

  return M11PilotEvidenceSummarySchema.parse({
    id: foundationId('m11_pilot_evidence_summary'),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: input.now(),
    runId: input.runId,
    evidenceRefIds,
    auditEventIds,
    evidenceCount: evidenceRefIds.length,
    auditEventCount: auditEventIds.length,
    bundleHash: stableHash(JSON.stringify([evidenceRefIds, auditEventIds])),
    rawPathStored: false,
    bodyStored: false,
    summary: `M11 pilot evidence bundle references ${evidenceRefIds.length} evidence refs and ${auditEventIds.length} audit events.`,
  });
}

function createFailureSummary(input: {
  runId: string;
  readiness: M11PilotReadiness;
  status: M11PilotRunStatus;
  steps: readonly M11PilotStep[];
  cleanupRequired: boolean;
  boundaryReached: boolean;
  approvalConsumed: boolean;
  now: () => string;
}): M11PilotFailureSummary {
  const classification = classifyFailure(input);
  const failedStep = input.steps.find((step) =>
    ['blocked', 'failed', 'aborted'].includes(step.status),
  );

  return M11PilotFailureSummarySchema.parse({
    id: foundationId('m11_pilot_failure_summary'),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: input.now(),
    runId: input.runId,
    classification,
    failedPhase: failedStep?.phase,
    blockerCount: input.readiness.blockerCount,
    blockers: input.readiness.blockers,
    cleanupRequired: input.cleanupRequired,
    boundaryReached: input.boundaryReached,
    approvalConsumed: input.approvalConsumed,
    rawPathStored: false,
    bodyStored: false,
    summary:
      classification === 'none'
        ? 'M11 pilot has no failure.'
        : `M11 pilot classified failure as ${classification}.`,
  });
}

function classifyFailure(input: {
  readiness: M11PilotReadiness;
  status: M11PilotRunStatus;
  steps: readonly M11PilotStep[];
}): M11PilotFailureClassification {
  if (input.status === 'passed') {
    return 'none';
  }

  if (input.readiness.status === 'blocked') {
    return input.readiness.blockers.includes('worktree_approval_artifact_id_required') ||
      input.readiness.blockers.includes('worktree_approval_not_store_resolved') ||
      input.readiness.blockers.includes('codex_approval_artifact_id_required')
      ? 'approval_blocked'
      : 'readiness_blocked';
  }

  const failedStep = input.steps.find((step) =>
    ['blocked', 'failed', 'aborted'].includes(step.status),
  );

  if (failedStep?.phase === 'worktree') {
    return 'worktree_boundary_failed';
  }

  if (failedStep?.phase === 'codex') {
    return 'codex_failed';
  }

  if (failedStep?.phase === 'verification') {
    return 'nx_failed';
  }

  return 'projection_degraded';
}

function stableHash(value: string): string {
  return `sha256:${hashText(value)}`;
}

function stableId(prefix: string, value: string): string {
  return `${prefix}_${hashText(value).slice(0, 16)}`;
}

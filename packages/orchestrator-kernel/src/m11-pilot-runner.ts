import {
  type AuditEvent,
  type EvidenceRef,
  type M11PilotAcceptanceScenario,
  type M11PilotAcceptanceSmokeRun,
  M11PilotAcceptanceSmokeRunSchema,
  type M11PilotAcceptanceSmokeStep,
  M11PilotAcceptanceSmokeStepSchema,
  type M11PilotEvidenceSummary,
  M11PilotEvidenceSummarySchema,
  type M11PilotCleanupApprovalStatus,
  type M11PilotCleanupHandoff,
  M11PilotCleanupHandoffSchema,
  type M11PilotFailureClassification,
  type M11PilotFailureSummary,
  M11PilotFailureSummarySchema,
  type M11PilotReadiness,
  M11PilotReadinessSchema,
  type M11PilotRecoveryAction,
  type M11PilotRecoveryProjection,
  M11PilotRecoveryProjectionSchema,
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
  recovery: M11PilotRecoveryProjection;
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
  const recovery = createM11PilotRecoveryProjection(run, { now });

  return {
    run,
    recovery,
    worktree: m9Result.worktree,
    minimalRun: m9Result.minimalRun,
    policyDecisions: m9Result.policyDecisions,
    evidenceRefs: m9Result.evidenceRefs,
    auditEvents: m9Result.auditEvents,
    m9Result,
  };
}

export interface M11PilotRecoveryProjectionInput {
  cleanupDryRunId?: string;
  cleanupRunId?: string;
  cleanupApprovalStatus?: M11PilotCleanupApprovalStatus;
  cleanupBlockers?: readonly string[];
  cleanupEvidenceRefIds?: readonly string[];
  cleanupAuditEventIds?: readonly string[];
  worktreePathHash?: string;
  cleanupCompleted?: boolean;
  now?: () => string;
}

export function createM11PilotRecoveryProjection(
  run: M11PilotRun,
  input: M11PilotRecoveryProjectionInput = {},
): M11PilotRecoveryProjection {
  const now = input.now ?? foundationTimestamp;
  const recoveryAction = chooseRecoveryAction(run.failureSummary.classification, run.cleanupRequired);
  const cleanupHandoff = createCleanupHandoff(run, input, now);

  return M11PilotRecoveryProjectionSchema.parse({
    id: stableId('m11_pilot_recovery_projection', `${run.id}:${recoveryAction}`),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: now(),
    runId: run.id,
    status: run.status,
    failureClassification: run.failureSummary.classification,
    failedPhase: run.failureSummary.failedPhase,
    recoveryAction,
    cleanupHandoff,
    evidenceRefIds: run.evidenceSummary.evidenceRefIds,
    auditEventIds: run.evidenceSummary.auditEventIds,
    evidenceCount: run.evidenceSummary.evidenceCount,
    auditEventCount: run.evidenceSummary.auditEventCount,
    boundaryReached: run.failureSummary.boundaryReached,
    approvalConsumed: run.failureSummary.approvalConsumed,
    gitProcessBoundaryInvoked: run.gitProcessBoundaryInvoked,
    codexProcessBoundaryInvoked: run.codexProcessBoundaryInvoked,
    nxProcessBoundaryInvoked: run.nxProcessBoundaryInvoked,
    processBoundaryInvoked: run.processBoundaryInvoked,
    externalProcessStarted: run.externalProcessStarted,
    localControlRequired: true,
    rawPathStored: false,
    bodyStored: false,
    summary:
      recoveryAction === 'none'
        ? 'M11 pilot has no recovery action.'
        : `M11 pilot recovery action is ${recoveryAction}.`,
  });
}

export interface M11PilotAcceptanceSmokeInput {
  scenario?: M11PilotAcceptanceScenario;
  now?: () => string;
}

interface M11PilotAcceptanceSmokeScenarioConfig {
  status: Extract<M11PilotRunStatus, 'passed' | 'failed' | 'blocked'>;
  failureClassification: M11PilotFailureClassification;
  recoveryAction: M11PilotRecoveryAction;
  prDraftStatus: 'not_ready_no_patch' | 'blocked';
  cleanupRequired: boolean;
  failedPhase?: M11PilotAcceptanceSmokeStep['phase'];
}

export function runM11PilotAcceptanceSmoke(
  input: M11PilotAcceptanceSmokeInput = {},
): M11PilotAcceptanceSmokeRun {
  const scenario = input.scenario ?? 'all-pass';
  const now = input.now ?? foundationTimestamp;
  const config = getAcceptanceSmokeScenarioConfig(scenario);
  const steps = createAcceptanceSmokeSteps({ scenario, config, now });
  const evidenceRefIds =
    config.status === 'blocked'
      ? [`m11_acceptance_smoke_evidence_${scenario}_readiness`]
      : [
          `m11_acceptance_smoke_evidence_${scenario}_worktree`,
          `m11_acceptance_smoke_evidence_${scenario}_codex`,
          `m11_acceptance_smoke_evidence_${scenario}_verification`,
        ];
  const auditEventIds =
    config.status === 'blocked'
      ? [`m11_acceptance_smoke_audit_${scenario}_readiness`]
      : [
          `m11_acceptance_smoke_audit_${scenario}_worktree`,
          `m11_acceptance_smoke_audit_${scenario}_codex`,
          `m11_acceptance_smoke_audit_${scenario}_verification`,
        ];

  return M11PilotAcceptanceSmokeRunSchema.parse({
    id: stableId('m11_pilot_acceptance_smoke_run', scenario),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: now(),
    scenario,
    status: config.status,
    steps,
    failureClassification: config.failureClassification,
    recoveryAction: config.recoveryAction,
    prDraftStatus: config.prDraftStatus,
    cleanupRequired: config.cleanupRequired,
    evidenceRefIds,
    auditEventIds,
    evidenceCount: evidenceRefIds.length,
    auditEventCount: auditEventIds.length,
    fixtureOnly: true,
    codexReadOnlyDryRunOnly: true,
    patchGenerationAllowed: false,
    pushAllowed: false,
    pullRequestOpened: false,
    processBoundaryInvoked: false,
    externalProcessStarted: false,
    networkBoundaryInvoked: false,
    rawPathStored: false,
    bodyStored: false,
    metadata: {
      fixtureOnly: true,
      simulatedScenario: scenario,
      noLiveBoundary: true,
    },
    summary: `M11 acceptance smoke ${config.status} for ${scenario}; fixture metadata only.`,
  });
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

function getAcceptanceSmokeScenarioConfig(
  scenario: M11PilotAcceptanceScenario,
): M11PilotAcceptanceSmokeScenarioConfig {
  if (scenario === 'all-pass') {
    return {
      status: 'passed',
      failureClassification: 'none',
      recoveryAction: 'review_cleanup_handoff',
      prDraftStatus: 'not_ready_no_patch',
      cleanupRequired: true,
    };
  }

  if (scenario === 'readiness-blocked') {
    return {
      status: 'blocked',
      failureClassification: 'readiness_blocked',
      recoveryAction: 'resolve_readiness',
      prDraftStatus: 'blocked',
      cleanupRequired: false,
      failedPhase: 'readiness',
    };
  }

  if (scenario === 'worktree-approval-blocked') {
    return {
      status: 'blocked',
      failureClassification: 'approval_blocked',
      recoveryAction: 'request_worktree_approval',
      prDraftStatus: 'blocked',
      cleanupRequired: false,
      failedPhase: 'worktree',
    };
  }

  if (scenario === 'worktree-boundary-failed') {
    return {
      status: 'failed',
      failureClassification: 'worktree_boundary_failed',
      recoveryAction: 'inspect_worktree_boundary',
      prDraftStatus: 'blocked',
      cleanupRequired: true,
      failedPhase: 'worktree',
    };
  }

  if (scenario === 'codex-failed') {
    return {
      status: 'failed',
      failureClassification: 'codex_failed',
      recoveryAction: 'review_codex_dry_run',
      prDraftStatus: 'blocked',
      cleanupRequired: true,
      failedPhase: 'codex',
    };
  }

  return {
    status: 'failed',
    failureClassification: 'nx_failed',
    recoveryAction: 'review_nx_verification',
    prDraftStatus: 'blocked',
    cleanupRequired: true,
    failedPhase: 'verification',
  };
}

function createAcceptanceSmokeSteps(input: {
  scenario: M11PilotAcceptanceScenario;
  config: M11PilotAcceptanceSmokeScenarioConfig;
  now: () => string;
}): M11PilotAcceptanceSmokeStep[] {
  const phases: M11PilotAcceptanceSmokeStep['phase'][] = [
    'readiness',
    'worktree',
    'codex',
    'verification',
    'projection',
    'recovery',
    'summary',
  ];
  const failedIndex = input.config.failedPhase
    ? phases.indexOf(input.config.failedPhase)
    : -1;

  return phases.map((phase, order) => {
    let status: M11PilotAcceptanceSmokeStep['status'] = 'passed';
    if (failedIndex >= 0) {
      if (order < failedIndex) {
        status = 'passed';
      } else if (order === failedIndex) {
        status = input.config.status === 'blocked' ? 'blocked' : 'failed';
      } else {
        status = 'skipped';
      }
    }

    return M11PilotAcceptanceSmokeStepSchema.parse({
      id: stableId(
        'm11_pilot_acceptance_smoke_step',
        `${input.scenario}:${order}:${phase}:${status}`,
      ),
      schemaVersion: SchemaVersionSchema.value,
      createdAt: input.now(),
      scenario: input.scenario,
      phase,
      status,
      order,
      evidenceRefIds:
        status === 'passed' ? [`m11_acceptance_smoke_evidence_${input.scenario}_${phase}`] : [],
      auditEventIds:
        status === 'passed' ? [`m11_acceptance_smoke_audit_${input.scenario}_${phase}`] : [],
      boundaryInvoked: false,
      externalProcessStarted: false,
      rawPathStored: false,
      bodyStored: false,
      summary: `M11 ${input.scenario} smoke ${phase} stage ${status}; fixture only.`,
    });
  });
}

function createCleanupHandoff(
  run: M11PilotRun,
  input: M11PilotRecoveryProjectionInput,
  now: () => string,
): M11PilotCleanupHandoff {
  const cleanupEvidenceRefIds = [...(input.cleanupEvidenceRefIds ?? [])];
  const cleanupAuditEventIds = [...(input.cleanupAuditEventIds ?? [])];
  const cleanupApprovalStatus = input.cleanupApprovalStatus ?? 'not_requested';

  return M11PilotCleanupHandoffSchema.parse({
    id: stableId('m11_pilot_cleanup_handoff', `${run.id}:${cleanupApprovalStatus}`),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: now(),
    runId: run.id,
    worktreeRunId: run.worktreeRunId,
    cleanupRequired: run.cleanupRequired,
    cleanupDeferred: run.cleanupRequired && input.cleanupCompleted !== true,
    cleanupCompleted: input.cleanupCompleted ?? false,
    cleanupDryRunId: input.cleanupDryRunId,
    cleanupRunId: input.cleanupRunId,
    cleanupApprovalStatus,
    cleanupBlockers:
      input.cleanupBlockers ??
      (run.cleanupRequired ? ['cleanup_dry_run_and_approval_required'] : []),
    cleanupEvidenceRefIds,
    cleanupAuditEventIds,
    cleanupEvidenceCount: cleanupEvidenceRefIds.length,
    cleanupAuditEventCount: cleanupAuditEventIds.length,
    worktreePathHash: input.worktreePathHash,
    gitProcessBoundaryInvoked: false,
    processBoundaryInvoked: false,
    externalProcessStarted: false,
    rawPathStored: false,
    bodyStored: false,
    summary: run.cleanupRequired
      ? 'M11 pilot cleanup remains deferred to the governed worktree cleanup control plane.'
      : 'M11 pilot has no cleanup handoff requirement.',
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

function chooseRecoveryAction(
  classification: M11PilotFailureClassification,
  cleanupRequired: boolean,
): M11PilotRecoveryAction {
  if (classification === 'none') {
    return cleanupRequired ? 'review_cleanup_handoff' : 'none';
  }

  if (classification === 'readiness_blocked') {
    return 'resolve_readiness';
  }

  if (classification === 'approval_blocked') {
    return 'request_worktree_approval';
  }

  if (classification === 'worktree_boundary_failed') {
    return 'inspect_worktree_boundary';
  }

  if (classification === 'codex_failed') {
    return 'review_codex_dry_run';
  }

  if (classification === 'nx_failed') {
    return 'review_nx_verification';
  }

  return 'inspect_projection_source';
}

function stableHash(value: string): string {
  return `sha256:${hashText(value)}`;
}

function stableId(prefix: string, value: string): string {
  return `${prefix}_${hashText(value).slice(0, 16)}`;
}

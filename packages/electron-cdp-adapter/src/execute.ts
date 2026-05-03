import {
  CapabilityExecutionResultSchema,
  ElectronCdpObservationRunSchema,
  ElectronCdpObservationSummarySchema,
  ExecutionAuthoritySchema,
  SchemaVersionSchema,
  type CapabilityAuditEvent,
  type CapabilityExecutionResult,
  type ElectronCdpBlockReason,
  type ElectronCdpConsoleSummary,
  type ElectronCdpNetworkMetadataSummary,
  type ElectronCdpObservationRun,
  type ElectronCdpObservationRunStatus,
  type ElectronCdpObservationSummary,
  type ElectronTargetSummary,
  type EvidenceRef,
  type ExecutionAuthority,
  type Metadata,
} from '@codexhub/contracts';
import {
  createElectronCdpConsoleSummary,
  createElectronCdpNetworkMetadataSummary,
} from '@codexhub/electron-cdp-kernel';

import { createElectronCdpAuditEvent } from './audit';
import {
  createElectronEndpointEvidence,
  createElectronObservationEvidence,
  createElectronPlanEvidence,
  createElectronProcessEvidence,
  createElectronRunEvidence,
  createElectronTargetEvidence,
} from './evidence';
import { createElectronCdpAdapterManifest } from './manifest';
import type { ElectronCdpAdapterPlan } from './plan';

const schemaVersion = SchemaVersionSchema.value;

export interface ElectronCdpFixtureRunnerResult {
  status?: Extract<ElectronCdpObservationRunStatus, 'completed' | 'failed' | 'aborted'>;
  consoleSummary?: ElectronCdpConsoleSummary;
  networkSummary?: ElectronCdpNetworkMetadataSummary;
  summary?: string;
  targets?: ElectronTargetSummary[];
  cdpHttpBoundaryInvoked?: boolean;
  sourceLabel?: string;
  processBoundaryInvoked?: boolean;
  externalProcessStarted?: boolean;
  metadata?: Metadata;
}

export interface ElectronCdpObservationRunner {
  observe(plan: ElectronCdpAdapterPlan): Promise<ElectronCdpFixtureRunnerResult>;
}

export type ElectronCdpFixtureRunner = ElectronCdpObservationRunner;

export interface ExecuteElectronCdpAdapterInput {
  plan: ElectronCdpAdapterPlan;
  authority?: ExecutionAuthority;
  runner?: ElectronCdpObservationRunner;
  actor?: string;
}

export interface ExecuteElectronCdpAdapterResult {
  manifest: ReturnType<typeof createElectronCdpAdapterManifest>;
  authority?: ExecutionAuthority;
  capabilityResult: CapabilityExecutionResult;
  electronRun: ElectronCdpObservationRun;
  evidenceRefs: EvidenceRef[];
  auditEvents: CapabilityAuditEvent[];
  approvalRequired: boolean;
}

export async function executeElectronCdpAdapter(
  input: ExecuteElectronCdpAdapterInput,
): Promise<ExecuteElectronCdpAdapterResult> {
  const manifest = createElectronCdpAdapterManifest();
  const authorityCheck = input.authority
    ? ExecutionAuthoritySchema.safeParse(input.authority)
    : undefined;
  const actor = input.actor ?? 'codexhub';

  if (!authorityCheck?.success) {
    return createBlockedExecution(input.plan, manifest, input.authority, actor, {
      reason: 'Electron/CDP execution authority is missing or invalid.',
      blockReason: 'execution_authority_missing',
    });
  }

  const authority = authorityCheck.data;

  if (!authority.allowed) {
    return createBlockedExecution(input.plan, manifest, authority, actor, {
      reason: 'Electron/CDP execution authority denied execution.',
      blockReason: 'execution_authority_not_allowed',
    });
  }

  if (authority.expiresAt && Date.parse(authority.expiresAt) <= Date.now()) {
    return createBlockedExecution(input.plan, manifest, authority, actor, {
      reason: 'Electron/CDP execution authority expired.',
      blockReason: 'execution_authority_expired',
    });
  }

  if (input.plan.status === 'blocked') {
    return createBlockedExecution(input.plan, manifest, authority, actor, {
      reason: 'Electron/CDP observation plan is blocked.',
      blockReason: 'capability_forbidden',
    });
  }

  if (input.plan.observationPlan.runnerMode === 'controlled-local-http' && !authority.approvalArtifactId) {
    return createBlockedExecution(input.plan, manifest, authority, actor, {
      reason: 'Electron/CDP controlled HTTP observation requires persisted approval.',
      blockReason: 'approval_artifact_missing',
    });
  }

  if (!input.runner) {
    return createBlockedExecution(input.plan, manifest, authority, actor, {
      reason:
        input.plan.observationPlan.runnerMode === 'controlled-local-http'
          ? 'Electron/CDP controlled HTTP runner is required for M5b execution.'
          : 'Electron/CDP fixture runner is required for execution.',
      blockReason:
        input.plan.observationPlan.runnerMode === 'controlled-local-http'
          ? 'controlled_http_runner_missing'
          : 'fixture_runner_missing',
    });
  }

  const fixture = await input.runner.observe(input.plan);

  if (fixture.processBoundaryInvoked || fixture.externalProcessStarted) {
    return createFailedExecution(input.plan, manifest, authority, actor, {
      reason: 'Electron/CDP runner attempted to cross a process boundary.',
      blockReason: 'fixture_process_boundary_forbidden',
      status: 'failed',
    });
  }

  return createObservedExecution(input.plan, manifest, authority, actor, fixture);
}

function createObservedExecution(
  plan: ElectronCdpAdapterPlan,
  manifest: ReturnType<typeof createElectronCdpAdapterManifest>,
  authority: ExecutionAuthority,
  actor: string,
  fixture: ElectronCdpFixtureRunnerResult,
): ExecuteElectronCdpAdapterResult {
  const status = fixture.status ?? 'completed';
  const observationSummary = createObservationSummary(plan, fixture);
  const evidenceRefs = createEvidenceRefs(plan, observationSummary);
  const run = createRun(plan, status, observationSummary, evidenceRefs, [], fixture.summary);
  const runEvidence = createElectronRunEvidence(run);
  const allEvidence = [...evidenceRefs, runEvidence];
  const auditEvent = createElectronCdpAuditEvent({
    id: `audit_${run.id}`,
    actor,
    action: 'electron.cdp.observe.read_only',
    target:
      plan.observationPlan.debugEndpoint?.endpointIdHash ??
      plan.observationPlan.processSummary?.processIdHash ??
      'electron-cdp',
    reason: 'Execution authority accepted for fixture-only Electron/CDP observation.',
    outcome: status === 'completed' ? 'completed' : status,
    policyDecisionId: authority.policyDecisionId,
    evidenceRefs: allEvidence,
    metadata: {
      ...(fixture.metadata ?? {}),
      runnerMode: plan.observationPlan.runnerMode,
      cdpHttpBoundaryInvoked: fixture.cdpHttpBoundaryInvoked ?? false,
    },
  });
  const completeRun = ElectronCdpObservationRunSchema.parse({
    ...run,
    evidenceRefs: allEvidence,
    auditEventIds: [auditEvent.id],
  });

  return {
    manifest,
    authority,
    capabilityResult: createCapabilityResult(
      status,
      completeRun.summary,
      allEvidence,
      [auditEvent],
    ),
    electronRun: completeRun,
    evidenceRefs: allEvidence,
    auditEvents: [auditEvent],
    approvalRequired: plan.observationPlan.runnerMode === 'controlled-local-http',
  };
}

function createBlockedExecution(
  plan: ElectronCdpAdapterPlan,
  manifest: ReturnType<typeof createElectronCdpAdapterManifest>,
  authority: ExecutionAuthority | undefined,
  actor: string,
  input: { reason: string; blockReason: ElectronCdpBlockReason },
): ExecuteElectronCdpAdapterResult {
  const blockedPlan = {
    ...plan.observationPlan,
    blockReasons: [...new Set([...plan.observationPlan.blockReasons, input.blockReason])],
    summary: input.reason,
  };
  const evidenceRefs = [createElectronPlanEvidence(blockedPlan)];
  const run = createRun(plan, 'blocked', undefined, evidenceRefs, [], input.reason);
  const runEvidence = createElectronRunEvidence(run);
  const allEvidence = [...evidenceRefs, runEvidence];
  const auditEvent = createElectronCdpAuditEvent({
    id: `audit_${run.id}`,
    actor,
    action: 'electron.cdp.observe.read_only',
    target:
      plan.observationPlan.debugEndpoint?.endpointIdHash ??
      plan.observationPlan.processSummary?.processIdHash ??
      'electron-cdp',
    reason: input.reason,
    outcome: 'blocked',
    policyDecisionId: authority?.policyDecisionId ?? 'blocked-before-policy',
    evidenceRefs: allEvidence,
  });
  const completeRun = ElectronCdpObservationRunSchema.parse({
    ...run,
    plan: blockedPlan,
    evidenceRefs: allEvidence,
    auditEventIds: [auditEvent.id],
  });

  return {
    manifest,
    authority,
    capabilityResult: createCapabilityResult(
      'blocked',
      input.reason,
      allEvidence,
      [auditEvent],
    ),
    electronRun: completeRun,
    evidenceRefs: allEvidence,
    auditEvents: [auditEvent],
    approvalRequired: plan.observationPlan.runnerMode === 'controlled-local-http',
  };
}

function createFailedExecution(
  plan: ElectronCdpAdapterPlan,
  manifest: ReturnType<typeof createElectronCdpAdapterManifest>,
  authority: ExecutionAuthority,
  actor: string,
  input: {
    reason: string;
    blockReason: ElectronCdpBlockReason;
    status: 'failed' | 'aborted';
  },
): ExecuteElectronCdpAdapterResult {
  const blockedPlan = {
    ...plan.observationPlan,
    blockReasons: [...new Set([...plan.observationPlan.blockReasons, input.blockReason])],
    summary: input.reason,
  };
  const observationSummary = createObservationSummary(plan, {
    status: input.status,
    summary: input.reason,
  });
  const evidenceRefs = createEvidenceRefs(plan, observationSummary);
  const run = createRun(plan, input.status, observationSummary, evidenceRefs, [], input.reason);
  const runEvidence = createElectronRunEvidence(run);
  const allEvidence = [...evidenceRefs, runEvidence];
  const auditEvent = createElectronCdpAuditEvent({
    id: `audit_${run.id}`,
    actor,
    action: 'electron.cdp.observe.read_only',
    target:
      plan.observationPlan.debugEndpoint?.endpointIdHash ??
      plan.observationPlan.processSummary?.processIdHash ??
      'electron-cdp',
    reason: input.reason,
    outcome: input.status,
    policyDecisionId: authority.policyDecisionId,
    evidenceRefs: allEvidence,
  });
  const completeRun = ElectronCdpObservationRunSchema.parse({
    ...run,
    plan: blockedPlan,
    evidenceRefs: allEvidence,
    auditEventIds: [auditEvent.id],
  });

  return {
    manifest,
    authority,
    capabilityResult: createCapabilityResult(
      input.status,
      input.reason,
      allEvidence,
      [auditEvent],
    ),
    electronRun: completeRun,
    evidenceRefs: allEvidence,
    auditEvents: [auditEvent],
    approvalRequired: plan.observationPlan.runnerMode === 'controlled-local-http',
  };
}

function createObservationSummary(
  plan: ElectronCdpAdapterPlan,
  fixture: ElectronCdpFixtureRunnerResult,
): ElectronCdpObservationSummary {
  return ElectronCdpObservationSummarySchema.parse({
    id: `electron_summary_${plan.observationPlan.id}`,
    schemaVersion,
    observedAt: new Date().toISOString(),
    source:
      fixture.sourceLabel ??
      (plan.observationPlan.runnerMode === 'controlled-local-http'
        ? 'electron-cdp.controlled-local-http'
        : 'electron-cdp.fixture'),
    kind: 'electron.cdp.summary',
    severity: fixture.status === 'failed' ? 'error' : 'info',
    planId: plan.observationPlan.id,
    processSummary: plan.observationPlan.processSummary,
    debugEndpoint: plan.observationPlan.debugEndpoint,
    targets: fixture.targets ?? plan.observationPlan.targets,
    consoleSummary: fixture.consoleSummary ?? createElectronCdpConsoleSummary(),
    networkSummary: fixture.networkSummary ?? createElectronCdpNetworkMetadataSummary(),
    rawPathStored: false,
    bodyStored: false,
    noRealWrite: true,
    cdpHttpBoundaryInvoked: fixture.cdpHttpBoundaryInvoked ?? false,
    processBoundaryInvoked: false,
    externalProcessStarted: false,
    summary: fixture.summary ?? 'Electron/CDP fixture observation completed.',
  });
}

function createEvidenceRefs(
  plan: ElectronCdpAdapterPlan,
  observationSummary?: ElectronCdpObservationSummary,
): EvidenceRef[] {
  return [
    ...(plan.observationPlan.processSummary
      ? [createElectronProcessEvidence(plan.observationPlan.processSummary)]
      : []),
    ...(plan.observationPlan.debugEndpoint
      ? [createElectronEndpointEvidence(plan.observationPlan.debugEndpoint)]
      : []),
    ...plan.observationPlan.targets.map((target) => createElectronTargetEvidence(target)),
    createElectronPlanEvidence(plan.observationPlan),
    ...(observationSummary ? [createElectronObservationEvidence(observationSummary)] : []),
  ];
}

function createRun(
  plan: ElectronCdpAdapterPlan,
  status: ElectronCdpObservationRunStatus,
  observationSummary: ElectronCdpObservationSummary | undefined,
  evidenceRefs: EvidenceRef[],
  auditEventIds: string[],
  summary?: string,
): ElectronCdpObservationRun {
  return ElectronCdpObservationRunSchema.parse({
    id: `electron_run_${plan.observationPlan.id}`,
    schemaVersion,
    createdAt: new Date().toISOString(),
    status,
    plan: plan.observationPlan,
    observationSummary,
    evidenceRefs,
    auditEventIds,
    rawPathStored: false,
    bodyStored: false,
    noRealWrite: true,
    cdpHttpBoundaryInvoked: observationSummary?.cdpHttpBoundaryInvoked ?? false,
    processBoundaryInvoked: false,
    externalProcessStarted: false,
    summary:
      summary ??
      (status === 'completed'
        ? 'Electron/CDP fixture observation run completed.'
        : 'Electron/CDP fixture observation run did not complete.'),
  });
}

function createCapabilityResult(
  status: CapabilityExecutionResult['status'],
  summary: string,
  evidenceRefs: readonly EvidenceRef[],
  auditEvents: readonly CapabilityAuditEvent[],
): CapabilityExecutionResult {
  return CapabilityExecutionResultSchema.parse({
    id: `capability_result_${evidenceRefs[evidenceRefs.length - 1]?.id ?? Date.now()}`,
    schemaVersion,
    createdAt: new Date().toISOString(),
    status,
    processBoundaryInvoked: false,
    externalProcessStarted: false,
    noRealWrite: true,
    evidenceRefs: evidenceRefs.map((ref) => ref.id),
    auditEventIds: auditEvents.map((event) => event.id),
    summary,
  });
}

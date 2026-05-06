import {
  DeploymentAcceptanceRehearsalRunSchema,
  type DeploymentAcceptanceRehearsalRun,
  type DeploymentAcceptanceScenario,
  DeploymentObservationPlanSchema,
  type DeploymentObservationPlan,
  DeploymentObservationRunSchema,
  type DeploymentObservationRun,
  type DeploymentProvider,
  DeploymentProviderManifestSchema,
  type DeploymentProviderManifest,
  DeploymentReadinessSchema,
  type DeploymentReadiness,
  type EvidenceRef,
  type PolicyDecision,
  PolicyDecisionSchema,
  SchemaVersionSchema,
  foundationId,
  foundationTimestamp,
} from '@codexhub/contracts';
import { hashText } from '@codexhub/evidence-kernel';

export interface DeploymentProviderAdapterManifestInput {
  provider: DeploymentProvider;
  implemented?: boolean;
  now?: () => string;
}

export interface DeploymentReadinessInput {
  provider: DeploymentProvider;
  observerEnabled?: boolean;
  providerEnabled?: boolean;
  toolConfigured?: boolean;
  target?: string;
  blockReasons?: readonly string[];
  now?: () => string;
}

export interface DeploymentObservationPlanInput {
  provider: DeploymentProvider;
  target?: string;
  requestedObservationKinds?: Array<'status' | 'plan' | 'diff' | 'drift'>;
  runnerMode?: 'planning-only' | 'fixture' | 'controlled-deployment-readonly';
  blockReasons?: readonly string[];
  now?: () => string;
}

export interface DeploymentObservationRunInput {
  plan: DeploymentObservationPlan;
  status?: 'completed' | 'failed' | 'blocked' | 'aborted';
  healthStatus?: 'healthy' | 'degraded' | 'unavailable' | 'unknown';
  driftDetected?: boolean;
  driftItemCount?: number;
  changedResourceCount?: number;
  processBoundaryInvoked?: boolean;
  externalProcessStarted?: boolean;
  blockReasons?: readonly string[];
  now?: () => string;
}

export function createDeploymentProviderManifest(
  input: DeploymentProviderAdapterManifestInput,
): DeploymentProviderManifest {
  const now = input.now ?? foundationTimestamp;
  return DeploymentProviderManifestSchema.parse({
    id: foundationId('deployment_provider_manifest'),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: now(),
    name: 'deployment-provider-adapter',
    provider: input.provider,
    version: '0.1.0',
    implemented: input.implemented ?? true,
    defaultEnabled: false,
    actionMode: 'read',
    riskLevel: 'high',
    fixedReadOnlyRunner: true,
    applyAllowed: false,
    syncAllowed: false,
    rollbackAllowed: false,
    deleteAllowed: false,
    scaleAllowed: false,
    restartAllowed: false,
    arbitraryCommandAllowed: false,
    rawOutputStored: false,
    bodyStored: false,
    summary: `${input.provider} deployment observation is read-only and disabled by default.`,
  });
}

export function createDeploymentReadiness(input: DeploymentReadinessInput): DeploymentReadiness {
  const now = input.now ?? foundationTimestamp;
  const blockReasons = [
    ...(input.blockReasons ?? []),
    ...(input.observerEnabled ? [] : ['deployment_observer_disabled']),
    ...(input.providerEnabled ? [] : [`deployment_${input.provider}_disabled`]),
    ...(input.toolConfigured ? [] : ['deployment_tool_missing']),
  ];

  return DeploymentReadinessSchema.parse({
    id: foundationId('deployment_readiness'),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: now(),
    provider: input.provider,
    observerEnabled: input.observerEnabled ?? false,
    providerEnabled: input.providerEnabled ?? false,
    toolConfigured: input.toolConfigured ?? false,
    toolHash: input.toolConfigured ? hashText(`${input.provider}:tool`) : undefined,
    targetHash: input.target ? hashText(input.target) : undefined,
    blockerCount: blockReasons.length,
    blockReasons,
    tokenValueStored: false,
    rawKubeconfigStored: false,
    rawContextStored: false,
    rawNamespaceStored: false,
    rawPathStored: false,
    bodyStored: false,
    summary:
      blockReasons.length > 0
        ? `${input.provider} deployment observation is blocked.`
        : `${input.provider} deployment observation is ready.`,
  });
}

export function createDeploymentObservationPlan(
  input: DeploymentObservationPlanInput,
): DeploymentObservationPlan {
  const now = input.now ?? foundationTimestamp;
  const blockReasons = [...(input.blockReasons ?? [])];
  return DeploymentObservationPlanSchema.parse({
    id: foundationId('deployment_observation_plan'),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: now(),
    dryRunId: foundationId('deployment_observation_dry_run'),
    status: blockReasons.length > 0 ? 'blocked' : 'planned',
    provider: input.provider,
    runnerMode: input.runnerMode ?? 'controlled-deployment-readonly',
    targetHash: hashText(input.target ?? `${input.provider}:target`),
    requestedObservationKinds: input.requestedObservationKinds ?? ['status'],
    blockReasons,
    policyDecision: createDeploymentPolicyDecision(input.provider, now),
    requiresApproval: true,
    evidenceRefs: [
      createDeploymentEvidenceRef(
        'deployment.observation_plan',
        hashText(`${input.provider}:observation-plan`),
        'Deployment observation plan is metadata-only.',
        now,
      ),
    ],
    auditEventIds: [foundationId('audit_deployment_observation_plan')],
    processBoundaryPlanned: blockReasons.length === 0 && input.runnerMode !== 'fixture',
    processBoundaryInvoked: false,
    externalProcessStarted: false,
    networkBoundaryInvoked: false,
    noRealWrite: true,
    fixedReadOnlyRunner: true,
    applyAllowed: false,
    syncAllowed: false,
    rollbackAllowed: false,
    deleteAllowed: false,
    scaleAllowed: false,
    restartAllowed: false,
    arbitraryCommandAllowed: false,
    rawOutputStored: false,
    rawPlanStored: false,
    rawDiffStored: false,
    rawLogStored: false,
    rawPathStored: false,
    bodyStored: false,
    summary:
      blockReasons.length > 0
        ? `${input.provider} deployment observation is blocked before runner start.`
        : `${input.provider} deployment observation is planned as read-only.`,
  });
}

export function createDeploymentObservationRun(input: DeploymentObservationRunInput): DeploymentObservationRun {
  const now = input.now ?? foundationTimestamp;
  const blockReasons = [...(input.blockReasons ?? [])];
  const driftDetected = input.driftDetected ?? false;
  const status = input.status ?? (blockReasons.length > 0 ? 'blocked' : 'completed');
  const targetHash = input.plan.targetHash;

  return DeploymentObservationRunSchema.parse({
    id: foundationId('deployment_observation_run'),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: now(),
    status,
    plan: input.plan,
    providerStatus: {
      id: foundationId('deployment_provider_status'),
      schemaVersion: SchemaVersionSchema.value,
      createdAt: now(),
      provider: input.plan.provider,
      targetHash,
      status: input.healthStatus ?? (status === 'completed' ? 'healthy' : 'unknown'),
      resourceCount: status === 'completed' ? 1 : 0,
      warningCount: status === 'completed' ? 0 : 1,
      errorCount: status === 'failed' ? 1 : 0,
      statusHash: hashText(`${input.plan.provider}:${status}:${input.healthStatus ?? 'unknown'}`),
      rawOutputStored: false,
      rawPathStored: false,
      bodyStored: false,
      summary: 'Deployment provider status stores counts and hashes only.',
    },
    driftSummary: {
      id: foundationId('deployment_drift_summary'),
      schemaVersion: SchemaVersionSchema.value,
      createdAt: now(),
      provider: input.plan.provider,
      targetHash,
      driftDetected,
      driftItemCount: input.driftItemCount ?? (driftDetected ? 1 : 0),
      driftHash: hashText(`${input.plan.provider}:drift:${driftDetected}`),
      rawPlanStored: false,
      rawDiffStored: false,
      rawLogStored: false,
      rawPathStored: false,
      bodyStored: false,
      summary: driftDetected
        ? 'Deployment drift detected as metadata only.'
        : 'No deployment drift detected.',
    },
    planDiffSummary: {
      id: foundationId('deployment_plan_diff_summary'),
      schemaVersion: SchemaVersionSchema.value,
      createdAt: now(),
      provider: input.plan.provider,
      targetHash,
      planHash: hashText(`${input.plan.provider}:plan`),
      diffHash: hashText(`${input.plan.provider}:diff`),
      changedResourceCount: input.changedResourceCount ?? 0,
      rawPlanStored: false,
      rawDiffStored: false,
      rawLogStored: false,
      rawPathStored: false,
      bodyStored: false,
      summary: 'Deployment plan and diff are represented by hashes only.',
    },
    responseBodyHashes: [],
    blockReasons,
    evidenceRefs: [
      createDeploymentEvidenceRef(
        'deployment.observation_summary',
        hashText(`${input.plan.provider}:observation:${status}`),
        'Deployment observation result is metadata-only.',
        now,
      ),
    ],
    auditEventIds: [foundationId('audit_deployment_observation_run')],
    processBoundaryInvoked: input.processBoundaryInvoked ?? input.plan.runnerMode === 'controlled-deployment-readonly',
    externalProcessStarted: input.externalProcessStarted ?? input.plan.runnerMode === 'controlled-deployment-readonly',
    networkBoundaryInvoked: false,
    noRealWrite: true,
    fixedReadOnlyRunner: true,
    applyAllowed: false,
    syncAllowed: false,
    rollbackAllowed: false,
    deleteAllowed: false,
    scaleAllowed: false,
    restartAllowed: false,
    arbitraryCommandAllowed: false,
    rawOutputStored: false,
    rawPlanStored: false,
    rawDiffStored: false,
    rawLogStored: false,
    rawPathStored: false,
    bodyStored: false,
    summary: `${input.plan.provider} deployment observation finished with status ${status}.`,
  });
}

export function runDeploymentAcceptanceRehearsal(input: {
  provider: DeploymentProvider;
  scenario: DeploymentAcceptanceScenario;
  now?: () => string;
}): DeploymentAcceptanceRehearsalRun {
  const now = input.now ?? foundationTimestamp;
  const passed = input.scenario === 'all-pass';
  return DeploymentAcceptanceRehearsalRunSchema.parse({
    id: foundationId('deployment_rehearsal'),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: now(),
    scenario: input.scenario,
    provider: input.provider,
    status: passed ? 'passed' : input.scenario === 'status-unavailable' ? 'failed' : 'blocked',
    readinessStatus:
      input.scenario === 'provider-disabled' || input.scenario === 'tool-missing'
        ? 'blocked'
        : 'fixture_completed',
    observationStatus: passed ? 'fixture_completed' : 'blocked',
    stepCount: 2,
    blockerCount: passed ? 0 : 1,
    evidenceRefCount: 2,
    auditEventCount: 2,
    networkBoundaryInvoked: false,
    processBoundaryInvoked: false,
    externalProcessStarted: false,
    noRealWrite: true,
    fixedReadOnlyRunner: true,
    applyAllowed: false,
    syncAllowed: false,
    rollbackAllowed: false,
    deleteAllowed: false,
    scaleAllowed: false,
    restartAllowed: false,
    arbitraryCommandAllowed: false,
    rawOutputStored: false,
    rawPlanStored: false,
    rawDiffStored: false,
    rawLogStored: false,
    rawPathStored: false,
    bodyStored: false,
    summary: passed
      ? `${input.provider} deployment rehearsal passed with fixture metadata.`
      : `${input.provider} deployment rehearsal blocked for ${input.scenario}.`,
  });
}

function createDeploymentPolicyDecision(provider: DeploymentProvider, now: () => string): PolicyDecision {
  return PolicyDecisionSchema.parse({
    id: foundationId('policy_deployment_observation'),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: now(),
    actionId: foundationId('deployment_observation'),
    actionType: `deployment.${provider}.observe`,
    actionMode: 'read',
    riskLevel: 'high',
    outcome: 'approval_required',
    reasons: ['live deployment observation requires persisted approval'],
    requiresDryRun: true,
    requiresApproval: true,
  });
}

function createDeploymentEvidenceRef(
  kind: EvidenceRef['kind'],
  hash: string,
  summary: string,
  now: () => string,
): EvidenceRef {
  return {
    id: foundationId('evidence_deployment'),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: now(),
    kind,
    hash,
    summary,
    redacted: true,
    labels: ['metadata-only'],
  };
}

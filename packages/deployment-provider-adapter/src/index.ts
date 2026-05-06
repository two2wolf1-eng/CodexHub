import {
  DeploymentAcceptanceRehearsalRunSchema,
  type DeploymentAcceptanceRehearsalRun,
  type DeploymentAcceptanceScenario,
  DeploymentEnvironmentApprovalPolicySchema,
  type DeploymentEnvironment,
  type DeploymentEnvironmentApprovalPolicy,
  DeploymentOperationAcceptanceRehearsalRunSchema,
  type DeploymentOperationAcceptanceRehearsalRun,
  type DeploymentOperationAcceptanceScenario,
  type DeploymentOperationAction,
  DeploymentOperationApprovalArtifactSchema,
  type DeploymentOperationApprovalArtifact,
  DeploymentOperationPlanSchema,
  type DeploymentOperationPlan,
  DeploymentOperationReadinessSchema,
  type DeploymentOperationReadiness,
  DeploymentOperationResultSummarySchema,
  type DeploymentOperationResultSummary,
  DeploymentOperationRunSchema,
  type DeploymentOperationRun,
  DeploymentRollbackPlanSchema,
  type DeploymentRollbackPlan,
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

export interface DeploymentEnvironmentApprovalPolicyInput {
  environment: DeploymentEnvironment;
  now?: () => string;
}

export interface DeploymentOperationReadinessInput {
  provider: DeploymentProvider;
  action: DeploymentOperationAction;
  environment: DeploymentEnvironment;
  operatorEnabled?: boolean;
  providerWriteEnabled?: boolean;
  prodWriteEnabled?: boolean;
  toolConfigured?: boolean;
  target?: string;
  artifact?: string;
  rollbackPlanRequired?: boolean;
  rollbackPlanPresent?: boolean;
  blockReasons?: readonly string[];
  now?: () => string;
}

export interface DeploymentRollbackPlanInput {
  provider: DeploymentProvider;
  environment: DeploymentEnvironment;
  target?: string;
  sourceRun?: string;
  rollbackArtifact?: string;
  approvedRollbackArtifact?: string;
  status?: 'planned' | 'blocked' | 'approved' | 'superseded';
  blockReasons?: readonly string[];
  now?: () => string;
}

export interface DeploymentOperationPlanInput {
  provider: DeploymentProvider;
  action: DeploymentOperationAction;
  environment: DeploymentEnvironment;
  target?: string;
  artifact?: string;
  rollbackPlan?: DeploymentRollbackPlan;
  runnerMode?: 'planning-only' | 'fixture' | 'controlled-deployment-operation';
  blockReasons?: readonly string[];
  now?: () => string;
}

export interface DeploymentOperationApprovalInput {
  dryRunRecord: DeploymentOperationPlan;
  baseRecord?: DeploymentOperationApprovalArtifact;
  status: 'requested' | 'approved' | 'denied' | 'expired' | 'used' | 'revoked';
  approvalSlot?: 'primary' | 'secondary';
  requestedBy?: string;
  decidedBy?: string;
  reason?: string;
  now?: () => string;
}

export interface DeploymentOperationRunInput {
  plan: DeploymentOperationPlan;
  rollbackPlan?: DeploymentRollbackPlan;
  status?: 'completed' | 'failed' | 'blocked' | 'aborted';
  approvalArtifactIds?: readonly string[];
  processBoundaryInvoked?: boolean;
  externalProcessStarted?: boolean;
  networkBoundaryInvoked?: boolean;
  changedResourceCount?: number;
  warningCount?: number;
  errorCount?: number;
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

export function createDeploymentEnvironmentApprovalPolicy(
  input: DeploymentEnvironmentApprovalPolicyInput,
): DeploymentEnvironmentApprovalPolicy {
  const now = input.now ?? foundationTimestamp;
  const prod = input.environment === 'prod';

  return DeploymentEnvironmentApprovalPolicySchema.parse({
    id: foundationId('deployment_environment_approval_policy'),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: now(),
    environment: input.environment,
    requiredApprovalCount: prod ? 2 : 1,
    requiresDistinctApproverHashes: prod,
    criticalRisk: prod,
    policyHash: hashText(`deployment:${input.environment}:approval-policy:v1`),
    summary: prod
      ? 'Production deployment operations require two distinct approvals.'
      : `${input.environment} deployment operations require one persisted approval.`,
  });
}

export function createDeploymentOperationReadiness(
  input: DeploymentOperationReadinessInput,
): DeploymentOperationReadiness {
  const now = input.now ?? foundationTimestamp;
  const rollbackPlanRequired = input.rollbackPlanRequired ?? input.action === 'rollback';
  const rollbackPlanPresent = input.rollbackPlanPresent ?? !rollbackPlanRequired;
  const blockReasons = [
    ...(input.blockReasons ?? []),
    ...(input.operatorEnabled ? [] : ['deployment_operator_disabled']),
    ...(input.providerWriteEnabled ? [] : [`deployment_${input.provider}_write_disabled`]),
    ...(input.environment === 'prod' && !input.prodWriteEnabled ? ['deployment_prod_write_disabled'] : []),
    ...(input.toolConfigured ? [] : ['deployment_tool_missing']),
    ...(rollbackPlanRequired && !rollbackPlanPresent ? ['rollback_plan_missing'] : []),
  ];

  return DeploymentOperationReadinessSchema.parse({
    id: foundationId('deployment_operation_readiness'),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: now(),
    provider: input.provider,
    action: input.action,
    environment: input.environment,
    operatorEnabled: input.operatorEnabled ?? false,
    providerWriteEnabled: input.providerWriteEnabled ?? false,
    prodWriteEnabled: input.prodWriteEnabled ?? false,
    toolConfigured: input.toolConfigured ?? false,
    rollbackPlanRequired,
    rollbackPlanPresent,
    targetHash: input.target ? hashText(input.target) : undefined,
    artifactHash: input.artifact ? hashText(input.artifact) : undefined,
    blockerCount: blockReasons.length,
    blockReasons,
    approvalPolicy: createDeploymentEnvironmentApprovalPolicy({
      environment: input.environment,
      now,
    }),
    tokenValueStored: false,
    rawManifestStored: false,
    rawPlanStored: false,
    rawDiffStored: false,
    rawLogStored: false,
    rawPathStored: false,
    bodyStored: false,
    arbitraryCommandAllowed: false,
    summary:
      blockReasons.length > 0
        ? `${input.provider} ${input.action} is blocked for ${input.environment}.`
        : `${input.provider} ${input.action} is ready for governed operation.`,
  });
}

export function createDeploymentRollbackPlan(input: DeploymentRollbackPlanInput): DeploymentRollbackPlan {
  const now = input.now ?? foundationTimestamp;
  const blockReasons = [...(input.blockReasons ?? [])];

  return DeploymentRollbackPlanSchema.parse({
    id: foundationId('deployment_rollback_plan'),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: now(),
    rollbackPlanId: foundationId('deployment_rollback_plan_id'),
    status: input.status ?? (blockReasons.length > 0 ? 'blocked' : 'planned'),
    provider: input.provider,
    environment: input.environment,
    targetHash: hashText(input.target ?? `${input.provider}:${input.environment}:target`),
    sourceRunHash: hashText(input.sourceRun ?? `${input.provider}:${input.environment}:source-run`),
    rollbackArtifactHash: hashText(
      input.rollbackArtifact ?? `${input.provider}:${input.environment}:rollback-artifact`,
    ),
    approvedRollbackArtifactHash: hashText(
      input.approvedRollbackArtifact ??
        `${input.provider}:${input.environment}:approved-rollback-artifact`,
    ),
    blockReasons,
    evidenceRefs: [
      createDeploymentEvidenceRef(
        'deployment.rollback_plan',
        hashText(`${input.provider}:${input.environment}:rollback-plan`),
        'Deployment rollback plan stores hashes only.',
        now,
      ),
    ],
    auditEventIds: [foundationId('audit_deployment_rollback_plan')],
    deleteAllowed: false,
    destroyAllowed: false,
    forceAllowed: false,
    rawManifestStored: false,
    rawPlanStored: false,
    rawDiffStored: false,
    rawLogStored: false,
    rawPathStored: false,
    bodyStored: false,
    summary:
      blockReasons.length > 0
        ? `${input.provider} rollback plan is blocked.`
        : `${input.provider} rollback plan is hash-bound and metadata-only.`,
  });
}

export function createDeploymentOperationPlan(
  input: DeploymentOperationPlanInput,
): DeploymentOperationPlan {
  const now = input.now ?? foundationTimestamp;
  const blockReasons = [
    ...(input.blockReasons ?? []),
    ...(input.action === 'rollback' && !input.rollbackPlan ? ['rollback_plan_missing'] : []),
  ];
  const runnerMode = input.runnerMode ?? 'controlled-deployment-operation';
  const status = blockReasons.length > 0 ? 'blocked' : 'planned';

  return DeploymentOperationPlanSchema.parse({
    id: foundationId('deployment_operation_plan'),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: now(),
    dryRunId: foundationId('deployment_operation_dry_run'),
    status,
    provider: input.provider,
    action: input.action,
    environment: input.environment,
    runnerMode,
    targetHash: hashText(input.target ?? `${input.provider}:${input.environment}:target`),
    artifactHash: hashText(input.artifact ?? `${input.provider}:${input.action}:artifact`),
    rollbackPlanId: input.rollbackPlan?.rollbackPlanId,
    rollbackPlanHash: input.rollbackPlan ? hashText(JSON.stringify(input.rollbackPlan)) : undefined,
    approvalPolicy: createDeploymentEnvironmentApprovalPolicy({
      environment: input.environment,
      now,
    }),
    blockReasons,
    policyDecision: createDeploymentOperationPolicyDecision(
      input.provider,
      input.action,
      input.environment,
      now,
    ),
    requiresApproval: true,
    evidenceRefs: [
      createDeploymentEvidenceRef(
        'deployment.operation_plan',
        hashText(`${input.provider}:${input.action}:${input.environment}:operation-plan`),
        'Deployment operation plan is metadata-only.',
        now,
      ),
    ],
    auditEventIds: [foundationId('audit_deployment_operation_plan')],
    processBoundaryPlanned: status === 'planned' && runnerMode !== 'fixture',
    processBoundaryInvoked: false,
    externalProcessStarted: false,
    networkBoundaryPlanned: false,
    networkBoundaryInvoked: false,
    noDelete: true,
    noDestroy: true,
    fixedRunner: true,
    arbitraryCommandAllowed: false,
    rawManifestStored: false,
    rawPlanStored: false,
    rawDiffStored: false,
    rawLogStored: false,
    rawPathStored: false,
    bodyStored: false,
    summary:
      status === 'blocked'
        ? `${input.provider} ${input.action} is blocked before runner start.`
        : `${input.provider} ${input.action} is planned through a fixed governed runner.`,
  });
}

export function createDeploymentOperationApprovalRecord(
  input: DeploymentOperationApprovalInput,
): DeploymentOperationApprovalArtifact {
  const now = input.now ?? foundationTimestamp;
  const requestedIdentity = input.requestedBy ?? input.baseRecord?.approverHash ?? 'operator';
  const decidedIdentity = input.decidedBy ?? input.baseRecord?.approverHash ?? requestedIdentity;
  const reason = input.reason ?? input.baseRecord?.reasonSummary ?? `${input.status} deployment operation`;
  const status = input.status;

  return DeploymentOperationApprovalArtifactSchema.parse({
    id: foundationId('deployment_operation_approval'),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: now(),
    dryRunId: input.dryRunRecord.dryRunId,
    dryRunRecordId: input.dryRunRecord.id,
    approvalRequestId:
      input.baseRecord?.approvalRequestId ?? foundationId('deployment_operation_approval_request'),
    approvalArtifactId:
      input.baseRecord?.approvalArtifactId ?? foundationId('deployment_operation_approval_artifact'),
    status,
    approved: status === 'approved',
    policyDecisionId: input.dryRunRecord.policyDecision.id,
    provider: input.dryRunRecord.provider,
    action: input.dryRunRecord.action,
    environment: input.dryRunRecord.environment,
    targetHash: input.dryRunRecord.targetHash,
    expectedPlanHash: hashText(JSON.stringify(input.dryRunRecord)),
    approvalSlot: input.approvalSlot ?? input.baseRecord?.approvalSlot ?? 'primary',
    approvedAt: status === 'approved' ? now() : input.baseRecord?.approvedAt,
    usedAt: status === 'used' ? now() : undefined,
    deniedAt: status === 'denied' ? now() : undefined,
    revokedAt: status === 'revoked' ? now() : undefined,
    reasonHash: hashText(reason),
    reasonSummary: `${status} deployment operation approval metadata.`,
    approverHash: hashText(status === 'requested' ? requestedIdentity : decidedIdentity),
    evidenceRefs: [
      createDeploymentEvidenceRef(
        'deployment.operation_summary',
        hashText(`${input.dryRunRecord.provider}:${status}:deployment-approval`),
        'Deployment operation approval stores hashes only.',
        now,
      ),
    ],
    auditEventIds: [foundationId('audit_deployment_operation_approval')],
    tokenValueStored: false,
    rawManifestStored: false,
    rawPlanStored: false,
    rawDiffStored: false,
    rawLogStored: false,
    rawPathStored: false,
    bodyStored: false,
    summary: `${status} deployment operation approval for ${input.dryRunRecord.provider}.`,
  });
}

export function createDeploymentOperationRun(input: DeploymentOperationRunInput): DeploymentOperationRun {
  const now = input.now ?? foundationTimestamp;
  const blockReasons = [...(input.blockReasons ?? [])];
  const status = input.status ?? (blockReasons.length > 0 ? 'blocked' : 'completed');
  const boundaryInvoked =
    input.processBoundaryInvoked ??
    (status !== 'blocked' && input.plan.runnerMode === 'controlled-deployment-operation');
  const resultSummary: DeploymentOperationResultSummary = DeploymentOperationResultSummarySchema.parse({
    id: foundationId('deployment_operation_result'),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: now(),
    provider: input.plan.provider,
    action: input.plan.action,
    environment: input.plan.environment,
    targetHash: input.plan.targetHash,
    resultHash: hashText(`${input.plan.provider}:${input.plan.action}:${status}:result`),
    changedResourceCount: input.changedResourceCount ?? (status === 'completed' ? 1 : 0),
    warningCount: input.warningCount ?? (status === 'completed' ? 0 : blockReasons.length),
    errorCount: input.errorCount ?? (status === 'failed' ? 1 : 0),
    rawManifestStored: false,
    rawPlanStored: false,
    rawDiffStored: false,
    rawLogStored: false,
    rawPathStored: false,
    bodyStored: false,
    summary: `Deployment operation result completed with ${status} metadata.`,
  });

  return DeploymentOperationRunSchema.parse({
    id: foundationId('deployment_operation_run'),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: now(),
    status,
    plan: input.plan,
    resultSummary,
    rollbackPlan: input.rollbackPlan,
    approvalArtifactIds: [...(input.approvalArtifactIds ?? [])],
    blockReasons,
    evidenceRefs: [
      createDeploymentEvidenceRef(
        'deployment.operation_summary',
        hashText(`${input.plan.provider}:${input.plan.action}:${status}:operation-run`),
        'Deployment operation run stores result hashes only.',
        now,
      ),
    ],
    auditEventIds: [foundationId('audit_deployment_operation_run')],
    processBoundaryInvoked: boundaryInvoked,
    externalProcessStarted: input.externalProcessStarted ?? boundaryInvoked,
    networkBoundaryInvoked: input.networkBoundaryInvoked ?? false,
    noDelete: true,
    noDestroy: true,
    fixedRunner: true,
    arbitraryCommandAllowed: false,
    rawManifestStored: false,
    rawPlanStored: false,
    rawDiffStored: false,
    rawLogStored: false,
    rawPathStored: false,
    bodyStored: false,
    summary: `${input.plan.provider} ${input.plan.action} finished with ${status}.`,
  });
}

export function runDeploymentOperationAcceptanceRehearsal(input: {
  provider: DeploymentProvider;
  action?: DeploymentOperationAction;
  environment?: DeploymentEnvironment;
  scenario: DeploymentOperationAcceptanceScenario;
  now?: () => string;
}): DeploymentOperationAcceptanceRehearsalRun {
  const now = input.now ?? foundationTimestamp;
  const passed = input.scenario === 'all-pass';
  const rollbackScenario = input.scenario === 'rollback-plan-missing' || input.scenario === 'rollback-failed';
  const action = input.action ?? (rollbackScenario ? 'rollback' : 'apply');

  return DeploymentOperationAcceptanceRehearsalRunSchema.parse({
    id: foundationId('deployment_operation_rehearsal'),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: now(),
    scenario: input.scenario,
    provider: input.provider,
    action,
    environment: input.environment ?? 'staging',
    status: passed ? 'passed' : input.scenario.endsWith('failed') ? 'failed' : 'blocked',
    readinessStatus:
      input.scenario === 'provider-disabled' || input.scenario === 'tool-missing'
        ? 'blocked'
        : 'fixture_completed',
    operationStatus: passed ? 'fixture_completed' : input.scenario.endsWith('failed') ? 'failed' : 'blocked',
    rollbackStatus:
      action === 'rollback' && input.scenario === 'rollback-plan-missing'
        ? 'blocked'
        : action === 'rollback'
          ? 'fixture_completed'
          : 'skipped',
    stepCount: action === 'rollback' ? 4 : 3,
    blockerCount: passed ? 0 : 1,
    evidenceRefCount: 2,
    auditEventCount: 2,
    processBoundaryInvoked: false,
    externalProcessStarted: false,
    networkBoundaryInvoked: false,
    noDelete: true,
    noDestroy: true,
    fixedRunner: true,
    arbitraryCommandAllowed: false,
    rawManifestStored: false,
    rawPlanStored: false,
    rawDiffStored: false,
    rawLogStored: false,
    rawPathStored: false,
    bodyStored: false,
    summary: passed
      ? `${input.provider} deployment operation rehearsal passed with fixture metadata.`
      : `${input.provider} deployment operation rehearsal blocked for ${input.scenario}.`,
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

function createDeploymentOperationPolicyDecision(
  provider: DeploymentProvider,
  action: DeploymentOperationAction,
  environment: DeploymentEnvironment,
  now: () => string,
): PolicyDecision {
  return PolicyDecisionSchema.parse({
    id: foundationId('policy_deployment_operation'),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: now(),
    actionId: foundationId('deployment_operation'),
    actionType: `deployment.${provider}.${action}.${environment}`,
    actionMode: 'write',
    riskLevel: environment === 'prod' ? 'critical' : 'high',
    outcome: 'approval_required',
    reasons: [
      environment === 'prod'
        ? 'production deployment operations require two persisted approvals'
        : 'deployment operations require dry-run and persisted approval',
    ],
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

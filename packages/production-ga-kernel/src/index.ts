import {
  type EvidenceRef,
  type ProductionGaApprovalArtifact,
  ProductionGaApprovalArtifactSchema,
  type ProductionGaCapabilityMatrix,
  ProductionGaCapabilityMatrixSchema,
  type ProductionGaE2ERehearsalPlan,
  ProductionGaE2ERehearsalPlanSchema,
  type ProductionGaE2ERehearsalRun,
  ProductionGaE2ERehearsalRunSchema,
  type ProductionGaE2EScenario,
  type ProductionGaEvidenceBundleSummary,
  ProductionGaEvidenceBundleSummarySchema,
  type ProductionGaOperatorTrainingCompletionSummary,
  ProductionGaOperatorTrainingCompletionSummarySchema,
  type ProductionGaOperatorTrainingPlan,
  ProductionGaOperatorTrainingPlanSchema,
  type ProductionGaReadinessPlan,
  ProductionGaReadinessPlanSchema,
  type ProductionGaReadinessSummary,
  ProductionGaReadinessSummarySchema,
  type ProductionGaReleaseCandidateSignoffPlan,
  ProductionGaReleaseCandidateSignoffPlanSchema,
  type ProductionGaResidualRiskRegister,
  ProductionGaResidualRiskRegisterSchema,
  type ProductionGaSignoffRun,
  ProductionGaSignoffRunSchema,
  type ProductionGaStatus,
  type ProductionGaSurface,
  type ProductionGaThreatModel,
  ProductionGaThreatModelSchema,
  SchemaVersionSchema,
  foundationId,
  foundationTimestamp,
} from '@codexhub/contracts';
import { hashText } from '@codexhub/evidence-kernel';

export const productionGaSurfaces: readonly ProductionGaSurface[] = [
  'local-patch-review-rc',
  'github-pr-lifecycle',
  'github-merge-actions-release',
  'deployment-observe-apply-rollback',
  'secrets-governance',
  'policy-telemetry',
  'browser-electron-mcp-controlled-write',
  'runtime-external-agents',
  'platform-operations',
];

export const productionGaE2EChainSteps = [
  'patch',
  'verify',
  'pr',
  'merge',
  'release',
  'deploy',
  'observe',
  'rollback',
] as const;

type ProductionGaE2EChainStep = (typeof productionGaE2EChainSteps)[number];

interface ProductionGaE2ERehearsalOutcome {
  status: ProductionGaStatus;
  completedStepCount: number;
  blockedStepCount: number;
  failedStepCount: number;
  timelineSeeds: readonly string[];
  liveSmokeStatus: 'not_configured' | 'readiness_blocked' | 'completed';
  liveSmokeBlockerCount: number;
}

export interface ProductionGaCapabilityMatrixInput {
  readySurfaces?: readonly ProductionGaSurface[];
  blockedSurfaces?: readonly ProductionGaSurface[];
  defaultDisabledSurfaces?: readonly ProductionGaSurface[];
  criticalRiskSurfaces?: readonly ProductionGaSurface[];
  matrixSeed?: string;
  now?: () => string;
}

export interface ProductionGaThreatModelInput {
  assetSeeds?: readonly string[];
  trustBoundarySeeds?: readonly string[];
  liveBoundarySeeds?: readonly string[];
  authorityModelSeed: string;
  approvalModelSeed: string;
  evidenceAuditModelSeed: string;
  rollbackModelSeed: string;
  residualRiskCount?: number;
  unresolvedCriticalRiskCount?: number;
  now?: () => string;
}

export interface ProductionGaReadinessPlanInput {
  matrix: ProductionGaCapabilityMatrix;
  threatModel: ProductionGaThreatModel;
  foundationGateCount?: number;
  trainingModuleCount?: number;
  blockReasons?: readonly string[];
  now?: () => string;
}

export interface ProductionGaReadinessSummaryInput {
  plan: ProductionGaReadinessPlan;
  matrixStatus?: ProductionGaStatus;
  threatModelStatus?: ProductionGaStatus;
  trainingStatus?: ProductionGaStatus;
  e2eFixtureStatus?: ProductionGaStatus;
  conditionalLiveStatus?: ProductionGaStatus;
  unresolvedCriticalRiskCount?: number;
  blockerCount?: number;
  evidenceRefs?: readonly EvidenceRef[];
  auditEventIds?: readonly string[];
  now?: () => string;
}

export interface ProductionGaE2ERehearsalPlanInput {
  scenario: ProductionGaE2EScenario;
  chainSeeds?: readonly string[];
  childControlPlaneRecordSeeds?: readonly string[];
  liveSmokeMode?: 'disabled' | 'conditional';
  now?: () => string;
}

export interface ProductionGaE2ERehearsalRunInput {
  plan: ProductionGaE2ERehearsalPlan;
  status?: ProductionGaStatus;
  completedStepCount?: number;
  blockedStepCount?: number;
  failedStepCount?: number;
  liveSmokeStatus?: 'not_configured' | 'readiness_blocked' | 'completed';
  liveSmokeBlockerCount?: number;
  timelineSeeds?: readonly string[];
  evidenceRefs?: readonly EvidenceRef[];
  auditEventIds?: readonly string[];
  now?: () => string;
}

export interface ProductionGaOperatorTrainingPlanInput {
  moduleIds: readonly string[];
  trainingSeed?: string;
  now?: () => string;
}

export interface ProductionGaOperatorTrainingCompletionInput {
  trainingPlan: ProductionGaOperatorTrainingPlan;
  operatorIdentity: string;
  completedModuleCount?: number;
  evidenceRefs?: readonly EvidenceRef[];
  auditEventIds?: readonly string[];
  now?: () => string;
}

export interface ProductionGaSignoffPlanInput {
  matrix: ProductionGaCapabilityMatrix;
  threatModel: ProductionGaThreatModel;
  readinessSummary: ProductionGaReadinessSummary;
  e2eRehearsalRun: ProductionGaE2ERehearsalRun;
  unresolvedCriticalRiskCount?: number;
  blockReasons?: readonly string[];
  now?: () => string;
}

export interface ProductionGaApprovalArtifactInput {
  dryRunId: string;
  approver: string;
  decision?: 'approved' | 'denied' | 'revoked';
  reason?: string;
  expiresAt?: string;
  usedAt?: string;
  now?: () => string;
}

export interface ProductionGaSignoffRunInput {
  signoffPlan: ProductionGaReleaseCandidateSignoffPlan;
  approvals: readonly ProductionGaApprovalArtifact[];
  foundationGateStatus?: ProductionGaStatus;
  matrixStatus?: ProductionGaStatus;
  threatModelStatus?: ProductionGaStatus;
  trainingStatus?: ProductionGaStatus;
  e2eFixtureStatus?: ProductionGaStatus;
  conditionalLiveStatus?: ProductionGaStatus;
  unresolvedCriticalRiskCount?: number;
  evidenceRefs?: readonly EvidenceRef[];
  auditEventIds?: readonly string[];
  now?: () => string;
}

export interface ProductionGaResidualRiskRegisterInput {
  risks?: readonly { severity: 'low' | 'medium' | 'high' | 'critical'; resolved?: boolean }[];
  mitigationSeed?: string;
  now?: () => string;
}

export interface ProductionGaEvidenceBundleInput {
  gateSeeds?: readonly string[];
  passedGateCount?: number;
  evidenceRefs?: readonly EvidenceRef[];
  auditEventIds?: readonly string[];
  missingEvidenceCount?: number;
  now?: () => string;
}

function now(inputNow?: () => string): string {
  return (inputNow ?? foundationTimestamp)();
}

function hashList(values: readonly string[]): string {
  return hashText(JSON.stringify([...values].sort()));
}

function statusFromParts(parts: readonly ProductionGaStatus[]): ProductionGaStatus {
  if (parts.includes('failed')) {
    return 'failed';
  }
  if (parts.includes('blocked')) {
    return 'blocked';
  }
  if (parts.includes('conditionally_ready')) {
    return 'conditionally_ready';
  }
  return 'ready';
}

function buildE2ETimelineSeeds(
  completedSteps: readonly ProductionGaE2EChainStep[],
  blockedSteps: readonly ProductionGaE2EChainStep[],
  failedSteps: readonly ProductionGaE2EChainStep[],
): readonly string[] {
  return [
    ...completedSteps.map((step) => `${step}:completed`),
    ...blockedSteps.map((step) => `${step}:blocked`),
    ...failedSteps.map((step) => `${step}:failed`),
  ];
}

function deriveProductionGaE2ERehearsalOutcome(
  scenario: ProductionGaE2EScenario,
  liveSmokeMode: 'disabled' | 'conditional',
): ProductionGaE2ERehearsalOutcome {
  const steps = productionGaE2EChainSteps;
  const blockFrom = (
    step: ProductionGaE2EChainStep,
    status: ProductionGaStatus = 'blocked',
  ): ProductionGaE2ERehearsalOutcome => {
    const index = steps.indexOf(step);
    const completedSteps = steps.slice(0, index);
    const blockedSteps = steps.slice(index);

    return {
      status,
      completedStepCount: completedSteps.length,
      blockedStepCount: blockedSteps.length,
      failedStepCount: 0,
      timelineSeeds: buildE2ETimelineSeeds(completedSteps, blockedSteps, []),
      liveSmokeStatus: 'readiness_blocked',
      liveSmokeBlockerCount: 1,
    };
  };
  const failAt = (step: ProductionGaE2EChainStep): ProductionGaE2ERehearsalOutcome => {
    const index = steps.indexOf(step);
    const completedSteps = steps.slice(0, index);
    const failedSteps = steps.slice(index, index + 1);
    const blockedSteps = steps.slice(index + 1);

    return {
      status: 'failed',
      completedStepCount: completedSteps.length,
      blockedStepCount: blockedSteps.length,
      failedStepCount: failedSteps.length,
      timelineSeeds: buildE2ETimelineSeeds(completedSteps, blockedSteps, failedSteps),
      liveSmokeStatus: 'readiness_blocked',
      liveSmokeBlockerCount: 1,
    };
  };

  switch (scenario) {
    case 'all-pass':
      return {
        status: 'ready',
        completedStepCount: steps.length,
        blockedStepCount: 0,
        failedStepCount: 0,
        timelineSeeds: buildE2ETimelineSeeds(steps, [], []),
        liveSmokeStatus: liveSmokeMode === 'disabled' ? 'not_configured' : 'readiness_blocked',
        liveSmokeBlockerCount: liveSmokeMode === 'disabled' ? 0 : 1,
      };
    case 'patch-blocked':
    case 'child-hash-mismatch':
    case 'approval-blocked':
      return blockFrom('patch');
    case 'verification-failed':
      return failAt('verify');
    case 'pr-blocked':
      return blockFrom('pr');
    case 'merge-blocked':
      return blockFrom('merge');
    case 'release-blocked':
      return blockFrom('release');
    case 'deploy-blocked':
      return blockFrom('deploy');
    case 'observe-blocked':
      return blockFrom('observe');
    case 'rollback-plan-missing':
      return blockFrom('rollback');
    case 'rollback-failed':
      return failAt('rollback');
    case 'evidence-missing':
    case 'audit-gap':
      return {
        status: 'blocked',
        completedStepCount: steps.length,
        blockedStepCount: 1,
        failedStepCount: 0,
        timelineSeeds: [...buildE2ETimelineSeeds(steps, [], []), `${scenario}:blocked`],
        liveSmokeStatus: 'readiness_blocked',
        liveSmokeBlockerCount: 1,
      };
    case 'live-env-not-configured':
      return {
        status: 'conditionally_ready',
        completedStepCount: steps.length,
        blockedStepCount: 0,
        failedStepCount: 0,
        timelineSeeds: [...buildE2ETimelineSeeds(steps, [], []), 'live-smoke:readiness-blocked'],
        liveSmokeStatus: 'readiness_blocked',
        liveSmokeBlockerCount: 1,
      };
  }
}

export function createProductionGaCapabilityMatrix(
  input: ProductionGaCapabilityMatrixInput = {},
): ProductionGaCapabilityMatrix {
  const surfaces = [...productionGaSurfaces];
  const readySurfaces = input.readySurfaces ?? surfaces;
  const blockedSurfaces = input.blockedSurfaces ?? [];
  const defaultDisabledSurfaces = input.defaultDisabledSurfaces ?? surfaces;
  const criticalRiskSurfaces = input.criticalRiskSurfaces ?? [
    'github-merge-actions-release',
    'deployment-observe-apply-rollback',
    'browser-electron-mcp-controlled-write',
    'runtime-external-agents',
    'platform-operations',
  ];

  return ProductionGaCapabilityMatrixSchema.parse({
    id: foundationId('production_ga_capability_matrix'),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: now(input.now),
    matrixHash: hashList([...(input.matrixSeed ? [input.matrixSeed] : []), ...surfaces]),
    surfaceCount: surfaces.length,
    surfaces,
    readySurfaceCount: readySurfaces.length,
    blockedSurfaceCount: blockedSurfaces.length,
    defaultDisabledSurfaceCount: defaultDisabledSurfaces.length,
    criticalRiskSurfaceCount: criticalRiskSurfaces.length,
    liveBoundaryAllowlistExpanded: false,
    childAdapterDirectExecutionAllowed: false,
    publicOutputMetadataOnly: true,
    summary: 'Production GA capability matrix is metadata-only and aggregates existing surfaces.',
  });
}

export function createProductionGaThreatModel(
  input: ProductionGaThreatModelInput,
): ProductionGaThreatModel {
  return ProductionGaThreatModelSchema.parse({
    id: foundationId('production_ga_threat_model'),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: now(input.now),
    threatModelHash: hashList([
      ...(input.assetSeeds ?? []),
      ...(input.trustBoundarySeeds ?? []),
      ...(input.liveBoundarySeeds ?? []),
      input.authorityModelSeed,
      input.approvalModelSeed,
      input.evidenceAuditModelSeed,
      input.rollbackModelSeed,
    ]),
    assetCount: input.assetSeeds?.length ?? 0,
    trustBoundaryCount: input.trustBoundarySeeds?.length ?? 0,
    liveBoundaryCount: input.liveBoundarySeeds?.length ?? 0,
    authorityModelHash: hashText(input.authorityModelSeed),
    approvalModelHash: hashText(input.approvalModelSeed),
    evidenceAuditModelHash: hashText(input.evidenceAuditModelSeed),
    rollbackModelHash: hashText(input.rollbackModelSeed),
    residualRiskCount: input.residualRiskCount ?? 0,
    unresolvedCriticalRiskCount: input.unresolvedCriticalRiskCount ?? 0,
    summary: 'Production GA threat model records assets, boundaries, authority, audit, and rollback by hash.',
  });
}

export function createProductionGaReadinessPlan(
  input: ProductionGaReadinessPlanInput,
): ProductionGaReadinessPlan {
  return ProductionGaReadinessPlanSchema.parse({
    id: foundationId('production_ga_readiness_plan'),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: now(input.now),
    dryRunId: foundationId('production_ga_dry_run'),
    matrixHash: input.matrix.matrixHash,
    threatModelHash: input.threatModel.threatModelHash,
    requiredApprovalCount: 2,
    requiredDistinctApproverHashes: true,
    requiredFoundationGateCount: input.foundationGateCount ?? 7,
    requiredTrainingModuleCount: input.trainingModuleCount ?? 8,
    e2eFixtureRequired: true,
    conditionalLiveSmokeAllowed: true,
    childAdapterDirectExecutionAllowed: false,
    blockReasons: [...(input.blockReasons ?? [])],
    summary: 'Production GA readiness plan requires complete evidence before signoff.',
  });
}

export function summarizeProductionGaReadiness(
  input: ProductionGaReadinessSummaryInput,
): ProductionGaReadinessSummary {
  const matrixStatus = input.matrixStatus ?? 'ready';
  const threatModelStatus = input.threatModelStatus ?? 'ready';
  const trainingStatus = input.trainingStatus ?? 'ready';
  const e2eFixtureStatus = input.e2eFixtureStatus ?? 'ready';
  const conditionalLiveStatus = input.conditionalLiveStatus ?? 'conditionally_ready';
  const unresolvedCriticalRiskCount = input.unresolvedCriticalRiskCount ?? 0;
  const blockerCount = input.blockerCount ?? input.plan.blockReasons.length;
  const status =
    unresolvedCriticalRiskCount > 0 || blockerCount > 0
      ? 'blocked'
      : statusFromParts([
          matrixStatus,
          threatModelStatus,
          trainingStatus,
          e2eFixtureStatus,
          conditionalLiveStatus,
        ]);

  return ProductionGaReadinessSummarySchema.parse({
    id: foundationId('production_ga_readiness_summary'),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: now(input.now),
    readinessPlanId: input.plan.id,
    status,
    matrixStatus,
    threatModelStatus,
    trainingStatus,
    e2eFixtureStatus,
    conditionalLiveStatus,
    unresolvedCriticalRiskCount,
    blockerCount,
    evidenceRefIds: [...(input.evidenceRefs ?? [])].map((ref) => ref.id),
    auditEventIds: [...(input.auditEventIds ?? [])],
    summary: 'Production GA readiness summary aggregates gates without invoking child adapters.',
  });
}

export function createProductionGaE2ERehearsalPlan(
  input: ProductionGaE2ERehearsalPlanInput,
): ProductionGaE2ERehearsalPlan {
  const chainSeeds = input.chainSeeds ?? productionGaE2EChainSteps;

  return ProductionGaE2ERehearsalPlanSchema.parse({
    id: foundationId('production_ga_e2e_rehearsal_plan'),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: now(input.now),
    scenario: input.scenario,
    chainHash: hashList(chainSeeds),
    stepCount: chainSeeds.length,
    fixtureRequired: true,
    liveSmokeMode: input.liveSmokeMode ?? 'conditional',
    childControlPlaneRecordCount: input.childControlPlaneRecordSeeds?.length ?? 0,
    rawPayloadAccepted: false,
    summary: `Production GA E2E rehearsal plan covers ${input.scenario} by metadata references.`,
  });
}

export function createProductionGaE2ERehearsalRun(
  input: ProductionGaE2ERehearsalRunInput,
): ProductionGaE2ERehearsalRun {
  const derivedOutcome = deriveProductionGaE2ERehearsalOutcome(
    input.plan.scenario,
    input.plan.liveSmokeMode,
  );
  const status = input.status ?? derivedOutcome.status;

  return ProductionGaE2ERehearsalRunSchema.parse({
    id: foundationId('production_ga_e2e_rehearsal_run'),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: now(input.now),
    rehearsalPlanId: input.plan.id,
    scenario: input.plan.scenario,
    status,
    completedStepCount: input.completedStepCount ?? derivedOutcome.completedStepCount,
    blockedStepCount: input.blockedStepCount ?? derivedOutcome.blockedStepCount,
    failedStepCount: input.failedStepCount ?? derivedOutcome.failedStepCount,
    liveSmokeStatus: input.liveSmokeStatus ?? derivedOutcome.liveSmokeStatus,
    liveSmokeBlockerCount: input.liveSmokeBlockerCount ?? derivedOutcome.liveSmokeBlockerCount,
    timelineHash: hashList(
      input.timelineSeeds ?? [input.plan.id, input.plan.chainHash, ...derivedOutcome.timelineSeeds],
    ),
    processBoundaryInvoked: false,
    networkBoundaryInvoked: false,
    remoteProviderBoundaryInvoked: false,
    childAdapterInvokedDirectly: false,
    evidenceRefIds: [...(input.evidenceRefs ?? [])].map((ref) => ref.id),
    auditEventIds: [...(input.auditEventIds ?? [])],
    summary: 'Production GA rehearsal run stores only the chain timeline hash and counts.',
  });
}

export function createProductionGaOperatorTrainingPlan(
  input: ProductionGaOperatorTrainingPlanInput,
): ProductionGaOperatorTrainingPlan {
  return ProductionGaOperatorTrainingPlanSchema.parse({
    id: foundationId('production_ga_operator_training_plan'),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: now(input.now),
    trainingPlanHash: hashList([...(input.trainingSeed ? [input.trainingSeed] : []), ...input.moduleIds]),
    moduleCount: input.moduleIds.length,
    moduleIdHashes: [...input.moduleIds].map((moduleId) => hashText(moduleId)),
    requiredForGa: true,
    rawOperatorIdentityStored: false,
    summary: 'Production GA operator training plan stores module hashes only.',
  });
}

export function createProductionGaOperatorTrainingCompletion(
  input: ProductionGaOperatorTrainingCompletionInput,
): ProductionGaOperatorTrainingCompletionSummary {
  const requiredModuleCount = input.trainingPlan.moduleCount;
  const completedModuleCount = input.completedModuleCount ?? requiredModuleCount;

  return ProductionGaOperatorTrainingCompletionSummarySchema.parse({
    id: foundationId('production_ga_operator_training_completion'),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: now(input.now),
    trainingPlanHash: input.trainingPlan.trainingPlanHash,
    operatorHash: hashText(input.operatorIdentity),
    completedModuleCount,
    requiredModuleCount,
    status: completedModuleCount >= requiredModuleCount ? 'ready' : 'blocked',
    rawOperatorIdentityStored: false,
    evidenceRefIds: [...(input.evidenceRefs ?? [])].map((ref) => ref.id),
    auditEventIds: [...(input.auditEventIds ?? [])],
    summary: 'Production GA training completion stores operator and module hashes only.',
  });
}

export function createProductionGaReleaseCandidateSignoffPlan(
  input: ProductionGaSignoffPlanInput,
): ProductionGaReleaseCandidateSignoffPlan {
  const blockReasons = [
    ...(input.blockReasons ?? []),
    ...((input.unresolvedCriticalRiskCount ?? input.threatModel.unresolvedCriticalRiskCount) > 0
      ? ['unresolved_critical_risk']
      : []),
  ];

  return ProductionGaReleaseCandidateSignoffPlanSchema.parse({
    id: foundationId('production_ga_signoff_plan'),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: now(input.now),
    dryRunId: foundationId('production_ga_signoff_dry_run'),
    matrixHash: input.matrix.matrixHash,
    threatModelHash: input.threatModel.threatModelHash,
    readinessSummaryId: input.readinessSummary.id,
    e2eRehearsalRunId: input.e2eRehearsalRun.id,
    requiredApprovalCount: 2,
    requiredDistinctApproverHashes: true,
    unresolvedCriticalRiskCount:
      input.unresolvedCriticalRiskCount ?? input.threatModel.unresolvedCriticalRiskCount,
    conditionalLiveSmokeAllowed: true,
    blockReasons,
    summary: 'Production GA release candidate signoff plan requires two approvals and zero critical blockers.',
  });
}

export function createProductionGaApprovalArtifact(
  input: ProductionGaApprovalArtifactInput,
): ProductionGaApprovalArtifact {
  const decision = input.decision ?? 'approved';

  return ProductionGaApprovalArtifactSchema.parse({
    id: foundationId('production_ga_approval'),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: now(input.now),
    dryRunId: input.dryRunId,
    approverHash: hashText(input.approver),
    decision,
    approved: decision === 'approved',
    reasonHash: input.reason ? hashText(input.reason) : undefined,
    expiresAt: input.expiresAt,
    usedAt: input.usedAt,
    requestBodyStored: false,
    rawReasonStored: false,
    summary: 'Production GA approval artifact stores only approver and reason hashes.',
  });
}

export function createProductionGaSignoffRun(
  input: ProductionGaSignoffRunInput,
): ProductionGaSignoffRun {
  const approvedArtifacts = input.approvals.filter((approval) => approval.approved);
  const approverHashes = approvedArtifacts.map((approval) => approval.approverHash);
  const distinctApproverCount = new Set(approverHashes).size;
  const unresolvedCriticalRiskCount =
    input.unresolvedCriticalRiskCount ?? input.signoffPlan.unresolvedCriticalRiskCount;
  const foundationGateStatus = input.foundationGateStatus ?? 'ready';
  const matrixStatus = input.matrixStatus ?? 'ready';
  const threatModelStatus = input.threatModelStatus ?? 'ready';
  const trainingStatus = input.trainingStatus ?? 'ready';
  const e2eFixtureStatus = input.e2eFixtureStatus ?? 'ready';
  const conditionalLiveStatus = input.conditionalLiveStatus ?? 'conditionally_ready';
  const requiredStatuses = [
    foundationGateStatus,
    matrixStatus,
    threatModelStatus,
    trainingStatus,
    e2eFixtureStatus,
  ];
  const status =
    unresolvedCriticalRiskCount > 0 || approvedArtifacts.length < 2 || distinctApproverCount < 2
      ? 'blocked'
      : requiredStatuses.includes('failed') || conditionalLiveStatus === 'failed'
        ? 'failed'
        : requiredStatuses.some((part) => part !== 'ready') || conditionalLiveStatus === 'blocked'
          ? 'blocked'
          : conditionalLiveStatus === 'conditionally_ready'
            ? 'conditionally_ready'
            : 'ready';

  return ProductionGaSignoffRunSchema.parse({
    id: foundationId('production_ga_signoff_run'),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: now(input.now),
    signoffPlanId: input.signoffPlan.id,
    status,
    approvalArtifactIds: approvedArtifacts.map((approval) => approval.id),
    approverHashes,
    approvalConsumedCount: status === 'ready' || status === 'conditionally_ready' ? 2 : 0,
    foundationGateStatus,
    matrixStatus,
    threatModelStatus,
    trainingStatus,
    e2eFixtureStatus,
    conditionalLiveStatus,
    unresolvedCriticalRiskCount,
    signoffHash: hashList([input.signoffPlan.id, ...approvedArtifacts.map((approval) => approval.id)]),
    processBoundaryInvoked: false,
    networkBoundaryInvoked: false,
    remoteProviderBoundaryInvoked: false,
    childAdapterInvokedDirectly: false,
    evidenceRefIds: [...(input.evidenceRefs ?? [])].map((ref) => ref.id),
    auditEventIds: [...(input.auditEventIds ?? [])],
    summary: 'Production GA signoff run aggregates release evidence without child execution.',
  });
}

export function createProductionGaResidualRiskRegister(
  input: ProductionGaResidualRiskRegisterInput = {},
): ProductionGaResidualRiskRegister {
  const risks = input.risks ?? [];
  const criticalRiskCount = risks.filter((risk) => risk.severity === 'critical').length;
  const unresolvedCriticalRiskCount = risks.filter(
    (risk) => risk.severity === 'critical' && !risk.resolved,
  ).length;
  const acceptedNonCriticalRiskCount = risks.filter(
    (risk) => risk.severity !== 'critical' && !risk.resolved,
  ).length;

  return ProductionGaResidualRiskRegisterSchema.parse({
    id: foundationId('production_ga_residual_risk_register'),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: now(input.now),
    registerHash: hashList(risks.map((risk, index) => `${index}:${risk.severity}:${risk.resolved}`)),
    riskCount: risks.length,
    criticalRiskCount,
    unresolvedCriticalRiskCount,
    acceptedNonCriticalRiskCount,
    mitigationSummaryHash: hashText(input.mitigationSeed ?? 'metadata-only-ga-risk-register'),
    summary: 'Production GA residual risk register stores counts and mitigation hash only.',
  });
}

export function createProductionGaEvidenceBundleSummary(
  input: ProductionGaEvidenceBundleInput = {},
): ProductionGaEvidenceBundleSummary {
  const gateSeeds = input.gateSeeds ?? [];
  const evidenceRefs = [...(input.evidenceRefs ?? [])];
  const auditEventIds = [...(input.auditEventIds ?? [])];

  return ProductionGaEvidenceBundleSummarySchema.parse({
    id: foundationId('production_ga_evidence_bundle'),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: now(input.now),
    bundleHash: hashList([...gateSeeds, ...evidenceRefs.map((ref) => ref.id), ...auditEventIds]),
    gateCount: gateSeeds.length,
    passedGateCount: input.passedGateCount ?? gateSeeds.length,
    evidenceCount: evidenceRefs.length,
    auditEventCount: auditEventIds.length,
    missingEvidenceCount: input.missingEvidenceCount ?? 0,
    metadataOnly: true,
    evidenceRefIds: evidenceRefs.map((ref) => ref.id),
    auditEventIds,
    summary: 'Production GA evidence bundle summary contains counts and hashes only.',
  });
}

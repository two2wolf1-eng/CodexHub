import {
  AuditChainProjectionSchema,
  EvidenceBundleProjectionSchema,
  GovernanceProjectionSummarySchema,
  SchemaVersionSchema,
  UnifiedRunProjectionSchema,
  UnifiedRunSourceSchema,
  UnifiedTimelineEventSchema,
  foundationTimestamp,
  type AuditChainProjection,
  type EvidenceBundleProjection,
  type GovernanceProjectionSummary,
  type UnifiedRunProjection,
  type UnifiedRunProjectionStatus,
  type UnifiedRunSource,
  type UnifiedTimelineEvent,
} from '@codexhub/contracts';

export interface GovernanceProjectionInputRun {
  id: string;
  source: string;
  title?: string;
  status?: string;
  evidenceRefIds?: readonly string[];
  evidenceKinds?: readonly string[];
  evidenceCount?: number;
  auditEventIds?: readonly string[];
  auditEventCount?: number;
  policyDecisionIds?: readonly string[];
  processBoundaryInvoked?: boolean;
  externalProcessStarted?: boolean;
  networkBoundaryInvoked?: boolean;
  noRealWrite?: boolean;
}

export interface GovernanceProjectionResult {
  projections: UnifiedRunProjection[];
  summary: GovernanceProjectionSummary;
}

const SOURCE_ALIASES: Record<string, UnifiedRunSource> = {
  workflow: 'orchestrator',
  development: 'orchestrator',
  codex_exec_dry_run: 'codex',
  browser_observation: 'browser',
  electron_cdp_observation: 'electron',
  worktree_run: 'worktree',
  worktree_cleanup_run: 'worktree',
  review_package_run: 'orchestrator',
  m11_pilot: 'orchestrator',
  policy_backend_projection: 'policy',
  telemetry_projection: 'telemetry',
  nx_verification: 'verification',
};

export function createUnifiedRunProjection(
  input: GovernanceProjectionInputRun,
  order = 0,
): UnifiedRunProjection {
  const now = foundationTimestamp();
  const source = normalizeSource(input.source);
  const status = normalizeStatus(input.status);
  const projectionId = stableId('unified_run_projection', `${source}:${input.id}`);
  const evidenceRefIds = [...(input.evidenceRefIds ?? [])];
  const auditEventIds = [...(input.auditEventIds ?? [])];
  const evidenceBundle = createEvidenceBundleProjection({
    runProjectionId: projectionId,
    source,
    evidenceRefIds,
    evidenceKinds: input.evidenceKinds ?? [],
    evidenceCount: input.evidenceCount ?? evidenceRefIds.length,
    createdAt: now,
  });
  const auditChain = createAuditChainProjection({
    runProjectionId: projectionId,
    source,
    auditEventIds,
    auditEventCount: input.auditEventCount ?? auditEventIds.length,
    policyDecisionIds: input.policyDecisionIds ?? [],
    createdAt: now,
  });
  const timeline = [
    createUnifiedTimelineEvent({
      runProjectionId: projectionId,
      source,
      status,
      order,
      evidenceRefIds,
      auditEventIds,
      createdAt: now,
    }),
  ];

  return UnifiedRunProjectionSchema.parse({
    id: projectionId,
    schemaVersion: SchemaVersionSchema.value,
    createdAt: now,
    source,
    sourceRunIdHash: stableHash(input.id),
    titleHash: stableHash(input.title ?? input.id),
    status,
    timeline,
    evidenceBundle,
    auditChain,
    processBoundaryInvoked: input.processBoundaryInvoked ?? false,
    externalProcessStarted: input.externalProcessStarted ?? false,
    networkBoundaryInvoked: input.networkBoundaryInvoked ?? false,
    noRealWrite: input.noRealWrite ?? true,
    rawPathStored: false,
    bodyStored: false,
    summary: `${source} projection status=${status} evidence=${evidenceBundle.evidenceCount} audit=${auditChain.auditEventCount}.`,
  });
}

export function createGovernanceProjection(
  inputs: readonly GovernanceProjectionInputRun[],
): GovernanceProjectionResult {
  const projections = inputs.map((input, index) => createUnifiedRunProjection(input, index));
  const sourceBreakdown = projections.reduce<Record<UnifiedRunSource, number>>(
    (accumulator, projection) => ({
      ...accumulator,
      [projection.source]: (accumulator[projection.source] ?? 0) + 1,
    }),
    {} as Record<UnifiedRunSource, number>,
  );
  const evidenceCount = projections.reduce(
    (total, projection) => total + projection.evidenceBundle.evidenceCount,
    0,
  );
  const auditEventCount = projections.reduce(
    (total, projection) => total + projection.auditChain.auditEventCount,
    0,
  );
  const now = foundationTimestamp();
  const projectionSummaryInput = JSON.stringify(
    projections.map((projection) => ({
      source: projection.source,
      sourceRunIdHash: projection.sourceRunIdHash,
      status: projection.status,
    })),
  );

  return {
    projections,
    summary: GovernanceProjectionSummarySchema.parse({
      id: stableId('governance_projection_summary', projectionSummaryInput),
      schemaVersion: SchemaVersionSchema.value,
      createdAt: now,
      status: 'ready',
      runCount: projections.length,
      sourceBreakdown,
      evidenceCount,
      auditEventCount,
      processBoundaryCount: projections.filter((projection) => projection.processBoundaryInvoked)
        .length,
      externalProcessStartedCount: projections.filter(
        (projection) => projection.externalProcessStarted,
      ).length,
      networkBoundaryCount: projections.filter((projection) => projection.networkBoundaryInvoked)
        .length,
      projectionHash: stableHash(projectionSummaryInput),
      rawPathStored: false,
      bodyStored: false,
      summary: `Unified governance projection contains ${projections.length} metadata-only runs.`,
    }),
  };
}

export function createEvidenceBundleProjection(input: {
  runProjectionId: string;
  source: UnifiedRunSource;
  evidenceRefIds: readonly string[];
  evidenceKinds: readonly string[];
  evidenceCount: number;
  createdAt: string;
}): EvidenceBundleProjection {
  return EvidenceBundleProjectionSchema.parse({
    id: stableId('evidence_bundle_projection', `${input.runProjectionId}:evidence`),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: input.createdAt,
    runProjectionId: input.runProjectionId,
    source: input.source,
    evidenceRefIds: [...input.evidenceRefIds],
    evidenceCount: input.evidenceCount,
    evidenceKinds: [...new Set(input.evidenceKinds)].sort(),
    bundleHash: stableHash(JSON.stringify(input.evidenceRefIds)),
    rawPathStored: false,
    bodyStored: false,
    summary: `Evidence bundle for ${input.source} has ${input.evidenceCount} refs.`,
  });
}

export function createAuditChainProjection(input: {
  runProjectionId: string;
  source: UnifiedRunSource;
  auditEventIds: readonly string[];
  auditEventCount: number;
  policyDecisionIds: readonly string[];
  createdAt: string;
}): AuditChainProjection {
  return AuditChainProjectionSchema.parse({
    id: stableId('audit_chain_projection', `${input.runProjectionId}:audit`),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: input.createdAt,
    runProjectionId: input.runProjectionId,
    source: input.source,
    auditEventIds: [...input.auditEventIds],
    auditEventCount: input.auditEventCount,
    policyDecisionIds: [...input.policyDecisionIds],
    chainHash: stableHash(JSON.stringify([input.auditEventIds, input.policyDecisionIds])),
    rawPathStored: false,
    bodyStored: false,
    summary: `Audit chain for ${input.source} has ${input.auditEventCount} events.`,
  });
}

export function createUnifiedTimelineEvent(input: {
  runProjectionId: string;
  source: UnifiedRunSource;
  status: UnifiedRunProjectionStatus;
  order: number;
  evidenceRefIds: readonly string[];
  auditEventIds: readonly string[];
  createdAt: string;
}): UnifiedTimelineEvent {
  return UnifiedTimelineEventSchema.parse({
    id: stableId('unified_timeline_event', `${input.runProjectionId}:${input.order}`),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: input.createdAt,
    runProjectionId: input.runProjectionId,
    source: input.source,
    phase: `${input.source}.summary`,
    status: input.status,
    order: input.order,
    evidenceRefIds: [...input.evidenceRefIds],
    auditEventIds: [...input.auditEventIds],
    summary: `${input.source} summary projected as ${input.status}.`,
    rawPathStored: false,
    bodyStored: false,
  });
}

export function normalizeSource(source: string): UnifiedRunSource {
  const normalized = SOURCE_ALIASES[source] ?? source;

  return UnifiedRunSourceSchema.parse(normalized);
}

export function normalizeStatus(status: string | undefined): UnifiedRunProjectionStatus {
  if (
    status === 'planned' ||
    status === 'running' ||
    status === 'passed' ||
    status === 'ready' ||
    status === 'completed' ||
    status === 'failed' ||
    status === 'blocked' ||
    status === 'aborted' ||
    status === 'degraded'
  ) {
    return status;
  }

  if (status === 'success') {
    return 'passed';
  }

  return 'unknown';
}

function stableHash(value: string): string {
  return `projection:${stableDigest(value)}`;
}

function stableId(prefix: string, value: string): string {
  return `${prefix}_${stableDigest(value).slice(0, 16)}`;
}

function stableDigest(value: string): string {
  let hashA = 0x811c9dc5;
  let hashB = 0x01000193;

  for (let index = 0; index < value.length; index += 1) {
    const code = value.charCodeAt(index);
    hashA = Math.imul(hashA ^ code, 0x01000193);
    hashB = Math.imul(hashB ^ code, 0x811c9dc5);
  }

  return `${(hashA >>> 0).toString(16).padStart(8, '0')}${(hashB >>> 0)
    .toString(16)
    .padStart(8, '0')}`;
}

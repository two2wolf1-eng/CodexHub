import {
  TelemetryExportRunSchema,
  type ExecutionAuthority,
  type TelemetryExportRun,
  type TelemetrySpanKind,
} from '@codexhub/contracts';
import { hashText } from '@codexhub/evidence-kernel';
import { executeTelemetryExport, type ExecuteTelemetryExportResult } from './execute';
import { planTelemetryExport, type TelemetryPlanResult } from './plan';

export interface TelemetryProjectionSourceSummary {
  sourceKind: TelemetrySpanKind;
  sourceId: string;
  status?: string;
  evidenceRefIds?: readonly string[];
  auditEventIds?: readonly string[];
  summary?: string;
  count?: number;
}

export interface LocalTelemetryProjectionSummary {
  sourceCount: number;
  spanCount: number;
  evidenceRefCount: number;
  auditEventCount: number;
  projectionHash: string;
  networkExportAttempted: false;
  processBoundaryInvoked: false;
  externalProcessStarted: false;
  rawTracePayloadStored: false;
  rawPathStored: false;
  bodyStored: false;
  noRealWrite: true;
  evidenceAuditAuthoritative: false;
  summary: string;
}

export interface LocalTelemetryProjectionPlan {
  planResult: TelemetryPlanResult;
  projectionSummary: LocalTelemetryProjectionSummary;
}

export interface ExecuteLocalTelemetryProjectionInput {
  projectionPlan: LocalTelemetryProjectionPlan;
  authority?: ExecutionAuthority;
}

export interface ExecuteLocalTelemetryProjectionResult extends ExecuteTelemetryExportResult {
  projectionSummary: LocalTelemetryProjectionSummary;
  run: TelemetryExportRun;
}

export function planLocalTelemetryProjection(
  sources: readonly TelemetryProjectionSourceSummary[] = [],
): LocalTelemetryProjectionPlan {
  const sanitizedSources = sources.map((source) => sanitizeProjectionSource(source));
  const spans = sanitizedSources.map((source) => ({
    spanKind: source.sourceKind,
    name: `codexhub.projection.${source.sourceKind}`,
    attributes: {
      sourceIdHash: source.sourceIdHash,
      statusHash: source.statusHash,
      summaryHash: source.summaryHash,
      evidenceRefCount: source.evidenceRefCount,
      auditEventCount: source.auditEventCount,
      count: source.count,
    },
    eventCount: source.evidenceRefCount + source.auditEventCount,
    linkCount: source.evidenceRefCount + source.auditEventCount,
  }));
  const planResult = planTelemetryExport({
    exporterKind: 'noop',
    signalKinds: ['trace'],
    spans,
  });
  const projectionHash = `sha256:${hashText(
    JSON.stringify({
      sourceHashes: sanitizedSources.map((source) => source.sourceHash),
      spanHashes: planResult.spans.map((span) => span.payloadHash),
    }),
  )}`;

  return {
    planResult,
    projectionSummary: {
      sourceCount: sanitizedSources.length,
      spanCount: planResult.spans.length,
      evidenceRefCount: sanitizedSources.reduce(
        (total, source) => total + source.evidenceRefCount,
        0,
      ),
      auditEventCount: sanitizedSources.reduce((total, source) => total + source.auditEventCount, 0),
      projectionHash,
      networkExportAttempted: false,
      processBoundaryInvoked: false,
      externalProcessStarted: false,
      rawTracePayloadStored: false,
      rawPathStored: false,
      bodyStored: false,
      noRealWrite: true,
      evidenceAuditAuthoritative: false,
      summary: 'Local telemetry projection generated from CodexHub metadata summaries.',
    },
  };
}

export async function executeLocalTelemetryProjection(
  input: ExecuteLocalTelemetryProjectionInput,
): Promise<ExecuteLocalTelemetryProjectionResult> {
  const result = await executeTelemetryExport({
    planResult: input.projectionPlan.planResult,
    authority: input.authority,
    exporter: () => ({
      status: 'completed',
      summary: 'Local telemetry projection completed without network export.',
    }),
  });

  return {
    ...result,
    projectionSummary: input.projectionPlan.projectionSummary,
    run: TelemetryExportRunSchema.parse(result.run),
  };
}

function sanitizeProjectionSource(source: TelemetryProjectionSourceSummary): {
  sourceKind: TelemetrySpanKind;
  sourceIdHash: string;
  statusHash?: string;
  summaryHash?: string;
  evidenceRefCount: number;
  auditEventCount: number;
  count: number;
  sourceHash: string;
} {
  const evidenceRefCount = source.evidenceRefIds?.length ?? 0;
  const auditEventCount = source.auditEventIds?.length ?? 0;
  const sourceIdHash = `sha256:${hashText(source.sourceId)}`;
  const statusHash = source.status ? `sha256:${hashText(source.status)}` : undefined;
  const summaryHash = source.summary ? `sha256:${hashText(source.summary)}` : undefined;
  const evidenceRefHashes = (source.evidenceRefIds ?? []).map((id) => `sha256:${hashText(id)}`);
  const auditEventHashes = (source.auditEventIds ?? []).map((id) => `sha256:${hashText(id)}`);

  return {
    sourceKind: source.sourceKind,
    sourceIdHash,
    statusHash,
    summaryHash,
    evidenceRefCount,
    auditEventCount,
    count: source.count ?? 0,
    sourceHash: `sha256:${hashText(
      JSON.stringify({
        sourceKind: source.sourceKind,
        sourceIdHash,
        statusHash,
        summaryHash,
        evidenceRefHashes,
        auditEventHashes,
        count: source.count ?? 0,
      }),
    )}`,
  };
}

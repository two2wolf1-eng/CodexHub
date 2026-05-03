import {
  type EvidenceRef,
  type TelemetryExportRun,
  type TelemetrySpanSummary,
  type TelemetryTraceExportPlan,
} from '@codexhub/contracts';
import { createEvidenceRef } from '@codexhub/evidence-kernel';

export function createTelemetryTracePlanEvidence(plan: TelemetryTraceExportPlan): EvidenceRef {
  return createEvidenceRef({
    kind: 'telemetry.trace_plan',
    label: 'otel-trace-plan',
    summary: plan.summary,
    metadata: {
      planId: plan.id,
      exporterKind: plan.exporterKind,
      signalKinds: plan.signalKinds,
      spanCount: plan.spanCount,
      networkExportPlanned: false,
      processBoundaryPlanned: false,
      rawTracePayloadStored: false,
      rawPathStored: false,
      bodyStored: false,
      evidenceAuditAuthoritative: false,
      noRealWrite: true,
    },
  });
}

export function createTelemetrySpanEvidence(span: TelemetrySpanSummary): EvidenceRef {
  return createEvidenceRef({
    kind: 'telemetry.span_summary',
    label: 'otel-span-summary',
    summary: span.summary,
    metadata: {
      spanId: span.id,
      signalKind: span.signalKind,
      spanKind: span.spanKind,
      traceIdHash: span.traceIdHash,
      spanIdHash: span.spanIdHash,
      nameHash: span.nameHash,
      attributeCount: span.attributeCount,
      eventCount: span.eventCount,
      linkCount: span.linkCount,
      payloadHash: span.payloadHash,
      rawTracePayloadStored: false,
      rawPathStored: false,
      bodyStored: false,
      evidenceAuditAuthoritative: false,
      noRealWrite: true,
    },
  });
}

export function createTelemetryExportEvidence(run: TelemetryExportRun): EvidenceRef {
  return createEvidenceRef({
    kind: 'telemetry.export_summary',
    label: 'otel-export-summary',
    summary: run.summary,
    metadata: {
      runId: run.id,
      planId: run.planId,
      exporterKind: run.exporterKind,
      exportedSpanCount: run.exportedSpanCount,
      exportSummaryHash: run.exportSummaryHash,
      networkExportAttempted: false,
      processBoundaryInvoked: false,
      externalProcessStarted: false,
      rawTracePayloadStored: false,
      rawPathStored: false,
      bodyStored: false,
      evidenceAuditAuthoritative: false,
      noRealWrite: true,
    },
  });
}

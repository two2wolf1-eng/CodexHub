import {
  CapabilityDryRunSchema,
  SchemaVersionSchema,
  TelemetrySpanSummarySchema,
  TelemetryTraceExportPlanSchema,
  type TelemetryExporterKind,
  type TelemetrySignalKind,
  type TelemetrySpanKind,
  type TelemetrySpanSummary,
  type TelemetryTraceExportPlan,
  foundationId,
  foundationTimestamp,
} from '@codexhub/contracts';
import { hashText } from '@codexhub/evidence-kernel';
import { OTEL_ADAPTER_NAME } from './manifest';

export interface TelemetrySpanInput {
  signalKind?: TelemetrySignalKind;
  spanKind: TelemetrySpanKind;
  name: string;
  attributes?: Record<string, unknown>;
  eventCount?: number;
  linkCount?: number;
  durationMs?: number;
}

export interface TelemetryPlanInput {
  exporterKind?: TelemetryExporterKind;
  signalKinds?: TelemetrySignalKind[];
  spans?: TelemetrySpanInput[];
}

export interface TelemetryPlanResult {
  plan: TelemetryTraceExportPlan;
  spans: TelemetrySpanSummary[];
  capabilityDryRun: ReturnType<typeof CapabilityDryRunSchema.parse>;
}

export function planTelemetryExport(input: TelemetryPlanInput = {}): TelemetryPlanResult {
  const exporterKind = input.exporterKind ?? 'noop';
  const spans = (input.spans ?? []).map((span) => createSpanSummary(span));
  const signalKinds = input.signalKinds ?? unique(spans.map((span) => span.signalKind));
  const tracePlanHash = `sha256:${hashText(
    JSON.stringify({
      exporterKind,
      signalKinds,
      spanHashes: spans.map((span) => span.payloadHash),
    }),
  )}`;
  const plan = TelemetryTraceExportPlanSchema.parse({
    id: foundationId('telemetry_plan'),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: foundationTimestamp(),
    adapterName: OTEL_ADAPTER_NAME,
    exporterKind,
    signalKinds: signalKinds.length > 0 ? signalKinds : ['trace'],
    spanCount: spans.length,
    tracePlanHash,
    networkExportPlanned: false,
    processBoundaryPlanned: false,
    rawTracePayloadStored: false,
    rawPathStored: false,
    bodyStored: false,
    noRealWrite: true,
    evidenceAuditAuthoritative: false,
    summary: 'Telemetry export plan is noop/fixture and metadata-only.',
  });
  const capabilityDryRun = CapabilityDryRunSchema.parse({
    id: foundationId('capability_dry_run'),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: foundationTimestamp(),
    adapterName: OTEL_ADAPTER_NAME,
    inputSummary: {
      exporterKind,
      signalKinds: plan.signalKinds,
      spanCount: spans.length,
      tracePlanHash,
      rawTracePayloadStored: false,
      bodyStored: false,
    },
    plannedActions: [
      {
        action: 'telemetry.export.noop',
        actionMode: 'read',
        risk: 'low',
        target: 'codexhub-local-telemetry',
        requiresApproval: false,
      },
    ],
    requiredEvidence: ['telemetry.trace_plan'],
    warnings: ['telemetry does not replace CodexHub evidence or audit'],
  });

  return { plan, spans, capabilityDryRun };
}

function createSpanSummary(input: TelemetrySpanInput): TelemetrySpanSummary {
  const signalKind = input.signalKind ?? 'trace';
  const payload = {
    signalKind,
    spanKind: input.spanKind,
    name: input.name,
    attributes: input.attributes ?? {},
    eventCount: input.eventCount ?? 0,
    linkCount: input.linkCount ?? 0,
    durationMs: input.durationMs,
  };

  return TelemetrySpanSummarySchema.parse({
    id: foundationId('telemetry_span'),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: foundationTimestamp(),
    signalKind,
    spanKind: input.spanKind,
    traceIdHash: `sha256:${hashText(`${input.name}:trace`)}`,
    spanIdHash: `sha256:${hashText(`${input.name}:span`)}`,
    nameHash: `sha256:${hashText(input.name)}`,
    durationMs: input.durationMs,
    attributeCount: Object.keys(input.attributes ?? {}).length,
    eventCount: input.eventCount ?? 0,
    linkCount: input.linkCount ?? 0,
    payloadHash: `sha256:${hashText(JSON.stringify(payload))}`,
    rawTracePayloadStored: false,
    rawPathStored: false,
    bodyStored: false,
    noRealWrite: true,
    evidenceAuditAuthoritative: false,
    summary: `${input.spanKind} span metadata summary.`,
  });
}

function unique<T>(values: T[]): T[] {
  return [...new Set(values)];
}

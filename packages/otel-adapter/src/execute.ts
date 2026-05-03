import {
  type CapabilityExecutionResult,
  CapabilityExecutionResultSchema,
  ExecutionAuthoritySchema,
  type ExecutionAuthority,
  SchemaVersionSchema,
  TelemetryExportRunSchema,
  type TelemetryExportRun,
  foundationId,
  foundationTimestamp,
} from '@codexhub/contracts';
import { hashText } from '@codexhub/evidence-kernel';
import { createTelemetryAuditEvent } from './audit';
import {
  createTelemetryExportEvidence,
  createTelemetrySpanEvidence,
  createTelemetryTracePlanEvidence,
} from './evidence';
import type { TelemetryPlanResult } from './plan';

export interface ExecuteTelemetryExportInput {
  planResult: TelemetryPlanResult;
  authority?: ExecutionAuthority;
  exporter?: () => { status?: 'completed' | 'failed' | 'aborted'; summary?: string };
}

export interface ExecuteTelemetryExportResult {
  run: TelemetryExportRun;
  capabilityResult: CapabilityExecutionResult;
}

export async function executeTelemetryExport(
  input: ExecuteTelemetryExportInput,
): Promise<ExecuteTelemetryExportResult> {
  const authority = ExecutionAuthoritySchema.safeParse(input.authority);

  if (!authority.success || !input.authority?.allowed) {
    return createBlockedRun(input.planResult, 'Telemetry export requires allowed authority.');
  }

  const exporterResult = input.exporter?.() ?? { status: 'completed' as const };
  const status = exporterResult.status ?? 'completed';
  const planEvidence = createTelemetryTracePlanEvidence(input.planResult.plan);
  const spanEvidence = input.planResult.spans.map((span) => createTelemetrySpanEvidence(span));
  const evidenceBeforeRun = [planEvidence, ...spanEvidence];
  const exportSummaryHash = `sha256:${hashText(
    JSON.stringify({
      planId: input.planResult.plan.id,
      exporterKind: input.planResult.plan.exporterKind,
      spans: input.planResult.spans.map((span) => span.payloadHash),
      status,
    }),
  )}`;
  const runWithoutExportEvidence = TelemetryExportRunSchema.parse({
    id: foundationId('telemetry_run'),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: foundationTimestamp(),
    status,
    planId: input.planResult.plan.id,
    exporterKind: input.planResult.plan.exporterKind,
    spans: input.planResult.spans,
    exportedSpanCount: input.planResult.spans.length,
    exportSummaryHash,
    evidenceRefs: evidenceBeforeRun,
    auditEventIds: [],
    networkExportAttempted: false,
    processBoundaryInvoked: false,
    externalProcessStarted: false,
    rawTracePayloadStored: false,
    rawPathStored: false,
    bodyStored: false,
    noRealWrite: true,
    evidenceAuditAuthoritative: false,
    summary: exporterResult.summary ?? 'Noop telemetry export completed as metadata-only.',
  });
  const exportEvidence = createTelemetryExportEvidence(runWithoutExportEvidence);
  const evidenceRefs = [...evidenceBeforeRun, exportEvidence];
  const auditEvent = createTelemetryAuditEvent({
    action: 'telemetry.export.noop',
    target: 'codexhub-local-telemetry',
    reason: 'M7a noop telemetry export completed without network exporter.',
    outcome: status,
    policyDecisionId: input.authority.policyDecisionId,
    evidenceRefs,
    metadata: {
      exporterKind: input.planResult.plan.exporterKind,
      spanCount: input.planResult.spans.length,
      evidenceAuditAuthoritative: false,
    },
  });
  const run = TelemetryExportRunSchema.parse({
    ...runWithoutExportEvidence,
    evidenceRefs,
    auditEventIds: [auditEvent.id],
  });
  const capabilityResult = CapabilityExecutionResultSchema.parse({
    id: foundationId('capability_result'),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: foundationTimestamp(),
    status,
    processBoundaryInvoked: false,
    externalProcessStarted: false,
    noRealWrite: true,
    evidenceRefs: evidenceRefs.map((ref) => ref.id),
    auditEventIds: [auditEvent.id],
    summary: run.summary,
  });

  return { run, capabilityResult };
}

function createBlockedRun(
  planResult: TelemetryPlanResult,
  summary: string,
): ExecuteTelemetryExportResult {
  const run = TelemetryExportRunSchema.parse({
    id: foundationId('telemetry_run'),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: foundationTimestamp(),
    status: 'blocked',
    planId: planResult.plan.id,
    exporterKind: planResult.plan.exporterKind,
    spans: planResult.spans,
    exportedSpanCount: 0,
    exportSummaryHash: `sha256:${hashText(summary)}`,
    evidenceRefs: [],
    auditEventIds: [],
    networkExportAttempted: false,
    processBoundaryInvoked: false,
    externalProcessStarted: false,
    rawTracePayloadStored: false,
    rawPathStored: false,
    bodyStored: false,
    noRealWrite: true,
    evidenceAuditAuthoritative: false,
    summary,
  });
  const capabilityResult = CapabilityExecutionResultSchema.parse({
    id: foundationId('capability_result'),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: foundationTimestamp(),
    status: 'blocked',
    processBoundaryInvoked: false,
    externalProcessStarted: false,
    noRealWrite: true,
    evidenceRefs: [],
    auditEventIds: [],
    summary,
  });

  return { run, capabilityResult };
}

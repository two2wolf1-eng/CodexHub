import {
  CapabilityAuditEventSchema,
  SchemaVersionSchema,
  type CapabilityAuditEvent,
  type EvidenceRef,
  foundationId,
  foundationTimestamp,
} from '@codexhub/contracts';
import { redactMetadata } from '@codexhub/evidence-kernel';
import { OTEL_ADAPTER_NAME } from './manifest';

export function createTelemetryAuditEvent(input: {
  action: string;
  target: string;
  reason: string;
  outcome: string;
  policyDecisionId: string;
  evidenceRefs: readonly EvidenceRef[];
  metadata?: Record<string, unknown>;
}): CapabilityAuditEvent {
  return CapabilityAuditEventSchema.parse({
    id: foundationId('audit'),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: foundationTimestamp(),
    actor: 'codexhub.local',
    action: input.action,
    target: input.target,
    reason: input.reason,
    outcome: input.outcome,
    policyDecisionId: input.policyDecisionId,
    evidenceRefs: [...input.evidenceRefs],
    metadata: redactMetadata({
      ...(input.metadata ?? {}),
      adapterName: OTEL_ADAPTER_NAME,
      integrationStage: 'm7c',
      liveExecution: false,
      processBoundaryInvoked: false,
      externalProcessStarted: false,
      networkExportAttempted: false,
      rawTracePayloadStored: false,
      rawPathStored: false,
      bodyStored: false,
      evidenceAuditAuthoritative: false,
      noRealWrite: true,
    }),
  });
}

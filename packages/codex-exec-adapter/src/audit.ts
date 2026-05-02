import {
  type CapabilityAuditEvent,
  type EvidenceRef,
  SchemaVersionSchema,
  foundationId,
  foundationTimestamp,
} from '@codexhub/contracts';

export function createCodexExecAdapterAuditEvent(input: {
  actor?: string;
  action: string;
  target: string;
  reason: string;
  outcome: string;
  policyDecisionId: string;
  evidenceRefs: readonly EvidenceRef[];
  metadata?: Record<string, unknown>;
}): CapabilityAuditEvent {
  return {
    id: foundationId('audit'),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: foundationTimestamp(),
    actor: input.actor ?? 'codexhub.local',
    action: input.action,
    target: input.target,
    reason: input.reason,
    outcome: input.outcome,
    policyDecisionId: input.policyDecisionId,
    evidenceRefs: [...input.evidenceRefs],
    metadata: input.metadata,
  };
}

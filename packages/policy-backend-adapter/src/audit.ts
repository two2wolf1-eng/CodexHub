import {
  CapabilityAuditEventSchema,
  SchemaVersionSchema,
  type CapabilityAuditEvent,
  type EvidenceRef,
  foundationId,
  foundationTimestamp,
} from '@codexhub/contracts';
import { redactMetadata } from '@codexhub/evidence-kernel';
import { POLICY_BACKEND_ADAPTER_NAME } from './manifest';

export function createPolicyBackendAuditEvent(input: {
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
      adapterName: POLICY_BACKEND_ADAPTER_NAME,
      integrationStage: 'm7a',
      liveExecution: false,
      processBoundaryInvoked: false,
      externalProcessStarted: false,
      networkBoundaryInvoked: false,
      backendAdvisoryOnly: true,
      authorityProvider: 'codexhub',
      rawPolicySourceStored: false,
      rawPathStored: false,
      bodyStored: false,
      noRealWrite: true,
    }),
  });
}

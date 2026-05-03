import {
  CapabilityAuditEventSchema,
  SchemaVersionSchema,
  type CapabilityAuditEvent,
  type EvidenceRef,
  type Metadata,
} from '@codexhub/contracts';
import { redactMetadata } from '@codexhub/evidence-kernel';

const schemaVersion = SchemaVersionSchema.value;

export function createElectronCdpAuditEvent(input: {
  id: string;
  actor: string;
  action: string;
  target: string;
  reason: string;
  outcome: CapabilityAuditEvent['outcome'];
  policyDecisionId: string;
  evidenceRefs: readonly EvidenceRef[];
  metadata?: Metadata;
}): CapabilityAuditEvent {
  return CapabilityAuditEventSchema.parse({
    id: input.id,
    schemaVersion,
    createdAt: new Date().toISOString(),
    actor: input.actor,
    action: input.action,
    target: input.target,
    reason: input.reason,
    outcome: input.outcome,
    policyDecisionId: input.policyDecisionId,
    evidenceRefs: input.evidenceRefs,
    metadata: redactMetadata({
      ...(input.metadata ?? {}),
      liveExecution: false,
      cdpHttpBoundaryInvoked:
        typeof input.metadata?.cdpHttpBoundaryInvoked === 'boolean'
          ? input.metadata.cdpHttpBoundaryInvoked
          : false,
      cdpWebSocketBoundaryInvoked:
        typeof input.metadata?.cdpWebSocketBoundaryInvoked === 'boolean'
          ? input.metadata.cdpWebSocketBoundaryInvoked
          : false,
      processBoundaryInvoked: false,
      externalProcessStarted: false,
      bodyStored: false,
      rawPathStored: false,
      noRealWrite: true,
      adapterName: 'electron-cdp',
      integrationStage: 'm5c',
    }),
  });
}

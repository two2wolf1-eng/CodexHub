import {
  EvidenceRefSchema,
  SchemaVersionSchema,
  type ElectronCdpObservationPlan,
  type ElectronCdpObservationRun,
  type ElectronCdpObservationSummary,
  type ElectronDebugEndpointSummary,
  type ElectronProcessSummary,
  type ElectronTargetSummary,
  type EvidenceRef,
  type Metadata,
} from '@codexhub/contracts';
import { hashText, redactMetadata } from '@codexhub/evidence-kernel';

const schemaVersion = SchemaVersionSchema.value;

export function createElectronProcessEvidence(
  processSummary: ElectronProcessSummary,
): EvidenceRef {
  return createEvidenceRef({
    id: `evidence_${processSummary.id}`,
    kind: 'electron.process_summary',
    summary: processSummary.summary,
    metadata: {
      processIdHash: processSummary.processIdHash,
      executablePathHash: processSummary.executablePathHash,
      bodyStored: false,
      rawPathStored: false,
    },
  });
}

export function createElectronEndpointEvidence(
  endpoint: ElectronDebugEndpointSummary,
): EvidenceRef {
  return createEvidenceRef({
    id: `evidence_${endpoint.id}`,
    kind: 'electron.debug_endpoint_summary',
    summary: endpoint.summary,
    metadata: {
      endpointIdHash: endpoint.endpointIdHash,
      loopbackOnly: endpoint.loopbackOnly,
      userEnabled: endpoint.userEnabled,
      mainInspectorEnabled: endpoint.mainInspectorEnabled,
      bodyStored: false,
      rawPathStored: false,
    },
  });
}

export function createElectronTargetEvidence(target: ElectronTargetSummary): EvidenceRef {
  return createEvidenceRef({
    id: `evidence_${target.id}`,
    kind: 'electron.target_summary',
    summary: target.summary,
    metadata: {
      targetIdHash: target.targetIdHash,
      targetType: target.targetType,
      titleHash: target.titleHash,
      urlHash: target.urlHash,
      bodyStored: false,
      rawPathStored: false,
    },
  });
}

export function createElectronPlanEvidence(plan: ElectronCdpObservationPlan): EvidenceRef {
  return createEvidenceRef({
    id: `evidence_${plan.id}`,
    kind: 'electron.observation_plan',
    summary: plan.summary,
    metadata: {
      planId: plan.id,
      targetCount: plan.targets.length,
      blockReasons: plan.blockReasons,
      commandDecisionCount: plan.commandDecisions.length,
      cdpHttpBoundaryPlanned: plan.cdpHttpBoundaryPlanned,
      cdpWebSocketBoundaryPlanned: plan.cdpWebSocketBoundaryPlanned,
      bodyStored: false,
      rawPathStored: false,
    },
  });
}

export function createElectronObservationEvidence(
  summary: ElectronCdpObservationSummary,
): EvidenceRef {
  return createEvidenceRef({
    id: `evidence_${summary.id}`,
    kind: 'electron.observation_summary',
    summary: summary.summary,
    metadata: {
      planId: summary.planId,
      targetCount: summary.targets.length,
      consoleMessageCount: summary.consoleSummary.messageCount,
      networkRequestCount: summary.networkSummary.requestCount,
      eventCount: summary.eventSummary?.eventCount,
      consoleEventCount: summary.eventSummary?.consoleEventCount,
      networkEventCount: summary.eventSummary?.networkEventCount,
      cdpHttpBoundaryInvoked: summary.cdpHttpBoundaryInvoked,
      cdpWebSocketBoundaryInvoked: summary.cdpWebSocketBoundaryInvoked,
      bodyStored: false,
      rawPathStored: false,
    },
  });
}

export function createElectronRunEvidence(run: ElectronCdpObservationRun): EvidenceRef {
  return createEvidenceRef({
    id: `evidence_${run.id}`,
    kind: 'electron.run_summary',
    summary: run.summary,
    metadata: {
      status: run.status,
      planId: run.plan.id,
      evidenceRefCount: run.evidenceRefs.length,
      auditEventCount: run.auditEventIds.length,
      cdpHttpBoundaryInvoked: run.cdpHttpBoundaryInvoked,
      cdpWebSocketBoundaryInvoked: run.cdpWebSocketBoundaryInvoked,
      processBoundaryInvoked: run.processBoundaryInvoked,
      externalProcessStarted: run.externalProcessStarted,
      bodyStored: false,
      rawPathStored: false,
    },
  });
}

function createEvidenceRef(input: {
  id: string;
  kind: EvidenceRef['kind'];
  summary: string;
  metadata: Metadata;
}): EvidenceRef {
  const metadata = redactMetadata(input.metadata);

  return EvidenceRefSchema.parse({
    id: input.id,
    schemaVersion,
    createdAt: new Date().toISOString(),
    kind: input.kind,
    summary: input.summary,
    hash: hashText(JSON.stringify(metadata)),
    redacted: true,
    labels: ['electron-cdp', 'm5c', 'metadata-only'],
    metadata,
  });
}

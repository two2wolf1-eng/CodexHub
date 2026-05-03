import {
  CapabilityManifestSchema,
  SchemaVersionSchema,
  type CapabilityManifest,
  foundationId,
  foundationTimestamp,
} from '@codexhub/contracts';

export const OTEL_ADAPTER_NAME = 'otel-adapter';
export const OTEL_ADAPTER_VERSION = '0.1.0-m7a';

export function createOtelAdapterManifest(): CapabilityManifest {
  return CapabilityManifestSchema.parse({
    id: foundationId('capability_manifest'),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: foundationTimestamp(),
    name: OTEL_ADAPTER_NAME,
    kind: 'telemetry',
    version: OTEL_ADAPTER_VERSION,
    provider: 'builtin',
    capabilities: [
      'telemetry.noop_trace_plan',
      'telemetry.fixture_span_summary',
      'telemetry.metadata_only_export_summary',
      'telemetry.evidence_audit_not_authoritative',
    ],
    defaultRisk: 'low',
    defaultActionMode: 'read',
    requiresApprovalByDefault: false,
    evidencePolicy: {
      collect: true,
      redactMetadata: true,
      bodyStorage: 'hash-only',
    },
    processBoundary: {
      mayStartExternalProcess: false,
      requiresProcessAudit: false,
    },
    metadata: {
      integrationStage: 'm7a',
      productDefaultEnabled: false,
      authorityProvider: 'codexhub',
      capabilityProvider: OTEL_ADAPTER_NAME,
      openTelemetrySdkLoaded: false,
      networkExporterEnabled: false,
      processBoundaryInvoked: false,
      externalProcessStarted: false,
      networkExportAttempted: false,
      rawTracePayloadStored: false,
      rawPathStored: false,
      bodyStored: false,
      noRealWrite: true,
      evidenceAuditAuthoritative: false,
    },
  });
}

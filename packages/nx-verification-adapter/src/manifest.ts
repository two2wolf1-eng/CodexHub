import {
  type CapabilityManifest,
  CapabilityManifestSchema,
  SchemaVersionSchema,
  foundationId,
  foundationTimestamp,
} from '@codexhub/contracts';

export const NX_VERIFICATION_ADAPTER_NAME = 'nx-affected';
export const NX_VERIFICATION_ADAPTER_VERSION = '0.1.0-m2b';

export function createNxVerificationAdapterManifest(): CapabilityManifest {
  return CapabilityManifestSchema.parse({
    id: foundationId('capability_manifest'),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: foundationTimestamp(),
    name: NX_VERIFICATION_ADAPTER_NAME,
    kind: 'verification',
    version: NX_VERIFICATION_ADAPTER_VERSION,
    provider: 'external-process',
    capabilities: [
      'affected-project-discovery',
      'allowlisted-target-verification',
      'metadata-only-output-summary',
      'process-boundary-audit',
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
      mayStartExternalProcess: true,
      requiresProcessAudit: true,
    },
    metadata: {
      integrationStage: 'm2b',
      productDefaultEnabled: false,
      authorityProvider: 'codexhub',
      capabilityProvider: NX_VERIFICATION_ADAPTER_NAME,
      stdoutBodyStored: false,
      stderrBodyStored: false,
      arbitraryShellAllowed: false,
    },
  });
}

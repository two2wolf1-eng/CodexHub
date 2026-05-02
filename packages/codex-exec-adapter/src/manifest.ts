import {
  type CapabilityManifest,
  CapabilityManifestSchema,
  SchemaVersionSchema,
  foundationId,
  foundationTimestamp,
} from '@codexhub/contracts';

export const CODEX_EXEC_ADAPTER_NAME = 'codex-cli';
export const CODEX_EXEC_ADAPTER_VERSION = '0.1.0-m2a';

export function createCodexExecAdapterManifest(): CapabilityManifest {
  return CapabilityManifestSchema.parse({
    id: foundationId('capability_manifest'),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: foundationTimestamp(),
    name: CODEX_EXEC_ADAPTER_NAME,
    kind: 'codex',
    version: CODEX_EXEC_ADAPTER_VERSION,
    provider: 'external-process',
    capabilities: [
      'jsonl-event-parse',
      'governed-input-file',
      'read-only-sandbox',
      'metadata-only-evidence',
      'process-boundary-audit',
    ],
    defaultRisk: 'medium',
    defaultActionMode: 'dry-run',
    requiresApprovalByDefault: true,
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
      integrationStage: 'm2a',
      productDefaultEnabled: false,
      authorityProvider: 'codexhub',
      capabilityProvider: CODEX_EXEC_ADAPTER_NAME,
      promptBodyStored: false,
      stdoutBodyStored: false,
      stderrBodyStored: false,
      rawJsonlBodyStored: false,
    },
  });
}

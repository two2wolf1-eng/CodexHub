import {
  type CapabilityManifest,
  CapabilityManifestSchema,
  SchemaVersionSchema,
  foundationId,
  foundationTimestamp,
} from '@codexhub/contracts';

export const CODEX_APP_SERVER_ADAPTER_NAME = 'codex-app-server-adapter';
export const CODEX_APP_SERVER_ADAPTER_VERSION = '0.1.0-m54';

export function createCodexAppServerAdapterManifest(): CapabilityManifest {
  return CapabilityManifestSchema.parse({
    id: foundationId('capability_manifest'),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: foundationTimestamp(),
    name: CODEX_APP_SERVER_ADAPTER_NAME,
    kind: 'codex',
    version: CODEX_APP_SERVER_ADAPTER_VERSION,
    provider: 'external-process',
    capabilities: [
      'codex.app_server.stdio_jsonl.fixture_transport',
      'codex.app_server.initialize.lifecycle',
      'codex.app_server.codec.request_notification_response',
      'codex.app_server.wire_summary.metadata_only',
      'codex.app_server.no_process_spawn_m54_3',
    ],
    defaultRisk: 'high',
    defaultActionMode: 'dry-run',
    requiresApprovalByDefault: true,
    evidencePolicy: {
      collect: true,
      redactMetadata: true,
      bodyStorage: 'hash-only',
    },
    processBoundary: {
      mayStartExternalProcess: false,
      requiresProcessAudit: true,
    },
    metadata: {
      integrationStage: 'm54.3',
      authorityProvider: 'codexhub',
      capabilityProvider: CODEX_APP_SERVER_ADAPTER_NAME,
      transportKind: 'stdio-jsonl',
      fixtureOnly: true,
      realProcessLaunchEnabled: false,
      liveDispatchEnabled: false,
      initializedNotificationRequired: true,
      directAdapterAuthority: false,
      rawPromptStored: false,
      rawDiffStored: false,
      rawPathStored: false,
      rawBodyStored: false,
      approvalSecretStored: false,
    },
  });
}

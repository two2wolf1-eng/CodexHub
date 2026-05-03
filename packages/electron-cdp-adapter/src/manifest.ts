import {
  CapabilityManifestSchema,
  SchemaVersionSchema,
  type CapabilityManifest,
} from '@codexhub/contracts';

export const ELECTRON_CDP_ADAPTER_NAME = 'electron-cdp';
export const ELECTRON_CDP_ADAPTER_VERSION = '0.3.0-m5c';

export function createElectronCdpAdapterManifest(): CapabilityManifest {
  return CapabilityManifestSchema.parse({
    id: 'capability_electron_cdp_adapter',
    schemaVersion: SchemaVersionSchema.value,
    createdAt: '2026-05-03T00:00:00.000Z',
    name: ELECTRON_CDP_ADAPTER_NAME,
    kind: 'electron',
    version: ELECTRON_CDP_ADAPTER_VERSION,
    provider: 'builtin',
    capabilities: [
      'electron.process.summary.hash',
      'electron.debug_endpoint.summary.hash',
      'electron.target.summary.hash',
      'electron.console.summary',
      'electron.network_metadata.summary',
      'electron.cdp.command_allowlist.fixture',
      'electron.cdp.controlled_http.version_summary',
      'electron.cdp.controlled_http.target_summary',
      'electron.cdp.controlled_websocket.console_events',
      'electron.cdp.controlled_websocket.network_events',
      'electron.fixture_runner_only',
      'electron.main_inspector.disabled',
      'electron.runtime_evaluate.forbidden',
      'electron.generic_command_passthrough.forbidden',
    ],
    defaultRisk: 'medium',
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
      authorityProvider: 'codexhub',
      capabilityProvider: 'electron-cdp-adapter',
      integrationStage: 'm5c',
      productDefaultEnabled: false,
      fixtureOnly: false,
      controlledLocalHttpSupported: true,
      controlledWebSocketEventsSupported: true,
      realElectronConnectionEnabled: false,
      mainInspectorEnabled: false,
      runtimeEvaluateAllowed: false,
      genericCommandPassthrough: false,
      rawPathStored: false,
      bodyStored: false,
      processBoundaryInvoked: false,
      externalProcessStarted: false,
      noRealWrite: true,
    },
  });
}

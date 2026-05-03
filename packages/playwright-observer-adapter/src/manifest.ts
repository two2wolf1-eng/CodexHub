import {
  type CapabilityManifest,
  CapabilityManifestSchema,
  SchemaVersionSchema,
  foundationId,
  foundationTimestamp,
} from '@codexhub/contracts';

export const PLAYWRIGHT_OBSERVER_ADAPTER_NAME = 'playwright-observer';
export const PLAYWRIGHT_OBSERVER_ADAPTER_VERSION = '0.1.0-m4a';

export function createPlaywrightObserverAdapterManifest(): CapabilityManifest {
  return CapabilityManifestSchema.parse({
    id: foundationId('capability_manifest'),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: foundationTimestamp(),
    name: PLAYWRIGHT_OBSERVER_ADAPTER_NAME,
    kind: 'browser',
    version: PLAYWRIGHT_OBSERVER_ADAPTER_VERSION,
    provider: 'open-source',
    capabilities: [
      'browser.observe.title.hash',
      'browser.observe.url.hash',
      'browser.observe.accessibility_snapshot.hash',
      'browser.observe.console_summary',
      'browser.observe.network_metadata_summary',
      'browser.observe.fixture_runner_only',
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
      integrationStage: 'm4a',
      productDefaultEnabled: false,
      authorityProvider: 'codexhub',
      capabilityProvider: PLAYWRIGHT_OBSERVER_ADAPTER_NAME,
      fixtureRunnerOnly: true,
      screenshotCaptureEnabled: false,
      networkPayloadStorage: 'forbidden',
      browserActEnabled: false,
      rawPathStored: false,
      bodyStored: false,
    },
  });
}

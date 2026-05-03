import {
  type CapabilityManifest,
  CapabilityManifestSchema,
  SchemaVersionSchema,
  foundationId,
  foundationTimestamp,
} from '@codexhub/contracts';

export const PLAYWRIGHT_OBSERVER_ADAPTER_NAME = 'playwright-observer';
export const PLAYWRIGHT_OBSERVER_ADAPTER_VERSION = '0.2.0-m4b';

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
      'browser.observe.controlled_local_browser',
      'browser.observe.loopback_or_data_url_only',
      'browser.observe.non_persistent_context',
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
      mayStartExternalProcess: true,
      requiresProcessAudit: true,
    },
    metadata: {
      integrationStage: 'm4b',
      productDefaultEnabled: false,
      authorityProvider: 'codexhub',
      capabilityProvider: PLAYWRIGHT_OBSERVER_ADAPTER_NAME,
      fixtureRunnerOnly: false,
      controlledLocalBrowserRunner: true,
      realProfileConnectionEnabled: false,
      screenshotCaptureEnabled: false,
      networkPayloadStorage: 'forbidden',
      browserActEnabled: false,
      rawPathStored: false,
      bodyStored: false,
    },
  });
}

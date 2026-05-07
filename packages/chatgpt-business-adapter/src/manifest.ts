import {
  type CapabilityManifest,
  CapabilityManifestSchema,
  SchemaVersionSchema,
  foundationId,
  foundationTimestamp,
} from '@codexhub/contracts';

export const CHATGPT_BUSINESS_ADAPTER_NAME = 'chatgpt-business-adapter';
export const CHATGPT_BUSINESS_ADAPTER_VERSION = '0.1.0-m52';

export function createChatGptBusinessAdapterManifest(): CapabilityManifest {
  return CapabilityManifestSchema.parse({
    id: foundationId('capability_manifest'),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: foundationTimestamp(),
    name: CHATGPT_BUSINESS_ADAPTER_NAME,
    kind: 'codex',
    version: CHATGPT_BUSINESS_ADAPTER_VERSION,
    provider: 'external-network',
    capabilities: [
      'chatgpt.business.workspace.identity.hash',
      'chatgpt.business.membership.fixture_sync',
      'chatgpt.business.quota.fixture_snapshot',
      'chatgpt.business.admin.dry_run_only',
      'chatgpt.business.no_real_admin',
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
      integrationStage: 'm52',
      authorityProvider: 'codexhub',
      capabilityProvider: CHATGPT_BUSINESS_ADAPTER_NAME,
      fixtureOnly: true,
      readOnly: true,
      liveAdminEnabled: false,
      inviteRemoveReplaceLiveEnabled: false,
      rawPromptStored: false,
      rawDiffStored: false,
      rawPathStored: false,
      rawBodyStored: false,
      browserStorageRead: false,
    },
  });
}

import {
  type CapabilityManifest,
  CapabilityManifestSchema,
  SchemaVersionSchema,
  foundationId,
  foundationTimestamp,
} from '@codexhub/contracts';

export const WORKTREE_MANAGER_ADAPTER_NAME = 'worktree-manager';
export const WORKTREE_MANAGER_ADAPTER_VERSION = '0.1.0-m6a';

export function createWorktreeManagerManifest(): CapabilityManifest {
  return CapabilityManifestSchema.parse({
    id: foundationId('capability_manifest'),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: foundationTimestamp(),
    name: WORKTREE_MANAGER_ADAPTER_NAME,
    kind: 'git',
    version: WORKTREE_MANAGER_ADAPTER_VERSION,
    provider: 'builtin',
    capabilities: [
      'worktree-dry-run-plan',
      'fixture-only-patch-summary',
      'metadata-only-pr-draft',
      'release-audit-draft',
    ],
    defaultRisk: 'medium',
    defaultActionMode: 'dry-run',
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
      integrationStage: 'm6a',
      productDefaultEnabled: false,
      authorityProvider: 'codexhub',
      capabilityProvider: WORKTREE_MANAGER_ADAPTER_NAME,
      realGitBoundaryEnabled: false,
      pushAllowed: false,
      openPullRequestAllowed: false,
      rawPathStored: false,
      bodyStored: false,
    },
  });
}

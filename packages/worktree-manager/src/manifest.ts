import {
  type CapabilityManifest,
  CapabilityManifestSchema,
  SchemaVersionSchema,
  foundationId,
  foundationTimestamp,
} from '@codexhub/contracts';

export const WORKTREE_MANAGER_ADAPTER_NAME = 'worktree-manager';
export const WORKTREE_MANAGER_ADAPTER_VERSION = '0.2.0-m6b';

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
      'controlled-git-worktree-add',
      'controlled-git-diff-summary',
      'metadata-only-pr-draft',
      'release-audit-draft',
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
      integrationStage: 'm6b',
      productDefaultEnabled: false,
      authorityProvider: 'codexhub',
      capabilityProvider: WORKTREE_MANAGER_ADAPTER_NAME,
      realGitBoundaryEnabled: 'env-gated',
      pushAllowed: false,
      openPullRequestAllowed: false,
      cleanupDeleteAllowed: false,
      rawPathStored: false,
      bodyStored: false,
    },
  });
}

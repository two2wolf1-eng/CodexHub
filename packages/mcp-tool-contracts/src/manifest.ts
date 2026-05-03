import {
  type CapabilityManifest,
  CapabilityManifestSchema,
  SchemaVersionSchema,
  foundationId,
  foundationTimestamp,
} from '@codexhub/contracts';

export const CODEXHUB_MCP_SERVER_CAPABILITY_NAME = 'codexhub-mcp-server';

export function createCodexHubMcpServerManifest(): CapabilityManifest {
  return CapabilityManifestSchema.parse({
    id: foundationId('capability_mcp_server'),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: foundationTimestamp(),
    name: CODEXHUB_MCP_SERVER_CAPABILITY_NAME,
    kind: 'mcp',
    version: 'm3a-read-only',
    provider: 'official-sdk',
    capabilities: [
      'mcp.read_only_tools',
      'mcp.tool_policy_metadata',
      'mcp.metadata_only_evidence',
      'mcp.audit_required',
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
  });
}

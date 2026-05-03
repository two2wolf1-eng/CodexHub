import {
  type McpToolDefinition,
  type McpToolName,
  McpToolDefinitionSchema,
  SchemaVersionSchema,
  foundationId,
  foundationTimestamp,
} from '@codexhub/contracts';
import { createEvidenceRef } from '@codexhub/evidence-kernel';

export const CODEXHUB_MCP_TOOL_NAMES = [
  'codexhub.getArchitectureMap',
  'codexhub.getPolicySummary',
  'codexhub.getRiskMatrix',
  'codexhub.getEvidenceSummary',
  'codexhub.getOpenDevelopmentRequests',
  'codexhub.getAffectedProjectsDryRun',
  'codexhub.readObservationSnapshot',
] as const satisfies readonly McpToolName[];

export function createCodexHubMcpToolDefinitions(): McpToolDefinition[] {
  return [
    createToolDefinition({
      name: 'codexhub.getArchitectureMap',
      title: 'Get Architecture Map',
      description: 'Return read-only CodexHub app/package architecture metadata.',
    }),
    createToolDefinition({
      name: 'codexhub.getPolicySummary',
      title: 'Get Policy Summary',
      description: 'Return read-only policy configuration summary and hashes.',
    }),
    createToolDefinition({
      name: 'codexhub.getRiskMatrix',
      title: 'Get Risk Matrix',
      description: 'Return read-only risk matrix and action-mode summary.',
    }),
    createToolDefinition({
      name: 'codexhub.getEvidenceSummary',
      title: 'Get Evidence Summary',
      description: 'Return read-only evidence counts and redacted recent evidence refs.',
    }),
    createToolDefinition({
      name: 'codexhub.getOpenDevelopmentRequests',
      title: 'Get Open Development Requests',
      description: 'Return read-only development request and recent run summaries.',
    }),
    createToolDefinition({
      name: 'codexhub.getAffectedProjectsDryRun',
      title: 'Get Affected Projects Dry-Run',
      description: 'Return an Nx affected verification plan without executing Nx.',
    }),
    createToolDefinition({
      name: 'codexhub.readObservationSnapshot',
      title: 'Read Observation Snapshot',
      description: 'Return read-only observation health summaries without browser or Electron access.',
    }),
  ];
}

export function getCodexHubMcpToolDefinition(name: McpToolName): McpToolDefinition {
  const definition = createCodexHubMcpToolDefinitions().find((tool) => tool.name === name);

  if (!definition) {
    throw new Error(`Unknown CodexHub MCP tool: ${name}`);
  }

  return definition;
}

export function assertReadOnlyMcpToolRegistry(
  definitions: readonly McpToolDefinition[] = createCodexHubMcpToolDefinitions(),
): void {
  for (const definition of definitions) {
    if (!definition.enabled) {
      continue;
    }

    if (definition.actionMode !== 'read') {
      throw new Error(`Enabled MCP tool ${definition.name} must use read actionMode.`);
    }

    if (definition.approvalPolicy !== 'not-required') {
      throw new Error(`Enabled read-only MCP tool ${definition.name} must not require approval.`);
    }

    if (definition.processBoundaryInvoked || definition.externalProcessStarted) {
      throw new Error(`Enabled MCP tool ${definition.name} must not declare a process boundary.`);
    }
  }
}

export function createMcpToolManifestEvidenceRef(
  definitions: readonly McpToolDefinition[] = createCodexHubMcpToolDefinitions(),
) {
  return createEvidenceRef({
    kind: 'mcp.tool_manifest',
    label: 'mcp-tool-manifest',
    summary: `MCP manifest contains ${definitions.length} read-only tools.`,
    metadata: {
      toolCount: definitions.length,
      enabledToolCount: definitions.filter((definition) => definition.enabled).length,
      toolNames: definitions.map((definition) => definition.name),
      actionModes: [...new Set(definitions.map((definition) => definition.actionMode))],
      bodyStored: false,
      processBoundaryInvoked: false,
      externalProcessStarted: false,
    },
  });
}

function createToolDefinition(input: {
  name: McpToolName;
  title: string;
  description: string;
}): McpToolDefinition {
  return McpToolDefinitionSchema.parse({
    id: foundationId('mcp_tool'),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: foundationTimestamp(),
    name: input.name,
    title: input.title,
    description: input.description,
    enabled: true,
    riskLevel: 'low',
    actionMode: 'read',
    approvalPolicy: 'not-required',
    evidencePolicy: {
      collect: true,
      redactMetadata: true,
      bodyStorage: 'hash-only',
    },
    outputBodyStored: false,
    processBoundaryInvoked: false,
    externalProcessStarted: false,
    noRealWrite: true,
  });
}

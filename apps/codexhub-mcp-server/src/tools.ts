import type { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import type { McpToolName } from '@codexhub/contracts';
import {
  createMcpToolInvocationRecords,
  evaluateMcpToolPolicy,
  getCodexHubMcpToolDefinition,
} from '@codexhub/mcp-tool-contracts';
import type { CodexHubStore } from '@codexhub/store-core';
import {
  type AffectedProjectsDryRunArgs,
  getAffectedProjectsDryRun,
  getArchitectureMap,
  getEvidenceSummary,
  getOpenDevelopmentRequests,
  getPolicySummary,
  getRiskMatrix,
  readObservationSnapshot,
} from './tool-outputs';

export interface ToolInvocationContext {
  workspaceRoot: string;
  store?: CodexHubStore;
  actor?: string;
}

export async function invokeReadOnlyMcpTool(
  toolName: McpToolName,
  args: Record<string, unknown>,
  context: ToolInvocationContext,
): Promise<CallToolResult> {
  const tool = getCodexHubMcpToolDefinition(toolName);
  const inputSummary = summarizeInput(args);
  const actor = context.actor ?? 'apps.codexhub-mcp-server';

  if (!context.store) {
    return mcpError('audit_store_unavailable', {
      toolName,
      audited: false,
      bodyStored: false,
    });
  }

  const policyDecision = evaluateMcpToolPolicy({ tool, inputSummary });

  if (policyDecision.outcome !== 'allow') {
    const records = createMcpToolInvocationRecords({
      tool,
      actor,
      status: 'blocked',
      policyDecision,
      inputSummary,
      failureReason: 'policy_blocked',
    });
    await persistInvocationRecords(context.store, records);

    return mcpError('policy_blocked', {
      toolName,
      policyDecisionId: policyDecision.id,
      evidenceRefIds: records.invocationSummary.evidenceRefIds,
      auditEventIds: records.invocationSummary.auditEventIds,
      bodyStored: false,
    });
  }

  try {
    const outputSummary = await executeTool(toolName, args, {
      workspaceRoot: context.workspaceRoot,
      store: context.store,
    });
    const records = createMcpToolInvocationRecords({
      tool,
      actor,
      status: 'completed',
      policyDecision,
      inputSummary,
      outputSummary,
    });
    await persistInvocationRecords(context.store, records);

    return mcpResult({
      ...outputSummary,
      invocation: records.invocationSummary,
    });
  } catch {
    const records = createMcpToolInvocationRecords({
      tool,
      actor,
      status: 'failed',
      policyDecision,
      inputSummary,
      failureReason: 'tool_execution_failed',
    });
    await persistInvocationRecords(context.store, records);

    return mcpError('tool_execution_failed', {
      toolName,
      policyDecisionId: policyDecision.id,
      evidenceRefIds: records.invocationSummary.evidenceRefIds,
      auditEventIds: records.invocationSummary.auditEventIds,
      bodyStored: false,
    });
  }
}

async function executeTool(
  toolName: McpToolName,
  args: Record<string, unknown>,
  context: { workspaceRoot: string; store: CodexHubStore },
): Promise<Record<string, unknown>> {
  switch (toolName) {
    case 'codexhub.getArchitectureMap':
      return getArchitectureMap(context);
    case 'codexhub.getPolicySummary':
      return getPolicySummary(context);
    case 'codexhub.getRiskMatrix':
      return getRiskMatrix(context);
    case 'codexhub.getEvidenceSummary':
      return getEvidenceSummary(context);
    case 'codexhub.getOpenDevelopmentRequests':
      return getOpenDevelopmentRequests(context);
    case 'codexhub.getAffectedProjectsDryRun':
      return getAffectedProjectsDryRun(context, args as AffectedProjectsDryRunArgs);
    case 'codexhub.readObservationSnapshot':
      return readObservationSnapshot();
  }
}

async function persistInvocationRecords(
  store: CodexHubStore,
  records: ReturnType<typeof createMcpToolInvocationRecords>,
): Promise<void> {
  for (const ref of records.evidenceRefs) {
    await store.evidenceRefs.create(ref);
  }

  for (const event of records.auditEvents) {
    await store.auditEvents.append(event);
  }
}

function mcpResult(summary: Record<string, unknown>): CallToolResult {
  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify(summary),
      },
    ],
    structuredContent: summary,
  };
}

function mcpError(error: string, summary: Record<string, unknown>): CallToolResult {
  return {
    isError: true,
    content: [
      {
        type: 'text',
        text: JSON.stringify({ error, ...summary }),
      },
    ],
    structuredContent: { error, ...summary },
  };
}

function summarizeInput(args: Record<string, unknown>): Record<string, unknown> {
  return {
    keyCount: Object.keys(args).length,
    keys: Object.keys(args).sort(),
    bodyStored: false,
  };
}

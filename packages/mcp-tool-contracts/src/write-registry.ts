import {
  McpWriteToolManifestSchema,
  McpWriteToolPlanSchema,
  SchemaVersionSchema,
  foundationId,
  foundationTimestamp,
  type McpWriteToolManifest,
  type McpWriteToolPlan,
} from '@codexhub/contracts';
import { hashUnknown } from './metadata';

export interface CreateMcpWriteToolPlanInput {
  dryRunId?: string;
  worktreePathHash: string;
  patchHash: string;
  changedFileCount: number;
  blockReasons?: readonly string[];
}

export function createControlledWorktreePatchToolManifest(
  enabled = false,
): McpWriteToolManifest {
  return McpWriteToolManifestSchema.parse({
    id: foundationId('mcp_write_tool_manifest'),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: foundationTimestamp(),
    name: 'workspace.applyPatchToControlledWorktree',
    enabled,
    riskLevel: 'critical',
    actionMode: 'write',
    approvalPolicy: 'required',
    directExecutionAllowed: true,
    controlledWorktreeOnly: true,
    repoRootMutationAllowed: false,
    rawPatchStored: false,
    rawPathStored: false,
    bodyStored: false,
    summary: enabled
      ? 'MCP controlled worktree patch write tool is enabled by runtime governance.'
      : 'MCP controlled worktree patch write tool is disabled by default.',
  });
}

export function planControlledWorktreePatchTool(
  input: CreateMcpWriteToolPlanInput,
): McpWriteToolPlan {
  const blockReasons = [...(input.blockReasons ?? [])];

  return McpWriteToolPlanSchema.parse({
    id: foundationId('mcp_write_tool_plan'),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: foundationTimestamp(),
    dryRunId: input.dryRunId ?? foundationId('mcp_write_tool_dry_run'),
    status: blockReasons.length === 0 ? 'planned' : 'blocked',
    toolName: 'workspace.applyPatchToControlledWorktree',
    worktreePathHash: input.worktreePathHash,
    patchHash: input.patchHash,
    changedFileCount: input.changedFileCount,
    blockReasons,
    directExecutionPlanned: true,
    controlledWorktreeOnly: true,
    repoRootMutationAllowed: false,
    rawPatchStored: false,
    rawPathStored: false,
    bodyStored: false,
    metadata: {
      planHash: hashUnknown({
        toolName: 'workspace.applyPatchToControlledWorktree',
        worktreePathHash: input.worktreePathHash,
        patchHash: input.patchHash,
        changedFileCount: input.changedFileCount,
      }),
    },
    summary:
      blockReasons.length === 0
        ? 'MCP controlled worktree patch write plan is metadata-ready.'
        : 'MCP controlled worktree patch write plan is blocked by governance.',
  });
}

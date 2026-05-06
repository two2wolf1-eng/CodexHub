import { createHash } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import {
  CapabilityAuditEventSchema,
  CapabilityManifestSchema,
  McpToolDefinitionSchema,
  McpToolInvocationSummarySchema,
} from '@codexhub/contracts';
import {
  assertReadOnlyMcpToolRegistry,
  createCodexHubMcpServerManifest,
  createCodexHubMcpToolDefinitions,
  createControlledWorktreePatchToolManifest,
  createMcpToolInvocationRecords,
  createMcpToolManifestEvidenceRef,
  evaluateMcpToolPolicy,
  planControlledWorktreePatchTool,
} from './index';
import { hashUnknown } from './metadata';

describe('mcp-tool-contracts', () => {
  it('declares a read-only MCP capability manifest', () => {
    const manifest = createCodexHubMcpServerManifest();

    expect(CapabilityManifestSchema.parse(manifest)).toMatchObject({
      name: 'codexhub-mcp-server',
      kind: 'mcp',
      provider: 'official-sdk',
      defaultRisk: 'low',
      defaultActionMode: 'read',
      requiresApprovalByDefault: false,
      processBoundary: {
        mayStartExternalProcess: false,
        requiresProcessAudit: false,
      },
    });
  });

  it('declares exactly seven enabled read-only tools', () => {
    const definitions = createCodexHubMcpToolDefinitions();

    expect(definitions).toHaveLength(7);
    expect(definitions.every((definition) => McpToolDefinitionSchema.safeParse(definition).success)).toBe(
      true,
    );
    expect(definitions.every((definition) => definition.enabled)).toBe(true);
    expect(definitions.every((definition) => definition.actionMode === 'read')).toBe(true);
    expect(definitions.every((definition) => definition.approvalPolicy === 'not-required')).toBe(
      true,
    );
    expect(() => assertReadOnlyMcpToolRegistry(definitions)).not.toThrow();
  });

  it('rejects enabled write or admin tool definitions', () => {
    const [tool] = createCodexHubMcpToolDefinitions();

    expect(() =>
      assertReadOnlyMcpToolRegistry([
        {
          ...tool,
          actionMode: 'write',
        },
      ]),
    ).toThrow(/read actionMode/);
    expect(() =>
      assertReadOnlyMcpToolRegistry([
        {
          ...tool,
          actionMode: 'admin',
        },
      ]),
    ).toThrow(/read actionMode/);
  });

  it('creates metadata-only manifest and invocation evidence plus capability audit', () => {
    const [tool] = createCodexHubMcpToolDefinitions();
    const manifestEvidence = createMcpToolManifestEvidenceRef([tool]);
    const policyDecision = evaluateMcpToolPolicy({
      tool,
      inputSummary: {
        path: 'C:\\private\\workspace',
        nested: { authorization: 'Bearer hidden' },
      },
    });
    const records = createMcpToolInvocationRecords({
      tool,
      actor: 'mcp.test',
      status: 'completed',
      policyDecision,
      inputSummary: {
        path: 'C:\\private\\workspace',
        nested: { authorization: 'Bearer hidden' },
      },
      outputSummary: {
        count: 1,
      },
    });
    const serialized = JSON.stringify(records);

    expect(manifestEvidence.kind).toBe('mcp.tool_manifest');
    expect(records.evidenceRefs[0]?.kind).toBe('mcp.tool_invocation_summary');
    expect(policyDecision.outcome).toBe('allow');
    expect(McpToolInvocationSummarySchema.parse(records.invocationSummary)).toBeTruthy();
    expect(CapabilityAuditEventSchema.parse(records.auditEvents[0])).toBeTruthy();
    expect(serialized).not.toContain('C:\\private\\workspace');
    expect(serialized).not.toContain('Bearer hidden');
    expect(records.invocationSummary.bodyStored).toBe(false);
    expect(records.invocationSummary.rawPathStored).toBe(false);
  });

  it('uses real SHA-256 hashes for browser-safe MCP metadata evidence', () => {
    const input = {
      path: 'C:\\private\\workspace',
      nested: { authorization: 'Bearer hidden' },
      count: 1,
    };
    const expected = createHash('sha256')
      .update(
        JSON.stringify({
          path: hashUnknown('C:\\private\\workspace'),
          nested: { authorization: '[redacted]' },
          count: 1,
        }),
      )
      .digest('hex');

    expect(hashUnknown(input)).toBe(`sha256:${expected}`);
    expect(hashUnknown(input)).toMatch(/^sha256:[a-f0-9]{64}$/);
  });

  it('declares a disabled controlled-worktree MCP write manifest separately from read-only tools', () => {
    const manifest = createControlledWorktreePatchToolManifest(false);
    const plan = planControlledWorktreePatchTool({
      worktreePathHash: 'sha256:worktree',
      patchHash: 'sha256:patch',
      changedFileCount: 2,
    });
    const serialized = JSON.stringify({ manifest, plan });

    expect(manifest.enabled).toBe(false);
    expect(manifest.actionMode).toBe('write');
    expect(manifest.approvalPolicy).toBe('required');
    expect(plan.toolName).toBe('workspace.applyPatchToControlledWorktree');
    expect(plan.repoRootMutationAllowed).toBe(false);
    expect(serialized).not.toContain('diff --git');
    expect(serialized).not.toContain('C:\\Users\\Thomas\\CodexHub');
  });
});

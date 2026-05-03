import {
  type AuditEvent,
  type McpToolDefinition,
  type McpToolInvocationStatus,
  type PolicyDecision,
  CapabilityAuditEventSchema,
  McpToolInvocationSummarySchema,
  SchemaVersionSchema,
  foundationId,
  foundationTimestamp,
} from '@codexhub/contracts';
import { createEvidenceRef, hashText, redactMetadata } from '@codexhub/evidence-kernel';
import { DefaultPolicyEngine, type PolicyEngine } from '@codexhub/security-kernel';

export interface McpToolPolicyInput {
  tool: McpToolDefinition;
  policyEngine?: PolicyEngine;
  inputSummary?: Record<string, unknown>;
}

export interface McpToolInvocationRecordInput {
  tool: McpToolDefinition;
  actor: string;
  status: McpToolInvocationStatus;
  policyDecision: PolicyDecision;
  inputSummary?: Record<string, unknown>;
  outputSummary?: Record<string, unknown>;
  failureReason?: string;
}

export function evaluateMcpToolPolicy(input: McpToolPolicyInput): PolicyDecision {
  const policyEngine = input.policyEngine ?? new DefaultPolicyEngine();

  return policyEngine.evaluateAction({
    actionId: foundationId('mcp_tool_action'),
    actionType: `mcp.tool.${input.tool.name}`,
    actionMode: input.tool.actionMode,
    riskLevel: input.tool.riskLevel,
    dryRun: true,
    approvalGranted: false,
    metadata: {
      toolName: input.tool.name,
      enabled: input.tool.enabled,
      noRealWrite: input.tool.noRealWrite,
      processBoundaryInvoked: input.tool.processBoundaryInvoked,
      externalProcessStarted: input.tool.externalProcessStarted,
      inputSummaryHash: hashUnknown(input.inputSummary ?? {}),
    },
  });
}

export function createMcpToolInvocationRecords(input: McpToolInvocationRecordInput) {
  const inputHash = hashUnknown(input.inputSummary ?? {});
  const outputHash = hashUnknown(input.outputSummary ?? {});
  const evidenceRef = createEvidenceRef({
    kind: 'mcp.tool_invocation_summary',
    label: `mcp-tool-${input.tool.name}`,
    summary: `${input.tool.name} ${input.status}.`,
    metadata: {
      toolName: input.tool.name,
      status: input.status,
      inputHash,
      outputHash,
      failureReason: input.failureReason,
      bodyStored: false,
      rawPathStored: false,
      processBoundaryInvoked: false,
      externalProcessStarted: false,
      noRealWrite: true,
    },
  });
  const auditEvent = CapabilityAuditEventSchema.parse({
    id: foundationId('audit'),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: foundationTimestamp(),
    actor: input.actor,
    action: `mcp.tool.${input.tool.name}`,
    target: input.tool.name,
    reason: input.failureReason ?? 'Read-only MCP tool invocation.',
    outcome: input.status,
    policyDecisionId: input.policyDecision.id,
    evidenceRefs: [evidenceRef],
    metadata: {
      liveExecution: false,
      processBoundaryInvoked: false,
      externalProcessStarted: false,
      noRealWrite: true,
      bodyStored: false,
    },
  }) satisfies AuditEvent;
  const invocationSummary = McpToolInvocationSummarySchema.parse({
    id: foundationId('mcp_tool_invocation'),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: foundationTimestamp(),
    toolName: input.tool.name,
    status: input.status,
    policyDecisionId: input.policyDecision.id,
    evidenceRefIds: [evidenceRef.id],
    auditEventIds: [auditEvent.id],
    inputHash,
    outputHash,
    summary: `${input.tool.name} ${input.status}.`,
    bodyStored: false,
    rawPathStored: false,
    processBoundaryInvoked: false,
    externalProcessStarted: false,
    noRealWrite: true,
  });

  return {
    policyDecision: input.policyDecision,
    evidenceRefs: [evidenceRef],
    auditEvents: [auditEvent],
    invocationSummary,
  };
}

function hashUnknown(value: unknown): string {
  return `sha256:${hashText(JSON.stringify(redactUnknown(value)))}`;
}

function redactUnknown(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map((entry) => redactUnknown(entry));
  }

  if (isPlainObject(value)) {
    return redactMetadata(value);
  }

  return value;
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return (
    typeof value === 'object' &&
    value !== null &&
    !Array.isArray(value) &&
    Object.getPrototypeOf(value) === Object.prototype
  );
}

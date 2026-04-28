import { z } from 'zod';

export const SchemaVersionSchema = z.literal('2026-04-28.foundation');
export type SchemaVersion = z.infer<typeof SchemaVersionSchema>;

export const MetadataSchema = z.record(z.unknown());
export type Metadata = z.infer<typeof MetadataSchema>;

export const IsoDateTimeSchema = z.string().datetime({ offset: true });
export type IsoDateTime = z.infer<typeof IsoDateTimeSchema>;

const entityBaseSchema = z.object({
  id: z.string().min(1),
  schemaVersion: SchemaVersionSchema,
  metadata: MetadataSchema.optional(),
});

const createdEntityBaseSchema = entityBaseSchema.extend({
  createdAt: IsoDateTimeSchema,
});

const observedEntityBaseSchema = entityBaseSchema.extend({
  observedAt: IsoDateTimeSchema,
});

export const RiskLevelSchema = z.enum(['low', 'medium', 'high', 'critical']);
export type RiskLevel = z.infer<typeof RiskLevelSchema>;

export const ActionModeSchema = z.enum(['read', 'write']);
export type ActionMode = z.infer<typeof ActionModeSchema>;

export const PolicyOutcomeSchema = z.enum(['allow', 'deny', 'approval_required']);
export type PolicyOutcome = z.infer<typeof PolicyOutcomeSchema>;

export const EvidenceRefSchema = createdEntityBaseSchema.extend({
  kind: z.enum([
    'log',
    'hash',
    'snapshot',
    'dry-run',
    'audit',
    'codex.exec.jsonl.replay',
    'codex.exec.event.summary',
    'codex.exec.dry_run_plan',
    'codex.exec.command_preview',
    'codex.exec.policy_decision',
    'codex.exec.preflight_result',
    'codex.exec.approval_artifact',
    'codex.exec.execution_gate_result',
  ]),
  summary: z.string().min(1).optional(),
  hash: z.string().min(1),
  uri: z.string().optional(),
  expiresAt: IsoDateTimeSchema.optional(),
  redacted: z.boolean().default(true),
  labels: z.array(z.string()).default([]),
});
export type EvidenceRef = z.infer<typeof EvidenceRefSchema>;

export const PolicyDecisionSchema = createdEntityBaseSchema.extend({
  actionId: z.string().min(1),
  actionType: z.string().min(1),
  actionMode: ActionModeSchema,
  riskLevel: RiskLevelSchema,
  outcome: PolicyOutcomeSchema,
  reasons: z.array(z.string()).default([]),
  requiresDryRun: z.boolean(),
  requiresApproval: z.boolean(),
});
export type PolicyDecision = z.infer<typeof PolicyDecisionSchema>;

export const WorkflowStepStatusSchema = z.enum([
  'pending',
  'dry-run',
  'running',
  'completed',
  'failed',
  'skipped',
]);
export type WorkflowStepStatus = z.infer<typeof WorkflowStepStatusSchema>;

export const WorkflowStepSchema = createdEntityBaseSchema.extend({
  name: z.string().min(1),
  actionType: z.string().min(1),
  actionMode: ActionModeSchema,
  riskLevel: RiskLevelSchema,
  status: WorkflowStepStatusSchema,
  dryRunOnly: z.boolean().default(true),
  evidenceRefs: z.array(EvidenceRefSchema).default([]),
});
export type WorkflowStep = z.infer<typeof WorkflowStepSchema>;

export const WorkflowDefinitionSchema = createdEntityBaseSchema.extend({
  name: z.string().min(1),
  version: z.string().min(1),
  description: z.string().optional(),
  riskLevel: RiskLevelSchema,
  steps: z.array(WorkflowStepSchema),
});
export type WorkflowDefinition = z.infer<typeof WorkflowDefinitionSchema>;

export const WorkflowRunStatusSchema = z.enum([
  'created',
  'dry-run',
  'running',
  'completed',
  'failed',
]);
export type WorkflowRunStatus = z.infer<typeof WorkflowRunStatusSchema>;

export const WorkflowRunSchema = createdEntityBaseSchema.extend({
  workflowName: z.string().min(1),
  status: WorkflowRunStatusSchema,
  dryRun: z.boolean(),
  steps: z.array(WorkflowStepSchema).default([]),
  evidenceRefs: z.array(EvidenceRefSchema).default([]),
});
export type WorkflowRun = z.infer<typeof WorkflowRunSchema>;

export const DryRunPlanSchema = createdEntityBaseSchema.extend({
  workflowName: z.string().min(1),
  summary: z.string().min(1),
  riskLevel: RiskLevelSchema,
  steps: z.array(WorkflowStepSchema),
  policyDecisions: z.array(PolicyDecisionSchema),
  evidenceRefs: z.array(EvidenceRefSchema).default([]),
  auditEvents: z.array(z.lazy(() => AuditEventSchema)).default([]),
});
export type DryRunPlan = z.infer<typeof DryRunPlanSchema>;

export const AuditEventSchema = createdEntityBaseSchema.extend({
  actor: z.string().min(1),
  action: z.string().min(1),
  outcome: z.string().min(1),
  evidenceRefs: z.array(EvidenceRefSchema).default([]),
  policyDecisionId: z.string().optional(),
});
export type AuditEvent = z.infer<typeof AuditEventSchema>;

export const ObservationSeveritySchema = z.enum(['info', 'warning', 'error']);
export type ObservationSeverity = z.infer<typeof ObservationSeveritySchema>;

export const ObservationSchema = observedEntityBaseSchema.extend({
  source: z.string().min(1),
  kind: z.string().min(1),
  summary: z.string().min(1),
  severity: ObservationSeveritySchema,
});
export type Observation = z.infer<typeof ObservationSchema>;

export const SourceHealthStatusSchema = z.enum(['ok', 'degraded', 'unavailable', 'unknown']);
export type SourceHealthStatus = z.infer<typeof SourceHealthStatusSchema>;

export const SourceHealthSchema = observedEntityBaseSchema.extend({
  source: z.string().min(1),
  status: SourceHealthStatusSchema,
  lastObservationAt: IsoDateTimeSchema.optional(),
  observationsCount: z.number().int().nonnegative(),
});
export type SourceHealth = z.infer<typeof SourceHealthSchema>;

export const DevelopmentRequestSchema = createdEntityBaseSchema.extend({
  title: z.string().min(1),
  description: z.string().min(1),
  constraints: z.array(z.string()).default([]),
});
export type DevelopmentRequest = z.infer<typeof DevelopmentRequestSchema>;

export const TaskNodeSchema = createdEntityBaseSchema.extend({
  title: z.string().min(1),
  description: z.string().min(1),
  dependsOn: z.array(z.string()).default([]),
  assignedCapability: z.string().optional(),
  keywords: z.array(z.string()).default([]),
  riskLevel: RiskLevelSchema.default('low'),
});
export type TaskNode = z.infer<typeof TaskNodeSchema>;

export const TaskGraphTaskSchema = TaskNodeSchema;
export type TaskGraphTask = z.infer<typeof TaskGraphTaskSchema>;

export const TaskGraphSchema = createdEntityBaseSchema.extend({
  requestId: z.string().min(1),
  tasks: z.array(TaskNodeSchema),
});
export type TaskGraph = z.infer<typeof TaskGraphSchema>;

export const SkillCapabilitySchema = z.object({
  id: z.string().min(1),
  description: z.string().min(1),
  riskLevel: RiskLevelSchema,
  readOnlyDefault: z.boolean(),
});
export type SkillCapability = z.infer<typeof SkillCapabilitySchema>;

export const SkillTriggerSchema = z.object({
  id: z.string().min(1),
  keywords: z.array(z.string()).default([]),
  capabilityIds: z.array(z.string()).default([]),
});
export type SkillTrigger = z.infer<typeof SkillTriggerSchema>;

export const SkillDescriptorSchema = z.object({
  id: z.string().min(1),
  displayName: z.string().min(1),
  description: z.string().min(1),
  capabilities: z.array(SkillCapabilitySchema),
  triggers: z.array(SkillTriggerSchema),
  metadata: MetadataSchema.optional(),
});
export type SkillDescriptor = z.infer<typeof SkillDescriptorSchema>;

export const SkillSelectionSchema = z.object({
  skillId: z.string().min(1),
  skill: SkillDescriptorSchema,
  score: z.number().nonnegative(),
  matchedKeywords: z.array(z.string()).default([]),
  reason: z.string().min(1),
  required: z.boolean(),
});
export type SkillSelection = z.infer<typeof SkillSelectionSchema>;

export const SkillResolutionResultSchema = createdEntityBaseSchema.extend({
  inputSummary: z.string().min(1),
  selectedSkills: z.array(SkillSelectionSchema),
  unmatchedCapabilities: z.array(z.string()).default([]),
  reasons: z.array(z.string()).default([]),
});
export type SkillResolutionResult = z.infer<typeof SkillResolutionResultSchema>;

export const OrchestrationPlanSchema = createdEntityBaseSchema.extend({
  requestId: z.string().min(1),
  taskGraphId: z.string().min(1),
  skillResolutionId: z.string().min(1),
  workflowNames: z.array(z.string()).default([]),
  summary: z.string().min(1),
});
export type OrchestrationPlan = z.infer<typeof OrchestrationPlanSchema>;

export const AgentRunStatusSchema = z.enum(['planned', 'running', 'completed', 'failed']);
export type AgentRunStatus = z.infer<typeof AgentRunStatusSchema>;

export const AgentRunSchema = createdEntityBaseSchema.extend({
  taskId: z.string().min(1),
  agentId: z.string().min(1),
  status: AgentRunStatusSchema,
  events: z.array(z.string()).default([]),
  evidenceRefs: z.array(EvidenceRefSchema).default([]),
});
export type AgentRun = z.infer<typeof AgentRunSchema>;

export const PatchRunSchema = createdEntityBaseSchema.extend({
  taskId: z.string().min(1),
  status: z.enum(['planned', 'generated', 'verified', 'rejected']),
  patchRef: z.string().optional(),
  evidenceRefs: z.array(EvidenceRefSchema).default([]),
});
export type PatchRun = z.infer<typeof PatchRunSchema>;

export const VerificationRunSchema = createdEntityBaseSchema.extend({
  targetId: z.string().min(1),
  status: z.enum(['planned', 'running', 'passed', 'failed']),
  checks: z.array(z.string()).default([]),
  evidenceRefs: z.array(EvidenceRefSchema).default([]),
});
export type VerificationRun = z.infer<typeof VerificationRunSchema>;

export const MockDevelopmentRunSummarySchema = z.object({
  requestTitle: z.string().min(1),
  taskCount: z.number().int().nonnegative(),
  selectedSkillIds: z.array(z.string()).default([]),
  agentRunCount: z.number().int().nonnegative(),
  verificationStatus: VerificationRunSchema.shape.status,
  evidenceCount: z.number().int().nonnegative(),
  auditEventCount: z.number().int().nonnegative(),
  orchestrationPlanId: z.string().min(1),
  mockOnly: z.literal(true),
});
export type MockDevelopmentRunSummary = z.infer<typeof MockDevelopmentRunSummarySchema>;

export const MockDevelopmentRunSchema = createdEntityBaseSchema.extend({
  request: DevelopmentRequestSchema,
  taskGraph: TaskGraphSchema,
  skillResolution: SkillResolutionResultSchema,
  agentRuns: z.array(AgentRunSchema),
  verificationRun: VerificationRunSchema,
  evidenceRefs: z.array(EvidenceRefSchema),
  auditEvents: z.array(AuditEventSchema),
  summary: MockDevelopmentRunSummarySchema,
});
export type MockDevelopmentRun = z.infer<typeof MockDevelopmentRunSchema>;

export const CodexExecEventTypeSchema = z.enum([
  'thread.started',
  'turn.started',
  'turn.completed',
  'turn.failed',
  'item.started',
  'item.updated',
  'item.completed',
  'item.failed',
  'error',
  'parse_error',
  'unknown',
]);
export type CodexExecEventType = z.infer<typeof CodexExecEventTypeSchema>;

export const CodexExecItemTypeSchema = z.enum([
  'command_execution',
  'agent_message',
  'reasoning',
  'file_change',
  'mcp_tool_call',
  'web_search',
  'plan_update',
  'unknown',
]);
export type CodexExecItemType = z.infer<typeof CodexExecItemTypeSchema>;

const codexExecTextSummarySchema = z.object({
  summary: z.string().min(1),
  contentHash: z.string().min(1),
  contentLength: z.number().int().nonnegative(),
});

export const CodexExecRawEventSchema = createdEntityBaseSchema.extend({
  lineNumber: z.number().int().positive(),
  rawEventType: z.string().min(1),
  safeSummary: z.string().min(1),
  payloadHash: z.string().min(1),
  payloadLength: z.number().int().nonnegative(),
  parseError: z.string().optional(),
});
export type CodexExecRawEvent = z.infer<typeof CodexExecRawEventSchema>;

export const CodexExecCommandExecutionItemSchema = createdEntityBaseSchema.extend({
  itemType: z.literal('command_execution'),
  itemId: z.string().optional(),
  command: codexExecTextSummarySchema,
  status: z.string().optional(),
  exitCode: z.number().int().optional(),
  output: codexExecTextSummarySchema.optional(),
});
export type CodexExecCommandExecutionItem = z.infer<typeof CodexExecCommandExecutionItemSchema>;

export const CodexExecAgentMessageItemSchema = createdEntityBaseSchema.extend({
  itemType: z.literal('agent_message'),
  itemId: z.string().optional(),
  message: codexExecTextSummarySchema,
});
export type CodexExecAgentMessageItem = z.infer<typeof CodexExecAgentMessageItemSchema>;

export const CodexExecReasoningItemSchema = createdEntityBaseSchema.extend({
  itemType: z.literal('reasoning'),
  itemId: z.string().optional(),
  reasoning: codexExecTextSummarySchema,
});
export type CodexExecReasoningItem = z.infer<typeof CodexExecReasoningItemSchema>;

export const CodexExecFileChangeItemSchema = createdEntityBaseSchema.extend({
  itemType: z.literal('file_change'),
  itemId: z.string().optional(),
  pathSummary: z.string().min(1),
  pathHash: z.string().min(1),
  operation: z.string().optional(),
  changeSummary: codexExecTextSummarySchema.optional(),
});
export type CodexExecFileChangeItem = z.infer<typeof CodexExecFileChangeItemSchema>;

export const CodexExecMcpToolCallItemSchema = createdEntityBaseSchema.extend({
  itemType: z.literal('mcp_tool_call'),
  itemId: z.string().optional(),
  toolName: z.string().min(1),
  argumentsSummary: codexExecTextSummarySchema.optional(),
  resultSummary: codexExecTextSummarySchema.optional(),
});
export type CodexExecMcpToolCallItem = z.infer<typeof CodexExecMcpToolCallItemSchema>;

export const CodexExecWebSearchItemSchema = createdEntityBaseSchema.extend({
  itemType: z.literal('web_search'),
  itemId: z.string().optional(),
  query: codexExecTextSummarySchema.optional(),
  resultCount: z.number().int().nonnegative().optional(),
});
export type CodexExecWebSearchItem = z.infer<typeof CodexExecWebSearchItemSchema>;

export const CodexExecPlanUpdateItemSchema = createdEntityBaseSchema.extend({
  itemType: z.literal('plan_update'),
  itemId: z.string().optional(),
  stepCount: z.number().int().nonnegative(),
  completedStepCount: z.number().int().nonnegative(),
  planSummary: codexExecTextSummarySchema.optional(),
});
export type CodexExecPlanUpdateItem = z.infer<typeof CodexExecPlanUpdateItemSchema>;

export const CodexExecNormalizedItemSchema = z.discriminatedUnion('itemType', [
  CodexExecCommandExecutionItemSchema,
  CodexExecAgentMessageItemSchema,
  CodexExecReasoningItemSchema,
  CodexExecFileChangeItemSchema,
  CodexExecMcpToolCallItemSchema,
  CodexExecWebSearchItemSchema,
  CodexExecPlanUpdateItemSchema,
  createdEntityBaseSchema.extend({
    itemType: z.literal('unknown'),
    itemId: z.string().optional(),
    safeSummary: z.string().min(1),
    payloadHash: z.string().min(1),
    payloadLength: z.number().int().nonnegative(),
  }),
]);
export type CodexExecNormalizedItem = z.infer<typeof CodexExecNormalizedItemSchema>;

export const CodexExecNormalizedEventSchema = createdEntityBaseSchema.extend({
  rawEventType: z.string().min(1),
  normalizedType: CodexExecEventTypeSchema,
  threadId: z.string().optional(),
  turnId: z.string().optional(),
  itemId: z.string().optional(),
  itemType: CodexExecItemTypeSchema.optional(),
  status: z.string().optional(),
  summary: z.string().min(1),
  payloadHash: z.string().min(1),
  payloadLength: z.number().int().nonnegative(),
  item: CodexExecNormalizedItemSchema.optional(),
  safe: z.literal(true),
});
export type CodexExecNormalizedEvent = z.infer<typeof CodexExecNormalizedEventSchema>;

export const CodexExecThreadStartedEventSchema = CodexExecNormalizedEventSchema.extend({
  normalizedType: z.literal('thread.started'),
});
export type CodexExecThreadStartedEvent = z.infer<typeof CodexExecThreadStartedEventSchema>;

export const CodexExecTurnStartedEventSchema = CodexExecNormalizedEventSchema.extend({
  normalizedType: z.literal('turn.started'),
});
export type CodexExecTurnStartedEvent = z.infer<typeof CodexExecTurnStartedEventSchema>;

export const CodexExecTurnCompletedEventSchema = CodexExecNormalizedEventSchema.extend({
  normalizedType: z.literal('turn.completed'),
});
export type CodexExecTurnCompletedEvent = z.infer<typeof CodexExecTurnCompletedEventSchema>;

export const CodexExecTurnFailedEventSchema = CodexExecNormalizedEventSchema.extend({
  normalizedType: z.literal('turn.failed'),
});
export type CodexExecTurnFailedEvent = z.infer<typeof CodexExecTurnFailedEventSchema>;

export const CodexExecItemEventSchema = CodexExecNormalizedEventSchema.extend({
  normalizedType: z.enum(['item.started', 'item.updated', 'item.completed', 'item.failed']),
  item: CodexExecNormalizedItemSchema,
});
export type CodexExecItemEvent = z.infer<typeof CodexExecItemEventSchema>;

export const CodexExecErrorEventSchema = CodexExecNormalizedEventSchema.extend({
  normalizedType: z.union([z.literal('error'), z.literal('parse_error')]),
});
export type CodexExecErrorEvent = z.infer<typeof CodexExecErrorEventSchema>;

export const CodexExecUnknownEventSchema = CodexExecNormalizedEventSchema.extend({
  normalizedType: z.literal('unknown'),
});
export type CodexExecUnknownEvent = z.infer<typeof CodexExecUnknownEventSchema>;

export const CodexExecFinalStatusSchema = z.enum(['completed', 'failed', 'unknown']);
export type CodexExecFinalStatus = z.infer<typeof CodexExecFinalStatusSchema>;

export const CodexExecReplayResultSchema = createdEntityBaseSchema.extend({
  threadId: z.string().optional(),
  events: z.array(CodexExecNormalizedEventSchema),
  eventCount: z.number().int().nonnegative(),
  itemCount: z.number().int().nonnegative(),
  commandExecutionCount: z.number().int().nonnegative(),
  fileChangeCount: z.number().int().nonnegative(),
  mcpToolCallCount: z.number().int().nonnegative(),
  webSearchCount: z.number().int().nonnegative(),
  errorCount: z.number().int().nonnegative(),
  finalStatus: CodexExecFinalStatusSchema,
  evidenceRefs: z.array(EvidenceRefSchema),
  auditEvents: z.array(AuditEventSchema),
});
export type CodexExecReplayResult = z.infer<typeof CodexExecReplayResultSchema>;

export const CodexReplayStatusSchema = z.enum(['completed', 'failed', 'unknown']);
export type CodexReplayStatus = z.infer<typeof CodexReplayStatusSchema>;

export const CodexReplaySourceKindSchema = z.literal('fixture');
export type CodexReplaySourceKind = z.infer<typeof CodexReplaySourceKindSchema>;

const codexReplayCountsSchema = z.object({
  eventCount: z.number().int().nonnegative(),
  itemCount: z.number().int().nonnegative(),
  commandExecutionCount: z.number().int().nonnegative(),
  fileChangeCount: z.number().int().nonnegative(),
  mcpToolCallCount: z.number().int().nonnegative(),
  webSearchCount: z.number().int().nonnegative(),
  errorCount: z.number().int().nonnegative(),
});

const codexReplaySafetyFlagsSchema = z.object({
  mockOnly: z.literal(true),
  liveExecution: z.literal(false),
  externalProcessStarted: z.literal(false),
});

export const CodexReplayStorageMetadataSchema = codexReplaySafetyFlagsSchema.extend({
  sourceKind: CodexReplaySourceKindSchema,
  fixturePath: z.string().min(1),
  fixturePathHash: z.string().min(1),
  replayHash: z.string().min(1),
  bodyStored: z.literal(false),
  normalizedEventsStored: z.literal(false),
  eventHashCount: z.number().int().nonnegative(),
});
export type CodexReplayStorageMetadata = z.infer<typeof CodexReplayStorageMetadataSchema>;

export const CodexReplaySummarySchema = createdEntityBaseSchema
  .merge(codexReplayCountsSchema)
  .merge(codexReplaySafetyFlagsSchema)
  .extend({
    sourceKind: CodexReplaySourceKindSchema,
    fixturePath: z.string().min(1),
    threadId: z.string().optional(),
    status: CodexReplayStatusSchema,
    summary: z.string().min(1),
    replayHash: z.string().min(1),
    evidenceCount: z.number().int().nonnegative(),
    auditEventCount: z.number().int().nonnegative(),
  });
export type CodexReplaySummary = z.infer<typeof CodexReplaySummarySchema>;

export const CodexReplayRecordSchema = createdEntityBaseSchema
  .merge(codexReplayCountsSchema)
  .merge(codexReplaySafetyFlagsSchema)
  .extend({
    sourceKind: CodexReplaySourceKindSchema,
    fixturePath: z.string().min(1),
    threadId: z.string().optional(),
    status: CodexReplayStatusSchema,
    summary: z.string().min(1),
    replayHash: z.string().min(1),
    evidenceRefs: z.array(EvidenceRefSchema),
    auditEventIds: z.array(z.string()).default([]),
    storageMetadata: CodexReplayStorageMetadataSchema,
  });
export type CodexReplayRecord = z.infer<typeof CodexReplayRecordSchema>;

export const CodexExecSandboxModeSchema = z.enum([
  'read_only',
  'workspace_write',
  'danger_full_access',
]);
export type CodexExecSandboxMode = z.infer<typeof CodexExecSandboxModeSchema>;

export const CodexExecApprovalModeSchema = z.enum(['never', 'on_request', 'required']);
export type CodexExecApprovalMode = z.infer<typeof CodexExecApprovalModeSchema>;

export const CodexExecLiveExecutionStatusSchema = z.enum([
  'disabled',
  'dry_run_ready',
  'awaiting_approval',
  'approved_not_executed',
  'blocked',
]);
export type CodexExecLiveExecutionStatus = z.infer<typeof CodexExecLiveExecutionStatusSchema>;

const codexExecControlPlaneSafetyFlagsSchema = z.object({
  liveExecution: z.literal(false),
  externalProcessStarted: z.literal(false),
  executionDisabled: z.literal(true),
});

export const CodexExecApprovalScopeSchema = z.enum([
  'read_only_plan',
  'workspace_write_plan',
  'danger_full_access_plan',
]);
export type CodexExecApprovalScope = z.infer<typeof CodexExecApprovalScopeSchema>;

export const CodexExecApprovalStatusSchema = z.enum([
  'pending',
  'approved',
  'expired',
  'revoked',
  'used',
]);
export type CodexExecApprovalStatus = z.infer<typeof CodexExecApprovalStatusSchema>;

const codexExecWorktreeRequirementSchema = z.object({
  requiresIsolatedWorktree: z.boolean(),
  isolatedWorktreePresent: z.boolean().default(false),
  worktreePathSummary: z.string().optional(),
  worktreePathHash: z.string().optional(),
});

export const CodexExecWorktreeRequirementSchema = createdEntityBaseSchema.extend({
  sandboxMode: CodexExecSandboxModeSchema,
  requirement: codexExecWorktreeRequirementSchema,
  status: z.enum(['satisfied', 'missing', 'not_required']),
  summary: z.string().min(1),
});
export type CodexExecWorktreeRequirement = z.infer<typeof CodexExecWorktreeRequirementSchema>;

export const CodexExecLiveConfigSchema = createdEntityBaseSchema.extend({
  liveEnabled: z.boolean().default(false),
  allowedSandboxModes: z.array(CodexExecSandboxModeSchema).default(['read_only']),
  forbiddenSandboxModes: z.array(CodexExecSandboxModeSchema).default(['danger_full_access']),
  requiresApproval: z.boolean().default(true),
  requiresIsolatedWorktreeForWorkspaceWrite: z.boolean().default(true),
  approvalTtlMinutes: z.number().int().positive().default(30),
  singleUseApprovals: z.boolean().default(true),
});
export type CodexExecLiveConfig = z.infer<typeof CodexExecLiveConfigSchema>;

export const CodexExecLiveCapabilityStateSchema = createdEntityBaseSchema.extend({
  liveEnabled: z.boolean(),
  enabled: z.boolean(),
  status: z.enum(['disabled', 'available', 'blocked']),
  allowedSandboxModes: z.array(CodexExecSandboxModeSchema),
  forbiddenSandboxModes: z.array(CodexExecSandboxModeSchema),
  reasons: z.array(z.string()).default([]),
});
export type CodexExecLiveCapabilityState = z.infer<typeof CodexExecLiveCapabilityStateSchema>;

export const CodexExecPreflightCheckSchema = createdEntityBaseSchema.extend({
  name: z.string().min(1),
  status: z.enum(['passed', 'failed', 'warning']),
  summary: z.string().min(1),
});
export type CodexExecPreflightCheck = z.infer<typeof CodexExecPreflightCheckSchema>;

export const CodexExecPreflightResultSchema = createdEntityBaseSchema
  .merge(codexExecControlPlaneSafetyFlagsSchema)
  .extend({
    dryRunPlanId: z.string().min(1),
    dryRunPlanHash: z.string().min(1),
    configId: z.string().min(1),
    status: z.enum(['passed', 'blocked']),
    checks: z.array(CodexExecPreflightCheckSchema),
    worktreeRequirement: CodexExecWorktreeRequirementSchema,
    summary: z.string().min(1),
  });
export type CodexExecPreflightResult = z.infer<typeof CodexExecPreflightResultSchema>;

export const CodexExecApprovalArtifactSchema = createdEntityBaseSchema
  .merge(codexExecControlPlaneSafetyFlagsSchema)
  .extend({
    dryRunPlanId: z.string().min(1),
    dryRunPlanHash: z.string().min(1),
    policyDecisionId: z.string().min(1),
    policyDecisionHash: z.string().min(1),
    scope: CodexExecApprovalScopeSchema,
    status: CodexExecApprovalStatusSchema,
    expiresAt: IsoDateTimeSchema,
    singleUse: z.boolean(),
    revoked: z.boolean().default(false),
    usedAt: IsoDateTimeSchema.optional(),
    summary: z.string().min(1),
  });
export type CodexExecApprovalArtifact = z.infer<typeof CodexExecApprovalArtifactSchema>;

export const CodexExecExecutionGateResultSchema = createdEntityBaseSchema
  .merge(codexExecControlPlaneSafetyFlagsSchema)
  .extend({
    dryRunPlanId: z.string().min(1),
    dryRunPlanHash: z.string().min(1),
    policyDecisionId: z.string().min(1),
    policyDecisionHash: z.string().min(1),
    approvalArtifactId: z.string().optional(),
    status: z.enum(['blocked', 'ready']),
    reasons: z.array(z.string()).default([]),
    preflightStatus: z.enum(['passed', 'blocked']).optional(),
    liveEnabled: z.boolean(),
    allowedSandboxModes: z.array(CodexExecSandboxModeSchema),
    summary: z.string().min(1),
  });
export type CodexExecExecutionGateResult = z.infer<typeof CodexExecExecutionGateResultSchema>;

const codexExecPromptSummarySchema = z.object({
  promptSummary: z.string().min(1),
  promptHash: z.string().min(1),
  promptLength: z.number().int().nonnegative(),
  promptBodyStored: z.literal(false),
});

export const CodexExecExecutionIntentSchema = createdEntityBaseSchema
  .merge(codexExecPromptSummarySchema)
  .merge(codexExecControlPlaneSafetyFlagsSchema)
  .extend({
    title: z.string().min(1),
    cwd: z.string().min(1),
    sandboxMode: CodexExecSandboxModeSchema,
    approvalMode: CodexExecApprovalModeSchema,
    liveAdapterEnabled: z.boolean().default(false),
  });
export type CodexExecExecutionIntent = z.infer<typeof CodexExecExecutionIntentSchema>;

export const CodexExecDryRunPlanSchema = createdEntityBaseSchema
  .merge(codexExecPromptSummarySchema)
  .merge(codexExecControlPlaneSafetyFlagsSchema)
  .extend({
    intentId: z.string().min(1),
    intent: CodexExecExecutionIntentSchema,
    title: z.string().min(1),
    cwd: z.string().min(1),
    sandboxMode: CodexExecSandboxModeSchema,
    approvalMode: CodexExecApprovalModeSchema,
    riskLevel: RiskLevelSchema,
    liveAdapterEnabled: z.boolean().default(false),
    summary: z.string().min(1),
  });
export type CodexExecDryRunPlan = z.infer<typeof CodexExecDryRunPlanSchema>;

export const CodexExecCommandPreviewSchema = createdEntityBaseSchema
  .merge(codexExecControlPlaneSafetyFlagsSchema)
  .extend({
    intentId: z.string().min(1),
    dryRunPlanId: z.string().min(1),
    cwd: z.string().min(1),
    sandboxMode: CodexExecSandboxModeSchema,
    approvalMode: CodexExecApprovalModeSchema,
    previewSummary: z.string().min(1),
    binaryName: z.literal('codex'),
    argumentSummary: z.string().min(1),
    previewHash: z.string().min(1),
    redacted: z.literal(true),
  });
export type CodexExecCommandPreview = z.infer<typeof CodexExecCommandPreviewSchema>;

export const CodexExecPolicyInputSchema = createdEntityBaseSchema
  .merge(codexExecPromptSummarySchema)
  .merge(codexExecControlPlaneSafetyFlagsSchema)
  .extend({
    intentId: z.string().min(1),
    dryRunPlanId: z.string().min(1),
    actionType: z.literal('codex.exec.live.intent'),
    actionMode: ActionModeSchema,
    riskLevel: RiskLevelSchema,
    sandboxMode: CodexExecSandboxModeSchema,
    approvalMode: CodexExecApprovalModeSchema,
    dryRunPlanPresent: z.boolean(),
    liveAdapterEnabled: z.boolean().default(false),
    guardedPromptMatch: z.boolean().default(false),
  });
export type CodexExecPolicyInput = z.infer<typeof CodexExecPolicyInputSchema>;

export const CodexExecApprovalRequirementSchema = createdEntityBaseSchema.extend({
  dryRunPlanId: z.string().min(1),
  policyDecisionId: z.string().min(1),
  required: z.boolean(),
  riskLevel: RiskLevelSchema,
  approvalMode: CodexExecApprovalModeSchema,
  status: CodexExecLiveExecutionStatusSchema,
  reason: z.string().min(1),
});
export type CodexExecApprovalRequirement = z.infer<typeof CodexExecApprovalRequirementSchema>;

export const CodexExecLiveExecutionDisabledErrorSchema = createdEntityBaseSchema
  .merge(codexExecControlPlaneSafetyFlagsSchema)
  .extend({
    code: z.literal('CODEX_EXEC_LIVE_DISABLED'),
    message: z.string().min(1),
    reason: z.string().min(1),
  });
export type CodexExecLiveExecutionDisabledError = z.infer<
  typeof CodexExecLiveExecutionDisabledErrorSchema
>;

export const CodexExecLiveRunRecordSchema = createdEntityBaseSchema
  .merge(codexExecPromptSummarySchema)
  .merge(codexExecControlPlaneSafetyFlagsSchema)
  .extend({
    intentId: z.string().min(1),
    dryRunPlanId: z.string().min(1),
    title: z.string().min(1),
    cwd: z.string().min(1),
    sandboxMode: CodexExecSandboxModeSchema,
    approvalMode: CodexExecApprovalModeSchema,
    riskLevel: RiskLevelSchema,
    status: CodexExecLiveExecutionStatusSchema,
    intent: CodexExecExecutionIntentSchema,
    dryRunPlan: CodexExecDryRunPlanSchema,
    commandPreview: CodexExecCommandPreviewSchema,
    policyDecision: PolicyDecisionSchema,
    approvalRequirement: CodexExecApprovalRequirementSchema,
    disabledError: CodexExecLiveExecutionDisabledErrorSchema,
    evidenceRefs: z.array(EvidenceRefSchema),
    auditEvents: z.array(AuditEventSchema),
    preflightResult: CodexExecPreflightResultSchema.optional(),
    approvalArtifact: CodexExecApprovalArtifactSchema.optional(),
    executionGateResult: CodexExecExecutionGateResultSchema.optional(),
  });
export type CodexExecLiveRunRecord = z.infer<typeof CodexExecLiveRunRecordSchema>;

export function foundationTimestamp(): string {
  return new Date().toISOString();
}

export function foundationId(prefix: string): string {
  return `${prefix}_${crypto.randomUUID()}`;
}

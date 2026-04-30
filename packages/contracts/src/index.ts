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
    'codex.exec.live_config',
    'codex.exec.approval_request',
    'codex.exec.approval_decision',
    'codex.exec.approval_state',
    'codex.exec.live_adapter_adr_decision',
    'codex.exec.read_only_adapter.preflight_simulation',
    'codex.exec.read_only_adapter.simulator_review',
    'codex.exec.read_only_adapter.implementation_plan_review',
    'codex.exec.read_only_adapter.skeleton_preview',
    'codex.exec.read_only_adapter.skeleton_review',
    'codex.exec.read_only_adapter.fixture_boundary',
    'codex.exec.read_only_adapter.final_readiness',
    'codex.exec.real_read_only_adapter.readiness_package',
    'codex.exec.real_read_only_adapter.readiness_review',
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
  liveExecution: z.literal(false).default(false),
  externalProcessStarted: z.literal(false).default(false),
  executionDisabled: z.literal(true).default(true),
});

const codexExecReadOnlyAdapterSafetyFlagsSchema = codexExecControlPlaneSafetyFlagsSchema.extend({
  processAdapterStarted: z.literal(false).default(false),
  implementationApproved: z.literal(false).default(false),
  dashboardTriggerAllowed: z.literal(false).default(false),
});

export const CodexExecConfigSourceSchema = z.enum(['default', 'file']);
export type CodexExecConfigSource = z.infer<typeof CodexExecConfigSourceSchema>;

export const CodexExecApprovalScopeSchema = z.enum([
  'read_only_plan',
  'workspace_write_plan',
  'danger_full_access_plan',
]);
export type CodexExecApprovalScope = z.infer<typeof CodexExecApprovalScopeSchema>;

export const CodexExecApprovalStatusSchema = z.enum([
  'pending',
  'approved',
  'denied',
  'expired',
  'revoked',
  'used',
]);
export type CodexExecApprovalStatus = z.infer<typeof CodexExecApprovalStatusSchema>;

export const CodexExecApprovalDecisionOutcomeSchema = z.enum(['approved', 'denied', 'revoked']);
export type CodexExecApprovalDecisionOutcome = z.infer<
  typeof CodexExecApprovalDecisionOutcomeSchema
>;

export const CodexExecApprovalTransitionActionSchema = z.enum([
  'approve',
  'deny',
  'revoke',
  'expire',
  'mark_used',
]);
export type CodexExecApprovalTransitionAction = z.infer<
  typeof CodexExecApprovalTransitionActionSchema
>;

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

export const CodexExecLiveConfigSchema = createdEntityBaseSchema
  .merge(codexExecControlPlaneSafetyFlagsSchema)
  .extend({
    liveEnabled: z.boolean().default(false),
    allowedSandboxModes: z.array(CodexExecSandboxModeSchema).default(['read_only']),
    forbiddenSandboxModes: z
      .array(CodexExecSandboxModeSchema)
      .default(['workspace_write', 'danger_full_access']),
    requiresApproval: z.boolean().default(true),
    requiresIsolatedWorktreeForWorkspaceWrite: z.boolean().default(true),
    approvalTtlMinutes: z.number().int().positive().default(30),
    singleUseApprovals: z.boolean().default(true),
    configSource: CodexExecConfigSourceSchema.default('default'),
    configPath: z.string().min(1).optional(),
    configPathHash: z.string().min(1).optional(),
    configBodyStored: z.literal(false).default(false),
  });
export type CodexExecLiveConfig = z.infer<typeof CodexExecLiveConfigSchema>;

export const CodexExecConfigFileSchema = createdEntityBaseSchema
  .merge(codexExecControlPlaneSafetyFlagsSchema)
  .extend({
    configPath: z.string().min(1),
    configPathHash: z.string().min(1),
    configHash: z.string().min(1),
    bodyStored: z.literal(false),
    summary: z.string().min(1),
  });
export type CodexExecConfigFile = z.infer<typeof CodexExecConfigFileSchema>;

export const CodexExecConfigLoadResultSchema = createdEntityBaseSchema
  .merge(codexExecControlPlaneSafetyFlagsSchema)
  .extend({
    source: CodexExecConfigSourceSchema,
    status: z.enum(['loaded', 'defaulted', 'failed']),
    config: CodexExecLiveConfigSchema,
    configFile: CodexExecConfigFileSchema.optional(),
    errors: z.array(z.string()).default([]),
    summary: z.string().min(1),
  });
export type CodexExecConfigLoadResult = z.infer<typeof CodexExecConfigLoadResultSchema>;

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

export const CodexExecManualApprovalRequestSchema = createdEntityBaseSchema
  .merge(codexExecControlPlaneSafetyFlagsSchema)
  .extend({
    dryRunPlanId: z.string().min(1),
    dryRunPlanHash: z.string().min(1),
    policyDecisionId: z.string().min(1),
    policyDecisionHash: z.string().min(1),
    scope: CodexExecApprovalScopeSchema,
    status: CodexExecApprovalStatusSchema,
    riskLevel: RiskLevelSchema,
    requestedBy: z.string().min(1),
    reason: z.string().min(1),
    expiresAt: IsoDateTimeSchema,
    singleUse: z.boolean(),
    summary: z.string().min(1),
  });
export type CodexExecManualApprovalRequest = z.infer<typeof CodexExecManualApprovalRequestSchema>;

export const CodexExecManualApprovalDecisionSchema = createdEntityBaseSchema
  .merge(codexExecControlPlaneSafetyFlagsSchema)
  .extend({
    approvalRequestId: z.string().min(1),
    dryRunPlanId: z.string().min(1),
    policyDecisionId: z.string().min(1),
    outcome: CodexExecApprovalDecisionOutcomeSchema,
    decidedBy: z.string().min(1),
    reasonSummary: z.string().min(1),
    decisionHash: z.string().min(1),
    approved: z.boolean(),
    approvalArtifactId: z.string().min(1).optional(),
    summary: z.string().min(1),
  });
export type CodexExecManualApprovalDecision = z.infer<typeof CodexExecManualApprovalDecisionSchema>;

export const CodexExecManualApprovalStateSchema = createdEntityBaseSchema
  .merge(codexExecControlPlaneSafetyFlagsSchema)
  .extend({
    approvalRecordId: z.string().min(1).optional(),
    approvalRequestId: z.string().min(1),
    dryRunPlanId: z.string().min(1),
    dryRunPlanHash: z.string().min(1),
    policyDecisionId: z.string().min(1),
    policyDecisionHash: z.string().min(1),
    status: CodexExecApprovalStatusSchema,
    requestedStatus: CodexExecApprovalStatusSchema,
    decisionOutcome: CodexExecApprovalDecisionOutcomeSchema.optional(),
    artifactStatus: CodexExecApprovalStatusSchema.optional(),
    expiresAt: IsoDateTimeSchema,
    expired: z.boolean(),
    terminal: z.boolean(),
    canDecide: z.boolean(),
    nextAllowedActions: z.array(CodexExecApprovalTransitionActionSchema).default([]),
    reasons: z.array(z.string()).default([]),
    summary: z.string().min(1),
  });
export type CodexExecManualApprovalState = z.infer<typeof CodexExecManualApprovalStateSchema>;

export const CodexExecApprovalTransitionResultSchema = createdEntityBaseSchema
  .merge(codexExecControlPlaneSafetyFlagsSchema)
  .extend({
    approvalRecordId: z.string().min(1).optional(),
    approvalRequestId: z.string().min(1),
    dryRunPlanId: z.string().min(1),
    action: CodexExecApprovalTransitionActionSchema,
    fromStatus: CodexExecApprovalStatusSchema,
    toStatus: CodexExecApprovalStatusSchema,
    allowed: z.boolean(),
    reasons: z.array(z.string()).default([]),
    state: CodexExecManualApprovalStateSchema,
    summary: z.string().min(1),
  });
export type CodexExecApprovalTransitionResult = z.infer<
  typeof CodexExecApprovalTransitionResultSchema
>;

export const CodexExecManualApprovalRecordSchema = createdEntityBaseSchema
  .merge(codexExecControlPlaneSafetyFlagsSchema)
  .extend({
    request: CodexExecManualApprovalRequestSchema,
    decision: CodexExecManualApprovalDecisionSchema.optional(),
    approvalArtifact: CodexExecApprovalArtifactSchema.optional(),
    status: CodexExecApprovalStatusSchema,
    approvalState: CodexExecManualApprovalStateSchema.optional(),
    evidenceRefs: z.array(EvidenceRefSchema),
    auditEventIds: z.array(z.string()).default([]),
    summary: z.string().min(1),
  });
export type CodexExecManualApprovalRecord = z.infer<typeof CodexExecManualApprovalRecordSchema>;

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
    configLoadResult: CodexExecConfigLoadResultSchema.optional(),
    manualApprovalRequest: CodexExecManualApprovalRequestSchema.optional(),
    manualApprovalDecision: CodexExecManualApprovalDecisionSchema.optional(),
    manualApprovalRecord: CodexExecManualApprovalRecordSchema.optional(),
    manualApprovalState: CodexExecManualApprovalStateSchema.optional(),
  });
export type CodexExecLiveRunRecord = z.infer<typeof CodexExecLiveRunRecordSchema>;

export const CodexExecTimelineStatusSchema = z.enum([
  'dry_run_created',
  'blocked',
  'preflight_blocked',
  'preflight_passed',
  'approval_pending',
  'approval_approved',
  'approval_denied',
  'approval_revoked',
  'gate_blocked',
  'gate_ready',
]);
export type CodexExecTimelineStatus = z.infer<typeof CodexExecTimelineStatusSchema>;

export const CodexExecTimelineEventSourceKindSchema = z.enum([
  'config',
  'dry_run',
  'command_preview',
  'policy',
  'preflight',
  'approval_request',
  'approval_decision',
  'approval_state',
  'approval_artifact',
  'gate',
  'evidence',
  'audit',
]);
export type CodexExecTimelineEventSourceKind = z.infer<
  typeof CodexExecTimelineEventSourceKindSchema
>;

export const CodexExecTimelineFilterSourceSchema = z.union([
  CodexExecTimelineEventSourceKindSchema,
  z.literal('approval'),
]);
export type CodexExecTimelineFilterSource = z.infer<typeof CodexExecTimelineFilterSourceSchema>;

export const CodexExecTimelineEventTypeSchema = z.enum([
  'codex.exec.config.loaded',
  'codex.exec.dry_run.created',
  'codex.exec.command_preview.created',
  'codex.exec.policy.evaluated',
  'codex.exec.preflight.completed',
  'codex.exec.approval.requested',
  'codex.exec.approval.decided',
  'codex.exec.approval.state_evaluated',
  'codex.exec.approval.artifact_available',
  'codex.exec.gate.evaluated',
  'codex.exec.evidence.recorded',
  'codex.exec.audit.recorded',
]);
export type CodexExecTimelineEventType = z.infer<typeof CodexExecTimelineEventTypeSchema>;

export const CodexExecTimelineEventSchema = createdEntityBaseSchema
  .merge(codexExecControlPlaneSafetyFlagsSchema)
  .extend({
    dryRunId: z.string().min(1),
    liveRunRecordId: z.string().min(1),
    eventType: CodexExecTimelineEventTypeSchema,
    sourceKind: CodexExecTimelineEventSourceKindSchema,
    sourceId: z.string().min(1).optional(),
    status: z.string().min(1),
    summary: z.string().min(1),
    occurredAt: IsoDateTimeSchema,
  });
export type CodexExecTimelineEvent = z.infer<typeof CodexExecTimelineEventSchema>;

export const CodexExecControlPlaneTimelineSchema = createdEntityBaseSchema
  .merge(codexExecControlPlaneSafetyFlagsSchema)
  .extend({
    dryRunId: z.string().min(1),
    liveRunRecordId: z.string().min(1),
    status: CodexExecTimelineStatusSchema,
    events: z.array(CodexExecTimelineEventSchema),
    eventCount: z.number().int().nonnegative(),
    evidenceCount: z.number().int().nonnegative(),
    auditEventCount: z.number().int().nonnegative(),
    summary: z.string().min(1),
  });
export type CodexExecControlPlaneTimeline = z.infer<typeof CodexExecControlPlaneTimelineSchema>;

export const CodexExecTimelineFilterSchema = z.object({
  source: CodexExecTimelineFilterSourceSchema.optional(),
  status: z.string().min(1).optional(),
  eventType: CodexExecTimelineEventTypeSchema.optional(),
  riskLevel: RiskLevelSchema.optional(),
  limit: z.number().int().positive().max(200).optional(),
  includeEvidence: z.boolean().default(true),
  includeAudit: z.boolean().default(true),
});
export type CodexExecTimelineFilter = z.infer<typeof CodexExecTimelineFilterSchema>;

export const CodexExecTimelineQuerySchema = createdEntityBaseSchema
  .merge(codexExecControlPlaneSafetyFlagsSchema)
  .extend({
    dryRunId: z.string().min(1),
    filter: CodexExecTimelineFilterSchema.default({}),
  });
export type CodexExecTimelineQuery = z.infer<typeof CodexExecTimelineQuerySchema>;

export const CodexExecTimelineEvidenceSummaryItemSchema = z.object({
  evidenceRefId: z.string().min(1),
  kind: EvidenceRefSchema.shape.kind,
  summary: z.string().min(1).optional(),
  hash: z.string().min(1),
  labels: z.array(z.string()).default([]),
  createdAt: IsoDateTimeSchema,
});
export type CodexExecTimelineEvidenceSummaryItem = z.infer<
  typeof CodexExecTimelineEvidenceSummaryItemSchema
>;

export const CodexExecTimelineEvidenceSummarySchema = createdEntityBaseSchema
  .merge(codexExecControlPlaneSafetyFlagsSchema)
  .extend({
    dryRunId: z.string().min(1),
    liveRunRecordId: z.string().min(1),
    count: z.number().int().nonnegative(),
    evidenceRefIds: z.array(z.string()).default([]),
    items: z.array(CodexExecTimelineEvidenceSummaryItemSchema).default([]),
    metadataOnly: z.literal(true),
    bodyStored: z.literal(false),
  });
export type CodexExecTimelineEvidenceSummary = z.infer<
  typeof CodexExecTimelineEvidenceSummarySchema
>;

export const CodexExecTimelineAuditSummaryItemSchema = z.object({
  auditEventId: z.string().min(1),
  action: z.string().min(1),
  outcome: z.string().min(1),
  createdAt: IsoDateTimeSchema,
  policyDecisionId: z.string().optional(),
  evidenceRefIds: z.array(z.string()).default([]),
});
export type CodexExecTimelineAuditSummaryItem = z.infer<
  typeof CodexExecTimelineAuditSummaryItemSchema
>;

export const CodexExecTimelineAuditSummarySchema = createdEntityBaseSchema
  .merge(codexExecControlPlaneSafetyFlagsSchema)
  .extend({
    dryRunId: z.string().min(1),
    liveRunRecordId: z.string().min(1),
    count: z.number().int().nonnegative(),
    auditEventIds: z.array(z.string()).default([]),
    items: z.array(CodexExecTimelineAuditSummaryItemSchema).default([]),
    metadataOnly: z.literal(true),
    bodyStored: z.literal(false),
  });
export type CodexExecTimelineAuditSummary = z.infer<typeof CodexExecTimelineAuditSummarySchema>;

export const CodexExecTimelineDetailViewSchema = createdEntityBaseSchema
  .merge(codexExecControlPlaneSafetyFlagsSchema)
  .extend({
    dryRunId: z.string().min(1),
    liveRunRecordId: z.string().min(1),
    timeline: CodexExecControlPlaneTimelineSchema,
    sourceBreakdown: z.record(z.number().int().nonnegative()),
    latestGateStatus: z.string().min(1).optional(),
    approvalStatus: CodexExecApprovalStatusSchema.optional(),
    dryRunSummary: z.object({
      dryRunPlanId: z.string().min(1),
      title: z.string().min(1),
      sandboxMode: CodexExecSandboxModeSchema,
      approvalMode: CodexExecApprovalModeSchema,
      riskLevel: RiskLevelSchema,
      promptSummary: z.string().min(1),
      promptHash: z.string().min(1),
      promptLength: z.number().int().nonnegative(),
      promptBodyStored: z.literal(false),
    }),
    commandPreviewSummary: z.object({
      commandPreviewId: z.string().min(1),
      previewSummary: z.string().min(1),
      previewHash: z.string().min(1),
      redacted: z.literal(true),
      argumentSummary: z.string().min(1),
    }),
    policySummary: z.object({
      policyDecisionId: z.string().min(1),
      outcome: PolicyOutcomeSchema,
      riskLevel: RiskLevelSchema,
      requiresDryRun: z.boolean(),
      requiresApproval: z.boolean(),
      reasonCount: z.number().int().nonnegative(),
    }),
    approvalStateSummary: z
      .object({
        approvalRequestId: z.string().min(1),
        status: CodexExecApprovalStatusSchema,
        canDecide: z.boolean(),
        terminal: z.boolean(),
        reasonCount: z.number().int().nonnegative(),
      })
      .optional(),
    gateSummary: z
      .object({
        executionGateResultId: z.string().min(1),
        status: z.enum(['blocked', 'ready']),
        reasonCount: z.number().int().nonnegative(),
        liveEnabled: z.boolean(),
      })
      .optional(),
    evidenceSummary: CodexExecTimelineEvidenceSummarySchema,
    auditSummary: CodexExecTimelineAuditSummarySchema,
    summary: z.string().min(1),
  });
export type CodexExecTimelineDetailView = z.infer<typeof CodexExecTimelineDetailViewSchema>;

export const CodexExecEvidenceQuerySchema = createdEntityBaseSchema
  .merge(codexExecControlPlaneSafetyFlagsSchema)
  .extend({
    dryRunId: z.string().min(1).optional(),
    kind: EvidenceRefSchema.shape.kind.optional(),
    limit: z.number().int().positive().max(200).default(20),
  });
export type CodexExecEvidenceQuery = z.infer<typeof CodexExecEvidenceQuerySchema>;

export const CodexExecAuditQuerySchema = createdEntityBaseSchema
  .merge(codexExecControlPlaneSafetyFlagsSchema)
  .extend({
    dryRunId: z.string().min(1).optional(),
    action: z.string().min(1).optional(),
    limit: z.number().int().positive().max(200).default(20),
  });
export type CodexExecAuditQuery = z.infer<typeof CodexExecAuditQuerySchema>;

export const CodexExecDetailMetadataSummarySchema = z.object({
  keyCount: z.number().int().nonnegative(),
  keys: z.array(z.string()).default([]),
  relatedIds: z.array(z.string()).default([]),
  bodyStored: z.literal(false),
});
export type CodexExecDetailMetadataSummary = z.infer<typeof CodexExecDetailMetadataSummarySchema>;

export const CodexExecEvidenceDetailStatusSchema = z.enum(['found', 'not_found']);
export type CodexExecEvidenceDetailStatus = z.infer<typeof CodexExecEvidenceDetailStatusSchema>;

export const CodexExecEvidenceDetailViewSchema = createdEntityBaseSchema
  .merge(codexExecControlPlaneSafetyFlagsSchema)
  .extend({
    status: CodexExecEvidenceDetailStatusSchema,
    evidenceRefId: z.string().min(1),
    dryRunId: z.string().min(1).optional(),
    liveRunRecordId: z.string().min(1).optional(),
    kind: EvidenceRefSchema.shape.kind.optional(),
    summary: z.string().min(1).optional(),
    hash: z.string().min(1).optional(),
    labels: z.array(z.string()).default([]),
    refCreatedAt: IsoDateTimeSchema.optional(),
    expiresAt: IsoDateTimeSchema.optional(),
    relatedAuditEventIds: z.array(z.string()).default([]),
    metadataSummary: CodexExecDetailMetadataSummarySchema.optional(),
    metadataOnly: z.literal(true),
    bodyStored: z.literal(false),
  });
export type CodexExecEvidenceDetailView = z.infer<typeof CodexExecEvidenceDetailViewSchema>;

export const CodexExecEvidenceSearchResultSchema = createdEntityBaseSchema
  .merge(codexExecControlPlaneSafetyFlagsSchema)
  .extend({
    query: CodexExecEvidenceQuerySchema,
    count: z.number().int().nonnegative(),
    items: z.array(CodexExecEvidenceDetailViewSchema).default([]),
    metadataOnly: z.literal(true),
    bodyStored: z.literal(false),
    summary: z.string().min(1),
  });
export type CodexExecEvidenceSearchResult = z.infer<typeof CodexExecEvidenceSearchResultSchema>;

export const CodexExecAuditDetailStatusSchema = z.enum(['found', 'not_found']);
export type CodexExecAuditDetailStatus = z.infer<typeof CodexExecAuditDetailStatusSchema>;

export const CodexExecAuditDetailViewSchema = createdEntityBaseSchema
  .merge(codexExecControlPlaneSafetyFlagsSchema)
  .extend({
    status: CodexExecAuditDetailStatusSchema,
    auditEventId: z.string().min(1),
    dryRunId: z.string().min(1).optional(),
    liveRunRecordId: z.string().min(1).optional(),
    action: z.string().min(1).optional(),
    outcome: z.string().min(1).optional(),
    actor: z.string().min(1).optional(),
    eventCreatedAt: IsoDateTimeSchema.optional(),
    policyDecisionId: z.string().min(1).optional(),
    evidenceRefIds: z.array(z.string()).default([]),
    metadataSummary: CodexExecDetailMetadataSummarySchema.optional(),
    metadataOnly: z.literal(true),
    bodyStored: z.literal(false),
  });
export type CodexExecAuditDetailView = z.infer<typeof CodexExecAuditDetailViewSchema>;

export const CodexExecAuditSearchResultSchema = createdEntityBaseSchema
  .merge(codexExecControlPlaneSafetyFlagsSchema)
  .extend({
    query: CodexExecAuditQuerySchema,
    count: z.number().int().nonnegative(),
    items: z.array(CodexExecAuditDetailViewSchema).default([]),
    metadataOnly: z.literal(true),
    bodyStored: z.literal(false),
    summary: z.string().min(1),
  });
export type CodexExecAuditSearchResult = z.infer<typeof CodexExecAuditSearchResultSchema>;

export const CodexExecControlPlaneDrilldownViewSchema = createdEntityBaseSchema
  .merge(codexExecControlPlaneSafetyFlagsSchema)
  .extend({
    dryRunId: z.string().min(1),
    liveRunRecordId: z.string().min(1).optional(),
    status: z.enum(['found', 'not_found']),
    timeline: CodexExecControlPlaneTimelineSchema.optional(),
    timelineDetail: CodexExecTimelineDetailViewSchema.optional(),
    evidenceSearch: CodexExecEvidenceSearchResultSchema,
    auditSearch: CodexExecAuditSearchResultSchema,
    selectedEvidence: CodexExecEvidenceDetailViewSchema.optional(),
    selectedAudit: CodexExecAuditDetailViewSchema.optional(),
    evidenceCount: z.number().int().nonnegative(),
    auditEventCount: z.number().int().nonnegative(),
    metadataOnly: z.literal(true),
    bodyStored: z.literal(false),
    summary: z.string().min(1),
  });
export type CodexExecControlPlaneDrilldownView = z.infer<
  typeof CodexExecControlPlaneDrilldownViewSchema
>;

export const CodexExecControlPlaneReportFormatSchema = z.enum(['json', 'markdown']);
export type CodexExecControlPlaneReportFormat = z.infer<
  typeof CodexExecControlPlaneReportFormatSchema
>;

export const CodexExecControlPlaneReportSectionKindSchema = z.enum([
  'overview',
  'dry_run',
  'timeline',
  'approval',
  'gate',
  'evidence',
  'audit',
  'no_live_boundary',
  'risks',
  'recommendations',
]);
export type CodexExecControlPlaneReportSectionKind = z.infer<
  typeof CodexExecControlPlaneReportSectionKindSchema
>;

export const CodexExecControlPlaneReportStatusSchema = z.enum(['found', 'not_found', 'degraded']);
export type CodexExecControlPlaneReportStatus = z.infer<
  typeof CodexExecControlPlaneReportStatusSchema
>;

export const CodexExecControlPlaneReportQuerySchema = createdEntityBaseSchema
  .merge(codexExecControlPlaneSafetyFlagsSchema)
  .extend({
    dryRunId: z.string().min(1),
    format: CodexExecControlPlaneReportFormatSchema.default('json'),
    includeEvidence: z.boolean().default(true),
    includeAudit: z.boolean().default(true),
  });
export type CodexExecControlPlaneReportQuery = z.infer<
  typeof CodexExecControlPlaneReportQuerySchema
>;

export const CodexExecControlPlaneReportSectionItemSchema = z.object({
  label: z.string().min(1),
  value: z.string().min(1),
  refId: z.string().min(1).optional(),
  hash: z.string().min(1).optional(),
  metadata: MetadataSchema.optional(),
});
export type CodexExecControlPlaneReportSectionItem = z.infer<
  typeof CodexExecControlPlaneReportSectionItemSchema
>;

export const CodexExecControlPlaneReportSectionSchema = createdEntityBaseSchema
  .merge(codexExecControlPlaneSafetyFlagsSchema)
  .extend({
    kind: CodexExecControlPlaneReportSectionKindSchema,
    title: z.string().min(1),
    status: z.enum(['ok', 'missing', 'degraded']),
    summary: z.string().min(1),
    items: z.array(CodexExecControlPlaneReportSectionItemSchema).default([]),
    refIds: z.array(z.string()).default([]),
    hashes: z.array(z.string()).default([]),
    metadataOnly: z.literal(true),
    bodyStored: z.literal(false),
  });
export type CodexExecControlPlaneReportSection = z.infer<
  typeof CodexExecControlPlaneReportSectionSchema
>;

export const CodexExecControlPlaneReportSummarySchema = createdEntityBaseSchema
  .merge(codexExecControlPlaneSafetyFlagsSchema)
  .extend({
    dryRunId: z.string().min(1),
    status: CodexExecControlPlaneReportStatusSchema,
    sectionCount: z.number().int().nonnegative(),
    evidenceCount: z.number().int().nonnegative(),
    auditEventCount: z.number().int().nonnegative(),
    riskLevel: RiskLevelSchema.optional(),
    finalControlPlaneStatus: z.string().min(1),
    recommendationCount: z.number().int().nonnegative(),
    metadataOnly: z.literal(true),
    bodyStored: z.literal(false),
  });
export type CodexExecControlPlaneReportSummary = z.infer<
  typeof CodexExecControlPlaneReportSummarySchema
>;

export const CodexExecControlPlaneReportSchema = createdEntityBaseSchema
  .merge(codexExecControlPlaneSafetyFlagsSchema)
  .extend({
    dryRunId: z.string().min(1),
    status: CodexExecControlPlaneReportStatusSchema,
    format: CodexExecControlPlaneReportFormatSchema,
    query: CodexExecControlPlaneReportQuerySchema,
    summary: CodexExecControlPlaneReportSummarySchema,
    sections: z.array(CodexExecControlPlaneReportSectionSchema),
    sectionOrder: z.array(CodexExecControlPlaneReportSectionKindSchema),
    metadataOnly: z.literal(true),
    bodyStored: z.literal(false),
  });
export type CodexExecControlPlaneReport = z.infer<typeof CodexExecControlPlaneReportSchema>;

export const CodexExecControlPlaneReportExportResultSchema = createdEntityBaseSchema
  .merge(codexExecControlPlaneSafetyFlagsSchema)
  .extend({
    dryRunId: z.string().min(1),
    format: CodexExecControlPlaneReportFormatSchema,
    status: CodexExecControlPlaneReportStatusSchema,
    report: CodexExecControlPlaneReportSchema,
    renderedContent: z.string().min(1),
    renderedContentHash: z.string().min(1),
    renderedContentLength: z.number().int().nonnegative(),
    metadataOnly: z.literal(true),
    sourceBodyStored: z.literal(false),
  });
export type CodexExecControlPlaneReportExportResult = z.infer<
  typeof CodexExecControlPlaneReportExportResultSchema
>;

export const CodexExecReportReviewStatusSchema = z.enum([
  'draft',
  'reviewed',
  'changes_requested',
  'rejected',
  'archived',
]);
export type CodexExecReportReviewStatus = z.infer<typeof CodexExecReportReviewStatusSchema>;

export const CodexExecReportRiskClassificationSchema = z.enum([
  'low',
  'medium',
  'high',
  'critical',
]);
export type CodexExecReportRiskClassification = z.infer<
  typeof CodexExecReportRiskClassificationSchema
>;

export const CodexExecReportRecommendationSchema = z.enum([
  'no_go',
  'needs_changes',
  'ready_for_adr',
  'ready_for_read_only_live_review',
]);
export type CodexExecReportRecommendation = z.infer<typeof CodexExecReportRecommendationSchema>;

export const CodexExecReportReviewChecklistItemSchema = createdEntityBaseSchema
  .merge(codexExecControlPlaneSafetyFlagsSchema)
  .extend({
    code: z.string().min(1),
    label: z.string().min(1),
    status: z.enum(['passed', 'failed', 'warning']),
    required: z.boolean().default(true),
    summary: z.string().min(1),
    relatedSection: CodexExecControlPlaneReportSectionKindSchema.optional(),
    metadataOnly: z.literal(true),
    bodyStored: z.literal(false),
  });
export type CodexExecReportReviewChecklistItem = z.infer<
  typeof CodexExecReportReviewChecklistItemSchema
>;

export const CodexExecReportReviewFindingSchema = createdEntityBaseSchema
  .merge(codexExecControlPlaneSafetyFlagsSchema)
  .extend({
    severity: CodexExecReportRiskClassificationSchema,
    code: z.string().min(1),
    summary: z.string().min(1),
    relatedSection: CodexExecControlPlaneReportSectionKindSchema.optional(),
    recommendation: z.string().min(1),
    metadataOnly: z.literal(true),
    bodyStored: z.literal(false),
  });
export type CodexExecReportReviewFinding = z.infer<typeof CodexExecReportReviewFindingSchema>;

export const CodexExecReportReviewRecordSchema = createdEntityBaseSchema
  .merge(codexExecControlPlaneSafetyFlagsSchema)
  .extend({
    dryRunId: z.string().min(1),
    reportId: z.string().min(1).optional(),
    reportHash: z.string().min(1),
    reportSectionHashes: z.array(z.string().min(1)).default([]),
    sectionSummaryRefs: z.array(z.string().min(1)).default([]),
    reviewedAt: IsoDateTimeSchema,
    reviewerLabel: z.string().min(1),
    status: CodexExecReportReviewStatusSchema,
    recommendation: CodexExecReportRecommendationSchema,
    recommendationGrantsExecution: z.literal(false),
    riskClassification: CodexExecReportRiskClassificationSchema,
    checklistItems: z.array(CodexExecReportReviewChecklistItemSchema).default([]),
    findings: z.array(CodexExecReportReviewFindingSchema).default([]),
    notesSummary: z.string().min(1).optional(),
    reportSummary: CodexExecControlPlaneReportSummarySchema.optional(),
    metadataOnly: z.literal(true),
    bodyStored: z.literal(false),
  });
export type CodexExecReportReviewRecord = z.infer<typeof CodexExecReportReviewRecordSchema>;

export const CodexExecReportReviewQuerySchema = createdEntityBaseSchema
  .merge(codexExecControlPlaneSafetyFlagsSchema)
  .extend({
    dryRunId: z.string().min(1).optional(),
    status: CodexExecReportReviewStatusSchema.optional(),
    recommendation: CodexExecReportRecommendationSchema.optional(),
    limit: z.number().int().positive().max(200).default(20),
  });
export type CodexExecReportReviewQuery = z.infer<typeof CodexExecReportReviewQuerySchema>;

export const CodexExecReportReviewSummarySchema = createdEntityBaseSchema
  .merge(codexExecControlPlaneSafetyFlagsSchema)
  .extend({
    reviewId: z.string().min(1),
    dryRunId: z.string().min(1),
    reportHash: z.string().min(1),
    status: CodexExecReportReviewStatusSchema,
    recommendation: CodexExecReportRecommendationSchema,
    recommendationGrantsExecution: z.literal(false),
    riskClassification: CodexExecReportRiskClassificationSchema,
    reviewerLabel: z.string().min(1),
    reviewedAt: IsoDateTimeSchema,
    findingCount: z.number().int().nonnegative(),
    failedChecklistCount: z.number().int().nonnegative(),
    metadataOnly: z.literal(true),
    bodyStored: z.literal(false),
  });
export type CodexExecReportReviewSummary = z.infer<typeof CodexExecReportReviewSummarySchema>;

export const CodexExecReportReviewHistoryQuerySchema = createdEntityBaseSchema
  .merge(codexExecControlPlaneSafetyFlagsSchema)
  .extend({
    dryRunId: z.string().min(1).optional(),
    status: CodexExecReportReviewStatusSchema.optional(),
    recommendation: CodexExecReportRecommendationSchema.optional(),
    limit: z.number().int().positive().max(200).default(20),
    recommendationGrantsExecution: z.literal(false),
    metadataOnly: z.literal(true),
    bodyStored: z.literal(false),
  });
export type CodexExecReportReviewHistoryQuery = z.infer<
  typeof CodexExecReportReviewHistoryQuerySchema
>;

export const CodexExecReportReviewComparisonItemSchema = createdEntityBaseSchema
  .merge(codexExecControlPlaneSafetyFlagsSchema)
  .extend({
    field: z.string().min(1),
    leftValueSummary: z.string().min(1),
    rightValueSummary: z.string().min(1),
    changed: z.boolean(),
    metadataOnly: z.literal(true),
    bodyStored: z.literal(false),
  });
export type CodexExecReportReviewComparisonItem = z.infer<
  typeof CodexExecReportReviewComparisonItemSchema
>;

export const CodexExecReportReviewComparisonSchema = createdEntityBaseSchema
  .merge(codexExecControlPlaneSafetyFlagsSchema)
  .extend({
    leftReviewId: z.string().min(1),
    rightReviewId: z.string().min(1),
    dryRunId: z.string().min(1).optional(),
    comparable: z.boolean(),
    summary: z.string().min(1),
    changedItemCount: z.number().int().nonnegative(),
    items: z.array(CodexExecReportReviewComparisonItemSchema).default([]),
    recommendationGrantsExecution: z.literal(false),
    metadataOnly: z.literal(true),
    bodyStored: z.literal(false),
  });
export type CodexExecReportReviewComparison = z.infer<typeof CodexExecReportReviewComparisonSchema>;

export const CodexExecReportReviewHistoryViewSchema = createdEntityBaseSchema
  .merge(codexExecControlPlaneSafetyFlagsSchema)
  .extend({
    dryRunId: z.string().min(1).optional(),
    query: CodexExecReportReviewHistoryQuerySchema,
    latestReview: CodexExecReportReviewSummarySchema.optional(),
    summaries: z.array(CodexExecReportReviewSummarySchema).default([]),
    comparison: CodexExecReportReviewComparisonSchema.optional(),
    historyCount: z.number().int().nonnegative(),
    recommendationGrantsExecution: z.literal(false),
    metadataOnly: z.literal(true),
    bodyStored: z.literal(false),
  });
export type CodexExecReportReviewHistoryView = z.infer<
  typeof CodexExecReportReviewHistoryViewSchema
>;

export const CodexExecReviewerHandoffSummarySchema = createdEntityBaseSchema
  .merge(codexExecControlPlaneSafetyFlagsSchema)
  .extend({
    dryRunId: z.string().min(1),
    fromReviewer: z.string().min(1).optional(),
    toReviewer: z.string().min(1).optional(),
    latestReviewId: z.string().min(1).optional(),
    latestStatus: CodexExecReportReviewStatusSchema.optional(),
    latestRecommendation: CodexExecReportRecommendationSchema.optional(),
    latestRiskClassification: CodexExecReportRiskClassificationSchema.optional(),
    reviewCount: z.number().int().nonnegative(),
    findingCount: z.number().int().nonnegative(),
    failedChecklistCount: z.number().int().nonnegative(),
    handoffSummary: z.string().min(1),
    recommendedNextStep: z.string().min(1),
    recommendationGrantsExecution: z.literal(false),
    metadataOnly: z.literal(true),
    bodyStored: z.literal(false),
  });
export type CodexExecReviewerHandoffSummary = z.infer<typeof CodexExecReviewerHandoffSummarySchema>;

export const CodexExecGovernanceReviewPackageSectionSchema = z.enum([
  'dry_run',
  'timeline',
  'evidence',
  'audit',
  'report',
  'report_review',
  'review_history',
  'handoff',
  'no_live_boundary',
  'adr_readiness',
  'risks',
  'blockers',
  'recommendation',
]);
export type CodexExecGovernanceReviewPackageSection = z.infer<
  typeof CodexExecGovernanceReviewPackageSectionSchema
>;

export const CodexExecGovernanceReviewPackageStatusSchema = z.enum([
  'found',
  'not_found',
  'degraded',
  'blocked',
  'ready_for_adr',
  'needs_changes',
  'no_go',
]);
export type CodexExecGovernanceReviewPackageStatus = z.infer<
  typeof CodexExecGovernanceReviewPackageStatusSchema
>;

export const CodexExecGovernanceReviewPackageQuerySchema = createdEntityBaseSchema
  .merge(codexExecControlPlaneSafetyFlagsSchema)
  .extend({
    dryRunId: z.string().min(1),
    includeEvidence: z.boolean().default(true),
    includeAudit: z.boolean().default(true),
    recommendationGrantsExecution: z.literal(false),
    metadataOnly: z.literal(true),
    bodyStored: z.literal(false),
  });
export type CodexExecGovernanceReviewPackageQuery = z.infer<
  typeof CodexExecGovernanceReviewPackageQuerySchema
>;

export const CodexExecAdrReadinessChecklistItemSchema = createdEntityBaseSchema
  .merge(codexExecControlPlaneSafetyFlagsSchema)
  .extend({
    code: z.string().min(1),
    label: z.string().min(1),
    status: z.enum(['passed', 'failed', 'warning']),
    required: z.boolean().default(true),
    summary: z.string().min(1),
    sourceSection: CodexExecGovernanceReviewPackageSectionSchema.optional(),
    recommendationGrantsExecution: z.literal(false),
    metadataOnly: z.literal(true),
    bodyStored: z.literal(false),
  });
export type CodexExecAdrReadinessChecklistItem = z.infer<
  typeof CodexExecAdrReadinessChecklistItemSchema
>;

export const CodexExecNoLiveEvidenceSummarySchema = createdEntityBaseSchema
  .merge(codexExecControlPlaneSafetyFlagsSchema)
  .extend({
    dryRunId: z.string().min(1),
    noRealCodexExec: z.literal(true),
    noExternalProcessStarted: z.literal(true),
    noBrowserOrCdpAction: z.literal(true),
    noWorkspaceWrite: z.literal(true),
    noExecutionApprovalGranted: z.literal(true),
    evidenceRefCount: z.number().int().nonnegative(),
    auditEventCount: z.number().int().nonnegative(),
    evidenceKinds: z.array(z.string()).default([]),
    auditActions: z.array(z.string()).default([]),
    summary: z.string().min(1),
    recommendationGrantsExecution: z.literal(false),
    metadataOnly: z.literal(true),
    bodyStored: z.literal(false),
  });
export type CodexExecNoLiveEvidenceSummary = z.infer<typeof CodexExecNoLiveEvidenceSummarySchema>;

export const CodexExecGovernanceBlockerSchema = createdEntityBaseSchema
  .merge(codexExecControlPlaneSafetyFlagsSchema)
  .extend({
    severity: CodexExecReportRiskClassificationSchema,
    code: z.string().min(1),
    summary: z.string().min(1),
    sourceSection: CodexExecGovernanceReviewPackageSectionSchema.optional(),
    recommendedResolution: z.string().min(1),
    recommendationGrantsExecution: z.literal(false),
    metadataOnly: z.literal(true),
    bodyStored: z.literal(false),
  });
export type CodexExecGovernanceBlocker = z.infer<typeof CodexExecGovernanceBlockerSchema>;

export const CodexExecGovernanceReviewPackageSummarySchema = createdEntityBaseSchema
  .merge(codexExecControlPlaneSafetyFlagsSchema)
  .extend({
    dryRunId: z.string().min(1),
    status: CodexExecGovernanceReviewPackageStatusSchema,
    riskClassification: CodexExecReportRiskClassificationSchema,
    recommendation: CodexExecReportRecommendationSchema,
    recommendationGrantsExecution: z.literal(false),
    checklistPassedCount: z.number().int().nonnegative(),
    checklistWarningCount: z.number().int().nonnegative(),
    checklistFailedCount: z.number().int().nonnegative(),
    blockerCount: z.number().int().nonnegative(),
    unresolvedBlockerCount: z.number().int().nonnegative(),
    evidenceRefCount: z.number().int().nonnegative(),
    auditEventCount: z.number().int().nonnegative(),
    latestReviewId: z.string().min(1).optional(),
    reportId: z.string().min(1).optional(),
    handoffId: z.string().min(1).optional(),
    metadataOnly: z.literal(true),
    bodyStored: z.literal(false),
  });
export type CodexExecGovernanceReviewPackageSummary = z.infer<
  typeof CodexExecGovernanceReviewPackageSummarySchema
>;

export const CodexExecGovernanceReviewPackageSchema = createdEntityBaseSchema
  .merge(codexExecControlPlaneSafetyFlagsSchema)
  .extend({
    dryRunId: z.string().min(1),
    status: CodexExecGovernanceReviewPackageStatusSchema,
    query: CodexExecGovernanceReviewPackageQuerySchema,
    summary: CodexExecGovernanceReviewPackageSummarySchema,
    sectionOrder: z.array(CodexExecGovernanceReviewPackageSectionSchema),
    report: CodexExecControlPlaneReportSchema.optional(),
    reviewHistory: CodexExecReportReviewHistoryViewSchema,
    latestReview: CodexExecReportReviewSummarySchema.optional(),
    handoff: CodexExecReviewerHandoffSummarySchema,
    noLiveEvidence: CodexExecNoLiveEvidenceSummarySchema,
    adrReadinessChecklist: z.array(CodexExecAdrReadinessChecklistItemSchema).default([]),
    blockers: z.array(CodexExecGovernanceBlockerSchema).default([]),
    riskClassification: CodexExecReportRiskClassificationSchema,
    recommendation: CodexExecReportRecommendationSchema,
    recommendationGrantsExecution: z.literal(false),
    metadataOnly: z.literal(true),
    bodyStored: z.literal(false),
  });
export type CodexExecGovernanceReviewPackage = z.infer<
  typeof CodexExecGovernanceReviewPackageSchema
>;

export const CodexExecLiveAdapterAdrDraftFormatSchema = z.enum(['json', 'markdown']);
export type CodexExecLiveAdapterAdrDraftFormat = z.infer<
  typeof CodexExecLiveAdapterAdrDraftFormatSchema
>;

export const CodexExecLiveAdapterAdrDraftStatusSchema = z.enum([
  'found',
  'not_found',
  'degraded',
  'blocked',
  'ready_for_review',
]);
export type CodexExecLiveAdapterAdrDraftStatus = z.infer<
  typeof CodexExecLiveAdapterAdrDraftStatusSchema
>;

export const CodexExecLiveAdapterAdrDraftSectionKindSchema = z.enum([
  'title',
  'status',
  'context',
  'governance_summary',
  'no_live_boundary',
  'adr_readiness',
  'risk_assessment',
  'unresolved_blockers',
  'decision_options',
  'recommended_decision',
  'consequences',
  'next_review_steps',
]);
export type CodexExecLiveAdapterAdrDraftSectionKind = z.infer<
  typeof CodexExecLiveAdapterAdrDraftSectionKindSchema
>;

export const CodexExecLiveAdapterAdrDraftQuerySchema = createdEntityBaseSchema
  .merge(codexExecControlPlaneSafetyFlagsSchema)
  .extend({
    dryRunId: z.string().min(1),
    format: CodexExecLiveAdapterAdrDraftFormatSchema.default('json'),
    includeEvidence: z.boolean().default(true),
    includeAudit: z.boolean().default(true),
    recommendationGrantsExecution: z.literal(false),
    metadataOnly: z.literal(true),
    bodyStored: z.literal(false),
    draftOnly: z.literal(true),
  });
export type CodexExecLiveAdapterAdrDraftQuery = z.infer<
  typeof CodexExecLiveAdapterAdrDraftQuerySchema
>;

export const CodexExecLiveAdapterAdrDraftSectionSchema = createdEntityBaseSchema
  .merge(codexExecControlPlaneSafetyFlagsSchema)
  .extend({
    kind: CodexExecLiveAdapterAdrDraftSectionKindSchema,
    title: z.string().min(1),
    status: z.enum(['ok', 'missing', 'blocked', 'degraded']),
    summary: z.string().min(1),
    items: z.array(CodexExecControlPlaneReportSectionItemSchema).default([]),
    refIds: z.array(z.string()).default([]),
    hashes: z.array(z.string()).default([]),
    recommendationGrantsExecution: z.literal(false),
    metadataOnly: z.literal(true),
    bodyStored: z.literal(false),
    draftOnly: z.literal(true),
  });
export type CodexExecLiveAdapterAdrDraftSection = z.infer<
  typeof CodexExecLiveAdapterAdrDraftSectionSchema
>;

export const CodexExecLiveAdapterAdrDraftSummarySchema = createdEntityBaseSchema
  .merge(codexExecControlPlaneSafetyFlagsSchema)
  .extend({
    dryRunId: z.string().min(1),
    status: CodexExecLiveAdapterAdrDraftStatusSchema,
    title: z.string().min(1),
    sectionCount: z.number().int().nonnegative(),
    governancePackageStatus: CodexExecGovernanceReviewPackageStatusSchema,
    riskClassification: CodexExecReportRiskClassificationSchema,
    recommendation: CodexExecReportRecommendationSchema,
    recommendationGrantsExecution: z.literal(false),
    blockerCount: z.number().int().nonnegative(),
    readinessPassedCount: z.number().int().nonnegative(),
    readinessFailedCount: z.number().int().nonnegative(),
    metadataOnly: z.literal(true),
    bodyStored: z.literal(false),
    draftOnly: z.literal(true),
  });
export type CodexExecLiveAdapterAdrDraftSummary = z.infer<
  typeof CodexExecLiveAdapterAdrDraftSummarySchema
>;

export const CodexExecLiveAdapterAdrDraftSchema = createdEntityBaseSchema
  .merge(codexExecControlPlaneSafetyFlagsSchema)
  .extend({
    dryRunId: z.string().min(1),
    status: CodexExecLiveAdapterAdrDraftStatusSchema,
    format: CodexExecLiveAdapterAdrDraftFormatSchema,
    query: CodexExecLiveAdapterAdrDraftQuerySchema,
    title: z.string().min(1),
    summary: CodexExecLiveAdapterAdrDraftSummarySchema,
    governancePackageSummary: CodexExecGovernanceReviewPackageSummarySchema,
    governancePackage: CodexExecGovernanceReviewPackageSchema.optional(),
    sections: z.array(CodexExecLiveAdapterAdrDraftSectionSchema),
    sectionOrder: z.array(CodexExecLiveAdapterAdrDraftSectionKindSchema),
    recommendation: CodexExecReportRecommendationSchema,
    recommendationGrantsExecution: z.literal(false),
    metadataOnly: z.literal(true),
    bodyStored: z.literal(false),
    draftOnly: z.literal(true),
  });
export type CodexExecLiveAdapterAdrDraft = z.infer<typeof CodexExecLiveAdapterAdrDraftSchema>;

export const CodexExecLiveAdapterAdrDraftExportResultSchema = createdEntityBaseSchema
  .merge(codexExecControlPlaneSafetyFlagsSchema)
  .extend({
    dryRunId: z.string().min(1),
    format: CodexExecLiveAdapterAdrDraftFormatSchema,
    status: CodexExecLiveAdapterAdrDraftStatusSchema,
    draft: CodexExecLiveAdapterAdrDraftSchema,
    renderedContent: z.string().min(1),
    renderedContentHash: z.string().min(1),
    renderedContentLength: z.number().int().nonnegative(),
    recommendationGrantsExecution: z.literal(false),
    metadataOnly: z.literal(true),
    bodyStored: z.literal(false),
    sourceBodyStored: z.literal(false),
    draftOnly: z.literal(true),
  });
export type CodexExecLiveAdapterAdrDraftExportResult = z.infer<
  typeof CodexExecLiveAdapterAdrDraftExportResultSchema
>;

export const CodexExecLiveAdapterAdrDecisionOutcomeSchema = z.enum([
  'no_go',
  'conditional_read_only_go',
]);
export type CodexExecLiveAdapterAdrDecisionOutcome = z.infer<
  typeof CodexExecLiveAdapterAdrDecisionOutcomeSchema
>;

export const CodexExecLiveAdapterAdrDecisionStatusSchema = z.enum([
  'draft',
  'recorded',
  'superseded',
]);
export type CodexExecLiveAdapterAdrDecisionStatus = z.infer<
  typeof CodexExecLiveAdapterAdrDecisionStatusSchema
>;

export const CodexExecLiveAdapterAdrDecisionGatePolicySchema = createdEntityBaseSchema
  .merge(codexExecControlPlaneSafetyFlagsSchema)
  .extend({
    allowedSandboxModes: z.array(CodexExecSandboxModeSchema),
    forbiddenSandboxModes: z.array(CodexExecSandboxModeSchema),
    triggerSurface: z.literal('cli_only'),
    dashboardTriggerAllowed: z.literal(false),
    dryRunRequired: z.literal(true),
    approvalArtifactRequired: z.literal(true),
    dryRunPlanHashMatchRequired: z.literal(true),
    policyDecisionHashMatchRequired: z.literal(true),
    isolatedWorktreeRequired: z.literal(true),
    postRunVerificationCommand: z.literal('pnpm verify:foundation'),
    evidenceRequired: z.literal(true),
    auditRequired: z.literal(true),
    implementationApproved: z.literal(false),
    processAdapterApproved: z.literal(false),
    recommendationGrantsExecution: z.literal(false),
    metadataOnly: z.literal(true),
    bodyStored: z.literal(false),
  });
export type CodexExecLiveAdapterAdrDecisionGatePolicy = z.infer<
  typeof CodexExecLiveAdapterAdrDecisionGatePolicySchema
>;

export const CodexExecLiveAdapterAdrDecisionRecordSchema = createdEntityBaseSchema
  .merge(codexExecControlPlaneSafetyFlagsSchema)
  .extend({
    dryRunId: z.string().min(1),
    adrDocumentPath: z.string().min(1),
    decisionDocumentPath: z.string().min(1),
    decision: CodexExecLiveAdapterAdrDecisionOutcomeSchema,
    status: CodexExecLiveAdapterAdrDecisionStatusSchema,
    reviewerLabel: z.string().min(1),
    rationaleSummary: z.string().min(1),
    recordedAt: IsoDateTimeSchema,
    gatePolicy: CodexExecLiveAdapterAdrDecisionGatePolicySchema,
    allowedSandboxModes: z.array(CodexExecSandboxModeSchema),
    forbiddenSandboxModes: z.array(CodexExecSandboxModeSchema),
    futureTriggerPolicy: z.literal('cli_only'),
    dashboardTriggerAllowed: z.literal(false),
    dryRunRequired: z.literal(true),
    approvalArtifactRequired: z.literal(true),
    dryRunPlanHashMatchRequired: z.literal(true),
    policyDecisionHashMatchRequired: z.literal(true),
    isolatedWorktreeRequired: z.literal(true),
    postRunVerificationCommand: z.literal('pnpm verify:foundation'),
    evidenceRequired: z.literal(true),
    auditRequired: z.literal(true),
    implementationApproved: z.literal(false),
    processAdapterApproved: z.literal(false),
    recommendationGrantsExecution: z.literal(false),
    evidenceRefs: z.array(EvidenceRefSchema).default([]),
    auditEventIds: z.array(z.string().min(1)).default([]),
    metadataOnly: z.literal(true),
    bodyStored: z.literal(false),
  });
export type CodexExecLiveAdapterAdrDecisionRecord = z.infer<
  typeof CodexExecLiveAdapterAdrDecisionRecordSchema
>;

export const CodexExecLiveAdapterAdrDecisionSummarySchema = createdEntityBaseSchema
  .merge(codexExecControlPlaneSafetyFlagsSchema)
  .extend({
    decisionId: z.string().min(1),
    dryRunId: z.string().min(1),
    decision: CodexExecLiveAdapterAdrDecisionOutcomeSchema,
    status: CodexExecLiveAdapterAdrDecisionStatusSchema,
    reviewerLabel: z.string().min(1),
    rationaleSummary: z.string().min(1),
    allowedSandboxModes: z.array(CodexExecSandboxModeSchema),
    forbiddenSandboxModes: z.array(CodexExecSandboxModeSchema),
    futureTriggerPolicy: z.literal('cli_only'),
    dashboardTriggerAllowed: z.literal(false),
    approvalArtifactRequired: z.literal(true),
    dryRunPlanHashMatchRequired: z.literal(true),
    policyDecisionHashMatchRequired: z.literal(true),
    isolatedWorktreeRequired: z.literal(true),
    postRunVerificationCommand: z.literal('pnpm verify:foundation'),
    evidenceCount: z.number().int().nonnegative(),
    auditEventCount: z.number().int().nonnegative(),
    implementationApproved: z.literal(false),
    processAdapterApproved: z.literal(false),
    recommendationGrantsExecution: z.literal(false),
    metadataOnly: z.literal(true),
    bodyStored: z.literal(false),
  });
export type CodexExecLiveAdapterAdrDecisionSummary = z.infer<
  typeof CodexExecLiveAdapterAdrDecisionSummarySchema
>;

export const CodexExecLiveAdapterAdrDecisionQuerySchema = createdEntityBaseSchema
  .merge(codexExecControlPlaneSafetyFlagsSchema)
  .extend({
    dryRunId: z.string().min(1).optional(),
    status: CodexExecLiveAdapterAdrDecisionStatusSchema.optional(),
    decision: CodexExecLiveAdapterAdrDecisionOutcomeSchema.optional(),
    limit: z.number().int().positive().max(200).default(20),
    implementationApproved: z.literal(false),
    processAdapterApproved: z.literal(false),
    recommendationGrantsExecution: z.literal(false),
    dashboardTriggerAllowed: z.literal(false),
    metadataOnly: z.literal(true),
    bodyStored: z.literal(false),
  });
export type CodexExecLiveAdapterAdrDecisionQuery = z.infer<
  typeof CodexExecLiveAdapterAdrDecisionQuerySchema
>;

export const CodexExecReadOnlyAdapterPreflightSimulationStatusSchema = z.enum([
  'passed',
  'failed',
  'requires_review',
  'blocked',
]);
export type CodexExecReadOnlyAdapterPreflightSimulationStatus = z.infer<
  typeof CodexExecReadOnlyAdapterPreflightSimulationStatusSchema
>;

export const CodexExecReadOnlyAdapterPreflightSimulationCheckSourceSchema = z.enum([
  'config',
  'sandbox',
  'dry_run',
  'policy',
  'approval',
  'hash',
  'worktree',
  'evidence',
  'audit',
  'operator',
  'dashboard',
  'adr_decision',
]);
export type CodexExecReadOnlyAdapterPreflightSimulationCheckSource = z.infer<
  typeof CodexExecReadOnlyAdapterPreflightSimulationCheckSourceSchema
>;

export const CodexExecReadOnlyAdapterPreflightSimulationCheckSchema = createdEntityBaseSchema
  .merge(codexExecReadOnlyAdapterSafetyFlagsSchema)
  .extend({
    code: z.string().min(1),
    source: CodexExecReadOnlyAdapterPreflightSimulationCheckSourceSchema,
    status: z.enum(['passed', 'failed', 'warning']),
    required: z.boolean(),
    summary: z.string().min(1),
    metadataOnly: z.literal(true),
    bodyStored: z.literal(false),
  });
export type CodexExecReadOnlyAdapterPreflightSimulationCheck = z.infer<
  typeof CodexExecReadOnlyAdapterPreflightSimulationCheckSchema
>;

export const CodexExecReadOnlyAdapterPreflightSimulationBlockerSchema = createdEntityBaseSchema
  .merge(codexExecReadOnlyAdapterSafetyFlagsSchema)
  .extend({
    code: z.string().min(1),
    source: CodexExecReadOnlyAdapterPreflightSimulationCheckSourceSchema,
    severity: RiskLevelSchema,
    relatedCheckCode: z.string().min(1).optional(),
    summary: z.string().min(1),
    metadataOnly: z.literal(true),
    bodyStored: z.literal(false),
  });
export type CodexExecReadOnlyAdapterPreflightSimulationBlocker = z.infer<
  typeof CodexExecReadOnlyAdapterPreflightSimulationBlockerSchema
>;

export const CodexExecReadOnlyAdapterOperatorChecklistItemSchema = createdEntityBaseSchema
  .merge(codexExecReadOnlyAdapterSafetyFlagsSchema)
  .extend({
    code: z.string().min(1),
    label: z.string().min(1),
    summary: z.string().min(1),
    checked: z.boolean().default(false),
    required: z.boolean().default(true),
    metadataOnly: z.literal(true),
    bodyStored: z.literal(false),
  });
export type CodexExecReadOnlyAdapterOperatorChecklistItem = z.infer<
  typeof CodexExecReadOnlyAdapterOperatorChecklistItemSchema
>;

export const CodexExecReadOnlyAdapterPreflightSimulationInputSchema = createdEntityBaseSchema
  .merge(codexExecReadOnlyAdapterSafetyFlagsSchema)
  .extend({
    dryRunId: z.string().min(1),
    requestedSandboxMode: CodexExecSandboxModeSchema.default('read_only'),
    isolatedWorktreePresent: z.boolean().default(false),
    evidenceStoreReady: z.boolean().default(false),
    auditStoreReady: z.boolean().default(false),
    dashboardTriggerAttempted: z.boolean().default(false),
    processAdapterAttempted: z.boolean().default(false),
    workspaceWriteRequested: z.boolean().default(false),
    dangerFullAccessRequested: z.boolean().default(false),
    operatorChecklist: z.array(CodexExecReadOnlyAdapterOperatorChecklistItemSchema).default([]),
    metadataOnly: z.literal(true),
    bodyStored: z.literal(false),
  });
export type CodexExecReadOnlyAdapterPreflightSimulationInput = z.infer<
  typeof CodexExecReadOnlyAdapterPreflightSimulationInputSchema
>;

export const CodexExecReadOnlyAdapterPreflightSimulationResultSchema = createdEntityBaseSchema
  .merge(codexExecReadOnlyAdapterSafetyFlagsSchema)
  .extend({
    dryRunId: z.string().min(1),
    status: CodexExecReadOnlyAdapterPreflightSimulationStatusSchema,
    requestedSandboxMode: CodexExecSandboxModeSchema,
    checks: z.array(CodexExecReadOnlyAdapterPreflightSimulationCheckSchema),
    blockers: z.array(CodexExecReadOnlyAdapterPreflightSimulationBlockerSchema),
    operatorChecklist: z.array(CodexExecReadOnlyAdapterOperatorChecklistItemSchema),
    configLiveEnabled: z.boolean(),
    dryRunExists: z.boolean(),
    policyDecisionExists: z.boolean(),
    approvalArtifactExists: z.boolean(),
    approvalArtifactValid: z.boolean(),
    dryRunPlanHashMatched: z.boolean(),
    policyDecisionHashMatched: z.boolean(),
    isolatedWorktreePresent: z.boolean(),
    evidenceStoreReady: z.boolean(),
    auditStoreReady: z.boolean(),
    checklistComplete: z.boolean(),
    adrDecisionDesignOnly: z.boolean(),
    passedCheckCount: z.number().int().nonnegative(),
    failedCheckCount: z.number().int().nonnegative(),
    warningCheckCount: z.number().int().nonnegative(),
    blockerCount: z.number().int().nonnegative(),
    summary: z.string().min(1),
    recommendationGrantsExecution: z.literal(false),
    metadataOnly: z.literal(true),
    bodyStored: z.literal(false),
  });
export type CodexExecReadOnlyAdapterPreflightSimulationResult = z.infer<
  typeof CodexExecReadOnlyAdapterPreflightSimulationResultSchema
>;

export const CodexExecReadOnlyAdapterPreflightSimulationSummarySchema = createdEntityBaseSchema
  .merge(codexExecReadOnlyAdapterSafetyFlagsSchema)
  .extend({
    simulationId: z.string().min(1),
    dryRunId: z.string().min(1),
    status: CodexExecReadOnlyAdapterPreflightSimulationStatusSchema,
    requestedSandboxMode: CodexExecSandboxModeSchema,
    passedCheckCount: z.number().int().nonnegative(),
    failedCheckCount: z.number().int().nonnegative(),
    warningCheckCount: z.number().int().nonnegative(),
    blockerCount: z.number().int().nonnegative(),
    checklistCompletedCount: z.number().int().nonnegative(),
    checklistTotalCount: z.number().int().nonnegative(),
    summary: z.string().min(1),
    recommendationGrantsExecution: z.literal(false),
    metadataOnly: z.literal(true),
    bodyStored: z.literal(false),
  });
export type CodexExecReadOnlyAdapterPreflightSimulationSummary = z.infer<
  typeof CodexExecReadOnlyAdapterPreflightSimulationSummarySchema
>;

export const CodexExecReadOnlyAdapterSimulatorReviewOutcomeSchema = z.enum([
  'no_go',
  'go_to_implementation_planning',
]);
export type CodexExecReadOnlyAdapterSimulatorReviewOutcome = z.infer<
  typeof CodexExecReadOnlyAdapterSimulatorReviewOutcomeSchema
>;

export const CodexExecReadOnlyAdapterSimulatorReviewStatusSchema = z.enum([
  'draft',
  'recorded',
  'superseded',
]);
export type CodexExecReadOnlyAdapterSimulatorReviewStatus = z.infer<
  typeof CodexExecReadOnlyAdapterSimulatorReviewStatusSchema
>;

export const CodexExecReadOnlyAdapterGateDispositionSchema = z.enum([
  'hard_gate',
  'requires_review',
  'informational',
]);
export type CodexExecReadOnlyAdapterGateDisposition = z.infer<
  typeof CodexExecReadOnlyAdapterGateDispositionSchema
>;

export const CodexExecReadOnlyAdapterSimulatorReviewChecklistItemSchema = createdEntityBaseSchema
  .merge(codexExecReadOnlyAdapterSafetyFlagsSchema)
  .extend({
    code: z.string().min(1),
    label: z.string().min(1),
    checkCode: z.string().min(1).optional(),
    disposition: CodexExecReadOnlyAdapterGateDispositionSchema,
    status: z.enum(['passed', 'failed', 'requires_review']),
    required: z.boolean(),
    summary: z.string().min(1),
    processAdapterApproved: z.literal(false),
    recommendationGrantsExecution: z.literal(false),
    metadataOnly: z.literal(true),
    bodyStored: z.literal(false),
  });
export type CodexExecReadOnlyAdapterSimulatorReviewChecklistItem = z.infer<
  typeof CodexExecReadOnlyAdapterSimulatorReviewChecklistItemSchema
>;

export const CodexExecReadOnlyAdapterSimulatorReviewFindingSchema = createdEntityBaseSchema
  .merge(codexExecReadOnlyAdapterSafetyFlagsSchema)
  .extend({
    code: z.string().min(1),
    severity: RiskLevelSchema,
    relatedCheckCode: z.string().min(1).optional(),
    disposition: CodexExecReadOnlyAdapterGateDispositionSchema,
    summary: z.string().min(1),
    recommendation: z.string().min(1),
    processAdapterApproved: z.literal(false),
    recommendationGrantsExecution: z.literal(false),
    metadataOnly: z.literal(true),
    bodyStored: z.literal(false),
  });
export type CodexExecReadOnlyAdapterSimulatorReviewFinding = z.infer<
  typeof CodexExecReadOnlyAdapterSimulatorReviewFindingSchema
>;

export const CodexExecReadOnlyAdapterSimulatorReviewDecisionRecordSchema = createdEntityBaseSchema
  .merge(codexExecReadOnlyAdapterSafetyFlagsSchema)
  .extend({
    dryRunId: z.string().min(1),
    simulationId: z.string().min(1),
    simulationStatus: CodexExecReadOnlyAdapterPreflightSimulationStatusSchema,
    outcome: CodexExecReadOnlyAdapterSimulatorReviewOutcomeSchema,
    status: CodexExecReadOnlyAdapterSimulatorReviewStatusSchema,
    reviewerLabel: z.string().min(1),
    rationaleSummary: z.string().min(1),
    reviewedAt: IsoDateTimeSchema,
    checklistItems: z.array(CodexExecReadOnlyAdapterSimulatorReviewChecklistItemSchema),
    findings: z.array(CodexExecReadOnlyAdapterSimulatorReviewFindingSchema),
    simulatorBlockers: z.array(CodexExecReadOnlyAdapterPreflightSimulationBlockerSchema),
    hardGateCount: z.number().int().nonnegative(),
    requiresReviewCount: z.number().int().nonnegative(),
    informationalCount: z.number().int().nonnegative(),
    unresolvedBlockerCount: z.number().int().nonnegative(),
    evidenceRefs: z.array(EvidenceRefSchema).default([]),
    auditEventIds: z.array(z.string().min(1)).default([]),
    processAdapterApproved: z.literal(false),
    recommendationGrantsExecution: z.literal(false),
    metadataOnly: z.literal(true),
    bodyStored: z.literal(false),
  });
export type CodexExecReadOnlyAdapterSimulatorReviewDecisionRecord = z.infer<
  typeof CodexExecReadOnlyAdapterSimulatorReviewDecisionRecordSchema
>;

export const CodexExecReadOnlyAdapterSimulatorReviewSummarySchema = createdEntityBaseSchema
  .merge(codexExecReadOnlyAdapterSafetyFlagsSchema)
  .extend({
    reviewId: z.string().min(1),
    dryRunId: z.string().min(1),
    simulationId: z.string().min(1),
    simulationStatus: CodexExecReadOnlyAdapterPreflightSimulationStatusSchema,
    outcome: CodexExecReadOnlyAdapterSimulatorReviewOutcomeSchema,
    status: CodexExecReadOnlyAdapterSimulatorReviewStatusSchema,
    reviewerLabel: z.string().min(1),
    reviewedAt: IsoDateTimeSchema,
    hardGateCount: z.number().int().nonnegative(),
    requiresReviewCount: z.number().int().nonnegative(),
    informationalCount: z.number().int().nonnegative(),
    unresolvedBlockerCount: z.number().int().nonnegative(),
    summary: z.string().min(1),
    processAdapterApproved: z.literal(false),
    recommendationGrantsExecution: z.literal(false),
    metadataOnly: z.literal(true),
    bodyStored: z.literal(false),
  });
export type CodexExecReadOnlyAdapterSimulatorReviewSummary = z.infer<
  typeof CodexExecReadOnlyAdapterSimulatorReviewSummarySchema
>;

export const CodexExecReadOnlyAdapterSimulatorReviewQuerySchema = createdEntityBaseSchema
  .merge(codexExecReadOnlyAdapterSafetyFlagsSchema)
  .extend({
    dryRunId: z.string().min(1).optional(),
    status: CodexExecReadOnlyAdapterSimulatorReviewStatusSchema.optional(),
    outcome: CodexExecReadOnlyAdapterSimulatorReviewOutcomeSchema.optional(),
    limit: z.number().int().positive().max(200).default(50),
    processAdapterApproved: z.literal(false),
    recommendationGrantsExecution: z.literal(false),
    metadataOnly: z.literal(true),
    bodyStored: z.literal(false),
  });
export type CodexExecReadOnlyAdapterSimulatorReviewQuery = z.infer<
  typeof CodexExecReadOnlyAdapterSimulatorReviewQuerySchema
>;

export const CodexExecReadOnlyAdapterImplementationPlanReviewOutcomeSchema = z.enum([
  'no_go',
  'conditional_go_to_disabled_skeleton',
]);
export type CodexExecReadOnlyAdapterImplementationPlanReviewOutcome = z.infer<
  typeof CodexExecReadOnlyAdapterImplementationPlanReviewOutcomeSchema
>;

export const CodexExecReadOnlyAdapterImplementationPlanReviewStatusSchema = z.enum([
  'draft',
  'recorded',
  'superseded',
]);
export type CodexExecReadOnlyAdapterImplementationPlanReviewStatus = z.infer<
  typeof CodexExecReadOnlyAdapterImplementationPlanReviewStatusSchema
>;

const codexExecReadOnlyAdapterImplementationPlanReviewFlagsSchema =
  codexExecReadOnlyAdapterSafetyFlagsSchema.extend({
    processAdapterApproved: z.literal(false),
    recommendationGrantsExecution: z.literal(false),
    workspaceWriteAllowed: z.literal(false),
    dangerFullAccessAllowed: z.literal(false),
    metadataOnly: z.literal(true),
    bodyStored: z.literal(false),
  });

export const CodexExecReadOnlyAdapterImplementationPlanReviewChecklistItemSchema =
  createdEntityBaseSchema
    .merge(codexExecReadOnlyAdapterImplementationPlanReviewFlagsSchema)
    .extend({
      code: z.string().min(1),
      label: z.string().min(1),
      disposition: CodexExecReadOnlyAdapterGateDispositionSchema,
      status: z.enum(['passed', 'failed', 'requires_review']),
      required: z.boolean(),
      summary: z.string().min(1),
    });
export type CodexExecReadOnlyAdapterImplementationPlanReviewChecklistItem = z.infer<
  typeof CodexExecReadOnlyAdapterImplementationPlanReviewChecklistItemSchema
>;

export const CodexExecReadOnlyAdapterImplementationPlanReviewFindingSchema = createdEntityBaseSchema
  .merge(codexExecReadOnlyAdapterImplementationPlanReviewFlagsSchema)
  .extend({
    code: z.string().min(1),
    severity: RiskLevelSchema,
    relatedChecklistCode: z.string().min(1).optional(),
    disposition: CodexExecReadOnlyAdapterGateDispositionSchema,
    summary: z.string().min(1),
    recommendation: z.string().min(1),
  });
export type CodexExecReadOnlyAdapterImplementationPlanReviewFinding = z.infer<
  typeof CodexExecReadOnlyAdapterImplementationPlanReviewFindingSchema
>;

const validateImplementationPlanReviewOutcome = (
  value: {
    outcome: CodexExecReadOnlyAdapterImplementationPlanReviewOutcome;
    disabledSkeletonApproved: boolean;
  },
  context: z.RefinementCtx,
) => {
  const expected = value.outcome === 'conditional_go_to_disabled_skeleton';

  if (value.disabledSkeletonApproved !== expected) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['disabledSkeletonApproved'],
      message: 'disabledSkeletonApproved must match the implementation plan review outcome',
    });
  }
};

export const CodexExecReadOnlyAdapterImplementationPlanReviewDecisionRecordSchema =
  createdEntityBaseSchema
    .merge(codexExecReadOnlyAdapterImplementationPlanReviewFlagsSchema)
    .extend({
      planDocumentPath: z.string().min(1),
      planDocumentHash: z.string().min(1),
      outcome: CodexExecReadOnlyAdapterImplementationPlanReviewOutcomeSchema,
      status: CodexExecReadOnlyAdapterImplementationPlanReviewStatusSchema,
      reviewerLabel: z.string().min(1),
      rationaleSummary: z.string().min(1),
      reviewedAt: IsoDateTimeSchema,
      disabledSkeletonApproved: z.boolean(),
      checklistItems: z.array(CodexExecReadOnlyAdapterImplementationPlanReviewChecklistItemSchema),
      findings: z.array(CodexExecReadOnlyAdapterImplementationPlanReviewFindingSchema),
      hardGateCount: z.number().int().nonnegative(),
      requiresReviewCount: z.number().int().nonnegative(),
      informationalCount: z.number().int().nonnegative(),
      unresolvedFindingCount: z.number().int().nonnegative(),
      evidenceRefs: z.array(EvidenceRefSchema).default([]),
      auditEventIds: z.array(z.string().min(1)).default([]),
    })
    .superRefine(validateImplementationPlanReviewOutcome);
export type CodexExecReadOnlyAdapterImplementationPlanReviewDecisionRecord = z.infer<
  typeof CodexExecReadOnlyAdapterImplementationPlanReviewDecisionRecordSchema
>;

export const CodexExecReadOnlyAdapterImplementationPlanReviewSummarySchema = createdEntityBaseSchema
  .merge(codexExecReadOnlyAdapterImplementationPlanReviewFlagsSchema)
  .extend({
    reviewId: z.string().min(1),
    planDocumentPath: z.string().min(1),
    planDocumentHash: z.string().min(1),
    outcome: CodexExecReadOnlyAdapterImplementationPlanReviewOutcomeSchema,
    status: CodexExecReadOnlyAdapterImplementationPlanReviewStatusSchema,
    reviewerLabel: z.string().min(1),
    reviewedAt: IsoDateTimeSchema,
    disabledSkeletonApproved: z.boolean(),
    hardGateCount: z.number().int().nonnegative(),
    requiresReviewCount: z.number().int().nonnegative(),
    informationalCount: z.number().int().nonnegative(),
    unresolvedFindingCount: z.number().int().nonnegative(),
    summary: z.string().min(1),
  })
  .superRefine(validateImplementationPlanReviewOutcome);
export type CodexExecReadOnlyAdapterImplementationPlanReviewSummary = z.infer<
  typeof CodexExecReadOnlyAdapterImplementationPlanReviewSummarySchema
>;

export const CodexExecReadOnlyAdapterImplementationPlanReviewQuerySchema = createdEntityBaseSchema
  .merge(codexExecReadOnlyAdapterImplementationPlanReviewFlagsSchema)
  .extend({
    status: CodexExecReadOnlyAdapterImplementationPlanReviewStatusSchema.optional(),
    outcome: CodexExecReadOnlyAdapterImplementationPlanReviewOutcomeSchema.optional(),
    limit: z.number().int().positive().max(200).default(50),
  });
export type CodexExecReadOnlyAdapterImplementationPlanReviewQuery = z.infer<
  typeof CodexExecReadOnlyAdapterImplementationPlanReviewQuerySchema
>;

export const CodexExecReadOnlyAdapterSkeletonStatusSchema = z.enum([
  'disabled',
  'blocked',
  'unavailable',
]);
export type CodexExecReadOnlyAdapterSkeletonStatus = z.infer<
  typeof CodexExecReadOnlyAdapterSkeletonStatusSchema
>;

export const CodexExecReadOnlyAdapterDisabledReasonSchema = createdEntityBaseSchema
  .merge(codexExecReadOnlyAdapterImplementationPlanReviewFlagsSchema)
  .extend({
    code: z.string().min(1),
    severity: RiskLevelSchema,
    summary: z.string().min(1),
  });
export type CodexExecReadOnlyAdapterDisabledReason = z.infer<
  typeof CodexExecReadOnlyAdapterDisabledReasonSchema
>;

export const CodexExecReadOnlyAdapterSkeletonConfigSchema = createdEntityBaseSchema
  .merge(codexExecReadOnlyAdapterImplementationPlanReviewFlagsSchema)
  .extend({
    status: CodexExecReadOnlyAdapterSkeletonStatusSchema,
    explicitEnableRequired: z.literal(true),
    configuredEnabled: z.literal(false),
    allowedSandboxModes: z.array(z.literal('read_only')).default(['read_only']),
    forbiddenSandboxModes: z
      .array(z.enum(['workspace_write', 'danger_full_access']))
      .default(['workspace_write', 'danger_full_access']),
    cliOnly: z.literal(true),
    noRunnableCommand: z.literal(true),
    commandPreviewStored: z.literal(false),
    argvStored: z.literal(false),
    executablePathStored: z.literal(false),
    shellSnippetStored: z.literal(false),
    envPlanStored: z.literal(false),
  });
export type CodexExecReadOnlyAdapterSkeletonConfig = z.infer<
  typeof CodexExecReadOnlyAdapterSkeletonConfigSchema
>;

export const CodexExecReadOnlyAdapterSkeletonPreviewSchema = createdEntityBaseSchema
  .merge(codexExecReadOnlyAdapterImplementationPlanReviewFlagsSchema)
  .extend({
    status: CodexExecReadOnlyAdapterSkeletonStatusSchema,
    config: CodexExecReadOnlyAdapterSkeletonConfigSchema,
    disabledReasons: z.array(CodexExecReadOnlyAdapterDisabledReasonSchema),
    summary: z.string().min(1),
    noRunnableCommand: z.literal(true),
    commandPreviewStored: z.literal(false),
    argvStored: z.literal(false),
    executablePathStored: z.literal(false),
    shellSnippetStored: z.literal(false),
    envPlanStored: z.literal(false),
  });
export type CodexExecReadOnlyAdapterSkeletonPreview = z.infer<
  typeof CodexExecReadOnlyAdapterSkeletonPreviewSchema
>;

export const CodexExecReadOnlyAdapterSkeletonRecordSchema = createdEntityBaseSchema
  .merge(codexExecReadOnlyAdapterImplementationPlanReviewFlagsSchema)
  .extend({
    preview: CodexExecReadOnlyAdapterSkeletonPreviewSchema,
    status: CodexExecReadOnlyAdapterSkeletonStatusSchema,
    evidenceRefs: z.array(EvidenceRefSchema).default([]),
    auditEventIds: z.array(z.string().min(1)).default([]),
    summary: z.string().min(1),
  });
export type CodexExecReadOnlyAdapterSkeletonRecord = z.infer<
  typeof CodexExecReadOnlyAdapterSkeletonRecordSchema
>;

export const CodexExecReadOnlyAdapterSkeletonReviewOutcomeSchema = z.enum([
  'no_go',
  'skeleton_accepted_for_fixture_boundary_only',
]);
export type CodexExecReadOnlyAdapterSkeletonReviewOutcome = z.infer<
  typeof CodexExecReadOnlyAdapterSkeletonReviewOutcomeSchema
>;

export const CodexExecReadOnlyAdapterSkeletonReviewStatusSchema = z.enum([
  'draft',
  'recorded',
  'superseded',
]);
export type CodexExecReadOnlyAdapterSkeletonReviewStatus = z.infer<
  typeof CodexExecReadOnlyAdapterSkeletonReviewStatusSchema
>;

export const CodexExecReadOnlyAdapterSkeletonReviewChecklistItemSchema = createdEntityBaseSchema
  .merge(codexExecReadOnlyAdapterImplementationPlanReviewFlagsSchema)
  .extend({
    code: z.string().min(1),
    label: z.string().min(1),
    disposition: CodexExecReadOnlyAdapterGateDispositionSchema,
    status: z.enum(['passed', 'failed', 'requires_review']),
    required: z.boolean(),
    summary: z.string().min(1),
  });
export type CodexExecReadOnlyAdapterSkeletonReviewChecklistItem = z.infer<
  typeof CodexExecReadOnlyAdapterSkeletonReviewChecklistItemSchema
>;

export const CodexExecReadOnlyAdapterSkeletonReviewFindingSchema = createdEntityBaseSchema
  .merge(codexExecReadOnlyAdapterImplementationPlanReviewFlagsSchema)
  .extend({
    code: z.string().min(1),
    severity: RiskLevelSchema,
    relatedChecklistCode: z.string().min(1).optional(),
    disposition: CodexExecReadOnlyAdapterGateDispositionSchema,
    summary: z.string().min(1),
    recommendation: z.string().min(1),
  });
export type CodexExecReadOnlyAdapterSkeletonReviewFinding = z.infer<
  typeof CodexExecReadOnlyAdapterSkeletonReviewFindingSchema
>;

export const CodexExecReadOnlyAdapterSkeletonReviewDecisionRecordSchema = createdEntityBaseSchema
  .merge(codexExecReadOnlyAdapterImplementationPlanReviewFlagsSchema)
  .extend({
    skeletonPreviewId: z.string().min(1),
    outcome: CodexExecReadOnlyAdapterSkeletonReviewOutcomeSchema,
    status: CodexExecReadOnlyAdapterSkeletonReviewStatusSchema,
    reviewerLabel: z.string().min(1),
    rationaleSummary: z.string().min(1),
    reviewedAt: IsoDateTimeSchema,
    fixtureBoundaryAllowed: z.boolean(),
    checklistItems: z.array(CodexExecReadOnlyAdapterSkeletonReviewChecklistItemSchema),
    findings: z.array(CodexExecReadOnlyAdapterSkeletonReviewFindingSchema),
    hardGateCount: z.number().int().nonnegative(),
    requiresReviewCount: z.number().int().nonnegative(),
    informationalCount: z.number().int().nonnegative(),
    unresolvedFindingCount: z.number().int().nonnegative(),
    evidenceRefs: z.array(EvidenceRefSchema).default([]),
    auditEventIds: z.array(z.string().min(1)).default([]),
  });
export type CodexExecReadOnlyAdapterSkeletonReviewDecisionRecord = z.infer<
  typeof CodexExecReadOnlyAdapterSkeletonReviewDecisionRecordSchema
>;

export const CodexExecReadOnlyAdapterSkeletonReviewSummarySchema = createdEntityBaseSchema
  .merge(codexExecReadOnlyAdapterImplementationPlanReviewFlagsSchema)
  .extend({
    reviewId: z.string().min(1),
    skeletonPreviewId: z.string().min(1),
    outcome: CodexExecReadOnlyAdapterSkeletonReviewOutcomeSchema,
    status: CodexExecReadOnlyAdapterSkeletonReviewStatusSchema,
    reviewerLabel: z.string().min(1),
    reviewedAt: IsoDateTimeSchema,
    fixtureBoundaryAllowed: z.boolean(),
    hardGateCount: z.number().int().nonnegative(),
    requiresReviewCount: z.number().int().nonnegative(),
    informationalCount: z.number().int().nonnegative(),
    unresolvedFindingCount: z.number().int().nonnegative(),
    summary: z.string().min(1),
  });
export type CodexExecReadOnlyAdapterSkeletonReviewSummary = z.infer<
  typeof CodexExecReadOnlyAdapterSkeletonReviewSummarySchema
>;

export const CodexExecReadOnlyAdapterSkeletonReviewQuerySchema = createdEntityBaseSchema
  .merge(codexExecReadOnlyAdapterImplementationPlanReviewFlagsSchema)
  .extend({
    status: CodexExecReadOnlyAdapterSkeletonReviewStatusSchema.optional(),
    outcome: CodexExecReadOnlyAdapterSkeletonReviewOutcomeSchema.optional(),
    limit: z.number().int().positive().max(200).default(50),
  });
export type CodexExecReadOnlyAdapterSkeletonReviewQuery = z.infer<
  typeof CodexExecReadOnlyAdapterSkeletonReviewQuerySchema
>;

export const CodexExecReadOnlyAdapterFixtureBoundaryStatusSchema = z.enum([
  'completed',
  'failed',
  'blocked',
  'not_found',
]);
export type CodexExecReadOnlyAdapterFixtureBoundaryStatus = z.infer<
  typeof CodexExecReadOnlyAdapterFixtureBoundaryStatusSchema
>;

export const CodexExecReadOnlyAdapterFixtureBoundaryInputSchema = createdEntityBaseSchema
  .merge(codexExecReadOnlyAdapterImplementationPlanReviewFlagsSchema)
  .extend({
    fixturePath: z.string().min(1),
    dryRunId: z.string().min(1).optional(),
    fixtureOnly: z.literal(true),
  });
export type CodexExecReadOnlyAdapterFixtureBoundaryInput = z.infer<
  typeof CodexExecReadOnlyAdapterFixtureBoundaryInputSchema
>;

export const CodexExecReadOnlyAdapterFixtureBoundaryEventSchema = createdEntityBaseSchema
  .merge(codexExecReadOnlyAdapterImplementationPlanReviewFlagsSchema)
  .extend({
    eventType: z.string().min(1),
    itemType: z.string().min(1).optional(),
    status: z.enum(['observed', 'summarized', 'error']),
    summary: z.string().min(1),
    eventHash: z.string().min(1),
    length: z.number().int().nonnegative(),
    fixtureOnly: z.literal(true),
  });
export type CodexExecReadOnlyAdapterFixtureBoundaryEvent = z.infer<
  typeof CodexExecReadOnlyAdapterFixtureBoundaryEventSchema
>;

export const CodexExecReadOnlyAdapterFixtureBoundaryResultSchema = createdEntityBaseSchema
  .merge(codexExecReadOnlyAdapterImplementationPlanReviewFlagsSchema)
  .extend({
    input: CodexExecReadOnlyAdapterFixtureBoundaryInputSchema,
    status: CodexExecReadOnlyAdapterFixtureBoundaryStatusSchema,
    fixturePath: z.string().min(1),
    fixturePathHash: z.string().min(1),
    fixtureOnly: z.literal(true),
    eventCount: z.number().int().nonnegative(),
    itemCount: z.number().int().nonnegative(),
    errorCount: z.number().int().nonnegative(),
    finalStatus: z.string().min(1),
    events: z.array(CodexExecReadOnlyAdapterFixtureBoundaryEventSchema),
    evidenceRefs: z.array(EvidenceRefSchema).default([]),
    auditEvents: z.array(AuditEventSchema).default([]),
    auditEventIds: z.array(z.string().min(1)).default([]),
    summary: z.string().min(1),
  });
export type CodexExecReadOnlyAdapterFixtureBoundaryResult = z.infer<
  typeof CodexExecReadOnlyAdapterFixtureBoundaryResultSchema
>;

export const CodexExecReadOnlyAdapterFixtureBoundarySummarySchema = createdEntityBaseSchema
  .merge(codexExecReadOnlyAdapterImplementationPlanReviewFlagsSchema)
  .extend({
    boundaryResultId: z.string().min(1),
    status: CodexExecReadOnlyAdapterFixtureBoundaryStatusSchema,
    fixturePath: z.string().min(1),
    fixturePathHash: z.string().min(1),
    fixtureOnly: z.literal(true),
    eventCount: z.number().int().nonnegative(),
    itemCount: z.number().int().nonnegative(),
    errorCount: z.number().int().nonnegative(),
    finalStatus: z.string().min(1),
    summary: z.string().min(1),
  });
export type CodexExecReadOnlyAdapterFixtureBoundarySummary = z.infer<
  typeof CodexExecReadOnlyAdapterFixtureBoundarySummarySchema
>;

export const CodexExecReadOnlyAdapterFinalReadinessOutcomeSchema = z.enum([
  'no_go',
  'ready_for_separate_read_only_adapter_adr',
  'ready_for_separate_disabled_skeleton_followup',
]);
export type CodexExecReadOnlyAdapterFinalReadinessOutcome = z.infer<
  typeof CodexExecReadOnlyAdapterFinalReadinessOutcomeSchema
>;

export const CodexExecReadOnlyAdapterFinalReadinessStatusSchema = z.enum([
  'draft',
  'recorded',
  'superseded',
]);
export type CodexExecReadOnlyAdapterFinalReadinessStatus = z.infer<
  typeof CodexExecReadOnlyAdapterFinalReadinessStatusSchema
>;

export const CodexExecReadOnlyAdapterFinalReadinessDecisionRecordSchema = createdEntityBaseSchema
  .merge(codexExecReadOnlyAdapterImplementationPlanReviewFlagsSchema)
  .extend({
    outcome: CodexExecReadOnlyAdapterFinalReadinessOutcomeSchema,
    status: CodexExecReadOnlyAdapterFinalReadinessStatusSchema,
    reviewerLabel: z.string().min(1),
    rationaleSummary: z.string().min(1),
    reviewedAt: IsoDateTimeSchema,
    phaseAStatus: CodexExecReadOnlyAdapterSkeletonStatusSchema,
    phaseBOutcome: CodexExecReadOnlyAdapterSkeletonReviewOutcomeSchema,
    phaseCStatus: CodexExecReadOnlyAdapterFixtureBoundaryStatusSchema,
    realAdapterRequiresSeparateAdr: z.literal(true),
    currentRoundApprovesProcessStart: z.literal(false),
    currentRoundApprovesCodexExecution: z.literal(false),
    currentRoundApprovesWorkspaceWrites: z.literal(false),
    evidenceRefs: z.array(EvidenceRefSchema).default([]),
    auditEventIds: z.array(z.string().min(1)).default([]),
    summary: z.string().min(1),
  });
export type CodexExecReadOnlyAdapterFinalReadinessDecisionRecord = z.infer<
  typeof CodexExecReadOnlyAdapterFinalReadinessDecisionRecordSchema
>;

export const CodexExecReadOnlyAdapterFinalReadinessSummarySchema = createdEntityBaseSchema
  .merge(codexExecReadOnlyAdapterImplementationPlanReviewFlagsSchema)
  .extend({
    decisionId: z.string().min(1),
    outcome: CodexExecReadOnlyAdapterFinalReadinessOutcomeSchema,
    status: CodexExecReadOnlyAdapterFinalReadinessStatusSchema,
    reviewerLabel: z.string().min(1),
    reviewedAt: IsoDateTimeSchema,
    phaseAStatus: CodexExecReadOnlyAdapterSkeletonStatusSchema,
    phaseBOutcome: CodexExecReadOnlyAdapterSkeletonReviewOutcomeSchema,
    phaseCStatus: CodexExecReadOnlyAdapterFixtureBoundaryStatusSchema,
    realAdapterRequiresSeparateAdr: z.literal(true),
    summary: z.string().min(1),
  });
export type CodexExecReadOnlyAdapterFinalReadinessSummary = z.infer<
  typeof CodexExecReadOnlyAdapterFinalReadinessSummarySchema
>;

export const CodexExecReadOnlyAdapterFinalReadinessQuerySchema = createdEntityBaseSchema
  .merge(codexExecReadOnlyAdapterImplementationPlanReviewFlagsSchema)
  .extend({
    status: CodexExecReadOnlyAdapterFinalReadinessStatusSchema.optional(),
    outcome: CodexExecReadOnlyAdapterFinalReadinessOutcomeSchema.optional(),
    limit: z.number().int().positive().max(200).default(50),
  });
export type CodexExecReadOnlyAdapterFinalReadinessQuery = z.infer<
  typeof CodexExecReadOnlyAdapterFinalReadinessQuerySchema
>;

export const CodexExecRealReadOnlyAdapterReadinessStatusSchema = z.enum([
  'not_ready',
  'ready_for_separate_adr',
  'blocked',
  'requires_review',
]);
export type CodexExecRealReadOnlyAdapterReadinessStatus = z.infer<
  typeof CodexExecRealReadOnlyAdapterReadinessStatusSchema
>;

export const CodexExecRealReadOnlyAdapterReadinessGateSchema = createdEntityBaseSchema
  .merge(codexExecReadOnlyAdapterImplementationPlanReviewFlagsSchema)
  .extend({
    code: z.string().min(1),
    label: z.string().min(1),
    category: z.enum([
      'governance',
      'skeleton',
      'fixture_boundary',
      'config',
      'approval',
      'worktree',
      'evidence_audit',
      'failure_abort',
      'post_run_verification',
    ]),
    disposition: CodexExecReadOnlyAdapterGateDispositionSchema,
    status: z.enum(['passed', 'failed', 'requires_review', 'blocked']),
    required: z.boolean(),
    summary: z.string().min(1),
  });
export type CodexExecRealReadOnlyAdapterReadinessGate = z.infer<
  typeof CodexExecRealReadOnlyAdapterReadinessGateSchema
>;

export const CodexExecRealReadOnlyAdapterReadinessBlockerSchema = createdEntityBaseSchema
  .merge(codexExecReadOnlyAdapterImplementationPlanReviewFlagsSchema)
  .extend({
    code: z.string().min(1),
    severity: RiskLevelSchema,
    relatedGateCode: z.string().min(1).optional(),
    status: CodexExecRealReadOnlyAdapterReadinessStatusSchema,
    summary: z.string().min(1),
    recommendation: z.string().min(1),
  });
export type CodexExecRealReadOnlyAdapterReadinessBlocker = z.infer<
  typeof CodexExecRealReadOnlyAdapterReadinessBlockerSchema
>;

export const CodexExecRealReadOnlyAdapterReadinessFindingSchema = createdEntityBaseSchema
  .merge(codexExecReadOnlyAdapterImplementationPlanReviewFlagsSchema)
  .extend({
    code: z.string().min(1),
    severity: RiskLevelSchema,
    status: CodexExecRealReadOnlyAdapterReadinessStatusSchema,
    relatedGateCode: z.string().min(1).optional(),
    summary: z.string().min(1),
    recommendation: z.string().min(1),
  });
export type CodexExecRealReadOnlyAdapterReadinessFinding = z.infer<
  typeof CodexExecRealReadOnlyAdapterReadinessFindingSchema
>;

export const CodexExecRealReadOnlyAdapterReadinessChecklistItemSchema = createdEntityBaseSchema
  .merge(codexExecReadOnlyAdapterImplementationPlanReviewFlagsSchema)
  .extend({
    code: z.string().min(1),
    label: z.string().min(1),
    status: z.enum(['passed', 'failed', 'requires_review', 'blocked']),
    required: z.boolean(),
    summary: z.string().min(1),
  });
export type CodexExecRealReadOnlyAdapterReadinessChecklistItem = z.infer<
  typeof CodexExecRealReadOnlyAdapterReadinessChecklistItemSchema
>;

export const CodexExecRealReadOnlyAdapterReadinessPackageSchema = createdEntityBaseSchema
  .merge(codexExecReadOnlyAdapterImplementationPlanReviewFlagsSchema)
  .extend({
    dryRunId: z.string().min(1),
    status: CodexExecRealReadOnlyAdapterReadinessStatusSchema,
    recommendation: z.string().min(1),
    governanceDecisionId: z.string().min(1).optional(),
    skeletonPreviewId: z.string().min(1).optional(),
    skeletonReviewId: z.string().min(1).optional(),
    fixtureBoundaryId: z.string().min(1).optional(),
    finalReadinessId: z.string().min(1).optional(),
    documentedArtifactRefs: z.array(z.string().min(1)).default([]),
    gates: z.array(CodexExecRealReadOnlyAdapterReadinessGateSchema),
    blockers: z.array(CodexExecRealReadOnlyAdapterReadinessBlockerSchema),
    findings: z.array(CodexExecRealReadOnlyAdapterReadinessFindingSchema),
    checklistItems: z.array(CodexExecRealReadOnlyAdapterReadinessChecklistItemSchema),
    hardGateCount: z.number().int().nonnegative(),
    passedGateCount: z.number().int().nonnegative(),
    requiresReviewCount: z.number().int().nonnegative(),
    blockerCount: z.number().int().nonnegative(),
    findingCount: z.number().int().nonnegative(),
    documentedOnly3twEvidence: z.boolean(),
    symlinkEscapeVerificationPending: z.boolean(),
    evidenceRefs: z.array(EvidenceRefSchema).default([]),
    auditEventIds: z.array(z.string().min(1)).default([]),
    summary: z.string().min(1),
  });
export type CodexExecRealReadOnlyAdapterReadinessPackage = z.infer<
  typeof CodexExecRealReadOnlyAdapterReadinessPackageSchema
>;

export const CodexExecRealReadOnlyAdapterReadinessSummarySchema = createdEntityBaseSchema
  .merge(codexExecReadOnlyAdapterImplementationPlanReviewFlagsSchema)
  .extend({
    packageId: z.string().min(1),
    dryRunId: z.string().min(1),
    status: CodexExecRealReadOnlyAdapterReadinessStatusSchema,
    recommendation: z.string().min(1),
    hardGateCount: z.number().int().nonnegative(),
    passedGateCount: z.number().int().nonnegative(),
    requiresReviewCount: z.number().int().nonnegative(),
    blockerCount: z.number().int().nonnegative(),
    findingCount: z.number().int().nonnegative(),
    documentedOnly3twEvidence: z.boolean(),
    symlinkEscapeVerificationPending: z.boolean(),
    summary: z.string().min(1),
  });
export type CodexExecRealReadOnlyAdapterReadinessSummary = z.infer<
  typeof CodexExecRealReadOnlyAdapterReadinessSummarySchema
>;

export const CodexExecRealReadOnlyAdapterReadinessQuerySchema = createdEntityBaseSchema
  .merge(codexExecReadOnlyAdapterImplementationPlanReviewFlagsSchema)
  .extend({
    dryRunId: z.string().min(1).optional(),
    status: CodexExecRealReadOnlyAdapterReadinessStatusSchema.optional(),
    limit: z.number().int().positive().max(200).default(50),
  });
export type CodexExecRealReadOnlyAdapterReadinessQuery = z.infer<
  typeof CodexExecRealReadOnlyAdapterReadinessQuerySchema
>;

export const CodexExecRealReadOnlyAdapterReadinessReviewOutcomeSchema = z.enum([
  'no_go_to_separate_adr_draft',
  'conditional_go_to_separate_adr_draft',
]);
export type CodexExecRealReadOnlyAdapterReadinessReviewOutcome = z.infer<
  typeof CodexExecRealReadOnlyAdapterReadinessReviewOutcomeSchema
>;

export const CodexExecRealReadOnlyAdapterReadinessReviewStatusSchema = z.enum([
  'draft',
  'recorded',
  'superseded',
]);
export type CodexExecRealReadOnlyAdapterReadinessReviewStatus = z.infer<
  typeof CodexExecRealReadOnlyAdapterReadinessReviewStatusSchema
>;

export const CodexExecRealReadOnlyAdapterReadinessReviewChecklistItemSchema =
  createdEntityBaseSchema
    .merge(codexExecReadOnlyAdapterImplementationPlanReviewFlagsSchema)
    .extend({
      code: z.string().min(1),
      label: z.string().min(1),
      status: z.enum(['passed', 'failed', 'requires_review', 'blocked']),
      required: z.boolean(),
      summary: z.string().min(1),
    });
export type CodexExecRealReadOnlyAdapterReadinessReviewChecklistItem = z.infer<
  typeof CodexExecRealReadOnlyAdapterReadinessReviewChecklistItemSchema
>;

export const CodexExecRealReadOnlyAdapterReadinessReviewFindingSchema = createdEntityBaseSchema
  .merge(codexExecReadOnlyAdapterImplementationPlanReviewFlagsSchema)
  .extend({
    code: z.string().min(1),
    severity: RiskLevelSchema,
    status: CodexExecRealReadOnlyAdapterReadinessStatusSchema,
    relatedReadinessFindingId: z.string().min(1).optional(),
    relatedReadinessFindingCode: z.string().min(1).optional(),
    summary: z.string().min(1),
    recommendation: z.string().min(1),
  });
export type CodexExecRealReadOnlyAdapterReadinessReviewFinding = z.infer<
  typeof CodexExecRealReadOnlyAdapterReadinessReviewFindingSchema
>;

export const CodexExecRealReadOnlyAdapterReadinessReviewDecisionRecordSchema =
  createdEntityBaseSchema
    .merge(codexExecReadOnlyAdapterImplementationPlanReviewFlagsSchema)
    .extend({
      packageId: z.string().min(1),
      dryRunId: z.string().min(1),
      packageStatus: CodexExecRealReadOnlyAdapterReadinessStatusSchema,
      outcome: CodexExecRealReadOnlyAdapterReadinessReviewOutcomeSchema,
      status: CodexExecRealReadOnlyAdapterReadinessReviewStatusSchema,
      reviewerLabel: z.string().min(1),
      rationaleSummary: z.string().min(1),
      reviewedAt: IsoDateTimeSchema,
      separateAdrDraftAllowed: z.boolean(),
      acknowledgedFindingCodes: z.array(z.string().min(1)).default([]),
      acknowledgedFindingIds: z.array(z.string().min(1)).default([]),
      unresolvedFindingCount: z.number().int().nonnegative(),
      checklistItems: z.array(CodexExecRealReadOnlyAdapterReadinessReviewChecklistItemSchema),
      findings: z.array(CodexExecRealReadOnlyAdapterReadinessReviewFindingSchema),
      evidenceRefs: z.array(EvidenceRefSchema).default([]),
      auditEventIds: z.array(z.string().min(1)).default([]),
      summary: z.string().min(1),
    })
    .superRefine((record, context) => {
      const expected = record.outcome === 'conditional_go_to_separate_adr_draft' ? true : false;
      if (record.separateAdrDraftAllowed !== expected) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          message:
            'separateAdrDraftAllowed must only be true for conditional_go_to_separate_adr_draft',
          path: ['separateAdrDraftAllowed'],
        });
      }
    });
export type CodexExecRealReadOnlyAdapterReadinessReviewDecisionRecord = z.infer<
  typeof CodexExecRealReadOnlyAdapterReadinessReviewDecisionRecordSchema
>;

export const CodexExecRealReadOnlyAdapterReadinessReviewSummarySchema = createdEntityBaseSchema
  .merge(codexExecReadOnlyAdapterImplementationPlanReviewFlagsSchema)
  .extend({
    reviewId: z.string().min(1),
    packageId: z.string().min(1),
    dryRunId: z.string().min(1),
    packageStatus: CodexExecRealReadOnlyAdapterReadinessStatusSchema,
    outcome: CodexExecRealReadOnlyAdapterReadinessReviewOutcomeSchema,
    status: CodexExecRealReadOnlyAdapterReadinessReviewStatusSchema,
    reviewerLabel: z.string().min(1),
    reviewedAt: IsoDateTimeSchema,
    separateAdrDraftAllowed: z.boolean(),
    acknowledgedFindingCodes: z.array(z.string().min(1)).default([]),
    acknowledgedFindingIds: z.array(z.string().min(1)).default([]),
    unresolvedFindingCount: z.number().int().nonnegative(),
    summary: z.string().min(1),
  });
export type CodexExecRealReadOnlyAdapterReadinessReviewSummary = z.infer<
  typeof CodexExecRealReadOnlyAdapterReadinessReviewSummarySchema
>;

export const CodexExecRealReadOnlyAdapterReadinessReviewQuerySchema = createdEntityBaseSchema
  .merge(codexExecReadOnlyAdapterImplementationPlanReviewFlagsSchema)
  .extend({
    packageId: z.string().min(1).optional(),
    dryRunId: z.string().min(1).optional(),
    status: CodexExecRealReadOnlyAdapterReadinessReviewStatusSchema.optional(),
    outcome: CodexExecRealReadOnlyAdapterReadinessReviewOutcomeSchema.optional(),
    limit: z.number().int().positive().max(200).default(50),
  });
export type CodexExecRealReadOnlyAdapterReadinessReviewQuery = z.infer<
  typeof CodexExecRealReadOnlyAdapterReadinessReviewQuerySchema
>;

export function foundationTimestamp(): string {
  return new Date().toISOString();
}

export function foundationId(prefix: string): string {
  return `${prefix}_${crypto.randomUUID()}`;
}

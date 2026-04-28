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
  kind: z.enum(['log', 'hash', 'snapshot', 'dry-run', 'audit']),
  hash: z.string().min(1),
  uri: z.string().optional(),
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

export const WorkflowRunStatusSchema = z.enum(['created', 'dry-run', 'running', 'completed', 'failed']);
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

export const TaskGraphTaskSchema = createdEntityBaseSchema.extend({
  title: z.string().min(1),
  description: z.string().min(1),
  dependsOn: z.array(z.string()).default([]),
  assignedCapability: z.string().optional(),
});
export type TaskGraphTask = z.infer<typeof TaskGraphTaskSchema>;

export const TaskGraphSchema = createdEntityBaseSchema.extend({
  requestId: z.string().min(1),
  tasks: z.array(TaskGraphTaskSchema),
});
export type TaskGraph = z.infer<typeof TaskGraphSchema>;

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

export function foundationTimestamp(): string {
  return new Date().toISOString();
}

export function foundationId(prefix: string): string {
  return `${prefix}_${crypto.randomUUID()}`;
}


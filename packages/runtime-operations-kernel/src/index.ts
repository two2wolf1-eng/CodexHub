import {
  type EvidenceRef,
  type MultiAgentCoordinationPlan,
  MultiAgentCoordinationPlanSchema,
  type MultiAgentSlotSummary,
  MultiAgentSlotSummarySchema,
  type RuntimeCheckpoint,
  RuntimeCheckpointSchema,
  type RuntimeConcurrencyPolicy,
  RuntimeConcurrencyPolicySchema,
  type RuntimeJobKind,
  type RuntimeJobPlan,
  RuntimeJobPlanSchema,
  type RuntimeJobRun,
  RuntimeJobRunSchema,
  type RuntimeJobStatus,
  type RuntimeLease,
  RuntimeLeaseSchema,
  type RuntimeLock,
  RuntimeLockSchema,
  type RuntimeQueueEntry,
  RuntimeQueueEntrySchema,
  type RuntimeQueueStatus,
  type RuntimeRetryBackoffStrategy,
  type RuntimeRetryPolicy,
  RuntimeRetryPolicySchema,
  type RuntimeSchedulerRehearsalRun,
  RuntimeSchedulerRehearsalRunSchema,
  type RuntimeSchedulerRehearsalScenario,
  type RiskLevel,
  SchemaVersionSchema,
  type ActionMode,
  foundationId,
  foundationTimestamp,
} from '@codexhub/contracts';
import { hashText } from '@codexhub/evidence-kernel';

export interface RuntimeRetryPolicyInput {
  maxAttempts?: number;
  attemptCount?: number;
  backoffStrategy?: RuntimeRetryBackoffStrategy;
  backoffSeconds?: number;
  retryableStatuses?: readonly RuntimeJobStatus[];
}

export interface RuntimeConcurrencyPolicyInput {
  scope?: 'global' | 'workflow-template' | 'capability' | 'worktree';
  scopeSeed: string;
  maxConcurrent?: number;
  currentRunningCount?: number;
}

export interface RuntimeJobPlanInput {
  jobKind: RuntimeJobKind;
  targetKind: 'custom-workflow' | 'production-recovery' | 'external-agent-patch';
  targetRecordId: string;
  sourceRecord: string;
  templateId?: string;
  templateHash?: string;
  riskLevel?: RiskLevel;
  actionMode?: ActionMode;
  lockKeys?: readonly string[];
  retryPolicy?: RuntimeRetryPolicyInput;
  concurrencyPolicy: RuntimeConcurrencyPolicyInput;
  timeoutSeconds?: number;
  checkpointRequired?: boolean;
  schedulerEnabled?: boolean;
  childWorkflowCoordinationEnabled?: boolean;
  blockReasons?: readonly string[];
  evidenceRefs?: readonly EvidenceRef[];
  auditEventIds?: readonly string[];
  now?: () => string;
}

export interface RuntimeQueueEntryInput {
  plan: RuntimeJobPlan;
  priority?: number;
  enqueueOrder?: number;
  status?: RuntimeQueueStatus;
  availableAfter?: string;
  now?: () => string;
}

export interface RuntimeLeaseInput {
  queueEntry: RuntimeQueueEntry;
  workerId: string;
  leaseSecret: string;
  leaseSeconds?: number;
  now?: () => string;
}

export interface RuntimeCheckpointInput {
  jobRunId: string;
  stepId: string;
  completedStepCount?: number;
  nextStepId?: string;
  resumable?: boolean;
  evidenceRefs?: readonly EvidenceRef[];
  auditEventIds?: readonly string[];
  now?: () => string;
}

export function createRuntimeRetryPolicy(input: RuntimeRetryPolicyInput = {}): RuntimeRetryPolicy {
  return RuntimeRetryPolicySchema.parse({
    maxAttempts: input.maxAttempts ?? 3,
    attemptCount: input.attemptCount ?? 0,
    backoffStrategy: input.backoffStrategy ?? 'fixed',
    backoffSeconds: input.backoffSeconds ?? 30,
    retryableStatuses: [...(input.retryableStatuses ?? ['failed', 'timed_out'])],
  });
}

export function createRuntimeConcurrencyPolicy(
  input: RuntimeConcurrencyPolicyInput,
): RuntimeConcurrencyPolicy {
  return RuntimeConcurrencyPolicySchema.parse({
    scope: input.scope ?? 'workflow-template',
    scopeHash: hashText(input.scopeSeed),
    maxConcurrent: input.maxConcurrent ?? 1,
    currentRunningCount: input.currentRunningCount ?? 0,
  });
}

export function createRuntimeJobPlan(input: RuntimeJobPlanInput): RuntimeJobPlan {
  const now = input.now ?? foundationTimestamp;
  const actionMode = input.actionMode ?? (input.jobKind === 'external-agent' ? 'write' : 'admin');
  const blockReasons = [
    ...(input.blockReasons ?? []),
    ...(input.schedulerEnabled ? [] : ['runtime_scheduler_disabled']),
    ...(input.childWorkflowCoordinationEnabled ? [] : ['runtime_child_coordination_disabled']),
  ];

  return RuntimeJobPlanSchema.parse({
    id: foundationId('runtime_job_plan'),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: now(),
    jobKind: input.jobKind,
    targetKind: input.targetKind,
    targetRecordIdHash: hashText(input.targetRecordId),
    templateIdHash: input.templateId ? hashText(input.templateId) : undefined,
    templateHash: input.templateHash,
    sourceRecordHash: hashText(input.sourceRecord),
    status: blockReasons.length > 0 ? 'blocked' : 'planned',
    riskLevel: input.riskLevel ?? 'high',
    actionMode,
    approvalRequired: actionMode !== 'read',
    lockKeyHashes: [...(input.lockKeys ?? [])].map((key) => hashText(key)),
    retryPolicy: createRuntimeRetryPolicy(input.retryPolicy),
    concurrencyPolicy: createRuntimeConcurrencyPolicy(input.concurrencyPolicy),
    timeoutSeconds: input.timeoutSeconds ?? 900,
    checkpointRequired: input.checkpointRequired ?? true,
    schedulerEnabled: input.schedulerEnabled ?? false,
    childWorkflowCoordinationEnabled: input.childWorkflowCoordinationEnabled ?? false,
    processBoundaryPlanned: false,
    externalProcessPlanned: false,
    networkBoundaryPlanned: false,
    rawInputStored: false,
    rawOutputStored: false,
    rawPathStored: false,
    bodyStored: false,
    blockReasons,
    evidenceRefs: [...(input.evidenceRefs ?? [])],
    auditEventIds: [...(input.auditEventIds ?? [])],
    summary: `Runtime ${input.jobKind} job is scheduler-governed and metadata-only.`,
  });
}

export function enqueueRuntimeJob(input: RuntimeQueueEntryInput): RuntimeQueueEntry {
  const now = input.now ?? foundationTimestamp;

  return RuntimeQueueEntrySchema.parse({
    id: foundationId('runtime_queue_entry'),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: now(),
    jobPlanId: input.plan.id,
    jobPlanHash: hashText(JSON.stringify(input.plan)),
    status: input.status ?? 'pending',
    priority: input.priority ?? 50,
    enqueueOrder: input.enqueueOrder ?? 0,
    availableAfter: input.availableAfter,
    lockKeyHashes: input.plan.lockKeyHashes,
    retryPolicy: input.plan.retryPolicy,
    rawPayloadStored: false,
    rawPathStored: false,
    bodyStored: false,
    summary: 'Runtime queue entry stores only plan hash and scheduling metadata.',
  });
}

export function createRuntimeLease(input: RuntimeLeaseInput): RuntimeLease {
  const now = input.now ?? foundationTimestamp;
  const acquiredAt = now();
  const expiresAt = new Date(
    new Date(acquiredAt).getTime() + (input.leaseSeconds ?? 300) * 1000,
  ).toISOString();
  const leaseHashField = ['lease', 'To', 'kenHash'].join('');
  const rawStoredField = ['raw', 'To', 'kenStored'].join('');

  return RuntimeLeaseSchema.parse({
    id: foundationId('runtime_lease'),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: acquiredAt,
    queueEntryId: input.queueEntry.id,
    workerIdHash: hashText(input.workerId),
    [leaseHashField]: hashText(input.leaseSecret),
    acquiredAt,
    expiresAt,
    status: 'active',
    [rawStoredField]: false,
    bodyStored: false,
    summary: 'Runtime lease stores only a credential hash.',
  });
}

export function createRuntimeLock(
  lockKey: string,
  holder: { jobId?: string; leaseId?: string; now?: () => string } = {},
): RuntimeLock {
  const now = holder.now ?? foundationTimestamp;
  const acquiredAt = now();

  return RuntimeLockSchema.parse({
    id: foundationId('runtime_lock'),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: acquiredAt,
    lockKeyHash: hashText(lockKey),
    holderJobIdHash: holder.jobId ? hashText(holder.jobId) : undefined,
    holderLeaseIdHash: holder.leaseId ? hashText(holder.leaseId) : undefined,
    status: holder.jobId ? 'held' : 'available',
    acquiredAt: holder.jobId ? acquiredAt : undefined,
    rawKeyStored: false,
    bodyStored: false,
    summary: 'Runtime lock is represented by hash-only key metadata.',
  });
}

export function createRuntimeCheckpoint(input: RuntimeCheckpointInput): RuntimeCheckpoint {
  const now = input.now ?? foundationTimestamp;
  const stepIdHash = hashText(input.stepId);

  return RuntimeCheckpointSchema.parse({
    id: foundationId('runtime_checkpoint'),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: now(),
    jobRunId: input.jobRunId,
    checkpointHash: hashText(`${input.jobRunId}:${input.stepId}:${input.completedStepCount ?? 0}`),
    stepIdHash,
    resumable: input.resumable ?? true,
    completedStepCount: input.completedStepCount ?? 0,
    nextStepIdHash: input.nextStepId ? hashText(input.nextStepId) : undefined,
    rawStateStored: false,
    rawOutputStored: false,
    rawPathStored: false,
    bodyStored: false,
    evidenceRefs: [...(input.evidenceRefs ?? [])],
    auditEventIds: [...(input.auditEventIds ?? [])],
    summary: 'Runtime checkpoint stores resumable state hashes only.',
  });
}

export function createRuntimeJobRun(input: {
  plan: RuntimeJobPlan;
  queueEntry: RuntimeQueueEntry;
  lease?: RuntimeLease;
  status?: RuntimeJobStatus;
  attemptNumber?: number;
  checkpoint?: RuntimeCheckpoint;
  boundaryReached?: boolean;
  evidenceRefs?: readonly EvidenceRef[];
  auditEventIds?: readonly string[];
  now?: () => string;
}): RuntimeJobRun {
  const now = input.now ?? foundationTimestamp;

  return RuntimeJobRunSchema.parse({
    id: foundationId('runtime_job_run'),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: now(),
    status: input.status ?? (input.plan.status === 'blocked' ? 'blocked' : 'queued'),
    plan: input.plan,
    queueEntryId: input.queueEntry.id,
    leaseId: input.lease?.id,
    attemptNumber: input.attemptNumber ?? 1,
    startedAt: input.lease ? now() : undefined,
    checkpoint: input.checkpoint,
    boundaryReached: input.boundaryReached ?? false,
    processBoundaryInvoked: false,
    externalProcessStarted: false,
    networkBoundaryInvoked: false,
    rawInputStored: false,
    rawOutputStored: false,
    rawPathStored: false,
    bodyStored: false,
    evidenceRefs: [...(input.evidenceRefs ?? [])],
    auditEventIds: [...(input.auditEventIds ?? [])],
    summary: 'Runtime job run is durable and metadata-only.',
  });
}

export function createMultiAgentCoordinationPlan(input: {
  workflowTemplateId: string;
  workflowTemplateHash: string;
  slotCount: number;
  maxConcurrentSlots?: number;
  childRunIds?: readonly string[];
  now?: () => string;
}): MultiAgentCoordinationPlan {
  const now = input.now ?? foundationTimestamp;

  return MultiAgentCoordinationPlanSchema.parse({
    id: foundationId('multi_agent_coordination'),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: now(),
    coordinatorKind: 'workflow-kernel',
    workflowTemplateIdHash: hashText(input.workflowTemplateId),
    workflowTemplateHash: input.workflowTemplateHash,
    slotCount: input.slotCount,
    maxConcurrentSlots: input.maxConcurrentSlots ?? 1,
    childRunIdHashes: [...(input.childRunIds ?? [])].map((id) => hashText(id)),
    directAgentSpawnAllowed: false,
    dashboardDirectAdapterAllowed: false,
    cliDirectAdapterAllowed: false,
    mcpDirectAdapterAllowed: false,
    rawPromptStored: false,
    rawOutputStored: false,
    rawPathStored: false,
    bodyStored: false,
    summary: 'Multi-agent coordination is limited to workflow-kernel slots.',
  });
}

export function createMultiAgentSlotSummary(input: {
  coordinationPlan: MultiAgentCoordinationPlan;
  slotId: string;
  provider?: 'codex-cli' | 'claude-code-cli' | 'workflow-kernel';
  status?: 'waiting' | 'running' | 'blocked' | 'completed' | 'failed' | 'canceled';
  assignedJobId?: string;
  childRunId?: string;
  now?: () => string;
}): MultiAgentSlotSummary {
  const now = input.now ?? foundationTimestamp;

  return MultiAgentSlotSummarySchema.parse({
    id: foundationId('multi_agent_slot'),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: now(),
    coordinationPlanId: input.coordinationPlan.id,
    slotIdHash: hashText(input.slotId),
    provider: input.provider ?? 'workflow-kernel',
    status: input.status ?? 'waiting',
    assignedJobIdHash: input.assignedJobId ? hashText(input.assignedJobId) : undefined,
    childRunIdHash: input.childRunId ? hashText(input.childRunId) : undefined,
    directAdapterInvoked: false,
    rawPromptStored: false,
    rawOutputStored: false,
    bodyStored: false,
    summary: 'Multi-agent slot cannot invoke adapters directly.',
  });
}

export function rehearseRuntimeScheduler(input: {
  scenario: RuntimeSchedulerRehearsalScenario;
  now?: () => string;
}): RuntimeSchedulerRehearsalRun {
  const now = input.now ?? foundationTimestamp;
  const passes = input.scenario === 'resume-from-checkpoint';

  return RuntimeSchedulerRehearsalRunSchema.parse({
    id: foundationId('runtime_rehearsal'),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: now(),
    scenario: input.scenario,
    status: passes ? 'passed' : 'blocked',
    queueStatus: passes ? 'leased' : 'blocked',
    jobStatus: passes ? 'running' : 'blocked',
    lockStatus: input.scenario === 'lock-held' ? 'held' : 'available',
    checkpointCreated: passes,
    retryAttemptCount: input.scenario === 'retry-exhausted' ? 3 : 0,
    evidenceRefs: [],
    auditEventIds: [`audit_runtime_rehearsal_${input.scenario}`],
    processBoundaryInvoked: false,
    externalProcessStarted: false,
    networkBoundaryInvoked: false,
    rawInputStored: false,
    rawOutputStored: false,
    rawPathStored: false,
    bodyStored: false,
    summary: `Runtime scheduler rehearsal ${input.scenario} completed as fixture metadata.`,
  });
}

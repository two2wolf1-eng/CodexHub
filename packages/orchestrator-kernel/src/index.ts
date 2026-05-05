import {
  type AgentRun,
  type AuditEvent,
  type DevelopmentRequest,
  type EvidenceRef,
  type OrchestrationPlan,
  type PatchRun,
  type PolicyDecision,
  type SkillResolutionResult,
  type TaskGraph,
  type VerificationRun,
  type MockDevelopmentRun,
  SchemaVersionSchema,
  foundationId,
  foundationTimestamp,
} from '@codexhub/contracts';
import { MetadataOnlyEvidenceCollector, hashText } from '@codexhub/evidence-kernel';
import { DefaultPolicyEngine, type PolicyEngine } from '@codexhub/security-kernel';
import { MockSkillRegistry, type SkillRegistry } from '@codexhub/skill-registry';
import type { CodexHubStore } from '@codexhub/store-core';
import {
  WorkflowRunner,
  createDevelopmentRequestWorkflowDefinition,
  createDevelopmentVerifyWorkflowDefinition,
  createMockWorkflowDefinition,
} from '@codexhub/workflow-kernel';

export * from './minimal-runner';
export * from './m6a-runner';
export * from './m6b-runner';
export * from './golden-path-rehearsal';
export * from './m10-pilot-acceptance-rehearsal';
export * from './m9-pilot-runner';
export * from './m11-pilot-runner';
export * from './m12-patch-lifecycle';
export * from './m20-rework-loop';

export interface MockDevelopmentOrchestrationInput {
  title: string;
  description: string;
  constraints?: string[];
  metadata?: Record<string, unknown>;
  skillRegistry?: SkillRegistry;
  policyEngine?: PolicyEngine;
  store?: CodexHubStore;
}

export interface MockDevelopmentOrchestrationResult {
  id: MockDevelopmentRun['id'];
  schemaVersion: MockDevelopmentRun['schemaVersion'];
  createdAt: MockDevelopmentRun['createdAt'];
  request: MockDevelopmentRun['request'];
  taskGraph: MockDevelopmentRun['taskGraph'];
  skillResolution: MockDevelopmentRun['skillResolution'];
  agentRuns: MockDevelopmentRun['agentRuns'];
  verificationRun: MockDevelopmentRun['verificationRun'];
  evidenceRefs: MockDevelopmentRun['evidenceRefs'];
  auditEvents: MockDevelopmentRun['auditEvents'];
  summary: MockDevelopmentRun['summary'];
  metadata?: MockDevelopmentRun['metadata'];
}

export type GovernedControlPlaneHandoffStatus = 'blocked' | 'ready_for_control_plane';

export interface GovernedInputReference {
  relativePath?: string;
  contentHash?: string;
}

export interface GovernedControlPlaneHandoffInput {
  dryRunId?: string;
  approvalArtifactId?: string;
  worktreePath?: string;
  governedInput?: GovernedInputReference;
}

export interface GovernedControlPlaneHandoffRequest {
  requestId: string;
  taskGraphId: string;
  dryRunId?: string;
  approvalArtifactId?: string;
  worktreePath?: string;
  governedInput?: GovernedInputReference;
}

export interface GovernedControlPlaneHandoffResult {
  id: string;
  schemaVersion: string;
  createdAt: string;
  status: GovernedControlPlaneHandoffStatus;
  reasonCodes: string[];
  dryRunId?: string;
  approvalArtifactId?: string;
  worktreePathHash?: string;
  governedInputRelativePathHash?: string;
  governedInputContentHash?: string;
  metadataOnly: true;
  bodyStored: false;
  promptBodyStored: false;
  commandBodyStored: false;
  rawPathStored: false;
  liveExecution: false;
  externalProcessStarted: false;
  executionDisabled: true;
  delegatedToSupervisor: true;
}

export interface GovernedControlPlaneRunner {
  prepareHandoff(
    input: GovernedControlPlaneHandoffRequest,
  ): Promise<GovernedControlPlaneHandoffResult>;
}

export interface GovernedDevelopmentOrchestrationInput
  extends Pick<
    MockDevelopmentOrchestrationInput,
    'title' | 'description' | 'constraints' | 'metadata' | 'skillRegistry' | 'policyEngine' | 'store'
  > {
  handoff?: GovernedControlPlaneHandoffInput;
  controlPlaneRunner?: GovernedControlPlaneRunner;
}

export interface GovernedDevelopmentOrchestrationSummary {
  requestTitle: string;
  taskCount: number;
  selectedSkillIds: string[];
  agentRunCount: number;
  patchRunCount: number;
  verificationStatus: VerificationRun['status'];
  evidenceCount: number;
  auditEventCount: number;
  orchestrationPlanId: string;
  handoffStatus: GovernedControlPlaneHandoffStatus;
  blockedReasonCodes: string[];
  controlPlaneReady: boolean;
  mockOnly: false;
  runnerMode: 'governed_control_plane_handoff';
  liveExecution: false;
  externalProcessStarted: false;
  executionDisabled: true;
}

export interface GovernedDevelopmentOrchestrationResult {
  id: string;
  schemaVersion: string;
  createdAt: string;
  request: DevelopmentRequest;
  taskGraph: TaskGraph;
  skillResolution: SkillResolutionResult;
  orchestrationPlan: OrchestrationPlan;
  handoff: GovernedControlPlaneHandoffResult;
  policyDecisions: PolicyDecision[];
  agentRuns: AgentRun[];
  patchRuns: PatchRun[];
  verificationRun: VerificationRun;
  evidenceRefs: EvidenceRef[];
  auditEvents: AuditEvent[];
  summary: GovernedDevelopmentOrchestrationSummary;
  metadata?: Record<string, unknown>;
}

export interface PlanningResult {
  request: DevelopmentRequest;
  taskGraph: TaskGraph;
  skillResolution: SkillResolutionResult;
  policyDecision: ReturnType<PolicyEngine['evaluateAction']>;
  workflowName: string;
}

export interface DevelopmentPlanner {
  plan(request: DevelopmentRequest): Promise<PlanningResult>;
}

export interface MockDevelopmentPlannerOptions {
  skillRegistry?: SkillRegistry;
  policyEngine?: PolicyEngine;
}

export class MockDevelopmentPlanner implements DevelopmentPlanner {
  private readonly skillRegistry: SkillRegistry;
  private readonly policyEngine: PolicyEngine;

  constructor(options: MockDevelopmentPlannerOptions = {}) {
    this.skillRegistry = options.skillRegistry ?? new MockSkillRegistry();
    this.policyEngine = options.policyEngine ?? new DefaultPolicyEngine();
  }

  async plan(request: DevelopmentRequest): Promise<PlanningResult> {
    const taskGraph = createTaskGraph(request);
    const skillResolution = await resolveSkillsForTaskGraph(taskGraph, this.skillRegistry);
    const workflow = createMockWorkflowDefinition('development.bootstrap');
    const policyDecision = this.policyEngine.evaluateAction({
      actionId: taskGraph.id,
      actionType: 'orchestrator.plan.read',
      actionMode: 'read',
      riskLevel: 'low',
      dryRun: true,
    });

    return {
      request,
      taskGraph,
      skillResolution,
      policyDecision,
      workflowName: workflow.name,
    };
  }
}

export class MetadataOnlyGovernedControlPlaneRunner implements GovernedControlPlaneRunner {
  async prepareHandoff(
    input: GovernedControlPlaneHandoffRequest,
  ): Promise<GovernedControlPlaneHandoffResult> {
    const reasonCodes = collectGovernedHandoffBlockers(input);
    const relativePath = input.governedInput?.relativePath?.trim();

    return {
      id: foundationId('orchestrator_control_plane_handoff'),
      schemaVersion: SchemaVersionSchema.value,
      createdAt: foundationTimestamp(),
      status: reasonCodes.length === 0 ? 'ready_for_control_plane' : 'blocked',
      reasonCodes,
      dryRunId: input.dryRunId,
      approvalArtifactId: input.approvalArtifactId,
      worktreePathHash: input.worktreePath ? hashMetadataValue(input.worktreePath) : undefined,
      governedInputRelativePathHash: relativePath ? hashMetadataValue(relativePath) : undefined,
      governedInputContentHash: input.governedInput?.contentHash,
      metadataOnly: true,
      bodyStored: false,
      promptBodyStored: false,
      commandBodyStored: false,
      rawPathStored: false,
      liveExecution: false,
      externalProcessStarted: false,
      executionDisabled: true,
      delegatedToSupervisor: true,
    };
  }
}

export function createDevelopmentRequest(
  input: Pick<MockDevelopmentOrchestrationInput, 'title' | 'description' | 'constraints' | 'metadata'>,
): DevelopmentRequest {
  return {
    id: foundationId('development_request'),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: foundationTimestamp(),
    title: input.title,
    description: input.description,
    constraints: input.constraints ?? ['foundation-only', 'mock-only', 'dry-run-first'],
    metadata: { ...(input.metadata ?? {}), mock: true },
  };
}

export function createTaskGraph(request: DevelopmentRequest): TaskGraph {
  const now = foundationTimestamp();
  const requestKeywords = extractKeywords(`${request.title} ${request.description}`);

  return {
    id: foundationId('task_graph'),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: now,
    requestId: request.id,
    tasks: [
      {
        id: foundationId('task'),
        schemaVersion: SchemaVersionSchema.value,
        createdAt: now,
        title: 'Plan architecture and contracts',
        description: 'Mock plan for interfaces, contracts, and package boundaries.',
        dependsOn: [],
        assignedCapability: 'architecture.planning',
        keywords: [...requestKeywords, 'architecture', 'interface', 'interfaces', 'contract', 'schema'],
        riskLevel: 'low',
        metadata: { mock: true },
      },
      {
        id: foundationId('task'),
        schemaVersion: SchemaVersionSchema.value,
        createdAt: now,
        title: 'Review workflow policy',
        description: 'Mock review for dry-run, policy, approval, evidence, and audit flow.',
        dependsOn: [],
        assignedCapability: 'workflow.policy',
        keywords: [...requestKeywords, 'workflow', 'policy'],
        riskLevel: 'medium',
        metadata: { mock: true },
      },
      {
        id: foundationId('task'),
        schemaVersion: SchemaVersionSchema.value,
        createdAt: now,
        title: 'Verify read-only observer skeletons',
        description: 'Mock verification for Electron CDP and browser profile observer placeholders.',
        dependsOn: [],
        assignedCapability: 'electron.observe',
        keywords: [...requestKeywords, 'electron', 'cdp', 'observation', 'read', 'only'],
        riskLevel: 'high',
        metadata: { mock: true, readOnly: true },
      },
    ],
    metadata: {
      mock: true,
      requestTitle: request.title,
      requestDescription: request.description,
      requestKeywords,
    },
  };
}

export function createGovernedTaskGraph(request: DevelopmentRequest): TaskGraph {
  const now = foundationTimestamp();
  const requestKeywords = extractKeywords(`${request.title} ${request.description}`);

  return {
    id: foundationId('task_graph'),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: now,
    requestId: request.id,
    tasks: [
      {
        id: foundationId('task'),
        schemaVersion: SchemaVersionSchema.value,
        createdAt: now,
        title: 'Resolve governed Codex control-plane input',
        description:
          'Validate that an existing dry-run, approval artifact, isolated worktree, and governed input reference are present before handoff.',
        dependsOn: [],
        assignedCapability: 'codex.adapter.control_plane',
        keywords: [...requestKeywords, 'codex', 'adapter', 'control', 'plane', 'dry', 'run'],
        riskLevel: 'high',
        metadata: { governed: true, metadataOnly: true },
      },
      {
        id: foundationId('task'),
        schemaVersion: SchemaVersionSchema.value,
        createdAt: now,
        title: 'Assemble policy and audit handoff',
        description:
          'Create metadata-only policy, evidence, and audit records for the Supervisor-owned execution boundary.',
        dependsOn: [],
        assignedCapability: 'workflow.policy',
        keywords: [...requestKeywords, 'workflow', 'policy', 'approval', 'evidence', 'audit'],
        riskLevel: 'medium',
        metadata: { governed: true, delegatedToSupervisor: true },
      },
      {
        id: foundationId('task'),
        schemaVersion: SchemaVersionSchema.value,
        createdAt: now,
        title: 'Plan affected verification',
        description:
          'Record the verification commands that must run after a future patch, without executing them in this handoff step.',
        dependsOn: [],
        assignedCapability: 'architecture.planning',
        keywords: [...requestKeywords, 'verification', 'affected', 'lint', 'test', 'build'],
        riskLevel: 'low',
        metadata: { governed: true, noCommandsExecuted: true },
      },
    ],
    metadata: {
      governed: true,
      requestTitle: request.title,
      requestDescription: request.description,
      requestKeywords,
    },
  };
}

export async function resolveSkillsForTaskGraph(
  taskGraph: TaskGraph,
  skillRegistry: SkillRegistry = new MockSkillRegistry(),
): Promise<SkillResolutionResult> {
  const requestedCapabilities = Array.from(
    new Set(taskGraph.tasks.map((task) => task.assignedCapability).filter(isDefined)),
  );
  const taskKeywords = Array.from(new Set(taskGraph.tasks.flatMap((task) => task.keywords)));
  const requestText = [taskGraph.metadata?.requestTitle, taskGraph.metadata?.requestDescription]
    .filter((value): value is string => typeof value === 'string' && value.length > 0)
    .join('\n');

  return skillRegistry.resolve({
    requestText: requestText || `task graph ${taskGraph.id}`,
    requestedCapabilities,
    taskKeywords,
    metadata: { taskGraphId: taskGraph.id, mock: true },
  });
}

export function createMockAgentRuns(
  taskGraph: TaskGraph,
  skillResolution: SkillResolutionResult,
): AgentRun[] {
  return taskGraph.tasks.map((task, index) => {
    const skill =
      skillResolution.selectedSkills.find((candidate) =>
        candidate.skill.capabilities.some((capability) => capability.id === task.assignedCapability),
      ) ?? skillResolution.selectedSkills[index % Math.max(skillResolution.selectedSkills.length, 1)];

    return {
      id: foundationId('agent_run'),
      schemaVersion: SchemaVersionSchema.value,
      createdAt: foundationTimestamp(),
      taskId: task.id,
      agentId: skill?.skillId ?? 'codexhub-mock-agent',
      status: 'completed',
      events: [
        `mock agent planned task "${task.title}"`,
        'mock execution completed without external process or workspace write',
      ],
      evidenceRefs: [],
      metadata: {
        mock: true,
        taskTitle: task.title,
        selectedSkillId: skill?.skillId,
        noExternalProcess: true,
      },
    };
  });
}

export function createMockVerificationRun(
  taskGraph: TaskGraph,
  agentRuns: AgentRun[],
): VerificationRun {
  return {
    id: foundationId('verification_run'),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: foundationTimestamp(),
    targetId: taskGraph.id,
    status: 'passed',
    checks: [
      'mock contracts check',
      'mock policy check',
      `mock agent run count ${agentRuns.length}`,
      'mock lint/test/build planned',
    ],
    evidenceRefs: [],
    metadata: { mock: true, noCommandsExecuted: true },
  };
}

export async function createMockEvidenceRefs(
  agentRuns: AgentRun[],
  verificationRun: VerificationRun,
): Promise<EvidenceRef[]> {
  const collector = new MetadataOnlyEvidenceCollector();
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
  const agentEvidence = await Promise.all(
    agentRuns.map((agentRun) =>
      collector.collect({
        kind: 'hash',
        label: `agent-run:${agentRun.id}`,
        summary: `Mock evidence for ${agentRun.agentId}`,
        expiresAt,
        metadata: {
          agentRunId: agentRun.id,
          agentId: agentRun.agentId,
          taskId: agentRun.taskId,
          status: agentRun.status,
          eventCount: agentRun.events.length,
        },
        bodyForHashOnly: JSON.stringify({
          agentRunId: agentRun.id,
          status: agentRun.status,
          eventCount: agentRun.events.length,
        }),
      }),
    ),
  );
  const verificationEvidence = await collector.collect({
    kind: 'hash',
    label: `verification-run:${verificationRun.id}`,
    summary: 'Mock verification evidence',
    expiresAt,
    metadata: {
      verificationRunId: verificationRun.id,
      status: verificationRun.status,
      checkCount: verificationRun.checks.length,
    },
    bodyForHashOnly: JSON.stringify({
      verificationRunId: verificationRun.id,
      status: verificationRun.status,
      checkCount: verificationRun.checks.length,
    }),
  });

  return [...agentEvidence, verificationEvidence];
}

export function createMockAuditEvents(
  request: DevelopmentRequest,
  taskGraph: TaskGraph,
  agentRuns: AgentRun[],
  verificationRun: VerificationRun,
  evidenceRefs: EvidenceRef[],
  policyEngine: PolicyEngine = new DefaultPolicyEngine(),
): AuditEvent[] {
  const now = foundationTimestamp();
  const planPolicyDecision = policyEngine.evaluateAction({
    actionId: taskGraph.id,
    actionType: 'development.orchestration.mock',
    actionMode: 'read',
    riskLevel: 'low',
    dryRun: true,
  });
  const verifyPolicyDecision = policyEngine.evaluateAction({
    actionId: verificationRun.id,
    actionType: 'development.verify.mock',
    actionMode: 'read',
    riskLevel: 'low',
    dryRun: true,
  });

  return [
    {
      id: foundationId('audit'),
      schemaVersion: SchemaVersionSchema.value,
      createdAt: now,
      actor: 'orchestrator-kernel.mock',
      action: 'development.request.created',
      outcome: 'created',
      evidenceRefs: [],
      metadata: { mock: true, requestId: request.id, title: request.title },
    },
    {
      id: foundationId('audit'),
      schemaVersion: SchemaVersionSchema.value,
      createdAt: now,
      actor: 'orchestrator-kernel.mock',
      action: 'task_graph.created',
      outcome: planPolicyDecision.outcome,
      policyDecisionId: planPolicyDecision.id,
      evidenceRefs: evidenceRefs.slice(0, 1),
      metadata: { mock: true, taskGraphId: taskGraph.id, taskCount: taskGraph.tasks.length },
    },
    ...agentRuns.map((agentRun, index): AuditEvent => {
      const evidenceRef = evidenceRefs[index];

      return {
        id: foundationId('audit'),
        schemaVersion: SchemaVersionSchema.value,
        createdAt: now,
        actor: agentRun.agentId,
        action: 'agent_run.mock.completed',
        outcome: agentRun.status,
        evidenceRefs: evidenceRef ? [evidenceRef] : [],
        metadata: { mock: true, agentRunId: agentRun.id, taskId: agentRun.taskId },
      };
    }),
    {
      id: foundationId('audit'),
      schemaVersion: SchemaVersionSchema.value,
      createdAt: now,
      actor: 'orchestrator-kernel.mock',
      action: 'verification_run.mock.completed',
      outcome: verificationRun.status,
      policyDecisionId: verifyPolicyDecision.id,
      evidenceRefs: evidenceRefs.slice(-1),
      metadata: { mock: true, verificationRunId: verificationRun.id },
    },
  ];
}

export async function runMockDevelopmentOrchestration(
  input: MockDevelopmentOrchestrationInput,
): Promise<MockDevelopmentOrchestrationResult> {
  const request = createDevelopmentRequest(input);
  const taskGraph = createTaskGraph(request);
  const skillResolution = await resolveSkillsForTaskGraph(
    taskGraph,
    input.skillRegistry ?? new MockSkillRegistry(),
  );
  const orchestrationPlan = createOrchestrationPlan(request, taskGraph, skillResolution);
  const agentRuns = createMockAgentRuns(taskGraph, skillResolution);
  const verificationRun = createMockVerificationRun(taskGraph, agentRuns);
  const evidenceRefs = await createMockEvidenceRefs(agentRuns, verificationRun);
  const agentRunsWithEvidence = agentRuns.map((agentRun, index) => ({
    ...agentRun,
    evidenceRefs: evidenceRefs[index] ? [evidenceRefs[index]] : [],
  }));
  const verificationRunWithEvidence = {
    ...verificationRun,
    evidenceRefs: evidenceRefs.slice(-1),
  };
  const auditEvents = createMockAuditEvents(
    request,
    taskGraph,
    agentRunsWithEvidence,
    verificationRunWithEvidence,
    evidenceRefs,
    input.policyEngine,
  );

  const result: MockDevelopmentOrchestrationResult = {
    id: foundationId('development_run'),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: foundationTimestamp(),
    request,
    taskGraph,
    skillResolution,
    agentRuns: agentRunsWithEvidence,
    verificationRun: verificationRunWithEvidence,
    evidenceRefs,
    auditEvents,
    summary: {
      requestTitle: request.title,
      taskCount: taskGraph.tasks.length,
      selectedSkillIds: skillResolution.selectedSkills.map((selection) => selection.skillId),
      agentRunCount: agentRunsWithEvidence.length,
      verificationStatus: verificationRunWithEvidence.status,
      evidenceCount: evidenceRefs.length,
      auditEventCount: auditEvents.length,
      orchestrationPlanId: orchestrationPlan.id,
      mockOnly: true,
    },
    metadata: { mock: true, persistence: input.store ? 'store-core' : 'not-requested' },
  };

  await persistMockArtifacts(input.store, result, evidenceRefs, auditEvents);
  await persistMockWorkflowRuns(input.store);

  return result;
}

export async function runGovernedDevelopmentOrchestration(
  input: GovernedDevelopmentOrchestrationInput,
): Promise<GovernedDevelopmentOrchestrationResult> {
  const policyEngine = input.policyEngine ?? new DefaultPolicyEngine();
  const controlPlaneRunner =
    input.controlPlaneRunner ?? new MetadataOnlyGovernedControlPlaneRunner();
  const request = createDevelopmentRequest({
    title: input.title,
    description: input.description,
    constraints: input.constraints ?? [
      'governed-input-required',
      'dry-run-first',
      'approval-required',
      'metadata-only-evidence',
      'supervisor-owned-boundary',
    ],
    metadata: { ...(input.metadata ?? {}), governed: true, mock: false },
  });
  const taskGraph = createGovernedTaskGraph(request);
  const skillResolution = await resolveSkillsForTaskGraph(
    taskGraph,
    input.skillRegistry ?? new MockSkillRegistry(),
  );
  const orchestrationPlan = createGovernedOrchestrationPlan(
    request,
    taskGraph,
    skillResolution,
  );
  const handoff = await controlPlaneRunner.prepareHandoff({
    requestId: request.id,
    taskGraphId: taskGraph.id,
    dryRunId: input.handoff?.dryRunId,
    approvalArtifactId: input.handoff?.approvalArtifactId,
    worktreePath: input.handoff?.worktreePath,
    governedInput: input.handoff?.governedInput,
  });
  const policyDecisions = createGovernedPolicyDecisions(taskGraph, handoff, policyEngine);
  const agentRuns = createGovernedAgentRuns(taskGraph, skillResolution, handoff);
  const patchRuns = createGovernedPatchRuns(taskGraph);
  const verificationRun = createGovernedVerificationRun(taskGraph, handoff);
  const evidenceRefs = await createGovernedEvidenceRefs({
    handoff,
    agentRuns,
    patchRuns,
    verificationRun,
  });
  const agentRunsWithEvidence = agentRuns.map((agentRun, index) => ({
    ...agentRun,
    evidenceRefs: evidenceRefs[index] ? [evidenceRefs[index]] : [],
  }));
  const patchEvidenceStartIndex = agentRuns.length;
  const patchRunsWithEvidence = patchRuns.map((patchRun, index) => ({
    ...patchRun,
    evidenceRefs: evidenceRefs[patchEvidenceStartIndex + index]
      ? [evidenceRefs[patchEvidenceStartIndex + index]]
      : [],
  }));
  const verificationRunWithEvidence = {
    ...verificationRun,
    evidenceRefs: evidenceRefs.slice(-1),
  };
  const auditEvents = createGovernedAuditEvents({
    request,
    taskGraph,
    handoff,
    policyDecisions,
    agentRuns: agentRunsWithEvidence,
    patchRuns: patchRunsWithEvidence,
    verificationRun: verificationRunWithEvidence,
    evidenceRefs,
  });

  return {
    id: foundationId('development_run'),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: foundationTimestamp(),
    request,
    taskGraph,
    skillResolution,
    orchestrationPlan,
    handoff,
    policyDecisions,
    agentRuns: agentRunsWithEvidence,
    patchRuns: patchRunsWithEvidence,
    verificationRun: verificationRunWithEvidence,
    evidenceRefs,
    auditEvents,
    summary: {
      requestTitle: request.title,
      taskCount: taskGraph.tasks.length,
      selectedSkillIds: skillResolution.selectedSkills.map((selection) => selection.skillId),
      agentRunCount: agentRunsWithEvidence.length,
      patchRunCount: patchRunsWithEvidence.length,
      verificationStatus: verificationRunWithEvidence.status,
      evidenceCount: evidenceRefs.length,
      auditEventCount: auditEvents.length,
      orchestrationPlanId: orchestrationPlan.id,
      handoffStatus: handoff.status,
      blockedReasonCodes: handoff.reasonCodes,
      controlPlaneReady: handoff.status === 'ready_for_control_plane',
      mockOnly: false,
      runnerMode: 'governed_control_plane_handoff',
      liveExecution: false,
      externalProcessStarted: false,
      executionDisabled: true,
    },
    metadata: {
      governed: true,
      persistence: input.store ? 'store-core-not-supported-for-governed-runner-yet' : 'not-requested',
      liveExecution: false,
      externalProcessStarted: false,
      executionDisabled: true,
    },
  };
}

export function createMockTaskGraph(
  request: DevelopmentRequest,
  _skillResolution?: SkillResolutionResult,
): TaskGraph {
  return createTaskGraph(request);
}

function createOrchestrationPlan(
  request: DevelopmentRequest,
  taskGraph: TaskGraph,
  skillResolution: SkillResolutionResult,
): {
  id: string;
  schemaVersion: string;
  createdAt: string;
  requestId: string;
  taskGraphId: string;
  skillResolutionId: string;
  workflowNames: string[];
  summary: string;
  metadata: Record<string, unknown>;
} {
  return {
    id: foundationId('orchestration_plan'),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: foundationTimestamp(),
    requestId: request.id,
    taskGraphId: taskGraph.id,
    skillResolutionId: skillResolution.id,
    workflowNames: ['development.request', 'development.verify'],
    summary: `Mock plan for ${request.title}`,
    metadata: { mock: true },
  };
}

function createGovernedOrchestrationPlan(
  request: DevelopmentRequest,
  taskGraph: TaskGraph,
  skillResolution: SkillResolutionResult,
): OrchestrationPlan {
  return {
    id: foundationId('orchestration_plan'),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: foundationTimestamp(),
    requestId: request.id,
    taskGraphId: taskGraph.id,
    skillResolutionId: skillResolution.id,
    workflowNames: ['development.request', 'codex.control_plane.handoff', 'development.verify'],
    summary: `Governed control-plane handoff plan for ${request.title}`,
    metadata: {
      governed: true,
      metadataOnly: true,
      delegatedToSupervisor: true,
      liveExecution: false,
      externalProcessStarted: false,
      executionDisabled: true,
    },
  };
}

function createGovernedPolicyDecisions(
  taskGraph: TaskGraph,
  handoff: GovernedControlPlaneHandoffResult,
  policyEngine: PolicyEngine,
): PolicyDecision[] {
  return taskGraph.tasks.map((task) =>
    policyEngine.evaluateAction({
      actionId: task.id,
      actionType:
        task.assignedCapability === 'codex.adapter.control_plane'
          ? 'orchestrator.codex_control_plane.handoff'
          : `orchestrator.${task.assignedCapability ?? 'task'}.read`,
      actionMode: 'read',
      riskLevel: task.riskLevel,
      dryRun: true,
      approvalGranted: handoff.approvalArtifactId !== undefined,
      metadata: {
        governed: true,
        delegatedToSupervisor: true,
        handoffStatus: handoff.status,
        liveExecution: false,
        externalProcessStarted: false,
        executionDisabled: true,
      },
    }),
  );
}

function createGovernedAgentRuns(
  taskGraph: TaskGraph,
  skillResolution: SkillResolutionResult,
  handoff: GovernedControlPlaneHandoffResult,
): AgentRun[] {
  return taskGraph.tasks.map((task, index) => {
    const skill =
      skillResolution.selectedSkills.find((candidate) =>
        candidate.skill.capabilities.some((capability) => capability.id === task.assignedCapability),
      ) ?? skillResolution.selectedSkills[index % Math.max(skillResolution.selectedSkills.length, 1)];
    const status: AgentRun['status'] =
      handoff.status === 'ready_for_control_plane' ? 'planned' : 'failed';

    return {
      id: foundationId('agent_run'),
      schemaVersion: SchemaVersionSchema.value,
      createdAt: foundationTimestamp(),
      taskId: task.id,
      agentId: skill?.skillId ?? 'codexhub-governed-runner',
      status,
      events:
        handoff.status === 'ready_for_control_plane'
          ? [
              'governed control-plane handoff prepared',
              'orchestrator did not start an external process',
            ]
          : [
              'governed control-plane handoff blocked',
              `blocked reason count ${handoff.reasonCodes.length}`,
            ],
      evidenceRefs: [],
      metadata: {
        governed: true,
        taskTitle: task.title,
        selectedSkillId: skill?.skillId,
        handoffStatus: handoff.status,
        liveExecution: false,
        externalProcessStarted: false,
        executionDisabled: true,
      },
    };
  });
}

function createGovernedPatchRuns(taskGraph: TaskGraph): PatchRun[] {
  const patchTask = taskGraph.tasks.find((task) => task.title.includes('affected verification'));

  return [
    {
      id: foundationId('patch_run'),
      schemaVersion: SchemaVersionSchema.value,
      createdAt: foundationTimestamp(),
      taskId: patchTask?.id ?? taskGraph.tasks[0]?.id ?? taskGraph.id,
      status: 'planned',
      changedFiles: [],
      evidenceRefs: [],
      auditEventIds: [],
      noRealWrite: true,
      bodyStored: false,
      rawPathStored: false,
      summary: 'Governed patch run is planned only.',
      metadata: {
        governed: true,
        patchGenerated: false,
        noWorkspaceWrite: true,
      },
    },
  ];
}

function createGovernedVerificationRun(
  taskGraph: TaskGraph,
  handoff: GovernedControlPlaneHandoffResult,
): VerificationRun {
  return {
    id: foundationId('verification_run'),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: foundationTimestamp(),
    targetId: taskGraph.id,
    status: handoff.status === 'ready_for_control_plane' ? 'planned' : 'failed',
    checks:
      handoff.status === 'ready_for_control_plane'
        ? [
            'supervisor dry-run id provided',
            'approval artifact id provided',
            'governed input content hash provided',
            'affected lint/test/build planned',
          ]
        : [
            'governed handoff blocked before verification planning',
            `blocked reasons: ${handoff.reasonCodes.join(',')}`,
          ],
    evidenceRefs: [],
    metadata: {
      governed: true,
      noCommandsExecuted: true,
      handoffStatus: handoff.status,
    },
  };
}

async function createGovernedEvidenceRefs(input: {
  handoff: GovernedControlPlaneHandoffResult;
  agentRuns: AgentRun[];
  patchRuns: PatchRun[];
  verificationRun: VerificationRun;
}): Promise<EvidenceRef[]> {
  const collector = new MetadataOnlyEvidenceCollector();
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
  const agentEvidence = await Promise.all(
    input.agentRuns.map((agentRun) =>
      collector.collect({
        kind: 'hash',
        label: `orchestrator-governed-agent-run:${agentRun.id}`,
        summary: `Governed evidence for ${agentRun.agentId}`,
        expiresAt,
        metadata: {
          agentRunId: agentRun.id,
          agentId: agentRun.agentId,
          taskId: agentRun.taskId,
          status: agentRun.status,
          handoffStatus: input.handoff.status,
          liveExecution: false,
          externalProcessStarted: false,
          executionDisabled: true,
        },
        bodyForHashOnly: JSON.stringify({
          agentRunId: agentRun.id,
          status: agentRun.status,
          handoffStatus: input.handoff.status,
        }),
      }),
    ),
  );
  const patchEvidence = await Promise.all(
    input.patchRuns.map((patchRun) =>
      collector.collect({
        kind: 'hash',
        label: `orchestrator-governed-patch-run:${patchRun.id}`,
        summary: 'Governed patch planning evidence',
        expiresAt,
        metadata: {
          patchRunId: patchRun.id,
          status: patchRun.status,
          patchGenerated: false,
          noWorkspaceWrite: true,
        },
        bodyForHashOnly: JSON.stringify({
          patchRunId: patchRun.id,
          status: patchRun.status,
        }),
      }),
    ),
  );
  const verificationEvidence = await collector.collect({
    kind: 'hash',
    label: `orchestrator-governed-verification:${input.verificationRun.id}`,
    summary: 'Governed verification planning evidence',
    expiresAt,
    metadata: {
      verificationRunId: input.verificationRun.id,
      status: input.verificationRun.status,
      checkCount: input.verificationRun.checks.length,
      handoffStatus: input.handoff.status,
      handoffReasonCodes: input.handoff.reasonCodes,
      dryRunId: input.handoff.dryRunId,
      worktreePathHash: input.handoff.worktreePathHash,
      governedInputRelativePathHash: input.handoff.governedInputRelativePathHash,
      governedInputContentHash: input.handoff.governedInputContentHash,
    },
    bodyForHashOnly: JSON.stringify({
      verificationRunId: input.verificationRun.id,
      status: input.verificationRun.status,
      handoffStatus: input.handoff.status,
      handoffReasonCodes: input.handoff.reasonCodes,
    }),
  });

  return [...agentEvidence, ...patchEvidence, verificationEvidence];
}

function createGovernedAuditEvents(input: {
  request: DevelopmentRequest;
  taskGraph: TaskGraph;
  handoff: GovernedControlPlaneHandoffResult;
  policyDecisions: PolicyDecision[];
  agentRuns: AgentRun[];
  patchRuns: PatchRun[];
  verificationRun: VerificationRun;
  evidenceRefs: EvidenceRef[];
}): AuditEvent[] {
  const now = foundationTimestamp();

  return [
    {
      id: foundationId('audit'),
      schemaVersion: SchemaVersionSchema.value,
      createdAt: now,
      actor: 'orchestrator-kernel.governed',
      action: 'development.request.governed.created',
      outcome: 'created',
      evidenceRefs: [],
      metadata: {
        governed: true,
        requestId: input.request.id,
        taskGraphId: input.taskGraph.id,
        liveExecution: false,
        externalProcessStarted: false,
        executionDisabled: true,
      },
    },
    {
      id: foundationId('audit'),
      schemaVersion: SchemaVersionSchema.value,
      createdAt: now,
      actor: 'orchestrator-kernel.governed',
      action: 'codex.control_plane.handoff.prepared',
      outcome: input.handoff.status,
      policyDecisionId: input.policyDecisions[0]?.id,
      evidenceRefs: input.evidenceRefs.slice(0, 1),
      metadata: {
        governed: true,
        handoffId: input.handoff.id,
        reasonCodes: input.handoff.reasonCodes,
        delegatedToSupervisor: true,
        liveExecution: false,
        externalProcessStarted: false,
        executionDisabled: true,
      },
    },
    ...input.agentRuns.map((agentRun, index): AuditEvent => ({
      id: foundationId('audit'),
      schemaVersion: SchemaVersionSchema.value,
      createdAt: now,
      actor: agentRun.agentId,
      action: 'agent_run.governed.planned',
      outcome: agentRun.status,
      policyDecisionId: input.policyDecisions[index]?.id,
      evidenceRefs: agentRun.evidenceRefs,
      metadata: {
        governed: true,
        agentRunId: agentRun.id,
        taskId: agentRun.taskId,
        liveExecution: false,
        externalProcessStarted: false,
        executionDisabled: true,
      },
    })),
    ...input.patchRuns.map((patchRun): AuditEvent => ({
      id: foundationId('audit'),
      schemaVersion: SchemaVersionSchema.value,
      createdAt: now,
      actor: 'orchestrator-kernel.governed',
      action: 'patch_run.governed.planned',
      outcome: patchRun.status,
      evidenceRefs: patchRun.evidenceRefs,
      metadata: {
        governed: true,
        patchRunId: patchRun.id,
        noWorkspaceWrite: true,
        liveExecution: false,
        externalProcessStarted: false,
        executionDisabled: true,
      },
    })),
    {
      id: foundationId('audit'),
      schemaVersion: SchemaVersionSchema.value,
      createdAt: now,
      actor: 'orchestrator-kernel.governed',
      action: 'verification_run.governed.planned',
      outcome: input.verificationRun.status,
      evidenceRefs: input.verificationRun.evidenceRefs,
      metadata: {
        governed: true,
        verificationRunId: input.verificationRun.id,
        noCommandsExecuted: true,
        liveExecution: false,
        externalProcessStarted: false,
        executionDisabled: true,
      },
    },
  ];
}

function collectGovernedHandoffBlockers(input: GovernedControlPlaneHandoffRequest): string[] {
  const reasonCodes: string[] = [];

  if (!input.dryRunId || input.dryRunId.trim().length === 0) {
    reasonCodes.push('dry_run_id_required');
  }

  if (!input.approvalArtifactId || input.approvalArtifactId.trim().length === 0) {
    reasonCodes.push('approval_artifact_id_required');
  }

  if (!input.worktreePath || input.worktreePath.trim().length === 0) {
    reasonCodes.push('worktree_path_required');
  }

  if (
    !input.governedInput?.relativePath ||
    input.governedInput.relativePath.trim().length === 0
  ) {
    reasonCodes.push('governed_input_relative_path_required');
  }

  if (
    !input.governedInput?.contentHash ||
    input.governedInput.contentHash.trim().length === 0
  ) {
    reasonCodes.push('governed_input_content_hash_required');
  }

  return reasonCodes;
}

function hashMetadataValue(value: string): string {
  return `sha256:${hashText(value)}`;
}

async function persistMockArtifacts(
  store: CodexHubStore | undefined,
  result: MockDevelopmentOrchestrationResult,
  evidenceRefs: EvidenceRef[],
  auditEvents: AuditEvent[],
): Promise<void> {
  if (!store) {
    return;
  }

  for (const evidenceRef of evidenceRefs) {
    await store.evidenceRefs.create(evidenceRef);
  }

  for (const auditEvent of auditEvents) {
    await store.auditEvents.append(auditEvent);
  }

  await store.developmentRuns.saveMockDevelopmentRun(result);
}

async function persistMockWorkflowRuns(store: CodexHubStore | undefined): Promise<void> {
  if (!store) {
    return;
  }

  const runner = new WorkflowRunner({ store });
  const requestRun = await runner.createRun(createDevelopmentRequestWorkflowDefinition());
  await runner.completeRun(requestRun);
  const verifyRun = await runner.createRun(createDevelopmentVerifyWorkflowDefinition());
  await runner.completeRun(verifyRun);
}

function extractKeywords(text: string): string[] {
  return Array.from(
    new Set(
      text
        .toLowerCase()
        .split(/[^a-z0-9]+/)
        .filter((keyword) => keyword.length >= 3),
    ),
  );
}

function isDefined<T>(value: T | undefined): value is T {
  return value !== undefined;
}

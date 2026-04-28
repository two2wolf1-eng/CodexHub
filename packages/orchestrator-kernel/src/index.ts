import {
  type AgentRun,
  type AuditEvent,
  type DevelopmentRequest,
  type EvidenceRef,
  type SkillResolutionResult,
  type TaskGraph,
  type VerificationRun,
  type MockDevelopmentRun,
  SchemaVersionSchema,
  foundationId,
  foundationTimestamp,
} from '@codexhub/contracts';
import { MetadataOnlyEvidenceCollector } from '@codexhub/evidence-kernel';
import { DefaultPolicyEngine, type PolicyEngine } from '@codexhub/security-kernel';
import { MockSkillRegistry, type SkillRegistry } from '@codexhub/skill-registry';
import type { CodexHubStore } from '@codexhub/store-core';
import {
  WorkflowRunner,
  createDevelopmentRequestWorkflowDefinition,
  createDevelopmentVerifyWorkflowDefinition,
  createMockWorkflowDefinition,
} from '@codexhub/workflow-kernel';

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

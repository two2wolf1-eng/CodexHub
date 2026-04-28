import {
  type DevelopmentRequest,
  type PolicyDecision,
  type TaskGraph,
  SchemaVersionSchema,
  foundationId,
  foundationTimestamp,
} from '@codexhub/contracts';
import { DefaultPolicyEngine, type PolicyEngine } from '@codexhub/security-kernel';
import {
  MockSkillRegistry,
  type SkillRegistry,
  type SkillResolutionResult,
} from '@codexhub/skill-registry';
import { createMockWorkflowDefinition } from '@codexhub/workflow-kernel';

export interface PlanningResult {
  request: DevelopmentRequest;
  taskGraph: TaskGraph;
  skillResolution: SkillResolutionResult;
  policyDecision: PolicyDecision;
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
    const skillResolution = await this.skillRegistry.resolve({
      requestText: `${request.title}\n${request.description}`,
      requestedCapabilities: ['architecture.planning', 'contracts.design', 'workflow.policy'],
    });
    const taskGraph = createMockTaskGraph(request, skillResolution);
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

export function createMockTaskGraph(
  request: DevelopmentRequest,
  skillResolution: SkillResolutionResult,
): TaskGraph {
  const now = foundationTimestamp();
  const selectedCapability = skillResolution.selectedSkills[0]?.capabilities[0]?.id;

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
        title: 'Create foundation plan',
        description: 'Mock task for planning a foundation-only change.',
        dependsOn: [],
        assignedCapability: selectedCapability,
        metadata: { mock: true },
      },
      {
        id: foundationId('task'),
        schemaVersion: SchemaVersionSchema.value,
        createdAt: now,
        title: 'Verify foundation scaffold',
        description: 'Mock task for lint, test, build, and evidence collection.',
        dependsOn: [],
        assignedCapability: 'release.audit',
        metadata: { mock: true },
      },
    ],
    metadata: { mock: true },
  };
}


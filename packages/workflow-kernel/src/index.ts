import {
  type DryRunPlan,
  type WorkflowDefinition,
  type WorkflowRun,
  type WorkflowStep,
  SchemaVersionSchema,
  foundationId,
  foundationTimestamp,
} from '@codexhub/contracts';
import type { EvidenceCollector } from '@codexhub/evidence-kernel';
import {
  DefaultPolicyEngine,
  type PolicyEngine,
  type PolicyActionInput,
} from '@codexhub/security-kernel';
import type { CodexHubStore } from '@codexhub/store-core';

export interface WorkflowRunnerOptions {
  policyEngine?: PolicyEngine;
  evidenceCollector?: EvidenceCollector;
  store?: CodexHubStore;
}

export class WorkflowRunner {
  private readonly policyEngine: PolicyEngine;
  private readonly evidenceCollector?: EvidenceCollector;
  private readonly store?: CodexHubStore;

  constructor(options: WorkflowRunnerOptions = {}) {
    this.policyEngine = options.policyEngine ?? new DefaultPolicyEngine();
    this.evidenceCollector = options.evidenceCollector;
    this.store = options.store;
  }

  async dryRun(definition: WorkflowDefinition, input: Record<string, unknown> = {}): Promise<DryRunPlan> {
    const steps = definition.steps.map((step) => ({
      ...step,
      status: 'dry-run' as const,
      dryRunOnly: true,
    }));
    const policyDecisions = steps.map((step) => this.policyEngine.evaluateAction(toPolicyInput(step)));
    const evidenceRefs = this.evidenceCollector
      ? [
          await this.evidenceCollector.collect({
            kind: 'dry-run',
            label: `dry-run:${definition.name}`,
            metadata: { workflowName: definition.name, inputKeys: Object.keys(input) },
          }),
        ]
      : [];

    return {
      id: foundationId('dry_run'),
      schemaVersion: SchemaVersionSchema.value,
      createdAt: foundationTimestamp(),
      workflowName: definition.name,
      summary: `Dry-run plan for ${definition.name}; no actions executed.`,
      riskLevel: definition.riskLevel,
      steps,
      policyDecisions,
      evidenceRefs,
      metadata: { mock: true },
    };
  }

  async createRun(definition: WorkflowDefinition): Promise<WorkflowRun> {
    const run: WorkflowRun = {
      id: foundationId('workflow_run'),
      schemaVersion: SchemaVersionSchema.value,
      createdAt: foundationTimestamp(),
      workflowName: definition.name,
      status: 'created',
      dryRun: true,
      steps: [],
      evidenceRefs: [],
      metadata: { mock: true },
    };

    return this.store?.workflowRuns.create(run) ?? run;
  }

  async appendStep(run: WorkflowRun, step: WorkflowStep): Promise<WorkflowRun> {
    const updated: WorkflowRun = {
      ...run,
      steps: [...run.steps, step],
    };

    return this.store?.workflowRuns.update(updated) ?? updated;
  }

  async completeRun(run: WorkflowRun): Promise<WorkflowRun> {
    const updated: WorkflowRun = {
      ...run,
      status: 'completed',
    };

    return this.store?.workflowRuns.update(updated) ?? updated;
  }
}

export function createMockWorkflowDefinition(name = 'development.bootstrap'): WorkflowDefinition {
  const now = foundationTimestamp();

  return {
    id: foundationId('workflow_definition'),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: now,
    name,
    version: '0.1.0',
    description: 'Foundation-only mock workflow.',
    riskLevel: 'low',
    steps: [
      {
        id: foundationId('workflow_step'),
        schemaVersion: SchemaVersionSchema.value,
        createdAt: now,
        name: 'Plan foundation scaffold',
        actionType: 'development.plan.read',
        actionMode: 'read',
        riskLevel: 'low',
        status: 'pending',
        dryRunOnly: true,
        evidenceRefs: [],
        metadata: { mock: true },
      },
    ],
    metadata: { mock: true },
  };
}

function toPolicyInput(step: WorkflowStep): PolicyActionInput {
  return {
    actionId: step.id,
    actionType: step.actionType,
    actionMode: step.actionMode,
    riskLevel: step.riskLevel,
    dryRun: true,
    metadata: step.metadata,
  };
}


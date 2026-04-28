import {
  type DryRunPlan,
  type AuditEvent,
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
    const auditEvents = policyDecisions.map((decision): AuditEvent => {
      return {
        id: foundationId('audit'),
        schemaVersion: SchemaVersionSchema.value,
        createdAt: foundationTimestamp(),
        actor: 'workflow-kernel.mock',
        action: `dry-run:${decision.actionType}`,
        outcome: decision.outcome,
        policyDecisionId: decision.id,
        evidenceRefs,
        metadata: { mock: true, workflowName: definition.name },
      };
    });

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
      auditEvents,
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
  if (name === 'development.request') {
    return createDevelopmentRequestWorkflowDefinition();
  }

  if (name === 'development.verify') {
    return createDevelopmentVerifyWorkflowDefinition();
  }

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

export function createDevelopmentRequestWorkflowDefinition(): WorkflowDefinition {
  const now = foundationTimestamp();

  return {
    id: foundationId('workflow_definition'),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: now,
    name: 'development.request',
    version: '0.1.0',
    description: 'Mock-only development request planning workflow.',
    riskLevel: 'medium',
    steps: [
      {
        id: foundationId('workflow_step'),
        schemaVersion: SchemaVersionSchema.value,
        createdAt: now,
        name: 'Normalize development request',
        actionType: 'development.request.read',
        actionMode: 'read',
        riskLevel: 'low',
        status: 'pending',
        dryRunOnly: true,
        evidenceRefs: [],
        metadata: { mock: true },
      },
      {
        id: foundationId('workflow_step'),
        schemaVersion: SchemaVersionSchema.value,
        createdAt: now,
        name: 'Plan mock workspace patch',
        actionType: 'workspace.patch.write.mock',
        actionMode: 'write',
        riskLevel: 'medium',
        status: 'pending',
        dryRunOnly: true,
        evidenceRefs: [],
        metadata: { mock: true, noRealWrite: true },
      },
    ],
    metadata: { mock: true },
  };
}

export function createDevelopmentVerifyWorkflowDefinition(): WorkflowDefinition {
  const now = foundationTimestamp();

  return {
    id: foundationId('workflow_definition'),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: now,
    name: 'development.verify',
    version: '0.1.0',
    description: 'Mock-only verification workflow.',
    riskLevel: 'low',
    steps: [
      {
        id: foundationId('workflow_step'),
        schemaVersion: SchemaVersionSchema.value,
        createdAt: now,
        name: 'Run mock lint/test/build verification',
        actionType: 'development.verify.read',
        actionMode: 'read',
        riskLevel: 'low',
        status: 'pending',
        dryRunOnly: true,
        evidenceRefs: [],
        metadata: { mock: true },
      },
      {
        id: foundationId('workflow_step'),
        schemaVersion: SchemaVersionSchema.value,
        createdAt: now,
        name: 'Review browser and electron placeholders',
        actionType: 'browser.electron.observe.placeholder',
        actionMode: 'read',
        riskLevel: 'high',
        status: 'pending',
        dryRunOnly: true,
        evidenceRefs: [],
        metadata: { mock: true, noConnection: true },
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

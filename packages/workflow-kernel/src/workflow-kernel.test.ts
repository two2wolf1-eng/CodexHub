import { describe, expect, it } from 'vitest';
import { MetadataOnlyEvidenceCollector } from '@codexhub/evidence-kernel';
import {
  WorkflowRunner,
  createDevelopmentRequestWorkflowDefinition,
  createMockWorkflowDefinition,
} from './index';

describe('workflow-kernel dry-run', () => {
  it('creates a mock dry-run plan without executing actions', async () => {
    const runner = new WorkflowRunner({
      evidenceCollector: new MetadataOnlyEvidenceCollector(),
    });

    const plan = await runner.dryRun(createMockWorkflowDefinition(), { requestedBy: 'test' });

    expect(plan.workflowName).toBe('development.bootstrap');
    expect(plan.steps[0]?.status).toBe('dry-run');
    expect(plan.policyDecisions[0]?.outcome).toBe('allow');
    expect(plan.evidenceRefs).toHaveLength(1);
  });

  it('dry-runs development.request with policy decisions and audit events', async () => {
    const runner = new WorkflowRunner({
      evidenceCollector: new MetadataOnlyEvidenceCollector(),
    });
    const plan = await runner.dryRun(createDevelopmentRequestWorkflowDefinition(), {
      title: 'Mock request',
    });

    expect(plan.workflowName).toBe('development.request');
    expect(plan.steps.every((step) => step.dryRunOnly)).toBe(true);
    expect(plan.policyDecisions.length).toBe(plan.steps.length);
    expect(plan.auditEvents.length).toBe(plan.policyDecisions.length);
    expect(plan.steps.some((step) => step.actionMode === 'write' && step.riskLevel === 'medium')).toBe(
      true,
    );
  });
});

import { describe, expect, it } from 'vitest';
import { MetadataOnlyEvidenceCollector } from '@codexhub/evidence-kernel';
import { WorkflowRunner, createMockWorkflowDefinition } from './index';

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
});

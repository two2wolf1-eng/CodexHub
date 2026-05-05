import { describe, expect, it } from 'vitest';
import { MetadataOnlyEvidenceCollector } from '@codexhub/evidence-kernel';
import {
  WorkflowRunner,
  createCustomWorkflowApprovalRecord,
  createCustomWorkflowPlan,
  createCustomWorkflowTemplateFixture,
  createCustomWorkflowTemplateFromJson,
  createDevelopmentRequestWorkflowDefinition,
  createMockWorkflowDefinition,
  runCustomWorkflowCoordinator,
  runCustomWorkflowFixtureRehearsal,
  validateCustomWorkflowTemplateInput,
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

describe('workflow-kernel custom workflows', () => {
  it('validates JSON templates and rejects policy-weakening fields', () => {
    const valid = validateCustomWorkflowTemplateInput({
      templateVersion: 1,
      templateId: 'custom.local-to-remote',
      name: 'Custom local to remote',
      steps: [
        { stepId: 'readiness', kind: 'readiness' },
        { stepId: 'verify', kind: 'nx-verification' },
      ],
    });
    const invalid = validateCustomWorkflowTemplateInput({
      templateVersion: 1,
      templateId: 'custom.invalid',
      steps: [
        { stepId: 'write', kind: 'codex-patch', approvalRequired: false },
        { stepId: 'write', kind: 'unknown-step-kind', prompt: 'raw prompt' },
      ],
    });

    expect(valid.status).toBe('valid');
    expect(valid.rawPathStored).toBe(false);
    expect(invalid.status).toBe('invalid');
    expect(invalid.issues.join(' ')).toContain('approval');
    expect(invalid.issues.join(' ')).toContain('prompt');
  });

  it('creates metadata-only plans and fixture rehearsals', () => {
    const template = createCustomWorkflowTemplateFromJson({
      templateVersion: 1,
      templateId: 'custom.plan',
      name: 'Custom plan',
      steps: [
        { stepId: 'ready', kind: 'readiness' },
        { stepId: 'publish', kind: 'github-branch-publish' },
      ],
    });
    const plan = createCustomWorkflowPlan({ template });
    const rehearsal = runCustomWorkflowFixtureRehearsal({
      template,
      scenario: 'remote-step-blocked',
    });

    expect(plan.approvalRequired).toBe(true);
    expect(plan.childApprovalsRequired).toBe(1);
    expect(plan.directAdapterExecutionAllowed).toBe(false);
    expect(plan.processBoundaryInvoked).toBe(false);
    expect(rehearsal.status).toBe('blocked');
    expect(JSON.stringify(rehearsal)).not.toContain('https://github.com');
  });

  it('coordinates only child record hashes and blocks missing child approvals', () => {
    const template = createCustomWorkflowTemplateFixture({
      templateId: 'fixture.custom.workflow.test',
    });
    const plan = createCustomWorkflowPlan({ template });
    const approval = createCustomWorkflowApprovalRecord({
      dryRunId: plan.dryRunId,
      templateId: plan.templateId,
      templateHash: plan.templateHash,
      status: 'approved',
      approvedBy: 'operator',
      reasonHash: 'sha256:reason',
      reasonSummary: 'Approved for metadata-only coordination.',
    });
    const missingChildren = runCustomWorkflowCoordinator({ plan, approvalArtifact: approval });
    const childHashes = Object.fromEntries(
      plan.stepPlans
        .filter((step) => step.childApprovalRequired)
        .map((step) => [step.stepId, `sha256:${step.stepId}`]),
    );
    const completed = runCustomWorkflowCoordinator({
      plan,
      approvalArtifact: approval,
      childRecordHashes: childHashes,
    });

    expect(missingChildren.status).toBe('blocked');
    expect(missingChildren.processBoundaryInvoked).toBe(false);
    expect(completed.status).toBe('completed');
    expect(completed.directAdapterExecutionAllowed).toBe(false);
    expect(JSON.stringify(completed)).not.toContain('raw diff');
  });
});

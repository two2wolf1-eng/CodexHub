import { describe, expect, it } from 'vitest';
import { MetadataOnlyEvidenceCollector } from '@codexhub/evidence-kernel';
import {
  adversarialPublicOutputFixture,
  findAdversarialPublicOutputLeaks,
  findAdversarialPublicOutputRoundTripLeaks,
} from '../../../test-fixtures/adversarial-public-output-fixture';
import {
  WorkflowRunner,
  createCustomWorkflowApprovalRecord,
  createCustomWorkflowCatalog,
  createCustomWorkflowPlan,
  createCustomWorkflowTemplateFixture,
  createCustomWorkflowTemplateFromJson,
  createDevelopmentRequestWorkflowDefinition,
  createMockWorkflowDefinition,
  findCustomWorkflowCatalogTemplate,
  loadCustomWorkflowTemplatesFromDirectory,
  createProductionWorkflowPilotPlan,
  runCustomWorkflowCoordinator,
  runCustomWorkflowFixtureRehearsal,
  runProductionWorkflowPilot,
  runProductionWorkflowPilotRehearsal,
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

  it('normalizes adversarial template and approval text before public projection', () => {
    const template = createCustomWorkflowTemplateFromJson({
      templateVersion: 1,
      templateId: 'custom.adversarial-text',
      name: adversarialPublicOutputFixture,
      description: adversarialPublicOutputFixture,
      steps: [
        {
          stepId: 'ready',
          kind: 'readiness',
          name: adversarialPublicOutputFixture,
          summary: adversarialPublicOutputFixture,
        },
        {
          stepId: 'publish',
          kind: 'github-branch-publish',
          name: adversarialPublicOutputFixture,
          summary: adversarialPublicOutputFixture,
        },
      ],
    });
    const plan = createCustomWorkflowPlan({ template });
    const rehearsal = runCustomWorkflowFixtureRehearsal({ template });
    const approval = createCustomWorkflowApprovalRecord({
      dryRunId: plan.dryRunId,
      templateId: plan.templateId,
      templateHash: plan.templateHash,
      status: 'approved',
      approvedBy: 'operator',
      reasonHash: 'sha256:reason',
      reasonSummary: adversarialPublicOutputFixture,
    });
    const childHashes = Object.fromEntries(
      plan.stepPlans
        .filter((step) => step.childApprovalRequired)
        .map((step) => [step.stepId, `sha256:${step.stepId}`]),
    );
    const run = runCustomWorkflowCoordinator({
      plan,
      approvalArtifact: approval,
      childRecordHashes: childHashes,
    });
    const serialized = JSON.stringify({ template, plan, rehearsal, approval, run });

    expect(template.name).toBe('Custom workflow custom.adversarial-text');
    expect(template.description).toBeUndefined();
    expect(template.steps.map((step) => step.summary)).toEqual([
      'Metadata-only readiness step.',
      'Metadata-only github-branch-publish step.',
    ]);
    expect(approval.reasonSummary).toBe(
      'Custom workflow approval reason stored as hash-only summary.',
    );
    expect(findAdversarialPublicOutputLeaks(serialized)).toEqual([]);
  });

  it('keeps custom workflow public summaries metadata-only after JSON round-trip', () => {
    const template = createCustomWorkflowTemplateFromJson({
      templateVersion: 1,
      templateId: 'custom.roundtrip-adversarial',
      name: adversarialPublicOutputFixture,
      description: adversarialPublicOutputFixture,
      steps: [
        {
          stepId: 'ready',
          kind: 'readiness',
          name: adversarialPublicOutputFixture,
          summary: adversarialPublicOutputFixture,
        },
        {
          stepId: 'remote-cleanup',
          kind: 'remote-cleanup',
          name: adversarialPublicOutputFixture,
          summary: adversarialPublicOutputFixture,
        },
      ],
    });
    const plan = createCustomWorkflowPlan({ template });
    const approval = createCustomWorkflowApprovalRecord({
      dryRunId: plan.dryRunId,
      templateId: plan.templateId,
      templateHash: plan.templateHash,
      status: 'approved',
      approvedBy: 'operator',
      reasonHash: 'sha256:roundtrip-reason',
      reasonSummary: adversarialPublicOutputFixture,
    });
    const childRecordHashes = Object.fromEntries(
      plan.stepPlans
        .filter((step) => step.childApprovalRequired)
        .map((step) => [step.stepId, `sha256:${step.stepId}`]),
    );
    const run = runCustomWorkflowCoordinator({ plan, approvalArtifact: approval, childRecordHashes });

    expect(findAdversarialPublicOutputRoundTripLeaks({ template, plan, approval, run })).toEqual([]);
    expect(run.directAdapterExecutionAllowed).toBe(false);
    expect(run.processBoundaryInvoked).toBe(false);
    expect(run.networkBoundaryInvoked).toBe(false);
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

  it('loads built-in production templates as disabled catalog entries', () => {
    const loaded = loadCustomWorkflowTemplatesFromDirectory();
    const catalog = createCustomWorkflowCatalog();

    expect(loaded.templates.map((template) => template.templateId).sort()).toEqual([
      'github-draft-pr-chain',
      'local-patch-review',
      'local-rc-bundle',
      'rework-cleanup',
    ]);
    expect(catalog.entries).toHaveLength(4);
    expect(catalog.entries.every((entry) => entry.source === 'built-in')).toBe(true);
    expect(catalog.entries.every((entry) => entry.enabledByDefault === false)).toBe(true);
    expect(catalog.readiness.every((entry) => entry.status === 'disabled')).toBe(true);
    expect(catalog.readiness.every((entry) => entry.directAdapterExecutionAllowed === false)).toBe(
      true,
    );
    expect(catalog.familySummaries.map((summary) => summary.family).sort()).toEqual([
      'github',
      'local',
    ]);
    expect(findAdversarialPublicOutputRoundTripLeaks(catalog)).toEqual([]);
  });

  it('reports production workflow catalog readiness when explicitly enabled', () => {
    const catalog = createCustomWorkflowCatalog(process.cwd(), {
      integrationEnabled: true,
      productionExecutionEnabled: true,
      configuredEnvFlags: ['CODEXHUB_CUSTOM_WORKFLOWS_ENABLED'],
    });

    expect(catalog.readiness.every((entry) => entry.status === 'ready')).toBe(true);
    expect(catalog.readiness.every((entry) => entry.blockerCount === 0)).toBe(true);
    expect(catalog.entries.some((entry) => entry.approvalRequired)).toBe(true);
  });

  it('finds production catalog templates by id without exposing file paths', () => {
    const template = findCustomWorkflowCatalogTemplate('local-patch-review');

    expect(template?.templateId).toBe('local-patch-review');
    expect(template?.configPathHash).toMatch(/^sha256:/);
    expect(JSON.stringify(template)).not.toContain('.codexhub');
    expect(JSON.stringify(template)).not.toContain('workflow.json');
  });

  it('runs local production workflow pilot from existing child record hashes only', () => {
    const template = findCustomWorkflowCatalogTemplate('local-patch-review');
    expect(template).toBeTruthy();
    const childRecordHashes = Object.fromEntries(
      template!.steps
        .filter((step) => step.capabilityBinding.childApprovalRequired)
        .map((step) => [step.stepId, `sha256:${step.stepId}`]),
    );
    const plan = createProductionWorkflowPilotPlan({
      template: template!,
      childRecordHashes,
      productionExecutionEnabled: true,
      workflowApprovalApproved: true,
    });
    const run = runProductionWorkflowPilot({
      template: template!,
      childRecordHashes,
      productionExecutionEnabled: true,
      workflowApprovalApproved: true,
    });
    const missingChild = runProductionWorkflowPilot({
      template: template!,
      productionExecutionEnabled: true,
      workflowApprovalApproved: true,
    });

    expect(plan.status).toBe('ready');
    expect(run.status).toBe('completed');
    expect(run.directAdapterExecutionAllowed).toBe(false);
    expect(run.processBoundaryInvoked).toBe(false);
    expect(missingChild.status).toBe('blocked');
    expect(missingChild.readiness.missingChildRecordCount).toBeGreaterThan(0);
    expect(findAdversarialPublicOutputRoundTripLeaks({ plan, run, missingChild })).toEqual([]);
  });

  it('runs remote production workflow pilot and blocks failed remote child records', () => {
    const template = findCustomWorkflowCatalogTemplate('github-draft-pr-chain');
    expect(template).toBeTruthy();
    const childRecordHashes = Object.fromEntries(
      template!.steps
        .filter((step) => step.capabilityBinding.childApprovalRequired)
        .map((step) => [step.stepId, `sha256:${step.stepId}`]),
    );
    const completed = runProductionWorkflowPilot({
      template: template!,
      childRecordHashes,
      productionExecutionEnabled: true,
      workflowApprovalApproved: true,
    });
    const blocked = runProductionWorkflowPilotRehearsal({
      template: template!,
      scenario: 'remote-step-blocked',
    });

    expect(completed.status).toBe('completed');
    expect(completed.networkBoundaryInvoked).toBe(false);
    expect(blocked.status).toBe('blocked');
    expect(blocked.blockReasons.join(' ')).toContain('github-branch-publish');
    expect(JSON.stringify({ completed, blocked })).not.toContain('git push');
    expect(JSON.stringify({ completed, blocked })).not.toContain('reviewer');
  });
});

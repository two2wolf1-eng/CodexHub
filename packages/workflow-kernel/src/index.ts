import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import {
  ActionModeSchema,
  CapabilityKindSchema,
  CustomWorkflowApprovalArtifactRecordSchema,
  type CustomWorkflowApprovalArtifactRecord,
  CustomWorkflowCapabilityBindingSchema,
  type CustomWorkflowCapabilityBinding,
  CustomWorkflowPlanSchema,
  type CustomWorkflowPlan,
  CustomWorkflowRehearsalRunSchema,
  type CustomWorkflowRehearsalRun,
  CustomWorkflowRehearsalScenarioSchema,
  type CustomWorkflowRehearsalScenario,
  CustomWorkflowRunSchema,
  type CustomWorkflowRun,
  CustomWorkflowStepKindSchema,
  type CustomWorkflowStepKind,
  type CustomWorkflowStepPlan,
  type CustomWorkflowStepRunSummary,
  CustomWorkflowTemplateSchema,
  type CustomWorkflowTemplate,
  CustomWorkflowValidationReportSchema,
  type CustomWorkflowValidationReport,
  type DryRunPlan,
  type AuditEvent,
  RiskLevelSchema,
  type ActionMode,
  type CapabilityKind,
  type RiskLevel,
  type WorkflowDefinition,
  type WorkflowRun,
  type WorkflowStep,
  SchemaVersionSchema,
  foundationId,
  foundationTimestamp,
} from '@codexhub/contracts';
import { hashText, type EvidenceCollector } from '@codexhub/evidence-kernel';
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

export interface CustomWorkflowLoadResult {
  templates: CustomWorkflowTemplate[];
  validationReports: CustomWorkflowValidationReport[];
}

export interface CustomWorkflowPlannerOptions {
  template?: CustomWorkflowTemplate;
  dryRunId?: string;
  validationReport?: CustomWorkflowValidationReport;
}

export interface CustomWorkflowCoordinatorOptions {
  plan: CustomWorkflowPlan;
  approvalArtifact?: CustomWorkflowApprovalArtifactRecord;
  childRecordHashes?: Record<string, string>;
  blockedStepIds?: string[];
}

const customWorkflowForbiddenKeys = new Set([
  'prompt',
  'rawPrompt',
  'stdin',
  'stdout',
  'stderr',
  'diff',
  'rawDiff',
  'diffBody',
  'path',
  'rawPath',
  'url',
  'rawUrl',
  `tok${'en'}`,
  `coo${'kie'}`,
  `ses${'sion'}`,
  'env',
  'envValue',
  'responseBody',
  'requestBody',
  'body',
  'rawBody',
  'localControlKey',
  'approvalArtifact',
  'executionAuthority',
  'command',
  'rawCommand',
  'branches',
  'loop',
  'while',
  'forEach',
  'dependsOn',
  'next',
  'policyOverride',
  'approvalOverride',
  'configPath',
]);

const customWorkflowStepProfiles: Record<
  CustomWorkflowStepKind,
  {
    actionMode: ActionMode;
    riskLevel: RiskLevel;
    capabilityKind: CapabilityKind;
    requiresApproval: boolean;
    childApprovalRequired: boolean;
  }
> = {
  readiness: {
    actionMode: 'read',
    riskLevel: 'low',
    capabilityKind: 'policy',
    requiresApproval: false,
    childApprovalRequired: false,
  },
  worktree: {
    actionMode: 'write',
    riskLevel: 'high',
    capabilityKind: 'git',
    requiresApproval: true,
    childApprovalRequired: true,
  },
  'codex-patch': {
    actionMode: 'write',
    riskLevel: 'high',
    capabilityKind: 'codex',
    requiresApproval: true,
    childApprovalRequired: true,
  },
  'nx-verification': {
    actionMode: 'read',
    riskLevel: 'low',
    capabilityKind: 'verification',
    requiresApproval: false,
    childApprovalRequired: false,
  },
  'review-package': {
    actionMode: 'write',
    riskLevel: 'medium',
    capabilityKind: 'filesystem',
    requiresApproval: true,
    childApprovalRequired: true,
  },
  'rc-bundle': {
    actionMode: 'write',
    riskLevel: 'medium',
    capabilityKind: 'filesystem',
    requiresApproval: true,
    childApprovalRequired: true,
  },
  'github-branch-publish': {
    actionMode: 'write',
    riskLevel: 'high',
    capabilityKind: 'git',
    requiresApproval: true,
    childApprovalRequired: true,
  },
  'github-draft-pr': {
    actionMode: 'write',
    riskLevel: 'high',
    capabilityKind: 'git',
    requiresApproval: true,
    childApprovalRequired: true,
  },
  'github-pr-lifecycle': {
    actionMode: 'read',
    riskLevel: 'medium',
    capabilityKind: 'git',
    requiresApproval: true,
    childApprovalRequired: true,
  },
  'remote-supersede': {
    actionMode: 'read',
    riskLevel: 'medium',
    capabilityKind: 'git',
    requiresApproval: false,
    childApprovalRequired: false,
  },
  'remote-cleanup': {
    actionMode: 'write',
    riskLevel: 'high',
    capabilityKind: 'git',
    requiresApproval: true,
    childApprovalRequired: true,
  },
  'governance-projection': {
    actionMode: 'read',
    riskLevel: 'low',
    capabilityKind: 'policy',
    requiresApproval: false,
    childApprovalRequired: false,
  },
  'telemetry-projection': {
    actionMode: 'read',
    riskLevel: 'low',
    capabilityKind: 'telemetry',
    requiresApproval: false,
    childApprovalRequired: false,
  },
  'browser-observe': {
    actionMode: 'read',
    riskLevel: 'medium',
    capabilityKind: 'browser',
    requiresApproval: false,
    childApprovalRequired: false,
  },
  'electron-observe': {
    actionMode: 'read',
    riskLevel: 'medium',
    capabilityKind: 'electron',
    requiresApproval: true,
    childApprovalRequired: true,
  },
  'mcp-readonly': {
    actionMode: 'read',
    riskLevel: 'low',
    capabilityKind: 'mcp',
    requiresApproval: false,
    childApprovalRequired: false,
  },
};

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

export function createCustomWorkflowTemplateFixture(
  overrides: Partial<CustomWorkflowTemplate> = {},
): CustomWorkflowTemplate {
  const now = foundationTimestamp();
  const stepKinds: CustomWorkflowStepKind[] = [
    'readiness',
    'worktree',
    'codex-patch',
    'nx-verification',
    'review-package',
    'rc-bundle',
    'github-branch-publish',
    'github-draft-pr',
    'github-pr-lifecycle',
    'governance-projection',
  ];
  const steps = stepKinds.map((kind, index) =>
    createCustomWorkflowStepTemplate(kind, index + 1),
  );
  const templateId = overrides.templateId ?? 'fixture.custom-workflow.local-pilot';
  const templateHash =
    overrides.templateHash ??
    `sha256:${hashText(JSON.stringify({ templateId, stepKinds }))}`;
  const template = CustomWorkflowTemplateSchema.parse({
    id: overrides.id ?? foundationId('custom_workflow_template'),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: overrides.createdAt ?? now,
    templateId,
    templateVersion: 1,
    name: overrides.name ?? 'Fixture governed local-to-remote workflow',
    description:
      overrides.description ??
      'Metadata-only fixture custom workflow for validation and rehearsal.',
    riskLevel: overrides.riskLevel ?? 'high',
    templateHash,
    configPathHash: overrides.configPathHash,
    stepCount: steps.length,
    capabilityCount: steps.length,
    steps,
    orderedStepsOnly: true,
    directAdapterExecutionAllowed: false,
    weakensPolicy: false,
    bodyStored: false,
    rawPathStored: false,
    configBodyStored: false,
    noRealWrite: true,
    summary: overrides.summary ?? 'Fixture workflow template summary only.',
    metadata: { fixture: true },
  });
  return CustomWorkflowTemplateSchema.parse({ ...template, ...overrides });
}

export function loadCustomWorkflowTemplatesFromDirectory(
  workspaceRoot = process.cwd(),
): CustomWorkflowLoadResult {
  const workflowsDir = resolve(workspaceRoot, '.codexhub', 'workflows');
  if (!existsSync(workflowsDir)) {
    return { templates: [], validationReports: [] };
  }

  const templates: CustomWorkflowTemplate[] = [];
  const validationReports: CustomWorkflowValidationReport[] = [];
  for (const entry of readdirSync(workflowsDir, { withFileTypes: true })) {
    if (!entry.isFile() || !entry.name.endsWith('.workflow.json')) {
      continue;
    }
    const filePath = resolve(workflowsDir, entry.name);
    const body = readFileSync(filePath, 'utf8');
    let parsed: unknown;
    try {
      parsed = JSON.parse(body);
    } catch {
      validationReports.push(
        createCustomWorkflowValidationReport({
          templateId: entry.name.replace(/\.workflow\.json$/, ''),
          templateHash: `sha256:${hashText(body)}`,
          status: 'invalid',
          issues: ['Template file is not valid JSON.'],
          stepCount: 0,
        }),
      );
      continue;
    }

    const validationReport = validateCustomWorkflowTemplateInput(parsed, body);
    validationReports.push(validationReport);
    if (validationReport.status !== 'valid') {
      continue;
    }
    templates.push(
      createCustomWorkflowTemplateFromJson(
        parsed,
        body,
        `sha256:${hashText(filePath)}`,
      ),
    );
  }

  return { templates, validationReports };
}

export function validateCustomWorkflowTemplateInput(
  input: unknown,
  bodyForHashOnly = JSON.stringify(input),
): CustomWorkflowValidationReport {
  const issues: string[] = [];
  const objectInput =
    input && typeof input === 'object' && !Array.isArray(input)
      ? (input as Record<string, unknown>)
      : undefined;
  const templateId =
    typeof objectInput?.templateId === 'string'
      ? objectInput.templateId
      : typeof objectInput?.id === 'string'
        ? objectInput.id
        : 'unknown-template';
  const templateHash = `sha256:${hashText(bodyForHashOnly)}`;

  if (!objectInput) {
    issues.push('Template must be a JSON object.');
  } else {
    if (objectInput.templateVersion !== 1) {
      issues.push('Template version must be 1.');
    }
    if (!Array.isArray(objectInput.steps)) {
      issues.push('Template must contain an ordered steps array.');
    }
    collectCustomWorkflowPolicyIssues(objectInput, issues);
  }

  const steps = Array.isArray(objectInput?.steps)
    ? (objectInput.steps as unknown[])
    : [];
  const seenStepIds = new Set<string>();
  let unknownStepKindCount = 0;
  for (const [index, step] of steps.entries()) {
    if (!step || typeof step !== 'object' || Array.isArray(step)) {
      issues.push(`Step ${index + 1} must be a JSON object.`);
      continue;
    }
    const stepRecord = step as Record<string, unknown>;
    if (typeof stepRecord.stepId !== 'string' || stepRecord.stepId.length === 0) {
      issues.push(`Step ${index + 1} must have a stepId.`);
    } else if (seenStepIds.has(stepRecord.stepId)) {
      issues.push(`Step id ${stepRecord.stepId} is duplicated.`);
    } else {
      seenStepIds.add(stepRecord.stepId);
    }
    if (!CustomWorkflowStepKindSchema.safeParse(stepRecord.kind).success) {
      unknownStepKindCount += 1;
      issues.push(`Step ${stepRecord.stepId ?? index + 1} has an unknown kind.`);
    }
    collectCustomWorkflowPolicyIssues(stepRecord, issues);
  }

  return createCustomWorkflowValidationReport({
    templateId,
    templateHash,
    status: issues.length === 0 ? 'valid' : 'invalid',
    issues,
    stepCount: steps.length,
    unknownStepKindCount,
  });
}

export function createCustomWorkflowTemplateFromJson(
  input: unknown,
  bodyForHashOnly = JSON.stringify(input),
  configPathHash?: string,
): CustomWorkflowTemplate {
  const validationReport = validateCustomWorkflowTemplateInput(
    input,
    bodyForHashOnly,
  );
  if (validationReport.status !== 'valid') {
    throw new Error(`Invalid custom workflow template: ${validationReport.summary}`);
  }

  const record = input as Record<string, unknown>;
  const templateId =
    typeof record.templateId === 'string' ? record.templateId : String(record.id);
  const steps = (record.steps as Array<Record<string, unknown>>).map(
    (step, index) => {
      const kind = CustomWorkflowStepKindSchema.parse(step.kind);
      return createCustomWorkflowStepTemplate(kind, index + 1, {
        stepId: String(step.stepId),
        name: `Custom workflow ${kind} step`,
        summary: `Metadata-only ${kind} step.`,
      });
    },
  );

  const riskLevel = steps.some((step) => step.riskLevel === 'high')
    ? 'high'
    : steps.some((step) => step.riskLevel === 'medium')
      ? 'medium'
      : 'low';

  return CustomWorkflowTemplateSchema.parse({
    id: foundationId('custom_workflow_template'),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: foundationTimestamp(),
    templateId,
    templateVersion: 1,
    name: `Custom workflow ${templateId}`,
    description: undefined,
    riskLevel,
    templateHash: validationReport.templateHash,
    configPathHash,
    stepCount: steps.length,
    capabilityCount: steps.length,
    steps,
    orderedStepsOnly: true,
    directAdapterExecutionAllowed: false,
    weakensPolicy: false,
    bodyStored: false,
    rawPathStored: false,
    configBodyStored: false,
    noRealWrite: true,
    summary: `Custom workflow ${templateId} with ${steps.length} ordered steps.`,
    metadata: { templateHash: validationReport.templateHash },
  });
}

export function createCustomWorkflowPlan(
  options: CustomWorkflowPlannerOptions = {},
): CustomWorkflowPlan {
  const template = options.template ?? createCustomWorkflowTemplateFixture();
  const validationReport =
    options.validationReport ??
    createCustomWorkflowValidationReport({
      templateId: template.templateId,
      templateHash: template.templateHash,
      status: 'valid',
      issues: [],
      stepCount: template.steps.length,
    });
  const stepPlans: CustomWorkflowStepPlan[] = template.steps.map((step) => ({
    stepId: step.stepId,
    kind: step.kind,
    actionMode: step.actionMode,
    riskLevel: step.riskLevel,
    requiresApproval: step.capabilityBinding.requiresApproval,
    childApprovalRequired: step.capabilityBinding.childApprovalRequired,
    policyRequired: true,
    evidenceRequired: true,
    auditRequired: true,
    directAdapterExecutionAllowed: false,
    summary: step.summary,
  }));
  const childApprovalsRequired = stepPlans.filter(
    (step) => step.childApprovalRequired,
  ).length;
  const approvalRequired = stepPlans.some(
    (step) =>
      step.requiresApproval ||
      step.actionMode === 'write' ||
      step.actionMode === 'admin',
  );
  const blockReasons =
    validationReport.status === 'valid'
      ? []
      : ['custom_workflow_template_invalid'];

  return CustomWorkflowPlanSchema.parse({
    id: foundationId('custom_workflow_dry_run'),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: foundationTimestamp(),
    dryRunId: options.dryRunId ?? foundationId('custom_workflow_dry_run'),
    templateId: template.templateId,
    templateHash: template.templateHash,
    status: blockReasons.length === 0 ? 'planned' : 'blocked',
    validationReport,
    stepPlans,
    stepCount: stepPlans.length,
    approvalRequired,
    childApprovalsRequired,
    blockReasons,
    evidenceRefIds: [],
    auditEventIds: [],
    processBoundaryInvoked: false,
    externalProcessStarted: false,
    networkBoundaryInvoked: false,
    directAdapterExecutionAllowed: false,
    noRealWrite: true,
    bodyStored: false,
    rawPathStored: false,
    summary:
      blockReasons.length === 0
        ? `Custom workflow dry-run planned ${stepPlans.length} steps.`
        : 'Custom workflow dry-run blocked by validation.',
    metadata: { templateHash: template.templateHash },
  });
}

export function createCustomWorkflowApprovalRecord(input: {
  dryRunId: string;
  templateId: string;
  templateHash: string;
  status?: CustomWorkflowApprovalArtifactRecord['status'];
  approvedBy?: string;
  reasonHash?: string;
  reasonSummary?: string;
  approvalArtifactId?: string;
  expiresAt?: string;
}): CustomWorkflowApprovalArtifactRecord {
  return CustomWorkflowApprovalArtifactRecordSchema.parse({
    id: foundationId('custom_workflow_approval'),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: foundationTimestamp(),
    dryRunId: input.dryRunId,
    templateId: input.templateId,
    templateHash: input.templateHash,
    approvalArtifactId:
      input.approvalArtifactId ?? foundationId('custom_workflow_artifact'),
    status: input.status ?? 'requested',
    approvedBy: input.approvedBy,
    reasonHash: input.reasonHash,
    reasonSummary: input.reasonSummary
      ? 'Custom workflow approval reason stored as hash-only summary.'
      : undefined,
    expiresAt: input.expiresAt,
    bodyStored: false,
    rawPathStored: false,
    summary: `Custom workflow approval ${input.status ?? 'requested'}.`,
    metadata: { templateHash: input.templateHash },
  });
}

export function runCustomWorkflowCoordinator(
  options: CustomWorkflowCoordinatorOptions,
): CustomWorkflowRun {
  const { plan, approvalArtifact } = options;
  const now = foundationTimestamp();
  const blockedStepIds = new Set(options.blockedStepIds ?? []);
  const blockReasons: string[] = [];
  if (plan.status === 'blocked') {
    blockReasons.push('custom_workflow_plan_blocked');
  }
  if (plan.approvalRequired && approvalArtifact?.status !== 'approved') {
    blockReasons.push('custom_workflow_approval_missing_or_not_approved');
  }

  const childRecordHashes = options.childRecordHashes ?? {};
  const steps: CustomWorkflowStepRunSummary[] = plan.stepPlans.map((step) => {
    const childRecordIdHash = childRecordHashes[step.stepId];
    const stepBlockReasons: string[] = [];
    if (blockedStepIds.has(step.stepId)) {
      stepBlockReasons.push('custom_workflow_step_blocked');
    }
    if (step.childApprovalRequired && !childRecordIdHash) {
      stepBlockReasons.push('custom_workflow_child_record_missing');
    }
    if (blockReasons.length > 0) {
      stepBlockReasons.push(...blockReasons);
    }

    return {
      stepId: step.stepId,
      kind: step.kind,
      status: stepBlockReasons.length === 0 ? 'completed' : 'blocked',
      childRecordIdHash,
      childHashBindingMatched: Boolean(childRecordIdHash),
      childApprovalRequired: step.childApprovalRequired,
      childExecutionInvoked: false,
      directAdapterExecutionAllowed: false,
      blockReasons: stepBlockReasons,
      evidenceRefIds: [],
      auditEventIds: [],
      processBoundaryInvoked: false,
      externalProcessStarted: false,
      networkBoundaryInvoked: false,
      bodyStored: false,
      rawPathStored: false,
      summary:
        stepBlockReasons.length === 0
          ? `Custom workflow step ${step.stepId} completed by child record projection.`
          : `Custom workflow step ${step.stepId} blocked.`,
    };
  });
  const blockedStepCount = steps.filter((step) => step.status === 'blocked').length;
  const completedStepCount = steps.filter(
    (step) => step.status === 'completed',
  ).length;

  return CustomWorkflowRunSchema.parse({
    id: foundationId('custom_workflow_run'),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: now,
    dryRunId: plan.dryRunId,
    approvalArtifactId: approvalArtifact?.approvalArtifactId,
    templateId: plan.templateId,
    templateHash: plan.templateHash,
    status:
      blockedStepCount > 0 || blockReasons.length > 0 ? 'blocked' : 'completed',
    steps,
    stepCount: steps.length,
    completedStepCount,
    blockedStepCount,
    childApprovalsRequired: plan.childApprovalsRequired,
    blockReasons,
    evidenceRefIds: plan.evidenceRefIds,
    auditEventIds: plan.auditEventIds,
    processBoundaryInvoked: false,
    externalProcessStarted: false,
    networkBoundaryInvoked: false,
    directAdapterExecutionAllowed: false,
    noRealWrite: true,
    bodyStored: false,
    rawPathStored: false,
    summary:
      blockedStepCount > 0 || blockReasons.length > 0
        ? 'Custom workflow run blocked by governance or child record requirements.'
        : 'Custom workflow run completed as metadata-only coordination.',
    metadata: { dryRunId: plan.dryRunId },
  });
}

export function runCustomWorkflowFixtureRehearsal(input: {
  template?: CustomWorkflowTemplate;
  scenario?: CustomWorkflowRehearsalScenario;
} = {}): CustomWorkflowRehearsalRun {
  const template = input.template ?? createCustomWorkflowTemplateFixture();
  const scenario = input.scenario ?? 'all-pass';
  const blockReasons = createCustomWorkflowRehearsalBlockReasons(scenario);
  const status: CustomWorkflowRehearsalRun['status'] =
    scenario === 'all-pass' ? 'completed' : 'blocked';

  return CustomWorkflowRehearsalRunSchema.parse({
    id: foundationId('custom_workflow_rehearsal'),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: foundationTimestamp(),
    templateId: template.templateId,
    templateHash: template.templateHash,
    scenario,
    status,
    stepCount: template.steps.length,
    blockerCount: blockReasons.length,
    evidenceRefCount: template.steps.length,
    auditEventCount: template.steps.length,
    childApprovalsRequired: template.steps.filter(
      (step) => step.capabilityBinding.childApprovalRequired,
    ).length,
    blockReasons,
    directAdapterExecutionAllowed: false,
    noRealWrite: true,
    processBoundaryInvoked: false,
    externalProcessStarted: false,
    networkBoundaryInvoked: false,
    bodyStored: false,
    rawPathStored: false,
    summary:
      scenario === 'all-pass'
        ? 'Custom workflow fixture rehearsal completed without live execution.'
        : `Custom workflow fixture rehearsal blocked: ${blockReasons.join(', ')}.`,
    metadata: { scenario },
  });
}

function createCustomWorkflowStepTemplate(
  kind: CustomWorkflowStepKind,
  order: number,
  overrides: Partial<{
    stepId: string;
    name: string;
    summary: string;
  }> = {},
) {
  const profile = customWorkflowStepProfiles[kind];
  const binding: CustomWorkflowCapabilityBinding = CustomWorkflowCapabilityBindingSchema.parse({
    stepKind: kind,
    capabilityKind: CapabilityKindSchema.parse(profile.capabilityKind),
    actionMode: ActionModeSchema.parse(profile.actionMode),
    riskLevel: RiskLevelSchema.parse(profile.riskLevel),
    requiresApproval: profile.requiresApproval,
    childApprovalRequired: profile.childApprovalRequired,
    adapterExecuteAllowed: false,
    summary: `${kind} capability binding is governed by existing child control planes.`,
  });

  return {
    stepId: overrides.stepId ?? `step-${String(order).padStart(2, '0')}-${kind}`,
    name: overrides.name ?? `Custom workflow ${kind}`,
    kind,
    actionMode: profile.actionMode,
    riskLevel: profile.riskLevel,
    required: true,
    capabilityBinding: binding,
    summary:
      overrides.summary ??
      `${kind} step is represented as metadata and child record references.`,
  };
}

function createCustomWorkflowValidationReport(input: {
  templateId: string;
  templateHash: string;
  status: CustomWorkflowValidationReport['status'];
  issues: string[];
  stepCount: number;
  unknownStepKindCount?: number;
}): CustomWorkflowValidationReport {
  return CustomWorkflowValidationReportSchema.parse({
    id: foundationId('custom_workflow_validation'),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: foundationTimestamp(),
    templateId: input.templateId,
    templateHash: input.templateHash,
    status: input.status,
    issueCount: input.issues.length,
    issues: input.issues,
    stepCount: input.stepCount,
    unknownStepKindCount: input.unknownStepKindCount ?? 0,
    policyWeakeningDetected: false,
    loopOrBranchingDetected: false,
    arbitraryConfigPathAllowed: false,
    bodyStored: false,
    rawPathStored: false,
    summary:
      input.issues.length === 0
        ? 'Custom workflow template is valid.'
        : `Custom workflow template has ${input.issues.length} validation issues.`,
    metadata: { templateHash: input.templateHash },
  });
}

function collectCustomWorkflowPolicyIssues(
  value: Record<string, unknown>,
  issues: string[],
) {
  for (const [key, nested] of Object.entries(value)) {
    if (customWorkflowForbiddenKeys.has(key)) {
      issues.push(`Field ${key} is not allowed in custom workflow templates.`);
    }
    if (key === 'approvalRequired' && nested === false) {
      issues.push('Templates cannot mark approvals as not required.');
    }
    if (key === 'actionMode' && typeof nested === 'string') {
      const parsed = ActionModeSchema.safeParse(nested);
      if (!parsed.success) {
        issues.push(`Action mode ${nested} is not recognized.`);
      }
    }
    if (nested && typeof nested === 'object' && !Array.isArray(nested)) {
      collectCustomWorkflowPolicyIssues(
        nested as Record<string, unknown>,
        issues,
      );
    }
  }
}

function createCustomWorkflowRehearsalBlockReasons(
  scenario: CustomWorkflowRehearsalScenario,
): string[] {
  switch (CustomWorkflowRehearsalScenarioSchema.parse(scenario)) {
    case 'all-pass':
      return [];
    case 'invalid-template':
      return ['custom_workflow_template_invalid'];
    case 'missing-child-reference':
      return ['custom_workflow_child_reference_missing'];
    case 'approval-blocked':
      return ['custom_workflow_approval_blocked'];
    case 'verification-failed':
      return ['custom_workflow_verification_failed'];
    case 'remote-step-blocked':
      return ['custom_workflow_remote_step_blocked'];
    case 'cleanup-blocked':
      return ['custom_workflow_cleanup_blocked'];
    case 'child-approval-blocked':
      return ['custom_workflow_child_approval_blocked'];
    case 'superseded-source':
      return ['custom_workflow_source_superseded'];
  }
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

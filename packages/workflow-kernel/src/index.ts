import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

import {
  ActionModeSchema,
  CapabilityKindSchema,
  CustomWorkflowCatalogEntrySchema,
  type CustomWorkflowCatalogEntry,
  CustomWorkflowCatalogReadinessSchema,
  type CustomWorkflowCatalogReadiness,
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
  ProductionWorkflowPilotEvidenceSummarySchema,
  type ProductionWorkflowPilotEvidenceSummary,
  ProductionWorkflowPilotPlanSchema,
  type ProductionWorkflowPilotPlan,
  ProductionWorkflowPilotReadinessSchema,
  type ProductionWorkflowPilotReadiness,
  ProductionWorkflowPilotRunSchema,
  type ProductionWorkflowPilotRun,
  type ProductionWorkflowPilotSource,
  type ProductionWorkflowPilotStatus,
  ProductionWorkflowPilotStepSchema,
  type ProductionWorkflowPilotStep,
  ProductionWorkflowOperationsProjectionSchema,
  type ProductionWorkflowOperationsProjection,
  ProductionWorkflowOperationsSmokeRunSchema,
  type ProductionWorkflowOperationsSmokeRun,
  type ProductionWorkflowOperationsSmokeScenario,
  ProductionWorkflowPauseSummarySchema,
  type ProductionWorkflowPauseSummary,
  ProductionWorkflowChildActionPlanSchema,
  type ProductionWorkflowChildActionPlan,
  ProductionWorkflowChildActionStateSchema,
  type ProductionWorkflowChildActionState,
  ProductionWorkflowRecoveryApprovalArtifactSchema,
  type ProductionWorkflowRecoveryApprovalArtifact,
  ProductionWorkflowRecoveryPlanSchema,
  type ProductionWorkflowRecoveryPlan,
  ProductionWorkflowRecoveryRunSchema,
  type ProductionWorkflowRecoveryRun,
  type ProductionWorkflowRecoveryScenario,
  ProductionWorkflowRecoveryScenarioSchema,
  ProductionWorkflowRecoveryStepSchema,
  type ProductionWorkflowRecoveryStep,
  type ProductionWorkflowRecoveryStatus,
  ProductionWorkflowResumeSummarySchema,
  type ProductionWorkflowResumeSummary,
  ProductionWorkflowRollbackSummarySchema,
  type ProductionWorkflowRollbackSummary,
  CustomWorkflowProductionTemplateValidationSummarySchema,
  type CustomWorkflowProductionTemplateValidationSummary,
  CustomWorkflowRunSchema,
  type CustomWorkflowRun,
  CustomWorkflowStepKindSchema,
  type CustomWorkflowStepKind,
  type CustomWorkflowStepPlan,
  type CustomWorkflowStepRunSummary,
  CustomWorkflowTemplateFamilySummarySchema,
  type CustomWorkflowTemplateFamilySummary,
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

export interface CustomWorkflowCatalogOptions {
  integrationEnabled?: boolean;
  productionExecutionEnabled?: boolean;
  configuredEnvFlags?: string[];
  requiredEnvFlags?: string[];
}

export interface CustomWorkflowCatalogResult extends CustomWorkflowLoadResult {
  entries: CustomWorkflowCatalogEntry[];
  readiness: CustomWorkflowCatalogReadiness[];
  validationSummaries: CustomWorkflowProductionTemplateValidationSummary[];
  familySummaries: CustomWorkflowTemplateFamilySummary[];
}

export interface CustomWorkflowPlannerOptions {
  template?: CustomWorkflowTemplate;
  dryRunId?: string;
  validationReport?: CustomWorkflowValidationReport;
  blockReasons?: string[];
  summary?: string;
}

export interface CustomWorkflowCoordinatorOptions {
  plan: CustomWorkflowPlan;
  approvalArtifact?: CustomWorkflowApprovalArtifactRecord;
  childRecordHashes?: Record<string, string>;
  blockedStepIds?: string[];
}

export type ProductionWorkflowChildRecordStatus =
  | 'completed'
  | 'failed'
  | 'blocked'
  | 'aborted'
  | 'stale';

export interface ProductionWorkflowPilotOptions {
  template?: CustomWorkflowTemplate;
  templateId?: string;
  templateHash?: string;
  childRecordHashes?: Record<string, string>;
  childRunStatuses?: Record<string, ProductionWorkflowChildRecordStatus>;
  productionExecutionEnabled?: boolean;
  workflowApprovalApproved?: boolean;
  source?: ProductionWorkflowPilotSource;
}

export interface ProductionWorkflowPilotRehearsalOptions {
  template?: CustomWorkflowTemplate;
  templateId?: string;
  scenario?: CustomWorkflowRehearsalScenario;
}

export interface ProductionWorkflowOperationsProjectionOptions {
  template?: CustomWorkflowTemplate;
  templateId?: string;
  pilotRun?: ProductionWorkflowPilotRun;
  approvalState?: CustomWorkflowApprovalArtifactRecord['status'];
  staleChildRecordCount?: number;
  rollbackAvailable?: boolean;
  blockReasons?: string[];
}

export interface ProductionWorkflowOperationIntentOptions {
  sourceRunIdHash: string;
  affectedTemplateHash: string;
  reasonHash: string;
}

export type ProductionWorkflowChildActionRuntimeStatus =
  | ProductionWorkflowChildRecordStatus
  | 'waiting_for_child_approval'
  | 'dry_run_failed'
  | 'approval_requested';

export interface ProductionWorkflowRecoveryOptions {
  template?: CustomWorkflowTemplate;
  templateId?: string;
  templateHash?: string;
  dryRunId?: string;
  sourceRunIdHash?: string;
  recoveryEnabled?: boolean;
  childOrchestrationEnabled?: boolean;
  workflowApprovalApproved?: boolean;
  approvalArtifact?: ProductionWorkflowRecoveryApprovalArtifact;
  childApprovalApproved?: Record<string, boolean>;
  childRunStatuses?: Record<string, ProductionWorkflowChildActionRuntimeStatus>;
  resumeFromStepId?: string;
}

export interface ProductionWorkflowRecoveryRehearsalOptions {
  template?: CustomWorkflowTemplate;
  templateId?: string;
  scenario?: ProductionWorkflowRecoveryScenario;
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

const builtInProductionTemplateIds = new Set([
  'local-patch-review',
  'local-rc-bundle',
  'github-draft-pr-chain',
  'rework-cleanup',
]);

const defaultCustomWorkflowRequiredEnvFlags = ['CODEXHUB_CUSTOM_WORKFLOWS_ENABLED'];

const productionRecoveryChildBindings: Partial<
  Record<
    CustomWorkflowStepKind,
    {
      childActionKind: ProductionWorkflowChildActionPlan['childActionKind'];
      childControlPlane: string;
    }
  >
> = {
  worktree: {
    childActionKind: 'worktree-create',
    childControlPlane: 'worktrees',
  },
  'codex-patch': {
    childActionKind: 'codex-patch',
    childControlPlane: 'codex.patch-runs',
  },
  'nx-verification': {
    childActionKind: 'nx-verification',
    childControlPlane: 'nx-verification',
  },
  'review-package': {
    childActionKind: 'review-package-export',
    childControlPlane: 'review-packages',
  },
  'governance-projection': {
    childActionKind: 'governance-projection',
    childControlPlane: 'governance-projection',
  },
  'github-branch-publish': {
    childActionKind: 'github-branch-publish',
    childControlPlane: 'github.branch-publishes',
  },
  'github-draft-pr': {
    childActionKind: 'github-draft-pr',
    childControlPlane: 'github.draft-prs',
  },
  'github-pr-lifecycle': {
    childActionKind: 'github-pr-lifecycle',
    childControlPlane: 'github.pr-lifecycle',
  },
  'remote-supersede': {
    childActionKind: 'remote-supersede',
    childControlPlane: 'github.supersedes',
  },
  'remote-cleanup': {
    childActionKind: 'remote-cleanup',
    childControlPlane: 'github.remote-cleanups',
  },
};

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
  const resolvedWorkspaceRoot = findCustomWorkflowWorkspaceRoot(workspaceRoot);
  const workflowsDir = resolve(resolvedWorkspaceRoot, '.codexhub', 'workflows');
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

export function createCustomWorkflowCatalog(
  workspaceRoot = process.cwd(),
  options: CustomWorkflowCatalogOptions = {},
): CustomWorkflowCatalogResult {
  const { templates, validationReports } =
    loadCustomWorkflowTemplatesFromDirectory(workspaceRoot);
  const entries = templates.map((template) =>
    createCustomWorkflowCatalogEntry(template, findValidationReport(validationReports, template)),
  );
  const readiness = entries.map((entry) =>
    createCustomWorkflowCatalogReadiness(entry, options),
  );
  const validationSummaries = validationReports.map((report) =>
    createCustomWorkflowProductionValidationSummary(report),
  );
  const familySummaries = createCustomWorkflowFamilySummaries(entries, readiness);

  return { templates, validationReports, entries, readiness, validationSummaries, familySummaries };
}

export function findCustomWorkflowCatalogTemplate(
  templateId: string,
  workspaceRoot = process.cwd(),
): CustomWorkflowTemplate | undefined {
  return loadCustomWorkflowTemplatesFromDirectory(workspaceRoot).templates.find(
    (template) => template.templateId === templateId,
  );
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
    metadata: {
      templateHash: validationReport.templateHash,
      family: getCustomWorkflowTemplateFamily(templateId),
      source: builtInProductionTemplateIds.has(templateId) ? 'built-in' : 'workspace',
      enabledByDefault: false,
      productionExecutionEnabled: false,
    },
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
  const blockReasons = [
    ...(options.blockReasons ?? []),
    ...(validationReport.status === 'valid'
      ? []
      : ['custom_workflow_template_invalid']),
  ];

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
      options.summary ??
      (blockReasons.length === 0
        ? `Custom workflow dry-run planned ${stepPlans.length} steps.`
        : 'Custom workflow dry-run blocked by governance or validation.'),
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

export function createProductionWorkflowPilotPlan(
  input: ProductionWorkflowPilotOptions = {},
): ProductionWorkflowPilotPlan {
  const template = resolveProductionWorkflowPilotTemplate(input);
  const childRecordHashes = input.childRecordHashes ?? {};
  const readiness = createProductionWorkflowPilotReadiness(input);
  const evidenceSummary = createProductionWorkflowPilotEvidenceSummary({
    template,
    childRecordHashes,
    blockReasons: readiness.blockers,
  });

  return ProductionWorkflowPilotPlanSchema.parse({
    id: foundationId('production_workflow_pilot_plan'),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: foundationTimestamp(),
    pilotPlanId: foundationId('production_workflow_pilot_plan'),
    templateId: template.templateId,
    templateHash: template.templateHash,
    source: input.source ?? 'catalog-template',
    status: readiness.status === 'ready' ? 'ready' : 'blocked',
    stepCount: template.steps.length,
    childRecordHashCount: Object.keys(childRecordHashes).length,
    blockReasons: readiness.blockers,
    evidenceSummary,
    processBoundaryInvoked: false,
    externalProcessStarted: false,
    networkBoundaryInvoked: false,
    directAdapterExecutionAllowed: false,
    noRealWrite: true,
    bodyStored: false,
    rawPathStored: false,
    summary:
      readiness.status === 'ready'
        ? 'Production workflow pilot plan is ready for metadata-only child coordination.'
        : 'Production workflow pilot plan is blocked before child coordination.',
    metadata: {
      templateHash: template.templateHash,
      blockerCount: readiness.blockerCount,
    },
  });
}

export function runProductionWorkflowPilot(
  input: ProductionWorkflowPilotOptions = {},
): ProductionWorkflowPilotRun {
  const template = resolveProductionWorkflowPilotTemplate(input);
  const readiness = createProductionWorkflowPilotReadiness({ ...input, template });
  const childRecordHashes = input.childRecordHashes ?? {};
  const childRunStatuses = input.childRunStatuses ?? {};
  const globalBlockers = readiness.blockers.filter(
    (reason) =>
      reason.startsWith('custom_workflow_production') ||
      reason.startsWith('custom_workflow_approval') ||
      reason.startsWith('custom_workflow_template'),
  );
  let blockedByPriorStep = globalBlockers.length > 0;
  const steps: ProductionWorkflowPilotStep[] = template.steps.map((step) => {
    const childStatus = childRunStatuses[step.stepId];
    const stepBlockers = readiness.blockers.filter((reason) =>
      reason.endsWith(`:${step.stepId}`),
    );
    let status: ProductionWorkflowPilotStatus = 'completed';
    if (blockedByPriorStep || stepBlockers.length > 0) {
      status = 'blocked';
    }
    if (childStatus === 'failed' || childStatus === 'aborted') {
      status = 'failed';
    }
    if (childStatus === 'blocked' || childStatus === 'stale') {
      status = 'blocked';
    }
    if (status !== 'completed') {
      blockedByPriorStep = true;
    }

    return ProductionWorkflowPilotStepSchema.parse({
      stepId: step.stepId,
      kind: step.kind,
      status,
      childRecordIdHash: childRecordHashes[step.stepId],
      childHashBindingMatched: Boolean(childRecordHashes[step.stepId]),
      childApprovalRequired: step.capabilityBinding.childApprovalRequired,
      blockReasons:
        status === 'completed'
          ? []
          : stepBlockers.length > 0
            ? stepBlockers
            : globalBlockers,
      evidenceRefIds:
        status === 'completed' ? [`evidence:${hashText(step.stepId)}`] : [],
      auditEventIds:
        status === 'completed' ? [`audit:${hashText(step.stepId)}`] : [],
      processBoundaryInvoked: false,
      externalProcessStarted: false,
      networkBoundaryInvoked: false,
      directAdapterExecutionAllowed: false,
      bodyStored: false,
      rawPathStored: false,
      summary:
        status === 'completed'
          ? `${step.kind} pilot step is satisfied by existing child record metadata.`
          : `${step.kind} pilot step is blocked by governance or child record state.`,
    });
  });
  const completedStepCount = steps.filter((step) => step.status === 'completed').length;
  const blockedStepCount = steps.filter((step) => step.status === 'blocked').length;
  const failedStepCount = steps.filter((step) => step.status === 'failed').length;
  const evidenceSummary = createProductionWorkflowPilotEvidenceSummary({
    template,
    childRecordHashes,
    blockReasons: readiness.blockers,
  });
  const status: ProductionWorkflowPilotStatus =
    failedStepCount > 0
      ? 'failed'
      : blockedStepCount > 0 || readiness.blockerCount > 0
        ? 'blocked'
        : 'completed';

  return ProductionWorkflowPilotRunSchema.parse({
    id: foundationId('production_workflow_pilot_run'),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: foundationTimestamp(),
    pilotRunId: foundationId('production_workflow_pilot_run'),
    templateId: template.templateId,
    templateHash: template.templateHash,
    source: input.source ?? 'catalog-template',
    status,
    steps,
    stepCount: steps.length,
    completedStepCount,
    blockedStepCount,
    failedStepCount,
    readiness,
    evidenceSummary,
    blockReasons: readiness.blockers,
    evidenceRefIds: steps.flatMap((step) => step.evidenceRefIds),
    auditEventIds: steps.flatMap((step) => step.auditEventIds),
    processBoundaryInvoked: false,
    externalProcessStarted: false,
    networkBoundaryInvoked: false,
    directAdapterExecutionAllowed: false,
    noRealWrite: true,
    bodyStored: false,
    rawPathStored: false,
    summary:
      status === 'completed'
        ? 'Production workflow pilot completed as metadata-only child coordination.'
        : 'Production workflow pilot did not complete because a prerequisite or child record is blocked.',
    metadata: {
      templateHash: template.templateHash,
      completedStepCount,
      blockedStepCount,
      failedStepCount,
    },
  });
}

export function runProductionWorkflowPilotRehearsal(
  input: ProductionWorkflowPilotRehearsalOptions = {},
): ProductionWorkflowPilotRun {
  const template = resolveProductionWorkflowPilotTemplate(input);
  const scenario = input.scenario ?? 'all-pass';
  const childRecordHashes = Object.fromEntries(
    template.steps
      .filter((step) => step.capabilityBinding.childApprovalRequired)
      .map((step) => [step.stepId, `sha256:${step.stepId}`]),
  );
  const childRunStatuses: Record<string, ProductionWorkflowChildRecordStatus> = {};
  let productionExecutionEnabled = true;
  let workflowApprovalApproved = true;

  switch (CustomWorkflowRehearsalScenarioSchema.parse(scenario)) {
    case 'template-disabled':
    case 'stale-template-hash':
      productionExecutionEnabled = false;
      break;
    case 'workflow-approval-blocked':
    case 'approval-blocked':
      workflowApprovalApproved = false;
      break;
    case 'child-approval-blocked':
    case 'child-run-missing':
    case 'missing-child-reference':
      for (const key of Object.keys(childRecordHashes)) {
        delete childRecordHashes[key];
      }
      break;
    case 'child-run-failed':
    case 'verification-failed': {
      const target =
        template.steps.find((step) => step.kind === 'nx-verification') ??
        template.steps.find((step) => step.capabilityBinding.childApprovalRequired);
      if (target) {
        childRunStatuses[target.stepId] = 'failed';
      }
      break;
    }
    case 'remote-step-blocked': {
      const target = template.steps.find((step) => step.kind.startsWith('github-'));
      if (target) {
        childRunStatuses[target.stepId] = 'blocked';
      }
      break;
    }
    case 'cleanup-blocked': {
      const target = template.steps.find((step) => step.kind === 'remote-cleanup');
      if (target) {
        childRunStatuses[target.stepId] = 'blocked';
      }
      break;
    }
    case 'superseded-source': {
      const target = template.steps.find((step) => step.kind === 'remote-supersede');
      if (target) {
        childRunStatuses[target.stepId] = 'stale';
      }
      break;
    }
    case 'invalid-template':
      productionExecutionEnabled = false;
      break;
    case 'all-pass':
      break;
  }

  return runProductionWorkflowPilot({
    template,
    childRecordHashes,
    childRunStatuses,
    productionExecutionEnabled,
    workflowApprovalApproved,
    source: 'fixture',
  });
}

function resolveProductionWorkflowPilotTemplate(input: {
  template?: CustomWorkflowTemplate;
  templateId?: string;
  templateHash?: string;
}): CustomWorkflowTemplate {
  const template =
    input.template ??
    findCustomWorkflowCatalogTemplate(input.templateId ?? 'local-patch-review') ??
    createCustomWorkflowTemplateFixture({
      templateId: input.templateId ?? 'local-patch-review',
    });
  if (input.templateHash && input.templateHash !== template.templateHash) {
    return CustomWorkflowTemplateSchema.parse({
      ...template,
      templateHash: input.templateHash,
      summary: 'Production workflow pilot template hash was provided as runtime metadata.',
    });
  }
  return template;
}

function createProductionWorkflowPilotReadiness(
  input: ProductionWorkflowPilotOptions = {},
): ProductionWorkflowPilotReadiness {
  const template = resolveProductionWorkflowPilotTemplate(input);
  const childRecordHashes = input.childRecordHashes ?? {};
  const childRunStatuses = input.childRunStatuses ?? {};
  const requiredChildSteps = template.steps.filter(
    (step) => step.capabilityBinding.childApprovalRequired,
  );
  const blockers: string[] = [];
  let missingChildRecordCount = 0;
  let staleChildRecordCount = 0;
  let failedChildRecordCount = 0;

  if (!builtInProductionTemplateIds.has(template.templateId)) {
    blockers.push('custom_workflow_template_not_from_catalog');
  }
  if (input.productionExecutionEnabled !== true) {
    blockers.push('custom_workflow_production_execution_disabled');
  }
  if (input.workflowApprovalApproved !== true) {
    blockers.push('custom_workflow_approval_missing_or_not_approved');
  }
  for (const step of requiredChildSteps) {
    const childHash = childRecordHashes[step.stepId];
    const childStatus = childRunStatuses[step.stepId];
    if (!childHash) {
      missingChildRecordCount += 1;
      blockers.push(`custom_workflow_child_run_missing:${step.stepId}`);
      continue;
    }
    if (childStatus === 'stale') {
      staleChildRecordCount += 1;
      blockers.push(`custom_workflow_child_run_stale:${step.stepId}`);
    }
    if (
      childStatus === 'failed' ||
      childStatus === 'blocked' ||
      childStatus === 'aborted'
    ) {
      failedChildRecordCount += 1;
      blockers.push(`custom_workflow_child_run_${childStatus}:${step.stepId}`);
    }
  }
  const status: ProductionWorkflowPilotStatus =
    blockers.length === 0 ? 'ready' : 'blocked';

  return ProductionWorkflowPilotReadinessSchema.parse({
    id: foundationId('production_workflow_pilot_readiness'),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: foundationTimestamp(),
    templateId: template.templateId,
    templateHash: template.templateHash,
    source: input.source ?? 'catalog-template',
    status,
    requiredChildStepCount: requiredChildSteps.length,
    missingChildRecordCount,
    staleChildRecordCount,
    failedChildRecordCount,
    blockerCount: blockers.length,
    blockers,
    approvalRequired: true,
    childApprovalsRequired: requiredChildSteps.length,
    productionExecutionEnabled: input.productionExecutionEnabled ?? false,
    directAdapterExecutionAllowed: false,
    bodyStored: false,
    rawPathStored: false,
    summary:
      status === 'ready'
        ? 'Production workflow pilot prerequisites are satisfied by existing child records.'
        : 'Production workflow pilot is blocked by template, approval, or child record state.',
    metadata: {
      templateHash: template.templateHash,
      blockerCount: blockers.length,
    },
  });
}

function createProductionWorkflowPilotEvidenceSummary(input: {
  template: CustomWorkflowTemplate;
  childRecordHashes: Record<string, string>;
  blockReasons: string[];
}): ProductionWorkflowPilotEvidenceSummary {
  const hashInput = JSON.stringify({
    templateHash: input.template.templateHash,
    childRecordHashCount: Object.keys(input.childRecordHashes).length,
    blockerCount: input.blockReasons.length,
  });
  const evidenceRefCount =
    input.template.steps.length + Object.keys(input.childRecordHashes).length;
  const auditEventCount = input.template.steps.length;

  return ProductionWorkflowPilotEvidenceSummarySchema.parse({
    evidenceRefCount,
    auditEventCount,
    evidenceBundleHash: hashText(`evidence:${hashInput}`),
    auditChainHash: hashText(`audit:${hashInput}`),
    bodyStored: false,
    rawPathStored: false,
    summary: 'Production workflow pilot evidence and audit are represented by hashes and counts.',
  });
}

export function createProductionWorkflowOperationsProjection(
  input: ProductionWorkflowOperationsProjectionOptions = {},
): ProductionWorkflowOperationsProjection {
  const template = resolveProductionWorkflowPilotTemplate(input);
  const pilotRun = input.pilotRun;
  const blockReasons = [
    ...(input.blockReasons ?? []),
    ...(pilotRun?.blockReasons ?? []),
  ];
  const staleChildRecordCount = input.staleChildRecordCount ?? 0;
  if (staleChildRecordCount > 0) {
    blockReasons.push('custom_workflow_stale_child_records');
  }
  const rollbackAvailable =
    input.rollbackAvailable ?? (pilotRun?.status === 'failed' ? true : false);
  const runHealth =
    rollbackAvailable
      ? 'rollback-required'
      : blockReasons.length > 0 || pilotRun?.status === 'blocked'
        ? 'blocked'
        : pilotRun?.status === 'failed' || pilotRun?.status === 'aborted'
          ? 'degraded'
          : 'healthy';

  return ProductionWorkflowOperationsProjectionSchema.parse({
    id: foundationId('production_workflow_operations'),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: foundationTimestamp(),
    templateId: template.templateId,
    templateHash: template.templateHash,
    latestPilotRunIdHash: pilotRun ? hashText(pilotRun.pilotRunId) : undefined,
    runHealth,
    approvalState: input.approvalState ?? 'requested',
    blockedReasonCount: blockReasons.length,
    blockedReasons: blockReasons,
    staleChildRecordCount,
    rollbackAvailable,
    operatorNextActionSummary:
      blockReasons.length === 0
        ? 'Continue monitoring production workflow child records.'
        : 'Resolve blockers through existing child control planes before running the workflow again.',
    evidenceRefCount: pilotRun?.evidenceRefIds.length ?? 0,
    auditEventCount: pilotRun?.auditEventIds.length ?? 0,
    processBoundaryInvoked: false,
    externalProcessStarted: false,
    networkBoundaryInvoked: false,
    directAdapterExecutionAllowed: false,
    noRealWrite: true,
    bodyStored: false,
    rawPathStored: false,
    summary:
      blockReasons.length === 0
        ? 'Production workflow operations projection is healthy.'
        : 'Production workflow operations projection is blocked or degraded.',
    metadata: {
      templateHash: template.templateHash,
      blockedReasonCount: blockReasons.length,
    },
  });
}

export function createProductionWorkflowPauseSummary(
  input: ProductionWorkflowOperationIntentOptions,
): ProductionWorkflowPauseSummary {
  return ProductionWorkflowPauseSummarySchema.parse({
    id: foundationId('production_workflow_pause'),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: foundationTimestamp(),
    actionId: foundationId('production_workflow_pause'),
    sourceRunIdHash: input.sourceRunIdHash,
    affectedTemplateHash: input.affectedTemplateHash,
    reasonHash: input.reasonHash,
    status: 'paused',
    processBoundaryInvoked: false,
    externalProcessStarted: false,
    networkBoundaryInvoked: false,
    directAdapterExecutionAllowed: false,
    noRealWrite: true,
    bodyStored: false,
    rawPathStored: false,
    summary: 'Production workflow pause records operator intent only.',
  });
}

export function createProductionWorkflowResumeSummary(
  input: ProductionWorkflowOperationIntentOptions,
): ProductionWorkflowResumeSummary {
  return ProductionWorkflowResumeSummarySchema.parse({
    id: foundationId('production_workflow_resume'),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: foundationTimestamp(),
    actionId: foundationId('production_workflow_resume'),
    sourceRunIdHash: input.sourceRunIdHash,
    affectedTemplateHash: input.affectedTemplateHash,
    reasonHash: input.reasonHash,
    status: 'healthy',
    processBoundaryInvoked: false,
    externalProcessStarted: false,
    networkBoundaryInvoked: false,
    directAdapterExecutionAllowed: false,
    noRealWrite: true,
    bodyStored: false,
    rawPathStored: false,
    summary: 'Production workflow resume records operator intent only.',
  });
}

export function createProductionWorkflowRollbackSummary(
  input: ProductionWorkflowOperationIntentOptions,
): ProductionWorkflowRollbackSummary {
  return ProductionWorkflowRollbackSummarySchema.parse({
    id: foundationId('production_workflow_rollback'),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: foundationTimestamp(),
    actionId: foundationId('production_workflow_rollback'),
    sourceRunIdHash: input.sourceRunIdHash,
    affectedTemplateHash: input.affectedTemplateHash,
    reasonHash: input.reasonHash,
    status: 'rollback-required',
    processBoundaryInvoked: false,
    externalProcessStarted: false,
    networkBoundaryInvoked: false,
    directAdapterExecutionAllowed: false,
    noRealWrite: true,
    bodyStored: false,
    rawPathStored: false,
    summary: 'Production workflow rollback records operator intent only.',
  });
}

export function runProductionWorkflowOperationsSmoke(input: {
  template?: CustomWorkflowTemplate;
  templateId?: string;
  scenario?: ProductionWorkflowOperationsSmokeScenario;
} = {}): ProductionWorkflowOperationsSmokeRun {
  const template = resolveProductionWorkflowPilotTemplate(input);
  const scenario = input.scenario ?? 'healthy';
  const blockReasons = createProductionWorkflowOperationsSmokeBlockReasons(scenario);
  const pilotRun = runProductionWorkflowPilotRehearsal({
    template,
    scenario:
      scenario === 'remote-child-blocked'
        ? 'remote-step-blocked'
        : scenario === 'stale-child-record'
          ? 'superseded-source'
          : scenario === 'approval-used'
            ? 'workflow-approval-blocked'
            : scenario === 'production-disabled' || scenario === 'stale-template'
              ? 'template-disabled'
              : 'all-pass',
  });
  const projection = createProductionWorkflowOperationsProjection({
    template,
    pilotRun,
    approvalState: scenario === 'approval-used' ? 'used' : 'approved',
    staleChildRecordCount: scenario === 'stale-child-record' ? 1 : 0,
    rollbackAvailable: scenario === 'rollback-required',
    blockReasons,
  });

  return ProductionWorkflowOperationsSmokeRunSchema.parse({
    id: foundationId('production_workflow_operations_smoke'),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: foundationTimestamp(),
    scenario,
    status: projection.runHealth,
    projection,
    fixtureOnly: true,
    processBoundaryInvoked: false,
    externalProcessStarted: false,
    networkBoundaryInvoked: false,
    directAdapterExecutionAllowed: false,
    noRealWrite: true,
    bodyStored: false,
    rawPathStored: false,
    summary: 'Production workflow operations smoke is fixture-only.',
    metadata: { scenario },
  });
}

export function createProductionWorkflowRecoveryPlan(
  input: ProductionWorkflowRecoveryOptions = {},
): ProductionWorkflowRecoveryPlan {
  const template = resolveProductionWorkflowPilotTemplate(input);
  const childActionPlans = createProductionWorkflowChildActionPlans(template);
  const blockReasons = createProductionWorkflowRecoveryPlanBlockReasons(
    template,
    input,
  );

  return ProductionWorkflowRecoveryPlanSchema.parse({
    id: foundationId('production_workflow_recovery_plan'),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: foundationTimestamp(),
    dryRunId: input.dryRunId ?? foundationId('production_workflow_recovery_dry_run'),
    templateId: template.templateId,
    templateHash: template.templateHash,
    sourceRunIdHash:
      input.sourceRunIdHash ?? `sha256:${hashText(template.templateHash)}`,
    status: blockReasons.length === 0 ? 'planned' : 'blocked',
    childActionPlans,
    childActionCount: childActionPlans.length,
    approvalRequired: true,
    childApprovalsRequired: childActionPlans.filter(
      (action) => action.requiresChildApproval,
    ).length,
    blockReasons,
    evidenceRefIds: [],
    auditEventIds: [],
    processBoundaryInvoked: false,
    externalProcessStarted: false,
    networkBoundaryInvoked: false,
    directAdapterExecutionAllowed: false,
    childAdapterExecuteAllowed: false,
    noRealWrite: true,
    bodyStored: false,
    rawPathStored: false,
    summary:
      blockReasons.length === 0
        ? 'Production workflow recovery plan created a governed child action queue.'
        : 'Production workflow recovery plan is blocked before child orchestration.',
    metadata: {
      templateHash: template.templateHash,
      childActionCount: childActionPlans.length,
      blockerCount: blockReasons.length,
    },
  });
}

export function createProductionWorkflowRecoveryApprovalArtifact(input: {
  dryRunId: string;
  templateId: string;
  templateHash: string;
  status?: ProductionWorkflowRecoveryApprovalArtifact['status'];
  approvedBy?: string;
  reasonHash?: string;
  reasonSummary?: string;
  approvalArtifactId?: string;
  expiresAt?: string;
  usedAt?: string;
}): ProductionWorkflowRecoveryApprovalArtifact {
  return ProductionWorkflowRecoveryApprovalArtifactSchema.parse({
    id: foundationId('production_workflow_recovery_approval'),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: foundationTimestamp(),
    dryRunId: input.dryRunId,
    templateId: input.templateId,
    templateHash: input.templateHash,
    approvalArtifactId:
      input.approvalArtifactId ?? foundationId('production_workflow_recovery_artifact'),
    status: input.status ?? 'requested',
    approvedBy: input.approvedBy,
    reasonHash: input.reasonHash,
    reasonSummary: input.reasonSummary
      ? 'Production workflow recovery approval reason stored as hash-only summary.'
      : undefined,
    expiresAt: input.expiresAt,
    usedAt: input.usedAt,
    childApprovalsIncluded: false,
    bodyStored: false,
    rawPathStored: false,
    summary: `Production workflow recovery approval ${input.status ?? 'requested'}.`,
    metadata: { templateHash: input.templateHash },
  });
}

export function runProductionWorkflowRecoveryCoordinator(
  input: ProductionWorkflowRecoveryOptions = {},
): ProductionWorkflowRecoveryRun {
  const plan = createProductionWorkflowRecoveryPlan(input);
  const workflowApprovalApproved =
    input.workflowApprovalApproved === true ||
    input.approvalArtifact?.status === 'approved';
  const globalBlockReasons = [...plan.blockReasons];
  if (!workflowApprovalApproved) {
    globalBlockReasons.push('production_workflow_recovery_approval_missing_or_not_approved');
  }

  const childApprovalApproved = input.childApprovalApproved ?? {};
  const childRunStatuses = input.childRunStatuses ?? {};
  const childActionStates: ProductionWorkflowChildActionState[] = [];
  const recoverySteps: ProductionWorkflowRecoveryStep[] = [];
  let blockedByPriorStep = globalBlockReasons.length > 0;
  let overallStatus: ProductionWorkflowRecoveryStatus =
    !workflowApprovalApproved && plan.blockReasons.length === 0
      ? 'waiting_for_workflow_approval'
      : plan.status === 'blocked'
        ? 'blocked'
        : 'completed';

  for (const action of plan.childActionPlans) {
    const runtimeStatus = getProductionWorkflowRecoveryChildRuntimeStatus(
      childRunStatuses,
      action,
    );
    const actionApproved = getProductionWorkflowRecoveryChildApproval(
      childApprovalApproved,
      action,
    );
    const actionBlockReasons: string[] = [];
    let childStatus: ProductionWorkflowChildActionState['status'] = 'planned';
    let stepStatus: ProductionWorkflowRecoveryStatus = 'planned';

    if (blockedByPriorStep) {
      childStatus = 'skipped';
      stepStatus = overallStatus === 'waiting_for_workflow_approval' ? overallStatus : 'blocked';
      actionBlockReasons.push(...globalBlockReasons);
    } else if (runtimeStatus === 'dry_run_failed') {
      childStatus = 'blocked';
      stepStatus = 'blocked';
      actionBlockReasons.push(`production_workflow_child_dry_run_failed:${action.stepId}`);
      overallStatus = 'blocked';
      blockedByPriorStep = true;
    } else if (action.requiresChildApproval && actionApproved !== true) {
      childStatus =
        runtimeStatus === 'approval_requested'
          ? 'approval_requested'
          : 'waiting_for_child_approval';
      stepStatus = 'waiting_for_child_approval';
      actionBlockReasons.push(`production_workflow_child_approval_required:${action.stepId}`);
      overallStatus = 'waiting_for_child_approval';
      blockedByPriorStep = true;
    } else if (runtimeStatus === 'failed' || runtimeStatus === 'aborted') {
      childStatus = 'failed';
      stepStatus = 'failed';
      actionBlockReasons.push(`production_workflow_child_run_${runtimeStatus}:${action.stepId}`);
      overallStatus = 'failed';
      blockedByPriorStep = true;
    } else if (runtimeStatus === 'blocked' || runtimeStatus === 'stale') {
      childStatus = 'blocked';
      stepStatus = 'blocked';
      actionBlockReasons.push(`production_workflow_child_run_${runtimeStatus}:${action.stepId}`);
      overallStatus = 'blocked';
      blockedByPriorStep = true;
    } else if (runtimeStatus === 'waiting_for_child_approval') {
      childStatus = 'waiting_for_child_approval';
      stepStatus = 'waiting_for_child_approval';
      actionBlockReasons.push(`production_workflow_child_approval_required:${action.stepId}`);
      overallStatus = 'waiting_for_child_approval';
      blockedByPriorStep = true;
    } else {
      childStatus = 'completed';
      stepStatus = 'completed';
    }

    const childState = ProductionWorkflowChildActionStateSchema.parse({
      actionId: action.actionId,
      stepId: action.stepId,
      stepKind: action.stepKind,
      childActionKind: action.childActionKind,
      childControlPlane: action.childControlPlane,
      status: childStatus,
      childDryRunIdHash:
        childStatus === 'skipped'
          ? undefined
          : `sha256:${hashText(`${action.actionId}:dry-run`)}`,
      childApprovalRequestIdHash:
        action.requiresChildApproval && childStatus !== 'skipped'
          ? `sha256:${hashText(`${action.actionId}:approval-request`)}`
          : undefined,
      childApprovalArtifactIdHash:
        action.requiresChildApproval && actionApproved
          ? `sha256:${hashText(`${action.actionId}:approval-artifact`)}`
          : undefined,
      childRunIdHash:
        childStatus === 'completed' || childStatus === 'failed' || childStatus === 'blocked'
          ? `sha256:${hashText(`${action.actionId}:run`)}`
          : undefined,
      childHashBindingMatched:
        childStatus !== 'skipped' && childStatus !== 'waiting_for_child_approval',
      childApprovalRequired: action.requiresChildApproval,
      childApprovalResolvedFromStore: action.requiresChildApproval ? actionApproved === true : true,
      childAutoApprovalAllowed: false,
      childAdapterExecuteAllowed: false,
      blockReasons: actionBlockReasons,
      evidenceRefIds:
        childStatus === 'completed' ? [`evidence:${hashText(action.actionId)}`] : [],
      auditEventIds:
        childStatus === 'completed' ? [`audit:${hashText(action.actionId)}`] : [],
      processBoundaryInvoked: false,
      externalProcessStarted: false,
      networkBoundaryInvoked: false,
      bodyStored: false,
      rawPathStored: false,
      summary:
        childStatus === 'completed'
          ? `${action.childActionKind} child action is satisfied through its child control plane.`
          : `${action.childActionKind} child action is waiting or blocked before direct execution.`,
    });
    childActionStates.push(childState);
    recoverySteps.push(
      ProductionWorkflowRecoveryStepSchema.parse({
        stepId: action.stepId,
        kind: action.stepKind,
        status: stepStatus,
        childActionStates: [childState],
        blockReasons: actionBlockReasons,
        evidenceRefIds: childState.evidenceRefIds,
        auditEventIds: childState.auditEventIds,
        processBoundaryInvoked: false,
        externalProcessStarted: false,
        networkBoundaryInvoked: false,
        directAdapterExecutionAllowed: false,
        bodyStored: false,
        rawPathStored: false,
        summary:
          stepStatus === 'completed'
            ? `${action.stepKind} recovery step completed through child metadata.`
            : `${action.stepKind} recovery step is waiting or blocked.`,
      }),
    );
  }

  const completedChildActionCount = childActionStates.filter(
    (state) => state.status === 'completed',
  ).length;
  const waitingChildApprovalCount = childActionStates.filter(
    (state) =>
      state.status === 'waiting_for_child_approval' ||
      state.status === 'approval_requested',
  ).length;
  const failedChildActionCount = childActionStates.filter(
    (state) => state.status === 'failed',
  ).length;
  const blockReasons = uniqueValues([
    ...globalBlockReasons,
    ...childActionStates.flatMap((state) => state.blockReasons),
  ]);
  if (childActionStates.length === 0 && overallStatus === 'completed') {
    overallStatus = blockReasons.length === 0 ? 'completed' : 'blocked';
  }
  const lastCompletedStep = [...recoverySteps]
    .reverse()
    .find((step) => step.status === 'completed');

  return ProductionWorkflowRecoveryRunSchema.parse({
    id: foundationId('production_workflow_recovery_run'),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: foundationTimestamp(),
    recoveryRunId: foundationId('production_workflow_recovery_run'),
    dryRunId: plan.dryRunId,
    approvalArtifactId: input.approvalArtifact?.approvalArtifactId,
    templateId: plan.templateId,
    templateHash: plan.templateHash,
    status: overallStatus,
    steps: recoverySteps,
    childActionStates,
    stepCount: recoverySteps.length,
    childActionCount: childActionStates.length,
    completedChildActionCount,
    waitingChildApprovalCount,
    failedChildActionCount,
    lastSafeStepId: lastCompletedStep?.stepId,
    resumeFromStepId: input.resumeFromStepId,
    blockReasons,
    evidenceRefIds: childActionStates.flatMap((state) => state.evidenceRefIds),
    auditEventIds: childActionStates.flatMap((state) => state.auditEventIds),
    processBoundaryInvoked: false,
    externalProcessStarted: false,
    networkBoundaryInvoked: false,
    directAdapterExecutionAllowed: false,
    childAdapterExecuteAllowed: false,
    noRealWrite: true,
    bodyStored: false,
    rawPathStored: false,
    summary:
      overallStatus === 'completed'
        ? 'Production workflow recovery completed through approved child control-plane records.'
        : 'Production workflow recovery is waiting or blocked before unsafe execution.',
    metadata: {
      templateHash: plan.templateHash,
      childActionCount: childActionStates.length,
      blockerCount: blockReasons.length,
    },
  });
}

export function runProductionWorkflowRecoveryRehearsal(
  input: ProductionWorkflowRecoveryRehearsalOptions = {},
): ProductionWorkflowRecoveryRun {
  const template = resolveProductionWorkflowPilotTemplate(input);
  const scenario = ProductionWorkflowRecoveryScenarioSchema.parse(
    input.scenario ?? 'all-pass',
  );
  const plan = createProductionWorkflowRecoveryPlan({
    template,
    recoveryEnabled: true,
    childOrchestrationEnabled: true,
  });
  const childApprovalApproved = Object.fromEntries(
    plan.childActionPlans.map((action) => [action.actionId, true]),
  );
  const childRunStatuses: Record<string, ProductionWorkflowChildActionRuntimeStatus> = {};
  let workflowApprovalApproved = true;
  let recoveryEnabled = true;
  let childOrchestrationEnabled = true;

  switch (scenario) {
    case 'workflow-approval-blocked':
      workflowApprovalApproved = false;
      break;
    case 'child-dry-run-failed': {
      const target = plan.childActionPlans[0];
      if (target) {
        childRunStatuses[target.actionId] = 'dry_run_failed';
      }
      break;
    }
    case 'child-approval-blocked':
    case 'child-run-missing': {
      const target = plan.childActionPlans.find((action) => action.requiresChildApproval);
      if (target) {
        childApprovalApproved[target.actionId] = false;
      }
      break;
    }
    case 'nx-verification-failed': {
      const target = plan.childActionPlans.find(
        (action) => action.childActionKind === 'nx-verification',
      );
      if (target) {
        childRunStatuses[target.actionId] = 'failed';
      }
      break;
    }
    case 'review-package-blocked': {
      const target = plan.childActionPlans.find(
        (action) => action.childActionKind === 'review-package-export',
      );
      if (target) {
        childRunStatuses[target.actionId] = 'blocked';
      }
      break;
    }
    case 'branch-publish-failed': {
      const target = plan.childActionPlans.find(
        (action) => action.childActionKind === 'github-branch-publish',
      );
      if (target) {
        childRunStatuses[target.actionId] = 'failed';
      }
      break;
    }
    case 'draft-pr-failed': {
      const target = plan.childActionPlans.find(
        (action) => action.childActionKind === 'github-draft-pr',
      );
      if (target) {
        childRunStatuses[target.actionId] = 'failed';
      }
      break;
    }
    case 'lifecycle-checks-failed': {
      const target = plan.childActionPlans.find(
        (action) => action.childActionKind === 'github-pr-lifecycle',
      );
      if (target) {
        childRunStatuses[target.actionId] = 'failed';
      }
      break;
    }
    case 'remote-cleanup-blocked': {
      const target = plan.childActionPlans.find(
        (action) => action.childActionKind === 'remote-cleanup',
      );
      if (target) {
        childRunStatuses[target.actionId] = 'blocked';
      }
      break;
    }
    case 'resume-after-child-approval':
      break;
    case 'superseded-source':
      recoveryEnabled = true;
      childOrchestrationEnabled = false;
      break;
    case 'all-pass':
      break;
  }

  const rehearsalPlan = createProductionWorkflowRecoveryPlan({
    template,
    recoveryEnabled,
    childOrchestrationEnabled,
  });
  const approval = createProductionWorkflowRecoveryApprovalArtifact({
    dryRunId: rehearsalPlan.dryRunId,
    templateId: rehearsalPlan.templateId,
    templateHash: rehearsalPlan.templateHash,
    status: workflowApprovalApproved ? 'approved' : 'requested',
    approvedBy: workflowApprovalApproved ? 'operator' : undefined,
    reasonHash: workflowApprovalApproved ? 'sha256:fixture-reason' : undefined,
    reasonSummary: workflowApprovalApproved ? 'Fixture workflow recovery approval.' : undefined,
  });

  return runProductionWorkflowRecoveryCoordinator({
    template,
    dryRunId: rehearsalPlan.dryRunId,
    recoveryEnabled,
    childOrchestrationEnabled,
    workflowApprovalApproved,
    approvalArtifact: approval,
    childApprovalApproved,
    childRunStatuses,
    resumeFromStepId:
      scenario === 'resume-after-child-approval'
        ? plan.childActionPlans[0]?.stepId
        : undefined,
  });
}

function createProductionWorkflowOperationsSmokeBlockReasons(
  scenario: ProductionWorkflowOperationsSmokeScenario,
): string[] {
  switch (scenario) {
    case 'healthy':
      return [];
    case 'production-disabled':
      return ['custom_workflow_production_execution_disabled'];
    case 'stale-template':
      return ['custom_workflow_template_hash_stale'];
    case 'stale-child-record':
      return ['custom_workflow_stale_child_records'];
    case 'approval-used':
      return ['custom_workflow_approval_already_used'];
    case 'rollback-required':
      return ['custom_workflow_rollback_required'];
    case 'remote-child-blocked':
      return ['custom_workflow_remote_child_blocked'];
  }
}

function createProductionWorkflowChildActionPlans(
  template: CustomWorkflowTemplate,
): ProductionWorkflowChildActionPlan[] {
  return template.steps.flatMap((step) => {
    const binding = productionRecoveryChildBindings[step.kind];
    if (!binding) {
      return [];
    }
    return [
      ProductionWorkflowChildActionPlanSchema.parse({
        actionId: `child_action_${step.stepId}`,
        stepId: step.stepId,
        stepKind: step.kind,
        childActionKind: binding.childActionKind,
        childControlPlane: binding.childControlPlane,
        actionMode: step.actionMode,
        riskLevel: step.riskLevel,
        requiresChildApproval: step.capabilityBinding.childApprovalRequired,
        createsChildDryRun: true,
        createsChildApprovalRequest: step.capabilityBinding.childApprovalRequired,
        childAutoApprovalAllowed: false,
        childAdapterExecuteAllowed: false,
        hashBindingRequired: true,
        summary: `${step.kind} recovery child action is bound to ${binding.childControlPlane}.`,
      }),
    ];
  });
}

function createProductionWorkflowRecoveryPlanBlockReasons(
  template: CustomWorkflowTemplate,
  input: ProductionWorkflowRecoveryOptions,
): string[] {
  const blockReasons: string[] = [];
  if (!builtInProductionTemplateIds.has(template.templateId)) {
    blockReasons.push('production_workflow_recovery_template_not_from_catalog');
  }
  if (input.templateHash && input.templateHash !== template.templateHash) {
    blockReasons.push('production_workflow_recovery_template_hash_mismatch');
  }
  if (input.recoveryEnabled !== true) {
    blockReasons.push('production_workflow_recovery_disabled');
  }
  if (input.childOrchestrationEnabled !== true) {
    blockReasons.push('production_workflow_child_orchestration_disabled');
  }
  if (createProductionWorkflowChildActionPlans(template).length === 0) {
    blockReasons.push('production_workflow_recovery_no_child_actions');
  }
  return blockReasons;
}

function getProductionWorkflowRecoveryChildRuntimeStatus(
  statuses: Record<string, ProductionWorkflowChildActionRuntimeStatus>,
  action: ProductionWorkflowChildActionPlan,
): ProductionWorkflowChildActionRuntimeStatus | undefined {
  return (
    statuses[action.actionId] ??
    statuses[action.stepId] ??
    statuses[action.childActionKind] ??
    statuses[action.childControlPlane]
  );
}

function getProductionWorkflowRecoveryChildApproval(
  approvals: Record<string, boolean>,
  action: ProductionWorkflowChildActionPlan,
): boolean | undefined {
  return (
    approvals[action.actionId] ??
    approvals[action.stepId] ??
    approvals[action.childActionKind] ??
    approvals[action.childControlPlane]
  );
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

function createCustomWorkflowCatalogEntry(
  template: CustomWorkflowTemplate,
  validationReport?: CustomWorkflowValidationReport,
): CustomWorkflowCatalogEntry {
  const requiredStepKinds = uniqueValues(template.steps.map((step) => step.kind));
  const requiredCapabilityKinds = uniqueValues(
    template.steps.map((step) => step.capabilityBinding.capabilityKind),
  );
  const childApprovalsRequired = template.steps.filter(
    (step) => step.capabilityBinding.childApprovalRequired,
  ).length;
  const approvalRequired = template.steps.some(
    (step) =>
      step.capabilityBinding.requiresApproval ||
      step.actionMode === 'write' ||
      step.actionMode === 'admin',
  );
  const source = builtInProductionTemplateIds.has(template.templateId)
    ? 'built-in'
    : 'workspace';
  const family = getCustomWorkflowTemplateFamily(template.templateId);

  return CustomWorkflowCatalogEntrySchema.parse({
    id: foundationId('custom_workflow_catalog_entry'),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: foundationTimestamp(),
    templateId: template.templateId,
    templateHash: template.templateHash,
    family,
    displayName: getCustomWorkflowDisplayName(template.templateId),
    source,
    validationStatus: validationReport?.status ?? 'valid',
    riskLevel: template.riskLevel,
    stepCount: template.stepCount,
    capabilityCount: requiredCapabilityKinds.length,
    requiredStepKinds,
    requiredCapabilityKinds,
    approvalRequired,
    childApprovalsRequired,
    enabledByDefault: false,
    productionExecutionEnabled: false,
    directAdapterExecutionAllowed: false,
    bodyStored: false,
    rawPathStored: false,
    configBodyStored: false,
    summary: `${getCustomWorkflowDisplayName(template.templateId)} is registered as a disabled production workflow template.`,
    metadata: {
      templateHash: template.templateHash,
      source,
      family,
    },
  });
}

function createCustomWorkflowCatalogReadiness(
  entry: CustomWorkflowCatalogEntry,
  options: CustomWorkflowCatalogOptions,
): CustomWorkflowCatalogReadiness {
  const requiredEnvFlags =
    options.requiredEnvFlags ?? defaultCustomWorkflowRequiredEnvFlags;
  const configuredEnvFlags = new Set(options.configuredEnvFlags ?? []);
  const missingEnvFlags = requiredEnvFlags.filter(
    (flag) => !configuredEnvFlags.has(flag),
  );
  const integrationEnabled = options.integrationEnabled ?? false;
  const productionExecutionEnabled = options.productionExecutionEnabled ?? false;
  const blockers: string[] = [];
  if (entry.validationStatus !== 'valid') {
    blockers.push('custom_workflow_template_invalid');
  }
  if (!integrationEnabled) {
    blockers.push('custom_workflow_integration_disabled');
  }
  if (!productionExecutionEnabled) {
    blockers.push('custom_workflow_production_execution_disabled');
  }
  for (const flag of missingEnvFlags) {
    blockers.push(`custom_workflow_env_missing:${flag}`);
  }
  const status =
    blockers.length === 0
      ? 'ready'
      : !integrationEnabled || !productionExecutionEnabled
        ? 'disabled'
        : 'blocked';

  return CustomWorkflowCatalogReadinessSchema.parse({
    id: foundationId('custom_workflow_catalog_readiness'),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: foundationTimestamp(),
    templateId: entry.templateId,
    templateHash: entry.templateHash,
    status,
    productionExecutionEnabled,
    integrationEnabled,
    requiredEnvFlags,
    configuredEnvFlagCount: requiredEnvFlags.length - missingEnvFlags.length,
    missingEnvFlagCount: missingEnvFlags.length,
    childCapabilityCount: entry.requiredCapabilityKinds.length,
    approvalRequired: entry.approvalRequired,
    blockerCount: blockers.length,
    blockers,
    evidenceRefIds: [],
    auditEventIds: [],
    directAdapterExecutionAllowed: false,
    processBoundaryInvoked: false,
    externalProcessStarted: false,
    networkBoundaryInvoked: false,
    bodyStored: false,
    rawPathStored: false,
    summary:
      status === 'ready'
        ? `${entry.displayName} is ready for governed production dry-run binding.`
        : `${entry.displayName} remains blocked or disabled for production execution.`,
    metadata: {
      templateHash: entry.templateHash,
      blockerCount: blockers.length,
    },
  });
}

function createCustomWorkflowProductionValidationSummary(
  report: CustomWorkflowValidationReport,
): CustomWorkflowProductionTemplateValidationSummary {
  return CustomWorkflowProductionTemplateValidationSummarySchema.parse({
    id: foundationId('custom_workflow_catalog_validation'),
    schemaVersion: SchemaVersionSchema.value,
    createdAt: foundationTimestamp(),
    templateId: report.templateId,
    templateHash: report.templateHash,
    status: report.status,
    issueCount: report.issueCount,
    unknownStepKindCount: report.unknownStepKindCount,
    policyWeakeningDetected: false,
    rawBodyDetected: false,
    rawPathStored: false,
    bodyStored: false,
    configBodyStored: false,
    summary:
      report.status === 'valid'
        ? 'Production workflow template validation passed.'
        : `Production workflow template validation found ${report.issueCount} issues.`,
    metadata: { templateHash: report.templateHash },
  });
}

function createCustomWorkflowFamilySummaries(
  entries: CustomWorkflowCatalogEntry[],
  readiness: CustomWorkflowCatalogReadiness[],
): CustomWorkflowTemplateFamilySummary[] {
  const readinessByTemplate = new Map(
    readiness.map((item) => [item.templateId, item]),
  );
  const groups = new Map<string, CustomWorkflowCatalogEntry[]>();
  for (const entry of entries) {
    groups.set(entry.family, [...(groups.get(entry.family) ?? []), entry]);
  }

  return [...groups.entries()].map(([family, familyEntries]) => {
    const validTemplateCount = familyEntries.filter(
      (entry) => entry.validationStatus === 'valid',
    ).length;
    const blockedTemplateCount = familyEntries.filter((entry) => {
      const item = readinessByTemplate.get(entry.templateId);
      return item?.status !== 'ready';
    }).length;
    const highestRisk = familyEntries
      .map((entry) => entry.riskLevel)
      .sort(compareRiskDescending)[0] ?? 'low';

    return CustomWorkflowTemplateFamilySummarySchema.parse({
      id: foundationId('custom_workflow_family'),
      schemaVersion: SchemaVersionSchema.value,
      createdAt: foundationTimestamp(),
      family,
      templateCount: familyEntries.length,
      validTemplateCount,
      blockedTemplateCount,
      highestRisk,
      enabledByDefault: false,
      productionExecutionEnabled: false,
      summary: `Workflow family ${family} has ${familyEntries.length} disabled production templates.`,
      metadata: { family, templateCount: familyEntries.length },
    });
  });
}

function findValidationReport(
  reports: CustomWorkflowValidationReport[],
  template: CustomWorkflowTemplate,
): CustomWorkflowValidationReport | undefined {
  return reports.find(
    (report) =>
      report.templateId === template.templateId &&
      report.templateHash === template.templateHash,
  );
}

function findCustomWorkflowWorkspaceRoot(startPath: string): string {
  let current = resolve(startPath);
  while (true) {
    if (existsSync(resolve(current, '.codexhub', 'workflows'))) {
      return current;
    }
    const parent = dirname(current);
    if (parent === current) {
      return resolve(startPath);
    }
    current = parent;
  }
}

function getCustomWorkflowTemplateFamily(templateId: string): string {
  if (templateId.startsWith('local-')) {
    return 'local';
  }
  if (templateId.startsWith('github-') || templateId.startsWith('rework-')) {
    return 'github';
  }
  return 'custom';
}

function getCustomWorkflowDisplayName(templateId: string): string {
  return templateId
    .split('-')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function uniqueValues<T extends string>(values: T[]): T[] {
  return [...new Set(values)];
}

function compareRiskDescending(a: RiskLevel, b: RiskLevel): number {
  const order: Record<RiskLevel, number> = {
    critical: 4,
    high: 3,
    medium: 2,
    low: 1,
  };
  return order[b] - order[a];
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
    case 'template-disabled':
      return ['custom_workflow_template_production_disabled'];
    case 'stale-template-hash':
      return ['custom_workflow_template_hash_stale'];
    case 'invalid-template':
      return ['custom_workflow_template_invalid'];
    case 'missing-child-reference':
      return ['custom_workflow_child_reference_missing'];
    case 'workflow-approval-blocked':
      return ['custom_workflow_approval_missing_or_not_approved'];
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
    case 'child-run-missing':
      return ['custom_workflow_child_run_missing'];
    case 'child-run-failed':
      return ['custom_workflow_child_run_failed'];
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

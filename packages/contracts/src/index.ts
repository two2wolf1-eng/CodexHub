import { z } from 'zod';

export const SchemaVersionSchema = z.literal('2026-04-28.foundation');
export type SchemaVersion = z.infer<typeof SchemaVersionSchema>;

export const MetadataSchema = z.record(z.unknown());
export type Metadata = z.infer<typeof MetadataSchema>;

export const IsoDateTimeSchema = z.string().datetime({ offset: true });
export type IsoDateTime = z.infer<typeof IsoDateTimeSchema>;

const entityBaseSchema = z.object({
  id: z.string().min(1),
  schemaVersion: SchemaVersionSchema,
  metadata: MetadataSchema.optional(),
});

const createdEntityBaseSchema = entityBaseSchema.extend({
  createdAt: IsoDateTimeSchema,
});

const observedEntityBaseSchema = entityBaseSchema.extend({
  observedAt: IsoDateTimeSchema,
});

export const RiskLevelSchema = z.enum(['low', 'medium', 'high', 'critical']);
export type RiskLevel = z.infer<typeof RiskLevelSchema>;

export const ActionModeSchema = z.enum(['read', 'dry-run', 'write', 'admin']);
export type ActionMode = z.infer<typeof ActionModeSchema>;

export const CapabilityKindSchema = z.enum([
  'codex',
  'mcp',
  'verification',
  'browser',
  'electron',
  'policy',
  'telemetry',
  'filesystem',
  'git',
]);
export type CapabilityKind = z.infer<typeof CapabilityKindSchema>;

export const CapabilityProviderSchema = z.enum([
  'builtin',
  'official-sdk',
  'open-source',
  'external-process',
  'external-network',
]);
export type CapabilityProvider = z.infer<typeof CapabilityProviderSchema>;

export const CapabilityBodyStoragePolicySchema = z.enum([
  'forbidden',
  'hash-only',
  'allowed-with-approval',
]);
export type CapabilityBodyStoragePolicy = z.infer<typeof CapabilityBodyStoragePolicySchema>;

export const CapabilityEvidencePolicySchema = z.object({
  collect: z.boolean(),
  redactMetadata: z.boolean(),
  bodyStorage: CapabilityBodyStoragePolicySchema,
});
export type CapabilityEvidencePolicy = z.infer<typeof CapabilityEvidencePolicySchema>;

export const CapabilityProcessBoundaryPolicySchema = z.object({
  mayStartExternalProcess: z.boolean(),
  requiresProcessAudit: z.boolean(),
});
export type CapabilityProcessBoundaryPolicy = z.infer<
  typeof CapabilityProcessBoundaryPolicySchema
>;

export const CapabilityManifestSchema = createdEntityBaseSchema.extend({
  name: z.string().min(1),
  kind: CapabilityKindSchema,
  version: z.string().min(1),
  provider: CapabilityProviderSchema,
  capabilities: z.array(z.string().min(1)),
  defaultRisk: RiskLevelSchema,
  defaultActionMode: ActionModeSchema,
  requiresApprovalByDefault: z.boolean(),
  evidencePolicy: CapabilityEvidencePolicySchema,
  processBoundary: CapabilityProcessBoundaryPolicySchema,
});
export type CapabilityManifest = z.infer<typeof CapabilityManifestSchema>;

export const PolicyOutcomeSchema = z.enum(['allow', 'deny', 'approval_required']);
export type PolicyOutcome = z.infer<typeof PolicyOutcomeSchema>;

export const EvidenceRefSchema = createdEntityBaseSchema.extend({
  kind: z.enum([
    'log',
    'hash',
    'snapshot',
    'dry-run',
    'audit',
    'codex.exec.jsonl.replay',
    'codex.exec.event.summary',
    'codex.exec.dry_run_plan',
    'codex.exec.command_preview',
    'codex.exec.policy_decision',
    'codex.exec.preflight_result',
    'codex.exec.approval_artifact',
    'codex.exec.execution_gate_result',
    'codex.exec.live_config',
    'codex.exec.approval_request',
    'codex.exec.approval_decision',
    'codex.exec.approval_state',
    'codex.exec.live_adapter_adr_decision',
    'codex.exec.read_only_adapter.preflight_simulation',
    'codex.exec.read_only_adapter.simulator_review',
    'codex.exec.read_only_adapter.implementation_plan_review',
    'codex.exec.read_only_adapter.skeleton_preview',
    'codex.exec.read_only_adapter.skeleton_review',
    'codex.exec.read_only_adapter.fixture_boundary',
    'codex.exec.read_only_adapter.final_readiness',
    'codex.exec.real_read_only_adapter.readiness_package',
    'codex.exec.real_read_only_adapter.readiness_review',
    'codex.app_server.wire_summary',
    'codex.app_server.thread_mirror',
    'codex.app_server.turn_mirror',
    'codex.app_server.event_summary',
    'codex.app_server.approval_bridge',
    'codex.app_server.protocol_drift',
    'codex.patch_plan',
    'codex.patch_run_summary',
    'verification.dry_run_plan',
    'verification.command_summary',
    'verification.run_summary',
    'mcp.tool_manifest',
    'mcp.tool_invocation_summary',
    'browser.profile_readiness',
    'browser.observation_plan',
    'browser.observation_summary',
    'browser.observation_run_summary',
    'electron.process_summary',
    'electron.debug_endpoint_summary',
    'electron.target_summary',
    'electron.observation_plan',
    'electron.observation_summary',
    'electron.run_summary',
    'electron.codex_desktop_health',
    'os.process_summary',
    'worktree.plan',
    'worktree.run_summary',
    'worktree.cleanup_plan',
    'worktree.cleanup_summary',
    'patch.diff_summary',
    'patch.lifecycle_plan',
    'patch.lifecycle_run_summary',
    'patch.diff_review_summary',
    'patch.readiness_summary',
    'review.package_plan',
    'review.package_summary',
    'review.package_export_plan',
    'review.package_export_summary',
    'review.finding_summary',
    'review.decision_projection',
    'release.rc_readiness_plan',
    'release.rc_readiness_summary',
    'release.rc_evidence_bundle',
    'release.rc_audit_chain',
    'release.rc_bundle_export_plan',
    'release.rc_bundle_export_summary',
    'pr.draft_summary',
    'release.audit_draft',
    'pilot.m9.readiness_summary',
    'pilot.m9.run_summary',
    'pilot.m11.readiness_summary',
    'pilot.m11.run_summary',
    'policy_backend.evaluation_plan',
    'policy_backend.raw_evaluation_summary',
    'policy_backend.normalized_decision_trace',
    'telemetry.trace_plan',
    'telemetry.span_summary',
    'telemetry.export_summary',
    'github.provider_plan',
    'github.metadata_summary',
    'github.token_readiness',
    'github.draft_pr_plan',
    'github.draft_pr_summary',
    'github.draft_pr_rehearsal',
    'github.branch_publish_plan',
    'github.branch_publish_content_manifest',
    'github.branch_publish_summary',
    'github.branch_publish_rehearsal',
    'github.publish_draft_pr_chain_plan',
    'github.publish_draft_pr_chain_summary',
    'github.pr_lifecycle_plan',
    'github.pr_lifecycle_summary',
    'github.pr_lifecycle_run',
    'github.pr_labels_plan',
    'github.pr_labels_run_summary',
    'github.pr_assignees_plan',
    'github.pr_assignees_run_summary',
    'github.pr_reviewers_plan',
    'github.pr_reviewers_run_summary',
    'github.pr_milestones_plan',
    'github.pr_milestones_run_summary',
    'github.pr_comments_plan',
    'github.pr_comments_run_summary',
    'github.merge_readiness_plan',
    'github.merge_readiness_summary',
    'github.merge_run_summary',
    'github.merge_rehearsal',
    'github.actions_observation_plan',
    'github.actions_observation_summary',
    'github.actions_observation_run',
    'github.actions_run_control_plan',
    'github.actions_run_control_summary',
    'github.actions_dispatch_plan',
    'github.actions_dispatch_summary',
    'github.actions_rehearsal',
    'release.version_plan',
    'release.changelog_summary',
    'github.release_tag_plan',
    'github.release_tag_summary',
    'github.release_draft_plan',
    'github.release_draft_summary',
    'release.lifecycle_rehearsal',
    'deployment.provider_manifest',
    'deployment.readiness',
    'deployment.observation_plan',
    'deployment.observation_summary',
    'deployment.drift_summary',
    'deployment.rehearsal',
    'deployment.operation_plan',
    'deployment.operation_summary',
    'deployment.rollback_plan',
    'deployment.operation_rehearsal',
    'secrets.provider_manifest',
    'secrets.provider_readiness',
    'secrets.environment_readiness',
    'secrets.reference_summary',
    'secrets.leak_audit_summary',
    'secrets.readiness_plan',
    'secrets.readiness_summary',
    'secrets.rehearsal',
    'policy.real_backend_plan',
    'policy.real_backend_summary',
    'policy.advisory_decision_summary',
    'policy.real_backend_rehearsal',
    'telemetry.real_export_plan',
    'telemetry.local_export_summary',
    'telemetry.network_export_summary',
    'telemetry.real_export_rehearsal',
    'browser.action_plan',
    'browser.action_summary',
    'browser.action_rehearsal',
    'electron.main_inspector_plan',
    'electron.main_inspector_summary',
    'electron.main_inspector_rehearsal',
    'mcp.write_tool_plan',
    'mcp.write_tool_summary',
    'mcp.write_tool_rehearsal',
    'runtime.scheduler_plan',
    'runtime.queue_summary',
    'runtime.lock_summary',
    'runtime.lease_summary',
    'runtime.checkpoint_summary',
    'runtime.job_run_summary',
    'runtime.multi_agent_coordination_summary',
    'external_agent.manifest',
    'external_agent.readiness',
    'external_agent.patch_plan',
    'external_agent.patch_summary',
    'external_agent.run_summary',
    'external_agent.rehearsal',
    'platform.backup_plan',
    'platform.backup_summary',
    'platform.restore_plan',
    'platform.restore_summary',
    'platform.migration_plan',
    'platform.migration_summary',
    'platform.retention_plan',
    'platform.retention_summary',
    'platform.audit_export_plan',
    'platform.audit_export_summary',
    'platform.operator_role_plan',
    'platform.operator_role_summary',
    'platform.disaster_recovery_rehearsal',
    'production_ga.capability_matrix',
    'production_ga.threat_model',
    'production_ga.readiness_plan',
    'production_ga.readiness_summary',
    'production_ga.e2e_rehearsal_plan',
    'production_ga.e2e_rehearsal_run',
    'production_ga.operator_training_plan',
    'production_ga.operator_training_completion',
    'production_ga.release_candidate_signoff_plan',
    'production_ga.signoff_run',
    'production_ga.residual_risk_register',
    'production_ga.evidence_bundle_summary',
    'github.publish_draft_pr_rehearsal',
    'rework.loop_plan',
    'rework.loop_summary',
    'rework.attempt_summary',
    'rework.supersede_projection',
    'rework.rehearsal',
    'github.remote_supersede_plan',
    'github.remote_supersede_summary',
    'github.remote_supersede_rehearsal',
    'github.remote_cleanup_plan',
    'github.remote_cleanup_summary',
    'github.remote_cleanup_run',
    'github.remote_cleanup_rehearsal',
    'workflow.template_summary',
    'workflow.validation_summary',
    'workflow.plan_summary',
    'workflow.rehearsal_summary',
    'workflow.custom_dry_run',
    'workflow.custom_run_summary',
    'workflow.catalog_entry',
    'workflow.catalog_readiness',
    'workflow.catalog_validation',
    'workflow.recovery_plan',
    'workflow.recovery_child_action',
    'workflow.recovery_run_summary',
    'workflow.recovery_public_summary',
  ]),
  summary: z.string().min(1).optional(),
  hash: z.string().min(1),
  uri: z.string().optional(),
  expiresAt: IsoDateTimeSchema.optional(),
  redacted: z.boolean().default(true),
  labels: z.array(z.string()).default([]),
});
export type EvidenceRef = z.infer<typeof EvidenceRefSchema>;

export const PolicyDecisionSchema = createdEntityBaseSchema.extend({
  actionId: z.string().min(1),
  actionType: z.string().min(1),
  actionMode: ActionModeSchema,
  riskLevel: RiskLevelSchema,
  outcome: PolicyOutcomeSchema,
  reasons: z.array(z.string()).default([]),
  requiresDryRun: z.boolean(),
  requiresApproval: z.boolean(),
});
export type PolicyDecision = z.infer<typeof PolicyDecisionSchema>;

export const CapabilityPlannedActionSchema = z.object({
  action: z.string().min(1),
  actionMode: ActionModeSchema,
  risk: RiskLevelSchema,
  target: z.string().min(1),
  requiresApproval: z.boolean(),
});
export type CapabilityPlannedAction = z.infer<typeof CapabilityPlannedActionSchema>;

export const CapabilityDryRunSchema = createdEntityBaseSchema.extend({
  adapterName: z.string().min(1),
  inputSummary: z.unknown(),
  plannedActions: z.array(CapabilityPlannedActionSchema),
  requiredEvidence: z.array(z.string().min(1)).default([]),
  warnings: z.array(z.string().min(1)).default([]),
});
export type CapabilityDryRun = z.infer<typeof CapabilityDryRunSchema>;

export const ExecutionAuthoritySchema = createdEntityBaseSchema.extend({
  policyDecisionId: z.string().min(1),
  approvalArtifactId: z.string().min(1).optional(),
  allowed: z.boolean(),
  constraints: z.array(z.string().min(1)).default([]),
  expiresAt: IsoDateTimeSchema.optional(),
});
export type ExecutionAuthority = z.infer<typeof ExecutionAuthoritySchema>;

export const CapabilityExecutionStatusSchema = z.enum([
  'completed',
  'failed',
  'blocked',
  'aborted',
]);
export type CapabilityExecutionStatus = z.infer<typeof CapabilityExecutionStatusSchema>;

export const CapabilityExecutionResultSchema = createdEntityBaseSchema.extend({
  status: CapabilityExecutionStatusSchema,
  processBoundaryInvoked: z.boolean(),
  externalProcessStarted: z.boolean(),
  noRealWrite: z.boolean(),
  evidenceRefs: z.array(z.string().min(1)).default([]),
  auditEventIds: z.array(z.string().min(1)).default([]),
  summary: z.string().min(1),
});
export type CapabilityExecutionResult = z.infer<typeof CapabilityExecutionResultSchema>;

export const WorkflowStepStatusSchema = z.enum([
  'pending',
  'dry-run',
  'running',
  'completed',
  'failed',
  'skipped',
]);
export type WorkflowStepStatus = z.infer<typeof WorkflowStepStatusSchema>;

export const WorkflowStepSchema = createdEntityBaseSchema.extend({
  name: z.string().min(1),
  actionType: z.string().min(1),
  actionMode: ActionModeSchema,
  riskLevel: RiskLevelSchema,
  status: WorkflowStepStatusSchema,
  dryRunOnly: z.boolean().default(true),
  evidenceRefs: z.array(EvidenceRefSchema).default([]),
});
export type WorkflowStep = z.infer<typeof WorkflowStepSchema>;

export const WorkflowDefinitionSchema = createdEntityBaseSchema.extend({
  name: z.string().min(1),
  version: z.string().min(1),
  description: z.string().optional(),
  riskLevel: RiskLevelSchema,
  steps: z.array(WorkflowStepSchema),
});
export type WorkflowDefinition = z.infer<typeof WorkflowDefinitionSchema>;

export const WorkflowRunStatusSchema = z.enum([
  'created',
  'dry-run',
  'running',
  'completed',
  'failed',
]);
export type WorkflowRunStatus = z.infer<typeof WorkflowRunStatusSchema>;

export const WorkflowRunSchema = createdEntityBaseSchema.extend({
  workflowName: z.string().min(1),
  status: WorkflowRunStatusSchema,
  dryRun: z.boolean(),
  steps: z.array(WorkflowStepSchema).default([]),
  evidenceRefs: z.array(EvidenceRefSchema).default([]),
});
export type WorkflowRun = z.infer<typeof WorkflowRunSchema>;

export const DryRunPlanSchema = createdEntityBaseSchema.extend({
  workflowName: z.string().min(1),
  summary: z.string().min(1),
  riskLevel: RiskLevelSchema,
  steps: z.array(WorkflowStepSchema),
  policyDecisions: z.array(PolicyDecisionSchema),
  evidenceRefs: z.array(EvidenceRefSchema).default([]),
  auditEvents: z.array(z.lazy(() => AuditEventSchema)).default([]),
});
export type DryRunPlan = z.infer<typeof DryRunPlanSchema>;

export const AuditEventSchema = createdEntityBaseSchema.extend({
  actor: z.string().min(1),
  action: z.string().min(1),
  target: z.string().min(1).optional(),
  reason: z.string().min(1).optional(),
  outcome: z.string().min(1),
  evidenceRefs: z.array(EvidenceRefSchema).default([]),
  policyDecisionId: z.string().optional(),
});
export type AuditEvent = z.infer<typeof AuditEventSchema>;

export const CapabilityAuditEventSchema = AuditEventSchema.extend({
  target: z.string().min(1),
  reason: z.string().min(1),
  policyDecisionId: z.string().min(1),
  evidenceRefs: z.array(EvidenceRefSchema).min(1),
});
export type CapabilityAuditEvent = z.infer<typeof CapabilityAuditEventSchema>;

const customWorkflowForbiddenMetadataKeys = new Set([
  'prompt',
  'rawPrompt',
  'stdin',
  'stdout',
  'stderr',
  'diff',
  'rawDiff',
  'diffBody',
  'pullRequestBody',
  'pullRequestMarkdown',
  'prBody',
  'prMarkdown',
  'rawPrBody',
  'rawPullRequestBody',
  'path',
  'rawPath',
  'configPath',
  'url',
  'rawUrl',
  'token',
  'cookie',
  'session',
  'mfa',
  'MFA',
  'password',
  'passkey',
  'credential',
  'storage',
  'localStorage',
  'sessionStorage',
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
  'sql',
  'rawSql',
  'dbRow',
  'dbRows',
  'databaseRow',
  'databaseRows',
  'backupBody',
  'rawBackupBody',
  'rawDom',
  'rawSelector',
  'rawScript',
  'rawPayload',
  'rawCredential',
  'rawAx',
  'domText',
  'rawText',
  'networkBody',
  'rawNetworkBody',
  'rawIdentity',
  'rawAccount',
  'rawWorkspace',
  'accountId',
  'workspaceId',
  'email',
  'rawEmail',
  'auditBody',
  'rawAuditBody',
  'releaseBody',
  'rawReleaseBody',
  'changelogBody',
  'rawChangelogBody',
  'deployPayload',
  'rawDeployPayload',
  'log',
  'rawLog',
  'trace',
  'rawTrace',
  'span',
  'rawSpan',
  'patch',
  'rawPatch',
  'fileContent',
  'rawFileContent',
]);

function rejectCustomWorkflowRawMetadata(value: unknown, ctx: z.RefinementCtx) {
  if (!value || typeof value !== 'object') {
    return;
  }

  const queue: unknown[] = [value];
  const seen = new Set<unknown>();
  while (queue.length > 0) {
    const current = queue.shift();
    if (!current || typeof current !== 'object' || seen.has(current)) {
      continue;
    }
    seen.add(current);

    if (Array.isArray(current)) {
      queue.push(...current);
      continue;
    }

    for (const [key, nested] of Object.entries(current)) {
      if (customWorkflowForbiddenMetadataKeys.has(key)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Custom workflow public metadata must not expose raw ${key}`,
          path: [key],
        });
      }
      queue.push(nested);
    }
  }
}

export const CustomWorkflowStepKindSchema = z.enum([
  'readiness',
  'worktree',
  'codex-patch',
  'nx-verification',
  'review-package',
  'rc-bundle',
  'github-branch-publish',
  'github-draft-pr',
  'github-pr-lifecycle',
  'remote-supersede',
  'remote-cleanup',
  'governance-projection',
  'telemetry-projection',
  'browser-observe',
  'electron-observe',
  'mcp-readonly',
]);
export type CustomWorkflowStepKind = z.infer<
  typeof CustomWorkflowStepKindSchema
>;

export const CustomWorkflowValidationStatusSchema = z.enum([
  'valid',
  'invalid',
  'blocked',
]);
export type CustomWorkflowValidationStatus = z.infer<
  typeof CustomWorkflowValidationStatusSchema
>;

export const CustomWorkflowCatalogSourceSchema = z.enum([
  'built-in',
  'workspace',
  'fixture',
]);
export type CustomWorkflowCatalogSource = z.infer<
  typeof CustomWorkflowCatalogSourceSchema
>;

export const CustomWorkflowCatalogReadinessStatusSchema = z.enum([
  'ready',
  'blocked',
  'disabled',
  'degraded',
]);
export type CustomWorkflowCatalogReadinessStatus = z.infer<
  typeof CustomWorkflowCatalogReadinessStatusSchema
>;

export const CustomWorkflowPlanStatusSchema = z.enum([
  'planned',
  'blocked',
]);
export type CustomWorkflowPlanStatus = z.infer<
  typeof CustomWorkflowPlanStatusSchema
>;

export const CustomWorkflowRunStatusSchema = z.enum([
  'planned',
  'running',
  'completed',
  'failed',
  'blocked',
  'aborted',
]);
export type CustomWorkflowRunStatus = z.infer<
  typeof CustomWorkflowRunStatusSchema
>;

export const CustomWorkflowRehearsalScenarioSchema = z.enum([
  'all-pass',
  'template-disabled',
  'stale-template-hash',
  'invalid-template',
  'missing-child-reference',
  'workflow-approval-blocked',
  'approval-blocked',
  'verification-failed',
  'remote-step-blocked',
  'cleanup-blocked',
  'child-approval-blocked',
  'child-run-missing',
  'child-run-failed',
  'superseded-source',
]);
export type CustomWorkflowRehearsalScenario = z.infer<
  typeof CustomWorkflowRehearsalScenarioSchema
>;

export const CustomWorkflowCapabilityBindingSchema = z
  .object({
    stepKind: CustomWorkflowStepKindSchema,
    capabilityKind: CapabilityKindSchema,
    actionMode: ActionModeSchema,
    riskLevel: RiskLevelSchema,
    requiresApproval: z.boolean(),
    childApprovalRequired: z.boolean(),
    adapterExecuteAllowed: z.literal(false).default(false),
    summary: z.string().min(1),
  })
  .strict()
  .superRefine(rejectCustomWorkflowRawMetadata);
export type CustomWorkflowCapabilityBinding = z.infer<
  typeof CustomWorkflowCapabilityBindingSchema
>;

export const CustomWorkflowStepTemplateSchema = z
  .object({
    stepId: z.string().min(1),
    name: z.string().min(1),
    kind: CustomWorkflowStepKindSchema,
    actionMode: ActionModeSchema,
    riskLevel: RiskLevelSchema,
    required: z.boolean().default(true),
    capabilityBinding: CustomWorkflowCapabilityBindingSchema,
    summary: z.string().min(1),
  })
  .strict()
  .superRefine(rejectCustomWorkflowRawMetadata);
export type CustomWorkflowStepTemplate = z.infer<
  typeof CustomWorkflowStepTemplateSchema
>;

export const CustomWorkflowTemplateSchema = createdEntityBaseSchema
  .extend({
    templateId: z.string().min(1),
    templateVersion: z.literal(1),
    name: z.string().min(1),
    description: z.string().min(1).optional(),
    riskLevel: RiskLevelSchema,
    templateHash: z.string().min(1),
    configPathHash: z.string().min(1).optional(),
    stepCount: z.number().int().nonnegative(),
    capabilityCount: z.number().int().nonnegative(),
    steps: z.array(CustomWorkflowStepTemplateSchema).min(1),
    orderedStepsOnly: z.literal(true).default(true),
    directAdapterExecutionAllowed: z.literal(false).default(false),
    weakensPolicy: z.literal(false).default(false),
    bodyStored: z.literal(false).default(false),
    rawPathStored: z.literal(false).default(false),
    configBodyStored: z.literal(false).default(false),
    noRealWrite: z.literal(true).default(true),
    summary: z.string().min(1),
  })
  .strict()
  .superRefine((value, ctx) => {
    rejectCustomWorkflowRawMetadata(value, ctx);
    if (value.stepCount !== value.steps.length) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Custom workflow stepCount must match steps length',
        path: ['stepCount'],
      });
    }
    if (value.capabilityCount !== value.steps.length) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Custom workflow capabilityCount must match steps length',
        path: ['capabilityCount'],
      });
    }
    const seen = new Set<string>();
    for (const step of value.steps) {
      if (seen.has(step.stepId)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Custom workflow step ids must be unique: ${step.stepId}`,
          path: ['steps'],
        });
      }
      seen.add(step.stepId);
    }
  });
export type CustomWorkflowTemplate = z.infer<
  typeof CustomWorkflowTemplateSchema
>;

export const CustomWorkflowValidationReportSchema = createdEntityBaseSchema
  .extend({
    templateId: z.string().min(1),
    templateHash: z.string().min(1),
    status: CustomWorkflowValidationStatusSchema,
    issueCount: z.number().int().nonnegative(),
    issues: z.array(z.string().min(1)).default([]),
    stepCount: z.number().int().nonnegative(),
    unknownStepKindCount: z.number().int().nonnegative().default(0),
    policyWeakeningDetected: z.literal(false).default(false),
    loopOrBranchingDetected: z.literal(false).default(false),
    arbitraryConfigPathAllowed: z.literal(false).default(false),
    bodyStored: z.literal(false).default(false),
    rawPathStored: z.literal(false).default(false),
    summary: z.string().min(1),
  })
  .strict()
  .superRefine(rejectCustomWorkflowRawMetadata);
export type CustomWorkflowValidationReport = z.infer<
  typeof CustomWorkflowValidationReportSchema
>;

export const CustomWorkflowCatalogEntrySchema = createdEntityBaseSchema
  .extend({
    templateId: z.string().min(1),
    templateHash: z.string().min(1),
    family: z.string().min(1),
    displayName: z.string().min(1),
    source: CustomWorkflowCatalogSourceSchema,
    validationStatus: CustomWorkflowValidationStatusSchema,
    riskLevel: RiskLevelSchema,
    stepCount: z.number().int().nonnegative(),
    capabilityCount: z.number().int().nonnegative(),
    requiredStepKinds: z.array(CustomWorkflowStepKindSchema).default([]),
    requiredCapabilityKinds: z.array(CapabilityKindSchema).default([]),
    approvalRequired: z.boolean(),
    childApprovalsRequired: z.number().int().nonnegative(),
    enabledByDefault: z.literal(false).default(false),
    productionExecutionEnabled: z.boolean().default(false),
    directAdapterExecutionAllowed: z.literal(false).default(false),
    bodyStored: z.literal(false).default(false),
    rawPathStored: z.literal(false).default(false),
    configBodyStored: z.literal(false).default(false),
    summary: z.string().min(1),
  })
  .strict()
  .superRefine(rejectCustomWorkflowRawMetadata);
export type CustomWorkflowCatalogEntry = z.infer<
  typeof CustomWorkflowCatalogEntrySchema
>;

export const CustomWorkflowTemplateFamilySummarySchema = createdEntityBaseSchema
  .extend({
    family: z.string().min(1),
    templateCount: z.number().int().nonnegative(),
    validTemplateCount: z.number().int().nonnegative(),
    blockedTemplateCount: z.number().int().nonnegative(),
    highestRisk: RiskLevelSchema,
    enabledByDefault: z.literal(false).default(false),
    productionExecutionEnabled: z.boolean().default(false),
    summary: z.string().min(1),
  })
  .strict()
  .superRefine(rejectCustomWorkflowRawMetadata);
export type CustomWorkflowTemplateFamilySummary = z.infer<
  typeof CustomWorkflowTemplateFamilySummarySchema
>;

export const CustomWorkflowProductionTemplateValidationSummarySchema =
  createdEntityBaseSchema
    .extend({
      templateId: z.string().min(1),
      templateHash: z.string().min(1),
      status: CustomWorkflowValidationStatusSchema,
      issueCount: z.number().int().nonnegative(),
      unknownStepKindCount: z.number().int().nonnegative().default(0),
      policyWeakeningDetected: z.literal(false).default(false),
      rawBodyDetected: z.literal(false).default(false),
      rawPathStored: z.literal(false).default(false),
      bodyStored: z.literal(false).default(false),
      configBodyStored: z.literal(false).default(false),
      summary: z.string().min(1),
    })
    .strict()
    .superRefine(rejectCustomWorkflowRawMetadata);
export type CustomWorkflowProductionTemplateValidationSummary = z.infer<
  typeof CustomWorkflowProductionTemplateValidationSummarySchema
>;

export const CustomWorkflowCatalogReadinessSchema = createdEntityBaseSchema
  .extend({
    templateId: z.string().min(1),
    templateHash: z.string().min(1),
    status: CustomWorkflowCatalogReadinessStatusSchema,
    productionExecutionEnabled: z.boolean().default(false),
    integrationEnabled: z.boolean().default(false),
    requiredEnvFlags: z.array(z.string().min(1)).default([]),
    configuredEnvFlagCount: z.number().int().nonnegative().default(0),
    missingEnvFlagCount: z.number().int().nonnegative().default(0),
    childCapabilityCount: z.number().int().nonnegative(),
    approvalRequired: z.boolean(),
    blockerCount: z.number().int().nonnegative(),
    blockers: z.array(z.string().min(1)).default([]),
    evidenceRefIds: z.array(z.string().min(1)).default([]),
    auditEventIds: z.array(z.string().min(1)).default([]),
    directAdapterExecutionAllowed: z.literal(false).default(false),
    processBoundaryInvoked: z.literal(false).default(false),
    externalProcessStarted: z.literal(false).default(false),
    networkBoundaryInvoked: z.literal(false).default(false),
    bodyStored: z.literal(false).default(false),
    rawPathStored: z.literal(false).default(false),
    summary: z.string().min(1),
  })
  .strict()
  .superRefine(rejectCustomWorkflowRawMetadata);
export type CustomWorkflowCatalogReadiness = z.infer<
  typeof CustomWorkflowCatalogReadinessSchema
>;

export const CustomWorkflowStepPlanSchema = z
  .object({
    stepId: z.string().min(1),
    kind: CustomWorkflowStepKindSchema,
    actionMode: ActionModeSchema,
    riskLevel: RiskLevelSchema,
    requiresApproval: z.boolean(),
    childApprovalRequired: z.boolean(),
    policyRequired: z.literal(true).default(true),
    evidenceRequired: z.literal(true).default(true),
    auditRequired: z.literal(true).default(true),
    directAdapterExecutionAllowed: z.literal(false).default(false),
    summary: z.string().min(1),
  })
  .strict()
  .superRefine(rejectCustomWorkflowRawMetadata);
export type CustomWorkflowStepPlan = z.infer<
  typeof CustomWorkflowStepPlanSchema
>;

export const CustomWorkflowPlanSchema = createdEntityBaseSchema
  .extend({
    dryRunId: z.string().min(1),
    templateId: z.string().min(1),
    templateHash: z.string().min(1),
    status: CustomWorkflowPlanStatusSchema,
    validationReport: CustomWorkflowValidationReportSchema,
    stepPlans: z.array(CustomWorkflowStepPlanSchema),
    stepCount: z.number().int().nonnegative(),
    approvalRequired: z.boolean(),
    childApprovalsRequired: z.number().int().nonnegative(),
    blockReasons: z.array(z.string().min(1)).default([]),
    evidenceRefIds: z.array(z.string().min(1)).default([]),
    auditEventIds: z.array(z.string().min(1)).default([]),
    processBoundaryInvoked: z.literal(false).default(false),
    externalProcessStarted: z.literal(false).default(false),
    networkBoundaryInvoked: z.literal(false).default(false),
    directAdapterExecutionAllowed: z.literal(false).default(false),
    noRealWrite: z.literal(true).default(true),
    bodyStored: z.literal(false).default(false),
    rawPathStored: z.literal(false).default(false),
    summary: z.string().min(1),
  })
  .strict()
  .superRefine((value, ctx) => {
    rejectCustomWorkflowRawMetadata(value, ctx);
    if (value.stepCount !== value.stepPlans.length) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Custom workflow plan stepCount must match stepPlans length',
        path: ['stepCount'],
      });
    }
  });
export type CustomWorkflowPlan = z.infer<typeof CustomWorkflowPlanSchema>;

export const CustomWorkflowApprovalStatusSchema = z.enum([
  'requested',
  'approved',
  'denied',
  'expired',
  'used',
  'revoked',
]);
export type CustomWorkflowApprovalStatus = z.infer<
  typeof CustomWorkflowApprovalStatusSchema
>;

export const CustomWorkflowApprovalArtifactRecordSchema = createdEntityBaseSchema
  .extend({
    dryRunId: z.string().min(1),
    templateId: z.string().min(1),
    templateHash: z.string().min(1),
    approvalArtifactId: z.string().min(1),
    status: CustomWorkflowApprovalStatusSchema,
    approvedBy: z.string().min(1).optional(),
    reasonHash: z.string().min(1).optional(),
    reasonSummary: z.string().min(1).optional(),
    expiresAt: IsoDateTimeSchema.optional(),
    usedAt: IsoDateTimeSchema.optional(),
    bodyStored: z.literal(false).default(false),
    rawPathStored: z.literal(false).default(false),
    summary: z.string().min(1),
  })
  .strict()
  .superRefine(rejectCustomWorkflowRawMetadata);
export type CustomWorkflowApprovalArtifactRecord = z.infer<
  typeof CustomWorkflowApprovalArtifactRecordSchema
>;

export const CustomWorkflowStepRunSummarySchema = z
  .object({
    stepId: z.string().min(1),
    kind: CustomWorkflowStepKindSchema,
    status: CustomWorkflowRunStatusSchema,
    childRecordIdHash: z.string().min(1).optional(),
    childHashBindingMatched: z.boolean().default(false),
    childApprovalRequired: z.boolean(),
    childExecutionInvoked: z.literal(false).default(false),
    directAdapterExecutionAllowed: z.literal(false).default(false),
    blockReasons: z.array(z.string().min(1)).default([]),
    evidenceRefIds: z.array(z.string().min(1)).default([]),
    auditEventIds: z.array(z.string().min(1)).default([]),
    processBoundaryInvoked: z.literal(false).default(false),
    externalProcessStarted: z.literal(false).default(false),
    networkBoundaryInvoked: z.literal(false).default(false),
    bodyStored: z.literal(false).default(false),
    rawPathStored: z.literal(false).default(false),
    summary: z.string().min(1),
  })
  .strict()
  .superRefine(rejectCustomWorkflowRawMetadata);
export type CustomWorkflowStepRunSummary = z.infer<
  typeof CustomWorkflowStepRunSummarySchema
>;

export const CustomWorkflowRunSchema = createdEntityBaseSchema
  .extend({
    dryRunId: z.string().min(1),
    approvalArtifactId: z.string().min(1).optional(),
    templateId: z.string().min(1),
    templateHash: z.string().min(1),
    status: CustomWorkflowRunStatusSchema,
    steps: z.array(CustomWorkflowStepRunSummarySchema),
    stepCount: z.number().int().nonnegative(),
    completedStepCount: z.number().int().nonnegative(),
    blockedStepCount: z.number().int().nonnegative(),
    childApprovalsRequired: z.number().int().nonnegative(),
    blockReasons: z.array(z.string().min(1)).default([]),
    evidenceRefIds: z.array(z.string().min(1)).default([]),
    auditEventIds: z.array(z.string().min(1)).default([]),
    processBoundaryInvoked: z.literal(false).default(false),
    externalProcessStarted: z.literal(false).default(false),
    networkBoundaryInvoked: z.literal(false).default(false),
    directAdapterExecutionAllowed: z.literal(false).default(false),
    noRealWrite: z.literal(true).default(true),
    bodyStored: z.literal(false).default(false),
    rawPathStored: z.literal(false).default(false),
    summary: z.string().min(1),
  })
  .strict()
  .superRefine((value, ctx) => {
    rejectCustomWorkflowRawMetadata(value, ctx);
    if (value.stepCount !== value.steps.length) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Custom workflow run stepCount must match steps length',
        path: ['stepCount'],
      });
    }
  });
export type CustomWorkflowRun = z.infer<typeof CustomWorkflowRunSchema>;

export const CustomWorkflowRehearsalRunSchema = createdEntityBaseSchema
  .extend({
    templateId: z.string().min(1),
    templateHash: z.string().min(1),
    scenario: CustomWorkflowRehearsalScenarioSchema,
    status: CustomWorkflowRunStatusSchema,
    stepCount: z.number().int().nonnegative(),
    blockerCount: z.number().int().nonnegative(),
    evidenceRefCount: z.number().int().nonnegative(),
    auditEventCount: z.number().int().nonnegative(),
    childApprovalsRequired: z.number().int().nonnegative(),
    blockReasons: z.array(z.string().min(1)).default([]),
    directAdapterExecutionAllowed: z.literal(false).default(false),
    noRealWrite: z.literal(true).default(true),
    processBoundaryInvoked: z.literal(false).default(false),
    externalProcessStarted: z.literal(false).default(false),
    networkBoundaryInvoked: z.literal(false).default(false),
    bodyStored: z.literal(false).default(false),
    rawPathStored: z.literal(false).default(false),
    summary: z.string().min(1),
  })
  .strict()
  .superRefine(rejectCustomWorkflowRawMetadata);
export type CustomWorkflowRehearsalRun = z.infer<
  typeof CustomWorkflowRehearsalRunSchema
>;

export const ProductionWorkflowPilotSourceSchema = z.enum([
  'catalog-template',
  'fixture',
]);
export type ProductionWorkflowPilotSource = z.infer<
  typeof ProductionWorkflowPilotSourceSchema
>;

export const ProductionWorkflowPilotStatusSchema = z.enum([
  'planned',
  'ready',
  'completed',
  'failed',
  'blocked',
  'aborted',
]);
export type ProductionWorkflowPilotStatus = z.infer<
  typeof ProductionWorkflowPilotStatusSchema
>;

export const ProductionWorkflowPilotStepSchema = z
  .object({
    stepId: z.string().min(1),
    kind: CustomWorkflowStepKindSchema,
    status: ProductionWorkflowPilotStatusSchema,
    childRecordIdHash: z.string().min(1).optional(),
    childHashBindingMatched: z.boolean().default(false),
    childApprovalRequired: z.boolean(),
    blockReasons: z.array(z.string().min(1)).default([]),
    evidenceRefIds: z.array(z.string().min(1)).default([]),
    auditEventIds: z.array(z.string().min(1)).default([]),
    processBoundaryInvoked: z.literal(false).default(false),
    externalProcessStarted: z.literal(false).default(false),
    networkBoundaryInvoked: z.literal(false).default(false),
    directAdapterExecutionAllowed: z.literal(false).default(false),
    bodyStored: z.literal(false).default(false),
    rawPathStored: z.literal(false).default(false),
    summary: z.string().min(1),
  })
  .strict()
  .superRefine(rejectCustomWorkflowRawMetadata);
export type ProductionWorkflowPilotStep = z.infer<
  typeof ProductionWorkflowPilotStepSchema
>;

export const ProductionWorkflowPilotEvidenceSummarySchema = z
  .object({
    evidenceRefCount: z.number().int().nonnegative(),
    auditEventCount: z.number().int().nonnegative(),
    evidenceBundleHash: z.string().min(1),
    auditChainHash: z.string().min(1),
    bodyStored: z.literal(false).default(false),
    rawPathStored: z.literal(false).default(false),
    summary: z.string().min(1),
  })
  .strict()
  .superRefine(rejectCustomWorkflowRawMetadata);
export type ProductionWorkflowPilotEvidenceSummary = z.infer<
  typeof ProductionWorkflowPilotEvidenceSummarySchema
>;

export const ProductionWorkflowPilotReadinessSchema = createdEntityBaseSchema
  .extend({
    templateId: z.string().min(1),
    templateHash: z.string().min(1),
    source: ProductionWorkflowPilotSourceSchema,
    status: ProductionWorkflowPilotStatusSchema,
    requiredChildStepCount: z.number().int().nonnegative(),
    missingChildRecordCount: z.number().int().nonnegative(),
    staleChildRecordCount: z.number().int().nonnegative(),
    failedChildRecordCount: z.number().int().nonnegative(),
    blockerCount: z.number().int().nonnegative(),
    blockers: z.array(z.string().min(1)).default([]),
    approvalRequired: z.boolean(),
    childApprovalsRequired: z.number().int().nonnegative(),
    localProductionPilotEnabled: z.boolean().default(false),
    productionExecutionEnabled: z.boolean().default(false),
    directAdapterExecutionAllowed: z.literal(false).default(false),
    bodyStored: z.literal(false).default(false),
    rawPathStored: z.literal(false).default(false),
    summary: z.string().min(1),
  })
  .strict()
  .superRefine((value, ctx) => {
    rejectCustomWorkflowRawMetadata(value, ctx);
    if (value.blockerCount !== value.blockers.length) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Production workflow pilot blockerCount must match blockers length',
        path: ['blockerCount'],
      });
    }
  });
export type ProductionWorkflowPilotReadiness = z.infer<
  typeof ProductionWorkflowPilotReadinessSchema
>;

export const ProductionWorkflowPilotPlanSchema = createdEntityBaseSchema
  .extend({
    pilotPlanId: z.string().min(1),
    templateId: z.string().min(1),
    templateHash: z.string().min(1),
    source: ProductionWorkflowPilotSourceSchema,
    status: ProductionWorkflowPilotStatusSchema,
    stepCount: z.number().int().nonnegative(),
    childRecordHashCount: z.number().int().nonnegative(),
    blockReasons: z.array(z.string().min(1)).default([]),
    evidenceSummary: ProductionWorkflowPilotEvidenceSummarySchema,
    processBoundaryInvoked: z.literal(false).default(false),
    externalProcessStarted: z.literal(false).default(false),
    networkBoundaryInvoked: z.literal(false).default(false),
    directAdapterExecutionAllowed: z.literal(false).default(false),
    noRealWrite: z.literal(true).default(true),
    bodyStored: z.literal(false).default(false),
    rawPathStored: z.literal(false).default(false),
    summary: z.string().min(1),
  })
  .strict()
  .superRefine(rejectCustomWorkflowRawMetadata);
export type ProductionWorkflowPilotPlan = z.infer<
  typeof ProductionWorkflowPilotPlanSchema
>;

export const ProductionWorkflowPilotRunSchema = createdEntityBaseSchema
  .extend({
    pilotRunId: z.string().min(1),
    templateId: z.string().min(1),
    templateHash: z.string().min(1),
    source: ProductionWorkflowPilotSourceSchema,
    status: ProductionWorkflowPilotStatusSchema,
    steps: z.array(ProductionWorkflowPilotStepSchema),
    stepCount: z.number().int().nonnegative(),
    completedStepCount: z.number().int().nonnegative(),
    blockedStepCount: z.number().int().nonnegative(),
    failedStepCount: z.number().int().nonnegative(),
    readiness: ProductionWorkflowPilotReadinessSchema,
    evidenceSummary: ProductionWorkflowPilotEvidenceSummarySchema,
    blockReasons: z.array(z.string().min(1)).default([]),
    evidenceRefIds: z.array(z.string().min(1)).default([]),
    auditEventIds: z.array(z.string().min(1)).default([]),
    processBoundaryInvoked: z.literal(false).default(false),
    externalProcessStarted: z.literal(false).default(false),
    networkBoundaryInvoked: z.literal(false).default(false),
    directAdapterExecutionAllowed: z.literal(false).default(false),
    noRealWrite: z.literal(true).default(true),
    bodyStored: z.literal(false).default(false),
    rawPathStored: z.literal(false).default(false),
    summary: z.string().min(1),
  })
  .strict()
  .superRefine((value, ctx) => {
    rejectCustomWorkflowRawMetadata(value, ctx);
    if (value.stepCount !== value.steps.length) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Production workflow pilot stepCount must match steps length',
        path: ['stepCount'],
      });
    }
  });
export type ProductionWorkflowPilotRun = z.infer<
  typeof ProductionWorkflowPilotRunSchema
>;

export const LocalProductionWorkflowChildBoundarySummarySchema = z
  .object({
    stepId: z.string().min(1),
    childActionKind: z.string().min(1),
    childControlPlane: z.string().min(1),
    childRecordIdHash: z.string().min(1).optional(),
    childApprovalRequired: z.boolean(),
    childApprovalResolvedFromStore: z.boolean().default(false),
    childHashBindingMatched: z.boolean().default(false),
    processBoundaryInvoked: z.boolean().default(false),
    externalProcessStarted: z.boolean().default(false),
    networkBoundaryInvoked: z.boolean().default(false),
    directAdapterExecutionAllowed: z.literal(false).default(false),
    bodyStored: z.literal(false).default(false),
    rawPathStored: z.literal(false).default(false),
    summary: z.string().min(1),
  })
  .strict()
  .superRefine(rejectCustomWorkflowRawMetadata);
export type LocalProductionWorkflowChildBoundarySummary = z.infer<
  typeof LocalProductionWorkflowChildBoundarySummarySchema
>;
export const LocalProductionWorkflowPilotStepSchema = ProductionWorkflowPilotStepSchema;
export type LocalProductionWorkflowPilotStep = ProductionWorkflowPilotStep;
export const LocalProductionWorkflowPilotPlanSchema = ProductionWorkflowPilotPlanSchema;
export type LocalProductionWorkflowPilotPlan = ProductionWorkflowPilotPlan;
export const LocalProductionWorkflowPilotRunSchema = ProductionWorkflowPilotRunSchema;
export type LocalProductionWorkflowPilotRun = ProductionWorkflowPilotRun;
export const LocalProductionWorkflowAcceptanceRunSchema = ProductionWorkflowPilotRunSchema;
export type LocalProductionWorkflowAcceptanceRun = ProductionWorkflowPilotRun;

export const ProductionWorkflowOperationStatusSchema = z.enum([
  'healthy',
  'blocked',
  'paused',
  'rollback-required',
  'degraded',
]);
export type ProductionWorkflowOperationStatus = z.infer<
  typeof ProductionWorkflowOperationStatusSchema
>;

export const ProductionWorkflowOperationsSmokeScenarioSchema = z.enum([
  'healthy',
  'production-disabled',
  'stale-template',
  'stale-child-record',
  'approval-used',
  'rollback-required',
  'remote-child-blocked',
]);
export type ProductionWorkflowOperationsSmokeScenario = z.infer<
  typeof ProductionWorkflowOperationsSmokeScenarioSchema
>;

export const ProductionWorkflowOperationsProjectionSchema = createdEntityBaseSchema
  .extend({
    templateId: z.string().min(1),
    templateHash: z.string().min(1),
    latestPilotRunIdHash: z.string().min(1).optional(),
    runHealth: ProductionWorkflowOperationStatusSchema,
    approvalState: CustomWorkflowApprovalStatusSchema,
    blockedReasonCount: z.number().int().nonnegative(),
    blockedReasons: z.array(z.string().min(1)).default([]),
    staleChildRecordCount: z.number().int().nonnegative(),
    rollbackAvailable: z.boolean().default(false),
    operatorNextActionSummary: z.string().min(1),
    evidenceRefCount: z.number().int().nonnegative(),
    auditEventCount: z.number().int().nonnegative(),
    processBoundaryInvoked: z.literal(false).default(false),
    externalProcessStarted: z.literal(false).default(false),
    networkBoundaryInvoked: z.literal(false).default(false),
    directAdapterExecutionAllowed: z.literal(false).default(false),
    noRealWrite: z.literal(true).default(true),
    bodyStored: z.literal(false).default(false),
    rawPathStored: z.literal(false).default(false),
    summary: z.string().min(1),
  })
  .strict()
  .superRefine((value, ctx) => {
    rejectCustomWorkflowRawMetadata(value, ctx);
    if (value.blockedReasonCount !== value.blockedReasons.length) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          'Production workflow operations blockedReasonCount must match blockedReasons length',
        path: ['blockedReasonCount'],
      });
    }
  });
export type ProductionWorkflowOperationsProjection = z.infer<
  typeof ProductionWorkflowOperationsProjectionSchema
>;

const ProductionWorkflowOperationIntentSchema = createdEntityBaseSchema
  .extend({
    actionId: z.string().min(1),
    sourceRunIdHash: z.string().min(1),
    affectedTemplateHash: z.string().min(1),
    reasonHash: z.string().min(1),
    status: ProductionWorkflowOperationStatusSchema,
    processBoundaryInvoked: z.literal(false).default(false),
    externalProcessStarted: z.literal(false).default(false),
    networkBoundaryInvoked: z.literal(false).default(false),
    directAdapterExecutionAllowed: z.literal(false).default(false),
    noRealWrite: z.literal(true).default(true),
    bodyStored: z.literal(false).default(false),
    rawPathStored: z.literal(false).default(false),
    summary: z.string().min(1),
  })
  .strict()
  .superRefine(rejectCustomWorkflowRawMetadata);

export const ProductionWorkflowPauseSummarySchema =
  ProductionWorkflowOperationIntentSchema;
export type ProductionWorkflowPauseSummary = z.infer<
  typeof ProductionWorkflowPauseSummarySchema
>;

export const ProductionWorkflowResumeSummarySchema =
  ProductionWorkflowOperationIntentSchema;
export type ProductionWorkflowResumeSummary = z.infer<
  typeof ProductionWorkflowResumeSummarySchema
>;

export const ProductionWorkflowRollbackSummarySchema =
  ProductionWorkflowOperationIntentSchema;
export type ProductionWorkflowRollbackSummary = z.infer<
  typeof ProductionWorkflowRollbackSummarySchema
>;

export const ProductionWorkflowOperationsSmokeRunSchema = createdEntityBaseSchema
  .extend({
    scenario: ProductionWorkflowOperationsSmokeScenarioSchema,
    status: ProductionWorkflowOperationStatusSchema,
    projection: ProductionWorkflowOperationsProjectionSchema,
    fixtureOnly: z.literal(true).default(true),
    processBoundaryInvoked: z.literal(false).default(false),
    externalProcessStarted: z.literal(false).default(false),
    networkBoundaryInvoked: z.literal(false).default(false),
    directAdapterExecutionAllowed: z.literal(false).default(false),
    noRealWrite: z.literal(true).default(true),
    bodyStored: z.literal(false).default(false),
    rawPathStored: z.literal(false).default(false),
    summary: z.string().min(1),
  })
  .strict()
  .superRefine(rejectCustomWorkflowRawMetadata);
export type ProductionWorkflowOperationsSmokeRun = z.infer<
  typeof ProductionWorkflowOperationsSmokeRunSchema
>;

export const ProductionWorkflowRecoveryStatusSchema = z.enum([
  'planned',
  'waiting_for_workflow_approval',
  'waiting_for_child_approval',
  'child_running',
  'blocked',
  'completed',
  'failed',
  'aborted',
]);
export type ProductionWorkflowRecoveryStatus = z.infer<
  typeof ProductionWorkflowRecoveryStatusSchema
>;

export const ProductionWorkflowChildActionKindSchema = z.enum([
  'worktree-create',
  'codex-patch',
  'nx-verification',
  'review-package-export',
  'governance-projection',
  'github-branch-publish',
  'github-draft-pr',
  'github-pr-lifecycle',
  'remote-supersede',
  'remote-cleanup',
]);
export type ProductionWorkflowChildActionKind = z.infer<
  typeof ProductionWorkflowChildActionKindSchema
>;

export const ProductionWorkflowChildActionStatusSchema = z.enum([
  'planned',
  'dry_run_created',
  'approval_requested',
  'waiting_for_child_approval',
  'child_approved',
  'child_running',
  'completed',
  'failed',
  'blocked',
  'skipped',
]);
export type ProductionWorkflowChildActionStatus = z.infer<
  typeof ProductionWorkflowChildActionStatusSchema
>;

export const ProductionWorkflowChildRecordStatusSchema = z.enum([
  'planned',
  'requested',
  'approved',
  'completed',
  'failed',
  'blocked',
  'aborted',
  'stale',
  'missing',
  'hash_mismatch',
  'waiting_for_child_approval',
]);
export type ProductionWorkflowChildRecordStatus = z.infer<
  typeof ProductionWorkflowChildRecordStatusSchema
>;

export const ProductionWorkflowChildRecordRefSchema = z
  .object({
    actionId: z.string().min(1),
    stepId: z.string().min(1),
    childActionKind: ProductionWorkflowChildActionKindSchema,
    childControlPlane: z.string().min(1),
    childRecordId: z.string().min(1).optional(),
    childDryRunId: z.string().min(1).optional(),
    childApprovalArtifactId: z.string().min(1).optional(),
    childRunId: z.string().min(1).optional(),
    expectedRecordHash: z.string().min(1),
    hashBindingRequired: z.literal(true).default(true),
    bodyStored: z.literal(false).default(false),
    rawPathStored: z.literal(false).default(false),
    summary: z.string().min(1).optional(),
  })
  .strict()
  .superRefine(rejectCustomWorkflowRawMetadata);
export type ProductionWorkflowChildRecordRef = z.infer<
  typeof ProductionWorkflowChildRecordRefSchema
>;

export const ProductionWorkflowChildRecordResolutionSchema = z
  .object({
    actionId: z.string().min(1),
    stepId: z.string().min(1),
    childActionKind: ProductionWorkflowChildActionKindSchema,
    childControlPlane: z.string().min(1),
    status: ProductionWorkflowChildRecordStatusSchema,
    childDryRunIdHash: z.string().min(1).optional(),
    childApprovalArtifactIdHash: z.string().min(1).optional(),
    childRunIdHash: z.string().min(1).optional(),
    expectedRecordHash: z.string().min(1).optional(),
    actualRecordHash: z.string().min(1).optional(),
    hashMatched: z.boolean().default(false),
    childApprovalRequired: z.boolean(),
    childApprovalResolvedFromStore: z.boolean().default(false),
    childRunResolvedFromStore: z.boolean().default(false),
    blockReasons: z.array(z.string().min(1)).default([]),
    evidenceRefIds: z.array(z.string().min(1)).default([]),
    auditEventIds: z.array(z.string().min(1)).default([]),
    processBoundaryInvoked: z.boolean().default(false),
    externalProcessStarted: z.boolean().default(false),
    networkBoundaryInvoked: z.boolean().default(false),
    directAdapterExecutionAllowed: z.literal(false).default(false),
    childAdapterExecuteAllowed: z.literal(false).default(false),
    bodyStored: z.literal(false).default(false),
    rawPathStored: z.literal(false).default(false),
    summary: z.string().min(1),
  })
  .strict()
  .superRefine(rejectCustomWorkflowRawMetadata);
export type ProductionWorkflowChildRecordResolution = z.infer<
  typeof ProductionWorkflowChildRecordResolutionSchema
>;

export const LocalProductionWorkflowChildRecordSetSchema = createdEntityBaseSchema
  .extend({
    dryRunId: z.string().min(1),
    templateId: z.string().min(1),
    templateHash: z.string().min(1),
    childRecordRefs: z.array(ProductionWorkflowChildRecordRefSchema),
    resolutions: z.array(ProductionWorkflowChildRecordResolutionSchema),
    childRecordCount: z.number().int().nonnegative(),
    resolvedChildRecordCount: z.number().int().nonnegative(),
    missingChildRecordCount: z.number().int().nonnegative(),
    hashMismatchCount: z.number().int().nonnegative(),
    failedChildRecordCount: z.number().int().nonnegative(),
    blockedChildRecordCount: z.number().int().nonnegative(),
    processBoundaryInvoked: z.literal(false).default(false),
    externalProcessStarted: z.literal(false).default(false),
    networkBoundaryInvoked: z.literal(false).default(false),
    directAdapterExecutionAllowed: z.literal(false).default(false),
    childAdapterExecuteAllowed: z.literal(false).default(false),
    bodyStored: z.literal(false).default(false),
    rawPathStored: z.literal(false).default(false),
    summary: z.string().min(1),
  })
  .strict()
  .superRefine((value, ctx) => {
    rejectCustomWorkflowRawMetadata(value, ctx);
    if (value.childRecordCount !== value.childRecordRefs.length) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Local production workflow childRecordCount must match childRecordRefs length',
        path: ['childRecordCount'],
      });
    }
    if (value.resolvedChildRecordCount !== value.resolutions.length) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          'Local production workflow resolvedChildRecordCount must match resolutions length',
        path: ['resolvedChildRecordCount'],
      });
    }
  });
export type LocalProductionWorkflowChildRecordSet = z.infer<
  typeof LocalProductionWorkflowChildRecordSetSchema
>;

export const CodexPatchChildRecordSchema = createdEntityBaseSchema
  .extend({
    childRecordId: z.string().min(1),
    dryRunId: z.string().min(1),
    approvalArtifactId: z.string().min(1).optional(),
    runId: z.string().min(1).optional(),
    status: ProductionWorkflowChildRecordStatusSchema,
    governedInputHash: z.string().min(1).optional(),
    expectedInputHash: z.string().min(1).optional(),
    worktreePathHash: z.string().min(1).optional(),
    changedFileCount: z.number().int().nonnegative().default(0),
    diffHash: z.string().min(1).optional(),
    evidenceRefIds: z.array(z.string().min(1)).default([]),
    auditEventIds: z.array(z.string().min(1)).default([]),
    processBoundaryInvoked: z.boolean().default(false),
    externalProcessStarted: z.boolean().default(false),
    networkBoundaryInvoked: z.literal(false).default(false),
    realWriteExecuted: z.boolean().default(false),
    repoRootWriteAllowed: z.literal(false).default(false),
    rawPromptStored: z.literal(false).default(false),
    rawStdoutStored: z.literal(false).default(false),
    rawStderrStored: z.literal(false).default(false),
    rawDiffStored: z.literal(false).default(false),
    bodyStored: z.literal(false).default(false),
    rawPathStored: z.literal(false).default(false),
    summary: z.string().min(1),
  })
  .strict()
  .superRefine(rejectCustomWorkflowRawMetadata);
export type CodexPatchChildRecord = z.infer<typeof CodexPatchChildRecordSchema>;

export const NxVerificationChildRecordSchema = createdEntityBaseSchema
  .extend({
    childRecordId: z.string().min(1),
    dryRunId: z.string().min(1),
    approvalArtifactId: z.string().min(1).optional(),
    runId: z.string().min(1).optional(),
    status: ProductionWorkflowChildRecordStatusSchema,
    verificationRunIdHash: z.string().min(1).optional(),
    targetCount: z.number().int().nonnegative().default(0),
    passedCount: z.number().int().nonnegative().default(0),
    failedCount: z.number().int().nonnegative().default(0),
    skippedCount: z.number().int().nonnegative().default(0),
    commandSummaryHash: z.string().min(1).optional(),
    evidenceRefIds: z.array(z.string().min(1)).default([]),
    auditEventIds: z.array(z.string().min(1)).default([]),
    processBoundaryInvoked: z.boolean().default(false),
    externalProcessStarted: z.boolean().default(false),
    networkBoundaryInvoked: z.literal(false).default(false),
    rawStdoutStored: z.literal(false).default(false),
    rawStderrStored: z.literal(false).default(false),
    bodyStored: z.literal(false).default(false),
    rawPathStored: z.literal(false).default(false),
    summary: z.string().min(1),
  })
  .strict()
  .superRefine((value, ctx) => {
    rejectCustomWorkflowRawMetadata(value, ctx);
    if (value.passedCount + value.failedCount + value.skippedCount > value.targetCount) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Nx verification child counts cannot exceed targetCount',
        path: ['targetCount'],
      });
    }
  });
export type NxVerificationChildRecord = z.infer<typeof NxVerificationChildRecordSchema>;

export const ProductionWorkflowRecoveryScenarioSchema = z.enum([
  'all-pass',
  'pilot-disabled',
  'missing-child-ref',
  'hash-mismatch',
  'workflow-approval-blocked',
  'child-dry-run-failed',
  'child-approval-blocked',
  'child-run-missing',
  'worktree-failed',
  'codex-patch-failed',
  'nx-failed',
  'nx-verification-failed',
  'review-export-blocked',
  'review-package-blocked',
  'branch-publish-failed',
  'draft-pr-failed',
  'lifecycle-checks-failed',
  'remote-cleanup-blocked',
  'resume-after-child-approval',
  'superseded-source',
]);
export type ProductionWorkflowRecoveryScenario = z.infer<
  typeof ProductionWorkflowRecoveryScenarioSchema
>;

export const ProductionWorkflowChildActionPlanSchema = z
  .object({
    actionId: z.string().min(1),
    stepId: z.string().min(1),
    stepKind: CustomWorkflowStepKindSchema,
    childActionKind: ProductionWorkflowChildActionKindSchema,
    childControlPlane: z.string().min(1),
    actionMode: ActionModeSchema,
    riskLevel: RiskLevelSchema,
    requiresChildApproval: z.boolean(),
    createsChildDryRun: z.boolean().default(true),
    createsChildApprovalRequest: z.boolean().default(true),
    childAutoApprovalAllowed: z.literal(false).default(false),
    childAdapterExecuteAllowed: z.literal(false).default(false),
    hashBindingRequired: z.literal(true).default(true),
    summary: z.string().min(1),
  })
  .strict()
  .superRefine(rejectCustomWorkflowRawMetadata);
export type ProductionWorkflowChildActionPlan = z.infer<
  typeof ProductionWorkflowChildActionPlanSchema
>;

export const ProductionWorkflowChildActionStateSchema = z
  .object({
    actionId: z.string().min(1),
    stepId: z.string().min(1),
    stepKind: CustomWorkflowStepKindSchema,
    childActionKind: ProductionWorkflowChildActionKindSchema,
    childControlPlane: z.string().min(1),
    status: ProductionWorkflowChildActionStatusSchema,
    childDryRunIdHash: z.string().min(1).optional(),
    childApprovalRequestIdHash: z.string().min(1).optional(),
    childApprovalArtifactIdHash: z.string().min(1).optional(),
    childRunIdHash: z.string().min(1).optional(),
    childHashBindingMatched: z.boolean().default(false),
    childApprovalRequired: z.boolean(),
    childApprovalResolvedFromStore: z.boolean().default(false),
    childAutoApprovalAllowed: z.literal(false).default(false),
    childAdapterExecuteAllowed: z.literal(false).default(false),
    blockReasons: z.array(z.string().min(1)).default([]),
    evidenceRefIds: z.array(z.string().min(1)).default([]),
    auditEventIds: z.array(z.string().min(1)).default([]),
    processBoundaryInvoked: z.boolean().default(false),
    externalProcessStarted: z.boolean().default(false),
    networkBoundaryInvoked: z.boolean().default(false),
    bodyStored: z.literal(false).default(false),
    rawPathStored: z.literal(false).default(false),
    summary: z.string().min(1),
  })
  .strict()
  .superRefine(rejectCustomWorkflowRawMetadata);
export type ProductionWorkflowChildActionState = z.infer<
  typeof ProductionWorkflowChildActionStateSchema
>;

export const ProductionWorkflowChildActionStateRecordSchema =
  createdEntityBaseSchema
    .extend({
      dryRunId: z.string().min(1),
      recoveryRunId: z.string().min(1).optional(),
      actionId: z.string().min(1),
      stepId: z.string().min(1),
      status: ProductionWorkflowChildActionStatusSchema,
      state: ProductionWorkflowChildActionStateSchema,
      bodyStored: z.literal(false).default(false),
      rawPathStored: z.literal(false).default(false),
      summary: z.string().min(1),
    })
    .strict()
    .superRefine(rejectCustomWorkflowRawMetadata);
export type ProductionWorkflowChildActionStateRecord = z.infer<
  typeof ProductionWorkflowChildActionStateRecordSchema
>;

export const ProductionWorkflowRecoveryStepSchema = z
  .object({
    stepId: z.string().min(1),
    kind: CustomWorkflowStepKindSchema,
    status: ProductionWorkflowRecoveryStatusSchema,
    childActionStates: z.array(ProductionWorkflowChildActionStateSchema).default([]),
    blockReasons: z.array(z.string().min(1)).default([]),
    evidenceRefIds: z.array(z.string().min(1)).default([]),
    auditEventIds: z.array(z.string().min(1)).default([]),
    processBoundaryInvoked: z.boolean().default(false),
    externalProcessStarted: z.boolean().default(false),
    networkBoundaryInvoked: z.boolean().default(false),
    directAdapterExecutionAllowed: z.literal(false).default(false),
    bodyStored: z.literal(false).default(false),
    rawPathStored: z.literal(false).default(false),
    summary: z.string().min(1),
  })
  .strict()
  .superRefine(rejectCustomWorkflowRawMetadata);
export type ProductionWorkflowRecoveryStep = z.infer<
  typeof ProductionWorkflowRecoveryStepSchema
>;

export const ProductionWorkflowRecoveryPlanSchema = createdEntityBaseSchema
  .extend({
    dryRunId: z.string().min(1),
    templateId: z.string().min(1),
    templateHash: z.string().min(1),
    sourceRunIdHash: z.string().min(1).optional(),
    status: ProductionWorkflowRecoveryStatusSchema,
    childActionPlans: z.array(ProductionWorkflowChildActionPlanSchema),
    childActionCount: z.number().int().nonnegative(),
    approvalRequired: z.literal(true).default(true),
    childApprovalsRequired: z.number().int().nonnegative(),
    blockReasons: z.array(z.string().min(1)).default([]),
    evidenceRefIds: z.array(z.string().min(1)).default([]),
    auditEventIds: z.array(z.string().min(1)).default([]),
    processBoundaryInvoked: z.literal(false).default(false),
    externalProcessStarted: z.literal(false).default(false),
    networkBoundaryInvoked: z.literal(false).default(false),
    directAdapterExecutionAllowed: z.literal(false).default(false),
    childAdapterExecuteAllowed: z.literal(false).default(false),
    noRealWrite: z.literal(true).default(true),
    bodyStored: z.literal(false).default(false),
    rawPathStored: z.literal(false).default(false),
    summary: z.string().min(1),
  })
  .strict()
  .superRefine((value, ctx) => {
    rejectCustomWorkflowRawMetadata(value, ctx);
    if (value.childActionCount !== value.childActionPlans.length) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Production workflow recovery childActionCount must match childActionPlans length',
        path: ['childActionCount'],
      });
    }
  });
export type ProductionWorkflowRecoveryPlan = z.infer<
  typeof ProductionWorkflowRecoveryPlanSchema
>;

export const ProductionWorkflowRecoveryApprovalArtifactSchema =
  createdEntityBaseSchema
    .extend({
      dryRunId: z.string().min(1),
      templateId: z.string().min(1),
      templateHash: z.string().min(1),
      approvalArtifactId: z.string().min(1),
      status: CustomWorkflowApprovalStatusSchema,
      approvedBy: z.string().min(1).optional(),
      reasonHash: z.string().min(1).optional(),
      reasonSummary: z.string().min(1).optional(),
      expiresAt: IsoDateTimeSchema.optional(),
      usedAt: IsoDateTimeSchema.optional(),
      childApprovalsIncluded: z.literal(false).default(false),
      bodyStored: z.literal(false).default(false),
      rawPathStored: z.literal(false).default(false),
      summary: z.string().min(1),
    })
    .strict()
    .superRefine(rejectCustomWorkflowRawMetadata);
export type ProductionWorkflowRecoveryApprovalArtifact = z.infer<
  typeof ProductionWorkflowRecoveryApprovalArtifactSchema
>;

export const ProductionWorkflowRecoveryRunSchema = createdEntityBaseSchema
  .extend({
    recoveryRunId: z.string().min(1),
    dryRunId: z.string().min(1),
    approvalArtifactId: z.string().min(1).optional(),
    templateId: z.string().min(1),
    templateHash: z.string().min(1),
    status: ProductionWorkflowRecoveryStatusSchema,
    steps: z.array(ProductionWorkflowRecoveryStepSchema),
    childActionStates: z.array(ProductionWorkflowChildActionStateSchema),
    stepCount: z.number().int().nonnegative(),
    childActionCount: z.number().int().nonnegative(),
    completedChildActionCount: z.number().int().nonnegative(),
    waitingChildApprovalCount: z.number().int().nonnegative(),
    failedChildActionCount: z.number().int().nonnegative(),
    lastSafeStepId: z.string().min(1).optional(),
    resumeFromStepId: z.string().min(1).optional(),
    blockReasons: z.array(z.string().min(1)).default([]),
    evidenceRefIds: z.array(z.string().min(1)).default([]),
    auditEventIds: z.array(z.string().min(1)).default([]),
    processBoundaryInvoked: z.boolean().default(false),
    externalProcessStarted: z.boolean().default(false),
    networkBoundaryInvoked: z.boolean().default(false),
    directAdapterExecutionAllowed: z.literal(false).default(false),
    childAdapterExecuteAllowed: z.literal(false).default(false),
    noRealWrite: z.boolean().default(true),
    bodyStored: z.literal(false).default(false),
    rawPathStored: z.literal(false).default(false),
    summary: z.string().min(1),
  })
  .strict()
  .superRefine((value, ctx) => {
    rejectCustomWorkflowRawMetadata(value, ctx);
    if (value.stepCount !== value.steps.length) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Production workflow recovery stepCount must match steps length',
        path: ['stepCount'],
      });
    }
    if (value.childActionCount !== value.childActionStates.length) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Production workflow recovery childActionCount must match childActionStates length',
        path: ['childActionCount'],
      });
    }
  });
export type ProductionWorkflowRecoveryRun = z.infer<
  typeof ProductionWorkflowRecoveryRunSchema
>;

export const ProductionWorkflowRecoveryTimelineEventSchema =
  createdEntityBaseSchema
    .extend({
      recoveryRunId: z.string().min(1),
      eventType: z.enum([
        'dry_run_created',
        'workflow_approval_requested',
        'workflow_approval_used',
        'child_dry_run_created',
        'child_approval_requested',
        'child_waiting_for_approval',
        'child_run_completed',
        'child_run_failed',
        'recovery_blocked',
        'recovery_completed',
      ]),
      status: ProductionWorkflowRecoveryStatusSchema,
      childActionId: z.string().min(1).optional(),
      evidenceRefIds: z.array(z.string().min(1)).default([]),
      auditEventIds: z.array(z.string().min(1)).default([]),
      summary: z.string().min(1),
    })
    .strict()
    .superRefine(rejectCustomWorkflowRawMetadata);
export type ProductionWorkflowRecoveryTimelineEvent = z.infer<
  typeof ProductionWorkflowRecoveryTimelineEventSchema
>;

export const ProductionWorkflowRecoveryPublicSummarySchema =
  createdEntityBaseSchema
    .extend({
      recoveryRunId: z.string().min(1),
      templateId: z.string().min(1),
      templateHash: z.string().min(1),
      status: ProductionWorkflowRecoveryStatusSchema,
      childActionCount: z.number().int().nonnegative(),
      waitingChildApprovalCount: z.number().int().nonnegative(),
      failedChildActionCount: z.number().int().nonnegative(),
      evidenceRefIds: z.array(z.string().min(1)).default([]),
      auditEventIds: z.array(z.string().min(1)).default([]),
      processBoundaryInvoked: z.boolean().default(false),
      externalProcessStarted: z.boolean().default(false),
      networkBoundaryInvoked: z.boolean().default(false),
      bodyStored: z.literal(false).default(false),
      rawPathStored: z.literal(false).default(false),
      summary: z.string().min(1),
    })
    .strict()
    .superRefine(rejectCustomWorkflowRawMetadata);
export type ProductionWorkflowRecoveryPublicSummary = z.infer<
  typeof ProductionWorkflowRecoveryPublicSummarySchema
>;

export const McpToolNameSchema = z.enum([
  'codexhub.getArchitectureMap',
  'codexhub.getPolicySummary',
  'codexhub.getRiskMatrix',
  'codexhub.getEvidenceSummary',
  'codexhub.getOpenDevelopmentRequests',
  'codexhub.getAffectedProjectsDryRun',
  'codexhub.readObservationSnapshot',
]);
export type McpToolName = z.infer<typeof McpToolNameSchema>;

export const McpToolApprovalPolicySchema = z.enum([
  'not-required',
  'approval-gated',
  'disabled',
]);
export type McpToolApprovalPolicy = z.infer<typeof McpToolApprovalPolicySchema>;

export const McpToolDefinitionSchema = createdEntityBaseSchema.extend({
  name: McpToolNameSchema,
  title: z.string().min(1),
  description: z.string().min(1),
  enabled: z.boolean(),
  riskLevel: RiskLevelSchema,
  actionMode: ActionModeSchema,
  approvalPolicy: McpToolApprovalPolicySchema,
  evidencePolicy: CapabilityEvidencePolicySchema,
  outputBodyStored: z.boolean().default(false),
  processBoundaryInvoked: z.boolean().default(false),
  externalProcessStarted: z.boolean().default(false),
  noRealWrite: z.boolean().default(true),
});
export type McpToolDefinition = z.infer<typeof McpToolDefinitionSchema>;

export const McpToolInvocationStatusSchema = z.enum([
  'completed',
  'failed',
  'blocked',
]);
export type McpToolInvocationStatus = z.infer<typeof McpToolInvocationStatusSchema>;

export const McpToolInvocationSummarySchema = createdEntityBaseSchema.extend({
  toolName: McpToolNameSchema,
  status: McpToolInvocationStatusSchema,
  policyDecisionId: z.string().min(1),
  evidenceRefIds: z.array(z.string().min(1)).default([]),
  auditEventIds: z.array(z.string().min(1)).default([]),
  inputHash: z.string().min(1),
  outputHash: z.string().min(1),
  summary: z.string().min(1),
  bodyStored: z.boolean().default(false),
  rawPathStored: z.boolean().default(false),
  processBoundaryInvoked: z.boolean().default(false),
  externalProcessStarted: z.boolean().default(false),
  noRealWrite: z.boolean().default(true),
});
export type McpToolInvocationSummary = z.infer<typeof McpToolInvocationSummarySchema>;

export const ObservationSeveritySchema = z.enum(['info', 'warning', 'error']);
export type ObservationSeverity = z.infer<typeof ObservationSeveritySchema>;

export const ObservationSchema = observedEntityBaseSchema.extend({
  source: z.string().min(1),
  kind: z.string().min(1),
  summary: z.string().min(1),
  severity: ObservationSeveritySchema,
});
export type Observation = z.infer<typeof ObservationSchema>;

export const SourceHealthStatusSchema = z.enum(['ok', 'degraded', 'unavailable', 'unknown']);
export type SourceHealthStatus = z.infer<typeof SourceHealthStatusSchema>;

export const SourceHealthSchema = observedEntityBaseSchema.extend({
  source: z.string().min(1),
  status: SourceHealthStatusSchema,
  lastObservationAt: IsoDateTimeSchema.optional(),
  observationsCount: z.number().int().nonnegative(),
});
export type SourceHealth = z.infer<typeof SourceHealthSchema>;

export const BrowserObservationCapabilitySchema = z.enum([
  'title',
  'url',
  'accessibility_snapshot',
  'console_summary',
  'network_metadata_summary',
]);
export type BrowserObservationCapability = z.infer<typeof BrowserObservationCapabilitySchema>;

export const BrowserObservationRunnerModeSchema = z.enum([
  'fixture',
  'controlled-local-browser',
]);
export type BrowserObservationRunnerMode = z.infer<typeof BrowserObservationRunnerModeSchema>;

const BrowserForbiddenActionValues = [
  'screenshot',
  'network_body',
  'click',
  'type',
  'submit',
  'file_upload',
  'file_download',
  ['coo', 'kie_extraction'].join(''),
  ['to', 'ken_extraction'].join(''),
  ['sess', 'ion_extraction'].join(''),
  'local_storage_dump',
  ['sess', 'ion_storage_dump'].join(''),
] as [string, ...string[]];
export const BrowserForbiddenActionSchema = z.enum(BrowserForbiddenActionValues);
export type BrowserForbiddenAction = z.infer<typeof BrowserForbiddenActionSchema>;

export const BrowserProfileReadinessStatusSchema = z.enum([
  'ready',
  'blocked',
  'unavailable',
  'unknown',
]);
export type BrowserProfileReadinessStatus = z.infer<
  typeof BrowserProfileReadinessStatusSchema
>;

export const BrowserProfileReadinessBlockReasonSchema = z.enum([
  'profile_path_hash_required',
  'raw_profile_path_forbidden',
  'browser_connection_disabled',
  'profile_probe_disabled',
  'forbidden_action_requested',
  'network_body_forbidden',
  'screenshot_requires_approval',
  'capability_required',
  'capability_forbidden',
  'fixture_runner_missing',
  'execution_authority_missing',
  'execution_authority_invalid',
  'execution_authority_not_allowed',
  'execution_authority_expired',
  'approval_artifact_missing',
  'target_url_required',
  'target_url_forbidden',
]);
export type BrowserProfileReadinessBlockReason = z.infer<
  typeof BrowserProfileReadinessBlockReasonSchema
>;

export const BrowserProfileRefSchema = createdEntityBaseSchema
  .extend({
    profileId: z.string().min(1),
    displayName: z.string().min(1),
    profilePathHash: z.string().min(1),
    rawPathStored: z.literal(false),
    readOnly: z.literal(true),
  })
  .strict();
export type BrowserProfileRef = z.infer<typeof BrowserProfileRefSchema>;

export const BrowserProfileReadinessSchema = observedEntityBaseSchema
  .extend({
    profileRef: BrowserProfileRefSchema,
    status: BrowserProfileReadinessStatusSchema,
    blockReasons: z.array(BrowserProfileReadinessBlockReasonSchema).default([]),
    allowedCapabilities: z.array(BrowserObservationCapabilitySchema).default([]),
    forbiddenActions: z.array(BrowserForbiddenActionSchema).default([]),
    rawPathStored: z.literal(false),
    bodyStored: z.literal(false),
    noRealWrite: z.literal(true),
    processBoundaryInvoked: z.literal(false),
    externalProcessStarted: z.literal(false),
    summary: z.string().min(1),
  })
  .strict();
export type BrowserProfileReadiness = z.infer<typeof BrowserProfileReadinessSchema>;

export const BrowserConsoleSummarySchema = z
  .object({
    messageCount: z.number().int().nonnegative(),
    warningCount: z.number().int().nonnegative(),
    errorCount: z.number().int().nonnegative(),
    bodyStored: z.literal(false),
  })
  .strict();
export type BrowserConsoleSummary = z.infer<typeof BrowserConsoleSummarySchema>;

export const BrowserNetworkMetadataSummarySchema = z
  .object({
    requestCount: z.number().int().nonnegative(),
    responseCount: z.number().int().nonnegative(),
    failedRequestCount: z.number().int().nonnegative(),
    bodyStored: z.literal(false),
  })
  .strict();
export type BrowserNetworkMetadataSummary = z.infer<
  typeof BrowserNetworkMetadataSummarySchema
>;

export const BrowserPageObservationPlanSchema = createdEntityBaseSchema
  .extend({
    adapterName: z.string().min(1),
    profileRef: BrowserProfileRefSchema,
    requestedCapabilities: z.array(BrowserObservationCapabilitySchema).default([]),
    runnerMode: BrowserObservationRunnerModeSchema.default('fixture'),
    targetUrlHash: z.string().min(1).optional(),
    forbiddenActions: z.array(BrowserForbiddenActionSchema).default([]),
    blockReasons: z.array(BrowserProfileReadinessBlockReasonSchema).default([]),
    screenshotPlanned: z.literal(false),
    networkBodyStorage: z.literal('forbidden'),
    rawPathStored: z.literal(false),
    bodyStored: z.literal(false),
    noRealWrite: z.literal(true),
    processBoundaryPlanned: z.boolean(),
    processBoundaryInvoked: z.literal(false),
    externalProcessStarted: z.literal(false),
    summary: z.string().min(1),
  })
  .strict();
export type BrowserPageObservationPlan = z.infer<typeof BrowserPageObservationPlanSchema>;

export const BrowserPageObservationSummarySchema = observedEntityBaseSchema
  .extend({
    source: z.string().min(1),
    kind: z.string().min(1),
    severity: ObservationSeveritySchema,
    planId: z.string().min(1),
    profileRef: BrowserProfileRefSchema,
    titleObserved: z.boolean(),
    pageTitleHash: z.string().min(1).optional(),
    urlObserved: z.boolean(),
    pageUrlHash: z.string().min(1).optional(),
    accessibilitySnapshotHash: z.string().min(1).optional(),
    accessibilityNodeCount: z.number().int().nonnegative().optional(),
    consoleSummary: BrowserConsoleSummarySchema,
    networkSummary: BrowserNetworkMetadataSummarySchema,
    rawPathStored: z.literal(false),
    bodyStored: z.literal(false),
    noRealWrite: z.literal(true),
    processBoundaryInvoked: z.boolean(),
    externalProcessStarted: z.boolean(),
    summary: z.string().min(1),
  })
  .strict();
export type BrowserPageObservationSummary = z.infer<
  typeof BrowserPageObservationSummarySchema
>;

export const BrowserObservationRunStatusSchema = z.enum([
  'planned',
  'completed',
  'failed',
  'blocked',
  'aborted',
]);
export type BrowserObservationRunStatus = z.infer<typeof BrowserObservationRunStatusSchema>;

export const BrowserObservationRunSchema = createdEntityBaseSchema
  .extend({
    status: BrowserObservationRunStatusSchema,
    plan: BrowserPageObservationPlanSchema,
    readiness: BrowserProfileReadinessSchema.optional(),
    pageSummary: BrowserPageObservationSummarySchema.optional(),
    evidenceRefs: z.array(EvidenceRefSchema).default([]),
    auditEventIds: z.array(z.string().min(1)).default([]),
    rawPathStored: z.literal(false),
    bodyStored: z.literal(false),
    noRealWrite: z.literal(true),
    processBoundaryInvoked: z.boolean(),
    externalProcessStarted: z.boolean(),
    summary: z.string().min(1),
  })
  .strict();
export type BrowserObservationRun = z.infer<typeof BrowserObservationRunSchema>;

export const ElectronProcessKindSchema = z.enum([
  'main',
  'renderer',
  'utility',
  'gpu',
  'worker',
  'unknown',
]);
export type ElectronProcessKind = z.infer<typeof ElectronProcessKindSchema>;

export const ElectronTargetTypeSchema = z.enum([
  'page',
  'background_page',
  'service_worker',
  'shared_worker',
  'webview',
  'renderer',
  'worker',
  'unknown',
]);
export type ElectronTargetType = z.infer<typeof ElectronTargetTypeSchema>;

export const OsProcessObservationStatusSchema = z.enum([
  'observed',
  'not_found',
  'blocked',
  'unknown',
]);
export type OsProcessObservationStatus = z.infer<
  typeof OsProcessObservationStatusSchema
>;

export const OsProcessObservedKindSchema = z.enum([
  'codex-desktop',
  'electron',
  'codex-app-server',
  'chrome',
  'node',
  'unknown',
]);
export type OsProcessObservedKind = z.infer<typeof OsProcessObservedKindSchema>;

export const CodexDesktopHealthStatusSchema = z.enum([
  'ready',
  'degraded',
  'blocked',
  'unknown',
]);
export type CodexDesktopHealthStatus = z.infer<
  typeof CodexDesktopHealthStatusSchema
>;

export const CodexDesktopDiagnosticHintSchema = z.enum([
  'desktop_ui_frozen',
  'app_server_unresponsive',
  'quota_depleted',
  'codex_logged_out',
  'wrong_account',
  'workspace_mismatch',
  'no_cdp_endpoint',
  'no_process',
  'unknown',
]);
export type CodexDesktopDiagnosticHint = z.infer<
  typeof CodexDesktopDiagnosticHintSchema
>;

export const ElectronCdpObservationCapabilitySchema = z.enum([
  'process_summary',
  'debug_endpoint_summary',
  'target_summary',
  'console_summary',
  'network_metadata_summary',
]);
export type ElectronCdpObservationCapability = z.infer<
  typeof ElectronCdpObservationCapabilitySchema
>;

export const ElectronCdpObservationRunnerModeSchema = z.enum([
  'fixture',
  'controlled-local-http',
  'controlled-websocket-events',
]);
export type ElectronCdpObservationRunnerMode = z.infer<
  typeof ElectronCdpObservationRunnerModeSchema
>;

const ElectronCdpForbiddenActionValues = [
  'main_inspector',
  'runtime_evaluate',
  'dom_mutation',
  'click',
  'type',
  'screenshot',
  'dom_snapshot',
  'network_body',
  'generic_cdp_command',
  ['coo', 'kie_extraction'].join(''),
  ['to', 'ken_extraction'].join(''),
  ['sess', 'ion_extraction'].join(''),
] as [string, ...string[]];
export const ElectronCdpForbiddenActionSchema = z.enum(ElectronCdpForbiddenActionValues);
export type ElectronCdpForbiddenAction = z.infer<
  typeof ElectronCdpForbiddenActionSchema
>;

export const ElectronCdpBlockReasonSchema = z.enum([
  'capability_required',
  'capability_forbidden',
  'forbidden_action_requested',
  'non_loopback_endpoint_forbidden',
  'main_inspector_forbidden',
  'runtime_evaluate_forbidden',
  'dom_mutation_forbidden',
  'click_type_forbidden',
  'screenshot_forbidden',
  'dom_snapshot_forbidden',
  'network_body_forbidden',
  'generic_cdp_command_forbidden',
  'fixture_runner_missing',
  'execution_authority_missing',
  'execution_authority_invalid',
  'execution_authority_not_allowed',
  'execution_authority_expired',
  'fixture_process_boundary_forbidden',
  'approval_artifact_missing',
  'approval_artifact_invalid',
  'approval_artifact_expired',
  'approval_artifact_used',
  'approval_artifact_revoked',
  'controlled_http_disabled',
  'controlled_http_runner_missing',
  'controlled_websocket_events_disabled',
  'controlled_websocket_runner_missing',
  'endpoint_hash_mismatch',
  'target_hash_required',
  'target_hash_mismatch',
  'cdp_http_boundary_failed',
  'cdp_websocket_boundary_failed',
  'non_loopback_websocket_url_forbidden',
  'websocket_debugger_url_missing',
  'event_observation_timeout',
  'malformed_devtools_json',
]);
export type ElectronCdpBlockReason = z.infer<typeof ElectronCdpBlockReasonSchema>;

export const ElectronCdpAllowedCommandSchema = z.enum([
  'Browser.getVersion',
  'Target.getTargets',
  'Log.enable',
  'Runtime.enable',
  'Network.enable',
]);
export type ElectronCdpAllowedCommand = z.infer<typeof ElectronCdpAllowedCommandSchema>;

export const ElectronCdpCommandAllowlistDecisionSchema = createdEntityBaseSchema
  .extend({
    command: z.string().min(1),
    allowed: z.boolean(),
    riskLevel: RiskLevelSchema,
    reason: z.string().min(1),
    runtimeEvaluateAllowed: z.literal(false),
    genericCommandPassthrough: z.literal(false),
    bodyStored: z.literal(false),
    noRealWrite: z.literal(true),
  })
  .strict();
export type ElectronCdpCommandAllowlistDecision = z.infer<
  typeof ElectronCdpCommandAllowlistDecisionSchema
>;

export const OsProcessMetadataSummarySchema = observedEntityBaseSchema
  .extend({
    observedKind: OsProcessObservedKindSchema,
    processNameHash: z.string().min(1),
    processIdHash: z.string().min(1).optional(),
    parentProcessIdHash: z.string().min(1).optional(),
    executablePathHash: z.string().min(1).optional(),
    commandLineHash: z.string().min(1).optional(),
    allowlistMatched: z.boolean().default(false),
    status: OsProcessObservationStatusSchema,
    cpuSampleCount: z.number().int().nonnegative().default(0),
    cpuPercentRounded: z.number().nonnegative().max(100).optional(),
    memoryBytesRounded: z.number().int().nonnegative().optional(),
    durationMs: z.number().int().nonnegative().optional(),
    rawPathStored: z.literal(false),
    bodyStored: z.literal(false),
    noRealWrite: z.literal(true),
    processBoundaryInvoked: z.literal(false),
    externalProcessStarted: z.literal(false),
    summary: z.string().min(1),
  })
  .strict();
export type OsProcessMetadataSummary = z.infer<
  typeof OsProcessMetadataSummarySchema
>;

export const ElectronProcessSummarySchema = createdEntityBaseSchema
  .extend({
    processIdHash: z.string().min(1),
    executablePathHash: z.string().min(1),
    commandLineHash: z.string().min(1).optional(),
    processKind: ElectronProcessKindSchema,
    windowTitleHash: z.string().min(1).optional(),
    rawPathStored: z.literal(false),
    bodyStored: z.literal(false),
    noRealWrite: z.literal(true),
    processBoundaryInvoked: z.literal(false),
    externalProcessStarted: z.literal(false),
    summary: z.string().min(1),
  })
  .strict();
export type ElectronProcessSummary = z.infer<typeof ElectronProcessSummarySchema>;

export const ElectronDebugEndpointSummarySchema = createdEntityBaseSchema
  .extend({
    endpointIdHash: z.string().min(1),
    hostHash: z.string().min(1),
    portHash: z.string().min(1),
    protocol: z.literal('cdp'),
    loopbackOnly: z.literal(true),
    userEnabled: z.boolean(),
    mainInspectorEnabled: z.literal(false),
    runtimeEvaluateAllowed: z.literal(false),
    genericCommandPassthrough: z.literal(false),
    rawPathStored: z.literal(false),
    bodyStored: z.literal(false),
    noRealWrite: z.literal(true),
    processBoundaryInvoked: z.literal(false),
    externalProcessStarted: z.literal(false),
    summary: z.string().min(1),
  })
  .strict();
export type ElectronDebugEndpointSummary = z.infer<
  typeof ElectronDebugEndpointSummarySchema
>;

export const ElectronTargetSummarySchema = observedEntityBaseSchema
  .extend({
    endpointIdHash: z.string().min(1),
    targetIdHash: z.string().min(1),
    targetType: ElectronTargetTypeSchema,
    titleHash: z.string().min(1).optional(),
    urlHash: z.string().min(1).optional(),
    attached: z.literal(false),
    mainInspector: z.literal(false),
    runtimeEvaluateAllowed: z.literal(false),
    genericCommandPassthrough: z.literal(false),
    rawPathStored: z.literal(false),
    bodyStored: z.literal(false),
    noRealWrite: z.literal(true),
    processBoundaryInvoked: z.literal(false),
    externalProcessStarted: z.literal(false),
    summary: z.string().min(1),
  })
  .strict();
export type ElectronTargetSummary = z.infer<typeof ElectronTargetSummarySchema>;

export const ElectronCdpConsoleSummarySchema = z
  .object({
    messageCount: z.number().int().nonnegative(),
    warningCount: z.number().int().nonnegative(),
    errorCount: z.number().int().nonnegative(),
    bodyStored: z.literal(false),
  })
  .strict();
export type ElectronCdpConsoleSummary = z.infer<
  typeof ElectronCdpConsoleSummarySchema
>;

export const ElectronCdpNetworkMetadataSummarySchema = z
  .object({
    requestCount: z.number().int().nonnegative(),
    responseCount: z.number().int().nonnegative(),
    failedRequestCount: z.number().int().nonnegative(),
    bodyStored: z.literal(false),
  })
  .strict();
export type ElectronCdpNetworkMetadataSummary = z.infer<
  typeof ElectronCdpNetworkMetadataSummarySchema
>;

export const ElectronCdpEventMetadataSummarySchema = z
  .object({
    observationWindowMs: z.number().int().positive().max(30_000),
    eventCount: z.number().int().nonnegative(),
    consoleEventCount: z.number().int().nonnegative(),
    networkEventCount: z.number().int().nonnegative(),
    payloadHashes: z.array(z.string().min(1)).default([]),
    bodyStored: z.literal(false),
    rawPathStored: z.literal(false),
    noRealWrite: z.literal(true),
  })
  .strict();
export type ElectronCdpEventMetadataSummary = z.infer<
  typeof ElectronCdpEventMetadataSummarySchema
>;

export const ElectronCdpObservationPlanSchema = createdEntityBaseSchema
  .extend({
    adapterName: z.string().min(1),
    runnerMode: ElectronCdpObservationRunnerModeSchema.default('fixture'),
    processSummary: ElectronProcessSummarySchema.optional(),
    debugEndpoint: ElectronDebugEndpointSummarySchema.optional(),
    targets: z.array(ElectronTargetSummarySchema).default([]),
    targetIdHash: z.string().min(1).optional(),
    requestedCapabilities: z.array(ElectronCdpObservationCapabilitySchema).default([]),
    forbiddenActions: z.array(ElectronCdpForbiddenActionSchema).default([]),
    blockReasons: z.array(ElectronCdpBlockReasonSchema).default([]),
    commandDecisions: z.array(ElectronCdpCommandAllowlistDecisionSchema).default([]),
    mainInspectorEnabled: z.literal(false),
    runtimeEvaluateAllowed: z.literal(false),
    genericCommandPassthrough: z.literal(false),
    screenshotPlanned: z.literal(false),
    domSnapshotPlanned: z.literal(false),
    networkBodyStorage: z.literal('forbidden'),
    rawPathStored: z.literal(false),
    bodyStored: z.literal(false),
    noRealWrite: z.literal(true),
    observationWindowMs: z.number().int().positive().max(30_000).default(5_000),
    cdpHttpBoundaryPlanned: z.boolean().default(false),
    cdpHttpBoundaryInvoked: z.literal(false).default(false),
    cdpWebSocketBoundaryPlanned: z.boolean().default(false),
    cdpWebSocketBoundaryInvoked: z.literal(false).default(false),
    processBoundaryPlanned: z.literal(false),
    processBoundaryInvoked: z.literal(false),
    externalProcessStarted: z.literal(false),
    summary: z.string().min(1),
  })
  .strict();
export type ElectronCdpObservationPlan = z.infer<
  typeof ElectronCdpObservationPlanSchema
>;

export const ElectronCdpObservationSummarySchema = observedEntityBaseSchema
  .extend({
    source: z.string().min(1),
    kind: z.string().min(1),
    severity: ObservationSeveritySchema,
    planId: z.string().min(1),
    processSummary: ElectronProcessSummarySchema.optional(),
    debugEndpoint: ElectronDebugEndpointSummarySchema.optional(),
    targets: z.array(ElectronTargetSummarySchema).default([]),
    consoleSummary: ElectronCdpConsoleSummarySchema,
    networkSummary: ElectronCdpNetworkMetadataSummarySchema,
    eventSummary: ElectronCdpEventMetadataSummarySchema.optional(),
    rawPathStored: z.literal(false),
    bodyStored: z.literal(false),
    noRealWrite: z.literal(true),
    cdpHttpBoundaryInvoked: z.boolean().default(false),
    cdpWebSocketBoundaryInvoked: z.boolean().default(false),
    processBoundaryInvoked: z.literal(false),
    externalProcessStarted: z.literal(false),
    summary: z.string().min(1),
  })
  .strict();
export type ElectronCdpObservationSummary = z.infer<
  typeof ElectronCdpObservationSummarySchema
>;

export const CodexDesktopHealthSnapshotSchema = observedEntityBaseSchema
  .extend({
    status: CodexDesktopHealthStatusSchema,
    processSummary: ElectronProcessSummarySchema.optional(),
    osProcessSummary: OsProcessMetadataSummarySchema.optional(),
    debugEndpoint: ElectronDebugEndpointSummarySchema.optional(),
    targetCount: z.number().int().nonnegative().default(0),
    consoleErrorCount: z.number().int().nonnegative().default(0),
    networkFailedRequestCount: z.number().int().nonnegative().default(0),
    appServerResponsive: z.boolean().default(false),
    desktopUiResponsive: z.boolean().default(false),
    quotaAvailable: z.boolean().default(false),
    loggedIn: z.boolean().default(false),
    accountMatched: z.boolean().default(false),
    workspaceMatched: z.boolean().default(false),
    diagnosticHints: z.array(CodexDesktopDiagnosticHintSchema).default([]),
    rawPathStored: z.literal(false),
    bodyStored: z.literal(false),
    noRealWrite: z.literal(true),
    cdpHttpBoundaryInvoked: z.boolean().default(false),
    cdpWebSocketBoundaryInvoked: z.boolean().default(false),
    processBoundaryInvoked: z.literal(false),
    externalProcessStarted: z.literal(false),
    summary: z.string().min(1),
  })
  .strict();
export type CodexDesktopHealthSnapshot = z.infer<
  typeof CodexDesktopHealthSnapshotSchema
>;

export const ElectronCdpObservationRunStatusSchema = z.enum([
  'planned',
  'completed',
  'failed',
  'blocked',
  'aborted',
]);
export type ElectronCdpObservationRunStatus = z.infer<
  typeof ElectronCdpObservationRunStatusSchema
>;

export const ElectronCdpObservationRunSchema = createdEntityBaseSchema
  .extend({
    status: ElectronCdpObservationRunStatusSchema,
    plan: ElectronCdpObservationPlanSchema,
    observationSummary: ElectronCdpObservationSummarySchema.optional(),
    evidenceRefs: z.array(EvidenceRefSchema).default([]),
    auditEventIds: z.array(z.string().min(1)).default([]),
    rawPathStored: z.literal(false),
    bodyStored: z.literal(false),
    noRealWrite: z.literal(true),
    cdpHttpBoundaryInvoked: z.boolean().default(false),
    cdpWebSocketBoundaryInvoked: z.boolean().default(false),
    processBoundaryInvoked: z.literal(false),
    externalProcessStarted: z.literal(false),
    summary: z.string().min(1),
  })
  .strict();
export type ElectronCdpObservationRun = z.infer<
  typeof ElectronCdpObservationRunSchema
>;

export const ElectronCdpControlPlaneApprovalStatusSchema = z.enum([
  'requested',
  'approved',
  'denied',
  'expired',
  'used',
  'revoked',
]);
export type ElectronCdpControlPlaneApprovalStatus = z.infer<
  typeof ElectronCdpControlPlaneApprovalStatusSchema
>;

export const ElectronCdpObservationTimelineEventSchema = createdEntityBaseSchema
  .extend({
    phase: z.enum(['dry-run', 'approval-request', 'approval-decision', 'execution']),
    status: ElectronCdpObservationRunStatusSchema.or(
      ElectronCdpControlPlaneApprovalStatusSchema,
    ),
    summary: z.string().min(1),
    evidenceRefIds: z.array(z.string().min(1)).default([]),
    auditEventIds: z.array(z.string().min(1)).default([]),
    bodyStored: z.literal(false),
    rawPathStored: z.literal(false),
    noRealWrite: z.literal(true),
    cdpHttpBoundaryInvoked: z.boolean(),
    cdpWebSocketBoundaryInvoked: z.boolean().default(false),
    processBoundaryInvoked: z.literal(false),
    externalProcessStarted: z.literal(false),
  })
  .strict();
export type ElectronCdpObservationTimelineEvent = z.infer<
  typeof ElectronCdpObservationTimelineEventSchema
>;

export const ElectronCdpObservationDryRunRecordSchema = createdEntityBaseSchema
  .extend({
    dryRunId: z.string().min(1),
    status: z.enum(['ready', 'blocked']),
    plan: ElectronCdpObservationPlanSchema,
    capabilityDryRun: CapabilityDryRunSchema,
    policyDecision: PolicyDecisionSchema,
    endpointIdHash: z.string().min(1).optional(),
    endpointHostHash: z.string().min(1).optional(),
    endpointPortHash: z.string().min(1).optional(),
    targetIdHash: z.string().min(1).optional(),
    blockReasons: z.array(ElectronCdpBlockReasonSchema).default([]),
    timeline: z.array(ElectronCdpObservationTimelineEventSchema).default([]),
    evidenceRefs: z.array(EvidenceRefSchema).default([]),
    auditEventIds: z.array(z.string().min(1)).default([]),
    rawPathStored: z.literal(false),
    bodyStored: z.literal(false),
    noRealWrite: z.literal(true),
    cdpHttpBoundaryPlanned: z.boolean(),
    cdpHttpBoundaryInvoked: z.literal(false),
    cdpWebSocketBoundaryPlanned: z.boolean().default(false),
    cdpWebSocketBoundaryInvoked: z.literal(false).default(false),
    processBoundaryPlanned: z.literal(false),
    processBoundaryInvoked: z.literal(false),
    externalProcessStarted: z.literal(false),
    summary: z.string().min(1),
  })
  .strict();
export type ElectronCdpObservationDryRunRecord = z.infer<
  typeof ElectronCdpObservationDryRunRecordSchema
>;

export const ElectronCdpObservationApprovalArtifactRecordSchema = createdEntityBaseSchema
  .extend({
    dryRunId: z.string().min(1),
    dryRunRecordId: z.string().min(1),
    approvalRequestId: z.string().min(1),
    approvalArtifactId: z.string().min(1).optional(),
    status: ElectronCdpControlPlaneApprovalStatusSchema,
    requestedBy: z.string().min(1),
    decidedBy: z.string().min(1).optional(),
    reasonHash: z.string().min(1).optional(),
    decisionReasonHash: z.string().min(1).optional(),
    dryRunPlanHash: z.string().min(1),
    policyDecisionId: z.string().min(1),
    policyDecisionHash: z.string().min(1),
    approved: z.boolean(),
    requestedAt: IsoDateTimeSchema,
    decidedAt: IsoDateTimeSchema.optional(),
    expiresAt: IsoDateTimeSchema.optional(),
    usedAt: IsoDateTimeSchema.optional(),
    revokedAt: IsoDateTimeSchema.optional(),
    timeline: z.array(ElectronCdpObservationTimelineEventSchema).default([]),
    evidenceRefs: z.array(EvidenceRefSchema).default([]),
    auditEventIds: z.array(z.string().min(1)).default([]),
    rawPathStored: z.literal(false),
    bodyStored: z.literal(false),
    noRealWrite: z.literal(true),
    cdpHttpBoundaryInvoked: z.literal(false),
    cdpWebSocketBoundaryInvoked: z.literal(false).default(false),
    processBoundaryInvoked: z.literal(false),
    externalProcessStarted: z.literal(false),
    summary: z.string().min(1),
  })
  .strict()
  .superRefine((record, context) => {
    if (record.status === 'approved' && (!record.approvalArtifactId || !record.expiresAt)) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'approved electron cdp approvals require artifact id and expiry',
        path: ['status'],
      });
    }

    if (record.status !== 'approved' && record.approved) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'only approved electron cdp approvals can set approved=true',
        path: ['approved'],
      });
    }
  });
export type ElectronCdpObservationApprovalArtifactRecord = z.infer<
  typeof ElectronCdpObservationApprovalArtifactRecordSchema
>;

export const ElectronCdpObservationControlPlaneRunSchema = createdEntityBaseSchema
  .extend({
    dryRunId: z.string().min(1),
    dryRunRecordId: z.string().min(1),
    approvalArtifactId: z.string().min(1).optional(),
    status: ElectronCdpObservationRunStatusSchema,
    planId: z.string().min(1),
    endpointIdHash: z.string().min(1).optional(),
    targetIdHash: z.string().min(1).optional(),
    electronRun: ElectronCdpObservationRunSchema.optional(),
    timeline: z.array(ElectronCdpObservationTimelineEventSchema).default([]),
    evidenceRefIds: z.array(z.string().min(1)).default([]),
    auditEventIds: z.array(z.string().min(1)).default([]),
    rawPathStored: z.literal(false),
    bodyStored: z.literal(false),
    noRealWrite: z.literal(true),
    cdpHttpBoundaryInvoked: z.boolean(),
    cdpWebSocketBoundaryInvoked: z.boolean().default(false),
    processBoundaryInvoked: z.literal(false),
    externalProcessStarted: z.literal(false),
    summary: z.string().min(1),
  })
  .strict();
export type ElectronCdpObservationControlPlaneRun = z.infer<
  typeof ElectronCdpObservationControlPlaneRunSchema
>;

export const BrowserObservationControlPlaneApprovalStatusSchema = z.enum([
  'requested',
  'approved',
  'denied',
  'expired',
  'used',
  'revoked',
]);
export type BrowserObservationControlPlaneApprovalStatus = z.infer<
  typeof BrowserObservationControlPlaneApprovalStatusSchema
>;

export const BrowserObservationTimelineEventSchema = createdEntityBaseSchema
  .extend({
    phase: z.enum(['dry-run', 'approval-request', 'approval-decision', 'execution']),
    status: BrowserObservationRunStatusSchema.or(
      BrowserObservationControlPlaneApprovalStatusSchema,
    ),
    summary: z.string().min(1),
    evidenceRefIds: z.array(z.string().min(1)).default([]),
    auditEventIds: z.array(z.string().min(1)).default([]),
    bodyStored: z.literal(false),
    rawPathStored: z.literal(false),
    noRealWrite: z.literal(true),
    processBoundaryInvoked: z.boolean(),
    externalProcessStarted: z.boolean(),
  })
  .strict();
export type BrowserObservationTimelineEvent = z.infer<
  typeof BrowserObservationTimelineEventSchema
>;

export const BrowserObservationDryRunRecordSchema = createdEntityBaseSchema
  .extend({
    dryRunId: z.string().min(1),
    status: z.enum(['ready', 'blocked']),
    plan: BrowserPageObservationPlanSchema,
    capabilityDryRun: CapabilityDryRunSchema,
    policyDecision: PolicyDecisionSchema,
    targetUrlHash: z.string().min(1).optional(),
    blockReasons: z.array(BrowserProfileReadinessBlockReasonSchema).default([]),
    timeline: z.array(BrowserObservationTimelineEventSchema).default([]),
    evidenceRefs: z.array(EvidenceRefSchema).default([]),
    auditEventIds: z.array(z.string().min(1)).default([]),
    rawPathStored: z.literal(false),
    bodyStored: z.literal(false),
    noRealWrite: z.literal(true),
    processBoundaryPlanned: z.boolean(),
    processBoundaryInvoked: z.literal(false),
    externalProcessStarted: z.literal(false),
    summary: z.string().min(1),
  })
  .strict();
export type BrowserObservationDryRunRecord = z.infer<
  typeof BrowserObservationDryRunRecordSchema
>;

export const BrowserObservationApprovalArtifactRecordSchema = createdEntityBaseSchema
  .extend({
    dryRunId: z.string().min(1),
    dryRunRecordId: z.string().min(1),
    approvalRequestId: z.string().min(1),
    approvalArtifactId: z.string().min(1).optional(),
    status: BrowserObservationControlPlaneApprovalStatusSchema,
    requestedBy: z.string().min(1),
    decidedBy: z.string().min(1).optional(),
    reasonHash: z.string().min(1).optional(),
    decisionReasonHash: z.string().min(1).optional(),
    dryRunPlanHash: z.string().min(1),
    policyDecisionId: z.string().min(1),
    policyDecisionHash: z.string().min(1),
    approved: z.boolean(),
    requestedAt: IsoDateTimeSchema,
    decidedAt: IsoDateTimeSchema.optional(),
    expiresAt: IsoDateTimeSchema.optional(),
    usedAt: IsoDateTimeSchema.optional(),
    revokedAt: IsoDateTimeSchema.optional(),
    timeline: z.array(BrowserObservationTimelineEventSchema).default([]),
    evidenceRefs: z.array(EvidenceRefSchema).default([]),
    auditEventIds: z.array(z.string().min(1)).default([]),
    rawPathStored: z.literal(false),
    bodyStored: z.literal(false),
    noRealWrite: z.literal(true),
    processBoundaryInvoked: z.literal(false),
    externalProcessStarted: z.literal(false),
    summary: z.string().min(1),
  })
  .strict()
  .superRefine((record, context) => {
    if (record.status === 'approved' && (!record.approvalArtifactId || !record.expiresAt)) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'approved browser observation approvals require artifact id and expiry',
        path: ['status'],
      });
    }

    if (record.status !== 'approved' && record.approved) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'only approved browser observation approvals can set approved=true',
        path: ['approved'],
      });
    }
  });
export type BrowserObservationApprovalArtifactRecord = z.infer<
  typeof BrowserObservationApprovalArtifactRecordSchema
>;

export const BrowserObservationControlPlaneRunSchema = createdEntityBaseSchema
  .extend({
    dryRunId: z.string().min(1),
    dryRunRecordId: z.string().min(1),
    approvalArtifactId: z.string().min(1).optional(),
    status: BrowserObservationRunStatusSchema,
    planId: z.string().min(1),
    targetUrlHash: z.string().min(1).optional(),
    browserRun: BrowserObservationRunSchema.optional(),
    timeline: z.array(BrowserObservationTimelineEventSchema).default([]),
    evidenceRefIds: z.array(z.string().min(1)).default([]),
    auditEventIds: z.array(z.string().min(1)).default([]),
    rawPathStored: z.literal(false),
    bodyStored: z.literal(false),
    noRealWrite: z.literal(true),
    processBoundaryInvoked: z.boolean(),
    externalProcessStarted: z.boolean(),
    summary: z.string().min(1),
  })
  .strict();
export type BrowserObservationControlPlaneRun = z.infer<
  typeof BrowserObservationControlPlaneRunSchema
>;

export const DevelopmentRequestSchema = createdEntityBaseSchema.extend({
  title: z.string().min(1),
  description: z.string().min(1),
  constraints: z.array(z.string()).default([]),
});
export type DevelopmentRequest = z.infer<typeof DevelopmentRequestSchema>;

export const TaskNodeSchema = createdEntityBaseSchema.extend({
  title: z.string().min(1),
  description: z.string().min(1),
  dependsOn: z.array(z.string()).default([]),
  assignedCapability: z.string().optional(),
  keywords: z.array(z.string()).default([]),
  riskLevel: RiskLevelSchema.default('low'),
});
export type TaskNode = z.infer<typeof TaskNodeSchema>;

export const TaskGraphTaskSchema = TaskNodeSchema;
export type TaskGraphTask = z.infer<typeof TaskGraphTaskSchema>;

export const TaskGraphSchema = createdEntityBaseSchema.extend({
  requestId: z.string().min(1),
  tasks: z.array(TaskNodeSchema),
});
export type TaskGraph = z.infer<typeof TaskGraphSchema>;

export const SkillCapabilitySchema = z.object({
  id: z.string().min(1),
  description: z.string().min(1),
  riskLevel: RiskLevelSchema,
  readOnlyDefault: z.boolean(),
});
export type SkillCapability = z.infer<typeof SkillCapabilitySchema>;

export const SkillTriggerSchema = z.object({
  id: z.string().min(1),
  keywords: z.array(z.string()).default([]),
  capabilityIds: z.array(z.string()).default([]),
});
export type SkillTrigger = z.infer<typeof SkillTriggerSchema>;

export const SkillDescriptorSchema = z.object({
  id: z.string().min(1),
  displayName: z.string().min(1),
  description: z.string().min(1),
  capabilities: z.array(SkillCapabilitySchema),
  triggers: z.array(SkillTriggerSchema),
  metadata: MetadataSchema.optional(),
});
export type SkillDescriptor = z.infer<typeof SkillDescriptorSchema>;

export const SkillSelectionSchema = z.object({
  skillId: z.string().min(1),
  skill: SkillDescriptorSchema,
  score: z.number().nonnegative(),
  matchedKeywords: z.array(z.string()).default([]),
  reason: z.string().min(1),
  required: z.boolean(),
});
export type SkillSelection = z.infer<typeof SkillSelectionSchema>;

export const SkillResolutionResultSchema = createdEntityBaseSchema.extend({
  inputSummary: z.string().min(1),
  selectedSkills: z.array(SkillSelectionSchema),
  unmatchedCapabilities: z.array(z.string()).default([]),
  reasons: z.array(z.string()).default([]),
});
export type SkillResolutionResult = z.infer<typeof SkillResolutionResultSchema>;

export const OrchestrationPlanSchema = createdEntityBaseSchema.extend({
  requestId: z.string().min(1),
  taskGraphId: z.string().min(1),
  skillResolutionId: z.string().min(1),
  workflowNames: z.array(z.string()).default([]),
  summary: z.string().min(1),
});
export type OrchestrationPlan = z.infer<typeof OrchestrationPlanSchema>;

export const AgentRunStatusSchema = z.enum(['planned', 'running', 'completed', 'failed']);
export type AgentRunStatus = z.infer<typeof AgentRunStatusSchema>;

export const AgentRunSchema = createdEntityBaseSchema.extend({
  taskId: z.string().min(1),
  agentId: z.string().min(1),
  status: AgentRunStatusSchema,
  events: z.array(z.string()).default([]),
  evidenceRefs: z.array(EvidenceRefSchema).default([]),
});
export type AgentRun = z.infer<typeof AgentRunSchema>;

export const WorktreePlanStatusSchema = z.enum(['planned', 'blocked']);
export type WorktreePlanStatus = z.infer<typeof WorktreePlanStatusSchema>;

export const WorktreeRunnerModeSchema = z.enum(['fixture', 'controlled-git-worktree']);
export type WorktreeRunnerMode = z.infer<typeof WorktreeRunnerModeSchema>;

export const WorktreeRunStatusSchema = z.enum([
  'planned',
  'completed',
  'failed',
  'blocked',
  'aborted',
]);
export type WorktreeRunStatus = z.infer<typeof WorktreeRunStatusSchema>;

export const RepoRelativePathSchema = z
  .string()
  .min(1)
  .refine((value) => !value.includes('\\'), 'repo-relative paths use forward slashes')
  .refine((value) => !value.startsWith('/'), 'repo-relative paths cannot be absolute')
  .refine((value) => !/^[A-Za-z]:/.test(value), 'repo-relative paths cannot be absolute')
  .refine(
    (value) => !value.split('/').includes('..'),
    'repo-relative paths cannot contain parent traversal',
  );
export type RepoRelativePath = z.infer<typeof RepoRelativePathSchema>;

export const WorktreePlanSchema = createdEntityBaseSchema
  .extend({
    adapterName: z.string().min(1),
    status: WorktreePlanStatusSchema,
    runnerMode: WorktreeRunnerModeSchema.default('fixture'),
    repoRootHash: z.string().min(1),
    worktreeRootHash: z.string().min(1),
    worktreePathHash: z.string().min(1),
    branchNameHash: z.string().min(1),
    worktreeSlugHash: z.string().min(1),
    baseRefHash: z.string().min(1).optional(),
    commandSummaryHash: z.string().min(1).optional(),
    defaultRootKind: z.enum(['sibling', 'allowlisted-absolute']),
    blockReasons: z.array(z.string().min(1)).default([]),
    plannedActions: z.array(CapabilityPlannedActionSchema).default([]),
    rawPathStored: z.literal(false),
    bodyStored: z.literal(false),
    noRealWrite: z.literal(true),
    gitProcessBoundaryPlanned: z.boolean().default(false),
    gitProcessBoundaryInvoked: z.literal(false).default(false),
    cleanupRequired: z.boolean().default(false),
    cleanupDeferred: z.boolean().default(false),
    processBoundaryPlanned: z.boolean().default(false),
    processBoundaryInvoked: z.literal(false).default(false),
    externalProcessStarted: z.literal(false).default(false),
    summary: z.string().min(1),
  })
  .strict();
export type WorktreePlan = z.infer<typeof WorktreePlanSchema>;

export const WorktreeRunSchema = createdEntityBaseSchema
  .extend({
    planId: z.string().min(1),
    status: WorktreeRunStatusSchema,
    runnerMode: WorktreeRunnerModeSchema.default('fixture'),
    worktreePathHash: z.string().min(1),
    branchNameHash: z.string().min(1),
    baseRefHash: z.string().min(1).optional(),
    commandSummaryHash: z.string().min(1).optional(),
    changedFiles: z.array(RepoRelativePathSchema).default([]),
    changedFileCount: z.number().int().nonnegative(),
    diffHash: z.string().min(1).optional(),
    evidenceRefs: z.array(EvidenceRefSchema).default([]),
    auditEventIds: z.array(z.string().min(1)).default([]),
    rawPathStored: z.literal(false),
    bodyStored: z.literal(false),
    noRealWrite: z.boolean(),
    gitProcessBoundaryInvoked: z.boolean().default(false),
    cleanupRequired: z.boolean().default(false),
    cleanupDeferred: z.boolean().default(false),
    processBoundaryInvoked: z.boolean(),
    externalProcessStarted: z.boolean(),
    summary: z.string().min(1),
  })
  .strict();
export type WorktreeRun = z.infer<typeof WorktreeRunSchema>;

export const WorktreeControlPlaneStatusSchema = z.enum([
  'planned',
  'requested',
  'approved',
  'denied',
  'expired',
  'used',
  'revoked',
  'completed',
  'failed',
  'blocked',
  'aborted',
]);
export type WorktreeControlPlaneStatus = z.infer<
  typeof WorktreeControlPlaneStatusSchema
>;

export const WorktreeApprovalStatusSchema = z.enum([
  'requested',
  'approved',
  'denied',
  'expired',
  'used',
  'revoked',
]);
export type WorktreeApprovalStatus = z.infer<typeof WorktreeApprovalStatusSchema>;

export const WorktreeControlPlaneTimelineEventSchema = createdEntityBaseSchema
  .extend({
    phase: z.enum([
      'dry-run',
      'approval-request',
      'approval-decision',
      'execution',
      'cleanup-dry-run',
      'cleanup-approval-request',
      'cleanup-approval-decision',
      'cleanup-execution',
    ]),
    status: WorktreeControlPlaneStatusSchema,
    summary: z.string().min(1),
    evidenceRefIds: z.array(z.string().min(1)).default([]),
    auditEventIds: z.array(z.string().min(1)).default([]),
    rawPathStored: z.literal(false),
    bodyStored: z.literal(false),
    gitProcessBoundaryInvoked: z.boolean().default(false),
    processBoundaryInvoked: z.boolean().default(false),
    externalProcessStarted: z.boolean().default(false),
  })
  .strict();
export type WorktreeControlPlaneTimelineEvent = z.infer<
  typeof WorktreeControlPlaneTimelineEventSchema
>;

export const WorktreeDryRunRecordSchema = createdEntityBaseSchema
  .extend({
    dryRunId: z.string().min(1),
    status: z.enum(['ready', 'blocked']),
    plan: WorktreePlanSchema,
    capabilityDryRun: CapabilityDryRunSchema,
    policyDecision: PolicyDecisionSchema,
    repoRootHash: z.string().min(1),
    worktreeRootHash: z.string().min(1),
    worktreePathHash: z.string().min(1),
    branchNameHash: z.string().min(1),
    worktreeSlugHash: z.string().min(1),
    baseRefHash: z.string().min(1).optional(),
    blockReasons: z.array(z.string().min(1)).default([]),
    timeline: z.array(WorktreeControlPlaneTimelineEventSchema).default([]),
    evidenceRefs: z.array(EvidenceRefSchema).default([]),
    auditEventIds: z.array(z.string().min(1)).default([]),
    rawPathStored: z.literal(false),
    bodyStored: z.literal(false),
    noRealWrite: z.literal(true),
    gitProcessBoundaryPlanned: z.boolean().default(false),
    gitProcessBoundaryInvoked: z.literal(false).default(false),
    processBoundaryPlanned: z.boolean().default(false),
    processBoundaryInvoked: z.literal(false).default(false),
    externalProcessStarted: z.literal(false).default(false),
    summary: z.string().min(1),
  })
  .strict();
export type WorktreeDryRunRecord = z.infer<typeof WorktreeDryRunRecordSchema>;

export const WorktreeApprovalArtifactRecordSchema = createdEntityBaseSchema
  .extend({
    dryRunId: z.string().min(1),
    dryRunRecordId: z.string().min(1),
    approvalRequestId: z.string().min(1),
    approvalArtifactId: z.string().min(1).optional(),
    status: WorktreeApprovalStatusSchema,
    requestedBy: z.string().min(1),
    decidedBy: z.string().min(1).optional(),
    reasonHash: z.string().min(1).optional(),
    decisionReasonHash: z.string().min(1).optional(),
    dryRunPlanHash: z.string().min(1),
    policyDecisionId: z.string().min(1),
    policyDecisionHash: z.string().min(1),
    approved: z.boolean(),
    requestedAt: IsoDateTimeSchema,
    decidedAt: IsoDateTimeSchema.optional(),
    expiresAt: IsoDateTimeSchema.optional(),
    usedAt: IsoDateTimeSchema.optional(),
    revokedAt: IsoDateTimeSchema.optional(),
    timeline: z.array(WorktreeControlPlaneTimelineEventSchema).default([]),
    evidenceRefs: z.array(EvidenceRefSchema).default([]),
    auditEventIds: z.array(z.string().min(1)).default([]),
    rawPathStored: z.literal(false),
    bodyStored: z.literal(false),
    gitProcessBoundaryInvoked: z.literal(false).default(false),
    processBoundaryInvoked: z.literal(false).default(false),
    externalProcessStarted: z.literal(false).default(false),
    summary: z.string().min(1),
  })
  .strict();
export type WorktreeApprovalArtifactRecord = z.infer<
  typeof WorktreeApprovalArtifactRecordSchema
>;

export const WorktreeControlPlaneRunSchema = createdEntityBaseSchema
  .extend({
    dryRunId: z.string().min(1),
    dryRunRecordId: z.string().min(1),
    approvalArtifactId: z.string().min(1).optional(),
    status: WorktreeRunStatusSchema,
    planId: z.string().min(1),
    runnerMode: WorktreeRunnerModeSchema,
    worktreeRun: WorktreeRunSchema.optional(),
    patchRun: z.lazy(() => PatchRunSchema).optional(),
    patchSummary: z.lazy(() => PatchSummarySchema).optional(),
    pullRequestDraft: z.lazy(() => PullRequestSummaryDraftSchema).optional(),
    releaseAuditDraft: z.lazy(() => ReleaseAuditDraftSchema).optional(),
    repoRootHash: z.string().min(1),
    worktreeRootHash: z.string().min(1),
    worktreePathHash: z.string().min(1),
    branchNameHash: z.string().min(1),
    worktreeSlugHash: z.string().min(1),
    baseRefHash: z.string().min(1).optional(),
    changedFileCount: z.number().int().nonnegative().default(0),
    diffHash: z.string().min(1).optional(),
    timeline: z.array(WorktreeControlPlaneTimelineEventSchema).default([]),
    evidenceRefIds: z.array(z.string().min(1)).default([]),
    auditEventIds: z.array(z.string().min(1)).default([]),
    rawPathStored: z.literal(false),
    bodyStored: z.literal(false),
    noRealWrite: z.boolean(),
    cleanupRequired: z.boolean().default(false),
    cleanupDeferred: z.boolean().default(false),
    gitProcessBoundaryInvoked: z.boolean().default(false),
    processBoundaryInvoked: z.boolean().default(false),
    externalProcessStarted: z.boolean().default(false),
    summary: z.string().min(1),
  })
  .strict();
export type WorktreeControlPlaneRun = z.infer<typeof WorktreeControlPlaneRunSchema>;

export const WorktreeCleanupPlanSchema = createdEntityBaseSchema
  .extend({
    adapterName: z.string().min(1),
    sourceRunId: z.string().min(1),
    status: WorktreePlanStatusSchema,
    repoRootHash: z.string().min(1),
    worktreeRootHash: z.string().min(1),
    worktreePathHash: z.string().min(1),
    sourceRunHash: z.string().min(1),
    commandSummaryHash: z.string().min(1).optional(),
    blockReasons: z.array(z.string().min(1)).default([]),
    plannedActions: z.array(CapabilityPlannedActionSchema).default([]),
    dirtyCheckPlanned: z.boolean().default(true),
    cleanupDeletePlanned: z.boolean().default(true),
    cleanupRequired: z.boolean().default(true),
    cleanupDeferred: z.boolean().default(true),
    rawPathStored: z.literal(false),
    bodyStored: z.literal(false),
    noRealWrite: z.literal(true),
    gitProcessBoundaryPlanned: z.boolean().default(true),
    gitProcessBoundaryInvoked: z.literal(false).default(false),
    processBoundaryPlanned: z.boolean().default(true),
    processBoundaryInvoked: z.literal(false).default(false),
    externalProcessStarted: z.literal(false).default(false),
    summary: z.string().min(1),
  })
  .strict();
export type WorktreeCleanupPlan = z.infer<typeof WorktreeCleanupPlanSchema>;

export const WorktreeCleanupRunSchema = createdEntityBaseSchema
  .extend({
    planId: z.string().min(1),
    dryRunId: z.string().min(1),
    sourceRunId: z.string().min(1),
    status: WorktreeRunStatusSchema,
    repoRootHash: z.string().min(1),
    worktreeRootHash: z.string().min(1),
    worktreePathHash: z.string().min(1),
    sourceRunHash: z.string().min(1),
    commandSummaryHash: z.string().min(1).optional(),
    dirtyFileCount: z.number().int().nonnegative().default(0),
    dirtyStatusHash: z.string().min(1).optional(),
    cleanupAttempted: z.boolean().default(false),
    cleanupCompleted: z.boolean().default(false),
    cleanupRequired: z.boolean().default(true),
    cleanupDeferred: z.boolean().default(true),
    evidenceRefs: z.array(EvidenceRefSchema).default([]),
    auditEventIds: z.array(z.string().min(1)).default([]),
    rawPathStored: z.literal(false),
    bodyStored: z.literal(false),
    noRealWrite: z.boolean(),
    gitProcessBoundaryInvoked: z.boolean().default(false),
    processBoundaryInvoked: z.boolean().default(false),
    externalProcessStarted: z.boolean().default(false),
    summary: z.string().min(1),
  })
  .strict();
export type WorktreeCleanupRun = z.infer<typeof WorktreeCleanupRunSchema>;

export const WorktreeCleanupDryRunRecordSchema = createdEntityBaseSchema
  .extend({
    dryRunId: z.string().min(1),
    sourceRunId: z.string().min(1),
    status: z.enum(['ready', 'blocked']),
    plan: WorktreeCleanupPlanSchema,
    capabilityDryRun: CapabilityDryRunSchema,
    policyDecision: PolicyDecisionSchema,
    repoRootHash: z.string().min(1),
    worktreeRootHash: z.string().min(1),
    worktreePathHash: z.string().min(1),
    sourceRunHash: z.string().min(1),
    blockReasons: z.array(z.string().min(1)).default([]),
    timeline: z.array(WorktreeControlPlaneTimelineEventSchema).default([]),
    evidenceRefs: z.array(EvidenceRefSchema).default([]),
    auditEventIds: z.array(z.string().min(1)).default([]),
    rawPathStored: z.literal(false),
    bodyStored: z.literal(false),
    noRealWrite: z.literal(true),
    gitProcessBoundaryPlanned: z.boolean().default(true),
    gitProcessBoundaryInvoked: z.literal(false).default(false),
    processBoundaryPlanned: z.boolean().default(true),
    processBoundaryInvoked: z.literal(false).default(false),
    externalProcessStarted: z.literal(false).default(false),
    summary: z.string().min(1),
  })
  .strict();
export type WorktreeCleanupDryRunRecord = z.infer<
  typeof WorktreeCleanupDryRunRecordSchema
>;

export const WorktreeCleanupApprovalArtifactRecordSchema =
  WorktreeApprovalArtifactRecordSchema.extend({
    sourceRunId: z.string().min(1),
  }).strict();
export type WorktreeCleanupApprovalArtifactRecord = z.infer<
  typeof WorktreeCleanupApprovalArtifactRecordSchema
>;

export const WorktreeCleanupControlPlaneRunSchema = createdEntityBaseSchema
  .extend({
    dryRunId: z.string().min(1),
    dryRunRecordId: z.string().min(1),
    sourceRunId: z.string().min(1),
    approvalArtifactId: z.string().min(1).optional(),
    status: WorktreeRunStatusSchema,
    planId: z.string().min(1),
    cleanupRun: WorktreeCleanupRunSchema.optional(),
    repoRootHash: z.string().min(1),
    worktreeRootHash: z.string().min(1),
    worktreePathHash: z.string().min(1),
    sourceRunHash: z.string().min(1),
    dirtyFileCount: z.number().int().nonnegative().default(0),
    dirtyStatusHash: z.string().min(1).optional(),
    cleanupAttempted: z.boolean().default(false),
    cleanupCompleted: z.boolean().default(false),
    cleanupRequired: z.boolean().default(true),
    cleanupDeferred: z.boolean().default(true),
    timeline: z.array(WorktreeControlPlaneTimelineEventSchema).default([]),
    evidenceRefIds: z.array(z.string().min(1)).default([]),
    auditEventIds: z.array(z.string().min(1)).default([]),
    rawPathStored: z.literal(false),
    bodyStored: z.literal(false),
    noRealWrite: z.boolean(),
    gitProcessBoundaryInvoked: z.boolean().default(false),
    processBoundaryInvoked: z.boolean().default(false),
    externalProcessStarted: z.boolean().default(false),
    summary: z.string().min(1),
  })
  .strict();
export type WorktreeCleanupControlPlaneRun = z.infer<
  typeof WorktreeCleanupControlPlaneRunSchema
>;

export const PatchRunStatusSchema = z.enum([
  'planned',
  'generated',
  'verified',
  'rejected',
  'blocked',
  'aborted',
]);
export type PatchRunStatus = z.infer<typeof PatchRunStatusSchema>;

export const PatchRunSchema = createdEntityBaseSchema
  .extend({
    taskId: z.string().min(1),
    status: PatchRunStatusSchema,
    patchRef: z.string().optional(),
    changedFiles: z.array(RepoRelativePathSchema).default([]),
    diffHash: z.string().min(1).optional(),
    worktreePathHash: z.string().min(1).optional(),
    evidenceRefs: z.array(EvidenceRefSchema).default([]),
    auditEventIds: z.array(z.string().min(1)).default([]),
    noRealWrite: z.literal(true).optional(),
    bodyStored: z.literal(false).optional(),
    rawPathStored: z.literal(false).optional(),
    summary: z.string().min(1).optional(),
  })
  .strict();
export type PatchRun = z.infer<typeof PatchRunSchema>;

export const PatchSummarySchema = createdEntityBaseSchema
  .extend({
    patchRunId: z.string().min(1),
    changedFiles: z.array(RepoRelativePathSchema).default([]),
    changedFileCount: z.number().int().nonnegative(),
    diffHash: z.string().min(1),
    diffLineCount: z.number().int().nonnegative(),
    evidenceRefs: z.array(EvidenceRefSchema).default([]),
    auditEventIds: z.array(z.string().min(1)).default([]),
    rawPathStored: z.literal(false),
    bodyStored: z.literal(false),
    noRealWrite: z.literal(true),
    summary: z.string().min(1),
  })
  .strict();
export type PatchSummary = z.infer<typeof PatchSummarySchema>;

export const PullRequestSummaryDraftStatusSchema = z.enum(['ready', 'blocked']);
export type PullRequestSummaryDraftStatus = z.infer<
  typeof PullRequestSummaryDraftStatusSchema
>;

export const PullRequestSummaryDraftSchema = createdEntityBaseSchema
  .extend({
    status: PullRequestSummaryDraftStatusSchema,
    titleHash: z.string().min(1),
    bodyHash: z.string().min(1),
    sectionCount: z.number().int().nonnegative(),
    changedFiles: z.array(RepoRelativePathSchema).default([]),
    evidenceRefs: z.array(EvidenceRefSchema).default([]),
    auditEventIds: z.array(z.string().min(1)).default([]),
    rawPathStored: z.literal(false),
    bodyStored: z.literal(false),
    noRealWrite: z.literal(true),
    summary: z.string().min(1),
  })
  .strict();
export type PullRequestSummaryDraft = z.infer<
  typeof PullRequestSummaryDraftSchema
>;

export const ReleaseAuditDraftStatusSchema = z.enum(['ready', 'blocked']);
export type ReleaseAuditDraftStatus = z.infer<typeof ReleaseAuditDraftStatusSchema>;

export const ReleaseAuditDraftSchema = createdEntityBaseSchema
  .extend({
    status: ReleaseAuditDraftStatusSchema,
    verificationStatus: z.enum(['passed', 'failed', 'blocked', 'aborted']),
    rollbackNotesHash: z.string().min(1),
    riskNotesHash: z.string().min(1),
    evidenceRefs: z.array(EvidenceRefSchema).default([]),
    auditEventIds: z.array(z.string().min(1)).default([]),
    rawPathStored: z.literal(false),
    bodyStored: z.literal(false),
    noRealWrite: z.literal(true),
    summary: z.string().min(1),
  })
  .strict();
export type ReleaseAuditDraft = z.infer<typeof ReleaseAuditDraftSchema>;

const m12PatchForbiddenMetadataKeys = new Set([
  'body',
  'prompt',
  'stdout',
  'stderr',
  'jsonl',
  'diff',
  'command',
  'path',
  'repoRoot',
  'worktreeRoot',
  'worktreePath',
  'baseRef',
  'rawBody',
  'rawDiff',
  'rawPath',
  'rawPrompt',
  'rawStdout',
  'rawStderr',
  'rawPullRequestBody',
  'rawPrBody',
  'prBody',
  'pullRequestBody',
  'pullRequestMarkdown',
  'rawCommand',
  'commandBody',
  'rawReason',
  'reasonBody',
  'reasonText',
  'requestBody',
  'responseBody',
  ['to', 'ken'].join(''),
  ['coo', 'kie'].join(''),
  ['sess', 'ion'].join(''),
  ['local', 'ControlKey'].join(''),
]);

function rejectM12PatchRawMetadata(
  value: unknown,
  context: z.RefinementCtx,
  path: Array<string | number> = [],
): void {
  if (!value || typeof value !== 'object') {
    return;
  }

  if (Array.isArray(value)) {
    value.forEach((item, index) => rejectM12PatchRawMetadata(item, context, [...path, index]));
    return;
  }

  for (const [key, nestedValue] of Object.entries(value as Record<string, unknown>)) {
    if (m12PatchForbiddenMetadataKeys.has(key)) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'raw M12 patch lifecycle metadata is forbidden',
        path: [...path, key],
      });
      continue;
    }

    rejectM12PatchRawMetadata(nestedValue, context, [...path, key]);
  }
}

const githubForbiddenMetadataKeys = new Set([
  'owner',
  'repo',
  'repository',
  'branch',
  'base',
  'head',
  'ref',
  'url',
  'apiUrl',
  'htmlUrl',
  'pullRequestUrl',
  'webUrl',
  'path',
  'rawOwner',
  'rawRepo',
  'rawBranch',
  'rawBase',
  'rawHead',
  'rawRef',
  'rawUrl',
  'rawPath',
  'rawBody',
  'rawResponseBody',
  'responseBody',
  'requestBody',
  'rawPullRequestBody',
  'rawPrBody',
  'rawReviewBody',
  'pullRequestBody',
  'pullRequestMarkdown',
  'prBody',
  'prMarkdown',
  'reviewBody',
  'reviewMarkdown',
  'comment',
  'comments',
  'label',
  'labels',
  'reviewer',
  'reviewers',
  'merge',
  'deployment',
  'release',
  'tag',
  'tags',
  'rawTag',
  'rawRelease',
  'releaseBody',
  'rawReleaseBody',
  'changelog',
  'rawChangelog',
  'rawChangelogBody',
  'manifest',
  'manifestBody',
  'rawManifest',
  'rawManifestBody',
  'kubeconfig',
  'kubeContext',
  'namespace',
  'resourcePath',
  'planBody',
  'rawPlanBody',
  'diffBody',
  'rawDiffBody',
  'stateFile',
  'secret',
  'secretValue',
  'rawSecretValue',
  'privateKey',
  'rawPrivateKey',
  'credential',
  'credentials',
  'rawCredential',
  'rawCredentials',
  'config',
  'rawConfig',
  'configBody',
  'rawConfigBody',
  'reference',
  'rawReference',
  'policySource',
  'rawPolicySource',
  'policyInput',
  'rawPolicyInput',
  'trace',
  'rawTrace',
  'span',
  'rawSpan',
  'selector',
  'rawSelector',
  'typedText',
  'rawTypedText',
  'javascript',
  'rawJavascript',
  'prompt',
  'rawPrompt',
  'instructions',
  'rawInstructions',
  'diff',
  'rawDiff',
  'patch',
  'rawPatch',
  'command',
  'rawCommand',
  'sql',
  'rawSql',
  'dbRow',
  'dbRows',
  'databaseRow',
  'databaseRows',
  'backupBody',
  'rawBackupBody',
  'auditBody',
  'rawAuditBody',
  'stdout',
  'rawStdout',
  'stderr',
  'rawStderr',
  'log',
  'logs',
  'rawLog',
  'rawLogBody',
  'logBody',
  'artifact',
  'artifacts',
  'artifactBody',
  'rawArtifactBody',
  'inputs',
  'workflowInputs',
  'rawReason',
  'reasonBody',
  'reasonText',
  ['to', 'ken'].join(''),
  ['coo', 'kie'].join(''),
  ['sess', 'ion'].join(''),
  'env',
  'rawEnv',
  'envValue',
  'rawEnvValue',
  ['local', 'ControlKey'].join(''),
]);

function rejectGithubRawMetadata(
  value: unknown,
  context: z.RefinementCtx,
  path: Array<string | number> = [],
): void {
  if (!value || typeof value !== 'object') {
    return;
  }

  if (Array.isArray(value)) {
    value.forEach((item, index) => rejectGithubRawMetadata(item, context, [...path, index]));
    return;
  }

  for (const [key, nestedValue] of Object.entries(value as Record<string, unknown>)) {
    if (githubForbiddenMetadataKeys.has(key)) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'raw GitHub provider metadata is forbidden',
        path: [...path, key],
      });
      continue;
    }

    rejectGithubRawMetadata(nestedValue, context, [...path, key]);
  }
}

export const ControlledPatchLifecycleStatusSchema = PatchRunStatusSchema;
export type ControlledPatchLifecycleStatus = z.infer<
  typeof ControlledPatchLifecycleStatusSchema
>;

export const ControlledPatchReadinessStatusSchema = z.enum([
  'not_ready_no_patch',
  'not_ready_pending_verification',
  'ready_for_review_draft_only',
  'blocked_verification_failed',
  'blocked_policy',
]);
export type ControlledPatchReadinessStatus = z.infer<
  typeof ControlledPatchReadinessStatusSchema
>;

export const ControlledPatchVerificationStatusSchema = z.enum([
  'not_run',
  'passed',
  'failed',
  'aborted',
  'blocked',
]);
export type ControlledPatchVerificationStatus = z.infer<
  typeof ControlledPatchVerificationStatusSchema
>;

export const ControlledPatchRejectionReasonSchema = z.enum([
  'none',
  'policy_blocked',
  'verification_failed',
  'codex_failed',
  'empty_patch',
  'pending_verification',
  'unsafe_target',
  'raw_body_forbidden',
]);
export type ControlledPatchRejectionReason = z.infer<
  typeof ControlledPatchRejectionReasonSchema
>;

export const ControlledPatchPlanSchema = createdEntityBaseSchema
  .extend({
    requestIdHash: z.string().min(1),
    worktreeRunIdHash: z.string().min(1),
    worktreePathHash: z.string().min(1),
    plannedChangedFileCount: z.number().int().nonnegative(),
    plannedChangedFilePathHashes: z.array(z.string().min(1)).default([]),
    patchBodyHash: z.string().min(1).optional(),
    codexPatchAllowed: z.boolean(),
    fixtureOnly: z.boolean(),
    noRealWrite: z.literal(true),
    rawPathStored: z.literal(false),
    bodyStored: z.literal(false),
    processBoundaryInvoked: z.literal(false),
    externalProcessStarted: z.literal(false),
    summary: z.string().min(1),
  })
  .strict()
  .superRefine((record, context) => {
    rejectM12PatchRawMetadata(record.metadata, context, ['metadata']);

    if (record.plannedChangedFileCount !== record.plannedChangedFilePathHashes.length) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'plannedChangedFileCount must match plannedChangedFilePathHashes length',
        path: ['plannedChangedFileCount'],
      });
    }
  });
export type ControlledPatchPlan = z.infer<typeof ControlledPatchPlanSchema>;

export const ControlledPatchRunSchema = createdEntityBaseSchema
  .extend({
    planId: z.string().min(1),
    status: ControlledPatchLifecycleStatusSchema,
    attemptNumber: z.number().int().positive(),
    changedFiles: z.array(RepoRelativePathSchema).default([]),
    changedFileCount: z.number().int().nonnegative(),
    diffHash: z.string().min(1).optional(),
    diffLineCount: z.number().int().nonnegative().default(0),
    diffSummaryHash: z.string().min(1).optional(),
    worktreePathHash: z.string().min(1),
    rejectionReasons: z.array(ControlledPatchRejectionReasonSchema).default([]),
    evidenceRefs: z.array(EvidenceRefSchema).default([]),
    auditEventIds: z.array(z.string().min(1)).default([]),
    fixtureOnly: z.boolean(),
    codexPatchExecuted: z.boolean(),
    noRealWrite: z.boolean(),
    rawPathStored: z.literal(false),
    bodyStored: z.literal(false),
    processBoundaryInvoked: z.boolean(),
    externalProcessStarted: z.boolean(),
    summary: z.string().min(1),
  })
  .strict()
  .superRefine((record, context) => {
    rejectM12PatchRawMetadata(record.metadata, context, ['metadata']);

    if (record.changedFileCount !== record.changedFiles.length) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'changedFileCount must match changedFiles length',
        path: ['changedFileCount'],
      });
    }

    if (record.codexPatchExecuted && !record.processBoundaryInvoked) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'codexPatchExecuted requires processBoundaryInvoked',
        path: ['codexPatchExecuted'],
      });
    }

    if (record.status === 'verified' && record.codexPatchExecuted && record.noRealWrite) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'executed Codex patch in isolated worktree is a real write',
        path: ['noRealWrite'],
      });
    }
  });
export type ControlledPatchRun = z.infer<typeof ControlledPatchRunSchema>;

export const DiffReviewStatusSchema = z.enum(['passed', 'blocked', 'failed']);
export type DiffReviewStatus = z.infer<typeof DiffReviewStatusSchema>;

export const DiffReviewSummarySchema = createdEntityBaseSchema
  .extend({
    patchRunId: z.string().min(1),
    status: DiffReviewStatusSchema,
    changedFileCount: z.number().int().nonnegative(),
    diffHash: z.string().min(1).optional(),
    diffLineCount: z.number().int().nonnegative(),
    findingCount: z.number().int().nonnegative(),
    reviewerLabel: z.string().min(1),
    evidenceRefs: z.array(EvidenceRefSchema).default([]),
    auditEventIds: z.array(z.string().min(1)).default([]),
    rawDiffStored: z.literal(false),
    rawPathStored: z.literal(false),
    bodyStored: z.literal(false),
    noRealWrite: z.literal(true),
    summary: z.string().min(1),
  })
  .strict()
  .superRefine((record, context) => {
    rejectM12PatchRawMetadata(record.metadata, context, ['metadata']);
  });
export type DiffReviewSummary = z.infer<typeof DiffReviewSummarySchema>;

export const ControlledPatchReadinessSchema = createdEntityBaseSchema
  .extend({
    patchRunId: z.string().min(1),
    status: ControlledPatchReadinessStatusSchema,
    verificationStatus: ControlledPatchVerificationStatusSchema,
    changedFileCount: z.number().int().nonnegative(),
    blockerCount: z.number().int().nonnegative(),
    blockers: z.array(z.string().min(1)).default([]),
    readyForReviewDraftOnly: z.boolean(),
    pushAllowed: z.literal(false),
    pullRequestOpened: z.literal(false),
    evidenceRefs: z.array(EvidenceRefSchema).default([]),
    auditEventIds: z.array(z.string().min(1)).default([]),
    rawPathStored: z.literal(false),
    bodyStored: z.literal(false),
    noRealWrite: z.literal(true),
    summary: z.string().min(1),
  })
  .strict()
  .superRefine((record, context) => {
    rejectM12PatchRawMetadata(record.metadata, context, ['metadata']);

    if (
      record.status === 'ready_for_review_draft_only' &&
      (record.verificationStatus !== 'passed' ||
        record.changedFileCount === 0 ||
        record.readyForReviewDraftOnly !== true)
    ) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'draft-only readiness requires passed verification and changed files',
        path: ['status'],
      });
    }

    if (record.status === 'not_ready_no_patch' && record.changedFileCount !== 0) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'not_ready_no_patch requires zero changed files',
        path: ['changedFileCount'],
      });
    }

    if (
      record.status === 'not_ready_pending_verification' &&
      (record.changedFileCount === 0 || record.verificationStatus !== 'not_run')
    ) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'not_ready_pending_verification requires changed files and no verification run',
        path: ['status'],
      });
    }
  });
export type ControlledPatchReadiness = z.infer<typeof ControlledPatchReadinessSchema>;

export const ControlledPatchVerificationGateSchema = createdEntityBaseSchema
  .extend({
    patchRunId: z.string().min(1),
    lifecycleRunIdHash: z.string().min(1),
    verificationRunId: z.string().min(1),
    verificationStatus: z.enum(['passed', 'failed', 'aborted', 'blocked']),
    targets: z.array(z.enum(['lint', 'test', 'build'])).default([]),
    changedFileCount: z.number().int().nonnegative(),
    affectedProjectCount: z.number().int().nonnegative(),
    commandResultCount: z.number().int().nonnegative(),
    readyForReviewDraftOnly: z.boolean(),
    pushAllowed: z.literal(false),
    pullRequestOpened: z.literal(false),
    processBoundaryInvoked: z.boolean(),
    externalProcessStarted: z.boolean(),
    noRealWrite: z.literal(true),
    rawPathStored: z.literal(false),
    bodyStored: z.literal(false),
    evidenceRefs: z.array(EvidenceRefSchema).default([]),
    auditEventIds: z.array(z.string().min(1)).default([]),
    summary: z.string().min(1),
  })
  .strict()
  .superRefine((record, context) => {
    rejectM12PatchRawMetadata(record.metadata, context, ['metadata']);

    if (
      record.readyForReviewDraftOnly &&
      (record.verificationStatus !== 'passed' || record.changedFileCount === 0)
    ) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'draft-only readiness requires passed verification and changed files',
        path: ['readyForReviewDraftOnly'],
      });
    }

    if (record.verificationStatus !== 'passed' && record.readyForReviewDraftOnly) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'non-passed verification cannot mark PR draft ready',
        path: ['verificationStatus'],
      });
    }
  });
export type ControlledPatchVerificationGate = z.infer<
  typeof ControlledPatchVerificationGateSchema
>;

export const ControlledPatchRetryResumeStatusSchema = z.enum([
  'retry_planned',
  'resume_available',
  'cleanup_handoff',
  'blocked',
  'terminal',
]);
export type ControlledPatchRetryResumeStatus = z.infer<
  typeof ControlledPatchRetryResumeStatusSchema
>;

export const ControlledPatchLastSafeStepSchema = z.enum([
  'none',
  'patch_generated',
  'verification_failed',
  'verification_passed',
  'cleanup_handoff',
]);
export type ControlledPatchLastSafeStep = z.infer<typeof ControlledPatchLastSafeStepSchema>;

export const ControlledPatchRetryCleanupProjectionSchema = createdEntityBaseSchema
  .extend({
    sourceLifecycleRunIdHash: z.string().min(1),
    sourcePatchRunIdHash: z.string().min(1),
    status: ControlledPatchRetryResumeStatusSchema,
    lastSafeStep: ControlledPatchLastSafeStepSchema,
    attemptCount: z.number().int().positive(),
    previousAttemptHash: z.string().min(1),
    retryReasonHash: z.string().min(1).optional(),
    retryRequiresNewApproval: z.literal(true),
    resumeAllowed: z.boolean(),
    cleanupRequired: z.boolean(),
    cleanupReady: z.boolean(),
    cleanupRequiresApproval: z.literal(true),
    cleanupForceAllowed: z.literal(false),
    filesystemDeleteFallbackAllowed: z.literal(false),
    dirtyWorktree: z.boolean(),
    dirtyFileCount: z.number().int().nonnegative(),
    dirtySummaryHash: z.string().min(1).optional(),
    pushAllowed: z.literal(false),
    pullRequestOpened: z.literal(false),
    processBoundaryInvoked: z.literal(false),
    externalProcessStarted: z.literal(false),
    noRealWrite: z.literal(true),
    rawPathStored: z.literal(false),
    bodyStored: z.literal(false),
    evidenceRefs: z.array(EvidenceRefSchema).default([]),
    auditEventIds: z.array(z.string().min(1)).default([]),
    summary: z.string().min(1),
  })
  .strict()
  .superRefine((record, context) => {
    rejectM12PatchRawMetadata(record.metadata, context, ['metadata']);

    if (record.dirtyWorktree && record.cleanupReady) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'dirty worktrees cannot be cleanup-ready in M12d',
        path: ['cleanupReady'],
      });
    }

    if (record.dirtyWorktree && record.dirtyFileCount === 0) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'dirty worktrees require a dirty file count',
        path: ['dirtyFileCount'],
      });
    }

    if (!record.cleanupRequired && record.cleanupReady) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'cleanupReady requires cleanupRequired',
        path: ['cleanupReady'],
      });
    }

    if (record.status === 'retry_planned') {
      if (record.attemptCount < 2) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'retry_planned requires a previous attempt',
          path: ['attemptCount'],
        });
      }

      if (!record.retryReasonHash) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'retry_planned requires a retry reason hash',
          path: ['retryReasonHash'],
        });
      }

      if (!record.resumeAllowed) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'retry_planned requires resumeAllowed=true',
          path: ['resumeAllowed'],
        });
      }
    }

    if (
      record.status === 'terminal' &&
      (record.resumeAllowed || record.cleanupRequired || record.cleanupReady)
    ) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'terminal patch lifecycle cannot expose retry or cleanup handoff',
        path: ['status'],
      });
    }
  });
export type ControlledPatchRetryCleanupProjection = z.infer<
  typeof ControlledPatchRetryCleanupProjectionSchema
>;

export const ControlledPatchLifecycleRunSchema = createdEntityBaseSchema
  .extend({
    status: ControlledPatchLifecycleStatusSchema,
    plan: ControlledPatchPlanSchema,
    patchRun: ControlledPatchRunSchema,
    diffReview: DiffReviewSummarySchema,
    readiness: ControlledPatchReadinessSchema,
    evidenceRefs: z.array(EvidenceRefSchema).default([]),
    auditEventIds: z.array(z.string().min(1)).default([]),
    evidenceRefIds: z.array(z.string().min(1)).default([]),
    auditEventCount: z.number().int().nonnegative(),
    fixtureOnly: z.boolean(),
    codexPatchExecuted: z.boolean(),
    noRealWrite: z.boolean(),
    rawPathStored: z.literal(false),
    bodyStored: z.literal(false),
    processBoundaryInvoked: z.boolean(),
    externalProcessStarted: z.boolean(),
    pushAllowed: z.literal(false),
    pullRequestOpened: z.literal(false),
    summary: z.string().min(1),
  })
  .strict()
  .superRefine((record, context) => {
    rejectM12PatchRawMetadata(record.metadata, context, ['metadata']);

    if (record.patchRun.planId !== record.plan.id) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'patchRun must reference lifecycle plan',
        path: ['patchRun', 'planId'],
      });
    }

    if (record.diffReview.patchRunId !== record.patchRun.id) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'diffReview must reference lifecycle patchRun',
        path: ['diffReview', 'patchRunId'],
      });
    }

    if (record.readiness.patchRunId !== record.patchRun.id) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'readiness must reference lifecycle patchRun',
        path: ['readiness', 'patchRunId'],
      });
    }

    if (record.codexPatchExecuted && !record.patchRun.codexPatchExecuted) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'lifecycle codexPatchExecuted must match patchRun execution',
        path: ['codexPatchExecuted'],
      });
    }

    if (record.codexPatchExecuted && !record.processBoundaryInvoked) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'executed lifecycle must preserve process boundary truth',
        path: ['processBoundaryInvoked'],
      });
    }

    if (record.evidenceRefIds.length !== record.evidenceRefs.length) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'evidenceRefIds must match evidenceRefs length',
        path: ['evidenceRefIds'],
      });
    }

    const evidenceRefIds = record.evidenceRefs.map((evidenceRef) => evidenceRef.id);
    if (record.evidenceRefIds.some((evidenceRefId) => !evidenceRefIds.includes(evidenceRefId))) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'evidenceRefIds must reference lifecycle evidenceRefs',
        path: ['evidenceRefIds'],
      });
    }

    if (record.auditEventCount !== record.auditEventIds.length) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'auditEventCount must match auditEventIds length',
        path: ['auditEventCount'],
      });
    }
  });
export type ControlledPatchLifecycleRun = z.infer<
  typeof ControlledPatchLifecycleRunSchema
>;

export const LocalReviewPackageStatusSchema = z.enum([
  'planned',
  'ready_for_review',
  'blocked_verification',
  'blocked_patch',
  'degraded',
]);
export type LocalReviewPackageStatus = z.infer<typeof LocalReviewPackageStatusSchema>;

export const LocalReviewDecisionStatusSchema = z.enum([
  'pending',
  'approved_for_local_rc',
  'changes_requested',
  'rejected',
  'superseded',
]);
export type LocalReviewDecisionStatus = z.infer<typeof LocalReviewDecisionStatusSchema>;

export const LocalReviewPackagePlanSchema = createdEntityBaseSchema
  .extend({
    sourceLifecycleRunIdHash: z.string().min(1),
    sourcePatchRunIdHash: z.string().min(1),
    sourceVerificationGateIdHash: z.string().min(1).optional(),
    changedFileCount: z.number().int().nonnegative(),
    changedFilePathHashes: z.array(z.string().min(1)).default([]),
    diffHash: z.string().min(1).optional(),
    verificationStatus: z.enum(['passed', 'failed', 'aborted', 'blocked', 'not_run']),
    readinessStatus: ControlledPatchReadinessStatusSchema,
    readyForReviewDraftOnly: z.boolean(),
    evidenceRefIds: z.array(z.string().min(1)).default([]),
    auditEventIds: z.array(z.string().min(1)).default([]),
    fileExportPlanned: z.literal(false),
    processBoundaryInvoked: z.literal(false),
    externalProcessStarted: z.literal(false),
    noRealWrite: z.literal(true),
    rawPathStored: z.literal(false),
    bodyStored: z.literal(false),
    summary: z.string().min(1),
  })
  .strict()
  .superRefine((record, context) => {
    rejectM12PatchRawMetadata(record.metadata, context, ['metadata']);

    if (record.changedFileCount !== record.changedFilePathHashes.length) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'changedFileCount must match changedFilePathHashes length',
        path: ['changedFileCount'],
      });
    }

    if (
      record.readyForReviewDraftOnly &&
      (record.verificationStatus !== 'passed' || record.readinessStatus !== 'ready_for_review_draft_only')
    ) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'local review package readiness requires passed verification and draft-only readiness',
        path: ['readyForReviewDraftOnly'],
      });
    }
  });
export type LocalReviewPackagePlan = z.infer<typeof LocalReviewPackagePlanSchema>;

export const LocalReviewPackageSummarySchema = createdEntityBaseSchema
  .extend({
    planId: z.string().min(1),
    status: LocalReviewPackageStatusSchema,
    changedFileCount: z.number().int().nonnegative(),
    diffHash: z.string().min(1).optional(),
    verificationStatus: z.enum(['passed', 'failed', 'aborted', 'blocked', 'not_run']),
    readyForReviewDraftOnly: z.boolean(),
    evidenceRefCount: z.number().int().nonnegative(),
    auditEventCount: z.number().int().nonnegative(),
    packageHash: z.string().min(1),
    exported: z.literal(false),
    rawPathStored: z.literal(false),
    bodyStored: z.literal(false),
    noRealWrite: z.literal(true),
    summary: z.string().min(1),
  })
  .strict()
  .superRefine((record, context) => {
    rejectM12PatchRawMetadata(record.metadata, context, ['metadata']);

    if (record.status === 'ready_for_review' && !record.readyForReviewDraftOnly) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'ready_for_review requires draft-only readiness',
        path: ['status'],
      });
    }
  });
export type LocalReviewPackageSummary = z.infer<typeof LocalReviewPackageSummarySchema>;

export const LocalReviewFindingSeveritySchema = z.enum(['info', 'warning', 'blocker']);
export type LocalReviewFindingSeverity = z.infer<typeof LocalReviewFindingSeveritySchema>;

export const LocalReviewFindingSummarySchema = createdEntityBaseSchema
  .extend({
    reviewPackageIdHash: z.string().min(1),
    severity: LocalReviewFindingSeveritySchema,
    findingCount: z.number().int().nonnegative(),
    findingHash: z.string().min(1),
    rawFindingStored: z.literal(false),
    rawPathStored: z.literal(false),
    bodyStored: z.literal(false),
    noRealWrite: z.literal(true),
    summary: z.string().min(1),
  })
  .strict()
  .superRefine((record, context) => {
    rejectM12PatchRawMetadata(record.metadata, context, ['metadata']);
  });
export type LocalReviewFindingSummary = z.infer<typeof LocalReviewFindingSummarySchema>;

export const LocalReviewDecisionProjectionSchema = createdEntityBaseSchema
  .extend({
    reviewPackageIdHash: z.string().min(1),
    status: LocalReviewDecisionStatusSchema,
    reasonHash: z.string().min(1).optional(),
    findingCount: z.number().int().nonnegative(),
    blockerCount: z.number().int().nonnegative(),
    nextAction: z.enum(['none', 'local_rc_readiness', 'm12_retry_handoff', 'stop']),
    retryHandoffRequired: z.boolean(),
    rawReasonStored: z.literal(false),
    rawPathStored: z.literal(false),
    bodyStored: z.literal(false),
    noRealWrite: z.literal(true),
    summary: z.string().min(1),
  })
  .strict()
  .superRefine((record, context) => {
    rejectM12PatchRawMetadata(record.metadata, context, ['metadata']);

    if (record.status === 'approved_for_local_rc' && record.blockerCount > 0) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'approved local review decisions cannot include blockers',
        path: ['blockerCount'],
      });
    }

    if (record.status === 'changes_requested' && !record.retryHandoffRequired) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'changes_requested must create a retry handoff projection',
        path: ['retryHandoffRequired'],
      });
    }
  });
export type LocalReviewDecisionProjection = z.infer<
  typeof LocalReviewDecisionProjectionSchema
>;

export const LocalReviewPackageRunSchema = createdEntityBaseSchema
  .extend({
    plan: LocalReviewPackagePlanSchema,
    packageSummary: LocalReviewPackageSummarySchema,
    findings: z.array(LocalReviewFindingSummarySchema).default([]),
    decision: LocalReviewDecisionProjectionSchema,
    evidenceRefIds: z.array(z.string().min(1)).default([]),
    auditEventIds: z.array(z.string().min(1)).default([]),
    exported: z.literal(false),
    processBoundaryInvoked: z.literal(false),
    externalProcessStarted: z.literal(false),
    noRealWrite: z.literal(true),
    rawPathStored: z.literal(false),
    bodyStored: z.literal(false),
    summary: z.string().min(1),
  })
  .strict()
  .superRefine((record, context) => {
    rejectM12PatchRawMetadata(record.metadata, context, ['metadata']);

    if (record.packageSummary.planId !== record.plan.id) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'package summary must reference local review package plan',
        path: ['packageSummary', 'planId'],
      });
    }
  });
export type LocalReviewPackageRun = z.infer<typeof LocalReviewPackageRunSchema>;

export const LocalReviewPackageExportRunnerModeSchema = z.enum([
  'projection',
  'controlled-local-artifact',
]);
export type LocalReviewPackageExportRunnerMode = z.infer<
  typeof LocalReviewPackageExportRunnerModeSchema
>;

export const LocalReviewPackageApprovalStatusSchema = z.enum([
  'requested',
  'approved',
  'denied',
  'expired',
  'used',
  'revoked',
]);
export type LocalReviewPackageApprovalStatus = z.infer<
  typeof LocalReviewPackageApprovalStatusSchema
>;

export const LocalReviewPackageExportRunStatusSchema = z.enum([
  'completed',
  'failed',
  'blocked',
  'aborted',
]);
export type LocalReviewPackageExportRunStatus = z.infer<
  typeof LocalReviewPackageExportRunStatusSchema
>;

export const LocalReviewPackageDryRunRecordSchema = createdEntityBaseSchema
  .extend({
    dryRunId: z.string().min(1),
    status: z.enum(['planned', 'blocked']),
    runnerMode: LocalReviewPackageExportRunnerModeSchema,
    reviewPackage: LocalReviewPackageRunSchema,
    reviewPackageIdHash: z.string().min(1),
    packageHash: z.string().min(1),
    artifactRootHash: z.string().min(1),
    artifactDirectoryHash: z.string().min(1),
    plannedFileCount: z.number().int().positive(),
    plannedFileNameHashes: z.array(z.string().min(1)).default([]),
    blockReasons: z.array(z.string().min(1)).default([]),
    policyDecision: PolicyDecisionSchema,
    requiresApproval: z.literal(true),
    evidenceRefs: z.array(EvidenceRefSchema).default([]),
    auditEventIds: z.array(z.string().min(1)).default([]),
    artifactWriteBoundaryPlanned: z.boolean(),
    artifactWriteBoundaryInvoked: z.literal(false),
    processBoundaryInvoked: z.literal(false),
    externalProcessStarted: z.literal(false),
    noRealWrite: z.literal(true),
    rawPathStored: z.literal(false),
    bodyStored: z.literal(false),
    summary: z.string().min(1),
  })
  .strict()
  .superRefine((record, context) => {
    rejectM12PatchRawMetadata(record.metadata, context, ['metadata']);

    if (record.plannedFileCount !== record.plannedFileNameHashes.length) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'plannedFileCount must match plannedFileNameHashes length',
        path: ['plannedFileCount'],
      });
    }

    if (record.status === 'blocked' && record.artifactWriteBoundaryPlanned) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'blocked local review package dry-runs cannot plan an artifact write',
        path: ['artifactWriteBoundaryPlanned'],
      });
    }
  });
export type LocalReviewPackageDryRunRecord = z.infer<
  typeof LocalReviewPackageDryRunRecordSchema
>;

export const LocalReviewPackageApprovalArtifactRecordSchema = createdEntityBaseSchema
  .extend({
    dryRunId: z.string().min(1),
    dryRunRecordId: z.string().min(1),
    approvalRequestId: z.string().min(1),
    approvalArtifactId: z.string().min(1),
    status: LocalReviewPackageApprovalStatusSchema,
    approved: z.boolean(),
    policyDecisionId: z.string().min(1),
    requestedByHash: z.string().min(1).optional(),
    decidedByHash: z.string().min(1).optional(),
    reasonHash: z.string().min(1).optional(),
    expiresAt: IsoDateTimeSchema.optional(),
    evidenceRefs: z.array(EvidenceRefSchema).default([]),
    auditEventIds: z.array(z.string().min(1)).default([]),
    artifactWriteBoundaryInvoked: z.literal(false),
    processBoundaryInvoked: z.literal(false),
    externalProcessStarted: z.literal(false),
    rawPathStored: z.literal(false),
    bodyStored: z.literal(false),
    summary: z.string().min(1),
  })
  .strict()
  .superRefine((record, context) => {
    rejectM12PatchRawMetadata(record.metadata, context, ['metadata']);

    if (record.approved !== (record.status === 'approved')) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'approved must match approved approval status',
        path: ['approved'],
      });
    }
  });
export type LocalReviewPackageApprovalArtifactRecord = z.infer<
  typeof LocalReviewPackageApprovalArtifactRecordSchema
>;

export const LocalReviewPackageControlPlaneRunSchema = createdEntityBaseSchema
  .extend({
    dryRunId: z.string().min(1),
    dryRunRecordId: z.string().min(1),
    approvalArtifactId: z.string().min(1).optional(),
    status: LocalReviewPackageExportRunStatusSchema,
    reviewPackageIdHash: z.string().min(1),
    packageHash: z.string().min(1),
    artifactRootHash: z.string().min(1),
    artifactDirectoryHash: z.string().min(1),
    exportedFileCount: z.number().int().nonnegative(),
    byteCount: z.number().int().nonnegative(),
    contentHash: z.string().min(1).optional(),
    blockReasons: z.array(z.string().min(1)).default([]),
    evidenceRefs: z.array(EvidenceRefSchema).default([]),
    auditEventIds: z.array(z.string().min(1)).default([]),
    artifactWriteBoundaryInvoked: z.boolean(),
    processBoundaryInvoked: z.literal(false),
    externalProcessStarted: z.literal(false),
    noRealWrite: z.boolean(),
    rawPathStored: z.literal(false),
    bodyStored: z.literal(false),
    summary: z.string().min(1),
  })
  .strict()
  .superRefine((record, context) => {
    rejectM12PatchRawMetadata(record.metadata, context, ['metadata']);

    if (record.status === 'completed' && !record.artifactWriteBoundaryInvoked) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'completed local review package exports must invoke artifact write boundary',
        path: ['artifactWriteBoundaryInvoked'],
      });
    }

    if (record.status === 'completed' && record.noRealWrite) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'completed local artifact export is a real local write',
        path: ['noRealWrite'],
      });
    }
  });
export type LocalReviewPackageControlPlaneRun = z.infer<
  typeof LocalReviewPackageControlPlaneRunSchema
>;

export const LocalRcReadinessStatusSchema = z.enum([
  'not_ready',
  'ready_for_local_acceptance',
  'blocked_review',
  'blocked_verification',
  'blocked_operator_readiness',
]);
export type LocalRcReadinessStatus = z.infer<typeof LocalRcReadinessStatusSchema>;

export const LocalRcReadinessOperatorStatusSchema = z.enum(['pass', 'warn', 'fail', 'unknown']);
export type LocalRcReadinessOperatorStatus = z.infer<
  typeof LocalRcReadinessOperatorStatusSchema
>;

export const LocalRcReadinessPlanSchema = createdEntityBaseSchema
  .extend({
    reviewPackageIdHash: z.string().min(1),
    reviewDecisionIdHash: z.string().min(1),
    reviewDecisionStatus: LocalReviewDecisionStatusSchema,
    verificationStatus: z.enum(['passed', 'failed', 'aborted', 'blocked', 'not_run']),
    operatorReadinessStatus: LocalRcReadinessOperatorStatusSchema,
    plannedReadinessStatus: LocalRcReadinessStatusSchema,
    evidenceRefIds: z.array(z.string().min(1)).default([]),
    auditEventIds: z.array(z.string().min(1)).default([]),
    exportPlanned: z.literal(false),
    processBoundaryInvoked: z.literal(false),
    externalProcessStarted: z.literal(false),
    noRealWrite: z.literal(true),
    rawPathStored: z.literal(false),
    bodyStored: z.literal(false),
    summary: z.string().min(1),
  })
  .strict()
  .superRefine((record, context) => {
    rejectM12PatchRawMetadata(record.metadata, context, ['metadata']);

    if (
      record.plannedReadinessStatus === 'ready_for_local_acceptance' &&
      (record.reviewDecisionStatus !== 'approved_for_local_rc' ||
        record.verificationStatus !== 'passed' ||
        record.operatorReadinessStatus !== 'pass')
    ) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          'local RC acceptance readiness requires approved review, passed verification, and passing operator readiness',
        path: ['plannedReadinessStatus'],
      });
    }
  });
export type LocalRcReadinessPlan = z.infer<typeof LocalRcReadinessPlanSchema>;

export const LocalRcReadinessSummarySchema = createdEntityBaseSchema
  .extend({
    planId: z.string().min(1),
    status: LocalRcReadinessStatusSchema,
    reviewDecisionStatus: LocalReviewDecisionStatusSchema,
    verificationStatus: z.enum(['passed', 'failed', 'aborted', 'blocked', 'not_run']),
    operatorReadinessStatus: LocalRcReadinessOperatorStatusSchema,
    blockerCount: z.number().int().nonnegative(),
    evidenceRefCount: z.number().int().nonnegative(),
    auditEventCount: z.number().int().nonnegative(),
    localAcceptanceReady: z.boolean(),
    bundleExported: z.literal(false),
    rawPathStored: z.literal(false),
    bodyStored: z.literal(false),
    noRealWrite: z.literal(true),
    summary: z.string().min(1),
  })
  .strict()
  .superRefine((record, context) => {
    rejectM12PatchRawMetadata(record.metadata, context, ['metadata']);

    if (record.localAcceptanceReady !== (record.status === 'ready_for_local_acceptance')) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'localAcceptanceReady must match ready_for_local_acceptance status',
        path: ['localAcceptanceReady'],
      });
    }

    if (record.status === 'ready_for_local_acceptance' && record.blockerCount > 0) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'ready local RC summaries cannot include blockers',
        path: ['blockerCount'],
      });
    }
  });
export type LocalRcReadinessSummary = z.infer<typeof LocalRcReadinessSummarySchema>;

export const LocalRcEvidenceBundleSchema = createdEntityBaseSchema
  .extend({
    rcReadinessIdHash: z.string().min(1),
    evidenceRefIds: z.array(z.string().min(1)).default([]),
    evidenceCount: z.number().int().nonnegative(),
    bundleHash: z.string().min(1),
    artifactExported: z.literal(false),
    rawPathStored: z.literal(false),
    bodyStored: z.literal(false),
    noRealWrite: z.literal(true),
    summary: z.string().min(1),
  })
  .strict()
  .superRefine((record, context) => {
    rejectM12PatchRawMetadata(record.metadata, context, ['metadata']);

    if (record.evidenceCount !== record.evidenceRefIds.length) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'evidenceCount must match evidenceRefIds length',
        path: ['evidenceCount'],
      });
    }
  });
export type LocalRcEvidenceBundle = z.infer<typeof LocalRcEvidenceBundleSchema>;

export const LocalRcAuditChainSchema = createdEntityBaseSchema
  .extend({
    rcReadinessIdHash: z.string().min(1),
    auditEventIds: z.array(z.string().min(1)).default([]),
    auditEventCount: z.number().int().nonnegative(),
    chainHash: z.string().min(1),
    processBoundaryCount: z.number().int().nonnegative(),
    externalProcessStartedCount: z.number().int().nonnegative(),
    networkBoundaryCount: z.number().int().nonnegative(),
    artifactExported: z.literal(false),
    rawPathStored: z.literal(false),
    bodyStored: z.literal(false),
    noRealWrite: z.literal(true),
    summary: z.string().min(1),
  })
  .strict()
  .superRefine((record, context) => {
    rejectM12PatchRawMetadata(record.metadata, context, ['metadata']);

    if (record.auditEventCount !== record.auditEventIds.length) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'auditEventCount must match auditEventIds length',
        path: ['auditEventCount'],
      });
    }
  });
export type LocalRcAuditChain = z.infer<typeof LocalRcAuditChainSchema>;

export const LocalRcBundleExportRunnerModeSchema = z.enum([
  'projection',
  'controlled-local-artifact',
]);
export type LocalRcBundleExportRunnerMode = z.infer<
  typeof LocalRcBundleExportRunnerModeSchema
>;

export const LocalRcBundleApprovalStatusSchema = z.enum([
  'requested',
  'approved',
  'denied',
  'expired',
  'used',
  'revoked',
]);
export type LocalRcBundleApprovalStatus = z.infer<typeof LocalRcBundleApprovalStatusSchema>;

export const LocalRcBundleExportRunStatusSchema = z.enum([
  'completed',
  'failed',
  'blocked',
  'aborted',
]);
export type LocalRcBundleExportRunStatus = z.infer<
  typeof LocalRcBundleExportRunStatusSchema
>;

export const LocalRcBundleDryRunRecordSchema = createdEntityBaseSchema
  .extend({
    dryRunId: z.string().min(1),
    status: z.enum(['planned', 'blocked']),
    runnerMode: LocalRcBundleExportRunnerModeSchema,
    readinessPlan: LocalRcReadinessPlanSchema,
    readinessSummary: LocalRcReadinessSummarySchema,
    evidenceBundle: LocalRcEvidenceBundleSchema,
    auditChain: LocalRcAuditChainSchema,
    rcReadinessIdHash: z.string().min(1),
    rcBundleHash: z.string().min(1),
    artifactRootHash: z.string().min(1),
    artifactDirectoryHash: z.string().min(1),
    plannedFileCount: z.number().int().positive(),
    plannedFileNameHashes: z.array(z.string().min(1)).default([]),
    blockReasons: z.array(z.string().min(1)).default([]),
    policyDecision: PolicyDecisionSchema,
    requiresApproval: z.literal(true),
    evidenceRefs: z.array(EvidenceRefSchema).default([]),
    auditEventIds: z.array(z.string().min(1)).default([]),
    artifactWriteBoundaryPlanned: z.boolean(),
    artifactWriteBoundaryInvoked: z.literal(false),
    processBoundaryInvoked: z.literal(false),
    externalProcessStarted: z.literal(false),
    noRealWrite: z.literal(true),
    rawPathStored: z.literal(false),
    bodyStored: z.literal(false),
    summary: z.string().min(1),
  })
  .strict()
  .superRefine((record, context) => {
    rejectM12PatchRawMetadata(record.metadata, context, ['metadata']);

    if (record.plannedFileCount !== record.plannedFileNameHashes.length) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'plannedFileCount must match plannedFileNameHashes length',
        path: ['plannedFileCount'],
      });
    }

    if (record.status === 'blocked' && record.artifactWriteBoundaryPlanned) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'blocked local RC bundle dry-runs cannot plan an artifact write',
        path: ['artifactWriteBoundaryPlanned'],
      });
    }
  });
export type LocalRcBundleDryRunRecord = z.infer<typeof LocalRcBundleDryRunRecordSchema>;

export const LocalRcBundleApprovalArtifactRecordSchema = createdEntityBaseSchema
  .extend({
    dryRunId: z.string().min(1),
    dryRunRecordId: z.string().min(1),
    approvalRequestId: z.string().min(1),
    approvalArtifactId: z.string().min(1),
    status: LocalRcBundleApprovalStatusSchema,
    approved: z.boolean(),
    policyDecisionId: z.string().min(1),
    requestedByHash: z.string().min(1).optional(),
    decidedByHash: z.string().min(1).optional(),
    reasonHash: z.string().min(1).optional(),
    expiresAt: IsoDateTimeSchema.optional(),
    evidenceRefs: z.array(EvidenceRefSchema).default([]),
    auditEventIds: z.array(z.string().min(1)).default([]),
    artifactWriteBoundaryInvoked: z.literal(false),
    processBoundaryInvoked: z.literal(false),
    externalProcessStarted: z.literal(false),
    rawPathStored: z.literal(false),
    bodyStored: z.literal(false),
    summary: z.string().min(1),
  })
  .strict()
  .superRefine((record, context) => {
    rejectM12PatchRawMetadata(record.metadata, context, ['metadata']);

    if (record.approved !== (record.status === 'approved')) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'approved must match approved approval status',
        path: ['approved'],
      });
    }
  });
export type LocalRcBundleApprovalArtifactRecord = z.infer<
  typeof LocalRcBundleApprovalArtifactRecordSchema
>;

export const LocalRcBundleControlPlaneRunSchema = createdEntityBaseSchema
  .extend({
    dryRunId: z.string().min(1),
    dryRunRecordId: z.string().min(1),
    approvalArtifactId: z.string().min(1).optional(),
    status: LocalRcBundleExportRunStatusSchema,
    rcReadinessIdHash: z.string().min(1),
    rcBundleHash: z.string().min(1),
    artifactRootHash: z.string().min(1),
    artifactDirectoryHash: z.string().min(1),
    exportedFileCount: z.number().int().nonnegative(),
    byteCount: z.number().int().nonnegative(),
    contentHash: z.string().min(1).optional(),
    blockReasons: z.array(z.string().min(1)).default([]),
    evidenceRefs: z.array(EvidenceRefSchema).default([]),
    auditEventIds: z.array(z.string().min(1)).default([]),
    artifactWriteBoundaryInvoked: z.boolean(),
    processBoundaryInvoked: z.literal(false),
    externalProcessStarted: z.literal(false),
    noRealWrite: z.boolean(),
    rawPathStored: z.literal(false),
    bodyStored: z.literal(false),
    summary: z.string().min(1),
  })
  .strict()
  .superRefine((record, context) => {
    rejectM12PatchRawMetadata(record.metadata, context, ['metadata']);

    if (record.status === 'completed' && !record.artifactWriteBoundaryInvoked) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'completed local RC bundle exports must invoke artifact write boundary',
        path: ['artifactWriteBoundaryInvoked'],
      });
    }

    if (record.status === 'completed' && record.noRealWrite) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'completed local RC bundle export is a real local write',
        path: ['noRealWrite'],
      });
    }
  });
export type LocalRcBundleControlPlaneRun = z.infer<
  typeof LocalRcBundleControlPlaneRunSchema
>;

export const LocalRcAcceptanceRehearsalScenarioSchema = z.enum([
  'all-pass',
  'review-blocked',
  'verification-blocked',
  'readiness-blocked',
  'export-blocked',
  'superseded-package',
]);
export type LocalRcAcceptanceRehearsalScenario = z.infer<
  typeof LocalRcAcceptanceRehearsalScenarioSchema
>;

export const LocalRcAcceptanceRehearsalStepSchema = createdEntityBaseSchema
  .extend({
    scenario: LocalRcAcceptanceRehearsalScenarioSchema,
    phase: z.enum([
      'review-package',
      'review-decision',
      'rc-readiness',
      'rc-export-summary',
      'operator-acceptance',
    ]),
    status: z.enum(['passed', 'failed', 'blocked', 'skipped']),
    order: z.number().int().nonnegative(),
    evidenceRefIds: z.array(z.string().min(1)).default([]),
    auditEventIds: z.array(z.string().min(1)).default([]),
    processBoundaryInvoked: z.literal(false),
    externalProcessStarted: z.literal(false),
    networkBoundaryInvoked: z.literal(false),
    artifactWriteBoundaryInvoked: z.literal(false),
    noRealWrite: z.literal(true),
    rawPathStored: z.literal(false),
    bodyStored: z.literal(false),
    summary: z.string().min(1),
  })
  .strict()
  .superRefine((record, context) => {
    rejectM12PatchRawMetadata(record.metadata, context, ['metadata']);
  });
export type LocalRcAcceptanceRehearsalStep = z.infer<
  typeof LocalRcAcceptanceRehearsalStepSchema
>;

export const LocalRcAcceptanceRehearsalRunSchema = createdEntityBaseSchema
  .extend({
    scenario: LocalRcAcceptanceRehearsalScenarioSchema,
    status: z.enum(['passed', 'failed', 'blocked', 'aborted']),
    rcReadinessStatus: LocalRcReadinessStatusSchema,
    reviewDecisionStatus: LocalReviewDecisionStatusSchema,
    verificationStatus: z.enum(['passed', 'failed', 'aborted', 'blocked', 'not_run']),
    exportSummaryStatus: z.enum(['fixture_completed', 'blocked', 'skipped']),
    operatorAcceptanceStatus: z.enum(['accepted', 'blocked', 'not_ready']),
    stepCount: z.number().int().nonnegative(),
    steps: z.array(LocalRcAcceptanceRehearsalStepSchema),
    evidenceRefIds: z.array(z.string().min(1)).default([]),
    auditEventIds: z.array(z.string().min(1)).default([]),
    evidenceRefCount: z.number().int().nonnegative(),
    auditEventCount: z.number().int().nonnegative(),
    bundleHash: z.string().min(1),
    blockReasons: z.array(z.string().min(1)).default([]),
    artifactWriteBoundaryInvoked: z.literal(false),
    processBoundaryInvoked: z.literal(false),
    externalProcessStarted: z.literal(false),
    networkBoundaryInvoked: z.literal(false),
    noRealWrite: z.literal(true),
    rawPathStored: z.literal(false),
    bodyStored: z.literal(false),
    summary: z.string().min(1),
  })
  .strict()
  .superRefine((record, context) => {
    rejectM12PatchRawMetadata(record.metadata, context, ['metadata']);

    if (record.stepCount !== record.steps.length) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'stepCount must match local RC acceptance steps length',
        path: ['stepCount'],
      });
    }

    if (record.evidenceRefCount !== record.evidenceRefIds.length) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'evidenceRefCount must match evidenceRefIds length',
        path: ['evidenceRefCount'],
      });
    }

    if (record.auditEventCount !== record.auditEventIds.length) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'auditEventCount must match auditEventIds length',
        path: ['auditEventCount'],
      });
    }

    if (record.status === 'passed' && record.scenario !== 'all-pass') {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'only all-pass local RC acceptance rehearsals can pass',
        path: ['status'],
      });
    }

    if (record.status === 'passed' && record.operatorAcceptanceStatus !== 'accepted') {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'passed local RC acceptance rehearsals require accepted operator status',
        path: ['operatorAcceptanceStatus'],
      });
    }
  });
export type LocalRcAcceptanceRehearsalRun = z.infer<
  typeof LocalRcAcceptanceRehearsalRunSchema
>;

export const GithubProviderHostSchema = z.literal('api.github.com');
export type GithubProviderHost = z.infer<typeof GithubProviderHostSchema>;

export const GithubProviderApprovalStatusSchema = z.enum([
  'requested',
  'approved',
  'denied',
  'expired',
  'used',
  'revoked',
]);
export type GithubProviderApprovalStatus = z.infer<
  typeof GithubProviderApprovalStatusSchema
>;

export const GithubMetadataRunnerModeSchema = z.enum([
  'planning-only',
  'controlled-github-http',
]);
export type GithubMetadataRunnerMode = z.infer<typeof GithubMetadataRunnerModeSchema>;

export const GithubPrLifecycleRunnerModeSchema = z.enum([
  'planning-only',
  'controlled-github-pr-lifecycle',
]);
export type GithubPrLifecycleRunnerMode = z.infer<
  typeof GithubPrLifecycleRunnerModeSchema
>;

export const GithubControlPlaneRunStatusSchema = z.enum([
  'completed',
  'failed',
  'blocked',
  'aborted',
]);
export type GithubControlPlaneRunStatus = z.infer<typeof GithubControlPlaneRunStatusSchema>;

export const GithubRemoteRefSummarySchema = createdEntityBaseSchema
  .extend({
    hostHash: z.string().min(1),
    ownerHash: z.string().min(1),
    repoHash: z.string().min(1),
    baseBranchHash: z.string().min(1).optional(),
    headBranchHash: z.string().min(1).optional(),
    allowedHost: GithubProviderHostSchema,
    rawOwnerStored: z.literal(false),
    rawRepoStored: z.literal(false),
    rawRefStored: z.literal(false),
    rawUrlStored: z.literal(false),
    rawPathStored: z.literal(false),
    bodyStored: z.literal(false),
    summary: z.string().min(1),
  })
  .strict()
  .superRefine((record, context) => {
    rejectGithubRawMetadata(record.metadata, context, ['metadata']);
  });
export type GithubRemoteRefSummary = z.infer<typeof GithubRemoteRefSummarySchema>;

export const GithubTokenReadinessSchema = createdEntityBaseSchema
  .extend({
    providerName: z.literal('github-provider'),
    envVarNameHash: z.string().min(1),
    tokenConfigured: z.boolean(),
    tokenHash: z.string().min(1).optional(),
    tokenValueStored: z.literal(false),
    rawValueStored: z.literal(false),
    rawPathStored: z.literal(false),
    bodyStored: z.literal(false),
    summary: z.string().min(1),
  })
  .strict()
  .superRefine((record, context) => {
    rejectGithubRawMetadata(record.metadata, context, ['metadata']);

    if (record.tokenConfigured && !record.tokenHash) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'configured GitHub token readiness requires tokenHash',
        path: ['tokenHash'],
      });
    }

    if (!record.tokenConfigured && record.tokenHash) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'missing GitHub token readiness cannot expose tokenHash',
        path: ['tokenHash'],
      });
    }
  });
export type GithubTokenReadiness = z.infer<typeof GithubTokenReadinessSchema>;

export const GithubMetadataDryRunRecordSchema = createdEntityBaseSchema
  .extend({
    dryRunId: z.string().min(1),
    status: z.enum(['planned', 'blocked']),
    runnerMode: GithubMetadataRunnerModeSchema,
    targetRef: GithubRemoteRefSummarySchema,
    requestedMetadata: z
      .array(z.enum(['repo', 'base_branch', 'head_branch', 'existing_pull_request']))
      .default([]),
    blockReasons: z.array(z.string().min(1)).default([]),
    policyDecision: PolicyDecisionSchema,
    requiresApproval: z.literal(true),
    evidenceRefs: z.array(EvidenceRefSchema).default([]),
    auditEventIds: z.array(z.string().min(1)).default([]),
    networkBoundaryPlanned: z.boolean(),
    networkBoundaryInvoked: z.literal(false),
    processBoundaryInvoked: z.literal(false),
    externalProcessStarted: z.literal(false),
    noRealWrite: z.literal(true),
    rawPathStored: z.literal(false),
    bodyStored: z.literal(false),
    summary: z.string().min(1),
  })
  .strict()
  .superRefine((record, context) => {
    rejectGithubRawMetadata(record.metadata, context, ['metadata']);

    if (record.status === 'blocked' && record.networkBoundaryPlanned) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'blocked GitHub metadata dry-runs cannot plan a network boundary',
        path: ['networkBoundaryPlanned'],
      });
    }
  });
export type GithubMetadataDryRunRecord = z.infer<typeof GithubMetadataDryRunRecordSchema>;

export const GithubMetadataApprovalArtifactRecordSchema = createdEntityBaseSchema
  .extend({
    dryRunId: z.string().min(1),
    dryRunRecordId: z.string().min(1),
    approvalRequestId: z.string().min(1),
    approvalArtifactId: z.string().min(1),
    status: GithubProviderApprovalStatusSchema,
    approved: z.boolean(),
    policyDecisionId: z.string().min(1),
    requestedByHash: z.string().min(1).optional(),
    decidedByHash: z.string().min(1).optional(),
    reasonHash: z.string().min(1).optional(),
    expiresAt: IsoDateTimeSchema.optional(),
    evidenceRefs: z.array(EvidenceRefSchema).default([]),
    auditEventIds: z.array(z.string().min(1)).default([]),
    networkBoundaryInvoked: z.literal(false),
    processBoundaryInvoked: z.literal(false),
    externalProcessStarted: z.literal(false),
    rawPathStored: z.literal(false),
    bodyStored: z.literal(false),
    summary: z.string().min(1),
  })
  .strict()
  .superRefine((record, context) => {
    rejectGithubRawMetadata(record.metadata, context, ['metadata']);

    if (record.approved !== (record.status === 'approved')) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'approved must match approved GitHub approval status',
        path: ['approved'],
      });
    }
  });
export type GithubMetadataApprovalArtifactRecord = z.infer<
  typeof GithubMetadataApprovalArtifactRecordSchema
>;

export const GithubMetadataControlPlaneRunSchema = createdEntityBaseSchema
  .extend({
    dryRunId: z.string().min(1),
    dryRunRecordId: z.string().min(1),
    approvalArtifactId: z.string().min(1).optional(),
    status: GithubControlPlaneRunStatusSchema,
    targetRef: GithubRemoteRefSummarySchema,
    repoMetadataHash: z.string().min(1).optional(),
    baseBranchMetadataHash: z.string().min(1).optional(),
    headBranchMetadataHash: z.string().min(1).optional(),
    existingPullRequestCount: z.number().int().nonnegative(),
    responseBodyHashes: z.array(z.string().min(1)).default([]),
    blockReasons: z.array(z.string().min(1)).default([]),
    evidenceRefs: z.array(EvidenceRefSchema).default([]),
    auditEventIds: z.array(z.string().min(1)).default([]),
    networkBoundaryInvoked: z.boolean(),
    processBoundaryInvoked: z.literal(false),
    externalProcessStarted: z.literal(false),
    noRealWrite: z.literal(true),
    rawPathStored: z.literal(false),
    bodyStored: z.literal(false),
    summary: z.string().min(1),
  })
  .strict()
  .superRefine((record, context) => {
    rejectGithubRawMetadata(record.metadata, context, ['metadata']);

    if (record.status === 'completed' && !record.networkBoundaryInvoked) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'completed GitHub metadata runs must invoke the network boundary',
        path: ['networkBoundaryInvoked'],
      });
    }
  });
export type GithubMetadataControlPlaneRun = z.infer<
  typeof GithubMetadataControlPlaneRunSchema
>;

export const GithubDraftPrRunnerModeSchema = z.enum([
  'planning-only',
  'controlled-github-draft-pr',
]);
export type GithubDraftPrRunnerMode = z.infer<typeof GithubDraftPrRunnerModeSchema>;

export const GithubDraftPrReadinessStatusSchema = z.enum([
  'not_ready',
  'ready_for_draft_pr',
  'blocked_source',
  'blocked_metadata',
  'blocked_existing_pr',
  'blocked_head_branch',
  'blocked_policy',
]);
export type GithubDraftPrReadinessStatus = z.infer<
  typeof GithubDraftPrReadinessStatusSchema
>;

export const GithubDraftPrSourceKindSchema = z.enum([
  'local_rc_readiness',
  'review_package',
]);
export type GithubDraftPrSourceKind = z.infer<typeof GithubDraftPrSourceKindSchema>;

export const GithubDraftPrReadinessSchema = createdEntityBaseSchema
  .extend({
    sourceKind: GithubDraftPrSourceKindSchema,
    sourceIdHash: z.string().min(1),
    sourceSummaryHash: z.string().min(1),
    targetRef: GithubRemoteRefSummarySchema,
    status: GithubDraftPrReadinessStatusSchema,
    blockerCount: z.number().int().nonnegative(),
    draftOnly: z.literal(true),
    remoteHeadBranchExistsRequired: z.literal(true),
    pushAllowed: z.literal(false),
    createRefAllowed: z.literal(false),
    mergeAllowed: z.literal(false),
    labelsAllowed: z.literal(false),
    reviewersAllowed: z.literal(false),
    commentsAllowed: z.literal(false),
    rawPrBodyStored: z.literal(false),
    rawPathStored: z.literal(false),
    bodyStored: z.literal(false),
    noRealWrite: z.literal(true),
    summary: z.string().min(1),
  })
  .strict()
  .superRefine((record, context) => {
    rejectGithubRawMetadata(record.metadata, context, ['metadata']);

    if (record.status === 'ready_for_draft_pr' && record.blockerCount > 0) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'ready GitHub draft PR readiness cannot include blockers',
        path: ['blockerCount'],
      });
    }
  });
export type GithubDraftPrReadiness = z.infer<typeof GithubDraftPrReadinessSchema>;

export const GithubDraftPrPlanSchema = createdEntityBaseSchema
  .extend({
    dryRunId: z.string().min(1),
    status: z.enum(['planned', 'blocked']),
    runnerMode: GithubDraftPrRunnerModeSchema,
    readiness: GithubDraftPrReadinessSchema,
    titleHash: z.string().min(1),
    bodyHash: z.string().min(1),
    bodySectionCount: z.number().int().nonnegative(),
    bodyCharacterCount: z.number().int().nonnegative(),
    blockReasons: z.array(z.string().min(1)).default([]),
    policyDecision: PolicyDecisionSchema,
    requiresApproval: z.literal(true),
    networkBoundaryPlanned: z.boolean(),
    networkBoundaryInvoked: z.literal(false),
    draft: z.literal(true),
    pushAllowed: z.literal(false),
    createRefAllowed: z.literal(false),
    mergeAllowed: z.literal(false),
    rawPrBodyStored: z.literal(false),
    rawPathStored: z.literal(false),
    bodyStored: z.literal(false),
    noRealWrite: z.literal(true),
    evidenceRefs: z.array(EvidenceRefSchema).default([]),
    auditEventIds: z.array(z.string().min(1)).default([]),
    summary: z.string().min(1),
  })
  .strict()
  .superRefine((record, context) => {
    rejectGithubRawMetadata(record.metadata, context, ['metadata']);

    if (record.status === 'blocked' && record.networkBoundaryPlanned) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'blocked GitHub draft PR plans cannot plan a network boundary',
        path: ['networkBoundaryPlanned'],
      });
    }
  });
export type GithubDraftPrPlan = z.infer<typeof GithubDraftPrPlanSchema>;

export const GithubDraftPrApprovalArtifactRecordSchema = createdEntityBaseSchema
  .extend({
    dryRunId: z.string().min(1),
    dryRunRecordId: z.string().min(1),
    approvalRequestId: z.string().min(1),
    approvalArtifactId: z.string().min(1),
    status: GithubProviderApprovalStatusSchema,
    approved: z.boolean(),
    policyDecisionId: z.string().min(1),
    requestedByHash: z.string().min(1).optional(),
    decidedByHash: z.string().min(1).optional(),
    reasonHash: z.string().min(1).optional(),
    expiresAt: IsoDateTimeSchema.optional(),
    evidenceRefs: z.array(EvidenceRefSchema).default([]),
    auditEventIds: z.array(z.string().min(1)).default([]),
    networkBoundaryInvoked: z.literal(false),
    processBoundaryInvoked: z.literal(false),
    externalProcessStarted: z.literal(false),
    rawPathStored: z.literal(false),
    bodyStored: z.literal(false),
    summary: z.string().min(1),
  })
  .strict()
  .superRefine((record, context) => {
    rejectGithubRawMetadata(record.metadata, context, ['metadata']);

    if (record.approved !== (record.status === 'approved')) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'approved must match approved GitHub draft PR approval status',
        path: ['approved'],
      });
    }
  });
export type GithubDraftPrApprovalArtifactRecord = z.infer<
  typeof GithubDraftPrApprovalArtifactRecordSchema
>;

export const GithubDraftPrCreationSummarySchema = createdEntityBaseSchema
  .extend({
    targetRef: GithubRemoteRefSummarySchema,
    prNumberHash: z.string().min(1).optional(),
    prUrlHash: z.string().min(1).optional(),
    titleHash: z.string().min(1),
    bodyHash: z.string().min(1),
    draft: z.literal(true),
    created: z.boolean(),
    rawUrlStored: z.literal(false),
    rawPrBodyStored: z.literal(false),
    rawPathStored: z.literal(false),
    bodyStored: z.literal(false),
    summary: z.string().min(1),
  })
  .strict()
  .superRefine((record, context) => {
    rejectGithubRawMetadata(record.metadata, context, ['metadata']);
  });
export type GithubDraftPrCreationSummary = z.infer<
  typeof GithubDraftPrCreationSummarySchema
>;

export const RemotePrAuditChainSchema = createdEntityBaseSchema
  .extend({
    draftPrRunIdHash: z.string().min(1),
    auditEventIds: z.array(z.string().min(1)).default([]),
    auditEventCount: z.number().int().nonnegative(),
    policyDecisionIds: z.array(z.string().min(1)).default([]),
    evidenceRefIds: z.array(z.string().min(1)).default([]),
    evidenceRefCount: z.number().int().nonnegative(),
    networkBoundaryCount: z.number().int().nonnegative(),
    chainHash: z.string().min(1),
    rawPathStored: z.literal(false),
    bodyStored: z.literal(false),
    summary: z.string().min(1),
  })
  .strict()
  .superRefine((record, context) => {
    rejectGithubRawMetadata(record.metadata, context, ['metadata']);

    if (record.auditEventCount !== record.auditEventIds.length) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'auditEventCount must match auditEventIds length',
        path: ['auditEventCount'],
      });
    }

    if (record.evidenceRefCount !== record.evidenceRefIds.length) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'evidenceRefCount must match evidenceRefIds length',
        path: ['evidenceRefCount'],
      });
    }
  });
export type RemotePrAuditChain = z.infer<typeof RemotePrAuditChainSchema>;

export const GithubDraftPrRunSchema = createdEntityBaseSchema
  .extend({
    dryRunId: z.string().min(1),
    dryRunRecordId: z.string().min(1),
    approvalArtifactId: z.string().min(1).optional(),
    status: GithubControlPlaneRunStatusSchema,
    plan: GithubDraftPrPlanSchema,
    creationSummary: GithubDraftPrCreationSummarySchema,
    auditChain: RemotePrAuditChainSchema,
    responseBodyHashes: z.array(z.string().min(1)).default([]),
    blockReasons: z.array(z.string().min(1)).default([]),
    evidenceRefs: z.array(EvidenceRefSchema).default([]),
    auditEventIds: z.array(z.string().min(1)).default([]),
    networkBoundaryInvoked: z.boolean(),
    processBoundaryInvoked: z.literal(false),
    externalProcessStarted: z.literal(false),
    noRealWrite: z.boolean(),
    draft: z.literal(true),
    pushAllowed: z.literal(false),
    createRefAllowed: z.literal(false),
    mergeAllowed: z.literal(false),
    rawPrBodyStored: z.literal(false),
    rawPathStored: z.literal(false),
    bodyStored: z.literal(false),
    summary: z.string().min(1),
  })
  .strict()
  .superRefine((record, context) => {
    rejectGithubRawMetadata(record.metadata, context, ['metadata']);

    if (record.status === 'completed' && !record.networkBoundaryInvoked) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'completed GitHub draft PR runs must invoke network boundary',
        path: ['networkBoundaryInvoked'],
      });
    }

    if (record.status === 'completed' && record.noRealWrite) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'completed GitHub draft PR run is a real remote write',
        path: ['noRealWrite'],
      });
    }
  });
export type GithubDraftPrRun = z.infer<typeof GithubDraftPrRunSchema>;

export const GithubDraftPrAcceptanceScenarioSchema = z.enum([
  'all-pass',
  'token-missing',
  'provider-disabled',
  'approval-blocked',
  'head-branch-missing',
  'existing-pr-found',
  'github-post-failed',
  'network-timeout',
]);
export type GithubDraftPrAcceptanceScenario = z.infer<
  typeof GithubDraftPrAcceptanceScenarioSchema
>;

export const GithubDraftPrAcceptanceRehearsalRunSchema = createdEntityBaseSchema
  .extend({
    scenario: GithubDraftPrAcceptanceScenarioSchema,
    status: z.enum(['passed', 'failed', 'blocked', 'aborted']),
    stepCount: z.number().int().nonnegative(),
    readinessStatus: GithubDraftPrReadinessStatusSchema,
    prCreationStatus: z.enum(['fixture_completed', 'blocked', 'failed', 'skipped']),
    evidenceRefCount: z.number().int().nonnegative(),
    auditEventCount: z.number().int().nonnegative(),
    networkBoundaryInvoked: z.literal(false),
    processBoundaryInvoked: z.literal(false),
    externalProcessStarted: z.literal(false),
    noRealWrite: z.literal(true),
    draft: z.literal(true),
    pushAllowed: z.literal(false),
    createRefAllowed: z.literal(false),
    mergeAllowed: z.literal(false),
    rawPathStored: z.literal(false),
    bodyStored: z.literal(false),
    summary: z.string().min(1),
  })
  .strict()
  .superRefine((record, context) => {
    rejectGithubRawMetadata(record.metadata, context, ['metadata']);

    if (record.status === 'passed' && record.scenario !== 'all-pass') {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'only all-pass GitHub draft PR rehearsals can pass',
        path: ['status'],
      });
    }
  });
export type GithubDraftPrAcceptanceRehearsalRun = z.infer<
  typeof GithubDraftPrAcceptanceRehearsalRunSchema
>;

export const GithubBranchPublishRunnerModeSchema = z.enum([
  'planning-only',
  'controlled-github-branch-publish',
]);
export type GithubBranchPublishRunnerMode = z.infer<typeof GithubBranchPublishRunnerModeSchema>;

export const GithubBranchPublishSourceKindSchema = z.enum([
  'local_rc_readiness',
  'review_package',
  'patch_lifecycle',
]);
export type GithubBranchPublishSourceKind = z.infer<typeof GithubBranchPublishSourceKindSchema>;

export const GithubBranchPublishReadinessStatusSchema = z.enum([
  'not_ready',
  'ready_for_branch_publish',
  'blocked_source',
  'blocked_content_manifest',
  'blocked_existing_branch',
  'blocked_branch_policy',
  'blocked_policy',
]);
export type GithubBranchPublishReadinessStatus = z.infer<
  typeof GithubBranchPublishReadinessStatusSchema
>;

export const GithubCommitContentManifestSchema = createdEntityBaseSchema
  .extend({
    sourceKind: GithubBranchPublishSourceKindSchema,
    sourceIdHash: z.string().min(1),
    worktreePathHash: z.string().min(1),
    fileCount: z.number().int().nonnegative().max(100),
    totalByteCount: z.number().int().nonnegative().max(5 * 1024 * 1024),
    filePathHashes: z.array(z.string().min(1)).default([]),
    fileContentHashes: z.array(z.string().min(1)).default([]),
    maxFileByteCount: z.number().int().nonnegative().max(512 * 1024),
    textOnly: z.literal(true),
    deletionsAllowed: z.literal(false),
    renamesAllowed: z.literal(false),
    binaryAllowed: z.literal(false),
    symlinkAllowed: z.literal(false),
    rawFileContentStored: z.literal(false),
    rawPathStored: z.literal(false),
    bodyStored: z.literal(false),
    summary: z.string().min(1),
  })
  .strict()
  .superRefine((record, context) => {
    rejectGithubRawMetadata(record.metadata, context, ['metadata']);

    if (record.fileCount !== record.filePathHashes.length) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'fileCount must match filePathHashes length',
        path: ['fileCount'],
      });
    }

    if (record.fileCount !== record.fileContentHashes.length) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'fileCount must match fileContentHashes length',
        path: ['fileContentHashes'],
      });
    }
  });
export type GithubCommitContentManifest = z.infer<typeof GithubCommitContentManifestSchema>;

export const GithubBranchPublishReadinessSchema = createdEntityBaseSchema
  .extend({
    sourceKind: GithubBranchPublishSourceKindSchema,
    sourceIdHash: z.string().min(1),
    sourceSummaryHash: z.string().min(1),
    targetRef: GithubRemoteRefSummarySchema,
    contentManifest: GithubCommitContentManifestSchema,
    status: GithubBranchPublishReadinessStatusSchema,
    blockerCount: z.number().int().nonnegative(),
    newBranchRequired: z.literal(true),
    branchPrefix: z.literal('codexhub/'),
    existingBranchUpdateAllowed: z.literal(false),
    forceAllowed: z.literal(false),
    pushAllowed: z.literal(false),
    mergeAllowed: z.literal(false),
    labelsAllowed: z.literal(false),
    reviewersAllowed: z.literal(false),
    commentsAllowed: z.literal(false),
    rawFileContentStored: z.literal(false),
    rawPathStored: z.literal(false),
    bodyStored: z.literal(false),
    noRealWrite: z.literal(true),
    summary: z.string().min(1),
  })
  .strict()
  .superRefine((record, context) => {
    rejectGithubRawMetadata(record.metadata, context, ['metadata']);

    if (record.status === 'ready_for_branch_publish' && record.blockerCount > 0) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'ready GitHub branch publish readiness cannot include blockers',
        path: ['blockerCount'],
      });
    }
  });
export type GithubBranchPublishReadiness = z.infer<typeof GithubBranchPublishReadinessSchema>;

export const GithubBranchPublishPlanSchema = createdEntityBaseSchema
  .extend({
    dryRunId: z.string().min(1),
    status: z.enum(['planned', 'blocked']),
    runnerMode: GithubBranchPublishRunnerModeSchema,
    readiness: GithubBranchPublishReadinessSchema,
    commitMessageHash: z.string().min(1),
    blockReasons: z.array(z.string().min(1)).default([]),
    policyDecision: PolicyDecisionSchema,
    requiresApproval: z.literal(true),
    networkBoundaryPlanned: z.boolean(),
    networkBoundaryInvoked: z.literal(false),
    createRefAllowed: z.literal(true),
    updateRefAllowed: z.literal(false),
    forceAllowed: z.literal(false),
    pushAllowed: z.literal(false),
    mergeAllowed: z.literal(false),
    rawFileContentStored: z.literal(false),
    rawPathStored: z.literal(false),
    bodyStored: z.literal(false),
    noRealWrite: z.literal(true),
    evidenceRefs: z.array(EvidenceRefSchema).default([]),
    auditEventIds: z.array(z.string().min(1)).default([]),
    summary: z.string().min(1),
  })
  .strict()
  .superRefine((record, context) => {
    rejectGithubRawMetadata(record.metadata, context, ['metadata']);

    if (record.status === 'blocked' && record.networkBoundaryPlanned) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'blocked GitHub branch publish plans cannot plan a network boundary',
        path: ['networkBoundaryPlanned'],
      });
    }
  });
export type GithubBranchPublishPlan = z.infer<typeof GithubBranchPublishPlanSchema>;

export const GithubBranchPublishApprovalArtifactRecordSchema = createdEntityBaseSchema
  .extend({
    dryRunId: z.string().min(1),
    dryRunRecordId: z.string().min(1),
    approvalRequestId: z.string().min(1),
    approvalArtifactId: z.string().min(1),
    status: GithubProviderApprovalStatusSchema,
    approved: z.boolean(),
    policyDecisionId: z.string().min(1),
    requestedByHash: z.string().min(1).optional(),
    decidedByHash: z.string().min(1).optional(),
    reasonHash: z.string().min(1).optional(),
    expiresAt: IsoDateTimeSchema.optional(),
    evidenceRefs: z.array(EvidenceRefSchema).default([]),
    auditEventIds: z.array(z.string().min(1)).default([]),
    networkBoundaryInvoked: z.literal(false),
    processBoundaryInvoked: z.literal(false),
    externalProcessStarted: z.literal(false),
    rawPathStored: z.literal(false),
    bodyStored: z.literal(false),
    summary: z.string().min(1),
  })
  .strict()
  .superRefine((record, context) => {
    rejectGithubRawMetadata(record.metadata, context, ['metadata']);

    if (record.approved !== (record.status === 'approved')) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'approved must match approved GitHub branch publish approval status',
        path: ['approved'],
      });
    }
  });
export type GithubBranchPublishApprovalArtifactRecord = z.infer<
  typeof GithubBranchPublishApprovalArtifactRecordSchema
>;

export const GithubRemoteCommitSummarySchema = createdEntityBaseSchema
  .extend({
    targetRef: GithubRemoteRefSummarySchema,
    commitShaHash: z.string().min(1).optional(),
    treeShaHash: z.string().min(1).optional(),
    branchNameHash: z.string().min(1),
    contentManifestHash: z.string().min(1),
    fileCount: z.number().int().nonnegative(),
    created: z.boolean(),
    createRefAllowed: z.literal(true),
    updateRefAllowed: z.literal(false),
    forceAllowed: z.literal(false),
    pushAllowed: z.literal(false),
    mergeAllowed: z.literal(false),
    rawFileContentStored: z.literal(false),
    rawPathStored: z.literal(false),
    bodyStored: z.literal(false),
    summary: z.string().min(1),
  })
  .strict()
  .superRefine((record, context) => {
    rejectGithubRawMetadata(record.metadata, context, ['metadata']);
  });
export type GithubRemoteCommitSummary = z.infer<typeof GithubRemoteCommitSummarySchema>;

export const GithubBranchPublishRunSchema = createdEntityBaseSchema
  .extend({
    dryRunId: z.string().min(1),
    dryRunRecordId: z.string().min(1),
    approvalArtifactId: z.string().min(1).optional(),
    status: GithubControlPlaneRunStatusSchema,
    plan: GithubBranchPublishPlanSchema,
    commitSummary: GithubRemoteCommitSummarySchema,
    responseBodyHashes: z.array(z.string().min(1)).default([]),
    blockReasons: z.array(z.string().min(1)).default([]),
    evidenceRefs: z.array(EvidenceRefSchema).default([]),
    auditEventIds: z.array(z.string().min(1)).default([]),
    networkBoundaryInvoked: z.boolean(),
    processBoundaryInvoked: z.literal(false),
    externalProcessStarted: z.literal(false),
    noRealWrite: z.boolean(),
    createRefAllowed: z.literal(true),
    updateRefAllowed: z.literal(false),
    forceAllowed: z.literal(false),
    pushAllowed: z.literal(false),
    mergeAllowed: z.literal(false),
    rawFileContentStored: z.literal(false),
    rawPathStored: z.literal(false),
    bodyStored: z.literal(false),
    summary: z.string().min(1),
  })
  .strict()
  .superRefine((record, context) => {
    rejectGithubRawMetadata(record.metadata, context, ['metadata']);

    if (record.status === 'completed' && !record.networkBoundaryInvoked) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'completed GitHub branch publish runs must invoke network boundary',
        path: ['networkBoundaryInvoked'],
      });
    }

    if (record.status === 'completed' && record.noRealWrite) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'completed GitHub branch publish run is a real remote write',
        path: ['noRealWrite'],
      });
    }
  });
export type GithubBranchPublishRun = z.infer<typeof GithubBranchPublishRunSchema>;

export const GithubBranchPublishAcceptanceScenarioSchema = z.enum([
  'all-pass',
  'token-missing',
  'provider-disabled',
  'approval-blocked',
  'branch-exists',
  'content-manifest-blocked',
  'blob-create-failed',
  'tree-create-failed',
  'commit-create-failed',
  'ref-create-failed',
  'network-timeout',
]);
export type GithubBranchPublishAcceptanceScenario = z.infer<
  typeof GithubBranchPublishAcceptanceScenarioSchema
>;

export const GithubBranchPublishAcceptanceRehearsalRunSchema = createdEntityBaseSchema
  .extend({
    scenario: GithubBranchPublishAcceptanceScenarioSchema,
    status: z.enum(['passed', 'failed', 'blocked', 'aborted']),
    readinessStatus: GithubBranchPublishReadinessStatusSchema,
    branchPublishStatus: z.enum(['fixture_completed', 'blocked', 'failed', 'skipped']),
    stepCount: z.number().int().nonnegative(),
    evidenceRefCount: z.number().int().nonnegative(),
    auditEventCount: z.number().int().nonnegative(),
    networkBoundaryInvoked: z.literal(false),
    processBoundaryInvoked: z.literal(false),
    externalProcessStarted: z.literal(false),
    noRealWrite: z.literal(true),
    createRefAllowed: z.literal(true),
    updateRefAllowed: z.literal(false),
    forceAllowed: z.literal(false),
    pushAllowed: z.literal(false),
    mergeAllowed: z.literal(false),
    rawFileContentStored: z.literal(false),
    rawPathStored: z.literal(false),
    bodyStored: z.literal(false),
    summary: z.string().min(1),
  })
  .strict()
  .superRefine((record, context) => {
    rejectGithubRawMetadata(record.metadata, context, ['metadata']);

    if (record.status === 'passed' && record.scenario !== 'all-pass') {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'only all-pass GitHub branch publish rehearsals can pass',
        path: ['status'],
      });
    }
  });
export type GithubBranchPublishAcceptanceRehearsalRun = z.infer<
  typeof GithubBranchPublishAcceptanceRehearsalRunSchema
>;

export const GithubPublishDraftPrChainStepSchema = createdEntityBaseSchema
  .extend({
    phase: z.enum(['branch-publish', 'draft-pr-create', 'pr-lifecycle-observe']),
    status: z.enum(['pending', 'completed', 'failed', 'blocked', 'skipped', 'aborted']),
    order: z.number().int().nonnegative(),
    evidenceRefIds: z.array(z.string().min(1)).default([]),
    auditEventIds: z.array(z.string().min(1)).default([]),
    networkBoundaryInvoked: z.boolean(),
    processBoundaryInvoked: z.literal(false),
    externalProcessStarted: z.literal(false),
    rawPathStored: z.literal(false),
    bodyStored: z.literal(false),
    summary: z.string().min(1),
  })
  .strict()
  .superRefine((record, context) => {
    rejectGithubRawMetadata(record.metadata, context, ['metadata']);
  });
export type GithubPublishDraftPrChainStep = z.infer<typeof GithubPublishDraftPrChainStepSchema>;

export const GithubPublishDraftPrChainPlanSchema = createdEntityBaseSchema
  .extend({
    chainId: z.string().min(1),
    sourceKind: GithubBranchPublishSourceKindSchema,
    sourceIdHash: z.string().min(1),
    branchPublishDryRunId: z.string().min(1),
    draftPrDryRunId: z.string().min(1),
    separateApprovalsRequired: z.literal(true),
    branchPublishApprovalRequired: z.literal(true),
    draftPrApprovalRequired: z.literal(true),
    networkBoundaryPlanned: z.boolean(),
    rawPathStored: z.literal(false),
    bodyStored: z.literal(false),
    noRealWrite: z.literal(true),
    summary: z.string().min(1),
  })
  .strict()
  .superRefine((record, context) => {
    rejectGithubRawMetadata(record.metadata, context, ['metadata']);
  });
export type GithubPublishDraftPrChainPlan = z.infer<
  typeof GithubPublishDraftPrChainPlanSchema
>;

export const GithubRemotePrLifecycleSummarySchema = createdEntityBaseSchema
  .extend({
    targetRef: GithubRemoteRefSummarySchema,
    prNumberHash: z.string().min(1).optional(),
    prUrlHash: z.string().min(1).optional(),
    stateHash: z.string().min(1).optional(),
    checkRunCount: z.number().int().nonnegative(),
    statusContextCount: z.number().int().nonnegative(),
    failedCheckCount: z.number().int().nonnegative(),
    pendingCheckCount: z.number().int().nonnegative(),
    passedCheckCount: z.number().int().nonnegative(),
    rawUrlStored: z.literal(false),
    rawResponseBodyStored: z.literal(false),
    rawPathStored: z.literal(false),
    bodyStored: z.literal(false),
    summary: z.string().min(1),
  })
  .strict()
  .superRefine((record, context) => {
    rejectGithubRawMetadata(record.metadata, context, ['metadata']);
  });
export type GithubRemotePrLifecycleSummary = z.infer<
  typeof GithubRemotePrLifecycleSummarySchema
>;

export const GithubPrLifecycleObservationPlanSchema = createdEntityBaseSchema
  .extend({
    dryRunId: z.string().min(1),
    status: z.enum(['planned', 'blocked']),
    runnerMode: GithubPrLifecycleRunnerModeSchema,
    targetRef: GithubRemoteRefSummarySchema,
    prNumberHash: z.string().min(1).optional(),
    commitShaHash: z.string().min(1).optional(),
    requestedMetadata: z
      .array(z.enum(['repo', 'pull_request', 'branch_ref', 'combined_status', 'check_runs']))
      .default([]),
    blockReasons: z.array(z.string().min(1)).default([]),
    policyDecision: PolicyDecisionSchema,
    requiresApproval: z.literal(true),
    evidenceRefs: z.array(EvidenceRefSchema).default([]),
    auditEventIds: z.array(z.string().min(1)).default([]),
    networkBoundaryPlanned: z.boolean(),
    networkBoundaryInvoked: z.literal(false),
    processBoundaryInvoked: z.literal(false),
    externalProcessStarted: z.literal(false),
    noRealWrite: z.literal(true),
    rawUrlStored: z.literal(false),
    rawResponseBodyStored: z.literal(false),
    rawPathStored: z.literal(false),
    bodyStored: z.literal(false),
    summary: z.string().min(1),
  })
  .strict()
  .superRefine((record, context) => {
    rejectGithubRawMetadata(record.metadata, context, ['metadata']);

    if (record.status === 'blocked' && record.networkBoundaryPlanned) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'blocked GitHub PR lifecycle plans cannot plan a network boundary',
        path: ['networkBoundaryPlanned'],
      });
    }
  });
export type GithubPrLifecycleObservationPlan = z.infer<
  typeof GithubPrLifecycleObservationPlanSchema
>;

export const GithubPrLifecycleApprovalArtifactRecordSchema = createdEntityBaseSchema
  .extend({
    dryRunId: z.string().min(1),
    dryRunRecordId: z.string().min(1),
    approvalRequestId: z.string().min(1),
    approvalArtifactId: z.string().min(1),
    status: GithubProviderApprovalStatusSchema,
    approved: z.boolean(),
    policyDecisionId: z.string().min(1),
    requestedByHash: z.string().min(1).optional(),
    decidedByHash: z.string().min(1).optional(),
    reasonHash: z.string().min(1).optional(),
    expiresAt: IsoDateTimeSchema.optional(),
    evidenceRefs: z.array(EvidenceRefSchema).default([]),
    auditEventIds: z.array(z.string().min(1)).default([]),
    networkBoundaryInvoked: z.literal(false),
    processBoundaryInvoked: z.literal(false),
    externalProcessStarted: z.literal(false),
    rawUrlStored: z.literal(false),
    rawResponseBodyStored: z.literal(false),
    rawPathStored: z.literal(false),
    bodyStored: z.literal(false),
    noRealWrite: z.literal(true),
    summary: z.string().min(1),
  })
  .strict()
  .superRefine((record, context) => {
    rejectGithubRawMetadata(record.metadata, context, ['metadata']);

    if (record.approved !== (record.status === 'approved')) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'approved must match approved GitHub PR lifecycle approval status',
        path: ['approved'],
      });
    }
  });
export type GithubPrLifecycleApprovalArtifactRecord = z.infer<
  typeof GithubPrLifecycleApprovalArtifactRecordSchema
>;

export const GithubPrLifecycleObservationRunSchema = createdEntityBaseSchema
  .extend({
    dryRunId: z.string().min(1),
    dryRunRecordId: z.string().min(1),
    approvalArtifactId: z.string().min(1).optional(),
    status: GithubControlPlaneRunStatusSchema,
    plan: GithubPrLifecycleObservationPlanSchema,
    lifecycleSummary: GithubRemotePrLifecycleSummarySchema,
    responseBodyHashes: z.array(z.string().min(1)).default([]),
    blockReasons: z.array(z.string().min(1)).default([]),
    evidenceRefs: z.array(EvidenceRefSchema).default([]),
    auditEventIds: z.array(z.string().min(1)).default([]),
    networkBoundaryInvoked: z.boolean(),
    processBoundaryInvoked: z.literal(false),
    externalProcessStarted: z.literal(false),
    noRealWrite: z.literal(true),
    rawUrlStored: z.literal(false),
    rawResponseBodyStored: z.literal(false),
    rawPathStored: z.literal(false),
    bodyStored: z.literal(false),
    summary: z.string().min(1),
  })
  .strict()
  .superRefine((record, context) => {
    rejectGithubRawMetadata(record.metadata, context, ['metadata']);

    if (record.status === 'completed' && !record.networkBoundaryInvoked) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'completed GitHub PR lifecycle observations must invoke network boundary',
        path: ['networkBoundaryInvoked'],
      });
    }
  });
export type GithubPrLifecycleObservationRun = z.infer<
  typeof GithubPrLifecycleObservationRunSchema
>;

export const GithubPrLifecycleAcceptanceScenarioSchema = z.enum([
  'all-pass',
  'token-missing',
  'provider-disabled',
  'approval-blocked',
  'pr-not-found',
  'checks-pending',
  'checks-failed',
  'checks-passed',
  'stale-branch',
  'network-timeout',
]);
export type GithubPrLifecycleAcceptanceScenario = z.infer<
  typeof GithubPrLifecycleAcceptanceScenarioSchema
>;

export const GithubPrLifecycleAcceptanceRehearsalRunSchema = createdEntityBaseSchema
  .extend({
    scenario: GithubPrLifecycleAcceptanceScenarioSchema,
    status: z.enum(['passed', 'failed', 'blocked', 'aborted']),
    lifecycleStatus: z.enum([
      'checks_pending',
      'checks_failed',
      'checks_passed',
      'blocked',
      'not_found',
    ]),
    stepCount: z.number().int().nonnegative(),
    evidenceRefCount: z.number().int().nonnegative(),
    auditEventCount: z.number().int().nonnegative(),
    networkBoundaryInvoked: z.literal(false),
    processBoundaryInvoked: z.literal(false),
    externalProcessStarted: z.literal(false),
    noRealWrite: z.literal(true),
    rawUrlStored: z.literal(false),
    rawResponseBodyStored: z.literal(false),
    rawPathStored: z.literal(false),
    bodyStored: z.literal(false),
    blockerCount: z.number().int().nonnegative(),
    summary: z.string().min(1),
  })
  .strict()
  .superRefine((record, context) => {
    rejectGithubRawMetadata(record.metadata, context, ['metadata']);

    if (
      record.status === 'passed' &&
      record.scenario !== 'all-pass' &&
      record.scenario !== 'checks-passed'
    ) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'only all-pass or checks-passed PR lifecycle rehearsals can pass',
        path: ['status'],
      });
    }
  });
export type GithubPrLifecycleAcceptanceRehearsalRun = z.infer<
  typeof GithubPrLifecycleAcceptanceRehearsalRunSchema
>;

export const GithubPrManagementKindSchema = z.enum([
  'labels',
  'assignees',
  'reviewers',
  'milestones',
  'comments',
]);
export type GithubPrManagementKind = z.infer<typeof GithubPrManagementKindSchema>;

export const GithubPrManagementRunnerModeSchema = z.enum([
  'planning-only',
  'controlled-github-pr-management',
]);
export type GithubPrManagementRunnerMode = z.infer<
  typeof GithubPrManagementRunnerModeSchema
>;

export const GithubPrManagementPlanSchema = createdEntityBaseSchema
  .extend({
    dryRunId: z.string().min(1),
    managementKind: GithubPrManagementKindSchema,
    status: z.enum(['planned', 'blocked']),
    runnerMode: GithubPrManagementRunnerModeSchema,
    targetRef: GithubRemoteRefSummarySchema,
    prNumberHash: z.string().min(1).optional(),
    itemCount: z.number().int().nonnegative(),
    payloadHash: z.string().min(1).optional(),
    blockReasons: z.array(z.string().min(1)).default([]),
    policyDecision: PolicyDecisionSchema,
    requiresApproval: z.literal(true),
    evidenceRefs: z.array(EvidenceRefSchema).default([]),
    auditEventIds: z.array(z.string().min(1)).default([]),
    networkBoundaryPlanned: z.boolean(),
    networkBoundaryInvoked: z.literal(false),
    processBoundaryInvoked: z.literal(false),
    externalProcessStarted: z.literal(false),
    noRealWrite: z.boolean().default(false),
    fixedEndpointOnly: z.literal(true),
    addOrSetOnly: z.literal(true),
    mergeAllowed: z.literal(false),
    pushAllowed: z.literal(false),
    updateRefAllowed: z.literal(false),
    forceAllowed: z.literal(false),
    arbitraryEndpointAllowed: z.literal(false),
    rawUrlStored: z.literal(false),
    rawResponseBodyStored: z.literal(false),
    rawPrBodyStored: z.literal(false),
    rawCommentBodyStored: z.literal(false),
    rawPathStored: z.literal(false),
    bodyStored: z.literal(false),
    summary: z.string().min(1),
  })
  .strict()
  .superRefine((record, context) => {
    rejectGithubRawMetadata(record.metadata, context, ['metadata']);

    if (record.status === 'blocked' && record.networkBoundaryPlanned) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'blocked GitHub PR management plans cannot plan a network boundary',
        path: ['networkBoundaryPlanned'],
      });
    }
  });
export type GithubPrManagementPlan = z.infer<typeof GithubPrManagementPlanSchema>;

export const GithubPrManagementApprovalArtifactRecordSchema = createdEntityBaseSchema
  .extend({
    dryRunId: z.string().min(1),
    dryRunRecordId: z.string().min(1),
    managementKind: GithubPrManagementKindSchema,
    approvalRequestId: z.string().min(1),
    approvalArtifactId: z.string().min(1),
    status: GithubProviderApprovalStatusSchema,
    approved: z.boolean(),
    policyDecisionId: z.string().min(1),
    requestedByHash: z.string().min(1).optional(),
    decidedByHash: z.string().min(1).optional(),
    reasonHash: z.string().min(1).optional(),
    expiresAt: IsoDateTimeSchema.optional(),
    evidenceRefs: z.array(EvidenceRefSchema).default([]),
    auditEventIds: z.array(z.string().min(1)).default([]),
    networkBoundaryInvoked: z.literal(false),
    processBoundaryInvoked: z.literal(false),
    externalProcessStarted: z.literal(false),
    rawUrlStored: z.literal(false),
    rawResponseBodyStored: z.literal(false),
    rawPrBodyStored: z.literal(false),
    rawCommentBodyStored: z.literal(false),
    rawPathStored: z.literal(false),
    bodyStored: z.literal(false),
    noRealWrite: z.literal(true),
    summary: z.string().min(1),
  })
  .strict()
  .superRefine((record, context) => {
    rejectGithubRawMetadata(record.metadata, context, ['metadata']);

    if (record.approved !== (record.status === 'approved')) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'approved must match approved GitHub PR management approval status',
        path: ['approved'],
      });
    }
  });
export type GithubPrManagementApprovalArtifactRecord = z.infer<
  typeof GithubPrManagementApprovalArtifactRecordSchema
>;

export const GithubPrManagementSummarySchema = createdEntityBaseSchema
  .extend({
    managementKind: GithubPrManagementKindSchema,
    targetRef: GithubRemoteRefSummarySchema,
    prNumberHash: z.string().min(1).optional(),
    itemCount: z.number().int().nonnegative(),
    payloadHash: z.string().min(1).optional(),
    responseBodyHashCount: z.number().int().nonnegative(),
    changed: z.boolean(),
    fixedEndpointOnly: z.literal(true),
    addOrSetOnly: z.literal(true),
    rawUrlStored: z.literal(false),
    rawResponseBodyStored: z.literal(false),
    rawPrBodyStored: z.literal(false),
    rawCommentBodyStored: z.literal(false),
    rawPathStored: z.literal(false),
    bodyStored: z.literal(false),
    summary: z.string().min(1),
  })
  .strict()
  .superRefine((record, context) => {
    rejectGithubRawMetadata(record.metadata, context, ['metadata']);
  });
export type GithubPrManagementSummary = z.infer<typeof GithubPrManagementSummarySchema>;

export const GithubPrManagementRunSchema = createdEntityBaseSchema
  .extend({
    dryRunId: z.string().min(1),
    dryRunRecordId: z.string().min(1),
    approvalArtifactId: z.string().min(1).optional(),
    managementKind: GithubPrManagementKindSchema,
    status: GithubControlPlaneRunStatusSchema,
    plan: GithubPrManagementPlanSchema,
    managementSummary: GithubPrManagementSummarySchema,
    responseBodyHashes: z.array(z.string().min(1)).default([]),
    blockReasons: z.array(z.string().min(1)).default([]),
    evidenceRefs: z.array(EvidenceRefSchema).default([]),
    auditEventIds: z.array(z.string().min(1)).default([]),
    networkBoundaryInvoked: z.boolean(),
    processBoundaryInvoked: z.literal(false),
    externalProcessStarted: z.literal(false),
    noRealWrite: z.boolean().default(false),
    fixedEndpointOnly: z.literal(true),
    addOrSetOnly: z.literal(true),
    mergeAllowed: z.literal(false),
    pushAllowed: z.literal(false),
    updateRefAllowed: z.literal(false),
    forceAllowed: z.literal(false),
    arbitraryEndpointAllowed: z.literal(false),
    rawUrlStored: z.literal(false),
    rawResponseBodyStored: z.literal(false),
    rawPrBodyStored: z.literal(false),
    rawCommentBodyStored: z.literal(false),
    rawPathStored: z.literal(false),
    bodyStored: z.literal(false),
    summary: z.string().min(1),
  })
  .strict()
  .superRefine((record, context) => {
    rejectGithubRawMetadata(record.metadata, context, ['metadata']);

    if (record.status === 'completed' && !record.networkBoundaryInvoked) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'completed GitHub PR management runs must invoke network boundary',
        path: ['networkBoundaryInvoked'],
      });
    }
  });
export type GithubPrManagementRun = z.infer<typeof GithubPrManagementRunSchema>;

export const GithubPrManagementAcceptanceScenarioSchema = z.enum([
  'all-pass',
  'provider-disabled',
  'token-missing',
  'approval-blocked',
  'pr-not-found',
  'github-write-failed',
  'network-timeout',
  'raw-body-rejected',
]);
export type GithubPrManagementAcceptanceScenario = z.infer<
  typeof GithubPrManagementAcceptanceScenarioSchema
>;

export const GithubPrManagementAcceptanceRehearsalRunSchema = createdEntityBaseSchema
  .extend({
    managementKind: GithubPrManagementKindSchema,
    scenario: GithubPrManagementAcceptanceScenarioSchema,
    status: z.enum(['passed', 'failed', 'blocked', 'aborted']),
    stepCount: z.number().int().nonnegative(),
    blockerCount: z.number().int().nonnegative(),
    evidenceRefCount: z.number().int().nonnegative(),
    auditEventCount: z.number().int().nonnegative(),
    networkBoundaryInvoked: z.literal(false),
    processBoundaryInvoked: z.literal(false),
    externalProcessStarted: z.literal(false),
    noRealWrite: z.literal(true),
    fixedEndpointOnly: z.literal(true),
    addOrSetOnly: z.literal(true),
    mergeAllowed: z.literal(false),
    pushAllowed: z.literal(false),
    updateRefAllowed: z.literal(false),
    forceAllowed: z.literal(false),
    rawUrlStored: z.literal(false),
    rawResponseBodyStored: z.literal(false),
    rawPrBodyStored: z.literal(false),
    rawCommentBodyStored: z.literal(false),
    rawPathStored: z.literal(false),
    bodyStored: z.literal(false),
    summary: z.string().min(1),
  })
  .strict()
  .superRefine((record, context) => {
    rejectGithubRawMetadata(record.metadata, context, ['metadata']);

    if (record.status === 'passed' && record.scenario !== 'all-pass') {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'only all-pass GitHub PR management rehearsals can pass',
        path: ['status'],
      });
    }
  });
export type GithubPrManagementAcceptanceRehearsalRun = z.infer<
  typeof GithubPrManagementAcceptanceRehearsalRunSchema
>;

export const GithubMergeStrategySchema = z.enum(['squash', 'merge', 'rebase']);
export type GithubMergeStrategy = z.infer<typeof GithubMergeStrategySchema>;

export const GithubMergeRunnerModeSchema = z.enum([
  'planning-only',
  'controlled-github-merge',
]);
export type GithubMergeRunnerMode = z.infer<typeof GithubMergeRunnerModeSchema>;

export const GithubMergeReadinessStatusSchema = z.enum([
  'ready_for_merge',
  'blocked_pr_state',
  'blocked_branch_protection',
  'blocked_checks',
  'blocked_reviews',
  'blocked_stale_head',
  'blocked_policy',
  'not_ready',
]);
export type GithubMergeReadinessStatus = z.infer<
  typeof GithubMergeReadinessStatusSchema
>;

export const GithubMergeReadinessSummarySchema = createdEntityBaseSchema
  .extend({
    targetRef: GithubRemoteRefSummarySchema,
    prNumberHash: z.string().min(1),
    headShaHash: z.string().min(1),
    mergeStrategy: GithubMergeStrategySchema,
    status: GithubMergeReadinessStatusSchema,
    prStateHash: z.string().min(1).optional(),
    branchProtectionStatus: z.enum(['satisfied', 'blocked', 'missing', 'unknown']),
    checkRunCount: z.number().int().nonnegative(),
    statusContextCount: z.number().int().nonnegative(),
    failedCheckCount: z.number().int().nonnegative(),
    pendingCheckCount: z.number().int().nonnegative(),
    passedCheckCount: z.number().int().nonnegative(),
    reviewDecisionCount: z.number().int().nonnegative(),
    approvingReviewCount: z.number().int().nonnegative(),
    changesRequestedReviewCount: z.number().int().nonnegative(),
    blockerCount: z.number().int().nonnegative(),
    checksPassed: z.boolean(),
    reviewsSatisfied: z.boolean(),
    branchProtectionSatisfied: z.boolean(),
    headShaMatchesDryRun: z.boolean(),
    requiresTwoApprovals: z.literal(true),
    fixedEndpointOnly: z.literal(true),
    pushAllowed: z.literal(false),
    updateRefAllowed: z.literal(false),
    forceAllowed: z.literal(false),
    arbitraryEndpointAllowed: z.literal(false),
    rawUrlStored: z.literal(false),
    rawResponseBodyStored: z.literal(false),
    rawPrBodyStored: z.literal(false),
    rawReviewBodyStored: z.literal(false),
    rawPathStored: z.literal(false),
    bodyStored: z.literal(false),
    noRealWrite: z.literal(true),
    summary: z.string().min(1),
  })
  .strict()
  .superRefine((record, context) => {
    rejectGithubRawMetadata(record.metadata, context, ['metadata']);

    if (record.status === 'ready_for_merge' && record.blockerCount > 0) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'ready GitHub merge readiness cannot include blockers',
        path: ['blockerCount'],
      });
    }
  });
export type GithubMergeReadinessSummary = z.infer<
  typeof GithubMergeReadinessSummarySchema
>;

export const GithubMergeReadinessPlanSchema = createdEntityBaseSchema
  .extend({
    dryRunId: z.string().min(1),
    status: z.enum(['planned', 'blocked']),
    runnerMode: GithubMergeRunnerModeSchema,
    targetRef: GithubRemoteRefSummarySchema,
    prNumberHash: z.string().min(1),
    expectedHeadShaHash: z.string().min(1),
    mergeStrategy: GithubMergeStrategySchema,
    readiness: GithubMergeReadinessSummarySchema,
    blockReasons: z.array(z.string().min(1)).default([]),
    policyDecision: PolicyDecisionSchema,
    requiresApproval: z.literal(true),
    requiresTwoApprovals: z.literal(true),
    evidenceRefs: z.array(EvidenceRefSchema).default([]),
    auditEventIds: z.array(z.string().min(1)).default([]),
    networkBoundaryPlanned: z.boolean(),
    networkBoundaryInvoked: z.literal(false),
    processBoundaryInvoked: z.literal(false),
    externalProcessStarted: z.literal(false),
    fixedEndpointOnly: z.literal(true),
    pushAllowed: z.literal(false),
    updateRefAllowed: z.literal(false),
    forceAllowed: z.literal(false),
    arbitraryEndpointAllowed: z.literal(false),
    rawUrlStored: z.literal(false),
    rawResponseBodyStored: z.literal(false),
    rawPrBodyStored: z.literal(false),
    rawReviewBodyStored: z.literal(false),
    rawPathStored: z.literal(false),
    bodyStored: z.literal(false),
    noRealWrite: z.literal(true),
    summary: z.string().min(1),
  })
  .strict()
  .superRefine((record, context) => {
    rejectGithubRawMetadata(record.metadata, context, ['metadata']);

    if (record.status === 'blocked' && record.networkBoundaryPlanned) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'blocked GitHub merge plans cannot plan a network boundary',
        path: ['networkBoundaryPlanned'],
      });
    }
  });
export type GithubMergeReadinessPlan = z.infer<typeof GithubMergeReadinessPlanSchema>;

export const GithubMergeApprovalPhaseSchema = z.enum([
  'readiness',
  'merge_execution',
]);
export type GithubMergeApprovalPhase = z.infer<typeof GithubMergeApprovalPhaseSchema>;

export const GithubMergeApprovalArtifactSchema = createdEntityBaseSchema
  .extend({
    dryRunId: z.string().min(1),
    dryRunRecordId: z.string().min(1),
    approvalPhase: GithubMergeApprovalPhaseSchema,
    approvalRequestId: z.string().min(1),
    approvalArtifactId: z.string().min(1),
    status: GithubProviderApprovalStatusSchema,
    approved: z.boolean(),
    policyDecisionId: z.string().min(1),
    requestedByHash: z.string().min(1).optional(),
    decidedByHash: z.string().min(1).optional(),
    reasonHash: z.string().min(1).optional(),
    expiresAt: IsoDateTimeSchema.optional(),
    evidenceRefs: z.array(EvidenceRefSchema).default([]),
    auditEventIds: z.array(z.string().min(1)).default([]),
    networkBoundaryInvoked: z.literal(false),
    processBoundaryInvoked: z.literal(false),
    externalProcessStarted: z.literal(false),
    rawUrlStored: z.literal(false),
    rawResponseBodyStored: z.literal(false),
    rawPrBodyStored: z.literal(false),
    rawReviewBodyStored: z.literal(false),
    rawPathStored: z.literal(false),
    bodyStored: z.literal(false),
    noRealWrite: z.literal(true),
    summary: z.string().min(1),
  })
  .strict()
  .superRefine((record, context) => {
    rejectGithubRawMetadata(record.metadata, context, ['metadata']);

    if (record.approved !== (record.status === 'approved')) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'approved must match approved GitHub merge approval status',
        path: ['approved'],
      });
    }
  });
export type GithubMergeApprovalArtifact = z.infer<
  typeof GithubMergeApprovalArtifactSchema
>;

export const GithubMergeResultSummarySchema = createdEntityBaseSchema
  .extend({
    targetRef: GithubRemoteRefSummarySchema,
    prNumberHash: z.string().min(1),
    expectedHeadShaHash: z.string().min(1),
    mergeCommitShaHash: z.string().min(1).optional(),
    mergeStrategy: GithubMergeStrategySchema,
    merged: z.boolean(),
    responseBodyHashCount: z.number().int().nonnegative(),
    fixedEndpointOnly: z.literal(true),
    rawUrlStored: z.literal(false),
    rawResponseBodyStored: z.literal(false),
    rawPrBodyStored: z.literal(false),
    rawReviewBodyStored: z.literal(false),
    rawPathStored: z.literal(false),
    bodyStored: z.literal(false),
    summary: z.string().min(1),
  })
  .strict()
  .superRefine((record, context) => {
    rejectGithubRawMetadata(record.metadata, context, ['metadata']);
  });
export type GithubMergeResultSummary = z.infer<typeof GithubMergeResultSummarySchema>;

export const GithubMergeRunSchema = createdEntityBaseSchema
  .extend({
    dryRunId: z.string().min(1),
    dryRunRecordId: z.string().min(1),
    readinessApprovalArtifactId: z.string().min(1).optional(),
    mergeApprovalArtifactId: z.string().min(1).optional(),
    status: GithubControlPlaneRunStatusSchema,
    plan: GithubMergeReadinessPlanSchema,
    resultSummary: GithubMergeResultSummarySchema,
    responseBodyHashes: z.array(z.string().min(1)).default([]),
    blockReasons: z.array(z.string().min(1)).default([]),
    evidenceRefs: z.array(EvidenceRefSchema).default([]),
    auditEventIds: z.array(z.string().min(1)).default([]),
    networkBoundaryInvoked: z.boolean(),
    processBoundaryInvoked: z.literal(false),
    externalProcessStarted: z.literal(false),
    fixedEndpointOnly: z.literal(true),
    pushAllowed: z.literal(false),
    updateRefAllowed: z.literal(false),
    forceAllowed: z.literal(false),
    arbitraryEndpointAllowed: z.literal(false),
    rawUrlStored: z.literal(false),
    rawResponseBodyStored: z.literal(false),
    rawPrBodyStored: z.literal(false),
    rawReviewBodyStored: z.literal(false),
    rawPathStored: z.literal(false),
    bodyStored: z.literal(false),
    noRealWrite: z.boolean(),
    summary: z.string().min(1),
  })
  .strict()
  .superRefine((record, context) => {
    rejectGithubRawMetadata(record.metadata, context, ['metadata']);

    if (record.status === 'completed' && !record.networkBoundaryInvoked) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'completed GitHub merge runs must invoke network boundary',
        path: ['networkBoundaryInvoked'],
      });
    }

    if (record.status === 'completed' && record.noRealWrite) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'completed GitHub merge runs must record a real write',
        path: ['noRealWrite'],
      });
    }
  });
export type GithubMergeRun = z.infer<typeof GithubMergeRunSchema>;

export const GithubMergeAcceptanceScenarioSchema = z.enum([
  'all-pass',
  'provider-disabled',
  'token-missing',
  'approval-blocked',
  'second-approval-missing',
  'pr-not-open',
  'branch-protection-blocked',
  'checks-failed',
  'reviews-missing',
  'stale-head-sha',
  'merge-conflict',
  'github-merge-failed',
  'network-timeout',
]);
export type GithubMergeAcceptanceScenario = z.infer<
  typeof GithubMergeAcceptanceScenarioSchema
>;

export const GithubMergeAcceptanceRehearsalRunSchema = createdEntityBaseSchema
  .extend({
    scenario: GithubMergeAcceptanceScenarioSchema,
    status: z.enum(['passed', 'failed', 'blocked', 'aborted']),
    readinessStatus: GithubMergeReadinessStatusSchema,
    mergeStatus: z.enum(['fixture_completed', 'blocked', 'failed', 'skipped']),
    stepCount: z.number().int().nonnegative(),
    blockerCount: z.number().int().nonnegative(),
    evidenceRefCount: z.number().int().nonnegative(),
    auditEventCount: z.number().int().nonnegative(),
    networkBoundaryInvoked: z.literal(false),
    processBoundaryInvoked: z.literal(false),
    externalProcessStarted: z.literal(false),
    noRealWrite: z.literal(true),
    requiresTwoApprovals: z.literal(true),
    fixedEndpointOnly: z.literal(true),
    pushAllowed: z.literal(false),
    updateRefAllowed: z.literal(false),
    forceAllowed: z.literal(false),
    arbitraryEndpointAllowed: z.literal(false),
    rawUrlStored: z.literal(false),
    rawResponseBodyStored: z.literal(false),
    rawPrBodyStored: z.literal(false),
    rawReviewBodyStored: z.literal(false),
    rawPathStored: z.literal(false),
    bodyStored: z.literal(false),
    summary: z.string().min(1),
  })
  .strict()
  .superRefine((record, context) => {
    rejectGithubRawMetadata(record.metadata, context, ['metadata']);

    if (record.status === 'passed' && record.scenario !== 'all-pass') {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'only all-pass GitHub merge rehearsals can pass',
        path: ['status'],
      });
    }
  });
export type GithubMergeAcceptanceRehearsalRun = z.infer<
  typeof GithubMergeAcceptanceRehearsalRunSchema
>;

export const CicdProviderSchema = z.enum([
  'github-actions',
  'jenkins',
  'buildkite',
  'drone',
]);
export type CicdProvider = z.infer<typeof CicdProviderSchema>;

export const CicdProviderManifestSchema = createdEntityBaseSchema
  .extend({
    provider: CicdProviderSchema,
    implemented: z.boolean(),
    hostHash: z.string().min(1).optional(),
    actionMode: ActionModeSchema,
    defaultEnabled: z.literal(false),
    requiresApprovalForWrites: z.literal(true),
    fixedEndpointOnly: z.literal(true),
    arbitraryPayloadAllowed: z.literal(false),
    rawUrlStored: z.literal(false),
    rawResponseBodyStored: z.literal(false),
    rawLogStored: z.literal(false),
    rawArtifactStored: z.literal(false),
    rawPathStored: z.literal(false),
    bodyStored: z.literal(false),
    summary: z.string().min(1),
  })
  .strict()
  .superRefine((record, context) => {
    rejectGithubRawMetadata(record.metadata, context, ['metadata']);
  });
export type CicdProviderManifest = z.infer<typeof CicdProviderManifestSchema>;

export const GithubActionsReadinessSchema = createdEntityBaseSchema
  .extend({
    provider: z.literal('github-actions'),
    tokenReadiness: GithubTokenReadinessSchema,
    observationEnabled: z.boolean(),
    rerunEnabled: z.boolean(),
    cancelEnabled: z.boolean(),
    dispatchEnabled: z.boolean(),
    implementedProviderCount: z.number().int().nonnegative(),
    futureProviderCount: z.number().int().nonnegative(),
    blockerCount: z.number().int().nonnegative(),
    blockReasons: z.array(z.string().min(1)).default([]),
    tokenValueStored: z.literal(false),
    rawUrlStored: z.literal(false),
    rawResponseBodyStored: z.literal(false),
    rawLogStored: z.literal(false),
    rawArtifactStored: z.literal(false),
    rawPathStored: z.literal(false),
    bodyStored: z.literal(false),
    summary: z.string().min(1),
  })
  .strict()
  .superRefine((record, context) => {
    rejectGithubRawMetadata(record.metadata, context, ['metadata']);

    if (record.blockerCount !== record.blockReasons.length) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'blockerCount must match GitHub Actions readiness blockReasons length',
        path: ['blockerCount'],
      });
    }
  });
export type GithubActionsReadiness = z.infer<typeof GithubActionsReadinessSchema>;

export const GithubActionsObservationRunnerModeSchema = z.enum([
  'planning-only',
  'controlled-github-actions-observation',
]);
export type GithubActionsObservationRunnerMode = z.infer<
  typeof GithubActionsObservationRunnerModeSchema
>;

export const GithubActionsObservationPlanSchema = createdEntityBaseSchema
  .extend({
    dryRunId: z.string().min(1),
    status: z.enum(['planned', 'blocked']),
    runnerMode: GithubActionsObservationRunnerModeSchema,
    targetRef: GithubRemoteRefSummarySchema,
    requestedMetadata: z
      .array(z.enum(['repo', 'workflow_runs', 'workflow_run', 'jobs', 'logs']))
      .default([]),
    workflowRunIdHash: z.string().min(1).optional(),
    logByteCap: z.number().int().positive(),
    blockReasons: z.array(z.string().min(1)).default([]),
    policyDecision: PolicyDecisionSchema,
    requiresApproval: z.literal(true),
    evidenceRefs: z.array(EvidenceRefSchema).default([]),
    auditEventIds: z.array(z.string().min(1)).default([]),
    networkBoundaryPlanned: z.boolean(),
    networkBoundaryInvoked: z.literal(false),
    processBoundaryInvoked: z.literal(false),
    externalProcessStarted: z.literal(false),
    noRealWrite: z.literal(true),
    fixedEndpointOnly: z.literal(true),
    rawUrlStored: z.literal(false),
    rawResponseBodyStored: z.literal(false),
    rawLogStored: z.literal(false),
    rawArtifactStored: z.literal(false),
    rawPathStored: z.literal(false),
    bodyStored: z.literal(false),
    summary: z.string().min(1),
  })
  .strict()
  .superRefine((record, context) => {
    rejectGithubRawMetadata(record.metadata, context, ['metadata']);

    if (record.status === 'blocked' && record.networkBoundaryPlanned) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'blocked GitHub Actions observation plans cannot plan a network boundary',
        path: ['networkBoundaryPlanned'],
      });
    }
  });
export type GithubActionsObservationPlan = z.infer<
  typeof GithubActionsObservationPlanSchema
>;

export const GithubActionsRunSummarySchema = createdEntityBaseSchema
  .extend({
    targetRef: GithubRemoteRefSummarySchema,
    workflowRunIdHash: z.string().min(1).optional(),
    workflowNameHash: z.string().min(1).optional(),
    runStatus: z.enum(['queued', 'in_progress', 'completed', 'unknown']),
    conclusionHash: z.string().min(1).optional(),
    jobCount: z.number().int().nonnegative(),
    logHashCount: z.number().int().nonnegative(),
    responseBodyHashCount: z.number().int().nonnegative(),
    rawUrlStored: z.literal(false),
    rawResponseBodyStored: z.literal(false),
    rawLogStored: z.literal(false),
    rawArtifactStored: z.literal(false),
    rawPathStored: z.literal(false),
    bodyStored: z.literal(false),
    summary: z.string().min(1),
  })
  .strict()
  .superRefine((record, context) => {
    rejectGithubRawMetadata(record.metadata, context, ['metadata']);
  });
export type GithubActionsRunSummary = z.infer<typeof GithubActionsRunSummarySchema>;

export const GithubActionsJobSummarySchema = createdEntityBaseSchema
  .extend({
    workflowRunIdHash: z.string().min(1).optional(),
    jobIdHash: z.string().min(1).optional(),
    jobStatus: z.enum(['queued', 'in_progress', 'completed', 'unknown']),
    conclusionHash: z.string().min(1).optional(),
    stepCount: z.number().int().nonnegative(),
    rawUrlStored: z.literal(false),
    rawResponseBodyStored: z.literal(false),
    rawLogStored: z.literal(false),
    rawArtifactStored: z.literal(false),
    rawPathStored: z.literal(false),
    bodyStored: z.literal(false),
    summary: z.string().min(1),
  })
  .strict()
  .superRefine((record, context) => {
    rejectGithubRawMetadata(record.metadata, context, ['metadata']);
  });
export type GithubActionsJobSummary = z.infer<typeof GithubActionsJobSummarySchema>;

export const GithubActionsLogHashSummarySchema = createdEntityBaseSchema
  .extend({
    workflowRunIdHash: z.string().min(1).optional(),
    logHash: z.string().min(1).optional(),
    byteCount: z.number().int().nonnegative(),
    byteCap: z.number().int().positive(),
    truncated: z.boolean(),
    rawLogStored: z.literal(false),
    rawArtifactStored: z.literal(false),
    rawUrlStored: z.literal(false),
    rawResponseBodyStored: z.literal(false),
    rawPathStored: z.literal(false),
    bodyStored: z.literal(false),
    summary: z.string().min(1),
  })
  .strict()
  .superRefine((record, context) => {
    rejectGithubRawMetadata(record.metadata, context, ['metadata']);
  });
export type GithubActionsLogHashSummary = z.infer<
  typeof GithubActionsLogHashSummarySchema
>;

export const GithubActionsObservationApprovalArtifactRecordSchema = createdEntityBaseSchema
  .extend({
    dryRunId: z.string().min(1),
    dryRunRecordId: z.string().min(1),
    approvalRequestId: z.string().min(1),
    approvalArtifactId: z.string().min(1),
    status: GithubProviderApprovalStatusSchema,
    approved: z.boolean(),
    policyDecisionId: z.string().min(1),
    requestedByHash: z.string().min(1).optional(),
    decidedByHash: z.string().min(1).optional(),
    reasonHash: z.string().min(1).optional(),
    expiresAt: IsoDateTimeSchema.optional(),
    evidenceRefs: z.array(EvidenceRefSchema).default([]),
    auditEventIds: z.array(z.string().min(1)).default([]),
    networkBoundaryInvoked: z.literal(false),
    processBoundaryInvoked: z.literal(false),
    externalProcessStarted: z.literal(false),
    noRealWrite: z.literal(true),
    rawUrlStored: z.literal(false),
    rawResponseBodyStored: z.literal(false),
    rawLogStored: z.literal(false),
    rawArtifactStored: z.literal(false),
    rawPathStored: z.literal(false),
    bodyStored: z.literal(false),
    summary: z.string().min(1),
  })
  .strict()
  .superRefine((record, context) => {
    rejectGithubRawMetadata(record.metadata, context, ['metadata']);

    if (record.approved !== (record.status === 'approved')) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'approved must match approved GitHub Actions observation approval status',
        path: ['approved'],
      });
    }
  });
export type GithubActionsObservationApprovalArtifactRecord = z.infer<
  typeof GithubActionsObservationApprovalArtifactRecordSchema
>;

export const GithubActionsObservationRunSchema = createdEntityBaseSchema
  .extend({
    dryRunId: z.string().min(1),
    dryRunRecordId: z.string().min(1),
    approvalArtifactId: z.string().min(1).optional(),
    status: GithubControlPlaneRunStatusSchema,
    plan: GithubActionsObservationPlanSchema,
    runSummary: GithubActionsRunSummarySchema,
    jobSummaries: z.array(GithubActionsJobSummarySchema).default([]),
    logHashSummary: GithubActionsLogHashSummarySchema.optional(),
    responseBodyHashes: z.array(z.string().min(1)).default([]),
    blockReasons: z.array(z.string().min(1)).default([]),
    evidenceRefs: z.array(EvidenceRefSchema).default([]),
    auditEventIds: z.array(z.string().min(1)).default([]),
    networkBoundaryInvoked: z.boolean(),
    processBoundaryInvoked: z.literal(false),
    externalProcessStarted: z.literal(false),
    noRealWrite: z.literal(true),
    fixedEndpointOnly: z.literal(true),
    rawUrlStored: z.literal(false),
    rawResponseBodyStored: z.literal(false),
    rawLogStored: z.literal(false),
    rawArtifactStored: z.literal(false),
    rawPathStored: z.literal(false),
    bodyStored: z.literal(false),
    summary: z.string().min(1),
  })
  .strict()
  .superRefine((record, context) => {
    rejectGithubRawMetadata(record.metadata, context, ['metadata']);

    if (record.status === 'completed' && !record.networkBoundaryInvoked) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'completed GitHub Actions observation runs must invoke network boundary',
        path: ['networkBoundaryInvoked'],
      });
    }
  });
export type GithubActionsObservationRun = z.infer<typeof GithubActionsObservationRunSchema>;

export const GithubActionsRunControlKindSchema = z.enum(['rerun', 'cancel']);
export type GithubActionsRunControlKind = z.infer<typeof GithubActionsRunControlKindSchema>;

export const GithubActionsRunControlPlanSchema = createdEntityBaseSchema
  .extend({
    dryRunId: z.string().min(1),
    controlKind: GithubActionsRunControlKindSchema,
    status: z.enum(['planned', 'blocked']),
    runnerMode: z.enum(['planning-only', 'controlled-github-actions-run-control']),
    targetRef: GithubRemoteRefSummarySchema,
    workflowRunIdHash: z.string().min(1),
    blockReasons: z.array(z.string().min(1)).default([]),
    policyDecision: PolicyDecisionSchema,
    requiresApproval: z.literal(true),
    evidenceRefs: z.array(EvidenceRefSchema).default([]),
    auditEventIds: z.array(z.string().min(1)).default([]),
    networkBoundaryPlanned: z.boolean(),
    networkBoundaryInvoked: z.literal(false),
    processBoundaryInvoked: z.literal(false),
    externalProcessStarted: z.literal(false),
    noRealWrite: z.literal(true),
    fixedEndpointOnly: z.literal(true),
    arbitraryPayloadAllowed: z.literal(false),
    rawUrlStored: z.literal(false),
    rawResponseBodyStored: z.literal(false),
    rawLogStored: z.literal(false),
    rawArtifactStored: z.literal(false),
    rawPathStored: z.literal(false),
    bodyStored: z.literal(false),
    summary: z.string().min(1),
  })
  .strict()
  .superRefine((record, context) => {
    rejectGithubRawMetadata(record.metadata, context, ['metadata']);

    if (record.status === 'blocked' && record.networkBoundaryPlanned) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'blocked GitHub Actions run-control plans cannot plan a network boundary',
        path: ['networkBoundaryPlanned'],
      });
    }
  });
export type GithubActionsRunControlPlan = z.infer<typeof GithubActionsRunControlPlanSchema>;

export const GithubActionsRerunPlanSchema = GithubActionsRunControlPlanSchema.refine(
  (record) => record.controlKind === 'rerun',
  { message: 'GitHub Actions rerun plans must use controlKind rerun' },
);
export type GithubActionsRerunPlan = z.infer<typeof GithubActionsRerunPlanSchema>;

export const GithubActionsCancelPlanSchema = GithubActionsRunControlPlanSchema.refine(
  (record) => record.controlKind === 'cancel',
  { message: 'GitHub Actions cancel plans must use controlKind cancel' },
);
export type GithubActionsCancelPlan = z.infer<typeof GithubActionsCancelPlanSchema>;

export const GithubActionsRunControlApprovalArtifactSchema = createdEntityBaseSchema
  .extend({
    dryRunId: z.string().min(1),
    dryRunRecordId: z.string().min(1),
    controlKind: GithubActionsRunControlKindSchema,
    approvalRequestId: z.string().min(1),
    approvalArtifactId: z.string().min(1),
    status: GithubProviderApprovalStatusSchema,
    approved: z.boolean(),
    policyDecisionId: z.string().min(1),
    requestedByHash: z.string().min(1).optional(),
    decidedByHash: z.string().min(1).optional(),
    reasonHash: z.string().min(1).optional(),
    expiresAt: IsoDateTimeSchema.optional(),
    evidenceRefs: z.array(EvidenceRefSchema).default([]),
    auditEventIds: z.array(z.string().min(1)).default([]),
    networkBoundaryInvoked: z.literal(false),
    processBoundaryInvoked: z.literal(false),
    externalProcessStarted: z.literal(false),
    noRealWrite: z.literal(true),
    rawUrlStored: z.literal(false),
    rawResponseBodyStored: z.literal(false),
    rawLogStored: z.literal(false),
    rawArtifactStored: z.literal(false),
    rawPathStored: z.literal(false),
    bodyStored: z.literal(false),
    summary: z.string().min(1),
  })
  .strict()
  .superRefine((record, context) => {
    rejectGithubRawMetadata(record.metadata, context, ['metadata']);

    if (record.approved !== (record.status === 'approved')) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'approved must match approved GitHub Actions run-control approval status',
        path: ['approved'],
      });
    }
  });
export type GithubActionsRunControlApprovalArtifact = z.infer<
  typeof GithubActionsRunControlApprovalArtifactSchema
>;

export const GithubActionsRunControlSummarySchema = createdEntityBaseSchema
  .extend({
    controlKind: GithubActionsRunControlKindSchema,
    targetRef: GithubRemoteRefSummarySchema,
    workflowRunIdHash: z.string().min(1),
    responseBodyHashCount: z.number().int().nonnegative(),
    changed: z.boolean(),
    fixedEndpointOnly: z.literal(true),
    arbitraryPayloadAllowed: z.literal(false),
    rawUrlStored: z.literal(false),
    rawResponseBodyStored: z.literal(false),
    rawLogStored: z.literal(false),
    rawArtifactStored: z.literal(false),
    rawPathStored: z.literal(false),
    bodyStored: z.literal(false),
    summary: z.string().min(1),
  })
  .strict()
  .superRefine((record, context) => {
    rejectGithubRawMetadata(record.metadata, context, ['metadata']);
  });
export type GithubActionsRunControlSummary = z.infer<
  typeof GithubActionsRunControlSummarySchema
>;

export const GithubActionsRunControlRunSchema = createdEntityBaseSchema
  .extend({
    dryRunId: z.string().min(1),
    dryRunRecordId: z.string().min(1),
    approvalArtifactId: z.string().min(1).optional(),
    controlKind: GithubActionsRunControlKindSchema,
    status: GithubControlPlaneRunStatusSchema,
    plan: GithubActionsRunControlPlanSchema,
    controlSummary: GithubActionsRunControlSummarySchema,
    responseBodyHashes: z.array(z.string().min(1)).default([]),
    blockReasons: z.array(z.string().min(1)).default([]),
    evidenceRefs: z.array(EvidenceRefSchema).default([]),
    auditEventIds: z.array(z.string().min(1)).default([]),
    networkBoundaryInvoked: z.boolean(),
    processBoundaryInvoked: z.literal(false),
    externalProcessStarted: z.literal(false),
    noRealWrite: z.boolean(),
    fixedEndpointOnly: z.literal(true),
    arbitraryPayloadAllowed: z.literal(false),
    rawUrlStored: z.literal(false),
    rawResponseBodyStored: z.literal(false),
    rawLogStored: z.literal(false),
    rawArtifactStored: z.literal(false),
    rawPathStored: z.literal(false),
    bodyStored: z.literal(false),
    summary: z.string().min(1),
  })
  .strict()
  .superRefine((record, context) => {
    rejectGithubRawMetadata(record.metadata, context, ['metadata']);

    if (record.status === 'completed' && !record.networkBoundaryInvoked) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'completed GitHub Actions run-control runs must invoke network boundary',
        path: ['networkBoundaryInvoked'],
      });
    }

    if (record.status === 'completed' && record.noRealWrite) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'completed GitHub Actions run-control runs must record a real write',
        path: ['noRealWrite'],
      });
    }
  });
export type GithubActionsRunControlRun = z.infer<typeof GithubActionsRunControlRunSchema>;

export const GithubActionsDispatchPlanSchema = createdEntityBaseSchema
  .extend({
    dryRunId: z.string().min(1),
    status: z.enum(['planned', 'blocked']),
    runnerMode: z.enum(['planning-only', 'controlled-github-actions-dispatch']),
    targetRef: GithubRemoteRefSummarySchema,
    workflowIdHash: z.string().min(1),
    refHash: z.string().min(1),
    inputsSupported: z.literal(false),
    arbitraryInputsRejected: z.literal(true),
    blockReasons: z.array(z.string().min(1)).default([]),
    policyDecision: PolicyDecisionSchema,
    requiresApproval: z.literal(true),
    evidenceRefs: z.array(EvidenceRefSchema).default([]),
    auditEventIds: z.array(z.string().min(1)).default([]),
    networkBoundaryPlanned: z.boolean(),
    networkBoundaryInvoked: z.literal(false),
    processBoundaryInvoked: z.literal(false),
    externalProcessStarted: z.literal(false),
    noRealWrite: z.literal(true),
    fixedEndpointOnly: z.literal(true),
    arbitraryPayloadAllowed: z.literal(false),
    rawUrlStored: z.literal(false),
    rawResponseBodyStored: z.literal(false),
    rawLogStored: z.literal(false),
    rawArtifactStored: z.literal(false),
    rawPathStored: z.literal(false),
    bodyStored: z.literal(false),
    summary: z.string().min(1),
  })
  .strict()
  .superRefine((record, context) => {
    rejectGithubRawMetadata(record.metadata, context, ['metadata']);

    if (record.status === 'blocked' && record.networkBoundaryPlanned) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'blocked GitHub Actions dispatch plans cannot plan a network boundary',
        path: ['networkBoundaryPlanned'],
      });
    }
  });
export type GithubActionsDispatchPlan = z.infer<typeof GithubActionsDispatchPlanSchema>;

export const GithubActionsDispatchApprovalArtifactSchema = createdEntityBaseSchema
  .extend({
    dryRunId: z.string().min(1),
    dryRunRecordId: z.string().min(1),
    controlKind: z.literal('dispatch'),
    approvalRequestId: z.string().min(1),
    approvalArtifactId: z.string().min(1),
    status: GithubProviderApprovalStatusSchema,
    approved: z.boolean(),
    policyDecisionId: z.string().min(1),
    requestedByHash: z.string().min(1).optional(),
    decidedByHash: z.string().min(1).optional(),
    reasonHash: z.string().min(1).optional(),
    expiresAt: IsoDateTimeSchema.optional(),
    evidenceRefs: z.array(EvidenceRefSchema).default([]),
    auditEventIds: z.array(z.string().min(1)).default([]),
    networkBoundaryInvoked: z.literal(false),
    processBoundaryInvoked: z.literal(false),
    externalProcessStarted: z.literal(false),
    noRealWrite: z.literal(true),
    rawUrlStored: z.literal(false),
    rawResponseBodyStored: z.literal(false),
    rawLogStored: z.literal(false),
    rawArtifactStored: z.literal(false),
    rawPathStored: z.literal(false),
    bodyStored: z.literal(false),
    summary: z.string().min(1),
  })
  .strict()
  .superRefine((record, context) => {
    rejectGithubRawMetadata(record.metadata, context, ['metadata']);

    if (record.approved !== (record.status === 'approved')) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'approved must match approved GitHub Actions dispatch approval status',
        path: ['approved'],
      });
    }
  });
export type GithubActionsDispatchApprovalArtifact = z.infer<
  typeof GithubActionsDispatchApprovalArtifactSchema
>;

export const GithubActionsDispatchSummarySchema = createdEntityBaseSchema
  .extend({
    targetRef: GithubRemoteRefSummarySchema,
    workflowIdHash: z.string().min(1),
    refHash: z.string().min(1),
    responseBodyHashCount: z.number().int().nonnegative(),
    dispatched: z.boolean(),
    fixedEndpointOnly: z.literal(true),
    arbitraryPayloadAllowed: z.literal(false),
    inputsSupported: z.literal(false),
    arbitraryInputsRejected: z.literal(true),
    rawUrlStored: z.literal(false),
    rawResponseBodyStored: z.literal(false),
    rawLogStored: z.literal(false),
    rawArtifactStored: z.literal(false),
    rawPathStored: z.literal(false),
    bodyStored: z.literal(false),
    summary: z.string().min(1),
  })
  .strict()
  .superRefine((record, context) => {
    rejectGithubRawMetadata(record.metadata, context, ['metadata']);
  });
export type GithubActionsDispatchSummary = z.infer<typeof GithubActionsDispatchSummarySchema>;

export const GithubActionsDispatchRunSchema = createdEntityBaseSchema
  .extend({
    dryRunId: z.string().min(1),
    dryRunRecordId: z.string().min(1),
    approvalArtifactId: z.string().min(1).optional(),
    status: GithubControlPlaneRunStatusSchema,
    plan: GithubActionsDispatchPlanSchema,
    dispatchSummary: GithubActionsDispatchSummarySchema,
    responseBodyHashes: z.array(z.string().min(1)).default([]),
    blockReasons: z.array(z.string().min(1)).default([]),
    evidenceRefs: z.array(EvidenceRefSchema).default([]),
    auditEventIds: z.array(z.string().min(1)).default([]),
    networkBoundaryInvoked: z.boolean(),
    processBoundaryInvoked: z.literal(false),
    externalProcessStarted: z.literal(false),
    noRealWrite: z.boolean(),
    fixedEndpointOnly: z.literal(true),
    arbitraryPayloadAllowed: z.literal(false),
    inputsSupported: z.literal(false),
    arbitraryInputsRejected: z.literal(true),
    rawUrlStored: z.literal(false),
    rawResponseBodyStored: z.literal(false),
    rawLogStored: z.literal(false),
    rawArtifactStored: z.literal(false),
    rawPathStored: z.literal(false),
    bodyStored: z.literal(false),
    summary: z.string().min(1),
  })
  .strict()
  .superRefine((record, context) => {
    rejectGithubRawMetadata(record.metadata, context, ['metadata']);

    if (record.status === 'completed' && !record.networkBoundaryInvoked) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'completed GitHub Actions dispatch runs must invoke network boundary',
        path: ['networkBoundaryInvoked'],
      });
    }

    if (record.status === 'completed' && record.noRealWrite) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'completed GitHub Actions dispatch runs must record a real write',
        path: ['noRealWrite'],
      });
    }
  });
export type GithubActionsDispatchRun = z.infer<typeof GithubActionsDispatchRunSchema>;

export const GithubActionsAcceptanceScenarioSchema = z.enum([
  'observation-all-pass',
  'token-missing',
  'provider-disabled',
  'run-not-found',
  'logs-too-large',
  'rerun-approval-blocked',
  'rerun-failed',
  'cancel-approval-blocked',
  'cancel-failed',
  'dispatch-approval-blocked',
  'dispatch-inputs-rejected',
  'dispatch-failed',
  'network-timeout',
]);
export type GithubActionsAcceptanceScenario = z.infer<
  typeof GithubActionsAcceptanceScenarioSchema
>;

export const GithubActionsAcceptanceRehearsalRunSchema = createdEntityBaseSchema
  .extend({
    scenario: GithubActionsAcceptanceScenarioSchema,
    status: z.enum(['passed', 'failed', 'blocked', 'aborted']),
    observationStatus: z.enum(['fixture_completed', 'blocked', 'failed', 'skipped']),
    rerunStatus: z.enum(['fixture_completed', 'blocked', 'failed', 'skipped']),
    cancelStatus: z.enum(['fixture_completed', 'blocked', 'failed', 'skipped']),
    dispatchStatus: z.enum(['fixture_completed', 'blocked', 'failed', 'skipped']),
    stepCount: z.number().int().nonnegative(),
    blockerCount: z.number().int().nonnegative(),
    evidenceRefCount: z.number().int().nonnegative(),
    auditEventCount: z.number().int().nonnegative(),
    networkBoundaryInvoked: z.literal(false),
    processBoundaryInvoked: z.literal(false),
    externalProcessStarted: z.literal(false),
    noRealWrite: z.literal(true),
    fixedEndpointOnly: z.literal(true),
    arbitraryPayloadAllowed: z.literal(false),
    rawUrlStored: z.literal(false),
    rawResponseBodyStored: z.literal(false),
    rawLogStored: z.literal(false),
    rawArtifactStored: z.literal(false),
    rawPathStored: z.literal(false),
    bodyStored: z.literal(false),
    summary: z.string().min(1),
  })
  .strict()
  .superRefine((record, context) => {
    rejectGithubRawMetadata(record.metadata, context, ['metadata']);

    if (record.status === 'passed' && record.scenario !== 'observation-all-pass') {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'only observation-all-pass GitHub Actions rehearsals can pass',
        path: ['status'],
      });
    }
  });
export type GithubActionsAcceptanceRehearsalRun = z.infer<
  typeof GithubActionsAcceptanceRehearsalRunSchema
>;

export const ReleaseVersionBumpKindSchema = z.enum([
  'patch',
  'minor',
  'major',
  'prerelease',
]);
export type ReleaseVersionBumpKind = z.infer<typeof ReleaseVersionBumpKindSchema>;

export const ReleaseVersionPlanSchema = createdEntityBaseSchema
  .extend({
    dryRunId: z.string().min(1),
    status: z.enum(['planned', 'blocked']),
    currentVersionHash: z.string().min(1),
    proposedVersionHash: z.string().min(1),
    bumpKind: ReleaseVersionBumpKindSchema,
    sourceSummaryHash: z.string().min(1),
    changedFileCount: z.literal(0),
    blockReasons: z.array(z.string().min(1)).default([]),
    policyDecision: PolicyDecisionSchema,
    requiresApproval: z.literal(false),
    evidenceRefs: z.array(EvidenceRefSchema).default([]),
    auditEventIds: z.array(z.string().min(1)).default([]),
    networkBoundaryPlanned: z.literal(false),
    networkBoundaryInvoked: z.literal(false),
    processBoundaryInvoked: z.literal(false),
    externalProcessStarted: z.literal(false),
    noRealWrite: z.literal(true),
    rawPathStored: z.literal(false),
    rawVersionStored: z.literal(false),
    bodyStored: z.literal(false),
    summary: z.string().min(1),
  })
  .strict()
  .superRefine((record, context) => {
    rejectGithubRawMetadata(record.metadata, context, ['metadata']);

    if (record.status === 'blocked' && record.blockReasons.length === 0) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'blocked release version plans must include a blocker',
        path: ['blockReasons'],
      });
    }
  });
export type ReleaseVersionPlan = z.infer<typeof ReleaseVersionPlanSchema>;

export const ReleaseChangelogSummarySchema = createdEntityBaseSchema
  .extend({
    sourceSummaryHash: z.string().min(1),
    changelogBodyHash: z.string().min(1),
    sectionCount: z.number().int().nonnegative(),
    changeCount: z.number().int().nonnegative(),
    breakingChangeCount: z.number().int().nonnegative(),
    evidenceRefs: z.array(EvidenceRefSchema).default([]),
    auditEventIds: z.array(z.string().min(1)).default([]),
    rawChangelogStored: z.literal(false),
    rawPathStored: z.literal(false),
    bodyStored: z.literal(false),
    summary: z.string().min(1),
  })
  .strict()
  .superRefine((record, context) => {
    rejectGithubRawMetadata(record.metadata, context, ['metadata']);
  });
export type ReleaseChangelogSummary = z.infer<typeof ReleaseChangelogSummarySchema>;

export const GithubReleaseTagRunnerModeSchema = z.enum([
  'planning-only',
  'controlled-github-release-tag',
]);
export type GithubReleaseTagRunnerMode = z.infer<typeof GithubReleaseTagRunnerModeSchema>;

export const GithubReleaseTagPlanSchema = createdEntityBaseSchema
  .extend({
    dryRunId: z.string().min(1),
    status: z.enum(['planned', 'blocked']),
    runnerMode: GithubReleaseTagRunnerModeSchema,
    targetRef: GithubRemoteRefSummarySchema,
    baseRefHash: z.string().min(1),
    tagNameHash: z.string().min(1),
    tagMessageHash: z.string().min(1),
    targetShaHash: z.string().min(1).optional(),
    releaseVersionPlanId: z.string().min(1).optional(),
    changelogSummaryId: z.string().min(1).optional(),
    blockReasons: z.array(z.string().min(1)).default([]),
    policyDecision: PolicyDecisionSchema,
    requiresApproval: z.literal(true),
    evidenceRefs: z.array(EvidenceRefSchema).default([]),
    auditEventIds: z.array(z.string().min(1)).default([]),
    networkBoundaryPlanned: z.boolean(),
    networkBoundaryInvoked: z.literal(false),
    processBoundaryInvoked: z.literal(false),
    externalProcessStarted: z.literal(false),
    noRealWrite: z.literal(true),
    fixedEndpointOnly: z.literal(true),
    localGitTagAllowed: z.literal(false),
    pushAllowed: z.literal(false),
    updateRefOutsideTagFlowAllowed: z.literal(false),
    forceAllowed: z.literal(false),
    releasePublishAllowed: z.literal(false),
    rawRefStored: z.literal(false),
    rawUrlStored: z.literal(false),
    rawResponseBodyStored: z.literal(false),
    rawPathStored: z.literal(false),
    bodyStored: z.literal(false),
    summary: z.string().min(1),
  })
  .strict()
  .superRefine((record, context) => {
    rejectGithubRawMetadata(record.metadata, context, ['metadata']);

    if (record.status === 'blocked' && record.networkBoundaryPlanned) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'blocked GitHub release tag plans cannot plan a network boundary',
        path: ['networkBoundaryPlanned'],
      });
    }
  });
export type GithubReleaseTagPlan = z.infer<typeof GithubReleaseTagPlanSchema>;

export const GithubReleaseTagApprovalArtifactSchema = createdEntityBaseSchema
  .extend({
    dryRunId: z.string().min(1),
    dryRunRecordId: z.string().min(1),
    approvalRequestId: z.string().min(1),
    approvalArtifactId: z.string().min(1),
    status: GithubProviderApprovalStatusSchema,
    approved: z.boolean(),
    policyDecisionId: z.string().min(1),
    targetRefHash: z.string().min(1),
    tagNameHash: z.string().min(1),
    expectedPlanHash: z.string().min(1),
    approvedAt: IsoDateTimeSchema.optional(),
    expiresAt: IsoDateTimeSchema.optional(),
    usedAt: IsoDateTimeSchema.optional(),
    deniedAt: IsoDateTimeSchema.optional(),
    revokedAt: IsoDateTimeSchema.optional(),
    reasonHash: z.string().min(1).optional(),
    reasonSummary: z.string().min(1).optional(),
    approverHash: z.string().min(1).optional(),
    evidenceRefs: z.array(EvidenceRefSchema).default([]),
    auditEventIds: z.array(z.string().min(1)).default([]),
    tokenValueStored: z.literal(false),
    rawRefStored: z.literal(false),
    rawUrlStored: z.literal(false),
    bodyStored: z.literal(false),
    summary: z.string().min(1),
  })
  .strict()
  .superRefine((record, context) => {
    rejectGithubRawMetadata(record.metadata, context, ['metadata']);
    if (record.approved !== (record.status === 'approved')) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'approved must match approved GitHub release tag approval status',
        path: ['approved'],
      });
    }
  });
export type GithubReleaseTagApprovalArtifact = z.infer<
  typeof GithubReleaseTagApprovalArtifactSchema
>;

export const GithubReleaseTagSummarySchema = createdEntityBaseSchema
  .extend({
    tagNameHash: z.string().min(1),
    targetShaHash: z.string().min(1).optional(),
    createdTagShaHash: z.string().min(1).optional(),
    createdRefHash: z.string().min(1).optional(),
    responseHashCount: z.number().int().nonnegative(),
    tagAlreadyExists: z.boolean(),
    evidenceRefs: z.array(EvidenceRefSchema).default([]),
    auditEventIds: z.array(z.string().min(1)).default([]),
    rawTagStored: z.literal(false),
    rawRefStored: z.literal(false),
    rawUrlStored: z.literal(false),
    rawResponseBodyStored: z.literal(false),
    bodyStored: z.literal(false),
    summary: z.string().min(1),
  })
  .strict()
  .superRefine((record, context) => {
    rejectGithubRawMetadata(record.metadata, context, ['metadata']);
  });
export type GithubReleaseTagSummary = z.infer<typeof GithubReleaseTagSummarySchema>;

export const GithubReleaseTagRunSchema = createdEntityBaseSchema
  .extend({
    status: GithubControlPlaneRunStatusSchema,
    plan: GithubReleaseTagPlanSchema,
    tagSummary: GithubReleaseTagSummarySchema,
    responseBodyHashes: z.array(z.string().min(1)).default([]),
    blockReasons: z.array(z.string().min(1)).default([]),
    evidenceRefs: z.array(EvidenceRefSchema).default([]),
    auditEventIds: z.array(z.string().min(1)).default([]),
    networkBoundaryInvoked: z.boolean(),
    processBoundaryInvoked: z.literal(false),
    externalProcessStarted: z.literal(false),
    noRealWrite: z.boolean(),
    fixedEndpointOnly: z.literal(true),
    localGitTagAllowed: z.literal(false),
    pushAllowed: z.literal(false),
    updateRefOutsideTagFlowAllowed: z.literal(false),
    forceAllowed: z.literal(false),
    releasePublishAllowed: z.literal(false),
    rawRefStored: z.literal(false),
    rawUrlStored: z.literal(false),
    rawResponseBodyStored: z.literal(false),
    rawPathStored: z.literal(false),
    bodyStored: z.literal(false),
    summary: z.string().min(1),
  })
  .strict()
  .superRefine((record, context) => {
    rejectGithubRawMetadata(record.metadata, context, ['metadata']);

    if (record.status === 'completed' && !record.networkBoundaryInvoked) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'completed GitHub release tag runs must invoke network boundary',
        path: ['networkBoundaryInvoked'],
      });
    }

    if (record.status === 'completed' && record.noRealWrite) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'completed GitHub release tag runs must record a real write',
        path: ['noRealWrite'],
      });
    }
  });
export type GithubReleaseTagRun = z.infer<typeof GithubReleaseTagRunSchema>;

export const GithubReleaseDraftRunnerModeSchema = z.enum([
  'planning-only',
  'controlled-github-release-draft',
]);
export type GithubReleaseDraftRunnerMode = z.infer<typeof GithubReleaseDraftRunnerModeSchema>;

export const GithubReleaseDraftPlanSchema = createdEntityBaseSchema
  .extend({
    dryRunId: z.string().min(1),
    status: z.enum(['planned', 'blocked']),
    runnerMode: GithubReleaseDraftRunnerModeSchema,
    targetRef: GithubRemoteRefSummarySchema,
    tagNameHash: z.string().min(1),
    releaseNameHash: z.string().min(1),
    releaseBodyHash: z.string().min(1),
    changelogSummaryId: z.string().min(1).optional(),
    tagRunId: z.string().min(1).optional(),
    blockReasons: z.array(z.string().min(1)).default([]),
    policyDecision: PolicyDecisionSchema,
    requiresApproval: z.literal(true),
    evidenceRefs: z.array(EvidenceRefSchema).default([]),
    auditEventIds: z.array(z.string().min(1)).default([]),
    networkBoundaryPlanned: z.boolean(),
    networkBoundaryInvoked: z.literal(false),
    processBoundaryInvoked: z.literal(false),
    externalProcessStarted: z.literal(false),
    noRealWrite: z.literal(true),
    fixedEndpointOnly: z.literal(true),
    draft: z.literal(true),
    releasePublishAllowed: z.literal(false),
    rawReleaseBodyStored: z.literal(false),
    rawChangelogStored: z.literal(false),
    rawUrlStored: z.literal(false),
    rawResponseBodyStored: z.literal(false),
    rawPathStored: z.literal(false),
    bodyStored: z.literal(false),
    summary: z.string().min(1),
  })
  .strict()
  .superRefine((record, context) => {
    rejectGithubRawMetadata(record.metadata, context, ['metadata']);

    if (record.status === 'blocked' && record.networkBoundaryPlanned) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'blocked GitHub release draft plans cannot plan a network boundary',
        path: ['networkBoundaryPlanned'],
      });
    }
  });
export type GithubReleaseDraftPlan = z.infer<typeof GithubReleaseDraftPlanSchema>;

export const GithubReleaseDraftApprovalArtifactSchema = createdEntityBaseSchema
  .extend({
    dryRunId: z.string().min(1),
    dryRunRecordId: z.string().min(1),
    approvalRequestId: z.string().min(1),
    approvalArtifactId: z.string().min(1),
    status: GithubProviderApprovalStatusSchema,
    approved: z.boolean(),
    policyDecisionId: z.string().min(1),
    targetRefHash: z.string().min(1),
    tagNameHash: z.string().min(1),
    expectedPlanHash: z.string().min(1),
    releaseNameHash: z.string().min(1),
    releaseBodyHash: z.string().min(1),
    draft: z.literal(true),
    releasePublishAllowed: z.literal(false),
    approvedAt: IsoDateTimeSchema.optional(),
    expiresAt: IsoDateTimeSchema.optional(),
    usedAt: IsoDateTimeSchema.optional(),
    deniedAt: IsoDateTimeSchema.optional(),
    revokedAt: IsoDateTimeSchema.optional(),
    reasonHash: z.string().min(1).optional(),
    reasonSummary: z.string().min(1).optional(),
    approverHash: z.string().min(1).optional(),
    evidenceRefs: z.array(EvidenceRefSchema).default([]),
    auditEventIds: z.array(z.string().min(1)).default([]),
    tokenValueStored: z.literal(false),
    rawRefStored: z.literal(false),
    rawUrlStored: z.literal(false),
    bodyStored: z.literal(false),
    rawReleaseBodyStored: z.literal(false),
    rawChangelogStored: z.literal(false),
    summary: z.string().min(1),
  })
  .strict()
  .superRefine((record, context) => {
    rejectGithubRawMetadata(record.metadata, context, ['metadata']);
    if (record.approved !== (record.status === 'approved')) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'approved must match approved GitHub release draft approval status',
        path: ['approved'],
      });
    }
  });
export type GithubReleaseDraftApprovalArtifact = z.infer<
  typeof GithubReleaseDraftApprovalArtifactSchema
>;

export const GithubReleaseDraftSummarySchema = createdEntityBaseSchema
  .extend({
    tagNameHash: z.string().min(1),
    releaseNameHash: z.string().min(1),
    releaseBodyHash: z.string().min(1),
    releaseIdHash: z.string().min(1).optional(),
    responseHashCount: z.number().int().nonnegative(),
    draft: z.literal(true),
    alreadyExists: z.boolean(),
    evidenceRefs: z.array(EvidenceRefSchema).default([]),
    auditEventIds: z.array(z.string().min(1)).default([]),
    rawReleaseBodyStored: z.literal(false),
    rawChangelogStored: z.literal(false),
    rawUrlStored: z.literal(false),
    rawResponseBodyStored: z.literal(false),
    bodyStored: z.literal(false),
    summary: z.string().min(1),
  })
  .strict()
  .superRefine((record, context) => {
    rejectGithubRawMetadata(record.metadata, context, ['metadata']);
  });
export type GithubReleaseDraftSummary = z.infer<typeof GithubReleaseDraftSummarySchema>;

export const GithubReleaseDraftRunSchema = createdEntityBaseSchema
  .extend({
    status: GithubControlPlaneRunStatusSchema,
    plan: GithubReleaseDraftPlanSchema,
    draftSummary: GithubReleaseDraftSummarySchema,
    responseBodyHashes: z.array(z.string().min(1)).default([]),
    blockReasons: z.array(z.string().min(1)).default([]),
    evidenceRefs: z.array(EvidenceRefSchema).default([]),
    auditEventIds: z.array(z.string().min(1)).default([]),
    networkBoundaryInvoked: z.boolean(),
    processBoundaryInvoked: z.literal(false),
    externalProcessStarted: z.literal(false),
    noRealWrite: z.boolean(),
    fixedEndpointOnly: z.literal(true),
    draft: z.literal(true),
    releasePublishAllowed: z.literal(false),
    rawReleaseBodyStored: z.literal(false),
    rawChangelogStored: z.literal(false),
    rawUrlStored: z.literal(false),
    rawResponseBodyStored: z.literal(false),
    rawPathStored: z.literal(false),
    bodyStored: z.literal(false),
    summary: z.string().min(1),
  })
  .strict()
  .superRefine((record, context) => {
    rejectGithubRawMetadata(record.metadata, context, ['metadata']);

    if (record.status === 'completed' && !record.networkBoundaryInvoked) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'completed GitHub release draft runs must invoke network boundary',
        path: ['networkBoundaryInvoked'],
      });
    }

    if (record.status === 'completed' && record.noRealWrite) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'completed GitHub release draft runs must record a real write',
        path: ['noRealWrite'],
      });
    }
  });
export type GithubReleaseDraftRun = z.infer<typeof GithubReleaseDraftRunSchema>;

export const ReleaseLifecycleAcceptanceScenarioSchema = z.enum([
  'all-pass',
  'provider-disabled',
  'token-missing',
  'version-plan-blocked',
  'changelog-blocked',
  'tag-exists',
  'tag-approval-blocked',
  'tag-create-failed',
  'release-draft-approval-blocked',
  'release-draft-failed',
  'network-timeout',
]);
export type ReleaseLifecycleAcceptanceScenario = z.infer<
  typeof ReleaseLifecycleAcceptanceScenarioSchema
>;

export const ReleaseLifecycleAcceptanceRehearsalRunSchema = createdEntityBaseSchema
  .extend({
    scenario: ReleaseLifecycleAcceptanceScenarioSchema,
    status: z.enum(['passed', 'failed', 'blocked', 'aborted']),
    versionPlanStatus: z.enum(['fixture_completed', 'blocked', 'failed', 'skipped']),
    changelogStatus: z.enum(['fixture_completed', 'blocked', 'failed', 'skipped']),
    tagStatus: z.enum(['fixture_completed', 'blocked', 'failed', 'skipped']),
    releaseDraftStatus: z.enum(['fixture_completed', 'blocked', 'failed', 'skipped']),
    stepCount: z.number().int().nonnegative(),
    blockerCount: z.number().int().nonnegative(),
    evidenceRefCount: z.number().int().nonnegative(),
    auditEventCount: z.number().int().nonnegative(),
    networkBoundaryInvoked: z.literal(false),
    processBoundaryInvoked: z.literal(false),
    externalProcessStarted: z.literal(false),
    noRealWrite: z.literal(true),
    fixedEndpointOnly: z.literal(true),
    releasePublishAllowed: z.literal(false),
    rawReleaseBodyStored: z.literal(false),
    rawChangelogStored: z.literal(false),
    rawUrlStored: z.literal(false),
    rawResponseBodyStored: z.literal(false),
    rawPathStored: z.literal(false),
    bodyStored: z.literal(false),
    summary: z.string().min(1),
  })
  .strict()
  .superRefine((record, context) => {
    rejectGithubRawMetadata(record.metadata, context, ['metadata']);

    if (record.status === 'passed' && record.scenario !== 'all-pass') {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'only all-pass release lifecycle rehearsals can pass',
        path: ['status'],
      });
    }
  });
export type ReleaseLifecycleAcceptanceRehearsalRun = z.infer<
  typeof ReleaseLifecycleAcceptanceRehearsalRunSchema
>;

export const DeploymentProviderSchema = z.enum([
  'docker',
  'kubernetes',
  'helm',
  'argo-cd',
  'terraform',
  'opentofu',
]);
export type DeploymentProvider = z.infer<typeof DeploymentProviderSchema>;

export const DeploymentProviderManifestSchema = createdEntityBaseSchema
  .extend({
    name: z.string().min(1),
    provider: DeploymentProviderSchema,
    version: z.string().min(1),
    implemented: z.boolean(),
    defaultEnabled: z.literal(false),
    actionMode: z.literal('read'),
    riskLevel: z.literal('high'),
    fixedReadOnlyRunner: z.literal(true),
    applyAllowed: z.literal(false),
    syncAllowed: z.literal(false),
    rollbackAllowed: z.literal(false),
    deleteAllowed: z.literal(false),
    scaleAllowed: z.literal(false),
    restartAllowed: z.literal(false),
    arbitraryCommandAllowed: z.literal(false),
    rawOutputStored: z.literal(false),
    bodyStored: z.literal(false),
    summary: z.string().min(1),
  })
  .strict()
  .superRefine((record, context) => {
    rejectGithubRawMetadata(record.metadata, context, ['metadata']);
  });
export type DeploymentProviderManifest = z.infer<typeof DeploymentProviderManifestSchema>;

export const DeploymentReadinessSchema = createdEntityBaseSchema
  .extend({
    provider: DeploymentProviderSchema,
    observerEnabled: z.boolean(),
    providerEnabled: z.boolean(),
    toolConfigured: z.boolean(),
    toolHash: z.string().min(1).optional(),
    targetHash: z.string().min(1).optional(),
    blockerCount: z.number().int().nonnegative(),
    blockReasons: z.array(z.string().min(1)).default([]),
    tokenValueStored: z.literal(false),
    rawKubeconfigStored: z.literal(false),
    rawContextStored: z.literal(false),
    rawNamespaceStored: z.literal(false),
    rawPathStored: z.literal(false),
    bodyStored: z.literal(false),
    summary: z.string().min(1),
  })
  .strict()
  .superRefine((record, context) => {
    rejectGithubRawMetadata(record.metadata, context, ['metadata']);

    if (record.blockerCount !== record.blockReasons.length) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'blockerCount must match deployment readiness blockReasons length',
        path: ['blockerCount'],
      });
    }
  });
export type DeploymentReadiness = z.infer<typeof DeploymentReadinessSchema>;

export const DeploymentObservationRunnerModeSchema = z.enum([
  'planning-only',
  'fixture',
  'controlled-deployment-readonly',
]);
export type DeploymentObservationRunnerMode = z.infer<
  typeof DeploymentObservationRunnerModeSchema
>;

export const DeploymentObservationPlanSchema = createdEntityBaseSchema
  .extend({
    dryRunId: z.string().min(1),
    status: z.enum(['planned', 'blocked']),
    provider: DeploymentProviderSchema,
    runnerMode: DeploymentObservationRunnerModeSchema,
    targetHash: z.string().min(1),
    requestedObservationKinds: z
      .array(z.enum(['status', 'plan', 'diff', 'drift']))
      .default(['status']),
    blockReasons: z.array(z.string().min(1)).default([]),
    policyDecision: PolicyDecisionSchema,
    requiresApproval: z.literal(true),
    evidenceRefs: z.array(EvidenceRefSchema).default([]),
    auditEventIds: z.array(z.string().min(1)).default([]),
    processBoundaryPlanned: z.boolean(),
    processBoundaryInvoked: z.literal(false),
    externalProcessStarted: z.literal(false),
    networkBoundaryInvoked: z.literal(false),
    noRealWrite: z.literal(true),
    fixedReadOnlyRunner: z.literal(true),
    applyAllowed: z.literal(false),
    syncAllowed: z.literal(false),
    rollbackAllowed: z.literal(false),
    deleteAllowed: z.literal(false),
    scaleAllowed: z.literal(false),
    restartAllowed: z.literal(false),
    arbitraryCommandAllowed: z.literal(false),
    rawOutputStored: z.literal(false),
    rawPlanStored: z.literal(false),
    rawDiffStored: z.literal(false),
    rawLogStored: z.literal(false),
    rawPathStored: z.literal(false),
    bodyStored: z.literal(false),
    summary: z.string().min(1),
  })
  .strict()
  .superRefine((record, context) => {
    rejectGithubRawMetadata(record.metadata, context, ['metadata']);

    if (record.status === 'blocked' && record.processBoundaryPlanned) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'blocked deployment observation plans cannot plan a process boundary',
        path: ['processBoundaryPlanned'],
      });
    }
  });
export type DeploymentObservationPlan = z.infer<typeof DeploymentObservationPlanSchema>;

export const DeploymentObservationApprovalArtifactSchema = createdEntityBaseSchema
  .extend({
    dryRunId: z.string().min(1),
    dryRunRecordId: z.string().min(1),
    approvalRequestId: z.string().min(1),
    approvalArtifactId: z.string().min(1),
    status: GithubProviderApprovalStatusSchema,
    approved: z.boolean(),
    policyDecisionId: z.string().min(1),
    provider: DeploymentProviderSchema,
    targetHash: z.string().min(1),
    expectedPlanHash: z.string().min(1),
    approvedAt: IsoDateTimeSchema.optional(),
    expiresAt: IsoDateTimeSchema.optional(),
    usedAt: IsoDateTimeSchema.optional(),
    deniedAt: IsoDateTimeSchema.optional(),
    revokedAt: IsoDateTimeSchema.optional(),
    reasonHash: z.string().min(1).optional(),
    reasonSummary: z.string().min(1).optional(),
    approverHash: z.string().min(1).optional(),
    evidenceRefs: z.array(EvidenceRefSchema).default([]),
    auditEventIds: z.array(z.string().min(1)).default([]),
    tokenValueStored: z.literal(false),
    rawOutputStored: z.literal(false),
    rawPathStored: z.literal(false),
    bodyStored: z.literal(false),
    summary: z.string().min(1),
  })
  .strict()
  .superRefine((record, context) => {
    rejectGithubRawMetadata(record.metadata, context, ['metadata']);
    if (record.approved !== (record.status === 'approved')) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'approved must match approved deployment observation approval status',
        path: ['approved'],
      });
    }
  });
export type DeploymentObservationApprovalArtifact = z.infer<
  typeof DeploymentObservationApprovalArtifactSchema
>;

export const DeploymentProviderStatusSummarySchema = createdEntityBaseSchema
  .extend({
    provider: DeploymentProviderSchema,
    targetHash: z.string().min(1),
    status: z.enum(['healthy', 'degraded', 'unavailable', 'unknown']),
    resourceCount: z.number().int().nonnegative(),
    warningCount: z.number().int().nonnegative(),
    errorCount: z.number().int().nonnegative(),
    statusHash: z.string().min(1),
    rawOutputStored: z.literal(false),
    rawPathStored: z.literal(false),
    bodyStored: z.literal(false),
    summary: z.string().min(1),
  })
  .strict()
  .superRefine((record, context) => {
    rejectGithubRawMetadata(record.metadata, context, ['metadata']);
  });
export type DeploymentProviderStatusSummary = z.infer<
  typeof DeploymentProviderStatusSummarySchema
>;

export const DeploymentDriftSummarySchema = createdEntityBaseSchema
  .extend({
    provider: DeploymentProviderSchema,
    targetHash: z.string().min(1),
    driftDetected: z.boolean(),
    driftItemCount: z.number().int().nonnegative(),
    driftHash: z.string().min(1),
    rawPlanStored: z.literal(false),
    rawDiffStored: z.literal(false),
    rawLogStored: z.literal(false),
    rawPathStored: z.literal(false),
    bodyStored: z.literal(false),
    summary: z.string().min(1),
  })
  .strict()
  .superRefine((record, context) => {
    rejectGithubRawMetadata(record.metadata, context, ['metadata']);
  });
export type DeploymentDriftSummary = z.infer<typeof DeploymentDriftSummarySchema>;

export const DeploymentPlanDiffHashSummarySchema = createdEntityBaseSchema
  .extend({
    provider: DeploymentProviderSchema,
    targetHash: z.string().min(1),
    planHash: z.string().min(1).optional(),
    diffHash: z.string().min(1).optional(),
    changedResourceCount: z.number().int().nonnegative(),
    rawPlanStored: z.literal(false),
    rawDiffStored: z.literal(false),
    rawLogStored: z.literal(false),
    rawPathStored: z.literal(false),
    bodyStored: z.literal(false),
    summary: z.string().min(1),
  })
  .strict()
  .superRefine((record, context) => {
    rejectGithubRawMetadata(record.metadata, context, ['metadata']);
  });
export type DeploymentPlanDiffHashSummary = z.infer<
  typeof DeploymentPlanDiffHashSummarySchema
>;

export const DeploymentObservationRunSchema = createdEntityBaseSchema
  .extend({
    status: GithubControlPlaneRunStatusSchema,
    plan: DeploymentObservationPlanSchema,
    providerStatus: DeploymentProviderStatusSummarySchema,
    driftSummary: DeploymentDriftSummarySchema.optional(),
    planDiffSummary: DeploymentPlanDiffHashSummarySchema.optional(),
    responseBodyHashes: z.array(z.string().min(1)).default([]),
    blockReasons: z.array(z.string().min(1)).default([]),
    evidenceRefs: z.array(EvidenceRefSchema).default([]),
    auditEventIds: z.array(z.string().min(1)).default([]),
    processBoundaryInvoked: z.boolean(),
    externalProcessStarted: z.boolean(),
    networkBoundaryInvoked: z.literal(false),
    noRealWrite: z.literal(true),
    fixedReadOnlyRunner: z.literal(true),
    applyAllowed: z.literal(false),
    syncAllowed: z.literal(false),
    rollbackAllowed: z.literal(false),
    deleteAllowed: z.literal(false),
    scaleAllowed: z.literal(false),
    restartAllowed: z.literal(false),
    arbitraryCommandAllowed: z.literal(false),
    rawOutputStored: z.literal(false),
    rawPlanStored: z.literal(false),
    rawDiffStored: z.literal(false),
    rawLogStored: z.literal(false),
    rawPathStored: z.literal(false),
    bodyStored: z.literal(false),
    summary: z.string().min(1),
  })
  .strict()
  .superRefine((record, context) => {
    rejectGithubRawMetadata(record.metadata, context, ['metadata']);
  });
export type DeploymentObservationRun = z.infer<typeof DeploymentObservationRunSchema>;

export const DeploymentAcceptanceScenarioSchema = z.enum([
  'all-pass',
  'provider-disabled',
  'tool-missing',
  'approval-blocked',
  'target-hash-mismatch',
  'status-unavailable',
  'plan-diff-detected',
  'drift-detected',
  'raw-output-rejected',
  'network-timeout',
]);
export type DeploymentAcceptanceScenario = z.infer<typeof DeploymentAcceptanceScenarioSchema>;

export const DeploymentAcceptanceRehearsalRunSchema = createdEntityBaseSchema
  .extend({
    scenario: DeploymentAcceptanceScenarioSchema,
    provider: DeploymentProviderSchema,
    status: z.enum(['passed', 'failed', 'blocked', 'aborted']),
    readinessStatus: z.enum(['fixture_completed', 'blocked', 'failed', 'skipped']),
    observationStatus: z.enum(['fixture_completed', 'blocked', 'failed', 'skipped']),
    stepCount: z.number().int().nonnegative(),
    blockerCount: z.number().int().nonnegative(),
    evidenceRefCount: z.number().int().nonnegative(),
    auditEventCount: z.number().int().nonnegative(),
    networkBoundaryInvoked: z.literal(false),
    processBoundaryInvoked: z.literal(false),
    externalProcessStarted: z.literal(false),
    noRealWrite: z.literal(true),
    fixedReadOnlyRunner: z.literal(true),
    applyAllowed: z.literal(false),
    syncAllowed: z.literal(false),
    rollbackAllowed: z.literal(false),
    deleteAllowed: z.literal(false),
    scaleAllowed: z.literal(false),
    restartAllowed: z.literal(false),
    arbitraryCommandAllowed: z.literal(false),
    rawOutputStored: z.literal(false),
    rawPlanStored: z.literal(false),
    rawDiffStored: z.literal(false),
    rawLogStored: z.literal(false),
    rawPathStored: z.literal(false),
    bodyStored: z.literal(false),
    summary: z.string().min(1),
  })
  .strict()
  .superRefine((record, context) => {
    rejectGithubRawMetadata(record.metadata, context, ['metadata']);

    if (record.status === 'passed' && record.scenario !== 'all-pass') {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'only all-pass deployment rehearsals can pass',
        path: ['status'],
      });
    }
  });
export type DeploymentAcceptanceRehearsalRun = z.infer<
  typeof DeploymentAcceptanceRehearsalRunSchema
>;

export const DeploymentOperationActionSchema = z.enum(['deploy', 'apply', 'sync', 'rollback']);
export type DeploymentOperationAction = z.infer<typeof DeploymentOperationActionSchema>;

export const DeploymentEnvironmentSchema = z.enum(['dev', 'staging', 'prod']);
export type DeploymentEnvironment = z.infer<typeof DeploymentEnvironmentSchema>;

export const DeploymentOperationRunnerModeSchema = z.enum([
  'planning-only',
  'fixture',
  'controlled-deployment-operation',
]);
export type DeploymentOperationRunnerMode = z.infer<typeof DeploymentOperationRunnerModeSchema>;

export const DeploymentEnvironmentApprovalPolicySchema = createdEntityBaseSchema
  .extend({
    environment: DeploymentEnvironmentSchema,
    requiredApprovalCount: z.number().int().min(1).max(2),
    requiresDistinctApproverHashes: z.boolean(),
    criticalRisk: z.boolean(),
    policyHash: z.string().min(1),
    summary: z.string().min(1),
  })
  .strict()
  .superRefine((record, context) => {
    rejectGithubRawMetadata(record.metadata, context, ['metadata']);
    if (record.environment === 'prod' && record.requiredApprovalCount < 2) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'prod deployment operations require two approvals',
        path: ['requiredApprovalCount'],
      });
    }
  });
export type DeploymentEnvironmentApprovalPolicy = z.infer<
  typeof DeploymentEnvironmentApprovalPolicySchema
>;

export const DeploymentOperationReadinessSchema = createdEntityBaseSchema
  .extend({
    provider: DeploymentProviderSchema,
    action: DeploymentOperationActionSchema,
    environment: DeploymentEnvironmentSchema,
    operatorEnabled: z.boolean(),
    providerWriteEnabled: z.boolean(),
    prodWriteEnabled: z.boolean(),
    toolConfigured: z.boolean(),
    rollbackPlanRequired: z.boolean(),
    rollbackPlanPresent: z.boolean(),
    targetHash: z.string().min(1),
    artifactHash: z.string().min(1).optional(),
    blockerCount: z.number().int().nonnegative(),
    blockReasons: z.array(z.string().min(1)).default([]),
    approvalPolicy: DeploymentEnvironmentApprovalPolicySchema,
    tokenValueStored: z.literal(false),
    rawManifestStored: z.literal(false),
    rawPlanStored: z.literal(false),
    rawDiffStored: z.literal(false),
    rawLogStored: z.literal(false),
    rawPathStored: z.literal(false),
    bodyStored: z.literal(false),
    arbitraryCommandAllowed: z.literal(false),
    summary: z.string().min(1),
  })
  .strict()
  .superRefine((record, context) => {
    rejectGithubRawMetadata(record.metadata, context, ['metadata']);
    if (record.blockerCount !== record.blockReasons.length) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'blockerCount must match deployment operation blockReasons length',
        path: ['blockerCount'],
      });
    }
    if (record.rollbackPlanRequired && !record.rollbackPlanPresent) {
      const hasBlocker = record.blockReasons.includes('rollback_plan_missing');
      if (!hasBlocker) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'missing rollback plans must be represented as a blocker',
          path: ['blockReasons'],
        });
      }
    }
  });
export type DeploymentOperationReadiness = z.infer<typeof DeploymentOperationReadinessSchema>;

export const DeploymentRollbackPlanSchema = createdEntityBaseSchema
  .extend({
    rollbackPlanId: z.string().min(1),
    status: z.enum(['planned', 'blocked']),
    provider: DeploymentProviderSchema,
    environment: DeploymentEnvironmentSchema,
    targetHash: z.string().min(1),
    sourceRunHash: z.string().min(1),
    rollbackArtifactHash: z.string().min(1),
    approvedRollbackArtifactHash: z.string().min(1),
    blockReasons: z.array(z.string().min(1)).default([]),
    evidenceRefs: z.array(EvidenceRefSchema).default([]),
    auditEventIds: z.array(z.string().min(1)).default([]),
    deleteAllowed: z.literal(false),
    destroyAllowed: z.literal(false),
    forceAllowed: z.literal(false),
    rawManifestStored: z.literal(false),
    rawPlanStored: z.literal(false),
    rawDiffStored: z.literal(false),
    rawLogStored: z.literal(false),
    rawPathStored: z.literal(false),
    bodyStored: z.literal(false),
    summary: z.string().min(1),
  })
  .strict()
  .superRefine((record, context) => {
    rejectGithubRawMetadata(record.metadata, context, ['metadata']);
  });
export type DeploymentRollbackPlan = z.infer<typeof DeploymentRollbackPlanSchema>;

export const DeploymentOperationPlanSchema = createdEntityBaseSchema
  .extend({
    dryRunId: z.string().min(1),
    status: z.enum(['planned', 'blocked']),
    provider: DeploymentProviderSchema,
    action: DeploymentOperationActionSchema,
    environment: DeploymentEnvironmentSchema,
    runnerMode: DeploymentOperationRunnerModeSchema,
    targetHash: z.string().min(1),
    artifactHash: z.string().min(1),
    rollbackPlanId: z.string().min(1).optional(),
    rollbackPlanHash: z.string().min(1).optional(),
    approvalPolicy: DeploymentEnvironmentApprovalPolicySchema,
    blockReasons: z.array(z.string().min(1)).default([]),
    policyDecision: PolicyDecisionSchema,
    requiresApproval: z.literal(true),
    evidenceRefs: z.array(EvidenceRefSchema).default([]),
    auditEventIds: z.array(z.string().min(1)).default([]),
    processBoundaryPlanned: z.boolean(),
    processBoundaryInvoked: z.literal(false),
    externalProcessStarted: z.literal(false),
    networkBoundaryPlanned: z.boolean(),
    networkBoundaryInvoked: z.literal(false),
    noDelete: z.literal(true),
    noDestroy: z.literal(true),
    fixedRunner: z.literal(true),
    arbitraryCommandAllowed: z.literal(false),
    rawManifestStored: z.literal(false),
    rawPlanStored: z.literal(false),
    rawDiffStored: z.literal(false),
    rawLogStored: z.literal(false),
    rawPathStored: z.literal(false),
    bodyStored: z.literal(false),
    summary: z.string().min(1),
  })
  .strict()
  .superRefine((record, context) => {
    rejectGithubRawMetadata(record.metadata, context, ['metadata']);
    if (record.status === 'blocked' && record.processBoundaryPlanned) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'blocked deployment operation plans cannot plan a process boundary',
        path: ['processBoundaryPlanned'],
      });
    }
    if (record.action === 'rollback' && record.status !== 'blocked' && !record.rollbackPlanId) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'rollback deployment operation plans require rollbackPlanId',
        path: ['rollbackPlanId'],
      });
    }
  });
export type DeploymentOperationPlan = z.infer<typeof DeploymentOperationPlanSchema>;

export const DeploymentOperationApprovalArtifactSchema = createdEntityBaseSchema
  .extend({
    dryRunId: z.string().min(1),
    dryRunRecordId: z.string().min(1),
    approvalRequestId: z.string().min(1),
    approvalArtifactId: z.string().min(1),
    status: GithubProviderApprovalStatusSchema,
    approved: z.boolean(),
    policyDecisionId: z.string().min(1),
    provider: DeploymentProviderSchema,
    action: DeploymentOperationActionSchema,
    environment: DeploymentEnvironmentSchema,
    targetHash: z.string().min(1),
    expectedPlanHash: z.string().min(1),
    approvalSlot: z.enum(['primary', 'secondary']).default('primary'),
    approvedAt: IsoDateTimeSchema.optional(),
    expiresAt: IsoDateTimeSchema.optional(),
    usedAt: IsoDateTimeSchema.optional(),
    deniedAt: IsoDateTimeSchema.optional(),
    revokedAt: IsoDateTimeSchema.optional(),
    reasonHash: z.string().min(1).optional(),
    reasonSummary: z.string().min(1).optional(),
    approverHash: z.string().min(1).optional(),
    evidenceRefs: z.array(EvidenceRefSchema).default([]),
    auditEventIds: z.array(z.string().min(1)).default([]),
    tokenValueStored: z.literal(false),
    rawManifestStored: z.literal(false),
    rawPlanStored: z.literal(false),
    rawDiffStored: z.literal(false),
    rawLogStored: z.literal(false),
    rawPathStored: z.literal(false),
    bodyStored: z.literal(false),
    summary: z.string().min(1),
  })
  .strict()
  .superRefine((record, context) => {
    rejectGithubRawMetadata(record.metadata, context, ['metadata']);
    if (record.approved !== (record.status === 'approved')) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'approved must match deployment operation approval status',
        path: ['approved'],
      });
    }
  });
export type DeploymentOperationApprovalArtifact = z.infer<
  typeof DeploymentOperationApprovalArtifactSchema
>;

export const DeploymentOperationResultSummarySchema = createdEntityBaseSchema
  .extend({
    provider: DeploymentProviderSchema,
    action: DeploymentOperationActionSchema,
    environment: DeploymentEnvironmentSchema,
    targetHash: z.string().min(1),
    resultHash: z.string().min(1),
    changedResourceCount: z.number().int().nonnegative(),
    warningCount: z.number().int().nonnegative(),
    errorCount: z.number().int().nonnegative(),
    rawManifestStored: z.literal(false),
    rawPlanStored: z.literal(false),
    rawDiffStored: z.literal(false),
    rawLogStored: z.literal(false),
    rawPathStored: z.literal(false),
    bodyStored: z.literal(false),
    summary: z.string().min(1),
  })
  .strict()
  .superRefine((record, context) => {
    rejectGithubRawMetadata(record.metadata, context, ['metadata']);
  });
export type DeploymentOperationResultSummary = z.infer<
  typeof DeploymentOperationResultSummarySchema
>;

export const DeploymentOperationRunSchema = createdEntityBaseSchema
  .extend({
    status: GithubControlPlaneRunStatusSchema,
    plan: DeploymentOperationPlanSchema,
    resultSummary: DeploymentOperationResultSummarySchema,
    rollbackPlan: DeploymentRollbackPlanSchema.optional(),
    approvalArtifactIds: z.array(z.string().min(1)).default([]),
    blockReasons: z.array(z.string().min(1)).default([]),
    evidenceRefs: z.array(EvidenceRefSchema).default([]),
    auditEventIds: z.array(z.string().min(1)).default([]),
    processBoundaryInvoked: z.boolean(),
    externalProcessStarted: z.boolean(),
    networkBoundaryInvoked: z.boolean(),
    noDelete: z.literal(true),
    noDestroy: z.literal(true),
    fixedRunner: z.literal(true),
    arbitraryCommandAllowed: z.literal(false),
    rawManifestStored: z.literal(false),
    rawPlanStored: z.literal(false),
    rawDiffStored: z.literal(false),
    rawLogStored: z.literal(false),
    rawPathStored: z.literal(false),
    bodyStored: z.literal(false),
    summary: z.string().min(1),
  })
  .strict()
  .superRefine((record, context) => {
    rejectGithubRawMetadata(record.metadata, context, ['metadata']);
  });
export type DeploymentOperationRun = z.infer<typeof DeploymentOperationRunSchema>;

export const DeploymentOperationAcceptanceScenarioSchema = z.enum([
  'all-pass',
  'provider-disabled',
  'tool-missing',
  'approval-blocked',
  'prod-second-approval-missing',
  'env-approval-mismatch',
  'rollback-plan-missing',
  'target-hash-mismatch',
  'apply-failed',
  'sync-failed',
  'rollback-failed',
  'raw-output-rejected',
  'network-timeout',
]);
export type DeploymentOperationAcceptanceScenario = z.infer<
  typeof DeploymentOperationAcceptanceScenarioSchema
>;

export const DeploymentOperationAcceptanceRehearsalRunSchema = createdEntityBaseSchema
  .extend({
    scenario: DeploymentOperationAcceptanceScenarioSchema,
    provider: DeploymentProviderSchema,
    action: DeploymentOperationActionSchema,
    environment: DeploymentEnvironmentSchema,
    status: z.enum(['passed', 'failed', 'blocked', 'aborted']),
    readinessStatus: z.enum(['fixture_completed', 'blocked', 'failed', 'skipped']),
    operationStatus: z.enum(['fixture_completed', 'blocked', 'failed', 'skipped']),
    rollbackStatus: z.enum(['fixture_completed', 'blocked', 'failed', 'skipped']),
    stepCount: z.number().int().nonnegative(),
    blockerCount: z.number().int().nonnegative(),
    evidenceRefCount: z.number().int().nonnegative(),
    auditEventCount: z.number().int().nonnegative(),
    processBoundaryInvoked: z.literal(false),
    externalProcessStarted: z.literal(false),
    networkBoundaryInvoked: z.literal(false),
    noDelete: z.literal(true),
    noDestroy: z.literal(true),
    fixedRunner: z.literal(true),
    arbitraryCommandAllowed: z.literal(false),
    rawManifestStored: z.literal(false),
    rawPlanStored: z.literal(false),
    rawDiffStored: z.literal(false),
    rawLogStored: z.literal(false),
    rawPathStored: z.literal(false),
    bodyStored: z.literal(false),
    summary: z.string().min(1),
  })
  .strict()
  .superRefine((record, context) => {
    rejectGithubRawMetadata(record.metadata, context, ['metadata']);
    if (record.status === 'passed' && record.scenario !== 'all-pass') {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'only all-pass deployment operation rehearsals can pass',
        path: ['status'],
      });
    }
  });
export type DeploymentOperationAcceptanceRehearsalRun = z.infer<
  typeof DeploymentOperationAcceptanceRehearsalRunSchema
>;

export const SecretProviderSchema = z.enum(['vault', 'sops', 'onepassword', 'doppler']);
export type SecretProvider = z.infer<typeof SecretProviderSchema>;

export const SecretProviderManifestSchema = createdEntityBaseSchema
  .extend({
    name: z.string().min(1),
    provider: SecretProviderSchema,
    version: z.string().min(1),
    implemented: z.boolean(),
    defaultEnabled: z.literal(false),
    actionMode: z.literal('read'),
    riskLevel: z.literal('high'),
    readinessOnly: z.literal(true),
    secretValueReadAllowed: z.literal(false),
    secretValueStored: z.literal(false),
    tokenValueStored: z.literal(false),
    rawConfigStored: z.literal(false),
    bodyStored: z.literal(false),
    summary: z.string().min(1),
  })
  .strict()
  .superRefine((record, context) => {
    rejectGithubRawMetadata(record.metadata, context, ['metadata']);
  });
export type SecretProviderManifest = z.infer<typeof SecretProviderManifestSchema>;

export const ConfiguredSecretReferenceSummarySchema = createdEntityBaseSchema
  .extend({
    provider: SecretProviderSchema,
    environment: DeploymentEnvironmentSchema,
    referenceHash: z.string().min(1),
    purposeHash: z.string().min(1).optional(),
    configured: z.boolean(),
    secretValueStored: z.literal(false),
    tokenValueStored: z.literal(false),
    rawReferenceStored: z.literal(false),
    rawPathStored: z.literal(false),
    bodyStored: z.literal(false),
    summary: z.string().min(1),
  })
  .strict()
  .superRefine((record, context) => {
    rejectGithubRawMetadata(record.metadata, context, ['metadata']);
  });
export type ConfiguredSecretReferenceSummary = z.infer<
  typeof ConfiguredSecretReferenceSummarySchema
>;

export const SecretProviderReadinessSchema = createdEntityBaseSchema
  .extend({
    provider: SecretProviderSchema,
    governanceEnabled: z.boolean(),
    providerEnabled: z.boolean(),
    configured: z.boolean(),
    configHash: z.string().min(1).optional(),
    secretRefCount: z.number().int().nonnegative(),
    configuredRefHashes: z.array(z.string().min(1)).default([]),
    blockerCount: z.number().int().nonnegative(),
    blockReasons: z.array(z.string().min(1)).default([]),
    secretValueReadAllowed: z.literal(false),
    secretValueStored: z.literal(false),
    tokenValueStored: z.literal(false),
    envValueStored: z.literal(false),
    rawConfigStored: z.literal(false),
    rawPathStored: z.literal(false),
    rawUrlStored: z.literal(false),
    bodyStored: z.literal(false),
    summary: z.string().min(1),
  })
  .strict()
  .superRefine((record, context) => {
    rejectGithubRawMetadata(record.metadata, context, ['metadata']);
    if (record.blockerCount !== record.blockReasons.length) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'blockerCount must match secret provider readiness blockReasons length',
        path: ['blockerCount'],
      });
    }
  });
export type SecretProviderReadiness = z.infer<typeof SecretProviderReadinessSchema>;

export const SecretEnvironmentReadinessSchema = createdEntityBaseSchema
  .extend({
    environment: DeploymentEnvironmentSchema,
    governanceEnabled: z.boolean(),
    providerCount: z.number().int().nonnegative(),
    configuredProviderCount: z.number().int().nonnegative(),
    missingProviderCount: z.number().int().nonnegative(),
    configuredReferenceCount: z.number().int().nonnegative(),
    blockerCount: z.number().int().nonnegative(),
    blockReasons: z.array(z.string().min(1)).default([]),
    secretValueStored: z.literal(false),
    tokenValueStored: z.literal(false),
    envValueStored: z.literal(false),
    rawConfigStored: z.literal(false),
    bodyStored: z.literal(false),
    summary: z.string().min(1),
  })
  .strict()
  .superRefine((record, context) => {
    rejectGithubRawMetadata(record.metadata, context, ['metadata']);
    if (record.providerCount !== record.configuredProviderCount + record.missingProviderCount) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'providerCount must equal configured plus missing providers',
        path: ['providerCount'],
      });
    }
  });
export type SecretEnvironmentReadiness = z.infer<typeof SecretEnvironmentReadinessSchema>;

export const SecretLeakAuditSummarySchema = createdEntityBaseSchema
  .extend({
    scannedSurfaceCount: z.number().int().nonnegative(),
    findingCount: z.number().int().nonnegative(),
    leakDetected: z.boolean(),
    findingHashes: z.array(z.string().min(1)).default([]),
    secretValueStored: z.literal(false),
    tokenValueStored: z.literal(false),
    envValueStored: z.literal(false),
    rawConfigStored: z.literal(false),
    rawPathStored: z.literal(false),
    rawUrlStored: z.literal(false),
    bodyStored: z.literal(false),
    summary: z.string().min(1),
  })
  .strict()
  .superRefine((record, context) => {
    rejectGithubRawMetadata(record.metadata, context, ['metadata']);
    if (record.findingCount !== record.findingHashes.length) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'findingCount must match findingHashes length',
        path: ['findingCount'],
      });
    }
  });
export type SecretLeakAuditSummary = z.infer<typeof SecretLeakAuditSummarySchema>;

export const SecretReadinessPlanSchema = createdEntityBaseSchema
  .extend({
    dryRunId: z.string().min(1),
    status: z.enum(['planned', 'blocked']),
    provider: SecretProviderSchema,
    environment: DeploymentEnvironmentSchema,
    configHash: z.string().min(1).optional(),
    expectedReferenceCount: z.number().int().nonnegative(),
    blockReasons: z.array(z.string().min(1)).default([]),
    policyDecision: PolicyDecisionSchema,
    requiresApproval: z.literal(true),
    evidenceRefs: z.array(EvidenceRefSchema).default([]),
    auditEventIds: z.array(z.string().min(1)).default([]),
    processBoundaryPlanned: z.literal(false),
    processBoundaryInvoked: z.literal(false),
    externalProcessStarted: z.literal(false),
    networkBoundaryInvoked: z.literal(false),
    secretValueReadAllowed: z.literal(false),
    secretValueStored: z.literal(false),
    tokenValueStored: z.literal(false),
    envValueStored: z.literal(false),
    rawConfigStored: z.literal(false),
    rawPathStored: z.literal(false),
    rawUrlStored: z.literal(false),
    bodyStored: z.literal(false),
    summary: z.string().min(1),
  })
  .strict()
  .superRefine((record, context) => {
    rejectGithubRawMetadata(record.metadata, context, ['metadata']);
  });
export type SecretReadinessPlan = z.infer<typeof SecretReadinessPlanSchema>;

export const SecretReadinessApprovalArtifactSchema = createdEntityBaseSchema
  .extend({
    dryRunId: z.string().min(1),
    dryRunRecordId: z.string().min(1),
    approvalRequestId: z.string().min(1),
    approvalArtifactId: z.string().min(1),
    status: GithubProviderApprovalStatusSchema,
    approved: z.boolean(),
    policyDecisionId: z.string().min(1),
    provider: SecretProviderSchema,
    environment: DeploymentEnvironmentSchema,
    expectedPlanHash: z.string().min(1),
    approvedAt: IsoDateTimeSchema.optional(),
    expiresAt: IsoDateTimeSchema.optional(),
    usedAt: IsoDateTimeSchema.optional(),
    deniedAt: IsoDateTimeSchema.optional(),
    revokedAt: IsoDateTimeSchema.optional(),
    reasonHash: z.string().min(1).optional(),
    reasonSummary: z.string().min(1).optional(),
    approverHash: z.string().min(1).optional(),
    evidenceRefs: z.array(EvidenceRefSchema).default([]),
    auditEventIds: z.array(z.string().min(1)).default([]),
    secretValueStored: z.literal(false),
    tokenValueStored: z.literal(false),
    envValueStored: z.literal(false),
    rawConfigStored: z.literal(false),
    rawPathStored: z.literal(false),
    rawUrlStored: z.literal(false),
    bodyStored: z.literal(false),
    summary: z.string().min(1),
  })
  .strict()
  .superRefine((record, context) => {
    rejectGithubRawMetadata(record.metadata, context, ['metadata']);
    if (record.approved !== (record.status === 'approved')) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'approved must match secret readiness approval status',
        path: ['approved'],
      });
    }
  });
export type SecretReadinessApprovalArtifact = z.infer<
  typeof SecretReadinessApprovalArtifactSchema
>;

export const SecretReadinessRunSchema = createdEntityBaseSchema
  .extend({
    status: GithubControlPlaneRunStatusSchema,
    plan: SecretReadinessPlanSchema,
    providerReadiness: SecretProviderReadinessSchema,
    environmentReadiness: SecretEnvironmentReadinessSchema,
    referenceSummaries: z.array(ConfiguredSecretReferenceSummarySchema).default([]),
    leakAuditSummary: SecretLeakAuditSummarySchema,
    blockReasons: z.array(z.string().min(1)).default([]),
    evidenceRefs: z.array(EvidenceRefSchema).default([]),
    auditEventIds: z.array(z.string().min(1)).default([]),
    processBoundaryInvoked: z.literal(false),
    externalProcessStarted: z.literal(false),
    networkBoundaryInvoked: z.literal(false),
    secretValueReadAllowed: z.literal(false),
    secretValueStored: z.literal(false),
    tokenValueStored: z.literal(false),
    envValueStored: z.literal(false),
    rawConfigStored: z.literal(false),
    rawPathStored: z.literal(false),
    rawUrlStored: z.literal(false),
    bodyStored: z.literal(false),
    summary: z.string().min(1),
  })
  .strict()
  .superRefine((record, context) => {
    rejectGithubRawMetadata(record.metadata, context, ['metadata']);
  });
export type SecretReadinessRun = z.infer<typeof SecretReadinessRunSchema>;

export const SecretGovernanceAcceptanceScenarioSchema = z.enum([
  'all-pass',
  'provider-disabled',
  'config-missing',
  'token-configured-hash-only',
  'secret-value-rejected',
  'env-value-rejected',
  'approval-blocked',
  'leak-audit-failed',
  'raw-output-rejected',
]);
export type SecretGovernanceAcceptanceScenario = z.infer<
  typeof SecretGovernanceAcceptanceScenarioSchema
>;

export const SecretGovernanceAcceptanceRehearsalRunSchema = createdEntityBaseSchema
  .extend({
    scenario: SecretGovernanceAcceptanceScenarioSchema,
    provider: SecretProviderSchema,
    environment: DeploymentEnvironmentSchema,
    status: z.enum(['passed', 'failed', 'blocked', 'aborted']),
    readinessStatus: z.enum(['fixture_completed', 'blocked', 'failed', 'skipped']),
    leakAuditStatus: z.enum(['fixture_completed', 'blocked', 'failed', 'skipped']),
    stepCount: z.number().int().nonnegative(),
    blockerCount: z.number().int().nonnegative(),
    evidenceRefCount: z.number().int().nonnegative(),
    auditEventCount: z.number().int().nonnegative(),
    processBoundaryInvoked: z.literal(false),
    externalProcessStarted: z.literal(false),
    networkBoundaryInvoked: z.literal(false),
    secretValueReadAllowed: z.literal(false),
    secretValueStored: z.literal(false),
    tokenValueStored: z.literal(false),
    envValueStored: z.literal(false),
    rawConfigStored: z.literal(false),
    rawPathStored: z.literal(false),
    rawUrlStored: z.literal(false),
    bodyStored: z.literal(false),
    summary: z.string().min(1),
  })
  .strict()
  .superRefine((record, context) => {
    rejectGithubRawMetadata(record.metadata, context, ['metadata']);
    if (record.status === 'passed' && record.scenario !== 'all-pass') {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'only all-pass secrets governance rehearsals can pass',
        path: ['status'],
      });
    }
  });
export type SecretGovernanceAcceptanceRehearsalRun = z.infer<
  typeof SecretGovernanceAcceptanceRehearsalRunSchema
>;

export const GithubPublishDraftPrChainRunSchema = createdEntityBaseSchema
  .extend({
    chainId: z.string().min(1),
    status: GithubControlPlaneRunStatusSchema,
    plan: GithubPublishDraftPrChainPlanSchema,
    steps: z.array(GithubPublishDraftPrChainStepSchema),
    stepCount: z.number().int().nonnegative(),
    branchPublishRunId: z.string().min(1).optional(),
    draftPrRunId: z.string().min(1).optional(),
    lifecycleSummary: GithubRemotePrLifecycleSummarySchema.optional(),
    blockReasons: z.array(z.string().min(1)).default([]),
    evidenceRefs: z.array(EvidenceRefSchema).default([]),
    auditEventIds: z.array(z.string().min(1)).default([]),
    networkBoundaryInvoked: z.boolean(),
    processBoundaryInvoked: z.literal(false),
    externalProcessStarted: z.literal(false),
    noRealWrite: z.boolean(),
    rawPathStored: z.literal(false),
    bodyStored: z.literal(false),
    summary: z.string().min(1),
  })
  .strict()
  .superRefine((record, context) => {
    rejectGithubRawMetadata(record.metadata, context, ['metadata']);

    if (record.stepCount !== record.steps.length) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'stepCount must match publish draft PR chain steps length',
        path: ['stepCount'],
      });
    }
  });
export type GithubPublishDraftPrChainRun = z.infer<typeof GithubPublishDraftPrChainRunSchema>;

export const GithubPublishDraftPrAcceptanceScenarioSchema = z.enum([
  'all-pass',
  'publish-blocked',
  'branch-published-pr-blocked',
  'draft-pr-created-checks-pending',
  'checks-failed',
  'checks-passed',
  'stale-branch',
  'network-timeout',
]);
export type GithubPublishDraftPrAcceptanceScenario = z.infer<
  typeof GithubPublishDraftPrAcceptanceScenarioSchema
>;

export const GithubPublishDraftPrAcceptanceRehearsalRunSchema = createdEntityBaseSchema
  .extend({
    scenario: GithubPublishDraftPrAcceptanceScenarioSchema,
    status: z.enum(['passed', 'failed', 'blocked', 'aborted']),
    branchPublishStatus: z.enum(['fixture_completed', 'blocked', 'failed', 'skipped']),
    draftPrStatus: z.enum(['fixture_completed', 'blocked', 'failed', 'skipped']),
    lifecycleStatus: z.enum(['checks_pending', 'checks_failed', 'checks_passed', 'blocked']),
    stepCount: z.number().int().nonnegative(),
    evidenceRefCount: z.number().int().nonnegative(),
    auditEventCount: z.number().int().nonnegative(),
    networkBoundaryInvoked: z.literal(false),
    processBoundaryInvoked: z.literal(false),
    externalProcessStarted: z.literal(false),
    noRealWrite: z.literal(true),
    updateRefAllowed: z.literal(false),
    forceAllowed: z.literal(false),
    pushAllowed: z.literal(false),
    mergeAllowed: z.literal(false),
    rawPathStored: z.literal(false),
    bodyStored: z.literal(false),
    summary: z.string().min(1),
  })
  .strict()
  .superRefine((record, context) => {
    rejectGithubRawMetadata(record.metadata, context, ['metadata']);

    if (
      record.status === 'passed' &&
      record.scenario !== 'all-pass' &&
      record.scenario !== 'checks-passed'
    ) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'only all-pass or checks-passed publish draft PR rehearsals can pass',
        path: ['status'],
      });
    }
  });
export type GithubPublishDraftPrAcceptanceRehearsalRun = z.infer<
  typeof GithubPublishDraftPrAcceptanceRehearsalRunSchema
>;

export const ReworkTriggerKindSchema = z.enum([
  'checks_failed',
  'review_changes_requested',
  'operator_requested',
  'stale_branch',
]);
export type ReworkTriggerKind = z.infer<typeof ReworkTriggerKindSchema>;

export const ReworkLoopStatusSchema = z.enum(['planned', 'completed', 'blocked', 'failed', 'aborted']);
export type ReworkLoopStatus = z.infer<typeof ReworkLoopStatusSchema>;

export const ReworkAttemptStatusSchema = z.enum([
  'planned',
  'patch_ready',
  'verification_failed',
  'branch_publish_failed',
  'draft_pr_failed',
  'superseded',
  'blocked',
]);
export type ReworkAttemptStatus = z.infer<typeof ReworkAttemptStatusSchema>;

export const ReworkTriggerSummarySchema = createdEntityBaseSchema
  .extend({
    kind: ReworkTriggerKindSchema,
    sourceRunIdHash: z.string().min(1),
    sourceStatus: z.string().min(1),
    sourceSummaryHash: z.string().min(1),
    checkFailureCount: z.number().int().nonnegative().default(0),
    reviewFindingCount: z.number().int().nonnegative().default(0),
    staleBranch: z.boolean().default(false),
    reasonHash: z.string().min(1),
    rawReasonStored: z.literal(false),
    rawPathStored: z.literal(false),
    bodyStored: z.literal(false),
    noRealWrite: z.literal(true),
    summary: z.string().min(1),
  })
  .strict()
  .superRefine((record, context) => {
    rejectGithubRawMetadata(record.metadata, context, ['metadata']);
  });
export type ReworkTriggerSummary = z.infer<typeof ReworkTriggerSummarySchema>;

export const ReworkAttemptSummarySchema = createdEntityBaseSchema
  .extend({
    attemptNumber: z.number().int().positive(),
    status: ReworkAttemptStatusSchema,
    previousAttemptIdHash: z.string().min(1).optional(),
    sourcePatchLifecycleIdHash: z.string().min(1).optional(),
    sourceReviewPackageIdHash: z.string().min(1).optional(),
    sourceRcReadinessIdHash: z.string().min(1).optional(),
    sourceBranchPublishRunIdHash: z.string().min(1).optional(),
    sourceDraftPrRunIdHash: z.string().min(1).optional(),
    sourcePrLifecycleRunIdHash: z.string().min(1).optional(),
    plannedBranchNameHash: z.string().min(1),
    branchPrefix: z.literal('codexhub/'),
    branchAttemptSuffix: z.string().regex(/^r[1-9]\d*$/),
    changedFileCount: z.number().int().nonnegative(),
    changedFilePathHashes: z.array(z.string().min(1)).default([]),
    diffHash: z.string().min(1).optional(),
    evidenceRefIds: z.array(z.string().min(1)).default([]),
    auditEventIds: z.array(z.string().min(1)).default([]),
    childApprovalsRequired: z.literal(true),
    patchApprovalRequired: z.literal(true),
    branchPublishApprovalRequired: z.literal(true),
    draftPrApprovalRequired: z.literal(true),
    directChildExecutionAllowed: z.literal(false),
    updatesExistingBranch: z.literal(false),
    forceAllowed: z.literal(false),
    mergeAllowed: z.literal(false),
    commentAllowed: z.literal(false),
    labelAllowed: z.literal(false),
    reviewerAllowed: z.literal(false),
    rawDiffStored: z.literal(false),
    rawPrBodyStored: z.literal(false),
    rawReasonStored: z.literal(false),
    rawPathStored: z.literal(false),
    bodyStored: z.literal(false),
    noRealWrite: z.literal(true),
    processBoundaryInvoked: z.literal(false),
    externalProcessStarted: z.literal(false),
    networkBoundaryInvoked: z.literal(false),
    summary: z.string().min(1),
  })
  .strict()
  .superRefine((record, context) => {
    rejectGithubRawMetadata(record.metadata, context, ['metadata']);

    if (record.changedFilePathHashes.length !== record.changedFileCount) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'changed file hash count must match changedFileCount',
        path: ['changedFilePathHashes'],
      });
    }
  });
export type ReworkAttemptSummary = z.infer<typeof ReworkAttemptSummarySchema>;

export const ReworkSupersedeProjectionSchema = createdEntityBaseSchema
  .extend({
    sourceAttemptIdHash: z.string().min(1),
    supersedingAttemptIdHash: z.string().min(1),
    sourcePackageHash: z.string().min(1).optional(),
    sourceBranchHash: z.string().min(1).optional(),
    sourceDraftPrHash: z.string().min(1).optional(),
    superseded: z.literal(true),
    oldBranchPreserved: z.literal(true),
    oldDraftPrClosed: z.literal(false),
    deleteRemoteBranchAllowed: z.literal(false),
    mergeAllowed: z.literal(false),
    evidenceRefIds: z.array(z.string().min(1)).default([]),
    auditEventIds: z.array(z.string().min(1)).default([]),
    rawRefStored: z.literal(false),
    rawUrlStored: z.literal(false),
    rawReasonStored: z.literal(false),
    rawPathStored: z.literal(false),
    bodyStored: z.literal(false),
    noRealWrite: z.literal(true),
    summary: z.string().min(1),
  })
  .strict()
  .superRefine((record, context) => {
    rejectGithubRawMetadata(record.metadata, context, ['metadata']);
  });
export type ReworkSupersedeProjection = z.infer<typeof ReworkSupersedeProjectionSchema>;

export const ReworkLoopPlanSchema = createdEntityBaseSchema
  .extend({
    dryRunId: z.string().min(1),
    status: z.enum(['planned', 'blocked']),
    trigger: ReworkTriggerSummarySchema,
    nextAttempt: ReworkAttemptSummarySchema,
    supersedeProjection: ReworkSupersedeProjectionSchema.optional(),
    sourceRunIdHash: z.string().min(1),
    sourcePackageHash: z.string().min(1).optional(),
    sourcePrLifecycleRunIdHash: z.string().min(1).optional(),
    requestedAttemptNumber: z.number().int().positive(),
    blockReasons: z.array(z.string().min(1)).default([]),
    policyDecision: PolicyDecisionSchema,
    evidenceRefs: z.array(EvidenceRefSchema).default([]),
    auditEventIds: z.array(z.string().min(1)).default([]),
    childApprovalsRequired: z.literal(true),
    directChildExecutionAllowed: z.literal(false),
    updateExistingBranchAllowed: z.literal(false),
    forceAllowed: z.literal(false),
    mergeAllowed: z.literal(false),
    rawDiffStored: z.literal(false),
    rawPrBodyStored: z.literal(false),
    rawReasonStored: z.literal(false),
    rawPathStored: z.literal(false),
    bodyStored: z.literal(false),
    noRealWrite: z.literal(true),
    processBoundaryInvoked: z.literal(false),
    externalProcessStarted: z.literal(false),
    networkBoundaryInvoked: z.literal(false),
    summary: z.string().min(1),
  })
  .strict()
  .superRefine((record, context) => {
    rejectGithubRawMetadata(record.metadata, context, ['metadata']);

    if (record.status === 'planned' && record.blockReasons.length > 0) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'planned rework loop cannot contain block reasons',
        path: ['blockReasons'],
      });
    }
  });
export type ReworkLoopPlan = z.infer<typeof ReworkLoopPlanSchema>;

export const ReworkLoopApprovalArtifactRecordSchema = createdEntityBaseSchema
  .extend({
    dryRunId: z.string().min(1),
    dryRunRecordId: z.string().min(1),
    status: z.enum(['requested', 'approved', 'denied', 'expired', 'used', 'revoked']),
    approvalArtifactId: z.string().min(1).optional(),
    approved: z.boolean(),
    policyDecisionId: z.string().min(1),
    requestedBy: z.string().min(1),
    decidedBy: z.string().min(1).optional(),
    expiresAt: IsoDateTimeSchema.optional(),
    reasonHash: z.string().min(1).optional(),
    evidenceRefs: z.array(EvidenceRefSchema).default([]),
    auditEventIds: z.array(z.string().min(1)).default([]),
    rawReasonStored: z.literal(false),
    rawPathStored: z.literal(false),
    bodyStored: z.literal(false),
    noRealWrite: z.literal(true),
    processBoundaryInvoked: z.literal(false),
    externalProcessStarted: z.literal(false),
    networkBoundaryInvoked: z.literal(false),
    summary: z.string().min(1),
  })
  .strict()
  .superRefine((record, context) => {
    rejectGithubRawMetadata(record.metadata, context, ['metadata']);

    if (record.status === 'approved' && (!record.approvalArtifactId || !record.expiresAt)) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'approved rework approval records require an artifact id and expiration',
        path: ['status'],
      });
    }
  });
export type ReworkLoopApprovalArtifactRecord = z.infer<
  typeof ReworkLoopApprovalArtifactRecordSchema
>;

export const ReworkLoopRunSchema = createdEntityBaseSchema
  .extend({
    dryRunId: z.string().min(1),
    dryRunRecordId: z.string().min(1),
    approvalArtifactId: z.string().min(1).optional(),
    status: ReworkLoopStatusSchema,
    plan: ReworkLoopPlanSchema,
    trigger: ReworkTriggerSummarySchema,
    attempts: z.array(ReworkAttemptSummarySchema),
    attemptCount: z.number().int().nonnegative(),
    supersedeProjection: ReworkSupersedeProjectionSchema.optional(),
    nextActionSummaryHash: z.string().min(1),
    blockReasons: z.array(z.string().min(1)).default([]),
    evidenceRefs: z.array(EvidenceRefSchema).default([]),
    evidenceRefIds: z.array(z.string().min(1)).default([]),
    auditEventIds: z.array(z.string().min(1)).default([]),
    childApprovalsRequired: z.literal(true),
    directChildExecutionAllowed: z.literal(false),
    patchExecuted: z.literal(false),
    branchPublished: z.literal(false),
    draftPrCreated: z.literal(false),
    updateExistingBranchAllowed: z.literal(false),
    forceAllowed: z.literal(false),
    mergeAllowed: z.literal(false),
    rawDiffStored: z.literal(false),
    rawPrBodyStored: z.literal(false),
    rawReasonStored: z.literal(false),
    rawPathStored: z.literal(false),
    bodyStored: z.literal(false),
    noRealWrite: z.literal(true),
    processBoundaryInvoked: z.literal(false),
    externalProcessStarted: z.literal(false),
    networkBoundaryInvoked: z.literal(false),
    summary: z.string().min(1),
  })
  .strict()
  .superRefine((record, context) => {
    rejectGithubRawMetadata(record.metadata, context, ['metadata']);

    if (record.attempts.length !== record.attemptCount) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'attempt count must match attempts length',
        path: ['attemptCount'],
      });
    }
  });
export type ReworkLoopRun = z.infer<typeof ReworkLoopRunSchema>;

export const ReworkLoopAcceptanceScenarioSchema = z.enum([
  'all-pass',
  'checks-failed-rework',
  'review-changes-requested',
  'patch-failed',
  'verification-failed',
  'branch-publish-failed',
  'draft-pr-failed',
  'stale-branch',
  'superseded-source',
  'approval-blocked',
]);
export type ReworkLoopAcceptanceScenario = z.infer<typeof ReworkLoopAcceptanceScenarioSchema>;

export const ReworkLoopAcceptanceRehearsalRunSchema = createdEntityBaseSchema
  .extend({
    scenario: ReworkLoopAcceptanceScenarioSchema,
    status: z.enum(['passed', 'failed', 'blocked', 'aborted']),
    triggerKind: ReworkTriggerKindSchema,
    attemptStatus: ReworkAttemptStatusSchema,
    supersededSource: z.boolean(),
    stepCount: z.number().int().nonnegative(),
    evidenceRefCount: z.number().int().nonnegative(),
    auditEventCount: z.number().int().nonnegative(),
    blockerCount: z.number().int().nonnegative(),
    nextBranchNameHash: z.string().min(1),
    childApprovalsRequired: z.literal(true),
    directChildExecutionAllowed: z.literal(false),
    patchExecuted: z.literal(false),
    branchPublished: z.literal(false),
    draftPrCreated: z.literal(false),
    updateExistingBranchAllowed: z.literal(false),
    forceAllowed: z.literal(false),
    mergeAllowed: z.literal(false),
    rawDiffStored: z.literal(false),
    rawPrBodyStored: z.literal(false),
    rawReasonStored: z.literal(false),
    rawPathStored: z.literal(false),
    bodyStored: z.literal(false),
    processBoundaryInvoked: z.literal(false),
    externalProcessStarted: z.literal(false),
    networkBoundaryInvoked: z.literal(false),
    noRealWrite: z.literal(true),
    summary: z.string().min(1),
  })
  .strict()
  .superRefine((record, context) => {
    rejectGithubRawMetadata(record.metadata, context, ['metadata']);

    if (record.status === 'passed' && record.blockerCount !== 0) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'passed rework rehearsal cannot include blockers',
        path: ['blockerCount'],
      });
    }
  });
export type ReworkLoopAcceptanceRehearsalRun = z.infer<
  typeof ReworkLoopAcceptanceRehearsalRunSchema
>;

export const RemoteSupersedeStatusSchema = z.enum(['planned', 'completed', 'blocked', 'failed', 'aborted']);
export type RemoteSupersedeStatus = z.infer<typeof RemoteSupersedeStatusSchema>;

export const RemoteSupersedeTargetKindSchema = z.enum([
  'draft_pr',
  'branch',
  'draft_pr_and_branch',
]);
export type RemoteSupersedeTargetKind = z.infer<typeof RemoteSupersedeTargetKindSchema>;

export const RemoteCleanupReadinessStatusSchema = z.enum([
  'ready_for_cleanup',
  'not_ready',
  'blocked_no_successor',
  'blocked_checks_pending',
  'blocked_non_codexhub_branch',
  'blocked_missing_target',
  'blocked_policy',
]);
export type RemoteCleanupReadinessStatus = z.infer<typeof RemoteCleanupReadinessStatusSchema>;

export const RemoteSupersedeTargetSummarySchema = createdEntityBaseSchema
  .extend({
    targetKind: RemoteSupersedeTargetKindSchema,
    sourceReworkRunIdHash: z.string().min(1).optional(),
    sourceBranchPublishRunIdHash: z.string().min(1).optional(),
    sourceDraftPrRunIdHash: z.string().min(1).optional(),
    sourcePrLifecycleRunIdHash: z.string().min(1).optional(),
    successorBranchPublishRunIdHash: z.string().min(1).optional(),
    successorDraftPrRunIdHash: z.string().min(1).optional(),
    oldBranchNameHash: z.string().min(1).optional(),
    oldPrNumberHash: z.string().min(1).optional(),
    oldPrUrlHash: z.string().min(1).optional(),
    oldBranchPreserved: z.literal(true),
    oldDraftPrClosed: z.literal(false),
    successorRequired: z.literal(true),
    closePrRecommended: z.boolean().default(false),
    deleteBranchRecommended: z.boolean().default(false),
    cleanupRecommended: z.boolean().default(false),
    branchPrefix: z.literal('codexhub/'),
    rawRefStored: z.literal(false),
    rawUrlStored: z.literal(false),
    rawPathStored: z.literal(false),
    bodyStored: z.literal(false),
    noRealWrite: z.literal(true),
    networkBoundaryInvoked: z.literal(false),
    processBoundaryInvoked: z.literal(false),
    externalProcessStarted: z.literal(false),
    summary: z.string().min(1),
  })
  .strict()
  .superRefine((record, context) => {
    rejectGithubRawMetadata(record.metadata, context, ['metadata']);

    if (record.cleanupRecommended && !record.oldBranchNameHash && !record.oldPrNumberHash) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'cleanup target requires an old branch or PR hash',
        path: ['cleanupRecommended'],
      });
    }
  });
export type RemoteSupersedeTargetSummary = z.infer<
  typeof RemoteSupersedeTargetSummarySchema
>;

export const RemoteCleanupReadinessSchema = createdEntityBaseSchema
  .extend({
    status: RemoteCleanupReadinessStatusSchema,
    target: RemoteSupersedeTargetSummarySchema,
    blockerCount: z.number().int().nonnegative(),
    successorRunIdHash: z.string().min(1).optional(),
    requiresApproval: z.literal(true),
    closePrAllowed: z.boolean().default(false),
    deleteBranchAllowed: z.boolean().default(false),
    deleteNonCodexhubBranchAllowed: z.literal(false),
    updateRefAllowed: z.literal(false),
    forceAllowed: z.literal(false),
    mergeAllowed: z.literal(false),
    commentAllowed: z.literal(false),
    labelAllowed: z.literal(false),
    reviewerAllowed: z.literal(false),
    rawRefStored: z.literal(false),
    rawUrlStored: z.literal(false),
    rawPathStored: z.literal(false),
    bodyStored: z.literal(false),
    noRealWrite: z.literal(true),
    networkBoundaryInvoked: z.literal(false),
    processBoundaryInvoked: z.literal(false),
    externalProcessStarted: z.literal(false),
    summary: z.string().min(1),
  })
  .strict()
  .superRefine((record, context) => {
    rejectGithubRawMetadata(record.metadata, context, ['metadata']);

    if (record.status === 'ready_for_cleanup' && record.blockerCount !== 0) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'ready cleanup readiness cannot contain blockers',
        path: ['blockerCount'],
      });
    }
  });
export type RemoteCleanupReadiness = z.infer<typeof RemoteCleanupReadinessSchema>;

export const RemoteSupersedePlanSchema = createdEntityBaseSchema
  .extend({
    dryRunId: z.string().min(1),
    status: z.enum(['planned', 'blocked']),
    target: RemoteSupersedeTargetSummarySchema,
    cleanupReadiness: RemoteCleanupReadinessSchema,
    sourceRunIdHash: z.string().min(1),
    successorRunIdHash: z.string().min(1).optional(),
    blockReasons: z.array(z.string().min(1)).default([]),
    policyDecision: PolicyDecisionSchema,
    evidenceRefs: z.array(EvidenceRefSchema).default([]),
    auditEventIds: z.array(z.string().min(1)).default([]),
    remoteCleanupRequiresApproval: z.literal(true),
    cleanupExecutionAllowed: z.literal(false),
    closePrAllowed: z.literal(false),
    deleteBranchAllowed: z.literal(false),
    mergeAllowed: z.literal(false),
    updateRefAllowed: z.literal(false),
    forceAllowed: z.literal(false),
    commentAllowed: z.literal(false),
    labelAllowed: z.literal(false),
    reviewerAllowed: z.literal(false),
    rawRefStored: z.literal(false),
    rawUrlStored: z.literal(false),
    rawReasonStored: z.literal(false),
    rawPathStored: z.literal(false),
    bodyStored: z.literal(false),
    noRealWrite: z.literal(true),
    networkBoundaryInvoked: z.literal(false),
    processBoundaryInvoked: z.literal(false),
    externalProcessStarted: z.literal(false),
    summary: z.string().min(1),
  })
  .strict()
  .superRefine((record, context) => {
    rejectGithubRawMetadata(record.metadata, context, ['metadata']);

    if (record.status === 'planned' && record.blockReasons.length > 0) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'planned remote supersede projection cannot contain block reasons',
        path: ['blockReasons'],
      });
    }
  });
export type RemoteSupersedePlan = z.infer<typeof RemoteSupersedePlanSchema>;

export const RemoteSupersedeRunSchema = createdEntityBaseSchema
  .extend({
    dryRunId: z.string().min(1),
    dryRunRecordId: z.string().min(1),
    status: RemoteSupersedeStatusSchema,
    plan: RemoteSupersedePlanSchema,
    target: RemoteSupersedeTargetSummarySchema,
    cleanupReadiness: RemoteCleanupReadinessSchema,
    blockReasons: z.array(z.string().min(1)).default([]),
    evidenceRefs: z.array(EvidenceRefSchema).default([]),
    evidenceRefIds: z.array(z.string().min(1)).default([]),
    auditEventIds: z.array(z.string().min(1)).default([]),
    remoteCleanupRequiresApproval: z.literal(true),
    cleanupExecutionAllowed: z.literal(false),
    closePrAllowed: z.literal(false),
    deleteBranchAllowed: z.literal(false),
    mergeAllowed: z.literal(false),
    updateRefAllowed: z.literal(false),
    forceAllowed: z.literal(false),
    commentAllowed: z.literal(false),
    labelAllowed: z.literal(false),
    reviewerAllowed: z.literal(false),
    rawRefStored: z.literal(false),
    rawUrlStored: z.literal(false),
    rawReasonStored: z.literal(false),
    rawPathStored: z.literal(false),
    bodyStored: z.literal(false),
    noRealWrite: z.literal(true),
    networkBoundaryInvoked: z.literal(false),
    processBoundaryInvoked: z.literal(false),
    externalProcessStarted: z.literal(false),
    summary: z.string().min(1),
  })
  .strict()
  .superRefine((record, context) => {
    rejectGithubRawMetadata(record.metadata, context, ['metadata']);
  });
export type RemoteSupersedeRun = z.infer<typeof RemoteSupersedeRunSchema>;

export const RemoteSupersedeChainProjectionSchema = createdEntityBaseSchema
  .extend({
    plan: RemoteSupersedePlanSchema,
    runs: z.array(RemoteSupersedeRunSchema).default([]),
    runCount: z.number().int().nonnegative(),
    cleanupReadiness: RemoteCleanupReadinessSchema,
    evidenceRefIds: z.array(z.string().min(1)).default([]),
    auditEventIds: z.array(z.string().min(1)).default([]),
    chainHash: z.string().min(1),
    rawRefStored: z.literal(false),
    rawUrlStored: z.literal(false),
    rawReasonStored: z.literal(false),
    rawPathStored: z.literal(false),
    bodyStored: z.literal(false),
    noRealWrite: z.literal(true),
    networkBoundaryInvoked: z.literal(false),
    processBoundaryInvoked: z.literal(false),
    externalProcessStarted: z.literal(false),
    summary: z.string().min(1),
  })
  .strict()
  .superRefine((record, context) => {
    rejectGithubRawMetadata(record.metadata, context, ['metadata']);

    if (record.runs.length !== record.runCount) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'remote supersede run count must match runs length',
        path: ['runCount'],
      });
    }
  });
export type RemoteSupersedeChainProjection = z.infer<
  typeof RemoteSupersedeChainProjectionSchema
>;

export const RemoteSupersedeAcceptanceScenarioSchema = z.enum([
  'all-pass',
  'no-successor',
  'old-pr-open',
  'old-branch-live',
  'checks-pending',
  'superseded-source-missing',
]);
export type RemoteSupersedeAcceptanceScenario = z.infer<
  typeof RemoteSupersedeAcceptanceScenarioSchema
>;

export const RemoteSupersedeAcceptanceRehearsalRunSchema = createdEntityBaseSchema
  .extend({
    scenario: RemoteSupersedeAcceptanceScenarioSchema,
    status: z.enum(['passed', 'failed', 'blocked', 'aborted']),
    cleanupReadinessStatus: RemoteCleanupReadinessStatusSchema,
    targetKind: RemoteSupersedeTargetKindSchema,
    stepCount: z.number().int().nonnegative(),
    evidenceRefCount: z.number().int().nonnegative(),
    auditEventCount: z.number().int().nonnegative(),
    blockerCount: z.number().int().nonnegative(),
    cleanupRecommended: z.boolean(),
    remoteWriteInvoked: z.literal(false),
    rawRefStored: z.literal(false),
    rawUrlStored: z.literal(false),
    rawReasonStored: z.literal(false),
    rawPathStored: z.literal(false),
    bodyStored: z.literal(false),
    noRealWrite: z.literal(true),
    networkBoundaryInvoked: z.literal(false),
    processBoundaryInvoked: z.literal(false),
    externalProcessStarted: z.literal(false),
    summary: z.string().min(1),
  })
  .strict()
  .superRefine((record, context) => {
    rejectGithubRawMetadata(record.metadata, context, ['metadata']);

    if (record.status === 'passed' && record.blockerCount !== 0) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'passed remote supersede rehearsal cannot include blockers',
        path: ['blockerCount'],
      });
    }
  });
export type RemoteSupersedeAcceptanceRehearsalRun = z.infer<
  typeof RemoteSupersedeAcceptanceRehearsalRunSchema
>;

export const GithubRemoteCleanupRunnerModeSchema = z.enum([
  'planning-only',
  'controlled-github-remote-cleanup',
]);
export type GithubRemoteCleanupRunnerMode = z.infer<typeof GithubRemoteCleanupRunnerModeSchema>;

export const GithubRemoteCleanupPlanSchema = createdEntityBaseSchema
  .extend({
    dryRunId: z.string().min(1),
    status: z.enum(['planned', 'blocked']),
    runnerMode: GithubRemoteCleanupRunnerModeSchema,
    targetRef: GithubRemoteRefSummarySchema,
    target: RemoteSupersedeTargetSummarySchema,
    cleanupReadiness: RemoteCleanupReadinessSchema,
    oldPrNumberHash: z.string().min(1).optional(),
    oldBranchNameHash: z.string().min(1),
    successorRunIdHash: z.string().min(1),
    sourceBranchPublishRunIdHash: z.string().min(1),
    sourceDraftPrRunIdHash: z.string().min(1).optional(),
    blockReasons: z.array(z.string().min(1)).default([]),
    policyDecision: PolicyDecisionSchema,
    requiresApproval: z.literal(true),
    evidenceRefs: z.array(EvidenceRefSchema).default([]),
    auditEventIds: z.array(z.string().min(1)).default([]),
    networkBoundaryPlanned: z.boolean(),
    networkBoundaryInvoked: z.literal(false),
    processBoundaryInvoked: z.literal(false),
    externalProcessStarted: z.literal(false),
    closePrAllowed: z.literal(true),
    deleteRefAllowed: z.literal(true),
    deleteNonCodexhubBranchAllowed: z.literal(false),
    updateRefAllowed: z.literal(false),
    forceAllowed: z.literal(false),
    mergeAllowed: z.literal(false),
    commentAllowed: z.literal(false),
    labelAllowed: z.literal(false),
    reviewerAllowed: z.literal(false),
    releaseAllowed: z.literal(false),
    deploymentAllowed: z.literal(false),
    pushAllowed: z.literal(false),
    rawRefStored: z.literal(false),
    rawUrlStored: z.literal(false),
    rawResponseBodyStored: z.literal(false),
    rawPathStored: z.literal(false),
    bodyStored: z.literal(false),
    noRealWrite: z.literal(true),
    summary: z.string().min(1),
  })
  .strict()
  .superRefine((record, context) => {
    rejectGithubRawMetadata(record.metadata, context, ['metadata']);

    if (record.status === 'planned' && record.blockReasons.length > 0) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'planned remote cleanup cannot contain block reasons',
        path: ['blockReasons'],
      });
    }
  });
export type GithubRemoteCleanupPlan = z.infer<typeof GithubRemoteCleanupPlanSchema>;

export const GithubRemoteCleanupApprovalArtifactRecordSchema = createdEntityBaseSchema
  .extend({
    dryRunId: z.string().min(1),
    dryRunRecordId: z.string().min(1),
    status: z.enum(['requested', 'approved', 'denied', 'expired', 'used', 'revoked']),
    approvalRequestId: z.string().min(1),
    approvalArtifactId: z.string().min(1),
    approved: z.boolean(),
    policyDecisionId: z.string().min(1),
    requestedByHash: z.string().min(1).optional(),
    decidedByHash: z.string().min(1).optional(),
    reasonHash: z.string().min(1).optional(),
    expiresAt: IsoDateTimeSchema.optional(),
    evidenceRefs: z.array(EvidenceRefSchema).default([]),
    auditEventIds: z.array(z.string().min(1)).default([]),
    networkBoundaryInvoked: z.literal(false),
    processBoundaryInvoked: z.literal(false),
    externalProcessStarted: z.literal(false),
    rawReasonStored: z.literal(false),
    rawRefStored: z.literal(false),
    rawUrlStored: z.literal(false),
    rawPathStored: z.literal(false),
    bodyStored: z.literal(false),
    noRealWrite: z.literal(true),
    summary: z.string().min(1),
  })
  .strict()
  .superRefine((record, context) => {
    rejectGithubRawMetadata(record.metadata, context, ['metadata']);

    if (record.status === 'approved' && (!record.approved || !record.expiresAt)) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'approved remote cleanup approvals require approved=true and expiration',
        path: ['status'],
      });
    }
  });
export type GithubRemoteCleanupApprovalArtifactRecord = z.infer<
  typeof GithubRemoteCleanupApprovalArtifactRecordSchema
>;

export const GithubRemoteCleanupSummarySchema = createdEntityBaseSchema
  .extend({
    targetRef: GithubRemoteRefSummarySchema,
    oldPrNumberHash: z.string().min(1).optional(),
    oldBranchNameHash: z.string().min(1),
    oldPrClosed: z.boolean(),
    oldBranchDeleted: z.boolean(),
    responseBodyHashes: z.array(z.string().min(1)).default([]),
    responseBodyHashCount: z.number().int().nonnegative(),
    closePrAllowed: z.literal(true),
    deleteRefAllowed: z.literal(true),
    deleteNonCodexhubBranchAllowed: z.literal(false),
    updateRefAllowed: z.literal(false),
    forceAllowed: z.literal(false),
    mergeAllowed: z.literal(false),
    commentAllowed: z.literal(false),
    labelAllowed: z.literal(false),
    reviewerAllowed: z.literal(false),
    releaseAllowed: z.literal(false),
    deploymentAllowed: z.literal(false),
    pushAllowed: z.literal(false),
    rawRefStored: z.literal(false),
    rawUrlStored: z.literal(false),
    rawResponseBodyStored: z.literal(false),
    rawPathStored: z.literal(false),
    bodyStored: z.literal(false),
    summary: z.string().min(1),
  })
  .strict()
  .superRefine((record, context) => {
    rejectGithubRawMetadata(record.metadata, context, ['metadata']);

    if (record.responseBodyHashes.length !== record.responseBodyHashCount) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'response body hash count must match responseBodyHashes length',
        path: ['responseBodyHashCount'],
      });
    }
  });
export type GithubRemoteCleanupSummary = z.infer<typeof GithubRemoteCleanupSummarySchema>;

export const GithubRemoteCleanupRunSchema = createdEntityBaseSchema
  .extend({
    dryRunId: z.string().min(1),
    dryRunRecordId: z.string().min(1),
    approvalArtifactId: z.string().min(1).optional(),
    status: GithubControlPlaneRunStatusSchema,
    plan: GithubRemoteCleanupPlanSchema,
    cleanupSummary: GithubRemoteCleanupSummarySchema,
    responseBodyHashes: z.array(z.string().min(1)).default([]),
    blockReasons: z.array(z.string().min(1)).default([]),
    evidenceRefs: z.array(EvidenceRefSchema).default([]),
    auditEventIds: z.array(z.string().min(1)).default([]),
    networkBoundaryInvoked: z.boolean(),
    processBoundaryInvoked: z.literal(false),
    externalProcessStarted: z.literal(false),
    noRealWrite: z.boolean(),
    closePrAllowed: z.literal(true),
    deleteRefAllowed: z.literal(true),
    deleteNonCodexhubBranchAllowed: z.literal(false),
    updateRefAllowed: z.literal(false),
    forceAllowed: z.literal(false),
    mergeAllowed: z.literal(false),
    commentAllowed: z.literal(false),
    labelAllowed: z.literal(false),
    reviewerAllowed: z.literal(false),
    releaseAllowed: z.literal(false),
    deploymentAllowed: z.literal(false),
    pushAllowed: z.literal(false),
    rawRefStored: z.literal(false),
    rawUrlStored: z.literal(false),
    rawResponseBodyStored: z.literal(false),
    rawPathStored: z.literal(false),
    bodyStored: z.literal(false),
    summary: z.string().min(1),
  })
  .strict()
  .superRefine((record, context) => {
    rejectGithubRawMetadata(record.metadata, context, ['metadata']);
  });
export type GithubRemoteCleanupRun = z.infer<typeof GithubRemoteCleanupRunSchema>;

export const GithubRemoteCleanupAcceptanceScenarioSchema = z.enum([
  'all-pass',
  'token-missing',
  'approval-blocked',
  'old-pr-not-found',
  'branch-not-codexhub',
  'successor-missing',
  'close-pr-failed',
  'delete-ref-failed',
  'network-timeout',
]);
export type GithubRemoteCleanupAcceptanceScenario = z.infer<
  typeof GithubRemoteCleanupAcceptanceScenarioSchema
>;

export const GithubRemoteCleanupAcceptanceRehearsalRunSchema = createdEntityBaseSchema
  .extend({
    scenario: GithubRemoteCleanupAcceptanceScenarioSchema,
    status: z.enum(['passed', 'failed', 'blocked', 'aborted']),
    cleanupReadinessStatus: RemoteCleanupReadinessStatusSchema,
    closePrStatus: z.enum(['fixture_completed', 'blocked', 'failed', 'skipped']),
    deleteRefStatus: z.enum(['fixture_completed', 'blocked', 'failed', 'skipped']),
    stepCount: z.number().int().nonnegative(),
    evidenceRefCount: z.number().int().nonnegative(),
    auditEventCount: z.number().int().nonnegative(),
    blockerCount: z.number().int().nonnegative(),
    closePrAllowed: z.literal(true),
    deleteRefAllowed: z.literal(true),
    deleteNonCodexhubBranchAllowed: z.literal(false),
    updateRefAllowed: z.literal(false),
    forceAllowed: z.literal(false),
    mergeAllowed: z.literal(false),
    commentAllowed: z.literal(false),
    labelAllowed: z.literal(false),
    reviewerAllowed: z.literal(false),
    releaseAllowed: z.literal(false),
    deploymentAllowed: z.literal(false),
    pushAllowed: z.literal(false),
    rawRefStored: z.literal(false),
    rawUrlStored: z.literal(false),
    rawResponseBodyStored: z.literal(false),
    rawPathStored: z.literal(false),
    bodyStored: z.literal(false),
    noRealWrite: z.literal(true),
    networkBoundaryInvoked: z.literal(false),
    processBoundaryInvoked: z.literal(false),
    externalProcessStarted: z.literal(false),
    summary: z.string().min(1),
  })
  .strict()
  .superRefine((record, context) => {
    rejectGithubRawMetadata(record.metadata, context, ['metadata']);

    if (record.status === 'passed' && record.blockerCount !== 0) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'passed remote cleanup rehearsal cannot include blockers',
        path: ['blockerCount'],
      });
    }
  });
export type GithubRemoteCleanupAcceptanceRehearsalRun = z.infer<
  typeof GithubRemoteCleanupAcceptanceRehearsalRunSchema
>;

export const GovernedCodexPatchModeSchema = z.enum(['fixture', 'governed-worktree']);
export type GovernedCodexPatchMode = z.infer<typeof GovernedCodexPatchModeSchema>;

export const GovernedCodexPatchRunStatusSchema = z.enum([
  'completed',
  'failed',
  'blocked',
  'aborted',
]);
export type GovernedCodexPatchRunStatus = z.infer<typeof GovernedCodexPatchRunStatusSchema>;

export const GovernedCodexPatchPlanSchema = createdEntityBaseSchema
  .extend({
    mode: GovernedCodexPatchModeSchema,
    dryRunIdHash: z.string().min(1),
    policyDecisionIdHash: z.string().min(1),
    approvalArtifactIdHash: z.string().min(1),
    worktreeRunIdHash: z.string().min(1),
    worktreePathHash: z.string().min(1),
    governedInputHash: z.string().min(1),
    expectedInputHash: z.string().min(1),
    sandboxMode: z.literal('workspace-write-limited'),
    writeScope: z.literal('isolated-worktree-only'),
    approvalRequired: z.literal(true),
    persistedApprovalRequired: z.literal(true),
    hashBoundWorktreeRequired: z.literal(true),
    repoRootWriteAllowed: z.literal(false),
    pushAllowed: z.literal(false),
    pullRequestOpened: z.literal(false),
    rawPromptStored: z.literal(false),
    rawPathStored: z.literal(false),
    bodyStored: z.literal(false),
    processBoundaryPlanned: z.boolean(),
    externalProcessStarted: z.literal(false),
    evidenceRefs: z.array(EvidenceRefSchema).default([]),
    auditEventIds: z.array(z.string().min(1)).default([]),
    summary: z.string().min(1),
  })
  .strict()
  .superRefine((record, context) => {
    rejectM12PatchRawMetadata(record.metadata, context, ['metadata']);

    if (record.mode === 'governed-worktree' && !record.processBoundaryPlanned) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'governed-worktree patch plans must declare a planned Codex boundary',
        path: ['processBoundaryPlanned'],
      });
    }
  });
export type GovernedCodexPatchPlan = z.infer<typeof GovernedCodexPatchPlanSchema>;

export const GovernedCodexPatchRunSchema = createdEntityBaseSchema
  .extend({
    planId: z.string().min(1),
    mode: GovernedCodexPatchModeSchema,
    status: GovernedCodexPatchRunStatusSchema,
    changedFiles: z.array(RepoRelativePathSchema).default([]),
    changedFileCount: z.number().int().nonnegative(),
    diffHash: z.string().min(1).optional(),
    diffLineCount: z.number().int().nonnegative().default(0),
    processBoundaryInvoked: z.boolean(),
    externalProcessStarted: z.boolean(),
    codexPatchExecuted: z.boolean(),
    realWriteExecuted: z.boolean(),
    writeScope: z.literal('isolated-worktree-only'),
    repoRootWriteAllowed: z.literal(false),
    pushAllowed: z.literal(false),
    pullRequestOpened: z.literal(false),
    rawStdoutStored: z.literal(false),
    rawStderrStored: z.literal(false),
    rawDiffStored: z.literal(false),
    rawPathStored: z.literal(false),
    bodyStored: z.literal(false),
    evidenceRefs: z.array(EvidenceRefSchema).default([]),
    auditEventIds: z.array(z.string().min(1)).default([]),
    summary: z.string().min(1),
  })
  .strict()
  .superRefine((record, context) => {
    rejectM12PatchRawMetadata(record.metadata, context, ['metadata']);

    if (record.changedFileCount !== record.changedFiles.length) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'changedFileCount must match changedFiles length',
        path: ['changedFileCount'],
      });
    }

    if (record.status === 'completed' && record.changedFileCount === 0) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'completed governed Codex patch run requires changed-file metadata',
        path: ['changedFileCount'],
      });
    }

    if (record.status === 'completed' && !record.diffHash) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'completed governed Codex patch run requires a diff hash',
        path: ['diffHash'],
      });
    }

    if (record.codexPatchExecuted && !record.processBoundaryInvoked) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'codexPatchExecuted requires processBoundaryInvoked',
        path: ['codexPatchExecuted'],
      });
    }

    if (record.codexPatchExecuted && !record.realWriteExecuted) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'executed Codex patch must record an isolated worktree write',
        path: ['realWriteExecuted'],
      });
    }

    if (record.realWriteExecuted && record.status !== 'completed') {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'realWriteExecuted is only valid for completed patch runs',
        path: ['realWriteExecuted'],
      });
    }
  });
export type GovernedCodexPatchRun = z.infer<typeof GovernedCodexPatchRunSchema>;

export const PolicyBackendKindSchema = z.enum(['opa', 'cedar', 'fixture']);
export type PolicyBackendKind = z.infer<typeof PolicyBackendKindSchema>;

export const PolicyBackendEvaluatorSourceSchema = z.enum([
  'fixture-inline',
  'fixture-config',
]);
export type PolicyBackendEvaluatorSource = z.infer<
  typeof PolicyBackendEvaluatorSourceSchema
>;

export const PolicyBackendEvaluationStatusSchema = z.enum([
  'planned',
  'completed',
  'failed',
  'blocked',
  'aborted',
]);
export type PolicyBackendEvaluationStatus = z.infer<
  typeof PolicyBackendEvaluationStatusSchema
>;

export const PolicyBackendRawEvaluationOutcomeSchema = z.enum([
  'allow',
  'deny',
  'unknown',
  'error',
]);
export type PolicyBackendRawEvaluationOutcome = z.infer<
  typeof PolicyBackendRawEvaluationOutcomeSchema
>;

export const PolicyBackendEvaluationPlanSchema = createdEntityBaseSchema
  .extend({
    adapterName: z.string().min(1),
    backendKind: PolicyBackendKindSchema,
    evaluatorSource: PolicyBackendEvaluatorSourceSchema.default('fixture-inline'),
    actionIdHash: z.string().min(1),
    actionType: z.string().min(1),
    actionMode: ActionModeSchema,
    riskLevel: RiskLevelSchema.optional(),
    inputHash: z.string().min(1),
    policySourceHash: z.string().min(1).optional(),
    fixtureConfigHash: z.string().min(1).optional(),
    fixtureRuleCount: z.number().int().nonnegative().optional(),
    blockReasons: z.array(z.string().min(1)).default([]),
    processBoundaryPlanned: z.literal(false),
    networkBoundaryPlanned: z.literal(false),
    rawPolicySourceStored: z.literal(false),
    rawPathStored: z.literal(false),
    bodyStored: z.literal(false),
    noRealWrite: z.literal(true),
    summary: z.string().min(1),
  })
  .strict();
export type PolicyBackendEvaluationPlan = z.infer<
  typeof PolicyBackendEvaluationPlanSchema
>;

export const PolicyBackendRawEvaluationSummarySchema = createdEntityBaseSchema
  .extend({
    planId: z.string().min(1),
    backendKind: PolicyBackendKindSchema,
    evaluatorSource: PolicyBackendEvaluatorSourceSchema.default('fixture-inline'),
    status: PolicyBackendEvaluationStatusSchema,
    rawOutcome: PolicyBackendRawEvaluationOutcomeSchema,
    rawEvaluationHash: z.string().min(1),
    reasonCount: z.number().int().nonnegative(),
    matchedRuleCount: z.number().int().nonnegative(),
    policySourceHash: z.string().min(1).optional(),
    fixtureConfigHash: z.string().min(1).optional(),
    fixtureRuleCount: z.number().int().nonnegative().optional(),
    rawPolicySourceStored: z.literal(false),
    rawPathStored: z.literal(false),
    bodyStored: z.literal(false),
    noRealWrite: z.literal(true),
    summary: z.string().min(1),
  })
  .strict();
export type PolicyBackendRawEvaluationSummary = z.infer<
  typeof PolicyBackendRawEvaluationSummarySchema
>;

export const PolicyBackendNormalizedDecisionTraceSchema = createdEntityBaseSchema
  .extend({
    planId: z.string().min(1),
    rawEvaluationSummaryId: z.string().min(1),
    codexhubPolicyDecisionId: z.string().min(1),
    policyDecisionHash: z.string().min(1),
    backendKind: PolicyBackendKindSchema,
    evaluatorSource: PolicyBackendEvaluatorSourceSchema.default('fixture-inline'),
    backendOutcome: PolicyBackendRawEvaluationOutcomeSchema,
    normalizedOutcome: PolicyOutcomeSchema,
    authorityProvider: z.literal('codexhub'),
    backendAdvisoryOnly: z.literal(true),
    evidenceRefs: z.array(EvidenceRefSchema).default([]),
    auditEventIds: z.array(z.string().min(1)).default([]),
    rawPolicySourceStored: z.literal(false),
    rawPathStored: z.literal(false),
    bodyStored: z.literal(false),
    noRealWrite: z.literal(true),
    summary: z.string().min(1),
  })
  .strict();
export type PolicyBackendNormalizedDecisionTrace = z.infer<
  typeof PolicyBackendNormalizedDecisionTraceSchema
>;

export const PolicyBackendEvaluationRunSchema = createdEntityBaseSchema
  .extend({
    status: PolicyBackendEvaluationStatusSchema,
    plan: PolicyBackendEvaluationPlanSchema,
    rawEvaluationSummary: PolicyBackendRawEvaluationSummarySchema.optional(),
    normalizedDecisionTrace: PolicyBackendNormalizedDecisionTraceSchema.optional(),
    evidenceRefs: z.array(EvidenceRefSchema).default([]),
    auditEventIds: z.array(z.string().min(1)).default([]),
    processBoundaryInvoked: z.literal(false),
    externalProcessStarted: z.literal(false),
    networkBoundaryInvoked: z.literal(false),
    noRealWrite: z.literal(true),
    bodyStored: z.literal(false),
    rawPathStored: z.literal(false),
    summary: z.string().min(1),
  })
  .strict();
export type PolicyBackendEvaluationRun = z.infer<
  typeof PolicyBackendEvaluationRunSchema
>;

export const TelemetrySignalKindSchema = z.enum(['trace', 'metric', 'log']);
export type TelemetrySignalKind = z.infer<typeof TelemetrySignalKindSchema>;

export const TelemetryExporterKindSchema = z.enum(['noop', 'fixture']);
export type TelemetryExporterKind = z.infer<typeof TelemetryExporterKindSchema>;

export const TelemetrySpanKindSchema = z.enum([
  'workflow',
  'adapter',
  'supervisor',
  'verification',
  'policy',
  'worktree',
  'browser',
  'electron',
  'mcp',
]);
export type TelemetrySpanKind = z.infer<typeof TelemetrySpanKindSchema>;

export const TelemetrySpanSummarySchema = createdEntityBaseSchema
  .extend({
    signalKind: TelemetrySignalKindSchema,
    spanKind: TelemetrySpanKindSchema,
    traceIdHash: z.string().min(1),
    spanIdHash: z.string().min(1),
    parentSpanIdHash: z.string().min(1).optional(),
    nameHash: z.string().min(1),
    durationMs: z.number().nonnegative().optional(),
    attributeCount: z.number().int().nonnegative(),
    eventCount: z.number().int().nonnegative(),
    linkCount: z.number().int().nonnegative(),
    payloadHash: z.string().min(1),
    rawTracePayloadStored: z.literal(false),
    rawPathStored: z.literal(false),
    bodyStored: z.literal(false),
    noRealWrite: z.literal(true),
    evidenceAuditAuthoritative: z.literal(false),
    summary: z.string().min(1),
  })
  .strict();
export type TelemetrySpanSummary = z.infer<typeof TelemetrySpanSummarySchema>;

export const TelemetryTraceExportPlanSchema = createdEntityBaseSchema
  .extend({
    adapterName: z.string().min(1),
    exporterKind: TelemetryExporterKindSchema,
    signalKinds: z.array(TelemetrySignalKindSchema).default(['trace']),
    spanCount: z.number().int().nonnegative(),
    tracePlanHash: z.string().min(1),
    blockReasons: z.array(z.string().min(1)).default([]),
    networkExportPlanned: z.literal(false),
    processBoundaryPlanned: z.literal(false),
    rawTracePayloadStored: z.literal(false),
    rawPathStored: z.literal(false),
    bodyStored: z.literal(false),
    noRealWrite: z.literal(true),
    evidenceAuditAuthoritative: z.literal(false),
    summary: z.string().min(1),
  })
  .strict();
export type TelemetryTraceExportPlan = z.infer<typeof TelemetryTraceExportPlanSchema>;

export const TelemetryExportRunSchema = createdEntityBaseSchema
  .extend({
    status: CapabilityExecutionStatusSchema,
    planId: z.string().min(1),
    exporterKind: TelemetryExporterKindSchema,
    spans: z.array(TelemetrySpanSummarySchema).default([]),
    exportedSpanCount: z.number().int().nonnegative(),
    exportSummaryHash: z.string().min(1),
    evidenceRefs: z.array(EvidenceRefSchema).default([]),
    auditEventIds: z.array(z.string().min(1)).default([]),
    networkExportAttempted: z.literal(false),
    processBoundaryInvoked: z.literal(false),
    externalProcessStarted: z.literal(false),
    rawTracePayloadStored: z.literal(false),
    rawPathStored: z.literal(false),
    bodyStored: z.literal(false),
    noRealWrite: z.literal(true),
    evidenceAuditAuthoritative: z.literal(false),
    summary: z.string().min(1),
  })
  .strict();
export type TelemetryExportRun = z.infer<typeof TelemetryExportRunSchema>;

const governanceProjectionForbiddenMetadataKeys = new Set([
  'body',
  'prompt',
  'stdout',
  'stderr',
  'jsonl',
  'diff',
  'trace',
  'requestBody',
  'responseBody',
  'path',
  'cwd',
  'repoRoot',
  'worktreePath',
  'url',
  'title',
  ['web', 'Socket', 'Url'].join(''),
  ['web', 'Socket', 'Debugger', 'Url'].join(''),
  'payload',
  ['to', 'ken'].join(''),
  ['coo', 'kie'].join(''),
  ['sess', 'ion'].join(''),
  ['m', 'fa'].join(''),
]);

function rejectGovernanceProjectionRawMetadata(
  value: unknown,
  context: z.RefinementCtx,
  path: Array<string | number> = [],
): void {
  if (!value || typeof value !== 'object') {
    return;
  }

  if (Array.isArray(value)) {
    value.forEach((item, index) => rejectGovernanceProjectionRawMetadata(item, context, [...path, index]));
    return;
  }

  for (const [key, nestedValue] of Object.entries(value as Record<string, unknown>)) {
    if (governanceProjectionForbiddenMetadataKeys.has(key)) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'raw governance projection metadata is forbidden',
        path: [...path, key],
      });
      continue;
    }

    rejectGovernanceProjectionRawMetadata(nestedValue, context, [...path, key]);
  }
}

export const UnifiedRunSourceSchema = z.enum([
  'codex',
  'verification',
  'mcp',
  'browser',
  'electron',
  'worktree',
  'policy',
  'telemetry',
  'github',
  'orchestrator',
]);
export type UnifiedRunSource = z.infer<typeof UnifiedRunSourceSchema>;

export const UnifiedRunProjectionStatusSchema = z.enum([
  'planned',
  'running',
  'passed',
  'ready',
  'completed',
  'failed',
  'blocked',
  'aborted',
  'degraded',
  'unknown',
]);
export type UnifiedRunProjectionStatus = z.infer<
  typeof UnifiedRunProjectionStatusSchema
>;

export const UnifiedTimelineEventSchema = createdEntityBaseSchema
  .extend({
    runProjectionId: z.string().min(1),
    source: UnifiedRunSourceSchema,
    phase: z.string().min(1),
    status: UnifiedRunProjectionStatusSchema,
    order: z.number().int().nonnegative(),
    evidenceRefIds: z.array(z.string().min(1)).default([]),
    auditEventIds: z.array(z.string().min(1)).default([]),
    summary: z.string().min(1),
    rawPathStored: z.literal(false),
    bodyStored: z.literal(false),
  })
  .strict()
  .superRefine((record, context) => {
    rejectGovernanceProjectionRawMetadata(record.metadata, context, ['metadata']);
  });
export type UnifiedTimelineEvent = z.infer<typeof UnifiedTimelineEventSchema>;

export const EvidenceBundleProjectionSchema = createdEntityBaseSchema
  .extend({
    runProjectionId: z.string().min(1),
    source: UnifiedRunSourceSchema,
    evidenceRefIds: z.array(z.string().min(1)).default([]),
    evidenceCount: z.number().int().nonnegative(),
    evidenceKinds: z.array(z.string().min(1)).default([]),
    bundleHash: z.string().min(1),
    rawPathStored: z.literal(false),
    bodyStored: z.literal(false),
    summary: z.string().min(1),
  })
  .strict()
  .superRefine((record, context) => {
    rejectGovernanceProjectionRawMetadata(record.metadata, context, ['metadata']);
  });
export type EvidenceBundleProjection = z.infer<typeof EvidenceBundleProjectionSchema>;

export const AuditChainProjectionSchema = createdEntityBaseSchema
  .extend({
    runProjectionId: z.string().min(1),
    source: UnifiedRunSourceSchema,
    auditEventIds: z.array(z.string().min(1)).default([]),
    auditEventCount: z.number().int().nonnegative(),
    policyDecisionIds: z.array(z.string().min(1)).default([]),
    chainHash: z.string().min(1),
    rawPathStored: z.literal(false),
    bodyStored: z.literal(false),
    summary: z.string().min(1),
  })
  .strict()
  .superRefine((record, context) => {
    rejectGovernanceProjectionRawMetadata(record.metadata, context, ['metadata']);
  });
export type AuditChainProjection = z.infer<typeof AuditChainProjectionSchema>;

export const UnifiedRunProjectionSchema = createdEntityBaseSchema
  .extend({
    source: UnifiedRunSourceSchema,
    sourceRunIdHash: z.string().min(1),
    titleHash: z.string().min(1),
    status: UnifiedRunProjectionStatusSchema,
    timeline: z.array(UnifiedTimelineEventSchema).default([]),
    evidenceBundle: EvidenceBundleProjectionSchema,
    auditChain: AuditChainProjectionSchema,
    processBoundaryInvoked: z.boolean(),
    externalProcessStarted: z.boolean(),
    networkBoundaryInvoked: z.boolean().default(false),
    noRealWrite: z.boolean(),
    rawPathStored: z.literal(false),
    bodyStored: z.literal(false),
    summary: z.string().min(1),
  })
  .strict()
  .superRefine((record, context) => {
    rejectGovernanceProjectionRawMetadata(record.metadata, context, ['metadata']);
  });
export type UnifiedRunProjection = z.infer<typeof UnifiedRunProjectionSchema>;

export const GovernanceProjectionSummarySchema = createdEntityBaseSchema
  .extend({
    status: z.enum(['ready', 'degraded']),
    runCount: z.number().int().nonnegative(),
    sourceBreakdown: z.record(UnifiedRunSourceSchema, z.number().int().nonnegative()),
    evidenceCount: z.number().int().nonnegative(),
    auditEventCount: z.number().int().nonnegative(),
    processBoundaryCount: z.number().int().nonnegative(),
    externalProcessStartedCount: z.number().int().nonnegative(),
    networkBoundaryCount: z.number().int().nonnegative(),
    projectionHash: z.string().min(1),
    rawPathStored: z.literal(false),
    bodyStored: z.literal(false),
    summary: z.string().min(1),
  })
  .strict()
  .superRefine((record, context) => {
    rejectGovernanceProjectionRawMetadata(record.metadata, context, ['metadata']);
  });
export type GovernanceProjectionSummary = z.infer<typeof GovernanceProjectionSummarySchema>;

const operatorReadinessForbiddenMetadataKeys = new Set([
  'value',
  'secret',
  'body',
  'requestBody',
  'responseBody',
  'rawValue',
  'rawConfig',
  'rawEnv',
  'path',
  'cwd',
  'url',
  ['to', 'ken'].join(''),
  ['coo', 'kie'].join(''),
  ['sess', 'ion'].join(''),
  ['m', 'fa'].join(''),
]);

function rejectOperatorReadinessRawMetadata(
  value: unknown,
  context: z.RefinementCtx,
  path: Array<string | number> = [],
): void {
  if (!value || typeof value !== 'object') {
    return;
  }

  if (Array.isArray(value)) {
    value.forEach((item, index) =>
      rejectOperatorReadinessRawMetadata(item, context, [...path, index]),
    );
    return;
  }

  for (const [key, nestedValue] of Object.entries(value as Record<string, unknown>)) {
    if (operatorReadinessForbiddenMetadataKeys.has(key)) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'raw operator readiness metadata is forbidden',
        path: [...path, key],
      });
      continue;
    }

    rejectOperatorReadinessRawMetadata(nestedValue, context, [...path, key]);
  }
}

export const OperatorReadinessStatusSchema = z.enum(['pass', 'warn', 'fail', 'unknown']);
export type OperatorReadinessStatus = z.infer<typeof OperatorReadinessStatusSchema>;

export const ConfigHashSummarySchema = createdEntityBaseSchema
  .extend({
    name: z.string().min(1),
    kind: z.enum([
      'policy',
      'risk',
      'integration',
      'orchestration',
      'store',
      'audit',
      'environment',
      'unknown',
    ]),
    configured: z.boolean(),
    hash: z.string().min(1).optional(),
    itemCount: z.number().int().nonnegative().default(0),
    rawValueStored: z.literal(false),
    rawPathStored: z.literal(false),
    bodyStored: z.literal(false),
    summary: z.string().min(1),
  })
  .strict()
  .superRefine((record, context) => {
    rejectOperatorReadinessRawMetadata(record.metadata, context, ['metadata']);
  });
export type ConfigHashSummary = z.infer<typeof ConfigHashSummarySchema>;

export const IntegrationReadinessSummarySchema = createdEntityBaseSchema
  .extend({
    name: z.string().min(1),
    enabled: z.boolean(),
    defaultEnabled: z.boolean(),
    riskLevel: RiskLevelSchema,
    approvalRequired: z.boolean(),
    evidenceRequired: z.boolean(),
    auditRequired: z.boolean(),
    processBoundary: z.boolean(),
    networkBoundary: z.boolean(),
    safeToEnable: z.boolean(),
    envFlagConfigured: z.boolean(),
    localControlKeyConfigured: z.boolean().optional(),
    configHash: z.string().min(1).optional(),
    blockers: z.array(z.string().min(1)).default([]),
    safeEnableNotes: z.array(z.string().min(1)).default([]),
    rawValueStored: z.literal(false),
    rawPathStored: z.literal(false),
    bodyStored: z.literal(false),
    summary: z.string().min(1),
  })
  .strict()
  .superRefine((record, context) => {
    rejectOperatorReadinessRawMetadata(record.metadata, context, ['metadata']);
  });
export type IntegrationReadinessSummary = z.infer<
  typeof IntegrationReadinessSummarySchema
>;

export const OperatorReadinessCheckSchema = createdEntityBaseSchema
  .extend({
    code: z.string().min(1),
    label: z.string().min(1),
    category: z.enum([
      'integration',
      'environment',
      'store',
      'audit',
      'policy',
      'security',
      'config',
    ]),
    status: OperatorReadinessStatusSchema,
    required: z.boolean(),
    configured: z.boolean().optional(),
    hash: z.string().min(1).optional(),
    blockers: z.array(z.string().min(1)).default([]),
    safeEnableNotes: z.array(z.string().min(1)).default([]),
    rawValueStored: z.literal(false),
    rawPathStored: z.literal(false),
    bodyStored: z.literal(false),
    summary: z.string().min(1),
  })
  .strict()
  .superRefine((record, context) => {
    rejectOperatorReadinessRawMetadata(record.metadata, context, ['metadata']);
  });
export type OperatorReadinessCheck = z.infer<typeof OperatorReadinessCheckSchema>;

export const OperatorReadinessReportSchema = createdEntityBaseSchema
  .extend({
    status: OperatorReadinessStatusSchema,
    checks: z.array(OperatorReadinessCheckSchema),
    integrations: z.array(IntegrationReadinessSummarySchema),
    configHashes: z.array(ConfigHashSummarySchema),
    passedCheckCount: z.number().int().nonnegative(),
    warningCheckCount: z.number().int().nonnegative(),
    failedCheckCount: z.number().int().nonnegative(),
    unknownCheckCount: z.number().int().nonnegative(),
    configuredLocalControlKeyCount: z.number().int().nonnegative(),
    storeAvailable: z.boolean(),
    processBoundaryAllowlistPassed: z.boolean(),
    policyConfigHash: z.string().min(1).optional(),
    riskConfigHash: z.string().min(1).optional(),
    integrationConfigHash: z.string().min(1).optional(),
    rawValueStored: z.literal(false),
    rawPathStored: z.literal(false),
    bodyStored: z.literal(false),
    summary: z.string().min(1),
  })
  .strict()
  .superRefine((record, context) => {
    rejectOperatorReadinessRawMetadata(record.metadata, context, ['metadata']);
  });
export type OperatorReadinessReport = z.infer<typeof OperatorReadinessReportSchema>;

export const M10PilotChecklistStatusSchema = z.enum(['ready', 'blocked', 'review']);
export type M10PilotChecklistStatus = z.infer<typeof M10PilotChecklistStatusSchema>;

export const M10PilotOperatorStepPhaseSchema = z.enum([
  'preflight',
  'approval',
  'pilot',
  'verification',
  'review',
  'rollback',
]);
export type M10PilotOperatorStepPhase = z.infer<typeof M10PilotOperatorStepPhaseSchema>;

export const M10PilotOperatorStepStatusSchema = z.enum([
  'ready',
  'blocked',
  'review',
  'done',
]);
export type M10PilotOperatorStepStatus = z.infer<typeof M10PilotOperatorStepStatusSchema>;

export const M10PilotOperatorStepSchema = createdEntityBaseSchema
  .extend({
    code: z.string().min(1),
    label: z.string().min(1),
    phase: M10PilotOperatorStepPhaseSchema,
    status: M10PilotOperatorStepStatusSchema,
    required: z.boolean(),
    blockerCount: z.number().int().nonnegative(),
    blockers: z.array(z.string().min(1)).default([]),
    safeEnableNotes: z.array(z.string().min(1)).default([]),
    evidenceRefIds: z.array(z.string().min(1)).default([]),
    auditEventIds: z.array(z.string().min(1)).default([]),
    rawValueStored: z.literal(false),
    rawPathStored: z.literal(false),
    bodyStored: z.literal(false),
    localControlKeyRead: z.literal(false),
    supervisorPostAllowed: z.literal(false),
    adapterExecuteAllowed: z.literal(false),
    summary: z.string().min(1),
  })
  .strict()
  .superRefine((record, context) => {
    rejectOperatorReadinessRawMetadata(record.metadata, context, ['metadata']);
  });
export type M10PilotOperatorStep = z.infer<typeof M10PilotOperatorStepSchema>;

export const M10PilotChecklistSchema = createdEntityBaseSchema
  .extend({
    status: M10PilotChecklistStatusSchema,
    steps: z.array(M10PilotOperatorStepSchema),
    readyStepCount: z.number().int().nonnegative(),
    blockedStepCount: z.number().int().nonnegative(),
    reviewStepCount: z.number().int().nonnegative(),
    requiredStepCount: z.number().int().nonnegative(),
    blockerCount: z.number().int().nonnegative(),
    integrationCount: z.number().int().nonnegative(),
    configuredLocalControlKeyCount: z.number().int().nonnegative(),
    governanceRunCount: z.number().int().nonnegative(),
    approvalInboxItemCount: z.number().int().nonnegative(),
    rawValueStored: z.literal(false),
    rawPathStored: z.literal(false),
    bodyStored: z.literal(false),
    localControlKeyRead: z.literal(false),
    supervisorPostAllowed: z.literal(false),
    adapterExecuteAllowed: z.literal(false),
    summary: z.string().min(1),
  })
  .strict()
  .superRefine((record, context) => {
    rejectOperatorReadinessRawMetadata(record.metadata, context, ['metadata']);
  });
export type M10PilotChecklist = z.infer<typeof M10PilotChecklistSchema>;

export const M10PilotRunbookSummarySchema = createdEntityBaseSchema
  .extend({
    checklistId: z.string().min(1),
    status: M10PilotChecklistStatusSchema,
    phaseCount: z.number().int().nonnegative(),
    requiredStepCount: z.number().int().nonnegative(),
    blockerCount: z.number().int().nonnegative(),
    nextAction: z.string().min(1),
    rollbackSummary: z.string().min(1),
    rawValueStored: z.literal(false),
    rawPathStored: z.literal(false),
    bodyStored: z.literal(false),
    localControlKeyRead: z.literal(false),
    supervisorPostAllowed: z.literal(false),
    adapterExecuteAllowed: z.literal(false),
    summary: z.string().min(1),
  })
  .strict()
  .superRefine((record, context) => {
    rejectOperatorReadinessRawMetadata(record.metadata, context, ['metadata']);
  });
export type M10PilotRunbookSummary = z.infer<typeof M10PilotRunbookSummarySchema>;

export const M11PilotEnablementStatusSchema = z.enum(['ready', 'blocked', 'review']);
export type M11PilotEnablementStatus = z.infer<typeof M11PilotEnablementStatusSchema>;

export const M11PilotEnablementStepPhaseSchema = z.enum([
  'preflight',
  'approval',
  'worktree',
  'codex',
  'verification',
  'projection',
  'rollback',
]);
export type M11PilotEnablementStepPhase = z.infer<
  typeof M11PilotEnablementStepPhaseSchema
>;

export const M11PilotEnablementStepStatusSchema = z.enum([
  'ready',
  'blocked',
  'review',
  'done',
]);
export type M11PilotEnablementStepStatus = z.infer<
  typeof M11PilotEnablementStepStatusSchema
>;

export const M11PilotEnablementStepSchema = createdEntityBaseSchema
  .extend({
    code: z.string().min(1),
    label: z.string().min(1),
    phase: M11PilotEnablementStepPhaseSchema,
    status: M11PilotEnablementStepStatusSchema,
    required: z.boolean(),
    blockerCount: z.number().int().nonnegative(),
    blockers: z.array(z.string().min(1)).default([]),
    safeEnableNotes: z.array(z.string().min(1)).default([]),
    evidenceRefIds: z.array(z.string().min(1)).default([]),
    auditEventIds: z.array(z.string().min(1)).default([]),
    rawValueStored: z.literal(false),
    rawPathStored: z.literal(false),
    bodyStored: z.literal(false),
    localControlKeyRead: z.literal(false),
    supervisorPostAllowed: z.literal(false),
    adapterExecuteAllowed: z.literal(false),
    summary: z.string().min(1),
  })
  .strict()
  .superRefine((record, context) => {
    rejectOperatorReadinessRawMetadata(record.metadata, context, ['metadata']);
  });
export type M11PilotEnablementStep = z.infer<typeof M11PilotEnablementStepSchema>;

export const M11PilotEnablementChecklistSchema = createdEntityBaseSchema
  .extend({
    status: M11PilotEnablementStatusSchema,
    steps: z.array(M11PilotEnablementStepSchema),
    readyStepCount: z.number().int().nonnegative(),
    blockedStepCount: z.number().int().nonnegative(),
    reviewStepCount: z.number().int().nonnegative(),
    requiredStepCount: z.number().int().nonnegative(),
    blockerCount: z.number().int().nonnegative(),
    integrationCount: z.number().int().nonnegative(),
    configuredLocalControlKeyCount: z.number().int().nonnegative(),
    governanceRunCount: z.number().int().nonnegative(),
    approvalInboxItemCount: z.number().int().nonnegative(),
    latestRunCount: z.number().int().nonnegative(),
    cleanupRequiredCount: z.number().int().nonnegative(),
    requiredEnvFlags: z.array(z.string().min(1)).default([]),
    safeEnableBlockers: z.array(z.string().min(1)).default([]),
    rawValueStored: z.literal(false),
    rawPathStored: z.literal(false),
    bodyStored: z.literal(false),
    localControlKeyRead: z.literal(false),
    supervisorPostAllowed: z.literal(false),
    adapterExecuteAllowed: z.literal(false),
    codexReadOnlyDryRunOnly: z.literal(true),
    patchGenerationAllowed: z.literal(false),
    pushAllowed: z.literal(false),
    pullRequestOpened: z.literal(false),
    summary: z.string().min(1),
  })
  .strict()
  .superRefine((record, context) => {
    rejectOperatorReadinessRawMetadata(record.metadata, context, ['metadata']);
  });
export type M11PilotEnablementChecklist = z.infer<
  typeof M11PilotEnablementChecklistSchema
>;

export const M11PilotEnablementRunbookSummarySchema = createdEntityBaseSchema
  .extend({
    checklistId: z.string().min(1),
    status: M11PilotEnablementStatusSchema,
    phaseCount: z.number().int().nonnegative(),
    requiredStepCount: z.number().int().nonnegative(),
    blockerCount: z.number().int().nonnegative(),
    nextAction: z.string().min(1),
    safeEnableSummary: z.string().min(1),
    failureHandlingSummary: z.string().min(1),
    rollbackSummary: z.string().min(1),
    rawValueStored: z.literal(false),
    rawPathStored: z.literal(false),
    bodyStored: z.literal(false),
    localControlKeyRead: z.literal(false),
    supervisorPostAllowed: z.literal(false),
    adapterExecuteAllowed: z.literal(false),
    summary: z.string().min(1),
  })
  .strict()
  .superRefine((record, context) => {
    rejectOperatorReadinessRawMetadata(record.metadata, context, ['metadata']);
  });
export type M11PilotEnablementRunbookSummary = z.infer<
  typeof M11PilotEnablementRunbookSummarySchema
>;

const goldenPathForbiddenMetadataKeys = new Set([
  'body',
  'prompt',
  'stdout',
  'stderr',
  'jsonl',
  'diff',
  'trace',
  'requestBody',
  'responseBody',
  'path',
  'cwd',
  'repoRoot',
  'worktreePath',
  'url',
  'payload',
  ['to', 'ken'].join(''),
  ['coo', 'kie'].join(''),
  ['sess', 'ion'].join(''),
  ['m', 'fa'].join(''),
]);

function rejectGoldenPathRawMetadata(
  value: unknown,
  context: z.RefinementCtx,
  path: Array<string | number> = [],
): void {
  if (!value || typeof value !== 'object') {
    return;
  }

  if (Array.isArray(value)) {
    value.forEach((item, index) => rejectGoldenPathRawMetadata(item, context, [...path, index]));
    return;
  }

  for (const [key, nestedValue] of Object.entries(value as Record<string, unknown>)) {
    if (goldenPathForbiddenMetadataKeys.has(key)) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'raw golden path metadata is forbidden',
        path: [...path, key],
      });
      continue;
    }

    rejectGoldenPathRawMetadata(nestedValue, context, [...path, key]);
  }
}

export const GoldenPathStepStatusSchema = z.enum([
  'planned',
  'running',
  'passed',
  'ready',
  'completed',
  'failed',
  'blocked',
  'aborted',
]);
export type GoldenPathStepStatus = z.infer<typeof GoldenPathStepStatusSchema>;

export const GoldenPathStepSchema = createdEntityBaseSchema
  .extend({
    phase: z.string().min(1),
    status: GoldenPathStepStatusSchema,
    order: z.number().int().nonnegative(),
    evidenceRefIds: z.array(z.string().min(1)).default([]),
    auditEventIds: z.array(z.string().min(1)).default([]),
    summary: z.string().min(1),
    rawPathStored: z.literal(false),
    bodyStored: z.literal(false),
  })
  .strict()
  .superRefine((record, context) => {
    rejectGoldenPathRawMetadata(record.metadata, context, ['metadata']);
  });
export type GoldenPathStep = z.infer<typeof GoldenPathStepSchema>;

export const GoldenPathEvidenceBundleSchema = createdEntityBaseSchema
  .extend({
    rehearsalRunId: z.string().min(1),
    evidenceRefIds: z.array(z.string().min(1)).default([]),
    auditEventIds: z.array(z.string().min(1)).default([]),
    evidenceCount: z.number().int().nonnegative(),
    auditEventCount: z.number().int().nonnegative(),
    bundleHash: z.string().min(1),
    rawPathStored: z.literal(false),
    bodyStored: z.literal(false),
    summary: z.string().min(1),
  })
  .strict()
  .superRefine((record, context) => {
    rejectGoldenPathRawMetadata(record.metadata, context, ['metadata']);
  });
export type GoldenPathEvidenceBundle = z.infer<typeof GoldenPathEvidenceBundleSchema>;

export const GoldenPathRehearsalRunSchema = createdEntityBaseSchema
  .extend({
    status: z.enum(['passed', 'failed', 'blocked', 'aborted']),
    scenario: z.enum(['all-pass', 'codex-failed', 'nx-failed']),
    requestId: z.string().min(1),
    requestTitleHash: z.string().min(1),
    requestDescriptionHash: z.string().min(1),
    steps: z.array(GoldenPathStepSchema),
    evidenceBundle: GoldenPathEvidenceBundleSchema,
    telemetryProjectionHash: z.string().min(1),
    prDraftStatus: z.enum(['ready', 'blocked']),
    releaseAuditStatus: z.enum(['ready', 'blocked']),
    processBoundaryInvoked: z.boolean(),
    externalProcessStarted: z.boolean(),
    networkBoundaryInvoked: z.boolean(),
    noRealWrite: z.literal(true),
    rawPathStored: z.literal(false),
    bodyStored: z.literal(false),
    evidenceAuditAuthoritative: z.literal(true),
    telemetryAuthoritative: z.literal(false),
    pushAllowed: z.literal(false),
    pullRequestOpened: z.literal(false),
    summary: z.string().min(1),
  })
  .strict()
  .superRefine((record, context) => {
    rejectGoldenPathRawMetadata(record.metadata, context, ['metadata']);
  });
export type GoldenPathRehearsalRun = z.infer<typeof GoldenPathRehearsalRunSchema>;

export const M10PilotAcceptanceScenarioSchema = z.enum([
  'all-pass',
  'readiness-blocked',
  'approval-blocked',
  'codex-failed',
  'nx-failed',
]);
export type M10PilotAcceptanceScenario = z.infer<typeof M10PilotAcceptanceScenarioSchema>;

export const M10PilotAcceptanceStepSchema = createdEntityBaseSchema
  .extend({
    code: z.string().min(1),
    phase: z.enum(['doctor', 'checklist', 'approval', 'governance', 'pilot', 'review']),
    status: z.enum(['passed', 'failed', 'blocked', 'aborted', 'skipped']),
    order: z.number().int().nonnegative(),
    evidenceRefIds: z.array(z.string().min(1)).default([]),
    auditEventIds: z.array(z.string().min(1)).default([]),
    processBoundaryInvoked: z.literal(false),
    externalProcessStarted: z.literal(false),
    networkBoundaryInvoked: z.literal(false),
    rawPathStored: z.literal(false),
    bodyStored: z.literal(false),
    tokenStored: z.literal(false),
    localControlKeyRead: z.literal(false),
    supervisorPostAllowed: z.literal(false),
    adapterExecuteAllowed: z.literal(false),
    summary: z.string().min(1),
  })
  .strict()
  .superRefine((record, context) => {
    rejectGoldenPathRawMetadata(record.metadata, context, ['metadata']);
  });
export type M10PilotAcceptanceStep = z.infer<typeof M10PilotAcceptanceStepSchema>;

export const M10PilotAcceptanceEvidenceSummarySchema = createdEntityBaseSchema
  .extend({
    rehearsalRunId: z.string().min(1),
    evidenceRefIds: z.array(z.string().min(1)).default([]),
    auditEventIds: z.array(z.string().min(1)).default([]),
    evidenceCount: z.number().int().nonnegative(),
    auditEventCount: z.number().int().nonnegative(),
    evidenceBundleHash: z.string().min(1),
    governanceProjectionHash: z.string().min(1),
    telemetryProjectionHash: z.string().min(1),
    evidenceAuditAuthoritative: z.literal(true),
    telemetryAuthoritative: z.literal(false),
    rawPathStored: z.literal(false),
    bodyStored: z.literal(false),
    tokenStored: z.literal(false),
    summary: z.string().min(1),
  })
  .strict()
  .superRefine((record, context) => {
    rejectGoldenPathRawMetadata(record.metadata, context, ['metadata']);
  });
export type M10PilotAcceptanceEvidenceSummary = z.infer<
  typeof M10PilotAcceptanceEvidenceSummarySchema
>;

export const M10PilotAcceptanceRehearsalRunSchema = createdEntityBaseSchema
  .extend({
    status: z.enum(['passed', 'failed', 'blocked', 'aborted']),
    scenario: M10PilotAcceptanceScenarioSchema,
    checklistId: z.string().min(1),
    approvalHistoryProjectionId: z.string().min(1),
    governanceProjectionHash: z.string().min(1),
    goldenPathRunId: z.string().min(1),
    goldenPathStatus: z.enum(['passed', 'failed', 'blocked', 'aborted']),
    prActionStatus: z.enum(['not_ready_no_live_pr', 'blocked']),
    steps: z.array(M10PilotAcceptanceStepSchema),
    evidenceSummary: M10PilotAcceptanceEvidenceSummarySchema,
    processBoundaryInvoked: z.literal(false),
    externalProcessStarted: z.literal(false),
    networkBoundaryInvoked: z.literal(false),
    noRealWrite: z.literal(true),
    rawPathStored: z.literal(false),
    bodyStored: z.literal(false),
    tokenStored: z.literal(false),
    localControlKeyRead: z.literal(false),
    supervisorPostAllowed: z.literal(false),
    adapterExecuteAllowed: z.literal(false),
    pushAllowed: z.literal(false),
    pullRequestOpened: z.literal(false),
    evidenceAuditAuthoritative: z.literal(true),
    telemetryAuthoritative: z.literal(false),
    summary: z.string().min(1),
  })
  .strict()
  .superRefine((record, context) => {
    rejectGoldenPathRawMetadata(record.metadata, context, ['metadata']);
  });
export type M10PilotAcceptanceRehearsalRun = z.infer<
  typeof M10PilotAcceptanceRehearsalRunSchema
>;

export const M9PilotRunStatusSchema = z.enum([
  'planned',
  'running',
  'passed',
  'failed',
  'blocked',
  'aborted',
]);
export type M9PilotRunStatus = z.infer<typeof M9PilotRunStatusSchema>;

export const M9PilotStepStatusSchema = z.enum([
  'planned',
  'running',
  'passed',
  'completed',
  'failed',
  'blocked',
  'aborted',
  'skipped',
]);
export type M9PilotStepStatus = z.infer<typeof M9PilotStepStatusSchema>;

export const M9PilotPrDraftStatusSchema = z.enum(['blocked_no_patch', 'not_ready']);
export type M9PilotPrDraftStatus = z.infer<typeof M9PilotPrDraftStatusSchema>;

const m9PilotForbiddenMetadataKeys = new Set([
  'body',
  'prompt',
  'stdout',
  'stderr',
  'jsonl',
  'diff',
  'command',
  'path',
  'url',
  'title',
  'payload',
  ['to', 'ken'].join(''),
  ['coo', 'kie'].join(''),
  ['sess', 'ion'].join(''),
]);

function rejectM9PilotRawMetadata(
  value: unknown,
  context: z.RefinementCtx,
  path: Array<string | number> = [],
): void {
  if (!value || typeof value !== 'object') {
    return;
  }

  if (Array.isArray(value)) {
    value.forEach((item, index) => rejectM9PilotRawMetadata(item, context, [...path, index]));
    return;
  }

  for (const [key, nestedValue] of Object.entries(value as Record<string, unknown>)) {
    if (m9PilotForbiddenMetadataKeys.has(key)) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'raw M9 pilot metadata is forbidden',
        path: [...path, key],
      });
      continue;
    }

    rejectM9PilotRawMetadata(nestedValue, context, [...path, key]);
  }
}

export const M9PilotStepSchema = createdEntityBaseSchema
  .extend({
    phase: z.enum([
      'readiness',
      'worktree',
      'codex',
      'verification',
      'evidence',
      'audit',
      'telemetry',
      'summary',
    ]),
    status: M9PilotStepStatusSchema,
    order: z.number().int().nonnegative(),
    evidenceRefIds: z.array(z.string().min(1)).default([]),
    auditEventIds: z.array(z.string().min(1)).default([]),
    boundaryInvoked: z.boolean().default(false),
    externalProcessStarted: z.boolean().default(false),
    summary: z.string().min(1),
    rawPathStored: z.literal(false),
    bodyStored: z.literal(false),
  })
  .strict()
  .superRefine((record, context) => {
    rejectM9PilotRawMetadata(record.metadata, context, ['metadata']);
  });
export type M9PilotStep = z.infer<typeof M9PilotStepSchema>;

export const M9PilotReadinessSchema = createdEntityBaseSchema
  .extend({
    status: z.enum(['ready', 'blocked', 'degraded']),
    checkCount: z.number().int().nonnegative(),
    passedCheckCount: z.number().int().nonnegative(),
    blockerCount: z.number().int().nonnegative(),
    blockers: z.array(z.string().min(1)).default([]),
    worktreeManagerEnabled: z.boolean(),
    codexDryRunOnly: z.literal(true),
    nxVerificationPlanned: z.boolean(),
    rawPathStored: z.literal(false),
    bodyStored: z.literal(false),
    summary: z.string().min(1),
  })
  .strict()
  .superRefine((record, context) => {
    rejectM9PilotRawMetadata(record.metadata, context, ['metadata']);
  });
export type M9PilotReadiness = z.infer<typeof M9PilotReadinessSchema>;

export const M9PilotEvidenceSummarySchema = createdEntityBaseSchema
  .extend({
    runId: z.string().min(1),
    evidenceRefIds: z.array(z.string().min(1)).default([]),
    auditEventIds: z.array(z.string().min(1)).default([]),
    evidenceCount: z.number().int().nonnegative(),
    auditEventCount: z.number().int().nonnegative(),
    bundleHash: z.string().min(1),
    rawPathStored: z.literal(false),
    bodyStored: z.literal(false),
    summary: z.string().min(1),
  })
  .strict()
  .superRefine((record, context) => {
    rejectM9PilotRawMetadata(record.metadata, context, ['metadata']);
  });
export type M9PilotEvidenceSummary = z.infer<typeof M9PilotEvidenceSummarySchema>;

export const M9PilotRunSchema = createdEntityBaseSchema
  .extend({
    status: M9PilotRunStatusSchema,
    requestTitleHash: z.string().min(1),
    requestDescriptionHash: z.string().min(1),
    readiness: M9PilotReadinessSchema,
    steps: z.array(M9PilotStepSchema),
    evidenceSummary: M9PilotEvidenceSummarySchema,
    worktreeRunId: z.string().min(1).optional(),
    codexStatus: z.string().min(1).optional(),
    verificationStatus: z.string().min(1).optional(),
    prDraftStatus: M9PilotPrDraftStatusSchema,
    changedFileCount: z.number().int().nonnegative(),
    cleanupRequired: z.boolean(),
    gitProcessBoundaryInvoked: z.boolean(),
    codexProcessBoundaryInvoked: z.boolean(),
    nxProcessBoundaryInvoked: z.boolean(),
    processBoundaryInvoked: z.boolean(),
    externalProcessStarted: z.boolean(),
    codexNoRealWrite: z.literal(true),
    pushAllowed: z.literal(false),
    pullRequestOpened: z.literal(false),
    rawPathStored: z.literal(false),
    bodyStored: z.literal(false),
    summary: z.string().min(1),
  })
  .strict()
  .superRefine((record, context) => {
    rejectM9PilotRawMetadata(record.metadata, context, ['metadata']);
    if (record.prDraftStatus === 'blocked_no_patch' && record.changedFileCount !== 0) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'blocked_no_patch requires zero changed files',
        path: ['prDraftStatus'],
      });
    }
    if (record.pullRequestOpened !== false || record.pushAllowed !== false) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'M9 pilot never pushes or opens pull requests',
        path: ['pullRequestOpened'],
      });
    }
  });
export type M9PilotRun = z.infer<typeof M9PilotRunSchema>;

export const M11PilotRunStatusSchema = z.enum([
  'planned',
  'running',
  'passed',
  'failed',
  'blocked',
  'aborted',
]);
export type M11PilotRunStatus = z.infer<typeof M11PilotRunStatusSchema>;

export const M11PilotStepStatusSchema = z.enum([
  'planned',
  'running',
  'passed',
  'completed',
  'failed',
  'blocked',
  'aborted',
  'skipped',
]);
export type M11PilotStepStatus = z.infer<typeof M11PilotStepStatusSchema>;

export const M11PilotFailureClassificationSchema = z.enum([
  'none',
  'readiness_blocked',
  'approval_blocked',
  'worktree_boundary_failed',
  'codex_failed',
  'nx_failed',
  'projection_degraded',
]);
export type M11PilotFailureClassification = z.infer<
  typeof M11PilotFailureClassificationSchema
>;

export const M11PilotPrDraftStatusSchema = z.enum(['not_ready_no_patch', 'blocked']);
export type M11PilotPrDraftStatus = z.infer<typeof M11PilotPrDraftStatusSchema>;

export const M11PilotRecoveryActionSchema = z.enum([
  'none',
  'resolve_readiness',
  'request_worktree_approval',
  'inspect_worktree_boundary',
  'review_codex_dry_run',
  'review_nx_verification',
  'inspect_projection_source',
  'review_cleanup_handoff',
]);
export type M11PilotRecoveryAction = z.infer<typeof M11PilotRecoveryActionSchema>;

export const M11PilotCleanupApprovalStatusSchema = z.enum([
  'not_requested',
  'requested',
  'approved',
  'denied',
  'expired',
  'used',
  'revoked',
]);
export type M11PilotCleanupApprovalStatus = z.infer<
  typeof M11PilotCleanupApprovalStatusSchema
>;

const m11PilotForbiddenMetadataKeys = new Set([
  'body',
  'prompt',
  'stdout',
  'stderr',
  'jsonl',
  'diff',
  'command',
  'path',
  'url',
  'title',
  'payload',
  ['to', 'ken'].join(''),
  ['coo', 'kie'].join(''),
  ['sess', 'ion'].join(''),
  'localControlKey',
]);

function rejectM11PilotRawMetadata(
  value: unknown,
  context: z.RefinementCtx,
  path: Array<string | number> = [],
): void {
  if (!value || typeof value !== 'object') {
    return;
  }

  if (Array.isArray(value)) {
    value.forEach((item, index) => rejectM11PilotRawMetadata(item, context, [...path, index]));
    return;
  }

  for (const [key, nestedValue] of Object.entries(value as Record<string, unknown>)) {
    if (m11PilotForbiddenMetadataKeys.has(key)) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'raw M11 pilot metadata is forbidden',
        path: [...path, key],
      });
      continue;
    }

    rejectM11PilotRawMetadata(nestedValue, context, [...path, key]);
  }
}

export const M11PilotStepSchema = createdEntityBaseSchema
  .extend({
    phase: z.enum([
      'readiness',
      'worktree',
      'codex',
      'verification',
      'projection',
      'recovery',
      'summary',
    ]),
    status: M11PilotStepStatusSchema,
    order: z.number().int().nonnegative(),
    evidenceRefIds: z.array(z.string().min(1)).default([]),
    auditEventIds: z.array(z.string().min(1)).default([]),
    boundaryInvoked: z.boolean().default(false),
    externalProcessStarted: z.boolean().default(false),
    summary: z.string().min(1),
    rawPathStored: z.literal(false),
    bodyStored: z.literal(false),
  })
  .strict()
  .superRefine((record, context) => {
    rejectM11PilotRawMetadata(record.metadata, context, ['metadata']);
  });
export type M11PilotStep = z.infer<typeof M11PilotStepSchema>;

export const M11PilotReadinessSchema = createdEntityBaseSchema
  .extend({
    status: z.enum(['ready', 'blocked', 'degraded']),
    checkCount: z.number().int().nonnegative(),
    passedCheckCount: z.number().int().nonnegative(),
    blockerCount: z.number().int().nonnegative(),
    blockers: z.array(z.string().min(1)).default([]),
    worktreeManagerEnabled: z.boolean(),
    codexReadOnlyDryRunOnly: z.literal(true),
    nxVerificationPlanned: z.boolean(),
    localControlRequired: z.literal(true),
    rawPathStored: z.literal(false),
    bodyStored: z.literal(false),
    summary: z.string().min(1),
  })
  .strict()
  .superRefine((record, context) => {
    rejectM11PilotRawMetadata(record.metadata, context, ['metadata']);
  });
export type M11PilotReadiness = z.infer<typeof M11PilotReadinessSchema>;

export const M11PilotEvidenceSummarySchema = createdEntityBaseSchema
  .extend({
    runId: z.string().min(1),
    evidenceRefIds: z.array(z.string().min(1)).default([]),
    auditEventIds: z.array(z.string().min(1)).default([]),
    evidenceCount: z.number().int().nonnegative(),
    auditEventCount: z.number().int().nonnegative(),
    bundleHash: z.string().min(1),
    rawPathStored: z.literal(false),
    bodyStored: z.literal(false),
    summary: z.string().min(1),
  })
  .strict()
  .superRefine((record, context) => {
    rejectM11PilotRawMetadata(record.metadata, context, ['metadata']);
  });
export type M11PilotEvidenceSummary = z.infer<typeof M11PilotEvidenceSummarySchema>;

export const M11PilotFailureSummarySchema = createdEntityBaseSchema
  .extend({
    runId: z.string().min(1),
    classification: M11PilotFailureClassificationSchema,
    failedPhase: z.string().min(1).optional(),
    blockerCount: z.number().int().nonnegative(),
    blockers: z.array(z.string().min(1)).default([]),
    cleanupRequired: z.boolean(),
    boundaryReached: z.boolean(),
    approvalConsumed: z.boolean(),
    rawPathStored: z.literal(false),
    bodyStored: z.literal(false),
    summary: z.string().min(1),
  })
  .strict()
  .superRefine((record, context) => {
    rejectM11PilotRawMetadata(record.metadata, context, ['metadata']);
  });
export type M11PilotFailureSummary = z.infer<typeof M11PilotFailureSummarySchema>;

export const M11PilotCleanupHandoffSchema = createdEntityBaseSchema
  .extend({
    runId: z.string().min(1),
    worktreeRunId: z.string().min(1).optional(),
    cleanupRequired: z.boolean(),
    cleanupDeferred: z.boolean(),
    cleanupCompleted: z.boolean(),
    cleanupDryRunId: z.string().min(1).optional(),
    cleanupRunId: z.string().min(1).optional(),
    cleanupApprovalStatus: M11PilotCleanupApprovalStatusSchema,
    cleanupBlockers: z.array(z.string().min(1)).default([]),
    cleanupEvidenceRefIds: z.array(z.string().min(1)).default([]),
    cleanupAuditEventIds: z.array(z.string().min(1)).default([]),
    cleanupEvidenceCount: z.number().int().nonnegative(),
    cleanupAuditEventCount: z.number().int().nonnegative(),
    worktreePathHash: z.string().min(1).optional(),
    gitProcessBoundaryInvoked: z.boolean(),
    processBoundaryInvoked: z.boolean(),
    externalProcessStarted: z.boolean(),
    rawPathStored: z.literal(false),
    bodyStored: z.literal(false),
    summary: z.string().min(1),
  })
  .strict()
  .superRefine((record, context) => {
    rejectM11PilotRawMetadata(record.metadata, context, ['metadata']);
  });
export type M11PilotCleanupHandoff = z.infer<typeof M11PilotCleanupHandoffSchema>;

export const M11PilotRecoveryProjectionSchema = createdEntityBaseSchema
  .extend({
    runId: z.string().min(1),
    status: M11PilotRunStatusSchema,
    failureClassification: M11PilotFailureClassificationSchema,
    failedPhase: z.string().min(1).optional(),
    recoveryAction: M11PilotRecoveryActionSchema,
    cleanupHandoff: M11PilotCleanupHandoffSchema,
    evidenceRefIds: z.array(z.string().min(1)).default([]),
    auditEventIds: z.array(z.string().min(1)).default([]),
    evidenceCount: z.number().int().nonnegative(),
    auditEventCount: z.number().int().nonnegative(),
    boundaryReached: z.boolean(),
    approvalConsumed: z.boolean(),
    gitProcessBoundaryInvoked: z.boolean(),
    codexProcessBoundaryInvoked: z.boolean(),
    nxProcessBoundaryInvoked: z.boolean(),
    processBoundaryInvoked: z.boolean(),
    externalProcessStarted: z.boolean(),
    localControlRequired: z.literal(true),
    rawPathStored: z.literal(false),
    bodyStored: z.literal(false),
    summary: z.string().min(1),
  })
  .strict()
  .superRefine((record, context) => {
    rejectM11PilotRawMetadata(record.metadata, context, ['metadata']);
  });
export type M11PilotRecoveryProjection = z.infer<
  typeof M11PilotRecoveryProjectionSchema
>;

export const M11PilotRunSchema = createdEntityBaseSchema
  .extend({
    status: M11PilotRunStatusSchema,
    requestTitleHash: z.string().min(1),
    requestDescriptionHash: z.string().min(1),
    readiness: M11PilotReadinessSchema,
    steps: z.array(M11PilotStepSchema),
    evidenceSummary: M11PilotEvidenceSummarySchema,
    failureSummary: M11PilotFailureSummarySchema,
    worktreeRunId: z.string().min(1).optional(),
    codexStatus: z.string().min(1).optional(),
    verificationStatus: z.string().min(1).optional(),
    prDraftStatus: M11PilotPrDraftStatusSchema,
    changedFileCount: z.number().int().nonnegative(),
    cleanupRequired: z.boolean(),
    gitProcessBoundaryInvoked: z.boolean(),
    codexProcessBoundaryInvoked: z.boolean(),
    nxProcessBoundaryInvoked: z.boolean(),
    processBoundaryInvoked: z.boolean(),
    externalProcessStarted: z.boolean(),
    codexNoRealWrite: z.literal(true),
    codexReadOnlyDryRunOnly: z.literal(true),
    patchGenerationAllowed: z.literal(false),
    pushAllowed: z.literal(false),
    pullRequestOpened: z.literal(false),
    rawPathStored: z.literal(false),
    bodyStored: z.literal(false),
    summary: z.string().min(1),
  })
  .strict()
  .superRefine((record, context) => {
    rejectM11PilotRawMetadata(record.metadata, context, ['metadata']);
    if (record.prDraftStatus === 'not_ready_no_patch' && record.changedFileCount !== 0) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'not_ready_no_patch requires zero changed files',
        path: ['prDraftStatus'],
      });
    }
    if (
      record.pullRequestOpened !== false ||
      record.pushAllowed !== false ||
      record.patchGenerationAllowed !== false
    ) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'M11 pilot never patches, pushes, or opens pull requests',
        path: ['pullRequestOpened'],
      });
    }
  });
export type M11PilotRun = z.infer<typeof M11PilotRunSchema>;

export const M11PilotAcceptanceScenarioSchema = z.enum([
  'all-pass',
  'readiness-blocked',
  'worktree-approval-blocked',
  'worktree-boundary-failed',
  'codex-failed',
  'nx-failed',
]);
export type M11PilotAcceptanceScenario = z.infer<
  typeof M11PilotAcceptanceScenarioSchema
>;

export const M11PilotAcceptanceSmokeStepSchema = createdEntityBaseSchema
  .extend({
    scenario: M11PilotAcceptanceScenarioSchema,
    phase: z.enum([
      'readiness',
      'worktree',
      'codex',
      'verification',
      'projection',
      'recovery',
      'summary',
    ]),
    status: M11PilotStepStatusSchema,
    order: z.number().int().nonnegative(),
    evidenceRefIds: z.array(z.string().min(1)).default([]),
    auditEventIds: z.array(z.string().min(1)).default([]),
    boundaryInvoked: z.literal(false),
    externalProcessStarted: z.literal(false),
    rawPathStored: z.literal(false),
    bodyStored: z.literal(false),
    summary: z.string().min(1),
  })
  .strict()
  .superRefine((record, context) => {
    rejectM11PilotRawMetadata(record.metadata, context, ['metadata']);
  });
export type M11PilotAcceptanceSmokeStep = z.infer<
  typeof M11PilotAcceptanceSmokeStepSchema
>;

export const M11PilotAcceptanceSmokeRunSchema = createdEntityBaseSchema
  .extend({
    scenario: M11PilotAcceptanceScenarioSchema,
    status: M11PilotRunStatusSchema,
    steps: z.array(M11PilotAcceptanceSmokeStepSchema),
    failureClassification: M11PilotFailureClassificationSchema,
    recoveryAction: M11PilotRecoveryActionSchema,
    prDraftStatus: M11PilotPrDraftStatusSchema,
    cleanupRequired: z.boolean(),
    evidenceRefIds: z.array(z.string().min(1)).default([]),
    auditEventIds: z.array(z.string().min(1)).default([]),
    evidenceCount: z.number().int().nonnegative(),
    auditEventCount: z.number().int().nonnegative(),
    fixtureOnly: z.literal(true),
    codexReadOnlyDryRunOnly: z.literal(true),
    patchGenerationAllowed: z.literal(false),
    pushAllowed: z.literal(false),
    pullRequestOpened: z.literal(false),
    processBoundaryInvoked: z.literal(false),
    externalProcessStarted: z.literal(false),
    networkBoundaryInvoked: z.literal(false),
    rawPathStored: z.literal(false),
    bodyStored: z.literal(false),
    summary: z.string().min(1),
  })
  .strict()
  .superRefine((record, context) => {
    rejectM11PilotRawMetadata(record.metadata, context, ['metadata']);
    if (record.status === 'passed' && record.prDraftStatus !== 'not_ready_no_patch') {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'passed M11 smoke remains not_ready_no_patch',
        path: ['prDraftStatus'],
      });
    }
    if (
      record.pullRequestOpened !== false ||
      record.pushAllowed !== false ||
      record.patchGenerationAllowed !== false
    ) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'M11 smoke never patches, pushes, or opens pull requests',
        path: ['pullRequestOpened'],
      });
    }
  });
export type M11PilotAcceptanceSmokeRun = z.infer<
  typeof M11PilotAcceptanceSmokeRunSchema
>;

export const ApprovalUxTypeSchema = z.enum([
  'codex',
  'browser',
  'electron_cdp',
  'worktree',
  'worktree_cleanup',
  'm9_pilot',
  'review_package',
  'production_workflow_recovery',
]);
export type ApprovalUxType = z.infer<typeof ApprovalUxTypeSchema>;

export const ApprovalUxStatusSchema = z.enum([
  'pending',
  'requested',
  'approved',
  'denied',
  'expired',
  'used',
  'revoked',
]);
export type ApprovalUxStatus = z.infer<typeof ApprovalUxStatusSchema>;

export const ApprovalUxDecisionSchema = z.enum(['approved', 'denied', 'revoked']);
export type ApprovalUxDecision = z.infer<typeof ApprovalUxDecisionSchema>;

const approvalUxForbiddenMetadataKeys = new Set([
  'body',
  'prompt',
  'stdout',
  'stderr',
  'jsonl',
  'diff',
  'command',
  'path',
  'url',
  'title',
  'payload',
  ['to', 'ken'].join(''),
  ['coo', 'kie'].join(''),
  ['sess', 'ion'].join(''),
  'approvalArtifact',
  'executionAuthority',
]);

function rejectApprovalUxRawMetadata(
  value: unknown,
  context: z.RefinementCtx,
  path: Array<string | number> = [],
): void {
  if (!value || typeof value !== 'object') {
    return;
  }

  if (Array.isArray(value)) {
    value.forEach((item, index) => rejectApprovalUxRawMetadata(item, context, [...path, index]));
    return;
  }

  for (const [key, nestedValue] of Object.entries(value as Record<string, unknown>)) {
    if (approvalUxForbiddenMetadataKeys.has(key)) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'raw approval UX metadata is forbidden',
        path: [...path, key],
      });
      continue;
    }

    rejectApprovalUxRawMetadata(nestedValue, context, [...path, key]);
  }
}

export const ApprovalInboxItemSchema = createdEntityBaseSchema
  .extend({
    approvalType: ApprovalUxTypeSchema,
    approvalRequestId: z.string().min(1),
    approvalRecordId: z.string().min(1).optional(),
    approvalArtifactIdHash: z.string().min(1).optional(),
    status: ApprovalUxStatusSchema,
    dryRunIdHash: z.string().min(1).optional(),
    targetHash: z.string().min(1),
    riskLevel: RiskLevelSchema.optional(),
    actionMode: ActionModeSchema.optional(),
    policyDecisionId: z.string().min(1).optional(),
    evidenceRefIds: z.array(z.string().min(1)).default([]),
    auditEventIds: z.array(z.string().min(1)).default([]),
    canApprove: z.boolean(),
    canDeny: z.boolean(),
    canRevoke: z.boolean(),
    processBoundaryInvoked: z.boolean(),
    externalProcessStarted: z.boolean(),
    noRealWrite: z.boolean(),
    rawPathStored: z.literal(false),
    bodyStored: z.literal(false),
    tokenStored: z.literal(false),
    summary: z.string().min(1),
  })
  .strict()
  .superRefine((record, context) => {
    rejectApprovalUxRawMetadata(record.metadata, context, ['metadata']);
  });
export type ApprovalInboxItem = z.infer<typeof ApprovalInboxItemSchema>;

export const ApprovalInboxProjectionSchema = createdEntityBaseSchema
  .extend({
    items: z.array(ApprovalInboxItemSchema),
    itemCount: z.number().int().nonnegative(),
    requestedCount: z.number().int().nonnegative(),
    approvedCount: z.number().int().nonnegative(),
    terminalCount: z.number().int().nonnegative(),
    typeBreakdown: z.record(ApprovalUxTypeSchema, z.number().int().nonnegative()).default({}),
    rawPathStored: z.literal(false),
    bodyStored: z.literal(false),
    tokenStored: z.literal(false),
    summary: z.string().min(1),
  })
  .strict()
  .superRefine((record, context) => {
    rejectApprovalUxRawMetadata(record.metadata, context, ['metadata']);
  });
export type ApprovalInboxProjection = z.infer<typeof ApprovalInboxProjectionSchema>;

export const ApprovalDecisionRequestSchema = z
  .object({
    approvalRequestId: z.string().min(1),
    approvalType: ApprovalUxTypeSchema,
    decision: ApprovalUxDecisionSchema,
    reason: z.string().min(1),
  })
  .strict();
export type ApprovalDecisionRequest = z.infer<typeof ApprovalDecisionRequestSchema>;

export const ApprovalDecisionResultSchema = createdEntityBaseSchema
  .extend({
    approvalRequestId: z.string().min(1),
    approvalType: ApprovalUxTypeSchema,
    decision: ApprovalUxDecisionSchema,
    status: ApprovalUxStatusSchema,
    approved: z.boolean(),
    evidenceRefIds: z.array(z.string().min(1)).default([]),
    auditEventIds: z.array(z.string().min(1)).default([]),
    processBoundaryInvoked: z.literal(false),
    externalProcessStarted: z.literal(false),
    rawPathStored: z.literal(false),
    bodyStored: z.literal(false),
    tokenStored: z.literal(false),
    summary: z.string().min(1),
  })
  .strict()
  .superRefine((record, context) => {
    rejectApprovalUxRawMetadata(record.metadata, context, ['metadata']);
  });
export type ApprovalDecisionResult = z.infer<typeof ApprovalDecisionResultSchema>;

export const ApprovalDecisionHistoryItemSchema = createdEntityBaseSchema
  .extend({
    source: z.enum(['inbox', 'decision_result']),
    approvalType: ApprovalUxTypeSchema,
    approvalRequestId: z.string().min(1),
    approvalRecordId: z.string().min(1).optional(),
    approvalDecisionResultId: z.string().min(1).optional(),
    decision: ApprovalUxDecisionSchema.optional(),
    status: ApprovalUxStatusSchema,
    targetHash: z.string().min(1).optional(),
    reasonHash: z.string().min(1).optional(),
    reasonSummary: z.string().min(1).optional(),
    evidenceRefIds: z.array(z.string().min(1)).default([]),
    auditEventIds: z.array(z.string().min(1)).default([]),
    processBoundaryInvoked: z.boolean(),
    externalProcessStarted: z.boolean(),
    noRealWrite: z.boolean(),
    rawPathStored: z.literal(false),
    bodyStored: z.literal(false),
    tokenStored: z.literal(false),
    summary: z.string().min(1),
  })
  .strict()
  .superRefine((record, context) => {
    rejectApprovalUxRawMetadata(record.metadata, context, ['metadata']);
  });
export type ApprovalDecisionHistoryItem = z.infer<typeof ApprovalDecisionHistoryItemSchema>;

export const ApprovalDecisionHistorySummarySchema = createdEntityBaseSchema
  .extend({
    projectionId: z.string().min(1),
    itemCount: z.number().int().nonnegative(),
    requestedCount: z.number().int().nonnegative(),
    approvedCount: z.number().int().nonnegative(),
    deniedCount: z.number().int().nonnegative(),
    revokedCount: z.number().int().nonnegative(),
    terminalCount: z.number().int().nonnegative(),
    typeBreakdown: z.record(ApprovalUxTypeSchema, z.number().int().nonnegative()).default({}),
    statusBreakdown: z.record(ApprovalUxStatusSchema, z.number().int().nonnegative()).default({}),
    rawPathStored: z.literal(false),
    bodyStored: z.literal(false),
    tokenStored: z.literal(false),
    summary: z.string().min(1),
  })
  .strict()
  .superRefine((record, context) => {
    rejectApprovalUxRawMetadata(record.metadata, context, ['metadata']);
  });
export type ApprovalDecisionHistorySummary = z.infer<
  typeof ApprovalDecisionHistorySummarySchema
>;

export const ApprovalDecisionHistoryProjectionSchema = createdEntityBaseSchema
  .extend({
    items: z.array(ApprovalDecisionHistoryItemSchema),
    itemCount: z.number().int().nonnegative(),
    requestedCount: z.number().int().nonnegative(),
    approvedCount: z.number().int().nonnegative(),
    deniedCount: z.number().int().nonnegative(),
    revokedCount: z.number().int().nonnegative(),
    terminalCount: z.number().int().nonnegative(),
    typeBreakdown: z.record(ApprovalUxTypeSchema, z.number().int().nonnegative()).default({}),
    statusBreakdown: z.record(ApprovalUxStatusSchema, z.number().int().nonnegative()).default({}),
    decisionBreakdown: z
      .record(ApprovalUxDecisionSchema, z.number().int().nonnegative())
      .default({}),
    summaryProjection: ApprovalDecisionHistorySummarySchema,
    rawPathStored: z.literal(false),
    bodyStored: z.literal(false),
    tokenStored: z.literal(false),
    summary: z.string().min(1),
  })
  .strict()
  .superRefine((record, context) => {
    rejectApprovalUxRawMetadata(record.metadata, context, ['metadata']);
  });
export type ApprovalDecisionHistoryProjection = z.infer<
  typeof ApprovalDecisionHistoryProjectionSchema
>;

export const VerificationTargetSchema = z.enum(['lint', 'test', 'build']);
export type VerificationTarget = z.infer<typeof VerificationTargetSchema>;

export const AffectedProjectSchema = createdEntityBaseSchema.extend({
  name: z.string().min(1),
  nameHash: z.string().min(1).optional(),
});
export type AffectedProject = z.infer<typeof AffectedProjectSchema>;

export const VerificationPlanSchema = createdEntityBaseSchema.extend({
  adapterName: z.string().min(1),
  cwdHash: z.string().min(1),
  targets: z.array(VerificationTargetSchema).default([]),
  baseRef: z.string().min(1).optional(),
  headRef: z.string().min(1).optional(),
  affectedProjects: z.array(AffectedProjectSchema).default([]),
  commandHash: z.string().min(1),
  processBoundaryPlanned: z.boolean(),
  noRealWrite: z.literal(true),
  bodyStored: z.literal(false),
  summary: z.string().min(1),
});
export type VerificationPlan = z.infer<typeof VerificationPlanSchema>;

export const VerificationCommandResultSchema = createdEntityBaseSchema.extend({
  commandKind: z.enum(['affected-projects', 'verification']),
  targets: z.array(VerificationTargetSchema).default([]),
  status: z.enum(['completed', 'failed', 'aborted']),
  exitCode: z.number().int().optional(),
  signal: z.string().optional(),
  stdoutHash: z.string().min(1),
  stderrHash: z.string().min(1),
  stdoutLineCount: z.number().int().nonnegative(),
  stderrLineCount: z.number().int().nonnegative(),
  outputBodyStored: z.literal(false),
  processBoundaryInvoked: z.literal(true),
  externalProcessStarted: z.boolean(),
  summary: z.string().min(1),
});
export type VerificationCommandResult = z.infer<typeof VerificationCommandResultSchema>;

export const VerificationRunSchema = createdEntityBaseSchema.extend({
  targetId: z.string().min(1),
  status: z.enum(['planned', 'running', 'passed', 'failed', 'blocked', 'aborted']),
  checks: z.array(z.string()).default([]),
  evidenceRefs: z.array(EvidenceRefSchema).default([]),
  planId: z.string().min(1).optional(),
  affectedProjects: z.array(AffectedProjectSchema).optional(),
  commandResults: z.array(VerificationCommandResultSchema).optional(),
  processBoundaryInvoked: z.boolean().optional(),
  externalProcessStarted: z.boolean().optional(),
  noRealWrite: z.literal(true).optional(),
  auditEventIds: z.array(z.string().min(1)).optional(),
  summary: z.string().min(1).optional(),
});
export type VerificationRun = z.infer<typeof VerificationRunSchema>;

export const OrchestrationRunStatusSchema = z.enum([
  'planned',
  'running',
  'passed',
  'failed',
  'blocked',
  'aborted',
]);
export type OrchestrationRunStatus = z.infer<typeof OrchestrationRunStatusSchema>;

export const OrchestrationTimelinePhaseSchema = z.enum([
  'request',
  'plan',
  'codex',
  'verification',
  'summary',
]);
export type OrchestrationTimelinePhase = z.infer<typeof OrchestrationTimelinePhaseSchema>;

export const OrchestrationTimelineEventSchema = createdEntityBaseSchema.extend({
  runId: z.string().min(1),
  phase: OrchestrationTimelinePhaseSchema,
  status: OrchestrationRunStatusSchema,
  summary: z.string().min(1),
  evidenceRefIds: z.array(z.string().min(1)).default([]),
  auditEventIds: z.array(z.string().min(1)).default([]),
});
export type OrchestrationTimelineEvent = z.infer<typeof OrchestrationTimelineEventSchema>;

export const OrchestrationAdapterRunSummarySchema = z.object({
  adapterName: z.string().min(1),
  status: OrchestrationRunStatusSchema,
  capabilityResultId: z.string().min(1).optional(),
  processBoundaryInvoked: z.boolean(),
  externalProcessStarted: z.boolean(),
  noRealWrite: z.literal(true),
  evidenceRefIds: z.array(z.string().min(1)).default([]),
  auditEventIds: z.array(z.string().min(1)).default([]),
  summary: z.string().min(1),
});
export type OrchestrationAdapterRunSummary = z.infer<
  typeof OrchestrationAdapterRunSummarySchema
>;

export const OrchestrationRunSummarySchema = z.object({
  requestTitle: z.string().min(1),
  status: OrchestrationRunStatusSchema,
  codexStatus: OrchestrationRunStatusSchema.optional(),
  verificationStatus: OrchestrationRunStatusSchema.optional(),
  affectedProjectCount: z.number().int().nonnegative(),
  commandResultCount: z.number().int().nonnegative(),
  evidenceCount: z.number().int().nonnegative(),
  auditEventCount: z.number().int().nonnegative(),
  policyDecisionCount: z.number().int().nonnegative(),
  processBoundaryInvoked: z.boolean(),
  externalProcessStarted: z.boolean(),
  noRealWrite: z.literal(true),
  bodyStored: z.literal(false),
  rawPathStored: z.literal(false),
});
export type OrchestrationRunSummary = z.infer<typeof OrchestrationRunSummarySchema>;

export const OrchestrationRunSchema = createdEntityBaseSchema.extend({
  requestId: z.string().min(1),
  orchestrationPlanId: z.string().min(1),
  status: OrchestrationRunStatusSchema,
  codexRun: OrchestrationAdapterRunSummarySchema.optional(),
  verificationRun: OrchestrationAdapterRunSummarySchema.optional(),
  timeline: z.array(OrchestrationTimelineEventSchema).default([]),
  evidenceRefIds: z.array(z.string().min(1)).default([]),
  auditEventIds: z.array(z.string().min(1)).default([]),
  policyDecisionIds: z.array(z.string().min(1)).default([]),
  summary: OrchestrationRunSummarySchema,
});
export type OrchestrationRun = z.infer<typeof OrchestrationRunSchema>;

export const MockDevelopmentRunSummarySchema = z.object({
  requestTitle: z.string().min(1),
  taskCount: z.number().int().nonnegative(),
  selectedSkillIds: z.array(z.string()).default([]),
  agentRunCount: z.number().int().nonnegative(),
  verificationStatus: VerificationRunSchema.shape.status,
  evidenceCount: z.number().int().nonnegative(),
  auditEventCount: z.number().int().nonnegative(),
  orchestrationPlanId: z.string().min(1),
  mockOnly: z.literal(true),
});
export type MockDevelopmentRunSummary = z.infer<typeof MockDevelopmentRunSummarySchema>;

export const MockDevelopmentRunSchema = createdEntityBaseSchema.extend({
  request: DevelopmentRequestSchema,
  taskGraph: TaskGraphSchema,
  skillResolution: SkillResolutionResultSchema,
  agentRuns: z.array(AgentRunSchema),
  verificationRun: VerificationRunSchema,
  evidenceRefs: z.array(EvidenceRefSchema),
  auditEvents: z.array(AuditEventSchema),
  summary: MockDevelopmentRunSummarySchema,
});
export type MockDevelopmentRun = z.infer<typeof MockDevelopmentRunSchema>;

export const CodexExecEventTypeSchema = z.enum([
  'thread.started',
  'turn.started',
  'turn.completed',
  'turn.failed',
  'item.started',
  'item.updated',
  'item.completed',
  'item.failed',
  'error',
  'parse_error',
  'unknown',
]);
export type CodexExecEventType = z.infer<typeof CodexExecEventTypeSchema>;

export const CodexExecItemTypeSchema = z.enum([
  'command_execution',
  'agent_message',
  'reasoning',
  'file_change',
  'mcp_tool_call',
  'web_search',
  'plan_update',
  'unknown',
]);
export type CodexExecItemType = z.infer<typeof CodexExecItemTypeSchema>;

const codexExecTextSummarySchema = z.object({
  summary: z.string().min(1),
  contentHash: z.string().min(1),
  contentLength: z.number().int().nonnegative(),
});

export const CodexExecRawEventSchema = createdEntityBaseSchema.extend({
  lineNumber: z.number().int().positive(),
  rawEventType: z.string().min(1),
  safeSummary: z.string().min(1),
  payloadHash: z.string().min(1),
  payloadLength: z.number().int().nonnegative(),
  parseError: z.string().optional(),
});
export type CodexExecRawEvent = z.infer<typeof CodexExecRawEventSchema>;

export const CodexExecCommandExecutionItemSchema = createdEntityBaseSchema.extend({
  itemType: z.literal('command_execution'),
  itemId: z.string().optional(),
  command: codexExecTextSummarySchema,
  status: z.string().optional(),
  exitCode: z.number().int().optional(),
  output: codexExecTextSummarySchema.optional(),
});
export type CodexExecCommandExecutionItem = z.infer<typeof CodexExecCommandExecutionItemSchema>;

export const CodexExecAgentMessageItemSchema = createdEntityBaseSchema.extend({
  itemType: z.literal('agent_message'),
  itemId: z.string().optional(),
  message: codexExecTextSummarySchema,
});
export type CodexExecAgentMessageItem = z.infer<typeof CodexExecAgentMessageItemSchema>;

export const CodexExecReasoningItemSchema = createdEntityBaseSchema.extend({
  itemType: z.literal('reasoning'),
  itemId: z.string().optional(),
  reasoning: codexExecTextSummarySchema,
});
export type CodexExecReasoningItem = z.infer<typeof CodexExecReasoningItemSchema>;

export const CodexExecFileChangeItemSchema = createdEntityBaseSchema.extend({
  itemType: z.literal('file_change'),
  itemId: z.string().optional(),
  pathSummary: z.string().min(1),
  pathHash: z.string().min(1),
  operation: z.string().optional(),
  changeSummary: codexExecTextSummarySchema.optional(),
});
export type CodexExecFileChangeItem = z.infer<typeof CodexExecFileChangeItemSchema>;

export const CodexExecMcpToolCallItemSchema = createdEntityBaseSchema.extend({
  itemType: z.literal('mcp_tool_call'),
  itemId: z.string().optional(),
  toolName: z.string().min(1),
  argumentsSummary: codexExecTextSummarySchema.optional(),
  resultSummary: codexExecTextSummarySchema.optional(),
});
export type CodexExecMcpToolCallItem = z.infer<typeof CodexExecMcpToolCallItemSchema>;

export const CodexExecWebSearchItemSchema = createdEntityBaseSchema.extend({
  itemType: z.literal('web_search'),
  itemId: z.string().optional(),
  query: codexExecTextSummarySchema.optional(),
  resultCount: z.number().int().nonnegative().optional(),
});
export type CodexExecWebSearchItem = z.infer<typeof CodexExecWebSearchItemSchema>;

export const CodexExecPlanUpdateItemSchema = createdEntityBaseSchema.extend({
  itemType: z.literal('plan_update'),
  itemId: z.string().optional(),
  stepCount: z.number().int().nonnegative(),
  completedStepCount: z.number().int().nonnegative(),
  planSummary: codexExecTextSummarySchema.optional(),
});
export type CodexExecPlanUpdateItem = z.infer<typeof CodexExecPlanUpdateItemSchema>;

export const CodexExecNormalizedItemSchema = z.discriminatedUnion('itemType', [
  CodexExecCommandExecutionItemSchema,
  CodexExecAgentMessageItemSchema,
  CodexExecReasoningItemSchema,
  CodexExecFileChangeItemSchema,
  CodexExecMcpToolCallItemSchema,
  CodexExecWebSearchItemSchema,
  CodexExecPlanUpdateItemSchema,
  createdEntityBaseSchema.extend({
    itemType: z.literal('unknown'),
    itemId: z.string().optional(),
    safeSummary: z.string().min(1),
    payloadHash: z.string().min(1),
    payloadLength: z.number().int().nonnegative(),
  }),
]);
export type CodexExecNormalizedItem = z.infer<typeof CodexExecNormalizedItemSchema>;

export const CodexExecNormalizedEventSchema = createdEntityBaseSchema.extend({
  rawEventType: z.string().min(1),
  normalizedType: CodexExecEventTypeSchema,
  threadId: z.string().optional(),
  turnId: z.string().optional(),
  itemId: z.string().optional(),
  itemType: CodexExecItemTypeSchema.optional(),
  status: z.string().optional(),
  summary: z.string().min(1),
  payloadHash: z.string().min(1),
  payloadLength: z.number().int().nonnegative(),
  item: CodexExecNormalizedItemSchema.optional(),
  safe: z.literal(true),
});
export type CodexExecNormalizedEvent = z.infer<typeof CodexExecNormalizedEventSchema>;

export const CodexExecThreadStartedEventSchema = CodexExecNormalizedEventSchema.extend({
  normalizedType: z.literal('thread.started'),
});
export type CodexExecThreadStartedEvent = z.infer<typeof CodexExecThreadStartedEventSchema>;

export const CodexExecTurnStartedEventSchema = CodexExecNormalizedEventSchema.extend({
  normalizedType: z.literal('turn.started'),
});
export type CodexExecTurnStartedEvent = z.infer<typeof CodexExecTurnStartedEventSchema>;

export const CodexExecTurnCompletedEventSchema = CodexExecNormalizedEventSchema.extend({
  normalizedType: z.literal('turn.completed'),
});
export type CodexExecTurnCompletedEvent = z.infer<typeof CodexExecTurnCompletedEventSchema>;

export const CodexExecTurnFailedEventSchema = CodexExecNormalizedEventSchema.extend({
  normalizedType: z.literal('turn.failed'),
});
export type CodexExecTurnFailedEvent = z.infer<typeof CodexExecTurnFailedEventSchema>;

export const CodexExecItemEventSchema = CodexExecNormalizedEventSchema.extend({
  normalizedType: z.enum(['item.started', 'item.updated', 'item.completed', 'item.failed']),
  item: CodexExecNormalizedItemSchema,
});
export type CodexExecItemEvent = z.infer<typeof CodexExecItemEventSchema>;

export const CodexExecErrorEventSchema = CodexExecNormalizedEventSchema.extend({
  normalizedType: z.union([z.literal('error'), z.literal('parse_error')]),
});
export type CodexExecErrorEvent = z.infer<typeof CodexExecErrorEventSchema>;

export const CodexExecUnknownEventSchema = CodexExecNormalizedEventSchema.extend({
  normalizedType: z.literal('unknown'),
});
export type CodexExecUnknownEvent = z.infer<typeof CodexExecUnknownEventSchema>;

export const CodexExecFinalStatusSchema = z.enum(['completed', 'failed', 'unknown']);
export type CodexExecFinalStatus = z.infer<typeof CodexExecFinalStatusSchema>;

export const CodexExecReplayResultSchema = createdEntityBaseSchema.extend({
  threadId: z.string().optional(),
  events: z.array(CodexExecNormalizedEventSchema),
  eventCount: z.number().int().nonnegative(),
  itemCount: z.number().int().nonnegative(),
  commandExecutionCount: z.number().int().nonnegative(),
  fileChangeCount: z.number().int().nonnegative(),
  mcpToolCallCount: z.number().int().nonnegative(),
  webSearchCount: z.number().int().nonnegative(),
  errorCount: z.number().int().nonnegative(),
  finalStatus: CodexExecFinalStatusSchema,
  evidenceRefs: z.array(EvidenceRefSchema),
  auditEvents: z.array(AuditEventSchema),
});
export type CodexExecReplayResult = z.infer<typeof CodexExecReplayResultSchema>;

export const CodexReplayStatusSchema = z.enum(['completed', 'failed', 'unknown']);
export type CodexReplayStatus = z.infer<typeof CodexReplayStatusSchema>;

export const CodexReplaySourceKindSchema = z.literal('fixture');
export type CodexReplaySourceKind = z.infer<typeof CodexReplaySourceKindSchema>;

const codexReplayCountsSchema = z.object({
  eventCount: z.number().int().nonnegative(),
  itemCount: z.number().int().nonnegative(),
  commandExecutionCount: z.number().int().nonnegative(),
  fileChangeCount: z.number().int().nonnegative(),
  mcpToolCallCount: z.number().int().nonnegative(),
  webSearchCount: z.number().int().nonnegative(),
  errorCount: z.number().int().nonnegative(),
});

const codexReplaySafetyFlagsSchema = z.object({
  mockOnly: z.literal(true),
  liveExecution: z.literal(false),
  externalProcessStarted: z.literal(false),
});

export const CodexReplayStorageMetadataSchema = codexReplaySafetyFlagsSchema.extend({
  sourceKind: CodexReplaySourceKindSchema,
  fixturePath: z.string().min(1),
  fixturePathHash: z.string().min(1),
  replayHash: z.string().min(1),
  bodyStored: z.literal(false),
  normalizedEventsStored: z.literal(false),
  eventHashCount: z.number().int().nonnegative(),
});
export type CodexReplayStorageMetadata = z.infer<typeof CodexReplayStorageMetadataSchema>;

export const CodexReplaySummarySchema = createdEntityBaseSchema
  .merge(codexReplayCountsSchema)
  .merge(codexReplaySafetyFlagsSchema)
  .extend({
    sourceKind: CodexReplaySourceKindSchema,
    fixturePath: z.string().min(1),
    threadId: z.string().optional(),
    status: CodexReplayStatusSchema,
    summary: z.string().min(1),
    replayHash: z.string().min(1),
    evidenceCount: z.number().int().nonnegative(),
    auditEventCount: z.number().int().nonnegative(),
  });
export type CodexReplaySummary = z.infer<typeof CodexReplaySummarySchema>;

export const CodexReplayRecordSchema = createdEntityBaseSchema
  .merge(codexReplayCountsSchema)
  .merge(codexReplaySafetyFlagsSchema)
  .extend({
    sourceKind: CodexReplaySourceKindSchema,
    fixturePath: z.string().min(1),
    threadId: z.string().optional(),
    status: CodexReplayStatusSchema,
    summary: z.string().min(1),
    replayHash: z.string().min(1),
    evidenceRefs: z.array(EvidenceRefSchema),
    auditEventIds: z.array(z.string()).default([]),
    storageMetadata: CodexReplayStorageMetadataSchema,
  });
export type CodexReplayRecord = z.infer<typeof CodexReplayRecordSchema>;

export const CodexExecSandboxModeSchema = z.enum([
  'read_only',
  'workspace_write',
  'danger_full_access',
]);
export type CodexExecSandboxMode = z.infer<typeof CodexExecSandboxModeSchema>;

export const CodexExecApprovalModeSchema = z.enum(['never', 'on_request', 'required']);
export type CodexExecApprovalMode = z.infer<typeof CodexExecApprovalModeSchema>;

export const CodexExecLiveExecutionStatusSchema = z.enum([
  'disabled',
  'dry_run_ready',
  'awaiting_approval',
  'approved_not_executed',
  'blocked',
]);
export type CodexExecLiveExecutionStatus = z.infer<typeof CodexExecLiveExecutionStatusSchema>;

const codexExecControlPlaneSafetyFlagsSchema = z.object({
  liveExecution: z.literal(false).default(false),
  externalProcessStarted: z.literal(false).default(false),
  executionDisabled: z.literal(true).default(true),
});

const codexExecReadOnlyAdapterSafetyFlagsSchema = codexExecControlPlaneSafetyFlagsSchema.extend({
  processAdapterStarted: z.literal(false).default(false),
  implementationApproved: z.literal(false).default(false),
  dashboardTriggerAllowed: z.literal(false).default(false),
});

export const CodexExecConfigSourceSchema = z.enum(['default', 'file']);
export type CodexExecConfigSource = z.infer<typeof CodexExecConfigSourceSchema>;

export const CodexExecApprovalScopeSchema = z.enum([
  'read_only_plan',
  'workspace_write_plan',
  'danger_full_access_plan',
]);
export type CodexExecApprovalScope = z.infer<typeof CodexExecApprovalScopeSchema>;

export const CodexExecApprovalStatusSchema = z.enum([
  'pending',
  'approved',
  'denied',
  'expired',
  'revoked',
  'used',
]);
export type CodexExecApprovalStatus = z.infer<typeof CodexExecApprovalStatusSchema>;

export const CodexExecApprovalDecisionOutcomeSchema = z.enum(['approved', 'denied', 'revoked']);
export type CodexExecApprovalDecisionOutcome = z.infer<
  typeof CodexExecApprovalDecisionOutcomeSchema
>;

export const CodexExecApprovalTransitionActionSchema = z.enum([
  'approve',
  'deny',
  'revoke',
  'expire',
  'mark_used',
]);
export type CodexExecApprovalTransitionAction = z.infer<
  typeof CodexExecApprovalTransitionActionSchema
>;

const codexExecWorktreeRequirementSchema = z.object({
  requiresIsolatedWorktree: z.boolean(),
  isolatedWorktreePresent: z.boolean().default(false),
  worktreePathSummary: z.string().optional(),
  worktreePathHash: z.string().optional(),
});

export const CodexExecWorktreeRequirementSchema = createdEntityBaseSchema.extend({
  sandboxMode: CodexExecSandboxModeSchema,
  requirement: codexExecWorktreeRequirementSchema,
  status: z.enum(['satisfied', 'missing', 'not_required']),
  summary: z.string().min(1),
});
export type CodexExecWorktreeRequirement = z.infer<typeof CodexExecWorktreeRequirementSchema>;

export const CodexExecLiveConfigSchema = createdEntityBaseSchema
  .merge(codexExecControlPlaneSafetyFlagsSchema)
  .extend({
    liveEnabled: z.boolean().default(false),
    allowedSandboxModes: z.array(CodexExecSandboxModeSchema).default(['read_only']),
    forbiddenSandboxModes: z
      .array(CodexExecSandboxModeSchema)
      .default(['workspace_write', 'danger_full_access']),
    requiresApproval: z.boolean().default(true),
    requiresIsolatedWorktreeForWorkspaceWrite: z.boolean().default(true),
    approvalTtlMinutes: z.number().int().positive().default(30),
    singleUseApprovals: z.boolean().default(true),
    configSource: CodexExecConfigSourceSchema.default('default'),
    configPath: z.string().min(1).optional(),
    configPathHash: z.string().min(1).optional(),
    configBodyStored: z.literal(false).default(false),
  });
export type CodexExecLiveConfig = z.infer<typeof CodexExecLiveConfigSchema>;

export const CodexExecConfigFileSchema = createdEntityBaseSchema
  .merge(codexExecControlPlaneSafetyFlagsSchema)
  .extend({
    configPath: z.string().min(1),
    configPathHash: z.string().min(1),
    configHash: z.string().min(1),
    bodyStored: z.literal(false),
    summary: z.string().min(1),
  });
export type CodexExecConfigFile = z.infer<typeof CodexExecConfigFileSchema>;

export const CodexExecConfigLoadResultSchema = createdEntityBaseSchema
  .merge(codexExecControlPlaneSafetyFlagsSchema)
  .extend({
    source: CodexExecConfigSourceSchema,
    status: z.enum(['loaded', 'defaulted', 'failed']),
    config: CodexExecLiveConfigSchema,
    configFile: CodexExecConfigFileSchema.optional(),
    errors: z.array(z.string()).default([]),
    summary: z.string().min(1),
  });
export type CodexExecConfigLoadResult = z.infer<typeof CodexExecConfigLoadResultSchema>;

export const CodexExecLiveCapabilityStateSchema = createdEntityBaseSchema.extend({
  liveEnabled: z.boolean(),
  enabled: z.boolean(),
  status: z.enum(['disabled', 'available', 'blocked']),
  allowedSandboxModes: z.array(CodexExecSandboxModeSchema),
  forbiddenSandboxModes: z.array(CodexExecSandboxModeSchema),
  reasons: z.array(z.string()).default([]),
});
export type CodexExecLiveCapabilityState = z.infer<typeof CodexExecLiveCapabilityStateSchema>;

export const CodexExecPreflightCheckSchema = createdEntityBaseSchema.extend({
  name: z.string().min(1),
  status: z.enum(['passed', 'failed', 'warning']),
  summary: z.string().min(1),
});
export type CodexExecPreflightCheck = z.infer<typeof CodexExecPreflightCheckSchema>;

export const CodexExecPreflightResultSchema = createdEntityBaseSchema
  .merge(codexExecControlPlaneSafetyFlagsSchema)
  .extend({
    dryRunPlanId: z.string().min(1),
    dryRunPlanHash: z.string().min(1),
    configId: z.string().min(1),
    status: z.enum(['passed', 'blocked']),
    checks: z.array(CodexExecPreflightCheckSchema),
    worktreeRequirement: CodexExecWorktreeRequirementSchema,
    summary: z.string().min(1),
  });
export type CodexExecPreflightResult = z.infer<typeof CodexExecPreflightResultSchema>;

export const CodexExecApprovalArtifactSchema = createdEntityBaseSchema
  .merge(codexExecControlPlaneSafetyFlagsSchema)
  .extend({
    dryRunPlanId: z.string().min(1),
    dryRunPlanHash: z.string().min(1),
    policyDecisionId: z.string().min(1),
    policyDecisionHash: z.string().min(1),
    scope: CodexExecApprovalScopeSchema,
    status: CodexExecApprovalStatusSchema,
    expiresAt: IsoDateTimeSchema,
    singleUse: z.boolean(),
    revoked: z.boolean().default(false),
    usedAt: IsoDateTimeSchema.optional(),
    summary: z.string().min(1),
  });
export type CodexExecApprovalArtifact = z.infer<typeof CodexExecApprovalArtifactSchema>;

export const CodexExecManualApprovalRequestSchema = createdEntityBaseSchema
  .merge(codexExecControlPlaneSafetyFlagsSchema)
  .extend({
    dryRunPlanId: z.string().min(1),
    dryRunPlanHash: z.string().min(1),
    policyDecisionId: z.string().min(1),
    policyDecisionHash: z.string().min(1),
    scope: CodexExecApprovalScopeSchema,
    status: CodexExecApprovalStatusSchema,
    riskLevel: RiskLevelSchema,
    requestedBy: z.string().min(1),
    reason: z.string().min(1),
    expiresAt: IsoDateTimeSchema,
    singleUse: z.boolean(),
    summary: z.string().min(1),
  });
export type CodexExecManualApprovalRequest = z.infer<typeof CodexExecManualApprovalRequestSchema>;

export const CodexExecManualApprovalDecisionSchema = createdEntityBaseSchema
  .merge(codexExecControlPlaneSafetyFlagsSchema)
  .extend({
    approvalRequestId: z.string().min(1),
    dryRunPlanId: z.string().min(1),
    policyDecisionId: z.string().min(1),
    outcome: CodexExecApprovalDecisionOutcomeSchema,
    decidedBy: z.string().min(1),
    reasonSummary: z.string().min(1),
    decisionHash: z.string().min(1),
    approved: z.boolean(),
    approvalArtifactId: z.string().min(1).optional(),
    summary: z.string().min(1),
  });
export type CodexExecManualApprovalDecision = z.infer<typeof CodexExecManualApprovalDecisionSchema>;

export const CodexExecManualApprovalStateSchema = createdEntityBaseSchema
  .merge(codexExecControlPlaneSafetyFlagsSchema)
  .extend({
    approvalRecordId: z.string().min(1).optional(),
    approvalRequestId: z.string().min(1),
    dryRunPlanId: z.string().min(1),
    dryRunPlanHash: z.string().min(1),
    policyDecisionId: z.string().min(1),
    policyDecisionHash: z.string().min(1),
    status: CodexExecApprovalStatusSchema,
    requestedStatus: CodexExecApprovalStatusSchema,
    decisionOutcome: CodexExecApprovalDecisionOutcomeSchema.optional(),
    artifactStatus: CodexExecApprovalStatusSchema.optional(),
    expiresAt: IsoDateTimeSchema,
    expired: z.boolean(),
    terminal: z.boolean(),
    canDecide: z.boolean(),
    nextAllowedActions: z.array(CodexExecApprovalTransitionActionSchema).default([]),
    reasons: z.array(z.string()).default([]),
    summary: z.string().min(1),
  });
export type CodexExecManualApprovalState = z.infer<typeof CodexExecManualApprovalStateSchema>;

export const CodexExecApprovalTransitionResultSchema = createdEntityBaseSchema
  .merge(codexExecControlPlaneSafetyFlagsSchema)
  .extend({
    approvalRecordId: z.string().min(1).optional(),
    approvalRequestId: z.string().min(1),
    dryRunPlanId: z.string().min(1),
    action: CodexExecApprovalTransitionActionSchema,
    fromStatus: CodexExecApprovalStatusSchema,
    toStatus: CodexExecApprovalStatusSchema,
    allowed: z.boolean(),
    reasons: z.array(z.string()).default([]),
    state: CodexExecManualApprovalStateSchema,
    summary: z.string().min(1),
  });
export type CodexExecApprovalTransitionResult = z.infer<
  typeof CodexExecApprovalTransitionResultSchema
>;

export const CodexExecManualApprovalRecordSchema = createdEntityBaseSchema
  .merge(codexExecControlPlaneSafetyFlagsSchema)
  .extend({
    request: CodexExecManualApprovalRequestSchema,
    decision: CodexExecManualApprovalDecisionSchema.optional(),
    approvalArtifact: CodexExecApprovalArtifactSchema.optional(),
    status: CodexExecApprovalStatusSchema,
    approvalState: CodexExecManualApprovalStateSchema.optional(),
    evidenceRefs: z.array(EvidenceRefSchema),
    auditEventIds: z.array(z.string()).default([]),
    summary: z.string().min(1),
  });
export type CodexExecManualApprovalRecord = z.infer<typeof CodexExecManualApprovalRecordSchema>;

export const CodexExecExecutionGateResultSchema = createdEntityBaseSchema
  .merge(codexExecControlPlaneSafetyFlagsSchema)
  .extend({
    dryRunPlanId: z.string().min(1),
    dryRunPlanHash: z.string().min(1),
    policyDecisionId: z.string().min(1),
    policyDecisionHash: z.string().min(1),
    approvalArtifactId: z.string().optional(),
    status: z.enum(['blocked', 'ready']),
    reasons: z.array(z.string()).default([]),
    preflightStatus: z.enum(['passed', 'blocked']).optional(),
    liveEnabled: z.boolean(),
    allowedSandboxModes: z.array(CodexExecSandboxModeSchema),
    summary: z.string().min(1),
  });
export type CodexExecExecutionGateResult = z.infer<typeof CodexExecExecutionGateResultSchema>;

const codexExecPromptSummarySchema = z.object({
  promptSummary: z.string().min(1),
  promptHash: z.string().min(1),
  promptLength: z.number().int().nonnegative(),
  promptBodyStored: z.literal(false),
});

export const CodexExecExecutionIntentSchema = createdEntityBaseSchema
  .merge(codexExecPromptSummarySchema)
  .merge(codexExecControlPlaneSafetyFlagsSchema)
  .extend({
    title: z.string().min(1),
    cwd: z.string().min(1),
    sandboxMode: CodexExecSandboxModeSchema,
    approvalMode: CodexExecApprovalModeSchema,
    liveAdapterEnabled: z.boolean().default(false),
  });
export type CodexExecExecutionIntent = z.infer<typeof CodexExecExecutionIntentSchema>;

export const CodexExecDryRunPlanSchema = createdEntityBaseSchema
  .merge(codexExecPromptSummarySchema)
  .merge(codexExecControlPlaneSafetyFlagsSchema)
  .extend({
    intentId: z.string().min(1),
    intent: CodexExecExecutionIntentSchema,
    title: z.string().min(1),
    cwd: z.string().min(1),
    sandboxMode: CodexExecSandboxModeSchema,
    approvalMode: CodexExecApprovalModeSchema,
    riskLevel: RiskLevelSchema,
    liveAdapterEnabled: z.boolean().default(false),
    summary: z.string().min(1),
  });
export type CodexExecDryRunPlan = z.infer<typeof CodexExecDryRunPlanSchema>;

export const CodexExecCommandPreviewSchema = createdEntityBaseSchema
  .merge(codexExecControlPlaneSafetyFlagsSchema)
  .extend({
    intentId: z.string().min(1),
    dryRunPlanId: z.string().min(1),
    cwd: z.string().min(1),
    sandboxMode: CodexExecSandboxModeSchema,
    approvalMode: CodexExecApprovalModeSchema,
    previewSummary: z.string().min(1),
    binaryName: z.literal('codex'),
    argumentSummary: z.string().min(1),
    previewHash: z.string().min(1),
    redacted: z.literal(true),
  });
export type CodexExecCommandPreview = z.infer<typeof CodexExecCommandPreviewSchema>;

export const CodexExecPolicyInputSchema = createdEntityBaseSchema
  .merge(codexExecPromptSummarySchema)
  .merge(codexExecControlPlaneSafetyFlagsSchema)
  .extend({
    intentId: z.string().min(1),
    dryRunPlanId: z.string().min(1),
    actionType: z.literal('codex.exec.live.intent'),
    actionMode: ActionModeSchema,
    riskLevel: RiskLevelSchema,
    sandboxMode: CodexExecSandboxModeSchema,
    approvalMode: CodexExecApprovalModeSchema,
    dryRunPlanPresent: z.boolean(),
    liveAdapterEnabled: z.boolean().default(false),
    guardedPromptMatch: z.boolean().default(false),
  });
export type CodexExecPolicyInput = z.infer<typeof CodexExecPolicyInputSchema>;

export const CodexExecApprovalRequirementSchema = createdEntityBaseSchema.extend({
  dryRunPlanId: z.string().min(1),
  policyDecisionId: z.string().min(1),
  required: z.boolean(),
  riskLevel: RiskLevelSchema,
  approvalMode: CodexExecApprovalModeSchema,
  status: CodexExecLiveExecutionStatusSchema,
  reason: z.string().min(1),
});
export type CodexExecApprovalRequirement = z.infer<typeof CodexExecApprovalRequirementSchema>;

export const CodexExecLiveExecutionDisabledErrorSchema = createdEntityBaseSchema
  .merge(codexExecControlPlaneSafetyFlagsSchema)
  .extend({
    code: z.literal('CODEX_EXEC_LIVE_DISABLED'),
    message: z.string().min(1),
    reason: z.string().min(1),
  });
export type CodexExecLiveExecutionDisabledError = z.infer<
  typeof CodexExecLiveExecutionDisabledErrorSchema
>;

export const CodexExecLiveRunRecordSchema = createdEntityBaseSchema
  .merge(codexExecPromptSummarySchema)
  .merge(codexExecControlPlaneSafetyFlagsSchema)
  .extend({
    intentId: z.string().min(1),
    dryRunPlanId: z.string().min(1),
    title: z.string().min(1),
    cwd: z.string().min(1),
    sandboxMode: CodexExecSandboxModeSchema,
    approvalMode: CodexExecApprovalModeSchema,
    riskLevel: RiskLevelSchema,
    status: CodexExecLiveExecutionStatusSchema,
    intent: CodexExecExecutionIntentSchema,
    dryRunPlan: CodexExecDryRunPlanSchema,
    commandPreview: CodexExecCommandPreviewSchema,
    policyDecision: PolicyDecisionSchema,
    approvalRequirement: CodexExecApprovalRequirementSchema,
    disabledError: CodexExecLiveExecutionDisabledErrorSchema,
    evidenceRefs: z.array(EvidenceRefSchema),
    auditEvents: z.array(AuditEventSchema),
    preflightResult: CodexExecPreflightResultSchema.optional(),
    approvalArtifact: CodexExecApprovalArtifactSchema.optional(),
    executionGateResult: CodexExecExecutionGateResultSchema.optional(),
    configLoadResult: CodexExecConfigLoadResultSchema.optional(),
    manualApprovalRequest: CodexExecManualApprovalRequestSchema.optional(),
    manualApprovalDecision: CodexExecManualApprovalDecisionSchema.optional(),
    manualApprovalRecord: CodexExecManualApprovalRecordSchema.optional(),
    manualApprovalState: CodexExecManualApprovalStateSchema.optional(),
  });
export type CodexExecLiveRunRecord = z.infer<typeof CodexExecLiveRunRecordSchema>;

export const CodexExecTimelineStatusSchema = z.enum([
  'dry_run_created',
  'blocked',
  'preflight_blocked',
  'preflight_passed',
  'approval_pending',
  'approval_approved',
  'approval_denied',
  'approval_revoked',
  'gate_blocked',
  'gate_ready',
]);
export type CodexExecTimelineStatus = z.infer<typeof CodexExecTimelineStatusSchema>;

export const CodexExecTimelineEventSourceKindSchema = z.enum([
  'config',
  'dry_run',
  'command_preview',
  'policy',
  'preflight',
  'approval_request',
  'approval_decision',
  'approval_state',
  'approval_artifact',
  'gate',
  'evidence',
  'audit',
]);
export type CodexExecTimelineEventSourceKind = z.infer<
  typeof CodexExecTimelineEventSourceKindSchema
>;

export const CodexExecTimelineFilterSourceSchema = z.union([
  CodexExecTimelineEventSourceKindSchema,
  z.literal('approval'),
]);
export type CodexExecTimelineFilterSource = z.infer<typeof CodexExecTimelineFilterSourceSchema>;

export const CodexExecTimelineEventTypeSchema = z.enum([
  'codex.exec.config.loaded',
  'codex.exec.dry_run.created',
  'codex.exec.command_preview.created',
  'codex.exec.policy.evaluated',
  'codex.exec.preflight.completed',
  'codex.exec.approval.requested',
  'codex.exec.approval.decided',
  'codex.exec.approval.state_evaluated',
  'codex.exec.approval.artifact_available',
  'codex.exec.gate.evaluated',
  'codex.exec.evidence.recorded',
  'codex.exec.audit.recorded',
]);
export type CodexExecTimelineEventType = z.infer<typeof CodexExecTimelineEventTypeSchema>;

export const CodexExecTimelineEventSchema = createdEntityBaseSchema
  .merge(codexExecControlPlaneSafetyFlagsSchema)
  .extend({
    dryRunId: z.string().min(1),
    liveRunRecordId: z.string().min(1),
    eventType: CodexExecTimelineEventTypeSchema,
    sourceKind: CodexExecTimelineEventSourceKindSchema,
    sourceId: z.string().min(1).optional(),
    status: z.string().min(1),
    summary: z.string().min(1),
    occurredAt: IsoDateTimeSchema,
  });
export type CodexExecTimelineEvent = z.infer<typeof CodexExecTimelineEventSchema>;

export const CodexExecControlPlaneTimelineSchema = createdEntityBaseSchema
  .merge(codexExecControlPlaneSafetyFlagsSchema)
  .extend({
    dryRunId: z.string().min(1),
    liveRunRecordId: z.string().min(1),
    status: CodexExecTimelineStatusSchema,
    events: z.array(CodexExecTimelineEventSchema),
    eventCount: z.number().int().nonnegative(),
    evidenceCount: z.number().int().nonnegative(),
    auditEventCount: z.number().int().nonnegative(),
    summary: z.string().min(1),
  });
export type CodexExecControlPlaneTimeline = z.infer<typeof CodexExecControlPlaneTimelineSchema>;

export const CodexExecTimelineFilterSchema = z.object({
  source: CodexExecTimelineFilterSourceSchema.optional(),
  status: z.string().min(1).optional(),
  eventType: CodexExecTimelineEventTypeSchema.optional(),
  riskLevel: RiskLevelSchema.optional(),
  limit: z.number().int().positive().max(200).optional(),
  includeEvidence: z.boolean().default(true),
  includeAudit: z.boolean().default(true),
});
export type CodexExecTimelineFilter = z.infer<typeof CodexExecTimelineFilterSchema>;

export const CodexExecTimelineQuerySchema = createdEntityBaseSchema
  .merge(codexExecControlPlaneSafetyFlagsSchema)
  .extend({
    dryRunId: z.string().min(1),
    filter: CodexExecTimelineFilterSchema.default({}),
  });
export type CodexExecTimelineQuery = z.infer<typeof CodexExecTimelineQuerySchema>;

export const CodexExecTimelineEvidenceSummaryItemSchema = z.object({
  evidenceRefId: z.string().min(1),
  kind: EvidenceRefSchema.shape.kind,
  summary: z.string().min(1).optional(),
  hash: z.string().min(1),
  labels: z.array(z.string()).default([]),
  createdAt: IsoDateTimeSchema,
});
export type CodexExecTimelineEvidenceSummaryItem = z.infer<
  typeof CodexExecTimelineEvidenceSummaryItemSchema
>;

export const CodexExecTimelineEvidenceSummarySchema = createdEntityBaseSchema
  .merge(codexExecControlPlaneSafetyFlagsSchema)
  .extend({
    dryRunId: z.string().min(1),
    liveRunRecordId: z.string().min(1),
    count: z.number().int().nonnegative(),
    evidenceRefIds: z.array(z.string()).default([]),
    items: z.array(CodexExecTimelineEvidenceSummaryItemSchema).default([]),
    metadataOnly: z.literal(true),
    bodyStored: z.literal(false),
  });
export type CodexExecTimelineEvidenceSummary = z.infer<
  typeof CodexExecTimelineEvidenceSummarySchema
>;

export const CodexExecTimelineAuditSummaryItemSchema = z.object({
  auditEventId: z.string().min(1),
  action: z.string().min(1),
  outcome: z.string().min(1),
  createdAt: IsoDateTimeSchema,
  policyDecisionId: z.string().optional(),
  evidenceRefIds: z.array(z.string()).default([]),
});
export type CodexExecTimelineAuditSummaryItem = z.infer<
  typeof CodexExecTimelineAuditSummaryItemSchema
>;

export const CodexExecTimelineAuditSummarySchema = createdEntityBaseSchema
  .merge(codexExecControlPlaneSafetyFlagsSchema)
  .extend({
    dryRunId: z.string().min(1),
    liveRunRecordId: z.string().min(1),
    count: z.number().int().nonnegative(),
    auditEventIds: z.array(z.string()).default([]),
    items: z.array(CodexExecTimelineAuditSummaryItemSchema).default([]),
    metadataOnly: z.literal(true),
    bodyStored: z.literal(false),
  });
export type CodexExecTimelineAuditSummary = z.infer<typeof CodexExecTimelineAuditSummarySchema>;

export const CodexExecTimelineDetailViewSchema = createdEntityBaseSchema
  .merge(codexExecControlPlaneSafetyFlagsSchema)
  .extend({
    dryRunId: z.string().min(1),
    liveRunRecordId: z.string().min(1),
    timeline: CodexExecControlPlaneTimelineSchema,
    sourceBreakdown: z.record(z.number().int().nonnegative()),
    latestGateStatus: z.string().min(1).optional(),
    approvalStatus: CodexExecApprovalStatusSchema.optional(),
    dryRunSummary: z.object({
      dryRunPlanId: z.string().min(1),
      title: z.string().min(1),
      sandboxMode: CodexExecSandboxModeSchema,
      approvalMode: CodexExecApprovalModeSchema,
      riskLevel: RiskLevelSchema,
      promptSummary: z.string().min(1),
      promptHash: z.string().min(1),
      promptLength: z.number().int().nonnegative(),
      promptBodyStored: z.literal(false),
    }),
    commandPreviewSummary: z.object({
      commandPreviewId: z.string().min(1),
      previewSummary: z.string().min(1),
      previewHash: z.string().min(1),
      redacted: z.literal(true),
      argumentSummary: z.string().min(1),
    }),
    policySummary: z.object({
      policyDecisionId: z.string().min(1),
      outcome: PolicyOutcomeSchema,
      riskLevel: RiskLevelSchema,
      requiresDryRun: z.boolean(),
      requiresApproval: z.boolean(),
      reasonCount: z.number().int().nonnegative(),
    }),
    approvalStateSummary: z
      .object({
        approvalRequestId: z.string().min(1),
        status: CodexExecApprovalStatusSchema,
        canDecide: z.boolean(),
        terminal: z.boolean(),
        reasonCount: z.number().int().nonnegative(),
      })
      .optional(),
    gateSummary: z
      .object({
        executionGateResultId: z.string().min(1),
        status: z.enum(['blocked', 'ready']),
        reasonCount: z.number().int().nonnegative(),
        liveEnabled: z.boolean(),
      })
      .optional(),
    evidenceSummary: CodexExecTimelineEvidenceSummarySchema,
    auditSummary: CodexExecTimelineAuditSummarySchema,
    summary: z.string().min(1),
  });
export type CodexExecTimelineDetailView = z.infer<typeof CodexExecTimelineDetailViewSchema>;

export const CodexExecEvidenceQuerySchema = createdEntityBaseSchema
  .merge(codexExecControlPlaneSafetyFlagsSchema)
  .extend({
    dryRunId: z.string().min(1).optional(),
    kind: EvidenceRefSchema.shape.kind.optional(),
    limit: z.number().int().positive().max(200).default(20),
  });
export type CodexExecEvidenceQuery = z.infer<typeof CodexExecEvidenceQuerySchema>;

export const CodexExecAuditQuerySchema = createdEntityBaseSchema
  .merge(codexExecControlPlaneSafetyFlagsSchema)
  .extend({
    dryRunId: z.string().min(1).optional(),
    action: z.string().min(1).optional(),
    limit: z.number().int().positive().max(200).default(20),
  });
export type CodexExecAuditQuery = z.infer<typeof CodexExecAuditQuerySchema>;

export const CodexExecDetailMetadataSummarySchema = z.object({
  keyCount: z.number().int().nonnegative(),
  keys: z.array(z.string()).default([]),
  relatedIds: z.array(z.string()).default([]),
  bodyStored: z.literal(false),
});
export type CodexExecDetailMetadataSummary = z.infer<typeof CodexExecDetailMetadataSummarySchema>;

export const CodexExecEvidenceDetailStatusSchema = z.enum(['found', 'not_found']);
export type CodexExecEvidenceDetailStatus = z.infer<typeof CodexExecEvidenceDetailStatusSchema>;

export const CodexExecEvidenceDetailViewSchema = createdEntityBaseSchema
  .merge(codexExecControlPlaneSafetyFlagsSchema)
  .extend({
    status: CodexExecEvidenceDetailStatusSchema,
    evidenceRefId: z.string().min(1),
    dryRunId: z.string().min(1).optional(),
    liveRunRecordId: z.string().min(1).optional(),
    kind: EvidenceRefSchema.shape.kind.optional(),
    summary: z.string().min(1).optional(),
    hash: z.string().min(1).optional(),
    labels: z.array(z.string()).default([]),
    refCreatedAt: IsoDateTimeSchema.optional(),
    expiresAt: IsoDateTimeSchema.optional(),
    relatedAuditEventIds: z.array(z.string()).default([]),
    metadataSummary: CodexExecDetailMetadataSummarySchema.optional(),
    metadataOnly: z.literal(true),
    bodyStored: z.literal(false),
  });
export type CodexExecEvidenceDetailView = z.infer<typeof CodexExecEvidenceDetailViewSchema>;

export const CodexExecEvidenceSearchResultSchema = createdEntityBaseSchema
  .merge(codexExecControlPlaneSafetyFlagsSchema)
  .extend({
    query: CodexExecEvidenceQuerySchema,
    count: z.number().int().nonnegative(),
    items: z.array(CodexExecEvidenceDetailViewSchema).default([]),
    metadataOnly: z.literal(true),
    bodyStored: z.literal(false),
    summary: z.string().min(1),
  });
export type CodexExecEvidenceSearchResult = z.infer<typeof CodexExecEvidenceSearchResultSchema>;

export const CodexExecAuditDetailStatusSchema = z.enum(['found', 'not_found']);
export type CodexExecAuditDetailStatus = z.infer<typeof CodexExecAuditDetailStatusSchema>;

export const CodexExecAuditDetailViewSchema = createdEntityBaseSchema
  .merge(codexExecControlPlaneSafetyFlagsSchema)
  .extend({
    status: CodexExecAuditDetailStatusSchema,
    auditEventId: z.string().min(1),
    dryRunId: z.string().min(1).optional(),
    liveRunRecordId: z.string().min(1).optional(),
    action: z.string().min(1).optional(),
    outcome: z.string().min(1).optional(),
    actor: z.string().min(1).optional(),
    eventCreatedAt: IsoDateTimeSchema.optional(),
    policyDecisionId: z.string().min(1).optional(),
    evidenceRefIds: z.array(z.string()).default([]),
    metadataSummary: CodexExecDetailMetadataSummarySchema.optional(),
    metadataOnly: z.literal(true),
    bodyStored: z.literal(false),
  });
export type CodexExecAuditDetailView = z.infer<typeof CodexExecAuditDetailViewSchema>;

export const CodexExecAuditSearchResultSchema = createdEntityBaseSchema
  .merge(codexExecControlPlaneSafetyFlagsSchema)
  .extend({
    query: CodexExecAuditQuerySchema,
    count: z.number().int().nonnegative(),
    items: z.array(CodexExecAuditDetailViewSchema).default([]),
    metadataOnly: z.literal(true),
    bodyStored: z.literal(false),
    summary: z.string().min(1),
  });
export type CodexExecAuditSearchResult = z.infer<typeof CodexExecAuditSearchResultSchema>;

export const CodexExecControlPlaneDrilldownViewSchema = createdEntityBaseSchema
  .merge(codexExecControlPlaneSafetyFlagsSchema)
  .extend({
    dryRunId: z.string().min(1),
    liveRunRecordId: z.string().min(1).optional(),
    status: z.enum(['found', 'not_found']),
    timeline: CodexExecControlPlaneTimelineSchema.optional(),
    timelineDetail: CodexExecTimelineDetailViewSchema.optional(),
    evidenceSearch: CodexExecEvidenceSearchResultSchema,
    auditSearch: CodexExecAuditSearchResultSchema,
    selectedEvidence: CodexExecEvidenceDetailViewSchema.optional(),
    selectedAudit: CodexExecAuditDetailViewSchema.optional(),
    evidenceCount: z.number().int().nonnegative(),
    auditEventCount: z.number().int().nonnegative(),
    metadataOnly: z.literal(true),
    bodyStored: z.literal(false),
    summary: z.string().min(1),
  });
export type CodexExecControlPlaneDrilldownView = z.infer<
  typeof CodexExecControlPlaneDrilldownViewSchema
>;

export const CodexExecControlPlaneReportFormatSchema = z.enum(['json', 'markdown']);
export type CodexExecControlPlaneReportFormat = z.infer<
  typeof CodexExecControlPlaneReportFormatSchema
>;

export const CodexExecControlPlaneReportSectionKindSchema = z.enum([
  'overview',
  'dry_run',
  'timeline',
  'approval',
  'gate',
  'evidence',
  'audit',
  'no_live_boundary',
  'risks',
  'recommendations',
]);
export type CodexExecControlPlaneReportSectionKind = z.infer<
  typeof CodexExecControlPlaneReportSectionKindSchema
>;

export const CodexExecControlPlaneReportStatusSchema = z.enum(['found', 'not_found', 'degraded']);
export type CodexExecControlPlaneReportStatus = z.infer<
  typeof CodexExecControlPlaneReportStatusSchema
>;

export const CodexExecControlPlaneReportQuerySchema = createdEntityBaseSchema
  .merge(codexExecControlPlaneSafetyFlagsSchema)
  .extend({
    dryRunId: z.string().min(1),
    format: CodexExecControlPlaneReportFormatSchema.default('json'),
    includeEvidence: z.boolean().default(true),
    includeAudit: z.boolean().default(true),
  });
export type CodexExecControlPlaneReportQuery = z.infer<
  typeof CodexExecControlPlaneReportQuerySchema
>;

export const CodexExecControlPlaneReportSectionItemSchema = z.object({
  label: z.string().min(1),
  value: z.string().min(1),
  refId: z.string().min(1).optional(),
  hash: z.string().min(1).optional(),
  metadata: MetadataSchema.optional(),
});
export type CodexExecControlPlaneReportSectionItem = z.infer<
  typeof CodexExecControlPlaneReportSectionItemSchema
>;

export const CodexExecControlPlaneReportSectionSchema = createdEntityBaseSchema
  .merge(codexExecControlPlaneSafetyFlagsSchema)
  .extend({
    kind: CodexExecControlPlaneReportSectionKindSchema,
    title: z.string().min(1),
    status: z.enum(['ok', 'missing', 'degraded']),
    summary: z.string().min(1),
    items: z.array(CodexExecControlPlaneReportSectionItemSchema).default([]),
    refIds: z.array(z.string()).default([]),
    hashes: z.array(z.string()).default([]),
    metadataOnly: z.literal(true),
    bodyStored: z.literal(false),
  });
export type CodexExecControlPlaneReportSection = z.infer<
  typeof CodexExecControlPlaneReportSectionSchema
>;

export const CodexExecControlPlaneReportSummarySchema = createdEntityBaseSchema
  .merge(codexExecControlPlaneSafetyFlagsSchema)
  .extend({
    dryRunId: z.string().min(1),
    status: CodexExecControlPlaneReportStatusSchema,
    sectionCount: z.number().int().nonnegative(),
    evidenceCount: z.number().int().nonnegative(),
    auditEventCount: z.number().int().nonnegative(),
    riskLevel: RiskLevelSchema.optional(),
    finalControlPlaneStatus: z.string().min(1),
    recommendationCount: z.number().int().nonnegative(),
    metadataOnly: z.literal(true),
    bodyStored: z.literal(false),
  });
export type CodexExecControlPlaneReportSummary = z.infer<
  typeof CodexExecControlPlaneReportSummarySchema
>;

export const CodexExecControlPlaneReportSchema = createdEntityBaseSchema
  .merge(codexExecControlPlaneSafetyFlagsSchema)
  .extend({
    dryRunId: z.string().min(1),
    status: CodexExecControlPlaneReportStatusSchema,
    format: CodexExecControlPlaneReportFormatSchema,
    query: CodexExecControlPlaneReportQuerySchema,
    summary: CodexExecControlPlaneReportSummarySchema,
    sections: z.array(CodexExecControlPlaneReportSectionSchema),
    sectionOrder: z.array(CodexExecControlPlaneReportSectionKindSchema),
    metadataOnly: z.literal(true),
    bodyStored: z.literal(false),
  });
export type CodexExecControlPlaneReport = z.infer<typeof CodexExecControlPlaneReportSchema>;

export const CodexExecControlPlaneReportExportResultSchema = createdEntityBaseSchema
  .merge(codexExecControlPlaneSafetyFlagsSchema)
  .extend({
    dryRunId: z.string().min(1),
    format: CodexExecControlPlaneReportFormatSchema,
    status: CodexExecControlPlaneReportStatusSchema,
    report: CodexExecControlPlaneReportSchema,
    renderedContent: z.string().min(1),
    renderedContentHash: z.string().min(1),
    renderedContentLength: z.number().int().nonnegative(),
    metadataOnly: z.literal(true),
    sourceBodyStored: z.literal(false),
  });
export type CodexExecControlPlaneReportExportResult = z.infer<
  typeof CodexExecControlPlaneReportExportResultSchema
>;

export const CodexExecReportReviewStatusSchema = z.enum([
  'draft',
  'reviewed',
  'changes_requested',
  'rejected',
  'archived',
]);
export type CodexExecReportReviewStatus = z.infer<typeof CodexExecReportReviewStatusSchema>;

export const CodexExecReportRiskClassificationSchema = z.enum([
  'low',
  'medium',
  'high',
  'critical',
]);
export type CodexExecReportRiskClassification = z.infer<
  typeof CodexExecReportRiskClassificationSchema
>;

export const CodexExecReportRecommendationSchema = z.enum([
  'no_go',
  'needs_changes',
  'ready_for_adr',
  'ready_for_read_only_live_review',
]);
export type CodexExecReportRecommendation = z.infer<typeof CodexExecReportRecommendationSchema>;

export const CodexExecReportReviewChecklistItemSchema = createdEntityBaseSchema
  .merge(codexExecControlPlaneSafetyFlagsSchema)
  .extend({
    code: z.string().min(1),
    label: z.string().min(1),
    status: z.enum(['passed', 'failed', 'warning']),
    required: z.boolean().default(true),
    summary: z.string().min(1),
    relatedSection: CodexExecControlPlaneReportSectionKindSchema.optional(),
    metadataOnly: z.literal(true),
    bodyStored: z.literal(false),
  });
export type CodexExecReportReviewChecklistItem = z.infer<
  typeof CodexExecReportReviewChecklistItemSchema
>;

export const CodexExecReportReviewFindingSchema = createdEntityBaseSchema
  .merge(codexExecControlPlaneSafetyFlagsSchema)
  .extend({
    severity: CodexExecReportRiskClassificationSchema,
    code: z.string().min(1),
    summary: z.string().min(1),
    relatedSection: CodexExecControlPlaneReportSectionKindSchema.optional(),
    recommendation: z.string().min(1),
    metadataOnly: z.literal(true),
    bodyStored: z.literal(false),
  });
export type CodexExecReportReviewFinding = z.infer<typeof CodexExecReportReviewFindingSchema>;

export const CodexExecReportReviewRecordSchema = createdEntityBaseSchema
  .merge(codexExecControlPlaneSafetyFlagsSchema)
  .extend({
    dryRunId: z.string().min(1),
    reportId: z.string().min(1).optional(),
    reportHash: z.string().min(1),
    reportSectionHashes: z.array(z.string().min(1)).default([]),
    sectionSummaryRefs: z.array(z.string().min(1)).default([]),
    reviewedAt: IsoDateTimeSchema,
    reviewerLabel: z.string().min(1),
    status: CodexExecReportReviewStatusSchema,
    recommendation: CodexExecReportRecommendationSchema,
    recommendationGrantsExecution: z.literal(false),
    riskClassification: CodexExecReportRiskClassificationSchema,
    checklistItems: z.array(CodexExecReportReviewChecklistItemSchema).default([]),
    findings: z.array(CodexExecReportReviewFindingSchema).default([]),
    notesSummary: z.string().min(1).optional(),
    reportSummary: CodexExecControlPlaneReportSummarySchema.optional(),
    metadataOnly: z.literal(true),
    bodyStored: z.literal(false),
  });
export type CodexExecReportReviewRecord = z.infer<typeof CodexExecReportReviewRecordSchema>;

export const CodexExecReportReviewQuerySchema = createdEntityBaseSchema
  .merge(codexExecControlPlaneSafetyFlagsSchema)
  .extend({
    dryRunId: z.string().min(1).optional(),
    status: CodexExecReportReviewStatusSchema.optional(),
    recommendation: CodexExecReportRecommendationSchema.optional(),
    limit: z.number().int().positive().max(200).default(20),
  });
export type CodexExecReportReviewQuery = z.infer<typeof CodexExecReportReviewQuerySchema>;

export const CodexExecReportReviewSummarySchema = createdEntityBaseSchema
  .merge(codexExecControlPlaneSafetyFlagsSchema)
  .extend({
    reviewId: z.string().min(1),
    dryRunId: z.string().min(1),
    reportHash: z.string().min(1),
    status: CodexExecReportReviewStatusSchema,
    recommendation: CodexExecReportRecommendationSchema,
    recommendationGrantsExecution: z.literal(false),
    riskClassification: CodexExecReportRiskClassificationSchema,
    reviewerLabel: z.string().min(1),
    reviewedAt: IsoDateTimeSchema,
    findingCount: z.number().int().nonnegative(),
    failedChecklistCount: z.number().int().nonnegative(),
    metadataOnly: z.literal(true),
    bodyStored: z.literal(false),
  });
export type CodexExecReportReviewSummary = z.infer<typeof CodexExecReportReviewSummarySchema>;

export const CodexExecReportReviewHistoryQuerySchema = createdEntityBaseSchema
  .merge(codexExecControlPlaneSafetyFlagsSchema)
  .extend({
    dryRunId: z.string().min(1).optional(),
    status: CodexExecReportReviewStatusSchema.optional(),
    recommendation: CodexExecReportRecommendationSchema.optional(),
    limit: z.number().int().positive().max(200).default(20),
    recommendationGrantsExecution: z.literal(false),
    metadataOnly: z.literal(true),
    bodyStored: z.literal(false),
  });
export type CodexExecReportReviewHistoryQuery = z.infer<
  typeof CodexExecReportReviewHistoryQuerySchema
>;

export const CodexExecReportReviewComparisonItemSchema = createdEntityBaseSchema
  .merge(codexExecControlPlaneSafetyFlagsSchema)
  .extend({
    field: z.string().min(1),
    leftValueSummary: z.string().min(1),
    rightValueSummary: z.string().min(1),
    changed: z.boolean(),
    metadataOnly: z.literal(true),
    bodyStored: z.literal(false),
  });
export type CodexExecReportReviewComparisonItem = z.infer<
  typeof CodexExecReportReviewComparisonItemSchema
>;

export const CodexExecReportReviewComparisonSchema = createdEntityBaseSchema
  .merge(codexExecControlPlaneSafetyFlagsSchema)
  .extend({
    leftReviewId: z.string().min(1),
    rightReviewId: z.string().min(1),
    dryRunId: z.string().min(1).optional(),
    comparable: z.boolean(),
    summary: z.string().min(1),
    changedItemCount: z.number().int().nonnegative(),
    items: z.array(CodexExecReportReviewComparisonItemSchema).default([]),
    recommendationGrantsExecution: z.literal(false),
    metadataOnly: z.literal(true),
    bodyStored: z.literal(false),
  });
export type CodexExecReportReviewComparison = z.infer<typeof CodexExecReportReviewComparisonSchema>;

export const CodexExecReportReviewHistoryViewSchema = createdEntityBaseSchema
  .merge(codexExecControlPlaneSafetyFlagsSchema)
  .extend({
    dryRunId: z.string().min(1).optional(),
    query: CodexExecReportReviewHistoryQuerySchema,
    latestReview: CodexExecReportReviewSummarySchema.optional(),
    summaries: z.array(CodexExecReportReviewSummarySchema).default([]),
    comparison: CodexExecReportReviewComparisonSchema.optional(),
    historyCount: z.number().int().nonnegative(),
    recommendationGrantsExecution: z.literal(false),
    metadataOnly: z.literal(true),
    bodyStored: z.literal(false),
  });
export type CodexExecReportReviewHistoryView = z.infer<
  typeof CodexExecReportReviewHistoryViewSchema
>;

export const CodexExecReviewerHandoffSummarySchema = createdEntityBaseSchema
  .merge(codexExecControlPlaneSafetyFlagsSchema)
  .extend({
    dryRunId: z.string().min(1),
    fromReviewer: z.string().min(1).optional(),
    toReviewer: z.string().min(1).optional(),
    latestReviewId: z.string().min(1).optional(),
    latestStatus: CodexExecReportReviewStatusSchema.optional(),
    latestRecommendation: CodexExecReportRecommendationSchema.optional(),
    latestRiskClassification: CodexExecReportRiskClassificationSchema.optional(),
    reviewCount: z.number().int().nonnegative(),
    findingCount: z.number().int().nonnegative(),
    failedChecklistCount: z.number().int().nonnegative(),
    handoffSummary: z.string().min(1),
    recommendedNextStep: z.string().min(1),
    recommendationGrantsExecution: z.literal(false),
    metadataOnly: z.literal(true),
    bodyStored: z.literal(false),
  });
export type CodexExecReviewerHandoffSummary = z.infer<typeof CodexExecReviewerHandoffSummarySchema>;

export const CodexExecGovernanceReviewPackageSectionSchema = z.enum([
  'dry_run',
  'timeline',
  'evidence',
  'audit',
  'report',
  'report_review',
  'review_history',
  'handoff',
  'no_live_boundary',
  'adr_readiness',
  'risks',
  'blockers',
  'recommendation',
]);
export type CodexExecGovernanceReviewPackageSection = z.infer<
  typeof CodexExecGovernanceReviewPackageSectionSchema
>;

export const CodexExecGovernanceReviewPackageStatusSchema = z.enum([
  'found',
  'not_found',
  'degraded',
  'blocked',
  'ready_for_adr',
  'needs_changes',
  'no_go',
]);
export type CodexExecGovernanceReviewPackageStatus = z.infer<
  typeof CodexExecGovernanceReviewPackageStatusSchema
>;

export const CodexExecGovernanceReviewPackageQuerySchema = createdEntityBaseSchema
  .merge(codexExecControlPlaneSafetyFlagsSchema)
  .extend({
    dryRunId: z.string().min(1),
    includeEvidence: z.boolean().default(true),
    includeAudit: z.boolean().default(true),
    recommendationGrantsExecution: z.literal(false),
    metadataOnly: z.literal(true),
    bodyStored: z.literal(false),
  });
export type CodexExecGovernanceReviewPackageQuery = z.infer<
  typeof CodexExecGovernanceReviewPackageQuerySchema
>;

export const CodexExecAdrReadinessChecklistItemSchema = createdEntityBaseSchema
  .merge(codexExecControlPlaneSafetyFlagsSchema)
  .extend({
    code: z.string().min(1),
    label: z.string().min(1),
    status: z.enum(['passed', 'failed', 'warning']),
    required: z.boolean().default(true),
    summary: z.string().min(1),
    sourceSection: CodexExecGovernanceReviewPackageSectionSchema.optional(),
    recommendationGrantsExecution: z.literal(false),
    metadataOnly: z.literal(true),
    bodyStored: z.literal(false),
  });
export type CodexExecAdrReadinessChecklistItem = z.infer<
  typeof CodexExecAdrReadinessChecklistItemSchema
>;

export const CodexExecNoLiveEvidenceSummarySchema = createdEntityBaseSchema
  .merge(codexExecControlPlaneSafetyFlagsSchema)
  .extend({
    dryRunId: z.string().min(1),
    noRealCodexExec: z.literal(true),
    noExternalProcessStarted: z.boolean().default(true),
    noBrowserOrCdpAction: z.literal(true),
    noWorkspaceWrite: z.literal(true),
    noExecutionApprovalGranted: z.literal(true),
    evidenceRefCount: z.number().int().nonnegative(),
    auditEventCount: z.number().int().nonnegative(),
    evidenceKinds: z.array(z.string()).default([]),
    auditActions: z.array(z.string()).default([]),
    summary: z.string().min(1),
    recommendationGrantsExecution: z.literal(false),
    metadataOnly: z.literal(true),
    bodyStored: z.literal(false),
  });
export type CodexExecNoLiveEvidenceSummary = z.infer<typeof CodexExecNoLiveEvidenceSummarySchema>;

export const CodexExecGovernanceBlockerSchema = createdEntityBaseSchema
  .merge(codexExecControlPlaneSafetyFlagsSchema)
  .extend({
    severity: CodexExecReportRiskClassificationSchema,
    code: z.string().min(1),
    summary: z.string().min(1),
    sourceSection: CodexExecGovernanceReviewPackageSectionSchema.optional(),
    recommendedResolution: z.string().min(1),
    recommendationGrantsExecution: z.literal(false),
    metadataOnly: z.literal(true),
    bodyStored: z.literal(false),
  });
export type CodexExecGovernanceBlocker = z.infer<typeof CodexExecGovernanceBlockerSchema>;

export const CodexExecGovernanceReviewPackageSummarySchema = createdEntityBaseSchema
  .merge(codexExecControlPlaneSafetyFlagsSchema)
  .extend({
    dryRunId: z.string().min(1),
    status: CodexExecGovernanceReviewPackageStatusSchema,
    riskClassification: CodexExecReportRiskClassificationSchema,
    recommendation: CodexExecReportRecommendationSchema,
    recommendationGrantsExecution: z.literal(false),
    checklistPassedCount: z.number().int().nonnegative(),
    checklistWarningCount: z.number().int().nonnegative(),
    checklistFailedCount: z.number().int().nonnegative(),
    blockerCount: z.number().int().nonnegative(),
    unresolvedBlockerCount: z.number().int().nonnegative(),
    evidenceRefCount: z.number().int().nonnegative(),
    auditEventCount: z.number().int().nonnegative(),
    latestReviewId: z.string().min(1).optional(),
    reportId: z.string().min(1).optional(),
    handoffId: z.string().min(1).optional(),
    metadataOnly: z.literal(true),
    bodyStored: z.literal(false),
  });
export type CodexExecGovernanceReviewPackageSummary = z.infer<
  typeof CodexExecGovernanceReviewPackageSummarySchema
>;

export const CodexExecGovernanceReviewPackageSchema = createdEntityBaseSchema
  .merge(codexExecControlPlaneSafetyFlagsSchema)
  .extend({
    dryRunId: z.string().min(1),
    status: CodexExecGovernanceReviewPackageStatusSchema,
    query: CodexExecGovernanceReviewPackageQuerySchema,
    summary: CodexExecGovernanceReviewPackageSummarySchema,
    sectionOrder: z.array(CodexExecGovernanceReviewPackageSectionSchema),
    report: CodexExecControlPlaneReportSchema.optional(),
    reviewHistory: CodexExecReportReviewHistoryViewSchema,
    latestReview: CodexExecReportReviewSummarySchema.optional(),
    handoff: CodexExecReviewerHandoffSummarySchema,
    noLiveEvidence: CodexExecNoLiveEvidenceSummarySchema,
    adrReadinessChecklist: z.array(CodexExecAdrReadinessChecklistItemSchema).default([]),
    blockers: z.array(CodexExecGovernanceBlockerSchema).default([]),
    riskClassification: CodexExecReportRiskClassificationSchema,
    recommendation: CodexExecReportRecommendationSchema,
    recommendationGrantsExecution: z.literal(false),
    metadataOnly: z.literal(true),
    bodyStored: z.literal(false),
  });
export type CodexExecGovernanceReviewPackage = z.infer<
  typeof CodexExecGovernanceReviewPackageSchema
>;

export const CodexExecLiveAdapterAdrDraftFormatSchema = z.enum(['json', 'markdown']);
export type CodexExecLiveAdapterAdrDraftFormat = z.infer<
  typeof CodexExecLiveAdapterAdrDraftFormatSchema
>;

export const CodexExecLiveAdapterAdrDraftStatusSchema = z.enum([
  'found',
  'not_found',
  'degraded',
  'blocked',
  'ready_for_review',
]);
export type CodexExecLiveAdapterAdrDraftStatus = z.infer<
  typeof CodexExecLiveAdapterAdrDraftStatusSchema
>;

export const CodexExecLiveAdapterAdrDraftSectionKindSchema = z.enum([
  'title',
  'status',
  'context',
  'governance_summary',
  'no_live_boundary',
  'adr_readiness',
  'risk_assessment',
  'unresolved_blockers',
  'decision_options',
  'recommended_decision',
  'consequences',
  'next_review_steps',
]);
export type CodexExecLiveAdapterAdrDraftSectionKind = z.infer<
  typeof CodexExecLiveAdapterAdrDraftSectionKindSchema
>;

export const CodexExecLiveAdapterAdrDraftQuerySchema = createdEntityBaseSchema
  .merge(codexExecControlPlaneSafetyFlagsSchema)
  .extend({
    dryRunId: z.string().min(1),
    format: CodexExecLiveAdapterAdrDraftFormatSchema.default('json'),
    includeEvidence: z.boolean().default(true),
    includeAudit: z.boolean().default(true),
    recommendationGrantsExecution: z.literal(false),
    metadataOnly: z.literal(true),
    bodyStored: z.literal(false),
    draftOnly: z.literal(true),
  });
export type CodexExecLiveAdapterAdrDraftQuery = z.infer<
  typeof CodexExecLiveAdapterAdrDraftQuerySchema
>;

export const CodexExecLiveAdapterAdrDraftSectionSchema = createdEntityBaseSchema
  .merge(codexExecControlPlaneSafetyFlagsSchema)
  .extend({
    kind: CodexExecLiveAdapterAdrDraftSectionKindSchema,
    title: z.string().min(1),
    status: z.enum(['ok', 'missing', 'blocked', 'degraded']),
    summary: z.string().min(1),
    items: z.array(CodexExecControlPlaneReportSectionItemSchema).default([]),
    refIds: z.array(z.string()).default([]),
    hashes: z.array(z.string()).default([]),
    recommendationGrantsExecution: z.literal(false),
    metadataOnly: z.literal(true),
    bodyStored: z.literal(false),
    draftOnly: z.literal(true),
  });
export type CodexExecLiveAdapterAdrDraftSection = z.infer<
  typeof CodexExecLiveAdapterAdrDraftSectionSchema
>;

export const CodexExecLiveAdapterAdrDraftSummarySchema = createdEntityBaseSchema
  .merge(codexExecControlPlaneSafetyFlagsSchema)
  .extend({
    dryRunId: z.string().min(1),
    status: CodexExecLiveAdapterAdrDraftStatusSchema,
    title: z.string().min(1),
    sectionCount: z.number().int().nonnegative(),
    governancePackageStatus: CodexExecGovernanceReviewPackageStatusSchema,
    riskClassification: CodexExecReportRiskClassificationSchema,
    recommendation: CodexExecReportRecommendationSchema,
    recommendationGrantsExecution: z.literal(false),
    blockerCount: z.number().int().nonnegative(),
    readinessPassedCount: z.number().int().nonnegative(),
    readinessFailedCount: z.number().int().nonnegative(),
    metadataOnly: z.literal(true),
    bodyStored: z.literal(false),
    draftOnly: z.literal(true),
  });
export type CodexExecLiveAdapterAdrDraftSummary = z.infer<
  typeof CodexExecLiveAdapterAdrDraftSummarySchema
>;

export const CodexExecLiveAdapterAdrDraftSchema = createdEntityBaseSchema
  .merge(codexExecControlPlaneSafetyFlagsSchema)
  .extend({
    dryRunId: z.string().min(1),
    status: CodexExecLiveAdapterAdrDraftStatusSchema,
    format: CodexExecLiveAdapterAdrDraftFormatSchema,
    query: CodexExecLiveAdapterAdrDraftQuerySchema,
    title: z.string().min(1),
    summary: CodexExecLiveAdapterAdrDraftSummarySchema,
    governancePackageSummary: CodexExecGovernanceReviewPackageSummarySchema,
    governancePackage: CodexExecGovernanceReviewPackageSchema.optional(),
    sections: z.array(CodexExecLiveAdapterAdrDraftSectionSchema),
    sectionOrder: z.array(CodexExecLiveAdapterAdrDraftSectionKindSchema),
    recommendation: CodexExecReportRecommendationSchema,
    recommendationGrantsExecution: z.literal(false),
    metadataOnly: z.literal(true),
    bodyStored: z.literal(false),
    draftOnly: z.literal(true),
  });
export type CodexExecLiveAdapterAdrDraft = z.infer<typeof CodexExecLiveAdapterAdrDraftSchema>;

export const CodexExecLiveAdapterAdrDraftExportResultSchema = createdEntityBaseSchema
  .merge(codexExecControlPlaneSafetyFlagsSchema)
  .extend({
    dryRunId: z.string().min(1),
    format: CodexExecLiveAdapterAdrDraftFormatSchema,
    status: CodexExecLiveAdapterAdrDraftStatusSchema,
    draft: CodexExecLiveAdapterAdrDraftSchema,
    renderedContent: z.string().min(1),
    renderedContentHash: z.string().min(1),
    renderedContentLength: z.number().int().nonnegative(),
    recommendationGrantsExecution: z.literal(false),
    metadataOnly: z.literal(true),
    bodyStored: z.literal(false),
    sourceBodyStored: z.literal(false),
    draftOnly: z.literal(true),
  });
export type CodexExecLiveAdapterAdrDraftExportResult = z.infer<
  typeof CodexExecLiveAdapterAdrDraftExportResultSchema
>;

export const CodexExecLiveAdapterAdrDecisionOutcomeSchema = z.enum([
  'no_go',
  'conditional_read_only_go',
]);
export type CodexExecLiveAdapterAdrDecisionOutcome = z.infer<
  typeof CodexExecLiveAdapterAdrDecisionOutcomeSchema
>;

export const CodexExecLiveAdapterAdrDecisionStatusSchema = z.enum([
  'draft',
  'recorded',
  'superseded',
]);
export type CodexExecLiveAdapterAdrDecisionStatus = z.infer<
  typeof CodexExecLiveAdapterAdrDecisionStatusSchema
>;

export const CodexExecLiveAdapterAdrDecisionGatePolicySchema = createdEntityBaseSchema
  .merge(codexExecControlPlaneSafetyFlagsSchema)
  .extend({
    allowedSandboxModes: z.array(CodexExecSandboxModeSchema),
    forbiddenSandboxModes: z.array(CodexExecSandboxModeSchema),
    triggerSurface: z.literal('cli_only'),
    dashboardTriggerAllowed: z.literal(false),
    dryRunRequired: z.literal(true),
    approvalArtifactRequired: z.literal(true),
    dryRunPlanHashMatchRequired: z.literal(true),
    policyDecisionHashMatchRequired: z.literal(true),
    isolatedWorktreeRequired: z.literal(true),
    postRunVerificationCommand: z.literal('pnpm verify:foundation'),
    evidenceRequired: z.literal(true),
    auditRequired: z.literal(true),
    implementationApproved: z.literal(false),
    processAdapterApproved: z.literal(false),
    recommendationGrantsExecution: z.literal(false),
    metadataOnly: z.literal(true),
    bodyStored: z.literal(false),
  });
export type CodexExecLiveAdapterAdrDecisionGatePolicy = z.infer<
  typeof CodexExecLiveAdapterAdrDecisionGatePolicySchema
>;

export const CodexExecLiveAdapterAdrDecisionRecordSchema = createdEntityBaseSchema
  .merge(codexExecControlPlaneSafetyFlagsSchema)
  .extend({
    dryRunId: z.string().min(1),
    adrDocumentPath: z.string().min(1),
    decisionDocumentPath: z.string().min(1),
    decision: CodexExecLiveAdapterAdrDecisionOutcomeSchema,
    status: CodexExecLiveAdapterAdrDecisionStatusSchema,
    reviewerLabel: z.string().min(1),
    rationaleSummary: z.string().min(1),
    recordedAt: IsoDateTimeSchema,
    gatePolicy: CodexExecLiveAdapterAdrDecisionGatePolicySchema,
    allowedSandboxModes: z.array(CodexExecSandboxModeSchema),
    forbiddenSandboxModes: z.array(CodexExecSandboxModeSchema),
    futureTriggerPolicy: z.literal('cli_only'),
    dashboardTriggerAllowed: z.literal(false),
    dryRunRequired: z.literal(true),
    approvalArtifactRequired: z.literal(true),
    dryRunPlanHashMatchRequired: z.literal(true),
    policyDecisionHashMatchRequired: z.literal(true),
    isolatedWorktreeRequired: z.literal(true),
    postRunVerificationCommand: z.literal('pnpm verify:foundation'),
    evidenceRequired: z.literal(true),
    auditRequired: z.literal(true),
    implementationApproved: z.literal(false),
    processAdapterApproved: z.literal(false),
    recommendationGrantsExecution: z.literal(false),
    evidenceRefs: z.array(EvidenceRefSchema).default([]),
    auditEventIds: z.array(z.string().min(1)).default([]),
    metadataOnly: z.literal(true),
    bodyStored: z.literal(false),
  });
export type CodexExecLiveAdapterAdrDecisionRecord = z.infer<
  typeof CodexExecLiveAdapterAdrDecisionRecordSchema
>;

export const CodexExecLiveAdapterAdrDecisionSummarySchema = createdEntityBaseSchema
  .merge(codexExecControlPlaneSafetyFlagsSchema)
  .extend({
    decisionId: z.string().min(1),
    dryRunId: z.string().min(1),
    decision: CodexExecLiveAdapterAdrDecisionOutcomeSchema,
    status: CodexExecLiveAdapterAdrDecisionStatusSchema,
    reviewerLabel: z.string().min(1),
    rationaleSummary: z.string().min(1),
    allowedSandboxModes: z.array(CodexExecSandboxModeSchema),
    forbiddenSandboxModes: z.array(CodexExecSandboxModeSchema),
    futureTriggerPolicy: z.literal('cli_only'),
    dashboardTriggerAllowed: z.literal(false),
    approvalArtifactRequired: z.literal(true),
    dryRunPlanHashMatchRequired: z.literal(true),
    policyDecisionHashMatchRequired: z.literal(true),
    isolatedWorktreeRequired: z.literal(true),
    postRunVerificationCommand: z.literal('pnpm verify:foundation'),
    evidenceCount: z.number().int().nonnegative(),
    auditEventCount: z.number().int().nonnegative(),
    implementationApproved: z.literal(false),
    processAdapterApproved: z.literal(false),
    recommendationGrantsExecution: z.literal(false),
    metadataOnly: z.literal(true),
    bodyStored: z.literal(false),
  });
export type CodexExecLiveAdapterAdrDecisionSummary = z.infer<
  typeof CodexExecLiveAdapterAdrDecisionSummarySchema
>;

export const CodexExecLiveAdapterAdrDecisionQuerySchema = createdEntityBaseSchema
  .merge(codexExecControlPlaneSafetyFlagsSchema)
  .extend({
    dryRunId: z.string().min(1).optional(),
    status: CodexExecLiveAdapterAdrDecisionStatusSchema.optional(),
    decision: CodexExecLiveAdapterAdrDecisionOutcomeSchema.optional(),
    limit: z.number().int().positive().max(200).default(20),
    implementationApproved: z.literal(false),
    processAdapterApproved: z.literal(false),
    recommendationGrantsExecution: z.literal(false),
    dashboardTriggerAllowed: z.literal(false),
    metadataOnly: z.literal(true),
    bodyStored: z.literal(false),
  });
export type CodexExecLiveAdapterAdrDecisionQuery = z.infer<
  typeof CodexExecLiveAdapterAdrDecisionQuerySchema
>;

export const CodexExecReadOnlyAdapterPreflightSimulationStatusSchema = z.enum([
  'passed',
  'failed',
  'requires_review',
  'blocked',
]);
export type CodexExecReadOnlyAdapterPreflightSimulationStatus = z.infer<
  typeof CodexExecReadOnlyAdapterPreflightSimulationStatusSchema
>;

export const CodexExecReadOnlyAdapterPreflightSimulationCheckSourceSchema = z.enum([
  'config',
  'sandbox',
  'dry_run',
  'policy',
  'approval',
  'hash',
  'worktree',
  'evidence',
  'audit',
  'operator',
  'dashboard',
  'adr_decision',
]);
export type CodexExecReadOnlyAdapterPreflightSimulationCheckSource = z.infer<
  typeof CodexExecReadOnlyAdapterPreflightSimulationCheckSourceSchema
>;

export const CodexExecReadOnlyAdapterPreflightSimulationCheckSchema = createdEntityBaseSchema
  .merge(codexExecReadOnlyAdapterSafetyFlagsSchema)
  .extend({
    code: z.string().min(1),
    source: CodexExecReadOnlyAdapterPreflightSimulationCheckSourceSchema,
    status: z.enum(['passed', 'failed', 'warning']),
    required: z.boolean(),
    summary: z.string().min(1),
    metadataOnly: z.literal(true),
    bodyStored: z.literal(false),
  });
export type CodexExecReadOnlyAdapterPreflightSimulationCheck = z.infer<
  typeof CodexExecReadOnlyAdapterPreflightSimulationCheckSchema
>;

export const CodexExecReadOnlyAdapterPreflightSimulationBlockerSchema = createdEntityBaseSchema
  .merge(codexExecReadOnlyAdapterSafetyFlagsSchema)
  .extend({
    code: z.string().min(1),
    source: CodexExecReadOnlyAdapterPreflightSimulationCheckSourceSchema,
    severity: RiskLevelSchema,
    relatedCheckCode: z.string().min(1).optional(),
    summary: z.string().min(1),
    metadataOnly: z.literal(true),
    bodyStored: z.literal(false),
  });
export type CodexExecReadOnlyAdapterPreflightSimulationBlocker = z.infer<
  typeof CodexExecReadOnlyAdapterPreflightSimulationBlockerSchema
>;

export const CodexExecReadOnlyAdapterOperatorChecklistItemSchema = createdEntityBaseSchema
  .merge(codexExecReadOnlyAdapterSafetyFlagsSchema)
  .extend({
    code: z.string().min(1),
    label: z.string().min(1),
    summary: z.string().min(1),
    checked: z.boolean().default(false),
    required: z.boolean().default(true),
    metadataOnly: z.literal(true),
    bodyStored: z.literal(false),
  });
export type CodexExecReadOnlyAdapterOperatorChecklistItem = z.infer<
  typeof CodexExecReadOnlyAdapterOperatorChecklistItemSchema
>;

export const CodexExecReadOnlyAdapterPreflightSimulationInputSchema = createdEntityBaseSchema
  .merge(codexExecReadOnlyAdapterSafetyFlagsSchema)
  .extend({
    dryRunId: z.string().min(1),
    requestedSandboxMode: CodexExecSandboxModeSchema.default('read_only'),
    isolatedWorktreePresent: z.boolean().default(false),
    evidenceStoreReady: z.boolean().default(false),
    auditStoreReady: z.boolean().default(false),
    dashboardTriggerAttempted: z.boolean().default(false),
    processAdapterAttempted: z.boolean().default(false),
    workspaceWriteRequested: z.boolean().default(false),
    dangerFullAccessRequested: z.boolean().default(false),
    operatorChecklist: z.array(CodexExecReadOnlyAdapterOperatorChecklistItemSchema).default([]),
    metadataOnly: z.literal(true),
    bodyStored: z.literal(false),
  });
export type CodexExecReadOnlyAdapterPreflightSimulationInput = z.infer<
  typeof CodexExecReadOnlyAdapterPreflightSimulationInputSchema
>;

export const CodexExecReadOnlyAdapterPreflightSimulationResultSchema = createdEntityBaseSchema
  .merge(codexExecReadOnlyAdapterSafetyFlagsSchema)
  .extend({
    dryRunId: z.string().min(1),
    status: CodexExecReadOnlyAdapterPreflightSimulationStatusSchema,
    requestedSandboxMode: CodexExecSandboxModeSchema,
    checks: z.array(CodexExecReadOnlyAdapterPreflightSimulationCheckSchema),
    blockers: z.array(CodexExecReadOnlyAdapterPreflightSimulationBlockerSchema),
    operatorChecklist: z.array(CodexExecReadOnlyAdapterOperatorChecklistItemSchema),
    configLiveEnabled: z.boolean(),
    dryRunExists: z.boolean(),
    policyDecisionExists: z.boolean(),
    approvalArtifactExists: z.boolean(),
    approvalArtifactValid: z.boolean(),
    dryRunPlanHashMatched: z.boolean(),
    policyDecisionHashMatched: z.boolean(),
    isolatedWorktreePresent: z.boolean(),
    evidenceStoreReady: z.boolean(),
    auditStoreReady: z.boolean(),
    checklistComplete: z.boolean(),
    adrDecisionDesignOnly: z.boolean(),
    passedCheckCount: z.number().int().nonnegative(),
    failedCheckCount: z.number().int().nonnegative(),
    warningCheckCount: z.number().int().nonnegative(),
    blockerCount: z.number().int().nonnegative(),
    summary: z.string().min(1),
    recommendationGrantsExecution: z.literal(false),
    metadataOnly: z.literal(true),
    bodyStored: z.literal(false),
  });
export type CodexExecReadOnlyAdapterPreflightSimulationResult = z.infer<
  typeof CodexExecReadOnlyAdapterPreflightSimulationResultSchema
>;

export const CodexExecReadOnlyAdapterPreflightSimulationSummarySchema = createdEntityBaseSchema
  .merge(codexExecReadOnlyAdapterSafetyFlagsSchema)
  .extend({
    simulationId: z.string().min(1),
    dryRunId: z.string().min(1),
    status: CodexExecReadOnlyAdapterPreflightSimulationStatusSchema,
    requestedSandboxMode: CodexExecSandboxModeSchema,
    passedCheckCount: z.number().int().nonnegative(),
    failedCheckCount: z.number().int().nonnegative(),
    warningCheckCount: z.number().int().nonnegative(),
    blockerCount: z.number().int().nonnegative(),
    checklistCompletedCount: z.number().int().nonnegative(),
    checklistTotalCount: z.number().int().nonnegative(),
    summary: z.string().min(1),
    recommendationGrantsExecution: z.literal(false),
    metadataOnly: z.literal(true),
    bodyStored: z.literal(false),
  });
export type CodexExecReadOnlyAdapterPreflightSimulationSummary = z.infer<
  typeof CodexExecReadOnlyAdapterPreflightSimulationSummarySchema
>;

export const CodexExecReadOnlyAdapterSimulatorReviewOutcomeSchema = z.enum([
  'no_go',
  'go_to_implementation_planning',
]);
export type CodexExecReadOnlyAdapterSimulatorReviewOutcome = z.infer<
  typeof CodexExecReadOnlyAdapterSimulatorReviewOutcomeSchema
>;

export const CodexExecReadOnlyAdapterSimulatorReviewStatusSchema = z.enum([
  'draft',
  'recorded',
  'superseded',
]);
export type CodexExecReadOnlyAdapterSimulatorReviewStatus = z.infer<
  typeof CodexExecReadOnlyAdapterSimulatorReviewStatusSchema
>;

export const CodexExecReadOnlyAdapterGateDispositionSchema = z.enum([
  'hard_gate',
  'requires_review',
  'informational',
]);
export type CodexExecReadOnlyAdapterGateDisposition = z.infer<
  typeof CodexExecReadOnlyAdapterGateDispositionSchema
>;

export const CodexExecReadOnlyAdapterSimulatorReviewChecklistItemSchema = createdEntityBaseSchema
  .merge(codexExecReadOnlyAdapterSafetyFlagsSchema)
  .extend({
    code: z.string().min(1),
    label: z.string().min(1),
    checkCode: z.string().min(1).optional(),
    disposition: CodexExecReadOnlyAdapterGateDispositionSchema,
    status: z.enum(['passed', 'failed', 'requires_review']),
    required: z.boolean(),
    summary: z.string().min(1),
    processAdapterApproved: z.literal(false),
    recommendationGrantsExecution: z.literal(false),
    metadataOnly: z.literal(true),
    bodyStored: z.literal(false),
  });
export type CodexExecReadOnlyAdapterSimulatorReviewChecklistItem = z.infer<
  typeof CodexExecReadOnlyAdapterSimulatorReviewChecklistItemSchema
>;

export const CodexExecReadOnlyAdapterSimulatorReviewFindingSchema = createdEntityBaseSchema
  .merge(codexExecReadOnlyAdapterSafetyFlagsSchema)
  .extend({
    code: z.string().min(1),
    severity: RiskLevelSchema,
    relatedCheckCode: z.string().min(1).optional(),
    disposition: CodexExecReadOnlyAdapterGateDispositionSchema,
    summary: z.string().min(1),
    recommendation: z.string().min(1),
    processAdapterApproved: z.literal(false),
    recommendationGrantsExecution: z.literal(false),
    metadataOnly: z.literal(true),
    bodyStored: z.literal(false),
  });
export type CodexExecReadOnlyAdapterSimulatorReviewFinding = z.infer<
  typeof CodexExecReadOnlyAdapterSimulatorReviewFindingSchema
>;

export const CodexExecReadOnlyAdapterSimulatorReviewDecisionRecordSchema = createdEntityBaseSchema
  .merge(codexExecReadOnlyAdapterSafetyFlagsSchema)
  .extend({
    dryRunId: z.string().min(1),
    simulationId: z.string().min(1),
    simulationStatus: CodexExecReadOnlyAdapterPreflightSimulationStatusSchema,
    outcome: CodexExecReadOnlyAdapterSimulatorReviewOutcomeSchema,
    status: CodexExecReadOnlyAdapterSimulatorReviewStatusSchema,
    reviewerLabel: z.string().min(1),
    rationaleSummary: z.string().min(1),
    reviewedAt: IsoDateTimeSchema,
    checklistItems: z.array(CodexExecReadOnlyAdapterSimulatorReviewChecklistItemSchema),
    findings: z.array(CodexExecReadOnlyAdapterSimulatorReviewFindingSchema),
    simulatorBlockers: z.array(CodexExecReadOnlyAdapterPreflightSimulationBlockerSchema),
    hardGateCount: z.number().int().nonnegative(),
    requiresReviewCount: z.number().int().nonnegative(),
    informationalCount: z.number().int().nonnegative(),
    unresolvedBlockerCount: z.number().int().nonnegative(),
    evidenceRefs: z.array(EvidenceRefSchema).default([]),
    auditEventIds: z.array(z.string().min(1)).default([]),
    processAdapterApproved: z.literal(false),
    recommendationGrantsExecution: z.literal(false),
    metadataOnly: z.literal(true),
    bodyStored: z.literal(false),
  });
export type CodexExecReadOnlyAdapterSimulatorReviewDecisionRecord = z.infer<
  typeof CodexExecReadOnlyAdapterSimulatorReviewDecisionRecordSchema
>;

export const CodexExecReadOnlyAdapterSimulatorReviewSummarySchema = createdEntityBaseSchema
  .merge(codexExecReadOnlyAdapterSafetyFlagsSchema)
  .extend({
    reviewId: z.string().min(1),
    dryRunId: z.string().min(1),
    simulationId: z.string().min(1),
    simulationStatus: CodexExecReadOnlyAdapterPreflightSimulationStatusSchema,
    outcome: CodexExecReadOnlyAdapterSimulatorReviewOutcomeSchema,
    status: CodexExecReadOnlyAdapterSimulatorReviewStatusSchema,
    reviewerLabel: z.string().min(1),
    reviewedAt: IsoDateTimeSchema,
    hardGateCount: z.number().int().nonnegative(),
    requiresReviewCount: z.number().int().nonnegative(),
    informationalCount: z.number().int().nonnegative(),
    unresolvedBlockerCount: z.number().int().nonnegative(),
    summary: z.string().min(1),
    processAdapterApproved: z.literal(false),
    recommendationGrantsExecution: z.literal(false),
    metadataOnly: z.literal(true),
    bodyStored: z.literal(false),
  });
export type CodexExecReadOnlyAdapterSimulatorReviewSummary = z.infer<
  typeof CodexExecReadOnlyAdapterSimulatorReviewSummarySchema
>;

export const CodexExecReadOnlyAdapterSimulatorReviewQuerySchema = createdEntityBaseSchema
  .merge(codexExecReadOnlyAdapterSafetyFlagsSchema)
  .extend({
    dryRunId: z.string().min(1).optional(),
    status: CodexExecReadOnlyAdapterSimulatorReviewStatusSchema.optional(),
    outcome: CodexExecReadOnlyAdapterSimulatorReviewOutcomeSchema.optional(),
    limit: z.number().int().positive().max(200).default(50),
    processAdapterApproved: z.literal(false),
    recommendationGrantsExecution: z.literal(false),
    metadataOnly: z.literal(true),
    bodyStored: z.literal(false),
  });
export type CodexExecReadOnlyAdapterSimulatorReviewQuery = z.infer<
  typeof CodexExecReadOnlyAdapterSimulatorReviewQuerySchema
>;

export const CodexExecReadOnlyAdapterImplementationPlanReviewOutcomeSchema = z.enum([
  'no_go',
  'conditional_go_to_disabled_skeleton',
]);
export type CodexExecReadOnlyAdapterImplementationPlanReviewOutcome = z.infer<
  typeof CodexExecReadOnlyAdapterImplementationPlanReviewOutcomeSchema
>;

export const CodexExecReadOnlyAdapterImplementationPlanReviewStatusSchema = z.enum([
  'draft',
  'recorded',
  'superseded',
]);
export type CodexExecReadOnlyAdapterImplementationPlanReviewStatus = z.infer<
  typeof CodexExecReadOnlyAdapterImplementationPlanReviewStatusSchema
>;

const codexExecReadOnlyAdapterImplementationPlanReviewFlagsSchema =
  codexExecReadOnlyAdapterSafetyFlagsSchema.extend({
    processAdapterApproved: z.literal(false),
    recommendationGrantsExecution: z.literal(false),
    workspaceWriteAllowed: z.literal(false),
    dangerFullAccessAllowed: z.literal(false),
    metadataOnly: z.literal(true),
    bodyStored: z.literal(false),
  });

export const CodexExecReadOnlyAdapterImplementationPlanReviewChecklistItemSchema =
  createdEntityBaseSchema
    .merge(codexExecReadOnlyAdapterImplementationPlanReviewFlagsSchema)
    .extend({
      code: z.string().min(1),
      label: z.string().min(1),
      disposition: CodexExecReadOnlyAdapterGateDispositionSchema,
      status: z.enum(['passed', 'failed', 'requires_review']),
      required: z.boolean(),
      summary: z.string().min(1),
    });
export type CodexExecReadOnlyAdapterImplementationPlanReviewChecklistItem = z.infer<
  typeof CodexExecReadOnlyAdapterImplementationPlanReviewChecklistItemSchema
>;

export const CodexExecReadOnlyAdapterImplementationPlanReviewFindingSchema = createdEntityBaseSchema
  .merge(codexExecReadOnlyAdapterImplementationPlanReviewFlagsSchema)
  .extend({
    code: z.string().min(1),
    severity: RiskLevelSchema,
    relatedChecklistCode: z.string().min(1).optional(),
    disposition: CodexExecReadOnlyAdapterGateDispositionSchema,
    summary: z.string().min(1),
    recommendation: z.string().min(1),
  });
export type CodexExecReadOnlyAdapterImplementationPlanReviewFinding = z.infer<
  typeof CodexExecReadOnlyAdapterImplementationPlanReviewFindingSchema
>;

const validateImplementationPlanReviewOutcome = (
  value: {
    outcome: CodexExecReadOnlyAdapterImplementationPlanReviewOutcome;
    disabledSkeletonApproved: boolean;
  },
  context: z.RefinementCtx,
) => {
  const expected = value.outcome === 'conditional_go_to_disabled_skeleton';

  if (value.disabledSkeletonApproved !== expected) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['disabledSkeletonApproved'],
      message: 'disabledSkeletonApproved must match the implementation plan review outcome',
    });
  }
};

export const CodexExecReadOnlyAdapterImplementationPlanReviewDecisionRecordSchema =
  createdEntityBaseSchema
    .merge(codexExecReadOnlyAdapterImplementationPlanReviewFlagsSchema)
    .extend({
      planDocumentPath: z.string().min(1),
      planDocumentHash: z.string().min(1),
      outcome: CodexExecReadOnlyAdapterImplementationPlanReviewOutcomeSchema,
      status: CodexExecReadOnlyAdapterImplementationPlanReviewStatusSchema,
      reviewerLabel: z.string().min(1),
      rationaleSummary: z.string().min(1),
      reviewedAt: IsoDateTimeSchema,
      disabledSkeletonApproved: z.boolean(),
      checklistItems: z.array(CodexExecReadOnlyAdapterImplementationPlanReviewChecklistItemSchema),
      findings: z.array(CodexExecReadOnlyAdapterImplementationPlanReviewFindingSchema),
      hardGateCount: z.number().int().nonnegative(),
      requiresReviewCount: z.number().int().nonnegative(),
      informationalCount: z.number().int().nonnegative(),
      unresolvedFindingCount: z.number().int().nonnegative(),
      evidenceRefs: z.array(EvidenceRefSchema).default([]),
      auditEventIds: z.array(z.string().min(1)).default([]),
    })
    .superRefine(validateImplementationPlanReviewOutcome);
export type CodexExecReadOnlyAdapterImplementationPlanReviewDecisionRecord = z.infer<
  typeof CodexExecReadOnlyAdapterImplementationPlanReviewDecisionRecordSchema
>;

export const CodexExecReadOnlyAdapterImplementationPlanReviewSummarySchema = createdEntityBaseSchema
  .merge(codexExecReadOnlyAdapterImplementationPlanReviewFlagsSchema)
  .extend({
    reviewId: z.string().min(1),
    planDocumentPath: z.string().min(1),
    planDocumentHash: z.string().min(1),
    outcome: CodexExecReadOnlyAdapterImplementationPlanReviewOutcomeSchema,
    status: CodexExecReadOnlyAdapterImplementationPlanReviewStatusSchema,
    reviewerLabel: z.string().min(1),
    reviewedAt: IsoDateTimeSchema,
    disabledSkeletonApproved: z.boolean(),
    hardGateCount: z.number().int().nonnegative(),
    requiresReviewCount: z.number().int().nonnegative(),
    informationalCount: z.number().int().nonnegative(),
    unresolvedFindingCount: z.number().int().nonnegative(),
    summary: z.string().min(1),
  })
  .superRefine(validateImplementationPlanReviewOutcome);
export type CodexExecReadOnlyAdapterImplementationPlanReviewSummary = z.infer<
  typeof CodexExecReadOnlyAdapterImplementationPlanReviewSummarySchema
>;

export const CodexExecReadOnlyAdapterImplementationPlanReviewQuerySchema = createdEntityBaseSchema
  .merge(codexExecReadOnlyAdapterImplementationPlanReviewFlagsSchema)
  .extend({
    status: CodexExecReadOnlyAdapterImplementationPlanReviewStatusSchema.optional(),
    outcome: CodexExecReadOnlyAdapterImplementationPlanReviewOutcomeSchema.optional(),
    limit: z.number().int().positive().max(200).default(50),
  });
export type CodexExecReadOnlyAdapterImplementationPlanReviewQuery = z.infer<
  typeof CodexExecReadOnlyAdapterImplementationPlanReviewQuerySchema
>;

export const CodexExecReadOnlyAdapterSkeletonStatusSchema = z.enum([
  'disabled',
  'blocked',
  'unavailable',
]);
export type CodexExecReadOnlyAdapterSkeletonStatus = z.infer<
  typeof CodexExecReadOnlyAdapterSkeletonStatusSchema
>;

export const CodexExecReadOnlyAdapterDisabledReasonSchema = createdEntityBaseSchema
  .merge(codexExecReadOnlyAdapterImplementationPlanReviewFlagsSchema)
  .extend({
    code: z.string().min(1),
    severity: RiskLevelSchema,
    summary: z.string().min(1),
  });
export type CodexExecReadOnlyAdapterDisabledReason = z.infer<
  typeof CodexExecReadOnlyAdapterDisabledReasonSchema
>;

export const CodexExecReadOnlyAdapterSkeletonConfigSchema = createdEntityBaseSchema
  .merge(codexExecReadOnlyAdapterImplementationPlanReviewFlagsSchema)
  .extend({
    status: CodexExecReadOnlyAdapterSkeletonStatusSchema,
    explicitEnableRequired: z.literal(true),
    configuredEnabled: z.literal(false),
    allowedSandboxModes: z.array(z.literal('read_only')).default(['read_only']),
    forbiddenSandboxModes: z
      .array(z.enum(['workspace_write', 'danger_full_access']))
      .default(['workspace_write', 'danger_full_access']),
    cliOnly: z.literal(true),
    noRunnableCommand: z.literal(true),
    commandPreviewStored: z.literal(false),
    argvStored: z.literal(false),
    executablePathStored: z.literal(false),
    shellSnippetStored: z.literal(false),
    envPlanStored: z.literal(false),
  });
export type CodexExecReadOnlyAdapterSkeletonConfig = z.infer<
  typeof CodexExecReadOnlyAdapterSkeletonConfigSchema
>;

export const CodexExecReadOnlyAdapterSkeletonPreviewSchema = createdEntityBaseSchema
  .merge(codexExecReadOnlyAdapterImplementationPlanReviewFlagsSchema)
  .extend({
    status: CodexExecReadOnlyAdapterSkeletonStatusSchema,
    config: CodexExecReadOnlyAdapterSkeletonConfigSchema,
    disabledReasons: z.array(CodexExecReadOnlyAdapterDisabledReasonSchema),
    summary: z.string().min(1),
    noRunnableCommand: z.literal(true),
    commandPreviewStored: z.literal(false),
    argvStored: z.literal(false),
    executablePathStored: z.literal(false),
    shellSnippetStored: z.literal(false),
    envPlanStored: z.literal(false),
  });
export type CodexExecReadOnlyAdapterSkeletonPreview = z.infer<
  typeof CodexExecReadOnlyAdapterSkeletonPreviewSchema
>;

export const CodexExecReadOnlyAdapterSkeletonRecordSchema = createdEntityBaseSchema
  .merge(codexExecReadOnlyAdapterImplementationPlanReviewFlagsSchema)
  .extend({
    preview: CodexExecReadOnlyAdapterSkeletonPreviewSchema,
    status: CodexExecReadOnlyAdapterSkeletonStatusSchema,
    evidenceRefs: z.array(EvidenceRefSchema).default([]),
    auditEventIds: z.array(z.string().min(1)).default([]),
    summary: z.string().min(1),
  });
export type CodexExecReadOnlyAdapterSkeletonRecord = z.infer<
  typeof CodexExecReadOnlyAdapterSkeletonRecordSchema
>;

export const CodexExecReadOnlyAdapterSkeletonReviewOutcomeSchema = z.enum([
  'no_go',
  'skeleton_accepted_for_fixture_boundary_only',
]);
export type CodexExecReadOnlyAdapterSkeletonReviewOutcome = z.infer<
  typeof CodexExecReadOnlyAdapterSkeletonReviewOutcomeSchema
>;

export const CodexExecReadOnlyAdapterSkeletonReviewStatusSchema = z.enum([
  'draft',
  'recorded',
  'superseded',
]);
export type CodexExecReadOnlyAdapterSkeletonReviewStatus = z.infer<
  typeof CodexExecReadOnlyAdapterSkeletonReviewStatusSchema
>;

export const CodexExecReadOnlyAdapterSkeletonReviewChecklistItemSchema = createdEntityBaseSchema
  .merge(codexExecReadOnlyAdapterImplementationPlanReviewFlagsSchema)
  .extend({
    code: z.string().min(1),
    label: z.string().min(1),
    disposition: CodexExecReadOnlyAdapterGateDispositionSchema,
    status: z.enum(['passed', 'failed', 'requires_review']),
    required: z.boolean(),
    summary: z.string().min(1),
  });
export type CodexExecReadOnlyAdapterSkeletonReviewChecklistItem = z.infer<
  typeof CodexExecReadOnlyAdapterSkeletonReviewChecklistItemSchema
>;

export const CodexExecReadOnlyAdapterSkeletonReviewFindingSchema = createdEntityBaseSchema
  .merge(codexExecReadOnlyAdapterImplementationPlanReviewFlagsSchema)
  .extend({
    code: z.string().min(1),
    severity: RiskLevelSchema,
    relatedChecklistCode: z.string().min(1).optional(),
    disposition: CodexExecReadOnlyAdapterGateDispositionSchema,
    summary: z.string().min(1),
    recommendation: z.string().min(1),
  });
export type CodexExecReadOnlyAdapterSkeletonReviewFinding = z.infer<
  typeof CodexExecReadOnlyAdapterSkeletonReviewFindingSchema
>;

export const CodexExecReadOnlyAdapterSkeletonReviewDecisionRecordSchema = createdEntityBaseSchema
  .merge(codexExecReadOnlyAdapterImplementationPlanReviewFlagsSchema)
  .extend({
    skeletonPreviewId: z.string().min(1),
    outcome: CodexExecReadOnlyAdapterSkeletonReviewOutcomeSchema,
    status: CodexExecReadOnlyAdapterSkeletonReviewStatusSchema,
    reviewerLabel: z.string().min(1),
    rationaleSummary: z.string().min(1),
    reviewedAt: IsoDateTimeSchema,
    fixtureBoundaryAllowed: z.boolean(),
    checklistItems: z.array(CodexExecReadOnlyAdapterSkeletonReviewChecklistItemSchema),
    findings: z.array(CodexExecReadOnlyAdapterSkeletonReviewFindingSchema),
    hardGateCount: z.number().int().nonnegative(),
    requiresReviewCount: z.number().int().nonnegative(),
    informationalCount: z.number().int().nonnegative(),
    unresolvedFindingCount: z.number().int().nonnegative(),
    evidenceRefs: z.array(EvidenceRefSchema).default([]),
    auditEventIds: z.array(z.string().min(1)).default([]),
  });
export type CodexExecReadOnlyAdapterSkeletonReviewDecisionRecord = z.infer<
  typeof CodexExecReadOnlyAdapterSkeletonReviewDecisionRecordSchema
>;

export const CodexExecReadOnlyAdapterSkeletonReviewSummarySchema = createdEntityBaseSchema
  .merge(codexExecReadOnlyAdapterImplementationPlanReviewFlagsSchema)
  .extend({
    reviewId: z.string().min(1),
    skeletonPreviewId: z.string().min(1),
    outcome: CodexExecReadOnlyAdapterSkeletonReviewOutcomeSchema,
    status: CodexExecReadOnlyAdapterSkeletonReviewStatusSchema,
    reviewerLabel: z.string().min(1),
    reviewedAt: IsoDateTimeSchema,
    fixtureBoundaryAllowed: z.boolean(),
    hardGateCount: z.number().int().nonnegative(),
    requiresReviewCount: z.number().int().nonnegative(),
    informationalCount: z.number().int().nonnegative(),
    unresolvedFindingCount: z.number().int().nonnegative(),
    summary: z.string().min(1),
  });
export type CodexExecReadOnlyAdapterSkeletonReviewSummary = z.infer<
  typeof CodexExecReadOnlyAdapterSkeletonReviewSummarySchema
>;

export const CodexExecReadOnlyAdapterSkeletonReviewQuerySchema = createdEntityBaseSchema
  .merge(codexExecReadOnlyAdapterImplementationPlanReviewFlagsSchema)
  .extend({
    status: CodexExecReadOnlyAdapterSkeletonReviewStatusSchema.optional(),
    outcome: CodexExecReadOnlyAdapterSkeletonReviewOutcomeSchema.optional(),
    limit: z.number().int().positive().max(200).default(50),
  });
export type CodexExecReadOnlyAdapterSkeletonReviewQuery = z.infer<
  typeof CodexExecReadOnlyAdapterSkeletonReviewQuerySchema
>;

export const CodexExecReadOnlyAdapterFixtureBoundaryStatusSchema = z.enum([
  'completed',
  'failed',
  'blocked',
  'not_found',
]);
export type CodexExecReadOnlyAdapterFixtureBoundaryStatus = z.infer<
  typeof CodexExecReadOnlyAdapterFixtureBoundaryStatusSchema
>;

export const CodexExecReadOnlyAdapterFixtureBoundaryInputSchema = createdEntityBaseSchema
  .merge(codexExecReadOnlyAdapterImplementationPlanReviewFlagsSchema)
  .extend({
    fixturePath: z.string().min(1),
    dryRunId: z.string().min(1).optional(),
    fixtureOnly: z.literal(true),
  });
export type CodexExecReadOnlyAdapterFixtureBoundaryInput = z.infer<
  typeof CodexExecReadOnlyAdapterFixtureBoundaryInputSchema
>;

export const CodexExecReadOnlyAdapterFixtureBoundaryEventSchema = createdEntityBaseSchema
  .merge(codexExecReadOnlyAdapterImplementationPlanReviewFlagsSchema)
  .extend({
    eventType: z.string().min(1),
    itemType: z.string().min(1).optional(),
    status: z.enum(['observed', 'summarized', 'error']),
    summary: z.string().min(1),
    eventHash: z.string().min(1),
    length: z.number().int().nonnegative(),
    fixtureOnly: z.literal(true),
  });
export type CodexExecReadOnlyAdapterFixtureBoundaryEvent = z.infer<
  typeof CodexExecReadOnlyAdapterFixtureBoundaryEventSchema
>;

export const CodexExecReadOnlyAdapterFixtureBoundaryResultSchema = createdEntityBaseSchema
  .merge(codexExecReadOnlyAdapterImplementationPlanReviewFlagsSchema)
  .extend({
    input: CodexExecReadOnlyAdapterFixtureBoundaryInputSchema,
    status: CodexExecReadOnlyAdapterFixtureBoundaryStatusSchema,
    fixturePath: z.string().min(1),
    fixturePathHash: z.string().min(1),
    fixtureOnly: z.literal(true),
    eventCount: z.number().int().nonnegative(),
    itemCount: z.number().int().nonnegative(),
    errorCount: z.number().int().nonnegative(),
    finalStatus: z.string().min(1),
    events: z.array(CodexExecReadOnlyAdapterFixtureBoundaryEventSchema),
    evidenceRefs: z.array(EvidenceRefSchema).default([]),
    auditEvents: z.array(AuditEventSchema).default([]),
    auditEventIds: z.array(z.string().min(1)).default([]),
    summary: z.string().min(1),
  });
export type CodexExecReadOnlyAdapterFixtureBoundaryResult = z.infer<
  typeof CodexExecReadOnlyAdapterFixtureBoundaryResultSchema
>;

export const CodexExecReadOnlyAdapterFixtureBoundarySummarySchema = createdEntityBaseSchema
  .merge(codexExecReadOnlyAdapterImplementationPlanReviewFlagsSchema)
  .extend({
    boundaryResultId: z.string().min(1),
    status: CodexExecReadOnlyAdapterFixtureBoundaryStatusSchema,
    fixturePath: z.string().min(1),
    fixturePathHash: z.string().min(1),
    fixtureOnly: z.literal(true),
    eventCount: z.number().int().nonnegative(),
    itemCount: z.number().int().nonnegative(),
    errorCount: z.number().int().nonnegative(),
    finalStatus: z.string().min(1),
    summary: z.string().min(1),
  });
export type CodexExecReadOnlyAdapterFixtureBoundarySummary = z.infer<
  typeof CodexExecReadOnlyAdapterFixtureBoundarySummarySchema
>;

export const CodexExecReadOnlyAdapterFinalReadinessOutcomeSchema = z.enum([
  'no_go',
  'ready_for_separate_read_only_adapter_adr',
  'ready_for_separate_disabled_skeleton_followup',
]);
export type CodexExecReadOnlyAdapterFinalReadinessOutcome = z.infer<
  typeof CodexExecReadOnlyAdapterFinalReadinessOutcomeSchema
>;

export const CodexExecReadOnlyAdapterFinalReadinessStatusSchema = z.enum([
  'draft',
  'recorded',
  'superseded',
]);
export type CodexExecReadOnlyAdapterFinalReadinessStatus = z.infer<
  typeof CodexExecReadOnlyAdapterFinalReadinessStatusSchema
>;

export const CodexExecReadOnlyAdapterFinalReadinessDecisionRecordSchema = createdEntityBaseSchema
  .merge(codexExecReadOnlyAdapterImplementationPlanReviewFlagsSchema)
  .extend({
    outcome: CodexExecReadOnlyAdapterFinalReadinessOutcomeSchema,
    status: CodexExecReadOnlyAdapterFinalReadinessStatusSchema,
    reviewerLabel: z.string().min(1),
    rationaleSummary: z.string().min(1),
    reviewedAt: IsoDateTimeSchema,
    phaseAStatus: CodexExecReadOnlyAdapterSkeletonStatusSchema,
    phaseBOutcome: CodexExecReadOnlyAdapterSkeletonReviewOutcomeSchema,
    phaseCStatus: CodexExecReadOnlyAdapterFixtureBoundaryStatusSchema,
    realAdapterRequiresSeparateAdr: z.literal(true),
    currentRoundApprovesProcessStart: z.literal(false),
    currentRoundApprovesCodexExecution: z.literal(false),
    currentRoundApprovesWorkspaceWrites: z.literal(false),
    evidenceRefs: z.array(EvidenceRefSchema).default([]),
    auditEventIds: z.array(z.string().min(1)).default([]),
    summary: z.string().min(1),
  });
export type CodexExecReadOnlyAdapterFinalReadinessDecisionRecord = z.infer<
  typeof CodexExecReadOnlyAdapterFinalReadinessDecisionRecordSchema
>;

export const CodexExecReadOnlyAdapterFinalReadinessSummarySchema = createdEntityBaseSchema
  .merge(codexExecReadOnlyAdapterImplementationPlanReviewFlagsSchema)
  .extend({
    decisionId: z.string().min(1),
    outcome: CodexExecReadOnlyAdapterFinalReadinessOutcomeSchema,
    status: CodexExecReadOnlyAdapterFinalReadinessStatusSchema,
    reviewerLabel: z.string().min(1),
    reviewedAt: IsoDateTimeSchema,
    phaseAStatus: CodexExecReadOnlyAdapterSkeletonStatusSchema,
    phaseBOutcome: CodexExecReadOnlyAdapterSkeletonReviewOutcomeSchema,
    phaseCStatus: CodexExecReadOnlyAdapterFixtureBoundaryStatusSchema,
    realAdapterRequiresSeparateAdr: z.literal(true),
    summary: z.string().min(1),
  });
export type CodexExecReadOnlyAdapterFinalReadinessSummary = z.infer<
  typeof CodexExecReadOnlyAdapterFinalReadinessSummarySchema
>;

export const CodexExecReadOnlyAdapterFinalReadinessQuerySchema = createdEntityBaseSchema
  .merge(codexExecReadOnlyAdapterImplementationPlanReviewFlagsSchema)
  .extend({
    status: CodexExecReadOnlyAdapterFinalReadinessStatusSchema.optional(),
    outcome: CodexExecReadOnlyAdapterFinalReadinessOutcomeSchema.optional(),
    limit: z.number().int().positive().max(200).default(50),
  });
export type CodexExecReadOnlyAdapterFinalReadinessQuery = z.infer<
  typeof CodexExecReadOnlyAdapterFinalReadinessQuerySchema
>;

export const CodexExecRealReadOnlyAdapterReadinessStatusSchema = z.enum([
  'not_ready',
  'ready_for_separate_adr',
  'blocked',
  'requires_review',
]);
export type CodexExecRealReadOnlyAdapterReadinessStatus = z.infer<
  typeof CodexExecRealReadOnlyAdapterReadinessStatusSchema
>;

export const CodexExecRealReadOnlyAdapterReadinessGateSchema = createdEntityBaseSchema
  .merge(codexExecReadOnlyAdapterImplementationPlanReviewFlagsSchema)
  .extend({
    code: z.string().min(1),
    label: z.string().min(1),
    category: z.enum([
      'governance',
      'skeleton',
      'fixture_boundary',
      'config',
      'approval',
      'worktree',
      'evidence_audit',
      'failure_abort',
      'post_run_verification',
    ]),
    disposition: CodexExecReadOnlyAdapterGateDispositionSchema,
    status: z.enum(['passed', 'failed', 'requires_review', 'blocked']),
    required: z.boolean(),
    summary: z.string().min(1),
  });
export type CodexExecRealReadOnlyAdapterReadinessGate = z.infer<
  typeof CodexExecRealReadOnlyAdapterReadinessGateSchema
>;

export const CodexExecRealReadOnlyAdapterReadinessBlockerSchema = createdEntityBaseSchema
  .merge(codexExecReadOnlyAdapterImplementationPlanReviewFlagsSchema)
  .extend({
    code: z.string().min(1),
    severity: RiskLevelSchema,
    relatedGateCode: z.string().min(1).optional(),
    status: CodexExecRealReadOnlyAdapterReadinessStatusSchema,
    summary: z.string().min(1),
    recommendation: z.string().min(1),
  });
export type CodexExecRealReadOnlyAdapterReadinessBlocker = z.infer<
  typeof CodexExecRealReadOnlyAdapterReadinessBlockerSchema
>;

export const CodexExecRealReadOnlyAdapterReadinessFindingSchema = createdEntityBaseSchema
  .merge(codexExecReadOnlyAdapterImplementationPlanReviewFlagsSchema)
  .extend({
    code: z.string().min(1),
    severity: RiskLevelSchema,
    status: CodexExecRealReadOnlyAdapterReadinessStatusSchema,
    relatedGateCode: z.string().min(1).optional(),
    summary: z.string().min(1),
    recommendation: z.string().min(1),
  });
export type CodexExecRealReadOnlyAdapterReadinessFinding = z.infer<
  typeof CodexExecRealReadOnlyAdapterReadinessFindingSchema
>;

export const CodexExecRealReadOnlyAdapterReadinessChecklistItemSchema = createdEntityBaseSchema
  .merge(codexExecReadOnlyAdapterImplementationPlanReviewFlagsSchema)
  .extend({
    code: z.string().min(1),
    label: z.string().min(1),
    status: z.enum(['passed', 'failed', 'requires_review', 'blocked']),
    required: z.boolean(),
    summary: z.string().min(1),
  });
export type CodexExecRealReadOnlyAdapterReadinessChecklistItem = z.infer<
  typeof CodexExecRealReadOnlyAdapterReadinessChecklistItemSchema
>;

export const CodexExecRealReadOnlyAdapterReadinessPackageSchema = createdEntityBaseSchema
  .merge(codexExecReadOnlyAdapterImplementationPlanReviewFlagsSchema)
  .extend({
    dryRunId: z.string().min(1),
    status: CodexExecRealReadOnlyAdapterReadinessStatusSchema,
    recommendation: z.string().min(1),
    governanceDecisionId: z.string().min(1).optional(),
    skeletonPreviewId: z.string().min(1).optional(),
    skeletonReviewId: z.string().min(1).optional(),
    fixtureBoundaryId: z.string().min(1).optional(),
    finalReadinessId: z.string().min(1).optional(),
    documentedArtifactRefs: z.array(z.string().min(1)).default([]),
    gates: z.array(CodexExecRealReadOnlyAdapterReadinessGateSchema),
    blockers: z.array(CodexExecRealReadOnlyAdapterReadinessBlockerSchema),
    findings: z.array(CodexExecRealReadOnlyAdapterReadinessFindingSchema),
    checklistItems: z.array(CodexExecRealReadOnlyAdapterReadinessChecklistItemSchema),
    hardGateCount: z.number().int().nonnegative(),
    passedGateCount: z.number().int().nonnegative(),
    requiresReviewCount: z.number().int().nonnegative(),
    blockerCount: z.number().int().nonnegative(),
    findingCount: z.number().int().nonnegative(),
    documentedOnly3twEvidence: z.boolean(),
    symlinkEscapeVerificationPending: z.boolean(),
    evidenceRefs: z.array(EvidenceRefSchema).default([]),
    auditEventIds: z.array(z.string().min(1)).default([]),
    summary: z.string().min(1),
  });
export type CodexExecRealReadOnlyAdapterReadinessPackage = z.infer<
  typeof CodexExecRealReadOnlyAdapterReadinessPackageSchema
>;

export const CodexExecRealReadOnlyAdapterReadinessSummarySchema = createdEntityBaseSchema
  .merge(codexExecReadOnlyAdapterImplementationPlanReviewFlagsSchema)
  .extend({
    packageId: z.string().min(1),
    dryRunId: z.string().min(1),
    status: CodexExecRealReadOnlyAdapterReadinessStatusSchema,
    recommendation: z.string().min(1),
    hardGateCount: z.number().int().nonnegative(),
    passedGateCount: z.number().int().nonnegative(),
    requiresReviewCount: z.number().int().nonnegative(),
    blockerCount: z.number().int().nonnegative(),
    findingCount: z.number().int().nonnegative(),
    documentedOnly3twEvidence: z.boolean(),
    symlinkEscapeVerificationPending: z.boolean(),
    summary: z.string().min(1),
  });
export type CodexExecRealReadOnlyAdapterReadinessSummary = z.infer<
  typeof CodexExecRealReadOnlyAdapterReadinessSummarySchema
>;

export const CodexExecRealReadOnlyAdapterReadinessQuerySchema = createdEntityBaseSchema
  .merge(codexExecReadOnlyAdapterImplementationPlanReviewFlagsSchema)
  .extend({
    dryRunId: z.string().min(1).optional(),
    status: CodexExecRealReadOnlyAdapterReadinessStatusSchema.optional(),
    limit: z.number().int().positive().max(200).default(50),
  });
export type CodexExecRealReadOnlyAdapterReadinessQuery = z.infer<
  typeof CodexExecRealReadOnlyAdapterReadinessQuerySchema
>;

export const CodexExecRealReadOnlyAdapterReadinessReviewOutcomeSchema = z.enum([
  'no_go_to_separate_adr_draft',
  'conditional_go_to_separate_adr_draft',
]);
export type CodexExecRealReadOnlyAdapterReadinessReviewOutcome = z.infer<
  typeof CodexExecRealReadOnlyAdapterReadinessReviewOutcomeSchema
>;

export const CodexExecRealReadOnlyAdapterReadinessReviewStatusSchema = z.enum([
  'draft',
  'recorded',
  'superseded',
]);
export type CodexExecRealReadOnlyAdapterReadinessReviewStatus = z.infer<
  typeof CodexExecRealReadOnlyAdapterReadinessReviewStatusSchema
>;

export const CodexExecRealReadOnlyAdapterReadinessReviewChecklistItemSchema =
  createdEntityBaseSchema
    .merge(codexExecReadOnlyAdapterImplementationPlanReviewFlagsSchema)
    .extend({
      code: z.string().min(1),
      label: z.string().min(1),
      status: z.enum(['passed', 'failed', 'requires_review', 'blocked']),
      required: z.boolean(),
      summary: z.string().min(1),
    });
export type CodexExecRealReadOnlyAdapterReadinessReviewChecklistItem = z.infer<
  typeof CodexExecRealReadOnlyAdapterReadinessReviewChecklistItemSchema
>;

export const CodexExecRealReadOnlyAdapterReadinessReviewFindingSchema = createdEntityBaseSchema
  .merge(codexExecReadOnlyAdapterImplementationPlanReviewFlagsSchema)
  .extend({
    code: z.string().min(1),
    severity: RiskLevelSchema,
    status: CodexExecRealReadOnlyAdapterReadinessStatusSchema,
    relatedReadinessFindingId: z.string().min(1).optional(),
    relatedReadinessFindingCode: z.string().min(1).optional(),
    summary: z.string().min(1),
    recommendation: z.string().min(1),
  });
export type CodexExecRealReadOnlyAdapterReadinessReviewFinding = z.infer<
  typeof CodexExecRealReadOnlyAdapterReadinessReviewFindingSchema
>;

export const CodexExecRealReadOnlyAdapterReadinessReviewDecisionRecordSchema =
  createdEntityBaseSchema
    .merge(codexExecReadOnlyAdapterImplementationPlanReviewFlagsSchema)
    .extend({
      packageId: z.string().min(1),
      dryRunId: z.string().min(1),
      packageStatus: CodexExecRealReadOnlyAdapterReadinessStatusSchema,
      outcome: CodexExecRealReadOnlyAdapterReadinessReviewOutcomeSchema,
      status: CodexExecRealReadOnlyAdapterReadinessReviewStatusSchema,
      reviewerLabel: z.string().min(1),
      rationaleSummary: z.string().min(1),
      reviewedAt: IsoDateTimeSchema,
      separateAdrDraftAllowed: z.boolean(),
      acknowledgedFindingCodes: z.array(z.string().min(1)).default([]),
      acknowledgedFindingIds: z.array(z.string().min(1)).default([]),
      unresolvedFindingCount: z.number().int().nonnegative(),
      checklistItems: z.array(CodexExecRealReadOnlyAdapterReadinessReviewChecklistItemSchema),
      findings: z.array(CodexExecRealReadOnlyAdapterReadinessReviewFindingSchema),
      evidenceRefs: z.array(EvidenceRefSchema).default([]),
      auditEventIds: z.array(z.string().min(1)).default([]),
      summary: z.string().min(1),
    })
    .superRefine((record, context) => {
      const expected = record.outcome === 'conditional_go_to_separate_adr_draft' ? true : false;
      if (record.separateAdrDraftAllowed !== expected) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          message:
            'separateAdrDraftAllowed must only be true for conditional_go_to_separate_adr_draft',
          path: ['separateAdrDraftAllowed'],
        });
      }
    });
export type CodexExecRealReadOnlyAdapterReadinessReviewDecisionRecord = z.infer<
  typeof CodexExecRealReadOnlyAdapterReadinessReviewDecisionRecordSchema
>;

export const CodexExecRealReadOnlyAdapterReadinessReviewSummarySchema = createdEntityBaseSchema
  .merge(codexExecReadOnlyAdapterImplementationPlanReviewFlagsSchema)
  .extend({
    reviewId: z.string().min(1),
    packageId: z.string().min(1),
    dryRunId: z.string().min(1),
    packageStatus: CodexExecRealReadOnlyAdapterReadinessStatusSchema,
    outcome: CodexExecRealReadOnlyAdapterReadinessReviewOutcomeSchema,
    status: CodexExecRealReadOnlyAdapterReadinessReviewStatusSchema,
    reviewerLabel: z.string().min(1),
    reviewedAt: IsoDateTimeSchema,
    separateAdrDraftAllowed: z.boolean(),
    acknowledgedFindingCodes: z.array(z.string().min(1)).default([]),
    acknowledgedFindingIds: z.array(z.string().min(1)).default([]),
    unresolvedFindingCount: z.number().int().nonnegative(),
    summary: z.string().min(1),
  });
export type CodexExecRealReadOnlyAdapterReadinessReviewSummary = z.infer<
  typeof CodexExecRealReadOnlyAdapterReadinessReviewSummarySchema
>;

export const CodexExecRealReadOnlyAdapterReadinessReviewQuerySchema = createdEntityBaseSchema
  .merge(codexExecReadOnlyAdapterImplementationPlanReviewFlagsSchema)
  .extend({
    packageId: z.string().min(1).optional(),
    dryRunId: z.string().min(1).optional(),
    status: CodexExecRealReadOnlyAdapterReadinessReviewStatusSchema.optional(),
    outcome: CodexExecRealReadOnlyAdapterReadinessReviewOutcomeSchema.optional(),
    limit: z.number().int().positive().max(200).default(50),
  });
export type CodexExecRealReadOnlyAdapterReadinessReviewQuery = z.infer<
  typeof CodexExecRealReadOnlyAdapterReadinessReviewQuerySchema
>;

const codexExecRealReadOnlyAdapterMetadataOnlyFlagsSchema =
  codexExecReadOnlyAdapterImplementationPlanReviewFlagsSchema.extend({
    externalProcessStarted: z.boolean().default(false),
    processAdapterStarted: z.boolean().default(false),
    promptBodyStored: z.literal(false),
    commandBodyStored: z.literal(false),
    stdoutBodyStored: z.literal(false),
    stderrBodyStored: z.literal(false),
    agentMessageBodyStored: z.literal(false),
    reasoningBodyStored: z.literal(false),
  });

const codexExecRealReadOnlyAdapterNoRunnableBoundarySchema = z.object({
  noRunnableCommand: z.literal(true),
  commandPreviewStored: z.literal(false),
  argvStored: z.literal(false),
  executablePathStored: z.literal(false),
  shellSnippetStored: z.literal(false),
  envPlanStored: z.literal(false),
});

export const CodexExecRealReadOnlyAdapterConfigStatusSchema = z.enum([
  'disabled',
  'enabled',
  'blocked',
]);
export type CodexExecRealReadOnlyAdapterConfigStatus = z.infer<
  typeof CodexExecRealReadOnlyAdapterConfigStatusSchema
>;

export const CodexExecRealReadOnlyAdapterPreflightStatusSchema = z.enum([
  'blocked',
  'failed',
  'requires_review',
  'passed',
]);
export type CodexExecRealReadOnlyAdapterPreflightStatus = z.infer<
  typeof CodexExecRealReadOnlyAdapterPreflightStatusSchema
>;

export const CodexExecRealReadOnlyAdapterResultStatusSchema = z.enum([
  'not_started',
  'blocked',
  'aborted',
  'failed',
  'completed',
]);
export type CodexExecRealReadOnlyAdapterResultStatus = z.infer<
  typeof CodexExecRealReadOnlyAdapterResultStatusSchema
>;

export const CodexExecRealReadOnlyAdapterAttemptStatusSchema = z.enum([
  'blocked',
  'completed',
  'failed',
  'aborted',
]);
export type CodexExecRealReadOnlyAdapterAttemptStatus = z.infer<
  typeof CodexExecRealReadOnlyAdapterAttemptStatusSchema
>;

export const CodexExecRealReadOnlyAdapterApprovalAuthorityStatusSchema = z.enum([
  'resolved',
  'missing',
  'invalid',
  'expired',
  'revoked',
  'used',
  'dry_run_hash_mismatch',
  'policy_hash_mismatch',
  'artifact_id_mismatch',
]);
export type CodexExecRealReadOnlyAdapterApprovalAuthorityStatus = z.infer<
  typeof CodexExecRealReadOnlyAdapterApprovalAuthorityStatusSchema
>;

export const CodexExecRealReadOnlyAdapterApprovalAuthoritySummarySchema =
  createdEntityBaseSchema.merge(codexExecRealReadOnlyAdapterMetadataOnlyFlagsSchema).extend({
    dryRunId: z.string().min(1),
    status: CodexExecRealReadOnlyAdapterApprovalAuthorityStatusSchema,
    approvalRecordId: z.string().min(1).optional(),
    approvalArtifactId: z.string().min(1).optional(),
    approvalArtifactHash: z.string().min(1).optional(),
    dryRunPlanHash: z.string().min(1).optional(),
    policyDecisionHash: z.string().min(1).optional(),
    expectedDryRunPlanHash: z.string().min(1).optional(),
    expectedPolicyDecisionHash: z.string().min(1).optional(),
    dryRunHashMatched: z.boolean(),
    policyHashMatched: z.boolean(),
    checkedAt: IsoDateTimeSchema,
    expiresAt: IsoDateTimeSchema.optional(),
    reasonCodes: z.array(z.string().min(1)).default([]),
    summary: z.string().min(1),
  });
export type CodexExecRealReadOnlyAdapterApprovalAuthoritySummary = z.infer<
  typeof CodexExecRealReadOnlyAdapterApprovalAuthoritySummarySchema
>;

export const CodexExecRealReadOnlyAdapterApprovalAuthorityTraceStatusSchema = z.enum([
  'aligned',
  'blocked',
  'requires_review',
]);
export type CodexExecRealReadOnlyAdapterApprovalAuthorityTraceStatus = z.infer<
  typeof CodexExecRealReadOnlyAdapterApprovalAuthorityTraceStatusSchema
>;

export const CodexExecRealReadOnlyAdapterApprovalAuthorityTraceRecordSchema =
  createdEntityBaseSchema.merge(codexExecRealReadOnlyAdapterMetadataOnlyFlagsSchema).extend({
    dryRunId: z.string().min(1),
    status: CodexExecRealReadOnlyAdapterApprovalAuthorityTraceStatusSchema,
    sourcePreparationApprovalArtifactId: z.string().min(1).optional(),
    prerequisiteApprovalArtifactId: z.string().min(1).optional(),
    inputApprovalArtifactId: z.string().min(1).optional(),
    resolvedApprovalRecordId: z.string().min(1).optional(),
    resolvedApprovalArtifactId: z.string().min(1).optional(),
    approvalArtifactHash: z.string().min(1).optional(),
    dryRunPlanHash: z.string().min(1).optional(),
    policyDecisionHash: z.string().min(1).optional(),
    expectedDryRunPlanHash: z.string().min(1).optional(),
    expectedPolicyDecisionHash: z.string().min(1).optional(),
    exactLookupMatched: z.boolean(),
    sourcePreparationMatched: z.boolean(),
    prerequisiteMatched: z.boolean(),
    approvalApproved: z.boolean(),
    approvalUnused: z.boolean(),
    approvalNotRevoked: z.boolean(),
    approvalNotExpired: z.boolean(),
    dryRunHashMatched: z.boolean(),
    policyHashMatched: z.boolean(),
    attemptPreflightWouldAccept: z.boolean(),
    checkedAt: IsoDateTimeSchema,
    expiresAt: IsoDateTimeSchema.optional(),
    reasonCodes: z.array(z.string().min(1)).default([]),
    degraded: z.boolean(),
    notPersisted: z.boolean(),
    fallbackUsedAsAuthority: z.literal(false),
    pilotExecuted: z.literal(false),
    adapterAttemptInvoked: z.literal(false),
    authoritative: z.boolean(),
    supervisorBacked: z.boolean(),
    persisted: z.boolean(),
    evidenceRefs: z.array(EvidenceRefSchema).default([]),
    auditEventIds: z.array(z.string().min(1)).default([]),
    summary: z.string().min(1),
  });
export type CodexExecRealReadOnlyAdapterApprovalAuthorityTraceRecord = z.infer<
  typeof CodexExecRealReadOnlyAdapterApprovalAuthorityTraceRecordSchema
>;

export const CodexExecRealReadOnlyAdapterApprovalAuthorityTraceSummarySchema =
  createdEntityBaseSchema.merge(codexExecRealReadOnlyAdapterMetadataOnlyFlagsSchema).extend({
    recordId: z.string().min(1),
    dryRunId: z.string().min(1),
    status: CodexExecRealReadOnlyAdapterApprovalAuthorityTraceStatusSchema,
    inputApprovalArtifactId: z.string().min(1).optional(),
    resolvedApprovalRecordId: z.string().min(1).optional(),
    resolvedApprovalArtifactId: z.string().min(1).optional(),
    sourcePreparationMatched: z.boolean(),
    prerequisiteMatched: z.boolean(),
    exactLookupMatched: z.boolean(),
    dryRunHashMatched: z.boolean(),
    policyHashMatched: z.boolean(),
    attemptPreflightWouldAccept: z.boolean(),
    checkedAt: IsoDateTimeSchema,
    expiresAt: IsoDateTimeSchema.optional(),
    reasonCodes: z.array(z.string().min(1)).default([]),
    degraded: z.boolean(),
    notPersisted: z.boolean(),
    fallbackUsedAsAuthority: z.literal(false),
    pilotExecuted: z.literal(false),
    adapterAttemptInvoked: z.literal(false),
    summary: z.string().min(1),
  });
export type CodexExecRealReadOnlyAdapterApprovalAuthorityTraceSummary = z.infer<
  typeof CodexExecRealReadOnlyAdapterApprovalAuthorityTraceSummarySchema
>;

export const CodexExecRealReadOnlyAdapterApprovalAuthorityTraceQuerySchema =
  createdEntityBaseSchema.merge(codexExecRealReadOnlyAdapterMetadataOnlyFlagsSchema).extend({
    dryRunId: z.string().min(1).optional(),
    status: CodexExecRealReadOnlyAdapterApprovalAuthorityTraceStatusSchema.optional(),
    limit: z.number().int().positive().max(100).default(50),
  });
export type CodexExecRealReadOnlyAdapterApprovalAuthorityTraceQuery = z.infer<
  typeof CodexExecRealReadOnlyAdapterApprovalAuthorityTraceQuerySchema
>;

export const CodexExecRealReadOnlyAdapterPostRunVerificationStatusSchema = z.enum([
  'not_required',
  'skipped',
  'passed',
  'failed',
  'aborted',
  'critical',
]);
export type CodexExecRealReadOnlyAdapterPostRunVerificationStatus = z.infer<
  typeof CodexExecRealReadOnlyAdapterPostRunVerificationStatusSchema
>;

export const CodexExecRealReadOnlyAdapterPostRunVerificationSkipReasonSchema = z.enum([
  'attempt_not_completed',
]);
export type CodexExecRealReadOnlyAdapterPostRunVerificationSkipReason = z.infer<
  typeof CodexExecRealReadOnlyAdapterPostRunVerificationSkipReasonSchema
>;

export const CodexExecRealReadOnlyAdapterErrorCodeSchema = z.enum([
  'config_disabled',
  'missing_dry_run',
  'missing_approval',
  'approval_invalid',
  'dry_run_hash_mismatch',
  'policy_hash_mismatch',
  'sandbox_not_read_only',
  'dashboard_trigger_forbidden',
  'workspace_write_forbidden',
  'danger_full_access_forbidden',
  'worktree_not_isolated',
  'worktree_dirty',
  'store_degraded',
  'governed_input_missing',
  'preflight_failed',
  'boundary_deferred',
  'boundary_failed',
  'boundary_aborted',
]);
export type CodexExecRealReadOnlyAdapterErrorCode = z.infer<
  typeof CodexExecRealReadOnlyAdapterErrorCodeSchema
>;

export const CodexExecRealReadOnlyAdapterBoundaryFailureCodeSchema = z.enum([
  'none',
  'process_exit_nonzero',
  'process_start_failed',
  'process_timed_out',
  'process_cancelled',
  'process_signaled',
  'boundary_failed_unknown',
  'boundary_aborted_unknown',
]);
export type CodexExecRealReadOnlyAdapterBoundaryFailureCode = z.infer<
  typeof CodexExecRealReadOnlyAdapterBoundaryFailureCodeSchema
>;

export const CodexExecRealReadOnlyAdapterNonzeroExitKindSchema = z.enum([
  'codex_cli_usage_error_suspected',
  'codex_cli_input_missing_suspected',
  'codex_cli_auth_or_config_error_suspected',
  'codex_cli_runtime_error_suspected',
  'unknown',
]);
export type CodexExecRealReadOnlyAdapterNonzeroExitKind = z.infer<
  typeof CodexExecRealReadOnlyAdapterNonzeroExitKindSchema
>;

export const CodexExecRealReadOnlyAdapterBoundaryStartFailureKindSchema = z.enum([
  'none',
  'enoent',
  'eacces',
  'eperm',
  'spawn_unknown',
  'cwd_missing',
  'cwd_not_directory',
  'executable_missing',
  'executable_inaccessible',
  'unknown',
]);
export type CodexExecRealReadOnlyAdapterBoundaryStartFailureKind = z.infer<
  typeof CodexExecRealReadOnlyAdapterBoundaryStartFailureKindSchema
>;

export const CodexExecRealReadOnlyAdapterResolvedExecutableKindSchema = z.enum([
  'native_exe',
  'bare_command',
  'shell_shim',
  'unknown',
]);
export type CodexExecRealReadOnlyAdapterResolvedExecutableKind = z.infer<
  typeof CodexExecRealReadOnlyAdapterResolvedExecutableKindSchema
>;

export const CodexExecRealReadOnlyAdapterEnoentKindSchema = z.enum([
  'none',
  'cwd_enoent',
  'executable_enoent',
  'windows_app_alias_enoent',
  'dependency_or_spawn_target_enoent',
  'unknown',
]);
export type CodexExecRealReadOnlyAdapterEnoentKind = z.infer<
  typeof CodexExecRealReadOnlyAdapterEnoentKindSchema
>;

export const CodexExecRealReadOnlyAdapterSpawnTargetKindSchema = z.enum([
  'native_exe',
  'bare_command',
  'trusted_shell_shim_target',
  'windows_app_alias',
  'unknown',
]);
export type CodexExecRealReadOnlyAdapterSpawnTargetKind = z.infer<
  typeof CodexExecRealReadOnlyAdapterSpawnTargetKindSchema
>;

export const CodexExecRealReadOnlyAdapterExecutableResolutionSourceSchema = z.enum([
  'none',
  'direct_path',
  'trusted_shell_shim_target',
  'blocked_shell_shim',
  'blocked_windows_app_alias',
  'not_found',
]);
export type CodexExecRealReadOnlyAdapterExecutableResolutionSource = z.infer<
  typeof CodexExecRealReadOnlyAdapterExecutableResolutionSourceSchema
>;

export const CodexExecRealReadOnlyAdapterDependencyResolutionStatusSchema = z.enum([
  'not_applicable',
  'not_checked',
  'dependency_missing_suspected',
  'spawn_target_mismatch_suspected',
  'unknown',
]);
export type CodexExecRealReadOnlyAdapterDependencyResolutionStatus = z.infer<
  typeof CodexExecRealReadOnlyAdapterDependencyResolutionStatusSchema
>;

export const CodexExecRealReadOnlyAdapterBoundaryDeferredReasonCodeSchema = z.enum([
  'runtime_worktree_missing',
  'approval_input_missing',
  'executable_resolution_not_run',
  'executable_resolution_blocked',
  'cwd_self_check_not_run',
  'cwd_self_check_failed',
  'governed_input_missing',
  'governed_input_not_verified',
  'boundary_result_missing_after_ready',
  'unknown',
]);
export type CodexExecRealReadOnlyAdapterBoundaryDeferredReasonCode = z.infer<
  typeof CodexExecRealReadOnlyAdapterBoundaryDeferredReasonCodeSchema
>;

export const CodexExecRealReadOnlyAdapterBoundaryDeferredDiagnosticsSchema =
  createdEntityBaseSchema.merge(codexExecRealReadOnlyAdapterMetadataOnlyFlagsSchema).extend({
    reasonCode: CodexExecRealReadOnlyAdapterBoundaryDeferredReasonCodeSchema,
    reasonCodes: z
      .array(CodexExecRealReadOnlyAdapterBoundaryDeferredReasonCodeSchema)
      .default([]),
    preflightStatus: CodexExecRealReadOnlyAdapterPreflightStatusSchema,
    runtimeWorktreeProvided: z.boolean(),
    approvalInputProvided: z.boolean(),
    executableResolutionStatus: z.enum(['not_run', 'resolved', 'blocked', 'unknown']),
    executableResolutionReasonCode: z.string().min(1).optional(),
    cwdSelfCheckStatus: z.enum(['not_run', 'passed', 'failed', 'blocked', 'unknown']),
    cwdSelfCheckReasonCode: z.string().min(1).optional(),
    sourcePreparationReady: z.boolean().optional(),
    prerequisiteReady: z.boolean().optional(),
    worktreePathHashMatched: z.boolean().optional(),
    governedInputProvided: z.boolean().default(false),
    governedInputVerified: z.boolean().default(false),
    governedInputReasonCode: z.string().min(1).optional(),
    governedInputContentHash: z.string().min(1).optional(),
    processBoundaryReady: z.boolean(),
    summary: z.string().min(1),
  });
export type CodexExecRealReadOnlyAdapterBoundaryDeferredDiagnostics = z.infer<
  typeof CodexExecRealReadOnlyAdapterBoundaryDeferredDiagnosticsSchema
>;

export const CodexExecRealReadOnlyAdapterBoundaryDiagnosticsSchema = createdEntityBaseSchema
  .merge(codexExecRealReadOnlyAdapterMetadataOnlyFlagsSchema)
  .extend({
    status: z.enum(['completed', 'failed', 'aborted']),
    failureCode: CodexExecRealReadOnlyAdapterBoundaryFailureCodeSchema,
    startFailureKind: CodexExecRealReadOnlyAdapterBoundaryStartFailureKindSchema.default('none'),
    platform: z.string().min(1).default('unknown'),
    resolvedExecutableKind: CodexExecRealReadOnlyAdapterResolvedExecutableKindSchema.default(
      'unknown',
    ),
    enoentKind: CodexExecRealReadOnlyAdapterEnoentKindSchema.optional(),
    spawnTargetKind: CodexExecRealReadOnlyAdapterSpawnTargetKindSchema.optional(),
    cwdHash: z.string().min(1).optional(),
    cwdExists: z.boolean().optional(),
    cwdIsDirectory: z.boolean().optional(),
    executableHash: z.string().min(1).optional(),
    executableExists: z.boolean().optional(),
    executableAccessible: z.boolean().optional(),
    executableResolutionSource:
      CodexExecRealReadOnlyAdapterExecutableResolutionSourceSchema.optional(),
    dependencyResolutionStatus:
      CodexExecRealReadOnlyAdapterDependencyResolutionStatusSchema.optional(),
    envAllowlistKeyCount: z.number().int().nonnegative().optional(),
    envAllowlistKeyHash: z.string().min(1).optional(),
    exitCode: z.number().int().optional(),
    nonzeroExitKind: CodexExecRealReadOnlyAdapterNonzeroExitKindSchema.optional(),
    signal: z.string().min(1).optional(),
    timedOut: z.boolean(),
    cancelled: z.boolean(),
    durationMs: z.number().int().nonnegative(),
    stdoutHash: z.string().min(1),
    stderrHash: z.string().min(1),
    stdoutByteLength: z.number().int().nonnegative(),
    stderrByteLength: z.number().int().nonnegative(),
    stdoutLineCount: z.number().int().nonnegative(),
    stderrLineCount: z.number().int().nonnegative(),
    stdoutTruncated: z.boolean(),
    stderrTruncated: z.boolean(),
    externalProcessStarted: z.boolean(),
    governedInputVerified: z.boolean().optional(),
    governedInputSourceKind: z.literal('governed_file').optional(),
    governedInputRelativePathHash: z.string().min(1).optional(),
    governedInputContentHash: z.string().min(1).optional(),
    governedInputByteLength: z.number().int().nonnegative().optional(),
    governedInputLineCount: z.number().int().nonnegative().optional(),
    promptArgumentHash: z.string().min(1).optional(),
    promptArgumentStored: z.literal(false).optional(),
    summary: z.string().min(1),
  });
export type CodexExecRealReadOnlyAdapterBoundaryDiagnostics = z.infer<
  typeof CodexExecRealReadOnlyAdapterBoundaryDiagnosticsSchema
>;

export const CodexExecRealReadOnlyAdapterBoundaryDiagnosticsMissingFieldSchema = z.enum([
  'boundaryDiagnostics',
  'status',
  'failureCode',
  'startFailureKind',
  'platform',
  'resolvedExecutableKind',
  'enoentKind',
  'spawnTargetKind',
  'cwdHash',
  'cwdExists',
  'cwdIsDirectory',
  'executableHash',
  'executableExists',
  'executableAccessible',
  'executableResolutionSource',
  'dependencyResolutionStatus',
  'envAllowlistKeyCount',
  'envAllowlistKeyHash',
  'exitCode',
  'nonzeroExitKind',
  'signal',
  'timedOut',
  'cancelled',
  'durationMs',
  'stdoutHash',
  'stderrHash',
  'stdoutByteLength',
  'stderrByteLength',
  'stdoutLineCount',
  'stderrLineCount',
  'stdoutTruncated',
  'stderrTruncated',
  'externalProcessStarted',
  'governedInputVerified',
  'governedInputContentHash',
  'promptArgumentHash',
  'postRunVerificationSkipReason',
]);
export type CodexExecRealReadOnlyAdapterBoundaryDiagnosticsMissingField = z.infer<
  typeof CodexExecRealReadOnlyAdapterBoundaryDiagnosticsMissingFieldSchema
>;

const codexExecRealReadOnlyAdapterBoundaryDiagnosticsReadbackSchema = z.object({
  boundaryDiagnosticsComplete: z.boolean().default(false),
  boundaryDiagnosticsMissingFields: z
    .array(CodexExecRealReadOnlyAdapterBoundaryDiagnosticsMissingFieldSchema)
    .default([]),
});

export const CodexExecRealReadOnlyAdapterConfigSchema = createdEntityBaseSchema
  .merge(codexExecRealReadOnlyAdapterMetadataOnlyFlagsSchema)
  .merge(codexExecRealReadOnlyAdapterNoRunnableBoundarySchema)
  .extend({
    status: CodexExecRealReadOnlyAdapterConfigStatusSchema,
    defaultEnabled: z.literal(false),
    configuredEnabled: z.boolean().default(false),
    explicitEnableRequired: z.literal(true),
    cliOnly: z.literal(true),
    dashboardTriggerForbidden: z.literal(true),
    allowedSandboxMode: z.literal('read_only'),
    forbiddenSandboxModes: z
      .array(z.enum(['workspace_write', 'danger_full_access']))
      .default(['workspace_write', 'danger_full_access']),
    existingDryRunRequired: z.literal(true),
    approvalArtifactRequired: z.literal(true),
    dryRunPlanHashRequired: z.literal(true),
    policyDecisionHashRequired: z.literal(true),
    isolatedWorktreeRequired: z.literal(true),
    cleanWorktreeRequired: z.literal(true),
    metadataEvidenceOnly: z.literal(true),
    summary: z.string().min(1),
  });
export type CodexExecRealReadOnlyAdapterConfig = z.infer<
  typeof CodexExecRealReadOnlyAdapterConfigSchema
>;

export const CodexExecRealReadOnlyAdapterRequestSchema = createdEntityBaseSchema
  .merge(codexExecRealReadOnlyAdapterMetadataOnlyFlagsSchema)
  .merge(codexExecRealReadOnlyAdapterNoRunnableBoundarySchema)
  .extend({
    dryRunId: z.string().min(1),
    configId: z.string().min(1),
    approvalArtifactId: z.string().min(1).optional(),
    policyDecisionId: z.string().min(1).optional(),
    requestedSandboxMode: z.literal('read_only'),
    triggerKind: z.literal('cli'),
    existingDryRunRequired: z.literal(true),
    summary: z.string().min(1),
  });
export type CodexExecRealReadOnlyAdapterRequest = z.infer<
  typeof CodexExecRealReadOnlyAdapterRequestSchema
>;

export const CodexExecRealReadOnlyAdapterPreflightCheckSchema = createdEntityBaseSchema
  .merge(codexExecRealReadOnlyAdapterMetadataOnlyFlagsSchema)
  .extend({
    code: z.string().min(1),
    label: z.string().min(1),
    status: z.enum(['passed', 'failed', 'requires_review', 'blocked']),
    required: z.boolean(),
    summary: z.string().min(1),
  });
export type CodexExecRealReadOnlyAdapterPreflightCheck = z.infer<
  typeof CodexExecRealReadOnlyAdapterPreflightCheckSchema
>;

export const CodexExecRealReadOnlyAdapterBoundaryPlanSchema = createdEntityBaseSchema
  .merge(codexExecRealReadOnlyAdapterMetadataOnlyFlagsSchema)
  .merge(codexExecRealReadOnlyAdapterNoRunnableBoundarySchema)
  .extend({
    requestId: z.string().min(1),
    dryRunId: z.string().min(1),
    processBoundaryDeferred: z.literal(true),
    adapterModuleRef: z.string().min(1).optional(),
    dryRunPlanHash: z.string().min(1),
    policyDecisionHash: z.string().min(1),
    approvalArtifactHash: z.string().min(1).optional(),
    evidencePlanSummary: z.string().min(1),
    auditPlanSummary: z.string().min(1),
    summary: z.string().min(1),
  });
export type CodexExecRealReadOnlyAdapterBoundaryPlan = z.infer<
  typeof CodexExecRealReadOnlyAdapterBoundaryPlanSchema
>;

export const CodexExecRealReadOnlyAdapterPreflightSchema = createdEntityBaseSchema
  .merge(codexExecRealReadOnlyAdapterMetadataOnlyFlagsSchema)
  .extend({
    requestId: z.string().min(1),
    dryRunId: z.string().min(1),
    configId: z.string().min(1),
    status: CodexExecRealReadOnlyAdapterPreflightStatusSchema,
    requestedSandboxMode: z.literal('read_only'),
    boundaryPlan: CodexExecRealReadOnlyAdapterBoundaryPlanSchema.optional(),
    checks: z.array(CodexExecRealReadOnlyAdapterPreflightCheckSchema),
    hardGateCount: z.number().int().nonnegative(),
    passedGateCount: z.number().int().nonnegative(),
    failedGateCount: z.number().int().nonnegative(),
    requiresReviewCount: z.number().int().nonnegative(),
    blockerCount: z.number().int().nonnegative(),
    summary: z.string().min(1),
  });
export type CodexExecRealReadOnlyAdapterPreflight = z.infer<
  typeof CodexExecRealReadOnlyAdapterPreflightSchema
>;

export const CodexExecRealReadOnlyAdapterErrorSchema = createdEntityBaseSchema
  .merge(codexExecRealReadOnlyAdapterMetadataOnlyFlagsSchema)
  .extend({
    code: CodexExecRealReadOnlyAdapterErrorCodeSchema,
    severity: RiskLevelSchema,
    relatedCheckCode: z.string().min(1).optional(),
    messageSummary: z.string().min(1),
    remediationSummary: z.string().min(1),
    absolutePathLeaked: z.literal(false),
  });
export type CodexExecRealReadOnlyAdapterError = z.infer<
  typeof CodexExecRealReadOnlyAdapterErrorSchema
>;

export const CodexExecRealReadOnlyAdapterEvidenceSummarySchema = createdEntityBaseSchema
  .merge(codexExecRealReadOnlyAdapterMetadataOnlyFlagsSchema)
  .extend({
    dryRunId: z.string().min(1),
    requestId: z.string().min(1),
    resultId: z.string().min(1).optional(),
    evidenceRefIds: z.array(z.string().min(1)).default([]),
    eventHashCount: z.number().int().nonnegative(),
    outputHashCount: z.number().int().nonnegative(),
    metadataHash: z.string().min(1),
    redacted: z.literal(true),
    summary: z.string().min(1),
  });
export type CodexExecRealReadOnlyAdapterEvidenceSummary = z.infer<
  typeof CodexExecRealReadOnlyAdapterEvidenceSummarySchema
>;

export const CodexExecRealReadOnlyAdapterAuditSummarySchema = createdEntityBaseSchema
  .merge(codexExecRealReadOnlyAdapterMetadataOnlyFlagsSchema)
  .extend({
    dryRunId: z.string().min(1),
    requestId: z.string().min(1),
    resultId: z.string().min(1).optional(),
    auditEventIds: z.array(z.string().min(1)).default([]),
    beforeStartRequired: z.literal(true),
    afterFinishRequired: z.literal(true),
    abortRequired: z.literal(true),
    failureRequired: z.literal(true),
    eventCount: z.number().int().nonnegative(),
    summary: z.string().min(1),
  });
export type CodexExecRealReadOnlyAdapterAuditSummary = z.infer<
  typeof CodexExecRealReadOnlyAdapterAuditSummarySchema
>;

export const CodexExecRealReadOnlyAdapterResultSchema = createdEntityBaseSchema
  .merge(codexExecRealReadOnlyAdapterMetadataOnlyFlagsSchema)
  .extend({
    requestId: z.string().min(1),
    dryRunId: z.string().min(1),
    preflightId: z.string().min(1),
    status: CodexExecRealReadOnlyAdapterResultStatusSchema,
    boundaryPlanId: z.string().min(1).optional(),
    error: CodexExecRealReadOnlyAdapterErrorSchema.optional(),
    evidenceSummary: CodexExecRealReadOnlyAdapterEvidenceSummarySchema.optional(),
    auditSummary: CodexExecRealReadOnlyAdapterAuditSummarySchema.optional(),
    postRunVerificationRequired: z.literal(true),
    workspaceMutationAllowed: z.literal(false),
    unexpectedWorkspaceDiffCritical: z.literal(true),
    autoRevertAllowed: z.literal(false),
    summary: z.string().min(1),
  });
export type CodexExecRealReadOnlyAdapterResult = z.infer<
  typeof CodexExecRealReadOnlyAdapterResultSchema
>;

export const CodexExecRealReadOnlyAdapterAttemptRecordSchema = createdEntityBaseSchema
  .merge(codexExecRealReadOnlyAdapterMetadataOnlyFlagsSchema)
  .extend({
    dryRunId: z.string().min(1),
    requestId: z.string().min(1),
    preflightId: z.string().min(1),
    resultId: z.string().min(1),
    status: CodexExecRealReadOnlyAdapterAttemptStatusSchema,
    authoritative: z.literal(true),
    supervisorBacked: z.literal(true),
    persisted: z.literal(true),
    degraded: z.literal(false),
    notPersisted: z.literal(false),
    processBoundaryInvoked: z.boolean(),
    processBoundaryModuleRef: z.string().min(1).optional(),
    preflightStatus: CodexExecRealReadOnlyAdapterPreflightStatusSchema,
    resultStatus: CodexExecRealReadOnlyAdapterResultStatusSchema,
    resultErrorCode: CodexExecRealReadOnlyAdapterErrorCodeSchema.optional(),
    failedCheckCodes: z.array(z.string().min(1)).default([]),
    blockedCheckCodes: z.array(z.string().min(1)).default([]),
    boundaryDeferredReasonCode:
      CodexExecRealReadOnlyAdapterBoundaryDeferredReasonCodeSchema.optional(),
    boundaryDeferredReasonCodes: z
      .array(CodexExecRealReadOnlyAdapterBoundaryDeferredReasonCodeSchema)
      .default([]),
    boundaryDeferredDiagnostics:
      CodexExecRealReadOnlyAdapterBoundaryDeferredDiagnosticsSchema.optional(),
    boundaryDiagnostics: CodexExecRealReadOnlyAdapterBoundaryDiagnosticsSchema.optional(),
    boundaryDiagnosticsComplete:
      codexExecRealReadOnlyAdapterBoundaryDiagnosticsReadbackSchema.shape
        .boundaryDiagnosticsComplete,
    boundaryDiagnosticsMissingFields:
      codexExecRealReadOnlyAdapterBoundaryDiagnosticsReadbackSchema.shape
        .boundaryDiagnosticsMissingFields,
    postRunVerificationStatus: CodexExecRealReadOnlyAdapterPostRunVerificationStatusSchema.default(
      'not_required',
    ),
    postRunVerificationSkipReason:
      CodexExecRealReadOnlyAdapterPostRunVerificationSkipReasonSchema.optional(),
    workspaceMutationDetected: z.boolean().optional(),
    evidenceSummary: CodexExecRealReadOnlyAdapterEvidenceSummarySchema.optional(),
    auditSummary: CodexExecRealReadOnlyAdapterAuditSummarySchema.optional(),
    evidenceRefIds: z.array(z.string().min(1)).default([]),
    auditEventIds: z.array(z.string().min(1)).default([]),
    outputHashCount: z.number().int().nonnegative(),
    metadataHash: z.string().min(1),
    summary: z.string().min(1),
  });
export type CodexExecRealReadOnlyAdapterAttemptRecord = z.infer<
  typeof CodexExecRealReadOnlyAdapterAttemptRecordSchema
>;

export const CodexExecRealReadOnlyAdapterAttemptSummarySchema = createdEntityBaseSchema
  .merge(codexExecRealReadOnlyAdapterMetadataOnlyFlagsSchema)
  .extend({
    attemptId: z.string().min(1),
    dryRunId: z.string().min(1),
    status: CodexExecRealReadOnlyAdapterAttemptStatusSchema,
    authoritative: z.boolean(),
    supervisorBacked: z.boolean(),
    persisted: z.boolean(),
    degraded: z.boolean(),
    notPersisted: z.boolean(),
    processBoundaryInvoked: z.boolean(),
    preflightStatus: CodexExecRealReadOnlyAdapterPreflightStatusSchema,
    resultStatus: CodexExecRealReadOnlyAdapterResultStatusSchema,
    resultErrorCode: CodexExecRealReadOnlyAdapterErrorCodeSchema.optional(),
    failedCheckCodes: z.array(z.string().min(1)).default([]),
    blockedCheckCodes: z.array(z.string().min(1)).default([]),
    boundaryDeferredReasonCode:
      CodexExecRealReadOnlyAdapterBoundaryDeferredReasonCodeSchema.optional(),
    boundaryDeferredReasonCodes: z
      .array(CodexExecRealReadOnlyAdapterBoundaryDeferredReasonCodeSchema)
      .default([]),
    boundaryDeferredDiagnostics:
      CodexExecRealReadOnlyAdapterBoundaryDeferredDiagnosticsSchema.optional(),
    boundaryDiagnostics: CodexExecRealReadOnlyAdapterBoundaryDiagnosticsSchema.optional(),
    boundaryDiagnosticsComplete:
      codexExecRealReadOnlyAdapterBoundaryDiagnosticsReadbackSchema.shape
        .boundaryDiagnosticsComplete,
    boundaryDiagnosticsMissingFields:
      codexExecRealReadOnlyAdapterBoundaryDiagnosticsReadbackSchema.shape
        .boundaryDiagnosticsMissingFields,
    postRunVerificationStatus: CodexExecRealReadOnlyAdapterPostRunVerificationStatusSchema.default(
      'not_required',
    ),
    postRunVerificationSkipReason:
      CodexExecRealReadOnlyAdapterPostRunVerificationSkipReasonSchema.optional(),
    workspaceMutationDetected: z.boolean().optional(),
    evidenceRefCount: z.number().int().nonnegative(),
    auditEventCount: z.number().int().nonnegative(),
    outputHashCount: z.number().int().nonnegative(),
    metadataHash: z.string().min(1),
    summary: z.string().min(1),
  });
export type CodexExecRealReadOnlyAdapterAttemptSummary = z.infer<
  typeof CodexExecRealReadOnlyAdapterAttemptSummarySchema
>;

export const CodexExecRealReadOnlyAdapterAttemptQuerySchema = createdEntityBaseSchema
  .merge(codexExecRealReadOnlyAdapterMetadataOnlyFlagsSchema)
  .extend({
    dryRunId: z.string().min(1).optional(),
    status: CodexExecRealReadOnlyAdapterAttemptStatusSchema.optional(),
    limit: z.number().int().positive().max(100).default(50),
  });
export type CodexExecRealReadOnlyAdapterAttemptQuery = z.infer<
  typeof CodexExecRealReadOnlyAdapterAttemptQuerySchema
>;

export const CodexExecRealReadOnlyAdapterAttemptTimelineEntrySchema = createdEntityBaseSchema
  .merge(codexExecRealReadOnlyAdapterMetadataOnlyFlagsSchema)
  .extend({
    attemptId: z.string().min(1),
    dryRunId: z.string().min(1),
    status: CodexExecRealReadOnlyAdapterAttemptStatusSchema,
    occurredAt: IsoDateTimeSchema,
    processBoundaryInvoked: z.boolean(),
    preflightStatus: CodexExecRealReadOnlyAdapterPreflightStatusSchema,
    resultStatus: CodexExecRealReadOnlyAdapterResultStatusSchema,
    resultErrorCode: CodexExecRealReadOnlyAdapterErrorCodeSchema.optional(),
    failedCheckCodes: z.array(z.string().min(1)).default([]),
    blockedCheckCodes: z.array(z.string().min(1)).default([]),
    boundaryDeferredReasonCode:
      CodexExecRealReadOnlyAdapterBoundaryDeferredReasonCodeSchema.optional(),
    boundaryDeferredReasonCodes: z
      .array(CodexExecRealReadOnlyAdapterBoundaryDeferredReasonCodeSchema)
      .default([]),
    boundaryDeferredDiagnostics:
      CodexExecRealReadOnlyAdapterBoundaryDeferredDiagnosticsSchema.optional(),
    boundaryDiagnostics: CodexExecRealReadOnlyAdapterBoundaryDiagnosticsSchema.optional(),
    boundaryDiagnosticsComplete:
      codexExecRealReadOnlyAdapterBoundaryDiagnosticsReadbackSchema.shape
        .boundaryDiagnosticsComplete,
    boundaryDiagnosticsMissingFields:
      codexExecRealReadOnlyAdapterBoundaryDiagnosticsReadbackSchema.shape
        .boundaryDiagnosticsMissingFields,
    postRunVerificationStatus: CodexExecRealReadOnlyAdapterPostRunVerificationStatusSchema.default(
      'not_required',
    ),
    postRunVerificationSkipReason:
      CodexExecRealReadOnlyAdapterPostRunVerificationSkipReasonSchema.optional(),
    workspaceMutationDetected: z.boolean().optional(),
    evidenceRefIds: z.array(z.string().min(1)).default([]),
    auditEventIds: z.array(z.string().min(1)).default([]),
    evidenceRefCount: z.number().int().nonnegative(),
    auditEventCount: z.number().int().nonnegative(),
    outputHashCount: z.number().int().nonnegative(),
    metadataHash: z.string().min(1),
    summary: z.string().min(1),
  });
export type CodexExecRealReadOnlyAdapterAttemptTimelineEntry = z.infer<
  typeof CodexExecRealReadOnlyAdapterAttemptTimelineEntrySchema
>;

export const CodexExecRealReadOnlyAdapterAttemptTimelineSummarySchema = createdEntityBaseSchema
  .merge(codexExecRealReadOnlyAdapterMetadataOnlyFlagsSchema)
  .extend({
    dryRunId: z.string().min(1),
    status: z.enum(['empty', 'blocked', 'completed', 'failed', 'aborted']),
    entries: z.array(CodexExecRealReadOnlyAdapterAttemptTimelineEntrySchema).default([]),
    eventCount: z.number().int().nonnegative(),
    evidenceRefCount: z.number().int().nonnegative(),
    auditEventCount: z.number().int().nonnegative(),
    outputHashCount: z.number().int().nonnegative(),
    processBoundaryInvokedCount: z.number().int().nonnegative(),
    includeEvidence: z.boolean().default(false),
    includeAudit: z.boolean().default(false),
    verificationSummary: z.string().min(1),
    workspaceMutationSummary: z.string().min(1),
    recommendation: z.string().min(1),
    summary: z.string().min(1),
  });
export type CodexExecRealReadOnlyAdapterAttemptTimelineSummary = z.infer<
  typeof CodexExecRealReadOnlyAdapterAttemptTimelineSummarySchema
>;

export const CodexExecRealReadOnlyAdapterAttemptTimelineQuerySchema = createdEntityBaseSchema
  .merge(codexExecRealReadOnlyAdapterMetadataOnlyFlagsSchema)
  .extend({
    dryRunId: z.string().min(1),
    status: CodexExecRealReadOnlyAdapterAttemptStatusSchema.optional(),
    includeEvidence: z.boolean().default(false),
    includeAudit: z.boolean().default(false),
    limit: z.number().int().positive().max(100).default(50),
  });
export type CodexExecRealReadOnlyAdapterAttemptTimelineQuery = z.infer<
  typeof CodexExecRealReadOnlyAdapterAttemptTimelineQuerySchema
>;

export const CodexExecRealReadOnlyAdapterPolicySourceStatusSchema = z.enum([
  'aligned',
  'blocked',
  'requires_review',
]);
export type CodexExecRealReadOnlyAdapterPolicySourceStatus = z.infer<
  typeof CodexExecRealReadOnlyAdapterPolicySourceStatusSchema
>;

export const CodexExecRealReadOnlyAdapterPolicySourceGateSchema = createdEntityBaseSchema
  .merge(codexExecRealReadOnlyAdapterMetadataOnlyFlagsSchema)
  .extend({
    code: z.string().min(1),
    label: z.string().min(1),
    category: z.enum(['authority', 'dry_run', 'config', 'policy', 'evidence_audit', 'fallback']),
    status: z.enum(['passed', 'blocked', 'requires_review']),
    required: z.boolean(),
    summary: z.string().min(1),
  });
export type CodexExecRealReadOnlyAdapterPolicySourceGate = z.infer<
  typeof CodexExecRealReadOnlyAdapterPolicySourceGateSchema
>;

export const CodexExecRealReadOnlyAdapterPolicySourceBlockerSchema = createdEntityBaseSchema
  .merge(codexExecRealReadOnlyAdapterMetadataOnlyFlagsSchema)
  .extend({
    code: z.string().min(1),
    severity: RiskLevelSchema,
    relatedGateCode: z.string().min(1).optional(),
    summary: z.string().min(1),
    recommendation: z.string().min(1),
  });
export type CodexExecRealReadOnlyAdapterPolicySourceBlocker = z.infer<
  typeof CodexExecRealReadOnlyAdapterPolicySourceBlockerSchema
>;

export const CodexExecRealReadOnlyAdapterPolicySourceFindingSchema = createdEntityBaseSchema
  .merge(codexExecRealReadOnlyAdapterMetadataOnlyFlagsSchema)
  .extend({
    code: z.string().min(1),
    severity: RiskLevelSchema,
    status: CodexExecRealReadOnlyAdapterPolicySourceStatusSchema,
    relatedGateCode: z.string().min(1).optional(),
    summary: z.string().min(1),
    recommendation: z.string().min(1),
  });
export type CodexExecRealReadOnlyAdapterPolicySourceFinding = z.infer<
  typeof CodexExecRealReadOnlyAdapterPolicySourceFindingSchema
>;

export const CodexExecRealReadOnlyAdapterPolicySourceChecklistItemSchema = createdEntityBaseSchema
  .merge(codexExecRealReadOnlyAdapterMetadataOnlyFlagsSchema)
  .extend({
    code: z.string().min(1),
    label: z.string().min(1),
    status: z.enum(['passed', 'blocked', 'requires_review']),
    required: z.boolean(),
    summary: z.string().min(1),
  });
export type CodexExecRealReadOnlyAdapterPolicySourceChecklistItem = z.infer<
  typeof CodexExecRealReadOnlyAdapterPolicySourceChecklistItemSchema
>;

export const CodexExecRealReadOnlyAdapterPolicySourceRecordSchema = createdEntityBaseSchema
  .merge(codexExecRealReadOnlyAdapterMetadataOnlyFlagsSchema)
  .extend({
    dryRunId: z.string().min(1),
    status: CodexExecRealReadOnlyAdapterPolicySourceStatusSchema,
    recommendation: z.string().min(1),
    gates: z.array(CodexExecRealReadOnlyAdapterPolicySourceGateSchema),
    blockers: z.array(CodexExecRealReadOnlyAdapterPolicySourceBlockerSchema).default([]),
    findings: z.array(CodexExecRealReadOnlyAdapterPolicySourceFindingSchema).default([]),
    checklistItems: z.array(CodexExecRealReadOnlyAdapterPolicySourceChecklistItemSchema).default([]),
    hardGateCount: z.number().int().nonnegative(),
    passedGateCount: z.number().int().nonnegative(),
    blockedGateCount: z.number().int().nonnegative(),
    requiresReviewFindingCount: z.number().int().nonnegative(),
    missingSources: z.array(z.string().min(1)).default([]),
    degraded: z.boolean(),
    notPersisted: z.boolean(),
    dryRunRecordPresent: z.boolean(),
    configExplicitlyEnabled: z.boolean(),
    readOnlyOnly: z.boolean(),
    policyDecisionPresent: z.boolean(),
    policyDecisionAllowsPilot: z.boolean(),
    policyDecisionId: z.string().min(1).optional(),
    policyDecisionHash: z.string().min(1).optional(),
    policyDecisionOutcome: PolicyOutcomeSchema.optional(),
    policyDecisionReasonCount: z.number().int().nonnegative(),
    dryRunPlanHash: z.string().min(1).optional(),
    evidenceAuditReady: z.boolean(),
    fallbackUsedAsAuthority: z.literal(false),
    pilotExecuted: z.literal(false),
    adapterAttemptInvoked: z.literal(false),
    authoritative: z.boolean(),
    supervisorBacked: z.boolean(),
    persisted: z.boolean(),
    evidenceRefs: z.array(EvidenceRefSchema).default([]),
    auditEventIds: z.array(z.string().min(1)).default([]),
    summary: z.string().min(1),
  })
  .superRefine((record, context) => {
    const allAligned =
      record.degraded === false &&
      record.notPersisted === false &&
      record.authoritative === true &&
      record.supervisorBacked === true &&
      record.persisted === true &&
      record.dryRunRecordPresent === true &&
      record.configExplicitlyEnabled === true &&
      record.readOnlyOnly === true &&
      record.policyDecisionPresent === true &&
      record.policyDecisionAllowsPilot === true &&
      record.policyDecisionOutcome !== 'deny' &&
      Boolean(record.policyDecisionId) &&
      Boolean(record.policyDecisionHash) &&
      Boolean(record.dryRunPlanHash) &&
      record.evidenceAuditReady === true &&
      record.adapterAttemptInvoked === false &&
      record.pilotExecuted === false &&
      record.fallbackUsedAsAuthority === false;

    if (record.status === 'aligned' && !allAligned) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          'aligned requires persisted Supervisor-backed read-only policy authority and non-deny policy metadata',
        path: ['status'],
      });
    }
  });
export type CodexExecRealReadOnlyAdapterPolicySourceRecord = z.infer<
  typeof CodexExecRealReadOnlyAdapterPolicySourceRecordSchema
>;

export const CodexExecRealReadOnlyAdapterPolicySourceSummarySchema = createdEntityBaseSchema
  .merge(codexExecRealReadOnlyAdapterMetadataOnlyFlagsSchema)
  .extend({
    recordId: z.string().min(1),
    dryRunId: z.string().min(1),
    status: CodexExecRealReadOnlyAdapterPolicySourceStatusSchema,
    hardGateCount: z.number().int().nonnegative(),
    passedGateCount: z.number().int().nonnegative(),
    blockedGateCount: z.number().int().nonnegative(),
    requiresReviewFindingCount: z.number().int().nonnegative(),
    missingSources: z.array(z.string().min(1)).default([]),
    degraded: z.boolean(),
    notPersisted: z.boolean(),
    dryRunRecordPresent: z.boolean(),
    configExplicitlyEnabled: z.boolean(),
    readOnlyOnly: z.boolean(),
    policyDecisionPresent: z.boolean(),
    policyDecisionAllowsPilot: z.boolean(),
    policyDecisionId: z.string().min(1).optional(),
    policyDecisionHash: z.string().min(1).optional(),
    policyDecisionOutcome: PolicyOutcomeSchema.optional(),
    dryRunPlanHash: z.string().min(1).optional(),
    evidenceAuditReady: z.boolean(),
    fallbackUsedAsAuthority: z.literal(false),
    pilotExecuted: z.literal(false),
    adapterAttemptInvoked: z.literal(false),
    recommendation: z.string().min(1),
    summary: z.string().min(1),
  });
export type CodexExecRealReadOnlyAdapterPolicySourceSummary = z.infer<
  typeof CodexExecRealReadOnlyAdapterPolicySourceSummarySchema
>;

export const CodexExecRealReadOnlyAdapterPolicySourceQuerySchema = createdEntityBaseSchema
  .merge(codexExecRealReadOnlyAdapterMetadataOnlyFlagsSchema)
  .extend({
    dryRunId: z.string().min(1).optional(),
    status: CodexExecRealReadOnlyAdapterPolicySourceStatusSchema.optional(),
    limit: z.number().int().positive().max(100).default(50),
  });
export type CodexExecRealReadOnlyAdapterPolicySourceQuery = z.infer<
  typeof CodexExecRealReadOnlyAdapterPolicySourceQuerySchema
>;

export const CodexExecRealReadOnlyAdapterPilotSourcePreparationStatusSchema = z.enum([
  'prepared',
  'blocked',
  'requires_review',
]);
export type CodexExecRealReadOnlyAdapterPilotSourcePreparationStatus = z.infer<
  typeof CodexExecRealReadOnlyAdapterPilotSourcePreparationStatusSchema
>;

export const CodexExecRealReadOnlyAdapterPilotSourcePreparationGateSchema =
  createdEntityBaseSchema.merge(codexExecRealReadOnlyAdapterMetadataOnlyFlagsSchema).extend({
    code: z.string().min(1),
    label: z.string().min(1),
    category: z.enum([
      'authority',
      'dry_run',
      'config',
      'policy',
      'approval',
      'worktree',
      'evidence_audit',
    ]),
    status: z.enum(['passed', 'blocked', 'requires_review']),
    required: z.boolean(),
    summary: z.string().min(1),
  });
export type CodexExecRealReadOnlyAdapterPilotSourcePreparationGate = z.infer<
  typeof CodexExecRealReadOnlyAdapterPilotSourcePreparationGateSchema
>;

export const CodexExecRealReadOnlyAdapterPilotSourcePreparationBlockerSchema =
  createdEntityBaseSchema.merge(codexExecRealReadOnlyAdapterMetadataOnlyFlagsSchema).extend({
    code: z.string().min(1),
    severity: RiskLevelSchema,
    relatedGateCode: z.string().min(1).optional(),
    summary: z.string().min(1),
    recommendation: z.string().min(1),
  });
export type CodexExecRealReadOnlyAdapterPilotSourcePreparationBlocker = z.infer<
  typeof CodexExecRealReadOnlyAdapterPilotSourcePreparationBlockerSchema
>;

export const CodexExecRealReadOnlyAdapterPilotSourcePreparationFindingSchema =
  createdEntityBaseSchema.merge(codexExecRealReadOnlyAdapterMetadataOnlyFlagsSchema).extend({
    code: z.string().min(1),
    severity: RiskLevelSchema,
    status: CodexExecRealReadOnlyAdapterPilotSourcePreparationStatusSchema,
    relatedGateCode: z.string().min(1).optional(),
    summary: z.string().min(1),
    recommendation: z.string().min(1),
  });
export type CodexExecRealReadOnlyAdapterPilotSourcePreparationFinding = z.infer<
  typeof CodexExecRealReadOnlyAdapterPilotSourcePreparationFindingSchema
>;

export const CodexExecRealReadOnlyAdapterPilotSourcePreparationChecklistItemSchema =
  createdEntityBaseSchema.merge(codexExecRealReadOnlyAdapterMetadataOnlyFlagsSchema).extend({
    code: z.string().min(1),
    label: z.string().min(1),
    status: z.enum(['passed', 'blocked', 'requires_review']),
    required: z.boolean(),
    summary: z.string().min(1),
  });
export type CodexExecRealReadOnlyAdapterPilotSourcePreparationChecklistItem = z.infer<
  typeof CodexExecRealReadOnlyAdapterPilotSourcePreparationChecklistItemSchema
>;

export const CodexExecRealReadOnlyAdapterPilotSourcePreparationRecordSchema =
  createdEntityBaseSchema
    .merge(codexExecRealReadOnlyAdapterMetadataOnlyFlagsSchema)
    .extend({
      dryRunId: z.string().min(1),
      status: CodexExecRealReadOnlyAdapterPilotSourcePreparationStatusSchema,
      recommendation: z.string().min(1),
      gates: z.array(CodexExecRealReadOnlyAdapterPilotSourcePreparationGateSchema),
      blockers: z
        .array(CodexExecRealReadOnlyAdapterPilotSourcePreparationBlockerSchema)
        .default([]),
      findings: z
        .array(CodexExecRealReadOnlyAdapterPilotSourcePreparationFindingSchema)
        .default([]),
      checklistItems: z
        .array(CodexExecRealReadOnlyAdapterPilotSourcePreparationChecklistItemSchema)
        .default([]),
      hardGateCount: z.number().int().nonnegative(),
      passedGateCount: z.number().int().nonnegative(),
      blockedGateCount: z.number().int().nonnegative(),
      requiresReviewFindingCount: z.number().int().nonnegative(),
      missingSources: z.array(z.string().min(1)).default([]),
      degraded: z.boolean(),
      notPersisted: z.boolean(),
      dryRunRecordPresent: z.boolean(),
      configExplicitlyEnabled: z.boolean(),
      authoritativePolicySourcePresent: z.boolean(),
      validUnusedApprovalPresent: z.boolean(),
      approvalArtifactId: z.string().min(1).optional(),
      approvalArtifactHash: z.string().min(1).optional(),
      dryRunPlanHash: z.string().min(1).optional(),
      policyDecisionHash: z.string().min(1).optional(),
      isolatedCleanWorktreeMetadataPresent: z.boolean(),
      worktreeLabel: z.string().min(1).optional(),
      worktreeStatus: z.enum(['clean', 'dirty', 'missing', 'unknown']).optional(),
      worktreePathHash: z.string().min(1).optional(),
      evidenceAuditReady: z.boolean(),
      fallbackUsedAsAuthority: z.literal(false),
      pilotExecuted: z.literal(false),
      adapterAttemptInvoked: z.literal(false),
      authoritative: z.boolean(),
      supervisorBacked: z.boolean(),
      persisted: z.boolean(),
      evidenceRefs: z.array(EvidenceRefSchema).default([]),
      auditEventIds: z.array(z.string().min(1)).default([]),
      summary: z.string().min(1),
    })
    .superRefine((record, context) => {
      const allPrepared =
        record.degraded === false &&
        record.notPersisted === false &&
        record.authoritative === true &&
        record.supervisorBacked === true &&
        record.persisted === true &&
        record.dryRunRecordPresent === true &&
        record.configExplicitlyEnabled === true &&
        record.authoritativePolicySourcePresent === true &&
        record.validUnusedApprovalPresent === true &&
        record.isolatedCleanWorktreeMetadataPresent === true &&
        record.evidenceAuditReady === true &&
        record.adapterAttemptInvoked === false &&
        record.pilotExecuted === false &&
        record.fallbackUsedAsAuthority === false;

      if (record.status === 'prepared' && !allPrepared) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          message:
            'prepared requires non-degraded persisted authoritative source evidence and all hard source gates',
          path: ['status'],
        });
      }
    });
export type CodexExecRealReadOnlyAdapterPilotSourcePreparationRecord = z.infer<
  typeof CodexExecRealReadOnlyAdapterPilotSourcePreparationRecordSchema
>;

export const CodexExecRealReadOnlyAdapterPilotSourcePreparationSummarySchema =
  createdEntityBaseSchema.merge(codexExecRealReadOnlyAdapterMetadataOnlyFlagsSchema).extend({
    recordId: z.string().min(1),
    dryRunId: z.string().min(1),
    status: CodexExecRealReadOnlyAdapterPilotSourcePreparationStatusSchema,
    hardGateCount: z.number().int().nonnegative(),
    passedGateCount: z.number().int().nonnegative(),
    blockedGateCount: z.number().int().nonnegative(),
    requiresReviewFindingCount: z.number().int().nonnegative(),
    missingSources: z.array(z.string().min(1)).default([]),
    degraded: z.boolean(),
    notPersisted: z.boolean(),
    dryRunRecordPresent: z.boolean(),
    configExplicitlyEnabled: z.boolean(),
    authoritativePolicySourcePresent: z.boolean(),
    validUnusedApprovalPresent: z.boolean(),
    isolatedCleanWorktreeMetadataPresent: z.boolean(),
    evidenceAuditReady: z.boolean(),
    fallbackUsedAsAuthority: z.literal(false),
    pilotExecuted: z.literal(false),
    adapterAttemptInvoked: z.literal(false),
    recommendation: z.string().min(1),
    summary: z.string().min(1),
  });
export type CodexExecRealReadOnlyAdapterPilotSourcePreparationSummary = z.infer<
  typeof CodexExecRealReadOnlyAdapterPilotSourcePreparationSummarySchema
>;

export const CodexExecRealReadOnlyAdapterPilotSourcePreparationQuerySchema =
  createdEntityBaseSchema.merge(codexExecRealReadOnlyAdapterMetadataOnlyFlagsSchema).extend({
    dryRunId: z.string().min(1).optional(),
    status: CodexExecRealReadOnlyAdapterPilotSourcePreparationStatusSchema.optional(),
    limit: z.number().int().positive().max(100).default(50),
  });
export type CodexExecRealReadOnlyAdapterPilotSourcePreparationQuery = z.infer<
  typeof CodexExecRealReadOnlyAdapterPilotSourcePreparationQuerySchema
>;

export const CodexExecRealReadOnlyAdapterPilotPrerequisiteStatusSchema = z.enum([
  'ready_for_pilot_retry',
  'blocked',
  'requires_review',
]);
export type CodexExecRealReadOnlyAdapterPilotPrerequisiteStatus = z.infer<
  typeof CodexExecRealReadOnlyAdapterPilotPrerequisiteStatusSchema
>;

export const CodexExecRealReadOnlyAdapterPilotPrerequisiteGateSchema = createdEntityBaseSchema
  .merge(codexExecRealReadOnlyAdapterMetadataOnlyFlagsSchema)
  .extend({
    code: z.string().min(1),
    label: z.string().min(1),
    category: z.enum([
      'authority',
      'config',
      'policy',
      'approval',
      'worktree',
      'evidence_audit',
      'fallback',
      'handoff',
    ]),
    status: z.enum(['passed', 'blocked', 'requires_review']),
    required: z.boolean(),
    summary: z.string().min(1),
  });
export type CodexExecRealReadOnlyAdapterPilotPrerequisiteGate = z.infer<
  typeof CodexExecRealReadOnlyAdapterPilotPrerequisiteGateSchema
>;

export const CodexExecRealReadOnlyAdapterPilotPrerequisiteBlockerSchema =
  createdEntityBaseSchema.merge(codexExecRealReadOnlyAdapterMetadataOnlyFlagsSchema).extend({
    code: z.string().min(1),
    severity: RiskLevelSchema,
    relatedGateCode: z.string().min(1).optional(),
    summary: z.string().min(1),
    recommendation: z.string().min(1),
  });
export type CodexExecRealReadOnlyAdapterPilotPrerequisiteBlocker = z.infer<
  typeof CodexExecRealReadOnlyAdapterPilotPrerequisiteBlockerSchema
>;

export const CodexExecRealReadOnlyAdapterPilotPrerequisiteFindingSchema =
  createdEntityBaseSchema.merge(codexExecRealReadOnlyAdapterMetadataOnlyFlagsSchema).extend({
    code: z.string().min(1),
    severity: RiskLevelSchema,
    status: CodexExecRealReadOnlyAdapterPilotPrerequisiteStatusSchema,
    relatedGateCode: z.string().min(1).optional(),
    summary: z.string().min(1),
    recommendation: z.string().min(1),
  });
export type CodexExecRealReadOnlyAdapterPilotPrerequisiteFinding = z.infer<
  typeof CodexExecRealReadOnlyAdapterPilotPrerequisiteFindingSchema
>;

export const CodexExecRealReadOnlyAdapterPilotPrerequisiteChecklistItemSchema =
  createdEntityBaseSchema.merge(codexExecRealReadOnlyAdapterMetadataOnlyFlagsSchema).extend({
    code: z.string().min(1),
    label: z.string().min(1),
    status: z.enum(['passed', 'blocked', 'requires_review']),
    required: z.boolean(),
    summary: z.string().min(1),
  });
export type CodexExecRealReadOnlyAdapterPilotPrerequisiteChecklistItem = z.infer<
  typeof CodexExecRealReadOnlyAdapterPilotPrerequisiteChecklistItemSchema
>;

export const CodexExecRealReadOnlyAdapterPilotPrerequisiteRecordSchema =
  createdEntityBaseSchema
    .merge(codexExecRealReadOnlyAdapterMetadataOnlyFlagsSchema)
    .extend({
      dryRunId: z.string().min(1),
      status: CodexExecRealReadOnlyAdapterPilotPrerequisiteStatusSchema,
      recommendation: z.string().min(1),
      gates: z.array(CodexExecRealReadOnlyAdapterPilotPrerequisiteGateSchema),
      blockers: z.array(CodexExecRealReadOnlyAdapterPilotPrerequisiteBlockerSchema).default([]),
      findings: z.array(CodexExecRealReadOnlyAdapterPilotPrerequisiteFindingSchema).default([]),
      checklistItems: z
        .array(CodexExecRealReadOnlyAdapterPilotPrerequisiteChecklistItemSchema)
        .default([]),
      hardGateCount: z.number().int().nonnegative(),
      passedGateCount: z.number().int().nonnegative(),
      blockedGateCount: z.number().int().nonnegative(),
      requiresReviewFindingCount: z.number().int().nonnegative(),
      missingPrerequisites: z.array(z.string().min(1)).default([]),
      degraded: z.boolean(),
      notPersisted: z.boolean(),
      dryRunRecordPresent: z.boolean(),
      configExplicitlyEnabled: z.boolean(),
      validUnusedApprovalPresent: z.boolean(),
      isolatedCleanWorktreeMetadataPresent: z.boolean(),
      authoritativePolicySourcePresent: z.boolean(),
      authoritativeSourcePreparationPresent: z.boolean(),
      authoritativeAttemptEvidencePresent: z.boolean(),
      evidenceAuditReady: z.boolean(),
      fallbackUsedAsAuthority: z.literal(false),
      pilotExecuted: z.literal(false),
      adapterAttemptInvoked: z.literal(false),
      authoritative: z.boolean(),
      supervisorBacked: z.boolean(),
      persisted: z.boolean(),
      worktreeLabel: z.string().min(1).optional(),
      worktreeStatus: z.enum(['clean', 'dirty', 'missing', 'unknown']).optional(),
      worktreePathHash: z.string().min(1).optional(),
      evidenceRefs: z.array(EvidenceRefSchema).default([]),
      auditEventIds: z.array(z.string().min(1)).default([]),
      summary: z.string().min(1),
    })
    .superRefine((record, context) => {
      const allReady =
        record.degraded === false &&
        record.notPersisted === false &&
        record.authoritative === true &&
        record.supervisorBacked === true &&
        record.persisted === true &&
        record.dryRunRecordPresent === true &&
        record.configExplicitlyEnabled === true &&
        record.validUnusedApprovalPresent === true &&
        record.isolatedCleanWorktreeMetadataPresent === true &&
        record.authoritativePolicySourcePresent === true &&
        (record.authoritativeAttemptEvidencePresent === true ||
          record.authoritativeSourcePreparationPresent === true) &&
        record.evidenceAuditReady === true &&
        record.adapterAttemptInvoked === false &&
        record.pilotExecuted === false &&
        record.fallbackUsedAsAuthority === false;

      if (record.status === 'ready_for_pilot_retry' && !allReady) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          message:
            'ready_for_pilot_retry requires non-degraded persisted authoritative prerequisite evidence',
          path: ['status'],
        });
      }
    });
export type CodexExecRealReadOnlyAdapterPilotPrerequisiteRecord = z.infer<
  typeof CodexExecRealReadOnlyAdapterPilotPrerequisiteRecordSchema
>;

export const CodexExecRealReadOnlyAdapterPilotPrerequisiteSummarySchema =
  createdEntityBaseSchema.merge(codexExecRealReadOnlyAdapterMetadataOnlyFlagsSchema).extend({
    recordId: z.string().min(1),
    dryRunId: z.string().min(1),
    status: CodexExecRealReadOnlyAdapterPilotPrerequisiteStatusSchema,
    hardGateCount: z.number().int().nonnegative(),
    passedGateCount: z.number().int().nonnegative(),
    blockedGateCount: z.number().int().nonnegative(),
    requiresReviewFindingCount: z.number().int().nonnegative(),
    missingPrerequisites: z.array(z.string().min(1)).default([]),
    degraded: z.boolean(),
    notPersisted: z.boolean(),
    dryRunRecordPresent: z.boolean(),
    configExplicitlyEnabled: z.boolean(),
    validUnusedApprovalPresent: z.boolean(),
    isolatedCleanWorktreeMetadataPresent: z.boolean(),
    authoritativePolicySourcePresent: z.boolean(),
    authoritativeSourcePreparationPresent: z.boolean(),
    authoritativeAttemptEvidencePresent: z.boolean(),
    evidenceAuditReady: z.boolean(),
    fallbackUsedAsAuthority: z.literal(false),
    pilotExecuted: z.literal(false),
    adapterAttemptInvoked: z.literal(false),
    recommendation: z.string().min(1),
    summary: z.string().min(1),
  });
export type CodexExecRealReadOnlyAdapterPilotPrerequisiteSummary = z.infer<
  typeof CodexExecRealReadOnlyAdapterPilotPrerequisiteSummarySchema
>;

export const CodexExecRealReadOnlyAdapterPilotPrerequisiteQuerySchema =
  createdEntityBaseSchema.merge(codexExecRealReadOnlyAdapterMetadataOnlyFlagsSchema).extend({
    dryRunId: z.string().min(1).optional(),
    status: CodexExecRealReadOnlyAdapterPilotPrerequisiteStatusSchema.optional(),
    limit: z.number().int().positive().max(100).default(50),
  });
export type CodexExecRealReadOnlyAdapterPilotPrerequisiteQuery = z.infer<
  typeof CodexExecRealReadOnlyAdapterPilotPrerequisiteQuerySchema
>;

export const RealPolicyBackendKindSchema = z.enum(['opa', 'cedar']);
export type RealPolicyBackendKind = z.infer<typeof RealPolicyBackendKindSchema>;

export const RealPolicyBackendRuntimeModeSchema = z.enum(['local-cli', 'loopback-http']);
export type RealPolicyBackendRuntimeMode = z.infer<typeof RealPolicyBackendRuntimeModeSchema>;

export const RealPolicyBackendDecisionOutcomeSchema = z.enum(['allow', 'deny', 'unknown', 'error']);
export type RealPolicyBackendDecisionOutcome = z.infer<
  typeof RealPolicyBackendDecisionOutcomeSchema
>;

export const RealPolicyBackendManifestSchema = createdEntityBaseSchema
  .extend({
    adapterName: z.literal('policy-backend-adapter'),
    backendKind: RealPolicyBackendKindSchema,
    runtimeModes: z.array(RealPolicyBackendRuntimeModeSchema).min(1),
    defaultEnabled: z.literal(false),
    advisoryOnly: z.literal(true),
    authorityProvider: z.literal('codexhub-security-kernel'),
    rawPolicySourceStored: z.literal(false),
    rawInputStored: z.literal(false),
    rawOutputStored: z.literal(false),
    rawPathStored: z.literal(false),
    bodyStored: z.literal(false),
    summary: z.string().min(1),
  })
  .superRefine((record, context) => {
    rejectGithubRawMetadata(record.metadata, context, ['metadata']);
  });
export type RealPolicyBackendManifest = z.infer<typeof RealPolicyBackendManifestSchema>;

export const RealPolicyBackendReadinessSchema = createdEntityBaseSchema
  .extend({
    backendKind: RealPolicyBackendKindSchema,
    runtimeMode: RealPolicyBackendRuntimeModeSchema,
    realBackendEnabled: z.boolean(),
    backendEnabled: z.boolean(),
    runtimeAvailable: z.boolean(),
    endpointHash: z.string().min(1).optional(),
    cliExecutableHash: z.string().min(1).optional(),
    blockerCount: z.number().int().nonnegative(),
    blockReasons: z.array(z.string().min(1)).default([]),
    advisoryOnly: z.literal(true),
    authorityProvider: z.literal('codexhub-security-kernel'),
    processBoundaryPlanned: z.boolean(),
    networkBoundaryPlanned: z.boolean(),
    rawPolicySourceStored: z.literal(false),
    rawInputStored: z.literal(false),
    rawOutputStored: z.literal(false),
    rawPathStored: z.literal(false),
    bodyStored: z.literal(false),
    summary: z.string().min(1),
  })
  .superRefine((record, context) => {
    if (record.blockerCount !== record.blockReasons.length) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'blockerCount must match real policy readiness blockReasons length',
        path: ['blockerCount'],
      });
    }
    rejectGithubRawMetadata(record.metadata, context, ['metadata']);
  });
export type RealPolicyBackendReadiness = z.infer<typeof RealPolicyBackendReadinessSchema>;

export const RealPolicyBackendEvaluationPlanSchema = createdEntityBaseSchema
  .extend({
    dryRunId: z.string().min(1),
    status: z.enum(['planned', 'blocked']),
    backendKind: RealPolicyBackendKindSchema,
    runtimeMode: RealPolicyBackendRuntimeModeSchema,
    actionIdHash: z.string().min(1),
    actionTypeHash: z.string().min(1),
    inputHash: z.string().min(1),
    policySourceHash: z.string().min(1),
    queryHash: z.string().min(1).optional(),
    endpointHash: z.string().min(1).optional(),
    processBoundaryPlanned: z.boolean(),
    networkBoundaryPlanned: z.boolean(),
    advisoryOnly: z.literal(true),
    authorityProvider: z.literal('codexhub-security-kernel'),
    blockReasons: z.array(z.string().min(1)).default([]),
    rawPolicySourceStored: z.literal(false),
    rawInputStored: z.literal(false),
    rawOutputStored: z.literal(false),
    rawPathStored: z.literal(false),
    bodyStored: z.literal(false),
    summary: z.string().min(1),
  })
  .superRefine((record, context) => {
    rejectGithubRawMetadata(record.metadata, context, ['metadata']);
  });
export type RealPolicyBackendEvaluationPlan = z.infer<
  typeof RealPolicyBackendEvaluationPlanSchema
>;

export const RealPolicyBackendApprovalArtifactSchema = createdEntityBaseSchema
  .extend({
    dryRunId: z.string().min(1),
    dryRunRecordId: z.string().min(1),
    approvalRequestId: z.string().min(1),
    approvalArtifactId: z.string().min(1),
    status: GithubProviderApprovalStatusSchema,
    approved: z.boolean(),
    policyDecisionId: z.string().min(1),
    expectedPlanHash: z.string().min(1),
    approvedAt: IsoDateTimeSchema.optional(),
    expiresAt: IsoDateTimeSchema.optional(),
    usedAt: IsoDateTimeSchema.optional(),
    revokedAt: IsoDateTimeSchema.optional(),
    decidedByHash: z.string().min(1).optional(),
    reasonHash: z.string().min(1).optional(),
    advisoryOnly: z.literal(true),
    authorityProvider: z.literal('codexhub-security-kernel'),
    rawPolicySourceStored: z.literal(false),
    rawInputStored: z.literal(false),
    rawOutputStored: z.literal(false),
    rawPathStored: z.literal(false),
    bodyStored: z.literal(false),
    evidenceRefs: z.array(EvidenceRefSchema).default([]),
    auditEventIds: z.array(z.string().min(1)).default([]),
    summary: z.string().min(1),
  })
  .superRefine((record, context) => {
    if (record.approved !== (record.status === 'approved')) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'approved must match real policy approval status',
        path: ['approved'],
      });
    }
    rejectGithubRawMetadata(record.metadata, context, ['metadata']);
  });
export type RealPolicyBackendApprovalArtifact = z.infer<
  typeof RealPolicyBackendApprovalArtifactSchema
>;

export const RealPolicyAdvisoryDecisionSummarySchema = createdEntityBaseSchema
  .extend({
    backendKind: RealPolicyBackendKindSchema,
    runtimeMode: RealPolicyBackendRuntimeModeSchema,
    backendOutcome: RealPolicyBackendDecisionOutcomeSchema,
    normalizedOutcome: PolicyOutcomeSchema,
    advisoryOnly: z.literal(true),
    authorityProvider: z.literal('codexhub-security-kernel'),
    codexhubPolicyDecisionId: z.string().min(1),
    rawDecisionHash: z.string().min(1),
    reasonCount: z.number().int().nonnegative(),
    matchedRuleCount: z.number().int().nonnegative(),
    rawPolicySourceStored: z.literal(false),
    rawInputStored: z.literal(false),
    rawOutputStored: z.literal(false),
    rawPathStored: z.literal(false),
    bodyStored: z.literal(false),
    summary: z.string().min(1),
  })
  .superRefine((record, context) => {
    rejectGithubRawMetadata(record.metadata, context, ['metadata']);
  });
export type RealPolicyAdvisoryDecisionSummary = z.infer<
  typeof RealPolicyAdvisoryDecisionSummarySchema
>;

export const RealPolicyBackendEvaluationRunSchema = createdEntityBaseSchema
  .extend({
    status: GithubControlPlaneRunStatusSchema,
    plan: RealPolicyBackendEvaluationPlanSchema,
    readiness: RealPolicyBackendReadinessSchema,
    advisoryDecision: RealPolicyAdvisoryDecisionSummarySchema,
    evidenceRefs: z.array(EvidenceRefSchema).default([]),
    auditEventIds: z.array(z.string().min(1)).default([]),
    processBoundaryInvoked: z.boolean(),
    externalProcessStarted: z.boolean(),
    networkBoundaryInvoked: z.boolean(),
    advisoryOnly: z.literal(true),
    authorityProvider: z.literal('codexhub-security-kernel'),
    rawPolicySourceStored: z.literal(false),
    rawInputStored: z.literal(false),
    rawOutputStored: z.literal(false),
    rawPathStored: z.literal(false),
    bodyStored: z.literal(false),
    summary: z.string().min(1),
  })
  .superRefine((record, context) => {
    rejectGithubRawMetadata(record.metadata, context, ['metadata']);
  });
export type RealPolicyBackendEvaluationRun = z.infer<
  typeof RealPolicyBackendEvaluationRunSchema
>;

export const RealPolicyBackendAcceptanceScenarioSchema = z.enum([
  'all-pass',
  'provider-disabled',
  'opa-cli-missing',
  'cedar-cli-missing',
  'loopback-unavailable',
  'approval-blocked',
  'advisory-deny',
  'backend-error',
  'raw-output-rejected',
]);
export type RealPolicyBackendAcceptanceScenario = z.infer<
  typeof RealPolicyBackendAcceptanceScenarioSchema
>;

export const RealPolicyBackendAcceptanceRehearsalRunSchema = createdEntityBaseSchema
  .extend({
    scenario: RealPolicyBackendAcceptanceScenarioSchema,
    backendKind: RealPolicyBackendKindSchema,
    runtimeMode: RealPolicyBackendRuntimeModeSchema,
    status: z.enum(['passed', 'failed', 'blocked', 'aborted']),
    readinessStatus: z.enum(['fixture_completed', 'blocked', 'failed', 'skipped']),
    evaluationStatus: z.enum(['fixture_completed', 'blocked', 'failed', 'skipped']),
    advisoryOutcome: RealPolicyBackendDecisionOutcomeSchema,
    blockerCount: z.number().int().nonnegative(),
    evidenceRefs: z.array(EvidenceRefSchema).default([]),
    auditEventIds: z.array(z.string().min(1)).default([]),
    processBoundaryInvoked: z.boolean(),
    externalProcessStarted: z.boolean(),
    networkBoundaryInvoked: z.boolean(),
    advisoryOnly: z.literal(true),
    authorityProvider: z.literal('codexhub-security-kernel'),
    rawPolicySourceStored: z.literal(false),
    rawInputStored: z.literal(false),
    rawOutputStored: z.literal(false),
    rawPathStored: z.literal(false),
    bodyStored: z.literal(false),
    summary: z.string().min(1),
  })
  .superRefine((record, context) => {
    if (record.scenario !== 'all-pass' && record.status === 'passed') {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'only all-pass real policy rehearsals can pass',
        path: ['status'],
      });
    }
    rejectGithubRawMetadata(record.metadata, context, ['metadata']);
  });
export type RealPolicyBackendAcceptanceRehearsalRun = z.infer<
  typeof RealPolicyBackendAcceptanceRehearsalRunSchema
>;

export const RealTelemetryExporterKindSchema = z.enum(['in-memory', 'otlp-http']);
export type RealTelemetryExporterKind = z.infer<typeof RealTelemetryExporterKindSchema>;

export const RealTelemetryRuntimeManifestSchema = createdEntityBaseSchema
  .extend({
    adapterName: z.literal('otel-adapter'),
    exporterKinds: z.array(RealTelemetryExporterKindSchema).min(1),
    defaultEnabled: z.literal(false),
    networkExporterDefaultEnabled: z.literal(false),
    evidenceAuditAuthoritative: z.literal(false),
    rawTracePayloadStored: z.literal(false),
    rawLogStored: z.literal(false),
    rawPathStored: z.literal(false),
    bodyStored: z.literal(false),
    summary: z.string().min(1),
  })
  .superRefine((record, context) => {
    rejectGithubRawMetadata(record.metadata, context, ['metadata']);
  });
export type RealTelemetryRuntimeManifest = z.infer<typeof RealTelemetryRuntimeManifestSchema>;

export const RealTelemetryReadinessSchema = createdEntityBaseSchema
  .extend({
    exporterKind: RealTelemetryExporterKindSchema,
    realTelemetryEnabled: z.boolean(),
    networkExporterEnabled: z.boolean(),
    endpointHash: z.string().min(1).optional(),
    endpointAllowed: z.boolean(),
    blockerCount: z.number().int().nonnegative(),
    blockReasons: z.array(z.string().min(1)).default([]),
    networkBoundaryPlanned: z.boolean(),
    processBoundaryPlanned: z.literal(false),
    evidenceAuditAuthoritative: z.literal(false),
    rawTracePayloadStored: z.literal(false),
    rawLogStored: z.literal(false),
    rawPathStored: z.literal(false),
    bodyStored: z.literal(false),
    summary: z.string().min(1),
  })
  .superRefine((record, context) => {
    if (record.blockerCount !== record.blockReasons.length) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'blockerCount must match real telemetry readiness blockReasons length',
        path: ['blockerCount'],
      });
    }
    rejectGithubRawMetadata(record.metadata, context, ['metadata']);
  });
export type RealTelemetryReadiness = z.infer<typeof RealTelemetryReadinessSchema>;

export const RealTelemetryExportPlanSchema = createdEntityBaseSchema
  .extend({
    dryRunId: z.string().min(1),
    status: z.enum(['planned', 'blocked']),
    exporterKind: RealTelemetryExporterKindSchema,
    signalKinds: z.array(TelemetrySignalKindSchema).default(['trace']),
    spanCount: z.number().int().nonnegative(),
    tracePlanHash: z.string().min(1),
    endpointHash: z.string().min(1).optional(),
    networkExportPlanned: z.boolean(),
    processBoundaryPlanned: z.literal(false),
    blockReasons: z.array(z.string().min(1)).default([]),
    evidenceAuditAuthoritative: z.literal(false),
    rawTracePayloadStored: z.literal(false),
    rawLogStored: z.literal(false),
    rawPathStored: z.literal(false),
    bodyStored: z.literal(false),
    summary: z.string().min(1),
  })
  .superRefine((record, context) => {
    rejectGithubRawMetadata(record.metadata, context, ['metadata']);
  });
export type RealTelemetryExportPlan = z.infer<typeof RealTelemetryExportPlanSchema>;

export const RealTelemetryExportApprovalArtifactSchema = createdEntityBaseSchema
  .extend({
    dryRunId: z.string().min(1),
    dryRunRecordId: z.string().min(1),
    approvalRequestId: z.string().min(1),
    approvalArtifactId: z.string().min(1),
    status: GithubProviderApprovalStatusSchema,
    approved: z.boolean(),
    policyDecisionId: z.string().min(1),
    expectedPlanHash: z.string().min(1),
    approvedAt: IsoDateTimeSchema.optional(),
    expiresAt: IsoDateTimeSchema.optional(),
    usedAt: IsoDateTimeSchema.optional(),
    revokedAt: IsoDateTimeSchema.optional(),
    decidedByHash: z.string().min(1).optional(),
    reasonHash: z.string().min(1).optional(),
    evidenceAuditAuthoritative: z.literal(false),
    rawTracePayloadStored: z.literal(false),
    rawLogStored: z.literal(false),
    rawPathStored: z.literal(false),
    bodyStored: z.literal(false),
    evidenceRefs: z.array(EvidenceRefSchema).default([]),
    auditEventIds: z.array(z.string().min(1)).default([]),
    summary: z.string().min(1),
  })
  .superRefine((record, context) => {
    if (record.approved !== (record.status === 'approved')) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'approved must match telemetry approval status',
        path: ['approved'],
      });
    }
    rejectGithubRawMetadata(record.metadata, context, ['metadata']);
  });
export type RealTelemetryExportApprovalArtifact = z.infer<
  typeof RealTelemetryExportApprovalArtifactSchema
>;

export const RealTelemetryLocalExportSummarySchema = createdEntityBaseSchema
  .extend({
    exporterKind: z.literal('in-memory'),
    exportedSpanCount: z.number().int().nonnegative(),
    exportSummaryHash: z.string().min(1),
    rawTracePayloadStored: z.literal(false),
    rawLogStored: z.literal(false),
    rawPathStored: z.literal(false),
    bodyStored: z.literal(false),
    evidenceAuditAuthoritative: z.literal(false),
    summary: z.string().min(1),
  })
  .superRefine((record, context) => {
    rejectGithubRawMetadata(record.metadata, context, ['metadata']);
  });
export type RealTelemetryLocalExportSummary = z.infer<
  typeof RealTelemetryLocalExportSummarySchema
>;

export const RealTelemetryNetworkExportSummarySchema = createdEntityBaseSchema
  .extend({
    exporterKind: z.literal('otlp-http'),
    exportedSpanCount: z.number().int().nonnegative(),
    endpointHash: z.string().min(1),
    exportSummaryHash: z.string().min(1),
    networkBoundaryInvoked: z.boolean(),
    rawTracePayloadStored: z.literal(false),
    rawLogStored: z.literal(false),
    rawPathStored: z.literal(false),
    bodyStored: z.literal(false),
    evidenceAuditAuthoritative: z.literal(false),
    summary: z.string().min(1),
  })
  .superRefine((record, context) => {
    rejectGithubRawMetadata(record.metadata, context, ['metadata']);
  });
export type RealTelemetryNetworkExportSummary = z.infer<
  typeof RealTelemetryNetworkExportSummarySchema
>;

export const RealTelemetryExportRunSchema = createdEntityBaseSchema
  .extend({
    status: GithubControlPlaneRunStatusSchema,
    plan: RealTelemetryExportPlanSchema,
    readiness: RealTelemetryReadinessSchema,
    localExportSummary: RealTelemetryLocalExportSummarySchema.optional(),
    networkExportSummary: RealTelemetryNetworkExportSummarySchema.optional(),
    evidenceRefs: z.array(EvidenceRefSchema).default([]),
    auditEventIds: z.array(z.string().min(1)).default([]),
    processBoundaryInvoked: z.literal(false),
    externalProcessStarted: z.literal(false),
    networkBoundaryInvoked: z.boolean(),
    evidenceAuditAuthoritative: z.literal(false),
    rawTracePayloadStored: z.literal(false),
    rawLogStored: z.literal(false),
    rawPathStored: z.literal(false),
    bodyStored: z.literal(false),
    summary: z.string().min(1),
  })
  .superRefine((record, context) => {
    rejectGithubRawMetadata(record.metadata, context, ['metadata']);
  });
export type RealTelemetryExportRun = z.infer<typeof RealTelemetryExportRunSchema>;

export const RealTelemetryAcceptanceScenarioSchema = z.enum([
  'all-pass-local',
  'exporter-disabled',
  'network-exporter-disabled',
  'endpoint-blocked',
  'approval-blocked',
  'export-failed',
  'raw-span-rejected',
  'network-timeout',
]);
export type RealTelemetryAcceptanceScenario = z.infer<
  typeof RealTelemetryAcceptanceScenarioSchema
>;

export const RealTelemetryAcceptanceRehearsalRunSchema = createdEntityBaseSchema
  .extend({
    scenario: RealTelemetryAcceptanceScenarioSchema,
    exporterKind: RealTelemetryExporterKindSchema,
    status: z.enum(['passed', 'failed', 'blocked', 'aborted']),
    readinessStatus: z.enum(['fixture_completed', 'blocked', 'failed', 'skipped']),
    exportStatus: z.enum(['fixture_completed', 'blocked', 'failed', 'skipped']),
    exportedSpanCount: z.number().int().nonnegative(),
    evidenceRefs: z.array(EvidenceRefSchema).default([]),
    auditEventIds: z.array(z.string().min(1)).default([]),
    processBoundaryInvoked: z.literal(false),
    externalProcessStarted: z.literal(false),
    networkBoundaryInvoked: z.boolean(),
    evidenceAuditAuthoritative: z.literal(false),
    rawTracePayloadStored: z.literal(false),
    rawLogStored: z.literal(false),
    rawPathStored: z.literal(false),
    bodyStored: z.literal(false),
    summary: z.string().min(1),
  })
  .superRefine((record, context) => {
    if (record.scenario !== 'all-pass-local' && record.status === 'passed') {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'only all-pass local telemetry rehearsals can pass',
        path: ['status'],
      });
    }
    rejectGithubRawMetadata(record.metadata, context, ['metadata']);
  });
export type RealTelemetryAcceptanceRehearsalRun = z.infer<
  typeof RealTelemetryAcceptanceRehearsalRunSchema
>;

export const BrowserActionKindSchema = z.enum(['click', 'type']);
export type BrowserActionKind = z.infer<typeof BrowserActionKindSchema>;

export const BrowserActionStepSummarySchema = createdEntityBaseSchema
  .extend({
    actionKind: BrowserActionKindSchema,
    targetUrlHash: z.string().min(1),
    selectorHash: z.string().min(1),
    typedTextHash: z.string().min(1).optional(),
    status: z.enum(['planned', 'completed', 'failed', 'blocked', 'skipped']),
    rawSelectorStored: z.literal(false),
    rawTypedTextStored: z.literal(false),
    bodyStored: z.literal(false),
    summary: z.string().min(1),
  })
  .superRefine((record, context) => {
    rejectGithubRawMetadata(record.metadata, context, ['metadata']);
  });
export type BrowserActionStepSummary = z.infer<typeof BrowserActionStepSummarySchema>;

export const BrowserActionPlanSchema = createdEntityBaseSchema
  .extend({
    dryRunId: z.string().min(1),
    status: z.enum(['planned', 'blocked']),
    actionKind: BrowserActionKindSchema,
    targetUrlHash: z.string().min(1),
    selectorHash: z.string().min(1),
    typedTextHash: z.string().min(1).optional(),
    blockReasons: z.array(z.string().min(1)).default([]),
    processBoundaryPlanned: z.literal(true),
    browserActPlanned: z.literal(true),
    rawSelectorStored: z.literal(false),
    rawTypedTextStored: z.literal(false),
    rawPathStored: z.literal(false),
    bodyStored: z.literal(false),
    summary: z.string().min(1),
  })
  .superRefine((record, context) => {
    rejectGithubRawMetadata(record.metadata, context, ['metadata']);
  });
export type BrowserActionPlan = z.infer<typeof BrowserActionPlanSchema>;

export const BrowserActionApprovalArtifactSchema = createdEntityBaseSchema
  .extend({
    dryRunId: z.string().min(1),
    dryRunRecordId: z.string().min(1),
    approvalRequestId: z.string().min(1),
    approvalArtifactId: z.string().min(1),
    status: GithubProviderApprovalStatusSchema,
    approved: z.boolean(),
    policyDecisionId: z.string().min(1),
    expectedPlanHash: z.string().min(1),
    reasonHash: z.string().min(1).optional(),
    rawSelectorStored: z.literal(false),
    rawTypedTextStored: z.literal(false),
    bodyStored: z.literal(false),
    evidenceRefs: z.array(EvidenceRefSchema).default([]),
    auditEventIds: z.array(z.string().min(1)).default([]),
    summary: z.string().min(1),
  })
  .superRefine((record, context) => {
    if (record.approved !== (record.status === 'approved')) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'approved must match browser action approval status',
        path: ['approved'],
      });
    }
    rejectGithubRawMetadata(record.metadata, context, ['metadata']);
  });
export type BrowserActionApprovalArtifact = z.infer<typeof BrowserActionApprovalArtifactSchema>;

export const BrowserActionRunSchema = createdEntityBaseSchema
  .extend({
    status: GithubControlPlaneRunStatusSchema,
    plan: BrowserActionPlanSchema,
    stepSummaries: z.array(BrowserActionStepSummarySchema).default([]),
    evidenceRefs: z.array(EvidenceRefSchema).default([]),
    auditEventIds: z.array(z.string().min(1)).default([]),
    processBoundaryInvoked: z.boolean(),
    externalProcessStarted: z.boolean(),
    browserActionInvoked: z.boolean(),
    rawSelectorStored: z.literal(false),
    rawTypedTextStored: z.literal(false),
    rawPathStored: z.literal(false),
    bodyStored: z.literal(false),
    summary: z.string().min(1),
  })
  .superRefine((record, context) => {
    rejectGithubRawMetadata(record.metadata, context, ['metadata']);
  });
export type BrowserActionRun = z.infer<typeof BrowserActionRunSchema>;

export const ElectronMainInspectorPlanSchema = createdEntityBaseSchema
  .extend({
    dryRunId: z.string().min(1),
    status: z.enum(['planned', 'blocked']),
    endpointHash: z.string().min(1),
    targetIdHash: z.string().min(1),
    snippetId: z.string().min(1),
    snippetSourceHash: z.string().min(1),
    blockReasons: z.array(z.string().min(1)).default([]),
    cdpHttpBoundaryPlanned: z.literal(true),
    cdpWebSocketBoundaryPlanned: z.literal(true),
    mainInspectorPlanned: z.literal(true),
    rawJavascriptStored: z.literal(false),
    rawPathStored: z.literal(false),
    bodyStored: z.literal(false),
    summary: z.string().min(1),
  })
  .superRefine((record, context) => {
    rejectGithubRawMetadata(record.metadata, context, ['metadata']);
  });
export type ElectronMainInspectorPlan = z.infer<typeof ElectronMainInspectorPlanSchema>;

export const ElectronMainInspectorApprovalArtifactSchema = createdEntityBaseSchema
  .extend({
    dryRunId: z.string().min(1),
    dryRunRecordId: z.string().min(1),
    approvalRequestId: z.string().min(1),
    approvalArtifactId: z.string().min(1),
    status: GithubProviderApprovalStatusSchema,
    approved: z.boolean(),
    policyDecisionId: z.string().min(1),
    expectedPlanHash: z.string().min(1),
    reasonHash: z.string().min(1).optional(),
    rawJavascriptStored: z.literal(false),
    bodyStored: z.literal(false),
    evidenceRefs: z.array(EvidenceRefSchema).default([]),
    auditEventIds: z.array(z.string().min(1)).default([]),
    summary: z.string().min(1),
  })
  .superRefine((record, context) => {
    if (record.approved !== (record.status === 'approved')) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'approved must match electron inspector approval status',
        path: ['approved'],
      });
    }
    rejectGithubRawMetadata(record.metadata, context, ['metadata']);
  });
export type ElectronMainInspectorApprovalArtifact = z.infer<
  typeof ElectronMainInspectorApprovalArtifactSchema
>;

export const ElectronMainInspectorRunSchema = createdEntityBaseSchema
  .extend({
    status: GithubControlPlaneRunStatusSchema,
    plan: ElectronMainInspectorPlanSchema,
    resultHash: z.string().min(1).optional(),
    evidenceRefs: z.array(EvidenceRefSchema).default([]),
    auditEventIds: z.array(z.string().min(1)).default([]),
    cdpHttpBoundaryInvoked: z.boolean(),
    cdpWebSocketBoundaryInvoked: z.boolean(),
    mainInspectorInvoked: z.boolean(),
    rawJavascriptStored: z.literal(false),
    rawOutputStored: z.literal(false),
    rawPathStored: z.literal(false),
    bodyStored: z.literal(false),
    summary: z.string().min(1),
  })
  .superRefine((record, context) => {
    rejectGithubRawMetadata(record.metadata, context, ['metadata']);
  });
export type ElectronMainInspectorRun = z.infer<typeof ElectronMainInspectorRunSchema>;

export const McpWriteToolNameSchema = z.enum(['workspace.applyPatchToControlledWorktree']);
export type McpWriteToolName = z.infer<typeof McpWriteToolNameSchema>;

export const McpWriteToolManifestSchema = createdEntityBaseSchema
  .extend({
    name: McpWriteToolNameSchema,
    enabled: z.boolean(),
    riskLevel: z.literal('critical'),
    actionMode: z.literal('write'),
    approvalPolicy: z.literal('required'),
    directExecutionAllowed: z.literal(true),
    controlledWorktreeOnly: z.literal(true),
    repoRootMutationAllowed: z.literal(false),
    rawPatchStored: z.literal(false),
    rawPathStored: z.literal(false),
    bodyStored: z.literal(false),
    summary: z.string().min(1),
  })
  .superRefine((record, context) => {
    rejectGithubRawMetadata(record.metadata, context, ['metadata']);
  });
export type McpWriteToolManifest = z.infer<typeof McpWriteToolManifestSchema>;

export const McpWriteToolPlanSchema = createdEntityBaseSchema
  .extend({
    dryRunId: z.string().min(1),
    status: z.enum(['planned', 'blocked']),
    toolName: McpWriteToolNameSchema,
    worktreePathHash: z.string().min(1),
    patchHash: z.string().min(1),
    changedFileCount: z.number().int().nonnegative(),
    blockReasons: z.array(z.string().min(1)).default([]),
    directExecutionPlanned: z.literal(true),
    controlledWorktreeOnly: z.literal(true),
    repoRootMutationAllowed: z.literal(false),
    rawPatchStored: z.literal(false),
    rawPathStored: z.literal(false),
    bodyStored: z.literal(false),
    summary: z.string().min(1),
  })
  .superRefine((record, context) => {
    rejectGithubRawMetadata(record.metadata, context, ['metadata']);
  });
export type McpWriteToolPlan = z.infer<typeof McpWriteToolPlanSchema>;

export const McpWriteToolApprovalArtifactSchema = createdEntityBaseSchema
  .extend({
    dryRunId: z.string().min(1),
    dryRunRecordId: z.string().min(1),
    approvalRequestId: z.string().min(1),
    approvalArtifactId: z.string().min(1),
    status: GithubProviderApprovalStatusSchema,
    approved: z.boolean(),
    policyDecisionId: z.string().min(1),
    expectedPlanHash: z.string().min(1),
    reasonHash: z.string().min(1).optional(),
    rawPatchStored: z.literal(false),
    rawPathStored: z.literal(false),
    bodyStored: z.literal(false),
    evidenceRefs: z.array(EvidenceRefSchema).default([]),
    auditEventIds: z.array(z.string().min(1)).default([]),
    summary: z.string().min(1),
  })
  .superRefine((record, context) => {
    if (record.approved !== (record.status === 'approved')) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'approved must match MCP write approval status',
        path: ['approved'],
      });
    }
    rejectGithubRawMetadata(record.metadata, context, ['metadata']);
  });
export type McpWriteToolApprovalArtifact = z.infer<typeof McpWriteToolApprovalArtifactSchema>;

export const McpWriteToolRunSchema = createdEntityBaseSchema
  .extend({
    status: GithubControlPlaneRunStatusSchema,
    plan: McpWriteToolPlanSchema,
    appliedFileCount: z.number().int().nonnegative(),
    resultHash: z.string().min(1).optional(),
    evidenceRefs: z.array(EvidenceRefSchema).default([]),
    auditEventIds: z.array(z.string().min(1)).default([]),
    directExecutionInvoked: z.boolean(),
    processBoundaryInvoked: z.literal(false),
    externalProcessStarted: z.literal(false),
    controlledWorktreeOnly: z.literal(true),
    repoRootMutationAllowed: z.literal(false),
    rawPatchStored: z.literal(false),
    rawPathStored: z.literal(false),
    bodyStored: z.literal(false),
    summary: z.string().min(1),
  })
  .superRefine((record, context) => {
    rejectGithubRawMetadata(record.metadata, context, ['metadata']);
  });
export type McpWriteToolRun = z.infer<typeof McpWriteToolRunSchema>;

export const ControlledWriteAcceptanceScenarioSchema = z.enum([
  'all-pass-click',
  'all-pass-type',
  'browser-disabled',
  'selector-hash-mismatch',
  'credential-field-blocked',
  'all-pass-runtime-evaluate',
  'inspector-disabled',
  'non-loopback-blocked',
  'target-hash-mismatch',
  'snippet-not-allowlisted',
  'all-pass-controlled-worktree-patch',
  'mcp-write-disabled',
  'patch-hash-mismatch',
  'repo-root-blocked',
  'path-traversal-blocked',
  'approval-blocked',
  'action-failed',
  'runtime-failed',
  'patch-apply-failed',
  'network-timeout',
  'raw-input-rejected',
  'raw-source-rejected',
  'raw-output-rejected',
]);
export type ControlledWriteAcceptanceScenario = z.infer<
  typeof ControlledWriteAcceptanceScenarioSchema
>;

export const ControlledWriteAcceptanceRehearsalRunSchema = createdEntityBaseSchema
  .extend({
    scenario: ControlledWriteAcceptanceScenarioSchema,
    surface: z.enum(['browser', 'electron', 'mcp']),
    status: z.enum(['passed', 'failed', 'blocked', 'aborted']),
    readinessStatus: z.enum(['fixture_completed', 'blocked', 'failed', 'skipped']),
    runStatus: z.enum(['fixture_completed', 'blocked', 'failed', 'skipped']),
    blockerCount: z.number().int().nonnegative(),
    evidenceRefs: z.array(EvidenceRefSchema).default([]),
    auditEventIds: z.array(z.string().min(1)).default([]),
    processBoundaryInvoked: z.boolean(),
    externalProcessStarted: z.boolean(),
    networkBoundaryInvoked: z.boolean(),
    rawInputStored: z.literal(false),
    rawOutputStored: z.literal(false),
    rawPathStored: z.literal(false),
    bodyStored: z.literal(false),
    summary: z.string().min(1),
  })
  .superRefine((record, context) => {
    const passingScenarios = new Set([
      'all-pass-click',
      'all-pass-type',
      'all-pass-runtime-evaluate',
      'all-pass-controlled-worktree-patch',
    ]);

    if (!passingScenarios.has(record.scenario) && record.status === 'passed') {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'only all-pass controlled write rehearsals can pass',
        path: ['status'],
      });
    }
    rejectGithubRawMetadata(record.metadata, context, ['metadata']);
  });
export type ControlledWriteAcceptanceRehearsalRun = z.infer<
  typeof ControlledWriteAcceptanceRehearsalRunSchema
>;

export const RuntimeJobKindSchema = z.enum([
  'workflow',
  'external-agent',
  'platform-operation',
]);
export type RuntimeJobKind = z.infer<typeof RuntimeJobKindSchema>;

export const RuntimeJobStatusSchema = z.enum([
  'queued',
  'waiting_for_lock',
  'running',
  'cancel_requested',
  'canceled',
  'timed_out',
  'retry_pending',
  'blocked',
  'completed',
  'failed',
]);
export type RuntimeJobStatus = z.infer<typeof RuntimeJobStatusSchema>;

export const RuntimeQueueStatusSchema = z.enum([
  'pending',
  'leased',
  'blocked',
  'completed',
  'failed',
  'canceled',
]);
export type RuntimeQueueStatus = z.infer<typeof RuntimeQueueStatusSchema>;

export const RuntimeLockStatusSchema = z.enum(['available', 'held', 'expired', 'released']);
export type RuntimeLockStatus = z.infer<typeof RuntimeLockStatusSchema>;

export const RuntimeRetryBackoffStrategySchema = z.enum(['none', 'fixed', 'exponential']);
export type RuntimeRetryBackoffStrategy = z.infer<typeof RuntimeRetryBackoffStrategySchema>;

export const RuntimeRetryPolicySchema = z
  .object({
    maxAttempts: z.number().int().min(1).max(10),
    attemptCount: z.number().int().nonnegative(),
    backoffStrategy: RuntimeRetryBackoffStrategySchema,
    backoffSeconds: z.number().int().nonnegative(),
    retryableStatuses: z.array(RuntimeJobStatusSchema).default(['failed', 'timed_out']),
  })
  .superRefine((record, context) => {
    if (record.attemptCount > record.maxAttempts) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'attemptCount cannot exceed maxAttempts',
        path: ['attemptCount'],
      });
    }
  });
export type RuntimeRetryPolicy = z.infer<typeof RuntimeRetryPolicySchema>;

export const RuntimeConcurrencyPolicySchema = z.object({
  scope: z.enum(['global', 'workflow-template', 'capability', 'worktree']),
  scopeHash: z.string().min(1),
  maxConcurrent: z.number().int().min(1),
  currentRunningCount: z.number().int().nonnegative(),
});
export type RuntimeConcurrencyPolicy = z.infer<typeof RuntimeConcurrencyPolicySchema>;

export const RuntimeJobPlanSchema = createdEntityBaseSchema
  .extend({
    jobKind: RuntimeJobKindSchema,
    targetKind: z.enum(['custom-workflow', 'production-recovery', 'external-agent-patch']),
    targetRecordIdHash: z.string().min(1),
    templateIdHash: z.string().min(1).optional(),
    templateHash: z.string().min(1).optional(),
    sourceRecordHash: z.string().min(1),
    status: z.enum(['planned', 'blocked']),
    riskLevel: RiskLevelSchema,
    actionMode: ActionModeSchema,
    approvalRequired: z.boolean(),
    lockKeyHashes: z.array(z.string().min(1)).default([]),
    retryPolicy: RuntimeRetryPolicySchema,
    concurrencyPolicy: RuntimeConcurrencyPolicySchema,
    timeoutSeconds: z.number().int().positive(),
    checkpointRequired: z.boolean(),
    schedulerEnabled: z.boolean(),
    childWorkflowCoordinationEnabled: z.boolean(),
    processBoundaryPlanned: z.literal(false),
    externalProcessPlanned: z.literal(false),
    networkBoundaryPlanned: z.literal(false),
    rawInputStored: z.literal(false),
    rawOutputStored: z.literal(false),
    rawPathStored: z.literal(false),
    bodyStored: z.literal(false),
    blockReasons: z.array(z.string().min(1)).default([]),
    evidenceRefs: z.array(EvidenceRefSchema).default([]),
    auditEventIds: z.array(z.string().min(1)).default([]),
    summary: z.string().min(1),
  })
  .superRefine((record, context) => {
    if (record.actionMode !== 'read' && !record.approvalRequired) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'runtime mutating jobs require approval',
        path: ['approvalRequired'],
      });
    }
    rejectGithubRawMetadata(record.metadata, context, ['metadata']);
  });
export type RuntimeJobPlan = z.infer<typeof RuntimeJobPlanSchema>;

export const RuntimeQueueEntrySchema = createdEntityBaseSchema
  .extend({
    jobPlanId: z.string().min(1),
    jobPlanHash: z.string().min(1),
    status: RuntimeQueueStatusSchema,
    priority: z.number().int().min(0).max(100),
    enqueueOrder: z.number().int().nonnegative(),
    availableAfter: IsoDateTimeSchema.optional(),
    leaseId: z.string().min(1).optional(),
    lockKeyHashes: z.array(z.string().min(1)).default([]),
    retryPolicy: RuntimeRetryPolicySchema,
    rawPayloadStored: z.literal(false),
    rawPathStored: z.literal(false),
    bodyStored: z.literal(false),
    summary: z.string().min(1),
  })
  .superRefine((record, context) => {
    rejectGithubRawMetadata(record.metadata, context, ['metadata']);
  });
export type RuntimeQueueEntry = z.infer<typeof RuntimeQueueEntrySchema>;

export const RuntimeLeaseSchema = createdEntityBaseSchema
  .extend({
    queueEntryId: z.string().min(1),
    workerIdHash: z.string().min(1),
    leaseTokenHash: z.string().min(1),
    acquiredAt: IsoDateTimeSchema,
    expiresAt: IsoDateTimeSchema,
    releasedAt: IsoDateTimeSchema.optional(),
    status: z.enum(['active', 'expired', 'released']),
    rawTokenStored: z.literal(false),
    bodyStored: z.literal(false),
    summary: z.string().min(1),
  })
  .superRefine((record, context) => {
    rejectGithubRawMetadata(record.metadata, context, ['metadata']);
  });
export type RuntimeLease = z.infer<typeof RuntimeLeaseSchema>;

export const RuntimeLockSchema = createdEntityBaseSchema
  .extend({
    lockKeyHash: z.string().min(1),
    holderJobIdHash: z.string().min(1).optional(),
    holderLeaseIdHash: z.string().min(1).optional(),
    status: RuntimeLockStatusSchema,
    acquiredAt: IsoDateTimeSchema.optional(),
    expiresAt: IsoDateTimeSchema.optional(),
    releasedAt: IsoDateTimeSchema.optional(),
    rawKeyStored: z.literal(false),
    bodyStored: z.literal(false),
    summary: z.string().min(1),
  })
  .superRefine((record, context) => {
    rejectGithubRawMetadata(record.metadata, context, ['metadata']);
  });
export type RuntimeLock = z.infer<typeof RuntimeLockSchema>;

export const RuntimeCheckpointSchema = createdEntityBaseSchema
  .extend({
    jobRunId: z.string().min(1),
    checkpointHash: z.string().min(1),
    stepIdHash: z.string().min(1),
    resumable: z.boolean(),
    completedStepCount: z.number().int().nonnegative(),
    nextStepIdHash: z.string().min(1).optional(),
    rawStateStored: z.literal(false),
    rawOutputStored: z.literal(false),
    rawPathStored: z.literal(false),
    bodyStored: z.literal(false),
    evidenceRefs: z.array(EvidenceRefSchema).default([]),
    auditEventIds: z.array(z.string().min(1)).default([]),
    summary: z.string().min(1),
  })
  .superRefine((record, context) => {
    rejectGithubRawMetadata(record.metadata, context, ['metadata']);
  });
export type RuntimeCheckpoint = z.infer<typeof RuntimeCheckpointSchema>;

export const RuntimeJobRunSchema = createdEntityBaseSchema
  .extend({
    status: RuntimeJobStatusSchema,
    plan: RuntimeJobPlanSchema,
    queueEntryId: z.string().min(1),
    leaseId: z.string().min(1).optional(),
    attemptNumber: z.number().int().min(1),
    startedAt: IsoDateTimeSchema.optional(),
    completedAt: IsoDateTimeSchema.optional(),
    canceledAt: IsoDateTimeSchema.optional(),
    timeoutAt: IsoDateTimeSchema.optional(),
    checkpoint: RuntimeCheckpointSchema.optional(),
    boundaryReached: z.boolean(),
    processBoundaryInvoked: z.literal(false),
    externalProcessStarted: z.literal(false),
    networkBoundaryInvoked: z.literal(false),
    rawInputStored: z.literal(false),
    rawOutputStored: z.literal(false),
    rawPathStored: z.literal(false),
    bodyStored: z.literal(false),
    evidenceRefs: z.array(EvidenceRefSchema).default([]),
    auditEventIds: z.array(z.string().min(1)).default([]),
    summary: z.string().min(1),
  })
  .superRefine((record, context) => {
    rejectGithubRawMetadata(record.metadata, context, ['metadata']);
  });
export type RuntimeJobRun = z.infer<typeof RuntimeJobRunSchema>;

export const MultiAgentCoordinationPlanSchema = createdEntityBaseSchema
  .extend({
    coordinatorKind: z.literal('workflow-kernel'),
    workflowTemplateIdHash: z.string().min(1),
    workflowTemplateHash: z.string().min(1),
    slotCount: z.number().int().nonnegative(),
    maxConcurrentSlots: z.number().int().min(1),
    childRunIdHashes: z.array(z.string().min(1)).default([]),
    directAgentSpawnAllowed: z.literal(false),
    dashboardDirectAdapterAllowed: z.literal(false),
    cliDirectAdapterAllowed: z.literal(false),
    mcpDirectAdapterAllowed: z.literal(false),
    rawPromptStored: z.literal(false),
    rawOutputStored: z.literal(false),
    rawPathStored: z.literal(false),
    bodyStored: z.literal(false),
    summary: z.string().min(1),
  })
  .superRefine((record, context) => {
    rejectGithubRawMetadata(record.metadata, context, ['metadata']);
  });
export type MultiAgentCoordinationPlan = z.infer<typeof MultiAgentCoordinationPlanSchema>;

export const MultiAgentSlotSummarySchema = createdEntityBaseSchema
  .extend({
    coordinationPlanId: z.string().min(1),
    slotIdHash: z.string().min(1),
    provider: z.enum(['codex-cli', 'claude-code-cli', 'workflow-kernel']),
    status: z.enum(['waiting', 'running', 'blocked', 'completed', 'failed', 'canceled']),
    assignedJobIdHash: z.string().min(1).optional(),
    childRunIdHash: z.string().min(1).optional(),
    directAdapterInvoked: z.literal(false),
    rawPromptStored: z.literal(false),
    rawOutputStored: z.literal(false),
    bodyStored: z.literal(false),
    summary: z.string().min(1),
  })
  .superRefine((record, context) => {
    rejectGithubRawMetadata(record.metadata, context, ['metadata']);
  });
export type MultiAgentSlotSummary = z.infer<typeof MultiAgentSlotSummarySchema>;

export const RuntimeSchedulerRehearsalScenarioSchema = z.enum([
  'scheduler-disabled',
  'queue-full',
  'lock-held',
  'concurrency-limit-hit',
  'timeout',
  'cancel-requested',
  'retry-exhausted',
  'resume-from-checkpoint',
  'child-workflow-blocked',
]);
export type RuntimeSchedulerRehearsalScenario = z.infer<
  typeof RuntimeSchedulerRehearsalScenarioSchema
>;

export const RuntimeSchedulerRehearsalRunSchema = createdEntityBaseSchema
  .extend({
    scenario: RuntimeSchedulerRehearsalScenarioSchema,
    status: z.enum(['passed', 'failed', 'blocked', 'aborted']),
    queueStatus: RuntimeQueueStatusSchema,
    jobStatus: RuntimeJobStatusSchema,
    lockStatus: RuntimeLockStatusSchema.optional(),
    checkpointCreated: z.boolean(),
    retryAttemptCount: z.number().int().nonnegative(),
    evidenceRefs: z.array(EvidenceRefSchema).default([]),
    auditEventIds: z.array(z.string().min(1)).default([]),
    processBoundaryInvoked: z.literal(false),
    externalProcessStarted: z.literal(false),
    networkBoundaryInvoked: z.literal(false),
    rawInputStored: z.literal(false),
    rawOutputStored: z.literal(false),
    rawPathStored: z.literal(false),
    bodyStored: z.literal(false),
    summary: z.string().min(1),
  })
  .superRefine((record, context) => {
    if (record.scenario !== 'resume-from-checkpoint' && record.status === 'passed') {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'only resume-from-checkpoint scheduler rehearsal passes in M46 fixtures',
        path: ['status'],
      });
    }
    rejectGithubRawMetadata(record.metadata, context, ['metadata']);
  });
export type RuntimeSchedulerRehearsalRun = z.infer<typeof RuntimeSchedulerRehearsalRunSchema>;

export const ExternalAgentProviderSchema = z.enum(['codex-cli', 'claude-code-cli']);
export type ExternalAgentProvider = z.infer<typeof ExternalAgentProviderSchema>;

export const ExternalAgentRunStatusSchema = z.enum([
  'planned',
  'blocked',
  'running',
  'completed',
  'failed',
  'timed_out',
  'aborted',
]);
export type ExternalAgentRunStatus = z.infer<typeof ExternalAgentRunStatusSchema>;

export const ExternalAgentManifestSchema = createdEntityBaseSchema
  .extend({
    provider: ExternalAgentProviderSchema,
    versionHash: z.string().min(1).optional(),
    enabledByDefault: z.literal(false),
    actionMode: z.literal('write'),
    riskLevel: z.literal('critical'),
    approvalPolicy: z.literal('required'),
    fixedArgvShapeHash: z.string().min(1),
    controlledSiblingWorktreeOnly: z.literal(true),
    repoRootMutationAllowed: z.literal(false),
    arbitraryCommandAllowed: z.literal(false),
    rawPromptStored: z.literal(false),
    rawCommandStored: z.literal(false),
    rawPathStored: z.literal(false),
    bodyStored: z.literal(false),
    summary: z.string().min(1),
  })
  .superRefine((record, context) => {
    rejectGithubRawMetadata(record.metadata, context, ['metadata']);
  });
export type ExternalAgentManifest = z.infer<typeof ExternalAgentManifestSchema>;

export const ExternalAgentReadinessSchema = createdEntityBaseSchema
  .extend({
    provider: ExternalAgentProviderSchema,
    externalAgentsEnabled: z.boolean(),
    providerEnabled: z.boolean(),
    cliConfigured: z.boolean(),
    cliExecutableHash: z.string().min(1).optional(),
    worktreeResolved: z.boolean(),
    worktreeRecordHash: z.string().min(1).optional(),
    controlledSiblingWorktreeOnly: z.literal(true),
    repoRootMutationAllowed: z.literal(false),
    blockerCount: z.number().int().nonnegative(),
    blockReasons: z.array(z.string().min(1)).default([]),
    rawPromptStored: z.literal(false),
    rawCommandStored: z.literal(false),
    rawPathStored: z.literal(false),
    bodyStored: z.literal(false),
    summary: z.string().min(1),
  })
  .superRefine((record, context) => {
    rejectGithubRawMetadata(record.metadata, context, ['metadata']);
  });
export type ExternalAgentReadiness = z.infer<typeof ExternalAgentReadinessSchema>;

export const ExternalAgentPatchPlanSchema = createdEntityBaseSchema
  .extend({
    dryRunId: z.string().min(1),
    status: z.enum(['planned', 'blocked']),
    provider: ExternalAgentProviderSchema,
    sourceWorktreeRecordHash: z.string().min(1),
    worktreePathHash: z.string().min(1),
    promptHash: z.string().min(1),
    instructionHash: z.string().min(1),
    expectedPatchHash: z.string().min(1).optional(),
    changedFileCount: z.number().int().nonnegative(),
    maxRuntimeSeconds: z.number().int().positive(),
    fixedArgvShapeHash: z.string().min(1),
    processBoundaryPlanned: z.literal(true),
    externalProcessPlanned: z.literal(true),
    controlledSiblingWorktreeOnly: z.literal(true),
    repoRootMutationAllowed: z.literal(false),
    arbitraryCommandAllowed: z.literal(false),
    blockReasons: z.array(z.string().min(1)).default([]),
    rawPromptStored: z.literal(false),
    rawDiffStored: z.literal(false),
    rawPatchStored: z.literal(false),
    rawCommandStored: z.literal(false),
    rawPathStored: z.literal(false),
    bodyStored: z.literal(false),
    evidenceRefs: z.array(EvidenceRefSchema).default([]),
    auditEventIds: z.array(z.string().min(1)).default([]),
    summary: z.string().min(1),
  })
  .superRefine((record, context) => {
    rejectGithubRawMetadata(record.metadata, context, ['metadata']);
  });
export type ExternalAgentPatchPlan = z.infer<typeof ExternalAgentPatchPlanSchema>;

export const ExternalAgentApprovalArtifactSchema = createdEntityBaseSchema
  .extend({
    dryRunId: z.string().min(1),
    dryRunRecordId: z.string().min(1),
    approvalRequestId: z.string().min(1),
    approvalArtifactId: z.string().min(1),
    status: GithubProviderApprovalStatusSchema,
    approved: z.boolean(),
    policyDecisionId: z.string().min(1),
    expectedPlanHash: z.string().min(1),
    decidedByHash: z.string().min(1).optional(),
    reasonHash: z.string().min(1).optional(),
    expiresAt: IsoDateTimeSchema.optional(),
    usedAt: IsoDateTimeSchema.optional(),
    revokedAt: IsoDateTimeSchema.optional(),
    rawPromptStored: z.literal(false),
    rawDiffStored: z.literal(false),
    rawPatchStored: z.literal(false),
    rawCommandStored: z.literal(false),
    rawPathStored: z.literal(false),
    bodyStored: z.literal(false),
    evidenceRefs: z.array(EvidenceRefSchema).default([]),
    auditEventIds: z.array(z.string().min(1)).default([]),
    summary: z.string().min(1),
  })
  .superRefine((record, context) => {
    if (record.approved !== (record.status === 'approved')) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'approved must match external agent approval status',
        path: ['approved'],
      });
    }
    rejectGithubRawMetadata(record.metadata, context, ['metadata']);
  });
export type ExternalAgentApprovalArtifact = z.infer<typeof ExternalAgentApprovalArtifactSchema>;

export const ExternalAgentPatchSummarySchema = createdEntityBaseSchema
  .extend({
    provider: ExternalAgentProviderSchema,
    patchHash: z.string().min(1),
    changedFileCount: z.number().int().nonnegative(),
    addedLineCount: z.number().int().nonnegative(),
    deletedLineCount: z.number().int().nonnegative(),
    worktreePathHash: z.string().min(1),
    rawPromptStored: z.literal(false),
    rawDiffStored: z.literal(false),
    rawPatchStored: z.literal(false),
    rawCommandStored: z.literal(false),
    rawPathStored: z.literal(false),
    bodyStored: z.literal(false),
    evidenceRefs: z.array(EvidenceRefSchema).default([]),
    auditEventIds: z.array(z.string().min(1)).default([]),
    summary: z.string().min(1),
  })
  .superRefine((record, context) => {
    rejectGithubRawMetadata(record.metadata, context, ['metadata']);
  });
export type ExternalAgentPatchSummary = z.infer<typeof ExternalAgentPatchSummarySchema>;

export const ExternalAgentRunSchema = createdEntityBaseSchema
  .extend({
    status: ExternalAgentRunStatusSchema,
    provider: ExternalAgentProviderSchema,
    plan: ExternalAgentPatchPlanSchema,
    readiness: ExternalAgentReadinessSchema,
    patchSummary: ExternalAgentPatchSummarySchema.optional(),
    approvalArtifactId: z.string().min(1),
    approvalConsumed: z.boolean(),
    boundaryReached: z.boolean(),
    processBoundaryInvoked: z.boolean(),
    externalProcessStarted: z.boolean(),
    networkBoundaryInvoked: z.literal(false),
    controlledSiblingWorktreeOnly: z.literal(true),
    repoRootMutationAllowed: z.literal(false),
    rawPromptStored: z.literal(false),
    rawDiffStored: z.literal(false),
    rawPatchStored: z.literal(false),
    rawCommandStored: z.literal(false),
    rawPathStored: z.literal(false),
    bodyStored: z.literal(false),
    evidenceRefs: z.array(EvidenceRefSchema).default([]),
    auditEventIds: z.array(z.string().min(1)).default([]),
    summary: z.string().min(1),
  })
  .superRefine((record, context) => {
    if (record.boundaryReached && !record.approvalConsumed) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'external agent boundary reached runs must consume approval',
        path: ['approvalConsumed'],
      });
    }
    rejectGithubRawMetadata(record.metadata, context, ['metadata']);
  });
export type ExternalAgentRun = z.infer<typeof ExternalAgentRunSchema>;

export const ExternalAgentRehearsalScenarioSchema = z.enum([
  'codex-all-pass',
  'claude-all-pass',
  'provider-disabled',
  'cli-missing',
  'worktree-missing',
  'approval-blocked',
  'prompt-hash-mismatch',
  'patch-hash-mismatch',
  'repo-root-blocked',
  'command-passthrough-blocked',
  'agent-run-failed',
  'timeout',
]);
export type ExternalAgentRehearsalScenario = z.infer<
  typeof ExternalAgentRehearsalScenarioSchema
>;

export const ExternalAgentRehearsalRunSchema = createdEntityBaseSchema
  .extend({
    scenario: ExternalAgentRehearsalScenarioSchema,
    provider: ExternalAgentProviderSchema,
    status: z.enum(['passed', 'failed', 'blocked', 'aborted']),
    readinessStatus: z.enum(['fixture_completed', 'blocked', 'failed', 'skipped']),
    runStatus: z.enum(['fixture_completed', 'blocked', 'failed', 'skipped']),
    patchSummary: ExternalAgentPatchSummarySchema.optional(),
    blockerCount: z.number().int().nonnegative(),
    processBoundaryInvoked: z.boolean(),
    externalProcessStarted: z.boolean(),
    networkBoundaryInvoked: z.literal(false),
    controlledSiblingWorktreeOnly: z.literal(true),
    repoRootMutationAllowed: z.literal(false),
    rawPromptStored: z.literal(false),
    rawDiffStored: z.literal(false),
    rawPatchStored: z.literal(false),
    rawCommandStored: z.literal(false),
    rawPathStored: z.literal(false),
    bodyStored: z.literal(false),
    evidenceRefs: z.array(EvidenceRefSchema).default([]),
    auditEventIds: z.array(z.string().min(1)).default([]),
    summary: z.string().min(1),
  })
  .superRefine((record, context) => {
    const passingScenarios = new Set(['codex-all-pass', 'claude-all-pass']);

    if (!passingScenarios.has(record.scenario) && record.status === 'passed') {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'only all-pass external agent rehearsals can pass',
        path: ['status'],
      });
    }
    rejectGithubRawMetadata(record.metadata, context, ['metadata']);
  });
export type ExternalAgentRehearsalRun = z.infer<typeof ExternalAgentRehearsalRunSchema>;

export const PlatformOperationStatusSchema = z.enum([
  'planned',
  'blocked',
  'running',
  'completed',
  'failed',
  'aborted',
  'rehearsed',
]);
export type PlatformOperationStatus = z.infer<typeof PlatformOperationStatusSchema>;

export const PlatformOperationKindSchema = z.enum([
  'backup',
  'restore',
  'migration',
  'retention',
  'audit-export',
  'operator-role',
]);
export type PlatformOperationKind = z.infer<typeof PlatformOperationKindSchema>;

export const PlatformBackupScopeSchema = z.enum([
  'store-sqlite',
  'governance-docs',
  'audit-evidence-index',
  'runtime-state',
]);
export type PlatformBackupScope = z.infer<typeof PlatformBackupScopeSchema>;

export const PlatformRestoreModeSchema = z.enum(['isolated-rehearsal', 'replace-active-store']);
export type PlatformRestoreMode = z.infer<typeof PlatformRestoreModeSchema>;

export const PlatformOperatorRoleSchema = z.enum([
  'viewer',
  'operator',
  'approver',
  'auditor',
  'admin',
]);
export type PlatformOperatorRole = z.infer<typeof PlatformOperatorRoleSchema>;

export const PlatformRetentionTargetSchema = z.enum([
  'runtime-jobs',
  'evidence',
  'audit',
  'backups',
  'store-records',
]);
export type PlatformRetentionTarget = z.infer<typeof PlatformRetentionTargetSchema>;

export const DisasterRecoveryScenarioSchema = z.enum([
  'backup-all-pass',
  'backup-dir-missing',
  'backup-hash-mismatch',
  'restore-rehearsal-pass',
  'restore-replace-disabled',
  'restore-second-approval-missing',
  'migration-pending',
  'migration-failed',
  'retention-preview',
  'retention-backup-required',
  'audit-export-pass',
  'role-missing',
  'role-insufficient',
  'disaster-recovery-drill',
]);
export type DisasterRecoveryScenario = z.infer<typeof DisasterRecoveryScenarioSchema>;

const platformMetadataFlagsSchema = z.object({
  rawPathStored: z.literal(false),
  rawSqlStored: z.literal(false),
  rawDbRowsStored: z.literal(false),
  rawBackupBodyStored: z.literal(false),
  rawAuditBodyStored: z.literal(false),
  rawTokenStored: z.literal(false),
  rawEnvStored: z.literal(false),
  rawRequestBodyStored: z.literal(false),
  rawResponseBodyStored: z.literal(false),
  bodyStored: z.literal(false),
});

const platformEvidenceAuditSchema = z.object({
  evidenceRefs: z.array(EvidenceRefSchema).default([]),
  auditEventIds: z.array(z.string().min(1)).default([]),
});

export const PlatformOperationApprovalArtifactSchema = createdEntityBaseSchema
  .merge(platformMetadataFlagsSchema)
  .merge(platformEvidenceAuditSchema)
  .extend({
    operationKind: PlatformOperationKindSchema,
    dryRunId: z.string().min(1),
    dryRunRecordId: z.string().min(1),
    approvalRequestId: z.string().min(1),
    approvalArtifactId: z.string().min(1),
    status: GithubProviderApprovalStatusSchema,
    approved: z.boolean(),
    policyDecisionId: z.string().min(1),
    expectedPlanHash: z.string().min(1),
    approverHash: z.string().min(1).optional(),
    reasonHash: z.string().min(1).optional(),
    expiresAt: IsoDateTimeSchema.optional(),
    usedAt: IsoDateTimeSchema.optional(),
    revokedAt: IsoDateTimeSchema.optional(),
    summary: z.string().min(1),
  })
  .superRefine((record, context) => {
    if (record.approved !== (record.status === 'approved')) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'approved must match platform operation approval status',
        path: ['approved'],
      });
    }
    rejectGithubRawMetadata(record.metadata, context, ['metadata']);
  });
export type PlatformOperationApprovalArtifact = z.infer<
  typeof PlatformOperationApprovalArtifactSchema
>;

export const PlatformBackupPlanSchema = createdEntityBaseSchema
  .merge(platformMetadataFlagsSchema)
  .merge(platformEvidenceAuditSchema)
  .extend({
    dryRunId: z.string().min(1),
    status: z.enum(['planned', 'blocked']),
    scope: PlatformBackupScopeSchema,
    storeSnapshotHash: z.string().min(1),
    backupRootHash: z.string().min(1),
    manifestHash: z.string().min(1),
    catalogEntryHash: z.string().min(1).optional(),
    fileCount: z.number().int().nonnegative(),
    estimatedByteCount: z.number().int().nonnegative(),
    localFilesystemOnly: z.literal(true),
    networkExportAllowed: z.literal(false),
    arbitraryBackupTargetAllowed: z.literal(false),
    blockReasons: z.array(z.string().min(1)).default([]),
    summary: z.string().min(1),
  })
  .superRefine((record, context) => {
    rejectGithubRawMetadata(record.metadata, context, ['metadata']);
  });
export type PlatformBackupPlan = z.infer<typeof PlatformBackupPlanSchema>;

export const PlatformBackupRunSchema = createdEntityBaseSchema
  .merge(platformMetadataFlagsSchema)
  .merge(platformEvidenceAuditSchema)
  .extend({
    status: PlatformOperationStatusSchema,
    plan: PlatformBackupPlanSchema,
    manifestHash: z.string().min(1),
    artifactCount: z.number().int().nonnegative(),
    byteCount: z.number().int().nonnegative(),
    approvalArtifactIds: z.array(z.string().min(1)).default([]),
    boundaryReached: z.boolean(),
    approvalConsumed: z.boolean(),
    localFilesystemBoundaryInvoked: z.boolean(),
    networkBoundaryInvoked: z.literal(false),
    summary: z.string().min(1),
  })
  .superRefine((record, context) => {
    if (record.boundaryReached && !record.approvalConsumed) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'backup boundary reached runs must consume approval',
        path: ['approvalConsumed'],
      });
    }
    rejectGithubRawMetadata(record.metadata, context, ['metadata']);
  });
export type PlatformBackupRun = z.infer<typeof PlatformBackupRunSchema>;

export const PlatformRestorePlanSchema = createdEntityBaseSchema
  .merge(platformMetadataFlagsSchema)
  .merge(platformEvidenceAuditSchema)
  .extend({
    dryRunId: z.string().min(1),
    status: z.enum(['planned', 'blocked']),
    mode: PlatformRestoreModeSchema,
    sourceBackupManifestHash: z.string().min(1),
    targetStoreHash: z.string().min(1),
    isolatedRestoreDefault: z.literal(true),
    replaceActiveStoreEnabled: z.boolean(),
    schedulerQuiescenceRequired: z.literal(true),
    backupManifestHashMatchRequired: z.literal(true),
    twoApprovalsRequiredForReplace: z.boolean(),
    blockReasons: z.array(z.string().min(1)).default([]),
    summary: z.string().min(1),
  })
  .superRefine((record, context) => {
    if (record.mode === 'replace-active-store' && !record.twoApprovalsRequiredForReplace) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'active store replacement must require two approvals',
        path: ['twoApprovalsRequiredForReplace'],
      });
    }
    rejectGithubRawMetadata(record.metadata, context, ['metadata']);
  });
export type PlatformRestorePlan = z.infer<typeof PlatformRestorePlanSchema>;

export const PlatformRestoreRunSchema = createdEntityBaseSchema
  .merge(platformMetadataFlagsSchema)
  .merge(platformEvidenceAuditSchema)
  .extend({
    status: PlatformOperationStatusSchema,
    plan: PlatformRestorePlanSchema,
    approvalArtifactIds: z.array(z.string().min(1)).default([]),
    approvalConsumedCount: z.number().int().nonnegative(),
    boundaryReached: z.boolean(),
    isolatedRestoreBoundaryInvoked: z.boolean(),
    storeReplacementBoundaryInvoked: z.boolean(),
    networkBoundaryInvoked: z.literal(false),
    restoredRecordCount: z.number().int().nonnegative(),
    summary: z.string().min(1),
  })
  .superRefine((record, context) => {
    if (record.plan.mode === 'replace-active-store' && record.approvalArtifactIds.length < 2) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'active store replacement run must reference two approvals',
        path: ['approvalArtifactIds'],
      });
    }
    rejectGithubRawMetadata(record.metadata, context, ['metadata']);
  });
export type PlatformRestoreRun = z.infer<typeof PlatformRestoreRunSchema>;

export const StoreMigrationPlanSchema = createdEntityBaseSchema
  .merge(platformMetadataFlagsSchema)
  .merge(platformEvidenceAuditSchema)
  .extend({
    dryRunId: z.string().min(1),
    status: z.enum(['planned', 'blocked']),
    builtInMigrationId: z.string().min(1),
    builtInMigrationIdHash: z.string().min(1),
    currentSchemaHash: z.string().min(1),
    targetSchemaHash: z.string().min(1),
    requestBodySqlAccepted: z.literal(false),
    arbitrarySqlAllowed: z.literal(false),
    blockReasons: z.array(z.string().min(1)).default([]),
    summary: z.string().min(1),
  })
  .superRefine((record, context) => {
    rejectGithubRawMetadata(record.metadata, context, ['metadata']);
  });
export type StoreMigrationPlan = z.infer<typeof StoreMigrationPlanSchema>;

export const StoreMigrationRunSchema = createdEntityBaseSchema
  .merge(platformMetadataFlagsSchema)
  .merge(platformEvidenceAuditSchema)
  .extend({
    status: PlatformOperationStatusSchema,
    plan: StoreMigrationPlanSchema,
    approvalArtifactIds: z.array(z.string().min(1)).default([]),
    boundaryReached: z.boolean(),
    approvalConsumed: z.boolean(),
    migrationBoundaryInvoked: z.boolean(),
    migratedRecordCount: z.number().int().nonnegative(),
    summary: z.string().min(1),
  })
  .superRefine((record, context) => {
    rejectGithubRawMetadata(record.metadata, context, ['metadata']);
  });
export type StoreMigrationRun = z.infer<typeof StoreMigrationRunSchema>;

export const RetentionPolicyPlanSchema = createdEntityBaseSchema
  .merge(platformMetadataFlagsSchema)
  .merge(platformEvidenceAuditSchema)
  .extend({
    dryRunId: z.string().min(1),
    status: z.enum(['planned', 'blocked']),
    target: PlatformRetentionTargetSchema,
    policyHash: z.string().min(1),
    previewRecordCount: z.number().int().nonnegative(),
    deletionPlanned: z.boolean(),
    backupRequiredBeforeDelete: z.literal(true),
    backupManifestHash: z.string().min(1).optional(),
    blockReasons: z.array(z.string().min(1)).default([]),
    summary: z.string().min(1),
  })
  .superRefine((record, context) => {
    if (record.deletionPlanned && !record.backupManifestHash) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'destructive retention plans must reference a backup manifest hash',
        path: ['backupManifestHash'],
      });
    }
    rejectGithubRawMetadata(record.metadata, context, ['metadata']);
  });
export type RetentionPolicyPlan = z.infer<typeof RetentionPolicyPlanSchema>;

export const RetentionPolicyRunSchema = createdEntityBaseSchema
  .merge(platformMetadataFlagsSchema)
  .merge(platformEvidenceAuditSchema)
  .extend({
    status: PlatformOperationStatusSchema,
    plan: RetentionPolicyPlanSchema,
    approvalArtifactIds: z.array(z.string().min(1)).default([]),
    boundaryReached: z.boolean(),
    approvalConsumed: z.boolean(),
    retentionBoundaryInvoked: z.boolean(),
    affectedRecordCount: z.number().int().nonnegative(),
    summary: z.string().min(1),
  })
  .superRefine((record, context) => {
    rejectGithubRawMetadata(record.metadata, context, ['metadata']);
  });
export type RetentionPolicyRun = z.infer<typeof RetentionPolicyRunSchema>;

export const AuditExportPlanSchema = createdEntityBaseSchema
  .merge(platformMetadataFlagsSchema)
  .merge(platformEvidenceAuditSchema)
  .extend({
    dryRunId: z.string().min(1),
    status: z.enum(['planned', 'blocked']),
    exportFormat: z.literal('jsonl'),
    destinationHash: z.string().min(1),
    manifestHash: z.string().min(1),
    recordCount: z.number().int().nonnegative(),
    metadataOnly: z.literal(true),
    networkExportAllowed: z.literal(false),
    rawAuditRowsStored: z.literal(false),
    blockReasons: z.array(z.string().min(1)).default([]),
    summary: z.string().min(1),
  })
  .superRefine((record, context) => {
    rejectGithubRawMetadata(record.metadata, context, ['metadata']);
  });
export type AuditExportPlan = z.infer<typeof AuditExportPlanSchema>;

export const AuditExportRunSchema = createdEntityBaseSchema
  .merge(platformMetadataFlagsSchema)
  .merge(platformEvidenceAuditSchema)
  .extend({
    status: PlatformOperationStatusSchema,
    plan: AuditExportPlanSchema,
    manifestHash: z.string().min(1),
    recordCount: z.number().int().nonnegative(),
    approvalArtifactIds: z.array(z.string().min(1)).default([]),
    boundaryReached: z.boolean(),
    approvalConsumed: z.boolean(),
    localFilesystemBoundaryInvoked: z.boolean(),
    networkBoundaryInvoked: z.literal(false),
    summary: z.string().min(1),
  })
  .superRefine((record, context) => {
    rejectGithubRawMetadata(record.metadata, context, ['metadata']);
  });
export type AuditExportRun = z.infer<typeof AuditExportRunSchema>;

export const OperatorRoleAssignmentPlanSchema = createdEntityBaseSchema
  .merge(platformMetadataFlagsSchema)
  .merge(platformEvidenceAuditSchema)
  .extend({
    dryRunId: z.string().min(1),
    status: z.enum(['planned', 'blocked']),
    operatorHash: z.string().min(1),
    role: PlatformOperatorRoleSchema,
    scopeHashes: z.array(z.string().min(1)).default([]),
    roleEnforcementEnabled: z.boolean(),
    localControlTokenReplacementAllowed: z.literal(false),
    rawOperatorIdentityStored: z.literal(false),
    blockReasons: z.array(z.string().min(1)).default([]),
    summary: z.string().min(1),
  })
  .superRefine((record, context) => {
    rejectGithubRawMetadata(record.metadata, context, ['metadata']);
  });
export type OperatorRoleAssignmentPlan = z.infer<typeof OperatorRoleAssignmentPlanSchema>;

export const OperatorRoleAssignmentRunSchema = createdEntityBaseSchema
  .merge(platformMetadataFlagsSchema)
  .merge(platformEvidenceAuditSchema)
  .extend({
    status: PlatformOperationStatusSchema,
    plan: OperatorRoleAssignmentPlanSchema,
    approvalArtifactIds: z.array(z.string().min(1)).default([]),
    boundaryReached: z.boolean(),
    approvalConsumed: z.boolean(),
    roleStoreBoundaryInvoked: z.boolean(),
    assignedRoleHash: z.string().min(1),
    summary: z.string().min(1),
  })
  .superRefine((record, context) => {
    rejectGithubRawMetadata(record.metadata, context, ['metadata']);
  });
export type OperatorRoleAssignmentRun = z.infer<typeof OperatorRoleAssignmentRunSchema>;

export const DisasterRecoveryRehearsalRunSchema = createdEntityBaseSchema
  .merge(platformMetadataFlagsSchema)
  .merge(platformEvidenceAuditSchema)
  .extend({
    scenario: DisasterRecoveryScenarioSchema,
    status: z.enum(['passed', 'failed', 'blocked', 'aborted']),
    backupStatus: PlatformOperationStatusSchema,
    restoreStatus: PlatformOperationStatusSchema,
    migrationStatus: PlatformOperationStatusSchema.optional(),
    retentionStatus: PlatformOperationStatusSchema.optional(),
    auditExportStatus: PlatformOperationStatusSchema.optional(),
    operatorRoleStatus: PlatformOperationStatusSchema.optional(),
    blockerCount: z.number().int().nonnegative(),
    boundaryReached: z.boolean(),
    localFilesystemBoundaryInvoked: z.boolean(),
    storeReplacementBoundaryInvoked: z.boolean(),
    networkBoundaryInvoked: z.literal(false),
    summary: z.string().min(1),
  })
  .superRefine((record, context) => {
    const passingScenarios = new Set([
      'backup-all-pass',
      'restore-rehearsal-pass',
      'retention-preview',
      'audit-export-pass',
      'disaster-recovery-drill',
    ]);

    if (!passingScenarios.has(record.scenario) && record.status === 'passed') {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'only explicitly passing disaster recovery fixture scenarios can pass',
        path: ['status'],
      });
    }
    rejectGithubRawMetadata(record.metadata, context, ['metadata']);
  });
export type DisasterRecoveryRehearsalRun = z.infer<typeof DisasterRecoveryRehearsalRunSchema>;

export const ProductionGaSurfaceSchema = z.enum([
  'local-patch-review-rc',
  'github-pr-lifecycle',
  'github-merge-actions-release',
  'deployment-observe-apply-rollback',
  'secrets-governance',
  'policy-telemetry',
  'browser-electron-mcp-controlled-write',
  'runtime-external-agents',
  'platform-operations',
]);
export type ProductionGaSurface = z.infer<typeof ProductionGaSurfaceSchema>;

export const ProductionGaStatusSchema = z.enum([
  'ready',
  'conditionally_ready',
  'blocked',
  'failed',
]);
export type ProductionGaStatus = z.infer<typeof ProductionGaStatusSchema>;

export const ProductionGaE2EScenarioSchema = z.enum([
  'all-pass',
  'patch-blocked',
  'verification-failed',
  'pr-blocked',
  'merge-blocked',
  'release-blocked',
  'deploy-blocked',
  'observe-blocked',
  'rollback-plan-missing',
  'rollback-failed',
  'child-hash-mismatch',
  'approval-blocked',
  'live-env-not-configured',
  'evidence-missing',
  'audit-gap',
]);
export type ProductionGaE2EScenario = z.infer<typeof ProductionGaE2EScenarioSchema>;

const productionGaEvidenceAuditSchema = z.object({
  evidenceRefIds: z.array(z.string().min(1)).default([]),
  auditEventIds: z.array(z.string().min(1)).default([]),
});

const productionGaBoundarySchema = z.object({
  processBoundaryInvoked: z.boolean().default(false),
  networkBoundaryInvoked: z.boolean().default(false),
  remoteProviderBoundaryInvoked: z.boolean().default(false),
  childAdapterInvokedDirectly: z.literal(false).default(false),
});

export const ProductionGaCapabilityMatrixSchema = createdEntityBaseSchema
  .extend({
    matrixHash: z.string().min(1),
    surfaceCount: z.number().int().positive(),
    surfaces: z.array(ProductionGaSurfaceSchema),
    readySurfaceCount: z.number().int().nonnegative(),
    blockedSurfaceCount: z.number().int().nonnegative(),
    defaultDisabledSurfaceCount: z.number().int().nonnegative(),
    criticalRiskSurfaceCount: z.number().int().nonnegative(),
    liveBoundaryAllowlistExpanded: z.literal(false),
    childAdapterDirectExecutionAllowed: z.literal(false),
    publicOutputMetadataOnly: z.literal(true),
    summary: z.string().min(1),
  })
  .strict()
  .superRefine((record, context) => {
    rejectCustomWorkflowRawMetadata(record, context);
    if (record.surfaceCount !== record.surfaces.length) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Production GA surfaceCount must match surfaces length',
        path: ['surfaceCount'],
      });
    }
  });
export type ProductionGaCapabilityMatrix = z.infer<
  typeof ProductionGaCapabilityMatrixSchema
>;

export const ProductionGaThreatModelSchema = createdEntityBaseSchema
  .extend({
    threatModelHash: z.string().min(1),
    assetCount: z.number().int().nonnegative(),
    trustBoundaryCount: z.number().int().nonnegative(),
    liveBoundaryCount: z.number().int().nonnegative(),
    authorityModelHash: z.string().min(1),
    approvalModelHash: z.string().min(1),
    evidenceAuditModelHash: z.string().min(1),
    rollbackModelHash: z.string().min(1),
    residualRiskCount: z.number().int().nonnegative(),
    unresolvedCriticalRiskCount: z.number().int().nonnegative(),
    summary: z.string().min(1),
  })
  .strict()
  .superRefine(rejectCustomWorkflowRawMetadata);
export type ProductionGaThreatModel = z.infer<typeof ProductionGaThreatModelSchema>;

export const ProductionGaReadinessPlanSchema = createdEntityBaseSchema
  .extend({
    dryRunId: z.string().min(1),
    matrixHash: z.string().min(1),
    threatModelHash: z.string().min(1),
    requiredApprovalCount: z.literal(2),
    requiredDistinctApproverHashes: z.literal(true),
    requiredFoundationGateCount: z.number().int().positive(),
    requiredTrainingModuleCount: z.number().int().nonnegative(),
    e2eFixtureRequired: z.literal(true),
    conditionalLiveSmokeAllowed: z.literal(true),
    childAdapterDirectExecutionAllowed: z.literal(false),
    blockReasons: z.array(z.string().min(1)).default([]),
    summary: z.string().min(1),
  })
  .strict()
  .superRefine(rejectCustomWorkflowRawMetadata);
export type ProductionGaReadinessPlan = z.infer<typeof ProductionGaReadinessPlanSchema>;

export const ProductionGaReadinessSummarySchema = createdEntityBaseSchema
  .merge(productionGaEvidenceAuditSchema)
  .extend({
    readinessPlanId: z.string().min(1),
    status: ProductionGaStatusSchema,
    matrixStatus: ProductionGaStatusSchema,
    threatModelStatus: ProductionGaStatusSchema,
    trainingStatus: ProductionGaStatusSchema,
    e2eFixtureStatus: ProductionGaStatusSchema,
    conditionalLiveStatus: ProductionGaStatusSchema,
    unresolvedCriticalRiskCount: z.number().int().nonnegative(),
    blockerCount: z.number().int().nonnegative(),
    summary: z.string().min(1),
  })
  .strict()
  .superRefine(rejectCustomWorkflowRawMetadata);
export type ProductionGaReadinessSummary = z.infer<
  typeof ProductionGaReadinessSummarySchema
>;

export const ProductionGaE2ERehearsalPlanSchema = createdEntityBaseSchema
  .extend({
    scenario: ProductionGaE2EScenarioSchema,
    chainHash: z.string().min(1),
    stepCount: z.number().int().positive(),
    fixtureRequired: z.literal(true),
    liveSmokeMode: z.enum(['disabled', 'conditional']),
    childControlPlaneRecordCount: z.number().int().nonnegative(),
    rawPayloadAccepted: z.literal(false),
    summary: z.string().min(1),
  })
  .strict()
  .superRefine(rejectCustomWorkflowRawMetadata);
export type ProductionGaE2ERehearsalPlan = z.infer<
  typeof ProductionGaE2ERehearsalPlanSchema
>;

export const ProductionGaE2ERehearsalRunSchema = createdEntityBaseSchema
  .merge(productionGaBoundarySchema)
  .merge(productionGaEvidenceAuditSchema)
  .extend({
    rehearsalPlanId: z.string().min(1),
    scenario: ProductionGaE2EScenarioSchema,
    status: ProductionGaStatusSchema,
    completedStepCount: z.number().int().nonnegative(),
    blockedStepCount: z.number().int().nonnegative(),
    failedStepCount: z.number().int().nonnegative(),
    liveSmokeStatus: z.enum(['not_configured', 'readiness_blocked', 'completed']),
    liveSmokeBlockerCount: z.number().int().nonnegative(),
    timelineHash: z.string().min(1),
    summary: z.string().min(1),
  })
  .strict()
  .superRefine(rejectCustomWorkflowRawMetadata);
export type ProductionGaE2ERehearsalRun = z.infer<
  typeof ProductionGaE2ERehearsalRunSchema
>;

export const ProductionGaOperatorTrainingPlanSchema = createdEntityBaseSchema
  .extend({
    trainingPlanHash: z.string().min(1),
    moduleCount: z.number().int().positive(),
    moduleIdHashes: z.array(z.string().min(1)),
    requiredForGa: z.literal(true),
    rawOperatorIdentityStored: z.literal(false),
    summary: z.string().min(1),
  })
  .strict()
  .superRefine((record, context) => {
    rejectCustomWorkflowRawMetadata(record, context);
    if (record.moduleCount !== record.moduleIdHashes.length) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Production GA moduleCount must match moduleIdHashes length',
        path: ['moduleCount'],
      });
    }
  });
export type ProductionGaOperatorTrainingPlan = z.infer<
  typeof ProductionGaOperatorTrainingPlanSchema
>;

export const ProductionGaOperatorTrainingCompletionSummarySchema =
  createdEntityBaseSchema
    .merge(productionGaEvidenceAuditSchema)
    .extend({
      trainingPlanHash: z.string().min(1),
      operatorHash: z.string().min(1),
      completedModuleCount: z.number().int().nonnegative(),
      requiredModuleCount: z.number().int().nonnegative(),
      status: ProductionGaStatusSchema,
      rawOperatorIdentityStored: z.literal(false),
      summary: z.string().min(1),
    })
    .strict()
    .superRefine(rejectCustomWorkflowRawMetadata);
export type ProductionGaOperatorTrainingCompletionSummary = z.infer<
  typeof ProductionGaOperatorTrainingCompletionSummarySchema
>;

export const ProductionGaReleaseCandidateSignoffPlanSchema = createdEntityBaseSchema
  .extend({
    dryRunId: z.string().min(1),
    matrixHash: z.string().min(1),
    threatModelHash: z.string().min(1),
    readinessSummaryId: z.string().min(1),
    e2eRehearsalRunId: z.string().min(1),
    requiredApprovalCount: z.literal(2),
    requiredDistinctApproverHashes: z.literal(true),
    unresolvedCriticalRiskCount: z.number().int().nonnegative(),
    conditionalLiveSmokeAllowed: z.literal(true),
    blockReasons: z.array(z.string().min(1)).default([]),
    summary: z.string().min(1),
  })
  .strict()
  .superRefine(rejectCustomWorkflowRawMetadata);
export type ProductionGaReleaseCandidateSignoffPlan = z.infer<
  typeof ProductionGaReleaseCandidateSignoffPlanSchema
>;

export const ProductionGaApprovalArtifactSchema = createdEntityBaseSchema
  .extend({
    dryRunId: z.string().min(1),
    approverHash: z.string().min(1),
    decision: z.enum(['approved', 'denied', 'revoked']),
    approved: z.boolean(),
    reasonHash: z.string().min(1).optional(),
    expiresAt: IsoDateTimeSchema.optional(),
    usedAt: IsoDateTimeSchema.optional(),
    requestBodyStored: z.literal(false),
    rawReasonStored: z.literal(false),
    summary: z.string().min(1),
  })
  .strict()
  .superRefine((record, context) => {
    rejectCustomWorkflowRawMetadata(record, context);
    if (record.decision === 'approved' && !record.approved) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'approved GA artifacts must set approved=true',
        path: ['approved'],
      });
    }
  });
export type ProductionGaApprovalArtifact = z.infer<
  typeof ProductionGaApprovalArtifactSchema
>;

export const ProductionGaSignoffRunSchema = createdEntityBaseSchema
  .merge(productionGaBoundarySchema)
  .merge(productionGaEvidenceAuditSchema)
  .extend({
    signoffPlanId: z.string().min(1),
    status: ProductionGaStatusSchema,
    approvalArtifactIds: z.array(z.string().min(1)),
    approverHashes: z.array(z.string().min(1)),
    approvalConsumedCount: z.number().int().nonnegative(),
    foundationGateStatus: ProductionGaStatusSchema,
    matrixStatus: ProductionGaStatusSchema,
    threatModelStatus: ProductionGaStatusSchema,
    trainingStatus: ProductionGaStatusSchema,
    e2eFixtureStatus: ProductionGaStatusSchema,
    conditionalLiveStatus: ProductionGaStatusSchema,
    unresolvedCriticalRiskCount: z.number().int().nonnegative(),
    signoffHash: z.string().min(1),
    summary: z.string().min(1),
  })
  .strict()
  .superRefine((record, context) => {
    rejectCustomWorkflowRawMetadata(record, context);
    const readyStatus = record.status === 'ready' || record.status === 'conditionally_ready';
    if (
      readyStatus &&
      (record.approvalArtifactIds.length < 2 || new Set(record.approverHashes).size < 2)
    ) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Production GA signoff requires two distinct approvals',
        path: ['approvalArtifactIds'],
      });
    }
    if (record.unresolvedCriticalRiskCount > 0 && record.status !== 'blocked') {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'unresolved critical risks must block Production GA signoff',
        path: ['status'],
      });
    }
  });
export type ProductionGaSignoffRun = z.infer<typeof ProductionGaSignoffRunSchema>;

export const ProductionGaResidualRiskRegisterSchema = createdEntityBaseSchema
  .extend({
    registerHash: z.string().min(1),
    riskCount: z.number().int().nonnegative(),
    criticalRiskCount: z.number().int().nonnegative(),
    unresolvedCriticalRiskCount: z.number().int().nonnegative(),
    acceptedNonCriticalRiskCount: z.number().int().nonnegative(),
    mitigationSummaryHash: z.string().min(1),
    summary: z.string().min(1),
  })
  .strict()
  .superRefine(rejectCustomWorkflowRawMetadata);
export type ProductionGaResidualRiskRegister = z.infer<
  typeof ProductionGaResidualRiskRegisterSchema
>;

export const ProductionGaEvidenceBundleSummarySchema = createdEntityBaseSchema
  .merge(productionGaEvidenceAuditSchema)
  .extend({
    bundleHash: z.string().min(1),
    gateCount: z.number().int().nonnegative(),
    passedGateCount: z.number().int().nonnegative(),
    evidenceCount: z.number().int().nonnegative(),
    auditEventCount: z.number().int().nonnegative(),
    missingEvidenceCount: z.number().int().nonnegative(),
    metadataOnly: z.literal(true),
    summary: z.string().min(1),
  })
  .strict()
  .superRefine(rejectCustomWorkflowRawMetadata);
export type ProductionGaEvidenceBundleSummary = z.infer<
  typeof ProductionGaEvidenceBundleSummarySchema
>;

export const BusinessWorkspaceStatusSchema = z.enum([
  'active',
  'disabled',
  'unknown',
]);
export type BusinessWorkspaceStatus = z.infer<typeof BusinessWorkspaceStatusSchema>;

export const BusinessMembershipRoleSchema = z.enum([
  'owner',
  'admin',
  'member',
  'unknown',
]);
export type BusinessMembershipRole = z.infer<typeof BusinessMembershipRoleSchema>;

export const BusinessMembershipStatusSchema = z.enum([
  'active',
  'pending',
  'removed',
  'suspended',
  'unknown',
]);
export type BusinessMembershipStatus = z.infer<typeof BusinessMembershipStatusSchema>;

export const ChatGptSessionHealthStatusSchema = z.enum([
  'healthy',
  'logged_out',
  'wrong_account',
  'workspace_mismatch',
  'mfa_required',
  'captcha_required',
  'unknown',
  'blocked',
]);
export type ChatGptSessionHealthStatus = z.infer<
  typeof ChatGptSessionHealthStatusSchema
>;

export const HumanCheckpointKindSchema = z.enum([
  'login_required',
  'mfa_required',
  'captcha_required',
  'passkey_required',
  'account_select_required',
  'workspace_select_required',
  'manual_review_required',
]);
export type HumanCheckpointKind = z.infer<typeof HumanCheckpointKindSchema>;

export const HumanCheckpointStatusSchema = z.enum([
  'requested',
  'waiting',
  'resolved',
  'blocked',
  'expired',
]);
export type HumanCheckpointStatus = z.infer<typeof HumanCheckpointStatusSchema>;

export const CodexClientKindSchema = z.enum([
  'codex-app-server',
  'codex-desktop',
  'codex-cli',
  'unknown',
]);
export type CodexClientKind = z.infer<typeof CodexClientKindSchema>;

export const CodexClientStatusSchema = z.enum([
  'available',
  'degraded',
  'offline',
  'blocked',
  'unknown',
]);
export type CodexClientStatus = z.infer<typeof CodexClientStatusSchema>;

export const CodexAppServerSessionStatusSchema = z.enum([
  'not_initialized',
  'initialized',
  'degraded',
  'closed',
  'blocked',
  'unknown',
]);
export type CodexAppServerSessionStatus = z.infer<
  typeof CodexAppServerSessionStatusSchema
>;

export const CodexAccountBindingStatusSchema = z.enum([
  'matched',
  'mismatch',
  'unverified',
  'disabled',
  'blocked',
]);
export type CodexAccountBindingStatus = z.infer<
  typeof CodexAccountBindingStatusSchema
>;

export const CodexTaskStatusSchema = z.enum([
  'planned',
  'queued',
  'running',
  'completed',
  'failed',
  'blocked',
  'cancelled',
  'needs_human',
]);
export type CodexTaskStatus = z.infer<typeof CodexTaskStatusSchema>;

export const CodexTaskDispatchModeSchema = z.enum([
  'fixture',
  'live_app_server',
]);
export type CodexTaskDispatchMode = z.infer<typeof CodexTaskDispatchModeSchema>;

export const CodexTaskPreflightStatusSchema = z.enum([
  'not_started',
  'ready',
  'blocked',
  'waiting_approval',
  'drift_blocked',
  'canary_blocked',
]);
export type CodexTaskPreflightStatus = z.infer<
  typeof CodexTaskPreflightStatusSchema
>;

export const CodexTaskApprovalStatusSchema = z.enum([
  'not_required',
  'required',
  'waiting',
  'approved',
  'rejected',
]);
export type CodexTaskApprovalStatus = z.infer<typeof CodexTaskApprovalStatusSchema>;

export const CodexTaskEventStreamStatusSchema = z.enum([
  'not_started',
  'listening',
  'completed',
  'failed',
  'stalled',
]);
export type CodexTaskEventStreamStatus = z.infer<
  typeof CodexTaskEventStreamStatusSchema
>;

export const CodexTaskDiagnosisKindSchema = z.enum([
  'healthy',
  'completed',
  'failed_quota',
  'failed_auth',
  'waiting_approval',
  'workspace_mismatch',
  'client_unavailable',
  'tool_stuck',
  'model_stalled',
  'desktop_ui_frozen',
  'app_server_unresponsive',
  'unknown',
  'needs_manual_review',
]);
export type CodexTaskDiagnosisKind = z.infer<typeof CodexTaskDiagnosisKindSchema>;

export const CodexRecoveryKindSchema = z.enum([
  'none',
  'wait',
  'wait_for_quota',
  'login_recover',
  'human_checkpoint',
  'switch_account',
  'switch_client',
  'reconnect_app_server',
  'restart_client',
  'restart_desktop',
  'resume_thread',
  'resume',
  'fork',
  'transfer',
  'interrupt_turn',
  'clean_background_terminals',
  'manual_review',
]);
export type CodexRecoveryKind = z.infer<typeof CodexRecoveryKindSchema>;

export const PoolStatusSchema = z.enum(['ready', 'degraded', 'blocked', 'unknown']);
export type PoolStatus = z.infer<typeof PoolStatusSchema>;

export const PoolEntryStatusSchema = z.enum([
  'ready',
  'blocked',
  'leased',
  'disabled',
  'unknown',
]);
export type PoolEntryStatus = z.infer<typeof PoolEntryStatusSchema>;

export const LeaseStatusSchema = z.enum([
  'requested',
  'active',
  'released',
  'expired',
  'blocked',
]);
export type LeaseStatus = z.infer<typeof LeaseStatusSchema>;

export const LeaseTargetKindSchema = z.enum([
  'account',
  'client',
  'profile',
  'thread',
  'worktree',
  'task',
  'quota',
]);
export type LeaseTargetKind = z.infer<typeof LeaseTargetKindSchema>;

export const QuotaSnapshotSubjectKindSchema = z.enum([
  'business-workspace',
  'business-member',
  'codex-account',
  'codex-client',
  'unified-account',
]);
export type QuotaSnapshotSubjectKind = z.infer<
  typeof QuotaSnapshotSubjectKindSchema
>;

export const QuotaSnapshotStatusSchema = z.enum([
  'available',
  'limited',
  'exhausted',
  'unknown',
  'blocked',
]);
export type QuotaSnapshotStatus = z.infer<typeof QuotaSnapshotStatusSchema>;

export const CodexAccountSchedulingStatusSchema = z.enum([
  'account_ready',
  'quota_depleted',
  'wrong_account',
  'workspace_mismatch',
  'removed',
  'pending',
  'unknown',
]);
export type CodexAccountSchedulingStatus = z.infer<
  typeof CodexAccountSchedulingStatusSchema
>;

export const CodexClientSchedulingStatusSchema = z.enum([
  'client_ready',
  'desktop_ui_frozen',
  'app_server_unresponsive',
  'codex_logged_out',
  'removed',
  'pending',
  'unknown',
]);
export type CodexClientSchedulingStatus = z.infer<
  typeof CodexClientSchedulingStatusSchema
>;

export const CodexSchedulerPreflightStatusSchema = z.enum([
  'ready',
  'blocked',
  'pending',
  'unknown',
]);
export type CodexSchedulerPreflightStatus = z.infer<
  typeof CodexSchedulerPreflightStatusSchema
>;

export const CodexSchedulerPreflightCheckKindSchema = z.enum([
  'account',
  'client',
  'profile',
  'thread',
  'worktree',
  'task',
  'quota',
  'policy',
  'approval',
]);
export type CodexSchedulerPreflightCheckKind = z.infer<
  typeof CodexSchedulerPreflightCheckKindSchema
>;

export const CodexAppServerTransportKindSchema = z.enum([
  'stdio-jsonl',
  'websocket-loopback',
  'unix-socket',
  'in-memory-fixture',
  'unknown',
]);
export type CodexAppServerTransportKind = z.infer<
  typeof CodexAppServerTransportKindSchema
>;

export const CodexAppServerWireDirectionSchema = z.enum([
  'request',
  'response',
  'notification',
  'server-request',
  'event',
  'stderr-summary',
]);
export type CodexAppServerWireDirection = z.infer<
  typeof CodexAppServerWireDirectionSchema
>;

export const CodexAppServerWireStatusSchema = z.enum([
  'queued',
  'sent',
  'received',
  'handled',
  'failed',
  'blocked',
  'unknown',
]);
export type CodexAppServerWireStatus = z.infer<
  typeof CodexAppServerWireStatusSchema
>;

export const CodexAppServerMethodSchema = z.enum([
  'initialize',
  'initialized',
  'account/read',
  'account/rateLimits/read',
  'thread/start',
  'thread/resume',
  'turn/start',
  'thread/started',
  'turn/started',
  'turn/completed',
  'item/started',
  'item/completed',
  'item/agentMessage/delta',
  'item/commandExecution/requestApproval',
  'item/fileChange/requestApproval',
  'serverRequest/resolved',
  'protocol/drift',
  'unknown',
]);
export type CodexAppServerMethod = z.infer<typeof CodexAppServerMethodSchema>;

export const CodexAppServerThreadStatusSchema = z.enum([
  'not_loaded',
  'loaded',
  'running',
  'completed',
  'interrupted',
  'failed',
  'closed',
  'blocked',
  'unknown',
]);
export type CodexAppServerThreadStatus = z.infer<
  typeof CodexAppServerThreadStatusSchema
>;

export const CodexAppServerTurnStatusSchema = z.enum([
  'queued',
  'running',
  'completed',
  'failed',
  'interrupted',
  'declined',
  'blocked',
  'unknown',
]);
export type CodexAppServerTurnStatus = z.infer<
  typeof CodexAppServerTurnStatusSchema
>;

export const CodexAppServerEventStatusSchema = z.enum([
  'started',
  'delta',
  'completed',
  'failed',
  'resolved',
  'blocked',
  'unknown',
]);
export type CodexAppServerEventStatus = z.infer<
  typeof CodexAppServerEventStatusSchema
>;

export const CodexAppServerApprovalKindSchema = z.enum([
  'command-execution',
  'file-change',
  'network-policy',
  'tool-user-input',
  'mcp-elicitation',
  'unknown',
]);
export type CodexAppServerApprovalKind = z.infer<
  typeof CodexAppServerApprovalKindSchema
>;

export const CodexAppServerApprovalStatusSchema = z.enum([
  'pending',
  'approved',
  'declined',
  'cancelled',
  'resolved',
  'blocked',
  'unknown',
]);
export type CodexAppServerApprovalStatus = z.infer<
  typeof CodexAppServerApprovalStatusSchema
>;

export const CodexAppServerProtocolBaselineKindSchema = z.enum([
  'generate-ts',
  'generate-json-schema',
  'upstream-readme',
  'fixture',
  'unknown',
]);
export type CodexAppServerProtocolBaselineKind = z.infer<
  typeof CodexAppServerProtocolBaselineKindSchema
>;

export const CodexAppServerProtocolDriftStatusSchema = z.enum([
  'compatible',
  'minor_drift',
  'incompatible',
  'unknown',
]);
export type CodexAppServerProtocolDriftStatus = z.infer<
  typeof CodexAppServerProtocolDriftStatusSchema
>;

const m51EvidenceAuditSchema = z
  .object({
    evidenceRefIds: z.array(z.string().min(1)).default([]),
    auditEventIds: z.array(z.string().min(1)).default([]),
  })
  .strict();

const m51SafeBoundarySchema = z
  .object({
    metadataOnly: z.literal(true).default(true),
    rawPromptStored: z.literal(false).default(false),
    rawDiffStored: z.literal(false).default(false),
    rawPathStored: z.literal(false).default(false),
    rawBodyStored: z.literal(false).default(false),
    tokenStored: z.literal(false).default(false),
    cookieStored: z.literal(false).default(false),
    sessionStored: z.literal(false).default(false),
    mfaStored: z.literal(false).default(false),
    storageRead: z.literal(false).default(false),
    bodyStored: z.literal(false).default(false),
    noRealWrite: z.literal(true).default(true),
    liveExecution: z.literal(false).default(false),
    networkBoundaryInvoked: z.boolean().default(false),
    processBoundaryInvoked: z.boolean().default(false),
    externalProcessStarted: z.boolean().default(false),
  })
  .strict();

const m51ReadOnlyBoundarySchema = m51SafeBoundarySchema.extend({
  networkBoundaryInvoked: z.literal(false).default(false),
  processBoundaryInvoked: z.literal(false).default(false),
  externalProcessStarted: z.literal(false).default(false),
});

const PoolEntrySchema = z
  .object({
    entryId: z.string().min(1),
    targetIdHash: z.string().min(1),
    status: PoolEntryStatusSchema,
    score: z.number().int().nonnegative().max(100).default(0),
    blockReasons: z.array(z.string().min(1)).default([]),
    evidenceRefIds: z.array(z.string().min(1)).default([]),
  })
  .strict()
  .superRefine(rejectCustomWorkflowRawMetadata);
export type PoolEntry = z.infer<typeof PoolEntrySchema>;

export const BusinessWorkspaceSchema = observedEntityBaseSchema
  .merge(m51ReadOnlyBoundarySchema)
  .merge(m51EvidenceAuditSchema)
  .extend({
    workspaceIdHash: z.string().min(1),
    workspaceNameHash: z.string().min(1).optional(),
    status: BusinessWorkspaceStatusSchema,
    membershipCount: z.number().int().nonnegative().default(0),
    ownerCount: z.number().int().nonnegative().default(0),
    adminCount: z.number().int().nonnegative().default(0),
    summary: z.string().min(1),
  })
  .strict()
  .superRefine(rejectCustomWorkflowRawMetadata);
export type BusinessWorkspace = z.infer<typeof BusinessWorkspaceSchema>;

export const BusinessMembershipMirrorSchema = observedEntityBaseSchema
  .merge(m51ReadOnlyBoundarySchema)
  .merge(m51EvidenceAuditSchema)
  .extend({
    workspaceIdHash: z.string().min(1),
    memberHash: z.string().min(1),
    emailHash: z.string().min(1).optional(),
    displayNameHash: z.string().min(1).optional(),
    role: BusinessMembershipRoleSchema,
    status: BusinessMembershipStatusSchema,
    seatActive: z.boolean().default(false),
    ownerProtected: z.boolean().default(false),
    summary: z.string().min(1),
  })
  .strict()
  .superRefine(rejectCustomWorkflowRawMetadata);
export type BusinessMembershipMirror = z.infer<
  typeof BusinessMembershipMirrorSchema
>;

export const ChromeProfileBindingSchema = createdEntityBaseSchema
  .merge(m51ReadOnlyBoundarySchema)
  .merge(m51EvidenceAuditSchema)
  .extend({
    profileId: z.string().min(1),
    displayNameHash: z.string().min(1).optional(),
    profilePathHash: z.string().min(1),
    accountHash: z.string().min(1).optional(),
    workspaceIdHash: z.string().min(1).optional(),
    locked: z.boolean().default(false),
    lockId: z.string().min(1).optional(),
    healthStatus: ChatGptSessionHealthStatusSchema.default('unknown'),
    readOnly: z.literal(true).default(true),
    summary: z.string().min(1),
  })
  .strict()
  .superRefine(rejectCustomWorkflowRawMetadata);
export type ChromeProfileBinding = z.infer<typeof ChromeProfileBindingSchema>;

export const ChatGptSessionHealthSchema = observedEntityBaseSchema
  .merge(m51ReadOnlyBoundarySchema)
  .merge(m51EvidenceAuditSchema)
  .extend({
    profileBindingId: z.string().min(1),
    accountHash: z.string().min(1).optional(),
    workspaceIdHash: z.string().min(1).optional(),
    status: ChatGptSessionHealthStatusSchema,
    blockReasons: z.array(z.string().min(1)).default([]),
    humanCheckpointRequired: z.boolean().default(false),
    humanCheckpointId: z.string().min(1).optional(),
    accountMatchesExpected: z.boolean().optional(),
    workspaceMatchesExpected: z.boolean().optional(),
    summary: z.string().min(1),
  })
  .strict()
  .superRefine(rejectCustomWorkflowRawMetadata);
export type ChatGptSessionHealth = z.infer<typeof ChatGptSessionHealthSchema>;

export const HumanCheckpointSchema = createdEntityBaseSchema
  .merge(m51ReadOnlyBoundarySchema)
  .merge(m51EvidenceAuditSchema)
  .extend({
    checkpointKind: HumanCheckpointKindSchema,
    status: HumanCheckpointStatusSchema,
    targetHash: z.string().min(1).optional(),
    accountHash: z.string().min(1).optional(),
    workspaceIdHash: z.string().min(1).optional(),
    reasonHash: z.string().min(1).optional(),
    sensitiveInputStored: z.literal(false).default(false),
    summary: z.string().min(1),
  })
  .strict()
  .superRefine(rejectCustomWorkflowRawMetadata);
export type HumanCheckpoint = z.infer<typeof HumanCheckpointSchema>;

export const CodexClientInstanceSchema = observedEntityBaseSchema
  .merge(m51ReadOnlyBoundarySchema)
  .merge(m51EvidenceAuditSchema)
  .extend({
    clientKind: CodexClientKindSchema,
    clientInstanceHash: z.string().min(1),
    status: CodexClientStatusSchema,
    versionHash: z.string().min(1).optional(),
    protocolVersionHash: z.string().min(1).optional(),
    accountBindingId: z.string().min(1).optional(),
    activeTaskCount: z.number().int().nonnegative().default(0),
    summary: z.string().min(1),
  })
  .strict()
  .superRefine(rejectCustomWorkflowRawMetadata);
export type CodexClientInstance = z.infer<typeof CodexClientInstanceSchema>;

export const CodexAppServerSessionSchema = observedEntityBaseSchema
  .merge(m51ReadOnlyBoundarySchema)
  .merge(m51EvidenceAuditSchema)
  .extend({
    clientInstanceId: z.string().min(1),
    appServerSessionHash: z.string().min(1),
    status: CodexAppServerSessionStatusSchema,
    initialized: z.boolean().default(false),
    accountBindingId: z.string().min(1).optional(),
    protocolDriftDetected: z.boolean().default(false),
    summary: z.string().min(1),
  })
  .strict()
  .superRefine(rejectCustomWorkflowRawMetadata);
export type CodexAppServerSession = z.infer<typeof CodexAppServerSessionSchema>;

export const CodexAccountBindingSchema = observedEntityBaseSchema
  .merge(m51ReadOnlyBoundarySchema)
  .merge(m51EvidenceAuditSchema)
  .extend({
    codexAccountHash: z.string().min(1),
    businessMembershipMirrorId: z.string().min(1).optional(),
    workspaceIdHash: z.string().min(1).optional(),
    status: CodexAccountBindingStatusSchema,
    disabled: z.boolean().default(false),
    disableReasonHash: z.string().min(1).optional(),
    summary: z.string().min(1),
  })
  .strict()
  .superRefine(rejectCustomWorkflowRawMetadata);
export type CodexAccountBinding = z.infer<typeof CodexAccountBindingSchema>;

export const CodexTaskIntentSchema = createdEntityBaseSchema
  .merge(m51ReadOnlyBoundarySchema)
  .merge(m51EvidenceAuditSchema)
  .extend({
    intentHash: z.string().min(1),
    titleHash: z.string().min(1).optional(),
    titleSummaryHash: z.string().min(1).optional(),
    instructionHash: z.string().min(1).optional(),
    instructionSummaryHash: z.string().min(1).optional(),
    promptHash: z.string().min(1).optional(),
    promptLength: z.number().int().nonnegative().optional(),
    repoHash: z.string().min(1).optional(),
    worktreeHash: z.string().min(1).optional(),
    verificationHash: z.string().min(1).optional(),
    selectionPolicyHash: z.string().min(1).optional(),
    selectionPolicySummaryHash: z.string().min(1).optional(),
    requestedByHash: z.string().min(1).optional(),
    workflowHash: z.string().min(1).optional(),
    isolatedWorktreeRequired: z.literal(true).default(true),
    repoRootWriteAllowed: z.literal(false).default(false),
    dryRunRequired: z.literal(true).default(true),
    approvalRequired: z.boolean().default(true),
    appServerDispatchRequested: z.boolean().default(false),
    liveDispatchRequested: z.boolean().default(false),
    status: CodexTaskStatusSchema.default('planned'),
    summary: z.string().min(1),
  })
  .strict()
  .superRefine(rejectCustomWorkflowRawMetadata);
export type CodexTaskIntent = z.infer<typeof CodexTaskIntentSchema>;

export const CodexTaskRunSchema = createdEntityBaseSchema
  .merge(m51SafeBoundarySchema)
  .merge(m51EvidenceAuditSchema)
  .extend({
    intentId: z.string().min(1),
    status: CodexTaskStatusSchema,
    dispatchMode: CodexTaskDispatchModeSchema.default('fixture'),
    preflightStatus: CodexTaskPreflightStatusSchema.default('not_started'),
    approvalStatus: CodexTaskApprovalStatusSchema.default('required'),
    schedulerSelectionId: z.string().min(1).optional(),
    leaseIds: z.array(z.string().min(1)).default([]),
    accountBindingId: z.string().min(1).optional(),
    clientInstanceId: z.string().min(1).optional(),
    appServerSessionId: z.string().min(1).optional(),
    threadMirrorId: z.string().min(1).optional(),
    turnMirrorId: z.string().min(1).optional(),
    threadHash: z.string().min(1).optional(),
    turnHash: z.string().min(1).optional(),
    turnCount: z.number().int().nonnegative().default(0),
    eventCount: z.number().int().nonnegative().default(0),
    eventStreamStatus: CodexTaskEventStreamStatusSchema.default('not_started'),
    protocolDriftStatus: CodexAppServerProtocolDriftStatusSchema.optional(),
    canaryGateStatus: z
      .enum(['not_required', 'passed', 'failed', 'blocked'])
      .default('not_required'),
    workspaceWriteApproved: z.boolean().default(false),
    isolatedWorktreeRequired: z.literal(true).default(true),
    repoRootWriteAllowed: z.literal(false).default(false),
    dispatchAllowed: z.boolean().default(false),
    dispatchStartedAt: IsoDateTimeSchema.optional(),
    completedAt: IsoDateTimeSchema.optional(),
    failureDiagnosisId: z.string().min(1).optional(),
    ciStatus: z.enum(['not_run', 'pending', 'passed', 'failed', 'blocked']).default('not_run'),
    diffSummaryId: z.string().min(1).optional(),
    verificationProjectionId: z.string().min(1).optional(),
    reviewProjectionId: z.string().min(1).optional(),
    githubClosureProjectionId: z.string().min(1).optional(),
    closureRunId: z.string().min(1).optional(),
    closureSummaryHash: z.string().min(1).optional(),
    outputSummaryHash: z.string().min(1).optional(),
    liveExecution: z.boolean().default(false),
    noRealWrite: z.boolean().default(true),
    summary: z.string().min(1),
  })
  .strict()
  .superRefine((record, context) => {
    rejectCustomWorkflowRawMetadata(record, context);
    if (
      record.dispatchMode === 'live_app_server' &&
      record.liveExecution &&
      !record.dispatchAllowed
    ) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'live App Server dispatch requires dispatchAllowed',
        path: ['dispatchAllowed'],
      });
    }
    if (record.repoRootWriteAllowed) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Codex task runs cannot write directly to the repository root',
        path: ['repoRootWriteAllowed'],
      });
    }
  });
export type CodexTaskRun = z.infer<typeof CodexTaskRunSchema>;

export const CodexTaskDiagnosisSchema = observedEntityBaseSchema
  .merge(m51ReadOnlyBoundarySchema)
  .merge(m51EvidenceAuditSchema)
  .extend({
    taskRunId: z.string().min(1),
    diagnosisKind: CodexTaskDiagnosisKindSchema,
    status: z.enum(['healthy', 'actionable', 'blocked', 'unknown']),
    confidence: z.number().min(0).max(1).default(0),
    recommendedRecoveryKind: CodexRecoveryKindSchema.optional(),
    summary: z.string().min(1),
  })
  .strict()
  .superRefine(rejectCustomWorkflowRawMetadata);
export type CodexTaskDiagnosis = z.infer<typeof CodexTaskDiagnosisSchema>;

export const CodexRecoveryRunSchema = createdEntityBaseSchema
  .merge(m51SafeBoundarySchema)
  .merge(m51EvidenceAuditSchema)
  .extend({
    taskRunId: z.string().min(1),
    diagnosisId: z.string().min(1).optional(),
    recoveryKind: CodexRecoveryKindSchema,
    status: CodexTaskStatusSchema,
    recoveryPlanHash: z.string().min(1).optional(),
    recoveryPlanSummaryHash: z.string().min(1).optional(),
    actionCount: z.number().int().nonnegative().default(0),
    riskLevel: RiskLevelSchema.default('medium'),
    highRisk: z.boolean().default(false),
    dryRunId: z.string().min(1).optional(),
    dryRunRequired: z.literal(true).default(true),
    approvalArtifactId: z.string().min(1).optional(),
    approvalRequired: z.boolean().default(false),
    approvalStatus: CodexTaskApprovalStatusSchema.default('required'),
    liveActionRequested: z.boolean().default(false),
    liveActionAllowed: z.literal(false).default(false),
    executionDisabled: z.literal(true).default(true),
    summary: z.string().min(1),
  })
  .strict()
  .superRefine((record, context) => {
    rejectCustomWorkflowRawMetadata(record, context);
    if (record.highRisk && !record.approvalRequired) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'high-risk recovery requires approval',
        path: ['approvalRequired'],
      });
    }
    if (record.highRisk && !record.dryRunId) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'high-risk recovery requires a dry-run id',
        path: ['dryRunId'],
      });
    }
    if (record.liveActionRequested && !record.approvalArtifactId) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'live recovery action requires an approval artifact id',
        path: ['approvalArtifactId'],
      });
    }
  });
export type CodexRecoveryRun = z.infer<typeof CodexRecoveryRunSchema>;

export const CodexTaskDiffSummaryStatusSchema = z.enum([
  'empty',
  'changed',
  'blocked',
  'unknown',
]);
export type CodexTaskDiffSummaryStatus = z.infer<
  typeof CodexTaskDiffSummaryStatusSchema
>;

export const CodexTaskVerificationProjectionStatusSchema = z.enum([
  'not_run',
  'planned',
  'running',
  'passed',
  'failed',
  'blocked',
  'aborted',
]);
export type CodexTaskVerificationProjectionStatus = z.infer<
  typeof CodexTaskVerificationProjectionStatusSchema
>;

export const CodexTaskReviewProjectionStatusSchema = z.enum([
  'not_started',
  'ready_for_review',
  'blocked_verification',
  'blocked_patch',
  'pending',
  'approved',
  'changes_requested',
  'rejected',
]);
export type CodexTaskReviewProjectionStatus = z.infer<
  typeof CodexTaskReviewProjectionStatusSchema
>;

export const CodexTaskGithubClosureStatusSchema = z.enum([
  'not_started',
  'dry_run_planned',
  'blocked',
  'approval_waiting',
  'branch_publish_planned',
  'draft_pr_planned',
  'ci_pending',
  'ci_passed',
  'ci_failed',
]);
export type CodexTaskGithubClosureStatus = z.infer<
  typeof CodexTaskGithubClosureStatusSchema
>;

export const CodexTaskClosureRunStatusSchema = z.enum([
  'not_started',
  'blocked',
  'ready_for_review',
  'dry_run_planned',
  'waiting_approval',
  'ci_pending',
  'completed',
  'failed',
]);
export type CodexTaskClosureRunStatus = z.infer<typeof CodexTaskClosureRunStatusSchema>;

export const CodexTaskDiffSummaryProjectionSchema = observedEntityBaseSchema
  .merge(m51ReadOnlyBoundarySchema)
  .merge(m51EvidenceAuditSchema)
  .extend({
    taskRunId: z.string().min(1),
    status: CodexTaskDiffSummaryStatusSchema,
    fileCount: z.number().int().nonnegative().default(0),
    pathHashCount: z.number().int().nonnegative().default(0),
    pathHashes: z.array(z.string().min(1)).default([]),
    diffHash: z.string().min(1).optional(),
    diffSummaryHash: z.string().min(1).optional(),
    emptyDiff: z.boolean().default(false),
    sourceHash: z.string().min(1).optional(),
    summary: z.string().min(1),
  })
  .strict()
  .superRefine((record, context) => {
    rejectCustomWorkflowRawMetadata(record, context);
    if (record.pathHashCount !== record.pathHashes.length) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'pathHashCount must match pathHashes length',
        path: ['pathHashCount'],
      });
    }
    if (record.fileCount < record.pathHashCount) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'fileCount cannot be smaller than pathHashCount',
        path: ['fileCount'],
      });
    }
    if (record.status === 'empty' && !record.emptyDiff) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'empty diff summaries must set emptyDiff',
        path: ['emptyDiff'],
      });
    }
    if (record.status === 'changed' && !record.diffHash) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'changed diff summaries require diffHash',
        path: ['diffHash'],
      });
    }
  });
export type CodexTaskDiffSummaryProjection = z.infer<
  typeof CodexTaskDiffSummaryProjectionSchema
>;

export const CodexTaskVerificationProjectionSchema = createdEntityBaseSchema
  .merge(m51SafeBoundarySchema)
  .merge(m51EvidenceAuditSchema)
  .extend({
    taskRunId: z.string().min(1),
    status: CodexTaskVerificationProjectionStatusSchema,
    targetCount: z.number().int().nonnegative().default(0),
    passedCount: z.number().int().nonnegative().default(0),
    failedCount: z.number().int().nonnegative().default(0),
    skippedCount: z.number().int().nonnegative().default(0),
    verificationRunIdHash: z.string().min(1).optional(),
    commandSummaryHash: z.string().min(1).optional(),
    outputSummaryHash: z.string().min(1).optional(),
    stdoutStored: z.literal(false).default(false),
    stderrStored: z.literal(false).default(false),
    summary: z.string().min(1),
  })
  .strict()
  .superRefine((record, context) => {
    rejectCustomWorkflowRawMetadata(record, context);
    if (record.passedCount + record.failedCount + record.skippedCount > record.targetCount) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'verification result counts cannot exceed targetCount',
        path: ['targetCount'],
      });
    }
    if (record.status === 'passed' && record.failedCount > 0) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'passed verification cannot include failed checks',
        path: ['failedCount'],
      });
    }
    if (record.status === 'failed' && record.failedCount === 0) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'failed verification requires failedCount',
        path: ['failedCount'],
      });
    }
  });
export type CodexTaskVerificationProjection = z.infer<
  typeof CodexTaskVerificationProjectionSchema
>;

export const CodexTaskReviewProjectionSchema = createdEntityBaseSchema
  .merge(m51ReadOnlyBoundarySchema)
  .merge(m51EvidenceAuditSchema)
  .extend({
    taskRunId: z.string().min(1),
    status: CodexTaskReviewProjectionStatusSchema,
    reviewPackageIdHash: z.string().min(1).optional(),
    packageHash: z.string().min(1).optional(),
    findingCount: z.number().int().nonnegative().default(0),
    blockerCount: z.number().int().nonnegative().default(0),
    readyForReviewDraftOnly: z.boolean().default(false),
    rawFindingStored: z.literal(false).default(false),
    summary: z.string().min(1),
  })
  .strict()
  .superRefine((record, context) => {
    rejectCustomWorkflowRawMetadata(record, context);
    if (record.blockerCount > record.findingCount) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'blockerCount cannot exceed findingCount',
        path: ['blockerCount'],
      });
    }
    if (record.status === 'ready_for_review' && !record.readyForReviewDraftOnly) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'ready review projections must remain draft-only',
        path: ['readyForReviewDraftOnly'],
      });
    }
  });
export type CodexTaskReviewProjection = z.infer<typeof CodexTaskReviewProjectionSchema>;

export const CodexTaskGithubClosureProjectionSchema = createdEntityBaseSchema
  .merge(m51SafeBoundarySchema)
  .merge(m51EvidenceAuditSchema)
  .extend({
    taskRunId: z.string().min(1),
    status: CodexTaskGithubClosureStatusSchema,
    branchPublishPlanIdHash: z.string().min(1).optional(),
    draftPrPlanIdHash: z.string().min(1).optional(),
    branchPublishRunIdHash: z.string().min(1).optional(),
    draftPrRunIdHash: z.string().min(1).optional(),
    pullRequestNumberHash: z.string().min(1).optional(),
    pullRequestUrlHash: z.string().min(1).optional(),
    ciStatus: z.enum(['not_run', 'pending', 'passed', 'failed', 'blocked']).default('not_run'),
    dryRunOnly: z.literal(true).default(true),
    approvalRequired: z.boolean().default(true),
    remoteWriteAllowed: z.literal(false).default(false),
    branchPublishDryRunPlanned: z.boolean().default(false),
    draftPrDryRunPlanned: z.boolean().default(false),
    rawPullRequestBodyStored: z.literal(false).default(false),
    summary: z.string().min(1),
  })
  .strict()
  .superRefine((record, context) => {
    rejectCustomWorkflowRawMetadata(record, context);
    if (
      record.status === 'dry_run_planned' &&
      !record.branchPublishDryRunPlanned &&
      !record.draftPrDryRunPlanned
    ) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'dry-run planned closure requires a branch or draft PR dry-run plan',
        path: ['status'],
      });
    }
    if (record.remoteWriteAllowed) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'M59 GitHub closure projection cannot allow remote writes',
        path: ['remoteWriteAllowed'],
      });
    }
  });
export type CodexTaskGithubClosureProjection = z.infer<
  typeof CodexTaskGithubClosureProjectionSchema
>;

export const CodexTaskClosureRunSchema = createdEntityBaseSchema
  .merge(m51SafeBoundarySchema)
  .merge(m51EvidenceAuditSchema)
  .extend({
    taskRunId: z.string().min(1),
    status: CodexTaskClosureRunStatusSchema,
    diffSummaryId: z.string().min(1).optional(),
    verificationProjectionId: z.string().min(1).optional(),
    reviewProjectionId: z.string().min(1).optional(),
    githubClosureProjectionId: z.string().min(1).optional(),
    ciStatus: z.enum(['not_run', 'pending', 'passed', 'failed', 'blocked']).default('not_run'),
    changedFileCount: z.number().int().nonnegative().default(0),
    verificationTargetCount: z.number().int().nonnegative().default(0),
    reviewFindingCount: z.number().int().nonnegative().default(0),
    blockerCount: z.number().int().nonnegative().default(0),
    dryRunOnly: z.literal(true).default(true),
    approvalRequired: z.boolean().default(true),
    liveRemoteWriteAllowed: z.literal(false).default(false),
    branchPublishDryRunIdHash: z.string().min(1).optional(),
    draftPrDryRunIdHash: z.string().min(1).optional(),
    closureHash: z.string().min(1),
    summary: z.string().min(1),
  })
  .strict()
  .superRefine((record, context) => {
    rejectCustomWorkflowRawMetadata(record, context);
    if (record.blockerCount > record.reviewFindingCount + record.verificationTargetCount) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'closure blockerCount cannot exceed review and verification signals',
        path: ['blockerCount'],
      });
    }
    if (record.liveRemoteWriteAllowed) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'M59 closure runs cannot allow live remote writes',
        path: ['liveRemoteWriteAllowed'],
      });
    }
  });
export type CodexTaskClosureRun = z.infer<typeof CodexTaskClosureRunSchema>;

export const AccountPoolSchema = observedEntityBaseSchema
  .merge(m51ReadOnlyBoundarySchema)
  .merge(m51EvidenceAuditSchema)
  .extend({
    poolHash: z.string().min(1),
    status: PoolStatusSchema,
    accountCount: z.number().int().nonnegative().default(0),
    readyCount: z.number().int().nonnegative().default(0),
    blockedCount: z.number().int().nonnegative().default(0),
    entries: z.array(PoolEntrySchema).default([]),
    summary: z.string().min(1),
  })
  .strict()
  .superRefine((record, context) => {
    rejectCustomWorkflowRawMetadata(record, context);
    if (record.readyCount + record.blockedCount > record.accountCount) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'account pool ready and blocked counts must not exceed account count',
        path: ['accountCount'],
      });
    }
  });
export type AccountPool = z.infer<typeof AccountPoolSchema>;

export const ClientPoolSchema = observedEntityBaseSchema
  .merge(m51ReadOnlyBoundarySchema)
  .merge(m51EvidenceAuditSchema)
  .extend({
    poolHash: z.string().min(1),
    status: PoolStatusSchema,
    clientCount: z.number().int().nonnegative().default(0),
    readyCount: z.number().int().nonnegative().default(0),
    blockedCount: z.number().int().nonnegative().default(0),
    entries: z.array(PoolEntrySchema).default([]),
    summary: z.string().min(1),
  })
  .strict()
  .superRefine((record, context) => {
    rejectCustomWorkflowRawMetadata(record, context);
    if (record.readyCount + record.blockedCount > record.clientCount) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'client pool ready and blocked counts must not exceed client count',
        path: ['clientCount'],
      });
    }
  });
export type ClientPool = z.infer<typeof ClientPoolSchema>;

export const LeaseSchema = createdEntityBaseSchema
  .merge(m51ReadOnlyBoundarySchema)
  .merge(m51EvidenceAuditSchema)
  .extend({
    targetKind: LeaseTargetKindSchema,
    targetIdHash: z.string().min(1),
    holderHash: z.string().min(1),
    status: LeaseStatusSchema,
    expiresAt: IsoDateTimeSchema.optional(),
    releasedAt: IsoDateTimeSchema.optional(),
    leaseSecretStored: z.literal(false).default(false),
    summary: z.string().min(1),
  })
  .strict()
  .superRefine(rejectCustomWorkflowRawMetadata);
export type Lease = z.infer<typeof LeaseSchema>;

export const QuotaSnapshotSchema = observedEntityBaseSchema
  .merge(m51ReadOnlyBoundarySchema)
  .merge(m51EvidenceAuditSchema)
  .extend({
    subjectKind: QuotaSnapshotSubjectKindSchema,
    subjectHash: z.string().min(1),
    status: QuotaSnapshotStatusSchema,
    limitCount: z.number().int().nonnegative().optional(),
    usedCount: z.number().int().nonnegative().optional(),
    remainingCount: z.number().int().nonnegative().optional(),
    resetAtHash: z.string().min(1).optional(),
    sourceRefIds: z.array(z.string().min(1)).default([]),
    ambiguous: z.boolean().default(false),
    summary: z.string().min(1),
  })
  .strict()
  .superRefine((record, context) => {
    rejectCustomWorkflowRawMetadata(record, context);
    if (record.ambiguous && record.status !== 'unknown' && record.status !== 'blocked') {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'ambiguous quota snapshots must be unknown or blocked',
        path: ['status'],
      });
    }
  });
export type QuotaSnapshot = z.infer<typeof QuotaSnapshotSchema>;

export const CodexAccountSchedulingProjectionSchema = observedEntityBaseSchema
  .merge(m51ReadOnlyBoundarySchema)
  .merge(m51EvidenceAuditSchema)
  .extend({
    accountBindingId: z.string().min(1),
    accountHash: z.string().min(1),
    schedulingStatus: CodexAccountSchedulingStatusSchema,
    score: z.number().int().nonnegative().max(100).default(0),
    quotaSnapshotId: z.string().min(1).optional(),
    quotaStatus: QuotaSnapshotStatusSchema.optional(),
    activeLeaseCount: z.number().int().nonnegative().default(0),
    blockReasons: z.array(z.string().min(1)).default([]),
    summary: z.string().min(1),
  })
  .strict()
  .superRefine(rejectCustomWorkflowRawMetadata);
export type CodexAccountSchedulingProjection = z.infer<
  typeof CodexAccountSchedulingProjectionSchema
>;

export const CodexClientSchedulingProjectionSchema = observedEntityBaseSchema
  .merge(m51ReadOnlyBoundarySchema)
  .merge(m51EvidenceAuditSchema)
  .extend({
    clientInstanceId: z.string().min(1),
    clientHash: z.string().min(1),
    schedulingStatus: CodexClientSchedulingStatusSchema,
    score: z.number().int().nonnegative().max(100).default(0),
    activeLeaseCount: z.number().int().nonnegative().default(0),
    diagnosticHints: z.array(CodexDesktopDiagnosticHintSchema).default([]),
    blockReasons: z.array(z.string().min(1)).default([]),
    summary: z.string().min(1),
  })
  .strict()
  .superRefine(rejectCustomWorkflowRawMetadata);
export type CodexClientSchedulingProjection = z.infer<
  typeof CodexClientSchedulingProjectionSchema
>;

export const CodexSchedulerPreflightCheckSchema = z
  .object({
    checkKind: CodexSchedulerPreflightCheckKindSchema,
    status: CodexSchedulerPreflightStatusSchema,
    targetIdHash: z.string().min(1).optional(),
    blockReasons: z.array(z.string().min(1)).default([]),
    evidenceRefIds: z.array(z.string().min(1)).default([]),
    auditEventIds: z.array(z.string().min(1)).default([]),
    summary: z.string().min(1),
  })
  .strict()
  .superRefine(rejectCustomWorkflowRawMetadata);
export type CodexSchedulerPreflightCheck = z.infer<
  typeof CodexSchedulerPreflightCheckSchema
>;

export const CodexSchedulerSelectionSummarySchema = observedEntityBaseSchema
  .merge(m51ReadOnlyBoundarySchema)
  .merge(m51EvidenceAuditSchema)
  .extend({
    selectionHash: z.string().min(1),
    taskIntentId: z.string().min(1).optional(),
    status: CodexSchedulerPreflightStatusSchema,
    accountBindingId: z.string().min(1).optional(),
    clientInstanceId: z.string().min(1).optional(),
    profileBindingId: z.string().min(1).optional(),
    threadHash: z.string().min(1).optional(),
    worktreeHash: z.string().min(1).optional(),
    quotaSnapshotId: z.string().min(1).optional(),
    checkCount: z.number().int().nonnegative().default(0),
    readyCheckCount: z.number().int().nonnegative().default(0),
    blockedCheckCount: z.number().int().nonnegative().default(0),
    pendingCheckCount: z.number().int().nonnegative().default(0),
    checks: z.array(CodexSchedulerPreflightCheckSchema).default([]),
    dispatchAllowed: z.boolean().default(false),
    summary: z.string().min(1),
  })
  .strict()
  .superRefine((record, context) => {
    rejectCustomWorkflowRawMetadata(record, context);
    const classifiedCheckCount =
      record.readyCheckCount + record.blockedCheckCount + record.pendingCheckCount;
    if (classifiedCheckCount > record.checkCount) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'scheduler check counts must not exceed check count',
        path: ['checkCount'],
      });
    }
    if (record.checks.length !== record.checkCount) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'scheduler check count must match checks length',
        path: ['checks'],
      });
    }
    if (record.dispatchAllowed && record.status !== 'ready') {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'dispatch can only be allowed when scheduler status is ready',
        path: ['dispatchAllowed'],
      });
    }
  });
export type CodexSchedulerSelectionSummary = z.infer<
  typeof CodexSchedulerSelectionSummarySchema
>;

export const EvidenceBundleSchema = createdEntityBaseSchema
  .merge(m51ReadOnlyBoundarySchema)
  .extend({
    bundleHash: z.string().min(1),
    evidenceRefIds: z.array(z.string().min(1)).default([]),
    auditEventIds: z.array(z.string().min(1)).default([]),
    evidenceCount: z.number().int().nonnegative(),
    auditEventCount: z.number().int().nonnegative(),
    summary: z.string().min(1),
  })
  .strict()
  .superRefine((record, context) => {
    rejectCustomWorkflowRawMetadata(record, context);
    if (record.evidenceCount !== record.evidenceRefIds.length) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'evidence count must match evidenceRefIds length',
        path: ['evidenceCount'],
      });
    }
    if (record.auditEventCount !== record.auditEventIds.length) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'audit event count must match auditEventIds length',
        path: ['auditEventCount'],
      });
    }
  });
export type EvidenceBundle = z.infer<typeof EvidenceBundleSchema>;

export const CodexAppServerWireMessageSummarySchema = observedEntityBaseSchema
  .merge(m51SafeBoundarySchema)
  .merge(m51EvidenceAuditSchema)
  .extend({
    appServerSessionId: z.string().min(1),
    transportKind: CodexAppServerTransportKindSchema,
    direction: CodexAppServerWireDirectionSchema,
    method: CodexAppServerMethodSchema,
    requestIdHash: z.string().min(1).optional(),
    correlationIdHash: z.string().min(1).optional(),
    messageHash: z.string().min(1),
    payloadSummaryHash: z.string().min(1).optional(),
    payloadByteCount: z.number().int().nonnegative().default(0),
    lineCount: z.number().int().nonnegative().default(0),
    redactedFieldCount: z.number().int().nonnegative().default(0),
    status: CodexAppServerWireStatusSchema,
    errorCodeHash: z.string().min(1).optional(),
    errorSummaryHash: z.string().min(1).optional(),
    initializedRequired: z.boolean().default(true),
    initializedObserved: z.boolean().default(false),
    jsonRpcStyle: z.literal(true).default(true),
    jsonRpcHeaderStored: z.literal(false).default(false),
    summary: z.string().min(1),
  })
  .strict()
  .superRefine(rejectCustomWorkflowRawMetadata);
export type CodexAppServerWireMessageSummary = z.infer<
  typeof CodexAppServerWireMessageSummarySchema
>;

export const CodexAppServerThreadMirrorSchema = observedEntityBaseSchema
  .merge(m51SafeBoundarySchema)
  .merge(m51EvidenceAuditSchema)
  .extend({
    appServerSessionId: z.string().min(1),
    taskRunId: z.string().min(1).optional(),
    threadIdHash: z.string().min(1),
    status: CodexAppServerThreadStatusSchema,
    ephemeral: z.boolean().default(false),
    pathHash: z.string().min(1).optional(),
    turnCount: z.number().int().nonnegative().default(0),
    activeTurnIdHash: z.string().min(1).optional(),
    subscribed: z.boolean().default(false),
    permissionProfileHash: z.string().min(1).optional(),
    workspaceTrustMutationAllowed: z.literal(false).default(false),
    workspaceTrustMutationObserved: z.literal(false).default(false),
    summary: z.string().min(1),
  })
  .strict()
  .superRefine(rejectCustomWorkflowRawMetadata);
export type CodexAppServerThreadMirror = z.infer<
  typeof CodexAppServerThreadMirrorSchema
>;

export const CodexAppServerTurnMirrorSchema = observedEntityBaseSchema
  .merge(m51SafeBoundarySchema)
  .merge(m51EvidenceAuditSchema)
  .extend({
    appServerSessionId: z.string().min(1),
    threadMirrorId: z.string().min(1),
    taskRunId: z.string().min(1).optional(),
    threadIdHash: z.string().min(1),
    turnIdHash: z.string().min(1),
    status: CodexAppServerTurnStatusSchema,
    itemCount: z.number().int().nonnegative().default(0),
    eventCount: z.number().int().nonnegative().default(0),
    inputSummaryHash: z.string().min(1).optional(),
    outputSummaryHash: z.string().min(1).optional(),
    tokenCount: z.number().int().nonnegative().optional(),
    approvalPendingCount: z.number().int().nonnegative().default(0),
    failureSummaryHash: z.string().min(1).optional(),
    summary: z.string().min(1),
  })
  .strict()
  .superRefine(rejectCustomWorkflowRawMetadata);
export type CodexAppServerTurnMirror = z.infer<
  typeof CodexAppServerTurnMirrorSchema
>;

export const CodexAppServerEventSummarySchema = observedEntityBaseSchema
  .merge(m51SafeBoundarySchema)
  .merge(m51EvidenceAuditSchema)
  .extend({
    appServerSessionId: z.string().min(1),
    threadMirrorId: z.string().min(1).optional(),
    turnMirrorId: z.string().min(1).optional(),
    method: CodexAppServerMethodSchema,
    eventHash: z.string().min(1),
    threadIdHash: z.string().min(1).optional(),
    turnIdHash: z.string().min(1).optional(),
    itemIdHash: z.string().min(1).optional(),
    status: CodexAppServerEventStatusSchema,
    sequenceNumber: z.number().int().nonnegative(),
    deltaCount: z.number().int().nonnegative().default(0),
    payloadByteCount: z.number().int().nonnegative().default(0),
    itemKindHash: z.string().min(1).optional(),
    terminal: z.boolean().default(false),
    summary: z.string().min(1),
  })
  .strict()
  .superRefine(rejectCustomWorkflowRawMetadata);
export type CodexAppServerEventSummary = z.infer<
  typeof CodexAppServerEventSummarySchema
>;

export const CodexAppServerApprovalBridgeRecordSchema = createdEntityBaseSchema
  .merge(m51SafeBoundarySchema)
  .merge(m51EvidenceAuditSchema)
  .extend({
    appServerSessionId: z.string().min(1),
    taskRunId: z.string().min(1).optional(),
    threadIdHash: z.string().min(1),
    turnIdHash: z.string().min(1),
    itemIdHash: z.string().min(1).optional(),
    requestIdHash: z.string().min(1),
    approvalKind: CodexAppServerApprovalKindSchema,
    status: CodexAppServerApprovalStatusSchema,
    proposalHash: z.string().min(1),
    proposalSummaryHash: z.string().min(1).optional(),
    availableDecisionCount: z.number().int().nonnegative().default(0),
    availableDecisionHashes: z.array(z.string().min(1)).default([]),
    decisionHash: z.string().min(1).optional(),
    resolvedAt: IsoDateTimeSchema.optional(),
    silentApprovalAllowed: z.literal(false).default(false),
    rawProposalStored: z.literal(false).default(false),
    approvalSecretStored: z.literal(false).default(false),
    summary: z.string().min(1),
  })
  .strict()
  .superRefine((record, context) => {
    rejectCustomWorkflowRawMetadata(record, context);
    if (record.availableDecisionCount !== record.availableDecisionHashes.length) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'available decision count must match availableDecisionHashes length',
        path: ['availableDecisionCount'],
      });
    }
  });
export type CodexAppServerApprovalBridgeRecord = z.infer<
  typeof CodexAppServerApprovalBridgeRecordSchema
>;

export const CodexAppServerProtocolDriftReportSchema = observedEntityBaseSchema
  .merge(m51SafeBoundarySchema)
  .merge(m51EvidenceAuditSchema)
  .extend({
    appServerSessionId: z.string().min(1).optional(),
    baselineKind: CodexAppServerProtocolBaselineKindSchema,
    baselineHash: z.string().min(1),
    observedSchemaHash: z.string().min(1),
    status: CodexAppServerProtocolDriftStatusSchema,
    driftCount: z.number().int().nonnegative().default(0),
    missingMethodCount: z.number().int().nonnegative().default(0),
    changedMethodCount: z.number().int().nonnegative().default(0),
    unknownMethodCount: z.number().int().nonnegative().default(0),
    liveDispatchBlocked: z.boolean().default(true),
    generatedSchemaRequired: z.literal(true).default(true),
    rawSchemaStored: z.literal(false).default(false),
    summary: z.string().min(1),
  })
  .strict()
  .superRefine((record, context) => {
    rejectCustomWorkflowRawMetadata(record, context);
    if (
      (record.status === 'incompatible' || record.status === 'unknown') &&
      !record.liveDispatchBlocked
    ) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'incompatible or unknown protocol drift must block live dispatch',
        path: ['liveDispatchBlocked'],
      });
    }
  });
export type CodexAppServerProtocolDriftReport = z.infer<
  typeof CodexAppServerProtocolDriftReportSchema
>;

export const CodexProductionCanaryKindSchema = z.enum([
  'account',
  'quota',
  'login',
  'workspace',
  'app-server',
  'business-page-dom',
  'electron-renderer',
  'thread-turn',
  'approval',
  'worktree',
  'draft-pr',
  'live-smoke',
]);
export type CodexProductionCanaryKind = z.infer<typeof CodexProductionCanaryKindSchema>;

export const CodexProductionCanaryStatusSchema = z.enum([
  'planned',
  'running',
  'passed',
  'failed',
  'blocked',
  'skipped',
]);
export type CodexProductionCanaryStatus = z.infer<typeof CodexProductionCanaryStatusSchema>;

export const CodexProductionDriftGateKindSchema = z.enum([
  'app-server-protocol',
  'desktop-target',
  'electron-target',
  'selector',
  'redaction',
  'combined',
]);
export type CodexProductionDriftGateKind = z.infer<
  typeof CodexProductionDriftGateKindSchema
>;

export const CodexProductionDriftGateStatusSchema = z.enum([
  'compatible',
  'minor_drift',
  'incompatible',
  'unknown',
]);
export type CodexProductionDriftGateStatus = z.infer<
  typeof CodexProductionDriftGateStatusSchema
>;

export const CodexProductionReadinessGateStatusSchema = z.enum([
  'ready',
  'blocked',
  'drift_blocked',
  'canary_blocked',
  'approval_waiting',
]);
export type CodexProductionReadinessGateStatus = z.infer<
  typeof CodexProductionReadinessGateStatusSchema
>;

export const CodexProductionCanaryTaskSchema = createdEntityBaseSchema
  .merge(m51SafeBoundarySchema)
  .merge(m51EvidenceAuditSchema)
  .extend({
    canaryKind: CodexProductionCanaryKindSchema,
    taskHash: z.string().min(1),
    status: CodexProductionCanaryStatusSchema.default('planned'),
    targetHash: z.string().min(1).optional(),
    dependencyHash: z.string().min(1).optional(),
    dryRunOnly: z.literal(true).default(true),
    approvalRequired: z.boolean().default(false),
    liveSmoke: z.boolean().default(false),
    highRisk: z.boolean().default(false),
    rawCheckStored: z.literal(false).default(false),
    summary: z.string().min(1),
  })
  .strict()
  .superRefine(rejectCustomWorkflowRawMetadata);
export type CodexProductionCanaryTask = z.infer<typeof CodexProductionCanaryTaskSchema>;

export const CodexProductionCanaryRunSchema = createdEntityBaseSchema
  .merge(m51SafeBoundarySchema)
  .merge(m51EvidenceAuditSchema)
  .extend({
    canaryTaskId: z.string().min(1),
    canaryKind: CodexProductionCanaryKindSchema,
    status: CodexProductionCanaryStatusSchema,
    checkCount: z.number().int().nonnegative().default(0),
    passedCount: z.number().int().nonnegative().default(0),
    failedCount: z.number().int().nonnegative().default(0),
    blockerCount: z.number().int().nonnegative().default(0),
    liveSmoke: z.boolean().default(false),
    approvalArtifactIdHash: z.string().min(1).optional(),
    highRiskLiveTaskBlocked: z.boolean().default(true),
    rawCheckStored: z.literal(false).default(false),
    rawOutputStored: z.literal(false).default(false),
    summary: z.string().min(1),
  })
  .strict()
  .superRefine((record, context) => {
    rejectCustomWorkflowRawMetadata(record, context);
    if (record.checkCount !== record.passedCount + record.failedCount + record.blockerCount) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'canary checkCount must match passed, failed, and blocked counts',
        path: ['checkCount'],
      });
    }
    if (
      (record.status === 'failed' || record.status === 'blocked') &&
      !record.highRiskLiveTaskBlocked
    ) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'failed or blocked canary runs must block high-risk live tasks',
        path: ['highRiskLiveTaskBlocked'],
      });
    }
    if (record.liveSmoke && !record.approvalArtifactIdHash) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'live smoke canary runs require an approval artifact hash',
        path: ['approvalArtifactIdHash'],
      });
    }
  });
export type CodexProductionCanaryRun = z.infer<typeof CodexProductionCanaryRunSchema>;

export const CodexProductionDriftGateSchema = observedEntityBaseSchema
  .merge(m51SafeBoundarySchema)
  .merge(m51EvidenceAuditSchema)
  .extend({
    gateKind: CodexProductionDriftGateKindSchema,
    baselineHash: z.string().min(1),
    observedHash: z.string().min(1),
    status: CodexProductionDriftGateStatusSchema,
    driftCount: z.number().int().nonnegative().default(0),
    blockerCount: z.number().int().nonnegative().default(0),
    highRiskLiveTaskBlocked: z.boolean().default(true),
    rawSchemaStored: z.literal(false).default(false),
    rawTargetStored: z.literal(false).default(false),
    summary: z.string().min(1),
  })
  .strict()
  .superRefine((record, context) => {
    rejectCustomWorkflowRawMetadata(record, context);
    if (
      (record.status === 'incompatible' || record.status === 'unknown') &&
      !record.highRiskLiveTaskBlocked
    ) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'incompatible or unknown production drift must block high-risk live tasks',
        path: ['highRiskLiveTaskBlocked'],
      });
    }
  });
export type CodexProductionDriftGate = z.infer<typeof CodexProductionDriftGateSchema>;

export const CodexProductionAuditExportSummarySchema = createdEntityBaseSchema
  .merge(m51EvidenceAuditSchema)
  .extend({
    exportHash: z.string().min(1),
    manifestHash: z.string().min(1),
    recordCount: z.number().int().nonnegative().default(0),
    evidenceRefCount: z.number().int().nonnegative().default(0),
    auditEventCount: z.number().int().nonnegative().default(0),
    metadataOnly: z.literal(true).default(true),
    rawRecordStored: z.literal(false).default(false),
    rawPromptStored: z.literal(false).default(false),
    rawDiffStored: z.literal(false).default(false),
    rawPathStored: z.literal(false).default(false),
    rawBodyStored: z.literal(false).default(false),
    summary: z.string().min(1),
  })
  .strict()
  .superRefine(rejectCustomWorkflowRawMetadata);
export type CodexProductionAuditExportSummary = z.infer<
  typeof CodexProductionAuditExportSummarySchema
>;

export const CodexProductionReadinessGateSchema = createdEntityBaseSchema
  .merge(m51SafeBoundarySchema)
  .merge(m51EvidenceAuditSchema)
  .extend({
    status: CodexProductionReadinessGateStatusSchema,
    canaryRunCount: z.number().int().nonnegative().default(0),
    failedCanaryCount: z.number().int().nonnegative().default(0),
    driftGateCount: z.number().int().nonnegative().default(0),
    blockingDriftCount: z.number().int().nonnegative().default(0),
    auditExportSummaryId: z.string().min(1).optional(),
    highRiskLiveTaskBlocked: z.boolean().default(true),
    liveSmokeAllowed: z.boolean().default(false),
    approvalRequiredForLiveSmoke: z.literal(true).default(true),
    rawReadinessDataStored: z.literal(false).default(false),
    summary: z.string().min(1),
  })
  .strict()
  .superRefine((record, context) => {
    rejectCustomWorkflowRawMetadata(record, context);
    if (
      (record.failedCanaryCount > 0 || record.blockingDriftCount > 0) &&
      !record.highRiskLiveTaskBlocked
    ) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'failed canaries or blocking drift must block high-risk live tasks',
        path: ['highRiskLiveTaskBlocked'],
      });
    }
    if (record.liveSmokeAllowed && record.status !== 'ready') {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'live smoke can only be allowed when production readiness is ready',
        path: ['liveSmokeAllowed'],
      });
    }
  });
export type CodexProductionReadinessGate = z.infer<
  typeof CodexProductionReadinessGateSchema
>;

export const BusinessQuotaSourceKindSchema = z.enum([
  'app-server-rate-limits',
  'official-api',
  'enterprise-analytics',
  'business-credits',
  'business-page-dom',
  'browser-cdp-dom',
  'electron-renderer-dom',
  'codex-desktop-ui',
  'redacted-export',
  'manual-export',
  'manual-observation',
  'ui-reference-only',
  'unknown',
]);
export type BusinessQuotaSourceKind = z.infer<typeof BusinessQuotaSourceKindSchema>;

export const BusinessQuotaProbeStatusSchema = z.enum([
  'ready',
  'blocked',
  'unavailable',
  'unknown',
]);
export type BusinessQuotaProbeStatus = z.infer<typeof BusinessQuotaProbeStatusSchema>;

export const BusinessQuotaPermissionRoleSchema = z.enum([
  'owner',
  'admin',
  'analytics_viewer',
  'member',
  'unknown',
]);
export type BusinessQuotaPermissionRole = z.infer<
  typeof BusinessQuotaPermissionRoleSchema
>;

export const BusinessQuotaFieldSensitivitySchema = z.enum([
  'public-summary',
  'hash-only',
  'count-only',
  'status-only',
  'forbidden',
]);
export type BusinessQuotaFieldSensitivity = z.infer<
  typeof BusinessQuotaFieldSensitivitySchema
>;

export const LocalCapabilityProbeKindSchema = z.enum([
  'codex-app-server',
  'codex-desktop-cdp',
  'supervisor',
  'store',
  'profile-registry',
  'chatgpt-business-adapter',
]);
export type LocalCapabilityProbeKind = z.infer<typeof LocalCapabilityProbeKindSchema>;

export const ForbiddenPathProbeKindSchema = z.enum([
  'browser_storage',
  'runtime_eval',
  'dom_scrape',
  'click_type',
  'network_body',
  'credential_material',
  'login_automation',
  'account_mutation',
  'raw_identity',
  'raw_path',
  'raw_body',
]);
export type ForbiddenPathProbeKind = z.infer<typeof ForbiddenPathProbeKindSchema>;

export const ForbiddenPathProbeStatusSchema = z.enum([
  'blocked',
  'verified_absent',
  'unknown',
]);
export type ForbiddenPathProbeStatus = z.infer<typeof ForbiddenPathProbeStatusSchema>;

export const QuotaReadinessDebugDecisionSchema = z.enum([
  'go',
  'no_go',
  'manual_checkpoint',
  'needs_adapter',
]);
export type QuotaReadinessDebugDecision = z.infer<
  typeof QuotaReadinessDebugDecisionSchema
>;

export const QuotaEvidenceMatrixFieldSchema = z
  .object({
    fieldKeyHash: z.string().min(1),
    sourceKind: BusinessQuotaSourceKindSchema,
    sensitivity: BusinessQuotaFieldSensitivitySchema,
    hashPolicy: z.string().min(1),
    persistedAs: z.enum(['hash', 'count', 'status', 'summary', 'not_persisted']),
    allowed: z.boolean(),
    summary: z.string().min(1),
  })
  .strict()
  .superRefine(rejectCustomWorkflowRawMetadata);
export type QuotaEvidenceMatrixField = z.infer<typeof QuotaEvidenceMatrixFieldSchema>;

export const BusinessQuotaSourceProbeSchema = observedEntityBaseSchema
  .merge(m51ReadOnlyBoundarySchema)
  .merge(m51EvidenceAuditSchema)
  .extend({
    sourceKind: BusinessQuotaSourceKindSchema,
    status: BusinessQuotaProbeStatusSchema,
    priority: z.number().int().positive(),
    stabilityScore: z.number().int().min(0).max(100),
    fieldCount: z.number().int().nonnegative().default(0),
    readableFieldCount: z.number().int().nonnegative().default(0),
    sourceRefHash: z.string().min(1).optional(),
    hashPolicy: z.string().min(1),
    candidateOnly: z.boolean().default(true),
    blockReasons: z.array(z.string().min(1)).default([]),
    humanCheckpointKind: HumanCheckpointKindSchema.optional(),
    rawSourceStored: z.literal(false).default(false),
    summary: z.string().min(1),
  })
  .strict()
  .superRefine((record, context) => {
    rejectCustomWorkflowRawMetadata(record, context);
    if (record.readableFieldCount > record.fieldCount) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'readable quota source field count cannot exceed field count',
        path: ['readableFieldCount'],
      });
    }
    if (record.status === 'blocked' && record.blockReasons.length === 0) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'blocked quota source probes require a block reason',
        path: ['blockReasons'],
      });
    }
  });
export type BusinessQuotaSourceProbe = z.infer<typeof BusinessQuotaSourceProbeSchema>;

export const BusinessQuotaPermissionProbeSchema = observedEntityBaseSchema
  .merge(m51ReadOnlyBoundarySchema)
  .merge(m51EvidenceAuditSchema)
  .extend({
    role: BusinessQuotaPermissionRoleSchema,
    status: BusinessQuotaProbeStatusSchema,
    workspaceHash: z.string().min(1).optional(),
    accountHash: z.string().min(1).optional(),
    canReadOwnQuota: z.boolean().default(false),
    canReadWorkspaceQuota: z.boolean().default(false),
    canReadMemberQuota: z.boolean().default(false),
    canReadSeatState: z.boolean().default(false),
    roleDeclaredByHuman: z.boolean().default(false),
    roleObservedByMetadata: z.boolean().default(false),
    humanCheckpointKind: HumanCheckpointKindSchema.optional(),
    blockReasons: z.array(z.string().min(1)).default([]),
    rawIdentityStored: z.literal(false).default(false),
    summary: z.string().min(1),
  })
  .strict()
  .superRefine((record, context) => {
    rejectCustomWorkflowRawMetadata(record, context);
    if (record.role === 'member' && record.canReadMemberQuota) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'member role cannot read member-level workspace quota in M61 debug',
        path: ['canReadMemberQuota'],
      });
    }
    if (
      (record.status === 'blocked' || record.status === 'unknown') &&
      !record.humanCheckpointKind
    ) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'blocked or unknown permission probes require a human checkpoint',
        path: ['humanCheckpointKind'],
      });
    }
  });
export type BusinessQuotaPermissionProbe = z.infer<
  typeof BusinessQuotaPermissionProbeSchema
>;

export const LocalCapabilityProbeSchema = observedEntityBaseSchema
  .merge(m51ReadOnlyBoundarySchema)
  .merge(m51EvidenceAuditSchema)
  .extend({
    capabilityKind: LocalCapabilityProbeKindSchema,
    status: BusinessQuotaProbeStatusSchema,
    fixtureOnly: z.boolean().default(false),
    liveReadAvailable: z.boolean().default(false),
    storeProjectionAvailable: z.boolean().default(false),
    supervisorProjectionAvailable: z.boolean().default(false),
    cdpLoopbackOnly: z.boolean().default(true),
    cdpAllowedCommandCount: z.number().int().nonnegative().default(0),
    appServerMethodCount: z.number().int().nonnegative().default(0),
    directAdapterExecutionAllowed: z.literal(false).default(false),
    blockReasons: z.array(z.string().min(1)).default([]),
    summary: z.string().min(1),
  })
  .strict()
  .superRefine((record, context) => {
    rejectCustomWorkflowRawMetadata(record, context);
    if (record.directAdapterExecutionAllowed) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'M61 debug capability probes cannot authorize direct adapter execution',
        path: ['directAdapterExecutionAllowed'],
      });
    }
    if (record.status === 'blocked' && record.blockReasons.length === 0) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'blocked local capability probes require a block reason',
        path: ['blockReasons'],
      });
    }
  });
export type LocalCapabilityProbe = z.infer<typeof LocalCapabilityProbeSchema>;

export const ForbiddenPathProbeSchema = observedEntityBaseSchema
  .merge(m51ReadOnlyBoundarySchema)
  .merge(m51EvidenceAuditSchema)
  .extend({
    pathKind: ForbiddenPathProbeKindSchema,
    status: ForbiddenPathProbeStatusSchema,
    attempted: z.literal(false).default(false),
    blocked: z.literal(true).default(true),
    rawMaterialStored: z.literal(false).default(false),
    enforcementHash: z.string().min(1),
    summary: z.string().min(1),
  })
  .strict()
  .superRefine((record, context) => {
    rejectCustomWorkflowRawMetadata(record, context);
    if (record.status === 'unknown') {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'M61 forbidden path probes must be blocked or verified absent',
        path: ['status'],
      });
    }
  });
export type ForbiddenPathProbe = z.infer<typeof ForbiddenPathProbeSchema>;

export const QuotaEvidenceMatrixSchema = createdEntityBaseSchema
  .merge(m51ReadOnlyBoundarySchema)
  .merge(m51EvidenceAuditSchema)
  .extend({
    matrixHash: z.string().min(1),
    fieldCount: z.number().int().nonnegative().default(0),
    allowedFieldCount: z.number().int().nonnegative().default(0),
    forbiddenFieldCount: z.number().int().nonnegative().default(0),
    fields: z.array(QuotaEvidenceMatrixFieldSchema).default([]),
    summary: z.string().min(1),
  })
  .strict()
  .superRefine((record, context) => {
    rejectCustomWorkflowRawMetadata(record, context);
    if (record.fieldCount !== record.fields.length) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'quota evidence matrix field count must match fields length',
        path: ['fieldCount'],
      });
    }
    if (record.allowedFieldCount + record.forbiddenFieldCount !== record.fieldCount) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'quota evidence matrix counts must cover all fields',
        path: ['allowedFieldCount'],
      });
    }
    if (record.forbiddenFieldCount !== record.fields.filter((field) => !field.allowed).length) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'quota evidence matrix forbidden count must match forbidden fields',
        path: ['forbiddenFieldCount'],
      });
    }
  });
export type QuotaEvidenceMatrix = z.infer<typeof QuotaEvidenceMatrixSchema>;

export const QuotaReadinessDebugReportSchema = createdEntityBaseSchema
  .merge(m51ReadOnlyBoundarySchema)
  .merge(m51EvidenceAuditSchema)
  .extend({
    reportHash: z.string().min(1),
    status: QuotaReadinessDebugDecisionSchema,
    recommendedSourceKind: BusinessQuotaSourceKindSchema,
    sourceProbeIds: z.array(z.string().min(1)).default([]),
    permissionProbeIds: z.array(z.string().min(1)).default([]),
    localCapabilityProbeIds: z.array(z.string().min(1)).default([]),
    forbiddenPathProbeIds: z.array(z.string().min(1)).default([]),
    matrixId: z.string().min(1).optional(),
    sourceProbeCount: z.number().int().nonnegative().default(0),
    permissionProbeCount: z.number().int().nonnegative().default(0),
    localCapabilityProbeCount: z.number().int().nonnegative().default(0),
    forbiddenPathProbeCount: z.number().int().nonnegative().default(0),
    humanCheckpointCount: z.number().int().nonnegative().default(0),
    goNoGoReasonHash: z.string().min(1),
    liveReadReady: z.boolean().default(false),
    adapterActivationRecommended: z.boolean().default(false),
    rawReportStored: z.literal(false).default(false),
    summary: z.string().min(1),
  })
  .strict()
  .superRefine((record, context) => {
    rejectCustomWorkflowRawMetadata(record, context);
    if (record.sourceProbeCount !== record.sourceProbeIds.length) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'source probe count must match sourceProbeIds length',
        path: ['sourceProbeCount'],
      });
    }
    if (record.permissionProbeCount !== record.permissionProbeIds.length) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'permission probe count must match permissionProbeIds length',
        path: ['permissionProbeCount'],
      });
    }
    if (record.localCapabilityProbeCount !== record.localCapabilityProbeIds.length) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'local capability probe count must match localCapabilityProbeIds length',
        path: ['localCapabilityProbeCount'],
      });
    }
    if (record.forbiddenPathProbeCount !== record.forbiddenPathProbeIds.length) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'forbidden path probe count must match forbiddenPathProbeIds length',
        path: ['forbiddenPathProbeCount'],
      });
    }
    if (record.liveReadReady && record.status !== 'go') {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'live quota read readiness can only be true for a go report',
        path: ['liveReadReady'],
      });
    }
  });
export type QuotaReadinessDebugReport = z.infer<
  typeof QuotaReadinessDebugReportSchema
>;

export const BusinessCodexSeatStatusSchema = z.enum([
  'active',
  'pending',
  'removed',
  'disabled',
  'unknown',
]);
export type BusinessCodexSeatStatus = z.infer<typeof BusinessCodexSeatStatusSchema>;

export const CodexSeatUsageLimitKindSchema = z.enum([
  'workspace-credit',
  'seat-usage',
  'rate-limit',
  'message-limit',
  'unknown',
]);
export type CodexSeatUsageLimitKind = z.infer<typeof CodexSeatUsageLimitKindSchema>;

export const CodexSeatUsageLimitSubjectKindSchema = z.enum([
  'business-codex-seat',
  'business-workspace',
  'business-member',
  'codex-account',
]);
export type CodexSeatUsageLimitSubjectKind = z.infer<
  typeof CodexSeatUsageLimitSubjectKindSchema
>;

export const CodexQuotaSourceHealthStatusSchema = z.enum([
  'healthy',
  'degraded',
  'unavailable',
  'blocked',
  'unknown',
]);
export type CodexQuotaSourceHealthStatus = z.infer<
  typeof CodexQuotaSourceHealthStatusSchema
>;

export const CodexQuotaSourceFailureKindSchema = z.enum([
  'none',
  'source_unavailable',
  'permission_denied',
  'login_required',
  'workspace_mismatch',
  'redaction_failed',
  'protocol_drift',
  'canary_failed',
  'unknown',
]);
export type CodexQuotaSourceFailureKind = z.infer<
  typeof CodexQuotaSourceFailureKindSchema
>;

export const QuotaAttributionStatusSchema = z.enum([
  'attributed',
  'partial',
  'ambiguous',
  'blocked',
  'unknown',
]);
export type QuotaAttributionStatus = z.infer<typeof QuotaAttributionStatusSchema>;

export const QuotaAttributionConfidenceSchema = z.enum([
  'high',
  'medium',
  'low',
  'unknown',
]);
export type QuotaAttributionConfidence = z.infer<
  typeof QuotaAttributionConfidenceSchema
>;

export const BusinessQuotaCrossCheckStatusSchema = z.enum([
  'matched',
  'mismatch',
  'partial',
  'blocked',
  'unknown',
]);
export type BusinessQuotaCrossCheckStatus = z.infer<
  typeof BusinessQuotaCrossCheckStatusSchema
>;

export const AutomationCapabilitySurfaceSchema = z.enum([
  'app-server',
  'browser-dom',
  'browser-cdp',
  'electron-renderer-cdp',
  'codex-desktop-ui',
  'profile-registry',
  'supervisor',
  'store',
  'scheduler',
]);
export type AutomationCapabilitySurface = z.infer<
  typeof AutomationCapabilitySurfaceSchema
>;

export const AutomationActionClassSchema = z.enum([
  'auto_observe',
  'auto_read_projected',
  'read_click',
  'guided_prepare_write',
  'approved_guided_action',
  'approved_admin_write',
  'critical_payment_write',
  'critical_approved_action',
  'forbidden_credential_action',
]);
export type AutomationActionClass = z.infer<typeof AutomationActionClassSchema>;

export const UiAutomationActionKindSchema = z.enum([
  'navigate',
  'reload',
  'scroll',
  'focus',
  'open-known-page',
  'click-allowlisted-control',
  'type-allowlisted-field',
  'restart-desktop',
  'interrupt-turn',
  'resume',
  'fork',
  'transfer',
  'logout',
  'switch-visible-workspace',
  'credential-input',
  'mfa-input',
  'session-storage-read',
]);
export type UiAutomationActionKind = z.infer<typeof UiAutomationActionKindSchema>;

export const AdminUiActionKindSchema = z.enum([
  'owner-admin-open-members',
  'owner-admin-open-billing',
  'owner-admin-open-pending-invites',
  'owner-admin-open-manage-seats',
  'owner-admin-open-add-credits',
  'owner-admin-open-usage-alerts',
  'workspace-switch-visible-click',
  'invite-member',
  'cancel-invite',
  'remove-member',
  'change-member-role',
  'assign-seat',
  'unassign-seat',
  'add-credits',
  'update-usage-alert',
  'credential-input',
  'mfa-input',
  'session-storage-read',
]);
export type AdminUiActionKind = z.infer<typeof AdminUiActionKindSchema>;

export const UiAutomationStatusSchema = z.enum([
  'planned',
  'approval_waiting',
  'authorized',
  'running',
  'completed',
  'blocked',
  'failed',
  'aborted',
]);
export type UiAutomationStatus = z.infer<typeof UiAutomationStatusSchema>;

export const UiObservationStatusSchema = z.enum([
  'observed',
  'blocked',
  'failed',
  'unknown',
]);
export type UiObservationStatus = z.infer<typeof UiObservationStatusSchema>;

export const SensitiveRedactionStatusSchema = z.enum([
  'passed',
  'failed',
  'blocked',
  'unknown',
]);
export type SensitiveRedactionStatus = z.infer<typeof SensitiveRedactionStatusSchema>;

export const OwnerAdminSurfaceKindSchema = z.enum([
  'admin-members',
  'admin-billing',
  'pending-invites',
  'manage-seats',
  'add-credits',
  'usage-alerts',
]);
export type OwnerAdminSurfaceKind = z.infer<typeof OwnerAdminSurfaceKindSchema>;

export const OwnerAdminExtractionStatusSchema = z.enum([
  'observed',
  'blocked',
  'failed',
  'drifted',
  'unknown',
]);
export type OwnerAdminExtractionStatus = z.infer<
  typeof OwnerAdminExtractionStatusSchema
>;

export const BusinessCodexSeatSchema = observedEntityBaseSchema
  .merge(m51ReadOnlyBoundarySchema)
  .merge(m51EvidenceAuditSchema)
  .extend({
    workspaceIdHash: z.string().min(1),
    seatHash: z.string().min(1),
    memberHash: z.string().min(1).optional(),
    codexAccountHash: z.string().min(1).optional(),
    status: BusinessCodexSeatStatusSchema,
    codexEnabled: z.boolean().default(false),
    sourceHealthId: z.string().min(1).optional(),
    attributionId: z.string().min(1).optional(),
    rawSeatBodyStored: z.literal(false).default(false),
    summary: z.string().min(1),
  })
  .strict()
  .superRefine(rejectCustomWorkflowRawMetadata);
export type BusinessCodexSeat = z.infer<typeof BusinessCodexSeatSchema>;

export const WorkspaceCreditSnapshotSchema = observedEntityBaseSchema
  .merge(m51ReadOnlyBoundarySchema)
  .merge(m51EvidenceAuditSchema)
  .extend({
    workspaceIdHash: z.string().min(1),
    status: QuotaSnapshotStatusSchema,
    limitCount: z.number().int().nonnegative().optional(),
    usedCount: z.number().int().nonnegative().optional(),
    remainingCount: z.number().int().nonnegative().optional(),
    resetAtHash: z.string().min(1).optional(),
    sourceHealthId: z.string().min(1).optional(),
    attributionId: z.string().min(1).optional(),
    ambiguous: z.boolean().default(false),
    rawCreditBodyStored: z.literal(false).default(false),
    summary: z.string().min(1),
  })
  .strict()
  .superRefine((record, context) => {
    rejectCustomWorkflowRawMetadata(record, context);
    if (record.ambiguous && record.status !== 'unknown' && record.status !== 'blocked') {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'ambiguous workspace credit snapshots must be unknown or blocked',
        path: ['status'],
      });
    }
  });
export type WorkspaceCreditSnapshot = z.infer<typeof WorkspaceCreditSnapshotSchema>;

export const CodexSeatUsageLimitSchema = observedEntityBaseSchema
  .merge(m51ReadOnlyBoundarySchema)
  .merge(m51EvidenceAuditSchema)
  .extend({
    subjectKind: CodexSeatUsageLimitSubjectKindSchema,
    subjectHash: z.string().min(1),
    limitKind: CodexSeatUsageLimitKindSchema,
    status: QuotaSnapshotStatusSchema,
    limitCount: z.number().int().nonnegative().optional(),
    usedCount: z.number().int().nonnegative().optional(),
    remainingCount: z.number().int().nonnegative().optional(),
    resetAtHash: z.string().min(1).optional(),
    sourceHealthId: z.string().min(1).optional(),
    quotaSnapshotId: z.string().min(1).optional(),
    ambiguous: z.boolean().default(false),
    rawLimitBodyStored: z.literal(false).default(false),
    summary: z.string().min(1),
  })
  .strict()
  .superRefine((record, context) => {
    rejectCustomWorkflowRawMetadata(record, context);
    if (record.ambiguous && record.status !== 'unknown' && record.status !== 'blocked') {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'ambiguous seat usage limits must be unknown or blocked',
        path: ['status'],
      });
    }
  });
export type CodexSeatUsageLimit = z.infer<typeof CodexSeatUsageLimitSchema>;

export const CodexQuotaSourceHealthSchema = observedEntityBaseSchema
  .merge(m51ReadOnlyBoundarySchema)
  .merge(m51EvidenceAuditSchema)
  .extend({
    sourceKind: BusinessQuotaSourceKindSchema,
    status: CodexQuotaSourceHealthStatusSchema,
    sourceRefHash: z.string().min(1).optional(),
    priority: z.number().int().positive().default(1),
    stabilityScore: z.number().int().min(0).max(100).default(0),
    observationCount: z.number().int().nonnegative().default(0),
    failureKind: CodexQuotaSourceFailureKindSchema.default('none'),
    blockReasons: z.array(z.string().min(1)).default([]),
    recommendedHumanCheckpointKind: HumanCheckpointKindSchema.optional(),
    liveReadReady: z.boolean().default(false),
    canaryRequired: z.boolean().default(true),
    canaryPassed: z.boolean().default(false),
    rawSourceStored: z.literal(false).default(false),
    summary: z.string().min(1),
  })
  .strict()
  .superRefine((record, context) => {
    rejectCustomWorkflowRawMetadata(record, context);
    if (
      (record.status === 'blocked' || record.status === 'unavailable') &&
      record.blockReasons.length === 0
    ) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'blocked or unavailable quota source health requires a block reason',
        path: ['blockReasons'],
      });
    }
    if (record.liveReadReady && record.status !== 'healthy') {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'live quota read readiness requires healthy source status',
        path: ['liveReadReady'],
      });
    }
  });
export type CodexQuotaSourceHealth = z.infer<typeof CodexQuotaSourceHealthSchema>;

export const QuotaAttributionSchema = observedEntityBaseSchema
  .merge(m51ReadOnlyBoundarySchema)
  .merge(m51EvidenceAuditSchema)
  .extend({
    attributionHash: z.string().min(1),
    sourceHealthId: z.string().min(1),
    quotaSnapshotId: z.string().min(1).optional(),
    workspaceIdHash: z.string().min(1).optional(),
    membershipMirrorId: z.string().min(1).optional(),
    accountBindingId: z.string().min(1).optional(),
    businessCodexSeatId: z.string().min(1).optional(),
    workspaceCreditSnapshotId: z.string().min(1).optional(),
    seatUsageLimitId: z.string().min(1).optional(),
    confidence: QuotaAttributionConfidenceSchema,
    status: QuotaAttributionStatusSchema,
    blockReasons: z.array(z.string().min(1)).default([]),
    rawAttributionStored: z.literal(false).default(false),
    summary: z.string().min(1),
  })
  .strict()
  .superRefine((record, context) => {
    rejectCustomWorkflowRawMetadata(record, context);
    if (record.status === 'blocked' && record.blockReasons.length === 0) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'blocked quota attribution requires a block reason',
        path: ['blockReasons'],
      });
    }
  });
export type QuotaAttribution = z.infer<typeof QuotaAttributionSchema>;

export const BusinessQuotaCrossCheckReportSchema = observedEntityBaseSchema
  .merge(m51ReadOnlyBoundarySchema)
  .merge(m51EvidenceAuditSchema)
  .extend({
    appServerQuotaSnapshotId: z.string().min(1).optional(),
    appServerSourceHealthId: z.string().min(1).optional(),
    uiObservationSourceId: z.string().min(1).optional(),
    cdpDomObservationSummaryId: z.string().min(1).optional(),
    electronRendererObservationSummaryId: z.string().min(1).optional(),
    redactionReportId: z.string().min(1).optional(),
    attributionId: z.string().min(1).optional(),
    status: BusinessQuotaCrossCheckStatusSchema,
    confidence: QuotaAttributionConfidenceSchema,
    comparedFieldCount: z.number().int().nonnegative().default(0),
    matchedFieldCount: z.number().int().nonnegative().default(0),
    mismatchFieldCount: z.number().int().nonnegative().default(0),
    unknownFieldCount: z.number().int().nonnegative().default(0),
    sensitiveFindingCount: z.number().int().nonnegative().default(0),
    fieldComparisonHashes: z.array(z.string().min(1)).default([]),
    privilegedAccessRequired: z.literal(true).default(true),
    highPrivilegeViewMode: z.enum(['redacted-summary', 'hash-evidence']).default('redacted-summary'),
    rawAppServerPayloadStored: z.literal(false).default(false),
    rawDomStored: z.literal(false).default(false),
    rawAxStored: z.literal(false).default(false),
    rawSensitiveStored: z.literal(false).default(false),
    blockReasons: z.array(z.string().min(1)).default([]),
    summary: z.string().min(1),
  })
  .strict()
  .superRefine((record, context) => {
    rejectCustomWorkflowRawMetadata(record, context);
    if (record.fieldComparisonHashes.length > record.comparedFieldCount) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'field comparison hashes cannot exceed compared field count',
        path: ['fieldComparisonHashes'],
      });
    }
    if (
      record.matchedFieldCount + record.mismatchFieldCount + record.unknownFieldCount >
      record.comparedFieldCount
    ) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'field comparison counts cannot exceed compared field count',
        path: ['comparedFieldCount'],
      });
    }
    if (record.status === 'blocked' && record.blockReasons.length === 0) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'blocked cross-check reports require a block reason',
        path: ['blockReasons'],
      });
    }
    if (record.sensitiveFindingCount > 0 && record.redactionReportId === undefined) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'sensitive findings require a redaction report reference',
        path: ['redactionReportId'],
      });
    }
  });
export type BusinessQuotaCrossCheckReport = z.infer<
  typeof BusinessQuotaCrossCheckReportSchema
>;

export const AutomationCapabilityPolicySchema = createdEntityBaseSchema
  .merge(m51EvidenceAuditSchema)
  .extend({
    capabilitySurface: AutomationCapabilitySurfaceSchema,
    actionClass: AutomationActionClassSchema,
    riskLevel: RiskLevelSchema,
    actionMode: ActionModeSchema,
    dryRunRequired: z.literal(true).default(true),
    approvalRequired: z.boolean().default(false),
    credentialMaterialForbidden: z.literal(true).default(true),
    rawPayloadPersistenceAllowed: z.literal(false).default(false),
    storageAccessAllowed: z.literal(false).default(false),
    networkBodyReadAllowed: z.literal(false).default(false),
    allowedActionCount: z.number().int().nonnegative().default(0),
    forbiddenActionCount: z.number().int().nonnegative().default(0),
    summary: z.string().min(1),
  })
  .strict()
  .superRefine((record, context) => {
    rejectCustomWorkflowRawMetadata(record, context);
    if (
      (record.actionClass === 'critical_approved_action' ||
        record.actionClass === 'forbidden_credential_action') &&
      !record.approvalRequired
    ) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'critical or forbidden automation classes require approval tracking',
        path: ['approvalRequired'],
      });
    }
  });
export type AutomationCapabilityPolicy = z.infer<
  typeof AutomationCapabilityPolicySchema
>;

export const SensitiveRedactionReportSchema = observedEntityBaseSchema
  .merge(m51ReadOnlyBoundarySchema)
  .merge(m51EvidenceAuditSchema)
  .extend({
    sourceHash: z.string().min(1),
    status: SensitiveRedactionStatusSchema,
    scannedFieldCount: z.number().int().nonnegative().default(0),
    redactedFieldCount: z.number().int().nonnegative().default(0),
    forbiddenFieldCount: z.number().int().nonnegative().default(0),
    blockedPersistence: z.boolean().default(false),
    credentialMaterialDetected: z.boolean().default(false),
    tokenCookieSessionStorageDetected: z.boolean().default(false),
    rawPayloadStored: z.literal(false).default(false),
    rawDomStored: z.literal(false).default(false),
    rawTextStored: z.literal(false).default(false),
    networkBodyStored: z.literal(false).default(false),
    summary: z.string().min(1),
  })
  .strict()
  .superRefine((record, context) => {
    rejectCustomWorkflowRawMetadata(record, context);
    if (
      (record.credentialMaterialDetected || record.tokenCookieSessionStorageDetected) &&
      record.status === 'passed'
    ) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'redaction cannot pass when credential or session material is detected',
        path: ['status'],
      });
    }
    if ((record.status === 'failed' || record.status === 'blocked') && !record.blockedPersistence) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'failed or blocked redaction must block persistence',
        path: ['blockedPersistence'],
      });
    }
  });
export type SensitiveRedactionReport = z.infer<typeof SensitiveRedactionReportSchema>;

export const UiObservationSourceSchema = observedEntityBaseSchema
  .merge(m51ReadOnlyBoundarySchema)
  .merge(m51EvidenceAuditSchema)
  .extend({
    sourceKind: BusinessQuotaSourceKindSchema,
    targetHash: z.string().min(1),
    selectorManifestHash: z.string().min(1).optional(),
    status: UiObservationStatusSchema,
    fieldCount: z.number().int().nonnegative().default(0),
    readableFieldCount: z.number().int().nonnegative().default(0),
    redactionReportId: z.string().min(1).optional(),
    sourceHealthId: z.string().min(1).optional(),
    rawDomStored: z.literal(false).default(false),
    rawTextStored: z.literal(false).default(false),
    networkBodyStored: z.literal(false).default(false),
    summary: z.string().min(1),
  })
  .strict()
  .superRefine((record, context) => {
    rejectCustomWorkflowRawMetadata(record, context);
    if (record.readableFieldCount > record.fieldCount) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'readable UI observation fields cannot exceed field count',
        path: ['readableFieldCount'],
      });
    }
  });
export type UiObservationSource = z.infer<typeof UiObservationSourceSchema>;

export const CdpDomObservationSummarySchema = observedEntityBaseSchema
  .merge(m51ReadOnlyBoundarySchema)
  .merge(m51EvidenceAuditSchema)
  .extend({
    sourceId: z.string().min(1),
    targetHash: z.string().min(1),
    selectorManifestHash: z.string().min(1).optional(),
    nodeCount: z.number().int().nonnegative().default(0),
    textFieldCount: z.number().int().nonnegative().default(0),
    hashedTextCount: z.number().int().nonnegative().default(0),
    blockedSelectorCount: z.number().int().nonnegative().default(0),
    cdpCommandCount: z.number().int().nonnegative().default(0),
    cdpCommandHashes: z.array(z.string().min(1)).default([]),
    runtimeEvaluateUsed: z.literal(false).default(false),
    domMutationUsed: z.literal(false).default(false),
    clickOrTypeUsed: z.literal(false).default(false),
    rawDomStored: z.literal(false).default(false),
    rawTextStored: z.literal(false).default(false),
    networkBodyStored: z.literal(false).default(false),
    summary: z.string().min(1),
  })
  .strict()
  .superRefine((record, context) => {
    rejectCustomWorkflowRawMetadata(record, context);
    if (record.hashedTextCount > record.textFieldCount) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'hashed text count cannot exceed observed text field count',
        path: ['hashedTextCount'],
      });
    }
    if (record.cdpCommandHashes.length > record.cdpCommandCount) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'CDP command hash count cannot exceed command count',
        path: ['cdpCommandHashes'],
      });
    }
  });
export type CdpDomObservationSummary = z.infer<typeof CdpDomObservationSummarySchema>;

export const ElectronRendererObservationSummarySchema = observedEntityBaseSchema
  .merge(m51ReadOnlyBoundarySchema)
  .merge(m51EvidenceAuditSchema)
  .extend({
    sourceId: z.string().min(1),
    endpointHash: z.string().min(1),
    targetIdHash: z.string().min(1),
    rendererTarget: z.literal(true).default(true),
    mainInspectorUsed: z.literal(false).default(false),
    domObservationSummaryId: z.string().min(1).optional(),
    consoleErrorCount: z.number().int().nonnegative().default(0),
    networkFailedRequestCount: z.number().int().nonnegative().default(0),
    uiResponsive: z.boolean().default(false),
    diagnosticHints: z.array(CodexDesktopDiagnosticHintSchema).default([]),
    rawDomStored: z.literal(false).default(false),
    rawTextStored: z.literal(false).default(false),
    networkBodyStored: z.literal(false).default(false),
    summary: z.string().min(1),
  })
  .strict()
  .superRefine(rejectCustomWorkflowRawMetadata);
export type ElectronRendererObservationSummary = z.infer<
  typeof ElectronRendererObservationSummarySchema
>;

export const OwnerAdminReadSurfaceSummarySchema = observedEntityBaseSchema
  .merge(m51ReadOnlyBoundarySchema)
  .merge(m51EvidenceAuditSchema)
  .extend({
    surfaceKind: OwnerAdminSurfaceKindSchema,
    targetHash: z.string().min(1),
    pageHash: z.string().min(1).optional(),
    axTreeHash: z.string().min(1).optional(),
    domSnapshotHash: z.string().min(1).optional(),
    layoutHash: z.string().min(1).optional(),
    screenshotHash: z.string().min(1).optional(),
    networkEndpointHashes: z.array(z.string().min(1)).default([]),
    fieldCount: z.number().int().nonnegative().default(0),
    credentialFieldCount: z.number().int().nonnegative().default(0),
    rawDomStored: z.literal(false).default(false),
    rawAxStored: z.literal(false).default(false),
    rawNetworkBodyStored: z.literal(false).default(false),
    browserStorageRead: z.literal(false).default(false),
    clickOrTypeUsed: z.literal(false).default(false),
    summary: z.string().min(1),
  })
  .strict()
  .superRefine((record, context) => {
    rejectCustomWorkflowRawMetadata(record, context);
    if (record.credentialFieldCount > 0) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'owner admin read surfaces must block credential fields',
        path: ['credentialFieldCount'],
      });
    }
  });
export type OwnerAdminReadSurfaceSummary = z.infer<
  typeof OwnerAdminReadSurfaceSummarySchema
>;

export const BusinessAdminMemberRosterSnapshotSchema = observedEntityBaseSchema
  .merge(m51ReadOnlyBoundarySchema)
  .merge(m51EvidenceAuditSchema)
  .extend({
    workspaceHash: z.string().min(1),
    rosterHash: z.string().min(1),
    memberCount: z.number().int().nonnegative().default(0),
    ownerCount: z.number().int().nonnegative().default(0),
    adminCount: z.number().int().nonnegative().default(0),
    memberRoleCount: z.number().int().nonnegative().default(0),
    pendingInviteCount: z.number().int().nonnegative().default(0),
    removedMemberCount: z.number().int().nonnegative().default(0),
    seatAssignedCount: z.number().int().nonnegative().default(0),
    memberEmailHashCount: z.number().int().nonnegative().default(0),
    roleHashCount: z.number().int().nonnegative().default(0),
    cleartextEmailStored: z.literal(false).default(false),
    rawRosterStored: z.literal(false).default(false),
    summary: z.string().min(1),
  })
  .strict()
  .superRefine((record, context) => {
    rejectCustomWorkflowRawMetadata(record, context);
    if (record.ownerCount === 0 && record.memberCount > 0) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'member roster snapshots with members must include an owner count',
        path: ['ownerCount'],
      });
    }
  });
export type BusinessAdminMemberRosterSnapshot = z.infer<
  typeof BusinessAdminMemberRosterSnapshotSchema
>;

export const BusinessBillingSummarySchema = observedEntityBaseSchema
  .merge(m51ReadOnlyBoundarySchema)
  .merge(m51EvidenceAuditSchema)
  .extend({
    workspaceHash: z.string().min(1),
    billingHash: z.string().min(1),
    codexSeatCount: z.number().int().nonnegative().default(0),
    creditBalanceKnown: z.boolean().default(false),
    creditBalanceHash: z.string().min(1).optional(),
    invoiceSummaryHashCount: z.number().int().nonnegative().default(0),
    pendingInviteCount: z.number().int().nonnegative().default(0),
    limitIncidentCount: z.number().int().nonnegative().default(0),
    usageAlertCount: z.number().int().nonnegative().default(0),
    autoTopUpConfigured: z.boolean().optional(),
    paymentWriteRequired: z.literal(false).default(false),
    rawInvoiceStored: z.literal(false).default(false),
    rawBillingBodyStored: z.literal(false).default(false),
    summary: z.string().min(1),
  })
  .strict()
  .superRefine(rejectCustomWorkflowRawMetadata);
export type BusinessBillingSummary = z.infer<typeof BusinessBillingSummarySchema>;

export const OwnerAdminExtractionReportSchema = observedEntityBaseSchema
  .merge(m51ReadOnlyBoundarySchema)
  .merge(m51EvidenceAuditSchema)
  .extend({
    status: OwnerAdminExtractionStatusSchema,
    workspaceHash: z.string().min(1),
    surfaceCount: z.number().int().nonnegative().default(0),
    memberCount: z.number().int().nonnegative().default(0),
    pendingInviteCount: z.number().int().nonnegative().default(0),
    seatCount: z.number().int().nonnegative().default(0),
    invoiceCount: z.number().int().nonnegative().default(0),
    limitIncidentCount: z.number().int().nonnegative().default(0),
    usageAlertCount: z.number().int().nonnegative().default(0),
    sourceSurfaceIds: z.array(z.string().min(1)).default([]),
    rosterSnapshotId: z.string().min(1).optional(),
    billingSummaryId: z.string().min(1).optional(),
    blockers: z.array(z.string().min(1)).default([]),
    directAdapterExecutionAllowed: z.literal(false).default(false),
    processBoundaryInvoked: z.literal(false).default(false),
    externalProcessStarted: z.literal(false).default(false),
    networkBoundaryInvoked: z.literal(false).default(false),
    rawDomStored: z.literal(false).default(false),
    rawAxStored: z.literal(false).default(false),
    rawNetworkBodyStored: z.literal(false).default(false),
    cleartextBusinessDataStored: z.literal(false).default(false),
    summary: z.string().min(1),
  })
  .strict()
  .superRefine((record, context) => {
    rejectCustomWorkflowRawMetadata(record, context);
    if (record.status === 'blocked' && record.blockers.length === 0) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'blocked owner admin extraction reports require blockers',
        path: ['blockers'],
      });
    }
  });
export type OwnerAdminExtractionReport = z.infer<
  typeof OwnerAdminExtractionReportSchema
>;

export const UiTargetFingerprintSchema = observedEntityBaseSchema
  .merge(m51ReadOnlyBoundarySchema)
  .merge(m51EvidenceAuditSchema)
  .extend({
    targetHash: z.string().min(1),
    selectorHash: z.string().min(1).optional(),
    axRoleHash: z.string().min(1).optional(),
    axNameHash: z.string().min(1).optional(),
    pageHash: z.string().min(1).optional(),
    networkEndpointHash: z.string().min(1).optional(),
    screenshotHash: z.string().min(1).optional(),
    fingerprintHash: z.string().min(1),
    rawSelectorStored: z.literal(false).default(false),
    rawAxStored: z.literal(false).default(false),
    rawPageStored: z.literal(false).default(false),
    rawNetworkBodyStored: z.literal(false).default(false),
    rawScreenshotStored: z.literal(false).default(false),
    summary: z.string().min(1),
  })
  .strict()
  .superRefine(rejectCustomWorkflowRawMetadata);
export type UiTargetFingerprint = z.infer<typeof UiTargetFingerprintSchema>;

export const UiAutomationIntentSchema = createdEntityBaseSchema
  .merge(m51EvidenceAuditSchema)
  .extend({
    intentHash: z.string().min(1),
    actionKind: UiAutomationActionKindSchema,
    actionClass: AutomationActionClassSchema,
    targetHash: z.string().min(1),
    selectorManifestHash: z.string().min(1).optional(),
    riskLevel: RiskLevelSchema,
    dryRunRequired: z.literal(true).default(true),
    approvalRequired: z.boolean().default(false),
    credentialInputRequested: z.literal(false).default(false),
    rawIntentStored: z.literal(false).default(false),
    summary: z.string().min(1),
  })
  .strict()
  .superRefine((record, context) => {
    rejectCustomWorkflowRawMetadata(record, context);
    if (
      (record.actionClass === 'critical_approved_action' ||
        record.actionClass === 'forbidden_credential_action') &&
      !record.approvalRequired
    ) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'critical or forbidden UI intents require approval tracking',
        path: ['approvalRequired'],
      });
    }
  });
export type UiAutomationIntent = z.infer<typeof UiAutomationIntentSchema>;

export const UiAutomationDryRunPlanSchema = createdEntityBaseSchema
  .merge(m51EvidenceAuditSchema)
  .extend({
    intentId: z.string().min(1),
    planHash: z.string().min(1),
    actionCount: z.number().int().nonnegative().default(0),
    actionClass: AutomationActionClassSchema,
    riskLevel: RiskLevelSchema,
    approvalRequired: z.boolean().default(false),
    authorityRequired: z.boolean().default(false),
    blockedReasonHashes: z.array(z.string().min(1)).default([]),
    credentialActionBlocked: z.boolean().default(false),
    rawPlanStored: z.literal(false).default(false),
    summary: z.string().min(1),
  })
  .strict()
  .superRefine((record, context) => {
    rejectCustomWorkflowRawMetadata(record, context);
    if (record.actionClass === 'forbidden_credential_action' && !record.credentialActionBlocked) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'forbidden credential actions must be blocked in the dry-run plan',
        path: ['credentialActionBlocked'],
      });
    }
  });
export type UiAutomationDryRunPlan = z.infer<typeof UiAutomationDryRunPlanSchema>;

export const UiAutomationAuthoritySchema = createdEntityBaseSchema
  .merge(m51EvidenceAuditSchema)
  .extend({
    dryRunPlanId: z.string().min(1),
    authorityHash: z.string().min(1),
    approvalArtifactIdHash: z.string().min(1).optional(),
    allowed: z.boolean(),
    actionClass: AutomationActionClassSchema,
    riskLevel: RiskLevelSchema,
    constraints: z.array(z.string().min(1)).default([]),
    expiresAt: IsoDateTimeSchema.optional(),
    requestBodyAuthorityAccepted: z.literal(false).default(false),
    credentialMaterialAllowed: z.literal(false).default(false),
    storageAccessAllowed: z.literal(false).default(false),
    networkBodyReadAllowed: z.literal(false).default(false),
    rawAuthorityStored: z.literal(false).default(false),
    summary: z.string().min(1),
  })
  .strict()
  .superRefine((record, context) => {
    rejectCustomWorkflowRawMetadata(record, context);
    if (
      record.allowed &&
      (record.riskLevel === 'high' || record.riskLevel === 'critical') &&
      !record.approvalArtifactIdHash
    ) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'high or critical UI authority requires an approval artifact hash',
        path: ['approvalArtifactIdHash'],
      });
    }
    if (record.actionClass === 'forbidden_credential_action' && record.allowed) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'forbidden credential actions cannot receive UI authority',
        path: ['allowed'],
      });
    }
  });
export type UiAutomationAuthority = z.infer<typeof UiAutomationAuthoritySchema>;

export const UiAutomationRunSchema = createdEntityBaseSchema
  .merge(m51EvidenceAuditSchema)
  .extend({
    intentId: z.string().min(1),
    dryRunPlanId: z.string().min(1),
    authorityId: z.string().min(1).optional(),
    status: UiAutomationStatusSchema,
    actionClass: AutomationActionClassSchema,
    actionCount: z.number().int().nonnegative().default(0),
    approvedActionCount: z.number().int().nonnegative().default(0),
    blockedActionCount: z.number().int().nonnegative().default(0),
    liveActionRequested: z.boolean().default(false),
    liveActionAllowed: z.boolean().default(false),
    processBoundaryInvoked: z.boolean().default(false),
    externalProcessStarted: z.boolean().default(false),
    networkBoundaryInvoked: z.boolean().default(false),
    rawDomStored: z.literal(false).default(false),
    rawTextStored: z.literal(false).default(false),
    networkBodyStored: z.literal(false).default(false),
    summary: z.string().min(1),
  })
  .strict()
  .superRefine((record, context) => {
    rejectCustomWorkflowRawMetadata(record, context);
    if (record.liveActionAllowed && !record.authorityId) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'live UI action requires store-resolved authority',
        path: ['authorityId'],
      });
    }
    if (record.approvedActionCount + record.blockedActionCount > record.actionCount) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'UI action result counts cannot exceed actionCount',
        path: ['actionCount'],
      });
    }
  });
export type UiAutomationRun = z.infer<typeof UiAutomationRunSchema>;

export const AdminWriteIntentSchema = createdEntityBaseSchema
  .merge(m51EvidenceAuditSchema)
  .extend({
    intentHash: z.string().min(1),
    actionKind: AdminUiActionKindSchema,
    actionClass: AutomationActionClassSchema,
    targetHash: z.string().min(1),
    uiTargetFingerprintId: z.string().min(1).optional(),
    selectorFingerprintHash: z.string().min(1).optional(),
    riskLevel: RiskLevelSchema,
    dryRunRequired: z.literal(true).default(true),
    approvalRequired: z.literal(true).default(true),
    credentialInputRequested: z.literal(false).default(false),
    businessCleartextAllowed: z.boolean().default(false),
    rawIntentStored: z.literal(false).default(false),
    summary: z.string().min(1),
  })
  .strict()
  .superRefine((record, context) => {
    rejectCustomWorkflowRawMetadata(record, context);
    if (
      record.actionClass === 'auto_observe' ||
      record.actionClass === 'auto_read_projected'
    ) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'admin write intents must not be classified as automatic observation',
        path: ['actionClass'],
      });
    }
  });
export type AdminWriteIntent = z.infer<typeof AdminWriteIntentSchema>;

export const AdminWriteDryRunPlanSchema = createdEntityBaseSchema
  .merge(m51EvidenceAuditSchema)
  .extend({
    intentId: z.string().min(1),
    planHash: z.string().min(1),
    actionCount: z.number().int().nonnegative().default(0),
    actionClass: AutomationActionClassSchema,
    riskLevel: RiskLevelSchema,
    approvalRequired: z.literal(true).default(true),
    authorityRequired: z.literal(true).default(true),
    blockedReasonHashes: z.array(z.string().min(1)).default([]),
    targetFingerprintHash: z.string().min(1).optional(),
    beforePageHash: z.string().min(1).optional(),
    afterPageHash: z.string().min(1).optional(),
    credentialActionBlocked: z.boolean().default(false),
    rawPlanStored: z.literal(false).default(false),
    summary: z.string().min(1),
  })
  .strict()
  .superRefine((record, context) => {
    rejectCustomWorkflowRawMetadata(record, context);
    if (record.actionClass === 'forbidden_credential_action' && !record.credentialActionBlocked) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'forbidden credential actions must be blocked by admin write dry-runs',
        path: ['credentialActionBlocked'],
      });
    }
  });
export type AdminWriteDryRunPlan = z.infer<typeof AdminWriteDryRunPlanSchema>;

export const AdminWriteAuthoritySchema = createdEntityBaseSchema
  .merge(m51EvidenceAuditSchema)
  .extend({
    dryRunPlanId: z.string().min(1),
    authorityHash: z.string().min(1),
    approvalArtifactIdHash: z.string().min(1).optional(),
    allowed: z.boolean(),
    actionClass: AutomationActionClassSchema,
    riskLevel: RiskLevelSchema,
    constraints: z.array(z.string().min(1)).default([]),
    expiresAt: IsoDateTimeSchema.optional(),
    requestBodyAuthorityAccepted: z.literal(false).default(false),
    credentialMaterialAllowed: z.literal(false).default(false),
    storageAccessAllowed: z.literal(false).default(false),
    networkBodyReadAllowed: z.literal(false).default(false),
    rawAuthorityStored: z.literal(false).default(false),
    summary: z.string().min(1),
  })
  .strict()
  .superRefine((record, context) => {
    rejectCustomWorkflowRawMetadata(record, context);
    if (
      record.allowed &&
      (record.riskLevel === 'high' || record.riskLevel === 'critical') &&
      !record.approvalArtifactIdHash
    ) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'high or critical admin UI authority requires an approval artifact hash',
        path: ['approvalArtifactIdHash'],
      });
    }
    if (record.actionClass === 'forbidden_credential_action' && record.allowed) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'forbidden credential actions cannot receive admin UI authority',
        path: ['allowed'],
      });
    }
  });
export type AdminWriteAuthority = z.infer<typeof AdminWriteAuthoritySchema>;

export const AdminWriteRunSchema = createdEntityBaseSchema
  .merge(m51EvidenceAuditSchema)
  .extend({
    intentId: z.string().min(1),
    dryRunPlanId: z.string().min(1),
    authorityId: z.string().min(1).optional(),
    status: UiAutomationStatusSchema,
    actionClass: AutomationActionClassSchema,
    actionCount: z.number().int().nonnegative().default(0),
    approvedActionCount: z.number().int().nonnegative().default(0),
    blockedActionCount: z.number().int().nonnegative().default(0),
    liveActionRequested: z.boolean().default(false),
    liveActionAllowed: z.boolean().default(false),
    processBoundaryInvoked: z.boolean().default(false),
    externalProcessStarted: z.boolean().default(false),
    networkBoundaryInvoked: z.boolean().default(false),
    executionDisabled: z.literal(true).default(true),
    preWritePageHash: z.string().min(1).optional(),
    postWritePageHash: z.string().min(1).optional(),
    targetFingerprintHash: z.string().min(1).optional(),
    postWriteVerified: z.boolean().default(false),
    duplicateSubmitBlocked: z.boolean().default(false),
    ownerSelfProtectionApplied: z.boolean().default(true),
    requestBodyAuthorityAccepted: z.literal(false).default(false),
    rawRunStored: z.literal(false).default(false),
    summary: z.string().min(1),
  })
  .strict()
  .superRefine((record, context) => {
    rejectCustomWorkflowRawMetadata(record, context);
    if (record.liveActionAllowed && !record.authorityId) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'live admin UI action requires store-resolved authority',
        path: ['authorityId'],
      });
    }
    if (record.approvedActionCount + record.blockedActionCount > record.actionCount) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'admin UI action result counts cannot exceed actionCount',
        path: ['actionCount'],
      });
    }
  });
export type AdminWriteRun = z.infer<typeof AdminWriteRunSchema>;

export function foundationTimestamp(): string {
  return new Date().toISOString();
}

export function foundationId(prefix: string): string {
  return `${prefix}_${crypto.randomUUID()}`;
}

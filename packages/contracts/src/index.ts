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
    'worktree.plan',
    'worktree.run_summary',
    'worktree.cleanup_plan',
    'worktree.cleanup_summary',
    'patch.diff_summary',
    'pr.draft_summary',
    'release.audit_draft',
    'pilot.m9.readiness_summary',
    'pilot.m9.run_summary',
    'policy_backend.evaluation_plan',
    'policy_backend.raw_evaluation_summary',
    'policy_backend.normalized_decision_trace',
    'telemetry.trace_plan',
    'telemetry.span_summary',
    'telemetry.export_summary',
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

export const ApprovalUxTypeSchema = z.enum([
  'codex',
  'browser',
  'electron_cdp',
  'worktree',
  'worktree_cleanup',
  'm9_pilot',
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

export function foundationTimestamp(): string {
  return new Date().toISOString();
}

export function foundationId(prefix: string): string {
  return `${prefix}_${crypto.randomUUID()}`;
}
